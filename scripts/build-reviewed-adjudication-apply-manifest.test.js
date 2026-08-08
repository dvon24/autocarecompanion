/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildReviewedAfterState } = require('./build-reviewed-adjudication-apply-manifest');

function fixture() {
  const current = {
    make: 'Hyundai',
    model: 'Accent',
    title: 'ABS Module Fire Risk',
    category: 'brakes',
    status: 'published',
    description: 'old copy',
    solution: 'old solution',
    citations: [{ type: 'recall', title: 'Old source', url: 'https://example.com/old' }],
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 17,
    lastReportedByOwners: '2026-08-08',
  };
  return {
    current,
    row: {
      id: 'hyundai-accent-abs-module-fire',
      before: { ...current },
      proposal: {
        ...current,
        description: 'reviewed copy',
        citations: [{ type: 'manufacturer', title: 'OEM source', url: 'https://example.com/oem' }],
        humanApproved: false,
        reportCount: 0,
        lastReportedByOwners: '',
      },
      changedFields: ['description', 'citations', 'humanApproved'],
    },
  };
}

test('overlays only reviewed fields and preserves mutable production telemetry', () => {
  const { row, current } = fixture();
  const after = buildReviewedAfterState(row, current);
  assert.equal(after.description, 'reviewed copy');
  assert.equal(after.citations[0].type, 'manufacturer');
  assert.equal(after.humanApproved, true);
  assert.equal(after.reportCount, 17);
  assert.equal(after.lastReportedByOwners, '2026-08-08');
});

test('rejects a title substitution under an indexed id', () => {
  const { row, current } = fixture();
  row.proposal.title = 'Different issue';
  assert.throws(() => buildReviewedAfterState(row, current), /proposal changes title/);
});

test('rejects retail commerce in a reviewed no-commerce adjudication', () => {
  const { row, current } = fixture();
  row.changedFields.push('fixParts');
  row.proposal.fixParts = [{
    component: 'ABS module',
    buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B000000000' }],
  }];
  assert.throws(() => buildReviewedAfterState(row, current), /must remain no-commerce/);
});
