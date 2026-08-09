/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES,
  RECALL_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-626-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

const IDS = Object.freeze({
  transmissionEarly: 'mazda-626-cd4e-4-speed-automatic-transmission-premature-failure',
  distributor: 'mazda-626-distributor-failure-1993',
  egr: 'mazda-626-egr-clog',
  headGasket: 'mazda-626-head-gasket-failure-chronic-overheating',
  ignitionSwitch: 'mazda-626-ignition-switch-overheating-fire-hazard',
  v6DistributorSeal: 'mazda-626-kl-v6-distributor-internal-oil-seal-leak-cap-rotor-fouling',
  roughIdle: 'mazda-626-rough-idle-stalling-from-idle-air-control-valve-intake-manif',
  timingTensioner: 'mazda-626-timing-belt-auto-tensioner-spring-failure',
  transmissionLate: 'mazda-626-transmission-failure-1998',
});

const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '46694', '52466', '54216', '603119', '603902', '603989', '605847', '614906', '10009908', '10206002',
]);
const CAMPAIGNS = Object.freeze([
  '00V074000', '00V134000', '05E065000', '09E012000', '15V674000', '83V052000', '85V108000',
  '86V042000', '87V149000', '87V186000', '87V196000', '88V022000', '88V063000', '90V118000',
  '93E035000', '93V174000', '95E006001', '97V228000', '98V206001', '98V243000', '98V249000',
  '99I005000', '99V358000',
]);

