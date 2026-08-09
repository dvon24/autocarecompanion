/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-mazda-cx-60-sources');
const { OUTPUT, PDF_SOURCES, RECALL_INVENTORY, BULLETIN_INVENTORY, SOURCES } = require('./build-mazda-cx-60-adjudication');
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
async function fetchWithRetries(url, options = {}) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { accept: options.accept || '*/*', 'user-agent': 'au7o-known-issue-source-audit/1.0' }, redirect: 'follow' });
    if (response.ok) return response;
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${url}: status ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
  }
  throw new Error(`${url}: retry loop exhausted`);
}
async function verifyPdf(source) {
  const local = await fs.promises.readFile(source.localPath);
  if (local.length !== source.bytes || hash(local) !== source.sha256 || local.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: local PDF drift`);
  const response = await fetchWithRetries(source.url); const remote = Buffer.from(await response.arrayBuffer());
  if (remote.length !== source.bytes || hash(remote) !== source.sha256 || remote.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${source.title}: remote PDF drift`);
  if (!Array.isArray(source.visualPages) || source.visualPages.length !== source.pages || source.visualPages.some((page, index) => page !== index + 1)) throw new Error(`${source.title}: not every PDF page was visually reviewed`);
  return { url: source.url, bytes: remote.length, sha256: source.sha256, pages: source.pages, visualPages: source.visualPages, localRemoteMatch: true };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.pdfCount !== 5 || analysis.pdfPageCount !== 28) throw new Error('Mazda CX-60 source inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const pdfs = {};
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs[key] = await verifyPdf(source);

  const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  const pdfUrls = new Set(Object.values(PDF_SOURCES).map((source) => source.url));
  const uniqueUrls = [...new Set(packet.rows.flatMap((row) => row.proposal.citations.map((citation) => citation.url)))].filter((url) => !pdfUrls.has(url)).sort();
  const live = [];
  const bodies = new Map();
  for (const url of uniqueUrls) {
    const response = await fetchWithRetries(url);
    const body = await response.text();
    if (body.length < 20) throw new Error(`${url}: unexpectedly empty body`);
    live.push({ url, status: response.status, bytes: Buffer.byteLength(body) });
    bodies.set(url, body);
  }

  assertPattern(bodies.get(SOURCES.batteryCampaign.url), /CX-60|ＣＸ－６０/i, 'Mazda early BCM campaign');
  assertPattern(bodies.get(SOURCES.dpfManual.url), /CX-60|ディーゼル|DPF/i, 'Mazda DPF description');
  assertPattern(bodies.get(SOURCES.dpfWarning.url), /CX-60|15.*20|煤|すす/i, 'Mazda DPF warning instructions');
  assertPattern(bodies.get(SOURCES.refuelManual.url), /CX-60|給油|燃料/i, 'Mazda refueling procedure');
  assertPattern(bodies.get(SOURCES.rideRevision.url), /softer rear spring.*firmer shock absorber/i, 'Mazda UK 2025 chassis revision');
  assertPattern(bodies.get(SOURCES.ar058aRdw.url), /AR058A/i, 'RDW AR058A record');
  assertPattern(bodies.get(SOURCES.ausTransmissionRecall.url), /CX-60|CX60/i, 'Australian CX-60 TCM recall');

  const as007aUrls = packet.rows.find((row) => row.id.endsWith('recall-as007a')).proposal.citations.map((citation) => citation.url).filter((url) => /rdw\.nl/.test(url));
  for (const url of as007aUrls) assertPattern(bodies.get(url), /AS007A|MGP250125|CX-60|CX60/i, `RDW AS007A record ${url}`);

  console.log(JSON.stringify({
    passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs,
    liveCitationCount: live.length + Object.keys(pdfs).length, live,
    evidenceChecks: ['Mazda early BCM campaign', 'Mazda DPF manual and warning instructions', 'Mazda refueling procedure', 'Mazda UK 2025 chassis revision', 'RDW AR058A and AS007A records', 'Australian CX-60 TCM recall'],
  }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
