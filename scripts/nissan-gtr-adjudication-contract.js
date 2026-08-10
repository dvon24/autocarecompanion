/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  dashboard: 'nissan-gt-r-melting-cracking-dashboard',
  brakeRotors: 'nissan-gt-r-oem-brembo-cross-drilled-brake-rotor-cracking-warping',
  batteryDrain: 'nissan-gt-r-parasitic-battery-drain-dead-battery-when-parked',
  axleRecall: 'nissan-gt-r-steering-knuckle-rear-axle-housing-insufficient-strength',
  tpms: 'nissan-gt-r-tpms-sensor-failure-rf-interference-faults',
  transferCase: 'nissan-gtr-transfer-case-2009',
  bellhousing: 'nissan-gt-r-transmission-bellhousing-bearing-failure-rattle',
  transmission: 'nissan-gtr-transmission-judder-2009',
  turboOil: 'nissan-gtr-turbo-oil-line-2009',
  wastegate: 'nissan-gtr-turbo-wastegate-rattle-2009',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.axleRecall, ids.tpms].sort());
const reportCountCleanupIds = Object.freeze([ids.transferCase, ids.transmission, ids.turboOil].sort());
const relevantDocumentIds = Object.freeze([
  '10031305', '10054527', '10119186', '10119222', '10164660', '10190121',
  '10190166', '10191933', '10192216', '10192217', '10192544', '10192597',
  '10192614', '10192638', '10227268', '10251544', '11031704', '11031705',
]);
const campaigns = Object.freeze(['15V054000', '15V795000', '19V654000', '21V402000']);

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
    commerceDecision: 'failure path, component, production scope and VIN fitment remain unresolved; no universal retail part',
  });
}

function retained({ description, solution, symptoms, systems, evidence, summary, citations, commerceDecision }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    summary,
    citations,
    commerceDecision,
  });
}

