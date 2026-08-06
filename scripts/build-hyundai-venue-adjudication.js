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
  'known-issue-hyundai-venue-adjudication-2026-08-06.json',
);

const IDS = {
  infotainment: 'hyundai-venue-infotainment-2020',
  cvtJudder: 'hyundai-venue-cvt-judder-2020',
  egr: 'hyundai-venue-egr-valve-electrical-short-causing-loss-drive-power-recall-2',
  stalling: 'hyundai-venue-engine-stalling-shut-off-when-braking-stop',
  horn: 'hyundai-venue-horn-becomes-weak-inoperative-due-to-internal-corrosion',
  ivtFailure: 'hyundai-venue-ivt-complete-failure-sudden-loss-acceleration',
  rearCamera: 'hyundai-venue-rear-camera-fog-2020',
  pretensioner: 'hyundai-venue-seat-belt-pretensioner-may-explode-crash-recall-22v458',
  antiTheft: 'hyundai-venue-theft-vulnerability-no-engine-immobilizer',
};

const SOURCES = {
  egr: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V308-1849.PDF',
  pretensioner: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V458-9361.PDF',
  antiTheft: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10233549-0001.pdf',
};

const REVIEW_SOURCES = {
  hornPartial: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011836-0001.pdf',
  ivtPartial: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10241878-0001.pdf',
};

const HOLD_EVIDENCE = {
  [IDS.cvtJudder]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.ivtPartial,
      verifiedOn: '2026-08-06',
      observation:
        'Hyundai TSB 23-AT-010H covers 2020-and-later Venue IVTs with P0845, P0846 or P0867 and distinguishes oil-pressure-sensor repair from IVT replacement when drivability concerns exist. It does not establish the indexed generic judder, hesitation, fuel-economy programming, software-update or cost narrative.',
    },
  ],
  [IDS.horn]: [
    {
      kind: 'official-record-partial-title-outcome',
      url: REVIEW_SOURCES.hornPartial,
      verifiedOn: '2026-08-06',
      observation:
        'Warranty Extension TXXU supports an inoperable horn caused by foreign substances and internal oxidation on certain 2020-2022 Venue vehicles. It does not state the indexed weak-horn outcome or a moisture-specific cause, so the title cannot be retained in an exact-source rewrite.',
    },
  ],
  [IDS.ivtFailure]: [
    {
      kind: 'official-record-partial-identity',
      url: REVIEW_SOURCES.ivtPartial,
      verifiedOn: '2026-08-06',
      observation:
        'Hyundai TSB 23-AT-010H provides diagnostic repair direction for specific IVT pressure-sensor codes and notes that slipping, shift shock, poor acceleration or inability to shift calls for IVT assembly replacement. It does not establish the indexed systemic complete-failure, sudden-loss, warranty or class-action narrative.',
    },
  ],
};

