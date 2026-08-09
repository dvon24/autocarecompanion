/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lincoln-mkz-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lincoln-mkz-adjudication');
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
async function verifyComplaint(source, expected) {
  const response = await fetch(source.url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.url}: status ${response.status}`);
  const payload = await response.json();
  const complaint = (payload.results || []).find((row) => String(row.odiNumber) === source.odiNumber);
  if (!complaint || complaint.numberOfInjuries !== 0 || complaint.numberOfDeaths !== 0 || !expected.test(complaint.summary || '')) throw new Error(`complaint ${source.odiNumber} exact-content drift`);
  return { url: source.url, odiNumber: complaint.odiNumber, incidentDate: complaint.dateOfIncident, injuries: complaint.numberOfInjuries, deaths: complaint.numberOfDeaths, summaryMatched: true };
}
async function verifyTakataAdvisory() {
  const response = await fetch(OTHER_SOURCES.takataDnd.url, { headers: { accept: 'text/html', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  const body = await response.text();
  const required = ['Do Not Drive','2006-2012 Lincoln','Lincoln MKZ','16V384','17V024','18V046','19V001','non-desiccated Takata air bags'];
  if (!response.ok || required.some((value) => !body.includes(value))) throw new Error('Takata advisory exact-content verification failed');
  return { url: OTHER_SOURCES.takataDnd.url, status: response.status, bytes: Buffer.byteLength(body), requiredStrings: required };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('MKZ inventory drift');
  if (analysis.roofCommunicationMentions !== 0 || analysis.waterPumpCommunicationMentions !== 0) throw new Error('unexpected exact roof or water-pump communication appeared');
  const [communicationFiles, recallFiles, pdfPairs, roof2014, roof2015, takataAdvisory] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])),
    verifyComplaint(OTHER_SOURCES.roof2014, /PANORAMIC SUNROOF.*SHATTERED|SUNROOF.*SHATTERED/i),
    verifyComplaint(OTHER_SOURCES.roof2015, /ROOF.*SHATTERED|SUNROOF.*SHATTERED/i),
    verifyTakataAdvisory(),
  ]);
  const pdfs = Object.fromEntries(pdfPairs);
  if (Object.keys(pdfs).length !== 10) throw new Error(`expected ten exact primary PDFs, found ${Object.keys(pdfs).length}`);
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, roofComplaints: [roof2014, roof2015], takataAdvisory }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
