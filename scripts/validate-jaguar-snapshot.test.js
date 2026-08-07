/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
  EXPECTED_INVENTORY,
  EXPECTED_MODELS,
  EXPECTED_SHA256,
  EXPECTED_SNAPSHOT_HASH,
  SNAPSHOT,
  validateSnapshot,
} = require('./validate-jaguar-snapshot');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Jaguar snapshot is bound to the frozen file and inventory', () => {
  assert.deepEqual(validateSnapshot(snapshot), []);
  assert.equal(snapshot.snapshotHash, EXPECTED_SNAPSHOT_HASH);
  assert.equal(snapshot.records.length, 63);
  assert.equal(Object.keys(EXPECTED_MODELS).length, 10);
  assert.equal(EXPECTED_SHA256.length, 64);
  assert.deepEqual(snapshot.inventory, EXPECTED_INVENTORY);
});

test('Jaguar snapshot contains only published identity-stable rows', () => {
  for (const row of snapshot.records) {
    assert.equal(row.make, 'Jaguar');
    assert.equal(row.status, 'published');
    assert.doesNotMatch(row.title, /^Archived\s*-/i);
  }
});
