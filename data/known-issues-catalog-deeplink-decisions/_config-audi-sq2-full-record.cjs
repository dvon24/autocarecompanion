const cite = (type, title, url) => ({ type, title, url });

const citations = {
  fuseCarrier: cite(
    'recall',
    'Japan MLIT GAI-3692 - Audi Q2/SQ2 Interior Fuse-Carrier Power Connector',
    'https://www.mlit.go.jp/en/jidosha/content/001709563.pdf',
  ),
  inventory2019: cite(
    'recall',
    'UK DVSA Audi SQ2 2019 Recall Inventory',
    'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/AUDI/model/SQ2/year/2019/recalls',
  ),
  inventory2023: cite(
    'recall',
    'UK DVSA Audi SQ2 2023 Recall Inventory',
    'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/AUDI/model/SQ2/year/2023/recalls',
  ),
};

const archived = ({
  years,
  category,
  title,
  formerClaim,
  diagnosis,
  citation = citations.inventory2019,
}) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete SQ2 model-year, hardware, symptom, DTC, prevalence, replacement, interval and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official regulator recall material establishes only narrower VIN- and campaign-gated SQ2 conditions, not this universal failure narrative',
      url: citation.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi SQ2 ${title} Aggregation`,
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
    citations: [citation],
    summary:
      `Archived an unsupported Audi SQ2 ${title.toLowerCase()} aggregation and removed broad failure, DTC, cost, interval, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-sq2-ea888-2-0-tfsi-coolant-leak-from-water-pump-thermostat-housi':
    archived({
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      category: 'cooling',
      title: 'EA888 Water-Pump/Thermostat',
      formerClaim:
        'six-year EA888 plastic water-pump/thermostat cracking, warning, overheating, complete-module replacement and preventive-upgrade narrative',
      diagnosis:
        'Pressure-test the cooling system, clean and dry the suspected area, identify the exact leaking component and confirm engine/build data before authorizing replacement.',
    }),
  'audi-sq2-electro-mechanical-parking-brake-brake-pedal-weld-recalls':
    archived({
      years: [2019, 2020],
      category: 'brakes',
      title: 'Parking-Brake/Brake-Pedal Recall',
      formerClaim:
        'two-year SQ2 card that conflated the Q2 45H4 parking-brake software campaign with the Q3 46i7 brake-pedal weld campaign',
      diagnosis:
        'Check the exact SQ2 VIN against Audi and the applicable national recall register; do not infer eligibility from campaigns issued for Q2 or Q3 vehicles.',
    }),
  'audi-sq2-internal-fuse-box-wiring-harness-can-work-loose-causing-sudd':
    {
      disposition: 'recall-dealer',
      decision:
        'Retain the fuse-carrier card but replace unsupported 2020-2023 UK-wide language with Japan MLIT campaign GAI-3692 for affected 2022-2023 SQ2 vehicles. Keep market and VIN scope explicit.',
      evidence: [
        {
          label:
            'Japan MLIT GAI-3692 identifies affected SQ2 vehicles whose interior fuse-carrier supply connector can loosen and interrupt engine, display or lighting power',
          url: citations.fuseCarrier.url,
        },
      ],
      after: {
        years: [2022, 2023],
        trims: [],
        engines: ['2.0 TFSI'],
        category: 'electrical',
        title: '2022-2023 Audi SQ2 Interior Fuse-Carrier Recall GAI-3692',
        description:
          'Japan MLIT campaign GAI-3692 covers specified 2022-2023 Audi SQ2 vehicles. An incorrectly installed power-supply connector at the interior fuse carrier can work loose, interrupting electrical power to the engine, instrument display or lighting. Steering and braking remain available, but an engine shutdown or loss of lighting can increase crash risk. This published scope is market- and VIN-specific.',
        solution:
          'Check the VIN and open-campaign status with an authorised Audi dealer in the vehicle’s market. The campaign remedy is dealer inspection and correction of the fuse-carrier power connection. Do not replace a fuse box or wiring harness solely from a warning lamp or this model-year summary.',
        severity: 'high',
        confidence: 'high',
        source: 'manual',
        symptoms: [
          'Engine may switch off while driving',
          'Instrument display may lose power',
          'Exterior lighting may stop operating',
        ],
        affectedSystems: [
          'interior fuse carrier',
          'power-supply connector',
          'engine and lighting electrical supply',
        ],
        dtcCodes: [],
        citations: [citations.fuseCarrier],
        summary:
          'Corrected the row to Japan MLIT GAI-3692 for VIN-specific 2022-2023 SQ2 fuse-carrier connections and removed unsupported 2020-2021 and UK population claims.',
      },
    },
  'audi-sq2-mmi-infotainment-freezing-rebooting-lost-settings': archived({
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    category: 'electrical',
    title: 'MMI Freezing/Rebooting',
    formerClaim:
      'six-year MMI freezing, rebooting, lost-settings, reset, software-update and hardware-replacement aggregation',
    diagnosis:
      'Record the exact symptom and software version, scan the infotainment network and follow the VIN-specific Audi diagnostic plan before resetting or replacing a module.',
  }),
  'audi-sq2-pcv-crankcase-ventilation-valve-diaphragm-failure-causing-ro':
    archived({
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      title: 'PCV/Crankcase-Ventilation',
      formerClaim:
        'six-year PCV diaphragm failure, rough idle, whistle, oil-consumption, four-DTC and direct replacement narrative',
      diagnosis:
        'Measure crankcase pressure, inspect for intake leaks and follow the exact stored-fault test plan before replacing the separator or valve cover.',
      citation: citations.inventory2023,
    }),
  'audi-sq2-s-tronic-7-speed-wet-clutch-transmission-jerky-low-speed-shi':
    archived({
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      category: 'transmission',
      title: 'S tronic Low-Speed Shift',
      formerClaim:
        'six-year wet-clutch S tronic jerking, delayed-engagement, adaptation, software, fixed-fluid-interval and mechatronic-replacement narrative',
      diagnosis:
        'Reproduce the concern, identify the transmission code and software level, scan the controller and follow its exact fault-guided test plan before selecting adaptation, software, fluid, clutch or mechatronic work.',
      citation: citations.inventory2023,
    }),
};

