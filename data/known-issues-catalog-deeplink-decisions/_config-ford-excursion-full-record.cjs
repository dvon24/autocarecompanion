const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'ford-excursion-60l-head-bolt-2003':
    'The frozen card has no citations and applies head-bolt stretch, head-gasket leakage, coolant loss, overheating, white smoke, coolant pressurization, and multiple repair choices to every 2003-2005 6.0L Excursion. No exact Ford bulletin, investigation, or recall reviewed defines that combined defect and remedy.',
  'ford-excursion-60l-oil-cooler-2003':
    'The frozen card has no citations and applies oil-cooler clogging, temperature-delta thresholds, overheating, coolant contamination, EGR-cooler failure, and reduced oil pressure to every 2003-2005 6.0L Excursion without an exact Ford primary source defining the condition and service procedure.',
  'ford-excursion-front-hub-bearing-2000':
    'The frozen card has no citations and applies wheel-bearing noise, vibration, play, ABS warnings, and complete hub failure to every 2000-2005 Excursion without a Ford bulletin, investigation, or recall defining one defect, affected population, and remedy.',
  'ford-excursion-ipr-valve-leak-2003':
    'The frozen card has no citations and assigns hard starts, hot no-starts, stalls, low injection pressure, rough running, power loss, and oil leakage to an IPR-valve defect across every 2003-2005 6.0L Excursion. No exact Ford primary source reviewed defines that population and diagnosis.',
  'ford-excursion-v10-transfer-case-2000':
    'The only citation is the homepage of an Expedition owner forum, not evidence for an Excursion defect. The frozen card applies BorgWarner 4405 failure, shift faults, noises, binding, leaks, and loss of four-wheel drive to every 2000-2005 V10 Excursion without an exact Ford source or verified transfer-case population.',
};

module.exports = buildConfig({
  label: 'Ford Excursion',
  make: 'Ford',
  model: 'Excursion',
  slug: 'ford-excursion',
  batchId: 'ford-excursion-full-record-cohort-109-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd87d76f6d505c00887ca514e9e05765f4418b02aa1efed2fd7b0a3b363c9b296',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-excursion/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordexcursion_blind:manual-primary-source-gate',
    edge: 'fordexcursion_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
