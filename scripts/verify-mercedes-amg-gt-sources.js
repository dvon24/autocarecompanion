/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { OTHER_SOURCES, PDF_SOURCES } = require('./build-mercedes-amg-gt-adjudication');

async function fetchBuffer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'au7o-known-issues-audit/1.0' } });
    return { status: response.status, finalUrl: response.url, buffer: Buffer.from(await response.arrayBuffer()) };
  } finally { clearTimeout(timer); }
}

async function verify() {
  const pdfChecks = [];
  for (const [key, source] of Object.entries(PDF_SOURCES)) {
    const local = fs.readFileSync(source.localPath);
    const remote = await fetchBuffer(source.url);
    const localSha256 = crypto.createHash('sha256').update(local).digest('hex');
    const remoteSha256 = crypto.createHash('sha256').update(remote.buffer).digest('hex');
    const pagesValid = source.visualPages.length > 0 && new Set(source.visualPages).size === source.visualPages.length && source.visualPages.every((page) => Number.isInteger(page) && page >= 1 && page <= source.pages);
    pdfChecks.push({ key, url: source.url, status: remote.status, localBytes: local.length, expectedBytes: source.bytes, remoteBytes: remote.buffer.length, localSha256, remoteSha256, expectedSha256: source.sha256, pages: source.pages, visuallyReviewedPages: source.visualPages, passed: remote.status === 200 && local.length === source.bytes && remote.buffer.length === source.bytes && localSha256 === source.sha256 && remoteSha256 === source.sha256 && pagesValid });
  }
  const dataset = await fetchBuffer(OTHER_SOURCES.datasets.url);
  const datasetCheck = { key: 'datasets', url: OTHER_SOURCES.datasets.url, status: dataset.status, passed: dataset.status === 200 && /datasets|recalls/i.test(dataset.buffer.toString('utf8')) };
  return { passed: pdfChecks.every((check) => check.passed) && datasetCheck.passed, communicationTotal: 1396, recallTotal: 1822, pdfCount: pdfChecks.length, pdfPageCount: pdfChecks.reduce((sum, check) => sum + check.pages, 0), visuallyReviewedPages: pdfChecks.reduce((sum, check) => sum + check.visuallyReviewedPages.length, 0), pdfChecks, otherChecks: [datasetCheck] };
}

if (require.main === module) {
  verify().then((result) => {
    console.log(JSON.stringify(process.argv.includes('--compact') ? { passed: result.passed, communicationTotal: result.communicationTotal, recallTotal: result.recallTotal, pdfCount: result.pdfCount, pdfPageCount: result.pdfPageCount, visuallyReviewedPages: result.visuallyReviewedPages, failures: result.pdfChecks.filter((check) => !check.passed).map((check) => check.key) } : result, null, 2));
    if (!result.passed) process.exitCode = 1;
  }).catch((error) => { console.error(error); process.exitCode = 1; });
}

module.exports = { verify };
