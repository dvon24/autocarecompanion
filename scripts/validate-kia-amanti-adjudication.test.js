/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS } = require('./build-kia-amanti-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-amanti-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Amanti packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 5, total: 5 });
});

test('all five Amanti rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('critical source and commerce conflicts are explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.transmission).reason, /SP-III.*MaxLife.*flush/i);
  assert.match(byId.get(IDS.timing).reason, /3\.5L.*3\.8L.*2004-2009/i);
  assert.match(byId.get(IDS.alternator).reason, /power-window regulator/i);
  assert.ok(packet.observations.some((item) => item.code === 'all-amanti-pages-preserved'));
});
