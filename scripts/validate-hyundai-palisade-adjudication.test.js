/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-palisade-adjudication');
const { validatePacket } = require('./validate-hyundai-palisade-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-palisade-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Palisade proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Palisade ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Palisade')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 9);
});

test('only four exact same-identity records are rewritten', () => {
  const rewritten = new Set([IDS.cabinOdor, IDS.oilPump, IDS.seatBelt, IDS.airbag]);
  for (const row of packet.rows) {
    if (rewritten.has(row.id)) {
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

test('every rewrite preserves page identity and removes unsupported applicability and commerce', () => {
  for (const row of packet.rows.filter((item) => item.action === 'rewrite_same_identity')) {
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
    assert.equal(row.proposal.status, 'published');
    assert.deepEqual(row.proposal.trims, []);
    assert.deepEqual(row.proposal.engines, []);
    assert.deepEqual(row.proposal.dtcCodes, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.equal(row.proposal.estimatedCostLow, null);
    assert.equal(row.proposal.estimatedCostHigh, null);
    assert.equal(row.proposal.typicalMileageLow, null);
    assert.equal(row.proposal.typicalMileageHigh, null);
    assert.equal(row.proposal.humanApproved, false);
  }
});

test('headrest rewrite follows Hyundai TSB 21-BD-002H-1 without inventing a campaign', () => {
  const row = packet.rows.find((item) => item.id === IDS.cabinOdor);
  assert.deepEqual(row.proposal.years, [2020, 2021]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.headrest]);
  assert.match(row.proposal.description, /Nappa leather/i);
  assert.match(row.proposal.solution, /inspect/i);
  assert.match(row.proposal.solution, /odor eliminator/i);
  assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /customer satisfaction campaign|ozone|Leather Honey/i);
});

test('oil-pump and seat-belt rewrites track their exact recall filings', () => {
  const oilPump = packet.rows.find((item) => item.id === IDS.oilPump);
  assert.deepEqual(oilPump.proposal.years, [2023, 2024]);
  assert.deepEqual(oilPump.proposal.citations.map((item) => item.url), [SOURCES.oilPump]);
  assert.match(oilPump.proposal.description, /damaged capacitor/i);
  assert.doesNotMatch(`${oilPump.proposal.description} ${oilPump.proposal.solution}`, /25V291|moisture|2025-model/i);

  const seatBelt = packet.rows.find((item) => item.id === IDS.seatBelt);
  assert.deepEqual(seatBelt.proposal.years, [2020, 2021, 2022, 2023, 2024, 2025]);
  assert.deepEqual(seatBelt.proposal.citations.map((item) => item.url), [SOURCES.seatBelt]);
  assert.match(seatBelt.proposal.description, /out-of-specification/i);
  assert.match(seatBelt.proposal.solution, /quick and direct motion/i);
  assert.doesNotMatch(seatBelt.proposal.description, /37 unbuckling complaints/i);
});

test('airbag rewrite removes the unsupported finalized-remedy claim', () => {
  const row = packet.rows.find((item) => item.id === IDS.airbag);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.airbag]);
  assert.match(row.proposal.description, /Federal Motor Vehicle Safety Standard No\. 226/i);
  assert.match(row.proposal.solution, /developing a remedy/i);
  assert.doesNotMatch(row.proposal.solution, /protective film|remove interior padding|final remedy/i);
});

test('five partial, secondary or unsupported identities remain byte-for-byte frozen', () => {
  for (const id of [IDS.headlight, IDS.abs, IDS.infotainment, IDS.oilDilution, IDS.transmission]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
  }
});
