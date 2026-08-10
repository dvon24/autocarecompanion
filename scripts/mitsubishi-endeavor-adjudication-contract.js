/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  acCompressor: 'mitsubishi-endeavor-ac-compressor',
  transmission: 'mitsubishi-endeavor-transmission-issues',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze([
  '10001721', '10004580', '10006465', '10010502', '10013756',
  '10014174', '10014358', '10015215', '10015717',
]);
const campaigns = Object.freeze([
  '04V197000', '04V279000', '04V428000', '05V069000', '05V409000',
  '06V068000', '08V022000', '08V139000', '08V454000', '09V361000',
  '10V065000', '10V514000',
]);
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
});

const content = Object.freeze({
  [ids.acCompressor]: {
    description: `The reviewed 142-row Endeavor manufacturer-communication corpus contains exact records for 2004 expansion-valve noise and drain clearing and for a new three-wire A/C pressure sensor on 2004-2005 vehicles. It contains no communication establishing recurring premature compressor-clutch or internal-seal failure across 2004-2011, no 60,000-90,000-mile failure range, and no evidence that sharing a platform transfers another model's defect identity to Endeavor. The 2006-2008 manual-HVAC recall concerns controller signals and mode-door damage, not compressor failure.`,
    solution: `Reproduce the cooling or noise complaint and identify the installed HVAC system. Check refrigerant pressures and charge by weight, compressor command, clutch or control operation, power and ground, pressure-sensor data, belt drive, leak evidence, condenser airflow, evaporator drainage and the exact noise source before opening the circuit. Do not buy a compressor, receiver/drier, expansion valve, pressure sensor or refrigerant kit from this page; the failed component, contamination state and vehicle-specific repair procedure must be proven first.`,
    symptoms: ['exact cooling or noise complaint reproduced', 'refrigerant pressure, charge and leak state documented', 'compressor control, sensor, airflow and drainage paths separated'],
    affectedSystems: ['air-conditioning compressor and control', 'refrigerant pressure sensing and circuit', 'expansion valve, evaporator drainage and condenser airflow'],
    evidence: ['10004580 concerns expansion-valve noise rather than compressor failure.', '10013756 and 10014174 address a pressure sensor and drain passage, not a model-wide compressor defect.', 'No exact communication establishes the frozen mileage, shared-platform or universal component-replacement claims.'],
    conflict: 'The indexed compressor-failure identity is inferred from other models and extended across eight model years without exact Endeavor evidence.',
    summary: 'Held the unsupported compressor-failure identity and required system-level pressure, control, leak, airflow and noise diagnosis before parts.',
    citations: ['datasets'],
  },
  [ids.transmission]: {
    description: `Endeavor communications 10006465 and 10014358 address A/T shift delay on 2004-2005 or 2004 vehicles, while 10015215 and 10015717 address transaxle gear whine on 2004-2005 vehicles. Other exact records cover learned-value reset and automatic-transmission-fluid color. Those narrow conditions do not establish recurring harsh shifting and complete transmission failure across 2004-2011, a 100,000-130,000-mile failure range, premature clutch-pack wear, or inherited Galant and Eclipse reliability weaknesses.`,
    solution: `Identify the installed transaxle, model year, build data and repair or reprogramming history. Preserve codes and freeze-frame data, reproduce the exact delayed shift, harshness or whine, and compare commanded gear with input and output speeds, fluid level and condition, line pressure, learned values, mounts and driveline noise under the unit-specific procedure. Do not buy an auxiliary cooler, clutch pack, valve body, solenoid, rebuild kit or remanufactured transmission from this page; the narrow communication scope and failed software, hydraulic, mechanical or driveline path must be proven first.`,
    symptoms: ['transaxle identity and software history verified', 'exact shift delay, harshness or whine reproduced', 'codes, speeds, pressure, fluid and driveline paths separated'],
    affectedSystems: ['automatic transaxle and hydraulic controls', 'powertrain-control software and learned values', 'transaxle gearing, mounts and driveline noise paths'],
    evidence: ['10006465 and 10014358 support narrow shift-delay communications, not universal failure.', '10015215 and 10015717 identify gear whine on 2004-2005 vehicles without proving premature clutch-pack wear.', 'No exact source establishes the frozen mileage range, 2004-2011 population or mandatory cooler and remanufactured-transmission remedy.'],
    conflict: 'The indexed page expands narrow early-model shift-delay and gear-whine records into universal harsh shifting, wear and complete failure through 2011.',
    summary: 'Held the overbroad transmission-failure identity and bounded diagnosis to exact unit, software, shift, pressure and noise evidence.',
    citations: ['datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: 'Endeavor', slug: 'endeavor', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-endeavor-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['ENDEAVOR'],
  searchTerms: ['air conditioner', 'air conditioning', 'A/C', 'compressor', 'compressor clutch', 'refrigerant', 'HVAC', 'expansion valve', 'pressure sensor', 'drain passage', 'automatic transmission', 'A/T', 'transaxle', 'harsh shift', 'delayed shifting', 'gear whine', 'ATF', 'transmission cooler', 'clutch pack'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 40, '2005-2009': 59, '2010-2014': 2, '2015-2019': 10, '2020-2024': 31, '2025-2026': 0 },
    totalRows: 142,
    relevantRowCount: 9,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 18, post: 10 },
    totalRows: 28,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Twelve exact Endeavor campaign identities exist; none establishes the frozen compressor-failure or broad transmission-failure identity. Recall 10V514000 concerns a manual-HVAC controller signal and mode door, not the compressor.',
  },
  content,
  requiredProse: [
    { id: ids.acCompressor, field: 'description', patterns: ['contains no communication establishing recurring premature compressor', 'sharing a platform'] },
    { id: ids.acCompressor, field: 'solution', patterns: ['refrigerant pressures', 'Do not buy'] },
    { id: ids.transmission, field: 'description', patterns: ['10006465 and 10014358', 'do not establish recurring harsh shifting'] },
    { id: ids.transmission, field: 'solution', patterns: ['commanded gear', 'Do not buy'] },
  ],
  observations: [
    { code: 'two-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both frozen identities materially exceed exact primary evidence and remain published pending identity policy.' },
    { code: 'cross-model-platform-inference-blocked', severity: 'technical-accuracy', recordIds: [ids.acCompressor], detail: 'A shared platform or similar Mitsubishi model is not used to manufacture an Endeavor compressor-failure identity.' },
    { code: 'narrow-transmission-conditions-not-expanded', severity: 'production-scope', recordIds: [ids.transmission], detail: 'Early-model shift-delay and gear-whine communications are not expanded into all-year harsh shifting, clutch-pack wear or complete failure.' },
    { code: 'no-owner-social-proof', severity: 'accuracy-cleanup', recordIds: allIds, detail: 'Both frozen counts are already unknown zero; no owner total or recurrence rate is introduced.' },
    { code: 'all-endeavor-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Endeavor page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
