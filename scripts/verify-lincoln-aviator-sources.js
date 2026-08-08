/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lincoln-aviator-sources');
const { COMPLAINT_SOURCES, PDF_SOURCES, BULLETIN_INVENTORY, RECALL_INVENTORY } = require('./build-lincoln-aviator-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./lincoln-adjudication-utils');

function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
async function verifyFiles(files) { const out = []; for (const source of files) { const buffer = await fs.promises.readFile(source.path); if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`); out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 }); } return out; }
function verifyPdfBuffer(buffer, source, label) { const sha256 = hash(buffer); if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-')) || buffer.length !== source.bytes || sha256 !== source.sha256) throw new Error(`${source.title} ${label}: PDF/hash mismatch`); return { label, bytes: buffer.length, sha256 }; }
async function verifyPdf(source) { const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local'); const response = await fetch(source.url, { headers: { accept: 'application/pdf', 'user-agent': 'au7o-known-issue-source-audit/1.0' } }); if (!response.ok) throw new Error(`${source.url}: status ${response.status}`); const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote'); return { url: source.url, pages: source.pages, contentType: response.headers.get('content-type') || '', local, remote }; }
async function verifyComplaint(source) {
  const response = await fetch(source.url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.odiNumber}: status ${response.status}`);
  const body = await response.json();
  const row = (body.results || []).find((item) => Number(item.odiNumber) === source.odiNumber);
  const vehicles = row?.products || [];
  const exactVehicle = vehicles.some((vehicle) => Number(vehicle.productYear) === source.year
    && /^LINCOLN$/i.test(vehicle.productMake || '')
    && /^AVIATOR$/i.test(vehicle.productModel || ''));
  if (!row || !exactVehicle) throw new Error(`${source.odiNumber}: complaint identity drift`);
  return { odiNumber: source.odiNumber, year: source.year, components: row.components || '', summarySha256: hash(Buffer.from(row.summary || '')) };
}
async function verifyAllStaticLinks(analysis) { const urls = [...new Set(analysis.checks.filter((check) => /^https:\/\/static\.nhtsa\.gov\/.*\.pdf$/i.test(check.url)).map((check) => check.url))]; const results = []; for (let index = 0; index < urls.length; index += 6) { const batch = await Promise.all(urls.slice(index, index + 6).map(async (url) => { const response = await fetch(url, { headers: { accept: 'application/pdf', 'user-agent': 'au7o-known-issue-source-audit/1.0' } }); const buffer = Buffer.from(await response.arrayBuffer()); if (!response.ok || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${url}: not a live PDF (${response.status})`); return { url, status: response.status, bytes: buffer.length, sha256: hash(buffer) }; })); results.push(...batch); } return results; }

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Aviator inventory drift');
  const [communicationFiles, recallFiles, pdfPairs, complaints, liveStaticLinks] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])),
    Promise.all(Object.values(COMPLAINT_SOURCES).map(verifyComplaint)),
    verifyAllStaticLinks(analysis),
  ]);
  console.log(JSON.stringify({ passed: true, inventory: { communicationCounts: analysis.communicationCounts, communicationTotal: analysis.communicationTotal, recallCounts: analysis.recallCounts, recallTotal: analysis.recallTotal, campaignCount: analysis.campaignCount, citationVerdicts: analysis.verdictCounts }, communicationFiles, recallFiles, pdfs: Object.fromEntries(pdfPairs), complaints, liveStaticLinkCount: liveStaticLinks.length, liveStaticLinks }, null, 2));
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
