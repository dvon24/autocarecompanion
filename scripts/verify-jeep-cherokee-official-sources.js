/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { EXPECTED_CAMPAIGNS, EXPECTED_RECALLS, PDF_SOURCES, RECALL_QUERIES, RECALL_URLS } = require('./build-jeep-cherokee-adjudication');

function normalized(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getJson(url) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(60000) });
  const body = response.status === 200 ? await response.json() : null;
  return { response, body };
}

async function verifyPdf(key, source) {
  const response = await fetch(source.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(90000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  const isPdf = bytes.subarray(0, 4).toString('ascii') === '%PDF';
  return { key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: source.sha256, visuallyInspectedPages: source.visuallyInspectedPages, expectedMarkers: source.expectedMarkers, isPdf, passed: response.status === 200 && isPdf && sha256 === source.sha256 };
}

async function verifyCampaign(key, url, expected) {
  const { response, body } = await getJson(url);
  const results = body?.results || [];
  const combinedText = normalized(results.map((row) => [row.Component, row.Summary, row.Consequence, row.Remedy].join(' ')).join(' '));
  const markerChecks = expected.markers.map((marker) => ({ marker, present: combinedText.includes(normalized(marker)) }));
  let shapePassed;
  let shape;
  if (key === 'shifterMismatch') {
    const modelYears = [...new Set(results.map((row) => `${row.Model}|${row.ModelYear}`))].sort();
    shape = { modelYears, containsGrandCherokee: results.some((row) => row.Model === 'GRAND CHEROKEE'), containsCherokee: results.some((row) => row.Model === 'CHEROKEE') };
    shapePassed = JSON.stringify(modelYears) === JSON.stringify([...expected.modelYears].sort()) && shape.containsGrandCherokee && !shape.containsCherokee;
  } else {
    const models = [...new Set(results.map((row) => row.Model))].sort();
    const years = [...new Set(results.map((row) => row.ModelYear))].sort();
    shape = { models, years };
    shapePassed = JSON.stringify(models) === JSON.stringify([...expected.models].sort()) && JSON.stringify(years) === JSON.stringify([...expected.years].sort());
  }
  return { key, url, status: response.status, resultCount: results.length, expectedResultCount: expected.resultCount, campaignNumbers: [...new Set(results.map((row) => row.NHTSACampaignNumber))].sort(), shape, markerChecks, passed: response.status === 200 && results.length === expected.resultCount && results.every((row) => row.NHTSACampaignNumber === expected.campaign) && shapePassed && markerChecks.every((item) => item.present) };
}

async function verifyRecallYear(year, url) {
  const { response, body } = await getJson(url);
  const campaigns = [...new Set((body?.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean))].sort();
  const expected = [...EXPECTED_RECALLS[year]].sort();
  return { year: Number(year), url, status: response.status, campaigns, expected, passed: response.status === 200 && JSON.stringify(campaigns) === JSON.stringify(expected) };
}

async function main() {
  const pdfs = [];
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs.push(await verifyPdf(key, source));
  const campaigns = [];
  for (const [key, url] of Object.entries(RECALL_URLS)) campaigns.push(await verifyCampaign(key, url, EXPECTED_CAMPAIGNS[key]));
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecallYear(year, url));
  const passed = pdfs.every((item) => item.passed) && campaigns.every((item) => item.passed) && recalls.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', pdfs, campaigns, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
