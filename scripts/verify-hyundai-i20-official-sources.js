/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const { SOURCES } = require('./build-hyundai-i20-adjudication');

function requestUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const request = https.request(target, { method: 'GET', headers: { 'user-agent': 'au7o-known-issues-audit/1.0', accept: '*/*' }, timeout: 60000 }, (response) => {
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
  { name: 'EU Safety Gate alert 10096118', url: SOURCES.safetyGate, needles: [] },
  { name: 'Hyundai Slovenia campaign 51DT07', url: SOURCES.hyundaiSlovenia, needles: ['51DT07', 'i20', '1. aprila 2021', '3. decembra 2022', '4. januarja 2023'] },
  { name: 'Traficom Finland campaign 51DT07', url: SOURCES.traficomFinland, needles: ['51DT07', 'i20', 'Fuel pump', 'Replace the fuel pump'] },
];

async function main() {
  const results = [];
  for (const check of CHECKS) {
    const response = await requestUrl(check.url);
    const body = response.body.toString('utf8');
    const missing = check.needles.filter((needle) => !body.includes(needle));
    results.push({ name: check.name, url: check.url, status: response.status, contentType: response.contentType, bytes: response.body.length, passed: response.status === 200 && missing.length === 0, missing });
  }
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
