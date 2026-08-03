const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const sources = {
  afm: source(
    'tsb',
    'GM Service Bulletin 15-06-01-002O - Engine Misfire/Tick Noise and DTC P0300',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10233332-0001.pdf',
  ),
  wheelSpeed: source(
    'recall',
    'NHTSA Recall 05V-379 / GM 05068B - Front Wheel Speed Sensor Corrosion',
    'https://static.nhtsa.gov/odi/rcl/2005/RCRIT-05V379-3476.pdf',
  ),
  throttle: source(
    'tsb',
    'GM Preliminary Information PIP4578B - Throttle-Body Carbon and Idle Learn',
    'https://static.nhtsa.gov/odi/tsbs/2017/MC-10126975-9999.pdf',
  ),
  steering: source(
    'tsb',
    'GM Preliminary Information PIT5452 - Upper Steering Column Click While Turning',
    'https://static.nhtsa.gov/odi/tsbs/2015/MC-10114895-9999.pdf',
  ),
  coldStart: source(
    'tsb',
    'GM Service Bulletin 01-06-01-028C - Engine Knock on Cold Start',
    'https://static.nhtsa.gov/odi/tsbs/2016/SB-10078428-7690.pdf',
  ),
  brakePipes: source(
    'nhtsa',
    'NHTSA Engineering Analysis EA11-001 Closing Report - GMT800 Brake Pipe Corrosion',
    'https://static.nhtsa.gov/odi/inv/2011/INCR-EA11001-50409.pdf',
  ),
};

