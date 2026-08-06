/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-tucson-adjudication');
const { validatePacket } = require('./validate-hyundai-tucson-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-tucson-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Tucson proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Tucson ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Tucson')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 13);
});

test('only four exact official identities are rewritten', () => {
  const rewritten = new Set([IDS.fca, IDS.doorPaint, IDS.oilPump, IDS.towHarness]);
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

test('FCA rewrite is limited to the 2025-2026 camera-software recall', () => {
  const row = packet.rows.find((item) => item.id === IDS.fca);
  assert.deepEqual(row.proposal.years, [2025, 2026]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.fca]);
  assert.match(row.proposal.description, /front camera software/i);
  assert.match(row.proposal.description, /earlier than.*expected/i);
  assert.match(row.proposal.description, /sudden braking/i);
  assert.match(row.proposal.solution, /update the front camera software/i);
  assert.doesNotMatch(row.proposal.description, /shadow|road sign|class action/i);
  assert.doesNotMatch(row.proposal.solution, /disable/i);
});

test('door-paint rewrite follows TSB 23-BD-009H without warranty or recurrence inventions', () => {
  const row = packet.rows.find((item) => item.id === IDS.doorPaint);
  assert.deepEqual(row.proposal.years, [2022, 2023]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.door]);
  assert.match(row.proposal.description, /non-glossy front door pull handle/i);
  assert.match(row.proposal.solution, /replace the front door trim panel assembly/i);
  assert.doesNotMatch(row.proposal.solution, /5-year|60,000|protective film/i);
});

test('oil-pump rewrite limits Tucson to 2023 and preserves the official fire precautions', () => {
  const row = packet.rows.find((item) => item.id === IDS.oilPump);
  assert.deepEqual(row.proposal.years, [2023]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.oilPump]);
  assert.match(row.proposal.description, /damaged capacitor/i);
  assert.match(row.proposal.description, /printed circuit board/i);
  assert.match(row.proposal.solution, /park.*outside/i);
  assert.match(
    row.proposal.solution,
    /inspect and.*replace.*electric oil pump.*front (?:wiring )?harness/i,
  );
  assert.doesNotMatch(row.proposal.description, /2024 Tucson/i);
});

test('tow-harness rewrite matches the 2022-2024 OEM accessory recall', () => {
  const row = packet.rows.find((item) => item.id === IDS.towHarness);
  assert.deepEqual(row.proposal.years, [2022, 2023, 2024]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.towHarness]);
  assert.match(row.proposal.description, /optional OEM trailer wiring harness/i);
  assert.match(row.proposal.description, /water ingress/i);
  assert.match(row.proposal.description, /parking, turn-signal, or stop lamps/i);
  assert.match(row.proposal.solution, /replace the trailer wiring harness/i);
  assert.match(row.proposal.solution, /improved sealing/i);
});

test('partial DCT and different-cause engine recalls cannot rewrite their indexed rows', () => {
  for (const id of [IDS.dct, IDS.engine]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.ok(row.evidence.length > 0);
  }
});
