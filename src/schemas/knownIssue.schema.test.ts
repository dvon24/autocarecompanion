import assert from 'node:assert/strict';
import test from 'node:test';
import { citationSchema } from './knownIssue.schema';

test('accepts an official manufacturer citation', () => {
  const result = citationSchema.safeParse({
    type: 'manufacturer',
    title: 'Hyundai Campaign Page',
    url: 'https://autoservice.hyundaiusa.com/campaignhome',
  });
  assert.equal(result.success, true);
});
