/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-navigator-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['NAVIGATOR']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  tenR80Torque: 'lincoln-navigator-10r80-10-speed-harsh-erratic-shifting-torque-converter-shudd',
  tenR80Shudder: 'lincoln-navigator-10r80-10-speed-transmission-harsh-erratic-shifting-shudder',
  camCsp: 'lincoln-navigator-3-5l-ecoboost-cam-phaser-rattle',
  camTiming: 'lincoln-navigator-3-5l-ecoboost-cam-phaser-rattle-timing-failure',
  timingChain: 'lincoln-navigator-3.5l-ecoboost-timing-chain',
  sparkSeize: 'lincoln-navigator-5-4l-3-valve-triton-spark-plugs-seize-break-cylinder-head',
  sparkTwoPiece: 'lincoln-navigator-5-4l-3v-triton-two-piece-spark-plug-breaks-removal',
  sparkBreakage: 'lincoln-navigator-5.4l-3v-spark-plug-breakage',
  airCompressor: 'lincoln-navigator-air-ride-suspension-compressor-burnout-from-air-bag-leaks',
  airFailure: 'lincoln-navigator-air-suspension-failure',
  brakes: 'lincoln-navigator-brake-master-cylinder-internal-leak',
  runningMotor: 'lincoln-navigator-deployable-power-running-board-motor-failure-linkage-corrosi',
  runningStick: 'lincoln-navigator-deployable-power-running-boards-stick-fail-to-retract',
  hvac: 'lincoln-navigator-hvac-blend-door-actuator-failure',
  liftgate: 'lincoln-navigator-power-liftgate-opens-operates-its-own',
  sync: 'lincoln-navigator-sync-3-sync-4-infotainment-freezing-black-screen-touch-unres',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

