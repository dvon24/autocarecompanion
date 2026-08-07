/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { IDS } = require('./build-jeep-grand-cherokee-l-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-grand-cherokee-l-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Grand Cherokee L packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 0,
    keep_published_pending_source: 3,
    total: 3,
  });
});

test('all three Grand Cherokee L rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers the complete frozen Grand Cherokee L set', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee L')
    .map((row) => row.id)
    .sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official bulletins remain narrower than the frozen pages', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.uconnect).reason, /2022.*2021-2026/i);
  assert.match(byId.get(IDS.sunroof).reason, /wind deflector.*drain blockage/i);
  assert.match(byId.get(IDS.eTorque).reason, /48V.*12V.*starter/i);
});
