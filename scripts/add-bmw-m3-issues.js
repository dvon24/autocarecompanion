const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

// BMW M3 issues
// E46 M3 (2001-2006): S54 inline-6
// E90/E92/E93 M3 (2008-2013): S65 V8
// F80 M3 (2015-2018): S55 twin-turbo inline-6
// G80 M3 (2021-2023): S58 twin-turbo inline-6

const m3Issues = [
  // ============================================================
  // E46 M3 (2001-2006) - S54 Engine
  // ============================================================
  {
    id: 'bmw-m3-e46-vanos-failure-2001',
    make: 'BMW',
    model: 'M3',
    years: { start: 2001, end: 2006 },
    title: 'VANOS Unit Failure (S54 Double-VANOS)',
    severity: 'high',
    description: 'The S54 double-VANOS system adjusts both intake and exhaust valve timing and is the most common failure on the E46 M3. Internal seals, oil pump disk, and bearing rings wear out between 80,000-120,000 miles, causing loss of power, rough idle, and VANOS rattle. BMW has discontinued some OEM parts, making rebuild kits from Beisan Systems the primary solution. Complete VANOS failure causes significant power loss and rough running. Forum consensus on Bimmerpost and NAM3Forum is that VANOS service is mandatory maintenance on any E46 M3.',
    symptoms: [
      'Loss of power, especially at low RPM',
      'VANOS rattle/ticking noise from front of engine',
      'Rough idle and hunting RPM',
      'Check engine light with VANOS-related fault codes',
      'Poor throttle response',
      'Reduced fuel economy'
    ],
    solution: 'VANOS rebuild using Beisan Systems kits is the most cost-effective approach. For budget repair, start with seal kit (BS021, $60) and rattle elimination kit (BS022, $80). For comprehensive repair, add oil pump disk (BS025, $150+core) which saves ~$1,250 vs full replacement. Full rebuilt VANOS from Beisan (BS100, $1,990+core) or Mr Vanos (~$1,500 send-in service) for heavily worn units. Always replace VANOS gasket (BMW 11-36-7-831-938) during service. DIY is feasible with Beisan\'s detailed procedure guide (4-8 hours). Professional installation $500-$1,200.',
    estimatedCost: { min: 200, max: 2500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Beisan Systems BS021 seal repair kit ($60) + BS022 rattle elimination kit ($80) is the minimum VANOS service. Covers most non-catastrophic failures.',
        partBrand: 'Beisan Systems',
        partName: 'VANOS Seal Repair Kit',
        partNumber: 'BS021',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'Beisan Systems BS025 oil pump disk ($150+$300 core) is the key wear item. Saves ~$1,250 vs full VANOS replacement and restores proper oil pressure to the unit.',
        partBrand: 'Beisan Systems',
        partName: 'VANOS Oil Pump Disk',
        partNumber: 'BS025',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'For heavily worn units, full rebuilt VANOS from Beisan Systems (BS100, $1,990+core) or Mr Vanos send-in service (~$1,500). Includes all internal upgrades.',
        partBrand: 'Beisan Systems',
        partName: 'Complete Rebuilt VANOS Unit',
        partNumber: 'BS100',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Budget DIY approach: BS021 seal kit + BS025 pump disk for ~$210 total can restore a functional VANOS vs $1,990 for full replacement. Start here before committing to a full rebuild.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'BMW has discontinued OEM VANOS parts for the S54. Beisan Systems and Mr Vanos are the primary sources. Do not delay service - a failed VANOS can cause bent valves.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-e46-subframe-crack-2001',
    make: 'BMW',
    model: 'M3',
    years: { start: 2001, end: 2006 },
    title: 'Rear Subframe Mounting Point Cracking',
    severity: 'high',
    description: 'The E46 chassis, especially the M3 with its higher torque output, suffers from rear subframe mounting points cracking through the floor pan. This is a structural issue that affects nearly every high-mileage E46 M3. The rear subframe bolts pull through the sheet metal floor, causing handling changes, clunking, and eventually structural failure. This is considered a design flaw that BMW never officially recalled. Reinforcement kits that weld additional plates to the floor pan are the accepted fix. Nearly every E46 M3 buyer should budget for this repair.',
    symptoms: [
      'Clunking from rear end over bumps',
      'Visible cracks around rear subframe mounting points',
      'Handling feels loose or imprecise',
      'Uneven tire wear',
      'Creaking sounds from trunk area',
      'Rear end feels \'sloppy\' during hard cornering'
    ],
    solution: 'Drop the rear subframe, inspect floor pan for cracks, repair any existing cracks, and weld in reinforcement plates. Turner Motorsport TDR4675412 (~$120-$150) or BimmerWorld expanded kit (~$125-$140) are the most popular kits. Through-bolting the front mounts and adding a rear X-brace provides the most comprehensive protection. This is a 15-20 hour job requiring welding equipment. Budget $1,500-$4,000 total at an experienced shop. Inspection is free - any shop can check for cracks with the car on a lift.',
    estimatedCost: { min: 1500, max: 4000 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Turner Motorsport TDR4675412 rear chassis/subframe reinforcement kit is the most popular option on NAM3Forum and Bimmerpost. Basic weld-in plate kit for ~$120-$150.',
        partBrand: 'Turner Motorsport',
        partName: 'Rear Subframe Reinforcement Kit',
        partNumber: 'TDR4675412',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'BimmerWorld expanded subframe reinforcement kit (100.33.546.0005B) provides additional coverage beyond the basic Turner kit. ~$125-$140.',
        partBrand: 'BimmerWorld',
        partName: 'Expanded Subframe Reinforcement Kit',
        partNumber: '100.33.546.0005B',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'This affects nearly EVERY high-mileage E46 M3. Have the mounting points inspected on any purchase. Cracks start small and invisible but progress to structural failure. Budget for this repair when buying an E46 M3.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Weld-in reinforcement is far superior to bolt-on solutions. Find a shop experienced with E46 subframe repair - this is common enough that most BMW specialists have done dozens.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-e46-rod-bearing-2001',
    make: 'BMW',
    model: 'M3',
    years: { start: 2001, end: 2006 },
    title: 'Rod Bearing Wear (S54 Engine)',
    severity: 'moderate',
    description: 'The S54 inline-6 suffers from rod bearing wear, particularly on cars driven hard or on track. While less catastrophic than the E90 M3\'s S65 V8 rod bearing issue, the S54 bearings should be inspected and replaced preventatively on high-mileage or track-driven cars. Oil analysis showing elevated copper and lead levels indicates bearing wear. Replacement requires dropping the oil pan and can be done without removing the engine.',
    symptoms: [
      'Knocking or tapping from lower engine under load',
      'Elevated copper/lead in oil analysis',
      'Oil pressure drop at operating temperature',
      'Slight vibration at idle',
      'Metallic debris on magnetic drain plug'
    ],
    solution: 'Rod bearing replacement requires oil pan drop and is a 5-hour DIY or $1,500-$2,500 at a shop. King Racing CR6877XPC-STD (~$430-$450) with ceramic nano-composite coating are the top forum pick. ACL 6B2500H-STD (~$150-$200) is the budget option. BE-Clevite tri-metal bearings (~$350) are the premium choice. Send oil samples to Blackstone Labs every 5,000 miles to monitor bearing wear before symptoms appear.',
    estimatedCost: { min: 500, max: 2500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'King Racing CR6877XPC-STD rod bearings with ceramic nano-composite polymer coating are the top forum pick on E46 Fanatics and NAM3Forum.',
        partBrand: 'King Racing',
        partName: 'Race Rod Bearings (S54)',
        partNumber: 'CR6877XPC-STD',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'ACL 6B2500H-STD race series rod bearings are the budget-friendly alternative at ~$150-$200. Well-reviewed on forums.',
        partBrand: 'ACL',
        partName: 'Race Rod Bearings (S54)',
        partNumber: '6B2500H-STD',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Send oil samples to Blackstone Labs every 5,000 miles. Elevated copper and lead levels indicate bearing wear BEFORE audible symptoms appear. Early detection saves engines.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Oil pan drop only required - engine stays in car. 5-hour DIY job. Replace all 6 rod bearings even if only some show wear.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-e46-throttle-actuator-2001',
    make: 'BMW',
    model: 'M3',
    years: { start: 2001, end: 2006 },
    title: 'Electronic Throttle Actuator (EDR) Failure',
    severity: 'high',
    description: 'The S54 uses a single electronic throttle actuator driving six individual throttle bodies. The actuator motor and TPS sensor fail over time, causing limp mode, reduced power, and eventually no-start conditions. BMW has DISCONTINUED the OEM replacement part (13627840537), making rebuilt units the primary solution. EBM Engineering (via Rogue Engineering) and ECU Testing offer rebuild services.',
    symptoms: [
      'Reduced power / limp mode',
      'Check engine light with throttle actuator codes',
      'Erratic throttle response',
      'Engine won\'t rev above 3,000-4,000 RPM',
      'No-start condition (severe failure)',
      'Rough idle'
    ],
    solution: 'Since BMW discontinued the OEM part (13627840537), rebuilt units are the primary option. EBM Engineering (via Rogue Engineering) offers send-in rebuilds for $500-$700+core. ECU Testing (UK) offers motor rewinding + TPS repair for $300-$500. Installation is 2-3 hours ($300-$600 labor). Source a good used unit as a spare - availability is increasingly scarce.',
    estimatedCost: { min: 500, max: 1500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'EBM Engineering (via Rogue Engineering) rebuilt throttle actuator for S54. Send-in rebuild service $500-$700+core. Most reliable rebuild source per NAM3Forum.',
        partBrand: 'EBM Engineering',
        partName: 'Rebuilt S54 Throttle Actuator',
        partNumber: '13627840537',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'BMW has DISCONTINUED the OEM throttle actuator (13627840537). New units are no longer available. Rebuilds and used units are the only options.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Buy a spare used throttle actuator now while they are still available. These are becoming increasingly scarce and prices are rising. Check eBay, E46 Fanatics classifieds.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'ECU Testing (UK) offers motor rewinding + TPS repair as a send-in service for $300-$500. Good budget option if the motor winding is the failure point.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },

  // ============================================================
  // E90/E92/E93 M3 (2008-2013) - S65 V8 Engine
  // ============================================================
  {
    id: 'bmw-m3-e9x-rod-bearing-2008',
    make: 'BMW',
    model: 'M3',
    years: { start: 2008, end: 2013 },
    title: 'Rod Bearing Failure (S65 V8) - CRITICAL',
    severity: 'high',
    description: 'This is the single most critical maintenance item on any E9x M3. The S65 V8 has dangerously tight factory bearing clearances (0.001" vs industry standard 0.0025"), and failure can occur before 50,000 miles with catastrophic results including spun bearings, connecting rod through the block, and total engine destruction. Rod bearing replacement is considered MANDATORY preventative maintenance by every BMW M3 forum. The overwhelming consensus across M3Post, Bimmerpost, and M5Board is to replace bearings before 60,000-70,000 miles regardless of symptoms. This is a non-negotiable maintenance item.',
    symptoms: [
      'Engine knocking under load (by this point, damage may already be done)',
      'Elevated copper/lead in Blackstone Labs oil analysis',
      'Oil pressure fluctuations',
      'Metallic debris on magnetic drain plug',
      'Sudden catastrophic engine failure (worst case)'
    ],
    solution: 'MANDATORY preventative replacement before 60,000-70,000 miles. Lang Racing Development custom ACL set (~$300-$350) achieves ideal 0.0023-0.0025" clearance using mixed shells (STD rod side + .001" oversize cap side). BE Bearings SP1527HK-STD-S65 ($590) is the premium option with tri-metal coating. Always replace with ARP 201-6001 connecting rod bolts ($250-$300) - factory stretch bolts cannot be reused. Professional installation $2,500-$3,500 total (8-15 hours labor). Dealer quotes $5,000-$9,500.',
    estimatedCost: { min: 2500, max: 5000 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Lang Racing Development custom ACL rod bearing set achieves ideal 0.0023-0.0025" clearance using mixed shells. Top recommendation on M3Post. Half the price of BE Bearings.',
        partBrand: 'ACL / Lang Racing',
        partName: 'Custom Clearance Rod Bearing Set (S65)',
        partNumber: '8B1580H-STD',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'BE Bearings SP1527HK-STD-S65 tri-metal rod bearings ($590) are the premium option with Tri-Armor coating. Lead-copper tri-metal design provides excellent embedability.',
        partBrand: 'BE Bearings',
        partName: 'Tri-Metal Rod Bearings (S65)',
        partNumber: 'SP1527HK-STD-S65',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'ARP 201-6001 connecting rod bolt kit is MANDATORY during any rod bearing service. Custom Age 625+ alloy, 260-280k psi tensile strength. Reusable unlike OEM stretch bolts.',
        partBrand: 'ARP',
        partName: 'Connecting Rod Bolt Kit (S65)',
        partNumber: '201-6001',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'THIS IS NON-NEGOTIABLE MAINTENANCE. Replace before 60,000-70,000 miles regardless of symptoms. By the time you hear knocking, catastrophic damage may already be occurring. Budget for this when buying any E9x M3.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Send oil to Blackstone Labs every 5,000 miles starting from purchase. Elevated copper/lead indicates bearing wear before audible symptoms. Lang Racing and M3Post have detailed analysis guides.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-e9x-throttle-actuator-2008',
    make: 'BMW',
    model: 'M3',
    years: { start: 2008, end: 2013 },
    title: 'Throttle Actuator Gear Failure (S65 V8)',
    severity: 'high',
    description: 'The S65 uses two throttle actuators (one per bank) with a design flaw in the internal gears that causes premature wear and electronic overload. The plastic gears strip, causing limp mode, reduced power, and fault codes. Both actuators typically fail within a similar timeframe. Beisan Systems offers rebuild gear sets, and the voltage regulator IC should also be replaced during service.',
    symptoms: [
      'Reduced power / limp mode',
      'Check engine light with throttle actuator codes',
      'One bank running in limp mode while other is normal',
      'Erratic throttle response',
      'Rough idle',
      'Poor fuel economy'
    ],
    solution: 'Beisan Systems BS101 gear set ($250 per actuator, need 2) is the most cost-effective solution. BS102 ($300) includes send-in rebuild with new gears. Electronics rebuild from bimmerthrottlerepair.com (~$70 each) is essential alongside gear replacement - the voltage regulator IC degrades chronically. Total DIY rebuild cost: $570-$650 for both actuators. Evolve Automotive uprated actuators ($1,200-$1,500/pair) are the premium fix-it-once solution.',
    estimatedCost: { min: 600, max: 3500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Beisan Systems BS101 throttle actuator gear set ($250/actuator). Need 2 sets for both banks. The definitive fix for stripped internal gears on S65 throttle actuators.',
        partBrand: 'Beisan Systems',
        partName: 'Throttle Actuator Gear Set (S65)',
        partNumber: 'BS101',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'Electronics rebuild from bimmerthrottlerepair.com (~$70/actuator) replaces the degraded voltage regulator IC. Essential alongside gear replacement for a complete fix.',
        partBrand: 'bimmerthrottlerepair.com',
        partName: 'Throttle Actuator Electronics Rebuild',
        partNumber: 'BS102',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Always rebuild BOTH actuators at the same time. If one has failed, the other is typically close behind. Total DIY cost ~$640 for both vs $3,000+ at dealer.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'Do not ignore throttle actuator limp mode codes. Running one bank in limp mode causes uneven engine load and can accelerate rod bearing wear on the affected bank.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-e9x-vanos-solenoid-2008',
    make: 'BMW',
    model: 'M3',
    years: { start: 2008, end: 2013 },
    title: 'VANOS Solenoid Failure (S65 V8)',
    severity: 'moderate',
    description: 'The S65 has four VANOS solenoids (intake and exhaust per bank) that wear over time, causing timing-related fault codes and performance loss. Common fault codes include 2A9A, 2A98, 2A82 (intake) and 2A9B, 2A99, 2A87 (exhaust). OEM solenoids are recommended over aftermarket. Can sometimes be cleaned first to confirm diagnosis by swapping side-to-side.',
    symptoms: [
      'Check engine light with VANOS fault codes (2A9A, 2A98, 2A82, 2A9B, 2A99, 2A87)',
      'Loss of power at certain RPM ranges',
      'Rough idle',
      'Poor throttle response',
      'Reduced fuel economy'
    ],
    solution: 'Replace VANOS solenoids with OEM parts. Intake solenoid: BMW 11367843118 (~$80-$150). Exhaust solenoid: BMW 11367843117 (~$80-$150). Always replace both solenoids on a bank simultaneously. Very DIY-friendly - solenoids are mounted on the front of the cylinder head (1-2 hours labor). Try cleaning first and swapping side-to-side to isolate the faulty solenoid before buying parts.',
    estimatedCost: { min: 200, max: 600 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM intake VANOS solenoid (BMW 11367843118) and exhaust solenoid (BMW 11367843117). OEM strongly recommended over aftermarket for S65 VANOS.',
        partBrand: 'BMW Genuine',
        partName: 'VANOS Solenoid Valve (S65)',
        partNumber: '11367843118',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Before buying new solenoids, try swapping intake and exhaust side-to-side to confirm which is faulty. If the fault code follows the solenoid, you have confirmed the failed unit.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Very DIY-friendly repair. Solenoids are on the front of the cylinder head, accessible with basic tools. 1-2 hours. Replace both on the affected bank at the same time.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-e9x-idle-control-2008',
    make: 'BMW',
    model: 'M3',
    years: { start: 2008, end: 2013 },
    title: 'Idle Control Valve (ICV) Failure / Idle Surge',
    severity: 'moderate',
    description: 'The S65 uses a dedicated idle control valve nestled in the V of the engine that controls idle speed. Failure causes rough idle, RPM hunting between 500-1500 RPM, and potentially limp mode. Was subject to BMW Service Bulletin 13-05-08 (recall). Price varies dramatically by retailer ($191-$844), so shop around.',
    symptoms: [
      'Idle RPM hunting/surging between 500-1500 RPM',
      'Rough idle',
      'Check engine light with P152D code',
      'Engine stalling at idle',
      'Limp mode'
    ],
    solution: 'Check with BMW dealer first - ICV was recalled under Service Bulletin 13-05-08 and may be covered. Replacement part BMW 13417838024 varies from $191 (Turner Motorsport) to $844 (other retailers). Installation requires removing air intake system to access ICV in engine V (2-3 hours, $300-$500 labor). Always inspect wiring harnesses for damage or corrosion before replacing the ICV.',
    estimatedCost: { min: 200, max: 1000 },
    recallInfo: 'BMW Service Bulletin 13-05-08 - check dealer for recall coverage',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW 13417838024 idle control valve. Price varies wildly - Turner Motorsport ~$191 vs up to $844 elsewhere. Shop around extensively.',
        partBrand: 'BMW Genuine',
        partName: 'Idle Control Valve (S65)',
        partNumber: '13417838024',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Check with your BMW dealer first - the ICV was recalled under Service Bulletin 13-05-08. May be covered at no cost.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Inspect wiring harness to the ICV before replacing. Corrosion or damaged wiring can cause identical symptoms and is a cheaper fix.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },

  // ============================================================
  // F80 M3 (2015-2018) - S55 Engine
  // ============================================================
  {
    id: 'bmw-m3-f80-crank-hub-2015',
    make: 'BMW',
    model: 'M3',
    years: { start: 2015, end: 2018 },
    title: 'Crank Hub Slip/Failure (S55) - CRITICAL',
    severity: 'high',
    description: 'The S55 crank hub is secured by a single bolt with friction material and no keyway. Under high load, the hub can slip on the crankshaft, throwing off valve timing and causing catastrophic engine damage costing $20,000+. This is considered mandatory preventive maintenance for any tuned F80 M3 and strongly recommended for stock cars that see spirited driving. The SSR Performance 4-pin double-keyed kit is the industry standard fix, which requires drilling the crankshaft to lock both timing and oil pump sprockets permanently.',
    symptoms: [
      'Sudden loss of power',
      'Check engine light with timing-related codes',
      'Engine misfires',
      'Catastrophic engine failure (worst case)',
      'Strange noises from front of engine'
    ],
    solution: 'SSR Performance double-keyed 4-pin crank hub kit (SSR-CHB-S55, ~$949) is the industry standard fix. Requires drilling the crankshaft - MUST be performed by a qualified technician with BMW specialty tools. Installation $800-$1,200 at an independent shop. Studio RSR offers complete installed service starting at $1,750 (includes oil change + coolant flush). Total parts + labor: $1,750-$2,200. The F80 Bimmerpost \'Crank Hub Issue Master Thread\' is essential reading.',
    estimatedCost: { min: 1750, max: 2500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'SSR Performance double-keyed 4-pin crank hub kit (SSR-CHB-S55, ~$949) is the overwhelming #1 recommendation on F80 Bimmerpost. Locks both timing and oil pump sprockets permanently.',
        partBrand: 'SSR Performance',
        partName: 'S55 Crank Hub Fix Kit',
        partNumber: 'SSR-CHB-S55',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Studio RSR offers complete installed crank hub service starting at $1,750 (includes oil change + coolant flush). Same-day service if scheduled in advance.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'Crank hub failure destroys the engine ($20,000+ replacement). This is MANDATORY for any tuned F80 M3 and strongly recommended even for stock cars driven hard. Do not skip this.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Read the F80 Bimmerpost "Crank Hub Issue Master Thread" before making decisions. It contains the definitive community knowledge on this issue.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-f80-charge-pipe-2015',
    make: 'BMW',
    model: 'M3',
    years: { start: 2015, end: 2018 },
    title: 'Plastic Charge Pipe Failure (S55)',
    severity: 'moderate',
    description: 'The factory plastic charge pipes (BMW 11617846245 for cylinders 1-3 and 11617846246 for cylinders 4-6) crack under boost pressure, even at stock levels. This causes immediate boost loss, reduced power, and a loud hissing sound. Failure rate increases dramatically with any tune. Upgraded aluminum charge pipes are a bolt-on replacement and considered essential maintenance.',
    symptoms: [
      'Sudden loss of power/boost',
      'Loud hissing or whooshing sound from engine bay',
      'Check engine light with boost-related codes',
      'Reduced turbo spool response',
      'Visible crack in plastic charge pipe'
    ],
    solution: 'Replace with aluminum charge pipes. VRSF 10801050 (~$200-$250) is the most popular option with CNC billet aluminum flanges and pre-tapped 1/8" NPT bungs. BMS/Burger Motorsports (~$200-$300) is the other top choice. FTP Motorsport (~$180-$250) is the budget option. All are direct bolt-on replacements. Very DIY-friendly (1 hour). This is considered essential maintenance for any tuned car.',
    estimatedCost: { min: 200, max: 400 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'VRSF upgraded cold-side J-pipe charge pipe (10801050, ~$200-$250) is the most popular option on F80 Bimmerpost. CNC billet aluminum flanges, 1/8" NPT bungs for water/meth.',
        partBrand: 'VRSF',
        partName: 'Aluminum Charge Pipe (S55)',
        partNumber: '10801050',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'BMS/Burger Motorsports aluminum charge pipes (~$200-$300) are the other top choice. Heavy-duty with pre-capped 1/8" NPT bung. Includes couplers and clamps.',
        partBrand: 'BMS',
        partName: 'Aluminum Charge Pipes (S55)',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Very easy DIY - bolt-on replacement in about 1 hour. No tuning required. Essential for any tuned car, strongly recommended even for stock.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'Factory plastic pipes can fail even at stock boost levels. Failure is sudden and complete - you will lose all boost instantly. Carry no spare; just upgrade to aluminum preventatively.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-f80-water-pump-2015',
    make: 'BMW',
    model: 'M3',
    years: { start: 2015, end: 2018 },
    title: 'Electric Water Pump Failure (S55)',
    severity: 'moderate',
    description: 'The S55 uses an electric water pump (Continental/VDO OEM supplier) that can fail without warning, leading to rapid overheating. Typical failure occurs around 60,000 miles. The pump is belt-driven and failure causes rapid temperature rise. Continental is the OEM supplier.',
    symptoms: [
      'Engine overheating warning',
      'Temperature gauge rising rapidly',
      'Coolant loss',
      'Water pump belt squealing',
      'Reduced heater output'
    ],
    solution: 'Replace with OEM/Continental water pump (BMW 11517846361, ~$260-$280). Always replace the water pump belt (BMW 11287848606, ~$20-$30) and thermostat during service. Flush the cooling system. OEM/Continental strongly recommended over aftermarket. Preemptive replacement recommended around 60,000 miles. Professional installation $400-$800 labor.',
    estimatedCost: { min: 800, max: 1600 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM/Continental water pump (BMW 11517846361, ~$260-$280). Continental is the OEM supplier - pump may arrive in Continental/VDO branded box. Strongly recommended over aftermarket.',
        partBrand: 'BMW Genuine / Continental',
        partName: 'Electric Water Pump (S55)',
        partNumber: '11517846361',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'Always replace the water pump belt (BMW 11287848606, ~$20-$30) during pump service. Old belt can cause new pump to fail prematurely.',
        partBrand: 'BMW Genuine',
        partName: 'Water Pump Belt',
        partNumber: '11287848606',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Replace preventatively around 60,000 miles. Failure is sudden - no gradual degradation. Also flush cooling system and replace thermostat at the same time.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'If overheating warning appears, stop driving IMMEDIATELY. The S55 will suffer head gasket or warped head damage very quickly once cooling is lost.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-f80-injector-failure-2015',
    make: 'BMW',
    model: 'M3',
    years: { start: 2015, end: 2018 },
    title: 'Direct Fuel Injector Failure (S55)',
    severity: 'moderate',
    description: 'The S55 direct injection system uses high-pressure fuel injectors that can fail, causing misfires, rough running, and check engine lights. Updated OEM injectors (BMW 13538616079) are available. For tuned cars, 1200cc Bosch injectors from the S63TU provide 33% more fuel flow.',
    symptoms: [
      'Misfires on one or more cylinders',
      'Rough idle',
      'Check engine light',
      'Reduced power',
      'Fuel smell from engine bay',
      'Poor cold start'
    ],
    solution: 'Replace failed injectors with OEM updated version (BMW 13538616079, ~$80-$120/each). For tuned cars making higher boost, 1200cc S63TU-spec Bosch injectors (13647599876 / BOS-0261500136, ~$150-$200/each) provide 33% more fuel flow. Injector coding/adaptation via BMW diagnostic software is required after replacement. Professional installation $400-$800 for complete set.',
    estimatedCost: { min: 500, max: 1500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM updated fuel injectors (BMW 13538616079, ~$80-$120 each). Updated design addresses early failure issues. 6 required for complete set.',
        partBrand: 'BMW Genuine',
        partName: 'Updated Fuel Injector (S55)',
        partNumber: '13538616079',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'For tuned cars: 1200cc S63TU-spec Bosch injectors (13647599876) provide 33% more fuel flow. Requires coding via BMW diagnostic software.',
        partBrand: 'Bosch',
        partName: '1200cc Fuel Injectors (S63TU spec)',
        partNumber: '13647599876',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Injector coding/adaptation via BMW ISTA or aftermarket diagnostic tool is required after replacement. Do not skip this step or you will get fault codes.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },

  // ============================================================
  // G80 M3 (2021-2023) - S58 Engine
  // ============================================================
  {
    id: 'bmw-m3-g80-cooling-system-2021',
    make: 'BMW',
    model: 'M3',
    years: { start: 2021, end: 2023 },
    title: 'Coolant System Issues (S58)',
    severity: 'low',
    description: 'Some G80 M3 owners report coolant loss requiring monitoring, though catastrophic failures are rare. The S58 cooling system is more robust than the S55, with BMW learning from previous failures. Most reports are minor and related to normal system bleeding/settling on newer vehicles. Electric water pump preemptive replacement recommended every 60,000 km (37,000 miles).',
    symptoms: [
      'Low coolant warning',
      'Coolant level dropping slowly over time',
      'Minor coolant weep from hose connections',
      'Temperature fluctuations during spirited driving'
    ],
    solution: 'Monitor coolant level monthly. Most coolant loss on new G80s is normal system settling. Inspect all hose connections and clamps at regular intervals. Electric water pump replacement recommended around 60,000 km (~37,000 miles) preventatively. Always use BMW-approved coolant. Professional water pump replacement ~$1,100-$1,600.',
    estimatedCost: { min: 100, max: 1600 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Most coolant loss reports on new G80 M3s are minor system settling. Monitor level monthly and top off as needed. If loss exceeds 500ml between services, investigate hose connections.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'The S58 cooling system is significantly more robust than the S55. BMW addressed many previous-generation failure points. Preemptive water pump replacement at 60,000 km is still recommended.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Most G80 M3s are still under BMW factory warranty. Report any coolant loss to your dealer for documentation and potential warranty coverage.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-g80-charge-pipe-2021',
    make: 'BMW',
    model: 'M3',
    years: { start: 2021, end: 2023 },
    title: 'Plastic Y-Shaped Charge Pipe Failure (S58)',
    severity: 'moderate',
    description: 'Similar to the F80 M3\'s S55, the G80 M3\'s S58 engine uses a Y-shaped plastic charge pipe that can crack under high boost conditions, especially with aftermarket tunes. Less urgent than the S55 issue since the S58 runs lower stock boost and has improved pipe design, but still a concern for tuned cars.',
    symptoms: [
      'Sudden loss of boost/power',
      'Loud hissing sound from engine bay',
      'Check engine light with boost codes',
      'Visible crack in Y-pipe'
    ],
    solution: 'Replace with aluminum charge pipe. FTP Motorsport (~$200-$300) is the most popular value option with CNC flanges and 1/8" NPT bungs. do88 Performance (~$300-$400) is the premium choice with measured 960 CFM vs OEM 835 CFM. Bolt-on replacement, very DIY-friendly. Essential for Stage 2+ tuned cars.',
    estimatedCost: { min: 200, max: 500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'FTP Motorsport S58 charge pipe (~$200-$300) is the most popular value option. All-aluminum with CNC flanges and pre-tapped 1/8" NPT bungs.',
        partBrand: 'FTP Motorsport',
        partName: 'S58 Aluminum Charge Pipe',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'part',
        content: 'do88 Performance S58 charge pipe (~$300-$400) is the premium choice. Cast aluminum with measured 960 CFM @ 150mbar vs OEM 835 CFM. Proven flow improvement.',
        partBrand: 'do88 Performance',
        partName: 'S58 Charge Pipe',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Less urgent than F80/S55 charge pipe issue - S58 stock boost is lower and pipe design is improved. Essential for Stage 2+ tunes, optional for stock/Stage 1.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-g80-adaptive-suspension-2021',
    make: 'BMW',
    model: 'M3',
    years: { start: 2021, end: 2023 },
    title: 'Adaptive M Suspension Electronic Damper Failure',
    severity: 'low',
    description: 'G80 M3 models with Adaptive M Suspension can experience electronic damper control failures, displaying \'Chassis Function Restricted\' warnings. Can be caused by electrical surges, water intrusion into damper electronics, or software glitches. Software updates resolve many issues. Hardware failures require individual damper replacement.',
    symptoms: [
      '\'Chassis Function Restricted\' warning message',
      'Suspension stuck in one mode',
      'Harsh or inconsistent ride quality',
      'Warning lights on dashboard',
      'Noticeable difference in ride between corners'
    ],
    solution: 'Software update at dealer ($0 under warranty, $150-$200 out of warranty) resolves many cases. Hardware failures require individual damper replacement ($500-$800/corner) or full set ($2,000-$3,500). Most G80 M3s should still be under warranty. Check for BMW software campaigns addressing adaptive suspension calibration.',
    estimatedCost: { min: 0, max: 3500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Many adaptive suspension faults are resolved by BMW software updates. Check with your dealer for any available software campaigns before paying for hardware replacement.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'Most G80 M3s are still under factory warranty (4yr/50k). Document and report any suspension faults to your dealer promptly for warranty coverage.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'warning',
        content: 'If Chassis Function Restricted appears, the car defaults to a fixed damping rate. It is still driveable but should be inspected soon. Do not ignore recurring warnings.',
        upvotes: 0,
        needsReview: false
      }
    ]
  },
  {
    id: 'bmw-m3-g80-idrive-electronics-2021',
    make: 'BMW',
    model: 'M3',
    years: { start: 2021, end: 2023 },
    title: 'iDrive 8 Software/Electronics Issues',
    severity: 'low',
    description: 'Early 2021 production G80 M3s experienced iDrive 8 screen blackouts, stereo cutouts, and phone connectivity failures. BMW has largely addressed these through over-the-air software updates. Persistent issues may require dealer software reflash or rarely head unit replacement.',
    symptoms: [
      'Screen blackouts / freezing',
      'Stereo audio cutouts',
      'CarPlay/Android Auto disconnections',
      'Backup camera failure',
      'Navigation glitches',
      'Bluetooth pairing issues'
    ],
    solution: 'Hard reboot by holding start/stop button 30 seconds with car off. Most issues resolved by BMW over-the-air updates. Dealer software reflash for persistent problems ($0 under warranty). Head unit replacement ($2,000-$4,000) only for confirmed hardware failures. Keep phone firmware updated - many connectivity issues are phone-side.',
    estimatedCost: { min: 0, max: 500 },
    recallInfo: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Hard reboot: hold the start/stop button for 30 seconds with the car off. Clears memory stack crashes and resolves most temporary glitches.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'BMW has released multiple OTA updates addressing iDrive 8 stability. Ensure your car is connected to WiFi regularly to receive updates automatically.',
        upvotes: 0,
        needsReview: false
      },
      {
        type: 'tip',
        content: 'CarPlay/Android Auto disconnections are often caused by phone firmware, not the BMW system. Update your phone OS and try both wired and wireless connections to isolate the issue.',
        upvotes: 0,
        needsReview: false
      }
    ]
  }
];

let addedCount = 0;
m3Issues.forEach(issue => {
  const exists = knownIssues.issues.some(i => i.id === issue.id);
  if (!exists) {
    knownIssues.issues.push(issue);
    addedCount++;
    console.log('  Added:', issue.title, '(' + issue.years.start + '-' + issue.years.end + ')');
  }
});

fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));
console.log('\n✓ Successfully added ' + addedCount + ' BMW M3 issues');
console.log('  Total issues in database: ' + knownIssues.issues.length);
