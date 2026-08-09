/* eslint-disable @typescript-eslint/no-require-imports */
const { inspect } = require('./inspect-nhtsa-model-source-inventory');
const { CAMPAIGNS, MODEL_ALIASES, REQUIRED_COMMUNICATION_IDS, SEARCH_TERMS } = require('./build-mercedes-glk-class-adjudication');
const MAKES = Object.freeze(['MERCEDES-BENZ', 'MERCEDES BENZ']);
function uniqueBy(values, key) {
  const seen = new Set();
  return values.filter((value) => { const identity = key(value); if (seen.has(identity)) return false; seen.add(identity); return true; });
}
async function analyze() {
  const inventory = await inspect({ makes: MAKES, aliases: MODEL_ALIASES, terms: SEARCH_TERMS });
  const communications = uniqueBy(inventory.relevantCommunications, (row) => `${row.id}|${row.summary}`);
  const ids = [...new Set(inventory.relevantCommunications.map((row) => row.id))].sort();
  const campaigns = [...new Set(inventory.recallRows.map((row) => row.campaign))].sort();
  const missingRequiredCommunicationIds = REQUIRED_COMMUNICATION_IDS.filter((id) => !ids.includes(id));
  const passed = inventory.communicationTotal === 241 && inventory.relevantCommunications.length === 47
    && communications.length === 24 && !missingRequiredCommunicationIds.length
    && inventory.recallRows.length === 55 && campaigns.join('|') === CAMPAIGNS.join('|');
  return {
    passed, communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    relevantCommunicationRows: inventory.relevantCommunications.length,
    uniqueRelevantCommunications: communications.length, missingRequiredCommunicationIds,
    recallCounts: inventory.recallCounts, recallRows: inventory.recallRows.length, campaigns,
  };
}
if (require.main === module) {
  analyze().then((result) => {
    console.log(JSON.stringify(process.argv.includes('--compact')
      ? { ...result, campaignCount: result.campaigns.length, campaigns: undefined }
      : result, null, 2));
    if (!result.passed) process.exitCode = 1;
  }).catch((error) => { console.error(error); process.exitCode = 1; });
}
module.exports = { MAKES, analyze };
