/* eslint-disable @typescript-eslint/no-require-imports */
const { EXPECTED_RECALLS, RECALL_QUERIES, WEB_SOURCES } = require('./build-jeep-cj7-adjudication');

async function verifyWebSource(key, source) {
  const response = await fetch(source.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(60000) });
  const text = await response.text();
  const lower = text.toLowerCase();
  const markerChecks = source.markers.map((marker) => ({ marker, present: lower.includes(marker.toLowerCase()) }));
  return { key, url: source.url, finalUrl: response.url, status: response.status, bytes: Buffer.byteLength(text), markerChecks, passed: response.status === source.expectedStatus && markerChecks.every((item) => item.present) };
}

async function verifyRecall(year, url) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(30000) });
  let campaigns = [];
  if (response.status === 200) { const body = await response.json(); campaigns = [...new Set((body.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean))].sort(); } else await response.arrayBuffer();
  const expected = EXPECTED_RECALLS[year];
  return { year: Number(year), url, status: response.status, campaigns, expected, passed: response.status === expected.status && JSON.stringify(campaigns) === JSON.stringify(expected.campaigns) };
}

async function main() {
  const webSources = [];
  for (const [key, source] of Object.entries(WEB_SOURCES)) webSources.push(await verifyWebSource(key, source));
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecall(year, url));
  const passed = webSources.every((item) => item.passed) && recalls.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', webSources, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
