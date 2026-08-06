/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-infiniti-fx45-adjudication');
const { validatePacket } = require('./validate-infiniti-fx45-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-infiniti-fx45-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('FX45 hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('all six FX45 rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 6);
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});

test('packet covers every frozen FX45 ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Infiniti' && row.model === 'FX45')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 6);
});

test('partial brake evidence cannot rewrite the broader indexed title', () => {
  const row = packet.rows.find((item) => item.id === IDS.brake);
  assert.equal(row.evidence[0].url, SOURCES.brake);
  assert.match(row.evidence[0].observation, /does not establish/i);
  assert.match(row.before.title, /premature front brake wear/i);
  assert.deepEqual(row.proposal, row.before);
});
