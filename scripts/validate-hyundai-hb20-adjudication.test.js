/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-hyundai-hb20-adjudication');
const { validatePacket } = require('./validate-hyundai-hb20-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-hb20-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('HB20 proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen HB20 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'HB20').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 6);
});

test('only the two exact Hyundai recalls are rewritten and all broad rows remain byte-for-byte frozen', () => {
  const rewriteIds = new Set([IDS.oilPumpRecall, IDS.brakeBoosterRecall]);
  for (const row of packet.rows) {
    if (rewriteIds.has(row.id)) {
      assert.equal(row.action, 'rewrite_same_identity');
      assert.notEqual(row.beforeSha256, row.proposalSha256);
      continue;
    }
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
  }
});

test('recall rewrites preserve identity and remove unsupported applicability, commerce and diagnostic claims', () => {
  for (const id of [IDS.oilPumpRecall, IDS.brakeBoosterRecall]) {
    const row = packet.rows.find((item) => item.id === id);
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
    assert.equal(row.proposal.source, 'manual');
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
  }
});

test('public citations are exact official deep links and the conflicting recall index is review metadata only', () => {
  const oilPump = packet.rows.find((item) => item.id === IDS.oilPumpRecall);
  const brakeBooster = packet.rows.find((item) => item.id === IDS.brakeBoosterRecall);
  assert.deepEqual(oilPump.proposal.citations.map((item) => item.url), [SOURCES.oilPumpPdf]);
  assert.deepEqual(brakeBooster.proposal.citations.map((item) => item.url), [SOURCES.brakeBoosterPdf]);
  assert.equal(packet.rows.flatMap((row) => row.proposal.citations || []).some((item) => item.url === SOURCES.recallIndex), false);
  assert.ok(packet.observations.some((item) => item.code === 'oil-pump-index-pdf-conflict-pdf-controls'));
  assert.ok(packet.observations.some((item) => item.code === 'dead-procon-link-removed'));
});

test('oil-pump rewrite does not invent advance-warning symptoms', () => {
  const row = packet.rows.find((item) => item.id === IDS.oilPumpRecall);
  assert.deepEqual(row.proposal.symptoms, []);
  assert.equal(/warning light|burning smell|no warning/i.test(JSON.stringify(row.proposal)), false);
});
