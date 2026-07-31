const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const recallCorpus =
  'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip';

function archived({
  oldTitle,
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
      title: `Archived - ${oldTitle}`,
      description: `The former BMW M340i card asserted "${oldTitle}" across the listed population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the VIN, model year, production date, drivetrain, symptoms, DTCs, software level, modifications, open recalls and current BMW service information before diagnosis.',
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
      summary: `Archived the unsupported BMW M340i "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW M340i',
  make: 'BMW',
  model: 'M340i',
  batchId: 'bmw-m340i-full-record-cohort-19-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '5356b1904c93e1f9d19588b16c4148645b7f21bfc2c71b9e68e9f7668a83dfe5',
  sourceSnapshotFileHash:
    '4f00527c5c60a37d851157c70084a7f048d51f6588c34c26c1c267d19613561c',
  packetFileHash:
    '4cf7ad113652eb0c4ac97f574f419a1ec62c04d4c158e4e5b1b6d5806612f88d',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-m340i/5356b1904c93/all-0001.json',
  reviewTokens: {
    blind: 'bmwm340i_blind:self-no-blocker',
    edge: 'bmwm340i_edge:self-no-blocker',
  },
  expectedIds: [
    'bmw-m340i-b58-hpfp-failure-2020',
    'bmw-m340i-12v-battery-drain-failure-battery-registration-issues',
    'bmw-m340i-b58-carbon-buildup-2020',
    'bmw-m340i-b58-coolant-loss-2020',
    'bmw-m340i-b58-oil-filter-disintegration-2020',
    'bmw-m340i-b58-wastegate-rattle-2020',
    'bmw-m340i-loss-brake-assist-from-brake-vacuum-pump-damage',
    'bmw-m340i-seat-belt-warning-audio-failure',
    'bmw-m340i-valve-cover-oil-filter-housing-gasket-oil-leaks',
    'bmw-m340i-vanos-solenoid-o-ring-failure',
    'bmw-m340i-zf-8hp-harsh-jerky-low-speed-shifting-mechatronic-faults',
  ],
  records: {
    'bmw-m340i-b58-hpfp-failure-2020': archived({
      oldTitle: 'High-Pressure Fuel Pump (HPFP) Failure',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'fuel',
      claims: 3,
      urls: 5,
      reason:
        'It converts generic fuel-pressure symptoms into a five-year B58 pump defect and recommends replacement without rail-pressure targets, low-side feed tests, BMW faults, a production boundary or an applicable campaign. ShowMeTheParts resolves a Bosch HPFP candidate for the exact 2020 M340i, but that proves only identity and fitment; the two recorded clicks belong to an unverified generic Delphi search link.',
    }),
    'bmw-m340i-12v-battery-drain-failure-battery-registration-issues':
      archived({
        oldTitle:
          '12V Battery Drain and Failure / Battery Registration Issues',
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        category: 'electrical',
        claims: 1,
        urls: 3,
        reason:
          'It combines short-trip state of charge, sleep-current draw, IBS faults, battery registration, brand anecdotes and display warnings into one universal diagnosis without a measured parasitic-current test, battery test result, fault code or BMW bulletin.',
      }),
    'bmw-m340i-b58-carbon-buildup-2020': archived({
      oldTitle: 'Intake Valve Carbon Buildup',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'It presents a general direct-injection mechanism as a 50,000-to-80,000-mile M340i failure and schedules walnut blasting or catch-can use without BMW measured deposits, adaptation values, DTCs or a maintenance interval.',
    }),
    'bmw-m340i-b58-coolant-loss-2020': archived({
      oldTitle: 'Coolant Loss from Expansion Tank and Water Pump',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'cooling',
      claims: 2,
      urls: 4,
      reason:
        'It combines expansion-tank, electric-pump and vent-line theories, prescribes preventive pump replacement, and incorrectly imports an F2x/F3x coolant-vent-line action into the G20 without a leak location, production boundary or applicable BMW bulletin.',
    }),
    'bmw-m340i-b58-oil-filter-disintegration-2020': archived({
      oldTitle: 'Oil Filter Disintegration in Housing',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'It treats filter damage during service as a model-wide in-use defect, promotes selected brands and a shorter interval, and alleges circulation of paper fragments without a filter lot, installation history, BMW inspection procedure or G20 M340i bulletin.',
    }),
    'bmw-m340i-b58-wastegate-rattle-2020': archived({
      oldTitle: 'Turbo Wastegate Rattle at Idle',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'It combines normal actuator noise, mechanical play, boost deviation and complete turbocharger replacement without BMW fault codes, actuator adaptation results, measured play, a service bulletin or a production boundary.',
    }),
    'bmw-m340i-loss-brake-assist-from-brake-vacuum-pump-damage': {
      disposition: 'recall-dealer',
      decision:
        'Retain and correct the exact model-year 2020 M340i brake-assist recall 21V-598, remove its unrelated commerce claim and three URLs, and keep the remedy recall-first.',
      evidence: [
        {
          type: 'recall',
          label:
            'NHTSA Recall 21V-598 - Loss of Braking Assist',
          url: 'https://static.nhtsa.gov/odi/rcl/2021/RCAK-21V598-1323.pdf',
        },
      ],
      after: {
        years: [2020],
        trims: [],
        engines: ['B58 3.0L turbo inline-six'],
        category: 'brakes',
        title: '2020 M340i Brake-Assist Recall 21V-598',
        description:
          'NHTSA campaign 21V-598 covers certain model-year 2020 BMW M340i and M340i xDrive vehicles. During engine start, engine-management software can command the combined oil/vacuum pump in a way that damages it, reducing or eliminating vacuum brake assistance. Full mechanical braking remains available, but pedal effort and stopping distance can increase. Applicability is VIN-specific.',
        solution:
          'Check the VIN for an open 21V-598 campaign. An authorized BMW dealer updates the engine-management software free of charge and replaces the combined oil/vacuum pump if diagnosis shows it was already damaged. Do not order generic brake-vacuum parts from this card.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Hard brake pedal after engine start',
          'Reduced or unavailable brake assistance',
          'Increased pedal effort and stopping distance',
        ],
        affectedSystems: [
          'engine management software',
          'combined oil and vacuum pump',
          'power brake assistance',
        ],
        dtcCodes: [],
        citations: [
          {
            type: 'recall',
            title:
              'NHTSA Recall 21V-598 - Loss of Braking Assist',
            url: 'https://static.nhtsa.gov/odi/rcl/2021/RCAK-21V598-1323.pdf',
          },
        ],
        summary:
          'Corrected the card to the exact model-year 2020 VIN-bounded brake-assist recall and removed 1 commerce claim with 3 URLs.',
      },
    },
    'bmw-m340i-seat-belt-warning-audio-failure': {
      disposition: 'recall-dealer',
      decision:
        'Retain the 2019-2022 M340i receiver-audio-module recall 23V-584 with its exact software remedy and official BMW/NHTSA source. The frozen card already has zero commerce.',
      evidence: [
        {
          type: 'recall',
          label:
            'BMW SIB 65 23 23 / NHTSA Recall 23V-584 - Receiver Audio Module',
          url: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V584-3874.pdf',
        },
      ],
      after: {
        years: [2019, 2020, 2021, 2022],
        trims: [],
        engines: [],
        category: 'safety',
        title:
          '2019-2022 M340i Seat-Belt Warning Recall 23V-584',
        description:
          'BMW SIB 65 23 23 and NHTSA campaign 23V-584 cover certain model-year 2019-2022 G20 M340i vehicles. Receiver Audio Module software may delay or fail to generate the audible driver seat-belt warning, causing noncompliance with FMVSS 208 and increasing injury risk if a driver relies on the reminder. Applicability is VIN-specific.',
        solution:
          'Check the VIN for an open 23V-584 campaign. An authorized BMW dealer installs updated Receiver Audio Module software free of charge; eligible vehicles may also receive the remedy by BMW Remote Software Upgrade. Always use the seat belt regardless of warning-chime behavior.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Driver seat-belt warning chime is delayed or absent',
          'Other safety-warning audio may be delayed',
        ],
        affectedSystems: [
          'Receiver Audio Module software',
          'audible seat-belt reminder',
        ],
        dtcCodes: [],
        citations: [
          {
            type: 'recall',
            title:
              'BMW SIB 65 23 23 / NHTSA Recall 23V-584 - Receiver Audio Module',
            url: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V584-3874.pdf',
          },
        ],
        summary:
          'Retained the exact VIN-bounded receiver-audio-module recall with its free software remedy and zero commerce.',
      },
    },
    'bmw-m340i-valve-cover-oil-filter-housing-gasket-oil-leaks':
      archived({
        oldTitle:
          'Valve Cover and Oil Filter Housing Gasket Oil Leaks (B58)',
        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
        category: 'engine',
        claims: 1,
        urls: 3,
        reason:
          'It merges two leak locations and possible cover deformation into one seven-year failure window and recommends gasket or cover replacement without first confirming active leakage, the exact source, production scope or an M340i bulletin.',
      }),
    'bmw-m340i-vanos-solenoid-o-ring-failure': archived({
      oldTitle: 'VANOS Solenoid O-Ring Failure',
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'engine',
      claims: 1,
      urls: 3,
      reason:
        'It treats O-rings and solenoid electronics as a common B58 wear item from generic rough-running symptoms without BMW camshaft faults, oil-pressure and circuit tests, a production boundary or an applicable bulletin.',
    }),
    'bmw-m340i-zf-8hp-harsh-jerky-low-speed-shifting-mechatronic-faults':
      archived({
        oldTitle:
          'ZF 8HP Harsh / Jerky Low-Speed Shifting and Mechatronic Faults',
        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
        category: 'transmission',
        claims: 1,
        urls: 3,
        reason:
          'It combines cold shift feel, drive mode, fluid condition, adaptations and mechatronic failure, contradicts BMW service policy with a universal fluid-service prescription, and lacks transmission faults, measured fill condition or a bulletin.',
      }),
  },
  expectedTelemetry: {
    claimCount: 18,
    urlCount: 36,
    claimClickCount: 2,
    recordClickCount: 2,
    priorityClickCount: 2,
  },
  expectedDispositionCounts: {
    remove: 9,
    'recall-dealer': 2,
  },
  expectedPublished: 2,
  expectedArchived: 9,
  controlledDeltaProposals: [
    '21V096000',
    '19V684000',
    '20V355000',
    '23V211000',
    '19V600000',
    '19V755000',
    '20V164000',
    '24V576000',
    '21V554000',
    '20V761000',
    '21V298000',
    '23V118000',
  ].map((campaign) => ({
    disposition: 'proposal-only',
    insert: false,
    title: `bmw-m340i-recall-${campaign.toLowerCase()}`,
    sources: [recallCorpus],
  })),
  expectedProposalIdentities: [
    '21V096000',
    '19V684000',
    '20V355000',
    '23V211000',
    '19V600000',
    '19V755000',
    '20V164000',
    '24V576000',
    '21V554000',
    '20V761000',
    '21V298000',
    '23V118000',
  ].map(
    (campaign) =>
      `bmw-m340i-recall-${campaign.toLowerCase()}::${recallCorpus}`,
  ),
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  const publishedScopes = {
    'bmw-m340i-loss-brake-assist-from-brake-vacuum-pump-damage':
      [2020],
    'bmw-m340i-seat-belt-warning-audio-failure': [
      2019, 2020, 2021, 2022,
    ],
  };
  if (
    issues.some((issue) => {
      const years = publishedScopes[issue.id];
      return (
        issue.after.status !==
          (years ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            years || config.records[issue.id].after.years,
          )
      );
    })
  ) {
    throw new Error(
      'BMW M340i reviewed scopes or statuses drifted.',
    );
  }
};

module.exports = config;
