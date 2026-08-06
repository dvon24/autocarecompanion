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
  'known-issue-hyundai-santa-fe-adjudication-2026-08-06.json',
);

const IDS = {
  dct: 'hyundai-santa-fe-8-speed-wet-dual-clutch-tcu-failure-rollaway-risk-rough-shif',
  abs: 'hyundai-santa-fe-abs-hecu-module-electrical-short-causing-engine-compartment',
  paint: 'hyundai-santa-fe-clear-coat-white-paint-delamination-peeling',
  cvvt: 'hyundai-santa-fe-cvvt-actuator-2007',
  sunroofShatter: 'hyundai-santa-fe-panoramic-sunroof-spontaneous-shattering',
  subframe: 'hyundai-santa-fe-subframe-corrosion-2007',
  sunroofDrain: 'hyundai-santa-fe-sunroof-drain-clog-2013',
  gdiBearing: 'hyundai-santa-fe-theta-ii-gdi-connecting-rod-bearing-failure-engine-seizure',
  mpiSeizure: 'hyundai-santa-fe-theta-ii-seizure-2010',
  towHarness: 'hyundai-santa-fe-tow-hitch-harness-water-intrusion-causing-electrical-short-f',
  alternator: 'hyundai-santafe-alternator-failure',
  oilConsumption: 'hyundai-santafe-oil-consumption-gdi',
  steering: 'hyundai-santafe-steering-coupler-clunk',
  transferCase: 'hyundai-santafe-transfer-case-leak',
};

const SOURCES = {
  abs: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V056-1184.PDF',
  gdiBearing: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V226-6577.PDF',
  mpiSeizure: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V746-3838.PDF',
  towHarness: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V181-1849.PDF',
  oilConsumption: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10247597-0001.pdf',
};

