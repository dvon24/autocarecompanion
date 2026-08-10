/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  acCompressor: 'nissan-rogue-sport-ac-compressor-2017',
  cvt: 'nissan-rogue-sport-cvt-issues-2017',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.acCompressor]);
const relevantDocumentIds = Object.freeze([
  '10158426', '10158427', '10158429', '10165785', '10173602', '10173606',
  '10181002', '10190200', '10197104', '10199174', '10200015', '10206378',
  '10208951', '10211988', '10211992', '10218694', '10218741', '10227268',
  '10248650', '11001192',
]);
const campaigns = Object.freeze(['19V654000', '23V093000']);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}
const content = Object.freeze({
  [ids.acCompressor]: held({
    description: 'The complete Rogue Sport manufacturer corpus contains no exact 2017-2021 communication establishing compressor-clutch bearing wear, front-shaft-seal refrigerant loss or premature compressor failure as one model-wide defect. Intermittent cooling, squeal and failure to engage can come from refrigerant charge, pressure control, wiring, pulley/clutch, compressor or HVAC-command faults. The frozen 130-owner total is unsupported.',
    solution: 'Record vent temperature and operating conditions, measure refrigerant pressures and charge, leak-test the circuit, and verify compressor command, power, pulley and clutch operation before opening the system. Identify contamination before deciding whether any downstream component needs service. Do not buy a compressor, clutch, receiver-drier, condenser, seal or refrigerant kit from this page; the exact failure path and VIN fitment must be established first.',
    symptoms: ['vent temperature and command state documented', 'refrigerant leak and pressure paths tested', 'clutch, pulley and compressor faults separated'],
    systems: ['A/C compressor, pulley and clutch', 'refrigerant circuit and shaft sealing', 'HVAC controls, pressure sensing and wiring'],
    evidence: ['The complete 161-row communication corpus contains no exact compressor-clutch defect bulletin.', 'No source proves bearing wear and shaft-seal leakage as one 2017-2021 identity.', 'The frozen 130-owner total and universal replacement set are unsupported.'],
    conflict: 'The indexed title assigns a specific compressor-clutch failure across five years without an exact manufacturer or federal condition record.',
    summary: 'Held the unsupported Rogue Sport A/C compressor-clutch identity and removed the fabricated 130-owner total and universal replacement advice.',
  }),
  [ids.cvt]: held({
    description: 'Nissan NTB21-051A is limited to 2017-2019 Rogue Sport with the RE0F10D CVT and a listed DTC branch: P0776, P2813, P0841, P17F0, P17F1 or P1715. It explicitly does not apply to other DTCs, P1715 alone, P17F0/P17F1 without a reported judder, or an engine stall while selecting range. It does not establish belt/pulley wear, fast fluid degradation, premature complete failure or a 10-year/120,000-mile warranty across the frozen 2017-2022 identity.',
    solution: 'Preserve every DTC and freeze-frame record, document whether judder is actually reported, verify CVT fluid level/specification, and apply NTB21-051A only to an eligible 2017-2019 vehicle that passes its exact flow chart. The professional procedure uses belt-slip inspection, clutch end-play calculation, control-valve or subassembly branches and TCM programming as directed; it is not a generic fluid-reset or replacement recipe. Do not buy NS-3 fluid, a valve body, torque converter, CVT or cooler from this page; model year, DTC branch, inspection result and VIN fitment must be established first.',
    symptoms: ['judder separated from hesitation, slip and loss of drive', 'listed DTC and exclusion branches preserved', '2017-2019 bulletin scope separated from 2020-2022'],
    systems: ['RE0F10D CVT mechanical subassembly', 'control valve and TCM calibration', 'CVT fluid level and hydraulic pressure'],
    evidence: ['NTB21-051A applies to 2017-2019 Rogue Sport only.', 'The bulletin requires listed DTCs and excludes several superficially similar conditions.', 'No exact source supports the 2020-2022 expansion, universal mechanism, costs or 10-year/120,000-mile warranty claim.'],
    conflict: 'The indexed title expands a three-year, DTC-gated professional diagnostic bulletin into six years of generic judder and premature complete transmission failure.',
    summary: 'Held the overbroad Rogue Sport CVT identity and replaced generic replacement and price advice with the exact DTC-gated diagnostic boundary.',
    citations: ['cvtBulletin', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  cvtBulletin: {
    title: 'Nissan NTB21-051A - 2017-2019 Rogue Sport CVT DTC Diagnostic Flow',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10206378-0001.pdf',
    sha256: 'fbdb78499230f7587c574d1618c35c5bbdf3e3b84356ea7d021733635c009f22',
    pageCount: 99,
    visuallyReviewedPages: [1, 2, 99],
  },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Rogue Sport', slug: 'rogue-sport', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-rogue-sport-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['ROGUE SPORT'],
  searchTerms: ['A/C', 'air condition', 'compressor', 'clutch', 'CVT', 'transmission', 'shudder', 'judder', 'P17F0', 'P17F1', 'fluid', 'valve body'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 22, '2020-2024': 133, '2025-2026': 6 },
    totalRows: 161, relevantRowCount: 20, uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 8 }, totalRows: 8,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete eight-row Rogue Sport recall corpus contains only 19V-654 and 23V-093; neither establishes the frozen A/C compressor or generic CVT failure identity.',
  },
  content,
  requiredProse: [
    { id: ids.acCompressor, field: 'description', patterns: ['no exact 2017-2021', '130-owner total'] },
    { id: ids.cvt, field: 'description', patterns: ['2017-2019 Rogue Sport', 'does not apply', '10-year/120,000-mile'] },
    { id: ids.cvt, field: 'solution', patterns: ['belt-slip inspection', 'not a generic fluid-reset'] },
  ],
  observations: [
    { code: 'two-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both Rogue Sport identities remain published but blocked because the frozen component, generation or failure scope exceeds exact primary evidence.' },
    { code: 'cvt-years-and-dtc-gate', severity: 'technical-accuracy', recordIds: [ids.cvt], detail: 'NTB21-051A is 2017-2019 and DTC-gated; it does not support the frozen 2017-2022 generic complete-failure identity or 10-year/120,000-mile claim.' },
    { code: 'fabricated-owner-total-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'The unsupported 130-owner A/C total is reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-rogue-sport-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Rogue Sport page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
