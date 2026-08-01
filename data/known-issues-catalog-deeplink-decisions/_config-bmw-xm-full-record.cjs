const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW XM",
  model: "XM",
  slug: "bmw-xm",
  batchId: "bmw-xm-full-record-cohort-35-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "023a44d9147a1133eb7c5448de86d92b802edf0ee1e300d59f8c3b512ced4061",
  sourceSnapshotFileHash: "e50aebe378b63652c855019a47cd290d26acaa4985e0b1a62a7387674a247859",
  packetFileHash: "40d52855994aa52621938f4073f65518eaf0f4bdc592f1447280187b1be9924f",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-xm/023a44d9147a/all-0001.json",
  reviewTokens: { blind: "bmwxm_blind:self-no-blocker", edge: "bmwxm_edge:self-no-blocker" },
  reasons: {
    "bmw-xm-hybrid-drivetrain-hesitation-2023":
      "The card converts subjective accelerator response into a universal hybrid-drivetrain defect and software remedy without BMW fault criteria, production scope or a diagnostic procedure that separates drive mode, state of charge, thermal limits and faults.",
    "bmw-xm-suspension-ride-quality-2023":
      "Ride firmness is configuration- and mode-dependent; the card presents a subjective characteristic as a failure and prescribes tire or suspension changes without a BMW-defined defect, measurement or repair boundary.",
  },
  published: {
    "bmw-xm-airbag-passenger-knee-recall-2023": {
      disposition: "recall-dealer",
      decision:
        "Keep the stable front-passenger knee-airbag recall identity, bind it to exact campaign 23V-622 and remove the unrelated clock-spring commerce claim.",
      evidence: [
        {
          type: "recall",
          label: "NHTSA Part 573 Recall Report 23V-622 - Front Passenger Knee Air Bag",
          url: "https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V622-2990.PDF",
        },
      ],
      after: {
        years: [2023],
        trims: [],
        engines: [],
        category: "safety",
        title: "2023 XM Front-Passenger Knee-Airbag Recall 23V-622",
        description:
          "NHTSA campaign 23V-622 includes certain 2023 BMW XM vehicles whose front-passenger knee airbag may not have been manufactured to specification and may not deploy as intended in a crash. The defect may provide no advance warning and can increase injury risk. Applicability is VIN-specific.",
        solution:
          "Check the VIN for an open 23V-622 campaign. If open, an authorized BMW dealer replaces the front-passenger knee airbag free of charge. Do not attempt airbag diagnosis or order a clock spring or airbag module from this card; supplemental-restraint work requires trained personnel and VIN-selected parts.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["No advance warning may occur", "Airbag warning lamp may illuminate"],
        affectedSystems: ["front-passenger knee airbag", "supplemental restraint system"],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "NHTSA Part 573 Recall Report 23V-622 - Front Passenger Knee Air Bag",
            url: "https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V622-2990.PDF",
          },
        ],
        summary:
          "Bound the XM front-passenger knee-airbag card to exact campaign 23V-622 and removed unrelated commerce.",
      },
    },
    "bmw-xm-integrated-brake-system-recall-2023": {
      disposition: "recall-dealer",
      decision:
        "Keep the stable Integrated Brake recall identity for the exact 2023-2024 XM population and update it from the prior campaigns to the current VIN-specific 26V-422 corrective remedy; remove all sensor commerce.",
      evidence: [
        {
          type: "recall",
          label: "NHTSA Recall 26V-422 - Integrated Brake System Corrective Recall",
          url: "https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=XM&modelYear=2024",
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
        years: [2023, 2024],
        trims: [],
        engines: [],
        category: "brakes",
        title: "2023-2024 XM Integrated Brake System Recall 26V-422",
        description:
          "NHTSA campaign 26V-422 includes certain 2023-2024 BMW XM vehicles whose Integrated Brake module may malfunction, reducing power brake assist and potentially disabling ABS and Dynamic Stability Control. Vehicles previously repaired under 24V-104 or 24V-739 require the current inspection/remedy. Applicability is VIN-specific.",
        solution:
          "Check the VIN at NHTSA and with an authorized BMW dealer when campaign 26V-422 VINs become searchable, and arrange the free dealer inspection and module replacement if required. If a brake warning appears or pedal effort increases, avoid abrupt braking, allow extra stopping distance, stop safely and contact BMW roadside assistance; wheel-speed sensors are not the recall remedy.",
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
            title: "NHTSA 2024 BMW XM Recall Results - Campaign 26V-422",
            url: "https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=XM&modelYear=2024",
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
          "Updated the XM Integrated Brake recall to the current 26V-422 corrective dealer path and removed unrelated sensor commerce.",
      },
    },
  },
  proposalCampaigns: [
    "23V294000",
    "23V471000",
    "24V139000",
    "24V345000",
    "24V697000",
  ],
});
