/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { CAMPAIGNS, EXPECTED_CAMPAIGNS, PDF_SOURCES } = require('./build-kia-k5-adjudication');

async function fetchWithRetries(url, options = {}, attempts = 4) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(90000) });
      if (response.ok) return response;
      last = new Error(`${response.status} ${response.statusText}`);
    } catch (error) { last = error; }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  throw last;
}

async function verifyPdf(key, source) {
  const response = await fetchWithRetries(source.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' } });
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return {
    key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length,
    sha256, expectedSha256: source.sha256, visuallyInspectedPages: source.visuallyInspectedPages,
    expectedMarkers: source.markers, isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF',
    passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === source.sha256,
  };
}

async function verifyCampaign(key, url) {
  const response = await fetchWithRetries(url, { redirect: 'follow' });
  const body = await response.json();
  const rows = (body.results || []).filter((row) => row.Make === 'KIA' && row.Model === 'K5');
  const modelYears = [...new Set(rows.map((row) => `${row.Model}|${row.ModelYear}`))].sort();
  const expectedModelYears = [...EXPECTED_CAMPAIGNS[key]].sort();
  return { key, url, status: response.status, resultCount: rows.length, modelYears, expectedModelYears, passed: response.status === 200 && JSON.stringify(modelYears) === JSON.stringify(expectedModelYears) };
}

async function main() {
  const args = process.argv.slice(2);
  const modes = new Set(args);
  const campaignArg = args.find((value) => value.startsWith('--campaign='));
  const runAll = modes.size === 0;
  const pdfs = [];
  if (runAll || modes.has('--pdfs')) for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs.push(await verifyPdf(key, source));
  const campaignEntries = campaignArg ? [[campaignArg.split('=')[1], CAMPAIGNS[campaignArg.split('=')[1]]]] : Object.entries(CAMPAIGNS);
  const campaigns = [];
  if (runAll || modes.has('--campaigns') || campaignArg) for (const [key, url] of campaignEntries) {
    if (!url) throw new Error(`unknown campaign key ${key}`);
    campaigns.push(await verifyCampaign(key, url));
  }
  const passed = pdfs.every((item) => item.passed) && campaigns.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', modes: runAll ? ['all'] : [...modes], pdfs, campaigns }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
