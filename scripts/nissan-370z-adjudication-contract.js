/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  ac: 'nissan-370z-ac-compressor-2009',
  brakeActuator: 'nissan-370z-brake-actuator-2009',
  clutchSwitch: 'nissan-370z-clutch-pedal-switch--2021',
  csc: 'nissan-370z-csc-failure-2009',
  differential: 'nissan-370z-diff-whine-2009',
  hatchLeak: 'nissan-370z-hatch-rear-cargo-2021',
  oilGallery: 'nissan-370z-oil-gallery-gasket-2009',
  battery: 'nissan-370z-premature-battery-discharge--2021',
  steeringLock: 'nissan-370z-steering-lock-2009',
  strutNoise: 'nissan-370z-steering-wheel-lock-to-lock-clicking-2021',
  synchro: 'nissan-370z-synchro-2009',
  window: 'nissan-370z-window-regulator-2009',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([
  ids.ac, ids.brakeActuator, ids.csc, ids.differential, ids.oilGallery,
  ids.steeringLock, ids.synchro, ids.window,
].sort());
const relevantDocumentIds = Object.freeze([
  '10042754', '10051829', '10051926', '10075201', '10119282', '10188377',
  '10192137', '10192138', '10192139', '10192145', '10192530', '10192676',
  '10192761', '10192805', '10206391', '10233896',
]);
const campaigns = Object.freeze(['11V538000', '18V153000']);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
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

