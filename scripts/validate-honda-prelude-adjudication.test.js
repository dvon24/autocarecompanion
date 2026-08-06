/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validatePacket } = require('./validate-honda-prelude-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-honda-prelude-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json'), 'utf8'));

test('Prelude proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});
test('every unchanged Prelude row is byte-for-byte frozen', () => {
  for (const row of packet.rows.filter((item) => item.action === 'keep_published_pending_source')) {
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
  }
});
test('every Prelude rewrite is published, source-backed and commerce-free', () => {
  for (const row of packet.rows.filter((item) => item.action === 'rewrite_same_identity')) {
    assert.equal(row.proposal.status, 'published', row.id);
    assert.ok(row.proposal.citations.length > 0, row.id);
    assert.deepEqual(row.proposal.trims, [], row.id);
    assert.deepEqual(row.proposal.engines, [], row.id);
    assert.deepEqual(row.proposal.communityRecommendations, [], row.id);
    assert.deepEqual(row.proposal.fixParts, [], row.id);
    assert.equal(row.proposal.estimatedCostLow, null, row.id);
    assert.equal(row.proposal.estimatedCostHigh, null, row.id);
  }
});
test('packet contains all frozen Prelude IDs exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Prelude').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 14);
});
test('duplicate transmission pages are preserved and unsupported rows remain frozen', () => {
  const duplicateIds = ['honda-prelude-5th-gen-automatic-transmission-premature-failure', 'honda-prelude-auto-transmission-failure-1997'];
  for (const id of duplicateIds) assert.equal(packet.rows.find((row) => row.id === id)?.action, 'rewrite_same_identity', id);
  assert.equal(packet.rows.filter((row) => row.action === 'keep_published_pending_source').length, 10);
});
