/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const { RECALL_QUERIES } = require('./build-infiniti-g35-adjudication');
const EXPECTED = {
  2003: ['02V245000', '02V331000', '03V200000', '03V455000', '05V555000', '06E060000', '11E024000'],
  2004: ['05V555000', '06E060000', '11E024000'],
  2005: ['10V175000'],
  2006: ['06V394000', '10V175000'],
  2007: ['06V394000', '08V521000', '10V175000'],
};
function request(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'user-agent': 'au7o-known-issues-audit/1.0', accept: 'application/json' }, timeout: 60000 }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('timeout', () => req.destroy(new Error(`timeout: ${url}`)));
    req.on('error', reject);
  });
}
async function main() {
  const results = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) {
    const response = await request(url);
    const payload = JSON.parse(response.body);
    const campaigns = (payload.results || []).map((item) => item.NHTSACampaignNumber).sort();
    const expected = EXPECTED[year];
    const sensor = (payload.results || []).find((item) => item.NHTSACampaignNumber === '03V455000');
    results.push({ year: Number(year), url, status: response.status, count: payload.Count, campaigns, sensorCampaignExact: year === '2003' ? /crank position sensor or cam position sensor/i.test(sensor?.Summary || '') : undefined, passed: response.status === 200 && payload.Count === expected.length && JSON.stringify(campaigns) === JSON.stringify(expected) && (year !== '2003' || /crank position sensor or cam position sensor/i.test(sensor?.Summary || '')) });
  }
  const passed = results.length === 5 && results.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
