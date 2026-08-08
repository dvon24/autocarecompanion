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
} = require('./build-lexus-lx-adjudication');

const SECONDARY_PATTERNS = Object.freeze({
  ahcLeakReport: [/2010 Lexus LX570 AHC Failure Fluid Leak/i, /line running across the left framerail was ruptured/i, /Cause:\s*Corrosion/i, /components don(?:['’]|&#0?39;)t need replacing/i],
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
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('LX communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('LX recall inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error(`LX campaign inventory drift: ${campaigns.join(',')}`);
  const head = result.relevantCommunications.find((row) => row.id === '10251079');
  const brakes = result.relevantCommunications.find((row) => row.id === '11016785');
  if (!head || !/software update/i.test(head.summary) || !/head unit/i.test(head.summary)) throw new Error('L-SB-0006-23 inventory boundary drift');
  if (!brakes || !/front brake/i.test(brakes.summary) || !/squeal/i.test(brakes.summary)) throw new Error('L-SB-0036-24 inventory boundary drift');
  const recallsByCampaign = new Map(result.recallRows.map((row) => [row.campaign, row]));
  for (const campaign of RECALL_INVENTORY.mappedCampaigns) if (!recallsByCampaign.has(campaign)) throw new Error(`${campaign}: mapped recall missing`);
  const camera = recallsByCampaign.get('25V744000');
  const engine = recallsByCampaign.get('25V767000');
  const occupant = recallsByCampaign.get('26V180000');
  if (!/rearview|back over prevention/i.test(`${camera?.component} ${camera?.summary} ${camera?.consequence}`)) throw new Error('25V744 camera boundary drift');
  if (!/engine|bearing|stall|drive power/i.test(`${engine?.component} ${engine?.summary} ${engine?.consequence}`)) throw new Error('25V767 engine boundary drift');
  if (!/occupant|air bag|seat/i.test(`${occupant?.component} ${occupant?.summary} ${occupant?.consequence}`)) throw new Error('26V180 occupant boundary drift');
  return {
    communicationCounts: result.communicationCounts,
    communicationTotal: result.communicationTotal,
    recallCounts: result.recallCounts,
    recallTotal: result.recallRows.length,
    campaigns,
    exactCommunicationIds: [head.id, brakes.id],
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
