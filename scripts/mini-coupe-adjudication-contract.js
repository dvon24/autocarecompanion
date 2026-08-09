/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  thermostatWrongEngines: 'mini-coupe-thermostat-housing-2012',
  thermostatLeak: 'mini-coupe-thermostat-housing-leak-2012',
  timingShort: 'mini-coupe-timing-chain-2012',
  timingStretch: 'mini-coupe-timing-chain-stretch-2012',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([
  '10049421', '10049422', '10057380', '10058506', '10146796', '10146799',
  '10147697', '10147700', '10147906', '10148149', '10148150', '10149501',
  '10149621', '10149622', '10151345', '10160229', '10160298',
]);
const pdfSources = Object.freeze({
  temperatureSensor: {
    title: 'MINI SI M17 09 12 - Retrofit of the Engine Coolant Temperature Sensor',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10148150-9999.pdf',
    sha256: 'c88252c17e8ebad1c40f6d1b355f5b6d963d3773d35e7d2e4e5c8022563deb0c',
    pageCount: 6,
    visuallyReviewedPages: [1],
  },
  mechanicalWaterPump: {
    title: 'MINI SI M01 12 16 - Engine Mechanical Water Pump Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10146799-9999.pdf',
    sha256: '1c1c7902c2b9e415dac2bbf8feb541119602032a3561574ef77764dae8a2ff8c',
    pageCount: 6,
    visuallyReviewedPages: [2],
  },
  n18Thermostat: {
    title: 'MINI SI M01 02 18 - N18 Thermostat with Thermostat Housing Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10160298-9999.pdf',
    sha256: '51cefdf41d4f336fbb1b303cf0b5e3ab055bae7aa39abc38a1eabae8d8514563',
    pageCount: 12,
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

const correctEngineDescription = `The frozen N20/N55 engine assignment is incompatible with the reviewed R58 MINI Coupe evidence. Exact MINI records identify N16 or N18 R58 coolant-temperature-sensor populations, N16/N18/N14 mechanical-water-pump populations and bounded N18 thermostat coverage. They do not establish an N20/N55 Coupe thermostat-housing crack identity, a heat-cycling mechanism or the frozen 2012-2015 scope.`;
const correctEngineSolution = `Identify the R58 variant, transmission, engine code, production date and VIN before cooling-system work. Pressure-test the cold system and trace the highest fresh-coolant point; distinguish the mechanical water pump and friction wheel, thermostat housing, temperature sensor, hoses, expansion tank and radiator. Do not buy URO 11537534521-PRM, an aluminum housing, thermostat or O-ring from this page; the N20/N55 assignment is not valid for this R58 evidence and the exact failed component and VIN fitment must be proven first.`;
const n14N18ThermostatDescription = `The R58 evidence separates several bounded conditions: an N16/N18 temperature-sensor service action for vehicles produced through March 2012, mechanical-water-pump coverage for eligible N16/N18/N14 vehicles, and N18 thermostat-housing coverage for specific 2014-2015 Coupe variants. It does not establish recurring plastic housing cracks, O-ring failure from heat cycling, belt contamination or one N14/N18 thermostat-leak identity across 2012-2015.`;
const n14N18ThermostatSolution = `Record the R58 variant, engine, transmission, production date and VIN eligibility. Pressure-test the cooling system and compare temperature-sensor data with ambient and actual temperature; inspect the mechanical pump, friction wheel, thermostat housing, hose connections, expansion tank and belt path separately. Do not replace the water pump, expansion tank or thermostat merely because they are the same age. Do not buy Stant or Gates thermostats, Gates hoses, Prestone coolant or any housing from this page; leak source, coolant specification and VIN fitment must be proven first.`;
const timingDescription = `The reviewed R58 Coupe manufacturer-communication corpus does not establish a recurring N14/N18 timing-chain-tensioner or chain-stretch identity for 2012-2015. MINI SI M11 04 13 is a bounded N14 service action for R55, R56 and R57 vehicles produced from November 2006 through May 2009; it does not include R58 and cannot be transferred to the Coupe. No exact evidence supports an N18 continuation, universal guide failure or catastrophic progression on these indexed pages.`;
const timingSolution = `Verify the R58 engine code before applying any timing information. Record cold-start and hot-idle noise, oil level and pressure, manufacturer camshaft/crankshaft correlation faults and measured timing values, then inspect the tensioner, guides and lubrication path under the engine-specific MINI procedure. Do not replace a timing set preventively at 60,000-80,000 miles from this page. Do not buy a Cloyes kit, Castrol oil, tensioner, guide set or gasket package until the actual engine, measured condition and VIN-specific repair scope are proven.`;

const content = Object.freeze({
  [ids.thermostatWrongEngines]: {
    description: correctEngineDescription,
    solution: correctEngineSolution,
    symptoms: ['R58 engine, transmission and production date verified', 'cold-system pressure test and highest leak point documented', 'pump, thermostat, sensor, hose and tank paths separated'],
    affectedSystems: ['R58 mechanical water pump and friction wheel', 'thermostat housing and coolant temperature sensor', 'hoses, expansion tank and radiator'],
    evidence: ['The exact R58 communications identify N16, N18 and in some cases N14, not the frozen N20/N55 engines.', 'The temperature-sensor action documents internal corrosion and false readings, not housing cracks from thermal stress.', 'The frozen 200-owner count, aluminum-housing remedy and N20/N55 shared-weakness claim have no auditable source.'],
    conflict: 'The indexed page assigns BMW N20/N55 engines and an unsupported housing-crack mechanism to the MINI R58 Coupe.',
    summary: 'Held the wrong-engine thermostat identity, removed invented social proof and required R58 engine and leak-source verification.',
    citations: ['temperatureSensor', 'mechanicalWaterPump', 'n18Thermostat', 'datasets'],
  },
  [ids.thermostatLeak]: {
    description: n14N18ThermostatDescription,
    solution: n14N18ThermostatSolution,
    symptoms: ['R58 variant, engine and production date verified', 'pressure and temperature-sensor plausibility tested', 'pump, thermostat, sensor, belt and expansion-tank paths separated'],
    affectedSystems: ['N14/N18 cooling circuit', 'mechanical water pump and friction wheel', 'thermostat housing and coolant temperature sensing'],
    evidence: ['Exact R58 sources separate temperature-sensor, mechanical-pump and bounded N18 thermostat populations.', 'No reviewed communication proves one 2012-2015 plastic-crack and O-ring mechanism.', 'The automatic replacement of pump, tank, thermostat and generic aftermarket parts is unsupported.'],
    conflict: 'This overlapping thermostat page combines separate component populations and an unsupported common crack mechanism.',
    summary: 'Held the overlapping thermostat-leak identity and separated sensor, mechanical-pump and thermostat diagnosis.',
    citations: ['temperatureSensor', 'mechanicalWaterPump', 'n18Thermostat', 'datasets'],
  },
  [ids.timingShort]: {
    description: timingDescription,
    solution: timingSolution,
    symptoms: ['R58 engine code verified', 'cold and hot noise plus oil condition documented', 'manufacturer timing correlation and physical inspection completed'],
    affectedSystems: ['engine-specific timing chain and tensioner', 'guide rails and sprockets', 'engine lubrication and cam/crank correlation'],
    evidence: ['The reviewed Coupe corpus contains no exact R58 timing-chain failure communication.', 'SI M11 04 13 covers N14 R55/R56/R57 and excludes R58 by model scope.', 'The frozen N18 claim and generic P-codes cannot be inferred from a different chassis service action.'],
    conflict: 'The indexed page transfers an R55/R56/R57 N14 service action into a broad R58 N14/N18 failure identity.',
    summary: 'Held the short timing identity and blocked cross-chassis N14 evidence transfer and unsupported N18 claims.',
    citations: ['n14Timing', 'datasets'],
  },
  [ids.timingStretch]: {
    description: timingDescription,
    solution: timingSolution,
    symptoms: ['R58 engine code verified', 'cold and hot noise plus oil condition documented', 'manufacturer timing correlation and physical inspection completed'],
    affectedSystems: ['engine-specific timing chain and tensioner', 'guide rails and sprockets', 'engine lubrication and cam/crank correlation'],
    evidence: ['No exact R58 communication in the reviewed corpus establishes the frozen chain-stretch identity.', 'The closest N14 service action is limited to R55/R56/R57 vehicles produced through May 2009.', 'The frozen 60,000-80,000-mile preventive interval, root-cause claim and catastrophic cost warning have no audited source.'],
    conflict: 'This duplicate timing page adds unsupported preventive mileage and catastrophic-failure claims to an unproven R58 identity.',
    summary: 'Held the duplicate timing identity and removed unsupported mileage, catastrophe and parts advice.',
    citations: ['n14Timing', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'Coupe', slug: 'coupe', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-coupe-adjudication-2026-08-10.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds: [ids.thermostatWrongEngines],
  modelAliases: ['COUPE', 'COOPER COUPE', 'COOPER S COUPE', 'JOHN COOPER WORKS COUPE', 'JCW COUPE'],
  searchTerms: ['thermostat', 'thermostat housing', 'coolant leak', 'coolant loss', 'water pump', 'timing chain', 'chain tensioner', 'chain stretch', 'guide rail', 'misfire'],
  relevantDocumentIds, campaigns: [], pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 12, '2015-2019': 124, '2020-2024': 6, '2025-2026': 2 },
    totalRows: 144, relevantRowCount: 17, uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'No federal recall row appears in the exact Coupe alias set, so no recall establishes a frozen identity or owner-frequency rate.',
  },
  content,
  requiredProse: [
    { id: ids.thermostatWrongEngines, field: 'description', patterns: ['N20/N55 engine assignment is incompatible', 'N16 or N18 R58'] },
    { id: ids.thermostatLeak, field: 'description', patterns: ['separates several bounded conditions', 'does not establish recurring plastic housing cracks'] },
    { id: ids.timingShort, field: 'description', patterns: ['does not include R58', 'cannot be transferred to the Coupe'] },
    { id: ids.timingStretch, field: 'solution', patterns: ['Do not replace a timing set preventively', 'Do not buy a Cloyes kit'] },
  ],
  observations: [
    { code: 'all-coupe-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All four identities exceed exact engine, chassis, mechanism or production-window evidence.' },
    { code: 'wrong-n20-n55-engine-assignment-blocked', severity: 'engine-scope', recordIds: [ids.thermostatWrongEngines], detail: 'The R58 primary corpus supports N16/N18/N14 populations, not the frozen N20/N55 assignment.' },
    { code: 'duplicate-thermostat-identities-held', severity: 'identity-hold', recordIds: [ids.thermostatWrongEngines, ids.thermostatLeak], detail: 'Two overlapping thermostat pages remain indexed and unmerged pending identity policy.' },
    { code: 'duplicate-timing-identities-held', severity: 'identity-hold', recordIds: [ids.timingShort, ids.timingStretch], detail: 'Two overlapping timing pages remain indexed and unmerged; R55/R56/R57 evidence is not transferred to R58.' },
    { code: 'invented-owner-count-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: [ids.thermostatWrongEngines], detail: 'The nonzero 200-owner total lacks auditable reports and is proposed as unknown zero.' },
    { code: 'all-coupe-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Coupe page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
