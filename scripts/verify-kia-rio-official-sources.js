/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { CAMPAIGN_SOURCES, PDF_SOURCES } = require('./build-kia-rio-adjudication');

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

function inventory(results) {
  const map = new Map();
  for (const row of results) {
    const model = row.Model;
    const years = map.get(model) || new Set();
    years.add(Number(row.ModelYear));
    map.set(model, years);
  }
  return Object.fromEntries([...map.entries()].sort().map(([model, years]) => [model, [...years].sort((a, b) => a - b)]));
}

async function verifyCampaign(key, url) {
  const response = await fetchWithRetries(url);
  const body = await response.json();
  const results = body.results || [];
  const rioYears = [...new Set(results.filter((row) => row.Model === 'RIO').map((row) => Number(row.ModelYear)))].sort((a, b) => a - b);
  const combined = JSON.stringify(results);
  if (key === 'hecu') {
    const markers = ['Hydraulic Electronic Control Unit (HECU)', 'engine compartment fire while parked or driving', 'replace the HECU fuse', 'SC284'];
    const missingMarkers = markers.filter((marker) => !combined.includes(marker));
    return { key, url, status: response.status, count: body.Count, rioYears, missingMarkers, passed: body.Count === 52 && JSON.stringify(rioYears) === JSON.stringify([2012, 2013, 2014, 2015, 2016, 2017]) && missingMarkers.length === 0 };
  }
  const models = inventory(results);
  return { key, url, status: response.status, count: body.Count, rioYears, models, passed: body.Count === 30 && rioYears.length === 0 && !Object.prototype.hasOwnProperty.call(models, 'RIO') };
}

async function verifyPdf(key, source) {
  const response = await fetchWithRetries(source.url);
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return { key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: source.sha256, pageCount: source.pageCount, visuallyInspectedPages: source.visuallyInspectedPages, markersReadFromFullDocument: source.markers, isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF', passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === source.sha256 };
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
module.exports = { fetchWithRetries, inventory, verifyCampaign, verifyPdf };
