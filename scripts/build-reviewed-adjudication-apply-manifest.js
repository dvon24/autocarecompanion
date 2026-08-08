/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Build a guarded schema-v2 production manifest from independently reviewed
 * proposal packets without replaying byte-identical holds.
 *
 * The packet branch is evidence, not the write source. The live row is locked
 * in as the manifest's exact before-state, and only fields declared by the
 * reviewed packet are overlaid. Mutable report counts and any later cleanup
 * therefore survive.
 *
 * Example:
 *   set KNOWN_ISSUE_ENV_FILE=C:\path\to\.env.local
 *   node scripts/build-reviewed-adjudication-apply-manifest.js \
 *     --source-ref origin/codex/hyundai-deeplink-audit \
 *     --make Hyundai --slug hyundai \
 *     --batch-id reviewed-hyundai-adjudication-2026-08-08 \
 *     --expected-total 242 --expected-writes 55 \
 *     --out data/known-issues-catalog-deeplink-decisions/reviewed-hyundai-adjudication-2026-08-08.json
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  FULL_RECORD_FIELDS,
  claimIdsForRow,
  commerceUrls,
  fullRecordHashes,
  fullRecordSnapshot,
  resolveKnownIssueConnectionString,
  validateManifest,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const IDENTITY_FIELDS = new Set(['make', 'model', 'title', 'category', 'status']);
const DEFAULT_HOLD_ACTIONS = new Set(['keep_published_pending_source', 'hold', 'keep']);

function actionSets(args) {
  const applyActions = new Set((argValue(args, '--apply-actions', false) || 'rewrite_same_identity').split(',').map((value) => value.trim()).filter(Boolean));
  const holdActions = new Set([
    ...DEFAULT_HOLD_ACTIONS,
    ...(argValue(args, '--hold-actions', false) || '').split(',').map((value) => value.trim()).filter(Boolean),
  ]);
  const overlaps = [...applyActions].filter((action) => holdActions.has(action));
  if (overlaps.length) throw new Error(`actions cannot be both apply and hold: ${overlaps.join(', ')}`);
  return { applyActions, holdActions };
}

