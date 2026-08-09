/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-eqe-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['EQE', 'EQE 350', 'EQE350', 'EQE 500', 'EQE500', 'AMG EQE', 'EQE 350+', 'EQE 350 4MATIC', 'EQE 500 4MATIC', 'EQE 53 4MATIC+']);
const SEARCH_TERMS = Object.freeze(['charging', 'charge', 'battery', 'thermal', 'precondition', 'software', 'OTA', 'update', 'MBUX', 'infotainment', 'radio', 'head unit']);
const IDS = Object.freeze({
  charging: 'mercedes-eqe-charging-speed-inconsistency-2023',
  ota: 'mercedes-eqe-software-update-failure-2023',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = ALL_IDS;
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['11015036', '11015049', '11023033', '11023192']);
const CAMPAIGNS = Object.freeze(['23V405000', '23V555000', '23V853000', '24V115000', '24V372000', '25V150000', '25V255000', '25V366000', '25V533000']);
const PDF_SOURCES = Object.freeze({
  ownersManual: {
    title: '2024 Mercedes-Benz EQE Sedan Operator’s Manual — charging limits, pretempering and charging-time conditions',
    type: 'oem',
    url: 'https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2024/2024-owners-manuals/MY24_EQE%20Sedan%20Owners%20Manual.pdf',
    localPath: 'C:/tmp/mercedes-eqe-sources/MY24_EQE-Sedan-Owners-Manual.pdf',
    pages: 550,
    visualPages: [197, 212, 428],
    bytes: 42372203,
    sha256: 'a46466ca4068b637770a98d8cff01535e6f880e54634676115a9f361da7e2aac',
  },
  otaSrsBulletin: {
    title: 'Mercedes XENTRY Tips LI00.00-P-079603 / NHTSA 11023033 — SRS/ORC OTA update does not start',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11023033-0001.pdf',
    localPath: 'C:/tmp/mercedes-eqe-sources/MC-11023033-0001.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 36952,
    sha256: '674ae9a8d4840b3e4a11cc584b97ef52dd0a99ecf40927dca174399c13c69022',
  },
});
const OTHER_SOURCES = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL } });
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 350, '2025-2026': 638 },
  totalRows: 988,
  relevantRowCount: 658,
  uniqueRelevantCommunications: 153,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 146 },
  totalRows: 146,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const CONTENT = Object.freeze({
  [IDS.charging]: {
    description: 'The 2024 EQE operator’s manual says DC charging time or power can vary with high or low ambient temperature, low or high battery state of charge, the charger’s available current and multimedia-system settings. It also documents battery pretempering before driving to a charging station. The manual’s approximate 170 kW / 32-minute 10%-to-80% specification is conditional, not a guaranteed charging curve. The reviewed 988-row manufacturer corpus and nine-campaign recall inventory do not establish repeated 50-80 kW charging, an overly conservative thermal algorithm or a charging-speed software defect across every frozen 2023-2025 trim.',
    solution: 'Record the charger’s rated and delivered output, starting and ending state of charge, ambient and battery temperature, charging settings and any messages. Use battery pretempering before the charging stop when equipped and compare another known-good charger before diagnosing the vehicle. Do not buy a battery, charger, thermal-management component or control unit from this page; no failed component or universal retail part is established.',
    symptoms: ['charger rated and delivered output recorded', 'battery state of charge and temperature documented', 'results compared after pretempering and at another charger'],
    affectedSystems: ['high-voltage charging', 'battery thermal management'],
    conflict: 'Primary evidence documents conditional charging behavior and pretempering, not the frozen repeated 50-80 kW defect, cause or full 2023-2025 population.',
    evidence: ['Operator-manual PDF pages 197, 212 and 428 document charging-power influences, battery pretempering and conditional charging time.', 'No exact communication among 988 EQE manufacturer rows or nine campaigns establishes the frozen charging-speed defect and frequency.'],
    summary: 'Bound charging guidance to documented conditions and removed unsupported speed, frequency and software-defect claims.',
    sources: ['ownersManual', 'datasets'],
  },
  [IDS.ota]: {
    description: 'Mercedes XENTRY bulletin LI00.00-P-079603 (NHTSA communication 11023033) documents one OTA update that may not start, with a grayed-out Continue button, on platforms including EQE. It says the cause is under analysis, prescribes an SRS/ORC XENTRY update and explicitly limits the bulletin to the occupant-protection OTA. That record does not establish a general MBUX mid-install failure, degraded infotainment state, boot loop, connectivity cause or inadequate rollback mechanism across every frozen 2023-2025 EQE trim.',
    solution: 'Record the exact update name and code, control unit, software version, displayed message and Mercedes app status, then check the VIN for the applicable campaign or bulletin. For SRS/ORC update 25P5496529 that will not start, follow LI00.00-P-079603 through an authorized Mercedes-Benz workshop. Do not buy or replace an MBUX head unit, communication module or restraint controller from this page; the affected update path and universal retail part are not established.',
    symptoms: ['exact update name and code recorded', 'control unit and software version documented', 'VIN campaign status checked before any hardware replacement'],
    affectedSystems: ['over-the-air update delivery', 'vehicle control-unit software'],
    conflict: 'The exact bulletin supports only an SRS/ORC OTA that does not start, not the frozen MBUX mid-install failure and boot-loop identity.',
    evidence: ['LI00.00-P-079603 states that OTA 25P5496529 may not start and the Continue button may be grayed out.', 'The bulletin says the cause is under analysis and explicitly applies only to the occupant-protection OTA.', 'NHTSA communications 11023033 and 11023192 do not establish a general MBUX boot loop or connectivity/rollback mechanism.'],
    summary: 'Narrowed the exact OTA evidence and removed unsupported MBUX boot-loop, cause and generic reflash claims.',
    sources: ['otaSrsBulletin', 'datasets'],
  },
});

