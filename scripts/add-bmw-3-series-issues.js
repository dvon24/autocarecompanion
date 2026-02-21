const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmw3SeriesIssues = [
  {
    id: 'bmw-3-series-n20-timing-chain-2012',
    make: 'BMW',
    model: '3 Series',
    years: { start: 2012, end: 2015 },
    title: 'N20 Timing Chain Guide Failure (Catastrophic) - F30 320i/328i',
    severity: 'high',
    description: 'The N20 2.0-liter turbo engine in F30 3 Series 320i and 328i models (2012-early 2015) has a CRITICAL design defect in the plastic timing chain guides. The guides crack, degrade, and break apart due to material defects, causing the timing chain to skip or break. This results in catastrophic piston-to-valve collision and complete engine destruction requiring $8,000-$15,000 replacement. Early symptoms include rattling on cold start (like marbles in a tin can) and high-pitched whining between 1,500-2,500 RPM. BMW redesigned the guides in January 2015, but 2012-2014 models are ticking time bombs. Bimmerpost forums are full of catastrophic N20 failures. This is the WORST BMW reliability issue of the 2010s.',
    symptoms: [
      'Rattling or clattering noise from front of engine on cold start (marbles in tin can)',
      'High-pitched whining or whirring between 1,500-2,500 RPM',
      'Rough idle or misfires',
      'Check engine light with timing/cam codes',
      'Engine suddenly stops running (chain has broken)',
      'Complete engine failure (piston-to-valve collision)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: If you own a 2012-2014 F30 328i/320i with N20, replace timing chain guides IMMEDIATELY at 60,000-80,000 miles ($2,500-$4,000) BEFORE failure. If rattling has started: STOP DRIVING and tow to shop—chain can break at any moment. If engine has failed: Complete engine replacement required ($8,000-$15,000). BMW extended warranty covers some cases. CRITICAL: Avoid 2012-2014 328i/320i when buying used—opt for 2015+ with updated guides or N55 models.',
    estimatedCost: { min: 2500, max: 15000 },
    recallInfo: 'No official recall. Extended warranty coverage for some models. Class action settlement may apply—check with BMW dealer.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: 2012-2014 F30 328i/320i with N20 are CATASTROPHIC FAILURES waiting to happen. If you own one, replace guides NOW. If buying used, AVOID these years entirely.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Bimmerpost consensus: The N20 timing chain guide is BMW\'s worst reliability disaster since rod bearings. Many owners have $12k+ engine replacement bills.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used F30, insist on 2015+ model year (after January 2015 production) with updated guides. Or choose N55 models (335i) which don\'t have this issue.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you hear ANY rattling from engine, DO NOT DRIVE. Tow to shop immediately. Continuing to drive will destroy engine within days.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check extended warranty eligibility with BMW dealer. Some 2012-2014 cars still covered. Can save $12,000+ on engine replacement.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-3-series-water-pump-2006',
    make: 'BMW',
    model: '3 Series',
    years: { start: 2006, end: 2023 },
    title: 'Electric Water Pump Failure (All Engines)',
    severity: 'moderate',
    description: 'BMW 3 Series across all generations (E90, F30, G20) use electric water pumps that fail prematurely between 60,000-100,000 miles. The electric motor or impeller fails, causing coolant circulation to stop and engine to overheat rapidly. Unlike belt-driven pumps, electric pumps fail suddenly without warning—engine can overheat in minutes. Symptoms include overheating, coolant warning lights, and pump motor whining. Ignoring overheating causes warped cylinder heads and blown head gaskets ($3,000-$6,000 repair). This affects ALL BMW engines (N52, N54, N55, N20, B48, B58). Bimmerfest forums report water pump as one of the most common BMW failures. Budget for replacement every 80,000-100,000 miles as preventive maintenance.',
    symptoms: [
      'Engine overheating rapidly (temp gauge in red)',
      'Coolant warning light',
      'Low coolant message (with full reservoir)',
      'Whining or grinding noise from water pump',
      'Steam from engine bay',
      'Coolant leak under car',
      'Heater blows cold air'
    ],
    solution: 'Replace electric water pump ($600-$1,200 installed). Use OEM BMW or quality aftermarket (Rein, Hepu). Replace thermostat at same time ($200 additional). Flush cooling system and refill with BMW-spec coolant (do NOT use generic green). PREVENTIVE: Replace water pump at 80,000 miles before failure to avoid being stranded and engine damage. Monitor for ANY overheating and pull over immediately if temp rises.',
    estimatedCost: { min: 600, max: 1200 },
    recallInfo: 'No recall. Water pump considered routine maintenance.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Replace water pump BEFORE 100k miles as preventive maintenance. Electric pumps fail suddenly—don\'t wait for symptoms or you\'ll be stranded.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW or quality German pumps (Rein, Hepu). Cheap eBay pumps fail within 20k miles. Genuine BMW pump lasts 80k-100k miles.',
        partBrand: 'Rein',
        partName: 'Electric Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If engine overheats, PULL OVER IMMEDIATELY and shut off. Driving with overheating warps heads ($4,000+ repair). Call tow truck.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace thermostat when doing water pump—it\'s right there and labor is 80% done. Saves $200-$300 in future labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Bimmerfest consensus: Water pump failure is inevitable on all BMWs. Budget $800-$1,000 around 80k-100k miles.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-3-series-oil-leaks-2006',
    make: 'BMW',
    model: '3 Series',
    years: { start: 2006, end: 2023 },
    title: 'Valve Cover Gasket and Oil Filter Housing Gasket Leaks',
    severity: 'low',
    description: 'BMW 3 Series across all generations develop oil leaks from valve cover gasket (VCG) and oil filter housing gasket (OFHG) between 60,000-120,000 miles. The gaskets harden and crack from heat cycling, causing oil seepage. VCG leaks drip onto exhaust manifold causing burning oil smell. OFHG leaks drip onto alternator and belts, causing accessory failures. While not immediately dangerous, leaks worsen over time and low oil can damage engine. This affects ALL BMW engines (N52, N54, N55, N20, B48, B58). Bimmerpost forums report this on virtually every high-mileage 3 Series. These are wear items requiring eventual replacement.',
    symptoms: [
      'Burning oil smell from engine bay',
      'Oil residue on engine/engine cover',
      'Low oil warning (with visible leaks)',
      'Oil dripping under car',
      'Oil on alternator or belts',
      'Smoke from engine bay (oil on exhaust)',
      'Oil level drops between changes'
    ],
    solution: 'Replace valve cover gasket ($400-$800) and/or oil filter housing gasket ($300-$600). Can be done separately or together. Use OEM BMW gaskets or quality aftermarket (Elring, Victor Reinz). DIY-friendly for experienced mechanics—saves $300-$500 in labor. Monitor oil level weekly and top off as needed. Address leaks before they worsen—prevents alternator damage and engine oil starvation.',
    estimatedCost: { min: 300, max: 1400 },
    recallInfo: 'No recall. Gaskets are routine maintenance/wear items.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'These gaskets are "when not if" on all BMWs. Budget for VCG + OFHG replacement around 80k-100k miles. Part of BMW ownership.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly repairs. VCG takes 2-3 hours, OFHG takes 1-2 hours. Youtube has detailed guides. Save $400-$600 in dealer labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW or quality German gaskets (Elring, Victor Reinz). Cheap gaskets leak within 20k miles. Genuine gaskets last 80k+ miles.',
        partBrand: 'Elring',
        partName: 'Valve Cover Gasket Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'OFHG leaks drip onto alternator, causing $800+ alternator failure. Fix OFHG leak early to prevent expensive secondary damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used BMW, assume gaskets need replacement unless recently done. Factor $1,000 into purchase price.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-3-series-carbon-buildup-2006',
    make: 'BMW',
    model: '3 Series',
    years: { start: 2006, end: 2023 },
    title: 'Carbon Buildup on Intake Valves (Direct Injection Engines)',
    severity: 'moderate',
    description: 'BMW 3 Series with direct-injection engines (N54, N55, N20, B48, B58) suffer from carbon buildup on intake valves. Fuel bypasses valves in DI engines, leaving them exposed only to oil vapors from PCV system which bake into hard deposits over 60,000-100,000 miles. Carbon restricts airflow causing rough idle, misfires, hesitation, and power loss. The N54 twin-turbo is particularly susceptible. The ONLY effective fix is walnut blasting every 60,000-80,000 miles. Chemical cleaners don\'t work on DI engines. Bimmerpost recommends this as preventive maintenance, not "if needed." Failure to clean can cause valve damage on BMW\'s expensive turbocharged engines.',
    symptoms: [
      'Rough or unstable idle',
      'Hesitation on acceleration',
      'Power loss',
      'Poor fuel economy (2-3 MPG drop)',
      'Check engine light with misfire codes',
      'Engine runs rough when cold',
      'Hard starting'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast walnut shells through intake ports ($700-$1,200). Requires specialized equipment—not DIY-friendly. Repeat every 60,000-80,000 miles as PREVENTIVE maintenance. PREVENTION: Install catch can ($300-$500) to filter PCV vapors—extends cleaning interval. Use Top Tier gasoline. Change oil every 5,000-7,500 miles. Drive hard occasionally (Italian tune-up).',
    estimatedCost: { min: 700, max: 1200 },
    recallInfo: 'No recall. Carbon buildup inherent to all DI engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install catch can to filter crankcase vapors. Mishimoto makes BMW-specific kits for $300-$500. Extends cleaning from 60k to 100k+ miles.',
        partBrand: 'Mishimoto',
        partName: 'Baffled Oil Catch Can',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blasting at 60k-80k miles as preventive maintenance. Waiting for symptoms means carbon is severe. N54 needs it more frequently than other engines.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER use chemical "pour-in" cleaners (Seafoam)—they don\'t work on DI engines and can damage sensors. Only walnut blasting removes carbon.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Italian tune-up: Once a month, safely accelerate hard to redline in 2nd/3rd gear. High RPM helps burn off light carbon.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Bimmerpost consensus: Carbon cleaning every 60k-80k is part of BMW DI engine ownership. Budget $900 as routine maintenance.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmw3SeriesIssues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmw3SeriesIssues.length} BMW 3 Series issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmw3SeriesIssues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
