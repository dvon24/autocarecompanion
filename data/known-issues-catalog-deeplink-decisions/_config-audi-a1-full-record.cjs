const cite = (type, title, url) => ({ type, title, url });
const ccpcRecall = cite(
  'recall',
  'CCPC / Audi Ireland - 2016 Audi A1 Airbag and Belt-Tensioner Igniter Recall',
  'https://assets.ccpc.ie/data/docs/default-source/product-recall-archive/audi-recalls-certain-a1-a4-a5-a6-a7-a8-q5-and-q7-cars.pdf?sfvrsn=82f3ad30_1',
);

const archived = ({ years, category, title, description, solution, summary }) => ({
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
  citations: [ccpcRecall],
  summary,
});

const remove = ({ years, category, title, formerClaim, diagnosis }) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. The frozen row relies on secondary articles or forums and does not contain Audi, regulator, recall or model-specific technical evidence that establishes its combined year, engine, symptom, DTC, prevalence, repair and prevention claims. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'The official Audi Ireland/CCPC A1 source establishes a bounded 2016 restraint-system campaign, not this frozen cross-year mechanical aggregation',
      url: ccpcRecall.url,
    },
  ],
  after: archived({
    years,
    category,
    title: `Unsupported Audi A1 ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} across a broad Audi A1 range without a model-specific primary diagnostic or campaign source.`,
    solution:
      `Do not select a replacement part or maintenance interval from this archived card. ${diagnosis}`,
    summary:
      `Archived an unsupported Audi A1 ${title.toLowerCase()} aggregation and removed all broad failure, DTC, interval, cost, prevention and commerce claims.`,
  }),
});

const recordSpecs = {
  'audi-a1-1-2-1-4-tfsi-timing-chain-stretch-tensioner-failure': remove({
    years: [2010, 2011, 2012, 2013, 2014],
    category: 'engine',
    title: 'EA111 Timing-Chain',
    formerClaim:
      'five-year 1.2/1.4 TFSI tensioner, guide, chain-stretch, three-DTC, catastrophic-engine and fixed oil-interval narrative',
    diagnosis:
      'Identify the exact engine code and reproduce the noise or cam/crank correlation fault before measuring timing or authorizing internal-engine work.',
  }),
  'audi-a1-1-4-tfsi-turbocharger-failure': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016],
    category: 'engine',
    title: '1.4 TFSI Turbocharger',
    formerClaim:
      'seven-year turbo bearing, oil-consumption, smoke, shutdown-idle and direct turbo-replacement narrative',
    diagnosis:
      'Verify the engine and turbo codes, oil supply, crankcase ventilation, charge-air leaks and commanded versus actual boost before condemning a turbocharger.',
  }),
  'audi-a1-1-6-2-0-tdi-diesel-dpf-clogging-egr-valve-faults': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
    category: 'emissions',
    title: 'TDI DPF/EGR',
    formerClaim:
      'nine-year multi-engine DPF, EGR, fuel-dilution, forced-regeneration and direct EGR-part narrative',
    diagnosis:
      'Read measured soot and ash load, regeneration history, exhaust temperatures, differential pressure and EGR commanded/actual values before choosing a repair.',
  }),
  'audi-a1-7-speed-s-tronic-dual-clutch-mechatronic-failure': remove({
    years: [2011, 2012, 2013, 2014, 2015, 2016],
    category: 'transmission',
    title: 'DQ200 Mechatronic',
    formerClaim:
      'six-year DQ200 accumulator-wall, clutch-pack, sudden no-drive, recall, service-interval and direct mechatronic-unit narrative',
    diagnosis:
      'Confirm the installed transmission code, stored faults, hydraulic pressure and clutch adaptations before deciding whether software, wiring, clutch or mechatronic work applies.',
  }),
  'audi-a1-ea211-water-pump-thermostat-housing-coolant-leak': remove({
    years: [2015, 2016, 2017, 2018],
    category: 'cooling',
    title: 'EA211 Coolant-Pump/Thermostat',
    formerClaim:
      'four-year multi-engine plastic-housing, PCV, dual-thermostat and automatic complete-module replacement narrative',
    diagnosis:
      'Pressure-test the cooling system and locate fresh leakage before replacing a pump, thermostat, seal or connecting component.',
  }),
  'audi-a1-electrical-faults-sticking-windows-light-housings-sunroof-mo': {
    disposition: 'recall-dealer',
    decision:
      'Replace the nine-year windows, lamps, rattles and sunroof-motor aggregation with the exact 2016 Audi A1 restraint-system campaign published by Audi Ireland and the CCPC. The supported condition is an out-of-tolerance airbag or belt-tensioner igniter, not a general electrical fault. The frozen row contains no commerce.',
    evidence: [
      {
        label:
          'Audi Ireland and the CCPC identify certain A1 vehicles manufactured from 18 July through 14 October 2016 whose airbag or belt-tensioner igniters may not work correctly in a crash',
        url: ccpcRecall.url,
      },
    ],
    after: {
      years: [2016],
      trims: [],
      engines: [],
      category: 'safety',
      title: '2016 Audi A1 Airbag and Belt-Tensioner Igniter Recall',
      description:
        'Audi Ireland and Ireland’s Competition and Consumer Protection Commission identify certain Audi A1 vehicles manufactured between 18 July and 14 October 2016. A supplier production-process change left some airbag and seat-belt-tensioner igniters outside prescribed tolerances, so an airbag or belt tensioner may not work correctly in a collision. This source does not establish the former windows, lamps, rattles or sunroof-motor aggregation.',
      solution:
        'Ask an authorized Audi dealer to check the VIN and campaign-completion history. Audi Ireland’s notice says affected owners are contacted and the necessary refit is free of charge. Do not infer campaign eligibility from model year alone; only the VIN and production record establish whether this specific restraint-system work applies.',
      severity: 'high',
      confidence: 'high',
      source: 'recall-related',
      symptoms: [],
      affectedSystems: [
        'airbag igniters',
        'seat-belt pretensioner igniters',
      ],
      dtcCodes: [],
      citations: [ccpcRecall],
      summary:
        'Replaced an unsupported nine-year electrical/trim aggregation with the exact 2016 Audi Ireland/CCPC airbag and belt-tensioner igniter campaign; retained no commerce.',
    },
  },
  'audi-a1-excessive-oil-consumption-1-2-1-4-tfsi-engines': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015],
    category: 'engine',
    title: 'EA111 Oil-Consumption',
    formerClaim:
      'six-year piston-ring, fixed consumption-rate, bore-scoring and updated piston-set narrative',
    diagnosis:
      'Document leakage, crankcase ventilation, oil specification and a controlled consumption measurement before internal-engine repair.',
  }),
  'audi-a1-tfsi-direct-injection-carbon-build-up-intake-valves': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
    category: 'engine',
    title: 'TFSI Intake-Deposit',
    formerClaim:
      'nine-year multi-engine carbon, four-DTC, fixed-mileage walnut-blasting and catch-can prevention narrative',
    diagnosis:
      'Diagnose misfires by cylinder and operating condition, then inspect the intake tract and valves before authorizing cleaning.',
  }),
};

