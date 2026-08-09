/* eslint-disable @typescript-eslint/no-require-imports */
const { OTHER_SOURCES } = require('./build-mazda-miata-adjudication');

async function fetchText(url) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'au7o-known-issues-audit/1.0' } });
    return { url, status: response.status, finalUrl: response.url, text: await response.text() };
  } finally { clearTimeout(timer); }
}

async function verify() {
  const datasets = await fetchText(OTHER_SOURCES.datasets.url);
  const checks = [
    { key: 'datasets', url: datasets.url, status: datasets.status, passed: datasets.status === 200 && /datasets|recalls/i.test(datasets.text) },
  ];
  return { passed: checks.every((check) => check.passed), selectedPdfCount: 0, visuallyReviewedPages: 0, checks };
}
if (require.main === module) verify().then((result) => { console.log(JSON.stringify(process.argv.includes('--compact') ? { passed: result.passed, selectedPdfCount: 0, visuallyReviewedPages: 0, checks: result.checks } : result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { verify };
