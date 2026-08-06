/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-sonata-adjudication');
const { validatePacket } = require('./validate-hyundai-sonata-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-sonata-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Sonata proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Sonata ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Sonata')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 21);
});

test('only three exact official identities are rewritten', () => {
  const rewritten = new Set([IDS.injector, IDS.eps, IDS.oilConsumption]);
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

test('every rewrite preserves indexed identity and removes unsupported applicability and commerce', () => {
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

test('injector rewrite is limited to the exact 2.5-liter non-turbo TSB population and remedy', () => {
  const row = packet.rows.find((item) => item.id === IDS.injector);
  assert.deepEqual(row.proposal.years, [2021, 2022, 2023]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.injector]);
  assert.match(row.proposal.description, /internal filter breakage/i);
  assert.match(row.proposal.description, /leaking internally/i);
  assert.match(row.proposal.solution, /replace all four/i);
  assert.doesNotMatch(row.proposal.solution, /swap-test|oscilloscope|fuel quality/i);
});

test('EPS rewrite preserves manual steering and the exact 2011 recall remedy', () => {
  const row = packet.rows.find((item) => item.id === IDS.eps);
  assert.deepEqual(row.proposal.years, [2011]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.eps]);
  assert.match(row.proposal.description, /manual steering mode/i);
  assert.match(row.proposal.description, /greater driver effort/i);
  assert.match(row.proposal.solution, /replace the EPS control unit/i);
  assert.doesNotMatch(row.proposal.description, /lockup/i);
});

test('oil-consumption rewrite follows the Hyundai measurement path without inventing a universal defect', () => {
  const row = packet.rows.find((item) => item.id === IDS.oilConsumption);
  assert.deepEqual(row.proposal.years, [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.oilConsumption]);
  assert.match(row.proposal.description, /inspection and repair guidance/i);
  assert.match(row.proposal.solution, /1,000 miles per quart/i);
  assert.match(row.proposal.solution, /combustion-chamber cleaning/i);
  assert.match(row.proposal.solution, /prior approval/i);
  assert.doesNotMatch(row.proposal.description, /design weakness|class action|rod-bearing/i);
});

test('combined, generic, false-citation and unsupported narratives stay byte-for-byte frozen', () => {
  for (const id of [
    IDS.batteryDrain,
    IDS.dct,
    IDS.mdpsLockup,
    IDS.p0442,
    IDS.p0455,
    IDS.sunroof,
    IDS.bearingFire,
    IDS.thetaGeneric,
  ]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
  }
});
