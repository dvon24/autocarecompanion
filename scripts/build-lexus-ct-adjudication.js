/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-ct-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const IDS = Object.freeze({
  battery: 'lexus-ct-hybrid-battery-degradation-2011',
  pump: 'lexus-ct-water-pump-failure-2011',
});
const MODEL_ALIASES = Object.freeze(['CT', 'CT HYBRID', 'CT 200H', 'CT200H']);
const PDF_SOURCES = Object.freeze({
  batteryCooling: {
    title: 'L-SB-0028-20 — HV Battery Cooling System Maintenance',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10179595-9999.pdf',
    localPath: 'C:/tmp/MC-10179595-9999.pdf',
    nhtsaDocumentId: '10179595',
    pages: 9,
    bytes: 555259,
    sha256: '4b9ca0f7c627bad91da5190c5e6398b5f1d98efb8bd6d5b983e45d8d71727998',
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 9, '2015-2019': 407, '2020-2024': 141, '2025-2026': 5 },
  totalRows: 562,
  supportingBatteryDocumentIds: ['10179595', '10179691'],
  postReplacementOnlyDocumentIds: ['10133922'],
  nonSupportingCoolantDocumentIds: ['10042930', '10046219'],
  sourceFiles: SOURCE_FILES.map(({ path: _path, ...source }) => source),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 2 },
  totalRows: 2,
  uniqueCampaignYearModelRows: 2,
  campaignCount: 1,
  campaigns: ['16V487000'],
  mappedCampaigns: [],
  deferredCampaigns: ['16V487000'],
  sourceFiles: RECALL_FILES.map(({ path: _path, ...source }) => source),
});

function citationsFor(id) {
  if (id === IDS.battery) return [
    { type: 'tsb', title: PDF_SOURCES.batteryCooling.title, url: PDF_SOURCES.batteryCooling.url },
    { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL },
  ];
  return [
    { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL },
    { type: 'nhtsa', title: 'NHTSA Recall datasets', url: RECALL_DATASET_URL },
  ];
}

