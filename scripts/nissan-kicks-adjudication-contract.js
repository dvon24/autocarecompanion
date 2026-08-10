/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  ac: 'nissan-kicks-ac-weak-2018',
  cluster: 'nissan-kicks-blank-partial-instrument-cluster-cold-start',
  centerDisplay: 'nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image',
  cvtDrone: 'nissan-kicks-cvt-drone-2018',
  cvtOverheat: 'nissan-kicks-cvt-overheating-2018',
  eps: 'nissan-kicks-electric-power-steering-assist-loss-torque-sensor-weld-failu',
  engineNoise: 'nissan-kicks-engine-noise-2018',
  stalling: 'nissan-kicks-engine-stalling-shutting-off-while-driving',
  infotainment: 'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne',
  rearBrake: 'nissan-kicks-rear-drum-brake-squeal-2018',
  rearview: 'nissan-kicks-rearview-camera-image-disappears-stays-off',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.centerDisplay, ids.cluster, ids.rearview].sort());
const reportCountCleanupIds = Object.freeze([ids.ac, ids.cvtOverheat, ids.engineNoise].sort());
const relevantDocumentIds = Object.freeze([
  '10162976', '10165775', '10165778', '10165779', '10165780', '10170017',
  '10171228', '10172253', '10177212', '10179609', '10179616', '10183974',
  '10186847', '10190212', '10190217', '10199165', '10199172', '10202245',
  '10211994', '10212012', '10212021', '10213686', '10213690', '10220250',
  '10232664', '10234067', '10234078', '10234079', '10234080', '10235771',
  '10235775', '10242141', '10242148', '10249904', '10249914', '10251535',
]);
const campaigns = Object.freeze([
  '19V654000', '22V693000', '23V496000', '24V154000', '24V969000',
  '25V188000', '25V324000', '26V023000', '26V145000', '26V331000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

function retained({ description, solution, symptoms, systems, evidence, summary, citations }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    summary,
    citations,
    commerceDecision: 'an exact federal recall governs VIN-specific inspection and remedy; no universal retail part should be purchased from this page',
  });
}

