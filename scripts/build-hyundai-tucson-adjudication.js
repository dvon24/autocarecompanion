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
  'known-issue-hyundai-tucson-adjudication-2026-08-06.json',
);

const IDS = {
  oilDilution:
    'hyundai-tucson-2-5l-smartstream-gdi-oil-dilution-excessive-oil-consumption',
  ac: 'hyundai-tucson-ac-compressor-failure-2010',
  dct: 'hyundai-tucson-dct-transmission-shudder',
  fca: 'hyundai-tucson-forward-collision-avoidance-phantom-braking',
  fuelPump: 'hyundai-tucson-high-pressure-fuel-pump',
  batteryDrain: 'hyundai-tucson-hybrid-phev-12v-battery-repeated-drain-no-start',
  doorPaint: 'hyundai-tucson-interior-door-pull-handle-trim-paint-peeling',
  oilPump: 'hyundai-tucson-isg-electric-oil-pump-controller-overheat-fire-risk',
  rearCaliper: 'hyundai-tucson-rear-brake-caliper-seize',
  rearCoupler: 'hyundai-tucson-rear-diff-coupler-failure',
  sunroof: 'hyundai-tucson-sunroof-cracking-2016',
  engine: 'hyundai-tucson-theta2-engine-seizure',
  towHarness: 'hyundai-tucson-tow-hitch-wiring-harness-water-intrusion-fire-risk',
};

const SOURCES = {
  fca: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V316-9486.pdf',
  door: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237180-0001.pdf',
  oilPump: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V526-9703.PDF',
  towHarness: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V893-5513.pdf',
};

const REVIEW_SOURCES = {
  dctPartial: 'https://static.nhtsa.gov/odi/rcl/2016/RCLRPT-16V628-8794.pdf',
  engineMismatch: 'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V063-1419.PDF',
};

const HOLD_EVIDENCE = {
  [IDS.dct]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.dctPartial,
      verifiedOn: '2026-08-06',
      observation:
        'Recall 16V-628 covers delayed engagement and nonacceleration caused by clutch-application software logic only in certain 2016 Tucson 7-speed DCT vehicles; it does not establish the title\'s shudder identity, premature clutch-wear claims, warranty extension or 2017-2021 scope.',
    },
  ],
  [IDS.engine]: [
    {
      kind: 'official-record-different-identity',
      url: REVIEW_SOURCES.engineMismatch,
      verifiedOn: '2026-08-06',
      observation:
        'Recall 19V-063 covers an oil-pan sealant leak in certain 2011-2013 Tucson 2.4-liter vehicles, not the indexed connecting-rod-bearing manufacturing-failure identity. The existing citation labels also name unrelated recalls, so the row cannot be safely rewritten.',
    },
  ],
};

