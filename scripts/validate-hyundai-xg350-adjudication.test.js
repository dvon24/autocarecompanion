/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { RECALL_QUERIES } = require('./build-hyundai-xg350-adjudication');
const { validatePacket } = require('./validate-hyundai-xg350-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-xg350-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('XG350 hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('all four XG350 rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 4);
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});

test('packet covers every frozen XG350 ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'XG350')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 4);
});

test('official recall results are kept as unrelated evidence only', () => {
  assert.equal(Object.keys(RECALL_QUERIES).length, 5);
  for (const row of packet.rows) {
    assert.deepEqual(row.proposal.citations, row.before.citations, row.id);
    assert.match(row.evidence[0].observation, /sub-frame|fuel-tank/i);
    assert.match(row.evidence[0].observation, /none/i);
  }
});

test('placeholder-style and generic source claims are not promoted', () => {
  const forumOrVideoRows = packet.rows.filter((row) =>
    row.before.citations.some((citation) =>
      /12345|youtube|hyundai-forums\.com/i.test(citation.url || ''),
    ),
  );
  assert.equal(forumOrVideoRows.length, 4);
  for (const row of forumOrVideoRows) assert.deepEqual(row.proposal, row.before);
});
