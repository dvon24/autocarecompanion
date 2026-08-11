/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clustersForModel } = require('./skoda-model-adjudication-contracts');
const { assertSkodaSnapshot } = require('./skoda-snapshot-contract');

const SNAPSHOT_FILE = 'data/_skoda-deeplink-snapshot-2026-08-11.json';
const OUTPUT_FILE = 'data/known-issue-skoda-review-ledger-2026-08-11.json';
const ACTION = 'hold_indexed_identity_byte_identical_pending_identity_policy';
const capturedEvidence = Object.freeze({
  'skoda-kodiaq-iv-battery': ['kodiaqFirstPhev2024'],
  'skoda-yeti-haldex-coupling': ['skodaServiceMaintenance2023'],
});
const capturedJustifications = Object.freeze({
  'skoda-kodiaq-iv-battery': 'Captured official Skoda evidence identifies the 2024 second-generation 1.5 TSI Kodiaq iV as the first Kodiaq plug-in hybrid, conflicting with the frozen 2020–2023 1.4 TSI iV identity; keep the indexed record byte-identical pending identity policy.',
  'skoda-yeti-haldex-coupling': 'Captured official Skoda maintenance evidence supports a general three-year Haldex-oil interval but not the complete frozen mileage, filter, prevalence, or cost scope; keep the indexed record byte-identical.',
});

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function buildReviewLedger(snapshot) {
  const rows = assertSkodaSnapshot(snapshot, resolveRepo(SNAPSHOT_FILE));
  return {
    schemaVersion: 1,
    status: 'review-ledger-only',
    generatedOn: '2026-08-11',
    make: 'Skoda',
    writeAuthorization: { content: false, metadata: false },
    inspectionBoundary: 'Existing citation metadata was inventoried for every row. Only evidence keys with local captured bytes were inspected as source content; no uncaptured negative-search conclusion is asserted.',
    entries: rows.map((row) => ({
      id: row.id,
      model: row.model,
      action: ACTION,
      disposition: 'Preserve the complete published record byte-identical pending separately approved identity/applicability policy.',
      justification: capturedJustifications[row.id] || 'The frozen citation inventory and locally captured audit evidence do not establish an exact same-identity primary applicability record for the complete scope; preserving the row unchanged is the conservative disposition.',
      capturedEvidenceKeys: capturedEvidence[row.id] || [],
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
