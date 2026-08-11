/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ dpf: 'renault-kadjar-dpf-regeneration' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.dpf]);

const content = Object.freeze({
  [ids.dpf]: Object.freeze({
    description: 'The frozen page treats unsuccessful DPF regeneration as a common 2015-2022 Kadjar defect across 1.5 dCi and 1.7 Blue dCi vehicles, attributes it to urban use, assigns P2463/P2002, a 25,000-70,000-mile range and 55 owner reports, and cites only a forum home page. Regeneration failure is a diagnostic state rather than one component identity and can follow soot or ash load, pressure/temperature sensing, air-path, fuel, EGR, turbocharger, oil-dilution or driving-cycle conditions.',
    solution: 'Capture DTCs and freeze-frame data, soot and ash estimates, differential pressure, exhaust temperatures and regeneration history, then diagnose sensor pipes, EGR, intake/boost, fueling and oil dilution before any forced regeneration. Do not force regeneration when soot load, oil level, sensor validity or exhaust-temperature safety is unresolved; use Renault’s engine-specific service procedure. Do not buy a DPF, pressure sensor, pipe or EGR valve from this page; root cause, emissions generation and VIN fitment must be established first.',
    symptoms: ['DPF data and freeze-frame captured', 'soot, ash, pressure and temperature values validated', 'unsafe regeneration conditions excluded'],
    affectedSystems: ['diesel particulate filter', 'pressure and temperature sensing', 'EGR, air, fuel and regeneration controls'],
    evidence: ['The complete NHTSA corpus contains zero Renault Kadjar rows.', 'A forum home page does not prove an eight-year DPF failure population.', 'The frozen 55-owner total, mileage range, DTC pair and weekly 2,500-rpm routine lack exact Renault evidence.'],
    conflict: 'The indexed identity converts a multi-cause emissions state into one cross-engine defect with unsupported social proof and universal driving advice.',
    summary: 'Held the DPF-regeneration identity, reduced the unsupported 55-owner total to unknown and replaced forced-regeneration advice with measurement-led safety gates.',
    citations: ['datasets', 'renaultRecallCheck'],
    commerceDecision: 'DPF loading cause, emissions generation, component identity and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Kadjar', slug: 'kadjar', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-kadjar-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['KADJAR'],
  searchTerms: ['DPF', 'regeneration', 'P2463', 'P2002'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT KADJAR rows; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT KADJAR rows; owners must use Renault’s VIN recall checker for market-specific campaigns.',
  },
  content,
  requiredProse: [{ id: ids.dpf, field: 'description', patterns: ['diagnostic state rather than one component identity', '55 owner reports'] }],
  observations: [
    { code: 'single-page-held', severity: 'identity-safety', recordIds: allIds, detail: 'The only Kadjar page remains published but exceeds exact primary evidence.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT KADJAR rows; the geographic limitation is explicit.' },
    { code: 'unsafe-forced-regeneration-bounded', severity: 'safety-accuracy', recordIds: allIds, detail: 'Forced regeneration is gated on soot, oil, sensor and exhaust-temperature safety.' },
    { code: 'unsupported-owner-count-removed', severity: 'social-proof-safety', recordIds: allIds, detail: 'The unsupported 55-owner total is reduced to unknown.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
