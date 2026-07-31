const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  engines,
  category,
  title,
  description,
  solution,
  severity = 'high',
  symptoms,
  systems,
  dtcCodes = [],
  source = 'nhtsa-verified',
}) {
  return {
    disposition: 'diagnosis-hold',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines,
      category,
      title,
      description,
      solution,
      severity,
      confidence: 'high',
      source,
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded BMW/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

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
      title: `Archived - Unsupported BMW 4 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 4 Series population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact chassis, model year, engine, production date, symptoms, DTCs, open recalls and current BMW service information before diagnosis.',
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
      summary: `Archived the unsupported BMW 4 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 4 Series',
  make: 'BMW',
  model: '4 Series',
  batchId: 'bmw-4-series-full-record-cohort-3-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '0dd35bc90bca2dce681420947e066c723fa9c21933a80e37915b4b21f5c0a1c0',
  sourceSnapshotFileHash:
    'b8e02f734ca72ecf2f2905a12eb3b5da3d84a9cd93e368257233225f296116e6',
  packetFileHash:
    'c45cf82dc8a71361b33c9f0123c9223de1b488876ab2ae2696175ecccda63225',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-4-series/0dd35bc90bca/all-0001.json',
  reviewTokens: {
    blind: 'bmw4_blind:no-blocker',
    edge: 'bmw4_edge:no-blocker',
  },
  expectedIds: [
    'bmw-4-series-b58-charge-pipe-2017',
    'bmw-4-series-n20-timing-chain-2014',
    'bmw-4-series-valve-cover-gasket-2014',
    'bmw-4series-charge-pipe-2014',
    'bmw-4series-convertible-top-2014',
    'bmw-4series-fuel-injector-2014',
    'bmw-4series-n20-timing-chain-2014',
    'bmw-4series-n55-vanos-solenoid-2014',
    'bmw-4series-n55-water-pump-2014',
  ],
  records: {
    'bmw-4-series-b58-charge-pipe-2017': archived({
      oldTitle: 'B58 Charge Pipe Pop-Off Under Boost',
      idSuffix: 'B58 Charge-Pipe Aggregation',
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card turns tuned/high-boost community anecdotes into a nine-year population-wide defect and prescribes an aftermarket aluminum pipe without a matching BMW communication.',
    }),
    'bmw-4-series-n20-timing-chain-2014': exactPath({
      oldTitle: 'N20 Timing Chain Guide Failure (428i)',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 11 03 17 - N20/N26 Timing-Chain and Oil-Pump Drive-Chain Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10186213-9999.pdf',
        },
      ],
      years: [2014, 2015],
      engines: ['N20', 'N26'],
      category: 'engine',
      title:
        'Lower-Engine Whine Requires 428i N20/N26 Timing-Chain Diagnosis',
      description:
        'BMW SIB 11 03 17 identifies specified F32, F33 and F36 428i variants with N20 or N26 engines produced through February 2015. A whining noise from the lower engine area that rises with engine speed can be associated with wear in the timing-chain or oil-pump drive-chain system; the bulletin does not declare every 428i defective.',
      solution:
        'Confirm the exact chassis, engine, production date and VIN eligibility, then have a BMW-qualified technician reproduce the noise and follow the current BMW diagnostic procedure before replacing anything. The historical seven-year/70,000-mile coverage was a limited warranty extension, not a recall, and is not a current coverage promise. ShowMeTheParts returned no exact 2014 428i timing-chain candidate, so no commerce link is approved.',
      symptoms: [
        'Whining from the lower engine area',
        'Noise frequency increases with engine speed',
      ],
      systems: ['timing-chain drive', 'oil-pump drive chain'],
    }),
    'bmw-4-series-valve-cover-gasket-2014': archived({
      oldTitle: 'Valve Cover Gasket Leak and PCV Failure',
      idSuffix: 'N20/N55 Valve-Cover and PCV Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines two engine families, gasket seepage, crankcase ventilation, oil consumption and misfire into one fixed-mileage full-cover replacement without an exact BMW bulletin.',
    }),
    'bmw-4series-charge-pipe-2014': archived({
      oldTitle: 'Turbo Charge Pipe Failure - 428i/435i/440i F32/F33/F36',
      idSuffix: 'F3x Multi-Engine Charge-Pipe Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card duplicates another charge-pipe claim, mixes N20, N55 and 440i scope, assigns a universal mileage interval and prescribes named aftermarket upgrades without a BMW-defined population or repair.',
    }),
    'bmw-4series-convertible-top-2014': archived({
      oldTitle:
        'Convertible Top Hydraulic Pump & Motor Failure - F33 Convertible',
      idSuffix: 'F33 Convertible-Top Hydraulic Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'body',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines pump motor, hydraulic leakage, microswitch and latch diagnoses into a universal failure claim. Exact BMW material supports distinct drainage and noise conditions, not the seeded pump-failure identity.',
    }),
    'bmw-4series-fuel-injector-2014': archived({
      oldTitle: 'Fuel Injector Failure - 428i/430i/435i/440i F32/F33/F36',
      idSuffix: 'F3x Multi-Engine Injector Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card combines N20, N55, B46/B48 and B58 applications, treats misfire as injector proof, recommends replacing every injector and adds walnut blasting without a matching BMW campaign or diagnostic bulletin.',
    }),
    'bmw-4series-n20-timing-chain-2014': archived({
      oldTitle: 'N20 Timing Chain Premature Failure - 428i F32/F33/F36',
      idSuffix: 'Duplicate N20 Timing-Chain Aggregation',
      years: [2014, 2015, 2016],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'This duplicates the stable N20 timing-chain identity retained above, incorrectly includes the 430i, asserts fixed preventive replacement and misstates the historical warranty term.',
    }),
    'bmw-4series-n55-vanos-solenoid-2014': archived({
      oldTitle: 'N55 VANOS Solenoid Failure - 435i/440i F32/F33/F36',
      idSuffix: 'N55 VANOS-Solenoid Aggregation',
      years: [2014, 2015, 2016, 2017, 2018],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card includes B58-powered 440i/M440i applications under an N55 identity, converts varied timing faults into solenoid failure and recommends paired preventive replacement without an exact F3x BMW source.',
    }),
    'bmw-4series-n55-water-pump-2014': archived({
      oldTitle: 'N55 Electric Water Pump Failure - 435i/440i F32/F33/F36',
      idSuffix: 'N55 Water-Pump Aggregation',
      years: [2014, 2015, 2016, 2017, 2018],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card mislabels the engine coolant pump as an auxiliary wear item, includes B58-powered 440i/M440i scope and claims every N55 pump will fail. Recall 24V608 is a distinct N20/N26 connector-fire identity and is preserved only as a proposal.',
    }),
  },
  expectedTelemetry: {
    claimCount: 23,
    urlCount: 41,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 8,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 8,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-4-series-n20-n26-water-pump-connector-recall-2014',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V608-1347.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-4-series-plastic-fuel-tank-warranty-extension-2014',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009422-0001.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-4-series-f33-rear-water-ingress-2014',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2019/MC-10164006-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-4-series-engine-starter-fire-recall-2021',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V056-6534.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-4-series-n20-n26-water-pump-connector-recall-2014::https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V608-1347.pdf',
    'bmw-4-series-plastic-fuel-tank-warranty-extension-2014::https://static.nhtsa.gov/odi/tsbs/2024/MC-11009422-0001.pdf',
    'bmw-4-series-f33-rear-water-ingress-2014::https://static.nhtsa.gov/odi/tsbs/2019/MC-10164006-9999.pdf',
    'bmw-4-series-engine-starter-fire-recall-2021::https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V056-6534.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-4-series-n20-timing-chain-2014': {
      years: [2014, 2015],
      engines: ['N20', 'N26'],
    },
  };
  if (
    issues.some((issue) => {
      const expected = published[issue.id];
      return (
        issue.after.status !== (expected ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            expected ? expected.years : config.records[issue.id].after.years,
          ) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected ? expected.engines : [])
      );
    })
  ) {
    throw new Error('BMW 4 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