function sourceFor(key) { return PDF_SOURCES[key] || OTHER_SOURCES[key]; }
function citationsFor(id) { return CONTENT[id].sources.map((key) => { const source = sourceFor(key); return { url: source.url, type: source.type, title: source.title }; }); }
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }
function commerceDecisionFor(id) { return {
  [IDS.charging]: 'charging conditions and any failed component are unresolved; no universal retail part',
  [IDS.ota]: 'update path and any failed control unit are unresolved; no universal retail part',
}[id]; }
function proposalFor(before, id) { const content = CONTENT[id]; return { ...clone(before), description: content.description, solution: content.solution, confidence: 'low', symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems), dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary }; }
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'EQE').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 2 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen EQE coverage does not match the 2-row adjudication contract');
  const rows = frozenRows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(before, row.id); return { id: row.id, action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy', identityReviewRequired: true, identityConflict: CONTENT[row.id].conflict, reason: CONTENT[row.id].summary, evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'EQE',
    completionStatement: 'Both frozen EQE pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Both identities materially exceed exact primary evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'Both pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 580- and 420-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; the packet freezes exact page selection, byte size and SHA-256.',
      'Every named replaceable item has an explicit no-universal-retail-part or diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'eqe-both-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Both frozen EQE identities exceed exact primary evidence; both remain indexed pending review.' },
      { code: 'eqe-charging-conditions-not-defect', severity: 'identity-conflict', recordIds: [IDS.charging], detail: 'The operator manual documents conditional charging power and pretempering, not the frozen repeated 50-80 kW thermal-algorithm defect.' },
      { code: 'eqe-ota-evidence-is-srs-only', severity: 'identity-conflict', recordIds: [IDS.ota], detail: 'The exact bulletin is limited to an SRS/ORC OTA that does not start, not a general MBUX mid-install failure or boot loop.' },
      { code: 'eqe-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Both positive owner totals have no reviewed owner-report source and are proposal-only zero corrections.' },
      { code: 'all-eqe-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No EQE page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 2, fabricated_report_counts_proposed_zero: 2, total: 2 }, rows,
  };
}
if (require.main === module) { const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
