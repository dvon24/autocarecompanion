/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, normalizedFileHash, stableValue } = require('./jaguar-adjudication-utils');
function snapshotHashValue(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const EXPECTED_SHA256 = '4d918b0eb01d52012b12495f7133da32b7e89c244755f7f70c6ddb8d420af31d';
const EXPECTED_SNAPSHOT_HASH = 'dfbfbefec28505ea04c9429335c3d89a456c764b73279f7a9afe1052eba167d2';
const EXPECTED_MODELS = { 'E-PACE': 4, 'F-PACE': 6, 'F-TYPE': 4, 'I-PACE': 4, 'S-TYPE': 3, 'X-TYPE': 4, XE: 5, XF: 6, XJ: 5, XK: 22 };
const EXPECTED_INVENTORY = {
  publishedIssueCount: 63, commerceIssueCount: 18, claimCount: 42, fixPartClaimCount: 36,
  communityClaimCount: 6, noLinkClaimCount: 7, linkCount: 35, validProductLinkCount: 0,
  invalidOrSearchLinkCount: 35, recallFirstClaimCount: 0, dtcLinkedCommerceIssueCount: 7,
  clickedCommerceIssueCount: 0, correctedIssueCount: 0, totalRecordedClicks: 0,
  deepLinkedClicks: 0, nonProductClicks: 0,
};

function validateSnapshot(snapshot, actualSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const { snapshotHash, ...body } = snapshot;
  if (actualSha256 !== EXPECTED_SHA256) errors.push('snapshot file SHA-256 mismatch');
  if (snapshotHash !== EXPECTED_SNAPSHOT_HASH || snapshotHashValue(body) !== EXPECTED_SNAPSHOT_HASH) errors.push('snapshotHash mismatch');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record' || snapshot.snapshotKind !== 'known-issues-catalog-deeplinks') errors.push('snapshot schema/scope mismatch');
  if (!Array.isArray(snapshot.records) || snapshot.records.length !== 63) errors.push('snapshot must contain 63 records');
  if (JSON.stringify(snapshot.inventory) !== JSON.stringify(EXPECTED_INVENTORY)) errors.push('snapshot inventory mismatch');
  const ids = (snapshot.records || []).map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate snapshot IDs');
  const models = {};
  for (const row of snapshot.records || []) {
    models[row.model] = (models[row.model] || 0) + 1;
    if (row.make !== 'Jaguar') errors.push(`${row.id}: make drift`);
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
