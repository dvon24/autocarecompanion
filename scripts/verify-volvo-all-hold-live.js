/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');
const { FULL_RECORD_FIELDS, fullRecord, stableValue } = require('./known-issue-adjudication-utils');
const { assertSnapshot, buildAudit, normalizeMake } = require('./build-conservative-make-hold-audit');
const { validateAudit } = require('./validate-conservative-make-hold-audit');
const config = require('./volvo-hold-audit-config');

const STATUS_INVENTORY_FILE = 'data/_volvo-status-inventory-2026-08-11.json';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }
function selectRowsSql() { return ['id', ...FULL_RECORD_FIELDS].map((field) => `"${field}"`).join(', '); }

function stripMutableClickCount(value) {
  if (!Array.isArray(value)) return value;
  return value.map((recommendation) => {
    if (!recommendation || typeof recommendation !== 'object' || Array.isArray(recommendation)) return recommendation;
    return Object.fromEntries(Object.entries(recommendation).filter(([key]) => key !== 'clickCount'));
  });
}

function comparableFullRecord(row) {
  const record = fullRecord(row);
  record.communityRecommendations = stripMutableClickCount(record.communityRecommendations);
  return record;
}

function assertLocalPlan(audit) {
  const errors = validateAudit(config, audit);
  if (errors.length) throw new Error(`Volvo audit validation failed: ${errors.join('; ')}`);
  if (!equal(audit, buildAudit(config))) throw new Error('Volvo audit differs from the fresh deterministic build');
  return audit;
}

function evaluateLiveInventory(inventoryRows, liveVolvoRows, audit, snapshot, statusInventory) {
  const frozenRows = assertSnapshot(config, snapshot);
  assertLocalPlan(audit);
  const published = inventoryRows.filter((row) => row.status === 'published');
  const volvoInventory = inventoryRows.filter((row) => normalizeMake(row.make) === config.normalizedMake);
  const publishedVolvo = volvoInventory.filter((row) => row.status === 'published');
  const modelCounts = sortedObject(publishedVolvo.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {}));
  const rawMakes = [...new Set(volvoInventory.map((row) => row.make))].sort();
  const expectedStatusRows = [...(statusInventory?.rows || [])].sort((left, right) => left.id.localeCompare(right.id));
  const actualStatusRows = volvoInventory.map(({ id, make, model, status }) => ({ id, make, model, status })).sort((left, right) => left.id.localeCompare(right.id));
  const frozenById = new Map(frozenRows.map((row) => [row.id, row]));
  const liveById = new Map(liveVolvoRows.map((row) => [row.id, row]));
  const frozenIds = [...frozenById.keys()].sort();
  const liveIds = [...liveById.keys()].sort();
  const staleHeldIds = frozenIds.filter((id) => {
    const live = liveById.get(id);
    return !live || !equal(comparableFullRecord(frozenById.get(id)), comparableFullRecord(live));
  });
  const mutableClickTelemetryDriftIds = frozenIds.filter((id) => {
    const frozen = frozenById.get(id);
    const live = liveById.get(id);
    return live
      && !equal(frozen.communityRecommendations, live.communityRecommendations)
      && equal(stripMutableClickCount(frozen.communityRecommendations), stripMutableClickCount(live.communityRecommendations));
  });
  const failures = [];
  if (published.length !== config.expectedGlobalPublishedAtFreeze) failures.push(`global published count ${published.length}; expected ${config.expectedGlobalPublishedAtFreeze}`);
  if (!equal(actualStatusRows, expectedStatusRows)) failures.push('Volvo all-status ID/make/model/status inventory differs from the pinned reference');
  if (!equal(modelCounts, config.expectedModelCounts)) failures.push(`Volvo published model counts drifted: ${JSON.stringify(modelCounts)}`);
  if (!equal(rawMakes, [config.make])) failures.push(`Volvo raw make variants drifted: ${JSON.stringify(rawMakes)}`);
  if (!equal(liveIds, frozenIds)) failures.push('Volvo published live ID inventory differs from the frozen snapshot');
  if (staleHeldIds.length) failures.push(`${staleHeldIds.length} frozen Volvo rows differ from live substantive full-record state`);
  return {
    passed: failures.length === 0,
    verificationMode: 'repeatable-read-read-only-global-all-status-and-substantive-full-record-freeze',
    globalPublishedCount: published.length,
    normalizedVolvoRows: volvoInventory.length,
    publishedVolvoRows: publishedVolvo.length,
    rawMakes,
    modelCounts,
    exactStatusInventory: equal(actualStatusRows, expectedStatusRows),
    exactFrozenIds: equal(liveIds, frozenIds),
    staleHeldIds,
    mutableClickTelemetryDriftIds,
    localDecision: {
      retained: audit?.summary?.retained,
      held: audit?.summary?.held,
      authorizedWriteCandidates: audit?.summary?.authorizedWriteCandidates,
    },
    failures,
  };
}

async function verifyVolvoAllHoldLive(pool, audit, snapshot, statusInventory) {
  assertSnapshot(config, snapshot);
  assertLocalPlan(audit);
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const inventory = await client.query('SELECT id, make, model, status FROM "KnownIssue" ORDER BY id');
    const volvoIds = inventory.rows
      .filter((row) => row.status === 'published' && normalizeMake(row.make) === config.normalizedMake)
      .map((row) => row.id)
      .sort();
    const live = await client.query(
      `SELECT ${selectRowsSql()} FROM "KnownIssue" WHERE id = ANY($1::text[]) ORDER BY id`,
      [volvoIds],
    );
    const result = evaluateLiveInventory(inventory.rows, live.rows, audit, snapshot, statusInventory);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(resolveRepo(config.outputFile), 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(config.snapshotFile), 'utf8'));
  const statusInventory = JSON.parse(fs.readFileSync(resolveRepo(STATUS_INVENTORY_FILE), 'utf8'));
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const result = await verifyVolvoAllHoldLive(pool, audit, snapshot, statusInventory);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

module.exports = {
  STATUS_INVENTORY_FILE,
  assertLocalPlan,
  comparableFullRecord,
  evaluateLiveInventory,
  stripMutableClickCount,
  verifyVolvoAllHoldLive,
};
