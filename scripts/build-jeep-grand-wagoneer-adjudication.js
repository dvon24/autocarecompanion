/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-grand-wagoneer-adjudication-2026-08-06.json');
const frozenSnapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const ALL_IDS = frozenSnapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Grand Wagoneer').map((row) => row.id).sort();

const IDS = {
  airbags: 'jeep-grand-wagoneer-airbag-recall',
  quarterTrim: 'jeep-grand-wagoneer-quarter-window-trim',
};

const CAMPAIGNS = {
  orc: { campaign: '21V873000', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V873000', years: ['2022'], markers: ['Occupant Restraint Controller', 'incorrect software', 'disable the driver, passenger, and knee air bags', 'reprogram the ORC'] },
  bPillar: { campaign: '23V545000', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V545000', years: ['2022', '2023'], markers: ['upper B-pillar interior trim', 'side curtain air bag', 'reseat or replace the trim pieces'] },
  quarterTrim: { campaign: '25V642000', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V642000', years: ['2022', '2023', '2024'], markers: ['quarter trim', 'may not have been properly secured', 'replace the quarter window glass assembly'] },
};

const EXPECTED_RECALLS = {
  2021: { status: 400, campaigns: [] },
  2022: { status: 200, campaigns: ['21V00A000', '21V873000', '21V919000', '23V545000', '23V577000', '23V716000', '24V436000', '25V593000', '25V642000'] },
  2023: { status: 200, campaigns: ['23V545000', '23V577000', '23V716000', '24V199000', '24V436000', '25V593000', '25V642000'] },
  2024: { status: 200, campaigns: ['23V577000', '23V716000', '24V199000', '24V944000', '25V593000', '25V642000'] },
  2025: { status: 200, campaigns: ['25V593000'] },
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=GRAND%20WAGONEER&modelYear=${year}`]));

function citationUrls(row) { return (row.citations || []).map((item) => typeof item === 'string' ? item : (item.url || '')).filter(Boolean); }
function sourceClassFor(row) {
  const urls = citationUrls(row);
  if (!urls.length) return 'no-citations';
  if (urls.some((url) => /abcd1234efg|threads\/.*12345/i.test(url))) return 'placeholder';
  if (urls.some((url) => /nhtsa\.gov\/recalls\/?$/i.test(url))) return 'generic-nhtsa-landing-page';
  if (urls.some((url) => /static\.nhtsa\.gov/i.test(url))) return 'nhtsa-pdf';
  return 'secondary-only';
}

function reasonFor(row) {
  if (row.id === IDS.airbags) return 'Campaign 21V873 covers 2022 Grand Wagoneer ORC software, while 23V545 covers 2022-2023 upper B-pillar trim that can interfere with side-curtain-airbag deployment. The frozen page correctly separates two recall components in its title but links only generic NHTSA landing pages and secondary coverage, so the row remains byte-for-byte unchanged pending direct-link approval.';
  if (row.id === IDS.quarterTrim) return 'Campaign 25V642 supports the frozen 2022-2024 Grand Wagoneer quarter-window-trim detachment identity and inspection or quarter-window-glass-assembly replacement. The direct NHTSA file is live and the indexed row remains byte-for-byte unchanged because no repair is needed.';
  const range = `${row.years[0]}-${row.years[row.years.length - 1]}`;
  const sourceClass = sourceClassFor(row);
  if (sourceClass === 'no-citations') return `No citation is pinned for the frozen ${range} ${row.title} identity, causes, remedies, fitment or commerce. The row remains byte-for-byte unchanged.`;
  if (sourceClass === 'placeholder') return `A placeholder video or fabricated-looking forum thread does not establish the frozen ${range} ${row.title} identity, causes, remedies or commerce. The row remains byte-for-byte unchanged.`;
  return `The frozen ${range} ${row.title} row relies only on owner discussion or a broad community page, which does not establish its full scope, mechanism, repair or fitment. The row remains byte-for-byte unchanged.`;
}

function evidenceFor(row) {
  if (row.id === IDS.airbags) return ['orc', 'bPillar'].map((key) => ({ kind: 'official-campaign-identity-and-scope-check', url: CAMPAIGNS[key].url, verifiedOn: '2026-08-06', observation: `Campaign ${CAMPAIGNS[key].campaign} defines one of the two distinct frozen airbag-system identities.` }));
  if (row.id === IDS.quarterTrim) return [{ kind: 'official-campaign-exact-model-year-identity', url: CAMPAIGNS.quarterTrim.url, verifiedOn: '2026-08-06', observation: 'Campaign 25V642 covers 2022-2024 Grand Wagoneer quarter-window trim detachment.' }];
  const urls = citationUrls(row);
  return [{ kind: `source-classification-${sourceClassFor(row)}`, url: urls[0] || null, supportingUrls: urls.slice(1), verifiedOn: '2026-08-06', observation: 'The frozen source class does not authorize a content or commerce change.' }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Grand Wagoneer');
  if (modelRows.length !== 24) throw new Error(`expected 24 Jeep Grand Wagoneer rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(ALL_IDS)) throw new Error('Grand Wagoneer IDs do not match snapshot');
  const rows = modelRows.map((current) => { const before = fullRecord(current); return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: reasonFor(current), identityRule: 'No title, category, year, status, redirect or archive change without a complete exact-source match.', commerceDecision: 'unchanged-commerce-pending-exact-source-and-fitment', sourceClass: sourceClassFor(current), changedFields: [], evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before }; });
  const sourceQuality = rows.reduce((counts, row) => { counts[row.sourceClass] = (counts[row.sourceClass] || 0) + 1; return counts; }, {});
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Jeep', model: 'Grand Wagoneer',
    completionStatement: 'All 24 frozen Grand Wagoneer records remain byte-for-byte holds. Two official recall identities are pinned; the remaining pages lack exact primary support or use placeholder, generic or secondary sources.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All 24 Grand Wagoneer rows remain published and byte-for-byte unchanged.', 'Distinct airbag recalls remain distinct and a generic recall landing page is not a deep link.', 'Placeholder citations, owner discussions and unverified commerce cannot authorize a rewrite.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 24 },
    sourceQuality,
    observations: [
      { code: 'grand-wagoneer-airbag-page-needs-two-direct-campaign-links', severity: 'high', recordIds: [IDS.airbags], detail: 'The page combines exact campaigns 21V873 and 23V545 but cites only generic NHTSA landing pages and secondary coverage.' },
      { code: 'grand-wagoneer-quarter-trim-recall-exact', severity: 'verified', recordIds: [IDS.quarterTrim], detail: '25V642 matches 2022-2024 Grand Wagoneer quarter-window trim detachment.' },
      { code: 'grand-wagoneer-source-deficit', severity: 'high', recordIds: rows.filter((row) => ['no-citations', 'placeholder'].includes(row.sourceClass)).map((row) => row.id), detail: 'Fourteen rows have no citations and three use placeholder citations.' },
      { code: 'all-grand-wagoneer-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'Every frozen Grand Wagoneer record remains published and byte-for-byte unchanged.' },
    ],
    campaignSources: CAMPAIGNS, recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary: { rewrite_same_identity: 0, keep_published_pending_source: 24, total: 24 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, sourceQuality }, null, 2));
}
if (require.main === module) main();
module.exports = { ALL_IDS, CAMPAIGNS, EXPECTED_RECALLS, IDS, RECALL_QUERIES, evidenceFor, reasonFor, sourceClassFor };
