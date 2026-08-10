/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ dpf: 'peugeot-508-diesel-dpf' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = allIds;
const content = Object.freeze({
  [ids.dpf]: Object.freeze({
    description: 'The frozen page cites only a forum home page and assigns 2011-2026 Peugeot 508 diesels a DPF-regeneration-failure population with 65 owner reports. First- and second-generation engine and aftertreatment designs vary, so not every vehicle has the same additive system. Incomplete regeneration can reflect operating pattern, soot or ash load, differential-pressure or temperature sensing, additive equipment where fitted, fueling, EGR, turbo, oil faults or exhaust leaks.',
    solution: 'Identify the exact engine and aftertreatment system, capture DTCs, soot/ash estimates, differential pressure, temperature data and regeneration history, and correct sensor, additive, engine or exhaust faults before a controlled regeneration. Do not force regeneration when oil level, filter loading, exhaust temperature or fire safety makes it unsafe. Do not buy Eolys additive, a pressure sensor or DPF from this page; system design, failure cause and VIN fitment must be established first.',
    symptoms: ['engine and aftertreatment design identified', 'soot, ash, pressure and temperature measured', 'regeneration safety and upstream faults checked'],
    affectedSystems: ['diesel particulate filter', 'pressure, temperature and additive systems where equipped', 'fueling, EGR, turbo and exhaust'],
    evidence: ['The complete NHTSA corpus contains zero Peugeot 508/508 SW/508 V2 rows.', 'A forum home page does not prove a sixteen-year defect population.', 'The 65-owner count and universal Eolys remedy have no traceable dataset.'],
    conflict: 'The indexed identity turns usage-sensitive regeneration across changing aftertreatment generations into one 2011-2026 defect with fabricated social proof.',
    summary: 'Held the overbroad 508 DPF identity, reduced 65 reports to unknown and bounded additive and forced-regeneration advice.',
    citations: ['datasets', 'peugeotRecallCheck'],
    commerceDecision: 'engine, aftertreatment architecture, restriction cause and VIN fitment remain unresolved; no universal retail part',
  }),
});
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  peugeotRecallCheck: { title: 'Peugeot Official Safety Recall Campaign Check', type: 'manufacturer', url: 'https://www.peugeot.co.uk/tools/recall-campaigns.html', contains: 'Check recall campaigns for my vehicle' },
});
module.exports = Object.freeze({
  make: 'Peugeot', model: '508', slug: '508', reviewDate: '2026-08-10', snapshotFile: 'data/_peugeot-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-peugeot-508-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PEUGEOT'], modelAliases: ['508', '508 SW', '508 V2'], searchTerms: ['DPF', 'regeneration', 'Eolys', 'additive', 'differential pressure', 'temperature'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains zero PEUGEOT 508/508 SW/508 V2 rows; this disclosed U.S.-corpus limitation is not treated as disproof.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero PEUGEOT 508 variants; market-specific campaigns remain VIN-gated through Peugeot.' },
  content,
  requiredProse: [
    { id: ids.dpf, field: 'description', patterns: ['2011-2026', '65 owner reports', 'not every vehicle has the same additive system'] },
    { id: ids.dpf, field: 'solution', patterns: ['Do not force regeneration', 'Do not buy Eolys additive'] },
  ],
  observations: [
    { code: 'sole-row-held', severity: 'identity-safety', recordIds: allIds, detail: 'The sole 508 page remains published and held pending identity policy.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero PEUGEOT 508 variants; absence is not treated as disproof.' },
    { code: 'forum-homepage-only', severity: 'source-integrity', recordIds: allIds, detail: 'The frozen citation is a forum home page rather than exact evidence.' },
    { code: 'generation-scope-overbroad', severity: 'technical-accuracy', recordIds: allIds, detail: 'The identity spans changing engines and aftertreatment systems through 2026.' },
    { code: 'additive-not-universal', severity: 'technical-accuracy', recordIds: allIds, detail: 'Eolys equipment cannot be inferred for every 508 diesel.' },
    { code: 'restriction-paths-separated', severity: 'technical-accuracy', recordIds: allIds, detail: 'Soot, ash, sensors, additive, fueling, EGR, turbo and exhaust remain separate.' },
    { code: 'forced-regeneration-bounded', severity: 'safety-accuracy', recordIds: allIds, detail: 'Oil, loading, temperature and fire conditions gate regeneration.' },
    { code: 'owner-count-unsupported', severity: 'social-proof-safety', recordIds: allIds, detail: 'The 65-owner count is reduced to unknown.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown count is never rendered as 0+ owners.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No additive, sensor or DPF link is introduced.' },
    { code: 'vin-fitment-required', severity: 'commerce-safety', recordIds: allIds, detail: 'Exact engine and aftertreatment design are required before parts.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, category, severity, status and routing remain frozen.' },
  ],
});
