const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW 2 Series issues
// F22/F23 (2014-2021): Coupe/Convertible, N20/B46/B48 engines
// G42 (2022-2023): Coupe, B48 engine
// F44/F45/F46 (2015-2021): Gran Coupe/Active Tourer/Gran Tourer (FWD-based, less common in US)

const bmw2SeriesIssues = [
  {
    id: 'bmw-2series-n20-timing-chain-2014',
    make: 'BMW',
    model: '2 Series',
    years: { start: 2014, end: 2016 },
    title: 'N20 Timing Chain Premature Failure - F22/F23 228i',
    severity: 'high',
    description: 'The N20 2.0L turbocharged engine in 228i models (2014-2016) suffers from premature timing chain stretch and guide failure, typically between 40,000-80,000 miles. The single-row timing chain design is inadequate for the engine\'s power output. Chain stretch causes timing to jump, leading to rough running, poor performance, and potential catastrophic engine damage if the chain breaks. BMW issued a class action settlement covering 8 years/100,000 miles. This is identical to the N20 timing chain issue affecting 328i, 428i, X3, and other N20-powered models.',
    symptoms: [
      'Rattling noise from engine on cold start (first 5 seconds)',
      'Check engine light with timing correlation codes (P0016, P0017, P0018, P0019)',
      'Rough idle or misfires',
      'Loss of power or hesitation on acceleration',
      'Engine won\'t start after complete chain failure'
    ],
    solution: 'Complete timing chain kit replacement including chain, guides, tensioner, and sprockets. Must be performed by experienced BMW technician. Preventive replacement recommended at 60,000-80,000 miles. BMW extended warranty to 8 years/100,000 miles under class action settlement. Upgraded reinforced chain kit available from aftermarket. Labor is 8-12 hours for 2 Series due to tight engine bay.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'Class Action Settlement - 8yr/100k miles coverage for N20 engine timing chain',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM Timing Chain Kit (11318648732KT) - complete factory replacement kit',
        partBrand: 'BMW',
        partName: 'N20 Timing Chain Kit',
        partNumber: '11318648732KT',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your VIN is covered under class action settlement - can save thousands',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore chain rattle - complete failure will destroy the engine ($15k+ replacement)',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-2series-charge-pipe-2014',
    make: 'BMW',
    model: '2 Series',
    years: { start: 2014, end: 2021 },
    title: 'Turbo Charge Pipe Failure - F22/F23 228i/230i/M240i',
    severity: 'moderate',
    description: 'BMW uses plastic charge pipes (boost pipes) to route pressurized air from the turbocharger to the engine intake. The plastic becomes brittle over time from heat cycles and boost pressure. The pipe commonly cracks or connection points fail, causing sudden loss of boost pressure and power. Failure typically occurs between 50,000-80,000 miles. All turbocharged F-chassis 2 Series (N20, B46, B48 engines) are affected. Aftermarket aluminum charge pipes eliminate the failure point permanently and are highly recommended.',
    symptoms: [
      'Sudden loss of power while driving',
      'Loud hissing or whooshing sound from engine bay',
      'Check engine light with boost pressure codes (P0299, P0234)',
      'Limp mode activation (reduced power)',
      'Visible crack or separation in plastic charge pipe',
      'Engine runs but severely lacks power under acceleration'
    ],
    solution: 'Replace charge pipe. OEM replacement is plastic and will eventually fail again. Aftermarket aluminum charge pipe is highly recommended for permanent fix. Popular brands: ARM Motorsports, Burger Motorsport (BMS), VRSF. Installation is straightforward DIY for experienced mechanics. Also inspect intercooler boots and clamps for cracks while charge pipe is removed. Aluminum pipes cost same as OEM plastic but last forever.',
    estimatedCost: { min: 150, max: 600 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'ARM Motorsports aluminum charge pipe - perfect fit, eliminates plastic failure permanently',
        partBrand: 'ARM Motorsports',
        partName: 'F22 2 Series Aluminum Charge Pipe',
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMS (Burger Motorsport) aluminum charge pipe - another excellent option with proven reliability',
        partBrand: 'BMS',
        partName: 'N20/B48 Charge Pipe',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace with aluminum aftermarket - same cost as OEM plastic but will never fail again',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If you hear hissing under boost, fix charge pipe immediately - boost leaks can cause lean conditions',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-2series-oil-leak-2014',
    make: 'BMW',
    model: '2 Series',
    years: { start: 2014, end: 2023 },
    title: 'Oil Leaks - Valve Cover & Oil Filter Housing - All Engines',
    severity: 'low',
    description: 'BMW 2 Series models with N20, B46, and B48 engines commonly develop oil leaks from valve cover gaskets and oil filter housing gaskets. The plastic valve cover warps from heat cycles, causing gasket failure and oil leakage onto the exhaust manifold. The oil filter housing (integrated into the block) also develops leaks. These are wear items that typically fail between 60,000-100,000 miles. Oil drips onto hot exhaust, causing burning smell but rarely major issues if addressed promptly.',
    symptoms: [
      'Burning oil smell, especially after driving',
      'Visible oil on valve cover or around oil filter housing',
      'Low oil level warning (slow leak over time)',
      'Oil residue on engine bay components',
      'Smoke from engine bay when hot'
    ],
    solution: 'Replace valve cover gasket and/or oil filter housing gasket as needed. Valve cover replacement is 2-3 hours labor. Oil filter housing gasket is 1-2 hours. Both are routine maintenance items on BMW turbo engines. Use OEM gaskets for best longevity. Clean oil residue from engine bay after repair. Monitor oil level regularly between changes to catch leaks early.',
    estimatedCost: { min: 400, max: 1200 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM valve cover gasket - better quality and longevity than aftermarket alternatives',
        partBrand: 'BMW',
        partName: 'Valve Cover Gasket',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Fix oil leaks promptly - oil on exhaust can potentially cause fires in rare cases',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'When replacing valve cover, inspect PCV valve and replace if needed - same labor overlap',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-2series-coolant-leak-2014',
    make: 'BMW',
    model: '2 Series',
    years: { start: 2014, end: 2023 },
    title: 'Electric Water Pump Failure - All Turbocharged Models',
    severity: 'moderate',
    description: 'BMW 2 Series turbocharged models use an electric auxiliary water pump that commonly fails between 60,000-100,000 miles. The electric pump circulates coolant when the engine is off to prevent heat soak and during cold starts. Pump bearing wear and seal failure lead to coolant leaks and pump motor burnout. Symptoms include coolant loss, overheating warnings, and heater malfunction. This is a wear item that eventually fails on all turbocharged BMW engines (N20, B46, B48).',
    symptoms: [
      'Coolant warning light or low coolant message',
      'Visible coolant leak under vehicle',
      'Overheating warning or temperature gauge rising',
      'Heater not working properly',
      'Whining noise from water pump area',
      'Check engine light with coolant circulation codes'
    ],
    solution: 'Replace electric water pump. Also inspect main mechanical water pump and thermostat for leaks/failure during repair (labor overlap). Replace coolant with BMW-approved coolant (blue or newer orange, do not mix). Properly bleed cooling system after replacement to avoid air pockets. Some mechanics recommend replacing both electric and mechanical pumps together since labor overlaps significantly.',
    estimatedCost: { min: 400, max: 900 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM Electric Water Pump - more reliable than cheap aftermarket alternatives',
        partBrand: 'BMW',
        partName: 'Electric Water Pump',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Genuine BMW coolant - use correct type (blue or orange), never mix colors',
        partBrand: 'BMW',
        partName: 'Coolant',
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT drive with overheating warning - can warp cylinder head requiring $5k+ repair',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check coolant level monthly - early leak detection prevents overheating damage',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmw2SeriesIssues.length} BMW 2 Series issues...`);
knownIssues.issues.push(...bmw2SeriesIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmw2SeriesIssues.length} BMW 2 Series issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
