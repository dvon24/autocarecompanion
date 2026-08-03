const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-concorde-27l-sludge-1998': 'The frozen 1998-2004 2.7L sludge and seizure card relies on owner, secondary, and aftermarket material without one Chrysler/NHTSA record establishing its population, mechanism, mileage range, or engine-replacement guidance.',
  'chrysler-concorde-35l-timing-belt-1993': 'The frozen eleven-year 3.5L timing-belt/tensioner card combines maintenance timing, noise, belt failure, and engine-damage claims without a primary Chrysler/NHTSA defect population or universal remedy.',
  'chrysler-concorde-ps-hose-leak-1993': 'The frozen power-steering card merges hose, pump, rack, and fluid-leak possibilities across 1993-2004 without one primary-source mechanism, affected population, or replacement procedure.',
  'chrysler-concorde-transmission-solenoid-1998': 'The frozen 42LE card combines solenoid faults, limp mode, sensors, internal wear, rebuilds, and replacement across seven years without a single Chrysler/NHTSA source supporting that diagnosis and remedy.',
};

module.exports = buildConfig({
  label: 'Chrysler Concorde',
  make: 'Chrysler',
  model: 'Concorde',
  slug: 'chrysler-concorde',
  batchId: 'chrysler-concorde-full-record-cohort-53-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'f18baa90c3defce6481c5fa3d2b5599ea717329af4892292c3eb749f7a5469bf',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-concorde/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslerconcorde_blind:manual-primary-source-gate',
    edge: 'chryslerconcorde_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '00V033000',
    '00V034000',
    '00V180000',
    '00V366000',
    '01V119000',
    '01V273000',
    '03V035000',
    '03V332000',
    '04V021000',
    '94V024000',
    '98V130000',
    '98V184000',
    '99V215000',
    '99V343000',
  ],
});
