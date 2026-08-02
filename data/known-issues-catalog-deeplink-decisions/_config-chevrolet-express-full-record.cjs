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
  hvacKnobs: recall('10V096000', [2009, 2010], 'electrical', 'HVAC Control Knobs Can Fracture and Disable Defrost Control',
    'Certain 2009-2010 Chevrolet Express HVAC control knobs can fracture and spin on their shafts. The driver may lose control of heating, cooling, ventilation and windshield defrost, reducing visibility.',
    'Check the VIN for campaign 10V096. A Chevrolet dealer replaces all HVAC control knobs, free of charge.',
    ['HVAC knob spins without changing the setting', 'Defrost cannot be selected', 'Reduced windshield visibility'], ['HVAC control knobs, shafts and defrost controls']),
  fillerNeck: recall('12V388000', [2003, 2004], 'fuel', 'Fuel-Filler Pipe Can Corrode and Leak',
    'Certain cold-weather-state 2003-2004 Chevrolet Express vans with a left-side cargo door can trap water and road contaminants in the fuel-filler-pipe conduit. The pipe can corrode and leak fuel during refueling.',
    'Check the VIN and geographic campaign scope for recall 12V388. A Chevrolet dealer installs a new fuel-filler neck, free of charge.',
    ['Fuel odor during refueling', 'Fuel leaks at the filler pipe', 'Fire risk near an ignition source'], ['fuel-filler pipe, protective conduit and fuel tank'], { trims: ['Left-side cargo door and campaign-state population'] }),
  windowSwitch: recall('18V295000', [2014, 2015, 2016, 2017], 'electrical', 'Driver Power-Window Switch Can Corrode and Overheat',
    'Certain 2014-2017 Chevrolet Express vans with power windows can leak liquid into the driver window switch. Corrosion creates high electrical resistance and increases fire risk.',
    'Check the VIN for campaign 18V295. A Chevrolet dealer replaces the driver-side power-window switch, free of charge.',
    ['Driver window switch works intermittently', 'Switch becomes hot or smells burned', 'Electrical fire risk'], ['driver power-window switch and door wiring'], { trims: ['Power windows'] }),
  transmissionSoftware: recall('24V839000', [2022, 2023], 'transmission', 'Incorrect TCM Software Can Cause Harsh Shifts or Wheel Lock',
    'Certain 2022-2023 Chevrolet Express transmission-control software can cause harsh shifting, reduced power, unintended deceleration, rear-wheel lockup or movement in an unintended direction.',
    'Check the VIN for campaign 24V839. A Chevrolet dealer updates the transmission-control-module calibration, free of charge.',
    ['Harsh shifting', 'Reduced power or unintended deceleration', 'Rear wheels lock', 'Vehicle moves in an unintended direction'], ['automatic transmission and transmission control module software']),
  doorImpactBeam: recall('25V087000', [2025], 'body', 'Driver-Door Impact Beam Can Have Improper Welds',
    'Certain 2025 Chevrolet Express driver-side door impact beams have improper welds and may not adequately protect occupants in a crash.',
    'Check the VIN for campaign 25V087. A Chevrolet dealer replaces the driver-side door, free of charge.',
    ['No reliable warning before a crash', 'Door impact beam may not provide intended protection'], ['driver-side door, impact beam and welds']),
};

const assignments = {
  'chevrolet-express-door-hinge': 'doorImpactBeam',
  'chevrolet-express-fuel-pump': 'fillerNeck',
  'chevrolet-express-intake-gasket': 'hvacKnobs',
  'chevy-express-door-hinge-pins-1996': 'windowSwitch',
  'chevy-express-stabilitrak-2008': 'transmissionSoftware',
};

const published = Object.fromEntries(Object.entries(assignments).map(([id, key]) => {
  const card = campaigns[key];
  return [id, {
    disposition: 'replace',
    decision: `Replace the frozen unsupported or over-broad Express card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
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
      summary: `Replaced an unsupported or mis-scoped Express card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
    },
  }];
}));

module.exports = buildConfig({
  label: 'Chevrolet Express',
  make: 'Chevrolet',
  model: 'Express',
  slug: 'chevrolet-express',
  batchId: 'chevrolet-express-full-record-cohort-21-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '656a67236028f51063ee629536c61dee293f2b066d128a39dda2fc088e0602cc',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-express/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletexpress_blind:self-no-blocker',
    edge: 'chevroletexpress_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
