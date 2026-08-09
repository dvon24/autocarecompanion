/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  waterPumpThermostat: 'mini-jcw-water-pump-thermostat-2008',
  clutch: 'mini-jcw-clutch-premature-wear-2008',
  carbon: 'mini-jcw-carbon-buildup-2008',
  hpfp: 'mini-jcw-hpfp-n14-2008',
  timing: 'mini-jcw-timing-chain-n14-2008',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([
  '10040741', '10049421', '10057380', '10058544', '10059110', '10135056',
  '10146796', '10147906', '10147907', '10147908', '10149621', '10149622',
  '10150145', '10150237', '10150396', '10152360',
]);
const campaigns = Object.freeze([
  '08V507000', '12V008000', '15V450000', '15V628000',
  '18V248000', '18V465000', '19V634000', '23V337000',
]);
const pdfSources = Object.freeze({
  jcw2015: {
    title: 'BMW Group Press Folder - The New MINI John Cooper Works (2015)',
    type: 'manufacturer',
    url: 'https://www.press.bmwgroup.com/usa/article/attachment/T0206443EN_US/298231',
    sha256: '69f80cc5d21ebfaefcbbad70247205b7acd0fc1045e2214c0d4887900c64494c',
    pageCount: 15,
    visuallyReviewedPages: [3, 4, 8, 9],
  },
  jcw2021: {
    title: 'BMW Group U.S. Technical Specifications - MY 2021 MINI John Cooper Works Hardtop',
    type: 'manufacturer',
    url: 'https://www.press.bmwgroup.com/usa/article/attachment/T0324990EN_US/471010',
    sha256: 'd61fb30ef3e877f3df182865b3f0895c8f160ee76d6af1ad8710b0034b841cc5',
    pageCount: 16,
    visuallyReviewedPages: [9, 10, 13, 14],
  },
  clutchInspection: {
    title: 'MINI SI M21 01 13 - Clutch Is Slipping or Grabbing',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10150145-9999.pdf',
    sha256: '22cf0a1289399b5ec529b4142ce09155e82df385c0760d834f67b773557c3a3c',
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
    visuallyReviewedPages: [1, 2],
  },
  n14Timing: {
    title: 'MINI SI M11 04 13 - N14 Engine Check Timing Chain Tensioner and Timing Chain',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10054635-2047.pdf',
    sha256: 'ba7a8c1e8fbd049b24f3d6193c0b10053dac343bdf9d122cb2bef43e43f69c49',
    pageCount: 8,
    visuallyReviewedPages: [1, 4],
  },
  mechanicalWaterPump: {
    title: 'MINI SI M01 12 16 - Engine Mechanical Water Pump Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10146799-9999.pdf',
    sha256: '1c1c7902c2b9e415dac2bbf8feb541119602032a3561574ef77764dae8a2ff8c',
    pageCount: 6,
    visuallyReviewedPages: [1, 2],
  },
  n18Thermostat: {
    title: 'MINI SI M01 02 18 - N18 Thermostat with Thermostat Housing Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10160298-9999.pdf',
    sha256: '51cefdf41d4f336fbb1b303cf0b5e3ab055bae7aa39abc38a1eabae8d8514563',
    pageCount: 12,
    visuallyReviewedPages: [1, 4],
  },
});
const datasets = Object.freeze({ title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL });

