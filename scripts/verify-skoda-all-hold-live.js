/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');
const { codePoints, isSkodaMake, normalizeSkodaMake } = require('./skoda-audit-normalization');

const EXPECTED_GLOBAL_PUBLISHED = 7642;
const EXPECTED_MODELS = Object.freeze({ Enyaq: 2, Fabia: 16, Kodiaq: 9, Octavia: 13, Scala: 9, Superb: 10, Yeti: 1 });
const RECONCILIATION_FILE = 'data/known-issue-skoda-make-reconciliation-2026-08-11.json';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }

function evaluateLiveInventory(rows, reconciliation) {
  const published = rows.filter((row) => row.status === 'published');
  const skodaRows = published.filter((row) => isSkodaMake(row.make));
  const modelCounts = sortedObject(skodaRows.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {}));
  const makeVariants = [...skodaRows.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([make, count]) => ({ make, normalized: normalizeSkodaMake(make), codePoints: codePoints(make), count }));
  const failures = [];
  if (published.length !== EXPECTED_GLOBAL_PUBLISHED) failures.push(`global published count ${published.length}; expected ${EXPECTED_GLOBAL_PUBLISHED}`);
  if (skodaRows.length !== 60) failures.push(`Unicode-normalized Skoda count ${skodaRows.length}; expected 60`);
  if (JSON.stringify(modelCounts) !== JSON.stringify(EXPECTED_MODELS)) failures.push(`Skoda model counts drifted: ${JSON.stringify(modelCounts)}`);
  if (makeVariants.length !== 1 || makeVariants[0].make !== 'Skoda' || makeVariants[0].count !== 60) failures.push(`Skoda raw make variants drifted: ${JSON.stringify(makeVariants)}`);
  if (reconciliation?.summary?.held !== 60 || reconciliation?.summary?.retained !== 0 || reconciliation?.summary?.authorizedWriteCandidates !== 0) failures.push('local reconciliation is not the 60-hold/zero-write plan');
  return {
    passed: failures.length === 0,
    verificationMode: 'read-only-all-published-row-inventory',
    globalPublishedCount: published.length,
    normalizedSkodaCount: skodaRows.length,
    makeVariants,
    modelCounts,
    localDecision: { retained: reconciliation?.summary?.retained, held: reconciliation?.summary?.held, authorizedWriteCandidates: reconciliation?.summary?.authorizedWriteCandidates },
    failures,
  };
}

async function verifySkodaAllHoldLive(pool, reconciliation) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const result = await client.query(`SELECT id, make, model, status
                                        FROM "KnownIssue"
                                       WHERE status = 'published'
                                       ORDER BY id`);
    const evaluated = evaluateLiveInventory(result.rows, reconciliation);
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
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const result = await verifySkodaAllHoldLive(pool, reconciliation);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

module.exports = { EXPECTED_GLOBAL_PUBLISHED, EXPECTED_MODELS, evaluateLiveInventory, verifySkodaAllHoldLive };
