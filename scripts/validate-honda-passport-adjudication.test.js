/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validatePacket } = require('./validate-honda-passport-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-honda-passport-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json'), 'utf8'));

test('Passport proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('every unchanged Passport row is byte-for-byte frozen', () => {
  for (const row of packet.rows.filter((item) => item.action === 'keep_published_pending_source')) {
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
  }
});

test('every Passport rewrite is published, source-backed and commerce-free', () => {
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

test('packet contains all frozen Passport IDs exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Passport').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 21);
});
