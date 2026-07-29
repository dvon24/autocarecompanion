const config = {
  "label": "Audi TT",
  "make": "Audi",
  "model": "TT",
  "batchId": "audi-tt-full-record-cohort-1-2026-07-29",
  "auditDate": "2026-07-29",
  "snapshotHash": "3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102",
  "sourceSnapshotFileHash": "6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455",
  "packetFileHash": "6fac9070c11068620be40ce1371635aef6933b8b4bcc8f57142d07391be2fda1",
  "packetRelativePath": "data/known-issues-catalog-deeplink-work/audi-tt/3ee40713b2b5/all-0001.json",
  "reviewTokens": {
    "blind": "tt_blind_review:no-blocker",
    "edge": "tt_edge_review:no-blocker"
  },
  "expectedIds": [
    "audi-tt-absesp-control-module-failure-2000",
    "audi-tt-cam-follower-2008",
    "audi-tt-coil-pack-failure-and-2000",
    "audi-tt-dsg-mechatronic-2008",
    "audi-tt-dsg-transmission-2008",
    "audi-tt-front-control-arm-bushings-2000",
    "audi-tt-haldex-awd-coupling-pumpcontroller-2000",
    "audi-tt-high-speed-stability-recall-for-2000",
    "audi-tt-instrument-cluster-pixel-failure-2000",
    "audi-tt-magnetic-ride-2008",
    "audi-tt-tail-light-corrosion-2008",
    "audi-tt-water-pump-2008"
  ],
  "records": {
    "audi-tt-absesp-control-module-failure-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “ABS/ESP Control Module Failure Causing Warning Lights and Loss of Stability/ABS Function” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 69CJ Driver Airbag Inflator — NHTSA 21V470",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V470000"
        }
      ],
      "after": {
        "years": [
          2000,
          2001
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Driver Airbag Inflator May Deploy Improperly (Recall 21V470 / 69CJ)",
        "description": "Certain 2000-2001 TT Coupes and Roadsters have a non-azide driver airbag inflator that can absorb moisture and deploy improperly, reducing protection in a crash.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the driver frontal-airbag inflator with an alternative inflator free of charge under campaign 69CJ.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Open safety recall",
          "No reliable warning before airbag deployment"
        ],
        "affectedSystems": [
          "driver frontal airbag inflator"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 69CJ Driver Airbag Inflator — NHTSA 21V470",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V470000"
          }
        ],
        "summary": "Replaced the frozen “ABS/ESP Control Module Failure Causing Warning Lights and Loss of Stability/ABS Function” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-tt-cam-follower-2008": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Cam Follower Wear (Damages Camshaft and HPFP)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 4 commerce claims and 6 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TT Fuel-Line Assembly — NHTSA 99V222",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V222000"
        }
      ],
      "after": {
        "years": [
          2000
        ],
        "trims": [],
        "engines": [],
        "category": "fuel",
        "title": "Fuel-Line Assembly Can Leak (Recall 99V222)",
        "description": "A small section of the fuel-line assembly on certain 2000 TT vehicles may have been damaged during production and can leak fuel, creating a fire risk near an ignition source.",
        "solution": "Check VIN eligibility and campaign completion. Audi dealers replace the fuel-line assembly free of charge under recall 99V222. Stop driving if fuel odor or leakage is present.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Fuel odor",
          "Visible fuel leakage"
        ],
        "affectedSystems": [
          "fuel-line assembly"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi TT Fuel-Line Assembly — NHTSA 99V222",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V222000"
          }
        ],
        "summary": "Replaced the frozen “Cam Follower Wear (Damages Camshaft and HPFP)” card with an exact NHTSA/Audi campaign scope and removed 4 commerce claims with 6 URLs."
      }
    },
    "audi-tt-coil-pack-failure-and-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Coil Pack Failure and Ignition Misfires on 1.8T Engines” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TT Rear Track-Control Arms — NHTSA 01V325",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=01V325000"
        }
      ],
      "after": {
        "years": [
          2000,
          2001
        ],
        "trims": [],
        "engines": [],
        "category": "suspension",
        "title": "Rear Track-Control Arm Corrosion Can Restrict Movement (Recall 01V325)",
        "description": "On certain 2000-2001 TT vehicles, moisture can enter the rear track-control-arm mounting bushing and bolt joint, causing corrosion that impedes free arm movement.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the rear track-control arms free of charge under recall 01V325.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Restricted rear suspension movement",
          "Corroded rear control-arm mounting joint"
        ],
        "affectedSystems": [
          "rear track-control arms",
          "mounting bushings and bolts"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi TT Rear Track-Control Arms — NHTSA 01V325",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=01V325000"
          }
        ],
        "summary": "Replaced the frozen “Coil Pack Failure and Ignition Misfires on 1.8T Engines” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-tt-dsg-mechatronic-2008": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “DSG Mechatronic Unit and Clutch Pack Failure” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 7 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TT Direct-Shift Gearbox Clutch — NHTSA 04V007",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=04V007000"
        }
      ],
      "after": {
        "years": [
          2004
        ],
        "trims": [],
        "engines": [],
        "category": "transmission",
        "title": "Direct-Shift Gearbox Clutch Weld Can Lose Drive Torque (Recall 04V007)",
        "description": "On certain 2004 TT vehicles with the direct-shift gearbox, an improperly welded clutch seam can degrade clutch performance and cause an unexpected loss of input torque.",
        "solution": "Check VIN eligibility. Audi dealers replace the affected clutch free of charge under recall 04V007. If drive torque is lost, move out of traffic safely and arrange recovery.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Unexpected loss of drive torque",
          "Degraded clutch operation"
        ],
        "affectedSystems": [
          "direct-shift gearbox clutch"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi TT Direct-Shift Gearbox Clutch — NHTSA 04V007",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=04V007000"
          }
        ],
        "summary": "Replaced the frozen “DSG Mechatronic Unit and Clutch Pack Failure” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 7 URLs."
      }
    },
    "audi-tt-dsg-transmission-2008": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “S-Tronic DSG Transmission Issues (Mk2)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 5 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TT Direct-Shift Gearbox Temperature-Sensor Wiring — NHTSA 09V333",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=09V333000"
        }
      ],
      "after": {
        "years": [
          2009
        ],
        "trims": [],
        "engines": [],
        "category": "transmission",
        "title": "DSG Temperature-Sensor Wiring Can Trigger an Abrupt Shift to Neutral (Recall 09V333)",
        "description": "On affected 2009 TT direct-shift gearboxes, insufficiently crimped temperature-sensor wires can falsely report high oil temperature and cause the transmission to shift abruptly into neutral.",
        "solution": "Check the VIN and campaign history. Audi dealers reprogram the transmission control module with updated software free of charge under recall 09V333. If the gear indicator flashes or neutral engages unexpectedly, stop safely.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Abrupt shift to neutral",
          "Flashing selector-position indicator",
          "Depress-brake-pedal warning"
        ],
        "affectedSystems": [
          "DSG temperature sensor",
          "transmission control module"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi TT Direct-Shift Gearbox Temperature-Sensor Wiring — NHTSA 09V333",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=09V333000"
          }
        ],
        "summary": "Replaced the frozen “S-Tronic DSG Transmission Issues (Mk2)” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 5 URLs."
      }
    },
    "audi-tt-front-control-arm-bushings-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Front Control Arm Bushings and Ball Joint Wear Causing Clunks and Uneven Tire Wear” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 7 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TT High-Speed Directional-Stability Remedy — NHTSA 99V300",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V300000"
        }
      ],
      "after": {
        "years": [
          2000
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "High-Speed Directional-Stability Remedy (Recall 99V300)",
        "description": "Early 2000 TT vehicles can require unusually precise steering correction during sharp high-speed turns or abrupt lane changes, increasing crash risk if directional control is lost.",
        "solution": "Verify campaign completion with Audi. The factory remedy installs revised stabilizers, front control arms, firmer shock absorbers, and a rear spoiler as specified for the drivetrain configuration.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Directional instability during abrupt high-speed maneuvers",
          "Open campaign on an early TT"
        ],
        "affectedSystems": [
          "front and rear stabilizers",
          "front control arms",
          "shock absorbers",
          "rear spoiler"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi TT High-Speed Directional-Stability Remedy — NHTSA 99V300",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=99V300000"
          }
        ],
        "summary": "Replaced the frozen “Front Control Arm Bushings and Ball Joint Wear Causing Clunks and Uneven Tire Wear” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 7 URLs."
      }
    },
    "audi-tt-haldex-awd-coupling-pumpcontroller-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Haldex AWD Coupling Pump/Controller Failure Leading to Front-Wheel-Drive Only Operation” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TT Fuel-Tank Ventilation Valve — NHTSA 09V377",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=09V377000"
        }
      ],
      "after": {
        "years": [
          2008,
          2009,
          2010
        ],
        "trims": [],
        "engines": [],
        "category": "fuel",
        "title": "Fuel-Tank Ventilation Valve Can Allow Fuel Leakage (Recall 09V377)",
        "description": "On certain 2008-2010 TT and TT Roadster vehicles, the fuel-tank ventilation valve spring may not keep the valve closed during extreme driving, allowing fuel leakage and creating a fire risk.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the fuel-tank ventilation valve with the improved valve free of charge under recall 09V377.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Fuel odor",
          "Fuel leakage after extreme driving"
        ],
        "affectedSystems": [
          "fuel-tank ventilation valve"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi TT Fuel-Tank Ventilation Valve — NHTSA 09V377",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=09V377000"
          }
        ],
        "summary": "Replaced the frozen “Haldex AWD Coupling Pump/Controller Failure Leading to Front-Wheel-Drive Only Operation” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-tt-high-speed-stability-recall-for-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “High-Speed Stability Recall for Rear Suspension/ESP Calibration on Early Mk1 TT” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 0 commerce claims and 0 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 20BX Fuel-Tank Heat-Shield Bracket — NHTSA 20V076",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V076000"
        }
      ],
      "after": {
        "years": [
          2016,
          2017,
          2018,
          2019
        ],
        "trims": [],
        "engines": [],
        "category": "fuel",
        "title": "Fuel Tank Can Be Damaged by Heat-Shield Bracket in a Crash (Recall 20V076 / 20BX)",
        "description": "On certain 2016-2019 TT Coupe Quattro and Roadster Quattro vehicles, the fuel-tank heat-shield bracket can damage the tank during a crash and allow fuel leakage.",
        "solution": "Check VIN eligibility. Audi dealers install a protective cap on the heat-shield bracket free of charge under campaign 20BX.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Open safety recall",
          "No reliable warning before crash-related tank damage"
        ],
        "affectedSystems": [
          "fuel tank",
          "fuel-tank heat-shield bracket"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 20BX Fuel-Tank Heat-Shield Bracket — NHTSA 20V076",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V076000"
          }
        ],
        "summary": "Replaced the frozen “High-Speed Stability Recall for Rear Suspension/ESP Calibration on Early Mk1 TT” card with an exact NHTSA/Audi campaign scope and removed 0 commerce claims with 0 URLs."
      }
    },
    "audi-tt-instrument-cluster-pixel-failure-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Instrument Cluster Pixel Failure and Intermittent Gauge/Warning Display Loss” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 1 commerce claims and 1 outbound URL occurrences.",
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
        "description": "Certain 2016 TT Coupes and Roadsters contain a front-passenger airbag module that may explode or deploy improperly, risking metal-fragment injury or inadequate restraint.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the front-passenger airbag module free of charge under campaign 69DY/61C1.",
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
        "summary": "Replaced the frozen “Instrument Cluster Pixel Failure and Intermittent Gauge/Warning Display Loss” card with an exact NHTSA/Audi campaign scope and removed 1 commerce claims with 1 URLs."
      }
    },
    "audi-tt-magnetic-ride-2008": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Magnetic Ride Damper Leaks” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 69GU Passenger-Seat Occupant Detection — NHTSA 24V251",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V251000"
        }
      ],
      "after": {
        "years": [
          2023
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Passenger-Seat Occupant Detection Connection Can Disable Airbag (Recall 24V251 / 69GU)",
        "description": "On certain 2023 TT Coupes and Roadsters, an electrical connection at the passenger-seat occupant-detection control module can loosen and deactivate the front-passenger airbag.",
        "solution": "Check VIN eligibility. Audi dealers replace the passenger-seat occupant-detection control module free of charge under campaign 69GU.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Passenger-airbag warning",
          "Front-passenger airbag deactivated"
        ],
        "affectedSystems": [
          "occupant-detection control module",
          "front-passenger airbag"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 69GU Passenger-Seat Occupant Detection — NHTSA 24V251",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V251000"
          }
        ],
        "summary": "Replaced the frozen “Magnetic Ride Damper Leaks” card with an exact NHTSA/Audi campaign scope and removed 2 commerce claims with 4 URLs."
      }
    },
    "audi-tt-tail-light-corrosion-2008": {
      "disposition": "replace",
      "decision": "Replace the frozen “Tail Light Electrical Connector Corrosion (Mk2)” aggregation with the bounded Audi technical-service bulletin path below. Remove all 5 commerce claims and 9 outbound URL occurrences.",
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
        "description": "Audi TSB 2045106/6 covers 2018-2021 TT vehicles with satellite-radio linking errors or an incorrect GPS location caused by a poorly seated or damaged FAKRA coaxial connection at the shark-fin antenna.",
        "solution": "Verify the concern with a clear view of the sky and perform the TSB road-test and fault-memory checks. If the fault is at the shark-fin connection, replace the affected coaxial connector section and adapter cable, clear DTCs, and verify reception.",
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
        "summary": "Replaced the frozen “Tail Light Electrical Connector Corrosion (Mk2)” card with an exact Audi TSB scope and removed 5 commerce claims with 9 URLs."
      }
    },
    "audi-tt-water-pump-2008": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “Water Pump Failure (60k Mile Lifespan)” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 5 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TT Coupe C-Pillar Trim Retention — NHTSA 08V064",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=08V064000"
        }
      ],
      "after": {
        "years": [
          2008
        ],
        "trims": [],
        "engines": [],
        "category": "interior",
        "title": "C-Pillar Trim Cover Can Detach During Belt-Tensioner Deployment (Recall 08V064)",
        "description": "Certain 2008 TT Coupes were built with C-pillar trim clips that may not retain the cover during rear pyrotechnic seat-belt-tensioner deployment, creating an occupant-injury risk.",
        "solution": "Check VIN eligibility. Audi dealers install improved C-pillar trim clips free of charge under recall 08V064.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Open safety recall",
          "No reliable warning before trim detachment during deployment"
        ],
        "affectedSystems": [
          "C-pillar trim cover",
          "trim retention clips"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi TT Coupe C-Pillar Trim Retention — NHTSA 08V064",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=08V064000"
          }
        ],
        "summary": "Replaced the frozen “Water Pump Failure (60k Mile Lifespan)” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 5 URLs."
      }
    }
  },
  "expectedPerRecord": {
    "audi-tt-absesp-control-module-failure-2000": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=8N0614517M&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=8N0614517M",
        "https://www.ebay.com/sch/i.html?_nkw=8N0614517M",
        "https://www.amazon.com/s?k=VCDS%20diagnostic%20cable&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-cam-follower-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0",
        "communityRecommendations:1",
        "communityRecommendations:4"
      ],
      "urls": [
        "https://www.amazon.com/s?k=06D%20109%20309%20C&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=06D%20109%20309%20C",
        "https://www.ebay.com/sch/i.html?_nkw=06D%20109%20309%20C",
        "https://www.amazon.com/s?k=INA%2006H109311B&tag=au7o-20",
        "https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006L109311&tag=au7o-20",
        "https://www.amazon.com/s?k=Bosch%2006J906051D&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-coil-pack-failure-and-2000": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=06A905115D&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=06A905115D",
        "https://www.ebay.com/sch/i.html?_nkw=06A905115D",
        "https://www.amazon.com/s?k=Audi%201.8T%20coil%20pack%20set%20OEM&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-dsg-mechatronic-2008": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=02E325025&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=02E325025",
        "https://www.ebay.com/sch/i.html?_nkw=02E325025",
        "https://www.amazon.com/s?k=02E927770AQ&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=02E927770AQ",
        "https://www.ebay.com/sch/i.html?_nkw=02E927770AQ",
        "https://www.amazon.com/s?k=Genuine%20Audi%200BH325031A%20DSG%20TT&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-dsg-transmission-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0",
        "communityRecommendations:2"
      ],
      "urls": [
        "https://www.amazon.com/s?k=02E325025&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=02E325025",
        "https://www.ebay.com/sch/i.html?_nkw=02E325025",
        "https://www.amazon.com/s?k=Pentosin%20G052182A2&tag=au7o-20",
        "https://www.amazon.com/s?k=BBA-Reman%20Rebuilt%20Mechatronic%20Unit&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-front-control-arm-bushings-2000": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=8N0407165&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=8N0407165",
        "https://www.ebay.com/sch/i.html?_nkw=8N0407165",
        "https://www.amazon.com/s?k=8N0407151D&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=8N0407151D",
        "https://www.ebay.com/sch/i.html?_nkw=8N0407151D",
        "https://www.amazon.com/s?k=Audi%20TT%20Mk1%20control%20arm%20kit&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-haldex-awd-coupling-pumpcontroller-2000": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=02D525557&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=02D525557",
        "https://www.ebay.com/sch/i.html?_nkw=02D525557",
        "https://www.amazon.com/s?k=Haldex%20service%20kit%20Audi%20TT%20Mk1&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-high-speed-stability-recall-for-2000": {
      "claimIds": [],
      "urls": [],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-instrument-cluster-pixel-failure-2000": {
      "claimIds": [
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=VCDS%20diagnostic%20cable&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-magnetic-ride-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=8J0413029D&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=8J0413029D",
        "https://www.ebay.com/sch/i.html?_nkw=8J0413029D",
        "https://www.amazon.com/s?k=Bilstein%20magnetic%20ride%20damper%20Audi%20TT&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-tail-light-corrosion-2008": {
      "claimIds": [
        "fixParts:0",
        "fixParts:1",
        "communityRecommendations:1",
        "communityRecommendations:2",
        "communityRecommendations:3"
      ],
      "urls": [
        "https://www.amazon.com/s?k=1J0973733&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=1J0973733",
        "https://www.ebay.com/sch/i.html?_nkw=1J0973733",
        "https://www.amazon.com/s?k=8J0945257A&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=8J0945257A",
        "https://www.ebay.com/sch/i.html?_nkw=8J0945257A",
        "https://www.amazon.com/s?k=CRC%20QD%20Electronic%20Cleaner&tag=au7o-20",
        "https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20Tail%20Light%20Assembly%20(Mk2%20TT)&tag=au7o-20",
        "https://www.amazon.com/s?k=Permatex%2022058&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-tt-water-pump-2008": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0",
        "communityRecommendations:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=06L121111H&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=06L121111H",
        "https://www.ebay.com/sch/i.html?_nkw=06L121111H",
        "https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006L121111P&tag=au7o-20",
        "https://www.amazon.com/s?k=USP%20Motorsports%2006L121111H-KT1&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    }
  },
  "expectedTelemetry": {
    "claimCount": 30,
    "urlCount": 56,
    "claimClickCount": 0,
    "recordClickCount": 0,
    "priorityClickCount": 0
  },
  "expectedDispositionCounts": {
    "recall-dealer": 11,
    "replace": 1
  },
  "expectedPublished": 12,
  "expectedArchived": 0,
  "controlledDeltaProposals": [],
  "expectedProposalIdentities": []
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
  "audi-tt-absesp-control-module-failure-2000": [
    2000,
    2001
  ],
  "audi-tt-cam-follower-2008": [
    2000
  ],
  "audi-tt-coil-pack-failure-and-2000": [
    2000,
    2001
  ],
  "audi-tt-dsg-mechatronic-2008": [
    2004
  ],
  "audi-tt-dsg-transmission-2008": [
    2009
  ],
  "audi-tt-front-control-arm-bushings-2000": [
    2000
  ],
  "audi-tt-haldex-awd-coupling-pumpcontroller-2000": [
    2008,
    2009,
    2010
  ],
  "audi-tt-high-speed-stability-recall-for-2000": [
    2016,
    2017,
    2018,
    2019
  ],
  "audi-tt-instrument-cluster-pixel-failure-2000": [
    2016
  ],
  "audi-tt-magnetic-ride-2008": [
    2023
  ],
  "audi-tt-tail-light-corrosion-2008": [
    2018,
    2019,
    2020,
    2021
  ],
  "audi-tt-water-pump-2008": [
    2008
  ]
};
  const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
  if (
    Object.entries(expectedYears).some(([id, years]) => JSON.stringify(byId.get(id).years) !== JSON.stringify(years)) ||
    issues.filter((issue) => issue.after.status === 'published').length !== config.expectedPublished ||
    issues.filter((issue) => issue.after.status === 'archived').length !== config.expectedArchived
  ) {
    throw new Error('Audi TT reviewed scopes or published/archived split drifted.');
  }
};

module.exports = config;
