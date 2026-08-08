/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const {
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  RECALL_FILES,
  RECALL_INVENTORY,
  SOURCE_FILES,
} = require('./build-land-rover-range-rover-adjudication');

const aliases = new Set(BULLETIN_INVENTORY.modelAliases);
const patterns = Object.freeze({
  airSpring: /air spring|air suspension|suspension height|vehicle height|corner valve|reservoir valve|C1A20|C1A13/i,
  compressor: /air suspension compressor|compressor.*suspension|suspension.*compressor|Hitachi|Dunlop|AMK/i,
  battery: /battery drain|parasitic|quiescent|sleep mode|state of charge|battery.*discharg|discharg.*battery/i,
  piviOrInfotainment: /Pivi|infotainment|touchscreen|touch screen|black screen|display.*blank|screen.*blank|IMC\b/i,
  roofOrWater: /sunroof|roof opening|roof panel|water ingress|water leak|drain tube|roof drain/i,
  supercharger: /supercharger|nose cone|snout|coupler/i,
  timing: /timing chain|chain tensioner|chain guide|cold start rattle|LTB00473/i,
});

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}

function equal(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

function parseCsv(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { values.push(value); value = ''; }
    else value += char;
  }
  values.push(value);
  return values;
}

async function readLines(file, onLine) {
  const reader = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of reader) onLine(line);
}

async function hashFile(file) {
  const hash = crypto.createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', resolve);
    stream.on('error', reject);
  });
  return hash.digest('hex');
}

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

async function verifyCommunications() {
  const periodCounts = {};
  const aliasCounts = {};
  const matchedDocuments = Object.fromEntries(Object.keys(patterns).map((key) => [key, new Set()]));
  for (const source of SOURCE_FILES) {
    let count = 0;
    let first = true;
    await readLines(source.path, (line) => {
      if (first) { first = false; return; }
      const [documentId, make, model, _modelYear, summary] = parseCsv(line);
      if (make !== 'LAND ROVER' || !aliases.has(model)) return;
      count += 1;
      aliasCounts[model] = (aliasCounts[model] || 0) + 1;
      for (const [name, pattern] of Object.entries(patterns)) if (pattern.test(summary)) matchedDocuments[name].add(documentId);
    });
    periodCounts[source.period] = count;
  }
  const relevantDocumentCounts = Object.fromEntries(Object.entries(matchedDocuments).map(([name, ids]) => [name, ids.size]));
  const totalRows = Object.values(periodCounts).reduce((sum, count) => sum + count, 0);
  if (!equal(periodCounts, BULLETIN_INVENTORY.periodCounts)) throw new Error('manufacturer-communication period-count drift');
  if (!equal(aliasCounts, BULLETIN_INVENTORY.aliasCounts)) throw new Error('manufacturer-communication alias-count drift');
  if (!equal(relevantDocumentCounts, BULLETIN_INVENTORY.relevantDocumentCounts)) throw new Error('manufacturer-communication relevant-count drift');
  if (totalRows !== BULLETIN_INVENTORY.totalRows) throw new Error('manufacturer-communication total drift');
  return { periodCounts, aliasCounts, relevantDocumentCounts, totalRows };
}

async function verifyRecalls() {
  const periodCounts = {};
  const rows = [];
  for (const source of RECALL_FILES) {
    let count = 0;
    await readLines(source.path, (line) => {
      const fields = line.split('\t');
      if (fields[2] !== 'LAND ROVER' || !aliases.has(fields[3])) return;
      count += 1;
      rows.push({ campaign: fields[1], model: fields[3], year: fields[4] });
    });
    periodCounts[source.period] = count;
  }
  const campaigns = [...new Set(rows.map((row) => row.campaign))].sort();
  const uniqueCampaignYearModelRows = new Set(rows.map((row) => `${row.campaign}|${row.model}|${row.year}`)).size;
  if (rows.length !== RECALL_INVENTORY.totalRows || uniqueCampaignYearModelRows !== RECALL_INVENTORY.uniqueCampaignYearModelRows) throw new Error('recall row-count drift');
  if (!equal(campaigns, CAMPAIGNS)) throw new Error('recall campaign drift');
  if (!equal(periodCounts, { pre: 51, post: 453 })) throw new Error('recall period-count drift');
  return { periodCounts, totalRows: rows.length, uniqueCampaignYearModelRows, campaignCount: campaigns.length, campaigns };
}

async function verifyLandingPage(url) {
  const response = await fetch(url);
  if (!response.ok || !/text\/html/i.test(response.headers.get('content-type') || '')) throw new Error(`${response.status} ${url}`);
  return { url, status: response.status, contentType: response.headers.get('content-type') };
}

async function main() {
  const [communicationFiles, recallFiles, communications, recalls, landingPages] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    verifyCommunications(),
    verifyRecalls(),
    Promise.all([BULLETIN_INVENTORY.source, RECALL_INVENTORY.source].map(verifyLandingPage)),
  ]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, communications, recalls, landingPages }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
