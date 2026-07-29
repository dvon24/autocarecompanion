const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=A7&modelYear=${year}`;

const citations = {
  gateway: cite(
    'recall',
    'NHTSA 22V861 / Audi 90V2 - 2019-2022 A7 Gateway-Control Module',
    recallUrl(2019),
  ),
  starterAlternator: cite(
    'tsb',
    'Audi Service Action 27BQ - 2019-2020 A7 Starter-Alternator',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-10254007-0001.pdf',
  ),
  phevBattery: cite(
    'recall',
    'NHTSA 25V080 / Audi 93AA - 2022 A7 E High-Voltage Battery',
    'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=25V080000',
  ),
  timingRattle: cite(
    'tsb',
    'Audi TSB 2039995/2 - 2012-2015 A7 3.0 TFSI Upper Timing-Chain Tensioners',
    'https://static.nhtsa.gov/odi/tsbs/2016/SB-10093541-0699.pdf',
  ),
  inventory2012: cite(
    'nhtsa',
    'NHTSA 2012 Audi A7 Recall Inventory',
    recallUrl(2012),
  ),
};

const archived = ({ years, category, title, formerClaim, diagnosis }) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete A7 model-year, engine, DTC, prevalence, repair and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official Audi and regulator sources establish narrower VIN-, engine- or symptom-gated A7 paths, not this universal parts narrative',
      url: citations.inventory2012.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi A7 ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact Audi or regulator primary source for the complete public claim.`,
    solution:
      `Do not order parts or apply a fixed service interval from this archived card. ${diagnosis}`,
    severity: 'low',
    confidence: 'low',
    source: 'manual',
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    citations: [citations.inventory2012],
    summary:
      `Archived an unsupported Audi A7 ${title.toLowerCase()} aggregation and removed broad failure, repair, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-a7-carbon-buildup-2012': archived({
    years: [
      2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
      2023,
    ],
    category: 'engine',
    title: 'Carbon-Buildup',
    formerClaim:
      '12-year universal intake-carbon buildup, fixed cleaning interval and catch-can recommendation',
    diagnosis:
      'Identify the engine code, reproduce the symptom, review misfire data and inspect the intake path before cleaning or modification.',
  }),
  'audi-a7-gateway-module-recall-2019': {
    disposition: 'recall-dealer',
    decision:
      'Retain and tighten the frozen 2019-2022 gateway-module card to exact NHTSA 22V861 / Audi 90V2. Keep the risk, protective-cover remedy and VIN gate explicit.',
    evidence: [
      {
        label:
          'NHTSA 22V861 states that liquid spilled on the rear seat can reach the gateway module, interrupt communications and suddenly reduce engine power',
        url: citations.gateway.url,
      },
    ],
    after: {
      years: [2019, 2020, 2021, 2022],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '2019-2022 Audi A7 Gateway Recall 90V2 / NHTSA 22V861',
      description:
        'NHTSA campaign 22V861 / Audi 90V2 covers certain 2019-2022 A7 vehicles. Liquid spilled on the rear seat can reach the gateway-control module, interrupt communication among control units and trigger an emergency operating mode that suddenly reduces engine power. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free recall remedy installs a protective cover over the gateway-control module and replaces a module already showing liquid intrusion when required. If warning messages appear or engine power drops, move out of traffic safely and arrange dealer inspection.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Multiple warning messages appear together',
        'Engine power is suddenly reduced',
        'Control-module communication faults after liquid reaches the rear seat',
      ],
      affectedSystems: [
        'gateway-control module',
        'vehicle communication network',
      ],
      dtcCodes: [],
      citations: [citations.gateway],
      summary:
        'Confirmed the frozen 2019-2022 scope as exact gateway recall 22V861 / 90V2 and retained only the VIN-first free dealer remedy.',
    },
  },
  'audi-a7-mmi-48v-2019': {
    disposition: 'no-commerce',
    decision:
      'Replace the broad 2019-2025 MMI/48-volt/12-volt aggregation with exact Audi service action 27BQ for 2019-2020 A7 starter-alternators. Remove four battery, charger and scan-tool shopping links.',
    evidence: [
      {
        label:
          'Audi service action 27BQ identifies certain 2019-2020 A7 starter-alternators that can fail, inhibit start/stop and increase emissions, with VIN eligibility in Elsa',
        url: citations.starterAlternator.url,
      },
    ],
    after: {
      years: [2019, 2020],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '2019-2020 Audi A7 Starter-Alternator Service Action 27BQ',
      description:
        'Audi service action 27BQ covers certain 2019-2020 A7 vehicles in the United States and Canada. A defective starter-alternator may prevent the start/stop system from working and can increase emissions. This is a VIN-specific service action; it does not establish the former broad MMI, 12-volt battery or 2019-2025 electrical-failure narrative.',
      solution:
        'Ask an authorized Audi dealer to check the VIN in Elsa for an open 27BQ action. Eligible vehicles receive a replacement starter-alternator at no charge under the action. Diagnose any current no-start, warning-light or infotainment concern separately; do not buy a battery, maintainer or scan tool from this summary.',
      severity: 'medium',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Start/stop system does not operate',
        'Starter-alternator fault identified by Audi',
      ],
      affectedSystems: ['starter-alternator', 'start/stop system'],
      dtcCodes: [],
      citations: [citations.starterAlternator],
      summary:
        'Replaced a broad electrical aggregation with exact 2019-2020 Audi service action 27BQ and removed four unrelated commerce claims.',
    },
  },
  'audi-a7-phev-battery-overheating-2022': {
    disposition: 'recall-dealer',
    decision:
      'Update the frozen 2022 A7 E PHEV battery card to current NHTSA 25V080 / Audi 93AA, which expands and replaces 24V898. Remove unrelated 12-volt battery, charger and EVSE links.',
    evidence: [
      {
        label:
          'NHTSA 25V080 identifies 2022 A7 E PHEV high-voltage batteries that may overheat and specifies diagnostic software, monitoring, possible no-charge instructions and battery replacement',
        url: citations.phevBattery.url,
      },
    ],
    after: {
      years: [2022],
      trims: [],
      engines: ['plug-in hybrid'],
      category: 'electrical',
      title:
        '2022 Audi A7 E Battery Recall 93AA / NHTSA 25V080',
      description:
        'NHTSA campaign 25V080 / Audi 93AA covers certain 2022 A7 E plug-in hybrid vehicles whose high-voltage battery may overheat, increasing fire risk. This current campaign expands and replaces NHTSA 24V898. Audi uses diagnostic software and available online vehicle data to identify batteries requiring further action. Eligibility and instructions are VIN-specific.',
      solution:
        'Check the VIN and current campaign instructions with Audi or NHTSA immediately. Dealers install advanced diagnostic software free of charge, monitor available vehicle data and replace affected battery modules or batteries as directed. Follow any Audi instruction not to charge the vehicle until the remedy is complete; vehicles without online data are advised by the campaign not to charge until the final remedy is available. Do not substitute a 12-volt battery, charger or portable EVSE.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [],
      affectedSystems: ['high-voltage traction battery'],
      dtcCodes: [],
      citations: [citations.phevBattery],
      summary:
        'Updated the A7 E PHEV card to current 25V080 / 93AA, noted that it replaces 24V898 and removed four unrelated commerce links.',
    },
  },
  'audi-a7-supercharger-clutch-2012': archived({
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
    category: 'engine',
    title: 'Supercharger-Clutch',
    formerClaim:
      'seven-year supercharger-clutch narrative whose frozen title incorrectly identified an S7, plus direct rebuild, belt and seal-kit recommendations',
    diagnosis:
      'Identify the exact engine and installed forced-induction hardware and complete symptom-specific Audi testing before authorizing repair.',
  }),
  'audi-a7-supercharger-nose-cone-2012': archived({
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
    category: 'engine',
    title: 'Supercharger Nose-Cone',
    formerClaim:
      'seven-year supercharger nose-cone failure and direct aftermarket component recommendation',
    diagnosis:
      'Confirm the engine, localize the noise or leak and inspect the complete drive and supercharger system before replacing components.',
  }),
  'audi-a7-thermostat-housing-leak-2012': archived({
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
    category: 'cooling',
    title: 'Thermostat-Housing Leak',
    formerClaim:
      'seven-year universal thermostat-housing leak and direct part-number replacement prescription',
    diagnosis:
      'Pressure-test the cooling system, locate the leak and match the exact engine and VIN before selecting a component.',
  }),
  'audi-a7-timing-chain-tensioner-2012': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad 2012-2018 chain-failure, DTC and direct-parts narrative with exact Audi TSB 2039995/2 for a 1-3 second first-start rattle on 2012-2015 A7 3.0 TFSI engines. Preserve Audi’s symptom confirmation and no-damage statement.',
    evidence: [
      {
        label:
          'Audi TSB 2039995/2 covers 2012-2015 A7 3.0 TFSI vehicles, identifies a 1-3 second first-start rattle from upper tensioners and states the condition does not damage the engine',
        url: citations.timingRattle.url,
      },
    ],
    after: {
      years: [2012, 2013, 2014, 2015],
      trims: [],
      engines: ['3.0 TFSI'],
      category: 'engine',
      title: '2012-2015 Audi A7 Cold-Start Rattle TSB 2039995/2',
      description:
        'Audi TSB 2039995/2 applies to 2012-2015 A7 vehicles with the 3.0 TFSI engine when a rattle lasts about one to three seconds on the first start of the day. Audi attributes the supported sound to one or both upper timing-chain tensioners and states that this brief condition does not damage the engine. The bulletin does not support the former universal chain-jump, DTC or 2012-2018 failure narrative.',
      solution:
        'Have a technician reproduce and compare the exact first-start sound using Audi’s bulletin. If it matches, follow the VIN- and engine-specific repair procedure for both upper timing-chain tensioners. Diagnose a longer rattle, warning light, running fault or different noise separately; do not order a complete chain kit from this summary.',
      severity: 'low',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'One-to-three-second rattle on the first start of the day',
      ],
      affectedSystems: ['upper timing-chain tensioners'],
      dtcCodes: [],
      citations: [citations.timingRattle],
      summary:
        'Narrowed the timing card to exact 2012-2015 3.0 TFSI first-start rattle TSB 2039995/2 and removed three commerce claims with five URLs.',
    },
  },
};

const expectedIds = [
  'audi-a7-carbon-buildup-2012',
  'audi-a7-gateway-module-recall-2019',
  'audi-a7-mmi-48v-2019',
  'audi-a7-phev-battery-overheating-2022',
  'audi-a7-supercharger-clutch-2012',
  'audi-a7-supercharger-nose-cone-2012',
  'audi-a7-thermostat-housing-leak-2012',
  'audi-a7-timing-chain-tensioner-2012',
];
const records = Object.fromEntries(
  expectedIds.map((id) => [id, recordSpecs[id]]),
);
const expected = (claimIds, urls) => ({
  claimIds,
  urls,
  claimClicks: 0,
  recordClicks: 0,
  priorityClicks: 0,
});

module.exports = {
  label: 'Audi A7',
  make: 'Audi',
  model: 'A7',
  batchId: 'audi-a7-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'b4f236ae51884ae256d924a9bbcff1f0cf4dc209e40e605b997540e03d0b00bb',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-a7/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'a7_blind_review:no-blocker',
    edge: 'a7_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-a7-carbon-buildup-2012': expected(
      ['communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=Mishimoto%20MMBCC-UNI-BK&tag=au7o-20',
      ],
    ),
    'audi-a7-gateway-module-recall-2019': expected([], []),
    'audi-a7-mmi-48v-2019': expected(
      [
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
      ],
      [
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20A7&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20A7&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20A7&tag=au7o-20',
        'https://www.amazon.com/s?k=BlueDriver%20Bluetooth%20Pro%20OBD2%20Scan%20Tool%20Audi%20A7&tag=au7o-20',
      ],
    ),
    'audi-a7-phev-battery-overheating-2022': expected(
      [
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
        'communityRecommendations:6',
      ],
      [
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20A7&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20A7&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20A7&tag=au7o-20',
        'https://www.amazon.com/s?k=Lectron%20Portable%20Level%202%20EV%20Charger%20Audi%20A7&tag=au7o-20',
      ],
    ),
    'audi-a7-supercharger-clutch-2012': expected(
      [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:4',
      ],
      [
        'https://www.amazon.com/s?k=06E145601BC&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06E145601BC',
        'https://www.ebay.com/sch/i.html?_nkw=06E145601BC',
        'https://www.amazon.com/s?k=JHM%20Motorsports%20Supercharger%20Seal%20%26%20Gasket%20Kit&tag=au7o-20',
        'https://www.amazon.com/s?k=Jon%20Bond%20Performance%20TVS1320%20Full%20Rebuild%20Kit&tag=au7o-20',
        'https://www.amazon.com/s?k=Bando%207PK1320&tag=au7o-20',
      ],
    ),
    'audi-a7-supercharger-nose-cone-2012': expected(
      ['communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=034%20Motorsport%20034-145-Z001&tag=au7o-20',
      ],
    ),
    'audi-a7-thermostat-housing-leak-2012': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=06E121111AL&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06E121111AL',
        'https://www.ebay.com/sch/i.html?_nkw=06E121111AL',
        'https://www.amazon.com/s?k=Audi%2006E121111AL%20thermostat&tag=au7o-20',
      ],
    ),
    'audi-a7-timing-chain-tensioner-2012': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=06E109217AM&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06E109217AM',
        'https://www.ebay.com/sch/i.html?_nkw=06E109217AM',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006E109218AP&tag=au7o-20',
        'https://www.amazon.com/s?k=ECS%20Tuning%2006E109218ACKT&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 19,
    urlCount: 25,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 4,
    'recall-dealer': 2,
    'no-commerce': 1,
    'diagnosis-hold': 1,
  },
  expectedPublished: 4,
  expectedArchived: 4,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(byId.get('audi-a7-gateway-module-recall-2019').years) !==
        JSON.stringify([2019, 2020, 2021, 2022]) ||
      JSON.stringify(byId.get('audi-a7-mmi-48v-2019').years) !==
        JSON.stringify([2019, 2020]) ||
      JSON.stringify(
        byId.get('audi-a7-phev-battery-overheating-2022').years,
      ) !== JSON.stringify([2022]) ||
      JSON.stringify(
        byId.get('audi-a7-timing-chain-tensioner-2012').years,
      ) !== JSON.stringify([2012, 2013, 2014, 2015]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 4
    ) {
      throw new Error(
        'Audi A7 campaign/TSB scopes or published/archived split drifted after review.',
      );
    }
  },
};
