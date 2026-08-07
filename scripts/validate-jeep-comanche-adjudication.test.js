/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS } = require('./build-jeep-comanche-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-comanche-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Comanche packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 });
});

test('all three Comanche rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers the complete frozen Comanche set', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Comanche').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('the OBD-II and Renix year contradictions are explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.exhaust).reason, /P0420.*P0430.*1996|1996.*P0420.*P0430/i);
  assert.match(byId.get(IDS.renix).reason, /1990-1992.*1990.*1991\+/i);
  assert.match(byId.get(IDS.rust).reason, /structural.*weld|weld.*structural/i);
});
