/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  earlyOil: 'nissan-350z-oil-consumption-2003',
  revUpOil: 'nissan-350z-oil-consumption-2007',
  nats: 'nissan-350z-steering-lock-nats-2003',
  window: 'nissan-350z-window-regulator-2003',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze(['10009363', '10023399', '10024077', '633683']);
const campaigns = Object.freeze(['03V455000', '05V555000', '06E049000', '08V521000', '11E024000']);
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
});

function held({ description, solution, symptoms, systems, evidence, conflict, summary }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations: ['datasets'],
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.earlyOil]: held({
    description: `The exact 159-row Nissan 350Z manufacturer-communication corpus contains two records for low engine-oil level, but both are limited to specific 2005-2006 vehicles. They do not establish the frozen 2003-2006 "pre-revision" VQ35DE population, one-quart-per-1,000-to-2,000-mile rate, thin piston rings, catalytic-converter suction through the PCV system or a 2005 revision as the cause. This page also overlaps the separate 2005-2006 Rev-Up oil URL.`,
    solution: `Verify the exact engine, transmission, trim and VIN, measure oil level by the service procedure, document distance and oil added, and eliminate external leakage before a controlled consumption test. Check crankcase ventilation, compression, leak-down, plugs and catalyst condition only as the results require. Do not buy oil, a filter, PCV valve, catch can, rings or an engine repair from this page or change viscosity as a substitute for diagnosis; the consumption rate, cause and exact Nissan procedure must be proven first.`,
    symptoms: ['engine, transmission, trim and VIN identified', 'oil level and added quantity measured over a controlled interval', 'external leak, ventilation, ring and catalyst paths separated'],
    systems: ['engine lubrication and oil-level measurement', 'piston rings, cylinders and crankcase ventilation', 'spark plugs and catalytic converters'],
    evidence: ['The two exact oil-level communications are limited to 2005-2006, not the frozen 2003-2006 population.', 'No exact source supports the frozen mechanism, rate or 2005 revision narrative.', 'This page overlaps the separate Rev-Up oil-consumption URL.'],
    conflict: 'The indexed page expands a bounded 2005-2006 oil-level bulletin to 2003-2006 and asserts unsupported mechanisms, rates and remedies.',
    summary: 'Held the overbroad early-engine oil identity and required a controlled measurement before parts or viscosity advice.',
  }),
  [ids.revUpOil]: held({
    description: `NHTSA communication records 10023399 and 10024077 establish that Nissan issued guidance for low engine-oil level on 2005-2006 350Z vehicles. The exact applied population is narrower than every 2005-2006 car, and the records do not support the frozen claim that failed front-cover oil-gallery gaskets cause oil consumption. An internal gallery leak can affect pressure without consuming oil externally, so consumption, pressure and sealing diagnoses must not be merged.`,
    solution: `Confirm the exact trim, transmission and VIN against the applicable Nissan bulletin before using it. Measure oil level and added quantity over the prescribed interval after eliminating external leaks; separately measure hot oil pressure and perform compression or leak-down testing only if indicated. Do not buy oil, a filter, gallery gaskets, a timing-cover kit, catalytic converters, piston rings or an engine from this page; bulletin applicability and the measured loss or pressure path must be proven first.`,
    symptoms: ['bulletin population and VIN applicability checked', 'oil consumption measured after external-leak inspection', 'oil pressure, gallery sealing, rings and catalyst condition separated'],
    systems: ['engine oil level and consumption measurement', 'front-cover oil passages and pressure', 'piston rings, cylinders, plugs and catalysts'],
    evidence: ['10023399 and 10024077 are exact 2005-2006 low-oil-level communications.', 'The frozen row does not preserve the bulletin’s narrower trim/transmission population.', 'The exact summaries do not establish gallery-gasket leakage as the consumption mechanism.'],
    conflict: 'The indexed page has bounded primary evidence but overstates the population and incorrectly combines oil consumption with an internal oil-pressure gasket path.',
    summary: 'Held the overbroad Rev-Up oil identity while preserving the exact 2005-2006 low-oil-level bulletin boundary.',
  }),
  [ids.nats]: held({
    description: `Manufacturer communication 633683 covers a 2003 350Z engine no-start/NVIS-NATS system description and key registration. It does not establish recurring antenna-ring failure, ECU lockout, mechanical steering-lock binding or one 2003-2009 module defect. The frozen title combines immobilizer authentication with a mechanical steering-lock identity, and its cited NTB06-071 label is not the exact 350Z communication surfaced by the corpus.`,
    solution: `Identify whether the key will rotate, whether the starter operates and how the security indicator behaves. Preserve NATS codes and use the exact model-year procedure to test key registration, antenna/immobilizer communication, power, grounds, ignition-switch inputs and ECM authorization; diagnose a mechanical lock separately. Do not buy a starter, relay, multimeter, antenna ring, steering-lock module, key or ECM from this page; the exact no-start stage, code and compatible security component must be proven first.`,
    symptoms: ['key rotation, crank state and security indicator documented', 'NATS codes and authorization state preserved', 'mechanical lock, key, antenna, immobilizer, ECM and starter paths separated'],
    systems: ['NVIS/NATS key authentication', 'immobilizer antenna, ECM and registration', 'ignition cylinder, mechanical lock and starter circuit'],
    evidence: ['633683 is limited to a 2003 NATS description and key-registration procedure.', 'No exact communication establishes a 2003-2009 steering-lock-module failure identity.', 'The frozen NTB06-071 citation does not match the exact 350Z record.'],
    conflict: 'The indexed page expands one 2003 NATS service-information record to seven years and merges electronic authentication with mechanical steering lock.',
    summary: 'Held the combined NATS/steering-lock identity and removed unrelated starter, relay and tool commerce.',
  }),
  [ids.window]: held({
    description: `Communication 10009363 documents a window-regulator-motor reset procedure for 2003-2004 350Z vehicles. A reset procedure does not prove recurring motor wear, frayed regulator cables, stripped gears, windows falling into the door or a 2003-2009 assembly-failure population. The frozen page expands both years and mechanism beyond the exact record and prescribes a complete assembly without distinguishing initialization, glass adjustment, switch, motor and regulator faults.`,
    solution: `Confirm model year and reproduce the exact window behavior. Follow the applicable reset/initialization procedure first, then test switch input, power, ground, motor current, glass alignment, anti-pinch operation and regulator motion before removing the door trim. Do not buy a regulator/motor assembly, switch, lubricant, glass or weatherstrip from this page; reset status, failed electrical or mechanical path and exact door fitment must be proven first.`,
    symptoms: ['model year and reset status identified', 'switch, power, ground and motor current measured', 'initialization, glass alignment, motor and regulator paths separated'],
    systems: ['power-window switch and control logic', 'window motor and regulator mechanism', 'frameless glass alignment, anti-pinch and weather sealing'],
    evidence: ['10009363 supports only a 2003-2004 window-motor reset procedure.', 'A reset procedure is not proof of motor or regulator failure.', 'No exact source supports expanding the identity through 2009 or the frozen price claims.'],
    conflict: 'The indexed page converts a two-year reset procedure into a seven-year regulator-and-motor failure identity.',
    summary: 'Held the overbroad window identity and made initialization and measured electrical/mechanical findings control repair.',
  }),
});

