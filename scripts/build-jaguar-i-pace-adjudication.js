/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-i-pace-adjudication-2026-08-06.json');
const IDS = { battery12v: 'jaguar-i-pace-12v-battery-drain-2019', coldWeather: 'jaguar-i-pace-battery-conditioning-2019', contactor: 'jaguar-i-pace-contactor-failure-2019', ota: 'jaguar-i-pace-ota-update-issues-2019' };
const SOURCES = {
  battery12v: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10164829-9999.pdf',
  coldWeather: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10248645-0001.pdf',
  contactorRegistry: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=I-PACE&modelYear=2019',
  ota: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008447-0001.pdf',
};
const PDF_SOURCES = Object.fromEntries(Object.entries(SOURCES).filter(([key]) => key !== 'contactorRegistry'));
const PDF_SHA256 = { battery12v: 'a03b9b0ef8addfbacd6159c19bbd38b53a17ebeae4a0761f7de530ebad84e743', coldWeather: 'dceff685343e580bd4a3df80bc610f808c9d2d253eb1730cd6cf694874ee92cd', ota: '7780993ea878e5fbf1584213538fe29556830a755ea355bdbfb8e87c931ea734' };
const VISUALLY_INSPECTED_PAGES = { battery12v: [1, 2, 3], coldWeather: [1, 3], ota: [1, 4] };
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 8 }, (_, index) => 2019 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=I-PACE&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2019: { status: 200, campaigns: ['19V351000', '23V369000', '23V709000', '24V085000', '24V086000', '24V183000', '24V633000', '24V927000'] },
  2020: { status: 200, campaigns: ['19V351000', '20V082000', '23V369000', '23V709000', '24V085000', '24V086000', '24V183000', '26V067000'] },
  2021: { status: 200, campaigns: ['23V030000', '23V369000', '23V518000', '23V709000', '24V134000', '26V067000'] },
  2022: { status: 200, campaigns: ['23V030000', '23V369000', '23V518000', '23V709000', '24V134000'] },
  2023: { status: 200, campaigns: ['23V369000', '23V709000', '24V134000'] }, 2024: { status: 200, campaigns: ['23V369000', '24V134000'] },
  2025: { status: 400, campaigns: [] }, 2026: { status: 400, campaigns: [] },
};
const KEEP_REASONS = {
  [IDS.battery12v]: 'SSM74458 confirms I-PACE 12V quiescent drain from the CAN being kept awake by the TCU and/or passive-entry modules, but it is an interim 2019 diagnostic measure and limits the automated TCU reset to VIN F69000-F80955. It does not establish the frozen 2019-2025 scope, U0155, an OTA sleep-mode fix, mandatory AGM replacement or a five-day battery-tender rule; it warns that replacing the battery without finding the cause may lead to further failures, so the row remains byte-for-byte unchanged.',
  [IDS.coldWeather]: 'SOTA S014 applies its specific I-PACE change to 2021 model year, already included in later models, and improves cold-weather range prediction accuracy and climate-control-influenced range estimation. It is not evidence of battery-conditioning inefficiency, excessive heater draw, inability to reach temperature, a 30-40% loss or the frozen 2019-2025 remedy claims, so the row remains unchanged.',
  [IDS.contactor]: 'No exact Jaguar bulletin or campaign was located that establishes the frozen 2019-2023 high-voltage contactor resistance, arcing and failure identity, P0AA6 or battery-junction-box replacement. The official recall registry contains distinct battery and electrical campaign identities and is not negative proof, so the indexed row remains unchanged pending an exact primary source.',
  [IDS.ota]: 'H474 confirms failed SOTA updates only for certain 2021-2023 I-PACE vehicles and says VDC PIVI/Gateway Module A attempts were stopped pending a wired intervention with TCU update, PIVI recovery, SOTA-persistency clearing and GWM update. It does not establish the frozen 2019-2025 scope, post-update climate/charging regressions, Wi-Fi cause, hard-reset remedy or boot-loop behavior, so the broader row remains unchanged.',
};
function evidenceFor(id) {
  const evidence = {
    [IDS.battery12v]: [{ kind: 'jlr-ssm-partial-vin-year-remedy-scope', url: SOURCES.battery12v, verifiedOn: '2026-08-06', observation: 'SSM74458 confirms CAN wake by TCU/PEPS but limits the automated reset to VIN F69000-F80955 and warns against battery replacement without root-cause diagnosis.' }],
    [IDS.coldWeather]: [{ kind: 'jlr-sota-outcome-scope-mismatch', url: SOURCES.coldWeather, verifiedOn: '2026-08-06', observation: 'SOTA S014 improves range prediction/estimation for 21MY I-PACE, not battery thermal-conditioning efficiency or a quantified physical range loss.' }],
    [IDS.contactor]: [{ kind: 'official-registry-boundary-not-negative-proof', url: SOURCES.contactorRegistry, verifiedOn: '2026-08-06', observation: 'The 2019 registry returns distinct campaign identities; it neither establishes nor disproves a contactor defect.' }],
    [IDS.ota]: [{ kind: 'jlr-service-action-partial-year-module-remedy-scope', url: SOURCES.ota, verifiedOn: '2026-08-06', observation: 'H474 is limited to certain 2021-2023 SOTA failures and requires wired module intervention, not Wi-Fi troubleshooting or an infotainment hard reset.' }],
  }; return evidence[id];
}
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'I-PACE');
  if (modelRows.length !== 4) throw new Error(`expected 4 Jaguar I-PACE rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => { if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing I-PACE decision: ${current.id}`); const before = fullRecord(current); return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content, scope or publication-state changes; partial official evidence cannot be expanded into the frozen indexed identity.', commerceDecision: 'unchanged-no-commerce-present', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before }; });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Jaguar', model: 'I-PACE',
    completionStatement: 'This packet reconciles all four frozen Jaguar I-PACE rows. Three official JLR PDFs were downloaded and seven relevant pages visually reviewed; the contactor registry check is explicitly a coverage boundary. All four rows remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All four I-PACE rows remain published and byte-for-byte unchanged.', 'A partial year, VIN, module, outcome, code or remedy match cannot authorize a broader rewrite.', 'A recall-registry result is not negative proof that a non-recall issue does not exist.', 'The four frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.', 'Distinct recall identities remain deferred until the post-audit new-known-issues phase.'],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 4 },
    observations: [
      { code: 'i-pace-12v-vin-year-remedy-scope', severity: 'high', recordIds: [IDS.battery12v], detail: 'The exact quiescent-drain SSM is interim and VIN-limits its reset; it does not support the row’s full scope or blanket battery advice.' },
      { code: 'i-pace-cold-weather-outcome-scope-mismatch', severity: 'high', recordIds: [IDS.coldWeather], detail: 'SOTA S014 addresses range prediction/estimation, not inefficient battery thermal conditioning or a 30-40% physical loss.' },
      { code: 'i-pace-contactor-primary-source-gap', severity: 'source-gap', recordIds: [IDS.contactor], detail: 'No exact Jaguar primary source cleared the contactor identity; distinct recalls are not substituted.' },
      { code: 'i-pace-ota-year-module-remedy-scope', severity: 'high', recordIds: [IDS.ota], detail: 'H474 is a certain-vehicle 2021-2023 wired-recovery campaign, not the frozen seven-year regression narrative.' },
      { code: 'i-pace-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-i-pace-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed I-PACE record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary: { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor };
