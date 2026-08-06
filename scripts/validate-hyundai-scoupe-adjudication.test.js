/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validatePacket } = require('./validate-hyundai-scoupe-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-scoupe-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Scoupe hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('all five Scoupe rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 5);
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});

test('packet covers every frozen Scoupe ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Scoupe')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 5);
});

test('empty official recall results never replace the five unsupported narratives', () => {
  for (const row of packet.rows) {
    assert.match(row.evidence[0].observation, /zero Scoupe campaigns/i);
    assert.deepEqual(row.proposal.citations, row.before.citations);
  }
});
