/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  timingChain: 'peugeot-rcz-timing-chain',
  turboOilLeak: 'peugeot-rcz-turbo-oil-leak',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = allIds;
const content = Object.freeze({
  [ids.timingChain]: Object.freeze({
    description: 'The frozen page cites only a forum home page and assigns every 2010-2015 RCZ 1.6 THP a hydraulic timing-chain-tensioner weakness shared across PSA/BMW Prince applications, with 40 owner reports and a progression from pressure loss to chain skip and valve damage. Cold-start rattle, correlation faults and rough running can also involve oil level/specification and pressure, tensioner, chain, guides, sprockets, variable timing, sensors, wiring, accessory drive or internal damage; those paths and engine revisions are not established by the cited page.',
    solution: 'Identify the exact engine and timing-system revision by VIN; record cold-start noise, oil level/specification and service history; capture DTCs and measure cam/crank correlation and oil pressure under current service information. Inspect the tensioner, chain, guides, sprockets, variable-timing controls, sensors and wiring before replacement. If timing loss is suspected, stop cranking. Do not buy a chain kit, tensioner, sprockets or engine from this page; failed path, revision and VIN fitment must be established first.',
    symptoms: ['engine and timing-system revision identified', 'cold-start noise, oil pressure and correlation measured', 'engine not cranked after suspected timing loss'],
    affectedSystems: ['EP6/Prince timing chain where equipped', 'tensioner, guides and sprockets', 'oil supply, variable timing, sensors and wiring'],
    evidence: ['The complete NHTSA corpus contains zero Peugeot RCZ variants.', 'A forum home page does not prove a six-year RCZ tensioner population or revision history.', 'The 40-owner count has no traceable first-party dataset.'],
    conflict: 'The identity turns a symptom set and related-engine reputation into one RCZ-wide hydraulic-tensioner failure with fabricated social proof and kit-first repair.',
    summary: 'Held the RCZ timing-chain identity, reduced 40 reports to unknown and required measured timing/oil diagnosis.',
    citations: ['datasets', 'peugeotRecallCheck'],
    commerceDecision: 'engine revision, timing failure path and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.turboOilLeak]: Object.freeze({
    description: 'The frozen page cites only a forum home page and assigns every 2010-2015 RCZ 1.6 THP oil leaks from both turbo feed/return lines plus heat-degraded bearing seals, with 35 owner reports and progressive oil consumption/blue smoke under boost. Oil outside or smoke can instead involve spilled oil, valve-cover or vacuum-pump leakage, crankcase ventilation, feed/return fittings, compressor/turbine sealing, engine wear or exhaust contamination; P0299 indicates underboost, not a turbo oil-seal diagnosis.',
    solution: 'Check oil level before use and stop if oil pressure is low, consumption is rapid, smoke is heavy or oil reaches a hot exhaust surface. Clean and trace the source; inspect crankcase ventilation, engine leaks, turbo feed/return lines and fittings, compressor/turbine sides, shaft condition, charge tract, exhaust and measured boost. Correct the confirmed cause and prime/inspect oil supply under current service information. Do not buy oil lines, gaskets, a rebuild kit or turbocharger from this page; leak source, turbo condition, engine revision and VIN fitment must be established first.',
    symptoms: ['oil level and fire risk checked', 'external, ventilation, engine and turbo paths separated', 'boost and turbo condition measured'],
    affectedSystems: ['engine lubrication and crankcase ventilation', 'turbo oil feed and return where equipped', 'turbocharger, charge tract and exhaust'],
    evidence: ['The complete NHTSA corpus contains zero Peugeot RCZ variants.', 'A forum home page does not prove both line and bearing-seal failure across the indexed population.', 'The 35-owner count has no traceable first-party dataset.'],
    conflict: 'The identity combines several oil and smoke paths into a six-year turbo-line/seal defect and authorizes lines or turbo replacement before source diagnosis.',
    summary: 'Held the RCZ turbo-oil identity, reduced 35 reports to unknown and separated leak, ventilation, engine and turbo paths.',
    citations: ['datasets', 'peugeotRecallCheck'],
    commerceDecision: 'leak source, turbo condition, engine revision and VIN fitment remain unresolved; no universal retail part',
  }),
});
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  peugeotRecallCheck: { title: 'Peugeot Official Safety Recall Campaign Check', type: 'manufacturer', url: 'https://www.peugeot.co.uk/tools/recall-campaigns.html', contains: 'Check recall campaigns for my vehicle' },
});
module.exports = Object.freeze({
  make: 'Peugeot', model: 'RCZ', slug: 'rcz', reviewDate: '2026-08-10', snapshotFile: 'data/_peugeot-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-peugeot-rcz-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PEUGEOT'], modelAliases: ['RCZ'], searchTerms: ['timing chain', 'tensioner', 'P0016', 'P0017', 'turbo', 'oil leak', 'blue smoke', 'P0299'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains zero PEUGEOT RCZ rows; this disclosed U.S.-corpus limitation is not treated as disproof.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero PEUGEOT RCZ rows; market-specific campaigns remain VIN-gated through Peugeot.' },
  content,
  requiredProse: [
    { id: ids.timingChain, field: 'description', patterns: ['hydraulic timing-chain-tensioner weakness', '40 owner reports'] },
    { id: ids.timingChain, field: 'solution', patterns: ['stop cranking', 'Do not buy a chain kit'] },
    { id: ids.turboOilLeak, field: 'description', patterns: ['heat-degraded bearing seals', '35 owner reports'] },
    { id: ids.turboOilLeak, field: 'solution', patterns: ['oil reaches a hot exhaust surface', 'Do not buy oil lines'] },
  ],
  observations: [
    { code: 'both-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both RCZ pages remain published and held.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero PEUGEOT RCZ rows; absence is not disproof.' },
    { code: 'forum-homepages-only', severity: 'source-integrity', recordIds: allIds, detail: 'Both frozen pages cite only generic forum home pages.' },
    { code: 'timing-shared-engine-inference', severity: 'source-integrity', recordIds: [ids.timingChain], detail: 'Related Prince-engine reputation is not proof of every frozen RCZ.' },
    { code: 'timing-paths-separated', severity: 'technical-accuracy', recordIds: [ids.timingChain], detail: 'Oil, mechanical timing, variable timing, sensor and wiring paths remain separate.' },
    { code: 'timing-loss-stop-cranking', severity: 'safety-accuracy', recordIds: [ids.timingChain], detail: 'Suspected timing loss is a stop-cranking condition.' },
    { code: 'p0299-not-oil-seal-proof', severity: 'technical-accuracy', recordIds: [ids.turboOilLeak], detail: 'P0299 indicates underboost and is not treated as proof of an oil-seal failure.' },
    { code: 'oil-and-smoke-paths-separated', severity: 'technical-accuracy', recordIds: [ids.turboOilLeak], detail: 'External leak, ventilation, engine, turbo and exhaust paths remain separate.' },
    { code: 'hot-exhaust-fire-boundary', severity: 'safety-accuracy', recordIds: [ids.turboOilLeak], detail: 'Oil on hot exhaust parts is treated as a stop-use fire risk.' },
    { code: 'counts-unsupported', severity: 'social-proof-safety', recordIds: allIds, detail: 'Counts 40 and 35 are reduced to unknown.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No parts, services, search links or recommendations are introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown counts never render as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, category, severity, status and routing remain frozen.' },
  ],
});
