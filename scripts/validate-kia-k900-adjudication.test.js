/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS } = require('./build-kia-k900-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-k900-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('K900 packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
  assert.equal(packet.rows.length, 5);
});

test('every K900 proposal removes unverified search commerce', () => {
  for (const row of packet.rows) {
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.doesNotMatch(JSON.stringify(row.proposal), /amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/i);
    assert.ok(row.changedFields.length);
    assert.ok(packet.applicationGate.blockerRecordIds.includes(row.id));
  }
});

test('false or unverifiable citations and the inexact relation are explicit corrections', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.deepEqual(byId.get(IDS.drl).proposal.citations, []);
  assert.doesNotMatch(JSON.stringify(byId.get(IDS.drl).proposal), /abcd1234efg/i);
  assert.deepEqual(byId.get(IDS.engine).proposal.citations, []);
  assert.deepEqual(byId.get(IDS.infotainment).proposal.citations, []);
  assert.deepEqual(byId.get(IDS.transmission).proposal.relatedIssueIds, []);
});

test('all indexed K900 identities and publication states are preserved', () => {
  for (const row of packet.rows) {
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
    assert.equal(row.proposal.humanApproved, false);
  }
  assert.ok(packet.observations.some((item) => item.code === 'all-k900-pages-preserved'));
});
