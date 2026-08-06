/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const { SOURCES } = require('./build-hyundai-creta-adjudication');

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'user-agent': 'au7o-known-issues-audit/1.0', accept: '*/*' }, timeout: 30000 }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 5) {
        response.resume();
        resolve(fetchUrl(new URL(response.headers.location, url).toString(), redirects + 1));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, contentType: response.headers['content-type'] || '', body: Buffer.concat(chunks) }));
    });
    request.on('timeout', () => request.destroy(new Error(`timeout: ${url}`)));
    request.on('error', reject);
  });
}

async function main() {
  const brazil = await fetchUrl(SOURCES.brazilBrakeBoosterPdf);
  const siam = await fetchUrl(SOURCES.indiaRecallRegistry);
  const hyundaiIndia = await fetchUrl(SOURCES.indiaVinLookup);
  const siamText = siam.body.toString('utf8');
  const indiaText = hyundaiIndia.body.toString('utf8');
  const results = [
    { name: 'Hyundai Brazil recall PDF', status: brazil.status, passed: brazil.status === 200 && brazil.body.subarray(0, 4).toString('ascii') === '%PDF' },
    { name: 'SIAM Hyundai Creta/Verna recall row', status: siam.status, passed: siam.status === 200 && ['Creta &amp; Verna', 'G 1.5 IVT', '7698', '13/02/2023', '06/06/2023', 'electronic oil pump controller'].every((needle) => siamText.includes(needle)) },
    { name: 'Hyundai India VIN lookup', status: hyundaiIndia.status, passed: hyundaiIndia.status === 200 && ['Recall Campaign', 'Vehicle Identification Number', 'Hyundai Motor India Ltd'].every((needle) => indiaText.includes(needle)) },
  ];
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
