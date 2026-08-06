/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, MODEL_LABELS, fullRecord, hashValue } = require('./build-honda-delsol-adjudication');
const { validatePacket } = require('./validate-honda-delsol-adjudication');

const ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(ROOT, 'data', 'known-issue-honda-delsol-adjudication-2026-08-06.json');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
function fixture() { return { packet: JSON.parse(fs.readFileSync(PACKET, 'utf8')), snapshot: JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) }; }

test('valid Del Sol packet passes every invariant', () => {
  const { packet, snapshot } = fixture();
  assert.deepEqual(validatePacket(packet, snapshot), []);
});

test('all nine rows remain byte-for-byte bound to the frozen snapshot', () => {
  const { packet, snapshot } = fixture();
  const sourceRows = snapshot.records.filter((row) => row.make === 'Honda' && MODEL_LABELS.has(row.model));
  const sourceById = new Map(sourceRows.map((row) => [row.id, row]));
  assert.equal(packet.rows.length, 9);
  for (const row of packet.rows) {
    const frozen = fullRecord(sourceById.get(row.id));
    assert.deepEqual(row.before, frozen);
    assert.deepEqual(row.proposal, frozen);
    assert.equal(row.beforeSha256, hashValue(frozen));
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.equal(row.model, frozen.model);
    assert.deepEqual(row.changedFields, []);
  }
});

test('case split, overlapping pages and unrelated commerce are explicit review risks', () => {
  const { packet } = fixture();
  assert.deepEqual(packet.source.modelLabelCounts, { 'Del Sol': 3, 'del Sol': 6 });
  const roof = packet.observations.find((item) => item.code === 'roof-page-overlap');
  assert.deepEqual(roof.recordIds, [IDS.roofSeal, IDS.targaLeak]);
  const distributor = packet.observations.find((item) => item.code === 'distributor-page-overlap');
  assert.deepEqual(distributor.recordIds, [IDS.distributorGeneral, IDS.distributorSeal]);
  assert.ok(packet.observations.some((item) => item.code === 'unrelated-commerce-frozen'));
});

test('validator rejects mutation, archive, casing normalization and invented rewrite', () => {
  const first = fixture();
  first.packet.rows[0].proposal.title = 'mutated';
  first.packet.rows[0].proposalSha256 = hashValue(first.packet.rows[0].proposal);
  assert.ok(validatePacket(first.packet, first.snapshot).some((error) => error.includes('keep changed content')));

  const second = fixture();
  second.packet.rows[0].proposal.status = 'archived';
  second.packet.rows[0].proposalSha256 = hashValue(second.packet.rows[0].proposal);
  assert.ok(validatePacket(second.packet, second.snapshot).some((error) => error.includes('identity/status drift')));

  const third = fixture();
  const lowerCaseRow = third.packet.rows.find((row) => row.model === 'del Sol');
  lowerCaseRow.model = 'Del Sol';
  lowerCaseRow.proposal.model = 'Del Sol';
  lowerCaseRow.proposalSha256 = hashValue(lowerCaseRow.proposal);
  assert.ok(validatePacket(third.packet, third.snapshot).some((error) => error.includes('model casing changed')));

  const fourth = fixture();
  fourth.packet.rows[0].action = 'rewrite_same_identity';
  assert.ok(validatePacket(fourth.packet, fourth.snapshot).some((error) => error.includes('action mismatch')));
});
