/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-mazda-cx-3-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-mazda-cx-3-adjudication');
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
async function fetchJson(url) {
  const response = await fetchWithRetries(url, { accept: 'application/json' });
  return JSON.parse(await response.text());
}
async function verifyPdf(source) {
  const local = await fs.promises.readFile(source.localPath);
  if (local.length !== source.bytes || hash(local) !== source.sha256 || local.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: local PDF drift`);
  const response = await fetchWithRetries(source.url);
  const remote = Buffer.from(await response.arrayBuffer());
  if (remote.length !== source.bytes || hash(remote) !== source.sha256 || remote.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: remote PDF drift`);
  if (!Array.isArray(source.visualPages) || source.visualPages.length !== source.pages || source.visualPages.some((page, index) => page !== index + 1)) throw new Error(`${source.title}: not every PDF page was visually reviewed`);
  return { url: source.url, bytes: remote.length, sha256: source.sha256, pages: source.pages, visualPages: source.visualPages, localRemoteMatch: true };
}
async function complaintRows(source) {
  const payload = await fetchJson(source.url);
  return payload.results || payload.Results || [];
}
function complaintText(rows) { return rows.map((row) => `${row.components || row.Components || ''} ${row.summary || row.Summary || ''}`).join('\n'); }

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Mazda CX-3 inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  const complaints = {};
  const allRows = [];
  for (const [key, source] of Object.entries(OTHER_SOURCES).filter(([key]) => key.startsWith('complaints'))) {
    const rows = await complaintRows(source); complaints[key] = { url: source.url, count: rows.length }; allRows.push(...rows);
  }
  const text2016 = complaintText(await complaintRows(OTHER_SOURCES.complaints2016));
  const text2017 = complaintText(await complaintRows(OTHER_SOURCES.complaints2017));
  const text2019 = complaintText(await complaintRows(OTHER_SOURCES.complaints2019));
  assertPattern(text2016, /pressure test found a leak in the evaporator/is, '2016 evaporator complaint');
  assertPattern(text2016, /transmission had to be replaced/is, '2016 transmission complaint');
  assertPattern(text2017, /warm air from the climate control vents.*new evaporator/is, '2017 evaporator complaint');
  assertPattern(text2019, /grinding noise.*brakes/is, '2019 brake complaint');
  const exactCarbonMentions = allRows.filter((row) => /intake valve carbon|carbon buildup|carbon build-up/i.test(row.summary || row.Summary || '')).length;
  if (exactCarbonMentions !== 0) throw new Error(`unexpected exact carbon complaint count ${exactCarbonMentions}`);
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints, exactCarbonComplaintMentions: exactCarbonMentions }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
