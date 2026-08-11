/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { clone } = require('./known-issue-adjudication-utils');
const { EXPECTED_MODELS, evaluateLiveInventory, verifySkodaAllHoldLive } = require('./verify-skoda-all-hold-live');

function rows() {
  const result = [];
  let sequence = 0;
  for (let index = 0; index < 7582; index += 1) result.push({ id: `other-${sequence += 1}`, make: 'Other', model: 'Model', status: 'published' });
  for (const [model, count] of Object.entries(EXPECTED_MODELS)) for (let index = 0; index < count; index += 1) result.push({ id: `skoda-${sequence += 1}`, make: 'Skoda', model, status: 'published' });
  return result;
}

const reconciliation = { summary: { retained: 0, held: 60, authorizedWriteCandidates: 0 } };

test('all-hold inventory accepts exact 7,642 global and 60 Skoda model counts', () => {
  const result = evaluateLiveInventory(rows(), reconciliation);
  assert.equal(result.passed, true);
  assert.equal(result.globalPublishedCount, 7642);
  assert.equal(result.normalizedSkodaCount, 60);
});

test('Unicode-normalized Skoda variants are detected and raw-variant drift fails', () => {
  for (const make of ['SKODA', 'Škoda', 'S\u030Ckoda']) {
    const changed = rows();
    changed.find((row) => row.make === 'Skoda').make = make;
    const result = evaluateLiveInventory(changed, reconciliation);
    assert.equal(result.normalizedSkodaCount, 60);
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /raw make variants/);
  }
});

test('global, model and local decision mutations fail', () => {
  const missingGlobal = rows().slice(1);
  assert.match(evaluateLiveInventory(missingGlobal, reconciliation).failures.join('\n'), /global published count/);
  const changedModel = rows();
  changedModel.find((row) => row.make === 'Skoda').model = 'Wrong';
  assert.match(evaluateLiveInventory(changedModel, reconciliation).failures.join('\n'), /model counts/);
  assert.match(evaluateLiveInventory(rows(), { summary: { retained: 1, held: 59, authorizedWriteCandidates: 1 } }).failures.join('\n'), /zero-write/);
});

test('live verifier uses a read-only transaction and no mutation query', async () => {
  const statements = [];
  const client = {
    async query(sql) { statements.push(sql); return /SELECT/i.test(sql) ? { rows: rows() } : { rows: [] }; },
    release() {},
  };
  const result = await verifySkodaAllHoldLive({ connect: async () => client }, clone(reconciliation));
  assert.equal(result.passed, true);
  assert.match(statements[0], /READ ONLY/);
  assert.match(statements[1], /^SELECT/i);
  assert.equal(statements[2], 'COMMIT');
  assert.doesNotMatch(statements.join('\n'), /\b(?:INSERT|UPDATE|DELETE|UPSERT|CREATE|DROP|ALTER)\b/i);
});
