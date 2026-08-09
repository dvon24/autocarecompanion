/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  all4: 'mini-countryman-all4-coupling-2011',
  transmission: 'mini-countryman-transmission-2017',
  cooling: 'mini-countryman-water-pump-leak-2011',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([
  '10049421', '10049422', '10051917', '10134994', '10146796', '10146799',
  '10147642', '10147700', '10147906', '10148149', '10148150', '10148349',
  '10149330', '10149501', '10149503', '10149621', '10149622', '10152680',
  '10160229', '10160298', '10193497', '11006765', '11021120', '11032775',
]);
const campaigns = Object.freeze([
  '12V008000', '17E051000', '18V248000', '18V465000', '18V557000',
  '20V490000', '20V601000', '21V554000', '24V104000', '24V340000',
]);
const pdfSources = Object.freeze({
  rearAxleNut: {
    title: 'MINI SI M33 02 12 - Cracking or Popping Noise from Rear Axle',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10149330-9999.pdf',
    sha256: '1c44d018c0651ce6bc5589edbc68160090f3e77bca77e8250bcb0ffbdbf48da5',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
  aisinHardware: {
    title: 'MINI SI M24 01 19 - EGS Faults Stored after AISIN Transmission Replacement',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163062-9999.pdf',
    sha256: '727d98fdd50bd678a0b7feb921ec3b18a3487e41b8f04783846432f841f8ea44',
    pageCount: 2,
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
});
const datasets = Object.freeze({ title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL });

const content = Object.freeze({
  [ids.all4]: {
    description: `The reviewed R60 Countryman manufacturer-communication and recall corpus does not establish recurring ALL4 coupling-pump failure, fluid degradation, transfer-case leakage or bearing failure across 2011-2025. Exact MINI guidance for one rear-axle popping complaint instead identifies an incorrectly torqued axle nut. That separate condition cannot prove the frozen Haldex-type coupling mechanism or a universal 30,000-mile fluid interval.`,
    solution: `Record the chassis, drivetrain and exact complaint, then distinguish tire circumference or pressure, wheel bearing and axle-nut noise, CV joints, propeller shaft, rear differential, coupling actuation and any actual transfer-case leak. Scan DSC and drivetrain modules with MINI-capable equipment, inspect fluid only under the correct VIN-specific service procedure, and locate noise or leakage before opening a unit. Do not buy fluid 83222413511, coupling 27108698826, a GKN unit, Mobil 1 75W-90 or a Fel-Pro gasket from this page; system architecture, failed component, lubricant specification and VIN fitment must be proven first.`,
    symptoms: ['chassis, drivetrain and tire condition recorded', 'axle, wheel bearing, propeller shaft and coupling paths separated', 'module faults, leak source and lubricant specification verified'],
    affectedSystems: ['ALL4 coupling and control system', 'rear differential, axles and wheel bearings', 'propeller shaft and transfer drive'],
    evidence: ['No matching coupling-pump or transfer-case failure communication appears in the exact Countryman corpus.', 'SI M33 02 12 attributes one R60 rear-axle popping condition to an incorrectly torqued axle nut.', 'The frozen 1,100-owner count, Haldex mechanism and 30,000-mile fluid interval have no auditable MINI source.'],
    conflict: 'The indexed page combines multiple AWD components and service claims into one recurring identity without exact primary evidence.',
    summary: 'Held the broad ALL4 identity, removed invented social proof and required subsystem and lubricant proof before service or parts.',
    citations: ['rearAxleNut', 'datasets'],
  },
  [ids.transmission]: {
    description: `MINI SI M24 01 19 confirms that F60 Countryman applications can use AISIN GA6F21AW or GA8F22AW transmissions. It does not identify the frozen AW TF-81SC/AF40 designation or establish recurring light-throttle torque-converter shudder from 2017-2025. No matching Countryman manufacturer communication in the reviewed corpus proves the stated 30-50 mph mechanism, automatic flush remedy or torque-converter replacement path.`,
    solution: `Identify the transmission by VIN and installed identification before service. Reproduce the vibration under controlled speed, load, gear, converter-slip and temperature conditions; separate engine misfire, wheel or tire disturbance, axle or ALL4 vibration and an actual shift event. Read EGS faults and live data, check software level, and follow the exact MINI fluid-level and diagnosis procedure before considering fluid or hardware. Do not buy BMW ATF 3+ 83222289720, Liqui Moly flush chemicals, Valvoline MaxLife or a torque converter from this page; the transmission family, fluid specification and failed mechanism must be proven first.`,
    symptoms: ['VIN and installed transmission identified', 'speed, load, gear, slip and fluid temperature captured', 'engine, tire, axle, ALL4 and transmission causes separated'],
    affectedSystems: ['AISIN GA6F21AW or GA8F22AW transmission', 'electronic transmission control and software', 'torque converter, fluid circuit and driveline'],
    evidence: ['SI M24 01 19 identifies GA6F21AW and GA8F22AW hardware on F60, not the frozen TF-81SC/AF40 designation.', 'That bulletin addresses software compatibility after transmission replacement, not a recurring converter-shudder identity.', 'The frozen 800-owner count, 30-50 mph frequency and flush-first remedy have no exact audited source.'],
    conflict: 'The indexed page asserts an unsupported transmission designation, failure mechanism and repair sequence across the full F60 range.',
    summary: 'Held the transmission-shudder identity, removed invented social proof and required transmission identification and measured diagnosis.',
    citations: ['aisinHardware', 'datasets'],
  },
  [ids.cooling]: {
    description: `MINI SI M01 12 16 covers an engine mechanical water pump on eligible 2011-2013 R60 Countryman N18 vehicles and explicitly excludes an electric water pump. SI M01 02 18 separately covers the thermostat with thermostat housing on bounded 2014-2016 N18 Countryman populations. These sources do not support the frozen combined electric-pump-and-thermostat identity or sudden internal electric-pump failure across 2011-2016.`,
    solution: `Confirm the R60 variant, N18 engine, production date and VIN eligibility. Pressure-test the cold cooling system, inspect the mechanical pump and friction-wheel drive, locate any housing or hose leak, and compare coolant-temperature data with ambient and actual engine temperature. Diagnose thermostat actuation and temperature-sensor faults separately. Do not buy Gates or GMB water pumps, Stant or Gates thermostats, a friction wheel or coolant from this page; pump architecture, failed component, production date and VIN-specific part must be proven first.`,
    symptoms: ['R60 variant, production date and VIN eligibility recorded', 'mechanical pump, friction wheel and leak source inspected', 'thermostat actuation and temperature sensing tested separately'],
    affectedSystems: ['engine mechanical water pump and friction wheel', 'N18 thermostat housing and actuation', 'coolant temperature sensing and cooling circuit'],
    evidence: ['SI M01 12 16 explicitly identifies the covered R60 pump as mechanical and says coverage does not apply to an electric pump.', 'SI M01 02 18 identifies separate 2014-2016 N18 thermostat populations.', 'The frozen electric-pump mechanism, combined failure identity and generic DTC list exceed the exact evidence.'],
    conflict: 'The indexed title and body misidentify a mechanical pump as electric and combine it with a separate thermostat population.',
    summary: 'Held the combined cooling identity, corrected the mechanical/electric architecture and separated pump and thermostat diagnosis.',
    citations: ['mechanicalWaterPump', 'n18Thermostat', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'Countryman', slug: 'countryman', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-countryman-adjudication-2026-08-10.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds: [ids.all4, ids.transmission].sort(),
  modelAliases: ['COUNTRYMAN', 'COOPER COUNTRYMAN', 'COOPER S COUNTRYMAN', 'COOPER S COUNTRYMAN ALL4', 'JOHN COOPER WORKS COUNTRYMAN', 'JCW COUNTRYMAN'],
  searchTerms: ['ALL4', 'four wheel', 'all wheel', 'transfer case', 'transfer box', 'coupling', 'Haldex', 'LMV', 'rear axle', 'longitudinal torque', 'transmission', 'shudder', 'torque converter', 'shift', 'GA8', 'Aisin', 'gearbox', 'water pump', 'coolant pump', 'thermostat', 'coolant leak'],
  relevantDocumentIds, campaigns, pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 25, '2015-2019': 277, '2020-2024': 58, '2025-2026': 63 },
    totalRows: 423, relevantRowCount: 44, uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 23 }, totalRows: 23, campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Ten federal campaigns exist in the Countryman alias set, but none establishes one of the three frozen model-wide identities or an owner-frequency rate.',
  },
  content,
  requiredProse: [
    { id: ids.all4, field: 'description', patterns: ['does not establish recurring ALL4', 'incorrectly torqued axle nut'] },
    { id: ids.transmission, field: 'description', patterns: ['GA6F21AW or GA8F22AW', 'does not identify the frozen AW TF-81SC/AF40'] },
    { id: ids.cooling, field: 'description', patterns: ['mechanical water pump', 'explicitly excludes an electric water pump', 'separately covers the thermostat'] },
  ],
  observations: [
    { code: 'all-countryman-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All three indexed identities exceed exact architecture, mechanism, production-window or repair evidence.' },
    { code: 'electric-pump-misidentification-blocked', severity: 'engine-scope', recordIds: [ids.cooling], detail: 'The R60 N18 source identifies a mechanical pump and explicitly excludes an electric pump.' },
    { code: 'wrong-transmission-designation-blocked', severity: 'drivetrain-scope', recordIds: [ids.transmission], detail: 'The exact F60 bulletin identifies GA6F21AW or GA8F22AW, not the frozen AW TF-81SC/AF40 designation.' },
    { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: [ids.all4, ids.transmission], detail: 'The two nonzero owner totals lack auditable reports and are proposed as unknown zero.' },
    { code: 'all-countryman-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Countryman page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
