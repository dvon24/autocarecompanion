/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  all4Coupling: 'mini-paceman-all4-coupling-failure-2013',
  all4Timing: 'mini-paceman-awd-coupling-2013',
  hpfp: 'mini-paceman-high-pressure-fuel-pump-2013',
  transferCaseActuator: 'mini-paceman-transfer-case-2013',
  valveCover: 'mini-paceman-valve-cover-gasket-2013',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([]);
const campaigns = Object.freeze([]);
const pdfSources = Object.freeze({
  pacemanTechnical: {
    title: 'BMW Group U.S. Technical Data - MINI Paceman (R61), Edition 03/2013',
    type: 'manufacturer',
    url: 'https://www.press.bmwgroup.com/usa/article/attachment/T0136098EN_US/214104',
    sha256: '23fe4678c7b3d9aaf38b370ddd6682a885d601eab72839d4596308d4adb442ba',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
  pacemanAll4: {
    title: 'MINI U.S. Press Information - 2015 MINI Paceman and ALL4 Architecture',
    type: 'manufacturer',
    url: 'https://www.press.bmwgroup.com/usa/article/attachment/T0178108EN_US/263758',
    sha256: '478f68e021d713fc9a4245f809f63d2a92c97600999a5deb7a31d09799816e12',
    pageCount: 6,
    visuallyReviewedPages: [1, 3, 4],
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
});
const datasets = Object.freeze({ title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL });

const content = Object.freeze({
  [ids.all4Coupling]: {
    description: `BMW Group describes Paceman ALL4 as a MINI-developed system using an electromagnetic center differential, with control integrated into DSC to vary drive between the axles. The source does not identify a Haldex-branded unit or establish recurring coupling overheating, fluid degradation, forced front-wheel-drive fallback or failure during snow, mud or spirited driving. The reviewed Paceman manufacturer-communication corpus contains no exact coupling-overheat evidence or owner-frequency record.`,
    solution: `Record the exact DSC/ALL4 warnings and freeze-frame data, verify tire size and circumference at all four wheels, and test battery voltage, wheel-speed inputs, wiring and commanded front/rear torque response. Inspect the power take-off, propeller shaft, center coupling and rear final drive for an actual leak, noise or mechanical fault under the VIN-specific MINI test plan. Do not buy Haldex fluid, a coupling unit, pump or a 30,000-mile service from this page; the installed component, fluid specification, measured failure and VIN fitment must be proven first.`,
    symptoms: ['exact DSC/ALL4 warning and faults recorded', 'tire circumference, voltage and wheel-speed inputs verified', 'power take-off, shaft, coupling and rear-drive paths separated'],
    affectedSystems: ['Paceman electromagnetic ALL4 center differential', 'DSC inputs and ALL4 electronic control', 'power take-off, propeller shaft and rear final drive'],
    evidence: ['BMW Group identifies an electromagnetic center differential integrated with DSC.', 'The manufacturer source does not identify the system as Haldex or prescribe the frozen fluid interval.', 'No exact Paceman communication in the reviewed corpus establishes recurring coupling overheating or failure.'],
    conflict: 'The indexed page turns an architecture description into a branded coupling-overheat defect with an unsupported maintenance schedule.',
    summary: 'Held the ALL4 coupling identity and required exact control, tire, electrical, leak and mechanical proof before service or parts.',
    citations: ['pacemanTechnical', 'pacemanAll4', 'datasets'],
  },
  [ids.all4Timing]: {
    description: `This indexed page combines two unrelated identities. BMW Group's U.S. Paceman sheet lists N16 and N18 engine variants, not N14, and describes ALL4 hardware without a recurring coupling-wear finding. The detailed N14 timing service action applies to R55/R56/R57 vehicles produced through May 2009 and does not include the R61 Paceman introduced for 2013. No reviewed source supports transferring Countryman coupling claims or older N14 timing evidence to the 2013-2016 Paceman.`,
    solution: `Diagnose an ALL4 complaint through DSC/ALL4 faults, wheel-speed and tire checks, commanded torque response, wiring and direct inspection of the power take-off, shaft, center coupling and rear drive. Diagnose engine noise separately by identifying N16 or N18, recording cam/crank faults, oil pressure and measured timing deviation. Do not buy Haldex service, a pump, coupling assembly, timing kit, VANOS component or combined repair from this page; each failed system and VIN-specific repair scope must be proven independently.`,
    symptoms: ['Paceman N16 or N18 engine verified', 'ALL4 complaint and control data captured separately', 'engine timing measurements separated from driveline diagnosis'],
    affectedSystems: ['Paceman ALL4 control and driveline', 'N16 or N18 engine timing system', 'DSC inputs, lubrication and cam/crank correlation'],
    evidence: ['The exact U.S. Paceman sheet identifies N16/N18 variants and excludes the frozen N14 assignment.', 'The N14 timing action covers R55/R56/R57 through May 2009, not R61.', 'The Paceman source establishes ALL4 architecture but no recurring coupling-wear identity.'],
    conflict: 'The indexed page merges an unsupported ALL4 wear claim with inapplicable N14 timing evidence under one URL.',
    summary: 'Held the mixed coupling/timing identity and separated drivetrain diagnosis from the correct Paceman engine generation.',
    citations: ['pacemanTechnical', 'pacemanAll4', 'n14Timing', 'datasets'],
  },
  [ids.hpfp]: {
    description: `BMW Group's U.S. Paceman sheet identifies N16 and N18 variants for the 2013 launch. MINI's N18 high-pressure-fuel-pump extension is limited to eligible 2011-2012 vehicles produced through February 2012, before the Paceman's March 2013 U.S. launch. It therefore does not establish recurring 2013-2016 Paceman HPFP failure, sudden no-warning stalling, cam-follower wear or a preventive 50,000-mile follower inspection.`,
    solution: `Verify the engine and production date, then capture commanded and actual low- and high-side fuel pressure with manufacturer faults during the complaint. Test the low-pressure supply, pump command, rail-pressure sensor, wiring, injectors and fuel quality before condemning a pump. Do not buy a high-pressure pump, cam follower or preventive service from this page; the failed pressure stage, installed pump design and VIN-specific supersession must be proven first.`,
    symptoms: ['N16 or N18 engine and production date verified', 'low- and high-side fuel pressure measured', 'pump, supply, sensor, wiring and injector paths separated'],
    affectedSystems: ['engine-specific high-pressure fuel pump', 'low-pressure fuel supply and pump control', 'rail-pressure sensing, injectors and DME diagnosis'],
    evidence: ['The exact Paceman technical sheet identifies N16/N18 configurations.', 'SI M01 01 16 ends with vehicles produced through February 2012, before Paceman launch.', 'The frozen owner count, cam-follower mechanism and preventive interval have no exact Paceman source.'],
    conflict: 'The indexed page transfers a pre-Paceman N18 warranty population and an unsupported wear mechanism to every 2013-2016 Paceman.',
    summary: 'Held the Paceman HPFP identity and required exact pressure, engine and production proof before replacement.',
    citations: ['pacemanTechnical', 'n18Hpfp', 'datasets'],
  },
  [ids.transferCaseActuator]: {
    description: `BMW Group describes the Paceman ALL4 system as an electromagnetic center differential whose control electronics are integrated directly into DSC. The reviewed primary and Paceman communication sources do not identify the frozen separate transfer-case actuator motor, establish exposure-driven failure, or support automatic replacement of an actuator or entire transfer case. A front-wheel-drive operating state by itself is not proof of a failed actuator.`,
    solution: `Capture the exact DSC/ALL4 faults and commanded-versus-actual torque response. Verify battery and charging voltage, wheel-speed inputs, tire circumference, wiring, connectors and module communication, then inspect the power take-off, propeller shaft, center coupling and rear drive for a confirmed electrical, hydraulic or mechanical fault. Do not buy an actuator motor, transfer case, coupling or clutch pack from this page; the actual installed component and failed path must be proven under the VIN-specific MINI test plan.`,
    symptoms: ['exact DSC/ALL4 faults and operating state recorded', 'voltage, wheel-speed, tire and network inputs verified', 'center differential, power take-off, shaft and rear drive inspected'],
    affectedSystems: ['electromagnetic ALL4 center differential', 'DSC-integrated ALL4 electronic control', 'power take-off, shaft and rear final drive'],
    evidence: ['BMW Group identifies DSC-integrated electromagnetic center-differential control.', 'No exact reviewed Paceman source identifies the alleged separate transfer-case actuator motor.', 'The frozen 140-owner total, moisture mechanism and replacement path lack auditable evidence.'],
    conflict: 'The indexed page assigns broad AWD warnings to an unverified actuator component and replacement path.',
    summary: 'Held the actuator-motor identity and required architecture-correct electrical and mechanical diagnosis before parts.',
    citations: ['pacemanTechnical', 'pacemanAll4', 'datasets'],
  },
  [ids.valveCover]: {
    description: `BMW Group's U.S. technical data confirms N18 Paceman S/ALL4/JCW variants and N16 Cooper variants. The reviewed Paceman manufacturer corpus does not establish recurring valve-cover-gasket leakage, heat-warped plastic covers, integrated-PCV failure or a shared 2013-2016 mechanism. Oil on the exhaust side, rough idle and crankcase pressure have multiple possible sources and do not identify the gasket or cover without inspection and measurement.`,
    solution: `Identify N16 or N18 and clean the suspect area, then use dye or repeated inspection to locate the highest fresh-oil point. Measure crankcase pressure and test the ventilation path while separating the cover perimeter, fasteners, oil cap, vacuum pump, turbo oil plumbing, timing cover and other nearby seals. Do not buy a gasket, complete valve cover, PCV part or apply a generic 9 Nm torque from this page; the leaking component, cover condition, engine-specific procedure and VIN parts must be proven first.`,
    symptoms: ['N16 or N18 engine verified', 'highest fresh-oil source documented after cleaning', 'crankcase pressure and adjacent leak paths tested'],
    affectedSystems: ['engine-specific cylinder-head cover and gasket', 'crankcase ventilation and pressure control', 'adjacent vacuum, timing-cover and turbo oil paths'],
    evidence: ['The exact technical sheet identifies distinct N16 and N18 Paceman configurations.', 'No exact Paceman communication in the reviewed corpus establishes a recurring cover or gasket failure.', 'The frozen warping, integrated-PCV causation, torque and updated-gasket claims lack auditable primary evidence.'],
    conflict: 'The indexed page assigns multiple oil and drivability symptoms to one recurring cover/gasket mechanism without exact Paceman evidence.',
    summary: 'Held the valve-cover identity and required engine-specific leak localization and crankcase-pressure diagnosis before parts.',
    citations: ['pacemanTechnical', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'Paceman', slug: 'paceman', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-paceman-adjudication-2026-08-10.json',
  ids, allIds, retainedIds: [],
  reportCountCleanupIds: [ids.hpfp, ids.transferCaseActuator].sort(),
  modelAliases: ['PACEMAN', 'COOPER PACEMAN', 'COOPER S PACEMAN', 'JOHN COOPER WORKS PACEMAN', 'JCW PACEMAN'],
  searchTerms: ['ALL4', 'all wheel drive', 'coupling', 'center differential', 'transfer case', 'actuator motor', 'rear axle', 'rear differential', 'timing chain', 'chain tensioner', 'high pressure fuel pump', 'fuel pressure', 'valve cover', 'cylinder head cover', 'oil leak', 'crankcase ventilation'],
  relevantDocumentIds, campaigns, pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 2, '2020-2024': 6, '2025-2026': 3 },
    totalRows: 11,
    relevantRowCount: 0,
    uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 0 },
    totalRows: 0,
    campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The exact Paceman model rows contain no matching communication or recall for the five frozen identities and no auditable owner-frequency population.',
  },
  content,
  requiredProse: [
    { id: ids.all4Coupling, field: 'description', patterns: ['electromagnetic center differential', 'does not identify a Haldex-branded unit'] },
    { id: ids.all4Timing, field: 'description', patterns: ['lists N16 and N18 engine variants, not N14', 'does not include the R61 Paceman'] },
    { id: ids.hpfp, field: 'description', patterns: ['produced through February 2012', "before the Paceman's March 2013 U.S. launch"] },
    { id: ids.transferCaseActuator, field: 'description', patterns: ['integrated directly into DSC', 'do not identify the frozen separate transfer-case actuator motor'] },
    { id: ids.valveCover, field: 'description', patterns: ['does not establish recurring valve-cover-gasket leakage', 'multiple possible sources'] },
  ],
  observations: [
    { code: 'all-paceman-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All five indexed identities exceed exact R61 component, engine, production-window or defect evidence.' },
    { code: 'haldex-and-actuator-assumptions-blocked', severity: 'technical-accuracy', recordIds: [ids.all4Coupling, ids.all4Timing, ids.transferCaseActuator].sort(), detail: 'BMW identifies an electromagnetic center differential; the frozen Haldex branding and actuator-motor identity are not transferred without exact evidence.' },
    { code: 'n14-not-assigned-to-paceman', severity: 'engine-scope', recordIds: [ids.all4Timing], detail: 'The exact Paceman sheet identifies N16/N18 variants and the older N14 timing action excludes R61.' },
    { code: 'pre-paceman-hpfp-program-not-transferred', severity: 'production-scope', recordIds: [ids.hpfp], detail: 'The N18 HPFP extension ends before Paceman U.S. launch and is not used as Paceman failure proof.' },
    { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: [ids.hpfp, ids.transferCaseActuator].sort(), detail: 'Two nonzero owner totals lack auditable report records and are proposed as unknown zero.' },
    { code: 'all-paceman-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Paceman page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
