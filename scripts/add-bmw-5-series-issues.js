const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmw5SeriesIssues = [
  {
    id: 'bmw-5-series-n63-timing-chain-2006',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2006, end: 2023 },
    title: 'N63 V8 Timing Chain Failure & Valve Stem Seals (Catastrophic)',
    severity: 'high',
    description: 'The N63 twin-turbo V8 engine suffers from TWO catastrophic design flaws that make it one of BMW\'s least reliable engines. First, the timing chain guides and tensioners degrade from excessive heat in the "hot-V" design (turbos mounted between cylinder banks). Plastic guides crack and fail by 80,000-100,000 miles, causing timing chain skip and catastrophic piston-to-valve collision ($8,000-$15,000 engine replacement). Second, valve stem seals cook from extreme turbo heat, causing excessive oil consumption (1 quart per 600-800 miles). The seals harden and crack, allowing oil into combustion chambers. BMW extended warranty to 10 years/120,000 miles for 2009-2015 models and released N63 Customer Care Package with updated parts, but 2006-2008 and 2016+ models not covered. Bimmerpost consensus: N63 is BMW\'s worst reliability disaster, avoid unless under warranty. Affects E60 550i (2006-2010), F10 550i (2011-2016), G30 M550i (2017-2023).',
    symptoms: [
      'Rattling noise from engine on cold start (timing chain)',
      'Excessive oil consumption (1+ quart every 600-800 miles)',
      'Blue smoke from exhaust on startup or acceleration',
      'Check engine light with timing/cam codes (P0016, P0017, P0011, P0021)',
      'Turbo coolant lines leaking onto alternator',
      'Limp mode with wastegate actuator failure codes',
      'Complete engine failure (chain skip or piston-to-valve collision)'
    ],
    solution: 'PREVENTIVE: Replace timing chain, guides, tensioners at 80,000 miles ($3,000-$5,000) BEFORE failure. Replace valve stem seals ($3,000-$5,000 with heads on car, $8,000+ with head removal). If chain has failed: Complete engine replacement required ($8,000-$15,000). Check extended warranty eligibility with BMW dealer - some N63s covered to 120k miles. CRITICAL: If buying used, AVOID N63 models unless under BMW warranty or budget $10,000+ for preventive repairs. Opt for inline-6 models (535i with N55, 540i with B58) instead.',
    estimatedCost: { min: 3000, max: 15000 },
    recallInfo: 'BMW extended warranty: 10 years/120,000 miles on 2009-2015 N63 engines. Service Bulletin SI B01 23 18 - N63 Engine Oil Consumption/Battery Drain Class Action Settlement. N63 Customer Care Package (2014).',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'AVOID N63 V8 550i/M550i models unless under BMW warranty. These engines are ticking time bombs with $10,000+ repair bills. Bimmerpost forums full of catastrophic N63 failures.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used 550i/M550i, insist on complete maintenance records showing timing chain and valve stem seal replacement. Without documentation, assume these repairs are due and negotiate $8,000+ off price.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'N63 requires oil changes every 5,000 miles (NOT BMW\'s 10k interval) and Top Tier gas only. Check oil level weekly - if consuming 1qt per 1,000 miles, valve stem seals have failed.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you hear ANY rattling from engine, DO NOT DRIVE. Tow to shop immediately. Timing chain failure destroys engine within days ($15,000 repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'For preventive timing chain replacement, use OEM BMW timing chain kit or BGA brand. Labor is 80% of cost ($2,500+), so replace ALL guides, tensioners, and seals at once.',
        partBrand: 'BMW',
        partName: 'OEM Timing Chain Kit',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-5-series-n54-hpfp-2008',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2008, end: 2012 },
    title: 'N54 High Pressure Fuel Pump (HPFP) Failure (Safety Critical)',
    severity: 'high',
    description: 'The N54 twin-turbo engine\'s high pressure fuel pump fails prematurely, causing sudden engine stalling, long cranking, and dangerous power loss while driving. BMW used defective HPFP designs with faulty internal roller tappets that wear out by 50,000-80,000 miles. Pump failure leaves car stranded and creates safety hazard when engine dies on highway. BMW extended warranty coverage to 10 years/120,000 miles after NHTSA complaints exceeded 987 reports. This is THE most common N54 failure. Updated revision pumps (part numbers ending in higher letters like "F" or "G") are more reliable. Affects E60 535i (2008-2010) and F10 535i (2011-2012 early). Bimmerpost ranks HPFP as #1 N54 problem - failure rate near 60% on original pumps.',
    symptoms: [
      'Long crank time before engine starts (3-10 seconds)',
      'Engine stalling at idle or while driving (DANGEROUS)',
      'Loss of power under acceleration',
      'Rough idle and misfires',
      'Check engine light with fuel pressure codes (P0087, P1093)',
      'Car cranks but won\'t start'
    ],
    solution: 'Check VIN with BMW dealer for extended warranty coverage (10 years/120,000 miles on HPFP). Replace with updated revision HPFP - look for part numbers ending in revision "F" or higher (original pumps end in "A" or "B"). Use ONLY Top Tier gasoline (Shell, Chevron, Mobil) - lower quality fuel accelerates pump wear. DIY replacement possible with basic tools and 2-3 hours ($500-800 parts), dealer labor adds $200-400. Keep replacement pump in trunk for peace of mind - N54 owners often carry spare HPFPs. If HPFP fails on road, car must be towed.',
    estimatedCost: { min: 500, max: 1200 },
    recallInfo: 'BMW Service Information SI B13 04 09. BMW extended warranty: 10 years/120,000 miles on HPFP failures. NHTSA: 987+ complaints for 2009 535i engine problems.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is a high-severity safety issue - engine can stall on highway. If car has original HPFP (check part number), replace NOW even if running fine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Only use updated revision HPFP (part ending in \'F\' or \'G\'). Original \'A\' and \'B\' revision pumps WILL fail. Genuine BMW pump is $600, aftermarket $350 but hit-or-miss quality.',
        partBrand: 'BMW',
        partName: 'High Pressure Fuel Pump (Revision F+)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly repair for mechanically inclined. Remove intake manifold, unbolt pump, replace. FCP Euro has lifetime warranty on HPFP - free replacements forever.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use Top Tier gas ONLY (Shell, Chevron, Mobil). Cheap gas with ethanol kills N54 HPFP faster. Premium 93 octane required.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Bimmerpost consensus: Budget for HPFP replacement on ANY used N54 - assume it needs pump unless seller shows recent replacement receipt.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-5-series-zf-6hp-mechatronic-2004',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2004, end: 2013 },
    title: 'ZF 6HP Transmission Mechatronic Sleeve & Valve Body Failure',
    severity: 'moderate',
    description: 'The ZF 6HP automatic transmission used in E60 and early F10 5 Series develops harsh shifting, flared shifts, and delayed engagement from failed mechatronic sealing sleeves and worn valve body. The mechatronic sleeve (rubber gasket connecting valve body to transmission) cracks and hardens from age/heat by 80,000-120,000 miles, causing loss of hydraulic pressure. This prevents proper clutch engagement, causing hard 2-1 downshifts, flared 4-5 upshifts, and delayed Park-to-Drive shifts. Worn valve body solenoids exacerbate problem. BMW has NO official recall, but this affects nearly EVERY high-mileage ZF 6HP transmission. Bimmerfest DIY guides show mechatronic sleeve replacement prevents $5,000 transmission replacement. Changing transmission fluid every 50,000 miles (BMW says "lifetime") dramatically extends life.',
    symptoms: [
      'Hard 2-1 downshifts (feels like being rear-ended)',
      'Flared or slipping 4-5 upshifts (RPMs rise without acceleration)',
      'Delayed shifts from Park to Drive or Reverse (2-3 second delay)',
      'Harsh 2-3 upshifts under light throttle',
      'Transmission slipping or "hunting" for gears',
      'Check engine light with transmission fault codes (5F52, 5F1C)'
    ],
    solution: 'Replace mechatronic sealing sleeves (4 tubes + 1 square seal) and valve body adapter sleeve ($150-300 parts). DIY-friendly with transmission pan drop and valve body removal (4-6 hours, detailed guides on Bimmerfest). While valve body is out, replace transmission fluid/filter and clean solenoids ($200 additional). Dealer charges $1,500-2,500 for this repair; DIY costs $400-700 total. PREVENTIVE: Change transmission fluid every 50,000 miles (NOT "lifetime") with BMW-spec fluid (Pentosin/ZF Lifeguard 6). Fluid changes prevent 90% of ZF 6HP problems. If ignored, worn mechatronic destroys clutches requiring $5,000+ transmission rebuild.',
    estimatedCost: { min: 400, max: 2500 },
    recallInfo: 'No official TSB or recall. Well-documented on BMW forums as common wear item.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Change transmission fluid every 50k miles - BMW \'lifetime fluid\' is marketing BS. Fluid changes prevent mechatronic sleeve failure and save $2,000+ in repairs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use genuine ZF Lifeguard 6 fluid ($80 for 7 quarts) or Pentosin ATF1 equivalent. NEVER use generic ATF - will destroy ZF transmission.',
        partBrand: 'ZF',
        partName: 'Lifeguard 6 ATF',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY mechatronic sleeve replacement saves $1,000+ vs dealer. Bimmerfest has step-by-step guides with photos. Needs basic tools and 4-6 hours.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If transmission shifts are harsh or delayed, fix mechatronic sleeve IMMEDIATELY. Continuing to drive destroys clutch packs ($5,000 transmission rebuild).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Order OEM BMW mechatronic sleeve kit (includes all seals). Aftermarket sleeves leak within 20k miles. Part number: 24347556435.',
        partBrand: 'BMW',
        partName: 'Mechatronic Sleeve Kit',
        partNumber: '24347556435',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-5-series-water-pump-2004',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2004, end: 2023 },
    title: 'Electric Water Pump Failure (All Engines)',
    severity: 'moderate',
    description: 'BMW 5 Series across ALL generations use electric water pumps that fail prematurely between 60,000-100,000 miles across ALL engines (N52, N54, N55, N20, N62, N63, B48, B58). Unlike belt-driven pumps, electric pumps fail SUDDENLY without warning - the electric motor or impeller seizes, causing coolant circulation to stop and engine to overheat in minutes. Ignoring overheating causes warped cylinder heads and blown head gaskets ($3,000-$6,000 repair). This is THE most common BMW maintenance item. Bimmerfest forums report water pump failure as #1 non-oil-leak issue across all BMWs. BMW has NO recall despite near-universal failure. Budget for replacement every 80,000-100,000 miles as preventive maintenance to avoid being stranded. Failure rate approaches 100% by 120k miles.',
    symptoms: [
      'Engine overheating rapidly (temp gauge in red zone)',
      'Coolant warning light or "Engine Overheating - Stop Safely" message',
      'Low coolant message despite full reservoir',
      'Whining or grinding noise from water pump area (front of engine)',
      'Steam from engine bay',
      'Coolant leak under car (pink/green fluid)',
      'Heater blows cold air while engine is hot'
    ],
    solution: 'Replace electric water pump ($600-$1,200 installed). Use OEM BMW or quality German aftermarket (Rein, Hepu brands) - cheap eBay pumps fail within 20k miles. Replace thermostat at same time ($200 additional parts) since labor is 80% done. Flush cooling system and refill with BMW-spec coolant (do NOT use generic green antifreeze - causes corrosion). PREVENTIVE: Replace water pump at 80,000 miles BEFORE failure to avoid being stranded. If engine overheats, PULL OVER IMMEDIATELY and shut off - driving with overheating warps heads ($4,000+ repair). Call tow truck; do not attempt to drive.',
    estimatedCost: { min: 600, max: 1200 },
    recallInfo: 'No recall. Water pump considered routine maintenance by BMW (despite 60k-100k failure rate).',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Replace water pump BEFORE 100k miles as preventive maintenance. Electric pumps fail SUDDENLY - no warning. Don\'t wait for symptoms or you\'ll be stranded with $150 tow bill + $4k head gasket.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW ($350), Rein ($200), or Hepu ($180) pumps. Avoid eBay \'Bapmic\' $80 pumps - fail in 20k miles. Genuine BMW lasts 80k-100k miles.',
        partBrand: 'Rein',
        partName: 'Electric Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If engine overheats, PULL OVER IMMEDIATELY and shut off. Driving 2-3 miles with overheating warps cylinder heads ($4,000 repair). Call tow truck - it\'s cheaper.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace thermostat when doing water pump - it\'s right there and labor is 80% done. Saves $200-300 in future labor if thermostat fails separately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY BMW-approved coolant (blue or pink/orange). Generic green antifreeze corrodes aluminum components. Premix coolant saves time: Pentosin or Zerex G48 BMW formula.',
        partBrand: 'Pentosin',
        partName: 'BMW Coolant Premix',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-5-series-oil-leaks-2004',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2004, end: 2023 },
    title: 'Valve Cover Gasket & Oil Filter Housing Gasket Leaks',
    severity: 'low',
    description: 'BMW 5 Series across ALL generations develop oil leaks from valve cover gasket (VCG) and oil filter housing gasket (OFHG) between 60,000-120,000 miles on ALL engines. The gaskets harden and crack from heat cycling, causing oil seepage that worsens over time. VCG leaks drip onto exhaust manifold causing burning oil smell and smoke. OFHG leaks drip onto alternator and serpentine belt, causing $800+ alternator failure if ignored. While not immediately dangerous, leaks worsen and low oil can damage engine. This affects virtually EVERY high-mileage BMW - Bimmerpost calls VCG/OFHG leaks "when not if" on all BMWs. Budget for replacement around 80k-100k miles as routine maintenance. DIY-friendly repairs that save $400-600 in dealer labor.',
    symptoms: [
      'Burning oil smell from engine bay (especially after hard driving)',
      'Oil residue on engine or engine cover',
      'Low oil warning with visible leak',
      'Oil dripping under car after parking',
      'Oil visible on alternator or belts',
      'Smoke from engine bay (oil burning on exhaust manifold)',
      'Oil level drops 1+ quarts between changes'
    ],
    solution: 'Replace valve cover gasket ($400-$800 shop, $150-250 DIY parts) and/or oil filter housing gasket ($300-$600 shop, $80-150 DIY parts). Can be done separately or together depending on leak source. Use OEM BMW gaskets or quality German aftermarket (Elring, Victor Reinz brands) - cheap gaskets leak within 20k miles. Both are DIY-friendly for experienced mechanics: VCG takes 2-3 hours, OFHG takes 1-2 hours. YouTube has detailed model-specific guides. Monitor oil level weekly and top off as needed (1 quart low is OK, 2+ quarts low risks engine damage). Address OFHG leaks EARLY - oil dripping on alternator causes $800+ alternator failure.',
    estimatedCost: { min: 300, max: 1400 },
    recallInfo: 'No recall. Gaskets are routine maintenance/wear items per BMW.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'These gaskets are \'when not if\' on all BMWs. Budget for VCG + OFHG replacement around 80k-100k miles as part of BMW ownership. Not a defect, just routine maintenance.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly repairs save $400-$600 vs dealer. VCG takes 2-3 hours, OFHG takes 1-2 hours. FCP Euro and YouTube have detailed guides for every BMW engine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW or German gaskets (Elring, Victor Reinz). Cheap $40 eBay gasket kits leak within 20k miles. Genuine Elring VCG ($80) lasts 80k+ miles.',
        partBrand: 'Elring',
        partName: 'Valve Cover Gasket Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'OFHG leaks drip oil onto alternator, causing $800+ alternator failure. Fix OFHG leak EARLY to prevent expensive secondary damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When replacing VCG, also replace spark plug tube seals and eccentric shaft sensor seal (N52) - labor is 90% done. Saves future comebacks.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-5-series-n54-wastegate-2008',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2008, end: 2013 },
    title: 'N54 Turbo Wastegate Rattle & Turbo Failure',
    severity: 'moderate',
    description: 'The N54 twin-turbo engine\'s wastegate actuators develop notorious rattling from loose tolerances in the wastegate bushing. BMW engineered wastegates with overly loose tolerances causing the actuator arm to flutter, and over time the wastegate bushing wears out, resulting in constant rattling at idle and startup. The wastegate doesn\'t close completely, causing underboost codes, poor performance, and turbo overheating that leads to full turbo failure ($4,000-$6,000 for both turbos). This is THE #2 most common N54 issue after HPFP. BMW North America recognized the design flaw and extended warranty to 8 years/82,000 miles for wastegate issues. Affects E60 535i (2008-2010) and F10 535i (2011-2013 early). Bimmerpost reports 70%+ N54s develop wastegate rattle by 80k miles.',
    symptoms: [
      'Rattling noise from turbos at idle and startup (sounds like marbles in tin can)',
      'Wastegate rattle worse in cold weather',
      'Check engine light with underboost codes (P0234, 30FF, 30FD)',
      'Loss of boost pressure (reduced power)',
      'Turbo whine or whistle louder than normal',
      'Oil leaking from turbo seals (failed turbo)',
      'Excessive smoke from exhaust (oil burning in turbos)'
    ],
    solution: 'Check VIN with BMW dealer for extended warranty coverage (8 years/82,000 miles for wastegate issues). If under warranty: BMW replaces wastegate actuators FREE. If out of warranty: Upgrade to electronic wastegate actuators ($2,000-3,000 parts + labor) or replace OEM wastegates ($1,500-2,500). If turbos have failed from wastegate damage: Both turbos must be replaced ($4,000-$6,000 parts + labor). PREVENTIVE: Use high-quality oil (BMW LL-01 spec) and change every 5,000-7,500 miles. Drive car hard occasionally (Italian tune-up) to keep wastegates exercised. If rattle is minimal and car boosts normally, can monitor without immediate repair.',
    estimatedCost: { min: 1500, max: 6000 },
    recallInfo: 'BMW extended warranty: 8 years/82,000 miles for N54 wastegate rattle and related turbo failures (US models only).',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Check extended warranty coverage BEFORE paying for wastegate repair. BMW covers wastegates to 82k miles - can save $2,500.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Wastegate rattle is annoying but not immediately dangerous. If car boosts normally and no underboost codes, can monitor rattle without urgent repair.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Upgrade to electronic wastegate actuators for $2,500 - eliminates rattle permanently. TiAL or Turbosmart electronic actuators last 150k+ miles.',
        partBrand: 'TiAL',
        partName: 'Electronic Wastegate Actuators',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Ignoring underboost codes causes turbos to overheat and fail ($6,000 both turbos). If codes appear, repair wastegates immediately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Bimmerpost consensus: N54 wastegate rattle is part of ownership. Budget $2,000 for wastegate fix around 80k miles. Still cheaper than German competitors.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-5-series-n20-timing-chain-2012',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2012, end: 2015 },
    title: 'N20 Timing Chain Guide Failure (Catastrophic) - F10 528i',
    severity: 'high',
    description: 'The N20 2.0-liter turbo engine in F10 528i (2012-early 2015) has a CRITICAL design defect in plastic timing chain guides identical to F30 328i issue. The guides crack, degrade, and break apart from material defects, causing timing chain to skip or break, resulting in catastrophic piston-to-valve collision and complete engine destruction requiring $8,000-$15,000 replacement. Early symptoms include rattling on cold start (like marbles in tin can) and high-pitched whining between 1,500-2,500 RPM. BMW redesigned guides in January 2015, but 2012-2014 models are ticking time bombs. This is BMW\'s WORST reliability disaster of 2010s according to Bimmerpost. Failure rate estimated at 15-20% of all 2012-2014 N20 engines. Class action settlement provides some extended warranty coverage.',
    symptoms: [
      'Rattling or clattering noise from front of engine on cold start (marbles in tin can)',
      'High-pitched whining or whirring between 1,500-2,500 RPM',
      'Rough idle or misfires',
      'Check engine light with timing/cam correlation codes (P0016, P0017)',
      'Engine suddenly stops running (chain has broken)',
      'Complete engine failure (piston-to-valve collision)'
    ],
    solution: 'PREVENTIVE REPLACEMENT: If you own 2012-2014 F10 528i with N20, replace timing chain guides IMMEDIATELY at 60,000-80,000 miles ($2,500-$4,000) BEFORE failure. If rattling has started: STOP DRIVING and tow to shop - chain can break at any moment. If engine has failed: Complete engine replacement required ($8,000-$15,000). BMW extended warranty covers some cases - check with dealer. CRITICAL: Avoid 2012-2014 528i when buying used - opt for 2015+ with updated guides or 535i with N55 engine (no timing chain issues).',
    estimatedCost: { min: 2500, max: 15000 },
    recallInfo: 'No official recall. Extended warranty coverage for some models. Class action settlement may apply - check with BMW dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: 2012-2014 F10 528i with N20 are CATASTROPHIC FAILURES waiting to happen. If you own one, replace guides NOW. If buying used, AVOID these years entirely.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Bimmerpost consensus: N20 timing chain is BMW\'s worst reliability disaster. Many owners have $12k+ engine replacement bills. Opt for 2015+ or N55 535i instead.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used F10, insist on 2015+ model year (after January 2015 production) with updated guides. Or choose 535i with N55 engine - zero timing chain issues.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you hear ANY rattling from engine, DO NOT DRIVE. Tow to shop immediately. Continuing to drive destroys engine within days.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check extended warranty eligibility with BMW dealer. Some 2012-2014 cars still covered under class action settlement. Can save $12,000+ on engine replacement.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-5-series-epb-failure-2004',
    make: 'BMW',
    model: '5 Series',
    years: { start: 2004, end: 2023 },
    title: 'Electronic Parking Brake (EPB) Actuator Failure',
    severity: 'low',
    description: 'BMW 5 Series electronic parking brake actuators fail from corrosion, worn gears, and failed O-rings across all generations. The EPB motor inside each rear caliper engages/disengages parking brake, but internal gears break or rust from moisture intrusion by 80,000-120,000 miles. Failed O-ring seals allow water/salt to corrode internals even when brake unused regularly. Symptoms include "Parking Brake Malfunction" message, brake won\'t engage or release, and fault codes 600D/600E. While not immediately dangerous (car can be driven with EPB fault), failed EPB prevents passing inspection and can cause brake drag that damages rotors. Dealer charges $700+ per actuator; both often fail together ($1,400). Bimmerfest reports this as extremely common on all BMWs with EPB.',
    symptoms: [
      '"Parking Brake Malfunction" message on iDrive',
      'Parking brake won\'t engage when button pressed',
      'Parking brake won\'t release (car stuck with brake applied)',
      'Yellow PARK warning light stays on',
      'Grinding or whining noise from rear brakes',
      'Fault codes 600D or 600E in ECU data',
      'Brake drag on one or both rear wheels'
    ],
    solution: 'Replace electronic parking brake actuator(s) ($400-700 per side at dealer, $200-350 DIY parts). Both actuators often fail together, so replace both ($800-1,400 dealer, $400-700 DIY). Can sometimes be fixed with software update - try this FIRST at BMW dealer (free). DIY replacement requires retracting caliper pistons with BMW ISTA software (INPA tool). PREVENTIVE: Use parking brake monthly even in flat areas to exercise mechanism and prevent corrosion. Apply silicone grease to actuator threads yearly. In salt belt states, actuators fail earlier (60k-80k) from road salt corrosion.',
    estimatedCost: { min: 400, max: 1400 },
    recallInfo: 'No official recall. Some dealers perform software updates under goodwill warranty for early failures.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Before replacing actuator, try software update at BMW dealer (sometimes free under goodwill). Fixes 20-30% of EPB faults without parts.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use parking brake monthly even in flat areas to exercise mechanism. Prevents corrosion and seizing. Actuators fail faster when unused.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Aftermarket actuators from FCP Euro ($200) work well and have lifetime warranty. OEM BMW actuators are $450 each and fail again in 80k miles.',
        partBrand: 'FCP Euro',
        partName: 'EPB Actuator',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If brake won\'t release and car stuck, enter service mode via hidden iDrive menu to retract caliper. YouTube has guides for emergency release.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'In salt belt states (northeast/midwest), actuators fail at 60k-80k miles from corrosion. Budget for replacement sooner if you live in snow states.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmw5SeriesIssues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmw5SeriesIssues.length} BMW 5 Series issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmw5SeriesIssues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
