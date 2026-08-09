/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  RECALL_FILES,
  SOURCE_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mini-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mini-clubman-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  clutch: 'mini-clubman-clutch-failure-2008',
  oilHousing: 'mini-clubman-oil-filter-housing-2016',
  rearDoor: 'mini-clubman-rear-door-latch-2008',
  window: 'mini-clubman-window-regulator-2008',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const MODEL_ALIASES = Object.freeze([
  'R55 CLUBMAN', 'R56CLUBMAN', 'COOPER CLUBMAN', 'COOPER CLUBMAN S',
  'COOPER S CLUBMAN', 'JCW CLUBMAN', 'CLUBMAN',
]);
const SEARCH_TERMS = Object.freeze([
  'clutch', 'flywheel', 'oil filter housing', 'filter housing', 'oil leak',
  'rear split door', 'split door', 'latch', 'hinge', 'window regulator', 'power window',
]);
const RELEVANT_DOCUMENT_IDS = Object.freeze([
  '10026766', '10044037', '10044680', '10046760', '10146750', '10146924',
  '10146975', '10147108', '10147956', '10148206', '10148293', '10148297',
  '10148391', '10148441', '10149323', '10149500', '10150087', '10150145',
  '10150347', '10151046', '10153719', '10174369', '11031881',
]);
const CAMPAIGNS = Object.freeze([
  '08V507000', '11V299000', '12V008000', '16V553000', '16V914000', '17E051000',
  '18V248000', '18V465000', '20V283000', '21V554000', '23V337000',
]);

