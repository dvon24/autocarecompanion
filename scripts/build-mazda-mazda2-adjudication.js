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
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-mazda2-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MAZDA2', 'MAZDA 2']);

const IDS = Object.freeze({
  condenser: 'mazda-mazda2-ac-condenser-leak-2011',
  rearBrake: 'mazda-mazda2-rear-drum-brake-2011',
  rearShock: 'mazda-mazda2-rear-shock-mount-2011',
  tcm: 'mazda-mazda2-tcm-reprogram-2011',
  mounts: 'mazda-mazda2-transmission-mount-2011',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const IDENTITY_REVIEW_IDS = BLOCKER_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.mounts, IDS.rearBrake].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10098347', '10136777', '10180664']);
const CAMPAIGNS = Object.freeze(['16V203000', '17V082000', '21V875000', '22V885000']);

const PDF_SOURCES = Object.freeze({
  condenserLaterGeneration: {
    title: 'Mazda TSB 07-004/20: 2016-2019 Mexico-Spec Mazda2 Condenser Corrosion',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10180664-0001.pdf',
    localPath: 'C:/tmp/mazda2-sources/MC-10180664-0001.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 384158,
    sha256: '75dcaa7ca31e720b7e15ba255d7cc5e644c29a1b2642e21862d1815759593f7f',
  },
  rearShockNoise: {
    title: 'Mazda TSB 02-002/14: Mazda2 Rear Shock Rod/Bump-Stopper Creak',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10098347-2532.pdf',
    localPath: 'C:/tmp/mazda2-sources/SB-10098347-2532.pdf',
    pages: 4, visualPages: [1, 2, 3, 4], bytes: 196602,
    sha256: '983e5234879454250212dba254ca9fdb5b1554a0355dae7399e476312f86ed25',
  },
  atfSpecification: {
    title: 'Mazda TSB 05-001/18: Correct ATF Application for 2011-2014 Mazda2',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10136777-9999.pdf',
    localPath: 'C:/tmp/mazda2-sources/MC-10136777-9999.pdf',
    pages: 2, visualPages: [1, 2], bytes: 347664,
    sha256: '97fcfa8e252d0a3e22eb9f3a34290452db10f4efafae205f853c3099cc91fe48',
  },
});

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints2012: { title: 'NHTSA 2012 Mazda2 Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=MAZDA2&modelYear=2012' },
  shockComplaint: { title: 'NHTSA Complaint ODI 11030316: 2013 Mazda2 Rear Shock Leakage', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11030316' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 8, '2015-2019': 183, '2020-2024': 142, '2025-2026': 24 },
  totalRows: 357,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 7 },
  totalRows: 7,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.condenser]: [OTHER_SOURCES.datasets, PDF_SOURCES.condenserLaterGeneration],
    [IDS.rearBrake]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints2012],
    [IDS.rearShock]: [PDF_SOURCES.rearShockNoise, OTHER_SOURCES.shockComplaint],
    [IDS.tcm]: [OTHER_SOURCES.datasets, PDF_SOURCES.atfSpecification],
    [IDS.mounts]: [OTHER_SOURCES.datasets],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda2 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.condenser]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda2 manufacturer-communication inventory did not identify a primary record establishing road-debris condenser failure on the frozen 2011-2014 U.S. Mazda2 scope. Mazda TSB 07-004/20 describes a different condition: condenser corrosion from uneven anti-corrosion coating on specified 2016-2019 Mexico-spec Mazda2 vehicles. It does not support the frozen road-debris mechanism, thin-wall design claim, or a universal condenser replacement for these earlier cars.',
      solution: 'If cooling is weak, have a qualified A/C technician recover the refrigerant as required, measure system pressures and use appropriate leak detection to locate the actual leak before opening the system. Condenser damage, an O-ring leak, a hose leak, compressor trouble and electrical or airflow faults require different repairs. Do not buy a condenser, refrigerant kit or grille mesh from this page; confirm the leak location and exact vehicle application first.',
      symptoms: ['air conditioning does not cool normally', 'refrigerant loss or condenser damage requires leak testing', 'A/C fault source has not been established'],
      summary: 'Removed a fabricated video, prices and unsupported road-debris/design claims; held the frozen condenser-failure identity because the only exact Mazda bulletin is a later Mexico-spec corrosion condition.',
    },
    [IDS.rearBrake]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda2 communication inventory and the 2012 NHTSA complaint file did not establish recurring rear-drum self-adjuster seizure across 2011-2014 vehicles. The complaint file contains individual brake concerns, but those reports do not identify a seized rear adjuster or prove the frozen cause, emergency-braking pull, parking-brake consequence or 150-owner count.',
      solution: 'If pedal travel increases, the vehicle pulls while braking or the parking brake does not hold, stop using the vehicle if braking is unsafe and have the complete brake system inspected. A technician should compare left/right shoe wear and adjustment, inspect drums, wheel cylinders, springs, cables, hydraulic operation and front brakes, and keep all lubricant off friction surfaces. Do not buy shoes, drums, cables or adjuster hardware from this page; identify the failed or misadjusted component first.',
      symptoms: ['increased brake-pedal travel', 'vehicle pulls during braking', 'parking brake does not hold normally'],
      summary: 'Proposed the unsupported 150-owner count as zero and replaced the universal seizure/remedy claim with full-system brake diagnosis; held the frozen defect identity.',
    },
    [IDS.rearShock]: {
      confidence: 'high', reportCount: 0,
      description: 'Mazda TSB 02-002/14 covers a creak or squeak from the rear of 2011-2014 Mazda2 vehicles when driving over bumps. Mazda identifies the rear shock-absorber rod surface sticking to the bump stopper, or the bump stopper sticking to its mounting base; the repair uses Mazda Silicone Brake Grease at those exact contact surfaces. NHTSA complaint 11030316 separately reports rear-shock fluid leakage and replacement on one 2013 Mazda2. Neither source establishes sheet-metal cracking, a shock pushing through the body, or a need for welded reinforcement plates.',
      solution: 'First distinguish a creak/squeak from a clunk, shock-fluid leakage or visible structural damage. For the exact TSB noise on an eligible vehicle, have a Mazda technician verify applicability and perform TSB 02-002/14 at the rod and bump-stopper contact surfaces. Any cracked body metal or displaced upper mount requires separate structural inspection. Do not buy reinforcement plates or rear shocks from this page; confirm whether the condition is friction noise, shock failure or structural damage.',
      symptoms: ['creak or squeak from the rear over bumps', 'rear shock leakage or clunk requires separate inspection', 'visible mount or body damage requires structural assessment'],
      summary: 'Replaced a fabricated video and body-cracking theory with exact TSB 02-002/14 plus one bounded shock-leak complaint; held the frozen upper-mount-cracking identity.',
    },
    [IDS.tcm]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda2 communication inventory did not identify a TCM software update for harsh 1-2 or 2-3 shifts on 2011-2014 vehicles. Mazda TSB 05-001/18 instead warns that these automatic transmissions require ATF M-V (Type M5), that the wrong or universal fluid can cause shift-quality complaints or transmission damage, and that flushing should occur only when a Mazda publication directs it. That bulletin does not prescribe TCM reprogramming.',
      solution: 'For harsh or abnormal shifting, record the operating conditions and have a qualified technician read transmission codes, verify fluid level and condition, confirm that ATF M-V (Type M5) is the specified fluid for the installed unit, and diagnose mounts and mechanical or hydraulic causes. Do not buy a TCM, transmission, universal ATF or reprogramming service from this page; no exact Mazda2 TCM update was verified for this frozen claim.',
      symptoms: ['harsh or abnormal automatic-transmission shift', 'shift concern may follow incorrect fluid service', 'transmission codes or hydraulic/mechanical causes require diagnosis'],
      summary: 'Removed a forum citation and unsupported TCM update; retained Mazda ATF-M-V guidance while holding the frozen reprogram-required identity.',
    },
    [IDS.mounts]: {
      confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda2 manufacturer-communication inventory did not identify a primary record establishing premature hydraulic engine- or transmission-mount collapse on 2011-2014 vehicles. It also did not support the frozen sequence that the transmission mount fails first, the drive-to-reverse thunk mechanism, or the 140-owner count. Vibration and clunks can come from mounts, exhaust contact, driveline lash, suspension, wheel/tire or engine-running faults and require inspection.',
      solution: 'Document whether vibration occurs in Park, Neutral, Drive, Reverse or while accelerating, then have the powertrain mounts inspected under the applicable Mazda procedure while checking engine operation, exhaust clearance and other contact points. A cracked, separated or fluid-leaking mount should be matched by VIN and position before replacement. Do not buy an engine mount, transmission mount or polyurethane mount from this page; confirm the failed location and part application first.',
      symptoms: ['excessive vibration at idle', 'clunk during load change or Drive/Reverse selection', 'possible powertrain-mount fault requires inspection'],
      summary: 'Proposed the unsupported 140-owner count as zero and removed premature-failure, hydraulic-fill and first-to-fail certainty; held the frozen mount-deterioration identity.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda2 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const map = {
    [IDS.condenser]: ['No exact 2011-2014 road-debris condenser bulletin was found in the complete 357-row inventory.', 'TSB 07-004/20 is explicitly limited to later 2016-2019 Mexico-spec cars and corrosion from uneven coating.'],
    [IDS.rearBrake]: ['No Mazda2 communication establishes rear self-adjuster seizure for the frozen scope.', '2012 NHTSA complaints are individual owner reports and do not identify that mechanism or a prevalence count.'],
    [IDS.rearShock]: ['TSB 02-002/14 establishes a rod/bump-stopper friction noise and exact grease procedure.', 'ODI 11030316 reports shock leakage on one 2013 vehicle; neither source establishes structural mount cracking.'],
    [IDS.tcm]: ['No exact 2011-2014 Mazda2 TCM reprogram bulletin was found.', 'TSB 05-001/18 establishes ATF M-V specification and warns against unsupported flushing/universal fluid, not a software remedy.'],
    [IDS.mounts]: ['No Mazda2 communication establishes the frozen premature hydraulic-mount failure narrative.', 'No owner-frequency rate or specific mount position is inferred from absence of a matching primary record.'],
  };
  return { primaryEvidence: map[id], limitations: 'No owner-frequency rate, retail fitment, warranty eligibility or failed component is inferred beyond the cited primary source.' };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.condenser]: 'No universal retail part; an A/C technician must locate the leak and verify the exact condenser application.',
    [IDS.rearBrake]: 'No universal retail part; full brake-system inspection must identify shoes, drums, hydraulics, cables or adjuster faults.',
    [IDS.rearShock]: 'No universal retail part; distinguish TSB friction noise, shock leakage and structural damage before parts selection.',
    [IDS.tcm]: 'No universal retail part; no exact TCM update was verified and the installed transmission/fluid/fault must be diagnosed.',
    [IDS.mounts]: 'No universal retail part; the failed mount location, construction and VIN application require inspection.',
  };
  return map[id];
}

