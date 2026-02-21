const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const newIssues = [
  {
    id: 'honda-crosstour-vcm-oil-consumption-2010',
    make: 'Honda',
    model: 'Crosstour',
    years: { start: 2010, end: 2012 },
    title: 'VCM System Oil Consumption and Engine Damage',
    severity: 'high',
    description: 'The 2010-2012 Honda Crosstour with J35Z2 V6 engine and VCM (Variable Cylinder Management) experiences severe oil consumption, often consuming 1 quart every 1,000-1,500 miles. The VCM system deactivates cylinders for fuel economy, but this causes improper ring oiling, damaging piston rings and cylinder walls. Symptoms include excessive oil consumption, misfires, fouled spark plugs, and engine damage. The 2013+ Crosstour uses the J35Y1 engine which fixed VCM issues. Solutions: VCM Muzzler ($170) to disable VCM, or frequent oil top-offs. Engine rebuild/replacement: $4,000-8,000.',
    symptoms: [
      'Excessive oil consumption (1qt per 1,000-1,500 miles)',
      'Low oil warning light',
      'Engine misfires (especially cylinders 1, 4, 6)',
      'Fouled spark plugs',
      'Rough idle when VCM active',
      'Check engine light with misfire codes',
      'Blue smoke from exhaust (burning oil)'
    ],
    solution: 'Prevention (before damage): Install VCM Muzzler II ($170-200) to disable VCM system - CrosstourOwnersClub.com members report oil consumption drops to normal levels. Monitor oil level weekly and top off as needed. Severe damage: Engine rebuild ($4,000-6,000) or replacement ($6,000-8,000). Honda may cover under goodwill if under 100k miles - document all oil consumption and dealer visits. Switch to 0W-20 or 5W-30 synthetic oil - some owners report reduced consumption.',
    estimatedCost: { min: 170, max: 8000 },
    recallInfo: 'No official recall, but Honda has extended warranty coverage for some owners. Contact Honda Customer Service (1-888-234-2138) and escalate.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'CrosstourOwnersClub.com #1 fix: VCM Muzzler II ($170) - disables VCM, oil consumption drops to normal, better throttle response. 500+ owners use it.',
        partBrand: 'VCM Tuner',
        partName: 'VCM Muzzler II',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'CRITICAL: Check oil level EVERY WEEK - running low on oil will destroy engine ($6k+ replacement). Low oil light means you\'re already dangerously low.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Document EVERYTHING - every quart of oil added, dealer visits, complaints. Honda may offer goodwill engine replacement if you have documentation.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: '2013+ Crosstour has J35Y1 engine without VCM oil consumption issues - if buying used, get 2013 or newer to avoid this problem.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-crosstour-transmission-parking-pawl-2010',
    make: 'Honda',
    model: 'Crosstour',
    years: { start: 2010, end: 2015 },
    title: 'Transmission Parking Pawl Failure (Vehicle Rolls Away)',
    severity: 'high',
    description: 'The Honda Crosstour (2010-2015) has a serious transmission defect where pieces of the ball bearing from the secondary shaft can become lodged in the parking pawl, causing the transmission to slip when put into Park. This results in the vehicle rolling away unexpectedly, creating a serious safety hazard. Honda issued a recall for the transmission control module software to prevent engine stall, but the parking pawl issue persists. Symptoms include transmission slipping in Park, vehicle rolling on incline when in Park, and grinding noise when shifting.',
    symptoms: [
      'Vehicle rolls when in Park (especially on incline)',
      'Grinding noise when shifting to Park',
      'Transmission slips out of Park',
      'Difficulty shifting into Park',
      'Metallic grinding noise from transmission',
      'Transmission warning lights'
    ],
    solution: 'This is a SAFETY ISSUE - use parking brake ALWAYS when parking, especially on inclines. If vehicle rolls in Park, have transmission inspected immediately. Repair may require internal transmission rebuild ($2,000-4,000) to replace parking pawl and damaged components. Check for Honda recalls/TSBs affecting your VIN. Always use parking brake as backup - don\'t rely on Park alone.',
    estimatedCost: { min: 2000, max: 4000 },
    recallInfo: 'Honda issued recall for transmission control module software, but parking pawl hardware issue may not be covered. Contact Honda: 1-888-234-2138.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL SAFETY ISSUE: ALWAYS use parking brake when parking - do NOT rely on Park alone. Vehicle can roll away and cause injury/death.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Set parking brake BEFORE shifting to Park - reduces stress on parking pawl and prevents failure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you notice ANY grinding when shifting to Park or vehicle rolls even slightly, get transmission inspected IMMEDIATELY before it fails completely.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-crosstour-transmission-shudder-2010',
    make: 'Honda',
    model: 'Crosstour',
    years: { start: 2010, end: 2015 },
    title: 'Transmission Shudder and Hard Shifting',
    severity: 'medium',
    description: 'Honda Crosstour (2010-2015) owners report transmission shuddering, hard shifting, slipping gears, and hesitation during acceleration. The 5-speed automatic transmission experiences torque converter shudder at low speeds (15-35 mph) and harsh shifting between gears. Honda issued software updates for torque converter control, but many owners report issues persist. Transmission fluid flush may help temporarily.',
    symptoms: [
      'Transmission shuddering at low speeds (15-35 mph)',
      'Hard or harsh shifting between gears',
      'Slipping gears during acceleration',
      'Hesitation when accelerating from stop',
      'Grinding or whining noise from transmission',
      'Rough downshifts when slowing'
    ],
    solution: 'Early stage: Transmission fluid flush with genuine Honda ATF DW-1 ($150-250). Check for Honda software updates/TSBs for torque converter. Severe cases: Torque converter replacement ($1,500-2,500) or transmission rebuild ($2,500-4,000). CrosstourOwnersClub reports some dealers performed torque converter software updates that improved shudder. Use only Honda ATF DW-1 - aftermarket fluids make shudder worse.',
    estimatedCost: { min: 150, max: 4000 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'Use ONLY genuine Honda ATF DW-1 fluid - CrosstourOwnersClub members who used aftermarket fluids report shudder got WORSE.',
        partBrand: 'Honda',
        partName: 'ATF DW-1 Automatic Transmission Fluid',
        partNumber: '08200-9008',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Ask dealer for torque converter software update (TSB may exist) - some CrosstourOwnersClub members report this fixed shudder.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore shudder - it indicates torque converter wear. Continued driving can lead to complete transmission failure requiring $3k+ rebuild.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-crosstour-ac-relay-failure-2010',
    make: 'Honda',
    model: 'Crosstour',
    years: { start: 2010, end: 2015 },
    title: 'AC Compressor Clutch Relay Failure',
    severity: 'medium',
    description: 'Honda Crosstour (2010-2015) experiences AC compressor clutch relay failures in the under-hood fuse box. The relay controls the AC compressor clutch engagement. When it fails, the AC stops working entirely - no cold air. Symptoms include AC not blowing cold, clicking sound from under hood when AC button pressed, and intermittent AC operation. The relay costs under $10 and is easy to replace DIY. Full AC compressor failure: $800-1,500.',
    symptoms: [
      'AC not blowing cold air',
      'AC works intermittently',
      'Clicking sound from under hood when AC button pressed',
      'AC compressor clutch not engaging',
      'AC works then suddenly stops'
    ],
    solution: 'DIY fix (10 minutes, $7): Replace AC compressor clutch relay in under-hood fuse box. Part number: Honda 39794-SDA-A03 or equivalent ($5-10 at auto parts store). CrosstourOwnersClub has photos showing exact relay location. If relay replacement doesn\'t fix it, AC compressor may have failed ($800-1,500 replacement). Test relay before replacing expensive AC components.',
    estimatedCost: { min: 7, max: 1500 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'DIY fix: Buy relay for $7, pop old one out, push new one in. Takes 10 minutes. CrosstourOwnersClub has step-by-step guide with photos.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Honda OEM relay part #39794-SDA-A03 ($7-10) or Duralast/Echlin equivalent from AutoZone ($5-8). Both work perfectly.',
        partBrand: 'Honda',
        partName: 'AC Compressor Clutch Relay',
        partNumber: '39794-SDA-A03',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Test the $7 relay BEFORE paying mechanic $1,000+ for AC compressor replacement - relay failure mimics compressor failure.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-crosstour-suspension-strut-wear-2010',
    make: 'Honda',
    model: 'Crosstour',
    years: { start: 2010, end: 2015 },
    title: 'Front Struts and Suspension Component Wear',
    severity: 'medium',
    description: 'About 10% of Honda Crosstour owners report premature suspension wear, particularly front struts and shocks. Symptoms include clunking noise over bumps, bouncy or loose handling, uneven tire wear, and nose-dive when braking. Worn struts decrease handling performance and safety. The Crosstour\'s weight (3,800-4,000 lbs) accelerates suspension wear. Replacement: $400-800 for front struts (pair).',
    symptoms: [
      'Clunking or knocking noise over bumps',
      'Bouncy or loose ride quality',
      'Nose-dive when braking',
      'Uneven tire wear',
      'Vehicle wanders or drifts on highway',
      'Poor handling in turns'
    ],
    solution: 'Replace worn front struts with OEM Honda or quality aftermarket (KYB, Monroe, Gabriel) struts ($400-800 for pair + alignment). Always replace in pairs (both fronts). Get 4-wheel alignment after strut replacement ($100-150). DIY possible but requires spring compressor tool (dangerous - recommend professional install). CrosstourOwnersClub recommends KYB struts for better ride quality than OEM.',
    estimatedCost: { min: 400, max: 800 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'CrosstourOwnersClub top pick: KYB Excel-G struts - better ride quality than OEM, last 80k+ miles, cost 30% less.',
        partBrand: 'KYB',
        partName: 'Excel-G Struts',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Worn struts are a SAFETY issue - they increase stopping distance, reduce handling, and can cause accidents. Don\'t ignore clunking/bouncing.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get 4-wheel alignment AFTER strut replacement - new struts will change suspension geometry. Skipping alignment causes premature tire wear.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-crosstour-electrical-issues-2013',
    make: 'Honda',
    model: 'Crosstour',
    years: { start: 2013, end: 2015 },
    title: 'Electrical System Issues and Starter Failures',
    severity: 'medium',
    description: 'The 2013-2015 Honda Crosstour experiences electrical system issues including starter failures, erratic dashboard warnings, and electrical gremlins. The starter motor fails prematurely (often before 100k miles), causing clicking noise when trying to start or complete no-start condition. Dashboard warnings appear randomly (VSA, ABS, check engine). Integration issues between VCM and GDI systems cause engine roughness. Starter replacement: $250-500.',
    symptoms: [
      'Clicking noise when trying to start',
      'No start condition (engine won\'t crank)',
      'Intermittent starting issues',
      'Random dashboard warning lights (VSA, ABS)',
      'Electrical accessories malfunctioning',
      'Battery draining overnight'
    ],
    solution: 'Starter failure: Replace starter motor ($250-500 parts+labor). Electrical gremlins: Check battery terminals for corrosion, test battery (load test), inspect ground cables. Random warnings: Often caused by weak battery or bad alternator - test charging system first before replacing expensive modules. If issues started after VCM disable, check for software conflicts.',
    estimatedCost: { min: 250, max: 500 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Clicking when starting is usually bad starter motor - test it before replacing battery or alternator (saves $200 in wrong parts).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'OEM Denso starter or remanufactured from AutoZone ($150-250) work equally well. Avoid ultra-cheap Chinese starters - fail within months.',
        partBrand: 'Denso',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Random electrical issues often indicate weak battery or bad alternator - test these FIRST before chasing expensive gremlins.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-crosstour-paint-clearcoat-issues-2010',
    make: 'Honda',
    model: 'Crosstour',
    years: { start: 2010, end: 2015 },
    title: 'Paint and Clearcoat Issues',
    severity: 'low',
    description: 'Some Honda Crosstour owners report paint peeling, bubbling, or clearcoat failures, especially on the hood and roof. While not as widespread as some other Honda models, it still affects a notable number of Crosstours. Most common on white and silver colors. Honda has not issued a warranty extension for Crosstours. Full panel repaint: $1,500-3,000.',
    symptoms: [
      'Paint peeling or bubbling (especially hood/roof)',
      'Clearcoat flaking off',
      'Rust forming where paint is gone',
      'Paint fading prematurely'
    ],
    solution: 'If under warranty, document and take to dealer immediately. If out of warranty: (1) Document with photos, (2) Contact Honda Customer Service (1-888-234-2138) for goodwill assistance - some owners got partial coverage. (3) Full panel repaint: $1,500-3,000. Use premium paint systems (PPG, Axalta). Catch early before rust forms.',
    estimatedCost: { min: 1500, max: 3000 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Contact Honda Customer Service and escalate - some CrosstourOwnersClub members got goodwill coverage by being persistent.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t delay - once paint peels to bare metal, rust forms quickly and Honda won\'t cover it.',
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

console.log(`✓ Successfully added ${newIssues.length} Honda Crosstour issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
newIssues.forEach(issue => {
  const yearRange = `${issue.years.start}${issue.years.end !== issue.years.start ? `-${issue.years.end}` : ''}`;
  console.log(`  - ${issue.title} (${yearRange})`);
});
