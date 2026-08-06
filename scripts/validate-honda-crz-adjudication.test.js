/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES, fullRecord, hashValue } = require('./build-honda-crz-adjudication');
const { validatePacket } = require('./validate-honda-crz-adjudication');

const ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(ROOT, 'data', 'known-issue-honda-crz-adjudication-2026-08-06.json');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
function fixture() { return { packet: JSON.parse(fs.readFileSync(PACKET, 'utf8')), snapshot: JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) }; }

test('valid CR-Z packet passes every invariant', () => {
  const { packet, snapshot } = fixture();
  assert.deepEqual(validatePacket(packet, snapshot), []);
});

test('A/C and clutch-slave rows remain byte-for-byte frozen', () => {
  const { packet, snapshot } = fixture();
  const sourceById = new Map(snapshot.records.filter((row) => row.model === 'CR-Z').map((row) => [row.id, row]));
  for (const id of [IDS.acCompressor, IDS.clutchSlave]) {
    const row = packet.rows.find((item) => item.id === id);
    const frozen = fullRecord(sourceById.get(id));
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, frozen);
    assert.equal(row.proposalSha256, hashValue(frozen));
  }
});

test('IMA correction uses exact Honda scope, DTC and no commerce', () => {
  const { packet } = fixture();
  const row = packet.rows.find((item) => item.id === IDS.imaBattery);
  assert.equal(row.action, 'rewrite_same_identity');
  assert.deepEqual(row.proposal.years, [2011, 2012]);
  assert.deepEqual(row.proposal.dtcCodes, ['P0A7F']);
  assert.deepEqual(row.proposal.trims, []);
  assert.deepEqual(row.proposal.engines, []);
  assert.deepEqual(row.proposal.communityRecommendations, []);
  assert.deepEqual(row.proposal.fixParts, []);
  assert.equal(row.proposal.citations[0].url, SOURCES.imaBattery);
  assert.match(row.proposal.description, /not permanent battery degradation/i);
});

test('validator rejects hold mutation, archive, commerce and permanent-degradation overstatement', () => {
  const first = fixture();
  const hold = first.packet.rows.find((row) => row.id === IDS.acCompressor);
  hold.proposal.title = 'mutated';
  hold.proposalSha256 = hashValue(hold.proposal);
  assert.ok(validatePacket(first.packet, first.snapshot).some((error) => error.includes('keep changed content')));

  const second = fixture();
  const rewrite = second.packet.rows.find((row) => row.id === IDS.imaBattery);
  rewrite.proposal.status = 'archived';
  rewrite.proposalSha256 = hashValue(rewrite.proposal);
  assert.ok(validatePacket(second.packet, second.snapshot).some((error) => error.includes('identity/status drift')));

  const third = fixture();
  const commerce = third.packet.rows.find((row) => row.id === IDS.imaBattery);
  commerce.proposal.fixParts = [{ name: 'unsafe' }];
  commerce.proposalSha256 = hashValue(commerce.proposal);
  assert.ok(validatePacket(third.packet, third.snapshot).some((error) => error.includes('commerce remains')));

  const fourth = fixture();
  const overstatement = fourth.packet.rows.find((row) => row.id === IDS.imaBattery);
  overstatement.proposal.description = overstatement.proposal.description.replace('not permanent battery degradation', 'permanent battery degradation');
  overstatement.proposalSha256 = hashValue(overstatement.proposal);
  assert.ok(validatePacket(fourth.packet, fourth.snapshot).some((error) => error.includes('memory-effect disclaimer missing')));
});
