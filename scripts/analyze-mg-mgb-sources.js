/* eslint-disable @typescript-eslint/no-require-imports */
const { inspect } = require('./inspect-nhtsa-model-source-inventory');
const { CAMPAIGNS, MODEL_ALIASES, SEARCH_TERMS } = require('./build-mg-mgb-adjudication');
const MAKES = Object.freeze(['MG']);

async function analyze() {
  const inventory = await inspect({ makes: MAKES, aliases: MODEL_ALIASES, terms: SEARCH_TERMS });
  const ids = [...new Set(inventory.relevantCommunications.map((row) => row.id))].sort();
  const campaigns = [...new Set(inventory.recallRows.map((row) => row.campaign))].sort();
  const passed = inventory.communicationTotal === 0
    && inventory.relevantCommunications.length === 0
    && ids.length === 0
    && inventory.recallRows.length === 16
    && campaigns.join('|') === CAMPAIGNS.join('|');
  return { passed, communicationCounts: inventory.communicationCounts, communicationTotal: inventory.communicationTotal, relevantCommunicationRows: inventory.relevantCommunications.length, uniqueRelevantCommunications: ids.length, recallCounts: inventory.recallCounts, recallRows: inventory.recallRows.length, campaigns };
}
if (require.main === module) analyze().then((result) => {
  console.log(JSON.stringify(process.argv.includes('--compact') ? { ...result, campaignCount: result.campaigns.length, campaigns: undefined } : result, null, 2));
  if (!result.passed) process.exitCode = 1;
}).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { MAKES, analyze };
