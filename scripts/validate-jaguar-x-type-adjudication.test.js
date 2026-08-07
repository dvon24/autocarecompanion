/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-x-type-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-x-type-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('X-TYPE hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 });
});
test('all four X-TYPE rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) { assert.equal(row.action, 'keep_published_pending_source'); assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256); assert.deepEqual(row.changedFields, []); }
});
test('packet covers every frozen Jaguar X-TYPE ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'X-TYPE').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected); assert.deepEqual(Object.values(IDS).sort(), expected);
});
test('official source identity and remedy boundaries remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.alternator).reason, /no exact.*primary source/i);
  assert.match(byId.get(IDS.thermostat).reason, /hose clamp/i);
  assert.match(byId.get(IDS.thermostat).reason, /not.*cracked.*housing/i);
  assert.match(byId.get(IDS.transfer).reason, /not.*Haldex/i);
  assert.match(byId.get(IDS.transfer).reason, /2004.*delet/i);
  assert.match(byId.get(IDS.window).reason, /switchpack/i);
  assert.match(byId.get(IDS.window).reason, /not.*cable/i);
  assert.equal(byId.get(IDS.thermostat).evidence[0].url, SOURCES.thermostat);
});
