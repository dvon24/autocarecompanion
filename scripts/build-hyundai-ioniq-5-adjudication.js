/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-ioniq-5-adjudication-2026-08-06.json');

const IDS = {
  hda2: 'hyundai-ioniq-5-hda2-lane-centering-2022',
  iccu: 'hyundai-ioniq-5-iccu-failure-causing-loss-drive-power-turtle-mode-no-dc-fast',
  fasteners: 'hyundai-ioniq-5-loose-rear-suspension-fasteners',
  motorBearing: 'hyundai-ioniq-5-motor-bearing-noise-2022',
  parkingPawl: 'hyundai-ioniq-5-parking-pawl-disengagement-vehicle-rollaway',
  tailgate: 'hyundai-ioniq-5-rear-tailgate-rattle-friction-noise-while-driving',
  braking: 'hyundai-ioniq-5-reduced-braking-performance-left-foot-braking-n-e-shift',
  taillight: 'hyundai-ioniq-5-taillight-condensation-2022',
  water: 'hyundai-ioniq-5-water-intrusion-damaging-under-floor-under-seat-wiring-harne',
  battery12v: 'hyundai-ioniq5-12v-battery-drain',
  chargePort: 'hyundai-ioniq5-charge-port-door',
  hvac: 'hyundai-ioniq5-hvac-compressor-noise',
  infotainment: 'hyundai-ioniq5-infotainment-crash',
  suspensionClunk: 'hyundai-ioniq5-suspension-clunk',
};

const SOURCES = {
  iccu: 'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V868-3172.pdf',
  fasteners2025: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V605-2818.pdf',
  fasteners2026: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V314-6650.pdf',
  parkingPawl: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V324-8424.PDF',
  tailgate: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008918-0001.pdf',
  braking: 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V235-5140.pdf',
};

const KEEP_REASONS = {
  [IDS.hda2]: 'A NHTSA vehicle search page, forum thread and video do not establish one Hyundai-defined 2022-2025 HDA 2 lane-centering defect, software remedy or continuing OTA history. No exact Hyundai campaign or bulletin was found, so the row remains byte-for-byte unchanged.',
  [IDS.iccu]: 'Recall 24V-868 establishes ICCU damage, loss of 12-volt charging and possible loss of drive power, but it does not establish the frozen title\'s no-DC-fast-charge outcome or several secondary symptoms and mechanisms. Because the title cannot change, the row remains byte-for-byte unchanged.',
  [IDS.motorBearing]: 'A NHTSA vehicle search page and a non-resolving forum citation do not establish one Hyundai-defined motor-bearing defect, affected motor positions, progression or replacement policy. No exact Hyundai campaign or bulletin was found, so the row remains byte-for-byte unchanged.',
  [IDS.taillight]: 'Hyundai\'s general lighting-condensation guidance distinguishes normal condensation from water intrusion but does not establish an Ioniq 5-specific taillight defect or replacement campaign. The row remains byte-for-byte unchanged.',
  [IDS.water]: 'Two articles about a reported water-damage case do not establish an Ioniq 5 platform defect, harness-clearance design, incidence or five-figure standard remedy. No exact Hyundai primary document was found, so the row remains byte-for-byte unchanged.',
  [IDS.battery12v]: 'A community landing page does not establish the frozen parasitic-draw, Bluelink, battery-sizing or AGM-causation narrative. The ICCU recall is a narrower and different identity and cannot replace this indexed page, so the row remains byte-for-byte unchanged.',
  [IDS.chargePort]: 'A community landing page does not establish one Hyundai-defined charge-port-door actuator or wiring defect, cold-weather scope, manual-release location, costs or warranty policy. No exact Hyundai primary document was found, so the row remains byte-for-byte unchanged.',
  [IDS.hvac]: 'A community landing page does not establish one Hyundai-defined heat-pump compressor bearing or scroll defect, range-loss percentage, software remedy, costs or warranty policy. No exact Hyundai primary document was found, so the row remains byte-for-byte unchanged.',
  [IDS.infotainment]: 'A NHTSA vehicle search page does not establish the frozen dual-screen blackout identity, affected controls, OTA history or hardware-replacement remedy. A BlueLink activation campaign is a different issue, so the row remains byte-for-byte unchanged.',
  [IDS.suspensionClunk]: 'A community landing page does not establish one Hyundai-defined front strut-mount/end-link defect, battery-weight cause, part numbers, torque remedy, costs or warranty policy. No exact Hyundai primary document was found, so the row remains byte-for-byte unchanged.',
};

