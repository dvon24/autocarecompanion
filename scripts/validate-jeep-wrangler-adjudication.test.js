/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { REWRITE_IDS, SPECIAL_IDS } = require('./build-jeep-wrangler-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-wrangler-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Wrangler packet passes the complete proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 5, keep_published_pending_source: 61, total: 66 });
});

test('all 61 unsupported Wrangler rows remain byte-for-byte frozen', () => {
  const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 61);
  for (const row of holds) {
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('five official-source rewrites preserve every indexed identity boundary', () => {
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.deepEqual(rewrites.map((row) => row.id).sort(), Object.values(REWRITE_IDS).sort());
  for (const row of rewrites) {
    for (const field of ['make', 'model', 'years', 'category', 'title', 'status', 'relatedIssueIds']) assert.deepEqual(row.proposal[field], row.before[field]);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.equal(row.proposal.humanApproved, false);
    assert.equal(row.proposal.reportCount, 0);
    assert.ok(row.proposal.citations.every((item) => /nhtsa\.gov/.test(item.url)));
  }
});

test('critical source mismatches and supersessions remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(SPECIAL_IDS.clockspring).reason, /2011-2016.*right-hand-drive.*2007-2017/i);
  assert.match(byId.get(SPECIAL_IDS.steeringGear).reason, /steering damper.*steering gear/i);
  assert.match(byId.get(SPECIAL_IDS.eightSpeed).reason, /8-speed.*2018.*2012/i);
  assert.ok(packet.observations.some((item) => item.code === 'wrangler-battery-recall-superseded-twice'));
});

test('packet covers all 66 frozen Wrangler records exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Wrangler').map((row) => row.id).sort();
  assert.equal(expected.length, 66);
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
});

