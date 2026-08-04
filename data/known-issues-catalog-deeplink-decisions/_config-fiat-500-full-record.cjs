const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'fiat-500-ac-compressor':
    'The frozen card asserts an eight-year compressor clutch/bearing failure, secondary belt damage, refrigerant contamination, and a multi-component replacement procedure without any citation or matching FCA service communication.',
  'fiat-500-clutch-shudder':
    'The frozen card assigns eight model years a clutch-shudder and dual-mass-flywheel condition and recommends a single-mass conversion without any source. NHTSA campaign 16V302 concerns a distinct 2012-2016 clutch diaphragm-spring fracture and cannot substantiate this card.',
  'fiat-500-eps-failure':
    'The frozen card describes sudden loss of assist, column motor/module failure, two DTCs, and full-column replacement across eight years using forums and repair vendors. FCA communications found only a different 2016 erroneous EPS warning-lamp software condition.',
  'fiat-500-input-shaft-bearing':
    'The frozen card attributes eight model years of clutch-position-dependent transmission noise to premature input-shaft-bearing wear and prescribes a rebuild and fluid specification without any citation or matching FCA bulletin.',
  'fiat-500-multiair-actuator':
    'The frozen card combines engine applicability, failure prevalence, four DTCs, a mileage range, and an updated-part claim for the MultiAir actuator without any source; its engine scope also labels the naturally aspirated 500 population as turbo-only.',
  'fiat-500-oil-consumption':
    'The frozen card supplies a consumption rate, mileage framing, MultiAir and turbo-seal causes, and repair advice across eight years from a generic Consumer Reports model page that does not establish those technical claims.',
};

module.exports = buildConfig({
  label: 'Fiat 500',
  make: 'Fiat',
  model: '500',
  slug: 'fiat-500',
  batchId: 'fiat-500-full-record-cohort-90-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '9ce986a369629e90f5449c54ddbd59c2cf8c389e8e36d81ab6974d0663d1d92c',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-500/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiat500_blind:manual-primary-source-gate',
    edge: 'fiat500_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '11V550000', '15V291000', '16V302000', '16V667000', '19E044000', '19V817000',
    '24V474000',
  ],
});
