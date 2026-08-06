/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  FULL_RECORD_FIELDS,
  normalizedFileHash,
  stableValue,
} = require('./infiniti-adjudication-utils');

function snapshotHashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const SNAPSHOT = path.resolve(
  __dirname,
  '..',
  'data',
  '_infiniti-deeplink-snapshot-2026-08-06.json',
);
const EXPECTED_SHA256 = 'd39bdd77a0557365946b551a26b951cb1a5ba81773b7b66497201347b5034f64';
const EXPECTED_SNAPSHOT_HASH = '45dde736354a9dcd17a72399b0101f30373ca9c267e6cd49a2528a63a023eebd';
const EXPECTED_MODELS = {
  EX35: 1,
  FX35: 6,
  FX45: 6,
  FX50: 6,
  G35: 3,
  G37: 3,
  M35: 6,
  M37: 6,
  M56: 5,
  Q50: 1,
  Q60: 2,
  Q70: 1,
  QX50: 7,
  QX55: 8,
  QX60: 7,
  QX70: 2,
  QX80: 3,
};
const EXPECTED_INVENTORY = {
  publishedIssueCount: 73,
  commerceIssueCount: 47,
  claimCount: 68,
  fixPartClaimCount: 10,
  communityClaimCount: 58,
  noLinkClaimCount: 0,
  linkCount: 88,
  validProductLinkCount: 0,
  invalidOrSearchLinkCount: 88,
  recallFirstClaimCount: 0,
  dtcLinkedCommerceIssueCount: 18,
  clickedCommerceIssueCount: 3,
  correctedIssueCount: 0,
  totalRecordedClicks: 3,
  deepLinkedClicks: 0,
  nonProductClicks: 3,
};

function validateSnapshot(snapshot, actualSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const { snapshotHash, ...body } = snapshot;
  if (actualSha256 !== EXPECTED_SHA256) errors.push('snapshot file SHA-256 mismatch');
  if (
    snapshotHash !== EXPECTED_SNAPSHOT_HASH ||
    snapshotHashValue(body) !== EXPECTED_SNAPSHOT_HASH
  ) {
    errors.push('snapshotHash mismatch');
  }
  if (
    snapshot.schemaVersion !== 2 ||
    snapshot.auditScope !== 'full-record' ||
    snapshot.snapshotKind !== 'known-issues-catalog-deeplinks'
  ) {
    errors.push('snapshot schema/scope mismatch');
  }
  if (!Array.isArray(snapshot.records) || snapshot.records.length !== 73) {
    errors.push('snapshot must contain 73 records');
  }
  if (JSON.stringify(snapshot.inventory) !== JSON.stringify(EXPECTED_INVENTORY)) {
    errors.push('snapshot inventory mismatch');
  }

  const ids = (snapshot.records || []).map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate snapshot IDs');
  const models = {};
  for (const row of snapshot.records || []) {
    models[row.model] = (models[row.model] || 0) + 1;
    if (row.make !== 'Infiniti') errors.push(`${row.id}: make drift`);
    if (row.status !== 'published') errors.push(`${row.id}: non-published status`);
    if (/^Archived\s*-/i.test(row.title)) errors.push(`${row.id}: archived title prohibited`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) errors.push(`${row.id}: missing ${field}`);
    }
  }
  if (JSON.stringify(stableValue(models)) !== JSON.stringify(stableValue(EXPECTED_MODELS))) {
    errors.push('model inventory mismatch');
  }
  return errors;
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validateSnapshot(snapshot);
  console.log(
    JSON.stringify(
      {
        passed: errors.length === 0,
        snapshotFile: SNAPSHOT,
        snapshotSha256: normalizedFileHash(SNAPSHOT),
        snapshotHash: snapshot.snapshotHash,
        recordCount: snapshot.records?.length || 0,
        modelCount: Object.keys(EXPECTED_MODELS).length,
        errors,
      },
      null,
      2,
    ),
  );
  if (errors.length) process.exitCode = 1;
}

module.exports = {
  EXPECTED_INVENTORY,
  EXPECTED_MODELS,
  EXPECTED_SHA256,
  EXPECTED_SNAPSHOT_HASH,
  SNAPSHOT,
  validateSnapshot,
};
