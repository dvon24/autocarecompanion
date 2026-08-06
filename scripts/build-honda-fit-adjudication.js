/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-fit-adjudication-2026-08-06.json');

const IDS = {
  acCompressor: 'honda-fit-ac-compressor-failure-2007',
  cvt: 'honda-fit-cvt-transmission-problems-2015',
  doorLatch: 'honda-fit-door-latch-issues-2015',
  eps: 'honda-fit-eps-power-steering-2009',
  fuelPump: 'honda-fit-fuel-pump-failure-2007',
  idleStalling: 'honda-fit-idle-stalling-problems-2009',
  ignitionCoil: 'honda-fit-ignition-coil-failure-2007',
  infotainment: 'honda-fit-infotainment-failure-2015',
  oilConsumption: 'honda-fit-oil-consumption-2007',
  sparkPlug: 'honda-fit-spark-plug-failure-2007',
  starter: 'honda-fit-starter-motor-failure-2007',
};

const SOURCES = {
  cvt: 'https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V574-5647.pdf',
  eps: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10124264-9999.pdf',
  fuelPump: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V858-4774.pdf',
};

const REWRITE_CARDS = {
  [IDS.cvt]: {
    years: [2015],
    category: 'transmission',
    title: 'CVT Input Shaft Pulley Recall - Bulletin 15-065',
    description: 'Honda Service Bulletin 15-065 applies to VIN-eligible 2015 Fit vehicles equipped with a CVT. Certain driving conditions can create higher-than-normal stress on the input shaft pulley; repeated stress can cause the pulley to break, leaving the vehicle unable to move while in gear or allowing the wheels to lock.',
    solution: 'Have a Honda dealer check the VIN for recall eligibility. Bulletin 15-065 directs the dealer to collect an automatic-transmission snapshot and update the transmission software; affected vehicles must receive the recall remedy before sale.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vehicle may be unable to move while in gear if the pulley breaks', 'Front wheels may lock if the pulley breaks'],
    affectedSystems: ['Continuously variable transmission input shaft pulley', 'CVT control software'],
    dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Service Bulletin 15-065 - CVT Input Shaft Pulley Recall', url: SOURCES.cvt }],
    identityTerms: ['cvt', 'transmission'],
    summary: 'Narrowed the broad 2015-2020 CVT aggregation to Honda recall 15V574/Bulletin 15-065 for VIN-eligible 2015 Fit CVTs, and removed unsupported shudder, maintenance, cooler, pricing and warranty claims.',
  },
  [IDS.eps]: {
    years: [2007, 2008],
    category: 'steering',
    title: 'Heavy Steering With EPS DTC 32-09 or 61-04 - Bulletin 14-058',
    description: 'Honda Service Bulletin 14-058 covers VIN-eligible 2007-2008 Fit vehicles whose steering feels heavier than normal or is hard to turn, especially while stopped, with the EPS indicator on and DTC 32-09 or 61-04 stored. Honda identifies a malfunctioning EPS control unit.',
    solution: 'Have a Honda dealer diagnose the stored EPS code and check VIN eligibility. Bulletin 14-058 directs replacement of the EPS control unit when DTC 32-09 and/or 61-04 is stored under the covered condition.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Steering feels heavier than normal', 'Steering is hard to turn, especially while stopped', 'EPS indicator illuminates'],
    affectedSystems: ['Electric power steering control unit'],
    dtcCodes: ['32-09', '61-04'],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 14-058 - Electric Power Steering Warranty Extension', url: SOURCES.eps }],
    identityTerms: ['eps', 'steering'],
    summary: 'Corrected the nonexistent 2012-2013 Bulletin 13-043 citation and broad 2009-2020 failure narrative to Honda Bulletin 14-058 for VIN-eligible 2007-2008 Fit vehicles with heavy steering and DTC 32-09 or 61-04.',
  },
  [IDS.fuelPump]: {
    years: [2018, 2019],
    category: 'fuel-system',
    title: 'In-Tank Fuel Pump Motor Recall - Bulletin 24-023',
    description: 'Honda Service Bulletin 24-023 applies to VIN-eligible 2018-2019 Fit vehicles. A low-density fuel-pump impeller can absorb fuel and deform, interfere with the pump body and make the pump inoperative. The engine may not start or may stall while driving, increasing crash risk.',
    solution: 'Check the VIN at a Honda dealer for recall eligibility. Bulletin 24-023 directs replacement of the in-tank fuel pump motor at no charge under safety recall 23V858.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Difficulty starting', 'Engine hesitation while driving', 'Malfunction indicator lamp may illuminate', 'Engine may stall while driving', 'DTC P0087 may be stored'],
    affectedSystems: ['In-tank fuel pump motor', 'Fuel pump impeller'],
    dtcCodes: ['P0087'],
    citations: [{ type: 'recall', title: 'Honda Service Bulletin 24-023 - 2018-2019 Fit Fuel Pump Motor Recall', url: SOURCES.fuelPump }],
    identityTerms: ['fuel', 'pump'],
    summary: 'Narrowed the unsupported 2007-2020 generic fuel-pump card to Honda recall 23V858/Bulletin 24-023 for VIN-eligible 2018-2019 Fit vehicles and removed unsupported climate, contamination, maintenance, vendor and pricing claims.',
  },
};

