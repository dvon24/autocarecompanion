/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
function snapshotHashValue(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const EXPECTED_SHA256 = 'f0aa4c5c8ca72321ed9a0b54aa9455e84056b445cb31049545ea07a48748c76b';
const EXPECTED_SNAPSHOT_HASH = 'f8b4d0e206ea16a5a28546ef1db29b0c885b1a839069b486f07fb1a1759310bf';
const EXPECTED_MODELS = {
  Amanti: 5, Borrego: 4, Cadenza: 3, Carnival: 26, EV6: 21, EV9: 4, Forte: 10,
  K5: 24, K900: 5, Morning: 6, Niro: 10, Optima: 13, Ray: 6, Rio: 14, Sedona: 5,
  Seltos: 9, Sephia: 4, Sorento: 21, Soul: 8, Spectra: 5, Sportage: 20, Stinger: 10,
  Telluride: 14,
};
const EXPECTED_INVENTORY = {
  publishedIssueCount: 247, commerceIssueCount: 152, claimCount: 330, fixPartClaimCount: 57,
  communityClaimCount: 273, noLinkClaimCount: 0, linkCount: 444, validProductLinkCount: 0,
  invalidOrSearchLinkCount: 444, recallFirstClaimCount: 0, dtcLinkedCommerceIssueCount: 58,
  clickedCommerceIssueCount: 4, correctedIssueCount: 0, totalRecordedClicks: 6,
  deepLinkedClicks: 0, nonProductClicks: 6,
};

function validateSnapshot(snapshot, actualSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const { snapshotHash, ...body } = snapshot;
  if (actualSha256 !== EXPECTED_SHA256) errors.push('snapshot file SHA-256 mismatch');
  if (snapshotHash !== EXPECTED_SNAPSHOT_HASH || snapshotHashValue(body) !== EXPECTED_SNAPSHOT_HASH) errors.push('snapshotHash mismatch');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record' || snapshot.snapshotKind !== 'known-issues-catalog-deeplinks') errors.push('snapshot schema/scope mismatch');
  if (!Array.isArray(snapshot.records) || snapshot.records.length !== 247) errors.push('snapshot must contain 247 records');
  if (JSON.stringify(snapshot.inventory) !== JSON.stringify(EXPECTED_INVENTORY)) errors.push('snapshot inventory mismatch');
  const ids = (snapshot.records || []).map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate snapshot IDs');
  const models = {};
  for (const row of snapshot.records || []) {
    models[row.model] = (models[row.model] || 0) + 1;
    if (row.make !== 'Kia') errors.push(`${row.id}: make drift`);
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
