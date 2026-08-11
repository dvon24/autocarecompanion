/* eslint-disable @typescript-eslint/no-require-imports */
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');

const EXPECTED_NORMALIZED_SHA256 = '59ed7d40db9945b9b24afc43eb74bd141eebab842d47967b1debeebcbd2432cc';
const EXPECTED_INTERNAL_HASH = '32756359c1bbc514c15f193fd6ed6429269271abb5de529ba28a2c6d69e590bb';
const EXPECTED_MODEL_COUNTS = Object.freeze({ Alhambra: 1, Arona: 8, Ateca: 1, Ibiza: 11, Leon: 14, Mii: 1 });
const EXPECTED_ROWS = 36;

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function assertSeatSnapshot(snapshot, absoluteSnapshotFile) {
  if (normalizedFileHash(absoluteSnapshotFile) !== EXPECTED_NORMALIZED_SHA256) throw new Error('SEAT snapshot file hash drifted');
  if (snapshot.snapshotHash !== EXPECTED_INTERNAL_HASH) throw new Error('SEAT snapshot internal hash drifted');
  if (!Array.isArray(snapshot.records)) throw new Error('SEAT snapshot records are missing');

  const caseInsensitiveRows = snapshot.records.filter((row) => String(row.make || '').trim().toUpperCase() === 'SEAT');
  if (caseInsensitiveRows.length !== EXPECTED_ROWS) throw new Error(`SEAT case-insensitive row count ${caseInsensitiveRows.length}; expected ${EXPECTED_ROWS}`);
  const noncanonical = caseInsensitiveRows.filter((row) => row.make !== 'SEAT');
  if (noncanonical.length) throw new Error(`SEAT snapshot contains ${noncanonical.length} noncanonical make values`);

  const counts = {};
  const ids = new Set();
  for (const row of caseInsensitiveRows) {
    if (ids.has(row.id)) throw new Error(`SEAT snapshot duplicate id ${row.id}`);
    ids.add(row.id);
    counts[row.model] = (counts[row.model] || 0) + 1;
    for (const field of FULL_RECORD_FIELDS) {
      const expectedHash = row.before?.[`${field}Hash`];
      if (expectedHash !== hashValue(row[field])) throw new Error(`${row.id}: frozen ${field} hash drifted`);
    }
  }
  if (!equal(counts, EXPECTED_MODEL_COUNTS)) throw new Error(`SEAT model counts drifted: ${JSON.stringify(counts)}`);
  return caseInsensitiveRows.sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = {
  EXPECTED_INTERNAL_HASH,
  EXPECTED_MODEL_COUNTS,
  EXPECTED_NORMALIZED_SHA256,
  EXPECTED_ROWS,
  assertSeatSnapshot,
};