const KEEP_REASONS = {
  [IDS.acCompressor]: 'A generic NHTSA model page and repair video do not establish a 2007-2020 Fit compressor defect, near-universal failure rate, mechanism or Honda remedy. The row remains byte-for-byte unchanged.',
  [IDS.doorLatch]: 'One complaint does not establish a 2015-2020 Fit latch and lock-actuator defect, scope, mechanism or remedy. The row remains byte-for-byte unchanged.',
  [IDS.idleStalling]: 'A generic NHTSA model page and generic throttle-body video do not establish a Fit-wide carbon, PCV or stalling defect or the claimed success rate. The row remains unchanged.',
  [IDS.ignitionCoil]: 'A generic model page and repair video do not establish a 2007-2020 Fit ignition-coil defect, replacement interval or Honda remedy. The row remains unchanged.',
  [IDS.infotainment]: 'The row has no citations, and no exact Honda record was verified for its combined touchscreen, radio, Bluetooth and smartphone-integration narrative. The row remains unchanged.',
  [IDS.oilConsumption]: 'The row has no citations and makes an unsupported two-engine, fourteen-year defect and warranty-extension claim. No exact Honda record was verified, so it remains unchanged.',
  [IDS.sparkPlug]: 'A generic model page and repair video do not establish premature original-equipment spark-plug failure across every Fit generation or the claimed replacement interval. The row remains unchanged.',
  [IDS.starter]: 'A generic model page and repair video do not establish premature starter failure across every Fit generation, climate dependence or a Honda remedy. The row remains unchanged.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Honda',
    model: 'Fit',
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

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Fit');
  if (modelRows.length !== 11) throw new Error(`expected 11 Honda Fit rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action,
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The indexed component identity remains on the same ID; official Honda scope, mechanism and remedy replace unsupported generalizations.' : 'No content or publication-state changes; a complaint, generic page, video or unrelated bulletin cannot replace this issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : [],
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
    model: 'Fit',
    completionStatement: 'This packet reconciles all 11 frozen Honda Fit rows. Three same-identity Honda corrections are proposed; eight rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All 11 rows remain published. Eight are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.',
      'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      fitRecordCount: modelRows.length,
    },
    observations: [
      { code: 'cvt-recall-scope-narrowed', severity: 'independent-review-required', recordIds: [IDS.cvt], detail: 'Honda Bulletin 15-065 supports VIN-eligible 2015 Fit CVTs and an input-shaft-pulley recall; it does not support the original 2015-2020 shudder, cooler, maintenance and extended-warranty aggregation.' },
      { code: 'eps-citation-and-scope-corrected', severity: 'independent-review-required', recordIds: [IDS.eps], detail: 'The frozen row cites nonexistent Fit Bulletin 13-043 and 2012-2013 scope. Honda Bulletin 14-058 covers VIN-eligible 2007-2008 Fit vehicles with heavy steering and DTC 32-09 or 61-04.' },
      { code: 'fuel-pump-recall-scope-narrowed', severity: 'independent-review-required', recordIds: [IDS.fuelPump], detail: 'Honda Bulletin 24-023 supports VIN-eligible 2018-2019 Fit vehicles, not the original 2007-2020 generic fuel-pump narrative.' },
      { code: 'uncited-claim-cluster', severity: 'independent-review-required', recordIds: [IDS.infotainment, IDS.oilConsumption], detail: 'These frozen cards contain broad defect, warranty and remedy claims without citations; both remain byte-equivalent pending exact evidence.' },
      { code: 'generic-source-cluster', severity: 'independent-review-required', recordIds: [IDS.acCompressor, IDS.doorLatch, IDS.idleStalling, IDS.ignitionCoil, IDS.sparkPlug, IDS.starter], detail: 'Generic NHTSA model pages, single complaints and videos do not establish the exact model-wide defect, mechanism, scope and remedy claims.' },
    ],
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
