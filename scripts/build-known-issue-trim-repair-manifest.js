/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { looksLikeApplicabilityProse } = require('./verify-known-issue-restoration');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${flag}`);
  return args[index + 1];
}

function requireDependency(name) {
  try {
    return require(name);
  } catch (error) {
    const dependencyRoot = process.env.KNOWN_ISSUE_DEPENDENCY_ROOT;
    if (!dependencyRoot) throw error;
    return require(path.join(dependencyRoot, name));
  }
}

async function build({ make, expectedCount, output }) {
  const { Pool } = requireDependency('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1 });
  try {
    const result = await pool.query(`
      SELECT id, make, model, title, trims, status
      FROM "KnownIssue"
      WHERE status = 'published' AND lower(make) = lower($1) AND cardinality(trims) > 0
      ORDER BY model, id
    `, [make]);
    const rows = result.rows.filter((row) => row.trims.some(looksLikeApplicabilityProse));
    if (rows.length !== expectedCount) throw new Error(`expected ${expectedCount} rows, found ${rows.length}`);
    const document = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      make,
      reason: 'Remove non-selectable applicability/VIN prose from trims while preserving issue content.',
      repairs: rows.map((row) => ({
        id: row.id,
        make: row.make,
        model: row.model,
        title: row.title,
        beforeTrims: row.trims,
        afterTrims: [],
      })),
    };
    fs.writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`);
    return { output, repairs: document.repairs.length };
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  build({
    make: argValue(args, '--make'),
    expectedCount: Number(argValue(args, '--expected-count')),
    output: path.resolve(argValue(args, '--output')),
  }).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = { build };
