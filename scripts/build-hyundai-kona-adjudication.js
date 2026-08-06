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
  'known-issue-hyundai-kona-adjudication-2026-08-06.json',
);

const IDS = {
  battery12v: 'hyundai-kona-12v-auxiliary-battery-repeated-drain-dead-car-no-start',
  cable: 'hyundai-kona-12v-battery-cable-chafing-against-ecm-bracket-short-circuit',
  piston: 'hyundai-kona-2-0l-nu-mpi-piston-ring-defect-causing-knocking-engine-seizu',
  ac: 'hyundai-kona-ac-compressor-noise-2018',
  ivt: 'hyundai-kona-cvt-judder',
  dct: 'hyundai-kona-dct-shudder',
  batteryFire: 'hyundai-kona-electric-battery-recall',
  epcu: 'hyundai-kona-epcu-coolant-leak-causing-loss-drive-power',
  infotainment: 'hyundai-kona-infotainment-black-frozen-screen-apple-carplay-bluetooth-dis',
  oilDilution: 'hyundai-kona-oil-dilution-2018',
  paint: 'hyundai-kona-paint-peeling-2018',
  sunroof: 'hyundai-kona-panoramic-sunroof-leak',
  fastCharge: 'hyundai-kona-reduced-dc-fast-charging-speed-bms-check-ev-system-charging',
};

const SOURCES = {
  cable: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V901-8581.PDF',
  piston: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V301-4965.PDF',
  batteryFire: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V127-1095.PDF',
  epcu: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V941-1708.PDF',
  dctNearMatch: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10213721-0001.pdf',
  transmissionTypes: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10196546-0001.pdf',
  ivtScope: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10241878-0001.pdf',
};

