/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');
const { ALL_STATUS_MODELS, ARCHIVED_MODELS, PUBLISHED_MODELS } = require('./enrich-subaru-snapshot-provenance');
const { stableValue } = require('./known-issue-adjudication-utils');
const { codePoints, isSubaruMake, normalizeSubaruMake } = require('./subaru-audit-normalization');

const EXPECTED_GLOBAL_PUBLISHED = 7642;
const RECONCILIATION_FILE = 'data/known-issue-subaru-make-reconciliation-2026-08-11.json';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }
function countModels(rows) { return sortedObject(rows.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {})); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function evaluateLiveInventory(rows, reconciliation) {
  const globalPublished = rows.filter((row) => row.status === 'published');
  const subaruRows = rows.filter((row) => isSubaruMake(row.make));
  const published = subaruRows.filter((row) => row.status === 'published');
  const archived = subaruRows.filter((row) => row.status === 'archived');
  const otherStatuses = subaruRows.filter((row) => !['published', 'archived'].includes(row.status));
  const makeVariants = [...subaruRows.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([make, count]) => ({ make, normalized: normalizeSubaruMake(make), codePoints: codePoints(make), count }));
  const modelCounts = { allStatuses: countModels(subaruRows), published: countModels(published), archived: countModels(archived) };
  const archivedIds = archived.map((row) => row.id).sort();
  const failures = [];
  if (globalPublished.length !== EXPECTED_GLOBAL_PUBLISHED) failures.push(`global published count ${globalPublished.length}; expected ${EXPECTED_GLOBAL_PUBLISHED}`);
  if (subaruRows.length !== 217 || published.length !== 205 || archived.length !== 12 || otherStatuses.length) failures.push(`Subaru status inventory drifted: total=${subaruRows.length}, published=${published.length}, archived=${archived.length}, other=${otherStatuses.length}`);
  if (!equal(modelCounts.published, PUBLISHED_MODELS) || !equal(modelCounts.archived, ARCHIVED_MODELS) || !equal(modelCounts.allStatuses, ALL_STATUS_MODELS)) failures.push(`Subaru model counts drifted: ${JSON.stringify(modelCounts)}`);
  if (makeVariants.length !== 1 || makeVariants[0].make !== 'Subaru' || makeVariants[0].count !== 217) failures.push(`Subaru raw make variants drifted: ${JSON.stringify(makeVariants)}`);
  if (reconciliation?.summary?.held !== 205 || reconciliation?.summary?.retained !== 0 || reconciliation?.summary?.archivedExcluded !== 12 || reconciliation?.summary?.authorizedWriteCandidates !== 0) failures.push('local reconciliation is not the 205-hold/12-archive/zero-write plan');
  if (JSON.stringify(archivedIds) !== JSON.stringify(reconciliation?.archivedInventory?.ids || []) || reconciliation?.archivedInventory?.republishAuthorized !== false) failures.push('live archived IDs do not match the non-republish reconciliation');
  return {
    passed: failures.length === 0,
    verificationMode: 'read-only-all-status-inventory',
    globalPublishedCount: globalPublished.length,
    normalizedSubaruCount: subaruRows.length,
    statusCounts: { published: published.length, archived: archived.length, other: otherStatuses.length },
    makeVariants,
    modelCounts,
    archivedIds,
    localDecision: { retained: reconciliation?.summary?.retained, held: reconciliation?.summary?.held, archivedExcluded: reconciliation?.summary?.archivedExcluded, authorizedWriteCandidates: reconciliation?.summary?.authorizedWriteCandidates },
    failures,
  };
}

async function verifySubaruAllHoldLive(pool, reconciliation) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const result = await client.query('SELECT id, make, model, status FROM "KnownIssue" ORDER BY id');
    const evaluated = evaluateLiveInventory(result.rows, reconciliation);
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
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const result = await verifySubaruAllHoldLive(pool, reconciliation);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

module.exports = { EXPECTED_GLOBAL_PUBLISHED, evaluateLiveInventory, verifySubaruAllHoldLive };
