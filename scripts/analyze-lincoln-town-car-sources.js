/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { inspect } = require('./inspect-lincoln-source-inventory');
const { PDF_SOURCES } = require('./build-lincoln-town-car-adjudication');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-town-car-adjudication-2026-08-09.json');
const MODEL_ALIASES = ['TOWN CAR', 'TOWNCAR'];
const EXACT_PDF_URLS = new Set(Object.values(PDF_SOURCES).map((source) => source.url));
const EXACT_NHTSA_WEB_URLS = new Set([
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis',
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2000',
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2003',
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2008',
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2008',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['603547','612332','613389','615480','615493','619445','620174','627791','637481','10002513','10002672','10008264','10008325','10011162','10018074','10018959','10024866','10054006','10054924','10183773']);
function communicationId(url) { return (String(url).match(/\/(?:MC|SB)-(\d+)-/i) || [])[1] || ''; }
function campaignId(url) { const match = String(url).match(/(?:RCLRPT|RCAK|RCMN|RCONL|RCLQRT|RCRN|RCRIT|RMISC)-(\d{2}V\d{3})-/i); return match ? `${match[1].toUpperCase()}000` : ''; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Town Car').sort((a, b) => a.id.localeCompare(b.id));
  const packet = fs.existsSync(PACKET) ? JSON.parse(fs.readFileSync(PACKET, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const communications = new Set(inventory.relevantCommunications.map((row) => String(row.id)));
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const checks = [];
  for (const row of records) for (const source of row.citations || []) {
    const documentId = communicationId(source.url); const campaign = campaignId(source.url);
    let verdict = 'secondary-or-generic-source';
    if (EXACT_PDF_URLS.has(source.url)) verdict = 'exact-primary-pdf';
    else if (documentId) verdict = communications.has(documentId) ? 'exact-model-communication' : 'wrong-model-or-missing-communication';
    else if (campaign) verdict = campaigns.has(campaign) ? 'exact-model-recall-campaign' : 'wrong-model-or-missing-recall';
    else if (EXACT_NHTSA_WEB_URLS.has(source.url)) verdict = 'exact-nhtsa-record-or-current-api';
    checks.push({ id: row.id, url: source.url, documentId, campaign, verdict, searchStyle: searchStyle(source.url) });
  }
  const missingRequiredCommunications = REQUIRED_COMMUNICATION_IDS.filter((id) => !communications.has(id));
  const problems = checks.filter((check) => check.searchStyle || !check.verdict.startsWith('exact-'));
  const verdictCounts = checks.reduce((out, check) => ({ ...out, [check.verdict]: (out[check.verdict] || 0) + 1 }), {});
  return {
    passed: frozen.length === 9 && records.length === 9 && inventory.communicationTotal === 529 && inventory.recallRows.length === 125 && campaigns.size === 50 && missingRequiredCommunications.length === 0 && problems.length === 0,
    rowCount: records.length, communicationCounts: inventory.communicationCounts, communicationTotal: inventory.communicationTotal,
    recallCounts: inventory.recallCounts, recallTotal: inventory.recallRows.length, campaignCount: campaigns.size,
    requiredCommunicationCount: REQUIRED_COMMUNICATION_IDS.length, missingRequiredCommunications, verdictCounts, problems, checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { EXACT_NHTSA_WEB_URLS, EXACT_PDF_URLS, MODEL_ALIASES, PACKET, REQUIRED_COMMUNICATION_IDS, SNAPSHOT, analyze, campaignId, communicationId, searchStyle };
