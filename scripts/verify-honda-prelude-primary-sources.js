/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { REWRITE_CARDS, SOURCES } = require('./build-honda-prelude-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-prelude-adjudication-2026-08-06.json');
const SOURCE_SCOPES = [
  { key: 'transmissionWarranty', url: SOURCES.transmissionWarranty, expectedHost: 'global.honda', kind: 'html', requiredTerms: ['2000 - 2001 Honda Accord, Odyssey and Prelude', 'seven years or 100,000 miles', 'slow or erratic shifting'] },
  { key: 'ballJointRecall', url: SOURCES.ballJointRecall, expectedHost: 'api.nhtsa.gov', kind: 'campaign', campaign: '99V069000', years: ['1996', '1997', '1998'], component: 'LOWER BALL JOINT' },
  { key: 'ignitionStallRecall', url: SOURCES.ignitionStallRecall, expectedHost: 'api.nhtsa.gov', kind: 'campaign', campaign: '02V120000', years: ['1997', '1998', '1999'], component: 'IGNITION:SWITCH' },
  { key: 'shiftInterlockRecall', url: SOURCES.shiftInterlockRecall, expectedHost: 'api.nhtsa.gov', kind: 'campaign', campaign: '05V025000', years: ['1997', '1998', '1999', '2000', '2001'], component: 'IGNITION:SWITCH' },
];

async function verifySource(scope) {
  try {
    const response = await fetch(scope.url, { headers: { 'User-Agent': 'au7o-known-issue-source-verifier/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
    const body = await response.text();
    const blocked = [401, 403, 429].includes(response.status);
    if (blocked) return { ...scope, status: response.status, verdict: 'access-blocked', passed: false };
    const hostMatches = new URL(response.url).hostname === scope.expectedHost;
    let passed = false;
    let detail = '';
    if (scope.kind === 'html') {
      const normalized = body.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ');
      const missingTerms = scope.requiredTerms.filter((term) => !normalized.toLowerCase().includes(term.toLowerCase()));
      passed = response.ok && hostMatches && body.length > 1_000 && missingTerms.length === 0;
      detail = `htmlBytes=${Buffer.byteLength(body)}; missingTerms=${missingTerms.join('|')}`;
    } else {
      try {
        const payload = JSON.parse(body);
        const prelude = (payload.results || []).filter((item) => item.NHTSACampaignNumber === scope.campaign && item.Model === 'PRELUDE');
        const foundYears = [...new Set(prelude.map((item) => item.ModelYear))].sort();
        passed = response.ok && hostMatches && JSON.stringify(foundYears) === JSON.stringify(scope.years) && prelude.every((item) => String(item.Component).includes(scope.component));
        detail = `campaign=${scope.campaign}; PreludeYears=${foundYears.join(',')}`;
      } catch (error) {
        detail = `invalid-json:${String(error.message || error)}`;
      }
    }
    return { ...scope, status: response.status, finalUrl: response.url, bytes: Buffer.byteLength(body), detail, verdict: passed ? 'verified' : 'failed', passed };
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
  const scopeErrors = [];
  if (rows.length !== 4) scopeErrors.push('expected four rewrite rows');
  if (JSON.stringify(packetUrls) !== JSON.stringify(expectedRewriteUrls)) scopeErrors.push('packet rewrite source map mismatch');
  if (JSON.stringify(SOURCE_SCOPES.map((item) => item.url).sort()) !== JSON.stringify([...new Set(Object.values(SOURCES))].sort())) scopeErrors.push('verifier source map mismatch');
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
