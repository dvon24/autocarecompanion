/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-town-car-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['TOWN CAR', 'TOWNCAR']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  air: 'lincoln-town-car-air-suspension-failure',
  blend: 'lincoln-town-car-blend-door-actuator',
  coil: 'lincoln-town-car-coil-plug-ignition-coil-failure-misfires',
  fuel: 'lincoln-town-car-fuel-tank-puncture-fire-risk-rear-impacts',
  lcm: 'lincoln-town-car-lighting-control-module-failure-headlights-cut-out',
  intake: 'lincoln-town-car-plastic-intake-manifold-coolant-crossover-failure',
  rack: 'lincoln-town-car-power-steering-rack-line-leaks',
  window: 'lincoln-town-car-power-window-regulator-failure',
  shaft: 'lincoln-town-car-steering-intermediate-shaft-corrosion-loss-steering',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

const PDF_SOURCES = Object.freeze({
  lcmSisterRecall: { title: 'Ford Safety Recall 15S39: Crown Victoria and Grand Marquis Headlights Inoperative', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2015/RCMN-15V861-0180.pdf', localPath: 'C:/tmp/lincoln-town-car-lcm-sister-recall.pdf', pages: 16, visualPages: Array.from({ length: 16 }, (_, index) => index + 1), bytes: 688649, sha256: 'c922d18432da1bc2264a2e4290edc6f8f89f11e65a5e6884f0c8d0df10a758a3' },
  steeringRecall: { title: 'Ford Safety Recall 13S08 Supplement 2: Steering Column Shaft', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2013/RCRIT-13V385-9944.pdf', localPath: 'C:/tmp/lincoln-town-car-steering-recall.pdf', pages: 17, visualPages: Array.from({ length: 17 }, (_, index) => index + 1), bytes: 6564170, sha256: 'beb31fc06f9ac1744f25419cb63c2479fdae443f1cfbd5fad67f502abd78a353' },
  steeringRegional: { title: 'Ford Regional Program 13R01 Supplement 3: Steering Column Shaft', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10054924-1911.pdf', localPath: 'C:/tmp/lincoln-town-car-steering-13r01.pdf', pages: 19, visualPages: Array.from({ length: 19 }, (_, index) => index + 1), bytes: 1096295, sha256: '7008b5caf20450e95fb3382c805c6fd8982808448626a5e17d70e6247bc98f69' },
  steeringInvestigation: { title: 'NHTSA EA13-004 Closing Resume: Loss of Steering Control', type: 'investigation', url: 'https://static.nhtsa.gov/odi/inv/2013/INCLA-EA13004-7902.PDF', localPath: 'C:/tmp/lincoln-town-car-steering-investigation.pdf', pages: 2, visualPages: [1, 2], bytes: 203538, sha256: '4830cfd311675f2791354504fa5ff4d37875b81fe3189a154499dfac46763179' },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  air2003: { title: 'NHTSA 2003 Town Car Complaints (ODI 11033099)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2003', odiNumber: '11033099' },
  air2008: { title: 'NHTSA 2008 Town Car Complaints (ODI 11265222)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2008', odiNumber: '11265222' },
  hvac2008: { title: 'NHTSA 2008 Town Car Complaints (ODI 10869964)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2008', odiNumber: '10869964' },
  lcm2000: { title: 'NHTSA 2000 Town Car Complaints (ODI 10966140)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2000', odiNumber: '10966140' },
  lcm2003: { title: 'NHTSA 2003 Town Car Complaints (ODI 10746524)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2003', odiNumber: '10746524' },
  intake2000: { title: 'NHTSA 2000 Town Car Complaints (ODI 10453311)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2000', odiNumber: '10453311' },
  rack2003: { title: 'NHTSA 2003 Town Car Complaints (ODI 10448160)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2003', odiNumber: '10448160' },
  window2000: { title: 'NHTSA 2000 Town Car Complaints (ODI 10100662)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2000', odiNumber: '10100662' },
  recalls2008: { title: 'NHTSA Current 2008 Town Car Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LINCOLN&model=TOWN%20CAR&modelYear=2008' },
});

const CAMPAIGNS = Object.freeze(['00V157001','00V157002','00V200000','00V228001','00V270000','00V356000','00V364000','00V368000','00V412000','01V227001','01V258000','01V318000','04V328000','05V518000','07V270000','07V336000','10V638000','13V385000','14V704000','15E082000','83V017000','83V028000','85V123000','86V142000','87V012000','87V018000','87V131000','87V139000','90V050000','90V093000','90V133000','90V134000','91V008000','91V147000','94V129000','94V152000','95E006002','95V063000','95V091000','95V133000','95V151000','96V070000','96V071000','96V109000','96V135000','96V231000','98I001000','98V028000','98V322000','99V124000']);
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 194, '2000-2004': 259, '2005-2009': 50, '2010-2014': 7, '2015-2019': 14, '2020-2024': 4, '2025-2026': 1 }, totalRows: 529, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 99, post: 26 }, totalRows: 125, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.air]: [OTHER_SOURCES.air2003, OTHER_SOURCES.air2008, OTHER_SOURCES.datasets],
    [IDS.blend]: [OTHER_SOURCES.hvac2008, OTHER_SOURCES.datasets],
    [IDS.coil]: [OTHER_SOURCES.datasets],
    [IDS.fuel]: [OTHER_SOURCES.datasets],
    [IDS.lcm]: [PDF_SOURCES.lcmSisterRecall, OTHER_SOURCES.lcm2000, OTHER_SOURCES.lcm2003, OTHER_SOURCES.datasets],
    [IDS.intake]: [OTHER_SOURCES.intake2000, OTHER_SOURCES.datasets],
    [IDS.rack]: [OTHER_SOURCES.rack2003, OTHER_SOURCES.datasets],
    [IDS.window]: [OTHER_SOURCES.window2000, OTHER_SOURCES.datasets],
    [IDS.shaft]: [PDF_SOURCES.steeringRecall, PDF_SOURCES.steeringRegional, PDF_SOURCES.steeringInvestigation, OTHER_SOURCES.recalls2008],
  };
  if (!map[id]) throw new Error(`Unexpected Town Car row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.air]: {
      confidence: 'low',
      description: 'NHTSA complaint ODI 11033099 alleges that a 2003 Town Car rear air suspension rose too high and would not lower, while ODI 11265222 alleges warning indicators on a very-high-mileage 2008 vehicle and an independent mechanic recommendation involving the rear air springs. Ford communication 10008325 is limited to 2003 rear-air-suspension height adjustment and service tips. These records do not establish universal air-spring leaks, compressor burnout, DTCs, failure rates or the same cause across every indexed 2003-2011 vehicle.',
      solution: 'If the rear ride height is wrong or an air-suspension warning appears, have a suspension technician scan the appropriate module and test power, ground, height input, lines, fittings, air springs and compressor performance before choosing a repair. Do not buy air springs, a compressor, dryer, relay or coil-spring conversion kit from this page; the failed component and vehicle configuration must be confirmed first.',
      symptoms: ['incorrect or uneven rear ride height', 'rear suspension does not lower or recover normally', 'air-suspension warning requiring diagnosis'], dtcCodes: [],
      summary: 'Recast the air-suspension identity as bounded complaint evidence and diagnosis, removing universal leak, burnout, DTC, price, brand and conversion claims.',
    },
    [IDS.blend]: {
      confidence: 'low',
      description: 'Ford communications 603547 and 613389 mention broken blend doors on some 1998 Town Cars, outside this page\'s preserved 2003-2011 indexed range. NHTSA complaint ODI 10869964 alleges that plastic sheeting blocked parts of the HVAC system on one 2008 vehicle. Those records do not establish a common actuator gear failure, a replacement-only remedy, the listed DTCs or automatic driver/passenger-side diagnosis across all indexed years.',
      solution: 'Have the HVAC concern reproduced and identify which air-distribution or temperature function is wrong. A technician should check controls, module data and faults, electrical supply, doors, linkages, actuators, blower and obstructions before replacing anything. Do not buy a blend-door actuator or named aftermarket part from this page; location, cause and fitment must be diagnosed on the vehicle.',
      symptoms: ['incorrect outlet temperature', 'air does not move to the selected outlet', 'clicking or HVAC noise requiring diagnosis', 'defrost, blower or door movement concern'], dtcCodes: [],
      summary: 'Removed unsupported common-actuator, plastic-gear, DTC, labor and replacement-only claims while preserving the indexed HVAC identity.',
    },
    [IDS.coil]: {
      confidence: 'medium',
      description: 'Ford communication 10008264 covers 1998-2002 Town Car drivability concerns under acceleration caused by an ignition coil, and communication 10011162 covers 2000-2005 engine misfire or rough-running diagnostic tips for coil-on-plug systems. Those records support coil diagnosis for part of the indexed range, but they do not prove the described boot-and-tower mechanism, a model-wide frequency, coolant as the cause, or coverage through 2011.',
      solution: 'Have a technician scan for current and pending faults, identify the misfiring cylinder and inspect the spark plug, coil, boot, connector, wiring and plug well before selecting a repair. Intake-coolant leakage should be diagnosed separately when evidence is present. Do not buy a coil set, boots, spark plugs or intake manifold from this page; the Ford records require diagnosis and do not establish one universal part or repair.',
      symptoms: ['malfunction indicator with a misfire DTC', 'rough running or misfire', 'drivability concern under acceleration'], dtcCodes: ['P0300','P0301','P0302','P0303','P0304','P0305','P0306','P0307','P0308'],
      summary: 'Bound the COP identity to Ford\'s 1998-2005 diagnostic evidence and removed universal mechanism, frequency and parts-replacement claims.',
    },
    [IDS.fuel]: {
      confidence: 'high',
      description: 'Ford communication 627791 covers 1992-2001 Town Cars and describes parts and a procedure intended to reduce possible fuel-tank puncture during rare, extremely high-speed rear impacts. Customer Satisfaction Program communication 10018074 describes a high-speed, high-energy rear-collision puncture possibility for vehicles with the Limo Prep Package and a historical upgrade-kit offering. These records do not support a current free program, universal shield fitment, a do-it-yourself grinding instruction, a fixed retail price or the page\'s former fatality and lawsuit claims.',
      solution: 'Ask a Ford or Lincoln dealer to identify the VIN, original configuration, Limo Prep Package status and any completed 05B31 or related service history before deciding whether inspection or historical service information applies. After any rear impact with fuel odor or leakage, move away from the vehicle, avoid ignition sources and contact emergency services. Do not buy a shield kit or grind a bracket from this page; parts, procedure and eligibility are configuration- and service-information-specific.',
      symptoms: ['fuel odor or visible leakage after a rear impact', 'rear-impact fuel-system damage requiring emergency response', 'unknown Limo Prep Package or historical program status'], dtcCodes: [],
      summary: 'Retained the documented rear-impact risk while removing unsupported fatality, lawsuit, price, current-free-program and DIY shield/grinding claims.',
    },
    [IDS.lcm]: {
      confidence: 'low',
      description: 'Town Car owner complaints ODI 10966140 and 10746524 allege headlamp or lighting-control concerns, and Ford communications mention limited Town Car LCM concerns and headlamp flicker. Ford safety recall 15S39/NHTSA 15V861, however, explicitly lists only 2003-2005 Crown Victoria and Grand Marquis vehicles; it does not include the Town Car. That sister-car recall cannot prove the same solder-joint defect, authorize its bypass-module remedy or establish a model-wide Town Car failure across 1995-2011.',
      solution: 'If exterior lights flicker, fail or remain on, avoid night driving until a qualified technician tests the bulbs, fuses, switches, wiring, grounds, charging system and Town Car lighting-control module. Confirm Town Car-specific service information and VIN recall status before any repair. Do not buy an LCM, board-rebuild service or 15S39 bypass kit from this page; 15S39 does not cover the Town Car and its remedy must not be transplanted.',
      symptoms: ['headlamps flicker or become inoperative', 'exterior lights remain on or behave erratically', 'lighting-control concern requiring Town Car-specific diagnosis'], dtcCodes: [],
      summary: 'Corrected the false Town Car recall implication and removed the sister-car bypass, universal solder-joint, rebuild and price prescriptions.',
    },
    [IDS.intake]: {
      confidence: 'high',
      description: 'Ford communications 619445 and 620174 apply to 1998-2001 Town Cars with some composite 4.6L SOHC intake manifolds that may develop fatigue cracks at the coolant crossover, causing coolant leakage, overheating and possible engine damage if coolant is lost. Communication 10018959 describes historical program 05N04 for 1996-2001 vehicles with seven-year, unlimited-mile coverage arising from a settlement. That time-limited program is expired and does not promise current reimbursement. The exact defect communications directly list 1998-2001, while this page\'s broader 1996-2001 indexed identity is preserved.',
      solution: 'With the engine cool, have the cooling system inspected and pressure-tested to locate the leak and assess any overheating before parts are selected. A confirmed cracked manifold requires the correct VIN- and build-specific service part and installation procedure; secondary damage needs separate diagnosis. Do not buy a manifold, ignition coils or branded replacement from this page, and do not rely on the expired 05N04 program for current coverage.',
      symptoms: ['coolant leakage near the intake-manifold crossover', 'falling coolant level', 'engine overheating after coolant loss'], dtcCodes: [],
      summary: 'Bound the defect to Ford\'s coolant-crossover records, identified expired 05N04 coverage and removed brand, settlement-payment and automatic secondary-parts claims.',
    },
    [IDS.rack]: {
      confidence: 'low',
      description: 'The Town Car communication inventory includes 2003 power-steering assist-feel guidance and cold-start pump-noise guidance, but no exact manufacturer communication establishing a common rack-seal, line-fitting or O-ring leak across 2003-2011. NHTSA complaint ODI 10448160 alleges that a dealer replaced the pump and then diagnosed an internal rack failure on one 2003 stretch limousine. One allegation does not prove a model-wide leak mechanism, incidence rate or universal remanufactured-rack remedy.',
      solution: 'If fluid is low, steering effort changes or noise appears, have a technician locate any leak and test the reservoir, fluid condition, pump, hoses, fittings, rack, steering shaft and front-end components. Do not buy a rack, pump, pressure line, seal, O-ring or fluid from this page; the source of loss or steering effort must be confirmed, and a stretch limousine may have different duty and configuration.',
      symptoms: ['low power-steering fluid or visible fluid requiring source identification', 'changed steering effort', 'power-steering noise requiring diagnosis'], dtcCodes: [],
      summary: 'Downgraded the unsupported common rack/line leak narrative to one complaint plus diagnosis and removed remanufactured-part, flush and cost prescriptions.',
    },
    [IDS.window]: {
      confidence: 'low',
      description: 'Ford communication 612332 covers slow-moving front power windows on some 1999-2000 Town Cars, and communication 615493 provides generic service information for 1998-1999 power-window concerns. NHTSA complaint ODI 10100662 alleges stuck power windows and repeated fuse replacement on one 2000 vehicle. These records do not establish routine regulator failure, the described plastic-ball or guide-clip mechanism, a one-hour replacement or the same cause across every indexed 1998-2011 vehicle.',
      solution: 'Before removing a door panel or ordering parts, have the affected window diagnosed for switch input, fuse and circuit condition, power and ground, wiring, motor operation, regulator movement, glass alignment and track binding. Secure an unsupported glass panel promptly. Do not buy a regulator assembly, motor, gear kit or clips from this page; the failed component and door-specific fitment must be confirmed.',
      symptoms: ['front power window moves slowly', 'power window is stuck or inoperative', 'glass movement or alignment concern requiring diagnosis'], dtcCodes: [],
      summary: 'Removed universal regulator mechanism, frequency, DIY-time and replacement claims while retaining the indexed power-window troubleshooting identity.',
    },
    [IDS.shaft]: {
      confidence: 'high',
      description: 'Ford safety recall 13S08/NHTSA 13V385 covers affected 2005-2011 Town Cars originally sold or currently registered in specified corrosion states. Severe corrosion can seize the lower intermediate-shaft swing link, collapse the upper intermediate shaft, separate the steering-column lower bearing and cause loss of steering control. NHTSA EA13-004 records an approximately 355,000-vehicle recall within an 805,213-vehicle investigated population; those figures are not Town Car-only totals. Ford also issued regional program 13R01 for certain vehicles outside 13S08, so applicability and current status are VIN-specific.',
      solution: 'Check the VIN for an open 13S08/13V385 recall and contact a Ford or Lincoln dealer. The recall procedure replaces the lower intermediate shaft, inspects the upper shaft and column bearing, and repairs them as the inspection directs; a retainer is installed if required. If steering is notchy, stiff, binding or control is impaired, stop driving when safe and arrange inspection or towing. Do not buy steering shafts, bolts or a bearing-retainer kit from this page; this is a VIN-scoped dealer recall and technician procedure.',
      symptoms: ['notchy, stiff or binding steering', 'corroded lower intermediate-shaft joint', 'collapsed upper shaft or displaced column bearing', 'loss of steering control'], dtcCodes: [],
      summary: 'Corrected population and regional scope, preserved the exact recall remedy and removed blanket all-vehicle and retail-parts advice.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Town Car row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const notes = {
    [IDS.air]: ['Communication 10008325 is only a 2003 height-adjustment/service-tip summary.', 'ODI complaints are owner allegations, not model-wide defect findings.'],
    [IDS.blend]: ['Communications 603547 and 613389 concern 1998 broken blend doors, outside the indexed 2003-2011 range.', 'ODI 10869964 alleges an obstruction, not an actuator-gear defect.'],
    [IDS.coil]: ['Communications 10008264 and 10011162 directly support ignition-coil/COP diagnosis only through 2005.', 'No source found proves the claimed mechanism or frequency through 2011.'],
    [IDS.fuel]: ['Communication 627791 covers rare, extremely high-speed rear impacts for 1992-2001.', 'Communication 10018074 describes historical 05B31 information and Limo Prep Package upgrade offering.'],
    [IDS.lcm]: ['15S39 names Crown Victoria and Grand Marquis only; Town Car is excluded.', 'Town Car complaints remain allegations and cannot import the sister-car remedy.'],
    [IDS.intake]: ['Communications 619445 and 620174 directly document fatigue cracks at the coolant crossover on 1998-2001 Town Cars.', '05N04 was a seven-year historical coverage program and is expired.'],
    [IDS.rack]: ['No exact Town Car manufacturer communication establishes common rack or line leakage.', 'ODI 10448160 is one stretch-limousine allegation of pump and rack failure.'],
    [IDS.window]: ['Ford records support slow windows/service concerns on 1998-2000 only.', 'No primary source proves a universal regulator mechanism across 1998-2011.'],
    [IDS.shaft]: ['13S08, 13R01 and EA13-004 jointly establish defect, regional/VIN scope and inspection-directed remedy.', 'All 54 local PDF pages were rendered and visually inspected.'],
  };
  return { primaryEvidence: notes[id], limitations: 'No population frequency, retail fitment, current-program eligibility or repair is inferred beyond the cited primary source.' };
}
function commerceDecisionFor(id) {
  const map = {
    [IDS.air]: 'No universal retail part; diagnosis must distinguish springs, lines, sensors, compressor and electrical causes.',
    [IDS.blend]: 'No universal retail part; HVAC door, actuator, control, wiring and obstruction causes require diagnosis.',
    [IDS.coil]: 'No universal retail part; misfire diagnosis must identify the cylinder and failed ignition or mechanical component.',
    [IDS.fuel]: 'Dealer/configuration-specific historical program; no retail shield kit or DIY procedure is authorized.',
    [IDS.lcm]: 'No universal retail part; the sister-car 15S39 bypass kit is not a Town Car remedy.',
    [IDS.intake]: 'No universal retail part; manifold fitment and any secondary damage are VIN-, build- and diagnosis-specific.',
    [IDS.rack]: 'No universal retail part; pump, line, fitting, rack, shaft and front-end causes require diagnosis.',
    [IDS.window]: 'No universal retail part; door, motor, regulator, circuit and track fitment require diagnosis.',
    [IDS.shaft]: 'VIN-scoped dealer recall; do not replace recall parts with retail recommendations from this page.',
  };
  return map[id];
}
function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: clone(before.affectedSystems), dtcCodes: clone(content.dtcCodes),
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const { localPath: _localPath, ...rest } = source; return [key, clone(rest)]; })); }
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Town Car').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 9) throw new Error(`Expected 9 Town Car rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: contentFor(row.id).summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Lincoln', model: 'Town Car',
    completionStatement: 'All 9 frozen Lincoln Town Car pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 9 rows contain material source, safety, population or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity, vehicle metadata and canonical severity.',
      'Broader indexed year ranges remain for SEO continuity while the copy explicitly limits each source to its supported population.',
      'Recall and historical customer-program remedies are campaign-, VIN-, date-, region- and configuration-scoped.',
      'Every named replaceable part is covered by an explicit dealer-only, technician-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'town-car-lcm-sister-recall-excluded', severity: 'safety-correction', recordIds: [IDS.lcm], detail: 'Recall 15S39/15V861 explicitly covers Crown Victoria and Grand Marquis, not Town Car; its bypass remedy cannot be transplanted.' },
      { code: 'town-car-expired-programs-bounded', severity: 'accuracy-correction', recordIds: [IDS.fuel, IDS.intake], detail: 'Historical 05B31 and 05N04 records do not promise current coverage, reimbursement or retail fitment.' },
      { code: 'town-car-recall-region-and-vin', severity: 'safety-correction', recordIds: [IDS.shaft], detail: '13S08 and 13R01 require region/VIN-specific handling; investigated and recalled population figures are not Town Car-only totals.' },
      { code: 'all-town-car-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Town Car page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