const content = Object.freeze({
  [ids.dashboard]: held({
    description: `The exact 197-row GT-R manufacturer-communication corpus contains no Nissan bulletin establishing melting, glare, chemical odor and cracking across every 2009-2016 dashboard. A class-action complaint is an allegation, not a technical finding or proof of an affected population. The frozen page also converts forum and aftermarket-parts coverage into defect frequency and universal dash-replacement or upholstery advice.`,
    solution: `Document the exact surface condition, location, temperature exposure and glare before repair. Check warranty or settlement history by VIN and obtain an interior-trim assessment that distinguishes coating degradation, substrate cracking, vent or fastener damage and prior chemical treatment. Do not buy a dashboard, cover, wrap, Alcantara kit or adhesive from this page; material condition, repair method, airbag/trim constraints and fitment must be established first.`,
    symptoms: ['surface softening, cracking and glare documented separately', 'prior cleaners, coatings and heat exposure recorded', 'covering, refinishing and replacement constraints assessed'],
    systems: ['instrument-panel pad and soft-touch finish', 'vents, cluster and center-console trim', 'passenger-airbag and interior attachment points'],
    evidence: ['No exact GT-R manufacturer communication supports the frozen dashboard population.', 'A lawsuit allegation does not establish defect mechanism or prevalence.', 'No primary source supports universal wrapping or replacement as the repair.'],
    conflict: 'The indexed page turns litigation allegations and forum discussion into an eight-year manufacturer-defect identity with universal upholstery commerce.',
    summary: 'Held the unsupported dashboard-degradation identity and removed universal replacement and covering advice.',
  }),
  [ids.brakeRotors]: held({
    description: `Nissan brake communications explain how to diagnose judder, measure thickness variation and resurface rotors when a verified condition exists. They do not establish factory Brembo cross-drilled-rotor cracking or warping across 2009-2024, a two-to-three-track-day life, inadequate brake cooling or the frozen 4,000-pound causation claim. Surface heat checks, drill-hole cracking and pad deposits are distinct inspection findings.`,
    solution: `Inspect both faces of every rotor for crack length and propagation, measure thickness, runout and thickness variation, and document pad condition and heat history before further track use. Follow the service limit and track-event inspection requirements for the exact brake package. Do not buy rotors, hats, pads, cooling ducts or a brake kit from this page; measured condition, wheel/brake specification and intended use must be established first.`,
    symptoms: ['rotor cracks and heat checks mapped on both faces', 'thickness, runout and variation measured', 'cracking, pad deposits, hub runout and caliper paths separated'],
    systems: ['two-piece brake rotors and hats', 'pads, calipers and hubs', 'brake cooling and wheel/tire package'],
    evidence: ['Exact bulletins are general judder and resurfacing guidance, not proof of an R35 rotor defect.', 'No exact source supports the frozen track-life or brake-cooling claims.', 'No primary evidence proves recurrence through model year 2024.'],
    conflict: 'The indexed page converts general brake-service guidance and enthusiast reports into a sixteen-year track-use rotor-defect identity.',
    summary: 'Held the unsupported Brembo rotor-cracking/warping identity and required measured brake inspection.',
  }),
  [ids.batteryDrain]: held({
    description: `Exact GT-R communications describe AV-control-unit diagnosis, configuration and replacement procedures. They do not establish that the AV unit keeps the amplifier awake, that BCM faults recur across 2009-2016 or that pulling the 15-amp AUDIO fuse identifies the cause. Low-use storage, battery condition, accessories and module wake-up are separate contributors, and the frozen forum citations are not primary evidence.`,
    solution: `Fully charge and test the battery, allow every module to enter sleep mode, then measure key-off current without repeatedly waking the network. Isolate the circuit with service-manual procedures and inspect aftermarket wiring before replacing modules. Do not buy a battery, amplifier, AV unit, BCM, relay or battery tender from this page; measured draw, sleep timing, circuit and programming requirements must be established first.`,
    symptoms: ['battery capacity and state of charge measured', 'key-off current measured after verified sleep time', 'factory circuit, accessory and storage-discharge paths separated'],
    systems: ['12-volt battery and charging system', 'AV control unit and amplifier', 'BCM, vehicle network and aftermarket accessories'],
    evidence: ['Exact AV bulletins are diagnostic and configuration procedures, not parasitic-draw findings.', 'No exact source proves an amplifier-on signal across the frozen years.', 'No primary source supports fuse removal or relay bypass as a universal repair.'],
    conflict: 'The indexed page converts forum diagnoses into an eight-year AV-unit parasitic-drain identity and bypass recommendation.',
    summary: 'Held the unsupported parasitic-drain identity and required measured sleep-current diagnosis.',
  }),
  [ids.axleRecall]: retained({
    description: `NHTSA recall 21V402 and Nissan campaign R21A4 apply to certain 2021 GT-R vehicles. A gap in a furnace door reduced heat-treatment temperature for specified front steering knuckles and rear axle housings, leaving affected castings with insufficient hardness. A strong impact can deform a component, cause an off-center steering wheel or wheel misalignment and, if operation continues, contribute to loss of control or wheel separation. The recall is VIN- and casting-stamp-specific; it does not mean every 2021 component is defective.`,
    solution: `Check the VIN for 21V402/R21A4 and have a certified Nissan GT-R dealer inspect the casting stamps. The dealer replaces only affected front steering knuckles and/or rear axle housings at no charge under the recall procedure. Do not buy a knuckle, rear axle housing, hub or suspension hardware from this page; recall eligibility and the affected casting must be confirmed first.`,
    symptoms: ['VIN checked for 21V402/R21A4', 'casting stamps inspected by the recall procedure', 'impact damage, steering offset and wheel alignment documented'],
    systems: ['front steering knuckles', 'rear axle housings', 'wheel alignment and steering control'],
    evidence: ['The official Part 573 report lists 2021 GT-R and exact production dates.', 'The defect is insufficient hardness from a furnace-door heat-treatment condition.', 'The official remedy is casting-stamp inspection and replacement only when affected.'],
    summary: 'Retained the exact 21V402/R21A4 identity and bounded it to VIN, casting stamp and official remedy.',
    citations: ['axleRecallReport', 'axleRecallApi', 'datasets'],
    commerceDecision: 'an exact federal recall governs inspection and replacement; no universal retail part should be purchased from this page',
  }),
  [ids.tpms]: retained({
    description: `Nissan NTB13-088 supports TPMS radio-frequency interference causing C1708/C1709/C1710/C1711 “No Data,” along with sensor leaks, registration, wheel-service damage and environmental pressure effects. GT-R-specific records also require verifying whether the sensor transmits before replacement; on certain 2018 cars, a transmitting sensor with recurring codes can lead to HVAC-blower diagnosis. The exact sources do not support a universal seven-to-ten-year sensor-battery life, a 315 MHz specification for every frozen year or replacing a sensor solely from one code.`,
    solution: `Confirm cold tire pressures, read the exact wheel-position DTC and use the approved activation/diagnostic tool to verify transmission. Remove or relocate nearby aftermarket electronics when RF interference is suspected, and inspect for sensor or valve leakage and tire-service damage. Do not buy a sensor, valve kit, activation tool, HVAC blower or tuning device from this page; transmission result, code path, wheel equipment and VIN fitment must be established first.`,
    symptoms: ['cold pressure and exact wheel-position DTC recorded', 'sensor transmission verified with the approved tool', 'RF interference, leak, service damage and HVAC-blower paths separated'],
    systems: ['TPMS wheel sensors and valves', 'TPMS receiver and registration', 'RF environment and HVAC blower interference'],
    evidence: ['NTB13-088 explicitly covers RF interference and the four No Data codes.', 'Exact GT-R material requires signal verification before sensor replacement.', 'No exact source supports the frozen battery-life and universal frequency claims.'],
    summary: 'Retained the TPMS/RF-fault identity while removing unsupported battery-life and universal-replacement claims.',
    citations: ['tpmsBulletin', 'datasets'],
    commerceDecision: 'the diagnostic identity is supported, but failed wheel position, signal result and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.transferCase]: held({
    description: `The exact GT-R corpus contains no manufacturer communication establishing transfer-case clutch-pack wear, front-differential bearing whine or reduced AWD performance across 2009-2024. It also does not support a universal 15,000-mile fluid interval, the frozen rebuild prices or named specialist and upgrade recommendations. Track inspection and maintenance schedules are not proof of a recurring component defect. The frozen 380-owner total is unsupported.`,
    solution: `Record the exact vibration, noise, warning and operating mode, inspect fluid level and condition and follow the GT-R service procedure for AWD torque distribution, transfer assembly and front final drive. Separate tires, wheel bearings, axles and propeller shafts before internal repair. Do not buy fluid, clutch packs, bearings, a transfer assembly or differential from this page; symptom source, service history and exact specification must be established first.`,
    symptoms: ['noise or vibration mapped by speed, load and drive mode', 'fluid level, condition and service history recorded', 'transfer, differential, axle, bearing and tire paths separated'],
    systems: ['ATTESA transfer assembly and clutch control', 'front final drive and bearings', 'axles, propeller shafts and tires'],
    evidence: ['No exact GT-R communication supports the frozen transfer-case/front-differential wear population.', 'No exact source establishes a universal 15,000-mile interval as a defect remedy.', 'No primary source supports 380 reports, rebuild prices or named aftermarket vendors.'],
    conflict: 'The indexed page presents maintenance and enthusiast repair options as a sixteen-year AWD component-failure identity.',
    summary: 'Held the unsupported transfer-case/front-differential identity and removed the fabricated 380-owner total.',
  }),
  [ids.bellhousing]: held({
    description: `Nissan NTB09-147a supports a flywheel-housing rattle only on 2009-2012 GT-R and explicitly says it does not apply to 2013 or newer vehicles. The condition is localized at the rear tail-shaft area and the bulletin replaces the flywheel housing. It does not establish bearing wear wallowing the aluminum housing, constant push/pull loading, eventual shaft float or recurrence through 2024.`,
    solution: `Differentiate normal GT-R driveline noise from a rattle directly at the flywheel-housing rear tail-shaft area using the bulletin procedure. Check application before replacing the housing and inspect the driveshaft and rear transaxle noise paths separately. Do not buy a flywheel housing, bearing, billet insert, driveshaft or transmission from this page; source location, model year and exact bulletin applicability must be established first.`,
    symptoms: ['rattle location verified at the flywheel-housing tail-shaft area', 'normal driveshaft/transaxle operating noise separated', 'model year checked against NTB09-147a'],
    systems: ['flywheel housing and rear tail shaft', 'main driveshaft and support hardware', 'rear-mounted transaxle'],
    evidence: ['NTB09-147a is limited to 2009-2012 and explicitly excludes 2013 and newer.', 'The exact remedy is flywheel-housing replacement.', 'No exact source proves the frozen bearing-wallow mechanism or 2009-2024 scope.'],
    conflict: 'The indexed page turns a four-year flywheel-housing rattle bulletin into a sixteen-year bellhousing-bearing-failure identity with an invented mechanism.',
    summary: 'Held the overbroad bellhousing-bearing identity while preserving exact NTB09-147a scope.',
    citations: ['flywheelHousingBulletin', 'datasets'],
  }),
  [ids.transmission]: held({
    description: `Nissan P8258/NTB09-002 applies only to 2009 GT-R transmission-control-module reprogramming and is explicitly no longer active. It does not establish 2009-2024 GR6 clutch-pack failure, track-accelerated wear, a transmission warranty extension, a 15,000-mile fluid mandate or the frozen five-figure rebuild and upgrade prices. Normal low-speed dual-clutch behavior, software calibration and mechanical clutch wear require separate findings. The frozen 850-owner total is unsupported.`,
    solution: `Record temperature, drive mode, speed, clutch data, DTCs and whether the behavior is reproducible after the prescribed warm-up and maintenance checks. Compare operation with GT-R service criteria before software or mechanical repair. Do not buy fluid, clutch packs, a TCM, valve body or rebuilt transaxle from this page; model year, calibration, clutch measurements, service history and fitment must be established first.`,
    symptoms: ['judder conditions, temperature and drive mode recorded', 'DTCs, clutch data and software level preserved', 'normal behavior, calibration, hydraulic and clutch-wear paths separated'],
    systems: ['GR6 dual-clutch transaxle', 'transmission control module and calibration', 'clutch packs, hydraulics and fluid'],
    evidence: ['P8258 is a 2009-only TCM reprogram initiative and is no longer active.', 'No exact source proves a 2009-2024 clutch-failure population or warranty extension.', 'No primary evidence supports 850 reports or the frozen prices and product recommendations.'],
    conflict: 'The indexed page expands one inactive 2009 software campaign into sixteen years of mechanical GR6 failure and aftermarket commerce.',
    summary: 'Held the overbroad GR6 identity and removed the fabricated 850-owner total.',
    citations: ['tcmCampaign', 'datasets'],
  }),
  [ids.turboOil]: held({
    description: `The exact GT-R manufacturer-communication and recall inventories contain no record establishing turbo oil-feed or return-line leakage across 2009-2016, degraded banjo sealing washers, high-boost tuning causation or an R35 fire-hazard population. The frozen page provides no exact source and combines feed lines, return lines, washers and braided replacements without locating a verified leak. The frozen 290-owner total and price range are unsupported.`,
    solution: `Treat oil odor, smoke or oil near hot exhaust parts as an immediate inspection issue. Clean and trace the leak from its highest wet point, verify oil pressure and inspect turbo fittings, feed/return lines, covers and nearby engine seals before repair. Do not buy crush washers, braided lines, turbochargers or a line kit from this page; leak origin, side, line specification and VIN fitment must be proven first.`,
    symptoms: ['oil source traced from the highest wet point', 'feed, return and adjacent engine-seal paths separated', 'hot-exhaust contamination and oil level assessed'],
    systems: ['turbocharger oil feed and return circuits', 'turbocharger fittings and seals', 'engine lubrication and nearby exhaust components'],
    evidence: ['No exact GT-R communication supports the frozen turbo-oil-line identity.', 'No exact source establishes washer aging or tuning as the cause.', 'No primary evidence supports 290 reports, fire frequency or the frozen price range.'],
    conflict: 'The indexed page presents an unsourced eight-year turbo-oil-line fire-hazard identity and universal parts advice.',
    summary: 'Held the unsupported turbo-oil-line identity and removed the fabricated 290-owner total.',
  }),
  [ids.wastegate]: held({
    description: `The frozen page cites Nissan NTB12-045 as a GT-R turbocharger wastegate-rattle bulletin, but that reference is for 2011-2012 Juke rear-seat rattle. No matching GT-R wastegate communication appears in the exact 197-row corpus. The frozen page does not support a 2009-2024 actuator-diaphragm wear population, boost-control progression, dealer rod adjustment or universal external-wastegate conversion.`,
    solution: `Localize the metallic noise with the engine cold and warm, record boost deviation and DTCs and inspect heat shields, exhaust hardware, turbo linkage and actuator command before adjustment. Do not alter a wastegate rod without the exact service specification. Do not buy an actuator, rebuild kit, turbocharger or external-wastegate conversion from this page; noise source, boost-control fault and exact turbo fitment must be established first.`,
    symptoms: ['noise localized by temperature and engine load', 'boost behavior and DTCs recorded', 'heat-shield, exhaust, linkage and actuator paths separated'],
    systems: ['turbocharger wastegate linkages and actuators', 'boost control and ECM inputs', 'exhaust hardware and heat shields'],
    evidence: ['NTB12-045 is not a GT-R wastegate bulletin.', 'No exact GT-R communication supports the frozen sixteen-year identity.', 'No primary source supports rod adjustment, rebuild kits or external-wastegate conversion as universal remedies.'],
    conflict: 'The indexed page relies on an unrelated Juke interior-rattle bulletin for a sixteen-year GT-R turbocharger identity.',
    summary: 'Held the false-citation wastegate identity and removed unsupported adjustment and conversion advice.',
  }),
});

