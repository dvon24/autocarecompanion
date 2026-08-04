const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'fiat-500l-dct-shudder':
    'The frozen card attributes three years of DDCT shudder to dry-clutch wear and glazing, lists unrelated DTCs, and prescribes adaptation and clutch replacement without a source. FCA bulletin 21-031-15 covers a different 2015 conventional automatic shift-point calibration, and recall 14V103 covers a distinct shifter-module condition.',
  'fiat-500l-strut-noise':
    'The frozen card turns one secondary complaint-index page into a seven-year strut-mount and bearing defect, mileage threshold, and bundled strut-replacement recommendation without a Fiat service publication.',
  'fiat-500l-wastegate-rattle':
    'The frozen card assigns seven model years a wastegate-linkage wear mechanism, cold-noise behavior, P0299, rod adjustment, actuator replacement, and turbo replacement without any citation or matching FCA bulletin.',
};

module.exports = buildConfig({
  label: 'Fiat 500L',
  make: 'Fiat',
  model: '500L',
  slug: 'fiat-500l',
  batchId: 'fiat-500l-full-record-cohort-92-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '8abef22dcf75a2172e0228ec78baab29d2bdbd4c9bab5ac87e154977ad3d9c44',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/fiat-500l/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fiat500l_blind:manual-primary-source-gate',
    edge: 'fiat500l_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: ['14V103000', '14V481000', '15V590000', '17V192000'],
});
