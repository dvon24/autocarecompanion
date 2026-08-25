#!/usr/bin/env node

/**
 * Read-only export of one published make for repair-first commerce review.
 *
 * This script performs SELECT queries only. It does not update the database,
 * deploy, commit, or push. Generated files are local review artifacts.
 *
 * Usage:
 *   node scripts/_export-repair-first-make-review.js "Lincoln"
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

const make = process.argv.slice(2).join(' ').trim();
if (!make) {
  console.error('Usage: node scripts/_export-repair-first-make-review.js "Make"');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not configured in .env.local');
  process.exit(1);
}

const slug = make
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const outputDir = path.join(process.cwd(), 'data', `${slug}-repair-first-review`);
const generatedOn = new Date().toISOString().slice(0, 10);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? undefined : { rejectUnauthorized: false },
});

async function main() {
  const { rows } = await pool.query(
    `SELECT
       id, make, model, years, trims, engines, category, title, description,
       solution, severity, confidence, symptoms, "affectedSystems", "dtcCodes",
       "estimatedCostLow", "estimatedCostHigh", "typicalMileageLow",
       "typicalMileageHigh", citations, "communityRecommendations", "fixParts",
       status
     FROM "KnownIssue"
     WHERE lower(make) = lower($1) AND status = 'published'
     ORDER BY model, id`,
    [make],
  );

  if (!rows.length) {
    throw new Error(`No published KnownIssue rows found for ${make}`);
  }

  const sourceBody = JSON.stringify(rows);
  const sourceSnapshotHash = crypto.createHash('sha256').update(sourceBody).digest('hex');
  const sourceSnapshot = {
    schemaVersion: 1,
    generatedOn,
    make: rows[0].make,
    sourceSnapshotHash,
    recordCount: rows.length,
    records: rows,
  };
  const reviewInput = {
    schemaVersion: 1,
    generatedOn,
    deploymentStatus: 'REVIEW ONLY — NOT DEPLOYED',
    make: rows[0].make,
    sourceSnapshotHash,
    issueCount: rows.length,
    reviews: rows.map((row, index) => ({
      sequence: index + 1,
      issueId: row.id,
      model: row.model,
      years: row.years,
      trims: row.trims,
      engines: row.engines,
      ymmt: `${(row.years || []).join(', ')} | ${row.make} | ${row.model} | ${(row.trims || []).join(', ')} | ${(row.engines || []).join(', ')}`,
      title: row.title,
      description: row.description,
      howToFix: row.solution,
      dtcCodes: row.dtcCodes,
      existingFixParts: row.fixParts || [],
      existingCommunityRecommendations: row.communityRecommendations || [],
    })),
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'source-snapshot.json'), `${JSON.stringify(sourceSnapshot, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'review-input.json'), `${JSON.stringify(reviewInput, null, 2)}\n`);

  console.log(JSON.stringify({
    make: rows[0].make,
    issues: rows.length,
    sourceSnapshotHash,
    outputDir,
    databaseMutation: false,
    deployment: false,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
