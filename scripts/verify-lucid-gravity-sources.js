/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lucid-gravity-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lucid-gravity-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./lucid-adjudication-utils');

function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
async function verifyFiles(files) {
  const out = [];
  for (const source of files) {
    const buffer = await fs.promises.readFile(source.path);
    if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`);
    out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 });
  }
  return out;
}
function verifyPdfBuffer(buffer, source, label) {
  const sha256 = hash(buffer);
  if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-')) || buffer.length !== source.bytes || sha256 !== source.sha256) throw new Error(`${source.title} ${label}: PDF/hash mismatch`);
  return { label, bytes: buffer.length, sha256 };
}
async function verifyPdf(source) {
  const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local');
  const response = await fetch(source.url, { headers: { accept: 'application/pdf', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.url}: status ${response.status}`);
  const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote');
  return { url: source.url, pages: source.pages, visualPages: source.visualPages, contentType: response.headers.get('content-type') || '', local, remote };
}
async function fetchJson(url) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
    const body = await response.text();
    let payload;
    try { payload = JSON.parse(body); } catch { payload = null; }
    if (response.ok) return payload;
    if (response.status === 400 && payload?.message === 'Results returned successfully' && Array.isArray(payload.results)) return payload;
    if (![400, 429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${url}: status ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
  }
  throw new Error(`${url}: retry loop exhausted`);
}
async function verifyNoComplaints(source) {
  const payload = await fetchJson(source.url);
  if (Number(payload.count) !== 0 || (payload.results || []).length !== 0) throw new Error(`${source.url}: expected zero current Gravity complaints`);
  return { url: source.url, count: 0 };
}
function assertPattern(value, pattern, label) { if (!pattern.test(value || '')) throw new Error(`${label}: content drift`); }
async function verifyRecallApi(source, expectedCampaigns) {
  const payload = await fetchJson(source.url);
  const rows = payload.results || [];
  const campaigns = Object.fromEntries(rows.map((row) => [row.NHTSACampaignNumber, row]));
  for (const campaign of expectedCampaigns) if (!campaigns[campaign]) throw new Error(`${source.url}: missing ${campaign}`);
  if (campaigns['25V855000']) {
    assertPattern(campaigns['25V855000'].Summary, /incorrect backrest covers.*front seats.*side air bags/is, '25V855 summary');
    assertPattern(campaigns['25V855000'].Remedy, /inspect and replace.*free of charge.*SR-25-05-0/is, '25V855 remedy');
  }
  if (campaigns['26V018000']) {
    assertPattern(campaigns['26V018000'].Summary, /software version prior to 3\.3\.20.*rearview camera image may not display/is, '26V018 summary');
    assertPattern(campaigns['26V018000'].Remedy, /over-the-air.*free of charge.*SR-26-02-0/is, '26V018 remedy');
  }
  if (campaigns['26V192000']) {
    assertPattern(campaigns['26V192000'].Summary, /lap belt anchor brackets.*insufficient welds/is, '26V192 summary');
    assertPattern(campaigns['26V192000'].Remedy, /inspect and repair.*or replace.*free of charge.*SR-26-04-00/is, '26V192 remedy');
  }
  return { url: source.url, campaigns: Object.keys(campaigns).sort(), requiredCampaignsMatched: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Lucid Gravity inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  if (Object.keys(pdfs).length !== 10) throw new Error(`expected 10 exact primary PDFs, found ${Object.keys(pdfs).length}`);
  const complaints2025 = await verifyNoComplaints(OTHER_SOURCES.complaints2025);
  const complaints2026 = await verifyNoComplaints(OTHER_SOURCES.complaints2026);
  const recalls2025 = await verifyRecallApi(OTHER_SOURCES.recalls2025, ['26V018000', '26V192000']);
  const recalls2026 = await verifyRecallApi(OTHER_SOURCES.recalls2026, ['25V855000', '26V018000', '26V192000']);
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints: { complaints2025, complaints2026 }, recalls: { recalls2025, recalls2026 } }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
