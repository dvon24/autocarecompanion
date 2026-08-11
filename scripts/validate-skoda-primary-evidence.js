/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');

const EVIDENCE_FILE = 'data/known-issue-skoda-primary-evidence-2026-08-11.json';
const EXPECTED_SHA256 = '8a330a71b40f0404e26c4876ffe45667ef4573a880b48af700059180626c0885';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function official(url) { return /^https:\/\/(?:www\.)?(?:skoda-auto\.com|skoda-storyboard\.com)\//i.test(String(url)); }
function fileDigest(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function assertCapture(source) {
  const capture = resolveRepo(source.localCaptureFile);
  const bytes = fs.readFileSync(capture);
  if (bytes.length !== source.binary.bytes || fileDigest(capture) !== source.binary.sha256) throw new Error(`${source.key}: captured source bytes drifted`);
  if (/\.html$/i.test(capture)) {
    const text = bytes.toString('utf8').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ');
    for (const required of source.requiredText || []) if (!text.includes(required)) throw new Error(`${source.key}: captured HTML lacks required text: ${required}`);
  }
  if (source.extractedTextFile) {
    const extractedFile = resolveRepo(source.extractedTextFile);
    const extracted = fs.readFileSync(extractedFile, 'utf8');
    if (fileDigest(extractedFile) !== source.extractedTextSha256) throw new Error(`${source.key}: extracted text bytes drifted`);
    for (const required of source.page?.requiredText || []) if (!extracted.includes(required)) throw new Error(`${source.key}: extracted text lacks required text: ${required}`);
  }
}

function assertSkodaEvidence() {
  const absolute = resolveRepo(EVIDENCE_FILE);
  if (normalizedFileHash(absolute) !== EXPECTED_SHA256) throw new Error('Skoda primary-evidence capture hash drifted');
  const evidence = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (evidence.schemaVersion !== 1 || evidence.capturedOn !== '2026-08-11' || evidence.status !== 'review-evidence-only' || evidence.writeAuthorization !== false) {
    throw new Error('Skoda primary-evidence header drifted');
  }
  const byKey = new Map((evidence.sources || []).map((source) => [source.key, source]));
  if (byKey.size !== 2 || [...byKey.values()].some((source) => !official(source.url) || !source.captureMethod || !source.binary?.sha256 || !source.binary?.bytes || !source.localCaptureFile)) {
    throw new Error('Skoda primary-evidence source inventory drifted');
  }
  for (const source of byKey.values()) assertCapture(source);

  const kodiaq = byKey.get('kodiaqFirstPhev2024');
  if (!kodiaq || !equal(kodiaq.binary, { bytes: 147990, sha256: 'e12ea83cd841b8be9be3be8a5d7ae2b967a0698a7c504d357276464807ffca1e' }) || kodiaq.facts?.publishedOn !== '2024-04-08' || !/first Kodiaq plug-in hybrid/i.test(kodiaq.facts?.identityBoundary || '') || kodiaq.facts?.powertrain !== '1.5 TSI plug-in hybrid' || !equal(kodiaq.associatedRows, ['skoda-kodiaq-iv-battery']) || kodiaq.decisionUse !== 'conflict-only; no rewrite under the frozen indexed identity') {
    throw new Error('Kodiaq iV conflict evidence drifted');
  }
  for (const text of ['For the first time', 'first ever Kodiaq plug-in hybrid', '1.5 TSI']) {
    if (!(kodiaq.requiredText || []).some((entry) => entry.includes(text))) throw new Error(`Kodiaq iV evidence lacks ${text}`);
  }

  const haldex = byKey.get('skodaServiceMaintenance2023');
  if (!haldex || !equal(haldex.binary, { bytes: 751303, sha256: '1f81a84375f8aa9524bedaaff848979991ea80e8faa6c803610329eafa5bdc66' }) || haldex.extractedTextSha256 !== 'a619f7bc684b85ae4ca41c203928d462df19ab78a6dcf4fe5751f1ec3d8ca9f6' || haldex.page?.pdfPage !== 4 || haldex.page?.printedPage !== 3 || !equal(haldex.page?.requiredText, ['Haldex clutch oil (4WD cars)', 'Every 3 years']) || !/does not establish/i.test(haldex.facts?.notEstablished || '') || !equal(haldex.associatedRows, ['skoda-yeti-haldex-coupling'])) {
    throw new Error('Yeti Haldex scope evidence drifted');
  }
  return evidence;
}

if (require.main === module) {
  try {
    const evidence = assertSkodaEvidence();
    console.log(JSON.stringify({ valid: true, file: EVIDENCE_FILE, sha256: EXPECTED_SHA256, sources: evidence.sources.length }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ valid: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { EVIDENCE_FILE, EXPECTED_SHA256, assertCapture, assertSkodaEvidence };
