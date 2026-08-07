/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_QUERIES, SOURCES } = require('./build-international-scout-adjudication');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_international-deeplink-snapshot-2026-08-06.json');
const MARKERS = {
  steeringBrace: ['steering box', '1971-80'],
  steeringPlate: ['steering', 'Scout'],
  rustBuyerGuide: ['Scout'],
  rustRestomod: ['Scout'],
  bodyPanels: ['Body Panels', 'Scout'],
  floorPanEarly: ['Floor Pan', 'rusty Scout'],
  starterRelay: ['Starter Relay', 'ignition switch'],
  hotStartForum: ['start when hot', 'Scout'],
  goldBoxForum: ['Ignition issues', 'Scout'],
  summitSearch: [],
  pertronixGoldBox: ['Gold Box', '1976-1977'],
  heatRiser: ['Heat Riser', 'overheating'],
  coolingForum: ['Improved Cooling', '345'],
  fuelTank: ['1972-1980', '19 gallon'],
  fuelSendersCategory: ['International', 'sending'],
  fuelSenderEarly: ['Fuel Sending Unit', '1961'],
  fuelSenderLate: ['Fuel Sending Unit', '19 Gallon'],
  alternator: ['alternator', '50-60 amps'],
  alternatorForum: ['Alternator upgrade'],
};

async function fetchCheck(key, url) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(25000) });
  const text = await response.text();
  const markers = MARKERS[key] || [];
  const markerMatches = markers.map((marker) => text.toLowerCase().includes(marker.toLowerCase()));
  return { key, url, finalUrl: response.url, status: response.status, bytes: Buffer.byteLength(text), markers, markerMatches, passed: response.status === 200 && markerMatches.every(Boolean) };
}

async function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const publishedUrls = [...new Set(snapshot.records.flatMap((row) => row.citations.map((citation) => citation.url)))];
  const sourceEntries = Object.entries(SOURCES);
  const sources = [];
  for (const [key, url] of sourceEntries) sources.push(await fetchCheck(key, url));
  const publishedMissingFromReview = publishedUrls.filter((url) => !Object.values(SOURCES).includes(url));
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    recalls.push({ year: Number(year), url, status: response.status, passed: response.status === 400 });
  }
  const passed = sources.every((row) => row.passed) && publishedMissingFromReview.length === 0 && recalls.every((row) => row.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', publishedCitationCount: publishedUrls.length, reviewedSourceCount: sources.length, publishedMissingFromReview, sources, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
