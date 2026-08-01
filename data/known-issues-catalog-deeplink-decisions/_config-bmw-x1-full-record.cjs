const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X1",
  model: "X1",
  slug: "bmw-x1",
  batchId: "bmw-x1-full-record-cohort-25-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "d86ef234cfbd886673e8fea8d381f661e54705d7eb0930be3f47a47d33e4726f",
  sourceSnapshotFileHash: "b0b49a2a3c2120419c106e6bb0b55a2474dae4a54f3c2caac11fa7bc87c204c0",
  packetFileHash: "54c5954c2b52815b63ee2ea21c2089942fd73d22afbfa7ecc92196df6241b99b",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x1/d86ef234cfbd/all-0001.json",
  reviewTokens: { blind: "bmwx1_blind:self-no-blocker", edge: "bmwx1_edge:self-no-blocker" },
  published: {
    "bmw-x1-n20-timing-chain-2013": {
      disposition: "diagnosis-hold",
      decision:
        "Replace the frozen N20 failure aggregation with the bounded BMW diagnostic path below. Remove its unsupported preventive-replacement, settlement and universal-kit claims and all commerce links.",
      evidence: [
        {
          type: "tsb",
          label:
            "BMW SIB 11 03 17 - N20/N26 Timing-Chain and Oil-Pump Drive-Chain Limited Warranty Extension",
          url: "https://static.nhtsa.gov/odi/tsbs/2020/MC-10186213-9999.pdf",
        },
      ],
      after: {
        years: [2013, 2014, 2015],
        trims: [],
        engines: ["N20"],
        category: "engine",
        title: "Lower-Engine Whine Requires X1 N20 Timing-Chain Diagnosis",
        description:
          "BMW SIB 11 03 17 identifies E84 X1 sDrive28i and xDrive28i vehicles with the N20 engine produced from June 2012 through February 2015. A whining noise from the lower engine area that rises with engine speed can be associated with wear in the timing-chain or oil-pump drive-chain system; the bulletin does not declare every X1 defective.",
        solution:
          "Confirm the exact model, N20 engine, production date and VIN eligibility, then have a BMW-qualified technician reproduce the noise and follow current BMW diagnosis before replacing anything. The historical seven-year/70,000-mile coverage was a limited warranty extension, not a recall, and is not a current coverage promise. ShowMeTheParts established category-level fitment only, so no commerce link is approved.",
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
          "Replaced the broad X1 N20 timing-chain card with the exact SIB 11 03 17 diagnostic scope and removed all unsupported commerce claims and URLs.",
      },
    },
  },
  proposalCampaigns: [
  "20V017000",
  "24V608000",
  "16V747000",
  "19V349000",
  "15V887000",
  "18V465000",
  "19V601000",
  "19V074000",
  "20V283000",
  "21V554000",
  "22V513000",
  "23V079000",
  "23V260000",
  "24V104000",
  "24V697000",
  "24V739000",
  "26V422000"
],
});