const PDF_SOURCES = Object.freeze({
  dualMassFlywheel: {
    title: 'MINI SI M21 01 14 - Dual Mass Flywheel: Diagnosis and Inspection',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10148206-9999.pdf',
    sha256: 'edc035a969e4feb15b588a93b837d881aeb48c263288a7ff50ee7a365deb358f',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
  windowRegulatorSqueak: {
    title: 'MINI SI M51 03 12 - Window Regulators Squeak when Moving Up or Down',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10148297-9999.pdf',
    sha256: '49e6f988bfb871bee4454deea7f2d2f38197b06e929d42dba78ef7f44ce4ba44',
    pageCount: 5,
    visuallyReviewedPages: [1],
  },
  footwellModule: {
    title: 'MINI SIB 61 02 26 - Short Circuit in the Footwell Module (FRM)',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11031881-0001.pdf',
    sha256: 'b91552d6af8c4612d6029292153d7077ef3b9c6a39fe550ed545292176ccae83',
    pageCount: 5,
    visuallyReviewedPages: [1],
  },
  f54SplitDoorLock: {
    title: "MINI SI M51 03 17 - Left Split Door Won't Unlatch",
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10146750-9999.pdf',
    sha256: '33db0c0eeaae64f64634c84f1aba871d20b86c02d6ce0b213c87be59933c8498',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
  f55F56OilHousingAction: {
    title: 'MINI SI M11 05 15 - Service Action: Replace Oil Filter Housing Assembly',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10058469-3344.pdf',
    sha256: 'c06b4a56f4411490e606f5c0a79eb5ddccfdb7d37feee9a6a23bc8a0f09f897b',
    pageCount: 2,
    visuallyReviewedPages: [1],
  },
});
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
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 29, '2010-2014': 84, '2015-2019': 430, '2020-2024': 101, '2025-2026': 18 },
  totalRows: 662,
  relevantRowCount: 50,
  uniqueRelevantCommunications: RELEVANT_DOCUMENT_IDS.length,
  requiredDocumentIds: RELEVANT_DOCUMENT_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 1, post: 47 },
  totalRows: 48,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  scopeFinding: 'Eleven federal campaigns exist in the Clubman alias set, but none establishes a model-wide premature clutch, F54 oil-gasket, R55 latch-and-hinge, or 2008-2020 regulator-failure identity.',
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.clutch]: {
    description: 'MINI SI M21 01 14 covers dual-mass-flywheel diagnosis on R55 Clubman S and JCW vehicles and requires measured rotational free play, axial play or thermal damage before replacement. The bulletin does not establish premature clutch wear, a recurring failure rate, or the frozen claim that compact design and torque cause early wear across every 2008-2014 Clubman.',
    solution: 'Confirm that the vehicle has a manual transmission and record the engine and clutch configuration. Separate hydraulic-release, oil-contamination, disc, pressure-plate and gearbox symptoms before removing the transmission. Inspect the dual-mass flywheel using the MINI thresholds: at least three ring-gear tooth gaps of rotational free play or 3 mm axial play for N14/N18 applications, or significant discoloration or friction-surface erosion. Do not buy a clutch kit, flywheel, release bearing or Exedy kit from this page; the failed component and exact VIN fitment must be proven first.',
    symptoms: ['manual-transmission and engine configuration confirmed', 'hydraulic, contamination, clutch and gearbox paths separated', 'dual-mass-flywheel free play, axial play and heat damage measured'],
    affectedSystems: ['manual clutch and release system', 'dual-mass flywheel', 'transmission input and crankshaft sealing interfaces'],
    evidence: ['SI M21 01 14 covers R55 Clubman S and JCW models equipped with a dual-mass flywheel.', 'The bulletin requires measured free play, axial play or thermal damage before replacing a flywheel.', 'No reviewed primary source establishes the frozen premature-wear frequency or compact-design cause.'],
    conflict: 'The indexed title asserts premature clutch and flywheel failure, while the exact manufacturer evidence supplies diagnostic thresholds without establishing premature frequency or one cause.',
    summary: 'Held the premature-failure identity and replaced parts-first advice with MINI flywheel thresholds and configuration-specific diagnosis.',
    citations: ['dualMassFlywheel', 'datasets'],
  },
  [IDS.oilHousing]: {
    description: 'The reviewed MINI manufacturer-communication corpus does not establish the frozen F54 Clubman 2016-2025 B46/B48 oil-filter-housing-gasket leak identity, owner frequency or asserted exhaust-fire mechanism. SI M11 05 15 documents a coolant leak and housing replacement on 2014 F55/F56 vehicles with B46/B48-family engines, not an oil gasket leak on the F54 Clubman year set.',
    solution: 'Clean the engine and distinguish engine oil from coolant, then pressure-test the cooling system and use dye or tracing powder to locate the highest wet point. Inspect the oil-filter cap, housing, oil cooler, nearby lines and engine interfaces without transferring an F55/F56 service action to an F54 by engine family alone. Confirm the VIN, chassis and leak source in MINI AIR/ETK before selecting parts. Do not buy gasket 11428583898, O-ring 11427566327, an oil-filter housing, scanner, oil bundle or any B48 part from this page; the frozen fitment and failure mechanism are not proven.',
    symptoms: ['fluid identified as oil or coolant before diagnosis', 'highest wet point and pressure-test or dye result documented', 'VIN and chassis applicability checked before parts selection'],
    affectedSystems: ['oil-filter housing and cap interfaces', 'oil cooler and coolant circuit', 'adjacent engine oil-leak sources'],
    evidence: ['SI M11 05 15 applies to 2014 F55/F56 vehicles and describes coolant leakage, not the frozen F54 oil-gasket claim.', 'The exact Clubman source inventory contains no matching F54 2016-2025 manufacturer communication for this identity.', 'The frozen 1,400-owner count, fire-risk statement and part numbers have no auditable owner or fitment source.'],
    conflict: 'The indexed F54 oil-gasket identity and years are not established by the exact primary corpus; the closest engine-family service action is a different chassis, fluid and production window.',
    summary: 'Held the unsupported F54 oil-gasket identity, removed invented social proof and blocked cross-chassis part transfer.',
    citations: ['f55F56OilHousingAction', 'datasets'],
  },
  [IDS.rearDoor]: {
    description: 'NHTSA manufacturer-communication record 10026766 supports intermittent R55 rear split-door unlatching or unexpected release on vehicles produced through September 2008 and attributes it to moisture-corroded handle wiring connectors. A later F54 bulletin documents a separate left-lock dimensional condition. Neither source establishes premature hinge failure or one latch-and-hinge mechanism across every 2008-2014 R55.',
    solution: 'If either rear door will not remain latched, stop using the cargo area until the door is secured. Reproduce the fault wet and dry, inspect handle fit and connector corrosion, test the microswitch and wiring, then inspect the lock, striker, alignment, check strap and hinge play separately. Do not buy latch 51247149630 or 51247149629, a Dorman latch, door handle, hinge or check strap from this page; side, production date and failed subsystem must be confirmed first.',
    symptoms: ['wet-versus-dry behavior and production date recorded', 'handle connector, microswitch and wiring tested', 'lock, striker, alignment, check strap and hinge play separated'],
    affectedSystems: ['rear split-door handle wiring and microswitch', 'left and right lock and striker mechanisms', 'door alignment, hinges and check straps'],
    evidence: ['NHTSA record 10026766 describes R55 rear split-door release behavior through September 2008 and a moisture-corroded connector cause.', 'SI M51 03 17 applies to later F54 vehicles and a different left-lock dimensional condition.', 'No reviewed primary source establishes premature hinge wear or the full frozen 2008-2014 combined identity.'],
    conflict: 'The indexed title combines latch and hinge failure over seven years, but the exact evidence is production-window and subsystem specific.',
    summary: 'Held the combined latch-and-hinge identity, removed invented social proof and required safety-first subsystem diagnosis.',
    citations: ['f54SplitDoorLock', 'datasets'],
  },
  [IDS.window]: {
    description: 'MINI SI M51 03 12 supports a front-window-regulator squeak caused by nylon guide clips on R55 vehicles produced from February 28, 2010 through May 4, 2012. SIB 61 02 26 separately shows that an unresponsive footwell module can disable power windows on 2010-2014 R55 vehicles. Neither bulletin establishes regulator or motor failure, a dropped-window mechanism, or one recurring identity across the frozen 2008-2020 two-generation year set.',
    solution: 'Record the chassis generation, production date, affected door and whether one or all windows fail. Check fuses, switch commands, power, grounds, glass binding and motor sound; diagnose the footwell module when lighting or other body-electrical functions fail too. For a 2010-2012 squeak, confirm the noise is from the regulator guides before following SI M51 03 12. Do not buy regulator 51337039451, a Dorman regulator or motor assembly, guide clips or a footwell module from this page; the failed subsystem, side and generation must be proven first.',
    symptoms: ['chassis generation, production date and affected door recorded', 'power, ground, switch, glass and motor paths tested', 'regulator-guide noise separated from footwell-module loss of function'],
    affectedSystems: ['front window regulator guides and rails', 'window motor, switches and wiring', 'footwell module and related body electrical systems'],
    evidence: ['SI M51 03 12 covers squeak diagnosis and nylon guide clips for a bounded 2010-2012 R55 production window.', 'SIB 61 02 26 covers footwell-module failure that can disable power windows on 2010-2014 R55 vehicles.', 'No reviewed primary source establishes the frozen 2008-2020 regulator-failure identity or 1,600-owner count.'],
    conflict: 'The indexed identity asserts regulator failure across two generations while exact evidence separates guide noise from an electrical control-module condition in narrower windows.',
    summary: 'Held the broad regulator-failure identity, removed invented social proof and separated mechanical from FRM diagnosis.',
    citations: ['windowRegulatorSqueak', 'footwellModule', 'datasets'],
  },
});

