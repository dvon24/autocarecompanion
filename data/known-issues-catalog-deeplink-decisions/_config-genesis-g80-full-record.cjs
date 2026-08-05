const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

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
      source: 'manual',
      summary: card.summary,
    },
  };
}

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Genesis&model=G80&modelYear=${year}`;

const published = {
  'genesis-g80-electrified-software': replacement(
    {
      years: [2025, 2026],
      category: 'electrical',
      title: 'Instrument Display and HD Radio Software Recall',
      description: 'NHTSA campaign 26V019 covers certain 2025-2026 Genesis G80 vehicles. An audio-video-navigation software error can cause the instrument display to fail and hide critical information such as the speedometer or fuel gauge.',
      solution: 'Owners are advised to disable the HD Radio feature until the remedy is completed. Check the VIN with Genesis; the audio-video-navigation software is updated over the air or inspected and updated by a dealer free of charge.',
      severity: 'high',
      symptoms: ['Instrument display may fail', 'Critical speedometer, fuel-gauge, or warning information may be unavailable'],
      affectedSystems: ['audio-video-navigation software', 'instrument panel display', 'HD Radio feature'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V019 - G80 Instrument Display Software', url: recalls(2025) }],
      summary: 'Replaced an uncited all-EV software and charging aggregation with the exact instrument-display and HD Radio software recall.',
    },
    'The frozen card generalized range estimates, DC fast charging, 12-volt battery management, OTA maturity, battery disconnection and remote diagnostics across five years without a Genesis primary source.',
  ),

  'genesis-g80-infotainment-glitches': replacement(
    {
      years: [2023, 2024],
      category: 'electrical',
      title: 'Instrument-Panel Display Software Recall',
      description: 'NHTSA campaign 25V105 covers certain 2023-2024 Genesis G80 vehicles. A software error can cause the instrument-panel display to fail and prevent the driver from seeing the speedometer, warning lights, and other critical safety information.',
      solution: 'Check the VIN with Genesis. Dealers inspect and update the instrument-panel display software as necessary free of charge. If the display fails, stop safely and arrange service rather than continuing without required vehicle information.',
      severity: 'high',
      symptoms: ['Instrument-panel display may go blank or fail', 'Critical speedometer or warning information may be unavailable'],
      affectedSystems: ['instrument-panel display', 'display software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V105 - G80 Instrument Panel', url: recalls(2024) }],
      summary: 'Replaced an uncited ten-year infotainment-glitch aggregation with the exact 2023-2024 instrument-display software recall.',
    },
    'The frozen card generalized black screens, navigation errors, touch input, OTA regressions, resets, reflashes and controller use across 2017-2026 without a Genesis-defined population or version.',
  ),
};

module.exports = buildConfig({
  label: 'Genesis G80',
  make: 'Genesis',
  model: 'G80',
  slug: 'genesis-g80',
  batchId: 'genesis-g80-full-record-cohort-139-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '6ad75406ea823cc09b61e5d9cb84fb9a2bffe315de5610580967d8b8dfdf4166',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/genesis-g80/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'genesisg80_blind:manual-primary-source-gate',
    edge: 'genesisg80_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
