/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

test('every Hyundai proposal preserves the indexed title and category', () => {
  const files = fs.readdirSync(DATA)
    .filter((name) => /^known-issue-hyundai-.*-adjudication-2026-08-06\.json$/.test(name))
    .sort();
  assert.ok(files.length >= 11);
  for (const file of files) {
    const packet = JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));
    for (const row of packet.rows || []) {
      assert.equal(row.proposal.title, row.before.title, `${file}: ${row.id}: title`);
      assert.equal(row.proposal.category, row.before.category, `${file}: ${row.id}: category`);
    }
  }
});
