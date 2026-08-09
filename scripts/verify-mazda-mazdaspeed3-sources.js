/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { analyze } = require('./analyze-mazda-mazdaspeed3-sources');
const {
  BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY,
} = require('./build-mazda-mazdaspeed3-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./mazda-adjudication-utils');

const PDFINFO = 'C:/Users/devon/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdfinfo.exe';
function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
async function fetchWithRetries(url, accept = '*/*') {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { accept, 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
    if (response.ok) return response;
    if (![400, 429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${url}: status ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
  }
  throw new Error(`${url}: retry loop exhausted`);
}
async function verifyFiles(files) {
  const out = [];
  for (const source of files) {
    const buffer = await fs.promises.readFile(source.path);
    if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`);
    out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 });
  }
  return out;
}
function localPdfPages(source) {
  const result = spawnSync(PDFINFO, [source.localPath], { encoding: 'utf8' });
  const match = /^Pages:\s+(\d+)$/m.exec(result.stdout || '');
  if (result.status !== 0 || !match) throw new Error(`${source.title}: pdfinfo failed`);
  return Number(match[1]);
}
async function verifyPdf(source) {
  const local = await fs.promises.readFile(source.localPath);
  if (local.length !== source.bytes || hash(local) !== source.sha256 || local.subarray(0, 5).toString('ascii') !== '%PDF-' || localPdfPages(source) !== source.pages) throw new Error(`${source.title}: local PDF drift`);
  const remote = Buffer.from(await (await fetchWithRetries(source.url)).arrayBuffer());
  if (remote.length !== source.bytes || hash(remote) !== source.sha256 || remote.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: remote PDF drift`);
  if (source.visualPages.length !== source.pages || source.visualPages.some((page, index) => page !== index + 1)) throw new Error(`${source.title}: incomplete visual review`);
  return { url: source.url, bytes: remote.length, sha256: source.sha256, pages: source.pages, visualPages: source.visualPages, localRemoteMatch: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed || analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Mazdaspeed3 inventory gate failed');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  const datasets = await (await fetchWithRetries(OTHER_SOURCES.datasets.url, 'text/html')).text();
  if (!/Manufacturer Communications/i.test(datasets) || !/Recalls/i.test(datasets)) throw new Error('NHTSA datasets page drift');
  const compact = { passed: true, communicationTotal: analysis.communicationTotal, recallTotal: analysis.recallTotal, campaignCount: analysis.campaignCount, pdfCount: Object.keys(pdfs).length, pdfPageCount: analysis.pdfPageCount, visuallyReviewedPages: analysis.visuallyReviewedPages };
  console.log(JSON.stringify(process.argv.includes('--compact') ? compact : { ...compact, inventory: analysis, communicationFiles, recallFiles, pdfs }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { fetchWithRetries, verifyPdf };
