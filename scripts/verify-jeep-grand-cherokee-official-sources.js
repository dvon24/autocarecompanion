/* eslint-disable @typescript-eslint/no-require-imports */
const {
  CAMPAIGNS,
  OFFICIAL_PDF_URLS,
} = require('./build-jeep-grand-cherokee-adjudication');

function normalized(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastResponse;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastResponse = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)', ...(options.headers || {}) },
      signal: AbortSignal.timeout(options.timeout || 90000),
    });
    if (![429, 500, 502, 503, 504].includes(lastResponse.status) || attempt === attempts) return lastResponse;
    await lastResponse.arrayBuffer();
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  return lastResponse;
}

async function verifyCampaign(key, expected) {
  const response = await fetchWithRetry(expected.url);
  const body = response.status === 200 ? await response.json() : null;
  const rows = body?.results || [];
  const grandCherokeeRows = rows.filter((row) => String(row.Model || '').startsWith('GRAND CHEROKEE'));
  const years = [...new Set(grandCherokeeRows.map((row) => row.ModelYear))].sort();
  const text = normalized(rows.map((row) => [row.Component, row.Summary, row.Consequence, row.Remedy].join(' ')).join(' '));
  const markerChecks = expected.markers.map((marker) => ({ marker, present: text.includes(normalized(marker)) }));
  return {
    key,
    url: expected.url,
    status: response.status,
    resultCount: rows.length,
    grandCherokeeYears: years,
    expectedYears: expected.grandCherokeeYears,
    markerChecks,
    passed: response.status === 200
      && rows.length > 0
      && rows.every((row) => row.NHTSACampaignNumber === expected.campaign)
      && JSON.stringify(years) === JSON.stringify([...expected.grandCherokeeYears].sort())
      && markerChecks.every((item) => item.present),
  };
}

async function verifyPdf(url) {
  const response = await fetchWithRetry(url, { headers: { range: 'bytes=0-7' } });
  const bytes = Buffer.from(await response.arrayBuffer());
  const isPdf = bytes.subarray(0, 4).toString('ascii') === '%PDF';
  return {
    url,
    finalUrl: response.url,
    status: response.status,
    bytesRead: bytes.length,
    contentType: response.headers.get('content-type'),
    isPdf,
    passed: [200, 206].includes(response.status) && isPdf,
  };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main() {
  const campaigns = [];
  for (const [key, expected] of Object.entries(CAMPAIGNS)) campaigns.push(await verifyCampaign(key, expected));
  const pdfLinks = await mapWithConcurrency(OFFICIAL_PDF_URLS, 3, verifyPdf);
  const passed = campaigns.every((item) => item.passed) && pdfLinks.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', campaigns, pdfLinks }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
