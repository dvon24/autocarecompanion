/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, normalizedFileHash, stableValue } = require('./hyundai-adjudication-utils');
const { hashValue: snapshotHashValue } = require('./apply-known-issue-catalog-deeplinks');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const EXPECTED_SHA256 = 'f3e74267205477804060c49c988221cdc4dfcfc4586df369601c8c64736cce60';
const EXPECTED_SNAPSHOT_HASH = '444457abb31ca6a5ead423878b37ca790d44a87c74ffa43259362cb4218ba632';
const EXPECTED_MODELS = {
  Accent: 7, Azera: 5, Casper: 6, Creta: 6, Elantra: 29, Entourage: 4, Equus: 4, Excel: 4,
  Genesis: 4, 'Genesis Coupe': 4, Grandeur: 6, HB20: 6, i20: 5, Ioniq: 4, 'Ioniq 5': 14,
  'Ioniq 5 N': 4, 'Ioniq 6': 9, Kona: 13, Nexo: 4, Palisade: 9, 'Santa Cruz': 10,
  'Santa Fe': 14, Scoupe: 5, Sonata: 21, Tiburon: 5, Tucson: 13, Veloster: 9, Venue: 9,
  Veracruz: 5, XG350: 4,
};
const EXPECTED_INVENTORY = {
  publishedIssueCount: 242, commerceIssueCount: 130, claimCount: 252, fixPartClaimCount: 0,
  communityClaimCount: 252, noLinkClaimCount: 0, linkCount: 252, validProductLinkCount: 0,
  invalidOrSearchLinkCount: 252, recallFirstClaimCount: 0, dtcLinkedCommerceIssueCount: 49,
  clickedCommerceIssueCount: 6, correctedIssueCount: 0, totalRecordedClicks: 6,
  deepLinkedClicks: 0, nonProductClicks: 6,
};

function validateSnapshot(snapshot, actualSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const { snapshotHash, ...body } = snapshot;
  if (actualSha256 !== EXPECTED_SHA256) errors.push('snapshot file SHA-256 mismatch');
  if (snapshotHash !== EXPECTED_SNAPSHOT_HASH || snapshotHashValue(body) !== EXPECTED_SNAPSHOT_HASH) errors.push('snapshotHash mismatch');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record' || snapshot.snapshotKind !== 'known-issues-catalog-deeplinks') errors.push('snapshot schema/scope mismatch');
  if (!Array.isArray(snapshot.records) || snapshot.records.length !== 242) errors.push('snapshot must contain 242 records');
  if (JSON.stringify(snapshot.inventory) !== JSON.stringify(EXPECTED_INVENTORY)) errors.push('snapshot inventory mismatch');
  const ids = (snapshot.records || []).map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate snapshot IDs');
  const models = {};
  for (const row of snapshot.records || []) {
    models[row.model] = (models[row.model] || 0) + 1;
    if (row.make !== 'Hyundai') errors.push(`${row.id}: make drift`);
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
