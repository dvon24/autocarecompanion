/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  alternator: 'nissan-stanza-alternator-failure-1990',
  transmission: 'nissan-stanza-auto-transmission-failure-1990',
  distributor: 'nissan-stanza-distributor-failure-1990',
  oilLeak: 'nissan-stanza-oil-leak-1990',
  timingChain: 'nissan-stanza-timing-belt-failure-1990',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.timingChain]);
const reportCountCleanupIds = Object.freeze([ids.distributor]);
const relevantDocumentIds = Object.freeze(['10025522', '10032506', '10188377', '10192145', '10206391', '39921']);
const campaigns = Object.freeze(['82V035000', '86V101000', '90V072000', '95V244000']);

function held({ description, solution, symptoms, systems, evidence, conflict, summary }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary,
    citations: ['datasets'],
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}
function retained({ description, solution, symptoms, systems, evidence, summary }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict: null, summary,
    citations: ['datasets'],
    commerceDecision: 'failure path, engine identity and VIN fitment remain diagnostic boundaries; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.alternator]: held({
    description: 'The complete 25-row Stanza manufacturer corpus contains no alternator defect communication for 1990-1992. The frozen page asserts premature regulator and brush wear at 70,000-100,000 miles, heat-caused failure, undercharge/overcharge consequences and a fixed voltage range from one video rather than exact Nissan primary evidence.',
    solution: 'Document the complaint and battery state, measure key-off drain, cranking voltage and charging voltage/current under load, then test the belt, wiring, grounds, battery and alternator before replacement. Do not buy an alternator, belt, battery, charger or wiring kit from this page; failed circuit, output specification and exact fitment must be established first.',
    symptoms: ['no-charge, undercharge and overcharge separated', 'battery, belt, wiring and alternator tested under load', 'parasitic drain excluded before replacement'],
    systems: ['alternator and internal regulation', 'battery and starting/charging cables', 'drive belt, grounds and vehicle loads'],
    evidence: ['No Stanza alternator communication appears in the exact manufacturer corpus.', 'A video does not establish a three-year failure population.', 'No primary source supports the mileage, voltage or universal belt/battery replacement claims.'],
    conflict: 'The indexed page turns generic charging-system diagnosis into a premature alternator defect across 1990-1992.',
    summary: 'Held the unsupported Stanza alternator identity and removed mileage, price and automatic belt/battery replacement advice.',
  }),
  [ids.transmission]: held({
    description: 'The exact manufacturer corpus contains no 1990-1992 Stanza communication establishing torque-converter and forward-clutch-pack failure as one automatic-transmission defect. The frozen page attributes failure to marginal KA24E capacity, aggressive driving and towing, while its cited TSB URL is not represented in the sanctioned source inventory and the listed OBD-II codes postdate this vehicle generation.',
    solution: 'Identify the transmission, record shift behavior by gear and temperature, verify fluid level/condition and linkage, and separate hydraulic pressure, electrical control, converter, clutch and engine-performance causes through the correct service procedure. Do not buy ATF, a flush kit, torque converter or transmission from this page; transmission identity, failure location and exact fitment must be established first.',
    symptoms: ['slip, flare, harsh shift and loss of drive separated', 'fluid, linkage and hydraulic pressure checked', 'unsupported OBD-II codes excluded'],
    systems: ['four-speed automatic transmission', 'torque converter and clutch packs', 'hydraulic controls, linkage and fluid'],
    evidence: ['No matching 1990-1992 transmission defect row appears in the 25-row corpus.', 'P0700/P0741/P0751 are not primary proof for this pre-OBD-II identity.', 'No exact source supports the capacity, towing or universal rebuild claims.'],
    conflict: 'The indexed page combines several internal components, speculative causes and an anachronistic DTC set into one three-year failure identity.',
    summary: 'Held the unsupported Stanza automatic-transmission identity and removed false DTC, flush and universal rebuild advice.',
  }),
  [ids.distributor]: held({
    description: 'The complete Stanza manufacturer and recall corpus contains no 1990-1992 distributor defect communication. The frozen page combines internal coil, ignition module and optical pickup failure as one identity, claims parts scarcity and prescribes a remanufactured assembly plus cap, rotor, wires and coil. The frozen 100-owner total is unsupported.',
    solution: 'Capture the no-start or stall, verify spark and injector triggering, inspect distributor power, ground, pickup signal, shaft play, cap, rotor, coil and module, and separate fuel or mechanical timing before replacement. Do not buy a distributor, cap, rotor, wires, coil or module from this page; failed circuit and exact fitment must be established first.',
    symptoms: ['spark and injector trigger documented', 'pickup, coil and module paths tested separately', 'fuel and mechanical timing excluded'],
    systems: ['distributor pickup and shaft', 'ignition coil and module', 'cap, rotor, wiring and engine timing'],
    evidence: ['No distributor communication appears in the exact corpus.', 'No primary source proves simultaneous coil/module/pickup failure.', 'No source supports 100 owner reports or one universal remanufactured assembly.'],
    conflict: 'The indexed page merges multiple ignition components and parts-availability claims into one defect identity without primary evidence.',
    summary: 'Held the unsupported distributor identity and removed the fabricated 100-owner total and universal ignition-parts replacement.',
  }),
  [ids.oilLeak]: held({
    description: 'The sanctioned manufacturer corpus does not establish valve-cover, oil-pan, rear-main and front-crank-seal leakage as one 1990-1992 KA24E defect identity. P0171, P0174 and P0420 are fuel-mixture/catalyst codes and do not diagnose an engine-oil leak. A generic repair video does not prove the listed locations or a model-wide failure population.',
    solution: 'Clean the engine, verify the oil level and leak rate, trace the highest fresh source with dye when needed, check crankcase ventilation, and distinguish valve-cover, front-cover, pan, crank-seal and transmission-bellhousing paths before disassembly. Do not buy gaskets, seals, oil, filter or engine parts from this page; leak source, engine identity and exact fitment must be established first.',
    symptoms: ['fresh leak source traced from the highest point', 'external leakage separated from consumption', 'fuel/catalyst DTCs excluded from oil-leak diagnosis'],
    systems: ['valve cover and front engine sealing', 'oil pan and crankshaft seals', 'crankcase ventilation and bellhousing interface'],
    evidence: ['No exact oil-leak communication appears in the 25-row corpus.', 'P0171/P0174/P0420 do not identify an oil leak.', 'No primary source supports all four locations as one model-wide defect.'],
    conflict: 'The indexed page converts ordinary age-related sealing possibilities and unrelated DTCs into one three-year defect.',
    summary: 'Held the conflated Stanza oil-leak identity and removed unrelated DTCs and universal gasket/seal assumptions.',
  }),
  [ids.timingChain]: retained({
    description: 'NHTSA manufacturer-communication record 39921 applies to 1990-1992 Stanza and states that the KA24E tension-side timing-chain guide is broken. That exact row supports the frozen title, engine and year identity. It does not establish a 150,000-mile preventive interval, universal chain jump, oil-pickup blockage, interference status or automatic water-pump and seal replacement.',
    solution: 'Confirm the KA24E engine and locate the rattle or timing fault, inspect chain slack, tensioner operation, guide damage, valve timing and oil-pan debris through the correct service procedure, and repair only the documented components. Do not buy a timing-chain kit, guides, tensioner, water pump or seals from this page; inspection result and exact fitment must be established first.',
    symptoms: ['timing-cover noise localized', 'chain slack, guide and tensioner condition inspected', 'valve timing and debris checked'],
    systems: ['KA24E timing chain', 'tension-side guide and tensioner', 'front cover, lubrication and valve timing'],
    evidence: ['Communication 39921 exactly names 1990-1992 Stanza.', 'Its summary exactly identifies a broken KA24E tension-side timing-chain guide.', 'The source does not support the frozen mileage, collateral-damage or bundled-parts claims.'],
    summary: 'Retained the exact 1990-1992 KA24E timing-chain-guide identity and removed unsupported interval, damage and bundled-parts claims.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Stanza', slug: 'stanza', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-stanza-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['STANZA'],
  searchTerms: ['carburetor', 'choke', 'fuel injection', 'fuel injector', 'timing chain', 'chain guide', 'head gasket', 'overheat', 'automatic transmission', 'transmission', 'strut', 'suspension', 'rust', 'corrosion', 'stall', 'no start'],
  relevantDocumentIds,
  campaigns,
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 2, '2000-2004': 0, '2005-2009': 2, '2010-2014': 4, '2015-2019': 5, '2020-2024': 12, '2025-2026': 0 },
    totalRows: 25,
    relevantRowCount: 6,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 8, post: 0 },
    totalRows: 8,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The eight-row Stanza recall corpus contains brake-pedal, filler-pipe, tire-label and salt-region filler-tube corrosion campaigns; none establishes the four held powertrain/electrical identities. Communication 39921 separately supports the 1990-1992 KA24E timing-chain-guide title.',
  },
  content,
  requiredProse: [
    { id: ids.alternator, field: 'description', patterns: ['no alternator defect communication', '70,000-100,000 miles'] },
    { id: ids.transmission, field: 'description', patterns: ['no 1990-1992 Stanza communication', 'OBD-II codes postdate'] },
    { id: ids.distributor, field: 'description', patterns: ['no 1990-1992 distributor defect communication', '100-owner total'] },
    { id: ids.oilLeak, field: 'description', patterns: ['P0171, P0174 and P0420', 'do not diagnose an engine-oil leak'] },
    { id: ids.timingChain, field: 'description', patterns: ['record 39921', '1990-1992 Stanza', 'KA24E tension-side timing-chain guide'] },
  ],
  observations: [
    { code: 'one-identity-retained-four-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only the exact 1990-1992 KA24E timing-chain-guide communication clears the full title, engine and year gate; the other four pages remain published but held.' },
    { code: 'anachronistic-transmission-dtcs', severity: 'technical-accuracy', recordIds: [ids.transmission], detail: 'The frozen pre-OBD-II automatic-transmission page carries P0700/P0741/P0751 without exact primary support.' },
    { code: 'unrelated-oil-leak-dtcs', severity: 'technical-accuracy', recordIds: [ids.oilLeak], detail: 'P0171/P0174/P0420 are fuel-mixture/catalyst codes, not oil-leak location evidence.' },
    { code: 'fabricated-owner-total-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'The unsupported 100-owner distributor total is reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'secondary-video-citations-rejected', severity: 'source-safety', recordIds: [ids.alternator, ids.oilLeak, ids.timingChain], detail: 'Generic or unverifiable video links are not used as manufacturer defect evidence.' },
    { code: 'all-stanza-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Stanza page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
