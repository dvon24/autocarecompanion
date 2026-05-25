const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const a8Issues = [
  {
    id: 'audi-a8-timing-chain-tensioner-2011',
    make: 'Audi',
    model: 'A8',
    years: { start: 2011, end: 2017 },
    title: 'Timing Chain Tensioner Failure (4.2L V8 & 3.0T)',
    severity: 'high',
    description: 'The D4 A8 with the 4.2L V8 and 3.0T engines (2011-2017) suffers from timing chain tensioner failures, identical to other Audi models. The tensioners wear out between 80,000-120,000 miles, causing the timing chain to stretch and rattle on cold starts. A loud rattling noise from the engine on cold start is the classic warning sign of failing tensioners. If ignored, the timing chain can jump timing or break, causing catastrophic valve-to-piston contact and destroying the engine. The 4.2L V8 has 4 timing chains with multiple tensioners and guides—all prone to wear. Complete timing chain failure can cost $10,000-$15,000 in repairs or engine replacement. AudiWorld forums report many D4 A8 owners experiencing this issue under 120,000 miles.',
    symptoms: [
      'Loud rattling or clattering from engine on cold start',
      'Metallic rattling that disappears after warm-up',
      'Check engine light with timing correlation codes (P0016, P0017)',
      'Rough idle or misfires',
      'Engine won\'t start (if chain has jumped)',
      'Catastrophic engine damage (bent valves, destroyed pistons)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace ALL timing chains, tensioners, and guides at 80,000-100,000 miles BEFORE rattling starts ($4,000-$6,000 for 3.0T; $6,000-$8,000 for 4.2L V8). If rattling has started, DO NOT delay—chain can jump at any moment. The 4.2L V8 requires removing the engine for access—labor is 20-25 hours. Use ONLY OEM Audi parts. Change oil every 5,000 miles and check level weekly. If catastrophic failure occurs, engine replacement ($10,000-$15,000) is often more cost-effective than rebuild. Consider this a "when, not if" repair on D4 A8 models.',
    estimatedCost: { min: 4000, max: 15000 },
    recallInfo: 'No official recall. Some coverage under extended warranty. Check with Audi dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Rattling on cold start means tensioners are failing NOW. Do not drive hard or take long trips. Chain can jump within weeks and destroy $80,000 engine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used D4 A8, assume timing chains need replacement unless documentation proves otherwise. Factor $5,000-$8,000 into purchase price.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY genuine Audi timing chain kits. Complete OEM kit for 4.2L V8 costs $2,500-$3,500 (parts only). Labor is another $4,000-$5,000 due to engine removal.',
        partBrand: 'Audi OEM',
        partName: 'Complete Timing Chain Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Low oil accelerates tensioner failure. Check oil level EVERY fillup. Running even 1 quart low destroys tensioners in 10,000 miles. Always carry spare oil.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: The 4.2L V8 timing chain job is so expensive that many owners sell the car rather than repair it. Budget accordingly or avoid 4.2L V8 entirely.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a8-air-suspension-2011',
    make: 'Audi',
    model: 'A8',
    years: { start: 2011, end: 2023 },
    title: 'Adaptive Air Suspension Failure',
    severity: 'high',
    description: 'The Audi A8 across both D4 (2011-2017) and D5 (2018-2023) generations uses an adaptive air suspension system that is notoriously unreliable and expensive to repair. The air springs (airbags) leak over time, causing uneven ride height. The air compressor works harder when springs leak, leading to premature compressor failure ($1,500-$2,500). The electronic control module suffers from software glitches causing erratic suspension behavior. Symptoms include warning lights, bouncy ride, uneven stance (one corner sagging), and complete suspension failure requiring tow. Air suspension repairs average $500-$2,500 PER CORNER for airbag replacement, or $3,000-$6,000 for all four corners plus compressor. Many A8 owners convert to coil springs to eliminate future air suspension issues.',
    symptoms: [
      'Air suspension warning light on dashboard',
      'One corner of car sagging (uneven ride height)',
      'Bouncy or harsh ride quality',
      'Compressor runs constantly (audible from rear)',
      'Car sits too low or won\'t raise',
      'Hissing noise from wheel wells (leaking air spring)',
      'Complete suspension failure (car stuck at lowest height)'
    ],
    solution: 'For LEAKING airbags: Replace failed air spring(s) ($800-$1,200 per corner installed). All four corners often fail within 80,000-120,000 miles—budget for complete replacement ($3,000-$4,500). For FAILED compressor: Replace air compressor and dryer assembly ($1,500-$2,500). For ELECTRONIC issues: Update suspension control module software at dealer ($200-$400). ALTERNATIVE: Convert to coil spring suspension with aftermarket kit ($2,000-$3,000) to eliminate air suspension entirely—popular among owners tired of recurring failures. Monitor suspension warning lights and address leaks early before compressor burns out.',
    estimatedCost: { min: 800, max: 6000 },
    recallInfo: 'No recall. Air suspension is considered a wear item not covered under warranty after expiration.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'If buying used A8, budget $3,000-$5,000 for air suspension rebuild or conversion to coil springs. This is a "when, not if" repair on high-mileage A8s.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Consider coil spring conversion kit from Arnott or StructMasters ($2,000-$3,000) to eliminate air suspension forever. Many owners prefer this over repeated air spring replacements.',
        partBrand: 'Arnott',
        partName: 'Coil Spring Conversion Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'DO NOT ignore sagging corners. Driving with failed air spring forces compressor to run continuously, burning it out ($2,500 replacement). Fix springs immediately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'If keeping air suspension, use OEM Audi air springs. Aftermarket springs fail within 30k miles. Genuine Audi springs last 80k-100k miles.',
        partBrand: 'Audi OEM',
        partName: 'Air Suspension Strut',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: Air suspension is A8\'s biggest reliability weakness. Budget $500-1,000/year for suspension repairs on D4/D5 models.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a8-mmi-infotainment-2011',
    make: 'Audi',
    model: 'A8',
    years: { start: 2011, end: 2023 },
    title: 'MMI Infotainment System Failures',
    severity: 'moderate',
    description: 'The A8 across both D4 (2011-2017) and D5 (2018-2023) generations experiences frequent MMI (Multi Media Interface) infotainment system failures. In D4 models, the motorized screen fails to rise from the dashboard, gets stuck, or makes grinding noises. In D5 models, the touchscreen freezes, won\'t turn on, or becomes unresponsive. Both generations suffer from random reboots, black screens, navigation failures, and complete system crashes. The MMI control modules overheat or suffer from software corruption. Repairs require complete MMI unit replacement ($2,500-$4,000) as internal components cannot be serviced individually. Software updates provide temporary fixes but issues often return. This is the most frequently reported electrical problem in the A8.',
    symptoms: [
      'MMI screen won\'t rise from dashboard (D4)',
      'MMI touchscreen frozen or unresponsive (D5)',
      'Screen shows black/blank display',
      'System reboots randomly while driving',
      'Navigation, climate controls, or radio not working',
      'Grinding noise from motorized screen mechanism (D4)',
      'MMI displays error messages or safe mode',
      'Backup camera, parking sensors not functioning'
    ],
    solution: 'For TEMPORARY fixes: Perform MMI hard reset (hold power + volume up for 10 seconds, or disconnect battery for 30 minutes). If that fails, dealer can update software ($150-$300). For PERSISTENT issues: Replace MMI control unit ($2,500-$4,000 installed). D4 motorized screen mechanism can be replaced separately ($800-$1,200). Most MMI issues covered under 4-year/50k warranty—document problems early and push for warranty coverage. After warranty, consider living with minor glitches as repairs are expensive.',
    estimatedCost: { min: 150, max: 4000 },
    recallInfo: 'No recalls for general MMI issues. Some software updates available to address specific bugs.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'MMI hard reset fixes 70% of freezing issues: Hold power + volume up for 10 seconds. System reboots. If it freezes again, needs dealer software update.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used A8, test ALL MMI functions before purchase: screen rising (D4), touchscreen, navigation, climate, backup camera. MMI replacement is $3,000+.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'DO NOT pay for MMI replacement out-of-pocket if under warranty. Push dealer hard for warranty coverage—this is a known defect, not wear and tear.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld reports D4 motorized screen mechanism fails due to worn gears. Can be replaced separately for $800-$1,200 instead of full MMI unit.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'After warranty expires, learn to live with minor MMI glitches. Spending $3,000 on infotainment for an aging A8 doesn\'t make financial sense.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a8-carbon-buildup-2011',
    make: 'Audi',
    model: 'A8',
    years: { start: 2011, end: 2023 },
    title: 'Severe Carbon Buildup on Intake Valves',
    severity: 'moderate',
    description: 'All A8 models with direct-injection engines (3.0T, 4.0T, 60 TFSI) suffer from severe carbon buildup on intake valves. In direct-injection engines, fuel bypasses the intake valves, leaving them exposed only to oil vapors from the PCV system. These vapors bake onto valve backs as hard carbon deposits over 60,000-100,000 miles. Carbon restricts airflow, causing rough idle, misfires, hesitation, and power loss. The high-performance engines in the A8 are particularly susceptible due to higher oil vapor pressure. The ONLY effective fix is walnut blasting every 60,000 miles. This is preventive maintenance, not optional. Failure to clean carbon can cause valve damage requiring engine replacement on the A8\'s expensive V6/V8 engines.',
    symptoms: [
      'Rough or unstable idle',
      'Hesitation or stumbling on acceleration',
      'Noticeable power loss',
      'Poor fuel economy (3-5 MPG drop)',
      'Check engine light with misfire codes (P0300-P0308)',
      'Engine runs rough when cold',
      'Hard starting or extended cranking'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast crushed walnut shells through intake ports ($1,000-$1,800 for A8 due to packaging complexity). Requires specialized equipment. Repeat every 60,000 miles as PREVENTIVE maintenance. PREVENTION: Install catch can ($400-$700) to filter PCV vapors—extends cleaning interval to 100k+ miles. Add Liqui Moly Intake Valve Cleaner to every oil change. Change oil every 5,000 miles to reduce vapor contamination. Budget for this as routine maintenance.',
    estimatedCost: { min: 1000, max: 1800 },
    recallInfo: 'No recall. Carbon buildup is inherent to all direct-injection engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install catch can to filter crankcase vapors BEFORE they coat valves. APR makes A8-specific kits for $400-$700. Extends cleaning from 60k to 100k+ miles.',
        partBrand: 'APR',
        partName: 'Baffled Oil Catch Can System',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blasting at 60k miles as preventive maintenance BEFORE symptoms appear. Waiting for rough idle means carbon is severe.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Dramatically slows carbon buildup. $15/bottle—cheapest prevention.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER use chemical "pour-in" cleaners (Seafoam)—they don\'t reach valves on DI engines and can damage sensors. Only walnut blasting works.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change oil every 5,000 miles (NOT 10,000) to reduce PCV vapor contamination. Clean oil = less carbon buildup.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a8-electrical-sensor-2011',
    make: 'Audi',
    model: 'A8',
    years: { start: 2011, end: 2023 },
    title: 'Electrical Faults and Sensor Malfunctions',
    severity: 'low',
    description: 'The A8 is prone to various electrical gremlins due to its complex electronics and luxury features. Common issues include parking sensor malfunctions, blind spot monitoring failures, tire pressure sensor errors, climate control glitches, warning lights that come and go, and battery drain from parasitic draw. The D5 generation (2018+) experiences "Drive System Malfunction" and "Electric Fault" messages causing sudden loss of power and limp mode. Many electrical issues are caused by aging control modules, corroded connectors, software bugs, or weak batteries. While frustrating and expensive to diagnose ($150-$300 diagnostic fee), most electrical issues are not safety-critical. Dealership electrical diagnostics and repairs are expensive due to A8\'s complexity.',
    symptoms: [
      'Parking sensors beeping constantly or not working',
      'Blind spot monitoring warning light',
      'Tire pressure warnings with correct pressure',
      'Climate control stuck or not responding',
      '"Drive System Malfunction" message (D5)',
      'Battery dies after sitting 3-4 days',
      'Random warning lights that come and go',
      'Power loss and limp mode (D5)'
    ],
    solution: 'For SENSOR issues: Dealer diagnostic scan ($150-$300) to identify failed sensor. Replace specific sensor ($200-$600 per sensor installed). For BATTERY drain: Parasitic draw test to identify faulty module ($150-$300 diagnostic). Common culprits: trunk electronics, MMI, comfort modules. For "DRIVE SYSTEM MALFUNCTION": Update control module software at dealer ($200-$400). If persistent, may require module replacement ($1,000-$2,500). Most electrical issues covered under 4-year/50k warranty. After warranty, prioritize safety-critical repairs only—live with minor annoyances.',
    estimatedCost: { min: 200, max: 2500 },
    recallInfo: 'No recalls for general electrical issues. Some software updates available for specific faults.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'For battery drain, invest in Battery Tender trickle charger ($50). If car sits more than 3-4 days, plug it in. Cheaper than chasing parasitic draw.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used A8, have pre-purchase inspection specifically test ALL sensors and electronics. Electrical gremlins are expensive to fix.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'DO NOT ignore "Drive System Malfunction" on D5 models. Can cause sudden power loss while driving. Get dealer software update immediately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Document ALL electrical issues while under warranty and push dealer for repairs. After warranty, electrical diagnosis costs $150/hour—adds up fast.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: A8 electrical issues are part of ownership. Budget $500-$1,000/year for misc electrical repairs on out-of-warranty cars.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...a8Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${a8Issues.length} Audi A8 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
a8Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
