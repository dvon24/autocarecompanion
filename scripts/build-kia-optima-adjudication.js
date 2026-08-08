/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-optima-adjudication-2026-08-08.json');

const IDS = {
  acu: 'kia-optima-airbag-control-unit',
  speedSensor: 'kia-optima-automatic-transmission-speed-sensor-and-shift-failure',
  brakeSwitch: 'kia-optima-brake-switch-failure-causing-inoperative-brake-lamps-and-shift-issues',
  crankSensor: 'kia-optima-crankshaft-position-sensor-failure-causing-stall-or-no-start',
  dct: 'kia-optima-dct-clutch-judder',
  electrical: 'kia-optima-electrical-system-voltage-loss-and-accessory-failure',
  subframe: 'kia-optima-front-subframe-corrosion-and-suspension-collapse',
  headlights: 'kia-optima-headlight-dimming-and-lighting-circuit-malfunction',
  hybridBattery: 'kia-optima-hybrid-battery-failure',
  oilConsumption: 'kia-optima-oil-consumption',
  doorLock: 'kia-optima-power-door-lock-and-door-latch-failure',
  steeringLock: 'kia-optima-steering-lock-module-failure',
  theta: 'kia-optima-theta-ii-engine-failure',
};

const REWRITE_IDS = [IDS.acu, IDS.brakeSwitch, IDS.crankSensor, IDS.dct, IDS.subframe];
const CLEANUP_IDS = Object.values(IDS).filter((id) => !REWRITE_IDS.includes(id));

const CAMPAIGN_SOURCES = {
  acu: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V363000',
  brakeSwitch: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=13V114000',
  crankSensor: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V067000',
  subframe: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=09V183000',
};

const PDF_SOURCES = {
  dct: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200552-0001.pdf',
    sha256: 'a6127e90c3de68cb708083b3a8400b1bdc1ba9770451be51a74cf3fe336e0f21',
    pageCount: 8,
    visuallyInspectedPages: [1, 2, 6, 8],
    markers: ['2016-2020MY', 'Optima (JFa)', 'Gamma 1.6L T-GDI', '7-speed DCT', 'clutch judder', 'TRA083', 'August 28, 2015 to June 1, 2020'],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedOptimaRows: 435 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedOptimaRows: 154 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedOptimaRows: 25 },
  },
  totalExpectedOptimaRows: 614,
  requiredDocumentIds: ['10162049', '10200551', '10200552', '10230486', '10239736'],
};

