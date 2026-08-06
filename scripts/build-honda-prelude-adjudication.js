/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-honda-prelude-adjudication-2026-08-06.json');

const IDS = {
  fourWheelSteering: 'honda-prelude-4th-gen-electronic-4-wheel-steering-faults-default-to-2ws',
  transmissionDetailed: 'honda-prelude-5th-gen-automatic-transmission-premature-failure',
  acClutch: 'honda-prelude-ac-compressor-clutch-1997',
  atts: 'honda-prelude-atts-failure-1997',
  transmissionSparse: 'honda-prelude-auto-transmission-failure-1997',
  distributorFourthGen: 'honda-prelude-distributor-failure-1992',
  combinedRecalls: 'honda-prelude-front-lower-ball-joint-premature-wear-plus-ignition-switch-r',
  distributorH22H23: 'honda-prelude-h22-h23-distributor-failure',
  oilConsumption: 'honda-prelude-h22-oil-consumption-via-worn-valve-stem-seals-rings',
  ignitionSwitch: 'honda-prelude-ignition-switch-1997',
  mainRelay: 'honda-prelude-pgm-fi-main-relay-hot-weather-no-start',
  steeringRack: 'honda-prelude-power-steering-rack-leak-1992',
  rearMainSeal: 'honda-prelude-rear-main-seal-1997',
  vtecLeak: 'honda-prelude-vtec-solenoid-leak-1993',
};

const SOURCES = {
  transmissionWarranty: 'https://global.honda/en/newsroom/worldnews/2002/4020920.html?from=rich_r',
  ballJointRecall: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V069000',
  ignitionStallRecall: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=02V120000',
  shiftInterlockRecall: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=05V025000',
};

const transmissionCard = {
  years: [2000, 2001], category: 'transmission', severity: 'high', confidence: 'high',
  title: 'Automatic Transmission Premature Wear or Failure - 2002 Warranty Extension',
  description: 'In September 2002, American Honda announced an extended warranty for automatic transmissions in 2000-2001 Honda Prelude vehicles because problems could result in premature wear or failure. Honda said slow or erratic shifting could warn that the transmission was not operating properly and reported that about two percent of the covered vehicles had experienced the problem at that time.',
  solution: 'Have slow or erratic shifting diagnosed by a Honda dealer and confirm the vehicle\'s service and campaign history. Honda\'s historical extension covered the affected automatic transmission for seven years or 100,000 miles; that period has expired and this page does not promise current warranty coverage.',
  symptoms: ['Slow shifting', 'Erratic shifting'],
  affectedSystems: ['Automatic transmission'], dtcCodes: [],
  citations: [{ type: 'manufacturer', title: 'American Honda Extends Warranties on Select Automatic Transmissions (September 20, 2002)', url: SOURCES.transmissionWarranty }],
  identityTerms: ['automatic transmission', 'premature wear or failure'],
  summary: 'Corrected the unsupported 1997-2001 failure narrative to Honda\'s exact 2000-2001 Prelude automatic-transmission warranty population, warning symptoms and historical coverage; removed speculative mechanisms, DTCs, costs, swaps and commerce.',
};

