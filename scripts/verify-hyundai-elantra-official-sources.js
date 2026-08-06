/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const { SOURCES } = require('./build-hyundai-elantra-adjudication');

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
  const results = [];
  for (const [name, url] of Object.entries(SOURCES)) {
    const response = await fetchUrl(url);
    const isPdf = /\.pdf(?:$|\?)/i.test(url);
    const bodyText = isPdf ? '' : response.body.toString('utf8');
    const passed = response.status === 200 && (isPdf ? response.body.subarray(0, 4).toString('ascii') === '%PDF' : ['2011-2022 Elantra', 'Anti-Theft Software Upgrade', 'Check your VIN'].every((needle) => bodyText.includes(needle)));
    results.push({ name, status: response.status, contentType: response.contentType, bytes: response.body.length, passed, url });
  }
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
