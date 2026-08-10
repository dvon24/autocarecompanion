/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const id = 'opel-crossland-1.2-puretech-oil-bath-belt';
const allIds = Object.freeze([id]);
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

const content = Object.freeze({
  [id]: Object.freeze({
    description: 'Stellantis officially recognizes excessive oil consumption and premature timing-belt degradation on previous generations of PureTech 1.0 and 1.2 engines, with conditional coverage up to 10 years or 112,000 miles. That announcement does not identify the Crossland, prove every frozen 2017-2022 EB2DTS vehicle uses an affected generation, or support the frozen mineral-oil mechanism, complete oil-starvation sequence, DTCs, mileage range and catastrophic-outcome claim for this indexed population.',
    solution: 'Identify the exact engine generation and timing-drive design from the VIN and current Opel/Vauxhall service information. Follow the specified oil and maintenance plan rather than a product recommendation copied from this page, document any oil-pressure warning or visible belt concern, and ask an authorized repairer to assess Stellantis support eligibility before work. Stop driving if an oil-pressure warning appears. Do not buy oil, a belt kit, strainer or engine from this page; specification, generation, diagnosis and exact VIN fitment must be established first.',
    symptoms: ['engine generation and timing drive verified', 'oil-pressure warning treated as a stop condition', 'maintenance history retained for support eligibility'],
    affectedSystems: ['PureTech timing drive', 'engine lubrication and oil pickup', 'VIN-gated support eligibility'],
    evidence: ['Stellantis recognizes premature timing-belt degradation on previous PureTech generations.', 'The official policy is conditional and extends to 10 years or 112,000 miles.', 'The official announcement does not map the affected generations or frozen technical claims to Crossland.'],
    conflict: 'The indexed identity maps family-level PureTech evidence plus unsupported mechanism, DTC, interval, mileage and cost details to every 2017-2022 Crossland with the frozen engine label.',
    summary: 'Held the overbroad Crossland wet-belt identity and removed unverified oil product, interval, DTC, mileage and cost claims.',
    citations: ['stellantisPuretech'],
    commerceDecision: 'engine generation, oil specification, failure path and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  stellantisPuretech: {
    title: 'Stellantis PureTech 1.0 and 1.2 Extended Support Policy',
    type: 'manufacturer',
    url: 'https://www.media.stellantis.com/uk-en/vauxhall/press/stellantis-extends-compensation-policy-for-european-consumers-claims-on-previous-generations-of-puretech-1-0-and-1-2-engines',
    contains: 'premature degradation of the timing belt',
  },
});

module.exports = Object.freeze({
  make: 'Opel', model: 'Crossland', slug: 'crossland', reviewDate: '2026-08-10',
  snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-opel-crossland-adjudication-2026-08-10.json',
  ids: Object.freeze({ wetBelt: id }), allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['OPEL', 'VAUXHALL'], modelAliases: ['CROSSLAND', 'CROSSLAND X'],
  searchTerms: ['PureTech', 'timing belt', 'wet belt', 'oil pressure', 'EB2DTS'],
  relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL CROSSLAND/CROSSLAND X rows; this is a disclosed U.S.-corpus limitation.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL CROSSLAND/CROSSLAND X rows; no recall identity is inferred from that absence.',
  },
  content,
  requiredProse: [
    { id, field: 'description', patterns: ['does not identify the Crossland', 'every frozen 2017-2022 EB2DTS vehicle', 'mineral-oil mechanism', 'DTCs, mileage range'] },
    { id, field: 'solution', patterns: ['rather than a product recommendation', 'Stop driving if an oil-pressure warning appears', 'Do not buy oil'] },
  ],
  observations: [
    { code: 'single-row-held', severity: 'identity-safety', recordIds: [id], detail: 'The only Crossland page remains published but is held because family-level evidence does not prove the frozen model population.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: [id], detail: 'NHTSA has zero OPEL/VAUXHALL CROSSLAND rows; that geographic limit is disclosed.' },
    { code: 'puretech-family-not-crossland-population', severity: 'technical-accuracy', recordIds: [id], detail: 'Stellantis does not map affected previous generations to every 2017-2022 frozen Crossland.' },
    { code: 'oil-product-prescription-removed', severity: 'commerce-safety', recordIds: [id], detail: 'The frozen page prescribes a named oil product without exact VIN specification; the proposal requires service-information verification.' },
    { code: 'mineral-oil-mechanism-unsupported', severity: 'technical-accuracy', recordIds: [id], detail: 'The claim that mineral or low-quality synthetic oil causes the defect is not in the official policy.' },
    { code: 'interval-claim-unsupported', severity: 'technical-accuracy', recordIds: [id], detail: 'The frozen 100,000-km/six-year interval and repeated revision claim are not established by the official announcement.' },
    { code: 'dtc-claims-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'P0524 and P0521 are removed because the official policy does not make them Crossland wet-belt identifiers.' },
    { code: 'mileage-range-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The frozen 60,000-100,000 mileage range lacks exact model evidence.' },
    { code: 'cost-claim-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The frozen EUR 800-6,000 repair range and EUR 5,000-plus engine claim are unsupported.' },
    { code: 'catastrophic-outcome-bounded', severity: 'safety-accuracy', recordIds: [id], detail: 'Family-level timing-belt concern is not converted into a guaranteed catastrophic Crossland outcome.' },
    { code: 'stop-warning-preserved', severity: 'safety-accuracy', recordIds: [id], detail: 'The proposal retains a conservative stop-driving boundary for an oil-pressure warning.' },
    { code: 'no-commerce-introduced', severity: 'commerce-safety', recordIds: [id], detail: 'No retail part or search link is introduced; the named oil shopping path is removed.' },
    { code: 'no-owner-social-proof', severity: 'social-proof-safety', recordIds: [id], detail: 'The frozen report count is unknown zero and no 0+ owner language is introduced.' },
    { code: 'crossland-page-preserved', severity: 'seo-safety', recordIds: [id], detail: 'The URL, title, years, trims, engine, category, severity and published status remain byte-preserved.' },
  ],
});
