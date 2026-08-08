/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Read-only inventory gate for a reviewed make adjudication.
 *
 * The transactional applicator proves each changed row. This companion gate
 * proves the surrounding make inventory did not lose a published row or a
 * model page while the reviewed batch was applied.
 *
 * Usage:
 *   node scripts/verify-reviewed-make-production.js --manifest data/...json
 */
const path = require('node:path');
const {
  loadManifests,
  resolveKnownIssueConnectionString,
} = require('./apply-known-issue-catalog-deeplinks');

function expectedModelCounts(manifest) {
  const counts = new Map();
  for (const packet of manifest.packets || []) {
    const model = String(packet.model || '').trim();
    const total = packet.summary && packet.summary.total;
    if (!model || !Number.isInteger(total) || total < 0) {
      throw new Error(`${manifest.batchId}: invalid packet inventory for ${model || '<missing model>'}`);
    }
    counts.set(model, (counts.get(model) || 0) + total);
  }
  return counts;
}

function compareModelCounts(expected, actualRows) {
  const actual = new Map(actualRows.map((row) => [row.model, Number(row.count)]));
  const models = new Set([...expected.keys(), ...actual.keys()]);
  return [...models]
    .sort((left, right) => left.localeCompare(right))
    .flatMap((model) => {
      const expectedCount = expected.get(model) || 0;
      const actualCount = actual.get(model) || 0;
      return expectedCount === actualCount ? [] : [{ model, expected: expectedCount, actual: actualCount }];
    });
}

async function verifyMakeInventory(pool, manifest) {
  if (!manifest.make) throw new Error(`${manifest.batchId}: manifest.make is required`);
  if (!Number.isInteger(manifest.packetRowCount) || manifest.packetRowCount < 1) {
    throw new Error(`${manifest.batchId}: manifest.packetRowCount must be a positive integer`);
  }
  const expected = expectedModelCounts(manifest);
  const expectedPacketRows = [...expected.values()].reduce((sum, count) => sum + count, 0);
  if (expectedPacketRows !== manifest.packetRowCount) {
    throw new Error(
      `${manifest.batchId}: packet summaries total ${expectedPacketRows}, expected ${manifest.packetRowCount}`,
    );
  }

  const [catalogStatus, makeStatus, publishedModels] = await Promise.all([
    pool.query(`SELECT status, count(*)::int AS count
                  FROM "KnownIssue"
                 GROUP BY status
                 ORDER BY status`),
    pool.query(`SELECT status, count(*)::int AS count
                  FROM "KnownIssue"
                 WHERE make = $1
                 GROUP BY status
                 ORDER BY status`, [manifest.make]),
    pool.query(`SELECT model, count(*)::int AS count
                  FROM "KnownIssue"
                 WHERE make = $1 AND status = 'published'
                 GROUP BY model
                 ORDER BY model`, [manifest.make]),
  ]);

  const makeStatuses = Object.fromEntries(makeStatus.rows.map((row) => [row.status, Number(row.count)]));
  const modelCountMismatches = compareModelCounts(expected, publishedModels.rows);
  const failures = [];
  if ((makeStatuses.published || 0) !== manifest.packetRowCount) {
    failures.push(
      `${manifest.make} published count ${(makeStatuses.published || 0)} does not equal ${manifest.packetRowCount}`,
    );
  }
  // Historical archived or pending rows can coexist with the frozen published
  // inventory. They are reported above, but this gate must only fail when the
  // reviewed batch loses a published row or a published model page.
  if (modelCountMismatches.length) failures.push(`${modelCountMismatches.length} model-count mismatches`);

  return {
    passed: failures.length === 0,
    batchId: manifest.batchId,
    make: manifest.make,
    catalogStatus: Object.fromEntries(catalogStatus.rows.map((row) => [row.status, Number(row.count)])),
    makeStatus: makeStatuses,
    expectedPublishedModels: Object.fromEntries(expected),
    actualPublishedModels: Object.fromEntries(
      publishedModels.rows.map((row) => [row.model, Number(row.count)]),
    ),
    modelCountMismatches,
    failures,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.includes('--manifest')) throw new Error('Provide exactly one --manifest file.');
  const loaded = loadManifests(args);
  if (loaded.length !== 1) throw new Error('Provide exactly one --manifest file.');
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: resolveKnownIssueConnectionString(),
    max: 2,
    idleTimeoutMillis: 30000,
  });
  try {
    const result = await verifyMakeInventory(pool, loaded[0].manifest);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  compareModelCounts,
  expectedModelCounts,
  verifyMakeInventory,
};
