/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  rearAc: 'nissan-quest-ac-rear-2011',
  cvtFailure: 'nissan-quest-cvt-failure-2011',
  slidingDoor: 'nissan-quest-power-sliding-door-failure-2004',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.cvtFailure, ids.rearAc].sort());
const relevantDocumentIds = Object.freeze([
  '10003510', '10006099', '10008735', '10016791', '10031244', '10045999',
  '10091528', '10109202', '10109205', '10109240', '10109242', '10109243',
  '10123346', '10133202', '10133203', '10134847', '10144504', '10144509',
  '10144518', '10152014', '10152510', '10158426', '10158427', '10158429',
  '10161345', '10167322', '10167360', '10167364', '10167365', '10173604',
  '10173605', '10173606', '10180992', '10185451', '10188358', '10188363',
  '10190200', '10192793', '10192816', '10192833', '10192841', '10194173',
  '10194179', '10194180', '10194181', '10200015', '10206372', '10211993',
  '10218743', '10237563', '10237565', '10248651', '11001192', '11001202',
  '53579', '600623', '628213', '628997', '629172', '630795',
]);
const campaigns = Object.freeze([
  '00V228005', '00V292002', '00V338002', '00V419001', '04V103000', '04V186000',
  '05V474000', '05V480000', '07V248000', '08V187000', '10V072000', '12V076000',
  '23V067000', '92V132001', '92V133001', '92V172002', '95V222002', '96V089002',
  '96V253004', '97V184002', '98V012002', '99V056002', '99V205002', '99V347002',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.rearAc]: held({
    description: `The exact Quest manufacturer corpus contains rear-air-conditioning warm-air communications for 1999-2002 vehicles, not a 2011-2017 rear-evaporator and expansion-valve failure population. It does not establish premature evaporator leakage, a stuck expansion valve, repeated refrigerant loss or the asserted repair prices for the frozen generation. The listed P0440-P0456 codes are evaporative-emissions codes and do not diagnose an air-conditioning refrigerant fault. The frozen 290-owner total is unsupported.`,
    solution: `Record vent temperatures and control settings, recover and measure refrigerant with approved equipment, leak-test the complete circuit, and verify front and rear pressure, airflow, blend-door and expansion-device operation before disassembly. Do not buy an evaporator, expansion valve, refrigerant, compressor or rear HVAC assembly from this page; the leak or airflow path, refrigerant specification and VIN fitment must be established first.`,
    symptoms: ['front and rear vent temperatures measured separately', 'refrigerant leak and airflow paths tested', 'EVAP-emissions codes excluded from A/C diagnosis'],
    systems: ['front and rear refrigerant circuit', 'rear evaporator and expansion device', 'rear blower, controls and air distribution'],
    evidence: ['The exact rear-A/C communications cover 1999-2002, not 2011-2017.', 'No exact source identifies the evaporator and expansion valve as one failure identity.', 'P0440-P0456 and the 290-owner total are unsupported for this A/C condition.'],
    conflict: 'The indexed page borrows an earlier-generation warm-air communication and unrelated EVAP codes to support a later seven-year component-failure identity.',
    summary: 'Held the unsupported rear-A/C identity and removed the fabricated 290-owner total, wrong DTCs and component-price claims.',
  }),
  [ids.cvtFailure]: held({
    description: `Nissan NTB17-039R documents a CVT-judder diagnostic path for 2015-2017 Quest V6 vehicles only when judder is reported and P17F0 or P17F1 is stored. It does not establish CVT failure under passenger or cargo load across 2011-2017, a transmission designed for lighter vehicles, overheating caused by minivan weight, or a 60,000-120,000-mile failure window. The bulletin does not support a universal 30,000-mile fluid interval, aftermarket cooler or complete replacement. The frozen 520-owner total is unsupported.`,
    solution: `Preserve every DTC and freeze-frame record, document load, speed and temperature, verify fluid level and specification by the service procedure, and apply NTB17-039R only to an eligible 2015-2017 vehicle with reported judder and P17F0 or P17F1. Diagnose overheating, delayed engagement and loss of drive separately. Do not buy NS-3 fluid, a cooler, valve body, torque converter or CVT from this page; model year, DTC branch, failure location and VIN fitment must be established first.`,
    symptoms: ['judder separated from overheating, slip and loss of drive', 'load, speed, temperature and DTCs documented', '2015-2017 P17F0/P17F1 branch kept separate from 2011-2014'],
    systems: ['Quest continuously variable transmission', 'TCM and control valve', 'CVT cooling and hydraulic circuits'],
    evidence: ['NTB17-039R is limited to 2015-2017 Quest V6 with reported judder and P17F0/P17F1.', 'It does not prove load-caused full failure across 2011-2017.', 'No exact source supports the mileage, interval, cooler, prices or 520-owner total.'],
    conflict: 'The indexed page expands a three-year DTC-gated judder bulletin into seven years of load-induced complete CVT failure.',
    summary: 'Held the overbroad Quest CVT-failure identity and removed the fabricated 520-owner total and universal cooler/interval advice.',
    citations: ['cvtBulletin', 'datasets'],
  }),
  [ids.slidingDoor]: held({
    description: `Quest communications document separate, bounded conditions: 2004-2005 sliding-door adjustment and initialization, 2004-2007 motor or cable replacement procedures, and a 2012 lock-only condition caused by the Extended Storage Switch being in delivery mode. They do not establish motor, cable and latch failure as one 2004-2017 identity or prove doors open unexpectedly while driving. NHTSA 15V-595 is an unrelated 2016 Chrysler Town and Country and Dodge Grand Caravan hood-striker recall, not a Quest sliding-door recall.`,
    solution: `Disable power operation as the owner manual directs when movement is unsafe, identify the affected side, and inspect initialization, alignment, rollers, cable, motor, latch, striker, wiring and control inputs through the exact service procedure. Treat any door that will not remain latched as unsafe until professionally inspected. Do not buy a motor, cable, latch, roller or lubricant from this page; side, model year, failed subsystem and VIN fitment must be established first.`,
    symptoms: ['affected side and direction of failure documented', 'initialization, alignment and delivery-mode causes checked', 'motor, cable, latch and control paths tested separately'],
    systems: ['power sliding-door motor and cable', 'latch, striker, rollers and alignment', 'door control, wiring and Extended Storage Switch'],
    evidence: ['Exact communications cover separate 2004-2007 and 2012 conditions, not one 2004-2017 failure.', 'No Quest recall in the 59-row corpus matches unexpected sliding-door opening.', '15V-595 concerns Chrysler/Dodge hood-striker bolts.'],
    conflict: 'The indexed page combines multiple generations and subsystems and assigns an unrelated Chrysler/Dodge hood recall to Quest.',
    summary: 'Held the conflated sliding-door identity and removed the false 15V-595 citation, universal lubrication interval and price claims.',
    citations: ['unrelatedRecall15V595', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  cvtBulletin: { title: 'Nissan NTB17-039R - 2015-2017 Quest P17F0/P17F1 CVT Judder', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001202-0001.pdf', sha256: 'f372539f8c04019b8f9224d8d788257f50e6b5cc03a70c6b7375156c5528684a', pageCount: 118, visuallyReviewedPages: [1, 2, 118] },
});
function recallApi(campaign, title, contains) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  unrelatedRecall15V595: recallApi('15V595000', 'NHTSA Recall 15V595000 - Chrysler/Dodge Hood Striker Bolts', 'hood striker'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Quest', slug: 'quest', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-quest-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['QUEST'],
  searchTerms: ['rear A/C', 'rear air condition', 'evaporator', 'expansion valve', 'CVT', 'P17F0', 'P17F1', 'sliding door', 'door motor', 'door latch', 'door cable', 'power door'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 49, '2000-2004': 87, '2005-2009': 29, '2010-2014': 29, '2015-2019': 127, '2020-2024': 73, '2025-2026': 2 },
    totalRows: 396,
    relevantRowCount: 60,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 31, post: 28 },
    totalRows: 59,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete 59-row Quest recall corpus contains no 15V-595 sliding-door campaign. The cited campaign is an unrelated Chrysler/Dodge hood-striker recall.',
  },
  content,
  requiredProse: [
    { id: ids.rearAc, field: 'description', patterns: ['1999-2002', 'not a 2011-2017', 'P0440-P0456'] },
    { id: ids.cvtFailure, field: 'description', patterns: ['2015-2017 Quest', 'P17F0 or P17F1', '520-owner total'] },
    { id: ids.slidingDoor, field: 'description', patterns: ['do not establish motor, cable and latch failure', '15V-595 is an unrelated', 'hood-striker recall'] },
  ],
  observations: [
    { code: 'three-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All three frozen Quest identities remain published but blocked because their generation, component or mechanism exceeds exact primary evidence.' },
    { code: 'false-recall-15v595', severity: 'safety-accuracy', recordIds: [ids.slidingDoor], detail: '15V-595 is a Chrysler/Dodge hood-striker recall, not a Quest sliding-door latch campaign.' },
    { code: 'wrong-ac-dtcs', severity: 'technical-accuracy', recordIds: [ids.rearAc], detail: 'P0440-P0456 are EVAP-emissions codes and do not diagnose a rear air-conditioning refrigerant condition.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Two unsupported owner totals totaling 810 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-quest-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Quest page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
