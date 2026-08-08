/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CLEANUP_IDS, IDS, REWRITE_IDS } = require('./build-kia-optima-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-optima-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const byId = new Map(packet.rows.map((row) => [row.id, row]));

test('Optima packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
});
test('five exact official identities receive bounded dealer-only rewrites', () => {
  for (const id of REWRITE_IDS) {
    const row = byId.get(id); assert.equal(row.action, 'rewrite_same_identity'); assert.equal(row.proposal.title, row.before.title); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published'); assert.deepEqual(row.proposal.communityRecommendations, []); assert.deepEqual(row.proposal.fixParts, []);
  }
  assert.match(byId.get(IDS.acu).proposal.solution, /extension wiring-harness kit/i);
  assert.match(byId.get(IDS.dct).proposal.solution, /event 541/i);
  assert.match(byId.get(IDS.dct).proposal.solution, /TRA083/);
});
test('eight blocked aggregations receive only targeted cleanup', () => {
  for (const id of CLEANUP_IDS) {
    const row = byId.get(id); assert.equal(row.action, 'targeted_safety_cleanup_pending_source'); assert.equal(row.proposal.humanApproved, false); assert.deepEqual(row.proposal.communityRecommendations, []); assert.deepEqual(row.proposal.fixParts, []); assert.doesNotMatch(JSON.stringify(row.proposal), /amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/); assert.ok(packet.applicationGate.blockerRecordIds.includes(id));
  }
  assert.deepEqual(byId.get(IDS.hybridBattery).proposal.dtcCodes, []);
  assert.deepEqual(byId.get(IDS.hybridBattery).proposal.citations, []);
});
test('all indexed Optima identities and publication states are preserved', () => {
  assert.equal(packet.rows.length, 13);
  for (const row of packet.rows) { assert.equal(row.proposal.title, row.before.title); assert.equal(row.proposal.category, row.before.category); assert.deepEqual(row.proposal.years, row.before.years); assert.equal(row.proposal.status, 'published'); }
  assert.ok(packet.observations.some((item) => item.code === 'all-optima-pages-preserved'));
});
