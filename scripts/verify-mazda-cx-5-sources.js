/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-mazda-cx-5-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-mazda-cx-5-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./mazda-adjudication-utils');

function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function assertPattern(value, pattern, label) { if (!pattern.test(value || '')) throw new Error(`${label}: content drift`); }
async function verifyFiles(files) {
  const out = [];
  for (const source of files) {
    const buffer = await fs.promises.readFile(source.path);
    if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`);
    out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 });
  }
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
async function fetchJson(url) { const response = await fetchWithRetries(url, { accept: 'application/json' }); return JSON.parse(await response.text()); }
async function verifyPdf(source) {
  const local = await fs.promises.readFile(source.localPath);
  if (local.length !== source.bytes || hash(local) !== source.sha256 || local.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: local PDF drift`);
  const response = await fetchWithRetries(source.url); const remote = Buffer.from(await response.arrayBuffer());
  if (remote.length !== source.bytes || hash(remote) !== source.sha256 || remote.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: remote PDF drift`);
  if (!Array.isArray(source.visualPages) || source.visualPages.length !== source.pages || source.visualPages.some((page, index) => page !== index + 1)) throw new Error(`${source.title}: not every PDF page was visually reviewed`);
  return { url: source.url, bytes: remote.length, sha256: source.sha256, pages: source.pages, visualPages: source.visualPages, localRemoteMatch: true };
}
function rows(payload) { return payload.results || payload.Results || []; }
function textOf(payload) { return rows(payload).map((row) => JSON.stringify(row)).join('\n'); }

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount || analysis.pdfPageCount !== 79) throw new Error('Mazda CX-5 inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);

  const complaintPayloads = {};
  const recallPayloads = {};
  for (const [key, source] of Object.entries(OTHER_SOURCES)) {
    if (key.startsWith('complaints')) complaintPayloads[key] = await fetchJson(source.url);
    if (key.startsWith('recalls')) recallPayloads[key] = await fetchJson(source.url);
  }
  for (const [key, payload] of Object.entries(complaintPayloads)) if (!Array.isArray(rows(payload))) throw new Error(`${key}: complaint response shape drift`);
  for (const [key, payload] of Object.entries(recallPayloads)) if (!Array.isArray(rows(payload))) throw new Error(`${key}: recall response shape drift`);
  assertPattern(`${textOf(complaintPayloads.complaints2017)} ${textOf(complaintPayloads.complaints2020)} ${textOf(complaintPayloads.complaints2023)}`, /battery|start.?stop|no.?start|won.?t start/i, 'battery complaint evidence');
  assertPattern(`${JSON.stringify(recallPayloads.recalls2018)} ${JSON.stringify(recallPayloads.recalls2019)}`, /19V497000/, '2018-2019 PCM recall evidence');
  assertPattern(JSON.stringify(recallPayloads.recalls2016), /20V063000/, '2016 DRL recall evidence');
  assertPattern(`${JSON.stringify(recallPayloads.recalls2018)} ${JSON.stringify(recallPayloads.recalls2019)}`, /21V875000/, '2018-2019 fuel-pump recall evidence');
  assertPattern(JSON.stringify(recallPayloads.recalls2016), /16V203000/, '2016 strut-fastener recall evidence');
  const complaints = Object.fromEntries(Object.entries(complaintPayloads).map(([key, payload]) => [key, { url: OTHER_SOURCES[key].url, count: rows(payload).length }]));
  const recalls = Object.fromEntries(Object.entries(recallPayloads).map(([key, payload]) => [key, { url: OTHER_SOURCES[key].url, count: rows(payload).length }]));
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints, recalls }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
