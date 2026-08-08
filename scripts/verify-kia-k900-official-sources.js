/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { PDF_SOURCES } = require('./build-kia-k900-adjudication');

async function fetchWithRetries(url, attempts = 4) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(90000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' } });
      if (response.ok) return response;
      last = new Error(`${response.status} ${response.statusText}`);
    } catch (error) { last = error; }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  throw last;
}

async function verifyPdf(key, source) {
  const response = await fetchWithRetries(source.url);
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return {
    key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length,
    sha256, expectedSha256: source.sha256, visuallyInspectedPages: source.visuallyInspectedPages,
    expectedMarkers: source.markers, isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF',
    passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === source.sha256,
  };
}

async function main() {
  const pdfs = [];
  for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs.push(await verifyPdf(key, source));
  const passed = pdfs.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', pdfs }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
