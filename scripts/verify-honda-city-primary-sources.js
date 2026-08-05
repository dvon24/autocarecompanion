/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const {
  HONDA_PASSENGER_2012,
  HONDA_DRIVER_PROGRESS,
  HONDA_RECALL_LOOKUP,
  REWRITE_CARDS,
  SENACON_2010_2011,
  SENACON_DRIVER_2012_2014,
  TAKATA_ID,
} = require('./build-honda-city-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-city-adjudication-2026-08-06.json');
const USER_AGENT = 'au7o-known-issue-source-verifier/1.0';

const SOURCE_SCOPES = [
  {
    kind: 'government-pdf',
    url: SENACON_2010_2011,
    expectedHost: 'www.mpmg.mp.br',
  },
  {
    kind: 'government-pdf',
    url: SENACON_DRIVER_2012_2014,
    expectedHost: 'central3.to.gov.br',
  },
  {
    kind: 'manufacturer-government-report-pdf',
    url: HONDA_DRIVER_PROGRESS,
    expectedHost: 'mpce.mp.br',
  },
  {
    kind: 'manufacturer-report-pdf',
    url: HONDA_PASSENGER_2012,
    expectedHost: 'goias.gov.br',
  },
  {
    kind: 'manufacturer-html',
    url: HONDA_RECALL_LOOKUP,
    expectedHost: 'www.honda.com.br',
    expectedTerms: ['City', 'chassi', 'gratuito'],
  },
];

function normalize(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

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
    const isPdf = scope.kind.endsWith('pdf');
    const text = isPdf ? '' : normalize(bytes.toString('utf8'));
    const missingTerms = (scope.expectedTerms || []).filter((term) => !text.includes(normalize(term)));
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
      && (isPdf ? (contentType.toLowerCase().includes('pdf') || pdfMagic === '%PDF-') : missingTerms.length === 0);
    return {
      ...scope,
      status: response.status,
      finalUrl: response.url,
      contentType,
      bytes: bytes.length,
      pdfMagic,
      missingTerms,
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
  const row = packet.rows.find((candidate) => candidate.id === TAKATA_ID);
  const expectedUrls = REWRITE_CARDS[TAKATA_ID].citations.map((citation) => citation.url).sort();
  const packetUrls = (row?.proposal?.citations || []).map((citation) => citation.url).sort();
  const scopeUrls = SOURCE_SCOPES.map((scope) => scope.url).sort();
  const scopeErrors = [];
  if (row?.action !== 'rewrite_same_identity') scopeErrors.push('Takata row is not the one approved rewrite');
  if (JSON.stringify(packetUrls) !== JSON.stringify(expectedUrls)) scopeErrors.push('packet citation URLs differ from rewrite whitelist');
  if (JSON.stringify(scopeUrls) !== JSON.stringify(expectedUrls)) scopeErrors.push('live-check scope differs from rewrite whitelist');

  const results = await Promise.all(SOURCE_SCOPES.map(verifySource));
  const verified = results.filter((result) => result.verdict === 'verified');
  const accessBlocked = results.filter((result) => result.verdict === 'access-blocked');
  const failures = results.filter((result) => result.verdict === 'failed');
  const output = {
    passed: scopeErrors.length === 0 && failures.length === 0 && verified.length >= 4,
    rewriteRowsChecked: row ? 1 : 0,
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
  normalize,
  verifySource,
};
