/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-sephia-adjudication-2026-08-08.json');
const IDS = {
  clutch: 'kia-sephia-clutch-hydraulic-1994',
  headGasket: 'kia-sephia-head-gasket-1994',
  wheelBearing: 'kia-sephia-rear-wheel-bearing-1994',
  timingBelt: 'kia-sephia-timing-belt-failure-1994',
};
const CLEANUP_IDS = Object.values(IDS);

const CAMPAIGN_SOURCES = {
  orvr: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=00V175000',
  hazardSwitch: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=02V207000',
  seatBuckleEarly: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=02V216000',
  seatBuckleLate: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=04V305000',
  speedometer: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=94V134000',
  wiper: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V271000',
  fuelConnector: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V317000',
  fuelGround: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V318000',
};
const EXPECTED_CAMPAIGNS = {
  orvr: { years: [1998, 1999], rows: 2, component: 'ENGINE AND ENGINE COOLING:EXHAUST SYSTEM:EMISSION CONTROL', markers: ['ORVR', 'replace the ORVR valve'] },
  hazardSwitch: { years: [1998], rows: 1, component: 'EXTERIOR LIGHTING:HAZARD FLASHING WARNING LIGHTS:SWITCH', markers: ['hazard switch', 'replace the hazard switch'] },
  seatBuckleEarly: { years: [1995, 1996, 1997, 1998], rows: 4, component: 'SEAT BELTS:FRONT:BUCKLE ASSEMBLY', markers: ['false latch'] },
  seatBuckleLate: { years: [1999, 2000], rows: 2, component: 'SEAT BELTS:FRONT:BUCKLE ASSEMBLY', markers: ['front safety belt buckles', 'replace both front seat belt buckles'] },
  speedometer: { years: [1994], rows: 1, component: 'POWER TRAIN', markers: ['electronic speedometer sensor', 'new speedometer drive gear'] },
  wiper: { years: [1998, 1999], rows: 2, component: 'VISIBILITY:WINDSHIELD WIPER/WASHER:LINKAGES', markers: ['windshield wiper link', 'properly tighten the wiper arm retaining nuts'] },
  fuelConnector: { years: [1998, 1999], rows: 2, component: 'FUEL SYSTEM, GASOLINE:DELIVERY:FUEL PUMP', markers: ['C304 and C305 connectors', 'replace the existing connectors'] },
  fuelGround: { years: [1998, 1999], rows: 2, component: 'FUEL SYSTEM, GASOLINE:DELIVERY:FUEL PUMP', markers: ['junction connector G300', 'performed in conjunction with recall no. 99V317'] },
};
const YOUTUBE_CITATION_CHECKS = {
  [IDS.clutch]: { videoId: '6xX3v5nQZsQ', expectedOembedStatus: 404 },
  [IDS.headGasket]: { videoId: 'Qp1rJ6x3H9k', expectedOembedStatus: 404 },
  [IDS.wheelBearing]: { videoId: '5YBq2U6xPZ8', expectedOembedStatus: 404 },
  [IDS.timingBelt]: { videoId: '3mE7x5Y6D1Q', expectedOembedStatus: 404 },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '1995-1999': { name: 'MFR_COMMS_RECEIVED_1995-1999.csv', sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db', expectedSephiaRows: 7 },
    '2000-2004': { name: 'MFR_COMMS_RECEIVED_2000-2004.csv', sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264', expectedSephiaRows: 17 },
    '2005-2009': { name: 'MFR_COMMS_RECEIVED_2005-2009.csv', sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b', expectedSephiaRows: 2 },
    '2010-2014': { name: 'MFR_COMMS_RECEIVED_2010-2014.csv', sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387', expectedSephiaRows: 1 },
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedSephiaRows: 4 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedSephiaRows: 1 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedSephiaRows: 0 },
  },
  totalExpectedSephiaRows: 32,
  exactIdentityDocumentIds: [],
};
const FLAT_RECALL_SOURCE = {
  pre2010: { name: 'FLAT_RCL_PRE_2010.txt', sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232', expectedSephiaRows: 16 },
  post2010: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedSephiaRows: 0 },
};
const EXPECTED_PRE_2010_RECALL_INVENTORY = {
  '00V175000': [1998, 1999], '02V207000': [1998], '02V216000': [1995, 1996, 1997, 1998],
  '04V305000': [1999, 2000], '94V134000': [1994], '99V271000': [1998, 1999],
  '99V317000': [1998, 1999], '99V318000': [1998, 1999],
};
const EXPECTED_FLAT_RECALL_INVENTORY = {};
const EXPECTED_COMPLETE_RECALL_INVENTORY = { ...EXPECTED_PRE_2010_RECALL_INVENTORY };
const DEFERRED_CAMPAIGNS = Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY).sort().map((campaignNumber) => ({
  campaignNumber,
  reason: 'Complete Sephia inventory campaign is a separate issue identity not represented by any of the four frozen pages; proposal-only collection remains deferred until the remaining-make audit is complete.',
}));

const CARDS = {
  [IDS.clutch]: {
    reason: 'No exact Kia communication or recall supports the frozen all-year prevalence, seal-quality, common-failure or parts-availability claims, and the named YouTube citation returns 404 through the publisher oEmbed endpoint.',
    description: 'The frozen page describes a broad 1994-2001 hydraulic-clutch failure pattern, but the complete Kia Sephia manufacturer-communication and recall inventories reviewed for this audit contain no exact primary package establishing its claimed prevalence, common slave-cylinder failure point, seal-quality explanation or all-year scope. The sole named video citation is unavailable through YouTube\'s oEmbed endpoint.',
    solution: 'Confirm that the vehicle has the manual-transmission hydraulic clutch system, then diagnose fluid level and condition, external leaks, the master cylinder, hydraulic line, slave cylinder, release mechanism and clutch itself before ordering parts. Repair only the verified failed component and bleed or adjust the system using exact model-year service information. Do not replace the master cylinder, slave cylinder and clutch as a bundle or buy a generic search result from this page.',
    symptoms: ['Reported loss or change of clutch-pedal pressure', 'Reported clutch-release or engagement difficulty'], systems: ['manual-transmission clutch actuation system'],
    commerceDecision: 'no-commerce-pending-exact-model-year-clutch-diagnosis',
  },
  [IDS.headGasket]: {
    reason: 'No exact Kia primary package establishes an endemic 1.6L/1.8L head-gasket defect across 1994-2001, the frozen thermal-expansion explanation is unsourced, its named video returns 404 and its parts/related-issue links are not Sephia-specific evidence.',
    description: 'The frozen page aggregates possible head-gasket symptoms across both listed engines and every indexed Sephia year, but the complete Kia Sephia manufacturer-communication and recall inventories contain no exact primary package establishing that population or the stated cast-iron/aluminum thermal-expansion mechanism as a recurring defect. The sole named video citation is unavailable through YouTube\'s oEmbed endpoint.',
    solution: 'If the engine overheats, loses coolant, contaminates oil or produces persistent white exhaust, stop driving before additional damage occurs. Diagnose the exact engine with cooling-system pressure testing, combustion-gas testing and, when appropriate, compression or leak-down testing. If cylinder-head removal is justified, measure the head and block and follow exact service information for gasket choice, fastener reuse and timing service. Do not automatically order a timing kit, oil or unspecified head bolts from this page.',
    symptoms: ['Reported coolant loss or overheating', 'Possible oil/coolant contamination', 'Possible persistent white exhaust after warm-up'], systems: ['engine cooling and cylinder-head sealing'],
    commerceDecision: 'no-commerce-pending-exact-engine-testing-and-teardown-findings',
  },
  [IDS.wheelBearing]: {
    reason: 'No exact Kia primary package supports premature rear-bearing wear, a 60,000-mile threshold, a uniform pressed-knuckle design or replace-both-sides advice, and the cited general tutorial returns 404.',
    description: 'The frozen page describes rear wheel-bearing noise across every 1994-2001 Sephia, but the complete Kia Sephia communication and recall inventories contain no exact primary package establishing premature failure, a 60,000-mile threshold or one replacement architecture for the full year span. The cited general tutorial is unavailable through YouTube\'s oEmbed endpoint.',
    solution: 'Diagnose a speed-related hum or growl before replacement by checking tires, brakes, wheel play and bearing roughness and by observing whether the sound changes with load. Confirm the exact model-year hub, bearing and retaining-hardware procedure before ordering parts or using a press. Replace only verified failed components and one-time-use hardware required by exact service information; do not assume both sides or a generic hub assembly are required.',
    symptoms: ['Reported speed-related hum or growl from the rear', 'Possible roughness or play found during inspection'], systems: ['rear wheel, hub, bearing, tire and brake interfaces'],
    commerceDecision: 'no-commerce-pending-exact-model-year-bearing-diagnosis-and-fitment',
  },
  [IDS.timingBelt]: {
    reason: 'No exact Kia primary package in the complete inventories verifies one 60,000-mile interval, universal interference-engine damage, tensioner prevalence or mandatory water-pump bundling across 1994-2001; the video is unavailable and P0016/P0017 are unsupported for this page.',
    description: 'The frozen page makes one timing-belt and tensioner claim across every 1994-2001 Sephia without identifying an engine. The complete Kia Sephia communication and recall inventories contain no exact primary package establishing a universal 60,000-mile interval, that every engine in the range has the same interference consequences, or that tensioner failure is common. The named video is unavailable through YouTube\'s oEmbed endpoint, and the page does not source P0016 or P0017 for this population.',
    solution: 'Identify the exact engine and consult its model-year maintenance and service information for the timing-belt interval, inspection criteria, timing marks, tensioner procedure and any related components. If the engine stops abruptly, will not start or develops timing-area noise, avoid repeated cranking or driving until mechanical timing and compression are checked. Do not infer valve damage, replace a water pump automatically or buy a generic timing kit from this page without exact fitment and service evidence.',
    symptoms: ['Reported timing-area noise', 'No-start or abrupt engine stop requiring mechanical-timing diagnosis'], systems: ['engine mechanical timing system'],
    commerceDecision: 'no-commerce-pending-exact-engine-maintenance-source-and-fitment',
  },
};

function actionFor() { return 'targeted_safety_cleanup_pending_source'; }
function reasonFor(id) { return CARDS[id].reason; }
function commerceDecisionFor(id) { return CARDS[id].commerceDecision; }
function proposalFor(row) {
  const card = CARDS[row.id]; const proposal = fullRecord(row);
  Object.assign(proposal, {
    description: card.description, solution: card.solution, severity: 'medium', confidence: 'low',
    symptoms: clone(card.symptoms), affectedSystems: clone(card.systems), dtcCodes: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: [], communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0,
    source: 'manual', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: `Targeted accuracy and safety cleanup: ${card.reason}`,
    relatedIssueIds: [],
  });
  proposal.severity = row.severity;
  return proposal;
}
function evidenceFor(row) {
  return [
    { kind: 'complete-official-inventory-no-exact-primary-package', manufacturerCommunicationCount: 32, recallRowCount: 16, campaignCount: 8, verifiedOn: '2026-08-08', observation: 'No exact Kia manufacturer communication or recall in the complete frozen Sephia inventories supports this page identity or its broad prevalence and remedy claims.' },
    { kind: 'publisher-citation-unavailable', url: row.citations?.[0]?.url || null, oembedStatus: 404, verifiedOn: '2026-08-08', observation: 'The frozen named YouTube citation is unavailable through YouTube oEmbed and cannot support the article.' },
  ];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Sephia');
  if (modelRows.length !== 4) throw new Error(`expected 4 Sephia rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(CLEANUP_IDS.slice().sort())) throw new Error('frozen Sephia ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const proposal = proposalFor(current);
    return { id: current.id, model: current.model, action: actionFor(current.id), reason: reasonFor(current.id), identityRule: 'Preserve every indexed Sephia ID, title, category, year set, trim set, engine set and publication state while removing unavailable citations, search commerce, unsupported codes and unsourced prescriptive advice.', commerceDecision: commerceDecisionFor(current.id), changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Sephia',
    completionStatement: 'All four frozen Sephia records receive targeted accuracy and safety cleanup. Their unavailable citations, search commerce, unsupported codes and unsourced replacement prescriptions are removed while every indexed identity remains published and unchanged.',
    applicationGate: { status: 'blocked', blockerRecordIds: CLEANUP_IDS.slice().sort(), reason: 'No exact primary package supports any of the four broad Sephia identities. Independent review is required before any application.' },
    safetyContract: [
      'No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, new issue or public-page change is authorized.',
      'All four Sephia IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'Unavailable citations, unsupported DTCs, generic search commerce and unverified replacement instructions cannot hide in a blocker; targeted cleanup removes them while preserving each page.',
      'All 32 manufacturer communications and all 16 recall rows/eight campaigns in the complete frozen Sephia inventories are accounted for; separate recall identities remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 4 },
    observations: [
      { code: 'sephia-four-false-video-citations-removed', severity: 'critical', recordIds: CLEANUP_IDS.slice().sort(), detail: 'All four named YouTube citations return 404 through the publisher oEmbed endpoint.' },
      { code: 'sephia-search-commerce-removed', severity: 'critical', recordIds: CLEANUP_IDS.slice().sort(), detail: 'Every Amazon search URL and every unverified brand/part prescription is removed.' },
      { code: 'sephia-timing-codes-and-interval-removed', severity: 'critical', recordIds: [IDS.timingBelt], detail: 'P0016/P0017, a universal 60,000-mile interval, universal interference damage and mandatory water-pump bundling lack an exact source.' },
      { code: 'sephia-cross-model-relation-removed', severity: 'critical', recordIds: [IDS.headGasket], detail: 'The Chevrolet Metro relation is not Sephia evidence and is removed pending independent relation verification.' },
      { code: 'sephia-eight-new-recall-identities-deferred', severity: 'methodology', recordIds: [], campaignNumbers: Object.keys(EXPECTED_COMPLETE_RECALL_INVENTORY).sort(), detail: 'Every complete-inventory campaign is a separate identity and is proposal-deferred until the remaining-make audit is complete.' },
      { code: 'all-sephia-pages-preserved', severity: 'seo-safety', recordIds: CLEANUP_IDS.slice().sort(), detail: 'Every Sephia ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, expectedCampaigns: EXPECTED_CAMPAIGNS, youtubeCitationChecks: YOUTUBE_CITATION_CHECKS,
    manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE, flatRecallSource: FLAT_RECALL_SOURCE,
    expectedPre2010RecallInventory: EXPECTED_PRE_2010_RECALL_INVENTORY, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY,
    expectedCompleteRecallInventory: EXPECTED_COMPLETE_RECALL_INVENTORY, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { targeted_safety_cleanup_pending_source: 4, total: 4 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
if (require.main === module) main();
module.exports = { CAMPAIGN_SOURCES, CARDS, CLEANUP_IDS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_COMPLETE_RECALL_INVENTORY, EXPECTED_FLAT_RECALL_INVENTORY, EXPECTED_PRE_2010_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, SNAPSHOT, YOUTUBE_CITATION_CHECKS, actionFor, commerceDecisionFor, evidenceFor, proposalFor, reasonFor };
