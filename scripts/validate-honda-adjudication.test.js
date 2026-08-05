/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  ACTION_BY_ID,
  RIDGELINE_ID,
  S2000_ID,
  diffFields,
} = require('./build-honda-adjudication');
const { validatePacket } = require('./validate-honda-adjudication');

const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-honda-adjudication-2026-08-05.json');
const snapshotFile = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

test('Honda priority packet changes only the two clicked records', () => {
  assert.deepEqual([...ACTION_BY_ID.keys()].sort(), [RIDGELINE_ID, S2000_ID].sort());
  assert.equal(ACTION_BY_ID.get(RIDGELINE_ID), 'correct_clicked_integrity');
  assert.equal(ACTION_BY_ID.get(S2000_ID), 'remove_invalid_search_link');
});

test('generated packet passes the no-archive and exact-snapshot gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, snapshot, sha256File(snapshotFile)), []);
  assert.deepEqual(packet.summary, {
    correct_clicked_integrity: 1,
    remove_invalid_search_link: 1,
    keep_published_pending_source: 381,
    total: 383,
  });
  assert.equal(packet.rows.some((row) => row.proposal.status !== 'published'), false);
});

test('Ridgeline correction preserves identity and replaces DPSF with official VTM-4 guidance', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const row = packet.rows.find((candidate) => candidate.id === RIDGELINE_ID);
  assert.deepEqual(row.proposal.years, row.before.years);
  assert.equal(row.proposal.title, row.before.title);
  assert.match(row.proposal.solution, /Honda VTM-4 Differential Fluid/);
  assert.doesNotMatch(JSON.stringify(row.proposal), /\bDPSF\b/i);
  assert.equal(row.proposal.fixParts.length, 0);
  assert.equal(row.proposal.estimatedCostLow, null);
  assert.equal(row.proposal.estimatedCostHigh, null);
  assert.equal(row.proposal.typicalMileageLow, null);
  assert.equal(row.proposal.typicalMileageHigh, null);
  assert.equal(JSON.stringify(row.proposal).includes('amazon.com/s?'), false);
});

test('S2000 correction removes only the invalid search link and correction metadata', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const row = packet.rows.find((candidate) => candidate.id === S2000_ID);
  assert.deepEqual(
    diffFields(row.before, row.proposal).sort(),
    ['communityRecommendations', 'contentUpdateSummary', 'contentUpdatedOn'].sort(),
  );
  assert.equal(JSON.stringify(row.proposal).includes('amazon.com/s?'), false);
  const beforeRecommendation = row.before.communityRecommendations[3];
  const afterRecommendation = row.proposal.communityRecommendations[3];
  assert.equal(afterRecommendation.content, beforeRecommendation.content);
  assert.equal(Object.hasOwn(afterRecommendation, 'affiliateUrl'), false);
});

test('all non-priority Honda rows are byte-equivalent keeps', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const keeps = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(keeps.length, 381);
  for (const row of keeps) {
    assert.deepEqual(row.proposal, row.before, row.id);
    assert.equal(row.proposalSha256, row.beforeSha256, row.id);
  }
});
