/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { MISMATCH_SOURCES, REWRITE_CARDS, SOURCES } = require('./build-honda-pilot-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-pilot-adjudication-2026-08-06.json');
const JSON_CAMPAIGNS = { ignitionRecallExcludesPilot: '02V120000' };
const SOURCE_SCOPES = Object.entries({ ...SOURCES, ...MISMATCH_SOURCES }).map(([key, url]) => ({
  key, url,
  expectedHost: url.includes('api.nhtsa.gov') ? 'api.nhtsa.gov' : 'static.nhtsa.gov',
  expectedCampaign: JSON_CAMPAIGNS[key] || null,
}));

async function verifySource(scope) {
  try {
    const response = await fetch(scope.url, { headers: { 'User-Agent': 'au7o-known-issue-source-verifier/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    const blocked = [401, 403, 429].includes(response.status);
    if (blocked) return { ...scope, status: response.status, verdict: 'access-blocked', passed: false };
    const hostMatches = new URL(response.url).hostname === scope.expectedHost;
    let passed = false;
    let detail = '';
    if (scope.expectedCampaign) {
      try {
        const payload = JSON.parse(bytes.toString('utf8'));
        passed = response.ok && hostMatches && Array.isArray(payload.results) && payload.results.some((item) => item.NHTSACampaignNumber === scope.expectedCampaign);
        detail = `campaign=${scope.expectedCampaign}`;
      } catch (error) {
        detail = `invalid-json:${String(error.message || error)}`;
      }
    } else {
      passed = response.ok && hostMatches && (response.headers.get('content-type') || '').toLowerCase().includes('pdf') && bytes.subarray(0, 5).toString('ascii') === '%PDF-' && bytes.length > 1_000;
      detail = `pdfBytes=${bytes.length}`;
    }
    return { ...scope, status: response.status, finalUrl: response.url, contentType: response.headers.get('content-type') || '', bytes: bytes.length, detail, verdict: passed ? 'verified' : 'failed', passed };
  } catch (error) {
    const accessBlocked = /fetch failed|timed? out|econnreset|enotfound/i.test(String(error?.message)) || ['AbortError', 'TimeoutError'].includes(error?.name);
    return { ...scope, error: String(error?.message || error), verdict: accessBlocked ? 'access-blocked' : 'failed', passed: false };
  }
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const rows = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  const expectedRewriteUrls = [...new Set(Object.values(REWRITE_CARDS).flatMap((card) => card.citations.map((item) => item.url)))].sort();
  const packetUrls = [...new Set(rows.flatMap((row) => row.proposal.citations.map((item) => item.url)))].sort();
  const scopeUrls = SOURCE_SCOPES.map((item) => item.url).sort();
  const expectedScopeUrls = [...new Set([...Object.values(SOURCES), ...Object.values(MISMATCH_SOURCES)])].sort();
  const scopeErrors = [];
  if (rows.length !== 11) scopeErrors.push('expected eleven rewrite rows');
  if (JSON.stringify(packetUrls) !== JSON.stringify(expectedRewriteUrls)) scopeErrors.push('packet rewrite source map mismatch');
  if (JSON.stringify([...new Set(scopeUrls)].sort()) !== JSON.stringify(expectedScopeUrls)) scopeErrors.push('verifier source map mismatch');
  const results = [];
  for (const scope of SOURCE_SCOPES) results.push(await verifySource(scope));
  const verified = results.filter((item) => item.verdict === 'verified');
  const failures = results.filter((item) => item.verdict === 'failed');
  const blocked = results.filter((item) => item.verdict === 'access-blocked');
  const output = { passed: !scopeErrors.length && !failures.length && !blocked.length && verified.length === SOURCE_SCOPES.length, rewriteRowsChecked: rows.length, sourceLinksChecked: results.length, verifiedCount: verified.length, accessBlockedCount: blocked.length, failureCount: failures.length, scopeErrors, accessBlocked: blocked, failures, results };
  console.log(JSON.stringify(output, null, 2));
  if (!output.passed) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { SOURCE_SCOPES, verifySource };
