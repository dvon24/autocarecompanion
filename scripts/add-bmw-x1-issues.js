const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW X1 issues
// E84 X1 (2013-2015): N20 2.0L turbo
// F48 X1 (2016-2023): B46/B48 2.0L turbo (transverse FWD platform)

const bmwX1Issues = [
  {
    id: 'bmw-x1-n20-timing-chain-2013',
    make: 'BMW',
    model: 'X1',
    years: { start: 2013, end: 2015 },
    title: 'N20 Timing Chain Premature Failure - E84 X1',
    severity: 'high',
    description: 'The N20 2.0L turbocharged engine in 2013-2015 X1 models suffers from premature timing chain stretch and guide failure, typically between 40,000-80,000 miles. The single-row timing chain design is inadequate for the engine\'s power output and torque. Chain stretch causes timing to jump, leading to rough running, poor performance, and potential catastrophic engine damage if the chain breaks. BMW issued a class action settlement covering 8 years/100,000 miles. This is identical to the N20 timing chain issue in 328i, 428i, and other N20-powered models.',
    symptoms: [
      'Rattling noise from engine on cold start (first 5 seconds)',
      'Check engine light with timing correlation codes (P0016, P0017, P0018, P0019)',
      'Rough idle or misfires',
      'Loss of power or hesitation on acceleration',
      'Engine won\'t start after chain failure'
    ],
    solution: 'Complete timing chain kit replacement including chain, guides, tensioner, and sprockets. Must be performed by experienced BMW technician. Preventive replacement recommended at 60,000-80,000 miles. BMW extended warranty to 8 years/100,000 miles under class action settlement. Upgraded reinforced chain kit available from aftermarket suppliers. Labor is 8-12 hours due to tight engine bay in X1.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'Class Action Settlement - 8yr/100k miles coverage for N20 engine timing chain',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM Timing Chain Kit (11318648732KT) - complete replacement with all components',
        partBrand: 'BMW',
        partName: 'N20 Timing Chain Kit',
        partNumber: '11318648732KT',
        needsReview: true
      },
      {
        type: 'part',
        content: 'FCP Euro lifetime warranty timing chain kit - popular choice for preventive replacement',
        partBrand: 'FCP Euro',
        partName: 'Lifetime Warranty Timing Chain Kit',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your VIN is covered under class action settlement - BMW will cover costs up to 100k miles',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore chain rattle - complete failure will cause catastrophic engine damage ($15k+)',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-x1-transfer-case-2013',
    make: 'BMW',
    model: 'X1',
    years: { start: 2013, end: 2023 },
    title: 'Transfer Case Failure - xDrive Models E84/F48 X1',
    severity: 'moderate',
    description: 'BMW xDrive (AWD) X1 models use an electronically-controlled transfer case that commonly fails between 60,000-100,000 miles. The transfer case contains an actuator motor and clutch pack that wear out from normal use. Symptoms include grinding noises, AWD malfunction warnings, and the vehicle being stuck in FWD mode. The actuator motor is a common failure point and can be replaced separately, but complete transfer case failure requires full replacement. This issue affects all xDrive X1 models (both E84 and F48 generations).',
    symptoms: [
      'Grinding or whining noise from under vehicle',
      'AWD malfunction warning on dashboard',
      'Transfer case failsafe program message',
      'Vehicle stuck in front-wheel drive only',
      'Vibration during acceleration',
      'Fluid leak from transfer case area'
    ],
    solution: 'Diagnose specific failure point. Transfer case actuator motor can be replaced separately ($800-1,200) if caught early. Complete transfer case replacement required for internal failures ($2,500-4,000). Regular transfer case fluid changes every 50,000 miles may extend life. Some owners install aftermarket upgraded actuator motors for better durability. Common wear item on high-mileage xDrive models.',
    estimatedCost: { min: 800, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM transfer case actuator motor - most common failure, cheaper than full transfer case',
        partBrand: 'BMW',
        partName: 'Transfer Case Actuator Motor',
        partNumber: '27107566296',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change transfer case fluid every 50k miles - BMW says "lifetime" but preventive changes help',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t drive with transfer case warnings - can damage transmission and differential',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-x1-oil-leak-2016',
    make: 'BMW',
    model: 'X1',
    years: { start: 2016, end: 2023 },
    title: 'Oil Leaks - Valve Cover & Oil Filter Housing - F48 X1',
    severity: 'low',
    description: 'The F48 X1 (2016-2023) with B46/B48 engines commonly develops oil leaks from the valve cover gasket and oil filter housing gasket. The plastic valve cover warps from heat cycles, causing the gasket to fail and leak oil onto the exhaust manifold. The oil filter housing (integrated into the block) also develops leaks from its gasket. These are wear items that typically fail between 60,000-100,000 miles. Oil drips onto hot exhaust components, causing burning oil smell but rarely causing major issues if addressed promptly.',
    symptoms: [
      'Burning oil smell, especially after driving',
      'Visible oil on valve cover or around oil filter housing',
      'Low oil level warning (slow leak)',
      'Oil residue on engine bay components',
      'Smoke from engine bay when engine is hot'
    ],
    solution: 'Replace valve cover gasket and/or oil filter housing gasket as needed. Valve cover replacement is 2-3 hours labor. Oil filter housing gasket is 1-2 hours. Both are routine maintenance items on B-series engines. Use OEM gaskets for best longevity. Clean oil residue from engine bay after repair. Monitor oil level regularly to catch leaks early.',
    estimatedCost: { min: 400, max: 1200 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM valve cover gasket - better quality and longevity than aftermarket',
        partBrand: 'BMW',
        partName: 'Valve Cover Gasket',
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMW OEM oil filter housing gasket kit - includes all seals needed',
        partBrand: 'BMW',
        partName: 'Oil Filter Housing Gasket',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Fix oil leaks promptly - oil on exhaust can cause fires in rare cases',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'When replacing valve cover, also check PCV valve and replace if needed',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-x1-coolant-leak-2016',
    make: 'BMW',
    model: 'X1',
    years: { start: 2016, end: 2023 },
    title: 'Coolant Leaks - Water Pump & Thermostat - F48 X1',
    severity: 'moderate',
    description: 'The F48 X1 commonly develops coolant leaks from the electric water pump and thermostat housing. The electric water pump (auxiliary pump) is a wear item that typically fails between 60,000-100,000 miles. The thermostat housing develops cracks or seal failures, causing coolant leaks. Symptoms include coolant loss, low coolant warnings, and visible leaks. The electric water pump is critical for preventing overheating when the engine is off or during cold starts. This is a common issue across many BMW models with B-series engines.',
    symptoms: [
      'Low coolant warning on dashboard',
      'Visible coolant leak under vehicle',
      'Overheating warning or temperature gauge rising',
      'Sweet smell (coolant) from engine bay',
      'White smoke from exhaust (severe leak)',
      'Heater not working properly'
    ],
    solution: 'Replace failed water pump or thermostat housing. Electric water pump replacement is 2-3 hours labor. Thermostat housing is 1-2 hours. Always use BMW-approved coolant (blue or orange, do not mix). Properly bleed cooling system after repair to prevent air pockets. Inspect all coolant hoses during repair and replace if cracked. Preventive replacement of water pump at 80,000 miles recommended.',
    estimatedCost: { min: 500, max: 1200 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM electric water pump - more reliable than cheap aftermarket pumps',
        partBrand: 'BMW',
        partName: 'Electric Water Pump',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Genuine BMW coolant - never mix colors, use blue or orange as specified',
        partBrand: 'BMW',
        partName: 'Coolant',
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT drive with overheating warning - can warp cylinder head and require $5k+ repair',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check coolant level monthly - early leak detection prevents overheating damage',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-x1-suspension-bushing-2016',
    make: 'BMW',
    model: 'X1',
    years: { start: 2016, end: 2023 },
    title: 'Front Suspension Bushing & Control Arm Wear - F48 X1',
    severity: 'low',
    description: 'The F48 X1 front suspension control arm bushings wear out prematurely, especially in areas with rough roads or potholes. The rubber bushings crack and tear, causing clunking noises over bumps and poor handling. Front lower control arms with integrated bushings are the most common failure. BMW uses rubber bushings that degrade over time and with exposure to road salt. Symptoms typically appear after 50,000-80,000 miles. This is a wear item and not uncommon for BMW suspension components.',
    symptoms: [
      'Clunking or knocking noise over bumps',
      'Loose or imprecise steering feel',
      'Uneven tire wear',
      'Vibration through steering wheel',
      'Vehicle pulls to one side',
      'Failed inspection due to worn bushings'
    ],
    solution: 'Replace worn control arms or bushings. Most shops replace complete control arms (with integrated bushings) rather than pressing in new bushings alone. Alignment required after replacement. Inspect all suspension components while vehicle is lifted. Consider replacing both sides even if only one shows symptoms to avoid repeat labor costs. Use OEM or quality aftermarket parts (Lemforder, Meyle HD) for longevity.',
    estimatedCost: { min: 600, max: 1500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM control arms - expensive but best fitment and durability',
        partBrand: 'BMW',
        partName: 'Front Lower Control Arm',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Lemforder control arms - OEM supplier to BMW, cheaper than BMW-branded parts',
        partBrand: 'Lemforder',
        partName: 'Front Control Arm Kit',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace both sides at once - saves labor and prevents doing job twice',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Always get alignment after suspension work - prevents tire wear',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmwX1Issues.length} BMW X1 issues...`);
knownIssues.issues.push(...bmwX1Issues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmwX1Issues.length} BMW X1 issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
