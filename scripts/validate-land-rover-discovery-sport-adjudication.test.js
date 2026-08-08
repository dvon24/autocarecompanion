/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { TRANSMISSION_ID } = require('./build-land-rover-discovery-sport-adjudication');
const { EXPECTED_SUMMARY, PACKET, REQUIRED_OBSERVATIONS, SNAPSHOT, validatePacket } = require('./validate-land-rover-discovery-sport-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Discovery Sport packet covers all frozen rows and blocks unsupported identities', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.equal(packet.rows.length, 5);
  assert.deepEqual(packet.summary, EXPECTED_SUMMARY);
  assert.equal(packet.applicationGate.status, 'blocked');
  assert.equal(packet.applicationGate.blockerRecordIds.length, 4);
  assert.equal(REQUIRED_OBSERVATIONS.length, 9);
});

test('Discovery Sport packet preserves every indexed identity and removes unverified commerce', () => {
  for (const row of packet.rows) {
    for (const field of ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'status']) assert.deepEqual(row.proposal[field], row.before[field], `${row.id}: ${field}`);
    assert.equal(row.proposal.status, 'published');
    assert.deepEqual(row.proposal.dtcCodes, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.equal(row.proposal.humanApproved, false);
  }
  assert.equal(packet.rows.find((row) => row.id === TRANSMISSION_ID).action, 'rewrite_same_identity');
});

test('validator rejects SEO identity drift and search commerce', () => {
  const identityMutation = structuredClone(packet);
  identityMutation.rows[0].proposal.title += ' changed';
  assert.ok(validatePacket(identityMutation, snapshot).some((error) => /proposal drift|immutable title drift/.test(error)));

  const commerceMutation = structuredClone(packet);
  commerceMutation.rows[0].proposal.citations.push({ type: 'retailer', title: 'Search', url: 'https://www.amazon.com/s?k=9hp48' });
  assert.ok(validatePacket(commerceMutation, snapshot).some((error) => /proposal drift|non-primary|search commerce/.test(error)));
});
