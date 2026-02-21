const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwM5Issues = [
  {
    id: 'bmw-m5-s85-rod-bearing-2006',
    make: 'BMW',
    model: 'M5',
    years: { start: 2006, end: 2010 },
    title: 'S85 V10 Rod Bearing Premature Failure (CATASTROPHIC) - E60 M5',
    severity: 'high',
    description: 'The S85 5.0L V10 engine has a catastrophic design flaw with rod bearings wearing prematurely, often before 70,000 miles - this is THE most serious E60 M5 reliability concern. BMW engineered the S85 with ultra-tight bearing clearances of 0.001 inches (industry standard is 0.0025 inches), combined with thin bearings and narrow forged steel connecting rods. At high RPM, oil struggles to maintain lubricating cushion in this narrow gap, leading to accelerated wear and catastrophic engine failure (seized engine or hole in engine block requiring $15,000-$32,000 engine replacement). Preventative rod bearing replacement before 70,000 miles is MANDATORY for E60 M5 ownership. M5Board/M5Post forums universally recommend this as non-negotiable preventive maintenance. BMW never officially acknowledged this defect, though settled a class action lawsuit.',
    symptoms: [
      'Ticking or knocking noise from engine, especially when cold',
      'Metal shavings or metallic debris in engine oil during oil changes',
      'Low oil pressure warning light',
      'Increased engine vibration and noise under load',
      'Catastrophic engine failure (seized engine or hole in block)'
    ],
    solution: 'MANDATORY PREVENTATIVE: Replace rod bearings before 70,000 miles ($6,500-$8,600). Upgrade to BE Bearings, ACL Race, or VAC Motorsports high-performance bearings with increased clearances (0.0025" or greater) - DO NOT use OEM BMW bearings which have same design flaw. Perform regular oil analysis every 5,000 miles to detect early bearing wear. Use only BMW-approved 10W-60 synthetic oil with frequent oil changes (5,000-7,500 mile intervals). NEVER redline engine before reaching full operating temperature. Replace high-pressure VANOS line at same time as rod bearings (labor overlap saves $2,000-$3,000). If catastrophic failure occurs: Complete engine replacement required ($15,000-$32,000).',
    estimatedCost: { min: 6500, max: 32000 },
    recallInfo: 'No official recall. BMW settled class action lawsuit but never acknowledged defect.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is considered MANDATORY preventative maintenance - do not skip rod bearing inspection/replacement when purchasing used E60 M5. Budget for this immediately. M5Board consensus: non-negotiable.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace high-pressure VANOS line at same time as rod bearings - labor overlap saves $2,000-$3,000. Don\'t make two separate trips for same labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use BE Bearings or ACL Race bearings - avoid OEM BMW bearings which have same design flaw. Upgrade to 0.0025" clearance minimum for proper oil film.',
        partBrand: 'BE Bearings',
        partName: 'S85 Performance Rod Bearings',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Find a shop experienced with S85 engines - inexperienced techs will quote $15k+. Specialist shops typically charge $6,500-$8,600. Check M5Board for recommended shops.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Perform oil analysis every 5,000 miles to monitor bearing wear. Blackstone Labs popular on M5Post - $30 per analysis can save $30,000 engine.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m5-s85-throttle-actuator-2006',
    make: 'BMW',
    model: 'M5',
    years: { start: 2006, end: 2010 },
    title: 'S85 V10 Throttle Body Actuator Failure - E60 M5',
    severity: 'moderate',
    description: 'The S85 V10 uses individual electronic throttle actuators for each cylinder bank to control throttle response. These actuators have critical design flaw in internal plastic gears that causes premature wear and electronic overload. The gears wear dramatically in low-throttle area (just off idle, cruising position), eventually causing complete failure. When one or both actuators fail, engine immediately enters limp mode with severely reduced power output - car is barely driveable. Both actuators often need replacement within similar timeframes (if one fails, the other typically fails within 6-12 months). M5Board reports this as extremely common issue on high-mileage E60 M5s.',
    symptoms: [
      'Engine suddenly enters limp mode with drastically reduced power',
      'DSC (Dynamic Stability Control) warning light illuminated',
      'EML (Engine Management Light) illuminated',
      'Car starts fine when cold but enters limp mode after warming up',
      'Fault codes 2B15 (throttle bank 1) or 2B16 (throttle bank 2)'
    ],
    solution: 'Replace failed throttle actuator(s) with OEM units ($1,400-$1,700 each) or upgrade to Evolve Automotive uprated throttle actuators ($1,500-$1,800 each) for improved durability and increased lifespan - these have upgraded internal components that prevent repeat failure. ECU Testing and Euro Power Motorsports offer actuator rebuilds ($500-$800 per actuator) as cost-effective alternatives. M5Post consensus: when one actuator fails, replace both at same time to save labor costs since second will fail within 6-12 months. Labor: 3 hours professional / 4+ hours DIY.',
    estimatedCost: { min: 1500, max: 3500 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'When one actuator fails, the other typically fails within 6-12 months. Replace both at same time to save labor costs - $300 labor vs. $600 labor for two separate repairs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Evolve Automotive uprated throttle actuators are the only permanent fix - upgraded internal components prevent repeat failure. OEM replacements will fail again. M5Board gold standard.',
        partBrand: 'Evolve Automotive',
        partName: 'Uprated Throttle Actuator',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'ECU Testing rebuilds are half the cost of OEM and include upgraded gears. Popular option on M5Board - many successful rebuilds reported.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Keep spare actuator in garage if you own E60 M5 - this failure can happen suddenly and leave you stranded. Being prepared saves tow truck costs.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m5-s85-vanos-pump-2006',
    make: 'BMW',
    model: 'M5',
    years: { start: 2006, end: 2010 },
    title: 'VANOS High-Pressure Pump & Line Failure (CATASTROPHIC) - E60 M5',
    severity: 'high',
    description: 'The S85 engine uses high-pressure VANOS (Variable Valve Timing) pump to supply necessary hydraulic pressure. The high-pressure VANOS lines were improperly routed without adequate bends to attach to VANOS pump, causing premature line failure and oil leaks. When VANOS line fails and leaks, it can starve VANOS pump of pressure, causing pump failure and sending metal debris throughout engine. This can escalate to CATASTROPHIC engine damage requiring complete engine replacement ($32,000). BMW settled class action lawsuit regarding VANOS failures and agreed to cover repairs for owners who reported issues before settlement cutoff date. M5Board warns: DO NOT ignore VANOS line leaks - this can destroy entire engine within weeks.',
    symptoms: [
      'Rough idling and unstable idle speed',
      'Reduced power output and poor acceleration',
      'Poor fuel economy',
      'Rattling or grinding noise from engine bay at startup',
      'Oil leaks visible near front of engine (VANOS area)',
      'Check engine light with VANOS-related fault codes'
    ],
    solution: 'Replace high-pressure VANOS line with updated design that includes proper bend radius ($3,000 parts + labor). Replace VANOS high-pressure pump if showing signs of wear or contamination. DrVanos offers fully rebuilt S85 VANOS pumps ($1,800 + $400 core deposit) - M5Post gold standard for rebuilds. This repair is BEST performed simultaneously with rod bearing replacement to save on overlapping labor costs ($2,000-$4,000 savings). WARNING: DO NOT ignore VANOS line leaks - metal debris from failed pump circulates through entire lubrication system and can destroy engine. If catastrophic failure: engine replacement required ($32,000).',
    estimatedCost: { min: 3000, max: 32000 },
    recallInfo: 'BMW settled class action lawsuit regarding VANOS failures - check eligibility for coverage if reported before cutoff date.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'DO NOT ignore VANOS line leaks - this can destroy your entire engine within weeks. Metal debris from failed pump circulates through entire lubrication system. $3k repair vs. $32k engine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Always replace VANOS line during rod bearing service - labor overlap makes this essentially free ($200 parts vs. $3,000 separate service). Don\'t make two trips.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'DrVanos rebuilt pumps are the gold standard - OEM pumps have same design flaw and will fail again. M5Post universally recommends DrVanos rebuilds.',
        partBrand: 'DrVanos',
        partName: 'S85 VANOS Oil Pump (Rebuilt)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check for VANOS line leaks during every oil change - early detection prevents catastrophic pump failure and engine damage.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m5-smg-pump-2006',
    make: 'BMW',
    model: 'M5',
    years: { start: 2006, end: 2010 },
    title: 'SMG III Hydraulic Pump Failure - E60 M5',
    severity: 'high',
    description: 'The Sequential Manual Gearbox (SMG) III transmission uses hydraulic pump to actuate gear shifts and clutch engagement. The pump motor accumulates carbon dust buildup over time, which is most common failure mode. When SMG pump fails, it cannot build hydraulic pressure, making car completely undriveable - stuck in gear with no ability to shift. The SMG pump runs continuously during driving. Aged-out defective accumulators can lose nitrogen pressure, compounding the problem. Dealerships will immediately quote full pump replacement ($6,200-$7,700) but M5Board reports that carbon buildup can often be cleaned via rebuild for fraction of cost ($300 pump rebuild + labor = $1,500-$2,500 total). Many shops misdiagnose pump failure when accumulator is actual problem ($500 vs. $5,000).',
    symptoms: [
      'SMG transmission fault warning message',
      'Pump motor cannot be heard when ignition turned on (should hear whirring)',
      'Difficulty engaging gears or inability to shift',
      'Clutch engagement issues or slipping',
      'Gear selection becomes erratic or non-functional',
      'Vehicle stuck in gear and cannot be driven'
    ],
    solution: 'DIAGNOSIS FIRST: Insist on proper diagnosis before pump replacement - accumulator failure has similar symptoms and costs $500 vs. $5,000. If pump confirmed failed: Try rebuild first - carbon buildup can often be cleaned for fraction of replacement cost. SMG Society and specialty shops offer pump rebuilds ($300 pump + labor + fluids = $1,500-$2,500). If rebuild unsuccessful: Replace SMG pump with OEM or remanufactured unit ($5,000-$7,700 dealership, $5,000-$6,500 independent specialist). Replace hydraulic accumulator at same time if vehicle has 60,000+ miles ($300-$500 additional). Flush and replace SMG hydraulic fluid and manual transmission fluid during pump replacement.',
    estimatedCost: { min: 1500, max: 7700 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Don\'t replace your SMG pump without trying rebuild first - carbon buildup can often be cleaned for fraction of replacement cost. M5Board: many successful rebuilds.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Many shops will quote pump replacement immediately. Insist on diagnosis first - accumulator failure has similar symptoms and costs $500 vs. $5,000 pump.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'SMG Society members recommend specialty rebuilders - dealership will only offer full pump replacement at $7,700. Check M5Board for recommended rebuild shops.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace accumulator preventively at 60k-80k miles ($500) to avoid misdiagnosis and unnecessary pump replacement ($5,000). Cheap insurance.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m5-s63-turbo-2012',
    make: 'BMW',
    model: 'M5',
    years: { start: 2012, end: 2016 },
    title: 'S63 V8 Twin-Turbocharger Failure - F10 M5',
    severity: 'high',
    description: 'The S63 4.4L twin-turbo V8\'s turbochargers are susceptible to premature failure from oil starvation, excessive heat exposure, or inadequate maintenance. S63 shares architecture with problematic N63 engine but with higher performance demands and boost pressure. Turbocharger failures result from degraded oil quality (BMW 10k mile oil change interval KILLS turbos), heat-related stress on oil and coolant lines, or bearing wear. When turbos fail, engine loses significant power and can cause catalytic converter damage from oil burning. BMW issued TSB for excessive heat exposure to turbocharger coolant and oil lines (heat insulators provided). M5Post consensus: oil changes every 10,000 miles (BMW recommendation) WILL kill your turbos - 5,000-7,500 miles maximum with quality synthetic oil.',
    symptoms: [
      'Sudden loss of power and boost pressure',
      'Blue or gray exhaust smoke (oil burning from failed turbo seals)',
      'Whining, whistling, or grinding noises from turbocharger area',
      'Excessive oil consumption (turbo seals leaking)',
      'Check engine light with turbo underboost or overboost codes',
      'Metal shavings in oil from turbo bearing failure'
    ],
    solution: 'Replace failed turbocharger(s) with updated OEM units ($4,000-$6,000 per turbo, $8,000-$12,000 for both). Install BMW TSB heat insulators to protect turbo coolant and oil lines from excessive heat exposure ($200 preventive vs. $8,000+ turbo replacement). Use ONLY high-quality synthetic oil and maintain strict oil change intervals (5,000-7,500 miles MAX - NOT BMW\'s 10k recommendation). Avoid aggressive driving when engine cold - allow full warm-up before boost. For high-mileage vehicles (80,000+ miles), consider preventative turbo replacement or inspection. M5Post: when one turbo fails, seriously consider replacing both - labor overlap saves $2,000-$3,000 and other will likely fail soon.',
    estimatedCost: { min: 4000, max: 12000 },
    recallInfo: 'BMW Service Bulletin addressing excessive heat exposure to turbocharger coolant and oil lines (heat insulators provided).',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Oil changes every 10,000 miles (BMW recommendation) WILL kill your turbos. M5Post consensus is 5,000-7,500 miles maximum with quality synthetic oil. Don\'t follow BMW interval.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Install BMW\'s TSB heat shields even if not experiencing issues - preventative measure costs $200 vs. $8,000+ turbo replacement. Easy insurance.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When one turbo fails, seriously consider replacing both - labor overlap saves $2,000-$3,000 and the other will likely fail soon. M5Board consensus.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Allow full engine warm-up before hard driving - cold turbos + boost = premature bearing wear. 5-10 minutes warmup minimum before WOT.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m5-dct-clutch-2012',
    make: 'BMW',
    model: 'M5',
    years: { start: 2012, end: 2016 },
    title: 'DCT Dual-Clutch Transmission Wear & Judder - F10 M5',
    severity: 'moderate',
    description: 'The 7-speed DCT (Dual-Clutch Transmission) in F10 M5 is prone to premature clutch wear, especially in vehicles driven aggressively or used for track days. Many owners report jerkiness, hesitation, and rough shifting under various conditions. Dual-clutch system wears from repeated hard launches and aggressive driving. Some vehicles had entire transmissions replaced under warranty to resolve chronic judder and shifting issues. Transmission fluid degrades quickly, showing metallic contamination by 60,000 miles. BMW says "lifetime" DCT fluid but M5Board warns this causes premature clutch failure - change fluid every 30,000 miles or face $2,500+ clutch replacement. DCT judder and jerkiness can often be resolved with fluid change and software update before jumping to clutch replacement.',
    symptoms: [
      'Jerky or hesitant shifting, especially at low speeds',
      'Transmission judder or shuddering during acceleration',
      'Rough engagement when starting from a stop',
      'Difficulty engaging gears smoothly',
      'Clutch slipping under hard acceleration',
      'Transmission warning messages or limp mode'
    ],
    solution: 'PREVENTIVE: Replace DCT transmission fluid and filter every 30,000-50,000 miles (BMW says "lifetime" but this causes premature failure). Use ONLY BMW DCTF-1 specification fluid ($189-$253 service, DIY: $100-$150). For judder/jerkiness: try fluid change and software update FIRST before clutch replacement - many issues resolved this way. For severe clutch wear: replace dual-clutch assembly with OEM ($2,394-$2,567 typical, $3,000-$4,000 dealership) or upgraded performance clutch kit. Consider NRC TitanTec or CNS Racing upgraded DCT clutch packs for improved durability if used for performance driving/track. Complete DCT transmission replacement: $8,000-$12,000.',
    estimatedCost: { min: 189, max: 12000 },
    recallInfo: 'No official TSB specific to M5. Multiple DCT software updates released.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'BMW "lifetime" DCT fluid is a myth - change fluid every 30,000 miles or face $2,500+ clutch replacement. Metallic contamination visible by 60k miles. M5Board consensus.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DCT judder and jerkiness can often be resolved with fluid change and software update before jumping to clutch replacement. Try this first - saves $2,000.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Upgrade to performance clutch pack if you track your M5 - OEM clutches are "poorly engineered" according to M5Post forum consensus. NRC TitanTec recommended.',
        partBrand: 'NRC',
        partName: 'TitanTec DCT Clutch Pack',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use ONLY BMW DCTF-1 specification fluid for DCT service. Generic DCT fluid will damage transmission - don\'t cheap out on $50 in fluid.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m5-valve-stem-seals-2012',
    make: 'BMW',
    model: 'M5',
    years: { start: 2012, end: 2023 },
    title: 'S63/S63TU Valve Stem Seal Failure & Oil Consumption',
    severity: 'moderate',
    description: 'The S63 and S63TU engines (F10 M5 2012-2016, F90 M5 2018-2023) share valve stem seal issues with N63 engine platform. Worn valve stem seals allow engine oil to leak into combustion chamber, causing excessive oil consumption (1 quart per 1,000-2,000 miles) and blue smoke from exhaust. This issue becomes more prevalent in higher-mileage engines (60,000+ miles). Failed seals contribute to carbon buildup on intake valves, fouled spark plugs, and potential catalytic converter damage from oil burning ($3,000-$5,000 additional). S63TU improved oiling system but still experiences this issue. BMW issued TSB for N63/S63 engines addressing valve stem seal replacement procedure and updated parts. M5Board: catch this early before catalytic converter damage.',
    symptoms: [
      'Excessive engine oil consumption (1+ quart per 1,000-2,000 miles)',
      'Blue smoke from exhaust, especially during cold start or hard acceleration',
      'Oil level dropping significantly between oil changes',
      'Fouled or oil-soaked spark plugs',
      'Carbon buildup on intake valves',
      'Rough idle or misfires from fouled plugs'
    ],
    solution: 'Replace valve stem seals with updated OEM or performance seals ($3,500-$10,000 depending on method). Labor-intensive repair requiring either cylinder head removal ($6,000-$10,000) or specialized valve spring compressor tools with heads on engine ($3,500-$6,000). Address issue EARLY to prevent catalytic converter damage from oil burning (adds $3,000-$5,000 to repair). Perform more frequent oil changes (5,000 miles) to minimize damage. Blue smoke test: let engine idle 30+ minutes until hot, then rev to redline briefly - big blue smoke plume = valve seals. Find shop that can replace valve seals with heads installed (specialized tools required) - saves $4,000+ in labor vs. full head removal.',
    estimatedCost: { min: 3500, max: 15000 },
    recallInfo: 'BMW TSB for N63/S63 engines addressing valve stem seal replacement procedure and updated parts.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Do not ignore excessive oil consumption - catalytic converter replacement adds $3,000-$5,000 to already expensive valve seal job. Catch early.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Blue smoke test: Let engine idle 30+ minutes until hot, then rev to redline briefly. Big blue smoke plume = valve seals. Catch this early before cat damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Find a shop that can replace valve seals with heads installed (specialized tools required) - saves $4,000+ in labor vs. full head removal. M5Board recommendations.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Monitor oil consumption closely on S63 engines - check level every 500-1,000 miles. Early detection prevents expensive catalytic converter damage.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m5-ignition-coils-2012',
    make: 'BMW',
    model: 'M5',
    years: { start: 2012, end: 2023 },
    title: 'S63/S63TU Ignition Coil Premature Failure',
    severity: 'low',
    description: 'Ignition coils on S63 and S63TU engines (F10 M5 2012-2016, F90 M5 2018-2023) fail far more frequently than on other BMW engines, with failures common before 30,000 miles. High-performance turbocharged nature of S63 creates extreme heat and electrical demands that stress ignition coils beyond their design limits. When one coil fails, it typically signals that other coils are nearing end of life. Failed coils cause misfires, rough running, and can damage catalytic converters if not addressed promptly. M5Board: ignition coil failure before 30k miles is NORMAL on S63 engines - budget for this, don\'t be shocked when dealer says "common issue." When one coil fails, M5Post recommends replacing all 8 at once since they\'ll all fail within 10k miles anyway - saves second service appointment and labor cost.',
    symptoms: [
      'Engine misfires, especially under load or acceleration',
      'Rough idle and unstable engine operation',
      'Check engine light with misfire codes (P0300-P0308)',
      'Reduced power output',
      'Poor fuel economy',
      'Potential catalytic converter damage from unburned fuel'
    ],
    solution: 'Replace failed ignition coil(s) immediately to prevent catalytic converter damage ($3,000-$5,000 additional). When one coil fails, M5Post recommends replacing all 8 coils as preventative maintenance ($600-$900 parts + labor) - they typically fail within similar timeframes and saves second service visit. Use OEM Bosch coils for best reliability ($50-$80 each) - aftermarket options fail even faster on S63 due to heat and electrical demands. Replace spark plugs simultaneously if mileage exceeds 30,000 miles ($280-$320 for 8 plugs). Labor: 1-2 hours. Single coil replacement: $179-$235.',
    estimatedCost: { min: 180, max: 1200 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Ignition coil failure before 30k miles is NORMAL on S63 engines - budget for this. Don\'t be shocked when dealer says "common issue." M5Board consensus.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When one coil fails, replace all 8 at once - they\'ll all fail within 10k miles anyway. Save the second service appointment and labor cost ($200 saved).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Stick with OEM Bosch coils - aftermarket options fail even faster on S63 due to heat and electrical demands. Don\'t cheap out on $30 per coil.',
        partBrand: 'Bosch',
        partName: 'OEM Ignition Coil',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace spark plugs when doing coils if over 30k miles - labor is 90% done. Saves future service appointment.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmwM5Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmwM5Issues.length} BMW M5 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmwM5Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
