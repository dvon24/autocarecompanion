/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-gle-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  hybrid: 'mercedes-benz-gle-48v-mild-hybrid-isg-48v-battery-malfunction-causing-sudden-p',
  transmission: 'mercedes-benz-gle-9g-tronic-harsh-shifting-delayed-engagement-from-valve-body',
  auxiliaryBattery: 'mercedes-benz-gle-auxiliary-12v-battery-failure-triggering-auxiliary-battery-m',
  drain: 'mercedes-benz-gle-c-drain-hose-water-intrusion-into-front-footwells',
  adblue: 'mercedes-benz-gle-diesel-adblue-scr-nox-sensor-fault-triggering-restart-countd',
  steering: 'mercedes-benz-gle-electric-power-steering-sudden-loss-assist-power-steering-ma',
  esp: 'mercedes-benz-gle-esp-software-non-conformance-nhtsa-recall-21v-071',
  controlArm: 'mercedes-benz-gle-front-lower-control-arm-bushing-wear-causing-clunk-steering',
  radar: 'mercedes-benz-gle-front-radar-sensor-fault-disabling-distronic-active-brake-as',
  mounts: 'mercedes-benz-gle-hydraulic-engine-transmission-mount-collapse-causing-idle-vi',
  m256Cooling: 'mercedes-benz-gle-m256-inline-6-oil-filter-housing-oil-cooler-electric-coolant',
  m264Chain: 'mercedes-benz-gle-m264-2-0l-turbo-timing-chain-tensioner-wear-chain-rattle',
  m276Cam: 'mercedes-benz-gle-m276-v6-camshaft-adjuster-wear-cold-start-rattle',
  m278Cam: 'mercedes-benz-gle-m278-4-7l-twin-turbo-v8-timing-chain-tensioner-camshaft-adju',
  headlight: 'mercedes-benz-gle-multibeam-led-headlight-condensation-seal-failure-killing-in',
  dieselTurbo: 'mercedes-benz-gle-om651-diesel-turbo-bearing-collapse-egr-cooler-coolant-leak',
  sunroof: 'mercedes-benz-gle-panoramic-sunroof-drain-clog-seal-failure-causing-water-leak',
  phev: 'mercedes-benz-gle-plug-hybrid-charging-interruption-won-t-charge-faults',
  liftgate: 'mercedes-benz-gle-power-liftgate-spindle-drive-control-module-failure',
  suspension: 'mercedes-gle-air-suspension-compressor-2016',
  mbux: 'mercedes-gle-comand-mbux-freeze-2016',
  dpf: 'mercedes-gle-diesel-dpf-issues-2016',
  differential: 'mercedes-gle-rear-differential-leak-2016',
  transferCase: 'mercedes-gle-transfer-case-actuator-2016',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.drain, IDS.esp].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([
  IDS.suspension, IDS.mbux, IDS.dpf, IDS.differential, IDS.transferCase,
].sort());
const MODEL_ALIASES = Object.freeze([
  'GLE-CLASS', 'GLE CLASS', 'GLE350', 'GLE 350', 'GLE400', 'GLE 400',
  'GLE450', 'GLE 450', 'GLE550', 'GLE 550', 'GLE580', 'GLE 580',
  'GLE250D', 'GLE 250D', 'GLE300D', 'GLE 300D', 'GLE350D', 'GLE 350D',
  'GLE400D', 'GLE 400D', 'GLE450D', 'GLE 450D', 'GLE350DE', 'GLE 350DE',
  'GLE450E', 'GLE 450E', 'GLE550E', 'GLE 550E', 'GLE53 AMG', 'GLE 53 AMG',
  'AMG GLE53', 'AMG GLE 53', 'GLE63 AMG', 'GLE 63 AMG', 'AMG GLE63', 'AMG GLE 63',
]);
const SEARCH_TERMS = Object.freeze([
  'AIRMATIC', 'air suspension', 'compressor', '48V', 'ISG', 'battery', '9G-Tronic',
  '725.0', 'shift', 'engagement', 'auxiliary battery', 'backup battery', 'drain hose',
  'water intrusion', 'footwell', 'AdBlue', 'SCR', 'NOx', 'restart', 'steering', 'EPS',
  'ESP', 'stability', 'control arm', 'bushing', 'radar', 'Distronic', 'P2583',
  'engine mount', 'transmission mount', 'oil filter housing', 'oil cooler', 'coolant pump',
  'timing chain', 'tensioner', 'camshaft adjuster', 'cold start', 'rattle', 'headlight',
  'condensation', 'fogged', 'turbo', 'EGR cooler', 'sunroof', 'drain', 'water leak',
  'charging', 'charge', 'hybrid',
  'liftgate', 'tailgate', 'spindle', 'COMAND', 'MBUX', 'freeze', 'DPF', 'regeneration',
  'reboot', 'differential', 'oil leak', 'transfer case', 'bearing', 'Active Brake Assist',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10171647', '10189404', '10207187', '10209877', '10219242', '10222468',
  '10225802', '10231025', '10235676', '10249737', '11000606', '11007753',
  '11007790', '11008058', '11011544', '11014593', '11015616', '11023101',
  '11023194', '11024013', '11025100', '11025535', '11025560', '11026834',
  '11028267', '11028270', '11030302',
]);
const CAMPAIGNS = Object.freeze([
  '15V709000', '16V440000', '16V442000', '16V602000', '16V759000', '16V903000',
  '17V077000', '17V079000', '17V081000', '17V177000', '17V241000', '17V655000',
  '17V816000', '17V828000', '18V272000', '18V512000', '18V539000', '19V458000',
  '19V459000', '19V540000', '19V572000', '19V587000', '19V648000', '19V709000',
  '19V787000', '19V867000', '20V089000', '20V172000', '20V226000', '20V329000',
  '20V430000', '20V464000', '20V626000', '20V627000', '20V671000', '21V056000',
  '21V057000', '21V058000', '21V071000', '21V072000', '21V123000', '21V197000',
  '21V288000', '21V354000', '21V509000', '21V818000', '21V832000', '21V909000',
  '21V961000', '22V098000', '22V231000', '22V232000', '22V365000', '22V680000',
  '22V936000', '22V955000', '23V177000', '23V178000', '23V445000', '23V835000',
  '23V854000', '23V878000', '23V880000', '24V117000', '24V118000', '24V207000',
  '24V724000', '26V199000', '26V353000',
]);
const PDF_SOURCES = Object.freeze({
  drainRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 21V-288: A/C drain-hose installation',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V288-3873.PDF',
    localPath: 'C:/tmp/mercedes-gle-sources/21V288.pdf', pages: 4,
    visualPages: [1, 2, 3, 4], bytes: 216374,
    sha256: '38be486dc81714a4fdb8f72f5d57e2b816bfa2cb5802df369affeecfa57aa053',
  },
  espRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 21V-071: ESP software non-conformance',
    type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V071-3460.PDF',
    localPath: 'C:/tmp/mercedes-gle-sources/21V071.pdf', pages: 4,
    visualPages: [1, 2, 3, 4], bytes: 216675,
    sha256: '3504d3c3df7f57d3d97eeb0b547c381c5fc09c6160c3a803d311c231931bc9ee',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 274, '2015-2019': 189, '2020-2024': 1350, '2025-2026': 1250 },
  totalRows: 3063, relevantRowCount: 1709, uniqueRelevantCommunications: 369,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 4518 },
  totalRows: 4518, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.hybrid]: {
    description: 'Mercedes communications document several distinct 48-volt conditions on narrower GLE populations, but they do not establish the frozen combined ISG / 48V-battery failure identity across model years 2020-2025 and three engine families. Communications 10189404 and 10222468 explicitly describe multiple possible causes and require fault-specific diagnosis. Communication 10225802 concerns 2021 battery-management software, while 11008058 concerns a 2023 ISA software condition. These records do not prove one shared hardware failure, a universal sudden-power-loss mechanism or the frozen diesel and V8 coverage.',
    solution: 'Preserve the 12V, 48V, ISA, powertrain and charging fault codes and software versions. Test the batteries, connections and power-electronics path identified by the exact faults, then follow the VIN-specific Mercedes procedure. Do not buy an integrated starter-generator, 48V battery, cable or control unit from this page; the failed path and fitment are not established.',
    symptoms: ['48V and powertrain messages documented', 'fault codes and software versions preserved', 'battery, wiring and ISA paths tested separately'],
    affectedSystems: ['48V onboard electrical system', 'integrated starter alternator', 'battery-management software'],
    conflict: 'Exact records cover multiple narrower battery, software and ISA conditions, not the frozen all-engine combined identity.',
    evidence: ['10189404/10222468 require cause-specific diagnosis for overlapping 48V symptoms.', '10225802 is a 2021 battery-management software campaign.', '11008058 is a 2023 ISA software condition, not proof of one 2020-2025 hardware failure.'],
    summary: 'Held the bundled 48V identity and separated battery, software and ISA evidence from inferred universal failure claims.', sources: ['datasets'],
  },
  [IDS.transmission]: {
    description: 'The reviewed GLE records support narrower shift-quality and drivetrain conditions, not frozen valve-body wear across model years 2020-2024, GLE 350 / 450 and M264, M256 and OM656 engines. Communication 11025560 covers an uncomfortable 1-2 shift under light load on a specific M264/725.0 software set. Communication 11025100 identifies variable-transfer-case vibration that may be mistaken for a harsh shift. Other records require Intelligent Predictive Repair data before parts replacement. None establishes valve-body wear, delayed engagement, the full engine set or one universal repair.',
    solution: 'Record the exact gear, load, temperature and delay, and preserve EEPROM, VGS, engine and transfer-case faults. Confirm transmission hardware and software, then separate shift-quality, parking-lock, transfer-case and engine-running paths. Do not buy a valve body, control unit, transmission or fluid kit from this page; the failure identity and fitment are unresolved.',
    symptoms: ['gear and operating conditions documented', 'VGS and drivetrain data preserved', 'transmission and transfer-case paths separated'],
    affectedSystems: ['725-series automatic transmission', 'transmission software and adaptation', 'variable transfer case'],
    conflict: 'Exact records cover software-specific shifts and transfer-case vibration, not broad valve-body wear or delayed engagement.',
    evidence: ['11025560 is a specific M264/725.0 1-2 shift software condition.', '11025100 says transfer-case vibration can be mistaken for a harsh shift.', 'No exact record establishes frozen valve-body-wear scope or universal replacement.'],
    summary: 'Held the broad valve-body identity and separated exact software and transfer-case conditions from unsupported wear claims.', sources: ['datasets'],
  },
  [IDS.auxiliaryBattery]: {
    description: 'The reviewed GLE corpus does not establish one auxiliary or backup 12-volt battery failure across model years 2016-2024, six trims and five engine families. Communication 10209877 concerns the accuracy of a main 12V battery test and warns that a discharged battery does not necessarily require replacement. Other records distinguish 12V supply, 48V system and software conditions. None proves that every frozen vehicle uses the same auxiliary-battery architecture, message, component or remedy.',
    solution: 'Record the exact warning text and all low-voltage faults, identify the installed battery architecture by VIN and test the main and any auxiliary battery separately. Check charging, wiring and software before condemning a battery. Do not buy a battery, converter or control module from this page; the installed architecture and fitment are not established.',
    symptoms: ['exact warning text recorded', 'battery architecture identified by VIN', 'main, auxiliary and charging paths tested separately'],
    affectedSystems: ['12V onboard electrical system', 'battery monitoring', 'charging and voltage conversion'],
    conflict: 'No exact record supports the frozen nine-year, multi-architecture auxiliary-battery identity.',
    evidence: ['10209877 says a discharged 12V battery does not necessarily require replacement.', 'Exact records separate main 12V, 48V and software conditions.', 'No source establishes one auxiliary-battery part or message across the frozen population.'],
    summary: 'Held the overbroad auxiliary-battery identity and replaced automatic replacement with VIN-specific architecture testing.', sources: ['datasets'],
  },
  [IDS.drain]: {
    description: 'Recall 21V-288 directly covers certain model-year 2020-2021 GLE-Class vehicles whose air-conditioning drain hoses might be incorrectly installed, allowing condensation water into the passenger compartment. Water in the front footwells can corrode or short electrical components and affect eCall, locking, starting or limp-home operation. The report lists 4,325 GLE 350, 1,045 GLE 450, three GLE 580 and one 2021 AMG GLE 53 vehicle; those are recall populations, not owner-report totals.',
    solution: 'Check the VIN for recall 21V-288 and have an authorized Mercedes-Benz dealer inspect the air-conditioning drain hoses and correct their installation when necessary. Do not buy drain hoses or electrical modules from this page; recall eligibility and the prescribed correction are VIN-specific.',
    symptoms: ['VIN checked for recall 21V-288', 'wet front carpets or fogged windows documented', 'water-exposed electrical functions checked'],
    affectedSystems: ['air-conditioning drain hoses', 'front footwell electrical components', 'eCall and vehicle access systems'],
    conflict: null,
    evidence: ['Rendered pages 1-2 list the exact GLE 350, GLE 450, GLE 580 and AMG GLE 53 populations.', 'Rendered page 3 identifies incorrect hose installation, footwell water and electrical safety risk.', 'Rendered page 4 prescribes dealer inspection and installation correction.'],
    summary: 'Retained the exact 21V-288 drain-hose identity with recall populations and VIN-specific dealer remedy.', sources: ['drainRecall'],
  },
  [IDS.adblue]: {
    description: 'The frozen page combines AdBlue heaters, SCR coding, NOx sensors, restart countdown and no-start behavior across four diesel engine families and model years 2016-2024. Exact U.S. records are much narrower: communications 10167006-10167008 identify particular AdBlue heater electrical faults, while 10219242 and 10232319 concern 2016 BlueTEC update parts or coding. They do not establish one fault, one countdown mechanism or the later EU-market OM654 / OM656 coverage. Absence from the U.S. corpus is not proof that a European condition does not exist; exact market-specific evidence is required.',
    solution: 'Record the complete message, countdown state and SCR/engine fault codes. Confirm market, VIN and engine, then test the AdBlue heater, pump, dosing, sensor, catalyst and software paths separately under the applicable Mercedes procedure. Do not buy a NOx sensor, heater, pump, tank or SCR component from this page; the failed path and fitment are not established.',
    symptoms: ['market and engine confirmed', 'message, countdown and fault codes preserved', 'heater, sensor, dosing and software paths separated'],
    affectedSystems: ['AdBlue delivery', 'SCR aftertreatment', 'NOx sensing and diesel software'],
    conflict: 'Exact records do not support the frozen all-diesel, nine-year restart-countdown identity.',
    evidence: ['10167006-10167008 identify specific heater electrical faults.', '10219242/10232319 concern 2016 BlueTEC update parts or coding.', 'No reviewed source establishes the frozen OM654/OM656 coverage or one universal no-start remedy.'],
    summary: 'Held the bundled diesel-emissions identity and separated exact heater and BlueTEC records pending market-specific evidence.', sources: ['datasets'],
  },
  [IDS.steering]: {
    description: 'Communication 10231025 supports a narrow software condition on model-year 2021-2023 AMG GLE 53 vehicles: no steering assist after engine start with P063500 and root-cause error 60015, remedied by an electric-power-steering software update. The frozen page instead covers model years 2016-2022, six trims and four engines and asserts sudden loss of assist as a common hardware or voltage failure. The exact record does not establish that scope, an in-motion failure, steering-rack replacement or one universal cause.',
    solution: 'Treat any loss of steering assist as safety-critical, stop when safe and preserve the steering fault details. Confirm VIN, model year and whether the event occurred at startup or while moving, then follow the exact Mercedes software, voltage, wiring or steering-rack diagnostic path. Do not buy a steering rack, motor, battery or control unit from this page; the failed path and fitment are unresolved.',
    symptoms: ['startup versus in-motion event distinguished', 'EPS faults and root-cause details preserved', 'software, voltage and hardware paths tested separately'],
    affectedSystems: ['electric power steering', 'EPS control-unit software', 'low-voltage supply'],
    conflict: 'The exact startup software condition is far narrower than the frozen seven-year sudden-loss identity.',
    evidence: ['10231025 covers 2021-2023 AMG GLE 53 no-assist after engine start.', 'It identifies P063500/root-cause 60015 and a software update.', 'No source supports one broad in-motion hardware failure or universal steering-rack replacement.'],
    summary: 'Bounded the exact EPS startup-software evidence and held the overbroad years, trims, mechanisms and parts advice.', sources: ['datasets'],
  },
  [IDS.esp]: {
    description: 'Recall 21V-071 directly covers certain model-year 2020-2021 GLE 350 and GLE 450 vehicles whose ESP software might not meet current production specifications and FMVSS 126. In a specific rapid evasive maneuver, torque may be applied to a front wheel and pull the vehicle to one side, increasing crash risk. The report lists 37,383 GLE 350 and 4,451 GLE 450 vehicles; those are recall populations, not owner-report totals.',
    solution: 'Check the VIN for recall 21V-071 and have an authorized Mercedes-Benz dealer update the ESP software when eligible. Do not buy an ESP module, sensor or hydraulic unit from this page; recall eligibility and the prescribed software remedy are VIN-specific.',
    symptoms: ['VIN checked for recall 21V-071', 'no advance warning expected', 'dealer software update confirmed'],
    affectedSystems: ['Electronic Stability Program software', 'electronic stability control', 'front-wheel torque control'],
    conflict: null,
    evidence: ['Rendered pages 1-2 list exact 2020-2021 GLE 350 and GLE 450 populations.', 'Rendered page 3 identifies the rapid-maneuver pull and crash risk.', 'Rendered page 4 prescribes an authorized-dealer ESP software update.'],
    summary: 'Retained the exact 21V-071 ESP identity with correct populations and VIN-specific software remedy.', sources: ['espRecall'],
  },
  [IDS.controlArm]: {
    description: 'The reviewed GLE corpus does not establish frozen front-lower-control-arm bushing wear across model years 2016-2025 and four trims. Communication 10235676 directs inspection of the upper transverse control arms on certain model-year 2020-2023 GLE 580 vehicles and replacement if necessary. That campaign cannot prove lower-bushing deterioration, steering wander, a ten-year population, a mileage range or universal replacement of arms and alignment hardware.',
    solution: 'Reproduce the clunk and steering complaint, inspect upper and lower arms, ball joints, bushings, fasteners, wheel bearings and alignment, and identify the failed component before repair. Do not buy control arms, bushings or alignment hardware from this page; the failed location and fitment are not established.',
    symptoms: ['noise location reproduced', 'upper and lower joints inspected separately', 'alignment and wheel-bearing paths checked'],
    affectedSystems: ['front suspension arms', 'suspension bushings and joints', 'wheel alignment'],
    conflict: 'The exact upper-arm inspection campaign does not support the frozen lower-bushing wear identity or population.',
    evidence: ['10235676 concerns upper transverse control arms on 2020-2023 GLE 580 vehicles.', 'It does not establish lower-control-arm bushing wear or steering wander.', 'No exact source supports the frozen ten-year scope or universal parts remedy.'],
    summary: 'Held the lower-control-arm identity and separated the narrow upper-arm campaign from unsupported wear claims.', sources: ['datasets'],
  },
  [IDS.radar]: {
    description: 'The reviewed GLE records support narrower driver-assistance interruptions, not frozen front-radar-sensor failure with P2583 across model years 2020-2024. Communication 11000606 identifies a brief power-supply interruption to the long-range radar or Active Brake Assist control path and prescribes SCN coding. Communication 10191289 concerns transport mode and calibration. Neither establishes a failed radar sensor, the frozen code, contamination as the universal cause or automatic sensor replacement.',
    solution: 'Record the exact warning and all driver-assistance fault codes, inspect sensor obstruction and damage, and preserve voltage and communication data. Follow the code- and VIN-specific coding, calibration, wiring or component test before replacement. Do not buy a radar sensor, bracket or control unit from this page; the failed component and fitment are unresolved.',
    symptoms: ['exact warning and codes documented', 'obstruction and damage checked', 'power, coding and calibration paths separated'],
    affectedSystems: ['front radar sensing', 'Distronic', 'Active Brake Assist'],
    conflict: 'Exact records support power, transport-mode or coding conditions, not the frozen P2583 sensor-failure identity.',
    evidence: ['11000606 attributes restriction to a brief power-supply interruption and prescribes SCN coding.', '10191289 concerns transport mode and sensor calibration.', 'No exact record establishes universal radar-sensor replacement or the frozen code and scope.'],
    summary: 'Held the radar-sensor identity and replaced universal replacement advice with fault-specific obstruction, power and calibration checks.', sources: ['datasets'],
  },
  [IDS.mounts]: {
    description: 'The reviewed GLE manufacturer-communication and recall corpus does not establish frozen hydraulic engine / transmission mount collapse across model years 2016-2025, four trims and four engine families. No exact GLE record was found that supports the stored idle-vibration and clunk identity, fluid-leak mechanism, mileage range, repair price or universal paired-mount replacement. Similar symptoms can come from engine running, exhaust contact, driveline, software or suspension conditions and cannot be assigned to mounts from this page.',
    solution: 'Reproduce the vibration in each gear and load state, verify engine-running quality and inspect mounts, exhaust contact and driveline movement under the applicable Mercedes procedure. Identify the failed location and part by VIN before repair. Do not buy engine or transmission mounts from this page; the identity and fitment are not established.',
    symptoms: ['gear and load state documented', 'engine-running and driveline causes separated', 'mount condition verified directly'],
    affectedSystems: ['engine mounting', 'transmission mounting', 'driveline vibration isolation'],
    conflict: 'No exact reviewed primary source supports the frozen ten-year multi-engine mount-collapse identity.',
    evidence: ['The exact GLE corpus contains no matching mount-collapse communication.', 'The frozen page spans incompatible engine and chassis combinations without source support.', 'No source establishes its mileage, price or universal paired-replacement advice.'],
    summary: 'Held the unsupported mount-collapse identity and replaced presumptive parts replacement with direct vibration diagnosis.', sources: ['datasets'],
  },
  [IDS.m256Cooling]: {
    description: 'The frozen page bundles M256 oil-filter-housing, oil-cooler and electric-coolant-pump leaks across model years 2020-2025. Exact GLE records support different narrow conditions: 10227141 requires guided testing of coolant-pump connections on certain AMG GLE 53 vehicles, and 10249737 concerns corrosion on an electric coolant-pump solenoid in a limited model-year 2022 service campaign. Neither establishes oil-filter-housing or oil-cooler leakage, one combined root cause or all frozen years.',
    solution: 'Document whether the loss is oil or coolant, pressure-test the correct circuit and preserve pump and temperature faults. Locate the leak or electrical failure before identifying a component. Do not buy an oil-filter housing, oil cooler, coolant pump or seal kit from this page; the failed path and fitment are unresolved.',
    symptoms: ['fluid type and source documented', 'cooling circuit pressure-tested', 'pump faults and electrical connections checked'],
    affectedSystems: ['M256 lubrication', 'engine cooling circuits', 'electric coolant pumps'],
    conflict: 'Exact pump communications do not support the frozen combined oil-housing, oil-cooler and pump-leak identity.',
    evidence: ['10227141 prescribes connection and guided-test checks for a coolant-pump fault.', '10249737 is a limited 2022 electric-pump solenoid-corrosion campaign.', 'No exact record establishes oil-filter-housing/oil-cooler leaks across 2020-2025.'],
    summary: 'Held the bundled M256 leak identity and separated exact pump evidence from unsupported oil-housing and cooler claims.', sources: ['datasets'],
  },
  [IDS.m264Chain]: {
    description: 'The reviewed GLE corpus does not establish frozen M264 timing-chain tensioner wear or chain rattle on model-year 2020-2023 GLE 350 vehicles. The closest exact engine records, 11028267 and 11030302, concern leaking valve seats with rough running and mixture or misfire symptoms; later records concern a central-valve filter screen and camshaft adjustment. Those are different mechanisms and do not prove chain stretch, tensioner wear, a cold-rattle duration or universal timing-set replacement.',
    solution: 'Record the sound and duration and preserve camshaft-correlation, oil-pressure, mixture and misfire faults. Confirm the engine code, measure mechanical timing and separate valve, accessory, oil-pressure and chain paths before repair. Do not buy a chain, tensioner, guide, camshaft adjuster or engine part from this page; the identity and fitment are not established.',
    symptoms: ['cold-start sound recorded', 'mechanical timing checked', 'valve, oil-pressure and chain paths separated'],
    affectedSystems: ['M264 timing drive', 'camshaft adjustment', 'engine oil-pressure control'],
    conflict: 'Exact records concern valve-seat or central-valve conditions, not the frozen M264 chain-tensioner identity.',
    evidence: ['11028267/11030302 identify leaking valve seats, a different mechanism.', 'Later camshaft records identify a central-valve filter-screen condition.', 'No exact record supports frozen timing-chain wear, rattle duration or universal parts replacement.'],
    summary: 'Held the unsupported M264 chain identity and separated exact valve and camshaft-control evidence.', sources: ['datasets'],
  },
  [IDS.m276Cam]: {
    description: 'The reviewed GLE corpus does not establish frozen M276 camshaft-adjuster magnet / solenoid wear and cold-start rattle across model years 2016-2018. No exact GLE communication supports the stored locking-pin, oil-migration, rattle-duration, DTC, mileage or replacement claims for both M276 variants. A cold-start noise cannot be assigned to an adjuster, magnet or solenoid without engine-specific timing and oil-pressure evidence.',
    solution: 'Record the cold-start sound and duration, confirm the exact engine and preserve timing, oil-pressure and camshaft faults. Test mechanical timing, adjuster control, solenoid operation and accessory-drive sources separately. Do not buy an adjuster, magnet, solenoid, chain or timing kit from this page; the identity and fitment are not established.',
    symptoms: ['engine variant confirmed', 'cold-start sound and faults preserved', 'mechanical and electrical timing paths separated'],
    affectedSystems: ['M276 camshaft adjustment', 'engine timing', 'oil-control solenoids'],
    conflict: 'No exact reviewed primary source supports the frozen M276 adjuster/magnet wear identity.',
    evidence: ['The exact GLE corpus contains no matching M276 cold-start adjuster bulletin.', 'No source establishes the stored locking-pin or oil-migration mechanism.', 'No source supports universal adjuster, magnet or timing-set replacement.'],
    summary: 'Held the unsupported M276 camshaft-adjuster identity and replaced parts inference with engine-specific timing diagnosis.', sources: ['datasets'],
  },
  [IDS.m278Cam]: {
    description: 'The reviewed GLE corpus does not establish frozen M278 timing-chain tensioner / camshaft-adjuster cold-start rattle across model years 2016-2019, including the Euro-market GLE 500. No exact market-specific GLE communication supports the stored chain, check-valve, adjuster, rattle-duration, mileage or replacement claims. The U.S. dataset cannot disprove a European condition, but it also cannot authorize this identity or remedy without exact Mercedes or authority evidence.',
    solution: 'Confirm market, VIN and M278 variant, record the cold-start sound and preserve timing and oil-pressure faults. Measure mechanical timing and oil pressure and isolate chain, adjuster, tensioner and accessory sources under the applicable Mercedes procedure. Do not buy a chain, tensioner, adjuster, check valve or timing kit from this page; the identity and fitment are not established.',
    symptoms: ['market and engine variant confirmed', 'cold-start sound and timing data preserved', 'chain, adjuster and oil-pressure paths separated'],
    affectedSystems: ['M278 timing drive', 'camshaft adjustment', 'engine oil-pressure supply'],
    conflict: 'No exact market-specific primary source supports the frozen M278 chain/adjuster identity or Euro coverage.',
    evidence: ['The exact U.S. GLE corpus contains no matching M278 cold-start bulletin.', 'No reviewed source establishes the combined chain, tensioner and adjuster mechanism.', 'Euro-market GLE 500 coverage requires exact market-specific evidence.'],
    summary: 'Held the unsupported M278 timing identity pending exact market-specific evidence and mechanical diagnosis.', sources: ['datasets'],
  },
  [IDS.headlight]: {
    description: 'Mercedes communications directly contradict the frozen implication that visible condensation proves seal failure and damaged internal electronics. Communications 11007753 and 11007790 explain that fogging can be a natural climatic phenomenon and may cause no technical impairment; a leak test and clearing procedure distinguish normal fogging from an actual leak. The records do not establish electronics failure, one seal defect, a ten-year population or universal lamp replacement.',
    solution: 'Photograph the moisture pattern and operating conditions, inspect the housing and covers for damage and perform the Mercedes clearing and leak test before identifying a defect. Replace a lamp or module only when the exact test confirms damage and the VIN-specific part is known. Do not buy a headlamp, seal, vent or control module from this page; condensation alone does not establish failure or fitment.',
    symptoms: ['moisture pattern and climate documented', 'normal fogging and leakage distinguished', 'lighting function and housing damage checked'],
    affectedSystems: ['LED headlamp housing', 'pressure compensation and ventilation', 'lighting electronics'],
    conflict: 'Exact Mercedes guidance says climatic fogging can be normal and non-impairing, contrary to the frozen seal/electronics-failure identity.',
    evidence: ['11007753 says headlamp fogging can be natural and cause no technical impairment.', '11007790 distinguishes moisture behavior and requires an exact clearing/leak evaluation.', 'No source supports universal seal failure or destroyed electronics across 2016-2025.'],
    summary: 'Corrected the condensation safety message but held the frozen seal/electronics-failure identity and universal parts claim.', sources: ['datasets'],
  },
  [IDS.dieselTurbo]: {
    description: 'The frozen page combines OM651 turbo-bearing collapse and EGR-cooler coolant leakage while also listing the OM642 V6 across model years 2016-2019. The reviewed GLE corpus contains no exact Mercedes communication establishing that combined identity, those engine assignments, a shared mechanism or universal turbo and EGR-cooler replacement. Turbo noise, boost loss, coolant loss, exhaust smoke and EGR faults require separate diagnosis, and market-specific diesel evidence is required.',
    solution: 'Confirm market, VIN and engine code. Preserve boost, exhaust, EGR and cooling faults; inspect turbo shaft condition and charge-air leaks separately from pressure-testing the EGR and cooling circuits. Do not buy a turbocharger, EGR cooler, gasket or coolant part from this page; the failed component and fitment are not established.',
    symptoms: ['market and engine confirmed', 'boost and coolant complaints separated', 'turbo, charge-air and EGR paths tested independently'],
    affectedSystems: ['diesel turbocharging', 'EGR cooling', 'engine cooling circuit'],
    conflict: 'No exact reviewed source supports the frozen two-engine combined turbo/EGR failure identity.',
    evidence: ['The exact GLE corpus contains no matching turbo-bearing-collapse communication.', 'No reviewed record establishes an EGR-cooler leak as the same condition.', 'The frozen OM651/OM642 grouping requires exact market and engine evidence.'],
    summary: 'Held the bundled diesel turbo/EGR identity and replaced component assumptions with separate boost and cooling diagnosis.', sources: ['datasets'],
  },
  [IDS.sunroof]: {
    description: 'The reviewed GLE corpus does not establish frozen panoramic-roof drain clog and seal failure across model years 2016-2025. Communication 11017205 concerns a creak or tick near the rear roller-sunblind bearings on a 2024 AMG GLE 53 and identifies relative movement at roof-frame contact areas, not water intrusion. Recall 21V-288 concerns A/C drain hoses, not roof drains. Neither proves clogged sunroof drains, failed seals, headliner water or one universal repair.',
    solution: 'Document the exact leak entry point and weather conditions, water-test controlled sections and inspect roof drains, seals, glass, roof frame, antenna and windshield paths separately. Protect electrical modules from further water exposure. Do not buy drains, seals, glass, a cassette or headliner parts from this page; the leak source and fitment are not established.',
    symptoms: ['water entry point documented', 'roof and non-roof leak paths tested separately', 'nearby electrical exposure checked'],
    affectedSystems: ['panoramic roof drainage', 'roof seals and frame', 'headliner electrical components'],
    conflict: 'Exact roof evidence concerns a noise condition, not the frozen ten-year drain/seal water-leak identity.',
    evidence: ['11017205 is a 2024 AMG GLE 53 roof-frame creak near the sunblind.', '21V-288 is an A/C drain-hose recall and cannot support roof-drain claims.', 'No exact source establishes the frozen drain, seal and cabin-water mechanism.'],
    summary: 'Held the unsupported panoramic-roof leak identity and separated roof noise and A/C-drain evidence from inferred water paths.', sources: ['datasets'],
  },
  [IDS.phev]: {
    description: 'Mercedes communications support several narrow charging-software conditions, not one frozen charging-interruption identity across three plug-in-hybrid generations and model years 2016-2024. Communication 11025535 concerns AC charging interrupted after about 15 minutes with specified charger faults, while 11026834 concerns a software message with P0CFE00 around charge completion or delayed charging. Other records explicitly say charging is normal despite a socket-flap fault. These cannot establish one charger failure, all frozen trims or universal hardware replacement.',
    solution: 'Record whether AC or DC charging is affected, the charger and station used, timing, temperature and all DCCU, on-board-charger and powertrain faults. Confirm VIN and market, then follow the exact software, inlet, cable, charger or high-voltage diagnostic path. Do not buy an on-board charger, inlet, cable or high-voltage component from this page; the failure path and fitment are unresolved.',
    symptoms: ['AC versus DC charging distinguished', 'station, timing and fault codes preserved', 'software, inlet and charger paths separated'],
    affectedSystems: ['plug-in-hybrid charging', 'on-board charger', 'charge inlet and control software'],
    conflict: 'Exact records cover distinct software and charger faults, not one 2016-2024 multi-generation failure identity.',
    evidence: ['11025535 identifies a specific AC-charging interruption and fault set.', '11026834 concerns P0CFE00 and software around completed or delayed charging.', 'No source establishes all frozen trims, years or universal charger replacement.'],
    summary: 'Held the bundled PHEV charging identity and separated exact software and charging-path conditions.', sources: ['datasets'],
  },
  [IDS.liftgate]: {
    description: 'The reviewed GLE records do not establish frozen spindle-drive or control-module failure causing partway opening and reversal across model years 2016-2023. Exact communications instead include an early EASY-PACK liftgate that does not fully open and later tailgates opening unintentionally because of key-button activation. Those are different symptoms and causes. No exact record supports a spindle motor, synchronization procedure, control module or universal component replacement for the frozen identity.',
    solution: 'Record whether the liftgate stops, reverses, fails to unlatch or opens unintentionally and preserve body-control faults. Inspect obstructions, hinges, struts, spindle drives, latch, wiring, key commands and learned limits separately under the VIN-specific procedure. Do not buy a spindle drive, control module, latch or strut from this page; the failed path and fitment are not established.',
    symptoms: ['stop, reversal and unintended opening separated', 'body-control faults preserved', 'mechanical, electrical and command paths tested'],
    affectedSystems: ['power liftgate drives', 'tailgate latch and controls', 'vehicle key commands'],
    conflict: 'Exact records concern different liftgate behaviors and do not support the frozen spindle/module identity.',
    evidence: ['10169586 is a narrow EASY-PACK incomplete-opening record.', '10231032/10252777 concern unintended opening from key activation.', 'No source establishes spindle-drive or control-module failure across 2016-2023.'],
    summary: 'Held the spindle/module identity and separated incomplete opening, reversal and unintended key activation.', sources: ['datasets'],
  },
  [IDS.suspension]: {
    description: 'The reviewed GLE corpus does not establish frozen air-suspension compressor failure across model years 2016-2023 and four trim families. Communication 10207187 supports a narrow model-year 2021-2022 AMG GLE 53 AIRMATIC fault caused by an internal control-unit issue and explicitly says replacing the CAIRS unit does not remedy it; the remedy is an R24 software update. That record does not prove compressor wear, air-spring leaks, relay failure or one universal hardware repair.',
    solution: 'Document vehicle level, temperature, compressor operation and all AIRMATIC faults. Leak-test the system and follow the exact software, power-supply, valve, reservoir, line and compressor procedure before identifying a failed component. Do not buy a compressor, relay, fuse, valve block or air spring from this page; the failure path and fitment are unresolved.',
    symptoms: ['vehicle level and temperature documented', 'AIRMATIC faults and compressor operation preserved', 'software, leak and power paths tested separately'],
    affectedSystems: ['AIRMATIC level control', 'air-suspension pressure supply', 'suspension control software'],
    conflict: 'The exact control-unit software condition is narrower than the frozen eight-year compressor-failure identity.',
    evidence: ['10207187 covers 2021-2022 AMG GLE 53 AIRMATIC faults.', 'It states CAIRS replacement does not remedy the issue and prescribes software update R24.', 'No exact source supports the stored 1,800-owner total or universal compressor replacement.'],
    summary: 'Held the broad compressor identity and separated a narrow software condition from unsupported hardware claims.', sources: ['datasets'],
  },
  [IDS.mbux]: {
    description: 'The frozen page combines COMAND and MBUX generations and multiple freeze, black-screen, reboot and connectivity symptoms across model years 2016-2023. Exact communications support distinct conditions: 10171647 concerns a dark central display with speaker interference on a 2021 AMG GLE 53, 11014593 concerns a red system-inoperative box and a specific software update, and 11011544 says display symptoms remain under analysis and parts should not be replaced. These records do not establish one failure mechanism or universal reset or head-unit replacement.',
    solution: 'Document the exact failed function and screen state and preserve voltage history, software versions and multimedia faults. Follow the symptom- and VIN-specific software, logging, wiring, display, connectivity or storage path. Do not buy a head unit, display, hard drive, control module or battery from this page; the failed path and fitment are not established.',
    symptoms: ['exact multimedia symptom documented', 'software and voltage state preserved', 'display, connectivity and storage paths separated'],
    affectedSystems: ['COMAND and MBUX multimedia', 'central display', 'connectivity and software'],
    conflict: 'Exact records cover multiple distinct generations and conditions, not one generic 2016-2023 freeze identity.',
    evidence: ['10171647 is a specific dark-display/interference condition.', '11014593 is a specific red-box software condition.', '11011544 says not to replace parts while display symptoms are under analysis.'],
    summary: 'Held the bundled COMAND/MBUX identity and replaced universal reset/replacement advice with symptom-specific diagnosis.', sources: ['datasets'],
  },
  [IDS.dpf]: {
    description: 'The reviewed GLE corpus does not establish frozen DPF regeneration failure on model-year 2016-2020 GLE 350d vehicles. Communication 10219242 concerns a limited 2016 BlueTEC update population in which an incorrect NOx sensor, DPF, SCR catalyst or particulate-matter sensor may have been installed; it is not evidence that short trips universally cause failed regeneration or that all 2016-2020 vehicles need forced regeneration, cleaning or DPF replacement.',
    solution: 'Preserve soot-load, differential-pressure, exhaust-temperature and emissions faults and confirm the exact engine, market and BlueTEC modification status. Diagnose sensors, temperature control, EGR, dosing, driving conditions and filter restriction separately before performing a regeneration or replacing anything. Do not buy a DPF, pressure sensor, temperature sensor or SCR component from this page; the failed path and fitment are unresolved.',
    symptoms: ['engine and market confirmed', 'soot load and emissions faults preserved', 'sensor, regeneration and restriction paths separated'],
    affectedSystems: ['diesel particulate filter', 'exhaust sensors', 'BlueTEC aftertreatment'],
    conflict: 'The exact 2016 BlueTEC parts campaign does not support the frozen five-year generic regeneration identity.',
    evidence: ['10219242 concerns incorrect parts installed during the BlueTEC update.', 'It does not establish generic short-trip regeneration failure.', 'No source supports the stored 1,000-owner total or universal forced-regeneration/DPF replacement.'],
    summary: 'Held the generic DPF identity and separated the narrow BlueTEC parts campaign from unsupported regeneration claims.', sources: ['datasets'],
  },
  [IDS.differential]: {
    description: 'Mercedes communications support narrower rear-differential conditions but not frozen oil leakage across model years 2016-2022 and GLE 350, 450 and AMG 53 trims. Communication 11023101 covers water entry through a misaligned differential breather on certain AMG GLE 53 vehicles, with howling, oil discoloration or breather leakage. Communication 11024013 concerns casting porosity at the oil-pan seal groove on rear differentials produced in 2023. These mechanisms and populations do not establish the frozen seven-year identity.',
    solution: 'Clean and locate the leak, confirm differential production data and inspect the breather, cover, pan, seals and housing separately. Check oil condition and use noise diagnosis before identifying a repair. Do not buy a differential, cover, seal, breather or oil kit from this page; the leak mechanism and fitment are unresolved.',
    symptoms: ['leak source cleaned and documented', 'differential production data confirmed', 'breather, porosity and seal paths separated'],
    affectedSystems: ['rear differential housing', 'differential breather', 'gear oil sealing'],
    conflict: 'Exact breather and 2023-porosity records do not support the frozen 2016-2022 multi-trim leak identity.',
    evidence: ['11023101 identifies water entry through a misaligned breather on certain AMG GLE 53 vehicles.', '11024013 limits casting porosity to differentials with 2023 production dates.', 'No source supports the stored 600-owner total or one universal reseal remedy.'],
    summary: 'Held the broad differential-leak identity and separated exact breather and casting-porosity mechanisms.', sources: ['datasets'],
  },
  [IDS.transferCase]: {
    description: 'The reviewed GLE records do not establish frozen 4MATIC transfer-case chain stretch and bearing wear across model years 2016-2022 GLE 350 / 450. Communications 11025100 and 11028270 instead identify light-load vibration or jolting on vehicles with a variable transfer case caused by modified oil quality over time; the condition may be mistaken for a harsh transmission shift. They do not identify chain stretch, bearing wear, an actuator failure or universal transfer-case replacement.',
    solution: 'Record speed, load and temperature, preserve drivetrain faults and confirm whether the vehicle has the variable transfer case. Separate transfer-case oil-related vibration from transmission, propeller-shaft, axle and engine causes under the Mercedes procedure. Do not buy a chain, bearing, actuator, transfer case or fluid kit from this page; the frozen failure identity and fitment are not established.',
    symptoms: ['speed, load and temperature documented', 'variable transfer case confirmed', 'transfer-case, transmission and driveline paths separated'],
    affectedSystems: ['4MATIC transfer case', 'transfer-case oil', 'drivetrain vibration'],
    conflict: 'Exact evidence identifies oil-quality vibration, not chain stretch, bearing wear or actuator failure.',
    evidence: ['11025100/11028270 identify modified transfer-case oil quality and light-load vibration.', 'The records say the sensation may be mistaken for a harsh shift.', 'No source supports the stored 700-owner total or frozen chain/bearing identity.'],
    summary: 'Held the chain/bearing identity and preserved exact oil-quality vibration as a distinct diagnostic path.', sources: ['datasets'],
  },
});