const FLAT_RECALL_SOURCE = { name: 'FLAT_RCL_POST_2010.txt', extractedSha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' };
const EXPECTED_FLAT_RECALL_INVENTORY = {
  OPTIMA: {
    2006: ['11V153000', '12V014000'], 2007: ['11V153000', '12V014000'], 2008: ['11V153000', '12V014000', '13V114000'],
    2009: ['13V114000'], 2010: ['13V114000'],
    2011: ['13V114000', '17V224000', '18V363000', '18V907000', '23V652000'],
    2012: ['17V224000', '18V363000', '18V907000', '22V560000', '23V652000'],
    2013: ['17V224000', '18V363000', '18V907000', '20V100000', '20V519000', '21V331000', '22V093000', '22V560000', '23V652000'],
    2014: ['17V224000', '18V907000', '20V100000', '20V519000', '21V331000', '22V093000', '23V652000'],
    2015: ['18V907000', '20V519000', '21V331000', '23V652000'],
    2016: ['16V231000', '16V705000', '17V007000', '18V907000', '23V594000'],
    2017: ['18V161000', '18V907000', '23V594000'], 2018: ['18V161000', '23V594000'], 2019: ['19V539000'],
  },
  'OPTIMA HYBRID': {
    2011: ['18V363000', '20V750000', '23V652000'], 2012: ['18V363000', '20V750000', '23V652000'],
    2013: ['20V750000', '23V652000'], 2017: ['21V844000', '23V594000'], 2018: ['21V844000', '23V594000'],
  },
  'OPTIMA PHEV': { 2017: ['21V844000', '23V594000'], 2018: ['21V844000', '23V594000'] },
};
const DEFERRED_CAMPAIGNS = ['11V153', '12V014', '16V231', '16V705', '17V007', '18V161', '18V907', '19V539', '20V100', '20V519', '20V750', '21V331', '21V844', '22V093', '22V560', '23V594', '23V652'];

const REWRITE_CARDS = {
  [IDS.acu]: {
    description: 'Kia recall SC165 (NHTSA 18V-363) covers 2011-2013 Optima vehicles. In a crash, the air bag control unit (ACU) can short circuit and prevent the frontal air bags and seat-belt pretensioners from deploying, increasing injury risk.',
    solution: 'Check the VIN for open recall SC165/18V-363 and have the free dealer repair completed. For affected Optimas, Kia instructs dealers to install an extension wiring-harness kit between the ACU connector and vehicle-harness connector. The official remedy is not a clock spring or routine ACU replacement, so no retail part is linked.',
    severity: 'high', confidence: 'high', symptoms: [], affectedSystems: ['air bag control unit', 'frontal air bags', 'seat-belt pretensioners'],
    citations: [{ type: 'recall', title: 'NHTSA Recall 18V-363 - Air Bag Control Unit Short Circuit (SC165)', url: CAMPAIGN_SOURCES.acu }],
    summary: 'Bounded the page to SC165, corrected the remedy from ACU replacement to the extension-harness kit, removed unverified DTCs and unrelated clock-spring commerce, and replaced secondary citations with the official campaign API.',
  },
  [IDS.brakeSwitch]: {
    description: 'Kia recall SC098 (NHTSA 13V-114) covers 2008-2011 Optima vehicles with a stop-lamp switch that may malfunction. Brake lamps may fail to illuminate, cruise control may not disengage, push-button start or brake-transmission shift interlock operation may be affected, and the ESC warning light may illuminate. This indexed page retains its existing 2008-2010 year scope.',
    solution: 'Check the VIN for open recall SC098/13V-114 and have the free dealer repair completed. Kia dealers replace the stop-lamp switch. Because recall applicability is VIN-specific and the campaign remedy is free, no retail switch is linked.',
    severity: 'high', confidence: 'high', symptoms: ['Brake lamps do not illuminate', 'Cruise control does not disengage with brake pedal', 'Shift interlock or push-button start operates intermittently', 'ESC warning light illuminated'], affectedSystems: ['stop-lamp switch', 'brake lamps', 'cruise control', 'brake-transmission shift interlock'],
    citations: [{ type: 'recall', title: 'NHTSA Recall 13V-114 - Stop Lamp Switch (SC098)', url: CAMPAIGN_SOURCES.brakeSwitch }],
    summary: 'Replaced complaint-based claims and search commerce with the official SC098 failure modes and free VIN-specific stop-lamp-switch remedy while preserving the indexed 2008-2010 scope.',
  },
  [IDS.crankSensor]: {
    description: 'NHTSA recall 03V-067 covers 2001-2002 Optima vehicles equipped with 2.5L or 2.7L V6 engines. Crankshaft-position-sensor cases did not meet dimensional specifications; internal gaps could let epoxy contact the printed circuit board and crack a capacitor, which could cause the engine to stall.',
    solution: 'Check the VIN for recall 03V-067 completion. The official remedy is free dealer replacement of the crankshaft position sensor. Because this is a VIN-specific recall repair, no retail sensor or generic wiring kit is linked.',
    severity: 'high', confidence: 'high', symptoms: ['Engine may stall'], affectedSystems: ['crankshaft position sensor printed circuit board'],
    citations: [{ type: 'recall', title: 'NHTSA Recall 03V-067 - Crankshaft Position Sensor', url: CAMPAIGN_SOURCES.crankSensor }],
    summary: 'Bounded the page to the exact 2001-2002 2.5L/2.7L V6 recall mechanism and free CKP replacement, removing unverified P0335 attribution and search-result parts.',
  },
  [IDS.dct]: {
    description: 'Kia TSB TRA098 covers some 2016-2020 Optima (JFa) vehicles produced from August 28, 2015 through June 1, 2020 with the Gamma 1.6L T-GDI engine and 7-speed dual-clutch transmission. It defines clutch judder as body vibration without steering-wheel shudder during a creep test or acceleration from a stop.',
    solution: 'Have a Kia technician validate the judder and confirm the applicable ROM ID. TRA098 directs a KDS anti-judder software update (event 541). If judder remains, it directs the technician to TRA083 for 7-speed dual-clutch-assembly replacement. It does not prescribe a transmission-fluid change or generic clutch kit, so no retail part is linked.',
    severity: 'medium', confidence: 'high', symptoms: ['Body vibration without steering-wheel shudder during creep driving', 'Clutch judder when accelerating from a stop'], affectedSystems: ['7-speed dual-clutch transmission', 'transmission control software'],
    citations: [{ type: 'tsb', title: 'Kia TSB TRA098 - 7-Speed DCT Anti-Judder Logic Improvement', url: PDF_SOURCES.dct.url }],
    summary: 'Bounded the page to the visually inspected TRA098 scope and flowchart, removed generic DTCs, fluid advice, search commerce and inexact related links, and retained only the Kia software/clutch escalation.',
  },
  [IDS.subframe]: {
    description: 'NHTSA recall 09V-183 covers 2001-2004 Optimas originally sold in or currently registered in specified salt-belt states and the District of Columbia. Road salt can cause progressive internal corrosion of the front subframe near the lower-control-arm connection, leading to wheel misalignment, steering stress or abnormal tire wear; subframe separation can cause a crash.',
    solution: 'Check the VIN and registration history for recall 09V-183 eligibility and have the free Kia dealer repair completed. Do not select control arms or other parts from this page before the subframe is inspected under the campaign; no retail part is linked for the VIN- and corrosion-dependent remedy.',
    severity: 'high', confidence: 'high', symptoms: ['Wheel misalignment', 'Noticeable steering stress', 'Accelerated abnormal tire wear'], affectedSystems: ['front subframe near lower control arm connection'],
    citations: [{ type: 'recall', title: 'NHTSA Recall 09V-183 - Front Subframe Corrosion', url: CAMPAIGN_SOURCES.subframe }],
    summary: 'Bounded the page to the official salt-belt campaign, removed unsupported wheel-detachment and cost claims, and replaced generic control-arm commerce with the free VIN-specific dealer remedy.',
  },
};
for (const card of Object.values(REWRITE_CARDS)) card.commerceDecision = 'dealer-only-no-retail-part-official-campaign-or-bulletin';

const CLEANUP_REASONS = {
  [IDS.speedSensor]: 'The 2001-2002 speed-sensor aggregation has no URL-bearing primary citation, while its Denso sensor and Wix filter links are search results with no exact part number or fitment proof. Remove commerce and the dangling Hyundai relation; retain only neutral diagnosis while the identity stays blocked.',
  [IDS.electrical]: 'The broad voltage-loss/alternator/battery/locks/stalling aggregation has no primary source and recommends search-result parts without exact fitment. Remove commerce and unsupported repair/cost claims while the identity stays blocked.',
  [IDS.headlights]: 'The page combines load-related dimming and an automatic-headlamp high-beam logic complaint across 2001-2003 without primary evidence, then links unverified switch and bulb searches. Remove commerce and keep neutral electrical diagnosis while blocked.',
  [IDS.hybridBattery]: 'P0401-P0404 are EGR codes, not high-voltage-battery codes; the two Kia documents concern battery handling/fuse inspection rather than broad degradation, and all commerce is for unrelated 12V products. Remove the false codes, false citations, unsafe cost/DIY claims and unrelated commerce while blocked.',
  [IDS.oilConsumption]: 'The page combines five engine families and nine years without a primary package, lists generic mixture/catalyst codes as evidence, and links a search phrase rather than an exact part. Remove those fields and unsafe one-oil-fits-all advice while blocked.',
  [IDS.doorLock]: 'The multi-door entrapment aggregation has no primary source or exact actuator fitment, and its Dorman link is a search result. Remove commerce and unsupported cost/repair certainty while blocked.',
  [IDS.steeringLock]: 'The label-only NHTSA citation does not identify any complaint or campaign, and relay/multimeter search products do not remedy an electronic steering-lock module. Remove the false citation and unrelated commerce while blocked.',
  [IDS.theta]: 'The frozen 2011-2019 page stretches one manufacturing-debris narrative and warranty statement across more years than recall 17V-224 establishes, while piston rings and assembly lube do not remedy rod-bearing seizure. Remove search commerce, unsupported warranty certainty and inexact related links while blocked.',
};

function stamp(proposal, summary) {
  Object.assign(proposal, { humanApproved: false, reportCount: 0, source: 'manual', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08', contentUpdateSummary: summary });
  return proposal;
}
function rewriteProposal(row) {
  const proposal = fullRecord(row); const card = REWRITE_CARDS[row.id];
  Object.assign(proposal, { description: card.description, solution: card.solution, severity: card.severity, confidence: card.confidence, symptoms: clone(card.symptoms), affectedSystems: clone(card.affectedSystems), dtcCodes: [], citations: clone(card.citations), communityRecommendations: [], fixParts: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, relatedIssueIds: [] });
  return stamp(proposal, card.summary);
}
function cleanupProposal(row) {
  const proposal = fullRecord(row);
  const solutions = {
    [IDS.speedSensor]: 'Have a transmission specialist scan the transmission-control system and verify actual input/output speed-sensor signals, wiring and fluid condition before replacing parts. No exact sensor, filter or related issue has been validated for this broad page.',
    [IDS.electrical]: 'Have the battery, charging output, grounds, main power connections and voltage drop tested under load. The frozen evidence does not establish one component or fitment across this broad symptom set, so no alternator or battery is recommended from this page.',
    [IDS.headlights]: 'Have charging voltage, grounds, headlamp switch logic and the affected circuit tested under the exact operating condition. This page does not establish one switch or bulb failure across all three years, so no retail part is recommended.',
    [IDS.hybridBattery]: 'Have a hybrid-qualified technician retrieve the actual battery-management codes and test the high-voltage system before discussing repair. Do not use the former EGR codes or 12V battery/maintainer products to diagnose a traction-battery concern. Confirm warranty and campaign coverage by VIN.',
    [IDS.oilConsumption]: 'Document oil level and usage with the manufacturer-specified procedure for the exact engine and VIN, and inspect for external leakage and other causes before internal engine work. Do not infer oil consumption from the former generic catalyst/mixture codes or apply one oil grade across every listed engine.',
    [IDS.doorLock]: 'Inspect the exact affected door latch, actuator, linkage, jamb wiring and control signals before replacing parts. No exact actuator fitment has been validated across this broad page.',
    [IDS.steeringLock]: 'Confirm the warning, start authorization, 12V supply, wiring and steering-lock module diagnosis with Kia service information for the exact VIN before module or column replacement. Generic relays and test tools are not repairs for this condition.',
    [IDS.theta]: 'If knocking, oil-pressure warning, stalling or seizure symptoms occur, stop driving and have Kia check the VIN for applicable recalls, campaigns, software and warranty extensions before engine work. This page does not establish one recall or warranty term across every listed year, and piston rings or assembly lube are not a repair for rod-bearing failure.',
  };
  proposal.solution = solutions[row.id]; proposal.citations = []; proposal.communityRecommendations = []; proposal.fixParts = []; proposal.relatedIssueIds = [];
  if ([IDS.hybridBattery, IDS.oilConsumption].includes(row.id)) proposal.dtcCodes = [];
  return stamp(proposal, `Targeted safety cleanup only: ${CLEANUP_REASONS[row.id]}`);
}
function actionFor(id) { return REWRITE_IDS.includes(id) ? 'rewrite_same_identity' : 'targeted_safety_cleanup_pending_source'; }
function reasonFor(id) { return REWRITE_IDS.includes(id) ? 'Exact official evidence supports a bounded correction of this same indexed identity; ID, title, category, years and publication state remain unchanged.' : CLEANUP_REASONS[id]; }
function evidenceFor(row) {
  if (row.id === IDS.dct) return [{ kind: 'official-kia-tsb-exact-same-identity', url: PDF_SOURCES.dct.url, sha256: PDF_SOURCES.dct.sha256, pageCount: 8, visuallyInspectedPages: PDF_SOURCES.dct.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'TRA098 exactly matches the frozen 2016-2020 1.6T/7DCT scope, defines the judder test, directs update event 541 and escalates persistent judder to TRA083.' }];
  if (REWRITE_IDS.includes(row.id)) return [{ kind: 'official-nhtsa-recall-exact-same-identity', url: CAMPAIGN_SOURCES[Object.keys(IDS).find((key) => IDS[key] === row.id)], verifiedOn: '2026-08-08', observation: REWRITE_CARDS[row.id].summary }];
  return [{ kind: 'critical-field-cleanup-with-substantive-identity-still-blocked', verifiedOn: '2026-08-08', observation: CLEANUP_REASONS[row.id] }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Optima');
  if (modelRows.length !== 13) throw new Error(`expected 13 Optima rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(Object.values(IDS).sort())) throw new Error('frozen Optima ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const rewrite = REWRITE_IDS.includes(current.id); const proposal = rewrite ? rewriteProposal(current) : cleanupProposal(current);
    return { id: current.id, model: current.model, action: actionFor(current.id), reason: reasonFor(current.id), identityRule: 'No evidence may change an indexed page identity. Broad years, engines, mechanisms or remedies remain blocked; known false citations, codes, commerce and relations receive targeted cleanup.', commerceDecision: rewrite ? REWRITE_CARDS[current.id].commerceDecision : 'remove-unsafe-or-unverified-commerce-pending-exact-source', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const blockerRecordIds = CLEANUP_IDS.slice().sort();
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Optima', completionStatement: 'All thirteen frozen Kia Optima records are adjudicated. Five exact recall or bulletin identities receive bounded rewrites; eight broad or unsupported identities receive targeted safety cleanup and remain blocked.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'Eight Optima pages remain source-, year-, engine- or mechanism-conflicted. Independent review is required before any proposal is applied.' },
    safetyContract: ['No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, new issue or public-page change is authorized.', 'All thirteen Optima IDs, titles, categories, indexed year sets and publication states remain unchanged.', 'A hold cannot conceal a known false citation, DTC, unsafe commerce instruction or inaccurate related link; every Optima blocker therefore has a targeted cleanup proposal.', 'Search-result commerce never passes. Exact recall and bulletin remedies are dealer-only because no verified retail part is specified.', 'The cited DCT PDF was downloaded, hashed, read in full, rendered and visually inspected; live verification must reproduce its hash.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 13 },
    observations: [
      { code: 'optima-five-exact-identities-bounded', severity: 'content-correction', recordIds: REWRITE_IDS.slice().sort(), detail: 'SC165, SC098, 03V-067, 09V-183 and TRA098 exactly match their frozen page identities and scopes.' },
      { code: 'optima-acu-remedy-corrected', severity: 'critical', recordIds: [IDS.acu], detail: 'SC165 prescribes an extension harness kit, not routine ACU replacement; the unrelated clock-spring search was removed.' },
      { code: 'optima-dct-fluid-codes-and-relations-removed', severity: 'critical', recordIds: [IDS.dct], detail: 'TRA098 supports KDS update event 541 and TRA083 escalation, not generic DTCs, fluid change, a manual clutch kit or the frozen cross-model related links.' },
      { code: 'optima-hybrid-battery-false-egr-codes-and-sources-removed', severity: 'critical', recordIds: [IDS.hybridBattery], detail: 'P0401-P0404 are EGR codes; the cited handling/fuse documents and 12V products do not establish or repair broad traction-battery degradation.' },
      { code: 'optima-eight-aggregations-remain-blocked', severity: 'critical', recordIds: blockerRecordIds, detail: 'Every unsupported broad aggregation receives only a targeted cleanup; none is promoted to an evidence-backed rewrite.' },
      { code: 'optima-seventeen-new-recall-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'The complete post-2010 Optima-family inventory contains seventeen distinct campaign identities absent from an exact frozen issue page; additions are deferred.' },
      { code: 'all-optima-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS).sort(), detail: 'Every Optima ID, title, category, indexed year set and publication state remains preserved; no redirect, archive, deletion or new public page is proposed.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, pdfSources: PDF_SOURCES, manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE, flatRecallSource: FLAT_RECALL_SOURCE, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 5, targeted_safety_cleanup_pending_source: 8, total: 13 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGN_SOURCES, CLEANUP_IDS, CLEANUP_REASONS, DEFERRED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, SNAPSHOT, actionFor, cleanupProposal, evidenceFor, reasonFor, rewriteProposal };
