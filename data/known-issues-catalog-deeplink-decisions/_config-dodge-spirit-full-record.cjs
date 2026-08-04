const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'dodge-spirit-automatic-transmission-1993':
    'The frozen card asserts three model years of A604 solenoid, seal, TCM, limp-mode, and premature-failure behavior from a general enthusiast site without a Chrysler primary service publication defining one condition and remedy.',
  'dodge-spirit-coolant-leak-1990':
    'The frozen card combines heater-core and hose deterioration, cabin and external leaks, and dashboard-removal guidance across six model years but provides no citation or Dodge primary source.',
  'dodge-spirit-engine-mount-1993':
    'The frozen card attributes three model years of torque-strut separation, drivetrain movement, clunks, and secondary CV/exhaust stress to one general enthusiast site without a Chrysler bulletin defining the condition.',
  'dodge-spirit-head-gasket-1990':
    'The frozen card combines three engines, six model years, bimetallic-expansion and combustion-pressure theories, comparative prevalence, turbo susceptibility, and multiple overheating causes from enthusiast and generic repair sources without a Chrysler primary source establishing that complete scope.',
  'dodge-spirit-transmission-mount-1990':
    'The frozen card asserts rapid engine/transmission-mount deterioration, symptoms, and a first-to-fail mount across six model years without any citation or Dodge primary source.',
};

module.exports = buildConfig({
  label: 'Dodge Spirit',
  make: 'Dodge',
  model: 'Spirit',
  slug: 'dodge-spirit',
  batchId: 'dodge-spirit-full-record-cohort-85-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'ff025da66b254629830cff7d703c0efcef97dc6b9cb7a7120313737802da174c',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-spirit/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgespirit_blind:manual-primary-source-gate',
    edge: 'dodgespirit_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '08E033000', '89V237000', '90V162000', '90V194000', '91V122000', '92V015000',
    '94V023000',
  ],
});
