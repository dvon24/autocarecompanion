/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ software: 'renault-megane-etech-software-bugs' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.software]);

const content = Object.freeze({
  [ids.software]: Object.freeze({
    description: 'The frozen page groups phantom notifications, range-estimate variation, climate-control malfunction and OTA installation failure into one 2022-2026 Mégane E-Tech defect spanning 40 kWh and 60 kWh vehicles and three trims. It cites only a SpeakEV home page, assigns 50 owner reports, a 1,000-30,000-mile range and a repair cost, and assumes updates can introduce faults. These symptoms can involve different vehicle controllers, software releases, connectivity and operating conditions.',
    solution: 'Record the exact vehicle software versions, warning text, date, state of charge, temperature, connectivity and reproducible conditions; preserve diagnostic logs and verify 12 V and high-voltage status before reset or update work. Follow My Renault and dealer instructions for the VIN and installed system, and do not perform an improvised hard reset on safety-critical controllers. Do not buy a head unit, climate module, battery component or reflash service from this page; affected controller, software campaign and VIN-specific remedy must be established first.',
    symptoms: ['exact warning and software versions recorded', 'state of charge, temperature and connectivity captured', '12 V, high-voltage and controller paths separated'],
    affectedSystems: ['vehicle software and network', 'infotainment and connectivity', 'range estimation, climate and power management'],
    evidence: ['The complete NHTSA corpus contains zero Renault Megane E-Tech rows.', 'A forum home page does not establish a five-year, two-battery population.', 'The 50-owner total, mileage, cost and OTA-causation claims lack traceable primary evidence.'],
    conflict: 'The indexed identity combines several controllers and symptoms under unsupported cross-year social proof.',
    summary: 'Held the generic software/OTA identity and reduced the unsupported 50-owner total to unknown while requiring versioned, controller-specific evidence.',
    citations: ['datasets', 'renaultRecallCheck'],
    commerceDecision: 'affected controller, software release, campaign and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Megane E-Tech', slug: 'megane-e-tech', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-megane-e-tech-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['MEGANE E-TECH', 'MEGANE E TECH'],
  searchTerms: ['software', 'OTA', 'range', 'climate', 'notification'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT MEGANE E-TECH variants; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT MEGANE E-TECH variants; owners must use Renault’s VIN recall checker for market-specific campaigns.',
  },
  content,
  requiredProse: [{ id: ids.software, field: 'description', patterns: ['phantom notifications', '50 owner reports', 'different vehicle controllers'] }],
  observations: [
    { code: 'single-page-held', severity: 'identity-safety', recordIds: allIds, detail: 'The only Megane E-Tech page remains published but exceeds exact primary evidence.' },
    { code: 'software-paths-separated', severity: 'technical-accuracy', recordIds: allIds, detail: 'Infotainment, range, climate and OTA symptoms are not treated as one controller defect.' },
    { code: 'unsupported-owner-count-removed', severity: 'social-proof-safety', recordIds: allIds, detail: 'The unsupported 50-owner total is reduced to unknown.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT MEGANE E-TECH rows; the geographic limitation is explicit.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity, related link and published status are preserved.' },
  ],
});