const expectedIds = [
  'audi-sq2-ea888-2-0-tfsi-coolant-leak-from-water-pump-thermostat-housi',
  'audi-sq2-electro-mechanical-parking-brake-brake-pedal-weld-recalls',
  'audi-sq2-internal-fuse-box-wiring-harness-can-work-loose-causing-sudd',
  'audi-sq2-mmi-infotainment-freezing-rebooting-lost-settings',
  'audi-sq2-pcv-crankcase-ventilation-valve-diaphragm-failure-causing-ro',
  'audi-sq2-s-tronic-7-speed-wet-clutch-transmission-jerky-low-speed-shi',
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
  label: 'Audi SQ2',
  make: 'Audi',
  model: 'SQ2',
  batchId: 'audi-sq2-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '546bb178ddf8ec9edbbf71cbd01bec69fd73e19f9291d6155d49e564081a0b4d',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-sq2/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'sq2_blind_review:no-blocker',
    edge: 'sq2_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-sq2-ea888-2-0-tfsi-coolant-leak-from-water-pump-thermostat-housi':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=06L121011B&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=06L121011B',
          'https://www.ebay.com/sch/i.html?_nkw=06L121011B',
        ],
      ),
    'audi-sq2-electro-mechanical-parking-brake-brake-pedal-weld-recalls':
      expected([], []),
    'audi-sq2-internal-fuse-box-wiring-harness-can-work-loose-causing-sudd':
      expected([], []),
    'audi-sq2-mmi-infotainment-freezing-rebooting-lost-settings': expected(
      [],
      [],
    ),
    'audi-sq2-pcv-crankcase-ventilation-valve-diaphragm-failure-causing-ro':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=06K103495BM&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=06K103495BM',
          'https://www.ebay.com/sch/i.html?_nkw=06K103495BM',
        ],
      ),
    'audi-sq2-s-tronic-7-speed-wet-clutch-transmission-jerky-low-speed-shi':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=0GC%20325%20183%20A&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=0GC%20325%20183%20A',
          'https://www.ebay.com/sch/i.html?_nkw=0GC%20325%20183%20A',
        ],
      ),
  },
  expectedTelemetry: {
    claimCount: 3,
    urlCount: 9,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'recall-dealer': 1,
  },
  expectedPublished: 1,
  expectedArchived: 5,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(
        byId.get(
          'audi-sq2-internal-fuse-box-wiring-harness-can-work-loose-causing-sudd',
        ).years,
      ) !== JSON.stringify([2022, 2023]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 5
    ) {
      throw new Error(
        'Audi SQ2 campaign scope or published/archived split drifted after review.',
      );
    }
  },
};
