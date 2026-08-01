const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW Z4",
  model: "Z4",
  slug: "bmw-z4",
  batchId: "bmw-z4-full-record-cohort-37-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "e6e1586a7163688297df8a73dfa23af5b9c7d36f7e91c823ffa8ac68d15ca780",
  sourceSnapshotFileHash: "aff456646df13a477ce6ca05214d977b811b4f5ce5081213b7d85e06e62f2ea6",
  packetFileHash: "f5254844a34cd09164c138889472082c957d88996e171221323c58f1fb239301",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-z4/e6e1586a7163/all-0001.json",
  reviewTokens: { blind: "bmwz4_blind:self-no-blocker", edge: "bmwz4_edge:self-no-blocker" },
  reasons: {
    "bmw-z4-b58-coolant-tank-2019":
      "The clicked G29 card assigns coolant loss through 2026 to expansion-tank cracking without a BMW production boundary, pressure-test result or exact part revision; the clicked search link cannot establish repair fitment.",
    "bmw-z4-e85-convertible-top-hydraulic-2003":
      "The card combines pump, motor, hydraulic line, cylinder, microswitch, drain and water-ingress faults across E85 production and prescribes relocation or parts without a BMW diagnostic boundary.",
    "bmw-z4-e85-window-regulator-2003":
      "The card converts glass movement symptoms into regulator failure without separating adjustment, guide, clip, motor, switch, wiring and door damage or providing an exact BMW test procedure.",
    "bmw-z4-g29-b58-water-pump-2019":
      "The card incorrectly combines B48 and B58 pump and thermostat mechanisms through 2025 and prescribes replacement from generic symptoms without BMW fault codes, test values or a production-bounded source.",
    "bmw-z4-n54-hpfp-2009":
      "No accessible primary BMW/NHTSA document establishes the frozen 2009-2011 Z4 population, asserted universal failure rate, current coverage or a replacement path; symptoms require rail-pressure and low-pressure-supply diagnosis.",
    "bmw-z4-soft-top-hydraulic-2003":
      "Despite its identifier, the card concerns the E89 retractable hardtop and combines pump, cylinders, hoses, sensors, latches and alignment into a universal hydraulic failure without a BMW diagnostic and repair boundary.",
    "bmw-z4-vanos-solenoid-2003":
      "The card spans E85 and E89 engine families and treats broad drivability symptoms as solenoid failure; exact Z4 VANOS recalls concern housing bolts rather than the frozen solenoid mechanism.",
  },
  published: {
    "bmw-z4-electric-water-pump-2006": {
      disposition: "recall-dealer",
      decision:
        "Replace the broad clicked E85/E89 pump-failure aggregation with exact NHTSA campaign 24V-608's 2012-2016 Z4 sDrive28i connector/fire-risk population and remove all search commerce.",
      evidence: [
        {
          type: "recall",
          label: "NHTSA Part 573 Recall Report 24V-608 - Water Pump Connector",
          url: "https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V608-7082.PDF",
        },
      ],
      after: {
        years: [2012, 2013, 2014, 2015, 2016],
        trims: [],
        engines: ["N20"],
        category: "cooling",
        title: "2012-2016 Z4 sDrive28i Water-Pump Connector Recall 24V-608",
        description:
          "NHTSA campaign 24V-608 covers certain 2012-2016 BMW Z4 sDrive28i vehicles. Insufficient sealing can allow fluid into the electric water pump connector, creating a short circuit and fire risk. This is not a universal pump-wear diagnosis; applicability is VIN-specific.",
        solution:
          "Check the VIN for an open 24V-608 campaign. If open, an authorized BMW dealer inspects the water pump and connector, replaces them if necessary, and installs the protective shield free of charge. If smoke appears from the engine compartment, stop safely, switch off the vehicle, have occupants exit, move away from traffic and call emergency or roadside assistance; do not order a pump from this card.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Smoke from the engine compartment", "Electrical or coolant-pump warning"],
        affectedSystems: ["electric coolant pump", "water-pump electrical connector", "engine wiring"],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "NHTSA Part 573 Recall Report 24V-608 - Water Pump Connector",
            url: "https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V608-7082.PDF",
          },
        ],
        summary:
          "Replaced the clicked broad Z4 pump card with exact recall 24V-608 and removed all commerce.",
      },
    },
    "bmw-z4-electric-steering-rack-2003": {
      disposition: "recall-dealer",
      decision:
        "Correct the broad rack-failure claim to exact 2012 Z4 campaign 12V-302's electric power-steering assist control-module defect and VIN-specific dealer remedy.",
      evidence: [
        {
          type: "recall",
          label: "BMW/NHTSA Recall 12V-302 - Electric Power Steering Assist Control Module",
          url: "https://static.nhtsa.gov/odi/rcl/2012/RCDNN-12V302-5495.pdf",
        },
      ],
      after: {
        years: [2012],
        trims: [],
        engines: [],
        category: "steering",
        title: "2012 Z4 Electric Power-Steering Recall 12V-302",
        description:
          "NHTSA campaign 12V-302 covers a small VIN-specific population of 2012 BMW Z4 vehicles. An incorrectly manufactured capacitor in the electric power-steering assist control module can cause current variations and sudden loss of steering assistance; manual steering remains but requires greater effort.",
        solution:
          "Check the VIN for an open 12V-302 campaign. If open, an authorized BMW dealer replaces the steering-assistance module free of charge. If the steering warning and audible alert occur, maintain control, reduce speed, stop safely and arrange dealer or roadside assistance; do not replace a steering rack from this card.",
        severity: "high",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Electric power-steering warning", "Audible warning", "Sudden increase in steering effort"],
        affectedSystems: ["electric power-steering assist control module", "steering assistance"],
        dtcCodes: [],
        citations: [
          {
            type: "recall",
            title: "BMW/NHTSA Recall 12V-302 - Electric Power Steering Assist Control Module",
            url: "https://static.nhtsa.gov/odi/rcl/2012/RCDNN-12V302-5495.pdf",
          },
        ],
        summary:
          "Corrected the Z4 steering card to exact 2012 recall 12V-302 and removed universal rack advice.",
      },
    },
    "bmw-z4-n54-wastegate-rattle-2009": {
      disposition: "diagnosis-hold",
      decision:
        "Keep the stable N54 wastegate identity but narrow it to BMW SIB 01 02 12's exact 2009-2010 E89 Z4 sDrive35i scope and remove universal turbo/aftermarket advice.",
      evidence: [
        {
          type: "tsb",
          label: "BMW SIB 01 02 12 - N54 Turbocharger Wastegate Warranty Extension",
          url: "https://static.nhtsa.gov/odi/tsbs/2012/SB-10045279-7898.pdf",
        },
      ],
      after: {
        years: [2009, 2010],
        trims: [],
        engines: ["N54"],
        category: "engine",
        title: "2009-2010 Z4 sDrive35i N54 Wastegate Diagnosis",
        description:
          "BMW SIB 01 02 12 identifies 2009-2010 E89 Z4 sDrive35i vehicles within a historical emissions-warranty extension for turbocharger failure caused by a wastegate defect. The bulletin does not make every rattle a failed turbocharger, include later sDrive35is/35i years, or support aftermarket parts as a universal remedy.",
        solution:
          "Confirm the VIN, engine, production date, DME faults, boost-control data and noise source using current BMW diagnostic information. Check VIN-specific coverage history with BMW, recognizing that the bulletin's time/mileage window may have expired. Do not replace a turbocharger, actuator or wastegate from this card without the required diagnosis.",
        severity: "medium",
        confidence: "high",
        source: "nhtsa-verified",
        symptoms: ["Wastegate-area rattle", "Reduced boost", "Engine malfunction warning"],
        affectedSystems: ["N54 turbocharger wastegate", "boost control"],
        dtcCodes: [],
        citations: [
          {
            type: "tsb",
            title: "BMW SIB 01 02 12 - N54 Turbocharger Wastegate Warranty Extension",
            url: "https://static.nhtsa.gov/odi/tsbs/2012/SB-10045279-7898.pdf",
          },
        ],
        summary:
          "Bounded the Z4 N54 wastegate card to BMW SIB 01 02 12's exact 2009-2010 scope and diagnosis-first path.",
      },
    },
  },
  proposalCampaigns: [
    "03V032000",
    "04V182000",
    "03V214000",
    "04V247000",
    "19V273000",
    "22V119000",
    "17V683000",
    "13V044000",
    "09V327000",
    "14V176000",
    "23V707000",
    "17V067000",
    "14V627000",
    "13V454000",
    "19V684000",
    "19V732000",
    "20V355000",
    "21V598000",
    "20V516000",
    "25V636000",
    "19V850000",
    "20V700000",
    "21V554000",
    "26V056000",
    "23V099000",
    "26V438000",
    "23V821000",
  ],
});