const content = Object.freeze({
  [ids.ac]: held({
    description: `The exact 188-row Nissan 370Z manufacturer-communication corpus contains refrigerant-joint guidance for 2009-2016 vehicles, not a compressor-clutch or internal-compressor failure bulletin. That guidance explicitly says not to replace a pipe, hose or other A/C component when an O-ring seal resolves the leak. The corpus does not establish a 2009-2020 compressor population, recurrence, debris contamination or the frozen 310-owner total.`,
    solution: `Identify the exact A/C complaint and record pressures and temperatures with qualified equipment. Test clutch command, power, ground, coil resistance, belt drive, refrigerant charge and leak location; inspect joint surfaces and O-rings before assigning the compressor. Do not buy a clutch, compressor, receiver/drier, expansion valve, scan tool, multimeter or cleaner from this page; refrigerant state, electrical command, leak path and internal damage must be proven first.`,
    symptoms: ['pressure and temperature readings recorded', 'clutch command, power, ground and coil tested', 'refrigerant leak, clutch, belt and internal compressor paths separated'],
    systems: ['A/C compressor and clutch', 'refrigerant pipes, joints and O-rings', 'electrical command, belt drive and refrigerant circuit'],
    evidence: ['10192805 supports only refrigerant-joint/O-ring diagnosis through 2016.', 'The exact source cautions against unnecessary A/C component replacement.', 'No exact communication supports the frozen compressor failure identity or 310-owner count.'],
    conflict: 'The indexed page converts leak-diagnosis guidance into a twelve-year compressor/clutch defect and full-system parts prescription.',
    summary: 'Held the unsupported A/C compressor identity and removed the fabricated 310-owner total and diagnostic-tool commerce.',
  }),
  [ids.brakeActuator]: held({
    description: `The exact corpus contains general ABS/VDC noise and diagnostic guidance, brake-judder bulletins and C1130 signal diagnosis, but no brake-actuator-relay failure or 2009-2014 warranty extension. The frozen citation to campaign 20V123000 is not one of the two exact 370Z recalls; neither 11V538000 nor 18V153000 concerns a brake actuator. Wheel-speed-sensor recommendations also do not follow from an unverified relay identity.`,
    solution: `Preserve every ABS/VDC/engine code and warning state before clearing anything. Verify battery voltage, fuses, power, grounds, CAN communication, engine-related DTCs and individual wheel-speed signals under the exact service procedure, then hydraulically test the actuator only if directed. Do not buy an actuator, relay, wheel-speed sensor, module or software update from this page; the exact code, circuit and hydraulic fault must be proven first.`,
    symptoms: ['all ABS/VDC and engine codes preserved', 'power, ground, CAN and wheel-speed signals tested', 'normal ABS self-test noise, brake judder and actuator faults separated'],
    systems: ['ABS/VDC control unit and hydraulic actuator', 'wheel-speed sensors and CAN signals', 'brake rotors, pads and engine-signal inputs'],
    evidence: ['No exact communication supports a brake-actuator-relay failure identity.', 'The cited 20V123000 campaign is absent from the exact 370Z recall inventory.', 'Exact ABS/VDC records require diagnosis and do not authorize sensor or actuator replacement.'],
    conflict: 'The indexed page invents a recall/warranty-backed relay identity from unrelated ABS guidance and an incorrect campaign citation.',
    summary: 'Held the false-citation brake-actuator identity and removed the fabricated 280-owner total and wheel-sensor commerce.',
  }),
  [ids.clutchSwitch]: held({
    description: `The frozen page is assigned to 2021-2022 370Z vehicles, outside the exact 2009-2020 production population in the reviewed communication corpus. NTB13-026b covers clutch-pedal non-return on 2009-2013 manual vehicles only when there are no hydraulic leaks; it does not identify a pedal-stopper pad, interlock switch or cruise-control failure. The title and years therefore describe an unsupported vehicle population and mechanism.`,
    solution: `Confirm the VIN and actual model before using any 370Z procedure. For a no-crank manual vehicle, preserve security and start-authorize data and test battery voltage, clutch-switch adjustment, switch continuity, pedal contact point, wiring and starter command; diagnose cruise cancellation separately. Do not buy a stopper pad, clutch switch, battery, starter or multimeter from this page; model identity, failed input and exact pedal hardware must be proven first.`,
    symptoms: ['VIN and actual model confirmed', 'start authorization and clutch-switch state measured', 'pedal contact, switch, battery, starter and cruise paths separated'],
    systems: ['clutch-pedal interlock and switch', 'start authorization, battery and starter circuit', 'cruise-control cancel input'],
    evidence: ['No exact 2021-2022 370Z manufacturer communication exists in the reviewed corpus.', 'NTB13-026b applies to 2009-2013 pedal return with no hydraulic leak.', 'The exact bulletin does not support a stopper-pad or cruise-control identity.'],
    conflict: 'The indexed page is attached to post-production 370Z years and imports a mechanism not present in the exact clutch bulletin.',
    summary: 'Held the post-production clutch-switch identity and required VIN/model proof before start-circuit diagnosis.',
    citations: ['clutchPedal', 'datasets'],
  }),
  [ids.csc]: held({
    description: `The exact evidence does not support universal concentric-slave-cylinder failure across 2009-2020. NTB13-026b covers 2009-2013 clutch-pedal non-return only when there are no hydraulic leaks and prescribes a fluid flush, not CSC replacement. P5319 covers only 267 specific dealer-inventory 2015-2016 vehicles with a potentially out-of-specification CSC-tube O-ring, repaired with the transmission installed. Neither source supports the frozen 1,450-owner total, every-year population or blanket conversion-kit remedy.`,
    solution: `Verify manual transmission, VIN and campaign applicability, then inspect fluid level and locate any external or bellhousing leak. Measure master-cylinder operation, pedal return and hydraulic pressure under the exact procedure; apply NTB13-026b only when its no-leak conditions are met, and P5319 only to identified inventory VINs. Do not buy a CSC, tube, clutch kit, flywheel or external-conversion kit from this page; failed hydraulic component and exact fitment must be proven first.`,
    symptoms: ['manual transmission and VIN/campaign status verified', 'fluid loss and leak location documented', 'master cylinder, fluid condition, CSC tube and internal CSC paths separated'],
    systems: ['clutch master and hydraulic lines', 'CSC tube, O-ring and concentric slave cylinder', 'clutch release system, clutch and flywheel'],
    evidence: ['NTB13-026b prescribes fluid flushing when no hydraulic leak exists.', 'P5319 is limited to 267 specific dealer-inventory 2015-2016 vehicles and a CSC-tube O-ring.', 'Neither source supports universal 2009-2020 CSC failure or 1,450 owner reports.'],
    conflict: 'The indexed page merges a no-leak fluid bulletin and a bounded tube O-ring service action into a universal internal CSC defect.',
    summary: 'Held the overbroad CSC identity and removed the fabricated 1,450-owner total and conversion/clutch commerce.',
    citations: ['clutchPedal', 'cscTube', 'datasets'],
  }),
  [ids.differential]: held({
    description: `The exact 370Z communication and recall corpora contain no record establishing recurring rear-differential whine, improper gear mesh, bearing wear, limited-slip susceptibility or a 2009-2020 defect population. A rear whine can involve tires, wheel bearings, final-drive gears, driveshaft, transmission or fluid condition, and the frozen 340-owner total is unsupported.`,
    solution: `Reproduce the noise under controlled acceleration, coast, load and speed conditions and use chassis microphones if needed. Verify tire wear and pressure, wheel bearings, driveshaft joints, differential fluid level/specification and backlash/contact pattern before opening the final drive. Do not buy gear oil, additives, bearings, gears or a differential assembly from this page; the noise source, wear measurements and exact final-drive configuration must be proven first.`,
    symptoms: ['noise mapped by speed, load and coast condition', 'tires, wheel bearings and driveline joints excluded', 'fluid, backlash, bearing and gear-contact findings measured'],
    systems: ['rear differential gears and bearings', 'limited-slip unit and lubricant', 'tires, wheel bearings, driveshaft and transmission'],
    evidence: ['No exact communication supports the frozen differential-whine identity.', 'The corpus does not establish Sport-model susceptibility or one failure mechanism.', 'The 340-owner count and universal repair advice have no exact source.'],
    conflict: 'The indexed page turns an undifferentiated rear noise into a twelve-year final-drive defect and product recommendation.',
    summary: 'Held the unsupported differential identity and removed the fabricated 340-owner total.',
  }),
  [ids.hatchLeak]: held({
    description: `The frozen page is assigned to 2021-2023 370Z vehicles, outside the exact 2009-2020 370Z population in the manufacturer corpus. No exact communication establishes hatch-weatherstrip, tail-lamp-vent or rear-cargo water intrusion for those years, and the title combines several possible entry paths without a controlled leak test.`,
    solution: `Confirm VIN and actual model before using any 370Z body-sealing procedure. Protect the interior and water-test controlled sections to identify the first entry point; inspect hatch alignment, weatherstrip contact, tail-lamp seals, body seams, drains and pressure vents separately, then dry and assess the cargo floor. Do not buy weatherstrip, tail-lamp seals, sealant, trim or corrosion products from this page; model, leak path and compatible sealing material must be proven first.`,
    symptoms: ['VIN and actual model confirmed', 'first water-entry point documented', 'hatch, lamp, vent, seam and drain paths separated'],
    systems: ['hatch alignment and weatherstrip', 'tail-lamp seals and body pressure vents', 'body seams, drains and cargo floor'],
    evidence: ['No exact 2021-2023 370Z communication exists in the reviewed corpus.', 'No exact record supports the frozen combined rear-water-leak identity.', 'Several distinct sealing paths are merged without test evidence.'],
    conflict: 'The indexed page targets post-production 370Z years and assigns several unverified water-entry paths to one identity.',
    summary: 'Held the post-production hatch-leak identity and required VIN/model and controlled leak-path proof.',
  }),
  [ids.oilGallery]: held({
    description: `The exact 188-row manufacturer corpus contains no record establishing recurring oil-gallery-gasket leakage, low hot-idle pressure or engine damage across 2009-2020 370Z vehicles. Low oil pressure can involve oil level, viscosity, gauge/sender error, pump, bearing clearance, pickup restriction or internal leakage; the frozen 890-owner total and universal front-cover repair are unsupported.`,
    solution: `Verify oil level and exact specified viscosity, inspect for external leakage and confirm the warning or gauge with a mechanical pressure test at specified temperatures and speeds. Diagnose sender accuracy, pickup, pump, bearing clearance and internal passage leakage in the applicable sequence before removing the front cover. Do not buy gallery gaskets, a timing-cover kit, oil pump, oil, filter or engine repair from this page; measured pressure and the internal loss path must be proven first.`,
    symptoms: ['oil level, viscosity and temperature recorded', 'mechanical oil pressure measured against specification', 'sender, pickup, pump, bearing and internal-leak paths separated'],
    systems: ['engine oil galleries and front cover', 'oil pump, pickup and pressure regulation', 'pressure sender, bearings and lubrication'],
    evidence: ['No exact communication supports the frozen oil-gallery-gasket identity.', 'The corpus does not establish a 2009-2020 population or universal mechanism.', 'The 890-owner total and repair-cost narrative lack exact primary evidence.'],
    conflict: 'The indexed page assigns one internal gasket before oil pressure and alternative lubrication faults are measured.',
    summary: 'Held the unsupported oil-gallery identity and removed the fabricated 890-owner total.',
  }),
  [ids.battery]: held({
    description: `The frozen page is assigned to 2021-2023 370Z vehicles, outside the exact 2009-2020 production population in the reviewed corpus. The exact communications contain general battery-test procedures but no late-production 370Z weak-OEM-battery, sulfation or parasitic-draw defect. Storage discharge, battery capacity, charging output and accessory draw are diagnostic states, not one model-specific failure identity.`,
    solution: `Confirm VIN and actual model, then record resting, cranking and charging voltage and perform a battery conductance/load test. If discharge recurs, allow modules to sleep and measure parasitic current before isolating factory and aftermarket circuits. Do not buy a battery, AGM upgrade, maintainer, load tester, starter or alternator from this page; model identity, battery capacity, charging output and draw source must be proven first.`,
    symptoms: ['VIN and actual model confirmed', 'resting, cranking and charging voltage recorded', 'battery capacity, charging and parasitic-draw paths separated'],
    systems: ['12-volt battery and terminals', 'starter and charging system', 'sleep-state current and aftermarket accessories'],
    evidence: ['No exact 2021-2023 370Z communication exists in the reviewed corpus.', 'General battery-test guidance does not establish a model-specific defect.', 'No exact source supports a weak OEM battery or accessory-draw population.'],
    conflict: 'The indexed page describes post-production years and combines normal storage diagnosis with an unsupported OEM-battery defect.',
    summary: 'Held the post-production battery identity and required VIN/model plus measured capacity and current draw.',
  }),
  [ids.steeringLock]: held({
    description: `Nissan campaign P3208 is exact primary evidence that certain 2009-2010 370Z vehicles could have an Electronic Steering Column Lock malfunction after locking and then fail to start. Nissan states the condition does not affect steering or engine operation while driving and is not a safety recall. The frozen page expands that VIN-bounded two-year campaign through 2020, calls it an extended warranty, and recommends bypass/deletion and software without exact support.`,
    solution: `Verify model year and check the VIN in Nissan Service COMM for campaign P3208 before assigning the ESCL. For a no-start outside that population, preserve BCM/security codes and test battery voltage, key authorization, ESCL status, power, grounds and start command under the exact procedure. Do not buy an ESCL, relay, bypass module, ECU software, multimeter or starter from this page; campaign eligibility and the failed start-authorize circuit must be proven first.`,
    symptoms: ['model year and P3208 VIN status verified', 'BCM/security codes and ESCL state preserved', 'battery, key, ESCL and starter-command paths separated'],
    systems: ['Electronic Steering Column Lock', 'BCM, security authorization and start command', 'battery, power, grounds and starter circuit'],
    evidence: ['P3208 applies only to certain 2009-2010 370Z vehicles.', 'Nissan states the condition occurs only when attempting to start, not while driving, and is not a safety recall.', 'No exact source supports expansion through 2020 or bypass/deletion advice.'],
    conflict: 'The indexed page expands a VIN-bounded 2009-2010 campaign to twelve years and adds unsupported bypass and software remedies.',
    summary: 'Held the overbroad steering-lock identity while preserving exact P3208 limits and removed the fabricated 980-owner total.',
    citations: ['steeringCampaign', 'datasets'],
  }),
  [ids.strutNoise]: held({
    description: `The frozen page is assigned to 2021-2023 370Z vehicles, outside the exact 2009-2020 corpus. Nissan's strut/shock guidelines distinguish normal seepage from replacement-worthy leakage, rod resistance and noise, but they do not establish upper-strut-bearing binding, spring-seat movement or a lock-to-lock clicking identity. A front pop can also involve steering joints, sway links, brakes or tire scrub.`,
    solution: `Confirm VIN and actual model, reproduce the noise with steering angle, vehicle load and suspension travel recorded, and use chassis microphones where appropriate. Inspect strut mount and bearing, spring indexing, top nut, ball joints, tie rods, sway links, brake hardware and tire contact separately before alignment or disassembly. Do not buy strut mounts, bearings, springs, links, alignment service or diagnostic tools from this page; model and noise source must be proven first.`,
    symptoms: ['VIN and actual model confirmed', 'noise mapped by steering angle and suspension travel', 'mount, spring, joint, link, brake and tire paths separated'],
    systems: ['front struts, mounts and bearings', 'springs, steering joints and sway links', 'brake hardware, tires and alignment'],
    evidence: ['No exact 2021-2023 370Z communication exists in the reviewed corpus.', 'General strut guidelines do not establish upper-bearing or spring-seat failure.', 'The frozen lock-to-lock mechanism and parts prescription lack exact evidence.'],
    conflict: 'The indexed page targets post-production years and converts general strut inspection guidance into a specific bearing identity.',
    summary: 'Held the post-production strut-noise identity and required model and source localization before suspension parts.',
  }),
  [ids.synchro]: held({
    description: `The exact manufacturer and recall corpora contain no record establishing recurring second/third-gear synchronizer wear across 2009-2020 370Z manual transmissions. The frozen page incorrectly calls the gearbox CD009 and recommends Nissan Matic S, an automatic-transmission fluid, plus unrelated shift-solenoid and filter parts for a manual-synchro complaint. The 560-owner total and performance-synchro remedy are unsupported.`,
    solution: `Confirm the transmission code and reproduce the shift complaint by gear, temperature, engine speed and clutch state. Verify clutch release, hydraulic operation, shifter linkage and the exact specified manual-transmission fluid before inspecting internal baulk rings, hubs, sleeves and gears. Do not buy Matic S, a shift solenoid, transmission filter, synchro kit or rebuild from this page; transmission identity, clutch release and internal wear must be proven first.`,
    symptoms: ['transmission code and affected shift identified', 'temperature, speed and clutch-release effects documented', 'fluid, hydraulics, linkage and internal synchronizer paths separated'],
    systems: ['manual transmission synchronizers, hubs and gears', 'clutch release hydraulics and shifter linkage', 'specified manual-transmission lubricant'],
    evidence: ['No exact communication supports the frozen 2nd/3rd synchro identity.', 'CD009 and Matic S are not supported for the frozen 370Z manual-transmission claim.', 'Shift solenoids and transmission filters are unrelated to a manual synchronizer diagnosis.'],
    conflict: 'The indexed page combines an unsupported manual-synchro defect with wrong transmission identity, wrong fluid class and automatic-transmission commerce.',
    summary: 'Held the unsupported synchro identity and removed the fabricated 560-owner total and incorrect automatic-transmission advice.',
  }),
  [ids.window]: held({
    description: `Recall 11V538000 covers only certain 2011 370Z vehicles whose power-window switch controller was manufactured out of specification. It prescribes switch replacement and does not establish regulator cable or motor failure. The exact communication corpus likewise contains no 2009-2020 regulator/motor defect. The frozen page expands one bounded switch recall to different components and adds a fabricated 420-owner total.`,
    solution: `Check VIN recall status first, then reproduce the exact window behavior and perform reset/initialization if specified. Test switch input, controller output, power, ground, motor current, glass alignment, anti-pinch and regulator motion before removing the door assembly. Do not buy a regulator/motor assembly, switch, module, glass or lubricant from this page; recall eligibility and the failed electrical or mechanical path must be proven first.`,
    symptoms: ['VIN checked for 11V538000', 'reset status, switch command and motor current measured', 'switch-controller, motor, regulator and glass-alignment paths separated'],
    systems: ['power-window switch controller', 'window motor and regulator', 'frameless glass alignment and anti-pinch logic'],
    evidence: ['11V538000 is limited to certain 2011 370Z power-window switches.', 'The recall does not identify a regulator or motor defect.', 'No exact source supports a 2009-2020 regulator/motor population or 420 reports.'],
    conflict: 'The indexed page misrepresents a bounded switch-controller recall as a twelve-year regulator/motor failure.',
    summary: 'Held the overbroad window identity and removed the fabricated 420-owner total and regulator commerce.',
    citations: ['windowSwitchRecall', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  steeringCampaign: {
    title: 'Nissan P3208 - 2009-2010 370Z Electronic Steering Column Lock Campaign',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10192138-9999.pdf',
    sha256: 'a826d416c66ab9b979892d729dd9995ceb52da7c0d8ddbd81a8f1d48880783fc',
    pageCount: 2,
    visuallyReviewedPages: [1, 2],
  },
  clutchPedal: {
    title: 'Nissan NTB13-026b - 370Z Clutch Pedal Does Not Return',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10192530-9999.pdf',
    sha256: '434b459a7ebff87770abc0a70abe89638082dcdae73df6a77db1788dbab876ae',
    pageCount: 5,
    visuallyReviewedPages: [1, 5],
  },
  cscTube: {
    title: 'Nissan P5319 - 2015-2016 370Z CSC Tube Dealer Service Action',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10192676-9999.pdf',
    sha256: 'ad3f8dd9909cf4f70cf006464af38a36d39d8586714b9b57c033e28554672cd5',
    pageCount: 9,
    visuallyReviewedPages: [1, 9],
  },
});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
  windowSwitchRecall: {
    title: 'NHTSA Recall 11V538000 - 2011 370Z Power Window Switch Controller',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=11V538000',
    contains: '11V538000',
  },
});

module.exports = Object.freeze({
  make: 'Nissan', model: '370Z', slug: '370z', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-370z-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['370Z'],
  searchTerms: ['compressor', 'air conditioning', 'A/C', 'brake actuator', 'ABS', 'VDC', 'clutch pedal', 'stopper', 'slave cylinder', 'CSC', 'clutch hydraulic', 'differential whine', 'rear differential', 'water leak', 'weatherstrip', 'tail lamp', 'oil gallery', 'oil pressure', 'battery discharge', 'parasitic', 'steering lock', 'strut bearing', 'front strut', 'synchro', 'manual transmission', 'window regulator', 'window motor'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 1, '2010-2014': 23, '2015-2019': 108, '2020-2024': 54, '2025-2026': 2 },
    totalRows: 188,
    relevantRowCount: 16,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 2 },
    totalRows: 2,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: '11V538000 is a bounded 2011 power-window-switch-controller recall, not a regulator/motor identity. 18V153000 concerns a 2018 curtain-air-bag installation. Neither supports the other frozen pages.',
  },
  content,
  requiredProse: [
    { id: ids.ac, field: 'description', patterns: ['not a compressor-clutch', 'explicitly says not to replace', '310-owner'] },
    { id: ids.brakeActuator, field: 'description', patterns: ['20V123000.*not one of', 'no brake-actuator-relay'] },
    { id: ids.csc, field: 'description', patterns: ['NTB13-026b.*no hydraulic leaks', 'P5319.*267 specific', '1,450-owner'] },
    { id: ids.steeringLock, field: 'description', patterns: ['P3208.*2009-2010', 'does not affect steering or engine operation while driving', 'expands.*through 2020'] },
    { id: ids.window, field: 'description', patterns: ['11V538000.*2011', 'does not establish regulator cable or motor failure', '420-owner'] },
    { id: ids.synchro, field: 'description', patterns: ['incorrectly calls the gearbox CD009', 'Matic S.*automatic-transmission fluid', '560-owner'] },
    { id: ids.clutchSwitch, field: 'description', patterns: ['2021-2022.*outside', 'does not identify a pedal-stopper'] },
    { id: ids.hatchLeak, field: 'description', patterns: ['2021-2023.*outside'] },
    { id: ids.battery, field: 'description', patterns: ['2021-2023.*outside'] },
    { id: ids.strutNoise, field: 'description', patterns: ['2021-2023.*outside', 'do not establish upper-strut-bearing'] },
  ],
  observations: [
    { code: 'all-twelve-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every frozen identity exceeds exact population or mechanism evidence and remains published pending identity policy.' },
    { code: 'post-production-model-years-held', severity: 'population-safety', recordIds: [ids.clutchSwitch, ids.hatchLeak, ids.battery, ids.strutNoise], detail: 'Four pages target 2021-2023 370Z years absent from the exact 2009-2020 model corpus; no identity mutation is attempted.' },
    { code: 'exact-campaigns-not-expanded', severity: 'population-safety', recordIds: [ids.csc, ids.steeringLock, ids.window], detail: 'P5319, P3208 and 11V538000 stay confined to their exact VIN/year/component populations.' },
    { code: 'incorrect-advice-removed-in-proposal', severity: 'technical-accuracy', recordIds: [ids.ac, ids.brakeActuator, ids.synchro], detail: 'Unnecessary A/C replacement, false brake recall attribution, CD009 naming, Matic S and automatic-transmission parts are excluded.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Eight unsupported owner totals totaling 5,230 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-370z-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No 370Z page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
