/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, MFR_COMMUNICATIONS_SOURCE } = require('./build-kia-sedona-adjudication');

function parseCsvLine(line) {
  const fields = []; let field = ''; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) { if (char === '"') { if (line[index + 1] === '"') { field += '"'; index += 1; } else quoted = false; } else field += char; }
    else if (char === ',') { fields.push(field); field = ''; }
    else if (char === '"') quoted = true;
    else field += char;
  }
  fields.push(field); return fields;
}
function normalizedInventory(map) { return Object.fromEntries([...map.entries()].sort().map(([campaign, years]) => [campaign, [...years].sort((a, b) => a - b)])); }

async function inspectCsv(file, expected) {
  const hash = crypto.createHash('sha256'); const input = fs.createReadStream(file); input.on('data', (chunk) => hash.update(chunk));
  const rl = readline.createInterface({ input, crlfDelay: Infinity }); let headers; let sedonaRows = 0; let lines = 0; const documentIds = new Set();
  for await (const line of rl) {
    lines += 1; const fields = parseCsvLine(line); if (!headers) { headers = fields; continue; }
    const row = Object.fromEntries(headers.map((header, index) => [header, fields[index] || '']));
    if (row.Make === 'KIA' && /^SEDONA/.test(row.Model)) { sedonaRows += 1; documentIds.add(row['TSB/Document ID']); }
  }
  const sha256 = hash.digest('hex');
  return { file, lines, sha256, expectedSha256: expected.sha256, sedonaRows, expectedSedonaRows: expected.expectedSedonaRows, documentIds: [...documentIds].sort(), passed: sha256 === expected.sha256 && sedonaRows === expected.expectedSedonaRows };
}

async function inspectFlat(file, expected, expectedInventory) {
  const hash = crypto.createHash('sha256'); const input = fs.createReadStream(file); input.on('data', (chunk) => hash.update(chunk));
  const rl = readline.createInterface({ input, crlfDelay: Infinity }); let lines = 0; let sedonaRows = 0; const campaigns = new Map();
  for await (const line of rl) {
    lines += 1; const columns = line.split('\t');
    if ((columns[2] || '').toUpperCase() !== 'KIA' || (columns[3] || '').toUpperCase() !== 'SEDONA') continue;
    sedonaRows += 1; const years = campaigns.get(columns[1]) || new Set(); years.add(Number(columns[4])); campaigns.set(columns[1], years);
  }
  const sha256 = hash.digest('hex'); const inventory = normalizedInventory(campaigns);
  return { file, lines, sha256, expectedSha256: expected.sha256, sedonaRows, expectedSedonaRows: expected.expectedSedonaRows, inventory, expectedInventory, passed: sha256 === expected.sha256 && sedonaRows === expected.expectedSedonaRows && JSON.stringify(inventory) === JSON.stringify(expectedInventory) };
}

async function main() {
  const args = new Map(process.argv.slice(2).map((value) => { const index = value.indexOf('='); return [value.slice(2, index), value.slice(index + 1)]; }));
  const csv = [];
  for (const [key, expected] of Object.entries(MFR_COMMUNICATIONS_SOURCE.files)) { const file = args.get(key); if (!file) throw new Error(`missing --${key}=C:\\path\\file.csv`); csv.push(await inspectCsv(file, expected)); }
  const preFlatFile = args.get('pre-flat'); if (!preFlatFile) throw new Error('missing --pre-flat=C:\\path\\FLAT_RCL_PRE_2010.txt');
  const postFlatFile = args.get('post-flat'); if (!postFlatFile) throw new Error('missing --post-flat=C:\\path\\FLAT_RCL_POST_2010.txt');
  const preFlat = await inspectFlat(preFlatFile, FLAT_RECALL_SOURCE.pre2010, EXPECTED_PRE_2010_RECALL_INVENTORY);
  const postFlat = await inspectFlat(postFlatFile, FLAT_RECALL_SOURCE.post2010, EXPECTED_FLAT_RECALL_INVENTORY);
  const foundDocumentIds = new Set(csv.flatMap((item) => item.documentIds));
  const missingRequiredDocumentIds = MFR_COMMUNICATIONS_SOURCE.requiredDocumentIds.filter((id) => !foundDocumentIds.has(id));
  const totalSedonaRows = csv.reduce((sum, item) => sum + item.sedonaRows, 0);
  const completeInventory = Object.fromEntries(Object.entries({ ...preFlat.inventory, ...postFlat.inventory }).sort());
  const completeRecallPassed = JSON.stringify(completeInventory) === JSON.stringify(EXPECTED_COMPLETE_RECALL_INVENTORY);
  const passed = csv.every((item) => item.passed) && preFlat.passed && postFlat.passed && totalSedonaRows === MFR_COMMUNICATIONS_SOURCE.totalExpectedSedonaRows && missingRequiredDocumentIds.length === 0 && completeRecallPassed;
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', totalSedonaRows, expectedTotalSedonaRows: MFR_COMMUNICATIONS_SOURCE.totalExpectedSedonaRows, missingRequiredDocumentIds, manufacturerCommunications: csv, pre2010Recall: preFlat, post2010Recall: postFlat, completeRecall: { inventory: completeInventory, expectedInventory: EXPECTED_COMPLETE_RECALL_INVENTORY, campaignCount: Object.keys(completeInventory).length, passed: completeRecallPassed } }, null, 2));
  if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { inspectCsv, inspectFlat, normalizedInventory, parseCsvLine };
