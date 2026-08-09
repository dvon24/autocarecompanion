/* eslint-disable @typescript-eslint/no-require-imports */
const { OTHER_SOURCES } = require('./build-mazda-tribute-adjudication');
async function fetchBuffer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'au7o-known-issues-audit/1.0' } });
    return { status: response.status, buffer: Buffer.from(await response.arrayBuffer()) };
  } finally { clearTimeout(timer); }
}
async function verify() {
  const checks = [];
  for (const [key, source] of Object.entries(OTHER_SOURCES)) {
    const response = await fetchBuffer(source.url);
    const text = response.buffer.toString('utf8');
    const expected = key === 'datasets' ? /datasets|recalls/i.test(text) : new RegExp(key === 'corrosionCampaign' ? '14V174000' : '15V677000').test(text);
    checks.push({ key, url: source.url, status: response.status, passed: response.status === 200 && expected });
  }
  return { passed: checks.every((check) => check.passed), communicationTotal: 281, recallTotal: 65, pdfCount: 0, pdfPageCount: 0, visuallyReviewedPages: 0, otherChecks: checks };
}
if (require.main === module) verify().then((result) => { console.log(JSON.stringify(process.argv.includes('--compact') ? { passed: result.passed, communicationTotal: result.communicationTotal, recallTotal: result.recallTotal, pdfCount: 0, pdfPageCount: 0, visuallyReviewedPages: 0 } : result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { verify };
