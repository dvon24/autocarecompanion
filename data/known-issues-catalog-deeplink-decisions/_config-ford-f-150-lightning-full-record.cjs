const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'manual',
      summary: card.summary,
    },
  };
}

function recall(title, url) {
  return { type: 'recall', title, url };
}

const published = {
  'ford-f-150-lightning-high-voltage-battery-junction-box-bus-bar-loose-fasteners-ar': replacement(
    {
      years: [2023],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Recall 24S11: High-Voltage Battery Bus-Bar Nuts Can Be Loose or Missing',
      description:
        'Ford recall 24S11, filed as NHTSA campaign 24V144 and later expanded under 25V272, covers certain 2023 F-150 Lightning trucks. A missing or loose retention nut at a high-voltage battery junction-box bus-bar joint can create high resistance and electrical arcing, trigger DTCs, disable the high-voltage system, and cause loss of motive power without restart.',
      solution:
        'Check the VIN for Ford recall 24S11. A trained Ford EV dealer removes the high-voltage battery, inspects and torque-checks the covered bus-bar fasteners, and replaces missing nuts and affected bus-bar, junction-box, or connector components when required. Recall work is free; this is not a do-it-yourself high-voltage repair.',
      severity: 'high',
      symptoms: ['Stop Safely Now message', 'Loss of motive power', 'Vehicle will not restart', 'Possible high-voltage system DTCs'],
      affectedSystems: ['high-voltage battery junction box', 'battery bus bars', 'bus-bar retention nuts'],
      sources: [
        recall('Ford Recall 24S11 / NHTSA Campaign 24V144 Chronology', 'https://static.nhtsa.gov/odi/rcl/2024/RMISC-24V144-0704.pdf'),
        recall('Ford Recall 24S11-S2 / NHTSA Campaign 25V272 Dealer Procedure', 'https://static.nhtsa.gov/odi/rcl/2025/RCMN-25V272-6534.pdf'),
      ],
      summary:
        'Retained the exact 2023 VIN-scoped high-voltage bus-bar fastener recall, loss-of-power mechanism, and trained-dealer inspection/repair procedure.',
    },
    'Retain the primary-source 24S11/24V144 condition and its 25V272 expansion while removing third-party and forum citations.',
  ),

  'ford-f-150-lightning-windshield-wiper-motor-circuit-board-failure': replacement(
    {
      years: [2022],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Recall 22S71: Windshield Wiper Motor Can Fail',
      description:
        'NHTSA campaign 22V842 covers certain 2022 F-150 trucks, including affected F-150 Lightning vehicles. The front windshield wiper motor can become inoperative or make the wipers operate erratically or stop, reducing forward visibility in rain or snow.',
      solution:
        'Check the VIN for Ford recall 22S71. A Ford dealer will inspect and replace the front windshield wiper motor as required free of charge. If wiper operation becomes unreliable before repair, avoid driving in conditions that require the wipers and contact a dealer.',
      severity: 'high',
      symptoms: ['Wipers stop working', 'Wipers operate erratically', 'Reduced or lost forward visibility in rain or snow'],
      affectedSystems: ['front windshield wiper motor', 'windshield wipers'],
      sources: [recall('Ford Recall 22S71 / NHTSA Campaign 22V842 Owner Notice', 'https://static.nhtsa.gov/odi/rcl/2022/RCONL-22V842-8670.pdf')],
      summary:
        'Replaced the mixed secondary-source card with Ford\'s exact 2022 VIN-gated wiper-motor recall and inspection/replacement remedy.',
    },
    'Retain the exact Ford/NHTSA 22S71 safety recall and remove third-party citations and out-of-warranty purchase advice.',
  ),

  'ford-lightning-front-control-arm-2023': replacement(
    {
      years: [2023, 2024, 2025],
      trims: ['Certain vehicles identified by VIN'],
      category: 'suspension',
      title: 'Recall 24S76: Front Upper Control Arm Can Separate',
      description:
        'NHTSA campaigns 24V949 and 25V341 cover different VIN populations of 2023-2025 F-150 Lightning trucks under Ford recall 24S76. An improperly tightened or missing front upper-control-arm ball-joint nut can allow the control arm to separate from the steering knuckle and cause loss of steering control.',
      solution:
        'Check the VIN for Ford recall 24S76 rather than relying on model year alone. Ford dealers inspect the upper-control-arm ball-joint nut and replace the nut and/or steering-knuckle assembly as necessary free of charge. Stop driving and arrange service if separation, severe looseness, or loss of directional control is suspected.',
      severity: 'high',
      symptoms: ['Possible front suspension clunk or looseness', 'Loss of steering control if the control arm separates'],
      affectedSystems: ['front upper control arm', 'ball-joint nut', 'steering knuckle'],
      sources: [
        recall('NHTSA Campaign 24V949 / Ford Recall 24S76', 'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V949-7404.pdf'),
        recall('NHTSA Campaign 25V341 / Ford Recall 24S76 Expansion', 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V341-4864.pdf'),
      ],
      summary:
        'Updated the frozen 2023-2024 forum-only card to the two primary NHTSA populations spanning 2023-2025 and the exact nut/knuckle dealer remedy.',
    },
    'Retain the current 24S76 safety recall using both NHTSA populations and remove unsupported tire-wear and owner-inspection claims.',
  ),

  'ford-lightning-hv-battery-short-2022': replacement(
    {
      years: [2022, 2023, 2024],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Recall 25S18: Misaligned High-Voltage Battery Electrodes Can Short',
      description:
        'NHTSA campaign 25V131 covers certain 2022-2024 F-150 Lightning trucks. A supplier manufacturing deviation can leave electrodes misaligned within some high-voltage battery cells. Repeated charging can produce an internal short circuit and increase the risk of a battery fire.',
      solution:
        'Check the VIN for Ford recall 25S18 and follow the current Ford notice. Until the recall repair is complete, Ford advises affected owners to limit maximum state of charge to 80 percent. A trained Ford EV dealer inspects the battery and replaces affected battery arrays or, in limited cases, the high-voltage battery free of charge. Do not open or service the battery pack yourself.',
      severity: 'high',
      symptoms: ['The defect may provide no warning before an internal short', 'Possible high-voltage battery warning', 'Possible heat, smoke, or fire from the battery area'],
      affectedSystems: ['high-voltage battery cells', 'battery arrays', 'traction battery pack'],
      sources: [
        recall('Ford Recall 25S18 / NHTSA Campaign 25V131 Dealer Notice', 'https://static.nhtsa.gov/odi/rcl/2025/RCMN-25V131-0013.pdf'),
        recall('Ford Recall 25S18 / NHTSA Campaign 25V131 Chronology', 'https://static.nhtsa.gov/odi/rcl/2025/RMISC-25V131-6133.pdf'),
      ],
      summary:
        'Replaced the forum citation with Ford/NHTSA primary records for the 2022-2024 electrode-misalignment population, 80-percent interim limit, and dealer battery repair.',
    },
    'Retain the exact 25S18/25V131 safety recall while removing unsupported park-outside and symptom claims not stated as campaign instructions.',
  ),

  'ford-lightning-park-module-rollaway-2022': replacement(
    {
      years: [2022, 2023, 2024, 2025, 2026],
      trims: ['Certain vehicles identified by VIN'],
      category: 'drivetrain',
      title: 'Recall 25C69: Integrated Park Module May Not Lock in Park',
      description:
        'NHTSA campaign 25V863 covers certain 2022-2026 F-150 Lightning trucks. The integrated park module may fail to lock into the Park position when Park is selected. If Park is not engaged and the parking brake does not hold or is released, the vehicle can roll away.',
      solution:
        'Check the VIN for Ford recall 25C69. Until the remedy is confirmed, verify that the Park indicator is illuminated and apply the parking brake whenever leaving the vehicle. Ford provides an integrated-park-module software update over the air or through a dealer free of charge.',
      severity: 'high',
      symptoms: ['Park indicator may not illuminate', 'Wrench light or shift-system fault message', 'Vehicle may roll after Park is selected'],
      affectedSystems: ['integrated park module', 'park-lock function', 'parking brake'],
      sources: [recall('NHTSA Campaign 25V863 / Ford Recall 25C69', 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V863-3736.pdf')],
      summary:
        'Updated the frozen 2022-2024 forum-only card to the exact 2022-2026 NHTSA population, rollaway condition, interim parking check, and software remedy.',
    },
    'Retain the current NHTSA 25V863 noncompliance recall and remove generic hardware-failure language.',
  ),
};

const reasons = {
  'ford-f-150-lightning-12v-battery-undercharge-parasitic-drain-plug-to-maintain-12v':
    'The frozen card combines undercharge, parasitic drain, charging-system faults, software behavior, battery replacement, and owner workarounds across four model years using only owner forums. No exact Ford bulletin or campaign reviewed defines one failure mechanism and remedy.',
  'ford-f-150-lightning-charge-port-door-latch-sticking-freezing-failing-to-open-clo':
    'The frozen card relies entirely on owner forums and combines freezing, sticking, broken latch hardware, alignment, lubrication, and replacement across every 2022-2025 truck without a Ford-defined population or repair.',
  'ford-f-150-lightning-failed-over-air-software-update-bricks-truck':
    'The frozen card treats multiple forum reports of failed over-the-air updates and no-start states as one defect across every 2022-2025 truck. It identifies no exact software release, module, campaign, DTC set, or Ford remedy.',
  'ford-f-150-lightning-sync-4-apim-infotainment-screen-blackout-backup-camera-failu':
    'The frozen card combines infotainment blackouts with safety-camera failure across four model years using only forums. It does not identify one Ford bulletin or NHTSA campaign, software level, module fault, or remedy.',
  'ford-f-150-lightning-water-intrusion-frunk-firewall-seam-pillar-sunroof-drain-lea':
    'The frozen card aggregates several distinct leak paths and body configurations from owner forums and proposes seam sealer, drain work, glass service, and module inspection without an exact Ford primary source.',
  'ford-lightning-dc-fast-charge-fault-2022':
    'The frozen card relies only on two owner-forum threads and combines charger compatibility, thermal limits, vehicle hardware, network behavior, reduced speed, and charge faults across three model years without a Ford-defined defect and remedy.',
};

module.exports = buildConfig({
  label: 'Ford F-150 Lightning',
  make: 'Ford',
  model: 'F-150 Lightning',
  slug: 'ford-f-150-lightning',
  batchId: 'ford-f-150-lightning-full-record-cohort-115-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '3c635ac92d44ace8f4f4d5b0a435e83d6687dbe5056d0f50aff9b629bc81cc62',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-f-150-lightning/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordf150lightning_blind:manual-primary-source-gate',
    edge: 'fordf150lightning_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
