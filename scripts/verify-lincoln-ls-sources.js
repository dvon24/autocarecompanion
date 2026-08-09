/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lincoln-ls-sources');
const { BULLETIN_INVENTORY, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lincoln-ls-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./lincoln-adjudication-utils');
function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
async function verifyFiles(files) { const out = []; for (const source of files) { const buffer = await fs.promises.readFile(source.path); if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`); out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 }); } return out; }
function verifyPdfBuffer(buffer, source, label) { const sha256 = hash(buffer); if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-')) || buffer.length !== source.bytes || sha256 !== source.sha256) throw new Error(`${source.title} ${label}: PDF/hash mismatch`); return { label, bytes: buffer.length, sha256 }; }
async function verifyPdf(source) { const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local'); const response = await fetch(source.url, { headers: { accept: 'application/pdf', 'user-agent': 'au7o-known-issue-source-audit/1.0' } }); if (!response.ok) throw new Error(`${source.url}: status ${response.status}`); const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote'); return { url: source.url, pages: source.pages, visualPages: source.visualPages, contentType: response.headers.get('content-type') || '', local, remote }; }
async function verifyTsbHtml() { const source = PDF_SOURCES.tsb; const response = await fetch(source.htmlUrl, { headers: { accept: 'text/html', 'user-agent': 'au7o-known-issue-source-audit/1.0' } }); const body = await response.text(); const required = ['TSB 01-21-11', '2001-2002 LS', 'P1285', 'P1299', 'Hydraulic Cooling Fan', 'XW4Z-8K621-AA']; if (!response.ok || required.some((text) => !body.includes(text))) throw new Error('Ford TSB HTML failed exact-content verification'); return { url: source.htmlUrl, status: response.status, bytes: Buffer.byteLength(body), requiredStrings: required }; }
async function main() {
  const analysis = await analyze(); if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount || analysis.coolantCrossoverCommunicationMentions !== 0) throw new Error('LS inventory drift');
  const [communicationFiles, recallFiles, pdfPairs, tsbHtml] = await Promise.all([verifyFiles(SOURCE_FILES), verifyFiles(RECALL_FILES), Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])), verifyTsbHtml()]);
  const pdfs = Object.fromEntries(pdfPairs); const liveStaticLinks = Object.values(pdfs).map((pdf) => ({ url: pdf.url, status: 200, bytes: pdf.remote.bytes, sha256: pdf.remote.sha256 }));
  if (liveStaticLinks.length !== 3) throw new Error(`expected three exact Ford PDFs, found ${liveStaticLinks.length}`);
  console.log(JSON.stringify({ passed: true, inventory: { communicationCounts: analysis.communicationCounts, communicationTotal: analysis.communicationTotal, recallCounts: analysis.recallCounts, recallTotal: analysis.recallTotal, campaignCount: analysis.campaignCount, coolantCrossoverCommunicationMentions: analysis.coolantCrossoverCommunicationMentions, citationVerdicts: analysis.verdictCounts }, communicationFiles, recallFiles, tsbHtml, pdfs, liveStaticLinkCount: liveStaticLinks.length, liveStaticLinks }, null, 2));
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