const PDF_SOURCES = Object.freeze({
  tenR80: { title: 'Ford TSB 25-2476: 10R80 Harsh/Delayed Engagement or Shift', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11024877-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-10r80.pdf', pages: 7, visualPages: [1,2,3,4,5,6,7], bytes: 742648, sha256: 'bd6259ea005d72530d870083bf32a299c385299503ed1c1e4ae501345b748530' },
  cam: { title: 'Ford CSP 21N03 Supplement 4: Navigator Cam Phaser Replacement', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10209366-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-cam.pdf', pages: 17, visualPages: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], bytes: 246832, sha256: 'bf85368cb7c7a48b0449e80f710e5c322c09abecd6feec92307dc00d0262733c' },
  timing: { title: 'Ford SSM 49821: VCT DTC Diagnostic Information', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10194428-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-timing.pdf', pages: 2, visualPages: [1,2], bytes: 51383, sha256: '24fec2aa9d60d7314b7abc8a82e284235439c3cb0d292fb3cfb1bc19c5ca0936' },
  liftgate: { title: 'Ford SSM 49914: Navigator Power Liftgate Inoperative', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10198658-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-liftgate.pdf', pages: 1, visualPages: [1], bytes: 118551, sha256: 'c5628e0ff8662102c9874dc4de6244edef9b7f8e8795cdc841c03d3b73f7dae3' },
  running2018: { title: 'Ford SSM 50154: Power Running Boards Disabled After Low Voltage', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201606-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-running-2018.pdf', pages: 1, visualPages: [1], bytes: 30196, sha256: '3a2d4b4db5d738236c16b9edd35002581345066232277ce0d574c0ef89f56548' },
  running2022: { title: 'Ford SSM 51737: Running Board Defaults to Off After Key Cycle', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10238275-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-running-2022.pdf', pages: 1, visualPages: [1], bytes: 57089, sha256: 'c12cd7a70c3ee4856680a6d213cc53ea72b446cd80d74187400f39af706d1308' },
  sync3: { title: 'Ford TSB 21-2411: SYNC 3 Software Symptoms', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203656-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-sync3.pdf', pages: 3, visualPages: [1,2,3], bytes: 143281, sha256: '28b6ecd92b320c54b53ed38d6f324cac4b09652319371cb8d9d382c33830fb6f' },
  sync4: { title: 'Ford TSB 25-2055: SYNC 4 Performance and Stability', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11014836-0001.pdf', localPath: 'C:/tmp/lincoln-navigator-sync4.pdf', pages: 4, visualPages: [1,2,3,4], bytes: 206633, sha256: 'b8e916ef0f855ac3b625fa72297162be2c07946b25491c965e5a283469096acb' },
});

const OTHER_SOURCES = Object.freeze({
  spark: { title: 'Ford TSB 08-7-6: 5.4L 3V Spark Plug Removal Instructions', type: 'tsb', url: 'https://www.fordservicecontent.com/Ford_Content/pubs/content/~WT/~MUS~LEN/3637/tsb08-07-06.htm' },
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  air1999: { title: 'NHTSA 1999 Navigator Complaints (ODI 10025237)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=1999', odiNumber: '10025237' },
  air2003: { title: 'NHTSA 2003 Navigator Complaints (ODI 10360339)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2003', odiNumber: '10360339' },
  running2003: { title: 'NHTSA 2003 Navigator Complaints (ODI 10086506)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2003', odiNumber: '10086506' },
  running2006: { title: 'NHTSA 2006 Navigator Complaints (ODI 10342031)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2006', odiNumber: '10342031' },
  liftgate2018: { title: 'NHTSA 2018 Navigator Complaints (ODI 11187451)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2018', odiNumber: '11187451' },
  recalls2017: { title: 'NHTSA Current 2017 Navigator Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2017' },
  recalls2018: { title: 'NHTSA Current 2018 Navigator Recall Records', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=LINCOLN&model=NAVIGATOR&modelYear=2018' },
});

const CAMPAIGNS = Object.freeze(['00V073000','01V227001','01V258000','05V017000','05V310000','05V388000','05V519000','05V520000','06E056000','06E064000','08V057000','08V058000','08V166000','09E012000','09V232000','12V034000','12V190000','16V248000','18V058000','18V213000','18V392000','18V805000','19V076000','19V773000','20V262000','20V366000','21V805000','22V150000','22V193000','22V250000','22V346000','22V455000','22V648000','23V128000','23V420000','23V598000','24V099000','24V851000','24V852000','25V091000','25V132000','25V197000','25V198000','25V236000','25V270000','25V314000','25V315000','25V346000','25V403000','25V439000','25V442000','25V455000','25V488000','25V572000','25V628000','25V729000','25V823000','25V831000','26V104000','26V120000','26V165000','26V204000','26V344000','26V372000','26V402000','97V171000','98V028000','98V095000','98V296000','98V312000','99V099000']);
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 114, '2000-2004': 402, '2005-2009': 98, '2010-2014': 22, '2015-2019': 135, '2020-2024': 330, '2025-2026': 213 }, totalRows: 1314, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 41, post: 547 }, totalRows: 588, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.tenR80Torque]: [PDF_SOURCES.tenR80], [IDS.tenR80Shudder]: [PDF_SOURCES.tenR80],
    [IDS.camCsp]: [PDF_SOURCES.cam], [IDS.camTiming]: [PDF_SOURCES.cam], [IDS.timingChain]: [PDF_SOURCES.timing],
    [IDS.sparkSeize]: [OTHER_SOURCES.spark], [IDS.sparkTwoPiece]: [OTHER_SOURCES.spark], [IDS.sparkBreakage]: [OTHER_SOURCES.spark],
    [IDS.airCompressor]: [OTHER_SOURCES.air1999, OTHER_SOURCES.air2003, OTHER_SOURCES.datasets], [IDS.airFailure]: [OTHER_SOURCES.air2003, OTHER_SOURCES.datasets],
    [IDS.brakes]: [OTHER_SOURCES.recalls2017, OTHER_SOURCES.recalls2018],
    [IDS.runningMotor]: [PDF_SOURCES.running2018, PDF_SOURCES.running2022, OTHER_SOURCES.running2006],
    [IDS.runningStick]: [PDF_SOURCES.running2018, PDF_SOURCES.running2022, OTHER_SOURCES.running2003],
    [IDS.hvac]: [OTHER_SOURCES.datasets], [IDS.liftgate]: [PDF_SOURCES.liftgate, OTHER_SOURCES.liftgate2018],
    [IDS.sync]: [PDF_SOURCES.sync3, PDF_SOURCES.sync4],
  };
  if (!map[id]) throw new Error(`Unexpected Navigator row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const tenR80 = {
    confidence: 'high',
    description: 'Ford TSB 25-2476 applies to certain 2018-2021 Lincoln Navigator vehicles with harsh or delayed engagement, harsh or delayed shifting, and sometimes an illuminated MIL with listed transmission DTCs. Ford identifies axial movement of the CDF clutch-cylinder sleeve and resulting hydraulic-circuit leaks as the bulletin condition. The document does not identify torque-converter shudder as a universal Navigator diagnosis, and it does not cover the indexed 2022-2023 years.',
    solution: 'Have a trained transmission technician confirm the vehicle and symptom scope, run the Ford hydraulic circuit leak procedure and inspect the transmission before ordering anything. TSB 25-2476 directs CDF clutch-cylinder replacement only when the test and procedure call for it; additional transmission parts and a cooler flush are only as necessary after inspection. Do not buy a torque converter, valve body, CDF cylinder, fluid or rebuild kit from this page; this is a technician-only diagnosis with no universal retail part.',
    symptoms: ['harsh or delayed engagement', 'harsh or delayed shift', 'illuminated malfunction indicator with a listed transmission DTC'],
    dtcCodes: ['P0751','P0752','P0756','P0757','P0761','P0762','P0766','P0767','P0771','P0772','P2700','P2701','P2702','P2703','P2704','P2705','P2707','P2708','P0729','P0731','P0732','P0733','P0734','P0735','P0736','P076F','P07D9','P07F6','P07F7'],
    summary: 'Bound the 10R80 identity to TSB 25-2476 and removed universal torque-converter, lawsuit, fluid-only and blanket rebuild claims.',
  };
  const cam = {
    confidence: 'high',
    description: 'Ford Customer Satisfaction Program 21N03 covered certain 2018-2020 Navigator vehicles with the 3.5L GTDI engine after a qualifying 21B10 PCM update. It describes an undesirable cold-start rattle after an extended shut-down or a knocking noise at warm idle from the cam phasers. The one-time program expired January 1, 2023, so this page cannot promise current coverage. The source does not cover model-year 2021.',
    solution: 'Have a Ford or Lincoln technician confirm VIN eligibility, engine, prior calibration and the exact noise. For an affected vehicle that exhibited the covered condition, 21N03 directed replacement of all four VCT units and explicitly said not to replace additional VCT or engine-timing components. Do not buy cam phasers, timing chains, guides, tensioners, an oil kit or other timing parts from this page; current coverage and repair fitment are VIN- and diagnosis-specific.',
    symptoms: ['cold-engine start rattle after an extended shutdown', 'knocking noise at warm idle'],
    dtcCodes: [],
    summary: 'Corrected the cam-phaser scope, expired program terms and four-VCT-unit repair while removing extra timing-parts and maintenance claims.',
  };
  const spark = {
    confidence: 'high',
    description: 'Ford TSB 08-7-6 applies to 2005-2008 Navigator vehicles with a 5.4L 3-valve engine built before October 9, 2007. It documents difficult spark-plug removal that can damage or separate a two-piece plug and leave part of it in the cylinder head. The bulletin does not support the indexed 2004 year on one preserved page.',
    solution: 'This bulletin is written for trained professionals and requires the engine to be at room temperature; removing plugs from a warm or hot engine increases thread-damage risk. Its procedure calls for a limited initial turn, Motorcraft Carburetor Tune-Up Cleaner, at least a 15-minute soak and hand tools, with Ford special tools for specific breakage modes. Do not buy aftermarket extractors, replacement plugs, penetrating oil, cleaner or anti-seize from this page; have a qualified technician follow the current Ford procedure and verify the engine build date.',
    symptoms: ['high effort during spark-plug removal', 'spark plug separates during removal', 'part of the spark plug remains in the cylinder head'],
    dtcCodes: [],
    summary: 'Replaced unsafe warm-engine and improvised removal advice with Ford TSB 08-7-6 room-temperature technician procedure.',
  };
  const content = {
    [IDS.tenR80Torque]: tenR80,
    [IDS.tenR80Shudder]: tenR80,
    [IDS.camCsp]: cam,
    [IDS.camTiming]: cam,
    [IDS.timingChain]: {
      confidence: 'low',
      description: 'The exact Ford communication found for the indexed years is SSM 49821, which lists 2015-2021 Navigator vehicles and VCT DTCs P0011, P0012, P0014, P0015, P0016, P0017, P0018, P0019, P0021, P0022, P0024 and P0025. Ford says those codes may result from debris causing a VCT solenoid to stick and requires a pinpoint-test cycling step before replacement. That source does not establish a model-wide timing-chain-stretch condition, failure rate, mileage threshold or automatic engine damage.',
      solution: 'Have a technician reproduce any noise, scan all modules and follow Ford pinpoint testing. When an applicable VCT code is present, SSM 49821 says to cycle the affected VCT solenoid ten times to attempt to clear debris before replacing the solenoid. Do not buy a timing-chain kit, guides, tensioners, phasers, water pump or engine from this page; the listed codes do not prove timing-chain stretch and the correct repair depends on diagnosis.',
      symptoms: ['malfunction indicator with an applicable VCT DTC', 'engine noise requiring diagnosis rather than assumed chain stretch'],
      dtcCodes: ['P0011','P0012','P0014','P0015','P0016','P0017','P0018','P0019','P0021','P0022','P0024','P0025'],
      summary: 'Downgraded the unsupported timing-chain-stretch claim and made Ford VCT-solenoid pinpoint testing the evidence-bounded path.',
    },
    [IDS.sparkSeize]: spark,
    [IDS.sparkTwoPiece]: spark,
    [IDS.sparkBreakage]: spark,
    [IDS.airCompressor]: {
      confidence: 'low',
      description: 'NHTSA complaint ODI 10025237 reports a 1999 Navigator air-suspension compressor failure, and ODI 10360339 reports a 2003 vehicle whose air-suspension motor was replaced and whose air bags allegedly leaked and filled slowly in cold weather. These are individual owner allegations with no reported injuries or deaths, not proof of a universal leak mechanism, compressor-burnout sequence, incidence rate or coverage across every indexed year.',
      solution: 'If the vehicle sags, rides unevenly or the compressor runs excessively, have the complete air-suspension system diagnosed for stored faults, power and ground, height-sensor input, lines, fittings, springs and compressor performance. Do not buy an air spring, compressor, dryer, relay, conversion kit or named aftermarket brand from this page; configuration and failed component must be confirmed on the vehicle.',
      symptoms: ['vehicle sag or uneven ride height', 'slow height recovery in cold weather', 'air-suspension compressor inoperative or running excessively'],
      dtcCodes: [],
      summary: 'Recast the air-ride page as bounded owner allegations and diagnosis, removing universal mechanisms, brands, prices and conversion advice.',
    },
    [IDS.airFailure]: {
      confidence: 'low',
      description: 'NHTSA complaint ODI 10360339 alleges that a 2003 Navigator needed an air-suspension motor and had leaking air bags that filled slowly in cold weather. One complaint cannot establish a model-wide rear-air-bag or compressor defect, its frequency, a common age threshold or applicability to every 2003-2017 Navigator configuration.',
      solution: 'Have a suspension technician check faults, ride-height data, electrical supply, lines, fittings, springs and compressor operation before selecting a repair. Do not buy rear air bags, a compressor, dryer, relay or coil-spring conversion kit from this page; the system configuration and failed component are VIN- and diagnosis-specific.',
      symptoms: ['rear suspension sag or uneven ride height', 'slow air-suspension recovery in cold weather', 'air-suspension motor or compressor inoperative'],
      dtcCodes: [],
      summary: 'Removed model-wide incidence, age, brand, price and conversion claims that one complaint cannot support.',
    },
    [IDS.brakes]: {
      confidence: 'high',
      description: 'NHTSA recall 25V236/Ford 25S37 covers certain 2017-2018 Navigator vehicles. The brake master cylinder may allow brake fluid to leak from the front-wheel circuit into the brake booster, reducing brake function and increasing stopping distance. Applicability is VIN-specific; the indexed years alone do not establish that a vehicle is recalled.',
      solution: 'Check the VIN for open recall 25S37/25V236. Dealers will replace the brake master cylinder and, if the master cylinder is leaking, also replace the brake booster, free of charge. If brake function is reduced or stopping distance changes, stop driving when safe and arrange service or towing. Do not buy a master cylinder, booster or brake-fluid kit from this page; this is a VIN-scoped dealer recall remedy.',
      symptoms: ['reduced brake function', 'increased stopping distance', 'brake fluid leaking from the front-wheel circuit into the booster'],
      dtcCodes: [],
      summary: 'Updated the master-cylinder page to the current 25V236/25S37 VIN scope, risk and free dealer remedy.',
    },
    [IDS.runningMotor]: {
      confidence: 'medium',
      description: 'Ford SSM 50154 covers 2018-2020 Navigator running boards disabled after a low-battery event, with the setting moved from Auto to Off and possible DTC U3003:16. SSM 51737 covers some 2022-2023 vehicles whose setting defaults to Off after a key cycle and says the condition does not affect durability. A separate 2006 owner complaint alleges support-post corrosion, but it does not prove a universal motor or linkage defect across the indexed 2007-2024 range.',
      solution: 'For a 2018-2020 disabled-board condition, inspect the charging system, correct the low-voltage event and restore Auto mode as SSM 50154 directs. For the 2022-2023 setting condition, Ford said no service was recommended at publication and owners could temporarily reset Auto mode. Physical sticking, looseness or corrosion needs hands-on inspection. Do not buy a motor, linkage, hinge, control module or lubricant from this page; the correct path depends on year, fault and mechanical condition.',
      symptoms: ['running boards disabled or setting changed to Off', 'setting defaults to Off after a key cycle', 'physical sticking or looseness requiring inspection'],
      dtcCodes: ['U3003:16'],
      summary: 'Separated low-voltage/software behavior from an older corrosion allegation and removed universal motor, part-number and lubricant claims.',
    },
    [IDS.runningStick]: {
      confidence: 'medium',
      description: 'Ford SSM 50154 documents disabled running boards on certain 2018-2020 Navigator vehicles after a low-battery event, sometimes with DTC U3003:16. SSM 51737 documents a different 2022-2023 setting issue outside part of this page’s indexed range. A 2003 owner complaint alleges intermittent deployment and retraction and one injury, but that individual report is outside this page’s indexed years and cannot establish incidence or a common hardware cause.',
      solution: 'For an applicable 2018-2020 vehicle, diagnose the charging system and low-voltage event and restore the board setting to Auto. A board that physically sticks or cannot support weight needs mechanical inspection before use. Do not buy a motor, linkage, hinge, control module or lubricant from this page; Ford’s exact 2018-2020 source is a low-voltage/settings procedure, not a universal parts-replacement bulletin.',
      symptoms: ['running boards disabled or set to Off', 'intermittent deployment or retraction requiring inspection', 'possible U3003:16 after a low-voltage event'],
      dtcCodes: ['U3003:16'],
      summary: 'Bound the indexed page to the exact low-voltage SSM and labeled the older deployment allegation without inventing a common hardware remedy.',
    },
    [IDS.hvac]: {
      confidence: 'low',
      description: 'A review of 1,314 Navigator manufacturer-communication records did not identify an exact bulletin establishing a model-wide 2003-2014 blend-door-actuator failure, a universal clicking mechanism or an incidence rate. The indexed identity is retained, but the present evidence does not justify diagnosing every wrong-temperature or clicking complaint as an actuator.',
      solution: 'Have the HVAC system diagnosed for actuator command and feedback, door movement, control inputs, refrigerant performance, heater-core flow and wiring before replacing anything. Do not buy a blend-door actuator, HVAC control module or door assembly from this page; there is no verified universal retail part or model-wide manufacturer repair for this indexed claim.',
      symptoms: ['clicking from the HVAC case requiring diagnosis', 'wrong outlet temperature', 'temperature or mode door not responding correctly'],
      dtcCodes: [],
      summary: 'Downgraded an unsupported model-wide actuator claim and replaced automatic part replacement with system diagnosis.',
    },
    [IDS.liftgate]: {
      confidence: 'low',
      description: 'NHTSA complaint ODI 11187451 alleges that one stationary 2018 Navigator’s liftgate opened unexpectedly, with no injury or death reported. Ford SSM 49914 covers a different condition—an inoperative power liftgate on 2018-2021 Navigator vehicles caused by rear-gate trunk-module software. That SSM does not establish the cause of uncommanded opening, and one complaint does not prove a common sensor, latch, motor or module failure.',
      solution: 'If the liftgate moves without a command, keep people clear, disable hands-free operation if the owner manual permits and arrange diagnosis of keys, switches, sensors, latch state, wiring and module data. Use SSM 49914 only when the liftgate is inoperative and its criteria are met; it directs RGTM reprogramming. Do not buy a kick sensor, latch, strut, motor or module from this page because the uncommanded condition has no verified universal part or remedy.',
      symptoms: ['liftgate allegedly opens without an intended command', 'power liftgate inoperative on an applicable 2018-2021 vehicle'],
      dtcCodes: [],
      summary: 'Kept the single uncommanded-opening allegation separate from Ford’s inoperative-liftgate software SSM and removed unsupported hardware causes.',
    },
    [IDS.sync]: {
      confidence: 'high',
      description: 'Ford TSB 21-2411 covers certain 2020-2021 Navigator vehicles with SYNC 3 concerns including a frozen or blank touchscreen, connection and audio problems, and other software symptoms. Ford TSB 25-2055 covers 2022-2024 Navigator vehicles with general stability, intermittent reboot, wireless CarPlay or Android Auto, phone-audio, navigation/GPS and Alexa concerns. These sources do not cover every indexed 2018-2019 vehicle and do not establish a blanket APIM hardware failure.',
      solution: 'Confirm the SYNC generation, vehicle year, current software and exact symptom. TSB 21-2411 directs a SYNC 3 APIM software update for qualifying vehicles; TSB 25-2055 requires checking recent OTA history and available GWM, APIM and TCU updates before following its technician procedure. Do not buy an APIM, display, USB hub or replacement radio from this page; update eligibility and any later hardware diagnosis are vehicle-specific.',
      symptoms: ['frozen or blank touchscreen', 'intermittent system reboot', 'CarPlay, Android Auto, audio or navigation instability'],
      dtcCodes: [],
      summary: 'Split SYNC 3 and SYNC 4 evidence by model year and made software verification precede any hardware diagnosis.',
    },
  };
  if (!content[id]) throw new Error(`Missing Navigator content for ${id}`);
  return content[id];
}

function commerceDecisionFor(id) {
  const labels = {
    [IDS.tenR80Torque]: 'technician-only hydraulic diagnosis; no universal retail transmission part',
    [IDS.tenR80Shudder]: 'technician-only hydraulic diagnosis; no universal retail transmission part',
    [IDS.camCsp]: 'expired VIN-scoped program and technician repair; no universal retail timing part',
    [IDS.camTiming]: 'expired VIN-scoped program and technician repair; no universal retail timing part',
    [IDS.timingChain]: 'diagnosis first; listed VCT codes do not authorize a retail timing kit',
    [IDS.sparkSeize]: 'trained-technician Ford procedure; no universal retail plug or extractor',
    [IDS.sparkTwoPiece]: 'trained-technician Ford procedure; no universal retail plug or extractor',
    [IDS.sparkBreakage]: 'trained-technician Ford procedure; no universal retail plug or extractor',
    [IDS.airCompressor]: 'VIN- and diagnosis-specific air-suspension repair; no universal retail part',
    [IDS.airFailure]: 'VIN- and diagnosis-specific air-suspension repair; no universal retail part',
    [IDS.brakes]: 'free VIN-scoped dealer recall remedy; no retail part',
    [IDS.runningMotor]: 'year- and diagnosis-specific running-board procedure; no universal retail part',
    [IDS.runningStick]: 'year- and diagnosis-specific running-board procedure; no universal retail part',
    [IDS.hvac]: 'diagnosis required and no verified universal retail actuator',
    [IDS.liftgate]: 'uncommanded behavior has no universal replacement part',
    [IDS.sync]: 'software-first technician procedure; no universal retail APIM',
  };
  return labels[id];
}

function proposalFor(row) {
  const content = contentFor(row.id);
  return { ...clone(fullRecord(row)), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: content.symptoms, dtcCodes: content.dtcCodes, estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(row.id), communityRecommendations: [], fixParts: [],
    humanApproved: false, source: 'primary-source-audit', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary };
}

function evidenceFor(row) {
  return [
    `The frozen snapshot keeps ${row.id} published with its exact title, URL identity, indexed years, trims, engines, category, severity and related links.`,
    contentFor(row.id).summary,
    `Commerce boundary: ${commerceDecisionFor(row.id)}.`,
  ];
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Navigator').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 16 || !BLOCKER_IDS.every((id) => rows.some((row) => row.id === id))) throw new Error('Lincoln Navigator frozen coverage drifted');
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(row);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', commerceDecision: commerceDecisionFor(row.id), evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Lincoln', model: 'Navigator',
    completionStatement: 'All 16 frozen Lincoln Navigator pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 16 rows contain material source, safety, population or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 16 pages remain published with their exact frozen identity, vehicle metadata and canonical severity.',
      'Broader indexed year ranges remain for SEO continuity while the copy explicitly limits each source to its supported population.',
      'Recall and historical customer-program remedies are campaign-, VIN-, date- and configuration-scoped.',
      'Every named replaceable part is covered by an explicit dealer-only, technician-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'navigator-10r80-cause-narrowed', severity: 'critical-correction', recordIds: [IDS.tenR80Torque, IDS.tenR80Shudder], detail: 'TSB 25-2476 supports a CDF hydraulic leak diagnostic path, not a universal torque-converter shudder or fluid-only remedy.' },
      { code: 'navigator-spark-procedure-safety', severity: 'safety-correction', recordIds: [IDS.sparkSeize, IDS.sparkTwoPiece, IDS.sparkBreakage], detail: 'Ford requires room-temperature service and trained-professional removal; the former warm-engine and improvised chemical/tool advice was unsafe.' },
      { code: 'navigator-liftgate-evidence-mismatch', severity: 'critical-correction', recordIds: [IDS.liftgate], detail: 'One complaint alleges uncommanded opening, while the exact SSM addresses only an inoperative liftgate.' },
      { code: 'navigator-duplicate-identities-preserved', severity: 'seo-safety', recordIds: [IDS.tenR80Torque, IDS.tenR80Shudder, IDS.camCsp, IDS.camTiming, IDS.sparkSeize, IDS.sparkTwoPiece, IDS.sparkBreakage, IDS.airCompressor, IDS.airFailure, IDS.runningMotor, IDS.runningStick], detail: 'All overlapping indexed identities remain published; no deduplication, archive or redirect is proposed.' },
      { code: 'all-navigator-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Navigator page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
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
