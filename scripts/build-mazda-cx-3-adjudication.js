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
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-3-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['CX-3', 'CX3']);

const IDS = Object.freeze({
  ac: 'mazda-cx3-ac-compressor-2016',
  carbon: 'mazda-cx3-carbon-buildup-2016',
  rearBrake: 'mazda-cx3-rear-brake-noise-2016',
  transmission: 'mazda-cx3-transmission-shudder-2016',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10085422', '10100889', '10111005', '10129368', '10136779', '10155437',
  '10165351', '10182094', '10202690', '10225767', '10228648', '10228657',
]);
const CAMPAIGNS = Object.freeze(['16V203000', '16V644000', '21V875000', '23V487000']);

const PDF_SOURCES = Object.freeze({
  condenser: {
    title: 'Mazda SSPB8 — 2016-2017 CX-3 A/C Condenser Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10165351-0001.pdf',
    localPath: 'C:/tmp/mazda-cx3-condenser.pdf',
    pages: 1,
    visualPages: [1],
    bytes: 295187,
    sha256: '67c9c19a5a6a1251e6eceefbd996bf4e92f49d512150785797ad4450784b1f24',
  },
  evaporator: {
    title: 'Mazda TSB 07-005/21 — A/C Blows Warm Air Due to Evaporator Leak',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10202690-0001.pdf',
    localPath: 'C:/tmp/mazda-cx3-evaporator.pdf',
    pages: 5,
    visualPages: [1, 2, 3, 4, 5],
    bytes: 1292563,
    sha256: '0c65220b74645ce90dee35a0484b42d7f1d697a6e40990621825a2e4d10be3fe',
  },
  rearBrake: {
    title: 'Mazda TSB 04-007/20 — Grinding Noise from Rear Brakes',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10182094-0001.pdf',
    localPath: 'C:/tmp/mazda-cx3-rear-brake.pdf',
    pages: 4,
    visualPages: [1, 2, 3, 4],
    bytes: 413631,
    sha256: '7ea958cfa2a8688c5aa2594d24416fd7936de5dfb252739755d36d8a86ae3d0d',
  },
  atfFz: {
    title: 'Mazda Service Alert SA-068/22 — ATF-FZ Required for SKYACTIV-DRIVE',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225767-0001.pdf',
    localPath: 'C:/tmp/mazda-cx3-atf-fz.pdf',
    pages: 3,
    visualPages: [1, 2, 3],
    bytes: 276691,
    sha256: 'd0700aab6029b80cb45b477da7258a09c632590d8fa257c77654f307ab2f3c7e',
  },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints2016: { title: 'NHTSA 2016 Mazda CX-3 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-3&modelYear=2016' },
  complaints2017: { title: 'NHTSA 2017 Mazda CX-3 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-3&modelYear=2017' },
  complaints2018: { title: 'NHTSA 2018 Mazda CX-3 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-3&modelYear=2018' },
  complaints2019: { title: 'NHTSA 2019 Mazda CX-3 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-3&modelYear=2019' },
  complaints2020: { title: 'NHTSA 2020 Mazda CX-3 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-3&modelYear=2020' },
  complaints2021: { title: 'NHTSA 2021 Mazda CX-3 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-3&modelYear=2021' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 420, '2020-2024': 317, '2025-2026': 68 },
  totalRows: 805,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 9 },
  totalRows: 9,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }

