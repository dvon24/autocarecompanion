/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require('node:crypto');
const fs = require('node:fs');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect: inspectInventory } = require('./inspect-lexus-source-inventory');
const { BULLETIN_INVENTORY, CAMPAIGNS, MODEL_ALIASES, PDF_SOURCES, RECALL_INVENTORY, SECONDARY_SOURCES } = require('./build-lexus-rc-adjudication');

const SECONDARY_PATTERNS = Object.freeze({
  batteryReport: [/RC350 is loosing power after a park it/i, /battery is recent/i],
  brakeReport: [/OEM Brakes question/i, /pedal and the steering wheel shake/i],
  currentRattleDiscussion: [/Interior creaks\s*&\s*rattles/i, /console lid did rattle/i],
  rearRattleReport: [/Terrible rattle/i, /rear parcel shelf|rear speaker/i],
});
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
function hashBuffer(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
async function hashFile(file) { return hashBuffer(await fs.promises.readFile(file)); }
async function verifyFiles(files) {
  const results = [];
  for (const source of files) {
    const stat = fs.statSync(source.path);
    const sha256 = await hashFile(source.path);
    if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`);
    results.push({ period: source.period, bytes: stat.size, sha256 });
  }
  return results;
}
function verifyPdfBuffer(buffer, source, label) {
  const sha256 = hashBuffer(buffer);
  if (buffer.length !== source.bytes || sha256 !== source.sha256 || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${source.nhtsaDocumentId} ${label}: PDF/hash mismatch`);
  return { label, bytes: buffer.length, sha256 };
}
async function verifyPdf(source) {
  const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local');
  const response = await fetch(source.url, { headers: { accept: 'application/pdf', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${source.nhtsaDocumentId}: remote PDF returned ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote');
  if (!/(?:pdf|octet-stream)/i.test(contentType)) throw new Error(`${source.nhtsaDocumentId}: remote content type is ${contentType}`);
  return { url: source.url, documentId: source.nhtsaDocumentId, pages: source.pages, contentType, local, remote };
}
async function verifySecondarySource(key, source) {
  const response = await fetch(source.url, { redirect: 'follow', headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Mozilla/5.0 au7o-known-issue-source-audit/1.0' } });
  if (source.liveAccess === 'reachable-200' && !response.ok) throw new Error(`${key}: expected reachable source, got ${response.status}`);
  if (response.status === 403 && source.liveAccess === 'protected-403-direct-url-reviewed') return { url: source.url, status: 403, protected: true, boundary: source.assertedBoundary };
  if (!response.ok) throw new Error(`${key}: unexpected source status ${response.status}`);
  const body = await response.text();
  for (const pattern of SECONDARY_PATTERNS[key] || []) if (!pattern.test(body)) throw new Error(`${key}: expected source phrase missing: ${pattern}`);
  return { url: source.url, status: response.status, protected: false, bytes: Buffer.byteLength(body), boundary: source.assertedBoundary };
}
async function verifyInventory() {
  const result = await inspectInventory({ aliases: MODEL_ALIASES });
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('RC communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('RC recall inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error(`RC campaign inventory drift: ${campaigns.join(',')}`);
  const find = (id) => result.relevantCommunications.find((row) => row.id === id);
  const dcm = find('10220152');
  const injection = find('10152276');
  const multimedia = find('11018326');
  if (!dcm || !/Safety Connect operator/i.test(dcm.summary) || !/hear each other/i.test(dcm.summary)) throw new Error('22LC01 inventory boundary drift');
  if (!injection || !/Direct Injection active test to Port Injection active test/i.test(injection.summary)) throw new Error('L-TT-0193-15 inventory boundary drift');
  if (!multimedia || !/MMR data|audio related concerns/i.test(multimedia.summary)) throw new Error('L-TT-0341-25 inventory boundary drift');
  if (RECALL_INVENTORY.mappedCampaigns.length !== 0 || RECALL_INVENTORY.deferredCampaigns.length !== CAMPAIGNS.length) throw new Error('RC recall partition drift');
  return { communicationCounts: result.communicationCounts, communicationTotal: result.communicationTotal, recallCounts: result.recallCounts, recallTotal: result.recallRows.length, campaigns, exactCommunicationIds: [injection.id, dcm.id, multimedia.id], mappedCampaigns: RECALL_INVENTORY.mappedCampaigns };
}
async function main() {
  const [communicationFiles, recallFiles, inventory, pdfEntries, secondaryEntries] = await Promise.all([
    verifyFiles(SOURCE_FILES), verifyFiles(RECALL_FILES), verifyInventory(),
    Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])),
    Promise.all(Object.entries(SECONDARY_SOURCES).map(async ([key, source]) => [key, await verifySecondarySource(key, source)])),
  ]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, inventory, pdfs: Object.fromEntries(pdfEntries), secondarySources: Object.fromEntries(secondaryEntries) }, null, 2));
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { SECONDARY_PATTERNS, verifyInventory, verifyPdf, verifySecondarySource };
