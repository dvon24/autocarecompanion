/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  clutchDmf: 'mini-all-clutch-failure-2007',
  carbon: 'mini-cooper-s-carbon-buildup-2007',
  hpfp: 'mini-cooper-s-hpfp-2007',
  timing: 'mini-cooper-s-timing-chain-2007',
  turboOil: 'mini-cooper-s-turbo-oil-line-2007',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([
  '10025903', '10026767', '10041389', '10046760', '10057380', '10057570',
  '10058480', '10058544', '10059110', '10059112', '10135055', '10146720',
  '10146800', '10146867', '10146870', '10146924', '10146973', '10146975',
  '10146985', '10147160', '10147220', '10147224', '10147574', '10147698',
  '10147739', '10147741', '10147842', '10147907', '10147908', '10147957',
  '10148148', '10148206', '10148348', '10149394', '10150145', '10150202',
  '10150303', '10150396', '10151046', '10151149', '10151150', '10151221',
  '10151226', '10151287', '10152360', '10162441', '10171506', '10177636',
  '10215019', '10216755', '10216759', '10216760',
]);
const campaigns = Object.freeze([
  '03V086000', '04V348000', '07V533000', '08V657000', '09V474000',
  '11V299000', '12V008000', '14V789000', '15V205000', '15V450000',
  '15V628000', '15V660000', '15V739000', '16V747000', '16V914000',
  '17V222000', '18V248000', '18V465000', '19V634000', '20V283000',
  '21V554000', '23V337000', '24V104000', '24V697000', '26V422000',
]);
const pdfSources = Object.freeze({
  clutchInspection: {
    title: 'MINI SI M21 01 13 - Clutch Is Slipping or Grabbing',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10150145-9999.pdf',
    sha256: '22cf0a1289399b5ec529b4142ce09155e82df385c0760d834f67b773557c3a3c',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
  dmfInspection: {
    title: 'MINI SI M21 01 14 - Dual Mass Flywheel Diagnosis and Inspection',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10148206-9999.pdf',
    sha256: 'edc035a969e4feb15b588a93b837d881aeb48c263288a7ff50ee7a365deb358f',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
  n14MisfireCarbon: {
    title: 'MINI SI M12 02 10 - Cooper S with N14 Diagnosis for Misfire Faults',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10034867-5414.pdf',
    sha256: 'a8c80b46357408a2848780194e0c8ff7ae86c7dfb0af39b9737b906056241e31',
    pageCount: 8,
    visuallyReviewedPages: [1, 4],
  },
  n14Hpfp: {
    title: 'MINI SIM 01 04 19 - N14 High-Pressure Fuel Pump Service Benefit',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10171506-9999.pdf',
    sha256: '7e6c8846f2c5225f1093cd1f84ee38428d9fa7543810458fb634fb77e31b1808',
    pageCount: 17,
    visuallyReviewedPages: [1],
  },
  n18Hpfp: {
    title: 'MINI SI M01 01 16 - N18 High-Pressure Fuel Pump Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10146720-9999.pdf',
    sha256: '0ae90a7f491c88a0c13cacf56d066956c66df3b2a8b7f08c9d6c14ffa9542ab2',
    pageCount: 4,
    visuallyReviewedPages: [1],
  },
  n14Timing: {
    title: 'MINI SI M11 04 13 - N14 Engine Check Timing Chain Tensioner and Timing Chain',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10054635-2047.pdf',
    sha256: 'ba7a8c1e8fbd049b24f3d6193c0b10053dac343bdf9d122cb2bef43e43f69c49',
    pageCount: 8,
    visuallyReviewedPages: [1, 4],
  },
  n14TurboOilShield: {
    title: 'MINI SI M11 05 13 - N14 Turbocharger Oil Supply Line Heat Shield',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10150303-9999.pdf',
    sha256: '4cd88f6409966de2c02857de63685d92c0735dd1fa11eb6ae9a788a9d95889f6',
    pageCount: 5,
    visuallyReviewedPages: [1],
  },
  n18TurboWarranty: {
    title: 'MINI SI M01 01 18 - N18 Turbocharger Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10135055-9999.pdf',
    sha256: '06506728cd84cd7b3fa386ac513c14160d39fabded72b53f9ff623a3f0594d0c',
    pageCount: 8,
    visuallyReviewedPages: [1],
  },
});
const datasets = Object.freeze({ title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL });

const content = Object.freeze({
  [ids.clutchDmf]: {
    description: `MINI SI M21 01 13 documents slipping or grabbing on N14- and N18-equipped manual-transmission chassis and requires pedal, hydraulic, release, wear and leak checks before clutch replacement. SI M21 01 14 supplies measured dual-mass-flywheel rejection limits. Neither source establishes recurring premature clutch and flywheel failure before 60,000 miles, turbo-torque causation or the frozen 2007-2020 population.`,
    solution: `Confirm the vehicle has a manual transmission and record its chassis and engine. Verify unrestricted clutch-pedal travel, hydraulic operation and full release, then inspect for engine, transmission or hydraulic-fluid leaks before measuring clutch wear. Replace a dual-mass flywheel only after documenting rotational free play, axial play or thermal damage against the engine-specific MINI limits. Do not buy LuK 600032500, Valeo 52401225, an Exedy kit or a single-mass conversion from this page; the failed component, installed transmission and VIN-specific parts must be proven first.`,
    symptoms: ['manual transmission and complaint reproduced', 'pedal travel, hydraulics, release and leak sources checked', 'clutch wear and dual-mass-flywheel limits measured separately'],
    affectedSystems: ['manual clutch disc, pressure plate and release system', 'clutch hydraulics and pedal travel', 'engine-specific dual-mass flywheel'],
    evidence: ['SI M21 01 13 makes clutch replacement conditional on operation, hydraulics, leaks and wear inspection.', 'SI M21 01 14 requires measured engine-specific flywheel criteria before replacement.', 'The frozen 2,000-owner count, before-60,000-mile frequency and turbo-torque mechanism have no auditable source.'],
    conflict: 'The indexed page converts complaint-driven clutch and flywheel inspections into one recurring premature-failure identity across incompatible generations.',
    summary: 'Held the combined clutch/flywheel identity, removed invented social proof and required measured clutch and DMF diagnosis before parts.',
    citations: ['clutchInspection', 'dmfInspection', 'datasets'],
  },
  [ids.carbon]: {
    description: `MINI SI M12 02 10 documents an N14 misfire diagnostic path for R55, R56 and R57. Intake-valve carbon is one possible cause after fuel-pressure, ignition, VANOS, air-path, crankcase-pressure, timing and other checks; inspection and cleaning are conditional. The source does not establish that every N14, N18, B46 or B48 accumulates actionable deposits, or a universal 40,000-60,000-mile walnut-blasting interval through 2025.`,
    solution: `Record chassis, engine, mileage, driving pattern, warning-lamp state and manufacturer misfire faults. Follow the MINI misfire test plan, including fuel pressure, ignition, VANOS, intake leaks, crankcase pressure and timing checks. On an applicable N14, remove the intake manifold and compare deposits with the manufacturer chart only after earlier causes are excluded; clean only when the documented threshold is met. Do not buy an oil catch can, CRC 05319, BlueDriver, oil bundle or walnut-blasting service from this page; engine applicability, the actual cause and an inspected deposit level must be proven first.`,
    symptoms: ['engine and MINI misfire faults recorded', 'fuel, ignition, VANOS, air-path and mechanical causes tested first', 'intake valves visually scored before any carbon cleaning'],
    affectedSystems: ['N14 intake valves and ports', 'fuel-pressure and injection system', 'ignition, VANOS, intake and crankcase ventilation'],
    evidence: ['SI M12 02 10 applies to N14 R55/R56/R57 misfire diagnosis, not every frozen engine and year.', 'The bulletin describes carbon as one possible cause and requires a staged test plan before inspection or cleaning.', 'The frozen 3,500-owner count, universal mechanism, catch-can advice and 40,000-60,000-mile interval are not established.'],
    conflict: 'The indexed all-engine carbon identity extends an N14 conditional misfire procedure to N18, B46 and B48 without exact proof.',
    summary: 'Held the all-engine carbon identity, removed invented social proof and made cleaning conditional on N14 fault-guided inspection.',
    citations: ['n14MisfireCarbon', 'datasets'],
  },
  [ids.hpfp]: {
    description: `MINI manufacturer records support high-pressure-fuel-pump coverage for narrow populations: certain 2010 N14 Cooper S Hardtops under a class-action service benefit and specific 2011-2012 N18 Cooper S vehicles produced through February 2012. They do not establish the frozen 2007-2012 N14-only population, an N54-equivalent defect, internal cam-follower wear or the generic pressure thresholds and fault list on this page.`,
    solution: `Identify the chassis, engine, model year, production date and VIN coverage before repair. Read MINI-specific fuel-pressure and related DME faults, capture commanded and actual rail pressure under the applicable test plan, and complete diagnosis before condemning the pump. Use the VIN in DCSnet and ETK/EPC to select a replacement only after a confirmed failure. Do not buy pump 13517588879, Autotech 10.127.220K, follower 11318524416, a Delphi module or a Bosch pump from this page; the N14 and N18 populations, pump designs and VIN fitment cannot be interchanged.`,
    symptoms: ['chassis, engine, production date and warranty eligibility recorded', 'manufacturer fuel-pressure test plan completed', 'high-pressure pump separated from low-pressure supply and control faults'],
    affectedSystems: ['engine high-pressure fuel pump', 'low-pressure supply and pump control', 'fuel rail pressure sensing and DME diagnosis'],
    evidence: ['SIM 01 04 19 identifies only specific N14 class vehicles, including 2010 Cooper S Hardtop.', 'SI M01 01 16 identifies bounded 2011-2012 N18 vehicles and requires VIN-specific parts for confirmed failures.', 'Neither source attributes failure to the frozen cam-follower mechanism or supports the 1,800-owner total.'],
    conflict: 'The indexed N14-only 2007-2012 identity mixes distinct N14 and N18 coverage populations and an unsupported internal-wear mechanism.',
    summary: 'Held the HPFP identity, removed invented social proof and separated N14/N18 eligibility, diagnosis and VIN-specific parts.',
    citations: ['n14Hpfp', 'n18Hpfp', 'datasets'],
  },
  [ids.timing]: {
    description: `MINI SI M11 04 13 establishes a service action for certain R55, R56 and R57 vehicles with the N14 engine produced from November 2006 through May 2009. It requires tensioner identification and a calibrated chain measurement before deciding between no repair, tensioner replacement or the repair kit. The reviewed evidence does not establish the frozen N18 2011-2013 mechanism, universal catastrophic failure or proactive 50,000- and 80,000-mile replacement intervals.`,
    solution: `Verify the engine, chassis, production date and open service-action status. Record cold-start and hot-idle noise, oil level and pressure, and camshaft/crankshaft correlation. For an applicable N14, identify the installed tensioner and use the MINI special-tool measurement; replace only the components directed by the measured result and inspect the oil pan for guide fragments when required. Do not buy BGA TC0380FK, Febi 47060, a Cloyes kit, VANOS gears or an oil-pump chain from this page; the service action is VIN- and measurement-specific and does not prove the frozen N18 scope.`,
    symptoms: ['engine, chassis and production date verified', 'service-action status and installed tensioner identified', 'chain measurement and evidence of guide damage documented'],
    affectedSystems: ['N14 timing chain and tensioner', 'guide, tensioner and sliding rails', 'crankshaft sprocket and lubrication path'],
    evidence: ['SI M11 04 13 is limited to certain N14 R55/R56/R57 vehicles produced 11/2006-05/2009.', 'The bulletin requires tensioner identification and a 68 mm measurement before selecting repair scope.', 'The frozen 4,500-owner count, N18 continuation and proactive mileage intervals have no exact audited source.'],
    conflict: 'The indexed N14/N18 catastrophic-failure identity is materially broader than the bounded, measurement-driven N14 service action.',
    summary: 'Held the N14/N18 timing identity, removed invented social proof and required VIN and measurement gates before repair or parts.',
    citations: ['n14Timing', 'datasets'],
  },
  [ids.turboOil]: {
    description: `MINI SI M11 05 13 establishes an N14 service action for certain R55, R56 and R57 vehicles produced from November 2006 through December 2009: heat can solidify oil in the turbocharger supply line, so a larger heat shield is fitted to prevent restriction and bearing damage. A separate N18 bulletin covers bounded turbocharger defects. These sources do not establish recurring feed-and-return-line leaks, banjo-joint leakage or the frozen 2007-2013 combined mechanism.`,
    solution: `Identify the chassis, engine, production date and VIN action or warranty eligibility. On an applicable N14, check service-action code 62 and verify that the correct supply-line heat shield is installed. For noise, smoke, low boost or oil loss, locate the actual leak, check oil supply restriction and pressure, inspect the return path and turbocharger shaft condition, and follow the engine-specific test plan. Do not buy feed line 11427603646, banjo bolt 11427558936, turbo 11657600890, a BorgWarner KP39, Dorman gasket kit or boost gauge from this page; the failed line or turbo and VIN fitment must be proven first.`,
    symptoms: ['engine, production date and service-action status recorded', 'oil leak location separated from supply restriction', 'boost, oil pressure and turbocharger condition tested'],
    affectedSystems: ['turbocharger oil supply line and heat shield', 'turbocharger oil return and engine lubrication', 'N14 or N18 turbocharger assembly'],
    evidence: ['SI M11 05 13 identifies a bounded N14 supply-line heat condition and installs a shield rather than replacing both lines.', 'SI M01 01 18 covers turbocharger defects only on specific N18 vehicles and requires VIN eligibility.', 'The frozen 2,100-owner count, return-line coking, banjo-leak and universal replacement advice are not established.'],
    conflict: 'The indexed page combines a bounded N14 oil-supply heat action, unproven feed/return leaks and an N18 turbo population under one identity.',
    summary: 'Held the combined turbo-oil-line identity, removed invented social proof and separated N14 heat-shield, leak and turbo diagnosis.',
    citations: ['n14TurboOilShield', 'n18TurboWarranty', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'Cooper S', slug: 'cooper-s', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-cooper-s-adjudication-2026-08-10.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds: allIds,
  modelAliases: ['COOPER S', 'MINI COOPER S', 'COOPER S HARDTOP', 'COOPER S CLUBMAN', 'COOPER S CONVERTIBLE', 'COOPER S COUNTRYMAN'],
  searchTerms: ['timing chain', 'chain tensioner', 'high pressure fuel pump', 'fuel pump', 'turbocharger', 'turbo oil', 'oil feed', 'oil return', 'carbon buildup', 'intake valve', 'clutch', 'flywheel', 'dual mass flywheel'],
  relevantDocumentIds, campaigns, pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 9, '2005-2009': 25, '2010-2014': 107, '2015-2019': 890, '2020-2024': 162, '2025-2026': 26 },
    totalRows: 1219, relevantRowCount: 99, uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 6, post: 100 }, totalRows: 106, campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Twenty-five federal campaigns exist in the Cooper S alias set, but none establishes one of the five frozen model-wide identities or an owner-frequency rate.',
  },
  content,
  requiredProse: [
    { id: ids.clutchDmf, field: 'solution', patterns: ['dual-mass flywheel only after documenting', 'Do not buy LuK'] },
    { id: ids.carbon, field: 'description', patterns: ['one possible cause', 'does not establish that every N14, N18, B46 or B48'] },
    { id: ids.hpfp, field: 'description', patterns: ['certain 2010 N14', 'specific 2011-2012 N18'] },
    { id: ids.timing, field: 'description', patterns: ['November 2006 through May 2009', 'does not establish the frozen N18'] },
    { id: ids.turboOil, field: 'description', patterns: ['larger heat shield', 'do not establish recurring feed-and-return-line leaks'] },
  ],
  observations: [
    { code: 'all-cooper-s-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All five indexed identities exceed exact engine, chassis, production-window, mechanism or diagnostic evidence.' },
    { code: 'conditional-replacement-paths-preserved', severity: 'repair-safety', recordIds: [ids.clutchDmf, ids.carbon, ids.hpfp, ids.timing, ids.turboOil], detail: 'Manufacturer inspection and test gates replace automatic part or service recommendations.' },
    { code: 'n14-n18-scope-transfer-blocked', severity: 'engine-scope', recordIds: [ids.carbon, ids.hpfp, ids.timing, ids.turboOil], detail: 'Evidence for one engine or bounded population is not transferred to another.' },
    { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: allIds, detail: 'All five nonzero owner totals lack auditable reports and are proposed as unknown zero.' },
    { code: 'all-cooper-s-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Cooper S page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
