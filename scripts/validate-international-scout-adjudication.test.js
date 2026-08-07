/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
  IDS,
  SOURCES,
} = require('./build-international-scout-adjudication');
const {
  PACKET,
  SNAPSHOT,
  validatePacket,
} = require('./validate-international-scout-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Scout hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    rewrite_same_identity: 0,
    keep_published_pending_source: 7,
    total: 7,
  });
});

test('all seven Scout rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen International ID exactly once', () => {
  const expected = snapshot.records.map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('scope conflicts are documented instead of silently rewritten', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.hotStart).reason, /voltage drop/i);
  assert.match(byId.get(IDS.goldBox).reason, /1976-1977/i);
  assert.match(byId.get(IDS.fuelTank).reason, /1972-1980/i);
  assert.match(byId.get(IDS.cooling).reason, /delete|lock.*open/i);
  assert.equal(byId.get(IDS.goldBox).evidence[0].url, SOURCES.pertronixGoldBox);
});
