const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW M2 issues
// F87 M2 (2016-2018): N55 single turbo
// F87 M2 Competition (2019-2020): S55 twin turbo
// G87 M2 (2023+): S58 twin turbo

const bmwM2Issues = [
  {
    id: 'bmw-m2-n55-rod-bearing-2016',
    make: 'BMW',
    model: 'M2',
    years: { start: 2016, end: 2018 },
    title: 'N55 Rod Bearing Premature Wear - F87 M2',
    severity: 'high',
    description: 'The N55 engine in the F87 M2 (2016-2018) suffers from accelerated rod bearing wear, though not as catastrophic as the S65 V10. Track use, aggressive driving, and extended oil change intervals accelerate bearing wear. Tight bearing clearances and high cylinder pressures in the M-tuned N55 contribute to the issue. Symptoms typically appear after 60,000-80,000 miles or after multiple track days. Unlike M3/M5, most M2 owners catch this before complete failure, but preventive replacement is strongly recommended for track-driven cars.',
    symptoms: [
      'Metallic knocking noise at idle (especially when warm)',
      'Oil pressure fluctuation or low oil pressure warning',
      'Metal particles visible in oil (send oil sample to Blackstone Labs)',
      'Engine noise increases with RPM',
      'Low oil pressure at hot idle (below 14 PSI)'
    ],
    solution: 'Preventive rod bearing replacement recommended at 60,000 miles or before track use. Upgraded aftermarket bearings (ACL Race, King Racing) provide larger clearances and better durability. Oil analysis every 5,000 miles to monitor bearing wear (check for copper/lead particles). Use high-quality 5W-40 oil (Liqui Moly, Motul) and change every 5,000 miles max for track cars. Some track-focused owners replace bearings every 50,000 miles preventively.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'ACL Race bearings with increased clearances - most popular upgrade for track M2s',
        partBrand: 'ACL',
        partName: 'N55 Performance Rod Bearings',
        needsReview: true
      },
      {
        type: 'part',
        content: 'King Racing XP bearings - another high-quality option with excellent track record',
        partBrand: 'King Racing',
        partName: 'N55 XP Rod Bearings',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Liqui Moly 5W-40 or Motul 8100 X-cess 5W-40 - excellent oil for high-performance N55',
        partBrand: 'Liqui Moly',
        partName: 'Leichtlauf High Tech 5W-40',
        partNumber: '2228',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Send oil samples to Blackstone Labs every 5k miles - early warning system for bearing wear',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If you track the car, replace bearings preventively at 50k-60k miles - don\'t wait for symptoms',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Track use accelerates bearing wear dramatically - mandatory oil analysis if you track the M2',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m2-comp-s55-crank-hub-2019',
    make: 'BMW',
    model: 'M2',
    years: { start: 2019, end: 2020 },
    title: 'S55 Crank Hub Failure (CATASTROPHIC) - M2 Competition',
    severity: 'high',
    description: 'The M2 Competition shares the S55 engine with M3/M4 and inherits the catastrophic crank hub failure issue. The crank hub (harmonic balancer) is press-fit onto the crankshaft and can slip under high load, especially with upgraded software or track use. When the hub slips, timing is lost and valves contact pistons, destroying the engine. This is the same critical failure point as the F80 M3 and F82 M4. The OEM crank hub has inadequate interference fit. Most failures occur on tuned cars or during hard track use between 30,000-70,000 miles.',
    symptoms: [
      'Sudden catastrophic engine failure with no warning',
      'Rough idle or vibration (early warning if hub is starting to slip)',
      'Check engine light with timing correlation codes (P0016, P0017)',
      'Misfire codes across all cylinders',
      'Metal-on-metal noise from front of engine'
    ],
    solution: 'MANDATORY preventive replacement with upgraded pinned or keyed crank hub. Pure Turbos, VTT, and S55 Crank Hub Fix all sell upgraded solutions with mechanical retention (pin or keyway). Installation requires crankshaft pulley removal and careful torque specs. This is considered essential maintenance for any S55-powered car, especially if tuned or tracked. Many M2 Competition owners perform this upgrade immediately after purchase.',
    estimatedCost: { min: 1200, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Pure Turbos upgraded pinned crank hub - eliminates slip failure permanently, most trusted solution',
        partBrand: 'Pure Turbos',
        partName: 'S55 Pinned Crank Hub',
        needsReview: true
      },
      {
        type: 'part',
        content: 'VTT keyed crank hub kit - alternative solution with keyway retention',
        partBrand: 'VTT',
        partName: 'S55 Keyed Crank Hub',
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT tune or track the car before upgrading the crank hub - you will grenade the engine',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'This is NOT optional for M2 Competition - it WILL fail eventually, especially if tuned',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Install upgraded crank hub before any performance mods - it\'s mandatory insurance for S55 engines',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m2-dct-clutch-2016',
    make: 'BMW',
    model: 'M2',
    years: { start: 2016, end: 2020 },
    title: 'DCT Dual-Clutch Transmission Shudder & Clutch Wear - F87 M2/M2C',
    severity: 'moderate',
    description: 'The Getrag DCT (dual-clutch transmission) in the M2 and M2 Competition experiences clutch pack wear from aggressive driving, launches, and track use. The DCT has two clutches (odd and even gears) that wear over time. Symptoms include shuddering during low-speed acceleration, rough shifting, and slipping under hard acceleration. Track use and repeated launch control engagements accelerate wear. DCT fluid degradation also contributes to poor shift quality. This transmission is shared with M3/M4 and has similar failure patterns.',
    symptoms: [
      'Shuddering or judder when accelerating from a stop',
      'Rough or harsh shifting between gears',
      'Slipping sensation under hard acceleration',
      'Burning smell from transmission',
      'Check engine light with transmission codes',
      'Clutch slip warnings on iDrive'
    ],
    solution: 'Replace DCT clutch pack ($4,000-6,000 parts + labor). Change DCT fluid every 30,000 miles with BMW-approved fluid to extend clutch life. Avoid excessive launch control use. Transmission adaptation reset via BMW software often improves shift quality temporarily. Some performance shops offer upgraded clutch packs for track use. Extended warranty coverage highly recommended for DCT-equipped M2s.',
    estimatedCost: { min: 5000, max: 8000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM DCT clutch pack - expensive but necessary for proper function',
        partBrand: 'BMW',
        partName: 'DCT Clutch Pack',
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMW DCT fluid (83222413511) - change every 30k miles to extend clutch life',
        partBrand: 'BMW',
        partName: 'DCT Transmission Fluid',
        partNumber: '83222413511',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change DCT fluid every 30k miles max - fluid degradation kills clutches faster than driving style',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Limit launch control use to special occasions - it puts massive wear on clutch packs',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Budget $5k-8k for eventual DCT clutch replacement - it\'s not if, but when on high-mileage M2s',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m2-charge-pipe-2016',
    make: 'BMW',
    model: 'M2',
    years: { start: 2016, end: 2020 },
    title: 'Turbo Charge Pipe Failure - F87 M2/M2C',
    severity: 'moderate',
    description: 'Both the N55 (M2) and S55 (M2 Competition) engines use plastic charge pipes that fail under boost pressure and heat cycles. The charge pipe routes pressurized air from the turbocharger(s) to the engine intake. Plastic becomes brittle and cracks, especially on tuned cars running higher boost. Failure causes sudden loss of power and limp mode. The N55 has a single large charge pipe, while the S55 has multiple boost pipes that can fail. Aftermarket aluminum pipes are considered mandatory for any tuned M2.',
    symptoms: [
      'Sudden loss of power while driving',
      'Loud hissing or whooshing sound from engine bay',
      'Check engine light with boost pressure codes (P0299, P0234)',
      'Limp mode activation',
      'Visible crack in plastic charge pipe',
      'Boost gauge shows loss of pressure (if equipped)'
    ],
    solution: 'Replace with upgraded aluminum charge pipe. Popular brands: ARM Motorsports, VRSF, BMS (Burger Motorsport). Aluminum pipes eliminate the plastic failure point permanently and support higher boost levels for tuned cars. Install is straightforward DIY. For M2 Competition, also consider upgrading all boost pipes while engine bay is accessible. Many M2 owners install aluminum charge pipes preventively before failure.',
    estimatedCost: { min: 200, max: 800 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'ARM Motorsports aluminum charge pipe - perfect fit, supports 600+ HP, eliminates plastic failure',
        partBrand: 'ARM Motorsports',
        partName: 'F87 M2 Aluminum Charge Pipe',
        needsReview: true
      },
      {
        type: 'part',
        content: 'VRSF charge pipe kit - includes all boost pipes for M2 Competition, great quality',
        partBrand: 'VRSF',
        partName: 'M2 Charge Pipe Kit',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Install aluminum charge pipe BEFORE tuning - plastic pipes will fail immediately with more boost',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'For M2 Competition, upgrade all boost pipes at once - save labor and prevent future failures',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If you\'re running a tune without upgraded charge pipes, you\'re on borrowed time',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m2-cooling-system-2016',
    make: 'BMW',
    model: 'M2',
    years: { start: 2016, end: 2020 },
    title: 'Cooling System Inadequacy Under Track Use - F87 M2/M2C',
    severity: 'moderate',
    description: 'The F87 M2 and M2 Competition have marginal cooling capacity for sustained track use. The small grilles and compact engine bay restrict airflow to the radiator, oil cooler, and intercooler. On track, oil temperatures commonly exceed 280°F and coolant temperatures spike, leading to heat soak and power loss. The M2 Competition with S55 engine runs even hotter. Extended track sessions can cause cooling system component failure or engine damage from overheating. This is well-documented on M2 track forums and affects all F87 M2 models when pushed hard.',
    symptoms: [
      'Oil temperature exceeding 280°F during track sessions',
      'Coolant temperature warning on track',
      'Noticeable power loss after 3-4 hot laps (heat soak)',
      'Limp mode activation from overheating',
      'Intercooler heat soak (reduced power on turbocharged models)',
      'Fan running constantly after track session'
    ],
    solution: 'Install aftermarket cooling upgrades for track use: CSF radiator (higher core density), aftermarket oil cooler (Mishimoto, CSF), upgraded intercooler (Wagner, CSF), and coolant reroute kit. Remove kidney grille blockage for better airflow. Install oil temperature and pressure gauges to monitor. Limit track sessions to 15-20 minutes with cool-down laps. Many serious track M2 owners install full cooling system upgrades ($2,500-4,000 total). For street use, stock cooling is adequate.',
    estimatedCost: { min: 2500, max: 5000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'CSF high-performance radiator - massive upgrade in cooling capacity for track M2s',
        partBrand: 'CSF',
        partName: 'F87 M2 Performance Radiator',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Mishimoto oil cooler kit - critical for keeping oil temps under 260°F on track',
        partBrand: 'Mishimoto',
        partName: 'M2 Oil Cooler Kit',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Wagner Tuning intercooler - eliminates heat soak on turbo M2s during track use',
        partBrand: 'Wagner',
        partName: 'M2 Competition Intercooler',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you track the M2, cooling upgrades are mandatory - the stock system can\'t handle sustained abuse',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Remove kidney grille blockage and front tow hook cover for better airflow - free mod',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t ignore high oil temps (280°F+) - you\'ll cook rod bearings and destroy the engine',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m2-rear-subframe-2016',
    make: 'BMW',
    model: 'M2',
    years: { start: 2016, end: 2020 },
    title: 'Rear Subframe Cracking (Track Use) - F87 M2/M2C',
    severity: 'moderate',
    description: 'Track-driven M2s (especially with sticky tires and aggressive alignment) can develop cracks in the rear subframe mounting points. The rear subframe holds the differential and rear suspension, and high lateral loads from track driving stress the mounting points. Cracks typically occur at the rear subframe-to-chassis connection points. This is most common on M2 Competition models with stickier tires and more power. Street-driven M2s rarely experience this issue. Symptoms include clunking from the rear, alignment going out of spec, and visible cracks during inspection.',
    symptoms: [
      'Clunking or banging noise from rear suspension over bumps',
      'Rear end feels loose or unstable',
      'Alignment drifts out of spec frequently',
      'Visible cracks in subframe mounting points (requires lift inspection)',
      'Abnormal tire wear from shifting alignment'
    ],
    solution: 'Reinforce rear subframe mounting points with weld-in reinforcement plates before cracks develop. Several companies (Vince Bar, BMW Performance Parts) sell subframe reinforcement kits. Installation requires welding and should be done by experienced chassis specialist. For already-cracked subframes, weld repair and reinforcement is required. Track M2 owners should inspect subframe regularly. This is considered preventive maintenance for serious track cars.',
    estimatedCost: { min: 1000, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Vince Bar subframe reinforcement kit - proven solution to prevent cracking on track M2s',
        partBrand: 'Vince Bar',
        partName: 'M2 Subframe Reinforcement',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you track the M2, reinforce the subframe BEFORE cracks develop - way cheaper than repair',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Inspect subframe mounting points after every track season - early detection prevents major damage',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Cracked subframe can lead to catastrophic suspension failure - don\'t ignore clunking noises',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmwM2Issues.length} BMW M2 issues...`);
knownIssues.issues.push(...bmwM2Issues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmwM2Issues.length} BMW M2 issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
