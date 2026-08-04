const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-lhs-35l-oil-consumption-1994': 'The frozen eight-year oil-consumption card combines rings, valve guides, valve seals, PCV operation, deposits, and engine wear without one Chrysler/NHTSA primary source defining the affected population and remedy.',
  'chrysler-lhs-intake-manifold-plenum-1999': 'The frozen intake-runner card asserts a 1999-2001 mechanism and replacement path without a Chrysler bulletin, campaign, or investigation establishing that complete LHS population.',
  'chrysler-lhs-power-steering-leak-1999': 'The frozen steering card merges pressure-hose and rack-seal leaks across three model years without one manufacturer defect condition, diagnostic boundary, and remedy.',
  'chrysler-lhs-trans-failure-1994': 'The frozen 42LE card combines clutch wear, hydraulic faults, electronics, rebuilds, and complete replacement across eight years without one Chrysler/NHTSA defect population and remedy.',
  'chrysler-lhs-transmission-41te-1994': 'The frozen 41TE/42LE card combines solenoid, shift-quality, control, and internal transmission claims across eight years without a primary-source condition supporting the universal diagnosis and parts guidance.',
};

module.exports = buildConfig({
  label: 'Chrysler LHS',
  make: 'Chrysler',
  model: 'LHS',
  slug: 'chrysler-lhs',
  batchId: 'chrysler-lhs-full-record-cohort-57-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '132b15916cddeb06e8d04feb63a49b47f3ce380ae5d9cecf68b13a3bc203612a',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-lhs/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslerlhs_blind:manual-primary-source-gate',
    edge: 'chryslerlhs_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '00V033000',
    '00V034000',
    '00V366000',
    '01V119000',
    '01V273000',
    '03V035000',
    '04V021000',
    '94V024000',
    '98V184000',
    '99V215000',
  ],
});
