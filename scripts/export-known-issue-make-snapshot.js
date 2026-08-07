/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Read-only, make-scoped snapshot exporter for the known-issues catalog.
 *
 *   node scripts/export-known-issue-make-snapshot.js \
 *     --make Kia \
 *     --output data/_kia-deeplink-snapshot-2026-08-06.json \
 *     --env-file C:\\path\\to\\.env.local
 */
const fs = require('node:fs');
const path = require('node:path');
const { buildSnapshot } = require('./audit-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function argValue(args, flag, fallback = '') {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

async function readMakeRows(connectionString, make) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString, max: 2, idleTimeoutMillis: 30000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const rows = await client.query(
      `SELECT id, make, model, years, trims, engines, category, title, description, solution, severity,
              confidence, symptoms, "affectedSystems", "dtcCodes", "estimatedCostLow", "estimatedCostHigh",
              "typicalMileageLow", "typicalMileageHigh", citations, "communityRecommendations", "fixParts",
              "humanApproved", "reportCount", source, status, "lastReportedByOwners", "reviewedOn",
              "contentUpdatedOn", "contentUpdateSummary", "relatedIssueIds"
         FROM "KnownIssue"
        WHERE status = 'published' AND lower(make) = lower($1)
        ORDER BY id`,
      [make],
    );
    const clicks = await client.query(
      `SELECT click."knownIssueId", click."partBrand", click."partName", click.link,
              click."recommendationIdx", click."clickedAt"
         FROM "AffiliateClick" AS click
         JOIN "KnownIssue" AS issue ON issue.id = click."knownIssueId"
        WHERE issue.status = 'published' AND lower(issue.make) = lower($1)
        ORDER BY click."clickedAt" DESC`,
      [make],
    );
    await client.query('COMMIT');
    return { rows: rows.rows, clicks: clicks.rows };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

async function main() {
  const args = process.argv.slice(2);
  const make = argValue(args, '--make').trim();
  const output = path.resolve(PROJECT_ROOT, argValue(args, '--output'));
  const envFile = path.resolve(PROJECT_ROOT, argValue(args, '--env-file', '.env.local'));
  if (!make) throw new Error('--make is required');
  if (!argValue(args, '--output')) throw new Error('--output is required');

  require('dotenv').config({ path: envFile });
  const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error(`No POSTGRES_PRISMA_URL or DATABASE_URL found in ${envFile}`);

  const live = await readMakeRows(connectionString, make);
  if (!live.rows.length) throw new Error(`No published KnownIssue rows found for make ${make}`);
  const snapshot = buildSnapshot(live.rows, live.clicks);
  writeJsonAtomic(output, snapshot);
  console.log(JSON.stringify({
    make,
    output: path.relative(PROJECT_ROOT, output),
    snapshotHash: snapshot.snapshotHash,
    recordCount: snapshot.records.length,
    inventory: snapshot.inventory,
  }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = { argValue, readMakeRows, writeJsonAtomic };
