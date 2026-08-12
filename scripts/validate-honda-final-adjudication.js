/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { fullRecord, hashValue } = require('./build-honda-adjudication');
const {
  OUTPUT_FILE, REVIEW_INDEX_FILE, SNAPSHOT_FILE, buildFinalPacket, normalizedFileHash,
} = require('./build-honda-final-adjudication');

function validatePacket(packet, snapshot, reviewIndex, snapshotSha256, reviewIndexSha256) {
  const errors = [];
  if (packet.status !== 'proposal-only' || packet.purpose !== 'current-production-consolidated-hold') errors.push('packet safety status mismatch');
  if (packet.requiresIndependentApproval !== true || packet.make !== 'Honda') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== snapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot provenance mismatch');
  if (packet.source?.reviewedEvidenceIndexSha256 !== reviewIndexSha256) errors.push('review-index provenance mismatch');
  if (packet.rows?.length !== 383 || new Set(packet.rows?.map((row) => row.id)).size !== 383) errors.push('packet must cover 383 unique IDs');
  const snapshotById = new Map(snapshot.records.map((row) => [row.id, row]));
  for (const row of packet.rows || []) {
    const source = snapshotById.get(row.id);
    if (!source) { errors.push(`${row.id}: not in current snapshot`); continue; }
    if (hashValue(row.before) !== hashValue(fullRecord(source))) errors.push(`${row.id}: before differs from current snapshot`);
    if (hashValue(row.before) !== row.beforeSha256 || hashValue(row.proposal) !== row.proposalSha256) errors.push(`${row.id}: row hash mismatch`);
    if (hashValue(row.proposal) !== hashValue(row.before)) errors.push(`${row.id}: held proposal changed current production`);
    if (row.action !== 'hold_indexed_identity_byte_identical' || row.proposal.status !== 'published') errors.push(`${row.id}: unsafe action or status`);
  }
  if (packet.summary?.hold_indexed_identity_byte_identical !== 383 || packet.summary?.authorizedWriteCount !== 0) errors.push('summary must authorize zero writes');
  const deterministic = buildFinalPacket(snapshot, reviewIndex, snapshotSha256, reviewIndexSha256);
  if (JSON.stringify(packet) !== JSON.stringify(deterministic)) errors.push('packet differs from deterministic current-production rebuild');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  const reviewIndex = JSON.parse(fs.readFileSync(REVIEW_INDEX_FILE, 'utf8'));
  const errors = validatePacket(packet, snapshot, reviewIndex, normalizedFileHash(SNAPSHOT_FILE), normalizedFileHash(REVIEW_INDEX_FILE));
  console.log(JSON.stringify({ passed: !errors.length, rows: packet.rows?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { validatePacket };
