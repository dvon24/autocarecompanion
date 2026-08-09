/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lucid-air-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lucid-air-adjudication');
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
  const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${url}: status ${response.status}`);
  return response.json();
}
async function verifyComplaint(source, summaryPattern) {
  const payload = await fetchJson(source.url);
  const complaint = (payload.results || []).find((row) => String(row.odiNumber) === source.odiNumber);
  const summary = complaint?.summary || '';
  if (!complaint || !summaryPattern.test(summary)) throw new Error(`${source.odiNumber}: complaint exact-content verification failed`);
  return { url: source.url, odiNumber: complaint.odiNumber, injuries: complaint.numberOfInjuries, deaths: complaint.numberOfDeaths, crash: complaint.crash, fire: complaint.fire, requiredClaimsMatched: true };
}
async function verifyCurrentRecall(source) {
  const payload = await fetchJson(source.url);
  const row = (payload.results || []).find((item) => item.NHTSACampaignNumber === '24V495000');
  if (!row || !/2022-2024 Air vehicles/i.test(row.Summary || '') || !/high voltage coolant heater.*fail to defrost the windshield/i.test(row.Summary || '') || !/warning to the driver/i.test(row.Remedy || '') || !/coolant heaters that fail will be replaced/i.test(row.Remedy || '') || !/free of charge/i.test(row.Remedy || '') || !/SR-24-04-0/.test(row.Remedy || '')) throw new Error(`${source.url}: current 24V495/SR-24-04-0 record drift`);
  return { url: source.url, campaign: row.NHTSACampaignNumber, component: row.Component, currentRemedyMatched: true };
}
async function verifyLucidCharging(source) {
  const response = await fetch(source.url, { headers: { accept: 'text/html', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.url}: status ${response.status}`);
  const html = await response.text();
  const normalized = html.replace(/\\u0026/g, '&').replace(/\\u0027/g, "'");
  const patterns = [/plugging your Lucid Air in whenever you aren.t using it/i, /Charge Port Lights/i, /White \(solid\).*Ready to charge/is, /Green \(solid\).*Charging complete/is, /Red \(solid\).*Charging error/is, /Unplugging and plugging in again helps resolve most charging errors/i];
  const missing = patterns.filter((pattern) => !pattern.test(normalized)).map(String);
  if (missing.length) throw new Error(`${source.url}: current Lucid charging guidance drift: ${missing.join(', ')}`);
  return { url: source.url, bytes: Buffer.byteLength(html), guidanceMatched: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Lucid Air inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  if (Object.keys(pdfs).length !== 2) throw new Error(`expected 2 exact primary PDFs, found ${Object.keys(pdfs).length}`);
  const [wake2024, battery2022, heat2023, screen2024, recall2022, lucidCharging] = await Promise.all([
    verifyComplaint(OTHER_SOURCES.complaints2024Wake, /take about 30 seconds to unlock\/awake/i),
    verifyComplaint(OTHER_SOURCES.complaints2022, /main EV battery or the 12V accessory battery/i),
    verifyComplaint(OTHER_SOURCES.complaints2023Heat, /heater became inoperable.*Battery Critically Low/is),
    verifyComplaint(OTHER_SOURCES.complaints2024Screen, /screens would often black out every 30 seconds/i),
    verifyCurrentRecall(OTHER_SOURCES.recalls2022),
    verifyLucidCharging(OTHER_SOURCES.lucidCharging),
  ]);
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints: { wake2024, battery2022, heat2023, screen2024 }, recalls: { recall2022 }, manufacturerGuidance: { lucidCharging } }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
