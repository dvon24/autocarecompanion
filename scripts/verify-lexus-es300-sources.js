/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { inspect } = require('./inspect-lexus-source-inventory');
const { BULLETIN_INVENTORY, CAMPAIGNS, MODEL_ALIASES, RECALL_INVENTORY, SUPPORTING_DOCUMENT_IDS } = require('./build-lexus-es300-adjudication');

function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
async function hashFile(file) { const hash = crypto.createHash('sha256'); await new Promise((resolve, reject) => { const stream = fs.createReadStream(file); stream.on('data', (chunk) => hash.update(chunk)); stream.on('end', resolve); stream.on('error', reject); }); return hash.digest('hex'); }
async function verifyFiles(files) { const results = []; for (const source of files) { const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path); if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`); results.push({ period: source.period, bytes: stat.size, sha256 }); } return results; }

async function verifyInventory() {
  const result = await inspect({ aliases: MODEL_ALIASES, terms: ['sludge', 'gelling', 'gel', 'oil'] });
  if (!equal(result.communicationCounts, BULLETIN_INVENTORY.periodCounts) || result.communicationTotal !== BULLETIN_INVENTORY.totalRows) throw new Error('communication inventory drift');
  if (!equal(result.recallCounts, RECALL_INVENTORY.periodCounts) || result.recallRows.length !== RECALL_INVENTORY.totalRows) throw new Error('recall row inventory drift');
  const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
  if (!equal(campaigns, CAMPAIGNS)) throw new Error('recall campaign inventory drift');
  const byId = new Map(result.relevantCommunications.map((row) => [row.id, row]));
  for (const id of SUPPORTING_DOCUMENT_IDS) if (!byId.has(id)) throw new Error(`missing communication ${id}`);
  if (!/1997,1998,1999,2000,2001/.test(byId.get('628655').years) || !/oil gelling or sludge/i.test(byId.get('628655').summary)) throw new Error('628655 scope drift');
  if (!/1MZ-FE six cylinder engines.*oil gelling/i.test(byId.get('633821').summary)) throw new Error('633821 engine identity drift');
  if (!/1997 to 2002 models/i.test(byId.get('633830').summary) || !/gelling or sludging/i.test(byId.get('633830').summary)) throw new Error('633830 model-year scope drift');
  return { communicationCounts: result.communicationCounts, communicationTotal: result.communicationTotal, relevantDocumentIds: [...byId.keys()].sort(), supportingDocumentIds: SUPPORTING_DOCUMENT_IDS, recallCounts: result.recallCounts, recallTotal: result.recallRows.length, campaigns };
}

async function main() {
  const [communicationFiles, recallFiles, inventory] = await Promise.all([verifyFiles(SOURCE_FILES), verifyFiles(RECALL_FILES), verifyInventory()]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, inventory }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
