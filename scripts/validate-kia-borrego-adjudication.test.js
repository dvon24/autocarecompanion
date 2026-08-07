/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS } = require('./build-kia-borrego-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-borrego-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Borrego packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 });
});
test('all four Borrego rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) { assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256); assert.deepEqual(row.changedFields, []); }
});
test('critical fluid, structural and fitment conflicts are explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.transfer).reason, /ATF.*75W-90/i);
  assert.match(byId.get(IDS.timing).reason, /manufacturer fitment.*9-0908SA/i);
  assert.match(byId.get(IDS.rust).reason, /structural weld/i);
  assert.ok(packet.observations.some((item) => item.code === 'all-borrego-pages-preserved'));
});
