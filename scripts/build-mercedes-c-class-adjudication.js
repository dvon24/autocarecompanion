/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-c-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['C', 'C CLASS', 'C-CLASS', 'C203', 'C204', 'C204.9', 'C205', 'C 250 D', 'C 300', 'C 300 4MATIC', 'C 350', 'C 350 E', 'C180', 'C200', 'C220', 'C230', 'C230K', 'C240', 'C250', 'C280', 'C300', 'C320', 'C350', 'C350E', 'C400', 'C450', 'C36 AMG', 'C43 AMG', 'C55', 'C63', 'C63 AMG', 'AMG C32', 'AMG C43', 'AMG C43 4MATIC', 'AMG C55', 'AMG C63', 'AMG C63 S', 'AMG C63S', 'AMG C63 S E', 'AMG C63 S E 4MATIC+', 'AMG C63 S E PERFORMANCE 4MATIC+']);
const SEARCH_TERMS = Object.freeze(['48V', 'starter-generator', 'ISG', 'conductor plate', '722.6', 'wiring harness', 'biodegradable', 'driver assistance', 'radar', 'camera', 'occupant classification', 'passenger airbag', 'blend door', 'duo valve', 'MBUX', 'instrument cluster', 'rear camera', 'brake squeal', 'brake noise', 'judder', 'valve body', '722.9', 'cam adjuster', 'camshaft adjuster', 'door lock', 'wastegate', 'SAM', 'sunroof', 'subframe', 'rear axle carrier', 'corrosion', 'cracking']);
const IDS = Object.freeze({
  hybrid48v: 'mercedes-benz-c-class-48v-mild-hybrid-integrated-2022',
  conductorPlate: 'mercedes-benz-c-class-722-6-5g-tronic-conductor-plate-failure',
  biodegradableHarness: 'mercedes-benz-c-class-biodegradable-engine-wiring-harness-insulation-breakdown',
  adas: 'mercedes-benz-c-class-driver-assistance-sensor-misalignment-2022',
  occupant: 'mercedes-benz-c-class-front-seat-occupant-classification-2022',
  hvac: 'mercedes-benz-c-class-hvac-blend-door-duo-valve-failure',
  mbux: 'mercedes-benz-c-class-mbux-instrument-cluster-2022',
  brakes: 'mercedes-benz-c-class-premature-front-brake-squeal-2022',
  valveBody: 'mercedes-c-class-7g-tronic-valve-body-2005',
  camAdjuster: 'mercedes-c-class-cam-adjuster-solenoid-2012',
  doorLock: 'mercedes-c-class-door-lock-actuator-2008',
  wastegate: 'mercedes-c-class-m274-turbo-wastegate-rattle-2015',
  sam: 'mercedes-c-class-sam-module-failure-2001',
  sunroof: 'mercedes-c-class-sunroof-drain-clog-2008',
  subframe: 'mercedes-c-class-w204-rear-subframe-cracking-2008',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.valveBody, IDS.camAdjuster, IDS.doorLock, IDS.wastegate, IDS.sam, IDS.sunroof, IDS.subframe].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10033072', '10167510', '10210927', '10228816', '10232321', '11016153', '11017211', '11018211', '11019782', '11031636']);
const CAMPAIGNS = Object.freeze(['01V366000', '03V534000', '05V560000', '07V465000', '08V303000', '10V459000', '12V557000', '14V177000', '14V598000', '15V087000', '15V138000', '15V711000', '15V845000', '16V081000', '16V087000', '16V363000', '16V438000', '16V603000', '17V017000', '17V114000', '17V177000', '17V243000', '17V251000', '17V252000', '17V574000', '17V627000', '17V654000', '18V043000', '18V150000', '18V207000', '18V456000', '18V608000', '18V725000', '18V761000', '18V838000', '18V839000', '18V850000', '18V872000', '18V906000', '18V909000', '19V010000', '19V130000', '19V540000', '19V586000', '19V787000', '19V918000', '20V068000', '20V298000', '20V364000', '20V395000', '20V449000', '20V608000', '21V032000', '21V058000', '21V072000', '21V196000', '21V197000', '21V230000', '21V406000', '21V509000', '21V638000', '21V818000', '21V961000', '22V168000', '22V189000', '22V232000', '22V365000', '22V678000', '22V954000', '23V445000', '23V462000', '23V463000', '23V854000', '23V880000', '24V115000', '24V371000', '24V446000', '24V874000', '25V253000', '25V255000', '26V281000', '26V481000', '66V027000', '94V091000', '96V058000']);

const PDF_SOURCES = Object.freeze({
  rearSubframeWarranty: {
    title: 'Mercedes-Benz rear-subframe extended warranty: corrosion with perforation on 2008-2015 C-Class W/C204',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10232321-0001.pdf',
    localPath: 'C:/tmp/mercedes-c-class-sources/10232321.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 149017,
    sha256: 'be9b4041e6a34a8b0f4702ffc6875c1e0e7b5ff662b65d2ea6475cd1fda5b62d',
  },
  batteryManagementCampaign: {
    title: 'Mercedes-Benz emission service campaign 2025050001: 48V battery-management software update',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11018211-0001.pdf',
    localPath: 'C:/tmp/mercedes-c-class-sources/11018211.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 450958,
    sha256: 'd16e60604ee6422b9ed5c86dc2fd7ade0cb7795346850df112c724854049e87e',
  },
  driverAssistanceCampaign: {
    title: 'Mercedes-Benz service campaign 25P5496520: driver-assistance SCN coding stability update',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11019782-0001.pdf',
    localPath: 'C:/tmp/mercedes-c-class-sources/11019782.pdf', pages: 1, visualPages: [1], bytes: 125544,
    sha256: '4fce45be393088109e2fa99565662e82fc3820f36e2d57daf1fb26cb10356d49',
  },
  camAdjusterWarranty: {
    title: 'Mercedes-Benz extended warranty: 2012-2015 C250 M271 camshaft adjuster',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11031636-0001.pdf',
    localPath: 'C:/tmp/mercedes-c-class-sources/11031636.pdf', pages: 2, visualPages: [1, 2], bytes: 150908,
    sha256: 'b3e09b0936b2016045d62658bc317765ac208272226cf5c920887af18b38efff',
  },
  incorrect24V797: {
    title: 'NHTSA campaign 24V-797 quarterly report: General Motors rear-wheel lock-up from transmission valve failure',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLQRT-24V797-0226.pdf',
    localPath: 'C:/tmp/mercedes-c-class-sources/24V797.pdf', pages: 1, visualPages: [1], bytes: 131715,
    sha256: '9842da4c0eceeaffe97f86211b5bba42610680997b9efce2a610d085800fb24c',
  },
  instrumentClusterRecall: {
    title: 'NHTSA Part 573 report 26V-281: 2024-2026 C-Class infotainment reset and blank instrument display',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V281-6950.pdf',
    localPath: 'C:/tmp/mercedes-c-class-sources/26V281.pdf', pages: 22, visualPages: Array.from({ length: 22 }, (_, index) => index + 1), bytes: 1809839,
    sha256: 'eaaf2954c93fc263f7d553858b58dc4f680bb0a65fb80daf35861aa52a178481',
  },
});
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 16, '2000-2004': 40, '2005-2009': 152, '2010-2014': 678, '2015-2019': 905, '2020-2024': 1795, '2025-2026': 1840 },
  totalRows: 5426, relevantRowCount: 1557, uniqueRelevantCommunications: 315, requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 13, post: 4362 }, totalRows: 4375,
  campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.hybrid48v]: {
    description: 'Mercedes records establish several distinct W206 48V conditions, not one integrated-starter-generator failure pattern. Campaign 2025050001 covers battery-management software that can open the battery switch and prevent restart on certain 2019-2022 vehicles; a separate 2023 campaign addresses an implausible state-of-charge that can prevent charging. Neither establishes universal ISG hardware failure, sudden power loss, DC/DC failure or 2022-2025 parts replacement under the frozen title.',
    solution: 'Preserve the exact message and all 12V, 48V and powertrain fault data, verify both battery states of charge and check the VIN for applicable campaigns before selecting a repair. Follow the VIN-specific XENTRY path because software, battery, grounding and conversion faults require different remedies. Do not buy an ISG, converter, 48V battery or power-electronics module from this page; no universal failed component or retail fitment is established.',
    symptoms: ['exact 48V warning and no-start sequence recorded', '12V and 48V state of charge measured', 'VIN campaign status checked before hardware replacement'], affectedSystems: ['48V battery management', 'low-voltage electrical system', 'powertrain controls'],
    conflict: 'Primary records support multiple software and battery-management conditions, not the title\'s universal ISG-failure identity.',
    evidence: ['Rendered campaign 2025050001 specifies a 48V battery-control-unit software update, not ISG replacement.', 'Communication 11016153 describes implausible state-of-charge software on certain 2023 vehicles.'],
    summary: 'Separated exact software/battery-management records from the unsupported ISG hardware identity.', sources: ['batteryManagementCampaign', 'datasets'],
  },
  [IDS.conductorPlate]: {
    description: 'The frozen page relies on secondary articles and a forum. The reviewed C-Class manufacturer corpus does not establish the stated 1996-2002 universal 722.6 conductor-plate failure mechanism, the claim that it is the single most common failure, the listed fault-code bundle or part number A1402701361 for every affected C-Class. Similar shift symptoms can originate in fluid, wiring, control, hydraulic or internal transmission faults.',
    solution: 'Confirm the installed transmission by VIN and data card, preserve complete transmission fault data, inspect fluid condition and connector leakage, and follow the exact diagnostic tree before removing the valve body. Do not buy a conductor plate, pilot bushing, filter or transmission kit from this page; the failed component and VIN-level fitment are not established.',
    symptoms: ['transmission variant confirmed by VIN', 'complete transmission fault data preserved', 'fluid and connector leakage inspected before parts selection'], affectedSystems: ['automatic transmission', 'transmission controls'],
    conflict: 'No exact reviewed primary record supports the frozen mechanism, universal frequency claim, fault-code bundle or part fitment.', evidence: ['The reviewed manufacturer corpus contains 722.6 records but no exact record proving this frozen C-Class aggregation.'], summary: 'Removed universal conductor-plate and part-number claims pending identity review.', sources: ['datasets'],
  },
  [IDS.biodegradableHarness]: {
    description: 'The frozen page relies on specialist and forum articles. The reviewed primary corpus does not establish the exact 1994-1996 C-Class population, a universal fire-risk pattern, or part numbers 1244403633 and 2024407505 for all listed engines. Its title also includes M119 although the frozen engine field lists only M104 and M111, an unresolved identity and fitment conflict.',
    solution: 'Inspect the harness in place for cracked insulation, exposed conductors and heat damage, then identify the engine, harness option and supersession from the VIN before deciding between replacement and specialist reconstruction. Do not buy either named harness or an ignition sub-harness from this page; exact engine and VIN fitment are unresolved.',
    symptoms: ['visible insulation condition documented', 'engine and harness option confirmed by VIN', 'shorted circuits isolated before replacement'], affectedSystems: ['engine wiring harness', 'engine management electrical system'],
    conflict: 'The title/engine scope conflicts and no reviewed primary record validates the frozen years, fire claim or part numbers.', evidence: ['No exact biodegradable-harness record appears in the 5,426-row C-Class manufacturer corpus.'], summary: 'Flagged engine-scope and part-number conflicts and replaced parts-first advice with inspection.', sources: ['datasets'],
  },
  [IDS.adas]: {
    description: 'Mercedes campaign 25P5496520 covers 2021-2025 platform-206 vehicles and improves driver-assistance stability and availability through SCN coding. It does not establish sensor misalignment from routine driving, a recurring bracket defect or universal radar/camera replacement. Weather obstruction, collision damage, windshield work, voltage, coding and calibration remain separate diagnostic paths.',
    solution: 'Record the exact unavailable feature and fault codes, clean only approved sensor surfaces, inspect for collision or glass-replacement history, verify voltage and software, then perform the VIN-specific calibration checks. Do not buy a radar, camera or mounting bracket from this page; the failed component and calibration requirement are not established.',
    symptoms: ['exact driver-assistance warning preserved', 'repair and windshield history checked', 'software and calibration status documented'], affectedSystems: ['driver-assistance systems', 'radar and camera network'],
    conflict: 'The exact campaign supports coding stability, not the frozen sensor-misalignment identity.', evidence: ['The rendered 25P5496520 notification names SCN coding as the remedy and does not identify misalignment or hardware replacement.'], summary: 'Separated the exact coding campaign from the unsupported sensor-misalignment mechanism.', sources: ['driverAssistanceCampaign', 'datasets'],
  },
  [IDS.occupant]: {
    description: 'The frozen page has no citation and combines occupancy mats, seat wiring and calibration into one 2022-2025 W206 identity. The reviewed recall set contains different restraint conditions, including a 2023 AMG C43 seat-harness routing recall and a 2022-2025 driver-seat-belt-cover recall, but no exact record establishing this broad front-passenger occupant-classification failure pattern.',
    solution: 'Treat an active restraint warning as a safety fault. Preserve SRS codes, inspect only accessible under-seat wiring without disturbing connectors, and use the VIN-specific restraint diagnostic and campaign lookup. Do not buy an occupancy mat, seat harness or restraint control unit from this page; no universal failed component or retail fitment is established.',
    symptoms: ['exact restraint message and SRS codes preserved', 'seat and VIN configuration confirmed', 'campaign eligibility checked before parts selection'], affectedSystems: ['supplemental restraint system', 'front-seat sensing and wiring'],
    conflict: 'No exact reviewed primary record establishes the frozen occupant-classification identity or full model-year scope.', evidence: ['The reviewed W206 seat-related recalls concern different components and mechanisms.'], summary: 'Removed the unsupported mat/wiring/calibration bundle and added a safety-first diagnostic boundary.', sources: ['datasets'],
  },
  [IDS.hvac]: {
    description: 'The frozen page merges blend-door actuators, a duo-valve, heater-core restriction and climate-control solder faults under one identity. The reviewed manufacturer corpus does not establish that combined 1994-2000 W202 pattern or the claimed cross-diagnosis by solenoid sound. Different vent temperatures can result from air-distribution, coolant-flow, sensor, control or refrigerant faults.',
    solution: 'Measure left/right outlet temperatures and coolant-hose temperatures, read climate-control faults and actuator values, and verify flap movement and coolant-valve command before selecting a repair. Do not buy a duo-valve, blend-door actuator, heater core or climate-control unit from this page; the failed system and VIN-level fitment are unresolved.',
    symptoms: ['left and right outlet temperatures measured', 'climate-control faults and actuator values read', 'coolant flow distinguished from air-distribution faults'], affectedSystems: ['heating and air conditioning', 'air-distribution controls'],
    conflict: 'The identity combines several independent HVAC faults without exact model-specific primary evidence.', evidence: ['No exact blend-door/duo-valve aggregation appears in the reviewed C-Class manufacturer corpus.'], summary: 'Separated HVAC diagnostic paths and removed unsupported component replacement claims.', sources: ['datasets'],
  },
  [IDS.mbux]: {
    description: 'The frozen citation is false: NHTSA 24V-797 is a General Motors transmission-valve recall for rear-wheel lock-up. Mercedes recall 26V-281 does support a narrower condition on certain 2024-2026 C-Class vehicles: infotainment software can trigger resets and briefly blank the instrument cluster. A 2022 C300 communication about a distorted central display explicitly says the rearview camera is not affected. These records do not establish the frozen 2022-2025 bundle of black MBUX, repeated rebooting and missing rear-camera image.',
    solution: 'Preserve video and fault logs, verify 12V health and check the VIN for recall 26V-281 or exact software campaigns. Use the symptom-specific XENTRY procedure and confirm the display and rear camera separately after software work. Do not buy a display, head unit, camera or gateway from this page; the failed component and VIN applicability are not established.',
    symptoms: ['display behavior documented on video', 'instrument cluster and rear camera tested separately', 'VIN recall and software status checked'], affectedSystems: ['infotainment control unit', 'instrument cluster display', 'rearview display path'],
    conflict: 'The stored citation belongs to General Motors, while exact Mercedes evidence supports only narrower and differently scoped display conditions.', evidence: ['The rendered 24V-797 report names General Motors and a transmission-valve rear-wheel-lock defect.', 'Rendered recall 26V-281 covers 2024-2026 C-Class infotainment resets with brief instrument-display interruption.', 'Communication 10228816 says its 2022 central-display distortion does not affect the rearview camera.'], summary: 'Removed the false 24V-797 citation and separated the exact 26V-281 display-reset condition from the broader frozen identity.', sources: ['instrumentClusterRecall', 'datasets'],
  },
  [IDS.brakes]: {
    description: 'The frozen page has no citation and combines squeal, judder, rotor hot spots, uneven pad transfer and caliper drag across 2022-2025 C-Class vehicles. The reviewed manufacturer corpus does not establish that combined W206 pattern, its frequency, or universal early pad-and-rotor replacement. Brake noise and vibration require measurement before any safety or wear conclusion.',
    solution: 'Measure pad thickness, rotor thickness and runout, inspect surfaces and hardware, verify wheel torque and check for caliper drag before selecting a remedy. Use the VIN-specific brake specification and service instruction. Do not buy pads, rotors, sensors or caliper hardware from this page; exact brake package, failure and fitment are unresolved.',
    symptoms: ['noise conditions reproduced safely', 'rotor thickness and runout measured', 'caliper drag and hardware condition checked'], affectedSystems: ['front service brakes'],
    conflict: 'No exact reviewed primary record supports the frozen multi-mechanism W206 brake identity or full scope.', evidence: ['No exact W206 front-brake record supporting this aggregation appears in the reviewed corpus.'], summary: 'Replaced parts-first brake advice with measurement and fitment boundaries.', sources: ['datasets'],
  },
  [IDS.valveBody]: {
    description: 'The frozen page uses secondary repair sources and converts varied harsh shifts into a universal 722.9 valve-body and conductor-plate failure. Mercedes communications 11010818 and 11023193 instead require electrical and connector checks before replacing components when VGS communication is absent; only after failed diagnostics may the electrohydraulic controller be considered. They do not establish the frozen 2005-2013 C230/C280/C300/C350 symptom pattern or simultaneous valve-body, conductor-plate and speed-sensor replacement.',
    solution: 'Confirm transmission type and fault state, preserve the quick test and EEPROM data, inspect power, wiring and connector condition, then follow the exact XENTRY diagnostic path. Do not buy a valve body, conductor plate, speed sensor or transmission service kit from this page; the failed component and VIN-level fitment are not established.',
    symptoms: ['installed transmission confirmed', 'quick test and transmission data preserved', 'power, wiring and connector checks completed before replacement'], affectedSystems: ['722.9 transmission controls', 'electrohydraulic controller'],
    conflict: 'Exact Mercedes records are condition-specific diagnostic procedures, not proof of the frozen universal valve-body identity.', evidence: ['Communications 11010818 and 11023193 direct technicians to diagnose VGS communication before replacing any component.'], summary: 'Removed the unsupported universal valve-body mechanism and proposed the 2,200-owner total as zero.', sources: ['datasets'],
  },
  [IDS.camAdjuster]: {
    description: 'The rendered Mercedes warranty extension covers the camshaft adjuster itself on 2012-2015 C250/C250 Coupe vehicles with the M271 engine. The frozen page instead claims cam-adjuster-solenoid failure across C250/C300/C350 vehicles through 2018 and lists M274/M276 engines. It also attributes varnish and oil-interval causation without exact evidence. A camshaft adjuster, its solenoid and an oil-contaminated adapter-harness condition are distinct repairs.',
    solution: 'Preserve fault codes and cam/crank data, identify the exact engine and determine whether diagnosis points to the mechanical adjuster, its solenoid, wiring or oil intrusion. Check VIN eligibility for the M271 adjuster warranty where applicable. Do not buy a solenoid, camshaft adjuster, adapter harness or timing part from this page; the title, engine scope and fitment conflict.',
    symptoms: ['engine code confirmed from VIN', 'cam/crank and actuator fault data preserved', 'mechanical adjuster distinguished from solenoid and wiring faults'], affectedSystems: ['camshaft adjustment', 'engine controls'],
    conflict: 'Official coverage is for an M271 camshaft adjuster on 2012-2015 C250 vehicles, not the frozen M274/M276 solenoid identity.', evidence: ['The rendered warranty table lists C250/C250 Coupe, model years 2012-2015 and engine M271.', 'The warranty document names camshaft adjuster replacement, not a generic solenoid failure.'], summary: 'Corrected the adjuster-versus-solenoid and engine-scope conflict and proposed the 1,200-owner total as zero.', sources: ['camAdjusterWarranty', 'datasets'],
  },
  [IDS.doorLock]: {
    description: 'The frozen page relies only on an uncited forum title and asserts a recurring 2008-2018 actuator-motor failure, driver-door frequency and aftermarket lifespan. The reviewed C-Class manufacturer corpus does not establish that pattern. A 2026 recall for certain 2022-2023 C-Class driver-door micro-switch corrosion is outside the frozen years and cannot be transferred to this identity.',
    solution: 'Reproduce the exact lock behavior, scan the body modules, and test latch command, power, ground, wiring and mechanical movement before removal. Confirm door position and VIN-specific latch part in the Mercedes catalog. Do not buy a lock actuator or latch from this page; the failed component and fitment are not established.',
    symptoms: ['affected door and command path identified', 'power, ground and wiring tested', 'mechanical binding separated from electrical failure'], affectedSystems: ['central locking', 'door latch electrical system'],
    conflict: 'No exact reviewed primary record supports the frozen years, frequency, mechanism or replacement-part claims.', evidence: ['The exact current door-lock recall applies to a later population and a different micro-switch condition.'], summary: 'Removed unsupported frequency and aftermarket claims and proposed the 1,100-owner total as zero.', sources: ['datasets'],
  },
  [IDS.wastegate]: {
    description: 'The frozen page relies on an uncited forum title and asserts a 2015-2021 C300/M274 wastegate-linkage wear pattern, progression to boost failure and actuator adjustment or turbo replacement. The reviewed manufacturer corpus does not contain an exact C-Class record proving that identity or year scope. Similar rattles require localization and boost-control testing.',
    solution: 'Record the noise under controlled conditions, check boost commands and actual pressure, inspect the linkage and actuator only after ruling out heat shields and adjacent components, and confirm the exact turbo by VIN. Do not buy a wastegate actuator, linkage kit or turbocharger from this page; the failure and fitment are unresolved.',
    symptoms: ['noise localized before repair', 'boost command and actual pressure compared', 'turbo and actuator configuration confirmed by VIN'], affectedSystems: ['turbocharger boost control'],
    conflict: 'No exact reviewed primary record supports the frozen M274 linkage-wear identity or broad applicability.', evidence: ['No exact wastegate-rattle record appears in the reviewed C-Class manufacturer corpus.'], summary: 'Removed unsupported progression and replacement claims and proposed the 1,500-owner total as zero.', sources: ['datasets'],
  },
  [IDS.sam]: {
    description: 'Mercedes records do document specific SAM-related conditions, including a model-204 driver-SAM hardware fault that can leave exterior lights on and a separate VGS communication complaint. They do not establish the frozen 2001-2007 W203 pattern of water intrusion or solder cracking causing all lights, wipers and windows to malfunction. The cited secondary pages cannot establish a universal module or programming remedy.',
    solution: 'Identify the affected circuits and module, preserve body-control faults, test power, ground and network communication, and trace any water entry before condemning a SAM. Module replacement and coding must follow the VIN and option set. Do not buy a front or rear SAM from this page; the failed module, cause and fitment are not established.',
    symptoms: ['affected circuits identified', 'SAM communication, power and ground tested', 'water source traced before module replacement'], affectedSystems: ['body electrical network', 'signal acquisition modules'],
    conflict: 'Exact SAM communications describe different models, years and symptoms than the frozen W203 aggregation.', evidence: ['Communication 10033072 is a model-204 driver-SAM hardware condition, outside the frozen identity.', 'Communication 10167510 requires diagnosis across several communication paths and does not prove water or solder failure.'], summary: 'Separated exact SAM communications from the unsupported W203 aggregation and proposed the 2,500-owner total as zero.', sources: ['datasets'],
  },
  [IDS.sunroof]: {
    description: 'The frozen page relies only on an uncited forum title and applies a drain-clog/water-damage pattern across 2008-2020 C-Class generations. The reviewed manufacturer corpus does not establish that full scope, the claimed electronic-module locations or a universal drain-cleaning remedy. Roof leaks can originate at drains, connections, glass seals, cassettes, seams or unrelated body openings.',
    solution: 'Reproduce the leak with controlled low-volume water, trace each path and outlet, inspect accessible drain connections and dry/test any wetted electrical area. Do not force high-pressure air or wire through a drain without the model-specific procedure. Do not buy a drain tube, seal, SAM or amplifier from this page; the leak source and fitment are unresolved.',
    symptoms: ['water entry reproduced and traced', 'drain outlets checked without high pressure', 'wetted electrical areas documented and tested'], affectedSystems: ['roof water management', 'body electrical system'],
    conflict: 'No exact reviewed primary record supports the frozen cross-generation drain-clog identity or electronics claims.', evidence: ['No exact C-Class sunroof-drain record supporting the frozen aggregation appears in the reviewed corpus.'], summary: 'Replaced unsupported drain assumptions with controlled leak tracing and proposed the 1,800-owner total as zero.', sources: ['datasets'],
  },
  [IDS.subframe]: {
    description: 'Mercedes extended rear-subframe coverage to 20 years/unlimited miles for 2008-2015 C-Class W/C204 vehicles, but only when corrosion has produced perforation. The frozen page instead claims stress cracking at mounting points from rough roads or cold climates and recommends welding minor cracks. The official record does not support that mechanism, and its no-cost dealer replacement process should not be replaced by a welding instruction.',
    solution: 'Have an authorized Mercedes-Benz dealer inspect the rear subframe and check VMI eligibility for the 20-year/unlimited-mile extension. If corrosion with perforation is confirmed, the official remedy is dealer replacement under the applicable warranty terms. Do not buy or weld a rear subframe from this page; condition, eligibility and VIN-specific parts require inspection.',
    symptoms: ['rear subframe inspected for corrosion and perforation', 'VMI warranty eligibility checked', 'suspension safety assessed before further driving'], affectedSystems: ['rear subframe', 'rear suspension structure'],
    conflict: 'Official evidence supports corrosion with perforation, not the frozen stress-cracking identity or weld repair.', evidence: ['All four rendered warranty pages limit coverage to corrosion with perforation on 2008-2015 C-Class W/C204.', 'The official remedy is authorized-dealer replacement after eligibility and inspection, not welding.'], summary: 'Corrected the corrosion-versus-cracking conflict, removed welding advice and proposed the 900-owner total as zero.', sources: ['rearSubframeWarranty', 'datasets'],
  },
});

