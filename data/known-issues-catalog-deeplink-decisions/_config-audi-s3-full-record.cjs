const cite = (type, title, url) => ({ type, title, url });
const citations = {
  waterPump: cite(
    'tsb',
    'Audi TSB 2071515/1 - 2020 and 2022-2024 A3/S3 2.0 TFSI Coolant-Pump Leak',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242918-0001.pdf',
  ),
  inventory2020: cite(
    'nhtsa',
    'NHTSA 2020 Audi S3 Recall Inventory',
    'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=S3&modelYear=2020',
  ),
};

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
  citations: [citations.inventory2020],
  summary,
});

const remove = ({ years, category, title, formerClaim, diagnosis }) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. The frozen row has no exact Audi primary diagnostic source for its combined years, hardware, symptoms, DTCs, prevalence, costs, replacement and prevention claims. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'The official NHTSA S3 inventory establishes bounded VIN-first safety campaigns, not this frozen universal mechanical replacement narrative',
      url: citations.inventory2020.url,
    },
  ],
  after: archived({
    years,
    category,
    title: `Unsupported Audi S3 ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact S3 Audi campaign or technical bulletin that supports the complete public claim.`,
    solution:
      `Do not order parts or apply an interval from this archived card. ${diagnosis}`,
    summary:
      `Archived an unsupported Audi S3 ${title.toLowerCase()} aggregation and removed broad failure, DTC, mileage, cost, prevention and commerce claims.`,
  }),
});

const recordSpecs = {
  'audi-s3-ea888-carbon-2015': remove({
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    category: 'engine',
    title: 'EA888 Intake-Deposit',
    formerClaim:
      'ten-year two-DTC, fixed 40,000-mile onset, walnut-blasting interval and clicked catch-can prevention narrative',
    diagnosis:
      'Diagnose the exact misfire by cylinder and operating condition and inspect the intake tract and valves before authorizing cleaning.',
  }),
  'audi-s3-carbon-buildup-2015': remove({
    years: [2015, 2016, 2017, 2018, 2019],
    category: 'engine',
    title: 'Duplicate Intake-Deposit',
    formerClaim:
      'duplicate five-year carbon, five-DTC, fixed mileage, walnut-blasting, catch-can, oil-interval and driving-habit narrative',
    diagnosis:
      'Use one evidence-backed diagnosis for a reproduced symptom rather than this overlapping preventive-maintenance card.',
  }),
  'audi-s3-dq250-mechatronic-2015': remove({
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    category: 'transmission',
    title: 'DQ250 Mechatronic',
    formerClaim:
      'ten-year six-DTC, seven-speed misidentification, complete mechatronic replacement and fixed 40,000-mile fluid-service narrative',
    diagnosis:
      'Identify the installed transmission and manufacturing data, reproduce the complaint, and follow the exact fault test plan before software, wiring, clutch, hydraulic or control-unit work.',
  }),
  'audi-s3-dsg-mechatronic-2015': remove({
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    category: 'transmission',
    title: 'DQ381 Mechatronic',
    formerClaim:
      'overlapping ten-year DQ381, six-DTC, clutch-position-sensor, limp-mode, complete-unit, fluid and fixed-cost narrative',
    diagnosis:
      'Confirm transmission family, exact stored DTC and symptom status before deciding whether an Audi bulletin, software, wiring, clutch or control-unit path applies.',
  }),
  'audi-s3-hpfp-2015': remove({
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    category: 'fuel',
    title: 'High-Pressure Fuel-Pump',
    formerClaim:
      'ten-year three-DTC, early-revision, cam-follower and direct replacement-pump narrative with no citation',
    diagnosis:
      'Compare specified and actual low- and high-side fuel pressure under the reproduced complaint and inspect wiring, supply and leakage before condemning a pump.',
  }),
  'audi-s3-turbo-wastegate-rattle-2015': remove({
    years: [2015, 2016, 2017, 2018, 2019, 2020],
    category: 'engine',
    title: 'Turbo/Wastegate',
    formerClaim:
      'six-year IS20 misidentification, prevalence, old unrelated clip bulletin, integrated-actuator, upgrade-turbo, fixed-cost and direct parts narrative',
    diagnosis:
      'Verify the fitted turbocharger and actuator, reproduce noise or boost deviation, and compare commanded/actual boost before authorizing any repair.',
  }),
  'audi-s3-water-pump-thermostat-2015': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the ten-year chronic thermostat-housing, class-action, fixed-mileage and automatic assembly-replacement narrative with exact Audi TSB 2071515/1. The bulletin covers S3 model years 2020 and 2022-2024 with confirmed 2.0 TFSI coolant-pump leakage and requires a clean/dry/recheck gate.',
    evidence: [
      {
        label:
          'Audi TSB 2071515/1 lists S3 model years 2020 and 2022-2024, requires precise leak localization, and says not to replace parts when no fresh leak returns',
        url: citations.waterPump.url,
      },
    ],
    after: {
      years: [2020, 2022, 2023, 2024],
      trims: [],
      engines: ['2.0L TFSI'],
      category: 'cooling',
      title: '2020/2022-2024 Audi S3 2.0 TFSI Coolant-Pump Leak Diagnosis',
      description:
        'Audi TSB 2071515/1 covers 2020 and 2022-2024 S3 vehicles with a 2.0 TFSI engine when the owner reports coolant loss, a leak or a coolant warning and the workshop can assign fresh leakage to the coolant pump. Audi cautions that an apparent loss can instead follow insufficient bleeding during production or a previous repair.',
      solution:
        'Document the suspected leak, clean and dry all traces, fill the cooling system to the correct level and reassess after driving a few miles. If no fresh leak appears, continue observing without replacing parts. If leakage recurs, replace only the component causing the damage under the exact VIN, engine and part criteria. Outside applicable warranty, Audi states the bulletin is informational.',
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
        'Narrowed a ten-year thermostat/class-action aggregation to Audi TSB 2071515/1 for confirmed 2020 and 2022-2024 2.0 TFSI coolant-pump leakage; added the no-leak no-replacement gate and removed two commerce claims with four URLs.',
    },
  },
};

