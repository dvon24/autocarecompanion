/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { hashValue, safeTrims } = require('./build-genesis-adjudication');
const { expectedAction, validatePacket } = require('./validate-genesis-adjudication');

const PACKET_FILE = path.resolve(__dirname, '..', 'data', 'known-issue-genesis-adjudication-2026-08-05.json');
const SNAPSHOT_FILE = path.resolve(__dirname, '..', 'data', '_genesis-deeplink-snapshot-2026-08-05.json');
function fixture() {
  return {
    packet: JSON.parse(fs.readFileSync(PACKET_FILE, 'utf8')),
    snapshot: JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')),
    snapshotSha256: require('node:crypto').createHash('sha256').update(fs.readFileSync(SNAPSHOT_FILE)).digest('hex'),
  };
}

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
  const { packet } = fixture();
  for (const row of packet.rows) {
    assert.equal(row.action, 'hold_indexed_identity_byte_identical');
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposal.status, 'published');
  }
  assert.equal(packet.rows.length, 63);
  assert.equal(packet.summary.hold_indexed_identity_byte_identical, 63);
});

test('validator rejects held commerce injected into both before and proposal', () => {
  const { packet, snapshot, snapshotSha256 } = fixture();
  const row = packet.rows[0];
  row.before.fixParts = [{ name: 'Injected', buyLinks: [{ url: 'https://example.com/product/1234' }] }];
  row.proposal.fixParts = row.before.fixParts;
  row.beforeSha256 = hashValue(row.before);
  row.proposalSha256 = hashValue(row.proposal);
  assert.match(validatePacket(packet, snapshot, snapshotSha256).join('\n'), /before differs from frozen snapshot|deterministic/);
});

test('validator rejects forged reviewed evidence with unchanged headline totals', () => {
  const { packet, snapshot, snapshotSha256 } = fixture();
  const row = packet.rows[0];
  row.reviewedAction = 'archive_unsupported';
  row.reviewedProposalSha256 = '0'.repeat(64);
  row.protectedDrift = ['title'];
  row.canonicalId = 'forged-target';
  row.commerceDecision = 'forged';
  assert.match(validatePacket(packet, snapshot, snapshotSha256).join('\n'), /deterministic reviewed-evidence rebuild/);
});
