/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-hyundai-ioniq-adjudication');
const { validatePacket } = require('./validate-hyundai-ioniq-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-ioniq-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Ioniq proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Ioniq ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Ioniq').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 4);
});

test('only the exact MDPS identity is rewritten', () => {
  const rewriteIds = new Set([IDS.mdps]);
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

test('the rewrite preserves indexed identity and strips unsupported applicability and commerce', () => {
  for (const id of [IDS.mdps]) {
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

test('EPB remains unchanged because official bulletins do not establish the Auto Hold identity', () => {
  const row = packet.rows.find((item) => item.id === IDS.epb);
  assert.equal(row.action, 'keep_published_pending_source');
  assert.equal(row.beforeSha256, row.proposalSha256);
  assert.deepEqual(row.changedFields, []);
  assert.deepEqual(row.evidence.map((item) => item.url).sort(), [SOURCES.epbDiagnosis, SOURCES.epbUpdate].sort());
});

test('MDPS rewrite follows the exact bulletin scope', () => {
  const row = packet.rows.find((item) => item.id === IDS.mdps);
  assert.deepEqual(row.proposal.years, [2017, 2018, 2019, 2020, 2021, 2022]);
  assert.deepEqual(row.proposal.dtcCodes, []);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.mdps]);
  const copy = `${row.proposal.description} ${row.proposal.solution}`;
  assert.doesNotMatch(copy, /battery pack|cold weather|\$|entire MDPS/i);
});
