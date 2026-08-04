const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'ford-five-hundred-ball-joint-2005':
    'The frozen card extrapolates owner complaints into a universal premature ball-joint defect, asserts design and highway-separation causes, prescribes inspection intervals and branded aftermarket parts, and supplies prices without a Ford campaign or exact primary-source population.',
  'ford-five-hundred-cvt-failure-2005':
    'The frozen card combines shudder, slipping, temperature behavior, sensor and solenoid faults, loss of reverse, complete failure, fluid intervals, rebuilds, and a drivetrain conversion from complaint material. Ford fluid guidance does not establish one chronic CVT defect or those remedies.',
  'ford-five-hundred-power-steering-2005':
    'The frozen card turns owner complaints into a universal rack-and-pump design defect, claims Ford acknowledged a harmful factory fill, and recommends fluid, pump, and rack replacement with prices without citing the alleged Ford bulletin or defining an exact condition.',
  'ford-five-hundred-throttle-body-2005':
    'The only citation is a fabricated-looking placeholder YouTube URL. Ford diagnostic guidance for 2005-2007 Five Hundred vehicles warns against using limited-refresh throttle PIDs to validate a concern because doing so can cause improper electronic-throttle-body replacement.',
  'ford-five-hundred-wheel-bearing-2005':
    'The only citation is a fabricated-looking placeholder YouTube URL, and the frozen card applies one hub-bearing failure, AWD prevalence claim, integrated-sensor statement, and torque instruction to every 2005-2007 vehicle without an exact Ford service source.',
};

module.exports = buildConfig({
  label: 'Ford Five Hundred',
  make: 'Ford',
  model: 'Five Hundred',
  slug: 'ford-five-hundred',
  batchId: 'ford-five-hundred-full-record-cohort-120-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '4052ba8c876bcb5ca1c5258d1d4c0ecc92eedadf3a4ea800218079c24dcee7c5',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-five-hundred/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordfivehundred_blind:manual-primary-source-gate',
    edge: 'fordfivehundred_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
