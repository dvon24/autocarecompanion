/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');

const EVIDENCE_FILE = 'data/known-issue-tesla-primary-evidence-2026-08-11.json';
const EXPECTED_SHA256 = 'fdd99c4bde1ada5df64a11b6504697fce4243ae57c42177951b6f9ff0a0e30bb';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function assertTeslaEvidence() {
  const absolute = resolveRepo(EVIDENCE_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('Tesla primary-evidence boundary hash drifted');
  const evidence = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (evidence.schemaVersion !== 1 || evidence.capturedOn !== '2026-08-11' || evidence.status !== 'review-evidence-only' || evidence.writeAuthorization !== false) throw new Error('Tesla primary-evidence header drifted');
  if (!/No new external source bytes were captured or inspected/.test(evidence.inspectionBoundary || '')) throw new Error('Tesla evidence inspection boundary drifted');
  if (!Array.isArray(evidence.sources) || evidence.sources.length !== 0) throw new Error('Tesla evidence inventory must remain empty unless local captured bytes are added and pinned');
  return evidence;
}

if (require.main === module) {
  try {
    const evidence = assertTeslaEvidence();
    console.log(JSON.stringify({ valid: true, file: EVIDENCE_FILE, sha256: EXPECTED_SHA256, sources: evidence.sources.length }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ valid: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { EVIDENCE_FILE, EXPECTED_SHA256, assertTeslaEvidence };
