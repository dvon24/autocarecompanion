/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  FULL_RECORD_FIELDS,
  hashValue,
  validateAdjudication,
  validateRewriteProposals,
  validateSubset,
} = require('./validate-toyota-adjudication');

function fixture() {
  return {
    adjudication: {
      status: 'proposal-only',
      make: 'Toyota',
      model: 'Camry',
      source: { holdPacketSha256: 'frozen' },
      summary: {
        keep_replacement: 1,
        rewrite_then_publish: 1,
        archive_as_duplicate: 1,
        keep_archived: 1,
        total: 4,
      },
      decisions: {
        keep_replacement: ['a'],
        rewrite_then_publish: ['b'],
        archive_as_duplicate: [{ id: 'c', canonicalId: 'canonical-c' }],
        keep_archived: ['d'],
      },
    },
    packet: {
      rows: [
        { id: 'a', make: 'Toyota', model: 'Camry' },
        { id: 'b', make: 'Toyota', model: 'Camry' },
        { id: 'c', make: 'Toyota', model: 'Camry' },
        { id: 'd', make: 'Toyota', model: 'Camry' },
        { id: 'outside', make: 'Toyota', model: 'RAV4' },
      ],
    },
    packetSha256: 'frozen',
  };
}

test('accepts an exact, non-overlapping scoped decision set', () => {
  assert.deepEqual(validateAdjudication(fixture()), []);
});

test('a model subset must match its parent action for every scoped packet ID', () => {
  const packet = { rows: [
    { id: 'a', make: 'Toyota', model: 'Camry' },
    { id: 'b', make: 'Toyota', model: 'Camry' },
  ] };
  const parent = { decisions: {
    keep_replacement: ['a'], rewrite_then_publish: ['b'], archive_as_duplicate: [], keep_archived: [],
  } };
  const subset = { make: 'Toyota', model: 'Camry', decisions: {
    keep_replacement: ['a'], rewrite_then_publish: ['b'], archive_as_duplicate: [], keep_archived: [],
  } };
  assert.deepEqual(validateSubset({ parent, subset, packet }), []);
  subset.decisions.keep_replacement = ['a', 'b'];
  subset.decisions.rewrite_then_publish = [];
  assert.ok(validateSubset({ parent, subset, packet })[0].includes('parent=rewrite_then_publish'));
});

test('rejects drift, duplicate IDs, missing IDs, and incomplete duplicate metadata', () => {
  const value = fixture();
  value.packetSha256 = 'changed';
  value.adjudication.decisions.keep_archived = ['a'];
  value.adjudication.decisions.archive_as_duplicate = [{ id: 'c' }];
  const errors = validateAdjudication(value);
  assert.ok(errors.some((error) => error.includes('SHA-256')));
  assert.ok(errors.some((error) => error.includes('duplicate decision IDs')));
  assert.ok(errors.some((error) => error.includes('missing packet IDs')));
  assert.ok(errors.some((error) => error.includes('canonicalId')));
});

test('rewrite proposals require exact source hashes and safe, cited, commerce-free patches', () => {
  const source = Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, '']));
  Object.assign(source, {
    make: 'Toyota', model: 'Camry', years: [2018], trims: [], engines: [], category: 'transmission',
    symptoms: [], affectedSystems: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, citations: [], communityRecommendations: [],
    fixParts: [], humanApproved: true, reportCount: 0, relatedIssueIds: [],
  });
  const adjudication = { decisions: { rewrite_then_publish: ['b'] } };
  const packet = { rows: [{ id: 'b', auditDecisions: [{ after: source }] }] };
  const proposals = {
    status: 'proposal-only',
    requiresIndependentApproval: true,
    rows: [{
      id: 'b',
      expectedAuditAfterSha256: hashValue(source),
      identityReview: 'Restores the same issue under a scoped title.',
      patch: {
        years: [2018], trims: [], title: 'Owner-Reported Transmission Behavior',
        citations: [{ title: 'Exact page', url: 'https://example.com/detail' }],
        fixParts: [], communityRecommendations: [], estimatedCostLow: null, estimatedCostHigh: null,
        typicalMileageLow: null, typicalMileageHigh: null, status: 'published', humanApproved: true,
      },
    }],
  };
  assert.deepEqual(validateRewriteProposals({ adjudication, proposals, packet }), []);
  proposals.rows[0].patch.citations[0].url = 'https://example.com/search?q=camry';
  proposals.rows[0].patch.fixParts = [{ name: 'guess' }];
  const errors = validateRewriteProposals({ adjudication, proposals, packet });
  assert.ok(errors.some((error) => error.includes('direct HTTPS page')));
  assert.ok(errors.some((error) => error.includes('fixParts must stay empty')));
});
