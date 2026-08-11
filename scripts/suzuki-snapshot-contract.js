/* eslint-disable @typescript-eslint/no-require-imports */
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { isSuzukiMake } = require('./suzuki-audit-normalization');

const EXPECTED_NORMALIZED_SHA256 = 'bf3d05b6fba83b9d16d0c0369e56942f23e02e7974a91ad94460e219056006e8';
const EXPECTED_INTERNAL_HASH = 'cc54b20b3e8f3dbf7f9af2471198056002b130a30fbfa916630fa5cc70095d20';
const EXPECTED_MODEL_COUNTS = Object.freeze({ Across: 1, Alto: 1, 'Grand Vitara': 7, Jimny: 3, Swift: 3, SX4: 1, Vitara: 2 });
const EXPECTED_ROWS = 18;
const EXPECTED_GLOBAL_PUBLISHED = 7642;

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function assertSuzukiSnapshot(snapshot, absoluteSnapshotFile) {
  if (normalizedFileHash(absoluteSnapshotFile) !== EXPECTED_NORMALIZED_SHA256) throw new Error('Suzuki snapshot file hash drifted');
  if (snapshot.snapshotHash !== EXPECTED_INTERNAL_HASH) throw new Error('Suzuki snapshot internal hash drifted');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record') throw new Error('Suzuki snapshot is not a schema-v2 full-record freeze');
  if (!Array.isArray(snapshot.records)) throw new Error('Suzuki snapshot records are missing');

  const rows = snapshot.records.filter((row) => isSuzukiMake(row.make));
  if (rows.length !== EXPECTED_ROWS) throw new Error(`Suzuki Unicode-normalized row count ${rows.length}; expected ${EXPECTED_ROWS}`);
  const makeValues = [...new Set(rows.map((row) => row.make))].sort();
  if (!equal(makeValues, ['Suzuki'])) throw new Error(`Suzuki snapshot make variants drifted: ${JSON.stringify(makeValues)}`);

  const counts = {};
  const ids = new Set();
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`Suzuki snapshot duplicate id ${row.id}`);
    ids.add(row.id);
    counts[row.model] = (counts[row.model] || 0) + 1;
    for (const field of FULL_RECORD_FIELDS) {
      const expectedHash = row.before?.[`${field}Hash`];
      if (expectedHash !== hashValue(row[field])) throw new Error(`${row.id}: frozen ${field} hash drifted`);
    }
  }
  if (!equal(counts, EXPECTED_MODEL_COUNTS)) throw new Error(`Suzuki model counts drifted: ${JSON.stringify(counts)}`);
  if (snapshot.inventory?.publishedIssueCount !== EXPECTED_ROWS) throw new Error('Suzuki snapshot published inventory drifted');
  if (snapshot.captureProvenance?.filter?.makeInsensitive !== 'Suzuki' || snapshot.captureProvenance?.filter?.status !== 'published' || snapshot.captureProvenance?.environment?.secretValuesRecorded !== false || !/READ ONLY/.test(snapshot.captureProvenance?.transaction || '')) throw new Error('Suzuki snapshot capture provenance drifted');
  const independent = snapshot.independentInventory;
  const expectedVariants = [{ make: 'Suzuki', normalized: 'suzuki', codePoints: ['U+0053', 'U+0075', 'U+007A', 'U+0075', 'U+006B', 'U+0069'], count: 18 }];
  if (independent?.globalPublishedCount !== EXPECTED_GLOBAL_PUBLISHED || independent?.normalizedSuzukiRows !== EXPECTED_ROWS || independent?.normalizedMakeIdentity !== 'suzuki' || !equal(independent?.modelCounts, EXPECTED_MODEL_COUNTS) || !equal(independent?.rawMakeVariants, expectedVariants) || independent?.environment?.secretValuesRecorded !== false) throw new Error('Suzuki independent inventory provenance drifted');
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = { EXPECTED_GLOBAL_PUBLISHED, EXPECTED_INTERNAL_HASH, EXPECTED_MODEL_COUNTS, EXPECTED_NORMALIZED_SHA256, EXPECTED_ROWS, assertSuzukiSnapshot };
