/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require('node:crypto');
const fs = require('node:fs');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect: inspectInventory } = require('./inspect-lexus-source-inventory');
const {
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  MODEL_ALIASES,
  PDF_SOURCES,
  RECALL_INVENTORY,
  SECONDARY_SOURCES,
} = require('./build-lexus-nx-adjudication');

const SECONDARY_PATTERNS = Object.freeze({
  nx350hComparison: [/NX:\s*350 versus 350h/i, /dreaded drone of consistent high rpms/i],
  nx350hAcceleration: [/Noise When Accelerating from Eco to Power Mode/i, /I have a NX 350H/i],
});

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
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
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('NX communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('NX recall inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error(`NX campaign inventory drift: ${campaigns.join(',')}`);
  const oldNavigation = result.relevantCommunications.find((row) => row.id === '10132881');
  const carPlay = result.relevantCommunications.find((row) => row.id === '10161514');
  const newNavigation = result.relevantCommunications.find((row) => row.id === '10202451');
  if (!oldNavigation || !/2016 model year/i.test(oldNavigation.summary) || !/NX 200t\/300h/i.test(oldNavigation.summary)) throw new Error('L-SB-0035-15 inventory boundary drift');
  if (!carPlay || !/Apple CarPlay/i.test(carPlay.summary) || !/damage to the head unit/i.test(carPlay.summary)) throw new Error('L-SB-0028-19 inventory boundary drift');
  if (!newNavigation || !/Poor map screen touch operation/i.test(newNavigation.summary) || !/Touch pad feedback/i.test(newNavigation.summary)) throw new Error('L-SB-0043-19 inventory boundary drift');
  if (RECALL_INVENTORY.mappedCampaigns.length !== 0 || RECALL_INVENTORY.deferredCampaigns.length !== CAMPAIGNS.length) throw new Error('NX recall partition drift');
  return {
    communicationCounts: result.communicationCounts,
    communicationTotal: result.communicationTotal,
    recallCounts: result.recallCounts,
    recallTotal: result.recallRows.length,
    campaigns,
    exactCommunicationIds: [oldNavigation.id, carPlay.id, newNavigation.id],
    mappedCampaigns: RECALL_INVENTORY.mappedCampaigns,
  };
}

async function main() {
  const [communicationFiles, recallFiles, inventory, pdfEntries, secondaryEntries] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    verifyInventory(),
    Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])),
    Promise.all(Object.entries(SECONDARY_SOURCES).map(async ([key, source]) => [key, await verifySecondarySource(key, source)])),
  ]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, inventory, pdfs: Object.fromEntries(pdfEntries), secondarySources: Object.fromEntries(secondaryEntries) }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });

module.exports = { SECONDARY_PATTERNS, verifyInventory, verifyPdf, verifySecondarySource };
