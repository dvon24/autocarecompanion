/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { hashValue } = require('./build-honda-adjudication');
const {
  OUTPUT_FILE, REVIEW_INDEX_FILE, SNAPSHOT_FILE, normalizedFileHash,
} = require('./build-honda-final-adjudication');
const { validatePacket } = require('./validate-honda-final-adjudication');

function fixture() {
  return {
    packet: JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')),
    snapshot: JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')),
    reviewIndex: JSON.parse(fs.readFileSync(REVIEW_INDEX_FILE, 'utf8')),
    snapshotSha256: normalizedFileHash(SNAPSHOT_FILE),
    reviewIndexSha256: normalizedFileHash(REVIEW_INDEX_FILE),
  };
}
function errors(value) {
  return validatePacket(value.packet, value.snapshot, value.reviewIndex, value.snapshotSha256, value.reviewIndexSha256);
}

test('consolidated Honda packet covers current production once and authorizes zero writes', () => {
  const value = fixture();
  assert.deepEqual(errors(value), []);
  assert.equal(value.packet.rows.length, 383);
  assert.equal(value.packet.summary.hold_indexed_identity_byte_identical, 383);
  assert.equal(value.packet.summary.authorizedWriteCount, 0);
});

test('matched before and proposal commerce injection is rejected', () => {
  const value = fixture();
  const row = value.packet.rows[0];
  row.before.fixParts = [{ name: 'Injected', buyLinks: [{ url: 'https://example.com/product/1234' }] }];
  row.proposal.fixParts = row.before.fixParts;
  row.beforeSha256 = hashValue(row.before);
  row.proposalSha256 = hashValue(row.proposal);
  assert.match(errors(value).join('\n'), /before differs from current snapshot|deterministic/);
});

test('same-total reviewed provenance mutation is rejected', () => {
  const value = fixture();
  value.packet.rows[0].reviewedAction = 'forged';
  value.packet.rows[0].reviewedProposalSha256 = '0'.repeat(64);
  value.packet.rows[0].reviewedChangedFields = ['title'];
  assert.match(errors(value).join('\n'), /deterministic current-production rebuild/);
});

test('missing and duplicated IDs are rejected', () => {
  const missing = fixture();
  missing.packet.rows.pop();
  assert.match(errors(missing).join('\n'), /383 unique IDs|deterministic/);
  const duplicate = fixture();
  duplicate.packet.rows[1] = duplicate.packet.rows[0];
  assert.match(errors(duplicate).join('\n'), /383 unique IDs|deterministic/);
});
