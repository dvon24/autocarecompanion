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
  engines = [],
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
      title: `Archived - Unsupported BMW 6 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 6 Series population. ${reason}`,
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
      summary: `Archived the unsupported BMW 6 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 6 Series',
  make: 'BMW',
  model: '6 Series',
  batchId: 'bmw-6-series-full-record-cohort-5-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '0e8143b2fa2e1987ec9088feba01ac2bb014604fe787342263d1de37b6271b9f',
  sourceSnapshotFileHash:
    '018615d1cd39f58d707f133c92f15eaeab4eeafe6ae3576a0924cf9f9395cf69',
  packetFileHash:
    '8535e7a57ddb8e9b6b50fbacd07393576ce5085c38002e383a11134927c5119a',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-6-series/0e8143b2fa2e/all-0001.json',
  reviewTokens: {
    blind: 'bmw6_blind:no-blocker',
    edge: 'bmw6_edge:no-blocker',
  },
  expectedIds: [
    'bmw-6-series-adaptive-headlight-2012',
    'bmw-6-series-n63-valve-stem-seals-2012',
    'bmw-6series-convertible-top-2004',
    'bmw-6series-n62-coolant-pipe-2004',
    'bmw-6series-n62-valve-stem-seals-2004',
    'bmw-6series-n63-timing-chain-2012',
    'bmw-6series-smg-pump-2004',
  ],
  records: {
    'bmw-6-series-adaptive-headlight-2012': archived({
      oldTitle: 'Adaptive Headlight Module and Stepper Motor Failure',
      idSuffix: 'Adaptive-Headlight Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
      category: 'electrical',
      claims: 1,
      urls: 1,
      reason:
        'The frozen card converts a forum landing page into a seven-year stepper-motor and control-module failure population and prescribes component replacement and coding without an exact BMW communication.',
    }),
    'bmw-6-series-n63-valve-stem-seals-2012': exactPath({
      oldTitle: 'N63 Valve Stem Seal Degradation and Oil Burning',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 01 22 - N63TU1 Engine Oil-Consumption Settlement and Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10230716-9999.pdf',
        },
      ],
      years: [2013, 2014, 2015, 2016, 2017, 2018],
      engines: ['N63TU1'],
      category: 'engine',
      title: 'N63TU1 650i Oil Consumption Requires BMW Diagnosis',
      description:
        'BMW SIB 01 01 22 identifies U.S.-specification F12 650i and 650i xDrive vehicles from model years 2013-2018 and F13 650i and 650i xDrive vehicles from model years 2013-2017 with the N63TU1 engine, subject to the production and class definitions in the bulletin. The settlement path concerns alleged excessive oil consumption; it does not establish valve-stem seals as the cause in every vehicle.',
      solution:
        'Confirm the exact chassis, engine, production date, VIN and service history, document oil additions, and have a BMW-qualified technician perform the current oil-consumption measurement and applicable test plans. Do not assume historical settlement eligibility or replace valve-stem seals without diagnosis. ShowMeTheParts returned one exact-fit 2015 650i valve-stem-oil-seal set, but catalog fitment does not establish defect identity or the required repair, so no commerce link is approved.',
      symptoms: [
        'Low-oil warning before the scheduled oil service',
        'Repeated need to add engine oil between services',
        'BMW oil-consumption measurement does not pass',
      ],
      systems: ['engine lubrication', 'N63TU1 crankcase and induction systems'],
    }),
    'bmw-6series-convertible-top-2004': archived({
      oldTitle: 'Convertible Top Hydraulic Pump & Cylinder Failure (E64/F12)',
      idSuffix: 'Cross-Generation Convertible-Top Aggregation',
      years: [
        2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
        2015, 2016, 2017, 2018,
      ],
      category: 'body',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines E64 and F12 hydraulic systems, attributes multiple possible causes to every slow or interrupted top, and endorses one rebuilder with price, warranty and superiority claims without an exact BMW communication.',
    }),
    'bmw-6series-n62-coolant-pipe-2004': archived({
      oldTitle: 'N62 Coolant Transfer Pipe Leak (Engine Valley Pipe)',
      idSuffix: 'N62 Coolant-Transfer-Pipe Aggregation',
      years: [2004, 2005, 2006, 2007, 2008, 2009, 2010],
      engines: ['N62'],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card asserts a fixed early-failure interval and consequential damage across N62 645Ci and 650i vehicles, then promotes a branded repair kit as a universal gold-standard remedy without a BMW-defined population or diagnostic path.',
    }),
    'bmw-6series-n62-valve-stem-seals-2004': archived({
      oldTitle: 'N62 Valve Stem Seal Failure & Oil Consumption',
      idSuffix: 'N62 Valve-Stem-Seal Aggregation',
      years: [2004, 2005, 2006, 2007, 2008, 2009, 2010],
      engines: ['N62'],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card assigns blue smoke and oil consumption to valve-stem seals across the full N62 span, prescribes a 32-seal repair and cites a fabricated video identifier without an exact BMW bulletin or differential diagnosis.',
    }),
    'bmw-6series-n63-timing-chain-2012': exactPath({
      oldTitle: 'N63 Timing Chain Stretch & Guide Failure',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label: 'BMW SIB 11 16 14 - N63 Engine Timing-Chain Check',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10147127-9999.pdf',
        },
      ],
      years: [2012, 2013],
      engines: ['N63'],
      category: 'engine',
      title: 'Early N63 650i Timing-Chain Wear Check',
      description:
        'BMW SIB 11 16 14 includes F12 6 Series convertibles with the N63 engine produced from March 2011 through July 2012 and F13 6 Series coupes with the N63 engine produced from July 2011 through July 2012. It defines an ISTA timing-chain elongation test; BMW states that the check and related Customer Care Package are not recalls or mandatory technical campaigns.',
      solution:
        'Confirm the N63 engine, chassis, production date and VIN history, resolve stored VANOS or camshaft-position faults first, and have a BMW-qualified technician run the prescribed timing-chain test. Replace both chains only if the approved test reports that the chain is not OK. ShowMeTheParts resolved the exact 2012 650i ENGINE COMPONENTS fitment but returned no timing-chain candidate, so no commerce link is approved.',
      symptoms: [
        'Stored VANOS or camshaft-position faults require diagnosis before the chain test',
        'BMW timing-chain elongation test reports not OK',
      ],
      systems: ['timing-chain drive', 'valve timing'],
    }),
    'bmw-6series-smg-pump-2004': archived({
      oldTitle: 'SMG Hydraulic Pump & Actuator Failure (E63/E64)',
      idSuffix: 'SMG Hydraulic-Pump Aggregation',
      years: [2004, 2005, 2006, 2007, 2008, 2009, 2010],
      category: 'transmission',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card applies one SMG hydraulic-pump and actuator failure narrative to the full 6 Series range, invents a failure percentage and promotes used and rebuilt parts without identifying transmission option, exact applicability or BMW diagnostic instructions.',
    }),
  },
  expectedTelemetry: {
    claimCount: 16,
    urlCount: 28,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'diagnosis-hold': 2,
  },
  expectedPublished: 2,
  expectedArchived: 5,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-6-series-n55-electric-coolant-pump-settlement-2012',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2021/MC-10198894-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-6-series-f12-cas-deck-lid-service-action-2012',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2013/MC-10150178-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-6-series-f12-convertible-top-trim-service-action-2012',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2017/MC-10146681-9999.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-6-series-n55-electric-coolant-pump-settlement-2012::https://static.nhtsa.gov/odi/tsbs/2021/MC-10198894-9999.pdf',
    'bmw-6-series-f12-cas-deck-lid-service-action-2012::https://static.nhtsa.gov/odi/tsbs/2013/MC-10150178-9999.pdf',
    'bmw-6-series-f12-convertible-top-trim-service-action-2012::https://static.nhtsa.gov/odi/tsbs/2017/MC-10146681-9999.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-6-series-n63-valve-stem-seals-2012': {
      years: [2013, 2014, 2015, 2016, 2017, 2018],
      engines: ['N63TU1'],
    },
    'bmw-6series-n63-timing-chain-2012': {
      years: [2012, 2013],
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
    throw new Error('BMW 6 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
