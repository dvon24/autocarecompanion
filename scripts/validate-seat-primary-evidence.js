/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { getContract, supportedModels } = require('./seat-model-adjudication-contracts');

const EVIDENCE_FILE = 'data/known-issue-seat-primary-evidence-2026-08-11.json';
const EXPECTED_SHA256 = '046f1744544cb5990b56ac4fe58747f3b542303ea33df53203ab43aaee5c580f';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function assertSeatEvidence() {
  const absolute = resolveRepo(EVIDENCE_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('SEAT primary-evidence capture hash drifted');
  const evidence = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (evidence.schemaVersion !== 1 || evidence.capturedOn !== '2026-08-11' || evidence.status !== 'review-evidence-only') throw new Error('SEAT primary-evidence header drifted');
  const byKey = new Map((evidence.sources || []).map((source) => [source.key, source]));
  if (byKey.size !== 5) throw new Error('SEAT primary-evidence source inventory drifted');

  for (const model of supportedModels) {
    const contract = getContract(model);
    for (const rowId of contract.retainedIds) {
      for (const key of contract.content[rowId].citations) {
        const source = contract.pdfSources[key] || contract.otherSources[key];
        const captured = byKey.get(key);
        if (!source || !captured || captured.url !== source.url) throw new Error(`${rowId}: retained source ${key} is not pinned`);
      }
    }
    for (const [key, source] of Object.entries(contract.pdfSources)) {
      const captured = byKey.get(key);
      const requiredText = (captured?.page?.requiredText || []).join(' ').toLowerCase();
      const pageIdentity = captured && { pdfPage: captured.page?.pdfPage, printedPage: captured.page?.printedPage };
      if (!captured || captured.url !== source.url || !equal(captured.binary, { bytes: source.localVerification.bytes, sha256: source.localVerification.sha256 }) || !equal(pageIdentity, { pdfPage: source.localVerification.pdfPage, printedPage: source.localVerification.printedPage }) || source.contains.some((text) => !requiredText.includes(text.toLowerCase()))) {
        throw new Error(`${model}: PDF evidence ${key} drifted`);
      }
      if (source.localVerification.renderedAndInspected !== true) throw new Error(`${model}: PDF evidence ${key} lacks rendered inspection`);
    }
  }

  const recall2017 = byKey.get('aronaRecall2017')?.facts;
  const recall2018 = byKey.get('aronaRecall2018')?.facts;
  for (const [year, facts] of [[2017, recall2017], [2018, recall2018]]) {
    if (!facts || facts.make !== 'SEAT' || facts.model !== 'ARONA' || facts.modelYear !== year || facts.campaign !== 'R/2019/039' || facts.reason !== 'Hand brake lever travel increase due to adjuster nut movement.' || facts.remedy !== 'Re-adjust assembly and fit locking device to nut.' || facts.affectedVehicles !== 19854) {
      throw new Error(`Arona ${year} recall evidence drifted`);
    }
  }
  return evidence;
}

if (require.main === module) {
  try {
    const evidence = assertSeatEvidence();
    console.log(JSON.stringify({ valid: true, file: EVIDENCE_FILE, sha256: EXPECTED_SHA256, sources: evidence.sources.length }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ valid: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { EVIDENCE_FILE, EXPECTED_SHA256, assertSeatEvidence };
