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
  steeringShaft: recall(
    '66V032001',
    [1967],
    'steering',
    'Improperly Installed Steering Shaft Can Break',
    'Certain 1967 Chevrolet Chevelle vehicles can have an improperly installed steering shaft that binds and accumulates abnormal stress. The shaft can eventually break and cause complete loss of steering.',
    'Check historical service records for campaign completion. The recall replaces affected shafts with an improved design.',
    ['Steering binding may be subtle or not noticeable', 'Steering shaft fracture', 'Sudden loss of steering'],
    ['steering shaft and its installation'],
  ),
  brakePushrod: recall(
    '68V003000',
    [1968],
    'brakes',
    'Missing Brake Pushrod Locknut Can Limit Braking',
    'Certain 1968 Chevrolet Chevelle vehicles with power disc brakes may be missing the brake pushrod-to-clevis jam locknut. Thread wear can let the pedal reach the floor before the brakes are fully applied.',
    'Check historical service records for campaign completion. The recall installs the missing jam locknut.',
    ['Brake pedal travels unusually far', 'Brake pedal bottoms against the floor', 'Reduced maximum braking action'],
    ['power-disc-brake pushrod, clevis and jam locknut'],
    { trims: ['Power disc brake option'] },
  ),
  brakePipe: recall(
    '68V004000',
    [1968],
    'brakes',
    'Brake Pipe Can Chafe and Eliminate Front Braking',
    'Certain 1968 Chevrolet Chevelle vehicles can have insufficient clearance between a brake pipe and the engine oil pan or transmission oil-cooler lines. Contact can wear through the brake pipe and eliminate front-wheel braking action.',
    'Check historical service records for campaign completion. The recall reforms the brake pipe to provide adequate clearance.',
    ['Brake-fluid leak from a chafed pipe', 'Loss of front-wheel braking action', 'Longer stopping distance'],
    ['hydraulic brake pipe, engine oil pan and transmission oil-cooler lines'],
  ),
  cruiseChain: recall(
    '68V038000',
    [1968],
    'fuel',
    'Cruise Accelerator Chain Can Hold the Throttle Open',
    'Certain 1968 Chevrolet Chevelle vehicles can have a cruise-control accelerator chain catch on the carburetor secondary-throttle shaft. The throttle may then remain open instead of returning the engine to idle.',
    'Check historical service records for campaign completion. The recall inspects the accelerator chain and corrects its routing or interference as necessary.',
    ['Engine does not return to idle', 'Throttle remains open after accelerator release', 'Vehicle becomes difficult to slow or control'],
    ['cruise-control accelerator chain, carburetor throttle and secondary shaft'],
    { trims: ['Cruise-control-equipped vehicles'], engines: ['Carbureted engines'] },
  ),
  throttleClip1968: recall(
    '68V085000',
    [1968],
    'fuel',
    'Throttle Lever Can Catch on Its Retaining Clip',
    'Certain 1968 Chevrolet Chevelle vehicles can have the carburetor throttle lever interfere with its retaining clip, holding the throttle partly open and preventing a return to idle.',
    'Check historical service records for campaign completion. The recall installs an improved throttle-rod retaining clip where necessary.',
    ['Throttle does not return to idle', 'Engine speed stays elevated after accelerator release', 'Vehicle is difficult to stop'],
    ['carburetor throttle lever and throttle-rod retaining clip'],
    { engines: ['Carbureted engines'] },
  ),
  tireLabel: recall(
    '70V032000',
    [1970],
    'safety',
    'Tire-Information Decal Can Be Incorrect',
    'Certain 1970 Chevrolet Chevelle vehicles may have an incorrect tire-information decal, leaving owners with inaccurate tire specification or loading information.',
    'Check historical service records for campaign completion. The recall installs the correct tire-information decal where necessary.',
    ['Tire-information decal does not match the vehicle specification'],
    ['tire-information decal and vehicle loading information'],
  ),
  throttleClip1971: recall(
    '70V143000',
    [1971],
    'fuel',
    'Incorrect Throttle-Rod Clip Can Hold the Throttle Open',
    'Certain 1971 Chevrolet Chevelle vehicles can have an incorrectly installed carburetor throttle-rod retaining clip that holds the throttle partly open. The vehicle may not slow when the accelerator is released.',
    'Check historical service records for campaign completion. The recall replaces the retaining clip with an improved design where necessary.',
    ['Engine speed remains elevated after accelerator release', 'Vehicle does not slow normally', 'Throttle lever remains partly open'],
    ['carburetor throttle rod, throttle lever and retaining clip'],
    { engines: ['Carbureted engines'] },
  ),
};

const assignments = {
  'chevrolet-chevelle-big-block-overheating-marginal-factory-cooling-396-454': 'cruiseChain',
  'chevrolet-chevelle-cowl-windshield-channel-rust-water-leaks-into-cabin': 'steeringShaft',
  'chevrolet-chevelle-four-wheel-drum-brakes-no-stopping-power-horsepower': 'brakePushrod',
  'chevrolet-chevelle-frame-body-mount-rot-rear-crossmember-rails-rust-out': 'brakePipe',
  'chevrolet-chevelle-lower-body-rust-quarters-wheelhouses-floor-trunk-pans': 'tireLabel',
  'chevrolet-chevelle-rear-axle-wheel-hop-stamped-control-arms-soft-bushings-bind': 'throttleClip1968',
  'chevrolet-chevelle-tired-charging-points-ignition-generator-2-series-posi-faili': 'throttleClip1971',
};

const published = Object.fromEntries(
  Object.entries(assignments).map(([id, key]) => {
    const card = campaigns[key];
    return [
      id,
      {
        disposition: 'replace',
        decision: `Replace the frozen restoration, upgrade or normal-aging Chevelle narrative with the exact ${card.sourceTitle} primary record.`,
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
          summary: `Replaced an unsupported Chevelle restoration narrative with the exact ${card.sourceTitle} primary campaign.`,
        },
      },
    ];
  }),
);

module.exports = buildConfig({
  label: 'Chevrolet Chevelle',
  make: 'Chevrolet',
  model: 'Chevelle',
  slug: 'chevrolet-chevelle',
  batchId: 'chevrolet-chevelle-full-record-cohort-13-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'aade94f4008b04be950c2cc0a305433ac5f2c4a6d61ea19ea0b396cdf705140c',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-chevelle/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletchevelle_blind:self-no-blocker',
    edge: 'chevroletchevelle_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
