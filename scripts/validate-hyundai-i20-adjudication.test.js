/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-hyundai-i20-adjudication');
const { validatePacket } = require('./validate-hyundai-i20-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-i20-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('i20 proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen i20 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'i20').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 5);
});

test('only the exact 51DT07 fuel-pump campaign is rewritten', () => {
  for (const row of packet.rows) {
    if (row.id === IDS.fuelPump) {
      assert.equal(row.action, 'rewrite_same_identity');
      assert.notEqual(row.beforeSha256, row.proposalSha256);
      continue;
    }
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
  }
});

test('fuel-pump rewrite preserves indexed identity and contains no unsupported commerce or diagnostics', () => {
  const row = packet.rows.find((item) => item.id === IDS.fuelPump);
  assert.equal(row.proposal.title, row.before.title);
  assert.equal(row.proposal.category, row.before.category);
  assert.deepEqual(row.proposal.years, [2021, 2022, 2023]);
  assert.deepEqual(row.proposal.trims, []);
  assert.deepEqual(row.proposal.engines, []);
  assert.deepEqual(row.proposal.dtcCodes, []);
  assert.deepEqual(row.proposal.fixParts, []);
  assert.deepEqual(row.proposal.communityRecommendations, []);
  assert.equal(row.proposal.estimatedCostLow, null);
  assert.equal(row.proposal.estimatedCostHigh, null);
  assert.equal(row.proposal.humanApproved, false);
  const publicCopy = `${row.proposal.description} ${row.proposal.solution} ${row.proposal.symptoms.join(' ')}`;
  assert.doesNotMatch(publicCopy, /181,726|check engine|low fuel pressure|hesitation|sputtering/i);
});

test('fuel-pump citations are exact official record-specific deep links', () => {
  const row = packet.rows.find((item) => item.id === IDS.fuelPump);
  assert.deepEqual(row.proposal.citations.map((item) => item.url).sort(), Object.values(SOURCES).sort());
  assert.ok(row.proposal.citations.every((item) => !/search|lookup/i.test(item.url)));
});
