const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'dodge-shadow-alternator-wiring-1990':
    'The frozen card asserts an undersized fusible link, corroded connector, overheating, and harness meltdown across five model years from a general enthusiast site without a Dodge primary source defining the condition.',
  'dodge-shadow-auto-trans-failure-1990':
    'The frozen card combines A413 and A604 hardware, five model years, solenoids, clutch packs, TCM, converter, pump, mileage, and reputation claims from forums, advocacy, Wikipedia, and media without one Chrysler service publication defining a repairable condition.',
  'dodge-shadow-cooling-fan-relay-1990':
    'The frozen card attributes five model years of overheating to a fender-mounted cooling-fan relay and environmental exposure but provides no citation or Dodge primary source.',
  'dodge-shadow-cv-joint-1990':
    'The frozen card turns age-related CV-boot deterioration into a five-year model-specific defect and relies on one video without a Dodge primary source defining an affected population and remedy.',
  'dodge-shadow-head-gasket-1990':
    'The frozen card combines two engines, turbo and naturally aspirated variants, five model years, material-expansion theory, comparative prevalence, symptoms, and an improved-gasket claim from forums and a generic repair article without a Chrysler bulletin establishing that scope.',
};

module.exports = buildConfig({
  label: 'Dodge Shadow',
  make: 'Dodge',
  model: 'Shadow',
  slug: 'dodge-shadow',
  batchId: 'dodge-shadow-full-record-cohort-84-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'cafa3870403b7077afde4dcc37a62bfb76d6d50aebf8c42f5c544f5ddc033016',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-shadow/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeshadow_blind:manual-primary-source-gate',
    edge: 'dodgeshadow_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '08E033000', '89V237000', '90V162000', '90V194000', '92V015000', '96V229000',
    '97V078000', '99V212000',
  ],
});
