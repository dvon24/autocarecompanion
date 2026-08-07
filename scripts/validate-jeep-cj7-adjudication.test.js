/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS } = require('./build-jeep-cj7-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-cj7-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('CJ-7 packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 });
});

test('all six CJ-7 records remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
    assert.equal(row.proposal.status, 'published');
  }
});

test('packet covers every frozen CJ-7 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'CJ-7').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('partial fitment and safety-sensitive procedure gaps remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.axle).reason, /1982-1986.*1976-1986/i);
  assert.match(byId.get(IDS.steering).reason, /1982-1986.*1976-1986/i);
  assert.match(byId.get(IDS.carb).reason, /emissions.*delete|delete.*emissions/i);
  assert.match(byId.get(IDS.frame).reason, /structural.*weld|weld.*structural/i);
});
