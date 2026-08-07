/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-xe-adjudication-2026-08-06.json');
const IDS = {
  dpf: 'jaguar-xe-diesel-dpf-2017',
  infotainment: 'jaguar-xe-infotainment-freeze-2017',
  suspension: 'jaguar-xe-suspension-bushing-wear-2017',
  coolant: 'jaguar-xe-water-pump-ingenium-2017',
  transmission: 'jaguar-xe-zf-8hp-harsh-shift-2017',
};
const SOURCES = {
  dpf: 'https://www.jaguar.com/en-au/jdx/ownership/choose-your-engine/jaguar-diesel-particulate-filter.html',
  touchProUpdates: 'https://www.jaguar.com/en-gb/jdx/ownership/infotainment-systems/infotainment/software-updates/touch-pro.html',
  infotainment: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10095323-1020.pdf',
  coolant: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10177147-0001.pdf',
  transmission: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10142395-9999.pdf',
};
const PDF_SOURCES = { infotainment: SOURCES.infotainment, coolant: SOURCES.coolant, transmission: SOURCES.transmission };
const PDF_SHA256 = {
  infotainment: '28d8f4dc04a71f8013dd0593a75e0be1236090dec218df09d58011ea4fce6bfd',
  coolant: '604bdc73f9458965ae7c29ef0767387b35db71ab578924f0e6e68e6394bc9f8e',
  transmission: '99624ff3287f9c0b27c3a0bf714f2cb706297997ec2acbd3fb51169f848c986e',
};
const VISUALLY_INSPECTED_PAGES = { infotainment: [1, 2], coolant: [1, 2], transmission: [1, 2] };
const WEB_SOURCE_MARKERS = {
  dpf: ['frequently driving short distances', '60km/h and 112km/h for 20 minutes', 'red warning light indicates that the filter is full'],
  touchProUpdates: ['UPDATE YOUR TOUCH PRO INFOTAINMENT', 'Check for update', 'Not all vehicles can be updated via OTA'],
};
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 7 }, (_, index) => 2017 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=XE&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2017: { status: 200, campaigns: ['17V286000', '21V248000'] },
  2018: { status: 200, campaigns: ['17V678000', '18V090000', '21V248000'] },
  2019: { status: 200, campaigns: ['23V501000', '25V017000'] },
  2020: { status: 200, campaigns: ['21V248000', '25V017000'] },
  2021: { status: 400, campaigns: [] },
  2022: { status: 400, campaigns: [] },
  2023: { status: 400, campaigns: [] },
};
const KEEP_REASONS = {
  [IDS.dpf]: 'Jaguar owner guidance confirms that short trips, slow traffic and cold weather can prevent regeneration, but its amber-warning instruction is to drive between 60 and 112 km/h for 20 minutes and its full-filter instruction is to contact a retailer. It does not establish the frozen hardened-soot mechanism, P2463 identity, 80% threshold, forced regeneration, chemical-cleaning/replacement ladder or weekly 2,500 RPM prescription specifically across 2017-2020 XE diesels. The broader row remains byte-for-byte unchanged.',
  [IDS.infotainment]: 'Jaguar bulletin JTB00510NAS2 covers XE vehicles with InControl Touch Pro from 2017 onwards and identifies lockups, IMC resets, blank screens, frozen camera images and other reliability concerns. It says these may be caused by a software issue and specifies a software procedure with no parts required; it does not establish memory leaks, an underpowered processor, climate-control loss, a 12V-battery reset or head-unit replacement across the frozen 2017-2021 scope. Because the identity includes unsupported cause and remedy claims, the row remains unchanged.',
  [IDS.suspension]: 'No exact Jaguar primary source was located that establishes premature bonded-bushing wear of both front lower control arms and rear toe links as one 2017-2023 XE issue with the frozen prevalence, symptoms, assembly-replacement remedy, cost range and all-vehicle scope. The official recall inventory contains distinct campaign identities and is not negative proof, while the frozen citation has no URL. The row therefore remains byte-for-byte unchanged pending an exact source.',
  [IDS.coolant]: 'Jaguar service action H291 covers limited 2019-21 XE vehicles with the Ingenium I4 2.0L Petrol engine and addresses coolant-pump operation through a PCM software update with no parts required. It does not establish a mechanical bearing, seal or impeller failure across 2017-2023, does not include the 3.0L V6 Supercharged engine, and does not prescribe water-pump plus thermostat replacement. The source, year, engine, cause and remedy mismatch requires a byte-for-byte hold.',
  [IDS.transmission]: 'Jaguar bulletin JTB00637NAS1 covers a limited 2018 XE VIN range with the Ingenium I4 2.0L Petrol engine. It attributes hesitation or harsh gear changes to engine and/or transmission calibration software and lists no parts required. It does not support the frozen 2017-2023 and 3.0L V6 scope, a recurring 2-3 cold shift, adaptive-logic diagnosis, fluid/filter service, ZF LifeguardFluid 8, valve-body inspection or cost range. The broader row remains unchanged.',
};

