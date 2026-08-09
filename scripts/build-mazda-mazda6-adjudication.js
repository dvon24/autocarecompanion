/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-mazda6-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MAZDA6']);

const IDS = Object.freeze({
  alternator: 'mazda-mazda6-alternator-failure-2003',
  clutch: 'mazda-mazda6-clutch-judder-2014',
  controlArm: 'mazda-mazda6-control-arm-ball-joint-2009',
  egr: 'mazda-mazda6-egr-valve-carbon-2014',
  crossmember: 'mazda-mazda6-front-subframe-cross-member-corrosion',
  fuelPump: 'mazda-mazda6-low-pressure-fuel-pump-impeller-cracking-engine-stall',
  connect: 'mazda-mazda6-mazda-connect-infotainment-freezing-reboot-loop',
  dashboard: 'mazda-mazda6-melting-sticky-dashboard-crash-pad',
  rearCaliper: 'mazda-mazda6-rear-caliper-seizing-2009',
  parkingBrake: 'mazda-mazda6-rear-parking-brake-caliper-corrosion-sticking',
  trailingArm: 'mazda-mazda6-rear-trailing-arm-bushing-2003',
  cylinderHead: 'mazda-mazda6-skyactiv-g-2-5t-turbo-cylinder-head-cracking-coolant-leak',
  intakeCarbon: 'mazda-mazda6-skyactiv-g-intake-valve-carbon-buildup',
  subframe: 'mazda-mazda6-subframe-rust-2003',
  takata: 'mazda-mazda6-takata-passenger-airbag-inflator-rupture',
  vvt: 'mazda-mazda6-vvt-actuator-2009',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.fuelPump, IDS.connect, IDS.dashboard, IDS.parkingBrake].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.clutch, IDS.rearCaliper, IDS.subframe, IDS.vvt].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10034634', '10076688', '10098343', '10098324', '10098875', '10099425', '10105628',
  '10120372', '10183607', '10186694', '10213402', '10228769', '10230890', '10237217',
  '11009658', '11011136', '11017701',
]);
const CAMPAIGNS = Object.freeze([
  '03V206000', '03V207000', '03V531000', '04V582000', '08V412000', '09E011000',
  '09E012000', '09E025000', '09V043000', '11V134000', '13V425000', '14V114000',
  '14V170000', '14V173000', '14V675000', '16V594000', '16V753000', '17V393000',
  '17V429000', '17V457000', '17V474000', '17V546000', '18V018000', '18V402000',
  '18V631000', '18V717000', '19V323000', '19V497000', '19V781000', '19V782000',
  '21V875000',
]);

