/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./infiniti-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-infiniti-fx35-adjudication-2026-08-06.json',
);

const IDS = {
  brake: 'infiniti-fx35-brake-rotor-warping-front-brake-vibration',
  sensors: 'infiniti-fx35-camshaft-crankshaft-position-sensor-failure',
  suspension: 'infiniti-fx35-front-suspension-clunk-worn-control-arm-bushings',
  fuelGauge: 'infiniti-fx35-fuel-gauge-sending-unit-failure',
  radiator: 'infiniti-fx35-radiator-crack-and-coolant-transmission-cross-contamination',
  timing: 'infiniti-fx35-timing-chain-guide-whine-from-front-cover',
};
const SOURCES = {
  brake: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10195353-0001.pdf',
};
const SOURCE_SHA256 = {
  brake: 'a76ed66b06637a80045cc7c570172419ae0c89806dd564f26c967e448dc0b939',
};
const RECALL_QUERIES = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => 2003 + index).map((year) => [
    year,
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=FX35&modelYear=${year}`,
  ]),
);

const KEEP_REASONS = {
  [IDS.sensors]:
    'The generic NHTSA complaint page does not establish one 2003-2012 FX35 camshaft/crankshaft sensor defect across both vehicle generations, the claimed heat mechanism, all four DTCs or a bundled replacement strategy. No campaign in the official model-year recall set matches this identity, so the row remains byte-for-byte unchanged.',
  [IDS.suspension]:
    'The generic complaint page does not establish one 2003-2012 FX35 control-arm, compression-rod and sway-link defect across both generations, nor the asserted rough-road mechanism and repair scope. No official campaign matches the indexed identity, so the row remains byte-for-byte unchanged.',
  [IDS.fuelGauge]:
    'The generic complaint page does not establish one 2003-2012 FX35 fuel-sender defect, contamination mechanism, sender-versus-pump-module repair boundary or all three DTCs. Fuel-system campaigns in the official recall set concern unrelated defects, so the row remains byte-for-byte unchanged.',
  [IDS.radiator]:
    'The generic complaint page does not establish an FX35 radiator-to-transmission-cooler cross-contamination defect, the asserted first-generation scope or a transmission-damage repair pathway. No campaign in the official model-year recall set matches this identity, so the row remains byte-for-byte unchanged.',
  [IDS.timing]:
    'The row has no citation, and no exact Infiniti/NHTSA bulletin was found that supports a 2003-2007 FX35 timing-guide wear defect, supercharger-like whine, full timing-set replacement or the asserted cost range. No unrelated model bulletin may be transferred to this indexed identity, so the row remains byte-for-byte unchanged.',
};

const BRAKE_CARD = {
  severity: 'medium',
  confidence: 'high',
  description:
    'Infiniti service bulletin ITB00-024I applies to all Infiniti vehicles and defines brake judder as vibration felt through the vehicle, steering wheel or brake pedal while braking. The bulletin identifies rotor thickness variation and/or rotor runout as the cause; brake-pedal pulsation and, in severe cases, steering-wheel oscillation can result.',
  solution:
    'Verify the condition with the driver and a road test. Infiniti directs technicians to correct brake judder by machining the rotors with an approved on-car brake lathe. If a rotor is replaced, index it to the axle hub for minimum runout, tighten lug nuts evenly with a torque wrench, and burnish serviced brakes as specified in ITB00-024I.',
  symptoms: [
    'Vehicle vibration while braking',
    'Brake-pedal pulsation',
    'Steering-wheel oscillation while braking',
  ],
  affectedSystems: ['Brake rotors', 'Brake pads and calipers', 'Wheel hubs and lug fasteners'],
  citations: [
    {
      type: 'tsb',
      title: 'Infiniti ITB00-024I - Brake Noise/Judder/Pedal Feel Diagnosis and Repair',
      url: SOURCES.brake,
    },
  ],
  summary:
    'Kept the indexed brake-judder identity and 2003-2012 scope, replaced the complaint-page and prevalence narrative with Infiniti ITB00-024I, and removed unsupported FX35-specific frequency, heat, driving-style, cost and commerce claims.',
};

function recallEvidence(id) {
  const observations = {
    [IDS.sensors]:
      'The 2003-2012 FX35 recall inventory contains air-bag, lighting, fuel-system, brake-caliper, transmission and steering-column campaigns, but no camshaft or crankshaft position-sensor campaign.',
    [IDS.suspension]:
      'The 2003-2012 FX35 recall inventory contains no control-arm-bushing, compression-rod-bushing or sway-link campaign.',
    [IDS.fuelGauge]:
      'Fuel-system campaigns in the FX35 recall inventory do not concern inaccurate fuel-level readings, sender resistance or DTC P0461/P0462/P0463.',
    [IDS.radiator]:
      'The 2003-2012 FX35 recall inventory contains no radiator internal-cooler breach or coolant/ATF cross-contamination campaign.',
    [IDS.timing]:
      'The 2003-2012 FX35 recall inventory contains no VQ35DE timing-chain-guide, front-cover-whine or timing-set campaign.',
  };
  return [
    {
      kind: 'official-recall-set-unrelated',
      url: RECALL_QUERIES[2003],
      verifiedOn: '2026-08-06',
      observation: observations[id],
      supportingUrls: Object.values(RECALL_QUERIES),
    },
  ];
}

function brakeEvidence() {
  return [
    {
      kind: 'official-service-bulletin-exact-identity',
      url: SOURCES.brake,
      verifiedOn: '2026-08-06',
      documentSha256: SOURCE_SHA256.brake,
      visuallyInspectedPages: [1, 4, 5, 6],
      observation:
        'ITB00-024I applies to all Infiniti vehicles, defines brake judder and its symptoms, attributes it to rotor thickness variation/runout, and specifies on-car rotor machining or indexed replacement plus proper torque and burnishing.',
    },
  ];
}

function rewriteBrake(current) {
  return fullRecord({
    ...current,
    ...BRAKE_CARD,
    make: 'Infiniti',
    model: 'FX35',
    title: current.title,
    category: current.category,
    trims: [],
    engines: [],
    dtcCodes: [],
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
    contentUpdateSummary: BRAKE_CARD.summary,
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Infiniti' && row.model === 'FX35',
  );
  if (modelRows.length !== 6) {
    throw new Error(`expected 6 Infiniti FX35 rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const isBrake = current.id === IDS.brake;
    if (!isBrake && !KEEP_REASONS[current.id]) {
      throw new Error(`missing FX35 decision: ${current.id}`);
    }
    const proposal = isBrake ? rewriteBrake(before) : before;
    return {
      id: current.id,
      model: current.model,
      action: isBrake ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: isBrake
        ? 'Infiniti ITB00-024I is an exact same-identity primary source for brake judder, rotor thickness variation/runout, the stated symptoms and repair direction.'
        : KEEP_REASONS[current.id],
      identityRule: isBrake
        ? 'The indexed title, make, model, years, category and publication state remain unchanged; only unsupported body, cost, commerce and citation claims are replaced.'
        : 'No content or publication-state changes; generic complaint pages, absent citations and unrelated campaigns cannot replace an indexed issue.',
      commerceDecision: isBrake ? 'removed-unverified-search-links' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: isBrake ? brakeEvidence() : recallEvidence(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Infiniti',
    model: 'FX35',
    completionStatement:
      'This packet reconciles all six frozen Infiniti FX35 rows. One same-identity brake-judder rewrite clears the primary-source gate; five rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six indexed records remain published with identical titles and categories.',
      'Only an exact same-identity primary source may support a rewrite; partial or unrelated evidence produces a byte-for-byte hold.',
      'The brake rewrite removes unverified search-link commerce and does not add part numbers, fitment, costs or DTCs.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      fx35RecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'brake-judder-exact-source-rewrite',
        severity: 'independent-review-required',
        recordIds: [IDS.brake],
        detail:
          'The visually inspected ITB00-024I supports the existing brake-judder identity, symptoms, mechanism and repair direction without changing title, category, years or status.',
      },
      {
        code: 'five-identities-frozen',
        severity: 'high',
        recordIds: Object.values(IDS).filter((id) => id !== IDS.brake),
        detail:
          'Five rows lack an exact same-identity primary source; their content and publication state remain byte-for-byte unchanged.',
      },
      {
        code: 'all-fx35-pages-preserved',
        severity: 'seo-safety',
        recordIds: Object.values(IDS),
        detail:
          'All six indexed FX35 records remain published with the same IDs, titles, models, years and categories.',
      },
    ],
    primarySources: { brake: SOURCES.brake },
    mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: {
      rewrite_same_identity: 1,
      keep_published_pending_source: 5,
      total: 6,
    },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(
    JSON.stringify(
      { output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary },
      null,
      2,
    ),
  );
}

if (require.main === module) main();
module.exports = {
  BRAKE_CARD,
  IDS,
  KEEP_REASONS,
  RECALL_QUERIES,
  SOURCES,
  SOURCE_SHA256,
  brakeEvidence,
  recallEvidence,
  rewriteBrake,
};
