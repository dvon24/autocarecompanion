import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import {
  buildReviewedRetailerCandidates,
  rebindPreservedProposalLinks,
  resolveProposalLinks,
} from './build-known-issue-part-links';

test('exact links attach to the staged part while repair role remains unapproved', async () => {
  const input = [{
    proposalId: 'issue--pump--5-7', id: 'issue', articleScope: { make: 'Dodge', model: 'Challenger' },
    parts: [{ component: 'Water Pump', supplier: 'Gates', aftermarketXref: ['43526'], fitment: { years: [2017], engines: ['5.7L'], trims: ['R/T'] }, buyLinks: [], verified: false }],
  }];
  const result = await resolveProposalLinks(input, async () => [{
    vendor: 'eBay',
    url: 'https://www.ebay.com/itm/123456789012',
    via: 'test',
    matchedPartNumber: '43526',
    productId: '123456789012',
    listingTitleHash: createHash('sha256').update('Gates 43526 Engine Water Pump').digest('hex'),
    observedListingTitle: 'Gates 43526 Engine Water Pump',
    matchedPartNumberSource: 'listing-title',
    observedPartNumberField: 'title',
    observedPartNumberValue: 'Gates 43526 Engine Water Pump',
  }]);
  assert.equal(result.proposals[0]!.parts[0]!.verified, false);
  assert.equal(result.proposals[0]!.parts[0]!.buyLinks?.[0]?.linkType, 'product');
  assert.equal((result.evidence[0] as { result: string }).result, 'exact-product-link');
});

test('a resolver miss stays an explicit hold and never creates a search link', async () => {
  const input = [{ id: 'issue', parts: [{ component: 'Pump', supplier: 'Gates', aftermarketXref: ['43526'], buyLinks: [], verified: false }] }];
  const result = await resolveProposalLinks(input, async () => []);
  assert.deepEqual(result.proposals[0]!.parts[0]!.buyLinks, []);
  assert.equal((result.evidence[0] as { result: string }).result, 'no-exact-product-link');
});

test('preserved exact links survive only when the proposal part identity is unchanged', () => {
  const current = [{
    proposalId: 'issue--pump', id: 'issue', articleScope: { make: 'Acura', model: 'RL' },
    parts: [{ component: 'Water Pump', supplier: 'Dayco', aftermarketXref: ['WP279K1A'], fitment: { years: [1996] }, buyLinks: [], verified: false }],
  }];
  const previous = structuredClone(current);
  previous[0]!.parts[0]!.buyLinks = [{ vendor: 'Advance Auto Parts', url: 'https://shop.advanceautoparts.com/p/dayco-wp279k1a/10023778-P' } as never];
  const kept = rebindPreservedProposalLinks(current, previous);
  assert.equal(kept.proposals[0]!.parts[0]!.buyLinks?.length, 1);
  assert.equal((kept.evidence[0] as { result: string }).result, 'exact-product-link');

  previous[0]!.parts[0]!.aftermarketXref = ['WRONG'];
  const dropped = rebindPreservedProposalLinks(current, previous);
  assert.deepEqual(dropped.proposals[0]!.parts[0]!.buyLinks, []);
  assert.equal((dropped.evidence[0] as { result: string }).result, 'no-exact-product-link');
});

test('reviewed retailer candidates contain only exact product-link evidence', () => {
  const link = {
    vendor: 'eBay',
    url: 'https://www.ebay.com/itm/123456789012',
    linkType: 'product' as const,
    verified: true,
    via: 'test',
    productIdentity: {
      matchedPartNumber: '43526',
      productId: '123456789012',
      listingTitleHash: createHash('sha256').update('Gates 43526 Engine Water Pump').digest('hex'),
      observedListingTitle: 'Gates 43526 Engine Water Pump',
      matchedPartNumberSource: 'listing-title' as const,
      observedPartNumberField: 'title',
      observedPartNumberValue: 'Gates 43526 Engine Water Pump',
    },
  };
  const result = buildReviewedRetailerCandidates('BMW', [
    { proposalId: 'p1', issueId: 'i1', partIndex: 0, input: { partNumber: '43526', supplier: 'Gates', component: 'Water Pump' }, result: 'exact-product-link', links: [link] },
    { proposalId: 'p2', issueId: 'i2', partIndex: 0, input: { partNumber: 'NOPE', supplier: 'Gates', component: 'Water Pump' }, result: 'no-exact-product-link', links: [] },
  ]);
  assert.equal(result.selectedCandidateCount, 1);
  assert.equal(result.candidates[0]?.partNumber, '43526');
  assert.equal(result.candidates[0]?.links[0]?.url, link.url);
});
