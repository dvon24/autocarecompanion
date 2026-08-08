/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { CLEANUP_IDS, IDS } = require('./build-kia-sedona-adjudication');
const { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket } = require('./validate-kia-sedona-adjudication');
const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const byId = new Map(packet.rows.map((row) => [row.id, row]));

test('Sedona packet passes its blocked proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
  assert.equal(packet.applicationGate.blockerRecordIds.length, 5);
});

test('battery page no longer attributes all years to the sliding-door module', () => {
  const row = byId.get(IDS.battery);
  assert.match(row.proposal.description, /Neither bulletin identifies the power sliding-door module/i);
  assert.match(row.proposal.solution, /Do not pull a generic fuse/i);
  assert.equal(row.proposal.citations.length, 2);
});

test('false Dorman Sedona cable fitment is explicitly removed', () => {
  const row = byId.get(IDS.cable);
  assert.match(row.proposal.description, /liftgate-glass hinge for 2008-2012 Jeep Liberty/i);
  assert.match(row.proposal.solution, /Do not order Dorman 924-554/i);
  assert.deepEqual(row.proposal.communityRecommendations, []);
});

test('transmission page separates 6AT and 8AT and removes routine flush advice', () => {
  const row = byId.get(IDS.transmission);
  assert.match(row.proposal.description, /conflates two transmissions/i);
  assert.match(row.proposal.solution, /only when a transmission is replaced/i);
  assert.match(row.proposal.solution, /Do not perform a routine 30,000-mile flush/i);
  assert.deepEqual(row.proposal.dtcCodes, ['P0741']);
});

test('door and alternator claims remain within official boundaries', () => {
  assert.match(byId.get(IDS.latch).proposal.description, /different sliding-door concerns by Sedona generation/i);
  assert.match(byId.get(IDS.latch).proposal.solution, /WTY018/);
  assert.match(byId.get(IDS.alternator).proposal.solution, /Do not add improvised heat shielding/i);
});

test('all five pages receive cleanup and preserve indexed identity', () => {
  assert.equal(packet.rows.length, 5);
  for (const id of CLEANUP_IDS) {
    const row = byId.get(id);
    assert.equal(row.action, 'targeted_safety_cleanup_pending_source');
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.deepEqual(row.proposal.years, row.before.years);
    assert.equal(row.proposal.status, 'published');
    assert.equal(row.proposal.humanApproved, false);
    assert.deepEqual(row.proposal.fixParts, []);
  }
});
