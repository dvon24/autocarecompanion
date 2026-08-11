/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  FULL_RECORD_FIELDS,
  fullRecordSnapshot,
  hashValue,
} = require('./validate-toyota-adjudication');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');
const {
  DEFAULT_OUTPUT_FILE,
  PATCH_FIELDS,
  buildManifest,
  stableHash,
  validateManifest,
} = require('./build-toyota-reviewed-release-manifest');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RESULT_FILE = path.join(PROJECT_ROOT, 'data', 'known-issue-toyota-reviewed-release-result-2026-08-11.json');
const JSON_FIELDS = new Set(['citations', 'communityRecommendations', 'fixParts']);
const INTEGER_ARRAY_FIELDS = new Set(['years']);
const TEXT_ARRAY_FIELDS = new Set(['trims', 'engines', 'symptoms', 'affectedSystems', 'dtcCodes', 'relatedIssueIds']);

function requireDependency(name) {
  try {
    return require(name);
  } catch (error) {
    const root = process.env.KNOWN_ISSUE_DEPENDENCY_ROOT;
    if (!root) throw error;
    return require(path.join(root, name));
  }
}

function fullRecord(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, row[field]]));
}

function loadManifest(file = DEFAULT_OUTPUT_FILE) {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = validateManifest(manifest);
  if (errors.length) throw new Error(`Toyota release manifest failed validation: ${errors.join('; ')}`);
  const deterministic = buildManifest();
  if (stableHash(manifest) !== stableHash(deterministic)) throw new Error('Toyota release manifest is not the deterministic reviewed source union');
  return manifest;
}

function evaluateRows(rows, manifest) {
  const actualById = new Map(rows.map((row) => [row.id, row]));
  const states = [];
  const drift = [];
  for (const issue of manifest.issues) {
    const actual = actualById.get(issue.id);
    if (!actual) {
      drift.push(`${issue.id}: missing`);
      continue;
    }
    const actualSha256 = hashValue(fullRecordSnapshot(fullRecord(actual)));
    if (actualSha256 === issue.beforeSha256) states.push('before');
    else if (actualSha256 === issue.afterSha256) states.push('after');
    else drift.push(`${issue.id}: full-record drift (${actualSha256})`);
  }
  for (const id of actualById.keys()) {
    if (!manifest.issues.some((issue) => issue.id === id)) drift.push(`${id}: unexpected`);
  }
  if (actualById.size !== manifest.issues.length) drift.push(`row count ${actualById.size}, expected ${manifest.issues.length}`);
  if (drift.length) return { state: 'drift', drift };
  if (states.every((state) => state === 'before')) return { state: 'before', drift: [] };
  if (states.every((state) => state === 'after')) return { state: 'after', drift: [] };
  return { state: 'drift', drift: ['mixed before/after state is not allowed'] };
}

function updateStatement(issue) {
  const values = [issue.id];
  const assignments = PATCH_FIELDS.map((field, index) => {
    const value = issue.patch[field];
    values.push(JSON_FIELDS.has(field) ? JSON.stringify(value) : value);
    const cast = JSON_FIELDS.has(field) ? '::jsonb'
      : INTEGER_ARRAY_FIELDS.has(field) ? '::int[]'
        : TEXT_ARRAY_FIELDS.has(field) ? '::text[]' : '';
    return `"${field}"=$${index + 2}${cast}`;
  });
  return {
    text: `UPDATE "KnownIssue" SET ${assignments.join(', ')}, "updatedAt"=NOW() WHERE id=$1`,
    values,
  };
}

async function selectRows(client, ids, lock) {
  const columns = ['id', ...FULL_RECORD_FIELDS].map((field) => `"${field}"`).join(', ');
  const result = await client.query(
    `SELECT ${columns} FROM "KnownIssue" WHERE id = ANY($1::text[]) ORDER BY id${lock ? ' FOR UPDATE' : ''}`,
    [ids],
  );
  return result.rows;
}

