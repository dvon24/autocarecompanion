/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CLEANUP_IDS, HOLD_IDS, IDS, REWRITE_IDS } = require('./build-kia-niro-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-niro-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const byId = new Map(packet.rows.map((row) => [row.id, row]));

test('Niro packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
});

test('three exact official identities receive bounded rewrites', () => {
  for (const id of REWRITE_IDS) {
    const row = byId.get(id);
    assert.equal(row.action, 'rewrite_same_identity');
    assert.equal(row.proposal.title, row.before.title);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
  }
  assert.match(byId.get(IDS.pra).proposal.solution, /22V-836\/SC256/);
  assert.match(byId.get(IDS.hca).proposal.solution, /different-capacity HCA fuse/);
  assert.match(byId.get(IDS.ehrs).proposal.solution, /diagnostic check/);
});

test('four critical cleanups remove false codes, search commerce and bad deep links', () => {
  for (const id of CLEANUP_IDS) {
    const row = byId.get(id);
    assert.equal(row.action, 'targeted_safety_cleanup_pending_source');
    assert.equal(row.proposal.humanApproved, false);
    assert.doesNotMatch(JSON.stringify(row.proposal), /amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/);
    assert.ok(packet.applicationGate.blockerRecordIds.includes(id));
  }
  assert.deepEqual(byId.get(IDS.braking).proposal.dtcCodes, []);
  assert.deepEqual(byId.get(IDS.obc).proposal.dtcCodes, []);
  assert.deepEqual(byId.get(IDS.dct).proposal.relatedIssueIds, []);
  assert.doesNotMatch(byId.get(IDS.dct).proposal.solution, /MaxLife|flush kit/i);
});

test('three broad aggregations stay byte-for-byte frozen', () => {
  for (const id of HOLD_IDS) {
    const row = byId.get(id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
  }
});

test('all indexed Niro identities and publication states are preserved', () => {
  assert.equal(packet.rows.length, 10);
  for (const row of packet.rows) {
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
  }
  assert.ok(packet.observations.some((item) => item.code === 'all-niro-pages-preserved'));
});
