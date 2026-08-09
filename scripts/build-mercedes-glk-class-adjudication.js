/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-glk-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  injector: 'mercedes-glk-class-diesel-injector-leak-2010',
  strutMount: 'mercedes-glk-class-strut-mount-noise-2010',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = ALL_IDS;
const MODEL_ALIASES = Object.freeze([
  'GLK-CLASS', 'GLK CLASS', 'GLK220', 'GLK 220', 'GLK250', 'GLK 250',
  'GLK350', 'GLK 350',
]);
const SEARCH_TERMS = Object.freeze([
  'OM651', 'injector', 'seal', 'washer', 'black death', 'carbon', 'strut',
  'mount', 'bearing', 'suspension', 'clunk', 'knock',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10205147', '11013298', '11031367', '11032599',
]);
const CAMPAIGNS = Object.freeze([
  '12V493000', '12V557000', '14V762000', '15V351000', '15V711000',
  '16V081000', '16V363000', '17V017000', '17V177000', '17V252000',
  '17V627000', '18V043000', '19V010000', '19V787000', '21V539000',
]);
const OTHER_SOURCES = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa', url: NHTSA_DATASET_URL,
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: {
    '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 92,
    '2015-2019': 28, '2020-2024': 75, '2025-2026': 46,
  },
  totalRows: 241, relevantRowCount: 47, uniqueRelevantCommunications: 24,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 55 },
  totalRows: 55, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const CONTENT = Object.freeze({
  [IDS.injector]: {
    description: 'The reviewed GLK-Class corpus contains no exact communication establishing OM651 injector sealing-washer leakage or “black death” across the frozen 2010-2015 GLK 220 CDI and GLK 250 BlueTEC population. Communication 10205147 concerns ticking or pulsing from the high-pressure pump or fuel injectors on a 2009 GLK 350; it is the wrong year, engine and mechanism. It does not prove copper-washer failure, black tar deposits, injectors welded into the cylinder head or replacement of all four injectors.',
    solution: 'Document the leak, odor, noise, engine code and correction values, then perform leak-off and pressure tests. Inspect the injector sealing seat and washer, return lines, injector body and high-pressure system as separate paths under VIN-specific Mercedes procedures. Do not buy sealing washers, injectors or extraction tools from this page; the failure identity and fitment are unresolved.',
    symptoms: ['leak, odor and noise documented', 'engine code and correction values preserved', 'seal, return and high-pressure paths tested separately'],
    affectedSystems: ['OM651 fuel injector', 'injector sealing seat', 'high-pressure fuel system'],
    conflict: 'No exact reviewed source supports the frozen OM651 sealing-washer and black-deposit identity; the only injector communication is for a 2009 gasoline GLK 350 noise condition.',
    evidence: ['No exact GLK communication supports sealing-washer leakage, black tar or welded injectors.', '10205147 concerns ticking or pulsing from the pump or injectors on a 2009 GLK 350.', 'No exact source supports the stored 550-owner total or universal all-four-injector repair.'],
    summary: 'Held the unsupported diesel injector-seal identity and separated it from the only exact GLK injector communication, a different 2009 gasoline noise condition.',
  },
  [IDS.strutMount]: {
    description: 'The reviewed GLK-Class corpus does not establish premature front strut top-mount rubber wear across model years 2010-2015. Communications 11013298, 11031367 and 11032599 describe clunk or creak paths involving side-shaft-to-wheel-bearing micromovement or front wheel-bearing-to-steering-knuckle contact. They do not identify the top strut mount, mount bearing, rubber hardening or cracking. No exact record supports replacing both mounts, complete struts above 60,000 miles or the stored owner total.',
    solution: 'Document when the noise occurs and locate it with chassis ears before replacing parts. Inspect the top mount and bearing, damper, spring, control arms, wheel bearing and steering knuckle, and halfshaft interfaces as separate paths under the VIN-specific procedure. Do not buy mounts, bearings or struts from this page; the failed component and fitment are unresolved.',
    symptoms: ['noise timing and road input documented', 'noise source localized before disassembly', 'strut, bearing, knuckle and halfshaft paths separated'],
    affectedSystems: ['front strut assembly', 'front wheel bearing and steering knuckle', 'front halfshaft interface'],
    conflict: 'Exact GLK noise communications identify wheel-bearing, steering-knuckle or halfshaft interfaces, not frozen top-mount wear.',
    evidence: ['11013298 describes side-shaft-to-wheel-bearing micromovement.', '11031367 and 11032599 describe front wheel-bearing-to-steering-knuckle contact.', 'No exact source supports top-mount rubber failure, pair replacement, a 60,000-mile threshold or the stored 380-owner total.'],
    summary: 'Held the unsupported strut-mount identity and separated exact bearing, knuckle and halfshaft noise paths from top-mount diagnosis.',
  },
});

function citationsFor() {
  return [{ url: OTHER_SOURCES.datasets.url, type: OTHER_SOURCES.datasets.type, title: OTHER_SOURCES.datasets.title }];
}
function commerceDecisionFor(id) {
  return id === IDS.injector
    ? 'injector failure path and OM651 fitment are unresolved; no universal retail part'
    : 'front-suspension noise path and component fitment are unresolved; no universal retail part';
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
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GLK-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 2 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen GLK-Class coverage does not match the 2-row adjudication contract');
  }
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    return {
      id: record.id,
      action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true, identityConflict: CONTENT[record.id].conflict,
      reason: 'The frozen identity materially exceeds exact primary evidence and remains published pending review.',
      evidence: {
        primaryEvidence: clone(CONTENT[record.id].evidence),
        limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.',
      },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'GLK-Class',
    completionStatement: 'Both frozen GLK-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked', blockerRecordIds: BLOCKER_IDS,
      reason: 'Both frozen identities materially exceed exact evidence; no catalog write is authorized before independent review.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'Both pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 550- and 380-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as “0+ owners” social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'No PDF is selected because no exact reviewed PDF supports either frozen identity; evidence is frozen to row-level NHTSA datasets.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'glk-class-identities-held', severity: 'identity-hold', recordIds: ALL_IDS, detail: 'Neither frozen identity is established by exact row-level primary evidence.' },
      { code: 'glk-injector-condition-separated', severity: 'accuracy-cleanup', recordIds: [IDS.injector], detail: 'The only exact injector communication is a different 2009 GLK 350 noise condition.' },
      { code: 'glk-suspension-paths-separated', severity: 'accuracy-cleanup', recordIds: [IDS.strutMount], detail: 'Exact noise communications concern bearing, knuckle or halfshaft interfaces, not top-mount wear.' },
      { code: 'glk-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: ALL_IDS, detail: 'Both positive owner totals lack reviewed owner-report sources and are proposal-only zero corrections.' },
      { code: 'all-glk-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No GLK-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {}, otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: {
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 2,
      fabricated_report_counts_proposed_zero: 2, total: 2,
    },
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
