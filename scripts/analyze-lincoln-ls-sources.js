/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { inspect } = require('./inspect-lincoln-source-inventory');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-ls-adjudication-2026-08-09.json');
const MODEL_ALIASES = ['LS'];
const EXACT_SOURCES = new Map([
  ['https://www.fordservicecontent.com/Ford_Content/pubs/content/~WT/~MUS~LEN/3523/tsb01-21-11.pdf', 'exact-oem-tsb'],
  ['https://www.fordservicecontent.com/Ford_Content/catalog/owner_guides/00dewog1e.pdf', 'exact-oem-owner-guide'],
  ['https://www.fordservicecontent.com/Ford_Content/catalog/owner_guides/06dewog2e.pdf', 'exact-oem-owner-guide'],
]);

function isSearchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'LS');
  const packet = fs.existsSync(PACKET) ? JSON.parse(fs.readFileSync(PACKET, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const unsupportedCrossoverMentions = inventory.relevantCommunications.filter((row) => /coolant.*(?:crossover|manifold)|(?:crossover|manifold).*coolant/i.test(row.summary));
  const checks = records.flatMap((row) => (row.citations || []).map((citation) => {
    const url = citation.url || '';
    return { id: row.id, title: citation.title || '', url, verdict: EXACT_SOURCES.get(url) || 'secondary-or-generic-source', searchStyle: isSearchStyle(url) };
  }));
  const verdictCounts = checks.reduce((counts, check) => ({ ...counts, [check.verdict]: (counts[check.verdict] || 0) + 1 }), {});
  const problems = checks.filter((check) => check.searchStyle || !check.verdict.startsWith('exact-oem'));
  return {
    passed: frozen.length === 1 && records.length === 1 && inventory.communicationTotal === 357 && inventory.recallRows.length === 4 && campaigns.size === 3 && unsupportedCrossoverMentions.length === 0 && problems.length === 0,
    modelAliases: MODEL_ALIASES,
    rowCount: records.length,
    communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    recallCounts: inventory.recallCounts,
    recallTotal: inventory.recallRows.length,
    campaignCount: campaigns.size,
    coolantCrossoverCommunicationMentions: unsupportedCrossoverMentions.length,
    verdictCounts,
    problems,
    checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { EXACT_SOURCES, MODEL_ALIASES, PACKET, SNAPSHOT, analyze, isSearchStyle };
