/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lincoln-nautilus-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lincoln-nautilus-adjudication');
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
async function verifyComplaint() {
  const source = OTHER_SOURCES.roofComplaint;
  const response = await fetch(source.url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.url}: status ${response.status}`);
  const payload = await response.json();
  const complaint = (payload.results || []).find((row) => String(row.odiNumber) === source.odiNumber);
  const text = complaint?.summary || '';
  if (!complaint || complaint.numberOfInjuries !== 0 || complaint.numberOfDeaths !== 0 || !/water leaking.*moonroof/i.test(text) || !/drains were clogged/i.test(text) || !/reoccurred/i.test(text)) throw new Error('roof complaint exact-content verification failed');
  return { url: source.url, odiNumber: complaint.odiNumber, incidentDate: complaint.dateOfIncident, injuries: complaint.numberOfInjuries, deaths: complaint.numberOfDeaths, requiredClaimsMatched: true };
}
async function verifyCurrentRecalls() {
  const source = OTHER_SOURCES.recalls2024;
  const response = await fetch(source.url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.url}: status ${response.status}`);
  const payload = await response.json();
  const rows = new Map((payload.results || []).map((row) => [row.NHTSACampaignNumber, row]));
  const expected = ['25V337000','25V343000','26V165000'];
  if (expected.some((campaign) => !rows.has(campaign))) throw new Error('current Nautilus recall API campaign drift');
  if (!/over-the-air \(OTA\) update/i.test(rows.get('25V337000').Remedy || '')) throw new Error('25V337 current remedy drift');
  if (!/threaded blanking plug/i.test(rows.get('25V343000').Remedy || '') || !/remove the block heater electrical cord/i.test(rows.get('25V343000').Remedy || '')) throw new Error('25V343 current remedy drift');
  if (!/Image Processing Module A software will be updated/i.test(rows.get('26V165000').Remedy || '')) throw new Error('26V165 current remedy drift');
  return { url: source.url, campaigns: expected, currentRemediesMatched: true };
}
async function verifyOwnerManual() {
  const source = OTHER_SOURCES.startStopOwner;
  const response = await fetch(source.url, { headers: { accept: 'text/html', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  const body = await response.text();
  const normalized = body.replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ');
  const required = [/Shift to P, Restart Engine/i, /If this remains inactive after an ignition cycle/i, /same specification as the original/i];
  if (!response.ok || required.some((pattern) => !pattern.test(normalized))) throw new Error('owner-manual Auto Start-Stop exact-content verification failed');
  return { url: source.url, status: response.status, bytes: Buffer.byteLength(body), requiredClaimsMatched: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Nautilus inventory drift');
  if (analysis.roofDefectCommunicationMentions !== 0) throw new Error('unexpected exact roof-defect communication appeared');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  if (Object.keys(pdfs).length !== 19) throw new Error(`expected 19 exact primary PDFs, found ${Object.keys(pdfs).length}`);
  const [roofComplaint, currentRecalls, ownerManual] = await Promise.all([verifyComplaint(), verifyCurrentRecalls(), verifyOwnerManual()]);
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, roofComplaint, currentRecalls, ownerManual }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
