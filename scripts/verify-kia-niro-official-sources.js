/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { CAMPAIGN_SOURCES, PDF_SOURCES } = require('./build-kia-niro-adjudication');

async function fetchWithRetries(url, attempts = 4) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(90000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' } });
      if (response.ok) return response;
      last = new Error(`${response.status} ${response.statusText}`);
    } catch (error) { last = error; }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  throw last;
}

const CAMPAIGN_EXPECTATIONS = {
  originalPra: { campaign: '18V666000', count: 2, models: { NIRO: [2017, 2018] }, component: 'HYBRID PROPULSION SYSTEM', markers: ['inadequate connections', 'increased electrical resistance', 'SC168'] },
  supersedingPra: { campaign: '22V836000', count: 2, models: { NIRO: [2017, 2018] }, component: 'HYBRID PROPULSION SYSTEM', markers: ['previously recalled under recall 18V-666', 'SC256', 'supersedes NHTSA recall number 18V-666'] },
  hca: { campaign: '23V534000', count: 11, models: { 'NIRO PHEV': [2018, 2019, 2020, 2021, 2022], NIRO: [2017, 2018, 2019, 2020, 2021, 2022] }, component: 'POWER TRAIN:AUTOMATIC TRANSMISSION:INTERNAL:CLUTCHES/BANDS:ACTUATORS/SOLENOIDS', markers: ['printed circuit board inside the hydraulic clutch actuator', 'install a new fuse', 'SC276'] },
};

function inventory(results) {
  const map = new Map();
  for (const row of results) {
    const years = map.get(row.Model) || new Set();
    years.add(Number(row.ModelYear));
    map.set(row.Model, years);
  }
  return Object.fromEntries([...map.entries()].sort().map(([model, years]) => [model, [...years].sort((a, b) => a - b)]));
}

async function verifyCampaign(key, url) {
  const response = await fetchWithRetries(url);
  const body = await response.json();
  const expected = CAMPAIGN_EXPECTATIONS[key];
  const results = body.results || [];
  const combined = JSON.stringify(results);
  const actualModels = inventory(results);
  const missingMarkers = expected.markers.filter((marker) => !combined.includes(marker));
  const passed = body.Count === expected.count && results.length === expected.count && results.every((row) => row.NHTSACampaignNumber === expected.campaign && row.Component === expected.component) && JSON.stringify(actualModels) === JSON.stringify(expected.models) && missingMarkers.length === 0;
  return { key, url, status: response.status, count: body.Count, campaign: expected.campaign, actualModels, expectedModels: expected.models, missingMarkers, passed };
}

async function verifyPdf(key, source) {
  const response = await fetchWithRetries(source.url);
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return { key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: source.sha256, pageCount: source.pageCount, visuallyInspectedPages: source.visuallyInspectedPages, expectedMarkers: source.markers, isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF', passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === source.sha256 };
}

async function main() {
  const campaigns = [];
  for (const [key, url] of Object.entries(CAMPAIGN_SOURCES)) campaigns.push(await verifyCampaign(key, url));
  const pdfs = [];
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs.push(await verifyPdf(key, source));
  const passed = campaigns.every((item) => item.passed) && pdfs.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', campaigns, pdfs }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { CAMPAIGN_EXPECTATIONS, inventory, verifyCampaign, verifyPdf };
