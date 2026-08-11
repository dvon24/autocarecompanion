/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');

function argValue(args, flag) { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : ''; }
function normalizeMake(value) { return String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').trim().toLowerCase(); }
function codePoints(value) { return [...String(value || '')].map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }

function buildInventory(rows, make, capturedOn) {
  const normalized = normalizeMake(make);
  const makeRows = rows.filter((row) => normalizeMake(row.make) === normalized).sort((left, right) => left.id.localeCompare(right.id));
  const statusCounts = sortedObject(makeRows.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] || 0) + 1 }), {}));
  const countModels = (selected) => sortedObject(selected.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {}));
  const makeVariants = [...makeRows.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([rawMake, count]) => ({ make: rawMake, normalized: normalizeMake(rawMake), codePoints: codePoints(rawMake), count }));
  const published = makeRows.filter((row) => row.status === 'published');
  const archived = makeRows.filter((row) => row.status === 'archived');
  return {
    schemaVersion: 1,
    capturedOn,
    status: 'read-only-inventory',
    make,
    captureProvenance: {
      transaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
      query: 'SELECT id, make, model, status FROM KnownIssue ORDER BY id',
      derivation: 'All rows were selected without a make or status predicate; Unicode NFKD mark-folding was applied locally.',
      environment: { connectionVariable: 'POSTGRES_PRISMA_URL (DATABASE_URL/DIRECT_URL fallback)', secretValuesRecorded: false },
    },
    globalPublishedCount: rows.filter((row) => row.status === 'published').length,
    normalizedMakeRows: makeRows.length,
    statusCounts,
    rawMakeVariants: makeVariants,
    modelCounts: { allStatuses: countModels(makeRows), published: countModels(published), archived: countModels(archived) },
    rows: makeRows.map(({ id, make: rawMake, model, status }) => ({ id, make: rawMake, model, status })),
  };
}

async function captureInventory(pool, make, capturedOn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const result = await client.query('SELECT id, make, model, status FROM "KnownIssue" ORDER BY id');
    const inventory = buildInventory(result.rows, make, capturedOn);
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
  const args = process.argv.slice(2);
  const make = argValue(args, '--make');
  const output = argValue(args, '--output');
  const capturedOn = argValue(args, '--captured-on') || new Date().toISOString().slice(0, 10);
  if (!make || !output) throw new Error('--make and --output are required');
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const inventory = await captureInventory(pool, make, capturedOn);
    const absolute = path.resolve(__dirname, '..', output);
    fs.writeFileSync(absolute, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ output, globalPublishedCount: inventory.globalPublishedCount, normalizedMakeRows: inventory.normalizedMakeRows, statusCounts: inventory.statusCounts, modelCounts: inventory.modelCounts }, null, 2));
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

module.exports = { buildInventory, captureInventory, codePoints, normalizeMake };
