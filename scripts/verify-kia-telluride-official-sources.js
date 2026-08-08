/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { CAMPAIGN_SOURCES, EXPECTED_CAMPAIGNS, PDF_SOURCES } = require('./build-kia-telluride-adjudication');

async function fetchWithRetries(url, attempts = 4) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(90000),
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' },
      });
      if (response.ok) return response;
      last = new Error(response.status + ' ' + response.statusText);
    } catch (error) {
      last = error;
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  throw last;
}
async function verifyCampaign(key, url) {
  const response = await fetchWithRetries(url);
  const body = await response.json();
  const rows = (body.results || []).filter((row) => (row.Make || '').toUpperCase() === 'KIA' && (row.Model || '').toUpperCase() === 'TELLURIDE');
  const years = [...new Set(rows.map((row) => Number(row.ModelYear)))].sort((a, b) => a - b);
  const expected = EXPECTED_CAMPAIGNS[key];
  const combined = JSON.stringify(rows);
  const missingMarkers = expected.markers.filter((marker) => !combined.toLowerCase().includes(marker.toLowerCase()));
  return {
    key, url, status: response.status, tellurideRows: rows.length, expectedRows: expected.rows,
    years, expectedYears: expected.years, missingMarkers,
    passed: rows.length === expected.rows && JSON.stringify(years) === JSON.stringify(expected.years) && missingMarkers.length === 0,
  };
}
async function verifyPdf(key, source) {
  const response = await fetchWithRetries(source.url);
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return {
    key, url: source.url, status: response.status, contentType: response.headers.get('content-type'),
    bytes: bytes.length, expectedBytes: source.bytes, sha256, expectedSha256: source.sha256,
    expectedPages: source.pages, visuallyInspectedPages: source.visuallyInspectedPages,
    allPagesReadRenderedAndVisuallyInspected: source.visuallyInspectedPages.length === source.pages,
    passed: sha256 === source.sha256 && bytes.length === source.bytes && bytes.subarray(0, 5).toString() === '%PDF-' && source.visuallyInspectedPages.length === source.pages,
  };
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
module.exports = { fetchWithRetries, verifyCampaign, verifyPdf };
