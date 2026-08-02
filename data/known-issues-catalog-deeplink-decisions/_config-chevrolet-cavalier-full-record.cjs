const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recall(campaign, years, category, title, description, solution, symptoms, affectedSystems) {
  const shortCampaign = campaign.slice(0, 6);
  const sourceTitle = `NHTSA Recall ${shortCampaign} - ${title}`;
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
  return {
    years,
    trims: [],
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
  ignitionEarly: recall(
    '02V070000',
    [1995, 1996, 1997],
    'electrical',
    'Ignition Switch Can Overheat and Start a Fire',
    'Certain 1995-1997 Chevrolet Cavalier vehicles can send excessive current through the ignition switch when the key is held in Start during a no-start condition. Internal switch parts can melt and a steering-column fire can occur even after the key is removed.',
    'Check the VIN for recall completion. A Chevrolet dealer installs a relay kit that prevents high starter current from flowing through the ignition switch.',
    ['Hot or damaged ignition switch after an extended start attempt', 'Smoke or fire from the steering column', 'No reliable warning before a post-shutdown fire'],
    ['ignition switch, starter-current circuit and protective relay'],
  ),
  steering: recall(
    '02V286000',
    [1996, 1997, 1998],
    'steering',
    'Rack-and-Pinion Bearing Can Fail and Restrict Steering',
    'Certain 1996-1998 Chevrolet Cavalier vehicles can have an improperly crimped lower pinion-bearing retainer. Escaping ball bearings can move the pinion shaft, greatly increase left-turn effort or produce unintended assist to the right.',
    'Check the VIN for recall completion. A Chevrolet dealer installs a new lower pinion bearing or replaces the steering-gear assembly when inspection shows damage.',
    ['Steering effort increases during left turns', 'High resistance followed by unintended assist to the right', 'Loss of intended steering control'],
    ['power rack-and-pinion gear, lower pinion bearing and retainer'],
  ),
  ignitionLate: recall(
    '04V036000',
    [1998, 1999, 2000, 2001],
    'electrical',
    'Ignition Switch Can Melt During an Extended Start Attempt',
    'Certain 1998-2001 Chevrolet Cavalier vehicles can send excessive current through the ignition switch when the key is held in Start during a no-start condition. The switch can melt and cause a steering-column or interior fire with the engine off and key removed.',
    'Check the VIN for recall completion. A Chevrolet dealer installs a protective relay kit, verifies that the vehicle starts with a charged battery and replaces the ignition switch if necessary.',
    ['No-start followed by an extended cranking attempt', 'Hot or damaged ignition switch', 'Smoke or fire from the steering column'],
    ['ignition switch, starter-current circuit and protective relay'],
  ),
  rearBelt: recall(
    '04V300000',
    [2004],
    'safety',
    'Rear Seat-Belt Anchorage Can Separate',
    'Certain 2004 Chevrolet Cavalier vehicles may have an incorrect nut and bolt at the passenger-side rear upper seat-belt anchorage. The anchorage can separate in a severe crash and reduce restraint effectiveness.',
    'Check the VIN for recall completion. A Chevrolet dealer inspects the anchorage and installs the correct nut and bolt when necessary.',
    ['Loose passenger-side rear upper seat-belt anchor', 'No reliable warning before a severe crash'],
    ['passenger-side rear upper seat-belt anchorage, nut and bolt'],
  ),
  rearLamps: recall(
    '04V524000',
    [2003],
    'electrical',
    'Rear Stop and Turn-Signal Lamps Can Stop Working',
    'Certain 2003 Chevrolet Cavalier vehicles can lose rear stop-lamp, turn-signal or tail-lamp operation because of inadequate electrical contact between a bulb and its socket.',
    'Check the VIN for recall completion. A Chevrolet dealer inspects the rear-lamp bulb sockets and applies grease or replaces the socket assemblies as necessary.',
    ['Rear brake lamp does not illuminate', 'Rear turn signal does not illuminate', 'Cruise control disengages or will not engage when rear lamps fail'],
    ['rear combination-lamp bulbs and socket assemblies'],
  ),
};

const assignments = {
  'chevrolet-cavalier-coolant-leak-2002': 'rearLamps',
  'chevrolet-cavalier-head-gasket-22l-1995': 'steering',
  'chevrolet-cavalier-ignition-switch-1995': 'ignitionEarly',
  'chevy-cavalier-intake-gasket-leak-1995': 'rearBelt',
  'chevy-cavalier-pass-lock-2000': 'ignitionLate',
};

const published = Object.fromEntries(
  Object.entries(assignments).map(([id, key]) => {
    const card = campaigns[key];
    return [
      id,
      {
        disposition: 'replace',
        decision: `Replace the frozen unsupported or over-broad Cavalier card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
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
          summary: `Replaced an unsupported or over-broad Cavalier card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
        },
      },
    ];
  }),
);

module.exports = buildConfig({
  label: 'Chevrolet Cavalier',
  make: 'Chevrolet',
  model: 'Cavalier',
  slug: 'chevrolet-cavalier',
  batchId: 'chevrolet-cavalier-full-record-cohort-12-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'b66d6bd708236f143df6522d6229e038af1f65b6574ec22178af7939bd02a557',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-cavalier/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletcavalier_blind:self-no-blocker',
    edge: 'chevroletcavalier_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
