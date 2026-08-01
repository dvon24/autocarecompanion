const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW M8",
  model: "M8",
  slug: "bmw-m8",
  batchId: "bmw-m8-full-record-cohort-24-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "1e69f14c672fda27077ea121ff116eeb6db5a779bf51fd7e7b32d29518b86da1",
  sourceSnapshotFileHash: "0e6c7cf39901dfb712df8f12b06361c268647295651770c9ee32c95006d6940e",
  packetFileHash: "1e8f0663c213767572e3361b542413c1a34728116f4b72515ba22c48b1af5dd8",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-m8/1e69f14c672f/all-0001.json",
  reviewTokens: { blind: "bmwm8_blind:self-no-blocker", edge: "bmwm8_edge:self-no-blocker" },
  proposalCampaigns: [
  "21V096000",
  "21V062000",
  "19V883000",
  "23V099000"
],
});
