/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { inspect } = require('./inspect-mazda-source-inventory');
const { MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, SNAPSHOT } = require('./build-mazda-cx-30-adjudication');

const EXACT_WEB_URLS = new Set([...Object.values(OTHER_SOURCES), ...Object.values(PDF_SOURCES)].map((source) => source.url));
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-30').sort((a, b) => a.id.localeCompare(b.id));
  const packet = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const communicationIds = new Set(inventory.relevantCommunications.map((row) => row.id));
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const missingRequiredCommunicationIds = REQUIRED_COMMUNICATION_IDS.filter((id) => !communicationIds.has(id));
  const checks = [];
  for (const row of records) for (const source of row.citations || []) checks.push({ id: row.id, url: source.url, verdict: EXACT_WEB_URLS.has(source.url) ? 'exact-primary-record' : 'unknown-source', searchStyle: searchStyle(source.url) });
  const problems = checks.filter((check) => check.searchStyle || check.verdict !== 'exact-primary-record');
  const verdictCounts = checks.reduce((out, check) => ({ ...out, [check.verdict]: (out[check.verdict] || 0) + 1 }), {});
  return {
    passed: snapshot.records.length === 259 && frozen.length === 9 && records.length === 9 && inventory.communicationTotal === 830 && inventory.recallRows.length === 12 && campaigns.size === 7 && missingRequiredCommunicationIds.length === 0 && problems.length === 0,
    makeSnapshotCount: snapshot.records.length, rowCount: records.length, modelAliases: MODEL_ALIASES,
    communicationCounts: inventory.communicationCounts, communicationTotal: inventory.communicationTotal,
    requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS, missingRequiredCommunicationIds,
    recallCounts: inventory.recallCounts, recallTotal: inventory.recallRows.length, campaignCount: campaigns.size,
    campaigns: [...campaigns].sort(), pdfCount: Object.keys(PDF_SOURCES).length, verdictCounts, problems, checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { EXACT_WEB_URLS, analyze, searchStyle };
