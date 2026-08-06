/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-kona-adjudication');
const { validatePacket } = require('./validate-hyundai-kona-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-kona-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

const rewriteIds = new Set([IDS.cable, IDS.piston, IDS.batteryFire, IDS.epcu]);

test('Kona proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Kona ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Kona')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 13);
});

test('only four exact recall identities are rewritten', () => {
  for (const row of packet.rows) {
    if (rewriteIds.has(row.id)) {
      assert.equal(row.action, 'rewrite_same_identity');
      assert.notEqual(row.beforeSha256, row.proposalSha256);
    } else {
      assert.equal(row.action, 'keep_published_pending_source');
      assert.equal(row.beforeSha256, row.proposalSha256, row.id);
      assert.deepEqual(row.changedFields, [], row.id);
      assert.deepEqual(row.proposal, row.before, row.id);
    }
  }
});

test('all rewrites preserve indexed identity and strip applicability and commerce', () => {
  for (const id of rewriteIds) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.equal(row.proposal.status, 'published');
    assert.deepEqual(row.proposal.trims, []);
    assert.deepEqual(row.proposal.engines, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.equal(row.proposal.estimatedCostLow, null);
    assert.equal(row.proposal.estimatedCostHigh, null);
    assert.equal(row.proposal.typicalMileageLow, null);
    assert.equal(row.proposal.typicalMileageHigh, null);
    assert.equal(row.proposal.humanApproved, false);
  }
});

test('battery-cable rewrite follows recall 23V-901 without turning it into a pre-crash defect', () => {
  const row = packet.rows.find((item) => item.id === IDS.cable);
  assert.deepEqual(row.proposal.years, [2024]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.cable]);
  assert.match(`${row.proposal.description} ${row.proposal.solution}`, /23V-901/);
  assert.match(row.proposal.description, /during a frontal crash/i);
  assert.doesNotMatch(row.proposal.description, /routine driving|normal operation|before a crash/i);
});

test('piston-ring rewrite follows recall 21V-301 without invented DTCs', () => {
  const row = packet.rows.find((item) => item.id === IDS.piston);
  assert.deepEqual(row.proposal.years, [2019, 2020, 2021]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.piston]);
  assert.deepEqual(row.proposal.dtcCodes, []);
  assert.match(`${row.proposal.description} ${row.proposal.solution}`, /21V-301/);
  assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /P1326/i);
});

test('battery-fire rewrite corrects the false 21V-193 campaign', () => {
  const row = packet.rows.find((item) => item.id === IDS.batteryFire);
  assert.deepEqual(row.proposal.years, [2019, 2020]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.batteryFire]);
  assert.match(`${row.proposal.description} ${row.proposal.solution}`, /21V-127/);
  assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /21V-193|82,000|4-8 hours/i);
});

test('EPCU rewrite follows recall 22V-941', () => {
  const row = packet.rows.find((item) => item.id === IDS.epcu);
  assert.deepEqual(row.proposal.years, [2021]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.epcu]);
  assert.match(`${row.proposal.description} ${row.proposal.solution}`, /22V-941/);
  assert.match(row.proposal.description, /insufficient seal|insufficiently sealed/i);
});

test('DCT and IVT rows remain frozen because exact sources do not support every title outcome', () => {
  for (const id of [IDS.dct, IDS.ivt]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
  }
});
