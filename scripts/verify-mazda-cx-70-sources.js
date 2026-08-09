/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-mazda-cx-70-sources');
const {
  BULLETIN_INVENTORY,
  OTHER_SOURCES,
  PDF_SOURCES,
  RECALL_INVENTORY,
} = require('./build-mazda-cx-70-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./mazda-adjudication-utils');

function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function results(payload) { return payload.results || payload.Results || []; }
function assertPattern(value, pattern, label) {
  if (!pattern.test(value || '')) throw new Error(`${label}: content drift`);
}

async function verifyFiles(files) {
  const out = [];
  for (const source of files) {
    const buffer = await fs.promises.readFile(source.path);
    if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`);
    out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 });
  }
  return out;
}

async function fetchWithRetries(url, options = {}) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      headers: { accept: options.accept || '*/*', 'user-agent': 'au7o-known-issue-source-audit/1.0' },
    });
    if (response.ok) return response;
    if (![400, 429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${url}: status ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
  }
  throw new Error(`${url}: retry loop exhausted`);
}

async function verifyPdf(source) {
  const local = await fs.promises.readFile(source.localPath);
  if (local.length !== source.bytes || hash(local) !== source.sha256 || local.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: local PDF drift`);
  const response = await fetchWithRetries(source.url);
  const remote = Buffer.from(await response.arrayBuffer());
  if (remote.length !== source.bytes || hash(remote) !== source.sha256 || remote.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: remote PDF drift`);
  if (!Array.isArray(source.visualPages) || source.visualPages.length !== source.pages || source.visualPages.some((page, index) => page !== index + 1)) throw new Error(`${source.title}: not every PDF page was visually reviewed`);
  return { url: source.url, bytes: remote.length, sha256: source.sha256, pages: source.pages, visualPages: source.visualPages, localRemoteMatch: true };
}

async function fetchJson(url) {
  const response = await fetchWithRetries(url, { accept: 'application/json' });
  return JSON.parse(await response.text());
}

async function verifyComplaint(source, id, patterns) {
  const payload = await fetchJson(source.url);
  const row = results(payload)[0];
  const text = JSON.stringify(row || {});
  assertPattern(text, new RegExp(id), `${id} complaint identifier`);
  for (const [label, pattern] of patterns) assertPattern(text, pattern, `${id} ${label}`);
  return { url: source.url, odiNumber: row.odiNumber, product: row.products?.[0], verifiedPatterns: patterns.map(([label]) => label) };
}

async function verifyHtml(source, patterns) {
  const response = await fetchWithRetries(source.url, { accept: 'text/html' });
  const body = await response.text();
  for (const [label, pattern] of patterns) assertPattern(body, pattern, `${source.title} ${label}`);
  return { url: source.url, bytes: Buffer.byteLength(body), verifiedPatterns: patterns.map(([label]) => label) };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed || analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount || analysis.pdfPageCount !== 52 || analysis.visuallyReviewedPages !== 52) throw new Error('Mazda CX-70 inventory gate failed');

  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);

  const complaints = {
    suddenAcceleration: await verifyComplaint(OTHER_SOURCES.suddenAcceleration, '11631266', [
      ['involuntary acceleration', /Involuntary acceleration/i],
      ['1-5 mph', /1-5 mph/i],
      ['different driver', /different driver/i],
    ]),
    heatTrim: await verifyComplaint(OTHER_SOURCES.heatTrim, '11671136', [
      ['window pillar trim', /window pillar trim/i],
      ['Inline-6 emblem', /In-Line 6 emblem/i],
      ['90 degrees', /90 degrees/i],
    ]),
    water: await verifyComplaint(OTHER_SOURCES.water, '11632568', [
      ['forward ceiling', /forward ceiling/i],
      ['interior light control panel', /interior light control panel/i],
      ['stream of water', /stream of water/i],
    ]),
    phantomBraking: await verifyComplaint(OTHER_SOURCES.phantomBraking, '11736754', [
      ['automatic braking', /automatic braking/i],
      ['parking garage', /parking garage/i],
      ['four-way stop', /four-way stop/i],
    ]),
    hybridWarning: await verifyComplaint(OTHER_SOURCES.hybridWarning, '11740990', [
      ['hybrid warning', /Hybrid System Malfunction/i],
      ['while driving', /while driving/i],
    ]),
    hybridPowerLoss: await verifyComplaint(OTHER_SOURCES.hybridPowerLoss, '11698488', [
      ['recall update completed', /update was completed/i],
      ['lost motive power', /lost motive power/i],
      ['turned off', /turned off/i],
    ]),
  };

  const manuals = {
    sbsManual: await verifyHtml(OTHER_SOURCES.sbsManual, [
      ['Smart Brake Support', /Smart Brake Support/i],
      ['do not rely completely', /Do not rely completely on the SBS/i],
      ['mis-operation boundary', /turn the SBS off to prevent a mis-operation/i],
    ]),
    sbsOperation: await verifyHtml(OTHER_SOURCES.sbsOperation, [
      ['may not operate normally', /may not operate normally/i],
      ['may operate without a collision target', /the forward detection function may operate/i],
    ]),
    radarManual: await verifyHtml(OTHER_SOURCES.radarManual, [
      ['radar sensor', /radar sensor/i],
      ['clean or inspect', /clean|dirt|foreign matter|inspect/i],
    ]),
    chargeManual: await verifyHtml(OTHER_SOURCES.chargeManual, [
      ['charging not possible', /Charging is not possible|charging may not be possible/i],
      ['Park selector', /selector lever.*P|shift.*P|Park/i],
      ['red indicator', /red/i],
    ]),
    chargeProcedure: await verifyHtml(OTHER_SOURCES.chargeProcedure, [
      ['charging procedure', /Charging Procedure|charging/i],
      ['indicator', /indicator/i],
    ]),
    phevModes: await verifyHtml(OTHER_SOURCES.phevModes, [
      ['EV mode', /EV mode/i],
      ['engine operation', /engine.*start|starts the engine|engine may/i],
    ]),
  };

  const result = {
    passed: true,
    inventory: analysis,
    communicationFiles,
    recallFiles,
    pdfs,
    complaints,
    manuals,
  };

  if (process.argv.includes('--compact')) {
    console.log(JSON.stringify({
      passed: result.passed,
      communicationTotal: analysis.communicationTotal,
      recallTotal: analysis.recallTotal,
      campaignCount: analysis.campaignCount,
      pdfCount: Object.keys(pdfs).length,
      pdfPageCount: analysis.pdfPageCount,
      visuallyReviewedPages: analysis.visuallyReviewedPages,
      complaintCount: Object.keys(complaints).length,
      manualCount: Object.keys(manuals).length,
    }, null, 2));
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
