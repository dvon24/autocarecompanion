const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const a7Issues = [
  {
    id: 'audi-a7-timing-chain-tensioner-2012',
    make: 'Audi',
    model: 'A7',
    years: { start: 2012, end: 2018 },
    title: 'Timing Chain Tensioner Failure (3.0T Supercharged)',
    severity: 'high',
    description: 'The C7 A7 and S7 with the 3.0T supercharged V6 (2012-2018) suffer from timing chain tensioner failures, particularly in early production models (2012-2013). The tensioners wear out between 80,000-120,000 miles, causing the timing chain to rattle on cold starts. If the rattle lasts longer than 3-5 seconds, it indicates guide or chain stretch requiring immediate attention. If ignored, the chain can jump timing, causing catastrophic valve-to-piston contact and destroying the engine. AudiWorld forums show many owners experiencing this issue, with repair costs ranging from $3,000-$5,000. Later 2014-2017 facelift models have improved tensioners and are more reliable. The repair requires removing the front of the engine and is labor-intensive.',
    symptoms: [
      'Loud rattling from front of engine on cold start (lasting 3-5+ seconds)',
      'Metallic clattering that disappears after warm-up',
      'Check engine light with timing correlation codes (P0016, P0017)',
      'Rough idle or misfires',
      'Engine won\'t start (if chain has jumped)',
      'Catastrophic engine damage (bent valves, destroyed pistons)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace timing chains, tensioners, and guides at 80,000-100,000 miles BEFORE rattling starts ($3,000-$5,000). If rattling has already begun, DO NOT delay—chain can jump at any moment. Repair requires removing front engine cover. Labor is 12-15 hours due to packaging. Use ONLY OEM Audi parts—aftermarket tensioners fail quickly. Change oil every 5,000 miles with high-quality synthetic to extend tensioner life. If catastrophic failure occurs, engine replacement ($8,000-$12,000) may be more cost-effective than rebuild. Avoid 2012-2013 models when buying used—opt for 2014+ with updated parts.',
    estimatedCost: { min: 3000, max: 12000 },
    recallInfo: 'No official recall. Some coverage under extended warranty or class action settlement. Check with Audi dealer.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: If cold-start rattle lasts MORE than 5 seconds, tensioner is failing NOW. Do not drive hard or take long trips. Chain can jump and destroy engine within weeks.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'AudiWorld consensus: Avoid 2012-2013 A7/S7 models—highest failure rate. 2014-2017 facelift models have updated tensioners and are significantly more reliable.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY genuine Audi timing chain kit. Complete OEM kit costs $1,200-$1,800 (parts only). Aftermarket kits fail within 30k miles—not worth the savings.',
        partBrand: 'Audi OEM',
        partName: 'Complete Timing Chain Kit (3.0T)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change oil every 5,000 miles (NOT 10,000) and check level weekly. Low oil accelerates tensioner wear. Use quality synthetic like Liqui Moly or Mobil 1 European formula.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used C7 A7, budget $4,000 for timing chain service or verify it was already done. Factor into purchase price or walk away.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a7-carbon-buildup-2012',
    make: 'Audi',
    model: 'A7',
    years: { start: 2012, end: 2023 },
    title: 'Severe Carbon Buildup on Intake Valves (Direct Injection)',
    severity: 'moderate',
    description: 'All A7 models with direct-injection engines (2.0T, 3.0T supercharged) suffer from severe carbon buildup on intake valves. The 3.0T CREC engine in S7 and RS7 models is particularly susceptible and will likely fail after 60,000 miles if carbon is not removed. In direct-injection engines, fuel bypasses the intake valves, leaving them exposed only to oil vapors from the PCV system. These vapors bake onto valve backs as hard carbon deposits over 60,000-100,000 miles. Carbon restricts airflow, causing rough idle, misfires, hesitation, and power loss. In severe cases, carbon prevents valves from seating properly, causing compression loss and valve damage requiring engine replacement. AudiWorld reports the ONLY effective fix is walnut blasting every 60,000 miles. This is preventive maintenance, not a "if needed" repair.',
    symptoms: [
      'Rough or unstable idle (engine shakes)',
      'Hesitation or stumbling on acceleration',
      'Significant power loss (especially noticeable on S7/RS7)',
      'Poor fuel economy (3-5 MPG drop)',
      'Check engine light with misfire codes (P0300-P0306)',
      'Engine runs rough when cold, smooths when warm',
      'Hard starting or extended cranking'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast crushed walnut shells through intake ports to remove carbon ($800-$1,500 for A7; $1,200-$2,000 for S7/RS7 due to complexity). Requires specialized equipment—not DIY-friendly. Repeat every 60,000 miles as PREVENTIVE maintenance—do not wait for symptoms. PREVENTION: Install catch can ($400-$600) to filter PCV oil vapors—extends cleaning interval to 100k+ miles. Add Liqui Moly Intake Valve Cleaner to every oil change ($15). Perform "Italian tune-up" monthly (safe spirited driving to redline). Change oil every 5,000 miles to reduce PCV vapor contamination.',
    estimatedCost: { min: 800, max: 2000 },
    recallInfo: 'No recall. Carbon buildup is inherent to all direct-injection engines across manufacturers.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'S7/RS7 owners: The 3.0T CREC engine WILL fail from carbon buildup if not cleaned by 60k miles. This is NOT optional maintenance—it\'s required to prevent $10k+ engine damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Install catch can to filter crankcase vapors BEFORE they coat valves. APR and Mishimoto make A7-specific kits for $400-$600. Extends cleaning from 60k to 100k+ miles.',
        partBrand: 'APR',
        partName: 'Baffled Oil Catch Can System',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blasting at 60k miles as preventive maintenance, BEFORE symptoms appear. Waiting for rough idle means carbon is severe and may have damaged valves.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Won\'t remove heavy carbon but dramatically slows buildup. $15/bottle—cheapest prevention available.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER use chemical "pour-in" cleaners (Seafoam, CRC) on direct-injection engines—they don\'t reach valves and can damage sensors. Only walnut blasting works.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a7-supercharger-clutch-2012',
    make: 'Audi',
    model: 'S7',
    years: { start: 2012, end: 2018 },
    title: 'Supercharger Clutch and Isolator Failure (S7 3.0T)',
    severity: 'moderate',
    description: 'The S7 with the 3.0T supercharged V6 (2012-2018) uses an electromagnetic clutch to engage the supercharger. Over time, the clutch disc wears out or the torsional isolator (damper) fails, creating a loud rattling, grinding, or "bag of marbles" sound from the front of the engine. This is most noticeable on cold starts or under load. A failed clutch prevents the supercharger from engaging, causing significant power loss. A failed isolator damages internal supercharger components, requiring complete supercharger replacement. Oil contamination accelerates wear—if oil becomes contaminated with dirt or debris, it causes premature failure of internal components. AudiWorld forums report failures between 60,000-120,000 miles, with repair costs of $1,500-$5,000.',
    symptoms: [
      'Loud rattling, grinding, or "marbles" noise from front of engine',
      'Noise most noticeable on cold start or light throttle',
      'Significant power loss (feels like naturally aspirated V6)',
      'Check engine light with underboost codes (P0234, P0299)',
      'Supercharger whine disappears (clutch not engaging)',
      'Belt squeal from supercharger pulley',
      'Metal debris in oil (severe internal damage)'
    ],
    solution: 'If caught EARLY (noise but no power loss): Replace supercharger clutch ($1,500-$2,500 with labor). Clutch can be replaced without removing supercharger. If SEVERE (grinding + power loss): Replace complete supercharger assembly ($3,500-$5,000 installed). PREVENTION: Service supercharger oil every 40,000 miles despite Audi saying "lifetime." Change engine oil every 5,000 miles with high-quality synthetic. Avoid aggressive launches—gentle driving extends clutch life. Budget for this repair if buying a used S7.',
    estimatedCost: { min: 1500, max: 5000 },
    recallInfo: 'No recall. Audi considers supercharger clutch a "wear item" not covered under powertrain warranty.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'DO NOT ignore rattling from supercharger. Driving with failed isolator shreds internal gears, turning $1,500 clutch job into $5,000 supercharger replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY OEM Audi supercharger clutch. Aftermarket clutches fail within 20k miles. Genuine clutch costs $700-$900 (part only) but lasts 80k+ miles.',
        partBrand: 'Audi OEM',
        partName: 'Supercharger Clutch Assembly',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Service supercharger oil at 40k-60k miles despite Audi saying "lifetime." Fresh oil reduces clutch wear. Costs $200-$300 at independent Audi shop.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used S7, have pre-purchase inspection specifically check for supercharger noise. Start cold and listen for rattling. Budget $2,000 for clutch if noise present.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change oil every 5,000 miles (NOT 10,000). Clean oil prevents turbo oil coking and supercharger contamination. Use Liqui Moly or Mobil 1 European formula.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a7-dsg-transmission-2012',
    make: 'Audi',
    model: 'A7',
    years: { start: 2012, end: 2018 },
    title: 'S-Tronic DSG Transmission Issues (C7)',
    severity: 'moderate',
    description: 'Early C7 A7 models (2012-2013) with the 7-speed S-Tronic dual-clutch transmission experience jerky shifts, hesitation, and shuddering at low speeds due to clutch wear and mechatronic unit issues. The DSG uses two clutches and a complex hydraulic mechatronic valve body. Symptoms include rough 1st-to-2nd gear shifts, hesitation when accelerating from a stop, and juddering during low-speed parking. Audi marketed the S-Tronic as "sealed for life," but fluid and filter require replacement every 40,000-60,000 miles to prevent overheating and premature clutch wear. Skipping this service causes clutch pack failure or mechatronic failure. Later 2014-2017 models are more reliable. AudiWorld reports issues appearing around 60,000-80,000 miles.',
    symptoms: [
      'Jerky or harsh shifts, especially 1st-to-2nd gear',
      'Hesitation or delay when accelerating from a stop',
      'Shuddering or juddering at low speeds (under 20 mph)',
      'Clunking noise when shifting',
      'Rough downshifts when coming to a stop',
      'Check engine light with transmission codes (P0730, P17BF)',
      'Burning smell from transmission'
    ],
    solution: 'For EARLY symptoms (rough shifts): Perform DSG fluid and filter service ($500-$700) and request software update from Audi dealer. Fluid change often improves shift quality. For SEVERE shuddering: Replace clutch pack ($3,500-$5,500) or mechatronic unit ($2,500-$4,000). PREVENTION: Service DSG every 40,000 miles—ignore "lifetime fluid" claim. Use ONLY OEM Audi S-Tronic fluid (G 052 182 A2). Avoid aggressive driving. Consider extended warranty if buying used.',
    estimatedCost: { min: 500, max: 5500 },
    recallInfo: 'No recall. Audi issued software updates (TSB 15-13-11) to improve shift quality.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'SERVICE YOUR DSG! Despite Audi saying "lifetime fluid," change it every 40k miles. Use OEM Audi fluid (G 052 182 A2) ONLY. This $600 service prevents $4,000+ clutch replacement.',
        partBrand: 'Audi OEM',
        partName: 'S-Tronic DSG Fluid (G 052 182 A2)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Request software update from Audi dealer first—often free and improves shift quality. Ask for TSB 15-13-11.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Avoid 2012-2013 A7 models when buying used—highest DSG failure rate. 2014+ models are more reliable.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If shuddering persists after fluid change and software update, clutches are worn. Continuing to drive will cause complete failure. Budget for replacement soon.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Avoid launching the car aggressively. DSG clutches are designed for smooth driving, not drag racing. Aggressive use causes premature wear.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a7-gateway-module-recall-2019',
    make: 'Audi',
    model: 'A7',
    years: { start: 2019, end: 2022 },
    title: 'Gateway Control Module Liquid Intrusion (Recall)',
    severity: 'moderate',
    description: 'Second-generation C8 A7 models (2019-2022) have a design flaw where liquid spilled in the rear seat can seep into the Gateway Control Module (CGM) under the seat, causing it to short-circuit and shut down the engine while driving. The CGM controls communication between vehicle modules. Liquid intrusion causes electrical shorts, triggering limp mode, loss of power, or complete engine shutdown. This is a SAFETY ISSUE—the car can stall while driving. Audi issued recall 69EI (NHTSA 20V-751) to install a protective cover. Identical issue to A6. If your A7 stalls randomly or goes into limp mode, check for spilled drinks or water under the rear seat.',
    symptoms: [
      'Engine randomly stalls or shuts off while driving',
      'Limp mode activated (reduced power, won\'t exceed 3,000 RPM)',
      'Check engine light with multiple system fault codes',
      'Electrical malfunctions (windows, lights, infotainment glitching)',
      'Car won\'t start after sitting',
      'Water or liquid visible under rear seat carpet',
      'Battery drain (CGM draws current when shorted)'
    ],
    solution: 'This is covered under RECALL 69EI (NHTSA 20V-751). Contact Audi dealer and schedule free recall repair. Dealer installs protective cover over Gateway Control Module under rear seat. If module is already damaged, Audi replaces it for free under warranty (if within warranty period) or recall. Check rear seat area for spills and dry thoroughly. Avoid placing drinks in rear cupholder without lids. If out of warranty and CGM is damaged, replacement costs $1,500-$2,500.',
    estimatedCost: { min: 0, max: 2500 },
    recallInfo: 'RECALL 69EI (NHTSA 20V-751): 2019-2022 A7. Dealer installs protective cover over Gateway Control Module for free.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CHECK YOUR VIN: Visit Audi\'s recall website and enter VIN to see if this recall applies. Get it fixed ASAP—engine shutting down while driving is serious safety hazard.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you experience random stalling or limp mode, check under rear seat for water or spilled drinks. Remove seat cushion (pulls up) and inspect for liquid. Dry thoroughly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'AVOID spilling liquids in rear seat until recall is performed. Use sealed bottles, no open cups. One spilled drink can brick your $70,000 car.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check periodically for leaks from sunroof drains or spills. Many owners didn\'t realize they had liquid under seat until CGM failed.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Recall repair takes 1-2 hours at dealer. They install simple plastic shield. Schedule with next service appointment to save a trip.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-a7-phev-battery-overheating-2022',
    make: 'Audi',
    model: 'A7',
    years: { start: 2022, end: 2022 },
    title: 'PHEV High-Voltage Battery Overheating (Safety Recall)',
    severity: 'high',
    description: 'The 2022 Audi A7 PHEV (plug-in hybrid) has a critical defect where the high-voltage battery can overheat, posing a FIRE RISK. Battery overheating can cause thermal runaway, leading to fire even when the vehicle is parked and turned off. Audi issued recall 23V-942 (NHTSA) and instructed owners to STOP CHARGING their vehicles immediately until the final remedy is available (anticipated second quarter 2025). Dealers will install advanced diagnostic software to monitor battery temperature. This is one of the most serious recalls affecting the A7—battery fires are life-threatening and can occur without warning. Only affects 2022 A7 PHEV models.',
    symptoms: [
      'Battery overheating warning message',
      'Burning smell from rear of vehicle',
      'Reduced electric range',
      'Battery fails to charge or charges slowly',
      'Smoke from battery compartment (CRITICAL—evacuate immediately)',
      'No symptoms until fire occurs (thermal runaway can happen without warning)'
    ],
    solution: 'This is covered under RECALL 23V-942 (NHTSA). DO NOT CHARGE YOUR 2022 A7 PHEV until recall repair is completed. Contact Audi dealer IMMEDIATELY. Audi will install diagnostic software to monitor battery temperature. Final remedy anticipated Q2 2025. Park vehicle OUTSIDE away from structures until repair is done—battery fires can occur while parked. If you see smoke or smell burning, evacuate immediately and call 911. Do NOT attempt to extinguish battery fire yourself. This is a CRITICAL SAFETY RECALL—prioritize above all other repairs.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'RECALL 23V-942 (NHTSA): 2022 A7 PHEV high-voltage battery overheating. DO NOT CHARGE until recall repair completed. Final remedy Q2 2025.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'LIFE-THREATENING: If you own 2022 A7 PHEV, DO NOT CHARGE THE BATTERY until recall is completed. Battery can overheat and cause fire even when parked.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Park vehicle OUTSIDE away from garage, house, and other vehicles. Battery fires can occur while parked and turned off. Fire can spread to structures.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you see smoke or smell burning from battery compartment, evacuate immediately and call 911. Do NOT open trunk or attempt to extinguish—battery fires are extremely dangerous.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Contact Audi dealer immediately to verify if your VIN is affected. Recall repair is FREE and MANDATORY. Do not delay—this is a fire hazard.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Until final remedy is available (Q2 2025), operate A7 PHEV in hybrid mode only. Do not plug in to charge. Use gasoline engine for all driving.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...a7Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${a7Issues.length} Audi A7/S7 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
a7Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
