/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { RECALL_QUERIES } = require('./build-infiniti-ex35-adjudication');
const { validatePacket } = require('./validate-infiniti-ex35-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-infiniti-ex35-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('EX35 hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('the indexed EX35 row remains byte-for-byte frozen', () => {
  const [row] = packet.rows;
  assert.equal(row.action, 'keep_published_pending_source');
  assert.equal(row.beforeSha256, row.proposalSha256);
  assert.deepEqual(row.changedFields, []);
  assert.deepEqual(row.proposal, row.before);
});

test('packet covers the one frozen EX35 ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Infiniti' && row.model === 'EX35')
    .map((row) => row.id);
  assert.deepEqual(packet.rows.map((row) => row.id), expected);
  assert.equal(new Set(expected).size, 1);
});

test('official recall results remain mismatch evidence only', () => {
  assert.equal(Object.keys(RECALL_QUERIES).length, 5);
  const [row] = packet.rows;
  assert.deepEqual(row.proposal.citations, row.before.citations);
  assert.match(row.evidence[0].observation, /steering|air bag|hitch/i);
  assert.match(row.evidence[0].observation, /none/i);
});
