const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const published = {};

const reasons = {
  'ford-contour-alternator-failure-1995':
    'The frozen card relies on a placeholder YouTube URL to apply premature alternator failure, battery warnings, dim lighting, dead-battery symptoms, and intermittent accessories to every 1995-2000 Contour and both engine families. The Ford/NHTSA primary-source review found no campaign defining that six-year defect or remedy.',
  'ford-contour-coolant-elbow-1995':
    'The frozen card relies on one forum URL to apply a 2.5L coolant crossover-tube and elbow leak, coolant loss, overheating, odor, and steam to every 1995-2000 Contour. The Ford/NHTSA primary-source review found no bulletin or campaign defining that population and repair.',
  'ford-contour-intake-manifold-runner-1998':
    'The frozen card has no citations and turns an IMRC label into a three-year 2.5L Duratec defect with a detailed power-loss, rattle, hesitation, throttle-response, and fuel-economy symptom set without a Ford bulletin, investigation, or recall establishing the condition.',
  'ford-contour-power-window-regulator-1995':
    'The frozen card has no citations and applies stripped regulator gears, dropped windows, grinding, jerky travel, repeat falling, motor operation, and clicking to every 1995-2000 Contour without a Ford bulletin, investigation, or recall defining the affected population.',
  'ford-contour-transmission-failure-1995':
    'The frozen card has no citations and applies chronic CD4E failure, delayed engagement, slipping, harsh 1-2 shifts, and no reverse to every 1995-2000 Contour without a Ford service publication defining that defect. NHTSA campaign 98V233 concerns a damaged floor-shift gear-position indicator, not internal CD4E transmission failure, so it cannot substantiate this card.',
};

module.exports = buildConfig({
  label: 'Ford Contour',
  make: 'Ford',
  model: 'Contour',
  slug: 'ford-contour',
  batchId: 'ford-contour-full-record-cohort-102-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '80ca6cfac8e0b189adde17a788e7a454612820e1f29e343e8c60756df6a67364',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-contour/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordcontour_blind:manual-primary-source-gate',
    edge: 'fordcontour_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
