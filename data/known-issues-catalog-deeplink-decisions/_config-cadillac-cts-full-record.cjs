const api = (campaign) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;

function recall({
  oldTitle,
  claims,
  urls,
  campaign,
  years,
  category,
  title,
  description,
  solution,
  symptoms,
  systems,
}) {
  const campaignLabel = campaign.slice(0, -3);
  const evidenceTitle = `Cadillac CTS Recall ${campaignLabel}`;
  const evidenceUrl = api(campaign);
  return {
    disposition: 'recall-dealer',
    decision: `Replace the frozen "${oldTitle}" aggregation with the exact VIN-gated safety campaign below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: evidenceUrl }],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title,
      description,
      solution,
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: [{ type: 'recall', title: evidenceTitle, url: evidenceUrl }],
      summary: `Replaced the frozen "${oldTitle}" card with exact NHTSA ${campaignLabel} scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac CTS',
  make: 'Cadillac',
  model: 'CTS',
  batchId: 'cadillac-cts-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '577a4c7bc17def30dcbf7194c77640ac43d1d55cd76208f59afb69dc790ead40',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-cts/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cts_blind_review:no-blocker',
    edge: 'cts_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-cts-2.0t-turbo-2013',
    'cadillac-cts-cue-screen-2013',
    'cadillac-cts-power-steering-2008',
    'cadillac-cts-rear-diff-2008',
    'cadillac-cts-timing-chain-2004',
  ],
  records: {
    'cadillac-cts-2.0t-turbo-2013': recall({
      oldTitle: '2.0T LTG Turbo System Issues - PCV and Wastegate',
      claims: 2,
      urls: 2,
      campaign: '15V358000',
      years: [2015],
      category: 'brakes',
      title: 'Brake-Pedal Pushrod Bracket May Fracture (Recall 15V358)',
      description:
        'On certain 2015 Cadillac CTS vehicles, the bracket between the brake-pedal assembly and the brake-actuating rod may fracture during normal pedal operation, preventing the driver from applying the brakes.',
      solution:
        'Check the VIN and recall completion history. Cadillac dealers inspect the bracket and replace affected brackets under recall 15V358.',
      symptoms: ['Open safety recall', 'Brake-pedal linkage failure risk'],
      systems: ['brake-pedal pushrod bracket', 'brake-pedal assembly'],
    }),
    'cadillac-cts-cue-screen-2013': recall({
      oldTitle: 'CUE Infotainment Touchscreen Delamination and Failure',
      claims: 2,
      urls: 2,
      campaign: '14V614000',
      years: [2013, 2014],
      category: 'electrical',
      title: 'Chassis Electronic Module Can Short and Stall the Engine (Recall 14V614)',
      description:
        'On certain 2013-2014 Cadillac CTS vehicles, internal contamination in the chassis electronic module can cause an electrical short and stall the engine.',
      solution:
        'Check the VIN and campaign history. Cadillac dealers replace the chassis electronic module under recall 14V614 / GM 14515.',
      symptoms: ['Open safety recall', 'Unexpected engine stall'],
      systems: ['chassis electronic module', 'vehicle electrical system'],
    }),
    'cadillac-cts-power-steering-2008': recall({
      oldTitle: 'Electric Power Steering Rack Failure',
      claims: 1,
      urls: 1,
      campaign: '25V175000',
      years: [2016, 2017, 2018],
      category: 'steering',
      title: 'Electric Power-Steering Assist May Fail (Recall 25V175)',
      description:
        'On certain 2016-2018 Cadillac CTS vehicles, electric power-steering assist may fail and require greater steering effort, especially at low speeds.',
      solution:
        'Check the VIN and recall status. Cadillac dealers replace the power-steering gear assembly under recall 25V175 / GM N252497020.',
      symptoms: ['Open safety recall', 'Sudden loss of power-steering assist'],
      systems: ['electric power-steering gear assembly'],
    }),
    'cadillac-cts-rear-diff-2008': recall({
      oldTitle: 'Rear Differential Noise and Failure (RWD/AWD)',
      claims: 1,
      urls: 1,
      campaign: '07V589000',
      years: [2005, 2006, 2007],
      category: 'drivetrain',
      title: 'Rear-Axle Pinion Seal Can Leak and Allow Differential Failure (Recall 07V589)',
      description:
        'On certain 2005-2007 Cadillac CTS vehicles, a rear-axle pinion seal may leak fluid. Continued fluid loss can lead to rear-differential failure, loss of motive power or loss of control.',
      solution:
        'Check the VIN and recall completion history. Cadillac dealers replace the rear-axle pinion seal under recall 07V589.',
      symptoms: ['Open safety recall', 'Rear-axle fluid leak'],
      systems: ['rear-axle pinion seal', 'rear differential'],
    }),
    'cadillac-cts-timing-chain-2004': recall({
      oldTitle: '3.6L V6 Timing Chain Stretch and Premature Failure',
      claims: 3,
      urls: 3,
      campaign: '14V394000',
      years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      category: 'electrical',
      title: 'Ignition Key Can Move Out of Run and Disable Airbags (Recall 14V394)',
      description:
        'On certain 2003-2014 Cadillac CTS vehicles, key-ring weight, road conditions or another jarring event can move the ignition switch out of Run, turn off the engine and prevent airbag deployment in a crash.',
      solution:
        'Until repaired, remove all other items from the key ring. Check the VIN and recall history; Cadillac dealers install the specified key-ring and key-slot or key-head remedy under recall 14V394.',
      symptoms: ['Open safety recall', 'Ignition key may move out of Run'],
      systems: ['ignition switch', 'ignition key', 'airbag enablement'],
    }),
  },
  expectedTelemetry: {
    claimCount: 9,
    urlCount: 9,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: { 'recall-dealer': 5 },
  expectedPublished: 5,
  expectedArchived: 0,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-cts-2.0t-turbo-2013': [2015],
    'cadillac-cts-cue-screen-2013': [2013, 2014],
    'cadillac-cts-power-steering-2008': [2016, 2017, 2018],
    'cadillac-cts-rear-diff-2008': [2005, 2006, 2007],
    'cadillac-cts-timing-chain-2004': [
      2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
    ],
  };
  if (
    issues.some(
      (issue) =>
        issue.after.status !== 'published' ||
        JSON.stringify(issue.after.years) !== JSON.stringify(expectedYears[issue.id]),
    )
  ) {
    throw new Error('Cadillac CTS reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
