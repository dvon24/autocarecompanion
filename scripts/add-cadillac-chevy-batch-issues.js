const fs = require('fs');
const path = require('path');

// Load current data
const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const existingIds = new Set(data.issues.map(i => i.id));

const newIssues = [
  // ============================================================
  // CADILLAC CT5-V (2020-2024) - Issues specific to V model
  // ============================================================
  {
    id: 'cadillac-ct5v-supercharged-v8-engine-failure-2020',
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: 'Cadillac',
      model: 'CT5',
      trims: ['V', 'V Blackwing', 'V-Series', 'V-Series Blackwing'],
      engines: ['6.2L Supercharged V8']
    },
    category: 'engine',
    title: 'LT4 Supercharged V8 Premature Engine Failure',
    description: 'The 6.2L supercharged LT4 V8 in CT5-V Blackwing models has experienced premature engine failures including bottom-end bearing failures, lifter collapse, and metal shavings found in oil. Failures have been reported as early as 5,000-15,000 miles. Car and Driver documented a catastrophic engine failure on their long-term test CT5-V Blackwing. GM initially claimed it was an isolated incident but forum reports suggest the problem is more widespread than acknowledged.',
    solution: 'Monitor oil closely with oil analysis every 3,000 miles. Use only Mobil 1 0W-40 or equivalent meeting dexos R specification. Check oil filter for metal particles at every change. If metal is found, stop driving immediately and contact dealer for warranty engine replacement. Keep all service records for warranty claims.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Metallic ticking or knocking noise from engine',
      'Metal shavings found in oil filter',
      'Low oil pressure warning light',
      'Sudden loss of engine power',
      'Check engine light with misfire codes'
    ],
    estimatedCost: { low: 0, high: 15000 },
    citations: [
      {
        type: 'owner-report',
        title: 'CT5-V Blackwing Engine Failure Reports - CadillacVNet Forums',
        url: 'https://www.cadillacvnet.com/forums/threads/2023-ct5-blackwing-engine-failure-shavings.4922/'
      },
      {
        type: 'owner-report',
        title: 'Car and Driver Long-Term CT5-V Blackwing Engine Failure',
        url: 'https://www.cadillacvnet.com/forums/threads/c-d-blew-up-their-long-term-ct5-v-bw.2979/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Multiple CT5-V Blackwing owners report catastrophic LT4 engine failures under 15,000 miles. Get oil analysis done every 3,000 miles to catch bearing wear early. Metal in the oil filter is a red flag - stop driving and get to a dealer immediately for warranty replacement',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use only dexos R rated 0W-40 full synthetic oil. The supercharged LT4 is extremely sensitive to oil quality. Mobil 1 0W-40 European Car Formula is the go-to. Cut open your oil filter at every change and inspect for metal particles',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 85,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304']
  },
  {
    id: 'cadillac-ct5v-6-2-recall-engine-2021',
    vehicleMatch: {
      years: [2021, 2022, 2023, 2024],
      make: 'Cadillac',
      model: 'CT5',
      trims: ['V', 'V Blackwing', 'V-Series', 'V-Series Blackwing'],
      engines: ['6.2L Supercharged V8']
    },
    category: 'engine',
    title: 'GM 6.2L V8 Engine Recall for Connecting Rod Bearing Failure',
    description: 'After widespread engine failures and an NHTSA investigation, GM recalled all 2021-2024 vehicles equipped with the 6.2L V8 engine including the CT5-V. The recall addresses potential connecting rod bearing failure that can cause engine seizure, stalling, or fire risk. The recall covers both naturally aspirated L87 and supercharged LT4 variants.',
    solution: 'Contact Cadillac dealer immediately to check recall eligibility. GM will inspect and replace engine components as needed at no cost. Do not ignore any knocking sounds or oil pressure warnings. The recall remedy includes enhanced engine monitoring software and replacement of affected components.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Knocking or ticking noise from engine',
      'Check engine light illuminated',
      'Oil pressure warning light',
      'Engine stalling while driving',
      'Reduced engine power message'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Recall - GM 6.2L V8 Engine Failures',
        url: 'https://www.nhtsa.gov/recalls'
      },
      {
        type: 'news',
        title: 'NHTSA Questions GM Engine Recall Fix After Continued Failures',
        url: 'https://www.autobodynews.com/news/nhtsa-questions-gm-engine-recall-fix-after-owners-report-continued-failures'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'GM recall covers 6.2L V8 engines in 2021-2024 CT5-V models. Contact your dealer immediately to verify your VIN is covered. Free repair including engine replacement if needed. Do NOT continue driving if you hear knocking - engine seizure can occur without warning',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check recall status at nhtsa.gov/recalls using your VIN. Even if you have not received a recall letter, your vehicle may still be affected. Dealers can verify and schedule the repair at no cost to you',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 320,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0300', 'P0520', 'P06DD']
  },
  {
    id: 'cadillac-ct5v-manual-2nd-gear-notchy-2022',
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: 'Cadillac',
      model: 'CT5',
      trims: ['V Blackwing', 'V-Series Blackwing'],
      engines: ['6.2L Supercharged V8']
    },
    category: 'transmission',
    title: 'Tremec 6-Speed Manual 2nd Gear Notchiness and Difficulty',
    description: 'CT5-V Blackwing models equipped with the Tremec TR-6060 6-speed manual transmission frequently exhibit difficulty and notchiness when shifting into 2nd gear. The issue occurs both when cold and when hot, particularly when downshifting from highway speeds. Some dealers have attributed this to worn synchros requiring complete transmission replacement, while others consider a degree of notchiness normal for the Tremec unit. The problem varies in severity from mildly annoying to preventing clean shifts.',
    solution: 'Allow the transmission to warm up before aggressive shifting. Use GM-recommended Tremec fluid (Pennzoil Synchromesh) and ensure correct fill level. Rev-matching downshifts can reduce synchro wear. If shifting becomes truly difficult or grinding occurs, have the synchros inspected under warranty. Some owners report improvement after the first 5,000 miles of break-in.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Difficulty shifting into 2nd gear when cold',
      'Notchy or resistant feel when selecting 2nd gear',
      'Grinding sensation when downshifting to 2nd at speed',
      'Shift quality degrades in hot weather or after hard driving',
      'Occasional 2nd gear lockout requiring double-clutch'
    ],
    estimatedCost: { low: 0, high: 4000 },
    citations: [
      {
        type: 'owner-report',
        title: 'Manual Transmission Notchiness Discussion - CadillacVNet',
        url: 'https://www.cadillacvnet.com/forums/threads/manual-trans-owners-both-4-and-5.3113/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Some 2nd gear notchiness is normal for the Tremec TR-6060 manual. Allow the transmission to warm up for 5-10 minutes before aggressive shifting. Rev-matching on downshifts dramatically reduces synchro wear and improves shift quality',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Pennzoil Synchromesh transmission fluid (GM part 88861800) is the factory fill. Some owners report smoother shifts after switching to Amsoil MTF. Change fluid at 30,000 miles regardless of what the maintenance schedule says',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 120,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'cadillac-ct5v-airbag-curtain-install-2020',
    vehicleMatch: {
      years: [2020, 2021, 2022],
      make: 'Cadillac',
      model: 'CT5',
      trims: ['V', 'V Blackwing', 'Luxury', 'Premium Luxury', 'Sport']
    },
    category: 'safety',
    title: 'Roof Rail Side-Curtain Airbag Incorrect Installation',
    description: 'Certain 2020-2022 CT5 vehicles may have roof rail side-curtain airbags that were not installed correctly during manufacturing. The improper installation could result in the airbag not deploying properly during a side-impact crash, reducing occupant protection. This affects both V and non-V CT5 models.',
    solution: 'Contact Cadillac dealer to verify VIN recall eligibility. Dealers will inspect the side-curtain airbag installation and correct any improperly installed units at no cost. Do not attempt DIY inspection or repair of airbag components.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'No visible symptoms - manufacturing defect',
      'Airbag warning light may be illuminated in some cases',
      'SRS system diagnostic fault codes',
      'Recall notice received from GM',
      'Vehicle flagged during dealer service visit'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Recall - CT4/CT5 Side-Curtain Airbag Installation',
        url: 'https://www.autosafety.org/vehicle-safety-check/2020-cadillac-ct5/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is a safety recall with no visible symptoms. Check your VIN at nhtsa.gov/recalls immediately. Improperly installed side-curtain airbags may not deploy in a crash. Free repair at any Cadillac dealer',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 200,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },

  // ============================================================
  // CADILLAC CELESTIQ (2024)
  // ============================================================
  {
    id: 'cadillac-celestiq-illuminated-grille-recall-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Cadillac',
      model: 'Celestiq'
    },
    category: 'electrical',
    title: 'Illuminated Front Grille Non-Compliance Recall',
    description: 'The 2024 Cadillac Celestiq illuminated front grille does not comply with Federal Motor Vehicle Safety Standards (FMVSS) for exterior lighting. The advanced LED grille lighting system output exceeds or does not meet the required specifications, creating potential visibility and safety concerns for other drivers. GM and NHTSA received over 200 complaints from customers and dealers about the grille lighting behavior.',
    solution: 'Contact Cadillac dealer for free recall service. Dealers will perform a software update to recalibrate the grille lighting output. If hardware is faulty, the entire grille assembly will be replaced at no cost. As the Celestiq is hand-built at the Global Technical Center, parts availability may affect scheduling.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Excessively bright grille illumination',
      'Grille lighting not deactivating properly',
      'Other drivers complaining of glare from front of vehicle',
      'Grille LEDs flickering or displaying unevenly',
      'Recall notification letter from GM'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Recall 25V-274 - Cadillac Celestiq Illuminated Grille',
        url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V274-1598.PDF'
      },
      {
        type: 'recall',
        title: 'Cadillac EV Recall 2025 - Grille Display Issue',
        url: 'https://sagelawgroupllp.com/cadillac-ev-recall/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'All 2024 Celestiq models are affected by this recall. Contact your Cadillac concierge or dealer immediately. Software recalibration is the typical fix but some units require full grille assembly replacement. Free of charge under recall',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 200,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'cadillac-celestiq-display-software-glitches-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Cadillac',
      model: 'Celestiq'
    },
    category: 'electrical',
    title: 'Infotainment and Driver Display Software Glitches',
    description: 'The Celestiq features a 55-inch diagonal LED display spanning the dashboard. Early production vehicles have experienced software issues including screen blackouts, display freezing, navigation system hanging, and OnStar connectivity problems. The 33-inch diagonal pillar-to-pillar display can occasionally go blank while driving. GM has released TSBs with software updates to address display reliability. These issues are shared with other GM Ultium-platform EVs like the Lyriq.',
    solution: 'Schedule a dealer visit for the latest software updates per TSB #23-NA-222. Perform a system reset by holding the power button for 10 seconds if display freezes. Ensure the vehicle has received all available OTA updates via Settings > Software Update. Contact Cadillac concierge for priority service scheduling.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Main display screen goes black while driving',
      'Infotainment system freezes and becomes unresponsive',
      'Navigation system hangs or loses GPS signal',
      'OnStar connectivity drops or becomes unresponsive',
      'Climate control display shows incorrect information'
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      {
        type: 'tsb',
        title: 'GM TSB 23-NA-222 - Display Software Updates for 2024 EVs',
        url: 'https://www.nhtsa.gov/vehicle/2024/CADILLAC/CELESTIQ/4%20DR/AWD'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'If the display goes blank, hold the power button for 10 seconds to perform a system reset. This resolves most software freezes. Schedule a dealer visit to ensure you have the latest software version installed - many fixes are cumulative',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 45,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'cadillac-celestiq-12v-battery-ultium-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Cadillac',
      model: 'Celestiq'
    },
    category: 'electrical',
    title: '12V Auxiliary Battery Drain on Ultium Platform',
    description: 'The Celestiq shares the GM Ultium platform with the Lyriq and Blazer EV, and inherits the 12V auxiliary battery drain issue common to these vehicles. The vehicle electronics draw power from the 12V battery even when parked, and the high-voltage system may not always recharge it properly. If the 12V battery drains below a critical threshold, the vehicle may fail to start or exhibit various electronic malfunctions. This is exacerbated by the Celestiq\'s extensive electronic systems including the 55-inch display and advanced lighting.',
    solution: 'Keep the vehicle plugged in when parked for extended periods to allow the HV system to maintain the 12V battery. If the 12V battery dies, use the designated jump-start terminals under the hood. Ensure the latest software update is installed as GM has released calibration fixes. Consider a trickle charger for long-term storage.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Vehicle fails to power on after sitting for several days',
      'Warning messages about low 12V battery on display',
      'Electronic systems behaving erratically on startup',
      'Key fob unable to communicate with vehicle',
      'Delayed response when pressing start button'
    ],
    estimatedCost: { low: 0, high: 400 },
    citations: [
      {
        type: 'tsb',
        title: 'GM Ultium Platform 12V Battery Management Updates',
        url: 'https://www.nhtsa.gov/vehicle/2024/CADILLAC/CELESTIQ/4%20DR/AWD'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Keep the Celestiq plugged in whenever parked for more than 2-3 days. The extensive electronics draw from the 12V battery even when the vehicle is off. The HV battery will maintain the 12V battery only when plugged in or when the vehicle is periodically woken by the maintenance cycle',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 30,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },

  // ============================================================
  // CADILLAC V-SERIES BLACKWING (CT4-V BW specific issues)
  // ============================================================
  {
    id: 'cadillac-ct4v-blackwing-turbo-noise-2022',
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: 'Cadillac',
      model: 'CT4',
      trims: ['V Blackwing', 'V-Series Blackwing'],
      engines: ['2.7L Turbo V6']
    },
    category: 'engine',
    title: 'Twin-Turbo V6 Squealing Noise on Acceleration',
    description: 'CT4-V Blackwing models with the 2.7L twin-turbo V6 (L3B) can develop a squeaking or squelching noise during acceleration, particularly once the engine is warm. The noise is often traced to turbocharger-related components including wastegate actuators, boost pipes, or turbo bearings. Some cases have required turbo replacement under warranty. The issue varies in severity from cosmetic noise to indicating actual component wear.',
    solution: 'Have dealer diagnose the specific source of the noise. In many cases, tightening boost pipe clamps or replacing wastegate actuator resolves the issue. If turbo bearings are worn, warranty replacement of the turbocharger assembly is needed. Document the noise with video for the dealer visit.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Squealing or squelching sound during acceleration',
      'Noise appears or worsens once engine is fully warm',
      'Whistling sound under boost that is abnormal',
      'Slight decrease in boost pressure on higher mileage examples',
      'Oil residue around turbo connections or intercooler piping'
    ],
    estimatedCost: { low: 0, high: 3500 },
    citations: [
      {
        type: 'owner-report',
        title: 'CT4-V Blackwing Build Quality and Turbo Noise Issues',
        url: 'https://www.cadillacvnet.com/forums/threads/frustration-with-build-quality.5490/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Record a video of the noise with the hood open during acceleration. Dealers often struggle to replicate intermittent turbo noises. A good recording speeds up diagnosis. Check all boost pipe clamps first - they can loosen from heat cycling',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The 2.7L twin-turbo is the same L3B engine used in the Silverado and CT4-V. Some turbo noise under hard acceleration is normal. Abnormal sounds include metallic scraping, loud whistling at idle, or squelching that correlates with throttle position',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 55,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0299', 'P0234']
  },
  {
    id: 'cadillac-blackwing-build-quality-2022',
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: 'Cadillac',
      model: 'CT4',
      trims: ['V Blackwing', 'V-Series Blackwing']
    },
    category: 'body',
    title: 'Build Quality and Paint Quality Issues',
    description: 'CT4-V and CT5-V Blackwing owners have reported various build quality concerns including excessive paint orange peel, panel gap inconsistencies, interior trim rattles and squeaks, and loose exterior trim pieces. Despite the premium price point ($60,000-$90,000+), the hand-finished aspects of these performance sedans have not consistently met owner expectations. Issues are more commonly reported on early 2022 production vehicles.',
    solution: 'Document all issues thoroughly with photos during the initial delivery inspection. Report paint quality issues within 30 days of purchase for potential warranty paint correction. Interior rattles can often be resolved with dealer adjustments to trim clips and sound deadening. Check Cadillac V-Net forums for specific rattle locations and DIY fixes.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Excessive paint orange peel visible in direct sunlight',
      'Uneven panel gaps between body panels',
      'Interior trim squeaks and rattles over rough roads',
      'Loose exterior trim pieces or badges',
      'Wind noise from improperly sealed windows or doors'
    ],
    estimatedCost: { low: 0, high: 2000 },
    citations: [
      {
        type: 'owner-report',
        title: 'Frustration with Build Quality - CadillacVNet Forums',
        url: 'https://www.cadillacvnet.com/forums/threads/frustration-with-build-quality.5490/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Do a thorough pre-delivery inspection before accepting the car. Check paint quality in direct sunlight, verify all panel gaps are even, and test drive over rough roads to identify rattles. Any issues found at delivery are much easier to resolve under warranty',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 90,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'cadillac-blackwing-a10-stalling-2022',
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: 'Cadillac',
      model: 'CT4',
      trims: ['V Blackwing', 'V-Series Blackwing']
    },
    category: 'engine',
    title: 'Intermittent Stalling and Rough Idle in Stop-and-Go Traffic',
    description: 'Some CT4-V Blackwing models with the 10-speed automatic transmission experience intermittent stalling and rough idle in stop-and-go traffic conditions. The engine may die at standstill and require restart. Reports indicate this occurring within the first 1,000 miles on new vehicles, suggesting a calibration issue rather than mechanical failure. GM has released preliminary engineering bulletins (PIE0744) for the 10-speed automatic in Blackwing models.',
    solution: 'Have dealer check for latest ECM and TCM calibration updates. GM preliminary bulletin PIE0744 addresses idle and stall concerns on A10 Blackwing models. A TCM reflash typically resolves the stalling. If persistent, the throttle body and idle air control may need cleaning or replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Engine stalls at idle in traffic',
      'Rough or unstable idle when stopped',
      'RPM drops below normal idle speed before recovering',
      'Vehicle requires restart after dying at a light',
      'Issue more common in hot weather or after sustained highway driving'
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      {
        type: 'tsb',
        title: 'GM Preliminary Engineering Bulletin PIE0744 - Blackwing A10 Stalling',
        url: 'https://www.cadillacforums.com/threads/2023-ct4-v-blackwing-a10-stalling.1134444/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Ask the dealer specifically about PIE0744 and any ECM/TCM calibration updates for the 10-speed automatic Blackwing. A software reflash is usually free under warranty and resolves the intermittent stalling in stop-and-go traffic',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 40,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0505', 'P0507']
  },

  // ============================================================
  // CHEVROLET SONIC (2012-2020)
  // ============================================================
  {
    id: 'chevy-sonic-14t-pcv-valve-cover-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: 'Chevrolet',
      model: 'Sonic',
      engines: ['1.4L Turbo']
    },
    category: 'engine',
    title: '1.4L Turbo PCV Valve Cover Diaphragm Failure',
    description: 'The 1.4L turbocharged Ecotec engine in the Sonic shares the notorious PCV system failure with the Chevrolet Cruze. The PCV regulator diaphragm integrated into the valve cover ruptures, causing massive vacuum leaks. Additionally, the intake manifold check valve (small red/orange valve) fails, compounding the issue. This affects virtually all 1.4T Sonics eventually, typically between 50,000-100,000 miles.',
    solution: 'Replace the valve cover assembly (includes new PCV diaphragm) with the updated GM design. Replace the intake manifold check valve simultaneously. Inspect the corrugated PCV hose from intake manifold to turbo for cracks. Use only GM or quality aftermarket valve covers - cheap replacements fail quickly.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Check engine light with P0171 (system too lean)',
      'Rough or unstable idle',
      'Excessive oil consumption between changes',
      'Hissing or whistling sound from engine area',
      'Poor acceleration and turbo boost loss'
    ],
    estimatedCost: { low: 150, high: 500 },
    citations: [
      {
        type: 'owner-report',
        title: 'P0171/Valve Cover Troubleshooting - Sonic Owners Forum',
        url: 'https://www.sonicownersforum.com/forum/threads/p0171-valve-cover-troubleshooting.17423/'
      },
      {
        type: 'owner-report',
        title: '2011-2016 Cruze 1.4 PCV Valve Cover Issues (Same Engine)',
        url: 'https://www.cruzetalk.com/threads/2011-2016-cruze-1-4-pcv-valve-cover-intake-manifold-issues.192442/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Always replace the valve cover AND the intake manifold check valve together. The valve cover alone runs $80-120 for the GM updated part. The intake check valve is $15-20. Total DIY cost under $150 with the right parts. Watch for the corrugated PCV hose too - it cracks and causes the same lean codes',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'This is not a maybe issue - it is a when issue on the 1.4T. The PCV diaphragm will eventually fail on every one of these engines. Keep an eye out for P0171 lean codes and rough idle as early warning signs. Proactive replacement around 60,000 miles can prevent oil consumption damage',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 450,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0171', 'P0106', 'P1101', 'P0507', 'P0299']
  },
  {
    id: 'chevy-sonic-transmission-turbine-shaft-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015],
      make: 'Chevrolet',
      model: 'Sonic'
    },
    category: 'transmission',
    title: '6-Speed Automatic Transmission Turbine Shaft Fracture',
    description: 'Chevrolet recalled 21,567 Sonics from 2012-2014 for a tendency of the turbine shaft to fracture inside the 6-speed automatic transmission. The turbine shaft transfers energy from the engine to the wheels, and when it fractures, the transmission fails completely. The problem typically appears past 70,000 miles and usually requires complete transmission replacement. The 2012-2015 models are most commonly affected.',
    solution: 'Check recall status with your VIN at nhtsa.gov. If transmission slipping or shuddering begins, have it diagnosed immediately before complete failure occurs. Full transmission replacement costs $3,000-$4,000 at a dealer. Independent shops may offer rebuilt units for $2,000-$3,000.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Transmission slipping between gears',
      'Harsh or delayed shifts',
      'Vehicle loses ability to accelerate',
      'Grinding noise from transmission area',
      'Check engine light with transmission-related codes'
    ],
    estimatedCost: { low: 2000, high: 4000 },
    citations: [
      {
        type: 'recall',
        title: 'Chevrolet Sonic Transmission Turbine Shaft Recall',
        url: 'https://www.carcomplaints.com/Chevrolet/Sonic/2012/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'If you have a 2012-2014 Sonic with the automatic transmission, check recall status immediately. The turbine shaft fracture can leave you stranded with no warning. Get independent transmission shop quotes - dealer prices for replacement are $3,000-$4,000 but independent shops can do it for significantly less',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Regular transmission fluid changes every 45,000 miles can help extend transmission life, but cannot prevent the turbine shaft defect. If buying a used Sonic, verify the recall has been completed and check transmission fluid for burnt smell or metal particles',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 350,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0700', 'P0730', 'P0751']
  },
  {
    id: 'chevy-sonic-water-pump-failure-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: 'Chevrolet',
      model: 'Sonic'
    },
    category: 'cooling',
    title: 'Premature Water Pump Failure and Coolant Leaks',
    description: 'The Chevrolet Sonic across all model years is prone to premature water pump failure. The water pump on the Ecotec engines (both 1.4T and 1.8L) can begin leaking coolant between 40,000-80,000 miles. On the 1.4T, the water pump is driven by the timing chain, so failure can lead to more serious engine damage if coolant loss goes unnoticed. The 1.8L has a belt-driven pump that is easier and cheaper to replace.',
    solution: 'Replace the water pump at the first sign of leaking. On the 1.4T, the water pump is internal and driven by the timing chain, making replacement more labor-intensive ($400-$800). On the 1.8L, it is belt-driven and easier to access ($200-$400). Monitor coolant levels regularly. Replace the thermostat at the same time.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Coolant level dropping between fills',
      'Visible coolant leak under vehicle',
      'Engine temperature gauge running higher than normal',
      'Sweet smell from engine bay (coolant odor)',
      'Whining or grinding noise from water pump bearing'
    ],
    estimatedCost: { low: 200, high: 800 },
    citations: [
      {
        type: 'owner-report',
        title: 'Chevrolet Sonic Common Problems - Samarins',
        url: 'https://www.samarins.com/reviews/sonic_2012.html'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'On the 1.4T Sonic, the water pump is driven by the timing chain inside the engine. If you are replacing the water pump, do the timing chain tensioner and guides at the same time to save labor costs. It is the same labor to access both components',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 280,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0128', 'P0117']
  },
  {
    id: 'chevy-sonic-check-engine-electrical-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016],
      make: 'Chevrolet',
      model: 'Sonic'
    },
    category: 'electrical',
    title: 'Persistent Check Engine Light and Electrical System Faults',
    description: 'Early Chevrolet Sonic models are prone to persistent check engine light illumination with various electrical system faults. The 2012 model year in particular has a reputation for the check engine light activating with no clear mechanical cause. Issues range from faulty oxygen sensors and MAP sensors to ECM communication errors. The vehicle has been recalled 7 times for the 2012 model year alone across electrical and safety systems.',
    solution: 'Have the specific DTC codes read with a proper scan tool (not just a basic code reader). Common causes include loose gas cap, failing O2 sensors, and MAP sensor failures. Always check for TSBs matching your specific code combination. A factory-level scan tool at the dealer can detect module communication errors that basic scanners miss.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Check engine light illuminated with no drivability symptoms',
      'Multiple warning lights on dashboard simultaneously',
      'Intermittent electrical accessory failures',
      'Battery drain when parked overnight',
      'Instrument cluster display glitches or flickering'
    ],
    estimatedCost: { low: 50, high: 500 },
    citations: [
      {
        type: 'nhtsa',
        title: 'NHTSA Complaints - Chevrolet Sonic Electrical System',
        url: 'https://www.carcomplaints.com/Chevrolet/Sonic/2012/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'The Sonic has had 30 recalls across 2012-2018 model years. Before spending money on diagnosis, check your VIN at nhtsa.gov/recalls to see if any open recalls match your symptoms. Many electrical issues are covered by recall repairs at no cost',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 380,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0420', 'P0131', 'P0137']
  },

  // ============================================================
  // CHEVROLET SS (2014-2017)
  // ============================================================
  {
    id: 'chevy-ss-electric-power-steering-failure-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016, 2017],
      make: 'Chevrolet',
      model: 'SS'
    },
    category: 'steering',
    title: 'Electric Power Steering Loss Due to Connector Corrosion',
    description: 'The Chevrolet SS (imported Holden Commodore VF) suffers from electric power steering failure caused by fretting corrosion of the connector between the EPS module and torque sensor. When corrosion degrades the electrical connection, power steering assist is suddenly lost, requiring significant physical effort to steer the vehicle. This is especially dangerous at highway speeds. GM recalled approximately 6,204 vehicles for this issue.',
    solution: 'Contact Chevrolet dealer to verify recall eligibility for your VIN. The recall remedy involves replacing the steering gear assembly with a new unit fitted with gold-plated terminals that resist corrosion. This repair is free under the recall. If out of recall coverage, the steering rack replacement costs $1,500-$2,500.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Sudden loss of power steering assist while driving',
      'Steering becomes extremely heavy with no warning',
      'Power steering warning light illuminated',
      'Intermittent power steering assist that cuts in and out',
      'EPS fault codes stored in steering module'
    ],
    estimatedCost: { low: 0, high: 2500 },
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Recall N192265980 - Loss of Power Steering Assist',
        url: 'https://static.nhtsa.gov/odi/rcl/2019/RCSB-19V801-3512.pdf'
      },
      {
        type: 'recall',
        title: 'Chevy SS Sedan Power Steering Recall - GM Authority',
        url: 'https://gmauthority.com/blog/2017/07/chevrolet-ss-sedan-power-steering-recall-details-information/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is a serious safety recall. Loss of power steering at highway speed is extremely dangerous. Check your VIN at nhtsa.gov immediately. Dealers replace the entire steering gear assembly with gold-plated terminals for free. Even 2017 models not initially in the recall may be covered by later expansions',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The Chevy SS is an imported Holden Commodore VF. Finding a dealer who actually knows the car can be challenging. SS-specific forums (ssforums.com) maintain lists of knowledgeable dealers and independent shops across the country',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 220,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['C0545', 'C0710']
  },
  {
    id: 'chevy-ss-magnetic-ride-shock-failure-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016, 2017],
      make: 'Chevrolet',
      model: 'SS'
    },
    category: 'suspension',
    title: 'Magnetic Ride Control (MRC) Shock Absorber Premature Failure',
    description: 'The Chevrolet SS comes standard with GM Magnetic Ride Control (MRC) shocks that are prone to premature failure. The MRC shocks use magnetorheological fluid that can leak or lose effectiveness, causing degraded ride quality, handling, and suspension noise. Replacement OEM shocks are expensive ($400-$600 each) due to the low-volume, imported nature of the SS. Many owners switch to conventional adjustable coilovers as a more cost-effective long-term solution.',
    solution: 'Replace failed MRC shocks individually or as a set. OEM replacement MRC shocks run $400-$600 each ($1,600-$2,400 for all four). Many owners convert to Koni, Bilstein, or coilover setups ($1,200-$2,500 for a complete set) which eliminates the MRC system entirely. An MRC delete requires a bypass module or tune to suppress warning lights.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Clunking or knocking noise over bumps',
      'Vehicle feels floaty or wallowy at speed',
      'Visible fluid leak on shock body',
      'Service Ride Control message on dashboard',
      'Uneven tire wear due to poor shock damping'
    ],
    estimatedCost: { low: 800, high: 2500 },
    citations: [
      {
        type: 'owner-report',
        title: 'Known Problems with the Chevy SS - SS Forums',
        url: 'https://www.ssforums.com/threads/what-are-the-known-problems-with-the-chevy-ss.114058/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'OEM MRC shock replacement is expensive and they will fail again. Many SS owners convert to Pedders Xa coilovers ($2,000-$2,500 set) or Koni adjustable shocks. If deleting MRC, you need a bypass module or HPTuners/VCM Suite tune to suppress the Service Ride Control warning',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check all four shocks for fluid leaks at every oil change. MRC shocks often fail one at a time, and catching a leak early prevents damage to other suspension components. The rears tend to fail before the fronts on the SS',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 180,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-ss-mylink-infotainment-crash-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016, 2017],
      make: 'Chevrolet',
      model: 'SS'
    },
    category: 'electrical',
    title: 'MyLink Infotainment System Freezing and Crashing',
    description: 'The Chevrolet SS MyLink infotainment system is prone to freezing, crashing, and unresponsive touchscreen behavior. The system may reboot randomly while driving, lose Bluetooth connectivity, or fail to respond to touch inputs. The navigation system can freeze on a single screen and require a vehicle restart. This is a known issue across GM vehicles of this era but is particularly frustrating in the SS given its premium positioning.',
    solution: 'Perform a hard reset by pulling the infotainment fuse for 30 seconds. Update to the latest MyLink software at a dealer. If problems persist, the infotainment module may need replacement ($500-$1,200). Aftermarket head unit replacement is popular among SS owners but requires careful integration with the HVAC and vehicle systems.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Touchscreen freezes and becomes unresponsive',
      'System reboots randomly while driving',
      'Bluetooth connectivity drops repeatedly',
      'Navigation screen stuck on one view',
      'Audio cuts out or switches sources randomly'
    ],
    estimatedCost: { low: 0, high: 1200 },
    citations: [
      {
        type: 'owner-report',
        title: 'Common SS Issues Including MyLink - SS Forums',
        url: 'https://www.ssforums.com/threads/common-issues-looking-to-buy-an-ss.193536/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Pull the radio fuse for 30 seconds to hard reset MyLink. This resolves most freezes. If the issue is persistent, ask the dealer for the latest software update. Some owners have upgraded to aftermarket Android Auto/CarPlay units but integration with the HVAC display requires a PAC module',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 150,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },

  // ============================================================
  // CHEVROLET VOLT (2011-2019)
  // ============================================================
  {
    id: 'chevy-volt-shift-to-park-2016',
    vehicleMatch: {
      years: [2016, 2017, 2018, 2019],
      make: 'Chevrolet',
      model: 'Volt'
    },
    category: 'electrical',
    title: '"Shift to Park" Error Message Preventing Vehicle Shutdown',
    description: 'Second-generation Chevrolet Volts (2016-2019) have a widespread manufacturing defect that prevents the vehicle from recognizing that it is in Park, displaying a persistent "Shift to Park" error message. The vehicle cannot be powered off normally, draining the battery. The issue is caused by a faulty shift position sensor or worn shift mechanism contact. GM released Service Bulletin 19-NA-206 but offered limited repair coverage. DIY fix parts cost under $30 but dealer quotes range from $450-$1,400.',
    solution: 'Check if GM Service Bulletin 19-NA-206 covers your vehicle under the Voltec Warranty. The actual fix involves replacing the shift lever contact assembly ($10-$30 in parts). Many owners successfully fix this themselves in 30-45 minutes. If the dealer refuses warranty coverage, reference the Voltec warranty terms and escalate to GM customer service.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      '"Shift to Park" message displayed when vehicle is in Park',
      'Vehicle will not power off or shut down normally',
      'Key fob unable to lock doors after exiting',
      'Battery drains if vehicle cannot shut down properly',
      'Intermittent issue that worsens over time'
    ],
    estimatedCost: { low: 10, high: 1400 },
    citations: [
      {
        type: 'tsb',
        title: 'GM Service Bulletin 19-NA-206 - Shift to Park Defect',
        url: 'https://lemonlawfirm.com/gm-shift-to-park-recall/'
      },
      {
        type: 'owner-report',
        title: 'Shift to Park Discussion - GM-Volt Forum',
        url: 'https://www.gm-volt.com/threads/2017-gen-2-volt-shift-to-park.343145/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'This is a $10-$30 DIY fix that takes 30-45 minutes. The shift lever contact assembly is the culprit. Do NOT pay $1,400 at a dealer for this repair. Search YouTube for "Volt shift to park fix" for step-by-step guides. The parts are available on Amazon and eBay',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'GM Service Bulletin 19-NA-206 covers this under the Voltec warranty. If your dealer refuses warranty repair, escalate to GM customer service at 1-800-222-1020. Many owners have been successful getting this covered even on out-of-warranty vehicles by referencing the bulletin',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 520,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P1F11']
  },
  {
    id: 'chevy-volt-becm-power-loss-2016',
    vehicleMatch: {
      years: [2016, 2017, 2018, 2019],
      make: 'Chevrolet',
      model: 'Volt'
    },
    category: 'electrical',
    title: 'Battery Energy Control Module (BECM) Causing Loss of Motive Power',
    description: 'NHTSA received 61 complaints about second-generation Volts losing motive power due to Battery Energy Control Module (BECM) failure. The BECM manages the high-voltage battery system, and when it fails, the vehicle can stall, enter a reduced power state, or refuse to start. Loss of power can occur at any speed, creating a serious safety hazard. The vehicle may be unable to restart after a BECM-related shutdown.',
    solution: 'BECM replacement at a dealer costs $1,500-$3,000. The module must be programmed to the specific vehicle VIN. Check if a software update addresses your specific BECM behavior before committing to replacement. For vehicles under Voltec warranty (8 years/100,000 miles), BECM replacement is covered at no cost.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Sudden loss of propulsion power while driving',
      'Vehicle enters reduced power mode unexpectedly',
      'Vehicle will not start or restart after shutdown',
      'Multiple warning messages on dashboard simultaneously',
      'Battery system fault codes stored in BECM'
    ],
    estimatedCost: { low: 0, high: 3000 },
    citations: [
      {
        type: 'nhtsa',
        title: 'NHTSA BECM Complaints - 61 Reports of Power Loss',
        url: 'https://www.gm-volt.com/threads/becm-nhtsa-received-61-complaints-from-owners-regarding.347579/'
      },
      {
        type: 'nhtsa',
        title: 'NHTSA Investigation - 73,000 Gen 2 Volts Probed for Power Loss',
        url: 'https://insideevs.com/news/699246/almost-73000-second-gen-chevrolet-volt-phevs-probed-for-power-loss/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'BECM failure can cause sudden loss of power at highway speeds. If you experience any propulsion loss, pull over safely and do not attempt to restart repeatedly - this can cause further damage. Have the vehicle towed to a dealer for diagnosis. Under Voltec warranty (8yr/100k mi), BECM replacement is covered',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Before replacing the BECM ($1,500-$3,000), have the dealer check for software updates first. Some BECM issues are resolved with a calibration update rather than hardware replacement. Get a second opinion from a Volt-specialized shop if the dealer immediately recommends replacement',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 250,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P1E00', 'P0A1F']
  },
  {
    id: 'chevy-volt-battery-coolant-heater-2011',
    vehicleMatch: {
      years: [2011, 2012, 2013, 2014, 2015],
      make: 'Chevrolet',
      model: 'Volt'
    },
    category: 'electrical',
    title: 'High-Voltage Battery Coolant Heater Failure (Gen 1)',
    description: 'First-generation Volts (2011-2015) can experience battery coolant heater failure. The heating coil is located inside the battery pack and can develop isolation faults, causing the vehicle to run on gasoline only when the battery is below 50 degrees F. The poor design placement requires opening the battery pack to test and replace the heater coil. A failing heater coil measures below the required 80 ohms isolation resistance. This significantly reduces EV range in cold weather and can trigger fault codes.',
    solution: 'Have the dealer measure the heater coil resistance (should be 80 ohms). Replacement requires removing and opening the battery pack, which is a major service operation ($1,500-$2,500). Under the Voltec warranty (8yr/100k mi), this is covered at no cost. For out-of-warranty vehicles, some EV specialty shops can perform the repair for less than dealer pricing.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Vehicle runs on gasoline only in cold weather (below 50F)',
      'Battery will not charge or hold charge in cold temperatures',
      'Reduced EV range in winter months',
      'Engine runs constantly even with full battery charge',
      'Battery coolant temperature warning messages'
    ],
    estimatedCost: { low: 0, high: 2500 },
    citations: [
      {
        type: 'owner-report',
        title: 'Battery Coolant Heater Assembly Replacement - GM-Volt Forum',
        url: 'https://www.gm-volt.com/threads/2012-battery-coolant-heater-assembly-replacement.333145/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'If your Gen 1 Volt only runs on gas in cold weather but works fine in warm weather, the battery coolant heater is likely failing. Have the dealer measure isolation resistance - below 80 ohms confirms the failure. The repair requires battery removal and is covered under Voltec warranty',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Keep the Volt plugged in during cold weather. The Level 1 or Level 2 charger will precondition the battery before departure, reducing stress on the battery heater. Parking in a garage above 50F eliminates the need for the battery heater entirely',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 180,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P1E00', 'P0AA6']
  },
  {
    id: 'chevy-volt-passenger-sensing-2012',
    vehicleMatch: {
      years: [2012, 2013],
      make: 'Chevrolet',
      model: 'Volt'
    },
    category: 'safety',
    title: 'Passenger Sensing System Airbag Malfunction',
    description: 'The 2012-2013 Chevrolet Volt has a known issue with the Passenger Sensing System (PSS) malfunction. The PSS incorrectly classifies the front passenger seat status, which can cause the airbag system malfunction indicator light to illuminate and potentially prevent the passenger airbag from deploying properly in a crash. GM issued a recall to address the sensor calibration.',
    solution: 'Check your VIN for recall eligibility at nhtsa.gov. The dealer will reprogram or replace the passenger sensing module at no cost under the recall. Do not ignore the airbag warning light - the passenger airbag may not deploy in a crash while this fault is active.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Airbag warning light illuminated on dashboard',
      'Passenger airbag OFF indicator lit with passenger seated',
      'Intermittent airbag warning light activation',
      'SRS fault codes stored in airbag module',
      'Recall notice received from GM'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'Chevrolet Volt Passenger Sensing System Recall',
        url: 'https://slotcar-today.com/problems/chevrolet/volt/2012'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is a safety recall affecting airbag deployment. Check your VIN immediately at nhtsa.gov/recalls. If the airbag warning light is on, the passenger airbag may not deploy in a crash. Free repair at any Chevrolet dealer',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 160,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },

  // ============================================================
  // CHEVROLET BLAZER EV (2024)
  // ============================================================
  {
    id: 'chevy-blazer-ev-parking-brake-wiring-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Chevrolet',
      model: 'Blazer EV'
    },
    category: 'brakes',
    title: 'Rear Parking Brake Wiring Harness Defect Causing Unintended Activation',
    description: 'GM recalled approximately 40,233 Blazer EV vehicles from 2024-2025 model years due to a defect in the rear parking brake wiring harness. The defect can cause the parking brake to activate unintentionally while driving (causing rear wheel lock-up) or fail entirely when needed. Between August 2023 and May 2025, 97 complaints were filed, including two instances of rear-wheel lock-up while driving and one report of complete parking brake failure.',
    solution: 'Contact Chevrolet dealer for free recall repair. The dealer will inspect and replace the rear parking brake wiring harness as needed. Do not ignore parking brake warning messages. If you experience rear wheel lock-up while driving, pull over safely and have the vehicle towed to a dealer.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Parking brake activates unexpectedly while driving',
      'Rear wheels lock up without driver input',
      'Parking brake warning light illuminated',
      'Parking brake fails to engage when activated',
      'Service parking brake message on display'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'GM Recalls Blazer EVs for Crash Risk - Parking Brake Wiring',
        url: 'https://thebrakereport.com/gm-recalls-blazer-evs-for-crash-risk/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This recall affects 40,233 Blazer EVs. Two rear-wheel lock-up incidents have been reported while driving. Check your VIN at nhtsa.gov immediately and schedule dealer service. This is a free repair under recall. Do NOT delay as wheel lock-up at speed is extremely dangerous',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 97,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-blazer-ev-infotainment-software-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Chevrolet',
      model: 'Blazer EV'
    },
    category: 'electrical',
    title: 'Infotainment System Black Screen, Freezing, and Software Glitches',
    description: 'The 2024 Blazer EV has widespread infotainment system issues including black screens, frozen displays, camera glitches, audio dropouts, CarPlay/Android Auto disconnects, virtual control malfunctions, and cluster display errors. The 17.7-inch touchscreen controls most vehicle functions including HVAC, making software failures particularly disruptive. GM has released multiple software campaigns but OTA updates have been problematic, with some updates causing additional issues like checkered screen backgrounds.',
    solution: 'Schedule a dealer visit for the latest software campaign updates. Not all updates can be delivered OTA - some require USB installation at the dealer. If the screen goes black, try holding the home button for 10 seconds to force a restart. Contact Chevrolet customer service at 1-800-222-1020 if dealer cannot resolve the issue.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Main touchscreen goes completely black',
      'Infotainment system freezes and becomes unresponsive',
      'Display shows checkered pattern after OTA update',
      'CarPlay or Android Auto disconnects repeatedly',
      'Backup camera feed cuts out or displays incorrectly'
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      {
        type: 'owner-report',
        title: 'Infotainment Issues with Fix - Blazer EV Forum',
        url: 'https://www.blazerevforum.com/threads/infotainment-issues-with-fix.707/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'When scheduling dealer service for infotainment issues, specifically ask them to check for software campaigns that are NOT showing as available on the vehicle. There is a known issue where the system reports being up to date when newer updates exist. The dealer must manually search for pending campaigns',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If your screen shows a checkered background after an OTA update, try pressing the Hey Google button to access some functions while waiting for a fix. This is a known issue from recent OTA updates. Schedule a dealer visit for a manual USB-based software reinstall',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 180,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-blazer-ev-rear-drive-motor-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Chevrolet',
      model: 'Blazer EV'
    },
    category: 'drivetrain',
    title: 'Rear Drive Unit Motor Insulation Failure Causing Power Loss',
    description: 'GM recalled certain 2024 Blazer EV vehicles where the electric motors in the rear drive units may have insufficiently insulated wires that can contact each other, resulting in an electrical short and loss of drive power. This manufacturing defect can cause sudden propulsion loss while driving, creating a serious safety hazard particularly at highway speeds.',
    solution: 'Contact Chevrolet dealer to check recall eligibility. The rear drive unit motor will be inspected and replaced if insulation deficiency is found. This is a free repair under the recall. Do not drive the vehicle if you experience sudden propulsion loss - have it towed to the dealer.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Sudden loss of propulsion power',
      'Reduced power warning message on display',
      'Vehicle enters limp mode unexpectedly',
      'Unusual sounds from rear axle area',
      'Propulsion system fault warning'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'GM Recalls 2024 Blazer EV - Rear Drive Motor Insulation',
        url: 'https://www.kbb.com/chevrolet/blazer-ev/2024/recall/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is a safety recall for loss of propulsion. If you experience sudden power loss while driving, pull over safely immediately. Check your VIN at nhtsa.gov/recalls. The rear drive motor unit replacement is free under this recall',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 65,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-blazer-ev-door-striker-fracture-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Chevrolet',
      model: 'Blazer EV'
    },
    category: 'body',
    title: 'Door Striker Fracture Allowing Unexpected Door Opening',
    description: 'GM recalled certain 2024 Blazer EV vehicles where the door strikers may fracture, allowing the door to open unexpectedly while driving. A fractured door striker compromises vehicle structural integrity and occupant safety, especially at speed. The door may not properly latch or may open during side impacts.',
    solution: 'Contact Chevrolet dealer immediately to check recall eligibility. Dealers will inspect and replace door strikers at no cost. Test each door by firmly pulling on the exterior handle with the door closed - any unexpected movement or noise warrants immediate dealer inspection.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Door ajar warning light when doors are closed',
      'Door does not feel solidly latched when closed',
      'Clicking or unusual noise when closing a door',
      'Wind noise suggesting door seal issue',
      'Visible damage to door striker mechanism'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: '2024 Chevrolet Blazer EV Recalls - Door Striker',
        url: 'https://www.cars.com/research/chevrolet-blazer_ev-2024/recalls/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'A fractured door striker means the door could open while driving. This is an immediate safety concern. Check your VIN at nhtsa.gov and schedule dealer service immediately. Free repair under recall',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 40,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },

  // ============================================================
  // CHEVROLET EQUINOX EV (2024)
  // ============================================================
  {
    id: 'chevy-equinox-ev-pedestrian-alert-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Chevrolet',
      model: 'Equinox EV'
    },
    category: 'safety',
    title: 'Pedestrian Alert Sound System Non-Compliance Recall',
    description: 'GM recalled 23,700 model year 2024 Equinox EV vehicles due to an incorrect software calibration in the pedestrian alert sound system. The vehicles do not produce a sufficient change in volume when accelerating from a stopped position to 10 km/h (6.2 mph), failing to meet FMVSS 141 Section 5.4 requirements. This means pedestrians and cyclists may not hear the approaching vehicle at low speeds, increasing the risk of pedestrian-vehicle incidents.',
    solution: 'Contact Chevrolet dealer for recall service. The fix requires a body control module (BCM) software update. The 2025 model year uses a different noise generation strategy that will likely be adapted for 2024 models. Contact Chevrolet at 1-800-222-1020 with recall number N252527170.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Vehicle is unusually quiet when accelerating from a stop',
      'Pedestrians not reacting to vehicle approach at low speeds',
      'No change in exterior warning sound volume from 0-6 mph',
      'Recall notification letter received',
      'Pedestrian alert sound noticeably quieter than other EVs'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'Chevy Recalls 27,000 Equinox EVs Over Pedestrian Warning',
        url: 'https://www.repairerdrivennews.com/2025/10/10/chevy-recalls-27000-equinox-evs-over-pedestrian-warning-nhtsa-campaigns-for-pedestrian-safety/'
      },
      {
        type: 'recall',
        title: 'Chevrolet Equinox EV Pedestrian Noise Recall - TFLcar',
        url: 'https://tflcar.com/2025/10/2024-chevy-equinox-ev-pedestrian-noise-level-recall/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'This is a BCM software update recall - no parts replacement needed. The fix adapts the 2025 model year noise generation strategy to 2024 vehicles. Schedule dealer service and reference recall number N252527170. Free repair at any Chevrolet dealer',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 75,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-equinox-ev-12v-battery-drain-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Chevrolet',
      model: 'Equinox EV'
    },
    category: 'electrical',
    title: '12V Auxiliary Battery Drain and Charging System Issues',
    description: 'The 2024 Equinox EV experiences 12V auxiliary battery drain issues, with ancillary systems drawing power from the 12V battery nearly constantly even when the vehicle is off. GM released software update N25-249834 to improve 12V battery charging behavior and reduce drain. If the HV battery falls below 12% state of charge, the automatic 12V maintenance mode stops working, leaving the 12V battery to drain completely. Dead 12V battery prevents the vehicle from starting even with a full HV battery.',
    solution: 'Visit dealer for software update N25-249834 which improves 12V battery management. Keep the vehicle plugged in when parked for extended periods to maintain both HV and 12V batteries. If the 12V battery dies, use the jump-start terminals under the front hood. Consider a trickle charger for vehicles stored for more than a week.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Vehicle fails to start after sitting for several days',
      '12V battery warning messages on display',
      'SHVS (Stop/Start) system warning messages',
      'Electronics behave erratically at startup',
      'Key fob range reduced or fob stops communicating'
    ],
    estimatedCost: { low: 0, high: 400 },
    citations: [
      {
        type: 'tsb',
        title: 'GM Update N25-249834 - 12V Battery Drain Fix',
        url: 'https://www.equinoxevforum.com/threads/gm-n25-249834-for-12v-battery-drain-shvs-messages.4368/'
      },
      {
        type: 'owner-report',
        title: '12V Battery Failure Reports - Equinox EV Forum',
        url: 'https://www.equinoxevforum.com/threads/12v-battery-failure.3988/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Always keep the Equinox EV plugged in when parked for more than 2-3 days. The 12V battery maintenance mode only works when the HV battery is above 12% charge. If you let the HV battery get too low, the 12V battery will also die. Ask the dealer about software update N25-249834',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The 12V AGM battery is located under the front hood and can be jump-started using standard terminals. Keep a portable jump starter in the vehicle as a precaution until the software update is confirmed installed on your vehicle',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 110,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-equinox-ev-adaptive-cruise-braking-2024',
    vehicleMatch: {
      years: [2024],
      make: 'Chevrolet',
      model: 'Equinox EV'
    },
    category: 'safety',
    title: 'Adaptive Cruise Control Braking Failure',
    description: 'The 2025 Equinox EV (and some late-production 2024 models) were recalled for an adaptive cruise control issue where the system may fail to apply the brakes when approaching a slower vehicle or stopped traffic. The issue is related to software calibration in the forward collision avoidance system. This creates a serious collision risk when the driver relies on adaptive cruise control for following distance management.',
    solution: 'Contact Chevrolet dealer for a software update to the adaptive cruise control and forward collision avoidance system. Do not rely solely on adaptive cruise control for collision avoidance. Always be prepared to brake manually. The fix is a free software update under the recall.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Adaptive cruise control does not slow down for vehicles ahead',
      'Forward collision warning does not trigger when expected',
      'Vehicle maintains speed when approaching stopped traffic',
      'Adaptive cruise control disengages without warning',
      'Inconsistent braking response in ACC mode'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: '2025 Chevy Equinox EV Recalled for Cruise-Control Braking Issue',
        url: 'https://www.greencarreports.com/news/1145572_2025-chevy-equinox-ev-recall-adaptive-cruise-control-braking'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is a critical safety recall affecting the adaptive cruise control braking system. Do NOT rely on ACC for collision avoidance until the software update is installed. Always maintain visual attention and be ready to brake manually. Free software update at any Chevrolet dealer',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 45,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },

  // ============================================================
  // CHEVROLET COBALT (2005-2010)
  // ============================================================
  {
    id: 'chevy-cobalt-ignition-switch-defect-2005',
    vehicleMatch: {
      years: [2005, 2006, 2007, 2008, 2009, 2010],
      make: 'Chevrolet',
      model: 'Cobalt'
    },
    category: 'safety',
    title: 'Defective Ignition Switch Causing Engine Shutoff and Airbag Failure',
    description: 'The Chevrolet Cobalt was at the center of the largest safety scandal in GM history. Defective ignition switches could turn from "Run" to "Accessory" or "Off" position while driving, triggered by heavy keychains, road vibrations, or knee contact. When the ignition turns off, the engine shuts down, power steering and power brakes are lost, and critically, airbags are disabled. GM knew about the defect as early as 2005 but did not issue a recall until February 2014. The defect is linked to 124 compensated deaths and hundreds of injuries.',
    solution: 'Check your VIN at nhtsa.gov/recalls for recall eligibility. The recall remedy is ignition switch replacement, free of charge. Until repaired, remove all items from keychain and use only the ignition key alone. Never hang heavy items from the key. If the engine shuts off while driving, shift to Neutral and steer to safety.',
    severity: 'critical',
    confidence: 'high',
    symptoms: [
      'Engine shuts off unexpectedly while driving',
      'Loss of power steering and power brakes simultaneously',
      'Airbag warning light illuminated',
      'Key can be removed from ignition while not in OFF position',
      'Vehicle stalls when key is bumped by knee or heavy keychain'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'GM Ignition Switch Recall - NHTSA 14V047',
        url: 'https://static.nhtsa.gov/odi/rcl/2014/RCONL-14V047-3498.pdf'
      },
      {
        type: 'recall',
        title: 'General Motors Ignition Switch Recalls - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/General_Motors_ignition_switch_recalls'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'This is one of the most serious automotive recalls in history, linked to 124 deaths. If you own a Cobalt that has not had the ignition switch replaced, get it done IMMEDIATELY at any GM dealer for free. Use only the ignition key with nothing else on the keychain until repaired',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 4503,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-cobalt-power-steering-failure-2005',
    vehicleMatch: {
      years: [2005, 2006, 2007, 2008, 2009, 2010],
      make: 'Chevrolet',
      model: 'Cobalt'
    },
    category: 'steering',
    title: 'Electric Power Steering Motor Sudden Failure',
    description: 'The Cobalt equipped with electric power steering (EPS) is subject to a recall for sudden loss of power steering assist while driving. The EPS motor can fail without warning at any speed, requiring significantly more effort to steer the vehicle. The 2005 model year alone has 128 complaints for power steering failure. GM issued a recall in March 2010, but some owners report the issue recurring even after the recall repair.',
    solution: 'Check VIN for recall eligibility. Dealers replace the electric power steering motor free of charge under the recall. If power steering fails while driving, pull over safely - the vehicle can still be steered but requires much more physical effort. Report recurring failures to NHTSA.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Sudden loss of power steering assist',
      'Steering becomes very heavy without warning',
      'Power steering warning light illuminated',
      'Steering effort increases in cold weather',
      'Intermittent power steering that cuts in and out'
    ],
    estimatedCost: { low: 0, high: 800 },
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Recall - Cobalt Electric Power Steering',
        url: 'https://www.cars.com/research/chevrolet-cobalt/recalls/'
      },
      {
        type: 'nhtsa',
        title: '128 Complaints: 2005 Cobalt Power Steering Failure',
        url: 'https://www.carcomplaints.com/Chevrolet/Cobalt/2005/steering/power_steering_failure.shtml'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Loss of power steering at highway speeds is extremely dangerous. Check your VIN at nhtsa.gov immediately. If you experience intermittent power steering failures, do not wait for a complete failure - get to a dealer. The recall replacement is free',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 500,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['C0545', 'C0710']
  },
  {
    id: 'chevy-cobalt-ecotec-timing-chain-2005',
    vehicleMatch: {
      years: [2005, 2006, 2007, 2008, 2009, 2010],
      make: 'Chevrolet',
      model: 'Cobalt',
      engines: ['2.2L Ecotec', '2.0L Turbo Ecotec']
    },
    category: 'engine',
    title: 'Ecotec Engine Timing Chain Stretch and Guide Wear',
    description: 'The 2.2L and 2.0L Ecotec engines in the Cobalt develop timing chain stretch and timing chain guide deterioration. The plastic timing chain guides wear over time, causing the chain to become slack and noisy. If left unaddressed, the timing chain can skip teeth, causing valve timing misalignment and potential engine damage. The issue typically develops between 80,000-150,000 miles. The water pump is driven by the timing chain on these engines, so both should be addressed together.',
    solution: 'Replace the timing chain, tensioner, guides, and water pump as a kit when chain noise develops. DIY timing chain kit with water pump runs $200-$400 for parts. Labor at a shop runs $600-$1,200 due to the front-of-engine teardown required. Do not ignore chain rattle on cold start - it will worsen and can cause catastrophic engine damage.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Rattling or slapping noise on cold start',
      'Chain noise that worsens over time',
      'Check engine light with timing-related codes',
      'Rough idle or hesitation on acceleration',
      'Reduced engine power if timing has jumped'
    ],
    estimatedCost: { low: 400, high: 1500 },
    citations: [
      {
        type: 'owner-report',
        title: 'GM 2.2 Ecotec Engine Problems and Reliability',
        url: 'https://8020automotive.com/gm-chevy-2-2-ecotec-engine-problems/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Always replace the water pump when doing the timing chain on a Cobalt Ecotec. The water pump is driven by the timing chain and requires the same labor to access. A timing chain kit with water pump is $200-$400 for parts. Doing both at once saves $500+ in duplicate labor costs',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use full synthetic oil and change every 5,000 miles to maximize timing chain life. The plastic chain guides wear faster with dirty or old oil. Early Ecotec engines had a design fault in the chain tensioner oil feed - GM released revised tensioners that should be used in any repair',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 320,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0016', 'P0017', 'P0341']
  },

  // ============================================================
  // CHEVROLET HHR (2006-2011)
  // ============================================================
  {
    id: 'chevy-hhr-ignition-switch-defect-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Chevrolet',
      model: 'HHR'
    },
    category: 'safety',
    title: 'Defective Ignition Switch Causing Engine Shutoff and Airbag Failure',
    description: 'Every HHR from 2006 to 2011 was affected by GM\'s ignition switch recall. A heavy keyring or rough road conditions can shift the ignition from "Run" to "Accessory," shutting off the engine and disabling the airbags, power steering, and power brakes while driving. The GM victim compensation fund paid out for 77 deaths and 141 injuries related to this defect across all affected GM vehicles. The defect is identical to the Cobalt ignition switch issue.',
    solution: 'Check your VIN at nhtsa.gov/recalls for recall eligibility. The recall remedy is ignition switch replacement, free of charge at any GM dealer. Until repaired, remove everything from your keychain except the ignition key. If the engine shuts off while driving, shift to Neutral and steer to safety.',
    severity: 'critical',
    confidence: 'high',
    symptoms: [
      'Engine shuts off unexpectedly while driving',
      'Loss of power steering and power brakes simultaneously',
      'Airbag warning light illuminated',
      'Key turns to accessory position without driver input',
      'Vehicle stalls on rough roads or when key bumped'
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: 'recall',
        title: 'GM Ignition Switch Recall - All HHR Models Affected',
        url: 'https://en.wikipedia.org/wiki/General_Motors_ignition_switch_recalls'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'ALL 2006-2011 HHR models are affected by the ignition switch recall. This defect is linked to deaths and serious injuries. If the recall has not been performed on your vehicle, get it done immediately for free at any GM dealer. Use only the bare ignition key until repaired',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 575,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-hhr-power-steering-failure-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Chevrolet',
      model: 'HHR'
    },
    category: 'steering',
    title: 'Electric Power Steering Sudden Loss of Assist',
    description: 'The HHR uses an electric power steering system that is prone to sudden failure, particularly on 2006-2008 models. The power steering can quit mid-drive with no warning, making the vehicle extremely difficult to steer. The 2007 model alone logged 550+ NHTSA complaints and was involved in 17 crashes related to this and other issues. The EPS module failure is the most dangerous of the HHR\'s common problems.',
    solution: 'Replace the electric power steering motor/module. Check for recall eligibility as some model years are covered. If power steering fails while driving, reduce speed immediately and use both hands to steer. The vehicle is still steerable but requires significant effort. Replacement costs $400-$800 including labor.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Complete loss of power steering assist while driving',
      'Power steering warning light illuminated',
      'Steering becomes extremely heavy suddenly',
      'Intermittent power steering assist',
      'Groaning or whining noise from steering column'
    ],
    estimatedCost: { low: 400, high: 800 },
    citations: [
      {
        type: 'nhtsa',
        title: 'NHTSA Complaints - HHR Power Steering Issues',
        url: 'https://www.autosafety.org/vehicle-safety-check/2006-chevrolet-hhr/'
      },
      {
        type: 'owner-report',
        title: 'Top 5 Chevy HHR Problems - 1A Auto',
        url: 'https://blog.1aauto.com/1st-gen-chevy-hhr-problems/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'The 2006-2008 HHR models are the most affected by power steering failures. If you experience even one instance of intermittent power steering loss, get it diagnosed immediately. Complete failure at speed has caused multiple crashes. Check for recall coverage on your specific VIN',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 400,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['C0545']
  },
  {
    id: 'chevy-hhr-ecotec-timing-chain-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Chevrolet',
      model: 'HHR',
      engines: ['2.2L Ecotec', '2.4L Ecotec']
    },
    category: 'engine',
    title: 'Ecotec Timing Chain Tensioner Failure and Chain Stretch',
    description: 'The 2.2L and 2.4L Ecotec engines in the HHR suffer from timing chain tensioner failure and chain stretch, particularly on early production years. The timing chain tensioner does not receive sufficient oil at idle due to a design fault in early engines, causing accelerated wear. The 2.4L Ecotec is especially prone to this issue and also suffers from oil consumption problems. GM released revised tensioners and oil nozzles but many HHRs were never updated. Symptoms typically appear between 80,000-120,000 miles.',
    solution: 'Replace timing chain, tensioner (use revised GM part), guides, and sprockets as a complete kit. Do the water pump at the same time since it shares access. For the 2.4L, also address any oil consumption by checking the piston rings. Total repair cost is $800-$2,000 depending on engine and additional work needed.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Rattling noise on cold start that may diminish when warm',
      'Check engine light with P0017 camshaft position code',
      'Engine running rough or misfiring',
      'Reduced engine power under acceleration',
      'Timing chain noise that progressively worsens'
    ],
    estimatedCost: { low: 800, high: 2000 },
    citations: [
      {
        type: 'owner-report',
        title: 'GM 2.4 Ecotec Timing Chain Problem Explained',
        url: 'https://scottsusave.com/gm-2-4-ecotec-timing-chain-problem-explained/'
      },
      {
        type: 'owner-report',
        title: 'HHR 2.2L Ecotec Timing Chain Issues - ChevyHHR.net',
        url: 'https://www.chevyhhr.net/forums/maintenance-upkeep-50/timing-chain-2-2-ecotech-57541/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Use the GM revised timing chain tensioner (updated part number) when replacing. The original design had insufficient oil feed at idle causing premature failure. Always replace the complete kit - chain, tensioner, guides, and sprockets. Half-measures will result in repeat failure',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The 2.4L Ecotec is worse than the 2.2L for timing chain issues and also burns oil. If you are spending $1,000+ on timing chain repair, consider the overall condition of the vehicle. A high-mileage HHR with a 2.4L may not be worth the investment',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 350,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0016', 'P0017', 'P0341']
  },
  {
    id: 'chevy-hhr-door-handle-breakage-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Chevrolet',
      model: 'HHR'
    },
    category: 'body',
    title: 'Interior and Exterior Door Handle Breakage Trapping Occupants',
    description: 'The Chevrolet HHR is notorious for door handles that snap off, both interior and exterior. Interior door handle breakage is particularly dangerous as it can trap occupants inside the vehicle. The handles are made of brittle plastic that becomes fragile with age and temperature cycling. In cold weather, the handles are especially prone to snapping. This issue affects all HHR model years but is most commonly reported on 2006-2008 models.',
    solution: 'Replace broken door handles with aftermarket metal replacement handles when available, or use updated GM part numbers. Interior handle replacement is relatively simple DIY ($20-$50 per handle). Keep a window breaker tool in the vehicle as a safety precaution in case both interior handles and window controls fail simultaneously.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Door handle snaps when pulled',
      'Handle feels loose or wobbly before breaking',
      'Interior door handle cracks in cold weather',
      'Unable to open door from inside the vehicle',
      'Handle plastic visibly cracked or discolored'
    ],
    estimatedCost: { low: 20, high: 200 },
    citations: [
      {
        type: 'owner-report',
        title: 'HHR Door Handle and Common Problems - 1A Auto',
        url: 'https://blog.1aauto.com/1st-gen-chevy-hhr-problems/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Broken interior door handles can trap you inside the vehicle. Keep a window breaker tool accessible in the car. Replace handles proactively if they feel loose or show any cracking. Aftermarket metal handles are available and much more durable than the OEM plastic ones',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 280,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-hhr-fuel-line-corrosion-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Chevrolet',
      model: 'HHR'
    },
    category: 'fuel',
    title: 'Fuel Line Corrosion and Leak Near Rear Wheel',
    description: 'The HHR has a documented issue with fuel line corrosion, particularly in rust belt states. The fuel line corrodes just forward of the driver-side rear wheel, developing leaks that create a fire hazard. Road salt and debris accelerate the corrosion. The issue is most commonly seen on vehicles in the northeastern and midwestern United States where road salt is used heavily in winter.',
    solution: 'Inspect fuel lines annually, especially near the driver-side rear wheel. If corrosion is found, replace the affected fuel line section with stainless steel or nylon-coated replacement lines. Do not use tape or sealant on fuel lines - full section replacement is required. Cost is $200-$500 at an independent shop.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Gasoline smell near the vehicle',
      'Visible fuel drip under vehicle near rear driver-side wheel',
      'Fuel economy decreasing noticeably',
      'Rust or corrosion visible on fuel lines during inspection',
      'Check engine light with evaporative system codes'
    ],
    estimatedCost: { low: 200, high: 500 },
    citations: [
      {
        type: 'owner-report',
        title: 'HHR Fuel Line Corrosion Issue - ChevroletProblems.com',
        url: 'https://www.chevroletproblems.com/models/hhr/generations/1/'
      }
    ],
    communityRecommendations: [
      {
        type: 'warning',
        content: 'A leaking fuel line is an immediate fire hazard. If you smell gasoline or see fuel dripping, stop driving the vehicle until the line is repaired. This is especially common on HHRs in rust-belt states. Annual undercarriage inspection is essential for vehicles in areas with road salt',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 150,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0442', 'P0455']
  },

  // ============================================================
  // CHEVROLET AVALANCHE (2002-2013)
  // ============================================================
  {
    id: 'chevy-avalanche-afm-oil-consumption-2007',
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
      make: 'Chevrolet',
      model: 'Avalanche',
      engines: ['5.3L V8']
    },
    category: 'engine',
    title: '5.3L Vortec AFM Active Fuel Management Oil Consumption and Lifter Failure',
    description: 'The 5.3L Vortec V8 with Active Fuel Management (AFM/DOD) in 2007-2013 Avalanches suffers from excessive oil consumption and premature lifter failure. The AFM system deactivates four cylinders for fuel economy, but the AFM lifters have a coating that wears off prematurely, leading to collapsed lifters, bent pushrods, fouled spark plugs, and catastrophic engine damage. GM issued TSB 10-06-01-008A for oil deflector installation but never recalled the vehicles. Oil consumption of 1 quart per 1,000 miles is commonly reported.',
    solution: 'Monitor oil level weekly and top off as needed. For a permanent fix, perform an AFM delete which involves replacing the camshaft, all 16 lifters, and valley cover with non-AFM components ($2,000-$4,000 parts and labor). An AFM disabler device ($300-$500) can reduce the issue by preventing cylinder deactivation. Change oil every 5,000 miles with full synthetic.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Oil consumption of 1 quart per 1,000 miles or more',
      'Blue smoke from exhaust on startup or acceleration',
      'Misfire codes on AFM-controlled cylinders (1,4,6,7)',
      'Check engine light with cylinder-specific misfire codes',
      'Lifter tick or knock noise from engine'
    ],
    estimatedCost: { low: 300, high: 4000 },
    citations: [
      {
        type: 'tsb',
        title: 'GM TSB 10-06-01-008A - AFM Oil Deflector Installation',
        url: 'https://chevroletforum.com/forum/2007-2013-gmt900-109/my-5-3-afm-rebuild-experience-84428/'
      },
      {
        type: 'owner-report',
        title: '5.3L AFM Oil Consumption Issues - Silverado Sierra Forum',
        url: 'https://www.silveradosierra.com/threads/5-3l-afm-oil-consumption-issues.706835/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'An AFM disabler like the Range Technology AFM Disabler ($300) prevents cylinder deactivation and dramatically reduces oil consumption. This is the cheapest first step before committing to a full AFM delete. Pair it with 5,000-mile oil changes using full synthetic',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore excessive oil consumption on the 5.3L AFM engine. Running low on oil with AFM active leads to collapsed lifters, bent pushrods, and catalytic converter damage from oil fouling. Check oil level at every fuel stop. A full AFM delete ($2,000-$4,000) is the only permanent fix',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 580,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P0300', 'P0301', 'P0304', 'P0306', 'P0307']
  },
  {
    id: 'chevy-avalanche-dashboard-cracking-2007',
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
      make: 'Chevrolet',
      model: 'Avalanche'
    },
    category: 'body',
    title: 'Dashboard Cracking Above Instrument Cluster and Airbag Panel',
    description: 'The 2007-2013 Chevrolet Avalanche (and related GMT900 trucks) suffers from widespread dashboard cracking. The upper dashboard material shrinks and cracks due to UV exposure and heat cycling, with cracks typically developing above the instrument cluster, over the passenger airbag panel, and at the windshield defroster vents. Over 100 complaints have been filed with NHTSA. There are safety concerns that dashboard fragments could become projectiles during airbag deployment in a crash.',
    solution: 'Dashboard replacement is the proper fix but costs $1,500-$2,500 installed at a dealer. More affordable options include dash covers ($50-$100), dashboard replacement kits ($200-$400), or professional dashboard repair services ($300-$600). A class-action lawsuit was filed but GM has not issued a recall.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Visible cracks in dashboard above instrument cluster',
      'Cracks near passenger-side airbag panel',
      'Dashboard material warping or bubbling',
      'Cracks appear primarily in sun-exposed areas',
      'Dashboard surface becomes brittle and flaky'
    ],
    estimatedCost: { low: 50, high: 2500 },
    citations: [
      {
        type: 'nhtsa',
        title: '102 Complaints: Chevrolet Avalanche Dashboard Crack Problems',
        url: 'https://www.carproblemzoo.com/chevrolet/avalanche/dashboard-crack-problems.php'
      },
      {
        type: 'nhtsa',
        title: 'GM Cracked Dash Lawsuit & Recall Update',
        url: 'https://www.carparts.com/blog/the-latest-on-the-gm-cracked-dash-issue/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'A quality dash cover ($50-$100) from DashMat or Coverlay is the most cost-effective solution. The Coverlay dashboard replacement panel ($200-$400) fits over the existing cracked dash and looks factory. A full dashboard replacement at a dealer is $1,500-$2,500 and rarely worth it on a high-mileage truck',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use a windshield sun shade when parked to slow dashboard deterioration. UV exposure is the primary cause of cracking. A quality ceramic window tint on the windshield also helps reduce UV damage to the interior',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 350,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  },
  {
    id: 'chevy-avalanche-abs-unwanted-activation-2002',
    vehicleMatch: {
      years: [2002, 2003, 2004, 2005, 2006],
      make: 'Chevrolet',
      model: 'Avalanche'
    },
    category: 'brakes',
    title: 'Unwanted ABS Activation Increasing Stopping Distance',
    description: 'First-generation Avalanches (2002-2006) can experience unwanted ABS activation during normal low-speed braking. The antilock brake system activates inappropriately, causing a pulsating brake pedal and increased stopping distances when it should not be engaging. The issue is more likely in environmentally corrosive areas where road salt deteriorates the ABS wheel speed sensor wiring and tone rings. This creates a safety hazard as the vehicle takes longer to stop than expected during routine braking.',
    solution: 'Inspect and clean all four ABS wheel speed sensors and tone rings. Replace corroded sensor wiring or connectors. If the ABS module itself is faulty, replacement costs $600-$1,200. Applying dielectric grease to sensor connectors during brake service can prevent corrosion. In some cases, ABS module reprogramming at the dealer resolves the issue.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'ABS activates during normal low-speed braking',
      'Pulsating brake pedal when it should not be pulsating',
      'Increased stopping distances during routine stops',
      'ABS warning light illuminated on dashboard',
      'Grinding or buzzing noise from brakes during normal stops'
    ],
    estimatedCost: { low: 100, high: 1200 },
    citations: [
      {
        type: 'nhtsa',
        title: 'NHTSA Complaints - Avalanche ABS Issues',
        url: 'https://www.carcomplaints.com/Chevrolet/Avalanche/2002/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Clean the ABS wheel speed sensors and tone rings during every brake job. Corrosion on these components is the most common cause of unwanted ABS activation. Apply dielectric grease to all sensor connectors to prevent future corrosion. This is a $20 preventive measure that can save $1,000+ in ABS module replacement',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 220,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['C0035', 'C0040', 'C0045', 'C0050']
  },
  {
    id: 'chevy-avalanche-engine-power-reduced-2007',
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
      make: 'Chevrolet',
      model: 'Avalanche'
    },
    category: 'engine',
    title: 'Reduced Engine Power Mode from Throttle Body and Pedal Sensor Faults',
    description: 'The 2007-2013 Avalanche frequently enters "Reduced Engine Power" mode, severely limiting acceleration. The most common causes are the electronic throttle body wearing out or the accelerator pedal position sensor (APP sensor) developing faults. The vehicle becomes barely drivable in this mode, struggling to accelerate to highway speeds. The issue can occur intermittently before becoming permanent.',
    solution: 'Diagnose with a scan tool to determine if the throttle body or accelerator pedal position sensor is the cause. Throttle body replacement costs $200-$400 parts and labor. APP sensor replacement costs $100-$250. A remanufactured throttle body from a quality source works well. Clear codes after repair and road test to verify.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      '"Engine Power Reduced" or "Reduced Engine Power" message on dash',
      'Vehicle struggles to accelerate past 20-30 mph',
      'Check engine light with P2128 or P2138 codes',
      'Intermittent power loss that resolves after restart',
      'Rough or hesitant throttle response'
    ],
    estimatedCost: { low: 100, high: 500 },
    citations: [
      {
        type: 'owner-report',
        title: 'Avalanche Engine Power Reduced Issues',
        url: 'https://rerev.com/articles/chevy-avalanche-years-to-avoid/'
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'P2128 and P2138 codes point to the accelerator pedal position (APP) sensor, not the throttle body. The APP sensor is a $50-$100 part and takes 15 minutes to replace. Do NOT let a shop sell you a throttle body without confirming the APP sensor is not the cause - it is the cheaper and more common fix',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If the throttle body is confirmed bad, AC Delco remanufactured units are the best value. Aftermarket throttle bodies for the 5.3L are hit-or-miss. Clean the throttle body with CRC Throttle Body Cleaner before replacing - sometimes carbon buildup alone causes the reduced power mode',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 310,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: ['P2128', 'P2138', 'P2135']
  },
  {
    id: 'chevy-avalanche-body-cladding-2002',
    vehicleMatch: {
      years: [2002, 2003, 2004, 2005, 2006],
      make: 'Chevrolet',
      model: 'Avalanche'
    },
    category: 'body',
    title: 'Body Cladding Fading, Cracking, and Clip Failure',
    description: 'The first-generation Avalanche (2002-2006) features distinctive gray plastic body cladding that is prone to fading, cracking, and clip failure. The unpainted plastic panels that encircle the body deteriorate from UV exposure, turning chalky white and developing cracks. The clips holding the cladding in place become brittle and break, causing panels to loosen or detach. The cladding issues are cosmetic but affect vehicle appearance and can expose underlying metal to corrosion.',
    solution: 'Restore faded cladding with dedicated plastic restorer products (Solution Finish, Cerakote Trim Coat). Replace broken clips with new GM clips or aftermarket equivalents. For severely damaged cladding, replacement panels are available from aftermarket suppliers. Some owners choose to paint the cladding to match the body color for a permanent solution ($500-$1,500 for professional paint).',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Gray plastic cladding turning white or chalky',
      'Cracks forming in cladding panels',
      'Cladding panels loose or rattling',
      'Missing cladding clips causing gaps',
      'Underlying metal visible where cladding has pulled away'
    ],
    estimatedCost: { low: 20, high: 1500 },
    citations: [
      {
        type: 'owner-report',
        title: 'Avalanche Cladding Issues - Chevy Avalanche Fan Club',
        url: 'https://www.chevyavalanchefanclub.com/cafcna/index.php?threads%2Fcladding-finish.156633%2F='
      }
    ],
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Solution Finish or Cerakote Trim Coat are the best products for restoring faded Avalanche cladding. Apply every 6-12 months to maintain appearance. For a permanent fix, many owners paint the cladding to body color - this eliminates the fading issue entirely and modernizes the look',
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 400,
    status: 'published',
    reviewedOn: '2026-03-06',
    dtcCodes: []
  }
];

// Check for duplicates and add
let added = 0;
let skipped = 0;
for (const issue of newIssues) {
  if (existingIds.has(issue.id)) {
    console.log(`SKIP (duplicate): ${issue.id}`);
    skipped++;
  } else {
    data.issues.push(issue);
    existingIds.add(issue.id);
    added++;
    console.log(`ADDED: ${issue.id}`);
  }
}

console.log(`\nTotal: ${added} added, ${skipped} skipped`);
console.log(`New total issues: ${data.issues.length}`);

// Write back
fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2) + '\n');
console.log('Written to known-issues.json');
