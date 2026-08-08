/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-k900-adjudication-2026-08-08.json');

const IDS = {
  transmission: 'kia-k900-transmission-harsh-shift-2015',
  suspension: 'kia-k900-air-suspension-2015',
  drl: 'kia-k900-drl-led-module-2015',
  engine: 'kia-k900-engine-bearing-2015',
  infotainment: 'kia-k900-infotainment-freeze-2015',
};

const PDF_SOURCES = {
  transmission: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200512-0001.pdf',
    sha256: '0f846963babb0e0980b97acac30d04c115d269e93a82544d8f6069de7b73d07f',
    visuallyInspectedPages: [1, 2, 3, 4],
    markers: ['TRA096', '2015-2016MY K900', 'Tau 5.0L', '35R and 4&OD solenoid valves'],
  },
  infotainment: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10109806-9999.pdf',
    sha256: 'd149bbfc0d039635eb305d8101c2c8ee94783414ccf63b326ecac554bf8491fd',
    visuallyInspectedPages: [1, 2, 3],
    markers: ['ELE122', '2015MY K900', 'Application Error', 'system reboots or blank screen'],
  },
  lighting: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10183611-0001.pdf',
    sha256: 'da92397f19a8d115da7d1a0eacf6ac90c093c322545b4fe4810431bf45e5e9ed',
    visuallyInspectedPages: [1, 2, 3],
    markers: ['SC 130', '2015~2016MY K900', 'Multi-Function Switch', 'headlights may flicker'],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedK900Rows: 77 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedK900Rows: 28 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedK900Rows: 4 },
  },
  totalExpectedK900Rows: 109,
  requiredDocumentIds: ['10109806', '10183611', '10200512'],
};

const FLAT_RECALL_SOURCE = {
  url: 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip',
  retrievedOn: '2026-08-07',
  archiveSha256: '59f15be5de0bde8768606fb03b1135e7fca5bc2c56041c7cfdac9b0d137e6a0f',
  extractedFile: 'FLAT_RCL_POST_2010.txt',
  extractedSha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70',
};

const EXPECTED_FLAT_RECALL_INVENTORY = {
  2015: ['16V210000', '23V652000'],
  2016: ['16V210000', '22V051000', '23V652000'],
  2017: ['22V051000', '23V652000'],
  2018: ['22V051000', '23V652000'],
  2019: ['24V169000'],
  2020: ['24V169000'],
};

const DEFERRED_CAMPAIGNS = ['16V210000', '22V051000', '23V652000', '24V169000'];

