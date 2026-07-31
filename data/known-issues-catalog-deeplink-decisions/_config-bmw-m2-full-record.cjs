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
      title: `Archived - Unsupported BMW M2 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW M2 population. ${reason}`,
      solution:
        'Do not order performance parts or apply a universal repair from this archived card. Verify the exact generation, model year, production date, engine, transmission, symptoms, DTCs, modifications and current BMW service information before diagnosis. Track-use preparation and limits are separate from a street-vehicle defect.',
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
      summary: `Archived the unsupported BMW M2 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW M2',
  make: 'BMW',
  model: 'M2',
  batchId: 'bmw-m2-full-record-cohort-15-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '82f057c6a449d4fea265a994df55af96ea1d5ecccb2da1bfb0dcfb4ec01b9185',
  sourceSnapshotFileHash:
    '6155efbfcce406dac12a0257fd0b6ef621a1e7f7d57c7105fa47dc03705afc77',
  packetFileHash:
    'f2f78f2893fa80ff6fb5cfc142743c44f9dacba5e6e7d3f312c12e9c9fac6c2c',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-m2/82f057c6a449/all-0001.json',
  reviewTokens: {
    blind: 'bmwm2_blind:no-blocker',
    edge: 'bmwm2_edge:no-blocker',
  },
  expectedIds: [
    'bmw-m2-charge-pipe-2016',
    'bmw-m2-comp-s55-crank-hub-2019',
    'bmw-m2-cooling-system-2016',
    'bmw-m2-dct-clutch-2016',
    'bmw-m2-dct-mechatronics-2016',
    'bmw-m2-n55-rod-bearing-2016',
  ],
  records: {
    'bmw-m2-charge-pipe-2016': {
      disposition: 'diagnosis-hold',
      decision:
        'Replace the frozen charge-pipe-failure aggregation with BMW\'s bounded early-F87 boost-control software path. Remove both commerce claims and both outbound URL occurrences.',
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 12 17 16 - M2 Drivetrain Malfunction CCM',
          url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10214952-9999.pdf',
        },
      ],
      after: {
        years: [2016],
        trims: [],
        engines: ['N55 3.0L turbo I6'],
        category: 'engine',
        title: 'Early F87 M2 Boost-Control Software Faults',
        description:
          'BMW SIB 12 17 16 defines an F87 M2 path for vehicles produced through August 3, 2016 when a Drivetrain Malfunction message, reduced power and DME faults 120208 and 120408 occur. BMW identifies an overly sensitive DME diagnostic threshold that can switch off turbocharging-pressure control. The bulletin does not establish a cracked plastic charge pipe.',
        solution:
          'Read the DME faults with the current BMW ISTA version and confirm the production date. If the vehicle meets SIB 12 17 16, program the vehicle to integration level F020-16-07-504 or higher. Do not replace a charge pipe from this card. ShowMeTheParts resolves exact 2016 M2 turbocharger and 3.0-liter fitment but returned no charge-pipe candidate; even a catalog match would not prove the BMW software fault or repair role.',
        severity: 'medium',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Drivetrain Malfunction Check Control message',
          'Reduced engine power',
          'DME fault 120208',
          'DME fault 120408',
        ],
        affectedSystems: [
          'DME boost-control diagnostics',
          'turbocharging pressure control',
        ],
        dtcCodes: ['120208', '120408'],
        citations: [
          {
            type: 'tsb',
            title:
              'BMW SIB 12 17 16 - M2 Drivetrain Malfunction CCM',
            url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10214952-9999.pdf',
          },
        ],
        summary:
          'Replaced the frozen charge-pipe card with BMW\'s production- and fault-bounded DME software path and removed 2 commerce claims with 2 URLs.',
      },
    },
    'bmw-m2-comp-s55-crank-hub-2019': archived({
      oldTitle:
        'S55 Crank Hub Failure (CATASTROPHIC) - M2 Competition',
      idSuffix: 'S55 Crank-Hub Aggregation',
      years: [2019, 2020],
      category: 'engine',
      claims: 3,
      urls: 3,
      reason:
        'It presents a heavily amplified tuning-community failure theory as a widespread stock-vehicle defect, assigns timing-slip symptoms without BMW diagnostic boundaries and promotes keyed or pinned crank-hub kits plus a timing tool without a BMW bulletin, recall or verified repair role.',
    }),
    'bmw-m2-cooling-system-2016': archived({
      oldTitle:
        'Cooling System Inadequacy Under Track Use - F87 M2/M2C',
      idSuffix: 'Track-Cooling Aggregation',
      years: [2016, 2017, 2018, 2019, 2020],
      category: 'cooling',
      claims: 5,
      urls: 5,
      reason:
        'It treats sustained track-session thermal management, modified power levels and driver technique as a production cooling defect, then promotes radiators, oil coolers, thermostats and coolant without a BMW street-use bulletin, measured threshold or exact configuration.',
    }),
    'bmw-m2-dct-clutch-2016': archived({
      oldTitle:
        'DCT Dual-Clutch Transmission Shudder & Clutch Wear - F87 M2/M2C',
      idSuffix: 'DCT Clutch-Wear Aggregation',
      years: [2016, 2017, 2018, 2019, 2020],
      category: 'transmission',
      claims: 5,
      urls: 7,
      reason:
        'It combines launch behavior, low-speed shift feel, fluid condition, adaptations and clutch wear into a single all-year failure claim, then promotes clutch kits, fluids, filters and scan tools without BMW fault codes, measured clutch limits, a service bulletin or verified fitment.',
    }),
    'bmw-m2-dct-mechatronics-2016': archived({
      oldTitle: 'DCT (M-DCT) Mechatronics Unit Failure',
      idSuffix: 'DCT Mechatronics Aggregation',
      years: [2016, 2017, 2018, 2019, 2020, 2021],
      category: 'transmission',
      claims: 2,
      urls: 4,
      reason:
        'It duplicates the DCT card and infers pump, solenoid, sensor and complete mechatronics failure from broad warning and shift symptoms without BMW DCT faults, hydraulic test results, a bulletin or a production boundary.',
    }),
    'bmw-m2-n55-rod-bearing-2016': archived({
      oldTitle: 'N55 Rod Bearing Premature Wear - F87 M2',
      idSuffix: 'N55 Rod-Bearing Aggregation',
      years: [2016, 2017, 2018],
      category: 'engine',
      claims: 5,
      urls: 7,
      reason:
        'It extrapolates high-load and modified-engine risk into a model-wide premature-bearing defect, prescribes preventive replacement intervals and promotes bearing kits, bolts, oil and analysis without BMW wear limits, an F87 N55 campaign or a fault-led diagnosis.',
    }),
  },
  expectedTelemetry: {
    claimCount: 22,
    urlCount: 28,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 5,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-m2-ac-evaporator-freeze-reduced-airflow',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2021/MC-10205068-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-g87-m2-front-tie-rod-creak',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11021817-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-m2-ac-evaporator-freeze-reduced-airflow::https://static.nhtsa.gov/odi/tsbs/2021/MC-10205068-9999.pdf',
    'bmw-g87-m2-front-tie-rod-creak::https://static.nhtsa.gov/odi/tsbs/2025/MC-11021817-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  if (
    issues.some((issue) => {
      const published = issue.id === 'bmw-m2-charge-pipe-2016';
      return (
        issue.after.status !==
          (published ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            published
              ? [2016]
              : config.records[issue.id].after.years,
          )
      );
    })
  ) {
    throw new Error('BMW M2 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
