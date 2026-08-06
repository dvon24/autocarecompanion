/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { IDS, MISMATCH_SOURCES } = require('./build-hyundai-veracruz-adjudication');
const { validatePacket } = require('./validate-hyundai-veracruz-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'data', 'known-issue-hyundai-veracruz-adjudication-2026-08-06.json'),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'),
);

test('Veracruz hold packet passes the complete safety contract', () => {
  assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []);
});

test('all five Veracruz rows remain byte-for-byte frozen', () => {
  assert.equal(packet.rows.length, 5);
  for (const row of packet.rows) {
    assert.equal(row.action, 'keep_published_pending_source');
    assert.equal(row.beforeSha256, row.proposalSha256, row.id);
    assert.deepEqual(row.changedFields, [], row.id);
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});

test('packet covers every frozen Veracruz ID exactly once', () => {
  const expected = snapshot.records
    .filter((row) => row.make === 'Hyundai' && row.model === 'Veracruz')
    .map((row) => row.id)
    .sort();
  const actual = packet.rows.map((row) => row.id).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, 5);
});

test('oil-leak recall does not replace the voltage-regulator page', () => {
  const row = packet.rows.find((item) => item.id === IDS.alternator);
  assert.deepEqual(row.proposal, row.before);
  assert.equal(row.evidence[0].url, MISMATCH_SOURCES.alternatorOilLeak);
  assert.match(row.evidence[0].observation, /front.*valve cover gasket/i);
  assert.match(row.evidence[0].observation, /not.*voltage[- ]regulator/i);
});

test('ATM policy is repair guidance, not proof of transfer-case or shudder defects', () => {
  for (const id of [IDS.transferCase, IDS.transmission]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.deepEqual(row.proposal, row.before);
    assert.ok(row.evidence.some((item) => item.url === MISMATCH_SOURCES.atmPolicy), id);
  }
});

test('TSB 09-AT-001 is not represented as a Veracruz warranty extension', () => {
  const row = packet.rows.find((item) => item.id === IDS.transmission);
  assert.ok(row.evidence.some((item) => item.url === MISMATCH_SOURCES.tsbIndex));
  assert.match(row.reason, /09-AT-001/i);
  assert.match(row.reason, /Genesis/i);
  assert.deepEqual(row.proposal.citations, row.before.citations);
});

test('unsupported decoupler and sunroof narratives keep every field unchanged', () => {
  for (const id of [IDS.decoupler, IDS.sunroof]) {
    const row = packet.rows.find((item) => item.id === id);
    assert.deepEqual(row.proposal, row.before);
    assert.deepEqual(row.changedFields, []);
  }
});
