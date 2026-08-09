/* eslint-disable @typescript-eslint/no-require-imports */
const { inspect } = require('./inspect-nhtsa-model-source-inventory');
const { CAMPAIGNS, REQUIRED_COMMUNICATION_IDS } = require('./build-mercedes-a-class-adjudication');

const MAKES = Object.freeze(['MERCEDES-BENZ']);
const MODEL_ALIASES = Object.freeze(['A-CLASS', 'A CLASS', 'A220', 'A 220', 'AMG A35', 'A35 AMG']);
const SEARCH_TERMS = Object.freeze([
  'shudder', 'dual clutch', 'DCT', 'MBUX', 'infotainment', 'strut', 'suspension',
  'water ingress', 'drain hose', 'particulate', 'DPF', 'integral carrier', 'corrosion',
  'rearview camera', 'rear view camera', 'thermostat', 'coolant', 'carbon',
]);

function uniqueBy(values, key) {
  const seen = new Set();
  return values.filter((value) => {
    const identity = key(value);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

async function analyze() {
  const inventory = await inspect({ makes: MAKES, aliases: MODEL_ALIASES, terms: SEARCH_TERMS });
  const communications = uniqueBy(inventory.relevantCommunications, (row) => `${row.id}|${row.summary}`)
    .map((row) => ({ id: row.id, models: [...new Set(inventory.relevantCommunications.filter((item) => item.id === row.id).map((item) => item.model))].sort(), years: [...new Set(inventory.relevantCommunications.filter((item) => item.id === row.id).flatMap((item) => String(item.years).split(',')))].sort(), summary: row.summary }));
  const recalls = uniqueBy(inventory.recallRows, (row) => `${row.campaign}|${row.summary}|${row.remedy}`)
    .map((row) => ({ campaign: row.campaign, models: [...new Set(inventory.recallRows.filter((item) => item.campaign === row.campaign).map((item) => item.model))].sort(), years: [...new Set(inventory.recallRows.filter((item) => item.campaign === row.campaign).map((item) => item.year))].sort(), component: row.component, summary: row.summary, consequence: row.consequence, remedy: row.remedy }));
  const communicationIds = [...new Set(inventory.relevantCommunications.map((row) => row.id))].sort();
  const campaigns = [...new Set(inventory.recallRows.map((row) => row.campaign))].sort();
  const missingRequiredCommunicationIds = REQUIRED_COMMUNICATION_IDS.filter((id) => !communicationIds.includes(id));
  return {
    passed: inventory.communicationTotal === 526
      && inventory.relevantCommunications.length === 68
      && missingRequiredCommunicationIds.length === 0
      && inventory.recallRows.length === 1121
      && campaigns.join('|') === CAMPAIGNS.join('|'),
    aliases: MODEL_ALIASES,
    communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    relevantCommunicationRows: inventory.relevantCommunications.length,
    uniqueRelevantCommunications: communications.length,
    communicationIds,
    missingRequiredCommunicationIds,
    communications,
    recallCounts: inventory.recallCounts,
    recallRows: inventory.recallRows.length,
    campaigns,
    uniqueRecallStatements: recalls.length,
    recalls,
  };
}

if (require.main === module) {
  analyze().then((result) => {
    const output = process.argv.includes('--compact') ? {
      passed: result.passed,
      communicationCounts: result.communicationCounts,
      communicationTotal: result.communicationTotal,
      relevantCommunicationRows: result.relevantCommunicationRows,
      uniqueRelevantCommunications: result.uniqueRelevantCommunications,
      missingRequiredCommunicationIds: result.missingRequiredCommunicationIds,
      recallCounts: result.recallCounts,
      recallRows: result.recallRows,
      campaignCount: result.campaigns.length,
      campaigns: result.campaigns,
    } : result;
    console.log(JSON.stringify(output, null, 2));
    if (!result.passed) process.exitCode = 1;
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { MAKES, MODEL_ALIASES, SEARCH_TERMS, analyze };
