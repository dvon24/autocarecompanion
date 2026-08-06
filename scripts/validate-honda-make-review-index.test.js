/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validateIndex } = require('./validate-honda-make-review-index');

const ROOT = path.resolve(__dirname, '..');
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-honda-make-review-index-2026-08-06.json'), 'utf8'));

test('Honda make review index deterministically covers every frozen ID once', () => { assert.deepEqual(validateIndex(index), []); });
test('all 280 hold rows remain hash-identical and change-free', () => {
  const holds = index.rows.filter((row) => row.action === 'keep_published_pending_source');
  assert.equal(holds.length, 280);
  for (const row of holds) { assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); }
});
test('review index selects only the two explicitly remediated base-packet models', () => {
  const baseRows = index.rows.filter((row) => row.packetFile === 'data/known-issue-honda-adjudication-2026-08-05.json');
  assert.equal(baseRows.length, 23);
  assert.deepEqual([...new Set(baseRows.map((row) => row.model))].sort(), ['Ridgeline', 'S2000']);
});
test('no review action can archive or remove a row', () => {
  assert.deepEqual([...new Set(index.rows.map((row) => row.action))].sort(), ['correct_clicked_integrity', 'keep_published_pending_source', 'remove_invalid_search_link', 'rewrite_same_identity']);
});
