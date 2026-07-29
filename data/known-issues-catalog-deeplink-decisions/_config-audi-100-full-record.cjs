const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=100&modelYear=${year}`;

const citations = {
  transaxle1990: cite(
    'recall',
    'NHTSA 93V006 - 1990 Audi 100 3-Speed Automatic Transaxle Differential Oil',
    recallUrl(1990),
  ),
  transaxle1991: cite(
    'recall',
    'NHTSA 93V006 - 1991 Audi 100 3-Speed Automatic Transaxle Differential Oil',
    recallUrl(1991),
  ),
  amplifier1991: cite(
    'recall',
    'NHTSA 01V324 - 1991 Audi 100 Rear-Speaker Amplifier',
    recallUrl(1991),
  ),
  amplifier1992: cite(
    'recall',
    'NHTSA 01V324 - 1992 Audi 100 Rear-Speaker Amplifier',
    recallUrl(1992),
  ),
  brake1992: cite(
    'recall',
    'NHTSA 93V007 - 1992 Audi 100 Brake Vacuum-Booster Pump',
    recallUrl(1992),
  ),
  ignition1994: cite(
    'recall',
    'NHTSA 96V017 - 1994 Audi 100 Ignition Switch',
    recallUrl(1994),
  ),
  recallInventory1992: cite(
    'nhtsa',
    'NHTSA 1992 Audi 100 Recall Inventory',
    recallUrl(1992),
  ),
  recallInventory1994: cite(
    'nhtsa',
    'NHTSA 1994 Audi 100 Recall Inventory',
    recallUrl(1994),
  ),
};

const archived = ({
  years,
  category,
  title,
  description,
  solution,
  citation,
  summary,
}) => ({
  years,
  trims: [],
  engines: [],
  category,
  title: `Archived - ${title}`,
  description,
  solution,
  severity: 'low',
  confidence: 'low',
  source: 'manual',
  symptoms: [],
  affectedSystems: [],
  dtcCodes: [],
  citations: [citation],
  summary,
});

const records = {
  'audi-100-auto-transmission-issues-1990': {
    disposition: 'recall-dealer',
    decision:
      'Replace the generic harsh-shift, five-DTC, solenoid and filter-kit aggregation with exact NHTSA campaign 93V006. The supported condition is differential-oil loss by evaporation on 1990-1991 Audi 100 vehicles with the 3-speed automatic transaxle. Remove both shopping claims and URLs.',
    evidence: [
      {
        label:
          'NHTSA 93V006 identifies 1990-1991 Audi 100 passenger cars with 3-speed automatic transmissions, differential-oil loss, eventual differential failure and a higher-performance replacement oil remedy',
        url: citations.transaxle1990.url,
      },
      {
        label:
          'The NHTSA 1991 vehicle response independently returns the same 93V006 campaign and equipment boundary',
        url: citations.transaxle1991.url,
      },
    ],
    after: {
      years: [1990, 1991],
      trims: [],
      engines: [],
      category: 'transmission',
      title:
        '1990-1991 Audi 100 3-Speed Automatic Transaxle Recall 93V006',
      description:
        'NHTSA campaign 93V006 covers 1990-1991 Audi 100 passenger cars equipped with a 3-speed automatic transmission. The campaign states that differential oil could be lost over time through evaporation, causing premature bearing and gear wear. Eventual differential failure could remove drive to the wheels or, in an extreme case, lock the front wheels and cause rapid deceleration. This is not a generic harsh-shift, solenoid or OBD-II DTC diagnosis.',
      solution:
        'Check the VIN and campaign history with Audi or NHTSA. The historical campaign remedy drained the differential gear oil and replaced it with oil having higher-performance characteristics. Because these vehicles are more than 15 years old, confirm current remedy availability and any cost with Audi before service. Diagnose a present shift complaint separately and do not order a solenoid or filter kit from this card.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Loss of drive if the differential fails',
        'Possible front-wheel lock in an extreme differential failure',
      ],
      affectedSystems: [
        '3-speed automatic transaxle differential',
        'differential bearings and gears',
      ],
      dtcCodes: [],
      citations: [citations.transaxle1990, citations.transaxle1991],
      summary:
        'Replaced a generic harsh-shift and solenoid aggregation with exact 1990-1991 3-speed automatic transaxle recall 93V006; removed 1992-1994, five unsupported DTCs, fixed costs and two commerce claims with two URLs.',
    },
  },
  'audi-100-brake-pressure-accumulator-nitrogen-loss': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported five-year hydraulic accumulator nitrogen-loss and direct accumulator-shopping claim with exact 1992 V6 automatic brake vacuum-booster-pump recall 93V007. The mechanisms are not interchangeable. Remove the commerce claim and three URLs.',
    evidence: [
      {
        label:
          'NHTSA 93V007 limits the supported Audi 100 brake-assist condition to 1992 V6 automatic vehicles and premature wear of the brake vacuum-booster-pump blades',
        url: citations.brake1992.url,
      },
    ],
    after: {
      years: [1992],
      trims: [],
      engines: ['V6 with automatic transmission'],
      category: 'brakes',
      title:
        '1992 Audi 100 V6 Automatic Brake-Assist Recall 93V007',
      description:
        'NHTSA campaign 93V007 covers 1992 Audi 100 passenger cars with a V6 engine and automatic transmission. The brake vacuum-booster-pump blades could wear prematurely and reduce brake-assist pressure when the pedal is applied. Reduced assist can increase stopping distance and crash risk. The campaign does not establish nitrogen loss in a hydraulic pressure accumulator or support buying the former accumulator part.',
      solution:
        'Check the VIN and recall-completion history with Audi or NHTSA. The historical remedy replaced the brake vacuum-booster pump with a newly developed brake vacuum-booster valve assembly. Because of the vehicle age, confirm present remedy availability and cost with Audi. If brake effort is elevated, stop driving until the assist system is inspected.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Reduced brake assist',
        'Higher pedal effort',
        'Longer stopping distance',
      ],
      affectedSystems: [
        'brake vacuum-booster pump',
        'brake power-assist system',
      ],
      dtcCodes: [],
      citations: [citations.brake1992],
      summary:
        'Corrected an unsupported 1990-1994 accumulator narrative to exact 1992 V6 automatic brake-assist recall 93V007; removed nitrogen-loss tests, accumulator replacement advice and one commerce claim with three URLs.',
    },
  },
  'audi-100-engine-charging-wiring-harness-insulation-degradation': {
    disposition: 'recall-dealer',
    decision:
      'Replace the forum-only charging-harness insulation aggregation with exact NHTSA campaign 01V324 for 1991-1992 rear-speaker amplifiers. The official fire-risk mechanism is a leaking electrolytic capacitor and humidity-created conductive path, not the former engine harness narrative.',
    evidence: [
      {
        label:
          'NHTSA 01V324 identifies 1991-1992 Audi 100 rear-speaker amplifiers whose electrolytic capacitors could leak and create an overheating/fire risk',
        url: citations.amplifier1991.url,
      },
      {
        label:
          'The 1992 NHTSA response returns the same 01V324 campaign',
        url: citations.amplifier1992.url,
      },
    ],
    after: {
      years: [1991, 1992],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '1991-1992 Audi 100 Rear-Speaker Amplifier Recall 01V324',
      description:
        'NHTSA campaign 01V324 covers 1991-1992 Audi 100 passenger vehicles. An electrolytic capacitor in each rear-speaker amplifier could leak electrolyte; with humidity, that leakage could create an unwanted conductive path, overheat the amplifier and create a fire risk. The campaign does not validate a universal engine or charging wiring-harness insulation defect.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The historical remedy replaced the rear-speaker amplifier assemblies. Confirm current remedy availability and cost with Audi because of the vehicle age. Treat heat, smoke or a burning smell from the rear-speaker area as an immediate stop-and-inspect condition.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Heat, smoke or burning odor near a rear-speaker amplifier',
      ],
      affectedSystems: [
        'rear-speaker amplifier assemblies',
        'amplifier electrolytic capacitors',
      ],
      dtcCodes: [],
      citations: [citations.amplifier1991, citations.amplifier1992],
      summary:
        'Replaced a forum-only charging-harness aggregation with exact 1991-1992 rear-speaker amplifier recall 01V324 and removed unsupported wiring-repair and prevalence claims.',
    },
  },
  'audi-100-hvac-temperature-flap-actuator-motor-failure': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unrelated later-model blend-door forum citations and direct actuator-shopping claim with exact 1994 Audi 100 ignition-switch recall 96V017. That official condition can disable the air conditioner and other safety-relevant accessories after starting. Remove one claim and three URLs.',
    evidence: [
      {
        label:
          'NHTSA 96V017 returns for the 1994 Audi 100 and identifies an improperly manufactured ignition switch that can disable air conditioning, wipers, lamps, turn signals and power windows',
        url: citations.ignition1994.url,
      },
    ],
    after: {
      years: [1994],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '1994 Audi 100 Ignition-Switch Recall 96V017',
      description:
        'NHTSA campaign 96V017 covers the 1994 Audi 100. An improperly manufactured ignition switch could cause electrical accessories to malfunction after the car is started, including turn signals, windshield wipers, lamps, power windows and air conditioning. This does not establish a temperature-flap actuator failure or support the former actuator part number.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The historical remedy replaced the ignition switch. Confirm current remedy availability and cost with Audi because of the vehicle age. If wipers, lamps or turn signals fail after starting, avoid driving in conditions that require them until the ignition circuit is inspected.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Turn signals, wipers, lamps, power windows or air conditioning fail after starting',
      ],
      affectedSystems: ['ignition switch', 'switched electrical accessories'],
      dtcCodes: [],
      citations: [citations.ignition1994],
      summary:
        'Replaced an unsupported 1991-1994 blend-door actuator aggregation with exact 1994 ignition-switch recall 96V017; removed unrelated later-model citations, actuator replacement advice and one commerce claim with three URLs.',
    },
  },
  'audi-100-hydraulic-system-leak-1990': {
    disposition: 'remove',
    decision:
      'Archive the unsupported five-year combined brake, steering, suspension, Pentosin, hose, accumulator, pump and fixed-cost aggregation. The official Audi 100 recall inventory establishes narrower safety campaigns, not this universal multi-system diagnosis. Remove three claims and five URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1992 Audi 100 recall response identifies a bounded brake vacuum-pump campaign but does not establish the frozen universal hydraulic-assist leak narrative',
        url: citations.recallInventory1992.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994],
      category: 'suspension',
      title: 'Unsupported Multi-System Hydraulic-Assist Leak Aggregation',
      description:
        'The former row combined brake assist, power steering, suspension behavior, several leak points, one universal fluid, fixed costs and suspension shopping links without a model-specific Audi source establishing one condition.',
      solution:
        'Do not select a pump, hose, accumulator, strut or alignment part from this archived row. A leak or assist concern requires identification of the exact circuit, fluid, leak source and vehicle equipment before repair.',
      citation: citations.recallInventory1992,
      summary:
        'Archived an unsupported five-year multi-system hydraulic aggregation; removed fixed costs, unrelated suspension shopping and three commerce claims with five URLs.',
    }),
  },
  'audi-100-power-steering-rack-leak-1990': {
    disposition: 'remove',
    decision:
      'Archive the unsupported universal rack-seal, pump, tie-rod, generic-fluid and fixed-cost aggregation. The official recall inventory does not establish that combined 1990-1994 condition. Remove five claims and seven URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1992 Audi 100 recall inventory does not establish the frozen universal steering-rack failure or its direct parts mapping',
        url: citations.recallInventory1992.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994],
      category: 'steering',
      title: 'Unsupported Audi 100 Steering-Rack and Pump Aggregation',
      description:
        'The former row treated rack seals, the steering pump, tie-rod ends, groaning, fluid choice and fixed replacement costs as one universal Audi 100 defect without exact primary evidence.',
      solution:
        'Do not buy a rack, pump, tie-rod end or generic fluid from this archived row. Confirm the leak source, installed rack and Audi-specified fluid before choosing a repair.',
      citation: citations.recallInventory1992,
      summary:
        'Archived an unsupported steering-rack and pump aggregation; removed universal failure and fluid claims, fixed costs and five commerce claims with seven URLs.',
    }),
  },
  'audi-100-timing-belt-failure-interference-v6-causes-catastrophic-engi': {
    disposition: 'remove',
    decision:
      'Archive the unsupported catastrophic V6 timing-belt, fixed 60,000-mile interval, universal water-pump co-repair and direct kit-shopping aggregation. The frozen citations are owner and estimator pages, not an Audi maintenance or repair source. Remove one claim and three URLs.',
    evidence: [
      {
        label:
          'The official 1994 Audi 100 recall response establishes other bounded campaigns but does not validate this timing-belt interval, failure-rate or parts premise',
        url: citations.recallInventory1994.url,
      },
    ],
    after: archived({
      years: [1992, 1993, 1994],
      category: 'engine',
      title: 'Unsupported V6 Timing-Belt Failure and Fixed-Interval Aggregation',
      description:
        'The former row asserted one fixed belt interval, universal interference damage, water-pump co-replacement and replacement cost without an Audi maintenance schedule or repair bulletin in the frozen evidence.',
      solution:
        'Use the VIN, engine code and current Audi maintenance information to determine belt service and repair scope. Do not order a timing kit from this archived record.',
      citation: citations.recallInventory1994,
      summary:
        'Archived an unsupported V6 timing-belt and catastrophic-damage aggregation; removed a fixed interval, universal water-pump advice, fixed costs and one commerce claim with three URLs.',
    }),
  },
  'audi-100-vacuum-hose-rot-1990': {
    disposition: 'remove',
    decision:
      'Archive the unsupported five-year vacuum-hose, rough-idle, brake-booster, turbo, fuel-economy, smoke-test and generic scan-tool/oil aggregation. Its placeholder video and model landing page do not establish one repair. Remove two claims and URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1992 Audi 100 recall response distinguishes one V6 automatic brake vacuum-pump campaign rather than a universal all-engine vacuum-hose condition',
        url: citations.recallInventory1992.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994],
      category: 'engine',
      title: 'Unsupported Audi 100 Vacuum-Hose and Multi-Symptom Aggregation',
      description:
        'The former row combined idle, acceleration, braking, fuel economy, turbo and warning-lamp symptoms with a universal hose-replacement prescription without exact engine, component or primary-source scope.',
      solution:
        'Diagnose a vacuum or drivability concern by engine code, measured leakage and the affected circuit. Do not buy a generic scan tool or oil bundle from this archived row.',
      citation: citations.recallInventory1992,
      summary:
        'Archived an unsupported vacuum-hose and multi-system symptom aggregation; removed placeholder citations, fixed mileage and two commerce claims with two URLs.',
    }),
  },
};

module.exports = {
  label: 'Audi 100',
  make: 'Audi',
  model: '100',
  batchId: 'audi-100-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'c16d72203c7e7009c38c62240ed10827bdce8dda867104221065cf12fd30aa65',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-100/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'audi100_blind_review:no-blocker',
    edge: 'audi100_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-100-auto-transmission-issues-1990',
    'audi-100-brake-pressure-accumulator-nitrogen-loss',
    'audi-100-engine-charging-wiring-harness-insulation-degradation',
    'audi-100-hvac-temperature-flap-actuator-motor-failure',
    'audi-100-hydraulic-system-leak-1990',
    'audi-100-power-steering-rack-leak-1990',
    'audi-100-timing-belt-failure-interference-v6-causes-catastrophic-engi',
    'audi-100-vacuum-hose-rot-1990',
  ],
  records,
  expectedPerRecord: {
    'audi-100-auto-transmission-issues-1990': {
      claimIds: ['communityRecommendations:0', 'communityRecommendations:1'],
      urls: [
        'https://www.amazon.com/s?k=Dorman%20shift%20solenoid%20Audi%20100&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%20100%20transmission%20filter%20kit%20with%20gasket&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-100-brake-pressure-accumulator-nitrogen-loss': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=4A0612061D&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4A0612061D',
        'https://www.ebay.com/sch/i.html?_nkw=4A0612061D',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-100-engine-charging-wiring-harness-insulation-degradation': {
      claimIds: [],
      urls: [],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-100-hvac-temperature-flap-actuator-motor-failure': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=4A0820511&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4A0820511',
        'https://www.ebay.com/sch/i.html?_nkw=4A0820511',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-100-hydraulic-system-leak-1990': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=034145155A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=034145155A',
        'https://www.ebay.com/sch/i.html?_nkw=034145155A',
        'https://www.amazon.com/s?k=KYB%20Excel-G%20struts%20shocks%20Audi%20100&tag=au7o-20',
        'https://www.amazon.com/s?k=Moog%20alignment%20cam%20bolt%20kit%20Audi%20100&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-100-power-steering-rack-leak-1990': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
      ],
      urls: [
        'https://www.amazon.com/s?k=4A1422065&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4A1422065',
        'https://www.ebay.com/sch/i.html?_nkw=4A1422065',
        'https://www.amazon.com/s?k=Cardone%20power%20steering%20pump&tag=au7o-20',
        'https://www.amazon.com/s?k=Prestone%20power%20steering%20fluid&tag=au7o-20',
        'https://www.amazon.com/s?k=Cardone%20steering%20rack&tag=au7o-20',
        'https://www.amazon.com/s?k=Moog%20tie%20rod%20ends&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-100-timing-belt-failure-interference-v6-causes-catastrophic-engi': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=078109119D&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=078109119D',
        'https://www.ebay.com/sch/i.html?_nkw=078109119D',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-100-vacuum-hose-rot-1990': {
      claimIds: ['communityRecommendations:0', 'communityRecommendations:1'],
      urls: [
        'https://www.amazon.com/s?k=Audi%20100%20BlueDriver%20Bluetooth%20OBD2%20Diagnostic%20Scan%20Tool&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%20100%20Mobil%201%20Full%20Synthetic%20Oil%20and%20Filter%20Bundle&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 15,
    urlCount: 25,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 4,
    remove: 4,
  },
  expectedPublished: 4,
  expectedArchived: 4,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const transaxle = issues.find(
      (issue) => issue.id === 'audi-100-auto-transmission-issues-1990',
    ).after;
    const brake = issues.find(
      (issue) =>
        issue.id ===
        'audi-100-brake-pressure-accumulator-nitrogen-loss',
    ).after;
    const amplifier = issues.find(
      (issue) =>
        issue.id ===
        'audi-100-engine-charging-wiring-harness-insulation-degradation',
    ).after;
    const ignition = issues.find(
      (issue) =>
        issue.id ===
        'audi-100-hvac-temperature-flap-actuator-motor-failure',
    ).after;
    if (
      JSON.stringify(transaxle.years) !== JSON.stringify([1990, 1991]) ||
      JSON.stringify(brake.years) !== JSON.stringify([1992]) ||
      JSON.stringify(amplifier.years) !== JSON.stringify([1991, 1992]) ||
      JSON.stringify(ignition.years) !== JSON.stringify([1994]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 4
    ) {
      throw new Error(
        'Audi 100 recall scopes or archived split drifted after review.',
      );
    }
  },
};
