/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-infiniti-fx45-adjudication-2026-08-06.json',
);

const IDS = {
  brake: 'infiniti-fx45-brake-rotor-warping-and-premature-front-brake-wear',
  sensors: 'infiniti-fx45-camshaft-and-crankshaft-position-sensor-failure',
  suspension: 'infiniti-fx45-front-suspension-control-arm-and-bushing-wear',
  fuelGauge: 'infiniti-fx45-fuel-level-sending-unit-failure',
  radiator: 'infiniti-fx45-radiator-failure-causing-overheating',
  timing: 'infiniti-fx45-timing-chain-guide-wear-and-chain-noise',
};
const SOURCES = {
  brake: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10195353-0001.pdf',
};
const SOURCE_SHA256 = {
  brake: 'a76ed66b06637a80045cc7c570172419ae0c89806dd564f26c967e448dc0b939',
};
const RECALL_QUERIES = Object.fromEntries(
  Array.from({ length: 6 }, (_, index) => 2003 + index).map((year) => [
    year,
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=FX45&modelYear=${year}`,
  ]),
);

const KEEP_REASONS = {
  [IDS.brake]:
    'Infiniti ITB00-024I supports brake judder from rotor thickness variation/runout and its repair, but the indexed title also asserts premature FX45 front-brake wear. The bulletin does not establish that second identity, FX45 frequency, heavy-V8 causation or accelerated wear, so a partial rewrite would leave the broader title unsupported and the row remains byte-for-byte unchanged.',
  [IDS.sensors]:
    'The generic complaint page does not establish one 2003-2008 FX45 camshaft/crankshaft sensor defect, heat mechanism, all three DTCs or a bundled replacement strategy. No campaign in the official model-year recall set matches this identity, so the row remains byte-for-byte unchanged.',
  [IDS.suspension]:
    'The generic complaint page does not establish one FX45 upper/lower control-arm, bushing and ball-joint defect, weight and wheel-package mechanism, or whole-arm repair rule. No official campaign matches this identity, so the row remains byte-for-byte unchanged.',
  [IDS.fuelGauge]:
    'The generic complaint page does not establish one FX45 fuel-sender wear/contamination defect or sender-versus-pump-module repair boundary. Fuel-system campaigns in the official recall set concern unrelated defects, so the row remains byte-for-byte unchanged.',
  [IDS.radiator]:
    'The generic complaint page does not establish one 2003-2008 FX45 radiator end-tank defect, a common heat-cycle mechanism or the asserted consequential VK45DE damage and bundled repair. No official campaign matches this identity, so the row remains byte-for-byte unchanged.',
  [IDS.timing]:
    'The generic complaint page does not establish one 2003-2008 FX45 timing-guide/tensioner defect, oil-sludge mechanism, DTC set or timing-set repair. No exact Infiniti/NHTSA bulletin or campaign supports the indexed identity, so the row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  if (id === IDS.brake) {
    return [
      {
        kind: 'official-record-partial-title-identity',
        url: SOURCES.brake,
        verifiedOn: '2026-08-06',
        documentSha256: SOURCE_SHA256.brake,
        visuallyInspectedPages: [1, 4, 5, 6],
        observation:
          'ITB00-024I applies to all Infiniti vehicles and supports brake judder, rotor thickness variation/runout and repair. It does not establish premature FX45 front-brake wear, model-specific prevalence, heavy-V8 causation or accelerated pad/rotor wear, so it cannot support the full indexed title.',
      },
    ];
  }
  const observations = {
    [IDS.sensors]:
      'The official 2003-2008 FX45 recall inventory contains no camshaft or crankshaft position-sensor campaign.',
    [IDS.suspension]:
      'The official 2003-2008 FX45 recall inventory contains no control-arm, bushing or ball-joint campaign.',
    [IDS.fuelGauge]:
      'Fuel-system campaigns in the FX45 recall inventory do not concern inaccurate fuel-level readings or a sending-unit failure.',
    [IDS.radiator]:
      'The official 2003-2008 FX45 recall inventory contains no radiator end-tank, seam-leak or overheating campaign.',
    [IDS.timing]:
      'The official 2003-2008 FX45 recall inventory contains no VK45DE timing-chain-guide, tensioner or chain-noise campaign.',
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

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Infiniti' && row.model === 'FX45',
  );
  if (modelRows.length !== 6) {
    throw new Error(`expected 6 Infiniti FX45 rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id]) throw new Error(`missing FX45 decision: ${current.id}`);
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule:
        'No content or publication-state changes; a partial-title source, generic complaint page or unrelated campaign cannot replace the indexed issue.',
      commerceDecision: 'unchanged-pending-audit',
      changedFields: [],
      evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    };
  });

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Infiniti',
    model: 'FX45',
    completionStatement:
      'This packet reconciles all six frozen Infiniti FX45 rows. No exact full-title primary-source rewrite cleared the gate; all six remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six FX45 rows remain published and byte-for-byte unchanged.',
      'A source that supports only one half of a compound indexed title cannot authorize a rewrite under that broader title.',
      'Existing commerce remains frozen rather than being silently rewritten without exact identity and fitment evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      fx45RecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'brake-source-only-partial-title-match',
        severity: 'high',
        recordIds: [IDS.brake],
        detail:
          'The visually inspected brake bulletin supports judder/runout but not the indexed premature-wear identity; the row is held unchanged.',
      },
      {
        code: 'five-other-identities-lack-exact-primary-source',
        severity: 'independent-review-required',
        recordIds: Object.values(IDS).filter((id) => id !== IDS.brake),
        detail:
          'The remaining five rows rely on generic complaint pages and lack an exact model/identity primary source.',
      },
      {
        code: 'six-fx45-pages-preserved',
        severity: 'seo-safety',
        recordIds: Object.values(IDS),
        detail:
          'All six indexed FX45 records remain published with identical IDs, titles, categories, content, citations and commerce.',
      },
    ],
    reviewSources: { brakePartial: SOURCES.brake },
    mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: {
      rewrite_same_identity: 0,
      keep_published_pending_source: 6,
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
  IDS,
  KEEP_REASONS,
  RECALL_QUERIES,
  SOURCES,
  SOURCE_SHA256,
  evidenceFor,
};
