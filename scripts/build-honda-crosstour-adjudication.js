/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
} = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-crosstour-adjudication-2026-08-06.json');

const IDS = {
  acRelay: 'honda-crosstour-ac-relay-failure-2010',
  starter: 'honda-crosstour-electrical-issues-2013',
  paint: 'honda-crosstour-paint-clearcoat-issues-2010',
  suspension: 'honda-crosstour-suspension-strut-wear-2010',
  parkingPawl: 'honda-crosstour-transmission-parking-pawl-2010',
  shudder: 'honda-crosstour-transmission-shudder-2010',
  oilConsumption: 'honda-crosstour-vcm-oil-consumption-2010',
};

const SOURCES = {
  starter: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10115802-9999.pdf',
  paint: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10160916-0001.pdf',
  shudder2010Software: 'https://static.nhtsa.gov/odi/tsbs/2017/SB-10108047-9340.pdf',
  shudder2010Converter: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10086084-2280.pdf',
  shudder2013To2015: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10139550-9999.pdf',
  shudderAfterUpdate: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10139551-9999.pdf',
};

const MISMATCH_SOURCES = {
  suspensionBallJoint: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10086863-2280.pdf',
  parkingPawlRecall: 'https://static.nhtsa.gov/odi/rcl/2011/RCAK-11V395-5977.pdf',
  parkingPawlApi: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Honda&model=Accord%20Crosstour&modelYear=2010',
  pistonRingMisfire: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152431-0001.pdf',
};

const REWRITE_CARDS = {
  [IDS.starter]: {
    years: [2013, 2014, 2015],
    category: 'electrical',
    title: 'Starter Grinds or Spins at Startup - Service Bulletin 16-002',
    description: 'Honda Service Bulletin 16-002 applies to 2013-2015 Crosstour V6 models with an automatic transmission. The starter may grind or spin at startup because clearance between the starter motor gear and the torque-converter ring gear is not optimal.',
    solution: 'Have a Honda dealer confirm that Service Bulletin 16-002 applies. The bulletin directs the technician to replace the starter and rotate the torque converter clockwise by one bolt hole.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Starter grinds at startup', 'Starter spins at startup without cranking the engine normally'],
    affectedSystems: ['starter motor gear', 'torque-converter ring gear'],
    dtcCodes: [],
    citations: [
      { type: 'tsb', title: 'Honda Service Bulletin 16-002 - Starter Grinds or Spins at Startup', url: SOURCES.starter },
    ],
    identityTerms: ['starter', 'start'],
    summary: 'Narrowed the mixed electrical aggregation to the exact 2013-2015 V6 automatic starter/ring-gear condition in Honda Service Bulletin 16-002 and removed unsupported warning-light, VCM/GDI, cost and commerce claims.',
  },
  [IDS.paint]: {
    years: [2014, 2015],
    category: 'body',
    title: 'White Diamond Pearl Paint Peeling - Honda Investigation',
    description: 'American Honda investigated paint-peeling complaints on certain 2014-2015 Crosstours finished in NH-603P White Diamond Pearl. Honda requested inspection of vehicles that had not been in a collision and had not already been repaired. The engineering request did not identify a cause or announce a warranty extension.',
    solution: 'Document the paint color, affected panels and peeling before repair, then ask a Honda dealer whether any current VIN-specific assistance applies. The cited engineering request asked dealers to contact Honda before attempting a repair; it did not promise coverage or specify a repair procedure.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['Paint peeling on a 2014-2015 Crosstour finished in NH-603P White Diamond Pearl'],
    affectedSystems: ['exterior paint', 'body finish'],
    dtcCodes: [],
    citations: [
      { type: 'manufacturer', title: 'Honda Engineering Request AER19050A - 2014-2015 Crosstour White Diamond Pearl Paint Peel', url: SOURCES.paint },
    ],
    identityTerms: ['paint', 'peel'],
    summary: 'Corrected the broad 2010-2015 paint card to Honda\'s documented 2014-2015 NH-603P White Diamond Pearl investigation and removed the unsupported 13-086 warranty-extension, color, cost, rust and commerce claims.',
  },
  [IDS.shudder]: {
    years: [2010, 2013, 2014, 2015],
    category: 'transmission',
    title: 'Torque Converter Lock-Up Clutch Judder - Honda Bulletins 16-066 and 17-041',
    description: 'Honda documented torque-converter lock-up clutch judder on eligible 2010 Accord Crosstours at 20-45 mph and on 2013-2015 Crosstour V6 automatic models at 20-60 mph. For the 2013-2015 vehicles, Honda attributed the judder to transmission fluid deteriorating under intermittent high heat and stated that this judder did not mean the torque converter or transmission was damaged.',
    solution: 'Ask a Honda dealer to confirm the model-year procedure and VIN eligibility. For an eligible 2010 vehicle, Bulletin 16-066 calls for a software update and ATF replacement; if the verified judder returns, Bulletin 16-067 provides a torque-converter inspection and possible replacement path. For 2013-2015 V6 automatic vehicles, Bulletin 17-041 calls for a transmission snapshot, software update and ATF flush when confirmed; Bulletin 17-042 covers confirmed judder after the update.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Judder from the torque-converter lock-up clutch between 20 and 45 mph on an eligible 2010 vehicle', 'Judder between 20 and 60 mph on a 2013-2015 Crosstour V6 automatic'],
    affectedSystems: ['torque-converter lock-up clutch', 'automatic transmission fluid', 'PGM-FI software'],
    dtcCodes: [],
    citations: [
      { type: 'tsb', title: 'Honda Service Bulletin 16-066 - 2010 Accord Crosstour Lock-Up Clutch Software Update', url: SOURCES.shudder2010Software },
      { type: 'tsb', title: 'Honda Service Bulletin 16-067 - 2010 Accord Crosstour Torque Converter Warranty Extension', url: SOURCES.shudder2010Converter },
      { type: 'tsb', title: 'Honda Service Bulletin 17-041 - 2013-2015 Crosstour V6 Lock-Up Clutch Judder', url: SOURCES.shudder2013To2015 },
      { type: 'tsb', title: 'Honda Service Bulletin 17-042 - Crosstour Judder After Software Update', url: SOURCES.shudderAfterUpdate },
    ],
    identityTerms: ['transmission', 'torque converter'],
    summary: 'Replaced the empty and generic citations with the exact Honda procedures, corrected the affected years to 2010 and 2013-2015, and removed unsupported hard-shift, slipping, damage, cost and shopping claims.',
  },
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Honda',
    model: 'Crosstour',
    trims: [],
    engines: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-06',
    contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: card.summary,
    relatedIssueIds: [],
  });
}

