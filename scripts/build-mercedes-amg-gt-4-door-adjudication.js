/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES,
  RECALL_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-amg-gt-4-door-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['AMG GT43', 'AMG GT53', 'AMG GT53E', 'AMG GT63', 'AMG GT63 S', 'AMG GT63 S E']);

const IDS = Object.freeze({
  battery48v: 'mercedes-amg-gt-4-door-48v-battery-2019',
  suspension: 'mercedes-amg-gt-4-door-air-suspension-compressor-2019',
  rearSteering: 'mercedes-amg-gt-4-door-rear-axle-steering-fault-2019',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.rearSteering]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const FABRICATED_REPORT_COUNT_IDS = ALL_IDS;
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10206063', '10225802', '11008007']);
const CAMPAIGNS = Object.freeze([
  '19V540000', '19V788000', '20V047000', '20V048000', '20V068000', '20V328000',
  '20V395000', '20V800000', '21V058000', '21V072000', '21V217000', '21V230000',
  '21V354000', '21V483000', '21V527000', '21V961000', '22V189000', '22V533000',
  '22V938000', '23V445000', '23V574000', '23V880000', '24V100000', '24V445000',
  '25V129000', '26V281000',
]);

const PDF_SOURCES = Object.freeze({
  battery48vBulletin: {
    title: 'Mercedes-Benz XENTRY TIPS LI54.10-P-069698: functional impairment of 48V on-board electrical system',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10206063-0001.pdf',
    localPath: 'C:/tmp/mercedes-amg-gt-4-door-sources/10206063.pdf',
    pages: 8,
    visualPages: [1, 2, 3, 4, 5, 6, 7, 8],
    bytes: 516148,
    sha256: '601837495c24f03b567dcac9370fcfcd79be655f1d999ab457044f84dbecb140',
  },
  rearSteeringBulletin: {
    title: 'Mercedes-Benz XENTRY TIPS LI46.80-P-078043: platform-290 rear-axle-steering actuator-blocked fault',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008007-0001.pdf',
    localPath: 'C:/tmp/mercedes-amg-gt-4-door-sources/11008007.pdf',
    pages: 2,
    visualPages: [1, 2],
    bytes: 10450,
    sha256: '7a80686aa89558cc9fd5d22fdac1379b54cce082694b91a47c451f1ea42f5c25',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 6, '2015-2019': 4, '2020-2024': 453, '2025-2026': 629 },
  totalRows: 1092,
  relevantRowCount: 68,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 1165 },
  totalRows: 1165,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.battery48v]: {
    description: 'Mercedes-Benz XENTRY TIPS LI54.10-P-069698 applies to model series 290 with code B01 and recognizes several distinct 48V-system complaints, including no-start, 48V warnings and limp-home or cooling/acceleration effects. The bulletin separates software faults, a system short circuit, an internal battery cooling-element fault and abnormal battery behavior by exact fault-code path. It does not establish premature battery degradation, a defect rate, universal battery failure across every frozen year and trim, or automatic battery replacement.',
    solution: 'Preserve the exact XENTRY fault codes and use the corresponding guided test. Some paths call for software, connector or cable inspection; battery replacement is specified only when the documented diagnostic condition is met. Do not buy a 48V battery, DC/DC converter, cable or control unit from this page; this is a high-voltage, VIN- and fault-specific repair with no universal retail fitment.',
    symptoms: ['48V on-board electrical system warning', 'no-start or limp-home condition with a documented 48V fault', 'cooling or acceleration effect traced through the applicable guided test'],
    affectedSystems: ['48V on-board electrical system', '48V battery', 'DC/DC converter'],
    conflict: 'The official platform-290 bulletin supports fault-specific 48V diagnosis, not the frozen premature-degradation identity or its universal replacement instruction.',
    evidence: ['LI54.10-P-069698 expressly includes model series 290 with code B01.', 'The rendered remedy separates software, short-circuit, internal cooling-element and abnormal-current paths rather than treating every complaint as battery degradation.'],
    summary: 'Bounded the official 48V evidence to its exact fault-specific paths, removed the universal degradation/replacement claim and proposed the unsupported 220-owner total as zero.',
    sources: ['battery48vBulletin', 'datasets'],
  },
  [IDS.suspension]: {
    description: 'The frozen page relies only on a forum reference. Review of 1,092 manufacturer-communication rows and 1,165 recall rows for the AMG GT 4-Door aliases did not establish a platform-290 pattern in which low ride height or firm damping causes the air-suspension compressor to overheat and burn out. The same corpus also did not establish the stated compressor duty-cycle software update. The title can remain indexed while the unsupported mechanism awaits exact primary evidence.',
    solution: 'If the vehicle sits low or shows a suspension warning, preserve the exact codes and use XENTRY to isolate air leaks, ride-height sensors, valves, wiring, control software and compressor operation before selecting a repair. Do not buy a compressor, air spring, valve block or control module from this page; the failed component and VIN-specific fitment have not been established.',
    symptoms: ['low or uneven ride height requiring system diagnosis', 'suspension warning with exact codes preserved', 'compressor operation tested only after leaks and controls are checked'],
    affectedSystems: ['air suspension', 'ride-height control', 'suspension electronics'],
    conflict: 'No exact reviewed manufacturer communication or recall establishes the frozen compressor-burnout mechanism, full scope or software remedy.',
    evidence: ['The reviewed 1,092-row communication corpus contains no exact platform-290 record supporting the stored compressor claim.', 'Search hits for compressor terms concerned unrelated air-conditioning components and were not transferred to this page.'],
    summary: 'Removed the unsupported compressor-burnout and software assertions, retained a diagnosis-first boundary and proposed the unsupported 280-owner total as zero.',
    sources: ['datasets'],
  },
  [IDS.rearSteering]: {
    description: 'Mercedes-Benz XENTRY TIPS LI46.80-P-078043 applies to model series 290 with rear-axle-steering option code 201. It documents an instrument-cluster rear-axle-steering message with fault C112571, “actuator blocked,” caused when the vehicle detects high adjustment force. The bulletin does not establish that every warning is a failed actuator or control module, nor does it support the frozen handling and frequency claims.',
    solution: 'Preserve fault C112571 and follow the VIN-, hardware- and software-specific XENTRY path. The bulletin says older hardware cannot accept the new software and requires a TIPS case; current hardware can receive the specified control-unit software. If the combination does not match exactly, follow the guided test. Do not buy a rear-steer actuator, sensor or control unit from this page; the remedy is configuration-specific and no universal retail fitment is established.',
    symptoms: ['rear-axle-steering message in the instrument cluster', 'C112571 actuator-blocked fault in N68/3 or N68/4', 'high adjustment force confirmed through the applicable XENTRY path'],
    affectedSystems: ['rear-axle steering', 'rear-steering control units'],
    conflict: '',
    evidence: ['LI46.80-P-078043 directly identifies model series 290 with option code 201.', 'The rendered bulletin documents C112571, high adjustment force and different remedies for old and current hardware/software combinations.'],
    summary: 'Replaced the blanket actuator/control-module failure claim with the exact platform-290 fault, cause and conditional XENTRY remedy, and proposed the unsupported 180-owner total as zero.',
    sources: ['rearSteeringBulletin'],
    confidence: 'high',
  },
});