const content = Object.freeze({
  [ids.waterPumpThermostat]: {
    description: `MINI's mechanical-water-pump extension identifies bounded JCW populations, including R56 N14 Hardtops for model years 2009-2012 and R56 N18 Hardtops for model year 2013. A separate thermostat/housing extension covers specific N18 JCW body variants and production windows. BMW Group then documents a completely new 2.0-litre JCW generation for 2015 and a B46A20O1 U.S. JCW Hardtop for MY 2021. Those sources do not establish one 2008-2024 water-pump-and-plastic-housing defect, a 50,000-80,000-mile failure interval or automatic paired replacement across all generations.`,
    solution: `Identify the JCW body code, engine, production date and VIN eligibility. Pressure-test the cooling system cold and hot, trace the highest wet point, and separate the mechanical pump, friction wheel, thermostat/housing, hoses, radiator, expansion tank and engine leakage before repair. Do not buy a water pump, thermostat housing, aluminum housing, friction wheel or a preventive 60,000-mile service from this page; the leaking component, generation-specific architecture, approved coolant and VIN fitment must be proven first.`,
    symptoms: ['JCW body code, engine and production date verified', 'cooling system pressure-tested and leak source documented', 'pump, thermostat, hose, radiator and engine paths separated'],
    affectedSystems: ['generation-specific mechanical water pump and drive', 'thermostat and coolant outlet housing', 'cooling hoses, radiator, expansion tank and engine sealing'],
    evidence: ['The water-pump extension lists specific N14/N18 JCW body codes and production windows rather than all generations.', 'The N18 thermostat extension covers a separate bounded set of JCW variants and confirmed failures.', 'BMW Group documents a new 2.0-litre generation in 2015 and B46A20O1 for the U.S. MY 2021 JCW Hardtop.'],
    conflict: 'The indexed page merges two components, several engines and incompatible generations into one universal preventive-replacement identity.',
    summary: 'Held the all-generation cooling identity and required exact leak, engine, component and VIN proof before parts.',
    citations: ['jcw2015', 'jcw2021', 'mechanicalWaterPump', 'n18Thermostat', 'datasets'],
  },
  [ids.clutch]: {
    description: `BMW Group documents a six-speed manual and optional automatic for the 2015 JCW and manual and automatic MY 2021 JCW Hardtop configurations. MINI SI M21 01 13 is narrower: it covers N14/N18 R55-R60 vehicles produced through November 2012 when a customer reports slipping or grabbing, and requires pedal, hydraulic, release, wear and leak checks before replacement. It does not establish recurring premature clutch wear across 2008-2024, a small-disc/high-torque mechanism or 30,000-50,000-mile life.`,
    solution: `First confirm that the vehicle has a manual transmission and record its chassis, engine and complaint. Verify full pedal travel, hydraulic operation, release, leaks and contamination, then measure clutch wear and inspect the flywheel under the exact MINI repair procedure. Do not buy a clutch kit, heavy-duty upgrade, flywheel, master/slave cylinder or a $1,200-$2,000 replacement from this page; the failed component, installed transmission, duty history and VIN-specific parts must be proven first.`,
    symptoms: ['manual transmission and complaint confirmed', 'pedal travel, hydraulics and release tested', 'wear, contamination, flywheel and leak sources separated'],
    affectedSystems: ['generation-specific manual clutch assembly', 'clutch hydraulics and pedal travel', 'flywheel, transmission input and leak paths'],
    evidence: ['SI M21 01 13 is complaint-driven and limited to N14/N18 chassis produced through November 2012.', 'The bulletin makes clutch inspection conditional on pedal, hydraulic and release checks.', 'The 2015 and 2021 manufacturer sources document different transmission configurations without a recurring premature-wear finding.'],
    conflict: 'The indexed page turns a conditional early-generation inspection procedure into a universal JCW clutch-life defect.',
    summary: 'Held the all-generation clutch identity and required complaint, hydraulic, wear and transmission proof before replacement.',
    citations: ['jcw2015', 'jcw2021', 'clutchInspection', 'datasets'],
  },
  [ids.carbon]: {
    description: `MINI SI M12 02 10 is an N14 R55/R56/R57 misfire diagnostic path in which intake deposits are only one possible cause after fuel-pressure, ignition, VANOS, air-path, crankcase-pressure and timing checks. BMW Group documents a new 2.0-litre direct-injection JCW generation for 2015 and identifies the U.S. MY 2021 JCW Hardtop as B46A20O1. The frozen N14/B48 identity omits N18 and the U.S. B46 designation and does not establish actionable deposits or one 30,000-50,000-mile cleaning interval across 2008-2024.`,
    solution: `Record the exact engine, mileage and MINI misfire faults. Test fuel pressure, ignition, VANOS, intake leaks, crankcase pressure, compression and timing before removing the intake. On an applicable N14, inspect and score the deposits under the manufacturer procedure before selecting cleaning. Do not buy walnut blasting, chemical cleaner, a catch can or manifold gaskets from this page; engine applicability, the actual cause, deposit severity and repair consumables must be proven first.`,
    symptoms: ['engine and manufacturer misfire faults recorded', 'fuel, ignition, VANOS, air-path and mechanical causes tested first', 'intake deposits visually documented before cleaning'],
    affectedSystems: ['engine-specific intake valves and ports', 'fuel-pressure and ignition systems', 'VANOS, crankcase ventilation, intake and timing'],
    evidence: ['SI M12 02 10 applies to N14 R55/R56/R57 and treats deposits as one conditional cause.', 'BMW Group documents a new 2.0-litre JCW generation for 2015.', 'The exact U.S. MY 2021 sheet identifies B46A20O1, not the frozen all-later-year B48-only identity.'],
    conflict: 'The indexed page transfers a conditional N14 misfire finding across omitted and differently designated JCW engines as a recurring maintenance interval.',
    summary: 'Held the cross-generation carbon identity and made cleaning conditional on engine-specific fault diagnosis and inspection.',
    citations: ['jcw2015', 'jcw2021', 'n14MisfireCarbon', 'datasets'],
  },
  [ids.hpfp]: {
    description: `MINI SIM 01 04 19 supports a narrow N14 high-pressure-fuel-pump service benefit: R55, R56 and R57 JCW models for 2010-2012, plus R58 and R59 JCWs for 2012, subject to VIN eligibility. It explicitly says no immediate repair is required without a covered defect. It does not establish the frozen 2008-2012 population, a 40,000-mile failure rate, lean piston/valve damage, a universal updated pump or the relay, sensor and aftermarket-upgrade advice.`,
    solution: `Record the JCW body code, engine, model year, production date and VIN benefit status. Capture commanded and actual low- and high-side fuel pressure with manufacturer faults, then separate pump control, low-pressure supply, rail-pressure sensing, wiring, injector and fuel-quality paths before condemning the pump. Do not buy pump 13517588879, an Autotech upgrade, a relay or a pressure sensor from this page; a confirmed defect, exact pump design and VIN-specific supersession must be proven first.`,
    symptoms: ['body code, N14 engine and VIN eligibility verified', 'low- and high-side pressure measured under the manufacturer test plan', 'pump, supply, sensing, wiring and injector faults separated'],
    affectedSystems: ['eligible N14 high-pressure fuel pump', 'low-pressure fuel supply and pump control', 'rail-pressure sensing, injectors and DME diagnosis'],
    evidence: ['SIM 01 04 19 lists specific 2010-2012 N14 JCW class vehicles, not every frozen year.', 'The service benefit is VIN-specific and says no immediate repair is required absent a covered defect.', 'The frozen 300-owner count, mileage threshold, damage mechanism and supporting-parts advice are not established.'],
    conflict: 'The indexed identity broadens a precise class-vehicle benefit into an all-2008-2012 recurring HPFP failure and automatic parts path.',
    summary: 'Held the N14 HPFP identity and bounded it to exact class vehicles, pressure diagnosis and VIN-specific eligibility.',
    citations: ['jcw2015', 'jcw2021', 'n14Hpfp', 'datasets'],
  },
  [ids.timing]: {
    description: `MINI SI M11 04 13 establishes a service action only for certain N14 R55/R56/R57 vehicles produced from November 2006 through May 2009. It requires tensioner identification and a calibrated 68 mm chain measurement before choosing no repair, tensioner-only replacement or the repair kit. The frozen 2008-2012 JCW identity is materially broader, and its claim that N14 was replaced starting in 2011 conflicts with MINI's own N14 HPFP document listing 2011-2012 N14 JCWs. The reviewed primary evidence does not establish the stated class-settlement coverage or universal catastrophic progression.`,
    solution: `Verify the JCW chassis, N14 engine, production date and open service-action status. Record cold-start and hot-idle noise, oil level and pressure and cam/crank faults. On an applicable vehicle, identify the installed tensioner and use the MINI special-tool measurement; select parts only from the measured result and inspect for guide fragments when directed. Do not buy a complete timing kit, tensioner-only repair or a $1,500-$2,500 service from this page; action eligibility, measurement and VIN-specific scope must be proven first.`,
    symptoms: ['JCW chassis, engine and production date verified', 'service-action status and installed tensioner identified', 'chain measurement and guide condition documented'],
    affectedSystems: ['eligible N14 timing chain and tensioner', 'guides, rails and crankshaft sprocket', 'engine lubrication and cam/crank correlation'],
    evidence: ['SI M11 04 13 is limited to N14 R55/R56/R57 vehicles produced 11/2006-05/2009.', 'The bulletin requires tensioner identification and a 68 mm measurement before repair selection.', 'MINI SIM 01 04 19 lists N14 JCWs in 2011-2012, contradicting the frozen engine-transition statement.'],
    conflict: 'The indexed page expands a bounded, measurement-driven service action across unsupported years and adds an internally contradictory engine timeline.',
    summary: 'Held the N14 timing identity and required production, action and measurement gates before any repair or parts.',
    citations: ['jcw2015', 'jcw2021', 'n14Timing', 'n14Hpfp', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'John Cooper Works', slug: 'john-cooper-works', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-john-cooper-works-adjudication-2026-08-10.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds: allIds,
  modelAliases: ['JOHN COOPER WORKS', 'JCW', 'COOPER WORKS'],
  searchTerms: ['water pump', 'thermostat', 'coolant leak', 'coolant loss', 'clutch', 'clutch slip', 'clutch wear', 'clutch grabbing', 'carbon buildup', 'intake valve', 'misfire', 'high pressure fuel pump', 'fuel pressure', 'timing chain', 'chain tensioner'],
  relevantDocumentIds, campaigns, pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 5, '2015-2019': 206, '2020-2024': 23, '2025-2026': 1 },
    totalRows: 235,
    relevantRowCount: 19,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 1, post: 27 },
    totalRows: 28,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Eight campaigns occur in the broad JCW alias set; none establishes an all-generation mechanical identity or an owner-frequency rate for these five pages.',
  },
  content,
  requiredProse: [
    { id: ids.waterPumpThermostat, field: 'description', patterns: ['bounded JCW populations', 'do not establish one 2008-2024'] },
    { id: ids.clutch, field: 'description', patterns: ['produced through November 2012', 'does not establish recurring premature clutch wear'] },
    { id: ids.carbon, field: 'description', patterns: ['only one possible cause', 'identifies the U.S. MY 2021 JCW Hardtop as B46A20O1'] },
    { id: ids.hpfp, field: 'description', patterns: ['R55, R56 and R57 JCW models for 2010-2012', 'no immediate repair is required'] },
    { id: ids.timing, field: 'description', patterns: ['November 2006 through May 2009', 'listing 2011-2012 N14 JCWs'] },
  ],
  observations: [
    { code: 'all-jcw-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All five indexed identities exceed exact JCW chassis, engine, production-window, component or diagnostic evidence.' },
    { code: 'jcw-generation-transfer-blocked', severity: 'generation-scope', recordIds: allIds, detail: 'Bounded N14/N18 programs are not transferred to the later 2.0-litre/B46 JCW generation or vice versa.' },
    { code: 'n14-timeline-contradiction-corrected', severity: 'technical-accuracy', recordIds: [ids.timing], detail: 'The proposal removes the claim that JCW N14 ended in 2011 because MINI lists 2011-2012 N14 class vehicles.' },
    { code: 'conditional-repair-gates-preserved', severity: 'repair-safety', recordIds: allIds, detail: 'Manufacturer leak, clutch, misfire, pressure and timing-measurement gates replace automatic parts or preventive service.' },
    { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: allIds, detail: 'All five nonzero owner totals lack auditable report records and are proposed as unknown zero.' },
    { code: 'all-jcw-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No John Cooper Works page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
