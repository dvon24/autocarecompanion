const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW M6",
  model: "M6",
  slug: "bmw-m6",
  batchId: "bmw-m6-full-record-cohort-23-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "db8ba9874b47fe405c5cf0ea8b1714db4528c6e1cda2951b40d7a4c45ebdeb46",
  sourceSnapshotFileHash: "1fe514c723fef0dbfb4ce2202578e0e9383698f0fddaf77e78513448ec3fc44b",
  packetFileHash: "83ce9a02fc9721adbb19719a8d94409d3f53dd8d55adcf27872bb4f6a889968e",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-m6/db8ba9874b47/all-0001.json",
  reviewTokens: { blind: "bmwm6_blind:self-no-blocker", edge: "bmwm6_edge:self-no-blocker" },
  proposalCampaigns: [
  "12V126000",
  "17V495000",
  "12V475000",
  "20V094000",
  "16V540000",
  "16V914000"
],
});
