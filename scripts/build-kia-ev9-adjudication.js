/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-ev9-adjudication-2026-08-08.json');

const REWRITE_IDS = {
  iccu: 'kia-ev9-iccu-failure-2024',
  cluster: 'kia-ev9-instrument-panel-blank-2024',
  wipers: 'kia-ev9-wiper-failure-snow-2024',
};
const HOLD_IDS = {
  software: 'kia-ev9-software-update-issues-2024',
};

const CAMPAIGNS = {
  cluster: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V757000',
  wrongIccu: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V200000',
};
const EXPECTED_CAMPAIGNS = {
  cluster: {
    modelYears: ['EV9|2024', 'EV9|2025'],
    component: 'ELECTRICAL SYSTEM: INSTRUMENT CLUSTER/PANEL',
  },
  wrongIccu: {
    modelYears: ['EV6|2022', 'EV6|2023', 'EV6|2024'],
    component: 'ELECTRICAL SYSTEM:12V/24V/48V BATTERY',
  },
};
const PDF_SOURCES = {
  iccuOta: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253815-0001.pdf',
    sha256: 'b27f41799cc558e8f10ffa6f597e063d7fc03991831a56985098181b78ac50df',
    visuallyInspectedPages: [1],
    markers: ['SA568', '2024MY EV9', 'July 27, 2023 through March 21, 2024', 'ICCU Logic Improvement', 'auxiliary battery charging'],
  },
  iccuService: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001603-0001.pdf',
    sha256: 'a8422b726bd79eb66c3eff674172c6c00ffc73dd2dc54e409d815d4e34a658ff',
    visuallyInspectedPages: [1, 2, 5],
    markers: ['SA570', '2024MY EV9', 'P1E011C', 'P1E0211', 'P1E1300', 'P1E0C73', 'ICCU fuse does NOT require replacement'],
  },
  cluster: {
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V757-9102.PDF',
    sha256: 'a50095c93248e8da748843580cd2f9f069d7ebff7a669c17933f38a72e7da9fc',
    visuallyInspectedPages: [1, 2, 3],
    markers: ['24V-757', '2024-2024 Kia EV9', 'intermittently blank at vehicle start up', '940C3-DO010', 'Over-the-Air (OTA) update'],
  },
  wipers: {
    url: 'https://static.nhtsa.gov/odi/inv/2025/INOA-PE25004-11072.pdf',
    sha256: 'd7a685d3d89f314c03acba4477497b0145b2b36591be19461c83c78d3349006f',
    visuallyInspectedPages: [1, 2],
    markers: ['PE25004', '2024-2025 Kia EV9', 'Inoperative windshield wipers', 'snow and/or ice accumulation', '5 Vehicle Owner Questionnaires'],
  },
};

const FLAT_RECALL_SOURCE = {
  url: 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip',
  retrievedOn: '2026-08-07',
  archiveSha256: '59f15be5de0bde8768606fb03b1135e7fca5bc2c56041c7cfdac9b0d137e6a0f',
  extractedFile: 'FLAT_RCL_POST_2010.txt',
  extractedSha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70',
};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  2024: ['24V271000', '24V338000', '24V400000', '24V693000', '24V757000', '24V962000', '26V431000'],
  2025: ['24V757000', '24V962000', '25V115000'],
  2026: ['26V046000'],
};
const EXPECTED_FLAT_RECALL_DETAILS = [
  { year: 2024, campaign: '24V271000', manufacturerCampaign: 'SC308', components: ['POWER TRAIN:DRIVELINE:DIFFERENTIAL UNIT'] },
  { year: 2024, campaign: '24V338000', manufacturerCampaign: 'SC312', components: ['SEAT BELTS:FRONT:RETRACTOR'] },
  { year: 2024, campaign: '24V400000', manufacturerCampaign: 'SC317', components: ['STRUCTURE:INTERIOR PANELS:CEILING'] },
  { year: 2024, campaign: '24V693000', manufacturerCampaign: 'SC324', components: ['PARKING BRAKE:ELECTRICAL:CONTROL MODULE:SOFTWARE'] },
  { year: 2024, campaign: '24V757000', manufacturerCampaign: 'SC326', components: ['ELECTRICAL SYSTEM: INSTRUMENT CLUSTER/PANEL', 'ELECTRICAL SYSTEM:SOFTWARE'] },
  { year: 2024, campaign: '24V962000', manufacturerCampaign: 'SC329', components: ['SEATS:CRITICAL FASTENERS'] },
  { year: 2024, campaign: '26V431000', manufacturerCampaign: 'SC375', components: ['ELECTRICAL SYSTEM:PROPULSION SYSTEM:TRACTION BATTERY'] },
  { year: 2025, campaign: '24V757000', manufacturerCampaign: 'SC326', components: ['ELECTRICAL SYSTEM: INSTRUMENT CLUSTER/PANEL', 'ELECTRICAL SYSTEM:SOFTWARE'] },
  { year: 2025, campaign: '24V962000', manufacturerCampaign: 'SC329', components: ['SEATS:CRITICAL FASTENERS'] },
  { year: 2025, campaign: '25V115000', manufacturerCampaign: 'SC337', components: ['ELECTRICAL SYSTEM:PROPULSION SYSTEM', 'POWER TRAIN:DRIVELINE:DRIVESHAFT'] },
  { year: 2026, campaign: '26V046000', manufacturerCampaign: 'SC361', components: ['ELECTRICAL SYSTEM: INSTRUMENT CLUSTER/PANEL'] },
];

