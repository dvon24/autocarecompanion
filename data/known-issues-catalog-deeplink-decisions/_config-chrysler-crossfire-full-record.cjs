const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-crossfire-ac-interior-2004': 'The frozen card improperly combines A/C compressor faults with unrelated interior-trim deterioration across 2004-2008, using owner and aftermarket material without a single Chrysler/NHTSA population or remedy.',
  'chrysler-crossfire-egr-cat-2004': 'The frozen card merges EGR solenoid and catalytic-converter failures, symptoms, codes, and replacement guidance without a primary Chrysler/NHTSA source establishing one 2004-2008 defect condition.',
  'chrysler-crossfire-ignition-switch-2004': 'The frozen five-year key-sticking/ignition-switch claim lacks a Chrysler/NHTSA bulletin or campaign defining the affected Crossfire population, failure mechanism, and replacement procedure.',
  'chrysler-crossfire-rear-spring-2004': 'The frozen rear-coil-spring card relies on owner and secondary material and does not have a primary manufacturer or NHTSA record supporting the full 2004-2008 population and universal spring replacement.',
  'chrysler-crossfire-sam-module-2004': 'The frozen SAM water-intrusion card combines drainage, corrosion, electrical symptoms, and module replacement across all Crossfire years without a Chrysler/NHTSA source establishing that population and remedy.',
};

module.exports = buildConfig({
  label: 'Chrysler Crossfire',
  make: 'Chrysler',
  model: 'Crossfire',
  slug: 'chrysler-crossfire',
  batchId: 'chrysler-crossfire-full-record-cohort-54-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7bb50a8713cee8fcab4927c7efd3272821407444b0f1c957a954083777c29aa8',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-crossfire/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslercrossfire_blind:manual-primary-source-gate',
    edge: 'chryslercrossfire_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
