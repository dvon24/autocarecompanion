/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { HOLD_IDS, REWRITE_ID } = require('./build-kia-morning-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-morning-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Morning packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
});

test('the exact Korean PCV recall gets one bounded dealer-only rewrite', () => {
  const row = packet.rows.find((item) => item.id === REWRITE_ID);
  assert.equal(row.action, 'rewrite_same_identity');
  assert.match(row.commerceDecision, /^dealer-only-no-retail-part-/);
  assert.deepEqual(row.proposal.years, [2011, 2012]);
  assert.deepEqual(row.proposal.communityRecommendations, []);
  assert.deepEqual(row.proposal.fixParts, []);
  assert.equal(row.proposal.title, row.before.title);
  assert.equal(row.proposal.status, 'published');
  assert.ok(row.proposal.citations.some((citation) => citation.url.includes('boardId=343514')));
});

test('five source or boundary conflicts remain byte-for-byte holds', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  for (const id of Object.values(HOLD_IDS)) {
    const row = byId.get(id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.ok(packet.applicationGate.blockerRecordIds.includes(id));
  }
  assert.deepEqual(byId.get(HOLD_IDS.fuelHose).proposal.years, [2011, 2012, 2013]);
});

test('all indexed Morning identities and publication states are preserved', () => {
  assert.equal(packet.rows.length, 6);
  for (const row of packet.rows) {
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
  }
  assert.ok(packet.observations.some((item) => item.code === 'all-morning-pages-preserved'));
});
