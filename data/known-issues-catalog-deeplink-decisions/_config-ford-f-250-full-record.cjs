const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'ford-f250-73l-injector-1994':
    'The frozen card merges mechanically injected 7.3L IDI engines with electronically controlled 7.3L Power Stroke HEUI systems across nine model years and relies only on a placeholder-style YouTube URL. It is not one failure mechanism, diagnosis, or Ford repair.',
  'ford-f250-cam-phaser-62l-2011':
    'The frozen card applies one cam-phaser knock diagnosis to every 2011-2025 6.2L truck using only a placeholder-style YouTube URL, then recommends phasers, solenoids, oil grade, and a catch can without a Ford bulletin defining that population or remedy.',
  'ford-f250-death-wobble-front-end-1999':
    'The frozen card treats a driving symptom as a universal 27-year defect, assigns the track bar as the usual cause, and recommends several suspension parts from a placeholder-style YouTube citation. No exact Ford campaign or diagnostic population supports that aggregation.',
  'ford-f250-diesel-glow-plug-1990':
    'The frozen card merges 7.3L IDI and Power Stroke glow-plug systems, relay faults, individual plug faults, and broken-tip damage across nine years using only a placeholder-style YouTube URL. It does not establish one Ford-defined condition or repair.',
  'ford-f250-front-ball-joint-failure-1999':
    'The frozen card is primarily aftermarket and forum-derived, extends a Super Duty claim into the separate F-250 catalog model, and recommends multiple branded upgrade systems and prices across 18 years. No exact Ford primary source defines one premature ball-joint defect and remedy.',
};

module.exports = buildConfig({
  label: 'Ford F-250',
  make: 'Ford',
  model: 'F-250',
  slug: 'ford-f-250',
  batchId: 'ford-f-250-full-record-cohort-116-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'e630309106f34619c1508560e1e78bbb9086b9b97afdb1d4adeeac39027a385f',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-f-250/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordf250_blind:manual-primary-source-gate',
    edge: 'fordf250_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