function contentFor(id) {
  if (id === IDS.battery) return {
    description: 'Lexus bulletin L-SB-0028-20 documents dust, lint or debris in the CT200h HV-battery cooling fan or intake filter and says that condition can reduce cooling-system efficiency. It does not establish traction-battery capacity degradation across every 2011-2017 CT200h, accelerated failure in hot climates, cell imbalance, or interchangeability with a third-generation Prius service battery. The complete federal communication inventory contains post-replacement guidance, but no record that verifies the page’s prevalence or refurbished-pack claims.',
    solution: 'Do not purchase a traction-battery pack from this page. Record the warning lights and hybrid-control DTCs, inspect the HV-battery cooling intake and fan under L-SB-0028-20, and have battery state-of-charge and block-voltage data evaluated under the VIN-specific Lexus repair procedure. High-voltage battery diagnosis and service require qualified hybrid-system personnel. No universal retail part or dealer-only remedy is asserted.',
    summary: 'Replaced unsupported degradation, Prius-interchangeability, price and refurbished-pack claims with a source-bounded diagnostic hold and exact Lexus cooling-maintenance evidence.',
  };
  if (id === IDS.pump) return {
    description: 'The complete Lexus CT/CT Hybrid federal communication inventory does not document the page’s claimed premature electric water-pump failure. CT records 10042930 and 10046219 address an improper coolant mixture and an exhaust-gas-control actuator coolant leak; neither identifies an inverter/electric-motor coolant pump defect. The current forum-only narrative therefore does not establish the failed component, prevalence or all-year scope.',
    solution: 'Do not replace a water pump from this page. Record the warning lights and DTCs, identify whether the engine, hybrid-power-electronics or exhaust-heat-recovery cooling circuit is involved, and inspect coolant level, circulation and leakage under the VIN-specific Lexus repair procedure. High-voltage-adjacent diagnosis requires qualified hybrid-system personnel. No universal retail part or dealer-only remedy is asserted.',
    summary: 'Removed the unsupported all-year electric-pump failure and replacement instruction and held the page for exact circuit, DTC and factory-procedure evidence.',
  };
  throw new Error(`Unexpected CT record ${id}`);
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = 'low';
  proposal.symptoms = [];
  proposal.affectedSystems = [];
  proposal.dtcCodes = [];
  proposal.estimatedCostLow = null;
  proposal.estimatedCostHigh = null;
  proposal.typicalMileageLow = null;
  proposal.typicalMileageHigh = null;
  proposal.citations = citationsFor(row.id);
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

function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact CT/CT Hybrid manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} exact recall rows were replayed.`;
  if (row.id === IDS.battery) return [common, 'L-SB-0028-20 supports HV-battery cooling fan/filter maintenance for 2011-2017 CT200h, not pack degradation or Prius service-part interchangeability.', 'Document 10133922 concerns checks after an HV battery has already been replaced and does not prove a common failure or authorize a pack choice.'];
  return [common, 'No exact CT communication supports premature electric water-pump failure; records 10042930 and 10046219 concern a coolant mixture and exhaust-gas-control actuator leak instead.', 'The frozen page has only a forum citation and no exact DTC, pump identity, part number or fitment evidence.'];
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'CT').sort((a, b) => a.id.localeCompare(b.id));
  const blockerIds = rows.map((row) => row.id);
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return { id: row.id, action: 'targeted_safety_cleanup_pending_source', commerceDecision: 'blocked-no-exact-fitment-no-retail-part', evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'CT',
    completionStatement: 'Both frozen CT pages remain published with unchanged indexed identity and receive blocked corrective rewrites; one exact Lexus bulletin supports only HV-battery cooling maintenance, while no federal source supports the electric-pump failure identity.',
    applicationGate: { status: 'blocked', blockerRecordIds: blockerIds, reason: 'Both existing titles assert common failures that the complete primary inventory does not establish. Independent review is required before any body-copy application.' },
    safetyContract: ['No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change or new issue is authorized.','Both IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain unchanged.','No battery, pump, fluid or replacement procedure is approved without exact factory-document and vehicle-configuration support.','All 562 exact manufacturer-communication rows and both exact recall rows were replayed; the unrelated air-bag campaign is deferred.'],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'ct-battery-claim-bounded', severity: 'critical-correction', recordIds: [IDS.battery], detail: 'L-SB-0028-20 supports cooling-fan/filter maintenance, not universal pack degradation, Prius interchangeability, prices or a refurbished brand.' },
      { code: 'ct-water-pump-identity-unsupported', severity: 'critical-correction', recordIds: [IDS.pump], detail: 'The full federal inventory contains no exact CT electric-water-pump failure record; two coolant records concern different conditions.' },
      { code: 'ct-secondary-citations-not-promoted', severity: 'accuracy-safety', recordIds: blockerIds, detail: 'Neither frozen forum citation is treated as prevalence, fitment or replacement proof.' },
      { code: 'ct-no-unverified-commerce', severity: 'commerce-safety', recordIds: blockerIds, detail: 'The unverified refurbished-pack recommendation and every guessed replacement are removed; no search or guessed deep link is introduced.' },
      { code: 'ct-airbag-campaign-deferred', severity: 'new-issue-deferred', recordIds: [], campaignNumbers: ['16V487000'], detail: 'The separate curtain-air-bag campaign remains deferred until the remaining-make audit is complete.' },
      { code: 'all-ct-pages-preserved', severity: 'seo-safety', recordIds: blockerIds, detail: 'Every CT ID, title, category, indexed year set, trim set, engine set, allowed severity and publication state remains preserved.' },
    ],
    pdfSources: Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: [],
    deferredCampaigns: ['16V487000'],
    summary: { targeted_safety_cleanup_pending_source: rows.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate.status }, null, 2));
}

module.exports = { BULLETIN_INVENTORY, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor };
