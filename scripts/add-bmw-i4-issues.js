const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW i4 (G26) issues - 2022-2025
// Powertrain: eDrive40 (rear motor), xDrive40 (dual motor), M50/M60 (high performance dual motor)
// Platform: CLAR, shares with 4 Series Gran Coupe
// iDrive 8 infotainment system

const bmwI4Issues = [
  {
    id: 'bmw-i4-idrive8-software-bugs-2022',
    make: 'BMW',
    model: 'i4',
    years: { start: 2022, end: 2025 },
    title: 'iDrive 8 Software Bugs - Screen Crashes, Reboots & Freezing',
    severity: 'moderate',
    description: 'The BMW i4\'s iDrive 8 curved display system suffers from widespread software instability across all model years. The infotainment system randomly reboots while driving (blank screen for 15-30 seconds), locks up requiring manual power button reset, and experiences post-OTA update regression where previously fixed issues return. When the system crashes, it takes climate controls, navigation, audio, backup camera, and safety displays offline simultaneously. Apple CarPlay and Android Auto integration frequently fails after firmware updates, with audio skips, full disconnections, and Bluetooth profiles overwriting each other. Some owners report the main screen showing only the "BMW" logo on startup and becoming unresponsive. Per i4talk.com polling, approximately 36% of owners report software glitches ranging from minor to severe. Early 2022 models shipped with the most bug-prone software versions.',
    symptoms: [
      'Infotainment screen goes completely blank while driving (15-30 second reboot)',
      'Multiple consecutive system reboots in a single drive',
      'Screen becomes unresponsive to touch input',
      'Screen flickering with live camera feed after reboot',
      'Apple CarPlay/Android Auto disconnects randomly',
      'Climate controls become inaccessible during screen crash',
      'HUD settings, instrument cluster display preferences reset after crash',
      'Main screen stuck on "BMW" logo - won\'t load interface'
    ],
    solution: 'Ensure vehicle has latest iDrive software via OTA update (Settings > Software Update). Version .63 and later resolved many screen blank/reboot issues. For persistent crashes: Perform soft reset by holding volume knob/power button for 10+ seconds. For factory reset, use Settings > General > Reset to restore defaults. If issues persist after latest OTA, dealer can force-flash the head unit via ISTA. Some owners report that disconnecting phone from wireless CarPlay/Android Auto and using wired connection improves stability. BMW has released multiple major software updates addressing these issues.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: 'Multiple software update TSBs; check with dealer for latest version for your VIN',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Soft reset: Hold volume/power knob for 10+ seconds until BMW logo appears - fixes most temporary glitches',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use WIRED CarPlay/Android Auto connection instead of wireless - significantly more stable',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'After OTA update, perform a soft reset and let car sit locked for 30+ min to complete background installation',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT interrupt OTA updates - partial updates can brick the infotainment system requiring dealer reflash',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i4-12v-battery-sleep-mode-2022',
    make: 'BMW',
    model: 'i4',
    years: { start: 2022, end: 2025 },
    title: '12V Battery Drain - Sleep Mode Failure',
    severity: 'moderate',
    description: 'The BMW i4 uses a 60Ah AGM lead-acid 12V battery that powers all vehicle electronics and computers. A software bug can prevent the vehicle from entering proper sleep mode after parking, causing modules to remain active and drain the 12V battery. Exterior lamps may remain illuminated post-parking due to incomplete sleep cycles, siphoning charge overnight and reducing daily range. The Central Charging Unit (CCU) can also malfunction and prevent proper 12V charging from the HV pack. BMW EVs use smaller-capacity 12V batteries than ICE cars since they don\'t need to crank a starter motor, making them more vulnerable to parasitic drain. Battery registration via ISTA or BimmerLink is required after replacement.',
    symptoms: [
      '"Battery discharge" warning message',
      'Vehicle won\'t start after sitting for 2-3 days',
      'Exterior lights staying on after vehicle is locked',
      'Remote functions (BMW app) stop responding',
      'Low 12V battery voltage warning on instrument cluster',
      'Multiple system errors on startup after battery recovers'
    ],
    solution: 'First check for latest software update - BMW has released updates to fix sleep mode bugs. If 12V battery has been deeply discharged, it may need replacement (60Ah AGM). Must register new battery using BimmerLink app (not BimmerCode - BimmerCode cannot register batteries). For vehicles that sit for extended periods, use a BMW-approved battery tender. If CCU is causing the issue, dealer diagnosis and CCU replacement under warranty. The DC-DC converter should maintain 12V charge from the HV battery, so persistent drain indicates a software or CCU hardware fault.',
    estimatedCost: { min: 0, max: 800 },
    recallTSB: 'Software TSB for sleep mode/12V discharge - check with dealer for applicable update',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Use BimmerLINK (not BimmerCode) to register a new 12V battery - $30 app saves a dealer visit',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If car sits for 3+ days, check that latest OTA software is installed - sleep mode fix was included in recent updates',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t ignore 12V battery warnings on an EV - unlike ICE cars, a dead 12V on an EV means NO access to the car at all',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i4-drivetrain-malfunction-2022',
    make: 'BMW',
    model: 'i4',
    years: { start: 2022, end: 2025 },
    title: 'Drivetrain Malfunction / High Voltage System Shutdown',
    severity: 'high',
    description: 'BMW i4 owners report sudden "Drivetrain Malfunction" warnings that can result in complete loss of drive power. The electric drive motor software may incorrectly detect a double-isolation fault condition, triggering a fail-safe mode that shuts down the HV system for 15-20 seconds. This is now a confirmed defect covered under NHTSA recall affecting 2022-2025 i4 models (35,441+ vehicles). Additionally, the cell supervision circuit module (CSC) mounted on top of the battery can malfunction and trigger protective shutdown. Some drivetrain faults are also triggered by DC fast charging issues, particularly with Electrify America chargers. BMW received approximately 43 warranty claims for propulsion loss at speeds exceeding 20 mph.',
    symptoms: [
      'Red "Drivetrain Malfunction" warning on dashboard',
      'Complete loss of drive power for 15-20 seconds',
      'Vehicle enters fail-safe / limp mode',
      '"High Voltage System" error message',
      'Vehicle won\'t enter "Drive Ready" mode',
      'Warning appears after DC fast charging session',
      'Drivetrain malfunction message during normal driving',
      'Error clears after power cycling (turning off and on)'
    ],
    solution: 'BMW has issued a recall for the electric drive motor software issue - the fix is a software update available OTA or at dealer, free of charge. For CSC module failures, the cell supervision circuit module (mounted on battery) must be replaced under warranty. For charging-related drivetrain errors: Ensure Electrify America account has valid payment method (expired cards cause silent failures that trigger vehicle errors). If error clears after soft reboot, it was likely a transient software fault - still report to dealer for documentation. Contact BMW at 1-800-525-7417 for recall status.',
    estimatedCost: { min: 0, max: 2000 },
    recallTSB: 'NHTSA Recall 2025: Electric Drive Motor Software (2022-2025 i4); Recall 23V-449: Combined Charging Unit (2022-2023)',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check recall status at bmwusa.com/recall with your VIN - software update fix is free and available OTA',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If error appears after DC charging, try soft reboot (hold power button 10 sec) - often a transient fault from charger communication',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If drivetrain malfunction occurs at speed, stay calm - vehicle loses power for 15-20 seconds then may recover. Pull over safely.',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Report EVERY occurrence to dealer even if it self-resolves - documentation supports warranty/lemon law claims',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i4-brake-feel-regen-2022',
    make: 'BMW',
    model: 'i4',
    years: { start: 2022, end: 2025 },
    title: 'Regenerative Braking Pedal Feel Complaints - Grabby/Aggressive',
    severity: 'low',
    description: 'BMW i4 owners consistently report that the brake pedal has an aggressive, grabby feel with an early bite point that jolts the vehicle. The i4 uses blended braking where regenerative braking engages first, and mechanical brakes only activate when additional stopping force is needed. The transition between regen and mechanical braking is not seamless, creating an inconsistent pedal feel. The eDrive40 is reported to be more touchy/grabby than the M50. Forum discussions on i4talk.com show this is one of the most discussed drivability complaints. Some owners adapt over time; others find it unacceptable. The "B" (strong regen) mode adds additional one-pedal driving deceleration that some find too aggressive while others prefer it.',
    symptoms: [
      'Brake pedal bite point feels very early and aggressive',
      'Vehicle jolts/lurches when lightly touching brake pedal',
      'Inconsistent braking feel between regen and mechanical brakes',
      'Difficulty modulating braking smoothly at low speeds (parking)',
      'Passengers notice jerky braking',
      'Different brake feel between eDrive40 and M50 variants'
    ],
    solution: 'This is a design characteristic of the blended braking system, not a defect per se. Adaptive approaches: Use "D" mode with Adaptive recuperation setting for the most natural brake feel - it adjusts regen based on traffic and road conditions. Avoid "B" mode unless you specifically want strong one-pedal driving. Practice feathering the brake pedal with very light, progressive pressure. Some owners report the brake feel improves slightly with software updates. If braking is truly abnormal (pulsating, grinding), have the integrated brake module checked as that could indicate a hardware issue covered under recall.',
    estimatedCost: { min: 0, max: 0 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Use D-Adaptive mode for most natural brake feel - it adjusts regen based on traffic conditions automatically',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Practice very light, progressive brake pedal pressure - the i4 needs much less pedal force than ICE cars',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Most owners adapt to the brake feel within 2-4 weeks of daily driving',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i4-heat-pump-cold-weather-2022',
    make: 'BMW',
    model: 'i4',
    years: { start: 2022, end: 2025 },
    title: 'Heat Pump & Cold Weather Range Loss / Coolant Valve Leak',
    severity: 'moderate',
    description: 'The BMW i4\'s heat pump system is designed to improve winter range by 20-30 miles vs resistive heating alone, but the coolant changeover valve can develop leaks when temperatures drop below 19F (-7C). This TSB-documented issue can cause coolant loss and system malfunction. Even when functioning properly, significant winter range reduction (25-35%) is reported by owners in cold climates. The heat pump compressor can fail, reverting the system to less efficient resistive heating only. Pre-conditioning while plugged in is critical for cold-climate owners to preserve range. All i4 variants (eDrive35, eDrive40, xDrive40, M50) are equipped with the heat pump system.',
    symptoms: [
      'Significant range reduction in cold weather (25-35%)',
      'Coolant level warning in freezing temperatures',
      'Heat pump not engaging - resistive heating only',
      'Unusual noise from heat pump compressor',
      'Coolant puddle under vehicle after cold night',
      'Climate system error messages in winter'
    ],
    solution: 'For coolant valve leak: Dealer warranty repair - the changeover valve is replaced (TSB documented for temps below 19F/-7C). For heat pump compressor failure: Dealer diagnosis and replacement under warranty. For range management: Pre-condition cabin while plugged in before driving (uses grid power, not battery). Use seat/steering wheel heaters instead of high cabin heat. Set climate to ECO mode. Check coolant level regularly in winter months. BMW warranty covers heat pump components for 4 years/50,000 miles standard, 8 years for some EV drivetrain components.',
    estimatedCost: { min: 0, max: 2500 },
    recallTSB: 'TSB for coolant changeover valve leak below 19F (-7C)',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Pre-condition cabin while plugged in before every cold-weather drive - saves 10-15% range vs heating from battery',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check coolant level monthly in winter - the valve leak can be slow and intermittent below 19F',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use ECO climate mode and maximize seat heater/steering wheel heater use to reduce range loss',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i4-pedestrian-sound-2022',
    make: 'BMW',
    model: 'i4',
    years: { start: 2022, end: 2023 },
    title: 'Pedestrian Warning Sound System Failure (AVAS)',
    severity: 'moderate',
    description: 'Certain 2022-2023 BMW i4 eDrive40 vehicles have a defect in the Acoustic Vehicle Alerting System (AVAS) where the artificial sound generator control unit fails during vehicle start-up and does not produce the required external pedestrian warning sound. This violates Federal Motor Vehicle Safety Standard 141 (FMVSS 141) which requires EVs to emit sounds at low speeds to alert pedestrians. This is a safety recall issue as the vehicle may be nearly silent to pedestrians, cyclists, and visually impaired individuals at low speeds.',
    symptoms: [
      'No external warning sound when driving at low speeds',
      'AVAS warning light or message on dashboard',
      'Pedestrians not reacting to approaching vehicle',
      'Sound generator diagnostic fault codes'
    ],
    solution: 'This is covered under BMW safety recall. Dealers will update the external artificial sound generator software, free of charge. Contact BMW dealer with VIN to schedule the recall repair. Owner notification letters were mailed March 9, 2023. Do not ignore this recall as it is a safety requirement.',
    estimatedCost: { min: 0, max: 0 },
    recallTSB: 'NHTSA Recall - AVAS Sound Generator Software Update (2022-2023 i4 eDrive40)',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check recall status with your VIN at bmwusa.com/recall - this is a free software update at the dealer',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'This recall affects pedestrian safety - schedule the fix promptly, especially if driving in urban areas',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmwI4Issues.length} BMW i4 issues...`);
knownIssues.issues.push(...bmwI4Issues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`Successfully added ${bmwI4Issues.length} BMW i4 issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
