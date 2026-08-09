/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { inspect } = require('./inspect-lincoln-source-inventory');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-navigator-adjudication-2026-08-09.json');
const MODEL_ALIASES = ['NAVIGATOR'];
const EXACT_OEM_URLS = new Set(['https://www.fordservicecontent.com/Ford_Content/pubs/content/~WT/~MUS~LEN/3637/tsb08-07-06.htm']);
const EXACT_NHTSA_WEB_URLS = new Set([
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis',
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=1999',
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2003',
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2006',
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2018',
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2017',
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2018',
]);
function communicationId(url) { return (String(url).match(/\/(?:MC|SB)-(\d+)-/i) || [])[1] || ''; }
function campaignId(url) { const match = String(url).match(/(?:RCLRPT|RCAK|RCMN|RCONL|RCLQRT|RCRN|RMISC)-(\d{2}V\d{3})-/i); return match ? `${match[1].toUpperCase()}000` : ''; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Navigator').sort((a, b) => a.id.localeCompare(b.id));
  const packet = fs.existsSync(PACKET) ? JSON.parse(fs.readFileSync(PACKET, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const communications = new Set(inventory.relevantCommunications.map((row) => row.id));
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const checks = [];
  for (const row of records) for (const source of row.citations || []) {
    const documentId = communicationId(source.url); const campaign = campaignId(source.url);
    let verdict = 'secondary-or-generic-source';
    if (EXACT_OEM_URLS.has(source.url)) verdict = 'exact-oem-document';
    else if (documentId) verdict = communications.has(documentId) ? 'exact-model-communication' : 'wrong-model-or-missing-communication';
    else if (campaign) verdict = campaigns.has(campaign) ? 'exact-model-recall-campaign' : 'wrong-model-or-missing-recall';
    else if (EXACT_NHTSA_WEB_URLS.has(source.url)) verdict = 'exact-nhtsa-record-or-current-api';
    checks.push({ id: row.id, url: source.url, documentId, campaign, verdict, searchStyle: searchStyle(source.url) });
  }
  const airCommunications = inventory.relevantCommunications.filter((row) => /(?:air ride|air suspension|air spring|air bag|air compressor|suspension compressor)/i.test(row.summary));
  const hvacDefectCommunications = inventory.relevantCommunications.filter((row) => /(?:blend door|temperature door|mode door).*(?:actuator|click|temperature)|(?:actuator|click|temperature).*(?:blend door|temperature door|mode door)/i.test(row.summary));
  const problems = checks.filter((check) => check.searchStyle || !check.verdict.startsWith('exact-'));
  const verdictCounts = checks.reduce((out, check) => ({ ...out, [check.verdict]: (out[check.verdict] || 0) + 1 }), {});
  return {
    passed: frozen.length === 16 && records.length === 16 && inventory.communicationTotal === 1314 && inventory.recallRows.length === 588 && campaigns.size === 71 && hvacDefectCommunications.length === 0 && problems.length === 0,
    rowCount: records.length, communicationCounts: inventory.communicationCounts, communicationTotal: inventory.communicationTotal,
    recallCounts: inventory.recallCounts, recallTotal: inventory.recallRows.length, campaignCount: campaigns.size,
    airSuspensionCommunicationMentions: airCommunications.length, hvacDefectCommunicationMentions: hvacDefectCommunications.length,
    verdictCounts, problems, checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { EXACT_NHTSA_WEB_URLS, EXACT_OEM_URLS, MODEL_ALIASES, PACKET, SNAPSHOT, analyze, campaignId, communicationId, searchStyle };
