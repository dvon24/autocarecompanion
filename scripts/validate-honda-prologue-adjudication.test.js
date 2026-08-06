/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validatePacket } = require('./validate-honda-prologue-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-honda-prologue-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json'), 'utf8'));

test('Prologue proposal packet passes the complete safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []); });
test('both unchanged Prologue rows are byte-for-byte frozen with mismatch evidence', () => {
  const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 2);
  for (const row of holds) { assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); assert.ok(row.evidence.length, row.id); }
});
test('both Prologue rewrites are published, source-backed and commerce-free', () => {
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.equal(rewrites.length, 2);
  for (const row of rewrites) {
    assert.equal(row.proposal.status, 'published', row.id); assert.ok(row.proposal.citations.length, row.id);
    assert.deepEqual(row.proposal.trims, [], row.id); assert.deepEqual(row.proposal.engines, [], row.id);
    assert.deepEqual(row.proposal.communityRecommendations, [], row.id); assert.deepEqual(row.proposal.fixParts, [], row.id);
    assert.equal(row.proposal.estimatedCostLow, null, row.id); assert.equal(row.proposal.estimatedCostHigh, null, row.id);
  }
});
test('packet contains all frozen Prologue IDs exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Prologue').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 4);
});
