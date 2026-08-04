const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'fiat-124-spider-boost-leak':
    'The frozen card assigns four model years and all trims a charge-pipe coupler failure, P0299, mileage, repair pricing, and an aftermarket T-bolt-clamp remedy without any citation. The reviewed FCA communications do not establish that condition.',
  'fiat-124-spider-infotainment':
    'The frozen card combines lag, boot time, Bluetooth, CarPlay, Android Auto, firmware, pairing, and USB-hub claims across 2017-2020 without a citation. The FCA radio communications reviewed do not define that condition or those remedies for this population.',
  'fiat-124-spider-soft-top':
    'The frozen card attributes four model years of cold-weather binding, latch misalignment, wind noise, and squeaking to the top mechanism and prescribes lubrication and adjustment without any source or FCA service procedure.',
};

module.exports = buildConfig({
  label: 'Fiat 124 Spider',
  make: 'Fiat',
  model: '124 Spider',
  slug: 'fiat-124-spider',
  batchId: 'fiat-124-spider-full-record-cohort-89-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'cd40d5643d2e4c0679b120e4de3f8782e813950e4b758a38519f552b35b0a8bd',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-124-spider/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiat124spider_blind:manual-primary-source-gate',
    edge: 'fiat124spider_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: ['21V879000', '24V694000'],
});
