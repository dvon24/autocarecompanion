const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW Z8",
  model: "Z8",
  slug: "bmw-z8",
  batchId: "bmw-z8-full-record-cohort-38-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "97e52f6db3baa0afdef2e50a57d466da9f82ed0fe51dbada3737071badae8726",
  sourceSnapshotFileHash: "58e45b5b7e9dfa8ef7a76a9de0b0af574dd9b385f97dc10383e01d79d0ae27fe",
  packetFileHash: "4aa6896fe0719dbb6e640280adbce46104d737353405ae0bfd28dc7fb21dfb0f",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-z8/97e52f6db3ba/all-0001.json",
  reviewTokens: { blind: "bmwz8_blind:self-no-blocker", edge: "bmwz8_edge:self-no-blocker" },
  reasons: {
    "bmw-z8-soft-top-mechanism-2000":
      "The card combines cylinders, pump, cables, pulleys, microswitches, latches, adjustment and age-related wear into a universal failure and recommends unrelated door-latch/handle parts plus an unverified cylinder identity without a BMW diagnostic or repair boundary.",
  },
  proposalCampaigns: [
    "01V206000",
    "02V138000",
  ],
});
