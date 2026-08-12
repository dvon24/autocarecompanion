/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue } = require('./build-honda-adjudication');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT_FILE = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const REVIEW_INDEX_FILE = path.join(ROOT, 'data', 'known-issue-honda-make-review-index-2026-08-06.json');
const OUTPUT_FILE = path.join(ROOT, 'data', 'known-issue-honda-final-adjudication-2026-08-12.json');

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function actionCounts(rows) {
  return Object.fromEntries([...new Set(rows.map((row) => row.action))].sort().map(
    (action) => [action, rows.filter((row) => row.action === action).length],
  ));
}

function buildFinalPacket(
  snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')),
  reviewIndex = JSON.parse(fs.readFileSync(REVIEW_INDEX_FILE, 'utf8')),
  snapshotSha256 = normalizedFileHash(SNAPSHOT_FILE),
  reviewIndexSha256 = normalizedFileHash(REVIEW_INDEX_FILE),
) {
  if (snapshot.records.length !== 383 || snapshot.records.some((row) => row.make !== 'Honda' || row.status !== 'published')) {
    throw new Error('Honda current-production snapshot must contain exactly 383 published Honda rows');
  }
  if (reviewIndex.rows?.length !== 383 || new Set(reviewIndex.rows.map((row) => row.id)).size !== 383) {
    throw new Error('Honda reviewed evidence index must contain exactly 383 unique rows');
  }
  const reviewedById = new Map(reviewIndex.rows.map((row) => [row.id, row]));
  const rows = snapshot.records.map((current) => {
    const reviewed = reviewedById.get(current.id);
    if (!reviewed) throw new Error(`${current.id}: missing prior reviewed evidence`);
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'hold_indexed_identity_byte_identical',
      reviewedAction: reviewed.action,
      reviewedPacketFile: reviewed.packetFile,
      reviewedBeforeSha256: reviewed.beforeSha256,
      reviewedProposalSha256: reviewed.proposalSha256,
      reviewedChangedFields: reviewed.changedFields,
      reason: 'The prior evidence review is retained for provenance, but production gained content and commerce after that freeze. This row remains byte-identical until a fresh same-identity rewrite is independently approved against current production.',
      identityRule: 'Preserve the current indexed URL, model, scope, title, category, severity and published status byte-for-byte.',
      commerceDecision: 'preserve-current-production-byte-identical',
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    };
  });
  const ids = new Set(rows.map((row) => row.id));
  const extraReviewed = reviewIndex.rows.filter((row) => !ids.has(row.id)).map((row) => row.id);
  if (extraReviewed.length) throw new Error(`prior review has IDs outside current production: ${extraReviewed.join(', ')}`);
  const perModel = Object.values(rows.reduce((acc, row) => {
    if (!acc[row.model]) acc[row.model] = { model: row.model, rowCount: 0, actions: {} };
    acc[row.model].rowCount += 1;
    acc[row.model].actions[row.action] = (acc[row.model].actions[row.action] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => a.model.localeCompare(b.model));
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    purpose: 'current-production-consolidated-hold',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-12',
    make: 'Honda',
    reviewBranch: 'codex/honda-deeplink-audit',
    safetyContract: [
      'All 383 current published Honda rows remain byte-identical; this packet authorizes zero database writes.',
      'The older make-wide and per-model packets are review provenance only and are superseded for application by this one exact current-production packet.',
      'No title, model, year, trim, engine, category, severity, status, owner telemetry or commerce field may change.',
      'Any future rewrite must start from a new current-production freeze and pass independent full-record review.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256,
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      productionRecordCount: snapshot.records.length,
      reviewedEvidenceIndexFile: 'data/known-issue-honda-make-review-index-2026-08-06.json',
      reviewedEvidenceIndexSha256: reviewIndexSha256,
    },
    summary: { ...actionCounts(rows), total: rows.length, authorizedWriteCount: 0 },
    perModel,
    rows,
  };
}

function main() {
  const packet = buildFinalPacket();
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT_FILE, sha256: normalizedFileHash(OUTPUT_FILE), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { OUTPUT_FILE, REVIEW_INDEX_FILE, SNAPSHOT_FILE, buildFinalPacket, normalizedFileHash };
