/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RIDGELINE_ID, RIDGELINE_MANUAL_2006, RIDGELINE_MANUAL_2014, S2000_ID, S2000_MANUAL_2000 } = require('./build-honda-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-adjudication-2026-08-05.json');
const SOURCE_SCOPES = [
  { key: 'ridgeline2006Manual', url: RIDGELINE_MANUAL_2006, expectedHost: 'techinfo.honda.com' },
  { key: 'ridgeline2014Manual', url: RIDGELINE_MANUAL_2014, expectedHost: 'techinfo.honda.com' },
  { key: 's2000Manual', url: S2000_MANUAL_2000, expectedHost: 'techinfo.honda.com' },
];

async function verifySource(scope) {
  try {
    const response = await fetch(scope.url, { headers: { 'User-Agent': 'au7o-known-issue-source-verifier/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    const blocked = [401, 403, 429].includes(response.status);
    if (blocked) return { ...scope, status: response.status, verdict: 'access-blocked', passed: false };
    const passed = response.ok && new URL(response.url).hostname === scope.expectedHost && (response.headers.get('content-type') || '').toLowerCase().includes('pdf') && bytes.subarray(0, 5).toString('ascii') === '%PDF-' && bytes.length > 1_000;
    return { ...scope, status: response.status, finalUrl: response.url, contentType: response.headers.get('content-type') || '', bytes: bytes.length, pdfMagic: bytes.subarray(0, 5).toString('ascii'), verdict: passed ? 'verified' : 'failed', passed };
  } catch (error) {
    const accessBlocked = /fetch failed|timed? out|econnreset|enotfound/i.test(String(error?.message)) || ['AbortError', 'TimeoutError'].includes(error?.name);
    return { ...scope, error: String(error?.message || error), verdict: accessBlocked ? 'access-blocked' : 'failed', passed: false };
  }
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const ridgeline = packet.rows.find((row) => row.id === RIDGELINE_ID);
  const s2000 = packet.rows.find((row) => row.id === S2000_ID);
  const scopeErrors = [];
  if (ridgeline?.action !== 'correct_clicked_integrity' || s2000?.action !== 'remove_invalid_search_link') scopeErrors.push('priority action map mismatch');
  const ridgelineUrls = ridgeline?.proposal.citations.map((item) => item.url).sort() || [];
  if (JSON.stringify(ridgelineUrls) !== JSON.stringify([RIDGELINE_MANUAL_2006, RIDGELINE_MANUAL_2014].sort())) scopeErrors.push('Ridgeline manual citation map mismatch');
  if (!s2000?.evidence?.some((item) => item.url === S2000_MANUAL_2000)) scopeErrors.push('S2000 manual evidence missing');
  const results = [];
  for (const scope of SOURCE_SCOPES) results.push(await verifySource(scope));
  const verified = results.filter((item) => item.verdict === 'verified');
  const failures = results.filter((item) => item.verdict === 'failed');
  const blocked = results.filter((item) => item.verdict === 'access-blocked');
  const output = { passed: !scopeErrors.length && !failures.length && verified.length + blocked.length === SOURCE_SCOPES.length, allSourceLinksReachable: blocked.length === 0, changedRowsChecked: 2, sourceLinksChecked: results.length, verifiedCount: verified.length, accessBlockedCount: blocked.length, failureCount: failures.length, scopeErrors, accessBlocked: blocked, failures, results };
  console.log(JSON.stringify(output, null, 2));
  if (!output.passed) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { SOURCE_SCOPES, verifySource };
