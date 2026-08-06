/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-hyundai-veloster-adjudication');
const { validatePacket } = require('./validate-hyundai-veloster-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-veloster-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Veloster proposal packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen Veloster ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Veloster')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 9);
});

test('only the exact 2012 panoramic-sunroof identity is rewritten', () => {
  for (const row of packet.rows) {
    if (row.id === IDS.sunroof) {
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

test('sunroof rewrite preserves indexed identity and exact two-recall scope', () => {
  const row = packet.rows.find((item) => item.id === IDS.sunroof);
  assert.equal(row.proposal.title, row.before.title);
  assert.equal(row.proposal.category, row.before.category);
  assert.equal(row.proposal.status, 'published');
  assert.deepEqual(row.proposal.years, [2012]);
  assert.deepEqual(row.proposal.citations.map((item) => item.url), [
    SOURCES.sunroof12V568,
    SOURCES.sunroof13V051,
  ]);
  assert.match(row.proposal.description, /weakened during installation/i);
  assert.match(row.proposal.description, /break while the vehicle is in motion/i);
  assert.match(row.proposal.solution, /inspect the sunroof.*integrity/i);
  assert.match(row.proposal.solution, /replace the sunroof glass assembly/i);
  assert.doesNotMatch(row.proposal.solution, /protective film|cabin air filter|goodwill/i);
});

test('sunroof rewrite removes unsupported applicability, diagnostics and commerce', () => {
  const row = packet.rows.find((item) => item.id === IDS.sunroof);
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
});

test('wrong-speed DCT, false IVT citation, partial knock and repair-only MDPS rows stay frozen', () => {
  for (const id of [IDS.dct, IDS.ivt, IDS.knock, IDS.mdps]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.ok(row.evidence.length > 0, id);
  }
});
