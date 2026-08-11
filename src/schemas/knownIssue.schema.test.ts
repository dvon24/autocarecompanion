import assert from 'node:assert/strict';
import test from 'node:test';
import { citationSchema, fixPartSchema } from './knownIssue.schema';

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

test('staged proposal part numbers and catalog model evidence survive schema parsing', () => {
  const parsed = fixPartSchema.parse({
    component: 'Water pump',
    aftermarketXref: ['WP-1234'],
    fitment: { years: [2020], catalogModels: ['C300', 'C63 AMG'] },
  });
  assert.deepEqual(parsed.aftermarketXref, ['WP-1234']);
  assert.deepEqual(parsed.fitment?.catalogModels, ['C300', 'C63 AMG']);
});
