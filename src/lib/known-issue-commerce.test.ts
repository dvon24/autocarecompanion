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

test('rejects marketplace labels that merely contain the marketplace name', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{
      component: 'Tensioner',
      verified: true,
      buyLinks: [{ vendor: 'Not Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', verified: true }],
    }]),
  );
  assert.deepEqual(fixParts[0]!.buyLinks, []);
});

test('rejects local-only retailer hosts and substring-lookalike merchants', () => {
  for (const buyLink of [
    { vendor: 'router', url: 'https://router.lan/product/part-1234', verified: true },
    { vendor: 'shop', url: 'https://shop.home/product/part-1234', verified: true },
    { vendor: 'BMW', url: 'https://notbmwparts.com/product/widget-1234', verified: true },
    { vendor: 'BMW', url: 'https://bmw.evil.com/product/widget-1234', verified: true },
    { vendor: 'BMW', url: 'https://bmwmalware.com/product/ABC1234', verified: true },
    { vendor: 'Ford', url: 'https://fordscam.com/product/ABC1234', verified: true },
    { vendor: 'Bosch', url: 'https://boschfraud.example/product/ABC1234', verified: true },
    { vendor: 'shop', url: 'https://shop.home../product/part-1234', verified: true },
    { vendor: 'shop', url: 'https://shop.localdomain/product/part-1234', verified: true },
    { vendor: 'shop', url: 'https://shop.home.arpa/product/part-1234', verified: true },
  ]) {
    const { fixParts } = getKnownIssueCommerce(
      issue([{ component: 'Tensioner', verified: true, buyLinks: [buyLink] }]),
    );
    assert.deepEqual(fixParts[0]!.buyLinks, [], buyLink.url);
  }
});

test('renders an allowlisted ECS product-detail URL that lacks the generic path shape', () => {
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
  assert.equal(fixParts[0]!.buyLinks.length, 1);
});

test('normalizes punctuation in a direct retailer host before matching its vendor label', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{
      component: 'Charge pipe',
      verified: true,
      buyLinks: [{
        vendor: 'VR Speed',
        url: 'https://www.vr-speed.com/product/vrsf-chargepipe-upgrade-07-13-bmw-135i-335i-n54-n55',
        verified: true,
      }],
    }]),
  );
  assert.equal(fixParts[0]!.buyLinks.length, 1);
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
    'https://www.jbtools.com/promaxx-dodge-hemi-5-7l-v8-and-6-1l-repair-broken-exhaust-bolts-pmxa200prop/',
    'https://www.jbtools.com/promaxx-dodge-ram-6-4l-hemi-exhaust-manifold-bolt-repair-prokit-pmxcd200pro/',
    'https://www.americanmuscle.com/the-driveshaft-shop-challenger-4-inch-aluminum-one-piece-driveshaft-chsh40-a.html',
    'https://www.americanmuscle.com/the-driveshaft-shop-challenger-4-inch-aluminum-one-piece-driveshaft-chsh37-a.html',
    'https://highhorseperformance.com/the-driveshaft-shop-chsh36-a-1-piece-4-aluminum-driveshaft-for-15-23-demon-challenger-srt-hellcat-redeye-6-2l-hemi-automatic/',
    'https://www.bimmerworld.com/Cooling/Radiators/E36-3-Series-Cooling-System-Overhaul-Kit-Stage-III.html',
    'https://www.endera.de/abs-steuergeraet-reparatur-bosch-5-7-bmw-e46.html',
    'https://www.bmwgm5.com/GM5_Repair_Service.htm',
    'https://www.turnermotorsport.com/p-570740-valve-seal-repair-kit/',
    'https://agatools.com/collections/n62-valve-stem-seal-tool-kit/products/aga-n62-vst-k-vk',
    'https://www.bavlogic.com/?product=bmw-cic-repair-service-with-one-year-warranty',
    'https://parts.bmwoforlandpark.com/p/BMW__iX/Original-BMW-AGM-battery-60-AH/43776515/61217604802.html',
    'https://kingenginebuilders.com/cr6877xpc',
    'https://www.ecstuning.com/b-genuine-bmw-parts/water-pump/11517846361/',
    'https://store.vacmotorsports.com/vac-motorsports-aluminum-differential-mount-kit-bmw-e90e92e93-m3-p2217.aspx',
    'https://www.mannfiltersrus.com/mann-hu6022z-oil-filter-element-metal-free.html',
    'https://parts.bmwofsouthatlanta.com/oem-parts/bmw-convertible-top-hydraulic-pump-54377344440',
    'https://www.blackstone-labs.com/free-test-kits/',
    'https://www.rwcarbon.com/bmw-f97-x3m-f98-x4m-aluminum-oil-cooler-guard.html',
    'https://shop.bimmerbum.com/5-00691-genuine-bmw-replacement-blower-motor-resistor-z3-64116912633/',
  ]) {
    assert.equal(isKnownIssueProductUrl(url), true, `should accept ${url}`);
  }
});