const cards = {
  afm: {
    years: [2015, 2016, 2017, 2018, 2019, 2020],
    engines: ['5.3L (RPO L83 or L8B)', '6.2L (RPO L86)'],
    category: 'engine',
    title: 'Collapsed or Stuck AFM Lifter Can Cause a Misfire or Tick (15-06-01-002O)',
    description: 'GM bulletin 15-06-01-002O applies to 2015-2020 Suburban vehicles with the listed 5.3L or 6.2L engines. A mechanically collapsed or stuck Active Fuel Management lifter, a damaged internal locking pin, a lifter stuck in its bore, or a bent pushrod can produce a tick, misfire, illuminated MIL and stored P0300. The bulletin does not establish inevitable failure on every AFM/DFM engine from 2007 through 2025.',
    solution: 'Follow GM service-information diagnosis and verify valve operation. If the affected valve is not moving, the bulletin directs inspection of the camshaft and lifters and replacement of the valve-lifter oil manifold and affected bank of AFM lifters as indicated. Replace a damaged camshaft only when inspection confirms excessive lobe or roller wear; do not disable AFM or replace every lifter based only on a generic misfire code.',
    severity: 'high',
    symptoms: [
      'Consistent engine tick from the valvetrain',
      'Engine misfire with MIL illuminated',
      'DTC P0300 after diagnosis isolates the valve operation concern',
      'Confirmed collapsed or stuck AFM lifter or bent pushrod',
    ],
    affectedSystems: ['Active Fuel Management lifters', 'valve-lifter oil manifold', 'pushrods and camshaft lobes'],
    sources: [sources.afm],
    summary: 'Narrowed the 2007-2025 AFM/DFM failure aggregation to bulletin 15-06-01-002O\'s exact 2015-2020 engines, symptoms, diagnostic branches and affected-bank repair.',
  },
  wheelSpeed: {
    years: [2000, 2001, 2002],
    trims: ['Vehicles registered in the severe-corrosion areas defined by recall 05V-379'],
    category: 'suspension',
    title: 'Front Wheel-Speed Sensor Corrosion Can Cause Unwanted Low-Speed ABS Activation (05V-379)',
    description: 'NHTSA recall 05V-379 covers certain 2000-2002 Suburban vehicles that were registered in specified severe-corrosion areas. Corrosion between a front hub/bearing assembly and its wheel-speed sensor can reduce the sensor signal and trigger unwanted ABS activation while braking between about 3.7 and 10 mph, which can lengthen the stop. The recall does not describe a 1994-2007 wheel-bearing failure or make an ABS lamp the defining symptom.',
    solution: 'Check the VIN for recall 05V-379. The dealer procedure is to inspect, clean and treat the affected front sensor mounting areas and replace a wheel-speed sensor only when its measured output remains below specification. Do not replace the complete hub or both bearings solely from the old card.',
    severity: 'high',
    symptoms: [
      'Unwanted ABS activation during braking below about 10 mph',
      'Longer stopping distance during the low-speed activation',
      'VIN and registration history included in recall 05V-379',
    ],
    affectedSystems: ['front wheel-speed sensors', 'sensor mounting surfaces on front hubs', 'anti-lock braking control'],
    sources: [sources.wheelSpeed],
    summary: 'Replaced the 1994-2007 hub-bearing aggregation with recall 05V-379\'s exact 2000-2002 salt-area population, low-speed ABS symptom and sensor-mount cleaning/test remedy.',
  },
  throttle: {
    years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
    engines: ['V8 gasoline engines'],
    category: 'engine',
    title: 'Throttle-Body Carbon Can Cause Idle Surge, Hesitation or Reduced Power (PIP4578B)',
    description: 'GM preliminary information PIP4578B applies to 2006-2018 V8 Suburban vehicles. On a high-mileage vehicle, carbon buildup can cause the control module to learn an increased throttle-plate angle. Enough buildup can contribute to idle or deceleration surge, tip-in hesitation, reduced-engine-power mode and defined throttle/idle DTCs. This is not proof that the throttle body or accelerator pedal has failed.',
    solution: 'Use the bulletin and normal GM diagnostics to confirm the condition. If carbon buildup matches PIP4578B, clean the throttle body and perform the required throttle/idle learn reset with a scan tool. The relearn is also important after relevant module programming. Do not replace the throttle body, pedal assembly or wiring solely from a reduced-power message.',
    severity: 'medium',
    symptoms: [
      'Idle or deceleration surge on a high-mileage vehicle',
      'Tip-in hesitation',
      'Reduced Engine Power message with a bulletin-listed throttle or idle DTC',
      'Condition follows substantial throttle-body carbon buildup',
    ],
    affectedSystems: ['electronic throttle body', 'ECM learned throttle angle', 'throttle/idle learn values'],
    sources: [sources.throttle],
    summary: 'Replaced the 2003-2007 TAC-failure diagnosis with PIP4578B\'s exact 2006-2018 V8 carbon-buildup mechanism, symptom set, cleaning and idle-relearn procedure.',
  },
  steering: {
    years: [2015],
    trims: ['Power tilt and telescoping steering column (RPO N38)'],
    category: 'steering',
    title: 'Upper Steering-Column Bearing Race Can Click During Low-Speed Turns (PIT5452)',
    description: 'GM preliminary information PIT5452 applies to the 2015 Suburban with the power tilt and telescoping column. A slightly misaligned upper-column bearing race can create a pop, click, tick or snap while turning left or right during low-speed or parking maneuvers. The bulletin does not describe a steering-column lock failure, no-start condition or coverage through 2025.',
    solution: 'Confirm the noise and equipment match PIT5452 and rule out trim contact or an SIR-coil concern. GM specifically says not to replace the steering column; the repair replaces the upper bearing inner race, spring and seat using the service-information procedure.',
    severity: 'low',
    symptoms: [
      'Pop, click, tick or snap from the upper steering column',
      'Noise while turning at low speed',
      'Noise during parking maneuvers',
    ],
    affectedSystems: ['upper steering-column bearing inner race', 'upper-column spring and seat'],
    sources: [sources.steering],
    summary: 'Replaced the 2015-2025 lock/electrical aggregation with PIT5452\'s exact 2015 N38 column noise, bearing-race cause and do-not-replace-the-column instruction.',
  },
  coldStart: {
    years: [2000, 2001, 2002, 2003, 2004, 2005, 2006],
    engines: ['5.3L or 6.0L gasoline engine'],
    category: 'engine',
    title: 'Brief Cold-Start Engine Knock Can Be a Non-Damaging Carbon/Piston Interaction (01-06-01-028C)',
    description: 'GM bulletin 01-06-01-028C covers C/K utility models with the listed engines, including the 2000-2006 Suburban population. The noise usually appears on initial start below 50°F and fades within about 5-30 seconds, though extreme cold can extend it. GM attributes the defined noise to interaction among piston motion, the cylinder wall and piston carbon and says its analysis found no effect on engine performance, reliability, durability or component life.',
    solution: 'First confirm the sound fits the bulletin\'s brief cold-start pattern and distinguish it from oil-pressure, valvetrain, bearing, accessory-drive or detonation noise. For the condition defined by 01-06-01-028C, GM does not recommend replacing pistons or the engine. Persistent, warm-engine or otherwise different knock still requires normal diagnosis.',
    severity: 'low',
    symptoms: [
      'Knock mainly during the first cold start',
      'Noise usually fades within 5-30 seconds',
      'Noise is more noticeable below about 50°F',
    ],
    affectedSystems: ['piston carbon and motion interaction', 'cylinder walls'],
    sources: [sources.coldStart],
    summary: 'Retained the documented cold-start sound while correcting the years/engines and removing the implication of damage, oil additives and piston or engine replacement.',
  },
  brakePipes: {
    years: [2000, 2001, 2002, 2003],
    trims: ['GMT800 Suburban vehicles in NHTSA-defined salt states'],
    category: 'brakes',
    title: 'Age- and Salt-Related Hydraulic Brake-Pipe Corrosion (NHTSA EA11-001)',
    description: 'NHTSA engineering analysis EA11-001 examined corrosion failures in model-year 1999-2003 GMT800 trucks and utilities in salt states, which intersects the 2000-2003 Suburban. The agency found failures strongly correlated with vehicle age and region and described general corrosion across the pipe assembly rather than a unique routing or retention defect. A ruptured pipe can reduce braking effectiveness, but NHTSA closed the investigation without identifying a safety-related defect or ordering a recall.',
    solution: 'On an older salt-exposed vehicle, have the full hydraulic pipe assembly inspected for leaks, heavy scaling, flaking and metal loss. The report says GM recommends replacing the entire pipe set when any pipe leaks or is corroded severely enough to require replacement, using the correct pre-formed kit. This is not a recall or automatic free repair, and surface appearance should be evaluated by a qualified brake technician.',
    severity: 'high',
    symptoms: [
      'Visible heavy scaling or flaking on hydraulic brake pipes',
      'Brake-fluid leak from a corroded pipe',
      'Red BRAKE warning after fluid loss or pressure imbalance',
      'Reduced braking effectiveness after a hydraulic circuit fails',
    ],
    affectedSystems: ['hydraulic brake-pipe assembly', 'front and rear brake circuits'],
    sources: [sources.brakePipes],
    summary: 'Corrected the 2007-2014 blanket rust claim to EA11-001\'s 2000-2003 Suburban intersection, salt/age correlation, complete-pipe inspection strategy and explicit no-recall conclusion.',
  },
};

