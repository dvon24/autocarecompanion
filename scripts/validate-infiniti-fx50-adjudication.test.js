/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, SOURCES } = require('./build-infiniti-fx50-adjudication');
const { validatePacket } = require('./validate-infiniti-fx50-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-infiniti-fx50-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('FX50 packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen FX50 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'FX50').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 6);
});

test('only the exact brake-judder identity is rewritten', () => {
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.deepEqual(rewrites.map((row) => row.id), [IDS.brake]);
  const [row] = rewrites;
  assert.equal(row.proposal.title, row.before.title);
  assert.equal(row.proposal.category, row.before.category);
  assert.equal(row.proposal.status, 'published');
  assert.equal(row.proposal.citations[0].url, SOURCES.brake);
  for (const field of ['trims', 'engines', 'dtcCodes', 'communityRecommendations', 'fixParts']) assert.deepEqual(row.proposal[field], [], field);
  for (const field of ['estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh']) assert.equal(row.proposal[field], null, field);
});

test('five unsupported identities remain byte-for-byte frozen', () => {
  const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 5);
  for (const row of holds) {
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});
