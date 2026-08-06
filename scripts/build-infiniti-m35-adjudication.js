/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-infiniti-m35-adjudication-2026-08-06.json');

const IDS = {
  fuelGauge: 'infiniti-m35-fuel-gauge-sending-unit-failure',
  radiator: 'infiniti-m35-radiator-cracking-and-coolant-leaks',
  brake: 'infiniti-m35-brake-rotor-warping-and-front-brake-vibration',
  sensors: 'infiniti-m35-camshaft-and-crankshaft-position-sensor-failure',
  dashboard: 'infiniti-m35-dashboard-melting-and-cracking',
  controlArm: 'infiniti-m35-front-lower-control-arm-and-bushing-wear',
};
const SOURCES = { brake: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10195353-0001.pdf' };
const SOURCE_SHA256 = { brake: 'a76ed66b06637a80045cc7c570172419ae0c89806dd564f26c967e448dc0b939' };
const RECALL_QUERIES = Object.fromEntries([2006, 2007, 2008, 2009, 2010].map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=M35&modelYear=${year}`]));
const EXPECTED_CAMPAIGNS = {
  2006: ['13V430000', '15V226000', '16V349000', '17V028000', '20V008000', '22E066000'],
  2007: ['13V430000', '16V349000', '17V028000', '20V008000', '22E066000'],
  2008: ['09V393000', '13V430000', '16V349000', '17V028000', '20V008000', '22E066000'],
  2009: ['09V393000', '13V430000', '16V349000', '17V028000', '20V008000', '22E066000'],
  2010: ['09V393000', '13V430000', '16V349000', '17V028000', '20V008000', '22E066000'],
};

const KEEP_REASONS = {
  [IDS.fuelGauge]: 'The generic NHTSA vehicle page does not establish an M35 sending-unit failure, the four-DTC bundle, internal resistance mechanism or replacement procedure. No exact Infiniti/NHTSA bulletin or campaign was found for this indexed identity, so the row remains byte-for-byte unchanged.',
  [IDS.radiator]: 'The generic NHTSA vehicle page does not establish one 2006-2010 M35 radiator-cracking/coolant-leak defect, its asserted plastic-tank mechanism or replacement rule. The official recall inventory contains no matching cooling-system campaign, so the row remains byte-for-byte unchanged.',
  [IDS.sensors]: 'The generic NHTSA vehicle page does not establish a 2006-2010 M35 camshaft-and-crankshaft-position-sensor failure, the combined DTC set or sensor-replacement procedure. No exact M35 bulletin or campaign cleared the identity gate, so the row remains byte-for-byte unchanged.',
  [IDS.dashboard]: 'The generic NHTSA vehicle page does not establish dashboard melting and cracking across 2006-2010 M35 vehicles. Official M35 instrument-panel references found during review concern damage during Takata airbag repair rather than the indexed defect, so the row remains byte-for-byte unchanged.',
  [IDS.controlArm]: 'The generic NHTSA vehicle page does not establish one 2006-2010 M35 front lower-control-arm/bushing wear defect, its mechanism, symptoms or whole-arm repair rule. No exact Infiniti/NHTSA bulletin or campaign was found, so the row remains byte-for-byte unchanged.',
};

const BRAKE_CARD = {
  severity: 'medium',
  confidence: 'high',
  description: 'Infiniti service bulletin ITB00-024I applies to all Infiniti vehicles and defines brake judder as vibration felt through the vehicle, steering wheel or brake pedal while braking. The bulletin identifies rotor thickness variation and/or rotor runout as the cause; brake-pedal pulsation and, in severe cases, steering-wheel oscillation can result.',
  solution: 'Verify the condition with the driver and a road test. Infiniti directs technicians to correct brake judder by machining the rotors with an approved on-car brake lathe. If a rotor is replaced, index it to the axle hub for minimum runout, tighten lug nuts evenly with a torque wrench, and burnish serviced brakes as specified in ITB00-024I.',
  symptoms: ['Vehicle vibration while braking', 'Brake-pedal pulsation', 'Steering-wheel oscillation while braking'],
  affectedSystems: ['Brake rotors', 'Brake pads and calipers', 'Wheel hubs and lug fasteners'],
  citations: [{ type: 'tsb', title: 'Infiniti ITB00-024I - Brake Noise/Judder/Pedal Feel Diagnosis and Repair', url: SOURCES.brake }],
  summary: 'Kept the indexed brake-rotor-warping/front-vibration identity and 2006-2010 scope, replaced generic and unsupported claims with Infiniti ITB00-024I, and removed unsupported frequency, cost, DTC and commerce claims.',
};

function brakeEvidence() {
  return [{ kind: 'official-service-bulletin-exact-identity', url: SOURCES.brake, verifiedOn: '2026-08-06', documentSha256: SOURCE_SHA256.brake, visuallyInspectedPages: [1, 4, 5, 6], observation: 'ITB00-024I applies to all Infiniti vehicles, defines brake judder and its symptoms, attributes it to rotor thickness variation/runout, and specifies on-car rotor machining or indexed replacement plus proper torque and burnishing.' }];
}

function recallEvidence(id) {
  return [{ kind: 'official-recall-set-unrelated-and-no-exact-bulletin', url: RECALL_QUERIES[2006], verifiedOn: '2026-08-06', observation: `The complete 2006-2010 M35 recall inventory covers airbags, accelerator-pedal sensing and TPMS hardware, not the existing catalog identity ${id}; no exact same-identity bulletin cleared the gate.`, supportingUrls: Object.values(RECALL_QUERIES) }];
}

function rewriteBrake(current) {
  return fullRecord({
    ...current, ...BRAKE_CARD,
    make: 'Infiniti', model: 'M35', title: current.title, category: current.category,
    trims: [], engines: [], dtcCodes: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0,
    source: 'manual', status: 'published', lastReportedByOwners: '',
    reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: BRAKE_CARD.summary,
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'M35');
  if (modelRows.length !== 6) throw new Error(`expected 6 Infiniti M35 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const isBrake = current.id === IDS.brake;
    if (!isBrake && !KEEP_REASONS[current.id]) throw new Error(`missing M35 decision: ${current.id}`);
    const proposal = isBrake ? rewriteBrake(before) : before;
    return {
      id: current.id, model: current.model,
      action: isBrake ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: isBrake ? 'Infiniti ITB00-024I is an exact same-identity primary source for the indexed brake-rotor-warping/front-vibration condition, symptoms and repair direction.' : KEEP_REASONS[current.id],
      identityRule: isBrake ? 'The indexed ID, title, make, model, years, category and publication state remain unchanged; only unsupported body, cost, commerce and citation claims are replaced.' : 'No content or publication-state changes; a generic vehicle page, absent source, partial reference or unrelated campaign cannot replace the indexed issue.',
      commerceDecision: isBrake ? 'removed-unverified-search-links' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal), evidence: isBrake ? brakeEvidence() : recallEvidence(current.id),
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Infiniti', model: 'M35',
    completionStatement: 'This packet reconciles all six frozen Infiniti M35 rows. One exact same-identity brake rewrite clears the primary-source gate; five rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All six indexed records remain published with identical IDs, titles, years and categories.',
      'Only an exact same-identity primary source may support a rewrite; absent, partial or unrelated evidence produces a byte-for-byte hold.',
      'The brake rewrite removes unverified commerce and does not add part numbers, fitment, costs or DTCs.',
      'Distinct recall identities are deferred until the post-audit new-known-issues phase.',
      'Independent row-by-row approval is required before any separate correction or addition path may be created.',
    ],
    source: { snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, m35RecordCount: modelRows.length },
    observations: [
      { code: 'brake-judder-exact-source-rewrite', severity: 'independent-review-required', recordIds: [IDS.brake], detail: 'The visually inspected ITB00-024I supports the existing brake-warping/front-vibration identity without changing indexed identity or scope.' },
      { code: 'five-m35-identities-frozen', severity: 'high', recordIds: Object.values(IDS).filter((id) => id !== IDS.brake), detail: 'Five rows lack an exact same-identity primary source; their content and publication state remain byte-for-byte unchanged.' },
      { code: 'deferred-new-m35-recall-candidates', severity: 'post-audit-proposal-only', recordIds: [], campaignNumbers: ['09V393000', '13V430000', '20V008000'], detail: 'M35 TPMS-sensor nut corrosion, accelerator-pedal sensor deterioration and passenger-airbag-inflator campaigns are distinct missing-issue candidates. They are logged only and are not added or substituted during the current make audit.' },
      { code: 'all-m35-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'All six indexed M35 records remain published with the same IDs, titles, model, years and categories.' },
    ],
    primarySources: { brake: SOURCES.brake }, mismatchSources: { recallQueries: RECALL_QUERIES, expectedCampaigns: EXPECTED_CAMPAIGNS },
    summary: { rewrite_same_identity: 1, keep_published_pending_source: 5, deferred_new_issue_candidates: 3, total: 6 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { BRAKE_CARD, EXPECTED_CAMPAIGNS, IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, SOURCE_SHA256, brakeEvidence, recallEvidence, rewriteBrake };
