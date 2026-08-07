/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { ALL_IDS, IDS } = require('./build-jeep-grand-wagoneer-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-grand-wagoneer-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Grand Wagoneer packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 24, total: 24 });
});

test('all 24 Grand Wagoneer rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers the complete frozen Grand Wagoneer set', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Grand Wagoneer').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual([...ALL_IDS].sort(), expected);
});

test('airbag recalls and trim recall remain exact and distinct', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.airbags).reason, /21V873.*2022.*23V545.*2022-2023/i);
  assert.match(byId.get(IDS.quarterTrim).reason, /25V642.*2022-2024/i);
  assert.equal(packet.sourceQuality['no-citations'], 14);
  assert.equal(packet.sourceQuality.placeholder, 3);
});
