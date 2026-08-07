/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { REWRITE_IDS, SPECIAL_IDS } = require('./build-kia-ev6-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-ev6-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('EV6 packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 5, keep_published_pending_source: 16, total: 21 });
});
test('five exact official identities get bounded commerce-free rewrites', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(REWRITE_IDS)) {
    const row = byId.get(id); assert.equal(row.action, 'rewrite_same_identity'); assert.ok(row.changedFields.length > 0);
    assert.deepEqual(row.proposal.communityRecommendations, []); assert.deepEqual(row.proposal.fixParts, []);
    assert.equal(row.proposal.title, row.before.title); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published');
  }
});
test('partial, unsupported and new EV6 identities cannot alter indexed pages', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(SPECIAL_IDS)) { const row = byId.get(id); assert.equal(row.action, 'keep_published_pending_source'); assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256); }
  assert.match(byId.get(SPECIAL_IDS.coldCharging).reason, /2022.*2022-2023/i);
  assert.ok(packet.observations.some((item) => item.code === 'ev6-new-traction-battery-identity-deferred' && item.recordIds.length === 0));
  assert.ok(packet.observations.some((item) => item.code === 'ev6-nhtsa-empty-year-endpoint-gap' && /504/.test(item.detail)));
});
test('all indexed EV6 identities and publication states are preserved', () => {
  assert.equal(packet.rows.length, 21);
  for (const row of packet.rows) { assert.equal(row.proposal.title, row.before.title); assert.equal(row.proposal.category, row.before.category); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published'); }
  assert.ok(packet.observations.some((item) => item.code === 'all-ev6-pages-preserved'));
});
