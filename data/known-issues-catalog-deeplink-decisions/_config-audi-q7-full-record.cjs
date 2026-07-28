const cite = (type, title, url) => ({ type, title, url });

const citations = {
  airSuspension: cite(
    'tsb',
    'Audi TSB 2059363/6 - Air Suspension Warning with C1260F0 or U112100',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11002225-0001.pdf',
  ),
  secondaryAir: cite(
    'tsb',
    'Audi TSB 2033001/18 - Q7 Secondary-Air Flow DTCs P0491 and P0492',
    'https://static.nhtsa.gov/odi/tsbs/2019/MC-10155651-9999.pdf',
  ),
  tdiSettlement: cite(
    'manual',
    'U.S. EPA - Volkswagen Clean Air Act Civil Settlement, 3.0-Liter Vehicles',
    'https://www.epa.gov/enforcement/volkswagen-clean-air-act-civil-settlement',
  ),
  brakeBoosterRecall: cite(
    'recall',
    'Audi Safety Recall 47L8 / NHTSA 14V516 - Q7 TDI Brake-Booster Vacuum Line',
    'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V516-8306.pdf',
  ),
  timingRattle: cite(
    'tsb',
    'Audi TSB 2039995/2 - Q7 3.0 TFSI Cold-Start Timing-Chain Rattle',
    'https://static.nhtsa.gov/odi/tsbs/2016/SB-10093541-0699.pdf',
  ),
  maintenance: cite(
    'manual',
    'Audi 2011 Scheduled Maintenance Intervals',
    'https://static.nhtsa.gov/odi/tsbs/2015/MC-10123750-9999.pdf',
  ),
  coolantAction: cite(
    'manual',
    'Audi Service Action 19H1/F1 - Coolant Pump',
    'https://static.nhtsa.gov/odi/tsbs/2011/CSC-10038584-9824.pdf',
  ),
  q7Specification: cite(
    'manual',
    'Audi 2014 Q7 Quick Reference Specification Book',
    'https://static.nhtsa.gov/odi/tsbs/2013/MC-10073844-2280.pdf',
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
  'audi-q7-air-suspension-2007': {
    disposition: 'remove',
    decision:
      'Archive the unsupported 2007-2015 four-spring, compressor, valve-block, cascading-failure, fixed-cost and coil-conversion aggregation. The current Audi bulletin establishes a different, bounded 2017-2025 Q7 J775/J1135 communication condition and does not validate the old 4L narrative. Remove both commerce claims and four search URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 begins Q7 applicability at model year 2017 and limits the supported condition to C1260F0/U112100 symptom 262400 communication diagnosis',
        url: citations.airSuspension.url,
      },
    ],
    after: archived({
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015],
      category: 'suspension',
      title: 'Unsupported 4L Q7 Air-Suspension System-Failure Aggregation',
      description:
        'The former row bundled air-spring cracking, compressor burnout, valve-block sticking, a universal cascading sequence, fixed costs and a coil-conversion recommendation without an Audi source establishing one 2007-2015 Q7 condition. Audi TSB 2059363/6 applies to a later Q7 generation and cannot be back-applied to this row.',
      solution:
        'Do not use this archived row to select air springs, a compressor, relay or conversion kit. A 2007-2015 Q7 with sagging, hissing, ride-height or warning complaints requires VIN-, equipment-, DTC- and component-specific diagnosis.',
      citation: citations.airSuspension,
      summary:
        'Archived an unsupported first-generation Q7 multi-component air-suspension aggregation; removed 2,500 seeded reports, fixed costs, universal replacement and conversion advice plus two commerce claims and four URLs.',
    }),
  },
  'audi-q7-air-suspension-failure-2007': {
    disposition: 'remove',
    decision:
      'Archive this duplicate unsupported 2007-2015 strut, compressor, control-module, cost and coil-conversion aggregation. It duplicates the other old-generation air-suspension row, while the exact Audi bulletin starts at 2017. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 does not cover 2007-2015 Q7 vehicles or establish generic strut, compressor and control-module failure',
        url: citations.airSuspension.url,
      },
    ],
    after: archived({
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015],
      category: 'suspension',
      title: 'Duplicate Unsupported 4L Q7 Air-Strut and Compressor Aggregation',
      description:
        'The former row duplicated the old-generation Q7 air-suspension card and combined seal degradation, physical damage, corrosion, compressor overwork, module failure, fixed repair costs and conversion advice without exact Audi support.',
      solution:
        'Do not use this archived row for parts selection. Confirm vehicle equipment, stored faults, leak location, wiring and compressor operation before choosing any repair.',
      citation: citations.airSuspension,
      summary:
        'Archived a duplicate unsupported 2007-2015 Q7 air-strut and compressor aggregation; removed fixed costs, cross-vendor recommendations and three commerce claims with five URLs.',
    }),
  },
  'audi-q7-carbon-buildup-3.0t-2011': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the unsupported intake-valve damage, walnut-blasting interval, catch-can and engine-replacement narrative with exact Audi TSB 2033001/18. The supported Q7 condition is simultaneous P0491/P0492 after 15,000 miles from restricted cylinder-head secondary-air ports. Remove both commerce claims and four URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2033001/18 explicitly lists 2011-2016 Q7 3.0 TFSI vehicles, MIL illumination, mileage over 15,000 and simultaneous P0491/P0492 caused by restricted secondary-air ports',
        url: citations.secondaryAir.url,
      },
    ],
    after: {
      years: [2011, 2012, 2013, 2014, 2015, 2016],
      trims: [],
      engines: ['3.0 TFSI'],
      category: 'emissions',
      title:
        '2011-2016 Q7 3.0 TFSI Secondary-Air Carbon Restriction - P0491/P0492',
      description:
        'Audi TSB 2033001/18 applies to 2011-2016 Q7 3.0 TFSI vehicles with more than 15,000 miles when the malfunction indicator lamp is on and P0491 and P0492 are stored together. Audi identifies carbon restriction in the cylinder-head secondary-air ports. This is not an intake-valve diagnosis and the bulletin does not establish universal valve damage, a walnut-blasting maintenance interval or a need for engine replacement.',
      solution:
        'Have an Audi-trained technician confirm that P0491 and P0492 are present together, test the secondary-air pump and hose routing, and measure secondary-air flow using the bulletin procedure. If the measured flow and checks match the bulletin, the cylinder-head secondary-air ports are cleaned with Audi tools and training. Do not buy a PCV assembly, catch can or intake-cleaning product from this card.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: ['Malfunction indicator lamp on'],
      affectedSystems: [
        'cylinder-head secondary-air ports',
        'secondary-air pump and hose routing',
        'engine control module J623',
      ],
      dtcCodes: ['P0491', 'P0492'],
      citations: [citations.secondaryAir],
      summary:
        'Replaced an unsupported intake-valve damage and walnut-blasting aggregation with exact Q7 secondary-air P0491/P0492 diagnosis; corrected scope to 2011-2016 and removed fixed intervals, costs, catastrophic engine claims plus two commerce claims and four URLs.',
    },
  },
  'audi-q7-supercharger-failure-2011': {
    disposition: 'remove',
    decision:
      'Archive the unsupported universal supercharger-bearing, bypass-valve, boost-leak, rebuild-cost and catch-can aggregation. The frozen record has no primary citation and combines several different diagnostic branches. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi Q7 technical specifications identify the 3.0 TFSI configuration but do not establish the seeded universal supercharger failure, repair interval, cost or parts recommendation',
        url: citations.q7Specification.url,
      },
    ],
    after: archived({
      years: [2011, 2012, 2013, 2014, 2015],
      category: 'other',
      title: 'Unsupported Q7 3.0T Supercharger-Failure Aggregation',
      description:
        'The former row combined bearing wear, bypass-valve failure, hose leaks, reduced power, rebuild pricing and catch-can advice without an Audi bulletin tying them into one 2011-2015 Q7 condition.',
      solution:
        'Do not select a supercharger, bypass valve, bearing kit or hose from this archived row. Diagnose noise, boost performance and stored faults against the exact engine code and current Audi repair information.',
      citation: citations.q7Specification,
      summary:
        'Archived an unsupported Q7 supercharger and boost-leak aggregation; removed fixed repair costs, catch-can advice and three commerce claims with five URLs.',
    }),
  },
  'audi-q7-tdi-emissions-scandal-2009': {
    disposition: 'recall-dealer',
    decision:
      'Retain the documented 3.0-liter diesel emissions history but correct Q7 scope to 2009-2015, remove the false 40-times statement, stale compensation amounts, generic post-fix failure claims and shopping links. Present the remedies as historical and direct owners to VIN-specific Audi/EPA information.',
    evidence: [
      {
        label:
          'The EPA 3.0-liter settlement identifies 2009-2012 Audi Q7 generation-1 vehicles and 2013-2015 Audi Q7 generation-2 vehicles, with different approved remedy paths',
        url: citations.tdiSettlement.url,
      },
    ],
    after: {
      years: [2009, 2010, 2011, 2012, 2013, 2014, 2015],
      trims: [],
      engines: ['3.0 TDI'],
      category: 'emissions',
      title:
        '2009-2015 Q7 3.0 TDI Emissions Settlement and Modification History',
      description:
        'The U.S. EPA identifies 2009-2015 Audi Q7 3.0-liter diesel vehicles among the Volkswagen emissions-settlement population. The settlement divided Q7 vehicles into 2009-2012 generation 1 and 2013-2015 generation 2 groups with different buyback, lease-termination and approved-emissions-modification paths. This card records that official history; it does not mean a remedy remains open for every vehicle today or establish that later EGR, DPF or DEF concerns were caused by a modification.',
      solution:
        'Check the VIN and service history with an authorized Audi dealer and use current EPA or Audi settlement information to determine whether an emissions modification was completed and what extended emissions warranty, if any, applies to that vehicle. Diagnose any present warning or drivability concern separately. Do not buy a scan tool or generic repair manual as a settlement remedy.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Vehicle identified in the 3.0-liter diesel settlement population',
        'Emissions modification or settlement history requires VIN confirmation',
      ],
      affectedSystems: ['3.0 TDI emissions-control system'],
      dtcCodes: [],
      citations: [citations.tdiSettlement],
      summary:
        'Corrected the Audi Q7 3.0 TDI settlement record to official 2009-2015 generation-specific scope and historical VIN-first guidance; removed 2016, exaggerated emissions, stale compensation, unsupported post-fix failure and cost claims plus two commerce links.',
    },
  },
  'audi-q7-tdi-oil-cooler-leak-2013': {
    disposition: 'recall-dealer',
    decision:
      'Replace the overbroad 2013-2015 oil-cooler narrative with exact 2013 Q7 3.0 TDI Safety Recall 47L8 / 14V516. Preserve the check-valve, vacuum-line and brake-booster safety path, require VIN eligibility and remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi recall 47L8 explicitly covers certain 2013 Q7 3.0 TDI vehicles, plastic-debris contamination of the check valve, possible oil entry into the brake booster and the free vacuum-line/inspection remedy',
        url: citations.brakeBoosterRecall.url,
      },
    ],
    after: {
      years: [2013],
      trims: [],
      engines: ['3.0 TDI'],
      category: 'brakes',
      title:
        '2013 Q7 TDI Brake-Booster Vacuum-Line Recall 47L8 (14V516)',
      description:
        'Certain 2013 Audi Q7 3.0 TDI vehicles are covered by Safety Recall 47L8 / NHTSA 14V516. Audi states that plastic debris can contaminate a check valve and allow engine oil into the brake booster. In isolated cases, oil can damage the booster diaphragm and reduce or eliminate power-brake assist, increasing stopping effort and crash risk. Model year and engine alone do not prove eligibility; the VIN must show the campaign.',
      solution:
        'Check the VIN for open recall 47L8 with Audi. The dealer remedy replaces the specified vacuum line and inspects the vacuum line and brake booster for oil contamination. Additional vacuum-line or brake-booster components are replaced when contamination is found. The recall repair is dealer work and is not a reason to buy an oil cooler, scan tool or manual.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Reduced power-brake assist on an affected vehicle',
        'Higher brake-pedal effort',
      ],
      affectedSystems: [
        'brake-booster vacuum line',
        'vacuum-line check valve',
        'brake booster',
      ],
      dtcCodes: [],
      citations: [citations.brakeBoosterRecall],
      summary:
        'Corrected an overbroad 2013-2015 oil-cooler record to exact 2013 Q7 TDI recall 47L8/14V516, VIN eligibility and dealer inspection; removed two unsupported years, owner repair and cost language plus three commerce claims and five URLs.',
    },
  },
  'audi-q7-timing-chain-tensioner-2007': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the catastrophic 2007-2015 multi-engine timing-failure and preventive-replacement aggregation with Audi TSB 2039995/2. The supported condition is a 1-3 second first-start rattle on 2011-2015 Q7 3.0 TFSI vehicles, and Audi explicitly states that it does not lead to damage. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2039995/2 explicitly lists 2011-2015 Q7 3.0 TFSI vehicles and says the 1-3 second first-start timing-chain rattle is caused by an upper tensioner and does not lead to damage',
        url: citations.timingRattle.url,
      },
    ],
    after: {
      years: [2011, 2012, 2013, 2014, 2015],
      trims: [],
      engines: ['3.0 TFSI'],
      category: 'engine',
      title:
        '2011-2015 Q7 3.0 TFSI Brief Cold-Start Timing-Chain Rattle - TSB 2039995/2',
      description:
        'Audi TSB 2039995/2 covers a timing-chain-drive rattle lasting about one to three seconds after the first engine start of the day on 2011-2015 Q7 3.0 TFSI vehicles. Audi attributes that exact noise to an upper chain tensioner and states that the noise does not lead to damage. This does not validate the former claims of universal catastrophic failure, bent valves, fixed 80,000-120,000-mile failure or preventive replacement for every 3.0T and 3.6L Q7.',
      solution:
        'Confirm that the concern is the bulletin-defined one-to-three-second first-start rattle and have an Audi technician follow TSB 2039995/2 and current repair information. A longer, persistent or different noise, warning light or drivability concern requires separate diagnosis. Do not order a timing kit from this card.',
      severity: 'low',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Timing-chain-drive rattle for about one to three seconds after the first start of the day',
      ],
      affectedSystems: ['upper timing-chain tensioner', 'timing-chain drive'],
      dtcCodes: [],
      citations: [citations.timingRattle],
      summary:
        'Replaced a catastrophic multi-engine timing-chain aggregation with Audi documented 2011-2015 3.0 TFSI brief cold-start rattle that does not cause damage; removed 2007-2010, 3.6L, fixed mileage and cost claims plus three commerce claims and five URLs.',
    },
  },
  'audi-q7-transfer-case-2007': {
    disposition: 'remove',
    decision:
      'Archive the unsupported 2007-2019 transfer-case seal, bearing, gear, 60,000-mile fluid-change and 75W-90 GL-5 aggregation. Audi scheduled maintenance supports leak inspection, not the seeded universal fluid specification or interval. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi scheduled maintenance calls for automatic transmission and final-drive leak inspection but does not establish the seeded universal Q7 transfer-case failure, 60,000-mile change interval or generic GL-5 fluid',
        url: citations.maintenance.url,
      },
    ],
    after: archived({
      years: [
        2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017,
        2018, 2019,
      ],
      category: 'transmission',
      title: 'Unsupported Q7 Transfer-Case Leak and Failure Aggregation',
      description:
        'The former row combined seal leakage, internal bearing and gear wear, vehicle-weight causation, a generic GL-5 fluid specification and a fixed service interval across two Q7 generations without an Audi source establishing one condition.',
      solution:
        'Do not select fluid, seals or an actuator from this archived row. Inspect any leak or driveline noise against the VIN, transmission and transfer-case code and use the current Audi fluid specification and repair procedure.',
      citation: citations.maintenance,
      summary:
        'Archived an unsupported two-generation Q7 transfer-case aggregation; removed 850 seeded reports, generic GL-5 guidance, a fixed 60,000-mile interval and three commerce claims with five URLs.',
    }),
  },
  'audi-q7-water-pump-failure-2007': {
    disposition: 'remove',
    decision:
      'Archive the unsupported 2007-2015 multi-engine water-pump, thermostat, plastic-impeller, fixed-mileage and preventive-replacement aggregation. Audi Service Action 19H1/F1 was VIN- and production-range-specific and cannot support the universal record. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi Service Action 19H1/F1 describes a limited production population and VIN-specific coolant-pump seal condition, not universal 2007-2015 Q7 pump and thermostat failure across 3.0T, 3.6L and TDI engines',
        url: citations.coolantAction.url,
      },
    ],
    after: archived({
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015],
      category: 'engine',
      title: 'Unsupported Multi-Engine Q7 Water-Pump and Thermostat Aggregation',
      description:
        'The former row combined three engine families, plastic-impeller and electronic-failure claims, thermostat-housing cracking, a fixed 60,000-80,000-mile interval, catastrophic overheating and universal preventive replacement without one Audi source supporting that scope.',
      solution:
        'Stop safely if the engine is overheating, then diagnose the exact leak or circulation concern against the VIN and engine code. Do not buy a pump, thermostat or housing from this archived aggregate card.',
      citation: citations.coolantAction,
      summary:
        'Archived an unsupported 2007-2015 multi-engine Q7 pump and thermostat aggregation; removed fixed mileage, costs, catastrophic and preventive-replacement claims plus three commerce claims and five URLs.',
    }),
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2020-2021 Q7 V6 Fuel-Delivery-Module Recall 20DR / NHTSA 22V516 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V516-2960.PDF',
    ],
  },
  {
    title:
      '2019 Q7 Front Shock-Absorber Fork Recall 40O4 / NHTSA 19V114 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2019/RCRIT-19V114-2837.pdf',
    ],
  },
  {
    title:
      '2020-2026 Q7 Rearview-Camera Software Recall 90TV / NHTSA 25V900 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf',
    ],
  },
  {
    title:
      '2017-2025 Q7 Air-Suspension C1260F0/U112100 Diagnosis - TSB 2059363/6',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2024/MC-11002225-0001.pdf',
    ],
  },
  {
    title:
      '2020-2024 Q7 V6 Coolant-Pump Leak Diagnosis - TSB 2070349/4',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2024/MC-11007223-0001.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi Q7',
  make: 'Audi',
  model: 'Q7',
  batchId: 'audi-q7-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'f7113d4e1f04fc0072c94f3477fae0f17c4bc82437b72a5ca9fd14b5406d8ce7',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-q7/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'q7_blind_review:no-blocker',
    edge: 'q7_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-q7-air-suspension-2007',
    'audi-q7-air-suspension-failure-2007',
    'audi-q7-carbon-buildup-3.0t-2011',
    'audi-q7-supercharger-failure-2011',
    'audi-q7-tdi-emissions-scandal-2009',
    'audi-q7-tdi-oil-cooler-leak-2013',
    'audi-q7-timing-chain-tensioner-2007',
    'audi-q7-transfer-case-2007',
    'audi-q7-water-pump-failure-2007',
  ],
  records,
  expectedPerRecord: {
    'audi-q7-air-suspension-2007': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=4L0698007C&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4L0698007C',
        'https://www.ebay.com/sch/i.html?_nkw=4L0698007C',
        'https://www.amazon.com/s?k=Arnott%20A-2870%20Audi%20Q7&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-air-suspension-failure-2007': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=7L8616039H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=7L8616039H',
        'https://www.ebay.com/sch/i.html?_nkw=7L8616039H',
        'https://www.amazon.com/s?k=Arnott%20Industries%20Remanufactured%20Air%20Strut%20(Q7)&tag=au7o-20',
        'https://www.amazon.com/s?k=Arnott%20Industries%20Air%20Compressor%20Assembly&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-carbon-buildup-3.0t-2011': {
      claimIds: ['fixParts:0', 'communityRecommendations:1'],
      urls: [
        'https://www.amazon.com/s?k=06E103547AC&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06E103547AC',
        'https://www.ebay.com/sch/i.html?_nkw=06E103547AC',
        'https://www.amazon.com/s?k=Mishimoto%20MMBCC-UNI-BK&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-supercharger-failure-2011': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=057128063G&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=057128063G',
        'https://www.ebay.com/sch/i.html?_nkw=057128063G',
        'https://www.amazon.com/s?k=JHM%20Motorsports%20Supercharger%20Seal%20%26%20Gasket%20Kit%20(Q7%203.0T)&tag=au7o-20',
        'https://www.amazon.com/s?k=Jon%20Bond%20Performance%20TVS1320%20Full%20Rebuild%20Kit&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-tdi-emissions-scandal-2009': {
      claimIds: [
        'communityRecommendations:4',
        'communityRecommendations:5',
      ],
      urls: [
        'https://www.amazon.com/s?k=BlueDriver%20OBD2%20scanner&tag=au7o-20',
        'https://www.amazon.com/s?k=Haynes%20repair%20manual&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-tdi-oil-cooler-leak-2013': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:3',
        'communityRecommendations:4',
      ],
      urls: [
        'https://www.amazon.com/s?k=059131492AA&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=059131492AA',
        'https://www.ebay.com/sch/i.html?_nkw=059131492AA',
        'https://www.amazon.com/s?k=BlueDriver%20OBD2%20scanner&tag=au7o-20',
        'https://www.amazon.com/s?k=Haynes%20repair%20manual&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-timing-chain-tensioner-2007': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=06E109507H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06E109507H',
        'https://www.ebay.com/sch/i.html?_nkw=06E109507H',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20059109229AAKT&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006E109218AP&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-transfer-case-2007': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:2',
        'communityRecommendations:3',
      ],
      urls: [
        'https://www.amazon.com/s?k=0BU321199A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=0BU321199A',
        'https://www.ebay.com/sch/i.html?_nkw=0BU321199A',
        'https://www.amazon.com/s?k=Audi%20Q7%20transfer%20case%20fluid&tag=au7o-20',
        'https://www.amazon.com/s?k=Dorman%20transfer%20case%20encoder%20motor%20Audi%20Q7&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q7-water-pump-failure-2007': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=022121011B&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=022121011B',
        'https://www.ebay.com/sch/i.html?_nkw=022121011B',
        'https://www.amazon.com/s?k=HEPU%2006E121018D&tag=au7o-20',
        'https://www.amazon.com/s?k=German%20Performance%20Solutions%20Billet%20Aluminum%20Thermostat%20Housing&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 24,
    urlCount: 40,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'diagnosis-hold': 2,
    'recall-dealer': 2,
  },
  expectedPublished: 4,
  expectedArchived: 5,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const secondaryAir = issues.find(
      (issue) => issue.id === 'audi-q7-carbon-buildup-3.0t-2011',
    ).after;
    const tdi = issues.find(
      (issue) => issue.id === 'audi-q7-tdi-emissions-scandal-2009',
    ).after;
    const booster = issues.find(
      (issue) => issue.id === 'audi-q7-tdi-oil-cooler-leak-2013',
    ).after;
    const timing = issues.find(
      (issue) => issue.id === 'audi-q7-timing-chain-tensioner-2007',
    ).after;
    const archivedCount = issues.filter(
      (issue) => issue.after.status === 'archived',
    ).length;
    if (
      JSON.stringify(secondaryAir.years) !==
        JSON.stringify([2011, 2012, 2013, 2014, 2015, 2016]) ||
      JSON.stringify(secondaryAir.dtcCodes) !==
        JSON.stringify(['P0491', 'P0492']) ||
      JSON.stringify(tdi.years) !==
        JSON.stringify([2009, 2010, 2011, 2012, 2013, 2014, 2015]) ||
      JSON.stringify(booster.years) !== JSON.stringify([2013]) ||
      booster.severity !== 'high' ||
      JSON.stringify(timing.years) !==
        JSON.stringify([2011, 2012, 2013, 2014, 2015]) ||
      timing.severity !== 'low' ||
      archivedCount !== 5
    ) {
      throw new Error(
        'Audi Q7 secondary-air, TDI, brake-booster, timing-rattle or archive after-state scope drifted.',
      );
    }
  },
};
