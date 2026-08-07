/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, PDF_SOURCES, REWRITE_CARDS } = require('./build-jeep-cherokee-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-cherokee-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Cherokee packet passes the complete proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 2, keep_published_pending_source: 16, total: 18 });
});

test('all frozen Cherokee identities and publication states are preserved', () => {
  const frozen = new Map(snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Cherokee').map((row) => [row.id, row]));
  for (const row of packet.rows) {
    const before = frozen.get(row.id);
    assert.equal(row.proposal.make, before.make);
    assert.equal(row.proposal.model, before.model);
    assert.equal(row.proposal.title, before.title);
    assert.equal(row.proposal.category, before.category);
    assert.deepEqual(row.proposal.years, before.years);
    assert.equal(row.proposal.status, 'published');
  }
});

test('sixteen holds remain byte-for-byte frozen', () => {
  const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 16);
  for (const row of holds) {
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('two same-identity recall rewrites are no-commerce and preserve related links', () => {
  const rewritten = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.deepEqual(rewritten.map((row) => row.id).sort(), Object.keys(REWRITE_CARDS).sort());
  for (const row of rewritten) {
    assert.deepEqual(row.proposal.trims, []);
    assert.deepEqual(row.proposal.engines, []);
    assert.deepEqual(row.proposal.dtcCodes, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.equal(row.proposal.estimatedCostLow, null);
    assert.equal(row.proposal.estimatedCostHigh, null);
    assert.equal(row.proposal.typicalMileageLow, null);
    assert.equal(row.proposal.typicalMileageHigh, null);
    assert.deepEqual(row.proposal.relatedIssueIds, row.before.relatedIssueIds);
  }
});

test('critical source mismatches are explicit and never overwrite indexed pages', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.canBus).reason, /Ferrari.*SABELT.*not.*Jeep/i);
  assert.equal(byId.get(IDS.canBus).evidence[0].url, PDF_SOURCES.canBus.url);
  assert.match(byId.get(IDS.shifter).reason, /Grand Cherokee.*not.*Cherokee/i);
  assert.match(byId.get(IDS.headlamp).reason, /2019-2022.*2014-2023/i);
  assert.match(byId.get(IDS.rearMain).reason, /transmission.*two-piece|two-piece.*transmission/i);
});
