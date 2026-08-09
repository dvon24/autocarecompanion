/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lincoln-navigator-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lincoln-navigator-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./lincoln-adjudication-utils');

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
async function verifyComplaint(source, expected) {
  const payload = await fetchJson(source.url);
  const complaint = (payload.results || []).find((row) => String(row.odiNumber) === source.odiNumber);
  const summary = complaint?.summary || '';
  if (!complaint || complaint.numberOfInjuries !== expected.injuries || complaint.numberOfDeaths !== expected.deaths || !expected.summary.test(summary)) throw new Error(`${source.odiNumber}: complaint exact-content verification failed`);
  return { url: source.url, odiNumber: complaint.odiNumber, injuries: complaint.numberOfInjuries, deaths: complaint.numberOfDeaths, crash: complaint.crash, fire: complaint.fire, requiredClaimsMatched: true };
}
async function verifyCurrentRecall(source) {
  const payload = await fetchJson(source.url);
  const row = (payload.results || []).find((item) => item.NHTSACampaignNumber === '25V236000');
  if (!row || !/2017-2018 F-150, Expedition, and Lincoln Navigator/i.test(row.Summary || '') || !/front wheel circuit into the brake booster/i.test(row.Summary || '') || !/replace the brake master cylinder/i.test(row.Remedy || '') || !/If the master cylinder is leaking, the brake booster will also be replaced/i.test(row.Remedy || '') || !/free of charge/i.test(row.Remedy || '') || !/25S37/.test(row.Remedy || '')) throw new Error(`${source.url}: current 25V236/25S37 remedy drift`);
  return { url: source.url, campaign: row.NHTSACampaignNumber, component: row.Component, currentRemedyMatched: true };
}
async function verifySparkHtml() {
  const source = OTHER_SOURCES.spark;
  const response = await fetch(source.url, { headers: { accept: 'text/html', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  const body = await response.text();
  const normalized = body.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&reg;|&#174;/gi, '®').replace(/\s+/g, ' ');
  const required = [/2005-2008 Navigator/i, /5\.4L 3-V engine/i, /before 10\/9\/07/i, /ENGINE MUST BE AT ROOM TEMPERATURE/i, /Motorcraft.*Carburetor Tune-Up Cleaner/i, /minimum period of 15 minutes/i, /DO NOT USE AIR OR POWER TOOLS/i, /trained, professional technicians/i, /procedures should not be performed by.*do-it-yourselfers/i];
  if (!response.ok || required.some((pattern) => !pattern.test(normalized))) throw new Error('Ford TSB 08-7-6 exact-content verification failed');
  return { url: source.url, status: response.status, bytes: Buffer.byteLength(body), requiredClaimsMatched: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Navigator inventory drift');
  if (analysis.hvacDefectCommunicationMentions !== 0) throw new Error('unexpected exact HVAC blend-door communication appeared');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  if (Object.keys(pdfs).length !== 8) throw new Error(`expected 8 exact primary PDFs, found ${Object.keys(pdfs).length}`);
  const [air1999, air2003, running2003, running2006, liftgate2018, recall2017, recall2018, sparkHtml] = await Promise.all([
    verifyComplaint(OTHER_SOURCES.air1999, { injuries: 0, deaths: 0, summary: /AIR SUSPENSION COMPRESSOR FAILURE/i }),
    verifyComplaint(OTHER_SOURCES.air2003, { injuries: 0, deaths: 0, summary: /AIR SUSPENSION MOTOR.*REPLACED.*AIR BAGS LEAK.*COLD WEATHER/i }),
    verifyComplaint(OTHER_SOURCES.running2003, { injuries: 1, deaths: 0, summary: /RUNNING BOARDS.*FAIL TO DEPLOY AND\/OR RETRACT/i }),
    verifyComplaint(OTHER_SOURCES.running2006, { injuries: 0, deaths: 0, summary: /SUPPORT POST CORRODING.*MECHANICAL FAILURE/i }),
    verifyComplaint(OTHER_SOURCES.liftgate2018, { injuries: 0, deaths: 0, summary: /LIFTGATE OPENS RANDOMENLY.*CAR WAS STATIONARY/i }),
    verifyCurrentRecall(OTHER_SOURCES.recalls2017), verifyCurrentRecall(OTHER_SOURCES.recalls2018), verifySparkHtml(),
  ]);
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints: { air1999, air2003, running2003, running2006, liftgate2018 }, recalls: { recall2017, recall2018 }, sparkHtml }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
