/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ dpf: 'peugeot-5008-dpf-blockage', suspension: 'peugeot-5008-suspension-creak' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = allIds;
const content = Object.freeze({
  [ids.dpf]: Object.freeze({
    description: 'The frozen page cites only a forum home page and assigns 2009-2026 Peugeot 5008 diesels premature DPF blockage with 55 owner reports, heavier-body causation and school-run/city use as primary triggers. Engine and aftertreatment designs vary across those eighteen years; soot, ash, pressure/temperature sensing, additive equipment where fitted, fueling, EGR, turbo, oil faults, exhaust leaks and operating pattern remain separate.',
    solution: 'Identify the engine and aftertreatment design; capture DTCs, soot/ash estimates, differential pressure, temperature and regeneration history; correct sensor, additive, engine or exhaust faults before controlled regeneration. Do not force regeneration when oil level, loading, exhaust temperature or fire safety makes it unsafe. Do not buy Eolys additive, a sensor or DPF from this page; system design, cause and VIN fitment must be established first.',
    symptoms: ['aftertreatment design identified', 'soot, ash, pressure and temperature measured', 'regeneration safety and upstream faults checked'], affectedSystems: ['DPF', 'pressure, temperature and additive systems where equipped', 'fueling, EGR, turbo and exhaust'],
    evidence: ['The complete NHTSA corpus contains zero Peugeot 5008 variants.', 'A forum home page does not prove an eighteen-year population.', 'The 55-owner and heavier-body/primary-trigger claims are unsupported.'], conflict: 'The identity treats changing diesel systems and use patterns as one premature-blockage defect with fabricated social proof.', summary: 'Held the overbroad DPF identity, reduced 55 reports to unknown and bounded additive/regeneration advice.', citations: ['datasets', 'peugeotRecallCheck'], commerceDecision: 'engine, aftertreatment architecture, restriction cause and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.suspension]: Object.freeze({
    description: 'The frozen page cites only a forum home page and assigns every 2009-2026 5008 a front creak/knock defect caused primarily by drop links and strut top mounts, with 50 owner reports. Similar noises can involve wheel security, tires, brakes, ball joints, control-arm bushes, springs, dampers, steering joints, subframe, body mounts or collision damage, and suspension architecture changes across generations.',
    solution: 'Check wheel security and limit use if steering, braking or stability is affected. Reproduce the noise safely and inspect loaded/unloaded links, bushes, ball joints, springs, struts, mounts, steering, brakes and subframe before replacement. Use only approved lubrication where the service procedure calls for it. Do not buy drop links, top mounts, bearings or control arms from this page; side, failed component, generation and VIN fitment must be established first.',
    symptoms: ['wheel security and handling risk checked', 'noise reproduced under controlled conditions', 'links, joints, strut, steering and brake paths separated'], affectedSystems: ['anti-roll-bar links and bushes', 'struts, springs and top mounts', 'ball joints, control arms, steering, brakes and subframe'],
    evidence: ['The complete NHTSA corpus contains zero Peugeot 5008 variants.', 'A forum home page does not prove primary culprits across eighteen years.', 'The 50-owner count has no traceable dataset.'], conflict: 'The identity converts one noise pattern into an eighteen-year parts hierarchy and fabricated social proof.', summary: 'Held the broad suspension-noise identity, reduced 50 reports to unknown and required component-level diagnosis.', citations: ['datasets', 'peugeotRecallCheck'], commerceDecision: 'noise source, side, suspension generation and VIN fitment remain unresolved; no universal retail part',
  }),
});
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' }, peugeotRecallCheck: { title: 'Peugeot Official Safety Recall Campaign Check', type: 'manufacturer', url: 'https://www.peugeot.co.uk/tools/recall-campaigns.html', contains: 'Check recall campaigns for my vehicle' } });
module.exports = Object.freeze({
  make: 'Peugeot', model: '5008', slug: '5008', reviewDate: '2026-08-10', snapshotFile: 'data/_peugeot-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-peugeot-5008-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PEUGEOT'], modelAliases: ['5008', '5008 V2', 'E-5008'], searchTerms: ['DPF', 'regeneration', 'Eolys', 'additive', 'suspension', 'creak', 'knock', 'drop link', 'strut mount'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains zero PEUGEOT 5008/5008 V2/E-5008 rows; this disclosed U.S.-corpus limitation is not treated as disproof.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero PEUGEOT 5008 variants; market-specific campaigns remain VIN-gated through Peugeot.' },
  content,
  requiredProse: [
    { id: ids.dpf, field: 'description', patterns: ['heavier-body causation', '55 owner reports'] },
    { id: ids.dpf, field: 'solution', patterns: ['Do not force regeneration', 'Do not buy Eolys additive'] },
    { id: ids.suspension, field: 'description', patterns: ['primarily by drop links', '50 owner reports'] },
    { id: ids.suspension, field: 'solution', patterns: ['Check wheel security', 'Do not buy drop links'] },
  ],
  observations: [
    { code: 'both-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both 5008 pages remain published and held.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero PEUGEOT 5008 variants; absence is not disproof.' },
    { code: 'forum-homepages-only', severity: 'source-integrity', recordIds: allIds, detail: 'Both frozen pages cite only forum home pages.' },
    { code: 'eighteen-year-scopes', severity: 'technical-accuracy', recordIds: allIds, detail: 'Both identities cross changing vehicle and system generations.' },
    { code: 'dpf-weight-cause-unverified', severity: 'source-integrity', recordIds: [ids.dpf], detail: 'Heavier-body and primary-use-trigger claims lack exact evidence.' },
    { code: 'dpf-architecture-not-universal', severity: 'technical-accuracy', recordIds: [ids.dpf], detail: 'Eolys and aftertreatment design are not assumed across every year.' },
    { code: 'regeneration-safety', severity: 'safety-accuracy', recordIds: [ids.dpf], detail: 'Oil, loading, temperature and fire conditions gate regeneration.' },
    { code: 'suspension-parts-not-diagnosis', severity: 'technical-accuracy', recordIds: [ids.suspension], detail: 'Drop links and top mounts are not selected from noise alone.' },
    { code: 'wheel-security-boundary', severity: 'safety-accuracy', recordIds: [ids.suspension], detail: 'Wheel, steering, brake and stability risks are checked first.' },
    { code: 'counts-unsupported', severity: 'social-proof-safety', recordIds: allIds, detail: 'Counts 55 and 50 are reduced to unknown.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No parts or search links are introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown counts never render as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, category, severity, status and routing remain frozen.' },
  ],
});
