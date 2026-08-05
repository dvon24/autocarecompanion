/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { looksLikeApplicabilityProse } = require('./verify-known-issue-restoration');
const { REPAIRS, validateRepairs, verifyRows } = require('./repair-known-issue-trim-metadata');

test('freezes the 16 adjudicated non-Toyota trim repairs', () => {
  assert.equal(REPAIRS.length, 16);
  assert.deepEqual(validateRepairs(), []);
  assert.equal(REPAIRS.some((row) => row.make === 'Toyota' || row.make === 'GMC'), false);
  for (const row of REPAIRS) {
    assert.equal(row.beforeTrims.some(looksLikeApplicabilityProse), true, row.id);
    assert.equal(row.afterTrims.some(looksLikeApplicabilityProse), false, row.id);
  }
});

test('preserves real Mazda Protege trims while removing the synthetic entry', () => {
  const repair = REPAIRS.find((row) => row.id === 'mazda-protege-ignition-switch-may-overheat-catch-fire');
  assert.deepEqual(repair.afterTrims, ['DX', 'LX', 'ES', 'SE']);
});

test('pre-state verifier rejects trim, identity, and status drift', () => {
  const repair = REPAIRS[0];
  assert.deepEqual(verifyRows([{
    id: repair.id,
    make: repair.make,
    model: repair.model,
    trims: repair.beforeTrims,
    status: 'published',
  }], [repair]), []);
  assert.equal(verifyRows([{
    id: repair.id,
    make: repair.make,
    model: repair.model,
    trims: [],
    status: 'archived',
  }], [repair]).length, 2);
});
