const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW M4 CS",
  model: "M4 CS",
  slug: "bmw-m4-cs",
  batchId: "bmw-m4-cs-full-record-cohort-21-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "50b5010a71975020f17ca3cc6cd0a45075c8de371871c4acc1b94b16114e7ec8",
  sourceSnapshotFileHash: "ca39539893b325048975d2a772f7e13af7199e6a28bd63b616f26a42b7304673",
  packetFileHash: "3e3b5c68cd4dd795f1c330ffb063b45dcadd7d1d0e0926b3ea10e99daa36d261",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-m4-cs/50b5010a7197/all-0001.json",
  reviewTokens: { blind: "bmwm4cs_blind:self-no-blocker", edge: "bmwm4cs_edge:self-no-blocker" },
  proposalCampaigns: [],
});
