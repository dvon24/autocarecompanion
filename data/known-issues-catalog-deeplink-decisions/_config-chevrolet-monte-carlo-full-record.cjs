const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recallEvidence(campaign, title) {
  return {
    type: 'recall',
    label: `NHTSA Recall ${campaign.slice(0, 6)} - ${title}`,
    url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`,
  };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.evidence,
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: 'high',
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.evidence.map(({ label, url }) => ({
        type: 'recall',
        title: label,
        url,
      })),
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const oilFireEvidence = [
  recallEvidence('15V701000', 'Front Valve-Cover Oil Leak Can Cause an Engine Fire'),
];
const ignitionEvidence = [
  recallEvidence('14V400000', 'Ignition Switch Can Move Out of Run on 2000-2005 Vehicles'),
  recallEvidence('14V355000', 'Ignition Switch Can Move Out of Run on 2006-2007 Vehicles'),
];
const airbagEvidence = [
  recallEvidence('00V244000', 'Air-Bag Sensing Module Memory Error Can Prevent Deployment'),
];
const caliperEvidence = [
  recallEvidence('04V287000', 'Under-Torqued Front Caliper Bolts Can Reduce Braking or Steering'),
];

const cards = {
  oilFire: {
    years: [2000, 2001, 2002, 2003, 2004],
    category: 'engine',
    title: 'Front Valve-Cover Oil Leak Can Cause an Engine Fire (Recall 15V701)',
    description: 'Certain 2000-2004 Chevrolet Monte Carlo vehicles previously covered by earlier 3.8L engine oil-leak recalls remained at risk after the original remedy. Engine oil can drip onto the hot exhaust manifold and ignite, including while the vehicle is unattended.',
    solution: 'Check the VIN and campaign history for recall 15V701 and the superseded campaigns it references. Until the improved remedy is confirmed complete, follow GM and NHTSA guidance to park the vehicle outside and away from structures. The dealer remedy replaces the front valve cover and gasket; vehicles awaiting an older remedy receive the improved repair under the applicable campaign.',
    symptoms: [
      'Burning-oil odor from the engine compartment',
      'Smoke or flame near the front exhaust manifold',
      'Oil residue around the front valve cover or exhaust manifold',
      'Fire risk may remain after an older recall repair',
    ],
    affectedSystems: [
      'front valve cover and gasket',
      'exhaust manifold and nearby ignition-wire channel',
    ],
    evidence: oilFireEvidence,
    summary: 'Replaced the unsupported intake-gasket aggregation with exact recall 15V701, added the park-outside warning and improved dealer remedy, and removed two unverified radiator and coolant commerce searches.',
  },
  ignition: {
    years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007],
    category: 'electrical',
    title: 'Ignition Switch Can Move Out of Run (Recalls 14V400 and 14V355)',
    description: 'Chevrolet Monte Carlo vehicles from 2000-2005 are covered by recall 14V400, and 2006-2007 vehicles are covered by recall 14V355, for an ignition switch that can move out of Run because of key-ring weight, road conditions or another jarring event. The engine can shut off. Both campaigns warn that the air bags may not deploy; the 2006-2007 campaign also warns that lost engine power, power steering and power braking can increase crash risk.',
    solution: 'Check the VIN for the campaign assigned to the model year. Until the recall remedy is confirmed, remove every other item and the key fob from the key ring so only the ignition key remains. A Chevrolet dealer installs the specified key rings plus a key-slot insert or key-head cover free of charge.',
    symptoms: [
      'Engine shuts off after a bump or key-ring movement',
      'Loss of power steering or braking assist after ignition moves out of Run, as described for 2006-2007 vehicles',
      'Electrical accessories turn off unexpectedly',
      'Air bags may not deploy when the key is outside Run',
    ],
    affectedSystems: [
      'ignition switch, key and key ring',
      'engine power, steering assist, braking assist and air bags',
    ],
    evidence: ignitionEvidence,
    summary: 'Replaced the unsupported supercharger-coupler card with the exact 2000-2007 ignition-switch campaigns and removed two unrelated scanner and maintenance commerce searches.',
  },
  airbag: {
    years: [2001],
    category: 'safety',
    title: 'Air-Bag Sensing Module Memory Error Can Prevent Deployment (Recall 00V244)',
    description: 'Certain 2001 Chevrolet Monte Carlo sensing and diagnostic modules can experience a memory error that prevents the air bags from deploying as intended in a crash, increasing the risk of serious injury to front-seat occupants.',
    solution: 'Check the VIN and historical campaign completion for recall 00V244. A Chevrolet dealer replaces the air-bag sensing and diagnostic module. Do not treat a currently unlit warning lamp as proof that the campaign is complete.',
    symptoms: [
      'The module may store a memory error',
      'Air bags may not deploy in a crash',
      'There may be no reliable advance warning of failed deployment',
    ],
    affectedSystems: [
      'air-bag sensing and diagnostic module',
      'driver and passenger frontal air bags',
    ],
    evidence: airbagEvidence,
    summary: 'Replaced the unsupported window-regulator card with exact recall 00V244 and removed its generic window-regulator commerce search.',
  },
  caliper: {
    years: [2004],
    category: 'brakes',
    title: 'Under-Torqued Front Caliper Bolts Can Reduce Braking or Steering (Recall 04V287)',
    description: 'Certain 2004 Chevrolet Monte Carlo vehicles were built with both front brake-caliper-to-steering-knuckle bolts below the specified torque. A bolt can back out or fracture, allowing caliper movement that can lock a wheel, sever a brake hose, reduce braking or abruptly steer the vehicle.',
    solution: 'Check the VIN and historical campaign completion for recall 04V287. A Chevrolet dealer tightens both front caliper attachment bolts to the specified torque. Do not substitute wheel-speed sensors or an ABS module without diagnosis; those parts are not the recall remedy.',
    symptoms: [
      'Noise from a front wheel during braking',
      'Abrupt pull or steering input toward a locked wheel',
      'Increased brake-pedal travel or reduced braking',
      'Loose, backed-out or fractured front caliper attachment bolt',
    ],
    affectedSystems: [
      'front brake caliper brackets and attachment bolts',
      'steering knuckles and front brake hoses',
    ],
    evidence: caliperEvidence,
    summary: 'Replaced the unsupported ABS-module aggregation with exact recall 04V287, clarified the bolt-torque remedy, and removed two unrelated wheel-speed-sensor commerce searches.',
  },
};

const published = {
  'chevrolet-monte-carlo-38l-intake-gasket-2000': replacement(
    cards.oilFire,
    'Replace the secondary-source intake-gasket aggregation with exact recall 15V701. ShowMeTheParts returned multiple radiator fitments but catalog fitment does not establish the recalled failure or remedy, so both radiator and coolant searches are removed.',
  ),
  'chevrolet-monte-carlo-supercharger-coupler-2000': replacement(
    cards.ignition,
    'Replace the unsupported supercharger-coupler card with the two exact ignition-switch recalls spanning 2000-2007. The scanner and oil-maintenance searches neither diagnose nor repair the frozen claim and are removed.',
  ),
  'chevrolet-monte-carlo-window-regulator-2000': replacement(
    cards.airbag,
    'Replace the YouTube-supported window-regulator card with exact recall 00V244. ShowMeTheParts returned several regulator applications but does not prove a model-wide regulator defect or a single correct side and option fitment, so the generic retailer search is removed.',
  ),
  'chevy-monte-carlo-abs-module-2000': replacement(
    cards.caliper,
    'Replace the unsupported ABS-module aggregation with exact recall 04V287. The recall remedy is caliper-bolt torque, not an ABS module or wheel-speed sensor, so both unrelated sensor searches are removed.',
  ),
};

module.exports = buildConfig({
  label: 'Chevrolet Monte Carlo',
  make: 'Chevrolet',
  model: 'Monte Carlo',
  slug: 'chevrolet-monte-carlo',
  batchId: 'chevrolet-monte-carlo-full-record-cohort-27-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'ac5b531f181971062c6db6e6f31e27786198c768db62006711ec28a2a3b398fe',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-monte-carlo/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletmontecarlo_blind:self-no-blocker',
    edge: 'chevroletmontecarlo_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
