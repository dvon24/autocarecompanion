import assert from 'node:assert/strict';
import test from 'node:test';
import { getKnownIssueCommerce, hasKnownIssueCommerce, isKnownIssueProductUrl } from './known-issue-commerce';

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

test('an unverified recall marker still suppresses verified commerce', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([
      { component: 'Recall repair', recallFirst: true },
      { component: 'Verified retail part', verified: true, buyLinks: [productLink] },
    ]),
  );
  assert.equal(fixParts.length, 1);
  assert.deepEqual(fixParts[0]!.buyLinks, []);
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

/**
 * The named-retailer allowlist. These hosts publish real product detail pages
 * whose paths do not carry a /product|part|item/ segment, so the generic rule
 * rejected them: 2 of 14 parts in a link-audit run were lost this way, one of
 * them (Denso 477-0771) with a live page on the manufacturer's own site.
 *
 * The pairs below matter more than the accepts: an allowlisted HOST must not
 * become an allowlisted DOMAIN. Category and search paths on the same hosts,
 * lookalike subdomains, and plain http all still have to fail.
 */
test('accepts verified-retailer product pages the generic path rule misses', () => {
  for (const url of [
    'https://partshawk.com/delphi-ss10867-abs-wheel-speed-sensor.html',
    'https://www.densoproducts.com/denso-477-0771-ac-condenser',
    'https://www.zoro.com/denso-ac-condenser-477-0771-477-0771/i/G5915145/',
    'https://www.partcatalog.com/walker-235-1456-engine-crankshaft-position-sensor.html',
    'https://www.summitracing.com/parts/mah-vs50109',
    'https://www.raybestospowertrain.com/steel-clutch-packs/000601',
  ]) {
    assert.equal(isKnownIssueProductUrl(url), true, `should accept ${url}`);
  }
});

test('allowlisting a host does not allowlist its category, search or lookalike URLs', () => {
  for (const url of [
    'https://www.summitracing.com/search/part-type/intake-manifold-gaskets',
    'https://www.zoro.com/search?q=water+pump',
    'https://partshawk.com/catalog/water-pumps',
    'https://www.densoproducts.com/collections/condensers',
    'https://www.partcatalog.com/',
    'https://www.raybestospowertrain.com/automatic-transmission/clutch-packs',
    // A lookalike domain must not inherit the allowlist.
    'https://partshawk.evil.com/delphi-ss10867-abs-wheel-speed-sensor.html',
    // http is refused on every host, allowlisted or not.
    'http://partshawk.com/delphi-ss10867-abs-wheel-speed-sensor.html',
  ]) {
    assert.equal(isKnownIssueProductUrl(url), false, `should reject ${url}`);
  }
});
