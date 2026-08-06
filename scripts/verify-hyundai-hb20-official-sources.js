/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const { SOURCES } = require('./build-hyundai-hb20-adjudication');

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
  { name: 'Hyundai oil-pump recall PDF', url: SOURCES.oilPumpPdf, kind: 'pdf' },
  { name: 'Hyundai brake-booster recall PDF', url: SOURCES.brakeBoosterPdf, kind: 'pdf' },
  { name: 'Hyundai client-rendered recall index', url: SOURCES.recallIndex, kind: 'html', needles: [] },
];

async function main() {
  const results = [];
  for (const check of CHECKS) {
    const response = await requestUrl(check.url);
    const isPdf = response.body.subarray(0, 4).toString('ascii') === '%PDF';
    const text = check.kind === 'html' ? response.body.toString('utf8') : '';
    const missing = check.needles?.filter((needle) => !text.includes(needle)) || [];
    const passed = response.status === 200 && (check.kind === 'pdf' ? isPdf : missing.length === 0);
    results.push({ name: check.name, url: check.url, status: response.status, contentType: response.contentType, bytes: response.body.length, passed, missing });
  }
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
