/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lincoln-mkx-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lincoln-mkx-adjudication');
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
async function verifyRoofComplaint() {
  const source = OTHER_SOURCES.roofComplaint;
  const localBuffer = fs.readFileSync(source.localPath);
  if (localBuffer.length !== source.bytes || hash(localBuffer) !== source.sha256) throw new Error('local MKX complaint export drift');
  const response = await fetch(source.url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.url}: status ${response.status}`);
  const payload = await response.json();
  const complaint = (payload.results || []).find((row) => String(row.odiNumber) === '11083747');
  if (!complaint || complaint.dateOfIncident !== '03/15/2018' || complaint.crash !== false || complaint.fire !== false || complaint.numberOfInjuries !== 0 || complaint.numberOfDeaths !== 0 || !/VISTA GLASS.*IMPLODED/i.test(complaint.summary || '')) throw new Error('NHTSA complaint 11083747 content drift');
  return { url: source.url, status: response.status, resultCount: payload.count, odiNumber: complaint.odiNumber, dateOfIncident: complaint.dateOfIncident, crash: complaint.crash, fire: complaint.fire, injuries: complaint.numberOfInjuries, deaths: complaint.numberOfDeaths, localBytes: localBuffer.length, localSha256: hash(localBuffer) };
}
async function verifyTakataAdvisory() {
  const source = OTHER_SOURCES.takataDnd;
  const response = await fetch(source.url, { headers: { accept: 'text/html', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  const body = await response.text();
  const required = ['Do Not Drive', '2007-2010 Lincoln MKX', '16V384', '17V024', '18V046', '19V001', 'non-desiccated Takata air bags'];
  if (!response.ok || required.some((text) => !body.includes(text))) throw new Error('NHTSA Takata Do Not Drive advisory failed exact-content verification');
  return { url: source.url, status: response.status, bytes: Buffer.byteLength(body), requiredStrings: required };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('MKX inventory drift');
  if (analysis.waterPumpCommunicationMentions !== 0 || analysis.roofShatterCommunicationMentions !== 0) throw new Error('unexpected exact water-pump or roof-shatter communication appeared');
  const [communicationFiles, recallFiles, pdfPairs, roofComplaint, takataAdvisory] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])),
    verifyRoofComplaint(),
    verifyTakataAdvisory(),
  ]);
  const pdfs = Object.fromEntries(pdfPairs);
  if (Object.keys(pdfs).length !== 11) throw new Error(`expected eleven exact primary PDFs, found ${Object.keys(pdfs).length}`);
  console.log(JSON.stringify({
    passed: true,
    inventory: { communicationCounts: analysis.communicationCounts, communicationTotal: analysis.communicationTotal, recallCounts: analysis.recallCounts, recallTotal: analysis.recallTotal, campaignCount: analysis.campaignCount, waterPumpCommunicationMentions: analysis.waterPumpCommunicationMentions, roofShatterCommunicationMentions: analysis.roofShatterCommunicationMentions, citationVerdicts: analysis.verdictCounts },
    communicationFiles,
    recallFiles,
    pdfs,
    roofComplaint,
    takataAdvisory,
  }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
