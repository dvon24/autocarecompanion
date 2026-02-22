const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwZ4Issues = [
  {
    id: 'bmw-z4-e85-rear-subframe-cracking-2003',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2003, end: 2008 },
    title: 'Rear Subframe Mounting Point Cracking & Spot Weld Failure - E85 Z4',
    severity: 'high',
    description: 'The E85 Z4 shares the E46 platform\'s infamous rear subframe weakness where the rear subframe mounting points crack and spot welds pop, particularly on the Z4 M Roadster and 3.0i models with stiffer suspension. The rear trailing arm bushings transmit road forces into the sheet metal mounting points, and over time the thin sheet metal tears away from the spot welds. The sway bar attachment points are also known weak spots where spot welds fail. This is especially common on cars driven hard or on rough roads. ZRoadster.org and Z4-forum consider this a critical inspection item for any E85 purchase. The repair involves welding reinforcement plates onto the unibody structure - this is NOT a bolt-on fix.',
    symptoms: [
      'Clunking or banging noises from rear suspension over bumps',
      'Rear end feels loose or vague during cornering',
      'Visible cracking in trunk floor near subframe mounting points (scrape away sealer to inspect)',
      'Popped spot welds visible at sway bar mounting points',
      'Progressive worsening of rear suspension noises',
      'Uneven rear tire wear from subframe misalignment'
    ],
    solution: 'INSPECTION: Check from trunk by scraping away factory sealer around subframe mounting points - look for cracks radiating from bolt holes. REPAIR: Randy Forbes reinforcement kit is the gold standard on ZRoadster and Z4-forum - an I-beam that ties upper and lower portions of trunk floor together ($400-$600 for kit). Installation requires professional welding by a collision repair shop ($1,000-$2,500 labor). Complete repair with kit and labor runs $2,300-$5,000 depending on extent of damage. Alternative: Ultra Racing rear subframe brace UR-RL6-1178 (6-point bolt-on reinforcement) for preventative use before cracking occurs ($200-$350). Replace all 17 rear subframe and differential bushings during repair. Meyle HD trailing arm bushings recommended as upgrade over OEM rubber.',
    estimatedCost: { min: 2300, max: 5000 },
    recallInfo: 'No official recall. Shared platform weakness with E46 3 Series.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is a CRITICAL inspection item before purchasing any E85 Z4, especially M Roadster. Check from the trunk area by scraping away factory sealer near subframe mounting points. Cracking can be invisible without removing sealer.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Randy Forbes reinforcement kit is the gold standard - an I-beam that ties upper and lower trunk floor together. ZRoadster.org universally recommends this over simple weld-on plates.',
        partBrand: 'Randy Forbes',
        partName: 'E85/E46 Subframe Reinforcement Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Ultra Racing UR-RL6-1178 rear subframe 6-point brace is a bolt-on preventative solution before cracking occurs. Not a fix for existing cracks but good insurance on clean cars.',
        partBrand: 'Ultra Racing',
        partName: 'Rear Subframe 6-Point Brace (UR-RL6-1178)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'While subframe is out, replace all 17 rear subframe and differential bushings. Meyle HD trailing arm bushings are the forum-recommended upgrade over worn OEM rubber.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Budget $2,300-$5,000 for full reinforcement at a collision shop. This is NOT a DIY job - requires professional TIG welding and proper jigging to maintain alignment.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-n54-hpfp-2009',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2009, end: 2011 },
    title: 'N54 High Pressure Fuel Pump (HPFP) Failure - E89 Z4 sDrive35i/35is',
    severity: 'high',
    description: 'The E89 Z4 sDrive35i and 35is use the N54 3.0L twin-turbo engine which has a well-documented high pressure fuel pump (HPFP) failure. The original HPFP used a split-design where fuel goes to one half and lubrication to the other, separated by an internal O-ring that degrades prematurely causing loss of fuel rail pressure. When the HPFP fails, the engine cannot maintain fuel pressure under boost, causing immediate loss of power, misfires, and potential engine stalling at highway speeds - a serious safety concern. BMW issued TSB SI B13 03 09 acknowledging the defect and released multiple revised pump versions. Early 2009 Z4 35i models are most affected. The HPFP went through multiple revision indexes, with the latest being the most reliable.',
    symptoms: [
      'Long cranking time before engine starts',
      'Engine stalling at idle or during acceleration',
      'Severe loss of power under boost (fuel pressure drops below 50 PSI)',
      'Rough idle and engine misfires (codes 29D0, 29D2, 29E2)',
      'Check engine light with fuel pressure fault codes',
      'Car enters limp mode with reduced power',
      'Fuel smell from engine bay due to injector overfueling at low pressure'
    ],
    solution: 'Replace HPFP with latest revision Genuine BMW unit. The pump went through multiple revisions - ONLY install the latest version. Part number evolution: Original -> 13517592881 (Index 10, TSB fix) -> 13517616170 (latest revision, most reliable). Genuine BMW 13517616170 is the definitive fix ($350-$550 for pump). Replacement is straightforward DIY (1-2 hours) with basic tools. Also available as complete kit from FCP Euro with lifetime warranty. BMW extended warranty coverage to 10 years/120,000 miles under customer care package for original owners - check VIN eligibility. Replace low-pressure fuel sensor at same time (13537537319) as it may have been damaged by pressure fluctuations ($35-$55).',
    estimatedCost: { min: 350, max: 900 },
    recallInfo: 'TSB SI B13 03 09. BMW extended HPFP warranty to 10 years/120,000 miles under customer care package for affected N54 vehicles.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'ONLY install the latest revision HPFP (13517616170). Earlier revisions including the original TSB replacement (13517592881) can also fail. Insist on latest index from dealer or parts supplier.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Genuine BMW HPFP 13517616170 is the latest revision and definitive fix. Available from FCP Euro with lifetime warranty for ~$400. Do NOT use aftermarket pumps - only Genuine BMW.',
        partBrand: 'Genuine BMW',
        partNumber: '13517616170',
        partName: 'High Pressure Fuel Pump (HPFP) - Latest Revision',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your VIN is covered under BMW\'s extended HPFP warranty (10 years/120,000 miles). Many 2009-2010 Z4 35i models qualify - dealer will replace for free if eligible.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace low-pressure fuel sensor (13537537319, ~$40) at same time - pressure fluctuations from failing HPFP can damage this sensor. Cheap insurance during same repair.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-n54-wastegate-rattle-2009',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2009, end: 2016 },
    title: 'N54 Twin Turbo Wastegate Rattle - E89 Z4 sDrive35i/35is',
    severity: 'moderate',
    description: 'The N54 twin turbochargers in the E89 Z4 sDrive35i/35is develop a pronounced wastegate rattle, typically audible during cold starts and low-RPM driving. The wastegate flappers wear against the turbine housing, causing the characteristic metallic rattling sound. The rattle is caused by worn wastegate bushings and flapper arms that develop excessive play over time. While the rattle itself does not cause immediate performance loss, it indicates increasing wear that will eventually lead to wastegate seal bypass (loss of boost control) and potential check engine lights for overboost or underboost conditions. BMW OEM wastegate actuators are part numbers 11657585746 (front) and 11657585747 (rear).',
    symptoms: [
      'Metallic rattling or chattering noise from engine bay, especially during cold starts',
      'Rattle most pronounced at idle and low RPM, may diminish at higher RPM',
      'Gradual loss of boost pressure as wastegate sealing degrades',
      'Check engine light with overboost or underboost fault codes',
      'Boost creep (uncontrolled boost rise) if wastegate sticks closed',
      'Rattle becomes louder over time as wear progresses'
    ],
    solution: 'Option 1: Vargas Turbo Technologies (VTT) Wastegate Rattle Fix Kit - the community gold standard. Includes stainless steel bushings, full 12.6mm flapper arm (vs. stock 11.5mm), wastegate arm, rod end, and stainless 8mm C-clip. Requires turbo removal for installation ($1,800-$3,000 with labor). Option 2: Replace OEM wastegate actuators - front 11657585746 and rear 11657585747 ($200-$350 each, addresses symptoms but not root cause). Option 3: Full turbo replacement with updated units ($3,500-$5,500 for pair + labor). VTT fix is most cost-effective long-term solution as it addresses root cause with upgraded materials.',
    estimatedCost: { min: 1800, max: 5500 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Vargas Turbo Technologies (VTT) Wastegate Rattle Fix Kit is the definitive repair. Stainless steel components with 12.6mm flapper arm vs stock 11.5mm - eliminates rattle permanently. Bimmerpost and ZPOST gold standard.',
        partBrand: 'Vargas Turbo Technologies (VTT)',
        partName: 'N54 Wastegate Rattle Fix Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'VTT kit requires turbo removal for installation - this is NOT a bolt-on fix. Budget $1,200-$2,000 for labor on top of kit cost. Some shops offer turbo removal + VTT install as a package.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'While turbos are out for wastegate fix, also replace turbo oil and coolant feed lines, turbo gaskets, and downpipe gaskets. Labor overlap saves $1,000+ vs. doing these separately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'A mild rattle at cold start that goes away when warm is early stage and not urgent. Constant rattle at all temperatures indicates advanced wear requiring repair soon.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-e85-convertible-top-hydraulic-2003',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2003, end: 2008 },
    title: 'Convertible Top Hydraulic Pump Motor Failure - E85 Z4',
    severity: 'moderate',
    description: 'The E85 Z4 soft top uses an electrically-driven hydraulic pump motor (BMW 54347193448) to raise and lower the convertible top. The pump motor is located behind the seats in an area prone to water intrusion, causing corrosion of the motor housing, electrical connections, and internal components. Water enters through clogged drain holes at the top (too narrow from factory) and poorly sealed rubber bungs at the bottom. The pump motor can also fail electrically from carbon dust buildup on internal brushes. When the pump fails, the top cannot be raised or lowered - a serious problem if caught in rain with top down. BMW quotes full removal of convertible top assembly to access the pump, making dealer repair extremely expensive.',
    symptoms: [
      'Convertible top motor whirs but top does not move',
      'Top moves partway then stops mid-operation',
      'No sound at all when top switch is pressed (complete pump failure)',
      'Slow or sluggish top operation (early warning sign)',
      'Hydraulic fluid leaks visible behind seats or in trunk',
      'Warning messages about convertible top on dashboard'
    ],
    solution: 'Replace hydraulic pump motor assembly (BMW 54347193448 / supersedes 54347119633). OEM Genuine BMW pump: $800-$1,200. Aftermarket alternatives available on Amazon for $150-$300 but quality varies significantly. Dealer labor is $1,500-$2,500+ as BMW procedure requires full top removal. ZRoadster.org members have documented a motor relocation to the boot/trunk area which allows much easier future access. Hydraulic fluid: use Aral Vitamol ZHM or BMW 54340394395 hydraulic oil. PREVENTION: Clean drain holes annually, ensure rubber bungs are properly seated, and check for water intrusion in pump area at every service. Some owners have had success with pump motor rebuilds from roofmotors.co.uk ($300-$500) but quality of rebuilds varies.',
    estimatedCost: { min: 500, max: 3500 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM BMW pump 54347193448 (supersedes 54347119633) is the reliable choice at $800-$1,200. Aftermarket pumps from Amazon are $150-$300 but forum reports of failures within 1-2 years.',
        partBrand: 'Genuine BMW',
        partNumber: '54347193448',
        partName: 'Convertible Top Hydraulic Pump Motor Assembly',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'ZRoadster.org has a detailed guide for relocating the pump motor to the boot/trunk for easier future access. Highly recommended during any pump replacement to save thousands on future repairs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use only BMW 54340394395 hydraulic oil or Aral Vitamol ZHM (amber color) for the convertible top system. Wrong fluid will damage seals and cylinders.',
        partBrand: 'BMW / Aral',
        partNumber: '54340394395',
        partName: 'Convertible Top Hydraulic Fluid (Vitamol ZHM)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'PREVENTION: Clean drain holes annually and inspect pump area for water intrusion at every service. Most pump failures are caused by water damage from clogged drains - 10 minutes of prevention saves $2,000+ repair.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-e89-roof-drain-clog-2009',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2009, end: 2016 },
    title: 'Retractable Hardtop Drain Clog & Water Intrusion - E89 Z4',
    severity: 'moderate',
    description: 'The E89 Z4 retractable hardtop has complex water management channels that route rainwater away from the cabin and trunk. These drain channels clog frequently with leaves, debris, and road grime, causing water to back up and leak into the trunk, damaging the hydraulic pump, wiring harness, and electronics stored in the trunk area. Water runs down the seal at the trunk lid onto the top of the rear lights, then is routed behind the light via an integrated plastic gutter - if the gaskets are not properly seated, water enters the trunk instead of draining outside. The hydraulic pump sits in a well below the trunk floor that can fill with standing water, corroding the pump housing and causing premature pump failure. Z4-forum.com has extensive documentation of this being one of the most common E89 ownership headaches.',
    symptoms: [
      'Water puddles found in trunk after rain or car wash',
      'Damp or musty smell from trunk area',
      'Corrosion visible on hydraulic pump housing',
      'Electronics malfunctions (trunk light, amp, or subwoofer failure from water damage)',
      'Retractable hardtop becomes slow or stops working (water-damaged pump motor)',
      'Water stains on trunk liner or carpet'
    ],
    solution: 'Regular maintenance is key - clear all drain channels every 6 months minimum using compressed air or flexible wire. Inspect trunk lid gaskets and rear light gaskets for proper seating - inner and outer lips must seat correctly onto bodywork. Check water level below hydraulic pump and clean any standing water. Replace deteriorated trunk lid seal (BMW 51767191678, $80-$150). Replace rear light gaskets if hardened or deformed ($30-$60 per side). Apply additional sealant around rear light mounting areas if persistent leaking. Z4-forum.com recommends checking foam pad below hydraulic pump at every oil change - if wet, pump is at risk. Hydraulic line replacement (54377311084 complete harness) if hoses are cracked from heat cycling ($600-$1,200 + labor). TopHydraulics.com offers E89 roof system repair kits and expertise.',
    estimatedCost: { min: 100, max: 1500 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Check the foam pad below the hydraulic pump in trunk at EVERY oil change. If wet, your pump is being corroded by standing water. 10-second check can prevent $2,000+ pump replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Clear ALL drain channels every 6 months with compressed air. Leaves and debris block narrow drain holes quickly, especially in fall. Z4-forum.com has detailed drain location diagrams.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Do NOT use lubrication on the retractable hardtop mechanism - BMW specifically states lubrication is not required and can attract debris that clogs drains and gums up seals.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'TopHydraulics.com specializes in E89 Z4 retractable hardtop repair - they offer complete hydraulic line kits and rebuilt pump motors. Forum-trusted supplier.',
        partBrand: 'TopHydraulics',
        partName: 'E89 Z4 Retractable Hardtop Repair Kits',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-electric-water-pump-2006',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2006, end: 2016 },
    title: 'Electric Water Pump Failure - E85 (N52) & E89 Z4',
    severity: 'high',
    description: 'BMW\'s electric water pump (Pierburg variable-flow design) used in N52-equipped E85 Z4 3.0si and all N52/N54/N20 E89 Z4 models is a major reliability concern, typically failing between 60,000-80,000 miles. Unlike mechanical water pumps that fail gradually, the electric pump fails suddenly - it simply stops pumping with no warning, causing rapid overheating that can warp the cylinder head or blow the head gasket within minutes. The plastic impeller can detach from the shaft (interference fit), causing intermittent cooling as the shaft spins but impeller slips. The pump can also fail electronically rather than mechanically. Z4-forum.com conducted a failure poll showing this as the #1 reliability issue across N52/N54 Z4 models. BMW recommends preventative replacement every 60,000 miles.',
    symptoms: [
      'Temperature gauge suddenly spikes to red zone with no warning',
      'Engine overheating warning light illuminates',
      'Sudden loss of cabin heat (heater blows cold)',
      'Coolant loss with no obvious external leak',
      'Pump making loud whirring or grinding noise (bearing failure)',
      'Intermittent overheating that comes and goes (impeller slipping on shaft)',
      'Limp mode activation due to overheating'
    ],
    solution: 'PREVENTATIVE REPLACEMENT at 60,000 miles is strongly recommended - do not wait for failure. For N52 (E85 3.0si): Pierburg 11515A05704 (full metal, includes bolts) or BMW 11517586925 ($250-$400). For N54 (E89 35i/35is): same Pierburg pump, BMW 11517632426 ($300-$450). Always replace thermostat at same time - Wahler 11537549476 ($80-$120) as it frequently fails concurrently. Replace 3 O-rings between thermostat and water pump housing, plus 2 O-rings on coolant tube to head. For M54-equipped E85 (2.5i/3.0i 2003-2005): mechanical water pump BMW 11517509985 with metal impeller ($100-$180) - much simpler and cheaper. Must replace water pump mounting bolts when reinstalling - torque-to-yield fasteners. Labor: 3-4 hours professional.',
    estimatedCost: { min: 400, max: 1200 },
    recallInfo: 'No official recall despite widespread failure pattern.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Electric water pump fails SUDDENLY with no gradual warning - engine can overheat to head-warping temperatures within minutes. Preventative replacement at 60,000 miles is non-negotiable. Z4-forum.com consensus: mandatory preventive maintenance.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Pierburg 11515A05704 water pump (OEM supplier) is the best value - full metal construction with bolts included. Available from FCP Euro with lifetime warranty for ~$300.',
        partBrand: 'Pierburg',
        partNumber: '11515A05704',
        partName: 'Electric Water Pump (N52/N54)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Always replace thermostat at same time - Wahler 11537549476. These fail together and share overlapping labor. Doing one without the other means paying for the same labor twice.',
        partBrand: 'Wahler',
        partNumber: '11537549476',
        partName: 'Electronically Controlled Thermostat',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'For M54-equipped E85 Z4 (2003-2005 2.5i/3.0i): mechanical water pump BMW 11517509985 with metal impeller is much cheaper and simpler ($100-$180). These are more reliable than the electric pumps.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'FCP Euro sells water pump + thermostat kits (11517509985KT6 for M54, various kits for N52/N54) with lifetime warranty. Best value for this repair.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-vanos-solenoid-2003',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2003, end: 2016 },
    title: 'VANOS Solenoid & System Failure - E85/E89 Z4 (All Engines)',
    severity: 'moderate',
    description: 'The VANOS (Variable Valve Timing) system on all E85 and E89 Z4 engines (M54, N52, N54, N20) suffers from solenoid failures, typically beyond 100,000 miles. The VANOS solenoids control oil flow to the variable camshaft timing adjustment units, and they fail through three primary modes: solenoid coil pack malfunction, sticking solenoid valves from oil varnish buildup, and deteriorating solenoid sealing plate rubber rings. When VANOS solenoids fail, the engine loses its ability to optimize valve timing, causing rough idle, power loss, poor fuel economy, and unusual engine noises. Z4-forum.com documents this as an extremely common issue across all E85 and E89 models. The good news: VANOS solenoids are inexpensive and relatively easy to replace - one of the simpler E85/E89 repairs.',
    symptoms: [
      'Rough or uneven idle with RPM fluctuations',
      'Noticeable loss of power during acceleration',
      'Engine misfires causing hesitation or jerking',
      'Rattling, ticking, or clicking noises from engine (especially at startup)',
      'Increased fuel consumption (10-15% higher than normal)',
      'Check engine light with VANOS-related fault codes (2A82, 2A87, 2A9A, 2A9F)'
    ],
    solution: 'Replace VANOS solenoids - inexpensive and straightforward repair. M54 (E85 2003-2005): 2 solenoids required, BMW 11361707323 ($35-$65 each). N52 (E85 2006-2008 / E89 2009-2011 28i): 2 solenoids, BMW 11367585425 ($40-$70 each). N54 (E89 35i/35is): 2 solenoids, BMW 11367585425 ($40-$70 each). N20 (E89 sDrive28i 2012-2016): 2 solenoids, BMW 11367585425 ($40-$70 each). Labor: under 1 hour for experienced mechanic, 2-3 hours DIY. Replace all solenoids at once even if only one has failed - the others are same age and will fail soon. Also replace VANOS solenoid O-rings and sealing plates during service. Clean VANOS system with Beisan Systems VANOS cleaning procedure for best results.',
    estimatedCost: { min: 100, max: 500 },
    recallInfo: 'BMW recalled 155,000+ vehicles with N52 engines for loose VANOS housing bolts (separate but related issue).',
    communityRecommendations: [
      {
        type: 'part',
        content: 'For M54 engines: BMW 11361707323 VANOS solenoid ($35-$65 each, 2 required). Pierburg and Vaico are quality aftermarket alternatives at lower cost.',
        partBrand: 'Genuine BMW / Pierburg',
        partNumber: '11361707323',
        partName: 'VANOS Solenoid (M54)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'For N52/N54/N20 engines: BMW 11367585425 VANOS solenoid ($40-$70 each, 2 required). Always replace both intake and exhaust solenoids together.',
        partBrand: 'Genuine BMW',
        partNumber: '11367585425',
        partName: 'VANOS Solenoid (N52/N54/N20)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'VANOS solenoid replacement is one of the easiest DIY repairs on Z4 - accessible from top of engine, only basic tools needed. Under 1 hour for experienced DIYer. Save $200-$400 on labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Beisan Systems (beisansystems.com) has the most detailed VANOS repair procedures online. Their cleaning procedure can extend solenoid life if done as preventive maintenance.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-e85-window-regulator-2003',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2003, end: 2008 },
    title: 'Power Window Regulator Failure - E85 Z4',
    severity: 'low',
    description: 'The E85 Z4 power window regulators are prone to premature failure, causing windows to operate unevenly, stop midway, make grinding/clicking noises, or fail to move entirely. The cable-driven regulator mechanism has thin steel cables that fray and snap, and the plastic guide rollers crack and break. This is particularly problematic on a convertible where window operation is essential for top operation - the windows must fully lower before the soft top can fold. Driver side fails more frequently due to higher usage. Z4-forum.com reports this as one of the most common E85 ownership complaints. Dealer repair quotes $700+ with labor, but repair kits are available for under $20 and full replacement regulators are $150-$250.',
    symptoms: [
      'Window moves unevenly or tilts during operation',
      'Grinding, clicking, or snapping noises when operating window',
      'Window stops midway and will not continue up or down',
      'Window drops into door panel and will not raise',
      'Convertible top gives error because window cannot fully lower',
      'Window operates very slowly compared to normal speed'
    ],
    solution: 'Option 1 (Budget): Window regulator repair kit - replacement cables and rollers for ~$18-$25 from eBay/Amazon (BWR974 for left/driver side). Requires removing door panel and threading new cables through existing regulator frame. DIY-friendly with Z4-forum.com guides. Option 2 (Recommended): Full window regulator replacement. Driver side: BMW 51337198909 ($180-$280 OEM, $80-$150 aftermarket). Passenger side: BMW 51337198910 ($180-$280 OEM, $80-$150 aftermarket). Labor: $200-$400 at independent shop, $500-$700+ at dealer. DIY: 2-3 hours with door panel removal guide from Pelican Parts. ZRoadster.org recommends full replacement over repair kit for long-term reliability.',
    estimatedCost: { min: 100, max: 700 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Driver side window regulator: BMW 51337198909 ($180-$280 OEM). Passenger: BMW 51337198910. Forum consensus: buy OEM - aftermarket regulators from unknown brands fail again quickly.',
        partBrand: 'Genuine BMW',
        partNumber: '51337198909 / 51337198910',
        partName: 'E85 Z4 Window Regulator (Left / Right)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'BWR974 repair kit ($18-$25) replaces cables and rollers without replacing entire regulator. Good budget option but Z4-forum reports mixed durability vs full replacement.',
        partBrand: 'Bross Auto Parts',
        partName: 'BWR974 Window Regulator Repair Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Pelican Parts has an excellent step-by-step E85 Z4 window regulator replacement guide with photos. Makes this a manageable DIY job in 2-3 hours.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If driver side has failed, budget for passenger side soon - they are same age and design. Replacing both at once saves on door panel removal labor.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-z4-g29-b58-water-pump-2019',
    make: 'BMW',
    model: 'Z4',
    years: { start: 2019, end: 2025 },
    title: 'B48/B58 Electric Water Pump & Thermostat Failure - G29 Z4',
    severity: 'moderate',
    description: 'The G29 Z4 sDrive30i (B48) and M40i (B58) continue BMW\'s pattern of electric water pump failures, though with improved longevity over the N52/N54 generation. The Pierburg electric water pump uses a plastic/composite impeller that is prone to cracking or deformation under prolonged thermal stress, especially in the turbocharged B48 and B58 engines that see elevated heat cycles. Internal bearings degrade over time, reducing coolant flow. The electronically-controlled thermostat is a common concurrent failure point. Failure tends to occur around 60,000-80,000 miles, with the B58 M40i being slightly more susceptible due to higher heat output. When the pump fails, overheating occurs rapidly with potential for catastrophic engine damage.',
    symptoms: [
      'High or fluctuating temperature gauge readings',
      'Engine overheating during long drives or at high speeds',
      'Engine temperature warning light illuminated',
      'Coolant loss with no visible external leak',
      'Sudden activation of engine limp mode',
      'Loud whirring noise from water pump area',
      'Erratic temperature gauge behavior (thermostat failure)'
    ],
    solution: 'Preventative replacement recommended at 60,000 miles. Always replace water pump and thermostat together - they share labor overlap and frequently fail concurrently. B48 sDrive30i: Water pump BMW 11518632586 ($300-$450), Thermostat BMW 11538685978 ($100-$150). B58 M40i: Water pump BMW 11518650986 ($350-$500), Thermostat BMW 11538685978 ($100-$150). Mishimoto offers performance water pump alternatives for B58 with improved impeller design. Replace 3 O-rings between thermostat and pump housing, plus 2 O-rings on coolant tube to head. Must replace water pump mounting bolts (torque-to-yield). Labor: 3-4 hours. FCP Euro lifetime warranty kits available. Also inspect plastic cylinder head coolant outlet adapter - known to shear off causing massive coolant leak.',
    estimatedCost: { min: 500, max: 1500 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'B58 engine generates significant heat under boost - water pump failure leads to rapid overheating within minutes. Do not continue driving if temperature warning appears. Pull over immediately and call for tow.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Mishimoto performance water pump for B58 has improved impeller design that resists heat-cycle deformation. Popular upgrade choice on Bimmerpost G29 forums.',
        partBrand: 'Mishimoto',
        partName: 'B58 Performance Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace thermostat (BMW 11538685978) at same time as water pump - they share overlapping labor and commonly fail together. Doing one without the other is false economy.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Inspect plastic cylinder head coolant outlet adapter during any cooling system work - this plastic piece shears off without warning causing massive coolant leak. Replace with aluminum aftermarket version for permanent fix.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add issues to known issues database
let addedCount = 0;
let skippedCount = 0;

bmwZ4Issues.forEach(issue => {
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

console.log(`\nDone! Added ${addedCount} BMW Z4 issues (${skippedCount} skipped).`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
