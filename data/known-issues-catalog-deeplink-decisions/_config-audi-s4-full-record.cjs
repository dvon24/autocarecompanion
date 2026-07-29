const config = {
  "label": "Audi S4",
  "make": "Audi",
  "model": "S4",
  "batchId": "audi-s4-full-record-cohort-1-2026-07-29",
  "auditDate": "2026-07-29",
  "snapshotHash": "3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102",
  "sourceSnapshotFileHash": "6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455",
  "packetFileHash": "bfb39703e8427ecb62fed4e8135ebeb229be74255d5add97050dac10bbd9e57d",
  "packetRelativePath": "data/known-issues-catalog-deeplink-work/audi-s4/3ee40713b2b5/all-0001.json",
  "reviewTokens": {
    "blind": "s4_blind_review:no-blocker",
    "edge": "s4_edge_review:no-blocker"
  },
  "expectedIds": [
    "audi-s4-b5-timing-chain-2000",
    "audi-s4-b5-turbo-failure-2000",
    "audi-s4-b6-timing-chain-2004",
    "audi-s4-carbon-buildup-2010",
    "audi-s4-supercharger-nose-2010",
    "audi-s4-thermostat-2010"
  ],
  "records": {
    "audi-s4-b5-timing-chain-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “B5 S4 2.7T Timing Chain Guide Failure” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 5 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 69CJ Driver Airbag Inflator — NHTSA 21V470",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V470000"
        }
      ],
      "after": {
        "years": [
          2000,
          2001,
          2002
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Driver Airbag Inflator May Deploy Improperly (Recall 21V470 / 69CJ)",
        "description": "Certain 2000-2002 S4 vehicles have a non-azide driver airbag inflator that can absorb moisture and deploy improperly, reducing occupant protection in a crash.",
        "solution": "Check the VIN with Audi or NHTSA. Audi dealers replace the driver frontal-airbag inflator with an alternative inflator free of charge under campaign 69CJ.",
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
        "summary": "Replaced the frozen “B5 S4 2.7T Timing Chain Guide Failure” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 5 URLs."
      }
    },
    "audi-s4-b5-turbo-failure-2000": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “B5 2.7T Turbocharger Failure” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 5 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi Xenon Headlamp Reflector Coating — NHTSA 05V096",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=05V096000"
        }
      ],
      "after": {
        "years": [
          2003,
          2004
        ],
        "trims": [],
        "engines": [],
        "category": "electrical",
        "title": "Xenon Headlamp Reflector Coating Can Reduce Light Output (Recall 05V096)",
        "description": "Certain 2003-2004 S4 xenon headlamp reflectors can lose coating over time, reducing luminous transmittance and the driver’s field of view.",
        "solution": "Verify VIN eligibility and campaign completion with Audi. Dealers replace both xenon headlamp reflectors free of charge under recall 05V096.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Reduced xenon headlamp output",
          "Poor nighttime visibility"
        ],
        "affectedSystems": [
          "left and right xenon headlamp reflectors"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi Xenon Headlamp Reflector Coating — NHTSA 05V096",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=05V096000"
          }
        ],
        "summary": "Replaced the frozen “B5 2.7T Turbocharger Failure” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 5 URLs."
      }
    },
    "audi-s4-b6-timing-chain-2004": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “B6/B7 4.2L V8 Timing Chain Tensioner Failure” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 3 commerce claims and 5 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 69R7 Passenger Airbag Inflator — NHTSA 18V427",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V427000"
        }
      ],
      "after": {
        "years": [
          2005,
          2006,
          2007,
          2008,
          2009
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Passenger Airbag Inflator Can Rupture (Recall 18V427 / 69R7)",
        "description": "Certain 2005-2009 S4 body styles contain passenger frontal-airbag inflators that can rupture after long-term humidity and temperature exposure, propelling metal fragments into the cabin.",
        "solution": "Check VIN eligibility because body style and original registration history affect scope. Audi dealers replace the passenger frontal-airbag remedy part free of charge under campaign 69R7.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Open safety recall",
          "No reliable warning before airbag deployment"
        ],
        "affectedSystems": [
          "passenger frontal airbag inflator"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 69R7 Passenger Airbag Inflator — NHTSA 18V427",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V427000"
          }
        ],
        "summary": "Replaced the frozen “B6/B7 4.2L V8 Timing Chain Tensioner Failure” card with an exact NHTSA/Audi campaign scope and removed 3 commerce claims with 5 URLs."
      }
    },
    "audi-s4-carbon-buildup-2010": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “3.0T Intake Valve Carbon Buildup” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 1 commerce claims and 1 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 24AP Fuel Rail and Seal — NHTSA 15V019",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=15V019000"
        }
      ],
      "after": {
        "years": [
          2011,
          2012
        ],
        "trims": [],
        "engines": [
          "3.0 TFSI"
        ],
        "category": "fuel",
        "title": "Fuel Rail or Seal Leak Creates Fire Risk (Recall 15V019 / 24AP)",
        "description": "Certain 2011-2012 S4 fuel-injection systems can leak at the fuel rails or corresponding seals, creating a fire risk near an ignition source.",
        "solution": "Check the VIN and campaign history. Audi dealers replace the fuel rails and corresponding seals free of charge under campaign 24AP. If fuel odor or leakage is present, stop driving and arrange immediate inspection.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Fuel odor",
          "Visible fuel leakage"
        ],
        "affectedSystems": [
          "fuel rails",
          "fuel-injection seals"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 24AP Fuel Rail and Seal — NHTSA 15V019",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=15V019000"
          }
        ],
        "summary": "Replaced the frozen “3.0T Intake Valve Carbon Buildup” card with an exact NHTSA/Audi campaign scope and removed 1 commerce claims with 1 URLs."
      }
    },
    "audi-s4-supercharger-nose-2010": {
      "disposition": "recall-dealer",
      "decision": "Replace the frozen “3.0T Supercharger Nose Bearing Failure” aggregation with the bounded NHTSA/Audi campaign path below. Remove all 1 commerce claims and 1 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi 69K5 Airbag-Control Software — NHTSA 14V667",
          "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=14V667000"
        }
      ],
      "after": {
        "years": [
          2013,
          2014,
          2015
        ],
        "trims": [],
        "engines": [],
        "category": "safety",
        "title": "Airbag-Control Software May Miss Front-Airbag Deployment After a Second Impact (Recall 14V667 / 69K5)",
        "description": "On certain 2013-2015 S4 vehicles, an airbag-control algorithm may fail to command the front airbags after a side-airbag deployment followed by a second frontal impact.",
        "solution": "Check VIN eligibility and completion history. Audi dealers update the airbag control-unit software free of charge under campaign 69K5.",
        "severity": "high",
        "confidence": "high",
        "source": "nhtsa-verified",
        "symptoms": [
          "Open safety recall",
          "No reliable warning before a multi-impact crash"
        ],
        "affectedSystems": [
          "airbag control unit",
          "front and side airbags"
        ],
        "dtcCodes": [],
        "citations": [
          {
            "type": "recall",
            "title": "Audi 69K5 Airbag-Control Software — NHTSA 14V667",
            "url": "https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=14V667000"
          }
        ],
        "summary": "Replaced the frozen “3.0T Supercharger Nose Bearing Failure” card with an exact NHTSA/Audi campaign scope and removed 1 commerce claims with 1 URLs."
      }
    },
    "audi-s4-thermostat-2010": {
      "disposition": "replace",
      "decision": "Replace the frozen “Thermostat Housing Failure and Coolant Leak” aggregation with the bounded Audi technical-service bulletin path below. Remove all 2 commerce claims and 4 outbound URL occurrences.",
      "evidence": [
        {
          "label": "Audi TSB 2058767/7 — Thermostat Does Not Close Completely",
          "url": "https://static.nhtsa.gov/odi/tsbs/2021/MC-10188591-0001.pdf"
        }
      ],
      "after": {
        "years": [
          2018,
          2019,
          2020
        ],
        "trims": [],
        "engines": [
          "3.0 TFSI"
        ],
        "category": "cooling",
        "title": "Thermostat Does Not Close Completely With Cooling-System DTCs (TSB 2058767/7)",
        "description": "Audi TSB 2058767/7 covers bounded 2018-2020 S4 3.0 TFSI VIN ranges with the MIL on, a fan that may run continuously, and at least two cooling-system or coolant-temperature DTCs caused by a thermostat that does not close completely.",
        "solution": "Follow the Audi TSB: remove the thermostat, cool it if necessary, and inspect for a gap between the chamber and seal. Replace the thermostat only when the failure is confirmed, refill with specified coolant, and do not substitute a coolant-temperature sender for this diagnosis.",
        "severity": "medium",
        "confidence": "high",
        "source": "manual",
        "symptoms": [
          "Malfunction indicator lamp",
          "Cooling fan runs continuously",
          "Engine temperature too low"
        ],
        "affectedSystems": [
          "thermostat",
          "engine cooling system"
        ],
        "dtcCodes": [
          "P218100",
          "P017B00",
          "P308100",
          "P01E400"
        ],
        "citations": [
          {
            "type": "tsb",
            "title": "Audi TSB 2058767/7 — Thermostat Does Not Close Completely",
            "url": "https://static.nhtsa.gov/odi/tsbs/2021/MC-10188591-0001.pdf"
          }
        ],
        "summary": "Replaced the frozen “Thermostat Housing Failure and Coolant Leak” card with an exact Audi TSB scope and removed 2 commerce claims with 4 URLs."
      }
    }
  },
  "expectedPerRecord": {
    "audi-s4-b5-timing-chain-2000": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0",
        "communityRecommendations:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=078109088H&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=078109088H",
        "https://www.ebay.com/sch/i.html?_nkw=078109088H",
        "https://www.amazon.com/s?k=Audi%20S4%20Cloyes%20Timing%20Chain%20Kit&tag=au7o-20",
        "https://www.amazon.com/s?k=Audi%20S4%20Castrol%20Edge%20Full%20Synthetic%20Motor%20Oil&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s4-b5-turbo-failure-2000": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0",
        "communityRecommendations:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=078145701S&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=078145701S",
        "https://www.ebay.com/sch/i.html?_nkw=078145701S",
        "https://www.amazon.com/s?k=Audi%20S4%20Dorman%20Turbocharger%20Gasket%20Kit&tag=au7o-20",
        "https://www.amazon.com/s?k=Audi%20S4%20AutoMeter%20Mechanical%20Boost%20Gauge&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s4-b6-timing-chain-2004": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0",
        "communityRecommendations:1"
      ],
      "urls": [
        "https://www.amazon.com/s?k=079109218D&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=079109218D",
        "https://www.ebay.com/sch/i.html?_nkw=079109218D",
        "https://www.amazon.com/s?k=Audi%20S4%20Cloyes%20Timing%20Chain%20Kit&tag=au7o-20",
        "https://www.amazon.com/s?k=Audi%20S4%20Castrol%20Edge%20Full%20Synthetic%20Motor%20Oil&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s4-carbon-buildup-2010": {
      "claimIds": [
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=CRC%2005319%20intake%20valve%20cleaner&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s4-supercharger-nose-2010": {
      "claimIds": [
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=JHM%20supercharger%20snout%20rebuild%20S4&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    },
    "audi-s4-thermostat-2010": {
      "claimIds": [
        "fixParts:0",
        "communityRecommendations:0"
      ],
      "urls": [
        "https://www.amazon.com/s?k=06E121111AD&tag=au7o-20",
        "https://www.rockauto.com/en/partsearch/?q=06E121111AD",
        "https://www.ebay.com/sch/i.html?_nkw=06E121111AD",
        "https://www.amazon.com/s?k=Wahler%20410671%20thermostat%20Audi&tag=au7o-20"
      ],
      "claimClicks": 0,
      "recordClicks": 0,
      "priorityClicks": 0
    }
  },
  "expectedTelemetry": {
    "claimCount": 13,
    "urlCount": 21,
    "claimClickCount": 0,
    "recordClickCount": 0,
    "priorityClickCount": 0
  },
  "expectedDispositionCounts": {
    "recall-dealer": 5,
    "replace": 1
  },
  "expectedPublished": 6,
  "expectedArchived": 0,
  "controlledDeltaProposals": [],
  "expectedProposalIdentities": []
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
  "audi-s4-b5-timing-chain-2000": [
    2000,
    2001,
    2002
  ],
  "audi-s4-b5-turbo-failure-2000": [
    2003,
    2004
  ],
  "audi-s4-b6-timing-chain-2004": [
    2005,
    2006,
    2007,
    2008,
    2009
  ],
  "audi-s4-carbon-buildup-2010": [
    2011,
    2012
  ],
  "audi-s4-supercharger-nose-2010": [
    2013,
    2014,
    2015
  ],
  "audi-s4-thermostat-2010": [
    2018,
    2019,
    2020
  ]
};
  const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
  if (
    Object.entries(expectedYears).some(([id, years]) => JSON.stringify(byId.get(id).years) !== JSON.stringify(years)) ||
    issues.filter((issue) => issue.after.status === 'published').length !== config.expectedPublished ||
    issues.filter((issue) => issue.after.status === 'archived').length !== config.expectedArchived
  ) {
    throw new Error('Audi S4 reviewed scopes or published/archived split drifted.');
  }
};

module.exports = config;
