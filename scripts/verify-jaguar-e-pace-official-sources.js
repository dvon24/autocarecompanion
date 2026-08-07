/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { EXPECTED_RECALLS, PDF_SHA256, RECALL_QUERIES, SOURCES } = require('./build-jaguar-e-pace-adjudication');

async function verifyPdf(key, url) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(30000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return { key, url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: PDF_SHA256[key], isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF', passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === PDF_SHA256[key] };
}

async function verifyRecall(year, url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  let campaigns = [];
  if (response.status === 200) {
    const body = await response.json();
    campaigns = (body.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean).sort();
  } else {
    await response.arrayBuffer();
  }
  const expected = EXPECTED_RECALLS[year];
  const passed = response.status === expected.status && JSON.stringify(campaigns) === JSON.stringify([...expected.campaigns].sort());
  return { year: Number(year), url, status: response.status, campaigns, expected, passed };
}

async function main() {
  const documents = [];
  for (const [key, url] of Object.entries(SOURCES)) documents.push(await verifyPdf(key, url));
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecall(year, url));
  const passed = documents.every((row) => row.passed) && recalls.every((row) => row.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', documentCount: documents.length, visuallyInspectedPages: { transmission: 4, infotainment: 2, roof: 1, coolant: 2 }, documents, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
