/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { PACKET, SNAPSHOT, validateReconciliation } = require('./validate-kia-make-reconciliation');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Kia make reconciliation covers every frozen row exactly once', () => {
  assert.deepEqual(validateReconciliation(packet, snapshot), []);
  assert.equal(packet.modelPackets.length, 23);
  assert.equal(packet.decisions.length, 247);
  assert.equal(new Set(packet.decisions.map((row) => row.id)).size, 247);
});

test('only 53 exact same-identity rewrites enter the apply allowlist', () => {
  assert.equal(packet.applyAllowlist.length, 53);
  assert.ok(packet.applyAllowlist.every((id) => packet.decisions.find((row) => row.id === id)?.action === 'rewrite_same_identity'));
  assert.equal(packet.nonApplyIds.length, 194);
});

test('reconciliation contains no destructive or page-identity change', () => {
  assert.ok(packet.decisions.every((row) => row.identityPreserved && row.statusPreserved));
  assert.deepEqual(packet.safetyTotals, { archives: 0, redirects: 0, deletions: 0, identityChanges: 0, statusChanges: 0 });
});
