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
    blind: 'cadillac3_followup_blind:no-blocker',
    edge: 'cadillac3_followup_edge:no-blocker',
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
    'cadillac-northstar-oil-consumption-1994': archived({
      oldTitle: 'Northstar V8 Excessive Oil Consumption',
      idSuffix: 'Excessive Oil-Consumption Aggregation',
      years: [1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005],
      category: 'engine',
      claims: 1,
      urls: 1,
      reason:
        'GM bulletin 01-06-01-011O requires per-vehicle measurement, maintenance and leak checks and does not establish the frozen universal Northstar failure mechanism or one repair.',
      evidenceTitle:
        'GM Bulletin 01-06-01-011O - Engine Oil Consumption Guidelines',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244273-0001.pdf',
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
    remove: 4,
  },
  expectedPublished: 0,
  expectedArchived: 4,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  if (issues.some((issue) => issue.after.status !== 'archived')) {
    throw new Error('Cadillac DeVille reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
