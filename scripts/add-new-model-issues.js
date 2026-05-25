const fs = require('fs');
const path = require('path');

// ============================================================
// NEW KNOWN ISSUES FOR 9 MODELS
// ============================================================

const newIssues = [
  // ============================================================
  // 1. JEEP AVENGER (2023-2024) - 1.2L Turbo I3
  // ============================================================
  {
    id: "jeep-avenger-start-stop-malfunction-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "Jeep",
      model: "Avenger",
      engines: ["1.2L Turbo I3"]
    },
    category: "electrical",
    title: "Start-Stop System Malfunction and Engine Stalling",
    description: "The Jeep Avenger's 1.2L mild hybrid powertrain experiences frequent Start & Stop system malfunctions. The system may fail to restart the engine properly, cause delayed or sluggish restarts, or stall the engine entirely during stop-and-go driving. The issue is linked to the mild hybrid system's integration with the 48V electrical architecture and MCU software calibration.",
    solution: "Visit a Jeep dealer for an MCU (Motor Control Unit) software update that recalibrates the Start & Stop system behavior. The dealer will check error logs and reflash the MCU with updated firmware. If the issue persists after the software update, the 48V battery or belt-starter-generator (BSG) may need inspection or replacement.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Engine fails to restart after automatic stop at traffic lights",
      "Delayed or slow engine restart when releasing brake pedal",
      "Random engine stalling while driving at low speeds",
      "Start & Stop warning light illuminated on dashboard",
      "Jerky transitions between electric assist and engine power"
    ],
    estimatedCost: { low: 0, high: 300 },
    citations: [
      {
        type: "owner-report",
        title: "Jeep Avenger Start & Stop System Malfunction — AUTODOC",
        url: "https://www.autodoc.co.uk/info/problems-with-the-jeep-avenger"
      },
      {
        type: "owner-report",
        title: "Jeep Avenger Breakdown Issues — Jeep Avenger Forum",
        url: "https://jeepavengerforum.com/threads/avenger-breakdown-issues.11/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Request an MCU software update at your first dealer visit — many stalling and Start & Stop issues are resolved by a firmware reflash alone.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If the Start & Stop system is acting erratically, you can manually disable it each drive by pressing the Start & Stop button on the console until a permanent software fix is applied.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 85,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0606", "P1A0F"]
  },
  {
    id: "jeep-avenger-adas-camera-failure-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "Jeep",
      model: "Avenger"
    },
    category: "electrical",
    title: "ADAS Front Camera Hardware Fault Disabling Safety Systems",
    description: "Certain Jeep Avenger vehicles were equipped with a front camera containing an incorrect hardware level ID, causing an internal error code that keeps the Advanced Driver Assistance System (ADAS) permanently inactive. This disables Automatic Emergency Braking (AEB) and Lane Keep Assist (LKA) simultaneously, leaving the vehicle without critical active safety features. Stellantis issued a recall to address the faulty camera hardware.",
    solution: "Contact a Jeep dealer to have the front camera module replaced under the manufacturer recall. The dealer will install a camera with the correct hardware ID and verify that AEB and LKA functions are fully operational. This repair is performed at no cost under the recall campaign.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "ADAS warning lights illuminated on dashboard",
      "Lane Keep Assist not functioning or unavailable",
      "Automatic Emergency Braking system disabled",
      "Forward collision warning not activating",
      "Error message related to camera or driver assistance system"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "Jeep Avenger ADAS Camera Recall — What Car? Reliability Review",
        url: "https://www.whatcar.com/jeep/avenger/hatchback/used-review/n27887/reliability"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Check your VIN on the NHTSA website or Stellantis recall portal to confirm whether your Avenger is affected by this camera recall before visiting the dealer.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 120,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["U0428"]
  },
  {
    id: "jeep-avenger-steering-rack-defect-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "Jeep",
      model: "Avenger"
    },
    category: "steering",
    title: "Steering Rack Out of Specification Causing Handling Issues",
    description: "Some Jeep Avenger vehicles were fitted with a steering rack that does not conform to manufacturer specifications. The defective rack can cause vague or inconsistent steering feel, pulling to one side, and in severe cases, reduced steering control. Stellantis issued a recall to inspect and replace affected steering racks.",
    solution: "Visit a Jeep dealer for a steering rack inspection under the recall campaign. If the rack is found to be out of specification, it will be replaced at no cost. Do not ignore any changes in steering feel, as the issue can worsen over time.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Steering feels vague or loose at center position",
      "Vehicle pulls to one side during straight-line driving",
      "Uneven steering response when turning left vs. right",
      "Clunking or clicking noise from steering column area",
      "Increased steering effort at low speeds"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "Jeep Avenger Steering Rack Recall — What Car? Used Review",
        url: "https://www.whatcar.com/jeep/avenger/hatchback/used-review/n27887/reliability"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Even if you have not received a recall notice, have the dealer inspect the steering rack if your Avenger exhibits any pulling or vague steering — early detection prevents further wear on tires and suspension components.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 95,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 2. KIA CARNIVAL (2022-2024) - 3.5L V6
  // ============================================================
  {
    id: "kia-carnival-sliding-door-auto-reverse-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "Kia",
      model: "Carnival",
      engines: ["3.5L V6"]
    },
    category: "body",
    title: "Power Sliding Door Auto-Reverse Failure Causing Injuries",
    description: "The power sliding rear doors on the Kia Carnival may fail to auto-reverse when contacting an obstruction such as a person, child, or pet. The pinch sensors along the door edge require excessive force to trigger, allowing the door to continue closing on an occupant before finally reversing. Kia recalled 51,568 units (2022-2023 models built between Jan 2021 and Feb 2023) under NHTSA campaign 23V-179, and at least 9 injuries were confirmed including one broken arm and a fractured thumb. A class-action lawsuit alleges the recall fix was insufficient.",
    solution: "Visit a Kia dealer for the recall software update (NHTSA 23V-179) that adds warning chimes and slows the door closing speed near the fully closed position. If the issue persists after the update, request the dealer inspect and recalibrate the pinch sensor strips along the door edges. Document any continued incidents carefully for warranty or legal claims.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Power sliding door does not reverse when contacting a person or object",
      "Door closes with excessive force before finally reversing",
      "No warning chime when door is closing on an obstruction",
      "Door pinch sensor appears unresponsive or delayed",
      "Bruising, cuts, or injuries from door closing on occupants"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "NHTSA Recall 23V-179 — Kia Carnival Power Sliding Door",
        url: "https://www.nhtsa.gov/vehicle/2023/KIA/CARNIVAL/MV/FWD"
      },
      {
        type: "investigation",
        title: "NHTSA Investigation PE22004 — Carnival PSD Auto-Reverse",
        url: "https://www.nhtsa.gov/search-safety-issues"
      },
      {
        type: "owner-report",
        title: "Kia Carnival Sliding Door Sensor Lawsuit — CarComplaints",
        url: "https://www.carcomplaints.com/news/2024/kia-carnival-sliding-door-sensor-lawsuit-recall.shtml"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "Even after the recall software update, supervise children closely around the sliding doors — the class action alleges the fix does not fully resolve the pinch sensor sensitivity issue.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Keep a written record of any incidents where the door fails to auto-reverse, including dates, photos of injuries, and dealer visit records — this documentation is critical if you need to file a warranty or legal claim.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "kia-carnival-tow-hitch-fire-risk-2022",
    vehicleMatch: {
      years: [2022, 2023],
      make: "Kia",
      model: "Carnival"
    },
    category: "electrical",
    title: "Tow Hitch Harness Water Intrusion Causing Fire Risk",
    description: "Kia issued recall campaign 23V-179 for certain 2022-2023 Carnival vehicles equipped with a tow hitch. Water can accumulate on the tow hitch harness printed circuit board, causing an electrical short that may lead to a fire. The fire can start even when the vehicle is parked and the engine is off. Kia notified owners to disconnect the tow hitch wiring harness until the recall repair can be performed.",
    solution: "Contact a Kia dealer immediately to have the tow hitch wiring harness inspected and repaired under the recall. If you have a tow hitch installed, disconnect the harness connector as a precaution until the dealer can perform the repair. The dealer will install a water-resistant seal or replace the harness circuit board at no cost.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Burning smell near rear of vehicle around tow hitch area",
      "Visible corrosion or water damage on tow hitch wiring harness",
      "Melted or discolored plastic around tow hitch connector",
      "Electrical shorts or blown fuses related to trailer wiring",
      "Smoke or fire originating from rear bumper area near hitch"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "Kia Carnival Tow Hitch Fire Risk Recall — Motor1",
        url: "https://www.motor1.com/news/661353/kia-carnival-recalled-because-sliding-doors-close-on-people/"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "If your Carnival has a factory or dealer-installed tow hitch, disconnect the wiring harness immediately and schedule the recall repair — fire risk exists even while parked.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 60,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "kia-carnival-windshield-cracking-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "Kia",
      model: "Carnival"
    },
    category: "body",
    title: "Spontaneous Windshield Cracking Without Impact",
    description: "Numerous Kia Carnival owners report windshields cracking spontaneously without any visible impact from road debris. Cracks often appear near the base of the windshield or along the edges and spread rapidly across the entire glass. NHTSA received at least 14 complaints for the 2022 model year alone. Owners have reported difficulty obtaining replacement windshields due to stock shortages at dealerships, and Kia has generally denied warranty coverage claiming the cracks are from impact damage.",
    solution: "Document the crack immediately with photos and note the location where it originates — spontaneous cracks typically start from the edge or base rather than a central impact point. File an NHTSA complaint to build the case record. Contact Kia customer service to request goodwill coverage. If denied, consider having an independent glass specialist assess whether the crack pattern is consistent with a manufacturing stress defect rather than impact.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Windshield crack appearing with no visible impact point",
      "Crack originating from edge or base of windshield",
      "Crack spreading rapidly across windshield within hours or days",
      "Cracking occurring during temperature changes or parked overnight",
      "Multiple cracks appearing in the same general area"
    ],
    estimatedCost: { low: 300, high: 800 },
    citations: [
      {
        type: "nhtsa",
        title: "Kia Carnival Windshield Cracking Complaints — Lemberg Law",
        url: "https://lemberglaw.com/kia-carnival-telluride-windshield-cracking-problems/"
      },
      {
        type: "owner-report",
        title: "2022 Kia Carnival Problems — Lemberg Law",
        url: "https://lemberglaw.com/2022-kia-carnival-problems-complaints-lemon/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If your windshield cracks spontaneously, photograph it immediately from multiple angles before it spreads — focus on the origination point to prove there is no rock chip impact mark. This evidence is critical for warranty claims.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "File an NHTSA complaint even if Kia denies your claim — the more complaints on record, the more likely NHTSA will open a formal investigation that could result in a recall or extended warranty.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 75,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "kia-carnival-infotainment-connectivity-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "Kia",
      model: "Carnival"
    },
    category: "electrical",
    title: "Infotainment System Freezing and Phone Projection Failures",
    description: "Kia Carnival vehicles equipped with Display Audio 2.0 and 5th Generation AVN Wide head units experience frequent infotainment issues including frozen screens, black screens, and intermittent Apple CarPlay and Android Auto connectivity failures. The system may disconnect during phone calls, navigation, or music playback. Kia issued a service action to update the head unit software to improve connectivity and system stability.",
    solution: "Visit a Kia dealer and request the latest infotainment software update under the applicable service action. The dealer will update the head unit firmware at no cost. If the issue persists after the update, request a head unit hardware replacement under warranty. As a temporary workaround, use a wired USB connection instead of wireless phone projection for more reliable connectivity.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Infotainment screen freezing or going black during use",
      "Apple CarPlay or Android Auto disconnecting randomly",
      "Phone projection failing to connect on startup",
      "Audio cutting out mid-playback or during calls",
      "Navigation freezing or displaying incorrect position"
    ],
    estimatedCost: { low: 0, high: 200 },
    citations: [
      {
        type: "tsb",
        title: "Kia Service Action — Display Audio Connectivity Update",
        url: "https://static.nhtsa.gov/odi/tsbs/2024/MC-10253811-0001.pdf"
      },
      {
        type: "owner-report",
        title: "2023 Kia Carnival Problems — Lemon Law Experts",
        url: "https://lemonlawexperts.com/2023-kia-carnival-problems/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Switching from wireless to wired CarPlay/Android Auto (USB-C or Lightning cable directly to the USB port) dramatically improves connection reliability on affected head units.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 110,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 3. KIA EV9 (2024) - Electric
  // ============================================================
  {
    id: "kia-ev9-iccu-failure-2024",
    vehicleMatch: {
      years: [2024],
      make: "Kia",
      model: "EV9"
    },
    category: "electrical",
    title: "ICCU Failure Causing 12V Battery Drain and Loss of Drive Power",
    description: "The Integrated Charging Control Unit (ICCU) on the Kia EV9 can fail due to a MOSFET transistor defect, blowing an internal fuse and preventing the high-voltage battery from charging the 12V auxiliary battery. When the 12V battery drains, the vehicle can suddenly lose drive power and speed while driving — a critical safety hazard. The failure has two root causes: overvoltage at the start and end of the 12V charging cycle, and thermal overloading during driving or charging. Kia issued NHTSA recall 24V200000, but owners report multiple ICCU replacements on the same vehicle, and parts availability can cause weeks-long wait times.",
    solution: "Contact a Kia dealer immediately for the ICCU software update under NHTSA recall 24V200000. The dealer will update the ICCU software and, if needed, replace the ICCU assembly and fuse at no cost. If you experience a sudden loss of power while driving, pull over safely and call roadside assistance — do not attempt to restart and drive. Monitor the 12V battery voltage regularly through the vehicle's diagnostic screen.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Vehicle suddenly loses drive power while driving",
      "12V battery dead or unable to start vehicle electronics",
      "Charging session fails or stops unexpectedly",
      "Multiple warning lights illuminating simultaneously",
      "Battery management system (BMS) error messages on dashboard"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "NHTSA Recall 24V200000 — Kia EV9 ICCU Failure",
        url: "https://www.nhtsa.gov/vehicle/2024/KIA/EV9/SUV/AWD"
      },
      {
        type: "investigation",
        title: "Hyundai/Kia ICCU Failure Analysis — Consumer Reports",
        url: "https://www.consumerreports.org/cars/car-recalls-defects/hyundai-ioniq-kia-iccu-failure-tesla-a3038878758/"
      },
      {
        type: "owner-report",
        title: "KIA EV9 ICCU Recall Discussion — Kia EV Forum",
        url: "https://www.kiaevforums.com/threads/nhtsa-campaign-number-24v200000-iccu-recall.11123/"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "Get the ICCU software update done as soon as possible — even if you have not experienced symptoms yet, the ICCU can overheat and sustain permanent damage before symptoms appear, at which point only a full hardware replacement will fix it.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If your 12V battery dies more than once, insist on a full ICCU hardware replacement rather than just the software update — Consumer Reports data shows software-only fixes do not always resolve the underlying transistor defect.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "kia-ev9-instrument-panel-blank-2024",
    vehicleMatch: {
      years: [2024],
      make: "Kia",
      model: "EV9"
    },
    category: "electrical",
    title: "Instrument Panel Screen Goes Blank Due to Software Error",
    description: "A software error in the Kia EV9 can cause the driver's instrument panel screen to display a blank/black screen on startup, hiding the speedometer, warning lights, gear indicator, and other critical driving information. Kia issued NHTSA Recall 24V757, but some owners report the issue recurring even after the software update was applied. Driving without instrument cluster information increases the risk of a crash.",
    solution: "Visit a Kia dealer for the instrument panel software update under NHTSA Recall 24V757. If the blank screen issue recurs after the update, return to the dealer for a secondary software patch or instrument cluster hardware replacement. As a temporary measure, use the head-up display (if equipped) for speedometer readings when the cluster is blank.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Instrument panel screen blank or black on vehicle startup",
      "Speedometer display not visible while driving",
      "Warning lights and gear indicator not showing",
      "Instrument cluster flickering or intermittently cutting out",
      "Head-up display working normally while instrument panel is blank"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "NHTSA Recall 24V757 — Kia EV9 Instrument Panel Failure",
        url: "https://www.nhtsa.gov/vehicle/2024/KIA/EV9/SUV/AWD"
      },
      {
        type: "owner-report",
        title: "KIA EV9 Electrical System Complaints — CarComplaints",
        url: "https://www.carcomplaints.com/Kia/EV9/2024/electrical/electrical_system.shtml"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If your instrument panel goes blank while driving, do not panic — pull over safely and try cycling the vehicle off and on (press the power button twice). This often restores the display temporarily until the permanent software fix is applied.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 130,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "kia-ev9-wiper-failure-snow-2024",
    vehicleMatch: {
      years: [2024],
      make: "Kia",
      model: "EV9"
    },
    category: "electrical",
    title: "Windshield Wipers Stopping During Snow and Ice Conditions",
    description: "NHTSA has opened a preliminary evaluation into 2024-2025 Kia EV9 models where the windshield wipers may stop operating while driving when snow or ice accumulates at the bottom of the windshield. The wiper motor appears to shut down when encountering resistance from ice buildup, leaving the driver without visibility in winter conditions. The issue may be related to the wiper motor's overcurrent protection being too sensitive.",
    solution: "If wipers stop during winter driving, pull over safely and manually clear ice and snow buildup from the base of the windshield and wiper arms before restarting the wipers. Contact a Kia dealer about any applicable software update for the wiper motor controller. Use the windshield defroster on high before activating wipers in heavy snow or ice conditions.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Windshield wipers stop mid-stroke during snow or freezing rain",
      "Wiper motor makes no sound when activated in cold conditions",
      "Wipers work normally in rain but fail in snow or ice",
      "Wipers resume working after manually clearing ice from windshield base",
      "Wiper system warning or fault message on dashboard"
    ],
    estimatedCost: { low: 0, high: 400 },
    citations: [
      {
        type: "investigation",
        title: "NHTSA Investigation — Kia EV9 Windshield Wiper Failure",
        url: "https://www.autoevolution.com/news/nhtsa-investigates-kia-ev9-over-allegedly-inoperative-windshield-wipers-250867.html"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Before driving in winter, run the defroster on maximum for 5-10 minutes and manually clear all ice from the windshield wiper rest area. This prevents the ice buildup that triggers the wiper motor shutdown.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 55,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 4. MAZDA MX-30 (2022-2023) - Electric/PHEV
  // ============================================================
  {
    id: "mazda-mx30-12v-battery-drain-2022",
    vehicleMatch: {
      years: [2022, 2023],
      make: "Mazda",
      model: "MX-30"
    },
    category: "electrical",
    title: "12V Battery Drain from ECU Not Entering Sleep Mode",
    description: "The Mazda MX-30's ECU may fail to enter sleep mode after the ignition is turned off, causing a parasitic electrical current that drains the 12V auxiliary battery. This can leave the vehicle unable to start or activate its electronics. Mazda issued service campaign AM035A to address the software bug. A separate issue affects the Remote Tuner module in vehicles built from late July 2022 onward, which also contributes to battery drain.",
    solution: "Visit a Mazda dealer for the service campaign AM035A software update that corrects the ECU sleep mode behavior. For vehicles built after July 2022, an additional software file reload for the Remote Tuner module may be applied via USB flash drive. If the 12V battery has been deeply discharged multiple times, it may need replacement as repeated deep discharge damages lead-acid batteries.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle will not start or power on after sitting overnight",
      "12V battery repeatedly going dead within days of charging",
      "Dashboard electronics unresponsive when pressing start button",
      "Jump starting required frequently",
      "12V battery replacement needed within first year of ownership"
    ],
    estimatedCost: { low: 0, high: 250 },
    citations: [
      {
        type: "tsb",
        title: "Mazda Service Campaign AM035A — 12V Battery Drain",
        url: "https://www.mx30forum.com/threads/12v-battery-recall-for-software-update.306/"
      },
      {
        type: "owner-report",
        title: "MX-30 Battery Drain Special Service Program — MX-30 Forum",
        url: "https://www.mx30forum.com/threads/battery-drain-issue-special-service-program-new.672/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If you are waiting for the dealer appointment, consider using a battery maintainer/trickle charger on the 12V battery overnight to prevent it from draining completely — repeated deep discharge will kill the battery permanently.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 80,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "mazda-mx30-dc-charging-speed-2022",
    vehicleMatch: {
      years: [2022, 2023],
      make: "Mazda",
      model: "MX-30"
    },
    category: "electrical",
    title: "Slow DC Fast Charging Speed Limited to 40-50 kW",
    description: "The Mazda MX-30's DC fast charging capability is significantly slower than competitors, initially capped at 40 kW and later improved to 50 kW via a technical update. Combined with the small 35.5 kWh battery and approximately 100-mile EPA range, the slow charging speed makes long-distance travel impractical. In cold weather, charging speed drops further and usable range can fall to 70-80 miles. Mazda released a software update to improve charging performance by approximately 20%.",
    solution: "Visit a Mazda dealer for the DC charging speed improvement software update that raises the maximum charging rate from 40 kW to 50 kW and reduces rapid charging time by about 10 minutes. Plan trips carefully within the vehicle's range limitations. Pre-condition the battery by driving for 15-20 minutes before arriving at a DC fast charger in cold weather to warm the battery and improve charging speed.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "DC fast charging sessions maxing out at 40 kW despite charger supporting higher rates",
      "Charging to 80% taking 35+ minutes at DC fast chargers",
      "Charging speed dropping significantly in cold weather below 40°F",
      "Range display showing 70-80 miles on full charge in winter",
      "Charging errors or session interruptions at some DC fast chargers"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "owner-report",
        title: "MX-30 Cold Battery and Charging Issues — MX-30 Forum",
        url: "https://www.mx30forum.com/threads/cold-battery-issues-on-mx30.79/"
      },
      {
        type: "owner-report",
        title: "Mazda MX-30 Common Problems — Recharged",
        url: "https://recharged.com/articles/mazda-mx-30-common-problems-and-fixes/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "The MX-30 works best as a daily commuter for trips under 80 miles. For longer trips, plan charging stops in advance and add 30% buffer to the displayed range in cold weather.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 90,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "mazda-mx30-freestyle-door-access-2022",
    vehicleMatch: {
      years: [2022, 2023],
      make: "Mazda",
      model: "MX-30"
    },
    category: "body",
    title: "Freestyle Rear Doors Impractical and Prone to Alignment Issues",
    description: "The MX-30's signature rear-hinged 'freestyle' doors require the front doors to be opened first before the rear doors can open, making rear seat access inconvenient in tight parking spaces. The complex dual-hinge mechanism can develop alignment issues over time, causing the doors to not latch properly or require extra force to close. The rear door check straps and hinges experience accelerated wear due to the unconventional design.",
    solution: "If rear doors are not latching properly, have a dealer adjust the door striker plate and hinge alignment. Lubricate the hinge pins and check straps every 15,000 miles with white lithium grease. If the door check strap fails, it must be replaced as a unit — aftermarket options are not available and the dealer part costs $150-300 per side.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Rear doors require excessive force to close or latch",
      "Rear door not sitting flush with body panel when closed",
      "Clicking or popping noise from rear door hinge area",
      "Rear door check strap not holding door open properly",
      "Wind noise from rear door seal area at highway speeds"
    ],
    estimatedCost: { low: 100, high: 400 },
    citations: [
      {
        type: "owner-report",
        title: "MX-30 Reliability and Issues — MX-30 Forum",
        url: "https://www.mx30forum.com/threads/mx30-how-reliable-is-it.951/"
      },
      {
        type: "owner-report",
        title: "Lots of Issues with Brand New MX-30 — MX-30 Forum",
        url: "https://www.mx30forum.com/threads/lots-of-issues-with-brand-new-mx30.770/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "When parking in tight spaces, back into the spot so the front doors have room to open first — this makes rear seat access much easier than trying to open both doors toward the adjacent car.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 45,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 5. MAZDA CX-60 (2022-2024) - Diesel/PHEV
  // ============================================================
  {
    id: "mazda-cx60-phev-transmission-jerk-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "Mazda",
      model: "CX-60",
      engines: ["2.5L PHEV"]
    },
    category: "transmission",
    title: "PHEV 8-Speed Transmission Surging, Jerking, and Gear Confusion",
    description: "The Mazda CX-60 PHEV's 8-speed automatic transmission exhibits harsh jerking, surging, and gear hunting behavior, particularly during low-speed driving, hill climbing, and transitions between electric and combustion power. The transmission appears confused during the handoff between the electric motor and the 2.5L inline-four engine, causing lurching when the driver eases off the throttle uphill. Mazda issued recall AR058A addressing PCM, BECM, TCM, and DASH-ESU software updates to improve powertrain coordination.",
    solution: "Visit a Mazda dealer for the recall AR058A software update that updates the Powertrain Control Module (PCM), Battery Energy Control Module (BECM), Transmission Control Module (TCM), and Dashboard Power Supply Unit (DASH-ESU) to the latest calibration. Many owners report significant improvement in shifting smoothness and reduced jerking after the update. If issues persist, request a transmission fluid change and TCM adaptation reset.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Harsh jerking or lurching during low-speed driving",
      "Vehicle surges forward when easing off throttle on inclines",
      "Transmission hunting between gears during steady-speed driving",
      "Rough transitions between electric motor and combustion engine",
      "Clunk or shudder when shifting from Park to Drive or Reverse"
    ],
    estimatedCost: { low: 0, high: 300 },
    citations: [
      {
        type: "recall",
        title: "Mazda Recall AR058A — CX-60 PHEV Software Update",
        url: "https://www.cx70forum.com/threads/ar058a-recall-cx60-phev.817/"
      },
      {
        type: "owner-report",
        title: "CX-60 PHEV Transmission Issues — CX-70 Forum",
        url: "https://www.cx70forum.com/threads/cx-60-problems.33/page-93"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "After the recall software update, perform a TCM adaptation reset by driving normally for 50-100 miles — the transmission needs to relearn your driving style with the new calibration for optimal shift quality.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "In hilly terrain, switch to Sport mode to give the transmission more aggressive shift logic and reduce the hunting behavior between gears.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0700", "P0730"]
  },
  {
    id: "mazda-cx60-diesel-clunk-vibration-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "Mazda",
      model: "CX-60",
      engines: ["3.3L Skyactiv-D Diesel"]
    },
    category: "engine",
    title: "3.3L Diesel Engine Clunk/Bang Sound and High-Speed Vibration",
    description: "The Mazda CX-60 3.3L Skyactiv-D diesel produces a prominent clunk or bang sound during normal operation that Mazda UK has stated is 'as designed' and present in all diesel variants. Additionally, owners report increasingly uncomfortable vibrations through the accelerator pedal and cabin at speeds above 120 km/h (75 mph) that worsen with speed. Mazda Australia recalled 860 diesel CX-60 and CX-90 units for a transmission-related fix, suggesting the vibration may be linked to the 8-speed automatic's torque converter calibration.",
    solution: "For the clunk sound, Mazda considers this normal diesel engine behavior — no fix is available. For high-speed vibrations, visit a dealer to have the transmission software updated and request a driveshaft and wheel balance inspection. If vibrations persist above 120 km/h, have the dealer check for TSBs related to torque converter shudder. Tire balance and alignment should be ruled out first as they can mimic the symptom.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Loud clunk or bang sound from engine bay during acceleration",
      "Vibration through accelerator pedal increasing with speed above 75 mph",
      "Uncomfortable cabin vibration at highway speeds",
      "Gearbox jerking during gear changes especially at low speeds",
      "Rough idle compared to other modern diesel SUVs"
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      {
        type: "owner-report",
        title: "CX-60 3.3 Diesel Vibration Problems — CX-70 Forum",
        url: "https://www.cx70forum.com/threads/mazda-cx-60-3-3-diesel-vibration-problems.202/"
      },
      {
        type: "owner-report",
        title: "CX-60 Problems Thread — CX-70 Forum",
        url: "https://www.cx70forum.com/threads/cx-60-problems.33/page-93"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Before accepting 'it's normal' from the dealer, ask to test drive another CX-60 diesel on the lot — quality control varies widely between individual units, and comparing yours to another can confirm whether your car has an abnormal issue.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 140,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "mazda-cx60-phev-ev-range-accuracy-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "Mazda",
      model: "CX-60",
      engines: ["2.5L PHEV"]
    },
    category: "electrical",
    title: "PHEV Battery Range Overestimation and Unwanted Engine Start",
    description: "The CX-60 PHEV's 17.8 kWh battery frequently shows inaccurate EV range estimates, sometimes displaying as low as 21 miles on a full charge (vs. the rated 39 miles). The vehicle may also unexpectedly cancel EV mode and start the combustion engine with half a battery charge remaining. The issue appears related to the Battery Energy Control Module's (BECM) state-of-charge algorithm and its conservative thermal management strategy in cold weather.",
    solution: "Have the dealer apply the latest BECM software update under recall AR058A, which recalibrates the state-of-charge estimation algorithm. Pre-condition the battery by plugging in for at least 2 hours before departure in cold weather. If EV range is consistently below 25 miles on a full charge in mild conditions, request a battery health diagnostic to rule out cell degradation.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "EV range showing far below rated 39 miles on full charge",
      "Engine starting unexpectedly while battery shows 30-50% charge",
      "EV mode canceling itself during steady low-speed driving",
      "Range estimate fluctuating wildly between drives",
      "Battery appearing to lose significant charge overnight while plugged in"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "owner-report",
        title: "CX-60 PHEV First Service Issues — CX-70 Forum",
        url: "https://www.cx70forum.com/threads/cx-60-phev-first-service-issues.431/"
      },
      {
        type: "owner-report",
        title: "Living with a Mazda CX-60 PHEV — EVs Unplugged",
        url: "https://evs-unplugged.com/mazda-cx60-phev-long-term-test/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Pre-conditioning the cabin while still plugged in (using the climate timer) draws heating energy from the wall outlet instead of the battery, preserving 5-8 miles of EV range in winter.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 100,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 6. MAZDA SPEED3/MAZDASPEED3 (2007-2013) - 2.3L DISI Turbo
  // ============================================================
  {
    id: "mazda-speed3-vvt-timing-chain-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
      make: "Mazda",
      model: "Mazdaspeed3",
      engines: ["2.3L DISI Turbo"]
    },
    category: "engine",
    title: "VVT Actuator Failure and Timing Chain Stretch",
    description: "The 2.3L DISI turbo engine's Variable Valve Timing (VVT) actuator has a known design weakness where an internal pin can come loose, causing the timing chain to slack. This leads to timing chain rattle, oil leaks, excessive exhaust smoke, and potentially catastrophic engine failure if the chain jumps timing. Mazda issued a Special Service Program (SSP) extending warranty coverage for VVT noise and timing chain issues on 2007-2010 models with the L3T engine. Mazda also released a revised VVT actuator design to address the failure.",
    solution: "Have the VVT actuator inspected at every oil change — listen for a rattle on cold start that goes away after 10-30 seconds. If rattling is present, replace the VVT actuator with Mazda's revised OEM part (updated design with stronger pin retention). Replace the timing chain, tensioner, and guides at the same time if any slack is detected. The job costs $800-1500 at an independent shop. Check if your vehicle is still covered under Mazda's extended SSP warranty (7 years/70,000 miles from original in-service date).",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Rattling or chattering noise on cold start that subsides after warm-up",
      "Check engine light with VVT-related codes (P0014, P0012)",
      "Excessive blue or white smoke from exhaust at idle",
      "Oil leaking from front of engine near VVT actuator",
      "Engine misfires or rough running at idle"
    ],
    estimatedCost: { low: 800, high: 1500 },
    citations: [
      {
        type: "tsb",
        title: "Mazda Special Service Program — VVT/Timing Chain (2007-2010 Mazdaspeed3)",
        url: "https://www.mazdaproblems.com/vvt/"
      },
      {
        type: "owner-report",
        title: "Mazdaspeed3 VVT Timing Chain Discussion — Mazda3 Forums",
        url: "https://www.mazda3forums.com/threads/07-mazdaspeed-3-vvt-timing-chain-tensioner-belt.727433/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Use the CorkSport VVT and Timing Tool Kit when doing this job — it makes cam and crank alignment much easier and prevents costly timing errors during reassembly.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Always replace the VVT actuator with Mazda's latest revised OEM part number, not the original design. The revised actuator has a stronger internal pin that resists the failure mode.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 320,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0014", "P0012", "P0011"]
  },
  {
    id: "mazda-speed3-motor-mount-failure-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
      make: "Mazda",
      model: "Mazdaspeed3",
      engines: ["2.3L DISI Turbo"]
    },
    category: "engine",
    title: "Passenger Side Motor Mount Premature Failure",
    description: "The Mazdaspeed3's passenger side motor mount is notoriously weak for the torque output of the 2.3L turbo engine. The factory rubber mount tears and collapses prematurely, sometimes within 30,000-50,000 miles. When the mount fails, the engine shifts excessively during acceleration and deceleration, causing harsh jolts through the drivetrain, damaged axle boots, and in severe cases, broken mount bolts. The 2007-2009 models are the worst affected.",
    solution: "Replace the failed motor mount with an upgraded aftermarket unit from manufacturers like Corksport, Damond Motorsports, or similar — these use stiffer polyurethane or solid inserts that handle the turbo engine's torque without tearing. Budget $200-400 for parts and $150-250 for labor. Inspect all three motor mounts at the same time, as the other mounts compensate when one fails and may also be weakened.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Harsh clunk or jolt when accelerating from a stop",
      "Excessive engine movement visible when revving in Park",
      "Vibration through the steering wheel and shifter at idle",
      "Drivetrain shudder or binding during hard acceleration",
      "Torn or separated rubber visible on the passenger side motor mount"
    ],
    estimatedCost: { low: 200, high: 500 },
    citations: [
      {
        type: "owner-report",
        title: "Passenger Side Motor Mount Bolts Broke — Mazda3 Forums",
        url: "https://www.mazda3forums.com/threads/passenger-side-motor-mount-bolts-broke.391765/"
      },
      {
        type: "owner-report",
        title: "Mazdaspeed Motor Mount Discussion — Mazdaspeeds.org",
        url: "https://mazdaspeeds.org/index.php"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "The CorkSport Stage 2 motor mount is the most popular upgrade — it significantly reduces wheel hop and drivetrain shock while adding only a small amount of NVH (noise/vibration/harshness) compared to stock.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Check the motor mount every oil change by having someone rev the engine in Drive with the brake held while you watch from outside — excessive engine rocking means the mount is failing.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "mazda-speed3-turbo-failure-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
      make: "Mazda",
      model: "Mazdaspeed3",
      engines: ["2.3L DISI Turbo"]
    },
    category: "engine",
    title: "K04 Turbocharger Failure and Boost Leaks",
    description: "The Mazdaspeed3's K04 turbocharger has a high failure rate, estimated at 30% or more among forum users, especially on modified vehicles. Turbo failures can be catastrophic, with turbine fragments entering the engine and destroying the block. The turbo oil feed line is also a known failure point — the O-ring gasket behind a crimp connection deteriorates from heat exposure, causing oil leaks that are both a fire hazard and turbo oil starvation risk. Additionally, boost leaks from aged intercooler piping and cracked vacuum lines are common.",
    solution: "For turbo longevity, always let the engine idle for 60-90 seconds before shutdown to cool the turbo bearings (or install a turbo timer). Replace the turbo oil feed line O-ring proactively at 60,000 miles. Perform a boost leak test with a pressurized adapter at every 30,000-mile interval. If turbo is failing, replace with a new K04 unit ($800-1200) rather than rebuilding. Always downshift before requesting full boost at low RPM — lugging the engine at 2000 RPM in high gear under boost is the primary cause of connecting rod failure.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Loss of boost pressure or sluggish acceleration",
      "Oil smoke from exhaust under boost or at idle",
      "Whining or grinding noise from turbocharger area",
      "Oil leak near turbocharger oil feed line",
      "Boost gauge showing lower than expected readings"
    ],
    estimatedCost: { low: 800, high: 2500 },
    citations: [
      {
        type: "owner-report",
        title: "Bad Turbo Results in New Block — Mazda3 Forums",
        url: "https://www.mazda3forums.com/threads/bad-turbo-results-in-new-block-my-experiences.360007/"
      },
      {
        type: "owner-report",
        title: "Mazdaspeed3 Boost Leak Discussion — Mazda3 Forums",
        url: "https://www.mazda3forums.com/66-mazdaspeed/325865-how-do-i-know-if-i-have-boost-leak.html"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "NEVER go wide-open throttle in 5th or 6th gear below 3000 RPM — the sudden torque load at low RPM under full boost is the #1 cause of thrown connecting rods on the 2.3L DISI turbo. Always downshift first.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Install an aftermarket boost gauge and monitor it regularly. A sudden drop in peak boost by 3+ PSI indicates either a boost leak or early turbo failure — catch it early before debris enters the engine.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0299", "P0234"]
  },

  // ============================================================
  // 7. MAZDA SPEED6/MAZDASPEED6 (2006-2007) - 2.3L DISI Turbo AWD
  // ============================================================
  {
    id: "mazda-speed6-transfer-case-failure-2006",
    vehicleMatch: {
      years: [2006, 2007],
      make: "Mazda",
      model: "Mazdaspeed6",
      engines: ["2.3L DISI Turbo"]
    },
    category: "drivetrain",
    title: "AWD Transfer Case Seal Failure and Internal Destruction",
    description: "The Mazdaspeed6's Volvo-sourced AWD transfer case suffers from chronic seal leaks that allow fluid to slowly seep out. If the seeping goes unnoticed, the transfer case runs dry and destroys itself internally, requiring a complete replacement. Mazda issued a recall for the transfer case on early production models. The transfer case rebuild is prohibitively expensive, and used replacements are scarce due to the limited 2-year production run of the Mazdaspeed6.",
    solution: "Inspect the transfer case for fluid leaks at every oil change by checking the ground beneath the center of the vehicle and the transfer case housing itself. If any seepage is found, have the seals replaced immediately before the unit runs dry ($300-500 for seal replacement). If the transfer case has already been damaged from running dry, a used or rebuilt unit costs $1500-3000 plus $500-800 for labor. Consider installing a magnetic drain plug to catch metal debris early.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Fluid spots on ground beneath center of vehicle",
      "Grinding or whining noise from center of vehicle during acceleration",
      "AWD system warning light on dashboard",
      "Vibration through floor during acceleration, especially in turns",
      "Complete loss of rear-wheel drive (front-wheel-drive only operation)"
    ],
    estimatedCost: { low: 300, high: 3500 },
    citations: [
      {
        type: "recall",
        title: "Mazdaspeed6 Transfer Case Recall — MazdaProblems.com",
        url: "https://www.mazdaproblems.com/models/mazdaspeed6/"
      },
      {
        type: "owner-report",
        title: "Transfer Case Replacement HOW-TO — Mazdaspeeds.org",
        url: "https://www.mazdaspeeds.org/threads/how-to-replace-ms6-transfer-case.9838/"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "Check the transfer case fluid level and look for leaks EVERY oil change — once it runs dry, the damage is done within 500-1000 miles and the entire unit needs replacement. This is the single most critical maintenance item on the Mazdaspeed6.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Join the Mazdaspeeds.org forum and post in the 'WTB' section if you need a replacement transfer case — used units from salvage yards sell out quickly due to the car's rarity.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "mazda-speed6-connecting-rod-failure-2006",
    vehicleMatch: {
      years: [2006, 2007],
      make: "Mazda",
      model: "Mazdaspeed6",
      engines: ["2.3L DISI Turbo"]
    },
    category: "engine",
    title: "Connecting Rod Failure Under Boost at Low RPM",
    description: "The Mazdaspeed6 shares the 2.3L DISI turbo engine with the Mazdaspeed3 but was Mazda's first iteration of this powerplant, resulting in more frequent connecting rod failures. Bone-stock examples throwing a rod is not uncommon. The failure typically occurs when the driver requests full throttle at low RPM (2000 RPM in 5th/6th gear), subjecting the connecting rods to excessive loading. Turbo failures can also send debris into the cylinders, compounding the problem. Injector seal leaks and PCV system failures contribute to overall engine fragility.",
    solution: "Avoid full-throttle acceleration below 3000 RPM — always downshift to keep the engine above 3000 RPM before requesting boost. Install an oil catch can to manage PCV blow-by and keep the intake clean. Replace injector seals proactively at 60,000 miles. If building the engine, upgrade to forged connecting rods and ARP head studs. Monitor oil pressure closely and shut down immediately if pressure drops below 20 PSI at idle.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Sudden loud knocking noise from engine under acceleration",
      "Complete loss of engine power",
      "Large quantity of oil leaking from beneath engine",
      "Metal debris visible in oil during oil change",
      "Increasing rod knock noise at idle that worsens with RPM"
    ],
    estimatedCost: { low: 3000, high: 7000 },
    citations: [
      {
        type: "owner-report",
        title: "Why the Mazdaspeed6 Never Got Love — Grassroots Motorsports",
        url: "https://grassrootsmotorsports.com/forum/grm/why-the-mazdaspeed6-never-got-love/151090/page1/"
      },
      {
        type: "owner-report",
        title: "Common Issues with Mazdaspeed6 — VW Vortex",
        url: "https://forums.vwvortex.com/showthread.php?5168453-Common-issues-with-Mazdaspeed6="
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "If you are buying a used Mazdaspeed6, always do a compression and leak-down test before purchase. These engines can have hidden damage from previous owners who lugged the turbo at low RPM.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Install an oil catch can on the PCV system — this is cheap insurance that keeps carbon buildup off the intake valves and reduces the chance of oil vapor entering the combustion chambers.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 120,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "mazda-speed6-turbo-oil-leak-2006",
    vehicleMatch: {
      years: [2006, 2007],
      make: "Mazda",
      model: "Mazdaspeed6",
      engines: ["2.3L DISI Turbo"]
    },
    category: "engine",
    title: "Turbocharger Oil Feed Line Leak and Turbo Failure",
    description: "The Mazdaspeed6 shares the K04 turbocharger and its associated problems with the Mazdaspeed3. The turbo oil feed line uses an O-ring gasket behind a crimp connection that sits directly against the turbo's hot side. The O-ring degrades from heat exposure, causing oil to leak onto the exhaust manifold — a fire hazard. Turbo failures are accelerated by the oil starvation that follows, and the PCV system contributes additional oil contamination to the turbo bearings. Mazda extended warranty coverage for smoking turbos under a Special Service Program.",
    solution: "Replace the turbo oil feed line O-ring proactively at 50,000 miles or at the first sign of oil seepage. Inspect the turbo return line for restrictions that can cause oil to back up into the turbo. If the turbo is smoking at idle, it may be salvageable with new seals if caught early. Always idle the engine for 60-90 seconds before shutdown to prevent oil coking in the turbo bearings. Check with your dealer about the Special Service Program warranty extension for turbo smoking.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Oil seepage or drips near turbocharger area",
      "Blue or white smoke from exhaust at idle",
      "Burning oil smell from engine bay after driving",
      "Decreasing turbo boost pressure over time",
      "Oil consumption increasing beyond 1 quart per 1000 miles"
    ],
    estimatedCost: { low: 150, high: 2000 },
    citations: [
      {
        type: "tsb",
        title: "Mazda Special Service Program — VVT/Turbo Smoking",
        url: "https://www.mazdaproblems.com/vvt/"
      },
      {
        type: "owner-report",
        title: "Talk Me In or Out of a Mazdaspeed6 — Grassroots Motorsports",
        url: "https://grassrootsmotorsports.com/forum/grm/talk-me-in-or-out-of-a-mazdaspeed-6/97545/page1/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "The turbo oil feed line O-ring replacement is a $20 part and 2-hour job — do it proactively at 50K miles. Waiting until it fails can cause a $2000+ turbo replacement and potential engine fire.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 100,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0299"]
  },

  // ============================================================
  // 8. MINI JOHN COOPER WORKS (2008-2024)
  // ============================================================
  {
    id: "mini-jcw-timing-chain-n14-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012],
      make: "MINI",
      model: "John Cooper Works",
      engines: ["1.6L Turbo N14"]
    },
    category: "engine",
    title: "N14 Timing Chain Tensioner Failure (Death Rattle)",
    description: "The N14 turbocharged engine in early MINI JCW models suffers from a defective timing chain tensioner that allows the chain to develop excessive slack. This produces a loud rattling noise on cold start (known as 'death rattle') that can progress to timing chain skip or breakage, causing catastrophic valve-to-piston contact. BMW settled a $30 million class-action lawsuit and extended timing system coverage to 7 years or 100,000 miles for affected 2007-2010 models. The N14 was replaced by the improved N18 engine starting in 2011.",
    solution: "If you hear a rattle on cold start that lasts more than a few seconds, have the timing chain tensioner inspected immediately. Replace the tensioner, chain, and guides as a complete kit — do not replace the tensioner alone. The repair costs $1500-2500 at an independent MINI specialist (less than dealer pricing). Check if your vehicle is still covered under the extended warranty from the class-action settlement (7 years/100,000 miles from in-service date).",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Loud rattling or chattering noise on cold start (death rattle)",
      "Rattle duration increasing over time from seconds to minutes",
      "Check engine light with timing correlation codes",
      "Engine running rough or misfiring at idle",
      "Sudden catastrophic engine failure if chain skips timing"
    ],
    estimatedCost: { low: 1500, high: 2500 },
    citations: [
      {
        type: "recall",
        title: "BMW $30M Class Action Settlement — MINI N14 Timing Chain",
        url: "https://www.cherishyourcar.com/mini-cooper-timing-chain-recall/"
      },
      {
        type: "owner-report",
        title: "MINI Cooper N14 Timing Chain Issues — MINI2.com",
        url: "https://www.mini2.com/threads/timing-chain-issues.371744/"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "Do NOT ignore the cold-start rattle even if it goes away after warm-up. The tensioner is progressively failing, and once the chain jumps timing, the engine is destroyed. Budget for this repair as preventative maintenance.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Use a MINI specialist or independent BMW shop rather than the dealer — the timing chain job on the N14 is well-documented and specialists charge $1000-1500 less than dealer pricing.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 400,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0016", "P0017", "P0014"]
  },
  {
    id: "mini-jcw-hpfp-n14-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012],
      make: "MINI",
      model: "John Cooper Works",
      engines: ["1.6L Turbo N14"]
    },
    category: "fuel",
    title: "High-Pressure Fuel Pump (HPFP) Premature Failure",
    description: "The N14 engine's high-pressure fuel pump (HPFP) is an extremely common failure point, with failures documented as early as 40,000 miles. The HPFP fails to maintain adequate fuel rail pressure, causing hard starting, extended cranking, stalling, and reduced engine power. MINI issued a service bulletin acknowledging the premature failure. If not addressed, low fuel pressure under boost can cause lean combustion conditions that damage pistons and valves.",
    solution: "Replace the HPFP with the updated design part — MINI revised the pump internals to improve durability. The replacement costs $400-800 for the pump plus $200-400 for labor. When replacing the HPFP, also replace the low-pressure fuel pump relay and inspect the fuel pressure sensor. An aftermarket upgraded HPFP from Autotech or similar can handle the increased fuel demands of a modified JCW.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Extended cranking or multiple attempts needed to start engine",
      "Engine stalling at idle or during low-speed driving",
      "Reduced engine power warning on dashboard",
      "Rough running or misfires under boost",
      "Check engine light with fuel pressure-related codes"
    ],
    estimatedCost: { low: 600, high: 1200 },
    citations: [
      {
        type: "tsb",
        title: "MINI N14 HPFP Service Bulletin — FCP Euro",
        url: "https://www.fcpeuro.com/blog/mini-cooper-n14-high-pressure-fuel-pump-hpfp-symptoms-product-review"
      },
      {
        type: "owner-report",
        title: "N14 Common Issues — North American Motoring",
        url: "https://www.northamericanmotoring.com/forums/2nd-gen-faqs/319387-n14-engine-important-maintenance-items-and-common-issues.html"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If your JCW cranks for more than 3-4 seconds before starting, get the HPFP tested immediately. Driving with a failing pump risks lean-condition damage to the engine under boost that is far more expensive to repair.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0087", "P0191", "P0088"]
  },
  {
    id: "mini-jcw-carbon-buildup-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      make: "MINI",
      model: "John Cooper Works"
    },
    category: "engine",
    title: "Intake Valve Carbon Buildup from Direct Injection",
    description: "All MINI JCW models with direct injection (both N14 and B48 engines) accumulate carbon deposits on the intake valves because fuel is injected directly into the cylinder rather than washing over the valves as in port injection engines. Over 30,000-50,000 miles, carbon buildup restricts airflow, causing rough idle, misfires, reduced power, and poor fuel economy. The N14 engine (2008-2012) is particularly susceptible due to its higher oil consumption contributing additional oil vapor to the intake tract.",
    solution: "Have a walnut shell blasting (media blasting) service performed every 30,000-40,000 miles to remove carbon deposits from the intake valves. This costs $300-600 at a MINI specialist. Installing an oil catch can on the PCV system slows carbon accumulation by preventing oil vapor from reaching the intake valves. For N14 engines with high oil consumption, address the oil consumption issue first to reduce the rate of carbon buildup.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rough or lumpy idle that smooths out at higher RPM",
      "Misfires under load or during cold start",
      "Noticeable loss of power and throttle response",
      "Decreased fuel economy by 2-4 MPG",
      "Check engine light with misfire codes (P0300-P0304)"
    ],
    estimatedCost: { low: 300, high: 600 },
    citations: [
      {
        type: "owner-report",
        title: "Carbon Buildup in MINI Cylinder Head — MINI2.com",
        url: "https://www.mini2.com/threads/carbon-in-mini-cooper-cylinder-head.358622/"
      },
      {
        type: "owner-report",
        title: "N14 vs N18 Engine Comparison — Lohen MINI",
        url: "https://www.lohen.co.uk/blogs/blog/how-do-the-n14-n18-mini-cooper-engines-compare"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Schedule walnut blasting as regular maintenance every 30-40K miles — think of it like a timing belt on older cars. The cost of regular blasting ($400) is far less than the engine damage that severe carbon buildup can cause.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Install an oil catch can on the crankcase ventilation system — this is the single most effective mod for slowing carbon buildup on any direct-injection MINI engine.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304"]
  },
  {
    id: "mini-jcw-water-pump-thermostat-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      make: "MINI",
      model: "John Cooper Works"
    },
    category: "cooling",
    title: "Water Pump and Plastic Thermostat Housing Failure",
    description: "MINI JCW models across all generations suffer from premature water pump failure and cracking plastic thermostat housings. The thermostat housing is made entirely of plastic, which degrades from heat cycling and eventually cracks, causing coolant leaks. The water pump bearings and seals typically fail between 50,000-80,000 miles. Undetected coolant loss from either failure can lead to overheating and severe engine damage, especially on the turbocharged JCW engines that generate significant heat.",
    solution: "Proactively replace the water pump and thermostat housing together at 60,000-70,000 miles as preventative maintenance, even if no symptoms are present. The job costs $500-900 at an independent MINI shop. Use an aluminum aftermarket thermostat housing if available for your generation to eliminate the plastic cracking issue. Check for coolant seepage under the car regularly and monitor the coolant level and temperature gauge closely.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Coolant puddle under the vehicle after parking",
      "Engine temperature gauge reading higher than normal",
      "Low coolant warning light illuminating",
      "Sweet smell of coolant from engine bay",
      "Visible coolant seepage around water pump or thermostat housing"
    ],
    estimatedCost: { low: 500, high: 900 },
    citations: [
      {
        type: "owner-report",
        title: "MINI JCW Water Pump Replacement — MiniF56.com",
        url: "https://www.minif56.com/threads/replaced-water-pump-engine-mount-front-control-arm-and-bush.87540/"
      },
      {
        type: "owner-report",
        title: "Common R56 MINI Problems — JCW Adventures",
        url: "https://jcwadventures.com/2020/12/20/sorry-i-am-not-perfect-common-2nd-gen-r56-mini-problems/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Replace the water pump, thermostat housing, and all coolant hoses as a package at 60K miles — doing them separately means paying twice for labor since they all share the same access area. Budget $700-900 for the full cooling system refresh.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 280,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0128", "P0117"]
  },
  {
    id: "mini-jcw-clutch-premature-wear-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      make: "MINI",
      model: "John Cooper Works"
    },
    category: "transmission",
    title: "Manual Transmission Clutch Premature Wear",
    description: "MINI JCW models with manual transmissions experience premature clutch wear, particularly for owners who frequently drive in stop-and-go traffic. The high torque output of the turbocharged JCW engines combined with the relatively small clutch disc diameter accelerates wear beyond what is typical for the mileage. Clutch life can be as short as 30,000-50,000 miles in urban driving conditions, compared to 80,000-100,000 miles expected on most vehicles.",
    solution: "If the clutch is slipping (RPM rises without corresponding acceleration), plan for a clutch replacement costing $1200-2000 at a MINI specialist including parts and labor. Upgrade to a heavier-duty aftermarket clutch kit if you plan to keep the car long-term or add performance modifications. Extend clutch life by avoiding riding the clutch in traffic, using neutral at red lights instead of holding the clutch pedal in, and avoiding launch-style starts.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Engine RPM rising without corresponding increase in speed",
      "Burning smell after heavy traffic driving or spirited driving",
      "Clutch pedal engagement point moving higher (closer to top of travel)",
      "Difficulty getting into first or reverse gear",
      "Shuddering or vibration when releasing clutch from a stop"
    ],
    estimatedCost: { low: 1200, high: 2000 },
    citations: [
      {
        type: "owner-report",
        title: "Common MINI Cooper Problems — Service 700",
        url: "https://service700.co.uk/news/exploring-common-faults-in-mini-models-from-2001-2022-what-you-need-to-know/"
      },
      {
        type: "owner-report",
        title: "7 Common Problems MINI Cooper Owners Face — The Haus",
        url: "https://www.thehausauto.com/2015/06/7-common-problems-mini-cooper-owners-face/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "In stop-and-go traffic, shift to neutral at red lights instead of holding the clutch pedal in — this takes the load off the throwout bearing and pressure plate, significantly extending clutch life.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 9. MINI GP (GP2: 2013, GP3: 2021)
  // ============================================================
  {
    id: "mini-gp2-coilover-adjuster-seize-2013",
    vehicleMatch: {
      years: [2013],
      make: "MINI",
      model: "GP"
    },
    category: "suspension",
    title: "GP2 Coilover Adjusters Seizing from Corrosion",
    description: "The MINI GP2's factory coilover suspension adjusters are prone to seizing due to corrosion, particularly in regions with road salt or high humidity. Once seized, the ride height cannot be adjusted and the coilover may need to be fully replaced rather than rebuilt. The GP2's close-to-the-road stance means road spray and debris directly contact the adjuster threads, accelerating corrosion. The bonnet scoop red decal also cracks and peels due to heat from the turbo underneath.",
    solution: "Apply anti-seize compound to the coilover adjuster threads every 6 months (before and after winter) to prevent corrosion. If the adjusters are already seized, apply penetrating oil (PB Blaster) and let it soak for 24-48 hours before attempting adjustment with a spanner wrench. If the adjusters cannot be freed, replacement coilovers cost $1500-2500 for a quality set. For the bonnet scoop decal, replacement decals are available from MINI dealers or aftermarket suppliers.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Coilover ride height adjuster will not turn when attempting adjustment",
      "Visible rust or corrosion on coilover adjuster ring and threads",
      "Creaking or groaning noise from suspension over bumps",
      "Uneven ride height side-to-side if one adjuster is stuck",
      "Red bonnet scoop decal cracking, peeling, or discoloring"
    ],
    estimatedCost: { low: 50, high: 2500 },
    citations: [
      {
        type: "owner-report",
        title: "MINI GP2 Daily Driver Advice — PistonHeads",
        url: "https://www.pistonheads.com/gassing/topic.asp?h=0&f=164&t=1613671"
      },
      {
        type: "owner-report",
        title: "GP2 vs GP3 Discussion — MINI2.com Forum",
        url: "https://www.mini2.com/threads/2013-gp2-jcw-vs-2021-gp3-jcw.373731/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Preventative anti-seize application twice a year is far cheaper than replacing the entire coilover assembly. Use copper-based anti-seize on the threads and adjuster ring.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 40,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "mini-gp3-torque-steer-transmission-lag-2021",
    vehicleMatch: {
      years: [2021],
      make: "MINI",
      model: "GP"
    },
    category: "drivetrain",
    title: "GP3 Severe Torque Steer and Automatic Transmission Lag",
    description: "The MINI GP3's 302 HP turbocharged engine delivers its power exclusively through the front wheels, resulting in severe torque steer during aggressive acceleration — the steering wheel pulls sharply to one side under power. While the electronic limited-slip differential attempts to manage the torque distribution, it cannot fully compensate for the power level. Additionally, the 8-speed torque-converter automatic (the GP3's only transmission option) exhibits noticeable lag and confused shifting behavior in stop-and-go traffic, dulling the driving experience compared to the manual-equipped GP2.",
    solution: "Torque steer is inherent to the GP3's front-wheel-drive layout and cannot be fully eliminated. Mitigate it by applying throttle progressively out of corners rather than stomping on the gas. The transmission lag can be improved by using Sport mode, which holds gears longer and reduces the converter lockup hunting. A transmission software reflash from a MINI specialist can improve shift response. Some owners report that aftermarket engine mounts reduce the torque steer effect by limiting engine movement.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Steering wheel pulling strongly to one side under hard acceleration",
      "Inconsistent steering feel exiting corners under power",
      "Transmission hunting between gears in stop-and-go traffic",
      "Noticeable delay between pressing throttle and acceleration response",
      "Jerky low-speed driving in Normal mode"
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      {
        type: "owner-report",
        title: "Revisiting the MINI GP3 — MotoringFile",
        url: "https://www.motoringfile.com/2025/08/08/revisiting-the-2020-mini-gp3-flawed-fast-and-still-compelling/"
      },
      {
        type: "owner-report",
        title: "Every MINI JCW GP Ranked — MotoringFile",
        url: "https://www.motoringfile.com/2025/08/19/every-mini-jcw-gp-driven-ranked/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Keep the GP3 in Sport mode for spirited driving — this transforms the sluggish Normal mode transmission behavior into much sharper, more responsive shifts that suit the car's character.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 50,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  }
];

// ============================================================
// MAIN SCRIPT
// ============================================================

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

// Load existing data
const issuesData = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
const ymmtData = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Check for duplicate IDs
const existingIds = new Set(issuesData.issues.map(i => i.id));
const dupes = newIssues.filter(i => existingIds.has(i.id));
if (dupes.length > 0) {
  console.error('DUPLICATE IDS FOUND:', dupes.map(d => d.id));
  process.exit(1);
}

// Add new issues
issuesData.issues.push(...newIssues);
console.log(`Added ${newIssues.length} new issues. Total: ${issuesData.issues.length}`);

// ============================================================
// YMMT ENTRIES
// ============================================================

function addYmmtEntry(year, make, model, trims) {
  const y = String(year);
  if (!ymmtData[y]) ymmtData[y] = {};
  if (!ymmtData[y][make]) ymmtData[y][make] = {};
  if (!ymmtData[y][make][model]) {
    ymmtData[y][make][model] = trims;
    console.log(`  Added YMMT: ${y} ${make} ${model} [${trims.join(', ')}]`);
  } else {
    console.log(`  YMMT already exists: ${y} ${make} ${model}`);
  }
}

// Sort models alphabetically within each year's make
function sortYmmtModels() {
  for (const year of Object.keys(ymmtData)) {
    for (const make of Object.keys(ymmtData[year])) {
      const models = ymmtData[year][make];
      const sortedKeys = Object.keys(models).sort();
      const sorted = {};
      for (const key of sortedKeys) {
        sorted[key] = models[key];
      }
      ymmtData[year][make] = sorted;
    }
  }
}

console.log('\n--- Adding YMMT entries ---');

// 1. Jeep Avenger 2023-2024
for (const year of [2023, 2024]) {
  addYmmtEntry(year, 'Jeep', 'Avenger', ['Altitude', 'Latitude', 'Limited', 'Trailhawk']);
}

// 2. Kia Carnival already exists for 2022-2024 — verify
for (const year of [2022, 2023, 2024]) {
  addYmmtEntry(year, 'Kia', 'Carnival', ['LX', 'LXS', 'EX', 'SX', 'SX Prestige']);
}

// 3. Kia EV9 already exists for 2024 — verify
addYmmtEntry(2024, 'Kia', 'EV9', ['Light', 'Wind', 'Land', 'GT-Line']);

// 4. Mazda MX-30 2022-2023
for (const year of [2022, 2023]) {
  addYmmtEntry(year, 'Mazda', 'MX-30', ['Base', 'Premium Plus']);
}

// 5. Mazda CX-60 2022-2024 (global market, not sold in US but adding for completeness)
for (const year of [2022, 2023, 2024]) {
  addYmmtEntry(year, 'Mazda', 'CX-60', ['Pure', 'Evolve', 'GT', 'Azami', 'Takumi']);
}

// 6. Mazda Mazdaspeed3 2007-2013
for (const year of [2007, 2008, 2009, 2010, 2011, 2012, 2013]) {
  addYmmtEntry(year, 'Mazda', 'Mazdaspeed3', ['Base', 'Grand Touring']);
}

// 7. Mazda Mazdaspeed6 2006-2007
for (const year of [2006, 2007]) {
  addYmmtEntry(year, 'Mazda', 'Mazdaspeed6', ['Grand Touring', 'Sport']);
}

// 8. MINI John Cooper Works 2008-2024
for (const year of [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]) {
  addYmmtEntry(year, 'MINI', 'John Cooper Works', ['Base']);
}

// 9. MINI GP (GP2: 2013, GP3: 2021)
addYmmtEntry(2013, 'MINI', 'GP', ['GP2']);
addYmmtEntry(2021, 'MINI', 'GP', ['GP3']);

// Sort all models alphabetically within each year/make
sortYmmtModels();

// Write files
fs.writeFileSync(issuesPath, JSON.stringify(issuesData, null, 2) + '\n', 'utf8');
console.log('\nWrote known-issues.json');

fs.writeFileSync(ymmtPath, JSON.stringify(ymmtData, null, 2) + '\n', 'utf8');
console.log('Wrote ymmt.json');

// Summary
const makes = {};
for (const issue of newIssues) {
  const key = `${issue.vehicleMatch.make} ${issue.vehicleMatch.model}`;
  makes[key] = (makes[key] || 0) + 1;
}
console.log('\n--- Summary by model ---');
for (const [model, count] of Object.entries(makes)) {
  console.log(`  ${model}: ${count} issues`);
}
