const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const a5Issues = [
  {
    id: 'audi-a5-timing-chain-tensioner-2008',
    make: 'Audi',
    model: 'A5',
    years: { start: 2008, end: 2016 },
    title: 'Timing Chain Tensioner Failure (2.0 TFSI Engine)',
    severity: 'high',
    description: 'The B8/B8.5 A5 with the 2.0 TFSI engine (2008-2016) suffers from premature timing chain tensioner failure, identical to the A4 and A6. The tensioners wear out between 60,000-120,000 miles, causing the timing chain to stretch and rattle. A loud rattling noise on cold start from the front of the engine is the classic warning sign. If ignored, the timing chain can jump timing or break, causing catastrophic valve-to-piston contact and destroying the engine. Early B8 models (2008-2012) are more prone to failure than later B8.5 models (2013-2016). A5OC forum members report many failures under 100,000 miles, with some owners experiencing complete engine destruction. The repair requires removing the front of the engine and costs $2,000-$5,000. Some owners report oil consumption issues leading to accelerated tensioner wear.',
    symptoms: [
      'Loud rattling or clattering noise from front of engine on cold start',
      'Metallic rattling that disappears after 10-30 seconds of warm-up',
      'Check engine light with timing correlation codes (P0016, P0017, P0087)',
      'Rough idle or misfires',
      'Engine won\'t start (if chain has jumped)',
      'Catastrophic engine damage if chain breaks (bent valves, destroyed pistons)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace timing chain, tensioners, and guides at 80,000-100,000 miles BEFORE rattling starts ($2,000-$3,000). If rattling has already begun, DO NOT delay—chain can jump at any moment. Repair requires removing front engine cover, water pump, and thermostat. Labor is 8-12 hours. Use ONLY OEM Audi parts—aftermarket tensioners fail quickly. Change oil every 5,000 miles and check oil level weekly to prevent accelerated wear. If catastrophic failure occurs, engine replacement ($6,000-$10,000) may be more cost-effective than rebuild.',
    estimatedCost: { min: 2000, max: 10000 },
    recallInfo: 'No official recall. Class action settlement covered some 2008-2013 A4/A5 models. Check with Audi dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Rattling on cold start is your ONLY warning. Once it starts, you have weeks to months before catastrophic failure. Do not drive aggressively or take long trips until repair is done.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'A5OC forum consensus: If buying a used B8 A5 (2008-2016) with 2.0 TFSI, assume timing chain needs replacement unless documentation proves otherwise. Factor $2,500 into purchase price.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY genuine Audi timing chain kit. ECS Tuning and FCP Euro sell complete OEM kits for $800-$1,200 (parts only). Aftermarket kits from cheap brands fail within 30k miles.',
        partBrand: 'Audi OEM',
        partName: 'Complete Timing Chain Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Low oil accelerates tensioner failure. Check oil level EVERY fillup. Running even 1 quart low can destroy tensioners in 10,000 miles. Always carry spare oil.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace water pump, thermostat, and serpentine belt during timing chain service—they\'re already accessible and labor is 80% done. Saves $500+ in future labor.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a5-oil-consumption-2008',
    make: 'Audi',
    model: 'A5',
    years: { start: 2008, end: 2015 },
    title: 'Excessive Oil Consumption (2.0 TFSI Engine)',
    severity: 'moderate',
    description: 'The 2.0 TFSI engine in early B8 A5 models (2008-2015) suffers from excessive oil consumption due to defective piston ring design. Owners report burning 1 quart of oil every 500-1,200 miles, requiring constant top-ups. The issue is worst in 2010-2012 models with EA888 Gen 2 engines. Faulty oil control rings fail to scrape oil from cylinder walls, allowing it to burn in the combustion chamber. This causes blue smoke on startup, fouled spark plugs, and carbon buildup. Low oil levels starve the turbocharger and timing chain tensioners, leading to expensive failures. Audi extended warranty coverage for some models and performed piston ring replacements under warranty. A5OC forums report many owners going through 5+ quarts between oil changes. Some cases cause cylinder scoring requiring engine replacement.',
    symptoms: [
      'Low oil warning light frequently (need to add oil between changes)',
      'Burning 1+ quarts of oil every 1,000 miles',
      'Blue or gray smoke from exhaust on startup or hard acceleration',
      'Fouled spark plugs (oil-soaked)',
      'Check engine light with misfire codes (P0300-P0304)',
      'Rough idle from carbon buildup',
      'Turbo whining (from oil starvation)'
    ],
    solution: 'For SEVERE consumption (over 1 qt/1,000 mi): Piston ring replacement or short block replacement ($4,000-$7,000). Check Audi\'s extended warranty program for 2009-2015 models—some repairs covered. For MODERATE consumption: Replace PCV valve ($150), clean carbon deposits with walnut blasting ($800), and switch to thicker oil (5W-40 instead of 5W-30). PREVENTION: Check oil level WEEKLY, change oil every 5,000 miles (NOT 10,000), and avoid 2010-2012 models when buying used. 2015+ Gen 3 EA888 engines have updated rings and are far more reliable.',
    estimatedCost: { min: 150, max: 7000 },
    recallInfo: 'Extended warranty for some 2009-2015 A5 2.0 TFSI models under Audi\'s "Oil Consumption Test Program." Check dealer eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Running low on oil destroys turbocharger ($2,500) and timing chain tensioners (catastrophic engine damage). Check oil EVERY gas fillup. Always carry 2 quarts in trunk.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'A5OC members report switching to 5W-40 or 0W-40 oil reduces consumption. Use Liqui Moly Leichtlauf High Tech 5W-40 or Mobil 1 European 0W-40. Thicker oil helps worn rings seal better.',
        partBrand: 'Liqui Moly',
        partName: 'Leichtlauf High Tech 5W-40',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used B8 A5, insist on oil consumption test: Check oil level, drive 500 miles, recheck. Anything over 1 qt/1,000 mi is a deal-breaker. Walk away or demand $5,000 off price.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Replace PCV valve every 40k-60k miles ($80-$150 DIY). Failed PCV valve increases crankcase pressure and worsens oil consumption. Easy 30-minute job.',
        partBrand: 'Audi OEM',
        partName: 'PCV Valve',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: '2015+ B8.5 A5 models with Gen 3 EA888 engine have updated piston rings and are FAR more reliable. Avoid 2010-2012 models—they have the worst consumption issues.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-s5-supercharger-clutch-2010',
    make: 'Audi',
    model: 'S5',
    years: { start: 2010, end: 2017 },
    title: 'Supercharger Clutch and Isolator Failure (3.0T V6)',
    severity: 'moderate',
    description: 'The 3.0T supercharged V6 in the S5 (2010-2017) uses an electromagnetic clutch to engage the supercharger. Over time, the clutch disc wears out or the torsional isolator (damper) within the supercharger snout fails, creating a loud rattling, grinding, or "bag of marbles" sound from the front of the engine. This is most noticeable on cold starts or under load. The supercharger clutch engages and disengages based on throttle input, and repeated cycling wears the friction material. A failed clutch prevents the supercharger from engaging, causing significant power loss (feels like a naturally aspirated V6). A failed isolator damages internal supercharger components, requiring complete supercharger replacement ($3,000-$5,000). AudiWorld and A5OC forums report failures between 60,000-120,000 miles. Some dealers refuse warranty claims, calling it "wear and tear."',
    symptoms: [
      'Loud rattling, grinding, or "marbles in a can" noise from front of engine',
      'Noise most noticeable on cold start or light throttle',
      'Loss of power (feels slower than expected for S5)',
      'Check engine light with underboost codes (P0234, P0299)',
      'Supercharger whine disappears (clutch not engaging)',
      'Belt squeal or chirp from supercharger pulley',
      'Metal debris in oil (severe cases)'
    ],
    solution: 'If caught EARLY (noise but no power loss): Replace supercharger clutch ($1,200-$2,000 with labor). Clutch can be replaced without removing supercharger. If SEVERE (grinding + power loss): Replace complete supercharger assembly ($3,000-$5,000 installed). Some rebuilders offer rebuilt superchargers for $2,000-$2,500. PREVENTION: Service supercharger oil every 40,000 miles (Audi says "lifetime" but it\'s not). Use high-quality synthetic oil and change every 5,000 miles. Avoid aggressive launches and excessive boost—gentle driving extends clutch life. Budget for this repair if buying a used S5.',
    estimatedCost: { min: 1200, max: 5000 },
    recallInfo: 'No recall. Audi considers supercharger clutch a "wear item" not covered under powertrain warranty.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'DO NOT ignore rattling from supercharger. Driving with failed isolator can shred internal gears, turning a $1,500 clutch job into $5,000 supercharger replacement. Get diagnosed immediately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld reports some owners negotiate extended warranty coverage for supercharger repairs. If you\'re close to warranty expiration, document the noise and push dealer for goodwill assistance.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY OEM Audi supercharger clutch (Eaton/Audi part). Aftermarket clutches fail within 20k miles. Genuine clutch costs $600-$800 (part only) but lasts 80k+ miles.',
        partBrand: 'Audi OEM',
        partName: 'Supercharger Clutch Assembly',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'A5OC members recommend servicing supercharger oil at 40k-60k miles despite Audi saying "lifetime." Fresh oil reduces clutch wear. Costs $200-$300 at independent shop.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used S5, have pre-purchase inspection specifically check for supercharger noise. Start cold engine and listen for rattling. Budget $2,000 for clutch if noise present.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a5-carbon-buildup-2008',
    make: 'Audi',
    model: 'A5',
    years: { start: 2008, end: 2023 },
    title: 'Severe Carbon Buildup on Intake Valves (Direct Injection)',
    severity: 'moderate',
    description: 'All direct-injection engines in the A5 and S5 (2.0 TFSI, 3.0T, and 3.2L V6) suffer from severe carbon buildup on intake valves. In direct-injection engines, fuel sprays directly into the cylinder, bypassing the intake valves. This means intake valves are only exposed to oil vapors from the PCV system, which bake onto the valve backs as hard carbon deposits. Over 60,000-100,000 miles, carbon restricts airflow, causing rough idle, misfires, hesitation, and power loss. The 3.0T supercharged S5 is particularly susceptible due to higher oil vapor pressure. In severe cases, carbon deposits prevent valves from seating properly, causing compression loss and valve damage. The ONLY effective fix is walnut blasting—blasting crushed walnut shells through the intake to remove carbon. A5OC forums recommend this as preventive maintenance every 60,000 miles.',
    symptoms: [
      'Rough or unstable idle (engine shakes at stoplights)',
      'Hesitation or stumbling on acceleration',
      'Reduced power and sluggish throttle response',
      'Poor fuel economy (2-4 MPG drop)',
      'Check engine light with misfire codes (P0300-P0306)',
      'Engine runs rough when cold, smooths out when warm',
      'Hard starting or extended cranking'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast crushed walnut shells through intake ports to remove carbon ($700-$1,200). Requires specialized equipment—DIY not recommended unless experienced. Dealers charge $1,200-$1,800; independent Audi shops charge less. Repeat every 60,000-80,000 miles as preventive maintenance. PREVENTION: Install catch can ($300-$500) to filter PCV oil vapors before they reach intake valves—extends cleaning interval to 100k+ miles. Add Liqui Moly Intake Valve Cleaner to every oil change ($15). Perform "Italian tune-up" monthly (spirited highway driving to high RPM).',
    estimatedCost: { min: 700, max: 1800 },
    recallInfo: 'No recall. Carbon buildup is inherent to direct-injection design across all manufacturers.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install a catch can to filter crankcase oil vapors BEFORE they coat your valves. Mishimoto and APR make quality kits for $300-$500. Can extend carbon cleaning from 60k to 100k+ miles.',
        partBrand: 'Mishimoto',
        partName: 'Baffled Oil Catch Can Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'A5OC members swear by Liqui Moly Intake Valve Cleaner added to every oil change. Won\'t remove heavy carbon but slows buildup significantly. Costs $15/bottle.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blasting done BEFORE rough idle appears as preventive maintenance at 60k-80k miles. Waiting for symptoms means carbon is severe and may have damaged valves.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Italian tune-up helps burn off light carbon: Once a month, safely accelerate hard in 3rd gear from 3,000-6,500 RPM on the highway. High airflow helps dislodge carbon.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER use chemical "pour-in" cleaners (Seafoam, CRC) on direct-injection engines—they don\'t reach the valves and can damage sensors. Only walnut blasting works.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a5-water-pump-2008',
    make: 'Audi',
    model: 'A5',
    years: { start: 2008, end: 2023 },
    title: 'Water Pump and Thermostat Failure',
    severity: 'moderate',
    description: 'Water pump failures are common across all A5 and S5 generations due to plastic impeller degradation and seal leaks. Audi uses plastic impellers that crack or disintegrate over time (typically 80,000-120,000 miles), causing coolant leaks and overheating. The water pump is timing belt/chain driven in many models, so replacement during timing service saves labor. Thermostat housings also crack from heat cycling, causing coolant leaks and erratic temperature readings. Symptoms include coolant puddles under the car, overheating in traffic, and temperature gauge fluctuations. Ignoring a failed water pump can cause severe engine overheating, warped cylinder heads, and blown head gaskets ($3,000-$5,000). The 3.0T S5 also has an electric auxiliary water pump for turbo cooling that fails separately.',
    symptoms: [
      'Coolant leak under front of car (pink/green puddle)',
      'Overheating in stop-and-go traffic or at idle',
      'Temperature gauge rising above normal (middle position)',
      'Coolant warning light or low coolant message',
      'No heat from cabin heater (auxiliary pump failure on S5)',
      'Hissing or gurgling noise from engine bay',
      'Steam or coolant smell from engine'
    ],
    solution: 'Replace water pump AND thermostat together ($800-$1,500). Use OEM or high-quality aftermarket parts (Rein, Hepu, Meyle)—cheap pumps fail within 20k miles. If water pump is timing chain-driven, replace during timing service to save labor. Flush cooling system and refill with OEM Audi G12++ or G13 coolant (do NOT mix types). Inspect hoses and replace if cracked. S5 owners: Replace auxiliary electric water pump separately if heater fails ($300-$600). Monitor coolant level weekly and address leaks immediately.',
    estimatedCost: { min: 800, max: 1500 },
    recallInfo: 'No recall. Water pump replacement is routine maintenance.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'If your A5 has timing chain service coming up, replace water pump at same time—it\'s right there and labor is 80% done. Saves $400-$600 in future labor costs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi or German water pumps (Rein, Hepu). Cheap eBay pumps fail within 20k miles due to poor plastic quality. Genuine pump lasts 100k+ miles. Worth the extra $100.',
        partBrand: 'Rein',
        partName: 'Engine Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER ignore coolant leaks or overheating. Driving with low coolant warps cylinder heads and blows head gaskets—$3,000-$5,000 repair. Pull over if temp gauge rises.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY G12++ or G13 Audi-spec coolant (pink/purple). Do NOT use generic green coolant—damages aluminum. Pentosin and Zerex make Audi-compatible coolant for less than dealer.',
        partBrand: 'Pentosin',
        partName: 'Pentofrost A3 (G13)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'S5 3.0T auxiliary electric water pump ($300-$600) powers cabin heat and turbo cooling. If heater blows cold, aux pump failed. Easy DIY—30 minutes, three bolts.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a5-airbag-ods-recall-2018',
    make: 'Audi',
    model: 'A5',
    years: { start: 2018, end: 2020 },
    title: 'Front Passenger Airbag Deactivation (ODS Recall)',
    severity: 'moderate',
    description: 'The B9 A5 (2018-2020 Coupe, Sportback, and Cabriolet) has a design flaw where the electrical connection for the Occupant Detection System (ODS) in the front passenger seat can loosen over time. This causes the ODS control module to malfunction and incorrectly deactivate the front passenger airbag, even when an adult is seated. If the airbag is deactivated, it will NOT deploy in a crash, putting the passenger at serious risk of injury or death. The dashboard displays "AIRBAG OFF" indicator when this occurs. Audi issued RECALL 69CN (NHTSA 20V-354) affecting 208,332 vehicles. The issue is caused by vibration loosening the electrical connector under the seat. Dealers inspect and secure the connection for free.',
    symptoms: [
      '"AIRBAG OFF" indicator illuminated with adult passenger seated',
      'Passenger airbag warning light on dashboard',
      'ODS fault codes in vehicle diagnostics',
      'Intermittent airbag light (comes and goes)',
      'No symptoms until crash (airbag fails to deploy)'
    ],
    solution: 'This is covered under RECALL 69CN (NHTSA 20V-354). Contact your Audi dealer immediately to schedule free recall repair. The dealer will inspect the ODS electrical connection under the front passenger seat, secure the connector, and verify proper operation. If the control module is damaged, Audi replaces it for free. DO NOT attempt DIY repair—this is a safety-critical system. Check your VIN at Audi\'s recall website to confirm if your vehicle is affected. Recall repair takes 1-2 hours.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'RECALL 69CN (NHTSA 20V-354): 2018-2020 A5 Coupe, Sportback, Cabriolet. Dealer inspects/repairs ODS connection for free.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'SAFETY CRITICAL: Check your VIN immediately at Audi\'s recall website. If affected, schedule recall repair ASAP. Passenger airbag may not deploy in crash—serious injury/death risk.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you see "AIRBAG OFF" with adult passenger, DO NOT drive until recall is performed. The airbag system is malfunctioning. Have dealer tow vehicle for repair under recall.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Recall repair is FREE regardless of warranty status or mileage. Audi must fix for free by law. Takes 1-2 hours—schedule with routine service to save a trip.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT place heavy objects on passenger seat before recall—this can worsen connector damage. Only have adult passengers sit there to verify airbag status.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'A5OC forums report some owners didn\'t receive recall notice. Check VIN manually even if you didn\'t get mail. Audi databases aren\'t perfect—verify yourself.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a5-electrical-infotainment-2017',
    make: 'Audi',
    model: 'A5',
    years: { start: 2017, end: 2023 },
    title: 'Electrical and Infotainment System Issues (B9)',
    severity: 'low',
    description: 'The B9 A5 (2017-2023) experiences various electrical gremlins, most commonly with the MMI infotainment system. The touchscreen freezes, reboots randomly, displays black screen, or becomes unresponsive. Owners also report interior trim rattles and squeaks from the dashboard, door panels, and center console. Other issues include backup camera failures, parking sensor malfunctions, wireless charging pad not working, and Android Auto/Apple CarPlay connectivity problems. Some models experience battery drain from parasitic draw. While frustrating, most electrical issues are minor annoyances rather than safety concerns. Audi issued software updates to address some infotainment bugs. A5OC forums report mixed results—some updates help, others don\'t. Build quality seems inconsistent across production runs.',
    symptoms: [
      'MMI touchscreen freezes or becomes unresponsive',
      'Infotainment system reboots randomly while driving',
      'Black screen on startup (system won\'t boot)',
      'Backup camera shows "No Signal" or black screen',
      'Rattling or creaking noises from dashboard/door panels',
      'Android Auto/Apple CarPlay disconnects randomly',
      'Wireless charging pad doesn\'t charge phone',
      'Battery dies after car sits for 3-4 days'
    ],
    solution: 'Infotainment issues: Perform MMI hard reset (hold power + volume up for 10 seconds). If that fails, dealer can update software ($0-$150). Persistent issues may require MMI unit replacement ($1,500-$2,500). Interior rattles: Dealer can apply felt tape or foam to trim panels under warranty. Out-of-warranty DIY fixes involve removing panels and adding foam tape. Backup camera: Check for software update first, then camera replacement ($400-$800). Battery drain: Dealer performs parasitic draw test to identify faulty module. Android Auto/CarPlay: Use high-quality USB cable (cheap cables cause disconnects). For wireless charging, clean phone case and pad.',
    estimatedCost: { min: 0, max: 2500 },
    recallInfo: 'No recalls for general electrical issues. Some 2023 models had airbag ODS recall (separate issue).',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'For frozen MMI screen, hard reset works 90% of time: Hold MMI power button + volume up button for 10+ seconds. System reboots. If it freezes again, needs software update.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'A5OC reports interior rattles often come from loose speaker grilles, door panel clips, or sunroof trim. Remove panels and add thin foam tape at contact points. Easy DIY fix.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'For Android Auto/CarPlay issues, use Anker Powerline+ USB cable—cheap cables cause random disconnects. Also clean phone charging port with compressed air.',
        partBrand: 'Anker',
        partName: 'Powerline+ USB-C to USB-A Cable',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If battery drains after 3-4 days, invest in Battery Tender trickle charger ($50). Cheaper than hunting down parasitic draw or replacing battery every year.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Most electrical issues are covered under 4-year/50k-mile warranty. Document problems and push dealer for warranty repair. After warranty, live with minor annoyances—repairs are expensive.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...a5Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${a5Issues.length} Audi A5/S5 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
a5Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
