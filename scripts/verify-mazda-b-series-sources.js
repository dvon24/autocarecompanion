/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const { analyze } = require('./analyze-mazda-b-series-sources');
const { BULLETIN_INVENTORY, OTHER_SOURCES, RECALL_INVENTORY } = require('./build-mazda-b-series-adjudication');
const { RECALL_FILES, SOURCE_FILES } = require('./mazda-adjudication-utils');

function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function assertPattern(value, pattern, label) { if (!pattern.test(value || '')) throw new Error(`${label}: content drift`); }
async function verifyFiles(files) {
  const out = [];
  for (const source of files) {
    const buffer = await fs.promises.readFile(source.path);
    if (buffer.length !== source.length || hash(buffer) !== source.sha256) throw new Error(`${source.period}: source file drift`);
    out.push({ period: source.period, bytes: buffer.length, sha256: source.sha256 });
  }
  return out;
}
async function fetchJson(url) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
    const body = await response.text();
    let payload;
    try { payload = JSON.parse(body); } catch { payload = null; }
    if (response.ok) return payload;
    if (![400, 429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${url}: status ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
  }
  throw new Error(`${url}: retry loop exhausted`);
}
async function verifyComplaints(source, patterns) {
  const payload = await fetchJson(source.url);
  const rows = payload.results || payload.Results || [];
  if (!rows.length) throw new Error(`${source.url}: expected current Mazda B-Series complaint records`);
  const text = rows.map((row) => `${row.components || row.Components || ''} ${row.summary || row.Summary || ''}`).join('\n');
  for (const [label, pattern] of patterns) assertPattern(text, pattern, label);
  return { url: source.url, count: rows.length, patternsMatched: patterns.map(([label]) => label) };
}

async function main() {
  const analysis = await analyze();
  if (!analysis.passed) throw new Error(`source analyzer failed: ${JSON.stringify(analysis.problems)}`);
  if (analysis.communicationTotal !== BULLETIN_INVENTORY.totalRows || analysis.recallTotal !== RECALL_INVENTORY.totalRows || analysis.campaignCount !== RECALL_INVENTORY.campaignCount) throw new Error('Mazda B-Series inventory drift');
  const communicationFiles = await verifyFiles(SOURCE_FILES);
  const recallFiles = await verifyFiles(RECALL_FILES);
  const complaints = {
    complaints1996: await verifyComplaints(OTHER_SOURCES.complaints1996, [['1996 frame-corrosion report', /frame is completely rusted.*cracked.*holes/is]]),
    complaints1997: await verifyComplaints(OTHER_SOURCES.complaints1997, [['1997 spring-mount report', /front and rear leaf spring support mounts rotted away/is]]),
    complaints1998: await verifyComplaints(OTHER_SOURCES.complaints1998, [['1998 ball-joint report', /all 4 ball joints.*deep rust.*badly worn/is], ['1998 frame and shackle report', /rear leaf spring shackles.*rusted off.*frame/is], ['1998 B4000 head-gasket report', /1998 Mazda B4000.*head gasket/is]]),
    complaints1999: await verifyComplaints(OTHER_SOURCES.complaints1999, [['1999 frame-corrosion report', /frame.*rusted|rusted.*frame/is]]),
    complaints2000: await verifyComplaints(OTHER_SOURCES.complaints2000, [['2000 lower-ball-joint report', /loose prematurely rusted lower ball joint/is]]),
    complaints2001: await verifyComplaints(OTHER_SOURCES.complaints2001, [['2001 frame-corrosion report', /frame.*rusted through|frame has rotted/is], ['2001 spring-hanger report', /spring hanger.*rusted off|leaf spring shackles.*rot/is]]),
    complaints2004: await verifyComplaints(OTHER_SOURCES.complaints2004, [['2004 chassis and shackle report', /chassis is rusting out.*rear spring shackle/is]]),
  };
  console.log(JSON.stringify({ passed: true, inventory: analysis, communicationFiles, recallFiles, pdfs: {}, complaints }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
