/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clustersForModel, reviewReasons } = require('./suzuki-case-inventory-contract');
const { assertSuzukiSnapshot } = require('./suzuki-snapshot-contract');

const SNAPSHOT_FILE = 'data/_suzuki-deeplink-snapshot-2026-08-11.json';
const OUTPUT_FILE = 'data/known-issue-suzuki-review-ledger-2026-08-11.json';
const ACTION = 'hold_indexed_identity_byte_identical_pending_identity_policy';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function buildReviewLedger(snapshot) {
  const rows = assertSuzukiSnapshot(snapshot, resolveRepo(SNAPSHOT_FILE));
  return {
    schemaVersion: 1,
    status: 'review-ledger-only',
    generatedOn: '2026-08-11',
    make: 'Suzuki',
    writeAuthorization: { content: false, metadata: false },
    inspectionBoundary: 'Every frozen citation was inventoried as metadata. No exact primary conflict was established and no retained rewrite was proposed, so the decision relies on no uncaptured source content. Negative-search conclusions are not asserted.',
    entries: rows.map((row) => ({
      id: row.id,
      model: row.model,
      action: ACTION,
      disposition: 'Preserve the complete published record byte-identical pending separately approved identity/applicability policy.',
      justification: reviewReasons[row.id],
      capturedEvidenceKeys: [],
      duplicateClusterKeys: clustersForModel(row.model).filter((cluster) => cluster.ids.includes(row.id)).map((cluster) => cluster.key),
      existingSourcesInspected: (row.citations || []).map((citation) => ({
        url: citation.url,
        type: citation.type,
        title: citation.title,
        inspection: 'frozen-citation-metadata-only; source content was not promoted to exact primary proof',
      })),
      contentWriteAuthorized: false,
      metadataWriteAuthorized: false,
    })),
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(SNAPSHOT_FILE), 'utf8'));
  const ledger = buildReviewLedger(snapshot);
  fs.writeFileSync(resolveRepo(OUTPUT_FILE), `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ output: OUTPUT_FILE, entries: ledger.entries.length, actions: { [ACTION]: ledger.entries.length }, authorizedWrites: 0 }, null, 2));
}

module.exports = { ACTION, OUTPUT_FILE, buildReviewLedger };
