/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');
const { FULL_RECORD_FIELDS, fullRecord, stableValue } = require('./known-issue-adjudication-utils');
const { codePoints, isTeslaMake, normalizeTeslaMake } = require('./tesla-audit-normalization');

const EXPECTED_GLOBAL_PUBLISHED = 7642;
const EXPECTED_MODELS = Object.freeze({ Cybertruck: 1, 'Model 3': 15, 'Model S': 16, 'Model X': 12, 'Model Y': 15, Semi: 5 });
const EXPECTED_ROWS = 64;
const RECONCILIATION_FILE = 'data/known-issue-tesla-make-reconciliation-2026-08-11.json';
const SNAPSHOT_FILE = 'data/_tesla-deeplink-snapshot-2026-08-11.json';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function selectRowsSql() { return ['id', ...FULL_RECORD_FIELDS].map((field) => `"${field}"`).join(', '); }

function evaluateLiveInventory(inventoryRows, liveTeslaRows, reconciliation, snapshot) {
  const published = inventoryRows.filter((row) => row.status === 'published');
  const teslaInventory = published.filter((row) => isTeslaMake(row.make));
  const modelCounts = sortedObject(teslaInventory.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {}));
  const makeVariants = [...teslaInventory.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([make, count]) => ({ make, normalized: normalizeTeslaMake(make), codePoints: codePoints(make), count }));
  const frozenRows = Array.isArray(snapshot?.records) ? snapshot.records : [];
  const frozenById = new Map(frozenRows.map((row) => [row.id, fullRecord(row)]));
  const liveById = new Map(liveTeslaRows.map((row) => [row.id, fullRecord(row)]));
  const frozenIds = [...frozenById.keys()].sort();
  const liveIds = [...liveById.keys()].sort();
  const staleHeldRows = frozenIds.filter((id) => !liveById.has(id) || !equal(liveById.get(id), frozenById.get(id)));
  const failures = [];
  if (published.length !== EXPECTED_GLOBAL_PUBLISHED) failures.push(`global published count ${published.length}; expected ${EXPECTED_GLOBAL_PUBLISHED}`);
  if (teslaInventory.length !== EXPECTED_ROWS) failures.push(`Unicode-normalized Tesla count ${teslaInventory.length}; expected ${EXPECTED_ROWS}`);
  if (!equal(modelCounts, EXPECTED_MODELS)) failures.push(`Tesla model counts drifted: ${JSON.stringify(modelCounts)}`);
  if (makeVariants.length !== 1 || makeVariants[0].make !== 'Tesla' || makeVariants[0].count !== EXPECTED_ROWS) failures.push(`Tesla raw make variants drifted: ${JSON.stringify(makeVariants)}`);
  if (!equal(liveIds, frozenIds)) failures.push('Tesla live ID inventory differs from the frozen snapshot');
  if (staleHeldRows.length) failures.push(`${staleHeldRows.length} frozen Tesla rows differ from live full-record state`);
  if (reconciliation?.summary?.held !== EXPECTED_ROWS || reconciliation?.summary?.retained !== 0 || reconciliation?.summary?.authorizedWriteCandidates !== 0) failures.push(`local reconciliation is not the ${EXPECTED_ROWS}-hold/zero-write plan`);
  return {
    passed: failures.length === 0,
    verificationMode: 'repeatable-read-read-only-global-inventory-and-full-record-freeze',
    globalPublishedCount: published.length,
    normalizedTeslaCount: teslaInventory.length,
    makeVariants,
    modelCounts,
    exactFrozenIds: equal(liveIds, frozenIds),
    staleHeldRows,
    localDecision: { retained: reconciliation?.summary?.retained, held: reconciliation?.summary?.held, authorizedWriteCandidates: reconciliation?.summary?.authorizedWriteCandidates },
    failures,
  };
}

async function verifyTeslaAllHoldLive(pool, reconciliation, snapshot) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const inventory = await client.query(`SELECT id, make, model, status
                                            FROM "KnownIssue"
                                           WHERE status = 'published'
                                           ORDER BY id`);
    const teslaIds = inventory.rows.filter((row) => isTeslaMake(row.make)).map((row) => row.id).sort();
    const fullRows = await client.query(
      `SELECT ${selectRowsSql()} FROM "KnownIssue" WHERE id = ANY($1::text[]) ORDER BY id`,
      [teslaIds],
    );
    const evaluated = evaluateLiveInventory(inventory.rows, fullRows.rows, reconciliation, snapshot);
    await client.query('COMMIT');
    return evaluated;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const reconciliation = JSON.parse(fs.readFileSync(resolveRepo(RECONCILIATION_FILE), 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(SNAPSHOT_FILE), 'utf8'));
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const result = await verifyTeslaAllHoldLive(pool, reconciliation, snapshot);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

module.exports = { EXPECTED_GLOBAL_PUBLISHED, EXPECTED_MODELS, EXPECTED_ROWS, evaluateLiveInventory, verifyTeslaAllHoldLive };
