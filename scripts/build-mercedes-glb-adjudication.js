/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-glb-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  carbon: 'mercedes-benz-glb-carbon-buildup-intake-valves-causing-rough-idle-power-loss',
  ecall: 'mercedes-benz-glb-emergency-call-system-disabled-by-communication-module-sim-s',
  esp: 'mercedes-benz-glb-esp-abs-control-unit-damage-disabling-stability-control-anti',
  carrier: 'mercedes-benz-glb-front-axle-carrier-corrosion-failure',
  valve: 'mercedes-benz-glb-m260-cylinder-head-exhaust-valve-seat-guide-wear',
  camera: 'mercedes-benz-glb-rearview-camera-fails-to-display-due-to-software-error',
  water: 'mercedes-benz-glb-water-intrusion-into-front-footwells-causing-blank-instrumen',
  dct: 'mercedes-glb-8g-dct-shudder-2020',
  mbux: 'mercedes-glb-mbux-freeze-2020',
  roof: 'mercedes-glb-panoramic-roof-creak-2020',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.esp, IDS.carrier, IDS.valve, IDS.camera, IDS.water].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.dct, IDS.mbux, IDS.roof].sort());
const MODEL_ALIASES = Object.freeze([
  'GLB-CLASS', 'GLB CLASS', 'GLB250', 'GLB 250', 'GLB35 AMG', 'GLB 35 AMG',
  'AMG GLB35', 'AMG GLB 35', 'GLB 180', 'GLB180', 'GLB 200', 'GLB200',
]);
const SEARCH_TERMS = Object.freeze([
  'carbon', 'intake valve', 'rough idle', 'power loss', 'SIM', 'communication module',
  'eCall', 'emergency call', 'ESP', 'ABS', 'stability', 'integral carrier', 'front axle',
  'corrosion', 'valve seat', 'valve guide', 'cylinder head', 'misfire', 'rearview camera',
  'rear view camera', 'black screen', 'water intrusion', 'footwell', '8G-DCT', '724.1',
  'transmission', 'shudder', 'MBUX', 'freeze', 'reboot', 'panoramic', 'sunroof', 'creak',
  'popping', 'wind noise', 'windshield', 'sealing lip',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10241534', '11011544', '11014593', '11015813', '11016159', '11022045', '11026832',
  '11028267', '11030302', '11032700',
]);
const CAMPAIGNS = Object.freeze([
  '20V246000', '20V480000', '20V558000', '20V628000', '21V058000', '21V231000',
  '21V232000', '21V354000', '21V403000', '21V404000', '21V405000', '21V509000',
  '21V526000', '21V639000', '21V860000', '21V961000', '21V990000', '22V078000',
  '22V232000', '22V314000', '22V365000', '22V679000', '23V732000', '24V592000',
  '24V780000', '26V481000',
]);
const PDF_SOURCES = Object.freeze({
  ecallRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 22V-365: disabled emergency-call system',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V365-2568.PDF',
    localPath: 'C:/tmp/mercedes-glb-sources/22V365.pdf', pages: 29,
    visualPages: [13, 19, 28], bytes: 253160,
    sha256: '2f37aae34e552258ada2177ad285b2ec552b9bc2fead9ca9457788e7a37f2549',
  },
  espRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 22V-679: ESP control-unit damage',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V679-8401.PDF',
    localPath: 'C:/tmp/mercedes-glb-sources/22V679.pdf', pages: 3,
    visualPages: [1, 2, 3], bytes: 243102,
    sha256: 'd4c9db9d31aae97d9eacce9034d19d4943de028559a9941a2775a8957f397cab',
  },
  carrierRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 21V-990: integral-carrier corrosion',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V990-1911.PDF',
    localPath: 'C:/tmp/mercedes-glb-sources/21V990.pdf', pages: 4,
    visualPages: [1, 2, 3], bytes: 216081,
    sha256: '49c53101fe087b3e0870eebdfaa103d36694f12b69d6c62f21cb1e6331be15cb',
  },
  cameraRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 22V-232: rearview-camera software',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V232-5291.PDF',
    localPath: 'C:/tmp/mercedes-glb-sources/22V232.pdf', pages: 15,
    visualPages: [11, 13, 15], bytes: 237416,
    sha256: '5a0d4a1784a906cfa249c42dd63888f0ceef7bf54f484dd43917832c7f93c7eb',
  },
  waterRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 20V-246: front-footwell water intrusion',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V246-4550.PDF',
    localPath: 'C:/tmp/mercedes-glb-sources/20V246.pdf', pages: 3,
    visualPages: [1, 2, 3], bytes: 214171,
    sha256: '538740a6f421da8aa903487e4ac519c7af0c870327d37d60704ae323652fda43',
  },
  valveWarranty: {
    title: 'Mercedes-Benz warranty notice: GLB exhaust-valve guide/seat-ring wear',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10241534-0001.pdf',
    localPath: 'C:/tmp/mercedes-glb-sources/10241534.pdf', pages: 3,
    visualPages: [1, 2], bytes: 199959,
    sha256: 'd480fd776cfddf0ed605334df9308af8f85ac9b2f3d3af44300686013250a86a',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 3, '2020-2024': 317, '2025-2026': 267 },
  totalRows: 587, relevantRowCount: 256, uniqueRelevantCommunications: 124,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 875 },
  totalRows: 875, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.carbon]: {
    description: 'The reviewed Mercedes-Benz GLB manufacturer-communication and recall corpus does not establish the frozen carbon-buildup identity across M260 and M282 engines. Direct injection by itself is not evidence of excessive intake-valve deposits, a shared 2020-2024 defect, the stored progression or a universal cleaning interval. The U.S. corpus also does not establish the frozen GLB 180 and GLB 200 market applicability. Absence from this corpus is not proof that deposits cannot occur; exact market- and engine-specific Mercedes evidence is required.',
    solution: 'Preserve fault codes and fuel-trim, compression, leakage and misfire data. Check ignition, injection, air leaks, software and mechanical sealing before inspecting intake deposits with a borescope. Do not buy a walnut-blasting service, intake cleaner, valve, injector or cylinder head from this page; neither the cause nor a universal retail remedy is established.',
    symptoms: ['engine and market confirmed', 'misfire and mixture data preserved', 'ignition, fueling, sealing and deposits separated'],
    affectedSystems: ['air intake', 'fuel and ignition', 'engine mechanical sealing'],
    conflict: 'No exact reviewed primary source supports the frozen multi-engine carbon-buildup identity or full market scope.',
    evidence: ['No exact GLB communication identifies intake-valve carbon buildup as the cause.', 'Direct-injection architecture alone cannot establish prevalence or a defect.', 'The M282 and non-U.S. trim scope needs market-specific primary evidence.'],
    summary: 'Held the unsupported multi-engine carbon-buildup identity and replaced generic cleaning advice with diagnostic boundaries.', sources: ['datasets'],
  },
  [IDS.ecall]: {
    description: 'Recall 22V365 directly supports a communication-module SIM software error that can disable manual and automatic emergency calls without a warning. Its population tables list 945 model-year 2020-2021 GLB 250 vehicles and 26 model-year 2021 AMG GLB 35 vehicles. Those are recall populations, not owner reports. The frozen page also claims model-year 2022 applicability, which the Part 573 population does not support, so its immutable year scope exceeds the exact recall.',
    solution: 'Check the VIN for recall 22V365. Eligible vehicles receive the communication-module software update over the air when possible, or from an authorized Mercedes-Benz dealer if the remote update does not complete. Do not buy a SIM, communication module, antenna or telematics unit from this page; eligibility and any hardware diagnosis are VIN-specific.',
    symptoms: ['VIN checked for recall 22V365', 'emergency-call availability checked', 'software status documented'],
    affectedSystems: ['communication module', 'manual and automatic emergency call', 'mobile-network connection'],
    conflict: '22V365 covers 2020-2021 GLB 250 and 2021 AMG GLB 35 populations, not the frozen 2022 model year.',
    evidence: ['Rendered page 13 lists the exact GLB populations and years.', 'Rendered page 19 identifies the SIM software error, disabled eCall functions and absence of warning.', 'Rendered page 28 prescribes OTA software or a dealer update if OTA fails.'],
    summary: 'Bounded recall 22V365 to its exact GLB populations and held the overbroad frozen year scope.', sources: ['ecallRecall'],
  },
  [IDS.esp]: {
    description: 'Recall 22V679 directly covers four model-year 2021 GLB 250 vehicles whose ESP control units may have been mechanically damaged during logistics. Moisture can enter the unit and disable functions including anti-lock braking and electronic stability control; a thermal event also cannot be ruled out. Warning messages or lamps may appear when the condition occurs. The four-vehicle recall population is not an owner-report count.',
    solution: 'Check the VIN for recall 22V679 and have an authorized Mercedes-Benz dealer replace the affected ESP control unit with the approved spare when eligible. Do not buy an ESP/ABS control unit from this page; recall eligibility, programming and fitment are VIN-specific.',
    symptoms: ['VIN checked for recall 22V679', 'ABS/ESC warnings documented', 'ESP control-unit recall eligibility confirmed'],
    affectedSystems: ['ESP control unit', 'anti-lock braking', 'electronic stability control'],
    conflict: null,
    evidence: ['Rendered page 1 lists four model-year 2021 GLB 250 vehicles.', 'Rendered page 2 identifies logistics damage, moisture entry and loss of ABS/ESC functions.', 'Rendered page 3 identifies replacement of A1779008005 with the approved spare A1779008105.'],
    summary: 'Retained the exact 22V679 identity while removing unsupported prevalence and universal parts advice.', sources: ['espRecall'],
  },
  [IDS.carrier]: {
    description: 'Recall 21V990 directly covers 21,219 model-year 2020 GLB 250 vehicles whose front-axle integral carrier may have insufficient corrosion protection. After several years and under specific environmental influences, corrosion may impair structural durability or connections to other components, potentially affecting steering and increasing crash risk. The recall reported no warning inherent to the failure mechanism and no field complaints at the time; 21,219 is a recall population, not an owner-report total.',
    solution: 'Check the VIN for recall 21V990. An authorized Mercedes-Benz dealer will inspect the integral carrier and replace it if necessary. Do not buy a carrier, axle assembly or related hardware from this page; eligibility, inspection outcome and the correct part are VIN-specific.',
    symptoms: ['VIN checked for recall 21V990', 'front-axle carrier inspected for corrosion', 'steering or structural concerns treated as safety-critical'],
    affectedSystems: ['front-axle integral carrier', 'steering connection', 'front structure'],
    conflict: null,
    evidence: ['Rendered page 1 lists 21,219 model-year 2020 GLB 250 vehicles.', 'Rendered page 2 identifies insufficient corrosion protection and possible steering impact.', 'Rendered page 3 prescribes dealer inspection and replacement if necessary.'],
    summary: 'Retained the exact 21V990 identity and converted recall-population language into a VIN-specific safety remedy.', sources: ['carrierRecall'],
  },
  [IDS.valve]: {
    description: 'Mercedes-Benz extended the exhaust-valve-system warranty to 15 years or 150,000 miles for certain model-year 2020-2022 GLB 250, GLB 250 4MATIC and AMG GLB 35 vehicles. The notice identifies valve-guide and/or seat-ring wear from increased lateral forces, which can cause cylinder misfires and an illuminated malfunction indicator lamp. Manufacturer communication 11028267 separately identifies a leaking valve seat, requires cylinder leakage testing and calls for complete cylinder-head replacement only when valve-seat damage is confirmed. Coverage and parts are VIN-specific; neither document establishes a universal manufacturing defect, owner-frequency rate or automatic cylinder-head replacement.',
    solution: 'Preserve codes and perform the Mercedes cylinder-leakage procedure to identify whether leakage is at an intake or exhaust valve. Check the VIN in NetStar/VMI for extended-warranty coverage. Replace the complete cylinder head only if valve-seat damage is confirmed under the applicable procedure. Do not buy a cylinder head, valves, guides or timing parts from this page; coverage and parts must be determined by VIN.',
    symptoms: ['misfire and mixture faults preserved', 'cylinder leakage measured and located', 'VIN checked for extended-warranty coverage'],
    affectedSystems: ['exhaust valves', 'valve guides and seat rings', 'cylinder head'],
    conflict: null,
    evidence: ['Rendered warranty page 1 identifies guide/seat-ring wear, misfire and exact 2020-2022 GLB sales designations.', 'Rendered page 2 requires VMI coverage confirmation and VIN-derived parts.', 'Communication 11028267 requires leakage testing and head replacement only after valve-seat damage is confirmed.'],
    summary: 'Retained the exact M260 valve-seat/guide identity with test-first, VIN-specific warranty and parts boundaries.', sources: ['valveWarranty', 'datasets'],
  },
  [IDS.camera]: {
    description: 'Recall 22V232 directly covers 15,787 model-year 2020-2021 GLB 250 vehicles and 177 model-year 2021 AMG GLB 35 vehicles whose rearview-camera software may fail to show the required image after reverse is selected. The center display may instead retain the previous image or show a black screen with an inoperability message; the recall explicitly says the rearview image does not deactivate or freeze. These population counts are not owner reports.',
    solution: 'Check the VIN for recall 22V232. An authorized Mercedes-Benz dealer will inspect the installed rearview-camera software and update it when necessary. Do not buy a camera, display or control module from this page; recall eligibility and any hardware diagnosis are VIN-specific.',
    symptoms: ['VIN checked for recall 22V232', 'black screen and retained prior image documented', 'software version checked'],
    affectedSystems: ['rearview-camera software', 'central display', 'rear visibility'],
    conflict: null,
    evidence: ['Rendered page 11 lists the exact GLB 250 and AMG GLB 35 populations.', 'Rendered page 13 describes a black screen or retained existing image and explicitly rules out freezing.', 'Rendered page 15 prescribes software inspection and update when necessary.'],
    summary: 'Retained the exact 22V232 identity and distinguished failure to display from a frozen camera image.', sources: ['cameraRecall'],
  },
  [IDS.water]: {
    description: 'Recall 20V246 directly covers 26 model-year 2020 GLB 250 vehicles whose body seam in the wheel-well area may allow water into the front footwells. Water can damage control units, causing the instrument cluster display to fail, an engine no-start or an engine stall. The 26-vehicle population is not an owner-report count, and the recall does not establish that every water leak shares this path.',
    solution: 'Check the VIN for recall 20V246. An authorized Mercedes-Benz dealer will seal the affected body area, inspect the front footwells for water and complete necessary repairs if intrusion is confirmed. Do not buy body seals, control units or wiring from this page; eligibility, damage and parts are VIN-specific.',
    symptoms: ['VIN checked for recall 20V246', 'front footwells inspected for water', 'cluster, no-start or stall symptoms documented'],
    affectedSystems: ['body seam and front footwells', 'instrument cluster', 'footwell control units'],
    conflict: null,
    evidence: ['Rendered page 1 lists 26 model-year 2020 GLB 250 vehicles and the exact water path and consequences.', 'Rendered page 2 documents the lack of advance warning.', 'Rendered page 3 prescribes sealing, inspection and necessary repair.'],
    summary: 'Retained the exact 20V246 identity with the correct 26-vehicle population and VIN-specific dealer remedy.', sources: ['waterRecall'],
  },
  [IDS.dct]: {
    description: 'The reviewed GLB corpus does not establish the frozen 8G-DCT shudder identity across model years 2020-2025. The stored engine label says M282 even though the frozen GLB 250 application uses a different engine family. Communication 11022045 is a generic information-request process for complaints involving 724.1 transmissions; it does not identify shudder, a failed clutch or a universal remedy. Communication 11026832 says connector oil residue from production testing is non-conductive, causes no impairment and requires no parts. Neither supports the stored driver-adaptation mechanism, mileage range, fluid interval, repair price or 800-owner count.',
    solution: 'Record the exact operating conditions and preserve transmission, engine and voltage faults. Confirm the VIN, engine and transmission code, then separate software, adaptation, clutch, hydraulic, mount and engine-running causes. Do not buy a clutch pack, mechatronics unit, transmission, mount or fluid kit from this page; the identity and fitment are unresolved.',
    symptoms: ['VIN, engine and transmission code confirmed', 'shudder operating conditions reproduced', 'software, clutch, hydraulic and engine paths separated'],
    affectedSystems: ['8-speed dual-clutch transmission', 'transmission control', 'engine and driveline'],
    conflict: 'No exact reviewed source supports the frozen shudder identity, and the immutable M282 engine label conflicts with the GLB 250 application.',
    evidence: ['11022045 is an information-request process, not proof of a shudder mechanism.', '11026832 explicitly says production-test oil residue causes no impairment and needs no parts.', 'No source supports the stored 800-owner total.'],
    summary: 'Held the engine-mismatched 8G-DCT identity and removed unsupported mechanism, service, price and owner-count claims.', sources: ['datasets'],
  },
  [IDS.mbux]: {
    description: 'Mercedes communications support narrower multimedia failures but not the frozen generic MBUX-freeze identity across model years 2020-2025. Communications 11014593, 11015813 and 11016159 concern a completely inoperative multimedia system with a red diagnostic box and prescribe software paths. Communication 11011544 covers specific display complaints and requires software, wiring and display diagnosis rather than automatic replacement. Recall 22V232 explicitly says its rearview-camera condition is not a frozen image. None establishes the stored CarPlay, voice-control, heat, low-voltage and module-replacement bundle or 600-owner count.',
    solution: 'Document the exact failed function, screen state, software version, voltage history and stored faults. Follow the symptom- and VIN-specific Mercedes software, wiring and display path. Check recall eligibility separately when a reverse-camera image is missing. Do not buy a display, head unit, controller, battery or camera from this page; the failed path and fitment are not established.',
    symptoms: ['exact failed multimedia function documented', 'software and voltage state recorded', 'display, wiring and control paths separated'],
    affectedSystems: ['MBUX multimedia system', 'central display', 'software and wiring'],
    conflict: 'Exact records cover narrower inoperative-system and display symptoms, not a single 2020-2025 freeze identity.',
    evidence: ['11014593/11015813/11016159 cover a red-box system-inoperative condition.', '11011544 requires symptom-specific software and hardware diagnosis.', 'No source supports the stored 600-owner total or combined mechanism.'],
    summary: 'Held the bundled MBUX-freeze identity and replaced unsupported cause and replacement claims with symptom-specific diagnosis.', sources: ['datasets'],
  },
  [IDS.roof]: {
    description: 'The reviewed GLB corpus does not establish the frozen 2020-2025 panoramic-sunroof-creak identity. Communication 11032700 concerns wind noise at the upper windshield or roof lip and a sealing-lip inspection; it is not a panoramic-roof creak or popping condition. No exact communication supports the stored temperature/torsion mechanism, lubricant and felt remedies, cassette replacement, repair price or 400-owner count. Windshield or roof-edge noise cannot be relabeled as a sunroof defect.',
    solution: 'Reproduce the sound and document whether it comes from the movable glass, shade, seal, headliner, windshield edge or body structure. Inspect and road-test the exact source before applying any material. Do not buy lubricant, felt tape, seals, glass or a roof cassette from this page; the condition and fitment are not established.',
    symptoms: ['noise location isolated', 'temperature and body-twist conditions documented', 'glass, shade, seal and windshield-edge paths separated'],
    affectedSystems: ['panoramic roof', 'roof seals and trim', 'windshield-to-roof interface'],
    conflict: 'No exact reviewed source supports panoramic-roof creak; the closest record is a different windshield/roof-edge wind-noise condition.',
    evidence: ['11032700 concerns wind noise and a sealing lip, not sunroof creak.', 'No source supports a cassette-replacement identity or the stored 400-owner count.', 'The frozen 2020-2025 scope remains unverified.'],
    summary: 'Held the unsupported panoramic-roof-creak identity and removed unrelated wind-noise and universal remedy claims.', sources: ['datasets'],
  },
});

