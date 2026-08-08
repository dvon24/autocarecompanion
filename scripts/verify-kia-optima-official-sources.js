/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const { CAMPAIGN_SOURCES, PDF_SOURCES } = require('./build-kia-optima-adjudication');

async function fetchWithRetries(url, attempts = 4) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(90000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' } }); if (response.ok) return response; last = new Error(`${response.status} ${response.statusText}`); } catch (error) { last = error; }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  throw last;
}
const EXPECTED = {
  acu: { campaign: '18V363000', count: 15, optima: { 'OPTIMA HYBRID': [2011, 2012], OPTIMA: [2011, 2012, 2013] }, component: 'AIR BAGS: AIR BAG/RESTRAINT CONTROL MODULE', markers: ['air bag control unit (ACU) may short circuit', 'extension wire harness kit', 'SC165'] },
  brakeSwitch: { campaign: '13V114000', count: 30, optima: { OPTIMA: [2008, 2009, 2010, 2011] }, component: 'EXTERIOR LIGHTING:BRAKE LIGHTS:SWITCH', markers: ['stop lamp switch may malfunction', 'brake-transmission shift interlock', 'SC098'] },
  crankSensor: { campaign: '03V067000', count: 2, optima: { OPTIMA: [2001, 2002] }, component: 'ELECTRICAL SYSTEM:STARTER ASSEMBLY', markers: ['CRANKSHAFT POSITION SENSOR', 'CRACKING OF THE CIRCUIT BOARD CAPACITOR', 'ENGINE STALLING'] },
  subframe: { campaign: '09V183000', count: 4, optima: { OPTIMA: [2001, 2002, 2003, 2004] }, component: 'SUSPENSION:FRONT', markers: ['PROGRESSIVE, INTERNAL CORROSION OF THE FRONT SUBFRAME', 'LOWER CONTROL ARM', 'SEPARATION'] },
};
function optimaInventory(results) {
  const map = new Map();
  for (const row of results.filter((item) => /^OPTIMA(?:\s|$)/.test(item.Model))) { const years = map.get(row.Model) || new Set(); years.add(Number(row.ModelYear)); map.set(row.Model, years); }
  return Object.fromEntries([...map.entries()].sort().map(([model, years]) => [model, [...years].sort((a, b) => a - b)]));
}
async function verifyCampaign(key, url) {
  const response = await fetchWithRetries(url); const body = await response.json(); const expected = EXPECTED[key]; const results = body.results || []; const combined = JSON.stringify(results); const actualOptima = optimaInventory(results); const missingMarkers = expected.markers.filter((marker) => !combined.includes(marker));
  const passed = body.Count === expected.count && results.length === expected.count && results.every((row) => row.NHTSACampaignNumber === expected.campaign) && results.some((row) => row.Component === expected.component) && JSON.stringify(actualOptima) === JSON.stringify(expected.optima) && missingMarkers.length === 0;
  return { key, url, status: response.status, count: body.Count, campaign: expected.campaign, actualOptima, expectedOptima: expected.optima, missingMarkers, passed };
}
async function verifyPdf(key, source) {
  const response = await fetchWithRetries(source.url); const bytes = Buffer.from(await response.arrayBuffer()); const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return { key, url: source.url, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256, expectedSha256: source.sha256, pageCount: source.pageCount, visuallyInspectedPages: source.visuallyInspectedPages, expectedMarkers: source.markers, isPdf: bytes.subarray(0, 4).toString('ascii') === '%PDF', passed: response.status === 200 && bytes.subarray(0, 4).toString('ascii') === '%PDF' && sha256 === source.sha256 };
}
async function main() {
  const campaigns = []; for (const [key, url] of Object.entries(CAMPAIGN_SOURCES)) campaigns.push(await verifyCampaign(key, url));
  const pdfs = []; for (const [key, source] of Object.entries(PDF_SOURCES)) pdfs.push(await verifyPdf(key, source));
  const passed = campaigns.every((item) => item.passed) && pdfs.every((item) => item.passed); console.log(JSON.stringify({ passed, checkedOn: '2026-08-08', campaigns, pdfs }, null, 2)); if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { EXPECTED, optimaInventory, verifyCampaign, verifyPdf };
