/* eslint-disable @typescript-eslint/no-require-imports */
const { inspect } = require('./inspect-nhtsa-model-source-inventory');

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

async function main() {
  const makes = argValue('--makes').split('|').filter(Boolean);
  const aliases = argValue('--aliases').split('|').filter(Boolean);
  const terms = argValue('--terms').split('|').filter(Boolean);
  if (!makes.length || !aliases.length || !terms.length) {
    throw new Error('--makes, --aliases and --terms are required');
  }
  const result = await inspect({ makes, aliases, terms });
  const documents = new Map();
  for (const row of result.relevantCommunications) {
    const current = documents.get(row.id) || { id: row.id, periods: new Set(), makes: new Set(), models: new Set(), years: new Set(), summaries: new Set() };
    current.periods.add(row.period);
    current.makes.add(row.make);
    current.models.add(row.model);
    current.years.add(row.years);
    current.summaries.add(row.summary);
    documents.set(row.id, current);
  }
  const rows = [...documents.values()].map((row) => ({
    id: row.id,
    periods: [...row.periods].sort(),
    makes: [...row.makes].sort(),
    models: [...row.models].sort(),
    years: [...row.years].sort(),
    summaries: [...row.summaries].sort(),
  })).sort((left, right) => left.id.localeCompare(right.id));
  console.log(JSON.stringify({
    communicationCounts: result.communicationCounts,
    communicationTotal: result.communicationTotal,
    matchingRows: result.relevantCommunications.length,
    uniqueDocuments: rows.length,
    documents: rows,
  }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
