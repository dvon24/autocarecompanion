/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CAMPAIGNS, HOLD_IDS, REWRITE_IDS } = require('./build-kia-ev9-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-ev9-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('EV9 packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 3, keep_published_pending_source: 1, total: 4 });
  assert.equal(packet.applicationGate.status, 'blocked');
});
test('three exact official identities get bounded no-retail rewrites', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(REWRITE_IDS)) {
    const row = byId.get(id); assert.equal(row.action, 'rewrite_same_identity'); assert.ok(row.changedFields.length > 0);
    assert.deepEqual(row.proposal.communityRecommendations, []); assert.deepEqual(row.proposal.fixParts, []);
    assert.match(row.commerceDecision, /^(dealer-only-no-retail-part|no-official-remedy-or-part)-/);
    assert.equal(row.proposal.title, row.before.title); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published');
  }
});
test('ICCU correction removes the false EV6 recall and cites Kia service actions', () => {
  const row = packet.rows.find((item) => item.id === REWRITE_IDS.iccu);
  assert.doesNotMatch(JSON.stringify(row.proposal), /24V200/i);
  assert.match(JSON.stringify(row.proposal.citations), /SA568/);
  assert.match(JSON.stringify(row.proposal.citations), /SA570/);
  assert.ok(row.evidence.some((item) => item.urls?.includes(CAMPAIGNS.wrongIccu)));
});
test('placeholder software aggregation stays frozen and blocks application', () => {
  const row = packet.rows.find((item) => item.id === HOLD_IDS.software);
  assert.equal(row.action, 'keep_published_pending_source'); assert.deepEqual(row.proposal, row.before); assert.equal(row.proposalSha256, row.beforeSha256);
  assert.match(JSON.stringify(row.before), /xyz123/); assert.match(JSON.stringify(row.before), /abcdef12345/);
  assert.deepEqual(packet.applicationGate.blockerRecordIds, [HOLD_IDS.software]);
});
test('all indexed EV9 identities and publication states are preserved', () => {
  assert.equal(packet.rows.length, 4);
  for (const row of packet.rows) { assert.equal(row.proposal.title, row.before.title); assert.equal(row.proposal.category, row.before.category); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published'); }
  assert.ok(packet.observations.some((item) => item.code === 'all-ev9-pages-preserved'));
});
