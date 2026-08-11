/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { ACTION, OUTPUT_FILE } = require('./build-subaru-review-ledger');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');

const EXPECTED_SHA256 = '5179fadf2f0609bbb92d4f2adf41882491ed2d3446bb5d267606bb9383a304c9';
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function validateReviewLedger(ledger, frozenRows) {
  const errors = [];
  const entries = Array.isArray(ledger?.entries) ? ledger.entries : [];
  const frozenIds = frozenRows.map((row) => row.id).sort();
  const ledgerIds = entries.map((entry) => entry.id).sort();
  if (ledger?.status !== 'review-ledger-only' || ledger?.publishedRows !== 205 || ledger?.archivedRowsExcluded !== 12 || ledger?.writeAuthorization?.content !== false || ledger?.writeAuthorization?.metadata !== false) errors.push('review ledger authorization/header drifted');
  if (entries.length !== frozenRows.length || new Set(ledgerIds).size !== frozenRows.length || JSON.stringify(ledgerIds) !== JSON.stringify(frozenIds)) errors.push('review ledger exact coverage drifted');
  for (const entry of entries) {
    if (entry.action !== ACTION || !entry.justification || !entry.disposition) errors.push(`${entry.id}: ledger action/justification missing`);
    if (entry.contentWriteAuthorized !== false || entry.metadataWriteAuthorized !== false) errors.push(`${entry.id}: ledger authorizes a write`);
    if (!Array.isArray(entry.existingSourcesInspected) || entry.existingSourcesInspected.some((source) => typeof source.url !== 'string' || source.urlMissing !== !source.url.trim() || source.inspection !== 'frozen-citation-metadata-only; source content was not promoted to exact primary proof')) errors.push(`${entry.id}: existing-source review ledger incomplete`);
    if (!Array.isArray(entry.capturedEvidenceKeys) || entry.capturedEvidenceKeys.length || !Array.isArray(entry.duplicateClusterKeys)) errors.push(`${entry.id}: evidence/duplicate ledger malformed`);
  }
  return errors;
}

function loadAndValidateReviewLedger(frozenRows) {
  const absolute = resolveRepo(OUTPUT_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('Subaru review-ledger hash drifted');
  const ledger = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  const errors = validateReviewLedger(ledger, frozenRows);
  if (errors.length) throw new Error(errors.join('; '));
  return ledger;
}

module.exports = { EXPECTED_SHA256, loadAndValidateReviewLedger, validateReviewLedger };
