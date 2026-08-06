/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, REWRITE_CARDS, SOURCES, fullRecord, hashValue } = require('./build-honda-fit-adjudication');
const { validatePacket } = require('./validate-honda-fit-adjudication');
const ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(ROOT, 'data', 'known-issue-honda-fit-adjudication-2026-08-06.json');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
function fixture() { return { packet: JSON.parse(fs.readFileSync(PACKET, 'utf8')), snapshot: JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) }; }

test('valid Fit packet passes every invariant', () => {
  const { packet, snapshot } = fixture();
  assert.deepEqual(validatePacket(packet, snapshot), []);
});

test('all eight source-gap rows remain byte-for-byte frozen', () => {
  const { packet, snapshot } = fixture();
  const sourceById = new Map(snapshot.records.filter((row) => row.model === 'Fit').map((row) => [row.id, row]));
  const keeps = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(keeps.length, 8);
  for (const row of keeps) {
    const frozen = fullRecord(sourceById.get(row.id));
    assert.deepEqual(row.before, frozen);
    assert.deepEqual(row.proposal, frozen);
    assert.equal(row.beforeSha256, hashValue(frozen));
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('three same-identity rewrites carry exact official scope and zero commerce', () => {
  const { packet } = fixture();
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.equal(rewrites.length, 3);
  for (const row of rewrites) {
    assert.deepEqual(row.proposal.years, REWRITE_CARDS[row.id].years);
    assert.deepEqual(row.proposal.trims, []);
    assert.deepEqual(row.proposal.engines, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.equal(row.proposal.estimatedCostLow, null);
    assert.equal(row.proposal.estimatedCostHigh, null);
  }
  assert.equal(packet.rows.find((row) => row.id === IDS.cvt).proposal.citations[0].url, SOURCES.cvt);
  assert.equal(packet.rows.find((row) => row.id === IDS.eps).proposal.citations[0].url, SOURCES.eps);
  assert.equal(packet.rows.find((row) => row.id === IDS.fuelPump).proposal.citations[0].url, SOURCES.fuelPump);
});

test('validator rejects mutation, archival, invented applicability and commerce', () => {
  const first = fixture();
  first.packet.rows.find((row) => row.id === IDS.acCompressor).proposal.title = 'mutated';
  first.packet.rows.find((row) => row.id === IDS.acCompressor).proposalSha256 = hashValue(first.packet.rows.find((row) => row.id === IDS.acCompressor).proposal);
  assert.ok(validatePacket(first.packet, first.snapshot).some((error) => error.includes('keep changed content')));
  const second = fixture();
  second.packet.rows.find((row) => row.id === IDS.cvt).proposal.status = 'archived';
  second.packet.rows.find((row) => row.id === IDS.cvt).proposalSha256 = hashValue(second.packet.rows.find((row) => row.id === IDS.cvt).proposal);
  assert.ok(validatePacket(second.packet, second.snapshot).some((error) => error.includes('identity/status drift')));
  const third = fixture();
  third.packet.rows.find((row) => row.id === IDS.eps).proposal.trims = ['Sport'];
  third.packet.rows.find((row) => row.id === IDS.eps).proposalSha256 = hashValue(third.packet.rows.find((row) => row.id === IDS.eps).proposal);
  assert.ok(validatePacket(third.packet, third.snapshot).some((error) => error.includes('invented applicability')));
  const fourth = fixture();
  fourth.packet.rows.find((row) => row.id === IDS.fuelPump).proposal.fixParts = [{ name: 'pump' }];
  fourth.packet.rows.find((row) => row.id === IDS.fuelPump).proposalSha256 = hashValue(fourth.packet.rows.find((row) => row.id === IDS.fuelPump).proposal);
  assert.ok(validatePacket(fourth.packet, fourth.snapshot).some((error) => error.includes('contains commerce')));
});
