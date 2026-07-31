const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function archived({
  oldTitle,
  idSuffix,
  years,
  category,
  claims,
  urls,
  reason,
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [
      {
        type: 'nhtsa',
        label: 'NHTSA Manufacturer Communications Data Corpus',
        url: communicationsCorpus,
      },
    ],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported BMW M240i ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW M240i population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact generation, model year, production date, engine, symptoms, DTCs, modifications and current BMW service information before diagnosis.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        {
          type: 'nhtsa',
          title: 'NHTSA Manufacturer Communications Data Corpus',
          url: communicationsCorpus,
        },
      ],
      summary: `Archived the unsupported BMW M240i "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW M240i',
  make: 'BMW',
  model: 'M240i',
  batchId: 'bmw-m240i-full-record-cohort-16-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '08ff113fe42e4ac17a7396bb308727a7c9fc99c365f215841baba5961e7410cc',
  sourceSnapshotFileHash:
    'a57ff98884da6277a787f5925f040e0b762b76dae1d8a20b86a1fefddcf2b9c1',
  packetFileHash:
    'd5e3dbd24b053d0d6e190e6dfdaa7832990a505fff77d9398343cefa5a0187e7',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-m240i/08ff113fe42e/all-0001.json',
  reviewTokens: {
    blind: 'bmwm240i_blind:self-no-blocker',
    edge: 'bmwm240i_edge:self-no-blocker',
  },
  expectedIds: [
    'bmw-m240i-b58-charge-pipe-2017',
    'bmw-m240i-b58-coolant-loss-2017',
    'bmw-m240i-b58-valve-cover-gasket-2017',
    'bmw-m240i-b58-vanos-solenoid-2017',
  ],
  records: {
    'bmw-m240i-b58-charge-pipe-2017': archived({
      oldTitle: 'Plastic Charge Pipe Failure Under Boost',
      idSuffix: 'Charge-Pipe Aggregation',
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'It converts tuning-community reports and heat-cycle theory into a stock-vehicle defect across both F2x and G42 generations, assigns generic boost DTCs, and promotes aftermarket aluminum piping without a BMW bulletin, production boundary or verified repair role.',
    }),
    'bmw-m240i-b58-coolant-loss-2017': {
      disposition: 'diagnosis-hold',
      decision:
        'Replace the frozen expansion-tank/water-pump aggregation with BMW Service Action SIB 17 01 21 for the cylinder-head coolant vent line. Remove both commerce claims and all four outbound URL occurrences.',
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 17 01 21 - Replace the Coolant Vent Line on Cylinder Head',
          url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10212788-9999.pdf',
        },
      ],
      after: {
        years: [2017, 2018, 2019, 2020],
        trims: [],
        engines: ['B58 3.0L turbo I6'],
        category: 'cooling',
        title: 'F2x Cylinder-Head Coolant Vent-Line Service Action',
        description:
          'BMW SIB 17 01 21 covers affected F22 and F23 vehicles produced from April 24, 2015 through September 24, 2019. The quick-disconnect coupling on the cylinder-head coolant vent line can break at the cylinder head because the line may not withstand high temperatures over its service life, causing engine-coolant loss. Coverage is VIN-specific; the bulletin does not establish model-wide expansion-tank or electric-water-pump failure.',
        solution:
          'Check BMW AIR, DCSnet or the key-reader service menu for an open SIB 17 01 21 Service Action on the exact VIN. For an affected vehicle, replace the cylinder-head-to-expansion-tank coolant vent line following BMW Repair Instruction 17 12 012 and bleed/check the cooling system as required. Do not replace the expansion tank or electric water pump solely from this card. ShowMeTheParts resolves exact 2017 M240i fitment and lists hoses/pipes and water-pump categories, but catalog fitment does not establish this defect or repair.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Coolant loss after the cylinder-head vent-line coupling breaks',
          'Low coolant warning',
          'Visible coolant leakage near the cylinder-head vent-line connection',
        ],
        affectedSystems: [
          'cylinder-head coolant vent line',
          'engine cooling system',
        ],
        dtcCodes: [],
        citations: [
          {
            type: 'tsb',
            title:
              'BMW SIB 17 01 21 - Replace the Coolant Vent Line on Cylinder Head',
            url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10212788-9999.pdf',
          },
        ],
        summary:
          'Replaced the broad coolant-loss aggregation with BMW\'s production- and VIN-bounded coolant vent-line Service Action and removed 2 commerce claims with 4 URLs.',
      },
    },
    'bmw-m240i-b58-valve-cover-gasket-2017': archived({
      oldTitle: 'Valve Cover Gasket Oil Leak',
      idSuffix: 'Valve-Cover-Gasket Aggregation',
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'It assigns a 60,000-to-100,000-mile failure window across two generations and recommends gasket or complete-cover replacement from generic seepage symptoms without confirming an active leak, the leak origin, a BMW M240i bulletin or a production boundary.',
    }),
    'bmw-m240i-b58-vanos-solenoid-2017': archived({
      oldTitle: 'VANOS Solenoid O-Ring Failure',
      idSuffix: 'VANOS-Solenoid-O-Ring Aggregation',
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'It extrapolates concerns from earlier BMW inline-six generations to the B58 M240i, then prescribes silicone O-rings, solenoid cleaning or replacement without BMW fault-code boundaries, oil-pressure test results, a service bulletin or verified part identity.',
    }),
  },
  expectedTelemetry: {
    claimCount: 10,
    urlCount: 18,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 3,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 3,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-f2x-m240i-evap-purge-valve-extended-warranty',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032730-0001.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-g42-m240i-evap-purge-valve-extended-warranty',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032729-0001.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-f22-m240i-plastic-fuel-tank-leakage-extended-warranty',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009422-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-f2x-m240i-evap-purge-valve-extended-warranty::https://static.nhtsa.gov/odi/tsbs/2026/MC-11032730-0001.pdf',
    'bmw-g42-m240i-evap-purge-valve-extended-warranty::https://static.nhtsa.gov/odi/tsbs/2026/MC-11032729-0001.pdf',
    'bmw-f22-m240i-plastic-fuel-tank-leakage-extended-warranty::https://static.nhtsa.gov/odi/tsbs/2024/MC-11009422-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  if (
    issues.some((issue) => {
      const published =
        issue.id === 'bmw-m240i-b58-coolant-loss-2017';
      return (
        issue.after.status !==
          (published ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            published
              ? [2017, 2018, 2019, 2020]
              : config.records[issue.id].after.years,
          )
      );
    })
  ) {
    throw new Error(
      'BMW M240i reviewed scopes or statuses drifted.',
    );
  }
};

module.exports = config;
