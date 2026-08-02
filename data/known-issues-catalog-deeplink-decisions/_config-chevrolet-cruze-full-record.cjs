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
  parkLock: recall('16V502000', [2011, 2012, 2013, 2014, 2015, 2016], 'transmission', 'Replacement Park-Lock Lever Can Permit Rollaway',
    'Certain 2011-2016 Chevrolet Cruze vehicles may have been serviced with a defective replacement electronic park-lock lever. The ignition key can then be removed while the automatic transmission is not in Park, allowing the vehicle to roll away.',
    'Check the VIN and service history for campaign 16V502. A Chevrolet dealer inspects the key-cylinder lock housing and replaces it when necessary, free of charge.',
    ['Ignition key can be removed outside Park', 'Vehicle can roll after occupants exit'], ['electronic park-lock lever, key-cylinder lock housing and automatic-transmission interlock'], { trims: ['Vehicles serviced with an affected replacement electronic park-lock lever'] }),
  brakeVacuumPump: recall('13V360000', [2011, 2012], 'brakes', 'Brake Vacuum Pump May Not Provide Supplemental Assist',
    'Certain 2011-2012 Chevrolet Cruze vehicles with the 1.4L turbo engine, 6T40 automatic transmission and an electric supplemental brake-vacuum pump can have a pump that does not activate. Brake assist can be reduced or lost intermittently.',
    'Check the VIN for campaign 13V360. A Chevrolet dealer replaces the microswitch in the power-brake vacuum pipe assembly, free of charge.',
    ['Brake pedal requires extra force', 'Stopping distance increases', 'Intermittent reduction or loss of brake assist'], ['electric brake-vacuum pump, microswitch and vacuum pipe assembly'], { engines: ['1.4L DOHC turbo gasoline'], trims: ['6T40 automatic with electric supplemental vacuum pump'] }),
  engineShield: recall('12V288000', [2011, 2012], 'engine', 'Oil Can Collect in the Engine Shield and Ignite',
    'Certain 2011-2012 Chevrolet Cruze vehicles can collect spilled or dripping oil in the engine shield near hot engine or exhaust surfaces. The oil and shield can ignite and cause an engine-compartment fire.',
    'Check the VIN for campaign 12V288. A Chevrolet dealer modifies the engine shield; manual-transmission vehicles also receive protective tape on the electronic power-steering wire harness.',
    ['Oil collects in the engine shield', 'Burning-oil odor or smoke', 'Engine-compartment fire risk'], ['engine shield, hot engine and exhaust surfaces, and manual-transmission steering harness']),
  halfShaft: recall('14V151000', [2013, 2014], 'drivetrain', 'Right Front Half Shaft Can Fracture',
    'Certain 2013-2014 Chevrolet Cruze vehicles with the 1.4L turbo engine can fracture and separate the right front half shaft. The vehicle can lose propulsion while driving or move unexpectedly when parked without the parking brake.',
    'Check the VIN for campaign 14V151, including vehicles previously repaired under campaign 13V452. A Chevrolet dealer inspects and replaces the right half shaft as needed, free of charge.',
    ['Loss of propulsion while driving', 'Vehicle can move while parked without the parking brake', 'Right front half shaft fractures or separates'], ['right front axle half shaft and driveline'], { engines: ['1.4L turbo'] }),
  tankStraps: recall('12V289000', [2011, 2012], 'fuel', 'Fuel-Tank Strap Bracket Welds May Be Missing',
    'Certain 2011-2012 Chevrolet Cruze vehicles may be missing attachment welds at the fuel-tank strap secondary brackets. The tank can come loose in a crash, leak fuel and create a fire risk near an ignition source.',
    'Check the VIN for campaign 12V289. A Chevrolet dealer inspects the bracket welds and secures any affected bracket attachments with fasteners, free of charge.',
    ['Fuel tank can loosen in a crash', 'Fuel leakage after a crash', 'Fire risk near an ignition source'], ['fuel tank, tank straps and secondary mounting brackets']),
};

const assignments = {
  'chevrolet-cruze-6t40-shudder-2011': 'parkLock',
  'chevrolet-cruze-intake-manifold-runner-2011': 'brakeVacuumPump',
  'chevrolet-cruze-pcv-valve-cover-2011': 'engineShield',
  'chevrolet-cruze-turbo-oil-feed-line-2011': 'halfShaft',
  'chevrolet-cruze-water-outlet-leak-2011': 'tankStraps',
};

const published = Object.fromEntries(Object.entries(assignments).map(([id, key]) => {
  const card = campaigns[key];
  return [id, {
    disposition: 'replace',
    decision: `Replace the frozen unsupported or secondary-source Cruze card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
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
      summary: `Replaced an unsupported or mis-scoped Cruze card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
    },
  }];
}));

module.exports = buildConfig({
  label: 'Chevrolet Cruze',
  make: 'Chevrolet',
  model: 'Cruze',
  slug: 'chevrolet-cruze',
  batchId: 'chevrolet-cruze-full-record-cohort-18-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c613662c9dedc81c3b3a08d18329428541ea4d959d0ab65b41f42b0001763571',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-cruze/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletcruze_blind:self-no-blocker',
    edge: 'chevroletcruze_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
