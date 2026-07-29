const api = (campaign) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;

function replacement({
  disposition = 'recall-dealer',
  oldTitle,
  claims,
  urls,
  evidenceTitle,
  evidenceUrl,
  years,
  engines = [],
  category,
  title,
  description,
  solution,
  severity = 'high',
  symptoms,
  systems,
}) {
  return {
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: evidenceUrl }],
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
      citations: [{ type: 'recall', title: evidenceTitle, url: evidenceUrl }],
      summary: `Replaced the frozen "${oldTitle}" card with an exact NHTSA campaign scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function archived({ oldTitle, idSuffix, years, category, claims, urls }) {
  const evidenceUrl =
    'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Cadillac&model=Allante&modelYear=1993';
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. The primary-source audit did not establish its complete model-year, failure, remedy and commerce bundle for the Cadillac Allante. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [
      {
        label:
          'Official NHTSA Allante campaign inventory establishes bounded campaigns but not this broad aggregation',
        url: evidenceUrl,
      },
    ],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported Cadillac Allante ${idSuffix} Aggregation`,
      description: `The former card combined "${oldTitle}" across a broad Cadillac Allante range without a current GM or regulator primary source for the complete public claim.`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, powertrain, symptoms and service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        {
          type: 'nhtsa',
          title: 'NHTSA Cadillac Allante Campaign Inventory',
          url: evidenceUrl,
        },
      ],
      summary: `Archived the unsupported Cadillac Allante "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac Allante',
  make: 'Cadillac',
  model: 'Allante',
  batchId: 'cadillac-allante-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'e725351200e1163fa6a785b0c4621023ecde4f3ddbe156eeea66970ce7ec729f',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-allante/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'allante_blind_review:no-blocker',
    edge: 'allante_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-allante-digital-dash-failure-1989',
    'cadillac-allante-hg-4100-1987',
    'cadillac-allante-northstar-head-gasket-1993',
    'cadillac-allante-convertible-top-1987',
    'cadillac-allante-hardtop-hydraulic-1989',
  ],
  records: {
    'cadillac-allante-digital-dash-failure-1989': replacement({
      oldTitle: 'Digital Dashboard Display Pixel Failure',
      claims: 1,
      urls: 1,
      evidenceTitle: 'Cadillac Allante Fuel-Cap Recall - NHTSA 88V072',
      evidenceUrl: api('88V072000'),
      years: [1988],
      category: 'fuel',
      title: 'Fuel-Cap Pressure-Relief Valve May Stick Open (Recall 88V072)',
      description:
        'On certain 1988 Allante vehicles, the pressure-relief valve in the fuel cap can stick during the turn-to-vent function and remain open, allowing fuel spillage during or after a collision and creating a fire risk.',
      solution:
        'Check the VIN and campaign history with Cadillac or NHTSA. The recall remedy is installation of a new fuel cap.',
      symptoms: [
        'Open safety recall',
        'Fuel-cap pressure-relief valve may remain open',
      ],
      systems: ['fuel filler cap', 'fuel-tank venting'],
    }),
    'cadillac-allante-hg-4100-1987': replacement({
      oldTitle: '4.1L/4.5L HT Engine Head Gasket and Bolt Failure',
      claims: 2,
      urls: 2,
      evidenceTitle: 'Cadillac Allante Oil-Cooler Hose Recall - NHTSA 94V158',
      evidenceUrl: api('94V158000'),
      years: [1993],
      engines: ['4.6L V8'],
      category: 'engine',
      title:
        'A/C Compressor Clutch Can Chafe Oil-Cooler Hose and Cause Fire (Recall 94V158)',
      description:
        'On certain 1993 Allante vehicles with the 4.6L engine, the air-conditioning compressor clutch can contact the auxiliary engine-oil-cooler outlet hose. The hose can wear through, leak oil onto the hot exhaust, and cause an engine-compartment fire.',
      solution:
        'Check the VIN and recall completion history. Cadillac dealers install the specified tie strap to retain the oil-cooler hoses and provide clearance from the compressor clutch.',
      symptoms: [
        'Open safety recall',
        'Engine-oil leak near the lower radiator area',
      ],
      systems: [
        'auxiliary engine-oil-cooler outlet hose',
        'air-conditioning compressor clutch',
      ],
    }),
    'cadillac-allante-northstar-head-gasket-1993': archived({
      oldTitle: '4.6L Northstar V8 Head Gasket Failure (1993)',
      idSuffix: 'Northstar Head-Gasket Failure',
      years: [1993],
      category: 'engine',
      claims: 2,
      urls: 2,
    }),
    'cadillac-allante-convertible-top-1987': archived({
      oldTitle: 'Power Convertible Top Hydraulic System Failure',
      idSuffix: 'Power Convertible-Top Hydraulic Failure',
      years: [1987, 1988, 1989, 1990, 1991, 1992, 1993],
      category: 'body',
      claims: 3,
      urls: 3,
    }),
    'cadillac-allante-hardtop-hydraulic-1989': archived({
      oldTitle: 'Convertible Top Hydraulic Cylinder Leaks',
      idSuffix: 'Convertible-Top Cylinder Leak',
      years: [1989, 1990, 1991, 1992, 1993],
      category: 'body',
      claims: 2,
      urls: 2,
    }),
  },
  expectedTelemetry: {
    claimCount: 10,
    urlCount: 10,
    claimClickCount: 4,
    recordClickCount: 4,
    priorityClickCount: 4,
  },
  expectedDispositionCounts: { 'recall-dealer': 2, remove: 3 },
  expectedPublished: 2,
  expectedArchived: 3,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-allante-digital-dash-failure-1989': {
      years: [1988],
      status: 'published',
    },
    'cadillac-allante-hg-4100-1987': {
      years: [1993],
      status: 'published',
    },
    'cadillac-allante-northstar-head-gasket-1993': {
      years: [1993],
      status: 'archived',
    },
    'cadillac-allante-convertible-top-1987': {
      years: [1987, 1988, 1989, 1990, 1991, 1992, 1993],
      status: 'archived',
    },
    'cadillac-allante-hardtop-hydraulic-1989': {
      years: [1989, 1990, 1991, 1992, 1993],
      status: 'archived',
    },
  };
  if (
    issues.some(
      (issue) =>
        !expected[issue.id] ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expected[issue.id].years) ||
        issue.after.status !== expected[issue.id].status,
    )
  ) {
    throw new Error('Cadillac Allante reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
