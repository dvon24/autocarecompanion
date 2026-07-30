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
  evidenceTitle = 'NHTSA Manufacturer Communications Data Corpus',
  evidenceUrl = communicationsCorpus,
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: evidenceUrl }],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported Cadillac DeVille ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac DeVille population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, VIN, engine, symptoms, DTCs and current GM service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        { type: 'nhtsa', title: evidenceTitle, url: evidenceUrl },
      ],
      summary: `Archived the unsupported Cadillac DeVille "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac DeVille',
  make: 'Cadillac',
  model: 'DeVille',
  batchId: 'cadillac-deville-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '9b39c73b1290681aab8254af2ae7e8e0874a4dca1c31f10d2600a8dc7731982a',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-deville/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac3_zero_route_blind:no-blocker',
    edge: 'cadillac3_zero_route_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-deville-blend-door-2000',
    'cadillac-deville-northstar-head-gasket-1994',
    'cadillac-deville-northstar-oil-leak-1996',
    'cadillac-northstar-oil-consumption-1994',
  ],
  records: {
    'cadillac-deville-blend-door-2000': archived({
      oldTitle: 'HVAC Blend Door Actuator Failure',
      idSuffix: 'HVAC Blend-Door Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'interior',
      claims: 2,
      urls: 2,
      reason:
        'The current primary-source sweep did not establish the six-year universal actuator-failure mechanism, symptom bundle or replacement path.',
    }),
    'cadillac-deville-northstar-head-gasket-1994': archived({
      oldTitle: 'Northstar 4.6L V8 Head Bolt/Head Gasket Failure',
      idSuffix: 'Northstar Head-Gasket Aggregation',
      years: [1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005],
      category: 'engine',
      claims: 3,
      urls: 3,
      reason:
        'The frozen record relies on a video rather than exact GM/NHTSA evidence and does not establish a twelve-year model-wide head-bolt failure population, diagnostic gate or universal repair. Recall 04V110 was not substituted because its fuel-rail subject is a different issue and its 1995 DeVille scope is Concours-specific.',
    }),
    'cadillac-deville-northstar-oil-leak-1996': archived({
      oldTitle:
        'Northstar 4.6L Engine Oil Leak (Rear Main Seal and Crankcase)',
      idSuffix: 'Rear-Main-Seal and Crankcase-Leak Aggregation',
      years: [1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005],
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'The current primary-source sweep did not support treating rear-main-seal and crankcase leakage as one model-wide diagnosis or repair.',
      evidenceTitle:
        'GM Bulletin 01-06-01-011O - Engine Oil Consumption and Leak-Diagnosis Guidelines',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244273-0001.pdf',
    }),
    'cadillac-northstar-oil-consumption-1994': {
      disposition: 'diagnosis-hold',
      decision:
        'Replace the frozen universal Northstar failure claim with GM bulletin 01-06-01-011O’s measured oil-consumption diagnostic gate. Remove the 1 commerce claim and 1 outbound URL occurrence.',
      evidence: [
        {
          label:
            'GM Bulletin 01-06-01-011O - Engine Oil Consumption Guidelines',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244273-0001.pdf',
        },
      ],
      after: {
        years: [1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005],
        trims: [],
        engines: ['4.6L Northstar V8'],
        category: 'engine',
        title:
          'High Oil Use Needs a Measured Consumption Test Before Repair (01-06-01-011O)',
        description:
          'GM bulletin 01-06-01-011O covers 2024 and prior GM passenger cars and explains that oil use varies with driving, maintenance, leaks and engine condition. It requires each case to be evaluated and does not establish a universal Northstar defect. Its one-quart-per-2,000-mile guideline applies only under the bulletin’s stated personal-use, under-warranty, maintained and non-aggressive conditions.',
        solution:
          'Measure oil use under consistent conditions before authorizing engine work. Verify the oil level and specification, inspect the oil pan, covers, lines and fittings for external leaks, check the PCV system and document mileage and oil added. Do not begin the normal test before 4,000 miles unless use exceeds one quart per 1,000 miles. If the measured result exceeds the applicable GM guideline, continue with the model-specific Service Information diagnosis; do not order engine parts from this card.',
        severity: 'medium',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Engine oil level drops between services',
          'Frequent engine-oil top-offs',
        ],
        affectedSystems: [
          'engine lubrication system',
          'positive crankcase ventilation system',
          'external engine gaskets and oil lines',
        ],
        dtcCodes: [],
        citations: [
          {
            type: 'tsb',
            title:
              'GM Bulletin 01-06-01-011O - Engine Oil Consumption Guidelines',
            url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244273-0001.pdf',
          },
        ],
        summary:
          'Replaced the unsupported universal Northstar failure claim with GM’s measured oil-consumption diagnostic gate and removed 1 commerce claim with 1 URL.',
      },
    },
  },
  expectedTelemetry: {
    claimCount: 8,
    urlCount: 8,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 3,
    'diagnosis-hold': 1,
  },
  expectedPublished: 1,
  expectedArchived: 3,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  if (
    issues.some((issue) =>
      issue.id === 'cadillac-northstar-oil-consumption-1994'
        ? issue.after.status !== 'published' ||
          JSON.stringify(issue.after.years) !==
            JSON.stringify([1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005])
        : issue.after.status !== 'archived',
    )
  ) {
    throw new Error('Cadillac DeVille reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
