/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { clone, fullRecord } = require('./known-issue-adjudication-utils');
const { assertLocalPlan, evaluateLiveInventory, verifySuzukiAllHoldLive } = require('./verify-suzuki-all-hold-live');

const snapshot = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/_suzuki-deeplink-snapshot-2026-08-11.json'), 'utf8'));
const reconciliation = { summary: { retained: 0, held: 18, authorizedWriteCandidates: 0 } };
const fullReconciliation = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/known-issue-suzuki-make-reconciliation-2026-08-11.json'), 'utf8'));

function inventoryRows() {
  const result = [];
  for (let index = 0; index < 7624; index += 1) result.push({ id: `other-${index}`, make: 'Other', model: 'Model', status: 'published' });
  for (const row of snapshot.records) result.push({ id: row.id, make: row.make, model: row.model, status: row.status });
  return result;
}

function liveRows() { return snapshot.records.map((row) => ({ id: row.id, ...fullRecord(row) })); }

test('all-hold inventory accepts exact 7,642 global and 18 Suzuki full-record matches', () => {
  const result = evaluateLiveInventory(inventoryRows(), liveRows(), reconciliation, snapshot);
  assert.equal(result.passed, true);
  assert.equal(result.globalPublishedCount, 7642);
  assert.equal(result.normalizedSuzukiCount, 18);
  assert.deepEqual(result.staleHeldIds, []);
});

test('Unicode-normalized Suzuki variants are detected and raw-variant drift fails', () => {
  for (const make of ['SUZUKI', 'Suzu\u0301ki']) {
    const changed = inventoryRows();
    changed.find((row) => row.make === 'Suzuki').make = make;
    const result = evaluateLiveInventory(changed, liveRows(), reconciliation, snapshot);
    assert.equal(result.normalizedSuzukiCount, 18);
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /raw make variants/);
  }
});

test('global, model, held-record and local-decision mutations fail', () => {
  assert.match(evaluateLiveInventory(inventoryRows().slice(1), liveRows(), reconciliation, snapshot).failures.join('\n'), /global published count/);
  const changedModel = inventoryRows();
  changedModel.find((row) => row.make === 'Suzuki').model = 'Wrong';
  assert.match(evaluateLiveInventory(changedModel, liveRows(), reconciliation, snapshot).failures.join('\n'), /model counts/);
  const changedLive = clone(liveRows());
  changedLive[0].title += ' changed';
  assert.match(evaluateLiveInventory(inventoryRows(), changedLive, reconciliation, snapshot).failures.join('\n'), /live held rows drifted/);
  assert.match(evaluateLiveInventory(inventoryRows(), liveRows(), { summary: { retained: 1, held: 17, authorizedWriteCandidates: 1 } }, snapshot).failures.join('\n'), /zero-write/);
});

test('live verifier uses a read-only transaction and no mutation query', async () => {
  const statements = [];
  const client = {
    async query(sql) {
      statements.push(sql);
      if (/SELECT id, make, model, status/i.test(sql)) return { rows: inventoryRows() };
      if (/SELECT id, make, model, years/i.test(sql)) return { rows: liveRows() };
      return { rows: [] };
    },
    release() {},
  };
  const result = await verifySuzukiAllHoldLive({ connect: async () => client }, clone(reconciliation), snapshot);
  assert.equal(result.passed, true);
  assert.match(statements[0], /READ ONLY/);
  assert.equal(statements.filter((statement) => /^SELECT/i.test(statement.trim())).length, 2);
  assert.equal(statements.at(-1), 'COMMIT');
  assert.doesNotMatch(statements.join('\n'), /\b(?:INSERT|UPDATE|DELETE|UPSERT|CREATE|DROP|ALTER)\b/i);
});

test('live entry point rejects a tampered reconciliation with unchanged totals', () => {
  const changed = clone(fullReconciliation);
  changed.sourceControl.baselineCommit = '0'.repeat(40);
  assert.throws(() => assertLocalPlan(changed), /reconciliation validation failed/);
});
