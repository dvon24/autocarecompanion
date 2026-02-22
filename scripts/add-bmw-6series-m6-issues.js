const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmw6SeriesM6Issues = [
  {
    id: 'bmw-m6-s85-rod-bearing-2006',
    make: 'BMW',
    model: 'M6',
    years: { start: 2006, end: 2010 },
    title: 'S85 V10 Rod Bearing Failure (Catastrophic Engine Destruction)',
    severity: 'high',
    description: 'The S85 5.0L V10 engine in the E63 M6 (2006-2010) has catastrophically tight rod bearing clearances (0.001" vs 0.0025" industry standard) with thin OEM bearings that fail prematurely, leading to spun bearings and complete engine destruction. This is the single most critical issue on any BMW M car. OEM bearings are inadequate - they WILL fail, typically between 60,000-100,000 miles, often sooner with track use. Failure modes include sudden loss of oil pressure, knocking, and seized engine. Blackstone Labs oil analysis every 5,000 miles ($30/test) is mandatory to monitor bearing wear metals (copper, lead, tin). If copper levels spike above 30 PPM, bearings are failing and must be replaced immediately. NEVER use OEM bearings as replacements - use ACL Race Bearings with +0.001" extra clearance. Bimmerpost/M5Board consensus: this is MANDATORY preventive maintenance before 70,000 miles.',
    symptoms: [
      'Engine knocking or ticking noise (bearing wear)',
      'Sudden loss of oil pressure (bearing failure in progress)',
      'Metal particles in oil or on magnetic drain plug',
      'Elevated copper/lead/tin in Blackstone Labs oil analysis',
      'Engine seizure (catastrophic failure)',
      'Oil pressure warning light'
    ],
    solution: 'MANDATORY PREVENTIVE REPLACEMENT before 70,000 miles: Replace all 10 rod bearings with ACL Race Bearings 10B1580HX-STD (+0.001" clearance, $200-350) or WPC-treated bearings from Lang Racing, or VAC Motorsports kit VAC-HPRBK-S85, or Turner kit TMS222798, or FCP Euro kit 11247841703KT3. ALSO replace VANOS line 11367838669 and use ARP rod bolts (included in most kits). Cost: $6,500-9,500 preventive. If engine is destroyed from bearing failure: $15,000-32,000 for engine replacement or rebuild. NEVER use OEM bearings as replacements. Use Blackstone Labs oil analysis every 5,000 miles ($30/test) to monitor bearing wear metals.',
    estimatedCost: { min: 6500, max: 32000 },
    recallInfo: 'No official recall despite widespread catastrophic failures. BMW has never acknowledged the bearing clearance design flaw.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'ACL Race Bearings 10B1580HX-STD with +0.001" extra clearance ($200-350) are THE standard replacement. NEVER use OEM bearings. Also consider VAC Motorsports kit VAC-HPRBK-S85 or Turner kit TMS222798.',
        partBrand: 'ACL Race',
        partName: 'Rod Bearings 10B1580HX-STD',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'MANDATORY before 70,000 miles. This is not optional maintenance - it is a question of WHEN the OEM bearings fail, not IF. Budget $6,500-9,500 for preventive replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use Blackstone Labs oil analysis every 5,000 miles ($30/test) to monitor copper, lead, and tin levels. If copper spikes above 30 PPM, bearings are failing - replace immediately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'WPC-treated bearings from Lang Racing offer the best durability for track use. Also replace VANOS line 11367838669 and use ARP rod bolts during the job.',
        partBrand: 'Lang Racing',
        partName: 'WPC-Treated Rod Bearings',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m6-s85-throttle-actuator-2006',
    make: 'BMW',
    model: 'M6',
    years: { start: 2006, end: 2010 },
    title: 'S85 V10 Throttle Actuator Failure (Plastic Gear Stripping)',
    severity: 'moderate',
    description: 'The S85 V10 engine in the E63 M6 (2006-2010) uses individual throttle bodies with internal throttle actuators containing plastic PPA (polyphthalamide) gears that strip over time, typically around 70,000 miles. The plastic gear teeth are gradually worn down by the metal worm drive, causing the throttle body to lose position control. When the gears strip, the affected bank of cylinders loses throttle control, causing limp mode, rough running, and diagnostic codes 2B15 or 2B16 (throttle actuator faults). The S85 has 2 throttle actuators (one per bank of 5 cylinders) - both should be rebuilt at the same time. Beisan Systems sintered metal replacement gears are the permanent fix - they outlast the plastic OEM gears indefinitely. This is a well-documented issue on M5Board and Bimmerpost.',
    symptoms: [
      'Check engine light with codes 2B15 or 2B16 (throttle actuator fault)',
      'Limp mode / reduced power mode',
      'Rough idle or engine running on fewer cylinders',
      'Throttle response becomes erratic or delayed',
      'Engine hesitation on acceleration',
      'One bank of cylinders not responding to throttle input'
    ],
    solution: 'Rebuild throttle actuators using Beisan Systems BS101 sintered metal gear kit ($250/set, need 2 sets for both actuators) for permanent fix. Beisan BS102 full rebuild service available ($300). Alternatively, rebuilt actuators from Euro Power Motorsports ($500-800 each). OEM replacement actuators from BMW cost $2,000-4,500. Total cost: $500-4,500 depending on approach. Beisan Systems sintered metal gears are THE permanent fix - they replace the weak plastic PPA gears with metal gears that will not strip. Always rebuild both actuators simultaneously.',
    estimatedCost: { min: 500, max: 4500 },
    recallInfo: 'No official recall. Well-documented design flaw with plastic gears.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Beisan Systems BS101 sintered metal gear kit ($250/set, need 2) is THE permanent fix. Metal gears replace weak plastic PPA gears and will not strip again.',
        partBrand: 'Beisan Systems',
        partName: 'BS101 Throttle Actuator Gear Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Always rebuild both throttle actuators at the same time - if one has stripped gears, the other is not far behind. Save on labor by doing both.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Beisan BS102 full rebuild service ($300) if you prefer not to DIY. Euro Power Motorsports also sells rebuilt actuators ($500-800 each).',
        partBrand: 'Beisan Systems',
        partName: 'BS102 Rebuild Service',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'OEM BMW replacement actuators use the same plastic gears that will fail again. Only Beisan Systems sintered metal gears are a permanent solution.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-6series-n62-valve-stem-seals-2004',
    make: 'BMW',
    model: '6 Series',
    years: { start: 2004, end: 2010 },
    title: 'N62 Valve Stem Seal Failure (Heavy Oil Consumption & Blue Smoke)',
    severity: 'moderate',
    description: 'The N62 4.4L/4.8L V8 engine in E63/E64 645Ci and 650i (2004-2010) develops hardened valve stem seals that allow oil to leak past the valve guides into the combustion chambers. This causes heavy blue smoke on cold startup (most noticeable after overnight sitting), excessive oil consumption (1+ quart per 1,000 miles), and fouled spark plugs. The valve stem seals harden and crack from heat cycling over time, typically becoming problematic around 80,000-120,000 miles. Traditional repair requires cylinder head removal ($8,000-12,000 at dealer), but the AGA Tools N62 valve stem seal tool kit ($500-700) enables in-car repair without removing the heads, dramatically reducing labor costs. Elring seals 11340029751 ($78 for all 32 seals) are high quality and widely available through FCP Euro.',
    symptoms: [
      'Heavy blue smoke from exhaust on cold startup',
      'Excessive oil consumption (1+ quart per 1,000 miles)',
      'Fouled spark plugs from oil contamination',
      'Oil burning smell from exhaust',
      'Rough idle from oil-fouled plugs',
      'Low oil warnings between oil changes'
    ],
    solution: 'Replace all 32 valve stem seals using Elring seals 11340029751 ($78 for complete set). DIY in-car repair using AGA Tools N62 valve stem seal tool kit ($500-700) avoids cylinder head removal and costs $800-2,000 total. Dealer repair with head removal costs $8,000-12,000. The AGA tool kit allows valve spring compression and seal replacement through the spark plug holes with the heads still on the engine. Check oil every 500-1,000 miles on high-mileage N62 engines and carry spare quart in vehicle.',
    estimatedCost: { min: 800, max: 12000 },
    recallInfo: 'No official recall. Known wear issue on BMW N62 V8 engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Elring valve stem seals 11340029751 ($78 for all 32 seals) - high quality German-made seals available through FCP Euro with lifetime replacement guarantee.',
        partBrand: 'Elring',
        partName: 'Valve Stem Seals 11340029751',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'AGA Tools N62 valve stem seal tool kit ($500-700) enables in-car repair without removing cylinder heads - saves $6,000-10,000 in labor vs dealer head removal.',
        partBrand: 'AGA Tools',
        partName: 'N62 Valve Stem Seal Tool Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check oil consumption before buying E63/E64 645Ci or 650i. Blue smoke on cold startup is the telltale sign - ask seller to cold start the car after sitting overnight.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Carry spare quart of oil and check level every 500-1,000 miles on high-mileage N62 engines. Running low on oil causes catastrophic engine damage.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-6series-n62-coolant-pipe-2004',
    make: 'BMW',
    model: '6 Series',
    years: { start: 2004, end: 2010 },
    title: 'N62 Coolant Transfer Pipe Leak (Engine Valley Pipe)',
    severity: 'high',
    description: 'The N62 V8 engine in E63/E64 645Ci and 650i (2004-2010) has a coolant transfer pipe that runs through the engine valley between the cylinder banks. The front O-ring seal on this pipe fails as early as 40,000 miles, causing coolant to leak into the engine valley where it pools and can cause further damage to wiring, sensors, and other components. The pipe is extremely difficult to access with the engine in the car, making traditional replacement a $3,000-5,000 job requiring intake manifold and extensive component removal. The BimmerFix Stent Repair Kit ($239) is universally recommended by the community as it repairs the leak from underneath without removing the intake manifold, reducing a multi-day job to 2-3 hours. This is one of the most common and expensive issues on N62-powered 6 Series.',
    symptoms: [
      'Coolant loss without visible external leak',
      'Sweet smell from engine bay (coolant burning off)',
      'Coolant pooling in engine valley (visible with endoscope)',
      'Low coolant warnings',
      'Steam from engine bay',
      'Overheating if coolant loss is severe'
    ],
    solution: 'Install BimmerFix Stent Repair Kit ($239) - community gold standard fix that repairs the leak from underneath without removing the intake manifold. Takes 2-3 hours vs multi-day full pipe replacement. Alternatively, full OEM pipe replacement using pipe 11141439975 or URO collapsible pipe kit costs $3,000-5,000 at shop due to extensive labor. Total cost: $239-5,000 depending on approach. BimmerFix stent is universally recommended on Bimmerpost and E63/E64 forums - avoids $3,000-5,000 full pipe replacement labor.',
    estimatedCost: { min: 239, max: 5000 },
    recallInfo: 'No official recall. Extremely well-documented design flaw on N62 V8.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BimmerFix Stent Repair Kit ($239) is the community gold standard - repairs the leak from underneath without removing intake manifold. Saves $3,000-5,000 in labor.',
        partBrand: 'BimmerFix',
        partName: 'Coolant Transfer Pipe Stent Repair Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Front seal can fail as early as 40,000 miles. Check for coolant loss on any N62 6 Series - this is a "when not if" failure on these engines.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use an endoscope ($20-30 on Amazon) to visually inspect the engine valley for coolant pooling before the leak becomes severe.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Shops will quote $3,000-5,000 for full pipe replacement. Ask about BimmerFix stent first - most BMW specialists are familiar with it and can install for $400-600 total.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-6series-smg-pump-2004',
    make: 'BMW',
    model: '6 Series',
    years: { start: 2004, end: 2010 },
    title: 'SMG III Hydraulic Pump Failure (M6 and SMG-Equipped 645Ci/650i)',
    severity: 'high',
    description: 'The SMG (Sequential Manual Gearbox) III hydraulic system in E63 M6 (2006-2010) and SMG-equipped E63/E64 645Ci/650i (2004-2010) suffers from hydraulic pump motor failure. 90% of SMG pump failures are caused by the pump MOTOR (carbon brush dust contamination), NOT the pump itself - but shops commonly misdiagnose and replace the entire pump assembly at $5,000-6,500 OEM cost. The pump motor brushes wear down over time, creating carbon dust that contaminates the motor internals. Motor-only replacement ($200-350) has a 90% success rate and does NOT require hydraulic bleeding. Full pump replacement requires hydraulic system bleeding and is significantly more expensive. MLREng/BimmerWorld offer upgraded pump assemblies ($449) for cases where motor-only replacement is insufficient.',
    symptoms: [
      'SMG warning light on dashboard',
      'Slow or delayed gear shifts',
      'SMG pump running continuously or excessively',
      'Transmission stuck in gear or neutral',
      'Grinding during shifts',
      'Complete loss of gear selection'
    ],
    solution: 'Try pump motor-only replacement FIRST ($200-350 from SMG Society) - 90% success rate and no hydraulic bleed needed. If motor replacement fails, install MLREng/BimmerWorld upgraded pump ($449). OEM full pump replacement 23427571297 costs $5,000-6,500 and should be LAST resort. Total cost: $500-7,700 depending on approach. CRITICAL: 90% of failures are the pump motor, not the full pump - do not let shops misdiagnose and charge $5,000+ when a $350 motor fixes the issue.',
    estimatedCost: { min: 500, max: 7700 },
    recallInfo: 'No official recall. Common failure on all SMG III-equipped BMWs.',
    communityRecommendations: [
      {
        type: 'tip',
        content: '90% of SMG pump failures are the motor only (carbon dust contamination), NOT the full pump. Try motor-only replacement first ($200-350) before spending $5,000+ on full pump.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'SMG Society pump motor replacement ($200-350) - no hydraulic bleed needed for motor-only swap. 90% success rate.',
        partBrand: 'SMG Society',
        partName: 'SMG Pump Motor',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'MLREng/BimmerWorld upgraded pump assembly ($449) for cases where motor-only replacement is insufficient. Better than $5,000+ OEM pump.',
        partBrand: 'BimmerWorld',
        partName: 'Upgraded SMG Pump Assembly',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Shops commonly misdiagnose and quote $5,000-6,500 for full OEM pump 23427571297 when $350 motor replacement solves the issue 90% of the time. Get second opinion.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-6series-n63-timing-chain-2012',
    make: 'BMW',
    model: '6 Series',
    years: { start: 2012, end: 2018 },
    title: 'N63 Timing Chain Stretch & Guide Failure (F12/F13 650i)',
    severity: 'high',
    description: 'The N63 4.4L twin-turbo V8 engine in F12/F13 650i (2012-2018) suffers from premature timing chain stretch and plastic chain guide disintegration caused by the "hot-vee" turbocharger placement (turbos mounted between the cylinder banks). The extreme heat from the turbochargers accelerates degradation of the plastic timing chain guides, which become brittle and can shatter. When the guides fail, the timing chain can jump timing, causing catastrophic piston-to-valve collision and complete engine destruction ($15,000-25,000). BMW issued Technical Service Bulletin SIB 11 16 14 and the N63 Customer Care Package B001314 providing extended warranty coverage for some affected vehicles. Chain stretch is detectable via cold start rattling ("marbles in a tin can" sound) and timing-related diagnostic codes.',
    symptoms: [
      'Rattling noise from engine on cold starts (marbles in tin can)',
      'Engine timing-related fault codes (P0016, P0017)',
      'Check engine light',
      'Loss of power and sluggish acceleration',
      'Engine failure/no start (if chain jumps timing)',
      'Catastrophic piston-to-valve collision (complete failure)'
    ],
    solution: 'Replace timing chain, guides, and tensioners using IWIS timing chain kit 90001521 ($800-1,200) or Turner kit 11317594899KT. CTA timing tool kit CTA-2893 ($200) required for proper installation. Cost: $4,000-15,000 depending on extent of damage. CHECK VIN FOR CUSTOMER CARE PACKAGE COVERAGE FIRST - BMW N63 Customer Care Package B001314 may cover the repair. TSB SIB 11 16 14 addresses this issue. If chain has already jumped timing: complete engine replacement required ($15,000-25,000).',
    estimatedCost: { min: 4000, max: 15000 },
    recallInfo: 'TSB SIB 11 16 14. N63 Customer Care Package B001314 provides extended warranty coverage for some VINs. Check with BMW dealer.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check VIN for N63 Customer Care Package B001314 coverage FIRST before paying out of pocket. Some vehicles covered for timing chain replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'IWIS timing chain kit 90001521 ($800-1,200) is OE manufacturer quality. Also consider Turner kit 11317594899KT. Use CTA timing tool kit CTA-2893 ($200) for proper installation.',
        partBrand: 'IWIS',
        partName: 'Timing Chain Kit 90001521',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you hear rattling on cold start, DO NOT DRIVE. Tow to shop immediately - chain failure can destroy engine within days ($15,000-25,000 replacement).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Hot-vee design accelerates guide degradation. Consider preventive replacement at 80,000-100,000 miles before failure occurs.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-6series-convertible-top-2004',
    make: 'BMW',
    model: '6 Series',
    years: { start: 2004, end: 2018 },
    title: 'Convertible Top Hydraulic Pump & Cylinder Failure (E64/F12)',
    severity: 'moderate',
    description: 'E64 (2004-2010) and F12 (2012-2018) convertible models experience hydraulic top mechanism failures due to pump motor corrosion, seal degradation, and hydraulic cylinder leaks. The convertible top may stop mid-cycle, operate slowly, or refuse to open/close entirely. The hydraulic pump motor is prone to corrosion from moisture intrusion, and the hydraulic cylinders develop seal leaks over time. OEM pump replacement is extremely expensive ($2,000-3,500 for E64 pump 54347154648, similar for F12 pump 54347299838). Top Hydraulics (tophydraulics.com) offers pump and cylinder rebuild services ($600-1,200 with 3-year warranty) that are universally recommended by the E64/F12 community as superior to new OEM parts. Their rebuilt pumps and cylinders often outlast new OEM units.',
    symptoms: [
      'Convertible top stops mid-cycle (partially open/closed)',
      'Top operates very slowly',
      'Hydraulic pump runs continuously but top doesn\'t move',
      'Top refuses to open or close',
      'Hydraulic fluid leaking from cylinders or lines',
      'Warning message: "Convertible top malfunction"'
    ],
    solution: 'Send hydraulic pump and/or cylinders to Top Hydraulics (tophydraulics.com) for rebuild service ($600-1,200 with 3-year warranty). This is universally recommended over new OEM parts. OEM pump replacement: E64 pump 54347154648 ($2,000-3,500), F12 pump 54347299838 (similar cost). Total cost: $600-5,000 depending on approach. Top Hydraulics rebuild service is universally recommended by E64/F12 forums - their rebuilt units often outlast new OEM parts and come with 3-year warranty.',
    estimatedCost: { min: 600, max: 5000 },
    recallInfo: 'No official recall. Common wear item on BMW convertible top hydraulic systems.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Top Hydraulics (tophydraulics.com) rebuild service ($600-1,200 with 3-year warranty) universally recommended over new OEM. Rebuilt units often outlast new OEM parts.',
        partBrand: 'Top Hydraulics',
        partName: 'Hydraulic Pump Rebuild Service',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'OEM hydraulic pumps cost $2,000-3,500 and don\'t last as long as Top Hydraulics rebuilds. Don\'t overpay at dealer for inferior longevity.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Operate the convertible top at least once a month even in winter to keep seals lubricated and prevent pump corrosion from sitting.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If top stops mid-cycle, do NOT force it manually. This can damage the hydraulic cylinders and linkages, turning a $600 repair into a $3,000+ repair.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m6-s63-rod-bearing-2013',
    make: 'BMW',
    model: 'M6',
    years: { start: 2013, end: 2018 },
    title: 'S63 Twin-Turbo V8 Rod Bearing Concerns (F06/F12/F13 M6)',
    severity: 'moderate',
    description: 'The S63 4.4L twin-turbo V8 engine in the F06/F12/F13 M6 (2013-2018) has rod bearing concerns similar to but less catastrophic than the S85 V10. While the S63 bearing clearances are better than the notoriously tight S85, bearings can still wear prematurely under hard driving or track use, especially at high mileage. Bearing wear is accelerated by BMW\'s recommended 10,000-mile oil change intervals (too long for this engine). Preventive rod bearing replacement is recommended at 60,000-80,000 miles for peace of mind, particularly for cars that see track days or spirited driving. Oil changes every 5,000-7,500 miles are mandatory to extend bearing life. ACL Race Rod Bearings 8B1578HX-STD ($150-250) or King Bearings SV Series are the community-recommended upgrades over OEM. WPC-treated bearings from Lang Racing offer the best durability for track use.',
    symptoms: [
      'Faint ticking or knocking noise from bottom end (early wear)',
      'Elevated copper/lead levels in oil analysis',
      'Oil pressure drop at idle when engine is hot',
      'Metal particles on magnetic drain plug',
      'Engine knocking under load (advanced wear)',
      'Catastrophic engine failure (if bearings spin)'
    ],
    solution: 'Preventive rod bearing replacement at 60,000-80,000 miles using ACL Race Rod Bearings 8B1578HX-STD ($150-250), King Bearings SV Series, or WPC-treated bearings from Lang Racing. Cost: $4,000-7,000 for preventive replacement. Oil changes every 5,000-7,500 miles mandatory (ignore BMW\'s 10,000-mile recommendation). Use Blackstone Labs oil analysis ($30/test) every 5,000 miles to monitor bearing wear metals. Preventive replacement recommended for peace of mind, especially on cars used for track days or spirited driving.',
    estimatedCost: { min: 4000, max: 7000 },
    recallInfo: 'No official recall. Preventive maintenance recommended by BMW specialist community.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'ACL Race Rod Bearings 8B1578HX-STD ($150-250) or King Bearings SV Series are community-recommended upgrades over OEM bearings.',
        partBrand: 'ACL Race',
        partName: 'Rod Bearings 8B1578HX-STD',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Preventive replacement at 60,000-80,000 miles recommended for peace of mind. Oil changes every 5,000-7,500 miles mandatory - ignore BMW\'s 10,000-mile recommendation.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'WPC-treated bearings from Lang Racing offer best durability for track use. Worth the premium for cars that see regular track days.',
        partBrand: 'Lang Racing',
        partName: 'WPC-Treated Rod Bearings',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use Blackstone Labs oil analysis ($30/test) every 5,000 miles to monitor copper, lead, and tin levels. Early detection of bearing wear avoids catastrophic engine failure.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmw6SeriesM6Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`\u2713 Successfully added ${bmw6SeriesM6Issues.length} BMW 6 Series / M6 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmw6SeriesM6Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
