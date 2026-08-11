/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { actionSets, buildReviewedAfterState } = require('./build-reviewed-adjudication-apply-manifest');

function fixture() {
  const current = {
    make: 'Hyundai',
    model: 'Accent',
    years: [2018, 2019],
    trims: ['SE'],
    engines: ['1.6L I4'],
    title: 'ABS Module Fire Risk',
    category: 'brakes',
    severity: 'high',
    status: 'published',
    description: 'old copy',
    solution: 'old solution',
    citations: [{ type: 'recall', title: 'Old source', url: 'https://example.com/old' }],
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 17,
    lastReportedByOwners: '2026-08-08',
    relatedIssueIds: [],
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

test('rejects frozen vehicle-scope drift under an indexed id', () => {
  const { row, current } = fixture();
  row.proposal.engines = ['2.0L I4'];
  row.changedFields.push('engines');
  assert.throws(() => buildReviewedAfterState(row, current), /proposal changes engines/);
});

test('preserves an existing verified fixParts deep link', () => {
  const { row, current } = fixture();
  current.fixParts = [{
    component: 'ABS module',
    buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B000000000' }],
  }];
  row.before.fixParts = [];
  row.proposal.fixParts = [];
  const after = buildReviewedAfterState(row, current);
  assert.deepEqual(after.fixParts, current.fixParts);
});

test('rejects retail commerce in a reviewed no-commerce adjudication', () => {
  const { row, current } = fixture();
  row.changedFields.push('fixParts');
  row.proposal.fixParts = [{
    component: 'ABS module',
    buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B000000000' }],
  }];
  assert.throws(() => buildReviewedAfterState(row, current), /cannot change fixParts/);
});

test('requires pending cleanup actions to be explicitly classified as no-ops', () => {
  const { applyActions, holdActions } = actionSets([
    '--hold-actions',
    'targeted_safety_cleanup_pending_source,remove_false_citation_and_search_commerce_pending_source',
  ]);
  assert.deepEqual([...applyActions], ['rewrite_same_identity']);
  assert.ok(holdActions.has('keep_published_pending_source'));
  assert.ok(holdActions.has('targeted_safety_cleanup_pending_source'));
  assert.ok(holdActions.has('remove_false_citation_and_search_commerce_pending_source'));
});

test('rejects an action classified as both apply and hold', () => {
  assert.throws(
    () => actionSets(['--apply-actions', 'rewrite_same_identity', '--hold-actions', 'rewrite_same_identity']),
    /both apply and hold/,
  );
});
