/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { CAMERA_WAGONEER_MODEL_YEARS, CAMPAIGN_URL, EXPECTED_RECALLS, PDF_SOURCES, RECALL_QUERIES } = require('./build-jeep-wagoneer-adjudication');

async function verifyPdf(key, source) {
  const response = await fetch(source.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(90000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return { key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: source.sha256, visuallyInspectedPages: source.visuallyInspectedPages, expectedMarkers: source.markers, isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF', passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === source.sha256 };
}

async function verifyRecall(year, url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(60000) });
  const body = await response.json();
  const campaigns = [...new Set((body.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean))].sort();
  const expected = [...EXPECTED_RECALLS[year]].sort();
  return { year: Number(year), url, status: response.status, campaigns, expected, passed: response.status === 200 && JSON.stringify(campaigns) === JSON.stringify(expected) };
}

async function verifyCampaign() {
  const response = await fetch(CAMPAIGN_URL, { redirect: 'follow', signal: AbortSignal.timeout(60000) });
  const body = await response.json();
  const modelYears = (body.results || []).filter((row) => row.Model === 'WAGONEER').map((row) => `${row.Model}|${row.ModelYear}`).sort();
  const row = (body.results || []).find((item) => item.Model === 'WAGONEER');
  const markers = ['Central Vision Park Assist', 'rearview image', 'free of charge'];
  const text = `${row?.Summary || ''} ${row?.Remedy || ''}`;
  return { url: CAMPAIGN_URL, status: response.status, resultCount: body.results?.length || 0, modelYears, expectedModelYears: CAMERA_WAGONEER_MODEL_YEARS, markers, passed: response.status === 200 && JSON.stringify(modelYears) === JSON.stringify(CAMERA_WAGONEER_MODEL_YEARS) && markers.every((marker) => text.toLowerCase().includes(marker.toLowerCase())) };
}

async function main() {
  const pdfs = [];
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs.push(await verifyPdf(key, source));
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecall(year, url));
  const campaign = await verifyCampaign();
  const passed = pdfs.every((item) => item.passed) && recalls.every((item) => item.passed) && campaign.passed;
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', pdfs, campaign, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });

