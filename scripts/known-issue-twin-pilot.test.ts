import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildKnownIssueTwinExplanation,
  filterKnownIssueViewHistory,
  isKnownIssueTwinPilotEnabled,
  issuesAtMileage,
  projectKnownIssueTwinIssues,
  registerDistinctIssueView,
  retainKnownIssueSelection,
} from '../src/lib/known-issue-twin-pilot';
import type { KnownIssue } from '../src/schemas/knownIssue.schema';

function issue(overrides: Partial<KnownIssue> = {}): KnownIssue {
  return {
    id: 'cadillac-xt6-timing-chain-2020',
    vehicleMatch: { years: [2020], make: 'Cadillac', model: 'XT6' },
    category: 'engine',
    title: 'Timing chain concern',
    description: 'The engine timing chain can stretch.',
    solution: 'Inspect timing correlation before repair.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Check engine light'],
    affectedSystems: ['Engine timing'],
    typicalMileage: { low: 100_000, high: 120_000 },
    citations: [],
    humanApproved: true,
    lastReportedByOwners: '2026-08-01',
    reviewedOn: '2026-08-01',
    reportCount: 20,
    status: 'published',
    ...overrides,
  };
}

test('pilot projection accepts only published 2020 Cadillac XT6 records', () => {
  const valid = issue();
  const rows = projectKnownIssueTwinIssues([
    valid,
    issue({ id: 'wrong-year', vehicleMatch: { years: [2021], make: 'Cadillac', model: 'XT6' } }),
    issue({ id: 'wrong-model', vehicleMatch: { years: [2020], make: 'Cadillac', model: 'XT5' } }),
    issue({ id: 'pending', status: 'pending_review' }),
  ]);
  assert.deepEqual(rows.map((row) => row.id), [valid.id]);
  assert.equal(rows[0].hotspot?.id, 'hood');
});

test('only exact issue IDs reviewed in the Twin catalog receive a visual location', () => {
  const rows = projectKnownIssueTwinIssues([
    issue({ id: 'camera', category: 'electrical', title: 'Rear camera image blanks', description: 'The camera display can go black.' }),
    issue({ id: 'roof', category: 'body', title: 'Body seal concern', description: 'A seam may allow water into the cabin.', affectedSystems: [] }),
    issue({ id: 'cadillac-xt6-ptu-leak-2020', category: 'drivetrain', title: 'PTU leak', description: 'The PTU can leak.' }),
  ]);
  assert.equal(rows.find((row) => row.id === 'camera')?.hotspot, null);
  assert.equal(rows.find((row) => row.id === 'roof')?.hotspot, null);
  assert.equal(rows.find((row) => row.id === 'cadillac-xt6-ptu-leak-2020')?.hotspot?.id, 'trans');
});

