/* eslint-disable @typescript-eslint/no-require-imports */
const { inspect } = require('./inspect-nhtsa-model-source-inventory');
const { CAMPAIGNS, MODEL_ALIASES, REQUIRED_COMMUNICATION_IDS } = require('./build-mercedes-amg-gt-adjudication');

const MAKES = Object.freeze(['MERCEDES-BENZ']);
const SEARCH_TERMS = Object.freeze(['mount', 'battery', 'drain', 'telematics', 'sleep', 'MBUX', 'instrument cluster', 'display reset', 'rear axle steering', 'calibration']);

function uniqueBy(values, key) {
  const seen = new Set();
  return values.filter((value) => { const identity = key(value); if (seen.has(identity)) return false; seen.add(identity); return true; });
}

async function analyze() {
  const inventory = await inspect({ makes: MAKES, aliases: MODEL_ALIASES, terms: SEARCH_TERMS });
  const communications = uniqueBy(inventory.relevantCommunications, (row) => `${row.id}|${row.summary}`);
  const recalls = uniqueBy(inventory.recallRows, (row) => `${row.campaign}|${row.summary}|${row.remedy}`);
  const communicationIds = [...new Set(inventory.relevantCommunications.map((row) => row.id))].sort();
  const campaigns = [...new Set(inventory.recallRows.map((row) => row.campaign))].sort();
  const missingRequiredCommunicationIds = REQUIRED_COMMUNICATION_IDS.filter((id) => !communicationIds.includes(id));
  return {
    passed: inventory.communicationTotal === 1396 && inventory.relevantCommunications.length === 609 && missingRequiredCommunicationIds.length === 0 && inventory.recallRows.length === 1822 && campaigns.join('|') === CAMPAIGNS.join('|'),
    communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    relevantCommunicationRows: inventory.relevantCommunications.length,
    uniqueRelevantCommunications: communications.length,
    missingRequiredCommunicationIds,
    recallCounts: inventory.recallCounts,
    recallRows: inventory.recallRows.length,
    campaigns,
    uniqueRecallStatements: recalls.length,
  };
}

if (require.main === module) {
  analyze().then((result) => {
    const output = process.argv.includes('--compact') ? { passed: result.passed, communicationCounts: result.communicationCounts, communicationTotal: result.communicationTotal, relevantCommunicationRows: result.relevantCommunicationRows, uniqueRelevantCommunications: result.uniqueRelevantCommunications, missingRequiredCommunicationIds: result.missingRequiredCommunicationIds, recallCounts: result.recallCounts, recallRows: result.recallRows, campaignCount: result.campaigns.length, campaigns: result.campaigns } : result;
    console.log(JSON.stringify(output, null, 2));
    if (!result.passed) process.exitCode = 1;
  }).catch((error) => { console.error(error); process.exitCode = 1; });
}

module.exports = { MAKES, SEARCH_TERMS, analyze };
