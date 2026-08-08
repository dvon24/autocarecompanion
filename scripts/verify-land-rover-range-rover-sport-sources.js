/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { BULLETIN_INVENTORY, CAMPAIGNS, CANDIDATE_DOCUMENT_COUNTS, DOCUMENTS, MAPPED_CAMPAIGNS, PDF_SOURCES, RECALL_FILES, RECALL_INVENTORY, SOURCE_FILES } = require('./build-land-rover-range-rover-sport-adjudication');
const aliases = new Set(BULLETIN_INVENTORY.modelAliases);
const patterns = Object.freeze({
  air: /air suspension|suspension compressor|valve block|ride height|vehicle height|C1A20|C1A13/i,
  crankExact: /crankshaft position|crank position|\bCKP\b/i,
  dpf: /diesel particulate|\bDPF\b|regeneration|particulate filter/i,
  transferActuatorOrChainExact: /transfer (?:case|box)[^.]{0,100}(?:actuator|chain)|(?:actuator|chain)[^.]{0,100}transfer (?:case|box)/i,
  valveBodyOrMechatronicExact: /valve body|mechatronic/i,
  hybrid48v: /48V|48 volt|mild hybrid|MHEV|DC-DC|DCDC|battery energy control module|BECM/i,
  piviNewGeneration: /Pivi|infotainment|touch pro|touchscreen|touch screen|IMC\b|black screen|screen.*blank|display.*blank/i,
  camera: /rearview camera|rear view camera|rear camera|360.degree|surround view|camera.*(?:image|display|unavailable)|(?:image|display).*camera/i,
  water: /water intrusion|water ingress|water leak|tailgate.*(?:seal|water|leak)|rear.*(?:seal|water ingress|water leak)|cargo.*(?:damp|water|leak)/i,
});
const selected = Object.freeze({ epbFrozen: { ids: DOCUMENTS.epb, pattern: /electric park brake|\bEPB\b|park brake/i }, rearDifferentialPinion: { ids: DOCUMENTS.rearDiff, pattern: /differential pinion oil seal/i } });
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
function parseCsv(line) { const values = []; let value = ''; let quoted = false; for (let index = 0; index < line.length; index += 1) { const char = line[index]; if (char === '"') { if (quoted && line[index + 1] === '"') { value += '"'; index += 1; } else quoted = !quoted; } else if (char === ',' && !quoted) { values.push(value); value = ''; } else value += char; } values.push(value); return values; }
async function readLines(file, onLine) { const reader = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity }); for await (const line of reader) onLine(line); }
async function hashFile(file) { const hash = crypto.createHash('sha256'); await new Promise((resolve, reject) => { const stream = fs.createReadStream(file); stream.on('data', (chunk) => hash.update(chunk)); stream.on('end', resolve); stream.on('error', reject); }); return hash.digest('hex'); }
async function verifyFiles(files) { const results = []; for (const source of files) { const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path); if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`); results.push({ period: source.period, bytes: stat.size, sha256 }); } return results; }
async function verifyCommunications() {
  const periodCounts = {}; const matched = Object.fromEntries(Object.keys(patterns).map((key) => [key, new Set()])); const summariesById = new Map();
  for (const source of SOURCE_FILES) {
    let count = 0; let first = true;
    await readLines(source.path, (line) => { if (first) { first = false; return; } const [documentId, make, model, modelYear, summary] = parseCsv(line); if (make !== 'LAND ROVER' || !aliases.has(model)) return; count += 1; summariesById.set(documentId, summary); for (const [name, pattern] of Object.entries(patterns)) { if (name === 'piviNewGeneration' && !/(?:^|,)202[345](?:,|$)/.test(modelYear)) continue; if (pattern.test(summary)) matched[name].add(documentId); } });
    periodCounts[source.period] = count;
  }
  for (const [name, value] of Object.entries(selected)) { matched[name] = new Set(value.ids); for (const documentId of value.ids) { const summary = summariesById.get(documentId); if (!summary || !value.pattern.test(summary)) throw new Error(`${name}: selected document ${documentId} missing or irrelevant`); } }
  for (const ids of Object.values(DOCUMENTS)) for (const documentId of ids) if (!summariesById.has(documentId)) throw new Error(`cited document ${documentId} missing from complete inventory`);
  const candidateDocumentCounts = Object.fromEntries(Object.entries(matched).map(([name, ids]) => [name, ids.size])); const totalRows = Object.values(periodCounts).reduce((sum, count) => sum + count, 0);
  if (!equal(periodCounts, BULLETIN_INVENTORY.periodCounts) || totalRows !== BULLETIN_INVENTORY.totalRows) throw new Error('manufacturer-communication total drift');
  if (!equal(candidateDocumentCounts, CANDIDATE_DOCUMENT_COUNTS)) throw new Error(`candidate-count drift: ${JSON.stringify(candidateDocumentCounts)}`);
  return { periodCounts, candidateDocumentCounts, totalRows };
}
async function verifyRecalls() {
  const periodCounts = {}; const rows = [];
  for (const source of RECALL_FILES) { let count = 0; await readLines(source.path, (line) => { const fields = line.split('\t'); if (fields[2] !== 'LAND ROVER' || !aliases.has(fields[3])) return; count += 1; rows.push({ campaign: fields[1], model: fields[3], year: fields[4] }); }); periodCounts[source.period] = count; }
  const campaigns = [...new Set(rows.map((row) => row.campaign))].sort(); const uniqueCampaignYearModelRows = new Set(rows.map((row) => `${row.campaign}|${row.model}|${row.year}`)).size;
  if (rows.length !== RECALL_INVENTORY.totalRows || uniqueCampaignYearModelRows !== RECALL_INVENTORY.uniqueCampaignYearModelRows || !equal(campaigns, CAMPAIGNS) || !equal(periodCounts, { pre: 9, post: 541 })) throw new Error('recall inventory drift');
  return { periodCounts, totalRows: rows.length, uniqueCampaignYearModelRows, campaignCount: campaigns.length, campaigns };
}
async function verifyPdf(name, expected) { const response = await fetch(expected.url); if (!response.ok) throw new Error(`${response.status} ${expected.url}`); const buffer = Buffer.from(await response.arrayBuffer()); const sha256 = crypto.createHash('sha256').update(buffer).digest('hex'); const contentType = response.headers.get('content-type') || ''; if (buffer.length !== expected.bytes || sha256 !== expected.sha256 || !/application\/pdf/i.test(contentType) || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${name}: PDF/hash mismatch`); return { name, url: expected.url, bytes: buffer.length, sha256, contentType }; }
async function fetchJson(url) { const response = await fetch(url); if (!response.ok) throw new Error(`${response.status} ${url}`); return response.json(); }
async function verifyCampaign(campaign) { const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`; const body = await fetchJson(url); const text = JSON.stringify(body.results || []); if (!body.Count || !new RegExp(campaign, 'i').test(text)) throw new Error(`${campaign}: campaign lookup mismatch`); const sportRows = (body.results || []).filter((row) => row.Make === 'LAND ROVER' && row.Model === 'RANGE ROVER SPORT'); if (!sportRows.length) throw new Error(`${campaign}: Range Rover Sport campaign row missing`); if (campaign === '24V678000' && !sportRows.some((row) => /Near Field Sensing Module|3D surround camera/i.test(JSON.stringify(row)))) throw new Error('24V678 mapped scope mismatch'); if (campaign === '26V248000' && !sportRows.some((row) => /DC-DC converter|loss of 12-Volt system charging/i.test(JSON.stringify(row)))) throw new Error('26V248 mapped scope mismatch'); return { campaign, count: body.Count, sportRows: sportRows.length, mapped: MAPPED_CAMPAIGNS.some((item) => item.campaignNumber === campaign) }; }
async function main() {
  const [communicationFiles, recallFiles, communications, recalls] = await Promise.all([verifyFiles(SOURCE_FILES), verifyFiles(RECALL_FILES), verifyCommunications(), verifyRecalls()]);
  const pdfResults = []; for (const [name, expected] of Object.entries(PDF_SOURCES)) pdfResults.push(await verifyPdf(name, expected));
  const campaignResults = []; for (const campaign of CAMPAIGNS) campaignResults.push(await verifyCampaign(campaign));
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, communications, recalls, pdfResults, campaignResults }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
