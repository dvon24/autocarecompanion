const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const q3Issues = [
  {
    id: 'audi-q3-timing-chain-tensioner-2015',
    make: 'Audi',
    model: 'Q3',
    years: { start: 2015, end: 2020 },
    title: 'Timing Chain Tensioner Failure (2.0 TFSI Engine)',
    severity: 'high',
    description: 'The first-generation Q3 (2015-2018) and early second-generation (2019-2020) models with the 2.0 TFSI EA888 engine suffer from premature timing chain tensioner failure, identical to other Audi models (A4, A5, Q5). The tensioners wear out between 60,000-120,000 miles, causing the timing chain to stretch and rattle on cold starts. If ignored, the chain can slip or jump timing, causing catastrophic valve-to-piston contact and destroying the engine. Rattling noise from the front of the engine on cold start is the classic warning sign. Later 2021+ models have updated tensioners and are less prone to failure. AudiWorld and Q3 forums report failures under 100,000 miles, with some owners experiencing complete engine destruction requiring $6,000-$10,000 replacement.',
    symptoms: [
      'Loud rattling or clattering from front of engine on cold start',
      'Metallic rattling that disappears after warm-up',
      'Check engine light with timing correlation codes (P0016, P0017)',
      'Rough idle or misfires',
      'Engine won\'t start (if chain has jumped timing)',
      'Catastrophic engine damage (bent valves, destroyed pistons)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace timing chain, tensioners, and guides at 80,000-100,000 miles BEFORE rattling starts ($2,000-$3,000). If rattling has started, DO NOT delay—chain can jump at any moment. Repair requires removing front engine cover, water pump, thermostat. Labor is 8-12 hours. Use ONLY OEM Audi parts—aftermarket tensioners fail quickly. Change oil every 5,000 miles and check oil level weekly to prevent accelerated tensioner wear. If catastrophic failure occurs, engine replacement ($6,000-$10,000) is often more cost-effective than rebuild. 2021+ Q3 models have updated parts and are more reliable.',
    estimatedCost: { min: 2000, max: 10000 },
    recallInfo: 'No official recall. Class action settlement covered some 2015-2018 Q3 models. Check with Audi dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Rattling on cold start is your ONLY warning. Once it starts, you have weeks to months before catastrophic failure. Do not drive hard or take long trips until repaired.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used Q3 (2015-2020), assume timing chain needs replacement unless documentation proves otherwise. Factor $2,500 into purchase price or walk away.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY genuine Audi timing chain kit. ECS Tuning sells complete OEM kits for $800-$1,200 (parts only). Aftermarket kits fail within 30k miles.',
        partBrand: 'Audi OEM',
        partName: 'Complete Timing Chain Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Low oil accelerates tensioner failure. Check oil EVERY fillup. Running even 1 quart low destroys tensioners in 10,000 miles. Always carry spare oil in trunk.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: '2021+ Q3 models have updated EA888 Gen 3B engine with improved tensioners. If buying new/recent used, opt for 2021+ to avoid this issue entirely.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q3-oil-consumption-2015',
    make: 'Audi',
    model: 'Q3',
    years: { start: 2015, end: 2018 },
    title: 'Excessive Oil Consumption (2.0 TFSI Engine)',
    severity: 'moderate',
    description: 'Early first-generation Q3 models (2015-2018) with the 2.0 TFSI EA888 Gen 2 engine suffer from excessive oil consumption due to defective piston ring design. Owners report burning 1 quart of oil every 600-1,200 miles, requiring frequent top-ups. The issue is identical to A4/A5/Q5 models from the same era. Faulty oil control rings fail to scrape oil from cylinder walls, allowing it to burn in the combustion chamber. This causes blue smoke on startup, fouled spark plugs, and carbon buildup. Low oil levels starve the turbocharger and timing chain tensioners, leading to expensive failures. Audi extended warranty coverage for some models. 2019+ Q3 models with EA888 Gen 3 engine have updated piston rings and are significantly more reliable.',
    symptoms: [
      'Low oil warning light frequently (need to add oil between changes)',
      'Burning 1+ quarts of oil every 1,000 miles',
      'Blue or gray smoke from exhaust on startup',
      'Fouled spark plugs (oil-soaked)',
      'Check engine light with misfire codes (P0300-P0304)',
      'Rough idle from carbon buildup',
      'Turbo whining (from oil starvation)'
    ],
    solution: 'For SEVERE consumption (over 1 qt/1,000 mi): Piston ring replacement or short block replacement ($4,000-$7,000). Check Audi\'s extended warranty program for 2015-2018 Q3 models. For MODERATE consumption: Replace PCV valve ($150), clean carbon with walnut blasting ($800), switch to thicker oil (5W-40). PREVENTION: Check oil level WEEKLY, change oil every 5,000 miles (NOT 10,000), avoid 2015-2017 models when buying used. 2019+ Gen 3 EA888 engines are far more reliable.',
    estimatedCost: { min: 150, max: 7000 },
    recallInfo: 'Extended warranty for some 2015-2018 Q3 2.0 TFSI models under Audi\'s "Oil Consumption Test Program." Check dealer eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Running low on oil destroys turbocharger ($2,500) and timing chain tensioners (engine failure). Check oil EVERY gas fillup. Always carry spare oil.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Switch to thicker 5W-40 or 0W-40 oil to reduce consumption. Use Liqui Moly Leichtlauf High Tech 5W-40 or Mobil 1 European 0W-40. Helps worn rings seal better.',
        partBrand: 'Liqui Moly',
        partName: 'Leichtlauf High Tech 5W-40',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used 2015-2018 Q3, insist on oil consumption test: Check level, drive 500 miles, recheck. Over 1 qt/1,000 mi is a deal-breaker—walk away.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Replace PCV valve every 40k-60k miles ($80-$150 DIY). Failed PCV increases crankcase pressure and worsens consumption. Easy 30-minute job.',
        partBrand: 'Audi OEM',
        partName: 'PCV Valve',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: '2019+ Q3 models with Gen 3 EA888 have updated piston rings and are FAR more reliable. Avoid 2015-2017 models—they have worst consumption issues.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q3-water-pump-coolant-2015',
    make: 'Audi',
    model: 'Q3',
    years: { start: 2015, end: 2023 },
    title: 'Water Pump and Thermostat Housing Coolant Leaks',
    severity: 'moderate',
    description: 'The Q3 across both generations (2015-2023) experiences frequent coolant leaks from plastic thermostat housings and water pump failures. Audi uses plastic impellers in the water pump that crack or disintegrate over time (80,000-120,000 miles), and plastic thermostat housings that crack from heat cycling. Coolant leaks present as a sweet smell under the hood, low coolant warnings, or pink/green puddles under the car. If left unaddressed, leaks cause overheating, warped cylinder heads, and blown head gaskets ($3,000-$5,000 repair). The water pump is timing belt/chain driven, so replacement during timing service saves labor. AudiWorld forums report water pump failures between 60,000-100,000 miles.',
    symptoms: [
      'Sweet smell under hood (coolant)',
      'Coolant leak under front of car (pink/green puddle)',
      'Low coolant warning light or message',
      'Overheating in stop-and-go traffic',
      'Temperature gauge rising above normal (middle position)',
      'Hissing or gurgling from engine bay',
      'Steam from engine (severe overheating)'
    ],
    solution: 'Replace water pump AND thermostat housing together ($800-$1,500). Use OEM or high-quality parts (Rein, Hepu)—cheap pumps fail within 20k miles. If timing chain service is due, replace water pump at same time to save labor (pump is right there). Flush cooling system and refill with OEM Audi G12++ or G13 coolant (do NOT mix types or use generic green). Inspect all coolant hoses and replace if cracked. Monitor coolant level weekly—address leaks immediately to prevent overheating damage.',
    estimatedCost: { min: 800, max: 1500 },
    recallInfo: 'No recall. Water pump/thermostat replacement is routine maintenance.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'If timing chain service is due, replace water pump at same time—labor is already 80% done. Saves $400-$600 in future labor costs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi or German water pumps (Rein, Hepu). Cheap eBay pumps fail within 20k miles. Genuine pump lasts 100k+ miles. Worth the extra cost.',
        partBrand: 'Rein',
        partName: 'Engine Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER ignore coolant leaks. Driving with low coolant warps cylinder heads and blows head gaskets—$3,000-$5,000 repair. Pull over if temp gauge rises.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY G12++ or G13 Audi-spec coolant (pink/purple). Do NOT use generic green—damages aluminum. Pentosin and Zerex make Audi-compatible coolant.',
        partBrand: 'Pentosin',
        partName: 'Pentofrost A3 (G13)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check coolant level weekly—takes 30 seconds. Top off if low and monitor for leaks. Early detection prevents expensive overheating damage.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q3-carbon-buildup-2015',
    make: 'Audi',
    model: 'Q3',
    years: { start: 2015, end: 2023 },
    title: 'Carbon Buildup on Intake Valves (Direct Injection)',
    severity: 'moderate',
    description: 'All Q3 models with direct-injection 2.0 TFSI engines (2015-2023) suffer from carbon buildup on intake valves. In direct-injection engines, fuel sprays directly into the cylinder, bypassing intake valves. Intake valves are only exposed to oil vapors from the PCV system, which bake onto valve backs as hard carbon deposits over 60,000-100,000 miles. Carbon restricts airflow, causing rough idle, misfires, hesitation, and power loss. The ONLY effective fix is walnut blasting—blasting crushed walnut shells through the intake to remove carbon without damaging valves. In severe cases, carbon prevents valves from seating properly, causing compression loss. Q3 forums recommend walnut blasting every 60,000-80,000 miles as preventive maintenance.',
    symptoms: [
      'Rough or unstable idle (engine shakes)',
      'Hesitation or stumbling on acceleration',
      'Reduced power and sluggish throttle',
      'Poor fuel economy (2-4 MPG drop)',
      'Check engine light with misfire codes (P0300-P0304)',
      'Engine runs rough when cold, smooths when warm',
      'Hard starting or extended cranking'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast crushed walnut shells through intake ports ($700-$1,200). Requires specialized equipment—not DIY-friendly. Dealers charge $1,200-$1,500; independent Audi shops charge less. Repeat every 60,000-80,000 miles. PREVENTION: Install catch can ($300-$500) to filter PCV oil vapors before they reach valves—extends cleaning interval to 100k+ miles. Add Liqui Moly Intake Valve Cleaner to every oil change ($15). Perform "Italian tune-up" monthly (spirited highway driving to high RPM to burn carbon).',
    estimatedCost: { min: 700, max: 1500 },
    recallInfo: 'No recall. Carbon buildup is inherent to all direct-injection engines across manufacturers.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install catch can to filter crankcase oil vapors BEFORE they coat valves. Mishimoto and APR make kits for $300-$500. Extends cleaning from 60k to 100k+ miles.',
        partBrand: 'Mishimoto',
        partName: 'Baffled Oil Catch Can Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Won\'t remove heavy carbon but slows buildup. Costs $15/bottle—cheap prevention.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blasting BEFORE symptoms appear as preventive maintenance at 60k-80k miles. Waiting for rough idle means carbon is severe and may have damaged valves.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Italian tune-up: Once a month, safely accelerate hard in 3rd gear from 3,000-6,500 RPM on highway. High RPM/airflow helps burn off light carbon deposits.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER use chemical "pour-in" cleaners (Seafoam, CRC)—they don\'t reach the valves on DI engines and can damage sensors. Only walnut blasting works.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q3-brake-pedal-recall-2019',
    make: 'Audi',
    model: 'Q3',
    years: { start: 2019, end: 2020 },
    title: 'Brake Pedal Plate Detachment (Safety Recall)',
    severity: 'moderate',
    description: 'Second-generation Q3 models (2019-2020) have a manufacturing defect where the brake pedal plate can bend or completely detach from the brake pedal under heavy braking pressure. This occurs during emergency stops or sudden braking when maximum force is applied to the pedal. If the plate bends or detaches, the driver loses the ability to brake effectively, dramatically increasing crash risk. Audi issued RECALL 20V-720 (NHTSA) affecting thousands of Q3 vehicles. The issue is caused by a weak weld between the brake pedal and the pedal plate. Dealers inspect the weld and replace the entire brake pedal assembly if necessary, free of charge.',
    symptoms: [
      'Brake pedal feels loose or wobbly',
      'Brake pedal plate visibly bent',
      'Reduced braking force (pedal goes to floor)',
      'Grinding or metal noise from brake pedal area',
      'Pedal plate separates completely (catastrophic brake failure)'
    ],
    solution: 'This is covered under RECALL 20V-720 (NHTSA). Contact your Audi dealer IMMEDIATELY to schedule free recall repair. The dealer will inspect the weld between the brake pedal and pedal plate. If defective, they replace the ENTIRE brake pedal assembly for free. DO NOT attempt DIY repair—this is a safety-critical system. Check your VIN at Audi\'s recall website or NHTSA to confirm if your vehicle is affected. Recall repair takes 1-2 hours. This is a SERIOUS SAFETY ISSUE—prioritize this repair.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'RECALL 20V-720 (NHTSA): 2019-2020 Q3. Dealer inspects brake pedal weld and replaces pedal assembly for free.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'SAFETY CRITICAL: Check your VIN immediately. If affected, schedule recall repair ASAP. Brake pedal can fail during emergency stop—serious crash risk.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you feel ANY looseness or wobble in brake pedal, do NOT drive the vehicle. Have it towed to dealer for inspection. Brake failure is life-threatening.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Recall repair is FREE regardless of warranty status or mileage. Audi must fix by law. Takes 1-2 hours—schedule with routine service.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Until recall is performed, avoid aggressive braking. Leave extra following distance. If pedal detaches at highway speed, use emergency brake and pull over safely.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Some owners didn\'t receive recall notice. Check VIN manually at NHTSA.gov even if no mail received. Don\'t rely on Audi notifications—verify yourself.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q3-steering-lock-recall-2019',
    make: 'Audi',
    model: 'Q3',
    years: { start: 2019, end: 2020 },
    title: 'Steering System Lock (Belt Pulley Circlip Recall)',
    severity: 'high',
    description: 'Second-generation Q3 models (2019-2020) have a critical production defect in the steering rack belt pulley. A circlip (retaining ring) that secures the pulley can fail to properly engage due to manufacturing tolerances. If the circlip detaches, it catches on surrounding components, causing the steering system to suddenly LOCK while driving. This creates an immediate crash hazard—the driver loses the ability to steer. Audi issued RECALL 20V-556 (NHTSA) for this life-threatening issue. The recall affects thousands of Q3 vehicles. Dealers inspect the steering rack pulley and replace the circlip or entire steering rack assembly if necessary, free of charge. This is one of the most serious Q3 recalls.',
    symptoms: [
      'Steering becomes stiff or locks completely while driving',
      'Grinding or clicking noise from steering system',
      'Steering wheel won\'t turn (complete loss of steering)',
      'Power steering warning light',
      'Sudden loss of vehicle control (catastrophic)',
      'No symptoms until sudden failure (often no warning)'
    ],
    solution: 'This is covered under RECALL 20V-556 (NHTSA). Contact Audi dealer IMMEDIATELY—this is a LIFE-THREATENING defect. Dealer will inspect the steering rack belt pulley circlip. If defective, they replace the circlip or entire steering rack assembly for free. DO NOT drive the vehicle until recall is performed if you notice ANY steering symptoms. Check your VIN at Audi\'s recall website or NHTSA.gov. If affected, this is your #1 priority repair. Recall repair takes 2-4 hours.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'RECALL 20V-556 (NHTSA): 2019-2020 Q3. Dealer inspects/replaces steering rack circlip for free.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'LIFE-THREATENING: Check VIN NOW. This is the most serious Q3 recall. Steering can lock at highway speed causing catastrophic crash. Schedule repair IMMEDIATELY.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If steering becomes stiff or makes ANY noise, STOP driving immediately. Have vehicle TOWED to dealer. Do NOT risk driving—steering failure causes crashes.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Recall repair is FREE regardless of warranty/mileage. This is a federal safety recall—Audi must fix by law. Takes 2-4 hours.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld reports some failures with NO warning—steering just locks suddenly. Do NOT wait for symptoms. If VIN affected, get recall done ASAP.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'This defect can occur at ANY time—low or high speed. Until recall performed, avoid highway driving and keep emergency flashers accessible.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q3-electrical-infotainment-2019',
    make: 'Audi',
    model: 'Q3',
    years: { start: 2019, end: 2023 },
    title: 'Electrical and Infotainment System Issues',
    severity: 'low',
    description: 'Second-generation Q3 models (2019-2023) experience various electrical gremlins, most commonly with the MMI infotainment system and rearview camera. The infotainment main unit can become damaged internally when the vehicle is shut off, causing the rearview camera display to go black or fail completely. This reduces rear visibility and increases crash risk. Other issues include MMI touchscreen freezing, Apple CarPlay/Android Auto disconnecting, interior trim rattles, and battery drain. Audi issued recall 20V-611 for rearview camera failures. While frustrating, most electrical issues are minor annoyances rather than safety concerns. Some issues improve with software updates.',
    symptoms: [
      'Rearview camera displays black screen or "No Signal"',
      'MMI touchscreen freezes or becomes unresponsive',
      'Infotainment system reboots randomly',
      'Apple CarPlay/Android Auto disconnects frequently',
      'Interior trim rattles from dashboard/door panels',
      'Battery dies after car sits for 3-4 days',
      'Parking sensors malfunction intermittently'
    ],
    solution: 'Rearview camera failure: Covered under RECALL 20V-611—dealer replaces MMI main unit for free. MMI freezing: Perform hard reset (hold power + volume up for 10 seconds). If persistent, dealer can update software ($0-$150). Interior rattles: Apply felt tape to trim panels (DIY or dealer under warranty). Battery drain: Dealer performs parasitic draw test ($100-$200). Android Auto/CarPlay: Use high-quality USB cable (cheap cables cause disconnects). Most electrical issues covered under 4-year/50k warranty.',
    estimatedCost: { min: 0, max: 500 },
    recallInfo: 'RECALL 20V-611 (NHTSA): 2019-2021 Q3 rearview camera failure. Dealer replaces MMI unit for free.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'For rearview camera failure, check VIN for recall 20V-611. If affected, dealer replaces MMI unit for free. Don\'t pay for this repair out-of-pocket.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'MMI hard reset fixes 90% of freezing: Hold power + volume up for 10 seconds. System reboots. If it freezes again, needs software update from dealer.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'For Android Auto/CarPlay disconnects, use Anker Powerline+ cable—cheap cables cause issues. Also clean phone charging port with compressed air.',
        partBrand: 'Anker',
        partName: 'Powerline+ USB-C Cable',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Interior rattles often come from loose speaker grilles or door clips. Remove panels and add thin foam tape at contact points. Easy DIY fix.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Most electrical issues covered under 4-year/50k warranty. Document problems and push dealer for warranty repair. After warranty, learn to live with minor issues.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...q3Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${q3Issues.length} Audi Q3 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
q3Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
