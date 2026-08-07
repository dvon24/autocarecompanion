/* eslint-disable @typescript-eslint/no-require-imports */
const { EPA_OBD_SOURCE, EXPECTED_RECALLS, RECALL_QUERIES } = require('./build-jeep-comanche-adjudication');
async function verifyEpa() {
  const response = await fetch(EPA_OBD_SOURCE.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(60000) });
  const text = await response.text(); const lower = text.toLowerCase();
  const markerChecks = EPA_OBD_SOURCE.markers.map((marker) => ({ marker, present: lower.includes(marker.toLowerCase()) }));
  return { url: EPA_OBD_SOURCE.url, finalUrl: response.url, status: response.status, bytes: Buffer.byteLength(text), markerChecks, passed: response.status === EPA_OBD_SOURCE.expectedStatus && markerChecks.every((item) => item.present) };
}
async function verifyRecall(year, url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) }); let campaigns = [];
  if (response.status === 200) { const body = await response.json(); campaigns = [...new Set((body.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean))].sort(); } else await response.arrayBuffer();
  const expected = EXPECTED_RECALLS[year]; return { year: Number(year), url, status: response.status, campaigns, expected, passed: response.status === expected.status && JSON.stringify(campaigns) === JSON.stringify(expected.campaigns) };
}
async function main() {
  const epa = await verifyEpa(); const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecall(year, url));
  const passed = epa.passed && recalls.every((item) => item.passed); console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', epa, recalls }, null, 2)); if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
