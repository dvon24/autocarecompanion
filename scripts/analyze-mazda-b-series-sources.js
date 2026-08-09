/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { inspect } = require('./inspect-mazda-source-inventory');
const { MODEL_ALIASES, OTHER_SOURCES, OUTPUT, SNAPSHOT } = require('./build-mazda-b-series-adjudication');

const EXACT_WEB_URLS = new Set(Object.values(OTHER_SOURCES).map((source) => source.url));
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'B-Series').sort((a, b) => a.id.localeCompare(b.id));
  const packet = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const checks = [];
  for (const row of records) for (const source of row.citations || []) {
    const verdict = EXACT_WEB_URLS.has(source.url) ? 'exact-nhtsa-record-or-dataset' : 'unknown-source';
    checks.push({ id: row.id, url: source.url, verdict, searchStyle: searchStyle(source.url) });
  }
  const problems = checks.filter((check) => check.searchStyle || !check.verdict.startsWith('exact-'));
  const verdictCounts = checks.reduce((out, check) => ({ ...out, [check.verdict]: (out[check.verdict] || 0) + 1 }), {});
  return {
    passed: snapshot.records.length === 259 && frozen.length === 5 && records.length === 5 && inventory.communicationTotal === 35 && inventory.recallRows.length === 11 && campaigns.size === 3 && problems.length === 0,
    makeSnapshotCount: snapshot.records.length,
    rowCount: records.length,
    modelAliases: MODEL_ALIASES,
    communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    recallCounts: inventory.recallCounts,
    recallTotal: inventory.recallRows.length,
    campaignCount: campaigns.size,
    campaigns: [...campaigns].sort(),
    exactIssueCommunicationCount: 0,
    exactRelevantCampaignCount: 0,
    verdictCounts,
    problems,
    checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { EXACT_WEB_URLS, analyze, searchStyle };