const REWRITE_CARDS = {
  [IDS.transmissionDetailed]: transmissionCard,
  [IDS.transmissionSparse]: transmissionCard,
  [IDS.combinedRecalls]: {
    years: [1996, 1997, 1998, 1999, 2000, 2001], category: 'safety', severity: 'critical', confidence: 'high',
    title: 'Front Lower Ball Joint and Ignition-Switch Safety Recalls 99V069, 02V120, and 05V025',
    description: 'Three NHTSA campaigns cover distinct Prelude safety defects. Recall 99V069 covers certain 1996-1998 vehicles whose front lower ball joints can wear prematurely and separate, collapsing the front suspension and reducing steering control. Recall 02V120 covers certain 1997-1999 vehicles whose ignition-switch electrical contacts can degrade and stall the engine without warning. Recall 05V025 covers certain 1997-2001 vehicles whose ignition interlock can permit key removal without the transmission in Park, creating rollaway risk.',
    solution: 'Have a Honda dealer check the VIN for all three campaigns. Recall 99V069 replaces the front suspension lower ball joints. Recall 02V120 replaces the ignition switch. Recall 05V025 inspects interlock operation and installs a redesigned interlock lever when required.',
    symptoms: ['Open recall 99V069, 02V120, or 05V025 for the VIN', 'Potential front suspension collapse if a lower ball joint separates', 'Potential engine stall without warning', 'Potential key removal when the transmission is not in Park'],
    affectedSystems: ['Front suspension lower ball joints', 'Ignition-switch electrical contacts', 'Ignition shift interlock'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Recall 99V069 - 1996-1998 Prelude Front Lower Ball Joints', url: SOURCES.ballJointRecall },
      { type: 'recall', title: 'NHTSA Recall 02V120 - 1997-1999 Prelude Ignition-Switch Contacts', url: SOURCES.ignitionStallRecall },
      { type: 'recall', title: 'NHTSA Recall 05V025 - 1997-2001 Prelude Ignition Interlock', url: SOURCES.shiftInterlockRecall },
    ],
    identityTerms: ['lower ball joint', 'ignition-switch'],
    summary: 'Preserved the indexed combined-recall identity while replacing secondary sources with exact NHTSA campaigns, correcting the ball-joint scope to 1996-1998 and separating the two different ignition-switch defects and remedies.',
  },
  [IDS.ignitionSwitch]: {
    years: [1997, 1998, 1999], category: 'electrical', severity: 'critical', confidence: 'high',
    title: 'Ignition-Switch Electrical Contacts Can Degrade and Stall Engine - Recall 02V120',
    description: 'NHTSA recall 02V120 covers certain 1997-1999 Honda Prelude vehicles. High electrical current during starting can degrade the ignition-switch electrical contacts. Worn contacts can cause the engine to stall without warning and increase crash risk.',
    solution: 'Have a Honda dealer check the VIN for recall 02V120 and verify completion. The recall remedy replaces the ignition switch.',
    symptoms: ['Open recall 02V120 for the VIN', 'Engine may stall without warning'],
    affectedSystems: ['Ignition-switch electrical contacts'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 02V120 - 1997-1999 Prelude Ignition-Switch Contacts', url: SOURCES.ignitionStallRecall }],
    identityTerms: ['ignition-switch', 'stall'],
    summary: 'Replaced generic vehicle and video links with exact recall 02V120, corrected the scope to 1997-1999, removed the wrong 03V474 reference and unsupported part, labor and accessory claims, and retained the indexed stall identity.',
  },
};

const KEEP_REASONS = {
  [IDS.fourWheelSteering]: 'The frozen row relies on owner forums for a broad 1992-1996 electronic-4WS defect and solder/sensor remedies. No exact Honda primary source was found that establishes that population and repair, so it remains byte-for-byte unchanged.',
  [IDS.acClutch]: 'A generic NHTSA complaint landing page does not establish one 1997-2001 Prelude compressor-clutch, relay and seized-compressor defect or the claimed diagnostic values and repair. The row remains byte-for-byte unchanged.',
  [IDS.atts]: 'A generic NHTSA complaint landing page does not establish the claimed ATTS clutch-pack, pump and fluid-degradation defect, costs or repair. The row remains byte-for-byte unchanged.',
  [IDS.distributorFourthGen]: 'A generic complaint landing page and video do not establish the claimed fourth-generation distributor failure population, mileage threshold or replacement procedure. The row remains byte-for-byte unchanged.',
  [IDS.distributorH22H23]: 'Owner-forum anecdotes do not establish one H22/H23 distributor sensor-and-bearing defect with the claimed mechanism and remedy. This overlapping distributor page remains byte-for-byte unchanged for independent disposition.',
  [IDS.oilConsumption]: 'Forum reports and a parts retailer do not establish one Honda-recognized H22 valve-seal-and-ring defect, consumption rate or rebuild remedy. The row remains byte-for-byte unchanged.',
  [IDS.mainRelay]: 'Forum and retailer material does not establish one Prelude-wide cracked-solder PGM-FI main-relay defect or prove the claimed likelihood relative to the fuel pump. The row remains byte-for-byte unchanged.',
  [IDS.steeringRack]: 'A generic complaint landing page and repair video do not establish a 1992-2001 Prelude steering-rack seal defect, 4WS extension, costs or complete replacement remedy. The row remains byte-for-byte unchanged.',
  [IDS.rearMainSeal]: 'A generic complaint landing page and video do not establish a Prelude H22/H23 rear-main-seal defect, fire-risk claim or five-to-eight-hour repair. The row remains byte-for-byte unchanged.',
  [IDS.vtecLeak]: 'The frozen VTEC-solenoid-leak row has no citations. No exact Honda source was found for its 1993-2001 population, failure mechanism, costs or complete repair, so it remains byte-for-byte unchanged.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({
    ...current, ...card, make: 'Honda', model: 'Prelude', trims: [], engines: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual',
    status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: card.summary, relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Prelude');
  if (modelRows.length !== 14) throw new Error(`expected 14 Honda Prelude rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id, model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The indexed issue identity stays on the same ID; only exact Honda/NHTSA scope, mechanism, symptoms and remedy replace unsupported claims.' : 'No content or publication-state changes; partial, generic, secondary or overlapping evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: item.type === 'recall' ? 'government-recall-record' : 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : [],
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = {
    rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length,
    keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length,
    total: rows.length,
  };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Honda', model: 'Prelude',
    completionStatement: 'This packet reconciles all 14 frozen Honda Prelude rows. Four same-identity Honda/NHTSA corrections are proposed; ten rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All 14 rows remain published. Ten are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component, generation or model may never replace the issue named by an existing indexed page.',
      'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, preludeRecordCount: modelRows.length },
    observations: [
      { code: 'duplicate-transmission-pages-preserved', severity: 'independent-review-required', recordIds: [IDS.transmissionDetailed, IDS.transmissionSparse], detail: 'Two indexed pages describe the same automatic-transmission identity. Both receive the same exact Honda correction; neither is removed, redirected or silently consolidated.' },
      { code: 'historical-warranty-not-presented-as-current', severity: 'independent-review-required', recordIds: [IDS.transmissionDetailed, IDS.transmissionSparse], detail: 'Honda announced seven-year/100,000-mile coverage in 2002. The proposals explicitly state that the historical coverage has expired.' },
      { code: 'three-recall-identities-kept-distinct', severity: 'independent-review-required', recordIds: [IDS.combinedRecalls, IDS.ignitionSwitch], detail: 'Campaign 99V069 is a 1996-1998 lower-ball-joint defect, 02V120 is a 1997-1999 ignition-contact stall defect, and 05V025 is a 1997-2001 shift-interlock rollaway defect. Their scopes and remedies are not merged.' },
      { code: 'unsupported-prelude-narratives-frozen', severity: 'independent-review-required', recordIds: Object.keys(KEEP_REASONS), detail: 'Ten rows supported only by forums, generic complaint pages, videos, retailers or no citations remain byte-for-byte unchanged rather than being archived or replaced.' },
    ],
    summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
