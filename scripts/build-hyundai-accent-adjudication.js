/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-accent-adjudication-2026-08-06.json');
const IDS = {
  absFire: 'hyundai-accent-abs-hecu-brake-fluid-leak-causing-engine-compartment-fire',
  acCompressor: 'hyundai-accent-ac-compressor',
  stopLamp: 'hyundai-accent-brake-light-stop-lamp-switch-failure',
  crankSensor: 'hyundai-accent-crankshaft-sensor',
  cvt: 'hyundai-accent-cvt-failure',
  rearSuspension: 'hyundai-accent-rear-suspension-noise',
  pretensioner: 'hyundai-accent-seat-belt-pretensioner-may-explode-send-shrapnel',
};
const SOURCES = {
  absApi: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V651000',
  absReport: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V651-6950.PDF',
  stopLamp2009: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=09V122000',
  stopLamp2013: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=13V113000',
  stopLamp2015: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=15V566000',
  pretensionerApi: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V354000',
  pretensionerReport: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V354-9759.PDF',
};

const REWRITE_CARDS = {
  [IDS.absFire]: {
    years: [2012, 2013, 2014, 2015], category: 'brakes', severity: 'high', confidence: 'high',
    title: 'ABS Module Internal Brake-Fluid Leak Can Cause Fire - Recall 23V651',
    description: 'NHTSA recall 23V651 covers certain 2012-2015 Hyundai Accent vehicles. The anti-lock brake system module can leak brake fluid internally and cause an electrical short, which can start an engine-compartment fire while the vehicle is parked or being driven.',
    solution: 'Check the VIN for recall 23V651. Until the recall repair is complete, Hyundai advises owners to park outside and away from structures. Dealers replace the ABS fuse free of charge.',
    symptoms: ['Open recall 23V651 for the VIN', 'Potential smoke or fire from the engine compartment while parked or driving'],
    affectedSystems: ['Anti-lock brake system module', 'ABS electrical fuse'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Campaign 23V651 - 2012-2015 Accent ABS Module Fire Risk', url: SOURCES.absApi },
      { type: 'recall', title: 'Hyundai Part 573 Report 23V651 - ABS Module Internal Leak', url: SOURCES.absReport },
    ],
    identityTerms: ['ABS module', 'fire'],
    summary: 'Replaced secondary sources and unsupported O-ring, warning-light, population and HECU-replacement details with recall 23V651\'s exact 2012-2015 Accent scope, internal-leak fire risk, park-outside instruction and ABS-fuse remedy.',
  },
  [IDS.stopLamp]: {
    years: [2006, 2007, 2008, 2009, 2010, 2011], category: 'electrical', severity: 'high', confidence: 'high',
    title: 'Stop-Lamp Switch Can Malfunction - Recalls 09V122, 13V113, and 15V566',
    description: 'Three overlapping NHTSA campaigns cover Accent stop-lamp switch failures: 09V122 covers certain 2006-2007 vehicles, 13V113 covers certain 2006-2009 vehicles, and 15V566 covers certain 2009-2011 vehicles. A malfunctioning switch can prevent the brake lights from illuminating, prevent cruise control from disengaging when the brake is pressed, interfere with the brake-transmission shift interlock, or illuminate the ESC malfunction indicator.',
    solution: 'Have a Hyundai dealer check the VIN for all three campaigns and verify completion. Each campaign directs dealers to replace the affected stop-lamp or brake-light switch free of charge.',
    symptoms: ['Brake lights may not illuminate when the brake pedal is pressed', 'Cruise control may not disengage when the brake pedal is pressed', 'Shifter may not move out of Park', 'ESC malfunction indicator may illuminate'],
    affectedSystems: ['Stop-lamp switch', 'Brake lights', 'Cruise control disengagement', 'Brake-transmission shift interlock'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Campaign 09V122 - 2006-2007 Accent Stop-Lamp Switch', url: SOURCES.stopLamp2009 },
      { type: 'recall', title: 'NHTSA Campaign 13V113 - 2006-2009 Accent Stop-Lamp Switch', url: SOURCES.stopLamp2013 },
      { type: 'recall', title: 'NHTSA Campaign 15V566 - 2009-2011 Accent Brake-Light Switch', url: SOURCES.stopLamp2015 },
    ],
    identityTerms: ['stop-lamp switch', 'brake lights'],
    summary: 'Preserved the indexed stop-lamp-switch identity while replacing secondary recall pages with exact NHTSA campaigns and their overlapping 2006-2011 Accent scopes, effects and free switch-replacement remedies.',
  },
  [IDS.pretensioner]: {
    years: [2020, 2021, 2022], category: 'safety', severity: 'high', confidence: 'high',
    title: 'Front Seat-Belt Pretensioner Can Explode During Deployment - Recall 22V354',
    description: 'NHTSA recall 22V354 covers certain 2020-2022 Hyundai Accent vehicles. In a crash, a front driver-side or passenger-side seat-belt pretensioner can explode when it deploys, projecting metal fragments into the passenger compartment and risking occupant injury. Hyundai\'s amended filing removed 2019 Accent vehicles after reviewing pretensioner manufacturing records.',
    solution: 'Have a Hyundai dealer check the VIN for recall 22V354, campaign 229, including vehicles repaired under the earlier superseded campaigns. Dealers secure the affected seat-belt pretensioners with a protective cap free of charge.',
    symptoms: ['Open recall 22V354 for the VIN', 'No advance warning required before abnormal pretensioner deployment', 'Potential metal fragments during a crash deployment'],
    affectedSystems: ['Front driver-side seat-belt pretensioner', 'Front passenger-side seat-belt pretensioner'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Campaign 22V354 - 2020-2022 Accent Seat-Belt Pretensioners', url: SOURCES.pretensionerApi },
      { type: 'recall', title: 'Hyundai Amended Part 573 Report 22V354 - Pretensioner Population and Remedy', url: SOURCES.pretensionerReport },
    ],
    identityTerms: ['seat-belt pretensioner', 'explode'],
    summary: 'Replaced secondary sources with the amended 22V354 record, corrected the Accent scope from stale 2019-2022 wording to 2020-2022, and retained only the documented abnormal-deployment risk and protective-cap remedy.',
  },
};
const KEEP_REASONS = {
  [IDS.acCompressor]: 'A forum home page does not establish one 2012-2020 Accent compressor-clutch, bearing and reed-valve defect, mileage range, cascading component replacement or preferred aftermarket brand. The row remains byte-for-byte unchanged.',
  [IDS.crankSensor]: 'A forum home page and generic NHTSA complaint landing page do not establish one 2012-2022 Accent crankshaft-sensor defect, heat mechanism, mileage range, part number or repair cost. The row remains byte-for-byte unchanged.',
  [IDS.cvt]: 'A forum home page and a generic 2018 complaint landing page do not establish an IVT/CVT chain-and-pulley defect across the frozen 2017-2022 scope, and they do not support the 30,000-mile service interval or replacement costs. The row remains byte-for-byte unchanged.',
  [IDS.rearSuspension]: 'A forum home page does not establish one 2006-2017 Accent torsion-beam-bushing defect, part number, failure effects or replacement cost. The row remains byte-for-byte unchanged.',
};

