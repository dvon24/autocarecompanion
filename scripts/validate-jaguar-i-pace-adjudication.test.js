/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-i-pace-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-i-pace-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('I-PACE hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 });
});
test('all four I-PACE rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) { assert.equal(row.action, 'keep_published_pending_source'); assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256); assert.deepEqual(row.changedFields, []); }
});
test('packet covers every frozen Jaguar I-PACE ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'I-PACE').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected); assert.deepEqual(Object.values(IDS).sort(), expected);
});
test('official source scope and outcome boundaries remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.battery12v).reason, /F69000.*F80955/i);
  assert.match(byId.get(IDS.battery12v).reason, /not.*U0155|does not.*U0155/i);
  assert.match(byId.get(IDS.coldWeather).reason, /prediction accuracy/i);
  assert.match(byId.get(IDS.coldWeather).reason, /not.*conditioning/i);
  assert.match(byId.get(IDS.contactor).reason, /no exact.*source|no.*exact.*bulletin/i);
  assert.match(byId.get(IDS.ota).reason, /2021-2023/i);
  assert.match(byId.get(IDS.ota).reason, /wired intervention/i);
  assert.equal(byId.get(IDS.battery12v).evidence[0].url, SOURCES.battery12v);
});
