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
  'known-issue-hyundai-santa-cruz-adjudication-2026-08-06.json',
);

const IDS = {
  dctOverheat: 'hyundai-santacruz-dct-overheat',
  battery: 'hyundai-santa-cruz-12v-battery-parasitic-drain-premature-failure',
  fca: 'hyundai-santa-cruz-forward-collision-avoidance-phantom-unexpected-braking',
  roofMolding: 'hyundai-santa-cruz-roof-side-molding-detachment-while-driving',
  sunroof: 'hyundai-santa-cruz-sunroof-drain-clogging-causing-interior-water-leaks',
  towHarness: 'hyundai-santa-cruz-tow-hitch-harness-water-intrusion-causing-fire-risk',
  oilPump: 'hyundai-santa-cruz-transmission-electric-oil-pump-fault-causing-loss-drive-powe',
  bedLiner: 'hyundai-santacruz-bed-liner-peeling',
  infotainment: 'hyundai-santacruz-infotainment-freeze',
  rearWindow: 'hyundai-santacruz-rear-window-rattle',
};

const SOURCES = {
  fca: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V316-9486.pdf',
  roofMolding: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V038-5662.PDF',
  towHarness: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V181-1849.PDF',
  oilPump: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V746-8939.PDF',
};

const KEEP_REASONS = {
  [IDS.dctOverheat]:
    'The citation points only to Hyundai\'s homepage, and the claimed 22-AT-008 thermal-management bulletin could not be located as an exact Santa Cruz record. Recall 22V-746 concerns fail-safe software after a high-pressure electric-oil-pump fault, not towing-related clutch overheating, so the row remains byte-for-byte unchanged.',
  [IDS.battery]:
    'Two owner-forum threads do not establish one Hyundai-defined Bluelink or key-fob parasitic-draw defect, server-transaction limit, locking workaround or premature battery-failure pattern across 2022-2025 Santa Cruz vehicles. The row remains byte-for-byte unchanged.',
  [IDS.sunroof]:
    'Two owner-forum threads do not establish one Hyundai-defined clogged, crimped, disconnected or incompletely punched sunroof-drain defect or validate compressed-air and water-test procedures across 2022-2025 Santa Cruz vehicles. The row remains byte-for-byte unchanged.',
  [IDS.bedLiner]:
    'One broad community landing page does not establish one Hyundai-defined composite bed-liner adhesion defect, UV or temperature mechanism, warranty outcome, recurrence rate or aftermarket replacement cost across 2022-2025 vehicles. The row remains byte-for-byte unchanged.',
  [IDS.infotainment]:
    'A generic NHTSA vehicle page does not establish one Santa Cruz head-unit freeze, blackout, wireless projection and backup-camera defect or validate multiple software updates, reset behavior, wired workaround, replacement outcome or costs. The row remains byte-for-byte unchanged.',
  [IDS.rearWindow]:
    'This row has no citations, and no exact Hyundai Santa Cruz record was found establishing a combined rear-window and tailgate rattle, wind-noise and water-leak defect, revised seal part, foam-tape repair or the stated costs. The row remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.fca]: {
    years: [2025, 2026],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 26V-316 (Hyundai recall 302) covers certain model-year 2025-2026 Santa Cruz vehicles. Front-camera software can cause the Forward Collision Avoidance system to exhibit increased sensitivity to forward-object proximity in certain driving scenarios. The system may engage earlier than the driver expects and cause sudden braking, increasing the risk of a rear-end crash from a closely following vehicle.',
    solution:
      'Check the VIN for NHTSA recall 26V-316. Hyundai dealers update the front-camera software free of charge. The remedy software is tuned to better align activation timing and distance to the leading vehicle with operator expectations.',
    symptoms: ['Unexpected early Forward Collision Avoidance engagement', 'Sudden braking'],
    affectedSystems: ['Forward Collision Avoidance system', 'Multifunction front camera software'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 26V-316 - Santa Cruz Forward Collision Avoidance',
        url: SOURCES.fca,
      },
    ],
    summary:
      'Kept the indexed FCA/unexpected-braking/26V-316 identity, replaced the secondary citation with the exact Part 573 report, and retained only the documented Santa Cruz scope, software cause, risk and remedy.',
  },
  [IDS.roofMolding]: {
    years: [2022, 2023],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 23V-038 (Hyundai recall 241) covers certain model-year 2022-2023 Santa Cruz vehicles. Insufficient retention between the roof flange and mounting clips can allow a roof molding to detach while the vehicle is moving. A detached molding can become a road hazard and increase crash risk for other vehicles.',
    solution:
      'Check the VIN for NHTSA recall 23V-038. Hyundai dealers inspect and secure or replace the roof moldings as necessary, free of charge.',
    symptoms: ['Visible lifting or misalignment of a roof molding', 'Wind noise or other noise from the roof area'],
    affectedSystems: ['Roof moldings', 'Roof flange', 'Roof-molding mounting clips'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 23V-038 - Santa Cruz Roof Moldings',
        url: SOURCES.roofMolding,
      },
    ],
    summary:
      'Kept the indexed roof-molding/23V-038 identity, replaced secondary citations with the exact Part 573 report, and removed the unsupported paint-sealer cause and combined-population implication.',
  },
  [IDS.towHarness]: {
    years: [2022, 2023],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 23V-181 (Hyundai recall 244) covers model-year 2022-2023 Santa Cruz vehicles that may have a Hyundai accessory tow-hitch harness. The harness module printed circuit board can be susceptible to water entering through the 4-pin tow-hitch harness connector. An electrical short can cause a trailer-harness-module fire while driving or while parked with the ignition off.',
    solution:
      'Check the VIN for NHTSA recall 23V-181 and park the vehicle outside and away from structures until the remedy is complete. Hyundai dealers verify whether the accessory tow hitch is installed and fit a 15-ampere fuse and new wire-extension kit as necessary, free of charge. The filing also describes fuse removal as interim protection until the final remedy is completed.',
    symptoms: ['No advance warning identified in the Part 573 report'],
    affectedSystems: ['Accessory tow-hitch harness', 'Tow-hitch harness module', '4-pin harness connector'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 23V-181 - Santa Cruz Tow-Hitch Harness',
        url: SOURCES.towHarness,
      },
    ],
    summary:
      'Kept the indexed tow-hitch-harness/water-ingress/fire/23V-181 identity, replaced the forum citation with the exact Part 573 report, and retained only the documented accessory scope, no-warning condition and remedy sequence.',
  },
  [IDS.oilPump]: {
    years: [2022],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 22V-746 (Hyundai recall 236) covers certain model-year 2022 Santa Cruz vehicles. An internal fault in the transmission high-pressure electric oil pump can trigger diagnostic codes and warning lamps. Improper software logic for the fail-safe condition can allow about 20-30 seconds of motive power before the transmission clutches and drive gears disengage, causing a complete loss of motive power and increasing crash risk.',
    solution:
      'Check the VIN for NHTSA recall 22V-746. Hyundai dealers inspect the transmission and replace it if necessary, then reprogram the transmission control unit with software that provides proper fail-safe driving capability, free of charge.',
    symptoms: [
      'Malfunction Indicator Lamp illumination',
      'Instrument-cluster warning message',
      'Audio-video-navigation display warning message',
      'Complete loss of motive power after a brief limited-mobility period',
    ],
    affectedSystems: ['Transmission high-pressure electric oil pump', 'Transmission control unit fail-safe logic'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 22V-746 - Santa Cruz Transmission Oil Pump Fail-Safe',
        url: SOURCES.oilPump,
      },
    ],
    summary:
      'Kept the indexed oil-pump/loss-of-power/22V-746 identity, replaced secondary and TSB citations with the exact Part 573 report, corrected the cause from unsupported soldering to fail-safe software logic, and removed the unsupported P0868 code.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Santa Cruz',
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
    (row) => row.make === 'Hyundai' && row.model === 'Santa Cruz',
  );
  if (modelRows.length !== 10) {
    throw new Error(`expected 10 Hyundai Santa Cruz rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Santa Cruz decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component, failure outcome and recall identity stay on the existing ID, title and category; only facts from the exact Part 573 report remain.'
        : 'No content or publication-state changes; secondary, partial or different-identity evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind: 'official-record-specific-recall',
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
    model: 'Santa Cruz',
    completionStatement:
      'This packet reconciles all ten frozen Hyundai Santa Cruz rows. Four same-identity recall rewrites are proposed; six rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All ten rows remain published. Six are byte-for-byte unchanged.',
      'Each rewrite preserves the indexed ID, title and category and uses one exact NHTSA Part 573 report.',
      'Rewrites contain zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      santaCruzRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'four-exact-recall-rewrites',
        severity: 'independent-review-required',
        recordIds: Object.keys(CARDS),
        detail:
          'Exact Part 573 reports support the FCA, roof-molding, tow-harness and transmission-oil-pump identities without changing titles or categories.',
      },
      {
        code: 'oil-pump-cause-corrected',
        severity: 'high',
        recordIds: [IDS.oilPump],
        detail:
          'The frozen row attributed the event to insufficient circuit-board soldering, while recall 22V-746 identifies improper fail-safe software logic when certain electric-oil-pump faults are detected.',
        sourceUrls: [SOURCES.oilPump],
      },
      {
        code: 'six-secondary-or-unsupported-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'DCT overheating, battery drain, sunroof leakage, bed-liner, infotainment and rear-window narratives remain byte-for-byte unchanged without exact same-identity Hyundai evidence.',
      },
    ],
    publicSources: SOURCES,
    summary: {
      rewrite_same_identity: 4,
      keep_published_pending_source: 6,
      total: 10,
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
