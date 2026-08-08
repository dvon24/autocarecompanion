/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const { RECALL_FILES, SOURCE_FILES } = require('./lexus-adjudication-utils');
const { BULLETIN_INVENTORY, MODEL_ALIASES, PDF_SOURCES, RECALL_INVENTORY } = require('./build-lexus-ct-adjudication');

const aliases = new Set(MODEL_ALIASES);
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(left, right) { return JSON.stringify(stable(left)) === JSON.stringify(stable(right)); }
function parseCsv(line) { const values = []; let value = ''; let quoted = false; for (let index = 0; index < line.length; index += 1) { const char = line[index]; if (char === '"') { if (quoted && line[index + 1] === '"') { value += '"'; index += 1; } else quoted = !quoted; } else if (char === ',' && !quoted) { values.push(value); value = ''; } else value += char; } values.push(value); return values; }
async function readLines(file, onLine) { const reader = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity }); for await (const line of reader) onLine(line); }
async function hashFile(file) { const hash = crypto.createHash('sha256'); await new Promise((resolve, reject) => { const stream = fs.createReadStream(file); stream.on('data', (chunk) => hash.update(chunk)); stream.on('end', resolve); stream.on('error', reject); }); return hash.digest('hex'); }

async function verifyFiles(files) { const results = []; for (const source of files) { const stat = fs.statSync(source.path); const sha256 = await hashFile(source.path); if (stat.size !== source.length || sha256 !== source.sha256) throw new Error(`${source.period}: source file drift`); results.push({ period: source.period, bytes: stat.size, sha256 }); } return results; }
async function verifyCommunications() {
  const periodCounts = {};
  const matching = new Map();
  let waterPumpRows = 0;
  for (const source of SOURCE_FILES) {
    let count = 0;
    let first = true;
    await readLines(source.path, (line) => {
      if (first) { first = false; return; }
      const [id, make, model, years, summary] = parseCsv(line);
      if (make !== 'LEXUS' || !aliases.has(model)) return;
      count += 1;
      if (/water pump/i.test(summary)) waterPumpRows += 1;
      if (['10179595', '10179691', '10133922', '10042930', '10046219'].includes(id)) matching.set(id, { model, years, summary });
    });
    periodCounts[source.period] = count;
  }
  const totalRows = Object.values(periodCounts).reduce((sum, count) => sum + count, 0);
  if (!equal(periodCounts, BULLETIN_INVENTORY.periodCounts) || totalRows !== BULLETIN_INVENTORY.totalRows) throw new Error(`communication inventory drift: ${JSON.stringify(periodCounts)}`);
  for (const id of ['10179595', '10179691', '10133922', '10042930', '10046219']) if (!matching.has(id)) throw new Error(`missing communication ${id}`);
  if (!/cooling fan|intake filter/i.test(matching.get('10179595').summary) || !/after HV Battery Replacement/i.test(matching.get('10133922').summary) || !/improper mixture/i.test(matching.get('10042930').summary) || !/exhaust gas control actuator/i.test(matching.get('10046219').summary) || waterPumpRows !== 0) throw new Error('CT issue-identity source boundary drift');
  return { periodCounts, totalRows, waterPumpRows, matchedDocumentIds: [...matching.keys()].sort() };
}
async function verifyRecalls() {
  const periodCounts = {};
  const rows = [];
  for (const source of RECALL_FILES) {
    let count = 0;
    await readLines(source.path, (line) => { const fields = line.split('\t'); if (fields[2] !== 'LEXUS' || !aliases.has(fields[3])) return; count += 1; rows.push({ campaign: fields[1], model: fields[3], year: fields[4], component: fields[6] }); });
    periodCounts[source.period] = count;
  }
  const campaigns = [...new Set(rows.map((row) => row.campaign))].sort();
  if (!equal(periodCounts, RECALL_INVENTORY.periodCounts) || rows.length !== 2 || !equal(campaigns, ['16V487000']) || rows.some((row) => !/AIR BAGS/.test(row.component))) throw new Error(`recall inventory drift: ${JSON.stringify({ periodCounts, rows })}`);
  return { periodCounts, totalRows: rows.length, campaignCount: campaigns.length, campaigns };
}
function verifyPdfBuffer(buffer, source, label) { const sha256 = crypto.createHash('sha256').update(buffer).digest('hex'); if (buffer.length !== source.bytes || sha256 !== source.sha256 || !buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${label}: PDF/hash mismatch`); return { label, bytes: buffer.length, sha256 }; }
async function verifyPdf(source) { const local = verifyPdfBuffer(fs.readFileSync(source.localPath), source, 'local'); const response = await fetch(source.url); if (!response.ok) throw new Error(`${response.status} ${source.url}`); const remote = verifyPdfBuffer(Buffer.from(await response.arrayBuffer()), source, 'remote'); return { url: source.url, documentId: source.nhtsaDocumentId, pages: source.pages, local, remote, contentType: response.headers.get('content-type') || '' }; }

async function main() {
  const [communicationFiles, recallFiles, communications, recalls, batteryCooling] = await Promise.all([verifyFiles(SOURCE_FILES), verifyFiles(RECALL_FILES), verifyCommunications(), verifyRecalls(), verifyPdf(PDF_SOURCES.batteryCooling)]);
  console.log(JSON.stringify({ passed: true, communicationFiles, recallFiles, communications, recalls, pdfs: { batteryCooling } }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
