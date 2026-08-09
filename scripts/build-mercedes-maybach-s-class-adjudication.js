/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-maybach-s-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  suspension: 'mercedes-maybach-s-class-air-suspension-degradation-2021',
  fragrance: 'mercedes-maybach-s-class-fragrance-system-malfunction-2021',
  rearEntertainment: 'mercedes-maybach-s-class-rear-entertainment-freeze-2021',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = ALL_IDS;
const MODEL_ALIASES = Object.freeze([
  'MERCEDES-MAYBACH S-CLASS', 'MERCEDES MAYBACH S-CLASS', 'MAYBACH S-CLASS',
  'MAYBACH S CLASS', 'MAYBACH S580', 'MAYBACH S 580', 'MAYBACH S680',
  'MAYBACH S 680', 'S580', 'S 580', 'S680', 'S 680',
]);
const SEARCH_TERMS = Object.freeze([
  'E-ACTIVE', 'body control', 'suspension', 'hydraulic', 'ride quality', 'fragrance',
  'AIR BALANCE', 'vial', 'MBUX', 'rear seat', 'rear entertainment', 'screen', 'freeze',
  'unresponsive', 'software', 'update',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10205808', '10208748', '10243311']);
const CAMPAIGNS = Object.freeze([
  '21V00J000', '21V704000', '21V789000', '21V843000', '21V931000', '22V124000',
  '22V167000', '22V189000', '22V194000', '22V214000', '22V215000', '22V365000',
  '22V493000', '23V098000', '23V200000', '23V360000', '23V445000', '23V554000',
  '23V880000', '24V115000', '24V704000', '24V807000', '24V862000', '25V116000',
]);
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: {
    '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0,
    '2015-2019': 0, '2020-2024': 488, '2025-2026': 477,
  },
  totalRows: 965, relevantRowCount: 501, uniqueRelevantCommunications: 188,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 683 },
  totalRows: 683, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const CONTENT = Object.freeze({
  [IDS.suspension]: {
    description: 'The reviewed Mercedes-Maybach S-Class corpus contains no exact manufacturer communication or recall establishing gradual E-ACTIVE BODY CONTROL ride degradation from hydraulic-fluid aging across model years 2021-2025. The targeted records do not support a 20,000-30,000-mile onset, a scheduled hydraulic flush, actuator replacement or a dealer calibration as the universal remedy.',
    solution: 'Document the ride complaint, road input, vehicle mode, ride height and every suspension fault. Test hydraulic pressure, leaks, accumulators, actuators, sensors, power supply and control software separately under the VIN-specific Mercedes procedure. Do not buy fluid, an actuator or suspension hardware from this page; the failure path and fitment are unresolved.',
    symptoms: ['ride complaint and road input documented', 'ride height and fault data preserved', 'hydraulic, sensor and software paths separated'],
    affectedSystems: ['E-ACTIVE BODY CONTROL hydraulics', 'suspension actuators and sensors', 'suspension control software'],
    conflict: 'No exact reviewed primary source supports the frozen fluid-degradation identity, mileage pattern or universal flush remedy.',
    evidence: ['Targeted E-ACTIVE, hydraulic-fluid, ride-quality and actuator searches returned no exact matching communication.', 'No matching recall establishes the frozen identity.', 'No exact source supports the stored 190-owner total.'],
    summary: 'Held the unsupported E-ACTIVE BODY CONTROL degradation identity and replaced the universal fluid-flush claim with bounded diagnosis.',
  },
  [IDS.fragrance]: {
    description: 'The reviewed Mercedes-Maybach S-Class corpus contains no exact manufacturer communication or recall establishing Air Balance fragrance-vial jamming, continuous maximum output or an incorrect MBUX active state across model years 2021-2025. It also does not support compressed-air cleaning, replacement of a motorized holder behind the center console or a Mercedes-only vial compatibility rule.',
    solution: 'Record the exact fragrance setting, output behavior and MBUX state. Verify the option code and vial installation, then diagnose the dispenser, wiring, power supply and software under the VIN-specific Mercedes procedure. Avoid blowing compressed air into the mechanism. Do not buy a vial, holder, motor or fragrance module from this page; the failed path and fitment are unresolved.',
    symptoms: ['fragrance setting and output documented', 'option code and vial seating verified', 'dispenser, wiring and software paths separated'],
    affectedSystems: ['Air Balance fragrance dispenser', 'fragrance-vial holder', 'MBUX fragrance control'],
    conflict: 'No exact reviewed primary source supports the frozen fragrance mechanism, location or remedy.',
    evidence: ['Targeted fragrance, Air Balance and vial searches returned zero exact communications.', 'No matching recall establishes this identity.', 'No exact source supports the stored 260-owner total.'],
    summary: 'Held the unsupported fragrance-system identity and removed the unverified compressed-air and module-replacement advice.',
  },
  [IDS.rearEntertainment]: {
    description: 'Mercedes communications support narrower rear-entertainment conditions: display flicker on 2021-2022 S 580 vehicles, a tablet configuration failure after an MBUX update, and rear displays that do not start because transport mode was not fully deactivated on 2021-2024 S 580 vehicles. They do not establish a shared processor becoming overloaded when both screens play different media, a 10-second dual-button reboot or frozen 2021-2025 S 580/S 680 applicability.',
    solution: 'Record which rear display or tablet fails, the media source, software version, transport-mode state and whether the symptom began after an update. Apply the exact VIN- and fault-specific software or transport-mode procedure before considering hardware. Do not buy a display, tablet or processing unit from this page; the failure path and fitment are unresolved.',
    symptoms: ['affected display and media source documented', 'software and transport-mode state recorded', 'tablet, display and head-unit paths separated'],
    affectedSystems: ['rear entertainment displays', 'MBUX tablet', 'MBUX head unit and transport mode'],
    conflict: 'Exact communications support narrower S 580 flicker, tablet-software and transport-mode paths, not the frozen shared-processor overload identity or full years/trims.',
    evidence: ['10205808 concerns rear-display flicker on 2021-2022 S 580.', '10208748 concerns tablet configuration after an MBUX software update.', '10243311 concerns incomplete transport-mode deactivation on 2021-2024 S 580.'],
    summary: 'Held the overbroad rear-entertainment identity and separated the exact display, tablet and transport-mode paths.',
  },
});

function citationsFor() {
  return [{ url: OTHER_SOURCES.datasets.url, type: OTHER_SOURCES.datasets.type, title: OTHER_SOURCES.datasets.title }];
}
function commerceDecisionFor(id) {
  const values = {
    [IDS.suspension]: 'E-ACTIVE BODY CONTROL failure path and component fitment are unresolved; no universal retail part',
    [IDS.fragrance]: 'fragrance-system failure path and component fitment are unresolved; no universal retail part',
    [IDS.rearEntertainment]: 'rear-entertainment failure path and hardware fitment are unresolved; no universal retail part',
  };
  return values[id];
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before); delete frozen.id;
  return {
    ...frozen, description: content.description, solution: content.solution, confidence: 'low',
    symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems),
    dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(),
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'Mercedes-Maybach S-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 3 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen Mercedes-Maybach S-Class coverage does not match the 3-row adjudication contract');
  }
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record); const proposal = proposalFor({ id: record.id, ...before });
    return {
      id: record.id, action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true, identityConflict: CONTENT[record.id].conflict,
      reason: 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'Mercedes-Maybach S-Class',
    completionStatement: 'All 3 frozen Mercedes-Maybach S-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All three identities or frozen applicability sets materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All 3 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 190-, 260- and 120-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'No PDF is selected because exact reviewed support remains row-level NHTSA data or absent.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'maybach-s-class-identities-held', severity: 'identity-hold', recordIds: ALL_IDS, detail: 'No frozen identity is supported across its full mechanism, years and trims.' },
      { code: 'maybach-s-class-entertainment-paths-separated', severity: 'accuracy-cleanup', recordIds: [IDS.rearEntertainment], detail: 'Exact records concern S 580 display flicker, tablet software or transport mode, not dual-media processor overload.' },
      { code: 'maybach-s-class-no-exact-fragrance-or-suspension-source', severity: 'unsupported-identity', recordIds: [IDS.fragrance, IDS.suspension], detail: 'Targeted primary-source searches found no exact support for the stored mechanisms or remedies.' },
      { code: 'maybach-s-class-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: ALL_IDS, detail: 'All three positive owner totals lack reviewed owner-report sources and are proposal-only zero corrections.' },
      { code: 'all-maybach-s-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {}, otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3, fabricated_report_counts_proposed_zero: 3, total: 3 },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
module.exports = {
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE,
  SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor,
};
