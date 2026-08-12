/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-xk-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-xk-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('XK packet passes the complete SEO and identity safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 2, keep_published_pending_source: 20, total: 22 });
});

test('twenty XK holds remain byte-for-byte frozen', () => {
  const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 20);
  for (const row of holds) {
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('two exact recall rewrites preserve indexed identity and remove unsupported applicability and commerce', () => {
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.equal(rewrites.length, 2);
  for (const row of rewrites) {
    for (const field of ['make', 'model', 'title', 'category', 'years', 'status', 'relatedIssueIds']) assert.deepEqual(row.proposal[field], row.before[field], `${row.id}: ${field}`);
    assert.deepEqual(row.proposal.trims, []);
    assert.deepEqual(row.proposal.engines, []);
    assert.deepEqual(row.proposal.dtcCodes, []);
    assert.deepEqual(row.proposal.communityRecommendations, []);
    assert.deepEqual(row.proposal.fixParts, []);
    assert.equal(row.proposal.estimatedCostLow, null);
    assert.equal(row.proposal.estimatedCostHigh, null);
    assert.equal(row.proposal.typicalMileageLow, null);
    assert.equal(row.proposal.typicalMileageHigh, null);
    assert.equal(row.proposal.humanApproved, false);
    assert.equal(row.proposal.reportCount, 0);
    assert.equal(row.proposal.source, 'manual');
  }
});

test('packet covers every frozen Jaguar XK ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'XK').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source mismatches are explicit and cannot replace indexed identities', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.waterPump).reason, /leak.*AJ133.*B46456/i);
  assert.match(byId.get(IDS.coolantPipe).reason, /does not include XK|excludes XK/i);
  assert.match(byId.get(IDS.differential).reason, /service part.*design change/i);
  assert.match(byId.get(IDS.supercharger).reason, /2010.*2014.*5\.0/i);
  assert.match(byId.get(IDS.timing).reason, /Land Rover-only|does not include Jaguar XK/i);
  assert.match(byId.get(IDS.tpms).reason, /112.*run-flat.*configuration/i);
});

test('the two rewrites use exact NHTSA campaign URLs and remedies', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  const headlamp = byId.get(IDS.headlamp).proposal;
  const accelerator = byId.get(IDS.acceleration).proposal;
  assert.equal(headlamp.citations[0].url, SOURCES.headlampCampaign);
  assert.equal(headlamp.severity, byId.get(IDS.headlamp).before.severity);
  assert.match(headlamp.solution, /owner(?:'s)? manual addendum/i);
  assert.equal(accelerator.citations[0].url, SOURCES.accelerationCampaign);
  assert.match(accelerator.solution, /inspect.*pedal assembly.*replace/i);
});
