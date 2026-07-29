const api = (campaign) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;

function recall({
  oldTitle,
  claims,
  urls,
  campaign,
  gmNumber,
  years,
  category,
  title,
  description,
  solution,
  symptoms,
  systems,
}) {
  const evidenceTitle = `Cadillac CT6 Recall ${campaign.slice(0, -3)} / GM ${gmNumber}`;
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
      summary: `Replaced the frozen "${oldTitle}" card with exact NHTSA ${campaign.slice(0, -3)} / GM ${gmNumber} scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac CT6',
  make: 'Cadillac',
  model: 'CT6',
  batchId: 'cadillac-ct6-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '2092ea46f646da34c9cd37de87b08d410c76dcefe06394cacbe31541d306110c',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-ct6/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'ct6_blind_review:no-blocker',
    edge: 'ct6_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-ct6-3tt-turbo-wastegate-2016',
    'cadillac-ct6-air-suspension-2016',
    'cadillac-ct6-rear-camera-mirror-2016',
    'cadillac-ct6-headlight-condensation-2016',
    'cadillac-ct6-supercharger-intercooler-2019',
  ],
  records: {
    'cadillac-ct6-3tt-turbo-wastegate-2016': recall({
      oldTitle: '3.0L Twin-Turbo V6 Wastegate Actuator Failure',
      claims: 2,
      urls: 2,
      campaign: '25V148000',
      gmNumber: 'N242480630',
      years: [2019, 2020],
      category: 'transmission',
      title: '10-Speed Transmission Damage Can Cause Wheel Lock-Up (Recall 25V148)',
      description:
        'Certain 2019-2020 Cadillac CT6 vehicles equipped with a 10-speed transmission can develop internal transmission damage that may cause the wheels to lock while driving.',
      solution:
        'Check the VIN and campaign status. Cadillac dealers install transmission-control-module monitoring software under recall N242480630; follow the campaign instructions if the software detects damage.',
      symptoms: ['Open safety recall', 'Unexpected wheel lock-up risk'],
      systems: ['10-speed automatic transmission', 'transmission control module'],
    }),
    'cadillac-ct6-air-suspension-2016': recall({
      oldTitle: 'Magnetic Ride Control Shock Absorber Premature Failure',
      claims: 1,
      urls: 1,
      campaign: '18V437000',
      gmNumber: '18228',
      years: [2016, 2017, 2018],
      category: 'safety',
      title: 'Excess Adhesive Can Obstruct Child-Seat Anchorages (Recall 18V437)',
      description:
        'On certain 2016-2018 Cadillac CT6 vehicles, excess structural adhesive on the inboard child-seat anchorage bars can interfere with correct child-seat installation.',
      solution:
        'Check the VIN and recall completion history. Cadillac dealers inspect the anchorages, remove excess adhesive and apply anti-corrosion primer under recall 18228.',
      symptoms: ['Open safety recall', 'Child-seat connector may not attach correctly'],
      systems: ['inboard child-seat anchorage bars'],
    }),
    'cadillac-ct6-rear-camera-mirror-2016': recall({
      oldTitle: 'Rear Camera Mirror Display Flickering and Washout',
      claims: 2,
      urls: 2,
      campaign: '19V889000',
      gmNumber: 'N192268090',
      years: [2019],
      category: 'brakes',
      title: 'ABS and Stability Control Can Disable Without Warning Lamps (Recall 19V889)',
      description:
        'On certain 2019 Cadillac CT6 vehicles, an electronic brake-control-module software error can disable ABS and stability control without illuminating the corresponding warning lamps.',
      solution:
        'Check the VIN and campaign history. Cadillac dealers reprogram the electronic brake control module under recall N192268090.',
      symptoms: ['Open safety recall', 'ABS or stability control may be unavailable without a warning'],
      systems: ['electronic brake control module', 'antilock braking system', 'stability control'],
    }),
    'cadillac-ct6-headlight-condensation-2016': recall({
      oldTitle: 'LED Headlight Housing Internal Condensation',
      claims: 2,
      urls: 2,
      campaign: '21V759000',
      gmNumber: 'N162016079',
      years: [2016, 2017],
      category: 'exterior',
      title: 'Park and Position Lamps May Be Excessively Bright (Recall 21V759)',
      description:
        'Certain 2016-2017 Cadillac CT6 vehicles have park and position lamps that may be excessively bright and fail FMVSS 108, potentially affecting other drivers’ vision.',
      solution:
        'Check the VIN and recall status. Cadillac dealers install left- and right-side in-line headlamp jumper harnesses under recall N162016079.',
      symptoms: ['Open safety recall', 'Park or position lamps are excessively bright'],
      systems: ['park lamps', 'position lamps', 'headlamp jumper harnesses'],
    }),
    'cadillac-ct6-supercharger-intercooler-2019': recall({
      oldTitle: '4.2L Blackwing Twin-Turbo V8 Intercooler Coolant Leak',
      claims: 1,
      urls: 1,
      campaign: '19V117000',
      gmNumber: 'N182207090',
      years: [2019],
      category: 'exterior',
      title: 'Turn Signals May Not Cancel Automatically (Recall 19V117)',
      description:
        'On certain 2019 Cadillac CT6 vehicles, steering-wheel rotation may not cancel the turn signal, which can mislead pedestrians and other drivers.',
      solution:
        'Check the VIN and recall completion history. Cadillac dealers replace the turn-signal switch under recall N182207090.',
      symptoms: ['Open safety recall', 'Turn signal remains active after a turn'],
      systems: ['turn-signal switch', 'exterior signal lamps'],
    }),
  },
  expectedTelemetry: {
    claimCount: 8,
    urlCount: 8,
    claimClickCount: 4,
    recordClickCount: 4,
    priorityClickCount: 4,
  },
  expectedDispositionCounts: { 'recall-dealer': 5 },
  expectedPublished: 5,
  expectedArchived: 0,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-ct6-3tt-turbo-wastegate-2016': [2019, 2020],
    'cadillac-ct6-air-suspension-2016': [2016, 2017, 2018],
    'cadillac-ct6-rear-camera-mirror-2016': [2019],
    'cadillac-ct6-headlight-condensation-2016': [2016, 2017],
    'cadillac-ct6-supercharger-intercooler-2019': [2019],
  };
  if (
    issues.some(
      (issue) =>
        issue.after.status !== 'published' ||
        JSON.stringify(issue.after.years) !== JSON.stringify(expectedYears[issue.id]),
    )
  ) {
    throw new Error('Cadillac CT6 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
