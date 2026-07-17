const assert = require('node:assert/strict');
const test = require('node:test');
const {
  applyVerifiedAdditions,
  auditCoverage,
} = require('./audit-known-issue-ymmt-coverage');

test('classifies exact, bounded alias, unsupported, and unresolved rows', () => {
  const ymmt = {
    2000: {
      Ford: { 'F-250 Super Duty': ['XL'] },
      Honda: { Civic: ['LX'] },
    },
  };
  const policy = {
    minimumSupportedYear: 1990,
    verifiedAdditions: [],
    aliases: [
      {
        knownIssue: { make: 'Ford', model: 'F-250' },
        selector: { make: 'Ford', model: 'F-250 Super Duty' },
        yearRanges: [[1999, 2025]],
      },
    ],
  };
  const rows = [
    { make: 'Honda', model: 'Civic', years: [2000] },
    { make: 'Ford', model: 'F-250', years: [2000] },
    { make: 'Honda', model: 'Prelude', years: [1989] },
    { make: 'Audi', model: 'RS5', years: [2000] },
  ];

  const result = auditCoverage({
    rows,
    ymmt,
    policy,
    maximumSupportedYear: 2027,
  });
  assert.deepEqual(result.summary, {
    publishedRows: 4,
    uniquePublishedModelYears: 4,
    exact: 1,
    aliased: 1,
    unsupported: 1,
    needsReview: 1,
  });
});

test('applies only reviewed additions and merges trims idempotently', () => {
  const ymmt = { 2024: { BMW: {} } };
  const policy = {
    verifiedAdditions: [
      {
        make: 'BMW',
        model: 'i5',
        years: [2024],
        trims: ['eDrive40', 'M60'],
      },
    ],
  };

  assert.deepEqual(applyVerifiedAdditions(ymmt, policy), {
    added: 1,
    updated: 0,
  });
  assert.deepEqual(applyVerifiedAdditions(ymmt, policy), {
    added: 0,
    updated: 0,
  });
  assert.deepEqual(ymmt['2024'].BMW.i5, ['eDrive40', 'M60']);
});
