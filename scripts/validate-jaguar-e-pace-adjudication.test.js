/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
  IDS,
  SOURCES,
} = require('./build-jaguar-e-pace-adjudication');
const {
  PACKET,
  SNAPSHOT,
  validatePacket,
} = require('./validate-jaguar-e-pace-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('E-PACE hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 0,
    keep_published_pending_source: 4,
    total: 4,
  });
});

test('all four E-PACE rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jaguar E-PACE ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'E-PACE').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source mismatches are documented instead of silently rewritten', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.transmission).reason, /2018|Z00001|P07D4|P07DF/i);
  assert.match(byId.get(IDS.infotainment).reason, /iOS 13/i);
  assert.match(byId.get(IDS.infotainment).reason, /does not establish.*freeze/i);
  assert.match(byId.get(IDS.roof).reason, /sun blind/i);
  assert.match(byId.get(IDS.roof).reason, /not.*water[- ]leak/i);
  assert.match(byId.get(IDS.coolant).reason, /thermostat/i);
  assert.match(byId.get(IDS.coolant).reason, /not.*turbo.*hose/i);
  assert.equal(byId.get(IDS.transmission).evidence[0].url, SOURCES.transmission);
});
