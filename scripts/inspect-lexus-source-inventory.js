/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const readline = require('node:readline');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');

function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function parseCsv(line) { const values = []; let value = ''; let quoted = false; for (let index = 0; index < line.length; index += 1) { const char = line[index]; if (char === '"') { if (quoted && line[index + 1] === '"') { value += '"'; index += 1; } else quoted = !quoted; } else if (char === ',' && !quoted) { values.push(value); value = ''; } else value += char; } values.push(value); return values; }
async function readLines(file, onLine) { const reader = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity }); for await (const line of reader) onLine(line); }

async function inspect({ aliases, terms = [] }) {
  const modelAliases = new Set(aliases.map((value) => value.toUpperCase()));
  const termPattern = terms.length ? new RegExp(terms.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') : null;
  const communicationCounts = {};
  const relevantCommunications = [];
  for (const source of SOURCE_FILES) {
    let count = 0;
    let first = true;
    await readLines(source.path, (line) => {
      if (first) { first = false; return; }
      const [id, make, model, years, summary] = parseCsv(line);
      if (make !== 'LEXUS' || !modelAliases.has(model)) return;
      count += 1;
      if (!termPattern || termPattern.test(summary)) relevantCommunications.push({ period: source.period, id, model, years, summary });
    });
    communicationCounts[source.period] = count;
  }
  const recallCounts = {};
  const recallRows = [];
  for (const source of RECALL_FILES) {
    let count = 0;
    await readLines(source.path, (line) => {
      const fields = line.split('\t');
      if (fields[2] !== 'LEXUS' || !modelAliases.has(fields[3])) return;
      count += 1;
      recallRows.push({
        period: source.period,
        campaign: fields[1],
        model: fields[3],
        year: fields[4],
        component: fields[6],
        summary: fields[19],
        consequence: fields[20],
        remedy: fields[21],
        notes: fields[22],
      });
    });
    recallCounts[source.period] = count;
  }
  return { aliases: [...modelAliases], communicationCounts, communicationTotal: Object.values(communicationCounts).reduce((sum, count) => sum + count, 0), relevantCommunications, recallCounts, recallRows };
}

async function main() {
  const aliases = argValue('--aliases').split('|').filter(Boolean);
  const terms = argValue('--terms').split('|').filter(Boolean);
  if (!aliases.length) throw new Error('--aliases is required');
  const result = await inspect({ aliases, terms });
  if (process.argv.includes('--communications-only')) {
    console.log(JSON.stringify({
      aliases: result.aliases,
      communicationCounts: result.communicationCounts,
      communicationTotal: result.communicationTotal,
      relevantCommunications: result.relevantCommunications,
    }, null, 2));
    return;
  }
  if (process.argv.includes('--compact')) {
    const campaigns = [...new Set(result.recallRows.map((row) => row.campaign))].sort();
    console.log(JSON.stringify({
      aliases: result.aliases,
      communicationCounts: result.communicationCounts,
      communicationTotal: result.communicationTotal,
      relevantCommunicationCount: result.relevantCommunications.length,
      relevantDocumentIds: [...new Set(result.relevantCommunications.map((row) => row.id))].sort(),
      recallCounts: result.recallCounts,
      recallTotal: result.recallRows.length,
      campaignCount: campaigns.length,
      campaigns,
    }, null, 2));
    return;
  }
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { inspect, parseCsv, readLines };
