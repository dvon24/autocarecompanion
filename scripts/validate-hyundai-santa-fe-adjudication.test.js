/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-santa-fe-adjudication');
const { validatePacket } = require('./validate-hyundai-santa-fe-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-santa-fe-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Santa Fe proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Santa Fe ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Santa Fe')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 14);
});

test('only five exact official identities are rewritten', () => {
  const rewritten = new Set([
    IDS.abs,
    IDS.gdiBearing,
    IDS.mpiSeizure,
    IDS.towHarness,
    IDS.oilConsumption,
  ]);
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

test('every rewrite preserves identity and removes unsupported applicability and commerce', () => {
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

test('ABS rewrite uses the exact 22V-056 scope and does not invent a fluid-leak cause', () => {
  const row = packet.rows.find((item) => item.id === IDS.abs);
  assert.deepEqual(row.proposal.years, [2017, 2018]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.abs]);
  assert.match(row.proposal.description, /malfunction internally/i);
  assert.match(row.proposal.solution, /lower-amperage/i);
  assert.doesNotMatch(row.proposal.description, /brake fluid/i);
});

test('GDI bearing rewrite is limited to the 2013-2014 17V-226 Santa Fe Sport population', () => {
  const row = packet.rows.find((item) => item.id === IDS.gdiBearing);
  assert.deepEqual(row.proposal.years, [2013, 2014]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.gdiBearing]);
  assert.match(row.proposal.description, /residual debris/i);
  assert.match(row.proposal.description, /connecting[- ]rod bearing/i);
  assert.match(row.proposal.solution, /short block/i);
});

test('MPI seizure rewrite is limited to the 2012 20V-746 Santa Fe population', () => {
  const row = packet.rows.find((item) => item.id === IDS.mpiSeizure);
  assert.deepEqual(row.proposal.years, [2012]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.mpiSeizure]);
  assert.match(row.proposal.description, /2\.4-liter Theta II MPI/i);
  assert.match(row.proposal.solution, /Knock Sensor Detection System/i);
});

test('tow-harness rewrite retains the exact accessory, water-ingress and fire identity', () => {
  const row = packet.rows.find((item) => item.id === IDS.towHarness);
  assert.deepEqual(row.proposal.years, [2019, 2020, 2021, 2022, 2023]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.towHarness]);
  assert.match(row.proposal.description, /4-pin tow-hitch harness connector/i);
  assert.match(row.proposal.solution, /15-ampere fuse/i);
  assert.match(row.proposal.solution, /outside and away from structures/i);
});

test('oil-consumption rewrite follows 23-EM-008H without inventing cause, DTCs or replacement entitlement', () => {
  const row = packet.rows.find((item) => item.id === IDS.oilConsumption);
  assert.deepEqual(row.proposal.years, [2013, 2014, 2015, 2016, 2017, 2018, 2019]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.oilConsumption]);
  assert.match(row.proposal.description, /inspection and repair guidance/i);
  assert.match(row.proposal.solution, /1,000 miles per quart/i);
  assert.match(row.proposal.solution, /combustion-chamber cleaning/i);
  assert.doesNotMatch(row.proposal.description, /inherent/i);
  assert.deepEqual(row.proposal.dtcCodes, []);
});

test('combined DCT and eight unsupported narratives remain byte-for-byte frozen', () => {
  for (const id of [
    IDS.dct,
    IDS.paint,
    IDS.cvvt,
    IDS.sunroofShatter,
    IDS.subframe,
    IDS.sunroofDrain,
    IDS.alternator,
    IDS.steering,
    IDS.transferCase,
  ]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
  }
});