const published = {
  'chevrolet-suburban-afm-dfm-lifter-failure-2007': replacement(cards.afm, 'Replace the 19-year inevitability narrative and universal parts list with bulletin 15-06-01-002O\'s exact 2015-2020 engines, diagnostic branches and affected-bank AFM repair.'),
  'chevrolet-suburban-front-wheel-hub-bearing-failure': replacement(cards.wheelSpeed, 'Replace the 1994-2007 wheel-bearing diagnosis with recall 05V-379\'s VIN/region-bounded wheel-speed-sensor corrosion and low-speed ABS condition.'),
  'chevrolet-suburban-reduced-engine-power-throttle-body-failure': replacement(cards.throttle, 'Replace the throttle-body-failure assumption with PIP4578B\'s 2006-2018 V8 carbon-buildup diagnosis, cleaning and idle-relearn procedure.'),
  'chevrolet-suburban-steering-column-lock-2015': replacement(cards.steering, 'Replace the lock/no-start/electrical aggregation with PIT5452\'s exact 2015 N38 upper-column bearing-race noise and component-level repair.'),
  'chevrolet-suburban-vortec-v8-cold-start-piston-slap': replacement(cards.coldStart, 'Retain only bulletin 01-06-01-028C\'s brief non-damaging cold-start knock pattern and its explicit no-piston/no-engine-replacement guidance.'),
  'chevy-suburban-brake-lines-2007': replacement(cards.brakePipes, 'Replace the 2007-2014 rust-belt generalization with NHTSA EA11-001\'s exact subject years, salt/age findings, complete-set inspection/repair guidance and no-defect/no-recall conclusion.'),
};

