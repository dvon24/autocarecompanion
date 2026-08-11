/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { isTeslaMake } = require('./tesla-audit-normalization');

const EXPECTED_NORMALIZED_SHA256 = '211fa11b1bbe86920ca655934eca2a011ee193c881ecfff124427577311cfb81';
const EXPECTED_INTERNAL_HASH = '1629ca074d3017eac0158fb8c47e69085161ecca2658ca93f6d443745de8584d';
const PROVENANCE_FILE = 'data/known-issue-tesla-snapshot-provenance-2026-08-11.json';
const EXPECTED_PROVENANCE_SHA256 = '2c81e37665d1a482063092ad7541261afbd44d2dc6af361db636c35021df03d4';
const EXPECTED_MODEL_COUNTS = Object.freeze({ Cybertruck: 1, 'Model 3': 15, 'Model S': 16, 'Model X': 12, 'Model Y': 15, Semi: 5 });
const EXPECTED_ROWS = 64;
const EXPECTED_GLOBAL_PUBLISHED = 7642;
const EXPECTED_INVENTORY = Object.freeze({
  publishedIssueCount: 64,
  commerceIssueCount: 30,
  claimCount: 82,
  fixPartClaimCount: 82,
  communityClaimCount: 0,
  noLinkClaimCount: 8,
  linkCount: 74,
  validProductLinkCount: 0,
  invalidOrSearchLinkCount: 74,
  recallFirstClaimCount: 0,
  dtcLinkedCommerceIssueCount: 3,
  clickedCommerceIssueCount: 0,
  correctedIssueCount: 0,
  totalRecordedClicks: 0,
  deepLinkedClicks: 0,
  nonProductClicks: 0,
});

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function assertTeslaProvenance(provenanceOverride) {
  const absolute = resolveRepo(PROVENANCE_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_PROVENANCE_SHA256) throw new Error('Tesla snapshot provenance file hash drifted');
  const provenance = provenanceOverride || JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (provenance.schemaVersion !== 1 || provenance.status !== 'read-only-provenance' || provenance.snapshotFile !== 'data/_tesla-deeplink-snapshot-2026-08-11.json') throw new Error('Tesla snapshot provenance header drifted');
  if (provenance.snapshotNormalizedSha256 !== EXPECTED_NORMALIZED_SHA256 || provenance.snapshotHash !== EXPECTED_INTERNAL_HASH || provenance.snapshotGeneratedAt !== '2026-08-11T20:06:18.070Z') throw new Error('Tesla snapshot provenance identity drifted');
  if (provenance.capture?.filter?.makeInsensitive !== 'Tesla' || provenance.capture?.filter?.status !== 'published' || provenance.capture?.environment?.secretValuesRecorded !== false || !/READ ONLY/.test(provenance.capture?.transaction || '')) throw new Error('Tesla capture provenance drifted');
  const independent = provenance.independentInventory;
  const expectedVariants = [{ make: 'Tesla', normalized: 'tesla', codePoints: ['U+0054', 'U+0065', 'U+0073', 'U+006C', 'U+0061'], count: 64 }];
  if (independent?.globalPublishedCount !== EXPECTED_GLOBAL_PUBLISHED || independent?.normalizedTeslaRows !== EXPECTED_ROWS || independent?.normalizedMakeIdentity !== 'tesla' || !equal(independent?.modelCounts, EXPECTED_MODEL_COUNTS) || !equal(independent?.rawMakeVariants, expectedVariants) || independent?.environment?.secretValuesRecorded !== false || !/READ ONLY/.test(independent?.transaction || '')) throw new Error('Tesla independent inventory provenance drifted');
  return provenance;
}

function assertTeslaSnapshot(snapshot, absoluteSnapshotFile) {
  if (normalizedFileHash(absoluteSnapshotFile) !== EXPECTED_NORMALIZED_SHA256) throw new Error('Tesla snapshot file hash drifted');
  if (snapshot.snapshotHash !== EXPECTED_INTERNAL_HASH) throw new Error('Tesla snapshot internal hash drifted');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record' || snapshot.snapshotKind !== 'known-issues-catalog-deeplinks') throw new Error('Tesla snapshot is not a schema-v2 full-record freeze');
  if (!Array.isArray(snapshot.records)) throw new Error('Tesla snapshot records are missing');
  if (snapshot.records.length !== EXPECTED_ROWS) throw new Error(`Tesla snapshot row count ${snapshot.records.length}; expected ${EXPECTED_ROWS}`);
  if (!equal(snapshot.inventory, EXPECTED_INVENTORY)) throw new Error('Tesla snapshot commerce/inventory totals drifted');
  assertTeslaProvenance();

  const normalizedRows = snapshot.records.filter((row) => isTeslaMake(row.make));
  if (normalizedRows.length !== EXPECTED_ROWS) throw new Error(`Tesla Unicode-normalized row count ${normalizedRows.length}; expected ${EXPECTED_ROWS}`);
  const makeValues = [...new Set(normalizedRows.map((row) => row.make))].sort();
  if (!equal(makeValues, ['Tesla'])) throw new Error(`Tesla snapshot make variants drifted: ${JSON.stringify(makeValues)}`);

  const counts = {};
  const ids = new Set();
  for (const row of normalizedRows) {
    if (!row.id || ids.has(row.id)) throw new Error(`Tesla snapshot duplicate or missing id ${row.id}`);
    ids.add(row.id);
    counts[row.model] = (counts[row.model] || 0) + 1;
    for (const field of FULL_RECORD_FIELDS) {
      const expectedHash = row.before?.[`${field}Hash`];
      if (expectedHash !== hashValue(row[field])) throw new Error(`${row.id}: frozen ${field} hash drifted`);
    }
  }
  if (!equal(counts, EXPECTED_MODEL_COUNTS)) throw new Error(`Tesla model counts drifted: ${JSON.stringify(counts)}`);
  return normalizedRows.sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = {
  EXPECTED_GLOBAL_PUBLISHED,
  EXPECTED_INTERNAL_HASH,
  EXPECTED_MODEL_COUNTS,
  EXPECTED_NORMALIZED_SHA256,
  EXPECTED_PROVENANCE_SHA256,
  EXPECTED_ROWS,
  PROVENANCE_FILE,
  assertTeslaProvenance,
  assertTeslaSnapshot,
};
