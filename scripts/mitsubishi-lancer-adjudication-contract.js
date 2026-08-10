/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  cvtFailure: 'mitsubishi-lancer-cvt-failure',
  aycPump: 'mitsubishi-lancer-evo-ayc-pump',
  acdTransfer: 'mitsubishi-lancer-evo-transfer-case',
  timingChain: 'mitsubishi-lancer-timing-chain',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze([
  '10002719', '10004448', '10035144', '10039589', '10098877', '10098878',
  '10109105', '10117841', '10152871', '10159648', '10159667', '10170691',
  '10172184', '10172186', '10173215', '10175777', '10208827', '10231411',
  '10235611', '10250860', '10252683', '10252691',
]);
const campaigns = Object.freeze([
  '04V138000', '04V428000', '05V335000', '06E023000', '06E038000',
  '06E064000', '09E025000', '09V077000', '09V349000', '09V435000',
  '13V446000', '14V281000', '14V562000', '15V232000', '15V233000',
  '15V546000', '16V334000', '16V458000', '16V563000', '17V569000',
  '17V609000', '18V069000', '18V071000', '18V220000', '20V279000',
]);
const pdfSources = Object.freeze({
  cvtBearingNoise: {
    title: 'Mitsubishi TSB-15-23-003 - Noise From CVT at All Engine Speeds',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10098878-0335.pdf',
    sha256: '43b40bff8da2e912ed7f82b4536ed8e75a7e3113b44fe879b5fb3a4902322b88',
    pageCount: 41,
    visuallyReviewedPages: [1, 2, 40, 41],
  },
  cvtShudder: {
    title: 'Mitsubishi TSB-20-23-001 - CVT-8 Shudder or Surge',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10175777-9999.pdf',
    sha256: '993418f2079de366ae6f021394dd363d3ec33f3e6ffa56c3cccdc926429183ae',
    pageCount: 21,
    visuallyReviewedPages: [1, 4, 19],
  },
  timingChain: {
    title: 'Mitsubishi TSB-12-13-006 - P0012 and Timing-Chain Elongation Check',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/MC-10170691-0001.pdf',
    sha256: '905ae4a53eb23f8e1148c3ab7c1ecff3916042b25f62f3678583925966cd028b',
    pageCount: 12,
    visuallyReviewedPages: [1, 2, 12],
  },
});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
  cvtRecall2016: {
    title: 'NHTSA Recall 16V563000 - 2016 Lancer CVT Acceleration Delay',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=16V563000',
    contains: '16V563000',
  },
});

