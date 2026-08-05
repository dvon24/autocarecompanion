/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const {
  PDF_SCOPES,
  RECALL_SCOPES,
  REWRITE_CARDS,
} = require('./build-honda-accord-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-accord-adjudication-2026-08-05.json');
const USER_AGENT = 'au7o-known-issue-source-verifier/1.0';

async function verifyPdf(scope) {
  const response = await fetch(scope.url, {
    headers: { Range: 'bytes=0-4', 'User-Agent': USER_AGENT },
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || '';
  const magic = bytes.subarray(0, 5).toString('ascii');
  return {
    kind: 'primary-document-pdf',
    id: scope.id,
    document: scope.document,
    url: scope.url,
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
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json();
  return { url, response, body };
}

function verifyRecall(scope, campaignResponse) {
  const exactCampaign = `${scope.campaign}000`.toUpperCase();
  const matching = (campaignResponse.body.results || []).filter((result) => (
    String(result.NHTSACampaignNumber).toUpperCase() === exactCampaign
      && String(result.Make).toUpperCase() === 'HONDA'
      && scope.models.includes(String(result.Model).toUpperCase())
  ));
  const actualYears = [...new Set(matching.map((result) => Number(result.ModelYear)).filter(Number.isFinite))].sort();
  const evidence = matching.map((result) => [
    result.Component,
    result.Summary,
    result.Consequence,
    result.Remedy,
  ].join(' ')).join(' ').toLowerCase();
  const missingYears = scope.years.filter((year) => !actualYears.includes(year));
  const missingTerms = scope.terms.filter((term) => !evidence.includes(term.toLowerCase()));
  return {
    kind: 'recall-api',
    id: scope.id,
    campaign: scope.campaign,
    url: campaignResponse.url,
    status: campaignResponse.response.status,
    models: scope.models,
    expectedYears: scope.years,
    actualYears,
    missingYears,
    missingTerms,
    passed: campaignResponse.response.ok && matching.length > 0 && missingYears.length === 0 && missingTerms.length === 0,
  };
}

function configuredUrlsById() {
  const urls = new Map();
  for (const id of Object.keys(REWRITE_CARDS)) urls.set(id, []);
  for (const scope of RECALL_SCOPES) {
    urls.get(scope.id)?.push(`https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${scope.campaign}000`);
  }
  for (const scope of PDF_SCOPES) urls.get(scope.id)?.push(scope.url);
  return urls;
}

function sameArray(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const rewriteRows = packet.rows.filter((row) => row.action === 'rewrite_same_identity');
  const rewriteIds = new Set(rewriteRows.map((row) => row.id));
  const configured = configuredUrlsById();
  const scopeErrors = [];

  for (const id of rewriteIds) {
    if (!configured.has(id) || configured.get(id).length === 0) scopeErrors.push(`${id}: rewrite lacks a source scope`);
  }
  for (const id of configured.keys()) {
    if (!rewriteIds.has(id)) scopeErrors.push(`${id}: configured source is not a packet rewrite`);
  }
  for (const row of rewriteRows) {
    const actual = row.proposal.citations.map((citation) => citation.url);
    const expected = configured.get(row.id) || [];
    if (!sameArray(actual, expected)) scopeErrors.push(`${row.id}: packet citations do not match configured live checks`);
  }

  const campaigns = [...new Set(RECALL_SCOPES.map((scope) => scope.campaign))];
  const entries = await Promise.all(campaigns.map(async (campaign) => [campaign, await loadCampaign(campaign)]));
  const campaignByNumber = new Map(entries);
  const recalls = RECALL_SCOPES.map((scope) => verifyRecall(scope, campaignByNumber.get(scope.campaign)));
  const documents = await Promise.all(PDF_SCOPES.map(verifyPdf));
  const results = [...recalls, ...documents];
  const failures = results.filter((result) => !result.passed);
  const output = {
    passed: scopeErrors.length === 0 && failures.length === 0,
    rewriteRowsChecked: rewriteRows.length,
    recallMappingsChecked: recalls.length,
    uniqueCampaignsChecked: campaigns.length,
    primaryDocumentsChecked: documents.length,
    scopeErrors,
    failures,
    results,
  };
  console.log(JSON.stringify(output, null, 2));
  if (!output.passed) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  configuredUrlsById,
  loadCampaign,
  sameArray,
  verifyPdf,
  verifyRecall,
};