function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = PDF_SOURCES[key] || OTHER_SOURCES[key]; return { url: source.url, type: source.type, title: source.title }; }); }
function commerceDecisionFor(id) {
  return {
    [IDS.hybrid48v]: 'multiple 48V causes and VIN applicability are unresolved; no universal retail part',
    [IDS.conductorPlate]: 'transmission diagnosis and VIN fitment are unresolved; no universal retail part',
    [IDS.biodegradableHarness]: 'engine, harness option and supersession are unresolved; no universal retail part',
    [IDS.adas]: 'software, calibration and sensor cause are unresolved; no universal retail part',
    [IDS.occupant]: 'restraint fault and VIN configuration are unresolved; no universal retail part',
    [IDS.hvac]: 'air-distribution and coolant-flow cause are unresolved; no universal retail part',
    [IDS.mbux]: 'display path, software scope and VIN eligibility are unresolved; no universal retail part',
    [IDS.brakes]: 'brake package, measured condition and fitment are unresolved; no universal retail part',
    [IDS.valveBody]: 'transmission controller diagnosis and VIN fitment are unresolved; no universal retail part',
    [IDS.camAdjuster]: 'adjuster, solenoid, wiring and engine scope conflict; no universal retail part',
    [IDS.doorLock]: 'door, latch condition and VIN fitment are unresolved; no universal retail part',
    [IDS.wastegate]: 'noise source, boost fault and turbo fitment are unresolved; no universal retail part',
    [IDS.sam]: 'module location, failure cause and option coding are unresolved; no universal retail part',
    [IDS.sunroof]: 'water-entry source and roof fitment are unresolved; no universal retail part',
    [IDS.subframe]: 'inspection and warranty eligibility are required; no universal retail part',
  }[id];
}
function proposalFor(before, id) {
  const content = CONTENT[id];
  return { ...clone(before), description: content.description, solution: content.solution, confidence: 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: FABRICATED_REPORT_COUNT_IDS.includes(id) ? 0 : before.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'C-Class').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 15 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen C-Class coverage does not match the 15-row adjudication contract');
  const rows = frozenRows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(before, row.id); return { id: row.id, action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: true, identityConflict: CONTENT[row.id].conflict, reason: CONTENT[row.id].summary, evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'C-Class',
    completionStatement: 'All 15 frozen C-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All fifteen identities materially exceed exact evidence or contain mechanism, scope, citation or fitment conflicts; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 15 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 2,200-, 1,200-, 1,100-, 1,500-, 2,500-, 1,800- and 900-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty and field-report population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
      'The false 24V-797 Mercedes citation is documented as an audit finding and is not carried into any proposal citation list.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'c-class-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Every frozen C-Class identity exceeds exact primary evidence or contains a scope, mechanism, citation or fitment conflict; all remain indexed pending review.' },
      { code: 'c-class-false-24v797-citation', severity: 'false-citation', recordIds: [IDS.mbux], detail: 'NHTSA 24V-797 is a General Motors transmission-valve rear-wheel-lock campaign, not a Mercedes rearview-camera recall.' },
      { code: 'c-class-cam-adjuster-solenoid-conflict', severity: 'identity-conflict', recordIds: [IDS.camAdjuster], detail: 'Official coverage is for the M271 camshaft adjuster on 2012-2015 C250 vehicles, not the frozen M274/M276 solenoid identity.' },
      { code: 'c-class-subframe-corrosion-not-cracking', severity: 'safety-correction', recordIds: [IDS.subframe], detail: 'Official coverage is corrosion with perforation and authorized-dealer replacement; stress-cracking and welding advice are unsupported.' },
      { code: 'c-class-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Seven positive owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-c-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No C-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 15, fabricated_report_counts_proposed_zero: 7, false_citations_identified: 1, total: 15 }, rows,
  };
}

if (require.main === module) { const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
