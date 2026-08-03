const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-cirrus-engine-mount-wear-1995': 'The frozen six-year engine/transmission-mount card relies on owner and aftermarket material without a Chrysler/NHTSA source defining a Cirrus defect population, mount failure mode, or universal replacement set.',
  'chrysler-cirrus-head-gasket-1995': 'The frozen 2.5L head-gasket claim lacks a primary Chrysler/NHTSA source for its 1995-2000 population and replacement guidance. Recall 96V-006 is a different 2.4L cylinder-head oil-galley-plug condition and must not be merged into this card.',
  'chrysler-cirrus-transmission-failure-1995': 'The frozen 41TE card combines shift complaints, limp mode, sensors, solenoids, internal wear, rebuilds, and replacement across all Cirrus years without one primary-source defect and remedy.',
};

module.exports = buildConfig({
  label: 'Chrysler Cirrus',
  make: 'Chrysler',
  model: 'Cirrus',
  slug: 'chrysler-cirrus',
  batchId: 'chrysler-cirrus-full-record-cohort-52-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'ef8711a3a83a160d7342c818db1437e14a8e18213a8332192bf44d1b9b65638e',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-cirrus/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslercirrus_blind:manual-primary-source-gate',
    edge: 'chryslercirrus_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '00V066000',
    '00V067000',
    '00V196000',
    '00V366000',
    '04V021000',
    '06V001000',
    '96V006000',
    '96V074000',
    '96V075000',
    '97V095000',
    '97V201000',
    '98V063000',
    '98V183000',
    '99V244000',
  ],
});