const KEEP_REASONS = {
  [IDS.dct]:
    'Recall 24V-529 supports the 2024 TCU-logic, transmission-damage and rollaway portion of this combined title, but it does not establish the separate rough-shifting narrative, broader drivability claims or the claimed 2026 product-strategy change. Because the indexed title combines both outcomes, the row remains byte-for-byte unchanged.',
  [IDS.paint]:
    'Articles and an owner forum do not establish one Hyundai-defined Santa Fe clear-coat or white-paint adhesion defect, exact vehicle scope, self-healing-clear-coat mechanism, warranty coverage or repair cost. The row remains byte-for-byte unchanged.',
  [IDS.cvvt]:
    'A generic NHTSA vehicle page and one owner discussion do not establish one CVVT-actuator and oil-control-valve defect, sludge mechanism, DTC set or replacement procedure across 2007-2019 Santa Fe vehicles. The row remains byte-for-byte unchanged.',
  [IDS.sunroofShatter]:
    'Secondary class-action summaries and owner discussions do not establish one Hyundai-defined panoramic-glass defect, exact 2013-2019 Santa Fe scope, stress mechanism, settlement eligibility or repair cost. The row remains byte-for-byte unchanged.',
  [IDS.subframe]:
    'The cited 22V-746 record concerns engine connecting-rod-bearing wear, not rear-subframe corrosion, and the claimed 23-01-017H bulletin has no source URL in the row. A different component or corrosion campaign cannot replace this indexed rear-subframe identity, so the row remains byte-for-byte unchanged.',
  [IDS.sunroofDrain]:
    'A generic NHTSA model page and an unverified placeholder-style owner URL do not establish one Hyundai-defined panoramic-drain clog, disconnected-tube or body-aperture defect or the stated cleaning procedure across 2013-2025 vehicles. The row remains byte-for-byte unchanged.',
  [IDS.alternator]:
    'A forum homepage and generic NHTSA vehicle page do not establish one premature-alternator defect, broad 2007-2018 scope, mileage pattern, diagnostic method or replacement cost. The row remains byte-for-byte unchanged.',
  [IDS.steering]:
    'The row links only to Hyundai and Reddit homepages; the claimed 19-ST-001 record could not be located as an exact Santa Fe intermediate-shaft bulletin. The asserted U-joint mechanism, part number, lubricant workaround and costs therefore remain unverified, and the row stays byte-for-byte unchanged.',
  [IDS.transferCase]:
    'Forum homepages do not establish one Santa Fe PTU output-seal defect, broad 2013-2020 AWD scope, part number, service interval or repair cost. The row remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.abs]: {
    years: [2017, 2018],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 22V-056 (Hyundai recall 218) covers certain model-year 2017-2018 Santa Fe Sport and Santa Fe vehicles not equipped with Smart Cruise Control. The ABS module can malfunction internally and cause an electrical short over time. Significant overcurrent can increase the risk of an engine-compartment fire while the vehicle is parked or being driven. Hyundai stated that it was still investigating the root cause in the Part 573 filing.',
    solution:
      'Check the VIN for NHTSA recall 22V-056 and park the vehicle outside and away from structures until the remedy is complete. Hyundai dealers replace the ABS multi-fuse with a revised, lower-amperage fuse to limit module operating current, free of charge.',
    symptoms: [
      'Smoke from the engine compartment',
      'Burning or melting odor',
      'Malfunction Indicator Lamp illumination',
      'ABS warning-light illumination',
    ],
    affectedSystems: ['Anti-lock Brake System module', 'ABS multi-fuse'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 22V-056 - Santa Fe ABS Module Electrical Short',
        url: SOURCES.abs,
      },
    ],
    summary:
      'Kept the indexed ABS/HECU electrical-short/fire identity, narrowed the scope to the exact 2017-2018 populations in 22V-056, and removed the unsupported brake-fluid-leak cause.',
  },
  [IDS.gdiBearing]: {
    years: [2013, 2014],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 17V-226 (Hyundai recall 162) covers certain model-year 2013-2014 Santa Fe Sport vehicles equipped with 2.0-liter or 2.4-liter gasoline-direct-injection engines. Residual debris from factory machining can restrict oil flow to the main bearings and cause premature bearing wear. A worn connecting-rod bearing can produce cyclic engine knock or illuminate the oil-pressure lamp; if the bearing fails, the vehicle can lose motive power while moving.',
    solution:
      'Check the VIN for NHTSA recall 17V-226. Hyundai dealers inspect the engine and replace the engine sub-assembly, also described as the short block, if necessary.',
    symptoms: [
      'Cyclic knocking noise from the engine',
      'Reduced power or hesitation',
      'Check Engine warning-light illumination',
      'Engine oil-pressure warning-light illumination',
      'Engine stall or loss of motive power',
    ],
    affectedSystems: ['Theta II GDI engine', 'Main bearings', 'Connecting-rod bearings'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 17V-226 - Santa Fe Sport Theta II GDI Bearings',
        url: SOURCES.gdiBearing,
      },
    ],
    summary:
      'Kept the indexed Theta II GDI connecting-rod-bearing/failure identity, replaced the unrelated 20V-746 citation with exact recall 17V-226, and narrowed the scope to 2013-2014 Santa Fe Sport vehicles.',
  },
  [IDS.mpiSeizure]: {
    years: [2012],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 20V-746 (Hyundai recall 198) covers certain model-year 2012 Santa Fe vehicles equipped with the 2.4-liter Theta II MPI engine. Conditions in the engine can cause premature connecting-rod-bearing wear. Continued operation with a worn bearing can damage the engine and eventually stall the vehicle; in limited cases, a damaged connecting rod can puncture the engine block, release oil onto hot components and increase fire risk.',
    solution:
      'Check the VIN for NHTSA recall 20V-746. Hyundai dealers inspect the engine for bearing damage, replace the engine if damage is found, and install an enhanced engine-control-software update containing the Knock Sensor Detection System, free of charge.',
    symptoms: [
      'Abnormal knocking noise from the engine',
      'Reduced motive power or hesitation',
      'Check Engine warning-light illumination',
      'Engine oil-pressure warning-light illumination',
      'Burning smell, visible oil leak or smoke',
      'Engine stall',
    ],
    affectedSystems: ['2.4-liter Theta II MPI engine', 'Connecting-rod bearings'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 20V-746 - 2012 Santa Fe Theta II MPI Engine',
        url: SOURCES.mpiSeizure,
      },
    ],
    summary:
      'Kept the indexed Theta II engine-failure/recall identity, replaced unsupported secondary citations with exact recall 20V-746, and limited the row to its 2012 Santa Fe 2.4-liter MPI population.',
  },
  [IDS.towHarness]: {
    years: [2019, 2020, 2021, 2022, 2023],
    severity: 'high',
    confidence: 'high',
    description:
      'NHTSA recall 23V-181 (Hyundai recall 244) covers model-year 2019-2023 Santa Fe vehicles that may have a Hyundai accessory tow-hitch harness, including listed hybrid and plug-in-hybrid populations. The tow-hitch-harness module circuit board can be susceptible to water entering through the 4-pin tow-hitch harness connector. An electrical short can cause a trailer-harness-module fire while driving or while parked with the ignition off.',
    solution:
      'Check the VIN for NHTSA recall 23V-181 and park the vehicle outside and away from structures until the remedy is complete. Hyundai dealers verify whether the accessory tow hitch is installed and fit a 15-ampere fuse and new wire-extension kit as necessary, free of charge. The filing also describes fuse removal as interim protection until the final remedy is completed.',
    symptoms: ['No advance warning identified in the Part 573 report'],
    affectedSystems: ['Accessory tow-hitch harness', 'Tow-hitch harness module', '4-pin harness connector'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Part 573 Report 23V-181 - Santa Fe Tow-Hitch Harness',
        url: SOURCES.towHarness,
      },
    ],
    summary:
      'Kept the indexed tow-hitch-harness/water-ingress/fire identity, replaced secondary citations with exact recall 23V-181, and retained only its documented accessory scope, no-warning condition and remedy sequence.',
  },
  [IDS.oilConsumption]: {
    years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
    severity: 'medium',
    confidence: 'high',
    description:
      'Hyundai TSB 23-EM-008H provides inspection and repair guidance for vehicles with engine-oil-consumption concerns. Its parts and labor tables include model-year 2013-2018 Santa Fe Sport and 2019-2020 Santa Fe vehicles with the 2.4-liter GDI engine. The bulletin notes that some oil consumption is normal and does not assign one universal cause; it directs technicians to resolve leaks, abnormal engine noise, relevant campaigns or diagnostic faults before measuring consumption.',
    solution:
      'Ask a Hyundai dealer to follow TSB 23-EM-008H and confirm warranty or goodwill eligibility. After preliminary checks, the procedure uses fresh oil, seals the drain plug and filter, and measures use over at least 1,000 miles. A result above 1,000 miles per quart passes; a result under 1,000 miles per quart proceeds to prior-approval review for combustion-chamber cleaning. Engine replacement is considered only after the cleaning and final retest remain outside specification and prior approval is obtained.',
    symptoms: ['Engine-oil level decreases between checks', 'Measured consumption under 1,000 miles per quart'],
    affectedSystems: ['Engine lubrication system', 'Combustion chambers'],
    dtcCodes: [],
    citations: [
      {
        type: 'tsb',
        title: 'Hyundai TSB 23-EM-008H - Engine Oil Consumption Inspection and Repair Guidelines',
        url: SOURCES.oilConsumption,
      },
    ],
    summary:
      'Kept the indexed 2.4-liter-GDI oil-consumption identity, replaced generic sources with Hyundai TSB 23-EM-008H, and removed invented DTCs, universal carbon-cause language, automatic replacement entitlement, costs and product advice.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Santa Fe',
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
    (row) => row.make === 'Hyundai' && row.model === 'Santa Fe',
  );
  if (modelRows.length !== 14) {
    throw new Error(`expected 14 Hyundai Santa Fe rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Santa Fe decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed component and failure outcome stay on the existing ID, title and category; only facts within the exact official record remain.'
        : 'No content or publication-state changes; secondary, partial or different-identity evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind: item.type === 'tsb' ? 'official-record-specific-tsb' : 'official-record-specific-recall',
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
    model: 'Santa Fe',
    completionStatement:
      'This packet reconciles all fourteen frozen Hyundai Santa Fe rows. Five same-identity official-source rewrites are proposed; nine rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All fourteen rows remain published. Nine are byte-for-byte unchanged.',
      'Each rewrite preserves the indexed ID, title and category and uses one exact Hyundai or NHTSA primary record.',
      'Rewrites contain zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      santaFeRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'five-exact-official-rewrites',
        severity: 'independent-review-required',
        recordIds: Object.keys(CARDS),
        detail:
          'Exact Part 573 reports support the ABS, two engine-bearing and tow-harness identities; Hyundai TSB 23-EM-008H supports the oil-consumption inspection identity without changing titles or categories.',
      },
      {
        code: 'three-engine-identities-separated',
        severity: 'high',
        recordIds: [IDS.gdiBearing, IDS.mpiSeizure, IDS.oilConsumption],
        detail:
          'The packet keeps the 2013-2014 GDI bearing recall, 2012 MPI bearing recall, and 2013-2019 2.4-liter-GDI oil-consumption service path on separate indexed records and exact sources.',
        sourceUrls: [SOURCES.gdiBearing, SOURCES.mpiSeizure, SOURCES.oilConsumption],
      },
      {
        code: 'abs-cause-corrected',
        severity: 'high',
        recordIds: [IDS.abs],
        detail:
          'Recall 22V-056 says the ABS module can malfunction internally and that Hyundai was still investigating root cause; it does not attribute this population to an internal brake-fluid leak.',
        sourceUrls: [SOURCES.abs],
      },
      {
        code: 'nine-partial-or-unsupported-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'The combined DCT title and eight secondary, generic, mismatched or unsupported narratives remain byte-for-byte unchanged.',
      },
    ],
    publicSources: SOURCES,
    summary: {
      rewrite_same_identity: 5,
      keep_published_pending_source: 9,
      total: 14,
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