const PDF_SOURCES = Object.freeze({
  manualShift: {
    title: 'Mazda TSB 05-002/17: Hard Shifting / Shift-Lever Vibration', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10120372-9999.pdf',
    localPath: 'C:/tmp/mazda6-sources/MC-10120372-9999.pdf', pages: 11,
    visualPages: Array.from({ length: 11 }, (_, index) => index + 1), bytes: 556167,
    sha256: 'bcf8684af3ce2ab503ee072052511f029c572ed67597e381bdcfc55282a644e3',
  },
  crossmemberRecall: {
    title: 'NHTSA Part 573 Report 19V323: 2011-2013 Mazda6 Front Crossmember Corrosion', type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V323-2981.PDF',
    localPath: 'C:/tmp/mazda6-sources/RCLRPT-19V323-2981.PDF', pages: 3, visualPages: [1, 2, 3], bytes: 217791,
    sha256: '01fd310550cec913ffd29b29f669edc9700d40816fbd4bb36c1cbdb1e6828f77',
  },
  fuelPumpRecall: {
    title: 'NHTSA Part 573 Report 21V875: Low-Pressure Fuel-Pump Impeller', type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V875-1378.PDF',
    localPath: 'C:/tmp/mazda6-sources/RCLRPT-21V875-1378.PDF', pages: 5,
    visualPages: [1, 2, 3, 4, 5], bytes: 219354,
    sha256: 'ecb57c91f904f99f06aa394325c4c982aff7d65cadb8f0df59b4f8b5da6711d0',
  },
  connectCsp13: {
    title: 'Mazda CSP13: Mazda Connect Infotainment Limited Warranty Extension', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017701-0001.pdf',
    localPath: 'C:/tmp/mazda6-sources/MC-11017701-0001.pdf', pages: 5,
    visualPages: [1, 2, 3, 4, 5], bytes: 538392,
    sha256: '2833d673f8515a8306fd3ba4a5ebe77bfdfadf4db5ec93b896cb84e5e632df30',
  },
  dashboardSsp: {
    title: 'Mazda SSPA0: 2009-2013 Mazda6 Sticky Dashboard Warranty Extension', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10118484-9999.pdf',
    localPath: 'C:/tmp/mazda6-sources/MC-10118484-9999.pdf', pages: 14,
    visualPages: Array.from({ length: 14 }, (_, index) => index + 1), bytes: 677847,
    sha256: '58e4af81b380f7694c06c537c9b29f75ae00b2d4bcae99ba469d8b070e8e5d74',
  },
  parkingBrakeRecall: {
    title: 'NHTSA Part 573 Report 17V393: Hand-Operated Parking-Brake Corrosion', type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V393-3791.PDF',
    localPath: 'C:/tmp/mazda6-sources/RCLRPT-17V393-3791.PDF', pages: 3, visualPages: [1, 2, 3], bytes: 216040,
    sha256: '8b4e42f5a916f53cf812f6acac7a74481b67225e074ce20b1ebcbbd0814f3af4',
  },
  cylinderHeadCsp11: {
    title: 'Mazda CSP11: 2018-2020 Mazda6 2.5T Cylinder-Head Coolant Leak', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011136-0001.pdf',
    localPath: 'C:/tmp/mazda6-sources/MC-11011136-0001.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 141659,
    sha256: 'a4c6a7109800e023787d332faf4d20e5bb3f4619efc4336d67afefc9f70ae08c',
  },
  cylinderHeadTsb: {
    title: 'Mazda TSB 01-002/23: Coolant Leaks at Cylinder Head', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10230890-0001.pdf',
    localPath: 'C:/tmp/mazda6-sources/MC-10230890-0001.pdf', pages: 14,
    visualPages: Array.from({ length: 14 }, (_, index) => index + 1), bytes: 1024751,
    sha256: 'fd20329813938e09059af5b7983b9b7f0cf5ae24cf6b3e02cc1feb5bcdce8eed',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recalls datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
  takata: { title: 'NHTSA Takata Do Not Drive Warning', type: 'nhtsa', url: 'https://www.nhtsa.gov/takata-recall-spotlight/do-not-drive-warning' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 36, '2005-2009': 44, '2010-2014': 32, '2015-2019': 805, '2020-2024': 416, '2025-2026': 82 },
  totalRows: 1415, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 24, post: 74 }, totalRows: 98,
  campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const d = OTHER_SOURCES.datasets;
  const map = {
    [IDS.alternator]: [d], [IDS.clutch]: [d, PDF_SOURCES.manualShift], [IDS.controlArm]: [d],
    [IDS.egr]: [d], [IDS.crossmember]: [PDF_SOURCES.crossmemberRecall],
    [IDS.fuelPump]: [PDF_SOURCES.fuelPumpRecall], [IDS.connect]: [d, PDF_SOURCES.connectCsp13],
    [IDS.dashboard]: [PDF_SOURCES.dashboardSsp], [IDS.rearCaliper]: [d, PDF_SOURCES.parkingBrakeRecall],
    [IDS.parkingBrake]: [PDF_SOURCES.parkingBrakeRecall], [IDS.trailingArm]: [d],
    [IDS.cylinderHead]: [PDF_SOURCES.cylinderHeadCsp11, PDF_SOURCES.cylinderHeadTsb],
    [IDS.intakeCarbon]: [d], [IDS.subframe]: [d, PDF_SOURCES.crossmemberRecall],
    [IDS.takata]: [d, OTHER_SOURCES.takata], [IDS.vvt]: [d],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda6 row ${id}`);
  return map[id].map(citation);
}

const CONTENT = Object.freeze({
  [IDS.alternator]: {
    confidence: 'low',
    description: 'The complete 1,415-row Mazda6 manufacturer-communication inventory did not establish premature alternator, rectifier-diode or voltage-regulator failure across 2003-2008 vehicles. The charging-system records found in the inventory concern later i-ELOOP and diagnostic conditions, not the frozen first-generation failure rate, mileage window or exhaust-heat mechanism.',
    solution: 'Test battery state, belt drive, cable voltage drop, charging voltage and parasitic draw before selecting a repair. If testing identifies a failed generator, use the VIN and installed engine to obtain the current Mazda service part. Do not buy an alternator, battery, tensioner or heat shield from this page; no reviewed source establishes the frozen failure identity or a universal parts bundle.',
    symptoms: ['battery or charging warning requires system testing', 'dimming, no-start or electrical interruption requires voltage-drop and charging diagnosis'],
    summary: 'Removed the fabricated video, unrelated commerce, mileage claim and unsupported universal alternator replacement advice; held the identity.',
  },
  [IDS.clutch]: {
    confidence: 'low', reportCount: 0,
    description: 'Mazda TSB 05-002/17 applies to specified 2014-2016 Mazda6 six-speed manual vehicles and documents hard shifting, jumping out of third gear, or shift-lever vibration. Its clutch hubs are internal synchronizer-hub assemblies; it does not document friction-clutch judder, a dual-mass flywheel defect, or the frozen 2014-2021 scope.',
    solution: 'Distinguish engagement shudder from an internal shift concern before ordering parts. For a VIN and symptom within TSB 05-002/17, a qualified transmission technician should follow Mazda\'s symptom- and transmission-number-specific procedure. Do not buy the frozen clutch kit or flywheel from this page; the cited bulletin does not prescribe either item for this identity.',
    symptoms: ['hard shifting into third through sixth gear on specified 2014-2016 manuals', 'third-gear jump-out or third/fourth shift-lever vibration', 'engagement shudder requires separate clutch diagnosis'],
    summary: 'Proposed the unsupported 950-owner count as zero and separated Mazda\'s synchronizer-hub bulletin from the frozen friction-clutch identity.',
  },
  [IDS.controlArm]: {
    confidence: 'low',
    description: 'The complete Mazda6 inventory did not establish premature lower-control-arm ball-joint wear on 2009-2013 vehicles or the claimed recall 14V373. That campaign is not in the Mazda6 recall inventory. The closest Mazda records concern a 2014-2017 steering-gear inner ball-joint contact noise and a 2014-2016 wet lower-control-arm bushing creak, not ball-joint boot failure or separation.',
    solution: 'If steering feels loose or the suspension clunks, inspect each joint, bushing, control arm, wheel bearing, tire and steering component and measure play against Mazda specifications. Do not assume both lower arms need replacement or that a recall applies. Do not buy a control arm or ball joint from this page; side, build, failed component and current VIN fitment are unverified.',
    symptoms: ['clunking, pulling or steering looseness requires suspension inspection', 'visible boot damage or measurable joint play requires component-specific diagnosis'],
    summary: 'Removed the false recall, fabricated video, mileage claim and both-side parts prescription; held the unsupported identity.',
  },
  [IDS.egr]: {
    confidence: 'low',
    description: 'Mazda communications document a narrow 2018-2019 rough-idle/P0300 condition in which carbon can prevent the EGR valve from closing fully. They do not establish the frozen 2014-2021 EGR-carbon-and-coolant-leak identity, a Mazda6-wide coolant-loss mechanism, or a cleaning interval. The separate 2018-2020 2.5T cylinder-head coolant program is not an EGR-valve leak.',
    solution: 'Preserve codes and freeze-frame data and test the exact rough-idle, misfire or coolant-loss path. Apply the EGR communication only to its specified 2018-2019 condition; diagnose coolant loss separately. Do not buy an EGR valve, cooler, intake part or cleaning kit from this page, and do not use an unsupported high-rpm or chemical-cleaning prescription.',
    symptoms: ['rough idle with P0300 on a specified 2018-2019 vehicle may require EGR diagnosis', 'coolant loss requires a separate pressure and leak-location diagnosis'],
    summary: 'Bounded the narrow EGR/P0300 record and separated it from the unsupported coolant-leak and 2014-2021 identity.',
  },
  [IDS.crossmember]: {
    confidence: 'low',
    description: 'Recall 2818I / NHTSA 19V323 covers certain 2011-2013 Mazda6 vehicles sold or registered in listed salt states. Salt corrosion of the front crossmember can weaken the passenger-side lower-control-arm mounting point and alter steering alignment. The frozen 2009-2016 metadata is broader than the exact recall population.',
    solution: 'Check the VIN and registration history for recall 2818I. An authorized Mazda dealer should inspect the crossmember and apply the free campaign remedy specified for its condition, which may include a side member, drain hose, protective wax or improved crossmember. Do not buy a crossmember from this page; eligibility and remedy are VIN- and inspection-specific.',
    symptoms: ['steering wheel off-center or abnormal noise may accompany severe crossmember corrosion', 'salt-exposed underbody requires recall-status and structural inspection'],
    summary: 'Replaced secondary citations with the exact Part 573 report and bounded the recall to 2011-2013 salt-state vehicles; held the over-broad indexed year metadata.',
  },
  [IDS.fuelPump]: {
    confidence: 'high',
    description: 'Recall 5321K / NHTSA 21V875 covers certain 2018 Mazda6 vehicles built with the subject low-pressure fuel pump. An inadequately dense impeller can develop surface cracking, deform and interfere with the pump body, causing fuel-pump failure, no-start or an engine stall.',
    solution: 'Check the VIN for recall 5321K. If the vehicle is included, an authorized Mazda dealer will replace the affected fuel pump with the improved part free of charge. Do not buy a retail pump from this page; the recall population and replacement are VIN-specific.',
    symptoms: ['check-engine light or rough operation may precede fuel-pump failure', 'engine no-start or stall while driving'],
    summary: 'Retained the exact recall identity, replaced secondary material with the Part 573 report and kept the free VIN-specific remedy commerce-free.',
  },
  [IDS.connect]: {
    confidence: 'high',
    description: 'Mazda communications document multiple distinct infotainment paths: 2014 navigation freezes, 2016 software-correctable black-screen/freezing/reboot concerns, a narrow 2016 CMU hardware shutdown, and diagnostic guidance through 2021. CSP13 provides a 24-month limited warranty extension for software updates and/or necessary CMU repair or replacement only on eligible 2016-2021 Mazda6 vehicles with CSP13 shown in Warranty Vehicle Inquiry; it does not cover every screen, switch, SD card, reader or wiring concern.',
    solution: 'Record the exact display behavior and current software version, then use Mazda\'s symptom troubleshooting before replacing hardware. Ask a Mazda dealer to check Warranty Vehicle Inquiry for CSP13 eligibility on 2016-2021 vehicles. Do not buy a CMU, display or SD card from this page; software, hardware and peripheral faults require different remedies and current VIN-specific parts.',
    symptoms: ['screen freezes, goes black or reboots', 'system shuts down and only recovers after an ignition cycle', 'USB, SD, navigation or favorites concern may require software or component-specific diagnosis'],
    summary: 'Separated software, hardware and peripheral paths, bounded CSP13 eligibility, and removed the one-size-fits-all CMU replacement claim.',
  },
  [IDS.dashboard]: {
    confidence: 'high',
    description: 'Mazda SSPA0 applies to certain 2009-2013 Mazda6 vehicles produced from February 4, 2008 through August 24, 2012. Heat and humidity can deteriorate the crash-pad surface until it becomes sticky. The program extended coverage for verified sticky surfaces to 10 years from the original warranty start date; discoloration, warping and splitting were excluded.',
    solution: 'Verify the sticky-surface condition and the vehicle\'s VIN/build range. Ask a Mazda dealer whether any coverage or goodwill remains, but do not promise a free repair in 2026 because the ten-year extension may have expired. Do not buy a crash pad or coating kit from this page; diagnosis, current coverage and the VIN-specific service part must be confirmed.',
    symptoms: ['sticky or tacky upper dashboard surface after heat exposure', 'glare or residue from a deteriorated crash-pad surface'],
    summary: 'Replaced secondary/forum material with Mazda SSPA0, preserved the indexed identity, and removed the outdated promise of automatic free coverage.',
  },
  [IDS.rearCaliper]: {
    confidence: 'low', reportCount: 0,
    description: 'The complete Mazda6 inventory did not establish broad rear-caliper seizure across 2009-2021 vehicles. Exact records instead cover a 2014 rear-pad rattle, a 2016 rear-brake squeak, 2016-2020 electric-parking-brake disc rust/grinding, and the separate 2014-2015 hand-operated parking-brake recall. Those conditions do not prove a universal seized-caliper defect or an annual rebuild requirement.',
    solution: 'Inspect pad movement and wear, rotor condition, hydraulic pressure, slide pins, parking-brake mechanism and electric-parking-brake service state as equipped. Apply recall 1217F only to eligible hand-operated 2014-2015 vehicles. Do not buy calipers, rebuild kits, pads or rotors from this page; the brake configuration and failed component must be confirmed first.',
    symptoms: ['dragging, heat, odor or uneven pad wear requires immediate brake inspection', 'rear-brake squeak, rattle or grinding may have distinct causes'],
    summary: 'Proposed the unsupported 1,200-owner count as zero and separated four narrow brake records from the frozen universal caliper-seizure identity.',
  },
  [IDS.parkingBrake]: {
    confidence: 'high',
    description: 'Recall 1217F / NHTSA 17V393 covers 2014-2015 Mazda6 vehicles equipped with a hand-operated parking-brake lever. Reduced boot sealing can allow water into the rear brake caliper; the actuator shaft may corrode and bind, reducing parking-brake holding force or causing brake drag.',
    solution: 'Check the VIN and parking-brake type for recall 1217F. An authorized Mazda dealer will inspect both rear actuator shafts and, free of charge, replace a corroded caliper assembly or install the modified protective boot kit when no corrosion is present. Do not buy a caliper or boot kit from this page; the campaign remedy is VIN- and inspection-specific.',
    symptoms: ['reduced parking-brake holding force on a slope', 'rear brake drag after releasing the hand-operated parking brake'],
    summary: 'Retained the exact recall identity and replaced secondary material with the official Part 573 defect and remedy boundaries.',
  },
  [IDS.trailingArm]: {
    confidence: 'low',
    description: 'The complete Mazda6 manufacturer-communication and recall inventory did not establish recurring rear trailing-arm bushing deterioration across 2003-2008 vehicles. No reviewed primary record supports the frozen mileage range, polyurethane substitution, both-side replacement rule or generic alignment prescription.',
    solution: 'Inspect rear links, bushings, fasteners, springs, dampers, wheel bearings and alignment before identifying a failed location. Use the VIN and current Mazda parts catalog only after the worn component is confirmed. Do not buy a trailing-arm bushing, polyurethane kit or complete arm from this page; exact fitment and the failure identity are not established.',
    symptoms: ['rear clunk, instability or abnormal tire wear requires full suspension inspection'],
    summary: 'Removed the fabricated video, unsupported mileage and universal bushing prescription; held the unverified identity.',
  },
  [IDS.cylinderHead]: {
    confidence: 'low',
    description: 'Mazda TSB 01-002/23 and CSP11 document coolant leaks at the cylinder head around the exhaust manifold on specified 2018-2020 Mazda6 SKYACTIV-G 2.5T vehicles produced before March 25, 2020. CSP11 extends coverage for eligible vehicles to 10 years or 120,000 miles. The sources do not include 2021 Mazda6 vehicles, so the frozen indexed year scope is over-broad.',
    solution: 'Pressure-test and locate the leak. If it is at the cylinder-head areas shown in TSB 01-002/23, have a Mazda dealer check CSP11 in Warranty Vehicle Inquiry and follow Mazda\'s repair procedure. Do not buy a cylinder head, gasket set or engine from this page; eligibility, leak location and the VIN-specific repair must be confirmed.',
    symptoms: ['coolant leak at the cylinder head around the exhaust manifold', 'low coolant, overheating concern or coolant/oil mixing requires prompt diagnosis'],
    summary: 'Replaced secondary sources with TSB 01-002/23 and CSP11 and bounded coverage to specified 2018-2020 2.5T vehicles; held the 2021 metadata conflict.',
  },
  [IDS.intakeCarbon]: {
    confidence: 'low',
    description: 'The complete Mazda6 communication inventory did not establish a recurring intake-valve carbon-buildup defect across 2014-2021 SKYACTIV-G engines. The reviewed carbon records concern a 2003-2009 throttle-body deposit condition and a narrow 2018-2019 EGR-valve/P0300 condition, not an intake-valve walnut-blasting interval or Mazda6-wide direct-injection failure.',
    solution: 'For rough running or misfire, preserve codes and freeze-frame data and test ignition, fueling, compression, air leaks, EGR operation and intake deposits as indicated. Inspect intake valves before recommending cleaning. Do not buy a walnut-blasting kit, catch can or chemical cleaner from this page; the mechanism, engine and service need are unverified.',
    symptoms: ['rough idle, misfire or power loss requires evidence-based diagnosis', 'intake deposits require direct inspection or test evidence'],
    summary: 'Removed unsupported maintenance, catch-can and high-rpm prescriptions; held the broad intake-carbon identity.',
  },
  [IDS.subframe]: {
    confidence: 'low', reportCount: 0,
    description: 'The complete inventory does not support broad front-and-rear subframe, rocker-panel and underbody structural corrosion across 2003-2015 Mazda6 vehicles or the claimed TSB 09-007/15 coverage. The exact federal action is recall 19V323 for the front crossmember on certain 2011-2013 salt-state vehicles, which is already represented by a separate indexed page.',
    solution: 'Have structural corrosion inspected and documented by a qualified body or chassis professional. Check the VIN for exact open recalls, including 19V323 when applicable. Do not rely on a nonexistent broad coverage promise and do not buy a subframe or rust-treatment product from this page; the affected structure, repairability and coverage must be established.',
    symptoms: ['visible structural corrosion or perforation requires professional inspection', 'alignment change or suspension-mount damage requires immediate evaluation'],
    summary: 'Proposed the unsupported 3,200-owner count as zero, removed false TSB/coverage and emissions codes, and held the broad identity that overlaps an exact recall page.',
  },
  [IDS.takata]: {
    confidence: 'low',
    description: 'The Mazda6 recall inventory contains multiple Takata campaigns with different model years, locations and geographic phases. Do Not Drive remedies explicitly cover campaigns for 2003-2008 and 2009-2012 vehicles, including replacement inflators installed during earlier recalls. A 2013 passenger-inflator campaign exists, but the reviewed record does not carry the same Do Not Drive instruction. The frozen 2003-2013 title therefore overgeneralizes the warning.',
    solution: 'Enter the VIN in the NHTSA and Mazda recall lookup before driving or arranging service. Follow every active Do Not Drive instruction exactly and contact Mazda or roadside assistance for transport when the VIN is included. The remedy is free dealer replacement. Do not buy an airbag or inflator from this page and do not attempt this explosive-device repair yourself.',
    symptoms: ['open Takata recall or Do Not Drive instruction shown for the VIN', 'airbag warning requires separate restraint-system diagnosis'],
    summary: 'Removed secondary citations and bounded Do Not Drive advice to the exact VIN/campaign rather than every 2003-2013 vehicle; held the over-broad title.',
  },
  [IDS.vvt]: {
    confidence: 'low', reportCount: 0,
    description: 'Mazda communications document several different valve-timing conditions: startup VVT noise on 2003-2008 vehicles, a 2007 stretched-chain rattle, and P0011/P0012 from VVT actuator spring-shaft fatigue on specified 2015 vehicles. They do not establish one exhaust-side actuator-and-solenoid defect across 2009-2021 MZR and SKYACTIV engines, universal sludge causation or the frozen parts numbers.',
    solution: 'Preserve codes and oil-condition history, identify the installed engine, and test mechanical timing, oil pressure, actuator operation and control circuits before replacement. Apply the relevant Mazda procedure only to its exact year, engine, symptom and code. Do not buy an actuator, solenoid or timing-chain kit from this page; the frozen cross-generation parts bundle is not verified.',
    symptoms: ['startup rattle or timing codes require engine- and year-specific diagnosis', 'P0011 or P0012 on a specified 2015 vehicle may involve actuator spring-shaft fatigue'],
    summary: 'Proposed the unsupported 1,400-owner count as zero and separated three narrow records from the frozen cross-generation VVT identity and parts bundle.',
  },
});

function contentFor(id) { const value = CONTENT[id]; if (!value) throw new Error(`Unexpected Mazda6 row ${id}`); return value; }
function commerceDecisionFor(id) {
  const dealer = new Set([IDS.crossmember, IDS.fuelPump, IDS.parkingBrake, IDS.cylinderHead, IDS.takata]);
  return dealer.has(id)
    ? 'Dealer-only or VIN-specific remedy; no universal retail part is authorized.'
    : 'No universal retail part; the failed component, configuration and current VIN fitment require diagnosis.';
}
function identityConflictFor(id) {
  const map = {
    [IDS.alternator]: 'No primary record establishes the frozen first-generation premature alternator identity, mileage window or heat mechanism.',
    [IDS.clutch]: 'The exact bulletin concerns internal synchronizer/clutch hubs and shifting, not friction-clutch judder or a dual-mass flywheel.',
    [IDS.controlArm]: 'The claimed recall is absent and the closest Mazda records concern later steering-gear contact or wet bushing noise, not 2009-2013 ball-joint wear.',
    [IDS.egr]: 'The exact EGR record is a narrow 2018-2019 P0300 condition and does not support the 2014-2021 coolant-leak identity.',
    [IDS.crossmember]: 'The exact recall covers certain 2011-2013 salt-state vehicles, while frozen metadata exposes 2009-2016.',
    [IDS.rearCaliper]: 'Exact brake records are narrow and configuration-specific; none supports universal 2009-2021 caliper seizure.',
    [IDS.trailingArm]: 'No reviewed primary record establishes recurring 2003-2008 trailing-arm-bushing deterioration.',
    [IDS.cylinderHead]: 'The exact TSB and CSP cover specified 2018-2020 2.5T vehicles, while frozen metadata includes 2021.',
    [IDS.intakeCarbon]: 'No reviewed primary record establishes Mazda6-wide intake-valve carbon buildup or the frozen maintenance prescriptions.',
    [IDS.subframe]: 'The frozen broad underbody identity and claimed coverage are unsupported and overlap the separate exact front-crossmember recall page.',
    [IDS.takata]: 'The exact campaigns do not apply the Do Not Drive instruction uniformly across every frozen 2003-2013 model year.',
    [IDS.vvt]: 'The frozen identity merges different engine generations and three narrow timing records into one universal failure and parts bundle.',
  };
  return map[id] || null;
}
function evidenceFor(id) {
  const map = {
    [IDS.alternator]: ['The complete 1,415-row inventory found no exact 2003-2008 premature-alternator communication.', 'Later charging records concern i-ELOOP or other diagnostics and cannot be back-applied.'],
    [IDS.clutch]: ['TSB 05-002/17 was rendered in full and covers internal 3/4 and 5/6 clutch hubs, gears and synchronizer rings.', 'It is limited to specified 2014-2016 six-speed manuals and does not prescribe a friction clutch or flywheel.'],
    [IDS.controlArm]: ['Campaign 14V373 is absent from all 31 Mazda6 recall campaigns.', 'Closest records concern later inner-ball-joint steering-gear contact and wet control-arm-bushing noise.'],
    [IDS.egr]: ['Communications 10186694 and 10199713 document a narrow 2018-2019 P0300/EGR closing condition.', 'No source joins that condition to the frozen coolant-leak or 2014-2021 claim.'],
    [IDS.crossmember]: ['The rendered Part 573 report establishes recall 19V323, salt-state registration and 2011-2013 production boundaries.', 'Its remedy is free and inspection-dependent.'],
    [IDS.fuelPump]: ['The rendered Part 573 report establishes one 2018 Mazda6 population, impeller deformation, stall risk and free pump replacement.'],
    [IDS.connect]: ['Communications establish distinct software, CMU-hardware and navigation paths from 2014 through 2021.', 'Rendered CSP13 limits extended coverage to eligible 2016-2021 VINs and excludes unrelated components.'],
    [IDS.dashboard]: ['All 14 SSPA0 pages were rendered and establish a sticky surface on specified 2009-2013 VIN/build ranges.', 'The ten-year extension excludes discoloration, warping and splitting and may now be expired.'],
    [IDS.rearCaliper]: ['Exact records cover pad rattle, pad squeak, EPB disc rust/grinding and a hand-brake recall—not one broad seized-caliper defect.'],
    [IDS.parkingBrake]: ['The rendered Part 573 report limits 17V393 to 2014-2015 hand-operated parking brakes and specifies inspection-based free remedies.'],
    [IDS.trailingArm]: ['No exact trailing-arm-bushing communication or recall was found in the complete inventory.'],
    [IDS.cylinderHead]: ['Rendered TSB 01-002/23 identifies cracks near the exhaust-manifold area and a cylinder-head repair.', 'Rendered CSP11 limits Mazda6 coverage to specified 2018-2020 2.5T VIN/build ranges.'],
    [IDS.intakeCarbon]: ['No exact intake-valve-carbon communication was found; nearest carbon records concern throttle body or EGR.'],
    [IDS.subframe]: ['No TSB 09-007/15 or broad subframe warranty program was found.', 'The exact 19V323 crossmember recall is narrower and already has its own page.'],
    [IDS.takata]: ['Flat recall records show multiple campaigns and Do Not Drive remedies for 2003-2012 populations.', 'The reviewed 2013 passenger-inflator campaign does not carry the same instruction, so VIN lookup is required.'],
    [IDS.vvt]: ['Communications 10034634, 10039251 and 10099425 describe different years, mechanisms and engines.', 'No record supports a universal 2009-2021 actuator, solenoid and chain replacement bundle.'],
  };
  return { primaryEvidence: map[id], limitations: 'No owner-frequency rate, retail fitment, warranty eligibility or failed component is inferred beyond the cited primary source.' };
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before), description: content.description, solution: content.solution,
    confidence: content.confidence, symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: content.reportCount ?? before.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazda6').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 16) throw new Error(`Expected 16 frozen Mazda6 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const conflict = identityConflictFor(row.id);
    return {
      id: row.id,
      action: conflict ? 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' : 'retain_indexed_identity_and_accuracy_cleanup',
      identityReviewRequired: Boolean(conflict), identityConflict: conflict,
      reason: contentFor(row.id).summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id),
      before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mazda', model: 'Mazda6',
    completionStatement: 'All 16 frozen Mazda6 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Twelve frozen identities or indexed year scopes conflict with primary evidence; no catalog write is authorized.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 16 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The four fabricated nonzero report counts are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'A recall, bulletin or warranty program is not expanded beyond its exact VIN, build, component, symptom and coverage boundary.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit dealer-only or no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'mazda6-identity-holds', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Twelve frozen titles or indexed year scopes overstate, broaden or conflict with exact primary evidence and cannot be silently rewritten.' },
      { code: 'mazda6-supported-identities', severity: 'supported', recordIds: RETAIN_IDS, detail: 'Four identities have bounded primary support and retain exact frozen title and vehicle metadata.' },
      { code: 'mazda6-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Frozen 950-, 1,200-, 3,200- and 1,400-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'mazda6-safety-boundaries', severity: 'safety-correction', recordIds: [IDS.crossmember, IDS.fuelPump, IDS.parkingBrake, IDS.cylinderHead, IDS.takata].sort(), detail: 'Recall and warranty advice is bounded to exact VIN/build/registration/program eligibility and free dealer remedies.' },
      { code: 'all-mazda6-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Mazda6 page is removed, merged, redirected or allowed to lose indexed identity while this packet is reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), bulletinInventory: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { frozenRecordCount: 16, decisionCount: 16, retainCount: RETAIN_IDS.length, holdCount: BLOCKER_IDS.length, fabricatedReportCountsProposedZero: FABRICATED_REPORT_COUNT_IDS.length, pdfCount: Object.keys(PDF_SOURCES).length, pdfPageCount: Object.values(PDF_SOURCES).reduce((sum, source) => sum + source.pages, 0), visuallyReviewedPages: Object.values(PDF_SOURCES).reduce((sum, source) => sum + source.visualPages.length, 0), catalogWrites: 0, statusChanges: 0, identityChanges: 0, commerceLinksAdded: 0 },
    rows,
  };
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, packetSha256: hashValue(packet), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
if (require.main === module) main();
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, identityConflictFor, proposalFor };
