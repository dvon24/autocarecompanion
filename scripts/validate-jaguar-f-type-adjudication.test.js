/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-f-type-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-f-type-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('F-TYPE hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 });
});

test('all four F-TYPE rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jaguar F-TYPE ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.model === 'F-TYPE').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source mismatches and source gaps remain explicit', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.convertibleTop).reason, /wear|white marks/i);
  assert.match(byId.get(IDS.convertibleTop).reason, /not.*hydraulic/i);
  assert.match(byId.get(IDS.differential).reason, /no exact.*bulletin|no.*exact.*source/i);
  assert.match(byId.get(IDS.supercharger).reason, /torsional[- ]isolator/i);
  assert.match(byId.get(IDS.supercharger).reason, /not.*nose[- ]cone bearing/i);
  assert.match(byId.get(IDS.transmission).reason, /2014-2015/i);
  assert.match(byId.get(IDS.transmission).reason, /software/i);
  assert.match(byId.get(IDS.transmission).reason, /not.*valve body/i);
  assert.equal(byId.get(IDS.supercharger).evidence[0].url, SOURCES.supercharger);
});
