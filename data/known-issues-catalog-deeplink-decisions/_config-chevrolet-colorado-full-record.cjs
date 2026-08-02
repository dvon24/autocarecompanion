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
  capacityLabel: recall(
    '05V552000', [2006], 'safety', 'Tire and Loading Label Lists the Wrong Capacity',
    'Certain 2006 Chevrolet Colorado trucks have a tire and loading label with an inaccurate vehicle capacity weight. Following the wrong load or inflation information can contribute to tire failure.',
    'Check the VIN for recall completion. GM supplies a corrected label, which the owner or a Chevrolet dealer installs.',
    ['Door label lists an incorrect capacity weight', 'Risk of improper loading or tire inflation'],
    ['tire and loading information label']),
  brakeSwitch: recall(
    '06V139000', [2004, 2005, 2006], 'brakes', 'Brake Lamps Can Stay On or Stop Working',
    'Certain 2004-2006 Chevrolet Colorado trucks can permanently lose brake-lamp function or have brake lamps remain illuminated. The center high-mounted lamp, trailer lamps and cruise control can also be affected.',
    'Check the VIN for recall completion. A Chevrolet dealer replaces the brake-lamp switch assembly.',
    ['All brake lamps stay on', 'Brake lamps do not illuminate', 'Cruise control becomes inoperative'],
    ['brake-lamp switch, center high-mounted stop lamp and trailer-lamp circuit']),
  rimLabel: recall(
    '06V307000', [2007], 'safety', 'Certification Label Has an Incomplete Rim Designation',
    'Certain 2007 Chevrolet Colorado trucks have an incomplete rim designation on the door-edge certification and tire label. Reliance on that label can lead to installation of a wheel with the wrong rim contour.',
    'Check the VIN for recall completion. GM mails a corrected label, which the owner or dealer installs.',
    ['Door-edge label has incomplete rim information', 'Replacement wheel may not match the required rim contour'],
    ['certification label, tire label and wheel-rim specification']),
  fuelModule: recall(
    '09V154000', [2009], 'fuel', 'Water Can Enter the Fuel-System Control Module',
    'Certain 2009 Chevrolet Colorado trucks can admit water into the fuel-system control module through a separated housing seal. The module can short or open, causing diagnostic codes, hard starting, a no-start or an engine stall.',
    'Check the VIN for recall completion. A Chevrolet dealer installs a new fuel-system control module.',
    ['Service-engine-soon lamp', 'Hard start or no-start', 'Engine stalls while driving'],
    ['fuel-system control module, housing and RTV seal']),
  contaminatedBrakeSwitch: recall(
    '09V310000', [2004, 2005, 2006, 2007, 2008, 2009], 'brakes', 'Brake-Switch Contamination Can Disable Every Brake Lamp',
    'Certain 2004-2009 Chevrolet Colorado trucks sold or registered in the campaign states can have a contaminated brake-lamp switch. All brake lamps may fail together or stay on continuously.',
    'Check the VIN because the recall has a state-registration scope. A Chevrolet dealer inspects and replaces the specified brake-lamp components.',
    ['All brake lamps fail simultaneously', 'All brake lamps remain continuously illuminated'],
    ['brake-lamp switch and stop-lamp circuit'], { trims: ['Vehicles covered by the campaign state-registration scope'] }),
  childTether: recall(
    '10V575000', [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011], 'safety', 'Front-Center Child-Seat Tether Anchor Is Inaccessible',
    'Certain regular-cab and rear-seat-delete extended-cab Chevrolet Colorado trucks with a front 60/40 bench seat do not provide access or instructions for the front-center top tether anchor. This can lead to improper child-restraint installation.',
    'Check the VIN for recall completion. A Chevrolet dealer opens the back-panel trim for tether access and supplies corrected owner-manual instructions.',
    ['Front-center top tether cannot be accessed', 'Owner manual lacks tether-use instructions'],
    ['front-center child-restraint tether anchor and back-panel trim'], { trims: ['Regular cab or extended cab without a rear seat and with a front 60/40 split bench seat'] }),
  axlePin: recall(
    '11V007000', [2011], 'drivetrain', 'Rear-Axle Cross Pin Can Fracture and Lock the Axle',
    'Certain 2011 Chevrolet Colorado trucks have an improperly heat-treated rear-axle cross pin that can fracture, move out of position and lock the rear axle without warning.',
    'Check the VIN for recall completion. A Chevrolet dealer installs a new rear-axle cross pin.',
    ['Unexpected rear-axle lockup', 'Sudden loss of directional control'],
    ['rear-axle cross pin and differential']),
  wiperNut: recall(
    '11V276000', [2011], 'electrical', 'Loose Wiper-Motor Crank Nut Can Stop the Wipers',
    'Certain 2011 Chevrolet Colorado trucks may have an under-torqued wiper-motor crank-arm nut. Snow, ice or dry-glass operation can loosen it until the windshield wipers stop working.',
    'Check the VIN for recall completion. A Chevrolet dealer secures the wiper-motor crank-arm nut.',
    ['Wipers stop moving', 'Reduced visibility in rain or snow'],
    ['windshield-wiper motor, crank arm and retaining nut']),
  shiftClip: recall(
    '11V337000', [2011], 'transmission', 'Shift-Cable Clip Can Cause a False Park Indication',
    'Certain 2011 Chevrolet Colorado trucks with a 2.9L or 3.7L engine and four-speed automatic may have a shift-cable clip that does not retain the cable correctly. The lever can show Park while the transmission is not in Park, allowing rollaway.',
    'Check the VIN for recall completion. A Chevrolet dealer installs a new automatic-transmission adjustment clip.',
    ['Shift indicator does not match the actual gear', 'Key can be removed when the transmission is not in Park', 'Vehicle rolls after occupants exit'],
    ['automatic-transmission shift cable, adjustment clip and PRNDL indication'], { engines: ['2.9L', '3.7L'], trims: ['Four-speed automatic transmission'] }),
  beltConnector: recall(
    '11V552000', [2012], 'safety', 'Driver Seat-Belt Warning Connection Can Be Intermittent',
    'Certain 2012 Chevrolet Colorado trucks can have loose-fitting driver seat-belt buckle connector terminals. The driver may not receive the required visual or audible unfastened-belt warning.',
    'Check the VIN for recall completion. A Chevrolet dealer replaces the buckle electrical-connector terminals.',
    ['Seat-belt warning light or chime is intermittent', 'No warning when the driver belt is unfastened'],
    ['driver seat-belt buckle and electrical connector terminals']),
  hoodLatch: recall(
    '12V594000', [2010, 2011, 2012], 'body', 'Secondary Hood Latch May Be Missing',
    'Certain 2010-2012 Chevrolet Colorado trucks may be missing the secondary hood latch. If the primary latch is not engaged, the hood can open while driving and block the driver view.',
    'Check the VIN for recall completion. Inspect for the secondary latch; a Chevrolet dealer replaces the hood on affected vehicles.',
    ['Secondary hood latch is absent', 'Hood can open and obstruct forward vision'],
    ['hood and secondary hood-latch system']),
  airbagWiring: recall(
    '14V645000', [2015], 'safety', 'Driver Air-Bag Deployment Sequence Can Be Reversed',
    'Certain 2015 Chevrolet Colorado trucks have incorrectly wired driver-air-bag connections that can reverse the deployment sequence and disrupt inflation timing.',
    'Check the VIN for recall completion. A Chevrolet dealer reprograms the inflatable-restraint sensing and diagnostic module.',
    ['No reliable warning before a crash', 'Driver air bag may not deploy as designed'],
    ['driver air bag wiring and restraint sensing and diagnostic module']),
  airbagInflator: recall(
    '15V157000', [2015], 'safety', 'Driver Air-Bag Inflator Can Separate from Its Backplate',
    'Certain 2015 Chevrolet Colorado trucks have a driver frontal-air-bag inflator that may be misaligned with the module backplate. It can separate during deployment, propel components into the cabin and prevent proper inflation.',
    'Check the VIN for recall completion. A Chevrolet dealer inspects the alignment and replaces the driver-air-bag module when necessary.',
    ['No reliable warning before deployment', 'Inflator or steering-wheel components can become projectiles'],
    ['driver frontal-air-bag inflator, module and backplate']),
  seatHooks: recall(
    '15V267000', [2015], 'safety', 'Front-Seat Frame Hooks May Not Be Secured',
    'Certain 2015 Chevrolet Colorado trucks have driver or front-passenger seat-frame hooks that may not be properly attached to the body. The seat may not remain anchored in a crash.',
    'Check the VIN for recall completion. A Chevrolet dealer inspects and corrects the seat installation.',
    ['Loose or improperly anchored front seat', 'No reliable warning before a crash'],
    ['front-seat frames, attachment hooks and body anchors']),
  brakeCalipers: recall(
    '15V278000', [2015], 'brakes', 'Front Brake Calipers Can Leak Fluid',
    'Certain 2015 Chevrolet Colorado trucks have air-pocket imperfections in a front brake-caliper body that can leak brake fluid and increase stopping distance.',
    'Check the VIN for recall completion. A Chevrolet dealer inspects and replaces the front brake calipers as necessary.',
    ['Brake-fluid leak at a front caliper', 'Reduced braking performance', 'Longer stopping distance'],
    ['front hydraulic brake calipers']),
  highPressurePump: recall(
    '18V358000', [2016, 2017, 2018], 'fuel', 'High-Pressure Fuel Pump Can Detach and Damage the Fuel Line',
    'Certain 2016-2018 Chevrolet Colorado trucks can have the high-pressure fuel pump detach from its mounting flange and damage the high-pressure fuel line, causing a leak and fire risk.',
    'Check the VIN for recall completion. A Chevrolet dealer replaces the high-pressure fuel pump and pipe.',
    ['Fuel odor or leak', 'High-pressure pump moves from its flange', 'Fire risk near an ignition source'],
    ['high-pressure fuel pump, mounting flange and fuel pipe']),
  falseAeb: recall(
    '24V133000', [2023], 'electrical', 'Front Camera Can Trigger Unexpected Emergency Braking',
    'Certain 2023 Chevrolet Colorado trucks can have the front camera falsely detect an obstacle and command automatic emergency braking, abruptly slowing or stopping the vehicle.',
    'Check the VIN for recall completion. A Chevrolet dealer updates the front-camera-module software.',
    ['Unexpected automatic emergency braking', 'Abrupt slowing when no obstacle is present'],
    ['front camera module and automatic emergency braking software']),
  hubBolts: recall(
    '24V237000', [2023], 'suspension', 'Damaged Front Wheel-Hub Bolts Can Loosen or Break',
    'Certain 2023 Chevrolet Colorado trucks had front wheel-hub bolts over-tightened and damaged during assembly. The bolts can loosen or break and cause loss of vehicle control.',
    'Check the VIN for recall completion. A Chevrolet dealer replaces the left and right front wheel-hub bolts.',
    ['Loose or broken front wheel-hub bolt', 'Abnormal front-wheel looseness', 'Loss of vehicle control'],
    ['left and right front wheel hubs and mounting bolts']),
};

