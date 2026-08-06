/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-hyundai-veloster-adjudication-2026-08-06.json',
);

const IDS = {
  battery: 'hyundai-veloster-battery-drain-and-no-start-2019',
  dct: 'hyundai-veloster-dct-failure',
  mdps: 'hyundai-veloster-electric-power-steering-assist-2019',
  adas: 'hyundai-veloster-forward-collision-avoidance-driver-2019',
  knock: 'hyundai-veloster-knock-sensor-engine-2019',
  thirdDoor: 'hyundai-veloster-rear-door-hinge',
  ivt: 'hyundai-veloster-smartstream-ivtcvt-hesitation-judder-2019',
  sunroof: 'hyundai-veloster-sunroof-shatter',
  wastegate: 'hyundai-veloster-turbo-wastegate-rattle',
};

const SOURCES = {
  sunroof12V568: 'https://static.nhtsa.gov/odi/rcl/2012/RCAK-12V568-4104.PDF',
  sunroof13V051: 'https://static.nhtsa.gov/odi/rcl/2013/RCAK-13V051-6060.pdf',
};

const REVIEW_SOURCES = {
  dctSevenSpeed: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10154675-9999.pdf',
  ivtFalseCitation: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10191531-0001.pdf',
  velosterSixSpeed: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10161750-9999.pdf',
  knockPartial: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10213718-0001.pdf',
  mdpsRepairOnly: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10160106-9999.pdf',
};

const HOLD_EVIDENCE = {
  [IDS.dct]: [
    {
      kind: 'official-record-title-and-scope-mismatch',
      url: REVIEW_SOURCES.dctSevenSpeed,
      verifiedOn: '2026-08-06',
      observation:
        'Hyundai TSB 19-AT-002H covers abnormal low-speed vibration in certain 2016-2017 Veloster 1.6-liter Turbo vehicles equipped with a 7-speed DCT. It cannot support an indexed title that says 6-speed DCT or the row\'s 2012-2015 scope, blanket premature-failure claim, warranty promise or costs.',
    },
  ],
  [IDS.ivt]: [
    {
      kind: 'official-record-citation-mismatch',
      url: REVIEW_SOURCES.ivtFalseCitation,
      verifiedOn: '2026-08-06',
      observation:
        'The row\'s claimed Hyundai IVT diagnostic citation is actually Kia TSB ELE234 for 2019-and-later Niro EV motor rumble noise; it does not mention Hyundai, Veloster or an IVT.',
    },
    {
      kind: 'official-record-powertrain-mismatch',
      url: REVIEW_SOURCES.velosterSixSpeed,
      verifiedOn: '2026-08-06',
      observation:
        'Hyundai TSB 19-AT-010H explicitly lists the 2019-and-later Veloster JS 2.0-liter application under its 6-speed automatic-transmission procedure, contradicting the indexed IVT/CVT identity.',
    },
  ],
  [IDS.knock]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.knockPartial,
      verifiedOn: '2026-08-06',
      observation:
        'Campaign 974 covers 2019-2021 Veloster 2.0-liter CNDS knock-sensor-logic software, a blinking MIL and P1327 when abnormal engine noise is detected. It does not establish the title\'s reduced-power outcome or a knock-sensor hardware fault.',
    },
  ],
  [IDS.mdps]: [
    {
      kind: 'official-record-repair-information-only',
      url: REVIEW_SOURCES.mdpsRepairOnly,
      verifiedOn: '2026-08-06',
      observation:
        'Hyundai TSB 19-ST-001H is general column-mounted MDPS component-replacement information for many models, including Veloster FS/JS. It does not establish a 2019-2021 Veloster assist-loss defect or the row\'s prevalence and outcome claims.',
    },
  ],
};

