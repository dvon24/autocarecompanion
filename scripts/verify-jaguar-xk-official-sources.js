/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { DATASET_MARKERS, EXPECTED_CAMPAIGNS, EXPECTED_RECALLS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES } = require('./build-jaguar-xk-adjudication');

function normalized(value) { return String(value || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim(); }
async function verifyPdf(key, url) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(90000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  const isPdf = bytes.subarray(0, 4).toString('ascii') === '%PDF';
  return { key, url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: PDF_SHA256[key], visuallyInspectedPages: VISUALLY_INSPECTED_PAGES[key], isPdf, passed: response.status === 200 && isPdf && sha256 === PDF_SHA256[key] };
}

function firstCsvFromZip(bytes) {
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) if (bytes.readUInt32LE(offset) === 0x06054b50) { eocd = offset; break; }
  if (eocd < 0) throw new Error('ZIP end-of-central-directory record not found');
  const entryCount = bytes.readUInt16LE(eocd + 10);
  let centralOffset = bytes.readUInt32LE(eocd + 16);
  for (let index = 0; index < entryCount; index += 1) {
    if (bytes.readUInt32LE(centralOffset) !== 0x02014b50) throw new Error('invalid ZIP central-directory entry');
    const method = bytes.readUInt16LE(centralOffset + 10);
    const compressedSize = bytes.readUInt32LE(centralOffset + 20);
    const fileNameLength = bytes.readUInt16LE(centralOffset + 28);
    const extraLength = bytes.readUInt16LE(centralOffset + 30);
    const commentLength = bytes.readUInt16LE(centralOffset + 32);
    const localOffset = bytes.readUInt32LE(centralOffset + 42);
    const fileName = bytes.subarray(centralOffset + 46, centralOffset + 46 + fileNameLength).toString('utf8');
    if (fileName.toLowerCase().endsWith('.csv')) {
      if (bytes.readUInt32LE(localOffset) !== 0x04034b50) throw new Error('invalid ZIP local header');
      const localNameLength = bytes.readUInt16LE(localOffset + 26);
      const localExtraLength = bytes.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.subarray(start, start + compressedSize);
      if (method === 0) return { fileName, text: compressed.toString('utf8') };
      if (method === 8) return { fileName, text: zlib.inflateRawSync(compressed).toString('utf8') };
      throw new Error(`unsupported ZIP compression method ${method}`);
    }
    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }
  throw new Error('CSV entry not found in ZIP');
}

async function verifyDataset() {
  const url = SOURCES.differentialDataset;
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(90000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const isZip = bytes.subarray(0, 2).toString('ascii') === 'PK';
  const csv = isZip ? firstCsvFromZip(bytes) : { fileName: null, text: '' };
  const markerResults = DATASET_MARKERS.map((marker) => ({ marker, present: normalized(csv.text).includes(normalized(marker)) }));
  return { url, finalUrl: response.url, status: response.status, bytes: bytes.length, isZip, csvFile: csv.fileName, markerResults, passed: response.status === 200 && isZip && markerResults.every((item) => item.present) };
}

async function verifyCampaign(key, url) {
  const expected = EXPECTED_CAMPAIGNS[key];
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(30000) });
  const body = response.status === 200 ? await response.json() : { results: [] };
  const results = body.results || [];
  const campaignRows = results.filter((row) => String(row.NHTSACampaignNumber || '').toUpperCase() === expected.number);
  const modelRows = campaignRows.filter((row) => normalized(row.Model) === normalized(expected.model));
  const years = [...new Set(modelRows.map((row) => String(row.ModelYear || '')).filter(Boolean))].sort();
  const text = normalized(campaignRows.map((row) => JSON.stringify(row)).join(' '));
  const componentMarkers = expected.component.map((marker) => ({ marker, present: text.includes(normalized(marker)) }));
  const problemMarkers = expected.problem.map((marker) => ({ marker, present: text.includes(normalized(marker)) }));
  const remedyMarkers = expected.remedy.map((marker) => ({ marker, present: text.includes(normalized(marker)) }));
  const yearPassed = expected.years.every((year) => years.includes(year));
  return { key, url, status: response.status, resultCount: results.length, campaignRowCount: campaignRows.length, modelRowCount: modelRows.length, years, expectedYears: expected.years, componentMarkers, problemMarkers, remedyMarkers, passed: response.status === 200 && campaignRows.length > 0 && modelRows.length > 0 && yearPassed && [...componentMarkers, ...problemMarkers, ...remedyMarkers].every((item) => item.present) };
}

async function verifyRecall(year, url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  let campaigns = [];
  if (response.status === 200) { const body = await response.json(); campaigns = (body.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean).sort(); } else await response.arrayBuffer();
  const expected = EXPECTED_RECALLS[year];
  return { year: Number(year), url, status: response.status, campaigns, expected, passed: response.status === expected.status && JSON.stringify(campaigns) === JSON.stringify([...expected.campaigns].sort()) };
}

async function main() {
  const documents = [];
  for (const [key, url] of Object.entries(PDF_SOURCES)) documents.push(await verifyPdf(key, url));
  const dataset = await verifyDataset();
  const campaigns = [];
  for (const key of ['headlampCampaign', 'accelerationCampaign']) campaigns.push(await verifyCampaign(key, SOURCES[key]));
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecall(year, url));
  const passed = documents.every((row) => row.passed) && dataset.passed && campaigns.every((row) => row.passed) && recalls.every((row) => row.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', documentCount: documents.length, documents, dataset, campaigns, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
