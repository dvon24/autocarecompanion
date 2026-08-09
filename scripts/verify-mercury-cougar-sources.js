/* eslint-disable @typescript-eslint/no-require-imports */
const { OTHER_SOURCES } = require('./build-mercury-cougar-adjudication');

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

async function verify() {
  const [dataset, recalls2000, recalls2002] = await Promise.all([
    fetchBuffer(OTHER_SOURCES.datasets.url),
    fetchBuffer(OTHER_SOURCES.recalls2000.url),
    fetchBuffer(OTHER_SOURCES.recalls2002.url),
  ]);
  const checks = [
    { key: 'datasets', url: OTHER_SOURCES.datasets.url, status: dataset.status, finalUrl: dataset.finalUrl, passed: dataset.status === 200 && /datasets|recalls/i.test(dataset.buffer.toString('utf8')) },
    { key: 'recalls2000', url: OTHER_SOURCES.recalls2000.url, status: recalls2000.status, finalUrl: recalls2000.finalUrl, passed: recalls2000.status === 200 && /01V031000/.test(recalls2000.buffer.toString('utf8')) },
    { key: 'recalls2002', url: OTHER_SOURCES.recalls2002.url, status: recalls2002.status, finalUrl: recalls2002.finalUrl, passed: recalls2002.status === 200 && /04V421000/.test(recalls2002.buffer.toString('utf8')) },
  ];
  return {
    passed: checks.every((check) => check.passed),
    communicationTotal: 455,
    recallTotal: 78,
    pdfCount: 0,
    pdfDocumentPageCount: 0,
    visuallyReviewedPages: 0,
    pdfChecks: [],
    otherChecks: checks,
  };
}

if (require.main === module) verify().then((result) => {
  console.log(JSON.stringify(process.argv.includes('--compact')
    ? { passed: result.passed, communicationTotal: result.communicationTotal, recallTotal: result.recallTotal, pdfCount: result.pdfCount, failures: result.otherChecks.filter((check) => !check.passed).map((check) => check.key) }
    : result, null, 2));
  if (!result.passed) process.exitCode = 1;
}).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { verify };
