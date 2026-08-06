/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const https = require('node:https');
const { RECALL_QUERIES, SOURCES, SOURCE_SHA256 } = require('./build-infiniti-fx50-adjudication');

function request(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'user-agent': 'au7o-known-issues-audit/1.0', accept: '*/*' }, timeout: 60000 }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('timeout', () => req.destroy(new Error(`timeout: ${url}`)));
    req.on('error', reject);
  });
}

async function main() {
  const brake = await request(SOURCES.brake);
  const brakeHash = crypto.createHash('sha256').update(brake.body).digest('hex');
  const pdf = { url: SOURCES.brake, status: brake.status, bytes: brake.body.length, magic: brake.body.subarray(0, 4).toString('ascii'), sha256: brakeHash };
  pdf.passed = pdf.status === 200 && pdf.magic === '%PDF' && pdf.sha256 === SOURCE_SHA256.brake;
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) {
    const response = await request(url);
    let payload;
    try { payload = JSON.parse(response.body.toString('utf8')); } catch (error) { throw new Error(`invalid recall JSON for ${year}: ${error.message}`); }
    const campaigns = (payload.results || []).map((item) => item.NHTSACampaignNumber).sort();
    recalls.push({ year: Number(year), url, status: response.status, count: payload.Count, campaigns, passed: [200, 400].includes(response.status) && payload.Count === 0 && campaigns.length === 0 });
  }
  const passed = pdf.passed && recalls.length === 5 && recalls.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', pdf, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