function sourceFor(key) { return PDF_SOURCES[key] || OTHER_SOURCES[key]; }
function citationsFor(id) {
  return CONTENT[id].sources.map((key) => {
    const source = sourceFor(key);
    return { url: source.url, type: source.type, title: source.title };
  });
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source); delete value.localPath; return [key, value];
  }));
}
function commerceDecisionFor(id) {
  const values = {
    [IDS.hybrid]: '48V failure path and fitment are unresolved; no universal retail part',
    [IDS.transmission]: 'transmission condition and valve-body fitment are unresolved; no universal retail part',
    [IDS.auxiliaryBattery]: 'battery architecture and fitment are VIN-specific; no universal retail part',
    [IDS.drain]: 'recall eligibility and drain-hose correction are VIN-specific; no universal retail part',
    [IDS.adblue]: 'market, failed SCR path and fitment are unresolved; no universal retail part',
    [IDS.steering]: 'EPS failure path and steering fitment are unresolved; no universal retail part',
    [IDS.esp]: 'recall eligibility and ESP software remedy are VIN-specific; no universal retail part',
    [IDS.controlArm]: 'failed suspension location and fitment are unresolved; no universal retail part',
    [IDS.radar]: 'driver-assistance failure path and sensor fitment are unresolved; no universal retail part',
    [IDS.mounts]: 'mount failure identity and fitment are unresolved; no universal retail part',
    [IDS.m256Cooling]: 'fluid-loss path and cooling-part fitment are unresolved; no universal retail part',
    [IDS.m264Chain]: 'timing-noise identity and engine fitment are unresolved; no universal retail part',
    [IDS.m276Cam]: 'camshaft-noise identity and engine fitment are unresolved; no universal retail part',
    [IDS.m278Cam]: 'market, timing identity and engine fitment are unresolved; no universal retail part',
    [IDS.headlight]: 'fogging-versus-leak status and lamp fitment are unresolved; no universal retail part',
    [IDS.dieselTurbo]: 'market, failed diesel path and fitment are unresolved; no universal retail part',
    [IDS.sunroof]: 'water-entry path and roof-part fitment are unresolved; no universal retail part',
    [IDS.phev]: 'charging failure path and high-voltage fitment are unresolved; no universal retail part',
    [IDS.liftgate]: 'liftgate failure path and component fitment are unresolved; no universal retail part',
    [IDS.suspension]: 'AIRMATIC failure path and compressor fitment are unresolved; no universal retail part',
    [IDS.mbux]: 'multimedia failure path and hardware fitment are unresolved; no universal retail part',
    [IDS.dpf]: 'diesel aftertreatment path and fitment are unresolved; no universal retail part',
    [IDS.differential]: 'differential leak mechanism and fitment are unresolved; no universal retail part',
    [IDS.transferCase]: 'transfer-case failure identity and fitment are unresolved; no universal retail part',
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
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLE')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 24 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen GLE coverage does not match the 24-row adjudication contract');
  }
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    const retained = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained, identityConflict: CONTENT[record.id].conflict,
      reason: retained
        ? 'Exact primary evidence supports the frozen identity while precise population and remedy boundaries replace unsupported generalizations.'
        : 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: {
        primaryEvidence: clone(CONTENT[record.id].evidence),
        limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.',
      },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'GLE',
    completionStatement: 'All 24 frozen GLE pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked', blockerRecordIds: BLOCKER_IDS,
      reason: 'Twenty-two identities or frozen applicability fields materially exceed exact evidence; no catalog write is authorized before independent review.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 24 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 1,800-, 1,300-, 1,000-, 600- and 700-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or VIN-specific dealer/recall boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'gle-two-recall-identities-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact Part 573 evidence supports the A/C drain-hose and ESP software identities with VIN-specific remedies.' },
      { code: 'gle-twenty-two-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Twenty-two titles or frozen applicability sets exceed exact primary evidence.' },
      { code: 'gle-headlamp-guidance-conflict', severity: 'safety-accuracy', recordIds: [IDS.headlight], detail: 'Mercedes says climatic fogging can be natural and non-impairing; condensation alone does not prove a failed seal or damaged electronics.' },
      { code: 'gle-drivetrain-conditions-separated', severity: 'accuracy-cleanup', recordIds: [IDS.hybrid, IDS.transmission, IDS.differential, IDS.transferCase], detail: 'Battery/software, transmission, transfer-case oil and differential breather/porosity evidence remains distinct from frozen combined identities.' },
      { code: 'gle-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 1,800-, 1,300-, 1,000-, 600- and 700-owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-gle-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No GLE page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: 2,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 22,
      fabricated_report_counts_proposed_zero: 5,
      total: 24,
    },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({
    output: OUTPUT, rows: packet.rows.length, summary: packet.summary,
    applicationGate: packet.applicationGate,
  }, null, 2));
}

module.exports = {
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS,
  RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor,
  commerceDecisionFor, proposalFor,
};