const DECISIONS = {
  [IDS.transmission]: {
    action: 'remove_inexact_relation_and_search_commerce_pending_source',
    commerceDecision: 'unresolved-no-retail-link-until-exact-scope-and-fitment',
    clearCommerce: true,
    clearRelated: true,
    reason: 'Rendered Kia TRA096 supports abnormal 2-3, 3-4 and 4-5 upshift shock only on some 2015-2016 K900 KH vehicles with the Tau 5.0L and A8LR1 shift-by-wire transmission, caused by premature 35R/4&OD solenoid wear. The frozen page instead spans 2015-2020, attributes a light-throttle 2-3 shift to torque-converter lockup and calibration, recommends a fluid exchange and valve body, and links to a different Cadenza downshift/surge identity. The proposal removes the inexact relation and unverified search commerce but leaves the substantive page blocked.',
  },
  [IDS.suspension]: {
    action: 'remove_search_commerce_pending_source',
    commerceDecision: 'unresolved-no-retail-link-until-exact-part-number-and-fitment',
    clearCommerce: true,
    reason: 'The complete 109-row official K900 communication inventory contains no exact package establishing rear air-spring bladder/crimp leakage, compressor burnout, the 4-6-year rate or the claimed Arnott/Continental/coil-conversion remedies across 2015-2020. The Hyundai Equus relation is a plausible shared-system sibling rather than proof of K900 fitment. The proposal removes unverified search commerce and leaves the substantive page blocked.',
  },
  [IDS.drl]: {
    action: 'remove_false_citation_and_search_commerce_pending_source',
    commerceDecision: 'unresolved-no-retail-link-until-primary-source-correction',
    clearCommerce: true,
    clearCitations: true,
    reason: 'The cited YouTube ID "abcd1234efg" is a generic example placeholder, not a verifiable K900 repair source. Rendered SC130 covers a VIN-limited 2015-2016 LED-headlight multi-function-switch defect that can make the headlights flicker or turn off; it does not support an integrated DRL-module burnout identity, 2015-2018 driver-board fitment or generic relay/bulb/headlamp commerce. The proposal removes the false citation and search commerce but leaves the substantive page blocked.',
  },
  [IDS.engine]: {
    action: 'remove_unverifiable_citations_and_search_commerce_pending_source',
    commerceDecision: 'unresolved-no-retail-link-until-exact-part-number-and-fitment',
    clearCommerce: true,
    clearCitations: true,
    reason: 'The two forum-style citations contain source labels but no URLs or exact threads, and the complete 109-row official K900 inventory contains no package establishing one 2015-2017 timing-chain-tensioner and GDI-injector failure aggregation, the claimed bleed-down/carbon mechanisms, 5,000-mile oil rule or Liqui Moly cleaner interval. The proposal removes unverifiable citation signals and search commerce while retaining the plausible Equus timing-chain sibling and blocking the substantive page.',
  },
  [IDS.infotainment]: {
    action: 'remove_unverifiable_citations_and_search_commerce_pending_source',
    commerceDecision: 'dealer-software-diagnosis-no-retail-part-until-scope-corrected',
    clearCommerce: true,
    clearCitations: true,
    reason: 'Rendered Kia ELE122 exactly supports Application Error messages, reboots and blank screens only for a production-limited group of 2015 K900 KH vehicles and prescribes a KDS/AUM dealer software update. It does not support the frozen 2015-2017 scope, inadequate-processing or memory-leak mechanisms, generic hard-reset/head-unit-replacement advice, or scanner/wiring commerce. The frozen citations also contain labels without URLs. The proposal removes those unverifiable citations and search commerce but leaves the year and mechanism conflict blocked.',
  },
};

function proposalFor(row, decision) {
  const proposal = fullRecord(row);
  if (decision.clearCitations) proposal.citations = [];
  if (decision.clearCommerce) {
    proposal.communityRecommendations = [];
    proposal.fixParts = [];
  }
  if (decision.clearRelated) proposal.relatedIssueIds = [];
  return proposal;
}