const reasons = {
  'chevrolet-suburban-4l60e-transmission-3-4-clutch-failure-loss-3rd-4th': 'The frozen card spans 13 years and two vehicle generations, treats P0748/P1870 as proof of one clutch failure and recommends a rebuild kit, servo, cooler and complete transmission from forum material. Current GM/NHTSA primary research did not establish that universal mechanism or repair.',
  'chevrolet-suburban-5-7l-vortec-csfi-spider-poppet-injector-failure': 'The card turns multi-cause lean/rich/misfire codes into a five-year injector diagnosis and prescribes an aftermarket conversion kit from forum and how-to sources. Current GM/NHTSA primary research did not establish the complete claimed population and universal conversion remedy.',
  'chevrolet-suburban-dashboard-cracking-2007': 'A Reddit post and generic repair products do not establish a VIN/year population, failure mechanism or manufacturer remedy for the asserted 2007-2014 dashboard-cracking issue.',
  'chevrolet-suburban-erratic-fuel-gauge-fuel-level-sensor-failure': 'The frozen card treats generic P0461/P0463 and repair-advice pages as proof that 1999-2006 sending units universally wear out and require a pump module. Current primary research did not verify that exact population or parts sequence.',
  'chevrolet-suburban-exhaust-manifold-bolt-breakage-cold-start-tick': 'Forum threads do not establish that every 1999-2007 Suburban cold-start tick is a broken rear manifold bolt, nor do they support a universal clamp, gasket and hardware repair without inspection.',
  'chevrolet-suburban-hvac-blend-door-actuator-failure': 'The frozen card spans nine years and assigns any dashboard click or temperature imbalance to a specific actuator using a retailer page and forum thread. Current primary research did not establish one actuator, population or repair.',
  'chevrolet-suburban-instrument-cluster-gauge-failure': 'The frozen card cites only a repair seller and a forum how-to and assumes the stepper motor for every gauge symptom. Current accessible GM/NHTSA primary material did not validate its 2003-2006 scope and solder-in repair instructions.',
  'chevrolet-suburban-knock-sensor-connector-corrosion': 'The card assigns P0327/P0332 across seven years to water-corroded under-intake sensors and promotes a generic Amazon kit. Those codes have multiple circuit causes, and current primary research did not establish the frozen population or universal silicone-sealing repair.',
  'chevrolet-suburban-rear-ac-line-corrosion-2007': 'The no-citation card spans 2007-2020 and prescribes line-splice kits and refrigerant products without an exact GM/NHTSA population, leak location, diagnostic procedure or remedy.',
  'chevrolet-suburban-steering-intermediate-shaft-clunk': 'Secondary repair articles do not establish the frozen 2000-2006 population or prove that a steering clunk requires shaft replacement rather than diagnosis of other column and front-end sources.',
  'chevrolet-suburban-transfer-case-fluid-leak-2000': 'A single Reddit thread cannot support a 26-year transfer-case leak population, a pump-rub mechanism across multiple transfer-case designs, or the promoted aftermarket case-half and pump-plate products.',
  'chevrolet-suburban-vortec-intake-manifold-gasket-leak': 'The frozen card combines vacuum, oil and lean-code symptoms across several engines and years using secondary sources. Current primary research did not establish one intake-gasket mechanism or a universal gasket and knock-sensor replacement sequence.',
  'chevy-suburban-transmission-shudder-2015': 'The cited forum and class-action page do not establish a 2015-2020 Suburban 8L90 population. GM bulletin 18-NA-355 lists other 8L45/8L90 applications but does not list the Suburban, so its fluid-exchange procedure must not be imported into this card.',
};

module.exports = buildConfig({
  label: 'Chevrolet Suburban',
  make: 'Chevrolet',
  model: 'Suburban',
  slug: 'chevrolet-suburban',
  batchId: 'chevrolet-suburban-full-record-cohort-39-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '9ce11ee67d867bf71d878bf1826c40b151f2df93f510aa7a5a97ca3c85dc02da',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-suburban/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletsuburban_blind:manual-primary-source-gate',
    edge: 'chevroletsuburban_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
