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
      source: 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
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
      title: `Archived - Unsupported BMW 7 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 7 Series population. ${reason}`,
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
      summary: `Archived the unsupported BMW 7 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 7 Series',
  make: 'BMW',
  model: '7 Series',
  batchId: 'bmw-7-series-full-record-cohort-6-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    'af06cc3cecbc762221db5517e16d9d73262efcd8772397e35bba45e456cb3924',
  sourceSnapshotFileHash:
    '24dff8ca0754624acc2b6cef0f59897525ffb4685874271090183636053315ae',
  packetFileHash:
    '18b3afab40fccd99f82a755565abf614a42f232e19a08af13ef13eb2a85cf209',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-7-series/af06cc3cecbc/all-0001.json',
  reviewTokens: {
    blind: 'bmw7_blind:no-blocker',
    edge: 'bmw7_edge:no-blocker',
  },
  expectedIds: [
    'bmw-7-series-air-suspension-compressor-2009',
    'bmw-7-series-idrive-system-failures-2009',
    'bmw-7-series-panoramic-roof-2016',
    'bmw-7series-air-suspension-2002',
    'bmw-7series-electrical-e65-2002',
    'bmw-7series-hpfp-2009',
    'bmw-7series-n63-turbo-2009',
    'bmw-7series-n63-valvetronic-2009',
  ],
  records: {
    'bmw-7-series-air-suspension-compressor-2009': exactPath({
      oldTitle: 'Air Suspension Compressor and Air Spring Failure',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 05 22 - G11/G12 Front and Rear Air-Suspension Strut Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11030332-0001.pdf',
        },
      ],
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
      engines: [],
      category: 'suspension',
      title: 'G11/G12 Air-Suspension Strut Diagnosis',
      description:
        'BMW SIB 01 05 22 identifies specified U.S.-registered G11/G12 7 Series variants from model years 2016-2022 for a component-specific front and rear air-suspension-strut limited warranty extension. BMW explicitly excludes other air-suspension components and issues; the bulletin does not support an all-generation compressor, relay, dryer or four-strut failure claim.',
      solution:
        'Confirm the exact model, production date, VIN and current WVI vehicle comments, then diagnose the specific sagging corner, ride-height complaint or suspension warning with BMW procedures. Replace only a strut assembly that is confirmed defective and eligible under the current instructions. Do not present the historical eight-year/80,000-mile extension as a universal or current coverage promise. ShowMeTheParts resolved exact 2018 740i and 740i xDrive suspension categories but returned no air-spring candidate, so no commerce link is approved.',
      symptoms: [
        'One corner sits low after the vehicle is parked',
        'Ride-height or chassis warning requires fault-guided diagnosis',
        'A front or rear air-suspension strut is confirmed defective',
      ],
      systems: ['front air-suspension struts', 'rear air-suspension struts'],
    }),
    'bmw-7-series-idrive-system-failures-2009': archived({
      oldTitle: 'iDrive Head Unit and CIC/NBT Module Failures',
      idSuffix: 'Cross-Generation iDrive Aggregation',
      years: [
        2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
        2020, 2021, 2022,
      ],
      category: 'electrical',
      claims: 3,
      urls: 3,
      reason:
        'The frozen card combines CIC and NBT generations, assigns black screens, reboots, navigation and Bluetooth faults to hard-drive or eMMC failure, and promotes SSD, reflow and rebuilt-module repairs without an exact BMW-defined population or fault path.',
    }),
    'bmw-7-series-panoramic-roof-2016': archived({
      oldTitle: 'Panoramic Glass Roof Cracking and Drain Blockage',
      idSuffix: 'Panoramic-Roof Aggregation',
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'other',
      claims: 2,
      urls: 2,
      reason:
        'The frozen card combines alleged spontaneous glass cracking, frame stress, four drain obstructions, electronic damage and annual preventive cleaning across G11 and G70 without an exact 7 Series BMW communication.',
    }),
    'bmw-7series-air-suspension-2002': archived({
      oldTitle: 'Air Suspension Compressor & Strut Failure - All Generations',
      idSuffix: 'Duplicate All-Generation Air-Suspension Aggregation',
      years: [
        2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012,
        2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
      ],
      category: 'suspension',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card duplicates the other suspension aggregation, asserts one compressor and four-strut repair across E65/E66, F01/F02 and G11/G12, cites a fabricated video identifier and recommends a coil-spring conversion without BMW support.',
    }),
    'bmw-7series-electrical-e65-2002': archived({
      oldTitle: 'Widespread Electrical Issues - E65/E66 745i/750i/760i',
      idSuffix: 'E65/E66 Electrical-Gremlin Aggregation',
      years: [2002, 2003, 2004, 2005, 2006, 2007, 2008],
      category: 'electrical',
      claims: 7,
      urls: 7,
      reason:
        'The frozen card labels an entire generation unreliable, combines iDrive, body modules, warning lamps, windows, seats and parasitic draw, supplies generic prices and ownership advice, and has no exact fault code, component population or BMW diagnostic source.',
    }),
    'bmw-7series-hpfp-2009': archived({
      oldTitle: 'High-Pressure Fuel Pump Failure - F01/F02 750i/750Li (N63)',
      idSuffix: 'N63 High-Pressure-Fuel-Pump Aggregation',
      years: [2009, 2010, 2011, 2012, 2013, 2014, 2015],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card asserts two-pump paired failure, fixed pressure and mileage, metal contamination, Bosch-only replacement and Customer Care Package coverage, but the official N63 package addresses injectors and other inspected components rather than this universal HPFP remedy.',
    }),
    'bmw-7series-n63-turbo-2009': exactPath({
      oldTitle: 'N63 Turbocharger Failure - F01/F02 750i/750Li',
      claims: 4,
      urls: 6,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 01 22 - N63TU1 Oil-Consumption Diagnosis and Related Repair',
          url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10214246-9999.pdf',
        },
      ],
      years: [2013, 2014, 2015],
      engines: ['N63TU1'],
      category: 'engine',
      title: 'N63TU1 750i Oil-Consumption and Turbo-Leak Diagnosis',
      description:
        'BMW SIB 01 01 22 identifies specified U.S.-specification F01/F02 750i, 750Li and ALPINA B7 variants from model years 2013-2015 with the N63TU1 engine for an oil-consumption diagnosis and related-repair settlement path. The lawsuit alleged excessive oil use and BMW denied the allegations. BMW permits turbocharger replacement only when the prescribed inspection confirms leakage; the bulletin does not establish age-, heat- or mileage-based turbo failure.',
      solution:
        'Confirm the exact chassis, N63TU1 engine, production date, engine serial number, VIN and current eligibility, then follow BMW electronic oil-level measurement and leak-inspection procedures. Repair only the component supported by the documented test result; replace turbochargers only when leakage is confirmed under the current instructions. Do not promise historical settlement coverage. ShowMeTheParts returned six exact 2014 750i/750i xDrive turbo oil-return-line fitments, but catalog fitment does not prove a leak, oil-consumption cause or repair role, so no commerce link is approved.',
      symptoms: [
        'Low-oil warning before the scheduled oil service',
        'Repeated need to add engine oil between services',
        'BMW inspection confirms a leaking turbocharger or turbo oil-return component',
      ],
      systems: ['engine lubrication', 'turbocharger oil-return system'],
    }),
    'bmw-7series-n63-valvetronic-2009': archived({
      oldTitle: 'N63 Valvetronic Motor Failure - F01/F02 750i/750Li',
      idSuffix: 'N63 Valvetronic-Motor Aggregation',
      years: [2009, 2010, 2011, 2012, 2013, 2014, 2015],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card incorrectly treats original N63 and N63TU1 hardware as one seven-year population, asserts paired servomotor wear and carbon buildup, and recommends preventive replacement without exact engine scope, DTCs or a matching BMW bulletin.',
    }),
  },
  expectedTelemetry: {
    claimCount: 25,
    urlCount: 35,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 6,
    'diagnosis-hold': 2,
  },
  expectedPublished: 2,
  expectedArchived: 6,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-7-series-early-n63-timing-chain-check-2009',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2015/MC-10147127-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-7-series-n63-customer-care-package-2009',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11016414-0001.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-7-series-g11-g12-passenger-seat-mat-warranty-2016',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11018552-0001.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-7-series-g70-valvetronic-software-delivery-stop-2023',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253342-0002.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-7-series-early-n63-timing-chain-check-2009::https://static.nhtsa.gov/odi/tsbs/2015/MC-10147127-9999.pdf',
    'bmw-7-series-n63-customer-care-package-2009::https://static.nhtsa.gov/odi/tsbs/2025/MC-11016414-0001.pdf',
    'bmw-7-series-g11-g12-passenger-seat-mat-warranty-2016::https://static.nhtsa.gov/odi/tsbs/2025/MC-11018552-0001.pdf',
    'bmw-7-series-g70-valvetronic-software-delivery-stop-2023::https://static.nhtsa.gov/odi/tsbs/2024/MC-10253342-0002.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-7-series-air-suspension-compressor-2009': {
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
      engines: [],
    },
    'bmw-7series-n63-turbo-2009': {
      years: [2013, 2014, 2015],
      engines: ['N63TU1'],
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
    throw new Error('BMW 7 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
