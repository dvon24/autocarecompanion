/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ transferCase: 'mitsubishi-montero-sport-transfer-case' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze(['10016137', '616795']);
const campaigns = Object.freeze(['00V311001', '01V027000', '04V095000', '99V041000']);
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
  lowRangeTransmissionRecall: {
    title: 'NHTSA Recall 99V041000 - Montero Sport 4WD Low-Range Transmission Overheating',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V041000',
    contains: '99V041000',
  },
});

const content = Object.freeze({
  [ids.transferCase]: {
    description: `The reviewed 183-row exact Montero Sport manufacturer-communication corpus identifies a transfer-case shifter rattle on 1999-2001 vehicles and a transfer-case oil-quantity service-manual revision for 2001-2004, but neither record establishes internal bearing or chain wear, grinding, engagement difficulty or eventual complete failure. Recall 99V041000 separately covers automatic-transmission overheating in 4WD Low on certain 1999 vehicles, outside the frozen 2000-2004 population, and does not identify transfer-case failure. The exact evidence does not support faster-than-scheduled fluid breakdown or the frozen universal 30,000-mile interval.`,
    solution: `Identify the installed transfer case, driveline and exact noise or engagement complaint. Preserve codes and verify shift-linkage and lever rattle, mounts, fluid level and specification, leakage, switch and actuator operation, propeller shafts, universal joints and differential or wheel-bearing noise before opening the transfer case. Follow the VIN-specific manufacturer service interval and measured inspection procedure. Do not buy transfer fluid, a chain, bearings, actuator, switches or rebuilt transfer case from this page; the exact fitment and failed linkage, control, driveline or internal component must be proven first.`,
    symptoms: ['installed transfer case and driveline verified', 'rattle, grinding and engagement complaints reproduced separately', 'linkage, control, fluid, propeller-shaft and internal paths separated'],
    affectedSystems: ['transfer-case shift linkage and controls', 'transfer-case fluid and internal drive', 'propeller shafts, differentials and driveline mounts'],
    evidence: ['616795 supports a transfer-case shifter rattle, not internal chain or bearing failure.', '10016137 is an oil-quantity manual revision and does not prove fluid breakdown or a 30,000-mile interval.', '99V041000 concerns 1999 automatic-transmission overheating in 4WD Low rather than the frozen transfer-case identity.'],
    conflict: 'The indexed transfer-case failure identity converts a shifter rattle and oil-quantity revision into unsupported internal wear, complete failure and service-interval claims.',
    summary: 'Held the unsupported transfer-case failure identity and separated linkage, fluid, control, driveline and internal diagnosis.',
    citations: ['lowRangeTransmissionRecall', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: 'Montero Sport', slug: 'montero-sport', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-montero-sport-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['MONTERO SPORT'],
  searchTerms: ['transfer case shifter rattle', 'transfer case oil quantity', 'transfer case failure', 'transfer case bearing', 'transfer case chain', 'difficulty engaging 4WD'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 33, '2000-2004': 116, '2005-2009': 2, '2010-2014': 0, '2015-2019': 7, '2020-2024': 25, '2025-2026': 0 },
    totalRows: 183,
    relevantRowCount: 2,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 8, post: 0 },
    totalRows: 8,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Four exact Montero Sport campaign identities exist. The only powertrain campaign is 99V041000 for 1999 automatic-transmission overheating in 4WD Low, not the frozen 2000-2004 transfer-case failure identity.',
  },
  content,
  requiredProse: [
    { id: ids.transferCase, field: 'description', patterns: ['transfer-case shifter rattle', 'neither record establishes internal bearing or chain wear', 'does not support faster-than-scheduled fluid breakdown'] },
    { id: ids.transferCase, field: 'solution', patterns: ['Follow the VIN-specific manufacturer service interval', 'Do not buy transfer fluid'] },
  ],
  observations: [
    { code: 'transfer-case-identity-held', severity: 'identity-safety', recordIds: allIds, detail: 'The frozen transfer-case failure identity materially exceeds exact primary evidence and remains published pending identity policy.' },
    { code: 'rattle-not-converted-to-internal-failure', severity: 'technical-accuracy', recordIds: allIds, detail: 'A shifter rattle and oil-quantity correction are not converted into chain, bearing or complete transfer-case failure.' },
    { code: 'universal-service-interval-rejected', severity: 'maintenance-safety', recordIds: allIds, detail: 'The unsupported universal 30,000-mile interval is replaced by a VIN-specific manufacturer-schedule requirement in the proposal.' },
    { code: 'montero-sport-page-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'The Montero Sport page is not removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