test('projection exposes only centrally guarded verified commerce links', () => {
  const [row] = projectKnownIssueTwinIssues([issue({
    fixParts: [
      {
        component: 'Verified component',
        oemPartNumber: '12345',
        aftermarketXref: [],
        note: '',
        variants: [],
        verified: true,
        buyLinks: [
          { vendor: 'Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', verified: true, linkType: 'product' },
          { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=timing+chain', verified: true, linkType: 'product' },
          { vendor: 'eBay', url: 'https://www.ebay.com/itm/123456789012', verified: false, linkType: 'product' },
        ],
      },
      {
        component: 'Unverified component',
        oemPartNumber: '99999',
        aftermarketXref: [],
        note: '',
        variants: [],
        verified: false,
        buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', verified: true, linkType: 'product' }],
      },
    ],
  })]);
  assert.equal(row.fixParts.length, 1);
  assert.equal(row.fixParts[0].component, 'Verified component');
  assert.equal(row.fixParts[0].buyLinks.length, 1);
  assert.match(row.fixParts[0].buyLinks[0].url, /tag=au7o-20/);
});

test('projection rejects excluded fitment, resolves a matching variant, and preserves recall warnings', () => {
  const [row] = projectKnownIssueTwinIssues([issue({
    fixParts: [
      {
        component: 'Wrong trim component', oemPartNumber: 'WRONG', aftermarketXref: [], note: '', verified: true,
        fitment: { years: [2020], trims: ['Premium Luxury'] }, variants: [],
        buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', verified: true, linkType: 'product' }],
      },
      {
        component: 'Scoped component', oemPartNumber: 'BASE', aftermarketXref: [], note: '', verified: true, recallFirst: true,
        fitment: { years: [2020], trims: ['Premium Luxury'] },
        variants: [{ scope: '2020 Sport', oemPartNumber: 'SPORT-2020', note: '', fitment: { years: [2020], trims: ['Sport'], engines: ['3.6L V6'] } }],
        buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', verified: true, linkType: 'product' }],
      },
    ],
  })]);
  assert.deepEqual(row.fixParts.map((part) => part.component), ['Scoped component']);
  assert.equal(row.fixParts[0].oemPartNumber, 'SPORT-2020');
  assert.equal(row.fixParts[0].recallFirst, true);
  assert.equal(row.fixParts[0].buyLinks.length, 0, 'recall-first guard suppresses retail destinations');
  assert.equal(row.recallFirst, true);
});

test('a variant part number never inherits the base part destination', () => {
  const [row] = projectKnownIssueTwinIssues([issue({ fixParts: [{
    component: 'Variant component', oemPartNumber: 'BASE', aftermarketXref: [], note: '', verified: true,
    variants: [{ scope: '2020 Sport', oemPartNumber: 'SPORT-2020', note: '', fitment: { years: [2020], trims: ['Sport'], engines: ['3.6L V6'] } }],
    buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', verified: true, linkType: 'product' }],
  }] })]);
  assert.equal(row.fixParts[0].oemPartNumber, 'SPORT-2020');
  assert.equal(row.fixParts[0].buyLinks.length, 0);
});

test('a matched variant with no base part number still cannot inherit the base destination', () => {
  const [row] = projectKnownIssueTwinIssues([issue({ fixParts: [{
    component: 'Variant component', oemPartNumber: null, aftermarketXref: [], note: '', verified: true,
    variants: [{ scope: '2020 Sport', oemPartNumber: 'SPORT-2020', note: '', fitment: { years: [2020], trims: ['Sport'], engines: ['3.6L V6'] } }],
    buyLinks: [{ vendor: 'Amazon', url: 'https://www.amazon.com/dp/B01G5EA74I', verified: true, linkType: 'product' }],
  }] })]);
  assert.equal(row.fixParts[0].oemPartNumber, 'SPORT-2020');
  assert.equal(row.fixParts[0].buyLinks.length, 0);
});

test('Au7o explanation connects only published fields and guarded products', () => {
  const explanation = buildKnownIssueTwinExplanation(issue(), [{ component: 'Chain kit', oemPartNumber: 'GM-1', aftermarketXref: [], note: '', priceLow: null, priceHigh: null, recallFirst: false, fitmentScope: '2020 Sport', buyLinks: [] }]);
  assert.equal(explanation.system, 'Engine timing');
  assert.match(explanation.narrative, /vehicle to Engine timing, then to Timing chain concern/);
  assert.match(explanation.narrative, /decomposes into two related branches/);
  assert.match(explanation.narrative, /failure branch explains how it develops/);
  assert.match(explanation.narrative, /separate repair branch/);
  assert.match(explanation.narrative, /engine timing chain can stretch/);
  assert.match(explanation.narrative, /Check engine light/);
  assert.match(explanation.narrative, /Chain kit \(GM-1\)/);
});

test('partial explanation labels the catalog fallback and does not invent evidence', () => {
  const explanation = buildKnownIssueTwinExplanation(issue({ title: '', description: '', solution: '', symptoms: [], affectedSystems: [], category: 'body' }), []);
  assert.match(explanation.system, /does not identify a more specific affected system/);
  assert.match(explanation.narrative, /does not establish how/);
  assert.match(explanation.narrative, /does not establish a symptom sequence/);
  assert.match(explanation.narrative, /No verified repair product passes/);
});

test('mileage mode requires documented mileage and a mapped vehicle location', () => {
  const projected = projectKnownIssueTwinIssues([
    issue({ id: 'cadillac-xt6-ptu-leak-2020', typicalMileage: { low: 12_000, high: 18_000 }, category: 'drivetrain' }),
    issue({ id: 'cadillac-xt6-timing-chain-2020', typicalMileage: { low: 100_000, high: 120_000 } }),
    issue({ id: 'cadillac-xt6-9speed-transmission-2020', typicalMileage: undefined }),
    issue({ id: 'unmapped', category: 'body', title: 'Body concern', description: 'An unspecified seam concern.', affectedSystems: [], typicalMileage: { low: 12_000, high: 18_000 } }),
  ]);
  assert.deepEqual(issuesAtMileage(projected, 20_000).map((row) => row.id), ['cadillac-xt6-ptu-leak-2020']);
  assert.equal(projected.length, 4, 'Show all can retain every applicable issue');
  assert.equal(projected.find((row) => row.id === 'cadillac-xt6-9speed-transmission-2020')?.typicalMileage, null);
  assert.deepEqual(issuesAtMileage(projected, Number.NaN), []);
  assert.deepEqual(issuesAtMileage(projected, Number.POSITIVE_INFINITY), []);
});

test('a timeline range change clears only selections that leave the visible range', () => {
  assert.equal(retainKnownIssueSelection('a', ['a', 'b']), 'a');
  assert.equal(retainKnownIssueSelection('a', ['b']), null);
  assert.equal(retainKnownIssueSelection(null, ['a']), null);
});

test('gate advances only for two distinct issue ids', () => {
  const first = registerDistinctIssueView([], 'issue-a');
  assert.deepEqual(first, { viewedIssueIds: ['issue-a'], isNew: true, gated: false });
  const repeat = registerDistinctIssueView(first.viewedIssueIds, 'issue-a');
  assert.deepEqual(repeat, { viewedIssueIds: ['issue-a'], isNew: false, gated: false });
  const second = registerDistinctIssueView(repeat.viewedIssueIds, 'issue-b');
  assert.deepEqual(second, { viewedIssueIds: ['issue-a', 'issue-b'], isNew: true, gated: true });
});

test('restored gate history counts only distinct currently published issue ids', () => {
  assert.deepEqual(
    filterKnownIssueViewHistory(['archived', 'current-a', 'current-a', 42, 'current-b'], ['current-a', 'current-b']),
    ['current-a', 'current-b'],
  );
  assert.deepEqual(filterKnownIssueViewHistory(['archived-a', 'archived-b'], ['current-a']), []);
});

test('entry resolver is local/preview-friendly and production US plus flag only', () => {
  const base = {
    slug: 'cadillac-xt6', requestedYear: 2020, queryEnabled: true,
    isVercel: true, vercelEnvironment: 'production', country: 'US', productionFlag: 'true',
    nodeEnvironment: 'production',
  };
  assert.equal(isKnownIssueTwinPilotEnabled(base), true);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, productionFlag: undefined }), false);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, country: 'DE' }), false);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, vercelEnvironment: 'preview', country: 'DE', productionFlag: undefined }), true);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, isVercel: false, country: null, productionFlag: undefined }), false);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, isVercel: false, country: 'US', productionFlag: 'true' }), false);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, isVercel: false, country: null, productionFlag: undefined, nodeEnvironment: 'development' }), true);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, queryEnabled: false }), false);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, slug: 'dodge-challenger' }), false);
  assert.equal(isKnownIssueTwinPilotEnabled({ ...base, requestedYear: 2021 }), false);
});