function argValue(args, flag, required = true) {
  const index = args.indexOf(flag);
  const value = index >= 0 ? args[index + 1] : undefined;
  if (required && (!value || value.startsWith('--'))) throw new Error(`Missing ${flag}`);
  return value;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function git(args) {
  return execFileSync('git', args, { cwd: PROJECT_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function packetFiles(sourceRef, slug) {
  const changed = git(['diff', '--name-only', `origin/main...${sourceRef}`]).split(/\r?\n/).filter(Boolean);
  const pattern = new RegExp(`^data/known-issue-${slug}-.+-adjudication-\\d{4}-\\d{2}-\\d{2}\\.json$`);
  return changed.filter((file) => pattern.test(file)).sort();
}

function readPacket(sourceRef, file) {
  return JSON.parse(git(['show', `${sourceRef}:${file}`]));
}

function normalizedFileHash(sourceRef, file) {
  return crypto.createHash('sha256').update(git(['show', `${sourceRef}:${file}`]).replace(/\r\n/g, '\n')).digest('hex');
}

function changedFields(before, after) {
  return FULL_RECORD_FIELDS.filter((field) => stableHash(before[field]) !== stableHash(after[field]));
}

function assertEqual(label, actual, expected) {
  if (stableHash(actual) !== stableHash(expected)) throw new Error(`${label} mismatch`);
}

function selectRowsSql() {
  return ['id', ...FULL_RECORD_FIELDS].map((field) => `"${field}"`).join(', ');
}

function buildReviewedAfterState(row, current) {
  for (const field of IDENTITY_FIELDS) {
    if (current[field] !== row.before[field]) throw new Error(`${row.id}: live ${field} drift`);
    if (row.proposal[field] !== row.before[field]) throw new Error(`${row.id}: proposal changes ${field}`);
  }
  if (current.status !== 'published') throw new Error(`${row.id}: live row is not published`);

  const after = clone(current);
  for (const field of row.changedFields || []) {
    if (!FULL_RECORD_FIELDS.includes(field)) throw new Error(`${row.id}: unknown changed field ${field}`);
    if (IDENTITY_FIELDS.has(field)) throw new Error(`${row.id}: identity field ${field} cannot be written`);
    if (!Object.prototype.hasOwnProperty.call(row.proposal, field)) throw new Error(`${row.id}: proposal missing ${field}`);
    after[field] = clone(row.proposal[field]);
  }
  // Independent approval changes the proposal's audit flag only; content and
  // identity remain exactly the reviewed after-state.
  after.humanApproved = true;

  for (const field of IDENTITY_FIELDS) assertEqual(`${row.id}: after ${field}`, after[field], current[field]);
  if (commerceUrls(after).length !== 0) throw new Error(`${row.id}: reviewed adjudication must remain no-commerce`);
  if (!Array.isArray(after.citations) || after.citations.length === 0) throw new Error(`${row.id}: no verified citation in after-state`);
  return after;
}

async function main() {
  const args = process.argv.slice(2);
  const sourceRef = argValue(args, '--source-ref');
  const make = argValue(args, '--make');
  const slug = argValue(args, '--slug');
  const batchId = argValue(args, '--batch-id');
  const outFile = path.resolve(PROJECT_ROOT, argValue(args, '--out'));
  const expectedTotal = Number(argValue(args, '--expected-total'));
  const expectedWrites = Number(argValue(args, '--expected-writes'));
  const reviewDate = argValue(args, '--review-date', false) || new Date().toISOString().slice(0, 10);
  const { applyActions, holdActions } = actionSets(args);

  git(['rev-parse', '--verify', sourceRef]);
  const files = packetFiles(sourceRef, slug);
  if (files.length === 0) throw new Error(`No ${make} adjudication packets found on ${sourceRef}`);

  const rows = [];
  const packetProvenance = [];
  const seenIds = new Set();
  for (const file of files) {
    const packet = readPacket(sourceRef, file);
    if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.make !== make) {
      throw new Error(`${file}: invalid proposal contract`);
    }
    packetProvenance.push({ file, sha256: normalizedFileHash(sourceRef, file), model: packet.model, summary: packet.summary });
    for (const row of packet.rows || []) {
      if (seenIds.has(row.id)) throw new Error(`${row.id}: duplicate packet row`);
      seenIds.add(row.id);
      if (stableHash(row.before) !== row.beforeSha256) throw new Error(`${row.id}: beforeSha256 mismatch`);
      if (stableHash(row.proposal) !== row.proposalSha256) throw new Error(`${row.id}: proposalSha256 mismatch`);
      const actualChanged = changedFields(row.before, row.proposal);
      assertEqual(`${row.id}: changedFields`, actualChanged, row.changedFields || []);
      if (!applyActions.has(row.action) && !holdActions.has(row.action)) {
        throw new Error(`${row.id}: unclassified action ${row.action}`);
      }
      rows.push({ ...row, packetFile: file });
    }
  }

  const writes = rows.filter((row) => applyActions.has(row.action));
  if (rows.length !== expectedTotal) throw new Error(`row count ${rows.length}; expected ${expectedTotal}`);
  if (writes.length !== expectedWrites) throw new Error(`write count ${writes.length}; expected ${expectedWrites}`);

  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1 });
  let liveRows;
  try {
    const result = await pool.query(
      `SELECT ${selectRowsSql()} FROM "KnownIssue" WHERE id = ANY($1::text[]) ORDER BY id`,
      [writes.map((row) => row.id)],
    );
    liveRows = result.rows;
  } finally {
    await pool.end();
  }
  if (liveRows.length !== writes.length) throw new Error(`database returned ${liveRows.length}; expected ${writes.length}`);
  const liveById = new Map(liveRows.map((row) => [row.id, fullRecordSnapshot(row)]));

  const issues = writes.map((row) => {
    const current = liveById.get(row.id);
    if (!current) throw new Error(`${row.id}: missing live row`);
    const after = buildReviewedAfterState(row, current);

    return {
      id: row.id,
      disposition: 'no-commerce',
      evidence: [
        ...(row.evidence || []),
        {
          kind: 'independent-review',
          verifiedOn: reviewDate,
          observation: `Opus independently reconciled the ${make} packet set; Devon authorized deployment after review. Source packet: ${row.packetFile}.`,
        },
      ],
      before: { ...fullRecordHashes(current), claimIds: claimIdsForRow(current) },
      after,
    };
  });

  const manifest = {
    schemaVersion: 2,
    auditScope: 'full-record',
    manifestKind: 'known-issues-catalog-deeplinks',
    batchId,
    generatedAt: new Date().toISOString(),
    sourceRef,
    make,
    approval: {
      reviewer: 'Opus',
      owner: 'Devon',
      reviewDate,
      contract: 'same indexed identity, published status preserved, holds are no-ops, no retail commerce',
    },
    packetCount: files.length,
    packetRowCount: rows.length,
    writeRowCount: issues.length,
    heldRowCount: rows.length - issues.length,
    packets: packetProvenance,
    issues,
  };
  const errors = validateManifest(manifest);
  if (errors.length) throw new Error(`generated manifest invalid: ${errors.join('; ')}`);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    outFile: path.relative(PROJECT_ROOT, outFile),
    batchId,
    packetCount: files.length,
    packetRowCount: rows.length,
    writes: issues.length,
    holdsSkipped: rows.length - issues.length,
    manifestSha256: stableHash(manifest),
  }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = { actionSets, buildReviewedAfterState, changedFields, stableHash };
