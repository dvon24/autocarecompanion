/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { EXPECTED_FLAT_RECALL_DETAILS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE } = require('./build-kia-ev9-adjudication');

function stable(value) { return JSON.stringify(value, Object.keys(value).sort()); }
async function main() {
  const fileArg = process.argv.slice(2).find((value) => value.startsWith('--file='));
  if (!fileArg) throw new Error('usage: node scripts/verify-kia-ev9-flat-recall-inventory.js --file=C:\\path\\FLAT_RCL_POST_2010.txt');
  const file = fileArg.slice('--file='.length); const hash = crypto.createHash('sha256'); const input = fs.createReadStream(file); input.on('data', (chunk) => hash.update(chunk));
  const details = new Map(); let lines = 0;
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    lines += 1; const columns = line.split('\t');
    if ((columns[2] || '').toUpperCase() !== 'KIA' || (columns[3] || '').toUpperCase() !== 'EV9') continue;
    const year = Number(columns[4]); if (![2024, 2025, 2026].includes(year)) continue;
    const campaign = columns[1]; const key = `${year}|${campaign}`;
    const current = details.get(key) || { year, campaign, manufacturerCampaign: columns[5], components: new Set() };
    current.components.add(columns[6]); details.set(key, current);
  }
  const sha256 = hash.digest('hex');
  const actualDetails = [...details.values()].map((item) => ({ ...item, components: [...item.components].sort() })).sort((a, b) => a.year - b.year || a.campaign.localeCompare(b.campaign));
  const actualInventory = {};
  for (const year of [2024, 2025, 2026]) actualInventory[year] = actualDetails.filter((item) => item.year === year).map((item) => item.campaign).sort();
  const expectedDetails = EXPECTED_FLAT_RECALL_DETAILS.map((item) => ({ ...item, components: [...item.components].sort() })).sort((a, b) => a.year - b.year || a.campaign.localeCompare(b.campaign));
  const passed = sha256 === FLAT_RECALL_SOURCE.extractedSha256 && stable(actualInventory) === stable(EXPECTED_FLAT_RECALL_INVENTORY) && JSON.stringify(actualDetails) === JSON.stringify(expectedDetails);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', file, lines, sha256, expectedSha256: FLAT_RECALL_SOURCE.extractedSha256, actualInventory, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY, actualDetails, expectedDetails }, null, 2));
  if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