function evidenceFor(row) {
  if (row.id === IDS.transmission) return [{ kind: 'official-source-scope-and-mechanism-conflict', url: PDF_SOURCES.transmission.url, sha256: PDF_SOURCES.transmission.sha256, visuallyInspectedPages: PDF_SOURCES.transmission.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: DECISIONS[row.id].reason }];
  if (row.id === IDS.drl) return [{ kind: 'false-placeholder-citation-and-official-component-conflict', url: PDF_SOURCES.lighting.url, sha256: PDF_SOURCES.lighting.sha256, visuallyInspectedPages: PDF_SOURCES.lighting.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: DECISIONS[row.id].reason }];
  if (row.id === IDS.infotainment) return [{ kind: 'official-source-year-and-mechanism-conflict', url: PDF_SOURCES.infotainment.url, sha256: PDF_SOURCES.infotainment.sha256, visuallyInspectedPages: PDF_SOURCES.infotainment.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: DECISIONS[row.id].reason }];
  return [{ kind: 'complete-official-inventory-no-exact-package', datasetRowsReviewed: MFR_COMMUNICATIONS_SOURCE.totalExpectedK900Rows, verifiedOn: '2026-08-08', observation: DECISIONS[row.id].reason }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'K900');
  if (modelRows.length !== 5) throw new Error(`expected 5 K900 rows, found ${modelRows.length}`);
  for (const id of Object.values(IDS)) if (!modelRows.some((row) => row.id === id)) throw new Error(`missing frozen K900 ID ${id}`);

  const rows = modelRows.map((current) => {
    const decision = DECISIONS[current.id];
    if (!decision) throw new Error(`missing decision for ${current.id}`);
    const before = fullRecord(current);
    const proposal = proposalFor(current, decision);
    return {
      id: current.id,
      model: current.model,
      action: decision.action,
      reason: decision.reason,
      identityRule: 'No source may change an indexed page identity. A different year boundary, component, mechanism or failure outcome requires a blocked correction or a later separately approved identity change.',
      commerceDecision: decision.commerceDecision,
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(current),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const blockerRecordIds = modelRows.map((row) => row.id).sort();
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-08',
    make: 'Kia',
    model: 'K900',
    completionStatement: 'All five frozen Kia K900 records are reconciled against 109 official manufacturer communications and the complete 2015-2020 recall inventory. No row has exact evidence across its frozen indexed scope; the proposals only remove a fabricated citation, unverifiable citation signals, unverified search commerce and one inexact related-issue link.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'All five K900 pages retain unresolved year, component, mechanism or source conflicts. Independent correction and approval are required before any proposal is applied.' },
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All five K900 IDs, titles, categories, indexed years and publication states remain unchanged.',
      'A fabricated placeholder citation and an inexact related-issue link cannot remain hidden inside a byte-for-byte hold; their removal proposals remain blocked with the substantive pages.',
      'Search-result commerce never proves part fitment. Every K900 proposal removes it until an exact direct product page and exact K900 fitment are independently verified.',
      'Recall, dealer-software and internal-transmission remedies are not represented as retail DIY parts.',
      'Four absent recall campaigns remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 5 },
    observations: [
      { code: 'k900-complete-official-inventory-reviewed', severity: 'coverage', recordIds: blockerRecordIds, detail: 'All 109 K900 rows in the three frozen NHTSA manufacturer-communication files were included; exact component filters were reconciled back to the full inventory.' },
      { code: 'k900-transmission-bulletin-not-stretched', severity: 'critical', recordIds: [IDS.transmission], detail: 'TRA096 is limited to some 2015-2016 Tau 5.0L shift-by-wire vehicles and a solenoid-wear mechanism, so it cannot validate the 2015-2020 torque-converter/calibration aggregation.' },
      { code: 'k900-drl-placeholder-and-component-conflict', severity: 'critical-correction', recordIds: [IDS.drl], detail: 'The placeholder YouTube citation is removed; SC130 concerns the steering-column multi-function switch, not a DRL LED driver module.' },
      { code: 'k900-infotainment-year-conflict', severity: 'critical', recordIds: [IDS.infotainment], detail: 'ELE122 supports a narrow 2015 production population only, while the frozen page remains indexed for 2015-2017.' },
      { code: 'k900-inexact-cadenza-relation-removed', severity: 'deeplink-correction', recordIds: [IDS.transmission], detail: 'The K900 upshift page linked to a separate Cadenza low-speed downshift/surge page; the proposal removes that inexact related-issue deep link.' },
      { code: 'k900-unverified-search-commerce-cleared-in-proposals', severity: 'commerce-safety', recordIds: blockerRecordIds, detail: 'No frozen K900 search result establishes an exact part number and fitment. Every proposal clears communityRecommendations and fixParts pending direct fitment proof.' },
      { code: 'k900-four-recall-campaigns-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'The complete recall inventory contains four campaigns not represented by an exact frozen issue identity; additions are deferred until the current audit is complete.' },
      { code: 'all-k900-pages-preserved', severity: 'seo-safety', recordIds: blockerRecordIds, detail: 'Every K900 ID, title, category, indexed year set and publication state remains preserved; no redirect, archive, deletion or new public page is proposed.' },
    ],
    pdfSources: PDF_SOURCES,
    manufacturerCommunicationsDataset: MFR_COMMUNICATIONS_SOURCE,
    flatRecallDataset: { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY },
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: {
      remove_inexact_relation_and_search_commerce_pending_source: 1,
      remove_search_commerce_pending_source: 1,
      remove_false_citation_and_search_commerce_pending_source: 1,
      remove_unverifiable_citations_and_search_commerce_pending_source: 2,
      total: 5,
    },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { DECISIONS, DEFERRED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, SNAPSHOT, evidenceFor, proposalFor };