const REWRITE_CARDS = {
  [REWRITE_IDS.iccu]: {
    description: 'Kia Service Action SA568 applies to certain 2024 EV9 vehicles and updates Integrated Charging Control Unit (ICCU) logic to counter auxiliary-battery charging interruptions and unintended warning lights. SA570 covers a narrower 2024 population where sensed ICCU temperature can differ from actual temperature during high-current Level 1 or Level 2 charging, especially in cold weather. The ICCU can be damaged, stop an AC charging session and prevent Level 1 or Level 2 charging; Kia states that DC fast charging and drivability remain available.',
    solution: 'Have a Kia dealer check the VIN for SA568 and SA570. SA568 provides an over-the-air ICCU software update for eligible Kia Connect vehicles. Under SA570, Kia checks DTCs P1E011C, P1E0211, P1E1300 and P1E0C73: without those codes the dealer updates VCU and electric-water-pump logic; with a listed code the dealer replaces the ICCU and applies the update. Kia says the ICCU fuse does not require replacement. These are Kia service actions, not a safety recall. This is a dealer or warranty remedy; no retail part should be bought from this page.',
    commerceDecision: 'dealer-only-no-retail-part-service-action',
    severity: 'high', confidence: 'high',
    symptoms: ['Level 1 or Level 2 charging session stops', 'Level 1 or Level 2 charging becomes unavailable', 'Auxiliary-battery charging interruption or unintended warning light'],
    affectedSystems: ['integrated charging control unit', 'VCU and electric-water-pump control logic'],
    citations: [{ type: 'tsb', title: 'Kia Service Action SA568 - EV9 ICCU Logic Improvement OTA', url: PDF_SOURCES.iccuOta.url }, { type: 'tsb', title: 'Kia Service Action SA570 - EV9 ICCU Software or Replacement Procedure', url: PDF_SOURCES.iccuService.url }],
    summary: 'Corrected the same 2024 EV9 ICCU identity using Kia SA568 and SA570, removed the false EV6-only recall citation and unsupported retail products, and bounded the outcome and dealer remedy to the service actions.',
  },
  [REWRITE_IDS.cluster]: {
    description: 'NHTSA campaign 24V757000 (Kia SC326) covers certain 2024 EV9 vehicles. A software-logic communication error within the instrument cluster can make the screen intermittently blank at vehicle startup, preventing the driver from seeing the speedometer, odometer, turn-signal indicator and other required telltales. The underlying functions continue to operate, but missing critical information increases crash risk.',
    solution: 'Check the VIN for campaign 24V757000. Kia provides improved instrument-cluster software free of charge through an over-the-air update or a Kia dealer. No retail part is involved in the official remedy. The affected population is VIN-specific; the same campaign also includes one 2025 EV9 in a U.S. territory beyond this page’s retained 2024 indexed scope.',
    commerceDecision: 'dealer-only-no-retail-part-software-remedy',
    severity: 'high', confidence: 'high',
    symptoms: ['Instrument cluster screen intermittently blank at startup', 'Speedometer, odometer or warning indicators not visible'],
    affectedSystems: ['instrument-cluster software', 'cluster unit assembly'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 24V757000 - EV9 Instrument Cluster Screen May Fail', url: CAMPAIGNS.cluster }, { type: 'recall', title: 'Part 573 Safety Recall Report 24V757', url: PDF_SOURCES.cluster.url }],
    summary: 'Rewrote the same 24V757 instrument-cluster identity from the visually inspected Part 573 report and removed owner-report recurrence, hardware-replacement and scanner-commerce claims.',
  },
  [REWRITE_IDS.wipers]: {
    description: 'On April 29, 2025, NHTSA opened Preliminary Evaluation PE25004 after receiving five owner questionnaires alleging that windshield wipers stopped while 2024-2025 EV9 vehicles were being driven with snow or ice accumulated on or near the bottom of the windshield. At opening, NHTSA reported no crashes, injuries or fatalities and had not determined a root cause or defect remedy.',
    solution: 'PE25004 is an investigation, not a recall, and it identifies no official remedy or retail part. If the wipers stop or visibility becomes unsafe, pull over safely and do not continue until visibility is restored. Clear snow and ice only when safely stopped, document the event, contact Kia for inspection and check NHTSA for any later campaign or investigation update.',
    commerceDecision: 'no-official-remedy-or-part-investigation-open',
    severity: 'high', confidence: 'high',
    symptoms: ['Windshield wipers stop during snow or ice accumulation', 'Reduced visibility in winter weather'],
    affectedSystems: ['windshield-wiper system'],
    citations: [{ type: 'investigation', title: 'NHTSA Preliminary Evaluation PE25004 - EV9 Windshield Wiper Failure', url: PDF_SOURCES.wipers.url }],
    summary: 'Bounded the same snow/ice wiper-failure identity to NHTSA PE25004, clearly labeled it as an open investigation rather than a recall and removed the unsupported motor-cause, software-remedy and commerce claims.',
  },
};

const HOLD_REASONS = {
  [HOLD_IDS.software]: 'The frozen 2024-2026 software aggregation combines infotainment freezes, display desynchronization, OTA failures, charging interruptions and range estimates under one identity, has an empty solution, and cites obvious placeholder URLs containing "xyz123" and "abcdef12345". No exact primary package establishes that broad identity, so the row remains byte-for-byte unchanged.',
};

function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: current.make, model: current.model, years: current.years, category: current.category, title: current.title, trims: [], engines: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08', contentUpdateSummary: card.summary, relatedIssueIds: current.relatedIssueIds });
}
function evidenceFor(row) {
  if (row.id === REWRITE_IDS.iccu) return [{ kind: 'official-service-actions-exact-same-identity', urls: [PDF_SOURCES.iccuOta.url, PDF_SOURCES.iccuService.url, CAMPAIGNS.wrongIccu], sha256: [PDF_SOURCES.iccuOta.sha256, PDF_SOURCES.iccuService.sha256], visuallyInspectedPages: { SA568: PDF_SOURCES.iccuOta.visuallyInspectedPages, SA570: PDF_SOURCES.iccuService.visuallyInspectedPages }, verifiedOn: '2026-08-08', observation: 'Rendered Kia SA568 and SA570 establish the 2024 EV9 ICCU logic, stopped-AC-charging symptoms and dealer remedy. The live 24V200 campaign establishes that the frozen recall citation was EV6-only and had to be removed.' }];
  if (row.id === REWRITE_IDS.cluster) return [{ kind: 'official-recall-exact-same-identity', urls: [CAMPAIGNS.cluster, PDF_SOURCES.cluster.url], sha256: PDF_SOURCES.cluster.sha256, visuallyInspectedPages: PDF_SOURCES.cluster.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'Campaign 24V757 and rendered Part 573 pages establish the 2024 EV9 startup blank-cluster identity, cause, VIN-bound scope and OTA/dealer software remedy.' }];
  if (row.id === REWRITE_IDS.wipers) return [{ kind: 'official-investigation-exact-same-identity', url: PDF_SOURCES.wipers.url, sha256: PDF_SOURCES.wipers.sha256, visuallyInspectedPages: PDF_SOURCES.wipers.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'Rendered PE25004 pages establish five allegations covering 2024-2025 EV9 wiper stoppage during snow/ice, with no crash, injury, cause or remedy determination at opening.' }];
  return [{ kind: 'placeholder-citations-and-heterogeneous-identity', urls: (row.citations || []).map((item) => item.url), verifiedOn: '2026-08-08', observation: 'The frozen page cites placeholder Reddit and YouTube identifiers and combines several unrelated software outcomes across 2024-2026.' }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'EV9');
  if (modelRows.length !== 4) throw new Error(`expected 4 EV9 rows, found ${modelRows.length}`);
  for (const id of Object.values({ ...REWRITE_IDS, ...HOLD_IDS })) if (!modelRows.some((row) => row.id === id)) throw new Error(`missing frozen EV9 ID ${id}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const card = REWRITE_CARDS[current.id]; const proposal = card ? rewriteProposal(current, card) : before;
    return { id: current.id, model: current.model, action: card ? 'rewrite_same_identity' : 'keep_published_pending_source', reason: card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years, status or related links.' : HOLD_REASONS[current.id], identityRule: 'No source may change an indexed page identity. A different model, component, year boundary or failure outcome requires a byte-for-byte hold.', commerceDecision: card ? card.commerceDecision : 'unchanged-commerce-pending-exact-source-and-fitment', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-08', make: 'Kia', model: 'EV9',
    completionStatement: 'All four frozen Kia EV9 records are adjudicated. Three exact official-source identities receive no-commerce rewrites, including correction of the false EV6-only citation on the ICCU page. The placeholder-citation software aggregation is a critical byte-for-byte hold that blocks applying this packet until independent manual resolution.',
    applicationGate: { status: 'blocked', blockerRecordIds: [HOLD_IDS.software], reason: 'The frozen software aggregation contains fabricated placeholder citation URLs and heterogeneous unsupported claims. The safe corrective content requires independent manual review before any EV9 proposal is applied.' },
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All four EV9 IDs, titles, categories, indexed years and publication states remain unchanged.', 'Only exact same-identity official sources may authorize a rewrite; all other records remain byte-for-byte frozen.', 'Every rewrite removes search commerce, costs, unverified DTCs, trims and engines.', 'A rewrite that names a retail-replaceable part requires a verified direct product link with exact part-number and fitment evidence; dealer/software remedies and unresolved investigations must carry an explicit no-retail-part disposition.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 4 },
    observations: [
      { code: 'ev9-iccu-false-recall-citation-corrected', severity: 'critical-correction', recordIds: [REWRITE_IDS.iccu], detail: 'The frozen page falsely names EV6-only recall 24V200 as an EV9 campaign. The proposal removes it and uses rendered Kia SA568 and SA570, which establish the same 2024 EV9 ICCU identity and dealer remedy.' },
      { code: 'ev9-placeholder-software-citations-held', severity: 'critical', recordIds: [HOLD_IDS.software], detail: 'The page’s Reddit and YouTube URLs use placeholder identifiers and cannot support its broad 2024-2026 software aggregation.' },
      { code: 'ev9-wiper-investigation-not-recall', severity: 'safety-boundary', recordIds: [REWRITE_IDS.wipers], detail: 'PE25004 is an open preliminary evaluation based on five allegations; it does not establish a root cause, recall or repair.' },
      { code: 'ev9-eight-new-recall-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: ['24V271000', '24V338000', '24V400000', '24V693000', '24V962000', '25V115000', '26V046000', '26V431000'], detail: 'The complete official EV9 inventory exposes eight distinct recall identities absent from the frozen four-row catalog. They are recorded for the later additions phase and are not merged into existing pages.' },
      { code: 'ev9-model-api-504-flat-dataset-used', severity: 'source-recovery', recordIds: [], detail: 'NHTSA recallsByVehicle repeatedly returned 504 for EV9. The official post-2010 flat recall dataset was downloaded, hash-bound and parsed instead, yielding a complete 2024-2026 inventory.' },
      { code: 'ev9-three-exact-identities-rewritten', severity: 'content-correction', recordIds: Object.values(REWRITE_IDS).sort(), detail: 'Kia SA568/SA570, campaign 24V757 and investigation PE25004 exactly match their indexed identities and receive official-source, commerce-free proposals.' },
      { code: 'all-ev9-pages-preserved', severity: 'seo-safety', recordIds: modelRows.map((row) => row.id).sort(), detail: 'Every frozen EV9 ID, title, category, indexed year set and publication state remains preserved; no redirect, archive or deletion is proposed.' },
    ],
    pdfSources: PDF_SOURCES,
    campaigns: { urls: CAMPAIGNS, expected: EXPECTED_CAMPAIGNS },
    flatRecallDataset: { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY, expectedDetails: EXPECTED_FLAT_RECALL_DETAILS },
    summary: { rewrite_same_identity: 3, keep_published_pending_source: 1, total: 4 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_FLAT_RECALL_DETAILS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, HOLD_IDS, HOLD_REASONS, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, evidenceFor, rewriteProposal };
