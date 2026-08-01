const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW M5",
  model: "M5",
  slug: "bmw-m5",
  batchId: "bmw-m5-full-record-cohort-22-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "b8df62fe0847154a60799c62073f6266718e3fc34d1dbab17fa5e5b46b849749",
  sourceSnapshotFileHash: "245cd8a1c5df60639191799094950a430b96f928da9151ebce53dcefd35c3fab",
  packetFileHash: "5def21a1d2fa6470376d80608317770cfb007d842227d6a3ab0ebc1161a4c014",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-m5/b8df62fe0847/all-0001.json",
  reviewTokens: { blind: "bmwm5_blind:self-no-blocker", edge: "bmwm5_edge:self-no-blocker" },
  proposalCampaigns: [
  "01V001000",
  "00V048000",
  "17V047000",
  "03V421000",
  "15V318000",
  "12V126000",
  "13V407000",
  "15V188000",
  "12V475000",
  "16V540000",
  "16V914000",
  "15V718000",
  "18V323000",
  "19V684000",
  "18V473000",
  "19V883000",
  "19V513000",
  "20V598000"
],
});
