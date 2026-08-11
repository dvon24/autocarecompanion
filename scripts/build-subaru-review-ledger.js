/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clustersForModel } = require('./subaru-model-adjudication-contracts');
const { assertSubaruSnapshot } = require('./subaru-snapshot-contract');

const SNAPSHOT_FILE = 'data/_subaru-deeplink-snapshot-2026-08-11.json';
const OUTPUT_FILE = 'data/known-issue-subaru-review-ledger-2026-08-11.json';
const ACTION = 'hold_indexed_identity_byte_identical_pending_identity_policy';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function buildReviewLedger(snapshot) {
  const rows = assertSubaruSnapshot(snapshot, resolveRepo(SNAPSHOT_FILE));
  return {
    schemaVersion: 1,
    status: 'review-ledger-only',
    generatedOn: '2026-08-11',
    make: 'Subaru',
    publishedRows: 205,
    archivedRowsExcluded: 12,
    writeAuthorization: { content: false, metadata: false },
    inspectionBoundary: 'Existing citation metadata was inventoried for every published row. No uncaptured source content was promoted to exact primary proof and no negative-search conclusion is asserted.',
    entries: rows.map((row) => {
      const clusters = clustersForModel(row.model).filter((cluster) => cluster.ids.includes(row.id));
      return {
        id: row.id,
        model: row.model,
        action: ACTION,
        disposition: 'Preserve the complete published record byte-identical pending separately approved identity/applicability policy.',
        justification: clusters.length
          ? `The row overlaps a separately indexed candidate: ${clusters.map((cluster) => cluster.decision).join(' ')}`
          : 'The frozen citation inventory does not include a locally captured exact same-identity primary record supporting a bounded rewrite; preserving the row unchanged is the conservative disposition.',
        capturedEvidenceKeys: [],
        duplicateClusterKeys: clusters.map((cluster) => cluster.key),
        existingSourcesInspected: (row.citations || []).map((citation) => ({
          url: citation.url,
          type: citation.type,
          title: citation.title,
          urlMissing: !String(citation.url || '').trim(),
          inspection: 'frozen-citation-metadata-only; source content was not promoted to exact primary proof',
        })),
        contentWriteAuthorized: false,
        metadataWriteAuthorized: false,
      };
    }),
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(SNAPSHOT_FILE), 'utf8'));
  const ledger = buildReviewLedger(snapshot);
  fs.writeFileSync(resolveRepo(OUTPUT_FILE), `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ output: OUTPUT_FILE, entries: ledger.entries.length, actions: { [ACTION]: ledger.entries.length }, authorizedWrites: 0 }, null, 2));
}

module.exports = { ACTION, OUTPUT_FILE, buildReviewLedger };
