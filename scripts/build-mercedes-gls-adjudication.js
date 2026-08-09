/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-gls-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  ground: 'mercedes-benz-gls-48v-ground-connection-overheating-fire-risk',
  transfer: 'mercedes-benz-gls-4matic-transfer-case-bearing-wear-whine-drivetrain-lock-up-r',
  stall: 'mercedes-benz-gls-engine-stall-from-transmission-control-unit-software',
  oil: 'mercedes-benz-gls-m256-engine-excessive-oil-consumption-piston-ring-wear',
  mbux: 'mercedes-benz-gls-mbux-infotainment-freezing-black-screen-random-reboots',
  fuelPump: 'mercedes-benz-gls-om656-diesel-cp4-high-pressure-fuel-pump-sensitivity-injecto',
  emissions: 'mercedes-benz-gls-om656-diesel-emissions-system-clogging-limp-mode',
  battery: 'mercedes-gls-48v-battery-drain-2020',
  harshShift: 'mercedes-gls-9g-tronic-harsh-shift-2017',
  airmatic: 'mercedes-gls-air-suspension-failure-2017',
  sunroof: 'mercedes-gls-panoramic-sunroof-water-leak-2020',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.stall]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.airmatic, IDS.battery, IDS.harshShift, IDS.sunroof].sort());
