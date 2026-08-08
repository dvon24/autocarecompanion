/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect } = require('./inspect-lexus-source-inventory');
const { BULLETIN_INVENTORY, CAMPAIGNS, IDS, MAPPED_CAMPAIGNS, MODEL_ALIASES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lexus-ls-adjudication');

function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
async function hashFile(file) { const hash = crypto.createHash('sha256'); await new Promise((resolve, reject) => { const stream = fs.createReadStream(file); stream.on('data', (chunk) => hash.update(chunk)); stream.on('end', resolve); stream.on('error', reject); }); return hash.digest('hex'); }
async function verifyFiles(files) { const results = []; for (const source of files) { const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path); if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`); results.push({ period: source.period, bytes: stat.size, sha256 }); } return results; }
function verifyPdfBuffer(buffer, source, label) { const sha256 = crypto.createHash('sha256').update(buffer).digest('hex'); if (buffer.length !== source.bytes || sha256 !== source.sha256 || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${source.nhtsaDocumentId} ${label}: PDF/hash mismatch`); return { label, bytes: buffer.length, sha256 }; }
function verifyDynamicPdfBuffer(buffer, source, label) { const sha256 = crypto.createHash('sha256').update(buffer).digest('hex'); if (buffer.length < 10000 || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${source.nhtsaDocumentId} ${label}: generated PDF invalid`); return { label, bytes: buffer.length, sha256, dynamicallyGenerated: true }; }
function fetchPressKit(source) { const result = spawnSync('curl.exe', ['-L','--fail','--silent','--show-error','--max-time','60',source.url], { encoding: null, maxBuffer: 20 * 1024 * 1024 }); if (result.status !== 0) throw new Error(`curl ${source.url}: ${String(result.stderr || '').trim()}`); return result.stdout; }
async function verifyPdf(source) {
  const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local');
  let remoteBuffer;
  let contentType = '';
  if (source.nhtsaDocumentId === 'lexus-pressroom-60319') remoteBuffer = fetchPressKit(source);
  else { const response = await fetch(source.url); if (!response.ok) throw new Error(`${response.status} ${source.url}`); remoteBuffer = Buffer.from(await response.arrayBuffer()); contentType = response.headers.get('content-type') || ''; }
  const remote = source.nhtsaDocumentId === 'lexus-pressroom-60319' ? verifyDynamicPdfBuffer(remoteBuffer, source, 'remote') : verifyPdfBuffer(remoteBuffer, source, 'remote');
  return { url: source.url, documentId: source.nhtsaDocumentId, pages: source.pages, local, remote, contentType };
}
function yearsFor(row) { return String(row.years || '').split(',').map(Number).filter(Number.isFinite); }
function overlaps(row, start, end) { return yearsFor(row).some((year) => year >= start && year <= end); }

async function verifyInventory() {
  const result = await inspect({ aliases: MODEL_ALIASES });
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('recall row inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error('recall campaign inventory drift');
  const byId = new Map(result.relevantCommunications.map((row) => [row.id, row]));
  for (const id of BULLETIN_INVENTORY.exactSourceDocumentIds) if (!byId.has(id)) throw new Error(`missing LS communication ${id}`);
  if (!/air leak in the shock absorber seal/i.test(byId.get('10143930').summary)) throw new Error('2018 air-strut boundary drift');
  if (!/bent front height adjustment sensor bracket/i.test(byId.get('10129945').summary) || !/towed incorrectly/i.test(byId.get('10129945').summary)) throw new Error('2018 height-sensor boundary drift');
  if (!/Apple CarPlay and Amazon Alexa/i.test(byId.get('10162736').summary) || !/Display screen frozen/i.test(byId.get('10159733').summary) || !/Poor map screen touch operation|Navigation system reset/i.test(byId.get('10202451').summary)) throw new Error('LS infotainment source boundary drift');
  const lamp = result.recallRows.find((row) => row.campaign === '09E012000' && row.model === 'LS' && row.year === '2001');
  if (!lamp || !/COMBINATION CORNER AND BUMPER LAMP ASSEMBLIES/i.test(lamp.summary) || !/OFFER A FULL REFUND/i.test(lamp.remedy) || !/AFTERMARKET REPLACEMENT EQUIPMENT/i.test(lamp.notes)) throw new Error('09E-012 field boundary drift');
  const airbag = result.recallRows.find((row) => row.campaign === '06V096000' && row.model === 'LS' && row.year === '2004');
  if (!airbag || !/INSUFFICIENT AMOUNT OF THE HEATING AGENTS/i.test(airbag.summary) || !/REPLACE THE SPECIFIC SRS AIR BAG/i.test(airbag.remedy) || !/LEXUS RECALL NO\. 6LB/i.test(airbag.notes)) throw new Error('06V-096 field boundary drift');
  const strictGaps = {
    priorAirSuspension: result.relevantCommunications.filter((row) => overlaps(row, 2007, 2017) && (/(air suspension|air strut|air spring).*(leak|failure|low|sag)|(leak|failure|low|sag).*(air suspension|air strut|air spring)/i.test(row.summary))),
    priorHeadlightLeveling: result.relevantCommunications.filter((row) => overlaps(row, 2007, 2017) && (/(headlight|headlamp|AFS).*(level sensor|leveling sensor|height sensor)|(level sensor|leveling sensor|height sensor).*(headlight|headlamp|AFS)/i.test(row.summary))),
    touchpadHardware: result.relevantCommunications.filter((row) => /touchpad|remote touch.*failure|touchscreen retrofit|retrofit.*touchscreen/i.test(row.summary)),
  };
  for (const [identity, matches] of Object.entries(strictGaps)) if (matches.length) throw new Error(`unsupported ${identity} identity unexpectedly found`);
  return { communicationCounts: result.communicationCounts, communicationTotal: result.communicationTotal, recallCounts: result.recallCounts, recallTotal: result.recallRows.length, campaigns, mappedCampaigns: MAPPED_CAMPAIGNS, exactSourceDocumentIds: BULLETIN_INVENTORY.exactSourceDocumentIds, strictGapCounts: Object.fromEntries(Object.entries(strictGaps).map(([key, matches]) => [key, matches.length])), recallFieldChecks: { [IDS.lamps]: '09E012000:2001', [IDS.airbag]: '06V096000:2004' } };
}

async function main() {
  const pdfEntries = Object.entries(PDF_SOURCES);
  const [communicationFiles, recallFiles, inventory, pdfResults] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    verifyInventory(),
    Promise.all(pdfEntries.map(async ([key, source]) => [key, await verifyPdf(source)])),
  ]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, inventory, pdfs: Object.fromEntries(pdfResults) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