const PDF_SOURCES = Object.freeze({
  ignitionRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 15V674',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2015/RCLRPT-15V674-8073.PDF',
    localPath: 'C:/tmp/mazda-626-15v674.pdf',
    pages: 5,
    visualPages: [1, 2, 3, 4, 5],
    bytes: 33302,
    sha256: '97262380a4896d56334c6f2603f518f2145566254a75377f5e337648cd91133f',
  },
  transmissionCooler: {
    title: 'Mazda TSB 05-002/21 — Automatic Transmission/Transaxle Cooler and Lines Flushing Procedure',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10206002-0001.pdf',
    localPath: 'C:/tmp/mazda-626-trans-cooler.pdf',
    pages: 15,
    visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    bytes: 1179554,
    sha256: 'dbf6fdb868889494fcd5b094df989ddd77fbe08340a920506d9eb11b447282ad',
  },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints1990: { title: 'NHTSA 1990 Mazda 626 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=626&modelYear=1990' },
  complaints1993: { title: 'NHTSA 1993 Mazda 626 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=626&modelYear=1993' },
  complaints1997: { title: 'NHTSA 1997 Mazda 626 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=626&modelYear=1997' },
  complaints1998: { title: 'NHTSA 1998 Mazda 626 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=626&modelYear=1998' },
  complaints2000: { title: 'NHTSA 2000 Mazda 626 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=626&modelYear=2000' },
  complaints2002: { title: 'NHTSA 2002 Mazda 626 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=626&modelYear=2002' },
  recalls1997: { title: 'NHTSA Current 1997 Mazda 626 Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=MAZDA&model=626&modelYear=1997' },
  recalls1998: { title: 'NHTSA Current 1998 Mazda 626 Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=MAZDA&model=626&modelYear=1998' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  model: '626',
  periodCounts: { '1995-1999': 72, '2000-2004': 30, '2005-2009': 4, '2010-2014': 1, '2015-2019': 41, '2020-2024': 38, '2025-2026': 4 },
  totalRows: 190,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  model: '626',
  periodCounts: { pre: 48, post: 6 },
  totalRows: 54,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) {
  return { url: source.url, type: source.type, title: source.title };
}

function citationsFor(id) {
  const map = {
    [IDS.transmissionEarly]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1993, OTHER_SOURCES.complaints1997, PDF_SOURCES.transmissionCooler],
    [IDS.distributor]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1993],
    [IDS.egr]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1993, OTHER_SOURCES.complaints1997],
    [IDS.headGasket]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1990],
    [IDS.ignitionSwitch]: [PDF_SOURCES.ignitionRecall, OTHER_SOURCES.recalls1998],
    [IDS.v6DistributorSeal]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1993],
    [IDS.roughIdle]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1997, OTHER_SOURCES.complaints1998],
    [IDS.timingTensioner]: [OTHER_SOURCES.recalls1998],
    [IDS.transmissionLate]: [PDF_SOURCES.transmissionCooler, OTHER_SOURCES.complaints1998, OTHER_SOURCES.complaints2000, OTHER_SOURCES.complaints2002],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda 626 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.transmissionEarly]: {
      confidence: 'medium',
      description: 'NHTSA complaint files contain Mazda 626 reports describing slipping, harsh shifts, flashing overdrive indicators and loss of drive. Mazda manufacturer-communication records also identify P0741 torque-converter-clutch diagnosis and intermittent 4-3 or overdrive shifting on 1996-1997 626 vehicles. Those records support the symptom pattern, but they do not prove a universal CD4E failure rate, a fixed mileage window, the same transmission behind every listed engine, or the previously stated clutch, valve-body and radiator design causes. Mazda TSB 05-002/21 applies only to the 1997 portion of this page and addresses cooler cleanup after a transmission has already failed.',
      solution: 'If the overdrive light flashes, the transmission slips, shifts harshly or loses drive, limit driving and have a qualified transmission technician record codes, fluid condition and level, line pressure, commanded gear and cooler flow before choosing a repair. Verify the installed transmission by VIN and tag. For a 1997 vehicle receiving an overhaul or replacement unit, Mazda TSB 05-002/21 requires a technician to inspect and power-flush the cooler and lines so debris from the prior failure does not damage the replacement. Do not buy an auxiliary cooler, solenoid, valve body or rebuilt transmission from this page; the installed unit and failure mode must be confirmed first.',
      symptoms: ['overdrive indicator flashes', 'automatic transmission slips or shifts harshly', 'vehicle loses a forward gear or will not move'],
      summary: 'Preserved the indexed CD4E identity while removing unsupported failure-rate, mileage, architecture and preventive-cooler claims; separated symptom evidence from replacement cooler service.',
    },
    [IDS.distributor]: {
      confidence: 'low',
      description: 'Mazda manufacturer-communication record 54216 concerns the establishment of distributor components for 1993-1994 626 vehicles, and NHTSA complaints include individual no-start and distributor reports. The available primary records do not establish the published 80,000-120,000-mile pattern, heat as the common cause, or an internal coil or Hall sensor as the universal failed part across every 1993-1997 FS-engine car.',
      solution: 'For a crank-no-start, intermittent stall or misfire, first verify battery cranking speed, stored codes, spark on all cylinders, injector command, fuel pressure and compression. Inspect the cap, rotor, connectors and distributor for heat damage or contamination, then test the coil and position signals using the applicable Mazda service procedure. Do not buy a complete distributor, coil or sensor from this page; confirm the failed circuit and distributor version first.',
      symptoms: ['engine cranks but does not start', 'intermittent loss of spark or stalling', 'misfire requires ignition and fuel diagnosis'],
      summary: 'Removed a non-verifiable video citation and unsupported mileage/component certainty; retained the page as a low-confidence diagnosis boundary tied to Mazda and NHTSA records.',
    },
    [IDS.egr]: {
      confidence: 'low',
      description: 'The complete reviewed Mazda manufacturer-communication inventory did not produce a 626 bulletin that establishes recurring EGR passage obstruction for the full 1993-2000 scope. NHTSA complaints contain rough-idle reports, but those reports do not identify EGR blockage as the cause. A P0401 code or rough idle can have several causes, so this page should be treated as a diagnostic possibility rather than proof that the valve or passages are clogged.',
      solution: 'Read all stored and pending codes and freeze-frame data, inspect vacuum hoses and electrical connections, command the EGR system with appropriate diagnostic equipment where supported, and check for intake leaks and blocked passages before removing parts. Cleaning may be appropriate only after deposits are confirmed and the Mazda procedure is available. Do not buy an EGR valve, gasket or cleaner from this page; verify the cause and exact engine application first.',
      symptoms: ['P0401 or another EGR-related code', 'rough idle or hesitation with an emissions fault', 'possible EGR flow problem requires testing'],
      summary: 'Removed unsupported preventive-cleaning frequency and converted the EGR claim to a transparent low-confidence diagnostic hypothesis.',
    },
    [IDS.headGasket]: {
      confidence: 'low',
      description: 'The NHTSA 1990 Mazda 626 complaint file includes an individual report of repeated head-gasket failure, but a complaint is not proof of a chronic defect across all listed 1990-1999 engines and trims. The reviewed Mazda communication inventory did not establish that broad pattern; one separate Mazda communication for 1998-1999 FS engines instead addresses coolant leakage at an accessory block heater. Overheating, coolant loss and exhaust vapor require testing before a head gasket is blamed.',
      solution: 'Stop driving if the temperature warning appears or coolant is being expelled. After the engine cools, have the cooling system pressure-tested and inspect the radiator, hoses, thermostat, fans, water pump, block-heater area and external leaks. Use a combustion-gas test, compression or leak-down testing and oil/coolant inspection before authorizing cylinder-head work. Do not buy a head-gasket set, radiator or water pump from this page; confirm the leak path, engine and machine-work requirements first.',
      symptoms: ['engine overheats or loses coolant', 'coolant is expelled or combustion gas is suspected', 'possible head-gasket leak requires confirmation'],
      summary: 'Removed the unsupported chronic-failure framing and rebuilt the page around one bounded complaint, an alternate Mazda leak location and diagnosis-first safety guidance.',
    },
    [IDS.ignitionSwitch]: {
      confidence: 'high',
      description: 'Mazda recall 8715J/NHTSA 15V674 covers 1993-1998 Mazda 626 vehicles. Excess grease at the ignition-switch contact points can carbonize and reduce insulation, allowing the contacts to become conductive and overheat; the switch may smoke and, in the worst case, cause a fire. The Part 573 report lists the 626 production range and does not support using an independent aftermarket switch as a substitute for the recall remedy.',
      solution: 'Check the VIN for open recall 8715J/15V674 and arrange Mazda dealer service if it is open. The recall remedy is free replacement of the ignition switch with a switch using different terminal grease. If there is smoke, a burning odor or abnormal heat around the steering column, switch the vehicle off if safe, exit it and keep it away from structures until it is inspected. Do not buy an ignition switch from this page; use the VIN-scoped manufacturer recall remedy.',
      symptoms: ['smoke or burning odor near the ignition switch', 'ignition switch or steering-column area becomes abnormally hot', 'VIN has open recall 8715J or 15V674'],
      summary: 'Replaced secondary articles with the exact Part 573 report, corrected the defect mechanism and removed the aftermarket-substitution advice.',
    },
    [IDS.v6DistributorSeal]: {
      confidence: 'low',
      description: 'The reviewed primary records do not establish an internal distributor oil-seal or shaft-bushing defect across every listed 1993-1999 KL V6 626. Mazda communication 54216 concerns distributor component availability for 1993-1994 vehicles but does not document this oil-leak mechanism. Oil inside the cap can be a useful inspection finding, not proof that a specific seal, bushing or housing has failed.',
      solution: 'For a V6 misfire, stall or no-start, inspect the distributor cap and rotor, document where any oil enters, and test spark, coil output and position signals. Check for external valve-cover or cam-area leaks that can mimic an internal distributor leak, and assess shaft play before choosing a repair. Do not buy a seal kit, cap, rotor or complete distributor from this page; identify the leak path and compatible distributor first.',
      symptoms: ['oil or residue is found inside the distributor cap', 'V6 misfire, stall or no-start', 'distributor leak path requires inspection'],
      summary: 'Removed forum-only certainty and sealant advice; retained the indexed V6 identity as a low-confidence inspection and diagnosis page.',
    },
    [IDS.roughIdle]: {
      confidence: 'medium',
      description: 'Mazda manufacturer communications document P0300-P0306 misfire diagnosis on 1997 626 vehicles and rough idle, hesitation, stumble and P0300-P0304 on certain 1998-2002 four-cylinder vehicles. Those primary records support the symptoms, but they do not establish the idle-air-control valve or intake-manifold gasket as the cause for every listed 1993-1999 FS or KL engine.',
      solution: 'Read codes and freeze-frame data, identify which cylinders are affected, and check ignition, injector operation, fuel pressure, compression and vacuum leaks. Use a smoke test or other controlled leak test around the intake system; do not spray flammable cleaner around a running engine. Inspect and test the idle-control circuit only when the applicable engine uses it and the evidence points there. Do not buy an idle valve, intake gasket or sensor from this page; diagnose the engine and fault first.',
      symptoms: ['rough or unstable idle', 'hesitation, stumble or intermittent stall', 'P0300-P0306 misfire code may be stored'],
      summary: 'Anchored the symptom set to Mazda communications and removed the unsupported universal IAC/intake-gasket diagnosis and flammable spray test.',
    },
    [IDS.timingTensioner]: {
      confidence: 'high',
      description: 'Mazda recall 92007/NHTSA 00V134 covers certain 1998 Mazda 626 vehicles equipped with the 2.0-liter engine. An external timing-belt-tensioner spring can break and become caught in the timing belt, which can stall the engine. Dealers check which tensioner is installed and replace it if it is affected. The earlier 98V206 campaign applies to 1997 model-year 626 and MX-6 vehicles and must not be blended into this 1998 page.',
      solution: 'Check the VIN for open recall 92007/00V134 and confirm the vehicle has the 2.0-liter engine covered by the campaign. If the engine stalls, develops abnormal timing-belt noise or will not restart, stop attempting to drive it and arrange inspection. The recall remedy is dealer inspection and replacement of an affected tensioner. Do not buy a timing-belt kit or tensioner spring from this page; this is a VIN- and engine-scoped recall remedy.',
      symptoms: ['engine may stall if the tensioner spring reaches the timing belt', 'abnormal timing-belt-area noise or no-start requires inspection', 'VIN may have open recall 92007 or 00V134'],
      summary: 'Separated the 1998 00V134 campaign from the earlier 1997 recall and removed unsupported maintenance-interval and engine-damage claims.',
    },
    [IDS.transmissionLate]: {
      confidence: 'medium',
      description: 'NHTSA complaint files for 1998-2002 Mazda 626 vehicles contain reports of flashing overdrive indicators, slipping, harsh shifts, loss of drive and transmission overheating. Mazda TSB 05-002/21 applies to every year on this page and states that the oil cooler and lines must be power-flushed before an overhauled or replacement automatic transmission is installed because debris from a prior failure can restrict flow and damage the replacement. Neither source establishes a fixed 60,000-100,000-mile failure window, a universal solenoid or torque-converter cause, or the previously stated fluid interval and manual-swap advice.',
      solution: 'If the overdrive light flashes, the unit slips, overheats, shifts harshly or loses drive, limit driving and have a qualified technician record codes, fluid condition and level, line pressure, gear commands and cooler flow. Verify the exact transmission before repair. If the unit is overhauled or replaced, Mazda TSB 05-002/21 requires technician power-flushing of the cooler and lines; that service procedure is different from an unspecific retail fluid-exchange kit. Do not buy ATF, a solenoid pack, auxiliary cooler, flush kit or rebuilt transmission from this page; diagnose the installed unit and follow the applicable service procedure first.',
      symptoms: ['overdrive indicator flashes', 'automatic transmission slips, overheats or shifts harshly', 'vehicle loses a forward gear or will not move'],
      summary: 'Removed fixed-mileage, universal-component, fluid-interval and manual-swap claims; retained the indexed page with complaint-bounded symptoms and Mazda replacement-service requirements.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda 626 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const notes = {
    [IDS.transmissionEarly]: ['Mazda communications identify bounded 1994-1997 transaxle, P0741 and shift concerns.', 'NHTSA complaints support symptom reports without proving the former failure rate or root-cause narrative.'],
    [IDS.distributor]: ['Mazda communication 54216 is limited to distributor-component availability for 1993-1994.', 'NHTSA complaints include individual distributor/no-start reports but do not establish a universal failed subcomponent.'],
    [IDS.egr]: ['No exact 626 EGR bulletin was found in the complete 190-row Mazda communication inventory.', 'Rough-idle complaints do not prove EGR obstruction.'],
    [IDS.headGasket]: ['One 1990 NHTSA complaint reports head-gasket failure; one complaint cannot establish a chronic decade-wide defect.', 'Mazda communication 605847 identifies an alternate 1998-1999 FS-engine coolant-leak location at the block heater.'],
    [IDS.ignitionSwitch]: ['15V674 directly establishes the 1993-1998 626 scope, grease/carbon defect, fire risk and free switch replacement.', 'All five Part 573 pages were rendered and visually inspected.'],
    [IDS.v6DistributorSeal]: ['No reviewed primary record establishes the published KL V6 oil-seal and shaft-bushing mechanism.', 'Mazda communication 54216 does not document an internal oil leak.'],
    [IDS.roughIdle]: ['Mazda communications 603902, 603989, 614906 and 10009908 support bounded misfire, rough-idle and hesitation symptoms.', 'They do not establish IAC or intake-gasket failure across all engines and years.'],
    [IDS.timingTensioner]: ['00V134 directly establishes the affected 1998 2.0-liter vehicles, spring defect, stall risk and inspect/replace remedy.', '98V206 is an earlier 1997 campaign and is explicitly excluded from the 1998 chronology.'],
    [IDS.transmissionLate]: ['NHTSA complaints support the symptom set across 1998-2002 without proving a rate or universal component.', 'Mazda TSB 05-002/21 directly covers 1998-2002 cooler/line flushing after a failed unit; all 15 pages were visually inspected.'],
  };
  return {
    primaryEvidence: notes[id],
    limitations: 'No owner-frequency rate, retail fitment, warranty eligibility or failed component is inferred beyond the cited primary source.',
  };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.transmissionEarly]: 'No universal retail part; VIN/transmission identification and diagnosis must precede any cooler, valve-body, solenoid or replacement-unit purchase.',
    [IDS.distributor]: 'No universal retail part; spark, fuel, signal and distributor-version diagnosis must precede replacement.',
    [IDS.egr]: 'No universal retail part; EGR flow, passages, wiring and alternate intake faults require diagnosis.',
    [IDS.headGasket]: 'No universal retail part; the leak path, engine and required machine work must be confirmed.',
    [IDS.ignitionSwitch]: 'VIN-scoped dealer recall; Mazda replaces the ignition switch free of charge.',
    [IDS.v6DistributorSeal]: 'No universal retail part; the leak source, shaft condition and distributor version require inspection.',
    [IDS.roughIdle]: 'No universal retail part; misfire, vacuum, fuel, compression and idle-control diagnosis must precede replacement.',
    [IDS.timingTensioner]: 'VIN- and engine-scoped dealer recall; Mazda inspects and replaces an affected tensioner.',
    [IDS.transmissionLate]: 'No universal retail part; diagnosis and Mazda replacement-service procedure must precede any fluid, cooler, solenoid or transmission purchase.',
  };
  return map[id];
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: clone(content.symptoms),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const rest = clone(source);
    delete rest.localPath;
    return [key, rest];
  }));
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === '626').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 9) throw new Error(`Expected 9 Mazda 626 rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    return {
      id: row.id,
      action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      reason: contentFor(row.id).summary,
      evidence: evidenceFor(row.id),
      commerceDecision: commerceDecisionFor(row.id),
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
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mazda',
    model: '626',
    completionStatement: 'All 9 frozen Mazda 626 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'All 9 rows contain material source, safety, diagnosis or remedy corrections and require independent review before any catalog write.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records are evidence that a symptom was reported, not proof of a defect rate, universal cause or exact failed component.',
      'Recall remedies are campaign-, VIN- and engine-scoped and are not converted into retail part recommendations.',
      'Every named replaceable part is covered by an explicit dealer-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: rows.length,
    },
    observations: [
      { code: '626-recall-chronology-separated', severity: 'safety-correction', recordIds: [IDS.timingTensioner], detail: '00V134 is the 1998 2.0-liter campaign; 98V206 is a separate 1997 campaign and is not blended into the proposal.' },
      { code: '626-tensioner-engine-metadata-review', severity: 'metadata-hold', recordIds: [IDS.timingTensioner], detail: 'The frozen engine metadata includes both FS 2.0L and KL 2.5L, while 00V134 is 2.0L-only. The proposal text corrects scope, but engine metadata remains frozen pending explicit approval.' },
      { code: '626-transmission-pages-preserved', severity: 'seo-safety', recordIds: [IDS.transmissionEarly, IDS.transmissionLate], detail: 'Both distinct indexed transmission pages remain live identities; broad engineering and mileage claims are replaced with source-bounded symptom and service guidance.' },
      { code: '626-unsupported-causes-demoted', severity: 'accuracy-correction', recordIds: [IDS.distributor, IDS.egr, IDS.headGasket, IDS.v6DistributorSeal, IDS.roughIdle], detail: 'Unsupported universal causes are explicitly demoted to low- or medium-confidence diagnostic hypotheses rather than deleted.' },
      { code: 'all-626-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Mazda 626 page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
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
  IDS,
  OTHER_SOURCES,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REQUIRED_COMMUNICATION_IDS,
  REVIEW_DATE,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  evidenceFor,
  proposalFor,
};
