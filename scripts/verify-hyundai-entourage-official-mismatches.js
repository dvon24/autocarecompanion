/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https'); const { MISMATCH_SOURCES } = require('./build-hyundai-entourage-adjudication');
function fetchUrl(url, redirects = 0) { return new Promise((resolve, reject) => { const request = https.get(url, { headers: { 'user-agent': 'au7o-known-issues-audit/1.0', accept: '*/*' }, timeout: 30000 }, (response) => { if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 5) { response.resume(); resolve(fetchUrl(new URL(response.headers.location, url).toString(), redirects + 1)); return; } const chunks = []; response.on('data', (chunk) => chunks.push(chunk)); response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks) })); }); request.on('timeout', () => request.destroy(new Error(`timeout: ${url}`))); request.on('error', reject); }); }
async function main() {
  const service = await fetchUrl(MISMATCH_SOURCES.hyundaiServicePortal); const warranty = await fetchUrl(MISMATCH_SOURCES.txxmEngineWarranty); const recalls = await fetchUrl(MISMATCH_SOURCES.nhtsaRecalls2007);
  const recallJson = JSON.parse(recalls.body.toString('utf8')); const campaigns = recallJson.results.map((row) => row.NHTSACampaignNumber);
  const results = [
    { name: 'Hyundai service-information index', status: service.status, passed: service.status === 200 && service.body.subarray(0, 4).toString('ascii') === '%PDF' },
    { name: 'Hyundai TXXM engine-warranty bulletin', status: warranty.status, passed: warranty.status === 200 && warranty.body.subarray(0, 4).toString('ascii') === '%PDF' },
    { name: 'NHTSA 2007 Entourage recall set', status: recalls.status, campaigns, passed: recalls.status === 200 && recallJson.Count === 6 && ['20V061000', '09V122000', '16V843000', '13V113000', '13V556000', '06V356000'].every((id) => campaigns.includes(id)) },
  ];
  const passed = results.every((result) => result.passed); console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2)); if (!passed) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