const MODEL_ALIASES = Object.freeze([
  'GLS', 'GLS-CLASS', 'GLS CLASS', 'GLS450', 'GLS 450', 'GLS550', 'GLS 550',
  'GLS580', 'GLS 580', 'GLS600', 'GLS 600', 'GLS63 AMG', 'GLS 63 AMG',
  'AMG GLS63', 'AMG GLS 63', 'MAYBACH GLS600', 'MAYBACH GLS 600',
]);
const SEARCH_TERMS = Object.freeze([
  '48V', 'ground', 'overheat', 'fire', 'transmission', 'control unit', 'stall', '9G',
  'shift', 'transfer case', 'bearing', 'whine', 'lock', 'M256', 'oil consumption',
  'piston', 'ring', 'MBUX', 'infotainment', 'black screen', 'reboot', 'OM656', 'CP4',
  'fuel pump', 'injector', 'EGR', 'DPF', 'AdBlue', 'SCR', 'limp', 'battery', 'drain',
  'AIRMATIC', 'air suspension', 'compressor', 'sunroof', 'water leak', 'drain tube',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10189404', '10207187', '10208671', '10222468', '10225802', '10225816',
  '10232318', '10248203', '10251118', '10251122', '11005331', '11008093',
  '11010455', '11010667', '11025100', '11028270', '11029087', '11029927',
]);
const CAMPAIGNS = Object.freeze([
  '16V903000', '17V077000', '17V079000', '17V241000', '17V655000', '17V816000',
  '18V272000', '18V539000', '19V587000', '19V709000', '19V787000', '20V089000',
  '20V172000', '20V329000', '20V626000', '21V057000', '21V058000', '21V071000',
  '21V072000', '21V288000', '21V354000', '21V818000', '21V832000', '21V961000',
  '22V231000', '22V232000', '22V365000', '22V466000', '22V680000', '22V732000',
  '22V936000', '23V177000', '23V178000', '23V445000', '23V880000', '24V118000',
  '24V207000',
]);
const PDF_SOURCES = Object.freeze({
  stallRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 24V-118: GLS 450 TCU software stall',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V118-9551.PDF',
    localPath: 'C:/tmp/mercedes-gls-sources/24V118.pdf', pages: 4,
    visualPages: [1, 2, 3, 4], bytes: 216220,
    sha256: '651090dd2e65cab17fa845453a8b0a65a8d78e5c87dadd94940918cb51ff3599',
  },
  groundRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 24V-207: 48V ground connection',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V207-4244.PDF',
    localPath: 'C:/tmp/mercedes-gls-sources/24V207.pdf', pages: 6,
    visualPages: [1, 2, 3, 4, 5, 6], bytes: 219970,
    sha256: 'ce8a75837e72ba360e5a90475b0d28f8a5ac66ff97d411ab3eb4e6b3f7f96763',
  },
  mbuxRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 21V-354: MBUX black screen and reboot',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V354-3558.PDF',
    localPath: 'C:/tmp/mercedes-gls-sources/21V354.pdf', pages: 18,
    visualPages: Array.from({ length: 18 }, (_, index) => index + 1), bytes: 239671,
    sha256: '89a3b7779d151237cdcfacbd7ba881388cb97d0d3ecb092e2d0a8a7e8844f095',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: {
    '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 6,
    '2015-2019': 47, '2020-2024': 701, '2025-2026': 804,
  },
  totalRows: 1558, relevantRowCount: 1194, uniqueRelevantCommunications: 303,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 3034 },
  totalRows: 3034, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const CONTENT = Object.freeze({
  [IDS.ground]: {
    sources: ['groundRecall', 'datasets'],
    description: 'Recall 24V207 establishes a loose 48V ground connection under the passenger seat that can increase resistance, overheat and create a fire risk. Its GLS population is 2019-2023 GLS 450, 2020-2023 GLS 580, and 2021-2023 Maybach GLS 600 and AMG GLS 63. The frozen page lists only GLS 450/580 trims and extends through 2024, so its indexed applicability cannot be treated as an exact recall population.',
    solution: 'Check the VIN for open recall 24V207. For an affected vehicle, an authorized Mercedes-Benz dealer checks and corrects the ground-connection bolting at no charge. Do not buy the listed nut, stud or a replacement cable from this page; recall inclusion and remedy are VIN-specific.',
    symptoms: ['48V warning messages documented', 'VIN recall status checked', 'ground connection inspected only under the recall procedure'],
    affectedSystems: ['48V ground connection', 'ground cable lug and bolting', '48V onboard power supply'],
    conflict: 'The recall-backed mechanism is exact, but frozen 2020-2024 GLS 450/580 applicability omits recalled trims and includes unsupported GLS model-year 2024.',
    evidence: ['24V207 supports loose under-seat ground bolting, increased resistance, heat and fire risk.', 'The GLS recall populations end at model year 2023.', 'The 116,020 total is the full multi-model recall population, not owner reports.'],
    summary: 'Preserved the recall identity but held the frozen scope, replacing secondary-source claims with the exact Part 573 population and dealer remedy.',
  },
  [IDS.transfer]: {
    sources: ['datasets'],
    description: 'Mercedes communications 11005331, 11010455, 11025100 and 11028270 support a variable-transfer-case condition in which modified oil quality can cause light-load vibration or jolting. They prescribe fault checks, an isolation test and, when indicated, a transfer-case oil change and calibration. They do not establish bearing wear, speed-dependent whine, metal contamination of the transmission, tire-mismatch causation, drivetrain lock-up or sudden loss of drive across the frozen 2020-2025 population.',
    solution: 'Record load, speed, temperature, vibration and noise and preserve all drivetrain faults. Confirm the variable transfer-case hardware, check transmission oil level, and follow the Mercedes isolation and transfer-case oil procedure when applicable. Do not buy bearings, seals, a transfer-case assembly or a fluid kit from this page; the frozen hardware-failure identity and fitment are unresolved.',
    symptoms: ['load, speed and temperature documented', 'drivetrain faults preserved', 'oil-quality and mechanical paths separated'],
    affectedSystems: ['variable transfer case', 'transfer-case oil and clutch control', 'adjacent transmission and driveline'],
    conflict: 'Exact Mercedes evidence concerns modified oil quality and vibration, not frozen bearing wear, whine or lock-up.',
    evidence: ['11005331/11010455/11025100/11028270 identify modified transfer-case oil quality.', 'The exact complaint is light-load vibration or jolting that can resemble a harsh shift.', 'No exact source supports bearing wear, transmission contamination or drivetrain lock-up.'],
    summary: 'Held the unsupported bearing/lock-up identity and bounded the exact variable-transfer-case oil-quality evidence.',
  },
  [IDS.stall]: {
    sources: ['stallRecall', 'datasets'],
    description: 'Recall 24V118 covers model-year 2020-2023 GLS 450 vehicles equipped with the six-cylinder gasoline engine and nine-speed transmission. If a 7th-to-6th downshift is not completed during slight braking while other conditions coincide, including low transmission-oil temperature and 48V recuperation, the engine can stall and propulsion can be lost. Steering and braking remain functional, and the engine can be restarted after the vehicle stops. The 105,071 total is the combined GLE 450 and GLS 450 recall population, not owner reports.',
    solution: 'Check the VIN for open recall 24V118. An authorized Mercedes-Benz dealer updates the transmission control-unit software at no charge. Do not buy a transmission controller or software part from this page; the remedy is VIN-specific dealer programming.',
    symptoms: ['stall during slight braking or deceleration', 'loss of propulsion after an incomplete 7th-to-6th downshift', 'engine restart possible after stopping'],
    affectedSystems: ['transmission control-unit software', '9-speed downshift control', '48V recuperation coordination'],
    conflict: null,
    evidence: ['24V118 identifies 72,763 model-year 2020-2023 GLS 450 vehicles.', 'The Part 573 report states the exact downshift, braking, temperature and recuperation conditions.', 'The remedy is a dealer transmission-control software update.'],
    summary: 'Retained the exact recall identity and replaced secondary-source wording with the bounded Part 573 mechanism, risk and dealer remedy.',
  },
  [IDS.oil]: {
    sources: ['datasets'],
    description: 'The reviewed GLS corpus contains no exact Mercedes communication or recall establishing M256 piston-ring or cylinder wear as a recurring oil-consumption cause on model-year 2020-2024 GLS 450 vehicles. The frozen page infers internal wear from oil loss without visible leakage and adds a roughly 60,000-mile pattern, a one-quart-per-1,000-mile threshold and likely engine disassembly without primary support.',
    solution: 'Measure oil use over a documented interval using the correct Mercedes procedure and first inspect for external leaks, crankcase-ventilation faults and intake or turbocharger oil paths. If consumption remains abnormal, use compression, leak-down and borescope findings to distinguish rings, cylinders and valve sealing. Do not buy piston rings or a short block from this page; the cause and engine fitment are unresolved.',
    symptoms: ['measured oil-consumption rate documented', 'external and ventilation paths inspected', 'internal sealing tested before parts selection'],
    affectedSystems: ['M256 lubrication system', 'crankcase ventilation', 'piston, cylinder and valve sealing'],
    conflict: 'No exact reviewed primary source supports the frozen piston-ring-wear identity, mileage pattern or repair threshold.',
    evidence: ['Targeted M256 oil-consumption, piston-ring and cylinder-wear searches returned no exact GLS communication.', 'No exact recall supports the frozen identity.', 'Repair thresholds and engine-disassembly claims remain unsupported.'],
    summary: 'Held the unsupported M256 piston-ring identity and replaced inferred diagnosis with a measured oil-consumption workflow.',
  },
  [IDS.mbux]: {
    sources: ['mbuxRecall', 'datasets'],
    description: 'Recall 21V354 establishes a narrow MBUX software noncompliance on model-year 2020-2021 GLS 450 and GLS 580 and model-year 2021 Maybach GLS 600 and AMG GLS 63 vehicles. Under specific conditions, MBUX may remain black at startup or reboot about 50 seconds later, interrupting the rearview-camera image. The frozen 2020-2025 scope and broader freezing, flickering, climate-control and recurring-update narrative are not established by that recall.',
    solution: 'Check the VIN for recall 21V354 and confirm software-update status; affected vehicles receive a dealer or over-the-air update at no charge. For other symptoms, record the exact display, function and timing and diagnose the head unit and software version before replacement. Do not buy a head unit or display from this page; recall coverage and the failed path are not universal.',
    symptoms: ['black display at startup documented', 'reboot timing documented', 'rearview-camera interruption separated from other MBUX faults'],
    affectedSystems: ['MBUX multimedia software', 'central display', 'rearview-camera display path'],
    conflict: 'The exact recall covers limited 2020-2021 GLS populations and black/reboot behavior, not the frozen 2020-2025 all-symptom identity.',
    evidence: ['21V354 identifies GLS 450/580 for 2020-2021 and Maybach/AMG GLS for 2021.', 'It supports black startup and an unintended reboot about 50 seconds after initialization.', 'It does not establish all frozen years, freezing, flicker or climate-control loss.'],
    summary: 'Held the overbroad MBUX identity while preserving exact recall-backed black-screen, reboot and rearview-camera boundaries.',
  },
  [IDS.fuelPump]: {
    sources: ['datasets'],
    description: 'The reviewed U.S. GLS manufacturer-communication and recall corpus contains no exact record establishing Bosch CP4 pump wear, metallic debris or injector damage on model-year 2020-2025 OM656-powered GLS 350d or GLS 400d vehicles. Those diesel variants are outside the U.S. GLS evidence population reviewed here, so fuel-quality sensitivity, Europe-wide prevalence and a universal whole-system replacement cannot be asserted from this source set.',
    solution: 'Preserve fuel-pressure, rail-pressure, injector-correction and contamination findings and verify the exact OM656 market specification by VIN. If debris is present, follow the market-specific Mercedes fuel-system procedure before selecting components. Do not buy a high-pressure pump, injectors, lines or filters from this page; the condition and regional fitment are unresolved.',
    symptoms: ['market and engine specification verified', 'rail pressure and correction values preserved', 'contamination documented before parts selection'],
    affectedSystems: ['OM656 high-pressure fuel system', 'fuel injectors and rail', 'fuel filtration'],
    conflict: 'No exact reviewed primary source supports the frozen OM656 CP4 damage identity or European scope.',
    evidence: ['Targeted OM656, CP4, high-pressure-pump and metallic-debris searches returned no exact GLS communication.', 'The reviewed U.S. recall corpus provides no matching campaign.', 'A regional diesel claim cannot be inferred from unrelated U.S. GLS records.'],
    summary: 'Held the unsupported OM656 CP4 identity and made the regional evidence limitation explicit.',
  },
  [IDS.emissions]: {
    sources: ['datasets'],
    description: 'The reviewed U.S. GLS corpus does not establish one combined EGR, DPF, AdBlue/SCR clogging identity for model-year 2020-2025 OM656 GLS 350d/400d vehicles. Older U.S. diesel-emissions materials concern different vehicles and engines. The frozen DTC list, short-trip and fuel-quality causes, differential-pressure-sensor example and universal regeneration or replacement advice therefore cannot be applied to this population as one proven defect.',
    solution: 'Verify the exact market, engine and emissions configuration by VIN and preserve all current fault codes and freeze-frame data. Diagnose EGR flow, exhaust pressure and temperature sensing, DPF loading and regeneration history, and SCR/AdBlue dosing separately under market-specific Mercedes procedures. Do not buy an EGR valve, pressure sensor, DPF or SCR part from this page; the failed subsystem and fitment are unresolved.',
    symptoms: ['market and emissions configuration verified', 'fault codes and freeze-frame data preserved', 'EGR, DPF and SCR paths diagnosed separately'],
    affectedSystems: ['OM656 EGR system', 'diesel particulate filter', 'SCR and AdBlue dosing'],
    conflict: 'No exact reviewed primary source supports the frozen combined OM656 emissions identity, years or stored DTC set.',
    evidence: ['No exact model-year 2020-2025 OM656 GLS communication supports the combined identity.', 'Older diesel-emissions records do not establish this population.', 'Generic DTCs and one forum account cannot prove one recurring multi-system failure.'],
    summary: 'Held the unsupported combined OM656 emissions identity and separated the diagnostic paths without guessing a failed part.',
  },
  [IDS.battery]: {
    sources: ['datasets'],
    description: 'Mercedes communications 10225802 and 10232318 support limited model-year 2021 48V battery-management software campaigns involving warning messages, reduced output, no-start and OBD monitoring. Other exact GLS records identify several distinct software, hardware and battery-abnormality paths. They do not establish the frozen claim that parked vehicles fail to enter sleep mode and drain both the 48V and 12V batteries across model years 2020-2025, nor do they support the stored DTC set or battery prices.',
    solution: 'Record the exact warning and no-start state, run the Mercedes guided tests, preserve 48V battery and DC/DC converter faults, and measure the 12V quiescent draw before selecting a remedy. Apply a VIN- and fault-specific software campaign when applicable. Do not buy a 12V or 48V battery from this page; software, hardware, state-of-charge and parasitic-draw paths must be separated first.',
    symptoms: ['warning and no-start state documented', '48V and DC/DC faults preserved', '12V quiescent draw measured separately'],
    affectedSystems: ['48V battery management', 'DC/DC converter', '12V power supply and quiescent draw'],
    conflict: 'Exact records support several limited no-start and software paths, not the frozen parked sleep-mode drain of both batteries.',
    evidence: ['10225802/10232318 are limited model-year 2021 software campaigns.', '10222468/10225816/11029087 list multiple distinct fault-code-dependent causes.', 'No exact source supports the stored 450-owner total, DTC set or battery-price claims.'],
    summary: 'Held the unsupported dual-battery drain identity and separated software, hardware, charge-state and parasitic-draw diagnosis.',
  },
  [IDS.harshShift]: {
    sources: ['datasets'],
    description: 'The reviewed GLS corpus does not establish one 9G-Tronic low-speed harsh-shift and gear-hunting condition across model years 2017-2023. Communications 11010667, 11010669, 11014400 and 11015549 support a specific harsh 5-to-4 downshift while braking on model-year 2024 GLS 450 vehicles, outside the frozen years. Communications 11025100 and 11028270 show that variable-transfer-case oil quality can also cause jolting mistaken for a harsh shift. Neither path proves the frozen explanation that nine ratios cause hunting.',
    solution: 'Record the exact shift, load, speed, temperature and braking state and preserve transmission and transfer-case faults and adaptation data. Separate the model-year 2024 5-to-4 software/adaptation condition from transfer-case oil vibration and mechanical transmission faults. Do not buy transmission fluid, a filter or control unit from this page; the frozen condition and fitment are unresolved.',
    symptoms: ['exact shift and operating state documented', 'adaptation and fault data preserved', 'transmission and transfer-case paths separated'],
    affectedSystems: ['9G-Tronic shift control', 'transmission adaptation', 'variable transfer case'],
    conflict: 'Exact harsh-shift evidence is for model-year 2024, while other jolting evidence is transfer-case related; neither supports frozen 2017-2023 scope.',
    evidence: ['11010667/11010669/11014400/11015549 identify a model-year 2024 harsh 5-to-4 downshift.', '11025100/11028270 warn that transfer-case oil vibration may resemble a harsh shift.', 'No exact source supports the stored 1,100-owner total or nine-ratio hunting explanation.'],
    summary: 'Held the overbroad 9G-Tronic identity and separated later 5-to-4 adaptation evidence from transfer-case vibration.',
  },
  [IDS.airmatic]: {
    sources: ['datasets'],
    description: 'The reviewed GLS evidence does not establish air-spring leakage and compressor burnout from vehicle weight across model years 2017-2023. Communication 10207187 instead identifies an internal-control-unit/software condition on model-year 2020-2022 AMG GLS 63 vehicles and explicitly states that replacing the CAIRS unit does not remedy it; Mercedes prescribes an AIRMATIC software update on R24. The frozen spring, compressor, relay and aftermarket claims are unsupported.',
    solution: 'Document ride height, leak-down behavior, compressor operation and all AIRMATIC faults. Test air springs, lines, valves, power supply and control-unit software as separate paths under the VIN-specific Mercedes procedure. Do not buy air springs, a compressor, relay or CAIRS unit from this page; the exact failure path and fitment are unresolved.',
    symptoms: ['ride height and leak-down documented', 'compressor and power supply tested', 'software and pneumatic paths separated'],
    affectedSystems: ['AIRMATIC pneumatic system', 'compressor power and control', 'CAIRS control-unit software'],
    conflict: 'Exact evidence identifies a software path where CAIRS replacement does not help, not frozen spring leaks and compressor failure.',
    evidence: ['10207187 identifies an internal-control-unit fault on model-year 2020-2022 AMG GLS 63.', 'It explicitly says CAIRS replacement does not remedy the problem.', 'No exact source supports the stored 1,500-owner total, vehicle-weight mechanism or Arnott fitment.'],
    summary: 'Held the unsupported hardware-failure identity and preserved Mercedes’s explicit software and no-CAIRS-replacement boundary.',
  },
  [IDS.sunroof]: {
    sources: ['datasets'],
    description: 'The reviewed GLS corpus contains no exact Mercedes communication or recall establishing panoramic-roof drain-tube or seal leakage across model years 2020-2025. The only targeted sunroof records concern gesture-control operation, not water entry. No exact source supports the frozen drain-tube blockage, shifted weatherstrip, headliner damage or compressed-air remedy.',
    solution: 'Document the water entry point and conditions, then perform a controlled low-pressure water test while checking the roof cassette, drains, hose joints, glass alignment, seals and nearby body seams separately. Avoid forcing high-pressure air through a drain until hose routing and attachment are confirmed. Do not buy seals, drain hoses, glass or a headliner from this page; the leak path and fitment are unresolved.',
    symptoms: ['water entry point and conditions documented', 'controlled drain-flow test performed', 'cassette, seal, hose and body-seam paths separated'],
    affectedSystems: ['panoramic roof cassette', 'roof drains and hose joints', 'roof glass seals and headliner'],
    conflict: 'No exact reviewed primary source supports the frozen panoramic-roof leak identity or compressed-air remedy.',
    evidence: ['Targeted roof, water, leak, drain and headliner searches returned no exact leak communication.', '11007796/11018031 concern gesture-control operation, not water entry.', 'No exact source supports the stored 500-owner total.'],
    summary: 'Held the unsupported roof-leak identity and replaced the risky compressed-air shortcut with bounded leak-path diagnosis.',
  },
});

