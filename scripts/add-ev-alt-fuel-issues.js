const fs = require('fs');
const path = require('path');

// ============================================================
// Add known issues for 6 EV/alt-fuel models
// GMC Hummer EV, Honda Clarity, Honda Prologue,
// Hyundai Nexo, Hyundai Ioniq (original), Hyundai Ioniq 5 N
// ============================================================

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

const issuesData = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
const ymmtData = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const existingIds = new Set(issuesData.issues.map(i => i.id));

const newIssues = [
  // ============================================================
  // 1. GMC Hummer EV (2022-2024)
  // ============================================================
  {
    id: "gmc-hummer-ev-battery-seal-water-2022",
    vehicleMatch: {
      years: [2022, 2023],
      make: "GMC",
      model: "Hummer EV"
    },
    category: "electrical",
    title: "Battery Pack Enclosure Water Ingress",
    description: "The high-voltage battery pack enclosure on certain 2022-2023 GMC Hummer EV Pickups may not be properly sealed due to flanges that were not properly primed or electrocoated, inhibiting adhesion of the urethane sealant. Water can enter the battery pack, potentially causing a loss of drive power. GM confirmed at least three incidents including one at their proving grounds where the vehicle lost propulsion while driving. NHTSA Recall 22V-771 covers approximately 735 affected vehicles.",
    solution: "Contact your GMC dealer immediately to have the battery pack enclosure inspected and resealed under NHTSA Recall 22V-771 at no cost. The dealer will inspect the battery pack sealing and apply proper primer and sealant as needed. Do not drive through deep water or heavy flooding until the recall is completed. If the vehicle will not start or loses power, have it towed to the dealer rather than attempting to drive it.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Vehicle will not start after exposure to rain or water",
      "Loss of propulsion while driving",
      "Service High Voltage System warning message",
      "Multiple warning lights on dashboard simultaneously",
      "Reduced range or charging anomalies after wet conditions"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "NHTSA Recall 22V-771 — Battery Pack Sealing",
        url: "https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V771-7193.PDF"
      },
      {
        type: "nhtsa",
        title: "2022-2023 GMC Hummer EV Recalled for Battery Sealing — Green Car Reports",
        url: "https://www.greencarreports.com/news/1137589_2022-2023-gmc-hummer-ev-recalled-for-battery-sealing"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Check your VIN on NHTSA.gov/recalls to confirm whether your vehicle is affected. Even if you have not experienced symptoms, get the recall repair done before off-roading or driving in heavy rain.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If your Hummer EV will not start after rain or car wash, do not repeatedly try to start it. Have it flat-bed towed to the dealer to avoid further damage to the high-voltage system.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 45,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "gmc-hummer-ev-a-pillar-leak-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "GMC",
      model: "Hummer EV"
    },
    category: "electrical",
    title: "A-Pillar Water Leak Disables Door Switches",
    description: "Water can enter the inside of the upper A-pillar on the driver side due to inadequate sealing, leading to corrosion on the in-line connector (X500) for the driver-side door switches. This causes the door lock, power mirror, and window switches to become inoperative. The issue is particularly problematic because the Hummer EV's removable roof panels may contribute to water channeling into the A-pillar area. GM issued a Technical Service Bulletin addressing the connector corrosion.",
    solution: "Have a GMC dealer inspect and reseal the driver-side A-pillar area and replace the corroded X500 in-line connector. The repair involves resealing the A-pillar weatherstripping and replacing the corroded connector terminals ($200-$500 at dealer). If door switches are intermittent, check for moisture in the A-pillar before replacing the switch pack itself. Apply dielectric grease to the connector after repair to prevent future corrosion.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Driver-side power windows stop working",
      "Door lock switch becomes intermittent or inoperative",
      "Power mirror adjustment stops responding",
      "Visible moisture or water stains inside the A-pillar trim",
      "Switches work intermittently, especially after rain or car wash"
    ],
    estimatedCost: { low: 200, high: 500 },
    citations: [
      {
        type: "tsb",
        title: "GM TSB — Driver Door X500 Connector Corrosion Due to A-Pillar Water Leak",
        url: "https://static.nhtsa.gov/odi/tsbs/2022/MC-10217073-0001.pdf"
      },
      {
        type: "owner-report",
        title: "GMC Hummer EV Problems and Complaints — SlotCar-Today",
        url: "https://slotcar-today.com/problems/gmc/hummer-ev"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If your door switches work intermittently, remove the A-pillar trim and check for moisture before spending money on a new switch pack. The corroded connector is the root cause, not the switches themselves.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 65,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "gmc-hummer-ev-charging-software-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "GMC",
      model: "Hummer EV"
    },
    category: "electrical",
    title: "Public Charging Failures and Software Anomalies",
    description: "Some GMC Hummer EV models experience a software anomaly that prevents the vehicle from initiating the charge sequence when plugged into public DC fast chargers. The issue may be caused by oversized or damaged terminals in the charge cord connector at frequently-used stations, but a software bug also prevents the vehicle from gracefully handling connection errors. Additionally, the battery energy control module may fail to exit its commissioning (start-up) state due to the cell monitoring unit going offline, requiring a dealer software reprogram of both the battery energy control module and drive motor control module.",
    solution: "Visit a GMC dealer for the latest battery energy control module and drive motor control module software updates. If charging fails at a public station, try a different charger or use Level 2 AC charging as a workaround. For the commissioning state issue, a dealer reprogram of the BECM and DMCM is required. GM has released multiple software updates addressing these issues — ensure your vehicle has the latest calibration files installed.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle fails to initiate charging at DC fast chargers",
      "Charging session starts but immediately stops",
      "Service High Voltage System warning appears",
      "Vehicle enters reduced power or limp mode",
      "One Pedal Driving Unavailable warning message"
    ],
    estimatedCost: { low: 0, high: 200 },
    citations: [
      {
        type: "tsb",
        title: "Some GMC Hummer EV Units Need Battery Control Module Fix — GM Authority",
        url: "https://gmauthority.com/blog/2024/04/some-gmc-hummer-ev-units-will-need-a-battery-energy-control-module-fix/"
      },
      {
        type: "owner-report",
        title: "GMC Hummer EV Charging Problem Warning — CarsDirect",
        url: "https://www.carsdirect.com/automotive-news/industry-news/gmc-issues-hummer-ev-charging-problem-warning"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If the Hummer EV refuses to charge at a public station, power cycle the vehicle completely (turn off, wait 2 minutes, restart). This clears many temporary software glitches. If it persists, Level 2 home charging usually still works while you wait for the dealer appointment.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Ask the dealer to check for ALL pending software updates, not just the one related to your specific complaint. Multiple calibration updates may be available and installing them together prevents repeat visits.",
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
    id: "gmc-hummer-ev-warning-lights-limp-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "GMC",
      model: "Hummer EV"
    },
    category: "electrical",
    title: "Multiple Warning Lights with Speed Limited to 36 MPH",
    description: "Owners report a cascade of warning messages appearing simultaneously — 'One Pedal Driving Unavailable,' 'Service ESC,' 'Service Trailer Brake System,' and 'Service Active Steering System' — with the vehicle's speed limited to approximately 36 mph. The issue appears related to communication faults between the vehicle's multiple electronic control modules, particularly affecting the electric stability control and four-wheel steering systems. The Hummer EV's CrabWalk and Extract Mode features may also become disabled. The issue can occur without warning and may require a dealer visit to clear.",
    solution: "Pull over safely and perform a complete vehicle power-down: turn off, open and close the door, wait 3-5 minutes, then restart. If warnings persist, the vehicle needs a dealer visit for module reprogramming. Do not ignore the speed limitation — driving at highway speeds may not be safe if the ESC system is faulted. The dealer will perform a full module scan and reprogram affected control units. Multiple visits may be required as GM releases updated software calibrations.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Multiple warning messages appear on the dashboard simultaneously",
      "Vehicle speed limited to approximately 36 mph",
      "One Pedal Driving Unavailable message",
      "Service ESC warning light",
      "CrabWalk and four-wheel steering features disabled"
    ],
    estimatedCost: { low: 0, high: 300 },
    citations: [
      {
        type: "nhtsa",
        title: "2022 GMC Hummer EV Complaints — NHTSA",
        url: "https://www.nhtsa.gov/vehicle/2022/GMC/HUMMER%20EV%20PICKUP"
      },
      {
        type: "owner-report",
        title: "Hummer EV System Issues — HummerChat.com",
        url: "https://www.hummerchat.com/threads/hummer-ev-suv-2024-system-issue.3705/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Document every occurrence with photos of the dashboard warnings and note the date, mileage, and conditions. If the issue recurs frequently, this documentation supports a lemon law claim and helps the dealer isolate the pattern.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 85,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["U0100", "C0161"]
  },

  // ============================================================
  // 2. Honda Clarity (2017-2021)
  // ============================================================
  {
    id: "honda-clarity-power-loss-highway-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021],
      make: "Honda",
      model: "Clarity"
    },
    category: "engine",
    title: "Sudden Power Loss and Engine Over-Rev on Highway",
    description: "The Honda Clarity PHEV can experience a dangerous loss of power when transitioning from electric to gasoline engine operation, particularly under high-load conditions such as highway hills, cold weather, or when the battery is nearly depleted. The vehicle may drop from highway speed (60+ mph) to as low as 20 mph while the engine revs loudly but fails to deliver power, behaving as if the transmission is in neutral. The 1.5L Atkinson-cycle engine struggles to maintain speed when the electric motor assistance diminishes, and the power management software does not always transition smoothly between operating modes.",
    solution: "Visit a Honda dealer for the latest PCM software update, which improves the hybrid-to-gas transition logic. Keep the battery charged above 2 bars when highway driving in cold weather. In HV mode on long highway grades, manually press the HV Charge button to maintain battery reserve for power blending. If power loss occurs, safely pull over, turn off the vehicle for 60 seconds, then restart — this resets the power management system. The issue is less severe after the 2019 software updates.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Vehicle drops from highway speed to 20-30 mph unexpectedly",
      "Engine revs loudly but vehicle does not accelerate",
      "Power System Problem warning on dashboard",
      "Gear icon with exclamation mark appears",
      "Issue worsens in cold weather or on steep grades"
    ],
    estimatedCost: { low: 0, high: 150 },
    citations: [
      {
        type: "nhtsa",
        title: "2018 Honda Clarity PHEV Complaints — NHTSA",
        url: "https://www.nhtsa.gov/vehicle/2018/HONDA/CLARITY%20PLUG-IN%20HYBRID"
      },
      {
        type: "owner-report",
        title: "Loss of Power and Engine Over-Rev — ClarityForum.com",
        url: "https://www.clarityforum.com/threads/loss-of-power-and-engine-over-rev-help-with-tools.1325/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "On highway trips longer than your EV range, use HV mode from the start rather than draining the battery completely. Keeping 20-30% battery charge allows the electric motor to supplement the gas engine on hills, preventing the power loss scenario entirely.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If you experience frequent power loss on your commute, ask the dealer specifically for TSB 19-056 and TSB 20-008 software updates. Not all dealers proactively apply these unless you request them.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P1D8D", "P0010"]
  },
  {
    id: "honda-clarity-charging-failure-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021],
      make: "Honda",
      model: "Clarity"
    },
    category: "electrical",
    title: "Intermittent Charging Failure and Battery Not Fully Charging",
    description: "The Honda Clarity PHEV may fail to start charging when plugged in, or may stop charging before the high-voltage lithium-ion battery reaches full capacity. The onboard charger or charging control software may not properly communicate with the EVSE (charging station), resulting in no charging activity despite the plug being connected and the charge indicator light not illuminating. Some owners also report the battery only charging to partial capacity (6-36 miles range instead of the expected 47 miles), which may indicate battery degradation or a software calibration error in the battery management system.",
    solution: "Try unplugging and re-plugging the charge connector firmly — a loose connection is the most common cause. If charging still fails, reset the vehicle by turning off, locking with the key fob, waiting 5 minutes, then plugging in again. Visit a Honda dealer for the charging system software update (TSB addresses EVSE communication). For range degradation, the dealer can run a battery health check — if capacity is below 66%, the battery may be eligible for warranty replacement under the 10-year/150,000-mile hybrid battery warranty.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Charge indicator light does not illuminate after plugging in",
      "Charging starts but stops after a few minutes",
      "EV range significantly lower than expected after full charge",
      "Ready to Charge notification never appears on the dash",
      "Charging timer shows unreasonably long charge times"
    ],
    estimatedCost: { low: 0, high: 300 },
    citations: [
      {
        type: "tsb",
        title: "Honda TSB — Clarity PHEV Charging Issues",
        url: "https://www.carcomplaints.com/Honda/Clarity_Plug-In_Hybrid/2018/tsbs/"
      },
      {
        type: "owner-report",
        title: "EV Battery Completely Depleted — ClarityForum.com",
        url: "https://www.clarityforum.com/threads/ev-battery-completely-depleted.2258/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Before assuming the charger is broken, test with a different Level 2 EVSE if possible. The Clarity can be picky about some aftermarket chargers. The OEM Honda charge cord and ChargePoint stations have the highest compatibility.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 145,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "honda-clarity-ac-condenser-leak-2018",
    vehicleMatch: {
      years: [2018, 2019, 2020, 2021],
      make: "Honda",
      model: "Clarity"
    },
    category: "hvac",
    title: "AC Condenser Refrigerant Leak and Cooling System Failure",
    description: "The Honda Clarity PHEV is prone to AC condenser failures caused by refrigerant leaks. The condenser, located in front of the radiator, develops leaks from road debris impact or internal corrosion, gradually releasing all refrigerant from the system. Because the Clarity uses an electric compressor that also provides heating via a heat pump in some modes, the failure affects both cooling and heating performance. The issue is more common on 2018-2019 models and is exacerbated by the electric vehicle's reliance on the HVAC system for battery thermal management.",
    solution: "Have the AC system pressure-tested at a Honda dealer or qualified AC shop. If the condenser is leaking, it must be replaced ($600-$1,200 including labor and refrigerant recharge). Aftermarket condensers are available for $150-$250 for the part alone. Consider adding a condenser stone guard ($30-$50) to prevent future road debris damage. The entire HVAC system should be evacuated and recharged with the correct amount of R-1234yf refrigerant after condenser replacement.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "AC blows warm air instead of cold",
      "Heating performance reduced in winter",
      "Visible refrigerant dye stains on the condenser",
      "Climate system warning light on dashboard",
      "Unusual hissing noise from the front of the vehicle"
    ],
    estimatedCost: { low: 600, high: 1200 },
    citations: [
      {
        type: "owner-report",
        title: "Honda Clarity Common Problems — Engine Patrol",
        url: "https://enginepatrol.com/honda-clarity-common-problems/"
      },
      {
        type: "nhtsa",
        title: "2018 Honda Clarity PHEV Complaints — CarComplaints.com",
        url: "https://www.carcomplaints.com/Honda/Clarity_Plug-In_Hybrid/2018/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If your AC gradually loses cooling over weeks, it is almost certainly a slow condenser leak rather than a low-charge situation. Adding refrigerant without fixing the leak is wasting money. Get a UV dye test to pinpoint the leak location before authorizing any repairs.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 95,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "honda-clarity-12v-battery-drain-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021],
      make: "Honda",
      model: "Clarity"
    },
    category: "electrical",
    title: "12V Auxiliary Battery Drain When Vehicle Sits Idle",
    description: "The Honda Clarity PHEV and EV models experience 12V auxiliary battery drain when the vehicle is not driven for extended periods (7-14 days). Unlike conventional vehicles, the Clarity's 12V battery is relatively small and powers multiple always-on systems including the telematics module, keyless entry receiver, and battery management system monitoring. The 12V battery does not charge from the high-voltage battery when the vehicle is off, leading to a dead 12V battery that prevents the vehicle from powering on even if the main traction battery is fully charged.",
    solution: "If the vehicle will sit unused for more than a week, connect a 12V battery tender or maintainer ($25-$40). The 12V battery is located in the trunk area. If the 12V battery dies, use a jump starter or jumper cables on the 12V battery terminals under the hood to boot the vehicle, then let it run for 30 minutes to recharge. Replace the 12V battery with a high-quality AGM battery every 3-4 years proactively ($150-$250). Consider unplugging the OBD-II port if you have an aftermarket dongle connected, as these draw parasitic current.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Vehicle will not power on after sitting for a week or more",
      "Dashboard completely dark when pressing the start button",
      "Key fob does not unlock doors remotely",
      "Clock and radio presets reset after jump-starting",
      "Charging will not initiate even when plugged in"
    ],
    estimatedCost: { low: 25, high: 250 },
    citations: [
      {
        type: "owner-report",
        title: "Honda Clarity 12V Battery Issues — Engine Patrol",
        url: "https://enginepatrol.com/honda-clarity-common-problems/"
      },
      {
        type: "owner-report",
        title: "2018 Honda Clarity Reliability Discussion — ClarityForum.com",
        url: "https://www.clarityforum.com/threads/2018-honda-clarity-reliability-is-very-poor.2293/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "A NOCO Genius1 or Battery Tender Junior ($25-$35) connected to the 12V battery when the car sits for extended periods completely eliminates this issue. Run the cable through the trunk seal — it compresses enough to close without damage.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 210,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 3. Honda Prologue (2024)
  // ============================================================
  {
    id: "honda-prologue-cv-axle-clicking-2024",
    vehicleMatch: {
      years: [2024],
      make: "Honda",
      model: "Prologue"
    },
    category: "drivetrain",
    title: "CV Joint/Axle Clicking and Knocking Noise When Turning",
    description: "The 2024 Honda Prologue has a widespread defect causing loud clicking or knocking sounds from the front axle area, especially when making turns or accelerating from a stop. With 98 NHTSA complaints filed at an average of just 24 miles, many owners report the noise appearing within weeks of delivery. The CV joint boots or inner joint assemblies appear to be defective from the factory. Honda issued a Tech Line Summary Article on December 19, 2025, acknowledging the 'clicking or ratcheting type noise when turning' but directed dealers not to attempt repairs if no visible damage is found. Replacement axle parts have been backordered nationwide due to the volume of affected vehicles.",
    solution: "Document the clicking noise with video recordings and file a complaint at NHTSA.gov to support potential recall action. Visit a Honda dealer and reference the December 2025 Tech Line Summary Article for the Prologue CV axle noise. If the clicking is severe, request axle replacement under warranty — though parts may be backordered. The noise itself is not a safety hazard per Honda's assessment, but the axles should be inspected for CV boot tears or grease leakage. Consider filing a lemon law claim if the noise is not resolved after multiple dealer visits.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Loud clicking or knocking when turning at low speed",
      "Ratcheting noise during acceleration from a stop",
      "Noise is louder when turning the steering wheel fully left or right",
      "Clicking increases with vehicle speed during turns",
      "Noise may come from either front wheel area"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "nhtsa",
        title: "2024 Honda Prologue Suspension Complaints (98) — CarComplaints.com",
        url: "https://www.carcomplaints.com/Honda/Prologue/2024/suspension/suspension.shtml"
      },
      {
        type: "owner-report",
        title: "CV Axle Issue Discussion — Honda Prologue Forum",
        url: "https://www.prologuedrivers.com/threads/i%E2%80%99ve-got-the-axle-issue.928/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Record video of the clicking noise with your phone and include it with your NHTSA complaint. The more documented complaints, the faster NHTSA will escalate to a formal recall investigation. Also ask the dealer to note the issue in your service record even if they say no fix is available.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Honda has confirmed the clicking is not a safety issue and the axles are safe to drive on. Do not pay out-of-pocket for axle replacement — this should be covered under the factory warranty.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 98,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "honda-prologue-phantom-braking-2024",
    vehicleMatch: {
      years: [2024],
      make: "Honda",
      model: "Prologue"
    },
    category: "brakes",
    title: "False AEB Activation and Phantom Braking",
    description: "The 2024 Honda Prologue's automatic emergency braking (AEB) system activates unexpectedly with no obstacle or vehicle ahead, causing sudden hard braking that risks rear-end collisions. The issue is part of a broader NHTSA investigation into Honda's Collision Mitigation Braking System across multiple models. False activations occur most frequently when reversing, at low speeds in parking lots, and occasionally at highway speeds. The Prologue shares its Ultium platform with GM but uses Honda's own ADAS sensor stack, which appears to have calibration issues. NHTSA has received reports of the AEB activating at approximately 70 mph with no visible threat.",
    solution: "Visit a Honda dealer to ensure the latest ADAS software calibration is installed. If phantom braking has occurred, report it to NHTSA.gov with as much detail as possible (speed, location, conditions). There is currently no official recall, but Honda is aware of the issue as part of a broader AEB investigation. Some owners have found that the forward collision warning sensitivity setting (adjustable in the settings menu) can reduce false activations when set to 'Far' instead of 'Normal.' Do not disable AEB entirely as it provides genuine safety benefits.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Vehicle brakes hard suddenly with no obstacle ahead",
      "AEB activation warning appears on dashboard unexpectedly",
      "Phantom braking while reversing in a clear parking lot",
      "Sudden deceleration on the highway in clear conditions",
      "Collision Mitigation Braking System alert without any obstruction"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "nhtsa",
        title: "2024 Honda Prologue Brake Complaints (40) — CarComplaints.com",
        url: "https://m.carcomplaints.com/Honda/Prologue/2024/brakes/service_brakes.shtml"
      },
      {
        type: "nhtsa",
        title: "NHTSA Investigation Into Honda AEB System — Consumer Reports",
        url: "https://www.consumerreports.org/cars/car-recalls-defects/nhtsa-investigates-honda-unexpected-braking-complaints-a9281526240/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Set the forward collision warning sensitivity to 'Far' in the vehicle settings. While counterintuitive, this setting reportedly reduces false AEB activations by giving the system more reaction time to confirm a real obstacle before braking.",
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
    id: "honda-prologue-display-blackout-2024",
    vehicleMatch: {
      years: [2024],
      make: "Honda",
      model: "Prologue"
    },
    category: "electrical",
    title: "Instrument Panel and Infotainment Screens Go Blank While Driving",
    description: "Both the instrument cluster and infotainment display can suddenly go blank while driving, eliminating the speedometer, navigation, climate controls, and safety warnings. The defect is in the Radio Control Module software, which manages communication between the vehicle's display systems and other electronic components. Honda issued a safety recall in early 2026 affecting approximately 65,000 Prologue and Acura ZDX vehicles. The failure may occur intermittently and sometimes resolves temporarily after restarting the vehicle, but loss of the driver display while driving is a significant safety concern since the Prologue has no physical instrument gauges.",
    solution: "Contact a Honda dealer immediately to have the recall software update installed at no cost. Owner notification letters are expected to be mailed beginning April 2026. If the screens go blank while driving, pull over safely — you have no speedometer or warning indicators. Restarting the vehicle (turning off and on) may temporarily restore the displays. Do not rely on the restart as a permanent fix. Check NHTSA.gov/recalls with your VIN to confirm recall eligibility.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Both instrument panel and center screen go completely black",
      "Speedometer and driver information display disappear",
      "Climate controls become inaccessible (screen-only controls)",
      "Backup camera stops working",
      "Displays may flicker before going blank"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "Acura ZDX and Honda Prologue Recall: Instrument Panel Screens May Go Blank",
        url: "https://www.valerolaw.com/news/2026/3/5/acura-zdx-and-honda-prologue-recall-instrument-panel-screens-may-go-blank"
      },
      {
        type: "nhtsa",
        title: "2024 Honda Prologue Electrical System Complaints (107) — CarComplaints.com",
        url: "https://www.carcomplaints.com/Honda/Prologue/2024/electrical/electrical_system.shtml"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If the screens go blank while driving, safely pull over and turn the vehicle fully off (foot off the brake, press power button). Wait 30 seconds and restart. This usually restores the displays temporarily until the recall software update is applied.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 107,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "honda-prologue-hv-system-failure-2024",
    vehicleMatch: {
      years: [2024],
      make: "Honda",
      model: "Prologue"
    },
    category: "electrical",
    title: "High Voltage System Failure Disabling Charging and Performance",
    description: "The 2024 Honda Prologue can experience high-voltage electrical system failures that disable DC fast charging, limit acceleration, or disable climate control. The 'Service High Voltage System' warning appears on the dashboard, sometimes accompanied by a sudden loss of heating or cooling. The Prologue uses GM's Ultium battery platform, and the issue may involve the battery conditioning system, onboard charger module, or high-voltage junction box. Some vehicles have been rendered inoperable, requiring tow to the dealer. The issue is distinct from the display blackout recall and affects the vehicle's powertrain and charging capability.",
    solution: "If the Service High Voltage System warning appears, safely reduce speed and drive to the nearest Honda dealer if the vehicle is still drivable. Do not attempt to charge the vehicle until the warning has been diagnosed. The dealer will need to perform high-voltage system diagnostics, which may involve replacing the onboard charger module, battery conditioning system components, or updating software. Repairs are covered under the 8-year/100,000-mile EV powertrain warranty. If the vehicle is not drivable, request a flatbed tow (not a conventional tow) to protect the electric drive system.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Service High Voltage System warning on dashboard",
      "Vehicle unable to DC fast charge",
      "Sudden loss of heating or air conditioning",
      "Reduced acceleration or power limitation mode",
      "Vehicle will not start or enter Ready mode"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "nhtsa",
        title: "2024 Honda Prologue Problems — Lemberg Law",
        url: "https://lemberglaw.com/2024-honda-prologue-problems-complaints-lemon/"
      },
      {
        type: "nhtsa",
        title: "2024 Honda Prologue NHTSA Complaints",
        url: "https://www.nhtsa.gov/vehicle/2024/honda/prologue"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Keep a record of every Service High Voltage System warning occurrence with photos. If the issue happens more than twice, this documentation supports your case under state lemon law protections and the federal Magnuson-Moss Warranty Act.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 75,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 4. Hyundai Nexo (2019-2024)
  // ============================================================
  {
    id: "hyundai-nexo-fuel-cell-stack-degradation-2019",
    vehicleMatch: {
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      make: "Hyundai",
      model: "Nexo"
    },
    category: "engine",
    title: "Fuel Cell Stack Degradation and Power Loss",
    description: "The Hyundai Nexo's hydrogen fuel cell stack can experience premature degradation, resulting in reduced power output and range over time. In severe cases, the stack fails entirely, triggering a 'Power Limited due to fuel cell system error' warning and reducing range to as little as 2 miles. Data from hydrogen taxi fleets in Seoul shows stack replacement rates exceeding 50%, and private Nexo vehicles are following with replacement rates above 20%, with increasing cases of stacks needing replacement twice within four years. The degradation is accelerated by frequent cold starts, high-humidity environments, and operation at sustained high power output. A class action lawsuit has been filed alleging the Nexo's fuel cell system is fundamentally defective.",
    solution: "Have the fuel cell system inspected at one of the few Hyundai dealers certified for hydrogen vehicle service (only 3 dealerships in California). The fuel cell stack is covered under Hyundai's 10-year/100,000-mile fuel cell warranty. If power output drops significantly, the dealer can perform a stack conditioning procedure that may temporarily restore performance. For severe degradation, full stack replacement is required ($5,000-$10,000 at dealer, covered under warranty). Monitor the fuel cell system efficiency readings in the vehicle's diagnostic menu to track degradation trends.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Gradual reduction in maximum power output over time",
      "Power Limited due to fuel cell system error warning",
      "Driving range decreasing beyond normal degradation rates",
      "Vehicle enters limp mode with severely limited speed",
      "Fuel cell system warning lights on dashboard"
    ],
    estimatedCost: { low: 0, high: 10000 },
    citations: [
      {
        type: "nhtsa",
        title: "Hyundai NEXO Class Action — Fuel Cell Defects",
        url: "https://www.thelemonfirm.com/2025/04/04/hyundai-class-action-alleges-nexo-hydrogen-vehicles-are-misleading-and-defective/"
      },
      {
        type: "owner-report",
        title: "Nexo Stack Failure Discussion — Hyundai Forums",
        url: "https://www.hyundai-forums.com/threads/im-talking-about-the-nexo-stack-failure.686870/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Track your range per fill-up over time. If you notice a consistent decline beyond 10-15% from new, schedule a fuel cell system inspection sooner rather than later. Early warranty claims are easier to process than waiting until the stack fails completely.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 55,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "hyundai-nexo-hydrogen-tank-fill-2019",
    vehicleMatch: {
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      make: "Hyundai",
      model: "Nexo"
    },
    category: "fuel",
    title: "Hydrogen Tank Fails to Fill Beyond 85% Capacity",
    description: "Nexo owners consistently report that the hydrogen tanks only fill to approximately 85% of maximum capacity, significantly reducing the advertised 380-mile range. While partially caused by hydrogen station dispenser limitations (pressure drops during busy periods), the vehicle's own tank pressure management and temperature compensation algorithms also contribute. The emptier the tank, the more it can fill — drivers typically achieve 95% fill only when the tank is below one-third. The issue is compounded by the extremely limited hydrogen fueling infrastructure, with stations frequently inoperable, sometimes leaving owners unable to fuel for days.",
    solution: "For the best fill level, drive the tank down to below one-third before refueling — this allows the highest fill percentage due to lower internal pressure. Avoid refueling immediately after another vehicle has used the station, as the dispenser pressure needs time to recover. Fill during off-peak hours (early morning) when station compressors have had time to build maximum pressure. Monitor hydrogen station status on the California Fuel Cell Partnership website (cafcp.org) or the H2 Station mobile app before driving to a station. Expect 85-90% fills as normal operating behavior.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Hydrogen tank gauge never reaches full",
      "Fill stops at approximately 85% capacity",
      "Achieved range is 50-60 miles less than the advertised 380 miles",
      "Fueling takes longer than expected at some stations",
      "Fill percentage varies significantly between stations"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "owner-report",
        title: "Filling Up Full Tank — Never Seems to Happen — Hyundai Forums",
        url: "https://www.hyundai-forums.com/threads/filling-up-full-tank-never-seems-to-happen.698580/"
      },
      {
        type: "owner-report",
        title: "Hyundai Nexo Hydrogen Fuel Cell Discussion — Hyundai Forums",
        url: "https://www.hyundai-forums.com/threads/hyundai-nexo-hydrogen-fuel-cell-hfcv.662552/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Check station status on the H2 Station app or cafcp.org before driving to fill up. Hydrogen stations go offline frequently, and you do not want to discover that on empty. Keep at least 25% range in reserve at all times.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Hyundai provides a complimentary hydrogen fuel card worth approximately $15,000 over 3 years. Make sure you activate it at your dealer and understand its expiration terms — unused value does not roll over.",
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
    id: "hyundai-nexo-parking-sensor-failure-2019",
    vehicleMatch: {
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      make: "Hyundai",
      model: "Nexo"
    },
    category: "electrical",
    title: "Parking Sensor System Shuts Down Without Warning",
    description: "The Nexo's ultrasonic parking sensor system can fail silently, providing no alerts when approaching obstacles in reverse or while parking. The sensors may stop functioning due to software glitches, moisture intrusion, or electrical connector issues, but the system does not always display a warning when the sensors are inoperative. This is particularly dangerous in a vehicle with limited rear visibility. Some owners also report false alarms from the parking sensors in normal driving conditions, and the sensor system recalibration at the dealer does not always resolve the issue permanently.",
    solution: "Visit a Hyundai dealer for parking sensor system diagnosis and software update. The dealer can test each sensor individually and replace any that have failed ($100-$300 per sensor including labor). If sensors are intermittently failing, check for moisture or debris buildup on the sensor faces — clean with a soft cloth. A full system recalibration may be needed after sensor replacement ($100-$150). If the issue persists after sensor replacement and recalibration, the parking sensor control module may need replacement ($300-$500).",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "No parking sensor alerts when approaching obstacles",
      "Parking sensor warning chime sounds randomly with no obstacle",
      "Rear camera works but parking sensor overlay shows no data",
      "Parking sensor system error message on dashboard",
      "Intermittent sensor operation — works sometimes, not others"
    ],
    estimatedCost: { low: 100, high: 500 },
    citations: [
      {
        type: "owner-report",
        title: "Hyundai Nexo Problems — Hyundai Maintenance",
        url: "https://hyundaimaintenance.com/hyundai-nexo-problems/"
      },
      {
        type: "owner-report",
        title: "Hyundai Nexo Reliability — Motor A2Z",
        url: "https://motora2z.com/hyundai-nexo-reliability/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Test your parking sensors regularly by slowly backing toward a known object. If the system fails to alert you, do not rely on it and schedule a dealer visit. Given the Nexo's limited rear visibility, functioning parking sensors are critical for safe reversing.",
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
    id: "hyundai-nexo-limited-service-infrastructure-2019",
    vehicleMatch: {
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      make: "Hyundai",
      model: "Nexo"
    },
    category: "other",
    title: "Extremely Limited Service Network and Hydrogen Infrastructure",
    description: "The Nexo faces severe practical limitations due to hydrogen infrastructure and service availability. Only three Hyundai dealerships in California are certified to service the hydrogen fuel cell system, requiring long drives for any powertrain-related service. Hydrogen fueling stations are frequently inoperable or closed for maintenance, with owners reporting wait times exceeding six hours at the only operational station. Some owners have been unable to fuel for days when all nearby stations were simultaneously offline. The class action lawsuit filed against Hyundai alleges the Nexo is 'misleading and defective' partly due to these infrastructure realities not being adequately disclosed at the time of sale.",
    solution: "Before purchasing or leasing a Nexo, verify that hydrogen stations near your home and workplace are operational using cafcp.org. Plan for alternative transportation during station outages. For service appointments, confirm the dealership has hydrogen-certified technicians before making the trip. Hyundai offers roadside assistance including towing for fuel cell-related issues. Consider the Toyota Mirai as a comparison — it shares the same infrastructure challenges but has a different fuel cell platform. Keep the Nexo lease rather than purchase, as residual values have been severely impacted by infrastructure concerns.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Nearest hydrogen station is frequently out of service",
      "Only 1-3 dealers in the state can perform fuel cell service",
      "Wait times of 2-6 hours at hydrogen fueling stations",
      "Service appointments require driving 50+ miles to qualified dealer",
      "Parts availability for fuel cell components requires weeks of waiting"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "nhtsa",
        title: "Hyundai NEXO Class Action — Misleading and Defective",
        url: "https://www.thelemonfirm.com/2025/04/05/hyundai-nexo-class-action-alleges-fuel-cell-suv-is-a-disaster-for-california-drivers/"
      },
      {
        type: "owner-report",
        title: "Hyundai Nexo Hydrogen Fuel Cell Discussion — Hyundai Forums",
        url: "https://www.hyundai-forums.com/threads/hyundai-nexo-hydrogen-fuel-cell-hfcv.662552/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Bookmark cafcp.org/stationmap and check it every time before you drive to a hydrogen station. Stations go down without notice and checking saves you from a wasted trip on low fuel. Consider keeping a second vehicle or having a backup transportation plan for when all nearby stations are offline.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 5. Hyundai Ioniq — original (2017-2022)
  // ============================================================
  {
    id: "hyundai-ioniq-dct-harsh-shifting-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021, 2022],
      make: "Hyundai",
      model: "Ioniq"
    },
    category: "transmission",
    title: "6-Speed DCT Harsh Shifting, Shuddering, and Hesitation",
    description: "The Hyundai Ioniq Hybrid and PHEV use a 6-speed dual-clutch transmission (DCT) that is prone to harsh shifting, shuddering during low-speed acceleration, and hesitation from a stop. The defect involves the transmission control module (TCM) and the dual-clutch mechanism itself. The clutch can slip, causing the transmission to hesitate or shudder, particularly in hot weather when the clutch overheats. Service records show broken pins and jammed shafts within the DCT components. Hyundai acknowledged the issue by placing warning cards near the gear selector in some vehicles. The defect prevents proper acceleration from a stop, which is dangerous in traffic.",
    solution: "Visit a Hyundai dealer for the latest TCM software update, which improves shift logic and clutch engagement timing. If shuddering persists after the software update, the clutch actuator assembly may need replacement ($1,500-$3,000 at dealer, covered under the 10-year/100,000-mile powertrain warranty). Avoid holding the vehicle on hills with the brake released and clutch engaged — use the brake pedal instead. In stop-and-go traffic, the DCT can be managed by being smooth with throttle inputs rather than rapid acceleration. Some owners report improved behavior after a transmission fluid change ($150-$250), though Hyundai considers the fluid lifetime.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Shuddering or jerking during acceleration from a stop",
      "Hesitation when pressing the accelerator from standstill",
      "Harsh or delayed shifts between gears",
      "Transmission slips during gear changes",
      "Worse performance in hot weather or stop-and-go traffic"
    ],
    estimatedCost: { low: 0, high: 3000 },
    citations: [
      {
        type: "owner-report",
        title: "Hyundai Ioniq DCT Transmission Problems — The Driver Adviser",
        url: "https://thedriveradviser.com/transmission-problems-hyundai-ioniq/"
      },
      {
        type: "nhtsa",
        title: "2018 Hyundai Ioniq Hybrid Power Train Complaints — CarComplaints.com",
        url: "https://m.carcomplaints.com/Hyundai/Ioniq_Hybrid/2018/drivetrain/power_train.shtml"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "The DCT shudder is worst when the clutch is cold and you launch aggressively. Let the car warm up for 2-3 minutes before driving, and be gentle with the throttle from a stop for the first few miles. This dramatically reduces the shuddering.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If the dealer says 'that is normal DCT behavior,' push back and ask for the TCM software update. The updated calibration files significantly improve shift quality. Hyundai has released multiple updates and the latest versions are much better than the original software.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 285,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0730", "P0741"]
  },
  {
    id: "hyundai-ioniq-epb-autohold-malfunction-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021, 2022],
      make: "Hyundai",
      model: "Ioniq"
    },
    category: "brakes",
    title: "Electronic Parking Brake and Auto Hold Malfunction",
    description: "The Hyundai Ioniq's electronic parking brake (EPB) and Auto Hold feature can malfunction randomly, illuminating the EPB warning light and disabling the Auto Hold function. The EPB system uses brushed DC motors in the rear calipers that can fail prematurely, with diagnostic code C2417 indicating a motor short or open circuit. When the EPB faults, the Auto Hold feature (which automatically holds the brake at stops) also becomes unavailable, turning orange on the dashboard. The issue can be intermittent and difficult for dealers to reproduce, as the fault codes may not store permanently.",
    solution: "Visit a Hyundai dealer and request a scan for code C2417. If present, the rear caliper EPB motor needs replacement ($400-$700 per caliper including labor). Both rear calipers should ideally be replaced together as the motors wear at similar rates. The dealer can also perform an EPB service mode reset after replacement. If the issue is intermittent and no codes are stored, ask the dealer to note the complaint in the service record for warranty tracking. The EPB calipers and motors are covered under the factory warranty.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Electronic Parking Brake warning light illuminates randomly",
      "Auto Hold indicator turns orange and feature is disabled",
      "EPB fails to engage when shifting to Park",
      "Grinding or clicking noise from rear brakes when EPB activates",
      "Smart Cruise Control becomes unavailable when EPB faults"
    ],
    estimatedCost: { low: 400, high: 1400 },
    citations: [
      {
        type: "owner-report",
        title: "Electronic Parking Brake and Smart Cruise Failure — Ioniq Forum",
        url: "https://www.ioniqforum.com/threads/smart-cruise-control-failure-electronic-parking-brake-failure.36282/"
      },
      {
        type: "owner-report",
        title: "EPB Light Discussion — Ioniq Forum",
        url: "https://www.ioniqforum.com/threads/electronic-parking-brake-epb-light.46339/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If the EPB warning comes on intermittently, take a photo or video of the dashboard every time it happens. The dealer needs evidence that the issue is recurring if they cannot reproduce it during the service visit. Date-stamped photos strengthen your warranty claim.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 110,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["C2417"]
  },
  {
    id: "hyundai-ioniq-hybrid-control-software-2019",
    vehicleMatch: {
      years: [2019, 2020, 2021, 2022],
      make: "Hyundai",
      model: "Ioniq"
    },
    category: "electrical",
    title: "Hybrid Control Unit Software Glitches and Warning Lights",
    description: "The Hyundai Ioniq Hybrid and Plug-In Hybrid models from 2019-2022 can exhibit warning lights and system faults caused by software bugs in the Hybrid Control Unit (HCU) and Low DC/DC Converter (LDC). The issues include communication errors (DTC U1341) between control modules, incorrect battery state-of-charge calculations, and improper power distribution between the electric motor and gasoline engine. Hyundai has released multiple TSBs addressing software logic updates for the HCU and LDC. The Plug-In Hybrid variant is more frequently affected due to its more complex power management between the larger battery, electric motor, and engine.",
    solution: "Visit a Hyundai dealer and request the latest HCU and LDC software updates as outlined in Hyundai's Technical Service Bulletins. The software update is free and typically takes 1-2 hours. After the update, the dealer should clear all stored DTCs and verify normal operation. If warning lights return after the software update, a more thorough diagnosis of the high-voltage system may be needed, including inspection of the DC/DC converter output and 12V system charging. Keep the 12V battery in good condition, as a weak 12V battery can trigger false HCU warning lights.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Check Engine light with hybrid system-related DTC codes",
      "Hybrid system warning indicator on dashboard",
      "Unexpected transitions between EV and hybrid modes",
      "Reduced power output or EV range",
      "12V battery frequently low despite normal driving"
    ],
    estimatedCost: { low: 0, high: 200 },
    citations: [
      {
        type: "tsb",
        title: "2021 Hyundai Ioniq Hybrid TSBs — CarComplaints.com",
        url: "https://www.carcomplaints.com/Hyundai/Ioniq_Hybrid/2021/tsbs/"
      },
      {
        type: "nhtsa",
        title: "2021 Hyundai Ioniq Problems — Lemberg Law",
        url: "https://lemberglaw.com/2021-hyundai-ioniq-problems-complaints-lemon/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "When you take the Ioniq in for any service, ask the advisor to check for pending software updates. Hyundai releases HCU updates several times per year but does not always notify owners. Getting the latest calibration prevents many phantom warning light issues.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 165,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["U1341", "P0A1F"]
  },
  {
    id: "hyundai-ioniq-mdps-bearing-noise-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021, 2022],
      make: "Hyundai",
      model: "Ioniq"
    },
    category: "steering",
    title: "Motor Driven Power Steering Column Bearing Noise",
    description: "The Hyundai Ioniq can develop a bearing noise within the Motor Driven Power Steering (MDPS) column worm shaft assembly. The noise is a whining, groaning, or grinding sound that occurs when turning the steering wheel, particularly at low speeds during parking maneuvers. The MDPS worm shaft bearing wears prematurely, likely due to the heavier weight of the hybrid battery pack placing additional stress on the steering system. Hyundai issued a TSB directing dealers to replace the worm shaft bearing. The noise is more pronounced in cold weather and may worsen over time.",
    solution: "Visit a Hyundai dealer and describe the steering noise. Reference the Hyundai TSB for MDPS worm shaft bearing replacement. The dealer will verify the noise by turning the steering wheel at low speed and, if confirmed, replace the worm shaft bearing in the steering column ($300-$600 at dealer, covered under warranty if within coverage). The repair takes approximately 2-3 hours. After replacement, the steering should be silent during turns. If the noise returns after replacement, the entire MDPS unit may need replacement ($800-$1,200).",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Whining or groaning noise when turning the steering wheel",
      "Grinding sound during low-speed parking maneuvers",
      "Noise is louder in cold weather",
      "Steering effort may feel slightly increased",
      "Sound comes from the steering column area, not the wheels"
    ],
    estimatedCost: { low: 300, high: 1200 },
    citations: [
      {
        type: "tsb",
        title: "Hyundai TSB — MDPS Column Worm Shaft Bearing Noise",
        url: "https://www.carcomplaints.com/Hyundai/Ioniq_Hybrid/2021/tsbs/"
      },
      {
        type: "owner-report",
        title: "Ioniq Forum Transmission and Service Problems Discussion",
        url: "https://www.ioniqforum.com/threads/transmission-service-problems.14041/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Record the steering noise on your phone before the dealer visit. The noise can be difficult to reproduce on demand, and having a clear recording helps the technician understand exactly what you are hearing and where it is coming from.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 90,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ============================================================
  // 6. Hyundai Ioniq 5 N (2024)
  // ============================================================
  {
    id: "hyundai-ioniq-5-n-iccu-failure-2024",
    vehicleMatch: {
      years: [2024],
      make: "Hyundai",
      model: "Ioniq 5 N"
    },
    category: "electrical",
    title: "Integrated Charging Control Unit (ICCU) Failure",
    description: "The Ioniq 5 N shares the E-GMP platform's well-documented ICCU failure, which affects approximately 145,000 Hyundai and Kia EVs in the US (recall covering 2022-2024 Ioniq 5, including the N variant). The ICCU handles DC fast charging, AC charging, and 12V battery maintenance. It fails due to overvoltage spikes at the start and end of 12V charging cycles and thermal stress during charging and driving. When the ICCU fails, the vehicle displays a 'Check Power System' or 'Check Electrical System' warning, the 12V battery drains rapidly, and the vehicle may enter limp mode or become completely inoperable. Hyundai's initial recall fix did not fully resolve the issue, with new ICCU failures reported on previously-remedied vehicles.",
    solution: "Check your VIN against NHTSA recall 24V-868 at nhtsa.gov/recalls. If affected, schedule a dealer appointment for the ICCU replacement at no cost. Be aware that replacement ICCU parts have been backordered 2+ months at many dealers. If the 12V battery drains, the vehicle can sometimes be jump-started to reach the dealer, but drive directly there without stopping. After the ICCU replacement, Hyundai recommends not leaving the vehicle unplugged for extended periods. If your vehicle has already had the recall repair and the ICCU fails again, inform the dealer that Hyundai has acknowledged repeat failures and a second replacement may be needed.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Check Power System or Check Electrical System warning",
      "12V battery drains to critical level within hours",
      "Vehicle enters limp mode with limited speed",
      "DC fast charging fails or stops prematurely",
      "Vehicle will not start after sitting for 2-3 days"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "NHTSA Recall 24V-868 — Hyundai ICCU Failure",
        url: "https://static.nhtsa.gov/odi/rcl/2024/RCONL-24V868-8658.pdf"
      },
      {
        type: "nhtsa",
        title: "Hyundai ICCU Problem Explained — InsideEVs",
        url: "https://insideevs.com/features/752768/hyundai-kia-genesis-iccu-failure/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Install a 12V battery monitor (like the Battery Minder or FIXD sensor) to get early warning of ICCU failure. When the ICCU starts failing, it stops maintaining the 12V battery, and a monitor will alert you to abnormal voltage drops before the vehicle becomes undrivable.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If the dealer says ICCU parts are backordered, request a loaner vehicle. Hyundai's recall policy requires providing alternate transportation when safety recall parts are unavailable.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 320,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "hyundai-ioniq-5-n-brake-transition-noise-2024",
    vehicleMatch: {
      years: [2024],
      make: "Hyundai",
      model: "Ioniq 5 N"
    },
    category: "brakes",
    title: "Regenerative-to-Friction Brake Transition Clunk and Noise",
    description: "The Ioniq 5 N features aggressive regenerative braking (up to 0.6g) with its N-specific brake system, but owners report a clunking or clicking noise from the rear brakes during the transition between regenerative and friction braking. The sound occurs when the brake pedal crosses the threshold where mechanical brake pads engage after regenerative braking reaches its limit. The brake discs can also develop surface rust quickly when regenerative braking is used heavily (reducing friction brake use), leading to additional scraping noise on first brake application after the car has sat. The issue is exacerbated by the Ioniq 5 N's aggressive regen settings in N mode and e-pedal mode.",
    solution: "Light surface rust on brake discs is normal for EVs with strong regenerative braking and will clear within a few brake applications. For the regen-to-friction transition clunk, visit the dealer for a brake system inspection — the rear caliper mounting hardware or anti-rattle clips may need adjustment ($0-$200). Periodically use moderate friction braking (pressing the brake pedal firmly at lower speeds) to keep the disc surfaces clean and prevent excessive rust buildup. In N mode, the virtual gear shifting feature engages strong regen which reduces friction brake use — balance this with occasional conventional braking. If disc rust is severe, the dealer can resurface or replace the rotors ($200-$400 per axle).",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Clunking noise from rear brakes when transitioning from regen to friction",
      "Clicking sound when releasing or pressing brake pedal",
      "Scraping or grinding noise on first brake application after sitting",
      "Visible rust on brake disc surfaces after 2-3 days parked",
      "Pulsating sensation through brake pedal at low speeds"
    ],
    estimatedCost: { low: 0, high: 400 },
    citations: [
      {
        type: "owner-report",
        title: "Ioniq 5 Brake Noise Discussion — Ioniq Forum",
        url: "https://www.ioniqforum.com/threads/brake-noise.45927/"
      },
      {
        type: "owner-report",
        title: "Ioniq 5 Brake Disc Issue — Speak EV Forum",
        url: "https://www.speakev.com/threads/ioniq-5-brake-disc-issue.187544/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Once a week, make a few moderate-to-firm brake applications at 30-40 mph to scrub the disc surfaces clean. This prevents the rust buildup that causes scary-sounding scraping on your first stop. It only takes a minute and keeps the brakes in good shape.",
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
    id: "hyundai-ioniq-5-n-12v-battery-drain-2024",
    vehicleMatch: {
      years: [2024],
      make: "Hyundai",
      model: "Ioniq 5 N"
    },
    category: "electrical",
    title: "12V Auxiliary Battery Parasitic Drain",
    description: "Like the standard Ioniq 5, the Ioniq 5 N suffers from excessive parasitic draw on the 12V auxiliary battery from always-on systems including Bluelink telematics, the vehicle security system, and multiple electronic control modules. The smaller AGM 12V battery is more sensitive to deep discharge cycles than conventional batteries. The Ioniq 5 N's additional performance electronics (N-specific drive mode controller, electronic limited-slip differential controller) may place additional drain on the 12V system. Owners report dead 12V batteries after 3-7 days of the vehicle sitting unused, preventing the car from starting even with a fully charged main battery.",
    solution: "If the vehicle will sit for more than 3-4 days, either keep it plugged into a Level 1 or Level 2 charger (which maintains the 12V battery) or connect a 12V battery tender to the auxiliary battery. The 12V battery is located under the hood (front trunk area). Disable Bluelink remote features in the vehicle settings if not needed, as the telematics module is a significant parasitic draw. Replace the 12V battery proactively every 2-3 years with a high-quality AGM battery ($150-$250). After a dead 12V battery jump-start, drive for at least 30 minutes to allow the DC/DC converter to fully recharge the 12V system.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle will not power on after sitting 3-7 days",
      "Dashboard is completely dark when pressing start button",
      "Key fob unable to unlock doors remotely",
      "Bluelink app shows vehicle offline",
      "12V battery voltage drops below 11V after 48 hours unplugged"
    ],
    estimatedCost: { low: 25, high: 250 },
    citations: [
      {
        type: "owner-report",
        title: "12V Battery Drain Megathread — Ioniq5Forum.com",
        url: "https://www.ioniq5forum.com"
      },
      {
        type: "recall",
        title: "Hyundai ICCU and 12V Battery Issues — Consumer Reports",
        url: "https://www.consumerreports.org/cars/car-recalls-defects/hyundai-ioniq-kia-iccu-failure-tesla-a3038878758/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "The simplest prevention is to leave the car plugged in when not driving. Even a standard 120V Level 1 outlet is enough to keep the 12V battery maintained. If that is not possible, a NOCO Genius1 battery maintainer connected to the 12V battery terminals under the hood prevents dead battery surprises.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 185,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "hyundai-ioniq-5-n-motor-whine-highway-2024",
    vehicleMatch: {
      years: [2024],
      make: "Hyundai",
      model: "Ioniq 5 N"
    },
    category: "drivetrain",
    title: "High-Pitched Motor Whine at Highway Speeds",
    description: "The Ioniq 5 N's dual-motor AWD system can produce an objectionable high-pitched whine or electric motor noise at highway speeds (60+ mph), particularly from the front drive unit. While some motor noise is expected in performance EVs, the Ioniq 5 N's noise level has been reported as excessive compared to the standard Ioniq 5, potentially due to the N-specific motor tuning for higher output (641 hp combined). The noise is more noticeable with the virtual engine sound system (N Active Sound+) turned off, as there is no masking. Some owners have required front drive unit replacement to resolve the issue, but the noise can return on the replacement unit.",
    solution: "Visit a Hyundai dealer and have the technician road-test the vehicle at highway speed to verify the motor noise. The dealer should compare the noise level against Hyundai's specifications. If the noise exceeds specifications, the front drive unit may need replacement under warranty. Turning on the N Active Sound+ system at a moderate volume masks the motor whine during spirited driving. Adding sound-deadening material to the wheel wells and firewall ($100-$300 DIY, $500-$800 professionally installed) can also reduce the perceived noise level. Note that some motor whine is inherent to the high-output motors and may not be fully eliminable.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "High-pitched whine audible at 60+ mph",
      "Motor noise increases with speed, not throttle input",
      "Noise is most noticeable with N Active Sound turned off",
      "Sound appears to come from the front of the vehicle",
      "Noise may vary with temperature — louder when cold"
    ],
    estimatedCost: { low: 0, high: 800 },
    citations: [
      {
        type: "owner-report",
        title: "High Pitched Motor Noise at Motorway Speeds — Ioniq Forum",
        url: "https://www.ioniqforum.com/threads/high-pitched-motor-noise-at-motorway-speeds.39496/"
      },
      {
        type: "owner-report",
        title: "2024 Hyundai Ioniq 5 Consumer Reviews — Edmunds",
        url: "https://www.edmunds.com/hyundai/ioniq-5/2024/consumer-reviews/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Before spending money on sound deadening, try the N Active Sound+ system on the 'Ignition' setting at volume 3-4. Many owners find this provides enough auditory feedback to make the motor whine unnoticeable, while also giving the car a more engaging driving character.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 60,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  }
];

// ============================================================
// Check for duplicate IDs and add issues
// ============================================================
let added = 0;
let skipped = 0;
for (const issue of newIssues) {
  if (existingIds.has(issue.id)) {
    console.log(`SKIP (duplicate): ${issue.id}`);
    skipped++;
  } else {
    issuesData.issues.push(issue);
    existingIds.add(issue.id);
    console.log(`ADD: ${issue.id}`);
    added++;
  }
}

console.log(`\nIssues: ${added} added, ${skipped} skipped, total now ${issuesData.issues.length}`);

// ============================================================
// Write issues JSON
// ============================================================
fs.writeFileSync(issuesPath, JSON.stringify(issuesData, null, 2) + '\n');
console.log('Written known-issues.json');

// ============================================================
// Add YMMT entries
// ============================================================

// Helper to add model to YMMT maintaining alphabetical sort
function addModelToYear(yearStr, make, model, trims) {
  if (!ymmtData[yearStr]) {
    console.log(`WARNING: Year ${yearStr} not found in YMMT`);
    return;
  }
  if (!ymmtData[yearStr][make]) {
    console.log(`WARNING: Make ${make} not found in YMMT for ${yearStr}`);
    return;
  }
  if (ymmtData[yearStr][make][model]) {
    console.log(`SKIP YMMT: ${yearStr} ${make} ${model} already exists`);
    return;
  }

  // Add the model
  ymmtData[yearStr][make][model] = trims;

  // Re-sort models alphabetically within the make
  const sortedModels = {};
  const modelNames = Object.keys(ymmtData[yearStr][make]).sort();
  for (const m of modelNames) {
    sortedModels[m] = ymmtData[yearStr][make][m];
  }
  ymmtData[yearStr][make] = sortedModels;

  console.log(`ADD YMMT: ${yearStr} ${make} ${model} [${trims.join(', ')}]`);
}

// 1. GMC Hummer EV (2022-2024)
for (const year of ['2022', '2023', '2024']) {
  const trims = year === '2022'
    ? ['Edition 1', 'EV3X']
    : year === '2023'
    ? ['EV2X', 'EV3X']
    : ['EV2X', 'EV3X', 'EV SUV 2X', 'EV SUV 3X'];
  addModelToYear(year, 'GMC', 'Hummer EV', trims);
}

// 2. Honda Clarity (2017-2021)
for (const year of ['2017', '2018', '2019', '2020', '2021']) {
  const trims = year === '2017'
    ? ['Electric', 'Fuel Cell']
    : ['Plug-In Hybrid', 'Plug-In Hybrid Touring'];
  addModelToYear(year, 'Honda', 'Clarity', trims);
}

// 3. Honda Prologue (2024)
addModelToYear('2024', 'Honda', 'Prologue', ['EX', 'Touring']);

// 4. Hyundai Nexo (2019-2024)
for (const year of ['2019', '2020', '2021', '2022', '2023', '2024']) {
  const trims = year <= '2021'
    ? ['Blue', 'Limited']
    : ['Blue', 'Limited'];
  addModelToYear(year, 'Hyundai', 'Nexo', trims);
}

// 5. Hyundai Ioniq (original, 2017-2022)
for (const year of ['2017', '2018', '2019', '2020', '2021', '2022']) {
  let trims;
  if (year <= '2019') {
    trims = ['Blue', 'Limited', 'SEL', 'Plug-In Hybrid', 'Electric'];
  } else {
    trims = ['Blue', 'Limited', 'SE', 'SEL', 'Plug-In Hybrid', 'Electric'];
  }
  addModelToYear(year, 'Hyundai', 'Ioniq', trims);
}

// 6. Hyundai Ioniq 5 N (2024)
addModelToYear('2024', 'Hyundai', 'Ioniq 5 N', ['N']);

// ============================================================
// Write YMMT JSON
// ============================================================
fs.writeFileSync(ymmtPath, JSON.stringify(ymmtData, null, 2) + '\n');
console.log('Written ymmt.json');

console.log('\nDone!');
