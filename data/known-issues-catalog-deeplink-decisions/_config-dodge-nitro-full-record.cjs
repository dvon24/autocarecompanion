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

const tipmStallRecall = {
  years: [2007],
  trims: ['Vehicles included by VIN in recall G25/07V-291'],
  engines: [],
  category: 'electrical',
  title: 'TIPM Software Can Allow the Engine to Stall (Recall 07V-291)',
  description:
    'NHTSA recall 07V-291 covers certain 2007 Dodge Nitro vehicles. The Totally Integrated Power Module was programmed with software that may allow the engine to stall under certain operating conditions. A stall while driving can increase the risk of a crash.',
  solution:
    'Check the VIN for recall G25/07V-291 and confirm completion. The dealer remedy is to reprogram the TIPM with revised software. This recall does not establish a failed fuel-pump relay or justify replacing the TIPM without diagnosis.',
  severity: 'high',
  symptoms: ['Engine stalls under certain operating conditions', 'Loss of propulsion while driving'],
  affectedSystems: ['Totally Integrated Power Module software', 'engine run control'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 07V-291 - TIPM Software / Engine Stalling', url: 'https://static.nhtsa.gov/odi/rcl/2007/RCAK-07V291-3013.pdf' }],
  summary:
    'Narrowed the broad five-year TIPM hardware and fuel-relay claim to recall 07V-291\'s exact 2007 software-related stall condition and reprogramming remedy.',
};

const published = {
  'dodge-nitro-tipm-2007': replacement(
    tipmStallRecall,
    'Replace the forum-based five-year TIPM and fuel-pump-relay aggregation with recall 07V-291\'s exact 2007 TIPM software condition, stall consequence, and dealer reprogramming remedy.',
  ),
};

const reasons = {
  'dodge-nitro-42rle-trans-2007':
    'The frozen card asserts five model years of 42RLE solenoid-pack and connector corrosion failures, symptoms, and cross-model equivalence without any citation or Chrysler primary source defining that condition.',
  'dodge-nitro-ball-joint-2007':
    'The frozen card attributes five model years of lower-ball-joint wear to a shared-platform issue, supplies mileage and symptoms, and relies on one video without a Dodge bulletin defining the population or remedy.',
  'dodge-nitro-thermostat-housing-2007':
    'The frozen card asserts five model years of 3.7L plastic thermostat-housing cracking and material degradation without any citation or Chrysler primary source.',
  'dodge-nitro-window-regulator-2007':
    'The frozen card claims repeated regulator failures across five model years, combines cable and gear mechanisms, and relies on an empty citation plus a platform analogy instead of a manufacturer source.',
};

module.exports = buildConfig({
  label: 'Dodge Nitro',
  make: 'Dodge',
  model: 'Nitro',
  slug: 'dodge-nitro',
  batchId: 'dodge-nitro-full-record-cohort-78-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'f99367ea728efa216256798710678f41b0f73185d6847e75671af009b9deab09',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-nitro/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgenitro_blind:manual-primary-source-gate',
    edge: 'dodgenitro_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '06V493000', '07V291000', '07V434000', '08V525000', '09V438000', '10V009000',
    '10V315000', '11V315000', '13V121000', '13V282000', '20V396000',
  ],
});
