/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-xf-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-xf-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('XF hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 });
});

test('all six XF rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jaguar XF ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'XF').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source identity, scope and remedy mismatches remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.pcv).reason, /no exact.*primary source/i);
  assert.match(byId.get(IDS.dpf).reason, /60.*112.*20 minutes/i);
  assert.match(byId.get(IDS.timing).reason, /LTB00473.*not.*verif/i);
  assert.match(byId.get(IDS.timing).reason, /LTB00474NAS2.*Land Rover/i);
  assert.match(byId.get(IDS.turboHose).reason, /H291.*coolant-pump.*PCM software.*no parts/i);
  assert.match(byId.get(IDS.window).reason, /2012-2014.*squeak.*lubricat/i);
  assert.match(byId.get(IDS.mechatronic).reason, /below 2,500 miles/i);
  assert.match(byId.get(IDS.mechatronic).reason, /P0715-64.*P0700-02/i);
  assert.equal(byId.get(IDS.window).evidence[0].url, SOURCES.window);
  assert.equal(byId.get(IDS.mechatronic).evidence[0].url, SOURCES.mechatronic);
});
