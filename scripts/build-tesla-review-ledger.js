/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clustersForModel } = require('./tesla-model-adjudication-contracts');
const { assertTeslaSnapshot } = require('./tesla-snapshot-contract');

const SNAPSHOT_FILE = 'data/_tesla-deeplink-snapshot-2026-08-11.json';
const OUTPUT_FILE = 'data/known-issue-tesla-review-ledger-2026-08-11.json';
const ACTION = 'hold_indexed_identity_byte_identical_pending_identity_policy';
const capturedEvidence = Object.freeze({});
const specificJustifications = Object.freeze({
  'tesla-model-y-seatbelt-anchor-recall': 'The frozen Model Y row title says Model S / Model X First-Row Seat Belt Anchor Inspection Recall, contradicting its Model Y slug and model field. Preserve the complete published row byte-identical pending separately approved identity policy.',
});

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function buildReviewLedger(snapshot) {
  const rows = assertTeslaSnapshot(snapshot, resolveRepo(SNAPSHOT_FILE));
  return {
    schemaVersion: 1,
    status: 'review-ledger-only',
    generatedOn: '2026-08-11',
    make: 'Tesla',
    writeAuthorization: { content: false, metadata: false },
    inspectionBoundary: 'Existing citation metadata was inventoried for every row. No new external source bytes were captured or inspected, so no existing citation was promoted to exact primary proof and no negative-search conclusion is asserted.',
    entries: rows.map((row) => ({
      id: row.id,
      model: row.model,
      action: ACTION,
      disposition: 'Preserve the complete published record byte-identical pending separately approved identity/applicability policy.',
      justification: specificJustifications[row.id] || 'The frozen citation inventory was reviewed as metadata only and no locally captured source establishes exact same-identity primary applicability for the complete scope; preserving the row unchanged is the conservative disposition.',
      capturedEvidenceKeys: capturedEvidence[row.id] || [],
      duplicateClusterKeys: clustersForModel(row.model).filter((cluster) => cluster.ids.includes(row.id)).map((cluster) => cluster.key),
      existingSourcesInspected: (row.citations || []).map((citation) => ({
        url: citation.url,
        type: citation.type,
        title: citation.title,
        inspection: 'frozen-citation-metadata-only; source content was not inspected or promoted to exact primary proof',
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
