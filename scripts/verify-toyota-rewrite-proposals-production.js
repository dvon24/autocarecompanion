/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Read-only production drift check for Toyota rewrite proposals.
 * It does not apply proposal patches or change database state.
 */
const fs = require('node:fs');
const path = require('node:path');
const {
  FULL_RECORD_FIELDS,
  fullRecordSnapshot,
  resolveKnownIssueConnectionString,
} = require('./apply-known-issue-catalog-deeplinks');
const { hashValue } = require('./validate-toyota-adjudication');

function requireDependency(name) {
  try {
    return require(name);
  } catch (error) {
    const root = process.env.KNOWN_ISSUE_DEPENDENCY_ROOT;
    if (!root) throw error;
    return require(path.join(root, name));
  }
}

function argValues(args, flag) {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flag && args[index + 1]) values.push(path.resolve(args[index + 1]));
  }
  return values;
}

function loadRows(files) {
  const rows = files.flatMap((file) => {
    const document = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (document.status !== 'proposal-only' || !Array.isArray(document.rows)) {
      throw new Error(`${file}: expected a proposal-only document with rows[]`);
    }
    return document.rows.map((row) => ({ ...row, proposalFile: file }));
  });
  const ids = rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) throw new Error('proposal files contain duplicate IDs');
  return rows;
}

async function verify(client, proposalRows) {
  const ids = proposalRows.map((row) => row.id);
  const columns = ['id', ...FULL_RECORD_FIELDS].map((field) => `"${field}"`).join(', ');
  const result = await client.query(
    `SELECT ${columns} FROM "KnownIssue" WHERE id = ANY($1::text[]) ORDER BY id`,
    [ids],
  );
  const actualById = new Map(result.rows.map((row) => [row.id, row]));
  const mismatches = [];
  for (const proposal of proposalRows) {
    const actual = actualById.get(proposal.id);
    if (!actual) {
      mismatches.push({ id: proposal.id, reason: 'missing production row' });
      continue;
    }
    const actualHash = hashValue(fullRecordSnapshot(actual));
    if (actualHash !== proposal.expectedAuditAfterSha256) {
      mismatches.push({
        id: proposal.id,
        reason: 'production content drifted from frozen audited after-state',
        expectedAuditAfterSha256: proposal.expectedAuditAfterSha256,
        actualSha256: actualHash,
      });
    }
    if (actual.status !== 'archived') {
      mismatches.push({ id: proposal.id, reason: `expected archived before review, found ${actual.status}` });
    }
  }
  return {
    passed: mismatches.length === 0 && actualById.size === proposalRows.length,
    proposalCount: proposalRows.length,
    productionRowCount: actualById.size,
    mismatches,
  };
}

async function main() {
  const proposalFiles = argValues(process.argv.slice(2), '--proposal');
  if (proposalFiles.length === 0) throw new Error('Provide at least one --proposal file');
  const proposalRows = loadRows(proposalFiles);
  const { Pool } = requireDependency('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const result = await verify(pool, proposalRows);
    result.checkedAt = new Date().toISOString();
    result.proposalFiles = proposalFiles;
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = { loadRows, verify };
