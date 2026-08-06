/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, REWRITE_CARDS, SOURCES, fullRecord, hashValue } = require('./build-honda-crosstour-adjudication');
const { validatePacket } = require('./validate-honda-crosstour-adjudication');
const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-honda-crosstour-adjudication-2026-08-06.json');
const snapshotFile = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');

test('Crosstour rewrite whitelist contains only three same-identity corrections', () => {
  assert.deepEqual(new Set(Object.keys(REWRITE_CARDS)), new Set([IDS.starter, IDS.paint, IDS.shudder]));
});

test('generated Crosstour packet passes all exact-snapshot and no-removal gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 3, keep_published_pending_source: 4, total: 7 });
});

test('four unverified or mismatched rows remain byte-equivalent', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  for (const id of [IDS.acRelay, IDS.suspension, IDS.parkingPawl, IDS.oilConsumption]) {
    const row = packet.rows.find((candidate) => candidate.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
  }
});

test('rewrite scopes match exact Honda records and remove commerce', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.deepEqual(byId.get(IDS.starter).proposal.years, [2013, 2014, 2015]);
  assert.deepEqual(byId.get(IDS.paint).proposal.years, [2014, 2015]);
  assert.deepEqual(byId.get(IDS.shudder).proposal.years, [2010, 2013, 2014, 2015]);
  for (const id of [IDS.starter, IDS.paint, IDS.shudder]) {
    const proposal = byId.get(id).proposal;
    assert.deepEqual(proposal.fixParts, []);
    assert.deepEqual(proposal.communityRecommendations, []);
    assert.deepEqual(proposal.trims, []);
    assert.deepEqual(proposal.engines, []);
    assert.equal(proposal.status, 'published');
  }
});

test('parking-pawl and suspension source mismatches are exposed without substitution', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const parking = packet.rows.find((row) => row.id === IDS.parkingPawl);
  const suspension = packet.rows.find((row) => row.id === IDS.suspension);
  assert.ok(parking.evidence.some((item) => item.kind === 'recall-scope-mismatch'));
  assert.ok(parking.evidence.some((item) => item.kind === 'government-recall-api'));
  assert.ok(suspension.evidence.some((item) => /ball joint/i.test(item.observation)));
});

test('all exact proposal source URLs appear in the reviewed cards', () => {
  const urls = new Set(Object.values(REWRITE_CARDS).flatMap((card) => card.citations.map((item) => item.url)));
  assert.deepEqual(urls, new Set(Object.values(SOURCES)));
});

test('packet hashes remain bound to all seven frozen Crosstour rows', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const byId = new Map(snapshot.records.filter((row) => row.model === 'Crosstour').map((row) => [row.id, row]));
  for (const row of packet.rows) assert.equal(row.beforeSha256, hashValue(fullRecord(byId.get(row.id))), row.id);
});
