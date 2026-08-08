/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-is-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const IDS = Object.freeze({
  alternator: 'lexus-is-alternator-failure-from-age-2001',
  carbon: 'lexus-is-carbon-buildup-turbo-2016',
  dashboard: 'lexus-is-dashboard-melt-2006',
  door: 'lexus-is-front-door-trim--2023',
  fuel: 'lexus-is-fuel-pump-recall-2018',
  display: 'lexus-is-lcd-climate-control-and-2001',
  adas: 'lexus-is-lexus-safety-system-false-2023',
  ballJoint: 'lexus-is-lower-ball-joint-wear-2001',
  brake: 'lexus-is-premature-front-brake-squeal-2023',
  transmission: 'lexus-is-transmission-harsh-shift-2014',
  valveCover: 'lexus-is-valve-cover-gasket-leaks-2001',
});
const MODEL_ALIASES = Object.freeze(['IS','IS 250','IS 250C','IS 300','IS 350','IS 350C','IS 500','IS F']);
const CAMPAIGNS = Object.freeze(['05V565000','06E026000','06V096000','06V121000','07V545000','09E012000','09V020000','09V388000','10V309000','10V499000','11V029000','13V030000','13V395000','14V647000','16V340000','17V006000','18V024000','18V432000','19V005000','19V741000','20V012000','20V682000','26V222000']);
const MAPPED_CAMPAIGNS = Object.freeze(['20V012000','20V682000']);
const DEFERRED_CAMPAIGNS = Object.freeze(CAMPAIGNS.filter((campaign) => !MAPPED_CAMPAIGNS.includes(campaign)));
const FALSE_CITATION_IDS = Object.freeze([IDS.carbon, IDS.dashboard, IDS.display, IDS.fuel, IDS.transmission, IDS.valveCover].sort());
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const PDF_SOURCES = Object.freeze({
  dashboardZld: { title: 'Warranty Enhancement Program ZLD — 2006–2008 IS 250/350', url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10132886-9999.pdf', localPath: 'C:/tmp/MC-10132886-9999.pdf', nhtsaDocumentId: '10132886', pages: 8, bytes: 133237, sha256: 'ba3139902f74361de8f014b144377c890ada2d95958fffea2f6c2f4a95675ee9' },
  dashboardZlz: { title: 'Customer Support Program ZLZ — IS F dashboard coverage', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152186-9999.pdf', localPath: 'C:/tmp/MC-10152186-9999.pdf', nhtsaDocumentId: '10152186', pages: 9, bytes: 979159, sha256: 'd16017d172fbd6b51b941ebbb717f3401e79a302bd1fd593eba4380711b8e35e' },
  fuelOriginal: { title: 'NHTSA Recall 20V-012 — Amended Defect Information Report', url: 'https://static.nhtsa.gov/odi/rcl/2020/RMISC-20V012-9970.pdf', localPath: 'C:/tmp/RMISC-20V012-9970.pdf', nhtsaDocumentId: '20V012', pages: 11, bytes: 224739, sha256: 'aa4583fdef27ed23d115e071430f48c3212080cb6257e37921ee481b8e7b88d4' },
  fuelExpansion: { title: 'Lexus Safety Recall 20LA01 — NHTSA 20V-012 & 20V-682', url: 'https://static.nhtsa.gov/odi/rcl/2020/RCMN-20V682-7883.pdf', localPath: 'C:/tmp/RCMN-20V682-7883.pdf', nhtsaDocumentId: '20V682', pages: 43, bytes: 1451114, sha256: '563e29dded32ae5b40925ab6f2ef510bd8bf8ed0671f917ea5c51bced57d1df9' },
  adasCalibration: { title: 'L-TT-0303-21 — Target Placement for LSS and BSM Calibration', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10202453-9999.pdf', localPath: 'C:/tmp/MC-10202453-9999.pdf', nhtsaDocumentId: '10202453', pages: 13, bytes: 1097433, sha256: '78311fda6cda42493298386e0618d96f112e8ea296346d79431a4a8e6582f65f' },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 27, '2005-2009': 37, '2010-2014': 45, '2015-2019': 1913, '2020-2024': 882, '2025-2026': 41 },
  totalRows: 2945,
  exactDashboardDocumentIds: ['10091863','10091983','10096735','10096769','10106567','10111457','10131834','10132525','10132886','10152186'],
  exactFuelDocumentIds: ['10235219','10235220'],
  exactAdasCalibrationDocumentIds: ['10149198','10149997','10173987','10202453','10204556'],
  exactBallJointDocumentIds: ['10000251'],
  exactEarlierRearBrakeDocumentIds: ['10028044','10042884'],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 21, post: 237 },
  totalRows: 258,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: MAPPED_CAMPAIGNS,
  deferredCampaigns: DEFERRED_CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function actionFor(id) { return FALSE_CITATION_IDS.includes(id) ? 'remove_false_citations_and_targeted_safety_cleanup_pending_source' : 'targeted_safety_cleanup_pending_source'; }
function commerceDecisionFor(id) {
  if (id === IDS.dashboard) return 'historical-dealer-program-vin-only-no-retail-part';
  if (id === IDS.fuel) return 'dealer-recall-vin-only-no-retail-part';
  return 'blocked-no-exact-fitment-no-retail-part';
}
function citationsFor(id) {
  if (id === IDS.dashboard) return [
    { type: 'program', title: PDF_SOURCES.dashboardZld.title, url: PDF_SOURCES.dashboardZld.url },
    { type: 'program', title: PDF_SOURCES.dashboardZlz.title, url: PDF_SOURCES.dashboardZlz.url },
    { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL },
  ];
  if (id === IDS.fuel) return [
    { type: 'recall', title: PDF_SOURCES.fuelOriginal.title, url: PDF_SOURCES.fuelOriginal.url },
    { type: 'recall', title: PDF_SOURCES.fuelExpansion.title, url: PDF_SOURCES.fuelExpansion.url },
    { type: 'nhtsa', title: 'NHTSA Recall datasets', url: RECALL_DATASET_URL },
  ];
  if (id === IDS.adas) return [
    { type: 'tech-tip', title: PDF_SOURCES.adasCalibration.title, url: PDF_SOURCES.adasCalibration.url },
    { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL },
  ];
  return [{ type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL }];
}

function contentFor(id) {
  const content = {
    [IDS.alternator]: {
      description: 'The complete federal communication inventory for the 2001-2005 IS 300 contains no exact record establishing a recurring alternator failure pattern, oil-contamination mechanism, common mileage range, or confusion with battery failure. The page currently provides no citation, measured field population, diagnostic threshold, or verified Denso application.',
      solution: 'Treat a battery warning lamp, low voltage or stalling as a charging-system diagnosis, not automatic proof of an alternator failure. A qualified technician should test battery condition, charging output, cable voltage drop and any fluid leak before replacing a component. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Removed the unsupported common-failure, oil-contamination and Denso-replacement claims; held the indexed identity for exact first-generation evidence.',
    },
    [IDS.carbon]: {
      description: 'The complete IS-family communication inventory contains no exact Lexus record establishing heavy intake-valve carbon as a recurring 2016-2022 8AR-FTS defect, a 40,000-80,000-mile onset, or a repeat service interval. The unlinked forum label does not validate walnut blasting, a 40,000-60,000-mile schedule, or a catch-can recommendation.',
      solution: 'Do not schedule walnut blasting or install a catch can from this page. Diagnose rough idle, hesitation or reduced power with codes, fuel trims, ignition checks and model-specific Lexus procedures before inspecting intake deposits or authorizing cleaning. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Removed the unsupported carbon-failure prevalence, mileage, repeat walnut-blasting interval and catch-can advice; held the identity for exact Lexus evidence.',
    },
    [IDS.dashboard]: {
      description: 'Lexus primary documents support cracked or sticky dashboards on certain 2006-2008 IS 250/350 vehicles under Warranty Enhancement Program ZLD and on certain 2008-2014 IS F vehicles under Customer Support Program ZLZ. They do not support the page’s ZE7 program name or blanket 2006-2013 coverage across every listed trim. Both historical programs were time-limited and do not establish present-day free replacement.',
      solution: 'Do not promise ZE7 coverage, a free dashboard, or goodwill assistance from this page. Have a Lexus dealer identify the VIN, production period and any historical ZLD/ZLZ record, then obtain a current paid-repair estimate if no open coverage remains. Avoid solvents or coatings that may further damage the surface. This is a VIN-specific dealer/service remedy; no universal retail part is asserted.',
      summary: 'Replaced the incorrect ZE7 citation with visually verified ZLD/ZLZ scope and expiration boundaries; preserved the page while removing a current free-replacement promise.',
    },
    [IDS.door]: {
      description: 'The complete IS-family communication inventory contains no exact 2023-2025 record establishing a recurring front-door speaker/garnish rattle, loosened clips or the claimed Lexus service guidance. No source identifies a production range, failed interface, updated insulator, retaining clip or repair procedure for this page’s scope.',
      solution: 'Have the noise reproduced and isolated before any panel is removed. Verify whether it follows road input or audio output, then inspect fasteners, harness contact and trim interfaces under the exact model-year repair procedure; do not add foam, felt or replacement clips from this page. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Removed the unsupported dealer-guidance, failure-mechanism and trim-removal prescription; held the 2023-2025 identity for an exact Lexus source.',
    },
    [IDS.fuel]: {
      description: 'Toyota’s amended 20V-012 report and Lexus 20LA01 notice document low-pressure fuel pumps whose impellers may deform after fuel absorption and stop operating, creating rough running, no-start or stall risk. The exact Lexus IS applicability shown in the primary records is 2017 IS 200t, 2018-2019 IS 300, and 2014-2015/2018-2019 IS 350, with 20V-682 expanding the population. The page’s 20V-863 number and universal 2018-2020 IS 300/350 scope are incorrect; only VIN-listed vehicles are included.',
      solution: 'Check the full VIN in the official Lexus/NHTSA recall lookup for campaign 20LA01 (NHTSA 20V-012 or 20V-682). An authorized Lexus dealer replaces the low-pressure fuel pump with the recall remedy at no charge when the VIN has an open campaign. Do not buy a pump from a model-year list alone. This is a VIN-specific dealer recall remedy; no universal retail part is asserted.',
      summary: 'Corrected 20V-863 to 20V-012/20V-682, bounded the model-year population to the visually verified reports, and replaced blanket eligibility with VIN-specific recall guidance.',
    },
    [IDS.display]: {
      description: 'The complete first-generation IS communication inventory contains no exact record establishing a common climate/audio LCD pixel failure, affected display assembly, nighttime-control impact or rebuilt-unit preference for 2001-2005. The current citation points only to a forum home page and does not resolve to the claimed evidence.',
      solution: 'Confirm whether the fault affects the display, backlighting, power supply or communication before removing the unit. Use the exact model-year wiring and service information to choose repair or replacement; a used or rebuilt unit must be verified for compatibility before installation. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Removed the forum-home-page citation and unsupported prevalence/rebuilt-unit claims; held the indexed identity for exact primary evidence.',
    },
    [IDS.adas]: {
      description: 'Lexus L-TT-0303-21 documents target placement for LSS/BSM calibration on IS 300 through 2022 and IS 350 through 2022. It is a calibration aid, not evidence of recurring false forward-collision warnings, dirty-sensor failures or calibration drift on 2023-2025 IS vehicles. The complete inventory contains no exact record for the page’s later model-year identity.',
      solution: 'Follow the owner warning message and current model-year repair information. Clean only externally accessible sensor/camera viewing areas as the owner manual permits, record codes and recent windshield/body/alignment work, and have required aiming performed with the specified targets and level-surface procedure. Do not replace a sensor from this page. This is a VIN-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Bounded the calibration source to IS through 2022 and removed the unsupported 2023-2025 failure identity and sensor-replacement inference.',
    },
    [IDS.ballJoint]: {
      description: 'NHTSA document 10000251 records a Lexus suspension ball-joint inspection method for 2001-2003 IS 300. It does not establish a recurring 2001-2005 lower-ball-joint wear/separation defect, a shared Toyota/Lexus weakness, owner symptom pattern, or population-wide loss-of-control risk. No exact source extends this identity through 2005.',
      solution: 'Any looseness, steering wander or clunk requires prompt inspection under the exact model-year Lexus procedure, including measured joint play and adjacent steering/suspension checks. Replace only components that fail the specified inspection and complete any required alignment; do not select parts from this page. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Bounded the sole primary record to a 2001-2003 inspection method and removed unsupported prevalence, separation and universal replacement claims.',
    },
    [IDS.brake]: {
      description: 'The complete IS-family inventory contains no exact 2023-2025 communication establishing recurring front brake squeal/groan, pad-material causation or revised front pads/shims. The only exact IS brake-noise campaign records concern rear-caliper slide pins on certain 2006-2007 IS 250/350 vehicles and cannot support this current-generation page.',
      solution: 'Have the brakes inspected for lining thickness, rotor condition, hardware, contamination and any safety fault before treating the noise as a refinement issue. Use only the exact model-year Lexus procedure and VIN-specific parts information; do not resurface rotors, change pad compounds or add lubricants from this page. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Separated the unrelated 2006-2007 rear-brake campaign and removed unsupported 2023-2025 pad, shim, resurfacing and lubrication prescriptions.',
    },
    [IDS.transmission]: {
      description: 'The complete IS-family communication inventory contains no exact third-generation record supporting a recurring 2014-2020 8-speed harsh-shift pattern, fuel-economy programming cause, valve-body replacement, or the claimed L-SB-0087-18 shift-quality bulletin. Generic ECU-flash instructions do not establish a model-specific transmission correction.',
      solution: 'Record temperature, speed, selected drive mode, shift event and diagnostic codes, then verify the installed transmission and current VIN-specific calibrations before authorizing service. Do not perform a 40,000-mile fluid schedule, reflash or replace a valve body from this page. This is a VIN-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Removed the unsupported bulletin, 8-speed failure pattern, programming cause, 40,000-mile fluid interval and valve-body prescription; held the identity for exact Lexus evidence.',
    },
    [IDS.valveCover]: {
      description: 'The complete 2001-2005 IS 300 communication inventory contains no exact record establishing a common 2JZ-GE valve-cover-gasket leak, spark-plug-well contamination pattern, misfire risk or bundled PCV/ignition service. The current citation points only to a forum home page and does not resolve to the claimed evidence.',
      solution: 'Clean and trace the oil source before removing components, then inspect the exact leak path and any ignition contamination under model-specific Lexus service information. Replace only confirmed leaking seals or damaged ignition components; do not bundle a PCV valve, plugs or coil boots from this page. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Removed the forum-home-page citation and unsupported common-failure, misfire and bundled-parts claims; held the indexed identity for exact primary evidence.',
    },
  }[id];
  if (!content) throw new Error(`Unexpected IS record ${id}`);
  return content;
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = row.id === IDS.fuel ? 'high' : row.id === IDS.dashboard ? 'medium' : 'low';
  proposal.symptoms = [];
  proposal.affectedSystems = [];
  proposal.dtcCodes = [];
  proposal.estimatedCostLow = null;
  proposal.estimatedCostHigh = null;
  proposal.typicalMileageLow = null;
  proposal.typicalMileageHigh = null;
  proposal.citations = citationsFor(row.id);
  proposal.communityRecommendations = [];
  proposal.fixParts = [];
  proposal.humanApproved = false;
  proposal.reportCount = 0;
  proposal.source = 'manual';
  proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE;
  proposal.contentUpdatedOn = REVIEW_DATE;
  proposal.contentUpdateSummary = content.summary;
  proposal.relatedIssueIds = [];
  return proposal;
}

function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact IS-family manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  return {
    [IDS.alternator]: [common, 'No exact first-generation record mentions alternator, charging-system failure or oil contamination.', 'No citation or verified fitment supports automatic Denso replacement.'],
    [IDS.carbon]: [common, 'No exact IS record establishes recurring intake-valve carbon, walnut blasting, a mileage interval or catch-can use.', 'The unlinked forum label is removed and no retail cleaning product is introduced.'],
    [IDS.dashboard]: [common, 'Visual review of ZLD limits IS 250/350 to 2006-2008 and shows primary coverage ended May 31, 2017 with secondary coverage limited to 10 years from first use.', 'Visual review of ZLZ covers 2008-2014 IS F and identifies its own time limits; neither program is ZE7.'],
    [IDS.door]: [common, 'No exact 2023-2025 record supports the claimed door-trim/speaker rattle or dealer guidance.', 'No clip, insulator, felt or foam application is verified for the frozen scope.'],
    [IDS.fuel]: [common, 'Visual review of 20V-012 lists 2017 IS 200t, 2018-2019 IS 300 and 2014-2015/2018-2019 IS 350, not a universal 2018-2020 IS population.', 'Visual review of the Lexus 20LA01 notice names NHTSA 20V-012 and 20V-682; 20V-863 is not this campaign.'],
    [IDS.display]: [common, 'No exact first-generation record mentions LCD/pixel failure, climate/radio display loss or a rebuilt-unit remedy.', 'The forum-home-page citation does not resolve to the claimed evidence.'],
    [IDS.adas]: [common, 'Visual review of L-TT-0303-21 shows calibration applicability through 2022, not a 2023-2025 false-warning identity.', 'No exact current-generation record establishes dirt, rain or calibration drift as the recurring defect claimed.'],
    [IDS.ballJoint]: [common, 'Document 10000251 is an inspection method for 2001-2003 IS 300, not proof of a recurring separation defect through 2005.', 'No exact record supports the shared-weakness, symptom-frequency or loss-of-control population claims.'],
    [IDS.brake]: [common, 'No exact 2023-2025 record supports front brake squeal/groan or revised front pads/shims.', 'Documents 10028044 and 10042884 concern rear-caliper slide pins on 2006-2007 IS 250/350 and are not promoted.'],
    [IDS.transmission]: [common, 'No exact third-generation record supports harsh 1-2/2-3 shifts, fuel-economy programming or the claimed L-SB-0087-18 correction.', 'Generic flash instructions cannot justify a fluid interval, reflash or valve-body replacement.'],
    [IDS.valveCover]: [common, 'No exact first-generation record mentions valve-cover-gasket leakage, spark-plug-well contamination or bundled PCV service.', 'The forum-home-page citation is removed and no gasket or ignition part is promoted.'],
  }[row.id];
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'IS').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return { id: row.id, action: actionFor(row.id), commerceDecision: commerceDecisionFor(row.id), evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'IS',
    completionStatement: 'All 11 frozen IS pages retain their indexed identities. Two are bounded to exact historical programs/recalls and nine receive corrective holds because exact primary evidence does not establish their current scope or prescription.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'The packet corrects two wrong program/campaign identities and removes unsupported repairs from nine source-deficient pages. Independent review is required before any body-copy write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'All 11 IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain unchanged.',
      'Historical program and recall scope is bounded to visually verified model years and VIN eligibility; no present-day coverage is promised without an open VIN result.',
      'No fluid interval, walnut-blasting schedule, sensor replacement, trim disassembly, transmission reflash, component bundle or retail part is approved without exact application support.',
      'All 2,945 exact manufacturer-communication rows and 258 exact recall rows / 23 campaigns were replayed; only 20V-012 and 20V-682 map to the existing fuel-pump page.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'is-dashboard-program-identity-corrected', severity: 'critical-correction', recordIds: [IDS.dashboard], detail: 'ZE7 is replaced with the visually verified ZLD/ZLZ scopes and their historical time limits.' },
      { code: 'is-fuel-recall-identity-corrected', severity: 'critical-correction', recordIds: [IDS.fuel], campaignNumbers: MAPPED_CAMPAIGNS, detail: '20V-863 is replaced with 20V-012/20V-682 and blanket 2020 eligibility is removed.' },
      { code: 'is-current-generation-source-gaps', severity: 'critical-correction', recordIds: [IDS.adas, IDS.brake, IDS.door].sort(), detail: 'No exact 2023-2025 source establishes the ADAS, front-brake or door-trim failure identities; an older calibration aid and rear-brake campaign are explicitly separated.' },
      { code: 'is-first-generation-source-gaps', severity: 'critical-correction', recordIds: [IDS.alternator, IDS.ballJoint, IDS.display, IDS.valveCover].sort(), detail: 'The sole ball-joint record is an inspection method through 2003; the other three identities have no exact federal support.' },
      { code: 'is-carbon-source-gap', severity: 'critical-correction', recordIds: [IDS.carbon], detail: 'No exact Lexus record supports the recurring carbon identity, walnut-blasting interval or catch-can recommendation.' },
      { code: 'is-transmission-bulletin-gap', severity: 'critical-correction', recordIds: [IDS.transmission], detail: 'The claimed L-SB-0087-18 shift bulletin and third-generation harsh-shift correction are absent from the complete exact inventory.' },
      { code: 'is-no-unverified-commerce', severity: 'commerce-safety', recordIds: rows.map((row) => row.id), detail: 'No guessed alternator, pump, gasket, brake, sensor, transmission, dashboard or trim part is introduced; every proposal has a service/review marker.' },
      { code: 'is-twenty-one-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Twenty-one separate recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-is-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every IS ID, title, category, indexed year set, trim set, engine set, allowed severity and publication state remains preserved.' },
    ],
    pdfSources: Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: MAPPED_CAMPAIGNS,
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { targeted_safety_cleanup_pending_source: 5, remove_false_citations_and_targeted_safety_cleanup_pending_source: 6, total: 11 },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, DEFERRED_CAMPAIGNS, FALSE_CITATION_IDS, IDS, MAPPED_CAMPAIGNS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, actionFor, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
