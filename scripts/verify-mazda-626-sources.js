/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-mazda-626-sources');
const {
  BULLETIN_INVENTORY,
  OTHER_SOURCES,
  PDF_SOURCES,
  RECALL_INVENTORY,
} = require('./build-mazda-626-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./mazda-adjudication-utils');

function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function assertPattern(value, pattern, label) { if (!pattern.test(value || '')) throw new Error(`${label}: content drift`); }

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
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
    const body = await response.text();
    let payload;
    try { payload = JSON.parse(body); } catch { payload = null; }
    if (response.ok) return payload;
    if (![400, 429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${url}: status ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
  }
  throw new Error(`${url}: retry loop exhausted`);
}

async function verifyComplaints(source, patterns) {
  const payload = await fetchJson(source.url);
  const rows = payload.results || payload.Results || [];
  if (!rows.length) throw new Error(`${source.url}: expected current Mazda 626 complaint records`);
  const text = rows.map((row) => `${row.components || row.Components || ''} ${row.summary || row.Summary || ''}`).join('\n');
  for (const [label, pattern] of patterns) assertPattern(text, pattern, label);
  return { url: source.url, count: rows.length, patternsMatched: patterns.map(([label]) => label) };
}

async function verifyRecallApi(source, expectedCampaigns) {
  const payload = await fetchJson(source.url);
  const rows = payload.results || payload.Results || [];
  const campaigns = Object.fromEntries(rows.map((row) => [row.NHTSACampaignNumber || row.nhtsaCampaignNumber, row]));
  for (const campaign of expectedCampaigns) if (!campaigns[campaign]) throw new Error(`${source.url}: missing ${campaign}`);
  if (campaigns['15V674000']) {
    assertPattern(campaigns['15V674000'].Summary || campaigns['15V674000'].summary, /grease.*contact points.*ignition switch.*conductive.*overheat/is, '15V674 summary');
    assertPattern(campaigns['15V674000'].Remedy || campaigns['15V674000'].remedy, /replace the ignition switch.*free of charge/is, '15V674 remedy');
  }
  if (campaigns['98V206001']) {
    assertPattern(campaigns['98V206001'].Summary || campaigns['98V206001'].summary, /external spring.*timing belt tensioner.*break.*timing belt/is, '98V206 summary');
    assertPattern(campaigns['98V206001'].Remedy || campaigns['98V206001'].remedy, /inspect the tensioner and replace it if necessary/is, '98V206 remedy');
  }
  if (campaigns['00V134000']) {
    assertPattern(campaigns['00V134000'].Summary || campaigns['00V134000'].summary, /external spring.*timing belt tensioner.*break/is, '00V134 summary');
    assertPattern(campaigns['00V134000'].Remedy || campaigns['00V134000'].remedy, /check the tensioner installed and replace.*affected tensioner/is, '00V134 remedy');
  }
  return { url: source.url, campaigns: Object.keys(campaigns).sort(), requiredCampaignsMatched: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Mazda 626 inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);
  if (Object.keys(pdfs).length !== 2) throw new Error(`expected 2 exact primary PDFs, found ${Object.keys(pdfs).length}`);

  const complaints = {
    complaints1990: await verifyComplaints(OTHER_SOURCES.complaints1990, [['1990 head-gasket report', /head gasket failed twice/i]]),
    complaints1993: await verifyComplaints(OTHER_SOURCES.complaints1993, [['1993 transmission report', /automatic transmission|transmission shifted/i], ['1993 distributor report', /distributors? within|distributor/i]]),
    complaints1997: await verifyComplaints(OTHER_SOURCES.complaints1997, [['1997 transmission symptom', /transmission.*quit working|overdrive.*flash|O\/D.*flash/is], ['1997 rough-idle symptom', /idles? back and forth|rough idle/is]]),
    complaints1998: await verifyComplaints(OTHER_SOURCES.complaints1998, [['1998 transmission symptom', /transmission.*slipping|O\/D.*flash/is]]),
    complaints2000: await verifyComplaints(OTHER_SOURCES.complaints2000, [['2000 transmission symptom', /transmission failure|stopped shifting/is]]),
    complaints2002: await verifyComplaints(OTHER_SOURCES.complaints2002, [['2002 transmission symptom', /transmission.*slipping|would not shift into gear/is]]),
  };
  const recalls = {
    recalls1997: await verifyRecallApi(OTHER_SOURCES.recalls1997, ['15V674000', '98V206001']),
    recalls1998: await verifyRecallApi(OTHER_SOURCES.recalls1998, ['15V674000', '00V134000']),
  };

  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs, complaints, recalls }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
