/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const { SOURCES } = require('./build-hyundai-ioniq-adjudication');

function requestUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const request = https.request(target, { method: 'GET', headers: { 'user-agent': 'au7o-known-issues-audit/1.0', accept: 'application/pdf,*/*' }, timeout: 60000 }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 5) {
        response.resume();
        resolve(requestUrl(new URL(response.headers.location, target).toString(), redirects + 1));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, contentType: response.headers['content-type'] || '', body: Buffer.concat(chunks) }));
    });
    request.on('timeout', () => request.destroy(new Error(`timeout: ${url}`)));
    request.on('error', reject);
    request.end();
  });
}

const CHECKS = [
  { name: 'Hyundai TSB 21-ST-003H MDPS bearing', url: SOURCES.mdps },
  { name: 'Hyundai TSB 21-BR-004H EPB update', url: SOURCES.epbUpdate },
  { name: 'Hyundai TSB 23-BR-001H EPB diagnosis', url: SOURCES.epbDiagnosis },
  { name: 'Hyundai TSB 24-EV-001H U1341 ECU update', url: SOURCES.ecuU1341 },
];

async function main() {
  const results = [];
  for (const check of CHECKS) {
    const response = await requestUrl(check.url);
    const isPdf = response.body.subarray(0, 5).toString('ascii') === '%PDF-';
    results.push({ name: check.name, url: check.url, status: response.status, contentType: response.contentType, bytes: response.body.length, passed: response.status === 200 && isPdf });
  }
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
