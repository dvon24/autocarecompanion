/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-infiniti-fx50-adjudication-2026-08-06.json');

const IDS = {
  brake: 'infiniti-fx50-brake-rotor-warping-brake-judder',
  evap: 'infiniti-fx50-evap-leak-check-engine-light-from-fuel-vapor-components',
  suspension: 'infiniti-fx50-premature-front-suspension-wear',
  cooling: 'infiniti-fx50-radiator-cooling-fan-related-overheating',
  steeringLock: 'infiniti-fx50-steering-lock-module-failure-no-start',
  sunroof: 'infiniti-fx50-sunroof-drain-leak-causing-bcm-electrical-problems',
};
const SOURCES = { brake: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10195353-0001.pdf' };
const SOURCE_SHA256 = { brake: 'a76ed66b06637a80045cc7c570172419ae0c89806dd564f26c967e448dc0b939' };
const RECALL_QUERIES = Object.fromEntries([2009, 2010, 2011, 2012, 2013].map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=FX50&modelYear=${year}`]));

const KEEP_REASONS = {
  [IDS.evap]: 'The row has no citation, and no exact Infiniti/NHTSA bulletin was found that establishes one 2009-2013 FX50 EVAP leak defect, all four DTCs, the gas-cap/purge/vent/hose cause bundle or its repair costs. The official recall results contain no FX50 campaign, so the row remains byte-for-byte unchanged.',
  [IDS.suspension]: 'The row has no citation, and no exact primary source was found for one 2009-2013 FX50 premature front-suspension-wear defect, the weight/wheel mechanism, component bundle or whole-arm repair rule. The official recall results contain no FX50 campaign, so the row remains byte-for-byte unchanged.',
  [IDS.cooling]: 'The row has no citation, and no exact primary source was found for one FX50 radiator/fan/thermostat overheating defect, the four-DTC bundle or the asserted VK50VE heat mechanism and repair range. The official recall results contain no FX50 campaign, so the row remains byte-for-byte unchanged.',
  [IDS.steeringLock]: 'The row has no citation, and no exact FX50 bulletin or campaign was found for an electronic steering-lock-module no-start defect, bypass option, BCM/IPDM diagnosis or immobilizer relearn. A steering-lock program for another Nissan/Infiniti vehicle cannot be transferred to this title, so the row remains byte-for-byte unchanged.',
  [IDS.sunroof]: 'A forum homepage does not establish one FX50 sunroof-drain defect, drain-routing cause, BCM damage pathway or repair cost. No exact Infiniti/NHTSA bulletin or campaign was found for this model and identity, so the row remains byte-for-byte unchanged.',
};

const BRAKE_CARD = {
  severity: 'medium',
  confidence: 'high',
  description: 'Infiniti service bulletin ITB00-024I applies to all Infiniti vehicles and defines brake judder as vibration felt through the vehicle, steering wheel or brake pedal while braking. The bulletin identifies rotor thickness variation and/or rotor runout as the cause; brake-pedal pulsation and, in severe cases, steering-wheel oscillation can result.',
  solution: 'Verify the condition with the driver and a road test. Infiniti directs technicians to correct brake judder by machining the rotors with an approved on-car brake lathe. If a rotor is replaced, index it to the axle hub for minimum runout, tighten lug nuts evenly with a torque wrench, and burnish serviced brakes as specified in ITB00-024I.',
  symptoms: ['Vehicle vibration while braking', 'Brake-pedal pulsation', 'Steering-wheel oscillation while braking'],
  affectedSystems: ['Brake rotors', 'Brake pads and calipers', 'Wheel hubs and lug fasteners'],
  citations: [{ type: 'tsb', title: 'Infiniti ITB00-024I - Brake Noise/Judder/Pedal Feel Diagnosis and Repair', url: SOURCES.brake }],
  summary: 'Kept the indexed brake-warping/judder identity and 2009-2013 scope, replaced the forum-homepage and FX50 prevalence narrative with Infiniti ITB00-024I, and removed unsupported model-specific frequency, heat, driving-style, cost and commerce claims.',
};

function brakeEvidence() {
  return [{
    kind: 'official-service-bulletin-exact-identity',
    url: SOURCES.brake,
    verifiedOn: '2026-08-06',
    documentSha256: SOURCE_SHA256.brake,
    visuallyInspectedPages: [1, 4, 5, 6],
    observation: 'ITB00-024I applies to all Infiniti vehicles, defines brake judder and its symptoms, attributes it to rotor thickness variation/runout, and specifies on-car rotor machining or indexed replacement plus proper torque and burnishing.',
  }];
}

function recallEvidence(id) {
  return [{
    kind: 'official-recall-set-empty-and-no-exact-bulletin',
    url: RECALL_QUERIES[2009],
    verifiedOn: '2026-08-06',
    observation: `NHTSA returns zero campaigns for every 2009-2013 FX50 model-year query; no exact primary source cleared the gate for ${id}.`,
    supportingUrls: Object.values(RECALL_QUERIES),
  }];
}

function rewriteBrake(current) {
  return fullRecord({
    ...current,
    ...BRAKE_CARD,
    make: 'Infiniti', model: 'FX50', title: current.title, category: current.category,
    trims: [], engines: [], dtcCodes: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0,
    source: 'manual', status: 'published', lastReportedByOwners: '',
    reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: BRAKE_CARD.summary,
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'FX50');
  if (modelRows.length !== 6) throw new Error(`expected 6 Infiniti FX50 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const isBrake = current.id === IDS.brake;
    if (!isBrake && !KEEP_REASONS[current.id]) throw new Error(`missing FX50 decision: ${current.id}`);
    const proposal = isBrake ? rewriteBrake(before) : before;
    return {
      id: current.id, model: current.model,
      action: isBrake ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: isBrake ? 'Infiniti ITB00-024I is an exact same-identity primary source for the indexed brake-warping/judder condition, symptoms and repair direction.' : KEEP_REASONS[current.id],
      identityRule: isBrake ? 'The indexed title, make, model, years, category and publication state remain unchanged; only unsupported body, cost, commerce and citation claims are replaced.' : 'No content or publication-state changes; an absent citation, forum homepage, empty recall set or unrelated vehicle bulletin cannot replace the indexed issue.',
      commerceDecision: isBrake ? 'removed-unverified-search-links' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: isBrake ? brakeEvidence() : recallEvidence(current.id),
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Infiniti', model: 'FX50',
    completionStatement: 'This packet reconciles all six frozen Infiniti FX50 rows. One same-identity brake-judder rewrite clears the primary-source gate; five rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six indexed records remain published with identical titles, years and categories.',
      'Only an exact same-identity primary source may support a rewrite; absent, partial or unrelated evidence produces a byte-for-byte hold.',
      'The brake rewrite removes unverified search-link commerce and does not add part numbers, fitment, costs or DTCs.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: { snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, fx50RecordCount: modelRows.length },
    observations: [
      { code: 'brake-judder-exact-source-rewrite', severity: 'independent-review-required', recordIds: [IDS.brake], detail: 'The visually inspected ITB00-024I supports the existing brake-warping/judder identity without changing its indexed identity or scope.' },
      { code: 'five-identities-frozen', severity: 'high', recordIds: Object.values(IDS).filter((id) => id !== IDS.brake), detail: 'Five rows lack an exact same-identity primary source; their content and publication state remain byte-for-byte unchanged.' },
      { code: 'all-fx50-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'All six indexed FX50 records remain published with the same IDs, titles, models, years and categories.' },
    ],
    primarySources: { brake: SOURCES.brake }, mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: { rewrite_same_identity: 1, keep_published_pending_source: 5, total: 6 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { BRAKE_CARD, IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, SOURCE_SHA256, brakeEvidence, recallEvidence, rewriteBrake };
