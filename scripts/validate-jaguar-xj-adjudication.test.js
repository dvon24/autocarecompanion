/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, SOURCES } = require('./build-jaguar-xj-adjudication');
const { PACKET, SNAPSHOT, validatePacket } = require('./validate-jaguar-xj-adjudication');

const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('XJ packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
  assert.deepEqual(packet.summary, { rewrite_same_identity: 1, keep_published_pending_source: 4, total: 5 });
});

test('four XJ rows remain byte-for-byte frozen', () => {
  for (const row of packet.rows.filter((item) => item.id !== IDS.throttle)) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('packet covers every frozen Jaguar XJ ID exactly once', () => {
  const expected = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'XJ').map((row) => row.id).sort();
  assert.deepEqual(packet.rows.map((row) => row.id).sort(), expected);
  assert.deepEqual(Object.values(IDS).sort(), expected);
});

test('official source mismatches remain explicit and unsafe throttle advice is removed', () => {
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  assert.match(byId.get(IDS.air).reason, /XJ204-06.*diagnos/i);
  assert.match(byId.get(IDS.air).reason, /P-2936.*not.*verif/i);
  assert.match(byId.get(IDS.bcm).reason, /no exact.*primary source/i);
  assert.match(byId.get(IDS.rearMain).reason, /clutch.*manual/i);
  assert.match(byId.get(IDS.supercharger).reason, /torsional isolator/i);
  assert.match(byId.get(IDS.supercharger).reason, /bearing.*oil.*50,000/i);
  assert.match(byId.get(IDS.throttle).reason, /cleaning prohibited/i);
  assert.equal(byId.get(IDS.throttle).action, 'rewrite_same_identity');
  assert.match(byId.get(IDS.throttle).proposal.solution, /Do not follow.*cleaning procedure/i);
  assert.match(byId.get(IDS.throttle).proposal.solution, /2004 XJ.*prohibits/i);
  assert.doesNotMatch(byId.get(IDS.throttle).proposal.solution, /clean with|approved cleaner|CRC/i);
  assert.deepEqual(byId.get(IDS.throttle).proposal.communityRecommendations, []);
  assert.deepEqual(byId.get(IDS.throttle).proposal.dtcCodes, []);
  assert.deepEqual(byId.get(IDS.throttle).proposal.engines, []);
  assert.equal(byId.get(IDS.throttle).proposal.citations[0].url, SOURCES.communicationsDataset);
  assert.equal(byId.get(IDS.supercharger).evidence[0].url, SOURCES.supercharger);
  assert.equal(byId.get(IDS.throttle).evidence[0].url, SOURCES.communicationsDataset);
});
