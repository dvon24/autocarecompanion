/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { analyze } = require('./analyze-mazda-mazda2-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-mazda-mazda2-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./mazda-adjudication-utils');
const PDFINFO = 'C:/Users/devon/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdfinfo.exe';
function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function assertPattern(value, pattern, label) { if (!pattern.test(value || '')) throw new Error(`${label}: content drift`); }

async function verifyFiles(files) {
  const out = [];
  for (const source of files) { const buffer = await fs.promises.readFile(source.path); if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`); out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 }); }
  return out;
}
async function fetchWithRetries(url, options = {}) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { ...options, headers: { accept: options.accept || '*/*', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
    if (response.ok) return response;
    if (![400, 429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${url}: status ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
  }
  throw new Error(`${url}: retry loop exhausted`);
}
function localPdfPages(source) {
  const result = spawnSync(PDFINFO, [source.localPath], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${source.title}: pdfinfo failed`);
  const match = /^Pages:\s+(\d+)$/m.exec(result.stdout); if (!match) throw new Error(`${source.title}: page count missing`); return Number(match[1]);
}
async function verifyPdf(source) {
  const local = await fs.promises.readFile(source.localPath);
  if (local.length !== source.bytes || hash(local) !== source.sha256 || local.subarray(0, 5).toString('ascii') !== '%PDF-' || localPdfPages(source) !== source.pages) throw new Error(`${source.title}: local PDF drift`);
  const response = await fetchWithRetries(source.url); const remote = Buffer.from(await response.arrayBuffer());
  if (remote.length !== source.bytes || hash(remote) !== source.sha256 || remote.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: remote PDF drift`);
  if (source.visualPages.length !== source.pages || source.visualPages.some((page, index) => page !== index + 1)) throw new Error(`${source.title}: incomplete visual review`);
  return { url: source.url, bytes: remote.length, sha256: source.sha256, pages: source.pages, visualPages: source.visualPages, localRemoteMatch: true };
}
async function fetchJson(url) { const response = await fetchWithRetries(url, { accept: 'application/json' }); return JSON.parse(await response.text()); }
async function main() {
  const analysis = await analyze();
  if (!analysis.passed || analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Mazda2 inventory gate failed');
  const communicationFiles = await verifyFiles(SOURCE_FILES); const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {}; for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  const shockPayload = await fetchJson(OTHER_SOURCES.shockComplaint.url); const shock = (shockPayload.results || [])[0]; const shockText = JSON.stringify(shock || {});
  assertPattern(shockText, /11030316/, 'shock complaint identifier'); assertPattern(shockText, /REAR SHOCKS HAD TO BE REPLACED/i, 'shock complaint'); assertPattern(shockText, /ALL FLUID HAS LEAKED/i, 'shock leak'); assertPattern(shockText, /2013/, 'shock product year');
  const brakePayload = await fetchJson(OTHER_SOURCES.complaints2012.url); const brakeRows = brakePayload.results || []; const brakeText = JSON.stringify(brakeRows);
  if (brakeRows.length < 9) throw new Error('2012 complaint file unexpectedly shrank');
  assertPattern(brakeText, /MAZDA2/i, '2012 complaint model');
  if (/self[- ]adjust|star wheel|rear drum/i.test(brakeText)) throw new Error('2012 complaint file now contains a self-adjuster claim; re-audit required');
  const datasets = await (await fetchWithRetries(OTHER_SOURCES.datasets.url, { accept: 'text/html' })).text(); assertPattern(datasets, /Datasets|APIs/i, 'NHTSA datasets page');
  if (process.argv.includes('--compact')) {
    console.log(JSON.stringify({ passed: true, communicationTotal: analysis.communicationTotal, recallTotal: analysis.recallTotal, campaignCount: analysis.campaignCount, pdfCount: Object.keys(pdfs).length, pdfPageCount: analysis.pdfPageCount, visuallyReviewedPages: analysis.visuallyReviewedPages, complaintSourceCount: 2 }, null, 2)); return;
  }
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints: { shock, brakeComplaintRows: brakeRows.length } }, null, 2));
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { fetchWithRetries, verifyPdf };
