const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recall(campaign, years, category, title, description, solution, symptoms, affectedSystems, options = {}) {
  const shortCampaign = campaign.slice(0, 6);
  const sourceTitle = `NHTSA Recall ${shortCampaign} - ${title}`;
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
  return {
    years,
    trims: options.trims || [],
    engines: [],
    category,
    title: `${title} (Recall ${shortCampaign})`,
    description,
    solution,
    severity: 'high',
    confidence: 'high',
    symptoms,
    affectedSystems,
    dtcCodes: [],
    sourceTitle,
    url,
  };
}

const campaigns = {
  doorStrikers: recall('24V737000', [2025], 'body', 'Improperly Heat-Treated Door Strikers Can Break',
    'NHTSA campaign 24V737 includes certain 2025 Chevrolet Equinox EV vehicles with door strikers that were not properly heat-treated. A striker can break and allow a door to open unexpectedly.',
    'Check the VIN for campaign 24V737. A Chevrolet dealer replaces all four side-door strikers and their attachment bolts, free of charge.',
    ['Door does not remain securely latched', 'Door opens unexpectedly'], ['all four side-door strikers and attachment bolts']),
  pedestrian2025: recall('24V925000', [2025], 'safety', 'Pedestrian Alert Sound May Be Too Quiet',
    'Certain 2025 Chevrolet Equinox EV vehicles have incorrect pedestrian-alert software that may not produce sound at the volume required by federal standards, making the approaching EV harder to hear.',
    'Check the VIN for campaign 24V925. A Chevrolet dealer updates the body-control-module software, free of charge.',
    ['Pedestrian warning sound is unusually quiet', 'Pedestrians may not notice the vehicle at low speed'], ['pedestrian-alert sound system and body control module']),
  adaptiveCruise: recall('25V012000', [2025], 'brakes', 'Adaptive Cruise Control May Not Brake as Expected',
    'Certain 2025 Chevrolet Equinox EV all-wheel-drive vehicles have incorrect brake-module software that can prevent adaptive cruise control from engaging the brakes as expected.',
    'Do not rely on adaptive cruise control to stop the vehicle. Check the VIN for campaign 25V012; a Chevrolet dealer updates the brake-system control-module calibration free of charge.',
    ['Adaptive cruise does not slow for traffic ahead', 'Automatic braking response is absent or delayed'], ['adaptive cruise control and brake-system control-module software'], { trims: ['All-wheel drive'] }),
  pedestrian2024: recall('25V639000', [2024], 'safety', 'Pedestrian Alert Volume Does Not Change Enough at Low Speed',
    'Certain 2024 Chevrolet Equinox EV vehicles do not produce the required change in pedestrian-alert volume between a stop and low-speed movement, making the vehicle harder to hear.',
    'Check the VIN for campaign 25V639. The body-control-module software is updated by a dealer or eligible over-the-air update, free of charge.',
    ['Exterior warning sound changes too little from a stop', 'Pedestrians may not notice the moving EV'], ['pedestrian-alert system and body-control-module software']),
  continentalTires: recall('25V704000', [2025, 2026], 'safety', 'Continental 21-Inch Tire Tread Can Detach',
    'Certain 2025-2026 Chevrolet Equinox EV vehicles with 21-inch Continental all-season tires can experience partial or complete tread detachment, increasing the risk of loss of control.',
    'Check the VIN and tire DOT numbers for campaign 25V704. A Chevrolet dealer inspects all four tires and replaces any manufactured during DOT week 4024, free of charge.',
    ['Tire vibration or thumping', 'Visible tread separation', 'Sudden loss of tire integrity or vehicle control'], ['21-inch Continental all-season tires, tread and belt'], { trims: ['Vehicles with 21-inch Continental all-season tires'] }),
  pedestrian2026: recall('25V878000', [2025, 2026], 'safety', 'Pedestrian Alert Sound Change Is Insufficient',
    'Certain 2025-2026 Chevrolet Equinox EV vehicles do not produce the required change in pedestrian-alert sound volume between stopped and low-speed operation.',
    'Check the VIN for campaign 25V878. The body-control-module software is updated by a dealer or eligible over-the-air update, free of charge.',
    ['Pedestrian warning sound does not change enough at low speed', 'Pedestrians may not hear the moving vehicle'], ['pedestrian-alert sound system and body control module']),
  ownerManual: recall('26V114000', [2025, 2026], 'electrical', 'Electronic Owner Manual May Not Download',
    'Certain 2025-2026 Chevrolet Equinox EV radios were not set to the status required to download the electronic owner manual. Owners may be unable to access instructions for safe vehicle operation.',
    'Check the VIN for campaign 26V114. A Chevrolet dealer resets the radio so the electronic owner manual downloads automatically, free of charge.',
    ['Electronic owner manual is unavailable in the radio', 'Safety instructions cannot be accessed'], ['radio software and electronic owner-manual download']),
};

const assignments = {
  'chevrolet-equinox-ev-continental-tire-tread-separation-recall': 'continentalTires',
  'chevrolet-equinox-ev-front-footwell-water-leak': 'doorStrikers',
  'chevrolet-equinox-ev-high-voltage-battery-fault-sudden-state-charge-drop-to-0': 'pedestrian2025',
  'chevrolet-equinox-ev-led-headlamp-snow-slush-buildup': 'pedestrian2026',
  'chevrolet-equinox-ev-loss-propulsion-vehicle-control-software-defect': 'ownerManual',
  'chevy-equinox-ev-adaptive-cruise-braking-2024': 'adaptiveCruise',
  'chevy-equinox-ev-pedestrian-alert-2024': 'pedestrian2024',
};

const published = Object.fromEntries(Object.entries(assignments).map(([id, key]) => {
  const card = campaigns[key];
  return [id, {
    disposition: 'replace',
    decision: `Replace the frozen unsupported, over-broad or mis-scoped Equinox EV card with the exact ${card.sourceTitle} primary record and remove any unverified commerce links.`,
    evidence: [{ type: 'recall', label: card.sourceTitle, url: card.url }],
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines,
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: card.confidence,
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes,
      citations: [{ type: 'recall', title: card.sourceTitle, url: card.url }],
      summary: `Replaced an unsupported or mis-scoped Equinox EV card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
    },
  }];
}));

module.exports = buildConfig({
  label: 'Chevrolet Equinox EV',
  make: 'Chevrolet',
  model: 'Equinox EV',
  slug: 'chevrolet-equinox-ev',
  batchId: 'chevrolet-equinox-ev-full-record-cohort-20-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '3c1c73fd4294d9f2d94f5f6345151e7df03fa202790cbd343ed40e530f05a531',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-equinox-ev/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletequinoxev_blind:self-no-blocker',
    edge: 'chevroletequinoxev_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
