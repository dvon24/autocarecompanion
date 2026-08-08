/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-es300-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const ID = 'lexus-es300-1mz-fe-v6-engine-oil-sludge-failure';
const MODEL_ALIASES = Object.freeze(['ES 300', 'ES300']);
const SUPPORTING_DOCUMENT_IDS = Object.freeze(['628655', '633821', '633830']);
const CAMPAIGNS = Object.freeze(['01V371000', '01V372000', '94V039000', '97V156000', '99V307000']);
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 28, '2000-2004': 66, '2005-2009': 5, '2010-2014': 3, '2015-2019': 37, '2020-2024': 41, '2025-2026': 0 },
  totalRows: 180,
  supportingDocumentIds: SUPPORTING_DOCUMENT_IDS,
  sourceFiles: SOURCE_FILES.map(({ path: _path, ...source }) => source),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 9, post: 0 },
  totalRows: 9,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: [],
  deferredCampaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ path: _path, ...source }) => source),
});

function citationsFor() {
  return [{
    type: 'nhtsa',
    title: 'NHTSA Manufacturer Communications datasets (documents 628655, 633821 and 633830)',
    url: NHTSA_DATASET_URL,
  }];
}

function contentFor() {
  return {
    description: 'Lexus manufacturer communications filed with NHTSA document a special policy/customer-satisfaction program for oil gelling or sludge on certain 1997-2002 ES300 vehicles with the 1MZ-FE six-cylinder engine. The page\'s 1997-1999 model years fall within that documented population. The available primary records support the condition and historical repair program, but they do not establish this page\'s asserted drainback-passage design flaw, cylinder-head heat theory, class-action history, universal bearing damage or short-trip causal rule.',
    solution: 'If oil gelling or sludge is suspected, stop driving when an oil-pressure warning, abnormal engine noise or loss of oil pressure is present and have the engine inspected under current VIN-specific Lexus service information. The Lexus special policy was historical, so this page does not promise a free repair in 2026. Do not use chemical flushes, repeated 1,000-2,000-mile flushing intervals, a viscosity change or a universal teardown instruction from this page. Follow the owner-manual oil specification and maintenance schedule unless current Lexus service information directs otherwise. No universal retail part or dealer-only remedy is asserted.',
    summary: 'Preserved the exact ES300/1MZ-FE sludge identity while replacing unsupported causal theories, current free-repair language, home-flush instructions, universal teardown advice and secondary citations with the exact Lexus/NHTSA program record.',
  };
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor();
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = 'high';
  proposal.symptoms = [];
  proposal.affectedSystems = [];
  proposal.dtcCodes = [];
  proposal.estimatedCostLow = null;
  proposal.estimatedCostHigh = null;
  proposal.typicalMileageLow = null;
  proposal.typicalMileageHigh = null;
  proposal.citations = citationsFor();
  proposal.communityRecommendations = [];
  proposal.fixParts = [];
  proposal.humanApproved = false;
  proposal.reportCount = 0;
  proposal.source = 'manual';
  proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE;
  proposal.contentUpdatedOn = REVIEW_DATE;
  proposal.contentUpdateSummary = content.summary;
  proposal.relatedIssueIds = [];
  return proposal;
}

function evidenceFor() {
  return [
    `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact ES300 manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`,
    'NHTSA document 628655 explicitly identifies a special policy adjustment for 1997-2001 ES300 mechanical engine problems attributable to oil gelling or sludge.',
    'NHTSA documents 633821 and 633830 identify 1MZ-FE oil-gelling repairs and a 1997-2002 customer-satisfaction population; none promises present-day coverage or supports the page\'s home-flush and design-cause claims.',
  ];
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'ES300').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'rewrite_same_identity',
      commerceDecision: 'vin-specific-diagnostic-no-retail-part',
      evidence: evidenceFor(),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'ES300',
    completionStatement: 'The sole frozen ES300 page retains its indexed identity and receives a source-bounded rewrite supported by three exact Lexus/NHTSA oil-gelling program records.',
    applicationGate: { status: 'blocked', blockerRecordIds: [ID], reason: 'The current live body contains unsafe flush instructions and unsupported causal/warranty claims; the safe same-identity rewrite requires independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'The ES300 ID, title, category, indexed year set, trim set, engine set, allowed severity and publication state remain unchanged.',
      'Historical Lexus program coverage is not represented as a current warranty promise.',
      'No chemical flush, shortened flush interval, viscosity change, teardown, engine replacement or retail part is approved from this page.',
      'All 180 exact manufacturer-communication rows and 9 exact recall rows / 5 campaigns were replayed; separate recall identities remain deferred.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'es300-oil-gelling-identity-supported', severity: 'exact-rewrite', recordIds: [ID], documentIds: SUPPORTING_DOCUMENT_IDS, detail: 'Three exact Lexus/NHTSA records support the 1997-2002 ES300/1MZ-FE oil-gelling identity.' },
      { code: 'es300-unsafe-home-repair-removed', severity: 'critical-correction', recordIds: [ID], detail: 'Unsupported chemical/short-interval flushing, viscosity changes, annual PCV replacement, teardown and universal engine-replacement instructions are removed.' },
      { code: 'es300-historical-coverage-bounded', severity: 'warranty-safety', recordIds: [ID], detail: 'The historical special policy/customer-satisfaction program is disclosed without promising a free repair in 2026.' },
      { code: 'es300-no-unverified-commerce', severity: 'commerce-safety', recordIds: [ID], detail: 'No guessed part, search link or universal replacement product is introduced.' },
      { code: 'es300-five-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: CAMPAIGNS, detail: 'Five separate recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-es300-pages-preserved', severity: 'seo-safety', recordIds: [ID], detail: 'The ES300 ID, title, category, indexed years, trims, engine, severity and publication state remain preserved.' },
    ],
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: [],
    deferredCampaigns: CAMPAIGNS,
    summary: { rewrite_same_identity: 1, total: 1 },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BULLETIN_INVENTORY, CAMPAIGNS, ID, MODEL_ALIASES, OUTPUT, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, SUPPORTING_DOCUMENT_IDS, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor };
