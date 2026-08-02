const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recall(campaign, years, category, title, description, solution, symptoms, affectedSystems, options = {}) {
  const shortCampaign = campaign.slice(0, 6);
  const sourceTitle = `NHTSA Recall ${shortCampaign} - ${title}`;
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
  return {
    years,
    trims: options.trims || [],
    engines: options.engines || [],
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
  headliner: recall(
    '07V014000',
    [2005, 2006],
    'safety',
    'Headliner Trim May Not Provide Required Head-Impact Protection',
    'Certain 2005-2006 Chevrolet Cobalt vehicles without optional roof-mounted side-impact air bags do not provide the head-impact protection required by federal safety standards.',
    'Check the VIN for recall completion. A Chevrolet dealer installs energy-absorbing plastic behind the headliner trim.',
    ['No reliable warning before a crash', 'Vehicle lacks optional roof-mounted side-impact air bags'],
    ['headliner trim and energy-absorbing head-impact structure'],
    { trims: ['Without optional roof-mounted side-impact air bags'] },
  ),
  steering: recall(
    '10V073000',
    [2005, 2006, 2007, 2008, 2009, 2010],
    'steering',
    'Electric Power-Steering Assist Can Fail Suddenly',
    'Certain 2005-2010 Chevrolet Cobalt vehicles can suddenly lose electric power-steering assist while driving. Manual steering remains, but substantially greater effort is required, especially at low speed.',
    'Check the VIN for recall completion. A Chevrolet dealer replaces the electric power-steering motor.',
    ['Sudden loss of steering assist', 'Power-steering warning', 'High steering effort at low speed'],
    ['electric power-steering motor and assist system'],
  ),
  fuelPump: recall(
    '12V459000',
    [2007, 2008, 2009],
    'fuel',
    'Fuel-Pump Module Port Can Crack and Leak',
    'Certain 2007-2009 Chevrolet Cobalt vehicles originally sold or registered in specified warm-weather states can develop a crack in the fuel-pump module supply or return port. Leaking fuel can ignite and cause a fire.',
    'Check the VIN because the covered states and model years differ. A Chevrolet dealer replaces the fuel-pump module.',
    ['Fuel odor', 'Fuel dripping beneath the vehicle', 'Reduced vehicle performance', 'Fire risk near an ignition source'],
    ['fuel-pump module supply and return ports'],
    { trims: ['Vehicles covered by the campaign state-registration scope'] },
  ),
  ignitionSwitch: recall(
    '14V047000',
    [2005, 2006, 2007, 2008, 2009, 2010],
    'safety',
    'Ignition Switch Can Move Out of Run and Disable the Air Bags',
    'On affected 2005-2007 Chevrolet Cobalt vehicles, key-ring weight or a jarring event can move the ignition switch out of Run and stop the engine. Certain 2008-2010 vehicles are included because defective switches may have been installed as service replacement parts. If the key leaves Run, the air bags may not deploy in a crash.',
    'Check the VIN and recall history. A Chevrolet dealer replaces the ignition switch. Until repaired, NHTSA and GM direct owners to remove every item from the key ring and use only the vehicle key.',
    ['Engine shuts off while driving', 'Loss of power assist after ignition shutdown', 'Air bags may not deploy when the key is not in Run'],
    ['ignition switch, engine power state and air-bag deployment system'],
  ),
  lockCylinder: recall(
    '14V171000',
    [2005, 2006, 2007, 2008, 2009, 2010],
    'electrical',
    'Ignition Key Can Be Removed Before the Switch Is Off',
    'Certain 2005-2010 Chevrolet Cobalt vehicles can allow the key to be removed while the ignition is not in Off. A vehicle left outside Park, or a manual-transmission vehicle not left in Reverse with the parking brake set, can roll away.',
    'Check the VIN for recall completion. A Chevrolet dealer replaces the ignition lock cylinder when required and cuts or relearns two ignition and door keys.',
    ['Key can be removed before the ignition reaches Off', 'Vehicle can roll after the driver exits'],
    ['ignition lock cylinder, keys and rollaway protection'],
  ),
};

const assignments = {
  'chevy-cobalt-ecotec-timing-chain-2005': 'lockCylinder',
  'chevy-cobalt-front-hub-bearing-2005': 'headliner',
  'chevy-cobalt-fuel-pump-failure-2005': 'fuelPump',
  'chevy-cobalt-ignition-switch-defect-2005': 'ignitionSwitch',
  'chevy-cobalt-power-steering-failure-2005': 'steering',
};

const published = Object.fromEntries(
  Object.entries(assignments).map(([id, key]) => {
    const card = campaigns[key];
    return [
      id,
      {
        disposition: 'replace',
        decision: `Replace the frozen unsupported, over-broad or secondary-source Cobalt card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
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
          summary: `Replaced an unsupported or mis-scoped Cobalt card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
        },
      },
    ];
  }),
);

module.exports = buildConfig({
  label: 'Chevrolet Cobalt',
  make: 'Chevrolet',
  model: 'Cobalt',
  slug: 'chevrolet-cobalt',
  batchId: 'chevrolet-cobalt-full-record-cohort-14-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '9d516a44b9c646474466ce25e595df1835ffb4208f2c9e9ee72bdb7b4399ae7d',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-cobalt/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletcobalt_blind:self-no-blocker',
    edge: 'chevroletcobalt_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