const KEEP_REASONS = {
  [IDS.oilDilution]:
    'Owner discussions and a secondary article do not establish one Hyundai-defined 2022-2024 Tucson fuel-dilution and oil-consumption defect, ring-sticking cause, service interval or remedy. The row remains byte-for-byte unchanged.',
  [IDS.ac]:
    'A generic complaint page and one owner discussion do not establish one 2010-2021 Tucson compressor-clutch, seizure and debris-contamination defect or the asserted replacement path. The row remains byte-for-byte unchanged.',
  [IDS.dct]:
    'Recall 16V-628 supports only a 2016 delayed-engagement/nonacceleration software condition. It does not establish the indexed shudder identity, premature clutch wear, alleged warranty extension or 2017-2021 scope, so the row remains byte-for-byte unchanged.',
  [IDS.fuelPump]:
    'A forum homepage and generic complaint page do not establish one 2011-2018 Tucson high-pressure-fuel-pump follower defect, pressure specification, part number or cost. The row remains byte-for-byte unchanged.',
  [IDS.batteryDrain]:
    'Owner discussions do not establish one 2022-2024 Hybrid/PHEV 12-volt drain defect or cause. Campaign 9B4 concerns a different over-voltage condition and cannot support this no-start identity, so the row remains byte-for-byte unchanged.',
  [IDS.rearCaliper]:
    'A forum homepage and generic complaint page do not establish one 2016-2023 Tucson rear-caliper seizure defect, corrosion mechanism, mileage range or repair cost. The row remains byte-for-byte unchanged.',
  [IDS.rearCoupler]:
    'Forum homepages do not establish one 2010-2021 AWD coupler defect, exact part numbers, fluid interval or replacement cost. The row remains byte-for-byte unchanged.',
  [IDS.sunroof]:
    'One complaint reference and a generic aggregation page do not establish one 2016-2025 spontaneous-cracking defect, thermal-stress or body-flex cause, or goodwill-replacement policy. The row remains byte-for-byte unchanged.',
  [IDS.engine]:
    'The exact Tucson recall 19V-063 concerns an oil-pan sealant leak, not connecting-rod-bearing failure. The row\'s cited recall labels do not establish its indexed identity or broad 2011-2019 population, so it remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.fca]: {
    years: [2025, 2026],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 26V-316 covers certain model-year 2025-2026 Hyundai Tucson, Tucson Hybrid and Tucson Plug-in Hybrid vehicles. The front camera software can be overly sensitive to forward-object proximity in certain driving scenarios, causing the Forward Collision-Avoidance Assist system to engage earlier than expected and potentially produce sudden braking. Sudden braking can increase the risk of a rear-end crash from a closely following vehicle.',
    solution:
      'Check the VIN for NHTSA recall 26V-316. A Hyundai dealer will update the front camera software at no charge. The revised software is tuned to better align activation timing and distance with driver expectations.',
    symptoms: [
      'Forward Collision-Avoidance Assist engages earlier than expected',
      'Unexpected sudden braking',
    ],
    affectedSystems: ['Front multifunction camera software', 'Forward Collision-Avoidance Assist'],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Safety Recall Report 26V-316 - FCA Camera Software',
        url: SOURCES.fca,
      },
    ],
    summary:
      'Kept the indexed unintended-braking identity, replaced articles and owner reports with recall 26V-316, narrowed the scope to model years 2025-2026, and removed unsupported trigger, lawsuit and disable-system claims.',
  },
  [IDS.doorPaint]: {
    years: [2022, 2023],
    severity: 'low',
    confidence: 'high',
    description:
      'Hyundai TSB 23-BD-009H covers certain model-year 2022-2023 Tucson vehicles equipped with non-glossy front door pull handles. The bulletin provides repair information when the front door pull-handle paint is peeling.',
    solution:
      'Confirm that the vehicle and handle finish fall within TSB 23-BD-009H. For a covered vehicle exhibiting the condition, Hyundai directs technicians to replace the front door trim panel assembly using the bulletin\'s repair procedure.',
    symptoms: ['Paint peeling from a non-glossy front door pull handle'],
    affectedSystems: ['Front door pull handle finish', 'Front door trim panel assembly'],
    citations: [
      {
        type: 'tsb',
        title: 'Hyundai TSB 23-BD-009H - Front Door Pull Handle Paint Peeling',
        url: SOURCES.door,
      },
    ],
    summary:
      'Kept the indexed door-pull-handle paint identity, replaced secondary TSB listings with Hyundai TSB 23-BD-009H, and removed unsupported universal warranty and recurrence-prevention claims.',
  },
  [IDS.oilPump]: {
    years: [2023],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 23V-526 covers certain model-year 2023 Hyundai Tucson vehicles. The Idle Stop & Go transmission electric oil-pump controller may contain a printed circuit board damaged during manufacturing. A damaged capacitor can affect operation and cause heat damage to the pump circuit board, connector and wiring harness, increasing the risk of a vehicle fire and potentially disrupting controller-area-network communication. Warning signs can include underbody smoke, a burning or melting odor, or warning-lamp illumination.',
    solution:
      'Check the VIN for NHTSA recall 23V-526. Until the remedy is completed, Hyundai recommends parking outside and away from structures. A Hyundai dealer will inspect and replace the electric oil pump and front wiring harness if necessary, at no charge.',
    symptoms: [
      'Smoke from the vehicle underbody',
      'Burning or melting odor',
      'Malfunction Indicator Lamp or other warning lamps illuminate',
    ],
    affectedSystems: [
      'Idle Stop & Go transmission electric oil pump',
      'Oil-pump controller printed circuit board',
      'Front wiring harness',
    ],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Safety Recall Report 23V-526 - Electric Oil Pump',
        url: SOURCES.oilPump,
      },
    ],
    summary:
      'Kept the indexed ISG electric-oil-pump fire-risk identity, updated the citation to the amended Part 573 report, and corrected the Tucson scope from 2023-2024 to model year 2023 only.',
  },
  [IDS.towHarness]: {
    years: [2022, 2023, 2024],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 25V-893 covers certain model-year 2022-2024 Hyundai Tucson vehicles equipped with an optional OEM trailer wiring harness installed as a port-installed or dealer-installed option. The harness control module was installed in a location susceptible to water ingress and has insufficient sealing. Water inside the module can make trailer or vehicle stop lamps inoperative or, in rare cases, cause a short that can overheat, melt or ignite, increasing crash and fire risk. Intermittent or inoperative parking, turn-signal, or stop lamps on the vehicle or trailer may provide warning.',
    solution:
      'Check the VIN for NHTSA recall 25V-893. Until the remedy is completed, Hyundai recommends parking outside and away from structures. When parts are available, a Hyundai dealer will replace the trailer wiring harness at no charge; the replacement control module has improved sealing to prevent water intrusion.',
    symptoms: [
      'Intermittent or inoperative vehicle or trailer parking lamps',
      'Intermittent or inoperative vehicle or trailer turn-signal lamps',
      'Intermittent or inoperative vehicle or trailer stop lamps',
    ],
    affectedSystems: ['Optional OEM trailer wiring harness', 'Trailer wiring harness control module'],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Safety Recall Report 25V-893 - Trailer Wiring Harness',
        url: SOURCES.towHarness,
      },
    ],
    summary:
      'Kept the indexed tow-harness water-intrusion/fire identity, limited the population to the optional OEM accessory in recall 25V-893, and removed secondary reporting and unrelated equipment-recall details.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Tucson',
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
    (row) => row.make === 'Hyundai' && row.model === 'Tucson',
  );
  if (modelRows.length !== 13) {
    throw new Error(`expected 13 Hyundai Tucson rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Tucson decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component and failure outcome stay on the existing ID, title and category; only facts within the exact official record remain.'
        : 'No content or publication-state changes; secondary, partial, mismatched or different-identity evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind:
              item.type === 'tsb'
                ? 'official-record-specific-tsb'
                : 'official-record-specific-recall',
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
    model: 'Tucson',
    completionStatement:
      'This packet reconciles all thirteen frozen Hyundai Tucson rows. Four same-identity official-source rewrites are proposed; nine rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All thirteen rows remain published. Nine are byte-for-byte unchanged.',
      'Each rewrite preserves the indexed ID, title and category and uses one exact Hyundai or NHTSA primary record.',
      'Rewrites contain zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      tucsonRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'four-exact-official-rewrites',
        severity: 'independent-review-required',
        recordIds: Object.keys(CARDS),
        detail:
          'Exact Hyundai or NHTSA records support the FCA camera-software, door-pull-handle paint, electric-oil-pump and optional OEM tow-harness identities without changing indexed titles or categories.',
        sourceUrls: Object.values(SOURCES),
      },
      {
        code: 'partial-dct-record-held',
        severity: 'high',
        recordIds: [IDS.dct],
        detail:
          'Recall 16V-628 supports a narrower 2016 delayed-engagement software condition, not the full indexed shudder and premature-wear identity. The row remains unchanged.',
        sourceUrls: [REVIEW_SOURCES.dctPartial],
      },
      {
        code: 'different-engine-cause-held',
        severity: 'high',
        recordIds: [IDS.engine],
        detail:
          'Recall 19V-063 establishes an oil-pan sealant leak rather than connecting-rod-bearing failure. A different cause cannot replace the indexed engine identity.',
        sourceUrls: [REVIEW_SOURCES.engineMismatch],
      },
      {
        code: 'nine-partial-or-unsupported-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'All partial, generic, secondary, mismatched or insufficiently sourced narratives remain byte-for-byte unchanged.',
      },
    ],
    publicSources: SOURCES,
    reviewSources: REVIEW_SOURCES,
    summary: {
      rewrite_same_identity: 4,
      keep_published_pending_source: 9,
      total: 13,
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
