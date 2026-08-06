/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS } = require('./build-infiniti-g35-adjudication');
const { validatePacket } = require('./validate-infiniti-g35-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-infiniti-g35-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('G35 hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});
test('all three G35 rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 3);
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});
test('packet covers every frozen G35 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'G35').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 3);
});
test('the distinct 2003 sensor recall is deferred, not substituted', () => {
  assert.ok(packet.observations.some((item) => item.code === 'deferred-new-sensor-issue-candidate'));
  assert.equal(packet.rows.some((row) => /sensor/i.test(row.proposal.title)), false);
  assert.deepEqual(packet.rows.find((row) => row.id === IDS.oil).proposal, packet.rows.find((row) => row.id === IDS.oil).before);
});
