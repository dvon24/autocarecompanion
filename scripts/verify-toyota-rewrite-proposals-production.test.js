/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { FULL_RECORD_FIELDS, fullRecordSnapshot } = require('./apply-known-issue-catalog-deeplinks');
const { hashValue } = require('./validate-toyota-adjudication');
const { verify } = require('./verify-toyota-rewrite-proposals-production');

function row(id, status = 'archived') {
  const value = Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, '']));
  return Object.assign(value, {
    id, make: 'Toyota', model: 'Camry', years: [2018], trims: [], engines: [],
    category: 'transmission', symptoms: [], affectedSystems: [], dtcCodes: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null,
    typicalMileageHigh: null, citations: [], communityRecommendations: [], fixParts: [],
    humanApproved: true, reportCount: 0, relatedIssueIds: [], status,
  });
}

test('passes only when every production row matches the frozen audit hash and remains archived', async () => {
  const current = row('a');
  const client = { query: async () => ({ rows: [current] }) };
  const proposals = [{ id: 'a', expectedAuditAfterSha256: hashValue(fullRecordSnapshot(current)) }];
  assert.equal((await verify(client, proposals)).passed, true);
  current.title = 'drift';
  const failure = await verify(client, proposals);
  assert.equal(failure.passed, false);
  assert.equal(failure.mismatches[0].reason, 'production content drifted from frozen audited after-state');
});
