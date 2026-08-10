/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  evaporatorLeak: 'mitsubishi-mirage-ac-evaporator-leak',
  cvtReliability: 'mitsubishi-mirage-cvt-reliability',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze([
  '10058827', '10109106', '10117841', '10136628', '10144156', '10152871',
  '10159648', '10159667', '10162635', '10180775', '10181900', '600327',
]);
const campaigns = Object.freeze([
  '00V311001', '01V340001', '04V428000', '06E026000', '06E065000',
  '09E012000', '09E025000', '15V594000', '15V815000', '16V675000',
  '17V686000', '19V330000', '95V103004', '97V063001', '97V073001',
  '97V179000',
]);
const pdfSources = Object.freeze({
  cvtShiftShock: {
    title: 'Mitsubishi TSB-17-23-003 - Shift Shock When Coming to a Stop or After a Complete Stop',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10109106-9999.pdf',
    sha256: '8905e95a494044cfc725924f57d0e2449e30a63575e0cd29e607f07958879d18',
    pageCount: 11,
    visuallyReviewedPages: [1, 2, 10, 11],
  },
});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
});

const content = Object.freeze({
  [ids.evaporatorLeak]: {
    description: `The reviewed 403-row exact Mirage and Mirage G4 manufacturer-communication corpus contains no record establishing recurring evaporator-core pinhole corrosion, dashboard-removal repairs or one 2014-2026 defect population. Communication 10058827 mentions A/C compressor issues without identifying an evaporator, while 10180775 and 10181900 address warranty handling for low or high refrigerant levels without identifying the leak source. Those records do not prove the frozen evaporator mechanism, recurrence claim or full model-year scope.`,
    solution: `Recover and weigh the refrigerant, verify the required charge and reproduce the cooling complaint. Use pressure testing, an electronic leak detector and dye only as the applicable service procedure permits, then inspect service ports, hoses, compressor, condenser, evaporator and drain evidence separately before assigning the leak. Do not buy an evaporator core, compressor, condenser, seal kit, refrigerant or corrosion additive from this page; the refrigerant type, exact leak location and failed component must be proven first.`,
    symptoms: ['refrigerant type and measured charge recorded', 'cooling complaint reproduced under controlled conditions', 'service-port, hose, compressor, condenser and evaporator paths separated'],
    affectedSystems: ['air-conditioning refrigerant circuit', 'evaporator, condenser and compressor', 'hoses, service ports and seals'],
    evidence: ['10058827 mentions A/C compressor issues but does not identify an evaporator-core defect.', '10180775 and 10181900 address low or high refrigerant levels without assigning the leak source.', 'No exact communication or recall proves pinhole corrosion, dashboard removal or a 2014-2026 recurring evaporator population.'],
    conflict: 'The indexed evaporator-core identity, corrosion mechanism and 2014-2026 population are not established by exact manufacturer or federal evidence.',
    summary: 'Held the unsupported evaporator-core identity and required measured-charge and exact leak-location proof before parts or additives.',
    citations: ['datasets'],
  },
  [ids.cvtReliability]: {
    description: `Mitsubishi TSB-17-23-003 documents a bounded shift shock on certain 2014-2017 Mirage and 2017 Mirage G4 CVTs caused by torque-converter-clutch disengagement timing or CVT-clutch engagement control, with a CVT ECU software update as the repair. Other exact records separately cover fluid-cooler-hose leakage, post-replacement learning or service procedures. They do not establish premature Jatco belt-and-pulley wear, failures beginning at 60,000 miles, extra stress from the 1.2-liter engine or one 2014-2026 reliability population.`,
    solution: `Identify the installed CVT, model year, VIN and software history, preserve codes and reproduce the exact complaint. On an applicable 2014-2017 vehicle, compare the stop-related shift-shock condition and ECU data with TSB-17-23-003, diagnosing other stored faults before reprogramming as the bulletin requires. Check the specified fluid and level, cooler and hoses, electrical power and control, pressure and speed data under the applicable service procedure. Do not buy fluid, a relay, cooler, hose, valve body, belt-and-pulley assembly or replacement CVT from this page; the exact population, maintenance requirement and failed software, hydraulic, electrical or mechanical path must be proven first.`,
    symptoms: ['installed CVT, VIN and software history verified', 'shift shock, leakage, slipping and noise complaints separated', 'codes, fluid, cooler, pressure, speed and control findings documented'],
    affectedSystems: ['CVT ECU and clutch engagement control', 'CVT fluid, cooler and hoses', 'CVT hydraulic, electrical and mechanical assemblies'],
    evidence: ['TSB-17-23-003 supports a narrow 2014-2017 stop-related shift-shock software condition.', '10136628 and 10144156 address cooler-hose leakage rather than complete CVT failure.', 'The exact corpus does not support the frozen 60,000-mile, engine-stress or 2014-2026 mechanical-longevity claims.'],
    conflict: 'The indexed reliability identity combines bounded software, leak and service records into an unsupported universal mechanical-failure claim.',
    summary: 'Held the overbroad CVT-reliability identity and separated software shift shock, leakage and mechanical diagnosis before parts.',
    citations: ['cvtShiftShock', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: 'Mirage', slug: 'mirage', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-mirage-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['MIRAGE', 'MIRAGE G4'],
  searchTerms: ['evaporator', 'A/C', 'air conditioner', 'air conditioning', 'refrigerant', 'evaporator leak', 'cooling performance', 'CVT', 'continuously variable', 'belt and pulley', 'CVT slipping', 'CVT shudder', 'CVT surge', 'CVT fluid', 'CVT ECU', 'acceleration delay'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 28, '2000-2004': 33, '2005-2009': 3, '2010-2014': 4, '2015-2019': 169, '2020-2024': 158, '2025-2026': 8 },
    totalRows: 403,
    relevantRowCount: 21,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 42, post: 15 },
    totalRows: 57,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Sixteen exact Mirage and Mirage G4 campaign identities exist. None establishes an evaporator-core corrosion defect or the frozen CVT mechanical-longevity identity.',
  },
  content,
  requiredProse: [
    { id: ids.evaporatorLeak, field: 'description', patterns: ['contains no record establishing recurring evaporator-core', 'do not prove the frozen evaporator mechanism'] },
    { id: ids.evaporatorLeak, field: 'solution', patterns: ['inspect service ports', 'Do not buy an evaporator core'] },
    { id: ids.cvtReliability, field: 'description', patterns: ['TSB-17-23-003', 'do not establish premature Jatco belt-and-pulley wear'] },
    { id: ids.cvtReliability, field: 'solution', patterns: ['diagnosing other stored faults before reprogramming', 'Do not buy fluid'] },
  ],
  observations: [
    { code: 'two-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both frozen identities materially exceed exact primary evidence and remain published pending identity policy.' },
    { code: 'ac-component-not-inferred', severity: 'technical-accuracy', recordIds: [ids.evaporatorLeak], detail: 'Low or high refrigerant and vague compressor communications are not converted into proof of evaporator-core corrosion.' },
    { code: 'cvt-conditions-separated', severity: 'technical-accuracy', recordIds: [ids.cvtReliability], detail: 'A bounded ECU shift-shock condition, cooler-hose leakage and service procedures remain separate from universal mechanical-longevity claims.' },
    { code: 'no-social-proof-introduced', severity: 'content-safety', recordIds: allIds, detail: 'Both frozen zero report counts remain unknown and are never rendered as owner totals.' },
    { code: 'all-mirage-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Mirage page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
