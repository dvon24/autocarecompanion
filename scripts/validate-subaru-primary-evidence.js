/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');

const EVIDENCE_FILE = 'data/known-issue-subaru-primary-evidence-2026-08-11.json';
const EXPECTED_SHA256 = '611a8aa1c79cb55e53fce86b6858ffe0d390f647fe345c008087f11da12da9cb';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function assertSubaruEvidence() {
  const absolute = resolveRepo(EVIDENCE_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('Subaru primary-evidence inventory hash drifted');
  const evidence = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (evidence.schemaVersion !== 1 || evidence.capturedOn !== '2026-08-11' || evidence.status !== 'review-evidence-only' || evidence.make !== 'Subaru' || evidence.writeAuthorization !== false) throw new Error('Subaru primary-evidence header drifted');
  if (!Array.isArray(evidence.sources) || evidence.sources.length !== 0) throw new Error('Unreviewed Subaru evidence source entered the empty evidence contract');
  if (evidence.summary?.exactIdentityConflictCaptures !== 0 || evidence.summary?.retainedRewriteCaptures !== 0 || !/mandatory/i.test(evidence.policy || '')) throw new Error('Subaru evidence boundary drifted');
  return evidence;
}

if (require.main === module) {
  try {
    const evidence = assertSubaruEvidence();
    console.log(JSON.stringify({ valid: true, file: EVIDENCE_FILE, sha256: EXPECTED_SHA256, sources: evidence.sources.length }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ valid: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { EVIDENCE_FILE, EXPECTED_SHA256, assertSubaruEvidence };
