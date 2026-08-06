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
  'known-issue-hyundai-palisade-adjudication-2026-08-06.json',
);

const IDS = {
  headlight: 'hyundai-palisade-headlight-moisture',
  abs: 'hyundai-palisade-abs-traction-control-malfunction-rough-roads',
  cabinOdor: 'hyundai-palisade-cabin-smell',
  oilPump: 'hyundai-palisade-idle-stop-go-electric-oil-pump-controller-fire-risk-recall-2',
  infotainment: 'hyundai-palisade-infotainment-screen-blackout-bluelink-telematics-failures',
  oilDilution: 'hyundai-palisade-oil-dilution',
  seatBelt: 'hyundai-palisade-seat-belt-buckle-fails-to-latch-recall-25v607',
  airbag: 'hyundai-palisade-third-row-side-curtain-airbag-improper-deployment-recall-26v',
  transmission: 'hyundai-palisade-transmission-shift-quality',
};

const SOURCES = {
  headrest: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203276-0001.pdf',
  oilPump: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V526-7183.PDF',
  seatBelt: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V607-3620.pdf',
  airbag: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V034-7650.pdf',
};

const KEEP_REASONS = {
  [IDS.headlight]:
    'A generic NHTSA vehicle page and forum landing page do not establish one Hyundai-defined Palisade headlamp-sealing defect, recurring replacement outcome, revised assembly, drain-hole procedure or the stated costs across 2020-2023 vehicles. No exact Hyundai Palisade bulletin was found, so the row remains byte-for-byte unchanged.',
  [IDS.abs]:
    'Three secondary articles describing a civil complaint do not establish one Hyundai- or NHTSA-confirmed ABS/traction-control defect, wheel-speed mechanism, steering outcome, affected population or software remedy across 2023-2025 Palisades. The allegations remain byte-for-byte unchanged pending an exact primary record.',
  [IDS.infotainment]:
    'Two owner-forum threads do not establish one combined Palisade head-unit blackout, backup-camera, BlueLink, CarPlay and Wi-Fi defect or validate the reset, reactivation and replacement guidance across 2020-2025 vehicles. The row remains byte-for-byte unchanged.',
  [IDS.oilDilution]:
    'The citation points only to Hyundai\'s homepage, and the claimed 20-FL-006 Palisade oil-dilution bulletin could not be located as an exact primary record. Owner discussion does not establish the Lambda II mechanism, ECU update, DTCs, oil specification, service interval or costs, so the row remains byte-for-byte unchanged.',
  [IDS.transmission]:
    'The citation points only to Hyundai\'s homepage, and the claimed 21-AT-002 Palisade shift-quality bulletin could not be located as an exact primary record. Owner discussion does not establish one calibration or valve-body defect, the three frozen DTCs, fluid interval, relearn claim or costs across 2020-2025 vehicles, so the row remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.cabinOdor]: {
    years: [2020, 2021],
    severity: 'low',
    confidence: 'high',
    description:
      'Hyundai TSB 21-BD-002H-1 applies to certain model-year 2020-2021 Palisade (LX2) vehicles equipped with Nappa leather and produced before November 23, 2020. The bulletin documents odor that may emit from one or more headrests.',
    solution:
      'Ask a Hyundai dealer to inspect the headrests under TSB 21-BD-002H-1. Hyundai\'s procedure removes the affected headrests, applies an approved odor eliminator to the foam, inner cover surfaces and seat mounting holes, dries the treatment in direct sunlight for two to three hours and reinspects. Only a headrest that still has odor after treatment is replaced.',
    symptoms: ['Odor emitting from one or more headrests'],
    affectedSystems: ['Nappa-leather headrests'],
    dtcCodes: [],
    citations: [
      {
        type: 'tsb',
        title: 'Hyundai TSB 21-BD-002H-1 - Palisade Headrest Odor Service Procedure',
        url: SOURCES.headrest,
      },
    ],
    summary:
      'Kept the indexed headrest/interior-odor identity, replaced forum and product claims with Hyundai TSB 21-BD-002H-1, narrowed applicability to the documented 2020-2021 Nappa-leather population, and retained only Hyundai\'s treatment and conditional replacement procedure.',
  },
  [IDS.oilPump]: {
    years: [2023, 2024],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 23V-526 (Hyundai recall 246) covers certain model-year 2023-2024 Palisade vehicles. The transmission electric oil pump for the Idle Stop & Go system may contain a controller printed circuit board damaged during manufacturing. A damaged capacitor can cause heat damage to the pump circuit board, connector and wiring harness, increasing fire risk and potentially disrupting communication among onboard controllers.',
    solution:
      'Check the VIN for NHTSA recall 23V-526. Hyundai recommends parking affected vehicles outside and away from structures until the recall remedy is completed. Hyundai dealers inspect and replace the electric oil pump and front harness as necessary, free of charge.',
    symptoms: [
      'Smoke from the vehicle underbody',
      'Burning or melting odor',
      'Malfunction Indicator Lamp or other dashboard warning lamps',
    ],
    affectedSystems: [
      'Idle Stop & Go transmission electric oil pump',
      'Oil-pump controller printed circuit board',
      'Front wiring harness',
    ],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 23V-526 - Hyundai ISG Electric Oil Pump',
        url: SOURCES.oilPump,
      },
    ],
    summary:
      'Kept the indexed 23V-526 oil-pump-controller/fire identity, replaced secondary and owner-notice citations with the exact Part 573 report, limited scope to the filing, and removed the separate 25V-291 moisture-seal identity.',
  },
  [IDS.seatBelt]: {
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 25V-607 (Hyundai recall 283) covers certain model-year 2020-2025 Palisades. Front-row and second-row outer seat-belt buckle assemblies may contain out-of-specification components that interfere within the latch channel and increase friction, especially in cold temperatures. Together with slow insertion of the tongue plate, this may prevent the buckle from fully latching and increase injury risk in a crash.',
    solution:
      'Check the VIN for NHTSA recall 25V-607. Until the repair is completed, Hyundai advises fastening the belt with a quick and direct motion, then pulling on it to confirm it is fully secured. Hyundai dealers replace the applicable front-row and second-row outer buckle assemblies free of charge.',
    symptoms: [
      'Lighter-than-normal audible click while fastening',
      'Recessed push button on the buckle housing',
      'Visual or audible seat-belt warning if the belt is not secured',
    ],
    affectedSystems: ['Front-row seat-belt buckles', 'Second-row outer seat-belt buckles'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 25V-607 - Palisade Seat-Belt Buckles',
        url: SOURCES.seatBelt,
      },
    ],
    summary:
      'Kept the indexed seat-belt-buckle/25V-607 identity, replaced secondary citations with the exact Part 573 report, and corrected the complaint count, failure behavior, warning signs and remedy to the filing.',
  },
  [IDS.airbag]: {
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 26V-034 (Hyundai recall 292) covers certain model-year 2020-2025 Palisades that may not meet the third-row headform-displacement requirements of Federal Motor Vehicle Safety Standard No. 226, Ejection Mitigation. Hyundai and NHTSA testing produced third-row displacement values above the 100-millimeter limit in certain instances. Noncompliance may increase injury risk to third-row occupants in certain crashes, including a rollover.',
    solution:
      'Check the VIN for NHTSA recall 26V-034 and contact a Hyundai dealer for the current remedy status. In the January 22, 2026 Part 573 filing, Hyundai stated that it was developing a remedy; when available, the remedy would be provided at no cost to affected owners.',
    symptoms: ['No driver-noticeable warning', 'Latent third-row ejection-mitigation noncompliance'],
    affectedSystems: ['Third-row ejection mitigation', 'Left and right curtain airbag modules'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 26V-034 - Palisade FMVSS 226 Noncompliance',
        url: SOURCES.airbag,
      },
    ],
    summary:
      'Kept the indexed third-row curtain-airbag/26V-034 identity, replaced secondary citations with the exact Part 573 report, and removed the unsupported protective-film, padding-removal and finalized-remedy claims.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Palisade',
    title: current.title,
    category: current.category,
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
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'Palisade',
  );
  if (modelRows.length !== 9) {
    throw new Error(`expected 9 Hyundai Palisade rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Palisade decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component, failure outcome and recall or service identity stay on the existing ID, title and category; only facts from the exact official record remain.'
        : 'No content or publication-state changes; secondary, partial or unsupported evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind: item.type === 'recall' ? 'official-record-specific-recall' : 'official-record-specific-tsb',
            url: item.url,
            verifiedOn: '2026-08-06',
            observation: `${item.title} supports the proposed same-identity statements.`,
          }))
        : [],
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
    model: 'Palisade',
    completionStatement:
      'This packet reconciles all nine frozen Hyundai Palisade rows. Four same-identity rewrites are proposed; five rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All nine rows remain published. Five are byte-for-byte unchanged.',
      'Each rewrite preserves the indexed ID, title and category and uses one exact Hyundai or NHTSA record.',
      'Rewrites contain zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      palisadeRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'four-exact-same-identity-rewrites',
        severity: 'independent-review-required',
        recordIds: Object.keys(CARDS),
        detail:
          'Exact Hyundai or NHTSA records support one headrest-odor service procedure and three recall identities without changing any page title or category.',
      },
      {
        code: 'airbag-remedy-claim-corrected',
        severity: 'high',
        recordIds: [IDS.airbag],
        detail:
          'The frozen page claimed a protective-film and padding-removal remedy, while the exact January 22, 2026 Part 573 filing says Hyundai was still developing the remedy.',
        sourceUrls: [SOURCES.airbag],
      },
      {
        code: 'five-secondary-or-unsupported-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'Headlight, rough-road ABS, combined infotainment/BlueLink, oil-dilution and broad shift-quality narratives remain byte-for-byte unchanged without exact same-identity primary evidence.',
      },
    ],
    publicSources: SOURCES,
    summary: {
      rewrite_same_identity: 4,
      keep_published_pending_source: 5,
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
  IDS,
  KEEP_REASONS,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewrite,
};
