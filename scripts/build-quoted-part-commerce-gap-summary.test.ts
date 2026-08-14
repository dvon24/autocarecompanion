import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQuotedPartCommerceGapSummary } from './build-quoted-part-commerce-gap-summary';

test('binds exact candidates to legacy OEM claims and counts invalid search links', () => {
  const summary = buildQuotedPartCommerceGapSummary({
    make: 'Audi', snapshotHash: 'a'.repeat(64), records: [{
      id: 'issue', claims: [{
        claimId: 'fixParts:0', system: 'fixParts', oemPartNumber: '06H 103 495 AK',
        links: [
          { field: 'buyLinks:0', url: 'https://amazon.example/search', error: 'search query parameter k' },
          { field: 'buyLinks:1', url: 'https://ebay.example/item' },
        ],
      }],
    }],
  }, {
    linkEvidence: [{ issueId: 'issue', result: 'exact-product-link', input: { partNumber: '06H103495AK' } }],
  }, {
    decisions: [{ issueId: 'issue', partNumber: '06H103495AK', verdict: 'hold_manual_fitment_confirmation' }],
  });
  assert.equal(summary.exactIssuePartPairCount, 1);
  assert.equal(summary.matchingLegacyClaimCount, 1);
  assert.equal(summary.matchingClaimsWithInvalidLinks, 1);
  assert.equal(summary.invalidLegacyLinkCount, 1);
  assert.equal(summary.heldCandidateCount, 1);
  assert.equal(summary.approvedReplacementCount, 0);
});

test('counts reviewed-fitment approvals', () => {
  const summary = buildQuotedPartCommerceGapSummary({ records: [] }, { linkEvidence: [] }, {
    decisions: [{ issueId: 'issue', partNumber: 'ABC123', verdict: 'approve_reviewed_fitment' }],
  });
  assert.equal(summary.approvedReplacementCount, 1);
});

test('does not count an exact item belonging to a different issue', () => {
  const summary = buildQuotedPartCommerceGapSummary({
    records: [{ id: 'one', claims: [{ claimId: 'fixParts:0', system: 'fixParts', oemPartNumber: 'ABC123' }] }],
  }, {
    linkEvidence: [{ issueId: 'two', result: 'exact-product-link', input: { partNumber: 'ABC123' } }],
  }, { decisions: [] });
  assert.equal(summary.matchingLegacyClaimCount, 0);
});
