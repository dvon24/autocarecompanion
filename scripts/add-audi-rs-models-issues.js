const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const rsIssues = [
  // RS3 & TT RS (2.5T 5-Cylinder) Issues
  {
    id: 'audi-rs3-ttrs-carbon-buildup-2015',
    make: 'Audi',
    model: 'RS3',
    years: { start: 2015, end: 2023 },
    title: 'Severe Carbon Buildup on Intake Valves (2.5T 5-Cylinder)',
    severity: 'moderate',
    description: 'The 2.5T EA855 5-cylinder engine in the RS3 and TT RS (2015-2023) suffers from severe carbon buildup on intake valves due to direct injection. Fuel sprays directly into the combustion chamber, bypassing intake valves which only receive oil vapors from the PCV system. These vapors bake into hard carbon deposits over 30,000-60,000 miles. The high-performance nature of the 2.5T means carbon accumulates faster than in lower-output engines. Carbon restricts airflow causing rough idle, misfires, hesitation, and power loss. RS246.com forums recommend walnut blasting every 30,000-40,000 miles as PREVENTIVE maintenance. Failure to clean can cause valve damage requiring expensive engine work on these $60,000+ performance cars.',
    symptoms: [
      'Rough or unstable idle',
      'Hesitation or stumbling on acceleration',
      'Noticeable power loss (especially at high RPM)',
      'Poor fuel economy',
      'Check engine light with misfire codes',
      'Engine runs rough when cold',
      'Hard starting'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast walnut shells through intake ports ($800-$1,500). Repeat every 30,000-40,000 miles—MORE frequent than base models due to high performance. PREVENTION: Install catch can ($400-$700) to filter PCV vapors. Add Liqui Moly Intake Valve Cleaner to every oil change. Change oil every 5,000 miles. Drive car hard regularly—Audi\'s own recommendation to burn off carbon.',
    estimatedCost: { min: 800, max: 1500 },
    recallInfo: 'No recall. Carbon buildup inherent to all DI engines.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'RS3/TT RS owners: Carbon builds FASTER on 2.5T than other Audis. Get walnut blasting every 30k-40k miles, NOT 60k. High performance = more oil vapor = more carbon.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Install catch can immediately on new RS3/TT RS. APR and Mishimoto make 2.5T-specific kits for $400-$700. Extends cleaning interval and protects $10k+ engine.',
        partBrand: 'APR',
        partName: 'Baffled Oil Catch Can (2.5T)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Audi\'s official recommendation: Drive car HARD regularly. High RPM driving burns off light carbon. Don\'t baby your RS—it needs to be driven hard.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Slows carbon buildup on high-performance engines.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'RS246.com consensus: Budget for walnut blasting every 30k miles as routine maintenance. Part of RS ownership costs.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-rs3-dsg-transmission-2015',
    make: 'Audi',
    model: 'RS3',
    years: { start: 2015, end: 2023 },
    title: 'DSG Transmission Issues (7-Speed DQ500)',
    severity: 'moderate',
    description: 'The RS3 and TT RS use the 7-speed DQ500 DSG transmission which experiences mechatronic failures, clutch pack wear, and solenoid issues. Symptoms include jerky shifts, hesitation, delayed engagement, getting stuck in first gear, and transmission fluid leaks. The DQ500 in RS models handles 400+ HP and experiences higher stress than base models, accelerating wear. Mechatronic unit failures require $2,000-$4,000 replacement. Clutch pack failures cost $3,000-$5,000. AudiRS3.org forums report issues around 60,000-80,000 miles, though proper fluid service dramatically improves reliability. Audi\'s "lifetime fluid" claim is FALSE—service every 40,000 miles is critical.',
    symptoms: [
      'Jerky or harsh shifts',
      'Hesitation when accelerating',
      'Delayed gear engagement',
      'Stuck in first gear (won\'t upshift)',
      'Transmission fluid leaks',
      'Whining noise during cold starts (failing DSG pump)',
      'Check engine light with transmission codes'
    ],
    solution: 'For EARLY symptoms: DSG fluid and filter service ($500-$700) + software update. For MECHATRONIC failure: Replace unit ($2,000-$4,000). For CLUTCH failure: Replace clutch pack ($3,000-$5,000). PREVENTION: Service DSG every 40,000 miles with OEM Audi fluid (G 052 182 A2) ONLY. Avoid aggressive launches—use launch control sparingly. Monitor for leaks.',
    estimatedCost: { min: 500, max: 5000 },
    recallInfo: 'No recall. TSBs for software updates to improve shift quality.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'SERVICE YOUR DSG! Despite "lifetime" claim, change fluid every 40k miles. Use OEM Audi DQ500 fluid (G 052 182 A2). This $600 service prevents $4,000+ failure.',
        partBrand: 'Audi OEM',
        partName: 'DSG Fluid DQ500 (G 052 182 A2)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'RS models stress DSG more than base models (400+ HP). Fluid service is NOT optional—it\'s required. Neglect = $5,000 transmission replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Request DSG software update from dealer—free for some model years. Improves shift quality and reduces wear.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Limit launch control use. While fun, repeated LC cycles wear clutches faster. Save it for track days.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiRS3.org members report properly serviced DQ500 lasts 100k+ miles. Skip service and it fails by 70k. Simple choice.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-rs3-ttrs-injector-failure-2015',
    make: 'Audi',
    model: 'RS3',
    years: { start: 2015, end: 2023 },
    title: 'Fuel Injector Failure and "Torch Effect" (2.5T)',
    severity: 'high',
    description: 'The 2.5T EA855 engine in RS3 and TT RS suffers from fuel injector failures that can cause catastrophic engine damage. Failed injectors create a "torch effect" where excessive fuel sprays into the cylinder, melting pistons and destroying the engine. This requires complete engine replacement ($15,000-$25,000). The issue affects random injectors and can occur without warning between 40,000-100,000 miles. RS246.com and TTRS forums report multiple cases of melted pistons from injector failure. Preventive injector replacement or testing every 60,000 km (37,000 miles) is recommended by specialists to avoid catastrophic failure. This is a KNOWN DEFECT in the EA855 engine.',
    symptoms: [
      'Rough idle or misfires',
      'Check engine light with fuel system codes',
      'Loss of power',
      'Excessive fuel smell',
      'Engine knocking or pinging',
      'Sudden catastrophic engine failure (melted piston)',
      'No symptoms until failure (often happens without warning)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace all fuel injectors every 60,000 km (37,000 miles) with OEM Audi injectors ($1,500-$2,500 installed). If engine misfires or runs rough: Inspect injectors IMMEDIATELY—do NOT continue driving. Failed injector can destroy engine in minutes. If piston is melted: Engine replacement required ($15,000-$25,000). Consider extended warranty or aftermarket warranty for out-of-warranty RS3/TT RS. This is the most serious reliability issue with the 2.5T engine.',
    estimatedCost: { min: 1500, max: 25000 },
    recallInfo: 'No official recall despite widespread failures. Audi considers injectors "wear items."',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: The 2.5T injector "torch effect" is REAL and CATASTROPHIC. Budget $2,000 every 60k km for preventive injector replacement or risk $20k+ engine replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used RS3/TT RS, verify injectors have been replaced. If not, budget $2,000 immediately and replace before driving hard. This is NOT optional.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY genuine Audi injectors. Aftermarket injectors fail faster and can cause torch effect. OEM injectors are expensive but necessary.',
        partBrand: 'Audi OEM',
        partName: 'Fuel Injector Set (2.5T EA855)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you get ANY misfire codes, stop driving immediately and tow to shop. Continuing to drive with failed injector will melt piston and destroy engine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'RS246.com/TTRS forums have MANY melted piston cases. Search "torch effect" or "melted piston" to see photos. This is the 2.5T\'s Achilles heel.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },

  // RS6, RS7, RS Q8 (4.0T Twin-Turbo V8) Issues
  {
    id: 'audi-rs6-rs7-turbo-oil-strainer-2013',
    make: 'Audi',
    model: 'RS6',
    years: { start: 2013, end: 2020 },
    title: 'Turbocharger Oil Strainer Failure (4.0T V8) - CRITICAL',
    severity: 'high',
    description: 'The 4.0T twin-turbo V8 in RS6, RS7, and RS Q8 (2013-2020) has a CRITICAL design defect in the turbo oil strainer/screen. The oil strainer uses a mesh filter that\'s too narrow and gets blocked with oil and carbon deposits, starving the turbochargers of oil and causing complete turbo failure. This affects BOTH turbos and requires $8,000-$12,000 replacement. One dealership technician reported seeing 20+ failures in one year in a single region. Audi issued TSB extending coverage to 2017 models, but refuses warranty coverage for out-of-warranty vehicles despite it being a DESIGN FLAW. RS246.com forums are full of turbo failure cases. This is the most serious and expensive reliability issue with the 4.0T engine.',
    symptoms: [
      'Loss of power, especially under boost',
      'Whining or whistling noise from turbos',
      'Excessive blue smoke from exhaust (oil burning)',
      'Check engine light with turbo underboost codes',
      'Oil consumption increases',
      'Complete turbo failure (no boost)',
      'Often happens suddenly without warning'
    ],
    solution: 'PREVENTIVE FIX: Replace turbo oil strainers with updated parts ($1,500-$2,500) BEFORE failure. Some specialists offer strainer upgrade service. If turbos have FAILED: Replace both turbos ($8,000-$12,000 installed). Check TSB eligibility with Audi dealer—some 2013-2017 cars covered. PREVENTION: Change oil every 5,000 miles (NOT 10,000) with high-quality synthetic. Monitor for ANY boost loss and address immediately. Consider extended warranty if buying used 4.0T car.',
    estimatedCost: { min: 1500, max: 12000 },
    recallInfo: 'TSB extends warranty coverage to some 2013-2017 models. Check with Audi dealer. No official recall despite widespread failures.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL DEFECT: The 4.0T oil strainer issue is REAL and EXPENSIVE. Budget $10k for turbos or $2k for preventive strainer replacement. This is "when not if."',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used RS6/RS7/RS Q8, verify turbos and strainers have been replaced. If not, budget $10k immediately or walk away. Many are ticking time bombs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check TSB eligibility with Audi dealer BEFORE buying used. Some 2013-2017 cars covered under extended warranty. This can save $10k.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Change oil every 5,000 miles religiously. Clean oil is the ONLY defense against strainer clogging. Skip oil changes = instant turbo failure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'RS246.com has detailed threads on preventive strainer replacement. Some specialists offer upgrade service for $2,000—cheap insurance against $10k turbo job.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-rs6-rs7-carbon-buildup-2013',
    make: 'Audi',
    model: 'RS6',
    years: { start: 2013, end: 2023 },
    title: 'Severe Carbon Buildup on Intake Valves (4.0T V8)',
    severity: 'moderate',
    description: 'The 4.0T twin-turbo V8 in RS6, RS7, and RS Q8 suffers from severe carbon buildup on intake valves due to direct injection. The high-performance nature and twin-turbo setup means carbon accumulates faster than in lower-output engines. Over 60,000 miles, carbon restricts airflow causing rough idle, misfires, and power loss. The V8 configuration requires removing both intake manifolds, making walnut blasting more expensive ($1,200-$2,000) than 4-cylinder engines. RS6.com forums recommend cleaning every 60,000 miles as preventive maintenance. Failure to clean can cause valve damage requiring expensive cylinder head work on the $120,000+ RS models.',
    symptoms: [
      'Rough idle',
      'Hesitation on acceleration',
      'Power loss',
      'Poor fuel economy',
      'Check engine light with misfire codes',
      'Engine runs rough when cold'
    ],
    solution: 'WALNUT BLASTING: Remove both intake manifolds and blast walnut shells through all intake ports ($1,200-$2,000 for V8). Repeat every 60,000 miles. PREVENTION: Install catch can ($500-$800 for twin-turbo setup). Add Liqui Moly Intake Valve Cleaner to every oil change. Change oil every 5,000 miles. Drive car hard regularly.',
    estimatedCost: { min: 1200, max: 2000 },
    recallInfo: 'No recall. Carbon buildup inherent to all DI engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install dual catch cans for twin-turbo 4.0T. APR makes RS-specific kits for $500-$800. Filters vapors from both turbo sides.',
        partBrand: 'APR',
        partName: 'Dual Catch Can Kit (4.0T)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Walnut blasting costs more on V8 ($1,200-$2,000) than 4-cylinder due to dual manifolds. Budget accordingly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change oil every 5,000 miles to reduce carbon buildup. Clean oil = less PCV vapor contamination.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Slows carbon buildup on twin-turbo V8.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'RS6.com consensus: Carbon cleaning every 60k is part of RS ownership. Budget $1,500 as routine maintenance.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-rs6-rs7-motor-mounts-2013',
    make: 'Audi',
    model: 'RS6',
    years: { start: 2013, end: 2023 },
    title: 'Premature Motor Mount Failure (4.0T V8)',
    severity: 'low',
    description: 'The RS6, RS7, and RS Q8 with 4.0T V8 engines experience premature motor mount failures due to the engine\'s high torque output (600+ lb-ft). Motor mounts wear out between 40,000-80,000 miles, causing excessive engine movement, vibrations, and clunking noises during acceleration or deceleration. The high-performance nature of RS models accelerates mount wear compared to base models. Failed mounts cause driveline stress and can damage other components. RS246.com forums report this as a common issue on high-mileage RS models. Replacement costs $800-$1,500 for all mounts.',
    symptoms: [
      'Vibrations at idle',
      'Clunking noise during acceleration or deceleration',
      'Excessive engine movement visible from engine bay',
      'Transmission shifter vibration',
      'Steering wheel vibration',
      'Rough shifting'
    ],
    solution: 'Replace failed motor mounts with OEM or upgraded mounts ($800-$1,500 for all mounts). Upgraded aftermarket mounts (034 Motorsport, ECS) offer better durability for high-torque engines ($400-$600 per mount). If you drive aggressively or track the car, consider upgrading to performance mounts preventively. Monitor for vibrations and clunking—early replacement prevents driveline damage.',
    estimatedCost: { min: 800, max: 1500 },
    recallInfo: 'No recall. Motor mounts considered wear items.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'RS models wear mounts faster than base Audis due to 600+ lb-ft torque. Budget for mount replacement at 60k-80k miles.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Consider upgraded mounts from 034 Motorsport or ECS. More durable than OEM for high-torque V8. Costs similar to OEM.',
        partBrand: '034 Motorsport',
        partName: 'Density Line Motor Mounts',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace all mounts at once—if one fails, others are likely worn too. Saves labor costs doing them together.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly for experienced mechanics. Requires engine support bar. Save $400-$600 in labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'RS246.com consensus: Motor mounts are routine maintenance on 4.0T cars. Not a major concern, just part of ownership.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },

  // RS4 & RS5 (2.9T Twin-Turbo V6) Issues
  {
    id: 'audi-rs4-rs5-carbon-buildup-2018',
    make: 'Audi',
    model: 'RS4',
    years: { start: 2018, end: 2023 },
    title: 'Carbon Buildup on Intake Valves (2.9T Twin-Turbo V6)',
    severity: 'moderate',
    description: 'The 2.9T twin-turbo V6 in RS4 Avant and RS5 (2018-2023) suffers from carbon buildup on intake valves due to direct injection. Similar to other Audi DI engines, oil vapors from PCV system bake onto valve backs. The twin-turbo setup and high performance accelerate carbon accumulation. Over 60,000 miles, carbon causes rough idle, misfires, and power loss. RS246.com forums recommend walnut blasting every 60,000 miles. The V6 configuration requires removing both intake manifolds, costing $1,000-$1,800. Audi\'s official recommendation is to drive hard regularly to burn off carbon—not baby the RS.',
    symptoms: [
      'Rough idle',
      'Hesitation on acceleration',
      'Power loss',
      'Poor fuel economy',
      'Check engine light with misfire codes',
      'Runs rough when cold'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifolds and blast walnut shells through intake ports ($1,000-$1,800 for V6). Repeat every 60,000 miles. PREVENTION: Install dual catch cans ($400-$700). Add Liqui Moly Intake Valve Cleaner to every oil change. Change oil every 5,000 miles. Drive hard regularly—Audi\'s recommendation.',
    estimatedCost: { min: 1000, max: 1800 },
    recallInfo: 'No recall. Carbon buildup inherent to all DI engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install dual catch cans for twin-turbo 2.9T. Filters vapors from both banks. APR/Mishimoto make RS-specific kits for $400-$700.',
        partBrand: 'APR',
        partName: 'Dual Catch Can Kit (2.9T)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Audi says drive car HARD regularly. High RPM driving burns off light carbon. Don\'t baby your RS4/RS5—it needs to be driven hard.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blasting at 60k miles as preventive maintenance. Waiting for symptoms means carbon is severe.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Slows carbon buildup.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'RS246.com consensus: Carbon cleaning every 60k is routine on 2.9T. Part of RS ownership.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...rsIssues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${rsIssues.length} Audi RS model issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
rsIssues.forEach(issue => {
  console.log(`  - [${issue.model}] ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
