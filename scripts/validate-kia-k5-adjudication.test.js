/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CITATION_REMOVAL_IDS, HOLD_IDS, REWRITE_IDS } = require('./build-kia-k5-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-k5-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('K5 packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
});

test('three exact identities get bounded dealer-only rewrites', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(REWRITE_IDS)) {
    const row = byId.get(id);
    assert.equal(row.action, 'rewrite_same_identity');
    assert.ok(row.changedFields.length);
    assert.match(row.commerceDecision, /^dealer-only-no-retail-part-/);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.equal(row.proposal.title, row.before.title);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
  }
  assert.deepEqual(byId.get(REWRITE_IDS.oilPump).proposal.trims, ['GT']);
  assert.deepEqual(byId.get(REWRITE_IDS.oilPump).proposal.relatedIssueIds, ['kia-sorento-dct-oil-pump-failure']);
  assert.doesNotMatch(JSON.stringify({ communityRecommendations: byId.get(REWRITE_IDS.oilPump).proposal.communityRecommendations, fixParts: byId.get(REWRITE_IDS.oilPump).proposal.fixParts }), /amazon\.com\/s\?k=/i);
});

test('placeholder citations and search commerce are explicitly removed but remain blockers', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(CITATION_REMOVAL_IDS)) {
    const row = byId.get(id);
    assert.equal(row.action, 'remove_false_citation_and_search_commerce_pending_source');
    assert.deepEqual(row.proposal.citations, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.doesNotMatch(JSON.stringify(row.proposal), /abcd1234efg|\/xyz123\//i);
    assert.ok(packet.applicationGate.blockerRecordIds.includes(id));
  }
});

test('eighteen unresolved rows stay byte-for-byte frozen', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(HOLD_IDS)) {
    const row = byId.get(id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.ok(packet.applicationGate.blockerRecordIds.includes(id));
  }
});

test('all indexed K5 identities and publication states are preserved', () => {
  assert.equal(packet.rows.length, 24);
  for (const row of packet.rows) {
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
  }
  assert.ok(packet.observations.some((item) => item.code === 'all-k5-pages-preserved'));
});
