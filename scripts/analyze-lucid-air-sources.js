/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { inspect } = require('./inspect-lucid-source-inventory');
const { OTHER_SOURCES, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, SNAPSHOT, OUTPUT } = require('./build-lucid-air-adjudication');

const EXACT_PDF_URLS = new Set(Object.values(PDF_SOURCES).map((source) => source.url));
const EXACT_WEB_URLS = new Set(Object.values(OTHER_SOURCES).map((source) => source.url));
function communicationId(url) { return (String(url).match(/\/(?:MC|SB)-(\d+)-/i) || [])[1] || ''; }
function campaignId(url) { const match = String(url).match(/(?:RCLRPT|RCAK|RCMN|RCONL|RCLQRT|RCRN|RCRIT|RMISC)-(\d{2}V\d{3})-/i); return match ? `${match[1].toUpperCase()}000` : ''; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

async function analyze() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const frozen = snapshot.records.filter((row) => row.make === 'Lucid' && row.model === 'Air').sort((a, b) => a.id.localeCompare(b.id));
  const packet = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  const records = packet ? packet.rows.map((row) => ({ id: row.id, ...row.proposal })) : frozen;
  const inventory = await inspect();
  const communications = new Set(inventory.relevantCommunications.map((row) => String(row.id)));
  const campaigns = new Set(inventory.recallRows.map((row) => row.campaign));
  const checks = [];
  for (const row of records) for (const source of row.citations || []) {
    const documentId = communicationId(source.url); const campaign = campaignId(source.url);
    let verdict = 'unknown-source';
    if (EXACT_PDF_URLS.has(source.url)) verdict = documentId ? (communications.has(documentId) ? 'exact-model-communication-pdf' : 'wrong-model-or-missing-communication') : (campaign && campaigns.has(campaign) ? 'exact-model-recall-pdf' : 'wrong-model-or-missing-recall');
    else if (EXACT_WEB_URLS.has(source.url)) verdict = source.url.startsWith('https://lucidmotors.com/') ? 'exact-manufacturer-html' : 'exact-nhtsa-record-or-dataset';
    checks.push({ id: row.id, url: source.url, documentId, campaign, verdict, searchStyle: searchStyle(source.url) });
  }
  const missingRequiredCommunications = REQUIRED_COMMUNICATION_IDS.filter((id) => !communications.has(id));
  const problems = checks.filter((check) => check.searchStyle || !check.verdict.startsWith('exact-'));
  const verdictCounts = checks.reduce((out, check) => ({ ...out, [check.verdict]: (out[check.verdict] || 0) + 1 }), {});
  return {
    passed: snapshot.records.length === 15 && frozen.length === 8 && records.length === 8 && inventory.communicationTotal === 86 && inventory.recallRows.length === 82 && campaigns.size === 18 && missingRequiredCommunications.length === 0 && problems.length === 0,
    makeSnapshotCount: snapshot.records.length, rowCount: records.length, communicationCounts: inventory.communicationCounts,
    communicationTotal: inventory.communicationTotal, recallCounts: inventory.recallCounts, recallTotal: inventory.recallRows.length,
    campaignCount: campaigns.size, requiredCommunicationCount: REQUIRED_COMMUNICATION_IDS.length, missingRequiredCommunications,
    verdictCounts, problems, checks,
  };
}

if (require.main === module) analyze().then((result) => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; }).catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { EXACT_PDF_URLS, EXACT_WEB_URLS, analyze, campaignId, communicationId, searchStyle };
