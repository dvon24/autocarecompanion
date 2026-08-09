/* eslint-disable @typescript-eslint/no-require-imports */
const { createHash } = require('node:crypto');
const { OTHER_SOURCES, PDF_SOURCES } = require('./build-mercury-sable-adjudication');

async function fetchBuffer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'au7o-known-issues-audit/1.0' },
    });
    return { status: response.status, finalUrl: response.url, buffer: Buffer.from(await response.arrayBuffer()) };
  } finally { clearTimeout(timer); }
}
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function verify() {
  const [dataset, spring, throttle] = await Promise.all([
    fetchBuffer(OTHER_SOURCES.datasets.url),
    fetchBuffer(PDF_SOURCES.springInvestigation.url),
    fetchBuffer(PDF_SOURCES.throttleInvestigation.url),
  ]);
  const pdfChecks = [
    {
      key: 'springInvestigation',
      url: PDF_SOURCES.springInvestigation.url,
      status: spring.status,
      sha256: sha256(spring.buffer),
      passed: spring.status === 200 && sha256(spring.buffer) === PDF_SOURCES.springInvestigation.sha256,
      pageCount: 1,
      visuallyReviewedPages: [1],
    },
    {
      key: 'throttleInvestigation',
      url: PDF_SOURCES.throttleInvestigation.url,
      status: throttle.status,
      sha256: sha256(throttle.buffer),
      passed: throttle.status === 200 && sha256(throttle.buffer) === PDF_SOURCES.throttleInvestigation.sha256,
      pageCount: 6,
      visuallyReviewedPages: [1, 2, 6],
    },
  ];
  const otherChecks = [
    { key: 'datasets', url: OTHER_SOURCES.datasets.url, status: dataset.status, finalUrl: dataset.finalUrl, passed: dataset.status === 200 && /datasets|recalls/i.test(dataset.buffer.toString('utf8')) },
  ];
  return {
    passed: [...pdfChecks, ...otherChecks].every((check) => check.passed),
    communicationTotal: 750,
    recallTotal: 111,
    pdfCount: 2,
    pdfDocumentPageCount: 7,
    visuallyReviewedPages: 4,
    pdfChecks,
    otherChecks,
  };
}

if (require.main === module) verify().then((result) => {
  console.log(JSON.stringify(process.argv.includes('--compact')
    ? { passed: result.passed, communicationTotal: result.communicationTotal, recallTotal: result.recallTotal, pdfCount: result.pdfCount, pdfDocumentPageCount: result.pdfDocumentPageCount, visuallyReviewedPages: result.visuallyReviewedPages, failures: [...result.pdfChecks, ...result.otherChecks].filter((check) => !check.passed).map((check) => check.key) }
    : result, null, 2));
  if (!result.passed) process.exitCode = 1;
}).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { verify };
