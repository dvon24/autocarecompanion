/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { REWRITE_IDS, SPECIAL_IDS } = require('./build-kia-carnival-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-carnival-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Carnival packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 4, keep_published_pending_source: 22, total: 26 });
});
test('four exact official identities get bounded commerce-free rewrites', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(REWRITE_IDS)) {
    const row = byId.get(id); assert.equal(row.action, 'rewrite_same_identity'); assert.ok(row.changedFields.length > 0);
    assert.deepEqual(row.proposal.communityRecommendations, []); assert.deepEqual(row.proposal.fixParts, []);
    assert.equal(row.proposal.title, row.before.title); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published');
  }
});
test('partial and conflated Carnival identities remain byte-for-byte holds', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(SPECIAL_IDS)) { const row = byId.get(id); assert.equal(row.action, 'keep_published_pending_source'); assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256); }
  assert.match(byId.get(SPECIAL_IDS.seatBelt).reason, /no such campaign|critical conflation/i);
  assert.match(byId.get(SPECIAL_IDS.slidingAutoReverse).reason, /23V236.*23V179/i);
  assert.match(byId.get(SPECIAL_IDS.cluster).reason, /2026.*2025/i);
});
test('all indexed Carnival identities and publication states are preserved', () => {
  assert.equal(packet.rows.length, 26);
  for (const row of packet.rows) { assert.equal(row.proposal.title, row.before.title); assert.equal(row.proposal.category, row.before.category); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published'); }
  assert.ok(packet.observations.some((item) => item.code === 'all-carnival-pages-preserved'));
});
