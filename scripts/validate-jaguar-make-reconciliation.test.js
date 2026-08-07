/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { EXPECTED_MODELS, EXPECTED_REWRITE_IDS, PACKET, SNAPSHOT, validateReconciliation } = require('./validate-jaguar-make-reconciliation');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Jaguar make reconciliation covers every frozen row exactly once', () => {
  assert.deepEqual(validateReconciliation(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 2, keep_published_pending_source: 61, total: 63 });
  assert.deepEqual(packet.models, EXPECTED_MODELS);
});

test('only the two source-exact Jaguar recall identities are rewrites', () => {
  assert.deepEqual(packet.rewriteIds, EXPECTED_REWRITE_IDS);
  assert.equal(new Set(packet.rewriteIds).size, 2);
});

test('make-wide outcome preserves every indexed page identity', () => {
  assert.deepEqual(packet.invariants, {
    missingIds: 0, extraIds: 0, duplicateIds: 0, identityDrift: 0, statusDrift: 0,
    changedHolds: 0, archiveDeleteRedirectOrNewIssue: 0,
  });
});
