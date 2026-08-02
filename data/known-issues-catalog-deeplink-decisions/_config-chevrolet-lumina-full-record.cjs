const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recall(campaign, category, title, description, solution, symptoms, affectedSystems) {
  const shortCampaign = campaign.slice(0, 6);
  const sourceTitle = `NHTSA Recall ${shortCampaign} - ${title}`;
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
  return {
    years: [1995],
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
  ballJoint: recall('94V230000', 'suspension', 'Right Lower Ball-Joint Mount Can Fracture',
    'Certain 1995 Chevrolet Lumina right lower control arms have an incorrectly machined tapered ball-joint mounting hole. Movement at the attachment can fatigue and fracture the ball-joint stud, causing loss of steering control.',
    'Check historical campaign completion. A Chevrolet dealer replaces the right lower control arm and ball-joint stud.',
    ['Movement at the right lower ball-joint attachment', 'Ball-joint stud fractures', 'Loss of steering control'], ['right lower control arm, tapered mounting hole and ball-joint stud']),
  steeringBolts: recall('95V030000', 'steering', 'Steering-Column Support Bolts Can Loosen',
    'Certain 1995 Chevrolet Lumina steering-column support-bracket bolts were under-torqued during assembly. They can vibrate loose or fall out and cause loss of steering control.',
    'Check historical campaign completion. A Chevrolet dealer retorques all four support-bracket bolts to specification.',
    ['Loose steering-column support', 'Steering-column movement', 'Loss of steering control'], ['steering-column support bracket and four attachment bolts']),
  throttleBracket: recall('95V214000', 'engine', 'Throttle-Cable Bracket Can Inhibit Throttle Return',
    'Certain 1995 Chevrolet Lumina throttle-cable support brackets can contact the throttle-lever system and prevent the throttle from returning as quickly as intended.',
    'Check historical campaign completion. A Chevrolet dealer replaces the throttle-cable support bracket.',
    ['Engine speed stays higher than expected after pedal release', 'Throttle returns slowly'], ['throttle cable, support bracket and throttle lever']),
  wiperSwitch: recall('97V017000', 'electrical', 'Wiper-Switch Power Wire Can Separate',
    'Certain 1995 Chevrolet Lumina washer/wiper switch power-feed wires can be strained or separated. The wipers may work intermittently and eventually stop, reducing visibility in severe weather.',
    'Check historical campaign completion. A Chevrolet dealer replaces the older washer/wiper switch with the redesigned switch.',
    ['Windshield wipers work intermittently', 'Wipers become inoperative', 'Reduced visibility in bad weather'], ['washer/wiper switch and power-feed wire']),
};

const assignments = {
  'chevrolet-lumina-31l-intake-gasket-1995': 'ballJoint',
  'chevrolet-lumina-4t60e-transmission-1995': 'steeringBolts',
  'chevrolet-lumina-power-window-motor-1995': 'wiperSwitch',
  'chevy-lumina-crankshaft-sensor-1995': 'throttleBracket',
};

const published = Object.fromEntries(Object.entries(assignments).map(([id, key]) => {
  const card = campaigns[key];
  return [id, {
    disposition: 'replace',
    decision: `Replace the frozen unsupported or secondary-source Lumina card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
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
      summary: `Replaced an unsupported or mis-scoped Lumina card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
    },
  }];
}));

module.exports = buildConfig({
  label: 'Chevrolet Lumina',
  make: 'Chevrolet',
  model: 'Lumina',
  slug: 'chevrolet-lumina',
  batchId: 'chevrolet-lumina-full-record-cohort-24-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '59b2a688c3617a50710ddfc64696c221a31bcaf749499ddca5a7e79ece2c013f',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-lumina/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletlumina_blind:self-no-blocker',
    edge: 'chevroletlumina_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