function sourceFor(key) { return PDF_SOURCES[key] || OTHER_SOURCES[key]; }
function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = sourceFor(key); return { url: source.url, type: source.type, title: source.title }; }); }
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function commerceDecisionFor(id) {
  const values = {
    [IDS.carbon]: 'engine and cause require diagnosis; no universal retail part',
    [IDS.ecall]: 'recall eligibility and telematics diagnosis are VIN-specific; no universal retail part',
    [IDS.esp]: 'recall eligibility, programming and fitment are VIN-specific; no universal retail part',
    [IDS.carrier]: 'recall eligibility and inspection outcome are VIN-specific; no universal retail part',
    [IDS.valve]: 'warranty coverage, damage confirmation and parts are VIN-specific; no universal retail part',
    [IDS.camera]: 'recall eligibility and software/hardware diagnosis are VIN-specific; no universal retail part',
    [IDS.water]: 'recall eligibility, damage and parts are VIN-specific; no universal retail part',
    [IDS.dct]: 'transmission identity and fitment are unresolved; no universal retail part',
    [IDS.mbux]: 'multimedia failure path and fitment are unresolved; no universal retail part',
    [IDS.roof]: 'roof-noise source and fitment are unresolved; no universal retail part',
  };
  return values[id];
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before); delete frozen.id;
  return {
    ...frozen, description: content.description, solution: content.solution,
    confidence: RETAIN_IDS.includes(before.id) ? 'high' : 'low', symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null,
    estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(before.id), communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(before.id) ? 0 : before.reportCount,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLB').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 10 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen GLB coverage does not match the 10-row adjudication contract');
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    const retained = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained, identityConflict: CONTENT[record.id].conflict,
      reason: retained ? 'Exact primary evidence supports the frozen identity while narrower scope and remedy boundaries replace unsupported generalizations.' : 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'GLB',
    completionStatement: 'All 10 frozen GLB pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Five identities or frozen applicability fields materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 10 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 800-, 600- and 400-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or VIN-specific dealer/recall boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'glb-five-identities-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact recall or manufacturer evidence supports five frozen identities with VIN-specific remedies.' },
      { code: 'glb-five-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Five titles or frozen applicability sets exceed exact primary evidence.' },
      { code: 'glb-ecall-year-conflict', severity: 'scope-conflict', recordIds: [IDS.ecall], detail: '22V365 covers 2020-2021 GLB populations, not frozen model year 2022.' },
      { code: 'glb-dct-engine-conflict', severity: 'identity-conflict', recordIds: [IDS.dct], detail: 'The frozen M282 engine label conflicts with the GLB 250 application and no exact shudder source exists.' },
      { code: 'glb-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 800-, 600- and 400-owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-glb-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No GLB page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 5, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 3, total: 10 },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS,
  RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor,
  commerceDecisionFor, proposalFor,
};