const KEEP_REASONS = {
  [IDS.infotainment]:
    'A forum homepage does not establish one 2020-2024 Venue infotainment defect, the asserted hard-reset procedure or the phone-specific Bluetooth narrative. The row remains byte-for-byte unchanged.',
  [IDS.cvtJudder]:
    'The exact Hyundai bulletin concerns specific pressure-sensor DTCs and a conditional repair workflow, not the indexed generic IVT judder and hesitation narrative or its programming and cost claims. The row remains byte-for-byte unchanged.',
  [IDS.stalling]:
    'Two secondary pages do not establish one 2020-2022 Venue stalling defect, a battery-area wiring-harness cause, a consistent repair path or lemon-law eligibility. The row remains byte-for-byte unchanged.',
  [IDS.horn]:
    'Warranty Extension TXXU supports an inoperable horn and internal oxidation but not the indexed weak-horn outcome or moisture-specific causal claim. A partial rewrite would leave the title broader than the evidence, so the row remains byte-for-byte unchanged.',
  [IDS.ivtFailure]:
    'The official IVT bulletin is only a partial diagnostic match and does not establish a Venue-wide complete-failure or sudden-loss defect, warranty outcome or class-action coverage. The row remains byte-for-byte unchanged.',
  [IDS.rearCamera]:
    'A generic complaint page and fabricated-shaped Reddit and YouTube URLs do not establish a Venue camera-housing seal defect, moisture mechanism, gasket procedure or additional-sealant recommendation. The row remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.egr]: {
    years: [2024],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 24V-308 covers certain 2024 Hyundai Venue vehicles. Solder flux contamination on the exhaust gas recirculation valve sensor leads can cause an electrical short and a malfunction of the EGR valve and crank position sensor. The malfunction indicator lamp may illuminate and the vehicle may experience a sudden loss of motive power, increasing crash risk.',
    solution:
      'Check the VIN for NHTSA recall 24V-308 / Hyundai Campaign 260. Hyundai dealers replace the EGR valve assembly free of charge.',
    symptoms: ['Malfunction indicator lamp illuminates', 'Sudden loss of motive power'],
    affectedSystems: ['Exhaust gas recirculation valve assembly', 'Crank position sensing'],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Safety Recall Report 24V-308 - EGR Valve Electrical Short',
        url: SOURCES.egr,
      },
    ],
    summary:
      'Kept the indexed EGR electrical-short and power-loss identity, retained the exact 2024 scope, replaced secondary material with the Part 573 report, and removed unsupported notification, contact and commerce claims.',
  },
  [IDS.pretensioner]: {
    years: [2020, 2021, 2022],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 22V-458 covers certain 2020-2022 Hyundai Venue vehicles. The driver-side and/or passenger-side pyrotechnic seat belt pretensioner may deploy abnormally in certain crashes because of over-pressurization. Metal fragments could enter the occupant compartment and injure occupants. The recall report states there is no warning before abnormal deployment.',
    solution:
      'Check the VIN for NHTSA recall 22V-458 / Hyundai Campaign 231. Hyundai dealers secure the pretensioner micro gas generator and delivery pipe with a cap to prevent potential abnormal deployment, free of charge.',
    symptoms: ['No advance warning before abnormal pretensioner deployment'],
    affectedSystems: ['Front seat belt pretensioners'],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Safety Recall Report 22V-458 - Seat Belt Pretensioner',
        url: SOURCES.pretensioner,
      },
    ],
    summary:
      'Kept the indexed pretensioner-fragment identity and 2020-2022 scope, used the exact Part 573 report, and removed unsupported prior-recall return instructions, secondary citations and contact details.',
  },
  [IDS.antiTheft]: {
    years: [2020, 2021],
    severity: 'high',
    confidence: 'high',
    description:
      'Hyundai Campaign 993 includes certain 2020-2021 Venue vehicles that are not equipped with an engine immobilizer and are not equipped with a push-button START/STOP ignition. The campaign bulletin explains that many Hyundai vehicles without push-button ignition did not have an immobilizer and could be theft targets; eligibility must be checked by VIN.',
    solution:
      'Check the VIN for Hyundai Service Campaign 993. For eligible vehicles, a Hyundai dealer upgrades the Integrated Body Control Unit or Body Control Module software and installs anti-theft decals. After the update, use the key fob to lock and unlock the vehicle to activate or deactivate the anti-theft system, and disarm it with the key fob before attempting to start the vehicle.',
    symptoms: ['Vehicle is eligible for Campaign 993 by VIN'],
    affectedSystems: ['Integrated Body Control Unit / Body Control Module', 'Factory burglar alarm'],
    citations: [
      {
        type: 'manufacturer',
        title: 'Hyundai Campaign 993 Dealer Best Practices - Anti-Theft Software Upgrade',
        url: SOURCES.antiTheft,
      },
    ],
    summary:
      'Kept the indexed no-immobilizer theft-vulnerability identity, limited it to certain VIN-eligible 2020-2021 Venue vehicles without push-button ignition or an immobilizer, and replaced broad social, production-date and timing claims with Campaign 993 instructions.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Venue',
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
    (row) => row.make === 'Hyundai' && row.model === 'Venue',
  );
  if (modelRows.length !== 9) {
    throw new Error(`expected 9 Hyundai Venue rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Venue decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component and failure outcome stay on the existing ID, title and category; only facts within the exact official record remain.'
        : 'No content or publication-state changes; partial, secondary, generic, mismatched or unsupported evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind: 'official-record-exact-identity',
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
    model: 'Venue',
    completionStatement:
      'This packet reconciles all nine frozen Hyundai Venue rows. Three same-identity official-source rewrites are proposed; six rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All nine rows remain published. Six are byte-for-byte unchanged.',
      'Every rewrite preserves the indexed ID, title and category and uses an exact official record.',
      'Every rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      venueRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'three-exact-official-record-rewrites',
        severity: 'independent-review-required',
        recordIds: [IDS.egr, IDS.pretensioner, IDS.antiTheft],
        detail:
          'The EGR, pretensioner and anti-theft rows match exact official records without changing their indexed titles, categories or IDs.',
        sourceUrls: Object.values(SOURCES),
      },
      {
        code: 'partial-horn-title-held',
        severity: 'high',
        recordIds: [IDS.horn],
        detail:
          'Warranty Extension TXXU supports an inoperable horn and internal oxidation but not the indexed weak-horn outcome, so the row stays unchanged.',
        sourceUrls: [REVIEW_SOURCES.hornPartial],
      },
      {
        code: 'partial-ivt-identities-held',
        severity: 'high',
        recordIds: [IDS.cvtJudder, IDS.ivtFailure],
        detail:
          'TSB 23-AT-010H supports a specific DTC-driven repair workflow, not either indexed broad IVT narrative. Both rows stay unchanged.',
        sourceUrls: [REVIEW_SOURCES.ivtPartial],
      },
      {
        code: 'six-partial-or-unsupported-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'Every partial, generic, secondary, invalid-shaped or unsupported narrative remains byte-for-byte unchanged.',
      },
    ],
    publicSources: SOURCES,
    reviewSources: REVIEW_SOURCES,
    summary: {
      rewrite_same_identity: 3,
      keep_published_pending_source: 6,
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
