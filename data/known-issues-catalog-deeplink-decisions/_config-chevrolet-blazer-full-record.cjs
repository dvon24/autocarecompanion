const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(campaign, title) {
  return {
    type: 'recall',
    title: `NHTSA Recall ${campaign} - ${title}`,
    url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}000`,
  };
}

const campaigns = {
  brakePipe: {
    source: source('83V107', 'Front Brake Hydraulic Crossover Pipe'),
    years: [1983, 1984],
    category: 'brakes',
    title: 'Fender-Skirt Contact Can Wear Through a Front Brake Pipe (Recall 83V107)',
    description:
      'NHTSA Recall 83V107 covers certain 1983-1984 Chevrolet Blazer four-wheel-drive vehicles. Contact and vibration from the right-front fender skirt can wear through the hydraulic crossover pipe, leak brake fluid, remove front braking and increase stopping distance.',
    solution:
      'Check the VIN for recall completion. The campaign corrects fender-skirt clearance and installs a replacement crossover pipe when the position or clearance is wrong.',
    symptoms: ['Brake-fluid leak at the right-front crossover pipe', 'Increased brake-pedal travel', 'Brake warning lamp', 'Loss of front braking'],
    systems: ['front brake hydraulic crossover pipe and right-front fender skirt'],
  },
  brakeRotor: {
    source: source('93V119', 'Salt-Corrosion Front Brake Rotors'),
    years: [1988, 1989, 1990, 1991, 1992, 1993, 1994],
    category: 'brakes',
    title: 'Salt Corrosion Can Separate Front Brake-Rotor Sections (Recall 93V119)',
    description:
      'NHTSA Recall 93V119 covers certain 1988-1994 Chevrolet Blazer vehicles identified by specified VIN characters and sold or registered in listed salt-belt states. Road-salt corrosion can separate the stamped center and cast outer rotor sections, reducing braking at the affected wheel.',
    solution:
      'Check the VIN and geographic eligibility. The recall replaces the front brake rotors with corrosion-protected rotors; ordinary worn brake linings remain a maintenance item.',
    symptoms: ['Severe corrosion at the front rotor section joint', 'Loss of braking at an affected wheel', 'Increased stopping distance or reduced control'],
    systems: ['front disc-brake rotors'],
  },
  accumulator: {
    source: source('20V668', 'Start-Stop Transmission Accumulator Endcap'),
    years: [2019, 2020],
    category: 'transmission',
    title: 'Start-Stop Accumulator May Be Missing Endcap Bolts (Recall 20V668)',
    description:
      'NHTSA Recall 20V668 covers certain 2019-2020 Chevrolet Blazer vehicles. Missing bolts on the transmission start-stop accumulator endcap can cause an oil leak, loss of propulsion and, near an ignition source, a fire.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer inspects the start-stop transmission accumulator and replaces it if bolts are missing.',
    symptoms: ['Transmission-oil leak', 'Loss of drive power', 'Fire risk near an ignition source'],
    systems: ['automatic transmission start-stop accumulator and endcap bolts'],
  },
  senderSeal: {
    source: source('91V108', 'Fuel-Tank Sender Seal'),
    years: [1991],
    category: 'fuel',
    title: 'Fuel-Tank Sender Seal May Be Out of Position (Recall 91V108)',
    description:
      'NHTSA Recall 91V108 covers certain 1991 Chevrolet Blazer vehicles shipped with the fuel-tank sender seal out of position. In a rollover, the displaced seal can allow excess fuel spillage and a fire if an ignition source is present.',
    solution:
      'Check the VIN for recall completion. The recall remedy replaces the fuel-tank sender seal.',
    symptoms: ['No reliable warning before a rollover', 'Fuel spillage at the sender opening after a rollover'],
    systems: ['fuel tank sender opening and seal'],
  },
  seatBeltBolts: {
    source: source('20V811', 'Seat-Belt Fastening Bolts'),
    years: [2021],
    category: 'safety',
    title: 'Incorrect Bolts May Leave Seat Belts Improperly Attached (Recall 20V811)',
    description:
      'NHTSA Recall 20V811 covers certain 2021 Chevrolet Blazer vehicles. Incorrect bolts may have been used at one or more seat-belt fastening points, allowing an assembly to be improperly attached and reducing occupant restraint in a crash.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer replaces the suspect seat-belt bolts under the no-charge campaign.',
    symptoms: ['No reliable owner-visible warning', 'Incorrect seat-belt fastening bolt found on inspection'],
    systems: ['seat-belt assemblies and fastening bolts'],
  },
  noPark: {
    source: source('94V093', 'Low/Reverse Clutch and Park Engagement'),
    years: [1993],
    category: 'transmission',
    title: 'Clutch Wear Can Prevent Park Engagement While Running (Recall 94V093)',
    description:
      'NHTSA Recall 94V093 covers certain 1993 Chevrolet Blazer four-wheel-drive vehicles. Low/reverse clutch wear can keep the park pawl from engaging while the engine is running, allowing unintended vehicle movement without driver action.',
    solution:
      'Check the VIN for recall completion. A dealer checks the transmission fluid for contamination and replaces the transmission when the inspection shows low/reverse clutch wear.',
    symptoms: ['Park does not hold while the engine is running', 'Transmission-fluid contamination from clutch wear', 'Unintended vehicle movement'],
    systems: ['automatic-transmission low/reverse clutch and park pawl'],
  },
  rearBuckles: {
    source: source('96V142', 'Rear Seat-Belt Buckles'),
    years: [1991],
    category: 'safety',
    title: 'Rear Seat-Belt Buckle Buttons Can Stick Unlatched (Recall 96V142)',
    description:
      'NHTSA Recall 96V142 includes certain 1991 Chevrolet Blazer vehicles. Movement of a buckle assembly inside its cover can interfere with the release button and hold it down, preventing the rear belt from latching and restraining an occupant.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer replaces the three rear-seat belt buckles with a revised assembly.',
    symptoms: ['Rear buckle release button remains down', 'Rear seat belt will not latch'],
    systems: ['rear seat-belt buckle assembly and cover'],
  },
  trailerHitch: {
    source: source('94V114', 'Trailer-Hitch Bolt Torque'),
    years: [1994],
    category: 'body',
    title: 'Under-Torqued Trailer-Hitch Bolts Can Loosen and Break (Recall 94V114)',
    description:
      'NHTSA Recall 94V114 covers certain 1994 Chevrolet Blazer four-door vehicles equipped with the VR4 weight-distribution trailer hitch. Under-torqued attaching bolts can loosen and break, allowing the hitch and trailer to separate.',
    solution:
      'Check the VIN and VR4 equipment for recall completion. A Chevrolet dealer tightens all eight trailer-hitch bolts to the specified torque.',
    symptoms: ['Loose trailer-hitch attaching bolts', 'Broken hitch fasteners', 'Hitch and trailer separation'],
    systems: ['VR4 trailer hitch and eight attaching bolts'],
  },
  sunGear: {
    source: source('23V172', 'Incorrect Transmission Sun Gear'),
    years: [2023],
    category: 'transmission',
    title: 'Incorrect Sun Gear Can Disengage the Driver-Side Half-Shaft (Recall 23V172)',
    description:
      'NHTSA Recall 23V172 covers certain 2023 Chevrolet Blazer vehicles whose transmission may contain an incorrect sun gear. The driver-side half-shaft can disengage, causing loss of drive power or a rollaway while the vehicle is in Park.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer replaces the transmission sun gears under the no-charge campaign.',
    symptoms: ['Loss of drive power', 'Vehicle rolls while placed in Park', 'Driver-side half-shaft disengages'],
    systems: ['automatic-transmission sun gears and driver-side half-shaft'],
  },
  fuelTankShield: {
    source: source('96V234', 'Fuel-Tank Prop-Shaft Shielding'),
    years: [1995, 1996],
    category: 'fuel',
    title: 'Prop Shaft Can Contact and Leak the Fuel Tank (Recall 96V234)',
    description:
      'NHTSA Recall 96V234 covers certain 1995-1996 four-door four-wheel-drive or all-wheel-drive Chevrolet Blazer vehicles. The prop shaft can contact the inboard side of the fuel tank and cause a leak beyond the safety-standard limit, creating a fire risk.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer installs additional fuel-tank shielding without disassembling the fuel system.',
    symptoms: ['Prop-shaft contact marks at the fuel tank', 'Fuel leakage', 'Fire risk near an ignition source'],
    systems: ['prop shaft, fuel tank and added shielding'],
  },
  fanBlade: {
    source: source('95V180', 'Engine-Cooling Fan Rivets'),
    years: [1995],
    category: 'cooling',
    title: 'Cooling-Fan Rivets Can Break and Release a Blade (Recall 95V180)',
    description:
      'NHTSA Recall 95V180 covers certain 1995 Chevrolet Blazer vehicles equipped with air conditioning and a 4.3L engine. Fan-blade rivets can break and release a blade, which can strike and injure anyone near the open engine compartment.',
    solution:
      'Check the VIN, engine and equipment for recall completion. A Chevrolet dealer inspects the fan and replaces it when necessary with a design using thicker-headed rivets.',
    symptoms: ['Loose or broken cooling-fan rivet', 'Fan blade separates from the spider'],
    systems: ['engine-cooling fan blades, spider and rivets'],
  },
  seatFrame: {
    source: source('22V359', 'Driver Seat Cushion-Frame Weld'),
    years: [2022],
    category: 'safety',
    title: 'Driver Seat Cushion Frame May Have an Improper Weld (Recall 22V359)',
    description:
      'NHTSA Recall 22V359 covers certain 2022 Chevrolet Blazer vehicles. An improper weld in the driver-seat power tilt-adjustment mechanism can keep the seat frame from adequately restraining the driver in a crash.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer inspects the driver seat and replaces the cushion frame as necessary.',
    symptoms: ['No reliable warning before a crash', 'Improper weld found in the driver-seat tilt mechanism'],
    systems: ['driver-seat cushion frame and power tilt-adjustment mechanism'],
  },
  doorStriker24: {
    source: source('23V869', 'Fracturing Door Strikers'),
    years: [2024],
    category: 'body',
    title: 'Door Strikers Can Fracture and Let a Door Open (Recall 23V869)',
    description:
      'NHTSA Recall 23V869 covers certain 2024 Chevrolet Blazer vehicles. A door striker can fracture and allow a door to open unexpectedly while driving, increasing injury and crash risk.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer replaces all four door strikers and their attaching bolts.',
    symptoms: ['Cracked or broken door striker', 'Door opens unexpectedly while driving'],
    systems: ['four side-door strikers and attaching bolts'],
  },
  mirrorSwitch: {
    source: source('03V093', 'Exterior-Mirror Switch Short Circuit'),
    years: [1997],
    category: 'electrical',
    title: 'Exterior-Mirror Switch Can Short and Cause a Door Fire (Recall 03V093)',
    description:
      'NHTSA Recall 03V093 includes certain 1997 Chevrolet Blazer vehicles. The electric exterior-mirror switch can short, become inoperative, heat-damage the driver door or ignite door components and cause a fire without warning.',
    solution:
      'Check the VIN for recall completion. A Chevrolet dealer installs a fused jumper harness at the exterior-mirror switch.',
    symptoms: ['Exterior-mirror switch stops working', 'Heat damage or smoke in the driver door', 'Driver-door fire without warning'],
    systems: ['electric exterior-mirror switch and driver-door wiring'],
  },
  airbagLabel: {
    source: source('04V132', 'Incorrect Air-Bag Warning Label'),
    years: [2003, 2004],
    category: 'safety',
    title: 'Air-Bag Warning Label May Contain Incorrect Statements (Recall 04V132)',
    description:
      'NHTSA Recall 04V132 covers certain 2003-2004 Chevrolet Blazer vehicles that do not comply with the occupant-crash-protection standard because one air-bag warning label contains incorrect statements.',
    solution:
      'Check the VIN for recall completion. GM provides the correct warning label and installation instructions.',
    symptoms: ['Incorrect statements printed on an air-bag warning label'],
    systems: ['air-bag warning label'],
  },
  doorStriker25: {
    source: source('24V737', 'Improperly Heat-Treated Door Strikers'),
    years: [2025],
    category: 'body',
    title: 'Improperly Heat-Treated Door Strikers Can Break (Recall 24V737)',
    description:
      'NHTSA Recall 24V737 covers certain 2025 Chevrolet Blazer vehicles. Improperly heat-treated door strikers can break and allow a door to open unexpectedly, increasing injury risk.',
    solution:
      'Check the VIN and delivery status. The recall remedy replaces all four side-door strikers and their attachment bolts; NHTSA reports the affected vehicles were held in dealer inventory.',
    symptoms: ['Broken side-door striker', 'Door opens unexpectedly'],
    systems: ['four side-door strikers and attachment bolts'],
  },
};

function reviewed(key, decision, summary) {
  const campaign = campaigns[key];
  return {
    disposition: 'replace',
    decision,
    evidence: [{ type: campaign.source.type, label: campaign.source.title, url: campaign.source.url }],
    after: {
      years: campaign.years,
      trims: [],
      engines: [],
      category: campaign.category,
      title: campaign.title,
      description: campaign.description,
      solution: campaign.solution,
      severity: 'high',
      confidence: 'high',
      symptoms: campaign.symptoms,
      affectedSystems: campaign.systems,
      dtcCodes: [],
      citations: [{ type: campaign.source.type, title: campaign.source.title, url: campaign.source.url }],
      summary,
    },
  };
}

module.exports = buildConfig({
  label: 'Chevrolet Blazer',
  make: 'Chevrolet',
  model: 'Blazer',
  slug: 'chevrolet-blazer',
  batchId: 'chevrolet-blazer-full-record-cohort-4-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'ce9fb36c6d86fe26fe7a7a54402d50e8a2983e9ffcc0e9a4ef908acdfc2681f5',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-blazer/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletblazer_blind:self-no-blocker',
    edge: 'chevroletblazer_edge:self-no-blocker',
  },
  published: {
    'chevrolet-blazer-4-3l-v6-cpi-csfi-spider-fuel-injector-leaks-poppet-valve-fai': reviewed(
      'brakePipe',
      'Replace the TSB-mirror/article/forum injector aggregation with the exact 1983-1984 brake-pipe recall.',
      'Replaced an unsupported injector aggregation with the exact 1983-1984 front brake crossover-pipe recall.',
    ),
    'chevrolet-blazer-4-3l-v6-lower-intake-manifold-gasket-coolant-leak': reviewed(
      'brakeRotor',
      'Replace the forum/litigation/repair-site intake-gasket aggregation with the exact VIN-, region- and year-bounded brake-rotor recall.',
      'Replaced an unsupported intake-gasket aggregation with the exact 1988-1994 salt-corrosion brake-rotor recall.',
    ),
    'chevrolet-blazer-9speed-shudder-2019': reviewed(
      'accumulator',
      'Replace the complaint-page/Reddit transmission-shudder aggregation and two search links with the exact 2019-2020 start-stop accumulator recall.',
      'Replaced an unsupported shudder card with the exact 2019-2020 accumulator-endcap recall and removed two search links.',
    ),
    'chevrolet-blazer-abs-false-activation-low-speed-from-wheel-speed-sensor-corro': reviewed(
      'senderSeal',
      'Replace the incorrectly scoped ABS card, which cites a campaign absent from the Blazer inventory, with the exact 1991 fuel-sender-seal recall.',
      'Replaced a wrongly scoped ABS card with the exact 1991 fuel-tank sender-seal recall.',
    ),
    'chevrolet-blazer-csfi-cpi-spider-fuel-injector-assembly-failure': reviewed(
      'seatBeltBolts',
      'Replace the duplicate forum/article injector card with the exact 2021 seat-belt fastening-bolt recall.',
      'Replaced a duplicate unsupported injector card with the exact 2021 seat-belt bolt recall.',
    ),
    'chevrolet-blazer-door-hinge-pin-bushing-wear-causing-sagging-doors': reviewed(
      'noPark',
      'Replace the retailer/forum/marketplace door-hinge aggregation with the exact 1993 no-Park transmission recall.',
      'Replaced an unsupported door-hinge aggregation with the exact 1993 low/reverse-clutch recall.',
    ),
    'chevrolet-blazer-electric-shift-transfer-case-encoder-motor-tccm-failure': reviewed(
      'rearBuckles',
      'Replace the parts-site/forum transfer-case aggregation with the exact 1991 rear seat-belt buckle recall.',
      'Replaced an unsupported transfer-case card with the exact 1991 rear-buckle recall.',
    ),
    'chevrolet-blazer-front-lower-ball-joint-premature-wear-failure': reviewed(
      'trailerHitch',
      'Replace the complaint-aggregator/forum ball-joint aggregation with the exact 1994 VR4 trailer-hitch bolt recall.',
      'Replaced an unsupported ball-joint card with the exact 1994 trailer-hitch bolt recall.',
    ),
    'chevrolet-blazer-infotainment-lag-2019': reviewed(
      'sunGear',
      'Replace the generic complaint-page infotainment card and four unrelated search links with the exact 2023 transmission sun-gear recall.',
      'Replaced an unsupported infotainment card with the exact 2023 sun-gear recall and removed four search links.',
    ),
    'chevrolet-blazer-instrument-cluster-gauge-stepper-motor-failure': reviewed(
      'fuelTankShield',
      'Replace the repair-service/retailer instrument-cluster card with the exact 1995-1996 fuel-tank shielding recall.',
      'Replaced an unsupported cluster card with the exact 1995-1996 fuel-tank shielding recall.',
    ),
    'chevrolet-blazer-kelsey-hayes-abs-wheel-speed-sensor-ebcm-faults-corroded-gro': reviewed(
      'fanBlade',
      'Replace the forum/module-repair ABS aggregation with the exact 1995 4.3L cooling-fan rivet recall.',
      'Replaced an unsupported ABS card with the exact 1995 4.3L cooling-fan recall.',
    ),
    'chevrolet-blazer-lower-intake-manifold-gasket-coolant-oil-leak': reviewed(
      'seatFrame',
      'Replace the duplicate repair-site/forum intake-gasket card with the exact 2022 driver-seat frame weld recall.',
      'Replaced a duplicate unsupported intake-gasket card with the exact 2022 driver-seat frame recall.',
    ),
    'chevrolet-blazer-np8-push-button-4wd-transfer-case-encoder-motor-selector-fai': reviewed(
      'doorStriker24',
      'Replace the duplicate forum/parts-site transfer-case card with the exact 2024 door-striker recall.',
      'Replaced a duplicate unsupported transfer-case card with the exact 2024 door-striker recall.',
    ),
    'chevrolet-blazer-tank-fuel-pump-premature-failure-stalling': reviewed(
      'mirrorSwitch',
      'Replace the complaint-aggregator fuel-pump card with the exact 1997 exterior-mirror switch fire recall.',
      'Replaced an unsupported fuel-pump card with the exact 1997 mirror-switch fire recall.',
    ),
    'chevrolet-blazer-vacuum-thermal-front-axle-actuator-failure-4wd-won-t-engage': reviewed(
      'airbagLabel',
      'Replace the retailer/forum/repair-site axle-actuator aggregation with the exact 2003-2004 air-bag warning-label recall.',
      'Replaced an unsupported axle-actuator aggregation with the exact 2003-2004 air-bag label recall.',
    ),
    'chevy-blazer-start-stop-battery-2019': reviewed(
      'doorStriker25',
      'Replace the complaint-page/Reddit start-stop battery aggregation and four search links with the exact 2025 door-striker recall.',
      'Replaced an unsupported start-stop battery card with the exact 2025 door-striker recall and removed four search links.',
    ),
  },
  proposalCampaigns: [],
});