function rewriteProposal(current, card) {
  return fullRecord({
    ...current, ...card, make: 'Hyundai', model: 'Accent', trims: [], engines: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual',
    status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: card.summary, relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Accent');
  if (modelRows.length !== 7) throw new Error(`expected 7 Hyundai Accent rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id, model: current.model, action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The indexed issue identity stays on the same ID; only exact NHTSA scope, mechanism, symptoms and remedy replace unsupported claims.' : 'No content or publication-state changes; generic complaints, forums or unsupported overlap cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit', changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: 'government-recall-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, consequence and remedy.` })) : [],
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = { rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length, keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length, total: rows.length };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Hyundai', model: 'Accent',
    completionStatement: 'This packet reconciles all seven frozen Hyundai Accent rows. Three same-identity NHTSA recall corrections are proposed; four rows remain byte-for-byte unchanged pending exact primary evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All seven rows remain published. Four are byte-for-byte unchanged.',
      'An unrelated campaign, component, generation or model may never replace the issue named by an existing indexed page.',
      'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, accentRecordCount: modelRows.length },
    observations: [
      { code: 'pretensioner-amended-scope', severity: 'independent-review-required', recordIds: [IDS.pretensioner], detail: 'The live NHTSA campaign and amended Part 573 filing cover 2020-2022 Accent. A later chronology states that 2019 vehicles were removed after manufacturing-record review.' },
      { code: 'stop-lamp-overlapping-campaigns-preserved', severity: 'independent-review-required', recordIds: [IDS.stopLamp], detail: '09V122, 13V113 and 15V566 overlap but collectively cover the frozen 2006-2011 stop-lamp-switch identity. They remain one existing indexed page without consolidation or redirect work.' },
      { code: 'abs-remedy-narrowed-to-official-record', severity: 'independent-review-required', recordIds: [IDS.absFire], detail: 'The proposal uses the official ABS-fuse remedy and removes unsupported assertions that a leaking HECU will also be replaced.' },
      { code: 'unsupported-accent-narratives-frozen', severity: 'independent-review-required', recordIds: Object.keys(KEEP_REASONS), detail: 'Four forum/generic-complaint narratives remain byte-for-byte unchanged rather than being archived or replaced.' },
    ],
    summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}
if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
