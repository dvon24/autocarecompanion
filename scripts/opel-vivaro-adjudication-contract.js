/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const id = 'opel-vivaro-b-1.6-biturbo-timing-chain';
const allIds = Object.freeze([id]);
const content = Object.freeze({
  [id]: Object.freeze({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2014-2019 Vivaro B R9M timing-chain-stretch population, a 100,000-180,000-km onset or increased failure from stop-start fleet use. Renault Trafic III and Movano engine-family use does not prove one Vivaro defect, and the frozen P0016, P0017 and P0335 codes are not exact identifiers for chain stretch.',
    solution: 'Record cold-start noise duration, oil level and specification, service history, DTCs and measured cam/crank correlation, then use current Opel/Vauxhall service information for the exact engine code. Localize accessory, valvetrain and timing-drive noise before opening or removing the engine. If timing loss is suspected, stop cranking. Do not buy a chain kit, sprockets or engine from this page; the failure path, service procedure and exact VIN fitment must be established first.',
    symptoms: ['cold-start noise timed and localized', 'oil and service history recorded', 'cam/crank correlation measured before timing work'],
    affectedSystems: ['R9M timing drive', 'chain tensioning and lubrication', 'cam/crank timing control'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Vivaro rows.', 'Cross-model R9M use does not establish a Vivaro population.', 'No exact source supports the frozen mileage, DTC, fleet-use, oil-interval or cost claims.'],
    conflict: 'The indexed identity converts uncited cross-model engine-family claims into a six-year Vivaro defect with specific mileage, DTC, oil and repair prescriptions.',
    summary: 'Held the unsupported Vivaro timing-chain identity and removed cross-model, mileage, DTC, oil, interval, engine-drop and cost assumptions.',
    citations: ['datasets'],
    commerceDecision: 'failure path, engine variant, service procedure and VIN fitment remain unresolved; no universal retail part',
  }),
});
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' } });
module.exports = Object.freeze({
  make: 'Opel', model: 'Vivaro', slug: 'vivaro', reviewDate: '2026-08-10', snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-opel-vivaro-adjudication-2026-08-10.json',
  ids: Object.freeze({ timingChain: id }), allIds, retainedIds: Object.freeze([]), reportCountCleanupIds: Object.freeze([]), sourceMakes: ['OPEL', 'VAUXHALL'], modelAliases: ['VIVARO', 'VIVARO B'],
  searchTerms: ['timing chain', 'chain', 'R9M', 'engine', 'misfire', 'oil'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL VIVARO/VIVARO B rows; this is a disclosed U.S.-corpus limitation.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL VIVARO variants; no recall identity is inferred from the absence.' },
  content,
  requiredProse: [
    { id, field: 'description', patterns: ['Renault Trafic III and Movano engine-family use does not prove', 'P0016, P0017 and P0335 codes are not exact identifiers', 'stop-start fleet use'] },
    { id, field: 'solution', patterns: ['If timing loss is suspected, stop cranking', 'Do not buy a chain kit'] },
  ],
  observations: [
    { code: 'single-row-held', severity: 'identity-safety', recordIds: [id], detail: 'The only Vivaro page remains published but is held for lack of exact primary evidence.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: [id], detail: 'NHTSA has zero OPEL/VAUXHALL VIVARO rows; that geographic limitation is disclosed.' },
    { code: 'renault-cross-model-transfer', severity: 'technical-accuracy', recordIds: [id], detail: 'Trafic III and Movano R9M use does not establish a Vivaro timing-chain population.' },
    { code: 'mileage-range-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The frozen 100,000-180,000-km onset lacks exact evidence.' },
    { code: 'fleet-use-claim-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The stop-start fleet-use acceleration claim lacks exact evidence.' },
    { code: 'dtc-claims-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'P0016, P0017 and P0335 are not treated as exact chain-stretch identifiers.' },
    { code: 'oil-spec-claim-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The frozen C4 low-SAPS 5W-30 prescription is not applied without VIN service information.' },
    { code: 'interval-claim-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The universal 15,000-km maximum interval is unsupported.' },
    { code: 'engine-drop-claim-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The frozen assertion that the job often requires an engine drop is not established.' },
    { code: 'cost-claims-removed', severity: 'technical-accuracy', recordIds: [id], detail: 'The frozen EUR 1,200-1,800 and EUR 1,200-4,500 cost claims are unsupported.' },
    { code: 'stop-cranking-boundary', severity: 'safety-accuracy', recordIds: [id], detail: 'The proposal preserves a stop-cranking boundary when timing loss is suspected.' },
    { code: 'no-commerce-introduced', severity: 'commerce-safety', recordIds: [id], detail: 'No chain kit or engine shopping path is introduced.' },
    { code: 'no-owner-social-proof', severity: 'social-proof-safety', recordIds: [id], detail: 'The report count is unknown zero and no 0+ owner text is introduced.' },
    { code: 'vivaro-page-preserved', severity: 'seo-safety', recordIds: [id], detail: 'URL, title, years, trims, engine, category, severity and status remain byte-preserved.' },
  ],
});
