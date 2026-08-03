const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-300m-35l-oil-sludge-1999': 'The frozen six-year oil-sludge and consumption card relies on owner, video, and secondary material. Current Chrysler/NHTSA primary-source research does not establish one 1999-2004 3.5L defect population, sludge mechanism, mileage band, or universal engine-cleaning and replacement guidance.',
  'chrysler-300m-power-steering-1999': 'The frozen card aggregates pump whine, fluid leaks, hoses, seals, and pump replacement across all 300M years without one Chrysler/NHTSA source defining the claimed population and remedy.',
  'chrysler-300m-power-steering-rack-1999': 'The frozen six-year steering-rack leak claim is supported by owner and aftermarket material and does not have a primary FCA/NHTSA population, failure mechanism, or universal rack-replacement procedure.',
  'chrysler-300m-trans-failure-1999': 'The frozen 42LE card combines shift quality, limp mode, internal wear, sensors, solenoids, rebuilds, and replacement across 1999-2004 without one primary source supporting a single defect or remedy.',
};

module.exports = buildConfig({
  label: 'Chrysler 300M',
  make: 'Chrysler',
  model: '300M',
  slug: 'chrysler-300m',
  batchId: 'chrysler-300m-full-record-cohort-50-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'a4b986b25b0938376b358f924e68a1f05d0c80bc2d4e9b07ffb937a19f851dd7',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-300m/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chrysler300m_blind:manual-primary-source-gate',
    edge: 'chrysler300m_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '00V033000',
    '00V034000',
    '00V366000',
    '01V273000',
    '03V035000',
    '03V332000',
    '04V021000',
    '99V343000',
  ],
});
