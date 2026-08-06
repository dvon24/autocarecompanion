/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-venue-adjudication');
const { validatePacket } = require('./validate-hyundai-venue-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-venue-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Venue proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Venue ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Venue')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 9);
});

test('only the three exact official-record identities are rewritten', () => {
  const rewriteIds = new Set([IDS.egr, IDS.pretensioner, IDS.antiTheft]);
  for (const row of packet.rows) {
    if (rewriteIds.has(row.id)) {
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

test('EGR rewrite stays within recall 24V308', () => {
  const row = packet.rows.find((item) => item.id === IDS.egr);
  assert.deepEqual(row.proposal.years, [2024]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.egr]);
  assert.match(row.proposal.description, /solder flux/i);
  assert.match(row.proposal.description, /electrical short/i);
  assert.match(row.proposal.description, /malfunction indicator lamp/i);
  assert.match(row.proposal.description, /loss of motive power/i);
  assert.match(row.proposal.solution, /replace the EGR valve assembly/i);
  assert.doesNotMatch(row.proposal.solution, /RepairPal|June 28|1-855/i);
});

test('pretensioner rewrite removes unsupported return instructions', () => {
  const row = packet.rows.find((item) => item.id === IDS.pretensioner);
  assert.deepEqual(row.proposal.years, [2020, 2021, 2022]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.pretensioner]);
  assert.match(row.proposal.description, /over-pressur/i);
  assert.match(row.proposal.description, /metal fragments/i);
  assert.match(row.proposal.description, /no warning/i);
  assert.match(row.proposal.solution, /cap/i);
  assert.doesNotMatch(row.proposal.solution, /previously repaired|must return/i);
});

test('anti-theft rewrite is limited to eligible non-push-button Venue vehicles', () => {
  const row = packet.rows.find((item) => item.id === IDS.antiTheft);
  assert.deepEqual(row.proposal.years, [2020, 2021]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.antiTheft]);
  assert.match(row.proposal.description, /certain/i);
  assert.match(row.proposal.description, /not equipped with.*push-button/i);
  assert.match(row.proposal.description, /not equipped with.*immobilizer/i);
  assert.match(row.proposal.solution, /Campaign 993/i);
  assert.match(row.proposal.solution, /key fob/i);
  assert.doesNotMatch(row.proposal.description, /all 2020|all 2021|every Venue/i);
});

test('every rewrite preserves identity and removes unsupported applicability and commerce', () => {
  for (const row of packet.rows.filter((item) => item.action === 'rewrite_same_identity')) {
    assert.equal(row.proposal.title, row.before.title);
    assert.equal(row.proposal.category, row.before.category);
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
    assert.equal(row.proposal.reportCount, 0);
  }
});

test('partial horn and IVT evidence plus unsupported rows remain frozen', () => {
  for (const id of [IDS.horn, IDS.cvtJudder, IDS.ivtFailure]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.ok(row.evidence.length > 0, id);
  }
  for (const id of [IDS.infotainment, IDS.stalling, IDS.rearCamera]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
  }
});
