/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const {
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  DOCUMENTS,
  PDF_SOURCES,
  RECALL_FILES,
  RECALL_INVENTORY,
  SOURCE_FILES,
} = require('./build-land-rover-range-rover-evoque-adjudication');

const aliases = new Set(BULLETIN_INVENTORY.modelAliases);
const patterns = Object.freeze({
  fuel: /fuel pump|fuel rail pressure|high pressure fuel|low pressure fuel|fuel delivery|fuel pressure regulator|P0191/i,
  incontrol: /InControl|infotainment|touch pro|touchscreen|touch screen|IMC\b|navigation.*(?:freeze|reboot|software)|(?:freeze|reboot|software).*navigation/i,
});
const selectedPatterns = Object.freeze({
  haldex: /Haldex|coupling|active driveline|two wheel drive|2 wheel drive|all wheel drive|AWD/i,
  thermostat: /thermostat|coolant pump|coolant leak|coolant.*weep|cooling system leak/i,
});

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
function parseCsv(line) {
  const values = []; let value = ''; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1; } else quoted = !quoted;
    } else if (char === ',' && !quoted) { values.push(value); value = ''; } else value += char;
  }
  values.push(value); return values;
}
async function readLines(file, onLine) {
  const reader = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of reader) onLine(line);
}
async function hashFile(file) {
  const hash = crypto.createHash('sha256');
  await new Promise((resolve, reject) => { const stream = fs.createReadStream(file); stream.on('data', (chunk) => hash.update(chunk)); stream.on('end', resolve); stream.on('error', reject); });
  return hash.digest('hex');
}
async function verifyFiles(files) {
  const results = [];
  for (const source of files) {
    const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path);
    if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`);
    results.push({ period: source.period, bytes: stat.size, sha256 });
  }
  return results;
}
async function verifyCommunications() {
  const periodCounts = {}; const matchedDocuments = Object.fromEntries(Object.keys(patterns).map((key) => [key, new Set()])); const summariesById = new Map();
  for (const source of SOURCE_FILES) {
    let count = 0; let first = true;
    await readLines(source.path, (line) => {
      if (first) { first = false; return; }
      const [documentId, make, model, _modelYear, summary] = parseCsv(line);
      if (make !== 'LAND ROVER' || !aliases.has(model)) return;
      count += 1;
      summariesById.set(documentId, summary);
      for (const [name, pattern] of Object.entries(patterns)) if (pattern.test(summary)) matchedDocuments[name].add(documentId);
    });
    periodCounts[source.period] = count;
  }
  for (const [name, pattern] of Object.entries(selectedPatterns)) {
    matchedDocuments[name] = new Set(DOCUMENTS[name]);
    for (const documentId of DOCUMENTS[name]) {
      const summary = summariesById.get(documentId);
      if (!summary || !pattern.test(summary)) throw new Error(`${name}: selected document ${documentId} missing or irrelevant`);
    }
  }
  for (const documentId of DOCUMENTS.incontrol) if (!matchedDocuments.incontrol.has(documentId)) throw new Error(`incontrol: cited document ${documentId} missing from conservative match set`);
  for (const documentId of DOCUMENTS.fuel) if (!summariesById.has(documentId)) throw new Error(`fuel: cited document ${documentId} missing from complete inventory`);
  const relevantDocumentCounts = Object.fromEntries(Object.entries(matchedDocuments).map(([name, ids]) => [name, ids.size]));
  const totalRows = Object.values(periodCounts).reduce((sum, count) => sum + count, 0);
  if (!equal(periodCounts, BULLETIN_INVENTORY.periodCounts)) throw new Error('manufacturer-communication period-count drift');
  if (!equal(relevantDocumentCounts, BULLETIN_INVENTORY.relevantDocumentCounts)) throw new Error(`manufacturer-communication relevant-count drift: ${JSON.stringify(relevantDocumentCounts)}`);
  if (totalRows !== BULLETIN_INVENTORY.totalRows) throw new Error('manufacturer-communication total drift');
  return { periodCounts, relevantDocumentCounts, totalRows };
}
async function verifyRecalls() {
  const periodCounts = {}; const rows = [];
  for (const source of RECALL_FILES) {
    let count = 0;
    await readLines(source.path, (line) => {
      const fields = line.split('\t');
      if (fields[2] !== 'LAND ROVER' || !aliases.has(fields[3])) return;
      count += 1; rows.push({ campaign: fields[1], model: fields[3], year: fields[4] });
    });
    periodCounts[source.period] = count;
  }
  const campaigns = [...new Set(rows.map((row) => row.campaign))].sort();
  const uniqueCampaignYearModelRows = new Set(rows.map((row) => `${row.campaign}|${row.model}|${row.year}`)).size;
  if (rows.length !== RECALL_INVENTORY.totalRows || uniqueCampaignYearModelRows !== RECALL_INVENTORY.uniqueCampaignYearModelRows) throw new Error('recall row-count drift');
  if (!equal(campaigns, CAMPAIGNS)) throw new Error('recall campaign drift');
  if (!equal(periodCounts, { pre: 0, post: 68 })) throw new Error('recall period-count drift');
  return { periodCounts, totalRows: rows.length, uniqueCampaignYearModelRows, campaignCount: campaigns.length, campaigns };
}
async function verifyPdf(name, expected) {
  const response = await fetch(expected.url);
  if (!response.ok) throw new Error(`${response.status} ${expected.url}`);
  const buffer = Buffer.from(await response.arrayBuffer()); const actualSha256 = crypto.createHash('sha256').update(buffer).digest('hex'); const contentType = response.headers.get('content-type') || '';
  if (actualSha256 !== expected.sha256 || !/application\/pdf/i.test(contentType) || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${name}: PDF/hash mismatch`);
  return { name, url: expected.url, bytes: buffer.length, sha256: actualSha256, contentType };
}
async function fetchJson(url) {
  const response = await fetch(url); if (!response.ok) throw new Error(`${response.status} ${url}`); return response.json();
}
async function verifyCampaign(campaign) {
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`; const body = await fetchJson(url); const text = JSON.stringify(body.results || []);
  if (!body.Count || !new RegExp(campaign, 'i').test(text)) throw new Error(`${campaign}: campaign lookup mismatch`);
  return { campaign, count: body.Count };
}
async function main() {
  const [communicationFiles, recallFiles, communications, recalls] = await Promise.all([verifyFiles(SOURCE_FILES), verifyFiles(RECALL_FILES), verifyCommunications(), verifyRecalls()]);
  const pdfResults = [];
  for (const [name, expected] of Object.entries(PDF_SOURCES)) pdfResults.push(await verifyPdf(name, expected));
  const campaignResults = [];
  for (const campaign of CAMPAIGNS) campaignResults.push(await verifyCampaign(campaign));
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, communications, recalls, pdfResults, campaignResults }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
