const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: 'high',
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Genesis&model=GV60&modelYear=${year}`;

const published = {
  'genesis-gv60-12v-battery-drain': replacement(
    {
      years: [2023, 2024, 2025],
      category: 'electrical',
      title: 'ICCU 12-Volt Charging and Power-Loss Recall',
      description: 'NHTSA campaign 24V868 covers certain 2023-2025 Genesis GV60 vehicles. The integrated charging control unit can become damaged and stop charging the 12-volt battery, which can cause loss of drive power.',
      solution: 'Check the VIN with Genesis. Dealers inspect and replace the ICCU and its fuse as necessary and update ICCU software free of charge. This campaign replaces 24V204, so vehicles repaired previously need the new remedy. A charging warning or power loss requires prompt service.',
      symptoms: ['12-volt battery may stop charging', 'Possible charging warning or loss of drive power'],
      affectedSystems: ['integrated charging control unit', 'ICCU fuse', '12-volt charging system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V868 - GV60 ICCU', url: recalls(2024) }],
      summary: 'Replaced an uncited parked-drain theory and maintainer advice with the exact ICCU charging and power-loss recall.',
    },
    'The frozen card asserted a five-to-seven-day drain period, connected-service causes, plug-in behavior, software improvement and maintainer use without a Genesis primary source.',
  ),

  'genesis-gv60-ota-software-issues': replacement(
    {
      years: [2023, 2024, 2025],
      category: 'electrical',
      title: 'Instrument-Panel Display Software Recall',
      description: 'NHTSA campaign 25V474 covers certain 2023-2025 Genesis GV60 vehicles. A software error can cause the instrument-panel display to fail and hide critical information such as the speedometer and warning lights.',
      solution: 'Check the VIN with Genesis. The instrument-panel display software is updated over the air or by a dealer free of charge. If the display fails, stop safely and arrange service rather than continuing without required information.',
      symptoms: ['Blank or failed instrument-panel display', 'Critical speedometer or warning information unavailable'],
      affectedSystems: ['instrument-panel display', 'display software', 'OTA or dealer update path'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V474 - GV60 Instrument Display', url: recalls(2025) }],
      summary: 'Replaced an uncited generic OTA-failure card with the exact instrument-display software recall and supported update paths.',
    },
    'The frozen card generalized interrupted OTA installs, infotainment, ADAS and charging errors across four years and prescribed cellular, charging and dealer-reflash steps without Genesis evidence.',
  ),

  'genesis-gv60-range-inconsistency': replacement(
    {
      years: [2023],
      trims: ['All-wheel-drive vehicles covered by the campaign'],
      category: 'drivetrain',
      title: 'Rear Driveshaft Fracture Recall',
      description: 'NHTSA campaign 23V300 covers certain 2023 Genesis GV60 vehicles with all-wheel drive. A rear driveshaft can fracture and cause a loss of drive power.',
      solution: 'Check the VIN and drivetrain with Genesis. Dealers replace the left and right rear driveshafts free of charge. New driveline noise, vibration, or loss of propulsion requires immediate professional inspection.',
      symptoms: ['Possible rear-driveline noise or vibration', 'Possible loss of drive power'],
      affectedSystems: ['left rear driveshaft', 'right rear driveshaft', 'all-wheel-drive powertrain'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V300 - GV60 Rear Driveshafts', url: recalls(2023) }],
      summary: 'Replaced uncited range-percentage and driving-advice claims with the exact AWD rear-driveshaft safety recall.',
    },
    'The frozen card asserted a 15-25 percent range shortfall, temperature and speed algorithm limits, driving-mode guidance and a multi-thousand-mile learning period without Genesis test data or a bulletin.',
  ),
};

module.exports = buildConfig({
  label: 'Genesis GV60',
  make: 'Genesis',
  model: 'GV60',
  slug: 'genesis-gv60',
  batchId: 'genesis-gv60-full-record-cohort-141-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c9f3100c2977b652f9d88b19c9a633260b3210e38eeae129526903c908716ee0',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/genesis-gv60/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'genesisgv60_blind:manual-primary-source-gate',
    edge: 'genesisgv60_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
