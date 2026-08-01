const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X2",
  model: "X2",
  slug: "bmw-x2",
  batchId: "bmw-x2-full-record-cohort-26-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "edf76c5f8e7d1401198e2c5a95e094ad74f262c30decaba0741594c42e6a2541",
  sourceSnapshotFileHash: "5f6472b0b515773b88fa67f3161f9d8e72cf5e127d7947c6d9207c5d7eb6df21",
  packetFileHash: "9bef74508a9ea48b9ba228c4515eb37585ed885852500c01decd9599f7316cc1",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x2/edf76c5f8e7d/all-0001.json",
  reviewTokens: { blind: "bmwx2_blind:self-no-blocker", edge: "bmwx2_edge:self-no-blocker" },
  reasons: {
    "bmw-x2-transmission-jerking-2018":
      "The cited BMW bulletin is a general transmission-training document, not an X2 defect bulletin, and does not support the asserted oil-pump failure, prices or universal repair ladder. Its two clicks increase review priority but cannot preserve unsupported claims.",
    "bmw-x2-b48-timing-chain-tensioner-2018":
      "No exact BMW communication establishes the asserted X2 B48 tensioner defect, mileage window or updated component.",
    "bmw-x2-front-control-arm-bushings-2018":
      "The citation is only a BMW corporate home page and does not establish an X2 production scope, failure mechanism or repair.",
    "bmw-x2-oil-filter-housing-2018":
      "The card combines gasket leakage, housing cracking and oil-coolant mixing, then prescribes named aftermarket parts without an exact BMW source.",
    "bmw-x2-oil-filter-housing-gasket-2018":
      "This duplicates the oil-filter-housing aggregation and has no citation supporting its six-year population or remedy.",
    "bmw-x2-valve-cover-gasket-2018":
      "A generic NHTSA vehicle page and fabricated video URL do not establish the fixed-mileage failure, assembly part number, cost or universal repair claim.",
  },
  published: {
    "bmw-x2-crankshaft-sensor-recall-2018": {
      disposition: "recall-dealer",
      decision:
        "Correct the campaign number from 18V-565 to 18V-465, narrow the frozen card to the exact 2018 X2 recall population and remove its commerce link.",
      evidence: [
        {
          type: "recall",
          label: "NHTSA Safety Recall Report 18V-465 - Crankshaft Sensor",
          url: "https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V465-8379.PDF",
        },
      ],
      after: {
        years: [2018],
        trims: [],
        engines: [],
        category: "engine",
        title: "2018 X2 Crankshaft Sensor Safety Recall 18V-465",
        description:
          "NHTSA campaign 18V-465 covers certain 2018 BMW X2 sDrive28i and xDrive28i vehicles produced from May 16 through June 6, 2018. Incorrect sensor firmware can fail to process crankshaft-reluctor-ring input accurately, causing rough running, reduced power or an engine stall. Applicability is VIN-specific.",
        solution:
          "Check the VIN for an open 18V-465 campaign. If open, an authorized BMW dealer replaces the crankshaft sensor free of charge. A stall or sudden loss of power requires moving to a safe location and arranging BMW assistance; do not order a sensor from this card. ShowMeTheParts resolved exact X2 category fitment only, so no commerce link is approved.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Rough-running engine", "Reduced engine power", "Engine stall"],
        affectedSystems: ["crankshaft position sensor", "engine management"],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "NHTSA Safety Recall Report 18V-465 - Crankshaft Sensor",
            url: "https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V465-8379.PDF",
          },
        ],
        summary:
          "Corrected the campaign identity and population for the X2 crankshaft-sensor recall and removed its unsupported commerce claim and URL.",
      },
    },
    "bmw-x2-tie-rod-recall-2019": {
      disposition: "recall-dealer",
      decision:
        "Replace the uncited broad tie-rod narrative with exact NHTSA campaign 19V-601 scope and remove both commerce claims and URLs.",
      evidence: [
        {
          type: "recall",
          label: "BMW SIB 32 07 19 / NHTSA Recall 19V-601 - Steering Gear Tie Rod",
          url: "https://static.nhtsa.gov/odi/rcl/2019/RCRIT-19V601-0629.pdf",
        },
      ],
      after: {
        years: [2019],
        trims: [],
        engines: [],
        category: "suspension",
        title: "2019 X2 Steering Tie-Rod Safety Recall 19V-601",
        description:
          "BMW SIB 32 07 19 and NHTSA campaign 19V-601 cover a VIN-specific 2019 X2 xDrive28i population. A cone collar disc may not have been installed on a steering tie rod, allowing excessive tie-rod-end wear and eventual breakage with loss of steering control.",
        solution:
          "Check the VIN in BMW AIR or NHTSA for an open 19V-601 campaign. If open, an authorized BMW dealer checks both tie rods and replaces the tie rods and ball joints as necessary free of charge. Do not infer recall eligibility from model year alone or order steering parts from this card.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Steering looseness", "Abnormal steering noise", "Loss of steering control if a tie rod breaks"],
        affectedSystems: ["steering gear tie rods", "tie-rod-end ball joints"],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "BMW SIB 32 07 19 / NHTSA Recall 19V-601 - Steering Gear Tie Rod",
            url: "https://static.nhtsa.gov/odi/rcl/2019/RCRIT-19V601-0629.pdf",
          },
        ],
        summary:
          "Bounded the X2 tie-rod card to recall 19V-601 and removed two unsupported commerce claims and two URLs.",
      },
    },
  },
  proposalCampaigns: [
  "20V283000",
  "21V554000"
],
});
