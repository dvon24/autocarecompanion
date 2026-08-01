const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X4",
  model: "X4",
  slug: "bmw-x4",
  batchId: "bmw-x4-full-record-cohort-29-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "266d740c5aeb9c6ef22a2a83040847839e11e757d9bc7eb63c7f425d8a6f8c4f",
  sourceSnapshotFileHash: "af96dd96d15faf337837616a36224bbb4808f6dc2d3d5935d09cccd4db068b7b",
  packetFileHash: "491b80518d60c40bb0cdcbf966e15ec51f2d216aa3f16b7b431ee69631cdbb54",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x4/266d740c5aeb/all-0001.json",
  reviewTokens: { blind: "bmwx4_blind:self-no-blocker", edge: "bmwx4_edge:self-no-blocker" },
  reasons: {
    "bmw-x4-n20-timing-chain-2015":
      "This duplicates the stable timing-chain identity retained above, incorrectly includes xDrive30i, and extends beyond the BMW bulletin's February 2015 production cutoff.",
    "bmw-x4-electric-water-pump-2015":
      "The card spans two generations and nine years without engine or failure-mode scope; recall 24V-608 is a distinct connector-sealing/fire-risk population preserved proposal-only.",
  },
  published: {
    "bmw-x4-n20-timing-chain-guide-2015": {
      disposition: "diagnosis-hold",
      decision:
        "Replace the clicked broad guide-failure card with BMW SIB 11 03 17's exact F26 N20 diagnostic scope and remove both commerce claims and all four URLs.",
      evidence: [
        {
          type: "tsb",
          label:
            "BMW SIB 11 03 17 - N20/N26 Timing-Chain and Oil-Pump Drive-Chain Limited Warranty Extension",
          url: "https://static.nhtsa.gov/odi/tsbs/2020/MC-10186213-9999.pdf",
        },
      ],
      after: {
        years: [2015],
        trims: [],
        engines: ["N20"],
        category: "engine",
        title: "2015 X4 N20 Lower-Engine Whine Requires Timing-Chain Diagnosis",
        description:
          "BMW SIB 11 03 17 identifies F26 X4 xDrive28i N20 vehicles produced from March 2014 through February 2015. A lower-engine whine that increases with engine speed can be associated with timing-chain or oil-pump-drive-chain wear; the bulletin does not declare every X4 or every N20 defective.",
        solution:
          "Confirm the exact xDrive28i variant, N20 engine, production date and VIN eligibility, then have a BMW-qualified technician reproduce the noise and follow current BMW diagnosis before replacing anything. The historical seven-year/70,000-mile coverage was a limited warranty extension, not a recall, and is not a current coverage promise. ShowMeTheParts established category-level fitment only, so no commerce link is approved.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: [
          "Whining from the lower engine area",
          "Noise frequency increases with engine speed",
        ],
        affectedSystems: ["timing-chain drive", "oil-pump drive chain"],
        dtcCodes: [],
        citations: [
          {
            type: "tsb",
            title:
              "BMW SIB 11 03 17 - N20/N26 Timing-Chain and Oil-Pump Drive-Chain Limited Warranty Extension",
            url: "https://static.nhtsa.gov/odi/tsbs/2020/MC-10186213-9999.pdf",
          },
        ],
        summary:
          "Replaced the clicked X4 timing-chain card with exact SIB 11 03 17 diagnostic scope and removed two commerce claims with four URLs.",
      },
    },
  },
  proposalCampaigns: [
  "16V683000",
  "16V333000",
  "14V648000",
  "23V797000",
  "24V608000",
  "18V453000",
  "21V096000",
  "20V152000",
  "19V563000",
  "19V684000",
  "21V521000",
  "19V291000",
  "20V598000",
  "20V164000",
  "19V678000",
  "19V738000",
  "20V355000",
  "21V598000",
  "25V636000",
  "21V199000",
  "23V211000",
  "26V056000",
  "26V438000",
  "21V831000",
  "21V646000",
  "22V070000",
  "23V821000"
],
});
