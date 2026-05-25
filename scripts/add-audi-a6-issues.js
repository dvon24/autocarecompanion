const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const a6Issues = [
  {
    id: 'audi-a6-timing-chain-tensioner-2005',
    make: 'Audi',
    model: 'A6',
    years: { start: 2005, end: 2011 },
    title: 'Timing Chain Tensioner Failure (3.2L V6 & 4.2L V8)',
    severity: 'high',
    description: 'The C6 A6 with the 3.2L V6 and 4.2L V8 engines suffers from timing chain tensioner failures due to wear over time. Audi designates the chains and tensioners as "lifetime" parts requiring no maintenance, but they fail as early as 80,000-120,000 miles. The 3.2L engine has 4 chains, 3 tensioners, and several guides—all prone to wear. A loud rattling or clicking noise on cold start from the upper rear of the engine is the classic symptom of failing tensioners. If ignored, the timing chain can jump or break, causing catastrophic valve-to-piston contact and complete engine destruction. The transmission must be removed for full access, making this a labor-intensive repair. AudiWorld forums report low-mileage cars with stretched chains due to the design flaw.',
    symptoms: [
      'Rattling or clicking noise from rear of engine on cold start',
      'Metallic clattering that disappears after engine warms up',
      'Check engine light with timing/cam correlation codes (P0016, P0017)',
      'Rough idle or hesitation',
      'Engine won\'t start (if chain has jumped)',
      'Severe engine damage if chain breaks (bent valves, destroyed pistons)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace ALL timing chains, tensioners, and guides at 80,000-100,000 miles before failure occurs. The repair requires removing the transmission for access. Labor is 15-20 hours. Replace oil pump chain as well. Use OEM Audi parts only—aftermarket tensioners fail quickly. If rattling has started, DO NOT delay—engine damage can occur within weeks. Some owners opt for engine replacement ($8,000-$12,000) if severe damage has occurred. Class action settlement may cover some costs for 2004-2008 models.',
    estimatedCost: { min: 3000, max: 12000 },
    recallInfo: 'No official recall. Class action settlement covered some 2004-2008 A6 3.2L models. Similar issue to Q5/Q7—settlement may apply.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Rattling on cold start means tensioner is failing NOW. Do not drive more than necessary—chain can jump at any moment and destroy your engine. Tow to shop if possible.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying a used C6 A6 (2005-2011) with 3.2L or 4.2L engine, check service records for timing chain replacement. If not done, factor $3,000-$5,000 into purchase price and do it IMMEDIATELY.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY OEM Audi timing chain kits. Aftermarket tensioners from cheaper brands fail within 20,000 miles. Genuine Audi parts cost more but last 100k+ miles.',
        partBrand: 'Audi OEM',
        partName: 'Complete Timing Chain Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld forum consensus: 3.2L and 4.2L V8 are ticking time bombs. Budget for this repair or avoid these engine options entirely. The 2.0T and 3.0T supercharged are more reliable choices.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT use synthetic oil with longer intervals (10k miles). Stick to 5,000-mile oil changes with quality oil to extend chain life. Neglected oil changes accelerate tensioner failure.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-multitronic-cvt-failure-2005',
    make: 'Audi',
    model: 'A6',
    years: { start: 2005, end: 2011 },
    title: 'Multitronic CVT Transmission Failure',
    severity: 'high',
    description: 'The Multitronic CVT (continuously variable transmission) used in C6 A6 models is notoriously unreliable and prone to catastrophic failure between 80,000-150,000 miles. The transmission uses a steel chain and hydraulic pressure system that wears over time, causing slipping, shuddering, and complete failure. Symptoms include hesitation on acceleration, jerky shifts, whining noises, or sudden loss of drive. Unlike traditional automatics, CVT failures often require complete transmission replacement—repairs are not cost-effective. Audi discontinued the Multitronic in 2012 due to reliability issues. The transmission fluid is expensive ($30/liter) and requires changes every 40,000 miles, but even with perfect maintenance, failures are common. Many A6 owners in forums report Multitronic failures under 100,000 miles, with replacement costs exceeding the car\'s value.',
    symptoms: [
      'Hesitation or delay when accelerating from a stop',
      'Jerky or shuddering shifts, especially at low speeds',
      'High-pitched whining or buzzing noise from transmission',
      'Slipping feeling when accelerating (RPM rises but no power)',
      'Check engine light with transmission codes (P0730, P0868)',
      'Complete loss of drive (transmission goes into limp mode)',
      'Burning smell from transmission area'
    ],
    solution: 'Once symptoms appear, the Multitronic CVT typically requires COMPLETE REPLACEMENT ($6,000-$10,000 with labor). Rebuilds are rarely successful due to the complex hydraulic system. Preventive maintenance: Change transmission fluid every 40,000 miles with OEM Audi Multitronic fluid ONLY—do NOT use generic CVT fluid. Monitor fluid level regularly. If buying a used C6 A6, AVOID Multitronic models entirely—opt for the S-Tronic or Tiptronic versions instead. Many owners sell or trade the car rather than replace the transmission due to high costs.',
    estimatedCost: { min: 6000, max: 10000 },
    recallInfo: 'No official recall despite widespread failures. Audi discontinued Multitronic in 2012 due to reliability issues.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'AVOID BUYING: If shopping for a used C6 A6 (2005-2011), do NOT buy a Multitronic CVT model. These transmissions WILL fail, and replacement costs more than the car is worth. Look for S-Tronic or manual transmission models.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check transmission type BEFORE buying: Multitronic has "CVT" on the badge. S-Tronic (DSG) and Tiptronic are far more reliable. Walk away from any Multitronic car unless it has recent transmission replacement with documentation.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'If you already own a Multitronic A6, use ONLY genuine Audi Multitronic fluid (G 052 516 A2). Generic CVT fluid causes immediate damage. Fluid changes every 40k miles may extend life, but failure is still likely.',
        partBrand: 'Audi OEM',
        partName: 'Multitronic Transmission Fluid (G 052 516 A2)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Once slipping starts, you have weeks to months before total failure. Start budgeting for transmission replacement or trade-in immediately. Do not invest in expensive repairs for other issues—transmission failure will total the car.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: The Multitronic is Audi\'s biggest reliability mistake. Many owners report failures under 100k miles even with perfect maintenance. Consider this a "when," not "if" repair.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-oil-consumption-2005',
    make: 'Audi',
    model: 'A6',
    years: { start: 2005, end: 2015 },
    title: 'Excessive Oil Consumption (2.0 TFSI Engine)',
    severity: 'moderate',
    description: 'The 2.0 TFSI (EA888 Gen 1 and Gen 2) engines in the A6 C6 (2005-2011) and early C7 (2012-2015) models suffer from excessive oil consumption due to faulty piston rings and PCV valve design. Owners report burning 1 quart of oil every 600-1,200 miles, requiring frequent top-ups. The issue is caused by oil control rings that fail to properly scrape oil from cylinder walls, allowing it to burn in the combustion chamber. Carbon buildup from direct injection worsens the problem. Low oil levels can starve the turbocharger and cause bearing failure, leading to turbo replacement ($2,500+). Early C7 models (2012-2014) had the worst oil consumption; 2015+ Gen 3 EA888 engines are more reliable. Audi issued an extended warranty for some models and performed piston ring replacements under warranty, but many out-of-warranty owners face expensive repairs.',
    symptoms: [
      'Low oil warning light frequently (oil level drops between oil changes)',
      'Need to add 1+ quarts of oil every 1,000-2,000 miles',
      'Blue smoke from exhaust on startup or acceleration',
      'Fouled spark plugs (oil-covered)',
      'Check engine light with misfire codes (P0300-P0304)',
      'Carbon buildup on intake valves causing rough idle',
      'Turbocharger whining or failure (from oil starvation)'
    ],
    solution: 'For EARLY symptoms (consumption under 1 qt/1,000 mi): Try cleaning carbon deposits with CRC Intake Valve Cleaner and replacing PCV valve ($150-$300). For SEVERE consumption (over 1 qt/1,000 mi): Engine requires piston ring replacement or short block replacement ($4,000-$7,000). Audi extended warranty covered this for some 2009-2015 models—check with dealer for eligibility. PREVENTION: Change oil every 5,000 miles (NOT 10,000), use high-quality synthetic oil, and check oil level weekly. Avoid 2012-2014 C7 A6 models when buying used—opt for 2015+ with updated pistons. Monitor oil level religiously to avoid turbo failure.',
    estimatedCost: { min: 300, max: 7000 },
    recallInfo: 'Extended warranty for some 2009-2015 A6 2.0 TFSI models under Audi\'s "Oil Consumption Test Program." Check with dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Check your oil level EVERY fillup. Running low on oil will destroy the turbocharger ($2,500+ repair) and can seize the engine. Always carry spare oil in the trunk.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Many AudiWorld members switched to thicker oil (0W-40 or 5W-40) and report reduced consumption. Use Liqui Moly or Mobil 1 European formula. Thicker oil helps worn rings seal better.',
        partBrand: 'Liqui Moly',
        partName: 'Leichtlauf High Tech 5W-40',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used C7 A6 (2012-2015), insist on oil consumption test. Ask dealer or seller to check oil level, drive 500 miles, and recheck. Anything over 1 qt/1,000 mi is a red flag—walk away.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Replace PCV valve early (every 40k-60k miles) to reduce oil consumption. OEM Audi PCV valve costs $80-$150 and takes 30 minutes to replace. DIY-friendly.',
        partBrand: 'Audi OEM',
        partName: 'PCV Valve',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: '2015+ A6 models with Gen 3 EA888 engine have updated piston rings and are FAR more reliable. Avoid 2012-2014 models unless piston rings have been replaced under warranty.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-s-tronic-dsg-issues-2012',
    make: 'Audi',
    model: 'A6',
    years: { start: 2012, end: 2018 },
    title: 'S-Tronic (DSG) Dual-Clutch Transmission Issues',
    severity: 'moderate',
    description: 'The 7-speed S-Tronic dual-clutch transmission (DSG) in C7 A6 models (2012-2018) experiences jerky shifts, hesitation, and shuddering at low speeds due to clutch wear and mechatronic unit issues. The DSG uses two clutches and a complex hydraulic mechatronic valve body to manage shifts. Symptoms include rough 1st-to-2nd gear shifts, hesitation when accelerating from a stop, and juddering during low-speed parking maneuvers. Audi marketed the S-Tronic as a "sealed for life" transmission, but in reality, the fluid and filter require replacement every 40,000-60,000 miles to prevent overheating and premature clutch wear. Skipping this service causes clutch pack failure ($3,000-$5,000) or mechatronic failure ($2,500-$4,000). Software updates can temporarily improve shift quality, but the underlying mechanical issues often return. Many owners report issues appearing around 60,000-80,000 miles.',
    symptoms: [
      'Jerky or harsh shifts, especially 1st-to-2nd gear',
      'Hesitation or delay when accelerating from a stop',
      'Shuddering or juddering at low speeds (under 20 mph)',
      'Clunking noise when shifting into gear',
      'Rough downshifts when coming to a stop',
      'Check engine light with transmission codes (P0730, P17BF)',
      'Burning smell from transmission (overheating clutches)'
    ],
    solution: 'For EARLY symptoms (rough shifts): Perform S-Tronic fluid and filter service ($400-$600) and request software update from Audi dealer. Fluid change often improves shift quality for 20k-40k miles. For SEVERE shuddering: Replace clutch pack ($3,000-$5,000 with labor) or mechatronic unit ($2,500-$4,000). PREVENTION: Service DSG transmission every 40,000 miles (ignore "lifetime fluid" claim). Use ONLY OEM Audi S-Tronic fluid (G 052 182 A2). Avoid aggressive driving and minimize stop-and-go traffic to extend clutch life. Consider extended warranty if buying used.',
    estimatedCost: { min: 500, max: 5000 },
    recallInfo: 'No recall. Audi issued software updates (TSB 15-13-11) to improve shift quality, but mechanical issues persist.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'SERVICE YOUR DSG! Despite Audi claiming "lifetime fluid," change S-Tronic fluid every 40k-60k miles. Use OEM Audi DSG fluid (G 052 182 A2) ONLY. This $500 service can prevent $3,000+ clutch replacement.',
        partBrand: 'Audi OEM',
        partName: 'S-Tronic DSG Fluid (G 052 182 A2)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Request software update from Audi dealer first—many dealers install updated shift maps that reduce jerking. Update is free and takes 30 minutes. Ask for TSB 15-13-11.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If shuddering persists after fluid change and software update, clutches are worn. Continuing to drive will cause complete clutch failure and leave you stranded. Budget for replacement soon.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Avoid launching the car aggressively (brake-torquing, hard acceleration from stop). DSG clutches are designed for smooth driving, not drag racing. Aggressive use causes premature wear.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld members report DSG is reliable IF serviced regularly. Many cars with 100k+ miles run fine with 40k-mile fluid changes. Neglect is the killer.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-carbon-buildup-2011',
    make: 'Audi',
    model: 'A6',
    years: { start: 2011, end: 2023 },
    title: 'Severe Carbon Buildup on Intake Valves (Direct Injection Engines)',
    severity: 'moderate',
    description: 'All direct-injection engines in the A6 (2.0T TFSI and 3.0T supercharged) suffer from carbon buildup on intake valves due to lack of fuel washing over the valves. In port-injection engines, fuel sprays onto intake valves and cleans them, but direct injection sprays fuel directly into the cylinder, leaving valves exposed to crankcase oil vapors from the PCV system. Over 60,000-100,000 miles, hard carbon deposits accumulate on the back of intake valves, restricting airflow and causing rough idle, misfires, loss of power, and poor fuel economy. The only permanent fix is walnut blasting—a process where crushed walnut shells are blasted through the intake to remove carbon without damaging valves. Symptoms worsen in stop-and-go driving. Some engines develop such severe buildup that valves cannot close properly, requiring valve replacement. AudiWorld members recommend walnut blasting every 60,000-80,000 miles as preventive maintenance.',
    symptoms: [
      'Rough or unstable idle (engine shakes)',
      'Hesitation or stumbling on acceleration',
      'Reduced power and sluggish throttle response',
      'Poor fuel economy (2-4 MPG drop)',
      'Check engine light with misfire codes (P0300-P0306)',
      'Engine runs rough when cold, smooths out when warm',
      'Hard starting or extended cranking'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast crushed walnut shells through intake ports to remove carbon deposits ($600-$1,200). This is a 4-6 hour job requiring specialized equipment—DIY is not recommended. Dealers charge $1,000-$1,500; independent Audi specialists charge less. Repeat every 60,000-80,000 miles as preventive maintenance. PREVENTION: Use high-quality Top Tier gasoline, add Liqui Moly Intake Valve Cleaner every oil change, and perform occasional "Italian tune-up" (spirited highway driving to burn off carbon). Catch can installation ($300-$500) filters crankcase vapors and dramatically reduces carbon buildup.',
    estimatedCost: { min: 600, max: 1500 },
    recallInfo: 'No recall. Carbon buildup is a known issue with all direct-injection engines across the industry.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install a catch can to filter oil vapors from PCV system BEFORE they coat your intake valves. Costs $300-$500 installed and can extend carbon cleaning intervals from 60k to 100k+ miles. DIY kits available.',
        partBrand: 'Mishimoto',
        partName: 'Baffled Oil Catch Can Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Pour into oil fill before draining. Won\'t remove heavy carbon, but slows buildup between walnut blasting services.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Perform walnut blasting BEFORE symptoms appear as preventive maintenance around 60k-80k miles. Waiting for rough idle means carbon is severe and may have damaged valves.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Italian tune-up: Once a month, drive on the highway and floor it in 3rd gear from 3,000-6,500 RPM for 10-15 seconds (safely). High RPM and airflow helps burn off light carbon deposits.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER use chemical "pour-in" intake cleaners (Seafoam, etc.) on direct-injection engines—they don\'t work and can damage sensors. Only walnut blasting removes carbon properly.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-water-pump-failure-2005',
    make: 'Audi',
    model: 'A6',
    years: { start: 2005, end: 2023 },
    title: 'Water Pump and Thermostat Failure (Overheating)',
    severity: 'moderate',
    description: 'Water pump failures are common across all A6 generations due to plastic impeller degradation and seal leaks. Audi uses plastic impellers that crack or disintegrate over time (typically 80,000-120,000 miles), causing coolant leaks and overheating. The water pump is often driven by the timing belt or timing chain, so replacement is recommended during timing service to save labor. Thermostat housings also crack due to heat cycling, causing coolant leaks and erratic temperature readings. Symptoms include coolant leaks under the car, overheating in traffic, temperature gauge fluctuations, and coolant warning lights. Ignoring a failed water pump can lead to severe engine overheating, warped cylinder heads, and blown head gaskets ($3,000-$5,000 repair). Some models have electric auxiliary water pumps that also fail, causing poor heater performance.',
    symptoms: [
      'Coolant leak under front of car (pink/green puddle)',
      'Overheating in stop-and-go traffic or at idle',
      'Temperature gauge rising above normal (middle position)',
      'Coolant warning light or low coolant message',
      'No heat from cabin heater (auxiliary pump failure)',
      'Hissing or gurgling noise from engine bay',
      'Steam or coolant smell from engine'
    ],
    solution: 'Replace water pump AND thermostat together ($800-$1,500 with labor). Always use OEM or high-quality aftermarket parts (Rein, Hepu)—cheap pumps fail within 20,000 miles. If water pump is timing belt/chain driven, replace during timing service to save labor. Flush cooling system and refill with OEM Audi G12++ or G13 coolant (do NOT mix types). Inspect coolant hoses and replace if cracked. If auxiliary electric water pump fails, replace separately ($300-$600). Monitor coolant level weekly and address leaks immediately to prevent overheating damage.',
    estimatedCost: { min: 800, max: 1500 },
    recallInfo: 'No recall. Water pump replacement is considered routine maintenance.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'If your A6 has a timing belt (older models), replace the water pump during timing belt service. Water pump is right there, and labor is already 80% done. Saves $500+ in future labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi or German-made water pumps (Rein, Hepu, Meyle). Cheap eBay pumps fail within 20k miles due to poor plastic quality. Genuine Audi pump lasts 100k+ miles.',
        partBrand: 'Rein',
        partName: 'Engine Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER ignore coolant leaks or overheating. Driving with low coolant will warp cylinder heads and blow head gaskets—$3,000-$5,000 repair. Pull over immediately if temp gauge rises.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY G12++ or G13 Audi-spec coolant (pink or purple). Do NOT use generic green coolant—it damages aluminum components. Pentosin and Zerex make Audi-spec coolant.',
        partBrand: 'Pentosin',
        partName: 'Pentofrost A3 (G13)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Auxiliary electric water pump ($300-$600) powers cabin heat and turbo cooling. If heater blows cold, auxiliary pump has failed. Easy DIY replacement—10mm bolts, 30 minutes.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-pcv-valve-failure-2012',
    make: 'Audi',
    model: 'A6',
    years: { start: 2012, end: 2018 },
    title: 'PCV Valve Failure (Rough Idle and Oil Consumption)',
    severity: 'low',
    description: 'The Positive Crankcase Ventilation (PCV) valve in C7 A6 models (2012-2018) with 2.0T and 3.0T engines is prone to failure, causing rough idle, oil consumption, and check engine lights. The PCV system recirculates crankcase gases back into the intake to burn them, but the valve diaphragm tears or the valve clogs with oil sludge over time. A failed PCV valve creates excessive vacuum in the crankcase, pulling oil past seals and causing leaks. It also disrupts air/fuel ratio, causing rough idle, hesitation, and poor fuel economy. Replacing the PCV valve is a simple 30-minute DIY job that costs $80-$150 for OEM parts. Many owners replace the PCV valve every 40,000-60,000 miles as preventive maintenance to avoid oil consumption issues. A clogged PCV valve also contributes to carbon buildup on intake valves.',
    symptoms: [
      'Rough or shaky idle (especially when cold)',
      'Increased oil consumption (burning 1 qt every 2,000-3,000 miles)',
      'Check engine light with P0171, P0174 (lean mixture codes)',
      'Oil leaks from valve cover gasket or rear main seal',
      'Hesitation or stumbling on light acceleration',
      'Hissing noise from engine bay',
      'Poor fuel economy'
    ],
    solution: 'Replace PCV valve with OEM Audi part ($80-$150). The valve is located on the valve cover and takes 30 minutes to replace (DIY-friendly). Disconnect hose, twist valve counterclockwise, and install new valve. No special tools required. While you\'re there, inspect PCV hoses for cracks and replace if necessary ($20-$50). If oil consumption persists after PCV replacement, piston rings may be worn (see oil consumption issue). Replace PCV valve every 40,000-60,000 miles as preventive maintenance—cheap insurance against bigger problems.',
    estimatedCost: { min: 80, max: 300 },
    recallInfo: 'No recall. PCV valve is considered a maintenance item.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Use ONLY OEM Audi PCV valve. Aftermarket valves fail within 10k-20k miles. Genuine Audi valve lasts 60k+ miles. Part number varies by engine—check ECS Tuning or FCP Euro.',
        partBrand: 'Audi OEM',
        partName: 'PCV Valve',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Super easy DIY repair—10/10 difficulty. Valve twists out by hand, no tools needed. Watch a 5-minute YouTube video and save $200 in dealer labor. Takes longer to drive to dealer than to fix it yourself.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'While replacing PCV valve, inspect all PCV hoses for cracks. Old hoses cause vacuum leaks and same symptoms as failed valve. Replace hoses if brittle ($20-$50 for all).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If rough idle and oil consumption persist after PCV replacement, piston rings are worn. PCV valve is the cheap fix—try this first before expensive piston ring job.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace PCV valve every 40k-60k miles as preventive maintenance. Costs $100 and prevents oil consumption and carbon buildup. Add to service schedule.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-gateway-module-liquid-2019',
    make: 'Audi',
    model: 'A6',
    years: { start: 2019, end: 2022 },
    title: 'Gateway Control Module Failure from Liquid Intrusion (Recall)',
    severity: 'moderate',
    description: 'The C8 A6 (2019-2022) and A6 Allroad (2020-2022) have a design flaw where liquid spilled in the rear seat can seep into the Gateway Control Module (CGM), causing it to short-circuit and shut down the engine. The CGM is located under the rear seat and controls communication between vehicle modules. Liquid intrusion causes electrical shorts, triggering limp mode, loss of power, or complete engine shutdown. This is a SAFETY ISSUE—the car can stall while driving. Audi issued recall 69EI (NHTSA 20V-751) to install a protective cover over the module. If your A6 stalls randomly or goes into limp mode, check for spilled drinks or water under the rear seat. Dealers install a waterproof shield for free under the recall.',
    symptoms: [
      'Engine randomly stalls or shuts off while driving',
      'Limp mode activated (reduced power, won\'t exceed 3,000 RPM)',
      'Check engine light with multiple system fault codes',
      'Electrical malfunctions (windows, lights, infotainment glitching)',
      'Car won\'t start after sitting (CGM failure)',
      'Water or liquid visible under rear seat carpet',
      'Battery drain (CGM draws current when shorted)'
    ],
    solution: 'This issue is covered under RECALL 69EI (NHTSA 20V-751). Contact your local Audi dealer and schedule a free recall repair. The dealer will install a protective cover over the Gateway Control Module under the rear seat to prevent liquid intrusion. If the module is already damaged, Audi will replace it for free under warranty (if within warranty period) or recall. Check rear seat area for spills and dry thoroughly. Avoid placing drinks in rear cupholder without lids. If out of warranty and CGM is damaged, replacement costs $1,500-$2,500.',
    estimatedCost: { min: 0, max: 2500 },
    recallInfo: 'RECALL 69EI (NHTSA 20V-751): 2019-2022 A6 Sedan, 2020-2022 A6 Allroad. Dealer installs protective cover over Gateway Control Module for free.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CHECK YOUR VIN: Visit Audi\'s recall website and enter your VIN to see if this recall applies to your car. Get it fixed ASAP—engine shutting down while driving is a serious safety hazard.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you experience random stalling or limp mode, check under the rear seat for water or spilled drinks. Remove rear seat cushion (pulls up with clips) and inspect for liquid. Dry thoroughly with towels and fan.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'AVOID spilling liquids in rear seat area until recall is performed. Use sealed bottles, no open cups. Tell passengers to be careful with drinks. One spilled coffee can brick your $60,000 car.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld reports some owners didn\'t realize they had liquid under the seat until CGM failed. Check periodically for leaks from sunroof drains or spills. Prevention is key.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Recall repair takes 1-2 hours at dealer. They install a simple plastic shield. Schedule with your next service appointment to save a trip.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a6-electrical-issues-2005',
    make: 'Audi',
    model: 'A6',
    years: { start: 2005, end: 2023 },
    title: 'Electrical Issues (Window Regulators, Door Locks, MMI)',
    severity: 'low',
    description: 'The Audi A6 is prone to various electrical gremlins across all generations, including window regulator failures, door lock actuator failures, MMI/infotainment glitches, and battery drain issues. Window regulators fail due to weak plastic clips in the mechanism, causing windows to drop into the door or move slowly. Door lock actuators wear out, causing doors to unlock randomly, fail to lock, or make grinding noises. MMI (Multi Media Interface) infotainment systems freeze, reboot randomly, or display "SAFE" mode. Battery drain issues (parasitic draw) are common, leaving the car dead after sitting for a few days. Many electrical issues are caused by aging control modules, corroded connectors, or software bugs. While frustrating, most electrical issues are not safety-critical and can be addressed individually as they arise.',
    symptoms: [
      'Window drops into door or won\'t roll up/down',
      'Door locks fail to lock or unlock (one or more doors)',
      'Grinding or clicking noise from door when locking',
      'MMI screen freezes, reboots, or shows "SAFE" mode',
      'Battery dies after car sits for 2-3 days',
      'Warning lights for systems that work fine (phantom codes)',
      'Backup camera, parking sensors, or adaptive cruise intermittent'
    ],
    solution: 'Window regulator replacement: $300-$600 per window (DIY $150-$250 with aftermarket kit). Order regulator with metal clips, not plastic. Door lock actuator: $200-$400 per door at dealer, DIY $50-$100 per actuator (1-hour job). MMI/infotainment glitches: Perform hard reset (hold power + volume up for 10 seconds). If that fails, Audi dealer can update software or replace MMI unit ($1,000-$2,500). Battery drain: Have dealer perform parasitic draw test to identify faulty module. Common culprits: trunk electronics, MMI, comfort control module. Address issues as they arise—most are minor annoyances, not showstoppers.',
    estimatedCost: { min: 100, max: 2500 },
    recallInfo: 'No recalls for general electrical issues. Some recalls for specific backup camera, fuel sender, and instrument cluster software bugs (C8 models).',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Buy window regulator kits with METAL clips, not plastic. Dorman and URO make upgraded metal regulators that last longer than OEM. Costs same price, lasts 2x longer.',
        partBrand: 'Dorman',
        partName: 'Window Regulator (Metal Clips)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Door lock actuators are easy DIY—remove door panel, unplug actuator, install new one. YouTube has detailed guides. Save $200+ in dealer labor. Takes 1 hour per door.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'For battery drain, invest in a Battery Tender trickle charger ($50). If car sits more than 3-4 days, plug it in. Cheaper than replacing battery every year or hunting down parasitic draw.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'MMI "SAFE" mode is an anti-theft lockout. Requires dealer to unlock with code. Do NOT try to DIY fix—you\'ll make it worse. Take to Audi dealer with proof of ownership.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: Electrical issues are annoying but not catastrophic. Budget $500-$1,000/year for misc electrical repairs on older A6s. Comes with the German luxury car territory.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...a6Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${a6Issues.length} Audi A6 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
a6Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
