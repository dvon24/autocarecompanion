/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
  EXPECTED_MODELS,
  EXPECTED_REWRITE_IDS,
  PACKET,
  SNAPSHOT,
  validateReconciliation,
} = require('./validate-infiniti-make-reconciliation');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Infiniti make reconciliation covers every frozen row exactly once', () => {
  assert.deepEqual(validateReconciliation(packet, snapshot), []);
  assert.equal(packet.summary.total, 73);
  assert.equal(packet.summary.rewrite_same_identity, 6);
  assert.equal(packet.summary.keep_published_pending_source, 67);
  assert.deepEqual(packet.models, EXPECTED_MODELS);
});

test('only the six source-exact Infiniti identities are rewrites', () => {
  assert.deepEqual(packet.rewriteIds, EXPECTED_REWRITE_IDS);
  assert.equal(new Set(packet.rewriteIds).size, 6);
});

test('make-wide outcome preserves every indexed page identity', () => {
  assert.equal(packet.invariants.missingIds, 0);
  assert.equal(packet.invariants.extraIds, 0);
  assert.equal(packet.invariants.duplicateIds, 0);
  assert.equal(packet.invariants.identityDrift, 0);
  assert.equal(packet.invariants.statusDrift, 0);
  assert.equal(packet.invariants.changedHolds, 0);
  assert.equal(packet.invariants.archiveDeleteRedirectOrNewIssue, 0);
});
