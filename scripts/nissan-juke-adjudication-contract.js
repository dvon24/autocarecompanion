/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  condenser: 'nissan-juke-c-condenser-leaks',
  cvt: 'nissan-juke-cvt-failure-2011',
  startStop: 'nissan-juke-engine-start-stop-push-button-sticks-causing-unexpected-shut',
  fuelSensor: 'nissan-juke-fuel-pressure-sensor-loosens-leaks-fuel',
  brakeMaster: 'nissan-juke-nismo-rs-brake-master-cylinder-seal-failure-fluid-leak-into',
  timingChain: 'nissan-juke-timing-chain-2011',
  turboFailure: 'nissan-juke-turbo-failure-2011',
  turboOil: 'nissan-juke-turbo-oil-leak-2011',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.brakeMaster, ids.fuelSensor, ids.startStop].sort());
const reportCountCleanupIds = Object.freeze([ids.cvt, ids.timingChain, ids.turboFailure].sort());
const relevantDocumentIds = Object.freeze([
  '10055923', '10075211', '10109203', '10109240', '10109242', '10109248',
  '10118695', '10118715', '10120561', '10152510', '10158426', '10158427',
  '10165785', '10167322', '10167413', '10176202', '10176203', '10176204',
  '10176226', '10185469', '10188358', '10190200', '10192136', '10192216',
  '10192217', '10192352', '10192360', '10192605', '10192723', '10192772',
  '10192805', '10192833', '10192841', '10194210', '10227268', '10237563',
  '11001192',
]);
const campaigns = Object.freeze(['11V583000', '12V069000', '12V328000', '14V683000', '15V418000', '18V086000', '18V156000']);

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
    commerceDecision: 'failure path, component, drivetrain specification and VIN fitment remain unresolved; no universal retail part',
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
  [ids.condenser]: held({
    description: `Nissan NTB09-099a covers refrigerant leakage at an A/C pipe or hose joint on Nissan vehicles and says not to replace a pipe, hose or other component when an O-ring will solve the incident. It does not establish Juke condenser puncture, exposed mounting, fin or seal corrosion, road-debris prevalence or mandatory condenser replacement across 2011-2017. The frozen citations are estimator, retailer and forum pages rather than primary defect evidence.`,
    solution: `Recover refrigerant safely and locate the leak with the applicable service-manual procedure before selecting a repair. Inspect pipe and hose joints, O-rings, metal surfaces, condenser, compressor and evaporator separately; after repair, evacuate, recharge to the exact specification and recheck for leakage. Do not buy a condenser, mesh guard, O-ring, hose, compressor or refrigerant from this page; leak location, damage type, system specification and VIN fitment must be established first.`,
    symptoms: ['refrigerant loss confirmed and leak location identified', 'joint, O-ring, tube, hose and condenser paths separated', 'system charge and post-repair leak check documented'],
    systems: ['A/C condenser and refrigerant circuit', 'pipe and hose joints and O-ring seals', 'compressor, evaporator and system charge'],
    evidence: ['NTB09-099a is a joint O-ring diagnostic bulletin, not proof of a Juke condenser defect.', 'The bulletin expressly warns against replacing a component when an O-ring resolves the leak.', 'No primary source supports road-debris prevalence or universal protective mesh.'],
    conflict: 'The indexed page converts non-primary anecdotes and cost pages into a seven-year condenser identity and mandatory replacement rule.',
    summary: 'Held the unsupported condenser identity and applied the exact Nissan leak-location and O-ring boundary.',
    citations: ['acOringBulletin', 'datasets'],
  }),
  [ids.cvt]: held({
    description: `Nissan NTB20-091 supports a bounded diagnostic and repair path for 2015-2017 Juke F15 vehicles, excluding NISMO RS, with RE0F10D CVT and specified DTCs P0776, P2813, P0841, P17F0, P17F1 and P1715. It does not establish the frozen 2011-2017 Jatco CVT7/JF015E identity, torque-capacity theory, AWD-strain mechanism, failure-before-100,000-miles claim or universal 25,000-mile NS-3 interval. Warranty-extension communications cover eligible VINs and do not prove that every CVT fails. The frozen 580-owner total is unsupported.`,
    solution: `Record the exact symptom, transmission temperature, DTCs and freeze-frame data, identify the CVT model and verify VIN-specific warranty coverage before repair. Follow the applicable flow chart: some DTC and complaint combinations fall outside NTB20-091, and the bulletin requires evidence of belt slippage before a belt/pulley subassembly path. Do not buy CVT fluid, a control valve, belt/pulley assembly, torque converter or transmission from this page; configuration, code path, measured condition, warranty eligibility and VIN fitment must be established first.`,
    symptoms: ['CVT model, temperature, DTCs and freeze-frame data recorded', 'judder and belt-slippage evidence verified', 'software, control-valve, belt/pulley, converter and unrelated engine paths separated'],
    systems: ['RE0F10D continuously variable transmission where applicable', 'TCM calibration and control valve', 'belt and pulley subassembly, fluid circuit and cooler'],
    evidence: ['NTB20-091 is limited to 2015-2017 F15 excluding NISMO RS and specifies RE0F10D.', 'Its exact DTC set and repair flow differ materially from the frozen page.', 'No primary source proves the frozen torque-capacity, AWD-strain, mileage, interval or 580-owner claims.'],
    conflict: 'The indexed page turns bounded CVT diagnosis and conditional warranty coverage into a seven-year universal transmission-failure identity with the wrong frozen transmission theory.',
    summary: 'Held the overbroad Juke CVT identity and removed the fabricated 580-owner total.',
    citations: ['cvtBulletin', 'datasets'],
  }),
  [ids.startStop]: retained({
    description: `NHTSA recall 15V418 and Nissan campaign R1511 apply to certain 2013-2014 Juke vehicles. In hot conditions, the engine stop/start switch can bind; if it remains depressed, road vibration can cause the vehicle to interpret a stop request and shut the engine off while driving. The official campaign is VIN-specific and does not mean every 2013-2014 switch is affected.`,
    solution: `Check the VIN for 15V418/R1511. The official dealer remedy inspects the switch for the crush rib, removes the rib when present and installs the specified foam seal at no charge; it is not a universal push-button replacement. Do not buy a switch, immobilizer antenna, foam, BCM or start-system part from this page; recall eligibility and the official remedy must be confirmed first.`,
    symptoms: ['VIN checked for 15V418/R1511', 'switch binding and heat conditions documented', 'recall condition separated from BCM, key and power-supply faults'],
    systems: ['engine stop/start switch and housing', 'immobilizer antenna and foam seal', 'start authorization and engine shutdown request'],
    evidence: ['NTB15-064a identifies 2013-2014 Juke and campaign R1511/15V418.', 'The exact remedy removes a crush rib and applies a 30 mm foam seal.', 'The bulletin does not prescribe replacing the complete switch assembly.'],
    summary: 'Retained the exact 15V418/R1511 switch identity and corrected the remedy to crush-rib removal and foam installation.',
    citations: ['startStopRecall', 'recall15V418', 'datasets'],
  }),
  [ids.fuelSensor]: retained({
    description: `NHTSA recalls 12V069 and 14V683 cover specific 2011-2014 Juke vehicles with direct-injection engines. An assembly-process torque issue can allow the fuel pressure sensor to loosen gradually from heat and vibration and leak a small amount of fuel, increasing fire risk near an ignition source. Recall 14V683 covers 2012-2014 production and excludes vehicles already remedied under 12V069; the combined page remains VIN-specific.`,
    solution: `Treat fuel odor or visible leakage as urgent and avoid ignition sources. Check the VIN for 12V069 and 14V683; the official remedy is dealer inspection and retightening of the fuel pressure sensor to the proper torque specification at no charge, with prior-remedy status checked. Do not buy a pressure sensor, fuel rail, seal or high-pressure line from this page; recall eligibility, leak source and official remedy must be confirmed first.`,
    symptoms: ['VIN and prior 12V069 remedy status checked', 'fuel odor or leakage source documented', 'sensor connection separated from rail, line, injector and pump faults'],
    systems: ['direct-injection fuel pressure sensor connection', 'high-pressure fuel rail and lines', 'under-hood fire-risk controls'],
    evidence: ['14V683 identifies 2012-2014 Juke production and references the earlier 2011-2012 campaign.', 'The defect is insufficient tightening followed by gradual loosening from heat and vibration.', 'The official remedy is retightening to specification, not automatic sensor replacement.'],
    summary: 'Retained the exact 12V069/14V683 fuel-sensor identity and bounded it to VIN and official retorque remedy.',
    citations: ['fuelSensorRecall', 'recall12V069', 'recall14V683', 'datasets'],
  }),
  [ids.brakeMaster]: retained({
    description: `NHTSA recall 18V086 applies to 415 potentially affected 2015-2017 Juke NISMO RS vehicles produced July 6, 2015 through January 30, 2017. An out-of-specification master-cylinder cup seal can twist and fail to seat properly under booster negative pressure and dry piston conditions, allowing brake fluid to leak into the booster. The warning lamp can illuminate and normal brake output can decrease, increasing stopping distance.`,
    solution: `Check the VIN for 18V086/R1801 and inspect brake-fluid level and warning status without relying on pedal feel alone. The official dealer remedy replaces the brake master cylinder with the modified cup-seal design and restores and verifies the hydraulic system. Do not buy a master cylinder, booster, seal kit or brake-fluid product from this page; recall eligibility and the official remedy must be confirmed first.`,
    symptoms: ['VIN checked for 18V086/R1801', 'brake warning and fluid level documented', 'master-cylinder-to-booster leakage distinguished from external hydraulic leaks'],
    systems: ['brake master cylinder and cup seal', 'brake booster', 'split hydraulic circuits and warning system'],
    evidence: ['The Part 573 report identifies only 2015-2017 Juke NISMO RS and 415 potentially affected vehicles.', 'The exact mechanism is cup-seal twist and loss of sealing into the booster.', 'The official remedy is master-cylinder replacement with a modified cup-seal design.'],
    summary: 'Retained the exact 18V086/R1801 NISMO RS master-cylinder identity and official remedy.',
    citations: ['brakeMasterRecall', 'recall18V086', 'datasets'],
  }),
  [ids.timingChain]: held({
    description: `Nissan campaign P4213/NTB14-030d applies only to certain specific 2011-2013 Juke vehicles and replaces the timing chain, slack guide, tension guide and crankshaft sprocket. Campaign records state P4213 is no longer active for repair orders opened after September 28, 2017. The evidence does not extend the population through 2017 or establish irregular oil changes, turbo-engine comparison, tensioner-limit progression, the frozen five-code set or a universal recurrence-prevention interval. The frozen 380-owner total is unsupported.`,
    solution: `Check historical campaign completion and VIN eligibility, then diagnose current noise or timing faults using the exact engine service procedure. Preserve DTCs and correlation data, verify oil condition and pressure and inspect timing components before selecting repair scope; past P4213 eligibility does not establish a current failure. Do not buy a chain kit, guides, tensioner, sprockets, seals or engine from this page; VIN history, engine, measured timing condition and superseded parts must be established first.`,
    symptoms: ['P4213 history and exact VIN checked', 'noise, DTCs and cam/crank correlation documented', 'chain, tensioner, oil-pressure, valve-control and unrelated noise paths separated'],
    systems: ['MR16DDT timing chain and guides', 'crankshaft and camshaft timing', 'tensioner, lubrication and valve-timing control'],
    evidence: ['NTB14-030d is limited to certain 2011-2013 Juke vehicles.', 'P4213 is no longer active for current repair orders.', 'No primary source supports the 2014-2017 extension, frozen causal claims, DTC list, price or 380 reports.'],
    conflict: 'The indexed page expands an expired VIN-specific three-year campaign into seven years of recurring timing-chain failure and universal preventive advice.',
    summary: 'Held the overbroad timing-chain identity and removed the fabricated 380-owner total.',
    citations: ['timingChainCampaign', 'datasets'],
  }),
  [ids.turboFailure]: held({
    description: `Nissan NTB16-035a is service information: whenever a turbocharger is replaced for any reason on an MR16DDT Juke, the technician must also replace the specified steel oil-feed tube. It does not establish premature turbocharger failure, bearing wear, metal debris entering the engine, oil-change causation or a seven-year defect population. It also provides two different feed-tube part numbers by vehicle configuration rather than a universal turbo or tube. The frozen 650-owner total is unsupported.`,
    solution: `Confirm low boost, smoke or oil consumption with DTC, charge-air, wastegate/actuator, oil-supply and shaft-condition tests before condemning the turbocharger. If an exact turbo replacement is justified, follow NTB16-035a and the service manual, including the correct configuration-specific oil-feed tube and contamination inspection. Do not buy a turbocharger, feed tube, oil line, actuator or installation kit from this page; failure mode, configuration, supersession and VIN fitment must be established first.`,
    symptoms: ['boost deviation, smoke and oil consumption measured separately', 'charge-air, actuator, control and lubrication paths tested', 'turbo configuration and feed-tube application identified'],
    systems: ['MR16DDT turbocharger assembly', 'turbocharger oil-feed circuit', 'boost control, charge-air and engine lubrication'],
    evidence: ['NTB16-035a is conditional replacement service information, not proof of a failure population.', 'It specifies configuration-dependent feed-tube part numbers.', 'No primary source supports bearing-wear, engine-debris, oil-interval, price or 650-owner claims.'],
    conflict: 'The indexed page converts a conditional service instruction into a seven-year premature-turbo-failure identity with branded product advice.',
    summary: 'Held the unsupported turbocharger-failure identity and removed the fabricated 650-owner total.',
    citations: ['turboServiceBulletin', 'datasets'],
  }),
  [ids.turboOil]: held({
    description: `The frozen citation labels NTB11-065 as a Juke turbocharger oil-leak diagnosis bulletin, but no matching record appears in the complete exact 210-row Juke manufacturer-communication corpus. The exact Nissan turbo bulletin is NTB16-035a, which says to replace the steel oil-feed tube whenever a turbocharger is replaced; it does not establish a loose banjo bolt, failed crush washers, heat-degraded return gasket, exhaust dripping or oil-starvation population across 2011-2017.`,
    solution: `Treat burning-oil odor or smoke near the exhaust as an immediate inspection issue. Clean and trace leakage from its highest wet point, verify oil level and pressure and distinguish the feed tube, return path, turbo housing and adjacent engine seals before repair. Do not buy crush washers, a return gasket, oil-feed tube, turbocharger or oil product from this page; leak origin, turbo configuration, superseded part and VIN fitment must be established first.`,
    symptoms: ['oil source traced from the highest wet point', 'feed, return, turbo-housing and adjacent engine-seal paths separated', 'oil pressure, level and hot-exhaust contamination assessed'],
    systems: ['turbocharger oil-feed tube and fittings', 'turbocharger oil-return path', 'engine lubrication and adjacent exhaust components'],
    evidence: ['No matching NTB11-065 Juke oil-leak record appears in the exact corpus.', 'NTB16-035a only requires feed-tube replacement when the turbo is replaced.', 'No primary source supports the frozen banjo, gasket, interval, idle-time, price or starvation claims.'],
    conflict: 'The indexed page relies on an unverified citation and expands conditional turbo service information into a universal oil-line leak identity.',
    summary: 'Held the false/unverified-citation turbo-oil identity and preserved the exact NTB16-035a service boundary.',
    citations: ['turboServiceBulletin', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  acOringBulletin: {
    title: 'Nissan NTB09-099a - A/C System O-Ring Seal Leaks',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10192805-9999.pdf',
    sha256: 'a763bf0f844e5f69897ebcd402e6c49165840d8781260ff6f255892eb048bb73',
    pageCount: 2,
    visuallyReviewedPages: [1, 2],
  },
  brakeMasterRecall: {
    title: 'NHTSA Part 573 Report 18V086 - Juke NISMO RS Brake Master Cylinder',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V086-8955.PDF',
    sha256: '266977fe8edc88b416d7e90f57b06ed5b4920f695620a808a1a3632427aa7056',
    pageCount: 3,
    visuallyReviewedPages: [1, 2, 3],
  },
  cvtBulletin: {
    title: 'Nissan NTB20-091 - 2015-2017 Juke RE0F10D CVT Diagnostic and Repair Flow',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10185469-0001.pdf',
    sha256: '0d6786af6827be324e93017b975281d222e428c389f718330ad5fc4271589e23',
    pageCount: 100,
    visuallyReviewedPages: [1, 2, 100],
  },
  fuelSensorRecall: {
    title: 'NHTSA Part 573 Report 14V683 - Juke Fuel Pressure Sensor',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/rcl/2014/RCLRPT-14V683-3392.PDF',
    sha256: '9f80b0a8303a9c3bbd2a7474aa275b968c642000dbb3e8537dff49691f3c0450',
    pageCount: 4,
    visuallyReviewedPages: [1, 2, 3, 4],
  },
  startStopRecall: {
    title: 'Nissan NTB15-064a - 15V418/R1511 Engine Stop/Start Switch Recall',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V418-7674.pdf',
    sha256: '17d70392d5da614b738f84dbfcebc474a123c65ca6f5243c246e3779be01ac89',
    pageCount: 20,
    visuallyReviewedPages: [1, 20],
  },
  timingChainCampaign: {
    title: 'Nissan NTB14-030d - 2011-2013 Juke Timing Chain Campaign P4213',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10192723-9999.pdf',
    sha256: 'b88bc79a95af18685047a75e6eec3b0bbc46798eae757dacbacfd2cc011f72b2',
    pageCount: 36,
    visuallyReviewedPages: [1, 2, 3, 36],
  },
  turboServiceBulletin: {
    title: 'Nissan NTB16-035a - 2011-2017 Juke Turbocharger Service',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10109203-9999.pdf',
    sha256: '8cb2ca54a7f97c2bbe95c225f23264fe0f391d8c1c6349aab5fa4af018514f2b',
    pageCount: 1,
    visuallyReviewedPages: [1],
  },
});

function recallApi(campaign, title) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains: campaign });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  recall12V069: recallApi('12V069000', 'NHTSA Recall 12V069000 - Juke Fuel Pressure Sensor'),
  recall14V683: recallApi('14V683000', 'NHTSA Recall 14V683000 - Juke Fuel Pressure Sensor'),
  recall15V418: recallApi('15V418000', 'NHTSA Recall 15V418000 - Juke Engine Stop/Start Switch'),
  recall18V086: recallApi('18V086000', 'NHTSA Recall 18V086000 - Juke NISMO RS Brake Master Cylinder'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Juke', slug: 'juke', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-juke-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['JUKE', 'JUKE NISMO', 'JUKE NISMO RS'],
  searchTerms: ['condenser', 'air conditioning', 'refrigerant', 'CVT', 'transmission', 'shudder', 'judder', 'start/stop', 'stop/start', 'push button', 'fuel pressure sensor', 'fuel leak', 'master cylinder', 'brake booster', 'timing chain', 'chain', 'turbocharger', 'turbo', 'oil feed', 'oil leak'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 21, '2015-2019': 115, '2020-2024': 72, '2025-2026': 2 },
    totalRows: 210,
    relevantRowCount: 37,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 14 },
    totalRows: 14,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The seven exact Juke campaigns concern turbo boost-sensor brackets, fuel-pressure sensors, rear-seat latches, stop/start switches, NISMO RS master cylinders and ignition-button software. Only 12V069/14V683, 15V418 and 18V086 match frozen identities.',
  },
  content,
  requiredProse: [
    { id: ids.condenser, field: 'description', patterns: ['NTB09-099a', 'not to replace a pipe, hose or other component'] },
    { id: ids.cvt, field: 'description', patterns: ['2015-2017 Juke F15', 'RE0F10D', 'does not establish the frozen 2011-2017'] },
    { id: ids.startStop, field: 'solution', patterns: ['removes the rib', 'installs the specified foam seal', 'not a universal push-button replacement'] },
    { id: ids.fuelSensor, field: 'description', patterns: ['12V069 and 14V683', 'gradually from heat and vibration'] },
    { id: ids.brakeMaster, field: 'description', patterns: ['415 potentially affected', '2015-2017 Juke NISMO RS', 'July 6, 2015 through January 30, 2017'] },
    { id: ids.timingChain, field: 'description', patterns: ['certain specific 2011-2013', 'no longer active', 'does not extend the population through 2017'] },
    { id: ids.turboFailure, field: 'description', patterns: ['replaced for any reason', 'does not establish premature turbocharger failure'] },
    { id: ids.turboOil, field: 'description', patterns: ['NTB11-065', 'no matching record appears', 'NTB16-035a'] },
  ],
  observations: [
    { code: 'three-recall-identities-retained-five-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only exact fuel-sensor, stop/start-switch and NISMO RS master-cylinder recall identities are retained; five materially overbroad identities remain published but blocked pending identity policy.' },
    { code: 'cvt-transmission-and-years-corrected', severity: 'technical-accuracy', recordIds: [ids.cvt], detail: 'NTB20-091 is a 2015-2017 non-NISMO-RS RE0F10D flow, not proof of a universal 2011-2017 JF015E torque-capacity failure.' },
    { code: 'timing-campaign-bounded-and-inactive', severity: 'technical-accuracy', recordIds: [ids.timingChain], detail: 'P4213 is limited to certain 2011-2013 vehicles and is no longer active for current repair orders.' },
    { code: 'turbo-oil-false-citation-held', severity: 'source-integrity', recordIds: [ids.turboOil], detail: 'The frozen NTB11-065 oil-leak citation is absent from the exact corpus; NTB16-035a only governs feed-tube replacement when a turbo is replaced.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 1,610 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-juke-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Juke page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
