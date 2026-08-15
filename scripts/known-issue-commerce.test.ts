import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getKnownIssueCommerce,
  hasKnownIssueCommerce,
  isKnownIssueProductUrl,
  knownIssueAffiliateUrl,
  vendorMatchesProductUrl,
} from '../src/lib/known-issue-commerce';

test('accepts product-detail URLs and rejects marketplace searches', () => {
  assert.equal(isKnownIssueProductUrl('https://www.amazon.com/dp/B0ABC12345?tag=au7o-20'), true);
  assert.equal(isKnownIssueProductUrl('https://www.amazon.com/gp/product/B0ABC12345'), true);
  assert.equal(isKnownIssueProductUrl('https://www.amazon.com/s?k=11340029751&tag=au7o-20'), false);
  assert.equal(isKnownIssueProductUrl('https://amazon.com.evil.example/dp/B0ABC12345'), false);
  assert.equal(isKnownIssueProductUrl('http://www.amazon.com/dp/B0ABC12345'), false);

  assert.equal(isKnownIssueProductUrl('https://www.ebay.com/itm/277072199375'), true);
  assert.equal(isKnownIssueProductUrl('https://www.ebay.com/itm/Genuine-BMW-Part/277072199375'), true);
  assert.equal(isKnownIssueProductUrl('https://www.ebay.com/sch/i.html?_nkw=11340029751'), false);

  assert.equal(isKnownIssueProductUrl('https://www.rockauto.com/en/partsearch/?q=11340029751'), false);
  assert.equal(isKnownIssueProductUrl('https://www.bmwpartsdeal.com/parts/bmw-repair_kit_valve_seal_ring-11340029751.html'), true);
  assert.equal(isKnownIssueProductUrl('https://www.fcpeuro.com/products/bmw-valve-seal-kit-11340029751'), true);
  assert.equal(isKnownIssueProductUrl('https://www.mishimoto.com/dodge-challenger-aluminum-radiator-2009-2016.html'), true);
  assert.equal(vendorMatchesProductUrl('Mishimoto', 'https://www.mishimoto.com/dodge-challenger-aluminum-radiator-2009-2016.html'), true);
  assert.equal(isKnownIssueProductUrl('https://www.mishimoto.com/collections/radiators'), false);
  assert.equal(isKnownIssueProductUrl('https://www.moparpartsgiant.com/parts/mopar-radiator-engine-cooling~68050126ab.html'), true);
  assert.equal(vendorMatchesProductUrl('Mopar Parts Giant', 'https://www.moparpartsgiant.com/parts/mopar-radiator-engine-cooling~68050126ab.html'), true);
  assert.equal(isKnownIssueProductUrl('https://www.acurapartswarehouse.com/oem/acura~belt~timing~125ru26~unitta~14400-p7j-004.html'), true);
  assert.equal(vendorMatchesProductUrl('Acura Parts Warehouse', 'https://www.acurapartswarehouse.com/oem/acura~belt~timing~125ru26~unitta~14400-p7j-004.html'), true);
  assert.equal(isKnownIssueProductUrl('https://www.acurapartswarehouse.com/oem/acura~integra~2000.html'), false);
  assert.equal(isKnownIssueProductUrl('https://www.acurapartswarehouse.com/oem/acura~tlx~2021~parts.html'), false);
  assert.equal(isKnownIssueProductUrl('https://www.partsgeek.com/6rf5vft-acura-integra-wheel-hub-assembly.html'), true);
  assert.equal(vendorMatchesProductUrl('PartsGeek', 'https://www.partsgeek.com/6rf5vft-acura-integra-wheel-hub-assembly.html'), true);
  assert.equal(isKnownIssueProductUrl('https://www.partsgeek.com/catalog/acura/integra/driveshaft_-ar-_axle/wheel_hub.html'), false);
  assert.equal(isKnownIssueProductUrl('https://store.ross-tech.com/shop/vchv2_ent/'), true);
  assert.equal(vendorMatchesProductUrl('Ross-Tech', 'https://store.ross-tech.com/shop/vchv2_ent/'), true);
  assert.equal(isKnownIssueProductUrl('https://retailer.example/search?q=11340029751'), false);
  assert.equal(isKnownIssueProductUrl('https://retailer.example/parts'), false);
  assert.equal(isKnownIssueProductUrl('https://retailer.example/parts/brakes'), false);
  assert.equal(isKnownIssueProductUrl('https://retailer.example/category/brakes/11340029751'), false);
  assert.equal(isKnownIssueProductUrl('https://retailer.example/search%2Fbrakes-11340029751'), false);
  assert.equal(isKnownIssueProductUrl('https://retailer.example/parts/11340029751?s=brakes'), false);
  assert.equal(isKnownIssueProductUrl('https://retailer.example/orders/11340029751'), false);
  assert.equal(isKnownIssueProductUrl('https://www.autopartsprime.com/p/2008-acura-tl-dash-panels'), false);
  assert.equal(isKnownIssueProductUrl('https://retailer.com/product/2008-acura-tl-water-pump-WP1234'), true);
  assert.equal(isKnownIssueProductUrl('https://127.0.0.1/product/11340029751'), false);
  assert.equal(isKnownIssueProductUrl('https://parts.internal/product/11340029751'), false);
  assert.equal(isKnownIssueProductUrl('javascript:alert(1)'), false);
});