module.exports = Object.freeze({
  make: 'Nissan', model: '350Z', slug: '350z', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-350z-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['350Z'],
  searchTerms: ['oil consumption', 'engine oil', 'oil pressure', 'oil gallery', 'piston ring', 'NATS', 'immobilizer', 'steering lock', 'no start', 'window regulator', 'power window', 'window motor'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 68, '2005-2009': 15, '2010-2014': 14, '2015-2019': 35, '2020-2024': 25, '2025-2026': 2 },
    totalRows: 159,
    relevantRowCount: 4,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 10, post: 4 },
    totalRows: 14,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The five exact recall identities concern 2003 sensors, a 2003-2004 fuel-filler hose, aftermarket lamps, 2007-2008 occupant classification and an aftermarket clutch kit. None supports the four frozen oil, NATS/steering-lock or window identities.',
  },
  content,
  requiredProse: [
    { id: ids.earlyOil, field: 'description', patterns: ['limited to specific 2005-2006', 'do not establish.*2003-2006', 'overlaps the separate 2005-2006 Rev-Up'] },
    { id: ids.revUpOil, field: 'description', patterns: ['10023399 and 10024077', 'narrower than every 2005-2006 car', 'must not be merged'] },
    { id: ids.nats, field: 'description', patterns: ['633683.*2003', 'does not establish.*2003-2009', 'NTB06-071.*not the exact'] },
    { id: ids.window, field: 'description', patterns: ['10009363.*2003-2004', 'does not prove recurring', 'expands both years and mechanism'] },
  ],
  observations: [
    { code: 'all-four-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every frozen identity expands exact primary evidence or combines distinct failure paths and remains published pending identity policy.' },
    { code: 'oil-population-not-expanded', severity: 'population-safety', recordIds: [ids.earlyOil, ids.revUpOil], detail: 'Two 2005-2006 low-oil-level communications are not expanded to all 2003-2006 engines or converted into an unsupported gallery-gasket mechanism.' },
    { code: 'service-procedure-not-failure-proof', severity: 'technical-accuracy', recordIds: [ids.nats, ids.window], detail: 'A 2003 NATS description and 2003-2004 window reset procedure are not treated as proof of seven-year component-failure identities.' },
    { code: 'unsupported-commerce-cleared-in-proposal', severity: 'commerce-safety', recordIds: allIds, detail: 'Oils, filters, catch cans, starters, relays, tools and regulator assemblies are removed until exact diagnosis and fitment are proven.' },
    { code: 'all-350z-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No 350Z page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
