/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path'); const test = require('node:test');
const { IDS, MISMATCH_SOURCES } = require('./build-hyundai-ioniq-5-n-adjudication');
const { validatePacket } = require('./validate-hyundai-ioniq-5-n-adjudication');
const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-ioniq-5-n-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Ioniq 5 N hold packet passes the complete safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []); });
test('all four Ioniq 5 N rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 4);
  for (const row of packet.rows) { assert.equal(row.action, 'keep_published_pending_source'); assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); }
});
test('packet covers every frozen Ioniq 5 N ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Ioniq 5 N').map((row) => row.id).sort();
  const actual = packet.rows.map((row) => row.id).sort(); assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 4);
});
test('nearby recalls remain mismatch evidence and never replace frozen citations', () => {
  for (const row of packet.rows) assert.deepEqual(row.proposal.citations, row.before.citations, row.id);
  assert.deepEqual(packet.rows.find((row) => row.id === IDS.iccu).evidence.map((item) => item.url), [MISMATCH_SOURCES.iccu]);
  assert.deepEqual(packet.rows.find((row) => row.id === IDS.brakeNoise).evidence.map((item) => item.url), [MISMATCH_SOURCES.braking]);
});
