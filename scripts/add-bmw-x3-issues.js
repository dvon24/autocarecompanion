const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwX3Issues = [
  {
    id: 'bmw-x3-transfer-case-actuator-2004',
    make: 'BMW',
    model: 'X3',
    years: { start: 2004, end: 2023 },
    title: 'Transfer Case Actuator Motor Failure (xDrive AWD System)',
    severity: 'moderate',
    description: 'The transfer case actuator motor contains plastic gears that strip over time, causing the xDrive AWD system to malfunction. This is one of the most common and predictable failures specific to BMW X3/X5/X6 models with xDrive AWD. The plastic gear teeth are gradually worn down by the metal worm drive gear, typically failing between 90,000-120,000 miles. When the actuator fails, the AWD system loses functionality and multiple warning lights illuminate simultaneously. This affects ALL X3 generations (E83, F25, G01) with xDrive. BMW issued TSB dated 6/1/2020. Bimmerpost/X3Forum forums report this as inevitable on high-mileage X3s. Fortunately, DIY repair kits with replacement plastic gears cost only $100-150 and are straightforward to install, saving $1,400+ vs dealer replacement.',
    symptoms: [
      'Brake, ABS, and 4x4 DSC warning lights illuminate simultaneously',
      'Audible clicking noise from under driver\'s side when turning ignition off',
      'Transfer case fault codes',
      'Loss of AWD functionality (car stuck in 2WD)',
      'Yellow transfer case warning light',
      'Grinding or whirring noise from transfer case area'
    ],
    solution: 'Replace the actuator motor assembly or rebuild using an aftermarket repair kit. DIY repair kits cost $100-150 and include replacement plastic gears, clips, and seals - straightforward installation saves $1,200+. Complete actuator motor replacement costs $540 for the assembly if DIY, or $1,500-2,200 at dealer. If transfer case itself is damaged from prolonged actuator failure, complete transfer case replacement costs $1,400-3,300. PREVENTIVE: If buying used X3 over 80k miles, budget for this repair - it\'s "when not if" on xDrive models. Check for clicking noise when shutting off ignition.',
    estimatedCost: { min: 100, max: 3300 },
    recallInfo: 'TSB dated 6/1/2020 (NHTSA file MC-10176367-9999). No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'FCP Euro/BimmerWorld transfer case actuator repair kit for $100-150 - significantly cheaper than dealer $1,500+ motor replacement. Kit includes replacement plastic gears and seals.',
        partBrand: 'FCP Euro',
        partName: 'Transfer Case Actuator Repair Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'This is a known failure point - budget for this repair if buying used X3 over 80k miles. DIY is straightforward with basic mechanical skills and saves $1,200+ in labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Dealer will quote $1,500-2,200+ for full motor replacement when a $100 gear kit often solves the issue. Get second opinion from BMW specialist before approving dealer repair.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Listen for clicking noise from under driver side when shutting off ignition - early warning sign of failing actuator. Replace before complete failure to avoid being stranded.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'X3Forum consensus: Transfer case actuator failure is inevitable on xDrive X3s by 100k-120k miles. Not a question of if, but when. Plan accordingly.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3-n20-timing-chain-2012',
    make: 'BMW',
    model: 'X3',
    years: { start: 2012, end: 2015 },
    title: 'N20 Timing Chain & Guide Failure (Catastrophic) - F25 xDrive28i',
    severity: 'high',
    description: 'The N20 2.0-liter turbo engine in F25 X3 xDrive28i (2012-early 2015) has a CRITICAL design defect in plastic timing chain guides identical to 3 Series/5 Series N20 issue. The guides crack, degrade, and break apart from material defects, causing timing chain to skip or break, resulting in catastrophic piston-to-valve collision and complete engine destruction requiring $15,000-$22,000 replacement. BMW issued multiple TSBs and a class action lawsuit was settled in 2021 over this widespread defect - eligible owners can receive up to $7,500 reimbursement for engine replacement or $3,000 for timing chain module repair. Early symptoms include rattling on cold start (like marbles) and high-pitched whining between 1,500-2,500 RPM. BMW redesigned guides in January 2015. This is BMW\'s WORST reliability disaster of 2010s. Failure rate estimated at 15-20% of all 2012-2014 N20 engines.',
    symptoms: [
      'Rattling or ticking noise from engine (especially cold start)',
      'High-pitched whining or whirring between 1,500-2,500 RPM',
      'Check engine light with camshaft position codes (P0016, P0017)',
      'Engine misfires or rough idling',
      'Loss of power during acceleration',
      'Engine failure/no start (if chain fails completely)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: If you own 2012-2014 F25 X3 xDrive28i with N20, replace timing chain guides IMMEDIATELY at 60,000-80,000 miles ($2,000-$4,000) BEFORE failure. If rattling has started: STOP DRIVING and tow to shop - chain can break at any moment. If engine has failed: Complete engine replacement required ($15,000-$22,000). Check VIN eligibility for class action settlement reimbursement (up to $7,500 for engine replacement, $3,000 for timing chain). CRITICAL: Avoid 2012-2014 X3 28i when buying used - opt for 2015+ with updated guides or 2011-2017 X3 35i with N55 engine (no timing chain issues).',
    estimatedCost: { min: 2000, max: 22000 },
    recallInfo: 'TSB SI B11 03 17 (N20/N26 timing chain diagnosis/repair). Class action lawsuit settled in 2021 - check VIN eligibility for reimbursement. Extended warranty coverage available for some VINs.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'AVOID 2012-2014 X3 xDrive28i models - the N20 timing chain issue is severe and catastrophic. 2015+ models have redesigned guides. Buy 35i with N55 instead if you want F25 X3.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you own affected model, replace timing chain preventatively at 60-80k miles before failure occurs. $2k-4k preventive beats $15k-22k engine replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Only use updated BMW timing chain parts with revised guide design post-2015. Aftermarket timing chains not recommended for N20 - use OEM BMW only.',
        partBrand: 'BMW',
        partName: 'OEM Timing Chain Kit (Updated Design)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you hear ANY rattling from engine, DO NOT DRIVE. Tow to shop immediately. Continuing to drive destroys engine within days ($15k-22k repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check class action settlement eligibility at BMW dealer - some owners eligible for up to $7,500 reimbursement for engine replacement. Worth verifying VIN.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3-water-pump-2007',
    make: 'BMW',
    model: 'X3',
    years: { start: 2007, end: 2017 },
    title: 'Electric Water Pump Failure (N52, N20 Engines)',
    severity: 'moderate',
    description: 'BMW X3 with N52 (E83 2007-2010) and N20 (F25 2012-2017) engines use electric water pumps made of plastic that commonly fail around 80,000 miles. The impellers, bearings, and plastic housing crack and wear, leading to coolant leaks and sudden engine overheating. Unlike mechanical belt-driven pumps, electric pumps fail SUDDENLY without warning - coolant circulation stops and engine overheats in minutes. Failure can cause severe engine damage (warped heads, blown head gaskets $3,000-$6,000) if overheating occurs. BMW has NO recall despite near-universal failure by 100k miles. CRITICAL SAFETY NOTE: 2013-2017 X3 sDrive28i/xDrive28i have recall for water pump electrical connector fire risk - improperly sealed connector may short circuit and cause fire. Dealers install protective shield free of charge.',
    symptoms: [
      'Engine overheating rapidly (even at idle)',
      'Coolant leaking near front of engine',
      'Steam from radiator/engine bay',
      'Engine temperature drops when accelerating (pump volume failure)',
      'No pressure felt when squeezing upper radiator hose with engine running',
      'Fault code for coolant pump volume',
      'Low coolant warning light'
    ],
    solution: 'Replace electric water pump at first sign of failure ($800 parts + labor). Consider preventative replacement at 70-80k miles to avoid being stranded ($400 parts, DIY-able). CRITICAL: If you own 2013-2017 X3 28i, verify recall repair (protective shield installation) has been completed to prevent fire risk - check with BMW dealer using VIN. If engine overheats, PULL OVER IMMEDIATELY and shut off - driving with overheating warps cylinder heads ($4,000+ repair). Call tow truck.',
    estimatedCost: { min: 400, max: 800 },
    recallInfo: 'Recall for 2013-2017 X3 sDrive28i/xDrive28i: Improperly sealed electrical connector may short circuit and cause fire. Dealers install protective shield free of charge. Verify recall completion with VIN check.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Replace water pump proactively at 70-80k miles - failure causes sudden overheating and potential engine damage. Preventive $800 beats $4,000 head gasket repair.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW replacement pumps or quality German aftermarket (Geba, Hepu, Rein). Cheap Chinese pumps fail quickly - waste of money.',
        partBrand: 'Hepu',
        partName: 'Electric Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If 2013-2017 X3 28i, verify recall repair completed to prevent FIRE RISK. Check with BMW dealer - free protective shield installation. Don\'t skip this.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If engine overheats, PULL OVER IMMEDIATELY and shut off. Driving even 2-3 miles with overheating warps cylinder heads ($4,000 repair). Call tow truck - it\'s cheaper than new engine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace thermostat when doing water pump - it\'s right there and labor is 80% done. Saves $200-300 in future labor if thermostat fails separately.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3-valve-cover-gasket-2004',
    make: 'BMW',
    model: 'X3',
    years: { start: 2004, end: 2017 },
    title: 'Valve Cover Gasket Oil Leaks (M54, N52 Engines)',
    severity: 'low',
    description: 'The valve cover gasket on M54 (E83 2004-2006) and N52 (E83 2007-2010, F25 2011-2017) engines uses molded rubber gaskets that harden and leak over time, typically by 60-100k miles. Oil leaks from the front and sides of the valve cover or at the curve of the cylinder head, dripping onto exhaust manifold causing burning oil smell and smoke. On M54 engines, oil can leak into spark plug holes, contaminating ignition coil boots and causing misfires. While not immediately catastrophic, leaks worsen over time and low oil can damage engine. This is routine maintenance on high-mileage BMWs. Dealerships charge $700-1,000 for what is a 2-hour DIY repair costing $80-150 in parts. Bimmerfest/X3Forum have detailed DIY guides with photos.',
    symptoms: [
      'Oil visible on valve cover edges',
      'Burning oil smell from engine bay',
      'Oil dripping onto exhaust manifold (smoke)',
      'Engine misfires (if oil contaminates spark plugs/coils on M54)',
      'Low oil level',
      'Oil residue on engine bay components'
    ],
    solution: 'Replace valve cover gasket and VANOS solenoid o-rings ($300-500 independent shop, $700-1,000 dealer, $80-150 DIY parts). On M54 engines, also replace ignition coil boots if contaminated by oil ($50 additional). Use OEM BMW gasket or Victor Reinz brand - aftermarket quality matters for long-term seal. Relatively straightforward DIY repair - saves $200-400 in labor. YouTube and Bimmerfest have detailed model-specific guides. Monitor oil level weekly and top off as needed (1 quart low is OK, 2+ quarts low risks engine damage).',
    estimatedCost: { min: 80, max: 1000 },
    recallInfo: 'No recall. Routine maintenance/wear item on all BMWs.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Common maintenance item on high-mileage X3s (60k-100k miles). DIY-friendly if mechanically inclined - saves $200-400 in labor. Bimmerfest has step-by-step photo guides.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW gasket or Victor Reinz - aftermarket quality matters for long-term seal. Cheap eBay gaskets leak within 20k miles.',
        partBrand: 'Victor Reinz',
        partName: 'Valve Cover Gasket Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Dealerships charge $500-800+ labor for 2-hour job. Independent BMW specialists charge half that. DIY costs $80-150 parts only.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When replacing valve cover gasket, also replace VANOS solenoid o-rings and eccentric shaft sensor seal (N52) - labor is 90% done. Prevents future oil leaks.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'On M54 engines, check ignition coil boots for oil contamination. Oil in spark plug wells causes misfires. Replace boots if oil-soaked ($50).',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3-vanos-solenoid-2007',
    make: 'BMW',
    model: 'X3',
    years: { start: 2007, end: 2017 },
    title: 'VANOS Solenoid Failure (N52, N55 Engines)',
    severity: 'moderate',
    description: 'The Variable Valve Timing (VANOS) system solenoids become clogged with dirty oil and debris, typically around 50,000-70,000 miles on N52 (E83 2007-2010, F25 2011-2017) and N55 (F25 2011-2017 X3 35i) engines. The solenoids control camshaft timing for optimal performance. Failure causes rough idle, loss of power, and check engine lights with codes 2A82, 2A87 (these codes guarantee solenoid failure). Regular oil changes with proper viscosity (BMW LL-01 spec) are critical to prevent failure - cheap oil or extended 10k+ mile intervals accelerate VANOS clogging. F25 X3 with N52/N55 engines have additional TSB for VANOS gear assembly bolts that may loosen or break, requiring complete replacement. Bimmerpost recommends preventive VANOS solenoid replacement every 50k miles - much cheaper than waiting for failure.',
    symptoms: [
      'Rough idle or engine misfires (especially at low RPM)',
      'Sluggish acceleration and loss of power',
      'Check engine light with codes 2A82, 2A87 (guarantee solenoid failure)',
      'Limp mode activation',
      'Engine hesitation on startup',
      'Poor fuel economy'
    ],
    solution: 'Replace VANOS solenoids and seals ($250-400 European shops, $729-882 US average). Use high-quality oil (5W-30 or 0W-40 BMW LL-01 spec) and change every 5,000-7,000 miles to prevent future failures - cheap oil or extended intervals kill VANOS solenoids. Some cases may require complete VANOS unit rebuild ($1,500-2,500). PREVENTIVE: Replace VANOS solenoids and seals every 50k miles as maintenance - much cheaper than waiting for failure. On F25 X3 with N52/N55, check TSB SI B12 14 10 for VANOS gear assembly bolt issue.',
    estimatedCost: { min: 250, max: 2500 },
    recallInfo: 'TSB SI B12 14 10: F25 X3 with N52/N55 engines - VANOS gear assembly bolts may loosen or break (requires replacement).',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Replace VANOS solenoids and seals every 50k miles preventatively. Much cheaper than waiting for failure. Codes 2A82/2A87 guarantee solenoid failure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'OEM BMW solenoids or Beisan Systems VANOS repair kits highly recommended on forums. Quality matters - cheap solenoids fail quickly.',
        partBrand: 'Beisan Systems',
        partName: 'VANOS Repair Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Cheap oil or extended oil change intervals (10k+ miles) accelerate VANOS failure. Stick to 5-7k mile intervals with BMW LL-01 spec oil only.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use 5W-30 or 0W-40 BMW LL-01 approved oil ONLY. Mobil 1 0W-40 European Car Formula or Liqui Moly 5W-30 recommended on Bimmerpost.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'F25 X3 owners: Check TSB SI B12 14 10 for VANOS gear bolt issue if you have N52/N55. Bolts can loosen or break - requires VANOS replacement.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3-coolant-expansion-tank-2004',
    make: 'BMW',
    model: 'X3',
    years: { start: 2004, end: 2023 },
    title: 'Coolant Expansion Tank Cracking',
    severity: 'low',
    description: 'The plastic coolant expansion tank becomes brittle with age and heat cycles, developing hairline cracks that leak coolant. This is one of the most common coolant system failures on ALL BMWs across all models and generations. Leaks cause low coolant levels and potential overheating if not addressed promptly. The plastic degrades from constant heating/cooling cycles and pressure changes, typically failing by 80,000-100,000 miles or 5-7 years of age. This is routine preventive maintenance on high-mileage BMWs. Very easy DIY repair taking only 30 minutes with basic tools - simply drain coolant, remove old tank, install new tank, refill coolant. Dealerships charge $400-580 for what is a $50-100 DIY repair. X3Forum/Bimmerfest recommend replacing preventively every 5-7 years or 80-100k miles.',
    symptoms: [
      'Coolant puddles under vehicle (pink/green fluid)',
      'Low coolant warning light',
      'Visible cracks in expansion tank (hairline cracks)',
      'Coolant smell from engine bay',
      'Overheating if coolant severely low',
      'Hissing sound when opening coolant cap (loss of pressure)'
    ],
    solution: 'Replace expansion tank and coolant ($50-100 DIY parts, $200-400 independent shop, $400-580 dealer). Very simple DIY repair taking 30 minutes - drain coolant, unbolt old tank, install new tank, refill with BMW-spec coolant (blue or pink/orange premix). Use Behr or OEM BMW expansion tank - Dorman aftermarket tanks may fail prematurely. YouTube and Pelicanparts have detailed DIY guides. PREVENTIVE: Replace every 5-7 years or 80-100k miles before cracks develop. Check tank regularly for hairline cracks. Don\'t ignore coolant leaks - can lead to catastrophic overheating and head gasket failure.',
    estimatedCost: { min: 50, max: 580 },
    recallInfo: 'No recall. Routine maintenance item on all BMWs.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Very easy DIY - takes 30 minutes and saves $300+ in labor. Replace every 80k miles preventatively before cracks develop. Pelicanparts has step-by-step photo guide.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Behr or OEM BMW expansion tank recommended. Dorman aftermarket tanks may fail prematurely - stick with German brands.',
        partBrand: 'Behr',
        partName: 'Coolant Expansion Tank',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore coolant leaks - can lead to catastrophic overheating and head gasket failure ($3,000-6,000 repair). $50 tank replacement beats $5,000 engine repair.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use BMW-approved premix coolant (blue or pink/orange). Pentosin or Zerex G48 BMW formula saves time vs. mixing coolant yourself.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check expansion tank for hairline cracks during oil changes. Plastic becomes brittle with age - replace before catastrophic failure on highway.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3-oil-filter-housing-gasket-2007',
    make: 'BMW',
    model: 'X3',
    years: { start: 2007, end: 2017 },
    title: 'Oil Filter Housing Gasket Leak (N52, N20 Engines)',
    severity: 'low',
    description: 'The oil filter housing on N52 (E83 2007-2010, F25 2011-2017) and N20 (F25 2012-2017) engines uses rubber profile gaskets that harden and leak over time from heat cycling. Oil leaks from the housing located at the front of the engine, dripping onto belts and potentially causing accessory damage if ignored. Common maintenance issue on higher-mileage BMWs around 80,000-100,000 miles. While not immediately catastrophic, oil dripping on serpentine belt can cause belt slippage or damage alternator. Moderate DIY difficulty - requires draining some coolant and oil, removing housing, replacing gaskets. Pelicanparts has detailed DIY guide. Dealerships charge $500-800 for what is a $40-80 DIY repair using gasket kit.',
    symptoms: [
      'Oil leak at front of engine',
      'Oil visible around oil filter housing',
      'Low oil level (slow leak)',
      'Burning oil smell from engine bay',
      'Oil dripping onto serpentine belt',
      'Oil residue on engine bay components'
    ],
    solution: 'Replace oil filter housing gasket and oil cooler gasket ($40-80 DIY repair kit, $300-500 independent shop, $500-800 dealer). Requires draining some coolant and oil, removing housing, replacing gaskets, reassembling. Moderate DIY difficulty - Pelicanparts and YouTube have detailed model-specific guides. Use Victor Reinz or OEM BMW gasket kit for long-lasting seal - cheap gaskets leak within 20k miles. Address leak early before oil damages serpentine belt or alternator.',
    estimatedCost: { min: 40, max: 800 },
    recallInfo: 'No recall. Routine maintenance item.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Common leak on N52/N20 engines around 80k-100k miles. DIY-able if mechanically inclined - repair kits are cheap ($40-80). Pelicanparts has step-by-step guide.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Victor Reinz or OEM BMW gasket kit for long-lasting seal. Cheap eBay gaskets leak within 20k miles - not worth the headache.',
        partBrand: 'Victor Reinz',
        partName: 'Oil Filter Housing Gasket Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Oil dripping on serpentine belt causes belt slippage and can damage alternator ($800+ replacement). Fix leak early to prevent secondary damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When replacing housing gasket, also replace oil cooler gasket (included in kit). Both seal surfaces harden together - prevents comeback leak.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use fresh BMW-spec coolant when refilling after repair. Don\'t reuse old coolant - it\'s degraded and won\'t protect engine.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3-wastegate-rattle-2011',
    make: 'BMW',
    model: 'X3',
    years: { start: 2011, end: 2023 },
    title: 'Turbocharger Wastegate Rattle (N55, N20, B58 Engines)',
    severity: 'moderate',
    description: 'Wastegate mechanism on turbocharged X3 models develops excessive play due to worn bushings, loose actuator arms, and degraded pivot points. Causes metallic rattling noise from turbo area, especially during cold starts - sounds like marbles in tin can. Can progress to boost control issues and complete turbo failure if ignored. This affects F25 X3 35i with N55 (2011-2017), F25 X3 28i with N20 (2012-2017), and G01 X3 M40i with B58 (2018-2023). Early N55 engines most affected. Rattle may be harmless initially (annoying but no performance loss), but monitor for check engine light with wastegate code 30FF or loss of boost pressure. If boost control degrades, can lead to turbo overheating and complete failure ($2,000-$4,000 per turbo). VTT (Vargas Turbo Technologies) wastegate repair kits with upgraded stainless steel bushings popular on X3Forum.',
    symptoms: [
      'Metallic rattling from turbo area (especially cold start)',
      'Wastegate rattle sounds like marbles in tin can',
      'Check engine light with wastegate code 30FF',
      'Boost control issues (underboost or overboost)',
      'Loss of turbo boost pressure',
      'Reduced power under acceleration'
    ],
    solution: 'Replace wastegate actuator ($400-800) or use aftermarket wastegate repair kit with upgraded stainless steel bushings ($150-300). Some cases require complete turbocharger replacement ($2,000-$4,000). VTT (Vargas Turbo Technologies) repair kits popular on forums - upgraded materials prevent future rattle. MONITORING: Early wastegate rattle may be harmless (annoying but no performance loss). If car boosts normally and no underboost codes, can monitor rattle without urgent repair. However, if check engine light appears with code 30FF or boost pressure drops, repair immediately to prevent turbo damage.',
    estimatedCost: { min: 150, max: 4000 },
    recallInfo: 'No recall. Common issue on turbocharged BMWs.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Early N55 engines most affected by wastegate rattle. Rattle may be harmless initially - if car boosts normally and no codes, can monitor without urgent repair.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'VTT (Vargas Turbo Technologies) wastegate repair kits popular on X3Forum - upgraded stainless steel materials prevent future rattle. $150-300 vs. $2k-4k turbo replacement.',
        partBrand: 'VTT',
        partName: 'Wastegate Repair Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Wastegate rattle can lead to complete turbo failure if boost control degrades. Don\'t ignore check engine light with code 30FF - repair immediately to prevent $4k turbo replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If wastegate rattle is present but car boosts normally, not urgent. However, monitor closely - if boost pressure drops or codes appear, repair ASAP.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Wastegate rattle worse on cold starts. Let car warm up before hard acceleration - helps extend wastegate life and reduces rattle noise.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmwX3Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmwX3Issues.length} BMW X3 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmwX3Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
