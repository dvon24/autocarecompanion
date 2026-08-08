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
} = require('./build-land-rover-freelander-adjudication');

const aliases = new Set(BULLETIN_INVENTORY.modelAliases);
const patterns = Object.freeze({
  fuel: /fuel pump|fuel pressure|fuel starvation|fuel level|fuel sender|\bno[- ]start\b|\bstall(?:ing|ed|s)?\b/i,
  rearDifferential: /rear differential|rear drive|pinion seal|output seal|haldex|coupling|oil leak|fluid leak/i,
  headGasket: /head gasket|cylinder head|coolant.*oil|oil.*coolant|overheat|thermostat|water pump/i,
  irdOrVcu: /intermediate reduction|\bIRD\b|viscous coupling|\bVCU\b|transfer case|driveline|drive train|final drive/i,
  window: /window regulator|window.*drop|glass.*drop|door glass|electric window|power window/i,
});

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
  if (JSON.stringify(periodCounts) !== JSON.stringify(BULLETIN_INVENTORY.periodCounts)) throw new Error('manufacturer-communication period-count drift');
  if (JSON.stringify(aliasCounts) !== JSON.stringify(BULLETIN_INVENTORY.aliasCounts)) throw new Error('manufacturer-communication alias-count drift');
  if (JSON.stringify(relevantDocumentCounts) !== JSON.stringify(BULLETIN_INVENTORY.relevantDocumentCounts)) throw new Error('manufacturer-communication relevant-count drift');
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
  if (JSON.stringify(campaigns) !== JSON.stringify([...CAMPAIGNS])) throw new Error('recall campaign drift');
  if (periodCounts.pre !== 15 || periodCounts.post !== 9) throw new Error('recall period-count drift');
  return { periodCounts, totalRows: rows.length, uniqueCampaignYearModelRows, campaigns };
}

async function verifyCampaignApi(campaign) {
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const body = await response.json();
  if (!body.Count || !(body.results || []).some((row) => row.NHTSACampaignNumber === campaign && row.Make === 'LAND ROVER')) throw new Error(`${campaign}: campaign API mismatch`);
  return { campaign, count: body.Count };
}

async function main() {
  const [communicationFiles, recallFiles, communications, recalls, campaignResults] = await Promise.all([
    verifyFiles(SOURCE_FILES),
    verifyFiles(RECALL_FILES),
    verifyCommunications(),
    verifyRecalls(),
    Promise.all(CAMPAIGNS.map(verifyCampaignApi)),
  ]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, communications, recalls, campaignResults }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
