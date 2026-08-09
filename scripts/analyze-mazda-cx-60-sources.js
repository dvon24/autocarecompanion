/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { inspect } = require('./inspect-mazda-source-inventory');
const { MODEL_ALIASES, OUTPUT, PDF_SOURCES, SNAPSHOT, sourceUrlSet } = require('./build-mazda-cx-60-adjudication');

function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-60').sort((a, b) => a.id.localeCompare(b.id));
  const packet = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const exactUrls = new Set(sourceUrlSet(snapshot));
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const checks = [];
  for (const row of records) for (const source of row.citations || []) checks.push({ id: row.id, url: source.url, verdict: exactUrls.has(source.url) ? 'exact-reviewed-source' : 'unknown-source', searchStyle: searchStyle(source.url) });
  const problems = checks.filter((check) => check.searchStyle || check.verdict !== 'exact-reviewed-source');
  const verdictCounts = checks.reduce((out, check) => ({ ...out, [check.verdict]: (out[check.verdict] || 0) + 1 }), {});
  return {
    passed: snapshot.records.length === 259 && frozen.length === 27 && records.length === 27 && inventory.communicationTotal === 0 && inventory.recallRows.length === 0 && problems.length === 0,
    makeSnapshotCount: snapshot.records.length, rowCount: records.length, modelAliases: MODEL_ALIASES,
    jurisdiction: 'non-US multi-jurisdiction model; zero NHTSA rows expected',
    communicationCounts: inventory.communicationCounts, communicationTotal: inventory.communicationTotal,
    recallCounts: inventory.recallCounts, recallTotal: inventory.recallRows.length,
    pdfCount: Object.keys(PDF_SOURCES).length,
    pdfPageCount: Object.values(PDF_SOURCES).reduce((sum, source) => sum + source.pages, 0),
    citationCount: checks.length, verdictCounts, problems, checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { analyze, searchStyle };
