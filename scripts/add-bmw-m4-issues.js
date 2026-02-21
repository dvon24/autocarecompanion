const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW M4 issues
// F82/F83 M4 (2015-2020): S55 twin turbo (same as M3)
// G82/G83 M4 (2021-2023): S58 twin turbo

const bmwM4Issues = [
  {
    id: 'bmw-m4-s55-crank-hub-2015',
    make: 'BMW',
    model: 'M4',
    years: { start: 2015, end: 2020 },
    title: 'S55 Crank Hub Failure (CATASTROPHIC) - F82/F83 M4',
    severity: 'high',
    description: 'The S55 engine in F82/F83 M4 (2015-2020) suffers from catastrophic crank hub failures identical to the M3. The crank hub (harmonic balancer) is press-fit onto the crankshaft and can slip under high load, especially on tuned cars or during track use. When the hub slips, timing is lost and valves contact pistons, destroying the engine. The OEM crank hub has inadequate interference fit for the engine\'s power output. Failures typically occur between 30,000-70,000 miles on tuned cars or after multiple track days. This is considered the #1 critical failure point on S55-powered BMWs.',
    symptoms: [
      'Sudden catastrophic engine failure with no warning',
      'Rough idle or vibration (early warning if hub is starting to slip)',
      'Check engine light with timing correlation codes (P0016, P0017)',
      'Misfire codes across all cylinders',
      'Metal-on-metal noise from front of engine',
      'Engine won\'t start after catastrophic failure'
    ],
    solution: 'MANDATORY preventive replacement with upgraded pinned or keyed crank hub. Pure Turbos, VTT, and S55 Crank Hub Fix all sell upgraded solutions with mechanical retention (pin or keyway) that eliminates the slipping issue permanently. Installation requires crankshaft pulley removal and precise torque specs. This upgrade is considered essential maintenance for any S55-powered car, especially if tuned or tracked. Cost is $1,200-2,500 installed vs. $20,000+ for engine replacement after failure.',
    estimatedCost: { min: 1200, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Pure Turbos upgraded pinned crank hub - most trusted solution, mechanically pins hub to crank',
        partBrand: 'Pure Turbos',
        partName: 'S55 Pinned Crank Hub',
        needsReview: true
      },
      {
        type: 'part',
        content: 'VTT keyed crank hub kit - alternative with keyway retention, also highly regarded',
        partBrand: 'VTT',
        partName: 'S55 Keyed Crank Hub',
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT tune or track the M4 before upgrading the crank hub - you WILL destroy the engine',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'This is NOT optional - every S55 M4 will eventually fail without the upgraded hub',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Install upgraded crank hub immediately after purchase, before any mods - it\'s the cheapest insurance',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m4-s55-rod-bearing-2015',
    make: 'BMW',
    model: 'M4',
    years: { start: 2015, end: 2020 },
    title: 'S55 Rod Bearing Premature Wear - F82/F83 M4',
    severity: 'high',
    description: 'The S55 engine has tight rod bearing clearances that can lead to premature bearing wear, especially with track use or aggressive driving. While not as severe as the S65 V10 rod bearing issue, the S55 still experiences accelerated wear. Symptoms typically appear after 60,000-80,000 miles or after sustained track use. Oil analysis showing elevated copper/lead levels indicates bearing wear. The twin-turbo S55 generates high cylinder pressures that stress the bearings. This issue is shared with M3, M2 Competition, and all S55-powered cars.',
    symptoms: [
      'Metallic knocking or ticking noise at idle (increases when warm)',
      'Oil pressure fluctuation or low pressure warning',
      'Metal particles in oil (copper, lead, aluminum)',
      'Noise increases with engine RPM',
      'Low oil pressure at hot idle (below 14 PSI)'
    ],
    solution: 'Preventive rod bearing replacement at 60,000-80,000 miles or before extensive track use. Upgraded aftermarket bearings (ACL Race, King Racing) provide larger clearances and better durability than OEM. Regular oil analysis (Blackstone Labs) every 5,000 miles to monitor bearing wear. Use high-quality 5W-40 oil (Liqui Moly, Motul) and change every 5,000 miles max. Track-focused M4s should replace bearings every 50,000 miles. Labor is 8-12 hours, so many owners do this during clutch replacement.',
    estimatedCost: { min: 3000, max: 5000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'ACL Race bearings - most popular upgrade for S55, increased clearances prevent premature wear',
        partBrand: 'ACL',
        partName: 'S55 Performance Rod Bearings',
        needsReview: true
      },
      {
        type: 'part',
        content: 'King Racing XP bearings - another excellent option with proven track record',
        partBrand: 'King Racing',
        partName: 'S55 XP Rod Bearings',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Send oil samples to Blackstone Labs every 5k miles - early detection of bearing wear saves engines',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If you track the M4, replace bearings preventively at 50k-60k miles - don\'t wait for symptoms',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t ignore metallic knocking - bearing failure will grenade the engine',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m4-dct-clutch-2015',
    make: 'BMW',
    model: 'M4',
    years: { start: 2015, end: 2020 },
    title: 'DCT Dual-Clutch Transmission Shudder & Clutch Wear - F82/F83 M4',
    severity: 'moderate',
    description: 'The Getrag DCT (dual-clutch transmission) in the M4 experiences clutch pack wear from aggressive driving, repeated launch control, and track use. The DCT has two clutches (odd and even gears) that wear over time. Symptoms include shuddering during low-speed acceleration, rough shifting, and slipping under hard acceleration. Track use and launch control dramatically accelerate wear. DCT fluid degradation also contributes to poor shift quality. Clutch replacement is expensive ($5,000-8,000) and considered a wear item on high-performance use.',
    symptoms: [
      'Shuddering or judder when accelerating from stop',
      'Rough or harsh shifting between gears',
      'Slipping sensation under hard acceleration',
      'Burning smell from transmission',
      'Check engine light with transmission codes',
      'Clutch slip warnings on iDrive display'
    ],
    solution: 'Replace DCT clutch pack when symptoms appear. BMW recommends replacing all clutches together. Change DCT fluid every 30,000 miles with BMW-approved fluid to extend clutch life. Avoid excessive launch control use (limit to special occasions). Transmission adaptation reset via BMW software may temporarily improve shift quality. Extended warranty highly recommended for DCT-equipped M4s. Labor-intensive repair requires transmission removal.',
    estimatedCost: { min: 5000, max: 8000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM DCT clutch pack - expensive but necessary for proper operation',
        partBrand: 'BMW',
        partName: 'DCT Clutch Pack',
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMW DCT fluid (83222413511) - change every 30k miles to extend clutch life significantly',
        partBrand: 'BMW',
        partName: 'DCT Transmission Fluid',
        partNumber: '83222413511',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change DCT fluid religiously at 30k miles - fluid degradation kills clutches faster than driving style',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use launch control sparingly - every launch adds significant wear to clutch packs',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Budget $5k-8k for DCT clutch replacement - it\'s when, not if, on high-mile M4s',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m4-s55-injector-2015',
    make: 'BMW',
    model: 'M4',
    years: { start: 2015, end: 2020 },
    title: 'S55 High-Pressure Fuel Injector Failure - F82/F83 M4',
    severity: 'moderate',
    description: 'The S55 twin-turbo engine uses high-pressure direct injection fuel injectors that commonly fail between 60,000-100,000 miles. The injectors operate at extremely high pressures (2,900+ PSI) and are subject to carbon buildup and internal seal wear. Failed injectors cause rough running, misfires, and reduced power. When one injector fails, others often follow soon after due to similar wear patterns. Carbon deposits on intake valves (inherent to direct injection) worsen the problem. This issue is shared across all S55-powered cars (M3, M4, M2 Competition).',
    symptoms: [
      'Rough idle or engine vibration',
      'Check engine light with misfire codes (P0300-P0306)',
      'Loss of power or hesitation on acceleration',
      'Increased fuel consumption',
      'Hard starting or extended cranking',
      'Fuel smell from engine bay (injector leak)'
    ],
    solution: 'Replace all 6 injectors together to prevent repeat repairs. Perform walnut blast carbon cleaning on intake valves while injectors are removed (labor overlap saves $400-600). Use Top Tier gasoline to minimize carbon buildup. Add fuel system cleaner (Liqui Moly Valve Clean) every 5,000 miles to reduce carbon deposits. BMW parts are expensive; some shops use OEM Bosch injectors at lower cost. Labor is 4-6 hours for injector replacement.',
    estimatedCost: { min: 2000, max: 3500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Bosch OEM fuel injectors - same as BMW uses, significantly cheaper than BMW-branded parts',
        partBrand: 'Bosch',
        partName: 'S55 High Pressure Injectors',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Liqui Moly Valve Clean (2001) - add to fuel tank every 5k miles to reduce carbon buildup',
        partBrand: 'Liqui Moly',
        partName: 'Valve Clean',
        partNumber: '2001',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blast carbon cleaning when replacing injectors - labor overlap saves hundreds',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use Top Tier gasoline (Shell, Chevron, Mobil) exclusively - reduces carbon buildup significantly',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t replace just one injector - the others will fail soon and you\'ll pay labor twice',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-m4-cooling-track-2015',
    make: 'BMW',
    model: 'M4',
    years: { start: 2015, end: 2020 },
    title: 'Cooling System Inadequacy Under Track Use - F82/F83 M4',
    severity: 'moderate',
    description: 'The F82/F83 M4 has marginal cooling capacity for sustained track use. The S55 twin-turbo engine generates significant heat, and the stock cooling system struggles during extended track sessions. Oil temperatures commonly exceed 280°F, coolant temps spike, and the car experiences heat soak and power loss. The intercoolers also heat soak, reducing boost efficiency and power. BMW\'s factory cooling is adequate for street use but insufficient for track duty. This is a well-known issue among M4 track enthusiasts.',
    symptoms: [
      'Oil temperature exceeding 280°F during track sessions',
      'Coolant temperature warning on track',
      'Power loss after 3-4 hot laps (heat soak)',
      'Limp mode activation from overheating',
      'Intercooler heat soak (reduced boost pressure)',
      'Cooling fan running at max speed constantly'
    ],
    solution: 'Install comprehensive cooling upgrades for track use: CSF or Mishimoto high-capacity radiator, aftermarket oil cooler, upgraded intercoolers (Wagner, CSF), and transmission cooler. Remove kidney grille blockage for improved airflow. Install oil temperature and pressure gauges to monitor. Limit track sessions to 15-20 minutes with cool-down laps. Total cooling system upgrade costs $3,000-5,000 but essential for serious track use. For street-only M4s, stock cooling is adequate.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'CSF high-performance radiator - massive improvement in cooling capacity for track M4s',
        partBrand: 'CSF',
        partName: 'F82 M4 Performance Radiator',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Mishimoto oil cooler kit - keeps oil temps under 260°F even during sustained track sessions',
        partBrand: 'Mishimoto',
        partName: 'M4 Oil Cooler Kit',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Wagner Tuning intercoolers - eliminates heat soak and maintains consistent power output',
        partBrand: 'Wagner',
        partName: 'M4 Competition Intercooler',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'For track use, cooling upgrades are mandatory - stock system will overheat and cause damage',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Remove kidney grille blockage for free airflow improvement - simple mod with big impact',
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
    id: 'bmw-m4-convertible-top-2015',
    make: 'BMW',
    model: 'M4',
    years: { start: 2015, end: 2020 },
    title: 'Convertible Top Hydraulic Pump Failure - F83 M4 Convertible',
    severity: 'moderate',
    description: 'The F83 M4 convertible uses a complex hydraulic folding hardtop system that suffers from pump motor failures and hydraulic leaks. The hydraulic pump motor can burn out from overheating, and seals degrade over time, causing fluid leaks. Failed microswitches that detect top position also prevent top operation. The top can become stuck partially open or closed, requiring expensive repairs. Exposure to weather and infrequent operation accelerate failures. This is the same system used in F33 4 Series convertibles and shares similar failure points.',
    symptoms: [
      'Convertible top stuck partially open or closed',
      'Top operation warning message on iDrive',
      'Whining or grinding noise when operating top',
      'Top moves slowly or stops mid-cycle',
      'Hydraulic fluid leak in trunk area',
      'Top won\'t latch or unlatch properly'
    ],
    solution: 'Diagnose specific failure: hydraulic pump motor, lines, microswitches, or latch mechanisms. Pump motor replacement is most common ($1,500-2,500). Check hydraulic fluid level and refill if low. Regular top cycling (minimum once per month) prevents seal degradation. Store with top UP to reduce strain on hydraulic system. Rebuilt hydraulic pumps available at lower cost than new OEM. Complex repair requiring specialized BMW knowledge.',
    estimatedCost: { min: 1500, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM convertible top hydraulic pump - rebuilt units available for significant savings',
        partBrand: 'BMW',
        partName: 'Convertible Top Pump',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Cycle the top at least monthly, even in winter - keeps hydraulics lubricated and prevents failures',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Always store with top UP - reduces hydraulic system strain and extends component life',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Never force the top manually if stuck - can damage expensive hydraulic components',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t operate top in freezing temperatures - thick hydraulic fluid can burn out motor',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmwM4Issues.length} BMW M4 issues...`);
knownIssues.issues.push(...bmwM4Issues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmwM4Issues.length} BMW M4 issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
