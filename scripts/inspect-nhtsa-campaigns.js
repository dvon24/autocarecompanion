/* eslint-disable @typescript-eslint/no-require-imports */
const { inspect } = require('./inspect-nhtsa-model-source-inventory');

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

async function main() {
  const makes = argValue('--makes').split('|').filter(Boolean);
  const aliases = argValue('--aliases').split('|').filter(Boolean);
  const campaigns = new Set(argValue('--campaigns').split('|').filter(Boolean));
  if (!makes.length || !aliases.length || !campaigns.size) {
    throw new Error('--makes, --aliases and --campaigns are required');
  }
  const result = await inspect({ makes, aliases });
  const rows = result.recallRows.filter((row) => campaigns.has(row.campaign));
  console.log(JSON.stringify({ campaigns: [...campaigns], rowCount: rows.length, rows }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
