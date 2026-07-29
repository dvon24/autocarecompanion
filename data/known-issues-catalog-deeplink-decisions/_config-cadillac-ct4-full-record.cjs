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
  const evidenceTitle = `Cadillac CT4 Recall ${campaign.slice(0, -3)} / GM ${gmNumber}`;
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
  label: 'Cadillac CT4',
  make: 'Cadillac',
  model: 'CT4',
  batchId: 'cadillac-ct4-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '73f55f27070b0a17d4000787762aaefa00b78a0916b217f04e46d9041fa5e2d3',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-ct4/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'ct4_blind_review:no-blocker',
    edge: 'ct4_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-ct4-turbo-2020',
    'cadillac-blackwing-a10-stalling-2022',
    'cadillac-blackwing-build-quality-2022',
    'cadillac-ct4-infotainment-lag-2020',
    'cadillac-ct4v-blackwing-turbo-noise-2022',
  ],
  records: {
    'cadillac-ct4-turbo-2020': recall({
      oldTitle: '2.0T LSY Engine - Valve Cover/PCV and Coolant Issues',
      claims: 2,
      urls: 2,
      campaign: '20V588000',
      gmNumber: 'A202307260',
      years: [2020],
      category: 'brakes',
      title: 'Electronic Brake-Boost Sensor Contamination Can Remove Assist (Recall 20V588)',
      description:
        'On certain 2020 Cadillac CT4 vehicles, contamination at a sensor connection can interrupt communication with the electronic brake-boost system and remove brake assist, requiring extra pedal force.',
      solution:
        'Check the VIN and recall completion history. Cadillac dealers replace the electronic brake-boost module under recall A202307260.',
      symptoms: ['Open safety recall', 'Loss of brake assist'],
      systems: ['electronic brake-boost module', 'brake-boost sensor connection'],
    }),
    'cadillac-blackwing-a10-stalling-2022': recall({
      oldTitle: 'Intermittent Stalling and Rough Idle in Stop-and-Go Traffic',
      claims: 2,
      urls: 2,
      campaign: '25V148000',
      gmNumber: 'N242480630',
      years: [2020, 2021],
      category: 'transmission',
      title: '10-Speed Transmission Damage Can Cause Wheel Lock-Up (Recall 25V148)',
      description:
        'Certain 2020-2021 Cadillac CT4 vehicles equipped with a 10-speed transmission can develop internal transmission damage that may cause the wheels to lock while driving.',
      solution:
        'Check the VIN and campaign status. Cadillac dealers install transmission-control-module monitoring software under recall N242480630; follow the campaign instructions if the software detects damage.',
      symptoms: ['Open safety recall', 'Unexpected wheel lock-up risk'],
      systems: ['10-speed automatic transmission', 'transmission control module'],
    }),
    'cadillac-blackwing-build-quality-2022': recall({
      oldTitle: 'Build Quality and Paint Quality Issues',
      claims: 2,
      urls: 2,
      campaign: '21V611000',
      gmNumber: 'N212342780',
      years: [2020, 2021, 2022],
      category: 'safety',
      title: 'Roof-Rail Side-Curtain Airbags May Be Installed Incorrectly (Recall 21V611)',
      description:
        'On certain 2020-2022 Cadillac CT4 vehicles, the roof-rail side-curtain airbags may not have been installed correctly and may deploy improperly in a crash.',
      solution:
        'Check the VIN and recall status. Cadillac dealers inspect both roof-rail airbags and reinstall them as necessary under recall N212342780.',
      symptoms: ['Open safety recall', 'Side-curtain airbag installation concern'],
      systems: ['roof-rail side-curtain airbags'],
    }),
    'cadillac-ct4-infotainment-lag-2020': recall({
      oldTitle: 'Infotainment System Lag and Screen Freezing',
      claims: 1,
      urls: 1,
      campaign: '21V421000',
      gmNumber: 'N212338110',
      years: [2021],
      category: 'safety',
      title: 'Airbag Warning Lamp May Not Illuminate Consistently (Recall 21V421)',
      description:
        'On certain 2021 Cadillac CT4 vehicles, the communications gateway module can process loss of communication with the sensing and diagnostic module incorrectly, causing inconsistent illumination of the airbag malfunction indicator.',
      solution:
        'Check the VIN and recall completion history. Cadillac dealers update the communications gateway module software under recall N212338110.',
      symptoms: ['Open safety recall', 'Airbag warning lamp may not warn consistently'],
      systems: ['communications gateway module', 'airbag malfunction indicator'],
    }),
    'cadillac-ct4v-blackwing-turbo-noise-2022': recall({
      oldTitle: 'Twin-Turbo V6 Squealing Noise on Acceleration',
      claims: 2,
      urls: 2,
      campaign: '22V903000',
      gmNumber: 'N222386380',
      years: [2020, 2021, 2022, 2023],
      category: 'exterior',
      title: 'Daytime Running Lights May Stay On with Headlights (Recall 22V903)',
      description:
        'On certain 2020-2023 Cadillac CT4 vehicles, the daytime running lights may not deactivate when the headlights are on, creating excess glare and failing FMVSS 108.',
      solution:
        'Check the VIN and recall status. The body-control-module software is updated by a dealer or over the air under recall N222386380.',
      symptoms: ['Open safety recall', 'Daytime running lights remain on with headlights'],
      systems: ['daytime running lights', 'body control module software'],
    }),
  },
  expectedTelemetry: {
    claimCount: 9,
    urlCount: 9,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: { 'recall-dealer': 5 },
  expectedPublished: 5,
  expectedArchived: 0,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-ct4-turbo-2020': [2020],
    'cadillac-blackwing-a10-stalling-2022': [2020, 2021],
    'cadillac-blackwing-build-quality-2022': [2020, 2021, 2022],
    'cadillac-ct4-infotainment-lag-2020': [2021],
    'cadillac-ct4v-blackwing-turbo-noise-2022': [2020, 2021, 2022, 2023],
  };
  if (
    issues.some(
      (issue) =>
        issue.after.status !== 'published' ||
        JSON.stringify(issue.after.years) !== JSON.stringify(expectedYears[issue.id]),
    )
  ) {
    throw new Error('Cadillac CT4 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
