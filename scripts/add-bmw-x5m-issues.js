const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwX5MIssues = [
  {
    id: 'bmw-x5m-s63-rod-bearing-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2018 },
    title: 'S63 V8 Rod Bearing Premature Wear & Failure - E70/F85 X5 M',
    severity: 'high',
    description: 'The S63 4.4L twin-turbo V8 in the E70 (2010-2013) and F85 (2015-2018) X5 M shares the BMW M-car tendency toward premature rod bearing wear. While not as catastrophic as the S85 V10 or S65 V8 failure rates, the S63 has documented cases of rod bearing failure, particularly on vehicles driven hard or tracked without proactive bearing replacement. The S63 uses tight bearing clearances that can starve for oil under extreme conditions. Rod bearing failure presents as knocking noise progressing to catastrophic engine seizure. M5Board and XBimmers forums report failures occurring as early as 35,000 miles on tracked vehicles, though most street-driven examples last well beyond 100,000 miles with proper oil maintenance. Proactive replacement is recommended for track-driven X5 M vehicles at 60,000-80,000 miles.',
    symptoms: [
      'Ticking or knocking noise from engine, especially when cold',
      'Metallic debris or sparkle in engine oil during oil changes',
      'Low oil pressure warning light (late-stage failure)',
      'Increased engine vibration under load',
      'Rod knock that worsens as engine warms up',
      'In catastrophic failure: engine seizure or hole in block'
    ],
    solution: 'PREVENTIVE: For track-driven X5 M, replace rod bearings proactively at 60,000-80,000 miles. ACL Race Series rod bearings (8B1578HX-STD for S63B44, +0.001" extra oil clearance) are the community gold standard ($200-$350 for bearing set). WPC surface-treated bearings from Lang Racing are the premium choice ($400-$600 set). Total cost for preventive rod bearing service: $4,500-$8,500 depending on shop. Oil analysis every 5,000 miles through Blackstone Labs ($30/test) to monitor bearing wear metals (lead and copper). Use only BMW 10W-60 synthetic oil with 5,000-7,500 mile oil change intervals. Never track the car on cold oil. Mporium BMW offers specialized S63 rod bearing service starting at $4,499. If catastrophic failure: rebuilt S63 engine from RK Autowerks (~$8,500 + installation), new BMW engine (~$34,000), or complete engine rebuild ($12,000-$18,000).',
    estimatedCost: { min: 4500, max: 34000 },
    recallInfo: 'No official recall. BMW has never officially acknowledged S63 rod bearing concerns.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'ACL Race Series 8B1578HX-STD rod bearings for S63B44 - trimetal copper-lead construction with +0.001" extra clearance for improved oil film. Community gold standard on M5Board and XBimmers.',
        partBrand: 'ACL',
        partNumber: '8B1578HX-STD',
        partName: 'S63 Race Series Rod Bearing Set',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'WPC surface-treated Genuine BMW rod bearings from Lang Racing - premium option with surface treatment that dramatically reduces friction and wear. $400-$600 per set.',
        partBrand: 'Lang Racing (WPC treated)',
        partName: 'WPC Surface Treated S63 Rod Bearings',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Oil analysis every 5,000 miles through Blackstone Labs is the best early warning system - $30 per test monitors lead and copper levels that indicate bearing wear long before audible symptoms appear.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Mporium BMW specializes in S63 rod bearing service starting at $4,499. Mr Vanos also offers complete rod bearing service packages. Find a shop experienced with S63 - generic BMW shops often quote $15,000+.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Street-driven X5 M examples typically last well beyond 100,000 miles with proper oil maintenance. Don\'t panic - the S63 is more reliable than the S85/S65. But DO get proactive if you track the car.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-s63-wastegate-rattle-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2018 },
    title: 'S63 Twin Turbo Wastegate Rattle - E70/F85 X5 M',
    severity: 'moderate',
    description: 'The S63 twin turbochargers (Garrett MGT2260) in the E70 and F85 X5 M develop wastegate rattle, a metallic chattering noise caused by worn wastegate flapper bushings and arms inside the turbo housings. The wastegate flappers wear against the turbine housing bore over time, developing excessive play that causes the characteristic rattle. Most pronounced during cold starts and low-RPM driving, the rattle can become constant as wear progresses. While not immediately dangerous, advanced wastegate wear leads to boost control issues including overboost, underboost, and check engine lights. The F85 X5 M with S63TU (updated S63) has slightly improved wastegate design but can still develop rattle at higher mileages. MAMBA Turbo and aftermarket suppliers offer stainless steel wastegate rattle repair kits as a fraction of the cost of new turbochargers.',
    symptoms: [
      'Metallic rattling/chattering noise from engine bay, loudest at cold start',
      'Rattle most prominent at idle and low RPM, may diminish under load',
      'Check engine light with boost-related fault codes',
      'Gradual loss of boost pressure or boost control accuracy',
      'Overboost condition (wastegate stuck closed)',
      'Rattle progressively worsening over time'
    ],
    solution: 'Option 1 (Most cost-effective): MAMBA SUS316 stainless steel wastegate rattle flapper repair kit for S63 MGT2260 (part 077-0024, replaces 790463-2 / 790484-3), approximately $150-$300 per turbo. Requires turbo removal for installation. Option 2: Lskioer turbo wastegate rattle flapper repair kit for S63/S63TU MGT2260DSL ($80-$150 per kit on Amazon). Option 3: Replace turbo wastegate actuators with new OEM units ($300-$500 each). Option 4: Full turbocharger replacement with new or remanufactured units ($3,000-$5,000 per turbo + labor). Labor for turbo removal and reinstallation: $2,000-$3,500 for both turbos. While turbos are out: replace turbo oil feed/return lines, coolant lines, and all gaskets (GRYPHONTEK turbo coolant line repair kit for E70 X5M, ~$200-$400).',
    estimatedCost: { min: 1500, max: 12000 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'MAMBA SUS316 wastegate rattle flapper kit (077-0024) for S63 MGT2260 - stainless steel construction replaces worn factory parts. $150-$300 per turbo. Far cheaper than new turbos.',
        partBrand: 'MAMBA Turbo',
        partNumber: '077-0024',
        partName: 'S63 MGT2260 Wastegate Rattle Flapper Repair Kit (SUS316)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'GRYPHONTEK S63 turbo coolant line repair kit replaces failure-prone plastic T-fittings with brass fittings and multi-layer silicone hoses. MUST-DO while turbos are out for wastegate repair.',
        partBrand: 'GRYPHONTEK',
        partName: 'S63 E70 X5M/X6M Turbo Coolant Line Repair Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'While turbos are removed for wastegate fix, also replace: turbo oil feed lines, turbo oil return lines, turbo coolant lines (GRYPHONTEK kit), and all turbo-to-manifold gaskets. Labor overlap saves $2,000+.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'A mild rattle only at cold start that disappears within 30 seconds is early-stage and not urgent. Constant rattle at all temperatures indicates advanced wear - schedule repair before boost control is affected.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-s63-turbo-coolant-line-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2013 },
    title: 'S63 Turbo Coolant Line Plastic T-Fitting Failure (Hot-V Design) - E70 X5 M',
    severity: 'high',
    description: 'The E70 X5 M\'s S63 engine uses a "hot-V" turbocharger configuration where the twin turbos sit between the cylinder banks in the engine valley - the hottest area of the engine. The turbo coolant lines run through this extreme heat zone and rely on plastic T-fittings (junction connectors) that degrade from constant heat cycling. Over time, these plastic fittings become brittle and crack without warning, causing sudden and severe coolant loss directly onto the hot turbochargers. This can lead to turbo overheating, turbo bearing failure, and potential engine overheating if the coolant loss is not immediately detected. GRYPHONTEK developed a professional-grade replacement kit with brass T-fittings and multi-layer silicone hoses specifically because this is such a widespread and dangerous failure point. This issue is specific to the first-gen S63 in the E70 - the S63TU in F85 used improved materials.',
    symptoms: [
      'Sudden large coolant loss (puddle under car or steam from engine bay)',
      'Coolant warning light with rapid temperature rise',
      'Sweet smell of coolant from engine bay (burning on hot turbo housings)',
      'Steam or white smoke from under hood',
      'Overheating after coolant loss',
      'Visible cracking or weeping at plastic coolant T-fittings in engine valley'
    ],
    solution: 'Replace ALL factory plastic turbo coolant T-fittings and hoses with GRYPHONTEK S63 Turbo Coolant Line Repair Kit ($200-$400). Kit includes pre-shaped multi-layer reinforced silicone hoses, brass T-fittings (replacing factory plastic), and all necessary hose clamps. Direct bolt-on installation designed for the E70/E71 S63 engine bay. MAMBA Turbo also offers a reinforced turbo coolant line kit with brass and silicone components ($150-$350). This is a PROACTIVE replacement - do not wait for failure. Replace at first sign of coolant weeping or during any turbo service. Labor: $800-$1,500 due to tight access in hot-V engine valley. If turbo bearings are damaged from overheating: turbo replacement $3,000-$5,000 per unit.',
    estimatedCost: { min: 600, max: 2000 },
    recallInfo: 'No official recall despite widespread failure pattern.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'GRYPHONTEK S63 Turbo Coolant Line Repair Kit - multi-layer silicone hoses and brass T-fittings replace failure-prone factory plastic. Eliminates hot-V coolant leak risk permanently. $200-$400.',
        partBrand: 'GRYPHONTEK',
        partName: 'BMW X5M X6M S63 Turbo Coolant Line Repair Kit (E70 E71)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'MAMBA Turbo reinforced turbo coolant line kit with brass and silicone components - alternative to GRYPHONTEK. Both are major improvements over factory plastic. $150-$350.',
        partBrand: 'MAMBA Turbo',
        partName: 'Reinforced Turbo Coolant Line Hose Kit (S63 E70/E71)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'This is a PROACTIVE replacement - do NOT wait for failure. A cracked plastic T-fitting dumps coolant directly onto 900-degree turbochargers. The factory plastic WILL fail - it is a matter of when, not if.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Best time to replace turbo coolant lines is during any turbo service (wastegate repair, turbo replacement). The labor to access the hot-V area is the expensive part - parts are relatively cheap.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-s63-vanos-solenoid-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2023 },
    title: 'S63 VANOS Solenoid Failure - E70/F85/F95 X5 M',
    severity: 'moderate',
    description: 'The S63 4.4L twin-turbo V8 in all generations of X5 M requires four VANOS (Variable Valve Timing) solenoids to control variable camshaft timing on both intake and exhaust cams of both cylinder banks. These solenoids fail through coil malfunction, sticking from oil varnish, and O-ring deterioration, typically between 80,000-120,000 miles. When VANOS solenoids fail, the engine loses ability to optimize valve timing, causing rough idle, power loss, poor fuel economy, and check engine lights. The S63 uses VANOS solenoid part number 11368605123 (Pierburg OEM, N63/S63 compatible) or Genuine BMW 11368482268 for newer S63TU applications. Unlike the S85\'s catastrophic VANOS pump failure, S63 VANOS solenoid failure is annoying but not engine-threatening - and relatively inexpensive to fix.',
    symptoms: [
      'Rough or unstable idle with RPM fluctuations',
      'Reduced power output and sluggish acceleration',
      'Engine misfires under load',
      'Increased fuel consumption (10-20% higher than normal)',
      'Check engine light with VANOS-related fault codes',
      'Rattling or ticking noise from engine at startup (VANOS gear noise)'
    ],
    solution: 'Replace all 4 VANOS solenoids simultaneously - they are same age and if one has failed, others are close behind. Pierburg 11368605123 (OEM supplier) at $30-$50 each from Turner Motorsport or BimmerWorld. Genuine BMW 11368482268 for S63TU applications at $50-$70 each. Total parts cost: $120-$280 for all 4 solenoids. Also replace VANOS solenoid O-rings and filter screens during service. Labor: 1-2 hours professional ($150-$400 labor). This is one of the easier S63 repairs - accessible from top of engine without removing intake manifold. Natafox and Febi also offer quality aftermarket VANOS solenoids at lower cost ($20-$35 each). Clean VANOS system with fresh oil change immediately after solenoid replacement.',
    estimatedCost: { min: 200, max: 700 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Pierburg 11368605123 VANOS solenoid (OEM supplier to BMW) - $30-$50 each, 4 required for S63. Best value quality option. Available from Turner Motorsport with free shipping.',
        partBrand: 'Pierburg',
        partNumber: '11368605123',
        partName: 'VANOS Solenoid (N63/S63)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Genuine BMW 11368482268 VANOS actuator for newer S63TU applications (F85/F95 X5 M). $50-$70 each at BimmerWorld.',
        partBrand: 'Genuine BMW',
        partNumber: '11368482268',
        partName: 'VANOS Actuator (S63TU)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace ALL 4 VANOS solenoids at once even if only one has failed. Parts are $120-$280 total for all 4 - not worth paying labor twice to replace the others when they fail 6 months later.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'This is one of the easier S63 DIY repairs - solenoids are accessible from top of engine. Many YouTube guides available. Save $200-$400 in labor for a 1-2 hour job.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-transfer-case-actuator-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2023 },
    title: 'xDrive Transfer Case Actuator Motor Failure - E70/F85/F95 X5 M',
    severity: 'moderate',
    description: 'The X5 M\'s xDrive transfer case uses an electric actuator motor to engage and adjust torque distribution between front and rear axles. The actuator motor contains internal plastic gears that wear over time, causing the xDrive system to malfunction. When the actuator fails, the transfer case cannot properly engage, resulting in xDrive fault warnings, loss of AWD capability, and in some cases the vehicle being stuck in 2WD mode. XBimmers forum documents this as a common issue across all X5 M generations, with failures typically occurring between 60,000-100,000 miles. The actuator motor is a serviceable component that can be replaced without removing the entire transfer case. Factory-fill transfer case fluid should also be changed at this time as BMW\'s "lifetime fill" claim does not apply to M vehicles.',
    symptoms: [
      'xDrive malfunction warning on dashboard',
      'Transfer case warning lights or fault codes',
      'Loss of all-wheel drive capability (vehicle stuck in RWD)',
      'Grinding or whining noise from transfer case area',
      'Delayed engagement when accelerating from stop',
      'Clunking during low-speed turns',
      'Vehicle pulling to one side under hard acceleration'
    ],
    solution: 'Replace transfer case actuator motor. E70 X5 M: BMW 27107566296 or equivalent ($250-$450 for actuator motor). F85 X5 M: BMW 27608643153 or equivalent ($300-$500). F95 X5 M: check VIN-specific part number with dealer. FCP Euro has an excellent DIY guide for BMW transfer case actuator repair - the actuator can be replaced without removing the entire transfer case. Labor: 2-3 hours at specialist shop ($300-$600 labor). Change transfer case fluid at same time with BMW DTF-1 specification fluid. XeMODeX offers remanufactured transfer case actuator motors at reduced cost ($200-$350). For complete transfer case failure: $3,500-$6,000 for replacement unit + labor.',
    estimatedCost: { min: 500, max: 6000 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'For E70 X5 M: transfer case actuator motor BMW 27107566296 ($250-$450). XeMODeX offers quality remanufactured units at $200-$350. FCP Euro has DIY replacement guide.',
        partBrand: 'Genuine BMW / XeMODeX',
        partNumber: '27107566296',
        partName: 'Transfer Case Actuator Motor (E70)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Change transfer case fluid every 30,000 miles - BMW claims "lifetime fill" which is NOT correct for M vehicles. $150 fluid change prevents $5,000 transfer case replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'FCP Euro has an excellent step-by-step DIY guide for BMW transfer case actuator replacement. Actuator can be replaced without dropping the entire transfer case - saves significant labor cost.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Ensure all 4 tires are same brand, size, and within 2/32" tread depth of each other. Mismatched tires are the #1 cause of accelerated transfer case wear on xDrive vehicles.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-brake-system-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2023 },
    title: 'Heavy-Duty Brake System Accelerated Wear - E70/F85/F95 X5 M',
    severity: 'moderate',
    description: 'The X5 M weighs approximately 5,300-5,500 lbs and produces 555-617hp depending on generation, placing enormous demands on the braking system. Despite massive brake rotors (395mm front standard, 400mm front on F85 with optional carbon ceramic, 385mm rear) and multi-piston Brembo calipers, brake pad and rotor wear is significantly accelerated compared to lighter vehicles. The E70 X5 M uses 6-piston front calipers, the F85 uses 6-piston fronts with optional carbon ceramic system, and the F95 uses upgraded M compound brakes. Front brake pads typically last 15,000-20,000 miles in mixed driving, with rotors lasting 40,000-60,000 miles. Track use dramatically accelerates wear - expect 3,000-5,000 miles from pads on track. The sheer size and cost of X5 M brake components makes this a significant ongoing maintenance expense.',
    symptoms: [
      'Brake pad wear sensor warning earlier than expected (15,000-20,000 miles)',
      'Heavy brake dust accumulation on wheels (especially front)',
      'Visible scoring and grooving on massive rotors',
      'Brake fade during extended downhill driving or after repeated hard stops',
      'Brake pedal pulsation (warped rotors from heat)',
      'Squealing or grinding noise (worn past minimum thickness)'
    ],
    solution: 'E70 X5 M brakes: OEM front pads 34116799964 ($150-$250), rear pads 34216794879 ($120-$200). F85 X5 M front brake rotors: 34112284101/34112284102 with 6-pot caliper 34117845747/34117845748 and pads 34112284869. F85 rear: 385mm x 24mm perforated rotors 34212284903/34212284904 with 4-pot Brembo caliper and Textar pads. Budget $1,500-$2,500 per axle for complete brake service. For track use: EBC Yellowstuff or Hawk HPS 5.0 pads ($200-$350 per axle) with StopTech slotted rotors for improved heat management. Use Motul RBF 660 or ATE Typ 200 brake fluid - flush every 12 months. Budget $3,000-$5,000 per year for brake maintenance if driving spiritedly.',
    estimatedCost: { min: 1500, max: 5000 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'E70 X5 M: OEM front pads 34116799964, rear pads 34216794879 from BimmerWorld. F85: front pads 34112284869, front rotors 34112284101/34112284102.',
        partBrand: 'Genuine BMW',
        partNumber: '34116799964 / 34216794879',
        partName: 'OEM M Compound Brake Pads (E70 X5 M Front / Rear)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'EBC Yellowstuff or Hawk HPS 5.0 pads are the street/track compromise choice for X5 M owners. Better heat resistance than OEM with reasonable street manners. $200-$350 per axle.',
        partBrand: 'EBC / Hawk',
        partName: 'Yellowstuff / HPS 5.0 Performance Brake Pads',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Budget $3,000-$5,000 per year for brake maintenance on X5 M driven spiritedly. At 5,300+ lbs with 555+ hp, brakes are a major consumable cost. Factor this into ownership budget.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Flush brake fluid every 12 months with Motul RBF 660 ($30 per bottle). BMW DOT4 absorbs moisture quickly and brake fluid boiling during hard use causes instant pedal loss. Critical safety item.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-s63-cooling-system-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2023 },
    title: 'S63 Cooling System Component Failures - E70/F85/F95 X5 M',
    severity: 'high',
    description: 'The S63 4.4L twin-turbo V8 generates extreme heat, particularly with the hot-V turbocharger configuration, creating severe thermal stress on the cooling system. The cooling system uses multiple components that degrade from constant high-temperature exposure: electric water pump, thermostat, expansion tank, radiator hoses, and coolant pipes. The expansion tank (plastic) can crack at seams under thermal cycling, especially on E70 models. Radiator hoses soften, bulge, and burst from sustained heat. The electric water pump fails similarly to other BMW electric pumps - suddenly and without warning. The thermostat is electronically controlled and its sensor can fail, causing erratic temperature readings. BMW recommends coolant flush every 4 years or 40,000 miles to prevent deposit buildup. XBimmers forum considers cooling system maintenance the single most important preventive service for X5 M longevity.',
    symptoms: [
      'Coolant temperature climbing above normal during spirited driving',
      'Low coolant warning light (expansion tank crack or hose leak)',
      'Sudden overheating with no warning (water pump failure)',
      'Erratic temperature gauge readings (thermostat failure)',
      'Visible coolant weeping from expansion tank seams or hose connections',
      'Sweet coolant smell from engine bay',
      'Steam from under hood (burst hose or major leak)'
    ],
    solution: 'PROACTIVE MAINTENANCE SCHEDULE: Replace electric water pump at 60,000 miles ($400-$700 + labor). Replace thermostat at same time ($150-$250). Replace expansion tank at 60,000-80,000 miles ($100-$200). Inspect all coolant hoses at every oil change - replace any that are soft, bulging, or showing surface cracks. E70 X5 M expansion tank vent hose: 17128627119 ($30-$50). Flush coolant system every 2 years or 30,000 miles (more frequent than BMW\'s 4-year recommendation). Use ONLY BMW coolant mixed 50/50 with distilled water. For E70 hot-V turbo coolant lines: GRYPHONTEK repair kit eliminates plastic T-fitting failure (see separate issue entry). Budget $1,500-$2,500 for complete cooling system refresh at 60,000 miles. This prevents catastrophic overheating that can destroy the S63 engine ($15,000-$34,000 engine replacement).',
    estimatedCost: { min: 500, max: 2500 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'The S63 generates EXTREME heat with hot-V turbo configuration. Cooling system failure can destroy the engine within minutes. Proactive replacement of cooling components at 60,000 miles is the single best investment in X5 M ownership.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Flush coolant every 2 years or 30,000 miles - more frequent than BMW recommends. Deposit buildup from inadequate flushing reduces cooling capacity over time. Use ONLY BMW coolant with distilled water.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace water pump, thermostat, and expansion tank as a package at 60,000 miles. Labor overlap saves $500-$800 vs. doing individually. FCP Euro lifetime warranty covers all three components.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'E70 X5 M expansion tank vent hose BMW 17128627119 (~$40) - cheap part that causes expensive problems when it fails. Replace preemptively.',
        partBrand: 'Genuine BMW',
        partNumber: '17128627119',
        partName: 'Radiator Expansion Tank Vent Hose (E70/E71/F85/F86)',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-s63-oil-leaks-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2023 },
    title: 'S63 V8 Chronic Oil Leaks (Valve Cover, Oil Pan, Turbo Lines) - E70/F85/F95 X5 M',
    severity: 'moderate',
    description: 'The S63 4.4L twin-turbo V8 is notorious for developing oil leaks from multiple locations as the engine ages. The most common leak sources are: valve cover gaskets (both sides), oil filter housing gasket, oil pan gasket, turbo oil feed/return lines, and VANOS solenoid seals. The hot-V turbo configuration subjects gaskets and seals to extreme heat cycling that accelerates rubber and gasket deterioration. Valve cover gaskets on the S63 can begin leaking as early as 50,000 miles, with oil dripping onto hot exhaust components creating burning oil smell and potential fire hazard. Oil filter housing gasket is the second most common source. Oil pan gasket requires engine/subframe drop for access, making it an expensive repair. M5Board and XBimmers forums report oil leaks as the single most common S63 maintenance issue.',
    symptoms: [
      'Burning oil smell from engine bay (oil on hot exhaust/turbo)',
      'Oil drips visible on driveway or garage floor',
      'Low oil level warning light between oil changes',
      'Oil consumption higher than normal (1 quart per 1,000-2,000 miles)',
      'Visible oil weeping around valve covers, oil filter housing, or oil pan',
      'Smoke from engine bay at traffic lights (oil burning on exhaust)',
      'Blue-tinted exhaust smoke on startup (valve stem seals)'
    ],
    solution: 'Valve cover gasket replacement (both sides): $1,200-$2,500 with labor. BMW plastic valve covers can crack and must be replaced entirely (not just gasket) - inspect during service. Oil filter housing gasket: $400-$800 with labor. Oil pan gasket: $2,000-$3,500 (requires engine/subframe drop). Turbo oil feed/return lines: replace with GRYPHONTEK or MAMBA upgraded silicone/braided lines during any turbo service ($200-$400). VANOS solenoid seals: $100-$200 (DIY-friendly). For comprehensive oil leak repair at 80,000+ miles: budget $3,000-$5,000 to address all common leak points simultaneously. Valve cover bolt torque is CRITICAL - too tight cracks the cover ($800-$1,200 per cover), too loose and it leaks.',
    estimatedCost: { min: 400, max: 5000 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Oil leaking onto hot turbochargers or exhaust is a FIRE HAZARD. Do not ignore burning oil smell from engine bay. Have leaks diagnosed and repaired promptly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When replacing valve cover gaskets, closely inspect the plastic valve covers for cracks. BMW plastic covers crack from heat and age - if cracked, the entire cover must be replaced ($800-$1,200 per side).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Address all oil leaks together at 80,000+ miles - valve covers, oil filter housing, and turbo lines share overlapping labor. Doing them separately costs 2-3x more in total labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Oil analysis every 5,000 miles monitors oil consumption trends and helps differentiate between external leaks and internal consumption (valve stem seals). Blackstone Labs: $30/test.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5m-rear-differential-2010',
    make: 'BMW',
    model: 'X5 M',
    years: { start: 2010, end: 2023 },
    title: 'Rear Differential Wear & Fluid Degradation - E70/F85/F95 X5 M',
    severity: 'moderate',
    description: 'The X5 M rear differential handles massive torque loads from the S63 V8 through the xDrive system. The factory differential fluid degrades faster than BMW\'s "lifetime fill" claim suggests, especially under spirited driving or track use. Degraded fluid causes increased friction, heat, and accelerated gear wear. The E70 X5 M differential has no drain plug, requiring fluid extraction through the fill port with a hand pump or suction device - a design that discourages regular fluid changes. The limited-slip differential internals (clutch packs) wear over time, reducing the diff\'s ability to transfer torque to the wheel with traction. XBimmers forum reports differential vibration and noise developing after 80,000 miles on vehicles with original fluid. Royal Purple 75W-140 GL5 synthetic is the community-preferred replacement fluid for reduced operating temperature and improved protection.',
    symptoms: [
      'Whining or howling noise from rear, especially at 30-50 MPH',
      'Vibration or shake from rear end',
      'Clunking when transitioning from acceleration to deceleration',
      'Reduced limited-slip diff effectiveness (one wheel spins more easily)',
      'Increased rear differential operating temperature',
      'Diff fluid dark, burnt smelling, or containing metallic particles'
    ],
    solution: 'Change rear differential fluid every 30,000 miles (ignore BMW "lifetime fill" claim). E70 X5 M: No drain plug - fluid must be extracted through fill port with hand pump or suction device. Recommended fluid: Royal Purple 75W-140 GL5 synthetic or Red Line 75W-140 GL5 ($40-$60 per fill). Capacity approximately 1.2 liters. For limited-slip diff, ensure fluid is GL5 rated with limited-slip additive. If differential is making whining/howling noise: have a limited-slip differential specialist inspect internals (not generic BMW shop). Diff rebuild: $1,500-$3,000 at specialist. Complete differential replacement: $3,000-$5,500 + labor. Labor for fluid change: $150-$300 at independent shop.',
    estimatedCost: { min: 150, max: 5500 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Royal Purple 75W-140 GL5 synthetic differential fluid - XBimmers forum reports noticeable reduction in diff noise and operating temperature vs. factory fill. ~$20 per quart.',
        partBrand: 'Royal Purple',
        partName: '75W-140 GL5 Synthetic Gear Oil',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'BMW "lifetime fill" differential fluid is NOT adequate for M vehicles driven hard. Change every 30,000 miles. $50 in fluid prevents $3,000+ differential rebuild.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'E70 X5 M has no drain plug on the differential - you need a hand pump or oil extractor to remove fluid through the fill port. Budget extra time for this awkward procedure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If differential is making noise, find a limited-slip differential specialist - not a generic BMW shop. LSD rebuilds require specific expertise and tooling. XBimmers forum has regional shop recommendations.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add issues to known issues database
let addedCount = 0;
let skippedCount = 0;

bmwX5MIssues.forEach(issue => {
  const existingIndex = knownIssues.issues.findIndex(i => i.id === issue.id);
  if (existingIndex === -1) {
    knownIssues.issues.push(issue);
    addedCount++;
    console.log(`Added: ${issue.title}`);
  } else {
    skippedCount++;
    console.log(`Skipped (already exists): ${issue.title}`);
  }
});

fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`\nDone! Added ${addedCount} BMW X5 M issues (${skippedCount} skipped).`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
