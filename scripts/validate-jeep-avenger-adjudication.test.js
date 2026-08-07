/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jeep-avenger-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-avenger-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Avenger hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 5, total: 5 });
});

test('all five Avenger rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jeep Avenger ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Avenger').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official registry mismatches remain explicit instead of replacing identities', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.steering).reason, /motor.*housing.*crack|stuurbekrachtigingsmotor.*scheuren/i);
  assert.match(byId.get(IDS.steering).reason, /2023.*scope|year scope/i);
  assert.match(byId.get(IDS.startStop).reason, /continues? to run|blijft.*draaien|does not shut off/i);
  assert.match(byId.get(IDS.startStop).reason, /not.*stall/i);
  assert.match(byId.get(IDS.charge).reason, /NHTSA.*not.*primary source|not sold.*United States/i);
  assert.equal(byId.get(IDS.steering).evidence[0].url, SOURCES.rdwActions);
  assert.equal(byId.get(IDS.startStop).evidence[0].url, SOURCES.rdwActions);
});
