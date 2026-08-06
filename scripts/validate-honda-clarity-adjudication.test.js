/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, REWRITE_CARDS, SOURCES, fullRecord, hashValue } = require('./build-honda-clarity-adjudication');
const { validatePacket } = require('./validate-honda-clarity-adjudication');
const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-honda-clarity-adjudication-2026-08-06.json');
const snapshotFile = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');

test('Clarity rewrite whitelist contains only condenser and charging corrections', () => {
  assert.deepEqual(new Set(Object.keys(REWRITE_CARDS)), new Set([IDS.condenserLeak, IDS.chargingFailure]));
});

test('generated Clarity packet passes all exact-snapshot and no-removal gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 2, keep_published_pending_source: 2, total: 4 });
});

test('unverified battery-drain and highway-power-loss rows remain byte-equivalent', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  for (const id of [IDS.batteryDrain, IDS.powerLoss]) {
    const row = packet.rows.find((candidate) => candidate.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
  }
});

test('charging and condenser corrections use exact Honda sources and no commerce', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.deepEqual(byId.get(IDS.chargingFailure).proposal.years, [2018]);
  assert.deepEqual(byId.get(IDS.condenserLeak).proposal.years, [2018, 2019, 2020, 2021]);
  for (const id of [IDS.chargingFailure, IDS.condenserLeak]) {
    const proposal = byId.get(id).proposal;
    assert.deepEqual(proposal.fixParts, []);
    assert.deepEqual(proposal.communityRecommendations, []);
    assert.deepEqual(proposal.trims, []);
    assert.deepEqual(proposal.engines, []);
    assert.equal(proposal.status, 'published');
  }
});

test('all exact source URLs appear in the reviewed cards', () => {
  const urls = new Set(Object.values(REWRITE_CARDS).flatMap((card) => card.citations.map((item) => item.url)));
  assert.deepEqual(urls, new Set(Object.values(SOURCES)));
});

test('packet hashes remain bound to all four frozen Clarity rows', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const byId = new Map(snapshot.records.filter((row) => row.model === 'Clarity').map((row) => [row.id, row]));
  for (const row of packet.rows) assert.equal(row.beforeSha256, hashValue(fullRecord(byId.get(row.id))), row.id);
});
