/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');
const { fullRecord, stableValue } = require('./known-issue-adjudication-utils');
const { codePoints, isSuzukiMake, normalizeSuzukiMake } = require('./suzuki-audit-normalization');
const { EXPECTED_GLOBAL_PUBLISHED, EXPECTED_MODEL_COUNTS, EXPECTED_ROWS, assertSuzukiSnapshot } = require('./suzuki-snapshot-contract');
const { validateReconciliation } = require('./validate-suzuki-make-reconciliation');

const RECONCILIATION_FILE = 'data/known-issue-suzuki-make-reconciliation-2026-08-11.json';
const SNAPSHOT_FILE = 'data/_suzuki-deeplink-snapshot-2026-08-11.json';
const FULL_SELECT = `SELECT id, make, model, years, trims, engines, category, title, description, solution, severity,
                            confidence, symptoms, "affectedSystems", "dtcCodes", "estimatedCostLow", "estimatedCostHigh",
                            "typicalMileageLow", "typicalMileageHigh", citations, "communityRecommendations", "fixParts",
                            "humanApproved", "reportCount", source, status, "lastReportedByOwners", "reviewedOn",
                            "contentUpdatedOn", "contentUpdateSummary", "relatedIssueIds"
                       FROM "KnownIssue"
                      WHERE status = 'published' AND lower(make) = lower($1)
                      ORDER BY id`;

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }

function assertLocalPlan(reconciliation) {
  const errors = validateReconciliation(reconciliation);
  if (errors.length) throw new Error(`Suzuki reconciliation validation failed: ${errors.join('; ')}`);
  return reconciliation;
}

function evaluateLiveInventory(inventoryRows, liveSuzukiRows, reconciliation, snapshot) {
  const published = inventoryRows.filter((row) => row.status === 'published');
  const suzukiInventory = published.filter((row) => isSuzukiMake(row.make));
  const modelCounts = sortedObject(suzukiInventory.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {}));
  const makeVariants = [...suzukiInventory.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([make, count]) => ({ make, normalized: normalizeSuzukiMake(make), codePoints: codePoints(make), count }));
  const expectedRows = (snapshot.records || []).filter((row) => isSuzukiMake(row.make)).sort((a, b) => a.id.localeCompare(b.id));
  const actualRows = [...liveSuzukiRows].sort((a, b) => a.id.localeCompare(b.id));
  const actualById = new Map(actualRows.map((row) => [row.id, row]));
  const staleHeldIds = expectedRows.filter((row) => {
    const live = actualById.get(row.id);
    return !live || !equal(fullRecord(live), fullRecord(row));
  }).map((row) => row.id);
  const unknownLiveIds = actualRows.filter((row) => !expectedRows.some((expected) => expected.id === row.id)).map((row) => row.id);
  const failures = [];
  if (published.length !== EXPECTED_GLOBAL_PUBLISHED) failures.push(`global published count ${published.length}; expected ${EXPECTED_GLOBAL_PUBLISHED}`);
  if (suzukiInventory.length !== EXPECTED_ROWS) failures.push(`Unicode-normalized Suzuki count ${suzukiInventory.length}; expected ${EXPECTED_ROWS}`);
  if (!equal(modelCounts, EXPECTED_MODEL_COUNTS)) failures.push(`Suzuki model counts drifted: ${JSON.stringify(modelCounts)}`);
  if (!equal(makeVariants, [{ make: 'Suzuki', normalized: 'suzuki', codePoints: ['U+0053', 'U+0075', 'U+007A', 'U+0075', 'U+006B', 'U+0069'], count: 18 }])) failures.push(`Suzuki raw make variants drifted: ${JSON.stringify(makeVariants)}`);
  if (staleHeldIds.length || unknownLiveIds.length || actualRows.length !== expectedRows.length) failures.push(`live held rows drifted: stale=${JSON.stringify(staleHeldIds)} unknown=${JSON.stringify(unknownLiveIds)}`);
  if (reconciliation?.summary?.held !== 18 || reconciliation?.summary?.retained !== 0 || reconciliation?.summary?.authorizedWriteCandidates !== 0) failures.push('local reconciliation is not the 18-hold/zero-write plan');
  return {
    passed: failures.length === 0,
    verificationMode: 'read-only-global-inventory-plus-full-record-Suzuki-hold-comparison',
    globalPublishedCount: published.length,
    normalizedSuzukiCount: suzukiInventory.length,
    makeVariants,
    modelCounts,
    staleHeldIds,
    unknownLiveIds,
    localDecision: { retained: reconciliation?.summary?.retained, held: reconciliation?.summary?.held, authorizedWriteCandidates: reconciliation?.summary?.authorizedWriteCandidates },
    failures,
  };
}

async function verifySuzukiAllHoldLive(pool, reconciliation, snapshot) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const inventory = await client.query(`SELECT id, make, model, status
                                            FROM "KnownIssue"
                                           WHERE status = 'published'
                                           ORDER BY id`);
    const live = await client.query(FULL_SELECT, ['Suzuki']);
    const evaluated = evaluateLiveInventory(inventory.rows, live.rows, reconciliation, snapshot);
    await client.query('COMMIT');
    return evaluated;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const reconciliation = JSON.parse(fs.readFileSync(resolveRepo(RECONCILIATION_FILE), 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(SNAPSHOT_FILE), 'utf8'));
  assertSuzukiSnapshot(snapshot, resolveRepo(SNAPSHOT_FILE));
  assertLocalPlan(reconciliation);
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const result = await verifySuzukiAllHoldLive(pool, reconciliation, snapshot);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

module.exports = { FULL_SELECT, assertLocalPlan, evaluateLiveInventory, verifySuzukiAllHoldLive };
