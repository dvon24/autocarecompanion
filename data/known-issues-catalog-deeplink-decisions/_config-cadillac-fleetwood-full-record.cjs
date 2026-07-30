const communicationsArchive =
  'https://static.nhtsa.gov/odi/ffdd/tsbs/MFR_COMMS_RECEIVED_1995-1999.zip';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  engines = [],
  category,
  title,
  description,
  solution,
  severity = 'medium',
  source = 'nhtsa-verified',
  symptoms,
  systems,
  dtcCodes = [],
}) {
  return {
    disposition: 'diagnosis-hold',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source diagnosis below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      summary: `Replaced the frozen "${oldTitle}" card with bounded primary-source scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function archived({ oldTitle, idSuffix, years, category, claims, urls, reason }) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [
      {
        type: 'nhtsa',
        label: 'NHTSA Manufacturer Communications Archive',
        url: communicationsArchive,
      },
    ],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported Cadillac Fleetwood ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac Fleetwood population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, drivetrain generation, engine, symptoms and current Cadillac service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        {
          type: 'nhtsa',
          title: 'NHTSA Manufacturer Communications Archive',
          url: communicationsArchive,
        },
      ],
      summary: `Archived the unsupported Cadillac Fleetwood "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac Fleetwood',
  make: 'Cadillac',
  model: 'Fleetwood',
  batchId: 'cadillac-fleetwood-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '27d49bced39f9e0078ea81e9d413de6e448eb373d5919ce3ee61ecfd90b30873',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-fleetwood/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac4_blind:no-blocker',
    edge: 'cadillac4_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-fleetwood-cooling-system-1993',
    'cadillac-fleetwood-lt1-optispark-1994',
    'cadillac-fleetwood-rear-air-spring-1993',
  ],
  records: {
    'cadillac-fleetwood-cooling-system-1993': {
      disposition: 'remove',
      decision:
        'Archive the frozen cooling-system and heater-core aggregation. It combines materially different 1990-1992 front-wheel-drive and 1993-1996 rear-wheel-drive Fleetwood generations and engines without one exact primary-source defect or remedy. Remove all 4 commerce claims and 4 outbound URL occurrences.',
      evidence: [
        {
          type: 'nhtsa',
          label: 'NHTSA Manufacturer Communications Archive',
          url: communicationsArchive,
        },
      ],
      after: {
        years: [1990, 1991, 1992, 1993, 1994, 1995, 1996],
        trims: [],
        engines: [],
        category: 'cooling',
        title:
          'Archived - Unsupported Cadillac Fleetwood Cooling-System Aggregation',
        description:
          'The former card combined generic cooling-system and heater-core failures across two materially different Fleetwood generations. The current primary-source sweep did not establish one defect, DTC or repair across that 1990-1996 population.',
        solution:
          'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, front- or rear-wheel-drive generation, engine, symptoms and current Cadillac service information before cooling-system diagnosis.',
        severity: 'low',
        confidence: 'low',
        source: 'manual',
        symptoms: [],
        affectedSystems: [],
        dtcCodes: [],
        citations: [
          {
            type: 'nhtsa',
            title: 'NHTSA Manufacturer Communications Archive',
            url: communicationsArchive,
          },
        ],
        summary:
          'Archived the unsupported Cadillac Fleetwood cooling-system aggregation and removed 4 commerce claims with 4 URLs.',
      },
    },
    'cadillac-fleetwood-lt1-optispark-1994': archived({
      oldTitle: 'LT1 5.7L Optispark Distributor Failure (1994-1996)',
      idSuffix: 'OptiSpark Distributor Aggregation',
      claims: 2,
      urls: 2,
      years: [1994, 1995, 1996],
      category: 'engine',
      reason:
        'NHTSA communication row 603086 confirms only a bounded engine-miss and poor-driveability communication for 1994-1996 Fleetwood. The current official archive does not identify OptiSpark, an LT1/VIN-P boundary, a distributor mechanism, a diagnostic gate or a repair attachment, so the component-specific stable identity cannot be verified. The ShowMeTheParts fitment check also returned no candidate.',
    }),
    'cadillac-fleetwood-rear-air-spring-1993': exactPath({
      oldTitle: 'Rear Air Leveling System Air Spring and Compressor Failure',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'manual',
          label: '1994 Cadillac Fleetwood Owner Manual - Electronic Level Control',
          url: 'https://experience.gm.com/ownercenter/content/dam/gmownercenter/gmna/dynamic/manuals/1994/cadillac/fleetwood/1994_cadillac_fleetwood_owners.pdf',
        },
      ],
      years: [1994],
      category: 'suspension',
      source: 'manual',
      title:
        'A Seven-Minute Level Ride Warning Calls for Electronic Level-Control Service',
      description:
        'The 1994 Fleetwood owner manual states that when the LEVEL RIDE warning remains on for seven minutes, the Electronic Level Control system may not be working. It directs service but does not identify a failed air spring, compressor or conversion-kit remedy.',
      solution:
        'If the warning remains on for seven minutes, have the 1994 Fleetwood Electronic Level Control system diagnosed. Inspect system operation and current service information before replacing a component. Do not order an air spring, compressor or conversion kit from this card.',
      symptoms: ['LEVEL RIDE warning remains on for seven minutes'],
      systems: ['electronic level control'],
    }),
  },
  expectedTelemetry: {
    claimCount: 8,
    urlCount: 8,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 2,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 2,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-fleetwood-cooling-system-1993': {
      years: [1990, 1991, 1992, 1993, 1994, 1995, 1996],
      status: 'archived',
    },
    'cadillac-fleetwood-lt1-optispark-1994': {
      years: [1994, 1995, 1996],
      status: 'archived',
    },
    'cadillac-fleetwood-rear-air-spring-1993': {
      years: [1994],
      status: 'published',
    },
  };
  if (
    issues.some(
      (issue) =>
        !expected[issue.id] ||
        issue.after.status !== expected[issue.id].status ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expected[issue.id].years),
    )
  ) {
    throw new Error('Cadillac Fleetwood reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
