const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X6",
  model: "X6",
  slug: "bmw-x6",
  batchId: "bmw-x6-full-record-cohort-32-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "1b1afb683373daab75a566d29e1dd4b7f89f5a27dc97237b0fd84188c43cd141",
  sourceSnapshotFileHash: "e4a19cfb249b89e67a1c54058dba99326a8200e8bdcd3ab2272c34f1cf1c68ee",
  packetFileHash: "8fce0b9fea77c32cd6a1c1a922596df986728b08f7c484579e99b3ba90a84418",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x6/1b1afb683373/all-0001.json",
  reviewTokens: { blind: "bmwx6_blind:self-no-blocker", edge: "bmwx6_edge:self-no-blocker" },
  reasons: {
    "bmw-x6-adaptive-drive-malfunction-2008":
      "The card spans E71, F16 and G06 chassis and treats warning messages as proof of a single anti-roll-bar, pump or control-unit failure without an exact BMW diagnostic boundary.",
    "bmw-x6-air-suspension-2008":
      "The card combines compressor, relay, fuse, air-spring, line and valve-block faults across three generations and prescribes parts before leak testing or BMW diagnosis.",
    "bmw-x6-n63-timing-chain-2008":
      "The frozen year range combines multiple N63 revisions and converts general owner reports into a universal timing-chain defect and replacement interval without an X6-specific BMW source.",
    "bmw-x6-n63-valve-stem-seal-wear-2008":
      "The card duplicates another broad valve-seal aggregation and does not distinguish external leaks, crankcase ventilation, turbocharger leakage, cylinder wear or an engine-revision-specific BMW diagnosis.",
    "bmw-x6-n63-valve-stem-seals-2008":
      "The card spans E71, F16 and G06 engine revisions and assigns oil consumption to valve-stem seals without BMW measurement criteria or a production-bounded universal remedy.",
    "bmw-x6-n63-wastegate-2008":
      "The owner-material aggregation cannot distinguish wastegate adaptation, vacuum control, actuator, turbocharger or exhaust noise and cannot support universal turbo replacement across N63 revisions.",
    "bmw-x6-rear-differential-bushing-2008":
      "The card projects one bushing failure and aftermarket upgrade across every X6 generation without a BMW-defined affected population, inspection threshold or VIN-selected repair.",
    "bmw-x6-transfer-case-2008":
      "The card combines tires, fluid condition, actuator faults and internal transfer-case wear across different xDrive generations without a single verified failure mechanism or remedy.",
  },
  published: {
    "bmw-x6-ibs-brake-recall-2023": {
      disposition: "recall-dealer",
      decision:
        "Keep the stable Integrated Brake recall identity, correct the frozen population to the exact 2024 X6 applicability and replace owner/forum claims with the current VIN-specific NHTSA corrective-recall chain; remove all commerce.",
      evidence: [
        {
          type: "recall",
          label: "NHTSA Recall 26V-422 - Integrated Brake System Corrective Recall",
          url: "https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=X6&modelYear=2024",
        },
        {
          type: "recall",
          label: "BMW Recall 24V-739 - Integrated Brake System",
          url: "https://static.nhtsa.gov/odi/rcl/2024/RCMN-24V739-9206.pdf",
        },
        {
          type: "recall",
          label: "BMW Recall 24V-104 - Integrated Brake System",
          url: "https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V104-5527.pdf",
        },
      ],
      after: {
        years: [2024],
        trims: [],
        engines: [],
        category: "brakes",
        title: "2024 X6 Integrated Brake System Recall 26V-422",
        description:
          "NHTSA campaign 26V-422 includes certain 2024 BMW X6 vehicles whose Integrated Brake module may malfunction, reducing power brake assist and potentially disabling ABS and Dynamic Stability Control. The current corrective campaign states that vehicles previously repaired under 24V-104 or 24V-739 require the new inspection/remedy. Applicability is VIN-specific.",
        solution:
          "Check the VIN at NHTSA and with an authorized BMW dealer when campaign 26V-422 VINs become searchable, and arrange the free dealer inspection and module replacement if required. If a brake warning appears or pedal effort increases, avoid abrupt braking, allow extra stopping distance, stop safely and contact BMW roadside assistance; do not order brake electronics from this card.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: [
          "Brake-system warning lamp or message",
          "Higher brake-pedal effort",
          "Reduced power brake assistance",
          "ABS or Dynamic Stability Control warning",
        ],
        affectedSystems: [
          "Integrated Brake module",
          "power brake assistance",
          "Antilock Brake System",
          "Dynamic Stability Control",
        ],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "NHTSA 2024 BMW X6 Recall Results - Campaign 26V-422",
            url: "https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=X6&modelYear=2024",
          },
          {
            type: "recall",
            title: "BMW Recall 24V-739 - Integrated Brake System",
            url: "https://static.nhtsa.gov/odi/rcl/2024/RCMN-24V739-9206.pdf",
          },
          {
            type: "recall",
            title: "BMW Recall 24V-104 - Integrated Brake System",
            url: "https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V104-5527.pdf",
          },
        ],
        summary:
          "Corrected the X6 Integrated Brake recall to exact 2024 applicability and the current 26V-422 corrective dealer path, with zero commerce.",
      },
    },
  },
  proposalCampaigns: [
    "19V017000",
    "18V248000",
    "20V016000",
    "20V017000",
    "17V020000",
    "16V746000",
    "16V364000",
    "11V521000",
    "18V030000",
    "09V255000",
    "10V025000",
    "17V138000",
    "16V311000",
    "10V233000",
    "12V267000",
    "19V823000",
    "17V327000",
    "18V614000",
    "18V439000",
    "17V727000",
    "18V680000",
    "19V684000",
    "21V096000",
    "20V095000",
    "20V528000",
    "21V062000",
    "20V484000",
    "20V678000",
    "22V267000",
    "24V576000",
    "25V644000",
    "20V761000",
    "20V483000",
    "21V031000",
    "23V821000",
    "23V471000",
    "23V622000",
    "24V345000",
    "24V697000",
    "25V671000",
    "25V837000",
  ],
});
