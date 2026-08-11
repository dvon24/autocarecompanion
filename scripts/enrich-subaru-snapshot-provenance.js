/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');
const { isSubaruMake } = require('./subaru-audit-normalization');

const SNAPSHOT_FILE = 'data/_subaru-deeplink-snapshot-2026-08-11.json';
const INVENTORY_FILE = 'data/_subaru-status-inventory-2026-08-11.json';
const EXPECTED_INVENTORY_SHA256 = 'b0c916c45a307bf5df0632af5fc78a9917ec659efae04bbcb3e39dcf992385f2';
const PUBLISHED_MODELS = Object.freeze({ Ascent: 11, Baja: 4, BRZ: 10, Crosstrek: 14, Forester: 33, Impreza: 12, Legacy: 15, Loyale: 2, Outback: 41, Solterra: 22, SVX: 2, Tribeca: 4, WRX: 19, 'WRX STI': 16 });
const ARCHIVED_MODELS = Object.freeze({ Ascent: 1, Crosstrek: 1, Forester: 2, Impreza: 2, Loyale: 3, SVX: 3 });
const ALL_STATUS_MODELS = Object.freeze({ Ascent: 12, Baja: 4, BRZ: 10, Crosstrek: 15, Forester: 35, Impreza: 14, Legacy: 15, Loyale: 5, Outback: 41, Solterra: 22, SVX: 5, Tribeca: 4, WRX: 19, 'WRX STI': 16 });

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(left) === JSON.stringify(right); }

function enrichSnapshot(snapshot, inventory) {
  const publishedRows = snapshot.records || [];
  const inventoryRows = inventory.rows || [];
  const publishedInventory = inventoryRows.filter((row) => row.status === 'published');
  const archivedInventory = inventoryRows.filter((row) => row.status === 'archived');
  const snapshotIds = publishedRows.map((row) => row.id).sort();
  const publishedIds = publishedInventory.map((row) => row.id).sort();
  const archivedIds = archivedInventory.map((row) => row.id).sort();
  if (publishedRows.length !== 205 || publishedRows.some((row) => !isSubaruMake(row.make) || row.status !== 'published')) throw new Error('Raw Subaru snapshot is not the exact published-only inventory');
  if (inventory.globalPublishedCount !== 7642 || inventory.normalizedSubaruRows !== 217 || !equal(inventory.statusCounts, { archived: 12, published: 205 })) throw new Error('Independent Subaru status totals drifted');
  if (!equal(inventory.modelCounts?.published, PUBLISHED_MODELS) || !equal(inventory.modelCounts?.archived, ARCHIVED_MODELS) || !equal(inventory.modelCounts?.allStatuses, ALL_STATUS_MODELS)) throw new Error('Independent Subaru model totals drifted');
  if (!equal(snapshotIds, publishedIds) || archivedIds.some((id) => snapshotIds.includes(id))) throw new Error('Published snapshot and independent status inventory disagree');

  snapshot.captureProvenance = {
    command: 'node scripts/audit-known-issue-catalog-deeplinks.js --export --make-ci Subaru --output data/_subaru-deeplink-snapshot-2026-08-11.json',
    filter: { status: 'published', makeInsensitive: 'Subaru', model: null },
    transaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
    queries: [
      'SELECT full KnownIssue record fields FROM KnownIssue WHERE status=published AND lower(make)=lower($1) ORDER BY id',
      'SELECT AffiliateClick aggregates joined to the same filtered KnownIssue population ORDER BY clickedAt DESC',
    ],
    environment: { envFile: 'C:/Users/devon/autocarecompanion/.env.local', connectionVariable: 'POSTGRES_PRISMA_URL (DATABASE_URL fallback)', secretValuesRecorded: false },
  };
  snapshot.independentInventory = {
    capturedOn: inventory.capturedOn,
    file: INVENTORY_FILE,
    normalizedSha256: EXPECTED_INVENTORY_SHA256,
    command: 'node scripts/capture-subaru-inventory.js',
    transaction: inventory.captureProvenance.transaction,
    query: inventory.captureProvenance.query,
    derivation: inventory.captureProvenance.derivation,
    globalPublishedCount: inventory.globalPublishedCount,
    normalizedMakeIdentity: 'subaru',
    normalizedSubaruRows: inventory.normalizedSubaruRows,
    statusCounts: inventory.statusCounts,
    rawMakeVariants: inventory.rawMakeVariants,
    modelCounts: inventory.modelCounts,
    publishedIdsSha256: hashValue(publishedIds),
    archivedIds,
    environment: inventory.captureProvenance.environment,
  };
  delete snapshot.snapshotHash;
  snapshot.snapshotHash = hashValue(snapshot);
  return snapshot;
}

if (require.main === module) {
  const snapshotAbsolute = resolveRepo(SNAPSHOT_FILE);
  const inventoryAbsolute = resolveRepo(INVENTORY_FILE);
  if (normalizedFileHash(inventoryAbsolute) !== EXPECTED_INVENTORY_SHA256) throw new Error('Subaru status inventory hash drifted');
  const snapshot = enrichSnapshot(JSON.parse(fs.readFileSync(snapshotAbsolute, 'utf8')), JSON.parse(fs.readFileSync(inventoryAbsolute, 'utf8')));
  fs.writeFileSync(snapshotAbsolute, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ file: SNAPSHOT_FILE, snapshotHash: snapshot.snapshotHash, normalizedSha256: normalizedFileHash(snapshotAbsolute), publishedRows: snapshot.records.length, archivedRows: snapshot.independentInventory.archivedIds.length }, null, 2));
}

module.exports = { ALL_STATUS_MODELS, ARCHIVED_MODELS, EXPECTED_INVENTORY_SHA256, PUBLISHED_MODELS, enrichSnapshot };
