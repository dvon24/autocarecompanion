/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-eqs-suv-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ID = 'mercedes-eqs-suv-air-suspension-compressor-noise-2023';
const ALL_IDS = Object.freeze([ID]);
const BLOCKER_IDS = Object.freeze([ID]);
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([ID]);
const MODEL_ALIASES = Object.freeze([
  'EQS SUV 450+', 'EQS SUV 450 4MATIC', 'EQS SUV 580 4MATIC', 'EQS SUV 680 4MATIC',
  'AMG EQS SUV', 'AMG EQS 53 SUV', 'MAYBACH EQS SUV',
]);
const SEARCH_TERMS = Object.freeze([
  'air suspension', 'AIRMATIC', 'compressor', 'level control', 'ride height', 'noise', 'buzz', 'drone',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['11012135']);
const CAMPAIGNS = Object.freeze(['24V372000', '25V255000', '25V366000']);
const OTHER_SOURCES = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: NHTSA_DATASET_URL,
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  searchTerms: SEARCH_TERMS,
  periodCounts: {
    '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0,
    '2015-2019': 0, '2020-2024': 192, '2025-2026': 571,
  },
  totalRows: 763,
  relevantRowCount: 143,
  uniqueRelevantCommunications: 39,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 250 },
  totalRows: 250,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const CONTENT = Object.freeze({
  description: 'The reviewed NHTSA manufacturer-communication corpus does not establish an excessive-noise defect in the EQS SUV suspension compressor. Communication 11012135 is limited to a 2024 AIRMATIC control-unit software-update procedure and states no compressor-noise complaint, compressor hardware cause, revised sound insulation or replacement-compressor remedy. Other compressor communications in the model corpus concern the high-voltage climate-control compressor, not the AIRMATIC air-supply compressor. The evidence therefore does not support the frozen 2023-2025 noise identity, frequent-cycling claim, warranty-replacement assertion or transfer to AMG and Maybach trims.',
  solution: 'Record the exact sound, location, duration, ride-height action, warnings and parked behavior. Diagnose normal air-supply operation, air leakage, AIRMATIC control software and mechanical noise as separate paths through VIN-specific XENTRY procedures. Do not buy an AIRMATIC compressor, air spring, valve block or sound-insulation part from this page; no failed component, revised suspension-compressor part or universal retail fitment is established.',
  symptoms: [
    'exact sound, location and duration documented',
    'ride-height command and AIRMATIC warnings recorded',
    'air leakage and control-software paths diagnosed separately',
  ],
  affectedSystems: ['AIRMATIC air suspension', 'ride-height control', 'chassis noise'],
});

function citationsFor() {
  return [{ url: OTHER_SOURCES.datasets.url, type: OTHER_SOURCES.datasets.type, title: OTHER_SOURCES.datasets.title }];
}

function proposalFor(before) {
  return {
    ...clone(before),
    description: CONTENT.description,
    solution: CONTENT.solution,
    confidence: 'low',
    symptoms: clone(CONTENT.symptoms),
    affectedSystems: clone(CONTENT.affectedSystems),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: 'Separated the exact AIRMATIC software instruction from unsupported suspension-compressor noise, replacement and owner-count claims.',
  };
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'EQS SUV');
  if (frozenRows.length !== 1 || frozenRows[0].id !== ID) throw new Error('Frozen EQS SUV coverage does not match the 1-row adjudication contract');
  const before = fullRecord(frozenRows[0]);
  const proposal = proposalFor(before);
  const row = {
    id: ID,
    action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
    identityReviewRequired: true,
    identityConflict: 'No exact reviewed primary source establishes the frozen excessive-suspension-compressor-noise identity or its broad 2023-2025 trim scope.',
    reason: 'Held the indexed identity because the only direct AIRMATIC communication is a narrower 2024 software-update instruction with no compressor-noise complaint or replacement remedy.',
    evidence: {
      primaryEvidence: [
        'Communication 11012135 instructs technicians to update the AIRMATIC control-unit software on 2024 EQS SUV variants.',
        'It states no noise complaint, suspension-compressor cause, updated compressor, sound-insulation change or warranty replacement.',
        'The model corpus separately uses “HV AC compressor” for climate control; those records cannot support an AIRMATIC compressor identity.',
      ],
      limitations: 'No owner-frequency rate, repair price, universal mechanism, retail fitment or suspension-compressor part number is inferred.',
    },
    commerceDecision: 'suspension-compressor defect and fitment are unverified; no universal retail part',
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
    make: 'Mercedes-Benz',
    model: 'EQS SUV',
    completionStatement: 'The sole frozen EQS SUV page is accounted for with its indexed identity and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'The frozen identity materially exceeds exact primary evidence; no catalog write is authorized before independent review.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'The page remains published with its exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 220-owner total is proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'No PDF is selected because no exact reviewed PDF supports the frozen compressor-noise identity; evidence is frozen to row-level NHTSA datasets.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: 1,
    },
    observations: [
      { code: 'eqs-suv-identity-held', severity: 'identity-hold', recordIds: ALL_IDS, detail: 'No exact source supports the frozen suspension-compressor noise identity, broad scope or replacement remedy.' },
      { code: 'eqs-suv-climate-compressor-separated', severity: 'accuracy-cleanup', recordIds: ALL_IDS, detail: 'High-voltage climate-control compressor communications are explicitly excluded from AIRMATIC suspension-compressor evidence.' },
      { code: 'eqs-suv-owner-count-proposed-zero', severity: 'accuracy-correction', recordIds: ALL_IDS, detail: 'The positive owner total has no reviewed owner-report source and is a proposal-only zero correction.' },
      { code: 'eqs-suv-page-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'The page is not removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {},
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1,
      fabricated_report_counts_proposed_zero: 1,
      total: 1,
    },
    rows: [row],
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  ID, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE,
  SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, proposalFor,
};
