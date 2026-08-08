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

test('accepts an official NHTSA investigation citation', () => {
  const result = citationSchema.safeParse({
    type: 'investigation',
    title: 'NHTSA Preliminary Evaluation PE25004',
    url: 'https://static.nhtsa.gov/odi/inv/2025/INOA-PE25004-11072.pdf',
  });
  assert.equal(result.success, true);
});
