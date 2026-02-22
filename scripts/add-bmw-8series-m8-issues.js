const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmw8SeriesM8Issues = [
  {
    id: 'bmw-8series-n63tu3-valve-stem-seals-2019',
    make: 'BMW',
    model: '8 Series',
    years: { start: 2019, end: 2024 },
    title: 'N63TU3 Valve Stem Seal Failure & Oil Consumption (M850i)',
    severity: 'high',
    description: 'The N63TU3 4.4L twin-turbo V8 in M850i models suffers from premature valve stem seal degradation caused by the hot-V turbo placement. Turbochargers mounted between the cylinder banks create extreme heat that accelerates valve stem seal hardening and failure, allowing oil to leak past valve guides into combustion chambers. Oil consumption of 1 quart per 1,000-2,000 miles is common. BMW issued TSB MC-10149960-9999 addressing this issue, and there is an N63 class action settlement for affected owners. The hot-V design, while beneficial for performance and packaging, creates a hostile thermal environment for seals and gaskets. Fouled spark plugs from oil contamination cause misfires and rough running. Bimmerpost consensus: monitor oil consumption closely and document for potential warranty or class action eligibility.',
    symptoms: [
      'Increased oil consumption (1+ quart per 1,000-2,000 miles)',
      'Blue smoke from exhaust on startup or hard acceleration',
      'Fouled spark plugs from oil contamination',
      'Rough idle and misfires from oil-fouled plugs',
      'Oil burning smell from exhaust',
      'Low oil warnings between oil changes'
    ],
    solution: 'Replace valve stem seals ($3,500-$10,000 due to labor-intensive hot-V access). Use OEM Victor Reinz seals for durability. Replace spark plugs (Bosch 12120037581) when performing seal replacement. AGA Tools N63 Valve Stem Seal Kit AGA-N63-VSK-K ($500-800) provides specialized tooling for this job. Check VIN eligibility for N63 class action settlement which may cover repair costs. PREVENTIVE: Use quality synthetic oil (BMW LL-01 spec), change every 5,000-7,500 miles, and monitor oil level every 500-1,000 miles on M850i models.',
    estimatedCost: { min: 3500, max: 10000 },
    recallInfo: 'TSB MC-10149960-9999. N63 class action settlement may cover repair costs - check VIN eligibility with BMW dealer.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM Victor Reinz valve stem seals are the correct replacement. AGA Tools N63 VSS Kit AGA-N63-VSK-K ($500-800) provides specialized tooling for hot-V access.',
        partBrand: 'Victor Reinz',
        partName: 'Valve Stem Seals',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check VIN eligibility for N63 class action settlement before paying out of pocket. Many M850i owners have received coverage for valve stem seal repairs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Replace spark plugs with Bosch 12120037581 when performing valve stem seal replacement - oil-fouled plugs cause misfires and must be replaced.',
        partBrand: 'Bosch',
        partName: 'Spark Plugs 12120037581',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Document all oil consumption with dated receipts and photos - critical for N63 class action settlement claims and warranty disputes.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-8series-n63tu3-timing-chain-2019',
    make: 'BMW',
    model: '8 Series',
    years: { start: 2019, end: 2024 },
    title: 'N63TU3 Timing Chain Guide Wear (M850i)',
    severity: 'high',
    description: 'The N63TU3 4.4L twin-turbo V8 in M850i models uses plastic timing chain guides that wear prematurely under the extreme heat and stress of the hot-V configuration. As the plastic guides wear, the timing chain develops slack, causing rattling on cold starts and eventually risking timing chain skip or failure. Chain skip causes piston-to-valve collision and catastrophic engine destruction ($15,000-$25,000 replacement). While the N63TU3 has improved guides over earlier N63 versions, the fundamental plastic guide material still degrades from heat cycling. Turner Motorsport offers a complete timing chain guide kit (11317594899KT) with all necessary components. Bimmerpost consensus: replace timing chain guides preventively at 80,000-100,000 miles on N63TU3 engines before catastrophic failure.',
    symptoms: [
      'Rattling noise from engine on cold starts (sounds like marbles in a tin can)',
      'Engine timing-related fault codes (P0016, P0017)',
      'Loss of power and sluggish acceleration',
      'Check engine light',
      'Rough idle that improves after warm-up',
      'Catastrophic engine failure if chain skips (no start, piston damage)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: Replace timing chain guides, tensioners, and chain at 80,000-100,000 miles ($4,000-$7,500). Turner Motorsport timing chain kit 11317594899KT includes all necessary components. Individual parts: chain guides 11147574373, 11317574397, 11317592850, 11317592877; chain 11317598263. If chain has already skipped: engine damage likely requires $15,000-$25,000 engine replacement. CRITICAL: If you hear cold-start rattling, do NOT drive - tow to shop immediately to prevent catastrophic engine failure.',
    estimatedCost: { min: 4000, max: 7500 },
    recallInfo: 'No official recall. Known wear issue on N63TU3 engines. Check with dealer for potential goodwill coverage.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Turner Motorsport timing chain kit 11317594899KT includes all guides, tensioners, and chain - complete solution for preventive replacement.',
        partBrand: 'Turner Motorsport',
        partName: 'Timing Chain Kit 11317594899KT',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you hear rattling on cold start, DO NOT DRIVE. Tow to shop immediately - chain failure can destroy engine within days ($15k-25k repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace timing chain guides preventively at 80,000-100,000 miles. Cost of preventive replacement ($4k-7.5k) is far less than engine replacement ($15k-25k).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Individual guide part numbers: 11147574373, 11317574397, 11317592850, 11317592877. Chain: 11317598263. Order all together for complete job.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m8-s63tu4-rod-bearing-2020',
    make: 'BMW',
    model: 'M8',
    years: { start: 2020, end: 2024 },
    title: 'S63TU4 Rod Bearing Wear (M8/M8 Competition)',
    severity: 'high',
    description: 'The S63TU4 4.4L twin-turbo V8 in M8 and M8 Competition models suffers from premature rod bearing wear due to tight bearing clearances combined with extreme heat and boost pressure stress. The factory bearings are spec\'d with minimal clearance for NVH (noise/vibration/harshness) reduction, but this leaves insufficient oil film thickness under high-load, high-heat conditions common in spirited driving or track use. Rod bearing failure can result in catastrophic engine seizure and connecting rod through the block ($20,000-$40,000 engine replacement). This issue affects all BMW S-series V8 engines (S63/S65) and is well-documented on Bimmerpost. Preventive rod bearing replacement costs $5,000-$8,000 vs. $20,000-$40,000 for catastrophic failure. Regular oil analysis through Blackstone Labs ($30/sample) can detect early bearing wear through copper and lead content in oil.',
    symptoms: [
      'Faint knocking or tapping noise from bottom end of engine',
      'Metallic debris in oil filter during oil changes',
      'Elevated copper and lead levels in oil analysis reports',
      'Engine knock under load or high RPM',
      'Low oil pressure warning (late-stage failure)',
      'Catastrophic engine seizure (complete failure - rod through block)'
    ],
    solution: 'PREVENTIVE: Replace rod bearings every 60,000-80,000 miles or sooner if tracked ($5,000-$8,000). Use ACL Race bearings 8B1578HX-STD ($200-350) which have wider clearance tolerances than OEM for better oil film protection. Monitor bearing health with Blackstone Labs oil analysis ($30/sample) every oil change - elevated copper/lead indicates bearing wear starting. If bearings have failed: engine replacement required ($20,000-$40,000). CRITICAL: If you hear any knocking from bottom end, stop driving immediately and tow to shop.',
    estimatedCost: { min: 5000, max: 40000 },
    recallInfo: 'No official recall. Well-documented issue on all BMW S-series V8 engines (S63/S65). Check Bimmerpost for latest technical information.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'ACL Race bearings 8B1578HX-STD ($200-350) have wider clearance tolerances than OEM for better oil film protection under high-load conditions.',
        partBrand: 'ACL Race',
        partName: 'Rod Bearings 8B1578HX-STD',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Send oil sample to Blackstone Labs ($30/sample) every oil change to monitor copper and lead levels - early warning of bearing wear before catastrophic failure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you track your M8 or drive aggressively, replace rod bearings preventively at 50,000 miles. Track use accelerates bearing wear significantly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Preventive rod bearing replacement ($5k-8k) is 75-85% cheaper than catastrophic failure repair ($20k-40k). Budget for this as routine M8 ownership cost.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-8series-zf-8hp-mechatronic-2019',
    make: 'BMW',
    model: '8 Series',
    years: { start: 2019, end: 2024 },
    title: 'ZF 8HP Transmission Mechatronic Issues (All 8 Series & M8)',
    severity: 'moderate',
    description: 'The ZF 8HP automatic transmission used across all 8 Series and M8 models develops mechatronic sleeve seal issues and fluid degradation over time. The rubber sealing sleeves connecting the mechatronic valve body to the transmission case harden from heat cycling, causing ATF leaks and erratic shifting. Additionally, BMW\'s "lifetime" fluid recommendation is misleading - transmission fluid degrades and should be changed every 50,000 miles. For 2023 models specifically, BMW issued Recall 23V-821 for a weld seam defect in the transmission case that can cause fluid leaks and transmission failure. Despite these issues, the ZF 8HP is fundamentally one of the best automatic transmissions available - most run past 150,000 miles with proper fluid maintenance. Turner Motorsport mechatronic service kit 24347571211-1KT includes all necessary seals and hardware.',
    symptoms: [
      'ATF leak visible under vehicle (red fluid)',
      'Erratic or harsh shifting between gears',
      'Transmission slipping or delayed engagement',
      'Transmission warning lights on dashboard',
      'Shudder or vibration during gear changes',
      'Delayed response when shifting from Park to Drive/Reverse'
    ],
    solution: 'Replace mechatronic sealing sleeves using ZF sealing sleeve 24347588725 or Turner Motorsport kit 24347571211-1KT ($400-$1,200 total). Change transmission fluid every 50,000 miles using ZF Lifeguard Fluid 8 ONLY - generic ATF will damage the ZF 8HP. For 2023 models: check VIN for Recall 23V-821 (weld seam defect) - FREE repair at dealer. If mechatronic unit itself has failed: replacement costs $2,500-$5,000 including programming. PREVENTIVE: Change fluid every 50,000 miles and inspect for leaks during oil changes.',
    estimatedCost: { min: 400, max: 5000 },
    recallInfo: 'Recall 23V-821: 2023 models weld seam defect in transmission case. Check VIN with dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'ZF sealing sleeve 24347588725 for mechatronic seal replacement. Turner Motorsport kit 24347571211-1KT includes all seals and hardware needed.',
        partBrand: 'Turner Motorsport',
        partName: 'Mechatronic Service Kit 24347571211-1KT',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ZF Lifeguard Fluid 8 ONLY for transmission fluid changes. Generic ATF will damage ZF 8HP internals - don\'t cheap out on fluid.',
        partBrand: 'ZF',
        partName: 'Lifeguard Fluid 8',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change transmission fluid every 50,000 miles despite BMW\'s "lifetime" fluid claim. Fluid degrades and extended intervals cause premature wear.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: '2023 model owners: check VIN for Recall 23V-821 (weld seam defect) immediately. FREE repair at dealer - don\'t wait for failure.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-8series-ibs-failure-2020',
    make: 'BMW',
    model: '8 Series',
    years: { start: 2020, end: 2024 },
    title: 'Integrated Brake System (IBS) Failure (All 8 Series & M8)',
    severity: 'high',
    description: 'The Continental MK C1 Integrated Brake System (IBS) module used in 8 Series and M8 models (2020-2024) can fail due to a weld defect in the brake booster housing or software calibration issues. The IBS combines the traditional brake booster, master cylinder, and ABS module into a single electromechanical unit. When it fails, braking performance is severely degraded - the vehicle may require significantly more pedal force to stop, or braking may become inconsistent. BMW issued Recall 21V-062 covering 2020-2021 models, later expanded in 2024 to cover approximately 1.5 million vehicles across multiple BMW models. This is a SAFETY-CRITICAL issue - if IBS warning appears, do not drive. The recall repair is FREE at any BMW dealer. If the vehicle is out of recall coverage, IBS module replacement costs $3,000-$5,000.',
    symptoms: [
      'Brake warning lights illuminated on dashboard',
      'Significantly increased brake pedal effort required',
      'Inconsistent or spongy brake feel',
      'ABS/DSC malfunction warnings',
      'Grinding or unusual noise when braking',
      'Vehicle takes longer distance to stop'
    ],
    solution: 'Check VIN immediately for Recall 21V-062 (2020-2021 models) and the 2024 expanded recall covering 1.5M vehicles - repair is FREE at any BMW dealer. Do NOT drive if IBS warning lights are illuminated - tow to dealer. If vehicle is outside recall coverage: IBS module replacement costs $3,000-$5,000 including programming and calibration. CRITICAL SAFETY ISSUE: Degraded braking can cause accidents - treat any brake warning as emergency.',
    estimatedCost: { min: 0, max: 5000 },
    recallInfo: 'Recall 21V-062 (2020-2021 models). Expanded 2024 recall covering approximately 1.5 million vehicles. FREE repair at dealer.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'SAFETY CRITICAL: If IBS warning lights illuminate, do NOT drive the vehicle. Tow to BMW dealer immediately. Degraded braking can cause accidents.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check VIN with BMW dealer or NHTSA.gov for recall eligibility - Recall 21V-062 and 2024 expanded recall cover FREE IBS module replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Even if not currently recalled, document any brake issues with dealer visits - creates paper trail if recall is further expanded.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do not attempt DIY IBS module replacement - requires BMW ISTA programming and brake system calibration. Dealer-only repair.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-m8-carbon-ceramic-brakes-2020',
    make: 'BMW',
    model: 'M8',
    years: { start: 2020, end: 2024 },
    title: 'M8 Carbon Ceramic Brake (CCB) Issues',
    severity: 'moderate',
    description: 'M8 and M8 Competition models equipped with the optional Carbon Ceramic Brake (CCB) package experience premature rotor cracking, excessive squealing, and thermal shock damage. Carbon ceramic rotors are sensitive to rapid temperature changes (thermal shock from cold water hitting hot rotors) and impacts from road debris. Unlike iron rotors, carbon ceramic rotors cannot be resurfaced - once cracked or damaged, complete replacement is required at $3,000-$4,000 per corner ($12,000-$16,000 for all four). The rotors also produce significant squealing during light braking at low speeds, which is normal for the material but annoying for daily driving. Many M8 owners with CCB option convert to traditional iron rotors using BimmerWorld CCB-to-iron conversion kits ($3,000-$5,000 total) for lower running costs and quieter operation while maintaining excellent braking performance.',
    symptoms: [
      'Excessive squealing and screeching during light braking',
      'Visible cracks or chips on rotor surface',
      'Vibration or pulsation when braking',
      'Grinding noise from damaged rotor',
      'Reduced braking performance from cracked rotor',
      'Uneven pad wear from warped or cracked rotor'
    ],
    solution: 'Replace damaged CCB rotors ($3,000-$4,000 per corner, $12,000-$16,000 for all four). CCB rotors cannot be resurfaced - replacement is only option. Alternatively, convert to iron rotors using BimmerWorld CCB-to-iron conversion kit ($3,000-$5,000 total for all four corners) for dramatically lower running costs. PREVENTION: Avoid driving through standing water with hot brakes (thermal shock cracks rotors). Avoid aggressive braking over potholes or road debris. Squealing at low speed is normal for CCB material - not a defect. If only using car for street driving, iron conversion is more practical and cost-effective.',
    estimatedCost: { min: 3000, max: 16000 },
    recallInfo: 'No recall. Carbon ceramic brake characteristics are considered normal by BMW.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BimmerWorld CCB-to-iron conversion kit ($3,000-$5,000) replaces carbon ceramic with traditional iron rotors. Dramatically lower running costs for street use.',
        partBrand: 'BimmerWorld',
        partName: 'CCB-to-Iron Conversion Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Low-speed squealing is normal for carbon ceramic brakes - not a defect. If squealing bothers you, convert to iron rotors.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Never drive through standing water with hot brakes - thermal shock can crack carbon ceramic rotors instantly. One puddle can cost $4,000+.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'OEM CCB rotor replacement is $3,000-$4,000 per corner. Iron conversion at $3,000-$5,000 total is cheaper than replacing even ONE CCB rotor.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-8series-premature-tire-wear-2019',
    make: 'BMW',
    model: '8 Series',
    years: { start: 2019, end: 2024 },
    title: 'Premature Tire Wear (All 8 Series & M8)',
    severity: 'low',
    description: 'All 8 Series and M8 models experience premature tire wear, particularly on the rear tires, due to aggressive factory alignment settings. The rear suspension uses approximately -2.0 degrees of negative camber from the factory, which causes rapid inner edge tire wear. Rear tires commonly need replacement at only 9,000-15,000 miles instead of the typical 25,000-40,000 miles for performance tires. The aggressive camber is set for handling performance but is excessive for street driving and dramatically shortens tire life. Reducing rear camber to approximately -1.5 degrees through a performance alignment ($150-300) significantly extends tire life while maintaining good handling characteristics for street use. Staggered tire setup (wider rear than front) means rear tires cannot be rotated to front, compounding the wear issue. M8 Competition with its even wider rear tires is most affected.',
    symptoms: [
      'Rapid inner edge wear on rear tires',
      'Rear tires worn out at 9,000-15,000 miles',
      'Uneven tread depth across tire surface',
      'Visible cord or wire showing on inner edge while outer tread looks new',
      'Tire noise increasing as inner edge wears',
      'Failed tire inspection due to inner edge wear'
    ],
    solution: 'Get a performance alignment reducing rear camber from factory -2.0 degrees to -1.5 degrees ($150-$300 at alignment shop). This significantly extends rear tire life from 9,000-15,000 miles to 20,000-25,000 miles while maintaining good street handling. Rotate front tires side-to-side every 5,000 miles (staggered setup prevents front-to-rear rotation). Replace rear tires in pairs when worn. COST SAVINGS: Alignment adjustment ($150-300) saves $1,200-2,400 per year in premature tire replacement on expensive performance tires ($300-600 each).',
    estimatedCost: { min: 150, max: 2400 },
    recallInfo: 'No recall. Factory alignment optimized for handling performance, not tire longevity.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Reduce rear camber from factory -2.0 degrees to -1.5 degrees for street driving. Saves $1,200-2,400/year in premature tire replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check inner edge tire wear every 3,000-5,000 miles. Tires can look fine from outside while inner edge is down to cord.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Staggered tire setup means rear tires cannot be rotated to front. Budget for rear tire replacement every 9,000-15,000 miles at factory settings.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Performance alignment ($150-300) is one of the best investments for 8 Series ownership. Ask shop specifically to reduce rear camber for street use.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmw8SeriesM8Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`\u2713 Successfully added ${bmw8SeriesM8Issues.length} BMW 8 Series/M8 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmw8SeriesM8Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
