/* eslint-disable @typescript-eslint/no-require-imports */
const { inspect } = require('./inspect-nhtsa-model-source-inventory');
const { BULLETIN_INVENTORY, CAMPAIGNS, MODEL_ALIASES, RELEVANT_DOCUMENT_IDS, SEARCH_TERMS } = require('./build-mini-clubman-adjudication');
const MAKES = Object.freeze(['MINI']);

async function analyze() {
  const inventory = await inspect({ makes: MAKES, aliases: MODEL_ALIASES, terms: SEARCH_TERMS });
  const ids = [...new Set(inventory.relevantCommunications.map((row) => row.id))].sort();
  const campaigns = [...new Set(inventory.recallRows.map((row) => row.campaign))].sort();
  const passed = inventory.communicationTotal === BULLETIN_INVENTORY.totalRows
    && inventory.relevantCommunications.length === BULLETIN_INVENTORY.relevantRowCount
    && ids.join('|') === RELEVANT_DOCUMENT_IDS.join('|')
    && inventory.recallCounts.pre === 1
    && inventory.recallCounts.post === 47
    && inventory.recallRows.length === 48
    && campaigns.join('|') === CAMPAIGNS.join('|');
  return { passed, communicationCounts: inventory.communicationCounts, communicationTotal: inventory.communicationTotal, relevantCommunicationRows: inventory.relevantCommunications.length, uniqueRelevantCommunications: ids.length, relevantDocumentIds: ids, recallCounts: inventory.recallCounts, recallRows: inventory.recallRows.length, campaigns };
}
if (require.main === module) analyze().then((result) => {
  console.log(JSON.stringify(process.argv.includes('--compact') ? { ...result, relevantDocumentIds: undefined, campaigns: undefined, campaignCount: result.campaigns.length } : result, null, 2));
  if (!result.passed) process.exitCode = 1;
}).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { MAKES, analyze };
