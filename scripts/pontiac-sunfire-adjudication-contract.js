/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  headGasket: 'pontiac-sunfire-2.2-ecotec-head-gasket',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

const content = Object.freeze({
  [ids.headGasket]: Object.freeze({
    description: 'A complete search of 882 exact Sunfire manufacturer communications found no 2002-2005 L61 head-gasket or cracked-cylinder-head condition. Record 628890 covers a few drops of parked coolant leakage through 2002 without assigning a head-gasket cause; 10003789 covers coolant loss or a warning lamp through 2004; 10003816 and 10011117 concern cylinder-bore-liner service; 10038510 and later versions concern cylinder-head noise from low upper-end oil pressure caused by debris; and 10126983 concerns water-pump-chain-tensioner setup after service. None proves gasket prevalence, easy aluminum-head warping, head cracking, the frozen mileage/cost range, mandatory resurfacing or a used-head remedy.',
    solution: 'If the engine overheats, shows coolant in oil or emits persistent white vapor after warm-up, stop driving and tow it for diagnosis. Pressure-test the cooling system and cap, inspect external leaks, verify fan operation and coolant circulation, and use combustion-gas, compression and leak-down testing as appropriate before removing the head. If internal leakage is confirmed, measure head and block condition and follow the exact L61 service and machine-shop specifications. Do not buy a head gasket, cylinder head, bolts, water pump, thermostat or sealing kit from this page; the leak path, damage, part number and VIN fitment must be established first.',
    symptoms: ['coolant loss and external leak source documented', 'overheating and fan/circulation paths tested', 'combustion-gas, compression or leak-down evidence collected', 'head and block condition measured only after confirmed internal leakage'],
    affectedSystems: ['engine cooling system and external leak paths', 'cylinder head, gasket and block sealing', 'fan, water pump, thermostat and lubrication'],
    evidence: ['Records 628890 and 10003789 support coolant loss but not a head-gasket cause.', 'Records 10003816 and 10011117 concern bore-liner service, not head cracking.', 'Records 10038510 and 10126983 concern oil-feed debris and post-service chain setup, not the frozen identity.'],
    conflict: 'The indexed page converts general coolant and cylinder-head-adjacent communications into a four-year head-gasket/head-crack weak point with unsupported frequency, DTC, mileage, cost and replacement prescriptions.',
    summary: 'Held the unsupported L61 head-gasket/head-crack identity and restored overheating-safe leak-path and engine-mechanical diagnosis.',
    citations: ['sunfire2002', 'sunfire2005', 'datasets'],
    commerceDecision: 'coolant leak or combustion path, head/block damage, machine specification, part number and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  sunfire2002: { title: 'NHTSA Vehicle Detail — 2002 Pontiac Sunfire', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2002/PONTIAC/SUNFIRE' },
  sunfire2005: { title: 'NHTSA Vehicle Detail — 2005 Pontiac Sunfire', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2005/PONTIAC/SUNFIRE' },
});

module.exports = Object.freeze({
  make: 'Pontiac', model: 'Sunfire', slug: 'sunfire', reviewDate: '2026-08-10', snapshotFile: 'data/_pontiac-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-pontiac-sunfire-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PONTIAC'], modelAliases: ['SUNFIRE'], searchTerms: ['head gasket', 'cylinder head', 'head crack', 'overheat', 'coolant', 'Ecotec', 'L61'],
  relevantDocumentIds: ['628890', '10003789', '10003816', '10007528', '10011117', '10038510', '10112700', '10123211', '10126983', '10143445', '10157015'],
  campaigns: ['02V070000', '02V286000', '04V036000', '04V300000', '04V524000', '06E026000', '07E015000', '07E021000', '08E063000', '95V025000', '95V141000', '95V201000', '96V003000', '96V250000', '97V106000', '97V219000', '98V027000', '98V032000', '98V146000', '98V319000', '99V218000'],
  pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 72, '2000-2004': 270, '2005-2009': 55, '2010-2014': 8, '2015-2019': 349, '2020-2024': 122, '2025-2026': 6 }, totalRows: 882, relevantRowCount: 25, uniqueRelevantCommunications: 25, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete corpus contains 882 exact Pontiac Sunfire communications. It contains general coolant-loss and cylinder-head-adjacent service records but no exact 2002-2005 L61 head-gasket or head-crack condition.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 51, post: 0 }, totalRows: 51, campaignCount: 21, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 51 exact Sunfire recall rows across 21 campaigns were reconciled; none establishes the frozen head-gasket/head-crack identity.' },
  content,
  requiredProse: [
    { id: ids.headGasket, field: 'description', patterns: ['no 2002-2005 L61 head-gasket', '628890', '10003789', '10038510', '10126983', 'None proves gasket prevalence'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'The single frozen Sunfire row is represented exactly once.' },
    { code: 'identity-held', severity: 'identity-safety', recordIds: allIds, detail: 'The page remains published and held pending independent identity review.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 882 exact Sunfire communications were searched.' },
    { code: 'recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 51 exact Sunfire recall rows were reconciled and none supports the identity.' },
    { code: 'coolant-loss-not-head-gasket', severity: 'technical-accuracy', recordIds: allIds, detail: 'General coolant-loss communications are not converted into internal gasket or head failure.' },
    { code: 'adjacent-service-not-failure-proof', severity: 'technical-accuracy', recordIds: allIds, detail: 'Bore-liner, oil-feed and post-service chain procedures do not prove a cracked head.' },
    { code: 'unsupported-dtcs-costs-mileage-removed', severity: 'consumer-accuracy', recordIds: allIds, detail: 'The proposal carries no inferred DTC array, price range or mileage range.' },
    { code: 'overheating-safety-preserved', severity: 'consumer-accuracy', recordIds: allIds, detail: 'Active overheating or lubrication contamination receives stop-driving/tow guidance.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or recommendation is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown owner count remains zero and never renders as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, trims, engines, category, severity, status and routing remain frozen.' },
  ],
});
