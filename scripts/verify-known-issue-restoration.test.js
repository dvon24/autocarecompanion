/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  expectedArchivedHoldIds,
  looksLikeApplicabilityProse,
  projectedStatusCounts,
  restoreTarget,
  validateBaseline,
  validateManifest,
  valuesEqual,
} = require('./verify-known-issue-restoration');

test('expects archive signatures only for held rows archived in the baseline', () => {
  const expected = expectedArchivedHoldIds({
    auditArchivedIds: [{ id: 'archived-hold' }, { id: 'restored-row' }],
  }, {
    hold: [{ id: 'archived-hold' }, { id: 'published-replacement-hold' }],
  });
  assert.deepEqual([...expected], ['archived-hold']);
});

test('accepts normal trim names', () => {
  for (const trim of ['SXT', 'R/T', 'Citadel', 'SRT Hellcat Redeye Widebody', 'SE/SXT']) {
    assert.equal(looksLikeApplicabilityProse(trim), false, trim);
  }
});

test('rejects audit applicability prose stored as trims', () => {
  for (const trim of [
    'Vehicles built February 8-9, 2023; verify by VIN',
    'Vehicles with 6.4L SRT HEMI engine sales code ESG or ESH',
    'North American vehicles equipped with an 8.4-inch radio',
    'Recall campaign eligibility must be verified by VIN',
  ]) {
    assert.equal(looksLikeApplicabilityProse(trim), true, trim);
  }
});

test('baseline validation requires populated, unique evidence arrays', () => {
  assert.deepEqual(validateBaseline({}), [
    'baseline.auditArchivedIds must be a non-empty array',
    'baseline.proseTrimIds must be a non-empty array',
    'baseline.zeroPageModels must be a non-empty array',
  ]);
  assert.deepEqual(validateBaseline({
    auditArchivedIds: [{ id: 'a' }, { id: 'a' }],
    proseTrimIds: [{ id: 'b' }],
    zeroPageModels: [{ make: 'Dodge', model: 'Viper' }],
  }), ['auditArchivedIds contains duplicate ids']);
});

test('manifest validation rejects overlap and unsupported patch fields', () => {
  assert.deepEqual(validateManifest({
    restore: [{ id: 'a', patch: { nope: true } }],
    hold: [{ id: 'a' }],
  }), [
    'restore/hold overlap: a',
    'a: unsupported patch fields: nope',
  ]);
});

test('accepts the frozen restore target shape and rejects conflicting aliases', () => {
  assert.deepEqual(validateManifest({
    restore: [{ id: 'a', target: { title: 'Original title', status: 'published' } }],
    hold: [],
  }), []);
  assert.deepEqual(restoreTarget({ target: { title: 'Original title' } }), { title: 'Original title' });
  assert.deepEqual(validateManifest({
    restore: [{ id: 'a', patch: { title: 'One' }, target: { title: 'Two' } }],
    hold: [],
  }), ['a: patch and target conflict']);
});

test('projects exact status transitions from the captured baseline', () => {
  assert.deepEqual(projectedStatusCounts({
    byStatus: [
      { status: 'published', count: 10 },
      { status: 'archived', count: 4 },
    ],
  }, {
    restore: [
      { statusFrom: 'archived', statusTo: 'published' },
      { statusFrom: 'published', statusTo: 'published' },
    ],
  }), { published: 11, archived: 3 });
});

test('compares JSON object keys stably without hiding array order', () => {
  assert.equal(valuesEqual({ b: 2, a: 1 }, { a: 1, b: 2 }), true);
  assert.equal(valuesEqual(['SXT', 'R/T'], ['R/T', 'SXT']), false);
});
