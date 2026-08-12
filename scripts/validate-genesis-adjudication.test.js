/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { safeTrims } = require('./build-genesis-adjudication');
const { expectedAction } = require('./validate-genesis-adjudication');

test('safeTrims keeps trim names and removes applicability prose', () => {
  assert.deepEqual(
    safeTrims(['Sport Prestige', 'Vehicles covered by campaign T27G', '3.3T Sport']),
    ['Sport Prestige', '3.3T Sport'],
  );
});

test('the action map holds every reviewed Genesis row without changing publication', () => {
  assert.equal(expectedAction('genesis-g70-turbo-oil-line-leak'), 'hold_indexed_identity_byte_identical');
  assert.equal(expectedAction('genesis-g80-electrified-software'), 'hold_indexed_identity_byte_identical');
  assert.equal(expectedAction('genesis-gv60-range-inconsistency'), 'hold_indexed_identity_byte_identical');
  assert.equal(expectedAction('not-in-scope'), null);
});

test('high-risk Genesis corrections remain byte-identical holds', () => {
  const packet = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '..', 'data', 'known-issue-genesis-adjudication-2026-08-05.json'),
    'utf8',
  ));
  for (const row of packet.rows) {
    assert.equal(row.action, 'hold_indexed_identity_byte_identical');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposal.status, 'published');
  }
  assert.equal(packet.rows.length, 63);
  assert.equal(packet.summary.hold_indexed_identity_byte_identical, 63);
});
