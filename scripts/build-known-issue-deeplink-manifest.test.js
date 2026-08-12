/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { mergeFixParts } = require('./build-known-issue-deeplink-manifest');

test('keyed part merge preserves unrelated existing commerce byte-for-byte', () => {
  const existing = [
    { component: 'Thermostat', aftermarketXref: ['A'], buyLinks: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/123456789012' }] },
    { component: 'Water Pump', aftermarketXref: ['OLD'], buyLinks: [] },
  ];
  const replacement = { component: 'water-pump', aftermarketXref: ['NEW'], buyLinks: [] };
  const merged = mergeFixParts(existing, [{ component: 'Water Pump', part: replacement }]);
  assert.deepEqual(merged, [existing[0], replacement]);
  assert.deepEqual(existing[1].aftermarketXref, ['OLD']);
});

test('keyed part merge appends a new component without replacing the array', () => {
  const existing = [{ component: 'Thermostat', aftermarketXref: ['A'], buyLinks: [] }];
  const addition = { component: 'O-ring', aftermarketXref: ['B'], buyLinks: [] };
  assert.deepEqual(mergeFixParts(existing, [{ part: addition }]), [existing[0], addition]);
});

test('keyed merge refuses ambiguous duplicate components and mismatched keys', () => {
  const duplicate = [{ component: 'Water Pump' }, { component: 'water-pump' }];
  assert.throws(
    () => mergeFixParts(duplicate, [{ part: { component: 'water pump' } }]),
    /ambiguous/,
  );
  assert.throws(
    () => mergeFixParts([], [{ component: 'Water Pump', part: { component: 'Radiator' } }]),
    /component mismatch/,
  );
});
