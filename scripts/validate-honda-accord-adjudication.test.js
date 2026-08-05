/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  FUEL_PUMP_ID,
  REWRITE_CARDS,
  fullRecord,
  hashValue,
} = require('./build-honda-accord-adjudication');
const { validatePacket } = require('./validate-honda-accord-adjudication');

const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-honda-accord-adjudication-2026-08-05.json');
const snapshotFile = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');

test('Accord rewrite whitelist contains only the 13 same-identity cards', () => {
  assert.equal(Object.keys(REWRITE_CARDS).length, 13);
  assert.ok(REWRITE_CARDS['honda-accord-10th-gen-ac-condenser-leak-2018']);
  assert.ok(REWRITE_CARDS['honda-accord-p0011-intake-cam-over-advanced-from-defective-vtc-actuator']);
  assert.ok(REWRITE_CARDS['honda-accord-v6-power-steering-pressure-hose-deterioration-leak-under-hoo']);
  assert.equal(REWRITE_CARDS['honda-accord-v6-vcm-oil-consumption-2008'], undefined);
  assert.equal(REWRITE_CARDS['honda-accord-p0741-torque-converter-clutch-stuck-off-failing-lockup-clutc'], undefined);
});

test('generated Accord packet passes exact-snapshot, no-archive and identity gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 13,
    keep_published_pending_source: 43,
    total: 56,
  });
  assert.equal(packet.rows.some((row) => row.proposal.status !== 'published'), false);
});

test('all 43 unverified Accord rows remain byte-equivalent keeps', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const keeps = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(keeps.length, 43);
  for (const row of keeps) {
    assert.deepEqual(row.proposal, row.before, row.id);
    assert.equal(row.proposalSha256, row.beforeSha256, row.id);
  }
});

test('rewrites remain published, no-commerce and free of applicability prose arrays', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  for (const row of packet.rows.filter((candidate) => candidate.action === 'rewrite_same_identity')) {
    assert.equal(row.proposal.status, 'published', row.id);
    assert.deepEqual(row.proposal.trims, [], row.id);
    assert.deepEqual(row.proposal.engines, [], row.id);
    assert.deepEqual(row.proposal.fixParts, [], row.id);
    assert.deepEqual(row.proposal.communityRecommendations, [], row.id);
    assert.equal(row.proposal.estimatedCostLow, null, row.id);
    assert.equal(row.proposal.estimatedCostHigh, null, row.id);
    assert.equal(JSON.stringify(row.proposal).includes('amazon.com/s?'), false, row.id);
  }
});

test('fuel-pump card fixes the false 20V374 citation without losing covered years', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const row = packet.rows.find((candidate) => candidate.id === FUEL_PUMP_ID);
  assert.deepEqual(row.proposal.years, [2018, 2019, 2020, 2021]);
  assert.doesNotMatch(JSON.stringify(row.proposal), /20V[- ]?374/i);
  assert.deepEqual(
    row.proposal.citations.map((citation) => citation.url),
    [
      'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V314000',
      'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V215000',
      'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V858000',
    ],
  );
});

test('packet before hashes still bind to the frozen Honda snapshot', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const accordById = new Map(snapshot.records.filter((row) => row.model === 'Accord').map((row) => [row.id, row]));
  for (const row of packet.rows) {
    assert.equal(row.beforeSha256, hashValue(fullRecord(accordById.get(row.id))), row.id);
  }
});