const assignments = {
  'chevrolet-colorado-abs-module-wheel-2004': 'brakeCalipers',
  'chevrolet-colorado-blower-motor-resistor-and-2004': 'wiperNut',
  'chevrolet-colorado-brake-light-switch-failure-2004': 'brakeSwitch',
  'chevrolet-colorado-cylinder-head-valve-seat-2004': 'axlePin',
  'chevrolet-colorado-evap-vent-valve-and-2004': 'fuelModule',
  'chevrolet-colorado-frame-rust-and-rear-2004': 'childTether',
  'chevrolet-colorado-fuel-level-sensor-failure-2004': 'contaminatedBrakeSwitch',
  'chevrolet-colorado-intermediate-steering-shaft-clunk-2004': 'rimLabel',
  'chevrolet-colorado-passlock-ignition-switch-failure-2004': 'shiftClip',
  'chevrolet-colorado-tail-lamp-circuit-board-2004': 'capacityLabel',
  'chevy-colorado-ac-compressor-2015': 'airbagWiring',
  'chevy-colorado-battery-drain-2015': 'airbagInflator',
  'chevy-colorado-diesel-emissions-2016': 'seatHooks',
  'chevy-colorado-infotainment-2015': 'beltConnector',
  'chevy-colorado-suspension-clunk-2015': 'hubBolts',
  'chevy-colorado-transfer-case-2015': 'hoodLatch',
  'chevy-colorado-transmission-shudder-2015': 'falseAeb',
  'chevy-colorado-water-pump-2015': 'highPressurePump',
};

const published = Object.fromEntries(
  Object.entries(assignments).map(([id, key]) => {
    const card = campaigns[key];
    return [id, {
      disposition: 'replace',
      decision: `Replace the frozen unsupported, over-broad or secondary-source Colorado card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
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
        summary: `Replaced an unsupported or mis-scoped Colorado card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
      },
    }];
  }),
);

module.exports = buildConfig({
  label: 'Chevrolet Colorado',
  make: 'Chevrolet',
  model: 'Colorado',
  slug: 'chevrolet-colorado',
  batchId: 'chevrolet-colorado-full-record-cohort-15-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '910b7fa32b246b041d59b6c31240513b4c59ac6349967050e84c74e93c88f030',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-colorado/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletcolorado_blind:self-no-blocker',
    edge: 'chevroletcolorado_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
