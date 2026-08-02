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
  manual: recall(
    '90V065000', [1990], 'safety', 'Owner Manual Omits Rear-Center Seat-Belt Information',
    'Certain 1990 Chevrolet Corsica vehicles were delivered with owner manuals that omit required instructions for the rear-center seat belt.',
    'Check historical recall records. The campaign inserts the missing rear-center seat-belt information into the owner manual.',
    ['Owner manual lacks rear-center seat-belt instructions'],
    ['owner manual and rear-center seat-belt instructions']),
  steeringNut: recall(
    '91V083000', [1991], 'steering', 'Loose Steering-Wheel Nut Can Allow Separation',
    'Certain 1991 Chevrolet Corsica vehicles may have an improperly tightened steering-wheel retaining nut. The steering wheel can separate from the column and cause loss of control.',
    'Check the VIN and historical service records for campaign completion. The recall tightens the retaining nut to the specified torque.',
    ['Loose steering wheel', 'Steering wheel separates from the column', 'Sudden loss of steering control'],
    ['steering wheel, steering column and retaining nut']),
  beltRetractor: recall(
    '91V206000', [1988, 1989, 1990], 'safety', 'Front Shoulder-Belt Retractors May Not Lock',
    'Certain 1988-1990 Chevrolet Corsica vehicles can have front shoulder-belt retractors with insufficient lock sensitivity. The shoulder belt may not lock during sudden deceleration or a crash.',
    'Check the VIN and historical recall records with Chevrolet. The current NHTSA campaign record does not publish a corrective-action description, so do not infer or perform a universal repair from this card.',
    ['Front shoulder belt does not lock during sudden deceleration', 'Occupant may be restrained only by the lap belt'],
    ['front shoulder-belt retractors and lock mechanism']),
  stopLamp: recall(
    '92V185000', [1992], 'brakes', 'Stop-Lamp Switch Can Fail',
    'Certain 1992 Chevrolet Corsica vehicles can have an inoperative service-brake stop-lamp switch. The rear stop lamps then fail to illuminate when the brake pedal is pressed.',
    'Check the VIN for recall completion. The campaign replaces the stop-lamp switch and corrects the switch-harness connector wiring.',
    ['Brake lamps do not illuminate when braking', 'Following drivers receive no braking warning'],
    ['service-brake stop-lamp switch and harness connector']),
  suspensionWeld: recall(
    '93V157000', [1994], 'suspension', 'Front Suspension-Support Weld Can Fail',
    'Certain 1994 Chevrolet Corsica vehicles have a suspension-support weld that may not meet specification. Failure can separate the front of the control arm, move the wheel from its intended position and severely impair steering.',
    'Check the VIN for recall completion. A Chevrolet dealer installs revised suspension supports with adequate weld integrity.',
    ['Front control arm separates from its support', 'Wheel moves substantially from its designed position', 'Steering control is severely impaired'],
    ['front suspension support, weld and control arm']),
};

const assignments = {
  'chevrolet-corsica-intake-gasket': 'manual',
  'chevrolet-corsica-trans-failure': 'beltRetractor',
  'chevrolet-corsica-window-motor': 'stopLamp',
  'chevy-corsica-head-gasket-1990': 'suspensionWeld',
  'chevy-corsica-ignition-module-1990': 'steeringNut',
};

const published = Object.fromEntries(
  Object.entries(assignments).map(([id, key]) => {
    const card = campaigns[key];
    return [id, {
      disposition: 'replace',
      decision: `Replace the frozen unsupported or secondary-source Corsica card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
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
        summary: `Replaced an unsupported Corsica card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
      },
    }];
  }),
);

module.exports = buildConfig({
  label: 'Chevrolet Corsica',
  make: 'Chevrolet',
  model: 'Corsica',
  slug: 'chevrolet-corsica',
  batchId: 'chevrolet-corsica-full-record-cohort-16-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'db5a27f8f28f0d1a5a02ea681a2c0a1cc72f154a5e354f4ce698c0c066c17e69',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-corsica/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletcorsica_blind:self-no-blocker',
    edge: 'chevroletcorsica_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
