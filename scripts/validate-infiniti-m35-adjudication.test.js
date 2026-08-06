/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-infiniti-m35-adjudication');
const { validatePacket } = require('./validate-infiniti-m35-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-infiniti-m35-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('M35 packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('packet covers every frozen M35 ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'M35').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 6);
});

test('only the exact-identity brake row is rewritten', () => {
  const rewritten = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  assert.deepEqual(rewritten.map((row) => row.id), [IDS.brake]);
  assert.equal(rewritten[0].proposal.title, rewritten[0].before.title);
  assert.equal(rewritten[0].proposal.category, rewritten[0].before.category);
  assert.deepEqual(rewritten[0].proposal.years, rewritten[0].before.years);
  assert.equal(rewritten[0].proposal.citations[0].url, SOURCES.brake);
});

test('the five unsupported identities remain byte-for-byte frozen', () => {
  const held = packet.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(held.length, 5);
  for (const row of held) {
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});

test('distinct recall identities are deferred rather than substituted', () => {
  const deferred = packet.observations.find((item) => item.code === 'deferred-new-m35-recall-candidates');
  assert.deepEqual(deferred.campaignNumbers, ['09V393000', '13V430000', '20V008000']);
  assert.deepEqual(deferred.recordIds, []);
});
