/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { codePoints, isSuzukiMake, normalizeSuzukiMake } = require('./suzuki-audit-normalization');

const SNAPSHOT_FILE = 'data/_suzuki-deeplink-snapshot-2026-08-11.json';
const MODEL_COUNTS = Object.freeze({ Across: 1, Alto: 1, 'Grand Vitara': 7, Jimny: 3, Swift: 3, SX4: 1, Vitara: 2 });
const RAW_VARIANTS = Object.freeze([{ make: 'Suzuki', normalized: 'suzuki', codePoints: ['U+0053', 'U+0075', 'U+007A', 'U+0075', 'U+006B', 'U+0069'], count: 18 }]);

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))); }

function enrichSnapshot(snapshot) {
  const rows = (snapshot.records || []).filter((row) => isSuzukiMake(row.make));
  const rawVariants = [...rows.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([make, count]) => ({ make, normalized: normalizeSuzukiMake(make), codePoints: codePoints(make), count }));
  const modelCounts = sortedObject(rows.reduce((counts, row) => ({ ...counts, [row.model]: (counts[row.model] || 0) + 1 }), {}));
  if (rows.length !== 18 || !equal(rawVariants, RAW_VARIANTS) || !equal(modelCounts, MODEL_COUNTS)) throw new Error('Suzuki snapshot inventory disagrees with independently captured live inventory');

  snapshot.captureProvenance = {
    command: 'node scripts/audit-known-issue-catalog-deeplinks.js --export --make-ci Suzuki --output data/_suzuki-deeplink-snapshot-2026-08-11.json',
    filter: { status: 'published', makeInsensitive: 'Suzuki', model: null },
    transaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
    queries: [
      'SELECT full KnownIssue record fields FROM KnownIssue WHERE status=published AND lower(make)=lower($1) ORDER BY id',
      'SELECT AffiliateClick aggregates joined to the same filtered KnownIssue population ORDER BY clickedAt DESC',
    ],
    environment: { envFile: 'C:/Users/devon/autocarecompanion/.env.local', connectionVariable: 'POSTGRES_PRISMA_URL (DATABASE_URL fallback)', secretValuesRecorded: false },
  };
  snapshot.independentInventory = {
    capturedOn: '2026-08-11',
    command: 'KNOWN_ISSUE_ENV_FILE=C:/Users/devon/autocarecompanion/.env.local node scripts/verify-suzuki-all-hold-live.js',
    transaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
    queries: [
      "SELECT id, make, model, status FROM KnownIssue WHERE status = 'published' ORDER BY id",
      "SELECT full KnownIssue record fields FROM KnownIssue WHERE status = 'published' AND lower(make) = lower($1) ORDER BY id",
    ],
    derivation: 'All published rows were selected without a make predicate for the global total; Unicode NFKD mark-folding was then applied locally before make-variant and model counts were derived. Full Suzuki rows were independently compared with the frozen snapshot.',
    globalPublishedCount: 7642,
    normalizedMakeIdentity: 'suzuki',
    normalizedSuzukiRows: 18,
    rawMakeVariants: RAW_VARIANTS,
    modelCounts: MODEL_COUNTS,
    environment: { envFile: 'C:/Users/devon/autocarecompanion/.env.local', connectionVariable: 'POSTGRES_PRISMA_URL (DATABASE_URL fallback)', secretValuesRecorded: false },
  };
  delete snapshot.snapshotHash;
  snapshot.snapshotHash = hashValue(snapshot);
  return snapshot;
}

if (require.main === module) {
  const absolute = path.resolve(__dirname, '..', SNAPSHOT_FILE);
  const snapshot = enrichSnapshot(JSON.parse(fs.readFileSync(absolute, 'utf8')));
  fs.writeFileSync(absolute, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ file: SNAPSHOT_FILE, snapshotHash: snapshot.snapshotHash, normalizedSha256: normalizedFileHash(absolute) }, null, 2));
}

module.exports = { MODEL_COUNTS, RAW_VARIANTS, enrichSnapshot };
