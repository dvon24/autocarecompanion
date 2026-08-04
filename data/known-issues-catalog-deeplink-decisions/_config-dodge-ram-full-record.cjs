const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'dodge-ram-bosch-vp44-injection-pump-failure-1998-5-2002-dodge-ram-5-9':
    'The frozen card combines lift-pump pressure, VP44 cooling and lubrication, cavitation, PSG overheating, solder cracking, mileage, costs, recurrence, and a P0216 interpretation from diesel retailers and enthusiast media without a Cummins, Bosch, or Dodge primary source proving that complete causal chain and repair plan.',
  'dodge-ram-killer-dowel-pin-1994-1998-dodge-ram-5-9-cummins-12v':
    'The frozen card asserts a broad 1989-2002 Cummins dowel-pin failure population, vibration and thermal-expansion causes, multiple engine-damage outcomes, and a preventive tab repair from enthusiast and parts-vendor sources without a Cummins or Dodge primary service publication defining the condition and remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Ram',
  make: 'Dodge',
  model: 'Ram',
  slug: 'dodge-ram',
  batchId: 'dodge-ram-full-record-cohort-79-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '65168d7e9fbdcff7562c93e47d222ba3b16293a4f8b521cfa293752c94a08155',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-ram/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeram_blind:manual-primary-source-gate',
    edge: 'dodgeram_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
