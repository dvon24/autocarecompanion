const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const newIssues = [
  {
    id: 'audi-q7-timing-chain-tensioner-2007',
    make: 'Audi',
    model: 'Q7',
    years: { start: 2007, end: 2015 },
    title: 'Timing Chain Tensioner Failure (Catastrophic Engine Damage)',
    severity: 'high',
    description: 'The 2007-2015 Audi Q7 (3.0T and 3.6L) experiences timing chain tensioner failures causing catastrophic engine damage. The tensioner wears prematurely, allowing the timing chain to skip or break, bending valves and destroying pistons. Metal debris contaminates engine oil. Symptoms include rattling/ticking on cold start. Failure often occurs between 80k-120k miles. Complete engine loosening can lead to five-figure repair costs. Irregular oil changes significantly accelerate wear since tensioners work hydraulically and depend on clean oil. Preventive replacement at 80k-90k miles recommended.',
    symptoms: [
      'Rattling or ticking noise on cold start',
      'Metal grinding noise from timing chain area',
      'Check engine light with camshaft codes',
      'Rough idle or misfires',
      'Complete engine failure (sudden loss of power)',
      'Engine won\'t start (timing jumped)',
      'Metallic debris in oil'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace timing chain tensioners at 80k-90k miles ($2,000-3,500) to avoid catastrophic failure. If rattling present: Stop driving immediately - chain may jump at any moment. Failed tensioner: Full timing chain service including tensioners, guides, and chain ($2,500-4,500). If engine damaged: Complete engine rebuild or replacement ($10,000-18,000). AudiWorld forum consensus: Don\'t skip this preventive maintenance on 3.0T/3.6L engines.',
    estimatedCost: { min: 2000, max: 18000 },
    recallInfo: 'No official recall. Same issue as Q5 - class action settlement may apply. Check timing chain settlement eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Rattling on cold start means tensioner failing - stop driving and get towed. Continued driving WILL destroy engine ($15k+ replacement).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: Replace timing chain tensioners PREVENTIVELY at 80k-90k miles ($2,500-3,500) - saves $12k+ engine rebuild.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER skip oil changes on 3.0T/3.6L - dirty oil destroys timing chain tensioners. Use Audi 502.00 spec oil, change every 5k-7k miles.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check oil for metallic sheen - indicates tensioner deteriorating. Replace immediately before chain fails.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q7-supercharger-failure-2011',
    make: 'Audi',
    model: 'Q7',
    years: { start: 2011, end: 2015 },
    title: 'Supercharger Bearing Failure and Boost Leaks (3.0T)',
    severity: 'high',
    description: 'The 2011-2015 Audi Q7 3.0T supercharged engine experiences supercharger bearing failures, bypass valve failures, and boost leaks. Worn supercharger bearings cause whining noise, power loss, and complete supercharger failure. Bypass valves fail causing boost lag and poor acceleration. Boost leaks in hoses/lines cause check engine lights and reduced power. Supercharger rebuild: $1,500-2,500. New supercharger: $3,000-5,000.',
    symptoms: [
      'Whining or whistling noise from engine (especially under acceleration)',
      'Loss of power or boost',
      'Poor acceleration or turbo lag',
      'Check engine light with boost/supercharger codes',
      'Hissing sound (boost leak)',
      'Rough idle',
      'Reduced fuel economy'
    ],
    solution: 'Worn bearings: Supercharger rebuild with new bearings ($1,500-2,500) or replacement supercharger ($3,000-5,000). Bypass valve: Replace supercharger bypass valve ($300-600). Boost leaks: Inspect all boost hoses/clamps, replace cracked hoses ($150-400). Use OEM Audi or quality aftermarket (INA) supercharger bearings. AudiWorld recommends catch can installation ($300-500) to reduce oil vapor damage to supercharger.',
    estimatedCost: { min: 150, max: 5000 },
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Whining noise under boost means supercharger bearings failing - address quickly before complete failure ($4k+ supercharger replacement).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld: Install oil catch can ($300-500) - reduces oil vapor entering supercharger, extending bearing life significantly.',
        partBrand: 'Mishimoto',
        partName: 'Oil Catch Can Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Supercharger rebuilds ($1,500-2,500) save $2k vs new unit. Find reputable rebuilder on AudiWorld - many good options.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi or INA supercharger bearings - cheap Chinese bearings fail within 10k miles.',
        partBrand: 'INA',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q7-carbon-buildup-3.0t-2011',
    make: 'Audi',
    model: 'Q7',
    years: { start: 2011, end: 2023 },
    title: 'Severe Carbon Buildup Causing Valve Damage (3.0T TFSI)',
    severity: 'high',
    description: 'The 2011-2023 Audi Q7 3.0T TFSI direct injection engine suffers severe carbon buildup on intake valves, secondary air ports, and intake manifold. Direct injection means no fuel washes over valves, allowing oil vapor to accumulate. Carbon buildup causes rough idle after cold start (~100k km), misfires, increased oil consumption, and in severe cases, VALVE DAMAGE requiring engine replacement. AudiWorld reports dealers finding damaged valves from carbon buildup so severe the engine needed replacement. Walnut blasting required every 60k-80k miles.',
    symptoms: [
      'Rough idle after cold start (smooths out when warm)',
      'Misfires (especially cold engine)',
      'Loss of power',
      'Increased oil consumption',
      'Check engine light (secondary air insufficient flow)',
      'Poor fuel economy',
      'Engine damaged (severe cases)'
    ],
    solution: 'Walnut shell blasting: Remove intake manifold and supercharger, blast intake valves/ports with walnut shells ($800-1,500 for 3.0T). Secondary air port cleaning: Clean carbon from secondary air ports ($300-600). Preventive: Install catch can ($300-500), replace PCV system every 60k-80k miles ($200-400), use top-tier gas. Clean valves every 60k-80k miles. Severe valve damage: Engine replacement ($12,000-20,000).',
    estimatedCost: { min: 300, max: 20000 },
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Rough idle on cold start at 60k+ miles = carbon buildup. Clean NOW before it damages valves (one owner needed $18k engine replacement).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld preventive maintenance: Walnut blast every 60k-80k miles ($800-1,500) + catch can install - prevents valve damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Install Mishimoto or APR catch can ($300-500) - reduces carbon buildup by 70%+, extends cleaning intervals.',
        partBrand: 'APR',
        partName: 'Catch Can System',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace PCV system every 60k-80k miles ($200-400) - failing PCV increases oil vapor = more carbon buildup.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q7-air-suspension-failure-2007',
    make: 'Audi',
    model: 'Q7',
    years: { start: 2007, end: 2015 },
    title: 'Air Suspension Strut Failure and Compressor Issues',
    severity: 'medium',
    description: 'The 2007-2015 Audi Q7 with adaptive air suspension experiences air strut leaks and compressor failures. Air struts leak due to seal degradation, physical damage, corrosion, or wear. Leaking struts cause suspension to sag, uneven ride height, and instability. Compressor fails from overwork (cycling constantly due to leaks) or electronic module failures. Symptoms include sagging corners, compressor running constantly, suspension warning lights, and harsh ride. Air strut replacement: $800-1,500 per corner. Compressor: $1,200-2,000.',
    symptoms: [
      'Vehicle sagging on one or more corners',
      'Uneven ride height',
      'Suspension warning light',
      'Compressor running constantly (loud motor noise)',
      'Harsh or bouncy ride',
      'Air suspension fault message',
      'Compressor won\'t activate (complete failure)'
    ],
    solution: 'Leaking strut: Replace air strut ($800-1,500 per corner). All four corners worn: Replace all four struts ($3,000-5,500). Failed compressor: Replace air suspension compressor ($1,200-2,000). Control module fault: Replace suspension control module ($800-1,500). Alternative: Convert to coil spring suspension ($1,500-2,500 all corners) - eliminates air suspension issues permanently. AudiWorld recommends Arnott or Strutmasters air struts (cheaper than OEM, good quality).',
    estimatedCost: { min: 800, max: 5500 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'AudiWorld cost-effective: Convert to coil springs ($1,500-2,500) - eliminates air suspension forever, rides great, no more leaks.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Arnott or Strutmasters air struts ($500-800 each) - half price of OEM Audi ($1,200-1,500), AudiWorld members report 5+ years life.',
        partBrand: 'Arnott',
        partName: 'Air Suspension Strut',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If compressor running constantly, strut is leaking - replace strut ASAP before compressor burns out ($2k+ total repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replacing one strut? Budget for all four within 12-18 months - they all wear at similar rate. Save money doing all at once.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q7-tdi-emissions-scandal-2009',
    make: 'Audi',
    model: 'Q7',
    years: { start: 2009, end: 2016 },
    title: 'TDI Diesel Emissions Scandal and Recalls (Dieselgate)',
    severity: 'high',
    description: 'The 2009-2016 Audi Q7 3.0L TDI diesel was part of Volkswagen Group\'s emissions cheating scandal. EPA found VW/Audi failed to comply with Clean Air Act regulations - vehicles emitted up to 40x legal NOx emissions. Audi issued emissions recalls for 2009-2012 Q7 TDI (Gen 1 fix) and 2013-2016 Q7 TDI (Gen 2 fix). Some owners report reduced performance, increased DEF consumption, and DPF issues after emissions fix. Class action settlements provided compensation to affected owners.',
    symptoms: [
      'Check engine light (after emissions fix)',
      'Reduced power or performance (post-fix)',
      'Increased DEF (diesel exhaust fluid) consumption',
      'DPF (diesel particulate filter) regeneration issues',
      'EGR (exhaust gas recirculation) problems',
      'Poor fuel economy (post-fix)'
    ],
    solution: 'Emissions recall: Contact Audi dealer for FREE emissions modification/repair (mandatory for registration in some states). Post-fix issues: EGR cooler cleaning/replacement ($800-1,500), DPF cleaning/replacement ($1,500-3,000), DEF system repairs ($300-1,200). Class action settlement: Eligible owners received compensation ($7,000-10,000 depending on model year). Check settlement status at VWCourtSettlement.com. Some emissions repairs covered under extended warranty.',
    estimatedCost: { min: 0, max: 3000 },
    recallInfo: 'EPA emissions recall for 2009-2016 Q7 3.0L TDI. Free emissions fix at Audi dealers. Class action settlement provided compensation to owners.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check if you qualify for class action settlement money ($7k-10k) even if you no longer own the vehicle: VWCourtSettlement.com',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Emissions fix required for registration in many states - can\'t avoid it. Budget for potential EGR/DPF issues after fix.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld: If buying used Q7 TDI, verify emissions fix completed + check for post-fix EGR/DPF problems. Test drive thoroughly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Post-fix DPF regen issues? Drive highway 20+ mins weekly at 60+ mph to allow passive regeneration - prevents DPF clogging.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q7-tdi-oil-cooler-leak-2013',
    make: 'Audi',
    model: 'Q7',
    years: { start: 2013, end: 2015 },
    title: 'TDI Oil Cooler Leak into Brake Booster (Safety Recall)',
    severity: 'high',
    description: 'The 2013-2015 Audi Q7 3.0L TDI has a serious defect where the check valve in the vacuum line becomes contaminated with plastic debris, allowing engine oil to leak into the brake booster. If oil leaks into the brake booster, the diaphragm ruptures causing LOSS OF POWER BRAKING ASSIST. This drastically increases stopping distance and creates a serious safety hazard. Audi issued NHTSA recall - dealers replace vacuum line and inspect/replace brake booster components.',
    symptoms: [
      'Hard brake pedal (increased effort required)',
      'Loss of power braking assist',
      'Increased stopping distance',
      'Oil smell in cabin',
      'Brake warning light',
      'Oil residue in brake booster area'
    ],
    solution: 'This is a SAFETY RECALL - contact Audi dealer immediately for FREE vacuum line replacement and brake booster inspection/repair. Repair includes: Replace vacuum line with improved check valve, inspect brake booster for oil contamination, replace brake booster if contaminated ($800-1,500 value - FREE under recall). Do NOT delay - loss of brake assist is extremely dangerous.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA safety recall for 2013 Q7 3.0L TDI. Free vacuum line and brake booster repair at Audi dealers.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL SAFETY RECALL: Loss of power brakes drastically increases stopping distance - can cause accidents. Schedule repair IMMEDIATELY.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Test brakes before driving - if pedal feels hard or requires extra effort, DO NOT drive. Get towed to dealer for recall repair.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Recall repair is FREE and takes 1-2 hours. Dealers provide loaner for safety recalls.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q7-water-pump-failure-2007',
    make: 'Audi',
    model: 'Q7',
    years: { start: 2007, end: 2015 },
    title: 'Water Pump and Thermostat Failure (Overheating)',
    severity: 'high',
    description: 'The 2007-2015 Audi Q7 (3.0T, 3.6L, TDI) experiences water pump and thermostat failures causing engine overheating. Plastic impeller water pumps fail from debris clogging or electronic failures. When pump fails, coolant flow drops causing rapid overheating and severe engine damage (warped cylinder heads, blown gaskets). Thermostat housings crack and leak coolant. Failure often occurs around 60k-80k miles. Preventive replacement recommended.',
    symptoms: [
      'Engine temperature gauge rising into red',
      'Coolant warning light',
      'Coolant leaking under vehicle',
      'Steam or smoke from engine bay',
      'Check engine light with cooling system codes',
      'Heater not blowing hot air',
      'Overheating'
    ],
    solution: 'IMMEDIATE if overheating: Pull over, turn off engine, DO NOT continue - engine damage occurs in minutes. Preventive: Replace water pump/thermostat assembly at 60k-80k miles ($800-1,500) to avoid catastrophic failure. Failed pump: Replace water pump/thermostat ($800-1,500). If overheated: Cylinder head inspection, possible head gasket replacement ($2,500-5,000). Use OEM Audi or premium Geba/Meyle parts.',
    estimatedCost: { min: 800, max: 5000 },
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: If temp gauge rises, STOP IMMEDIATELY - 2-3 minutes overheating destroys cylinder head ($4k+ repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld preventive: Replace water pump at 60k-80k miles ($800-1,500) - prevents catastrophic overheating.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi or Geba/Meyle water pumps - cheap pumps ($200-300) fail within 20k miles. Pay $500-700 for quality.',
        partBrand: 'Geba',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check coolant level monthly - if dropping, water pump/thermostat likely leaking. Fix before complete failure.',
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

console.log(`✓ Successfully added ${newIssues.length} Audi Q7 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
newIssues.forEach(issue => {
  const yearRange = `${issue.years.start}${issue.years.end !== issue.years.start ? `-${issue.years.end}` : ''}`;
  console.log(`  - ${issue.title} (${yearRange})`);
});