function sourceFor(key) { return PDF_SOURCES[key] || OTHER_SOURCES[key]; }
function citationsFor(id) {
  return CONTENT[id].sources.map((key) => {
    const source = sourceFor(key); return { url: source.url, type: source.type, title: source.title };
  });
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; }));
}
function commerceDecisionFor(id) {
  const values = {
    [IDS.ground]: 'recall inclusion and ground-connection remedy are VIN-specific; no universal retail part',
    [IDS.transfer]: 'transfer-case failure identity and hardware fitment are unresolved; no universal retail part',
    [IDS.stall]: 'recall remedy is VIN-specific dealer software programming; no universal retail part',
    [IDS.oil]: 'oil-consumption cause and M256 internal fitment are unresolved; no universal retail part',
    [IDS.mbux]: 'MBUX failure path and recall applicability are not universal; no universal retail part',
    [IDS.fuelPump]: 'OM656 fuel-system condition and regional fitment are unresolved; no universal retail part',
    [IDS.emissions]: 'OM656 emissions subsystem and regional fitment are unresolved; no universal retail part',
    [IDS.battery]: '48V/12V failure path and battery fitment are unresolved; no universal retail part',
    [IDS.harshShift]: 'shift condition and transmission remedy are unresolved; no universal retail part',
    [IDS.airmatic]: 'AIRMATIC software, pneumatic and hardware paths are unresolved; no universal retail part',
    [IDS.sunroof]: 'roof leak path and component fitment are unresolved; no universal retail part',
  };
  return values[id];
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before); delete frozen.id;
  return {
    ...frozen, description: content.description, solution: content.solution,
    confidence: before.id === IDS.stall ? 'high' : 'low', symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null,
    estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(before.id), communityRecommendations: [], fixParts: [],
    humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(before.id) ? 0 : before.reportCount,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLS')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 11 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen GLS coverage does not match the 11-row adjudication contract');
  }
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record); const proposal = proposalFor({ id: record.id, ...before });
    const retain = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retain ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retain, identityConflict: CONTENT[record.id].conflict,
      reason: retain ? 'Exact Part 573 evidence supports the frozen identity and applicability.' : 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'GLS',
    completionStatement: 'All 11 frozen GLS pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Ten identities or frozen applicability sets materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 11 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 450-, 1,100-, 1,500- and 500-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as “0+ owners” social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or VIN-specific recall boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'gls-stall-recall-retained', severity: 'recall-backed', recordIds: [IDS.stall], detail: 'Recall 24V118 exactly supports the 2020-2023 GLS 450 TCU-software stall identity and dealer update.' },
      { code: 'gls-recall-scopes-held', severity: 'scope-conflict', recordIds: [IDS.ground, IDS.mbux], detail: 'Exact recall mechanisms exist, but frozen years and trims exceed the documented GLS populations.' },
      { code: 'gls-unsupported-hardware-identities-held', severity: 'identity-hold', recordIds: [IDS.transfer, IDS.oil, IDS.fuelPump, IDS.emissions, IDS.battery, IDS.harshShift, IDS.airmatic, IDS.sunroof], detail: 'Exact sources do not establish the frozen hardware, regional, combined-system or year-range identities.' },
      { code: 'gls-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Four positive owner totals lack reviewed owner-report sources and are proposal-only zero corrections.' },
      { code: 'all-gls-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No GLS page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 10, fabricated_report_counts_proposed_zero: 4, total: 11 },
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
