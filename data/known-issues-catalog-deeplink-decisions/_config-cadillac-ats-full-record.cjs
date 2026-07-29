const api = (campaign) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;

function recall({
  oldTitle,
  claims,
  urls,
  campaign,
  gmCampaign,
  years,
  category,
  title,
  description,
  solution,
  symptoms,
  systems,
}) {
  const evidenceUrl = api(campaign);
  const evidenceTitle = `Cadillac ATS Recall ${campaign.slice(0, 6)}${
    gmCampaign ? ` / ${gmCampaign}` : ''
  }`;
  return {
    disposition: 'recall-dealer',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded NHTSA/GM campaign path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      summary: `Replaced the frozen "${oldTitle}" card with exact NHTSA/GM campaign ${campaign.slice(0, 6)} and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac ATS',
  make: 'Cadillac',
  model: 'ATS',
  batchId: 'cadillac-ats-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '4df259128a07a10d5ac1ba13132be2a46eed3b173a7a826c31b9a396c1523b7e',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-ats/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'ats_blind_review:no-blocker',
    edge: 'ats_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-ats-2.0t-turbo-2013',
    'cadillac-ats-cue-screen-2013',
    'cadillac-ats-rear-differential-seal-2013',
    'cadillac-ats-sunroof-drain-2013',
    'cadillac-ats-timing-chain-2013',
  ],
  records: {
    'cadillac-ats-2.0t-turbo-2013': recall({
      oldTitle: '2.0T LTG Turbo System Issues - PCV and Wastegate',
      claims: 2,
      urls: 2,
      campaign: '18V358000',
      gmCampaign: '18188',
      years: [2018],
      category: 'fuel',
      title:
        'High-Pressure Fuel Pump Can Detach and Damage Fuel Line (Recall 18V358 / 18188)',
      description:
        'On certain 2018 ATS vehicles, the high-pressure fuel pump can detach from its mounting flange and damage the high-pressure fuel line, creating a fuel leak and fire risk.',
      solution:
        'Check the VIN and campaign completion history. Cadillac dealers replace the high-pressure fuel pump and high-pressure fuel pipe free of charge under recall 18V358.',
      symptoms: ['Open safety recall', 'Fuel odor or visible fuel leakage'],
      systems: ['high-pressure fuel pump', 'high-pressure fuel pipe'],
    }),
    'cadillac-ats-cue-screen-2013': recall({
      oldTitle: 'CUE Infotainment Touchscreen Delamination and Failure',
      claims: 1,
      urls: 1,
      campaign: '26V329000',
      gmCampaign: 'N262555870',
      years: [2015, 2016],
      category: 'safety',
      title:
        'Driver Airbag Inflator May Rupture During Deployment (Recall 26V329 / N262555870)',
      description:
        'Certain 2015-2016 ATS vehicles have a front-driver airbag inflator that may rupture during deployment and send sharp metal fragments into the cabin, causing serious injury or death.',
      solution:
        'Check the VIN immediately. Cadillac dealers replace the front-driver airbag module free of charge; GM mailed interim risk notices in June 2026 and will send additional letters as remedy parts become available.',
      symptoms: [
        'Open safety recall',
        'No reliable warning before airbag deployment',
      ],
      systems: ['front-driver airbag module', 'driver airbag inflator'],
    }),
    'cadillac-ats-rear-differential-seal-2013': recall({
      oldTitle: 'Rear Differential Output Seal Leak',
      claims: 2,
      urls: 2,
      campaign: '25V175000',
      gmCampaign: 'N252497020',
      years: [2017, 2018],
      category: 'steering',
      title:
        'Electric Power-Steering Assist May Fail (Recall 25V175 / N252497020)',
      description:
        'On certain 2017-2018 ATS vehicles, electric power-steering assist can fail. Steering remains possible but requires greater effort, especially at low speeds, increasing crash risk.',
      solution:
        'Check the VIN and campaign completion history. Cadillac dealers replace the power-steering gear assembly free of charge under recall 25V175.',
      symptoms: ['Loss of steering assist', 'Increased low-speed steering effort'],
      systems: ['electric power-steering system', 'steering gear assembly'],
    }),
    'cadillac-ats-sunroof-drain-2013': recall({
      oldTitle: 'Sunroof Drain Tube Clogging Causing Water Leaks',
      claims: 2,
      urls: 2,
      campaign: '15V463000',
      gmCampaign: '15568',
      years: [2013, 2014, 2015, 2016],
      category: 'body',
      title:
        'Sunroof Switch Can Trigger Unintended Auto-Closure (Recall 15V463 / 15568)',
      description:
        'Certain 2013-2016 ATS vehicles have a non-recessed roof-panel switch that can be pressed inadvertently and trigger unintended automatic sunroof closure, creating an injury risk.',
      solution:
        'Check the VIN and campaign completion history. Cadillac dealers replace the roof-console accessory switch trim plate free of charge. Recall 15V463 supersedes 15V106.',
      symptoms: [
        'Sunroof auto-closes when the non-recessed switch is pressed',
        'Open safety recall',
      ],
      systems: ['power sunroof switch', 'roof-console switch trim plate'],
    }),
    'cadillac-ats-timing-chain-2013': recall({
      oldTitle: '3.6L V6 Timing Chain Stretch (ATS V6 models)',
      claims: 2,
      urls: 2,
      campaign: '14V338000',
      gmCampaign: '14179',
      years: [2013, 2014],
      category: 'transmission',
      title:
        'Transmission Shift Cable Can Detach and Cause Rollaway (Recall 14V338 / 14179)',
      description:
        'On certain 2013-2014 ATS vehicles, the transmission shift cable can detach at the shifter or transmission bracket. The selected gear may not match the indicated gear, and the vehicle may roll despite the shifter showing Park.',
      solution:
        'Check the VIN and campaign completion history. Cadillac dealers inspect that the shift cable is properly seated at both brackets free of charge under recall 14V338.',
      symptoms: [
        'Indicated gear does not match transmission gear',
        'Vehicle may move or roll after Park is selected',
      ],
      systems: ['transmission shift cable', 'shifter and transmission brackets'],
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
    'cadillac-ats-2.0t-turbo-2013': [2018],
    'cadillac-ats-cue-screen-2013': [2015, 2016],
    'cadillac-ats-rear-differential-seal-2013': [2017, 2018],
    'cadillac-ats-sunroof-drain-2013': [2013, 2014, 2015, 2016],
    'cadillac-ats-timing-chain-2013': [2013, 2014],
  };
  if (
    issues.some(
      (issue) =>
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expectedYears[issue.id]) ||
        issue.after.status !== 'published',
    )
  ) {
    throw new Error('Cadillac ATS reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
