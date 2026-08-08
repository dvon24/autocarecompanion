/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CLEANUP_IDS, IDS, REWRITE_ID } = require('./build-kia-rio-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-rio-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const byId = new Map(packet.rows.map((row) => [row.id, row]));

test('Rio packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
  assert.equal(packet.applicationGate.blockerRecordIds.length, 13);
});

test('the exact HECU recall receives one bounded dealer-only rewrite', () => {
  const row = byId.get(REWRITE_ID);
  assert.equal(row.action, 'rewrite_same_identity');
  assert.match(row.proposal.description, /23V-652/);
  assert.match(row.proposal.solution, /replace the HECU fuse/i);
  assert.doesNotMatch(JSON.stringify(row.proposal), /wheel speed sensor/i);
  assert.deepEqual(row.proposal.years, row.before.years);
  assert.deepEqual(row.proposal.dtcCodes, []);
  assert.deepEqual(row.proposal.communityRecommendations, []);
});

test('false Rio recall claims are removed without retiring either page', () => {
  const brake = byId.get(IDS.brakeSwitch);
  const spring = byId.get(IDS.spring);
  assert.match(brake.proposal.description, /contains no Rio/i);
  assert.doesNotMatch(brake.proposal.description, /Kia issued a recall covering/i);
  assert.match(spring.proposal.description, /no front-coil-spring campaign/i);
  assert.equal(brake.proposal.status, 'published');
  assert.equal(spring.proposal.status, 'published');
});

test('near-match bulletins are bounded to the exact Rio generation and years', () => {
  assert.match(byId.get(IDS.ivt).proposal.solution, /Do not apply the 2020-only SA476/);
  assert.deepEqual(byId.get(IDS.fca).proposal.dtcCodes, ['C160649']);
  assert.match(byId.get(IDS.fca).proposal.description, /does not establish false braking alerts/i);
  assert.match(byId.get(IDS.camera).proposal.solution, /Do not apply ELE077/);
  assert.match(byId.get(IDS.evap).proposal.description, /distinct canister-close-valve condition on some 2012-2017/);
});

test('Kia injector guidance reverses the unsafe frozen deposit advice', () => {
  const row = byId.get(IDS.injector);
  assert.match(row.proposal.description, /deposits are normal/i);
  assert.match(row.proposal.solution, /Do not replace all four injectors/i);
  assert.match(row.proposal.solution, /mechanical injector cleaning/i);
  assert.equal(row.proposal.citations.length, 1);
  assert.deepEqual(row.proposal.communityRecommendations, []);
});

test('all thirteen conflicted pages receive cleanup and remain blockers', () => {
  for (const id of CLEANUP_IDS) {
    const row = byId.get(id);
    assert.equal(row.action, 'targeted_safety_cleanup_pending_source');
    assert.equal(row.proposal.humanApproved, false);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.ok(packet.applicationGate.blockerRecordIds.includes(id));
  }
});

test('every indexed Rio identity and publication state is preserved', () => {
  assert.equal(packet.rows.length, 14);
  for (const row of packet.rows) {
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
  }
  assert.ok(packet.observations.some((item) => item.code === 'all-rio-pages-preserved'));
});
