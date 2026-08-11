/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const snapshot = require('../data/_tesla-deeplink-snapshot-2026-08-11.json');
const { clone } = require('./known-issue-adjudication-utils');
const { EXPECTED_MODELS, evaluateLiveInventory, verifyTeslaAllHoldLive } = require('./verify-tesla-all-hold-live');

function inventoryRows() {
  const result = [];
  for (let index = 0; index < 7578; index += 1) result.push({ id: `other-${index}`, make: 'Other', model: 'Model', status: 'published' });
  return result.concat(snapshot.records.map((row) => ({ id: row.id, make: row.make, model: row.model, status: row.status })));
}

function liveRows() { return clone(snapshot.records); }
const reconciliation = { summary: { retained: 0, held: 64, authorizedWriteCandidates: 0 } };

test('all-hold inventory accepts exact global, Tesla model and full-record state', () => {
  const result = evaluateLiveInventory(inventoryRows(), liveRows(), reconciliation, snapshot);
  assert.equal(result.passed, true);
  assert.equal(result.globalPublishedCount, 7642);
  assert.equal(result.normalizedTeslaCount, 64);
  assert.deepEqual(result.modelCounts, EXPECTED_MODELS);
  assert.deepEqual(result.staleHeldRows, []);
});

test('Unicode-normalized Tesla variants are detected and raw-variant drift fails', () => {
  for (const make of ['TESLA', 'Tésla', 'Te\u0301sla']) {
    const inventory = inventoryRows();
    const full = liveRows();
    const target = inventory.find((row) => row.make === 'Tesla');
    target.make = make;
    full.find((row) => row.id === target.id).make = make;
    const result = evaluateLiveInventory(inventory, full, reconciliation, snapshot);
    assert.equal(result.normalizedTeslaCount, 64);
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /raw make variants/);
  }
});

test('global, model, ID, full-record and local-decision mutations fail', () => {
  assert.match(evaluateLiveInventory(inventoryRows().slice(1), liveRows(), reconciliation, snapshot).failures.join('\n'), /global published count/);
  const wrongModelInventory = inventoryRows();
  const wrongModelFull = liveRows();
  const target = wrongModelInventory.find((row) => row.make === 'Tesla');
  target.model = 'Wrong';
  wrongModelFull.find((row) => row.id === target.id).model = 'Wrong';
  assert.match(evaluateLiveInventory(wrongModelInventory, wrongModelFull, reconciliation, snapshot).failures.join('\n'), /model counts/);
  assert.match(evaluateLiveInventory(inventoryRows(), liveRows().slice(1), reconciliation, snapshot).failures.join('\n'), /ID inventory|full-record state/);
  const stale = liveRows(); stale[0].title += ' changed';
  assert.match(evaluateLiveInventory(inventoryRows(), stale, reconciliation, snapshot).failures.join('\n'), /full-record state/);
  assert.match(evaluateLiveInventory(inventoryRows(), liveRows(), { summary: { retained: 1, held: 63, authorizedWriteCandidates: 1 } }, snapshot).failures.join('\n'), /zero-write/);
});

test('live verifier uses a read-only transaction and no mutation query', async () => {
  const statements = [];
  const client = {
    async query(sql, params) {
      statements.push({ sql, params });
      if (/SELECT id, make, model, status/.test(sql)) return { rows: inventoryRows() };
      if (/^SELECT/.test(sql.trim())) return { rows: liveRows() };
      return { rows: [] };
    },
    release() {},
  };
  const result = await verifyTeslaAllHoldLive({ connect: async () => client }, clone(reconciliation), snapshot);
  assert.equal(result.passed, true);
  assert.match(statements[0].sql, /READ ONLY/);
  assert.match(statements[1].sql.trim(), /^SELECT/);
  assert.match(statements[2].sql.trim(), /^SELECT/);
  assert.equal(statements[3].sql, 'COMMIT');
  assert.doesNotMatch(statements.map((entry) => entry.sql).join('\n'), /\b(?:INSERT|UPDATE|DELETE|UPSERT|CREATE|DROP|ALTER)\b/i);
});
