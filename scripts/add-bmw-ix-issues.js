const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW iX (I20) issues - 2022-2025
// Powertrain: xDrive40, xDrive50, M60
// Platform: CLAR-based, BMW's flagship electric SUV
// iDrive 8 infotainment system

const bmwIXIssues = [
  {
    id: 'bmw-ix-idrive8-crashes-2022',
    make: 'BMW',
    model: 'iX',
    years: { start: 2022, end: 2025 },
    title: 'iDrive 8 System Crashes, Reboots & Screen Blank',
    severity: 'moderate',
    description: 'The BMW iX\'s iDrive 8 infotainment system experiences random crashes, screen blanking, and system reboots while driving. The curved display goes completely blank for 15-45 seconds during reboot cycles, disabling navigation, climate controls, audio, backup camera, and safety displays simultaneously. Some owners report the system entering a continuous reboot loop requiring dealer intervention. Phone integration (wireless CarPlay/Android Auto) is frequently cited as a trigger for crashes. The system may also fail to enter sleep mode properly after parking, causing background processes to drain the 12V battery. HUD settings, instrument cluster preferences, and audio settings may reset after each crash. BMW has released multiple OTA software updates to address stability, with version .63 and later resolving many issues. Early 2022 production vehicles are most affected. Per ixforums.com, one owner reported the screen going blank 3 times in 5 days.',
    symptoms: [
      'Infotainment screen goes completely blank while driving',
      'System enters continuous reboot loop',
      'Screen flickering with camera feed glitches after reboot',
      'Apple CarPlay/Android Auto disconnects randomly',
      'HUD and cluster settings reset after system crash',
      'Climate controls become inaccessible during screen blank',
      'Phone Bluetooth pairing profiles overwrite each other',
      'Backup camera unavailable after system restart',
      'Main screen stuck on BMW logo, won\'t load interface'
    ],
    solution: 'Install latest iDrive software via OTA update (Settings > Software Update). Version .63+ resolved many stability issues. For immediate fix: Soft reset by holding volume/power button for 10+ seconds. For persistent crashes: Dealer can force-flash the head unit using ISTA. Some owners report improved stability by using wired CarPlay/Android Auto instead of wireless. Factory reset (Settings > General > Reset) can resolve persistent software corruption. If screen enters continuous reboot loop, dealer must perform head unit hardware inspection - may need MGU (main head unit) replacement.',
    estimatedCost: { min: 0, max: 2000 },
    recallTSB: 'Multiple iDrive software update TSBs; Recall 23V-409: Program Control Units (MFL)',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Soft reset: Hold power/volume knob 10+ seconds until BMW logo appears - fixes most temporary glitches',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Switch from wireless to wired CarPlay/Android Auto - wireless connection is the #1 trigger for system crashes',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'After any OTA update, let the car sit locked for 30+ minutes to complete background installation processes',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If screen enters reboot loop and won\'t stop, disconnect 12V battery for 5 minutes then reconnect - forces full system reset',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-ix-12v-battery-drain-2022',
    make: 'BMW',
    model: 'iX',
    years: { start: 2022, end: 2025 },
    title: '12V Auxiliary Battery Drain - Sleep Mode & Module Wake Issues',
    severity: 'moderate',
    description: 'The BMW iX uses a 60Ah AGM 12V battery that powers all vehicle electronics. Owners report the vehicle dying after several days of parking with the 12V battery completely dead while the main HV battery retains charge. The iX has components that cause phantom drain regardless of settings because the vehicle must always be ready to power on, and the 12V battery may last only 2 years in some cases. Software bugs can prevent proper sleep mode, keeping modules active and draining the 12V. The iDrive 8 system not entering sleep mode is a documented cause. Failed or stuck TCB (telematics) modules attempting constant cellular reconnection also contribute to drain. The DC-DC converter should maintain 12V charge from the HV battery during normal operation, so persistent drain indicates a software or hardware fault.',
    symptoms: [
      'Vehicle dead after sitting for 2-5 days despite full HV battery',
      '12V battery voltage warning on instrument cluster',
      '"Battery discharge" warning message',
      'Remote app functions stop responding (BMW Connected app)',
      'Exterior lamps staying on after car is locked (sleep mode failure)',
      'Key fob won\'t unlock vehicle (12V too low for receivers)',
      'Multiple system errors cascade on startup after 12V recovery'
    ],
    solution: 'First ensure latest software is installed - BMW has released OTA updates addressing sleep mode bugs. If 12V battery has been deeply discharged, it may be permanently damaged and need replacement. Use a BMW-approved battery tender for vehicles parked for extended periods. Dealer can perform a sleep current test to identify which module is preventing proper shutdown. If CCU (Central Charging Unit) is malfunctioning, it may need replacement under warranty. For battery replacement, part number for 60Ah AGM may include 01405A38CB9. Must be registered to IBS via BimmerLink or dealer ISTA.',
    estimatedCost: { min: 0, max: 800 },
    recallTSB: 'Recall 22V-XXX: HV Battery ECU Software (2022-2023 iX); Software TSB for sleep mode',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Use a battery tender if the iX sits for more than 3-4 days - the 12V drains faster than you\'d expect on an EV',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check that latest OTA software is installed - sleep mode fix was a major improvement in recent updates',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Register new 12V battery using BimmerLINK app (not BimmerCode) after replacement',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'A dead 12V on an EV = ZERO access to the vehicle. No unlock, no HV power, no charging. Prevent it proactively.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-ix-air-suspension-2022',
    make: 'BMW',
    model: 'iX',
    years: { start: 2022, end: 2025 },
    title: 'Air Suspension Compressor & Air Spring Failures - xDrive50/M60',
    severity: 'moderate',
    description: 'The BMW iX xDrive50 and M60 are equipped with 2-axle adaptive air suspension that can experience compressor failures, air spring leaks, and air line cracks. The air compressor can fail from overwork (running excessively to compensate for small leaks), producing loud operating noises before failure. Air springs develop rubber cracks from UV exposure and temperature cycling, causing slow leaks that become apparent overnight when the vehicle drops to one side. Cracked air lines from vibration fatigue are also reported. The air suspension warning light illuminates when the system can no longer maintain proper ride height. Compressor failures are reported as early as 20,000-30,000 miles on some 2022-2023 models. The xDrive40 uses conventional steel springs and is not affected. Dealer diagnosis is typically required as the system has multiple possible failure points.',
    symptoms: [
      'Vehicle sitting low on one corner or one axle',
      'Air suspension warning light on dashboard',
      'Loud buzzing or grinding from compressor (under rear cargo area)',
      'Compressor running continuously (audible after car is turned off)',
      'Uneven ride height side to side',
      'Headlight aim warning (ride height affecting beam angle)',
      '"Suspension malfunction" or "Ride height control" error message',
      'Harsh ride quality (system defaulting to fail-safe height)'
    ],
    solution: 'Diagnosis required to identify failing component. Common repairs: Air compressor replacement ($600-1,200 parts + labor). Individual air spring replacement ($800-1,500 per corner). Air line repair/replacement ($100-500). Full system reset after any component replacement. Air springs typically last 50,000-70,000 miles; compressors can last 100,000+ miles if no leaks cause overwork. Check for air leaks using soapy water on air lines and spring connections. Dealer warranty covers air suspension for 4 years/50,000 miles. Some owners have had claims approved under BMW goodwill beyond warranty.',
    estimatedCost: { min: 600, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'If compressor sounds louder than normal, check for small air leaks immediately - compressor overwork from leaks causes premature failure',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Spray soapy water on air line connections and spring fittings to check for leaks before assuming compressor failure',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Document any air suspension issues before warranty expires - BMW has approved goodwill repairs for some owners slightly out of warranty',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t drive with the air suspension in fail-safe mode long-term - it puts stress on other suspension components',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-ix-build-quality-2022',
    make: 'BMW',
    model: 'iX',
    years: { start: 2022, end: 2025 },
    title: 'Panel Gaps & Build Quality Issues',
    severity: 'low',
    description: 'The BMW iX has received complaints about body panel fitment and overall build quality, particularly on early 2022 production vehicles. Reported issues include uneven panel gaps, trim pieces that pop out or rattle, interior squeaks and rattles, and in extreme cases, body panels detaching (one owner reported the rear bumper detaching in rain). Some owners report needing 9+ dealership visits in 17 months for various "niggly little" quality issues. The iX is manufactured at BMW\'s Dingolfing plant in Germany, and quality appears to have improved with later production dates. Consumer Reports rated the 2023 iX below average for reliability. These issues are cosmetic and don\'t affect safety or drivability but are disappointing given the $80,000-110,000 price range.',
    symptoms: [
      'Visible uneven panel gaps between body panels',
      'Interior trim pieces popping out or not seated properly',
      'Rattles or squeaks from dashboard, doors, or rear cargo area',
      'Wind noise at highway speeds from poorly sealed body panels',
      'Trim alignment issues visible on close inspection',
      'Rear bumper or panel fitment issues'
    ],
    solution: 'Most panel gap and trim issues can be addressed under BMW\'s 4 year/50,000 mile warranty at no cost. Document all issues with photos and bring to dealer service. For rattles, dealer can install additional insulation or tighten trim clips. For panel gap issues, body panel adjustment at dealer (covered under warranty). For persistent quality issues affecting enjoyment, document everything for potential BMW goodwill claim or lemon law consideration if the number of dealer visits is excessive. Some owners have negotiated buybacks on severely affected vehicles.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Document EVERY quality issue with photos and dealer visit records - essential for warranty claims and potential buyback/lemon law',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Request a later production date when ordering new - early 2022 builds had the most quality complaints',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Do a thorough pre-delivery inspection before accepting the vehicle - reject any unacceptable panel gaps immediately',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-ix-charging-failures-2022',
    make: 'BMW',
    model: 'iX',
    years: { start: 2022, end: 2025 },
    title: 'DC Fast Charging Failures & Reduced Charging Speed',
    severity: 'moderate',
    description: 'BMW iX owners report persistent issues with DC fast charging reliability, particularly at Electrify America stations. Sessions fail to initiate, start then immediately stop, or throttle to very low speeds. The xDrive50 is rated for 195 kW peak charging but owners report speeds dropping from 185 kW to 50 kW within minutes. Authentication failures between the BMW app and EA chargers cause silent session failures. Expired or invalid credit cards on the EA account cause session termination with no clear error message. BMW\'s "Charging Power Reduced" error can appear on 2024 models, limiting charging speed due to software-detected anomalies. The issues are a combination of vehicle software, charger network reliability, and authentication/billing system bugs between BMW and EA. BMW includes 2 years of free 30-minute DC fast charging sessions with Electrify America.',
    symptoms: [
      'DC fast charge session won\'t initiate',
      'Session starts then immediately stops',
      '"Connection Failed" message on vehicle display',
      '"Charging Power Reduced" error limiting speed',
      'Charging speed drops from peak (195 kW) to 50 kW quickly',
      'BMW app won\'t authenticate with Electrify America charger',
      'Charging session works with credit card but not BMW app',
      'Need to try multiple charger stalls before one works'
    ],
    solution: 'First: Verify Electrify America account has valid, non-expired credit card - silent billing failures cause most BMW app authentication issues. Try initiating charge directly with EA app or credit card tap as workaround. For "Charging Power Reduced": Ensure latest vehicle software via OTA update. For consistently low charging speeds: Battery preconditioning activates when navigation is set to a DC fast charger - always use BMW nav to route to chargers. If speeds are still low, check battery temperature (too hot or too cold limits charging). For persistent failures at specific stations, report to both BMW and EA - some stations have known hardware issues. BMW warranty covers charging system hardware for 8 years.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Always use BMW navigation to route to DC chargers - this activates battery preconditioning for faster charging speeds',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check your Electrify America account payment method - expired cards cause silent session failures that look like vehicle issues',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If BMW app auth fails, try EA app directly or credit card tap on the charger as a workaround',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t blame the car for EA charger issues - try 2-3 different stalls before assuming a vehicle problem',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-ix-phantom-braking-2022',
    make: 'BMW',
    model: 'iX',
    years: { start: 2022, end: 2025 },
    title: 'Phantom Braking & False Forward Collision Warnings',
    severity: 'moderate',
    description: 'BMW iX owners report phantom braking events where the vehicle suddenly applies emergency braking with no actual obstacle present. The combination of ultrasonic sensors, radar, and cameras can occasionally produce false positive detections that trigger autonomous emergency braking (AEB). Common triggers include railroad tracks, bridge overpasses, metal road plates, and shadows cast by overhead signs. The system applies instantaneous hard braking with a red warning flash on the display, giving the driver minimal time to override. Events occur at highway speeds (60+ mph) and can be dangerous with following traffic. BMW software updates have improved but not eliminated the issue. Additionally, false forward collision warnings (audio/visual alerts without braking) occur more frequently and can be distracting. The integrated brake system recall (24V-104) addresses a related but separate issue with brake module hardware.',
    symptoms: [
      'Vehicle suddenly brakes hard with no obstacle present',
      'Red forward collision warning flashes on display without cause',
      'Phantom braking when crossing railroad tracks',
      'False emergency braking under overpasses or bridges',
      'AEB activation from shadows or road surface changes',
      'Forward collision audio warning sounds unnecessarily',
      'Passengers alarmed by unexpected hard braking events'
    ],
    solution: 'Ensure latest vehicle software is installed - BMW has released multiple calibration updates for the ADAS sensors. Forward collision warning sensitivity can be adjusted in Settings (Early, Medium, Late) - set to "Late" to reduce false positives while maintaining protection. AEB cannot be permanently disabled (safety regulation requirement) but adjusting sensitivity helps. For persistent phantom braking: Dealer can recalibrate the forward-facing radar and camera. If windshield has been replaced, ensure ADAS camera was properly recalibrated. Report all phantom braking events to NHTSA at safercar.gov - owner reports drive investigations and recalls. BMW recall 24V-104 addresses integrated brake module hardware - verify your VIN is not affected.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: 'Recall 24V-104: Integrated Brake System (verify VIN); Multiple ADAS software update TSBs',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Set forward collision warning to "Late" in settings - reduces false positives significantly while still providing protection',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Install every OTA software update promptly - BMW continuously improves ADAS sensor calibration',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Report phantom braking to NHTSA at safercar.gov - owner reports are what trigger investigations and recalls',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Be aware of phantom braking risk on railroad tracks and under overpasses - keep extra following distance from vehicle behind you',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-ix-hv-battery-ecu-software-2022',
    make: 'BMW',
    model: 'iX',
    years: { start: 2022, end: 2024 },
    title: 'High Voltage Battery ECU Software - Loss of Drive Power (Recall)',
    severity: 'high',
    description: 'Multiple NHTSA recalls affect the BMW iX for potential sudden loss of drive power. The electric drive motor software may incorrectly detect a double-isolation fault condition, entering fail-safe mode that shuts down the HV system for 15-20 seconds. Separately, the HV battery ECU software can interrupt electrical power causing sudden drive power loss. Additionally, certain iX xDrive50 and M60 models have a defect where the driver may unintentionally reactivate cruise control while turning the steering wheel at low speeds, causing sudden speed increase. BMW has also recalled for improperly assembled HV battery cell modules that may cause module frame stress and failure. These are all covered under separate NHTSA recalls with free remedies.',
    symptoms: [
      'Complete loss of drive power for 15-20 seconds while driving',
      'Red "Drivetrain Malfunction" warning',
      '"High Voltage System" error message',
      'Vehicle enters fail-safe / limp mode unexpectedly',
      'Cruise control reactivating unexpectedly during low-speed steering (xDrive50/M60)',
      'Vehicle won\'t achieve drive readiness',
      'Warning messages during or after DC fast charging'
    ],
    solution: 'Multiple recalls apply - check your VIN at bmwusa.com/recall or NHTSA.gov: (1) Electric drive motor software recall - fix is OTA or dealer software update, free. (2) HV battery ECU software recall - dealer software update, free. (3) Cruise control recall (xDrive50/M60) - dealer software update, free. (4) HV battery cell module recall - dealer inspection and possible replacement, free. Contact BMW at 1-800-525-7417 for recall status. All fixes are free of charge under recall.',
    estimatedCost: { min: 0, max: 0 },
    recallTSB: 'Multiple NHTSA Recalls: Electric Drive Motor Software (2022-2024 iX); HV Battery ECU (2022-2023); Cruise Control (2022-2024 xDrive50/M60); Battery Cell Module (2022-2025)',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check ALL recall status for your VIN at bmwusa.com/recall - there are MULTIPLE separate recalls affecting the iX',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Accept all OTA software updates promptly - many recall fixes are delivered over the air',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If loss of power occurs at highway speed, stay calm - power typically returns in 15-20 seconds. Pull over safely immediately.',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'xDrive50/M60 owners: Be aware of potential cruise control reactivation when turning at low speeds until recall is completed',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmwIXIssues.length} BMW iX issues...`);
knownIssues.issues.push(...bmwIXIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`Successfully added ${bmwIXIssues.length} BMW iX issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
