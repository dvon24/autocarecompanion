/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const {
  EXPECTED_RECALL_COUNTS,
  RECALL_QUERIES,
} = require('./build-hyundai-tiburon-adjudication');

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          'user-agent': 'au7o-known-issues-audit/1.0',
          accept: 'application/json',
        },
        timeout: 60000,
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          try {
            resolve({ status: response.statusCode, json: JSON.parse(body), bytes: body.length });
          } catch (error) {
            reject(new Error(`invalid JSON from ${url}: ${error.message}`));
          }
        });
      },
    );
    request.on('timeout', () => request.destroy(new Error(`timeout: ${url}`)));
    request.on('error', reject);
  });
}

async function main() {
  const results = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) {
    const response = await requestJson(url);
    const expectedCount = EXPECTED_RECALL_COUNTS[year];
    const passed =
      [200, 400].includes(response.status) &&
      response.json?.Count === expectedCount &&
      Array.isArray(response.json?.results) &&
      response.json.results.length === expectedCount;
    results.push({
      year: Number(year),
      url,
      status: response.status,
      count: response.json?.Count,
      expectedCount,
      campaigns: (response.json?.results || []).map((item) => item.NHTSACampaignNumber),
      bytes: response.bytes,
      passed,
    });
  }
  const passed = results.length === 12 && results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
