/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, normalizedFileHash, stableValue } = require('./international-adjudication-utils');

function snapshotHashValue(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_international-deeplink-snapshot-2026-08-06.json');
const EXPECTED_SHA256 = '3cf4239b35178de3b284d642c9c7cfc2525a15c69b92099ccfa2f1bd7954c09c';
const EXPECTED_SNAPSHOT_HASH = 'd904f7bdd3878f91ad00c6afcdce777ce018c38a21d9518ba5824dfcf4c86754';
const EXPECTED_MODELS = { Scout: 7 };
const EXPECTED_INVENTORY = {
  publishedIssueCount: 7,
  commerceIssueCount: 0,
  claimCount: 0,
  fixPartClaimCount: 0,
  communityClaimCount: 0,
  noLinkClaimCount: 0,
  linkCount: 0,
  validProductLinkCount: 0,
  invalidOrSearchLinkCount: 0,
  recallFirstClaimCount: 0,
  dtcLinkedCommerceIssueCount: 0,
  clickedCommerceIssueCount: 0,
  correctedIssueCount: 0,
  totalRecordedClicks: 0,
  deepLinkedClicks: 0,
  nonProductClicks: 0,
};

function validateSnapshot(snapshot, actualSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const { snapshotHash, ...body } = snapshot;
  if (actualSha256 !== EXPECTED_SHA256) errors.push('snapshot file SHA-256 mismatch');
  if (snapshotHash !== EXPECTED_SNAPSHOT_HASH || snapshotHashValue(body) !== EXPECTED_SNAPSHOT_HASH) errors.push('snapshotHash mismatch');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record' || snapshot.snapshotKind !== 'known-issues-catalog-deeplinks') errors.push('snapshot schema/scope mismatch');
  if (!Array.isArray(snapshot.records) || snapshot.records.length !== 7) errors.push('snapshot must contain 7 records');
  if (JSON.stringify(snapshot.inventory) !== JSON.stringify(EXPECTED_INVENTORY)) errors.push('snapshot inventory mismatch');

  const ids = (snapshot.records || []).map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate snapshot IDs');
  const models = {};
  for (const row of snapshot.records || []) {
    models[row.model] = (models[row.model] || 0) + 1;
    if (row.make !== 'International') errors.push(`${row.id}: make drift`);
    if (row.status !== 'published') errors.push(`${row.id}: non-published status`);
    if (/^Archived\s*-/i.test(row.title)) errors.push(`${row.id}: archived title prohibited`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row, field)) errors.push(`${row.id}: missing ${field}`);
  }
  if (JSON.stringify(stableValue(models)) !== JSON.stringify(stableValue(EXPECTED_MODELS))) errors.push('model inventory mismatch');
  return errors;
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validateSnapshot(snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, snapshotFile: SNAPSHOT, snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotHash: snapshot.snapshotHash, recordCount: snapshot.records?.length || 0, modelCount: Object.keys(EXPECTED_MODELS).length, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { EXPECTED_INVENTORY, EXPECTED_MODELS, EXPECTED_SHA256, EXPECTED_SNAPSHOT_HASH, SNAPSHOT, validateSnapshot };
