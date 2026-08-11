/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const audit = require('../data/known-issue-volvo-make-audit-2026-08-11.json');
const snapshot = require('../data/_volvo-deeplink-snapshot-2026-08-11.json');
const statusInventory = require('../data/_volvo-status-inventory-2026-08-11.json');
const { clone, hashValue } = require('./known-issue-adjudication-utils');
const { evaluateLiveInventory, loadValidatedLocalAuditState, verifyVolvoAllHoldLive } = require('./verify-volvo-all-hold-live');
const ROOT = path.resolve(__dirname, '..');

function inventoryRows() {
  const others = [];
  for (let index = 0; index < 7462; index += 1) others.push({ id: `other-${index}`, make: 'Other', model: 'Model', status: 'published' });
  return others.concat(clone(statusInventory.rows));
}

function liveRows() { return clone(snapshot.records); }

test('accepts the exact pinned inventory and substantive full-record freeze', () => {
  const result = evaluateLiveInventory(inventoryRows(), liveRows(), audit, snapshot, statusInventory);
  assert.equal(result.passed, true);
  assert.equal(result.globalPublishedCount, 7642);
  assert.equal(result.normalizedVolvoRows, 183);
  assert.equal(result.publishedVolvoRows, 180);
  assert.equal(result.exactStatusInventory, true);
  assert.equal(result.exactFrozenIds, true);
  assert.deepEqual(result.staleHeldIds, []);
});

test('reports mutable clickCount telemetry without excluding substantive commerce', () => {
  const live = liveRows();
  const target = live.find((row) => row.communityRecommendations.length > 0);
  target.communityRecommendations[0].clickCount = 7;
  const result = evaluateLiveInventory(inventoryRows(), live, audit, snapshot, statusInventory);
  assert.equal(result.passed, true);
  assert.deepEqual(result.mutableClickTelemetryDriftIds, [target.id]);
  assert.deepEqual(result.staleHeldIds, []);
});


test('rejects object, null, scalar and number JSON container shapes in every guarded commerce field', () => {
  const invalidContainers = [{ invalid: true }, null, 'invalid-container', 17];
  for (const field of ['citations', 'communityRecommendations', 'fixParts']) {
    for (const invalidContainer of invalidContainers) {
      const live = liveRows();
      live[0][field] = structuredClone(invalidContainer);
      const result = evaluateLiveInventory(inventoryRows(), live, audit, snapshot, statusInventory);
      assert.equal(result.passed, false, `${field} ${JSON.stringify(invalidContainer)}`);
      assert.match(result.failures.join('\n'), /substantive full-record state/);
    }
  }
});

test('rejects title, owner, content, part and URL drift', () => {
  const mutations = [
    (rows) => { rows[0].title += ' changed'; },
    (rows) => { rows[0].reportCount += 1; },
    (rows) => { rows[0].fixParts = [{ component: 'fabricated' }]; },
    (rows) => {
      const target = rows.find((row) => row.communityRecommendations.length > 0);
      target.communityRecommendations[0].content = `${target.communityRecommendations[0].content || ''} changed`;
    },
    (rows) => {
      const target = rows.find((row) => row.communityRecommendations.length > 0);
      target.communityRecommendations[0].details = { clickCount: 1 };
    },
    (rows) => {
      const target = rows.find((row) => row.fixParts.some((part) => Array.isArray(part.buyLinks) && part.buyLinks.length));
      const part = target.fixParts.find((candidate) => Array.isArray(candidate.buyLinks) && candidate.buyLinks.length);
      part.buyLinks[0].url += '&changed=1';
    },
  ];
  for (const mutate of mutations) {
    const live = liveRows();
    mutate(live);
    const result = evaluateLiveInventory(inventoryRows(), live, audit, snapshot, statusInventory);
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /substantive full-record state/);
  }
});