const HOLD_EVIDENCE = {
  [IDS.iccu]: [{ kind: 'official-related-but-not-identity-complete', url: SOURCES.iccu, verifiedOn: '2026-08-06', observation: 'Recall 24V-868 supports ICCU damage, inability to charge the 12-volt battery and possible loss of drive power, but not the title\'s no-DC-fast-charge outcome.' }],
};

const CARDS = {
  [IDS.fasteners]: {
    years: [2025], severity: 'high', confidence: 'high',
    description: 'Two separate U.S. recalls cover loose rear suspension fasteners on certain 2025 Ioniq 5 vehicles. Recall 25V-605 covers eight vehicles whose rear toe and camber adjustment bolts may have been installed with insufficient torque because of an alignment-stage system error. Recall 26V-314 covers 138 Ioniq 5 vehicles whose specified rear suspension fasteners may have been under-torqued during supplier assembly. The fasteners can loosen, cause rear noise or vibration and potentially detach, reducing vehicle stability or control.',
    solution: 'Check the VIN for both NHTSA recalls 25V-605 (Hyundai 284) and 26V-314 (Hyundai 303). For 25V-605, dealers replace the rear toe and camber bolts and nuts, perform a wheel alignment and replace tires if necessary. For 26V-314, dealers inspect the rear suspension fasteners, replace loose nuts or bolts and perform a rear alignment if necessary. Both remedies are free.',
    symptoms: ['Rattling or vibration from the rear suspension'], affectedSystems: ['Rear suspension fasteners', 'Rear toe and camber adjustment bolts'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Part 573 Report 25V-605 - Ioniq 5 Rear Toe and Camber Bolts', url: SOURCES.fasteners2025 },
      { type: 'recall', title: 'NHTSA Part 573 Report 26V-314 - Ioniq 5 Rear Suspension Fasteners', url: SOURCES.fasteners2026 },
    ],
    summary: 'Kept the indexed loose-rear-fastener identity, replaced news citations with the two exact NHTSA recall reports, separated their populations, causes and remedies, and removed unsupported handling, tire-wear and visual-inspection symptoms.',
  },
  [IDS.parkingPawl]: {
    years: [2022], severity: 'high', confidence: 'high',
    description: 'NHTSA recall 22V-324 covers certain 2022 Ioniq 5 vehicles. A voltage fluctuation while the vehicle is off and in Park can affect the command signal from the Shifter Control Unit to the electronic parking-pawl actuator. The parking pawl can momentarily disengage, allowing the vehicle to roll away and increasing crash or injury risk.',
    solution: 'Check the VIN for NHTSA recall 22V-324 (Hyundai 228). Hyundai dealers update the Shifter Control Unit software free of charge so the parking pawl cannot inadvertently move out of Park while the vehicle is off. Hyundai advised affected owners to use the Electronic Parking Brake when parking until the remedy is completed.',
    symptoms: ['Vehicle may roll away after being placed in Park with the vehicle off'], affectedSystems: ['Shifter Control Unit', 'Electronic parking-pawl actuator'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Part 573 Report 22V-324 - Ioniq 5 Parking-Pawl Rollaway', url: SOURCES.parkingPawl }],
    summary: 'Kept the indexed parking-pawl/rollaway identity, replaced secondary material with the exact Part 573 report, and retained only the documented voltage-fluctuation mechanism, 2022 scope, EPB advisory and free SCU-software remedy.',
  },
  [IDS.tailgate]: {
    years: [2022, 2023, 2024, 2025], severity: 'low', confidence: 'high',
    description: 'Hyundai TSB 24-BD-012H says certain 2022-2025 Ioniq 5 vehicles produced from October 4, 2021 through May 10, 2024 may exhibit rattle and friction noises from the tailgate while driving. The bulletin addresses the gap between the tailgate and vehicle body.',
    solution: 'Ask an Ioniq-certified Hyundai dealer to follow TSB 24-BD-012H. The procedure installs the specified guide-bumper kit and washers, then adjusts the tailgate striker and overslam bumpers as needed so the tailgate-to-body gap no longer produces the noise.',
    symptoms: ['Rattle from the tailgate while driving', 'Friction noise from the tailgate while driving'], affectedSystems: ['Tailgate guide bumpers', 'Tailgate striker and overslam bumpers'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Hyundai TSB 24-BD-012H - Tailgate Rattle and Friction Noise Rework', url: SOURCES.tailgate }],
    summary: 'Kept the indexed tailgate-rattle identity, replaced the forum with the exact Hyundai TSB, expanded the model-year array to the bulletin\'s 2022-2025 scope, and removed unsupported cold-weather and owner-applied tape/Velcro claims.',
  },
  [IDS.braking]: {
    years: [2025], severity: 'high', confidence: 'high',
    description: 'NHTSA recall 25V-235 covers certain 2025 Ioniq 5 N vehicles equipped with Left-Foot Braking and N e-Shift. Integrated Electronic Brake and Vehicle Control Unit software may reduce braking performance when Left-Foot Braking is activated. Separately, the vehicle may continue to accelerate momentarily after the accelerator pedal is released while N e-Shift is engaged. Either condition increases crash risk.',
    solution: 'Check the VIN for NHTSA recall 25V-235 (Hyundai 277), which replaces recall 25V-065. Owners are advised not to use Left-Foot Braking or N e-Shift until the remedy is completed. Hyundai updates the IEB and VCU software over the air or at a dealer free of charge; vehicles repaired under 25V-065 still need the replacement remedy.',
    symptoms: ['Reduced braking performance when Left-Foot Braking is activated', 'Momentary continued acceleration after accelerator-pedal release with N e-Shift engaged'], affectedSystems: ['Integrated Electronic Brake software', 'Vehicle Control Unit software'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall Acknowledgment 25V-235 - Ioniq 5 N Braking and N e-Shift Software', url: SOURCES.braking }],
    summary: 'Kept the indexed Ioniq 5 N LFB/N e-Shift identity, replaced secondary citations with the exact replacement recall, separated the braking and continued-acceleration conditions, and removed unsupported ABS-warning, pedal-feel and speed-calculation claims.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current, ...card, make: 'Hyundai', model: 'Ioniq 5', title: current.title, category: current.category,
    trims: [], engines: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published',
    lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Ioniq 5');
  if (modelRows.length !== 14) throw new Error(`expected 14 Hyundai Ioniq 5 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) throw new Error(`missing Ioniq 5 decision: ${current.id}`);
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id, model: current.model, action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The same indexed component and failure mode stay on the existing ID, title and category; only facts from exact official sources remain.' : 'No content or publication-state changes; a related or secondary source cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit', changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: 'official-record-specific-source', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed identity, scope or remedy.` })) : (HOLD_EVIDENCE[current.id] || []),
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = { rewrite_same_identity: 4, keep_published_pending_source: 10, total: 14 };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Hyundai', model: 'Ioniq 5',
    completionStatement: 'This packet reconciles all fourteen frozen Hyundai Ioniq 5 rows. Four same-identity recall/TSB rewrites are proposed; ten rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All fourteen rows remain published. Ten are byte-for-byte unchanged.',
      'All four rewrites preserve the indexed title and category and use exact Hyundai/NHTSA record-specific deep links.',
      'Every rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no unsupported diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, ioniq5RecordCount: modelRows.length },
    observations: [
      { code: 'four-exact-identities-rewritten', severity: 'independent-review-required', recordIds: [IDS.fasteners, IDS.parkingPawl, IDS.tailgate, IDS.braking], detail: 'Only four rows have exact official sources that support the frozen title/component/failure-mode identity.' },
      { code: 'iccu-title-outcome-unverified', severity: 'independent-review-required', recordIds: [IDS.iccu], detail: 'Recall 24V-868 supports ICCU damage and loss of drive power but not the title\'s no-DC-fast-charge outcome; the row is unchanged.' },
      { code: 'two-fastener-recalls-separated', severity: 'independent-review-required', recordIds: [IDS.fasteners], detail: 'Recall 25V-605 and recall 26V-314 cover different fasteners, populations and causes and are presented separately.' },
      { code: 'ten-broad-or-secondary-rows-frozen', severity: 'independent-review-required', recordIds: Object.keys(KEEP_REASONS), detail: 'Rows backed only by search pages, forums, articles or different-identity campaigns remain byte-for-byte unchanged.' },
    ],
    publicSources: SOURCES, summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { CARDS, HOLD_EVIDENCE, IDS, KEEP_REASONS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewrite };
