const config = {
  "label": "Audi R8",
  "make": "Audi",
  "model": "R8",
  "batchId": "audi-r8-full-record-cohort-1-2026-07-29",
  "auditDate": "2026-07-29",
  "snapshotHash": "3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102",
  "sourceSnapshotFileHash": "6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455",
  "packetFileHash": "cf821297dae39240ded49b69405e1e33140a9e5fe5edf42df4dc593cd4292f45",
  "packetRelativePath": "data/known-issues-catalog-deeplink-work/audi-r8/3ee40713b2b5/all-0001.json",
  "reviewTokens": {
    "blind": "r8_blind_review:no-blocker",
    "edge": "r8_edge_review:no-blocker"
  },
  "expectedIds": [
    "audi-r8-magnetic-ride-2008",
    "audi-r8-5-2-v10-excessive-oil-consumption",
    "audi-r8-5-2-v10-oil-pump-driveshaft-seal-timing-case-oil-leak",
    "audi-r8-ac-compressor-v8-2008",
    "audi-r8-carbon-buildup-2008",
    "audi-r8-carbon-fiber-sideblade-trim-clear-coat-peeling",
    "audi-r8-catalytic-converter-failure-requiring-engine-out-replacement",
    "audi-r8-clutch-pack-2008",
    "audi-r8-clutch-wear-2008",
    "audi-r8-coolant-expansion-tank-cracking-cooling-system-leaks",
    "audi-r8-direct-injection-fuel-injector-failure",
    "audi-r8-front-axle-hydraulic-lift-system-pump-failure",
    "audi-r8-front-passenger-airbag-inflator-rupture",
    "audi-r8-fuel-supply-line-chafing-heat-shield",
    "audi-r8-ignition-coil-pack-failure-causing-misfires",
    "audi-r8-led-headlight-drl-module-failure-flickering",
    "audi-r8-magnetic-ride-leak-2008",
    "audi-r8-r-tronic-hydraulic-pump-pressure-accumulator-failure",
    "audi-r8-s-tronic-actuator-2008",
    "audi-r8-s-tronic-gearbox-ventilation-hose-transmission-fluid-leak",
    "audi-r8-spyder-convertible-top-hydraulic-pump-failure",
    "audi-r8-v8-engine-bearing-2008"
  ],
  "records": {
    "audi-r8-magnetic-ride-2008": {
      "disposition": "remove",
      "decision": "Archive the frozen “Magnetic Ride Damper Fluid Leaks” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023,
          2024
        ],
        "trims": [],
        "engines": [],
        "category": "suspension",
        "title": "Archived - Unsupported Audi R8 Magnetic Ride Damper Fluid Leaks Aggregation",
        "description": "The former card combined “Magnetic Ride Damper Fluid Leaks” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Magnetic Ride Damper Fluid Leaks” aggregation and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-r8-5-2-v10-excessive-oil-consumption": {
      "disposition": "remove",
      "decision": "Archive the frozen “5.2 V10 Excessive Oil Consumption” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 4 commerce claims and 12 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023
        ],
        "trims": [],
        "engines": [
          "5.2L V10 FSI"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi R8 5.2 V10 Excessive Oil Consumption Aggregation",
        "description": "The former card combined “5.2 V10 Excessive Oil Consumption” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “5.2 V10 Excessive Oil Consumption” aggregation and removed 4 commerce claims with 12 URLs."
      }
    },
    "audi-r8-5-2-v10-oil-pump-driveshaft-seal-timing-case-oil-leak": {
      "disposition": "remove",
      "decision": "Archive the frozen “5.2 V10 Oil Pump Driveshaft Seal Timing-Case Oil Leak” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023
        ],
        "trims": [],
        "engines": [
          "5.2L V10 FSI"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi R8 5.2 V10 Oil Pump Driveshaft Seal Timing-Case Oil Leak Aggregation",
        "description": "The former card combined “5.2 V10 Oil Pump Driveshaft Seal Timing-Case Oil Leak” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “5.2 V10 Oil Pump Driveshaft Seal Timing-Case Oil Leak” aggregation and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-r8-ac-compressor-v8-2008": {
      "disposition": "remove",
      "decision": "Archive the frozen “A/C Compressor Failure Requiring Engine-Out Repair (4.2 V8)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 4 commerce claims and 6 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012
        ],
        "trims": [],
        "engines": [
          "4.2 V8"
        ],
        "category": "electrical",
        "title": "Archived - Unsupported Audi R8 A/C Compressor Failure Requiring Engine-Out Repair (4.2 V8) Aggregation",
        "description": "The former card combined “A/C Compressor Failure Requiring Engine-Out Repair (4.2 V8)” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “A/C Compressor Failure Requiring Engine-Out Repair (4.2 V8)” aggregation and removed 4 commerce claims with 6 URLs."
      }
    },
    "audi-r8-carbon-buildup-2008": {
      "disposition": "remove",
      "decision": "Archive the frozen “Carbon Buildup on Intake Valves (4.2 V8 FSI and 5.2 V10 FSI)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 2 commerce claims and 2 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [
          "4.2 FSI V8",
          "5.2 FSI V10"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi R8 Carbon Buildup on Intake Valves (4.2 V8 FSI and 5.2 V10 FSI) Aggregation",
        "description": "The former card combined “Carbon Buildup on Intake Valves (4.2 V8 FSI and 5.2 V10 FSI)” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Carbon Buildup on Intake Valves (4.2 V8 FSI and 5.2 V10 FSI)” aggregation and removed 2 commerce claims with 2 URLs."
      }
    },
    "audi-r8-carbon-fiber-sideblade-trim-clear-coat-peeling": {
      "disposition": "remove",
      "decision": "Archive the frozen “Carbon Fiber Sideblade and Trim Clear-Coat Peeling” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "exterior",
        "title": "Archived - Unsupported Audi R8 Carbon Fiber Sideblade and Trim Clear-Coat Peeling Aggregation",
        "description": "The former card combined “Carbon Fiber Sideblade and Trim Clear-Coat Peeling” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Carbon Fiber Sideblade and Trim Clear-Coat Peeling” aggregation and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-r8-catalytic-converter-failure-requiring-engine-out-replacement": {
      "disposition": "remove",
      "decision": "Archive the frozen “Catalytic Converter Failure Requiring Engine-Out Replacement” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 4 commerce claims and 12 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "exhaust",
        "title": "Archived - Unsupported Audi R8 Catalytic Converter Failure Requiring Engine-Out Replacement Aggregation",
        "description": "The former card combined “Catalytic Converter Failure Requiring Engine-Out Replacement” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Catalytic Converter Failure Requiring Engine-Out Replacement” aggregation and removed 4 commerce claims with 12 URLs."
      }
    },
    "audi-r8-clutch-pack-2008": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “R-tronic/S-tronic Clutch Pack Wear” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 37O1 R8 Gearbox Transmission-Oil Level — NHTSA 22V225",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V225000"
        }
      ],
      "after": {
        "years": [
          2021,
          2022
        ],
        "trims": [],
        "engines": [],
        "category": "transmission",
        "title": "Gearbox Underfilled: Clutch Slippage or Transmission-Oil Leak (Recall 22V225 / 37O1)",
        "description": "Certain 2021-2022 R8 Coupes and 2022 R8 Spyders may have insufficient transmission oil. The gearbox can develop clutch slippage, loss of drive power, or an oil leak near hot exhaust components.",
        "solution": "Check the VIN and campaign history with Audi or NHTSA. Under campaign 37O1, an Audi dealer inspects and corrects the transmission-oil level free of charge. If drive power drops, a clutch slips, or oil/smoke is noticed, stop safely and arrange dealer inspection.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Clutch slippage",
          "Loss of drive power",
          "Transmission-oil leak or smoke"
        ],
        "affectedSystems": [
          "dual-clutch gearbox",
          "transmission lubrication"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 37O1 R8 Gearbox Transmission-Oil Level — NHTSA 22V225",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V225000"
          }
        ],
        "summary": "Replaced the frozen “R-tronic/S-tronic Clutch Pack Wear” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-r8-clutch-wear-2008": {
      "disposition": "remove",
      "decision": "Archive the frozen “R-Tronic Clutch Premature Wear and Expensive Replacement” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [],
        "category": "transmission",
        "title": "Archived - Unsupported Audi R8 R-Tronic Clutch Premature Wear and Expensive Replacement Aggregation",
        "description": "The former card combined “R-Tronic Clutch Premature Wear and Expensive Replacement” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “R-Tronic Clutch Premature Wear and Expensive Replacement” aggregation and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-r8-coolant-expansion-tank-cracking-cooling-system-leaks": {
      "disposition": "remove",
      "decision": "Archive the frozen “Coolant Expansion Tank Cracking and Cooling System Leaks” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 3 commerce claims and 9 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "cooling",
        "title": "Archived - Unsupported Audi R8 Coolant Expansion Tank Cracking and Cooling System Leaks Aggregation",
        "description": "The former card combined “Coolant Expansion Tank Cracking and Cooling System Leaks” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Coolant Expansion Tank Cracking and Cooling System Leaks” aggregation and removed 3 commerce claims with 9 URLs."
      }
    },
    "audi-r8-direct-injection-fuel-injector-failure": {
      "disposition": "remove",
      "decision": "Archive the frozen “Direct-Injection Fuel Injector Failure” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 2 commerce claims and 6 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "fuel",
        "title": "Archived - Unsupported Audi R8 Direct-Injection Fuel Injector Failure Aggregation",
        "description": "The former card combined “Direct-Injection Fuel Injector Failure” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Direct-Injection Fuel Injector Failure” aggregation and removed 2 commerce claims with 6 URLs."
      }
    },
    "audi-r8-front-axle-hydraulic-lift-system-pump-failure": {
      "disposition": "remove",
      "decision": "Archive the frozen “Front Axle Hydraulic Lift System Pump Failure” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023
        ],
        "trims": [],
        "engines": [
          "5.2L V10 FSI"
        ],
        "category": "suspension",
        "title": "Archived - Unsupported Audi R8 Front Axle Hydraulic Lift System Pump Failure Aggregation",
        "description": "The former card combined “Front Axle Hydraulic Lift System Pump Failure” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Front Axle Hydraulic Lift System Pump Failure” aggregation and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-r8-front-passenger-airbag-inflator-rupture": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Front Passenger Airbag Inflator Rupture (Safety Recall)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 69DY/61C1 Front-Passenger Airbag Module — NHTSA 22V543",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V543000"
        }
      ],
      "after": {
        "years": [
          2016
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Front-Passenger Airbag Module May Explode or Deploy Improperly (Recall 22V543 / 69DY)",
        "description": "Certain 2016 R8 Coupes contain a front-passenger airbag module that may explode or deploy improperly, risking metal-fragment injury or inadequate occupant restraint.",
        "solution": "Check the VIN with Audi or NHTSA. Audi dealers replace the front-passenger airbag module free of charge under campaign 69DY/61C1. Do not source a used airbag module from this summary.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Open safety recall",
          "No reliable warning before airbag deployment"
        ],
        "affectedSystems": [
          "front-passenger airbag module"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 69DY/61C1 Front-Passenger Airbag Module — NHTSA 22V543",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V543000"
          }
        ],
        "summary": "Replaced the frozen “Front Passenger Airbag Inflator Rupture (Safety Recall)” card with an exact NHTSA/Audi campaign scope and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-r8-fuel-supply-line-chafing-heat-shield": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Fuel Supply Line Chafing on Heat Shield (Fire Risk Recall)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 0 commerce claims and 0 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 20Q8 R8 Spyder Fuel Supply Line — NHTSA 11V390",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=11V390000"
        }
      ],
      "after": {
        "years": [
          2011,
          2012
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "fuel",
        "title": "R8 Spyder Fuel Supply Line Can Chafe on Heat Shield (Recall 11V390 / 20Q8)",
        "description": "On certain 2011-2012 R8 Spyders, the fuel supply line can contact the engine-compartment heat shield and develop a leak, creating a fire risk near an ignition source.",
        "solution": "Check the VIN and recall status. Audi dealers inspect the line, replace it if damaged, and adjust the fuel line and heat shield for proper clearance free of charge. If fuel odor or leakage is present, stop driving and arrange immediate inspection.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Fuel odor",
          "Visible fuel leak"
        ],
        "affectedSystems": [
          "fuel supply line",
          "engine-compartment heat shield"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 20Q8 R8 Spyder Fuel Supply Line — NHTSA 11V390",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=11V390000"
          }
        ],
        "summary": "Replaced the frozen “Fuel Supply Line Chafing on Heat Shield (Fire Risk Recall)” card with an exact NHTSA/Audi campaign scope and removed 0 commerce claims with 0 URLs."
      }
    },
    "audi-r8-ignition-coil-pack-failure-causing-misfires": {
      "disposition": "remove",
      "decision": "Archive the frozen “Ignition Coil Pack Failure Causing Misfires” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 4 commerce claims and 12 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi R8 Ignition Coil Pack Failure Causing Misfires Aggregation",
        "description": "The former card combined “Ignition Coil Pack Failure Causing Misfires” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Ignition Coil Pack Failure Causing Misfires” aggregation and removed 4 commerce claims with 12 URLs."
      }
    },
    "audi-r8-led-headlight-drl-module-failure-flickering": {
      "disposition": "replace",
      "decision": "Replace the frozen “LED Headlight / DRL Module Failure and Flickering” aggregation with the bounded Audi technical-service bulletin path below. Remove all 4 commerce claims and 12 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TSB 2045106/6 — GPS or Satellite-Radio Reception and FAKRA Coaxial Connection",
          "url": "https://static.nhtsa.gov/odi/tsbs/2020/MC-10178568-0001.pdf"
        }
      ],
      "after": {
        "years": [
          2018,
          2019,
          2020,
          2021
        ],
        "trims": [],
        "engines": [],
        "category": "electrical",
        "title": "GPS or Satellite-Radio Reception Loss From Antenna Coaxial Connection (TSB 2045106/6)",
        "description": "Audi TSB 2045106/6 covers 2018-2021 R8 vehicles with intermittent satellite-radio linking errors or an incorrect GPS location caused by a poorly seated or damaged FAKRA coaxial connection at the shark-fin antenna.",
        "solution": "First verify the concern with a clear view of the sky and perform the TSB road-test and fault-memory checks. If the fault is at the shark-fin connection, the Audi procedure replaces the affected coaxial connector section and adapter cable, clears DTCs, and verifies reception.",
        "severity": "low",
        "confidence": "high",
        "source": "manual",
        "symptoms": [
          "Satellite radio displays Linking",
          "Antenna technical-problem message",
          "Incorrect navigation location"
        ],
        "affectedSystems": [
          "shark-fin antenna",
          "FAKRA coaxial connection",
          "MMI"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "tsb",
            "title": "Audi TSB 2045106/6 — GPS or Satellite-Radio Reception and FAKRA Coaxial Connection",
            "url": "https://static.nhtsa.gov/odi/tsbs/2020/MC-10178568-0001.pdf"
          }
        ],
        "summary": "Replaced the frozen “LED Headlight / DRL Module Failure and Flickering” card with an exact Audi TSB scope and removed 4 commerce claims with 12 URLs."
      }
    },
    "audi-r8-magnetic-ride-leak-2008": {
      "disposition": "remove",
      "decision": "Archive the frozen “Magnetic Ride Suspension Damper Leak and Premature Failure” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [],
        "category": "suspension",
        "title": "Archived - Unsupported Audi R8 Magnetic Ride Suspension Damper Leak and Premature Failure Aggregation",
        "description": "The former card combined “Magnetic Ride Suspension Damper Leak and Premature Failure” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Magnetic Ride Suspension Damper Leak and Premature Failure” aggregation and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-r8-r-tronic-hydraulic-pump-pressure-accumulator-failure": {
      "disposition": "remove",
      "decision": "Archive the frozen “R tronic Hydraulic Pump and Pressure Accumulator Failure” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "transmission",
        "title": "Archived - Unsupported Audi R8 R tronic Hydraulic Pump and Pressure Accumulator Failure Aggregation",
        "description": "The former card combined “R tronic Hydraulic Pump and Pressure Accumulator Failure” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “R tronic Hydraulic Pump and Pressure Accumulator Failure” aggregation and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-r8-s-tronic-actuator-2008": {
      "disposition": "remove",
      "decision": "Archive the frozen “S-tronic Transmission Actuator Failure” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 1 commerce claims and 1 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023,
          2024
        ],
        "trims": [],
        "engines": [],
        "category": "transmission",
        "title": "Archived - Unsupported Audi R8 S-tronic Transmission Actuator Failure Aggregation",
        "description": "The former card combined “S-tronic Transmission Actuator Failure” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “S-tronic Transmission Actuator Failure” aggregation and removed 1 commerce claims with 1 URLs."
      }
    },
    "audi-r8-s-tronic-gearbox-ventilation-hose-transmission-fluid-leak": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “S tronic Gearbox Ventilation Hose Transmission Fluid Leak (Fire Risk Recall)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 6 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 34J1 R8 Gearbox Ventilation Hose — NHTSA 18V639",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V639000"
        }
      ],
      "after": {
        "years": [
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "5.2L V10 FSI"
        ],
        "category": "transmission",
        "title": "Gearbox Ventilation Hose Can Leak Fluid Near Hot Engine Parts (Recall 18V639 / 34J1)",
        "description": "Certain 2017-2018 R8 Coupes and Spyders can leak transmission fluid from the gearbox ventilation hose after extreme high-speed or maneuvering conditions. Fluid contacting hot engine parts can smoke or ignite.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the single gearbox ventilation hose with the higher-volume double hose free of charge under campaign 34J1. Stop driving if hot-oil odor or smoke appears.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Hot transmission-oil odor",
          "Smoke after high-load driving",
          "Transmission-fluid leakage"
        ],
        "affectedSystems": [
          "S tronic gearbox",
          "gearbox ventilation hose"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 34J1 R8 Gearbox Ventilation Hose — NHTSA 18V639",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V639000"
          }
        ],
        "summary": "Replaced the frozen “S tronic Gearbox Ventilation Hose Transmission Fluid Leak (Fire Risk Recall)” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 6 URLs."
      }
    },
    "audi-r8-spyder-convertible-top-hydraulic-pump-failure": {
      "disposition": "remove",
      "decision": "Archive the frozen “Spyder Convertible Top Hydraulic Pump Failure” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 7 commerce claims and 21 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2011,
          2012,
          2013,
          2014,
          2015,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023
        ],
        "trims": [],
        "engines": [
          "4.2L V8 FSI",
          "5.2L V10 FSI"
        ],
        "category": "body",
        "title": "Archived - Unsupported Audi R8 Spyder Convertible Top Hydraulic Pump Failure Aggregation",
        "description": "The former card combined “Spyder Convertible Top Hydraulic Pump Failure” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Spyder Convertible Top Hydraulic Pump Failure” aggregation and removed 7 commerce claims with 21 URLs."
      }
    },
    "audi-r8-v8-engine-bearing-2008": {
      "disposition": "remove",
      "decision": "Archive the frozen “Rod Bearing Wear and Engine Failure Risk (4.2 V8 FSI)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi R8. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [
          "4.2 FSI"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi R8 Rod Bearing Wear and Engine Failure Risk (4.2 V8 FSI) Aggregation",
        "description": "The former card combined “Rod Bearing Wear and Engine Failure Risk (4.2 V8 FSI)” across a broad Audi R8 range without a current Audi or regulator primary source for the complete public claim.",
        "solution": "Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and fault data with Audi service information before diagnosis or repair.",
        "severity": "low",
        "confidence": "low",
        "source": "manual",
        "symptoms": [],
        "affectedSystems": [],
        "dtcCodes": [],
        "citations": [
          {
            "type": "nhtsa",
            "title": "NHTSA Audi R8 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=R8&modelYear=2022"
          }
        ],
        "summary": "Archived an unsupported Audi R8 “Rod Bearing Wear and Engine Failure Risk (4.2 V8 FSI)” aggregation and removed 2 commerce claims with 4 URLs."
      }
    }
  },
  "expectedPerRecord": {
    "audi-r8-magnetic-ride-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=4S0412019&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=4S0412019",
        "https://www.ebay.com/sch/i.html?_nkw=4S0412019",
        "https://www.amazon.com/s?k=Bilstein%20magnetic%20ride%20damper%20Audi%20R8&tag=au7o-20"
      ],
      "claimClicks": 1,
      "recordClicks": 1,
      "priorityClicks": 1
    },
    "audi-r8-5-2-v10-excessive-oil-consumption": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Engine%20oil%20filter%20element&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079198405E",
        "https://www.ebay.com/sch/i.html?_nkw=079198405E",
        "https://www.amazon.com/s?k=Audi%20R8%20Spark%20plugs&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06H905601A",
        "https://www.ebay.com/sch/i.html?_nkw=06H905601A",
        "https://www.amazon.com/s?k=Audi%20R8%20Piston%20ring%20set&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=077198151P",
        "https://www.ebay.com/sch/i.html?_nkw=077198151P",
        "https://www.amazon.com/s?k=Audi%20R8%20Valve%20stem%20oil%20seals&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=036109675A",
        "https://www.ebay.com/sch/i.html?_nkw=036109675A"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-5-2-v10-oil-pump-driveshaft-seal-timing-case-oil-leak": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=07L103707B&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=07L103707B",
        "https://www.ebay.com/sch/i.html?_nkw=07L103707B"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-ac-compressor-v8-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:3",
        "communityRecommendations:4",
        "communityRecommendations:5"
      ],
      "urls": [
        "https://www.amazon.com/s?k=4E0260805AS&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=4E0260805AS",
        "https://www.ebay.com/sch/i.html?_nkw=4E0260805AS",
        "https://www.amazon.com/s?k=BlueDriver%20Bluetooth%20Pro%20OBD2%20Scan%20Tool%20Audi%20R8&tag=au7o-20",
        "https://www.amazon.com/s?k=Innova%203340%20Automotive%20Digital%20Multimeter%20Audi%20R8&tag=au7o-20",
        "https://www.amazon.com/s?k=CRC%20QD%20Electronic%20Cleaner%20Audi%20R8&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-carbon-buildup-2008": {
      "claimIds": [
        "communityRecommendations:3",
        "communityRecommendations:4"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Fel-Pro%20Intake%20Manifold%20Gasket%20Set&tag=au7o-20",
        "https://www.amazon.com/s?k=Audi%20R8%20Dorman%20Intake%20Manifold&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-carbon-fiber-sideblade-trim-clear-coat-peeling": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Genuine%20carbon-fiber%20sideblade%20%2F%20air-intake%20blade&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=420853337F",
        "https://www.ebay.com/sch/i.html?_nkw=420853337F"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-catalytic-converter-failure-requiring-engine-out-replacement": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Catalytic%20converter%20with%20integrated%20exhaust%20manifold&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=420251211",
        "https://www.ebay.com/sch/i.html?_nkw=420251211",
        "https://www.amazon.com/s?k=Audi%20R8%20Catalytic%20converter%20with%20integrated%20exhaust%20manifold&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=420251212",
        "https://www.ebay.com/sch/i.html?_nkw=420251212",
        "https://www.amazon.com/s?k=Audi%20R8%20Catalytic%20converter%20with%20integrated%20exhaust%20manifold&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=420131089A",
        "https://www.ebay.com/sch/i.html?_nkw=420131089A",
        "https://www.amazon.com/s?k=Audi%20R8%20Exhaust%20manifold-to-cylinder-head%20gasket&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=07L253039",
        "https://www.ebay.com/sch/i.html?_nkw=07L253039"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-clutch-pack-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=0BZ141029C&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=0BZ141029C",
        "https://www.ebay.com/sch/i.html?_nkw=0BZ141029C",
        "https://www.amazon.com/s?k=LuK%20clutch%20kit%20Audi%20R8&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-clutch-wear-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:3"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079141011E&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079141011E",
        "https://www.ebay.com/sch/i.html?_nkw=079141011E",
        "https://www.amazon.com/s?k=Exedy%20clutch%20kit%20Audi%20R8&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-coolant-expansion-tank-cracking-cooling-system-leaks": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Coolant%20expansion%20%2F%20overflow%20tank&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=420121403",
        "https://www.ebay.com/sch/i.html?_nkw=420121403",
        "https://www.amazon.com/s?k=Audi%20R8%20Expansion%20tank%20pressure%20cap&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=3B0121321",
        "https://www.ebay.com/sch/i.html?_nkw=3B0121321",
        "https://www.amazon.com/s?k=Audi%20R8%20Coolant%20%2F%20antifreeze&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=G013A8JM1",
        "https://www.ebay.com/sch/i.html?_nkw=G013A8JM1"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-direct-injection-fuel-injector-failure": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20FSI%20direct-injection%20fuel%20injector&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079906036AB",
        "https://www.ebay.com/sch/i.html?_nkw=079906036AB",
        "https://www.amazon.com/s?k=Audi%20R8%20FSI%20direct-injection%20fuel%20injector&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=07L906036M",
        "https://www.ebay.com/sch/i.html?_nkw=07L906036M"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-front-axle-hydraulic-lift-system-pump-failure": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Front%20axle%20lift%20system%20pump&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4S0616007D",
        "https://www.ebay.com/sch/i.html?_nkw=4S0616007D"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-front-passenger-airbag-inflator-rupture": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Front%20passenger%20frontal%20airbag%20module&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4S0-880-204-E",
        "https://www.ebay.com/sch/i.html?_nkw=4S0-880-204-E"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-fuel-supply-line-chafing-heat-shield": {
      "claimIds": [],
      "urls": [],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-ignition-coil-pack-failure-causing-misfires": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Ignition%20coil%20pack%20-%20Audi%20R8&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06E905115G",
        "https://www.ebay.com/sch/i.html?_nkw=06E905115G",
        "https://www.amazon.com/s?k=Audi%20R8%20Ignition%20coil%20pack%20-%20Audi%20R8&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=07L905115B",
        "https://www.ebay.com/sch/i.html?_nkw=07L905115B",
        "https://www.amazon.com/s?k=Audi%20R8%20Spark%20plugs%20-%20Audi%20R8%204.2&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06H905601A",
        "https://www.ebay.com/sch/i.html?_nkw=06H905601A",
        "https://www.amazon.com/s?k=Audi%20R8%20Valve%20cover%20gasket%20set%20-%20address&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=07L103484F",
        "https://www.ebay.com/sch/i.html?_nkw=07L103484F"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-led-headlight-drl-module-failure-flickering": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Full-LED%20%2F%20Matrix%20LED%20headlight%20assembly&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4S0941033",
        "https://www.ebay.com/sch/i.html?_nkw=4S0941033",
        "https://www.amazon.com/s?k=Audi%20R8%20Full-LED%20%2F%20Matrix%20LED%20headlight%20assembly&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4S0941034",
        "https://www.ebay.com/sch/i.html?_nkw=4S0941034",
        "https://www.amazon.com/s?k=Audi%20R8%20Laser%20high-beam%20LED%20headlight%20assembly&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4S0941085B",
        "https://www.ebay.com/sch/i.html?_nkw=4S0941085B",
        "https://www.amazon.com/s?k=Audi%20R8%20Laser%20high-beam%20LED%20headlight%20assembly&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4S0941086M",
        "https://www.ebay.com/sch/i.html?_nkw=4S0941086M"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-magnetic-ride-leak-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=420412019AJ&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=420412019AJ",
        "https://www.ebay.com/sch/i.html?_nkw=420412019AJ",
        "https://www.amazon.com/s?k=KW%20Suspension%20V3%20Coilover%20Kit%20(R8%20Gen%201)&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-r-tronic-hydraulic-pump-pressure-accumulator-failure": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=086325585&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=086325585",
        "https://www.ebay.com/sch/i.html?_nkw=086325585"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-s-tronic-actuator-2008": {
      "claimIds": [
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Genuine%20Audi%20G052529A6%20S-tronic%20fluid%20R8&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-s-tronic-gearbox-ventilation-hose-transmission-fluid-leak": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Gearbox%20ventilation&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=0BZ301469A",
        "https://www.ebay.com/sch/i.html?_nkw=0BZ301469A",
        "https://www.amazon.com/s?k=Audi%20R8%20S%20tronic%20dual-clutch%20transmission%20fluid&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=G052529A2",
        "https://www.ebay.com/sch/i.html?_nkw=G052529A2"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-spyder-convertible-top-hydraulic-pump-failure": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3",
        "fixParts:4",
        "fixParts:5",
        "fixParts:6"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20R8%20Convertible%20top%20hydraulic%20pump%20%2F%20motor&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=427871791",
        "https://www.ebay.com/sch/i.html?_nkw=427871791",
        "https://www.amazon.com/s?k=Audi%20R8%20Hydraulic%20pump%20mounting%20%2F%20hardware%20repair&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=427898997",
        "https://www.ebay.com/sch/i.html?_nkw=427898997",
        "https://www.amazon.com/s?k=Audi%20R8%20Oil%20reservoir%20%2F%20seal%20repair%20kit&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=427898998",
        "https://www.ebay.com/sch/i.html?_nkw=427898998",
        "https://www.amazon.com/s?k=Audi%20R8%20Pump%20hose-connection%20O-ring%20%2F%20seal%20set&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=427898472",
        "https://www.ebay.com/sch/i.html?_nkw=427898472",
        "https://www.amazon.com/s?k=Audi%20R8%20Convertible%20top%20hydraulic%20cylinder&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=427871607",
        "https://www.ebay.com/sch/i.html?_nkw=427871607",
        "https://www.amazon.com/s?k=Audi%20R8%20Convertible%20top%20travel%20%2F%20position%20sensor&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=427959109A",
        "https://www.ebay.com/sch/i.html?_nkw=427959109A",
        "https://www.amazon.com/s?k=Audi%20R8%20Hydraulic%20fluid&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=1405116",
        "https://www.ebay.com/sch/i.html?_nkw=1405116"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-r8-v8-engine-bearing-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079105701P&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079105701P",
        "https://www.ebay.com/sch/i.html?_nkw=079105701P",
        "https://www.amazon.com/s?k=ARP%202000%20Series%20Connecting%20Rod%20Bolt%20Kit%20(R8%204.2%20V8%20FSI)&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    }
  },
  "expectedTelemetry": {
    "claimCount": 52,
    "urlCount": 134,
    "claimClickCount": 1,
    "recordClickCount": 1,
    "priorityClickCount": 1
  },
  "expectedDispositionCounts": {
    "remove": 17,
    "recall-dealer": 4,
    "replace": 1
  },
  "expectedPublished": 5,
  "expectedArchived": 17,
  "controlledDeltaProposals": [],
  "expectedProposalIdentities": []
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
  "audi-r8-clutch-pack-2008": [
    2021,
    2022
  ],
  "audi-r8-front-passenger-airbag-inflator-rupture": [
    2016
  ],
  "audi-r8-fuel-supply-line-chafing-heat-shield": [
    2011,
    2012
  ],
  "audi-r8-led-headlight-drl-module-failure-flickering": [
    2018,
    2019,
    2020,
    2021
  ],
  "audi-r8-s-tronic-gearbox-ventilation-hose-transmission-fluid-leak": [
    2017,
    2018
  ]
};
  const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
  if (
    Object.entries(expectedYears).some(([id, years]) => JSON.stringify(byId.get(id).years) !== JSON.stringify(years)) ||
    issues.filter((issue) => issue.after.status === 'published').length !== config.expectedPublished ||
    issues.filter((issue) => issue.after.status === 'archived').length !== config.expectedArchived
  ) {
    throw new Error('Audi R8 reviewed scopes or published/archived split drifted.');
  }
};

module.exports = config;
