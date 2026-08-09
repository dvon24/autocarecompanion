/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  timingTurboOil: 'mini-roadster-timing-chain-2012',
  clutchDmf: 'mini-roadster-clutch-2012',
  softTopLatch: 'mini-roadster-soft-top-motor-2012',
  waterPump: 'mini-roadster-water-pump-failure-2012',
});
const allIds = Object.freeze(Object.values(ids).sort());
const relevantDocumentIds = Object.freeze([
  '10057380', '10146796', '10146799', '10147906', '10148206',
  '10149501', '10149621', '10150145', '10193497',
]);
const campaigns = Object.freeze([]);
const pdfSources = Object.freeze({
  roadsterTechnical: {
    title: 'BMW Group U.S. Technical Data - MINI Roadster, Edition 01/2012',
    type: 'manufacturer',
    url: 'https://www.press.bmwgroup.com/usa/article/attachment/T0124618EN_US/183650',
    sha256: 'de00a4381ac6c04a8900fcf8d747a9ae28ad408f4f159d47855c3d2f4427e3b3',
    pageCount: 1,
    visuallyReviewedPages: [1],
  },
  roadsterPress: {
    title: 'BMW Group Press Information - The MINI Roadster',
    type: 'manufacturer',
    url: 'https://www.press.bmwgroup.com/global/article/attachment/T0124220EN/182628',
    sha256: 'b3f941b3f2c30a869cf4b5a81b4dae9ba64e92b68a62982c97e2b053a3ade804',
    pageCount: 31,
    visuallyReviewedPages: [1, 2, 4, 10, 15],
  },
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
  mechanicalWaterPump: {
    title: 'MINI SI M01 12 16 - Engine Mechanical Water Pump Limited Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10146799-9999.pdf',
    sha256: '1c1c7902c2b9e415dac2bbf8feb541119602032a3561574ef77764dae8a2ff8c',
    pageCount: 6,
    visuallyReviewedPages: [1, 2],
  },
});
const datasets = Object.freeze({ title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL });

