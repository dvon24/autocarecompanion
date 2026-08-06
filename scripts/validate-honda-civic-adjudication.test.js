/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  IDS,
  REWRITE_CARDS,
  SOURCES,
  fullRecord,
  hashValue,
} = require('./build-honda-civic-adjudication');
const { validatePacket } = require('./validate-honda-civic-adjudication');

const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-honda-civic-adjudication-2026-08-06.json');
const snapshotFile = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');

test('Civic rewrite whitelist contains exactly fourteen same-identity cards', () => {
  assert.equal(Object.keys(REWRITE_CARDS).length, 14);
  assert.deepEqual(new Set(Object.keys(REWRITE_CARDS)), new Set(Object.values(IDS)));
});

test('generated Civic packet passes exact-snapshot, no-archive and identity gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 14,
    keep_published_pending_source: 55,
    total: 69,
  });
  assert.equal(packet.rows.some((row) => row.proposal.status !== 'published'), false);
});

test('all fifty-five unverified Civic rows remain byte-equivalent keeps', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const keeps = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(keeps.length, 55);
  for (const row of keeps) {
    assert.deepEqual(row.proposal, row.before, row.id);
    assert.equal(row.proposalSha256, row.beforeSha256, row.id);
  }
});

test('recall rewrites use exact primary records and remove recall commerce', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const recallIds = [
    IDS.pistonPin,
    IDS.brakeMaster,
    IDS.lowPressureFuelPump,
    IDS.driverSeat,
    IDS.parkingBrake,
    IDS.stickySteeringLong,
    IDS.highPressureFuelPump,
    IDS.stickySteeringShort,
  ];
  for (const id of recallIds) {
    const row = packet.rows.find((candidate) => candidate.id === id);
    assert.equal(row.action, 'rewrite_same_identity', id);
    assert.deepEqual(row.proposal.fixParts, [], id);
    assert.deepEqual(row.proposal.communityRecommendations, [], id);
    assert.equal(row.proposal.estimatedCostLow, null, id);
    assert.equal(row.proposal.estimatedCostHigh, null, id);
    assert.ok(row.proposal.citations.every((item) => item.url.startsWith('https://static.nhtsa.gov/')), id);
  }
});

test('source-backed tag corrections are explicit', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const proposal = (id) => packet.rows.find((row) => row.id === id).proposal;
  assert.deepEqual(proposal(IDS.lowPressureFuelPump).years, [2018, 2019, 2020]);
  assert.deepEqual(proposal(IDS.driverSeat).years, [2023, 2024]);
  assert.deepEqual(proposal(IDS.oilDilution).years, [2016, 2017, 2018]);
  assert.deepEqual(proposal(IDS.paint).years, [2012, 2013]);
  for (const id of Object.values(IDS)) {
    assert.deepEqual(proposal(id).trims, [], id);
    assert.deepEqual(proposal(id).engines, [], id);
  }
});

test('duplicate steering and overlapping A/C pages are corrected but not removed', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.deepEqual(byId.get(IDS.stickySteeringLong).proposal, byId.get(IDS.stickySteeringShort).proposal);
  for (const id of [IDS.stickySteeringLong, IDS.stickySteeringShort, IDS.combinedAcLeak, IDS.condenserLeak, IDS.compressorLeak]) {
    assert.equal(byId.get(id).proposal.status, 'published', id);
  }
  const observations = JSON.stringify(packet.observations);
  assert.match(observations, /duplicate-steering-recall-pages/);
  assert.match(observations, /overlapping-ac-pages/);
});

test('the exact source map is reflected in the reviewed cards', () => {
  const cardUrls = new Set(Object.values(REWRITE_CARDS).flatMap((card) => card.citations.map((item) => item.url)));
  assert.deepEqual(cardUrls, new Set(Object.values(SOURCES)));
});

test('packet before hashes remain bound to all sixty-nine Civic rows in the frozen snapshot', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const civicById = new Map(snapshot.records.filter((row) => row.model === 'Civic').map((row) => [row.id, row]));
  for (const row of packet.rows) {
    assert.equal(row.beforeSha256, hashValue(fullRecord(civicById.get(row.id))), row.id);
  }
});
