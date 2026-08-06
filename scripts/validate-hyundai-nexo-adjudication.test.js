/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-nexo-adjudication');
const { validatePacket } = require('./validate-hyundai-nexo-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-nexo-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Nexo proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Nexo ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Nexo')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 4);
});

test('only the exact infrastructure identity is rewritten', () => {
  for (const row of packet.rows) {
    if (row.id === IDS.infrastructure) {
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

test('infrastructure rewrite preserves identity and removes unsupported commerce', () => {
  const row = packet.rows.find((item) => item.id === IDS.infrastructure);
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
});

test('infrastructure rewrite follows the two exact Hyundai documents', () => {
  const row = packet.rows.find((item) => item.id === IDS.infrastructure);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [
    SOURCES.infrastructure,
    SOURCES.authorizedService,
  ]);
  assert.match(row.proposal.description, /very limited/i);
  assert.match(`${row.proposal.description} ${row.proposal.solution}`, /authorized Hyundai NEXO/i);
  assert.doesNotMatch(
    `${row.proposal.description} ${row.proposal.solution} ${row.proposal.symptoms.join(' ')}`,
    /only three|six hours|50\+ miles|weeks of waiting|class action|Toyota Mirai|lease rather than purchase/i,
  );
});

test('fuel-cell-stack row stays frozen because nearby campaigns are different identities', () => {
  const row = packet.rows.find((item) => item.id === IDS.stack);
  assert.equal(row.action, 'keep_published_pending_source');
  assert.deepEqual(row.proposal, row.before);
  assert.ok(packet.observations.some((item) => item.code === 'stack-campaigns-are-mismatches'));
});

test('tank-fill and parking-sensor narratives remain byte-for-byte frozen', () => {
  for (const id of [IDS.tankFill, IDS.parking]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
  }
});
