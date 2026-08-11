/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Read-only production drift check for Toyota rewrite proposals.
 * It does not apply proposal patches or change database state.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  FULL_RECORD_FIELDS,
  fullRecordSnapshot,
  resolveKnownIssueConnectionString,
} = require('./apply-known-issue-catalog-deeplinks');
const { hashValue } = require('./validate-toyota-adjudication');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');

const EXPECTED_ADJUDICATION = Object.freeze({
  file: 'known-issue-toyota-adjudication-2026-08-05.json',
  normalizedSha256: '48c5071818b5de21a219504799dd60c6dd273498bfb002f12deed3327c176bd8',
});
const EXPECTED_PROPOSALS = Object.freeze({
  'known-issue-toyota-camry-rewrite-proposals-2026-08-05.json': '6ca790e21cdbfd79946eb6829258c7881fc2235e31f211fd251fcb3dda837cff',
  'known-issue-toyota-corolla-cross-rewrite-proposals-2026-08-05.json': 'a1598dfcbb1d8a76e40c249358e56a29e39dd85d10175670dca7b01cd675a8e3',
  'known-issue-toyota-rav4-rewrite-proposals-2026-08-05.json': '02c4379a5543b81ecbc4417ae7f7cfa56de5f6c3817eafb2438d2caf3a09c0f3',
});
const EXPECTED_ID_SET_SHA256 = '06d86a9cfa6f5524027ee83f3d873a89082246b59768f718fe1753d19155f4eb';
const EXPECTED_REVIEW_SET_SHA256 = '20ef3cd4104aec3364c99e2132b21456e3eb4906e35394a9a4f1145e635a9e80';

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

function argValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : '';
}

function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function relativeRepo(file) { return path.relative(path.resolve(__dirname, '..'), file).replace(/\\/g, '/'); }
function sortedRows(rows) { return [...rows].sort((left, right) => left.id.localeCompare(right.id)); }
function reviewedIdSetSha256(rows) { return sha256(JSON.stringify(sortedRows(rows).map((row) => row.id))); }
function reviewedSetSha256(rows) { return sha256(JSON.stringify(sortedRows(rows).map((row) => ({ id: row.id, expectedAuditAfterSha256: row.expectedAuditAfterSha256 })))); }

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

function assertReviewedRows(rows, adjudication) {
  const reviewedIds = (adjudication?.decisions?.rewrite_then_publish || []).map((row) => typeof row === 'string' ? row : row.id).sort();
  const actualIds = sortedRows(rows).map((row) => row.id);
  if (rows.length !== 32 || reviewedIds.length !== 32 || JSON.stringify(actualIds) !== JSON.stringify(reviewedIds)) throw new Error('proposal IDs do not equal the adjudicated rewrite_then_publish set');
  if (reviewedIdSetSha256(rows) !== EXPECTED_ID_SET_SHA256) throw new Error('reviewed Toyota proposal ID set drifted');
  if (reviewedSetSha256(rows) !== EXPECTED_REVIEW_SET_SHA256) throw new Error('reviewed Toyota proposal after-state set drifted');
  return rows;
}

function loadReviewedRows(adjudicationFile, proposalFiles) {
  if (!adjudicationFile) throw new Error('Provide --adjudication');
  if (path.basename(adjudicationFile) !== EXPECTED_ADJUDICATION.file || normalizedFileHash(adjudicationFile) !== EXPECTED_ADJUDICATION.normalizedSha256) throw new Error('Toyota adjudication file/hash drifted');
  const actualProposalFiles = Object.fromEntries(proposalFiles.map((file) => [path.basename(file), normalizedFileHash(file)]));
  if (JSON.stringify(Object.keys(actualProposalFiles).sort()) !== JSON.stringify(Object.keys(EXPECTED_PROPOSALS).sort())) throw new Error('Toyota proposal file set drifted');
  for (const [file, expectedHash] of Object.entries(EXPECTED_PROPOSALS)) if (actualProposalFiles[file] !== expectedHash) throw new Error(`Toyota proposal file/hash drifted: ${file}`);
  const adjudication = JSON.parse(fs.readFileSync(adjudicationFile, 'utf8'));
  const rows = loadRows(proposalFiles);
  assertReviewedRows(rows, adjudication);
  return { adjudication, rows, proposalFiles: proposalFiles.map((file) => ({ file: relativeRepo(file), normalizedSha256: normalizedFileHash(file) })) };
}

async function verify(client, proposalRows) {
  if (reviewedIdSetSha256(proposalRows) !== EXPECTED_ID_SET_SHA256 || reviewedSetSha256(proposalRows) !== EXPECTED_REVIEW_SET_SHA256) throw new Error('Refusing read-only verification for an unreviewed Toyota proposal set');
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
    reviewedIdSetSha256: reviewedIdSetSha256(proposalRows),
    reviewedSetSha256: reviewedSetSha256(proposalRows),
    checkedIds: sortedRows(proposalRows).map((row) => row.id),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const proposalFiles = argValues(args, '--proposal');
  if (proposalFiles.length === 0) throw new Error('Provide at least one --proposal file');
  const adjudicationFile = argValue(args, '--adjudication');
  const outputFile = argValue(args, '--output');
  const reviewed = loadReviewedRows(adjudicationFile, proposalFiles);
  const { Pool } = requireDependency('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1, idleTimeoutMillis: 30000 });
  try {
    const client = await pool.connect();
    let result;
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      result = await verify(client, reviewed.rows);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
    result.checkedAt = new Date().toISOString();
    result.transaction = 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY';
    result.adjudication = { file: relativeRepo(adjudicationFile), normalizedSha256: normalizedFileHash(adjudicationFile) };
    result.proposalFiles = reviewed.proposalFiles;
    if (outputFile) fs.writeFileSync(outputFile, `${JSON.stringify({ schemaVersion: 2, status: 'read-only-production-verification', ...result }, null, 2)}\n`, 'utf8');
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

module.exports = {
  EXPECTED_ID_SET_SHA256,
  EXPECTED_REVIEW_SET_SHA256,
  assertReviewedRows,
  loadReviewedRows,
  loadRows,
  reviewedIdSetSha256,
  reviewedSetSha256,
  verify,
};
