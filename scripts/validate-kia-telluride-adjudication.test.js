/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CLEANUP_IDS, IDS, PDF_SOURCES, REWRITE_IDS } = require('./build-kia-telluride-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-telluride-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const byId = new Map(packet.rows.map((row) => [row.id, row]));

test('Telluride packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.deepEqual(packet.applicationGate.blockerRecordIds, CLEANUP_IDS.slice().sort());
});
test('six exact recall identities get bounded dealer-only rewrites', () => {
  for (const id of REWRITE_IDS) {
    const row = byId.get(id);
    assert.equal(row.action, 'rewrite_same_identity');
    assert.match(row.commerceDecision, /^dealer-only-no-retail-part-/);
    assert.equal(row.proposal.citations.length, 1);
    assert.deepEqual(row.proposal.dtcCodes, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
  }
});
test('the incorrect-spare page uses 25V745 and explicitly rejects 25V722', () => {
  const row = byId.get(IDS.spare);
  assert.match(row.proposal.description, /25V745000/);
  assert.match(row.proposal.solution, /not the previously cited 25V722/);
  assert.doesNotMatch(row.proposal.description, /25V-?722/);
});
test('the seat page uses the superseding SC374 electronic-fuse remedy', () => {
  const row = byId.get(IDS.seat);
  assert.match(row.proposal.description, /26V430000/);
  assert.match(row.proposal.description, /replaces 24V407/i);
  assert.match(row.proposal.solution, /electronic fuse assembly/i);
  assert.match(row.proposal.solution, /Vehicles already repaired under 24V407\/SC316 still need the new remedy/i);
  assert.deepEqual(row.proposal.dtcCodes, []);
});
test('three narrow transmission programs remain distinct', () => {
  const row = byId.get(IDS.transmission);
  assert.match(row.proposal.description, /TRA089/);
  assert.match(row.proposal.description, /SA428/);
  assert.match(row.proposal.description, /SA490/);
  assert.match(row.proposal.solution, /19 listed VINs/i);
  assert.match(row.proposal.solution, /Do not apply a universal reflash-first/i);
});
test('windshield and infotainment sources are not stretched beyond their exact scope', () => {
  const windshield = byId.get(IDS.windshield);
  const infotainment = byId.get(IDS.infotainment);
  assert.equal(windshield.proposal.citations[0].url, PDF_SOURCES.windshieldInitiative.url);
  assert.match(windshield.proposal.description, /not a campaign/i);
  assert.doesNotMatch(JSON.stringify(windshield.proposal), /46%|ClearPlex|Safelite|glass thickness/i);
  assert.equal(infotainment.proposal.citations[0].url, PDF_SOURCES.ele320.url);
  assert.match(infotainment.proposal.description, /2020-2022 Telluride/i);
  assert.match(infotainment.proposal.solution, /separate diagnostic conditions/i);
});
test('all links are primary direct sources and unsupported DIY commerce is gone', () => {
  for (const row of packet.rows) {
    for (const citation of row.proposal.citations) assert.match(citation.url, /^https:\/\/(?:api|static)\.nhtsa\.gov\//);
    assert.doesNotMatch(JSON.stringify(row.proposal), /amazon\.com\/s\?k=|ebay\.com\/sch|rockauto\.com\/en\/partsearch|abcd1234efg|comments\/abcd12\//i);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
  }
});
test('all indexed Telluride identities, applicability fields and publication states are preserved', () => {
  assert.equal(packet.rows.length, 14);
  for (const row of packet.rows) {
    for (const field of ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status']) assert.deepEqual(row.proposal[field], row.before[field]);
    assert.equal(row.proposal.status, 'published');
    assert.equal(row.proposal.humanApproved, false);
  }
});
