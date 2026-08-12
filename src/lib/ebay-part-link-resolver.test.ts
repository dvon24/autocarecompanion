import assert from 'node:assert/strict';
import test from 'node:test';
import { ebayQuery } from './ebay-part-link-resolver';

test('eBay query carries exact vehicle, engine, trim, supplier, PN and component evidence', () => {
  assert.equal(
    ebayQuery({
      year: 2017, make: 'Dodge', model: 'Challenger', trim: 'R/T', engine: '5.7L HEMI V8',
      supplier: 'Gates', partNumber: '43526', component: 'Engine Water Pump',
    }),
    '2017 Dodge Challenger R/T 5.7L Gates 43526 Engine Water Pump',
  );
});
