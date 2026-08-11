/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');
const { codePoints, isSubaruMake, normalizeSubaruMake } = require('./subaru-audit-normalization');

const OUTPUT_FILE = 'data/_subaru-status-inventory-2026-08-11.json';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }

function buildInventory(rows) {
  const subaruRows = rows.filter((row) => isSubaruMake(row.make)).sort((left, right) => left.id.localeCompare(right.id));
  const statusCounts = sortedObject(subaruRows.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] || 0) + 1 }), {}));
  const countModels = (selected) => sortedObject(selected.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {}));
  const makeVariants = [...subaruRows.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([make, count]) => ({ make, normalized: normalizeSubaruMake(make), codePoints: codePoints(make), count }));
  const published = subaruRows.filter((row) => row.status === 'published');
  const archived = subaruRows.filter((row) => row.status === 'archived');
  return {
    schemaVersion: 1,
    capturedOn: '2026-08-11',
    status: 'read-only-inventory',
    make: 'Subaru',
    captureProvenance: {
      transaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
      query: 'SELECT id, make, model, status FROM KnownIssue ORDER BY id',
      derivation: 'All rows were selected without a make or status predicate; Unicode NFKD mark-folding was applied locally.',
      environment: { envFile: 'C:/Users/devon/autocarecompanion/.env.local', connectionVariable: 'POSTGRES_PRISMA_URL (DATABASE_URL/DIRECT_URL fallback)', secretValuesRecorded: false },
    },
    globalPublishedCount: rows.filter((row) => row.status === 'published').length,
    normalizedSubaruRows: subaruRows.length,
    statusCounts,
    rawMakeVariants: makeVariants,
    modelCounts: {
      allStatuses: countModels(subaruRows),
      published: countModels(published),
      archived: countModels(archived),
    },
    rows: subaruRows.map(({ id, make, model, status }) => ({ id, make, model, status })),
  };
}

async function captureSubaruInventory(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const result = await client.query('SELECT id, make, model, status FROM "KnownIssue" ORDER BY id');
    const inventory = buildInventory(result.rows);
    await client.query('COMMIT');
    return inventory;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const inventory = await captureSubaruInventory(pool);
    fs.writeFileSync(resolveRepo(OUTPUT_FILE), `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ output: OUTPUT_FILE, globalPublishedCount: inventory.globalPublishedCount, normalizedSubaruRows: inventory.normalizedSubaruRows, statusCounts: inventory.statusCounts, modelCounts: inventory.modelCounts }, null, 2));
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

module.exports = { OUTPUT_FILE, buildInventory, captureSubaruInventory };
