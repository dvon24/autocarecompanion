/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validatePacket } = require('./validate-hyundai-accent-adjudication');
const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-accent-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Accent packet passes the complete proposal-only safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []); });
test('all four Accent holds remain byte-for-byte frozen', () => {
  const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 4);
  for (const row of holds) { assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); }
});
test('all three Accent rewrites remain published and commerce-free', () => {
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.equal(rewrites.length, 3);
  for (const row of rewrites) {
    assert.equal(row.proposal.status, 'published', row.id); assert.ok(row.proposal.citations.length, row.id);
    assert.deepEqual(row.proposal.trims, [], row.id); assert.deepEqual(row.proposal.engines, [], row.id);
    assert.deepEqual(row.proposal.communityRecommendations, [], row.id); assert.deepEqual(row.proposal.fixParts, [], row.id);
    assert.equal(row.proposal.title, row.before.title, row.id); assert.equal(row.proposal.category, row.before.category, row.id);
  }
});
test('packet covers every frozen Accent ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'Accent').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 7);
});
test('documented pretensioner scope excludes 2019 Accent without inventing an amendment', () => {
  const row = packet.rows.find((item) => item.id === 'hyundai-accent-seat-belt-pretensioner-may-explode-send-shrapnel');
  assert.deepEqual(row.proposal.years, [2020, 2021, 2022]);
  assert.doesNotMatch(JSON.stringify(row.proposal), /amended filing|manufacturing records/i);
});
