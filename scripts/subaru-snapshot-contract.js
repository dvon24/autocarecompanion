/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { isSubaruMake } = require('./subaru-audit-normalization');
const { ALL_STATUS_MODELS, ARCHIVED_MODELS, EXPECTED_INVENTORY_SHA256, PUBLISHED_MODELS } = require('./enrich-subaru-snapshot-provenance');

const INVENTORY_FILE = 'data/_subaru-status-inventory-2026-08-11.json';
const EXPECTED_NORMALIZED_SHA256 = '09f65fc7910ad81f3c977dffd7c093f36ac4032499cff626c45f891a663c0a88';
const EXPECTED_INTERNAL_HASH = '32cf9fb0e216009da5a2e55588c59629fe180525dc53c81ef7faa8b566973d2d';
const EXPECTED_ROWS = 205;

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function assertSubaruSnapshot(snapshot, absoluteSnapshotFile) {
  if (normalizedFileHash(absoluteSnapshotFile) !== EXPECTED_NORMALIZED_SHA256) throw new Error('Subaru snapshot file hash drifted');
  if (snapshot.snapshotHash !== EXPECTED_INTERNAL_HASH) throw new Error('Subaru snapshot internal hash drifted');
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record') throw new Error('Subaru snapshot is not a schema-v2 full-record freeze');
  if (!Array.isArray(snapshot.records)) throw new Error('Subaru snapshot records are missing');
  const rows = snapshot.records.filter((row) => isSubaruMake(row.make));
  if (rows.length !== EXPECTED_ROWS || snapshot.records.length !== EXPECTED_ROWS) throw new Error(`Subaru published row count ${rows.length}; expected ${EXPECTED_ROWS}`);
  const makeValues = [...new Set(rows.map((row) => row.make))].sort();
  if (!equal(makeValues, ['Subaru'])) throw new Error(`Subaru snapshot make variants drifted: ${JSON.stringify(makeValues)}`);
  const counts = {};
  const ids = new Set();
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`Subaru snapshot duplicate id ${row.id}`);
    ids.add(row.id);
    if (row.status !== 'published') throw new Error(`${row.id}: non-published row leaked into the published snapshot`);
    counts[row.model] = (counts[row.model] || 0) + 1;
    for (const field of FULL_RECORD_FIELDS) if (row.before?.[`${field}Hash`] !== hashValue(row[field])) throw new Error(`${row.id}: frozen ${field} hash drifted`);
  }
  if (!equal(counts, PUBLISHED_MODELS) || snapshot.inventory?.publishedIssueCount !== EXPECTED_ROWS) throw new Error('Subaru published model inventory drifted');
  const independent = snapshot.independentInventory;
  if (independent?.normalizedSha256 !== EXPECTED_INVENTORY_SHA256 || normalizedFileHash(resolveRepo(INVENTORY_FILE)) !== EXPECTED_INVENTORY_SHA256) throw new Error('Subaru independent status inventory hash drifted');
  const inventory = JSON.parse(fs.readFileSync(resolveRepo(INVENTORY_FILE), 'utf8'));
  if (independent?.globalPublishedCount !== 7642 || independent?.normalizedSubaruRows !== 217 || !equal(independent?.statusCounts, { archived: 12, published: 205 }) || !equal(independent?.modelCounts?.published, PUBLISHED_MODELS) || !equal(independent?.modelCounts?.archived, ARCHIVED_MODELS) || !equal(independent?.modelCounts?.allStatuses, ALL_STATUS_MODELS)) throw new Error('Subaru independent inventory provenance drifted');
  if (!equal(inventory.modelCounts, independent.modelCounts) || !equal(inventory.statusCounts, independent.statusCounts)) throw new Error('Subaru independent inventory content drifted');
  const archivedIds = inventory.rows.filter((row) => row.status === 'archived').map((row) => row.id).sort();
  if (!equal(independent.archivedIds, archivedIds) || archivedIds.length !== 12 || archivedIds.some((id) => ids.has(id))) throw new Error('Subaru archived-row exclusion drifted');
  if (!equal(independent.rawMakeVariants, [{ make: 'Subaru', normalized: 'subaru', codePoints: ['U+0053', 'U+0075', 'U+0062', 'U+0061', 'U+0072', 'U+0075'], count: 217 }])) throw new Error('Subaru Unicode/case inventory drifted');
  if (snapshot.captureProvenance?.filter?.makeInsensitive !== 'Subaru' || snapshot.captureProvenance?.filter?.status !== 'published' || snapshot.captureProvenance?.environment?.secretValuesRecorded !== false || !/READ ONLY/.test(snapshot.captureProvenance?.transaction || '')) throw new Error('Subaru snapshot capture provenance drifted');
  return rows.sort((left, right) => left.id.localeCompare(right.id));
}

module.exports = { EXPECTED_INTERNAL_HASH, EXPECTED_NORMALIZED_SHA256, EXPECTED_ROWS, assertSubaruSnapshot };
