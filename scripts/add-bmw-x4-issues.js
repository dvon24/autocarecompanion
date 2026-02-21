const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW X4 issues
// F26 X4 (2015-2018): N20/N55 engines, shares platform with F25 X3
// G02 X4 (2019-2023): B46/B48/B58 engines, shares platform with G01 X3
// Most issues shared with X3

const bmwX4Issues = [
  {
    id: 'bmw-x4-n20-timing-chain-2015',
    make: 'BMW',
    model: 'X4',
    years: { start: 2015, end: 2016 },
    title: 'N20 Timing Chain Premature Failure - F26 X4 xDrive28i',
    severity: 'high',
    description: 'The N20 2.0L turbocharged engine in 2015-2016 X4 xDrive28i models suffers from premature timing chain stretch and guide failure, typically between 40,000-80,000 miles. The single-row timing chain design is inadequate for the engine\'s power output. Chain stretch causes timing to jump, leading to rough running, poor performance, and potential catastrophic engine damage if the chain breaks. BMW issued a class action settlement covering 8 years/100,000 miles. This is identical to the N20 issue affecting all N20-powered BMW models including X3, 3/4 Series, and X1.',
    symptoms: [
      'Rattling noise from engine on cold start (first 5 seconds)',
      'Check engine light with timing correlation codes (P0016, P0017, P0018, P0019)',
      'Rough idle or misfires',
      'Loss of power or hesitation on acceleration',
      'Engine won\'t start after chain failure'
    ],
    solution: 'Complete timing chain kit replacement including chain, guides, tensioner, and sprockets. Must be performed by experienced BMW technician. Preventive replacement recommended at 60,000-80,000 miles. BMW extended warranty to 8 years/100,000 miles under class action settlement. Upgraded reinforced chain kit available from aftermarket. Labor is 10-14 hours for X4 due to AWD and tight engine bay.',
    estimatedCost: { min: 3000, max: 5000 },
    recallTSB: 'Class Action Settlement - 8yr/100k miles coverage for N20 engine timing chain',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM Timing Chain Kit (11318648732KT) - includes all necessary components',
        partBrand: 'BMW',
        partName: 'N20 Timing Chain Kit',
        partNumber: '11318648732KT',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your VIN is covered under class action settlement before paying out of pocket',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore chain rattle - failure will destroy engine requiring $15k+ replacement',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-x4-transfer-case-2015',
    make: 'BMW',
    model: 'X4',
    years: { start: 2015, end: 2023 },
    title: 'Transfer Case Actuator Motor Failure - All xDrive X4',
    severity: 'moderate',
    description: 'BMW xDrive (AWD) X4 models use an electronically-controlled transfer case that commonly experiences actuator motor failures between 60,000-100,000 miles. The transfer case actuator motor and internal clutch pack wear out from normal use. Symptoms include grinding noises, AWD malfunction warnings, and the vehicle stuck in FWD mode. The actuator motor is a common failure point and can be replaced separately, but complete transfer case failure requires full replacement. This affects all X4 generations (F26 and G02) with xDrive.',
    symptoms: [
      'Grinding or whining noise from under vehicle',
      'AWD malfunction warning on dashboard',
      'Transfer case failsafe program message',
      'Vehicle stuck in front-wheel drive only',
      'Vibration during acceleration',
      'Fluid leak from transfer case area'
    ],
    solution: 'Diagnose specific failure. Transfer case actuator motor replacement ($800-1,200) is most common. Complete transfer case replacement required for internal failures ($2,500-4,000). Regular transfer case fluid changes every 50,000 miles may extend life. Some owners install aftermarket upgraded actuator motors. Common wear item on high-mileage xDrive BMW models.',
    estimatedCost: { min: 800, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM transfer case actuator motor (27107566296) - most common failure point',
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
    id: 'bmw-x4-oil-leak-2015',
    make: 'BMW',
    model: 'X4',
    years: { start: 2015, end: 2023 },
    title: 'Oil Leaks - Valve Cover & Oil Filter Housing - All Models',
    severity: 'low',
    description: 'BMW X4 models with N20, N55, B46, B48, and B58 engines commonly develop oil leaks from valve cover gaskets and oil filter housing gaskets. The plastic valve cover warps from heat cycles, causing gasket failure. The oil filter housing (integrated into engine block) also develops leaks. These are wear items that typically fail between 60,000-100,000 miles. Oil leaks onto hot exhaust components, causing burning oil smell but rarely major issues if addressed promptly.',
    symptoms: [
      'Burning oil smell, especially after driving',
      'Visible oil on valve cover or around oil filter housing',
      'Low oil level warning (slow leak)',
      'Oil residue on engine bay components',
      'Smoke from engine bay when hot'
    ],
    solution: 'Replace valve cover gasket and/or oil filter housing gasket. Valve cover replacement is 3-4 hours labor on X4. Oil filter housing gasket is 1-2 hours. Both are routine maintenance items on BMW turbo engines. Use OEM gaskets for best longevity. Clean oil residue from engine bay after repair. Monitor oil level regularly to catch leaks early.',
    estimatedCost: { min: 500, max: 1400 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM valve cover gasket - better quality than aftermarket options',
        partBrand: 'BMW',
        partName: 'Valve Cover Gasket',
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
  }
];

console.log(`Adding ${bmwX4Issues.length} BMW X4 issues...`);
knownIssues.issues.push(...bmwX4Issues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmwX4Issues.length} BMW X4 issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
