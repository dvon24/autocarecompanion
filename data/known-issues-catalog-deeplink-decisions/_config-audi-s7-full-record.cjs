const config = {
  "label": "Audi S7",
  "make": "Audi",
  "model": "S7",
  "batchId": "audi-s7-full-record-cohort-1-2026-07-29",
  "auditDate": "2026-07-29",
  "snapshotHash": "3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102",
  "sourceSnapshotFileHash": "6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455",
  "packetFileHash": "9d21186b65703aef761c1555a87fbdab4d915ecd5d064a4677338cb34a14dee9",
  "packetRelativePath": "data/known-issues-catalog-deeplink-work/audi-s7/3ee40713b2b5/all-0001.json",
  "reviewTokens": {
    "blind": "s7_blind_review:no-blocker",
    "edge": "s7_edge_review:no-blocker"
  },
  "expectedIds": [
    "audi-s7-motor-mount-failure-2012",
    "audi-s7-air-suspension-2012",
    "audi-s7-biturbo-coolant-2012",
    "audi-s7-carbon-buildup-4.0t-2012",
    "audi-s7-cylinder-demand-rough-running-hesitation",
    "audi-s7-ea839-2-9t-v6-water-pump-internal-leak-overheating",
    "audi-s7-electromechanical-steering-rack-torque-sensor-failure-causin",
    "audi-s7-front-control-arm-bushing-ball-joint-failure",
    "audi-s7-fuel-injector-deposits-failure-causing-misfire-rough-running",
    "audi-s7-gateway-control-module-shutdown-from-rear-seat-liquid-spill",
    "audi-s7-high-pressure-fuel-pump-failure-causing-hard-start-power-los",
    "audi-s7-ignition-coil-pack-failure-causing-misfires",
    "audi-s7-pcv-oil-separator-failure-causing-oil-consumption-whistling",
    "audi-s7-power-liftgate-motor-gas-strut-failure",
    "audi-s7-premature-front-brake-rotor-warping-pad-wear",
    "audi-s7-rear-differential-mount-driveshaft-center-bearing-wear-causi",
    "audi-s7-rear-view-camera-mmi-flex-harness-black-screen",
    "audi-s7-s-tronic-7-speed-dual-clutch-mechatronic-clutch-wear",
    "audi-s7-shark-fin-roof-antenna-water-intrusion-causing-gps-satellite",
    "audi-s7-sunroof-panoramic-roof-drain-clog-causing-water-intrusion-el",
    "audi-s7-turbo-oil-strainer-2012",
    "audi-s7-turbocharger-wastegate-linkage-rattle-underboost"
  ],
  "records": {
    "audi-s7-motor-mount-failure-2012": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Premature Motor Mount Failure (4.0T V8)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 74D5 Passenger Occupant Detection System — NHTSA 18V370",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V370000"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Passenger Occupant Detection Mat Can Disable the Airbag (Recall 18V370 / 74D5)",
        "description": "On certain 2013-2018 S7 vehicles with basic front seats, stress or wear in the body-sensing mat can make the passenger occupant-detection system malfunction and prevent proper airbag deployment.",
        "solution": "Check VIN eligibility because seat equipment affects scope. Audi dealers install the occupant-detection repair kit free of charge under campaign 74D5.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Passenger-airbag warning",
          "Occupant-detection system malfunction"
        ],
        "affectedSystems": [
          "passenger occupant-detection mat",
          "front-passenger airbag"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 74D5 Passenger Occupant Detection System — NHTSA 18V370",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V370000"
          }
        ],
        "summary": "Replaced the frozen “Premature Motor Mount Failure (4.0T V8)” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-s7-air-suspension-2012": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Air Suspension Compressor and Strut Failure” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 42L1 Rear-Axle Trailing-Arm Lock Nut — NHTSA 21V295",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V295000"
        },
        {
          "label": "Audi 42L5 Rear-Axle Alignment Follow-Up — NHTSA 22V034",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V034000"
        }
      ],
      "after": {
        "years": [
          2020,
          2021
        ],
        "trims": [],
        "engines": [],
        "category": "suspension",
        "title": "Rear-Axle Lock Nut and Alignment Recall Follow-Up (21V295 / 22V034)",
        "description": "Certain 2020-2021 S7 rear trailing-arm lock nuts can fracture from stress corrosion and misalign the rear axle. A follow-up recall covers vehicles whose alignment and tire condition may not have been checked after the first repair.",
        "solution": "Check the VIN for both campaigns 42L1 and 42L5. Audi dealers replace affected nuts and bolts, inspect and adjust rear alignment, and replace qualifying unevenly worn tires free of charge.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Uneven rear-tire wear",
          "Rear alignment change",
          "Reduced vehicle control"
        ],
        "affectedSystems": [
          "rear trailing arm",
          "rear axle alignment",
          "rear tires"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 42L1 Rear-Axle Trailing-Arm Lock Nut — NHTSA 21V295",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V295000"
          },
          {
            "type": "recall",
            "title": "Audi 42L5 Rear-Axle Alignment Follow-Up — NHTSA 22V034",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V034000"
          }
        ],
        "summary": "Replaced the frozen “Air Suspension Compressor and Strut Failure” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-s7-biturbo-coolant-2012": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “4.0T Biturbo Coolant Line and Thermostat Failure” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 20U6/L8 4.0L Fuel Line — NHTSA 13V450",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=13V450000"
        }
      ],
      "after": {
        "years": [
          2013,
          2014
        ],
        "trims": [],
        "engines": [
          "4.0 TFSI"
        ],
        "category": "fuel",
        "title": "4.0L Fuel Line Can Leak and Create a Fire Risk (Recall 13V450 / 20U6)",
        "description": "Certain 2013-2014 S7 vehicles with the 4.0L engine can develop a fuel-line leak because of manufacturing tolerances, creating a fire risk near an ignition source.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the fuel line free of charge under campaign 20U6/L8. Stop driving if fuel odor or leakage is present.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Fuel odor",
          "Visible fuel leakage"
        ],
        "affectedSystems": [
          "4.0 TFSI fuel line"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 20U6/L8 4.0L Fuel Line — NHTSA 13V450",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=13V450000"
          }
        ],
        "summary": "Replaced the frozen “4.0T Biturbo Coolant Line and Thermostat Failure” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-s7-carbon-buildup-4.0t-2012": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Carbon Buildup on Intake Valves (4.0T Twin-Turbo V8)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 1 commerce claims and 1 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 69CS Rear Seat-Belt Automatic-Locking Retractor — NHTSA 21V606",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V606000"
        }
      ],
      "after": {
        "years": [
          2021
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Rear Seat-Belt Retractor Can Release a Child Restraint Early (Recall 21V606 / 69CS)",
        "description": "Certain 2021 S7 rear automatic-locking retractors can deactivate early, preventing a child restraint from remaining secured as required by FMVSS 208.",
        "solution": "Check VIN eligibility. Audi dealers inspect and replace the affected middle-rear seat-belt assembly as necessary free of charge under campaign 69CS.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Automatic-locking retractor releases early",
          "Child restraint cannot remain secured"
        ],
        "affectedSystems": [
          "middle-rear seat-belt retractor"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 69CS Rear Seat-Belt Automatic-Locking Retractor — NHTSA 21V606",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V606000"
          }
        ],
        "summary": "Replaced the frozen “Carbon Buildup on Intake Valves (4.0T Twin-Turbo V8)” card with an exact NHTSA/Audi campaign scope and removed 1 commerce claims with 1 URLs."
      }
    },
    "audi-s7-cylinder-demand-rough-running-hesitation": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Cylinder-on-Demand (Cylinder Deactivation) Rough Running and Hesitation (4.0T V8)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 9 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 90VC Instrument-Panel Software — NHTSA 25V201",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V201000"
        }
      ],
      "after": {
        "years": [
          2021
        ],
        "trims": [],
        "engines": [],
        "category": "electrical",
        "title": "Instrument Panel May Fail to Display Critical Safety Information (Recall 25V201 / 90VC)",
        "description": "Certain 2021 S7 instrument-panel modules can fail because of a software error, hiding the speedometer or safety warning indicators.",
        "solution": "Check the VIN and campaign-completion history. Audi dealers update the instrument-panel module software free of charge under campaign 90VC.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Blank instrument panel",
          "Missing speedometer",
          "Missing safety warning indicators"
        ],
        "affectedSystems": [
          "instrument-panel module",
          "driver information display"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 90VC Instrument-Panel Software — NHTSA 25V201",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V201000"
          }
        ],
        "summary": "Replaced the frozen “Cylinder-on-Demand (Cylinder Deactivation) Rough Running and Hesitation (4.0T V8)” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 9 URLs."
      }
    },
    "audi-s7-ea839-2-9t-v6-water-pump-internal-leak-overheating": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “EA839 2.9T V6 Water Pump Internal Leak and Overheating (C8 S7)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 8 commerce claims and 24 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 90TV Rearview-Camera Software — NHTSA 25V900",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V900000"
        },
        {
          "label": "NHTSA 25V900 Part 573 Report — Complete Audi Model Scope",
          "url": "https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf"
        }
      ],
      "after": {
        "years": [
          2020,
          2021,
          2022,
          2023,
          2024
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Rearview Camera Image May Not Display (Recall 25V900 / 90TV)",
        "description": "Within the official 25V900 Part 573 model scope, certain 2020-2024 S7 vehicles can fail to display the rearview-camera image as intended because of a software error.",
        "solution": "Check the VIN and campaign-completion history. Audi dealers update the relevant software free of charge under campaign 90TV. Continue direct visual checks when reversing until repaired.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Blank rearview-camera image",
          "Rearview image does not display as intended"
        ],
        "affectedSystems": [
          "rearview camera",
          "infotainment software"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 90TV Rearview-Camera Software — NHTSA 25V900",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V900000"
          },
          {
            "type": "recall",
            "title": "NHTSA 25V900 Part 573 Report — Complete Audi Model Scope",
            "url": "https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf"
          }
        ],
        "summary": "Replaced the frozen “EA839 2.9T V6 Water Pump Internal Leak and Overheating (C8 S7)” card with an exact NHTSA/Audi campaign scope and removed 8 commerce claims with 24 URLs."
      }
    },
    "audi-s7-electromechanical-steering-rack-torque-sensor-failure-causin": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Electromechanical Steering Rack / Torque Sensor Failure Causing Loss of Power Assist (C7)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 47T9 Brake-Fluid Reservoir Cap — NHTSA 23V601",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V601000"
        }
      ],
      "after": {
        "years": [
          2021
        ],
        "trims": [],
        "engines": [],
        "category": "brakes",
        "title": "Incorrect Brake-Fluid Reservoir Cap Label (Recall 23V601 / 47T9)",
        "description": "Certain 2021 S7 vehicles may have an incorrectly labeled brake-fluid reservoir cap, which can lead to use of the wrong fluid and reduced braking ability.",
        "solution": "Check VIN eligibility. Audi dealers inspect the reservoir cap and replace it when necessary free of charge under campaign 47T9. Use only the brake-fluid specification in the owner and service information.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Incorrect reservoir-cap label",
          "Brake service specification uncertainty"
        ],
        "affectedSystems": [
          "brake-fluid reservoir cap",
          "hydraulic braking system"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 47T9 Brake-Fluid Reservoir Cap — NHTSA 23V601",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V601000"
          }
        ],
        "summary": "Replaced the frozen “Electromechanical Steering Rack / Torque Sensor Failure Causing Loss of Power Assist (C7)” card with an exact NHTSA/Audi campaign scope and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-s7-front-control-arm-bushing-ball-joint-failure": {
      "disposition": "remove",
      "decision": "Archive the frozen “Front Control Arm Bushing and Ball Joint Failure (C7 Suspension)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 11 commerce claims and 33 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0T TFSI Biturbo V8 (EA824)"
        ],
        "category": "suspension",
        "title": "Archived - Unsupported Audi S7 Front Control Arm Bushing and Ball Joint Failure (C7 Suspension) Aggregation",
        "description": "The former card combined “Front Control Arm Bushing and Ball Joint Failure (C7 Suspension)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Front Control Arm Bushing and Ball Joint Failure (C7 Suspension)” aggregation and removed 11 commerce claims with 33 URLs."
      }
    },
    "audi-s7-fuel-injector-deposits-failure-causing-misfire-rough-running": {
      "disposition": "remove",
      "decision": "Archive the frozen “Fuel Injector Deposits / Failure Causing Misfire and Rough Running (4.0T V8)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0 TFSI V8 (EA824)"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi S7 Fuel Injector Deposits / Failure Causing Misfire and Rough Running (4.0T V8) Aggregation",
        "description": "The former card combined “Fuel Injector Deposits / Failure Causing Misfire and Rough Running (4.0T V8)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Fuel Injector Deposits / Failure Causing Misfire and Rough Running (4.0T V8)” aggregation and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-s7-gateway-control-module-shutdown-from-rear-seat-liquid-spill": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Gateway Control Module Shutdown from Rear-Seat Liquid Spill (NHTSA Recall 22V861000)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 0 commerce claims and 0 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 90V2 Gateway Control Module Protective Cover — NHTSA 22V861",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V861000"
        }
      ],
      "after": {
        "years": [
          2020,
          2021,
          2022
        ],
        "trims": [],
        "engines": [
          "2.9 TFSI"
        ],
        "category": "electrical",
        "title": "Rear-Seat Liquid Spill Can Shut Down Gateway Module (Recall 22V861 / 90V2)",
        "description": "On certain 2020-2022 S7 vehicles, liquid spilled in the rear seat can reach the gateway control module, shut it down, and suddenly reduce engine power.",
        "solution": "Check the VIN and campaign history. Audi dealers install a protective gateway-module cover free of charge under campaign 90V2. If multiple warnings or reduced power occur after a spill, move out of traffic safely and arrange dealer inspection.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Multiple warning messages",
          "Sudden reduction in engine power",
          "Faults after a rear-seat liquid spill"
        ],
        "affectedSystems": [
          "gateway control module",
          "vehicle communications network"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 90V2 Gateway Control Module Protective Cover — NHTSA 22V861",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V861000"
          }
        ],
        "summary": "Replaced the frozen “Gateway Control Module Shutdown from Rear-Seat Liquid Spill (NHTSA Recall 22V861000)” card with an exact NHTSA/Audi campaign scope and removed 0 commerce claims with 0 URLs."
      }
    },
    "audi-s7-high-pressure-fuel-pump-failure-causing-hard-start-power-los": {
      "disposition": "remove",
      "decision": "Archive the frozen “High-Pressure Fuel Pump (HPFP) Failure Causing Hard Start and Power Loss (4.0T V8)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0 TFSI V8 (EA824)"
        ],
        "category": "fuel",
        "title": "Archived - Unsupported Audi S7 High-Pressure Fuel Pump (HPFP) Failure Causing Hard Start and Power Loss (4.0T V8) Aggregation",
        "description": "The former card combined “High-Pressure Fuel Pump (HPFP) Failure Causing Hard Start and Power Loss (4.0T V8)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “High-Pressure Fuel Pump (HPFP) Failure Causing Hard Start and Power Loss (4.0T V8)” aggregation and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-s7-ignition-coil-pack-failure-causing-misfires": {
      "disposition": "remove",
      "decision": "Archive the frozen “Ignition Coil Pack Failure Causing Misfires (4.0T V8)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 2 commerce claims and 6 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0T TFSI Biturbo V8 (EA824)"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi S7 Ignition Coil Pack Failure Causing Misfires (4.0T V8) Aggregation",
        "description": "The former card combined “Ignition Coil Pack Failure Causing Misfires (4.0T V8)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Ignition Coil Pack Failure Causing Misfires (4.0T V8)” aggregation and removed 2 commerce claims with 6 URLs."
      }
    },
    "audi-s7-pcv-oil-separator-failure-causing-oil-consumption-whistling": {
      "disposition": "replace",
      "decision": "Replace the frozen “PCV / Oil Separator (Ölabscheider) Failure Causing Oil Consumption and Whistling (4.0T V8)” aggregation with the bounded Audi technical-service bulletin path below. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TSB 2040644/3 — 4.0 TFSI Crankcase Breather Whistling and DTCs",
          "url": "https://static.nhtsa.gov/odi/tsbs/2015/MC-10130222-9999.pdf"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016
        ],
        "trims": [],
        "engines": [
          "4.0 TFSI"
        ],
        "category": "engine",
        "title": "4.0 TFSI Crankcase Breather Leak With Warm-Idle Whistle (TSB 2040644/3)",
        "description": "Audi TSB 2040644/3 covers 2013-2016 S7 4.0 TFSI vehicles with a warm-idle metallic whistle or grinding sound, an intermittent MIL, and P2279 or P0507 caused by a leaking crankcase-breather pressure-regulating valve.",
        "solution": "Follow the TSB confirmation gate: compare the sound and check whether opening the oil-filler cap changes it. Replace the oil-separator breather module only when the symptom matches and the cap test supports the diagnosis.",
        "severity": "medium",
        "confidence": "high",
        "source": "manual",
        "symptoms": [
          "Warm-idle metallic whistle",
          "Intermittent malfunction indicator lamp",
          "Idle speed higher than expected"
        ],
        "affectedSystems": [
          "crankcase breather module",
          "pressure-regulating valve"
        ],
        "dtcCodes": [
          "P2279",
          "P0507"
        ],
        "citations": [
          {
            "type": "tsb",
            "title": "Audi TSB 2040644/3 — 4.0 TFSI Crankcase Breather Whistling and DTCs",
            "url": "https://static.nhtsa.gov/odi/tsbs/2015/MC-10130222-9999.pdf"
          }
        ],
        "summary": "Replaced the frozen “PCV / Oil Separator (Ölabscheider) Failure Causing Oil Consumption and Whistling (4.0T V8)” card with an exact Audi TSB scope and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-s7-power-liftgate-motor-gas-strut-failure": {
      "disposition": "remove",
      "decision": "Archive the frozen “Power Liftgate Motor and Gas Strut Failure (Sportback Tailgate)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 4 commerce claims and 12 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022
        ],
        "trims": [],
        "engines": [
          "4.0T TFSI Biturbo V8 (EA824)",
          "2.9T TFSI Biturbo V6 (EA839)"
        ],
        "category": "body",
        "title": "Archived - Unsupported Audi S7 Power Liftgate Motor and Gas Strut Failure (Sportback Tailgate) Aggregation",
        "description": "The former card combined “Power Liftgate Motor and Gas Strut Failure (Sportback Tailgate)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Power Liftgate Motor and Gas Strut Failure (Sportback Tailgate)” aggregation and removed 4 commerce claims with 12 URLs."
      }
    },
    "audi-s7-premature-front-brake-rotor-warping-pad-wear": {
      "disposition": "remove",
      "decision": "Archive the frozen “Premature Front Brake Rotor Warping and Pad Wear” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 2 commerce claims and 6 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022
        ],
        "trims": [],
        "engines": [
          "4.0T TFSI Biturbo V8 (EA824)",
          "2.9T TFSI Biturbo V6 (EA839)"
        ],
        "category": "brakes",
        "title": "Archived - Unsupported Audi S7 Premature Front Brake Rotor Warping and Pad Wear Aggregation",
        "description": "The former card combined “Premature Front Brake Rotor Warping and Pad Wear” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Premature Front Brake Rotor Warping and Pad Wear” aggregation and removed 2 commerce claims with 6 URLs."
      }
    },
    "audi-s7-rear-differential-mount-driveshaft-center-bearing-wear-causi": {
      "disposition": "remove",
      "decision": "Archive the frozen “Rear Differential Mount and Driveshaft Center Bearing Wear Causing Drivetrain Clunk (C7)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 3 commerce claims and 9 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0T TFSI Biturbo V8 (EA824)"
        ],
        "category": "drivetrain",
        "title": "Archived - Unsupported Audi S7 Rear Differential Mount and Driveshaft Center Bearing Wear Causing Drivetrain Clunk (C7) Aggregation",
        "description": "The former card combined “Rear Differential Mount and Driveshaft Center Bearing Wear Causing Drivetrain Clunk (C7)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Rear Differential Mount and Driveshaft Center Bearing Wear Causing Drivetrain Clunk (C7)” aggregation and removed 3 commerce claims with 9 URLs."
      }
    },
    "audi-s7-rear-view-camera-mmi-flex-harness-black-screen": {
      "disposition": "remove",
      "decision": "Archive the frozen “Rear-View Camera / MMI Flex Harness Black Screen” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 0 commerce claims and 0 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0 TFSI V8 (EA824)"
        ],
        "category": "electrical",
        "title": "Archived - Unsupported Audi S7 Rear-View Camera / MMI Flex Harness Black Screen Aggregation",
        "description": "The former card combined “Rear-View Camera / MMI Flex Harness Black Screen” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Rear-View Camera / MMI Flex Harness Black Screen” aggregation and removed 0 commerce claims with 0 URLs."
      }
    },
    "audi-s7-s-tronic-7-speed-dual-clutch-mechatronic-clutch-wear": {
      "disposition": "remove",
      "decision": "Archive the frozen “S-tronic 7-Speed Dual-Clutch (DL501/0B5) Mechatronic and Clutch Wear” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 0 commerce claims and 0 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0 TFSI V8 (EA824)"
        ],
        "category": "transmission",
        "title": "Archived - Unsupported Audi S7 S-tronic 7-Speed Dual-Clutch (DL501/0B5) Mechatronic and Clutch Wear Aggregation",
        "description": "The former card combined “S-tronic 7-Speed Dual-Clutch (DL501/0B5) Mechatronic and Clutch Wear” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “S-tronic 7-Speed Dual-Clutch (DL501/0B5) Mechatronic and Clutch Wear” aggregation and removed 0 commerce claims with 0 URLs."
      }
    },
    "audi-s7-shark-fin-roof-antenna-water-intrusion-causing-gps-satellite": {
      "disposition": "remove",
      "decision": "Archive the frozen “Shark-Fin Roof Antenna Water Intrusion Causing GPS / Satellite Radio Reception Loss (C7)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 1 commerce claims and 3 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0T Biturbo V8 (4.0 TFSI)"
        ],
        "category": "electrical",
        "title": "Archived - Unsupported Audi S7 Shark-Fin Roof Antenna Water Intrusion Causing GPS / Satellite Radio Reception Loss (C7) Aggregation",
        "description": "The former card combined “Shark-Fin Roof Antenna Water Intrusion Causing GPS / Satellite Radio Reception Loss (C7)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Shark-Fin Roof Antenna Water Intrusion Causing GPS / Satellite Radio Reception Loss (C7)” aggregation and removed 1 commerce claims with 3 URLs."
      }
    },
    "audi-s7-sunroof-panoramic-roof-drain-clog-causing-water-intrusion-el": {
      "disposition": "remove",
      "decision": "Archive the frozen “Sunroof / Panoramic Roof Drain Clog Causing Water Intrusion and Electronics Damage (C7)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 3 commerce claims and 9 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0T TFSI Biturbo V8 (EA824)"
        ],
        "category": "body",
        "title": "Archived - Unsupported Audi S7 Sunroof / Panoramic Roof Drain Clog Causing Water Intrusion and Electronics Damage (C7) Aggregation",
        "description": "The former card combined “Sunroof / Panoramic Roof Drain Clog Causing Water Intrusion and Electronics Damage (C7)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Sunroof / Panoramic Roof Drain Clog Causing Water Intrusion and Electronics Damage (C7)” aggregation and removed 3 commerce claims with 9 URLs."
      }
    },
    "audi-s7-turbo-oil-strainer-2012": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Turbocharger Oil Strainer Blockage Causing Engine Stall (4.0T NHTSA Recall)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 5 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 21H7 Turbocharger Oil-Supply Strainer — NHTSA 22V178",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V178000"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017
        ],
        "trims": [],
        "engines": [
          "4.0 TFSI"
        ],
        "category": "engine",
        "title": "Turbocharger Oil-Supply Strainer Can Block and Cause Engine Stall (Recall 22V178 / 21H7)",
        "description": "On certain 2013-2017 S7 vehicles, the turbocharger oil-supply strainer can block, starve the turbo bearings, and allow the shaft or turbine to fail, potentially stalling the engine.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the oil strainer and perform an oil change free of charge under campaign 21H7. If abnormal turbo noise, loss of power, or an engine warning occurs, stop safely and arrange dealer inspection.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Turbocharger noise",
          "Loss of engine power",
          "Engine stall"
        ],
        "affectedSystems": [
          "turbocharger oil-supply strainer",
          "turbocharger bearings"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 21H7 Turbocharger Oil-Supply Strainer — NHTSA 22V178",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V178000"
          }
        ],
        "summary": "Replaced the frozen “Turbocharger Oil Strainer Blockage Causing Engine Stall (4.0T NHTSA Recall)” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 5 URLs."
      }
    },
    "audi-s7-turbocharger-wastegate-linkage-rattle-underboost": {
      "disposition": "remove",
      "decision": "Archive the frozen “Turbocharger Wastegate Linkage Rattle and Underboost (4.0T V8)” aggregation. The primary-source audit did not establish its complete model-year, symptom, failure, repair, prevention and commerce bundle for the Audi S7. Remove all 6 commerce claims and 18 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Official NHTSA model inventory establishes bounded campaign paths but not this frozen broad aggregation",
          "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015,
          2016,
          2017,
          2018
        ],
        "trims": [],
        "engines": [
          "4.0T TFSI Biturbo V8 (EA824)"
        ],
        "category": "engine",
        "title": "Archived - Unsupported Audi S7 Turbocharger Wastegate Linkage Rattle and Underboost (4.0T V8) Aggregation",
        "description": "The former card combined “Turbocharger Wastegate Linkage Rattle and Underboost (4.0T V8)” across a broad Audi S7 range without a current Audi or regulator primary source for the complete public claim.",
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
            "title": "NHTSA Audi S7 Campaign Inventory",
            "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S7&modelYear=2021"
          }
        ],
        "summary": "Archived an unsupported Audi S7 “Turbocharger Wastegate Linkage Rattle and Underboost (4.0T V8)” aggregation and removed 6 commerce claims with 18 URLs."
      }
    }
  },
  "expectedPerRecord": {
    "audi-s7-motor-mount-failure-2012": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=4H0199256T&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=4H0199256T",
        "https://www.ebay.com/sch/i.html?_nkw=4H0199256T",
        "https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20Engine%20Mount%20Set%20(4.0T)&tag=au7o-20"
      ],
      "claimClicks": 1,
      "recordClicks": 1,
      "priorityClicks": 1
    },
    "audi-s7-air-suspension-2012": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=4G0616005D&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=4G0616005D",
        "https://www.ebay.com/sch/i.html?_nkw=4G0616005D",
        "https://www.amazon.com/s?k=Arnott%20P-3514%20compressor%20Audi&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-biturbo-coolant-2012": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079121115BL&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079121115BL",
        "https://www.ebay.com/sch/i.html?_nkw=079121115BL",
        "https://www.amazon.com/s?k=Genuine%20Audi%20079121481F%20turbo%20coolant%20S7&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-carbon-buildup-4.0t-2012": {
      "claimIds": [
        "communityRecommendations:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=034%20Motorsport%20Dual%20Catch%20Can%20Kit%20(4.0T)&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-cylinder-demand-rough-running-hesitation": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Cylinder-on-Demand&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=C7002A0",
        "https://www.ebay.com/sch/i.html?_nkw=C7002A0",
        "https://www.amazon.com/s?k=Audi%20S7%20Spark%20plugs&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06K905601M",
        "https://www.ebay.com/sch/i.html?_nkw=06K905601M",
        "https://www.amazon.com/s?k=Audi%20S7%20Ignition%20coils&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079905110",
        "https://www.ebay.com/sch/i.html?_nkw=079905110"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-ea839-2-9t-v6-water-pump-internal-leak-overheating": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3",
        "fixParts:4",
        "fixParts:5",
        "fixParts:6",
        "fixParts:7"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Engine%20water%20pump%20-%20revised%206-bolt&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06M121013G",
        "https://www.ebay.com/sch/i.html?_nkw=06M121013G",
        "https://www.amazon.com/s?k=Audi%20S7%20Water%20pump%20pulley%20-%206-bolt&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06M121031G",
        "https://www.ebay.com/sch/i.html?_nkw=06M121031G",
        "https://www.amazon.com/s?k=Audi%20S7%20Coolant%20thermostat&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06M121115N",
        "https://www.ebay.com/sch/i.html?_nkw=06M121115N",
        "https://www.amazon.com/s?k=Audi%20S7%20Thermostat%20seal%20%2F%20gasket&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06M121688",
        "https://www.ebay.com/sch/i.html?_nkw=06M121688",
        "https://www.amazon.com/s?k=Audi%20S7%20Vacuum%20solenoid%20changeover%20valve%20N649&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=037906283C",
        "https://www.ebay.com/sch/i.html?_nkw=037906283C",
        "https://www.amazon.com/s?k=Audi%20S7%20Water%20pump%20pulley%20bolts&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=N91121903",
        "https://www.ebay.com/sch/i.html?_nkw=N91121903",
        "https://www.amazon.com/s?k=Audi%20S7%20Water%20pump%20housing%20%26%20thermostat%20bolts&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=N10124306",
        "https://www.ebay.com/sch/i.html?_nkw=N10124306",
        "https://www.amazon.com/s?k=Audi%20S7%20Intake%20manifold%20O-rings&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06M133026A",
        "https://www.ebay.com/sch/i.html?_nkw=06M133026A"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-electromechanical-steering-rack-torque-sensor-failure-causin": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=4G1423055EA&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=4G1423055EA",
        "https://www.ebay.com/sch/i.html?_nkw=4G1423055EA"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-front-control-arm-bushing-ball-joint-failure": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3",
        "fixParts:4",
        "fixParts:5",
        "fixParts:6",
        "fixParts:7",
        "fixParts:8",
        "fixParts:9",
        "fixParts:10"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20control%20arm%20kit&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G0498998",
        "https://www.ebay.com/sch/i.html?_nkw=4G0498998",
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20upper%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0407505M",
        "https://www.ebay.com/sch/i.html?_nkw=8K0407505M",
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20upper%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0407506M",
        "https://www.ebay.com/sch/i.html?_nkw=8K0407506M",
        "https://www.amazon.com/s?k=Audi%20S7%20Rear%20upper%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0407509M",
        "https://www.ebay.com/sch/i.html?_nkw=8K0407509M",
        "https://www.amazon.com/s?k=Audi%20S7%20Rear%20upper%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0407510M",
        "https://www.ebay.com/sch/i.html?_nkw=8K0407510M",
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20lower%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G0407693L",
        "https://www.ebay.com/sch/i.html?_nkw=4G0407693L",
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20lower%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G0407694L",
        "https://www.ebay.com/sch/i.html?_nkw=4G0407694L",
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20lower%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0407151G",
        "https://www.ebay.com/sch/i.html?_nkw=8K0407151G",
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20lower%20control%20arm&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0407152G",
        "https://www.ebay.com/sch/i.html?_nkw=8K0407152G",
        "https://www.amazon.com/s?k=Audi%20S7%20Outer%20tie%20rod%20end&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G0423811A",
        "https://www.ebay.com/sch/i.html?_nkw=4G0423811A",
        "https://www.amazon.com/s?k=Audi%20S7%20Outer%20tie%20rod%20end&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G0423812A",
        "https://www.ebay.com/sch/i.html?_nkw=4G0423812A"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-fuel-injector-deposits-failure-causing-misfire-rough-running": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079906036AD&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079906036AD",
        "https://www.ebay.com/sch/i.html?_nkw=079906036AD"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-gateway-control-module-shutdown-from-rear-seat-liquid-spill": {
      "claimIds": [],
      "urls": [],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-high-pressure-fuel-pump-failure-causing-hard-start-power-los": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079127025AJ&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079127025AJ",
        "https://www.ebay.com/sch/i.html?_nkw=079127025AJ"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-ignition-coil-pack-failure-causing-misfires": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Ignition%20coil&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079905110P",
        "https://www.ebay.com/sch/i.html?_nkw=079905110P",
        "https://www.amazon.com/s?k=Audi%20S7%20Spark%20plug&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06K905601M",
        "https://www.ebay.com/sch/i.html?_nkw=06K905601M"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-pcv-oil-separator-failure-causing-oil-consumption-whistling": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079103542E&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079103542E",
        "https://www.ebay.com/sch/i.html?_nkw=079103542E"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-power-liftgate-motor-gas-strut-failure": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Power%20tailgate%20lift%20motor%20%2F%20spindle&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G8827851F",
        "https://www.ebay.com/sch/i.html?_nkw=4G8827851F",
        "https://www.amazon.com/s?k=Audi%20S7%20Power%20tailgate%20lift%20motor%20%2F%20spindle&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G8827852F",
        "https://www.ebay.com/sch/i.html?_nkw=4G8827852F",
        "https://www.amazon.com/s?k=Audi%20S7%20Power%20tailgate%20lift%20motor%20%2F%20spindle&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4K8827851D",
        "https://www.ebay.com/sch/i.html?_nkw=4K8827851D",
        "https://www.amazon.com/s?k=Audi%20S7%20Tailgate%20latch%20%2F%20lock%20actuator%20with&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8R0827505A",
        "https://www.ebay.com/sch/i.html?_nkw=8R0827505A"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-premature-front-brake-rotor-warping-pad-wear": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20brake%20rotor&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G0615301T",
        "https://www.ebay.com/sch/i.html?_nkw=4G0615301T",
        "https://www.amazon.com/s?k=Audi%20S7%20Front%20brake%20pad%20set&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G0698151S",
        "https://www.ebay.com/sch/i.html?_nkw=4G0698151S"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-rear-differential-mount-driveshaft-center-bearing-wear-causi": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Rear%20differential%20front%2Flower%20mount%20bushing&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0599381G",
        "https://www.ebay.com/sch/i.html?_nkw=8K0599381G",
        "https://www.amazon.com/s?k=Audi%20S7%20Rear%20differential%20carrier%20mount%20bushing&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8K0599257N",
        "https://www.ebay.com/sch/i.html?_nkw=8K0599257N",
        "https://www.amazon.com/s?k=Audi%20S7%20Billet%20aluminum%20rear%20differential%20carrier%20mount&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=034-505-2016",
        "https://www.ebay.com/sch/i.html?_nkw=034-505-2016"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-rear-view-camera-mmi-flex-harness-black-screen": {
      "claimIds": [],
      "urls": [],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-s-tronic-7-speed-dual-clutch-mechatronic-clutch-wear": {
      "claimIds": [],
      "urls": [],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-shark-fin-roof-antenna-water-intrusion-causing-gps-satellite": {
      "claimIds": [
        "fixParts:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=4G0035503AD&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=4G0035503AD",
        "https://www.ebay.com/sch/i.html?_nkw=4G0035503AD"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-sunroof-panoramic-roof-drain-clog-causing-water-intrusion-el": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Sunroof%20drain%20hose&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G8877201A",
        "https://www.ebay.com/sch/i.html?_nkw=4G8877201A",
        "https://www.amazon.com/s?k=Audi%20S7%20Sunroof%20drain%20hose&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=4G8877203B",
        "https://www.ebay.com/sch/i.html?_nkw=4G8877203B",
        "https://www.amazon.com/s?k=Audi%20S7%20Sunroof%20drain%20hose%20connector%2Fgrommet&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=8E0971848F",
        "https://www.ebay.com/sch/i.html?_nkw=8E0971848F"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-turbo-oil-strainer-2012": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:3",
        "communityRecommendations:4"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079115175G&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079115175G",
        "https://www.ebay.com/sch/i.html?_nkw=079115175G",
        "https://www.amazon.com/s?k=Audi%20S7%20Dorman%20Turbocharger%20Gasket%20Kit&tag=au7o-20",
        "https://www.amazon.com/s?k=Audi%20S7%20AutoMeter%20Mechanical%20Boost%20Gauge&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s7-turbocharger-wastegate-linkage-rattle-underboost": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "fixParts:2",
        "fixParts:3",
        "fixParts:4",
        "fixParts:5"
      ],
      "urls": [
        "https://www.amazon.com/s?k=Audi%20S7%20Turbocharger%20-%20Left%2FBank%201&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079145703P",
        "https://www.ebay.com/sch/i.html?_nkw=079145703P",
        "https://www.amazon.com/s?k=Audi%20S7%20Turbocharger%20-%20Right%2FBank%202&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079145704P",
        "https://www.ebay.com/sch/i.html?_nkw=079145704P",
        "https://www.amazon.com/s?k=Audi%20S7%20Turbocharger%20oil%20return&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079145742C",
        "https://www.ebay.com/sch/i.html?_nkw=079145742C",
        "https://www.amazon.com/s?k=Audi%20S7%20Turbocharger%20oil%20return&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079145743A",
        "https://www.ebay.com/sch/i.html?_nkw=079145743A",
        "https://www.amazon.com/s?k=Audi%20S7%20Turbocharger%20oil%20supply&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=06M145734H",
        "https://www.ebay.com/sch/i.html?_nkw=06M145734H",
        "https://www.amazon.com/s?k=Audi%20S7%20Turbo%20oil%20strainer%20%2F%20inlet%20screen&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?partnum=079115175G",
        "https://www.ebay.com/sch/i.html?_nkw=079115175G"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    }
  },
  "expectedTelemetry": {
    "claimCount": 57,
    "urlCount": 159,
    "claimClickCount": 1,
    "recordClickCount": 1,
    "priorityClickCount": 1
  },
  "expectedDispositionCounts": {
    "recall-dealer": 9,
    "remove": 12,
    "replace": 1
  },
  "expectedPublished": 10,
  "expectedArchived": 12,
  "controlledDeltaProposals": [],
  "expectedProposalIdentities": []
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
  "audi-s7-motor-mount-failure-2012": [
    2013,
    2014,
    2015,
    2016,
    2017,
    2018
  ],
  "audi-s7-air-suspension-2012": [
    2020,
    2021
  ],
  "audi-s7-biturbo-coolant-2012": [
    2013,
    2014
  ],
  "audi-s7-carbon-buildup-4.0t-2012": [
    2021
  ],
  "audi-s7-cylinder-demand-rough-running-hesitation": [
    2021
  ],
  "audi-s7-ea839-2-9t-v6-water-pump-internal-leak-overheating": [
    2020,
    2021,
    2022,
    2023,
    2024
  ],
  "audi-s7-electromechanical-steering-rack-torque-sensor-failure-causin": [
    2021
  ],
  "audi-s7-gateway-control-module-shutdown-from-rear-seat-liquid-spill": [
    2020,
    2021,
    2022
  ],
  "audi-s7-pcv-oil-separator-failure-causing-oil-consumption-whistling": [
    2013,
    2014,
    2015,
    2016
  ],
  "audi-s7-turbo-oil-strainer-2012": [
    2013,
    2014,
    2015,
    2016,
    2017
  ]
};
  const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
  if (
    Object.entries(expectedYears).some(([id, years]) => JSON.stringify(byId.get(id).years) !== JSON.stringify(years)) ||
    issues.filter((issue) => issue.after.status === 'published').length !== config.expectedPublished ||
    issues.filter((issue) => issue.after.status === 'archived').length !== config.expectedArchived
  ) {
    throw new Error('Audi S7 reviewed scopes or published/archived split drifted.');
  }
};

module.exports = config;
