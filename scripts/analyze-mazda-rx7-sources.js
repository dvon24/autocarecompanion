/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { inspect } = require('./inspect-mazda-source-inventory');
const {
  CAMPAIGNS,
  MODEL_ALIASES,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  REQUIRED_COMMUNICATION_IDS,
  SEARCH_TERMS,
  SNAPSHOT,
} = require('./build-mazda-rx7-adjudication');

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'RX-7');
  const packet = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const inventory = await inspect({ aliases: MODEL_ALIASES, terms: SEARCH_TERMS });
  const communicationIds = new Set(inventory.relevantCommunications.map((row) => row.id));
  const missingRequiredCommunicationIds = REQUIRED_COMMUNICATION_IDS.filter((id) => !communicationIds.has(id));
  const campaigns = [...new Set(inventory.recallRows.map((row) => row.campaign))].sort();
  const exact = new Set(Object.values(OTHER_SOURCES).map((source) => source.url));
  const checks = records.flatMap((row) => row.citations.map((citation) => ({
    id: row.id,
    url: citation.url,
    exactPrimarySource: exact.has(citation.url),
    searchStyle: /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(citation.url),
  })));
  const problems = checks.filter((check) => !check.exactPrimarySource || check.searchStyle);
  return {
    passed: snapshot.records.length === 259
      && frozen.length === 19
      && records.length === 19
      && inventory.communicationTotal === 42
      && inventory.relevantCommunications.length === 1
      && inventory.recallRows.length === 22
      && campaigns.join('|') === CAMPAIGNS.join('|')
      && missingRequiredCommunicationIds.length === 0
      && problems.length === 0
      && Object.keys(PDF_SOURCES).length === 0,
    makeSnapshotCount: snapshot.records.length,
    rowCount: records.length,
    communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    relevantRows: inventory.relevantCommunications.length,
    requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
    missingRequiredCommunicationIds,
    recallCounts: inventory.recallCounts,
    recallTotal: inventory.recallRows.length,
    campaignCount: campaigns.length,
    campaigns,
    citationUses: checks.length,
    uniqueCitationCount: new Set(checks.map((check) => check.url)).size,
    pdfCount: 0,
    pdfPageCount: 0,
    visuallyReviewedPages: 0,
    checks,
    problems,
  };
}

if (require.main === module) {
  analyze().then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { analyze };
