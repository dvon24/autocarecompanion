/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const path = require('node:path');
const {
  RECALL_FILES,
  SOURCE_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-ls400-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const COMPLAINTS_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#complaints';
const MODEL_ALIASES = Object.freeze(['LS']);
const IDS = Object.freeze({
  ballJoint: 'lexus-ls400-front-lower-ball-joint-wear-separation',
  ecu: 'lexus-ls400-engine-ecu-ecm-electrolytic-capacitor-leakage',
  oilLeak: 'lexus-ls400-oil-leaks-from-cam-crank-seals-valve-cover-gaskets-timing-co',
  powerSteering: 'lexus-ls400-variable-assist-power-steering-pump-hose-leaks',
  starter: 'lexus-ls400-starter-motor-failure-buried-under-intake-manifold',
  timing: 'lexus-ls400-timing-belt-water-pump-service-interference-risk-1998-2000-v',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const CAMPAIGNS = Object.freeze(['06E056000','06V096000','09E012000','09V020000','19V134000','24V124000','24V275000','25V595000','25V744000']);
const PDF_SOURCES = Object.freeze({
  oilLeakDiagnosis: {
    title: 'L-SB-0002-20 - Oil Leak Diagnosis and Repair',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10172820-9999.pdf',
    localPath: 'C:/tmp/MC-10172820-9999.pdf',
    nhtsaDocumentId: '10172820',
    pages: 5,
    bytes: 487830,
    sha256: '7a2c7aac8f45ff2666becb1c44b967ef9e1fbe0f71616e931a25241cee36f19d',
  },
});
const SECONDARY_SOURCES = Object.freeze({
  ballJointReport: {
    title: 'Lower ball joint failure - Lexus Owners Club',
    type: 'forum',
    url: 'https://www.lexusownersclub.co.uk/forum/topic/111443-lower-ball-joint-failure/',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'A 1990 LS400 owner reported that a lower ball joint sheared while driving; the report does not establish fleet prevalence or a Lexus inspection interval.',
  },
  ecuRepair: {
    title: '1990-2000 Toyota and Lexus ECU Repair Instructions - German Audio Tech',
    type: 'article',
    url: 'https://www.germanaudiotech.com/pages/1990-2000-toyota-and-lexus-ecu-repair-instructions',
    liveAccess: 'reachable-200',
    assertedBoundary: 'The page documents inspected leaking LS400 ECU capacitors, year/unit variation and delicate specialist work; it does not prove that every ECU is degraded or that one symptom identifies the ECU.',
  },
  oilLeakOverview: {
    title: 'Lexus LS400 Oil Leak Causes & Solutions - RepairPal',
    type: 'article',
    url: 'https://repairpal.com/symptom/lexus/ls400/leaking-oil',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'The page identifies several possible leak areas and supports source-localization, not a universal multi-gasket failure or bundled replacement.',
  },
  valveCoverReport: {
    title: '1998-2000 Valve Cover Gasket Replacement - Lexus Owners Club',
    type: 'forum',
    url: 'https://us.lexusownersclub.com/forums/topic/75831-1998-2000-valve-cover-gasket-replacement/',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'An owner reports long-term valve-cover seepage on a 1998-2000 LS400; the thread does not establish all-year prevalence or every claimed seal location.',
  },
  starterDiagnosis: {
    title: "Lexus LS400 doesn't start - single click, intermittent no start - CarSpec",
    type: 'article',
    url: 'https://carspecmn.com/lexus-ls400-doesnt-start-single-click-intermittent-no-start/',
    liveAccess: 'reachable-200',
    assertedBoundary: 'The specialist article confirms the single-click diagnostic boundary, starter location under the intake manifold, hidden fasteners and fragile intake runners; it does not supply a failure-mileage range or heater-valve prescription.',
  },
  timingServiceExample: {
    title: 'Lexus LS400 1UZ-FE Timing Belt Replacement - Lextreme',
    type: 'article',
    url: 'https://www.lextreme.com/lexus-ls400-timing-belt-change/',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'A 1996 LS400 owner documents one belt/water-pump/idler/tensioner service; the article does not establish a factory interval, an all-years parts bundle or the claimed interference distinction.',
  },
  steeringReport: {
    title: 'Gen 1 LS400 Owners - Power Steering Leak with Alternator Issues - Lexus Owners Club',
    type: 'forum',
    url: 'https://us.lexusownersclub.com/forums/topic/53953-gen-1-ls400-owners-power-steering-leak-walternator-issues/',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'Owner reports and a self-selected forum poll document power-steering leakage sometimes followed by alternator failure; they do not prove prevalence, worst years, leak point or automatic alternator replacement.',
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 6, '2010-2014': 7, '2015-2019': 58, '2020-2024': 108, '2025-2026': 46 },
  totalRows: 225,
  overlapping1990To2000Rows: 26,
  exactSourceDocumentIds: ['10172820'],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 16, post: 405 },
  totalRows: 421,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const COMPLAINT_INVENTORY = Object.freeze({
  source: COMPLAINTS_DATASET_URL,
  api: 'https://api.nhtsa.gov/complaints/complaintsByVehicle',
  make: 'LEXUS',
  model: 'LS400',
  years: Array.from({ length: 11 }, (_, index) => 1990 + index),
  yearCounts: { 1990: 24, 1991: 22, 1992: 8, 1993: 66, 1994: 68, 1995: 44, 1996: 23, 1997: 14, 1998: 46, 1999: 23, 2000: 12 },
  totalRows: 350,
  powerSteeringLeakReportIds: [10189177, 10253002, 10478319],
  caveat: 'NHTSA complaint records are owner allegations. They confirm that a condition was reported, but do not prove a defect, cause, prevalence or fitment.',
});

function citation(source) { return { type: source.type, title: source.title, url: source.url }; }
function citationsFor(id) {
  if (id === IDS.ecu) return [citation(SECONDARY_SOURCES.ecuRepair)];
  if (id === IDS.ballJoint) return [citation(SECONDARY_SOURCES.ballJointReport)];
  if (id === IDS.oilLeak) return [citation(PDF_SOURCES.oilLeakDiagnosis), citation(SECONDARY_SOURCES.oilLeakOverview), citation(SECONDARY_SOURCES.valveCoverReport)];
  if (id === IDS.starter) return [citation(SECONDARY_SOURCES.starterDiagnosis)];
  if (id === IDS.timing) return [citation(SECONDARY_SOURCES.timingServiceExample)];
  if (id === IDS.powerSteering) return [
    { type: 'nhtsa', title: 'NHTSA Vehicle Owner Complaint datasets', url: COMPLAINTS_DATASET_URL },
    citation(SECONDARY_SOURCES.steeringReport),
  ];
  throw new Error(`Unexpected LS400 record ${id}`);
}
function commerceDecisionFor(id) {
  if (id === IDS.ecu) return 'specialist-board-diagnosis-no-universal-retail-part';
  if (id === IDS.starter) return 'vin-specific-starter-and-gaskets-no-universal-retail-part';
  if (id === IDS.timing) return 'model-year-maintenance-procedure-no-universal-retail-kit';
  return 'vehicle-specific-diagnosis-no-universal-retail-part';
}
function contentFor(id) {
  const content = {
    [IDS.ecu]: {
      description: 'Direct specialist documentation shows LS400 engine-control units with leaking electrolytic capacitors, board corrosion and intermittent drivability or communication symptoms, with board components varying by year and even by unit. That evidence supports inspecting this age-related failure mode, but it does not establish that essentially every pre-1998 ECU is degraded or that one listed symptom makes the ECU the root cause.',
      solution: 'First verify power, grounds, charging voltage, ignition/fuel operation and available fault information. If those checks point toward the engine-control unit, have a qualified automotive-electronics specialist open the exact ECU and inspect it for capacitor leakage, corrosion and damaged traces before authorizing board repair. Do not apply generic capacitor counts or the page\'s do-it-yourself chemistry procedure. This is unit-specific specialist electronics repair; no universal retail part is asserted.',
      confidence: 'medium',
      summary: 'Retained the documented ECU-capacitor failure mode while removing universal prevalence, symptom-to-cause certainty, fixed capacitor counts, brand prescriptions and unsafe board-cleaning instructions.',
    },
    [IDS.ballJoint]: {
      description: 'A direct 1990 LS400 owner report documents a front lower ball joint shearing while the vehicle was moving, so the safety-relevant failure identity is retained. The report does not establish fleet prevalence, an all-years defect or the claimed Lexus 15,000-mile/12-month inspection schedule, and the complete federal communication inventory contains no exact LS400 lower-ball-joint defect bulletin.',
      solution: 'Treat a clunk, steering looseness, abnormal wheel movement or tire-wear concern as a prompt inspection rather than a parts diagnosis. A qualified technician should inspect both front sides under the exact model-year service procedure and replace only a joint or related component that fails inspection, using VIN-, year- and side-specific fitment and the specified torque/alignment procedure. The documented 1990 repair uses a separate joint, so do not assume that the joint is integral to a control arm. This is vehicle-specific suspension service; no universal retail part is asserted.',
      confidence: 'low',
      summary: 'Retained the direct sheared-joint report but removed unsupported prevalence, inspection-interval, paired-replacement, brand and integral-control-arm claims.',
    },
    [IDS.oilLeak]: {
      description: 'Lexus L-SB-0002-20 applies to the 2000 LS400 and distinguishes an active leak, where fluid pools and forms droplets, from normal seepage that should be documented and rechecked. Direct secondary sources also describe valve-cover seepage and several possible leak areas. They do not establish that every 1990-2000 LS400 shares the listed cam, crank, oil-pan and VVT-i leak points or that multiple sources usually fail together.',
      solution: 'Clean and inspect the engine, distinguish seepage from an active leak, and identify the exact source before disassembly. Repair only the verified gasket, seal, O-ring or sealing surface under the model-year repair procedure; do not automatically replace every front seal, bundle the repair with timing-belt service or infer a VVT-i cam-gear leak from this page. This is vehicle-specific leak diagnosis and service; no universal retail part is asserted.',
      confidence: 'medium',
      summary: 'Added the exact Lexus leak-versus-seep bulletin and retained direct owner evidence while removing the universal leak-point, multiple-source and bundled-seal prescriptions.',
    },
    [IDS.starter]: {
      description: 'A Lexus specialist article supports a precise diagnostic and access boundary: after battery, charging-system and engine-rotation checks, an intermittent single click can point to a failing starter, and the LS400 starter sits under the intake manifold with difficult hidden fasteners. The source also warns that the variable-length intake runners are fragile. It does not support the page\'s 100,000-200,000-mile failure range or a common heater-control-valve failure during the repair.',
      solution: 'Confirm the no-crank condition and rule out battery, cable, charging and engine-rotation faults before condemning the starter. If starter replacement is verified, follow the exact model-year service procedure and protect the intake runners during removal. Intake-manifold and throttle-body gaskets must be selected for the exact VIN/application; do not automatically replace the heater valve or every hose, and do not choose a starter by brand alone. This is VIN-specific starter service; no universal retail part is asserted.',
      confidence: 'medium',
      summary: 'Retained the verified single-click and under-manifold access guidance while removing the mileage range, heater-valve/hoses bundle and Denso brand prescription.',
    },
    [IDS.timing]: {
      description: 'The LS400 uses a timing belt, and a direct 1996 owner procedure documents one service that included the belt, water pump, idlers and tensioner. That single-car article does not establish the factory interval for every 1990-2000 model, prove that all those components must always be replaced together, or verify the page\'s non-interference versus interference distinction for 1990-1997 and 1998-2000 engines.',
      solution: 'Use the VIN/model-year Lexus maintenance supplement to determine when timing-belt service is due and the current Lexus repair procedure to determine the required parts and steps. A qualified technician should inspect related driven components and sealing surfaces and replace only what the exact procedure or condition requires. Do not infer a factory interval, engine-damage outcome, complete kit or brand from this page. This is model-year-specific scheduled service; no universal retail kit is asserted.',
      confidence: 'low',
      summary: 'Retained the timing-belt service identity but removed the unverified factory interval, interference classification, universal parts bundle and OEM/Aisin/Gates prescriptions.',
    },
    [IDS.powerSteering]: {
      description: 'Three NHTSA owner complaints for 1990, 1991 and 1994 LS400 vehicles and a direct owner discussion report power-steering leakage followed by alternator failure. These are owner allegations, not a defect finding, and they do not establish prevalence, the claimed worst 1991-1997 years, a universal pump-shaft/high-pressure-line cause or an all-years cascade.',
      solution: 'Locate the exact steering-fluid leak and repair the verified pump, seal, hose, line or connection under the model-year procedure. Inspect the alternator and charging system separately for contamination or failure rather than replacing it automatically. Confirm the specified fluid in the exact owner/service information, and do not choose an alternator or steering component by brand alone. This is vehicle-specific steering and charging-system diagnosis; no universal retail part is asserted.',
      confidence: 'medium',
      summary: 'Added three exact NHTSA owner-report IDs, retained the reported leak/alternator sequence and removed prevalence, worst-year, exact-leak-point, fluid and Denso replacement claims.',
    },
  }[id];
  if (!content) throw new Error(`Unexpected LS400 record ${id}`);
  return content;
}
function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = content.confidence;
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
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact LS communication rows, including ${BULLETIN_INVENTORY.overlapping1990To2000Rows} with an indexed year from 1990-2000, plus ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  return {
    [IDS.ecu]: [common, 'The direct specialist page documents leaking LS400 ECU capacitors and explicitly says component counts vary by year and even by unit.', 'No primary LS400 record or secondary evidence proves that essentially every pre-1998 ECU is degraded or that any single intermittent symptom identifies the ECU.', 'The hazardous first-time soldering and improvised chemistry instructions are not carried into the proposal.'],
    [IDS.ballJoint]: [common, 'The direct owner report identifies a 1990 LS400 lower ball joint that sheared during driving.', 'No exact manufacturer communication or recall establishes an LS400 defect population or the claimed 15,000-mile/12-month Lexus schedule.', 'The same owner discussion describes a separately replaceable joint, contradicting the page\'s control-arm-integral generalization.'],
    [IDS.oilLeak]: [common, 'Visual review of L-SB-0002-20 confirms 2000 LS400 applicability and distinguishes active leakage from normal seepage.', 'Direct secondary pages support valve-cover seepage and multiple possible diagnostic locations, not a universal all-years/multiple-source pattern.', 'No source supports automatically bundling every front seal with timing-belt service.'],
    [IDS.starter]: [common, 'The direct specialist article supports the single-click diagnostic boundary and the starter\'s location under the intake manifold.', 'The same source supports hidden-fastener and fragile-runner precautions plus application-specific replacement gaskets.', 'It does not support the 100,000-200,000-mile range, heater-valve replacement, every-hose replacement or a Denso-only remedy.'],
    [IDS.timing]: [common, 'The direct 1996 owner procedure confirms an LS400 timing-belt service example with a water pump, idlers and tensioner.', 'The source does not establish the page\'s factory 90,000-mile/7-year claim or the non-interference/interference split.', 'A one-car repair diary cannot authorize a universal kit, seal bundle or OEM/Aisin/Gates prescription.'],
    [IDS.powerSteering]: [common, `NHTSA ODI reports ${COMPLAINT_INVENTORY.powerSteeringLeakReportIds.join(', ')} allege LS400 power-steering leakage followed by alternator failure; they are reports, not defect findings.`, 'The direct forum thread independently reports the same sequence but is self-selected and cannot establish prevalence or worst years.', 'No exact source supports automatic alternator replacement, Denso-only fitment or a fluid specification across all indexed years.'],
  }[row.id];
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))]));
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'LS400').sort((left, right) => left.id.localeCompare(right.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      commerceDecision: commerceDecisionFor(row.id),
      evidence: evidenceFor(row),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-and-direct-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'LS400',
    completionStatement: 'All six frozen LS400 pages retain their indexed identities. Direct reports and specialist documentation preserve legitimate older-car failure modes while unsupported prevalence, interval, causal certainty, bundled-parts and brand claims are removed.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'These older-vehicle pages rely partly on direct owner/specialist evidence and include six safety or service rewrites. Independent review is required before any body-copy write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'All six LS400 IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain unchanged.',
      'Absence of an OEM bulletin is not treated as evidence that an older-car owner-reported condition is false.',
      'NHTSA owner complaints are labeled allegations and are not used as defect, cause, prevalence or fitment proof.',
      'No capacitor kit, ball joint, gasket/seal bundle, starter, timing kit, steering component or alternator is approved without exact vehicle/unit diagnosis and fitment.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'ls400-direct-evidence-retains-identities', severity: 'accuracy-safety', recordIds: BLOCKER_IDS, detail: 'Each identity has a direct owner, specialist or official source boundary; none is deleted solely because the federal bulletin inventory lacks a matching defect record.' },
      { code: 'ls400-universal-claims-removed', severity: 'critical-correction', recordIds: BLOCKER_IDS, detail: 'Universal prevalence, fixed failure mileage, unverified inspection/service intervals and unsupported cause certainty are removed.' },
      { code: 'ls400-parts-prescriptions-bounded', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'Every named repair is diagnosis-, VIN-, model-year- or unit-specific; the proposal contains no guessed retail link or search URL.' },
      { code: 'ls400-nhtsa-complaints-bounded', severity: 'source-safety', recordIds: [IDS.powerSteering], complaintIds: COMPLAINT_INVENTORY.powerSteeringLeakReportIds, detail: 'Three exact ODI records support only that owners reported the leak/alternator sequence; no defect or prevalence inference is made.' },
      { code: 'all-ls400-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'All six IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain preserved.' },
    ],
    pdfSources: publicPdfSources(),
    secondarySourceReview: SECONDARY_SOURCES,
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    complaintInventory: COMPLAINT_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  COMPLAINT_INVENTORY,
  IDS,
  MODEL_ALIASES,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SECONDARY_SOURCES,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  evidenceFor,
  proposalFor,
  publicPdfSources,
};
