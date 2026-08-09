/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-lincoln-town-car-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lincoln-town-car-adjudication');
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
async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${url}: status ${response.status}`);
  return response.json();
}
async function verifyComplaint(source, summaryPattern) {
  const payload = await fetchJson(source.url);
  const complaint = (payload.results || []).find((row) => String(row.odiNumber) === source.odiNumber);
  const summary = complaint?.summary || '';
  if (!complaint || !summaryPattern.test(summary)) throw new Error(`${source.odiNumber}: complaint exact-content verification failed`);
  return { url: source.url, odiNumber: complaint.odiNumber, injuries: complaint.numberOfInjuries, deaths: complaint.numberOfDeaths, crash: complaint.crash, fire: complaint.fire, requiredClaimsMatched: true };
}
async function verifyCurrentRecall(source) {
  const payload = await fetchJson(source.url);
  const row = (payload.results || []).find((item) => item.NHTSACampaignNumber === '13V385000');
  if (!row || !/2005-2011 Ford Crown Victoria.*Mercury Grand Marquis, and Lincoln Town Car/i.test(row.Summary || '') || !/severe corrosion.*lower intermediate shaft/i.test(row.Summary || '') || !/loss of steering/i.test(`${row.Summary || ''} ${row.Consequence || ''}`) || !/replace the lower intermediate shaft/i.test(row.Remedy || '') || !/upper intermediate shaft.*will be inspected/i.test(row.Remedy || '') || !/free of charge/i.test(row.Remedy || '') || !/13S08/.test(row.Remedy || '')) throw new Error(`${source.url}: current 13V385/13S08 record drift`);
  return { url: source.url, campaign: row.NHTSACampaignNumber, component: row.Component, currentRemedyMatched: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Town Car inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  if (Object.keys(pdfs).length !== 4) throw new Error(`expected 4 exact primary PDFs, found ${Object.keys(pdfs).length}`);
  const [air2003, air2008, hvac2008, lcm2000, lcm2003, intake2000, rack2003, window2000, recall2008] = await Promise.all([
    verifyComplaint(OTHER_SOURCES.air2003, /REAR AIR SUSPENSION.*HIGHER HEIGHT AND WOULD NOT LOWER/i),
    verifyComplaint(OTHER_SOURCES.air2008, /CHECK AIR SUSPENSION.*PASSENGER AND DRIVER SIDE AIR BAGS/i),
    verifyComplaint(OTHER_SOURCES.hvac2008, /PLASTIC SHEETING.*DEFROSTER VENTS, FAN, BLEND DOOR, AND HEATER/i),
    verifyComplaint(OTHER_SOURCES.lcm2000, /LIGHT CONTOL MODULE DEFECTIVE.*LIGHTS TO TURN OFF/i),
    verifyComplaint(OTHER_SOURCES.lcm2003, /HEADLIGHTS WOULD FLICKER.*CROWN VIC.*GRAND MARQUIS/i),
    verifyComplaint(OTHER_SOURCES.intake2000, /COOLANT LEAKING.*INTAKE MANIFOLD ASSEMBLY WAS FRACTURED/i),
    verifyComplaint(OTHER_SOURCES.rack2003, /POWER STEERING FAILED.*RACK AND PINION.*FAILED INTERNALLY/i),
    verifyComplaint(OTHER_SOURCES.window2000, /POWER WINDOWS WOULD GET STUCK.*NOT GO UP OR DOWN/i),
    verifyCurrentRecall(OTHER_SOURCES.recalls2008),
  ]);
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints: { air2003, air2008, hvac2008, lcm2000, lcm2003, intake2000, rack2003, window2000 }, recalls: { recall2008 } }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
