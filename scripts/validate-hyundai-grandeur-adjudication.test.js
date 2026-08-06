/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-hyundai-grandeur-adjudication');
const { validatePacket } = require('./validate-hyundai-grandeur-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-grandeur-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Grandeur proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Grandeur ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Grandeur').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 6);
});

test('only the Theta II row is rewritten and every other row remains byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    if (row.id === IDS.theta) {
      assert.equal(row.action, 'rewrite_same_identity');
      assert.notEqual(row.beforeSha256, row.proposalSha256);
      continue;
    }
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
  }
});

test('Theta II rewrite is conservative, commerce-free and backed only by stable Hyundai primary URLs', () => {
  const row = packet.rows.find((item) => item.id === IDS.theta);
  assert.deepEqual(row.proposal.years, [2017, 2018, 2019]);
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
  assert.deepEqual(row.proposal.citations.map((item) => item.url).sort(), Object.values(SOURCES).sort());
});

test('POST-only registry records remain evidence metadata rather than public citations', () => {
  const publicCitations = packet.rows.flatMap((row) => row.proposal.citations || []).map((item) => item.url);
  assert.equal(publicCitations.some((url) => /car\.go\.kr\/ri\/(?:stat|grts)\/list\.do/.test(url)), false);
  assert.equal(packet.officialRegistry.stall.recordId, '2781');
  assert.equal(packet.officialRegistry.brakeRollback.recordId, '4726');
  assert.deepEqual(packet.officialRegistry.thetaKsds.map((item) => item.recordId), ['1693', '1692']);
});