function citationFor(key) {
  if (key === 'datasets') return clone(OTHER_SOURCES.datasets);
  return clone(PDF_SOURCES[key]);
}
function citationsFor(id) { return CONTENT[id].citations.map(citationFor); }
function commerceDecisionFor(id) {
  const labels = {
    [IDS.clutch]: 'clutch versus flywheel diagnosis and VIN fitment remain unresolved; no universal retail part',
    [IDS.oilHousing]: 'fluid, chassis applicability, failure source and VIN fitment remain unresolved; no universal retail part',
    [IDS.rearDoor]: 'door side, production date and latch, wiring, alignment or hinge cause remain unresolved; no universal retail part',
    [IDS.window]: 'generation, door side and regulator, motor, glass, wiring or FRM cause remain unresolved; no universal retail part',
  };
  return labels[id];
}
function proposalFor(record) {
  const before = fullRecord(record);
  const content = CONTENT[record.id];
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(record.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    lastReportedByOwners: '',
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'MINI' && row.model === 'Clubman')
    .sort((left, right) => left.id.localeCompare(right.id));
  if (frozenRows.length !== 4 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen Clubman coverage does not match the 4-row adjudication contract');
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor(record);
    return {
      id: record.id,
      action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true,
      identityConflict: CONTENT[record.id].conflict,
      reason: 'The frozen indexed identity materially exceeds the exact manufacturer and federal evidence and remains published pending independent review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, universal failure mechanism, repair price or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(record.id),
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
    make: 'MINI',
    model: 'Clubman',
    completionStatement: 'All four frozen MINI Clubman pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'All four frozen identities exceed exact evidence; no production content write is authorized.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All four pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'Three invented report counts are reduced to unknown zero in the proposal, and unknown totals are never rendered or written as "0+ owners" social proof.',
      'Manufacturer communications and recall populations are not converted into owner-report totals or recurrence rates.',
      'A manufacturer bulletin proves only its exact chassis, production window and condition; engine-family similarity is not cross-chassis proof.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic and fitment boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mini-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'clubman-identities-held', severity: 'identity-hold', recordIds: ALL_IDS, detail: 'All four frozen frequency, mechanism or applicability identities exceed exact primary evidence.' },
      { code: 'invented-owner-counts-removed-in-proposal', severity: 'accuracy-cleanup', recordIds: [IDS.oilHousing, IDS.rearDoor, IDS.window], detail: 'The 1,400, 750 and 1,600 owner totals have no auditable source and are proposed as unknown zero without owner-language rendering.' },
      { code: 'cross-chassis-transfer-blocked', severity: 'fitment-safety', recordIds: [IDS.oilHousing, IDS.rearDoor, IDS.window], detail: 'F55/F56, F54 and R55 conditions are not transferred across chassis or production windows.' },
      { code: 'all-clubman-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Clubman page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: clone(PDF_SOURCES),
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: ALL_IDS.length,
      fabricated_report_counts_proposed_zero: 3,
      pages_preserved_published: ALL_IDS.length,
      total: ALL_IDS.length,
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
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, CONTENT, IDS, MODEL_ALIASES,
  OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, RELEVANT_DOCUMENT_IDS, REVIEW_DATE, SEARCH_TERMS,
  SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor,
};