test('exposes commerce only from fixParts and keeps owner guidance text-only', () => {
  const result = getKnownIssueCommerce({
    fixParts: [
      {
        component: 'N62 valve-stem seal kit',
        oemPartNumber: '11340029751',
        aftermarketXref: [],
        note: '',
        variants: [],
        verified: true,
        buyLinks: [
          { vendor: 'eBay', url: 'https://www.ebay.com/itm/277072199375', verified: true },
          { vendor: 'FCP Euro', url: 'https://www.fcpeuro.com/products/bmw-valve-seal-kit-11340029751', verified: true },
          { vendor: 'Unrelated Store', url: 'https://www.fcpeuro.com/products/bmw-valve-seal-kit-11340029751', verified: true },
          { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=11340029751&tag=au7o-20', verified: true },
          { vendor: 'RockAuto', url: 'https://www.rockauto.com/en/partsearch/?q=11340029751', verified: true },
        ],
      },
    ],
    communityRecommendations: [
      {
        type: 'part',
        content: 'High-quality synthetic oil helps reduce consumption.',
        partBrand: 'Mobil 1',
        partName: 'Extended Performance Full Synthetic Motor Oil',
        affiliateUrl: 'https://www.amazon.com/s?k=BMW+X5+Mobil+1&tag=au7o-20',
        upvotes: 0,
      },
      {
        type: 'tip',
        content: 'Check the oil level regularly while diagnosis is pending.',
        partBrand: 'Mobil 1',
        partNumber: '0W-40',
        affiliateUrl: 'https://www.amazon.com/s?k=oil&tag=au7o-20',
        affiliateLink: 'https://www.ebay.com/sch/i.html?_nkw=oil',
        amazonLink: 'https://www.amazon.com/s?k=oil',
        upvotes: 0,
      },
      {
        type: 'warning',
        content: 'Confirm the N62 engine and VIN before ordering.',
        upvotes: 0,
      },
    ],
  });

  assert.deepEqual(result.fixParts[0].buyLinks, [
    { vendor: 'FCP Euro', url: 'https://www.fcpeuro.com/products/bmw-valve-seal-kit-11340029751', verified: true },
    { vendor: 'eBay', url: 'https://www.ebay.com/itm/277072199375', verified: true },
  ]);
  assert.deepEqual(result.ownerGuidance, [
    { type: 'tip', content: 'Check the oil level regularly while diagnosis is pending.' },
    { type: 'warning', content: 'Confirm the N62 engine and VIN before ordering.' },
  ]);
  assert.equal(result.suppressedCommunityPartCount, 1);
  assert.equal(hasKnownIssueCommerce(result.fixParts), true);
  assert.equal('affiliateUrl' in result.ownerGuidance[0], false);
  assert.equal('affiliateLink' in result.ownerGuidance[0], false);
  assert.equal('amazonLink' in result.ownerGuidance[0], false);
  assert.equal('partNumber' in result.ownerGuidance[0], false);
});

test('prefers one exact direct retailer plus eBay and caps the public choice at two', () => {
  const result = getKnownIssueCommerce({
    fixParts: [{
      component: 'aluminum radiator',
      oemPartNumber: null,
      aftermarketXref: ['MMRAD-SRT-09'],
      note: '', variants: [], verified: true,
      buyLinks: [
        { vendor: 'Amazon', url: 'https://www.amazon.com/dp/B0ABC12345', verified: true },
        { vendor: 'eBay', url: 'https://www.ebay.com/itm/277072199375', verified: true },
        { vendor: 'Mishimoto', url: 'https://www.mishimoto.com/dodge-challenger-aluminum-radiator-2009-2016.html', verified: true },
        { vendor: 'eBay.com', url: 'https://www.ebay.com/itm/396256904399', verified: true },
      ],
    }],
    communityRecommendations: [],
  });
  assert.deepEqual(result.fixParts[0]!.buyLinks.map((link) => link.vendor), ['Mishimoto', 'eBay']);
});

test('search-only fixParts do not count as public commerce', () => {
  const result = getKnownIssueCommerce({
    fixParts: [
      {
        component: 'unverified part',
        oemPartNumber: null,
        aftermarketXref: [],
        note: '',
        variants: [],
        verified: true,
        buyLinks: [
          { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=unverified+part', verified: true },
        ],
      },
    ],
    communityRecommendations: [],
  });

  assert.equal(result.fixParts[0].buyLinks.length, 0);
  assert.equal(hasKnownIssueCommerce(result.fixParts), false);
});

test('requires audited part and link metadata, vendor consistency, and unique destinations', () => {
  const result = getKnownIssueCommerce({
    fixParts: [
      {
        component: 'legacy unaudited part',
        oemPartNumber: null,
        aftermarketXref: [],
        note: '',
        variants: [],
        buyLinks: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/277072199375', verified: true }],
      },
      {
        component: 'audited water pump',
        oemPartNumber: null,
        aftermarketXref: [],
        note: '',
        variants: [],
        verified: true,
        buyLinks: [
          { vendor: 'Amazon', url: 'https://www.ebay.com/itm/396256904399', verified: true },
          { vendor: 'eBay', url: 'https://www.ebay.com/itm/396256904399' },
          { vendor: 'eBay', url: 'https://www.ebay.com/itm/396256904399', verified: true },
          { vendor: 'eBay', url: 'https://www.ebay.com/itm/396256904399', verified: true },
        ],
      },
    ],
    communityRecommendations: [],
  });

  assert.equal(result.fixParts.length, 1);
  assert.deepEqual(result.fixParts[0].buyLinks, [
    { vendor: 'eBay', url: 'https://www.ebay.com/itm/396256904399', verified: true },
  ]);
});

test('recall-first parts never expose retail links', () => {
  const result = getKnownIssueCommerce({
    fixParts: [
      {
        component: 'recalled component',
        oemPartNumber: null,
        aftermarketXref: [],
        note: '',
        variants: [],
        verified: true,
        recallFirst: true,
        buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B0ABC12345', verified: true }],
      },
      {
        component: 'related hardware',
        oemPartNumber: null,
        aftermarketXref: [],
        note: '',
        variants: [],
        verified: true,
        buyLinks: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/396256904399', verified: true }],
      },
    ],
    communityRecommendations: [],
  });

  assert.equal(result.fixParts.length, 2);
  assert.equal(result.fixParts.every((part) => part.buyLinks.length === 0), true);
  assert.equal(hasKnownIssueCommerce(result.fixParts), false);
});

test('normalizes owned Amazon attribution after URL validation', () => {
  assert.equal(
    knownIssueAffiliateUrl('https://www.amazon.com/dp/B0ABC12345?tag=someone-else'),
    'https://www.amazon.com/dp/B0ABC12345?tag=au7o-20',
  );
  assert.equal(
    knownIssueAffiliateUrl('https://www.amazon.com/s?k=water+pump&tag=someone-else'),
    'https://www.amazon.com/s?k=water+pump&tag=someone-else',
  );
});
