/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-mazda5-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MAZDA5']);

const IDS = Object.freeze({
  evaporator: 'mazda-mazda5-ac-evaporator-2006',
  egr: 'mazda-mazda5-egr-valve-clog-2006',
  cable: 'mazda-mazda5-sliding-door-cable-2006',
  latch: 'mazda-mazda5-sliding-door-latch-2006',
  mount: 'mazda-mazda5-transmission-mount-2006',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const IDENTITY_REVIEW_IDS = BLOCKER_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.evaporator, IDS.cable, IDS.mount].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10015945', '10022489', '10032545', '10097382', '10097702', '10129576', '10186701',
]);
const CAMPAIGNS = Object.freeze([
  '05V412000', '06V463000', '09E011000', '10V374000', '10V600000', '16V644000',
]);

const PDF_SOURCES = Object.freeze({
  odor: {
    title: 'Mazda TSB 07-001/21: Air-Conditioning Musty/Mildew Odor',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10186701-0001.pdf',
    localPath: 'C:/tmp/mazda5-sources/MC-10186701-0001.pdf',
    pages: 65, visualPages: Array.from({ length: 65 }, (_, index) => index + 1), bytes: 3043944,
    sha256: '9bb582f1a00b5e6d47447ccf63accdfa27d09780a140018c6f67a582ab58dc31',
  },
  mountSqueak: {
    title: 'Mazda TSB 01-013/13: 2012-2013 Mazda5 No. 4 Engine-Mount Squeak',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10059437-0335.pdf',
    localPath: 'C:/tmp/mazda5-sources/SB-10059437-0335.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 994259,
    sha256: 'e2b7ef60b72a449547699ffffeaebb25c67be8bf6884383cc7587b3d47d3bcfe',
  },
  latchOwnerLetter: {
    title: 'Mazda Recall 4306K Owner Letter: 2006 Mazda5 Sliding-Door Latch',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2006/RCONL-06V463-9281.pdf',
    localPath: 'C:/tmp/mazda5-sources/RCONL-06V463-9281.pdf',
    pages: 4, visualPages: [1, 2, 3, 4], bytes: 75215,
    sha256: '2b6d668d4879ade2fc9c2f1ed8e40f82a5beee1a05f00ca40f51f87906aa0a79',
  },
  latchDealerProcedure: {
    title: 'Mazda Recall 4306K Dealer Procedure: 2006 Mazda5 Sliding-Door Latches',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2006/RCMN-06V463-8774.pdf',
    localPath: 'C:/tmp/mazda5-sources/RCMN-06V463-8774.pdf',
    pages: 18, visualPages: Array.from({ length: 18 }, (_, index) => index + 1), bytes: 247181,
    sha256: 'de510e2a47c60e333acdcbeff6621af536a214704b7cd72d27b142946369c9be',
  },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 22, '2010-2014': 12, '2015-2019': 170, '2020-2024': 85, '2025-2026': 8 },
  totalRows: 297,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 6, post: 9 },
  totalRows: 15,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.evaporator]: [OTHER_SOURCES.datasets, PDF_SOURCES.odor],
    [IDS.egr]: [OTHER_SOURCES.datasets],
    [IDS.cable]: [OTHER_SOURCES.datasets, PDF_SOURCES.latchDealerProcedure],
    [IDS.latch]: [PDF_SOURCES.latchOwnerLetter, PDF_SOURCES.latchDealerProcedure],
    [IDS.mount]: [OTHER_SOURCES.datasets, PDF_SOURCES.mountSqueak],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda5 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.evaporator]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda5 manufacturer-communication inventory did not establish an evaporator refrigerant leak, pinhole corrosion or cabin-filter moisture mechanism for the frozen 2006-2015 scope. Mazda TSB 07-001/21 covers those model years, but it documents a different condition: musty or mildew odor from mold in the evaporator/cooling unit caused by condensation, dust and pollen. Its remedy is Mazda Air Cooling Coil Coating after the unit is cleaned and dried; it is not evidence of refrigerant loss or a leaking evaporator core.',
      solution: 'Separate odor from loss of cooling. For musty odor matching TSB 07-001/21, a trained technician can verify the concern and use Mazda\'s model-specific cleaning and coating procedure. For weak cooling or repeated refrigerant loss, have a qualified A/C technician recover refrigerant as required, measure pressures and locate the leak before opening the system. Do not buy an evaporator, receiver/drier, expansion valve, O-rings or refrigerant kit from this page; no reviewed source establishes that parts bundle or the frozen leak identity.',
      symptoms: ['musty or mildew odor when A/C first turns on', 'weak cooling or refrigerant loss requires separate leak diagnosis'],
      summary: 'Proposed the unsupported 600-owner count as zero and separated Mazda\'s documented odor condition from the frozen evaporator-leak identity and parts bundle.',
    },
    [IDS.egr]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda5 communication inventory did not establish recurring EGR-valve or EGR-passage carbon buildup across 2006-2015 vehicles. Communication 10097702 instead describes carbon inside the electronic throttle body on some 2010 vehicles with P0139, and communication 10129576 covers EVAP leak and purge-flow diagnosis for P0441, P0442, P0455 and P0456. Neither source supports the frozen narrow-EGR-passage claim, an 80,000-100,000-mile interval, short-trip causation or P0401 as a Mazda5-wide defect.',
      solution: 'Preserve all stored codes and freeze-frame data, then diagnose the exact system named by those codes. Inspect air, vacuum, ignition, fuel, throttle-body and emissions controls as applicable, and test the EGR system only if the installed vehicle and diagnostic results point there. Do not buy an EGR valve, gasket, intake manifold or cleaning kit from this page, and do not spray carb cleaner into an unconfirmed system; the failed component and engine application have not been established.',
      symptoms: ['rough idle, hesitation or stalling requires diagnosis', 'check-engine light requires exact code and freeze-frame review'],
      summary: 'Removed the generic video, DIY cleaning prescription, mileage claim and unrelated retail parts; held the unsupported EGR defect identity.',
    },
    [IDS.cable]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda5 communication and recall inventory did not establish recurring sliding-door cable fatigue across 2006-2015 manual and power doors. The 4306K dealer procedure disconnects and re-routes latch-release cables only as disassembly steps while replacing modified latches on certain 2006 vehicles. That procedure does not identify cable breakage, pulley fatigue or the frozen C235-73-760F and C235-72-760F numbers as a universal remedy.',
      solution: 'For a door that will not open or close normally, inspect the exact manual or power-door configuration, tracks, rollers, latches, lock actuator, cable routing and motor if equipped. Use the current Mazda parts catalog and VIN to identify any failed cable or mechanism. Do not buy the frozen cable numbers, a Teflon-coated aftermarket cable or both sides as a set from this page; the reviewed primary evidence does not establish the failure identity or fitment.',
      symptoms: ['sliding door does not open or close normally', 'noise or visible cable damage requires mechanism inspection'],
      summary: 'Proposed the unsupported 2,800-owner count as zero and removed unverified cable part numbers, universal fatigue claims and both-side replacement advice.',
    },
    [IDS.latch]: {
      confidence: 'low', reportCount: 0,
      description: 'Mazda recall 4306K / NHTSA 06V463 covers certain 2006 Mazda5 vehicles produced from April 12, 2005 through February 1, 2006. Water can accumulate in the sliding-door latch and freeze; when the door is opened, ice can interfere with the latch and leave the door unable to close. Mazda replaced both latches with modified ones free of charge. Separate communications describe a corroded rear-slide-door latch screw on 2006-2007 vehicles and hard lock operation on some 2006-2008 vehicles. These narrow records do not establish broad 2006-2015 striker loosening, child-slamming causation or latch wear.',
      solution: 'Check the VIN for recall 4306K. If the sliding door does not latch, do not drive the vehicle; use roadside assistance and arrange the free recall remedy when the campaign is open. Outside the exact recall condition, inspect the latch, lock actuator, release cable, striker and rollers separately before adjustment or replacement. Do not buy a latch, handle, cable, grease or roller from this page; recall eligibility and the failed mechanism must be confirmed first.',
      symptoms: ['sliding door cannot be latched closed in freezing conditions', 'door-ajar warning with an unlatched sliding door', 'hard lock operation or other closing concern requires separate diagnosis'],
      summary: 'Bounded the page to the exact 2006 freeze-related safety recall and distinct service records while holding the broader striker-alignment identity.',
    },
    [IDS.mount]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda5 inventory contains a 2006 summary for engine vibration or knocking with a broken No. 3 engine-mount rubber, and TSB 01-013/13 covers a different squeak on specified 2012-2013 vehicles from stick-slip between the No. 4 engine-mount rubber and bracket. The latter remedy adds a specified mount rubber; it does not establish a collapsed upper transmission mount. These sources do not support broad 2006-2015 premature failure, a 50,000-80,000-mile interval, accelerated CV-axle wear or replacing all mounts as a set.',
      solution: 'Document whether the noise or vibration occurs at idle, during load changes, over bumps or while shifting. Inspect the actual mount rubbers, brackets, fasteners, engine operation, exhaust clearance and driveline before selecting a repair. Apply TSB 01-013/13 only to the exact 2012-2013 squeak condition and VIN range. Do not buy a transmission mount, engine-mount set, CC29-39-060C or Anchor 9415 from this page; confirm the failed location and current VIN-specific part first.',
      symptoms: ['engine-compartment squeak during movement or shifting', 'vibration or clunk requires exact mount and driveline inspection'],
      summary: 'Proposed the unsupported 1,100-owner count as zero and separated two narrow engine-mount records from the frozen broad transmission-mount identity.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda5 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const map = {
    [IDS.evaporator]: ['The complete 297-row inventory found Mazda5 odor/coating communications, not an evaporator refrigerant-leak bulletin.', 'All 65 pages of TSB 07-001/21 were rendered; the Mazda5 procedure is an odor treatment and does not prescribe evaporator replacement.'],
    [IDS.egr]: ['No exact Mazda5 EGR carbon-buildup communication was found.', 'The closest carbon and purge records address an electronic throttle body/P0139 and EVAP P0441-P0456, not the frozen EGR identity.'],
    [IDS.cable]: ['No communication establishes broad sliding-door cable fatigue or the frozen part numbers.', 'The recall dealer procedure handles latch-release cables during latch replacement but does not identify cable failure.'],
    [IDS.latch]: ['The owner letter and dealer procedure establish a VIN/build-limited 2006 water-freezing latch defect and free modified-latch remedy.', 'Separate summaries cover latch-screw corrosion and hard lock operation; none establishes the frozen 2006-2015 striker narrative.'],
    [IDS.mount]: ['Communication 10015945 is a 2006 No. 3 engine-mount-rubber summary.', 'TSB 01-013/13 is limited to a 2012-2013 No. 4 mount stick-slip squeak and does not prove broad transmission-mount collapse.'],
  };
  return { primaryEvidence: map[id], limitations: 'No owner-frequency rate, retail fitment, warranty eligibility or failed component is inferred beyond the cited primary source.' };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.evaporator]: 'No universal retail part; odor treatment and refrigerant-leak diagnosis are different paths.',
    [IDS.egr]: 'No universal retail part; the exact code, installed emissions system and failed component require diagnosis.',
    [IDS.cable]: 'No universal retail part; manual/power configuration, side, failed mechanism and current VIN fitment must be verified.',
    [IDS.latch]: 'No universal retail part; the exact recall is a free VIN-specific dealer remedy and other door faults require diagnosis.',
    [IDS.mount]: 'No universal retail part; the failed mount position and current VIN application require inspection.',
  };
  return map[id];
}

