/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, MISMATCH_SOURCES, fullRecord, hashValue } = require('./build-honda-element-adjudication');
const { validatePacket } = require('./validate-honda-element-adjudication');
const ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(ROOT, 'data', 'known-issue-honda-element-adjudication-2026-08-06.json');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
function fixture() { return { packet: JSON.parse(fs.readFileSync(PACKET, 'utf8')), snapshot: JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) }; }

test('valid Element packet passes every invariant', () => {
  const { packet, snapshot } = fixture();
  assert.deepEqual(validatePacket(packet, snapshot), []);
});

test('all eleven Element rows remain byte-for-byte frozen', () => {
  const { packet, snapshot } = fixture();
  const sourceById = new Map(snapshot.records.filter((row) => row.model === 'Element').map((row) => [row.id, row]));
  assert.equal(packet.rows.length, 11);
  for (const row of packet.rows) {
    const frozen = fullRecord(sourceById.get(row.id));
    assert.deepEqual(row.before, frozen);
    assert.deepEqual(row.proposal, frozen);
    assert.equal(row.beforeSha256, hashValue(frozen));
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('false Element bulletin matches are exposed with exact mismatch evidence', () => {
  const { packet } = fixture();
  const timing = packet.rows.find((row) => row.id === IDS.timing);
  const transmission = packet.rows.find((row) => row.id === IDS.transmission);
  assert.equal(timing.evidence[0].url, MISMATCH_SOURCES.vtcBulletin);
  assert.match(timing.evidence[0].observation, /does not list Element/i);
  assert.equal(transmission.evidence[0].url, MISMATCH_SOURCES.accordTransmissionRecall);
  assert.match(transmission.evidence[0].observation, /Accord V6/i);
  assert.ok(packet.observations.some((item) => item.code === 'differential-bulletin-model-mismatch'));
  assert.ok(packet.observations.some((item) => item.code === 'door-lock-component-mismatch'));
});

test('validator rejects mutation, archival and invented rewrite', () => {
  const first = fixture();
  first.packet.rows[0].proposal.title = 'mutated';
  first.packet.rows[0].proposalSha256 = hashValue(first.packet.rows[0].proposal);
  assert.ok(validatePacket(first.packet, first.snapshot).some((error) => error.includes('keep changed content')));
  const second = fixture();
  second.packet.rows[0].proposal.status = 'archived';
  second.packet.rows[0].proposalSha256 = hashValue(second.packet.rows[0].proposal);
  assert.ok(validatePacket(second.packet, second.snapshot).some((error) => error.includes('identity/status drift')));
  const third = fixture();
  third.packet.rows[0].action = 'rewrite_same_identity';
  assert.ok(validatePacket(third.packet, third.snapshot).some((error) => error.includes('action mismatch')));
});
