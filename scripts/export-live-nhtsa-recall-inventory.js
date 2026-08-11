/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

function resolveRepo(file) {
  return path.resolve(__dirname, '..', file);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchJson(url, attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (response.ok) {
      const body = await response.json();
      if (!body || !Array.isArray(body.results)) throw new Error(`Malformed response: ${url}`);
      return { status: response.status, body };
    }
    if (response.status === 400) return { status: response.status, body: { results: [] } };
    if (attempt === attempts || ![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`NHTSA request failed ${response.status}: ${url}`);
    }
    await wait(750 * attempt);
  }
  throw new Error(`NHTSA request exhausted retries: ${url}`);
}

async function main() {
  const snapshotFile = argValue('--snapshot');
  const model = argValue('--model');
  const sourceMake = argValue('--source-make');
  const outputFile = argValue('--output');
  const minYearValue = argValue('--min-year');
  const minYear = minYearValue ? Number(minYearValue) : null;
  if (!snapshotFile || !model || !sourceMake || !outputFile) {
    throw new Error('--snapshot, --model, --source-make and --output are required');
  }
  const snapshotPath = resolveRepo(snapshotFile);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const rows = snapshot.records.filter((row) => row.model === model);
  const years = [...new Set(rows.flatMap((row) => row.years))]
    .filter((year) => minYear === null || year >= minYear)
    .sort((left, right) => left - right);
  const campaigns = new Map();
  const requests = [];
  for (const year of years) {
    const url = new URL('https://api.nhtsa.gov/recalls/recallsByVehicle');
    url.searchParams.set('make', sourceMake);
    url.searchParams.set('model', model);
    url.searchParams.set('modelYear', String(year));
    const response = await fetchJson(url);
    requests.push({ year, url: url.toString(), status: response.status, count: response.body.results.length });
    for (const recall of response.body.results) {
      const campaign = String(recall.NHTSACampaignNumber || '').trim();
      if (!campaign) continue;
      const current = campaigns.get(campaign) || {
        campaign,
        years: [],
        component: recall.Component || '',
        summary: recall.Summary || '',
        consequence: recall.Consequence || '',
        remedy: recall.Remedy || '',
        manufacturer: recall.Manufacturer || '',
      };
      current.years.push(year);
      campaigns.set(campaign, current);
    }
    await wait(120);
  }
  const generatedOn = new Date().toISOString();
  const records = [...campaigns.values()].sort((left, right) => left.campaign.localeCompare(right.campaign));
  const payload = {
    schemaVersion: 1,
    status: 'read-only-source-inventory',
    generatedOn,
    source: 'https://api.nhtsa.gov/recalls/recallsByVehicle',
    snapshotFile,
    model,
    sourceMake,
    years,
    requests,
    campaignCount: records.length,
    campaigns: records,
  };
  payload.inventorySha256 = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const outputPath = resolveRepo(outputFile);
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath, years: years.length, campaignCount: records.length, inventorySha256: payload.inventorySha256 }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
