const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X4 M",
  model: "X4 M",
  slug: "bmw-x4-m",
  batchId: "bmw-x4-m-full-record-cohort-30-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "38e064d6c5f7d0e3efafd1cb73e2413eeafeb5234a605d1f3eca93570a82f336",
  sourceSnapshotFileHash: "e121c3fea9c6778f8134e8b64b16ed004d3ffd1182396da0bb93e0fd052d8c40",
  packetFileHash: "1c8c78a6e24d1e5564e9f4978687a59435eb66f0cf57b617762221e4b08b1e97",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x4-m/38e064d6c5f7/all-0001.json",
  reviewTokens: { blind: "bmwx4m_blind:self-no-blocker", edge: "bmwx4m_edge:self-no-blocker" },
  reasons: {
    "bmw-x4m-brake-wear-2020":
      "The frozen card converts driver use and vehicle mass into fixed pad/rotor lifetimes, prices and branded upgrade advice without a BMW-defined defect or diagnostic threshold.",
    "bmw-x4m-cooling-track-use-2020":
      "A forum cannot establish a production-wide heat-soak defect or support universal aftermarket cooling upgrades and preventive replacement intervals.",
    "bmw-x4m-differential-bolt-2020":
      "The card asserts an undersized factory bolt and mandatory branded upgrade from community reports without a BMW bulletin defining a failure population or remedy.",
    "bmw-x4m-s58-bearing-recall-2020":
      "No accessible primary BMW/NHTSA document validates the frozen campaign identity, F98 production scope, major repair description or aftermarket bearing recommendation.",
    "bmw-x4m-transfer-case-2020":
      "The card mixes fluid, tires, tuning and internal-failure diagnoses, contradicts BMW service policy and prescribes unsupported intervals without a primary source.",
  },
  proposalCampaigns: [
  "20V598000",
  "21V096000",
  "19V684000",
  "20V164000",
  "20V355000",
  "23V211000",
  "21V831000"
],
});
