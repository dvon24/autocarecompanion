/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const {
  REVIEW_SOURCES,
  SOURCES,
} = require('./build-hyundai-tucson-adjudication');

function requestUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const request = https.request(
      target,
      {
        method: 'GET',
        headers: {
          'user-agent': 'au7o-known-issues-audit/1.0',
          accept: 'application/pdf,*/*',
        },
        timeout: 60000,
      },
      (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location &&
          redirects < 5
        ) {
          response.resume();
          resolve(requestUrl(new URL(response.headers.location, target).toString(), redirects + 1));
          return;
        }
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () =>
          resolve({
            status: response.statusCode,
            contentType: response.headers['content-type'] || '',
            body: Buffer.concat(chunks),
          }),
        );
      },
    );
    request.on('timeout', () => request.destroy(new Error(`timeout: ${url}`)));
    request.on('error', reject);
    request.end();
  });
}

async function main() {
  const results = [];
  const urls = { ...SOURCES, ...REVIEW_SOURCES };
  for (const [name, url] of Object.entries(urls)) {
    const response = await requestUrl(url);
    const isPdf = response.body.subarray(0, 5).toString('ascii') === '%PDF-';
    results.push({
      name,
      url,
      status: response.status,
      contentType: response.contentType,
      bytes: response.body.length,
      passed: response.status === 200 && isPdf,
    });
  }
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
