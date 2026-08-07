/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS } = require('./build-jeep-wagoneer-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-wagoneer-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Wagoneer packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 1, keep_published_pending_source: 3, total: 4 });
});

test('three unsupported Wagoneer rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows.filter((item) => item.action === 'keep_published_pending_source')) {
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('rear-camera proposal preserves identity and removes unsupported claims and commerce', () => {
  const row = packet.rows.find((item) => item.id === IDS.camera);
  assert.equal(row.action, 'rewrite_same_identity');
  for (const field of ['id', 'make', 'model', 'years', 'category', 'title', 'status', 'relatedIssueIds']) {
    assert.deepEqual(row.proposal[field], row.before[field]);
  }
  assert.deepEqual(row.proposal.citations.map((item) => item.url), ['https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V577000']);
  assert.deepEqual(row.proposal.fixParts, []);
  assert.deepEqual(row.proposal.communityRecommendations, []);
  assert.equal(row.proposal.humanApproved, false);
});

test('official scope and frozen commerce conflicts remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.eTorque).reason, /2022.*2022-2025.*root cause/i);
  assert.match(byId.get(IDS.air).reason, /68409740AL.*Arnott.*Strutmasters/i);
  assert.match(byId.get(IDS.battery).reason, /Grand Wagoneer.*Wagoneer/i);
  assert.ok(packet.observations.some((item) => item.code === 'wagoneer-camera-recall-also-includes-2024'));
});

