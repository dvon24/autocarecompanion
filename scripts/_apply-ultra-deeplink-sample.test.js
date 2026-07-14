/* eslint-disable @typescript-eslint/no-require-imports -- Tests exercise the CommonJS apply script. */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  afterErrors,
  buildAfter,
  evaluateRows,
  hashValue,
  isIsoDate,
  productUrlError,
  resultArtifactErrors,
  validateManifest,
  vendorMatchesUrl,
} = require('./_apply-ultra-deeplink-sample');

function fixture() {
  const community = [
    { type: 'tip', content: 'Keep this tip' },
    { type: 'part', content: 'Remove this part', clickCount: 2, affiliateUrl: 'https://www.amazon.com/s?k=wrong' },
  ];
  const fixParts = [{ component: 'Old', buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/s?k=old' }] }];
  const afterFixParts = [{
    component: 'Exact',
    oemPartNumber: 'PN1',
    buyLinks: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/123', linkType: 'product', verified: true }],
  }];
  const row = {
    id: 'issue-1',
    description: 'Old description',
    communityRecommendations: community,
    fixParts,
    contentUpdatedOn: '',
    contentUpdateSummary: '',
  };
  const issue = {
    id: 'issue-1',
    before: {
      communityHash: hashValue(community),
      fixPartsHash: hashValue(fixParts),
      descriptionHash: hashValue(row.description),
      recommendationCount: 2,
      partRecommendationCount: 1,
      partClicks: 2,
      fixPartCount: 1,
      buyLinkCount: 1,
      contentUpdatedOn: '',
      contentUpdateSummary: '',
    },
    after: {
      communityHash: hashValue([community[0]]),
      retainedRecommendationCount: 1,
      fixParts: afterFixParts,
      description: 'New description',
      contentUpdatedOn: '2026-07-14',
      contentUpdateSummary: 'Corrected the part.',
    },
  };
  const manifest = {
    schemaVersion: 1,
    batchId: 'test-batch',
    baseline: {
      issueCount: 1,
      partRecommendationsRemoved: 1,
      priorClicks: 2,
      existingFixPartTransitions: 1,
      searchBuyLinksRemoved: 1,
      directProductLinksAdded: 1,
      nonPartRecommendationsRetained: 1,
    },
    issues: [issue],
  };
  return { row, issue, manifest };
}

test('date-only validation rejects normalized and malformed dates', () => {
  assert.equal(isIsoDate('2026-07-14'), true);
  assert.equal(isIsoDate('2026-02-30'), false);
  assert.equal(isIsoDate('07/14/2026'), false);
});

test('transform removes commerce, preserves tips, and sets exact after-state', () => {
  const { row, issue } = fixture();
  const after = buildAfter(row, issue);
  assert.deepEqual(after.communityRecommendations, [{ type: 'tip', content: 'Keep this tip' }]);
  assert.deepEqual(after.fixParts, issue.after.fixParts);
  assert.equal(after.description, 'New description');
  assert.equal(after.contentUpdatedOn, '2026-07-14');
  assert.deepEqual(afterErrors(after, issue), []);
});

test('state evaluation recognizes baseline and idempotent after-state', () => {
  const { row, issue, manifest } = fixture();
  assert.equal(evaluateRows([row], manifest).state, 'before');
  const after = buildAfter(row, issue);
  assert.equal(evaluateRows([after], manifest).state, 'after');
  assert.deepEqual(buildAfter(after, issue), after);
});

test('any unexpected field drift fails closed', () => {
  const { row, manifest } = fixture();
  const drifted = { ...row, communityRecommendations: [{ type: 'tip', content: 'Newer edit' }] };
  const evaluation = evaluateRows([drifted], manifest);
  assert.equal(evaluation.state, 'drift');
  assert.match(evaluation.drift[0], /communityRecommendations hash/);
});

test('a mixed baseline/after batch is drift, never a partial apply', () => {
  const first = fixture();
  const second = fixture();
  second.row.id = 'issue-2';
  second.issue.id = 'issue-2';
  const manifest = { ...first.manifest, baseline: { ...first.manifest.baseline, issueCount: 2 }, issues: [first.issue, second.issue] };
  const evaluation = evaluateRows([first.row, buildAfter(second.row, second.issue)], manifest);
  assert.equal(evaluation.state, 'drift');
  assert.deepEqual(evaluation.drift, ['mixed before/after state']);
});

test('manifest validation rejects search URLs masquerading as products', () => {
  const { manifest } = fixture();
  assert.deepEqual(validateManifest(manifest), []);
  manifest.issues[0].after.fixParts[0].buyLinks[0].url = 'https://www.ebay.com/sch/i.html?_nkw=PN1';
  assert.ok(validateManifest(manifest).some((error) => /search URL/.test(error)));
});

test('product URL validation rejects malformed and alternate search routes', () => {
  assert.match(productUrlError('https://'), /invalid/);
  assert.match(productUrlError('https://www.amazon.com/gp/search?keywords=PN1'), /search URL/);
  assert.match(productUrlError('https://parts.example.com/search-results/PN1'), /search URL/);
  assert.equal(productUrlError('https://www.ebay.com/itm/123'), null);
  assert.equal(productUrlError('https://www.wheelerfleet.com/product/motor-p-window/1349803'), null);
});

test('vendor validation rejects marketplace mislabeling', () => {
  assert.equal(vendorMatchesUrl('eBay', 'https://www.ebay.com/itm/123'), true);
  assert.equal(vendorMatchesUrl('Amazon', 'https://www.ebay.com/itm/123'), false);
  assert.equal(vendorMatchesUrl('WheelerFleet', 'https://www.wheelerfleet.com/product/motor-p-window/1349803'), true);
});

test('manifest validation reports a missing baseline instead of throwing', () => {
  assert.deepEqual(validateManifest({ schemaVersion: 1, issues: [] }), ['baseline must be an object']);
});

test('result artifact validation detects after-state drift', () => {
  const { row, issue, manifest } = fixture();
  const after = buildAfter(row, issue);
  const afterSnapshot = {
    description: after.description,
    communityRecommendations: after.communityRecommendations,
    fixParts: after.fixParts,
    contentUpdatedOn: after.contentUpdatedOn,
    contentUpdateSummary: after.contentUpdateSummary,
  };
  const result = {
    schemaVersion: 1,
    batchId: manifest.batchId,
    status: 'applied-and-verified',
    completedAt: '2026-07-14T18:13:25.793Z',
    counts: {
      state: 'applied',
      issueCount: 1,
      notices: 1,
      partRecommendationsRemoved: 1,
      existingFixPartTransitions: 1,
      searchBuyLinksRemoved: 1,
      directProductLinksAdded: 1,
    },
    issues: [{ id: issue.id, decision: issue.decision, evidence: issue.evidence, before: {}, after: afterSnapshot }],
  };
  assert.deepEqual(resultArtifactErrors(result, manifest, [after]), []);
  result.issues[0].after.contentUpdateSummary = 'Stale result';
  assert.ok(resultArtifactErrors(result, manifest, [after]).some((error) => /after snapshot/.test(error)));
});