test('rejects make, status, model and ID inventory drift', () => {
  const make = inventoryRows(); make.find((row) => row.make === 'Volvo').make = 'VOLVO';
  assert.equal(evaluateLiveInventory(make, liveRows(), audit, snapshot, statusInventory).passed, false);
  const status = inventoryRows(); status.find((row) => row.make === 'Volvo' && row.status === 'published').status = 'archived';
  assert.equal(evaluateLiveInventory(status, liveRows(), audit, snapshot, statusInventory).passed, false);
  const model = inventoryRows(); model.find((row) => row.make === 'Volvo' && row.status === 'published').model = 'Wrong';
  assert.equal(evaluateLiveInventory(model, liveRows(), audit, snapshot, statusInventory).passed, false);
  assert.equal(evaluateLiveInventory(inventoryRows(), liveRows().slice(1), audit, snapshot, statusInventory).passed, false);
});

test('rejects a matched rehashed snapshot and live mutation', () => {
  const changedSnapshot = clone(snapshot);
  changedSnapshot.records[0].title += ' changed';
  changedSnapshot.records[0].before.titleHash = hashValue(changedSnapshot.records[0].title);
  const live = liveRows();
  live.find((row) => row.id === changedSnapshot.records[0].id).title = changedSnapshot.records[0].title;
  assert.throws(
    () => evaluateLiveInventory(inventoryRows(), live, audit, changedSnapshot, statusInventory),
    /differs from the pinned snapshot file/,
  );
});

test('rejects same-summary artifact tampering before connection or query', async () => {
  const mutations = [
    (changed) => { changed.applicationGate.status = 'ready'; },
    (changed) => { changed.decisions[0].changedFields = ['title']; },
    (changed) => { changed.decisions[0].proposalSha256 = '0'.repeat(64); },
    (changed) => { changed.modelCounts.S60 += 1; changed.modelCounts.S80 -= 1; },
    (changed) => { changed.routing.metadataWritesAuthorized = 1; },
    (changed) => { changed.additionalAuditReferences[0].file = 'data/_volkswagen-status-inventory-2026-08-11.json'; },
    (changed) => { changed.provenance.reviewedTree.files[0].normalizedSha256 = '0'.repeat(64); },
    (changed) => { changed.riskSignals.commerceRowIds.pop(); },
  ];
  for (const mutate of mutations) {
    const changed = clone(audit);
    mutate(changed);
    let connections = 0;
    const pool = { connect: async () => { connections += 1; throw new Error('must not connect'); } };
    await assert.rejects(
      () => verifyVolvoAllHoldLive(pool, changed, snapshot, statusInventory),
      /Volvo audit validation failed/,
    );
    assert.equal(connections, 0);
  }
});


test('validated local-state loader is deterministic across two runs and never rewrites reconciliation', () => {
  const reconciliationFile = path.join(ROOT, 'data/known-issue-volvo-make-audit-2026-08-11.json');
  const before = fs.readFileSync(reconciliationFile, 'utf8');
  const first = loadValidatedLocalAuditState();
  const between = fs.readFileSync(reconciliationFile, 'utf8');
  const second = loadValidatedLocalAuditState();
  const after = fs.readFileSync(reconciliationFile, 'utf8');
  assert.equal(between, before);
  assert.equal(after, before);
  assert.deepEqual(second, first);
});

test('uses a read-only transaction and no mutation query', async () => {
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
  const result = await verifyVolvoAllHoldLive({ connect: async () => client }, audit, snapshot, statusInventory);
  assert.equal(result.passed, true);
  assert.match(statements[0].sql, /READ ONLY/);
  assert.equal(statements.filter((entry) => /^SELECT/.test(entry.sql.trim())).length, 2);
  assert.equal(statements.at(-1).sql, 'COMMIT');
  assert.doesNotMatch(statements.map((entry) => entry.sql).join('\n'), /\b(?:INSERT|UPDATE|DELETE|UPSERT|CREATE|DROP|ALTER)\b/i);
});
