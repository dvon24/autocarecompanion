/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { inspect } = require('./inspect-lincoln-source-inventory');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-mkx-adjudication-2026-08-09.json');
const MODEL_ALIASES = ['MKX'];
const EXACT_OEM_URLS = new Set([
  'https://www.fordservicecontent.com/pubs/content/~WT/~MUS~LEN/3580/tsb13-08-02.pdf',
  'https://www.fordservicecontent.com/Ford_Content/catalog/owner_guides/11mkxog1e.pdf',
  'https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2018-Lincoln-MKX-Owner-Manual-version-2_om_EN-US_02_2018.pdf',
]);
const EXACT_NHTSA_HTML_URLS = new Set([
  'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=MKX&modelYear=2013',
  'https://www.nhtsa.gov/press-releases/consumer-alert-ford-mazda-issue-do-not-drive-warnings-more-457000-vehicles-recalled',
]);

function communicationId(url) {
  return (String(url).match(/\/(?:MC|SB)-(\d+)-/i) || [])[1] || '';
}
function campaignId(url) {
  const match = String(url).match(/(?:RCLRPT|RCAK|RCMN|RCONL|RCLQRT|RCRN|RMISC)-(\d{2}V\d{3})-/i);
  return match ? `${match[1].toUpperCase()}000` : '';
}
function isSearchStyle(url) {
  return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url));
}

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'MKX').sort((a, b) => a.id.localeCompare(b.id));
  const packet = fs.existsSync(PACKET) ? JSON.parse(fs.readFileSync(PACKET, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })).sort((a, b) => a.id.localeCompare(b.id)) : frozen;
  const inventory = await inspect({ aliases: MODEL_ALIASES });
  const communicationIds = new Set(inventory.relevantCommunications.map((row) => row.id));
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const checks = [];
  for (const row of records) for (const citation of row.citations || []) {
    const url = citation.url || '';
    const documentId = communicationId(url);
    const campaign = campaignId(url);
    let verdict = 'secondary-or-generic-source';
    if (documentId) verdict = communicationIds.has(documentId) ? 'exact-model-communication' : 'wrong-model-or-missing-communication';
    else if (campaign) verdict = campaigns.has(campaign) ? 'exact-model-recall-campaign' : 'wrong-model-or-missing-recall';
    else if (EXACT_OEM_URLS.has(url)) verdict = 'exact-oem-document';
    else if (EXACT_NHTSA_HTML_URLS.has(url)) verdict = 'exact-nhtsa-record-or-advisory';
    checks.push({ id: row.id, title: citation.title || '', url, documentId, campaign, verdict, searchStyle: isSearchStyle(url) });
  }
  const verdictCounts = checks.reduce((counts, check) => ({ ...counts, [check.verdict]: (counts[check.verdict] || 0) + 1 }), {});
  const problems = checks.filter((check) => check.searchStyle || !check.verdict.startsWith('exact-'));
  const waterPumpCommunications = inventory.relevantCommunications.filter((row) => /(?:water pump|coolant.*(?:oil|crankcase)|(?:oil|crankcase).*coolant)/i.test(row.summary));
  const roofShatterCommunications = inventory.relevantCommunications.filter((row) => /(?:sunroof|moonroof|vista roof|panoramic roof).*(?:shatter|break|explode)|(?:shatter|break|explode).*(?:sunroof|moonroof|vista roof|panoramic roof)/i.test(row.summary));
  return {
    passed: frozen.length === 9 && records.length === 9 && inventory.communicationTotal === 447 && inventory.recallRows.length === 363 && campaigns.size === 24 && problems.length === 0,
    modelAliases: MODEL_ALIASES,
    rowCount: records.length,
    communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal,
    recallCounts: inventory.recallCounts,
    recallTotal: inventory.recallRows.length,
    campaignCount: campaigns.size,
    waterPumpCommunicationMentions: waterPumpCommunications.length,
    roofShatterCommunicationMentions: roofShatterCommunications.length,
    verdictCounts,
    problems,
    checks,
  };
}

if (require.main === module) analyze().then((result) => {
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}).catch((error) => { console.error(error); process.exitCode = 1; });

module.exports = { EXACT_NHTSA_HTML_URLS, EXACT_OEM_URLS, MODEL_ALIASES, PACKET, SNAPSHOT, analyze, campaignId, communicationId, isSearchStyle };
