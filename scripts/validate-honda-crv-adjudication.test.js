/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, REWRITE_CARDS, fullRecord, hashValue } = require('./build-honda-crv-adjudication');
const { validatePacket } = require('./validate-honda-crv-adjudication');

const ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(ROOT, 'data', 'known-issue-honda-crv-adjudication-2026-08-06.json');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');

function fixture() {
  return {
    packet: JSON.parse(fs.readFileSync(PACKET, 'utf8')),
    snapshot: JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')),
  };
}

function byId(packet, id) {
  return packet.rows.find((row) => row.id === id);
}

test('valid CR-V packet passes every invariant', () => {
  const { packet, snapshot } = fixture();
  assert.deepEqual(validatePacket(packet, snapshot), []);
});

test('all 34 hold rows are byte-for-byte equivalent to the frozen snapshot', () => {
  const { packet, snapshot } = fixture();
  const sourceById = new Map(snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'CR-V').map((row) => [row.id, row]));
  const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 34);
  for (const row of holds) {
    const frozen = fullRecord(sourceById.get(row.id));
    assert.deepEqual(row.before, frozen);
    assert.deepEqual(row.proposal, frozen);
    assert.equal(row.beforeSha256, hashValue(frozen));
    assert.equal(row.proposalSha256, row.beforeSha256);
  }
});

test('all 19 rewrites remain published and contain no commerce, cost or applicability prose arrays', () => {
  const { packet } = fixture();
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.equal(rewrites.length, 19);
  for (const row of rewrites) {
    assert.equal(row.proposal.status, 'published');
    assert.deepEqual(row.proposal.trims, []);
    assert.deepEqual(row.proposal.engines, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.equal(row.proposal.estimatedCostLow, null);
    assert.equal(row.proposal.estimatedCostHigh, null);
    assert.equal(row.proposal.typicalMileageLow, null);
    assert.equal(row.proposal.typicalMileageHigh, null);
    assert.ok(row.proposal.citations.every((item) => /^https:\/\/static\.nhtsa\.gov\//.test(item.url)));
  }
});

test('known CR-V scope corrections and investigation disclaimer are locked', () => {
  const { packet } = fixture();
  assert.deepEqual(byId(packet, IDS.pistonRings).proposal.years, [2008, 2009, 2010, 2011]);
  assert.deepEqual(byId(packet, IDS.lowPressureFuelPumpLong).proposal.years, [2018, 2019, 2020]);
  assert.deepEqual(byId(packet, IDS.vibration).proposal.years, [2015]);
  assert.deepEqual(byId(packet, IDS.infotainment).proposal.years, [2017, 2018, 2019]);
  assert.deepEqual(byId(packet, IDS.vtcActuator).proposal.years, [2010, 2011, 2012, 2013]);
  assert.match(byId(packet, IDS.phantomBraking).proposal.description, /investigation record, not a recall/i);
  assert.match(byId(packet, IDS.rearFrame).proposal.title, /23V-228/);
});

test('validator rejects a mutated hold, commerce insertion, archival and recall overstatement', () => {
  const { packet, snapshot } = fixture();
  const hold = packet.rows.find((row) => row.action === 'keep_published_pending_source');
  hold.proposal.title = 'mutated';
  hold.proposalSha256 = hashValue(hold.proposal);
  assert.ok(validatePacket(packet, snapshot).some((error) => error.includes('keep changed content')));

  const second = fixture();
  const rewrite = byId(second.packet, IDS.stickySteering);
  rewrite.proposal.fixParts = [{ name: 'unsafe insertion' }];
  rewrite.proposalSha256 = hashValue(rewrite.proposal);
  assert.ok(validatePacket(second.packet, second.snapshot).some((error) => error.includes('commerce remains')));

  const third = fixture();
  const archived = byId(third.packet, IDS.oilDilutionLong);
  archived.proposal.status = 'archived';
  archived.proposalSha256 = hashValue(archived.proposal);
  assert.ok(validatePacket(third.packet, third.snapshot).some((error) => error.includes('identity/status drift')));

  const fourth = fixture();
  const investigation = byId(fourth.packet, IDS.phantomBraking);
  investigation.proposal.description = investigation.proposal.description.replace('investigation record, not a recall', 'safety recall');
  investigation.proposalSha256 = hashValue(investigation.proposal);
  assert.ok(validatePacket(fourth.packet, fourth.snapshot).some((error) => error.includes('investigation disclaimer missing')));
});

test('the rewrite whitelist and packet contain the same exact 19 IDs', () => {
  const { packet } = fixture();
  const expected = Object.keys(REWRITE_CARDS).sort();
  const actual = packet.rows.filter((row) => row.action === 'rewrite_same_identity').map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
});
