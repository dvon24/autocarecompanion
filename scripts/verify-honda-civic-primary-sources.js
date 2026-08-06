/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const {
  REWRITE_CARDS,
  SOURCES,
} = require('./build-honda-civic-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-civic-adjudication-2026-08-06.json');
const USER_AGENT = 'au7o-known-issue-source-verifier/1.0';

const SOURCE_SCOPES = Object.entries(SOURCES).map(([key, url]) => ({
  key,
  kind: url.includes('/rcl/') ? 'recall-pdf' : 'manufacturer-communication-pdf',
  url,
  expectedHost: 'static.nhtsa.gov',
}));

async function verifySource(scope) {
  try {
    const response = await fetch(scope.url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || '';
    const finalHost = new URL(response.url).hostname;
    const pdfMagic = bytes.subarray(0, 5).toString('ascii');
    const loginRedirect = /\/acl_users\/credentials_cookie_auth\/require_login/i.test(new URL(response.url).pathname);
    const blockedStatus = [401, 403, 429].includes(response.status);
    if (loginRedirect || blockedStatus) {
      return {
        ...scope,
        status: response.status,
        finalUrl: response.url,
        contentType,
        bytes: bytes.length,
        verdict: 'access-blocked',
        passed: false,
      };
    }
    const passed = response.ok
      && finalHost === scope.expectedHost
      && (contentType.toLowerCase().includes('pdf') || pdfMagic === '%PDF-')
      && bytes.length > 1_000;
    return {
      ...scope,
      status: response.status,
      finalUrl: response.url,
      contentType,
      bytes: bytes.length,
      pdfMagic,
      verdict: passed ? 'verified' : 'failed',
      passed,
    };
  } catch (error) {
    const blocked = error?.name === 'TimeoutError'
      || error?.name === 'AbortError'
      || /fetch failed|timed? out|econnreset|enotfound/i.test(String(error?.message));
    return {
      ...scope,
      error: String(error?.message || error),
      verdict: blocked ? 'access-blocked' : 'failed',
      passed: false,
    };
  }
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const rewriteRows = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  const expectedUrls = [...new Set(Object.values(REWRITE_CARDS).flatMap((card) => card.citations.map((item) => item.url)))].sort();
  const packetUrls = [...new Set(rewriteRows.flatMap((row) => row.proposal.citations.map((item) => item.url)))].sort();
  const scopeUrls = SOURCE_SCOPES.map((scope) => scope.url).sort();
  const scopeErrors = [];
  if (rewriteRows.length !== 14) scopeErrors.push('packet does not contain the fourteen approved rewrite rows');
  if (JSON.stringify(packetUrls) !== JSON.stringify(expectedUrls)) scopeErrors.push('packet citation URLs differ from rewrite whitelist');
  if (JSON.stringify(scopeUrls) !== JSON.stringify(expectedUrls)) scopeErrors.push('live-check scope differs from rewrite whitelist');

  const results = [];
  for (const scope of SOURCE_SCOPES) results.push(await verifySource(scope));
  const verified = results.filter((result) => result.verdict === 'verified');
  const accessBlocked = results.filter((result) => result.verdict === 'access-blocked');
  const failures = results.filter((result) => result.verdict === 'failed');
  const output = {
    passed: scopeErrors.length === 0 && failures.length === 0 && verified.length >= 14,
    rewriteRowsChecked: rewriteRows.length,
    sourceLinksChecked: results.length,
    verifiedCount: verified.length,
    accessBlockedCount: accessBlocked.length,
    failureCount: failures.length,
    scopeErrors,
    accessBlocked,
    failures,
    results,
  };
  console.log(JSON.stringify(output, null, 2));
  if (!output.passed) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  SOURCE_SCOPES,
  verifySource,
};
