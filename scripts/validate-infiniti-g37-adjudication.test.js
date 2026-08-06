/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-infiniti-g37-adjudication');
const { validatePacket } = require('./validate-infiniti-g37-adjudication');
const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-infiniti-g37-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('G37 hold packet passes the complete safety contract', () => assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []));
test('all three G37 rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 3);
  for (const row of packet.rows) { assert.equal(row.action, 'keep_published_pending_source'); assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); assert.deepEqual(row.proposal, row.before, row.id); }
});
test('packet covers every frozen G37 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'G37').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 3);
});
test('the clutch bulletin is explicitly partial and does not authorize a CSC rewrite', () => {
  const row = packet.rows.find((item) => item.id === IDS.csc);
  assert.equal(row.evidence[0].url, SOURCES.clutchPedal);
  assert.match(row.evidence[0].observation, /no leaks/i);
  assert.match(row.evidence[0].observation, /does not establish/i);
  assert.deepEqual(row.proposal, row.before);
});
test('the distinct power-window campaign is deferred, not substituted', () => {
  const item = packet.observations.find((entry) => entry.code === 'deferred-new-power-window-switch-candidate');
  assert.equal(item.campaignNumber, '11V538000');
  assert.deepEqual(item.recordIds, []);
});
