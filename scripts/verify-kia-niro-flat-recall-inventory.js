/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE } = require('./build-kia-niro-adjudication');

async function main() {
  const fileArg = process.argv.slice(2).find((value) => value.startsWith('--file='));
  if (!fileArg) throw new Error('usage: node scripts/verify-kia-niro-flat-recall-inventory.js --file=C:\\path\\FLAT_RCL_POST_2010.txt');
  const file = fileArg.slice('--file='.length);
  const hash = crypto.createHash('sha256');
  const input = fs.createReadStream(file);
  input.on('data', (chunk) => hash.update(chunk));
  const inventory = new Map();
  let lines = 0;
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    lines += 1;
    const columns = line.split('\t');
    if ((columns[2] || '').toUpperCase() !== 'KIA') continue;
    const model = (columns[3] || '').toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(EXPECTED_FLAT_RECALL_INVENTORY, model)) continue;
    const year = Number(columns[4]);
    if (year < 2017 || year > 2025) continue;
    const modelMap = inventory.get(model) || new Map();
    const campaigns = modelMap.get(year) || new Set();
    campaigns.add(columns[1]);
    modelMap.set(year, campaigns);
    inventory.set(model, modelMap);
  }
  const sha256 = hash.digest('hex');
  const actualInventory = {};
  for (const model of Object.keys(EXPECTED_FLAT_RECALL_INVENTORY)) {
    actualInventory[model] = {};
    for (const year of Object.keys(EXPECTED_FLAT_RECALL_INVENTORY[model])) actualInventory[model][year] = [...(inventory.get(model)?.get(Number(year)) || [])].sort();
  }
  const passed = sha256 === FLAT_RECALL_SOURCE.extractedSha256 && JSON.stringify(actualInventory) === JSON.stringify(EXPECTED_FLAT_RECALL_INVENTORY);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', file, lines, sha256, expectedSha256: FLAT_RECALL_SOURCE.extractedSha256, actualInventory, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
