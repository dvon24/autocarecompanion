import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { mergeReviewedRetailerLinks } from './merge-reviewed-retailer-links';

function fixture() {
  const input = {
    partNumber: 'WP279K1A', supplier: 'Dayco', component: 'Water pump',
    make: 'Acura', model: 'RL', year: 1996, engine: '3.5L V6 C35A',
  };
  return {
    proposals: [{
      proposalId: 'rl-water-pump', id: 'acura-rl', articleScope: { make: 'Acura', model: 'RL' },
      parts: [{
        component: 'Water pump', supplier: 'Dayco', aftermarketXref: ['WP279K1A'],
        fitment: { years: [1996, 1997], engines: ['3.5L V6 C35A'] }, buyLinks: [],
      }],
    }],
    linkEvidence: [{ proposalId: 'rl-water-pump', issueId: 'acura-rl', partIndex: 0, input, result: 'no-exact-product-link' as const, links: [] }],
  };
}

const title = 'Dayco Water Pump Kit With Components And Belt, Dayco WP279K1A - Advance Auto Parts';
const reviewed = [{
  proposalId: 'rl-water-pump', partIndex: 0,
  candidate: {
    vendor: 'Advance Auto Parts',
    url: 'https://shop.advanceautoparts.com/p/dayco-water-pump-kit-with-components-and-belt-dayco-wp279k1a/10023778-P',
    via: 'manual-retailer-page-review',
    matchedPartNumber: 'WP279K1A',
    productId: '10023778-P',
    listingTitleHash: createHash('sha256').update(title).digest('hex'),
    observedListingTitle: title,
    matchedPartNumberSource: 'item-specifics' as const,
    observedPartNumberField: 'Part No.',
    observedPartNumberValue: 'WP279K1A',
  },
}];

function ebayReviewed(itemId = '123456789012') {
  const ebayTitle = 'Dayco WP279K1A Water Pump Timing Belt Kit';
  return {
    proposalId: 'rl-water-pump', partIndex: 0,
    candidate: {
      vendor: 'eBay',
      url: `https://www.ebay.com/itm/${itemId}`,
      via: 'eBay Browse exact listing PN',
      matchedPartNumber: 'WP279K1A',
      productId: itemId,
      listingTitleHash: createHash('sha256').update(ebayTitle).digest('hex'),
      observedListingTitle: ebayTitle,
      matchedPartNumberSource: 'listing-title' as const,
      observedPartNumberField: 'title',
      observedPartNumberValue: ebayTitle,
    },
  };
}

test('merges an exact reviewed retailer page while retaining non-affiliate status', async () => {
  const output = await mergeReviewedRetailerLinks(fixture(), reviewed);
  const link = output.proposals[0]!.parts[0]!.buyLinks![0] as { vendor: string; url: string };
  assert.equal(link.vendor, 'Advance Auto Parts');
  assert.match(link.url, /advanceautoparts\.com\/p\//);
  assert.equal(output.linkEvidence[0]!.result, 'exact-product-link');
});

test('rejects a retailer page for a different part number', async () => {
  const wrong = structuredClone(reviewed);
  wrong[0]!.candidate.matchedPartNumber = 'WP193K1B';
  await assert.rejects(() => mergeReviewedRetailerLinks(fixture(), wrong), /does not match/);
});

test('keeps a safe direct-retailer link and adds one vendor-distinct eBay alternate', async () => {
  const stage = fixture() as unknown as Parameters<typeof mergeReviewedRetailerLinks>[0];
  const direct = (await mergeReviewedRetailerLinks(stage, reviewed)).proposals[0]!.parts[0]!.buyLinks![0]!;
  stage.proposals[0]!.parts[0]!.buyLinks = [direct];
  stage.linkEvidence[0]!.result = 'exact-product-link';
  stage.linkEvidence[0]!.links = [direct];

  const output = await mergeReviewedRetailerLinks(stage, [ebayReviewed()]);
  assert.deepEqual(
    output.proposals[0]!.parts[0]!.buyLinks!.map((link) => link.vendor),
    ['Advance Auto Parts', 'eBay'],
  );
  assert.equal(output.proposals[0]!.parts[0]!.buyLinks!.length, 2);
  assert.equal(output.linkEvidence[0]!.links.length, 2);
});

test('deduplicates repeated merchants and never emits more than two links', async () => {
  const output = await mergeReviewedRetailerLinks(fixture(), [
    ...reviewed,
    ebayReviewed('123456789012'),
    ebayReviewed('999999999999'),
  ]);
  assert.deepEqual(
    output.proposals[0]!.parts[0]!.buyLinks!.map((link) => link.vendor),
    ['Advance Auto Parts', 'eBay'],
  );
});
