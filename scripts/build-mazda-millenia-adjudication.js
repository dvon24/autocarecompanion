/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-millenia-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MILLENIA', 'MILLENIA S']);
const SEARCH_TERMS = Object.freeze(['coolant', 'elbow', 'joint', 'intake manifold', 'supercharger', 'lysholm', 'bearing', 'seal', 'oil leak', 'strut', 'tower', 'rust', 'corrosion', 'crack', 'window', 'regulator', 'cable']);
const IDS = Object.freeze({
  elbow: 'mazda-millenia-el-joint-coolant-leak-1995',
  supercharger: 'mazda-millenia-miller-cycle-supercharger-2001',
  strut: 'mazda-millenia-strut-tower',
  window: 'mazda-millenia-window-regulator',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.strut, IDS.window].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10002064', '10097300', '10134702', '10134930', '10148068', '10153307',
  '10153315', '10153334', '10170656', '10170817', '10177847', '10203730',
  '10213185', '10226814', '11032103', '11035599', '54320', '617879', '631614',
]);

const PDF_SOURCES = Object.freeze({
  maintenanceAlert: {
    title: 'Mazda Service Alert SA-029/26: Guidelines for Factory Scheduled Maintenance',
    type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032103-0001.pdf',
    localPath: 'C:/tmp/mazda-millenia-sources/MC-11032103-0001.pdf', pages: 4,
    visualPages: [1, 2, 3, 4], bytes: 227885,
    sha256: 'eceee2b68f63a690cc8933c89791c772c018b6324f731689557e63db601ea45b',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 47, '2000-2004': 36, '2005-2009': 3, '2010-2014': 1, '2015-2019': 40, '2020-2024': 38, '2025-2026': 4 },
  totalRows: 169, searchTerms: SEARCH_TERMS, relevantDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 0 },
  totalRows: 0, campaignCount: 0, campaigns: [],
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.elbow]: [OTHER_SOURCES.datasets],
    [IDS.supercharger]: [OTHER_SOURCES.datasets, PDF_SOURCES.maintenanceAlert],
    [IDS.strut]: [OTHER_SOURCES.datasets],
    [IDS.window]: [OTHER_SOURCES.datasets],
  };
  if (!map[id]) throw new Error(`Unexpected Millenia row ${id}`);
  return map[id].map(citation);
}
function contentFor(id) {
  const content = {
    [IDS.elbow]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed 169-row Millenia manufacturer-communication inventory contains no exact coolant-elbow or under-intake joint defect for either the 2.3L KJ-ZEM or 2.5L KL engine. The frozen page relies on a forum URL and a fabricated video identifier, then generalizes one plastic-fitting mechanism to both engines. A hidden coolant loss can lead to overheating, but its source must be located before assigning it to an elbow, hose, gasket, pipe or manifold-area connection.',
      solution: 'If coolant is low, pressure-test the cold cooling system and inspect every accessible hose, pipe, joint, gasket, water outlet and under-intake connection applicable to the exact engine. Do not continue driving an overheating vehicle. Follow the Mazda workshop procedure before intake removal. Do not buy an elbow, fabricated aluminum fitting, hose, intake gasket or cooling-system part from this page; the leaking component and engine-specific fitment have not been established.',
      symptoms: ['coolant loss with no obvious external source', 'coolant residue or odor near the engine', 'overheating requiring immediate diagnosis'],
      summary: 'Removed fabricated/video evidence and the unsupported both-engine plastic-elbow defect and held the identity pending an exact primary source.',
    },
    [IDS.supercharger]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Millenia inventory contains no exact Mazda communication establishing recurring Lysholm supercharger bearing, front-seal or separate-oil-supply failure across 1995-2002. It also does not establish the frozen fixed fluid-change interval, rebuild prices or replacement-engine conversion advice. Mazda Service Alert SA-029/26 says to follow vehicle-specific factory schedules and that services outside those schedules are not recommended.',
      solution: 'For abnormal supercharger noise, oil residue or reduced performance, first verify the exact KJ-ZEM application and diagnose belt drive, intake leaks, controls, lubrication source and supercharger condition with the Mazda workshop procedure. Do not invent a fluid interval outside a published Mazda schedule. Do not buy a supercharger, bearing, seal, oil, rebuild service or replacement engine from this page; the failed component, service requirement and fitment have not been established.',
      symptoms: ['abnormal noise near the supercharger drive requiring localization', 'oil residue requiring source tracing', 'reduced performance requiring intake and control-system diagnosis'],
      summary: 'Removed the unsupported bearing/seal prevalence, 30,000-mile service interval, prices and engine-swap advice and held the identity.',
    },
    [IDS.strut]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Millenia inventory contains no exact Mazda communication or recall establishing front strut-tower structural rust and cracking across 1995-2002. The frozen citations point to a Mazda Tribute complaint and Mazda6 discussion rather than a Millenia primary source. No reviewed source supports the stored 100-owner total or a salt-belt prevalence claim.',
      solution: 'Have a body or structural-repair specialist inspect both towers, seams, inner fenders, load paths, surrounding sheet metal and suspension attachment points. Distinguish surface corrosion, perforation, collision damage and fatigue cracking before deciding whether the vehicle is safe to move or repair. Do not buy reinforcement plates, sheet metal, rust converter, coating or welding supplies from this page; the damage and repair design have not been established.',
      symptoms: ['visible corrosion or perforation near a front strut tower', 'cracking, deformation or movement at a suspension load path', 'suspension alignment or noise concerns requiring structural inspection'],
      summary: 'Proposed the unsupported 100-owner count as zero, removed wrong-model citations and held the structural-rust identity.',
    },
    [IDS.window]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Millenia inventory contains no exact Mazda communication or recall establishing recurring power-window regulator cable failure across 1995-2002. The frozen record has no usable citation, and the reviewed rear-window communications concern defroster grids rather than door-window regulator cables. No reviewed source supports the stored 110-owner total or a driver-side prevalence claim.',
      solution: 'Preserve the window position if the glass is loose, then test the switch, power, ground, wiring, motor, guides, fasteners and regulator mechanism before replacement. Secure glass that could fall inside the door and follow the Mazda workshop procedure for trim and glass removal. Do not buy a regulator, cable, motor, switch or door hardware from this page; the failed component, door position and fitment have not been established.',
      symptoms: ['door glass that will not raise or lower', 'loose or dropped door glass', 'window-motor sound without corresponding glass movement'],
      summary: 'Proposed the unsupported 110-owner count as zero, removed the uncited driver-side/cable assertion and held the regulator identity.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Millenia row ${id}`);
  return content[id];
}
function commerceDecisionFor(id) {
  const map = {
    [IDS.elbow]: 'No universal retail part; locate the leak and verify engine-specific connection and fitment first.',
    [IDS.supercharger]: 'No universal retail part; establish the failed supercharger-related component and Mazda service requirement first.',
    [IDS.strut]: 'No universal retail part; structural inspection and a vehicle-specific repair design are required first.',
    [IDS.window]: 'No universal retail part; diagnose the electrical and mechanical window path and exact door fitment first.',
  };
  return map[id];
}
function identityConflictFor(id) {
  const map = {
    [IDS.elbow]: 'The frozen title asserts an under-intake coolant-elbow defect across both Millenia engines, while no exact Mazda communication establishes that common mechanism or scope.',
    [IDS.supercharger]: 'The frozen title asserts recurring Lysholm bearing and seal failure across 1995-2002, while no exact Mazda communication establishes that defect or the prescribed fluid interval.',
    [IDS.strut]: 'The frozen title asserts Millenia strut-tower rust/cracking, but its citations concern other Mazda models and no exact Millenia primary record establishes the identity.',
    [IDS.window]: 'The frozen title asserts regulator-cable failure across all Millenia years, but the record is uncited and no exact Mazda communication establishes the cable mechanism.',
  };
  return map[id];
}
function evidenceFor(id) {
  const map = {
    [IDS.elbow]: ['All 169 Millenia communication rows and zero recall rows were searched; none identifies the frozen under-intake coolant-elbow defect.'],
    [IDS.supercharger]: ['No exact Millenia communication identifies recurring Lysholm bearing/seal failure.', 'SA-029/26 directs vehicle-specific factory schedules and rejects unscheduled maintenance services.'],
    [IDS.strut]: ['The inventory contains strut oil-seep inspection guidance, not structural tower rust; frozen citations are for Tribute and Mazda6.'],
    [IDS.window]: ['The inventory contains rear-window defroster service, not door-regulator cable failure; the frozen row has no usable citation.'],
  };
  return { primaryEvidence: map[id], limitations: 'No owner-frequency rate, retail fitment, repair price or failed component is inferred beyond exact primary evidence.' };
}
function proposalFor(before, id) {
  const content = contentFor(id);
  return { ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence, symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: content.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Millenia').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 4) throw new Error(`Expected 4 frozen Millenia rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(before, row.id); const content = contentFor(row.id); return { id: row.id, action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: true, identityConflict: identityConflictFor(row.id), reason: content.summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'Millenia', completionStatement: 'All 4 frozen Millenia pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All four frozen identities lack exact Mazda defect support or contain material evidence conflicts; no catalog write is authorized.' },
    safetyContract: ['No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.', 'All 4 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.', 'The unsupported 100- and 110-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.', 'Unknown owner totals are never rendered or written as "0+ owners" social proof.', 'No defect, interval, repair price, part number or prevalence is inferred beyond exact primary evidence.', 'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.', 'Every named replaceable item has an explicit no-universal-retail-part boundary.', 'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.'],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [{ code: 'millenia-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'All four pages assert mechanisms or population scopes not established by exact Millenia primary evidence; all remain indexed.' }, { code: 'millenia-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Stored 100- and 110-owner totals have no reviewed source and are proposal-only zero corrections.' }, { code: 'millenia-wrong-or-fabricated-citations-removed', severity: 'source-correction', recordIds: [IDS.elbow, IDS.strut, IDS.window], detail: 'The frozen evidence includes a fabricated video, wrong-model Tribute/Mazda6 pages and a null citation.' }, { code: 'millenia-maintenance-boundary', severity: 'safety-correction', recordIds: [IDS.supercharger], detail: 'SA-029/26 rejects invented services outside vehicle-specific Mazda schedules; the frozen 30,000-mile interval is removed.' }, { code: 'all-millenia-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Millenia page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' }],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 4, fabricated_report_counts_proposed_zero: 2, total: 4 }, rows,
  };
}
if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, identityConflictFor, proposalFor };
