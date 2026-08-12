/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  actionSets, buildReviewedAfterState, isPacketFilename, normalizedChangedFields, packetSummary, selectWrites,
} = require('./build-reviewed-adjudication-apply-manifest');

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

test('rejects stale live prose before overlaying a reviewed proposal', () => {
  const { row, current } = fixture();
  current.description = 'newer production correction';
  assert.throws(() => buildReviewedAfterState(row, current), /live description mismatch/);
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

test('classifies the exact SEAT retain and byte-identical hold actions', () => {
  const { applyActions, holdActions } = actionSets([
    '--apply-actions', 'retain_indexed_identity_and_accuracy_cleanup',
    '--hold-actions', 'hold_indexed_identity_byte_identical_pending_identity_policy',
  ]);
  assert.deepEqual([...applyActions], ['retain_indexed_identity_and_accuracy_cleanup']);
  assert.ok(holdActions.has('hold_indexed_identity_byte_identical_pending_identity_policy'));
});

test('preserves live relatedIssueIds when a packet proposes relationship cleanup', () => {
  const { row, current } = fixture();
  current.relatedIssueIds = ['live-related-page'];
  row.before.relatedIssueIds = ['live-related-page'];
  row.proposal.relatedIssueIds = [];
  row.changedFields.push('relatedIssueIds');
  const after = buildReviewedAfterState(row, current);
  assert.deepEqual(after.relatedIssueIds, ['live-related-page']);
});

test('normalizes reviewed citation aliases to production schema values', () => {
  const { row, current } = fixture();
  row.proposal.citations = [
    { type: 'service-action', title: 'OEM action', url: 'https://example.com/action' },
    { type: 'government', title: 'Government source', url: 'https://example.com/government' },
  ];
  row.changedFields = row.changedFields.filter((field) => field !== 'citations');
  row.changedFields.push('citations');
  const after = buildReviewedAfterState(row, current);
  assert.deepEqual(after.citations.map((citation) => citation.type), ['manufacturer', 'nhtsa']);
});

test('accepts make-wide and per-model adjudication packet filenames', () => {
  assert.equal(isPacketFilename('data/known-issue-gmc-adjudication-2026-08-05.json', 'gmc'), true);
  assert.equal(isPacketFilename('data/known-issue-gmc-yukon-adjudication-2026-08-05.json', 'gmc'), true);
  assert.equal(isPacketFilename('data/known-issue-gmc-proposals-2026-08-05.json', 'gmc'), false);
  assert.equal(isPacketFilename('data/known-issue-chevrolet-adjudication-2026-08-05.json', 'gmc'), false);
});

test('derives a missing packet total from exact rows and rejects a contradictory total', () => {
  assert.equal(packetSummary({ summary: { holdCount: 2 }, rows: [{ id: 'a' }, { id: 'b' }] }).total, 2);
  assert.throws(
    () => packetSummary({ summary: { total: 3 }, rows: [{ id: 'a' }, { id: 'b' }] }),
    /summary total does not equal packet rows/,
  );
});

test('excludes explicitly named apply candidates and rejects unknown exclusions', () => {
  const rows = [
    { id: 'safe', action: 'retain' },
    { id: 'commerce-review-needed', action: 'retain' },
    { id: 'hold', action: 'hold' },
  ];
  assert.deepEqual(
    selectWrites(rows, new Set(['retain']), new Set(['commerce-review-needed'])).map((row) => row.id),
    ['safe'],
  );
  assert.throws(
    () => selectWrites(rows, new Set(['retain']), new Set(['hold'])),
    /not apply candidates/,
  );
});

test('derives omitted changedFields but rejects a contradictory declared list', () => {
  const { row } = fixture();
  delete row.changedFields;
  assert.ok(normalizedChangedFields(row).includes('description'));
  row.changedFields = ['solution'];
  assert.throws(() => normalizedChangedFields(row), /changedFields mismatch/);
});
