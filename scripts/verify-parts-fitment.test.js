/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { looserPartTypeTier, resolveModels } = require('./verify-parts-fitment');

const models = (...names) => names.map((data, index) => ({ id: String(index + 1), data }));

test('C-Class aliases cannot swallow CL or CLS vehicles', () => {
  const result = resolveModels(models('C300', 'C63 AMG', 'CL500', 'CLS350'), 'C-Class', 'Mercedes-Benz');
  assert.deepEqual(result.rows.map((row) => row.data), ['C300', 'C63 AMG']);
});

test('SLK/SLC aliases retain both catalog stems', () => {
  const result = resolveModels(models('SLK250', 'SLC300', 'SL500'), 'SLK/SLC', 'Mercedes-Benz');
  assert.deepEqual(result.rows.map((row) => row.data), ['SLK250', 'SLC300']);
});

test('relaxation evidence always keeps the loosest tier', () => {
  let tier = looserPartTypeTier('', 'electric water pump');
  tier = looserPartTypeTier(tier, 'water pump');
  tier = looserPartTypeTier(tier, 'pump');
  tier = looserPartTypeTier(tier, 'electric water pump');
  assert.equal(tier, 'pump');
});
