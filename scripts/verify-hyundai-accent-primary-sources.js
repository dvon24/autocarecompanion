/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { REWRITE_CARDS, SOURCES } = require('./build-hyundai-accent-adjudication');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-hyundai-accent-adjudication-2026-08-06.json');
const API_SCOPES = [
  { key: 'absApi', url: SOURCES.absApi, campaign: '23V651000', years: ['2012', '2013', '2014', '2015'], component: 'ANTILOCK' },
  { key: 'stopLamp2009', url: SOURCES.stopLamp2009, campaign: '09V122000', years: ['2006', '2007'], component: 'BRAKE LIGHTS:SWITCH' },
  { key: 'stopLamp2013', url: SOURCES.stopLamp2013, campaign: '13V113000', years: ['2006', '2007', '2008', '2009'], component: 'BRAKE LIGHTS:SWITCH' },
  { key: 'stopLamp2015', url: SOURCES.stopLamp2015, campaign: '15V566000', years: ['2009', '2010', '2011'], component: 'BRAKE LIGHTS:SWITCH' },
  { key: 'pretensionerApi', url: SOURCES.pretensionerApi, campaign: '22V354000', years: ['2020', '2021', '2022'], component: 'SEAT BELTS:FRONT' },
];
const PDF_SCOPES = [
  { key: 'absReport', url: SOURCES.absReport },
  { key: 'pretensionerReport', url: SOURCES.pretensionerReport },
];

async function verifyApi(scope) {
  try {
    const response = await fetch(scope.url, { headers: { 'User-Agent': 'au7o-known-issue-source-verifier/1.0' }, signal: AbortSignal.timeout(30_000) });
    const payload = await response.json();
    const rows = (payload.results || []).filter((row) => row.Make === 'HYUNDAI' && row.Model === 'ACCENT' && row.NHTSACampaignNumber === scope.campaign);
    const years = [...new Set(rows.map((row) => row.ModelYear))].sort();
    const passed = response.ok && JSON.stringify(years) === JSON.stringify(scope.years) && rows.every((row) => String(row.Component).includes(scope.component));
    return { ...scope, status: response.status, AccentYears: years, resultCount: rows.length, verdict: passed ? 'verified' : 'failed', passed };
  } catch (error) { return { ...scope, error: String(error?.message || error), verdict: 'access-blocked', passed: false }; }
}
async function verifyPdf(scope) {
  try {
    const response = await fetch(scope.url, { headers: { 'User-Agent': 'au7o-known-issue-source-verifier/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    const passed = response.ok && new URL(response.url).hostname === 'static.nhtsa.gov' && (response.headers.get('content-type') || '').toLowerCase().includes('pdf') && bytes.subarray(0, 5).toString('ascii') === '%PDF-' && bytes.length > 1_000;
    return { ...scope, status: response.status, finalUrl: response.url, bytes: bytes.length, pdfMagic: bytes.subarray(0, 5).toString('ascii'), verdict: passed ? 'verified' : 'failed', passed };
  } catch (error) { return { ...scope, error: String(error?.message || error), verdict: 'access-blocked', passed: false }; }
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  const expectedUrls = [...new Set(Object.values(REWRITE_CARDS).flatMap((card) => card.citations.map((item) => item.url)))].sort();
  const packetUrls = [...new Set(rewrites.flatMap((row) => row.proposal.citations.map((item) => item.url)))].sort();
  const scopeErrors = [];
  if (rewrites.length !== 3) scopeErrors.push('expected three rewrite rows');
  if (JSON.stringify(packetUrls) !== JSON.stringify(expectedUrls)) scopeErrors.push('packet source map mismatch');
  if (JSON.stringify([...API_SCOPES, ...PDF_SCOPES].map((scope) => scope.url).sort()) !== JSON.stringify(Object.values(SOURCES).sort())) scopeErrors.push('verifier source map mismatch');
  const results = [];
  for (const scope of API_SCOPES) results.push(await verifyApi(scope));
  for (const scope of PDF_SCOPES) results.push(await verifyPdf(scope));
  const failures = results.filter((item) => item.verdict === 'failed');
  const blocked = results.filter((item) => item.verdict === 'access-blocked');
  const verified = results.filter((item) => item.verdict === 'verified');
  const output = { passed: !scopeErrors.length && !failures.length && !blocked.length && verified.length === results.length, rewriteRowsChecked: rewrites.length, sourceLinksChecked: results.length, verifiedCount: verified.length, accessBlockedCount: blocked.length, failureCount: failures.length, scopeErrors, accessBlocked: blocked, failures, results };
  console.log(JSON.stringify(output, null, 2));
  if (!output.passed) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { API_SCOPES, PDF_SCOPES, verifyApi, verifyPdf };