const expectedIds = [
  'audi-s3-ea888-carbon-2015',
  'audi-s3-carbon-buildup-2015',
  'audi-s3-dq250-mechatronic-2015',
  'audi-s3-dsg-mechatronic-2015',
  'audi-s3-hpfp-2015',
  'audi-s3-turbo-wastegate-rattle-2015',
  'audi-s3-water-pump-thermostat-2015',
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
  label: 'Audi S3',
  make: 'Audi',
  model: 'S3',
  batchId: 'audi-s3-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'b5d3ea46f53c7349a633a8dbf7307e789172273ab46157aeb8979b13b641e039',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-s3/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 's3_blind_review:no-blocker',
    edge: 's3_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-s3-ea888-carbon-2015': expected(
      ['communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=Integrated%20Engineering%20catch%20can%20Audi%20S3&tag=au7o-20',
      ],
      { claimClicks: 1, recordClicks: 1, priorityClicks: 1 },
    ),
    'audi-s3-carbon-buildup-2015': expected(
      ['communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=034%20Motorsport%20Catch%20Can%20Kit%20(MQB%20Platform)&tag=au7o-20',
      ],
    ),
    'audi-s3-dq250-mechatronic-2015': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=02E325025AS&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=02E325025AS',
        'https://www.ebay.com/sch/i.html?_nkw=02E325025AS',
        'https://www.amazon.com/s?k=Genuine%20Audi%200BH325031A%20DSG&tag=au7o-20',
      ],
    ),
    'audi-s3-dsg-mechatronic-2015': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=0GC325025E&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=0GC325025E',
        'https://www.ebay.com/sch/i.html?_nkw=0GC325025E',
        'https://www.amazon.com/s?k=Pentosin%20G052182A2&tag=au7o-20',
      ],
    ),
    'audi-s3-hpfp-2015': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=06L127027C&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06L127027C',
        'https://www.ebay.com/sch/i.html?_nkw=06L127027C',
        'https://www.amazon.com/s?k=Hitachi%20HPP0004%20HPFP%20Audi&tag=au7o-20',
      ],
    ),
    'audi-s3-turbo-wastegate-rattle-2015': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=06K145725T&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06K145725T',
        'https://www.ebay.com/sch/i.html?_nkw=06K145725T',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006J145220A&tag=au7o-20',
        'https://www.amazon.com/s?k=IHI%20IS38%20Turbocharger%20(Golf%20R)&tag=au7o-20',
      ],
    ),
    'audi-s3-water-pump-thermostat-2015': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=06L121111H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06L121111H',
        'https://www.ebay.com/sch/i.html?_nkw=06L121111H',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006L121111P&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 13,
    urlCount: 23,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    remove: 6,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 6,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const waterPump = issues.find(
      (issue) => issue.id === 'audi-s3-water-pump-thermostat-2015',
    ).after;
    if (
      JSON.stringify(waterPump.years) !==
        JSON.stringify([2020, 2022, 2023, 2024]) ||
      waterPump.title !==
        '2020/2022-2024 Audi S3 2.0 TFSI Coolant-Pump Leak Diagnosis' ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 6
    ) {
      throw new Error(
        'Audi S3 coolant-pump scope or archived split drifted after review.',
      );
    }
  },
};
