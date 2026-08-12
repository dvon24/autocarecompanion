import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveProposalLinks } from './build-known-issue-part-links';

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
    listingTitleHash: 'a'.repeat(64),
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