const pdfSources = Object.freeze({
  axleRecallReport: {
    title: 'NHTSA Part 573 Report 21V402 - Steering Knuckle or Rear Axle Housing Insufficient Hardness',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V402-7979.PDF',
    sha256: '3d8d0d41caa969a5f435bd7617ffa40c11e37c6fc01d4c840651119788491636',
    pageCount: 5,
    visuallyReviewedPages: [1, 2, 3, 5],
  },
  tpmsBulletin: {
    title: 'Nissan NTB13-088 - TPMS/LTPWS Bulletin Summary and RF Interference',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10054527-9811.pdf',
    sha256: 'fcb4ca0ae487e5d83743a634a425aa9011c84a7172a18296b2cb022caf141582',
    pageCount: 11,
    visuallyReviewedPages: [1, 11],
  },
  flywheelHousingBulletin: {
    title: 'Nissan NTB09-147a - 2009-2012 GT-R Rattle from Flywheel Housing',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10192544-9999.pdf',
    sha256: 'eda3b90f8d0a66cd6326a44a8bbca7ba1b9b09d317c8f8bcb93250762d6911e4',
    pageCount: 11,
    visuallyReviewedPages: [1, 11],
  },
  tcmCampaign: {
    title: 'Nissan NTB09-002B/P8258 - 2009 GT-R TCM Reprogram Initiative (No Longer Active)',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10191933-0001.pdf',
    sha256: 'e8be0c1946b99fe6266aa75e94f71cd17640d80e87f1730cd458433773e4effa',
    pageCount: 1,
    visuallyReviewedPages: [1],
  },
});

