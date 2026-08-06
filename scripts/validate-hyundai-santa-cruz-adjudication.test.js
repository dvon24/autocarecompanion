/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-santa-cruz-adjudication');
const { validatePacket } = require('./validate-hyundai-santa-cruz-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-santa-cruz-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Santa Cruz proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Santa Cruz ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Santa Cruz')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 10);
});

test('only four exact recall identities are rewritten', () => {
  const rewritten = new Set([IDS.fca, IDS.roofMolding, IDS.towHarness, IDS.oilPump]);
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

test('FCA and roof-molding rewrites follow their exact Part 573 reports', () => {
  const fca = packet.rows.find((item) => item.id === IDS.fca);
  assert.deepEqual(fca.proposal.years, [2025, 2026]);
  assert.deepEqual(fca.proposal.citations.map((item) => item.url), [SOURCES.fca]);
  assert.match(fca.proposal.description, /increased sensitivity/i);
  assert.match(fca.proposal.solution, /front-camera software/i);

  const roof = packet.rows.find((item) => item.id === IDS.roofMolding);
  assert.deepEqual(roof.proposal.years, [2022, 2023]);
  assert.deepEqual(roof.proposal.citations.map((item) => item.url), [SOURCES.roofMolding]);
  assert.match(roof.proposal.description, /roof flange and mounting clips/i);
  assert.doesNotMatch(roof.proposal.description, /paint.sealer/i);
});

test('tow-harness rewrite retains the exact accessory, water-ingress and fire identity', () => {
  const row = packet.rows.find((item) => item.id === IDS.towHarness);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.towHarness]);
  assert.match(row.proposal.description, /4-pin tow-hitch harness connector/i);
  assert.match(row.proposal.solution, /15-ampere fuse/i);
  assert.match(row.proposal.solution, /wire-extension kit/i);
  assert.match(row.proposal.solution, /outside and away from structures/i);
});

test('oil-pump rewrite corrects the cause to fail-safe software without inventing a DTC', () => {
  const row = packet.rows.find((item) => item.id === IDS.oilPump);
  assert.deepEqual(row.proposal.years, [2022]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.oilPump]);
  assert.match(row.proposal.description, /improper software logic/i);
  assert.match(row.proposal.description, /20-30 seconds/i);
  assert.doesNotMatch(row.proposal.description, /insufficient solder/i);
  assert.deepEqual(row.proposal.dtcCodes, []);
});

test('overheating and five unsupported owner narratives remain byte-for-byte frozen', () => {
  for (const id of [
    IDS.dctOverheat,
    IDS.battery,
    IDS.sunroof,
    IDS.bedLiner,
    IDS.infotainment,
    IDS.rearWindow,
  ]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
  }
});
