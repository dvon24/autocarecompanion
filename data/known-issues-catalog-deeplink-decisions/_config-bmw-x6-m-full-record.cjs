const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X6 M",
  model: "X6 M",
  slug: "bmw-x6-m",
  batchId: "bmw-x6-m-full-record-cohort-33-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "7c2e23da25631fad4cca82b2b0da968990b0d4f1ab4538aee05da0d951b13c5f",
  sourceSnapshotFileHash: "b4e83840edfa13fdf1d8a6b4149495e2445950c7f6e965403ba83636858a9d9b",
  packetFileHash: "1ee5b4919b8b83f2265e7ea8949cb90bd003b3a7e13802fc925e09ebcb04188b",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x6-m/7c2e23da2563/all-0001.json",
  reviewTokens: { blind: "bmwx6m_blind:self-no-blocker", edge: "bmwx6m_edge:self-no-blocker" },
  reasons: {
    "bmw-x6m-front-thrust-arm-bushing-2015":
      "The card projects ordinary suspension wear across F86 and F96 generations, assigns a mileage interval and aftermarket upgrade without a BMW-defined defect or measurement threshold, and does not match the exact production-bounded suspension recalls found in the NHTSA sweep.",
    "bmw-x6m-s63-rod-bearing-2010":
      "Owner and aftermarket material does not establish an X6 M production-bounded rod-bearing defect, preventive replacement interval or universal repair across S63 revisions.",
    "bmw-x6m-vanos-solenoid-2015":
      "The card treats broad drivability symptoms as sludge-related VANOS solenoid failure across two generations without exact BMW fault codes, test results or a production-bounded service procedure.",
  },
  proposalCampaigns: [
    "18V248000",
    "19V823000",
    "18V614000",
    "17V727000",
    "18V680000",
    "20V434000",
    "20V484000",
    "20V678000",
  ],
});
