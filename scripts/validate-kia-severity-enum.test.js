/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const DATA = path.resolve(__dirname, '..', 'data');
const PACKET_PATTERN = /^known-issue-kia-.+-adjudication-2026-08-\d{2}\.json$/;

test('every Kia proposal uses the catalog severity and confidence enum', () => {
  const allowed = new Set(['high', 'medium', 'low']);
  const files = fs.readdirSync(DATA).filter((file) => PACKET_PATTERN.test(file)).sort();
  assert.equal(files.length, 23);
  let rowCount = 0;
  for (const file of files) {
    const packet = JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));
    for (const row of packet.rows || []) {
      rowCount += 1;
      assert.ok(allowed.has(row.proposal.severity), `${row.id}: invalid severity ${row.proposal.severity}`);
      assert.ok(allowed.has(row.proposal.confidence), `${row.id}: invalid confidence ${row.proposal.confidence}`);
    }
  }
  assert.equal(rowCount, 247);
});
