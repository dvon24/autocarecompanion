/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { IDS } = require('./build-jeep-gladiator-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-gladiator-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Gladiator packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 0,
    keep_published_pending_source: 9,
    total: 9,
  });
});

test('all nine Gladiator rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers the complete frozen Gladiator set', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Jeep' && row.model === 'Gladiator')
    .map((row) => row.id)
    .sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('citation and powertrain mismatches remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.clutchFire).reason, /23V116.*2020-2023.*2020-2024/i);
  assert.match(byId.get(IDS.deathWobble).reason, /21V853.*Volkswagen.*Tiguan/i);
  assert.match(byId.get(IDS.autoPark).reason, /Wagoneer|Ram.*5\.7L|5\.7L.*Ram/i);
  assert.match(byId.get(IDS.rearWindow).reason, /marine sealant|silicone/i);
});
