const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X7",
  model: "X7",
  slug: "bmw-x7",
  batchId: "bmw-x7-full-record-cohort-34-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "43242c09d6ee43e90e69366ed9ce5a809a2fe17918d94c53dbbb40253b1e03ac",
  sourceSnapshotFileHash: "23647b5029f4408631853d903c917ba27d3a753d75e98c8206e253b297e2138a",
  packetFileHash: "db59e7db54a81150b14590fbda19705ed3c2c65773deb3c115e040a4c3334a5d",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x7/43242c09d6ee/all-0001.json",
  reviewTokens: { blind: "bmwx7_blind:self-no-blocker", edge: "bmwx7_edge:self-no-blocker" },
  reasons: {
    "bmw-x7-n63-oil-consumption-2019":
      "The clicked card misidentifies the M60i engine, carries an unrelated older N63 bulletin/class-action claim into the G07 population and prescribes seal kits before BMW oil-consumption measurement and root-cause diagnosis; the clicked search URLs cannot be safely deep-linked.",
    "bmw-x7-air-suspension-compressor-2019":
      "The clicked card treats ride-height symptoms as compressor failure across all G07 years and recommends a catalog part before leak, power-supply, valve-block, sensor and control diagnosis; the clicked search URL cannot establish repair fitment.",
    "bmw-x7-48v-battery-2020":
      "The broad 2020-2023 card does not match NHTSA campaign 20V-761's exact 2021 connection defect and mixes battery, starter-generator, software and charging diagnoses without a BMW-defined universal remedy.",
    "bmw-x7-air-suspension-2019":
      "This duplicate air-suspension aggregation combines compressor, air-spring, line, valve-block and sensor faults and prescribes parts across multiple production revisions without BMW diagnostic boundaries.",
    "bmw-x7-b58-coolant-2019":
      "The card combines tank, cap, hose, pump, thermostat and oil-filter-housing leaks into one failure across B58 revisions and cannot support parts replacement without pressure testing and VIN-specific BMW information.",
    "bmw-x7-b58-coolant-expansion-tank-2019":
      "The card assigns all coolant loss to an expansion-tank crack through 2026 without a BMW production boundary, verified failure rate or test result and prescribes a part before leak localization.",
    "bmw-x7-panoramic-roof-rattle-2019":
      "The broad card converts multiple trim, seal, cassette, headliner and body-noise possibilities into a universal lubrication or adjustment procedure without an exact BMW bulletin and production scope.",
    "bmw-x7-sunroof-leak-2019":
      "The card does not distinguish blocked drains, displaced hoses, glass adjustment, seal damage, windshield/body leaks or prior repairs and lacks an exact BMW diagnostic and production boundary.",
    "bmw-x7-tire-wear-2019":
      "Tire wear depends on fitted tire, pressure, alignment, ride height, loading and driving; the card asserts a universal premature-wear defect and replacement advice without a BMW-defined affected population.",
  },
  published: {
    "bmw-x7-ibs-brake-recall-2023": {
      disposition: "recall-dealer",
      decision:
        "Keep the stable Integrated Brake recall identity for the exact 2023-2025 X7 population and replace the stale campaign wording and commerce with the current VIN-specific 26V-422 corrective-recall chain.",
      evidence: [
        {
          type: "recall",
          label: "NHTSA Recall 26V-422 - Integrated Brake System Corrective Recall",
          url: "https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=X7&modelYear=2024",
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
        years: [2023, 2024, 2025],
        trims: [],
        engines: [],
        category: "brakes",
        title: "2023-2025 X7 Integrated Brake System Recall 26V-422",
        description:
          "NHTSA campaign 26V-422 includes certain 2023-2025 BMW X7 vehicles whose Integrated Brake module may malfunction, reducing power brake assist and potentially disabling ABS and Dynamic Stability Control. The current corrective campaign states that vehicles previously repaired under 24V-104 or 24V-739 require the new inspection/remedy. Applicability is VIN-specific.",
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
            title: "NHTSA 2024 BMW X7 Recall Results - Campaign 26V-422",
            url: "https://api.nhtsa.gov/recalls/recallsByVehicle?make=BMW&model=X7&modelYear=2024",
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
          "Updated the X7 Integrated Brake recall to the current 26V-422 corrective dealer path and removed all commerce.",
      },
    },
  },
  proposalCampaigns: [
    "19V386000",
    "19V513000",
    "21V096000",
    "19V541000",
    "19V135000",
    "19V684000",
    "21V062000",
    "22V267000",
    "22V670000",
    "24V576000",
    "25V644000",
    "19V631000",
    "20V052000",
    "20V528000",
    "20V465000",
    "20V678000",
    "20V761000",
    "21V156000",
    "21V031000",
    "20V514000",
    "22V725000",
    "22V820000",
    "23V294000",
    "24V697000",
    "23V471000",
    "23V622000",
    "24V138000",
    "24V345000",
    "25V556000",
    "25V837000",
  ],
});
