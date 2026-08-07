/* eslint-disable @typescript-eslint/no-require-imports */
const { CAMPAIGN_COMPONENTS, CAMPAIGN_QUERIES, EXPECTED_RECALLS, RECALL_QUERIES } = require('./build-kia-borrego-adjudication');

async function verifyRecall(year, url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(60000) });
  const body = await response.json();
  const campaigns = [...new Set((body.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean))].sort();
  const expected = EXPECTED_RECALLS[year];
  return { year: Number(year), url, status: response.status, campaigns, expected, passed: response.status === expected.status && JSON.stringify(campaigns) === JSON.stringify(expected.campaigns) };
}

async function verifyCampaign(campaign, url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(60000) });
  const body = await response.json();
  const rows = (body.results || []).filter((row) => row.Make === 'KIA' && row.Model === 'BORREGO');
  const componentMarker = CAMPAIGN_COMPONENTS[campaign];
  const modelYears = [...new Set(rows.map((row) => Number(row.ModelYear)))].sort((a, b) => a - b);
  return { campaign, url, status: response.status, resultCount: rows.length, modelYears, componentMarker, passed: response.status === 200 && rows.length > 0 && rows.every((row) => String(row.Component || '').includes(componentMarker)) };
}

async function main() {
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecall(year, url));
  const campaigns = [];
  for (const [campaign, url] of Object.entries(CAMPAIGN_QUERIES)) campaigns.push(await verifyCampaign(campaign, url));
  const passed = recalls.every((item) => item.passed) && campaigns.every((item) => item.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', recalls, campaigns }, null, 2));
  if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
