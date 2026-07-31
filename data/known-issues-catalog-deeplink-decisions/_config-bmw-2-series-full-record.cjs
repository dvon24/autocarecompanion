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
      title: `Archived - Unsupported BMW 2 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 2 Series population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact chassis, model year, engine, production date, symptoms, DTCs, recall status and current BMW service information before diagnosis.',
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
      summary: `Archived the unsupported BMW 2 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 2 Series',
  make: 'BMW',
  model: '2 Series',
  batchId: 'bmw-2-series-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '1cf03c45b76180a14f4739d6179c3677fba2e68f9e782decd6522d1d5d6dbf9b',
  sourceSnapshotFileHash:
    '5d9038c04baaff4b03a9df60fa76fe28a7187c144878b4c847dbc86152cc19c0',
  packetFileHash:
    'f0181b023b2dcda6b487b0e6f6cd43b7fe68ab7be8241c8a7449a023a34e55d1',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-2-series/1cf03c45b761/all-0001.json',
  reviewTokens: {
    blind: 'bmw2_blind:no-blocker',
    edge: 'bmw2_edge:no-blocker',
  },
  expectedIds: [
    'bmw-2-series-b48-coolant-loss-2017',
    'bmw-2-series-valve-cover-gasket-2014',
    'bmw-2series-charge-pipe-2014',
    'bmw-2series-coolant-leak-2014',
    'bmw-2series-n20-timing-chain-2014',
    'bmw-2series-oil-leak-2014',
  ],
  records: {
    'bmw-2-series-b48-coolant-loss-2017': archived({
      oldTitle: 'B48 Engine Coolant Loss from Expansion Tank',
      idSuffix: 'B48 Expansion-Tank Aggregation',
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'other',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card extrapolates an expansion-tank seam defect and universal replacement part across nine model years from generic material. The BMW communication surfaced for expansion-tank leakage applies to another chassis, not this 2 Series population. One recorded commerce click does not establish fitment or remedy.',
    }),
    'bmw-2-series-valve-cover-gasket-2014': archived({
      oldTitle: 'Valve Cover Gasket Oil Leak',
      idSuffix: 'Valve-Cover-Gasket Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines N20 and B48 applications across eight years without one production-bounded BMW bulletin establishing the asserted cause, onset and universal gasket replacement.',
    }),
    'bmw-2series-charge-pipe-2014': archived({
      oldTitle: 'Turbo Charge Pipe Failure - F22/F23 228i/230i/M240i',
      idSuffix: 'Charge-Pipe Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card mixes N20, B46 and B48 engines and several variants, relies on generic secondary material and prescribes an aftermarket metal pipe without a BMW-defined defect population or repair instruction.',
    }),
    'bmw-2series-coolant-leak-2014': exactPath({
      oldTitle: 'Electric Water Pump Failure - All Turbocharged Models',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Recall 24V-608 Service Instructions - Water-Pump Connector Inspection and Shield Remedy',
          url: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V608-1347.pdf',
        },
      ],
      years: [2014, 2015, 2016],
      engines: ['N20', 'N26'],
      category: 'cooling',
      title:
        '228i Water-Pump Connector Fire Recall Requires a VIN Check',
      description:
        'NHTSA recall 24V-608 includes certain 2014-2016 BMW 228i and 228i xDrive vehicles. In the recalled population, fluid intrusion at the electric coolant-pump connector can cause an electrical short and localized overheating, increasing fire risk. The recall is VIN-specific and is not a general water-pump-failure claim for every turbocharged 2 Series.',
      solution:
        'Check the VIN with BMW or NHTSA before ordering any part. For an open recall, a BMW dealer follows the campaign inspection and installs the protective shield, with connector or pump work only when the campaign inspection requires it. Follow BMW parking or fire-safety instructions if warning signs are present. ShowMeTheParts returned no exact 2014 228i water-pump candidate in the available catalog categories, and the former generic pump commerce links were removed.',
      symptoms: [
        'Electrical or burning odor near the engine compartment',
        'Smoke or localized overheating may occur at the pump connector',
        'An affected vehicle may have no advance symptom',
      ],
      systems: [
        'electric coolant pump',
        'coolant-pump electrical connector',
        'protective splash shield',
      ],
      source: 'recall-related',
    }),
    'bmw-2series-n20-timing-chain-2014': exactPath({
      oldTitle: 'N20 Timing Chain Premature Failure - F22/F23 228i',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 11 03 17 - F22/F23 N20/N26 Timing-Chain and Oil-Pump-Drive-Chain Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10186213-9999.pdf',
        },
      ],
      years: [2014, 2015],
      engines: ['N20', 'N26'],
      category: 'engine',
      title:
        'Early 228i Timing-Chain Complaints Require N20/N26 Test-Plan Diagnosis',
      description:
        'BMW SIB 11 03 17 includes F22/F23 228i and 228i xDrive vehicles with N20 or N26 engines produced through February 2015. It extends limited warranty coverage for the timing-chain and oil-pump-drive-chain modules but does not say every vehicle is defective or authorize replacing a kit from noise alone.',
      solution:
        'Verify the VIN, engine and exact production date, then have a BMW-qualified technician read fault memory and follow the current ISTA timing-chain test plan. Repair only the components identified by that diagnosis. The seven-year or 70,000-mile extension was time- and mileage-limited, so current coverage must be confirmed. ShowMeTheParts returned no exact 2014 228i timing-chain candidate, and no commerce link is approved.',
      symptoms: [
        'Timing-drive noise requiring diagnosis',
        'Engine warning lamp may be present',
        'Timing-related drivability complaint',
      ],
      systems: ['timing-chain module', 'oil-pump drive-chain module'],
    }),
    'bmw-2series-oil-leak-2014': archived({
      oldTitle: 'Oil Leaks - Valve Cover & Oil Filter Housing - All Engines',
      idSuffix: 'Mixed Oil-Leak Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines two leak locations, three engine families and ten model years, duplicates the valve-cover card and lacks one exact BMW communication supporting the asserted population, mileage and two-gasket repair.',
    }),
  },
  expectedTelemetry: {
    claimCount: 14,
    urlCount: 26,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    remove: 4,
    'diagnosis-hold': 2,
  },
  expectedPublished: 2,
  expectedArchived: 4,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-2-series-coupe-side-head-protection-recall-2014',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V288-7983.PDF',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-2-series-coupe-side-head-protection-recall-2014::https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V288-7983.PDF',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-2series-coolant-leak-2014': {
      years: [2014, 2015, 2016],
      engines: ['N20', 'N26'],
    },
    'bmw-2series-n20-timing-chain-2014': {
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
            expected
              ? expected.years
              : config.records[issue.id].after.years,
          ) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected ? expected.engines : [])
      );
    })
  ) {
    throw new Error('BMW 2 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
