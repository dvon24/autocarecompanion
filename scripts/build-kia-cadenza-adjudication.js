/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-cadenza-adjudication-2026-08-06.json');
const IDS = {
  engine: 'kia-cadenza-gdi-engine-knock-2014',
  sunroof: 'kia-cadenza-panoramic-sunroof-2014',
  transmission: 'kia-cadenza-transmission-hesitation-2014',
};
const PDF_SOURCES = {
  coolantWarranty: { url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11000357-0001.pdf', sha256: 'f7048ebf132331e8091879c3c8da8fec127e0594919b0bb5ad8529df3e0e5162', visuallyInspectedPages: [1], markers: ['2014-2017 MY KIA CADENZA VEHICLES', 'COOLANT LEAK', '15 years / 180,000 miles', 'cylinder head gasket'] },
  investigation: { url: 'https://static.nhtsa.gov/odi/inv/2023/INCLA-PE23019-20696.pdf', sha256: '06df25603bc927339fb4a4adc1d92db3901e60d4bbdf326d14ba3db7fe82fac1', visuallyInspectedPages: [1, 2], markers: ['head gasket / head bolt failure', 'MY 2014-2017 Kia Cadenza', 'WTY039', '15 years or 180,000 miles'] },
  transmission: { url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10197336-9999.pdf', sha256: 'e3c371d9a2b5dc27923ee0c1a463d54af2709faddb2fa400562a40724338bfc8', visuallyInspectedPages: [1, 2, 5], markers: ['2014~2015MY Cadenza (VG)', 'hunting', 'busy shift', 'Start Cruise Control', 'Upgrade Event #259'] },
  sunroof: { url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10060139-2280.pdf', sha256: '435e197765505e8b6641273fc627f60b3464150ab4cc2e8704afb0ad8451c63d', visuallyInspectedPages: [1], markers: ['2014MY Cadenza (VG)', 'Rattling, Squeaking or Creaking Noises From Roof Area', 'felt tape'] },
};
const EXPECTED_RECALLS = {
  2014: ['14V289000', '22V158000', '23V652000'],
  2015: ['22V158000', '23V652000'],
  2016: ['22V158000', '23V652000'],
  2017: ['17V190000', '21V137000'],
  2018: ['21V137000'],
  2019: ['21V137000'],
  2020: ['22V022000'],
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=KIA&model=CADENZA&modelYear=${year}`]));
const CAMPAIGN_COMPONENTS = { '14V289000': 'WHEELS', '22V158000': 'VISIBILITY:WINDSHIELD', '23V652000': 'CONTROL UNIT/MODULE', '17V190000': 'VACUUM:HOSES, LINES/PIPING, AND FITTINGS', '21V137000': 'CONTROL UNIT/MODULE', '22V022000': 'POWER WINDOW DEVICES AND CONTROLS' };
const CAMPAIGN_QUERIES = Object.fromEntries(Object.keys(CAMPAIGN_COMPONENTS).map((campaign) => [campaign, `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`]));
const KEEP_REASONS = {
  [IDS.engine]: 'The frozen page conflates the Cadenza with a different Kia connecting-rod-bearing settlement and states 15 years/150,000 miles. Visually inspected Kia and NHTSA documents instead identify a cylinder-head-gasket/head-bolt coolant-leak condition for 2014-2017 Cadenza 3.3L engines under WTY039 for 15 years/180,000 miles. That is a different component, failure mechanism, symptom set, year range and warranty; rewriting it under this connecting-rod-bearing title would substitute identities, so the row remains byte-for-byte unchanged.',
  [IDS.sunroof]: 'The frozen sources are class-action/media/forum pages. Visually inspected Kia PS282 concerns only rattling, squeaking or creaking from the 2014 Cadenza panoramic-roof front cover and a felt-tape repair; it does not establish spontaneous glass shattering across 2014-2020, manufacturing stress fractures, goodwill coverage or the stated price. Generic trim-tool and body-filler commerce is unrelated to glass replacement, so the row remains byte-for-byte unchanged.',
  [IDS.transmission]: 'Visually inspected Kia TSB TRA056 covers some 2014-2015 Cadenza vehicles produced in specified 2013-2014 windows and describes hunting/busy shift most prominently while climbing an incline with Smart Cruise Control engaged. The frozen row extends to 2020 and instead aggregates low-speed coast hesitation, hard downshifts, valve-body replacement, P0700/P0730 and a 30,000-mile interval. The partial source cannot authorize that broader identity or generic Dorman/ATP commerce, so the row remains byte-for-byte unchanged.',
};
function evidenceFor(id) {
  if (id === IDS.engine) return [
    { kind: 'official-warranty-identity-conflict', url: PDF_SOURCES.coolantWarranty.url, sha256: PDF_SOURCES.coolantWarranty.sha256, visuallyInspectedPages: [1], verifiedOn: '2026-08-06', observation: 'Kia WTY039 is a 2014-2017 cylinder-head-gasket/head-bolt coolant-leak extension for 15 years/180,000 miles, not the frozen connecting-rod-bearing settlement claim.' },
    { kind: 'official-investigation-confirms-different-defect', url: PDF_SOURCES.investigation.url, sha256: PDF_SOURCES.investigation.sha256, visuallyInspectedPages: [1, 2], verifiedOn: '2026-08-06', observation: 'NHTSA PE23019 identifies head-bolt thread engagement and WTY039 for 2014-2017 Cadenza, confirming the mismatch.' },
  ];
  if (id === IDS.sunroof) return [{ kind: 'official-bulletin-similar-area-different-failure', url: PDF_SOURCES.sunroof.url, sha256: PDF_SOURCES.sunroof.sha256, visuallyInspectedPages: [1], verifiedOn: '2026-08-06', observation: 'Kia PS282 addresses 2014 roof-area rattle/squeak/creak with felt tape, not spontaneous sunroof-glass shattering.' }];
  return [{ kind: 'official-bulletin-partial-year-and-condition', url: PDF_SOURCES.transmission.url, sha256: PDF_SOURCES.transmission.sha256, visuallyInspectedPages: [1, 2, 5], verifiedOn: '2026-08-06', observation: 'TRA056 is limited to some 2014-2015 Cadenza and a hunting/busy-shift condition most prominent on inclines with SCC; it does not substantiate the frozen 2014-2020 aggregation.' }];
}
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Cadenza');
  const expectedIds = Object.values(IDS).sort();
  if (modelRows.length !== 3 || JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('Cadenza frozen-ID coverage mismatch');
  const rows = modelRows.map((current) => { const before = fullRecord(current); return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'A different official defect or a partial year/condition match cannot replace or broaden an indexed identity; the row must remain byte-for-byte frozen.', commerceDecision: current.communityRecommendations.some((item) => item.affiliateUrl || item.affiliateLink || item.amazonLink) ? 'unchanged-search-commerce-pending-exact-fitment' : 'unchanged-no-commerce', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before }; });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Kia', model: 'Cadenza',
    completionStatement: 'All three frozen Kia Cadenza rows are reconciled. Official evidence exposes one different engine defect, one different roof condition and one partial transmission condition; all rows remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All three Cadenza rows remain published and byte-for-byte unchanged.', 'A verified but different defect cannot be substituted under an existing indexed title.', 'Partial model-year and operating-condition evidence cannot authorize a broader page.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 3 },
    observations: [
      { code: 'cadenza-engine-settlement-identity-conflation', severity: 'critical', recordIds: [IDS.engine], detail: 'Frozen connecting-rod/15y-150k content conflicts with Kia/NHTSA head-gasket/head-bolt WTY039 coverage at 15y-180k for 2014-2017.' },
      { code: 'cadenza-transmission-tsb-partial-scope', severity: 'critical', recordIds: [IDS.transmission], detail: 'TRA056 supports only some 2014-2015 vehicles and a specific incline/SCC hunting condition, not the 2014-2020 aggregation.' },
      { code: 'cadenza-sunroof-official-source-different-condition', severity: 'high', recordIds: [IDS.sunroof], detail: 'Kia PS282 addresses noise from the front cover with felt tape, not spontaneous glass shattering.' },
      { code: 'all-cadenza-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every frozen Cadenza ID, title, category, year set and publication state remains untouched.' },
    ],
    pdfSources: PDF_SOURCES,
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS, campaignQueries: CAMPAIGN_QUERIES, campaignComponents: CAMPAIGN_COMPONENTS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { CAMPAIGN_COMPONENTS, CAMPAIGN_QUERIES, EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, evidenceFor };
