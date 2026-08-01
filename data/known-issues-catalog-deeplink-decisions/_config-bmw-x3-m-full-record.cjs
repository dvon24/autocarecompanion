const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X3 M",
  model: "X3 M",
  slug: "bmw-x3-m",
  batchId: "bmw-x3-m-full-record-cohort-28-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "394a95cda54f2f4297a646d371acca24cb96e8d468f513c46892ce6450cd973b",
  sourceSnapshotFileHash: "367ba6170c119166f3fcbc0395f0a7d94d9142dd0f5a52c5064a75338b2b479e",
  packetFileHash: "36bcf3eadf1032c67da90e3aa514cf2d588125f283e0fd6ecfd45743d69e0c9d",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x3-m/394a95cda54f/all-0001.json",
  reviewTokens: { blind: "bmwx3m_blind:self-no-blocker", edge: "bmwx3m_edge:self-no-blocker" },
  reasons: {
    "bmw-x3-m-idrive-control-display-blank-screen-infotainment-glitches-f9":
      "The aftermarket articles combine software, head-unit, display-panel and camera symptoms without a BMW-defined F97 population or single diagnostic remedy.",
    "bmw-x3-m-low-mounted-engine-oil-cooler-vulnerable-to-road-debris-punc":
      "An aftermarket buyer guide cannot establish a manufacturing defect or universal guard/replacement path for impact damage.",
    "bmw-x3-m-oem-plastic-charge-pipe-cracking-blow-off-under-boost-f97-x3":
      "Retailer product pages do not establish the asserted stock-vehicle failure population or prove an aftermarket upgrade as a universal repair.",
    "bmw-x3m-s58-bearing-recall-2020":
      "No accessible primary BMW/NHTSA document validates the frozen campaign number, X3 M production scope, major repair description or aftermarket bearing advice; a forum thread cannot carry a recall identity.",
    "bmw-x3m-transfer-case-2020":
      "The card contradicts BMW service policy, prescribes an unsupported interval and mixes fluid, tires, tuning, actuator and internal-failure diagnoses without a primary source.",
  },
  published: {
    "bmw-x3-m-electric-wastegate-actuator-adaptation-fault-boost-cutout-ea": {
      disposition: "diagnosis-hold",
      decision:
        "Keep the stable wastegate-adaptation identity but narrow it to BMW SIB 12 01 20's exact fault-code, production and software procedure; no commerce existed or is added.",
      evidence: [
        {
          type: "tsb",
          label: "BMW SIB 12 01 20 - S58T Electric Wastegate Faults Stored in DME",
          url: "https://static.nhtsa.gov/odi/tsbs/2020/MC-10174002-9999.pdf",
        },
      ],
      after: {
        years: [2020],
        trims: [],
        engines: ["S58"],
        category: "engine",
        title: "2020 X3 M Wastegate Adaptation Faults Require Software Diagnosis",
        description:
          "BMW SIB 12 01 20 covers F97 X3 M vehicles produced through March 2020 when DME fault 123518 and/or 120408 is stored. BMW identifies an adaptation error in the calculated setpoints of the two electric wastegates; the bulletin does not establish mechanical actuator or turbocharger wear.",
        solution:
          "Confirm the production date, fault codes and current vehicle integration level. If the I-level is below S15A-20-03-510, a BMW-qualified repairer follows the bulletin and programs the vehicle with the specified or newer approved ISTA level. Diagnose unrelated mechanical noise separately; do not replace an actuator or turbocharger from this card.",
        severity: "medium",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Engine malfunction warning", "Charge-pressure control deactivation"],
        affectedSystems: ["DME wastegate adaptation", "electric turbocharger wastegates"],
        dtcCodes: ["123518", "120408"],
        citations: [
          {
            type: "tsb",
            title: "BMW SIB 12 01 20 - S58T Electric Wastegate Faults Stored in DME",
            url: "https://static.nhtsa.gov/odi/tsbs/2020/MC-10174002-9999.pdf",
          },
        ],
        summary:
          "Bounded the X3 M wastegate card to BMW SIB 12 01 20's exact production, faults and software procedure with zero commerce.",
      },
    },
    "bmw-x3-m-fuel-tank-inlet-check-valve-weld-failure-2021-x3-m": {
      disposition: "recall-dealer",
      decision:
        "Keep the stable fuel-tank recall identity, replace the secondary citation with BMW/NHTSA material and narrow it to the exact VIN-specific March 3, 2021 production scope.",
      evidence: [
        {
          type: "recall",
          label: "BMW SIB 16 01 21 / NHTSA Recall 21V-199 - Fuel Tank",
          url: "https://static.nhtsa.gov/odi/rcl/2021/RCMN-21V199-7708.pdf",
        },
      ],
      after: {
        years: [2021],
        trims: [],
        engines: [],
        category: "fuel",
        title: "2021 X3 M Fuel-Tank Safety Recall 21V-199",
        description:
          "BMW SIB 16 01 21 and NHTSA campaign 21V-199 cover a small VIN-specific population of 2021 F97 X3 M vehicles produced on March 3, 2021. An out-of-specification fuel-tank weld can leak after driving vibration, creating a fire risk in the presence of an ignition source.",
        solution:
          "Check the VIN for an open 21V-199 campaign. If open, an authorized BMW dealer replaces the fuel tank free of charge. If fuel odor or leakage appears, move safely away from traffic, stop, have occupants exit and contact BMW roadside assistance; do not continue driving or order a tank from this card.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Fuel odor", "Fuel leaking beneath the vehicle"],
        affectedSystems: ["fuel tank", "fuel-tank weld", "filler-pipe connection"],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "BMW SIB 16 01 21 / NHTSA Recall 21V-199 - Fuel Tank",
            url: "https://static.nhtsa.gov/odi/rcl/2021/RCMN-21V199-7708.pdf",
          },
        ],
        summary:
          "Verified and narrowed the X3 M fuel-tank recall to campaign 21V-199's exact production and dealer remedy with zero commerce.",
      },
    },
    "bmw-x3-m-improperly-welded-front-seat-frame-2019-2021-x3-m": {
      disposition: "recall-dealer",
      decision:
        "Correct the broad 2019-2021 X3 M claim to BMW's exact F97 production scope and retain only the VIN-specific dealer recall path for 23V-211.",
      evidence: [
        {
          type: "recall",
          label: "BMW SIB 52 08 23 / NHTSA Recall 23V-211 - Front Seat Frame",
          url: "https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V211-3722.pdf",
        },
      ],
      after: {
        years: [2021],
        trims: [],
        engines: [],
        category: "safety",
        title: "2021 X3 M Front Seat-Frame Safety Recall 23V-211",
        description:
          "BMW SIB 52 08 23 identifies an F97 X3 M produced on December 20, 2020 within NHTSA campaign 23V-211. The driver and/or front passenger seat frame may not have been produced to specification and may increase injury risk in a crash. Applicability and the affected side are VIN-specific.",
        solution:
          "Check the VIN for an open 23V-211 campaign. If open, an authorized BMW dealer replaces the affected front seat frame and backrest free of charge using VIN-selected parts. Contact BMW promptly if a front seat vibrates or makes abnormal noise; do not order seat components from this card.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Front-seat vibration", "Abnormal front-seat noise"],
        affectedSystems: ["driver seat frame", "front passenger seat frame", "seat backrest"],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "BMW SIB 52 08 23 / NHTSA Recall 23V-211 - Front Seat Frame",
            url: "https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V211-3722.pdf",
          },
        ],
        summary:
          "Corrected the X3 M seat-frame recall to BMW's exact F97 production scope and VIN-specific dealer remedy with zero commerce.",
      },
    },
  },
  proposalCampaigns: [
  "20V598000",
  "21V096000",
  "20V152000",
  "19V684000",
  "20V164000",
  "20V355000",
  "24V534000",
  "24V764000",
  "23V821000"
],
});