const content = Object.freeze({
  [ids.timingTurboOil]: {
    description: `The exact 2012 U.S. Roadster data identifies N16 Cooper, N18 Cooper S and N14 John Cooper Works variants. The detailed N14 timing-chain action applies to R55, R56 and R57 vehicles produced through May 2009 and does not include R59 or N18. The N14 turbo-oil bulletin likewise covers older N14 chassis and installs a heat shield at the oil supply line; it does not establish a recurring N18 timing-chain and turbo-return-line defect on 2012-2015 Roadsters. Timing noise and an oil leak are two unrelated conditions that require separate diagnosis.`,
    solution: `Identify the exact Roadster variant, engine and production date. For a timing complaint, record the noise conditions, oil pressure, cam/crank faults and measured timing deviation under the engine-specific MINI test plan. For an oil leak, clean the area and trace the highest fresh-oil point while separating the supply line, return line, fittings, turbo housing, valve cover, vacuum pump and timing-cover paths. Do not buy a timing kit, tensioner, turbo oil line or combined repair from this page; the frozen sources do not include R59 or N18 for the alleged combined defect, and each failed component and VIN-specific part must be proven independently.`,
    symptoms: ['Roadster variant, engine and production date verified', 'timing noise, faults and measured deviation recorded separately', 'highest fresh-oil source traced after cleaning'],
    affectedSystems: ['engine-specific timing drive and lubrication', 'turbocharger oil supply and return paths', 'adjacent valve-cover, vacuum-pump and timing-cover seals'],
    evidence: ['The exact U.S. Roadster sheet separates N16, N18 and N14 variants.', 'SI M11 04 13 covers older R55/R56/R57 N14 vehicles and does not include R59 or N18.', 'SI M11 05 13 addresses an older N14 turbo oil supply-line heat shield, not a recurring R59 N18 return-line failure.'],
    conflict: 'The indexed page combines timing and turbo-oil identities while transferring older N14 evidence to the N18 R59 population.',
    summary: 'Held the combined timing/turbo-oil identity and separated engine-specific timing measurement from exact leak tracing.',
    citations: ['roadsterTechnical', 'n14Timing', 'n14TurboOilShield', 'datasets'],
  },
  [ids.clutchDmf]: {
    description: `MINI SI M21 01 13 covers manual-transmission R59 Roadsters with N14 or N18 engines produced through November 2012 when a clutch is slipping or grabbing. It requires pedal, hydraulic, release, wear and leak checks before replacement. SI M21 01 14 supplies measured dual-mass-flywheel rejection limits. Neither source establishes recurring clutch and flywheel failure at 40,000-60,000 miles, a lightweight-flywheel or turbo-torque mechanism, or an owner population across every 2012-2015 Roadster.`,
    solution: `Confirm that the vehicle has a manual transmission, then record its engine and production date. Verify unrestricted clutch-pedal travel, hydraulic operation and full release, inspect for engine, transmission and hydraulic-fluid leaks, and measure clutch wear. Evaluate the dual-mass flywheel separately using the MINI rotational-free-play, axial-play and thermal-damage criteria; replacement is justified only when the applicable measured limit or documented damage is present. Do not buy a complete clutch kit, flywheel or conversion from this page; the failed component, installed transmission and VIN-specific parts must be proven first.`,
    symptoms: ['manual transmission, engine and production date verified', 'pedal, hydraulic, release, leak and clutch-wear checks completed', 'dual-mass-flywheel limits measured separately'],
    affectedSystems: ['manual clutch disc, pressure plate and release system', 'clutch pedal and hydraulic actuation', 'engine-specific dual-mass flywheel'],
    evidence: ['SI M21 01 13 includes R59 N14/N18 only through November 2012 and makes replacement complaint- and inspection-dependent.', 'SI M21 01 14 requires measured engine-specific flywheel criteria.', 'The frozen 160-owner count, mileage range and lightweight-flywheel/turbo-torque mechanism have no auditable source.'],
    conflict: 'The indexed page turns conditional clutch and flywheel inspection procedures into a recurring premature-wear identity for every model year.',
    summary: 'Held the clutch/flywheel identity, removed invented social proof and required component-specific measured diagnosis before parts.',
    citations: ['roadsterTechnical', 'clutchInspection', 'dmfInspection', 'datasets'],
  },
  [ids.softTopLatch]: {
    description: `BMW Group's Roadster material documents the manually operated soft-top architecture, including its opening sequence and gas-pressure-spring assistance. It does not establish recurring latch or striker wear, a model-wide wind or water-leak defect, six-month lithium-grease service or a generic adjustment-screw remedy. The reviewed exact Roadster manufacturer-communication corpus contains no matching latch-mechanism failure record.`,
    solution: `Reproduce the complaint and record roof position, closure effort, warning messages, wind-noise location and the highest water-entry point. Inspect latch engagement, striker alignment, header seal compression, frame joints, tensioning elements and gas-pressure-spring assistance, then perform a controlled water test before adjustment. Do not buy a latch, striker, seal, frame part or lubricant from this page; the manual soft-top architecture is established, but the failed component, adjustment specification and VIN-specific repair are not.`,
    symptoms: ['manual roof operation and closure effort reproduced', 'latch, striker, header seal and frame alignment inspected', 'wind or water path isolated with controlled testing'],
    affectedSystems: ['manual soft-top latch and striker engagement', 'header seal, frame joints and tensioning elements', 'gas-pressure-spring roof assistance'],
    evidence: ['BMW Group documents the manual soft-top architecture and operating sequence.', 'The source does not establish recurring latch or striker wear or a six-month grease interval.', 'No exact Roadster communication or recall in the reviewed corpus establishes the frozen failure identity.'],
    conflict: 'The indexed page converts a documented roof architecture into a recurring wear mechanism and maintenance schedule without exact defect evidence.',
    summary: 'Held the soft-top latch identity and required direct alignment, seal, frame and water-path proof before adjustment or parts.',
    citations: ['roadsterPress', 'datasets'],
  },
  [ids.waterPump]: {
    description: `MINI SI M01 12 16 provides extended coverage for a mechanical water pump on bounded N14, N16 and N18 populations that include certain R59 Roadsters. The bulletin expressly says that the extension does not apply to electric water pumps. It does not establish an electronic controller or electric-impeller failure, a universal pre-60,000-mile pattern, or the frozen preventive 50,000-60,000-mile replacement instruction. Exact engine, production date and VIN eligibility remain necessary.`,
    solution: `Identify the engine, production date and VIN, then pressure-test the cooling system and locate the actual leak or circulation fault. Separate the mechanical water pump, friction wheel or pulley, thermostat housing, hoses, radiator, fan control and unrelated electrical cooling components under the MINI test plan. Replace only the confirmed failed component using the VIN-specific catalog. Do not buy part 11 51 7 632 426, an electric pump, thermostat kit or preventive 50,000-60,000-mile service from this page; the source documents a mechanical water pump and expressly excludes electric water-pump coverage.`,
    symptoms: ['engine, production date and VIN eligibility verified', 'cooling system pressure-tested and leak source located', 'mechanical pump, friction drive, thermostat, hose, radiator and fan paths separated'],
    affectedSystems: ['engine-driven mechanical water pump', 'water-pump friction drive and pulley', 'thermostat housing, hoses, radiator and cooling-fan control'],
    evidence: ['SI M01 12 16 includes bounded R59 N14/N16/N18 populations for mechanical water-pump coverage.', 'The bulletin expressly states that the extension does not apply to electric water pumps.', 'The frozen electric-controller mechanism, preventive interval, specific part and universal year scope are not established.'],
    conflict: 'The indexed electric-water-pump identity contradicts the exact manufacturer source, which addresses a mechanical pump and excludes electric pumps.',
    summary: 'Held the indexed water-pump identity while blocking the false electric-pump mechanism and requiring VIN-specific cooling diagnosis.',
    citations: ['roadsterTechnical', 'mechanicalWaterPump', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'MINI', model: 'Roadster', slug: 'roadster', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
  outputFile: 'data/known-issue-mini-roadster-adjudication-2026-08-10.json',
  ids, allIds, retainedIds: [],
  reportCountCleanupIds: [ids.clutchDmf],
  modelAliases: ['ROADSTER', 'COOPER ROADSTER', 'COOPER S ROADSTER', 'JOHN COOPER WORKS ROADSTER', 'JCW ROADSTER'],
  searchTerms: ['timing chain', 'chain tensioner', 'turbo oil', 'oil return line', 'oil feed', 'clutch', 'flywheel', 'dual mass flywheel', 'soft top', 'roof', 'latch', 'striker', 'water leak', 'water pump', 'coolant pump', 'overheating'],
  relevantDocumentIds, campaigns, pdfSources, otherSources: { datasets },
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 9, '2015-2019': 98, '2020-2024': 7, '2025-2026': 2 },
    totalRows: 116,
    relevantRowCount: 9,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 0 },
    totalRows: 0,
    campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The exact Roadster alias set contains no recall matching the four frozen identities, and the reviewed communications do not establish the frozen owner-frequency claims.',
  },
  content,
  requiredProse: [
    { id: ids.timingTurboOil, field: 'description', patterns: ['does not include R59 or N18', 'two unrelated conditions'] },
    { id: ids.clutchDmf, field: 'description', patterns: ['produced through November 2012', 'Neither source establishes recurring clutch and flywheel failure'] },
    { id: ids.clutchDmf, field: 'solution', patterns: ['replacement is justified only', 'Do not buy a complete clutch kit'] },
    { id: ids.softTopLatch, field: 'description', patterns: ['does not establish recurring latch or striker wear', 'manually operated soft-top architecture'] },
    { id: ids.waterPump, field: 'description', patterns: ['does not apply to electric water pumps', 'mechanical water pump'] },
  ],
  observations: [
    { code: 'all-roadster-identities-held', severity: 'identity-hold', recordIds: allIds, detail: 'All four indexed identities exceed the exact R59 component, engine, production-window or defect evidence and remain frozen.' },
    { code: 'electric-water-pump-mechanism-blocked', severity: 'technical-accuracy', recordIds: [ids.waterPump], detail: 'The manufacturer program covers a mechanical pump and explicitly excludes electric water pumps.' },
    { code: 'older-n14-evidence-not-transferred', severity: 'engine-scope', recordIds: [ids.timingTurboOil], detail: 'Older N14 timing and turbo-oil actions are not transferred to the indexed R59 N18 combined identity.' },
    { code: 'conditional-clutch-and-dmf-gates', severity: 'repair-safety', recordIds: [ids.clutchDmf], detail: 'Clutch and flywheel replacement remains conditional on exact production scope, inspection and measured limits.' },
    { code: 'invented-owner-count-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: [ids.clutchDmf], detail: 'The nonzero owner total lacks auditable report records and is proposed as unknown zero.' },
    { code: 'all-roadster-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Roadster page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