const KEEP_REASONS = {
  [IDS.battery12v]:
    'Three owner-forum threads do not establish one Hyundai-defined 2019-2023 repeated 12-volt drain defect, software cause or battery-saver remedy. The EPCU and high-voltage battery campaigns are different identities, so this row remains byte-for-byte unchanged.',
  [IDS.ac]:
    'Two NHTSA complaint landing links do not establish one Kona compressor, clutch-bearing and system-contamination defect across both gasoline engines or validate the multi-component repair and cost narrative. No exact Hyundai bulletin was found, so the row remains byte-for-byte unchanged.',
  [IDS.ivt]:
    'The cited 21-AT-005 record was not found as an exact Kona IVT judder bulletin. Hyundai bulletin 21-AT-006H lists the 2018-onward Kona 2.0L under six-speed ATF, while 23-AT-010H first lists 2022-onward Kona IVT applications and addresses oil-pressure-sensor DTCs rather than the indexed judder-and-droning identity. The row remains byte-for-byte unchanged.',
  [IDS.dct]:
    'Hyundai bulletin 22-AT-007H supports low-speed judder on 2018-2021 Kona 1.6T 7DCT vehicles, but it does not establish the indexed delayed-engagement outcome or the frozen 2022-2023 scope. A partial identity match cannot replace the page, so the row remains byte-for-byte unchanged.',
  [IDS.infotainment]:
    'Forum and vendor pages do not establish one Hyundai-defined black-screen, frozen-screen, CarPlay and Bluetooth defect across 2018-2025 Kona, Kona N and Kona Electric variants or validate the stated bulletin and reset procedure. The row remains byte-for-byte unchanged.',
  [IDS.oilDilution]:
    'A generic NHTSA vehicle page and an unverifiable community URL do not establish the frozen cold-weather short-trip fuel-dilution mechanism, maintenance interval, oil specification or repair guidance for 2018-2023 Kona 1.6T vehicles. The row remains byte-for-byte unchanged.',
  [IDS.paint]:
    'A generic NHTSA vehicle page, community post and video do not establish one factory paint or clear-coat defect, color pattern, early-life rate or warranty remedy for 2018-2023 Kona vehicles. No exact Hyundai Kona paint bulletin was found, so the row remains byte-for-byte unchanged.',
  [IDS.sunroof]:
    'Generic forum landing pages do not establish one panoramic-sunroof drain-tube or gasket defect, incidence timeline, electrical consequence or repair procedure for 2018-2023 Kona vehicles. The row remains byte-for-byte unchanged.',
  [IDS.fastCharge]:
    'Forum and vendor evidence does not establish one combined DC-fast-charge-speed and BMS warning defect across 2019-2023 Kona Electric vehicles. Hyundai battery-diagnostic campaigns are different identities and do not validate the frozen thermal-throttling and charge-control-module narrative, so the row remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.cable]: {
    years: [2024],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 23V-901 covers 10,984 model-year 2024 Kona vehicles equipped with 1.6T-GDI engines. During a frontal crash, the engine control module bracket can contact and damage the 12-volt positive battery wiring, causing an electrical short. A short can increase the risk of a post-crash engine-compartment fire.',
    solution:
      'Check the VIN for NHTSA recall 23V-901 (Hyundai 252). Hyundai dealers install protective sheathing over the 12-volt positive and alternator wiring connected to the engine-compartment junction block, free of charge.',
    symptoms: ['Smoke from the engine compartment after a crash', 'Burning or melting odor'],
    affectedSystems: [
      '12-volt positive battery wiring',
      'Alternator wiring',
      'Engine control module bracket',
    ],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 23V-901 - 2024 Kona 12-Volt Positive Wiring',
        url: SOURCES.cable,
      },
    ],
    summary:
      'Kept the indexed 12-volt-cable/ECM-bracket/fire identity, replaced secondary citations with the exact Part 573 report, and limited the defect to the documented frontal-crash condition and remedy.',
  },
  [IDS.piston]: {
    years: [2019, 2020, 2021],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 21V-301 covers 95,223 model-year 2019-2021 Kona vehicles equipped with 2.0-liter Nu MPI engines. Inconsistent nitride heat treatment can make a piston oil ring excessively hard, allowing its outer edge to chip and scuff the cylinder bore. Resulting oil consumption and engine damage can cause knocking, reduced power or hesitation, warning lights and, with continued operation, a seized connecting-rod bearing, engine stall or an oil-fed fire.',
    solution:
      'Check the VIN for NHTSA recall 21V-301 (Hyundai 203). Hyundai dealers inspect the engine for cylinder-bore and piston-skirt damage, replace the engine if qualifying damage is found, and install enhanced Piston Noise Sensing System software, free of charge.',
    symptoms: [
      'Abnormal engine knocking noise',
      'Reduced motive power or hesitation',
      'Check Engine warning lamp',
      'Engine oil-pressure warning lamp',
      'Burning smell, oil leakage or smoke',
    ],
    affectedSystems: ['2.0-liter Nu MPI engine', 'Piston oil rings', 'Cylinder bores'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 21V-301 - Kona 2.0L Nu MPI Piston Oil Rings',
        url: SOURCES.piston,
      },
    ],
    summary:
      'Kept the indexed piston-ring/knock/seizure identity, retained the exact 2019-2021 Kona 2.0L scope, replaced secondary sources with the Part 573 report, and removed the unsupported P1326 and generic no-start claims.',
  },
  [IDS.batteryFire]: {
    years: [2019, 2020],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 21V-127 covers 4,694 model-year 2019-2020 Kona Electric vehicles that did not receive a battery replacement under Hyundai recall 196. A folded anode tab in an LG Energy Solutions battery cell can allow lithium plating to contact the cathode, causing an internal electrical short. The short can increase fire risk while the vehicle is parked, charging or being driven.',
    solution:
      'Check the VIN for NHTSA recall 21V-127 (Hyundai 200). Hyundai dealers replace the Battery System Assembly free of charge. The recall also specified an interim state-of-charge reduction; affected owners should follow Hyundai\'s current VIN-specific instructions and avoid indoor parking if they cannot complete the interim step before dealer service.',
    symptoms: ['Smoke', 'Burning or melting odor', 'Malfunction Indicator Lamp or battery light'],
    affectedSystems: ['High-voltage Battery System Assembly', 'Lithium-ion battery cells'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 21V-127 - Kona Electric Battery Cell Short Circuit',
        url: SOURCES.batteryFire,
      },
    ],
    summary:
      'Kept the indexed high-voltage-battery/fire identity, corrected the unrelated 21V-193 campaign to 21V-127, narrowed scope to the documented 2019-2020 U.S. population, and removed unsupported global-count, repair-time and charging claims.',
  },
  [IDS.epcu]: {
    years: [2021],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 22V-941 covers 853 model-year 2021 Kona EV vehicles. Insufficient sealing of the Electric Power Control Unit (EPCU) DC-DC converter housing can allow an internal coolant leak and contaminate the EPCU main controller. The contamination can trigger limited-mobility fail-safe mode or, in limited instances, cause sudden loss of motive power or a vehicle stall.',
    solution:
      'Check the VIN for NHTSA recall 22V-941 (Hyundai 239). Hyundai dealers inspect the EPCU and replace it if necessary, free of charge.',
    symptoms: [
      'Malfunction Indicator Lamp illumination',
      'Check Electric Vehicle System warning message',
      'Limited-mobility fail-safe mode',
      'Sudden loss of motive power or vehicle stall',
    ],
    affectedSystems: ['Electric Power Control Unit', 'EPCU DC-DC converter housing'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 22V-941 - Kona EV EPCU Coolant Leak',
        url: SOURCES.epcu,
      },
    ],
    summary:
      'Kept the indexed EPCU/coolant-leak/loss-of-power identity, replaced secondary sources with the exact Part 573 report, and retained only the documented population, warnings and dealer remedy.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Kona',
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
    (row) => row.make === 'Hyundai' && row.model === 'Kona',
  );
  if (modelRows.length !== 13) {
    throw new Error(`expected 13 Hyundai Kona rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Kona decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component, failure mechanism and outcome stay on the existing ID, title and category; only facts from the exact official record remain.'
        : 'No content or publication-state changes; partial, secondary or different-identity evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind: 'official-record-specific-primary',
            url: item.url,
            verifiedOn: '2026-08-06',
            observation: `${item.title} supports the proposed identity, scope and remedy.`,
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
    model: 'Kona',
    completionStatement:
      'This packet reconciles all thirteen frozen Hyundai Kona rows. Four same-identity recall rewrites are proposed; nine rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All thirteen rows remain published. Nine are byte-for-byte unchanged.',
      'All four rewrites preserve the indexed title and category and use exact official record-specific deep links.',
      'Every rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no unsupported diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      konaRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'four-exact-recalls-rewritten',
        severity: 'independent-review-required',
        recordIds: [IDS.cable, IDS.piston, IDS.batteryFire, IDS.epcu],
        detail:
          'Only four rows have exact official records supporting the frozen component, failure mode and title outcome.',
      },
      {
        code: 'false-21v193-corrected',
        severity: 'independent-review-required',
        recordIds: [IDS.batteryFire],
        detail:
          'The frozen battery-fire narrative named 21V-193, which is not a Hyundai campaign. The exact U.S. Kona Electric battery-cell campaign is 21V-127.',
      },
      {
        code: 'transmission-rows-frozen',
        severity: 'independent-review-required',
        recordIds: [IDS.ivt, IDS.dct],
        detail:
          'Official Hyundai bulletins expose year and outcome mismatches in both transmission rows, so neither receives a partial rewrite.',
        sourceUrls: [SOURCES.dctNearMatch, SOURCES.transmissionTypes, SOURCES.ivtScope],
      },
      {
        code: 'nine-secondary-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'Nine broad, secondary-only or partial-identity narratives remain byte-for-byte unchanged pending exact same-identity Hyundai evidence.',
      },
    ],
    publicSources: SOURCES,
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
  IDS,
  KEEP_REASONS,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewrite,
};