function citationsFor(id) {
  const map = {
    [IDS.ac]: [PDF_SOURCES.condenser, PDF_SOURCES.evaporator, OTHER_SOURCES.complaints2016, OTHER_SOURCES.complaints2017, OTHER_SOURCES.complaints2019],
    [IDS.carbon]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints2016, OTHER_SOURCES.complaints2017, OTHER_SOURCES.complaints2018, OTHER_SOURCES.complaints2019, OTHER_SOURCES.complaints2020, OTHER_SOURCES.complaints2021],
    [IDS.rearBrake]: [PDF_SOURCES.rearBrake, OTHER_SOURCES.complaints2019],
    [IDS.transmission]: [PDF_SOURCES.atfFz, OTHER_SOURCES.datasets, OTHER_SOURCES.complaints2016],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda CX-3 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.ac]: {
      confidence: 'high',
      description: 'Mazda documents two specific causes of warm A/C air on CX-3 vehicles: condenser corrosion and refrigerant leakage on certain 2016-2017 vehicles, and an evaporator brazed-joint leak on VIN-bounded 2016-2021 vehicles. NHTSA complaints also report diagnosed evaporator and condenser leaks. The reviewed evidence does not establish the frozen page title’s generic compressor-failure claim, a 40,000-80,000-mile pattern, bearing or clutch wear as the common cause, or automatic contamination of every A/C component.',
      solution: 'Have a qualified A/C technician verify refrigerant charge and locate the leak before replacing anything. Mazda TSB 07-005/21 directs pressure and UV-dye checks before an eligible evaporator is replaced; SSPB8 is a time-limited warranty extension specifically for condenser corrosion on certain 2016-2017 vehicles and is not a recall. A grinding or belt noise requires separate compressor, clutch, pulley and belt diagnosis. Do not buy a compressor, condenser, evaporator, drier or expansion valve from this page; verify the VIN, leak location, refrigerant specification and failed component first.',
      symptoms: ['A/C blows warm air because refrigerant charge may be low', 'UV dye or another leak test identifies an evaporator or condenser leak', 'grinding, squealing or clutch non-engagement requires separate diagnosis'],
      summary: 'Replaced a fake forum citation and unsupported compressor/mileage/kit narrative with Mazda-documented condenser and evaporator leak scopes and diagnosis-first guidance.',
    },
    [IDS.carbon]: {
      confidence: 'low',
      description: 'A complete review of 805 Mazda CX-3 manufacturer-communication rows and NHTSA complaint files for 2016-2021 did not identify a primary record establishing recurring intake-valve carbon buildup on this model. Mazda records instead document several different causes of rough idle or misfire symptoms, including frozen water restricting the exhaust on cold starts, PCM faults, lean-condition diagnosis and oil-control concerns. Direct injection alone does not prove that deposits are causing a particular vehicle’s symptoms.',
      solution: 'Record all stored and pending codes and freeze-frame data, then test ignition, injectors, fuel pressure, compression, intake leaks, exhaust restriction and oil-control faults before inspecting the intake valves. If testing and direct visual inspection confirm deposits that affect airflow, use a repair method approved for the exact engine and keep cleaning material out of the cylinders. Do not buy an intake cleaner, oil additive, scanner or walnut-blasting service from this page; confirm the cause and service procedure first.',
      symptoms: ['rough idle or misfire, especially after a cold start', 'P0300-P0304 or lean-condition codes may require diagnosis', 'hesitation or power loss has multiple possible causes'],
      summary: 'Demoted the carbon mechanism to a transparent low-confidence hypothesis after the complete primary inventory found no exact CX-3 carbon bulletin or complaint.',
    },
    [IDS.rearBrake]: {
      confidence: 'high',
      description: 'Mazda TSB 04-007/20 covers certain 2019-2020 CX-3 vehicles with electric parking brakes and VINs below the bulletin cutoff. It states that rear-pad material may not remove disc rust; heat can harden that rust and produce grinding. Mazda calls for modified rear pads and inspection, machining or replacement of the rear discs. The bulletin does not support a drum-in-hat design, abnormal electronic rear-brake bias, a 2016-2021-wide wear defect or a universal aftermarket-pad substitution.',
      solution: 'First determine whether the sound is from the front or rear and measure pad and disc condition on both sides. For a VIN within TSB 04-007/20, a Mazda technician should verify the rust/grinding pattern and follow the bulletin’s modified-pad and disc repair procedure. Other years or symptoms require inspection for wear, corrosion, dragging hardware, caliper operation and foreign material. Do not buy pads, rotors or brake lubricant from this page; verify the VIN, axle, brake package and measured condition first.',
      symptoms: ['grinding noise from the rear brakes while braking', 'rear discs show rust, grooves or scoring', 'pad and disc condition requires side-to-side measurement'],
      summary: 'Removed false drum-in-hat, EBD-bias, EGR-code and aftermarket-fitment claims; bounded the supported grinding concern to Mazda’s 2019-2020 VIN scope.',
    },
    [IDS.transmission]: {
      confidence: 'medium',
      description: 'The reviewed Mazda CX-3 communication inventory documents several distinct transmission concerns, including pressure-switch contamination with warning lamps and DTCs, high-elevation shift shock on certain 2018 vehicles, a speed-dependent transaxle whine on certain 2016-2019 units, and possible wheel-bearing misdiagnosis. It does not establish torque-converter lockup wear as the typical cause of a 20-45 mph shudder across 2016-2021. Mazda Service Alert SA-068/22 specifies ATF-FZ—not “FW”—and states that this transmission is filled for life, has no routine ATF change interval and should not be flushed as preventive maintenance.',
      solution: 'Record the speed, gear, engine load and temperature at which the vibration occurs; scan the PCM and TCM, inspect tires, wheels, axles, mounts and wheel bearings, and perform a controlled road test before blaming the transmission. If fluid level or a transmission repair must be addressed, follow Mazda’s temperature-dependent level procedure and use only ATF-FZ. Do not perform a preventive flush or authorize a torque converter, valve body, transmission or fluid purchase from this page; identify the installed unit and failure mode first.',
      symptoms: ['shudder, vibration or shift shock under repeatable driving conditions', 'automatic-transaxle or check-engine warning may appear on some distinct faults', 'speed-dependent whine can be confused with a wheel bearing'],
      summary: 'Corrected the fluid specification and Mazda maintenance guidance; removed unsupported torque-converter certainty, 30,000-mile interval and automatic replacement advice.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-3 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const map = {
    [IDS.ac]: ['SSPB8 directly establishes condenser corrosion and a bounded 2016-2017 warranty extension.', 'TSB 07-005/21 directly establishes VIN-bounded 2016-2021 evaporator brazed-joint leaks and requires pressure and UV checks before replacement.'],
    [IDS.carbon]: ['No exact intake-valve-carbon record was found in all 805 CX-3 manufacturer communications.', 'Mazda communications identify several alternate rough-idle and misfire causes, so symptoms alone cannot establish carbon deposits.'],
    [IDS.rearBrake]: ['TSB 04-007/20 directly establishes rear-disc rust/grinding on certain 2019-2020 EPB vehicles and the modified-pad/disc remedy.', 'The bulletin contradicts the frozen page’s drum-in-hat and 2016-2021-wide causal narrative.'],
    [IDS.transmission]: ['Mazda communications identify distinct pressure-switch, high-elevation shift-shock, transaxle-whine and misdiagnosis patterns, not a universal lockup-clutch defect.', 'SA-068/22 directly requires ATF-FZ, says there is no routine change interval and states that preventive flushing is not recommended.'],
  };
  return { primaryEvidence: map[id], limitations: 'Complaint records show that a symptom was reported; they do not establish prevalence, a universal root cause, retail fitment or warranty eligibility.' };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.ac]: 'No universal retail part; VIN, refrigerant charge and exact leak or rotating-component failure must be confirmed.',
    [IDS.carbon]: 'No universal retail part; deposits and their effect must be directly confirmed after alternate causes are tested.',
    [IDS.rearBrake]: 'No universal retail part; VIN, axle, brake package and measured pad/disc condition must be verified.',
    [IDS.transmission]: 'No universal retail part; fluid service, software, internal repair and replacement depend on diagnosis and installed-unit identification.',
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
    dtcCodes: id === IDS.carbon ? ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'] : [],
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
    const rest = clone(source); delete rest.localPath; return [key, rest];
  }));
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-3').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 4) throw new Error(`Expected 4 Mazda CX-3 rows, found ${rows.length}`);
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
    model: 'CX-3',
    completionStatement: 'All 4 frozen Mazda CX-3 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 4 rows contain material source, diagnosis, remedy or fitment corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 4 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records are symptom reports, not proof of a defect rate, universal cause or exact failed component.',
      'Manufacturer bulletin remedies remain VIN-, model-year- and condition-scoped.',
      'Every named replaceable part has an explicit no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as “0+ owners” social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'cx3-ac-title-evidence-mismatch-held', severity: 'identity-hold', recordIds: [IDS.ac], detail: 'The title remains frozen for SEO, while primary records support condenser and evaporator leaks rather than a recurring compressor defect.' },
      { code: 'cx3-carbon-unsubstantiated', severity: 'accuracy-correction', recordIds: [IDS.carbon], detail: 'No exact carbon-buildup record was found in the complete 805-row communication inventory; the proposal demotes the cause instead of deleting the page.' },
      { code: 'cx3-brake-scope-corrected', severity: 'safety-correction', recordIds: [IDS.rearBrake], detail: 'The supported rear-grinding issue is VIN-bounded to certain 2019-2020 EPB vehicles; drum-in-hat, EBD bias and EGR-code claims are removed.' },
      { code: 'cx3-atf-and-maintenance-corrected', severity: 'safety-correction', recordIds: [IDS.transmission], detail: 'Mazda requires ATF-FZ, specifies no routine change interval and advises against preventive flushing; the former FW/30,000-mile guidance is removed.' },
      { code: 'all-cx3-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Mazda CX-3 page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
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

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