test('allowlisting a host does not allowlist its category, search or lookalike URLs', () => {
  for (const url of [
    'https://www.summitracing.com/search/part-type/intake-manifold-gaskets',
    'https://www.summitracing.com/parts/brakes',
    'https://www.zoro.com/search?q=water+pump',
    'https://partshawk.com/catalog/water-pumps',
    'https://www.densoproducts.com/collections/condensers',
    'https://www.partcatalog.com/',
    'https://www.raybestospowertrain.com/automatic-transmission/clutch-packs',
    'https://www.jbtools.com/search.php?search_query=promaxx',
    'https://www.jbtools.com/shop-all/',
    'https://www.americanmuscle.com/2008-challenger-driveshafts.html',
    'https://highhorseperformance.com/drivetrain/',
    'https://www.bimmerworld.com/Cooling/',
    'https://www.endera.de/',
    'https://www.bmwgm5.com/',
    'https://www.turnermotorsport.com/',
    'https://agatools.com/collections/n62-valve-stem-seal-tool-kit/',
    'https://www.bavlogic.com/',
    'https://www.bavlogic.com/?product=anything',
    'https://parts.bmwoforlandpark.com/',
    'https://kingenginebuilders.com/',
    'https://www.ecstuning.com/b-genuine-bmw-parts/',
    'https://store.vacmotorsports.com/',
    'https://www.mannfiltersrus.com/',
    'https://parts.bmwofsouthatlanta.com/oem-parts/',
    'https://www.blackstone-labs.com/',
    'https://www.rwcarbon.com/',
    'https://shop.bimmerbum.com/',
    // A lookalike domain must not inherit the allowlist.
    'https://partshawk.evil.com/delphi-ss10867-abs-wheel-speed-sensor.html',
    // http is refused on every host, allowlisted or not.
    'http://partshawk.com/delphi-ss10867-abs-wheel-speed-sensor.html',
  ]) {
    assert.equal(isKnownIssueProductUrl(url), false, `should reject ${url}`);
  }
});

test('renders the verified ProMAXX Alan and Chad JB Tools buy links', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{
      component: 'HEMI exhaust-manifold bolt extraction tools',
      verified: true,
      buyLinks: [
        {
          vendor: 'jbtools',
          url: 'https://www.jbtools.com/promaxx-dodge-hemi-5-7l-v8-and-6-1l-repair-broken-exhaust-bolts-pmxa200prop/',
          verified: true,
        },
        {
          vendor: 'jbtools',
          url: 'https://www.jbtools.com/promaxx-dodge-ram-6-4l-hemi-exhaust-manifold-bolt-repair-prokit-pmxcd200pro/',
          verified: true,
        },
      ],
    }]),
  );
  assert.equal(fixParts[0]!.buyLinks.length, 2);
});

test('renders the three verified DSS Challenger driveshaft branches', () => {
  const { fixParts } = getKnownIssueCommerce(
    issue([{
      component: 'DSS Challenger driveshaft branches',
      verified: true,
      buyLinks: [
        {
          vendor: 'americanmuscle',
          url: 'https://www.americanmuscle.com/the-driveshaft-shop-challenger-4-inch-aluminum-one-piece-driveshaft-chsh40-a.html',
          verified: true,
        },
        {
          vendor: 'americanmuscle',
          url: 'https://www.americanmuscle.com/the-driveshaft-shop-challenger-4-inch-aluminum-one-piece-driveshaft-chsh37-a.html',
          verified: true,
        },
        {
          vendor: 'highhorseperformance',
          url: 'https://highhorseperformance.com/the-driveshaft-shop-chsh36-a-1-piece-4-aluminum-driveshaft-for-15-23-demon-challenger-srt-hellcat-redeye-6-2l-hemi-automatic/',
          verified: true,
        },
      ],
    }]),
  );
  assert.equal(fixParts[0]!.buyLinks.length, 3);
});
