/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { inspect } = require('./inspect-lincoln-source-inventory');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const MODEL_ALIASES = ['AVIATOR', 'AVIATOR PHEV'];
const DIRECT_MODEL_COMMUNICATIONS = new Set(['10238283']);

function communicationId(url) { return (String(url).match(/\/MC-(\d+)-/i) || [])[1] || ''; }
function campaignId(url) { const match = String(url).match(/(?:RCLRPT|RCAK|RCMN|RCONL|RCLQRT|RCRN)-(\d{2}V\d{3})-/i); return match ? `${match[1].toUpperCase()}000` : ''; }
function isSearchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const records = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Aviator').sort((a, b) => a.id.localeCompare(b.id));
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const communicationIds = new Set(inventory.relevantCommunications.map((row) => row.id));
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const checks = [];
  for (const row of records) {
    for (const citation of row.citations || []) {
      const url = citation.url || '';
      const documentId = communicationId(url);
      const campaign = campaignId(url);
      let verdict = 'secondary-or-generic-source';
      if (documentId) verdict = communicationIds.has(documentId) ? 'exact-model-communication' : DIRECT_MODEL_COMMUNICATIONS.has(documentId) ? 'direct-model-communication' : 'wrong-model-or-missing-communication';
      else if (campaign) verdict = campaigns.has(campaign) ? 'exact-model-recall-campaign' : 'wrong-model-or-missing-recall';
      else if (url.startsWith('https://www.nhtsa.gov/')) verdict = 'generic-nhtsa-page';
      else if (url.startsWith('https://media.ford.com/')) verdict = 'manufacturer-page';
      checks.push({ id: row.id, title: citation.title || '', url, documentId, campaign, verdict, searchStyle: isSearchStyle(url) });
    }
  }
  const verdictCounts = checks.reduce((counts, check) => ({ ...counts, [check.verdict]: (counts[check.verdict] || 0) + 1 }), {});
  return {
    passed: records.length === 28 && checks.every((check) => !check.searchStyle && !check.verdict.startsWith('wrong-model')),
    modelAliases: MODEL_ALIASES,
    rowCount: records.length,
    communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    recallCounts: inventory.recallCounts,
    recallTotal: inventory.recallRows.length,
    campaignCount: campaigns.size,
    verdictCounts,
    problems: checks.filter((check) => check.searchStyle || check.verdict.startsWith('wrong-model')),
    secondaryAndGeneric: checks.filter((check) => ['secondary-or-generic-source', 'generic-nhtsa-page'].includes(check.verdict)),
    checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { MODEL_ALIASES, SNAPSHOT, analyze, campaignId, communicationId, isSearchStyle };
