/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { PIVI_ID } = require('./build-land-rover-defender-adjudication');
const { EXPECTED_SUMMARY, PACKET, REQUIRED_OBSERVATIONS, SNAPSHOT, validatePacket } = require('./validate-land-rover-defender-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Defender packet covers all frozen rows and passes the full safety gate', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.equal(packet.rows.length, 44);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
  assert.equal(packet.applicationGate.blockerRecordIds.length, 43);
  assert.equal(REQUIRED_OBSERVATIONS.length, 9);
});

test('Defender packet preserves every indexed identity and removes unsafe data', () => {
  for (const row of packet.rows) {
    for (const field of ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status']) assert.deepEqual(row.proposal[field], row.before[field], `${row.id}: ${field}`);
    assert.equal(row.proposal.status, 'published');
    assert.deepEqual(row.proposal.dtcCodes, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.equal(row.proposal.humanApproved, false);
  }
  assert.equal(packet.rows.find((row) => row.id === PIVI_ID).action, 'rewrite_same_identity');
});

test('validator rejects SEO identity drift', () => {
  const mutated = structuredClone(packet);
  mutated.rows[0].proposal.title += ' changed';
  assert.ok(validatePacket(mutated, snapshot).some((error) => /proposal drift|immutable title drift/.test(error)));
});