const KEEP_REASONS = {
  [IDS.battery]:
    'A generic complaint page does not establish one 2019-2021 Veloster infotainment, telematics or body-module sleep defect, nor the asserted test and repair path. The row remains byte-for-byte unchanged.',
  [IDS.dct]:
    'The exact Hyundai bulletin concerns a 7-speed DCT in certain 2016-2017 1.6-liter Turbo vehicles, while the indexed title says 6-speed and the row spans 2012-2017. The combined failure, warranty and cost claims therefore remain byte-for-byte unchanged.',
  [IDS.mdps]:
    'A general MDPS repair-information bulletin does not establish one 2019-2021 Veloster assist-loss defect, abrupt safety outcome or exact component cause. The row remains byte-for-byte unchanged.',
  [IDS.adas]:
    'A generic complaint page does not establish one 2019-2021 Veloster camera/radar defect spanning false warnings, system unavailability, lane keeping, calibration, wiring and replacement. The row remains byte-for-byte unchanged.',
  [IDS.knock]:
    'Campaign 974 supports CNDS software, a blinking MIL and P1327 for certain 2019-2021 2.0-liter vehicles, but does not establish the indexed title\'s reduced-power outcome or knock-sensor hardware-fault identity. A partial rewrite would leave the title broader than the evidence, so the row remains byte-for-byte unchanged.',
  [IDS.thirdDoor]:
    'One forum homepage does not establish a Veloster-wide hinge or check-mechanism defect, exact part number, maintenance interval or repair cost. The row remains byte-for-byte unchanged.',
  [IDS.ivt]:
    'The cited PDF is a Kia Niro EV motor-noise bulletin, and Hyundai service information identifies the 2019-and-later Veloster 2.0-liter transmission as a 6-speed automatic rather than an IVT. The indexed IVT/CVT identity remains byte-for-byte unchanged pending correction through an approved identity workflow.',
  [IDS.wastegate]:
    'One forum homepage does not establish a 2013-2018 Veloster Turbo wastegate-actuator defect, spring-tension cause, boost-control outcome or the asserted repair and cost claims. The row remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.sunroof]: {
    years: [2012],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recalls 12V-568 and 13V-051 together cover certain model-year 2012 Hyundai Veloster vehicles equipped with panoramic sunroofs and produced from July 4, 2011 through April 17, 2012. The panoramic sunroof assembly may have been weakened during installation at the factory. If weakened, the panoramic glass panel may break while the vehicle is in motion, creating a risk of personal injury or a crash.',
    solution:
      'Check the VIN for Hyundai recall campaign 108, represented by NHTSA recalls 12V-568 and 13V-051. Hyundai dealers inspect the sunroof\'s integrity and replace the sunroof glass assembly as necessary, free of charge.',
    symptoms: ['Panoramic sunroof glass fractures or shatters'],
    affectedSystems: ['Panoramic sunroof glass assembly'],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Recall Acknowledgement 12V-568 - 2012 Veloster Panoramic Sunroof',
        url: SOURCES.sunroof12V568,
      },
      {
        type: 'recall',
        title: 'NHTSA Recall Acknowledgement 13V-051 - Expanded 2012 Veloster Population',
        url: SOURCES.sunroof13V051,
      },
    ],
    summary:
      'Kept the indexed panoramic-sunroof shattering identity, replaced a generic NHTSA homepage with the two recall acknowledgements covering the full recalled production range, narrowed years to 2012, and removed unsupported film, pressure, goodwill and cost claims.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Veloster',
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
    contentUpdateSummary: card.summary,
    relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'Veloster',
  );
  if (modelRows.length !== 9) {
    throw new Error(`expected 9 Hyundai Veloster rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Veloster decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component and failure outcome stay on the existing ID, title and category; only facts within the exact official records remain.'
        : 'No content or publication-state changes; secondary, partial, mismatched or different-identity evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind: 'official-record-specific-recall',
            url: item.url,
            verifiedOn: '2026-08-06',
            observation: `${item.title} supports the proposed same-identity statements.`,
          }))
        : HOLD_EVIDENCE[current.id] || [],
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
    make: 'Hyundai',
    model: 'Veloster',
    completionStatement:
      'This packet reconciles all nine frozen Hyundai Veloster rows. One same-identity official-source rewrite is proposed; eight rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All nine rows remain published. Eight are byte-for-byte unchanged.',
      'The rewrite preserves the indexed ID, title and category and uses exact NHTSA recall records.',
      'The rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      velosterRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'one-exact-sunroof-rewrite',
        severity: 'independent-review-required',
        recordIds: [IDS.sunroof],
        detail:
          'NHTSA recalls 12V-568 and 13V-051 together support the 2012 panoramic-sunroof shattering identity without changing the indexed title or category.',
        sourceUrls: Object.values(SOURCES),
      },
      {
        code: 'transmission-identities-not-overwritten',
        severity: 'high',
        recordIds: [IDS.dct, IDS.ivt],
        detail:
          'The DCT title states the wrong speed, while the IVT row cites an unrelated Kia Niro EV bulletin and conflicts with Hyundai\'s 6-speed automatic service information. Both rows remain frozen.',
        sourceUrls: [
          REVIEW_SOURCES.dctSevenSpeed,
          REVIEW_SOURCES.ivtFalseCitation,
          REVIEW_SOURCES.velosterSixSpeed,
        ],
      },
      {
        code: 'partial-knock-and-repair-only-mdps-held',
        severity: 'high',
        recordIds: [IDS.knock, IDS.mdps],
        detail:
          'Campaign 974 does not establish every knock-row title outcome, and the MDPS bulletin is repair information rather than proof of a Veloster defect. Both stay unchanged.',
        sourceUrls: [REVIEW_SOURCES.knockPartial, REVIEW_SOURCES.mdpsRepairOnly],
      },
      {
        code: 'eight-partial-or-unsupported-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'All partial, generic, secondary, mismatched or insufficiently sourced narratives remain byte-for-byte unchanged.',
      },
    ],
    publicSources: SOURCES,
    reviewSources: REVIEW_SOURCES,
    summary: {
      rewrite_same_identity: 1,
      keep_published_pending_source: 8,
      total: 9,
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
  CARDS,
  HOLD_EVIDENCE,
  IDS,
  KEEP_REASONS,
  REVIEW_SOURCES,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewrite,
};
