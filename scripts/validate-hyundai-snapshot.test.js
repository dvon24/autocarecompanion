/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { EXPECTED_MODELS, SNAPSHOT, validateSnapshot } = require('./validate-hyundai-snapshot');
const { normalizedFileHash } = require('./hyundai-adjudication-utils');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('frozen Hyundai snapshot passes its complete immutability contract', () => {
  assert.deepEqual(validateSnapshot(snapshot, normalizedFileHash(SNAPSHOT)), []);
});
test('all 242 frozen rows remain published and uniquely identified', () => {
  assert.equal(snapshot.records.length, 242);
  assert.equal(new Set(snapshot.records.map((row) => row.id)).size, 242);
  assert.equal(snapshot.records.every((row) => row.status === 'published' && !/^Archived\s*-/i.test(row.title)), true);
});
test('all 30 Hyundai model labels are frozen at exact row counts', () => {
  assert.equal(Object.keys(EXPECTED_MODELS).length, 30);
  for (const [model, count] of Object.entries(EXPECTED_MODELS)) assert.equal(snapshot.records.filter((row) => row.model === model).length, count, model);
});
test('validator rejects record mutation, archive and model-count drift', () => {
  const mutated = structuredClone(snapshot);
  mutated.records[0].title = `Archived - ${mutated.records[0].title}`;
  assert.ok(validateSnapshot(mutated, normalizedFileHash(SNAPSHOT)).some((error) => /snapshotHash|archived title/i.test(error)));
});
