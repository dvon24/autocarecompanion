/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS } = require('./build-jeep-commander-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-commander-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Commander packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 });
});
test('all four Commander rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) { assert.equal(row.action, 'keep_published_pending_source'); assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256); assert.deepEqual(row.changedFields, []); }
});
test('packet covers the complete frozen Commander set', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Commander').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected); assert.deepEqual(Object.values(IDS).sort(), expected);
});
test('campaign, diagnostic-code and part conflicts stay explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.transmission).reason, /08V203.*engine.*stall.*not.*transmission.*overheat/i);
  assert.match(byId.get(IDS.electrical).reason, /P0401.*P0404.*EGR/i);
  assert.match(byId.get(IDS.stalling).reason, /56028373AB.*56028666AB/i);
});
