const api = (campaign) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
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
      title: `Archived - Unsupported Cadillac DTS ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac DTS population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, VIN, equipment, symptoms, DTCs and current GM service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        { type: 'nhtsa', title: evidenceTitle, url: evidenceUrl },
      ],
      summary: `Archived the unsupported Cadillac DTS "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac DTS',
  make: 'Cadillac',
  model: 'DTS',
  batchId: 'cadillac-dts-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '100bf4cae6371ba32fc64799a1205812073e75c76c7e8ba45117c19b85cd89b6',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-dts/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac3_followup_blind:no-blocker',
    edge: 'cadillac3_followup_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-dts-northstar-head-bolt-pull-2000',
    'cadillac-dts-northstar-head-gasket-2006',
    'cadillac-dts-northstar-oil-leak-2006',
    'cadillac-dts-rear-air-suspension-2006',
    'cadillac-dts-steering-column-2006',
  ],
  records: {
    'cadillac-dts-northstar-head-bolt-pull-2000': archived({
      oldTitle:
        'Northstar 4.6L Head Bolt Thread Pull/Head Gasket Failure',
      idSuffix: '2000-2005 Model-Scope Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'The standalone Cadillac DTS model begins with model year 2006; 2000-2005 references are DeVille DTS trim references and cannot be published as standalone DTS model scope.',
      evidenceTitle:
        'NHTSA Recall 14V355 - Exact 2000-2005 DeVille / 2006-2011 DTS Naming Boundary',
      evidenceUrl: api('14V355000'),
    }),
    'cadillac-dts-northstar-head-gasket-2006': archived({
      oldTitle: 'Northstar 4.6L V8 Head Bolt/Head Gasket Failure',
      idSuffix: 'Northstar Head-Gasket Aggregation',
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'The current primary-source sweep did not establish the six-year universal head-bolt thread-failure mechanism, symptom bundle or one repair.',
    }),
    'cadillac-dts-northstar-oil-leak-2006': archived({
      oldTitle: 'Northstar 4.6L Rear Main Seal and Oil Pan Gasket Leak',
      idSuffix: 'Rear-Main-Seal and Oil-Pan-Leak Aggregation',
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      category: 'engine',
      claims: 1,
      urls: 1,
      reason:
        'The current primary-source sweep did not support treating two potential leak locations as one model-wide diagnosis or repair.',
      evidenceTitle:
        'GM Bulletin 01-06-01-011O - Engine Oil Consumption and Leak-Diagnosis Guidelines',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244273-0001.pdf',
    }),
    'cadillac-dts-rear-air-suspension-2006': archived({
      oldTitle: 'Rear Air Suspension Compressor and Leveling Failure',
      idSuffix: 'Rear Air-Suspension Aggregation',
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      category: 'suspension',
      claims: 1,
      urls: 1,
      reason:
        'GM PI0430C is limited to vehicles equipped with Magnetic Ride Control RPO F55, Z55 or Z95 and addresses shock-actuator connectors, not the frozen compressor/leveling issue. The existing record cannot express that equipment gate without changing its semantic identity.',
      evidenceTitle:
        'GM PI0430C - Equipment-Gated MagneRide Connector Diagnosis',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163273-9999.pdf',
    }),
    'cadillac-dts-steering-column-2006': archived({
      oldTitle: 'Power Tilt/Telescope Steering Column Motor Failure',
      idSuffix: 'Steering-Column Motor Aggregation',
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      category: 'steering',
      claims: 2,
      urls: 2,
      reason:
        'The frozen record has no primary evidence for a six-year steering-column motor failure population. Recall 06V105 addresses an unrelated power-steering inlet hose and therefore cannot replace this stable record identity.',
      evidenceTitle: 'Cadillac DTS Recall 06V105 - Unrelated Inlet-Hose Scope',
      evidenceUrl: api('06V105000'),
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
    remove: 5,
  },
  expectedPublished: 0,
  expectedArchived: 5,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  if (issues.some((issue) => issue.after.status !== 'archived')) {
    throw new Error('Cadillac DTS reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
