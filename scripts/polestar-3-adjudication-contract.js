/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ quality: 'polestar-3-first-year-delivery-quality' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

const content = Object.freeze({
  [ids.quality]: Object.freeze({
    description: 'Polestar announced in May 2023 that final software development for the shared all-electric platform required more time and moved the Polestar 3 start of production to the first quarter of 2024; it announced the first customer handovers in May 2024. Technical journal 37067 asks U.S. and Canadian staff to report each issue and initial-quality impression for model-year 2025 vehicles, but that reporting request is not evidence of a defined infotainment, OTA or trim defect population. Technical journal 37066 separately documents workshop software-download failures for model year 2024 onward. The frozen 2023-2024 identity therefore combines a launch delay, a technician reporting program and unspecified owner-quality claims under years and scope the evidence does not support.',
    solution: 'Identify the exact symptom rather than treating every early vehicle concern as one issue. Record the VIN, model year, delivery date, software version, warning text, affected function, DTCs, photos or video and whether the condition changes after an available Polestar update or documented restart. Delivery damage or fit-and-finish concerns should be recorded with the retailer promptly; warranty eligibility depends on the diagnosed manufacturing defect and the applicable terms, not a universal 90-day goodwill rule. Software-download recovery in technical journal 37066 is a workshop procedure involving VIDA and electrical modules, not an owner hard-reset instruction. Stop driving for safety-system, steering, propulsion, braking, overheating or high-voltage warnings and obtain qualified service. Do not buy a core computer, VCU, HLCM, display, trim part or other module from this page; the symptom, failed path, part number and VIN fitment are not established.',
    symptoms: ['exact function, warning and software version recorded', 'delivery-condition evidence separated from operating faults', 'safety-critical warnings routed to qualified service'],
    affectedSystems: ['central computing, infotainment and vehicle software', 'delivery inspection and fit-and-finish', '12-volt, high-voltage and networked control modules'],
    evidence: ['Polestar confirms additional platform-software development delayed the planned start of production to the first quarter of 2024.', 'Polestar announced first customer handovers in May 2024, so the frozen 2023 delivered-vehicle scope is not supported.', 'Technical journal 37067 is an MY2025 initial-quality reporting request and accepts no warranty claim; it does not establish a defect population.', 'Technical journal 37066 documents technician-only software-download recovery for MY2024 onward and does not prove every infotainment, OTA or trim claim in the frozen page.'],
    conflict: 'The indexed identity includes a pre-delivery 2023 year and converts a launch delay plus broad reporting instructions into an unspecified early-production defect population.',
    summary: 'Held the overbroad early-production quality identity and separated verified launch timing, delivery documentation, software diagnosis and warranty boundaries.',
    citations: ['delayAnnouncement', 'firstDeliveries', 'initialQualityJournal', 'softwareDownloadJournal', 'warranty', 'datasets'],
    commerceDecision: 'specific symptom, software state, central computer, VCU, HLCM, display, trim component, part number and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({
  initialQualityJournal: {
    title: 'Polestar Technical Journal 37067.1.0 - Polestar 3 Initial Quality Reporting',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008809-0001.pdf',
    sha256: 'bff4b7ad9c8c9226c737904c3964964de161ca4aa9c68c92e796e8cb5fd10d24',
    pageCount: 2,
    visuallyReviewedPages: [1, 2],
  },
  softwareDownloadJournal: {
    title: 'Polestar Technical Journal 37066.1.0 - Polestar 3 Software Download Issues',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008834-0001.pdf',
    sha256: '6f22b45d1cd009be94510c581a6daebfc2bcec950653db983fccff6e2ac81490',
    pageCount: 5,
    visuallyReviewedPages: [1, 2, 3, 4, 5],
  },
});

const otherSources = Object.freeze({
  delayAnnouncement: { title: 'Polestar Q1 2023 Results and Polestar 3 Production Timing', type: 'manufacturer', url: 'https://investors.polestar.com/news-releases/news-release-details/polestar-reports-results-first-quarter-2023-and-intensifies-cost/' },
  firstDeliveries: { title: 'Polestar 3 First Customer Deliveries', type: 'manufacturer', url: 'https://www.polestar.com/us/news/polestar-3-hits-the-road-first-deliveries-to-customers' },
  warranty: { title: 'Polestar 3 Specifications and Warranty', type: 'manufacturer', url: 'https://www.polestar.com/us/polestar-3/specifications' },
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
});

module.exports = Object.freeze({
  make: 'Polestar',
  model: 'Polestar 3',
  slug: 'polestar-3',
  reviewDate: '2026-08-10',
  snapshotFile: 'data/_polestar-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-polestar-3-adjudication-2026-08-10.json',
  ids,
  allIds,
  retainedIds,
  reportCountCleanupIds,
  sourceMakes: ['POLESTAR'],
  modelAliases: ['POLESTAR 3', 'PS3'],
  searchTerms: ['initial quality', 'delivery', 'software download', 'OTA', 'core computer', 'fit and finish'],
  relevantDocumentIds: ['11008809', '11008834'],
  campaigns: ['24V940000', '25V293000', '25V420000', '25V453000', '25V555000', '26V037000'],
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 28, '2025-2026': 96 },
    totalRows: 124,
    relevantRowCount: 2,
    uniqueRelevantCommunications: 2,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains 124 exact POLESTAR 3 rows. Two reviewed journals establish a bounded MY2025 reporting program and MY2024-onward workshop software-download procedure, not the frozen broad defect identity.',
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 10 },
    totalRows: 10,
    campaignCount: 6,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Ten flat recall rows represent six unique U.S. Polestar 3 campaigns, all listed for model year 2025; none establishes the frozen 2023-2024 general delivery-quality identity.',
  },
  content,
  requiredProse: [
    { id: ids.quality, field: 'description', patterns: ['first quarter of 2024', 'first customer handovers in May 2024', 'not evidence of a defined'] },
    { id: ids.quality, field: 'solution', patterns: ['not a universal 90-day goodwill rule', 'workshop procedure', 'Do not buy a core computer'] },
  ],
  observations: [
    { code: 'identity-held', severity: 'identity-safety', recordIds: allIds, detail: 'The Polestar 3 page remains published and held because its indexed years and broad defect identity exceed exact evidence.' },
    { code: 'frozen-row-uncited', severity: 'source-integrity', recordIds: allIds, detail: 'The live page has no citation despite specific launch, quality, update and warranty claims.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 124 exact Polestar 3 NHTSA communication rows were searched.' },
    { code: 'recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All ten flat rows and six unique Polestar 3 campaigns were reconciled.' },
    { code: 'software-delay-verified', severity: 'source-integrity', recordIds: allIds, detail: 'Polestar confirms final platform-software development moved production to Q1 2024.' },
    { code: 'first-delivery-timing-verified', severity: 'identity-safety', recordIds: allIds, detail: 'Polestar announced the first customer handovers in May 2024, not 2023.' },
    { code: 'my2023-scope-unsupported', severity: 'identity-safety', recordIds: allIds, detail: 'The frozen 2023 delivered-vehicle year conflicts with production and first-delivery chronology.' },
    { code: 'initial-quality-reporting-not-defect-proof', severity: 'source-integrity', recordIds: allIds, detail: 'TJ 37067 asks staff to report all issues and impressions; it does not prove a defined defect or frequency.' },
    { code: 'initial-quality-journal-my2025', severity: 'scope-safety', recordIds: allIds, detail: 'TJ 37067 applies to MY2025-2026 and accepts no warranty claim.' },
    { code: 'software-download-journal-bounded', severity: 'technical-accuracy', recordIds: allIds, detail: 'TJ 37066 concerns workshop software-download failures for MY2024 onward, not every owner-facing infotainment symptom.' },
    { code: 'technician-procedure-not-owner-reset', severity: 'safety-accuracy', recordIds: allIds, detail: 'VIDA, module reload and battery-disconnect procedures are not presented as owner instructions.' },
    { code: 'ota-count-unverified', severity: 'source-integrity', recordIds: allIds, detail: 'The frozen multiple-updates-in-six-month statement is not used as evidence of defect frequency.' },
    { code: 'goodwill-window-unverified', severity: 'warranty-accuracy', recordIds: allIds, detail: 'The frozen universal 90-day goodwill-correction rule has no exact manufacturer support.' },
    { code: 'warranty-bounded', severity: 'warranty-accuracy', recordIds: allIds, detail: 'The four-year/50,000-mile warranty is tied to qualifying manufacturing defects and applicable terms, not every quality complaint.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No core computer, VCU, HLCM, display, trim part or other commerce is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'The unknown count remains zero and never renders as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, slug routing, model, years, trims, engines, category, severity, status and related links remain frozen.' },
    { code: 'production-write-blocked', severity: 'release-safety', recordIds: allIds, detail: 'No body-only production write is authorized while the frozen 2023-2024 indexed identity conflicts with evidence.' },
  ],
});
