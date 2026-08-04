const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-pt-cruiser-ac-condenser-2001': 'The frozen ten-year condenser card describes road-debris damage and several A/C repair possibilities rather than a Chrysler/NHTSA-defined defect population and remedy.',
  'chrysler-pt-cruiser-egr-valve-2001': 'The frozen EGR card combines deposits, valve operation, passages, wiring, and replacement across ten model years without one primary-source condition and diagnostic boundary.',
  'chrysler-pt-cruiser-head-gasket-2001': 'The frozen head-gasket card generalizes overheating, combustion leakage, turbo use, and engine repair across ten years without a Chrysler bulletin or campaign proving the asserted population.',
  'chrysler-pt-cruiser-oil-sludge-2001': 'The frozen sludge card combines maintenance history, oil specification, deposits, restriction, and engine damage across the entire 2.4L non-turbo population without one manufacturer defect record.',
  'chrysler-pt-cruiser-overheating-2001': 'The frozen overheating card explicitly combines multiple unrelated causes across ten years and therefore cannot support one diagnosis, parts list, cost, or remedy.',
  'chrysler-pt-cruiser-timing-belt-2001': 'The frozen timing-belt card combines maintenance intervals, age-related wear, breakage, turbo risk, and engine-damage claims without a primary-source failure population or universal repair outcome.',
  'chrysler-pt-cruiser-turbo-failure-2003': 'The frozen turbocharger card merges oil supply, bearings, seals, boost control, intake leaks, and replacement across eight model years without one Chrysler/NHTSA condition and remedy.',
};

module.exports = buildConfig({
  label: 'Chrysler PT Cruiser',
  make: 'Chrysler',
  model: 'PT Cruiser',
  slug: 'chrysler-pt-cruiser',
  batchId: 'chrysler-pt-cruiser-full-record-cohort-61-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7b3345939aee617acb46e8dad377e8dda7c2620362185ec85cc726d6eedc5abd',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-pt-cruiser/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslerptcruiser_blind:manual-primary-source-gate',
    edge: 'chryslerptcruiser_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '00V366000',
    '01V288000',
    '02V162000',
    '02V214000',
    '02V215000',
    '03V076000',
    '04V268000',
    '04V481000',
    '07V149000',
  ],
});
