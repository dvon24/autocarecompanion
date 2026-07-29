const cite = (type, title, url) => ({ type, title, url });
const campaignUrl = (number) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${number}`;

const citations = {
  rearCamera: cite(
    'recall',
    'NHTSA 22V742 / Audi 91DZ - 2021 Q5 Sportback Rearview Camera',
    campaignUrl('22V742000'),
  ),
  connectingRod: cite(
    'recall',
    'NHTSA 22V753 / Audi 13i5 - 2021-2023 Q5 Sportback Connecting-Rod Bearings',
    campaignUrl('22V753000'),
  ),
  waterPump: cite(
    'tsb',
    'Audi TSB 2071515/1 - 2021-2024 Q5 Sportback 2.0 TFSI Coolant-Pump Leak',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242918-0001.pdf',
  ),
  gateway: cite(
    'recall',
    'NHTSA 21V947 / Audi 90S9 - 2021-2022 Q5 Sportback Gateway Module',
    campaignUrl('21V947000'),
  ),
  headCover: cite(
    'recall',
    'NHTSA 25V294 / Audi 15ZK - 2022-2024 Q5 Sportback Cylinder-Head-Cover Screws',
    campaignUrl('25V294000'),
  ),
  phevBattery: cite(
    'recall',
    'NHTSA 25V080 / Audi 93AA - Q5 PHEV Battery Recall Report',
    'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V080-8166.PDF',
  ),
  inventory: cite(
    'nhtsa',
    'NHTSA 2021 Audi Q5 Recall Inventory Including Q5 Sportback Campaigns',
    'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=Q5&modelYear=2021',
  ),
};

const archived = ({
  years,
  category,
  title,
  formerClaim,
  diagnosis,
  citation = citations.inventory,
}) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete Q5 Sportback model-year, engine, symptom, repair and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official Audi/regulator material establishes narrower VIN-, campaign- or symptom-gated paths and does not establish this universal Q5 Sportback aggregation',
      url: citation.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi Q5 Sportback ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact Audi or regulator primary source for the complete public claim.`,
    solution:
      `Do not order parts or apply a universal repair from this archived card. ${diagnosis}`,
    severity: 'low',
    confidence: 'low',
    source: 'manual',
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    citations: [citation],
    summary:
      `Archived an unsupported Audi Q5 Sportback ${title.toLowerCase()} aggregation and removed broad failure, repair, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-q5-sportback-virtual-cockpit-2021': {
    disposition: 'recall-dealer',
    decision:
      'Replace the broad 2021-2026 virtual-cockpit hardware card with exact 2021 Q5 Sportback rearview-camera software recall 22V742 / Audi 91DZ. Remove the clicked scan-tool link and replacement-cluster searches.',
    evidence: [
      {
        label:
          'NHTSA 22V742 explicitly covers 2021 Q5 Sportback vehicles whose display can show a blank screen instead of the rearview-camera image',
        url: citations.rearCamera.url,
      },
    ],
    after: {
      years: [2021],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2021 Audi Q5 Sportback Rearview-Camera Recall 91DZ / NHTSA 22V742',
      description:
        'NHTSA campaign 22V742 / Audi 91DZ covers certain 2021 Q5 Sportback vehicles. A software issue can display a blank or black screen instead of the rearview-camera image when Reverse is selected, reducing rear visibility. This campaign does not establish that the virtual-cockpit instrument cluster requires replacement. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free remedy updates the infotainment-unit software. Until repaired, use mirrors and direct observation with extra care while reversing. Do not order a replacement instrument cluster or generic scan tool from this summary.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Blank or black display instead of the rearview-camera image',
      ],
      affectedSystems: ['infotainment software', 'rearview-camera display'],
      dtcCodes: [],
      citations: [citations.rearCamera],
      summary:
        'Replaced a broad virtual-cockpit card with exact 2021 recall 22V742 / 91DZ and removed the only clicked claim plus three replacement-cluster searches.',
    },
  },
  'audi-q5-sportback-connecting-rod-bearing-failure': {
    disposition: 'recall-dealer',
    decision:
      'Retain and tighten the frozen 2021-2023 connecting-rod-bearing card to exact NHTSA 22V753 / Audi 13i5, with VIN-first inspection and engine replacement only when required.',
    evidence: [
      {
        label:
          'NHTSA 22V753 explicitly covers 2021-2023 Q5 Sportback vehicles whose connecting-rod bearings may be damaged and cause engine failure, stall or oil-leak fire risk',
        url: citations.connectingRod.url,
      },
    ],
    after: {
      years: [2021, 2022, 2023],
      trims: [],
      engines: [],
      category: 'engine',
      title:
        '2021-2023 Audi Q5 Sportback Engine Recall 13i5 / NHTSA 22V753',
      description:
        'NHTSA campaign 22V753 / Audi 13i5 covers certain 2021-2023 Q5 Sportback vehicles. Damaged connecting-rod bearings can lead to engine failure and a stall; an associated oil leak can also increase fire risk. Eligibility is VIN-specific and the campaign does not mean every engine in those years is defective.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. Dealers inspect eligible vehicles and replace an affected engine when necessary at no charge. If the engine develops severe knocking, warning messages, smoke, oil leakage or a stall, stop safely and arrange dealer recovery rather than continuing to drive.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Severe engine noise or knocking',
        'Engine warning or oil leak',
        'Engine stall',
      ],
      affectedSystems: ['connecting-rod bearings', 'engine assembly'],
      dtcCodes: [],
      citations: [citations.connectingRod],
      summary:
        'Confirmed exact 2021-2023 Q5 Sportback recall 22V753 / 13i5 and retained only its VIN-gated inspection and engine-replacement remedy.',
    },
  },
  'audi-q5-sportback-ea888-water-pump-thermostat-housing-coolant-leak':
    {
      disposition: 'diagnosis-hold',
      decision:
        'Narrow the 2021-2025 EA888 pump/housing and direct-part card to exact Audi TSB 2071515/1 for 2021-2024 Q5 Sportback 2.0 TFSI coolant-pump leakage. Preserve the clean/dry/refill/recheck gate.',
      evidence: [
        {
          label:
            'Audi TSB 2071515/1 explicitly lists 2021-2024 Q5 Sportback 2.0L vehicles and requires reassessment before replacing only the component causing a confirmed leak',
          url: citations.waterPump.url,
        },
      ],
      after: {
        years: [2021, 2022, 2023, 2024],
        trims: [],
        engines: ['2.0 TFSI'],
        category: 'cooling',
        title:
          '2021-2024 Audi Q5 Sportback Coolant-Pump Leak TSB 2071515/1',
        description:
          'Audi TSB 2071515/1 covers 2021-2024 Q5 Sportback vehicles with a 2.0L TFSI engine when coolant loss, a visible leak or the coolant warning lamp can be assigned to the coolant pump. Audi warns that an apparent level drop can instead follow incomplete bleeding during production or prior repair, so the leak must be located precisely.',
        solution:
          'Document the suspected leak, clean and dry all coolant traces, fill the system correctly and reassess after driving a few miles. If no fresh leak returns, continue observing without replacing parts. If leakage recurs, replace only the component causing it under the exact VIN, engine and part criteria. Confirm current coverage with Audi; do not order by model year alone.',
        severity: 'medium',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Coolant loss or visible coolant leak',
          'Coolant warning lamp illuminated',
        ],
        affectedSystems: ['2.0 TFSI coolant pump', 'engine cooling system'],
        dtcCodes: [],
        citations: [citations.waterPump],
        summary:
          'Narrowed the coolant card to exact 2021-2024 TSB 2071515/1 diagnosis and removed its direct-part search links.',
      },
    },
  'audi-q5-sportback-excessive-engine-oil-consumption': archived({
    years: [2021, 2022, 2023, 2024, 2025],
    category: 'engine',
    title: 'Oil-Consumption',
    formerClaim:
      'five-year universal EA888 oil-consumption and PCV replacement narrative with a direct part-number prescription',
    diagnosis:
      'Document consumption using Audi’s specified procedure, inspect for external leaks and crankcase-ventilation faults, and identify the engine code before repair.',
  }),
  'audi-q5-sportback-front-assist-phantom-braking-false-emergency-braking':
    archived({
      years: [2021, 2022, 2023, 2024, 2025],
      category: 'safety',
      title: 'Front-Assist Phantom-Braking',
      formerClaim:
        'five-year universal false-emergency-braking defect, prevalence and repair narrative without an exact Audi campaign or bulletin',
      diagnosis:
        'Record the conditions and warnings, inspect sensor visibility and alignment, scan the driver-assistance modules and check VIN-specific Audi software guidance.',
    }),
  'audi-q5-sportback-loose-cylinder-head-cover-screws-causing-oil-leak-fire-risk':
    {
      disposition: 'recall-dealer',
      decision:
        'Retain and tighten the frozen 2022-2024 head-cover-screw card to exact current NHTSA 25V294 / Audi 15ZK.',
      evidence: [
        {
          label:
            'NHTSA 25V294 explicitly covers 2022-2024 Q5 Sportback Quattro vehicles whose cylinder-head-cover screws may be improperly tightened and allow an oil leak',
          url: citations.headCover.url,
        },
      ],
      after: {
        years: [2022, 2023, 2024],
        trims: [],
        engines: [],
        category: 'engine',
        title:
          '2022-2024 Audi Q5 Sportback Head-Cover Recall 15ZK / NHTSA 25V294',
        description:
          'NHTSA campaign 25V294 / Audi 15ZK covers certain 2022-2024 Q5 Sportback Quattro vehicles. Cylinder-head-cover screws may have been tightened incorrectly, allowing them to loosen and oil to leak, which increases fire risk. Eligibility is VIN-specific.',
        solution:
          'Check the VIN and campaign-completion history with Audi or NHTSA. Dealers inspect and replace the screws as necessary at no charge. If oil odor, smoke or visible leakage occurs, stop safely, switch the vehicle off and arrange Audi inspection.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: ['Oil odor, smoke or visible engine-oil leakage'],
        affectedSystems: [
          'cylinder-head cover',
          'cylinder-head-cover screws',
        ],
        dtcCodes: [],
        citations: [citations.headCover],
        summary:
          'Confirmed exact 2022-2024 Q5 Sportback recall 25V294 / 15ZK and retained only its VIN-gated inspection and free screw replacement.',
      },
    },
  'audi-q5-sportback-mild-hybrid-electrical-fault-start-stop-failure': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported five-year mild-hybrid battery and start/stop card with exact 2021-2022 Q5 Sportback gateway-module recall 21V947 / Audi 90S9. Remove the direct battery searches.',
    evidence: [
      {
        label:
          'NHTSA 21V947 explicitly covers 2021-2022 Q5 Sportback vehicles where rear-seat liquid or underbody seam water can shut down the gateway module and suddenly reduce engine power',
        url: citations.gateway.url,
      },
    ],
    after: {
      years: [2021, 2022],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2021-2022 Audi Q5 Sportback Gateway Recall 90S9 / NHTSA 21V947',
      description:
        'NHTSA campaign 21V947 / Audi 90S9 covers certain 2021-2022 Q5 Sportback vehicles. A rear-seat liquid spill or water entry through an insufficient underbody seam can reach the gateway-control module and cause it to shut down, suddenly reducing engine power. This is not a universal mild-hybrid battery or start/stop failure. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free remedy installs a protective gateway-module cover and seals the underbody seam when necessary. If multiple warnings appear or engine power drops, move out of traffic safely and arrange dealer inspection; do not order a 12-volt battery from this card.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Multiple control-system warnings',
        'Sudden reduction in engine power',
      ],
      affectedSystems: [
        'gateway-control module',
        'underbody seam',
        'vehicle communication network',
      ],
      dtcCodes: [],
      citations: [citations.gateway],
      summary:
        'Replaced a broad mild-hybrid card with exact 2021-2022 recall 21V947 / 90S9 and removed the direct battery search links.',
    },
  },
  'audi-q5-sportback-phev-high-voltage-battery-overheating-fire-risk':
    archived({
      years: [2021, 2022, 2023, 2024],
      category: 'electrical',
      title: 'PHEV Battery Recall',
      formerClaim:
        'Q5 Sportback-specific high-voltage battery recall attribution: the current 25V080 Part 573 report identifies the affected U.S. model as Q5 PHEV and does not establish a Q5 Sportback population',
      diagnosis:
        'Check the VIN directly with Audi or NHTSA rather than inferring campaign eligibility from the Q5 family name or this archived card.',
      citation: citations.phevBattery,
    }),
  'audi-q5-sportback-rear-brake-squeal-2021': archived({
    years: [2021, 2022, 2023, 2024, 2025, 2026],
    category: 'brakes',
    title: 'Rear-Brake Squeal/Wear',
    formerClaim:
      'six-year universal rear-pad wear and squeal diagnosis with direct OEM and aftermarket pad recommendations',
    diagnosis:
      'Measure pad and rotor thickness, inspect hardware and caliper operation and identify the exact brake option before authorizing parts.',
  }),
  'audi-q5-sportback-sunroof-rattle-2021': archived({
    years: [2021, 2022, 2023, 2024, 2025],
    category: 'body',
    title: 'Panoramic-Sunroof Rattle',
    formerClaim:
      'five-year wind-noise/rattle and weatherstrip-adhesive repair narrative without an exact Audi bulletin',
    diagnosis:
      'Reproduce the noise or leak, inspect panel adjustment, seals, drains, cassette and body openings, and use the exact Audi body procedure.',
  }),
};

const expectedIds = [
  'audi-q5-sportback-virtual-cockpit-2021',
  'audi-q5-sportback-connecting-rod-bearing-failure',
  'audi-q5-sportback-ea888-water-pump-thermostat-housing-coolant-leak',
  'audi-q5-sportback-excessive-engine-oil-consumption',
  'audi-q5-sportback-front-assist-phantom-braking-false-emergency-braking',
  'audi-q5-sportback-loose-cylinder-head-cover-screws-causing-oil-leak-fire-risk',
  'audi-q5-sportback-mild-hybrid-electrical-fault-start-stop-failure',
  'audi-q5-sportback-phev-high-voltage-battery-overheating-fire-risk',
  'audi-q5-sportback-rear-brake-squeal-2021',
  'audi-q5-sportback-sunroof-rattle-2021',
];
const records = Object.fromEntries(
  expectedIds.map((id) => [id, recordSpecs[id]]),
);
const expected = (
  claimIds,
  urls,
  { claimClicks = 0, recordClicks = 0, priorityClicks = 0 } = {},
) => ({ claimIds, urls, claimClicks, recordClicks, priorityClicks });

module.exports = {
  label: 'Audi Q5 Sportback',
  make: 'Audi',
  model: 'Q5 Sportback',
  batchId: 'audi-q5-sportback-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '1a20b20947a60e05b83a5f568eb79b0bfc17ba653c96daa070bd8cbd0b3dbbf0',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-q5-sportback/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'q5_sportback_blind_review:no-blocker',
    edge: 'q5_sportback_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-q5-sportback-virtual-cockpit-2021': expected(
      ['fixParts:0', 'communityRecommendations:3'],
      [
        'https://www.amazon.com/s?k=80A920790J&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=80A920790J',
        'https://www.ebay.com/sch/i.html?_nkw=80A920790J',
        'https://www.amazon.com/s?k=BlueDriver%20Bluetooth%20Pro%20OBD2%20Scan%20Tool%20Audi%20Q5%20Sportback&tag=au7o-20',
      ],
      { claimClicks: 1, recordClicks: 1, priorityClicks: 1 },
    ),
    'audi-q5-sportback-connecting-rod-bearing-failure': expected([], []),
    'audi-q5-sportback-ea888-water-pump-thermostat-housing-coolant-leak':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=06L121012L&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=06L121012L',
          'https://www.ebay.com/sch/i.html?_nkw=06L121012L',
        ],
      ),
    'audi-q5-sportback-excessive-engine-oil-consumption': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=06Q103495F&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06Q103495F',
        'https://www.ebay.com/sch/i.html?_nkw=06Q103495F',
      ],
    ),
    'audi-q5-sportback-front-assist-phantom-braking-false-emergency-braking':
      expected([], []),
    'audi-q5-sportback-loose-cylinder-head-cover-screws-causing-oil-leak-fire-risk':
      expected([], []),
    'audi-q5-sportback-mild-hybrid-electrical-fault-start-stop-failure':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=8W0915101A&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=8W0915101A',
          'https://www.ebay.com/sch/i.html?_nkw=8W0915101A',
        ],
      ),
    'audi-q5-sportback-phev-high-voltage-battery-overheating-fire-risk':
      expected([], []),
    'audi-q5-sportback-rear-brake-squeal-2021': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=80A698451K&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=80A698451K',
        'https://www.ebay.com/sch/i.html?_nkw=80A698451K',
        'https://www.amazon.com/s?k=Akebono+EUR1547&tag=au7o-20',
      ],
    ),
    'audi-q5-sportback-sunroof-rattle-2021': expected(
      ['communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=Dorman%20weatherstrip%20seal&tag=au7o-20',
        'https://www.amazon.com/s?k=3M%20super%20weatherstrip%20adhesive&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 9,
    urlCount: 19,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    'recall-dealer': 4,
    'diagnosis-hold': 1,
    remove: 5,
  },
  expectedPublished: 5,
  expectedArchived: 5,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(
        byId.get('audi-q5-sportback-virtual-cockpit-2021').years,
      ) !== JSON.stringify([2021]) ||
      JSON.stringify(
        byId.get(
          'audi-q5-sportback-ea888-water-pump-thermostat-housing-coolant-leak',
        ).years,
      ) !== JSON.stringify([2021, 2022, 2023, 2024]) ||
      JSON.stringify(
        byId.get(
          'audi-q5-sportback-loose-cylinder-head-cover-screws-causing-oil-leak-fire-risk',
        ).years,
      ) !== JSON.stringify([2022, 2023, 2024]) ||
      JSON.stringify(
        byId.get(
          'audi-q5-sportback-mild-hybrid-electrical-fault-start-stop-failure',
        ).years,
      ) !== JSON.stringify([2021, 2022]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 5
    ) {
      throw new Error(
        'Audi Q5 Sportback campaign/TSB scopes or published/archived split drifted after review.',
      );
    }
  },
};
