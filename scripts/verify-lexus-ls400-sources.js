/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require('node:crypto');
const fs = require('node:fs');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect: inspectInventory } = require('./inspect-lexus-source-inventory');
const { inspect: inspectComplaints } = require('./inspect-lexus-ls400-complaints');
const {
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  COMPLAINT_INVENTORY,
  MODEL_ALIASES,
  PDF_SOURCES,
  RECALL_INVENTORY,
  SECONDARY_SOURCES,
} = require('./build-lexus-ls400-adjudication');

const SECONDARY_PATTERNS = Object.freeze({
  ballJointReport: [/Lower ball joint sheared right off/i, /Lexus Model:\s*['’]?90 Ls400/i],
  ecuRepair: [/Lexus LS400\s*-\s*1990-2000/i, /1997 and earlier models[^<]{0,80}extremely common/i, /depends on the year model of your LS400/i, /not a good first-time soldering project/i],
  oilLeakOverview: [/Lexus LS400 Leaking Oil/i, /valve cover gaskets[^<]{0,100}oil seepage/i, /Proper diagnosis[^<]{0,120}exact cause/i],
  valveCoverReport: [/1998-2000 Valve Cover Gasket Replacement/i, /driver side valve cover gasket has been leaking for a long time/i, /more like a seepage/i],
  starterDiagnosis: [/single[^<]{0,20}click[^<]{0,120}failing starter/i, /starter is located under the intake manifold/i, /hidden fasteners/i, /variable length intake runners[^<]{0,80}fragile/i],
  timingServiceExample: [/Car is a 1996 Lexus LS 400/i, /Timing belt[^<]{0,40}Water pump/i, /Timing belt idler pulley/i, /timing belt tensioner/i],
  steeringReport: [/power steering pump leak/i, /Yes and with alternator failure/i, /power steering leak issues[^<]{0,120}alternator failures/i],
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
  if (!/pdf/i.test(contentType)) throw new Error(`${source.nhtsaDocumentId}: remote content type is ${contentType}`);
  return { url: source.url, documentId: source.nhtsaDocumentId, pages: source.pages, contentType, local, remote };
}
async function verifySecondarySource(key, source) {
  const response = await fetch(source.url, { redirect: 'follow', headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Mozilla/5.0 au7o-known-issue-source-audit/1.0' } });
  if (source.liveAccess === 'reachable-200' && !response.ok) throw new Error(`${key}: expected reachable source, got ${response.status}`);
  if (response.status === 403 && source.liveAccess === 'protected-403-direct-url-reviewed') return { url: source.url, status: 403, protected: true, boundary: source.assertedBoundary };
  if (!response.ok) throw new Error(`${key}: unexpected source status ${response.status}`);
  const body = await response.text();
  for (const pattern of SECONDARY_PATTERNS[key]) if (!pattern.test(body)) throw new Error(`${key}: expected source phrase missing: ${pattern}`);
  return { url: source.url, status: response.status, protected: false, bytes: Buffer.byteLength(body), boundary: source.assertedBoundary };
}
function yearsFor(row) { return String(row.years || '').split(',').map(Number).filter(Number.isFinite); }
async function verifyInventory() {
  const result = await inspectInventory({ aliases: MODEL_ALIASES });
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('LS400 communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('LS400 recall inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error('LS400 campaign inventory drift');
  const overlapping = result.relevantCommunications.filter((row) => yearsFor(row).some((year) => year >= 1990 && year <= 2000));
  if (overlapping.length !== BULLETIN_INVENTORY.overlapping1990To2000Rows) throw new Error('LS400 indexed-year communication count drift');
  const oil = result.relevantCommunications.find((row) => row.id === '10172820');
  if (!oil || !/fluid leak or fluid seep/i.test(oil.summary) || !/repaired accordingly/i.test(oil.summary) || !yearsFor(oil).includes(2000)) throw new Error('L-SB-0002-20 inventory boundary drift');
  const unsupportedMatches = {
    ballJointDefect: overlapping.filter((row) => /lower ball joint[^.!?]{0,100}(?:wear|separat|shear|failure)/i.test(row.summary)),
    ecuCapacitor: overlapping.filter((row) => /(?:ECU|ECM)[^.!?]{0,100}capacitor|capacitor[^.!?]{0,100}(?:ECU|ECM)/i.test(row.summary)),
    starterFailure: overlapping.filter((row) => /starter[^.!?]{0,100}(?:failure|single click|no crank)/i.test(row.summary)),
    timingIntervalOrInterference: overlapping.filter((row) => /timing belt[^.!?]{0,120}(?:90,?000|interval|interference)/i.test(row.summary)),
    steeringLeakToAlternator: overlapping.filter((row) => /power steering[^.!?]{0,120}alternator|alternator[^.!?]{0,120}power steering/i.test(row.summary)),
  };
  for (const [identity, matches] of Object.entries(unsupportedMatches)) if (matches.length) throw new Error(`${identity}: unexpected manufacturer communication found`);
  return {
    communicationCounts: result.communicationCounts,
    communicationTotal: result.communicationTotal,
    overlapping1990To2000Rows: overlapping.length,
    recallCounts: result.recallCounts,
    recallTotal: result.recallRows.length,
    campaigns,
    exactOilDocumentId: oil.id,
    unsupportedMatchCounts: Object.fromEntries(Object.entries(unsupportedMatches).map(([key, matches]) => [key, matches.length])),
  };
}
async function verifyComplaints() {
  const result = await inspectComplaints();
  if (result.total !== COMPLAINT_INVENTORY.totalRows || !equal(result.yearCounts, COMPLAINT_INVENTORY.yearCounts)) throw new Error('LS400 complaint inventory drift');
  const ids = result.matches.powerSteering.map((row) => row.odiNumber);
  if (!equal(ids, COMPLAINT_INVENTORY.powerSteeringLeakReportIds)) throw new Error(`power-steering complaint boundary drift: ${ids.join(',')}`);
  return { total: result.total, yearCounts: result.yearCounts, powerSteeringLeakReportIds: ids, caveat: result.caveat };
}

async function main() {
  const [communicationFiles, recallFiles, inventory, complaints, pdfEntries, secondaryEntries] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    verifyInventory(),
    verifyComplaints(),
    Promise.all(Object.entries(PDF_SOURCES).map(async ([key, source]) => [key, await verifyPdf(source)])),
    Promise.all(Object.entries(SECONDARY_SOURCES).map(async ([key, source]) => [key, await verifySecondarySource(key, source)])),
  ]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, inventory, complaints, pdfs: Object.fromEntries(pdfEntries), secondarySources: Object.fromEntries(secondaryEntries) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = { SECONDARY_PATTERNS, verifyComplaints, verifyInventory, verifyPdf, verifySecondarySource };
