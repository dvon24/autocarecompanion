import assert from 'node:assert/strict';
import test from 'node:test';
import { getKnownIssueCommerce, hasKnownIssueCommerce } from './known-issue-commerce';

type Commerce = Parameters<typeof getKnownIssueCommerce>[0];

/** Minimal issue shaped like a DB row; only the commerce fields matter here. */
function issue(fixParts: unknown[]): Commerce {
  return { fixParts, communityRecommendations: [] } as unknown as Commerce;
}

const productLink = {
  vendor: 'BMW Parts Deal',
  url: 'https://www.bmwpartsdeal.com/parts/bmw-repair_kit_valve_seal_ring-11340054492.html',
  verified: true,
};

test('keeps a verified part whose buy link is a verified product URL', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{ component: 'Timing chain tensioner', verified: true, buyLinks: [productLink] }]),
  );
  assert.equal(fixParts.length, 1);
  assert.equal(fixParts[0]!.buyLinks.length, 1);
  assert.equal(hasKnownIssueCommerce(fixParts), true);
});

test('drops parts that were never verified', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{ component: 'Water pump', buyLinks: [productLink] }]),
  );
  assert.deepEqual(fixParts, []);
});

// The catalog holds ~1,270 of these. They are part-number *searches*, not an
// offer for one exact product, and a wrong PN renders as "No Parts Found".
test('drops RockAuto part-number search URLs even on a verified part', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{
      component: 'Blower motor resistor',
      verified: true,
      buyLinks: [{ vendor: 'RockAuto', url: 'https://www.rockauto.com/en/partsearch/?partnum=68029736AA', verified: true }],
    }]),
  );
  assert.equal(fixParts.length, 1);
  assert.deepEqual(fixParts[0]!.buyLinks, [], 'a search URL must not survive as a buy link');
  assert.equal(hasKnownIssueCommerce(fixParts), false);
});

test('drops an unverified link on an otherwise verified part', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{ component: 'Tensioner', verified: true, buyLinks: [{ ...productLink, verified: false }] }]),
  );
  assert.deepEqual(fixParts[0]!.buyLinks, []);
});

// Selling a repair the owner is entitled to free is the REMOVE-COMMERCE class
// from the Ford audit (open recalls with free dealer remedies).
test('empties buy links on every part when any part is recall-first', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([
      { component: 'Accelerator pedal assembly', verified: true, recallFirst: true, buyLinks: [productLink] },
      { component: 'Pedal stop', verified: true, buyLinks: [productLink] },
    ]),
  );
  assert.equal(fixParts.length, 2);
  for (const part of fixParts) assert.deepEqual(part.buyLinks, []);
});

test('rejects a link whose vendor label does not match the destination host', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{
      component: 'Tensioner',
      verified: true,
      buyLinks: [{ vendor: 'FCP Euro', url: productLink.url, verified: true }],
    }]),
  );
  assert.deepEqual(fixParts[0]!.buyLinks, []);
});

// Documents a known FALSE NEGATIVE, so the behaviour is deliberate rather than
// discovered again later. The guard only accepts a retailer path containing a
// product/part/item/sku segment, so ECS Tuning's category-style product URLs are
// dropped even though they are real, single-product pages. Conservative by
// design — a false negative hides a CTA, a false positive sells the wrong part —
// but it is why a verified Audi tensioner link does not reach the page.
test('drops a real retailer product URL that lacks a product-shaped path segment', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{
      component: 'Timing chain tensioner',
      verified: true,
      buyLinks: [{
        vendor: 'ECS Tuning',
        url: 'https://www.ecstuning.com/b-genuine-volkswagen-audi-parts/tensioner/06e109217am/',
        verified: true,
      }],
    }]),
  );
  assert.deepEqual(fixParts[0]!.buyLinks, [], 'known false negative — see comment');
});
