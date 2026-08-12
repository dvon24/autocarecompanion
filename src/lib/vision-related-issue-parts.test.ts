import assert from 'node:assert/strict';
import test from 'node:test';
import { relatedIssuePartsForVehicle } from './vision-related-issue-parts';

test('suppresses garage-vehicle issue parts when the image vehicle mismatches', () => {
  const parts = [{ component: 'Water Pump', productUrl: 'https://www.ebay.com/itm/123' }];
  assert.deepEqual(relatedIssuePartsForVehicle(parts, true), []);
  assert.deepEqual(relatedIssuePartsForVehicle(parts, false), parts);
});

test('fails closed for malformed related-issue part input', () => {
  assert.deepEqual(relatedIssuePartsForVehicle(null, false), []);
  assert.deepEqual(relatedIssuePartsForVehicle(undefined, false), []);
});
