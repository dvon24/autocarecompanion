/* eslint-disable @typescript-eslint/no-require-imports */
const { createHash } = require('node:crypto');
const { getContract } = require('./mini-model-adjudication-contracts');
function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
async function fetchBuffer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'au7o-known-issues-audit/1.0' } });
    return { status: response.status, finalUrl: response.url, buffer: Buffer.from(await response.arrayBuffer()) };
  } finally { clearTimeout(timer); }
}
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
async function verify(contract) {
  const pdfEntries = Object.entries(contract.pdfSources);
  const [dataset, ...pdfResults] = await Promise.all([fetchBuffer(contract.otherSources.datasets.url), ...pdfEntries.map(([, source]) => fetchBuffer(source.url))]);
  const pdfChecks = pdfEntries.map(([key, source], index) => { const result = pdfResults[index]; const hash = sha256(result.buffer); return { key, url: source.url, status: result.status, sha256: hash, passed: result.status === 200 && hash === source.sha256, pageCount: source.pageCount, visuallyReviewedPages: source.visuallyReviewedPages }; });
  const otherChecks = [{ key: 'datasets', url: contract.otherSources.datasets.url, status: dataset.status, finalUrl: dataset.finalUrl, passed: dataset.status === 200 && /manufacturer communications/i.test(dataset.buffer.toString('utf8')) }];
  return { passed: [...pdfChecks, ...otherChecks].every((check) => check.passed), communicationTotal: contract.bulletinInventory.totalRows, recallTotal: contract.recallInventory.totalRows, pdfCount: pdfChecks.length, pdfDocumentPageCount: pdfEntries.reduce((sum, [, source]) => sum + source.pageCount, 0), visuallyReviewedPages: pdfEntries.reduce((sum, [, source]) => sum + source.visuallyReviewedPages.length, 0), pdfChecks, otherChecks };
}
if (require.main === module) {
  const model = argValue('--model');
  if (!model) throw new Error('--model is required');
  verify(getContract(model)).then((result) => {
    console.log(JSON.stringify(process.argv.includes('--compact') ? { passed: result.passed, communicationTotal: result.communicationTotal, recallTotal: result.recallTotal, pdfCount: result.pdfCount, pdfDocumentPageCount: result.pdfDocumentPageCount, visuallyReviewedPages: result.visuallyReviewedPages, failures: [...result.pdfChecks, ...result.otherChecks].filter((check) => !check.passed).map((check) => check.key) } : result, null, 2));
    if (!result.passed) process.exitCode = 1;
  }).catch((error) => { console.error(error); process.exitCode = 1; });
}
module.exports = { verify };