function citationsFor(id) {
  return CONTENT[id].sources.map((key) => {
    const source = PDF_SOURCES[key] || OTHER_SOURCES[key];
    return { url: source.url, type: source.type, title: source.title };
  });
}
function commerceDecisionFor(id) {
  return {
    [IDS.battery48v]: 'high-voltage VIN- and fault-specific diagnosis; no universal retail part',
    [IDS.suspension]: 'failed suspension component and fitment are unresolved; no universal retail part',
    [IDS.rearSteering]: 'hardware/software configuration controls the remedy; no universal retail part',
  }[id];
}
function proposalFor(before, id) {
  const content = CONTENT[id];
  if (!content) throw new Error(`Missing content for ${id}`);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence || 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source);
    delete value.localPath;
    return [key, value];
  }));
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mercedes-Benz' && row.model === 'AMG GT 4-Door').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 3) throw new Error(`Expected 3 frozen AMG GT 4-Door rows, found ${frozenRows.length}`);
  if (frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen AMG GT 4-Door IDs do not match the adjudication contract');
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const retained = RETAIN_IDS.includes(row.id);
    return {
      id: row.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: CONTENT[row.id].conflict,
      reason: CONTENT[row.id].summary,
      evidence: { primaryEvidence: CONTENT[row.id].evidence, limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred beyond exact primary evidence.' },
      commerceDecision: commerceDecisionFor(row.id),
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
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mercedes-Benz',
    model: 'AMG GT 4-Door',
    completionStatement: 'All 3 frozen AMG GT 4-Door pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Two identities materially exceed exact evidence; no catalog write is authorized before independent review.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 3 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'All three unsupported owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, warranty and field-report population figures are not converted into owner-report totals.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit no-universal-retail-part or dealer/diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'amg-gt-4-door-rear-steering-retained', severity: 'accuracy-correction', recordIds: [IDS.rearSteering], detail: 'LI46.80-P-078043 directly supports the platform-290 rear-axle-steering warning identity and a conditional repair path.' },
      { code: 'amg-gt-4-door-two-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'The frozen 48V degradation and air-compressor identities exceed exact evidence; both indexed pages remain published pending review.' },
      { code: 'amg-gt-4-door-all-owner-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'The stored 220, 280 and 180 owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'all-amg-gt-4-door-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No AMG GT 4-Door page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 2, fabricated_report_counts_proposed_zero: 3, total: 3 },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
