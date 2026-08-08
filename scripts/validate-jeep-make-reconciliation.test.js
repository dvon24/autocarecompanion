/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-make-reconciliation');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Jeep make reconciliation passes every frozen-snapshot gate', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { models: 15, rewrite_same_identity: 8, keep_published_pending_source: 239, total: 247 });
});

test('all 247 frozen Jeep IDs are covered exactly once', () => {
  const expected = snapshot.records.map((row) => row.id).sort();
  assert.equal(expected.length, 247);
  assert.deepEqual(packet.decisions.map((row) => row.id).sort(), expected);
  assert.equal(new Set(packet.decisions.map((row) => row.id)).size, 247);
});

test('reconciliation contains no destructive or identity-changing action', () => {
  assert.ok(packet.decisions.every((row) => ['rewrite_same_identity', 'keep_published_pending_source'].includes(row.action)));
  assert.ok(packet.decisions.every((row) => row.identityPreserved === true && row.statusPreserved === true));
  assert.equal(packet.safetyTotals.archives, 0);
  assert.equal(packet.safetyTotals.redirects, 0);
  assert.equal(packet.safetyTotals.deletions, 0);
  assert.equal(packet.safetyTotals.identityChanges, 0);
});

test('every proposal uses the catalog severity and confidence enum', () => {
  const allowed = new Set(['high', 'medium', 'low']);
  for (const entry of packet.modelPackets) {
    const modelPacket = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', entry.file), 'utf8'));
    for (const row of modelPacket.rows) {
      assert.ok(allowed.has(row.proposal.severity), `${row.id}: invalid severity ${row.proposal.severity}`);
      assert.ok(allowed.has(row.proposal.confidence), `${row.id}: invalid confidence ${row.proposal.confidence}`);
    }
  }
});
