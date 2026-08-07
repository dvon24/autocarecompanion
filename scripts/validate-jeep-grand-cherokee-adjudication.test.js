/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { ALL_IDS, IDS } = require('./build-jeep-grand-cherokee-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jeep-grand-cherokee-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Grand Cherokee packet passes the proposal-only safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 0,
    keep_published_pending_source: 77,
    total: 77,
  });
});

test('all 77 Grand Cherokee rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers the complete frozen Grand Cherokee set', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee')
    .map((row) => row.id)
    .sort();
  assert.equal(expected.length, 77);
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual([...ALL_IDS].sort(), expected);
});

test('critical recall scope and component mismatches remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.fuelTank).reason, /13V252.*1993-1998.*1994-2004/i);
  assert.match(byId.get(IDS.alternatorBroad).reason, /2012-2014.*2011-2014/i);
  assert.match(byId.get(IDS.lossOfDrive).reason, /loss of steering control.*loss of drive power/i);
  assert.match(byId.get(IDS.rearCoil).reason, /26V051.*2022-2023.*2024/i);
  assert.match(byId.get(IDS.secondRowAirbag).reason, /front seat.*second-row/i);
});

test('overlapping identities are reported without retiring either indexed page', () => {
  const codes = new Set(packet.observations.map((item) => item.code));
  for (const code of [
    'grand-cherokee-duplicate-alternator-pages',
    'grand-cherokee-overlapping-oil-filter-housing-pages',
    'grand-cherokee-overlapping-cylinder-head-pages',
    'grand-cherokee-overlapping-hemi-tick-pages',
    'all-grand-cherokee-pages-preserved',
  ]) assert.equal(codes.has(code), true, code);
});
