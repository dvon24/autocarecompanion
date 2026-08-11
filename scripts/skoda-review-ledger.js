/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { ACTION, OUTPUT_FILE } = require('./build-skoda-review-ledger');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');

const EXPECTED_SHA256 = '0e79547a619c5833625419c7a398c5e0b933a160cb4bfd4b71eda440d7bc77e9';
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function validateReviewLedger(ledger, frozenRows) {
  const errors = [];
  const entries = Array.isArray(ledger?.entries) ? ledger.entries : [];
  const frozenIds = frozenRows.map((row) => row.id).sort();
  const ledgerIds = entries.map((entry) => entry.id).sort();
  if (ledger?.status !== 'review-ledger-only' || ledger?.writeAuthorization?.content !== false || ledger?.writeAuthorization?.metadata !== false) errors.push('review ledger authorization/header drifted');
  if (entries.length !== frozenRows.length || new Set(ledgerIds).size !== frozenRows.length || JSON.stringify(ledgerIds) !== JSON.stringify(frozenIds)) errors.push('review ledger exact coverage drifted');
  for (const entry of entries) {
    if (entry.action !== ACTION || !entry.justification || !entry.disposition) errors.push(`${entry.id}: ledger action/justification missing`);
    if (entry.contentWriteAuthorized !== false || entry.metadataWriteAuthorized !== false) errors.push(`${entry.id}: ledger authorizes a write`);
    if (!Array.isArray(entry.existingSourcesInspected) || entry.existingSourcesInspected.some((source) => !source.url || !source.inspection)) errors.push(`${entry.id}: existing-source review ledger incomplete`);
    if (!Array.isArray(entry.capturedEvidenceKeys) || !Array.isArray(entry.duplicateClusterKeys)) errors.push(`${entry.id}: evidence/duplicate ledger malformed`);
  }
  return errors;
}

function loadAndValidateReviewLedger(frozenRows) {
  const absolute = resolveRepo(OUTPUT_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('Skoda review-ledger hash drifted');
  const ledger = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  const errors = validateReviewLedger(ledger, frozenRows);
  if (errors.length) throw new Error(errors.join('; '));
  return ledger;
}

module.exports = { EXPECTED_SHA256, loadAndValidateReviewLedger, validateReviewLedger };