const content = Object.freeze({
  [ids.ac]: held({
    description: `No air-conditioning bulletin matching the frozen NTB19-041 citation appears in the complete exact 200-row Kicks manufacturer-communication corpus. The primary record therefore does not establish an undersized compressor, a software remedy, weak performance above 90 degrees, a seven-year defect population or a universal condenser-debris cause. The frozen 380-owner total is unsupported.`,
    solution: `Measure vent temperature, ambient conditions, refrigerant pressures and charge against the exact service specification before selecting a repair. Check airflow, cabin filter, condenser condition, fan operation, compressor command and refrigerant leakage as separate paths. Do not buy a compressor, condenser, refrigerant, cabin filter, tint product or control module from this page; the measured condition, refrigerant specification, failure path and VIN fitment must be established first.`,
    symptoms: ['ambient and vent temperatures measured', 'high- and low-side refrigerant pressures recorded', 'airflow, charge, leakage and compressor-command paths separated'],
    systems: ['air-conditioning refrigerant circuit', 'condenser, compressor and cooling fan', 'cabin airflow and HVAC controls'],
    evidence: ['No matching NTB19-041 record appears in the exact Kicks communication corpus.', 'No primary source supports the frozen compressor-sizing or software-update claims.', 'No primary source substantiates the 380-owner total.'],
    conflict: 'The indexed page turns an unverified bulletin citation and unsupported prevalence claims into a seven-year A/C design-defect identity.',
    summary: 'Held the false/unverified-citation A/C identity and removed the fabricated 380-owner total.',
    citations: ['datasets'],
  }),
  [ids.cluster]: retained({
    description: `NHTSA recall 26V331 and Nissan campaign PMA66 apply to 51,598 model-year 2025-2026 Kicks vehicles produced June 24, 2024 through January 9, 2026. A combination-meter software logic error can cause communication loss between the graphic controller and automotive controller during cold start, producing a partial, blue or blank display and hiding required telltales and indicators. Nissan reported seven technical reports and 205 warranty claims, not owner-report totals.`,
    solution: `Check the VIN for 26V331/PMA66. Nissan dealers update the combination-meter software with CONSULT 4 at no charge; the Part 573 report estimates about 0.5 hour and lists July 1, 2026 as the planned owner-notification date. Do not buy a cluster, display, controller, wiring harness or software product from this page; recall eligibility and the official software remedy must be confirmed first.`,
    symptoms: ['VIN checked for 26V331/PMA66', 'cold-start partial, blue or blank cluster documented', 'cluster condition separated from battery, network and wiring faults'],
    systems: ['combination meter display unit', 'graphic and automotive controllers', 'vehicle network and required telltales'],
    evidence: ['The Part 573 report identifies 51,598 2025-2026 Kicks vehicles.', 'The exact mechanism is a combination-meter software communication failure during cold start.', 'The official remedy is CONSULT 4 software updating, not cluster replacement.'],
    summary: 'Retained the exact 26V331/PMA66 combination-meter identity and official software remedy.',
    citations: ['clusterRecall', 'recall26V331', 'datasets'],
  }),
  [ids.centerDisplay]: retained({
    description: `NHTSA recall 25V324 covers certain 2025 Kicks and Frontier vehicles with an affected Center Information Display. A software logic error can cause a communication error with the In-Vehicle Infotainment module, leaving the rearview monitor blank in reverse and reducing rearward visibility. The combined population is 79,755 vehicles; the exact Kicks production window is June 24, 2024 through March 7, 2025, and eligibility remains VIN-specific.`,
    solution: `Check the VIN for 25V324/PMA48. Nissan dealers update the Center Information Display software through CONSULT 3+ and a Nissan-provided jumper harness at no charge; the Part 573 report lists July 1, 2025 as the planned owner-notification date. Do not buy a camera, Center Information Display, IVI module, harness or software product from this page; recall eligibility and the official software remedy must be confirmed first.`,
    symptoms: ['VIN checked for 25V324/PMA48', 'blank display occurs specifically during reverse', 'software communication condition separated from camera, harness and power faults'],
    systems: ['Center Information Display', 'In-Vehicle Infotainment module', 'rearview camera display path'],
    evidence: ['The Part 573 report identifies the exact 2025 Kicks production window.', 'The defect is a CID-to-IVI software communication error.', 'The official remedy is a dealer software update rather than camera replacement.'],
    summary: 'Retained the exact 25V324/PMA48 center-display identity and official software remedy.',
    citations: ['centerDisplayRecall', 'recall25V324', 'datasets'],
  }),
  [ids.cvtDrone]: held({
    description: `Nissan NTB22-021 covers 2018-2021 Kicks P15 vehicles with the RE0F11B CVT and a specified set of stored DTCs or a confirmed judder complaint. Its 153-page diagnostic flow does not establish excessive highway drone, fixed 3,500-4,000 RPM operation, insufficient sound insulation, competitor comparisons or an eight-year defect population. The frozen TSB-18-001-21 URL and Reddit identifier are not exact primary evidence.`,
    solution: `Record road speed, engine speed, transmission temperature, DTCs, freeze-frame data and the exact noise condition before attributing sound to the CVT. Separate normal ratio response, tire and wheel noise, engine load, exhaust, mounts and internal CVT faults; use NTB22-021 only when its exact DTC or judder criteria apply. Do not buy sound-deadening material, tires, CVT fluid, a control valve or transmission from this page; the noise source, code path, measured condition and VIN fitment must be established first.`,
    symptoms: ['road speed, engine speed and CVT temperature recorded', 'DTC and judder criteria checked', 'tire, engine, exhaust, mount and internal CVT noise paths separated'],
    systems: ['RE0F11B CVT where applicable', 'engine and transmission mounts', 'tires, exhaust and cabin noise paths'],
    evidence: ['NTB22-021 is a bounded DTC and judder repair flow for 2018-2021 Kicks.', 'The bulletin does not describe highway drone or cabin sound insulation.', 'The frozen citation identifiers are not exact support for the indexed identity.'],
    conflict: 'The indexed page converts unsupported subjective noise claims into an eight-year CVT design identity and retail sound-deadening advice.',
    summary: 'Held the unsupported CVT-drone identity and bounded NTB22-021 to its exact DTC and judder criteria.',
    citations: ['cvtBulletin', 'datasets'],
  }),
  [ids.cvtOverheat]: held({
    description: `Nissan NTB22-021 supports diagnosis of specified DTCs and judder on 2018-2021 Kicks with the RE0F11B CVT. It does not establish sustained-highway overheating, 40-50 mph limp mode, a Jatco CVT7 W/R identity, hot-weather or hill causation, universal 30,000-mile fluid replacement or auxiliary-cooler installation across 2018-2024. The frozen 450-owner total is unsupported.`,
    solution: `When reduced power or a transmission warning occurs, preserve DTCs and freeze-frame data and record CVT fluid temperature, fluid condition, cooling-airflow condition and the exact drive cycle. Verify the transmission designation and follow the service-manual and NTB22-021 flow only when their entry criteria apply. Do not buy NS-3 fluid, an auxiliary cooler, control valve, belt-and-pulley assembly or transmission from this page; the code path, thermal cause, fluid specification and VIN fitment must be established first.`,
    symptoms: ['DTCs, freeze-frame data and CVT temperature recorded', 'drive cycle and cooling-airflow conditions documented', 'software, fluid, control-valve, belt and unrelated engine paths separated'],
    systems: ['RE0F11B CVT where applicable', 'CVT fluid and thermal management', 'TCM, control valve and belt-and-pulley assembly'],
    evidence: ['NTB22-021 does not describe highway overheating or universal limp-speed behavior.', 'The bulletin is limited to 2018-2021 Kicks with exact DTC or judder criteria.', 'No primary source supports a 30,000-mile interval, auxiliary cooler or 450-owner total.'],
    conflict: 'The indexed page expands a bounded CVT diagnostic bulletin into a seven-year universal overheating identity and unsourced modification advice.',
    summary: 'Held the unsupported CVT-overheating identity and removed the fabricated 450-owner total.',
    citations: ['cvtBulletin', 'datasets'],
  }),
  [ids.eps]: held({
    description: `NHTSA recall 22V693 covers specific 2021 Kicks and Versa vehicles produced July 19 through September 27, 2021. Poor weld penetration at an electric-power-steering torque-sensor terminal can create an intermittent connection and disable assist while mechanical steering remains available. The official Nissan campaign identifier is PMA10; the frozen indexed title instead names PMA25/PMA26, so the otherwise supportable mechanism cannot be reconciled without an approved identity change.`,
    solution: `Check the VIN for 22V693/PMA10 and do not infer eligibility from model year alone. The official dealer remedy inspects the steering-column torque-sensor lot code and replaces the steering-column assembly only when an affected lot is found. Do not buy a steering column, torque sensor, EPS motor, control module or wiring part from this page; the frozen campaign-identity conflict, VIN eligibility and official remedy must be resolved first.`,
    symptoms: ['VIN checked for 22V693/PMA10', 'EPS warning and loss-of-assist condition documented', 'torque-sensor connection separated from power, motor, module and mechanical faults'],
    systems: ['electric power steering torque sensor', 'steering column assembly', 'EPS warning and manual steering fallback'],
    evidence: ['The Part 573 report identifies 2021 Kicks production from July 19 through September 27, 2021.', 'The exact cause is poor weld penetration at a torque-sensor terminal.', 'The official Kicks campaign is PMA10, not the PMA25/PMA26 frozen title.'],
    conflict: 'The frozen title embeds the wrong Nissan campaign identity; rewriting only the body would leave an indexed title that contradicts official evidence.',
    summary: 'Held the technically supported EPS condition because the frozen title misidentifies PMA10/22V693 as PMA25/PMA26.',
    citations: ['steeringRecall', 'recall22V693', 'datasets'],
  }),
  [ids.engineNoise]: held({
    description: `The complete exact Kicks communication and recall inventory does not establish an HR16DE excessive-noise-and-vibration defect spanning 2018-2024, a fixed 3,000-4,000 RPM highway condition, inadequate sound insulation or a dealer ECM calibration that lowers CVT cruising RPM. Noise and vibration can arise from engine load, mounts, exhaust, accessories, tires or transmission operation and require measurement rather than a universal mechanism. The frozen 310-owner total is unsupported.`,
    solution: `Record the operating state, engine speed, load, road speed, temperature and whether the condition occurs stationary or moving. Inspect mounts, exhaust contact, accessories, combustion balance, tires and transmission behavior through the applicable service procedure before selecting a repair. Do not buy engine mounts, sound-deadening material, an ECM, CVT part or accessory-drive component from this page; the noise source, measured fault and VIN fitment must be established first.`,
    symptoms: ['engine speed, load, road speed and temperature recorded', 'stationary and moving conditions compared', 'mount, exhaust, accessory, combustion, tire and CVT paths separated'],
    systems: ['HR16DE engine where applicable', 'engine and transmission mounts', 'exhaust, accessories, tires and cabin vibration paths'],
    evidence: ['No exact primary communication establishes the frozen seven-year defect identity.', 'No exact source supports an ECM update that lowers Kicks cruising RPM.', 'No primary source substantiates the 310-owner total.'],
    conflict: 'The indexed page turns subjective noise and vibration into a seven-year engine identity with unsupported calibration and prevalence claims.',
    summary: 'Held the unsupported engine-noise identity and removed the fabricated 310-owner total.',
    citations: ['datasets'],
  }),
  [ids.stalling]: held({
    description: `Nissan campaign P0A09 and NTB20-040 support a VIN-specific 2020 Kicks ECM calibration for alternator-load and idle-speed control that can, under certain conditions, cause stalling when coming to a stop. Separate communications address bounded P0101 diagnostic paths. They do not establish a universal 2018-2020 throttle-body, MAF-sensor and ECM failure identity, stalling at speed or automatic replacement of any named component.`,
    solution: `Treat an in-motion stall as a safety concern and preserve all DTCs, freeze-frame data, battery and charging measurements and the exact operating condition. Check the VIN for P0A09 and applicable software, then follow the exact service-manual path for any P0101, air-metering, throttle, fuel or power-supply evidence before replacing parts. Do not buy a throttle body, MAF sensor, ECM, gasket, alternator or fuel-system part from this page; the bounded campaign, fault path and VIN fitment must be established first.`,
    symptoms: ['stall-at-stop and stall-at-speed conditions separated', 'DTCs, freeze-frame and charging measurements preserved', 'ECM calibration, air-metering, throttle, fuel and power paths separated'],
    systems: ['engine control module and idle control', 'alternator-load calibration and charging system', 'air metering, electronic throttle and fuel delivery'],
    evidence: ['P0A09 is limited to affected MY2020 Kicks vehicles and a specific ECM calibration.', 'The campaign describes stalling when coming to a stop, not a universal at-speed condition.', 'The evidence does not prescribe automatic throttle-body or MAF replacement.'],
    conflict: 'The indexed title combines three possible components and three model years into a single causal identity that exact primary evidence does not support.',
    summary: 'Held the overbroad stalling identity and bounded P0A09/NTB20-040 to its VIN-specific 2020 calibration path.',
    citations: ['stallCampaign', 'datasets'],
  }),
  [ids.infotainment]: held({
    description: `Nissan NTB20-080 applies to 2018-2020 Kicks SV and SR and addresses stability improvements, bug fixes and Android Auto music skipping. It does not support the frozen 2021-2025 year range, Apple CarPlay disconnection identity, random-reboot prevalence or claimed NTB23-018 remedy. The frozen citations are a replacement guide and forum thread rather than exact primary evidence for those years and symptoms.`,
    solution: `Record the exact head-unit version, phone, operating system, connection method and failure mode, then test a known-good data cable and USB port before applying VIN- and hardware-specific Nissan software. Keep freezes, reboots, Android Auto, Apple CarPlay, Bluetooth, USB power and hardware faults as separate paths. Do not buy a head unit, USB port, cable, display or control module from this page; the generation, software level, failure path and VIN fitment must be established first.`,
    symptoms: ['head-unit version and phone configuration recorded', 'freeze, reboot, CarPlay, Android Auto, Bluetooth and USB paths separated', 'known-good cable and port testing documented'],
    systems: ['AV control unit and infotainment software', 'USB and phone-projection interfaces', 'display, audio and vehicle network'],
    evidence: ['NTB20-080 applies to 2018-2020 Kicks SV and SR, not the frozen 2021-2025 range.', 'It describes stability fixes and Android Auto music skipping, not the full frozen identity.', 'No exact NTB23-018 evidence supports the frozen claim.'],
    conflict: 'The indexed page assigns an earlier-generation bulletin to five later model years and merges several unproven connectivity conditions.',
    summary: 'Held the unsupported 2021-2025 infotainment identity and preserved the exact NTB20-080 boundary.',
    citations: ['infotainmentBulletin', 'datasets'],
  }),
  [ids.rearBrake]: held({
    description: `No communication matching the frozen NTB18-081 rear-brake citation appears in the complete exact 200-row Kicks corpus. The primary evidence therefore does not establish dust entrapment, semi-sealed-drum causation, poor braking, easy warping, a 0.006-inch limit or an eight-year Kicks defect population. Brake noise, grinding, pulsation and reduced performance require separate inspection because their safety implications and repair paths differ.`,
    solution: `Inspect the complete brake system using Nissan service limits and safe brake-dust procedures. Record lining thickness, drum inside diameter and runout, hardware and adjuster condition, contamination, wheel-bearing play and hydraulic operation before selecting repair; do not sand or lubricate parts from generic page instructions. Do not buy shoes, drums, hardware, cleaner, grease or wheel bearings from this page; the measured condition, exact service limit and VIN fitment must be established first.`,
    symptoms: ['noise, grinding, pulsation and braking-performance complaints separated', 'lining, drum, hardware, bearing and hydraulic measurements recorded', 'contamination and environmental conditions documented'],
    systems: ['rear drum brake assemblies where equipped', 'shoes, drums, hardware and adjusters', 'wheel bearings and hydraulic brake system'],
    evidence: ['No matching NTB18-081 record appears in the exact Kicks communication corpus.', 'No primary source supports the frozen 0.006-inch or 20,000-mile instructions.', 'The frozen Reddit citation is not exact manufacturer evidence.'],
    conflict: 'The indexed page turns an unverified bulletin and generic service advice into an eight-year rear-brake design identity with unsafe unsourced procedures.',
    summary: 'Held the false/unverified-citation rear-drum identity and replaced generic repair instructions with measurement boundaries.',
    citations: ['datasets'],
  }),
  [ids.rearview]: retained({
    description: `NHTSA recall 19V654 and Nissan campaign R1911 apply to certain 2018-2019 Kicks vehicles. The AV control-unit software can retain a driver-adjusted display setting that prevents the rearview image from returning at the start of a later reverse event, failing the rear-visibility requirement. Eligibility is VIN-specific within a broader Nissan and Infiniti population.`,
    solution: `Check the VIN for 19V654/R1911. Nissan dealers reprogram the AV control unit so the rearview image returns at the beginning of each backing event at no charge; the campaign bulletin lists a 0.2-hour operation. Do not buy a camera, AV control unit, display, wiring harness or software product from this page; recall eligibility and the official reprogramming remedy must be confirmed first.`,
    symptoms: ['VIN checked for 19V654/R1911', 'retained display-setting behavior documented', 'software condition separated from camera, display, power and wiring faults'],
    systems: ['AV control unit software', 'rearview camera display path', 'center display settings and reverse-event logic'],
    evidence: ['NTB19-093 identifies 2018-2019 Kicks and campaign R1911/19V654.', 'The condition is retained display adjustment across reverse events.', 'The official remedy is AV control-unit reprogramming, not camera replacement.'],
    summary: 'Retained the exact 19V654/R1911 rearview-camera display identity and official software remedy.',
    citations: ['rearviewRecall', 'recall19V654', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  clusterRecall: {
    title: 'NHTSA Part 573 Report 26V331 - Kicks Combination Meter Display',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V331-8971.pdf',
    sha256: 'f6eaea8a0175fa209913733ce80bdfbf315d0c5040d0f279b90fe96b399eb951',
    pageCount: 4,
    visuallyReviewedPages: [1, 3, 4],
  },
  centerDisplayRecall: {
    title: 'NHTSA Part 573 Report 25V324 - Kicks Center Information Display',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V324-2868.pdf',
    sha256: '14534bba51268acd955da3bd33764d60f2362404fa94eeb769596c84b26526e6',
    pageCount: 4,
    visuallyReviewedPages: [1, 2, 4],
  },
  steeringRecall: {
    title: 'NHTSA Part 573 Report 22V693 - Kicks EPS Torque Sensor',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V693-1375.PDF',
    sha256: '65d7d688cd52359ea77362b90933b3f86cfe6e73aae9150cd285a01d74e2d770',
    pageCount: 3,
    visuallyReviewedPages: [1, 2, 3],
  },
  rearviewRecall: {
    title: 'Nissan NTB19-093 - 19V654/R1911 Kicks AV Control Unit Recall',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2019/RCRIT-19V654-9443.pdf',
    sha256: 'd2822faca0049a7a7e9951ad3b9d787fea8baaec728483a5b89520585c724de8',
    pageCount: 10,
    visuallyReviewedPages: [1, 10],
  },
  cvtBulletin: {
    title: 'Nissan NTB22-021 - Kicks RE0F11B CVT DTC and Judder Repair Flow',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10212012-0001.pdf',
    sha256: 'ffb94151f82e77ce28617408454fccde4f610b2aff04f3d4ef7a1ae9c0984bc9',
    pageCount: 153,
    visuallyReviewedPages: [1, 2, 3, 153],
  },
  stallCampaign: {
    title: 'Nissan P0A09/NTB20-040 - 2020 Kicks ECM Reprogram Service Campaign',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10176254-0001.pdf',
    sha256: 'c3c863d9ab48fb6f6f14c29113fc1f5f60bd30dfb1aa1253a2a17c1583d3eea2',
    pageCount: 4,
    visuallyReviewedPages: [1, 4],
  },
  infotainmentBulletin: {
    title: 'Nissan NTB20-080 - 2018-2020 Kicks Infotainment Software Update',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10183974-0001.pdf',
    sha256: 'f9bbaa35be0fc88a24826b9ee152714401c6bf747419ed0c2a02451db444c4ae',
    pageCount: 12,
    visuallyReviewedPages: [1, 12],
  },
});

function recallApi(campaign, title) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains: campaign });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  recall19V654: recallApi('19V654000', 'NHTSA Recall 19V654000 - Kicks Rearview Display'),
  recall22V693: recallApi('22V693000', 'NHTSA Recall 22V693000 - Kicks EPS Torque Sensor'),
  recall25V324: recallApi('25V324000', 'NHTSA Recall 25V324000 - Kicks Center Information Display'),
  recall26V331: recallApi('26V331000', 'NHTSA Recall 26V331000 - Kicks Combination Meter Display'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Kicks', slug: 'kicks', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-kicks-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['KICKS', 'KICKS PLAY'],
  searchTerms: ['condenser', 'P17F0', 'overheat', 'drone', 'torque sensor', 'P0101', 'infotainment issue', 'drum', 'squeal', 'rearview camera', 'center information display', 'partial image', 'blue screen'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 23, '2020-2024': 158, '2025-2026': 19 },
    totalRows: 200,
    relevantRowCount: 36,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 38 },
    totalRows: 38,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The ten exact Kicks campaigns cover rearview software, EPS torque-sensor welds, key and bracket conditions, display software and other bounded populations. Only 19V654, 22V693, 25V324 and 26V331 overlap frozen identities; the EPS title carries the wrong Nissan campaign label and therefore remains held.',
  },
  content,
  requiredProse: [
    { id: ids.ac, field: 'description', patterns: ['No air-conditioning bulletin matching', 'NTB19-041', '380-owner total'] },
    { id: ids.cluster, field: 'description', patterns: ['26V331', '51,598', 'seven technical reports and 205 warranty claims'] },
    { id: ids.centerDisplay, field: 'description', patterns: ['25V324', 'June 24, 2024 through March 7, 2025', '79,755'] },
    { id: ids.cvtDrone, field: 'description', patterns: ['NTB22-021', '2018-2021 Kicks', 'does not establish excessive highway drone'] },
    { id: ids.cvtOverheat, field: 'description', patterns: ['does not establish sustained-highway overheating', '450-owner total'] },
    { id: ids.eps, field: 'description', patterns: ['22V693', 'official Nissan campaign identifier is PMA10', 'PMA25/PMA26'] },
    { id: ids.engineNoise, field: 'description', patterns: ['does not establish an HR16DE', '310-owner total'] },
    { id: ids.stalling, field: 'description', patterns: ['P0A09', '2020 Kicks', 'stalling when coming to a stop'] },
    { id: ids.infotainment, field: 'description', patterns: ['NTB20-080', '2018-2020 Kicks SV and SR', 'does not support the frozen 2021-2025'] },
    { id: ids.rearBrake, field: 'description', patterns: ['No communication matching', 'NTB18-081'] },
    { id: ids.rearview, field: 'solution', patterns: ['19V654/R1911', '0.2-hour operation'] },
  ],
  observations: [
    { code: 'three-exact-recall-identities-retained-eight-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only 26V331 combination-meter, 25V324 center-display and 19V654 rearview-display identities are retained; eight materially unsupported or contradictory identities remain published but blocked pending identity policy.' },
    { code: 'eps-title-campaign-identity-conflict', severity: 'identity-safety', recordIds: [ids.eps], detail: 'The exact Kicks EPS recall is 22V693/PMA10, while the immutable frozen title says PMA25/PMA26; body-only correction would create an indexed contradiction.' },
    { code: 'three-false-or-unverified-bulletin-claims-held', severity: 'source-integrity', recordIds: [ids.ac, ids.infotainment, ids.rearBrake], detail: 'NTB19-041 and NTB18-081 do not appear in the exact Kicks corpus, and NTB20-080 does not support the frozen 2021-2025 infotainment identity or claimed NTB23-018 remedy.' },
    { code: 'cvt-evidence-bounded-to-dtc-and-judder-flow', severity: 'technical-accuracy', recordIds: [ids.cvtDrone, ids.cvtOverheat], detail: 'NTB22-021 is a 2018-2021 RE0F11B DTC/judder flow and is not proof of highway drone, overheating, auxiliary-cooler need or universal fluid intervals.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 1,140 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-kicks-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Kicks page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
