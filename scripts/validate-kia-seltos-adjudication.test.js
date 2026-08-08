/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CLEANUP_IDS, IDS, REWRITE_IDS } = require('./build-kia-seltos-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-seltos-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const byId = new Map(packet.rows.map((row) => [row.id, row]));

test('Seltos packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.deepEqual(packet.applicationGate.blockerRecordIds, CLEANUP_IDS.slice().sort());
});

test('DCT and IVT advice is bounded to official years, codes and procedures', () => {
  assert.match(byId.get(IDS.dct).proposal.description, /replaced the outgoing 7-speed DCT with an 8-speed automatic/i);
  assert.deepEqual(byId.get(IDS.dct).proposal.dtcCodes, ['P060194']);
  assert.match(byId.get(IDS.ivt).proposal.description, /certain 2021 Seltos/i);
  assert.deepEqual(byId.get(IDS.ivt).proposal.dtcCodes, ['P0730', 'P0731', 'P0741', 'P0867']);
});

test('wrong campaign numbers and unsupported counts are corrected', () => {
  assert.match(byId.get(IDS.isgPump).proposal.solution, /Do not substitute recall 23V578/i);
  assert.match(byId.get(IDS.postRemedy).proposal.description, /reviewing 47 complaints/i);
  assert.match(byId.get(IDS.postRemedy).proposal.description, /does not document 400-plus stalling complaints or four fires/i);
});

test('piston and airbag rewrites preserve exact safety instructions', () => {
  assert.match(byId.get(IDS.piston).proposal.solution, /not driving the vehicle and requesting a tow/i);
  assert.deepEqual(byId.get(IDS.piston).proposal.dtcCodes, ['P1327']);
  assert.match(byId.get(IDS.airbag).proposal.description, /no advance warning/i);
  assert.deepEqual(byId.get(IDS.airbag).proposal.symptoms, []);
});

test('all nine pages receive cleanup with indexed identity and commerce preserved safely', () => {
  assert.equal(packet.rows.length, 9);
  for (const id of [...CLEANUP_IDS, ...REWRITE_IDS]) {
    const row = byId.get(id);
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.deepEqual(row.proposal.trims, row.before.trims);
    assert.deepEqual(row.proposal.engines, row.before.engines);
    assert.equal(row.proposal.status, 'published');
    assert.equal(row.proposal.humanApproved, false);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.deepEqual(row.proposal.relatedIssueIds, []);
    assert.match(row.commerceDecision, /^(?:dealer-only-no-retail-part|no-commerce)/);
  }
});
