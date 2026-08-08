/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { ALL_CAMPAIGNS, PDF_SOURCES, PIVI_RECALL } = require('./build-land-rover-defender-adjudication');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'au7o-known-issues-audit/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function main() {
  const pdfResults = [];
  for (const [name, expected] of Object.entries(PDF_SOURCES)) {
    const response = await fetch(expected.url, { headers: { 'user-agent': 'au7o-known-issues-audit/1.0' } });
    if (!response.ok) throw new Error(`${response.status} ${expected.url}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const actualSha256 = sha256(buffer);
    const contentType = response.headers.get('content-type') || '';
    if (actualSha256 !== expected.sha256 || !/application\/pdf/i.test(contentType) || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${name}: PDF/hash mismatch`);
    pdfResults.push({ name, url: expected.url, bytes: buffer.length, sha256: actualSha256, contentType });
  }

  const campaignResults = [];
  for (const campaign of ALL_CAMPAIGNS) {
    const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
    const body = await fetchJson(url);
    const text = JSON.stringify(body.results || []);
    if (!body.Count || !new RegExp(campaign, 'i').test(text) || !/DEFENDER/i.test(text)) throw new Error(`${campaign}: campaign coverage mismatch`);
    campaignResults.push({ campaign, count: body.Count });
  }

  const pivi = await fetchJson(PIVI_RECALL.url);
  const defenderRows = (pivi.results || []).filter((row) => row.Model === 'DEFENDER').sort((a, b) => Number(a.ModelYear) - Number(b.ModelYear));
  const piviText = JSON.stringify(defenderRows);
  if (defenderRows.length !== 2 || defenderRows.map((row) => Number(row.ModelYear)).join(',') !== '2023,2024' || PIVI_RECALL.expectedMarkers.some((marker) => !piviText.includes(marker))) throw new Error('25V016 Pivi recall mismatch');

  console.log(JSON.stringify({ passed: true, pdfResults, campaignResults, piviDefenderYears: [2023, 2024] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
