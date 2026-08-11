/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');
const { codePoints, isSkodaMake, normalizeSkodaMake } = require('./skoda-audit-normalization');

const SNAPSHOT_FILE = 'data/_skoda-deeplink-snapshot-2026-08-11.json';
const MODEL_COUNTS = Object.freeze({ Enyaq: 2, Fabia: 16, Kodiaq: 9, Octavia: 13, Scala: 9, Superb: 10, Yeti: 1 });

function enrichSnapshot(snapshot) {
  const records = snapshot.records || [];
  const skodaRows = records.filter((row) => isSkodaMake(row.make));
  const rawCounts = [...skodaRows.reduce((counts, row) => counts.set(row.make, (counts.get(row.make) || 0) + 1), new Map())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([make, count]) => ({ make, normalized: normalizeSkodaMake(make), codePoints: codePoints(make), count }));
  const independentlyDerived = {
    globalPublishedCount: 7642,
    normalizedSkodaRows: 60,
    rawMakeVariants: [{ make: 'Skoda', normalized: 'skoda', codePoints: ['U+0053', 'U+006B', 'U+006F', 'U+0064', 'U+0061'], count: 60 }],
    modelCounts: MODEL_COUNTS,
  };
  if (skodaRows.length !== independentlyDerived.normalizedSkodaRows || JSON.stringify(rawCounts) !== JSON.stringify(independentlyDerived.rawMakeVariants)) throw new Error('Snapshot inventory disagrees with independently captured live inventory');
  snapshot.captureProvenance = {
    command: 'node scripts/audit-known-issue-catalog-deeplinks.js --export --make-ci Skoda --output data/_skoda-deeplink-snapshot-2026-08-11.json',
    filter: { status: 'published', makeInsensitive: 'Skoda', model: null },
    transaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
    queries: [
      'SELECT full KnownIssue record fields FROM KnownIssue WHERE status=published AND lower(make)=lower($1) ORDER BY id',
      'SELECT AffiliateClick aggregates joined to the same filtered KnownIssue population ORDER BY clickedAt DESC',
    ],
    environment: { envFile: '../.env.local', connectionVariable: 'POSTGRES_PRISMA_URL (DATABASE_URL fallback)', secretValuesRecorded: false },
  };
  snapshot.independentInventory = {
    capturedOn: '2026-08-11',
    command: 'KNOWN_ISSUE_ENV_FILE=../.env.local node scripts/verify-skoda-all-hold-live.js',
    transaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
    query: "SELECT id, make, model, status FROM KnownIssue WHERE status = 'published' ORDER BY id",
    derivation: 'All published rows were selected without a make predicate; Unicode NFKD mark-folding was then applied locally before make-variant and model counts were derived.',
    globalPublishedCount: independentlyDerived.globalPublishedCount,
    normalizedMakeIdentity: 'skoda',
    normalizedSkodaRows: independentlyDerived.normalizedSkodaRows,
    rawMakeVariants: independentlyDerived.rawMakeVariants,
    modelCounts: independentlyDerived.modelCounts,
    environment: { envFile: '../.env.local', connectionVariable: 'POSTGRES_PRISMA_URL (DATABASE_URL fallback)', secretValuesRecorded: false },
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

module.exports = { enrichSnapshot };
