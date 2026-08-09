/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-g-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze([
  'G-CLASS', 'G CLASS', 'G500', 'G 500', 'G550', 'G 550', 'G55 AMG', 'G 55 AMG',
  'AMG G 55', 'G63 AMG', 'G 63 AMG', 'AMG G 63', 'G 320', 'G320', 'G 320 CDI',
  'G 350', 'G350', 'G 350 CDI', 'G 350 D', 'G 350 BLUETEC',
]);
const SEARCH_TERMS = Object.freeze([
  'transmission', 'shift', 'jerk', 'adaptation', 'corrosion', 'rust', 'wiring harness',
  'oil cooler', 'ABS', 'ESC', 'fuel pump', 'impeller', 'M157', 'M177', 'cylinder',
  'camshaft', 'oil consumption', 'OM642', 'oil cooler seal', 'swirl flap', 'intake manifold',
  'COMAND', 'MBUX', 'freeze', 'black screen', 'reboot', 'door hinge', 'door sag',
  'door joint', 'door adjustment', 'wind noise',
  'axle seal', 'differential leak', 'steering damper', 'wander', 'transfer case', 'output seal',
]);
const IDS = Object.freeze({
  transmission: 'mercedes-benz-g-class-9g-tronic-amg-speedshift-harsh-jerky-shifting-requiring-adap',
  corrosion: 'mercedes-benz-g-class-body-tailgate-underbody-frame-corrosion',
  wiringRecall: 'mercedes-benz-g-class-front-axle-wiring-harness-chafe-against-oil-cooler-causing-a',
  fuelRecall: 'mercedes-benz-g-class-fuel-pump-impeller-deformation-causing-loss-drive-power',
  m157: 'mercedes-benz-g-class-m157-5-5l-biturbo-v8-cylinder-scoring-camshaft-adjuster-wear',
  m177: 'mercedes-benz-g-class-m177-4-0l-twin-turbo-v8-excessive-oil-consumption-cylinder-s',
  om642Oil: 'mercedes-benz-g-class-om642-3-0l-v6-diesel-oil-cooler-seal-leak',
  om642Swirl: 'mercedes-benz-g-class-om642-diesel-intake-manifold-swirl-flap-failure',
  infotainment: 'mercedes-g-class-comand-mbux-freeze-2013',
  doorHinge: 'mercedes-g-class-door-hinge-sag-2019',
  axleSeal: 'mercedes-g-class-front-axle-seal-leak-2000',
  steeringDamper: 'mercedes-g-class-steering-damper-wear-2000',
  transferLeak: 'mercedes-g-class-transfer-case-fluid-leak-2013',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.transmission, IDS.wiringRecall, IDS.fuelRecall].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([
  IDS.infotainment, IDS.doorHinge, IDS.axleSeal, IDS.steeringDamper, IDS.transferLeak,
].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10167563', '10205234', '10205237', '11005331', '11007728', '11010455', '11010970',
  '11012129', '11025100', '11028270', '11029045', '11032887',
]);
const CAMPAIGNS = Object.freeze([
  '08V303000', '09V453000', '10V366000', '12V380000', '17V178000', '17V250000',
  '17V713000', '17V817000', '18V761000', '19V787000', '19V788000', '19V820000',
  '20V090000', '20V247000', '21V058000', '21V230000', '21V353000', '21V483000',
  '21V527000', '21V564000', '21V961000', '22V168000', '22V365000', '23V097000',
  '23V445000', '23V880000', '24V170000', '24V659000', '25V254000',
]);
const PDF_SOURCES = Object.freeze({
  wiringRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 23V-097 — front axle wiring harness chafe',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V097-6093.PDF',
    localPath: 'C:/tmp/mercedes-gclass-23v097.pdf',
    pages: 4,
    visualPages: [1, 2, 3, 4],
    bytes: 216047,
    sha256: '5074ced7c558bb40f87b4fcab540b28b92ecac19e6c97e5b043140c581db9a6a',
  },
  fuelRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 23V-445 — fuel-pump impeller deformation',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V445-7776.PDF',
    localPath: 'C:/tmp/mercedes-gclass-23v445.pdf',
    pages: 14,
    visualPages: [2, 5, 10, 11, 13, 14],
    bytes: 233210,
    sha256: 'fa90785629f4d41b642011caa517963da065539d1f7a5e0d0c8c4abcb25259f5',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 1, '2005-2009': 2, '2010-2014': 65, '2015-2019': 28, '2020-2024': 190, '2025-2026': 257 },
  totalRows: 543,
  relevantRowCount: 138,
  uniqueRelevantCommunications: 71,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 2, post: 882 },
  totalRows: 884,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.transmission]: {
    description: 'Mercedes communication 11007728 provides a diagnostic workflow for 725.0/725.1 shift complaints on 2019-2024 G 550 vehicles and specifically calls for reproducibility, transmission-health data, standstill and drive adaptations, torque-converter evaluation, and separation of transfer-case jolting from transmission faults. Communication 11032887 separately identifies harsh low-gear shifts from incorrectly installed rotational-speed sensors on a limited group of 2025-produced VGS units. These records support a harsh/jerky shifting and adaptation identity, but not a universal wet-clutch drift mechanism, a fixed 40,000-50,000-mile service interval, or automatic valve-body and clutch-pack replacement across every 2019-2025 G 550 and AMG G 63.',
    solution: 'Record the exact shift, gear, temperature, drive mode and load, preserve the initial quick test, EEPROM and transmission-health data, and compare with a like vehicle where appropriate. Use XENTRY IPR and the symptom-specific adaptation or VGS production-date path; isolate the transfer case before attributing a jolt to the transmission. Do not buy a valve body, conductor plate, clutch pack or transmission from this page; the failed path and fitment are not established.',
    symptoms: ['exact gear and operating condition documented', 'initial EEPROM and transmission-health data preserved', 'transmission and transfer-case paths isolated'],
    affectedSystems: ['725-series automatic transmission', 'VGS control unit', 'transfer-case interaction'],
    conflict: null,
    evidence: ['11007728 supports adaptation-based diagnosis for reproducible shift complaints and warns against ineffective repairs.', '11032887 supports a limited VGS rotational-speed-sensor installation condition, not a universal hardware defect.', 'No exact record supports the stored service interval, broad wet-clutch mechanism or repair prices.'],
    summary: 'Retained the shifting/adaptation identity while replacing unsupported maintenance, mechanism and replacement claims.',
    sources: ['datasets'],
  },
  [IDS.corrosion]: {
    description: 'The reviewed NHTSA manufacturer-communication and recall corpus does not establish the frozen 2000-2018 G-Class body, tailgate, underbody-frame and rear-strut-mount corrosion identity. It contains condition-specific water-ingress and seal procedures, but no exact Mercedes or NHTSA record proving that unchanged late-1970s metallurgy or rustproofing causes widespread tailgate, door, sill, windscreen-channel, frame-tube and structural mount corrosion across every listed trim and year.',
    solution: 'Have visible corrosion inspected by a qualified body or frame specialist, with the exact location, depth, perforation, drainage path and structural effect documented before treatment. Follow market- and VIN-specific Mercedes body-repair procedures for any structural work. Do not buy repair panels, frame sections, coatings or cavity wax from this page; the affected structure, repair specification and fitment are not established.',
    symptoms: ['exact corrosion location and depth documented', 'cosmetic and structural corrosion separated', 'water-ingress path checked before repair'],
    affectedSystems: ['body panels', 'ladder frame', 'body drainage and seals'],
    conflict: 'No exact reviewed primary source supports the frozen multi-location corrosion identity, asserted design cause or full 2000-2018 scope.',
    evidence: ['The G-Class communication corpus contains water-ingress and sealing procedures but no exact record for the frozen corrosion bundle.', 'The stored metallurgy, rustproofing, prevalence and structural-repair claims come from non-primary articles/forums.', 'No exact source supports the stored repair prices or universal preventive treatment.'],
    summary: 'Removed unsupported corrosion prevalence, design-cause and repair claims while holding the indexed identity for review.',
    sources: ['datasets'],
  },
  [IDS.wiringRecall]: {
    description: 'NHTSA recall 23V097 covers 11,018 model-year 2019-2021 G 550 vehicles and 15,098 model-year 2019-2021 AMG G 63 vehicles. The front axle wiring harness can contact and chafe on an auxiliary oil cooler because of a narrow passage, potentially damaging signal wires and impairing ABS and ESP functionality. The Part 573 narrative refers more broadly to 2019-2022 G-Class, while its vehicle-population tables specifically list the two frozen trims as 2019-2021; VIN eligibility controls.',
    solution: 'Check the VIN for NHTSA recall 23V097 / Mercedes campaign 2023030005. An authorized Mercedes-Benz dealer will inspect the front axle wiring harness, replace it if necessary, or install a protective sleeve when replacement is not needed. Do not buy a harness or sleeve from this page; recall eligibility, harness variant and the free remedy are VIN-specific.',
    symptoms: ['VIN recall eligibility checked', 'ABS or ESP warning documented', 'front axle harness inspected under the recall'],
    affectedSystems: ['front axle wiring harness', 'ABS', 'ESP'],
    conflict: null,
    evidence: ['Part 573 page 1 lists 2019-2021 G 550 and AMG G 63 populations totaling 26,116 vehicles.', 'Pages 1-3 establish oil-cooler contact, harness chafe and possible ABS/ESP impairment.', 'Page 4 prescribes inspection, protective sleeve installation or harness replacement.'],
    summary: 'Retained the exact wiring-harness recall identity with VIN-specific population and remedy boundaries.',
    sources: ['wiringRecall'],
  },
  [IDS.fuelRecall]: {
    description: 'NHTSA recall 23V445 covers model-year 2021-2022 G 550 vehicles and model-year 2021-2023 AMG G 63 vehicles, plus a limited 2022 AMG G 63 4x4 Squared population. Certain fuel-pump impellers may not meet material requirements, deform, contact the pump housing and create enough mechanical resistance to stop the pump. The vehicle can lose propulsion; a warning message and rough running may precede shutdown. The 143,551 figure is the total multi-model recall population, not a G-Class owner-report count.',
    solution: 'Check the VIN for NHTSA recall 23V445 / Mercedes campaign 2023070012. An authorized Mercedes-Benz dealer will replace the fuel delivery module free of charge when the recall is open. Treat rough running, a fuel-system warning or loss of propulsion as a safety concern. Do not buy a fuel pump from this page; eligibility and the applicable A4634705900 delivery-unit remedy are VIN-specific.',
    symptoms: ['VIN recall eligibility checked', 'fuel-system warning and rough running documented', 'loss of propulsion handled as a safety concern'],
    affectedSystems: ['fuel delivery module', 'fuel pump impeller', 'engine propulsion'],
    conflict: null,
    evidence: ['Part 573 page 2 lists 2,547 model-year 2021-2022 G 550 vehicles.', 'Page 5 lists 4,549 model-year 2021-2023 AMG G 63 vehicles and 47 model-year 2022 4x4 Squared vehicles.', 'Pages 10-11 establish impeller deformation, pump shutdown and loss-of-propulsion risk; pages 13-14 identify A4634705900 and dealer replacement.'],
    summary: 'Retained the exact fuel-pump recall identity with trim-specific years and VIN-specific remedy guidance.',
    sources: ['fuelRecall'],
  },
  [IDS.m157]: {
    description: 'The reviewed G-Class manufacturer-communication corpus does not establish a combined M157 cylinder-scoring and camshaft-adjuster-wear defect for every 2013-2018 AMG G 63. Communication 10206077 addresses P023400 overboost on certain M157-equipped vehicles, while communication 11012129 is a 2021 G-Class camshaft-adjustment software campaign outside the frozen M157 year set. A much older camshaft-adjustment communication assigned to G500 does not list platform 463 in its own summary. None proves the frozen cylinder-scoring mechanism, oil-in-wiring theory, multi-cylinder misfire progression or universal major-engine remedy.',
    solution: 'Preserve fault codes, oil level and service history, inspect the oil and filter for metal, and use engine-specific compression, leak-down, borescope and cam-timing diagnosis before identifying an internal failure. Separate electrical connector contamination, boost control, timing and bore condition. Do not buy camshaft adjusters, solenoids, timing parts, pistons or an engine from this page; no failed component or universal retail fitment is established.',
    symptoms: ['fault codes and oil history preserved', 'timing and cylinder condition tested separately', 'metal findings confirmed before major repair'],
    affectedSystems: ['M157 engine', 'camshaft timing', 'cylinders and pistons'],
    conflict: 'No exact reviewed primary source supports the frozen combined M157 scoring/adjuster identity or its universal 2013-2018 scope.',
    evidence: ['10206077 supports a narrower M157 overboost condition, not cylinder scoring or cam-adjuster wear.', '11012129 is a 2021 G-Class software campaign outside the frozen M157 scope.', 'The stored causes, DTC bundle and repair prices rely on non-primary sources.'],
    summary: 'Separated exact narrower engine communications from unsupported M157 scoring and adjuster claims.',
    sources: ['datasets'],
  },
  [IDS.m177]: {
    description: 'The reviewed G-Class manufacturer-communication corpus does not establish the frozen 2019-2025 M177 excessive-oil-consumption and cylinder-scoring identity. Communications 10248212 and 11013884 document a detached thermostat sealing ring on certain M176/M177/M178 vehicles, not oil consumption. Other exact G-Class records concern camshaft-adjustment software or unrelated fuel-system diagnosis. None supports one quart per 1,000-2,000 miles, an iron-coated-bore heat-stress mechanism, piston-ring coking, universal PCV/turbo/valve-seal causes, walnut blasting or routine short-block replacement.',
    solution: 'Measure oil use with the VIN-specific Mercedes procedure, document fill level, distance, leaks, smoke, misfires and service history, and test crankcase ventilation, turbo sealing, compression, leak-down and cylinder condition as separate paths. Do not buy a PCV assembly, turbo, valve-seal kit, pistons, short block or engine from this page; no failed component or universal retail fitment is established.',
    symptoms: ['measured oil use and distance documented', 'external leaks and crankcase ventilation tested', 'cylinder condition confirmed before major repair'],
    affectedSystems: ['M177 engine', 'lubrication system', 'cylinders and crankcase ventilation'],
    conflict: 'No exact reviewed primary source supports the frozen oil-consumption/scoring identity, rate, mechanism or full 2019-2025 scope.',
    evidence: ['Exact M177 communications in the corpus address thermostat sealing, not oil consumption or scoring.', 'No G-Class OEM/NHTSA record supports the stored rate, mechanism, DTCs or repair ladder.', 'The frozen evidence consists of forums and secondary articles.'],
    summary: 'Removed unsupported M177 oil-rate, scoring-mechanism and repair claims pending identity review.',
    sources: ['datasets'],
  },
  [IDS.om642Oil]: {
    description: 'The reviewed U.S. NHTSA G-Class corpus does not establish an OM642 oil-cooler-seal defect for the frozen 2000-2018 G 320 CDI, G 350 CDI, G 350 d and G 350 BlueTEC population. Those diesel variants were principally non-U.S. market vehicles, and the frozen year range begins before the OM642 applications named in the title. No exact Mercedes or NHTSA record in the reviewed corpus proves universal orange-seal hardening, a 2010 purple-Viton change, continued prevalence after that change or the stored repair-price range.',
    solution: 'Confirm the exact engine code, market, VIN and source of oil with cleaned-engine inspection before dismantling the intake. Distinguish oil-cooler seals from turbo, valve-cover and other upper-engine leaks, then follow the market-specific Mercedes workshop procedure and parts catalog. Do not buy oil-cooler seals, a cooler, intake parts or EGR parts from this page; engine applicability, leak source and fitment are not established.',
    symptoms: ['engine code and market confirmed', 'leak source localized on a cleaned engine', 'oil-cooler and adjacent leak paths separated'],
    affectedSystems: ['OM642 lubrication system', 'engine oil cooler', 'upper-engine sealing'],
    conflict: 'The primary corpus does not support the frozen market/year scope or universal seal-material and prevalence claims.',
    evidence: ['No exact NHTSA manufacturer communication covers this frozen G-Class OM642 identity.', 'The frozen 2000 start predates the named OM642 application and cannot be corrected through body copy.', 'Stored seal-material, prevalence, parts and price claims come from secondary/forum sources.'],
    summary: 'Held the OM642 oil-cooler identity because its market/year scope and seal claims lack exact primary support.',
    sources: ['datasets'],
  },
  [IDS.om642Swirl]: {
    description: 'The reviewed U.S. NHTSA G-Class corpus does not establish the frozen 2005-2018 OM642 intake-manifold swirl-flap failure identity. No exact Mercedes or NHTSA row in the reviewed model inventory supports brittle linkage breakage, actuator contamination by a turbo-inlet oil leak, ingestion of broken plastic, the P2008/P2004/P2015 code bundle, a metal repair-kit remedy or the stated higher-mileage prevalence for the listed non-U.S. diesel trims. The year set also cannot by itself prove OM642 fitment for every frozen model year.',
    solution: 'Confirm the exact engine code, market, VIN and fault codes, then inspect commanded versus actual intake-runner operation, linkage integrity, actuator function and oil contamination using market-specific Mercedes procedures. Do not install a resistor bypass. Do not buy an actuator, intake manifold, linkage kit or resistor from this page; the failed component, legal emissions remedy and fitment are not established.',
    symptoms: ['engine code and market confirmed', 'commanded and actual runner operation compared', 'linkage, actuator and contamination paths separated'],
    affectedSystems: ['OM642 intake manifold', 'intake runner control', 'emissions control'],
    conflict: 'No exact reviewed primary source supports the frozen OM642 swirl-flap identity, DTC bundle, remedy or 2005-2018 scope.',
    evidence: ['No exact NHTSA manufacturer communication in the reviewed G-Class corpus establishes this identity.', 'The stored DTCs, ingestion risk, repair kit and prevalence come from forums and an instructional article.', 'Non-U.S. diesel applicability cannot be inferred from U.S. model labels.'],
    summary: 'Held the OM642 swirl-flap identity pending exact market-specific primary evidence.',
    sources: ['datasets'],
  },
  [IDS.infotainment]: {
    description: 'Mercedes communications 10167563 and 10205237 document a COMAND unit that does not start or whose display remains dark on older G500 rows, and 10205234 documents a COMAND software update. Communication 11010970 separately covers an OTA MBUX configuration campaign on newer G-Class vehicles. These records do not establish one continuous 2013-2025 COMAND/MBUX freeze-and-reboot defect, a vibration-induced connector cause, simultaneous loss of navigation/audio/backup camera, a universal 10-second volume-knob reset or routine head-unit replacement across the frozen trims.',
    solution: 'Record whether the unit fails to start, the display alone is dark, audio is missing, or a specific app/function fails; preserve software version, fault logs, time and temperature. Follow the VIN- and system-specific COMAND or MBUX diagnostic/update path. Do not buy a head unit, display, connector or control module from this page; the system generation, failed path and fitment are not established.',
    symptoms: ['COMAND or MBUX generation identified', 'display, audio and function failures separated', 'software version and fault logs preserved'],
    affectedSystems: ['COMAND', 'MBUX', 'multimedia display and head unit'],
    conflict: 'Exact sources support narrower generation-specific conditions, not the frozen 2013-2025 combined freeze/reboot identity and vibration cause.',
    evidence: ['10167563/10205237 support an older COMAND no-start/dark-display condition.', '11010970 is a newer MBUX configuration OTA, not evidence of random freezes or reboots.', 'No exact source supports the frozen reset, vibration, camera-loss, replacement-cost or broad scope claims.'],
    summary: 'Separated exact COMAND and MBUX conditions from an unsupported cross-generation freeze/reboot identity.',
    sources: ['datasets'],
  },
  [IDS.doorHinge]: {
    description: 'The reviewed G-Class corpus does not establish premature heavy-door hinge or check-strap wear causing door sag across 2019-2025 G 550 and AMG G 63. Communication 11029045 covers 2025 A-pillar wind noise caused by a door-joint seal and door flushness; it allows door adjustment after a masking test but does not identify hinge wear, check-strap wear, driver-door prevalence or a hinge-replacement remedy.',
    solution: 'Document the exact door, gap, latch effort, vertical movement, check-strap behavior and wind or seal complaint. Measure body gaps and identify whether adjustment, seal, hinge, latch or structural damage is responsible before repair. Do not buy hinges, pins, a check strap, latch or seal from this page; the failed component, side and fitment are not established.',
    symptoms: ['affected door and vertical play documented', 'gap, latch and seal condition measured', 'hinge and alignment paths separated'],
    affectedSystems: ['door hinges', 'door alignment', 'door joint seals'],
    conflict: 'The only exact door-alignment communication concerns 2025 wind noise and does not support the frozen hinge-sag identity or full scope.',
    evidence: ['11029045 supports a seal/flushness diagnostic path, not premature hinge or check-strap wear.', 'No reviewed primary source supports driver-door prevalence or the stored repair price.', 'The frozen citation is an unresolved owner-report label without a URL.'],
    summary: 'Replaced unsupported hinge-wear and prevalence claims with exact alignment boundaries pending identity review.',
    sources: ['datasets'],
  },
  [IDS.axleSeal]: {
    description: 'The reviewed G-Class manufacturer-communication and recall corpus does not establish a universal 2000-2018 front differential axle-seal leak identity. No exact primary row supports that both front seals are prone to leak across G 500, G 550, G 55 AMG and G 63 AMG, that oil routinely reaches brake components, or that the solid-axle design dictates the frozen replacement and brake-service remedy. The stored support is forum and reseller material rather than an exact OEM/NHTSA document.',
    solution: 'Clean the axle and identify the exact leak point, fluid type, side and path before repair. Inspect axle shafts and nearby brake friction surfaces only when evidence shows contamination, then follow the VIN-specific Mercedes axle procedure and parts catalog. Do not buy axle seals, shafts, pads or rotors from this page; the leak source, damage and fitment are not established.',
    symptoms: ['exact leak point and fluid identified', 'left and right sides assessed independently', 'brake contamination confirmed rather than assumed'],
    affectedSystems: ['front axle', 'differential sealing', 'front brakes'],
    conflict: 'No exact reviewed primary source supports the frozen universal axle-seal identity, brake-contamination claim or 2000-2018 scope.',
    evidence: ['No exact NHTSA manufacturer communication in the G-Class inventory establishes this condition.', 'Forum/reseller references cannot establish population scope or mandatory two-side replacement.', 'Stored prices and universal parts guidance lack fitment-grade evidence.'],
    summary: 'Removed unsupported axle-seal prevalence, brake-transfer and replacement claims pending identity review.',
    sources: ['datasets'],
  },
  [IDS.steeringDamper]: {
    description: 'The reviewed G-Class manufacturer-communication and recall corpus does not establish a 2000-2018 steering-damper wear identity causing highway wander, speed vibration and vague on-center feel across the frozen trims and engines. No exact primary record proves the damper as the cause, attributes amplification to the solid axle, or supports an upgraded Bilstein B6 replacement and mandatory alignment. Steering symptoms can also arise from tires, balance, alignment, joints, bearings or steering gear and cannot be assigned to one part from this page.',
    solution: 'Record speed, road input, steering-wheel vibration, pull and play, then inspect tires, wheels, alignment, steering joints, bearings, gear and damper as separate paths. Replace only the component confirmed failed using VIN-specific specifications. Do not buy a steering damper, drag link, tie-rod end or alignment package from this page; no failed component or universal retail fitment is established.',
    symptoms: ['speed and road input documented', 'tire, alignment and steering play measured', 'damper diagnosis separated from other front-end causes'],
    affectedSystems: ['steering linkage', 'front axle', 'wheels and tires'],
    conflict: 'No exact reviewed primary source supports the frozen damper-cause identity, aftermarket remedy or full 2000-2018 scope.',
    evidence: ['No exact G-Class OEM/NHTSA communication establishes steering-damper wear as the shared cause.', 'The frozen citation is an unresolved forum label without a URL.', 'No fitment-grade evidence supports the aftermarket part recommendation.'],
    summary: 'Removed unsupported steering-damper causation and aftermarket replacement advice pending identity review.',
    sources: ['datasets'],
  },
  [IDS.transferLeak]: {
    description: 'Mercedes communications 11005331, 11010455, 11025100 and 11028270 document light-load drivetrain vibration or jolting on variable-transfer-case G 550 vehicles caused by modified transfer-case oil quality over time. They prescribe fault processing, transmission-oil-level checks, isolation through the all-wheel-drive control unit, transfer-case oil service and teach-in. They do not document an output-shaft seal leak, visible seep, low transfer-case fluid or flange wear. The exact evidence therefore conflicts with the frozen 2013-2023 leak identity and its seal-replacement remedy.',
    solution: 'Identify whether the complaint is visible fluid loss, light-load vibration, jolting or another drivetrain symptom. Confirm the fluid source before disturbing a seal, and use the VIN-specific XENTRY isolation, oil-service and teach-in path when the exact variable-transfer-case vibration condition applies. Do not buy output seals, flanges, a transfer case or fluid from this page; the leak source, transfer-case variant and fitment are not established.',
    symptoms: ['visible leak and drivetrain vibration separated', 'fluid source and transfer-case variant confirmed', 'faults and teach-in status documented'],
    affectedSystems: ['transfer case', 'all-wheel-drive control', 'drivetrain fluid'],
    conflict: 'Exact communications support fluid-quality-related vibration, not the frozen output-seal leak identity or 2013-2023 scope.',
    evidence: ['11005331/11010455/11025100/11028270 describe vibration or jolting and modified oil quality.', 'They prescribe oil service and calibration only after diagnostic isolation; none states an output-seal leak.', 'No exact source supports the frozen flange-wear, low-fluid, seal-replacement or price claims.'],
    summary: 'Separated exact transfer-case vibration/oil-quality evidence from an unsupported output-seal leak identity.',
    sources: ['datasets'],
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
    const value = clone(source);
    delete value.localPath;
    return [key, value];
  }));
}
function commerceDecisionFor(id) {
  return {
    [IDS.transmission]: 'transmission failure path and fitment are unresolved; no universal retail part',
    [IDS.corrosion]: 'corrosion location, structure and repair specification are unresolved; no universal retail part',
    [IDS.wiringRecall]: 'recall eligibility and harness variant are VIN-specific; no universal retail part',
    [IDS.fuelRecall]: 'recall eligibility and fuel-delivery remedy are VIN-specific; no universal retail part',
    [IDS.m157]: 'engine failure path and fitment are unresolved; no universal retail part',
    [IDS.m177]: 'oil-consumption cause and engine fitment are unresolved; no universal retail part',
    [IDS.om642Oil]: 'market applicability, leak source and seal fitment are unresolved; no universal retail part',
    [IDS.om642Swirl]: 'market applicability, failed intake path and fitment are unresolved; no universal retail part',
    [IDS.infotainment]: 'system generation, failure path and fitment are unresolved; no universal retail part',
    [IDS.doorHinge]: 'door failure path, side and fitment are unresolved; no universal retail part',
    [IDS.axleSeal]: 'axle leak source, side and fitment are unresolved; no universal retail part',
    [IDS.steeringDamper]: 'steering cause and fitment are unresolved; no universal retail part',
    [IDS.transferLeak]: 'transfer-case complaint, variant and fitment are unresolved; no universal retail part',
  }[id];
}
function proposalFor(before, id) {
  const content = CONTENT[id];
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: RETAIN_IDS.includes(id) ? 'high' : 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'G-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 13 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen G-Class coverage does not match the 13-row adjudication contract');
  }
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const retained = RETAIN_IDS.includes(row.id);
    return {
      id: row.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: CONTENT[row.id].conflict,
      reason: CONTENT[row.id].summary,
      evidence: {
        primaryEvidence: CONTENT[row.id].evidence,
        limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.',
      },
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
    make: 'Mercedes-Benz',
    model: 'G-Class',
    completionStatement: 'All 13 frozen G-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'Ten identities materially exceed exact primary evidence or contain market/scope conflicts; no catalog write is authorized before independent review.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 13 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 450-, 280-, 620-, 890- and 340-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty-claim and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; the packet freezes exact page selection, byte size and SHA-256.',
      'Every named replaceable item has an explicit no-universal-retail-part or VIN-specific remedy boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'g-class-three-identities-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact primary evidence supports the 9G shift/adaptation identity and recalls 23V097 and 23V445.' },
      { code: 'g-class-ten-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Ten identities contain unsupported mechanisms, market/year scope, frequency, title claims or remedies and remain indexed pending review.' },
      { code: 'g-class-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Five positive owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'g-class-recall-populations-bounded', severity: 'accuracy-cleanup', recordIds: [IDS.wiringRecall, IDS.fuelRecall], detail: 'Recall population totals are identified as campaign populations and never represented as owner reports.' },
      { code: 'all-g-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No G-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: 3,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 10,
      fabricated_report_counts_proposed_zero: 5,
      total: 13,
    },
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
