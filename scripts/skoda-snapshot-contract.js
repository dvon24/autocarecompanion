/* eslint-disable @typescript-eslint/no-require-imports */
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { isSkodaMake } = require('./skoda-audit-normalization');

const EXPECTED_NORMALIZED_SHA256 = 'b136f63176ae452b5a5a99d7399ca8d1297a49f0ec6065beff91b5933816be16';
const EXPECTED_INTERNAL_HASH = '629d0a3ad1d9736189b6f5889b39fff61c20b4d552b15ccdba27c1acb1d83bb7';
const EXPECTED_MODEL_COUNTS = Object.freeze({ Enyaq: 2, Fabia: 16, Kodiaq: 9, Octavia: 13, Scala: 9, Superb: 10, Yeti: 1 });
const EXPECTED_ROWS = 60;

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function assertSkodaSnapshot(snapshot, absoluteSnapshotFile) {
  if (normalizedFileHash(absoluteSnapshotFile) !== EXPECTED_NORMALIZED_SHA256) throw new Error('Skoda snapshot file hash drifted');
  if (snapshot.snapshotHash !== EXPECTED_INTERNAL_HASH) throw new Error('Skoda snapshot internal hash drifted');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record') throw new Error('Skoda snapshot is not a schema-v2 full-record freeze');
  if (!Array.isArray(snapshot.records)) throw new Error('Skoda snapshot records are missing');

  const caseInsensitiveRows = snapshot.records.filter((row) => isSkodaMake(row.make));
  if (caseInsensitiveRows.length !== EXPECTED_ROWS) throw new Error(`Skoda Unicode-normalized row count ${caseInsensitiveRows.length}; expected ${EXPECTED_ROWS}`);
  const makeValues = [...new Set(caseInsensitiveRows.map((row) => row.make))].sort();
  if (!equal(makeValues, ['Skoda'])) throw new Error(`Skoda snapshot make variants drifted: ${JSON.stringify(makeValues)}`);

  const counts = {};
  const ids = new Set();
  for (const row of caseInsensitiveRows) {
    if (ids.has(row.id)) throw new Error(`Skoda snapshot duplicate id ${row.id}`);
    ids.add(row.id);
    counts[row.model] = (counts[row.model] || 0) + 1;
    for (const field of FULL_RECORD_FIELDS) {
      const expectedHash = row.before?.[`${field}Hash`];
      if (expectedHash !== hashValue(row[field])) throw new Error(`${row.id}: frozen ${field} hash drifted`);
    }
  }
  if (!equal(counts, EXPECTED_MODEL_COUNTS)) throw new Error(`Skoda model counts drifted: ${JSON.stringify(counts)}`);
  if (snapshot.inventory?.publishedIssueCount !== EXPECTED_ROWS) throw new Error('Skoda snapshot published inventory drifted');
  if (snapshot.captureProvenance?.filter?.makeInsensitive !== 'Skoda' || snapshot.captureProvenance?.filter?.status !== 'published' || snapshot.captureProvenance?.environment?.secretValuesRecorded !== false || !/READ ONLY/.test(snapshot.captureProvenance?.transaction || '')) throw new Error('Skoda snapshot capture provenance drifted');
  const independent = snapshot.independentInventory;
  if (independent?.globalPublishedCount !== 7642 || independent?.normalizedSkodaRows !== EXPECTED_ROWS || independent?.normalizedMakeIdentity !== 'skoda' || !equal(independent?.modelCounts, EXPECTED_MODEL_COUNTS) || !equal(independent?.rawMakeVariants, [{ make: 'Skoda', normalized: 'skoda', codePoints: ['U+0053', 'U+006B', 'U+006F', 'U+0064', 'U+0061'], count: 60 }]) || independent?.environment?.secretValuesRecorded !== false) throw new Error('Skoda independent inventory provenance drifted');
  return caseInsensitiveRows.sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = {
  EXPECTED_INTERNAL_HASH,
  EXPECTED_MODEL_COUNTS,
  EXPECTED_NORMALIZED_SHA256,
  EXPECTED_ROWS,
  assertSkodaSnapshot,
};