function identityConflictFor(id) {
  const map = {
    [IDS.condenser]: 'The frozen title asserts premature road-debris condenser failure for 2011-2014; the only exact Mazda condenser bulletin found is a different 2016-2019 Mexico-spec corrosion condition.',
    [IDS.rearBrake]: 'The frozen title asserts a recurring self-adjuster seizure mechanism that the complete Mazda/NHTSA record reviewed did not establish.',
    [IDS.rearShock]: 'The frozen title asserts structural upper-mount cracking, while Mazda documents rod/bump-stopper friction noise and one complaint reports shock leakage.',
    [IDS.tcm]: 'The frozen title asserts that TCM reprogramming is required, while the exact Mazda source addresses ATF specification and no matching TCM update was found.',
    [IDS.mounts]: 'The frozen title asserts deterioration of engine and transmission mounts, while the reviewed primary inventory did not establish that defect identity.',
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
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazda2').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 5) throw new Error(`Expected 5 frozen Mazda2 rows, found ${frozenRows.length}`);
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
    model: 'Mazda2',
    completionStatement: 'All 5 frozen Mazda2 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All five frozen titles assert a defect mechanism or remedy that is unsupported or contradicted by the exact primary record; no catalog write is authorized.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 5 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The two fabricated nonzero report counts are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'A later-generation bulletin and individual owner complaints are not expanded into the frozen 2011-2014 defect identities.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'mazda2-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Every frozen title overstates or conflicts with the exact primary evidence and therefore cannot be silently rewritten.' },
      { code: 'mazda2-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Frozen 150- and 140-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'mazda2-fabricated-video-removed', severity: 'source-correction', recordIds: [IDS.condenser, IDS.rearShock], detail: 'The same fabricated YouTube identifier is removed from both frozen pages.' },
      { code: 'all-mazda2-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'No Mazda2 page is removed, merged, redirected or allowed to lose its indexed identity while this packet is reviewed.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 2, total: 5 },
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
