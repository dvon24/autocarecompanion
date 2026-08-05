/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const { RECALL_SCOPES, TSB_SCOPES } = require('./build-gmc-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(PROJECT_ROOT, 'data', 'known-issue-gmc-adjudication-2026-08-05.json');

async function verifyPdf(url) {
  const response = await fetch(url, {
    headers: { Range: 'bytes=0-4', 'User-Agent': 'au7o-known-issue-source-verifier/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || '';
  const magic = bytes.subarray(0, 5).toString('ascii');
  return {
    kind: 'bulletin-pdf',
    url,
    status: response.status,
    contentType,
    pdfMagic: magic,
    passed: response.ok
      && response.url.startsWith('https://static.nhtsa.gov/')
      && (contentType.toLowerCase().includes('pdf') || magic === '%PDF-'),
  };
}

async function loadCampaign(campaign) {
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}000`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'au7o-known-issue-source-verifier/1.0' },
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json();
  return { url, response, body };
}

function verifyRecall(id, scope, campaignResponse) {
  const exactCampaign = `${scope.campaign}000`.toUpperCase();
  const matching = (campaignResponse.body.results || []).filter((result) => (
    String(result.NHTSACampaignNumber).toUpperCase() === exactCampaign
      && String(result.Make).toUpperCase() === 'GMC'
      && String(result.Model).toUpperCase() === scope.model
  ));
  const actualYears = [...new Set(matching.map((result) => Number(result.ModelYear)).filter(Number.isFinite))].sort();
  const combined = matching.map((result) => [result.Summary, result.Consequence, result.Remedy].join(' ')).join(' ').toLowerCase();
  const missingYears = scope.years.filter((year) => !actualYears.includes(year));
  const missingTerms = scope.terms.filter((term) => !combined.includes(term.toLowerCase()));
  return {
    kind: 'recall-api',
    id,
    campaign: scope.campaign,
    url: campaignResponse.url,
    status: campaignResponse.response.status,
    model: scope.model,
    expectedYears: scope.years,
    actualYears,
    missingYears,
    missingTerms,
    passed: campaignResponse.response.ok && matching.length > 0 && missingYears.length === 0 && missingTerms.length === 0,
  };
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const rewriteIds = new Set(packet.rows.filter((row) => row.action === 'rewrite_then_publish').map((row) => row.id));
  const configuredIds = new Set([...Object.keys(RECALL_SCOPES), ...Object.keys(TSB_SCOPES)]);
  const scopeErrors = [
    ...[...rewriteIds].filter((id) => !configuredIds.has(id)).map((id) => `${id}: rewrite lacks source scope`),
    ...[...configuredIds].filter((id) => !rewriteIds.has(id)).map((id) => `${id}: source scope is not a rewrite`),
  ];

  const campaigns = [...new Set(Object.values(RECALL_SCOPES).map((scope) => scope.campaign))];
  const campaignEntries = await Promise.all(campaigns.map(async (campaign) => [campaign, await loadCampaign(campaign)]));
  const campaignByNumber = new Map(campaignEntries);
  const recalls = Object.entries(RECALL_SCOPES).map(([id, scope]) => verifyRecall(id, scope, campaignByNumber.get(scope.campaign)));

  const pdfUrls = [...new Set(Object.values(TSB_SCOPES).map((scope) => scope.url))];
  const bulletins = await Promise.all(pdfUrls.map(verifyPdf));
  const results = [...recalls, ...bulletins];
  const failures = results.filter((result) => !result.passed);
  const output = {
    passed: scopeErrors.length === 0 && failures.length === 0,
    recallRowsChecked: recalls.length,
    uniqueCampaignsChecked: campaigns.length,
    uniqueBulletinsChecked: bulletins.length,
    scopeErrors,
    failures,
    results,
  };
  console.log(JSON.stringify(output, null, 2));
  if (!output.passed) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = { loadCampaign, verifyPdf, verifyRecall };
