const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const sources = {
  display: source('tsb', 'GM Preliminary Information PIT6018C - Blank IPC and Radio After a Discharged Battery Event', 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242291-9999.pdf'),
  rearDrive: source('recall', 'NHTSA Recall 24V-320 / GM N242447080 - Rear Drive Unit Wire Insulation', 'https://static.nhtsa.gov/odi/rcl/2024/RCONL-24V320-5779.pdf'),
};

const cards = {
  display: {
    years: [2024],
    trims: ['Infotainment system RPO IVD'],
    category: 'electrical',
    title: 'Low Voltage or a Failed Update Can Leave the IPC and Radio Blank (PIT6018C)',
    description: 'GM preliminary information PIT6018C applies to 2024 Silverado EV trucks with infotainment RPO IVD. After a discharged-battery event, low voltage or a failed update can leave the instrument-panel display and radio blank, remove audio or show an update-failed message. The document does not establish random reboots across 2024-2026 or automatic control-module failure.',
    solution: 'Use an EV-qualified GM service facility. PIT6018C directs technicians to disconnect and fully charge the battery, recheck operation, and follow its SPS2/USB software-recovery procedure for the display state present. If recovery does not resolve the condition or codes remain, continue with published diagnostics rather than automatically replacing the radio.',
    severity: 'high',
    symptoms: ['Blank instrument-panel display', 'Blank radio display', 'No audio', 'Update-failed message after a discharged battery event'],
    affectedSystems: ['instrument-panel display', 'A11 radio software', '12-volt power and update recovery'],
    sources: [sources.display],
    summary: 'Replaced the uncited 2024-2026 random-reboot claim with PIT6018C\'s exact 2024 IVD low-voltage/failed-update condition and staged recovery procedure.',
  },
  rearDrive: {
    years: [2024],
    category: 'drivetrain',
    title: 'Rear Drive Unit Wire Insulation Can Allow Sudden Propulsion Loss (Recall 24V-320)',
    description: 'NHTSA recall 24V-320 (GM N242447080) includes a small number of 2024 Silverado EVs. Wires inside the rear drive-unit electric motor may be insufficiently insulated and contact one another. If that occurs, the rear drive motor can shut down and the vehicle can lose propulsion. This recall is not a towing-only thermal derate and does not support the former guessed DTCs.',
    solution: 'Check the VIN at NHTSA.gov/Recalls or with a Chevrolet EV-certified dealer. If recall 24V-320 remains open, the dealer remedy is replacement of the rear drive unit at no charge. Do not attempt high-voltage drive-unit work or substitute cooling-system, gear-oil or gasket repairs for this recall.',
    severity: 'high',
    symptoms: ['Sudden loss of propulsion if rear drive-unit motor wires contact', 'VIN is included in recall 24V-320'],
    affectedSystems: ['rear electric drive unit', 'drive-motor wire insulation'],
    sources: [sources.rearDrive],
    summary: 'Replaced the Reddit towing-derate theory with safety recall 24V-320, its exact 2024 VIN population, wire-insulation defect and rear-drive-unit replacement remedy.',
  },
};

const published = {
  'chevrolet-silverado-ev-infotainment-reboot': replacement(cards.display, 'Replace the uncited random-reboot and module-replacement claim with PIT6018C for the exact blank-display/no-audio condition after a discharged battery or failed update.'),
  'chevy-silverado-ev-propulsion-reduced-2024': replacement(cards.rearDrive, 'Replace the unsupported towing thermal-derate theory, guessed DTCs and unrelated parts with recall 24V-320 for the actual rear-drive-unit insulation defect and propulsion-loss risk.'),
};

const reasons = {
  'chevrolet-silverado-ev-charge-port': 'The frozen card mixes a rear-port design article, general charging discussions and forum anecdotes, then claims a sticking actuator, software fix and emergency-release procedure across 2024-2026. No GM campaign or bulletin was located that supports that complete charge-door failure mechanism or remedy.',
  'chevrolet-silverado-ev-range-cold': 'Cold-weather energy use varies with temperature, speed, battery conditioning, cabin heat and trip length; the frozen card treats a fixed 30-40 percent estimate as a Silverado EV defect and recommends unrelated 12-volt batteries and a maintainer. It is an operating characteristic, not a verified failure card.',
  'chevy-silverado-ev-charging-fault-2024': 'The frozen Level-2 charging card relies on an unverified video, assigns two DTCs and a protocol-timing cause, promises software resolution and promotes relays, a meter and EVSE without a matched GM document. Charging interruptions require vehicle-and-EVSE diagnostics before assigning an onboard-module defect.',
};

module.exports = buildConfig({
  label: 'Chevrolet Silverado EV',
  make: 'Chevrolet',
  model: 'Silverado EV',
  slug: 'chevrolet-silverado-ev',
  batchId: 'chevrolet-silverado-ev-full-record-cohort-35-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'f77fb8e13bfd6dd9a933d5127da25e51bbec12d110712e8a516fcb26b423d2e9',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-silverado-ev/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletsilveradoev_blind:manual-primary-source-gate',
    edge: 'chevroletsilveradoev_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