const content = Object.freeze({
  [ids.cvtFailure]: {
    description: `Mitsubishi TSB-15-23-003 documents a vehicle-speed-related clicking with whining or humming on certain 2008-2010 Lancer CVTs built before October 1, 2010. Its repair distinguishes normal magnet accumulation, which leads to three pulley-shaft bearings, from foreign material, which leads to CVT replacement. TSB-20-23-001 separately documents a customer-complaint shudder or surge diagnostic path on 2016-2017 Lancer CVT-8 vehicles, and recall 16V563000 addresses a 2016 software-related acceleration delay. These narrow conditions do not establish universal 2008-2017 belt-and-pulley wear, an 80,000-120,000-mile failure range or inevitable complete transmission failure.`,
    solution: `Identify the installed CVT, build date, recall and software history and exact complaint. For vehicle-speed-related clicking or whine, inspect the oil-pan magnets and debris exactly as TSB-15-23-003 directs; for shudder or surge, follow the customer-complaint test drive, drive-data and Techline sequence in TSB-20-23-001. Check 16V563000 completion on a 2016 vehicle. Do not buy fluid, pulley bearings, a valve body, belt-and-pulley assembly or remanufactured CVT from this page; the exact bulletin population, debris state, diagnostic result and failed component must be proven first.`,
    symptoms: ['CVT identity, build date and recall history verified', 'noise, shudder, surge or acceleration delay reproduced separately', 'oil-pan debris and drive-data findings documented'],
    affectedSystems: ['CVT primary and secondary pulley bearings', 'CVT-8 hydraulic pressure and belt system', 'CVT control software and acceleration response'],
    evidence: ['TSB-15-23-003 supports a specific 2008-2010 pulley-bearing noise and debris-dependent repair.', 'TSB-20-23-001 supports a complaint-driven 2016-2017 CVT-8 shudder/surge path.', '16V563000 supports a 2016 software delay, not universal mechanical failure or the frozen mileage range.'],
    conflict: 'The indexed complete-failure identity combines three distinct, bounded conditions and extends them across ten model years with an unsupported mileage range.',
    summary: 'Held the overbroad CVT-failure identity and separated bearing noise, CVT-8 shudder and software-delay diagnostic paths.',
    citations: ['cvtBearingNoise', 'cvtShudder', 'cvtRecall2016', 'datasets'],
  },
  [ids.aycPump]: {
    description: `The reviewed 485-row exact Lancer and Lancer Evolution manufacturer-communication corpus contains no record establishing recurring Active Yaw Control hydraulic-pump motor burnout, stripped internal gears or one 2003-2015 failure population. The exact recall corpus likewise contains no AYC-pump campaign. Warning lamps and loss of torque-vectoring function can arise from power, ground, wiring, pressure, hydraulic leakage, fluid, pump, valve or differential-control faults and do not by themselves prove the frozen pump mechanism.`,
    solution: `Identify the exact Evolution generation and installed AYC/ACD hydraulic system. Preserve codes and freeze-frame data, check battery and charging voltage, fuses, relay, pump power and ground, wiring and connectors, fluid level and condition, leakage, commanded operation and measured pressure before assigning the pump. Do not buy a pump motor, complete hydraulic unit, relay, fluid, differential or mechanical-LSD conversion from this page; the failed electrical, hydraulic or mechanical path and road-legal repair must be proven first.`,
    symptoms: ['Evolution generation and AYC equipment verified', 'codes, power, ground and command captured', 'fluid, leakage, pressure, pump and differential paths separated'],
    affectedSystems: ['AYC hydraulic pump and motor', 'AYC power, relay, wiring and control', 'rear differential hydraulic pressure and torque control'],
    evidence: ['No exact Lancer/Lancer Evolution communication identifies recurring AYC-pump failure.', 'No exact recall establishes the frozen pump-motor or gear mechanism.', 'A warning lamp or disabled function does not identify the failed electrical or hydraulic component.'],
    conflict: 'The indexed AYC-pump identity and 2003-2015 population lack exact manufacturer or federal defect evidence.',
    summary: 'Held the AYC-pump identity and required generation-specific electrical, hydraulic and pressure diagnosis before parts or conversion.',
    citations: ['datasets'],
  },
  [ids.acdTransfer]: {
    description: `Communication 10002719 provides transaxle or transfer-case removal information for a 2003 Lancer, but the reviewed exact corpus contains no record establishing recurring ACD clutch-pack wear, transfer-case bearing failure, launch- or track-use causation, grinding or AWD loss across Evolution VIII, IX and X vehicles. The frozen engine metadata lists only the 4B11T even though Evolution VIII and IX used another engine family; that identity conflict remains unchanged pending policy.`,
    solution: `Identify the Evolution generation, engine, transmission, transfer case and ACD/AYC configuration. Reproduce the noise or AWD complaint and check codes, commanded center-differential operation, hydraulic pressure, fluid specification and condition, leakage, wheel-speed inputs, mounts, propeller shaft, axles and bearing noise under the generation-specific procedure. Do not buy ACD clutch packs, bearings, transfer-case fluid, a transfer case or differential from this page; the installed system, exact noise source and failed hydraulic, electronic or mechanical path must be proven first.`,
    symptoms: ['Evolution generation and installed driveline verified', 'noise or AWD complaint reproduced under controlled conditions', 'control, pressure, fluid, bearing and driveline paths separated'],
    affectedSystems: ['ACD center differential and transfer case', 'hydraulic pressure and driveline control', 'transfer bearings, propeller shaft and axles'],
    evidence: ['10002719 is removal information, not an ACD wear or failure finding.', 'No exact communication establishes the frozen track-use, clutch-pack and bearing mechanism.', 'The frozen engine metadata conflicts with the VIII/IX/X title scope.'],
    conflict: 'The indexed ACD identity spans three generations while its frozen engine metadata omits the VIII/IX engine and exact failure evidence is absent.',
    summary: 'Held the ACD transfer-case identity and required generation, equipment, control, pressure and noise-source proof.',
    citations: ['datasets'],
  },
  [ids.timingChain]: {
    description: `Mitsubishi TSB-12-13-006 covers a bounded 2008-2011 Lancer Evolution and 2009-2011 Ralliart population where an incorrect judgment parameter can report a fault even while chain elongation remains within allowance. It requires reprogramming, oil-control-valve and visual chain checks, and replacement only when elongation is confirmed. Other exact records document timing-chain guide or oil-jet production changes, not recurring 2008-2017 4B11/4B12 chain stretch from neglected oil. The evidence does not establish the frozen full population, rough-idle progression, tooth-jump risk or universal 5,000-mile interval.`,
    solution: `Identify the engine, model, build date and software history, preserve codes and follow the applicable manufacturer diagnostic procedure. Check oil level, condition and specification, oil-control-valve operation and timing-chain elongation by the prescribed visual method. If elongation is confirmed, TSB-12-13-006 says to replace the chain and oil-pump chain and not to replace the tensioner, VVT sprocket or guides unless they are significantly worn or damaged. Do not buy a timing kit, tensioner, guides, sprockets or oil-control valve from this page; the exact population, measured elongation and separately damaged parts must be proven first.`,
    symptoms: ['engine, build date and software history verified', 'oil control and prescribed chain-elongation check completed', 'software mis-detection separated from measured mechanical wear'],
    affectedSystems: ['4B1 timing chain and oil-pump chain', 'MIVEC oil control and learned value', 'ECM judgment software and cam timing'],
    evidence: ['TSB-12-13-006 distinguishes software mis-detection from measured chain elongation.', 'It expressly limits replacement to the chain and oil-pump chain unless related parts are separately worn.', 'Guide and oil-jet production revisions do not prove universal recurring chain stretch.'],
    conflict: 'The indexed chain-stretch identity extends a bounded diagnostic bulletin through 2017 and prescribes replacement parts the bulletin explicitly limits.',
    summary: 'Held the overbroad timing-chain identity and made measured elongation and the bulletin’s parts limitation control the repair.',
    citations: ['timingChain', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: 'Lancer', slug: 'lancer', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-lancer-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['LANCER', 'LANCER EVOLUTION'],
  searchTerms: ['CVT', 'continuously variable', 'CVT-8', 'shudder', 'surge', 'belt & pulley', 'primary pulley', 'secondary pulley', 'CVT hydraulic pressure', 'AYC', 'active yaw', 'yaw control', 'rear differential pump', 'torque vectoring', 'ACD', 'active center differential', 'transfer case', 'center differential', 'timing chain', 'chain elongation', 'timing chain learned', 'P0012', 'P0016', 'P0017', 'cam timing'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 78, '2005-2009': 77, '2010-2014': 35, '2015-2019': 127, '2020-2024': 162, '2025-2026': 6 },
    totalRows: 485,
    relevantRowCount: 29,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 29, post: 73 },
    totalRows: 102,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Twenty-five exact Lancer/Lancer Evolution campaign identities exist. Only 16V563000 intersects a frozen page, and it supports a 2016 CVT-control software delay rather than the frozen universal mechanical-failure identity.',
  },
  content,
  requiredProse: [
    { id: ids.cvtFailure, field: 'description', patterns: ['2008-2010 Lancer CVTs', '2016-2017 Lancer CVT-8', 'do not establish universal 2008-2017'] },
    { id: ids.cvtFailure, field: 'solution', patterns: ['oil-pan magnets', 'Do not buy'] },
    { id: ids.aycPump, field: 'description', patterns: ['contains no record establishing recurring Active Yaw Control', 'do not by themselves prove'] },
    { id: ids.acdTransfer, field: 'description', patterns: ['10002719', 'engine metadata'] },
    { id: ids.timingChain, field: 'description', patterns: ['incorrect judgment parameter', 'does not establish the frozen full population'] },
    { id: ids.timingChain, field: 'solution', patterns: ['not to replace the tensioner', 'Do not buy'] },
  ],
  observations: [
    { code: 'four-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All four frozen identities materially exceed exact primary evidence and remain published pending identity policy.' },
    { code: 'three-cvt-conditions-separated', severity: 'technical-accuracy', recordIds: [ids.cvtFailure], detail: 'Pulley-bearing noise, CVT-8 hydraulic shudder and a software acceleration delay remain separate bounded conditions rather than one universal failure.' },
    { code: 'evolution-metadata-conflict-frozen', severity: 'identity-hold', recordIds: [ids.acdTransfer], detail: 'The VIII/IX/X title and 4B11T-only engine metadata conflict is reported but not silently rewritten.' },
    { code: 'timing-parts-limited-by-primary-source', severity: 'repair-safety', recordIds: [ids.timingChain], detail: 'The proposal preserves the bulletin instruction not to replace tensioner, sprocket or guides absent separate wear or damage.' },
    { code: 'all-lancer-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Lancer page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