async function selectInventory(client) {
  const result = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE status='published')::int AS "globalPublished",
      COUNT(*) FILTER (WHERE lower(trim(make))='toyota' AND status='published')::int AS "toyotaPublished",
      COUNT(*) FILTER (WHERE lower(trim(make))='toyota' AND status='archived')::int AS "toyotaArchived"
    FROM "KnownIssue"
  `);
  return result.rows[0];
}

function inventoryErrors(actual, expected) {
  return Object.keys(expected).filter((key) => Number(actual[key]) !== Number(expected[key]))
    .map((key) => `${key}=${actual[key]}, expected ${expected[key]}`);
}

async function inspectState(client, manifest, lock = false) {
  const rows = await selectRows(client, manifest.issues.map((issue) => issue.id), lock);
  const evaluation = evaluateRows(rows, manifest);
  if (evaluation.state === 'drift') throw new Error(evaluation.drift.join('; '));
  const inventory = await selectInventory(client);
  const expectedInventory = manifest.inventory[evaluation.state];
  const errors = inventoryErrors(inventory, expectedInventory);
  if (errors.length) throw new Error(`catalog inventory drift: ${errors.join('; ')}`);
  return { rows, evaluation, inventory };
}

async function execute(client, manifest, mode) {
  const readOnly = mode !== 'apply';
  await client.query(readOnly
    ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'
    : 'BEGIN ISOLATION LEVEL SERIALIZABLE');
  try {
    const initial = await inspectState(client, manifest, mode === 'apply');
    if (mode === 'verify' && initial.evaluation.state !== 'after') {
      throw new Error('Toyota reviewed release is still at before-state');
    }
    if (mode === 'apply' && initial.evaluation.state === 'before') {
      for (const issue of manifest.issues) {
        const statement = updateStatement(issue);
        const result = await client.query(statement.text, statement.values);
        if (result.rowCount !== 1) throw new Error(`${issue.id}: update affected ${result.rowCount} rows`);
      }
      const after = await inspectState(client, manifest, false);
      if (after.evaluation.state !== 'after') throw new Error('post-write full-record verification did not reach after-state');
      await client.query('COMMIT');
      return { initialState: 'before', finalState: 'after', inventory: after.inventory };
    }
    await client.query('COMMIT');
    return { initialState: initial.evaluation.state, finalState: initial.evaluation.state, inventory: initial.inventory };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function run({ mode, manifestFile = DEFAULT_OUTPUT_FILE, confirmBatch = '' }) {
  const manifest = loadManifest(manifestFile);
  if (mode === 'apply' && confirmBatch !== manifest.batchId) {
    throw new Error(`Apply requires --confirm-batch ${manifest.batchId}`);
  }
  const { Pool } = requireDependency('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const client = await pool.connect();
    try {
      const result = await execute(client, manifest, mode);
      return {
        schemaVersion: 1,
        status: mode === 'apply' ? 'applied-and-verified' : `${mode}-verified`,
        mode,
        batchId: manifest.batchId,
        manifestHash: manifest.manifestHash,
        issueCount: manifest.issues.length,
        transaction: mode === 'apply' ? 'SERIALIZABLE' : 'REPEATABLE READ READ ONLY',
        ...result,
        checkedAt: new Date().toISOString(),
      };
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const modes = [['--dry-run', 'dry-run'], ['--apply', 'apply'], ['--verify', 'verify']].filter(([flag]) => args.includes(flag));
  if (modes.length !== 1) {
    console.error('Choose exactly one mode: --dry-run, --apply, or --verify');
    process.exitCode = 1;
  } else {
    const manifestIndex = args.indexOf('--manifest');
    const confirmIndex = args.indexOf('--confirm-batch');
    run({
      mode: modes[0][1],
      manifestFile: manifestIndex >= 0 && args[manifestIndex + 1] ? path.resolve(args[manifestIndex + 1]) : DEFAULT_OUTPUT_FILE,
      confirmBatch: confirmIndex >= 0 && args[confirmIndex + 1] ? args[confirmIndex + 1] : '',
    }).then((result) => {
      if (result.mode === 'apply') fs.writeFileSync(RESULT_FILE, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
      console.log(JSON.stringify(result, null, 2));
    }).catch((error) => {
      console.error(error.stack || error.message);
      process.exitCode = 1;
    });
  }
}

module.exports = {
  evaluateRows,
  execute,
  fullRecord,
  inspectState,
  inventoryErrors,
  loadManifest,
  run,
  selectInventory,
  updateStatement,
};