function keepReason(current) {
  const reasons = {
    [IDS.acRelay]: 'The frozen relay card cites only a generic NHTSA vehicle page, which does not establish relay failure, part number, diagnosis or remedy. No same-identity Honda bulletin was verified, so the row stays byte-for-byte unchanged.',
    [IDS.suspension]: 'Honda Bulletin 12-082 documents a hot-weather front clunk caused by lower ball-joint grease redistribution, not the frozen page\'s strut-wear identity. Substituting that different component would repeat the prior audit failure, so the row stays byte-for-byte unchanged.',
    [IDS.parkingPawl]: 'The frozen narrative matches recall 11V-395, but that official record lists Accord, CR-V and Element and the NHTSA 2010 Accord Crosstour recall lookup does not return 11V-395. No Crosstour-specific parking-pawl campaign was verified, so the row stays byte-for-byte unchanged for independent disposition.',
    [IDS.oilConsumption]: 'Honda Bulletin 13-079 covers rotating/aligned piston rings, fouled spark plugs and misfire DTCs P0301-P0304. It does not establish the frozen page\'s severe oil-consumption rate, VCM causation, engine-damage estimate or VCM-disabler remedy. The row stays byte-for-byte unchanged.',
  };
  return reasons[current.id] || 'No exact same-identity manufacturer or government source was completed; the row stays byte-for-byte unchanged.';
}

function evidenceFor(id) {
  if (id === IDS.suspension) return [{ kind: 'citation-identity-mismatch', url: MISMATCH_SOURCES.suspensionBallJoint, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 12-082 covers a 2010-2013 Crosstour front clunk caused by lower ball joints, not premature front-strut wear.' }];
  if (id === IDS.parkingPawl) return [
    { kind: 'recall-scope-mismatch', url: MISMATCH_SOURCES.parkingPawlRecall, verifiedOn: '2026-08-06', observation: 'NHTSA recall 11V-395 names 2005-2010 Accord, 2007-2010 CR-V and 2005-2008 Element; it does not name Accord Crosstour.' },
    { kind: 'government-recall-api', url: MISMATCH_SOURCES.parkingPawlApi, verifiedOn: '2026-08-06', observation: 'The NHTSA 2010 Honda Accord Crosstour recall results do not include campaign 11V-395.' },
  ];
  if (id === IDS.oilConsumption) return [{ kind: 'citation-identity-mismatch', url: MISMATCH_SOURCES.pistonRingMisfire, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 13-079 supports piston-ring alignment, spark-plug fouling and misfire DTCs P0301-P0304, not the frozen VCM oil-consumption narrative.' }];
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const crosstourRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Crosstour');
  if (crosstourRows.length !== 7) throw new Error(`expected 7 Honda Crosstour rows, found ${crosstourRows.length}`);

  const rows = crosstourRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action,
      reason: card ? card.summary : keepReason(current),
      identityRule: card
        ? 'The existing symptom/component identity remains on the same ID; only exact Honda-source-backed scope, mechanism and guidance change.'
        : 'No content or publication-state changes; a different model, component or failure mode cannot replace this issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const actions = ['rewrite_same_identity', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Honda',
    model: 'Crosstour',
    completionStatement: 'This packet reconciles all seven frozen Honda Crosstour rows. Three same-identity primary-source corrections are proposed; four rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All seven rows remain published. Four are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.',
      'All three rewrites contain zero commerce, zero cost claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      crosstourRecordCount: crosstourRows.length,
    },
    observations: [
      { code: 'ac-relay-primary-source-gap', severity: 'independent-review-required', recordIds: [IDS.acRelay], detail: 'The generic NHTSA vehicle page does not substantiate the relay failure or part-number claims; the row remains byte-equivalent.' },
      { code: 'strut-vs-ball-joint-identity-mismatch', severity: 'independent-review-required', recordIds: [IDS.suspension], detail: 'Honda Bulletin 12-082 supports a lower-ball-joint hot-weather clunk, not the indexed strut-wear identity. No substitution is proposed.' },
      { code: 'parking-pawl-recall-model-mismatch', severity: 'independent-review-required', recordIds: [IDS.parkingPawl], detail: 'Recall 11V-395 supplies the frozen narrative but does not appear in the 2010 Accord Crosstour NHTSA recall results. No removal or replacement is proposed.' },
      { code: 'oil-consumption-vs-misfire-identity-mismatch', severity: 'independent-review-required', recordIds: [IDS.oilConsumption], detail: 'Honda Bulletin 13-079 supports ring-alignment misfires, not the frozen VCM oil-consumption mechanism or remedy. No substitution is proposed.' },
    ],
    summary,
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();

module.exports = {
  FULL_RECORD_FIELDS,
  IDS,
  MISMATCH_SOURCES,
  REWRITE_CARDS,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewriteProposal,
};
