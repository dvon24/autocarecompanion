/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-ls-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['LS']);
const RECORD_ID = 'lincoln-ls-coolant-cross-leak-aj-v8';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const PDF_SOURCES = Object.freeze({
  tsb: {
    title: 'Ford TSB 01-21-11: 2001-2002 Lincoln LS Hydraulic Cooling Fan Overheat',
    type: 'tsb',
    url: 'https://www.fordservicecontent.com/Ford_Content/pubs/content/~WT/~MUS~LEN/3523/tsb01-21-11.pdf',
    htmlUrl: 'https://www.fordservicecontent.com/Ford_Content/pubs/content/~WT/~MUS~LEN/3523/tsb01-21-11.htm',
    localPath: 'C:/tmp/lincoln-ls-tsb-01-21-11.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 18341,
    sha256: '7f2f642a3f60c0c1e5e0f8716f6313c302145588d9c3f5ea3082d8ca0adfc48c',
  },
  manual2000: {
    title: '2000 Lincoln LS Owner Guide: Engine Coolant and Leak Safety',
    type: 'owner-manual',
    url: 'https://www.fordservicecontent.com/Ford_Content/catalog/owner_guides/00dewog1e.pdf',
    localPath: 'C:/tmp/lincoln-ls-2000-owner-guide.pdf',
    pages: 272,
    visualPages: [204, 205, 206],
    bytes: 2472958,
    sha256: '4e984620d629585e2024cc48fe1b67dc4bfa42e4b2d2bac29fa7af7e73a1ee59',
  },
  manual2006: {
    title: '2006 Lincoln LS Owner Guide: Engine Coolant and Lubricant Specification',
    type: 'owner-manual',
    url: 'https://www.fordservicecontent.com/Ford_Content/catalog/owner_guides/06dewog2e.pdf',
    localPath: 'C:/tmp/lincoln-ls-2006-owner-guide.pdf',
    pages: 320,
    visualPages: [285, 286, 287, 305, 306],
    bytes: 4700631,
    sha256: '312d58935df20dd200c0ca05c5b848c7186fc1a09c30098975af8f0ee431ce58',
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 28, '2000-2004': 287, '2005-2009': 37, '2010-2014': 1, '2015-2019': 3, '2020-2024': 1, '2025-2026': 0 },
  totalRows: 357,
  coolantCrossoverCommunicationMentions: 0,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 4, post: 0 },
  totalRows: 4,
  campaignCount: 3,
  campaigns: ['00V359001', '03V136000', '05V113000'],
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }
function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  Object.assign(proposal, {
    description: 'Coolant loss or overheating on a 3.9L Lincoln LS requires diagnosis before a crossover pipe, thermostat housing or reservoir is blamed. The complete Lincoln LS manufacturer-communication inventory contains no coolant-crossover or coolant-manifold communication supporting the page’s former claim that a plastic rear crossover universally fails across 2000-2006 cars. Ford TSB 01-21-11 instead documents a distinct intermittent hydraulic-cooling-fan cause on 2001-2002 LS vehicles, which can produce overheating and DTCs P1285 or P1299. Ford’s owner guides also instruct owners to have the system inspected when coolant loss persists.',
    solution: 'If the temperature warning or gauge indicates overheating, stop as soon as safely possible, shut the engine off and let it cool; never remove the coolant-reservoir pressure cap while hot. With the engine cold, verify the level and have the system pressure-tested so the exact leak or fan fault is identified. For a 2001-2002 LS with P1285 or P1299, diagnose the hydraulic cooling fan under TSB 01-21-11 rather than assuming a crossover leak. Use the coolant specification for the exact model year: the 2000 guide calls for ESE-M97B44-A and rejects orange/Dex-Cool WSS-M97B44-D, while the 2006 guide specifies Motorcraft Premium Gold WSS-M97B51-A1. Do not buy a crossover pipe, thermostat housing, reservoir, fan motor or universal cooling kit from this page; no universal retail part is recommended, and any replacement or supersession must be confirmed by leak location and VIN.',
    confidence: 'high',
    symptoms: ['coolant loss', 'visible coolant leak', 'engine overheating', 'P1285 or P1299 on a 2001-2002 LS'],
    affectedSystems: ['engine cooling system', 'hydraulic cooling fan (2001-2002 bulletin scope)'],
    dtcCodes: ['P1285', 'P1299'],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: [citation(PDF_SOURCES.tsb), citation(PDF_SOURCES.manual2000), citation(PDF_SOURCES.manual2006)],
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    lastReportedByOwners: '',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: 'Replaced an unsupported universal rear-crossover diagnosis, blanket parts list, cost claim and all-years Gold-coolant instruction with diagnosis-first Ford TSB and owner-guide boundaries.',
  });
  return proposal;
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'LS');
  if (rows.length !== 1 || rows[0].id !== RECORD_ID) throw new Error('Lincoln LS frozen coverage drifted');
  const row = rows[0]; const before = fullRecord(row); const proposal = proposalFor(row);
  const decision = {
    id: row.id,
    action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
    commerceDecision: 'diagnosis-first-no-universal-retail-part',
    evidence: [
      `Complete model inventory: ${BULLETIN_INVENTORY.totalRows} exact LS communications and ${RECALL_INVENTORY.totalRows} exact recall rows across ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`,
      'No exact LS communication summary contains both coolant and crossover/manifold terminology; the former universal failure, rear location, updated metal-flange part and blanket co-replacement advice are not established by the primary-source set.',
      'Ford TSB 01-21-11 applies only to 2001-2002 LS vehicles and identifies intermittent hydraulic cooling-fan operation as a cause of overheating with P1285/P1299.',
      'Visual review of the 2000 and 2006 owner guides proves that coolant specifications changed across the indexed range and that persistent coolant loss requires inspection rather than blind parts replacement.',
      'No search-style commerce or unverified substitute part is introduced.',
    ],
    before,
    beforeSha256: hashValue(before),
    proposal,
    proposalSha256: hashValue(proposal),
    changedFields: diffFields(before, proposal),
  };
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lincoln',
    model: 'LS',
    completionStatement: 'The sole frozen Lincoln LS page is accounted for with a bounded diagnosis-first correction and no indexed-identity change.',
    applicationGate: { status: 'blocked', blockerRecordIds: [RECORD_ID], reason: 'The proposed body correction is material and requires independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or related-link change is authorized.',
      'The indexed page remains published and retains its exact vehicle scope and identity.',
      'The proposal does not convert the broader crossover title into a claim that Ford documented a universal crossover defect.',
      'The solution distinguishes 2001-2002 hydraulic-fan guidance from leak diagnosis across the full indexed range.',
      'No universal retail part is recommended; exact replacement selection is leak- and VIN-dependent.',
      'Unknown owner totals remain zero and are not presented as social proof.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'ls-crossover-claim-not-established', severity: 'critical-correction', recordIds: [RECORD_ID], detail: 'No exact LS communication in the complete inventory supports the former universal plastic rear-crossover failure and metal-flange-part narrative.' },
      { code: 'ls-overheat-has-distinct-fan-cause', severity: 'safety-boundary', recordIds: [RECORD_ID], detail: 'Ford TSB 01-21-11 identifies intermittent hydraulic fan failure only for 2001-2002 LS vehicles.' },
      { code: 'ls-coolant-spec-varies-by-year', severity: 'fluid-safety', recordIds: [RECORD_ID], detail: 'The 2000 owner guide specifies ESE-M97B44-A; the 2006 guide specifies Premium Gold WSS-M97B51-A1.' },
      { code: 'ls-page-preserved', severity: 'seo-safety', recordIds: [RECORD_ID], detail: 'The sole LS page remains published with its exact title, URL identity and vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 1, total: 1 },
    rows: [decision],
  };
}

if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { BULLETIN_INVENTORY, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, RECORD_ID, REVIEW_DATE, SNAPSHOT, buildPacket, proposalFor, publicPdfSources };
