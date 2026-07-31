const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function recallPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  title,
  description,
  solution,
  symptoms,
  systems,
}) {
  return {
    disposition: 'recall-dealer',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded VIN-first recall path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines: [],
      category: oldTitle.includes('Brake') ? 'brakes' : 'transmission',
      title,
      description,
      solution,
      severity: 'high',
      confidence: 'high',
      source: 'recall-related',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with a bounded VIN-first recall path and removed ${claims} commerce claims with ${urls} URLs.`,
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
      title: `Archived - Unsupported BMW 8 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 8 Series population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact body style, model year, engine, production date, symptoms, DTCs, open recalls and current BMW service information before diagnosis.',
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
      summary: `Archived the unsupported BMW 8 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 8 Series',
  make: 'BMW',
  model: '8 Series',
  batchId: 'bmw-8-series-full-record-cohort-7-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '1929b4dcb1124047956d7b44efd1fe0af0ae2b41cef2665acec84625b278c190',
  sourceSnapshotFileHash:
    'f727bf0936c2e18d6966e46bf63c897ffc5ac1f47635281ff26f75fb65174767',
  packetFileHash:
    'fa52a950fa1264717ca256b8bcd272c7fadd9985601c6aa68d213d3540255e58',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-8-series/1929b4dcb112/all-0001.json',
  reviewTokens: {
    blind: 'bmw8_blind:no-blocker',
    edge: 'bmw8_edge:no-blocker',
  },
  expectedIds: [
    'bmw-8-series-adaptive-suspension-2019',
    'bmw-8-series-b58-coolant-loss-2019',
    'bmw-8-series-n63-oil-consumption-m850i-2019',
    'bmw-8series-ibs-failure-2020',
    'bmw-8series-n63tu3-timing-chain-2019',
    'bmw-8series-n63tu3-valve-stem-seals-2019',
    'bmw-8series-premature-tire-wear-2019',
    'bmw-8series-zf-8hp-mechatronic-2019',
  ],
  records: {
    'bmw-8-series-adaptive-suspension-2019': archived({
      oldTitle: 'Adaptive Suspension Damper Malfunction',
      idSuffix: 'Adaptive-Damper Aggregation',
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'suspension',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card assigns rear electronic-damper solenoid failure, a stiff default mode, coding and paired replacement to seven model years and promotes a brand without an exact BMW bulletin, option code, DTC or body-style population.',
    }),
    'bmw-8-series-b58-coolant-loss-2019': archived({
      oldTitle: 'B58 Engine Coolant Loss from Expansion Tank and Water Pump',
      idSuffix: 'B58 Cooling-System Aggregation',
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'other',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines expansion-tank seams, cap pressure, electric-pump connections and every quick-connect fitting, attributes extra chassis thermal stress and prescribes universal replacement without an exact 840i BMW communication.',
    }),
    'bmw-8-series-n63-oil-consumption-m850i-2019': archived({
      oldTitle: 'N63/S63 V8 Oil Consumption in M850i',
      idSuffix: 'N63/S63 Oil-Consumption Aggregation',
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card mixes N63 and S63 engines, asserts common consumption intervals and a universal allowable rate, then assigns valve-stem, turbo-return and crankcase causes without a matching BMW M850i diagnostic bulletin.',
    }),
    'bmw-8series-ibs-failure-2020': recallPath({
      oldTitle: 'Integrated Brake System (IBS) Failure (All 8 Series & M8)',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Safety Recall 21V-062 - Integrated Brake System, 8 Series Including M',
          url: 'https://static.nhtsa.gov/odi/rcl/2021/RCRIT-21V062-2025.pdf',
        },
      ],
      years: [2019, 2020, 2021],
      title: '2019-2021 8 Series Integrated Brake Recall 21V-062',
      description:
        'BMW/NHTSA recall 21V-062 covers certain model-year 2019-2021 8 Series vehicles, including M variants, produced within the recall population window. The integrated brake system rotor and shaft may not have been welded to specification; during hard braking this can reduce braking assistance and increase stopping distance. It is a VIN-specific recall, not an all-2020-2024 module or software failure population.',
      solution:
        'Check the VIN for an open 21V-062 campaign and current remedy status with BMW/NHTSA. If the vehicle is included, have an authorized BMW center perform the recall repair at no charge. If brake warnings appear or pedal effort changes, slow safely, avoid hard braking and contact BMW or roadside assistance for direction. ShowMeTheParts resolved exact 2020 840i, 840i xDrive and M850i xDrive brake-hydraulics contexts but returned no brake-booster candidate; recall eligibility and remedy remain dealer-only.',
      symptoms: [
        'VIN shows an open 21V-062 recall',
        'Brake warning appears',
        'Hard braking requires increased pedal force or stopping distance',
      ],
      systems: ['integrated brake system', 'power braking assistance'],
    }),
    'bmw-8series-n63tu3-timing-chain-2019': archived({
      oldTitle: 'N63TU3 Timing Chain Guide Wear (M850i)',
      idSuffix: 'N63TU3 Timing-Chain Aggregation',
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card invents an 80,000-100,000-mile preventive interval, catastrophic cost and do-not-drive instruction, uses incorrect legacy trim names, cites only a forum homepage and promotes a vendor kit without an exact BMW N63TU3 test path.',
    }),
    'bmw-8series-n63tu3-valve-stem-seals-2019': archived({
      oldTitle: 'N63TU3 Valve Stem Seal Failure & Oil Consumption (M850i)',
      idSuffix: 'N63TU3 Valve-Stem-Seal Aggregation',
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card applies an older N63 bulletin and settlement to N63TU3 M850i vehicles, asserts a fixed consumption rate and valve-seal cause, uses incorrect legacy trim names and promotes branded seals, plugs and tooling without a matching BMW population.',
    }),
    'bmw-8series-premature-tire-wear-2019': archived({
      oldTitle: 'Premature Tire Wear (All 8 Series & M8)',
      idSuffix: 'Universal Tire-Wear Aggregation',
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      category: 'suspension',
      claims: 2,
      urls: 2,
      reason:
        'The frozen card claims fixed camber, tire-life and annual-savings figures across all wheel, tire, suspension and body configurations, cites a fabricated video identifier and prescribes an altered alignment without BMW specifications.',
    }),
    'bmw-8series-zf-8hp-mechatronic-2019': recallPath({
      oldTitle: 'ZF 8HP Transmission Mechatronic Issues (All 8 Series & M8)',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Safety Recall 23V-821 - Integrated Transmission Control Unit',
          url: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V821-0784.pdf',
        },
      ],
      years: [2023],
      title: '2023 8 Series ITCU Recall 23V-821',
      description:
        'BMW/NHTSA recall 23V-821 covers certain model-year 2023 8 Series coupe, convertible and Gran Coupe vehicles, including specified M variants. A weld seam in the integrated transmission control unit housing may allow transmission oil to reach electronics and affect clutch-pressure control; transmission gear seizure could affect handling and increase crash risk. This is not evidence of universal ZF sleeve wear, degraded lifetime fluid or a six-year maintenance interval.',
      solution:
        'Check the VIN for an open 23V-821 campaign with BMW/NHTSA. If included, arrange the free authorized-BMW recall remedy, which replaces the transmission mechatronics module. Do not buy a sleeve kit or change fluid as a substitute for the recall. ShowMeTheParts resolved exact 2023 840i, 840i xDrive and M850i xDrive models but exposed no transmission category or ITCU candidate, and recall repair remains dealer-only.',
      symptoms: [
        'VIN shows an open 23V-821 recall',
        'Possible transmission malfunction or loss of drive',
        'The defect may provide no advance warning',
      ],
      systems: ['integrated transmission control unit', 'transmission mechatronics'],
    }),
  },
  expectedTelemetry: {
    claimCount: 18,
    urlCount: 30,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 6,
    'recall-dealer': 2,
  },
  expectedPublished: 2,
  expectedArchived: 6,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-8-series-840i-starter-overheat-recall-2020',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V576-2334.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-8-series-front-seat-buckle-recall-2020',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2020/RCMN-20V164-1743.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-8-series-840i-starter-overheat-recall-2020::https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V576-2334.pdf',
    'bmw-8-series-front-seat-buckle-recall-2020::https://static.nhtsa.gov/odi/rcl/2020/RCMN-20V164-1743.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-8series-ibs-failure-2020': {
      years: [2019, 2020, 2021],
      engines: [],
    },
    'bmw-8series-zf-8hp-mechatronic-2019': {
      years: [2023],
      engines: [],
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
    throw new Error('BMW 8 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
