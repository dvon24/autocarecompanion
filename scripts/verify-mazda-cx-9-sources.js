/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto'); const fs = require('node:fs');
const { analyze } = require('./analyze-mazda-cx-9-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-mazda-cx-9-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./mazda-adjudication-utils');

function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function rows(payload) { return payload.results || payload.Results || []; }
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
async function verifyPdf(source) {
  const local = await fs.promises.readFile(source.localPath);
  if (local.length !== source.bytes || hash(local) !== source.sha256 || local.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: local PDF drift`);
  const response = await fetchWithRetries(source.url); const remote = Buffer.from(await response.arrayBuffer());
  if (remote.length !== source.bytes || hash(remote) !== source.sha256 || remote.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: remote PDF drift`);
  if (!Array.isArray(source.visualPages) || source.visualPages.length !== source.pages || source.visualPages.some((page, index) => page !== index + 1)) throw new Error(`${source.title}: not every PDF page was visually reviewed`);
  return { url: source.url, bytes: remote.length, sha256: source.sha256, pages: source.pages, visualPages: source.visualPages, localRemoteMatch: true };
}
async function fetchJson(url) { const response = await fetchWithRetries(url, { accept: 'application/json' }); return JSON.parse(await response.text()); }

async function main() {
  const analysis = await analyze();
  if (!analysis.passed || analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount || analysis.pdfPageCount !== 20) throw new Error('Mazda CX-9 inventory gate failed');
  const communicationFiles = await verifyFiles(SOURCE_FILES); const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {}; for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  const complaints2008 = await fetchJson(OTHER_SOURCES.complaints2008.url); const complaints2010 = await fetchJson(OTHER_SOURCES.complaints2010.url);
  const text2008 = JSON.stringify(complaints2008); const text2010 = JSON.stringify(complaints2010);
  assertPattern(text2008, /10546477/, '2008 evaporator complaint identifier');
  assertPattern(text2008, /evaporator|evap coil/i, '2008 evaporator complaint narrative');
  assertPattern(text2010, /11082334/, '2010 timing-chain complaint identifier');
  assertPattern(text2010, /timing chain/i, '2010 timing-chain complaint narrative');
  for (const id of ['11460271', '11394287', '11349098', '11265292']) assertPattern(text2010, new RegExp(id), `2010 water-pump complaint ${id}`);
  assertPattern(text2010, /water pump/i, '2010 water-pump complaint narrative');
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints: { complaints2008: { url: OTHER_SOURCES.complaints2008.url, count: rows(complaints2008).length }, complaints2010: { url: OTHER_SOURCES.complaints2010.url, count: rows(complaints2010).length } } }, null, 2));
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
