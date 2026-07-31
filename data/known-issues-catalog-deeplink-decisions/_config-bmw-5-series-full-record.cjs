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
  disposition = 'diagnosis-hold',
}) {
  return {
    disposition,
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
      title: `Archived - Unsupported BMW 5 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 5 Series population. ${reason}`,
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
      summary: `Archived the unsupported BMW 5 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 5 Series',
  make: 'BMW',
  model: '5 Series',
  batchId: 'bmw-5-series-full-record-cohort-4-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '2d83228a0f666097ef6eb95321c27dd46623fd8032a78407380a17b6231327fa',
  sourceSnapshotFileHash:
    '13b7d4937bfd0ad2c1e7ea889a13231a9250cfe1095ffda1ca0c23916fdd6422',
  packetFileHash:
    'd31becc908fd1f4defa0a2ad1bfc79aaff49de2e3df072de59fdf3c1ab7cb174',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-5-series/2d83228a0f66/all-0001.json',
  reviewTokens: {
    blind: 'bmw5_blind:no-blocker',
    edge: 'bmw5_edge:no-blocker',
  },
  expectedIds: [
    'bmw-5-series-air-suspension-g30-2017',
    'bmw-5-series-electric-water-pump-2011',
    'bmw-5-series-epb-failure-2004',
    'bmw-5-series-front-thrust-arm-bushing-failure',
    'bmw-5-series-instrument-cluster-pixel-failure',
    'bmw-5-series-n20-timing-chain-2012',
    'bmw-5-series-n54-hpfp-2008',
    'bmw-5-series-n54-wastegate-2008',
    'bmw-5-series-n63-oil-consumption-2011',
    'bmw-5-series-n63-timing-chain-2006',
    'bmw-5-series-oil-leaks-2004',
    'bmw-5-series-water-pump-2004',
    'bmw-5-series-zf-6hp-mechatronic-2004',
  ],
  records: {
    'bmw-5-series-air-suspension-g30-2017': archived({
      oldTitle:
        'Air Suspension Compressor Failure (G30 with Adaptive Air Suspension)',
      idSuffix: 'G30 Air-Suspension Aggregation',
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023],
      category: 'suspension',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card converts a forum landing page into a seven-year, all-corner compressor and air-spring failure claim without identifying an exact chassis, suspension option or matching BMW communication.',
    }),
    'bmw-5-series-electric-water-pump-2011': archived({
      oldTitle: 'Electric Water Pump and Thermostat Failure',
      idSuffix: 'Multi-Engine Electric-Water-Pump Aggregation',
      years: [
        2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
        2022, 2023,
      ],
      category: 'cooling',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card assigns the same pump, DTC set, bleeding procedure and paired thermostat repair to N20, N55, B48, B58 and N63 engines without a matching BMW bulletin. Recall 24V608 is a distinct N20/N26 connector-fire identity preserved only as a proposal.',
    }),
    'bmw-5-series-epb-failure-2004': archived({
      oldTitle: 'Electronic Parking Brake (EPB) Actuator Failure',
      idSuffix: 'Twenty-Year Parking-Brake Aggregation',
      years: [
        2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
        2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
      ],
      category: 'brakes',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card claims one rear-caliper actuator design across multiple generations, relies on a fabricated video URL and prescribes paired actuator replacement and unverified software relief without a BMW-defined population.',
    }),
    'bmw-5-series-front-thrust-arm-bushing-failure': archived({
      oldTitle: 'Front Thrust Arm (Control Arm) Bushing Failure',
      idSuffix: 'E39 Thrust-Arm-Bushing Aggregation',
      years: [1996, 1997, 1998, 1999],
      category: 'suspension',
      claims: 1,
      urls: 3,
      reason:
        'The frozen card relies on independent repair articles, asserts a fixed failure interval and mandatory paired replacement/alignment, and does not provide a BMW communication defining the four-year population or remedy.',
    }),
    'bmw-5-series-instrument-cluster-pixel-failure': archived({
      oldTitle: 'Instrument Cluster Pixel Failure (Dead LCD)',
      idSuffix: 'E39 Instrument-Cluster-Pixel Aggregation',
      years: [1996, 1997, 1998, 1999],
      category: 'electrical',
      claims: 0,
      urls: 0,
      reason:
        'The frozen card labels the condition near-universal, specifies internal failure cause and endorses mail-in vendors and a DIY heated-press procedure without an exact BMW bulletin for the seeded scope.',
    }),
    'bmw-5-series-n20-timing-chain-2012': exactPath({
      oldTitle: 'N20 Timing Chain Guide Failure (Catastrophic) - F10 528i',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 11 03 17 - N20/N26 Timing-Chain and Oil-Pump Drive-Chain Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203331-9999.pdf',
        },
      ],
      years: [2012, 2013, 2014, 2015],
      engines: ['N20'],
      category: 'engine',
      title: '528i N20 Timing-Chain or Oil-Pump-Chain Diagnosis',
      description:
        'BMW SIB 11 03 17 identifies F10 528i and 528i xDrive sedans with the N20 engine produced from September 1, 2011 through February 28, 2015. The bulletin covers defects in the timing-chain and oil-pump drive-chain modules; it does not say every 528i is defective or prescribe mileage-based preventive replacement.',
      solution:
        'Confirm the exact engine, production date and VIN eligibility, then have a BMW-qualified technician follow the current timing-chain and oil-pump-chain test plans. Replace a module only when the approved test result requires it. The historical seven-year/70,000-mile extension is not a recall or current coverage promise. ShowMeTheParts resolved the 2014 528i ENGINE COMPONENTS fitment but returned no timing-chain candidate, so no commerce link is approved.',
      symptoms: [
        'Whining from the lower engine area that rises with engine speed',
        'Timing-chain or oil-pump-chain test result is not OK',
      ],
      systems: ['timing-chain drive', 'oil-pump drive chain'],
    }),
    'bmw-5-series-n54-hpfp-2008': exactPath({
      oldTitle:
        'N54 High Pressure Fuel Pump (HPFP) Failure (Safety Critical)',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Dealer Message Filed with NHTSA - N54 High-Pressure Fuel-Pump Voluntary Emissions Recall',
          url: 'https://static.nhtsa.gov/odi/rcl/2010/RCMN-10V518-3456.pdf',
        },
      ],
      years: [2008, 2009, 2010],
      engines: ['N54'],
      category: 'fuel',
      title: '2008-2010 535i N54 High-Pressure Fuel-Pump Recall Path',
      description:
        'BMW notified dealers that certain model-year 2008-2010 535i vehicles with the N54 twin-turbo engine could experience high-pressure fuel-pump failure. BMW listed long starting times, a Service Engine Soon light, reduced engine performance and an Engine Malfunction message; the notice did not include later F10 535i, 540i or M550i models.',
      solution:
        'Check the VIN and campaign/service history with BMW, then diagnose measured low- and high-pressure fuel delivery before replacement. The historical action called for a software update and/or pump replacement based on individual service history, not automatic replacement from symptoms alone. ShowMeTheParts returned one exact 2009 535i high-pressure-pump fitment candidate, but catalog fitment does not establish campaign eligibility, defect identity or remedy, so no commerce link is approved.',
      symptoms: [
        'Long engine-starting time',
        'Service Engine Soon light',
        'Reduced engine performance or safe mode',
        'Engine Malfunction message',
      ],
      systems: ['high-pressure fuel system'],
      source: 'recall-related',
      disposition: 'recall-dealer',
    }),
    'bmw-5-series-n54-wastegate-2008': exactPath({
      oldTitle: 'N54 Turbo Wastegate Rattle & Turbo Failure',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 02 12 - N54 Turbocharger Wastegate Emissions Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10045279-7898.pdf',
        },
      ],
      years: [2008, 2009, 2010],
      engines: ['N54'],
      category: 'engine',
      title: '535i N54 Wastegate Clanking Requires Turbocharger Diagnosis',
      description:
        'BMW SIB 01 02 12 applies to model-year 2008-2010 E60/E61 535i vehicles, including xDrive, and addresses a turbocharger failure caused by a wastegate defect. BMW explicitly states that a slight mechanical-wastegate rattle is normal and is not a failure; a repeated clanking complaint under the bulletin conditions requires the prescribed diagnosis.',
      solution:
        'Confirm the exact N54 vehicle and modification history, distinguish normal slight rattle from the defined clanking condition, and follow current BMW diagnostic and repair instructions. The historical eight-year/82,000-mile emissions extension is not a current coverage promise. ShowMeTheParts returned four exact-fitment turbo oil/coolant-line candidates but no wastegate or turbocharger repair candidate, so no commerce link is approved.',
      severity: 'medium',
      symptoms: [
        'Repeated clanking during deceleration from approximately 3,500 rpm',
        'Repeated clanking during a heavy accelerator application without drive engaged',
        'BMW diagnosis confirms turbocharger failure caused by a wastegate defect',
      ],
      systems: ['turbocharger wastegate'],
    }),
    'bmw-5-series-n63-oil-consumption-2011': exactPath({
      oldTitle: 'N63 Hot-Vee Engine Excessive Oil Consumption',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 21 18 - N63 Oil-Consumption and Battery-Drain Settlement Information',
          url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10145279-9999.pdf',
        },
        {
          type: 'tsb',
          label: 'BMW SIB 11 06 14 - N63 Customer Care Package',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10148161-9999.pdf',
        },
      ],
      years: [2010, 2011, 2012, 2013],
      engines: ['N63'],
      category: 'engine',
      title: 'N63 Low-Oil Warning Requires 550i Oil-Consumption Testing',
      description:
        'BMW SIB 01 21 18 identifies certain U.S.-specification model-year 2010-2013 F10 550i and 550i xDrive N63 vehicles in an oil-consumption and battery-drain settlement. The litigation alleged excess oil use and possible engine damage, while BMW denied wrongdoing; the bulletin does not support a universal consumption rate or one fixed failed part.',
      solution:
        'Confirm the VIN and service history, record oil additions and service intervals, and have a BMW-qualified technician perform the current oil-consumption test and applicable diagnosis. Historical settlement benefits and the N63 Customer Care Package must not be presented as current coverage. The official material describes multiple checks and condition-dependent repairs, so no single catalog part or retail link is approved.',
      symptoms: [
        'Low-oil warning before the scheduled oil service',
        'Repeated need to add engine oil between services',
        'BMW oil-consumption test does not pass',
      ],
      systems: ['engine lubrication', 'N63 crankcase and induction systems'],
    }),
    'bmw-5-series-n63-timing-chain-2006': exactPath({
      oldTitle:
        'N63 V8 Timing Chain Failure & Valve Stem Seals (Catastrophic)',
      claims: 4,
      urls: 6,
      evidence: [
        {
          type: 'tsb',
          label: 'BMW SIB 11 16 14 - N63 Engine Timing-Chain Check',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10147127-9999.pdf',
        },
      ],
      years: [2010, 2011, 2012, 2013],
      engines: ['N63'],
      category: 'engine',
      title: 'N63 550i Timing-Chain Wear Check',
      description:
        'BMW SIB 11 16 14 applies to F10 5 Series sedans with the N63 engine produced from March 2010 through July 2013. It defines an ISTA timing-chain elongation test intended to detect wear and provide a repair path; BMW states that this N63 timing-chain check and Customer Care Package are not recalls or mandatory technical campaigns.',
      solution:
        'Confirm the N63 engine, production date and VIN history, resolve stored VANOS or camshaft-position faults first, and have a BMW-qualified technician run the prescribed timing-chain test. Replace both chains only if the approved test reports that the chain is not OK. ShowMeTheParts resolved the exact 2012 550i ENGINE COMPONENTS fitment but returned no timing-chain candidate, so no commerce link is approved.',
      symptoms: [
        'Stored VANOS or camshaft-position faults require diagnosis before the chain test',
        'BMW timing-chain elongation test reports not OK',
      ],
      systems: ['timing-chain drive', 'valve timing'],
    }),
    'bmw-5-series-oil-leaks-2004': archived({
      oldTitle: 'Valve Cover Gasket & Oil Filter Housing Gasket Leaks',
      idSuffix: 'Twenty-Year Multi-Engine Oil-Leak Aggregation',
      years: [
        2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
        2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
      ],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card treats two unrelated leak locations as inevitable across every engine and generation, assigns universal mileage and repair pricing, and relies on a 3 Series forum thread rather than an exact BMW 5 Series bulletin.',
    }),
    'bmw-5-series-water-pump-2004': archived({
      oldTitle: 'Electric Water Pump Failure (All Engines)',
      idSuffix: 'Duplicate All-Engine Water-Pump Aggregation',
      years: [
        2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
        2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
      ],
      category: 'cooling',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card duplicates the other water-pump aggregation, incorrectly claims every listed engine and generation shares a near-universal electric-pump failure, and prescribes fixed preventive replacement without a matching BMW communication.',
    }),
    'bmw-5-series-zf-6hp-mechatronic-2004': archived({
      oldTitle:
        'ZF 6HP Transmission Mechatronic Sleeve & Valve Body Failure',
      idSuffix: 'ZF 6HP Mechatronic Aggregation',
      years: [
        2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
      ],
      category: 'transmission',
      claims: 5,
      urls: 7,
      reason:
        'The frozen card combines sealing sleeves, adapter seals, solenoids, valve-body wear and fluid policy across transmissions and generations, asserts near-universal failure and preventive-effect percentages, and cites only a forum homepage.',
    }),
  },
  expectedTelemetry: {
    claimCount: 31,
    urlCount: 55,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 8,
    'diagnosis-hold': 4,
    'recall-dealer': 1,
  },
  expectedPublished: 5,
  expectedArchived: 8,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-5-series-n20-n26-water-pump-connector-recall-2012',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V608-8924.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-5-series-pcv-heater-fire-recall-2006',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2022/RCRIT-22V119-1582.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-5-series-in-tank-fuel-pump-recall-2011',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2016/RCRIT-16V746-2071.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-5-series-e60-e61-water-ingress-settlement-2007',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152289-9999.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-5-series-n20-n26-water-pump-connector-recall-2012::https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V608-8924.pdf',
    'bmw-5-series-pcv-heater-fire-recall-2006::https://static.nhtsa.gov/odi/rcl/2022/RCRIT-22V119-1582.pdf',
    'bmw-5-series-in-tank-fuel-pump-recall-2011::https://static.nhtsa.gov/odi/rcl/2016/RCRIT-16V746-2071.pdf',
    'bmw-5-series-e60-e61-water-ingress-settlement-2007::https://static.nhtsa.gov/odi/tsbs/2018/MC-10152289-9999.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-5-series-n20-timing-chain-2012': {
      years: [2012, 2013, 2014, 2015],
      engines: ['N20'],
    },
    'bmw-5-series-n54-hpfp-2008': {
      years: [2008, 2009, 2010],
      engines: ['N54'],
    },
    'bmw-5-series-n54-wastegate-2008': {
      years: [2008, 2009, 2010],
      engines: ['N54'],
    },
    'bmw-5-series-n63-oil-consumption-2011': {
      years: [2010, 2011, 2012, 2013],
      engines: ['N63'],
    },
    'bmw-5-series-n63-timing-chain-2006': {
      years: [2010, 2011, 2012, 2013],
      engines: ['N63'],
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
    throw new Error('BMW 5 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
