/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require('node:crypto');
const fs = require('node:fs');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect: inspectInventory } = require('./inspect-lexus-source-inventory');
const { BULLETIN_INVENTORY, CAMPAIGNS, MODEL_ALIASES, PDF_SOURCES, RECALL_INVENTORY, SECONDARY_SOURCES } = require('./build-lexus-rx-adjudication');

const SECONDARY_PATTERNS = Object.freeze({
  evaporatorReport: [/evaporator core/i, /8-9 hours|8 to 9 hours/i],
  brakeReport: [/crunchy/i, /brake pedal/i],
  adasReport: [/system malfunction/i, /rain|Pre Collision/i],
  infotainmentReport: [/Infotainment System Bugs/i, /CarPlay|Android Auto/i],
  powerSteeringRx300: [/power steering fluid/i, /pressure hose|return line/i],
  powerSteeringRx330: [/Power Steering Hose Leak 2006 RX 330/i, /fluid level was low/i],
  rearMainReport: [/What is leaking/i, /rear main seal/i],
  steeringShaftReport: [/Popping and Clunking in Steering Wheel/i, /intermediate shaft/i],
  earlyTransmissionReport: [/U140E Transmission Woes/i, /metal|debris/i],
});
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
function hashBuffer(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
async function hashFile(file) { return hashBuffer(await fs.promises.readFile(file)); }
async function verifyFiles(files) { const results = []; for (const source of files) { const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path); if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`); results.push({ period: source.period, bytes: stat.size, sha256 }); } return results; }
function verifyPdfBuffer(buffer, source, label) { const sha256 = hashBuffer(buffer); if (buffer.length !== source.bytes || sha256 !== source.sha256 || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${source.nhtsaDocumentId} ${label}: PDF/hash mismatch`); return { label, bytes: buffer.length, sha256 }; }
async function verifyPdf(source) { const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local'); const response = await fetch(source.url, { headers: { accept: 'application/pdf', 'user-agent': 'au7o-known-issue-source-audit/1.0' } }); if (!response.ok) throw new Error(`${source.nhtsaDocumentId}: remote PDF returned ${response.status}`); const contentType = response.headers.get('content-type') || ''; const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote'); if (!/(?:pdf|octet-stream)/i.test(contentType)) throw new Error(`${source.nhtsaDocumentId}: remote content type is ${contentType}`); return { url: source.url, documentId: source.nhtsaDocumentId, pages: source.pages, contentType, local, remote }; }
async function verifySecondarySource(key, source) { const response = await fetch(source.url, { redirect: 'follow', headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Mozilla/5.0 au7o-known-issue-source-audit/1.0' } }); if (source.liveAccess === 'reachable-200' && !response.ok) throw new Error(`${key}: expected reachable source, got ${response.status}`); if (response.status === 403 && source.liveAccess === 'protected-403-direct-url-reviewed') return { url: source.url, status: 403, protected: true, boundary: source.assertedBoundary }; if (!response.ok) throw new Error(`${key}: unexpected source status ${response.status}`); const body = await response.text(); for (const pattern of SECONDARY_PATTERNS[key] || []) if (!pattern.test(body)) throw new Error(`${key}: expected source phrase missing: ${pattern}`); return { url: source.url, status: response.status, protected: false, bytes: Buffer.byteLength(body), boundary: source.assertedBoundary }; }
async function verifyInventory() {
  const result = await inspectInventory({ aliases: MODEL_ALIASES });
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('RX communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('RX recall inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort(); if (!equal(campaigns, CAMPAIGNS)) throw new Error(`RX campaign inventory drift: ${campaigns.join(',')}`);
  const find = (id) => result.relevantCommunications.find((row) => row.id === id);
  const shift = find('11015507'); const mmr = find('11018325'); const transmission = find('10166041'); const pump = find('10183269'); const rack = find('10133733');
  if (!shift || !/battery voltage drops below 10V/i.test(shift.summary) || !/Shift System Malfunction/i.test(shift.summary)) throw new Error('RX shift-warning boundary drift');
  if (!mmr || !/MMR data|audio related concerns/i.test(mmr.summary)) throw new Error('RX MMR boundary drift');
  if (!transmission || !/bucking feeling/i.test(transmission.summary) || !/ECM.*logic has been modified/i.test(transmission.summary)) throw new Error('RX transmission bulletin boundary drift');
  if (!pump || !/water pump leak inspection/i.test(pump.summary)) throw new Error('RX water-pump bulletin boundary drift');
  if (!rack || !/steering rack leak/i.test(rack.summary)) throw new Error('RX steering-rack bulletin boundary drift');
  if (RECALL_INVENTORY.mappedCampaigns.length !== 0 || RECALL_INVENTORY.deferredCampaigns.length !== CAMPAIGNS.length) throw new Error('RX recall partition drift');
  return { communicationCounts: result.communicationCounts, communicationTotal: result.communicationTotal, recallCounts: result.recallCounts, recallTotal: result.recallRows.length, campaigns, exactCommunicationIds: [rack.id, transmission.id, pump.id, shift.id, mmr.id], mappedCampaigns: RECALL_INVENTORY.mappedCampaigns };
}
async function main() { const [communicationFiles, recallFiles, inventory, pdfEntries, secondaryEntries] = await Promise.all([verifyFiles(SOURCE_FILES), verifyFiles(RECALL_FILES), verifyInventory(), Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])), Promise.all(Object.entries(SECONDARY_SOURCES).map(async ([key, source]) => [key, await verifySecondarySource(key, source)]))]); console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, inventory, pdfs: Object.fromEntries(pdfEntries), secondarySources: Object.fromEntries(secondaryEntries) }, null, 2)); }
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { SECONDARY_PATTERNS, verifyInventory, verifyPdf, verifySecondarySource };
