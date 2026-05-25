const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const newIssues = [
  // ============================================================
  // AUDI e-tron (2019-2024) - Electric SUV
  // ============================================================
  {
    id: "audi-etron-battery-overheat-2019",
    make: "Audi",
    model: "e-tron",
    years: { start: 2019, end: 2022 },
    title: "High-Voltage Battery Module Overheating (Recall 93U9)",
    severity: "high",
    description: "The 2019-2022 Audi e-tron Quattro and e-tron Sportback Quattro are subject to NHTSA Recall 23V-867 (Audi code 93U9) affecting approximately 26,866 vehicles. Battery modules manufactured by LG Energy Solution can develop a self-discharge condition leading to thermal overload, smoke, or fire. Audi estimates a 3% defect rate. Interim remedy requires dealer battery inspections every 4 months and charging limited to 80% maximum until module replacement is completed. Class action lawsuit filed in 2024 alleging Audi knew of the defect.",
    symptoms: [
      "Reduced battery range or performance",
      "Battery warning light on dashboard",
      "High-voltage battery malfunction message",
      "Unusual heat from underfloor battery area",
      "Charging stops unexpectedly or fails to complete",
      "Smoke or burning smell from undercarriage"
    ],
    solution: "IMMEDIATE: Limit charging to 80% maximum and schedule dealer inspection under Recall 93U9 (NHTSA 23V-867). Audi dealers will install diagnostic software to monitor battery module performance and replace affected modules free of charge. If you notice any smoke, unusual heat, or burning smell, pull over immediately, exit the vehicle, and call 911. Do not attempt to charge the vehicle. Contact Audi customer service at 1-800-253-2834 referencing recall 93U9. Document all symptoms with dates and mileage for potential class action eligibility.",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "NHTSA Recall 23V-867 / Audi Recall 93U9 (December 2023). Covers 2019-2022 e-tron Quattro and 2020-2022 e-tron Sportback Quattro. Battery module replacement free of charge. Interim 4-month inspections also free.",
    communityRecommendations: [
      {
        type: "warning",
        content: "Even after the recall software update, monitor battery health closely. Some owners report the software detects anomalies and limits charging further as a precaution. This is the system working as intended.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Check recall status at recalls.audi.com or call 1-800-253-2834 with your VIN. Some owners waited 6+ months for module replacement parts - schedule early.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Limit DC fast charging frequency even after recall completion. Frequent DCFC stresses battery modules more than Level 2 AC charging. Use 80% charge limit as standard practice.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },
  {
    id: "audi-etron-air-suspension-2019",
    make: "Audi",
    model: "e-tron",
    years: { start: 2019, end: 2024 },
    title: "Adaptive Air Suspension Compressor and Line Failures",
    severity: "medium",
    description: "The Audi e-tron's adaptive air suspension system develops failures in the compressor control module, air lines, and height sensors. The compressor can burn out from overwork (especially if air lines develop leaks), dropping the vehicle to its lowest ride height and disabling drive select height adjustment. Cracked air lines near the compressor are a common failure point. NHTSA complaints document suspension failure at as low as 11,000 miles. Audi TSBs reference DTC codes C1260F0 and U112100 for compressor control unit (J1135) replacement.",
    symptoms: [
      "Air suspension malfunction warning on dashboard",
      "Vehicle sitting noticeably low on one or more corners",
      "Suspension extremely soft and bouncy",
      "Compressor running audibly with engine off",
      "Hissing noise from suspension area (air leak)",
      "Drive select ride height adjustment disabled",
      "Vehicle drops to lowest setting and won't raise"
    ],
    solution: "If air suspension warning appears: avoid highway speeds as handling may be compromised. Have dealer scan for DTC C1260F0 or U112100 - if present, compressor control unit J1135 replacement is needed. For cracked air lines: replace affected lines and inspect all connections. Compressor burnout requires full compressor replacement. Front ball joint bushings may also need replacement if suspension feels loose. Aftermarket air suspension compressors from Arnott (P-3473) offer savings over OEM pricing.",
    estimatedCost: {
      low: 800,
      high: 3500
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "Before expensive compressor replacement, check for air line leaks first - a cracked $50 line can cause compressor to overwork and burn out. Soap and water spray reveals bubbling at leak points.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "Arnott P-3473 air suspension compressor is a direct fit for the e-tron (4M chassis). Significantly cheaper than OEM while maintaining quality.",
        partBrand: "Arnott",
        partName: "Air Suspension Compressor",
        partNumber: "P-3473",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Do NOT continue driving with suspension at minimum height - ground clearance is dangerously low and handling is unpredictable. The heavy battery pack makes this especially hazardous.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "suspension",
    dtcCodes: ["C1260F0", "U112100"]
  },
  {
    id: "audi-etron-charge-port-actuator-2019",
    make: "Audi",
    model: "e-tron",
    years: { start: 2019, end: 2024 },
    title: "Charge Port Door Actuator Failure and Water Ingress",
    severity: "medium",
    description: "The Audi e-tron's charge port door actuator fails due to internal motor issues or water ingress through inadequate sealing around the indicator light and connector. When the actuator fails, the charge port door may become stuck closed (preventing charging) or stuck open (exposing the port to weather). Some owners report the locking pin cycling 5 times then throwing an error when attempting to plug in. Audi issued a service campaign for sealing improvements. The charging cable can also become stuck and locked in place, requiring emergency release procedures.",
    symptoms: [
      "Charge port door won't open when prompted",
      "Charging cable locks in place and won't release",
      "Locking pin cycles repeatedly then displays error",
      "Charge port door stuck in open position",
      "Charging system fault message on dashboard",
      "Water visible around charge port area"
    ],
    solution: "Try locking and unlocking the vehicle several times - this can free a stuck actuator temporarily. Use the emergency release cord (located in cargo area) if door won't open. For persistent issues, dealer diagnosis involves disconnecting the actuator connector and performing a 12V signal test during unlock - if voltage present but actuator unresponsive, the actuator (PN 4KE-810-774) needs replacement. Audi service campaign addresses sealing around the indicator light. For stuck charging cables, a full system reset may be needed before the lock releases.",
    estimatedCost: {
      low: 300,
      high: 1200
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "Keep the charge port area clean and dry. Apply silicone spray on the door seal periodically to prevent water intrusion and sticking, especially in cold climates.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If the charging cable is stuck, do NOT force it out - you can damage both the vehicle port and the cable connector. Use the emergency release or have the car towed to a dealer.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Ask your dealer about the service campaign for charge port sealing improvements. Some dealers apply the fix proactively; others wait for a reported failure.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: ["P33E8"]
  },
  {
    id: "audi-etron-onboard-charger-2019",
    make: "Audi",
    model: "e-tron",
    years: { start: 2019, end: 2024 },
    title: "Onboard AC Charger (OBC) Failure",
    severity: "high",
    description: "The Audi e-tron's onboard charger, which converts AC wall power to DC battery current, can fail and prevent Level 2 (AC) home charging entirely while DC fast charging continues to work. Owners report the car attempts a handshake with the Level 2 EVSE, cycles 3-4 times, then throws a charging system fault. The replacement battery charger (PN 5QE-915-684-DA) lists at $2,100-$2,200 for the part alone. This renders home charging impossible, forcing owners to rely exclusively on public DC fast chargers until the repair is completed.",
    symptoms: [
      "Level 2 AC charging fails but DC fast charging works",
      "Charging system fault displayed on dashboard",
      "Car attempts to initiate charging then stops after multiple tries",
      "Charging light blinks then turns off",
      "Reduced charge rate on AC chargers",
      "Electrical system malfunction warning"
    ],
    solution: "If DC fast charging works but AC Level 2 does not, the onboard charger (OBC) module has likely failed. First rule out: try a different Level 2 EVSE to eliminate charger-side issues, check 12V battery health (weak 12V causes communication failures), and perform a full vehicle power cycle (lock, leave for 30+ minutes, restart). If AC charging still fails, dealer diagnosis will confirm OBC failure and replacement is required. OBC replacement is $2,100-$2,200 for the part plus $500-$1,000 labor. Check if under Audi warranty (4yr/50k miles for electrical components).",
    estimatedCost: {
      low: 2600,
      high: 4300
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "Before assuming OBC failure, replace the 12V auxiliary battery if it's over 3 years old. A weak 12V battery prevents proper communication between the car and EVSE, mimicking OBC failure symptoms.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Using the original Audi 240V compact charging cable has been linked to overheating issues - Audi issued a recall for replacement cables with temperature sensors. Ensure you have the updated cable.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Document every failed charge attempt with date, time, location, and EVSE model. This creates a paper trail for warranty claims and helps the dealer diagnose intermittent failures.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },
  {
    id: "audi-etron-virtual-cockpit-2019",
    make: "Audi",
    model: "e-tron",
    years: { start: 2019, end: 2021 },
    title: "Virtual Cockpit and MMI Display Blank/Black Screen",
    severity: "medium",
    description: "The Audi e-tron's Virtual Cockpit (instrument cluster) and MMI infotainment display can go completely black intermittently or persistently. Audi confirmed the root cause is age-related deterioration of the flex-foil cable connecting the display, not a software issue. Vehicles built before July 2021 are affected (2022+ models received an updated flat cable from a new supplier). Audi issued recall code 90VC for the instrument cluster. Additionally, MMI display blanking (separate from the instrument cluster) may occur and can sometimes be resolved with software updates.",
    symptoms: [
      "Instrument cluster display completely black while driving",
      "MMI center touchscreen goes blank",
      "Displays reboot intermittently during driving",
      "Backup camera display shows no image",
      "Virtual Cockpit flickers before going dark",
      "Loss of speedometer, range, and warning indicators"
    ],
    solution: "For instrument cluster blank screen: Contact Audi dealer about Recall 90VC - the flex-foil cable requires physical replacement (free under recall). For MMI display blanking: Try manual reboot first by holding the volume/power knob for 30 seconds. If that fails, perform full shutdown (roll up windows, exit, lock all doors, keep key fobs far from car, wait 1+ hour). Persistent MMI issues require dealer software update. 2022+ models are not affected due to updated cable supplier.",
    estimatedCost: {
      low: 0,
      high: 1500
    },
    recallInfo: "Recall 90VC covers instrument cluster flex-foil cable replacement for 2019-2021 models. Owner notification letters expected May 2025. Free repair at Audi dealers.",
    communityRecommendations: [
      {
        type: "warning",
        content: "A completely black instrument cluster while driving is a safety hazard - you lose speed, range, warnings, and turn signal indicators. Pull over safely and reboot. If it persists, have it towed to the dealer.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If your MMI loses favorites or settings after each restart, this is a known software bug separate from the hardware flex-foil issue. Request the latest MIB3 software update from your dealer.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Check your build date (on door jamb sticker) - if built after July 2021, you have the updated cable and are NOT affected by the flex-foil recall.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },

  // ============================================================
  // AUDI e-tron GT (2022-2024) - Electric Sedan/GT
  // ============================================================
  {
    id: "audi-etron-gt-battery-short-2022",
    make: "Audi",
    model: "e-tron GT",
    years: { start: 2022, end: 2024 },
    title: "800V Battery Module Short Circuit and Fire Risk (Recall 93VM)",
    severity: "high",
    description: "The 2022-2024 Audi e-tron GT is subject to multiple NHTSA recalls for high-voltage battery module short circuits that can cause thermal events or fires. Battery modules manufactured by LG Energy Solution can develop internal short circuits. Approximately 4,980 e-tron GTs and 1,519 RS e-tron GTs are affected. Audi was initially notified by Porsche in December 2023 (the Porsche Taycan shares the same J1 platform and battery). Three separate recall campaigns were issued in December 2023, March 2024, and September 2024. Owners must limit charging to 80% until the remedy is applied.",
    symptoms: [
      "Battery warning message on instrument cluster",
      "Reduced range or declining battery performance",
      "Charging automatically stops before reaching set limit",
      "High-voltage system malfunction warning",
      "Reduced power output during driving",
      "Smoke or unusual smell from undercarriage"
    ],
    solution: "CRITICAL: Immediately limit charging to 80% maximum until recall is completed. Contact Audi at 1-800-253-2834 or check recalls.audi.com with your VIN. The recall remedy involves an onboard diagnostic software update that monitors battery modules in real-time for anomalies and can isolate affected modules. Severely affected modules will be physically replaced. Do NOT ignore battery warning messages. If you notice smoke, exit the vehicle immediately and call 911. Same issue affects Porsche Taycan (shared platform).",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "Multiple NHTSA recalls: Recall 93VM (December 2023) for 2022-2023 models, expanded September 2024 to include 2024 models. Covers e-tron GT and RS e-tron GT. All repairs free of charge. Shares same battery defect as Porsche Taycan recall.",
    communityRecommendations: [
      {
        type: "warning",
        content: "This is the same LG Energy Solution battery module defect affecting the Porsche Taycan. Do not delay getting the recall performed - thermal events can occur without warning.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "After the software update, if the system detects a battery anomaly it may further limit your charging to below 80%. This is a safety feature working as designed - schedule module replacement promptly.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Park away from structures and other vehicles until the recall is completed. Do not charge unattended overnight in a garage.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },
  {
    id: "audi-etron-gt-brake-hose-2022",
    make: "Audi",
    model: "e-tron GT",
    years: { start: 2022, end: 2024 },
    title: "Front Axle Brake Hose Tear and Fluid Leak (Recall 47UP)",
    severity: "high",
    description: "The 2022-2024 Audi e-tron GT and RS e-tron GT are recalled under NHTSA Recall 24V465000 (Audi code 47UP) for front brake hoses that cannot withstand normal operational bending and deflection. The fabric material of the hoses develops cracks, causing brake fluid leaks and reduced braking performance. This is critical given the e-tron GT's 4,900+ lb curb weight and high performance capability. Audi received two warranty claims before issuing the recall. Owner notification letters were mailed August 2024.",
    symptoms: [
      "Longer brake pedal travel than normal",
      "Brake warning light illuminated on dashboard",
      "Visible brake fluid leak near front wheels",
      "Spongy or soft brake pedal feel",
      "Reduced braking effectiveness",
      "Brake fluid level warning"
    ],
    solution: "Contact Audi dealer immediately to schedule recall 47UP (NHTSA 24V465000) for free front brake hose replacement. Do NOT delay - brake failure in a 4,900+ lb performance vehicle is extremely dangerous. If you notice any change in brake pedal feel or see fluid near front wheels, avoid driving and have the car towed to the dealer. Both front brake hoses are replaced. Reference Audi recall 47UP or NHTSA number 24V465000 when scheduling.",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "NHTSA Recall 24V465000 / Audi Recall 47UP. Covers 2022-2024 e-tron GT and RS e-tron GT. Front brake hose replacement free of charge. Owner notification August 2024.",
    communityRecommendations: [
      {
        type: "warning",
        content: "Visually inspect front brake hoses monthly until the recall is completed. Look for any signs of fluid weeping, wet spots, or visible cracking on the rubber hose surface.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If you track your e-tron GT, have the hoses inspected after every track day. The repeated heavy braking accelerates the fatigue that causes this failure.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "brakes",
    dtcCodes: []
  },
  {
    id: "audi-etron-gt-passenger-airbag-2022",
    make: "Audi",
    model: "e-tron GT",
    years: { start: 2022, end: 2023 },
    title: "Passenger Occupant Detection System (PODS) Malfunction",
    severity: "high",
    description: "Due to a manufacturing error in seat cushion wiring, the passenger occupant detection system (PODS) may falsely detect a malfunction and deactivate the front passenger airbag even when the seat is occupied. The passenger airbag OFF indicator light illuminates on the dashboard when this error occurs. In a collision, the deactivated passenger airbag would not deploy, significantly increasing injury risk. Audi issued a recall to replace the seat cushion assembly containing the faulty sensor wiring.",
    symptoms: [
      "Passenger airbag OFF light illuminated with passenger seated",
      "Airbag warning light on instrument cluster",
      "Intermittent passenger airbag status changes",
      "Passenger seat weight sensor error messages",
      "Airbag system malfunction warning"
    ],
    solution: "Schedule dealer appointment immediately for seat cushion replacement under the PODS recall. The seat cushion assembly containing the occupant detection sensor wiring is replaced free of charge. Until repaired, the passenger SHOULD NOT ride in the front seat as the airbag may be deactivated. The passenger airbag OFF indicator on the dashboard will illuminate when the fault is active. Contact Audi at 1-800-253-2834.",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "Audi PODS recall covers 2022-2023 e-tron GT and RS e-tron GT. Seat cushion replacement free of charge at Audi dealers.",
    communityRecommendations: [
      {
        type: "warning",
        content: "Do NOT ignore the passenger airbag OFF light if a passenger is seated. This means the airbag WILL NOT deploy in a crash. Have passengers sit in the rear until the recall is completed.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "This is a manufacturing defect, not a sensor calibration issue. Resetting the system or disconnecting the battery will NOT fix it - physical replacement of the seat cushion wiring is required.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "safety",
    dtcCodes: []
  },
  {
    id: "audi-etron-gt-dc-charging-throttle-2022",
    make: "Audi",
    model: "e-tron GT",
    years: { start: 2022, end: 2024 },
    title: "DC Fast Charging Power Throttling and Degraded Charge Curve",
    severity: "medium",
    description: "Owners report the e-tron GT's DC fast charging performance degrades over time, with the car abruptly capping charge power to approximately 100kW around 50-60% state of charge instead of maintaining the higher rates the 800V architecture is designed to deliver (up to 270kW peak). The 800V system uses four separate coolant circuits for thermal management, but the battery management system becomes increasingly conservative with charge cycles. Frequent DC fast charging accelerates this behavior. Some owners report 20% power reduction during extended high-speed driving due to thermal throttling.",
    symptoms: [
      "DC fast charge rate drops sharply at 50-60% state of charge",
      "Peak charging speed significantly below advertised 270kW",
      "Charging session takes longer than expected",
      "Power reduced message during sustained high-speed driving",
      "Charge curve noticeably worse compared to when vehicle was new",
      "Battery preconditioning takes longer in cold weather"
    ],
    solution: "Some degradation in charge curve is normal with battery aging, but dramatic drops may indicate a battery management software issue. Request a dealer battery health check and BMS software update. Minimize DC fast charging frequency - use Level 2 AC charging at home as primary method. In cold weather, use the navigation system to route to a DC fast charger, which activates battery preconditioning for optimal charge speeds. Audi has released BMS software updates that improve charge curve management. If charge speeds are consistently below 150kW peak on a healthy 800V charger, escalate to Audi technical support.",
    estimatedCost: {
      low: 0,
      high: 500
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "Always use the navigation system to route to DCFC stations - this triggers battery preconditioning which can improve peak charge rates by 30-50% versus arriving without preconditioning.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "The 800V architecture achieves best charging performance on Electrify America 350kW stations. 400V CCS stations force the car to use its internal converter, reducing peak speed to ~150kW.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Keep daily charge level between 20-80% and avoid frequent charging to 100%. This extends battery longevity and maintains better long-term charge curve performance.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },

  // ============================================================
  // AUDI Q4 e-tron (2022-2024) - Compact Electric SUV
  // ============================================================
  {
    id: "audi-q4-etron-software-glitches-2022",
    make: "Audi",
    model: "Q4 e-tron",
    years: { start: 2022, end: 2024 },
    title: "Software Glitches Causing Cascading Error Messages and Warnings",
    severity: "medium",
    description: "The Audi Q4 e-tron suffers from widespread software instability on its MEB platform, with owners reporting episodes where multiple warning lights illuminate simultaneously at startup, the infotainment system freezes or goes blank, and the myAudi app loses connectivity. Error message cascades can include false drivetrain warnings, ADAS malfunctions, and lighting system faults that disappear after a power cycle. The 12V auxiliary battery is often the root cause - when it weakens, it triggers widespread communication failures across vehicle modules that mimic much more serious problems.",
    symptoms: [
      "Multiple warning lights illuminate simultaneously at startup",
      "Infotainment display freezes or goes black",
      "Cascade of error messages across multiple systems",
      "myAudi app cannot connect to vehicle",
      "False drivetrain malfunction warnings",
      "Driver assistance systems show fault warnings",
      "Backup camera display blank when shifting to reverse"
    ],
    solution: "First check 12V auxiliary battery health - a weak 12V battery causes most of these cascading errors. Replace if voltage is below 12.4V or battery is over 3 years old. For software issues: dealer OTA or in-shop software update resolves most problems. Perform a full power cycle (exit, lock, keep key fob away, wait 30+ minutes). If warnings persist after power cycle and 12V battery replacement, dealer diagnostic scan will identify the specific failing module. Audi has released multiple software updates addressing MEB platform stability.",
    estimatedCost: {
      low: 0,
      high: 500
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "The 12V battery in EVs works harder than in ICE cars because it powers all accessories. Replace it proactively every 3-4 years. A $200 battery replacement prevents $500+ diagnostic visits.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Keep your vehicle's software updated. Many Q4 e-tron issues are resolved through software updates. Ask your dealer about pending updates at every service visit.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If you see a genuine 'Drivetrain malfunction - stop safely' message that persists after restart, have the car towed to the dealer. While most are false alarms from 12V issues, a real drivetrain fault requires professional diagnosis.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },
  {
    id: "audi-q4-etron-brake-rollaway-2022",
    make: "Audi",
    model: "Q4 e-tron",
    years: { start: 2022, end: 2023 },
    title: "Brake Control Unit Software Defect and Rollaway Risk",
    severity: "high",
    description: "Volkswagen Group recalled approximately 60,000 VW ID.4 and Audi Q4 e-tron models for a software defect in the brake control unit. The instrument cluster may fail to display the 'N' (Neutral) position indicator, meaning the driver may not realize the vehicle is in Neutral rather than Park. If the parking brake is not manually set, the vehicle can roll away. This is particularly dangerous on inclines. The Q4 e-tron shares the MEB platform with the VW ID.4 and inherits this software defect.",
    symptoms: [
      "Gear indicator does not show 'N' when in Neutral",
      "Vehicle rolls when exiting without parking brake set",
      "Inconsistent gear position display on instrument cluster",
      "Parking brake warning if vehicle detects movement in Neutral",
      "Gear selector position mismatch between display and actual state"
    ],
    solution: "Contact Audi dealer immediately for the brake control unit software update under this recall. Until repaired, ALWAYS manually engage the electronic parking brake before exiting the vehicle, regardless of what the gear indicator shows. Do not rely solely on shifting to Park - confirm the parking brake indicator is lit on the dashboard. The software update corrects the instrument cluster display to accurately show Neutral position. Check recalls.audi.com with your VIN.",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "VW Group recall covering 2022-2023 Q4 e-tron and Q4 e-tron Sportback. Software update free of charge. Shared recall with VW ID.4.",
    communityRecommendations: [
      {
        type: "warning",
        content: "ALWAYS set the electronic parking brake before exiting. This should be habit regardless of the recall - EVs can roll silently and the one-pedal driving feel can mask whether the car is truly in Park.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "You can enable auto-hold in the vehicle settings which automatically engages the brakes when stopped. This provides an extra layer of protection against rollaway.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "safety",
    dtcCodes: []
  },
  {
    id: "audi-q4-etron-headlight-module-2022",
    make: "Audi",
    model: "Q4 e-tron",
    years: { start: 2022, end: 2024 },
    title: "Headlight Control Module Software Causing Parking Light Failure",
    severity: "medium",
    description: "Audi recalled 2022-2024 Q4 e-tron and Q4 e-tron Sportback vehicles because incorrect headlight control module software causes the parking lights to not operate as intended when headlights are on and turn signals are activated. This reduces vehicle visibility to other drivers, particularly at night or in poor weather conditions, increasing crash risk. The issue is a software calibration error in the headlight control module.",
    symptoms: [
      "Parking lights not illuminating when headlights are on",
      "Reduced side visibility at night during turns",
      "Turn signal activation affects parking light operation",
      "Other drivers unable to see vehicle from the side",
      "No visible warning on dashboard (silent failure)"
    ],
    solution: "Contact Audi dealer for headlight control module software update under this recall. The update corrects the data set controlling parking light behavior during turn signal operation. This is a free software flash that takes approximately 30 minutes. No physical parts replacement is needed. Check your VIN at recalls.audi.com to confirm if your vehicle is affected.",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "Audi recall covering 2022-2024 Q4 e-tron and Q4 e-tron Sportback. Headlight control module software update free of charge.",
    communityRecommendations: [
      {
        type: "tip",
        content: "This is a silent failure - you won't see a dashboard warning. Have someone stand outside while you activate turn signals at night to check if parking lights remain on.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },
  {
    id: "audi-q4-etron-cold-weather-range-2022",
    make: "Audi",
    model: "Q4 e-tron",
    years: { start: 2023, end: 2024 },
    title: "Severe Cold Weather Range Loss (Models Without Heat Pump)",
    severity: "medium",
    description: "Audi removed the heat pump from Q4 e-tron models starting February 2023, replacing it with a less efficient resistive heater, citing semiconductor supply shortages. Without the heat pump, cold weather range loss is dramatically worse: 25-35% reduction in freezing conditions versus 5-10% with the heat pump equipped versions. Heat pumps achieve a coefficient of performance around 3.0 (3 units of heat per unit of electricity), while resistive heaters operate at 1.0. Some dealers lack the proper refrigerant and equipment to service heat pump systems on earlier vehicles that have them. Many buyers are unaware their vehicle lacks this feature.",
    symptoms: [
      "Dramatic range reduction in cold weather (25-35% loss)",
      "Range estimate drops significantly when cabin heater is used",
      "Much higher energy consumption per mile in winter",
      "Frequent charging needed during cold weather commutes",
      "Range noticeably worse than expected from EPA rating",
      "Cabin takes longer to warm up in extreme cold"
    ],
    solution: "Check your build sheet or window sticker to determine if your Q4 e-tron has a heat pump - vehicles built after February 2023 likely do NOT have one. For non-heat-pump models: use seat heaters and steering wheel heater instead of cabin air heater to preserve range. Pre-condition the cabin while plugged in before departing. Set cabin temperature to 68F or lower. Enable eco mode for climate. Use range-optimized route planning. For heat pump equipped models experiencing issues: dealer service may need specialized R-744 (CO2) refrigerant which many shops don't stock - call ahead. Aftermarket heat pump installation is NOT feasible.",
    estimatedCost: {
      low: 0,
      high: 300
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "Pre-condition the cabin while plugged into your home charger before departing. This uses grid electricity instead of battery energy, preserving range for your drive.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Seat heaters and steering wheel heater use 75W combined vs 5,000W+ for the cabin air heater. In mild cold (30-45F), these alone may be sufficient and save significant range.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If buying used, verify heat pump presence on the build sheet. The absence is not obvious from the outside and makes a significant difference in cold climate usability.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },

  // ============================================================
  // AUDI SQ5 (2014-2024) - Performance SUV
  // ============================================================
  {
    id: "audi-sq5-pcv-valve-2014",
    make: "Audi",
    model: "SQ5",
    years: { start: 2014, end: 2017 },
    title: "PCV Valve Failure Under Supercharger (3.0T)",
    severity: "medium",
    description: "The 2014-2017 Audi SQ5 with the 3.0T supercharged V6 (EA837) suffers from PCV (Positive Crankcase Ventilation) valve failures. The PCV valve is located underneath the Eaton supercharger, making replacement labor-intensive and expensive. When the PCV fails, it causes rough idle, misfires, oil consumption, and can damage seals and gaskets from excess crankcase pressure. The DTC P052E (PCV Regulator Valve Performance) is triggered, though the issue is often the connected breather hose (PN 06E103207AP) rather than the valve itself. At higher mileages, this is nearly inevitable and typically occurs between 60,000-80,000 miles.",
    symptoms: [
      "Check engine light with PCV-related codes",
      "Rough idle that worsens over time",
      "Engine misfires under load",
      "Increased oil consumption",
      "Whistling or hissing noise from engine",
      "Loss of boost or reduced supercharger performance",
      "Oil leaks from various gaskets and seals"
    ],
    solution: "Scan for DTC P052E - if present, inspect BOTH the PCV valve and the breather hose (06E103207AP). Simply replacing the PCV valve often does not clear the code if the hose is the actual failure point. Due to the PCV location under the supercharger, labor is 4-6 hours. Consider replacing the entire PCV assembly (valve + hoses + diaphragm) as a kit since the supercharger must be partially removed regardless. Install an oil catch can to reduce carbon vapor reaching the PCV system and extend service life. RKX makes a repair kit that replaces just the PCV diaphragm for ~$30 if the housing is undamaged.",
    estimatedCost: {
      low: 400,
      high: 1500
    },
    communityRecommendations: [
      {
        type: "part",
        content: "RKX PCV diaphragm repair kit is $25-35 and replaces the failed rubber membrane without replacing the entire housing. Great DIY option if you're already pulling the supercharger.",
        partBrand: "RKX",
        partName: "3.0T PCV Assembly Repair Kit",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "Replace the breather hose 06E103207AP at the same time as the PCV valve - it's the actual failure point in many cases and you don't want to pull the supercharger twice.",
        partBrand: "Genuine VW/Audi",
        partName: "PCV Breather Hose",
        partNumber: "06E103207AP",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Install an oil catch can (034Motorsport or APR) to intercept oil vapors before they reach the PCV system. This dramatically extends PCV and intake valve life on the 3.0T.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Combine PCV replacement with carbon cleaning (walnut blast) since the supercharger is already being removed. Two birds, one stone, one labor bill.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P052E"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["3.0T Supercharged"]
  },
  {
    id: "audi-sq5-carbon-buildup-2014",
    make: "Audi",
    model: "SQ5",
    years: { start: 2014, end: 2024 },
    title: "Intake Valve Carbon Buildup (Direct Injection)",
    severity: "medium",
    description: "Both the 3.0T supercharged (2014-2017) and 3.0T turbocharged (2018-2024) SQ5 engines suffer from carbon buildup on intake valves due to direct fuel injection. Without port injectors to wash fuel over the intake valves, oil vapors from the PCV system and combustion byproducts accumulate as hard carbon deposits. The B9 SQ5 (2018+) EA839 engine is particularly challenging to clean because the intake valves are positioned outside the V at a difficult angle. Symptoms become noticeable around 60,000-80,000 miles and progressively worsen. Walnut blasting is the standard remedy.",
    symptoms: [
      "Rough idle that worsens over time",
      "Hesitation or stumbling on acceleration",
      "Reduced power output",
      "Engine misfires (often on specific cylinders)",
      "Cold start roughness that improves when warm",
      "Increased fuel consumption",
      "Check engine light with misfire codes"
    ],
    solution: "Walnut blasting (media blasting) is the industry-standard fix, using crushed walnut shells to remove carbon deposits from intake valves without damaging the ports. Cost is $500-$800 at an independent shop, $800-$1,200 at dealers. Should be performed every 50,000-60,000 miles as preventive maintenance. For the B9 SQ5 (2018+), the valve angle makes this more labor-intensive. After cleaning, install an oil catch can to slow future buildup. Chemical intake cleaners (CRC GDI Valve Cleaner) can slow accumulation but cannot remove established deposits.",
    estimatedCost: {
      low: 500,
      high: 1200
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "Schedule walnut blasting at 50,000-60,000 miles as preventive maintenance, even if you don't notice symptoms yet. By the time misfires appear, buildup is severe.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "034Motorsport or APR oil catch can prevents the majority of oil vapor from reaching intake valves. Install at first service for best results.",
        partBrand: "034Motorsport",
        partName: "Billet Oil Catch Can",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "On the B8 SQ5 (2014-2017), combine walnut blasting with PCV valve replacement since both require similar disassembly. Save on labor by doing both at once.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "CRC GDI IVD Intake Valve & Turbo Cleaner sprayed into the intake every 10,000 miles can slow carbon accumulation between walnut blast services.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304", "P0305", "P0306"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["3.0T Supercharged", "3.0T"]
  },
  {
    id: "audi-sq5-water-pump-2018",
    make: "Audi",
    model: "SQ5",
    years: { start: 2018, end: 2024 },
    title: "EA839 3.0T Water Pump Internal Leak Causing Cascade Failures",
    severity: "high",
    description: "The 2018-2024 Audi SQ5 with the EA839 3.0T turbocharged V6 has an inherent design flaw in its vacuum-operated water pump. The pump's internal rod seal degrades over time, allowing pressurized coolant to leak into the vacuum chamber. The engine then draws this coolant through vacuum lines to critical components including the N649 switch valve and turbocharger boost control solenoids. This destroys the wastegate actuator vacuum supply, causing underboost conditions (P0299). What starts as a $0.79 rod seal failure cascades into $3,000-$5,400 in damage including the water pump, vacuum lines, changeover valve, and vacuum reservoir. This is considered a 'when, not if' failure.",
    symptoms: [
      "Coolant level dropping with no visible external leak",
      "Check engine light with underboost code P0299",
      "Loss of turbo boost power",
      "Rough running or misfires",
      "White residue or coolant traces in vacuum lines",
      "Sweet coolant smell from engine bay",
      "Wastegate rattle or flutter noise"
    ],
    solution: "If coolant is disappearing without visible leaks, suspect the water pump internal seal IMMEDIATELY. Have a dealer or specialist inspect vacuum lines for coolant contamination. Early detection can limit damage to water pump replacement only ($1,200-$1,800). If coolant has already migrated through vacuum system: full repair includes water pump, vacuum lines, changeover valve, and vacuum reservoir ($3,000-$5,400 at dealer). NGP Racing and other specialists sell upgraded water pump assemblies with improved seals. Preventive water pump replacement at 60,000-70,000 miles is strongly recommended by the enthusiast community.",
    estimatedCost: {
      low: 1200,
      high: 5400
    },
    communityRecommendations: [
      {
        type: "warning",
        content: "This is a cascade failure - catching it early (water pump only) saves $2,000-$3,000 versus waiting until coolant destroys the vacuum system, solenoids, and wastegate actuators. Check coolant level monthly.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "The telltale sign is coolant loss with no puddle. If you're adding coolant every few weeks but see no leak, the pump is leaking internally into the vacuum system. Act immediately.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "NGP Racing offers an upgraded water pump assembly with improved seals for the EA839. Consider this over OEM if replacing due to failure.",
        partBrand: "New German Performance",
        partName: "EA839 Upgraded Water Pump Assembly",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "FCP Euro's lifetime replacement warranty covers the water pump - buy from them so if it fails again, you get a free replacement part.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0299", "P0128"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["3.0T"]
  },
  {
    id: "audi-sq5-mechatronic-2014",
    make: "Audi",
    model: "SQ5",
    years: { start: 2014, end: 2017 },
    title: "S-tronic (DL501/0B5) Mechatronic Unit Failure",
    severity: "high",
    description: "The 2014-2017 Audi SQ5 with the 7-speed S-tronic dual-clutch transmission (DL501/0B5) is prone to mechatronic unit failure. The mechatronic unit controls all gear changes via electro-hydraulic solenoid valves. Internal component breakdown causes harsh shifting, limp mode, loss of gears, and eventual transmission failure. Symptoms progress from occasional harsh shifts to critical failures including loss of reverse, inability to shift above first gear, or complete transmission lockout. The 0B5 mechatronic is a very common failing component across Audi models using this gearbox.",
    symptoms: [
      "Harsh or jerky gear changes",
      "EPC (Electronic Power Control) warning light",
      "PRNDS indicator flashing on dashboard",
      "Transmission enters limp mode (stuck in one gear)",
      "Loss of reverse gear",
      "Shuddering when accelerating from a stop in 1st/2nd gear",
      "Gearbox malfunction warning message"
    ],
    solution: "Early symptoms (occasional harsh shifts): Have dealer check for DTCs and perform S-tronic adaptation reset. Fluid change with genuine ZF Lifeguard 7.2 may help if caught early. Advanced failure (limp mode, lost gears): Mechatronic unit replacement required ($2,500-$4,500 installed). ECU Testing and similar remanufacturers offer rebuilt units for $1,200-$1,800 which are viable alternatives to $3,000+ new OEM units. Complete transmission failure: Full S-tronic replacement ($6,000-$9,000). Preventive S-tronic fluid change every 40,000 miles significantly extends mechatronic life (despite Audi's 'lifetime fill' claim).",
    estimatedCost: {
      low: 2500,
      high: 9000
    },
    communityRecommendations: [
      {
        type: "warning",
        content: "Audi calls the S-tronic fluid a 'lifetime fill' but this is NOT true for high-performance use. Change fluid every 40,000 miles with ZF Lifeguard 7.2 to extend mechatronic and clutch pack life.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Remanufactured mechatronic units from specialists like ECU Testing (UK) cost $1,200-$1,800 versus $3,000+ for new OEM. They come with warranties and have good track records.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If the transmission shudders in 1st/2nd from a stop, get it checked immediately. This is the early warning sign - once it progresses to limp mode, the mechatronic is usually beyond repair.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "transmission",
    dtcCodes: ["P17D8", "P174B", "P174F", "P179C", "P1740"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["3.0T Supercharged"]
  },
  {
    id: "audi-sq5-supercharger-oil-leak-2014",
    make: "Audi",
    model: "SQ5",
    years: { start: 2014, end: 2017 },
    title: "Supercharger Seal and Gasket Oil Leaks (3.0T)",
    severity: "medium",
    description: "The 2014-2017 Audi SQ5's Eaton supercharger develops oil leaks from deteriorating seals and gaskets, particularly the nose cone seal, rotor shaft seals, and the supercharger-to-intake manifold gasket. The high operating temperatures of the supercharger accelerate rubber degradation. Oil seepage from the supercharger can coat the engine valley and nearby components, creating a burning oil smell and potentially causing belt slippage if oil reaches the serpentine belt. Additionally, the vacuum pump and timing chain cover gaskets are common leak sources on the 3.0T. These leaks typically appear around 70,000-100,000 miles.",
    symptoms: [
      "Burning oil smell from engine bay",
      "Visible oil residue on supercharger housing",
      "Oil drips on engine valley/valley pan",
      "Oil consumption increasing gradually",
      "Oil on serpentine belt area",
      "Minor smoke from engine bay after driving"
    ],
    solution: "JHM Motorsports sells a complete supercharger replacement seal and gasket kit for the Eaton unit in the 3.0T. Replacing all seals at once is recommended since the supercharger must be removed for access. Nose cone seal, rotor shaft seals, and manifold gaskets should all be replaced together ($300-$500 in parts, $600-$1,200 labor). While the supercharger is off, also replace the PCV valve and perform carbon cleaning. For valve cover gasket leaks (separate issue), budget $400-$800 parts and labor. Monitor oil level weekly if leaks are present.",
    estimatedCost: {
      low: 800,
      high: 2000
    },
    communityRecommendations: [
      {
        type: "part",
        content: "JHM complete supercharger seal and gasket kit includes everything needed for the Eaton unit: nose cone seal, rotor shaft seals, manifold gaskets, and all o-rings.",
        partBrand: "JHM Motorsports",
        partName: "Supercharger Complete Seal & Gasket Kit",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "While the supercharger is removed, address PCV valve, carbon cleaning, and spark plug replacement. The labor overlap saves $500-$800 versus doing these services separately.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Use Liqui Moly 5W-40 oil and change every 5,000 miles. Extended oil change intervals accelerate seal degradation from acidic oil buildup.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: [],
    trims: ["Premium Plus", "Prestige"],
    engines: ["3.0T Supercharged"]
  },

  // ============================================================
  // AUDI SQ7 (2020-2024) - 4.0T Twin-Turbo
  // ============================================================
  {
    id: "audi-sq7-turbo-oil-filter-2020",
    make: "Audi",
    model: "SQ7",
    years: { start: 2020, end: 2024 },
    title: "Turbocharger Oil Supply Filter Clogging (4.0T TFSI)",
    severity: "high",
    description: "The 4.0T TFSI twin-turbo V8 in the Audi SQ7 has turbocharger oil supply line filters (strainers) that can clog with deposits, starving the turbochargers of lubrication. This was a known defect in earlier 4.0T applications (2013-2017 S6/S7/S8/RS7) that led to NHTSA Recall 21H7, but the 2020+ SQ7 uses the same fundamental engine architecture. The original filter mesh was 30 microns; Audi revised it to 90 microns (PN 079115175G) to reduce clogging. If filters clog, turbo bearings fail rapidly, causing seized turbos, engine stall, and potential turbocharger housing rupture. Audi TSB 2044640 addresses this issue.",
    symptoms: [
      "Unusual whining or whistling from turbo area",
      "Reduced turbo boost and power loss",
      "Engine difficult to start",
      "Check engine light with turbo-related codes",
      "Metal shavings in oil (turbo bearing debris)",
      "Sudden engine stall during driving",
      "Excessive oil consumption"
    ],
    solution: "PREVENTIVE: Replace turbo oil supply filters with the latest revision (PN 079115175G with 90-micron mesh) at 40,000-50,000 miles, even if no symptoms are present. This is a $200-$400 preventive service that protects $8,000-$15,000 worth of turbochargers. Use high-quality synthetic oil (VW 502.00 or 504.00 spec) and change every 5,000-7,500 miles - extended intervals accelerate filter clogging. If turbo whine or power loss is already present, immediate diagnosis is critical. Failed turbos require replacement ($4,000-$8,000 per turbo, $8,000-$15,000 for both).",
    estimatedCost: {
      low: 200,
      high: 15000
    },
    communityRecommendations: [
      {
        type: "part",
        content: "Revised turbo oil strainer 079115175G has 90-micron mesh vs original 30-micron. This is the mandatory upgrade part. Replace both left and right side filters.",
        partBrand: "Genuine VW/Audi",
        partName: "Turbo Oil Strainer (Revised 90μm)",
        partNumber: "079115175G",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "This is a 'when not if' maintenance item on the 4.0T. Budget $200-$400 for preventive filter replacement at 40,000 miles. Ignoring this can result in $15,000 turbo replacement.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Use Liqui Moly Molygen 5W-40 or Castrol Edge 5W-40 and change at 5,000-mile intervals. The 4.0T is NOT an engine for 10,000-mile oil change intervals regardless of what the service reminder says.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0299", "P0234"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },
  {
    id: "audi-sq7-air-suspension-2020",
    make: "Audi",
    model: "SQ7",
    years: { start: 2020, end: 2024 },
    title: "Adaptive Air Suspension Compressor and Air Spring Failures",
    severity: "medium",
    description: "The Audi SQ7's sport-calibrated adaptive air suspension system (4M chassis, shared with Q8/SQ8/Bentley Bentayga/Lamborghini Urus) develops failures in air springs, the compressor, valve block, and height sensors. Compressors typically last 80,000-100,000 km but high ambient temperatures, frequent off-road use, or air leaks cause premature failure. Air spring leaks cause the compressor to run continuously (even with engine off), eventually burning it out. The SQ7's significant curb weight (5,500+ lbs) stresses the system more than lighter vehicles on the same platform.",
    symptoms: [
      "Vehicle sitting low on one or more corners overnight",
      "Air suspension fault warning on dashboard",
      "Compressor running audibly with engine off",
      "Hissing noise from wheel wells (air spring leak)",
      "Ride quality noticeably degraded or excessively bouncy",
      "Height adjustment no longer responds",
      "Error codes 02250 or 01447 in diagnostic scan"
    ],
    solution: "Diagnose specific failed component: air springs leak most commonly, followed by compressor burnout, valve block faults, and height sensor failures. Air spring replacement ($800-$1,500 per corner at independent shop). Compressor replacement ($1,200-$2,500 installed). Valve block: $500-$1,000. Height sensor: $200-$400. Check for air leaks first using soapy water spray before replacing the compressor - a $200 air spring seal may be causing a $2,000 compressor to overwork and fail. Aftermarket solutions from Arnott offer cost savings. Converting to conventional springs ($1,500-$2,500) eliminates future air suspension costs but sacrifices ride height adjustment.",
    estimatedCost: {
      low: 800,
      high: 3500
    },
    communityRecommendations: [
      {
        type: "part",
        content: "WABCO/Arnott air suspension compressor fits the 4M chassis (Q7, Q8, SQ7, SQ8, Bentayga, Urus). OEM is WABCO - aftermarket options save 40-50%.",
        partBrand: "Arnott",
        partName: "Air Suspension Compressor (4M Chassis)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If you hear the compressor running with the engine off, investigate immediately. It means an air spring is leaking and the compressor is trying to compensate. Continued operation burns out the compressor.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Park in a garage when possible, especially in extreme heat or cold. Temperature extremes accelerate air spring rubber degradation.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "suspension",
    dtcCodes: ["02250", "01447", "01772"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },
  {
    id: "audi-sq7-coolant-line-leak-2020",
    make: "Audi",
    model: "SQ7",
    years: { start: 2020, end: 2024 },
    title: "Turbo Coolant Line and Coolant Reservoir Seepage",
    severity: "medium",
    description: "The Audi SQ7's 4.0T V8 develops coolant leaks from turbocharger coolant line o-rings and the coolant reservoir. The o-rings in the turbo coolant and oil lines deteriorate from the extreme heat generated by the hot-V twin-turbo configuration (turbochargers mounted between the cylinder banks). The coolant reservoir is also a known weak point at higher mileages, developing cracks. Audi issued service campaign 21F2 for coolant line leaks. Water pump gasket seepage has also been documented. These leaks can lead to overheating if coolant level drops too low.",
    symptoms: [
      "Coolant level dropping gradually",
      "Sweet coolant smell from engine bay",
      "Visible coolant residue around turbocharger area",
      "Low coolant warning on dashboard",
      "Coolant reservoir cracking or weeping",
      "Overheating warning if level drops significantly",
      "White residue on coolant lines"
    ],
    solution: "Check coolant level monthly. For turbo coolant line leaks: replace o-rings and seals in turbo coolant supply and return lines. The hot-V configuration means these o-rings see extreme temperatures - use only OEM specification replacement o-rings rated for the operating temperature. Coolant reservoir cracking: replace reservoir ($100-$200 part, $200-$400 installed). Water pump gasket seepage: monitor and replace if leak worsens ($600-$1,200). Ask dealer about service campaign 21F2 for coolant line inspection and repair. Always use G13 spec coolant.",
    estimatedCost: {
      low: 300,
      high: 1500
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "The hot-V turbo layout means coolant lines near the turbos see extreme temperatures. Budget for turbo coolant line o-ring replacement every 50,000-60,000 miles as preventive maintenance.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Do not ignore gradual coolant loss - even minor leaks near the turbochargers can worsen suddenly under boost, leading to rapid overheating and potential engine damage.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Use only Audi G13 specification coolant. Mixing coolant types can cause silicate gelation that clogs the turbo coolant lines, accelerating leak development.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P00B7", "P0128"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },
  {
    id: "audi-sq7-mmi-mib3-freeze-2020",
    make: "Audi",
    model: "SQ7",
    years: { start: 2020, end: 2022 },
    title: "MIB3 Infotainment System Freezing and Black Screen",
    severity: "low",
    description: "The 2020-2022 Audi SQ7's MIB3 infotainment system experiences freezing, black screens, and startup failures. The system may get stuck on the Audi welcome screen, display a blue screen, or go completely black. CarPlay sessions may start with a dark display. MMI favorites are lost regularly, and the system can require multiple restart cycles to become responsive. Audi addressed most of these issues with improved software in MY2023 models. Pre-2023 vehicles require dealer software updates.",
    symptoms: [
      "MMI display frozen on Audi welcome screen",
      "Center display completely black",
      "CarPlay display starts dark then slowly loads",
      "MMI favorites lost or reset after each startup",
      "System unresponsive to touch input",
      "Navigation freezes or shows incorrect position",
      "Bluetooth connectivity drops repeatedly"
    ],
    solution: "Try a manual MMI reboot first: press and hold the volume/power button for 30 seconds. If that fails, perform a full system shutdown: roll up all windows, exit vehicle, close and lock all doors, keep key fobs at least 30 feet from vehicle, wait at least 60 minutes, then restart. For persistent issues, schedule a dealer visit for MIB3 software update. MY2023+ vehicles received improved base software that resolves most issues. If hardware is faulty (rare), the MIB3 head unit replacement is $1,500-$2,500.",
    estimatedCost: {
      low: 0,
      high: 2500
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "The 30-second volume button hold is the quick fix for 90% of MIB3 freezes. Learn this trick and it'll save you frustration on the road.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Ask your dealer to update to the latest MIB3 firmware at every service visit. Audi has released multiple updates specifically addressing stability issues.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: [],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },
  {
    id: "audi-sq7-valve-cover-oil-leak-2020",
    make: "Audi",
    model: "SQ7",
    years: { start: 2020, end: 2024 },
    title: "Valve Cover Gasket Oil Leaks (4.0T V8)",
    severity: "medium",
    description: "The Audi SQ7's 4.0T V8 develops oil leaks from the valve cover gaskets and turbocharger oil seal failures. The hot-V configuration subjects valve cover gaskets to extreme temperatures, accelerating rubber degradation. Oil seepage is most noticeable at the rear of the engine near the firewall, making visual detection difficult. Turbocharger oil seal failures (turbo shaft seals on the intake side) can cause oil to enter the intake tract and be burned, resulting in blue/white exhaust smoke and increased oil consumption without visible external leaks. These issues typically appear between 60,000-80,000 miles.",
    symptoms: [
      "Oil smell from engine bay, especially after driving",
      "Visible oil residue on engine, particularly rear/firewall side",
      "Gradual increase in oil consumption",
      "Blue or white smoke from exhaust (turbo seal leak)",
      "Oil drips on garage floor or splash shield",
      "Oil consumption without visible external leak (internal turbo seal)"
    ],
    solution: "Valve cover gasket replacement: $800-$1,500 per bank due to the V8 configuration. Replace both sides simultaneously as the other side will likely fail soon. Turbo oil seal failure (internal): If oil consumption increases suddenly without visible leaks and you notice blue/white smoke, suspect turbo shaft seals. Turbo rebuild or replacement ($4,000-$8,000 per turbo). For valve cover gasket work, use OEM-spec silicone-coated gaskets designed for high-temperature operation. Change oil every 5,000-7,500 miles with VW 502.00 spec oil.",
    estimatedCost: {
      low: 800,
      high: 3000
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "The hot-V configuration means the valve covers see higher temps than a traditional layout. Don't extend oil changes beyond 7,500 miles - acidic old oil eats gaskets faster.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If you notice sudden oil consumption (1qt per 1,000 miles) with no external leak but blue exhaust smoke, suspect turbo shaft seals. This is internal and requires immediate attention before turbo debris enters the engine.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: [],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },

  // ============================================================
  // AUDI SQ8 (2020-2024) - 4.0T Twin-Turbo
  // ============================================================
  {
    id: "audi-sq8-turbo-oil-filter-2020",
    make: "Audi",
    model: "SQ8",
    years: { start: 2020, end: 2024 },
    title: "Turbocharger Oil Supply Filter Clogging (4.0T TFSI)",
    severity: "high",
    description: "The SQ8's 4.0T TFSI twin-turbo V8 shares the same turbo oil supply filter clogging issue as the SQ7 and other 4.0T applications. The original 30-micron mesh filters can clog with oil deposits as early as 40,000 miles, starving the turbochargers of lubrication. Audi revised the filter to 90-micron mesh (PN 079115175G) after recall 21H7 on earlier 4.0T models. Turbo bearing failure from oil starvation leads to seized turbochargers, engine stalling, and potential turbo housing rupture. Preventive filter replacement is critical.",
    symptoms: [
      "Unusual whining or whistling from turbo area",
      "Reduced boost and noticeable power loss",
      "Engine difficult to start or stalls",
      "Check engine light with boost-related codes",
      "Metal shavings found during oil change",
      "Increased oil consumption",
      "Turbocharger housing oil leak"
    ],
    solution: "PREVENTIVE: Replace turbo oil supply filters with revised PN 079115175G (90-micron mesh) at 40,000-50,000 miles. This $200-$400 service prevents $8,000-$15,000 in turbo replacement costs. Maintain strict 5,000-7,500 mile oil change intervals with VW 502.00 or 504.00 specification oil. If turbo whine or power loss is already present, diagnose immediately - continuing to drive with oil-starved turbos causes rapid bearing destruction. Reference Audi TSB 2044640 for the established repair procedure.",
    estimatedCost: {
      low: 200,
      high: 15000
    },
    communityRecommendations: [
      {
        type: "part",
        content: "Revised turbo oil strainer 079115175G (90-micron mesh) is the critical upgrade. Replace both left and right side filters preventively.",
        partBrand: "Genuine VW/Audi",
        partName: "Turbo Oil Strainer (Revised 90μm)",
        partNumber: "079115175G",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Do NOT follow the 10,000-15,000 mile service interval on the 4.0T. Change oil at 5,000-7,500 miles maximum. Extended intervals are the primary cause of filter clogging.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If buying a used SQ8, ask for service records showing oil change frequency and whether turbo oil filters have been replaced. No records = assume the worst and budget for immediate filter replacement.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0299", "P0234"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },
  {
    id: "audi-sq8-air-suspension-2020",
    make: "Audi",
    model: "SQ8",
    years: { start: 2020, end: 2024 },
    title: "Adaptive Air Suspension Compressor and Air Spring Failures",
    severity: "medium",
    description: "The SQ8's sport-calibrated adaptive air suspension (4M chassis) develops the same failures as the SQ7: air spring leaks, compressor burnout, valve block faults, and height sensor failures. The SQ8's coupe-SUV styling results in a slightly lower center of gravity than the SQ7, but the same 5,400+ lb curb weight stresses the air system. Compressor lifespan is typically 80,000-100,000 km. Air spring leaks cause the compressor to overwork and eventually fail. Cost of full system repair is significant across all four corners.",
    symptoms: [
      "Vehicle sitting low on one or more corners after parking",
      "Air suspension fault message on MMI display",
      "Compressor running with engine off",
      "Hissing from wheel well area (air leak)",
      "Harsh ride quality replacing the normal comfort",
      "Height adjustment disabled in drive select",
      "Diagnostic codes 002F or 01772"
    ],
    solution: "Same diagnostic and repair approach as SQ7 (shared 4M platform). Isolate the failed component: air springs ($800-$1,500 per corner), compressor ($1,200-$2,500), valve block ($500-$1,000), or height sensor ($200-$400). Always check for air leaks before replacing the compressor. Aftermarket air suspension components from Arnott/Strutmasters offer 40-50% savings over OEM. Annual inspection of air springs for cracking recommended, especially in hot climates where UV and heat accelerate rubber degradation.",
    estimatedCost: {
      low: 800,
      high: 3500
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "The 4M platform air suspension is shared across Q7, Q8, SQ7, SQ8, Bentley Bentayga, and Lamborghini Urus. Aftermarket parts are widely available and significantly cheaper than OEM.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If the vehicle sits noticeably low on one corner after overnight parking, that air spring is leaking. Drive carefully to the shop - the compressor is overworking to compensate and will burn out if you delay.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "suspension",
    dtcCodes: ["002F", "01772", "01447"],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },
  {
    id: "audi-sq8-airbag-mount-2023",
    make: "Audi",
    model: "SQ8",
    years: { start: 2023, end: 2024 },
    title: "Driver's Seat Side Airbag Improperly Mounted (Recall)",
    severity: "high",
    description: "Certain 2023-2024 Audi SQ8 vehicles were recalled because the driver's seat side airbag may be improperly mounted to the seatback frame. In a side-impact collision, an improperly mounted airbag may not deploy correctly, failing to protect the driver from head and torso injuries. This is a manufacturing assembly defect, not a design flaw. The recall also affects the Q7, SQ7, and Q8 on the same production line.",
    symptoms: [
      "No visible symptoms (manufacturing defect)",
      "Airbag warning light may illuminate in some cases",
      "Visual inspection may show loose airbag module mounting"
    ],
    solution: "Contact Audi dealer to check if your VIN is included in this recall. The dealer will inspect and re-secure the driver's seat side airbag mounting to the seatback frame, free of charge. This is a safety-critical repair that should not be delayed. There is no way for owners to self-inspect this issue as it requires removal of the seat cover to access the airbag mounting points.",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "Recall covering certain 2023-2024 SQ8, SQ7, Q7, and Q8 vehicles for improperly mounted driver's seat side airbag. Repair free of charge.",
    communityRecommendations: [
      {
        type: "warning",
        content: "This is a critical safety recall - an improperly mounted side airbag may not deploy in a crash. Schedule the inspection immediately even if no warning light is present.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "safety",
    dtcCodes: [],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },
  {
    id: "audi-sq8-mmi-mib3-freeze-2020",
    make: "Audi",
    model: "SQ8",
    years: { start: 2020, end: 2022 },
    title: "MIB3 Infotainment System Freezing and Black Screen",
    severity: "low",
    description: "The 2020-2022 Audi SQ8's MIB3 infotainment system suffers from the same freezing, black screen, and startup issues as the SQ7. The dual-screen MMI setup can freeze on the welcome screen, go completely black, or lose saved favorites and settings. CarPlay connections may fail or display incorrectly. Central locking system malfunctions have also been reported in conjunction with infotainment failures on the 2021 model year. MY2023 models received improved MIB3 software that resolves most stability issues.",
    symptoms: [
      "Center MMI display frozen or black",
      "Lower climate control screen unresponsive",
      "CarPlay fails to connect or displays incorrectly",
      "Saved favorites and settings lost on restart",
      "Central locking system erratic behavior",
      "Navigation freezes mid-route",
      "Tail light assembly display flickering"
    ],
    solution: "Quick fix: press and hold volume/power knob for 30 seconds to force reboot. Full reset: exit vehicle, lock all doors, remove key fobs from proximity, wait 60+ minutes. For persistent issues, dealer MIB3 software update is required. MY2023+ models have the improved software. If the physical MIB3 head unit is faulty, replacement is $1,500-$2,500. For central locking issues occurring with infotainment failures, the MIB3 software update often resolves both simultaneously.",
    estimatedCost: {
      low: 0,
      high: 2500
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "The SQ8's dual-screen MMI setup means twice the potential for display issues. The volume button reboot resets both screens simultaneously.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If door locks are behaving erratically along with infotainment issues, it's likely the same root cause (MIB3 software). One dealer update should fix both.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: [],
    trims: ["Premium Plus", "Prestige"],
    engines: ["4.0T"]
  },

  // ============================================================
  // AUDI RS e-tron GT (2022-2024) - Electric Performance
  // ============================================================
  {
    id: "audi-rs-etron-gt-battery-short-2022",
    make: "Audi",
    model: "RS e-tron GT",
    years: { start: 2022, end: 2024 },
    title: "800V Battery Module Short Circuit and Fire Risk (Recall 93VM)",
    severity: "high",
    description: "The 2022-2024 Audi RS e-tron GT shares the same critical battery module defect as the standard e-tron GT. Approximately 1,519 RS e-tron GTs built between March 2021 and February 2024 are affected. LG Energy Solution battery modules can develop internal short circuits leading to thermal events or fires. The RS e-tron GT's more aggressive power delivery and higher performance use may stress battery modules differently than the standard model. Three recall campaigns were issued spanning December 2023 through September 2024. Owners must limit charging to 80% until the recall remedy is applied.",
    symptoms: [
      "Battery warning message on instrument cluster",
      "Reduced range or sudden range drops",
      "Charging stops before reaching set limit",
      "High-voltage system malfunction warning",
      "Power output reduced by vehicle",
      "Smoke or unusual smell from undercarriage"
    ],
    solution: "CRITICAL SAFETY ISSUE: Immediately limit charging to 80% maximum. Check recalls.audi.com with your VIN. Contact Audi at 1-800-253-2834 referencing recall 93VM. The recall remedy is an OBD software update that detects battery anomalies in real-time, plus physical replacement of affected modules. Do NOT charge unattended in a garage until the recall is completed. If you notice smoke or unusual heat, exit the vehicle immediately and call 911. This is the same Porsche Taycan battery defect (shared J1 platform).",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "NHTSA recalls covering 2022-2024 RS e-tron GT. Recall 93VM (December 2023) for 2022-2023, expanded September 2024 to include 2024. Software update plus affected module replacement, all free of charge.",
    communityRecommendations: [
      {
        type: "warning",
        content: "The RS model's higher power output means more aggressive battery cycling. Do not delay the recall - thermal events can occur without warning. Park outdoors away from structures until repaired.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "After the recall software update, the system may detect anomalies and limit charging further. This is a safety feature - schedule physical module replacement as soon as parts are available.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: []
  },
  {
    id: "audi-rs-etron-gt-brake-hose-2022",
    make: "Audi",
    model: "RS e-tron GT",
    years: { start: 2022, end: 2024 },
    title: "Front Axle Brake Hose Tear and Fluid Leak (Recall 47UP)",
    severity: "high",
    description: "The 2022-2024 RS e-tron GT is included in NHTSA Recall 24V465000 (Audi code 47UP) for front brake hoses that develop tears from normal bending during operation. Given the RS e-tron GT's 637 hp output and 5,100+ lb curb weight, brake system integrity is critical for safe operation. The fabric material in the hoses cracks, causing brake fluid leaks and extended stopping distances. This is particularly concerning for a vehicle capable of 0-60 mph in 3.1 seconds. Both front brake hoses are replaced under the recall.",
    symptoms: [
      "Brake pedal feels longer/spongier than normal",
      "Brake warning light illuminated",
      "Visible brake fluid near front wheel area",
      "Reduced braking performance",
      "Brake fluid level dropping",
      "Soft brake pedal under hard braking"
    ],
    solution: "Contact Audi dealer immediately to schedule recall 47UP (NHTSA 24V465000). Both front brake hoses are replaced free of charge. Given the RS e-tron GT's extreme performance capability and heavy curb weight, do NOT delay this repair. If you notice any change in brake pedal feel, avoid driving and have the vehicle towed. Track use should be suspended until the recall is completed.",
    estimatedCost: {
      low: 0,
      high: 0
    },
    recallInfo: "NHTSA Recall 24V465000 / Audi Recall 47UP. Covers 2022-2024 RS e-tron GT. Front brake hose replacement free of charge. Owner notification August 2024.",
    communityRecommendations: [
      {
        type: "warning",
        content: "The RS e-tron GT can reach extremely high speeds. Brake failure at speed in a 5,100+ lb vehicle is catastrophic. This recall is not optional.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If you track your RS e-tron GT, have the dealer install upgraded brake hoses after the recall. Stock replacement hoses may experience the same fatigue under repeated heavy track braking.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "brakes",
    dtcCodes: []
  },
  {
    id: "audi-rs-etron-gt-tire-wear-2022",
    make: "Audi",
    model: "RS e-tron GT",
    years: { start: 2022, end: 2024 },
    title: "Accelerated Tire Wear and Alignment Sensitivity",
    severity: "medium",
    description: "RS e-tron GT owners report extremely fast tire wear, particularly on the rear axle with the staggered tire setup (typically 265/35R21 front, 305/30R21 rear). The vehicle's 637 hp, 612 lb-ft of instant torque, and 5,100+ lb curb weight create enormous stress on rear tires. Owners report rear tires lasting only 8,000-15,000 miles with spirited driving. Even slight alignment deviations cause uneven wear patterns and highway tramline feel (the car tracking ruts and grooves). The Continental SportContact 6 OE tires are particularly wear-prone. Replacement tire costs are $350-$500+ per tire for the required sizes.",
    symptoms: [
      "Rear tires wearing to tread indicators in 8,000-15,000 miles",
      "Uneven tire wear patterns (inside or outside edge)",
      "Vehicle pulls or drifts on highway (tramline effect)",
      "Increased road noise as tires wear",
      "Vibration at highway speeds from uneven wear",
      "Tire pressure monitoring warnings from wear"
    ],
    solution: "Rotate front-to-back every 3,000-5,000 miles (only possible if sizes permit, which staggered setups often do not). Check alignment every 5,000 miles or after any pothole impact - even 0.1 degree of toe deviation causes rapid edge wear on these wide tires. Consider switching to Michelin Pilot Sport 4S or Pirelli P Zero PZ4 for improved tread life over the OE Continental SportContact 6. Budget $1,400-$2,000 for a set of four replacement tires. Aggressive driving with launch control dramatically reduces tire life. For better longevity, use Comfort mode instead of Dynamic for daily driving.",
    estimatedCost: {
      low: 1400,
      high: 2000
    },
    communityRecommendations: [
      {
        type: "tip",
        content: "Get an alignment check immediately after purchase and after every pothole strike. Alignment on these 21-inch wheels is critical - even tiny deviations destroy $400 tires in weeks.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "Michelin Pilot Sport 4S offers better tread life than the OE Continental SportContact 6 while maintaining comparable grip. Available in both front and rear staggered sizes.",
        partBrand: "Michelin",
        partName: "Pilot Sport 4S (305/30R21 rear)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Budget $2,000-$4,000/year for tires. This is a 637 hp, 5,100 lb vehicle on 21-inch wheels with instant torque - tire wear is the cost of performance ownership.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "tires",
    dtcCodes: []
  }
];

// Add all new issues
data.issues.push(...newIssues);

// Write back
fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));

console.log(`Added ${newIssues.length} new issues for Audi EV and SQ models`);
console.log('Models covered:');
const models = [...new Set(newIssues.map(i => i.model))];
models.forEach(m => {
  const count = newIssues.filter(i => i.model === m).length;
  console.log(`  - ${m}: ${count} issues`);
});
console.log(`\nTotal issues in database: ${data.issues.length}`);
