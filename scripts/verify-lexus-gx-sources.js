/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect } = require('./inspect-lexus-source-inventory');
const { BULLETIN_INVENTORY, CAMPAIGNS, MODEL_ALIASES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lexus-gx-adjudication');

function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
async function hashFile(file) { const hash = crypto.createHash('sha256'); await new Promise((resolve, reject) => { const stream = fs.createReadStream(file); stream.on('data', (chunk) => hash.update(chunk)); stream.on('end', resolve); stream.on('error', reject); }); return hash.digest('hex'); }
async function verifyFiles(files) { const results = []; for (const source of files) { const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path); if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`); results.push({ period: source.period, bytes: stat.size, sha256 }); } return results; }
function verifyPdfBuffer(buffer, source, label) { const sha256 = crypto.createHash('sha256').update(buffer).digest('hex'); if (buffer.length !== source.bytes || sha256 !== source.sha256 || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${source.nhtsaDocumentId} ${label}: PDF/hash mismatch`); return { label, bytes: buffer.length, sha256 }; }
async function verifyPdf(source) { const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local'); const response = await fetch(source.url); if (!response.ok) throw new Error(`${response.status} ${source.url}`); const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote'); return { url: source.url, documentId: source.nhtsaDocumentId, pages: source.pages, local, remote, contentType: response.headers.get('content-type') || '' }; }

async function verifyInventory() {
  const result = await inspect({ aliases: MODEL_ALIASES });
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('recall row inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error('recall campaign inventory drift');
  const byId = new Map(result.relevantCommunications.map((row) => [row.id, row]));
  for (const id of BULLETIN_INVENTORY.exactKdssDocumentIds) if (!byId.has(id)) throw new Error(`missing KDSS communication ${id}`);
  if (!byId.has('10143917') || !/air injection pumps|air switching valves/i.test(byId.get('10143917').summary)) throw new Error('GX 460 ZLH communication drift');
  if (!/KDSS|leans to the right/i.test(byId.get('10220210').summary)) throw new Error('GX 460 KDSS communication drift');
  const centerDifferentialMatches = result.relevantCommunications.filter((row) => /center differential|differential lock actuator|transfer case actuator/i.test(row.summary));
  const gx470SecondaryAirMatches = result.relevantCommunications.filter((row) => /^(?:GX 470|GX470)$/.test(row.model) && /air injection|air pump|air switching/i.test(row.summary));
  if (centerDifferentialMatches.length || gx470SecondaryAirMatches.length) throw new Error('unsupported GX identity unexpectedly found');
  return {
    communicationCounts: result.communicationCounts,
    communicationTotal: result.communicationTotal,
    recallCounts: result.recallCounts,
    recallTotal: result.recallRows.length,
    campaigns,
    exactKdssDocumentIds: BULLETIN_INVENTORY.exactKdssDocumentIds,
    centerDifferentialMatches: centerDifferentialMatches.length,
    gx470SecondaryAirMatches: gx470SecondaryAirMatches.length,
  };
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