const expectedIds = [
  'audi-a1-1-2-1-4-tfsi-timing-chain-stretch-tensioner-failure',
  'audi-a1-1-4-tfsi-turbocharger-failure',
  'audi-a1-1-6-2-0-tdi-diesel-dpf-clogging-egr-valve-faults',
  'audi-a1-7-speed-s-tronic-dual-clutch-mechatronic-failure',
  'audi-a1-ea211-water-pump-thermostat-housing-coolant-leak',
  'audi-a1-electrical-faults-sticking-windows-light-housings-sunroof-mo',
  'audi-a1-excessive-oil-consumption-1-2-1-4-tfsi-engines',
  'audi-a1-tfsi-direct-injection-carbon-build-up-intake-valves',
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
  label: 'Audi A1',
  make: 'Audi',
  model: 'A1',
  batchId: 'audi-a1-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'a712840c95528cb9817016708485b2be674f55888983a6f7d21532ae1c289d4a',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-a1/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'a1_blind_review:no-blocker',
    edge: 'a1_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-a1-1-2-1-4-tfsi-timing-chain-stretch-tensioner-failure': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=03C198229C&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=03C198229C',
        'https://www.ebay.com/sch/i.html?_nkw=03C198229C',
      ],
    ),
    'audi-a1-1-4-tfsi-turbocharger-failure': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=03C145702L&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=03C145702L',
        'https://www.ebay.com/sch/i.html?_nkw=03C145702L',
      ],
    ),
    'audi-a1-1-6-2-0-tdi-diesel-dpf-clogging-egr-valve-faults': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=03L131512DP&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=03L131512DP',
        'https://www.ebay.com/sch/i.html?_nkw=03L131512DP',
      ],
    ),
    'audi-a1-7-speed-s-tronic-dual-clutch-mechatronic-failure': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=0AM927769E&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=0AM927769E',
        'https://www.ebay.com/sch/i.html?_nkw=0AM927769E',
      ],
    ),
    'audi-a1-ea211-water-pump-thermostat-housing-coolant-leak': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=04E121600AL&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=04E121600AL',
        'https://www.ebay.com/sch/i.html?_nkw=04E121600AL',
      ],
    ),
    'audi-a1-electrical-faults-sticking-windows-light-housings-sunroof-mo':
      expected([], []),
    'audi-a1-excessive-oil-consumption-1-2-1-4-tfsi-engines': expected([], []),
    'audi-a1-tfsi-direct-injection-carbon-build-up-intake-valves': expected(
      [],
      [],
    ),
  },
  expectedTelemetry: {
    claimCount: 5,
    urlCount: 15,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 7,
    'recall-dealer': 1,
  },
  expectedPublished: 1,
  expectedArchived: 7,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const recall = issues.find(
      (issue) =>
        issue.id ===
        'audi-a1-electrical-faults-sticking-windows-light-housings-sunroof-mo',
    ).after;
    if (
      JSON.stringify(recall.years) !== JSON.stringify([2016]) ||
      recall.title !==
        '2016 Audi A1 Airbag and Belt-Tensioner Igniter Recall' ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 7
    ) {
      throw new Error(
        'Audi A1 restraint recall scope or archived split drifted after review.',
      );
    }
  },
};
