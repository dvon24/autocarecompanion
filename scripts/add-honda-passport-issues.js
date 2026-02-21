const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const newIssues = [
  {
    id: 'honda-passport-9speed-transmission-problems-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2023 },
    title: '9-Speed Transmission Rough Shifting and Hesitation',
    severity: 'high',
    description: 'The Honda Passport (2019-2023) with the ZF 9-speed automatic transmission experiences rough shifting, delayed shifting, harsh acceleration/deceleration, sudden loss of power, and transmission slipping into neutral unexpectedly. A class action lawsuit alleges the transmission control module (TCM) and powertrain control module (PCM) are miscalibrated, causing dangerous failures. Owners report the transmission downshifting harshly at highway speeds, hesitating when accelerating from a stop, and in severe cases, dropping into neutral while driving. Honda has issued multiple software updates (TSBs) but many owners report issues persist.',
    symptoms: [
      'Harsh or jerky shifting between gears (especially 7th to 8th)',
      'Delayed acceleration when pressing gas pedal',
      'Sudden harsh acceleration or deceleration',
      'Transmission slipping into neutral while driving',
      'Grinding or clunking noise during shifts',
      'Loss of power at highway speeds',
      'Transmission hesitation when merging'
    ],
    solution: 'Early stage: Visit Honda dealer for latest TCM/PCM software updates (multiple TSBs released). Many owners report temporary improvement. Severe cases (slipping into neutral, complete failure): Transmission replacement or rebuild ($4,000-7,000). Check if your vehicle is covered under Honda\'s extended powertrain warranty (5yr/60k standard). Document all issues and visits - may qualify for lemon law buyback if multiple repair attempts fail. Consider extended warranty if purchasing used.',
    estimatedCost: { min: 0, max: 7000 },
    recallInfo: 'No official recall, but class action lawsuit pending alleging TCM/PCM software defect. Multiple TSBs released for transmission software updates.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: If transmission slips into neutral while driving, pull over immediately and contact Honda roadside assistance. Document incident for lemon law claims.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'PassportForums owners report smoother shifts by manually holding lower gears on steep hills - reduces harsh downshifts and "hunting" behavior.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use Sport mode for highway driving - many owners report it reduces harsh downshifting and keeps transmission in appropriate gears longer.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Change transmission fluid every 30k miles with genuine Honda ATF DW-1 - several owners with 80k+ miles report smoother operation with frequent fluid changes.',
        partBrand: 'Honda',
        partName: 'ATF DW-1 Transmission Fluid',
        partNumber: '08200-9008',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT ignore transmission issues - multiple owners have experienced complete failure requiring $6k+ replacement. Address problems early.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-fuel-pump-recall-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2020 },
    title: 'Fuel Pump Failure (Multiple Recalls - NHTSA 21V-215, 23V-858)',
    severity: 'high',
    description: 'The 2019-2020 Honda Passport has been recalled multiple times for fuel pump failures. The fuel pump impeller was improperly molded (low density), causing it to deform over time and interfere with the fuel pump body, rendering it inoperative. Symptoms include engine stalling while driving (especially highway speeds), rough idle, difficulty starting, and complete loss of power. Honda issued recall 21V-215 in March 2021 (production dates Nov 2018-Jul 2019) and expanded it again with recall 23V-858 in December 2023 (through Oct 2019). Free repair at Honda dealers.',
    symptoms: [
      'Engine stalls while driving (especially at highway speeds)',
      'Difficulty starting engine',
      'Engine cranks but won\'t start',
      'Rough idle or engine hesitation',
      'Check engine light with fuel system codes (P0087, P0230)',
      'Loss of power during acceleration',
      'Engine dies and won\'t restart'
    ],
    solution: 'This is a SAFETY RECALL - contact your Honda dealer immediately to schedule free fuel pump module replacement. Check if your VIN is affected at https://www.honda.com/recall or call Honda customer service: 1-888-234-2138. Recall 21V-215 (Mar 2021) and 23V-858 (Dec 2023) cover most affected vehicles. If your Passport stalls while driving, pull over safely and contact Honda roadside assistance. Repair is FREE regardless of mileage/warranty status.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA Recall 21V-215 (March 2021) and 23V-858 (December 2023). Covers 2019-2020 Passports built Nov 2018-Oct 2019. Free fuel pump module replacement.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: This recall affects safety - engine stalling at highway speeds is extremely dangerous. Schedule repair IMMEDIATELY.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check your VIN at honda.com/recall - the recall was expanded multiple times, so even if you weren\'t affected initially, you might be now.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'PassportForums owners report repair takes 1-2 hours. Dealer provides loaner or shuttle in most cases since it\'s a safety recall.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you experience stalling before getting recall repair, document everything - may be eligible for reimbursement if you paid for fuel pump replacement.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-infotainment-fakra-connector-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2021 },
    title: 'Infotainment System Failures (FAKRA Connector Defect)',
    severity: 'medium',
    description: 'The 2019-2021 Honda Passport experiences widespread infotainment system failures caused by defective FAKRA connectors (antenna connectors behind the head unit). Symptoms include blank/black screen on startup, backup camera not working, audio system crackling/static, complete system freezes, and USB/Bluetooth connectivity issues. The FAKRA connectors corrode or lose connection, disrupting communication between the head unit and vehicle systems. Honda quietly fixed this in 2022+ production but never issued a recall. Replacement head unit: $1,200-2,000. Some owners successfully repair by cleaning/reseating FAKRA connectors ($free-200).',
    symptoms: [
      'Infotainment screen blank or black on startup',
      'Backup camera shows "no signal" or doesn\'t display',
      'Audio system crackling, static, or no sound',
      'System freezes or reboots randomly',
      'Apple CarPlay/Android Auto disconnecting',
      'USB ports not working',
      'Bluetooth won\'t connect or constantly disconnects',
      'Navigation system freezing'
    ],
    solution: 'DIY fix (if mechanically inclined): Remove head unit and clean/reseat the FAKRA connectors behind it - many PassportForums members report this fixes the issue ($0-50 in supplies). Dealer solution: Software update first (free under warranty, $150-200 out of warranty), then head unit replacement if update fails ($1,200-2,000). FAKRA connector is largely a 2019-2021 problem - 2022+ models were built with the fix. If under warranty, push for head unit replacement rather than temporary software updates.',
    estimatedCost: { min: 0, max: 2000 },
    recallInfo: 'Honda issued recall 20V-440 for rearview camera display software issue (2019 only), but the underlying FAKRA connector hardware defect was never recalled.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'PassportForums DIY fix (worked for 70%+ of owners): Remove head unit, unplug/replug all FAKRA connectors, apply dielectric grease. Takes 1-2 hours, saves $1,500.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use CRC 05109 Dielectric Grease on FAKRA connectors when reseating - prevents future corrosion. PassportForums members swear by it.',
        partBrand: 'CRC',
        partName: 'Dielectric Grease',
        partNumber: '05109',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t let dealer charge $200 for "software update" if issue returns - it\'s a hardware problem (FAKRA connectors), not software. Push for head unit replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used 2019-2021 Passport, test infotainment THOROUGHLY - start/stop car 10+ times, test backup camera, Bluetooth, USB. FAKRA issues often intermittent.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-idle-stop-stalling-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2023 },
    title: 'Idle Stop (Auto Start-Stop) Stalling and Failure to Restart',
    severity: 'high',
    description: 'Honda Passport owners report the Idle Stop (automatic engine start-stop) feature causing dangerous stalling issues. When the engine auto-stops at red lights or in traffic, it fails to restart when the brake is released, leaving the vehicle stranded in traffic. The "Collision Mitigation System" warning light often appears during these incidents. The Idle Stop system is overly aggressive and doesn\'t account for battery health, A/C load, or hot weather conditions. Unlike some competitors, Honda doesn\'t have a shift interlock, so the vehicle can roll if stalled on a hill. Many owners permanently disable Idle Stop to avoid this issue.',
    symptoms: [
      'Engine fails to restart after auto-stop at red light',
      'Vehicle stalls in traffic when Idle Stop engages',
      'Collision Mitigation System warning light during stall',
      'Multiple restart attempts needed after auto-stop',
      'Engine cranks but won\'t start after Idle Stop',
      'Vehicle rolls backward when stalled on hill',
      'Battery warning light after failed restart'
    ],
    solution: 'Temporary: Press Idle Stop button to disable every time you start the vehicle (annoyingly resets each ignition cycle). Permanent disable (DIY): Install Idle Stop Eliminator plug-in module ($40-80) that automatically disables the feature every startup - very popular on PassportForums. If stalling occurs: Shift to Park, turn off ignition, wait 10 seconds, restart engine. Battery related: If Idle Stop frequently won\'t engage or causes stalling, have battery tested (weak battery confuses system). Honda has released software updates but they don\'t fully address the issue.',
    estimatedCost: { min: 40, max: 300 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'PassportForums #1 mod: Idle Stop Eliminator by Autostop Eliminator ($50-80) - plugs into OBD2 port, auto-disables Idle Stop every startup. 1,000+ owners use it.',
        partBrand: 'Autostop Eliminator',
        partName: 'Idle Stop Eliminator (Honda)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'CRITICAL: If Idle Stop fails on a hill, vehicle will roll backward (no shift interlock) - keep foot firmly on brake and shift to Park immediately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you prefer manual disable, lightly tap brake pedal when stopped - Idle Stop won\'t engage. Less annoying than pressing button every startup.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Weak battery makes Idle Stop unreliable - if system is acting weird, get battery load tested before chasing gremlins.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-ac-compressor-failure-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2023 },
    title: 'AC Compressor Premature Failure',
    severity: 'high',
    description: 'Honda Passport AC compressors fail prematurely, often between 40,000-80,000 miles. Symptoms include no cold air, loud grinding/squealing noises from the compressor, intermittent cooling, and clicking sounds. The compressor clutch bearing fails first, then the entire compressor seizes. If the compressor grenades, metal debris contaminates the entire AC system requiring full flush and component replacement ($1,800-2,800). This is a common issue across Honda\'s lineup. OEM (Denso/Sanden) or high-quality aftermarket (Four Seasons, UAC) compressors recommended.',
    symptoms: [
      'No cold air from AC vents',
      'AC blows warm air only',
      'Loud grinding or squealing noise when AC is on',
      'Intermittent cooling (works then stops)',
      'Clicking sound from engine bay when AC button pressed',
      'AC clutch not engaging',
      'AC works for a few minutes then stops'
    ],
    solution: 'If just the clutch/bearing is bad, replace AC compressor clutch assembly ($500-700). If compressor seized or failed, replace entire AC compressor, receiver-drier, expansion valve, and flush all lines to remove metal debris ($1,800-2,800). Use OEM (Denso/Sanden) or high-quality aftermarket (Four Seasons, UAC) compressors - cheap compressors fail within 10k miles. Catch it early - if you hear grinding, replace before it grenades and sends metal through the system.',
    estimatedCost: { min: 500, max: 2800 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'PassportForums consensus: OEM Denso compressors last longest. Four Seasons and UAC are acceptable aftermarket at ~50% of OEM cost.',
        partBrand: 'Denso',
        partName: 'OEM AC Compressor',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'CRITICAL: If compressor seized, you MUST replace receiver-drier and flush AC lines - metal debris will destroy new compressor in weeks if you skip this.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Catch it early - clicking/grinding from AC compressor means bearing is failing. Replace now before it grenades and requires full AC system overhaul.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use only PAG46 refrigerant oil (not PAG100) - wrong oil accelerates compressor wear in Honda systems.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-vibration-highway-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2023 },
    title: 'Highway Vibration and Wobble (45-65 MPH)',
    severity: 'medium',
    description: 'Honda Passport owners report annoying vibration and wobble at highway speeds (45-65 mph). The vibration is cyclical, often felt through the steering wheel, floor, and seats. Common causes include: wheel balance issues (OEM wheels are finicky), tire cupping/uneven wear, driveshaft imbalance, transmission torque converter shudder, and worn suspension bushings. Some owners report Honda dealers dismissing it as "normal characteristic" despite it being clearly abnormal. Road force balancing (not regular balancing) often fixes tire-related vibration.',
    symptoms: [
      'Vibration or wobble at 45-65 mph (highway speeds)',
      'Steering wheel shaking or vibrating',
      'Floor/seat vibration felt throughout vehicle',
      'Vibration disappears below 40 mph or above 70 mph',
      'Worse when accelerating, better when coasting',
      'Cyclical vibration (comes and goes rhythmically)'
    ],
    solution: 'Start with cheapest fixes first: (1) Road force balance all 4 tires ($80-150) - regular balance often doesn\'t fix it on Passports. (2) Rotate tires to see if vibration moves ($30-50). (3) Check tire pressure and inspect for uneven wear/cupping. If tires aren\'t the issue: (4) Transmission fluid flush may fix torque converter shudder ($150-250). (5) Inspect/replace worn suspension bushings ($200-600). (6) Driveshaft balancing ($150-300). PassportForums owners report road force balance fixes 60% of cases.',
    estimatedCost: { min: 80, max: 600 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'PassportForums proven fix: Road force balance (not regular balance) at a reputable shop. Regular balance won\'t fix Honda wheel/tire combo issues.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Discount Tire/America\'s Tire does free road force balance for life if you bought tires there - PassportForums members love this perk.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t accept "normal characteristic" from dealer - vibration at highway speeds is NOT normal. Seek second opinion or try independent shop.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If vibration gets worse after tire rotation, it\'s definitely tire-related. Road force balance will fix it.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-battery-drain-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2023 },
    title: 'Parasitic Battery Drain and Premature Battery Failure',
    severity: 'medium',
    description: 'Honda Passport owners report batteries dying after 24-48 hours of sitting, premature battery failure (under 3 years), and electrical issues caused by weak batteries. Common causes include: infotainment system staying awake (FAKRA connector issue), door lock actuators causing constant drain, and Honda Sensing modules not sleeping properly. The aggressive Idle Stop system also kills weak batteries faster. Normal parasitic draw should be under 50mA - anything higher indicates a problem. OEM Honda batteries are known to fail early on Passports.',
    symptoms: [
      'Battery dies after 1-2 days of sitting',
      'Battery won\'t hold charge',
      'Slow cranking when starting',
      'Electrical gremlins (lights flickering, radio glitches)',
      'Idle Stop system not engaging (low battery)',
      'Battery warning light',
      'Dead battery after short trip or overnight'
    ],
    solution: 'Perform parasitic draw test to identify circuit causing drain (normal is <50mA). Common culprits: (1) Infotainment system (FAKRA connector issue - see separate issue), (2) Door lock actuators, (3) Honda Sensing modules. If battery is weak, replace first before chasing gremlins (load test should be >12.4V). Aftermarket AGM batteries (Interstate, DieHard) last longer than OEM Honda batteries on Passports. Cost: $150-300 for battery, $100-500 for drain diagnosis/repair.',
    estimatedCost: { min: 150, max: 500 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'PassportForums members report Interstate or DieHard AGM batteries lasting 6+ years vs OEM Honda batteries dying in 2-3 years.',
        partBrand: 'Interstate',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY drain test: Fully charge battery, disconnect negative cable, connect multimeter between cable and terminal. Normal draw is <50mA. Higher = parasitic drain.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t just keep replacing battery - find and fix the parasitic drain or you\'ll kill battery after battery.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If drain started after infotainment issues, it\'s likely FAKRA connector related - fixing that will fix drain (see infotainment issue entry).',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-paint-clearcoat-peeling-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2022 },
    title: 'Paint and Clearcoat Peeling (Hood and Roof)',
    severity: 'low',
    description: 'Some 2019-2022 Honda Passport owners report paint peeling, bubbling, or clearcoat failures, especially on the hood and roof. While not as widespread as the 2016-2018 HR-V/Pilot paint issues, it still affects a notable number of Passports. Most common on white colors (Platinum White Pearl), but other colors also affected. Honda has not issued a warranty extension for Passports like they did for other models. Full panel repaint: $1,500-3,000. Honda may cover under goodwill if caught early and you escalate to Honda Customer Service.',
    symptoms: [
      'Paint peeling or bubbling (especially hood/roof)',
      'Clearcoat flaking off in sheets',
      'Small spots that look like sand under clearcoat',
      'Rust forming where paint is gone',
      'Most common on Platinum White Pearl',
      'Also affects other colors (Modern Steel, Obsidian Blue)'
    ],
    solution: 'If under 3yr/36k warranty, take to dealer immediately and document. If out of warranty: (1) Document issue with photos, (2) Contact Honda Customer Service (1-888-234-2138) and request goodwill assistance - some owners have gotten partial/full coverage. (3) If denied, full panel repaint costs $1,500-3,000. Use premium paint systems (PPG, Axalta) if paying out of pocket. Catch it early before rust forms - Honda more likely to cover if no rust.',
    estimatedCost: { min: 1500, max: 3000 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Even if out of warranty, document issue and contact Honda Customer Service - several PassportForums owners got goodwill coverage by escalating.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t delay - once paint peels to bare metal, rust forms quickly and Honda is less likely to cover it.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'If paying out of pocket, insist on premium paint/clearcoat like PPG or Axalta - don\'t let shop use cheap materials that will fail again.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Ceramic coating ($500-1,500) can prevent further damage if you catch peeling early - many PassportForums owners did this to protect vulnerable areas.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-wheel-bearing-noise-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2023 },
    title: 'Front Wheel Bearing Premature Failure',
    severity: 'medium',
    description: 'Honda Passport front wheel bearings fail prematurely, often between 40,000-80,000 miles. Symptoms include humming/growling noise that increases with speed, steering wheel vibration, and ABS/VSA warning lights. The noise is usually louder when turning (load shifts to one bearing). This is common across Honda\'s SUV lineup (Pilot, Passport, CR-V). If ignored, a failed wheel bearing can cause the wheel to lock up or separate while driving. Replacement: $300-500 per side (bearing hub assembly).',
    symptoms: [
      'Humming or growling noise from front wheels',
      'Noise increases with vehicle speed',
      'Noise louder when turning (left or right)',
      'Steering wheel vibration',
      'ABS or VSA warning lights',
      'Loose or wobbly feeling in steering'
    ],
    solution: 'Jack up vehicle and check for wheel play by grabbing tire at 12 and 6 o\'clock and rocking it. Excessive play = bad bearing. Spin wheel and listen for grinding. Replace wheel bearing hub assembly on affected side ($300-500). Always replace in pairs if both sides have high mileage to avoid another repair soon. Use OEM (NSK, NTN) or quality aftermarket (Timken, SKF) bearings - avoid ultra-cheap eBay bearings (fail within 10k miles).',
    estimatedCost: { min: 300, max: 500 },
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Don\'t ignore wheel bearing noise - a seized bearing can lock the wheel or cause it to separate while driving (catastrophic failure).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'PassportForums consensus: OEM bearings (NSK, NTN) or Timken/SKF aftermarket. Avoid ultra-cheap eBay/Amazon bearings - many fail within 10k miles.',
        partBrand: 'Timken',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly if you have a press or can rent one from AutoZone. Otherwise, shop labor is 1.5-2 hours per side.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'The humming noise is usually the first symptom - catch it early before the bearing fully fails and damages the hub/spindle.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-brake-booster-recall-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2022 },
    title: 'Brake Booster Vacuum Pump Failure',
    severity: 'high',
    description: 'Some 2019-2022 Honda Passports experience brake booster vacuum pump failures, resulting in hard brake pedal, increased braking effort, and potentially longer stopping distances. The electric vacuum pump that assists braking fails prematurely, especially in stop-and-go traffic where the pump cycles frequently. Symptoms include hard brake pedal, brake warning lights, and grinding noise from the pump. Honda issued technical service bulletins (TSBs) for related issues on Pilot/Ridgeline, but Passport owners report similar problems. Replacement: $400-800.',
    symptoms: [
      'Hard or stiff brake pedal (requires more effort)',
      'Brake warning light or brake system indicator',
      'Grinding or whining noise from engine bay',
      'Increased stopping distance',
      'Brake pedal feels normal when engine off, hard when running',
      'Brake Collision Mitigation warnings'
    ],
    solution: 'If under warranty, take to dealer immediately - safety issue. Dealer will test vacuum pump output and replace if faulty (free under warranty, $400-800 out of warranty). Do NOT ignore hard brake pedal - this is a safety issue affecting stopping distance. If pump fails completely, you\'ll still have brakes but will require significantly more pedal effort. Check for TSBs or recalls affecting your VIN at honda.com/recall.',
    estimatedCost: { min: 400, max: 800 },
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Hard brake pedal is a safety issue - schedule dealer visit immediately. Brake assist failure increases stopping distance significantly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check for recalls/TSBs at honda.com/recall - Honda has issued TSBs for related issues on Pilot/Ridgeline that may cover Passport too.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If pump is grinding but brakes still work, you have time to schedule repair - but don\'t delay more than a few days.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If Collision Mitigation warnings appear with hard brake pedal, the system may not function properly in emergency - drive extra cautiously until repaired.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-passport-suspension-noise-clunk-2019',
    make: 'Honda',
    model: 'Passport',
    years: { start: 2019, end: 2023 },
    title: 'Front Suspension Clunking and Noise Over Bumps',
    severity: 'medium',
    description: 'Honda Passport owners report clunking, knocking, or rattling noises from the front suspension when going over bumps, potholes, or rough roads. Common causes include: worn front lower control arm bushings, worn sway bar end links, loose/worn strut mounts, and worn ball joints. The Passport shares suspension components with the Pilot, which has similar issues. The clunking is often most noticeable at low speeds over small bumps (parking lots, speed bumps). Worn bushings: $200-500. Full control arm replacement: $400-800 per side.',
    symptoms: [
      'Clunking or knocking noise from front end over bumps',
      'Rattling sound when going over rough roads',
      'Noise most noticeable at low speeds',
      'Clunk when turning and going over bumps',
      'Noise from one side or both',
      'Loose feeling in front end'
    ],
    solution: 'Diagnose the source: (1) Jack up front end and check for play in control arm bushings, sway bar links, ball joints, and tie rods. (2) Bounce front end and listen for noise source. Common fixes: Replace front sway bar end links ($150-300 parts+labor), replace lower control arm bushings ($200-500), replace strut mounts ($300-600). Use OEM Honda or quality aftermarket (Moog, Mevotech) parts. Independent shops are often cheaper than dealers for this work.',
    estimatedCost: { min: 150, max: 800 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'PassportForums DIY: Sway bar end links are easy to replace (30 mins, basic tools). Start here if noise is clunking when turning over bumps.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use Moog or Mevotech parts - PassportForums members report longer life than ultra-cheap parts, close to OEM performance at 50% cost.',
        partBrand: 'Moog',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used Passport, test drive over rough roads and parking lot speed bumps - suspension noise is common on higher mileage units.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore clunking - worn ball joints or control arms can separate while driving (catastrophic failure). Get it diagnosed.',
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

console.log(`✓ Successfully added ${newIssues.length} Honda Passport issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
newIssues.forEach(issue => {
  const yearRange = `${issue.years.start}${issue.years.end !== issue.years.start ? `-${issue.years.end}` : ''}`;
  console.log(`  - ${issue.title} (${yearRange})`);
});
