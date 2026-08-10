/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ gearbox: 'peugeot-207-gearbox-bearing-noise', timingChain: 'peugeot-207-timing-chain-tensioner', turboLeak: 'peugeot-207-turbo-oil-leak' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = allIds;
function held({ description, solution, symptoms, systems, evidence, conflict, summary }) { return Object.freeze({ description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations: ['datasets', 'peugeotRecallCheck'], commerceDecision: 'failure path, component, engine or transmission variant and VIN fitment remain unresolved; no universal retail part' }); }
const content = Object.freeze({
  [ids.gearbox]: held({
    description: 'The frozen page cites only a forum home page and assigns a 2006-2014 Peugeot 207 MA/BE manual-gearbox input-shaft-bearing failure population with 45 owner reports. A neutral noise that changes with clutch position can involve release bearing, input bearing, gear train, clutch, flywheel or lubricant condition; the reviewed primary corpus contains no exact 207 communication establishing one mechanism.',
    solution: 'Record noise by gear, road speed, engine speed, load and clutch-pedal position; verify oil level/specification and identify the exact gearbox before removal. Inspect release system, clutch/flywheel, shafts, bearings and gears as separate paths. Do not buy an input bearing, clutch or gearbox from this page; failed component, transmission code and VIN fitment must be established first.',
    symptoms: ['noise correlated with clutch position and speed', 'gearbox code and lubricant verified', 'release, clutch and internal paths separated'], systems: ['manual gearbox shafts and bearings', 'clutch and release system', 'flywheel, gears and lubricant'], evidence: ['The complete NHTSA corpus contains zero Peugeot 207 rows.', 'A forum home page does not prove an input-bearing population.', 'The 45-owner count has no traceable dataset.'], conflict: 'The indexed identity converts an uncited noise pattern into a nine-year bearing defect and fabricated social proof.', summary: 'Held the input-bearing identity, separated driveline noise paths and reduced the 45-owner claim to unknown.',
  }),
  [ids.timingChain]: held({
    description: 'The frozen page cites only a forum home page and assigns every 2006-2014 Peugeot 207 a Prince EP6 timing-chain-tensioner defect, revised-part history and 95 owner reports. The model also used other engines, and the reviewed primary corpus contains no exact communication proving the full year/equipment population, an undersized original tensioner or the claimed common failure sequence.',
    solution: 'Identify the exact engine and timing-drive design by VIN. Record cold-start noise, oil level/specification, service history, DTCs and measured cam/crank correlation, then inspect tensioner, chain, guides, sprockets and variable-timing controls under current service information. If timing loss is suspected, stop cranking. Do not buy a chain kit, tensioner or engine from this page; failure path, revision and fitment must be established first.',
    symptoms: ['engine and timing drive verified', 'cold-start noise and cam/crank correlation recorded', 'engine not cranked after suspected timing loss'], systems: ['EP6 timing drive where equipped', 'hydraulic tensioning and lubrication', 'cam/crank and variable timing control'], evidence: ['The complete NHTSA corpus contains zero Peugeot 207 rows.', 'A forum home page does not prove the frozen engine/year scope.', 'The 95-owner and revised-tensioner claims have no traceable primary source.'], conflict: 'The indexed identity applies one engine-family mechanism and parts revision to every 207 year and adds fabricated social proof.', summary: 'Held the overbroad timing-chain identity and reduced the 95-owner claim to unknown.',
  }),
  [ids.turboLeak]: held({
    description: 'The frozen page cites only a forum home page and assigns a 2006-2014 Peugeot 207 1.6 THP turbo oil-line/seal failure population with 55 owner reports. Blue smoke and oil consumption can originate from external lines, crankcase ventilation, valve seals, rings or turbo bearings, and non-THP vehicles are outside the asserted mechanism.',
    solution: 'Identify the exact engine/turbo by VIN, quantify oil consumption and inspect external feed/return lines, crankcase ventilation, intake/exhaust oil, shaft condition, compression and leak-down before replacement. Stop for low oil pressure, runaway or heavy smoke. Do not buy oil lines, gaskets or a turbocharger from this page; leak path, damage and VIN fitment must be established first.',
    symptoms: ['engine and turbo equipment verified', 'external and internal oil paths separated', 'runaway and low-oil-pressure risk assessed'], systems: ['turbo oil feed and return', 'turbo bearings and seals', 'PCV, valve seals and engine sealing'], evidence: ['The complete NHTSA corpus contains zero Peugeot 207 rows.', 'A forum home page does not establish a nine-year THP population.', 'The 55-owner count and interval-to-bearing claim lack exact evidence.'], conflict: 'The indexed identity maps one THP failure sequence to all 207 years and adds fabricated social proof.', summary: 'Held the turbo-oil-leak identity, separated oil-consumption paths and reduced the 55-owner claim to unknown.',
  }),
});
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' }, peugeotRecallCheck: { title: 'Peugeot Official Safety Recall Campaign Check', type: 'manufacturer', url: 'https://www.peugeot.co.uk/tools/recall-campaigns.html', contains: 'Check recall campaigns for my vehicle' } });
module.exports = Object.freeze({
  make: 'Peugeot', model: '207', slug: '207', reviewDate: '2026-08-10', snapshotFile: 'data/_peugeot-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-peugeot-207-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PEUGEOT'], modelAliases: ['207', '207 CC', '207 SW'], searchTerms: ['gearbox', 'bearing', 'timing chain', 'tensioner', 'turbo', 'oil leak'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains zero PEUGEOT 207/207 CC/207 SW rows; this is a disclosed U.S.-corpus limitation.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero PEUGEOT 207 variants; market-specific campaigns remain VIN-gated through Peugeot.' },
  content,
  requiredProse: [
    { id: ids.gearbox, field: 'description', patterns: ['release bearing, input bearing', '45 owner reports'] },
    { id: ids.timingChain, field: 'description', patterns: ['model also used other engines', '95 owner reports'] },
    { id: ids.timingChain, field: 'solution', patterns: ['stop cranking', 'Do not buy a chain kit'] },
    { id: ids.turboLeak, field: 'description', patterns: ['crankcase ventilation, valve seals, rings', '55 owner reports'] },
  ],
  observations: [
    { code: 'all-three-held', severity: 'identity-safety', recordIds: allIds, detail: 'All three 207 pages stay published but exceed exact primary evidence.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero PEUGEOT 207 variant rows; the geographic limit is explicit.' },
    { code: 'forum-homepages-only', severity: 'source-integrity', recordIds: allIds, detail: 'Each frozen page cites only a forum home page rather than an exact thread or primary record.' },
    { code: 'all-owner-counts-unsupported', severity: 'social-proof-safety', recordIds: allIds, detail: 'Counts 45, 95 and 55 lack traceable datasets and are reduced to unknown.' },
    { code: 'gearbox-noise-paths-separated', severity: 'technical-accuracy', recordIds: [ids.gearbox], detail: 'Release bearing, input bearing, clutch, flywheel, gears and lubricant remain separate.' },
    { code: 'gearbox-code-required', severity: 'commerce-safety', recordIds: [ids.gearbox], detail: 'No bearing or gearbox can be selected without the transmission code.' },
    { code: 'timing-engine-scope-overbroad', severity: 'technical-accuracy', recordIds: [ids.timingChain], detail: 'Not every 207 year is an EP6 timing-chain vehicle.' },
    { code: 'timing-revision-unverified', severity: 'source-integrity', recordIds: [ids.timingChain], detail: 'The undersized and revised tensioner history lacks an exact primary source.' },
    { code: 'turbo-oil-paths-separated', severity: 'technical-accuracy', recordIds: [ids.turboLeak], detail: 'External lines, PCV, valve seals, rings and turbo bearings are separate.' },
    { code: 'turbo-safety-boundary', severity: 'safety-accuracy', recordIds: [ids.turboLeak], detail: 'Low oil pressure, heavy smoke and runaway are stop conditions.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No parts or search links are introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'All title, model, year, category, severity, status and routing fields remain frozen.' },
  ],
});
