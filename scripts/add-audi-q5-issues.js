const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const newIssues = [
  {
    id: 'audi-q5-timing-chain-tensioner-2011',
    make: 'Audi',
    model: 'Q5',
    years: { start: 2009, end: 2017 },
    title: 'Timing Chain Tensioner Failure (Class Action Settlement)',
    severity: 'high',
    description: 'The 2009-2017 Audi Q5 2.0T TFSI experiences timing chain tensioner failures that cause catastrophic engine damage. The upper timing chain tensioner fails prematurely (often 90k-110k miles), allowing the timing chain to skip or break, causing bent valves, piston damage, and complete engine destruction. Metal tensioner components deteriorate, contaminating engine oil with metal flakes. The 2011-2012 models have the highest failure rate. Audi settled class action lawsuit in 2018 providing 100% reimbursement for repairs within 10yr/100k miles at Audi dealers. Engine replacement: $8,000-15,000 if not covered.',
    symptoms: [
      'Rattling noise from engine on cold start',
      'Metal grinding noise from timing chain area',
      'Check engine light with camshaft position codes',
      'Rough idle or misfires',
      'Complete engine failure (sudden loss of power)',
      'Engine won\'t start (timing jumped)',
      'Metallic debris in oil'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace both upper timing chain tensioners at 80k-90k miles ($1,500-2,500) to avoid catastrophic failure. If rattling present: Stop driving immediately - timing chain may jump any moment. Check settlement eligibility: 100% reimbursement for repairs within 10yr/100k miles from in-service date at authorized Audi dealer. Document everything. If engine damaged: Full engine replacement ($8,000-15,000). AudiWorld forum strongly recommends preventive replacement on all 2009-2017 2.0T engines.',
    estimatedCost: { min: 1500, max: 15000 },
    recallInfo: 'Class action settlement (2018) provides 100% reimbursement for timing chain tensioner repairs within 10yr/100k miles at Audi dealers. No official recall issued.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Rattling on cold start is NOT normal - timing chain tensioner is failing. Stop driving and get towed - chain can skip/break at any moment, destroying engine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: Replace timing chain tensioners PREVENTIVELY at 80k-90k miles ($1,500-2,500) - saves $10k+ engine replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check settlement eligibility - if within 10yr/100k miles from original in-service date, Audi reimburses 100% of repair at authorized dealer.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: '2011-2012 Q5 2.0T have highest failure rate - if buying used, verify tensioners were already replaced or budget for immediate replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check oil for metallic sheen/debris - indicates tensioner is already deteriorating. Get it replaced ASAP before chain fails.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q5-oil-consumption-2010',
    make: 'Audi',
    model: 'Q5',
    years: { start: 2010, end: 2017 },
    title: 'Excessive Oil Consumption (2.0T TFSI Engine)',
    severity: 'high',
    description: 'The 2010-2017 Audi Q5 2.0T TFSI suffers from excessive oil consumption, consuming 1 quart per 600-1,000 miles. Worn piston rings, PCV valve failure, and turbocharger seal leaks are primary causes. The 2014 model has the worst consumption rates. Problem becomes apparent around 60,000 miles. If oil level drops too low, engine damage/seizure occurs ($8,000-15,000). Audi considers 1qt per 1,000 miles "acceptable" but owners report needing to add oil every 500-800 miles. Fix requires piston/ring replacement ($5,000-9,000).',
    symptoms: [
      'Consuming 1+ quart of oil per 1,000 miles',
      'Low oil warning light frequently',
      'Blue smoke from exhaust (burning oil)',
      'Oil smell in cabin',
      'Fouled spark plugs',
      'Rough idle or misfires',
      'Check engine light'
    ],
    solution: 'Monitor oil level WEEKLY - top off immediately when low to prevent engine damage. Document all oil consumption with dates/mileage. Early stage: Replace PCV valve ($200-400) - fixes 20% of cases. Turbo seal leaks: Replace turbocharger ($2,000-3,500). Severe consumption (piston rings): Engine teardown to replace pistons/rings ($5,000-9,000). If under warranty, document oil consumption and demand Audi repair under warranty. Second-gen Q5 (2018+) has this issue resolved.',
    estimatedCost: { min: 200, max: 9000 },
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Check oil level EVERY WEEK - these engines will seize if oil runs low. Low oil light means already dangerously low ($10k+ engine damage).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Keep oil in trunk - you WILL need to top off between changes. AudiWorld members carry 2 quarts at all times.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Try replacing PCV valve first ($200-400) - fixes oil consumption in 20% of cases. Cheap fix before expensive piston replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If buying used 2010-2017 Q5 2.0T, expect oil consumption - budget $500/year for oil top-offs or $5k+ for piston replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Document EVERYTHING - every quart added, dates, mileage. Audi may offer goodwill assistance if consumption is extreme and well-documented.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q5-water-pump-failure-2009',
    make: 'Audi',
    model: 'Q5',
    years: { start: 2009, end: 2017 },
    title: 'Electronic Water Pump Failure (2.0T)',
    severity: 'high',
    description: 'The 2009-2017 Audi Q5 2.0T electronic water pump (integrated with thermostat) fails prematurely, often around 65,000 miles. Debris clogs the pump causing burnout, or moisture gets into electronics causing short circuit. When pump fails, engine overheats rapidly leading to warped cylinder head, blown head gasket, and severe engine damage ($3,000-8,000). Symptoms include overheating, coolant leaks, check engine light, and steam from engine bay. Preventive replacement at 60k-70k miles recommended.',
    symptoms: [
      'Engine temperature gauge rising into red',
      'Coolant warning light',
      'Coolant leak under vehicle or in engine bay',
      'Check engine light with thermostat/cooling codes',
      'Steam or smoke from engine bay',
      'Heater not blowing hot air',
      'Coolant level dropping rapidly'
    ],
    solution: 'IMMEDIATE ACTION if overheating: Pull over, turn off engine, DO NOT continue driving. Tow to shop - severe engine damage occurs within minutes. Preventive replacement: Replace water pump/thermostat assembly at 60k-70k miles ($600-1,200 parts+labor) to avoid catastrophic failure. Failed pump: Replace water pump/thermostat assembly ($600-1,200). If overheated and damaged: Cylinder head work, head gasket replacement, or full engine repair ($3,000-8,000). Use OEM Audi or premium aftermarket (Geba, Meyle) water pumps.',
    estimatedCost: { min: 600, max: 8000 },
    recallInfo: 'No official recall. TSBs issued for water pump software updates on some models.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: If temp gauge rises, STOP IMMEDIATELY and turn off engine - 2-3 minutes of overheating destroys cylinder head ($4k+ repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld preventive maintenance: Replace water pump at 60k-70k miles ($600-1,200) - prevents catastrophic overheating/engine damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi or premium Geba/Meyle water pumps - cheap pumps ($150-250) fail within 20k miles. Spend $400-600 for OEM quality.',
        partBrand: 'Geba',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check coolant level monthly - if dropping, water pump likely leaking. Address BEFORE it fails completely and overheats engine.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q5-carbon-buildup-2009',
    make: 'Audi',
    model: 'Q5',
    years: { start: 2009, end: 2023 },
    title: 'Direct Injection Carbon Buildup (Intake Valves)',
    severity: 'medium',
    description: 'All Audi Q5 2.0T/3.0T TFSI direct injection engines suffer from carbon buildup on intake valves. Since fuel is injected directly into the cylinder (bypassing valves), intake valves don\'t get cleaned by fuel detergents. Oil vapors and carbon accumulate on valves, reducing airflow and causing rough idle, misfires, poor acceleration, and reduced fuel economy. Cleaning required every 50k-80k miles. Walnut shell blasting is the most effective removal method ($400-800).',
    symptoms: [
      'Rough idle or engine vibration',
      'Cold start misfires (P0300-P0304 codes)',
      'Hesitation or poor acceleration',
      'Reduced fuel economy (MPG drops)',
      'Engine lacks power',
      'Check engine light with misfire codes'
    ],
    solution: 'Walnut shell blasting: Remove intake manifold, blast walnut shells at high pressure onto intake valves to remove carbon ($400-800). Chemical cleaning (less effective): Seafoam or CRC Intake Valve Cleaner ($50-150). Preventive: Use top-tier gasoline with detergents, Italian tune-up (high RPM driving) every 2 weeks, catch can installation ($200-400) reduces buildup. Clean valves every 50k-80k miles. AudiWorld strongly recommends walnut blasting over chemical methods.',
    estimatedCost: { min: 400, max: 800 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'AudiWorld proven fix: Walnut shell blasting every 50k-80k miles ($400-800) - restores full power, MPG, and eliminates misfires.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Install oil catch can ($200-400 DIY, $400-600 shop) - reduces carbon buildup by 70%+. Popular brands: Mishimoto, APR, CTS Turbo.',
        partBrand: 'Mishimoto',
        partName: 'Oil Catch Can',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY prevention: "Italian tune-up" - drive at 4,000+ RPM for 10-15 minutes every 2 weeks. Burns off some carbon buildup.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Chemical cleaners (Seafoam, etc.) provide minimal benefit for TFSI engines - walnut blasting is the ONLY effective cleaning method per AudiWorld.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q5-coolant-leaks-2009',
    make: 'Audi',
    model: 'Q5',
    years: { start: 2009, end: 2017 },
    title: 'Coolant Leaks (Thermostat Housing and Hoses)',
    severity: 'medium',
    description: 'Audi Q5 (2009-2017) experiences coolant leaks from thermostat housing, coolant flanges, and hoses. Plastic components crack with age/heat cycles, causing leaks. Symptoms include coolant smell, visible leaks under vehicle, low coolant warning, and overheating. If leaks ignored, engine overheats causing severe damage. Common leak points: thermostat housing, upper coolant flange, lower coolant flange, heater core hoses.',
    symptoms: [
      'Sweet coolant smell from vents or under hood',
      'Coolant puddles under vehicle',
      'Low coolant warning light',
      'Steam from engine bay',
      'Coolant level dropping',
      'Engine temperature rising'
    ],
    solution: 'Identify leak source: thermostat housing ($300-600 to replace), upper coolant flange ($200-400), lower coolant flange ($200-400), heater core hoses ($150-300). Replace all plastic coolant components preventively at 80k-100k miles to avoid roadside breakdown. Use OEM Audi parts - aftermarket plastic components crack faster. Always use Audi G12/G13 coolant - other coolants damage seals.',
    estimatedCost: { min: 150, max: 600 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'AudiWorld preventive: Replace all plastic coolant components at 80k-100k miles ($800-1,200 all at once) - prevents roadside breakdown.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY OEM Audi plastic coolant parts - aftermarket plastic (Dorman, etc.) cracks within 6-12 months. Worth paying 2x for OEM.',
        partBrand: 'Audi',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Use ONLY Audi G12/G13 coolant - generic coolant damages rubber seals and causes more leaks. Don\'t mix coolant types.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check coolant level monthly - if dropping, find leak BEFORE it leaves you stranded with overheated engine.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q5-transmission-mechatronic-2009',
    make: 'Audi',
    model: 'Q5',
    years: { start: 2009, end: 2017 },
    title: 'Transmission Mechatronic Unit Failure (8-Speed Tiptronic)',
    severity: 'high',
    description: 'The 2009-2017 Audi Q5 8-speed Tiptronic transmission experiences mechatronic unit (transmission control module + valve body) failures. The mechatronic unit controls shifting and when it fails, causes harsh shifts, delayed shifts, limp mode, and complete transmission failure. Fluid contamination from wear accelerates failure. Mechatronic replacement: $2,500-4,500. Full transmission rebuild: $4,500-7,000.',
    symptoms: [
      'Harsh or jerky shifting',
      'Delayed shifts or hesitation',
      'Transmission stuck in gear',
      'Limp mode (3rd gear only)',
      'Check engine light with transmission codes',
      'Grinding or whining noise from transmission',
      'Complete transmission failure (no movement)'
    ],
    solution: 'Early stage: Transmission fluid+filter replacement with Audi G055025A2 fluid ($300-500) - may restore normal shifting if caught early. Failed mechatronic: Replace mechatronic unit ($2,500-4,500 parts+labor) or rebuilt unit ($1,500-2,500). Complete failure: Transmission rebuild ($4,500-7,000). Change transmission fluid every 40k-50k miles to prevent failure. Audi claims "lifetime" fluid but AudiWorld recommends regular changes.',
    estimatedCost: { min: 300, max: 7000 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'AudiWorld preventive: Change transmission fluid every 40k-50k miles ($300-500) despite "lifetime" claim - extends mechatronic life significantly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY Audi G055025A2 transmission fluid - other fluids destroy mechatronic. Don\'t use "equivalent" fluids.',
        partBrand: 'Audi',
        partName: 'G055025A2 ATF',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore harsh shifting - mechatronic failure is progressive. Early fluid change may save $3k+ mechatronic replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Rebuilt mechatronic units ($1,500-2,500) save $1k+ vs new OEM ($3,500-4,500). AudiWorld members report good results with reputable rebuilders.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q5-sunroof-drain-clogs-2009',
    make: 'Audi',
    model: 'Q5',
    years: { start: 2009, end: 2023 },
    title: 'Sunroof Drain Tube Clogs (Water Leaks)',
    severity: 'low',
    description: 'Audi Q5 panoramic sunroof drain tubes clog with leaves, debris, and dirt, causing water to overflow into the cabin. Water drips from headliner, soaks carpets, floods footwells, and damages electronics. Mold and mildew develop in wet carpets. Four drain tubes (front corners and rear) route water from sunroof tray to ground. When clogged, water backs up and leaks inside. Cleaning drain tubes: $150-300.',
    symptoms: [
      'Water dripping from headliner or pillars',
      'Wet carpets or flooded footwells',
      'Musty or moldy smell in cabin',
      'Water sloshing sound behind dashboard',
      'Electrical issues (wet modules)',
      'Fogged windows'
    ],
    solution: 'DIY cleaning: Use weed trimmer line or compressed air to clear drain tubes from sunroof tray openings ($0-20). Professional: Shop clears all four drains with compressed air/water ($150-300). Preventive: Clean drains annually, especially after parking under trees. If carpets wet: Extract water immediately, dry thoroughly to prevent mold/electronics damage. Replace damaged modules if water damage occurred.',
    estimatedCost: { min: 0, max: 300 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'AudiWorld DIY fix: Use weed trimmer line (flexible plastic string) to clear drain tubes from sunroof tray. Takes 15 mins, saves $200.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Test drains by pouring water into sunroof tray corners - water should drain immediately. If pools, drains are clogged.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Water damage can destroy expensive modules (comfort control, amplifier, etc.) - dry carpets IMMEDIATELY if wet.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Preventive maintenance: Clean drains annually (spring and fall) - especially if parking under trees. Prevents expensive water damage.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

newIssues.forEach(issue => {
  const exists = knownIssues.issues.some(existing => existing.id === issue.id);
  if (!exists) {
    knownIssues.issues.push(issue);
  }
});

fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${newIssues.length} Audi Q5 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
newIssues.forEach(issue => {
  const yearRange = `${issue.years.start}${issue.years.end !== issue.years.start ? `-${issue.years.end}` : ''}`;
  console.log(`  - ${issue.title} (${yearRange})`);
});
