/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-continental-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['CONTINENTAL']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

const IDS = Object.freeze({
  adaptive: 'lincoln-continental-adaptive-steering-fault-expensive-steering-module-wheel-repl',
  latch: 'lincoln-continental-door-latch-motor-failure-doors-may-open-while-driving',
  battery: 'lincoln-continental-parasitic-battery-drain-repeated-dead-battery',
  softClose: 'lincoln-continental-soft-close-door-cinch-motor-failure',
  coachDoor: 'lincoln-continental-suicide-doors-recall',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const DUPLICATE_RECALL_IDS = Object.freeze([IDS.latch, IDS.coachDoor].sort());

const PDF_SOURCES = Object.freeze({
  adaptive: { title: 'Ford SSM 47854: Continental SECM U3000:49 and SASM Reset', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10156575-0001.pdf', localPath: 'C:/tmp/lincoln-continental-adaptive.pdf', pages: 1, bytes: 10383, sha256: '1e840be77fa0457ba560b6906662331bd12f06e90e1c073a1ad9e4f73e417679' },
  battery: { title: 'Ford SSM 50804: 12-Volt Battery Drain from Third-Party App Network Calls', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10212957-0001.pdf', localPath: 'C:/tmp/lincoln-continental-battery.pdf', pages: 2, bytes: 124974, sha256: 'adb7f41de336698fd4f5bacb713763503b494f4aafad3c8419d687752a882d32' },
  camera: { title: 'NHTSA Part 573 Report 22V644 / Ford 22S51: Continental Rear-View Camera', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V644-5710.PDF', localPath: 'C:/tmp/lincoln-continental-camera.pdf', pages: 4, bytes: 215484, sha256: 'd672198d5f357db225953e48ecfd9b4d8a76cbbf25315db882a1560ca7b2cbcc' },
  door: { title: 'Ford Safety Recall 19S03 Supplement 5: Continental Door Latch Replacement', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2019/RCMN-19V077-7623.pdf', localPath: 'C:/tmp/lincoln-continental-door.pdf', pages: 17, bytes: 1205060, sha256: '52bcd5727d0fdfb4f575f6ce421630fe0a957d8478ec52c023960bf35b6a51c1' },
  softCloseDtc: { title: 'Ford TSB 17-2143: 2017 Continental Soft-Close Door B147F/B1483', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10115948-9999.pdf', localPath: 'C:/tmp/lincoln-continental-soft-close-dtc.pdf', pages: 2, bytes: 87016, sha256: 'cd6503b04fb0bf8331ed9e21d2e5aed00d1704803723fc6e41bd45c4c1046ff4' },
  softCloseOperation: { title: 'Ford SSM 46052: Continental Soft-Close Door Normal Operating Limits', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10109055-9999.pdf', localPath: 'C:/tmp/lincoln-continental-soft-close-operation.pdf', pages: 1, bytes: 6297, sha256: 'cd00fbef1bb1099543fba54600654b2e341e6cb5068ebe45c49c222b4befb45d' },
});

const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 257, '2000-2004': 145, '2005-2009': 11, '2010-2014': 0, '2015-2019': 154, '2020-2024': 95, '2025-2026': 12 }, totalRows: 674, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 70, post: 23 }, totalRows: 93, campaignCount: 50, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const vin = { url: 'https://www.nhtsa.gov/recalls', type: 'nhtsa', title: 'NHTSA VIN-Specific Recall Lookup' };
  const map = {
    [IDS.adaptive]: [PDF_SOURCES.adaptive],
    [IDS.latch]: [PDF_SOURCES.door, vin],
    [IDS.battery]: [PDF_SOURCES.battery],
    [IDS.softClose]: [PDF_SOURCES.softCloseOperation, PDF_SOURCES.softCloseDtc],
    [IDS.coachDoor]: [PDF_SOURCES.door, vin],
  };
  if (!map[id]) throw new Error(`Unexpected Continental correction ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.adaptive]: {
      confidence: 'low',
      description: 'The reviewed Ford source supports one narrow adaptive-steering diagnostic condition, not the page title’s broad module/wheel-failure and cost claim. SSM 47854 applies to 2017-2019 Continentals with U3000:49 in the Steering Effort Control Module (SECM) and no other DTCs. Ford directs technicians to perform the IDS SASM module-reset routine and explicitly says not to attempt repairs at that time. It does not establish 2020 applicability, a failed steering wheel or controller, replacement frequency, reprogramming as a failed first step, or a $1,200-$5,000 repair range.',
      solution: 'For the exact U3000:49-only condition on a 2017-2019 vehicle, follow SSM 47854 and perform the SASM module-reset routine before considering hardware. If another code, steering symptom or model year is involved, diagnose it under the current Ford Workshop Manual rather than assuming the SSM applies. Do not buy a steering wheel, SECM, controller, module or other part from this page; no universal replacement part or price is established.',
      summary: 'Replaced unsupported steering-wheel/module replacement and price claims with the exact U3000:49-only Ford diagnostic boundary.',
    },
    [IDS.latch]: {
      confidence: 'high',
      description: 'Ford safety recall 19S03/NHTSA 19V077 covers certain 2017-2019 Continentals built at Flat Rock from November 30, 2015 through November 14, 2018. On an affected vehicle, the electronic door-latch pawl motor may become inoperative so a door cannot close; an intermittently operating latch may not fully engage, allowing the door to open while driving. A door-ajar warning should remain present when the latch is not fully engaged. Eligibility is VIN-specific, not universal to every car in the indexed years.',
      solution: 'Check the VIN for open recall 19S03/19V077. The free dealer remedy replaces the latches on all four doors and includes the campaign’s functional checks. Do not drive with a door that will not latch or with an unresolved door-ajar/fault warning. Do not buy a latch, pawl motor, control module or other part from this page because this is a VIN-scoped no-charge safety-recall remedy.',
      summary: 'Bound the e-latch page to the exact 19S03 VIN/build population, symptoms and free four-door dealer remedy.',
    },
    [IDS.battery]: {
      confidence: 'medium',
      description: 'Ford SSM 50804 identifies one specific 12-volt battery-drain path for 2017-2020 Continentals: unaffiliated third-party phone applications can make excessive FordPass/LincolnWay vehicle-data calls and keep the vehicle network active. That source does not establish the page’s former claim that the driver-seat module is a frequent culprit, that door or liftgate switches and the modem commonly share one fault, or that owners typically replace several batteries before diagnosis. A dead battery can have other causes that require measurement.',
      solution: 'If a third-party app is being used to send vehicle commands, uninstall or disable it first as SSM 50804 directs, then confirm whether the drain stops. If the symptom persists, test battery condition and charging voltage, measure key-off draw after the vehicle reaches sleep state, and isolate the active circuit before replacing anything. Do not replace a seat module, telematics unit, switch, battery or other component from this page alone; no universal retail part is established.',
      summary: 'Removed unsupported frequent-module and repeated-battery claims and limited the page to Ford’s exact third-party-app network-wake condition plus measured diagnosis.',
    },
    [IDS.softClose]: {
      confidence: 'medium',
      description: 'Ford documents both normal soft-close limits and one exact early-build fault. SSM 46052 says the 2017 system is limited to 25 cycles per ignition cycle and will not operate at low battery charge or in transportation mode; Ford says not to repair those normal conditions. TSB 17-2143 applies only to soft-close-equipped 2017 Continentals built on or before March 7, 2017 when a door will not open and B147F and/or B1483 is stored in the door-latch control module. It does not establish a general cinch-motor failure across 2018-2019, a separately replaceable motor, or routine co-repair under recall 19S03.',
      solution: 'First rule out the 25-cycle, low-battery and transportation-mode operating limits. If an eligible early-build 2017 vehicle has a door that will not open, retrieve latch-module codes; TSB 17-2143 calls for replacement of the affected latch only when B147F and/or B1483 is present, otherwise normal Workshop Manual diagnosis applies. This is DTC-, build-date- and door-position-specific dealer service. Do not buy a cinch motor, latch or module from this page without VIN and code confirmation; no universal retail part is asserted.',
      summary: 'Separated normal soft-close limits from the exact B147F/B1483 early-build latch procedure and removed unsupported cross-year motor-failure claims.',
    },
    [IDS.coachDoor]: {
      confidence: 'high',
      description: 'Despite the frozen Coach Door wording in this page title, Ford safety recall 19S03/NHTSA 19V077 is defined by VIN and build population: certain 2017-2019 Continentals built at Flat Rock from November 30, 2015 through November 14, 2018. The electronic door-latch pawl motor may become inoperative, leaving a door unable to close or not fully engaged and at risk of opening while driving. The reviewed recall document does not grant eligibility by trim name, 80th Anniversary designation or door-hinge arrangement; owners must verify the VIN.',
      solution: 'Check the VIN for open recall 19S03/19V077. The free dealer remedy replaces the latches on all four doors and performs the required functional checks. Do not transport passengers when a door will not latch or while a door-ajar/fault warning remains unresolved. Do not buy a latch, pawl motor, control module or other part from this page because recall eligibility and the no-charge remedy are VIN-specific.',
      summary: 'Preserved the indexed URL while replacing universal Coach Door applicability with the exact VIN/build-scoped 19S03 recall boundary.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Continental correction ${id}`);
  return content[id];
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  if (!BLOCKER_IDS.includes(row.id)) return proposal;
  const content = contentFor(row.id);
  Object.assign(proposal, {
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(row.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    lastReportedByOwners: '',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  });
  return proposal;
}

function evidenceFor(row) {
  const inventory = `Complete model-name inventory: ${BULLETIN_INVENTORY.totalRows} exact Continental communications and ${RECALL_INVENTORY.totalRows} exact recall rows across ${RECALL_INVENTORY.campaignCount} campaigns were replayed, including historic generations.`;
  if (!BLOCKER_IDS.includes(row.id)) return [inventory, 'The visually inspected 22V644 Part 573 report proves the exact 2017-2020 Continental camera population, internal-lens coating defect, crash risk and free replacement.'];
  const details = {
    [IDS.adaptive]: ['Visual review of SSM 47854 proves U3000:49-only SASM reset for 2017-2019 and explicitly says not to repair.', 'The source does not prove a wheel/module replacement pattern, 2020 scope or any quoted price.'],
    [IDS.latch]: ['Visual review of recall 19S03 Supplement 5 proves the VIN/build population, latch-pawl symptom and free four-door remedy.', 'This page and the Coach Door URL describe the same campaign; both stay indexed pending duplicate disposition.'],
    [IDS.battery]: ['Visual review of SSM 50804 proves third-party app data calls can keep the network active on 2017-2020 Continentals.', 'It does not prove the former seat-module, switch, modem-frequency or repeated-battery claims.'],
    [IDS.softClose]: ['Visual review of SSM 46052 proves the 25-cycle/low-battery/transport-mode no-repair boundaries.', 'Visual review of TSB 17-2143 limits latch replacement to early-build 2017 vehicles with B147F/B1483.'],
    [IDS.coachDoor]: ['Visual review of recall 19S03 Supplement 5 proves VIN/build eligibility and does not create a Coach Door trim-level entitlement.', 'This page duplicates the same campaign as the e-latch URL and remains indexed pending review.'],
  };
  return [inventory, ...details[row.id], 'No search-style commerce or universal retail-part recommendation is introduced.'];
}

function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Continental').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(row); const changed = BLOCKER_IDS.includes(row.id);
    return { id: row.id, action: changed ? 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source' : 'keep_published_no_change', commerceDecision: changed ? 'dealer-or-diagnostic-remedy-no-universal-retail-part' : 'preserve-current-free-recall-remedy', evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-and-duplicate-identity-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lincoln',
    model: 'Continental',
    completionStatement: 'All six frozen Continental pages are accounted for: one remains byte-for-byte unchanged and five receive bounded source corrections without changing indexed identity.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Five material source corrections and one duplicate recall identity require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All six IDs, titles, categories, indexed year sets, trim sets, engine sets, related issue links, canonical severities and publication states remain unchanged.',
      'The two 19S03 door-latch URLs remain live and unredirected until an independently approved canonical and redirect order exists.',
      'A recall is VIN-scoped; a TSB or SSM is limited to its exact model, build date, code, symptom and procedure.',
      'No replaceable part is promoted without exact diagnosis and VIN/door-position fitment; every changed row has an explicit no-universal-commerce boundary.',
      'Unknown owner totals remain zero and the production UI hides them rather than presenting fake social proof.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'continental-five-pages-corrected', severity: 'accuracy-safety', recordIds: BLOCKER_IDS, detail: 'Five pages contained unsupported scope, cause, cost, part or trim claims that the complete source replay did not substantiate.' },
      { code: 'continental-door-recall-duplicate-identity-hold', severity: 'seo-review', recordIds: DUPLICATE_RECALL_IDS, detail: 'Both indexed URLs describe 19S03/19V077. No canonical, redirect, archive or title change is authorized in this packet.' },
      { code: 'continental-adaptive-steering-no-repair-boundary', severity: 'critical-correction', recordIds: [IDS.adaptive], detail: 'SSM 47854 says reset the SASM for U3000:49-only and do not attempt repairs; it does not prove costly steering-wheel/module replacement.' },
      { code: 'continental-battery-cause-narrowed', severity: 'accuracy', recordIds: [IDS.battery], detail: 'SSM 50804 proves only a third-party-app network-wake path, not a general seat-module or telematics failure pattern.' },
      { code: 'continental-soft-close-normal-operation-separated', severity: 'accuracy-safety', recordIds: [IDS.softClose], detail: 'Normal 25-cycle/low-battery/transport-mode limits are separated from the early-build 2017 B147F/B1483 latch procedure.' },
      { code: 'all-continental-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Continental page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { keep_published_no_change: rows.length - BLOCKER_IDS.length, retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: BLOCKER_IDS.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, DUPLICATE_RECALL_IDS, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor, publicPdfSources };
