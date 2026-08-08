/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { MFR_COMMUNICATIONS_SOURCE } = require('./build-kia-k5-adjudication');

function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') { field += '"'; index += 1; } else quoted = false;
      } else field += char;
    } else if (char === ',') { fields.push(field); field = ''; }
    else if (char === '"') quoted = true;
    else field += char;
  }
  fields.push(field);
  return fields;
}

async function inspectFile(file, expected) {
  const hash = crypto.createHash('sha256');
  const input = fs.createReadStream(file);
  input.on('data', (chunk) => hash.update(chunk));
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  let headers;
  let lines = 0;
  let k5Rows = 0;
  const documentIds = new Set();
  for await (const line of rl) {
    lines += 1;
    const fields = parseCsvLine(line);
    if (!headers) { headers = fields; continue; }
    const row = Object.fromEntries(headers.map((header, index) => [header, fields[index] || '']));
    if (row.Make === 'KIA' && row.Model === 'K5') { k5Rows += 1; documentIds.add(row['TSB/Document ID']); }
  }
  const sha256 = hash.digest('hex');
  return { file, lines, sha256, expectedSha256: expected.sha256, k5Rows, expectedK5Rows: expected.expectedK5Rows, documentIds, passed: sha256 === expected.sha256 && k5Rows === expected.expectedK5Rows };
}

async function main() {
  const args = new Map(process.argv.slice(2).map((value) => { const index = value.indexOf('='); return [value.slice(2, index), value.slice(index + 1)]; }));
  const first = args.get('2020-2024');
  const second = args.get('2025-2026');
  if (!first || !second) throw new Error('usage: node scripts/verify-kia-k5-mfr-communications.js --2020-2024=C:\\path\\first.csv --2025-2026=C:\\path\\second.csv');
  const a = await inspectFile(first, MFR_COMMUNICATIONS_SOURCE.files['2020-2024']);
  const b = await inspectFile(second, MFR_COMMUNICATIONS_SOURCE.files['2025-2026']);
  const allDocumentIds = new Set([...a.documentIds, ...b.documentIds]);
  const missingRequiredDocumentIds = MFR_COMMUNICATIONS_SOURCE.requiredDocumentIds.filter((id) => !allDocumentIds.has(id));
  const totalK5Rows = a.k5Rows + b.k5Rows;
  const passed = a.passed && b.passed && totalK5Rows === MFR_COMMUNICATIONS_SOURCE.totalExpectedK5Rows && missingRequiredDocumentIds.length === 0;
  const clean = (item) => ({ ...item, documentIds: [...item.documentIds].sort() });
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', files: [clean(a), clean(b)], totalK5Rows, expectedTotalK5Rows: MFR_COMMUNICATIONS_SOURCE.totalExpectedK5Rows, missingRequiredDocumentIds }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });

module.exports = { inspectFile, parseCsvLine };
