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
      title: `Archived - Unsupported BMW 1 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 1 Series population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact chassis, model year, engine, production date, symptoms, DTCs and current BMW service information before diagnosis.',
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
      summary: `Archived the unsupported BMW 1 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 1 Series',
  make: 'BMW',
  model: '1 Series',
  batchId: 'bmw-1-series-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '1cf03c45b76180a14f4739d6179c3677fba2e68f9e782decd6522d1d5d6dbf9b',
  sourceSnapshotFileHash:
    '5d9038c04baaff4b03a9df60fa76fe28a7187c144878b4c847dbc86152cc19c0',
  packetFileHash:
    'a498864eee9fac13d7ec187b3a92aa7d47ce7904b8694b5e007eb90dee1d5df1',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-1-series/1cf03c45b761/all-0001.json',
  reviewTokens: {
    blind: 'bmw1_blind:no-blocker',
    edge: 'bmw1_edge:no-blocker',
  },
  expectedIds: [
    'bmw-1-series-electric-water-pump-2012',
    'bmw-1-series-n20-timing-chain-2012',
    'bmw-1-series-oil-filter-housing-gasket-2012',
    'bmw-1series-n54-charge-pipe-2008',
    'bmw-1series-n54-hpfp-2008',
    'bmw-1series-n54-injector-2008',
    'bmw-1series-n54-spark-coil-2008',
    'bmw-1series-n54-wastegate-2008',
    'bmw-1series-ofhg-leak-2008',
    'bmw-1series-valve-cover-pcv-2008',
    'bmw-1series-water-pump-2008',
  ],
  records: {
    'bmw-1-series-electric-water-pump-2012': archived({
      oldTitle: 'Electric Water Pump Failure',
      idSuffix: '2012-2019 Water-Pump Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      category: 'other',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card spans unrelated global 1 Series generations and engines, asserts a mileage window and revised-design remedy without a matching BMW bulletin, and duplicates the bounded E82/E88 135i coolant-pump path retained below.',
    }),
    'bmw-1-series-n20-timing-chain-2012': archived({
      oldTitle: 'N20 Timing Chain and Guide Failure',
      idSuffix: 'N20 Timing-Chain Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card assigns an N20 defect and universal kit to a broad 2012-2019 population. BMW SIB 11 03 17 does not list a BMW 1 Series application, so its F22/F23 scope cannot be transferred to this model identity.',
    }),
    'bmw-1-series-oil-filter-housing-gasket-2012': archived({
      oldTitle: 'Oil Filter Housing Gasket Leak',
      idSuffix: '2012-2019 Oil-Leak Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card relies on generic community material and does not establish one BMW-defined chassis, production range, diagnostic path or repair for every asserted N20 1 Series.',
    }),
    'bmw-1series-n54-charge-pipe-2008': archived({
      oldTitle: 'N54 Charge Pipe Failure (135i / 1M)',
      idSuffix: 'N54 Charge-Pipe Aggregation',
      years: [2008, 2009, 2010, 2011],
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'The frozen card converts forum anecdotes into a population-wide failure claim, includes the 1M without a production-bounded BMW source, and prescribes an aftermarket upgrade rather than a BMW diagnostic procedure.',
    }),
    'bmw-1series-n54-hpfp-2008': exactPath({
      oldTitle:
        'N54 High-Pressure Fuel Pump (HPFP) Failure (135i / 1M)',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 12 55 06 - N54 High-Pressure Fuel-System Diagnosis and Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10149587-9999.pdf',
        },
      ],
      years: [2008, 2009, 2010],
      engines: ['N54'],
      category: 'fuel',
      title:
        'Long Crank or Power Loss Requires N54 Fuel-Pressure Diagnosis',
      description:
        'BMW SIB 12 55 06 covers 2008-2010 E82/E88 135i vehicles with the N54 engine when long cranking, reduced power, a service-engine-soon lamp or fuel-pressure faults are present. BMW requires separating low-pressure supply faults from high-pressure system faults; the symptoms do not by themselves prove the high-pressure pump has failed.',
      solution:
        'Have a BMW-qualified technician read the fault memory and follow the bulletin fuel-pressure test plan for 2FBF, 29DC, 29F1 or 29F2 before replacing anything. The bulletin says not to replace the high-pressure pump automatically. Its warranty extension was time- and mileage-limited, so current coverage must be confirmed by VIN. ShowMeTheParts resolved one 2008 135i high-pressure fuel-pump candidate, but fitment is not remedy proof and no commerce link is approved.',
      symptoms: [
        'Long engine cranking before start',
        'Reduced-power warning',
        'Service-engine-soon lamp',
      ],
      systems: [
        'low-pressure fuel supply',
        'high-pressure fuel system',
      ],
      dtcCodes: ['2FBF', '29DC', '29F1', '29F2'],
    }),
    'bmw-1series-n54-injector-2008': exactPath({
      oldTitle: 'N54 Fuel Injector Failure (135i / 1M)',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW SIB 13 14 10 - N54 Piezo Injector Emissions Recall',
          url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10151081-9999.pdf',
        },
      ],
      years: [2008, 2009],
      engines: ['N54'],
      category: 'fuel',
      title:
        'N54 Injector Emissions Recall Requires a VIN and Production-Date Check',
      description:
        'BMW SIB 13 14 10 identifies certain E82/E88 135i vehicles with the N54 engine produced from April 2, 2007 through November 30, 2008. Piezo injectors outside the permitted calibration range can cause misfire and rough or erratic engine operation; eligibility is campaign- and VIN-specific rather than a defect claim for every 135i or 1M.',
      solution:
        'Ask a BMW dealer to check the VIN in DCSnet for the emissions recall before authorizing injector work. For an eligible vehicle, follow the campaign procedure, which calls for replacing all six injectors and completing the specified calibration and verification work. ShowMeTheParts returned no exact fuel-injector candidate for the 2008 135i query, and the former generic injector links were removed.',
      symptoms: [
        'Engine misfire',
        'Rough or erratic engine operation',
        'Service-engine-soon lamp may be present',
      ],
      systems: ['N54 piezo fuel injectors', 'engine management'],
      source: 'recall-related',
    }),
    'bmw-1series-n54-spark-coil-2008': archived({
      oldTitle: 'N54 Spark Plug & Ignition Coil Failure (135i / 1M)',
      idSuffix: 'Ignition Maintenance Aggregation',
      years: [2008, 2009, 2010, 2011],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card treats ordinary diagnosis and maintenance items as one systemic defect, cites no production-bounded BMW communication and prescribes a universal six-coil-and-plug replacement package.',
    }),
    'bmw-1series-n54-wastegate-2008': exactPath({
      oldTitle: 'N54 Wastegate Rattle & Turbo Failure (135i / 1M)',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 02 12 - N54 Turbocharger Wastegate Diagnosis and Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10052615-8081.pdf',
        },
      ],
      years: [2008, 2009, 2010],
      engines: ['N54'],
      category: 'engine',
      title:
        'N54 Wastegate Noise Must Be Classified Before Turbocharger Repair',
      description:
        'BMW SIB 01 02 12 covers 2008-2010 E82/E88 135i vehicles with the N54 engine. BMW distinguishes a slight wastegate rattle that is characteristic and needs no repair from repeated metallic clanking that requires the specified ISTA diagnostic path; noise alone does not establish turbocharger failure.',
      solution:
        'Have a BMW-qualified technician reproduce and classify the noise, check fault memory and follow the current ISTA wastegate test plan. Do not replace turbochargers or fit an aftermarket actuator solely from a rattle description. The historical emissions-warranty extension was limited to eight years or 82,000 miles, so current coverage must be confirmed by VIN. ShowMeTheParts returned turbocharger candidates, but no candidate was approved as a diagnosis or remedy.',
      symptoms: [
        'Wastegate-area rattle',
        'Repeated metallic clanking during deceleration',
      ],
      systems: ['N54 turbocharger wastegates', 'boost control'],
    }),
    'bmw-1series-ofhg-leak-2008': archived({
      oldTitle: 'Oil Filter Housing Gasket Leak (All 1 Series E82/E88)',
      idSuffix: 'E82/E88 Oil-Leak Aggregation',
      years: [2008, 2009, 2010, 2011, 2012, 2013],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card spans N52, N54 and N55 engines, duplicates another oil-filter-housing card and relies on community material without an exact BMW bulletin establishing the population, cause and universal replacement path.',
    }),
    'bmw-1series-valve-cover-pcv-2008': archived({
      oldTitle: 'Valve Cover & PCV System Failure (All 1 Series E82/E88)',
      idSuffix: 'Valve-Cover and PCV Aggregation',
      years: [2008, 2009, 2010, 2011, 2012, 2013],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines valve-cover leakage, crankcase-ventilation behavior and multiple engines into one repair claim. BMW recall 17V683 concerns a distinct N51/N52 PCV-heater fire risk and is preserved as a controlled proposal instead of being merged into this card.',
    }),
    'bmw-1series-water-pump-2008': exactPath({
      oldTitle: 'Electric Water Pump Failure (All 1 Series E82/E88)',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 13 21 - E82/E88 135i Electric Coolant-Pump Settlement and Diagnostic Scope',
          url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10198894-9999.pdf',
        },
      ],
      years: [2008, 2009, 2010, 2011, 2012, 2013],
      engines: ['N54', 'N55'],
      category: 'cooling',
      title:
        '135i Overheat Warning May Require Electric Coolant-Pump Diagnosis',
      description:
        'BMW SIB 01 13 21 identifies 2008-2013 E82/E88 135i vehicles with N54 or N55 engines in the electric coolant-pump settlement population. The bulletin provides a diagnosis-and-repair path when an engine warning lamp or overheat warning is present; it does not cover every E82/E88 engine and does not authorize replacing the pump solely because of mileage.',
      solution:
        'Stop safely if an overheat warning appears and avoid continued operation until the cooling system is checked. A BMW-qualified technician should verify the VIN and engine, read fault memory and perform the current coolant-pump test plan, replacing the pump only when the diagnosis requires it. Settlement benefits were time-limited. ShowMeTheParts resolved five 2008 135i water-pump candidates, but fitment does not prove failure or remedy, so the former commerce links remain removed.',
      symptoms: [
        'Engine warning lamp',
        'Engine-overheat warning',
        'Reduced-power operation may accompany overheating',
      ],
      systems: ['electric engine coolant pump', 'engine cooling system'],
    }),
  },
  expectedTelemetry: {
    claimCount: 25,
    urlCount: 45,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 7,
    'diagnosis-hold': 4,
  },
  expectedPublished: 4,
  expectedArchived: 7,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-1-series-pcv-heater-fire-recall-2008',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2017/RCMN-17V683-9685.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-1-series-pcv-heater-fire-recall-2008::https://static.nhtsa.gov/odi/rcl/2017/RCMN-17V683-9685.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-1series-n54-hpfp-2008': {
      years: [2008, 2009, 2010],
      engines: ['N54'],
    },
    'bmw-1series-n54-injector-2008': {
      years: [2008, 2009],
      engines: ['N54'],
    },
    'bmw-1series-n54-wastegate-2008': {
      years: [2008, 2009, 2010],
      engines: ['N54'],
    },
    'bmw-1series-water-pump-2008': {
      years: [2008, 2009, 2010, 2011, 2012, 2013],
      engines: ['N54', 'N55'],
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
    throw new Error('BMW 1 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
