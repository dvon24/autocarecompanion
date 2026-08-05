/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  REWRITE_CARDS,
  TAKATA_ID,
  fullRecord,
  hashValue,
} = require('./build-honda-city-adjudication');
const { validatePacket } = require('./validate-honda-city-adjudication');

const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-honda-city-adjudication-2026-08-06.json');
const snapshotFile = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');

test('City rewrite whitelist contains only the same-identity Takata card', () => {
  assert.deepEqual(Object.keys(REWRITE_CARDS), [TAKATA_ID]);
  assert.equal(REWRITE_CARDS['honda-city-high-pressure-fuel-pump-failure-sudden-power-loss-p0087'], undefined);
  assert.equal(REWRITE_CARDS['honda-city-starter-motor-brush-holder-failure'], undefined);
});

test('generated City packet passes exact-snapshot, no-archive and identity gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 1,
    keep_published_pending_source: 5,
    total: 6,
  });
  assert.equal(packet.rows.some((row) => row.proposal.status !== 'published'), false);
});

test('all five unverified City rows remain byte-equivalent keeps', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const keeps = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(keeps.length, 5);
  for (const row of keeps) {
    assert.deepEqual(row.proposal, row.before, row.id);
    assert.equal(row.proposalSha256, row.beforeSha256, row.id);
  }
});

test('Takata rewrite preserves the 2010-2014 page scope and removes the fuel-level-sensor citation', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const row = packet.rows.find((candidate) => candidate.id === TAKATA_ID);
  assert.deepEqual(row.proposal.years, [2010, 2011, 2012, 2013, 2014]);
  assert.deepEqual(row.proposal.trims, []);
  assert.deepEqual(row.proposal.engines, []);
  assert.deepEqual(row.proposal.fixParts, []);
  assert.deepEqual(row.proposal.communityRecommendations, []);
  assert.doesNotMatch(JSON.stringify(row.proposal), /08012\.001804\/2015-93/i);
  assert.match(row.proposal.description, /VIN-specific/i);
  assert.match(row.proposal.solution, /each applicable campaign/i);
});

test('packet exposes the two known citation mismatches without silently editing those rows', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const observations = JSON.stringify(packet.observations);
  assert.match(observations, /high-pressure fuel-pump/i);
  assert.match(observations, /starter/i);
  const flagged = new Set(packet.observations.flatMap((item) => item.recordIds || []));
  assert.ok(flagged.has('honda-city-high-pressure-fuel-pump-failure-sudden-power-loss-p0087'));
  assert.ok(flagged.has('honda-city-starter-motor-brush-holder-failure'));
});

test('packet before hashes remain bound to all six City rows in the frozen Honda snapshot', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const cityById = new Map(snapshot.records.filter((row) => row.model === 'City').map((row) => [row.id, row]));
  for (const row of packet.rows) {
    assert.equal(row.beforeSha256, hashValue(fullRecord(cityById.get(row.id))), row.id);
  }
});
