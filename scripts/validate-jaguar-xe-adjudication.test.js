/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-xe-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-xe-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('XE hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 5, total: 5 });
});

test('all five XE rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jaguar XE ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'XE').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source scope, cause and remedy mismatches remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.dpf).reason, /60.*112.*20 minutes/i);
  assert.match(byId.get(IDS.dpf).reason, /2,500 RPM|80%/i);
  assert.match(byId.get(IDS.infotainment).reason, /InControl Touch Pro.*2017 onwards/i);
  assert.match(byId.get(IDS.infotainment).reason, /software issue.*no parts/i);
  assert.match(byId.get(IDS.suspension).reason, /no exact.*primary source/i);
  assert.match(byId.get(IDS.coolant).reason, /2019-21.*2\.0L Petrol/i);
  assert.match(byId.get(IDS.coolant).reason, /PCM software.*no parts/i);
  assert.match(byId.get(IDS.transmission).reason, /2018.*2\.0L Petrol/i);
  assert.match(byId.get(IDS.transmission).reason, /calibration software.*no parts/i);
  assert.equal(byId.get(IDS.infotainment).evidence[0].url, SOURCES.infotainment);
  assert.equal(byId.get(IDS.transmission).evidence[0].url, SOURCES.transmission);
});
