/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');
const { reviewReasons } = require('./suzuki-case-inventory-contract');

const EVIDENCE_FILE = 'data/known-issue-suzuki-primary-evidence-2026-08-11.json';
const EXPECTED_SHA256 = '381b62b031b92d09d0095770dfb2bf96f446634708d55e7894c7d363b260e14f';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function assertSuzukiEvidence() {
  const absolute = resolveRepo(EVIDENCE_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('Suzuki primary-evidence inventory hash drifted');
  const evidence = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (evidence.schemaVersion !== 1 || evidence.capturedOn !== '2026-08-11' || evidence.status !== 'review-evidence-only' || evidence.writeAuthorization !== false) throw new Error('Suzuki primary-evidence header drifted');
  if (!/retained rewrite or exact primary-source conflict/i.test(evidence.capturePolicy || '')) throw new Error('Suzuki primary-evidence capture policy drifted');
  if (!Array.isArray(evidence.sources) || evidence.sources.length !== 0) throw new Error('Suzuki evidence inventory must remain empty for the reviewed all-hold/no-conflict result');
  if (Object.keys(reviewReasons).length !== 18) throw new Error('Suzuki evidence inventory is detached from the complete case inventory');
  return evidence;
}

if (require.main === module) {
  try {
    const evidence = assertSuzukiEvidence();
    console.log(JSON.stringify({ valid: true, file: EVIDENCE_FILE, sha256: EXPECTED_SHA256, sources: evidence.sources.length, captureRequired: 0 }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ valid: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { EVIDENCE_FILE, EXPECTED_SHA256, assertSuzukiEvidence };
