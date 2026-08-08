/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { MFR_COMMUNICATIONS_SOURCE } = require('./build-kia-optima-adjudication');
function parseCsvLine(line) { const fields = []; let field = ''; let quoted = false; for (let index = 0; index < line.length; index += 1) { const char = line[index]; if (quoted) { if (char === '"') { if (line[index + 1] === '"') { field += '"'; index += 1; } else quoted = false; } else field += char; } else if (char === ',') { fields.push(field); field = ''; } else if (char === '"') quoted = true; else field += char; } fields.push(field); return fields; }
async function inspectFile(file, expected) {
  const hash = crypto.createHash('sha256'); const input = fs.createReadStream(file); input.on('data', (chunk) => hash.update(chunk)); const rl = readline.createInterface({ input, crlfDelay: Infinity }); let headers; let lines = 0; let optimaRows = 0; const documentIds = new Set();
  for await (const line of rl) { lines += 1; const fields = parseCsvLine(line); if (!headers) { headers = fields; continue; } const row = Object.fromEntries(headers.map((header, index) => [header, fields[index] || ''])); if (row.Make === 'KIA' && row.Model === 'OPTIMA') optimaRows += 1; if (row.Make === 'KIA' && /^OPTIMA(?:\s|$)/.test(row.Model)) documentIds.add(row['TSB/Document ID']); }
  const sha256 = hash.digest('hex'); return { file, lines, sha256, expectedSha256: expected.sha256, optimaRows, expectedOptimaRows: expected.expectedOptimaRows, documentIds, passed: sha256 === expected.sha256 && optimaRows === expected.expectedOptimaRows };
}
async function main() {
  const args = new Map(process.argv.slice(2).map((value) => { const index = value.indexOf('='); return [value.slice(2, index), value.slice(index + 1)]; })); const inspected = [];
  for (const [key, expected] of Object.entries(MFR_COMMUNICATIONS_SOURCE.files)) { const file = args.get(key); if (!file) throw new Error(`missing --${key}=C:\\path\\file.csv`); inspected.push(await inspectFile(file, expected)); }
  const allDocumentIds = new Set(inspected.flatMap((item) => [...item.documentIds])); const missingRequiredDocumentIds = MFR_COMMUNICATIONS_SOURCE.requiredDocumentIds.filter((id) => !allDocumentIds.has(id)); const totalOptimaRows = inspected.reduce((sum, item) => sum + item.optimaRows, 0); const passed = inspected.every((item) => item.passed) && totalOptimaRows === MFR_COMMUNICATIONS_SOURCE.totalExpectedOptimaRows && missingRequiredDocumentIds.length === 0; const clean = (item) => ({ ...item, documentIds: [...item.documentIds].sort() });
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', files: inspected.map(clean), totalOptimaRows, expectedTotalOptimaRows: MFR_COMMUNICATIONS_SOURCE.totalExpectedOptimaRows, missingRequiredDocumentIds }, null, 2)); if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { inspectFile, parseCsvLine };
