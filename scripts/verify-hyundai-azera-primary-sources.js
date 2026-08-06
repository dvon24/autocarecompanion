/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs'); const path = require('node:path'); const { MISMATCH_SOURCES } = require('./build-hyundai-azera-adjudication');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-hyundai-azera-adjudication-2026-08-06.json');
async function verifySource([key, url]) { try { const response = await fetch(url, { headers: { 'User-Agent': 'au7o-known-issue-source-verifier/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) }); const bytes = Buffer.from(await response.arrayBuffer()); const passed = response.ok && new URL(response.url).hostname === 'static.nhtsa.gov' && (response.headers.get('content-type') || '').toLowerCase().includes('pdf') && bytes.subarray(0, 5).toString('ascii') === '%PDF-' && bytes.length > 1_000; return { key, url, status: response.status, finalUrl: response.url, bytes: bytes.length, pdfMagic: bytes.subarray(0, 5).toString('ascii'), verdict: passed ? 'verified' : 'failed', passed }; } catch (error) { return { key, url, error: String(error?.message || error), verdict: 'access-blocked', passed: false }; } }
async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const scopeErrors = [];
  if (packet.rows.some((row) => row.action !== 'keep_published_pending_source' || row.beforeSha256 !== row.proposalSha256)) scopeErrors.push('Azera packet contains a changed row');
  if (JSON.stringify(packet.mismatchSources) !== JSON.stringify(MISMATCH_SOURCES)) scopeErrors.push('mismatch source map mismatch');
  const results = []; for (const scope of Object.entries(MISMATCH_SOURCES)) results.push(await verifySource(scope));
  const failures = results.filter((item) => item.verdict === 'failed'); const blocked = results.filter((item) => item.verdict === 'access-blocked'); const verified = results.filter((item) => item.verdict === 'verified');
  const output = { passed: !scopeErrors.length && !failures.length && !blocked.length && verified.length === results.length, holdRowsChecked: packet.rows.length, mismatchLinksChecked: results.length, verifiedCount: verified.length, accessBlockedCount: blocked.length, failureCount: failures.length, scopeErrors, accessBlocked: blocked, failures, results };
  console.log(JSON.stringify(output, null, 2)); if (!output.passed) process.exitCode = 1;
}
if (require.main === module) main();
