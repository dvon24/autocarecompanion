const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const reasons = {
  'ford-explorer-sport-trac-bed-rust-2001':
    'The only citation is a fabricated-looking placeholder YouTube URL ending in abcd1234efg. The frozen card combines truck-bed, frame, crossmember, body-mount, and fastener corrosion across 2001-2005 without a Ford bulletin, investigation, recall, or geographic population.',
  'ford-explorer-sport-trac-cam-phaser-2007':
    'The only citation is the same placeholder YouTube URL, and the card labels a 4.0L SOHC engine condition as cam-phaser rattle without primary documentation that the engine uses the alleged VCT failure mode. No Ford source supports the 2007-2010 diagnosis or remedy.',
  'ford-explorer-sport-trac-rear-window-2001':
    'The frozen card has no citations and combines defroster-grid, electrical-connector, flip-glass hinge, latch, leak, and rattle conditions across 2001-2005 without a Ford bulletin, investigation, recall, or one defined component failure.',
  'ford-explorer-sport-trac-timing-chain-2007':
    'The frozen card has no citations and applies timing-chain cassette, guide, tensioner, rattle, timing, performance, and engine-damage claims to every 2007-2010 4.0L SOHC Sport Trac without an exact Ford program, bulletin, investigation, or remedy.',
};

module.exports = buildConfig({
  label: 'Ford Explorer Sport Trac',
  make: 'Ford',
  model: 'Explorer Sport Trac',
  slug: 'ford-explorer-sport-trac',
  batchId: 'ford-explorer-sport-trac-full-record-cohort-112-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'dc03b1596619eb22e7575d4d6d5158d499800d429f5cc2025f7cb06b65282855',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-explorer-sport-trac/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordexplorersporttrac_blind:manual-primary-source-gate',
    edge: 'fordexplorersporttrac_edge:manual-primary-source-gate',
  },
  published: {},
  reasons,
  proposalCampaigns: [],
});