function identityConflictFor(id) {
  const map = {
    [IDS.evaporator]: 'The frozen title asserts an evaporator-core refrigerant leak, while Mazda documents an odor/coating condition and the complete inventory does not establish the frozen leak mechanism.',
    [IDS.egr]: 'The frozen title asserts EGR carbon buildup across 2006-2015 vehicles, while no matching Mazda5 communication was found and the nearest carbon record concerns the electronic throttle body.',
    [IDS.cable]: 'The frozen title asserts recurring cable breakage across manual and power doors, while the primary record mentions cables only as latch-replacement disassembly steps.',
    [IDS.latch]: 'The frozen title asserts broad latch-and-striker alignment failure for 2006-2015, while the exact safety record is a narrow 2006 water-freezing latch defect.',
    [IDS.mount]: 'The frozen title asserts broad transmission-mount failure, while the exact records identify a 2006 No. 3 engine-mount summary and a narrow 2012-2013 No. 4 mount squeak.',
  };
  return map[id];
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: clone(content.symptoms),
    affectedSystems: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: content.reportCount,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => {
    const value = clone(source); delete value.localPath; return [key, value];
  }));
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazda5').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 5) throw new Error(`Expected 5 frozen Mazda5 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    const content = contentFor(row.id);
    return {
      id: row.id,
      action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true,
      identityConflict: identityConflictFor(row.id),
      reason: content.summary,
      evidence: evidenceFor(row.id),
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
    make: 'Mazda',
    model: 'Mazda5',
    completionStatement: 'All 5 frozen Mazda5 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All five frozen identities materially exceed or conflict with the exact primary record; no catalog write is authorized.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 5 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The three fabricated nonzero report counts are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'A recall or service procedure is not expanded beyond its exact VIN, build, component and symptom boundary.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit dealer-only or no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'mazda5-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Every frozen title overstates, broadens or conflicts with the exact primary evidence and therefore cannot be silently rewritten.' },
      { code: 'mazda5-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Frozen 600-, 2,800- and 1,100-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'mazda5-latch-recall-bounded', severity: 'safety-correction', recordIds: [IDS.latch], detail: 'Recall 4306K is limited to certain 2006 vehicles and water-freezing latch interference; it does not validate broad striker-alignment claims.' },
      { code: 'all-mazda5-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'No Mazda5 page is removed, merged, redirected or allowed to lose its indexed identity while this packet is reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 3, total: 5 },
    rows,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDENTITY_REVIEW_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES,
  RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket,
  citationsFor, commerceDecisionFor, contentFor, evidenceFor, identityConflictFor, proposalFor,
};
