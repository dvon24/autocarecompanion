/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(PROJECT_ROOT, 'data', 'known-issue-genesis-adjudication-2026-08-05.json');
const PDF_MAGIC = '%PDF-';

async function verifyUrl(url) {
  const response = await fetch(url, {
    headers: {
      Range: 'bytes=0-4',
      'User-Agent': 'au7o-known-issue-source-verifier/1.0',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || '';
  const magic = bytes.subarray(0, PDF_MAGIC.length).toString('ascii');
  const passed = response.ok
    && response.url.startsWith('https://static.nhtsa.gov/')
    && (contentType.toLowerCase().includes('pdf') || magic === PDF_MAGIC);
  return {
    url,
    finalUrl: response.url,
    status: response.status,
    contentType,
    pdfMagic: magic,
    passed,
  };
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const urls = [...new Set(packet.rows
    .filter((row) => row.action === 'rewrite_then_publish')
    .flatMap((row) => row.proposal.citations.map((citation) => citation.url)))].sort();

  const results = [];
  const queue = [...urls];
  const workers = Array.from({ length: Math.min(5, queue.length) }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      try {
        results.push(await verifyUrl(url));
      } catch (error) {
        results.push({ url, passed: false, error: error.message });
      }
    }
  });
  await Promise.all(workers);
  results.sort((left, right) => left.url.localeCompare(right.url));
  const failures = results.filter((result) => !result.passed);
  console.log(JSON.stringify({ passed: failures.length === 0, checked: results.length, failures, results }, null, 2));
  if (failures.length > 0) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = { verifyUrl };
