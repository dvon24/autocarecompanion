/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { CAMPAIGN_SOURCES, COMMERCE_BOUNDARY_SOURCES, PDF_SOURCES } = require('./build-kia-sedona-adjudication');

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
async function verifyCampaign(key, url) {
  const response = await fetchWithRetries(url); const body = await response.json(); const results = body.results || [];
  const years = [...new Set(results.filter((row) => row.Model === 'SEDONA').map((row) => Number(row.ModelYear)))].sort((a, b) => a - b);
  const combined = JSON.stringify(results);
  const expected = key === 'laterAlternatorBoundary'
    ? { count: 1, years: [2020], markers: ['alternator', 'B+ terminal nut', 'SC192'] }
    : { count: 4, years: [2015, 2016, 2017, 2018], markers: ['power sliding door', 'may not auto-reverse', 'reprogram the PSD module', 'SC164'] };
  const missingMarkers = expected.markers.filter((marker) => !combined.toLowerCase().includes(marker.toLowerCase()));
  return { key, url, status: response.status, count: body.Count, years, missingMarkers, passed: body.Count === expected.count && JSON.stringify(years) === JSON.stringify(expected.years) && missingMarkers.length === 0 };
}
async function verifyPdf(key, source) {
  const response = await fetchWithRetries(source.url); const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return { key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: source.sha256, pageCount: source.pageCount, visuallyInspectedPages: source.visuallyInspectedPages, markersReadFromFullDocument: source.markers, isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF', passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === source.sha256 };
}
async function verifyCommerceBoundary(key, url) {
  const response = await fetchWithRetries(url); const body = await response.text();
  const markers = ['924-554', 'Liftgate Glass Hinge', 'Jeep Liberty 2012-08']; const missingMarkers = markers.filter((marker) => !body.includes(marker));
  return { key, url, finalUrl: response.url, status: response.status, missingMarkers, passed: response.status === 200 && missingMarkers.length === 0 };
}
async function main() {
  const campaigns = []; for (const [key, url] of Object.entries(CAMPAIGN_SOURCES)) campaigns.push(await verifyCampaign(key, url));
  const pdfs = []; for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs.push(await verifyPdf(key, source));
  const commerce = []; for (const [key, url] of Object.entries(COMMERCE_BOUNDARY_SOURCES)) commerce.push(await verifyCommerceBoundary(key, url));
  const passed = campaigns.every((item) => item.passed) && pdfs.every((item) => item.passed) && commerce.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', campaigns, pdfs, commerce }, null, 2));
  if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { fetchWithRetries, verifyCampaign, verifyCommerceBoundary, verifyPdf };
