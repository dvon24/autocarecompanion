const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines || [],
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
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const level2ChargingSleepBulletin = {
  years: [2024, 2025, 2026],
  trims: [],
  engines: [],
  category: 'electrical',
  title: 'Level 2 Charging May Stop When the Vehicle Falls Asleep (TSB 08-249-26)',
  description:
    'Stellantis TSB 08-249-26 covers North American 2024-2026 Fiat 500e vehicles. It documents a software condition in which high-voltage battery charging may stop unexpectedly while the vehicle remains connected to a Level 2 charger.',
  solution:
    'Do not replace the charging-port assembly or other parts for this condition. TSB 08-249-26 says pressing a key-fob button or opening a door wakes the vehicle bus and allows charging to resume. Stellantis was still investigating corrective software when the bulletin was issued on June 26, 2026, so check current dealer guidance for an update.',
  severity: 'medium',
  symptoms: ['Level 2 charging stops while the vehicle remains plugged into the charger'],
  affectedSystems: ['high-voltage battery charging', 'vehicle-bus sleep logic', 'charging-control software'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Stellantis TSB 08-249-26 - Level 2 Charging Disrupted by Vehicle Falling Asleep', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11034361-0001.pdf' }],
  summary:
    'Replaced the unsupported CCS-port narrative with Stellantis TSB 08-249-26\'s exact Level 2 software condition, all-vehicle 2024-2026 scope, no-parts guidance, and temporary wake-up procedure.',
};

const published = {
  'fiat-500e-charging-port': replacement(
    level2ChargingSleepBulletin,
    'Retain the charging concern only after narrowing it to the exact software condition and guidance in Stellantis TSB 08-249-26; remove the unsupported CCS, third-party-network, corrosion, firmware, and parts-replacement claims.',
  ),
};

const reasons = {
  'fiat-500e-12v-battery-drain':
    'The frozen card asserts background-module drain, multi-day parking behavior, lockout, BCM software, AGM replacement, and plug-in maintenance for 2024-2026 without any citation. The reviewed FCA communications do not establish that condition.',
};

module.exports = buildConfig({
  label: 'Fiat 500e',
  make: 'Fiat',
  model: '500e',
  slug: 'fiat-500e',
  batchId: 'fiat-500e-full-record-cohort-91-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '2aa79ab109f3b4c6d4c14bd855e364c78544820cfde8759e84faacef0d2101d3',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-500e/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiat500e_blind:manual-primary-source-gate',
    edge: 'fiat500e_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: ['24V510000', '25V715000'],
});
