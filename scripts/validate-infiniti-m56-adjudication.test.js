/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-infiniti-m56-adjudication');
const { validatePacket } = require('./validate-infiniti-m56-adjudication');
const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-infiniti-m56-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('M56 hold packet passes the complete safety contract', () => assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []));
test('all five M56 rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 5);
  for (const row of packet.rows) { assert.equal(row.action, 'keep_published_pending_source'); assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); assert.deepEqual(row.proposal, row.before, row.id); }
});
test('packet covers every frozen M56 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'M56').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort(); assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 5);
});
test('the timing campaign is partial and cannot rewrite the broader indexed title', () => {
  const row = packet.rows.find((item) => item.id === IDS.timing);
  assert.equal(row.evidence[0].url, SOURCES.timing);
  assert.match(row.evidence[0].observation, /does not state guide wear or chain noise/i);
  assert.deepEqual(row.proposal, row.before);
});
test('distinct driveshaft and fuel-pressure recalls are deferred', () => {
  const item = packet.observations.find((entry) => entry.code === 'deferred-new-m56-recall-candidates');
  assert.deepEqual(item.campaignNumbers, ['14V683000', '20V755000', '24V470000']);
  assert.deepEqual(item.recordIds, []);
});
