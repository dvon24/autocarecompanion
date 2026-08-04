const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'chrysler-new-yorker-electronic-suspension-1994': 'The frozen air-suspension card combines compressor, relay, dryer, air-line, and spring-failure possibilities without one Chrysler/NHTSA primary source defining a 1994-1996 defect population and remedy.',
  'chrysler-new-yorker-oil-leak-1990': 'The frozen seven-year oil-leak card merges valve-cover, oil-pan, rear-main, front-seal, and PCV possibilities across two engine families without one manufacturer condition and repair scope.',
  'chrysler-new-yorker-power-window-1990': 'The frozen power-window card combines motors, regulators, switches, wiring, and track faults across seven model years without a primary-source mechanism supporting a universal diagnosis and parts recommendation.',
  'chrysler-new-yorker-transmission-1994': 'The frozen A604 card combines internal wear, hydraulic control, electronics, rebuild, and replacement claims without one Chrysler/NHTSA defect population and remedy; campaign 94V024 concerns external harness chafing rather than premature internal transmission failure.',
};

module.exports = buildConfig({
  label: 'Chrysler New Yorker',
  make: 'Chrysler',
  model: 'New Yorker',
  slug: 'chrysler-new-yorker',
  batchId: 'chrysler-new-yorker-full-record-cohort-58-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '8f95ac27592202b2d862a1d7280151eb504c6e033a76a2a2003b96021307e972',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-new-yorker/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslernewyorker_blind:manual-primary-source-gate',
    edge: 'chryslernewyorker_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [
    '91V004000',
    '91V122000',
    '91V191000',
    '92V015000',
    '94V024000',
    '96V099000',
    '98V184000',
    '99V215000',
  ],
});
