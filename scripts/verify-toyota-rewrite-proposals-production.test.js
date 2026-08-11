/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {
  EXPECTED_ID_SET_SHA256,
  EXPECTED_REVIEW_SET_SHA256,
  loadReviewedRows,
  reviewedIdSetSha256,
  reviewedSetSha256,
  verify,
} = require('./verify-toyota-rewrite-proposals-production');

const root = path.resolve(__dirname, '..');
const adjudicationFile = path.join(root, 'data/known-issue-toyota-adjudication-2026-08-05.json');
const proposalFiles = [
  path.join(root, 'data/known-issue-toyota-camry-rewrite-proposals-2026-08-05.json'),
  path.join(root, 'data/known-issue-toyota-corolla-cross-rewrite-proposals-2026-08-05.json'),
  path.join(root, 'data/known-issue-toyota-rav4-rewrite-proposals-2026-08-05.json'),
];
const packet = require('../data/_toyota-hold-review-packet.json');

function reviewed() { return loadReviewedRows(adjudicationFile, proposalFiles); }
function productionRows(rows) {
  const packetById = new Map(packet.rows.map((row) => [row.id, row]));
  return rows.map((proposal) => ({ id: proposal.id, ...structuredClone(packetById.get(proposal.id).auditDecisions[0].after) }));
}

test('binds the verifier to the exact adjudicated 32-row proposal set and pinned files', () => {
  const value = reviewed();
  assert.equal(value.rows.length, 32);
  assert.equal(reviewedIdSetSha256(value.rows), EXPECTED_ID_SET_SHA256);
  assert.equal(reviewedSetSha256(value.rows), EXPECTED_REVIEW_SET_SHA256);
  assert.equal(value.proposalFiles.length, 3);
});

test('passes only when every exact reviewed production row matches and remains archived', async () => {
  const value = reviewed();
  const current = productionRows(value.rows);
  const client = { query: async () => ({ rows: current }) };
  const success = await verify(client, value.rows);
  assert.equal(success.passed, true);
  assert.equal(success.checkedIds.length, 32);
  current[0].title += ' drift';
  const failure = await verify(client, value.rows);
  assert.equal(failure.passed, false);
  assert.equal(failure.mismatches[0].reason, 'production content drifted from frozen audited after-state');
});

test('rejects 32 archived rows outside the adjudicated rewrite set before querying', async () => {
  const value = reviewed();
  const malicious = value.rows.map((row, index) => ({ ...row, id: `other-archived-${index}` }));
  let queries = 0;
  const client = { query: async () => { queries += 1; return { rows: [] }; } };
  await assert.rejects(() => verify(client, malicious), /unreviewed Toyota proposal set/);
  assert.equal(queries, 0);
});

test('rejects after-state hash substitution even when all 32 IDs are correct', async () => {
  const value = reviewed();
  const tampered = structuredClone(value.rows);
  tampered[0].expectedAuditAfterSha256 = '0'.repeat(64);
  const client = { query: async () => { throw new Error('query must not run'); } };
  await assert.rejects(() => verify(client, tampered), /unreviewed Toyota proposal set/);
});
