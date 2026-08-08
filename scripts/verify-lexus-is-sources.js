/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect } = require('./inspect-lexus-source-inventory');
const { BULLETIN_INVENTORY, CAMPAIGNS, MAPPED_CAMPAIGNS, MODEL_ALIASES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lexus-is-adjudication');

function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
async function hashFile(file) { const hash = crypto.createHash('sha256'); await new Promise((resolve, reject) => { const stream = fs.createReadStream(file); stream.on('data', (chunk) => hash.update(chunk)); stream.on('end', resolve); stream.on('error', reject); }); return hash.digest('hex'); }
async function verifyFiles(files) { const results = []; for (const source of files) { const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path); if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`); results.push({ period: source.period, bytes: stat.size, sha256 }); } return results; }
function verifyPdfBuffer(buffer, source, label) { const sha256 = crypto.createHash('sha256').update(buffer).digest('hex'); if (buffer.length !== source.bytes || sha256 !== source.sha256 || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${source.nhtsaDocumentId} ${label}: PDF/hash mismatch`); return { label, bytes: buffer.length, sha256 }; }
async function verifyPdf(source) { const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local'); const response = await fetch(source.url); if (!response.ok) throw new Error(`${response.status} ${source.url}`); const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote'); return { url: source.url, documentId: source.nhtsaDocumentId, pages: source.pages, local, remote, contentType: response.headers.get('content-type') || '' }; }
function yearsFor(row) { return String(row.years || '').split(',').map(Number).filter(Number.isFinite); }
function overlaps(row, start, end) { return yearsFor(row).some((year) => year >= start && year <= end); }

async function verifyInventory() {
  const result = await inspect({ aliases: MODEL_ALIASES });
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('recall row inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error('recall campaign inventory drift');
  for (const campaign of MAPPED_CAMPAIGNS) if (!result.recallRows.some((row) => row.campaign === campaign && /FUEL PUMP/i.test(row.component))) throw new Error(`missing mapped fuel campaign ${campaign}`);
  const byId = new Map(result.relevantCommunications.map((row) => [row.id, row]));
  for (const id of [...BULLETIN_INVENTORY.exactDashboardDocumentIds, ...BULLETIN_INVENTORY.exactFuelDocumentIds, ...BULLETIN_INVENTORY.exactAdasCalibrationDocumentIds, ...BULLETIN_INVENTORY.exactBallJointDocumentIds, ...BULLETIN_INVENTORY.exactEarlierRearBrakeDocumentIds]) if (!byId.has(id)) throw new Error(`missing communication ${id}`);
  if (!/ball joint inspection/i.test(byId.get('10000251').summary) || !/target placement|radar tips/i.test(byId.get('10202453').summary) || !/rear brake calipers|brake pads may make noise/i.test(byId.get('10028044').summary)) throw new Error('exact IS source-summary boundary drift');
  const rows = result.relevantCommunications;
  const strictGaps = {
    alternator: rows.filter((row) => overlaps(row, 2001, 2005) && /alternator|charging system|charging loss/i.test(row.summary)),
    carbon: rows.filter((row) => overlaps(row, 2016, 2022) && /carbon buildup|carbon deposit|intake valve.*carbon|walnut blast/i.test(row.summary)),
    door: rows.filter((row) => overlaps(row, 2023, 2025) && /(door trim|inner garnish|speaker).*(rattle|buzz|noise)|(rattle|buzz|noise).*(door trim|speaker)/i.test(row.summary)),
    display: rows.filter((row) => overlaps(row, 2001, 2005) && /(LCD|pixel|climate.*display|radio display)/i.test(row.summary)),
    adas: rows.filter((row) => overlaps(row, 2023, 2025) && /(pre-collision|forward collision|radar|camera).*(warning|unavailable|false|calibrat|aim)|(warning|unavailable|false).*(pre-collision|radar|camera)/i.test(row.summary)),
    brake: rows.filter((row) => overlaps(row, 2023, 2025) && /(front brake).*(squeal|groan|chirp|noise)|(squeal|groan|chirp).*(front brake)/i.test(row.summary)),
    transmission: rows.filter((row) => overlaps(row, 2014, 2020) && /(harsh|jerk|bump|shock).*(shift|downshift|upshift)|(1-2|2-3).*(shift|bump)|(shift|downshift|upshift).*(harsh|jerk|bump|shock)/i.test(row.summary)),
    valveCover: rows.filter((row) => overlaps(row, 2001, 2005) && /(valve cover|spark plug tube|PCV valve)/i.test(row.summary)),
  };
  for (const [identity, matches] of Object.entries(strictGaps)) if (matches.length) throw new Error(`unsupported ${identity} identity unexpectedly found`);
  return { communicationCounts: result.communicationCounts, communicationTotal: result.communicationTotal, recallCounts: result.recallCounts, recallTotal: result.recallRows.length, campaigns, mappedCampaigns: MAPPED_CAMPAIGNS, strictGapCounts: Object.fromEntries(Object.entries(strictGaps).map(([key, matches]) => [key, matches.length])) };
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
