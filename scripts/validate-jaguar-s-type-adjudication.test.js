/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-s-type-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-s-type-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('S-TYPE hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 });
});

test('all three S-TYPE rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jaguar S-TYPE ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'S-TYPE').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source and powertrain mismatches remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.electrical).reason, /no exact.*primary source/i);
  assert.match(byId.get(IDS.timing).reason, /303-68.*does not include.*S-TYPE/i);
  assert.match(byId.get(IDS.timing).reason, /4\.2L/i);
  assert.match(byId.get(IDS.transmission).reason, /5R55N/i);
  assert.match(byId.get(IDS.transmission).reason, /JF506E.*X-TYPE/i);
  assert.match(byId.get(IDS.transmission).reason, /adaptive.*strategy/i);
  assert.equal(byId.get(IDS.transmission).evidence[0].url, SOURCES.transmission);
});
