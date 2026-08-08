/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE } = require('./build-kia-k5-adjudication');

async function main() {
  const fileArg = process.argv.slice(2).find((value) => value.startsWith('--file='));
  if (!fileArg) throw new Error('usage: node scripts/verify-kia-k5-flat-recall-inventory.js --file=C:\\path\\FLAT_RCL_POST_2010.txt');
  const file = fileArg.slice('--file='.length);
  const hash = crypto.createHash('sha256');
  const input = fs.createReadStream(file);
  input.on('data', (chunk) => hash.update(chunk));
  const campaignsByYear = new Map();
  let lines = 0;
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    lines += 1;
    const columns = line.split('\t');
    if ((columns[2] || '').toUpperCase() !== 'KIA' || (columns[3] || '').toUpperCase() !== 'K5') continue;
    const year = Number(columns[4]);
    if (year < 2021 || year > 2026) continue;
    const campaigns = campaignsByYear.get(year) || new Set();
    campaigns.add(columns[1]);
    campaignsByYear.set(year, campaigns);
  }
  const sha256 = hash.digest('hex');
  const actualInventory = {};
  for (let year = 2021; year <= 2026; year += 1) actualInventory[year] = [...(campaignsByYear.get(year) || [])].sort();
  const passed = sha256 === FLAT_RECALL_SOURCE.extractedSha256 && JSON.stringify(actualInventory) === JSON.stringify(EXPECTED_FLAT_RECALL_INVENTORY);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', file, lines, sha256, expectedSha256: FLAT_RECALL_SOURCE.extractedSha256, actualInventory, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
