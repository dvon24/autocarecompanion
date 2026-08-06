/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-hyundai-ioniq-5-adjudication');
const { validatePacket } = require('./validate-hyundai-ioniq-5-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-ioniq-5-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Ioniq 5 proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Ioniq 5 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Ioniq 5').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 14);
});

test('only four exact recall or bulletin identities are rewritten', () => {
  const rewriteIds = new Set([IDS.fasteners, IDS.parkingPawl, IDS.tailgate, IDS.braking]);
  for (const row of packet.rows) {
    if (rewriteIds.has(row.id)) {
      assert.equal(row.action, 'rewrite_same_identity');
      assert.notEqual(row.beforeSha256, row.proposalSha256);
    } else {
      assert.equal(row.action, 'keep_published_pending_source');
      assert.equal(row.beforeSha256, row.proposalSha256, row.id);
      assert.deepEqual(row.changedFields, [], row.id);
    }
  }
});

test('all rewrites preserve indexed identity and strip unsupported commerce', () => {
  for (const id of [IDS.fasteners, IDS.parkingPawl, IDS.tailgate, IDS.braking]) {
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

test('rear-fastener rewrite keeps the two official recall populations distinct', () => {
  const row = packet.rows.find((item) => item.id === IDS.fasteners);
  assert.deepEqual(row.proposal.years, [2025]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url).sort(), [SOURCES.fasteners2025, SOURCES.fasteners2026].sort());
  assert.match(row.proposal.description, /25V-605/);
  assert.match(row.proposal.description, /26V-314/);
  assert.match(row.proposal.description, /alignment-stage system error/);
  assert.match(row.proposal.description, /supplier assembly/);
});

test('parking-pawl rewrite follows recall 22V-324 only', () => {
  const row = packet.rows.find((item) => item.id === IDS.parkingPawl);
  assert.deepEqual(row.proposal.years, [2022]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.parkingPawl]);
  assert.match(row.proposal.solution, /Electronic Parking Brake/);
  assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /Kia|20K|approximately/i);
});

test('tailgate rewrite follows exact Hyundai TSB 24-BD-012H', () => {
  const row = packet.rows.find((item) => item.id === IDS.tailgate);
  assert.deepEqual(row.proposal.years, [2022, 2023, 2024, 2025]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.tailgate]);
  assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /cold weather|velcro|tape/i);
});

test('Ioniq 5 N braking rewrite follows replacement recall 25V-235', () => {
  const row = packet.rows.find((item) => item.id === IDS.braking);
  assert.deepEqual(row.proposal.years, [2025]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.braking]);
  assert.match(row.proposal.description, /continue to accelerate momentarily/);
  assert.match(row.proposal.solution, /25V-235/);
  assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution} ${row.proposal.symptoms.join(' ')}`, /miscalculate|ABS warning|pedal feel/i);
});

test('ICCU row stays unchanged because the exact recall does not support every title outcome', () => {
  const row = packet.rows.find((item) => item.id === IDS.iccu);
  assert.equal(row.action, 'keep_published_pending_source');
  assert.equal(row.beforeSha256, row.proposalSha256);
  assert.deepEqual(row.changedFields, []);
  assert.deepEqual(row.evidence.map((item) => item.url), [SOURCES.iccu]);
});
