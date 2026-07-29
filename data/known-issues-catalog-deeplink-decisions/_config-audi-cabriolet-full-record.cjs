const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=Cabriolet&modelYear=${year}`;

const citations = {
  fuel1994: cite(
    'recall',
    'NHTSA 98V332 - 1994 Audi Cabriolet V6 Fuel-Injector Seals',
    recallUrl(1994),
  ),
  fuel1995: cite(
    'recall',
    'NHTSA 98V332 - 1995 Audi Cabriolet V6 Fuel-Injector Seals',
    recallUrl(1995),
  ),
  ignition1994: cite(
    'recall',
    'NHTSA 96V017 - 1994 Audi Cabriolet Ignition Switch',
    recallUrl(1994),
  ),
  ignition1995: cite(
    'recall',
    'NHTSA 96V017 - 1995 Audi Cabriolet Ignition Switch',
    recallUrl(1995),
  ),
  ignition1996: cite(
    'recall',
    'NHTSA 96V017 - 1996 Audi Cabriolet Ignition Switch',
    recallUrl(1996),
  ),
  inventory1994: cite(
    'nhtsa',
    'NHTSA 1994 Audi Cabriolet Recall Inventory',
    recallUrl(1994),
  ),
  modelYears: cite(
    'manual',
    'NHTSA Parts-Marking Reference - Audi Cabriolet 1994-1998',
    'https://www.nhtsa.gov/sites/nhtsa.gov/files/810946.pdf',
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
  'audi-cabriolet-coolant-1994': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported five-year coolant hose/flange deterioration and direct-parts aggregation with exact 1994-1995 V6 fuel-injector seal recall 98V332. The retained safety condition is fuel leakage and fire risk, not a universal coolant-system defect. Remove two claims and four URLs.',
    evidence: [
      {
        label:
          'NHTSA 98V332 returns for 1994-1995 Audi Cabriolet V6 vehicles and identifies internal fuel-injector seals that can leak in the engine compartment',
        url: citations.fuel1994.url,
      },
    ],
    after: {
      years: [1994, 1995],
      trims: [],
      engines: ['V6'],
      category: 'fuel',
      title:
        '1994-1995 Audi Cabriolet V6 Fuel-Injector Seal Recall 98V332',
      description:
        'NHTSA campaign 98V332 covers 1994-1995 Audi Cabriolet passenger vehicles equipped with V6 engines. An internal fuel-injector seal could malfunction and leak fuel in the engine compartment; fuel contacting an ignition source can cause a fire. This official campaign does not establish the former universal coolant-hose and flange deterioration narrative.',
      solution:
        'Check the VIN, engine and campaign-completion history with Audi or NHTSA. The historical remedy replaced all fuel injectors. Confirm current remedy availability and cost with Audi because of the vehicle age. If fuel odor or visible fuel appears in the engine compartment, shut the engine off, keep ignition sources away and arrange inspection without driving.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Fuel odor from the engine compartment',
        'Visible fuel leakage near a V6 injector',
      ],
      affectedSystems: ['V6 fuel injectors', 'fuel-injector internal seals'],
      dtcCodes: [],
      citations: [citations.fuel1994, citations.fuel1995],
      summary:
        'Replaced an unsupported five-year coolant-hose and flange aggregation with exact 1994-1995 V6 fuel-injector recall 98V332; removed coolant-part claims, fixed costs and two commerce claims with four URLs.',
    },
  },
  'audi-cabriolet-top-electrical-1994': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported five-year convertible-top switch, relay, interlock and direct-part aggregation with exact 1994-1996 ignition-switch recall 96V017. The official condition can disable safety-relevant accessories after starting. Remove two claims and four URLs.',
    evidence: [
      {
        label:
          'NHTSA 96V017 returns for 1994-1996 Audi Cabriolet vehicles and identifies an improperly manufactured ignition switch that can disable wipers, lamps, turn signals, windows and air conditioning',
        url: citations.ignition1994.url,
      },
    ],
    after: {
      years: [1994, 1995, 1996],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '1994-1996 Audi Cabriolet Ignition-Switch Recall 96V017',
      description:
        'NHTSA campaign 96V017 covers 1994-1996 Audi Cabriolet passenger vehicles. An improperly manufactured ignition switch could cause turn signals, windshield wipers, lamps, power windows and air conditioning to malfunction after the car is started. This campaign does not establish a convertible-top switch, relay or interlock defect or support the former top-control parts.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The historical remedy replaced the ignition switch. Confirm current remedy availability and cost with Audi because of the vehicle age. If wipers, lights or turn signals fail after starting, avoid driving in conditions that require them until the ignition circuit is inspected.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Turn signals, wipers, lamps, power windows or air conditioning fail after starting',
      ],
      affectedSystems: ['ignition switch', 'switched electrical accessories'],
      dtcCodes: [],
      citations: [
        citations.ignition1994,
        citations.ignition1995,
        citations.ignition1996,
      ],
      summary:
        'Replaced an unsupported convertible-top electrical-control aggregation with exact 1994-1996 ignition-switch recall 96V017; removed 1997-1998, top-control parts and two commerce claims with four URLs.',
    },
  },
  'audi-cabriolet-top-hydraulic-1994': {
    disposition: 'remove',
    decision:
      'Archive the unsupported five-year convertible-top pump, cylinder, hose, leak, fixed-cost and direct-parts aggregation. The row has no primary citation, and the official campaign inventory does not establish this top-system recall. Remove two claims and four URLs.',
    evidence: [
      {
        label:
          'The official 1994 Audi Cabriolet NHTSA recall response identifies bounded ignition and fuel campaigns, not the frozen universal convertible-top hydraulic failure',
        url: citations.inventory1994.url,
      },
    ],
    after: archived({
      years: [1994, 1995, 1996, 1997, 1998],
      category: 'electrical',
      title: 'Unsupported Audi Cabriolet Top-Hydraulic System Aggregation',
      description:
        'The former row combined a pump, cylinders, hoses, low fluid, leaks, manual operation, fixed costs and one direct part mapping without Audi primary evidence or component-specific diagnosis.',
      solution:
        'Do not order a pump, cylinder or hose from this archived row. Diagnose top operation through electrical supply, interlocks, switches, hydraulic pressure and the actual leak location before repair.',
      citation: citations.inventory1994,
      summary:
        'Archived an unsupported five-year top-hydraulic aggregation; removed universal failure, fixed cost and direct-replacement claims plus two commerce claims with four URLs.',
    }),
  },
  'audi-cabriolet-top-hydraulic-failure-1994': {
    disposition: 'remove',
    decision:
      'Archive this duplicate unsupported convertible-top hydraulic record. It overlaps the other top row while adding body-filler and trim-tool shopping unrelated to a verified repair. Remove three claims and five URLs.',
    evidence: [
      {
        label:
          'NHTSA documents the Audi Cabriolet as a 1994-1998 model line but does not establish the frozen duplicate top-hydraulic defect or its parts mapping',
        url: citations.modelYears.url,
      },
    ],
    after: archived({
      years: [1994, 1995, 1996, 1997, 1998],
      category: 'body',
      title: 'Duplicate Unsupported Audi Cabriolet Top-Hydraulic Aggregation',
      description:
        'The former row duplicated the top-hydraulic card and combined pump, cylinder, line and microswitch causes with body-filler and trim-tool recommendations without an Audi diagnostic source.',
      solution:
        'Diagnose the actual electrical or hydraulic branch before selecting parts. Do not buy a pump, trim tool or body filler from this archived duplicate.',
      citation: citations.modelYears,
      summary:
        'Archived a duplicate unsupported top-hydraulic aggregation; removed broad cause, fixed cost and unrelated body-repair advice plus three commerce claims with five URLs.',
    }),
  },
};

module.exports = {
  label: 'Audi Cabriolet',
  make: 'Audi',
  model: 'Cabriolet',
  batchId: 'audi-cabriolet-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '9dab0a6c764dbd92e4d48fcbd1070f9718b167790febe08c6043481cc0a4138c',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-cabriolet/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cabriolet_blind_review:no-blocker',
    edge: 'cabriolet_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-cabriolet-coolant-1994',
    'audi-cabriolet-top-electrical-1994',
    'audi-cabriolet-top-hydraulic-1994',
    'audi-cabriolet-top-hydraulic-failure-1994',
  ],
  records,
  expectedPerRecord: {
    'audi-cabriolet-coolant-1994': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=078121113F&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=078121113F',
        'https://www.ebay.com/sch/i.html?_nkw=078121113F',
        'https://www.amazon.com/s?k=URO%20Parts%20078121133H%20Audi%20Cabriolet%20coolant%20flange&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-cabriolet-top-electrical-1994': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=8G0959255&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8G0959255',
        'https://www.ebay.com/sch/i.html?_nkw=8G0959255',
        'https://www.amazon.com/s?k=Genuine%20Audi%208G0871295%20Cabriolet%20top%20switch&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-cabriolet-top-hydraulic-1994': {
      claimIds: ['fixParts:0', 'communityRecommendations:0'],
      urls: [
        'https://www.amazon.com/s?k=8G0871791C&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8G0871791C',
        'https://www.ebay.com/sch/i.html?_nkw=8G0871791C',
        'https://www.amazon.com/s?k=URO%20Parts%208G0871791A%20Audi%20Cabriolet%20hydraulic&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-cabriolet-top-hydraulic-failure-1994': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=8G0871604&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8G0871604',
        'https://www.ebay.com/sch/i.html?_nkw=8G0871604',
        'https://www.amazon.com/s?k=trim%20removal%20tool%20set%20automotive&tag=au7o-20',
        'https://www.amazon.com/s?k=Bondo%20body%20filler%20kit&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 9,
    urlCount: 17,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 2,
    remove: 2,
  },
  expectedPublished: 2,
  expectedArchived: 2,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const fuel = issues.find(
      (issue) => issue.id === 'audi-cabriolet-coolant-1994',
    ).after;
    const ignition = issues.find(
      (issue) => issue.id === 'audi-cabriolet-top-electrical-1994',
    ).after;
    if (
      JSON.stringify(fuel.years) !== JSON.stringify([1994, 1995]) ||
      JSON.stringify(fuel.engines) !== JSON.stringify(['V6']) ||
      JSON.stringify(ignition.years) !==
        JSON.stringify([1994, 1995, 1996]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 2
    ) {
      throw new Error(
        'Audi Cabriolet recall scopes or archived split drifted after review.',
      );
    }
  },
};
