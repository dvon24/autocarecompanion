const assert = require('node:assert/strict');
const test = require('node:test');
const {
  assertKnownOverrideIds,
} = require('../data/known-issues-catalog-deeplink-decisions/_config-bmw-remaining-factory.cjs');

test('BMW remaining-model factory rejects a misspelled published override ID', () => {
  assert.throws(
    () => assertKnownOverrideIds(
      ['bmw-x7-brake-recall-2023'],
      { 'bmw-x7-brake-recal-2023': { disposition: 'recall-dealer' } },
      'BMW X7 published overrides',
    ),
    /unknown packet IDs: bmw-x7-brake-recal-2023/,
  );
});

test('BMW remaining-model factory accepts only override IDs present in the packet', () => {
  assert.doesNotThrow(() => assertKnownOverrideIds(
    ['bmw-x7-brake-recall-2023'],
    { 'bmw-x7-brake-recall-2023': { disposition: 'recall-dealer' } },
    'BMW X7 published overrides',
  ));
});
