/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, normalizedFileHash, stableValue } = require('./jeep-adjudication-utils');
function snapshotHashValue(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const EXPECTED_SHA256 = '9c1c7bc57bcd77ecad0312c729118f60d1219fd9cb0b0ffb473e744cc700f293';
const EXPECTED_SNAPSHOT_HASH = '4a719fd5a8931fb2820c523468a51be00e37fbc36470457ab5984fb21186f458';
const EXPECTED_MODELS = { Avenger: 5, Cherokee: 18, 'CJ-7': 6, Comanche: 3, Commander: 4, Compass: 9, Gladiator: 9, 'Grand Cherokee': 77, 'Grand Cherokee L': 3, 'Grand Wagoneer': 24, Liberty: 5, Patriot: 5, Renegade: 9, Wagoneer: 4, Wrangler: 66 };
const EXPECTED_INVENTORY = {
  publishedIssueCount: 247, commerceIssueCount: 207, claimCount: 611, fixPartClaimCount: 423,
  communityClaimCount: 188, noLinkClaimCount: 294, linkCount: 317, validProductLinkCount: 24,
  invalidOrSearchLinkCount: 293, recallFirstClaimCount: 0, dtcLinkedCommerceIssueCount: 94,
  clickedCommerceIssueCount: 2, correctedIssueCount: 28, totalRecordedClicks: 8,
  deepLinkedClicks: 0, nonProductClicks: 8,
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
    if (row.make !== 'Jeep') errors.push(`${row.id}: make drift`);
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
