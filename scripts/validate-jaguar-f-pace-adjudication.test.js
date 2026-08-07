/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-f-pace-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-f-pace-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('F-PACE hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 });
});

test('all six F-PACE rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jaguar F-PACE ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'F-PACE').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source scope and component mismatches remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.coolant).reason, /2017.*VIN|VIN.*2017/i);
  assert.match(byId.get(IDS.coolant).reason, /chafe/i);
  assert.match(byId.get(IDS.infotainment).reason, /root cause.*investigation/i);
  assert.match(byId.get(IDS.roof).reason, /XJ/i);
  assert.match(byId.get(IDS.rearDifferential).reason, /spring isolator/i);
  assert.match(byId.get(IDS.waterPump).reason, /2019-2021|2019-21/i);
  assert.match(byId.get(IDS.waterPump).reason, /PCM|software/i);
  assert.match(byId.get(IDS.transmission).reason, /calibration|software/i);
  assert.match(byId.get(IDS.transmission).reason, /not.*valve body/i);
  assert.equal(byId.get(IDS.coolant).evidence[0].url, SOURCES.coolant);
});
