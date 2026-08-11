/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { ACTION, OUTPUT_FILE } = require('./build-suzuki-review-ledger');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');
const { clustersForModel, reviewReasons } = require('./suzuki-case-inventory-contract');

const EXPECTED_SHA256 = 'bd742490818f3411892f90da30a0d7ca12a1ff4914cbd171a6885e16935a5538';
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function validateReviewLedger(ledger, frozenRows) {
  const errors = [];
  const entries = Array.isArray(ledger?.entries) ? ledger.entries : [];
  const frozenIds = frozenRows.map((row) => row.id).sort();
  const frozenById = new Map(frozenRows.map((row) => [row.id, row]));
  const ledgerIds = entries.map((entry) => entry.id).sort();
  if (ledger?.status !== 'review-ledger-only' || ledger?.make !== 'Suzuki' || ledger?.writeAuthorization?.content !== false || ledger?.writeAuthorization?.metadata !== false) errors.push('review ledger authorization/header drifted');
  if (entries.length !== frozenRows.length || new Set(ledgerIds).size !== frozenRows.length || JSON.stringify(ledgerIds) !== JSON.stringify(frozenIds)) errors.push('review ledger exact coverage drifted');
  for (const entry of entries) {
    const frozen = frozenById.get(entry.id);
    if (entry.action !== ACTION || !entry.justification || !entry.disposition) errors.push(`${entry.id}: ledger action/justification missing`);
    if (entry.contentWriteAuthorized !== false || entry.metadataWriteAuthorized !== false) errors.push(`${entry.id}: ledger authorizes a write`);
    if (!Array.isArray(entry.existingSourcesInspected) || entry.existingSourcesInspected.some((source) => !source.url || !source.inspection)) errors.push(`${entry.id}: existing-source review ledger incomplete`);
    if (!Array.isArray(entry.capturedEvidenceKeys) || entry.capturedEvidenceKeys.length !== 0 || !Array.isArray(entry.duplicateClusterKeys)) errors.push(`${entry.id}: evidence/duplicate ledger malformed`);
    if (!frozen || entry.model !== frozen.model || entry.justification !== reviewReasons[entry.id]) errors.push(`${entry.id}: ledger case contract drifted`);
    if (frozen) {
      const expectedClusters = clustersForModel(frozen.model).filter((cluster) => cluster.ids.includes(entry.id)).map((cluster) => cluster.key);
      const expectedSources = (frozen.citations || []).map((citation) => ({
        url: citation.url,
        type: citation.type,
        title: citation.title,
        inspection: 'frozen-citation-metadata-only; source content was not promoted to exact primary proof',
      }));
      if (JSON.stringify(entry.duplicateClusterKeys) !== JSON.stringify(expectedClusters) || JSON.stringify(entry.existingSourcesInspected) !== JSON.stringify(expectedSources)) errors.push(`${entry.id}: ledger citation/cluster inventory drifted`);
    }
  }
  return errors;
}

function loadAndValidateReviewLedger(frozenRows) {
  const absolute = resolveRepo(OUTPUT_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('Suzuki review-ledger hash drifted');
  const ledger = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  const errors = validateReviewLedger(ledger, frozenRows);
  if (errors.length) throw new Error(errors.join('; '));
  return ledger;
}

module.exports = { EXPECTED_SHA256, loadAndValidateReviewLedger, validateReviewLedger };