function evidenceFor(id) {
  return {
    [IDS.dpf]: [{ kind: 'jaguar-owner-guidance-remedy-boundary', url: SOURCES.dpf, verifiedOn: '2026-08-06', observation: 'Jaguar describes short-trip regeneration limits and a 60-112 km/h, 20-minute amber-warning drive; it does not state the frozen 80% or 2,500 RPM rules.' }],
    [IDS.infotainment]: [
      { kind: 'jaguar-bulletin-cause-remedy-boundary', url: SOURCES.infotainment, verifiedOn: '2026-08-06', observation: 'JTB00510NAS2 identifies software-related InControl Touch Pro reliability concerns and a software-only procedure with no parts.' },
      { kind: 'jaguar-current-owner-update-guidance', url: SOURCES.touchProUpdates, verifiedOn: '2026-08-06', observation: 'Current Jaguar guidance explains Touch Pro software updating but does not establish the frozen hardware-failure remedy.' },
    ],
    [IDS.suspension]: [{ kind: 'official-registry-boundary-not-negative-proof', url: RECALL_QUERIES[2017], verifiedOn: '2026-08-06', observation: 'The official year inventory contains distinct campaigns and cannot establish or disprove the broad suspension-wear aggregation.' }],
    [IDS.coolant]: [{ kind: 'jaguar-service-action-scope-cause-remedy-mismatch', url: SOURCES.coolant, verifiedOn: '2026-08-06', observation: 'H291 covers limited 2019-21 2.0L petrol XE vehicles and a PCM software action with no parts, not the frozen mechanical multi-engine failure.' }],
    [IDS.transmission]: [{ kind: 'jaguar-bulletin-year-engine-cause-remedy-mismatch', url: SOURCES.transmission, verifiedOn: '2026-08-06', observation: 'JTB00637NAS1 covers a limited 2018 2.0L petrol VIN range and calibration software, not the frozen seven-year multi-engine service prescription.' }],
  }[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'XE');
  if (modelRows.length !== 5) throw new Error(`expected 5 Jaguar XE rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing XE decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content, scope or publication-state changes; partial or mismatched evidence cannot be expanded into the frozen indexed identity.', commerceDecision: 'unchanged-no-commerce-present', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Jaguar', model: 'XE',
    completionStatement: 'This packet reconciles all five frozen Jaguar XE rows. Three Jaguar technical PDFs and six relevant pages were visually reviewed; two current Jaguar owner pages and year-by-year NHTSA recall inventories were live-locked. All five rows remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All five XE rows remain published and byte-for-byte unchanged.', 'A model, equipment, engine, VIN, year, cause, code or remedy mismatch cannot authorize a broader rewrite.', 'A recall-registry result is not negative proof that a non-recall issue does not exist.', 'The five frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.', 'Distinct issue identities remain deferred until the post-audit new-known-issues phase.'],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 5 },
    observations: [
      { code: 'xe-dpf-remedy-claim-mismatch', severity: 'high', recordIds: [IDS.dpf], detail: 'Jaguar guidance supports regeneration constraints but not the frozen thresholds, DTC scope or repair ladder.' },
      { code: 'xe-infotainment-cause-remedy-overreach', severity: 'high', recordIds: [IDS.infotainment], detail: 'The located bulletin supports software reliability concerns but not the frozen hardware-cause and replacement claims.' },
      { code: 'xe-suspension-primary-source-gap', severity: 'source-gap', recordIds: [IDS.suspension], detail: 'No exact primary source cleared the seven-year control-arm and toe-link aggregation.' },
      { code: 'xe-coolant-year-engine-cause-remedy-mismatch', severity: 'high', recordIds: [IDS.coolant], detail: 'H291 is a limited 2019-21 2.0L petrol software action, not the frozen multi-engine mechanical failure.' },
      { code: 'xe-transmission-year-engine-cause-remedy-mismatch', severity: 'high', recordIds: [IDS.transmission], detail: 'JTB00637NAS1 is a limited 2018 2.0L petrol calibration concern, not the frozen broad ZF service claim.' },
      { code: 'xe-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-xe-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed XE record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES, webSourceMarkers: WEB_SOURCE_MARKERS, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary: { rewrite_same_identity: 0, keep_published_pending_source: 5, total: 5 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, WEB_SOURCE_MARKERS, evidenceFor };