const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  axleRecallApi: {
    title: 'NHTSA Recall 21V402000 - GT-R Steering Knuckle/Rear Axle Housing',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V402000',
    contains: 'insufficient strength due to improper heat-treatment',
  },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'GT-R', slug: 'gt-r', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-gtr-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['GT-R', 'GTR'],
  searchTerms: ['dashboard', 'instrument panel', 'sticky', 'melt', 'brake rotor', 'brake judder', 'battery drain', 'parasitic', 'AV control', 'steering knuckle', 'rear axle housing', 'heat treatment', 'TPMS', 'RF interference', 'transfer case', 'front differential', 'bell housing', 'bellhousing', 'judder', 'transmission', 'clutch', 'oil feed', 'turbo oil', 'wastegate', 'rattle'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 5, '2010-2014': 24, '2015-2019': 100, '2020-2024': 65, '2025-2026': 3 },
    totalRows: 197,
    relevantRowCount: 18,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 14 },
    totalRows: 14,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The four exact GT-R campaigns concern the 2015 steering-column lock, 2015 steering-column outer tube, 2019 backup-camera display and 2021 insufficient-hardness steering-knuckle/rear-axle condition. Only 21V402 matches a frozen identity; none proves the remaining dashboard, brake, battery, AWD, transmission or turbo identities.',
  },
  content,
  requiredProse: [
    { id: ids.dashboard, field: 'description', patterns: ['no Nissan bulletin establishing melting', 'class-action complaint is an allegation'] },
    { id: ids.axleRecall, field: 'description', patterns: ['certain 2021 GT-R vehicles', 'gap in a furnace door', 'VIN- and casting-stamp-specific'] },
    { id: ids.tpms, field: 'description', patterns: ['C1708/C1709/C1710/C1711', 'do not support a universal seven-to-ten-year sensor-battery life'] },
    { id: ids.bellhousing, field: 'description', patterns: ['2009-2012 GT-R', 'does not apply to 2013 or newer'] },
    { id: ids.transmission, field: 'description', patterns: ['only to 2009 GT-R', 'explicitly no longer active'] },
    { id: ids.wastegate, field: 'description', patterns: ['2011-2012 Juke rear-seat rattle', 'No matching GT-R wastegate communication'] },
  ],
  observations: [
    { code: 'two-identities-retained-eight-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only exact 21V402 recall scope and bounded TPMS/RF diagnostic scope are retained; eight identities remain published but blocked pending identity policy.' },
    { code: 'wastegate-false-citation-held', severity: 'source-integrity', recordIds: [ids.wastegate], detail: 'The frozen GT-R wastegate page cites NTB12-045, a 2011-2012 Juke rear-seat-rattle bulletin.' },
    { code: 'flywheel-housing-years-bounded', severity: 'technical-accuracy', recordIds: [ids.bellhousing], detail: 'NTB09-147a is limited to 2009-2012 and explicitly excludes 2013 and newer, so the 2009-2024 bearing identity remains held.' },
    { code: 'inactive-2009-tcm-campaign-not-expanded', severity: 'technical-accuracy', recordIds: [ids.transmission], detail: 'P8258 is a no-longer-active 2009 TCM initiative and is not expanded into sixteen years of clutch-pack failure.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 1,520 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-gtr-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No GT-R page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
