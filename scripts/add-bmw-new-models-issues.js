const fs = require('fs');
const path = require('path');

// ─── Load existing data ───────────────────────────────────────────
const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

const issuesData = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
const ymmtData = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// ─── Check for duplicate IDs ──────────────────────────────────────
const existingIds = new Set(issuesData.issues.map(i => i.id));

const newIssues = [

  // ═══════════════════════════════════════════════════════════════
  // BMW M240i (2017-2024) - B58 3.0L Turbo Inline-6
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bmw-m240i-b58-coolant-loss-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M240i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "cooling",
    title: "Coolant Loss from Expansion Tank and Water Pump Failure",
    description: "The B58 engine in the M240i is prone to coolant loss caused by cracks in the plastic coolant expansion tank and premature electric water pump failure. The thermoplastic expansion tank degrades under repeated heat cycles, and in turbocharged engines where under-hood temperatures run high, this aging process accelerates. The electric water pump can fail internally and leak coolant from the pump housing or seals, sometimes before 50,000 miles. A BMW TSB addresses the coolant vent line on the cylinder head that cannot handle excessive high temperatures over the lifetime of the part.",
    solution: "Replace the coolant expansion tank with an updated unit at first sign of cracking or weeping. Proactively replace the electric water pump before 60,000 miles. Replace the coolant vent line on the cylinder head per TSB. Inspect all plastic coolant components during every oil service. Consider upgrading to an aluminum expansion tank from aftermarket suppliers like Mishimoto.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Coolant level dropping without visible external leak",
      "Low coolant warning light on dashboard",
      "Sweet smell from engine bay",
      "Steam or coolant pooling under vehicle after parking",
      "Engine overheating warning",
      "Coolant residue on expansion tank or water pump housing"
    ],
    estimatedCost: { low: 400, high: 1200 },
    citations: [
      {
        type: "tsb",
        title: "BMW TSB - Replace Coolant Vent Line on Cylinder Head",
        url: "https://static.nhtsa.gov/odi/tsbs/2022/MC-10212788-9999.pdf"
      },
      {
        type: "nhtsa",
        title: "BMW Recall 18V-248: Electronic Auxiliary Water Pump",
        url: "https://static.nhtsa.gov/odi/rcl/2018/RCRIT-18V248-8708.pdf"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "Do not ignore low coolant warnings - the B58 can overheat and warp the head quickly. Pull over and shut off immediately if temperature spikes.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Keep a gallon of BMW-approved coolant (blue) in the trunk. Check expansion tank level monthly and look for hairline cracks in the plastic during oil changes.",
        upvotes: 0
      },
      {
        type: "part",
        content: "FCP Euro stocks OEM Mahle water pumps and expansion tanks with a lifetime replacement guarantee - great for this known failure item.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 420,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P26B4", "P26B5"]
  },

  {
    id: "bmw-m240i-b58-valve-cover-gasket-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M240i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "engine",
    title: "Valve Cover Gasket Oil Leak",
    description: "The B58 engine's valve cover gasket is prone to degradation and oil leaks, typically developing around 60,000-100,000 miles. The rubber gasket material shrinks and dries out through repeated heat cycles, allowing oil to seep and eventually drip down the sides of the engine. In more severe cases, oil can leak into the spark plug tubes, causing misfires and potential ignition coil damage.",
    solution: "Replace the valve cover gasket with an updated BMW part. If oil has entered spark plug tubes, replace spark plugs and inspect ignition coils. Clean all oil residue from the engine block. Some owners replace the entire valve cover assembly as the integrated PCV valve can also fail.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Burning oil smell from engine bay, especially after highway driving",
      "Visible oil seepage around valve cover edges",
      "Oil dripping on exhaust manifold causing smoke",
      "Oil pooling in spark plug wells causing misfires",
      "Low oil level between changes"
    ],
    estimatedCost: { low: 500, high: 900 },
    citations: [
      {
        type: "owner_forum",
        title: "Bimmerpost - B58 Valve Cover Gasket Leak Discussion",
        url: "https://f30.bimmerpost.com/forums/showthread.php?t=1915272"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "When replacing the valve cover gasket, also replace the spark plug tube seals and inspect the PCV valve. It's all accessible at the same time and saves labor.",
        upvotes: 0
      },
      {
        type: "part",
        content: "Use the OEM Victor Reinz gasket set - aftermarket gaskets tend to shrink faster on turbocharged engines due to higher heat.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 310,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0301", "P0302", "P0303", "P0304", "P0305", "P0306"]
  },

  {
    id: "bmw-m240i-b58-vanos-solenoid-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M240i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "engine",
    title: "VANOS Solenoid O-Ring Failure",
    description: "The B58 engine's VANOS solenoid o-rings degrade due to wear and high temperatures, causing oil leaks and variable valve timing faults. When the o-rings fail, oil pressure to the VANOS system is compromised, leading to rough idle, reduced power, and check engine lights. This is a continuation of a problem that has affected multiple generations of BMW inline-6 engines.",
    solution: "Replace the VANOS solenoid o-rings with updated silicone o-rings. Clean the solenoid screens of any debris. If solenoids are contaminated, replace the entire solenoid unit. Use BMW-approved 0W-30 oil and maintain proper oil change intervals to reduce o-ring degradation.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rough idle, especially when cold",
      "Reduced power and acceleration hesitation",
      "Check engine light with VANOS codes",
      "Oil leak around VANOS solenoid area on top of engine",
      "Engine stalling at low RPM"
    ],
    estimatedCost: { low: 150, high: 500 },
    citations: [
      {
        type: "owner_forum",
        title: "BimmerFest - B58 VANOS Solenoid O-Ring Failure",
        url: "https://www.bimmerfest.com/threads/new-to-forum-is-a-used-m340i-worth-a-purchase.1441443/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "O-ring replacement is a DIY-friendly job. Buy a full o-ring kit from FCP Euro or ECS Tuning and replace all VANOS solenoid o-rings at once. Takes about 30 minutes with basic tools.",
        upvotes: 0
      },
      {
        type: "warning",
        content: "Do not ignore VANOS codes - continued driving with failed o-rings can cause oil starvation to the VANOS unit, leading to much more expensive repairs.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 275,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0011", "P0012", "P0014", "P0015", "P0021", "P0022"]
  },

  {
    id: "bmw-m240i-b58-charge-pipe-2017",
    vehicleMatch: {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M240i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "engine",
    title: "Plastic Charge Pipe Failure Under Boost",
    description: "The B58 engine uses a plastic charge pipe to route compressed air from the turbocharger to the throttle body. Under sustained high boost conditions, the factory plastic charge pipe can crack, split, or blow off, resulting in an immediate and total loss of boost pressure. This failure can occur on completely stock vehicles as the plastic degrades from repeated heat cycling over time, but is accelerated by any ECU tune that increases boost pressure.",
    solution: "Replace the factory plastic charge pipe with an upgraded aluminum aftermarket unit from manufacturers like Burger Motorsports, VRSF, or FTP Motorsport. If the failure occurs on a stock car, BMW may cover repair under warranty. After replacement, inspect the intercooler boots and all charge air connections for damage.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Sudden and complete loss of boost pressure",
      "Loud pop or hissing sound from engine bay",
      "Check engine light with boost pressure codes",
      "Significant power loss, especially above 3,000 RPM",
      "Turbo whistle or whooshing noise under acceleration"
    ],
    estimatedCost: { low: 200, high: 600 },
    citations: [
      {
        type: "owner_forum",
        title: "BabyBMW Forum - F22 M240i Boost Leak / Charge Pipe Leak",
        url: "https://www.babybmw.net/threads/f22-m240i-boost-leak-charge-pipe-leak.156208/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Upgrade to an aluminum charge pipe proactively - it's a $200-300 part and 1-hour install. Much cheaper than being stranded when the plastic one fails at 40k miles.",
        upvotes: 0
      },
      {
        type: "warning",
        content: "If you have any ECU tune increasing boost, consider the aluminum charge pipe mandatory. The stock plastic pipe is not rated for increased boost pressures.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 340,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0299", "P0234"]
  },

  // ═══════════════════════════════════════════════════════════════
  // BMW iX3 (2022-2024) - Electric SUV
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bmw-ix3-software-infotainment-glitches-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "BMW",
      model: "iX3"
    },
    category: "electrical",
    title: "iDrive Infotainment Software Freezes and Reboots",
    description: "The BMW iX3 suffers from recurring infotainment system software glitches including frozen screens, laggy response times, spontaneous reboots, and unresponsive touchscreen inputs. These issues can interfere with navigation, media playback, smartphone connectivity via Apple CarPlay/Android Auto, and climate control settings that are routed through the iDrive screen. BMW has released multiple OTA software updates to address these issues, but some owners report problems persisting across updates.",
    solution: "Perform a soft reset of the iDrive system by holding the volume/power knob for 30 seconds. Check for and install the latest BMW software update via OTA or at a dealer. If issues persist, the dealer may need to reflash the head unit firmware or replace the head unit hardware. Ensure the 12V battery is in good health, as low voltage can cause software instability.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "iDrive touchscreen freezing or becoming unresponsive",
      "System spontaneously rebooting while driving",
      "Apple CarPlay or Android Auto disconnecting repeatedly",
      "Navigation losing GPS signal or displaying incorrect position",
      "Climate control settings resetting to defaults",
      "Backup camera feed delayed or showing black screen"
    ],
    estimatedCost: { low: 0, high: 300 },
    citations: [
      {
        type: "owner_forum",
        title: "xBimmers - iX3 Issues Summary",
        url: "https://x3.xbimmers.com/forums/showthread.php?t=1927307"
      },
      {
        type: "nhtsa",
        title: "Electrive - Software Issues Plague BMW iX3",
        url: "https://www.electrive.com/2021/07/10/software-issues-plague-bmw-ix3/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Always keep iDrive software updated. Check for OTA updates regularly in Settings > Software Update. Many glitches are resolved with newer firmware versions.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If the screen freezes, hold the volume knob for 30 seconds to force a reboot. This resolves most transient issues without a dealer visit.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  {
    id: "bmw-ix3-12v-battery-drain-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "BMW",
      model: "iX3"
    },
    category: "electrical",
    title: "12V Auxiliary Battery Drain and Failure",
    description: "The BMW iX3 can experience premature 12V auxiliary battery drain, particularly when the vehicle sits unused for extended periods. The always-on telematics, remote connectivity features, and background software processes draw parasitic current from the 12V battery. When the 12V battery voltage drops too low, the vehicle may fail to power on, refuse to unlock, or display multiple warning messages. This is a common issue across BMW's electric vehicle lineup due to the high parasitic draw of connected services.",
    solution: "Replace the 12V AGM battery with an OEM-specification unit. If the vehicle will sit unused for more than 5-7 days, connect a BMW-approved battery tender. Disable unnecessary connected services in the iDrive settings to reduce parasitic drain. Have the dealer check for software updates that optimize sleep mode power management.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle fails to unlock or power on after sitting for several days",
      "Multiple warning lights and error messages on startup",
      "Remote start or BMW Connected app functions failing",
      "Clock resetting to incorrect time",
      "Infotainment system taking excessively long to boot"
    ],
    estimatedCost: { low: 200, high: 450 },
    citations: [
      {
        type: "owner_forum",
        title: "xBimmers - iX3 Issues Summary: 12V Battery Drain",
        url: "https://x3.xbimmers.com/forums/showthread.php?t=1927307"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Keep a CTEK or Battery Tender Plus connected when the car sits for more than a week. The iX3's connected services drain the 12V battery surprisingly fast.",
        upvotes: 0
      },
      {
        type: "warning",
        content: "A dead 12V battery can prevent the high-voltage system from initializing, making the car completely inoperable. It must be jump-started or the 12V battery replaced before the car will function.",
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
    id: "bmw-ix3-regen-braking-inconsistency-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "BMW",
      model: "iX3"
    },
    category: "brakes",
    title: "Regenerative Braking Lag and Inconsistency",
    description: "Some iX3 owners report inconsistent regenerative braking behavior, where lifting off the accelerator results in delayed or unpredictable deceleration. The regenerative braking system can feel inconsistent depending on battery state of charge, temperature, and driving mode. When the battery is near full charge or in very cold weather, regen braking force is significantly reduced, which can catch drivers off guard if they rely on one-pedal driving. This is a characteristic of the regen system design rather than a defect, but the lack of consistent feel is a common complaint.",
    solution: "Familiarize yourself with how regen braking changes based on battery state of charge and temperature. Use the paddle shifters to manually adjust regen levels. Check for BMW software updates that improve regen calibration. In cold weather or with a fully charged battery, rely more on the friction brakes and do not assume regen will provide full deceleration.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Delayed deceleration when lifting off accelerator pedal",
      "Inconsistent regen braking force between drives",
      "Reduced regen braking in cold weather or with full battery",
      "Jerky transition between regen and friction braking",
      "Regen braking icon showing reduced capacity on dashboard"
    ],
    estimatedCost: { low: 0, high: 150 },
    citations: [
      {
        type: "owner_forum",
        title: "MyCarly - BMW iX3 Common Problems: Regenerative Braking",
        url: "https://www.mycarly.com/community/brands/bmw/ix3/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "In winter, pre-condition the battery before driving to restore full regen capability. The iX3 allows scheduling cabin and battery preheating through the BMW app.",
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
    id: "bmw-ix3-drivetrain-wire-harness-2022",
    vehicleMatch: {
      years: [2022, 2023, 2024],
      make: "BMW",
      model: "iX3"
    },
    category: "electrical",
    title: "Drivetrain Warning from Wire Harness Connection Fault",
    description: "Some iX3 owners report intermittent 'Drivetrain Malfunction' warnings that appear on the dashboard without any apparent mechanical issue. Dealer diagnosis often traces the problem to a faulty wire harness connection to the power pedal assembly (accelerator pedal position sensor). The connector can develop a poor contact due to vibration or corrosion, sending erratic signals to the drive controller and triggering a drivetrain fault that may put the vehicle into reduced power mode.",
    solution: "Have the dealer inspect and reseat the wire harness connection to the accelerator pedal position sensor. If the connector is corroded or damaged, replace the harness section. BMW has released updated connector clips for improved retention. A software update may also recalibrate the pedal sensor tolerance to prevent nuisance warnings from marginal connections.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Intermittent 'Drivetrain Malfunction' warning on dashboard",
      "Vehicle entering reduced power or limp mode unexpectedly",
      "Accelerator pedal response feeling inconsistent",
      "Warning clears after restarting the vehicle",
      "Multiple drivetrain-related fault codes stored in ECU"
    ],
    estimatedCost: { low: 100, high: 500 },
    citations: [
      {
        type: "owner_forum",
        title: "Car Talk Community - BMW iX3 Motor/Transmission Issue",
        url: "https://community.cartalk.com/t/bmws-ix3-motor-cause-transmission-issue/191521"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "If you get an intermittent drivetrain warning that clears on restart, have the dealer check the accelerator pedal harness connector first before authorizing expensive drivetrain diagnostics.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 95,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ═══════════════════════════════════════════════════════════════
  // BMW M340i (2020-2024) - B58 3.0L Turbo Inline-6
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bmw-m340i-b58-coolant-loss-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M340i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "cooling",
    title: "Coolant Loss from Expansion Tank and Water Pump",
    description: "The M340i's B58 engine experiences the same coolant loss issues as other B58-powered BMWs, but the M340i's higher sustained performance driving tends to accelerate the problem. The plastic coolant expansion tank develops hairline cracks from heat cycling, and the electric water pump can fail prematurely. BMW issued a TSB for the coolant vent line on the cylinder head that deteriorates under high temperatures. Many M340i owners report needing to top off coolant more frequently than expected, even on low-mileage vehicles.",
    solution: "Replace the coolant expansion tank at first sign of cracking. Proactively replace the electric water pump before 60,000 miles. Replace the coolant vent line per BMW TSB. Use only BMW-approved blue coolant. Monitor coolant level monthly and pressure test the cooling system at every major service.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Coolant level dropping between services",
      "Low coolant warning on iDrive",
      "Sweet antifreeze smell from engine compartment",
      "Visible coolant residue or white deposits around expansion tank",
      "Engine temperature gauge reading higher than normal",
      "Steam from engine bay in severe cases"
    ],
    estimatedCost: { low: 400, high: 1200 },
    citations: [
      {
        type: "tsb",
        title: "BMW TSB - Replace Coolant Vent Line on Cylinder Head",
        url: "https://static.nhtsa.gov/odi/tsbs/2022/MC-10212788-9999.pdf"
      },
      {
        type: "owner_forum",
        title: "Bimmerpost G20 - B58 Coolant Loss Thread",
        url: "https://f30.bimmerpost.com/forums/showthread.php?t=1915272"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "The B58 can go from 'low coolant' to 'overheated' very quickly. If you see the warning, pull over immediately. Driving even 5 minutes with overheating can warp the aluminum head.",
        upvotes: 0
      },
      {
        type: "part",
        content: "FCP Euro carries the OEM Mahle water pump with their lifetime replacement guarantee. Worth every penny for this known failure item.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 380,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P26B4", "P26B5"]
  },

  {
    id: "bmw-m340i-b58-hpfp-failure-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M340i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "fuel",
    title: "High-Pressure Fuel Pump (HPFP) Failure",
    description: "The B58 engine's high-pressure fuel pump can fail, though at lower rates than the older N54 engine. When the HPFP fails, fuel pressure drops below the minimum required for proper direct injection, causing long cranking, rough idle, misfires, and in severe cases, the engine stalling and entering limp mode. Failures are more common in cold weather when fuel demands are higher, and can be exacerbated by ethanol-blended fuels.",
    solution: "Replace the high-pressure fuel pump with the latest revised BMW part number. Verify the low-pressure fuel pump is providing adequate feed pressure. Use top-tier fuel and avoid running the tank below 1/4 to reduce strain on the fuel system. If under warranty, BMW will cover HPFP replacement.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Long cranking before engine starts, especially in cold weather",
      "Engine stalling at idle or low speed",
      "Check engine light with fuel pressure codes",
      "Noticeable loss of power during acceleration",
      "Rough idle and misfires"
    ],
    estimatedCost: { low: 600, high: 1500 },
    citations: [
      {
        type: "owner_forum",
        title: "Bimmerpost G20 - M340i Common Issues Before Buying",
        url: "https://g20.bimmerpost.com/forums/showthread.php?t=2038910"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Log fuel pressure data with an OBD scanner like the BimmerLink app. Fuel pressure below 150 bar at full load is a sign the HPFP is failing before you get a check engine light.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "The B58 HPFP is significantly more reliable than the N54's notorious pump. Most B58 HPFP failures occur on tuned cars - stock cars rarely have this issue before 80k miles.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 195,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0087", "P0088", "P0190", "P0191"]
  },

  {
    id: "bmw-m340i-b58-oil-filter-disintegration-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M340i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "engine",
    title: "Oil Filter Disintegration in Housing",
    description: "The B58 engine has a documented tendency for paper oil filters to shred and break apart during normal use. As oil passes through the filter under pressure, the filter media can separate from the end caps and tear into multiple pieces. Shredded filter material can deposit paper fragments in the oil filter housing and potentially circulate through the oil system. This is more common with non-OEM filters but has been reported with genuine BMW filters as well.",
    solution: "Use only genuine BMW or Mann-branded oil filters (Mann is the OEM supplier). Change oil and filter every 5,000-7,000 miles rather than BMW's recommended 10,000-mile interval. When removing the old filter, inspect it carefully for signs of deterioration. If filter fragments are found in the housing, flush the housing thoroughly before installing the new filter.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Oil filter found shredded or torn during oil change",
      "Paper debris visible in oil filter housing",
      "Low oil pressure warning (if fragments restrict flow)",
      "Oil appearing darker than expected between changes",
      "Fine metal particles in oil (if unfiltered oil reaches bearings)"
    ],
    estimatedCost: { low: 50, high: 200 },
    citations: [
      {
        type: "owner_forum",
        title: "SlashGear - Common Problems With BMW B58 Engines According To Owners",
        url: "https://www.slashgear.com/1678547/bmw-b58-engine-common-problems-issues/"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "Never use cheap aftermarket oil filters on the B58. The OEM Mann filter is only $8-12 and specifically engineered for the pressure and flow characteristics of this engine.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Shorten your oil change interval to 5,000-7,000 miles regardless of what BMW's oil life monitor says. The 10,000-mile interval is too long for the B58, especially in performance driving.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 165,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  {
    id: "bmw-m340i-b58-carbon-buildup-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M340i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "engine",
    title: "Intake Valve Carbon Buildup",
    description: "As a direct-injection engine, the B58 in the M340i does not have fuel washing over the intake valves, leading to gradual carbon deposit buildup on the valve backs. Oil vapors from the crankcase ventilation system deposit carbon that restricts airflow and reduces performance. Symptoms typically become noticeable after 50,000-80,000 miles, with rough idle, reduced throttle response, and minor misfires. The M340i's higher boost pressures can accelerate carbon accumulation compared to non-M B58 applications.",
    solution: "Walnut blast the intake valves every 50,000-60,000 miles. This involves removing the intake manifold and blasting walnut shell media at the valve backs to remove carbon deposits. Some owners use catch cans to reduce oil vapor entering the intake. BMW's official position is that carbon buildup is normal for direct-injection engines.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rough or uneven idle developing gradually",
      "Reduced throttle response and power",
      "Slight hesitation during acceleration from low RPM",
      "Minor misfires at idle, especially when cold",
      "Decreased fuel economy over time"
    ],
    estimatedCost: { low: 400, high: 800 },
    citations: [
      {
        type: "owner_forum",
        title: "Adelaide Auto Pro - BMW M340i Common Problems: Carbon Buildup",
        url: "https://www.adelaideautopro.com.au/post/common-problems-of-the-bmw-3-series-g20-m340i-a-comprehensive-guide"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Schedule a walnut blast at 50k miles as preventive maintenance. It costs $400-600 at an independent BMW shop and makes a huge difference in how the engine runs.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "An oil catch can from Burger Motorsports or Mishimoto can significantly reduce carbon buildup by catching oil vapors before they enter the intake. Not a complete solution but helps extend time between walnut blasts.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 290,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303"]
  },

  {
    id: "bmw-m340i-b58-wastegate-rattle-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "BMW",
      model: "M340i",
      engines: ["B58 3.0L Turbo I6"]
    },
    category: "engine",
    title: "Turbo Wastegate Rattle at Idle",
    description: "The B58 engine's electronic wastegate actuator can develop play over time, producing a characteristic rattling or buzzing noise at idle and during deceleration. The wastegate flapper valve develops clearance within its housing, causing it to vibrate at certain RPMs. While often described as just an annoyance, a severely worn wastegate can lead to boost control issues, over-boost or under-boost conditions, and eventually check engine lights for boost deviation faults.",
    solution: "Have the wastegate actuator inspected for excessive play. Minor rattle without fault codes can be monitored. If boost control faults develop, replace the turbocharger wastegate actuator. In severe cases, the entire turbocharger assembly may need replacement. BMW may cover under warranty if fault codes are present.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Rattling or buzzing noise at idle from turbocharger area",
      "Metallic vibration sound during deceleration",
      "Check engine light with boost control codes (advanced cases)",
      "Intermittent boost fluctuations at steady throttle",
      "Noise more pronounced in cold weather"
    ],
    estimatedCost: { low: 200, high: 2000 },
    citations: [
      {
        type: "owner_forum",
        title: "Oriona2 - BMW M340i Common Problems: Wastegate Rattle",
        url: "https://oriona2.com/bmw-m340i-common-problems/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "A minor wastegate rattle without any codes is cosmetic - many B58 owners live with it for years without issues. Only worry if you get boost-related fault codes.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 220,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0299", "P0234", "P0236"]
  },

  // ═══════════════════════════════════════════════════════════════
  // BMW M3 CS (2024) - S58 3.0L Twin-Turbo Inline-6
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bmw-m3cs-s58-charge-pipe-crack-2024",
    vehicleMatch: {
      years: [2024],
      make: "BMW",
      model: "M3 CS",
      engines: ["S58 3.0L Twin-Turbo I6"]
    },
    category: "engine",
    title: "S58 Plastic Charge Pipe Cracking Under Boost",
    description: "The M3 CS uses the same Y-shaped plastic charge pipe found on the standard G80 M3, connecting both turbochargers to the throttle body. Despite the M3 CS producing 543 hp (higher than the standard M3 Competition's 503 hp), BMW retained the factory plastic charge pipe. Under sustained high-boost conditions, particularly during track use which the M3 CS is designed for, the plastic charge pipe can develop hairline cracks or blow off entirely. Heat cycling degrades the plastic over time, and the M3 CS's higher boost pressures accelerate this failure mode.",
    solution: "Replace the factory plastic charge pipe with an aluminum aftermarket unit from do88, FTP Motorsport, or VRSF. These direct-fit replacements handle higher temperatures and pressures without risk of cracking. If the car is under warranty and the failure occurs on stock tune, BMW should cover the repair. Inspect the charge pipe during every service and before track days.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Sudden total loss of boost pressure, especially at high RPM",
      "Loud pop or hissing from engine bay under acceleration",
      "Check engine light with boost pressure deviation codes",
      "Dramatic power loss above 3,000 RPM",
      "Turbo compressor surge noise"
    ],
    estimatedCost: { low: 250, high: 700 },
    citations: [
      {
        type: "owner_forum",
        title: "Bimmerpost G80 - S58 Charge Pipe Discussion",
        url: "https://g80.bimmerpost.com/forums/showthread.php?t=1810104"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "If you plan to track your M3 CS (which is what it's built for), replace the plastic charge pipe with aluminum BEFORE your first track day. A blown charge pipe at 150 mph is not something you want to experience.",
        upvotes: 0
      },
      {
        type: "part",
        content: "The do88 cast aluminum charge pipe is the go-to upgrade. CNC-machined flanges, perfect OEM fitment, and rated for far higher boost than the S58 can produce.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 85,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0299", "P0234"]
  },

  {
    id: "bmw-m3cs-s58-carbon-buildup-2024",
    vehicleMatch: {
      years: [2024],
      make: "BMW",
      model: "M3 CS",
      engines: ["S58 3.0L Twin-Turbo I6"]
    },
    category: "engine",
    title: "S58 Intake Valve Carbon Buildup",
    description: "The S58 twin-turbo engine uses direct injection exclusively, meaning no fuel washes over the intake valves to keep them clean. Oil vapors from the crankcase ventilation system deposit carbon on the valve backs over time, restricting airflow and reducing performance. The M3 CS's higher boost pressures and more aggressive driving style can accelerate carbon accumulation. While the S58 has improved crankcase ventilation over the older S55, carbon buildup remains an inevitable maintenance item on all direct-injection engines.",
    solution: "Schedule walnut blast cleaning of the intake valves at 40,000-50,000 mile intervals. Install an oil catch can to reduce oil vapor entering the intake system. Use high-quality synthetic oil meeting BMW LL-01 specification and change at 5,000-7,000 mile intervals. Allow the engine to fully warm up before high-boost driving to ensure proper oil vapor management.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Gradual loss of throttle response and power",
      "Rough idle that develops over time",
      "Slight misfires at idle, especially when cold",
      "Reduced fuel efficiency compared to when new",
      "Hesitation during low-RPM acceleration"
    ],
    estimatedCost: { low: 500, high: 900 },
    citations: [
      {
        type: "owner_forum",
        title: "M3cutters - G80 Common Problems: Carbon Buildup",
        url: "https://forums.m3cutters.co.uk/threads/g80-common-problems.258526/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Budget for walnut blasting every 40-50k miles as mandatory maintenance on the S58. Independent BMW shops charge $500-700 for the service.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 70,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304", "P0305", "P0306"]
  },

  {
    id: "bmw-m3cs-idrive-software-2024",
    vehicleMatch: {
      years: [2024],
      make: "BMW",
      model: "M3 CS",
      engines: ["S58 3.0L Twin-Turbo I6"]
    },
    category: "electrical",
    title: "iDrive 8 Software Glitches and Screen Blackouts",
    description: "The M3 CS uses BMW's iDrive 8 system with a large curved display, which some owners report experiencing random screen blackouts, system reboots, and software glitches. Issues include the screen going completely black while driving, stereo cutting out mid-playback, phone connectivity failures with Apple CarPlay/Android Auto, and instrument cluster warnings that resolve on restart. These issues are more common on early production vehicles and are typically resolved through BMW software updates.",
    solution: "Check for and install the latest BMW iDrive 8 software updates, which can be delivered over-the-air or at a dealer. Perform a soft reset by holding the iDrive controller button for 30 seconds. If screen blackouts persist, the dealer may need to replace the head unit or update the gateway module firmware. Ensure the 12V battery is in good condition, as low voltage can trigger software instability.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "iDrive screen going completely black while driving",
      "Audio system cutting out and requiring restart",
      "Apple CarPlay/Android Auto disconnecting frequently",
      "Instrument cluster showing spurious warning messages",
      "Touch screen unresponsive or laggy"
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      {
        type: "owner_forum",
        title: "Bimmerpost G80 - Three Issues with My New M4",
        url: "https://g80.bimmerpost.com/forums/showthread.php?t=1810342"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Keep iDrive software updated via OTA. BMW releases frequent patches that fix the most annoying glitches. Check Settings > Software Update weekly for the first few months of ownership.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 60,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ═══════════════════════════════════════════════════════════════
  // BMW M4 CS (2024) - S58 3.0L Twin-Turbo Inline-6
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bmw-m4cs-s58-charge-pipe-crack-2024",
    vehicleMatch: {
      years: [2024],
      make: "BMW",
      model: "M4 CS",
      engines: ["S58 3.0L Twin-Turbo I6"]
    },
    category: "engine",
    title: "S58 Plastic Charge Pipe Cracking Under Boost",
    description: "The M4 CS shares the same S58 engine and Y-shaped plastic charge pipe as the M3 CS, producing 543 hp with higher boost pressures than the standard M4 Competition. The factory plastic charge pipe is the weak link in the forced induction system, prone to developing cracks or blowing off under sustained high-boost conditions. Track use, which the M4 CS is designed for, significantly accelerates this failure. The plastic degrades from heat cycling even on stock-tune vehicles over time.",
    solution: "Proactively replace the factory plastic charge pipe with an aluminum aftermarket unit from do88, FTP Motorsport, or VRSF before any track use. These bolt-on replacements are rated for boost pressures well beyond what the S58 produces. Inspect the charge pipe at every service interval for signs of stress cracking or discoloration.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Sudden complete loss of boost at high RPM",
      "Loud pop followed by hissing from under the hood",
      "Check engine light with boost deviation fault codes",
      "Dramatic power reduction requiring engine restart",
      "Turbo compressor surge or flutter noise"
    ],
    estimatedCost: { low: 250, high: 700 },
    citations: [
      {
        type: "owner_forum",
        title: "Bimmerpost G80 - S58 Charge Pipe Reliability Discussion",
        url: "https://g80.bimmerpost.com/forums/showthread.php?t=1810104"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "The M4 CS comes with a track-focused setup from the factory. If you're using it as intended on track, the aluminum charge pipe upgrade should be your very first modification.",
        upvotes: 0
      },
      {
        type: "part",
        content: "FTP Motorsport and do88 both make excellent aluminum charge pipes for the S58. Both include all mounting hardware and silicone couplers for a direct OEM replacement.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 75,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0299", "P0234"]
  },

  {
    id: "bmw-m4cs-s58-carbon-buildup-2024",
    vehicleMatch: {
      years: [2024],
      make: "BMW",
      model: "M4 CS",
      engines: ["S58 3.0L Twin-Turbo I6"]
    },
    category: "engine",
    title: "S58 Intake Valve Carbon Buildup",
    description: "Like all S58-powered BMWs, the M4 CS's direct-injection-only fuel system means no fuel washes over the intake valves. Carbon deposits from crankcase ventilation oil vapors accumulate on the back of the intake valves over time, gradually restricting airflow. The M4 CS's aggressive driving profile and higher boost pressures may accelerate carbon accumulation. Symptoms typically develop gradually and become noticeable after 40,000-60,000 miles of driving.",
    solution: "Walnut blast the intake valves every 40,000-50,000 miles. Consider installing an oil catch can to reduce oil vapor ingestion. Maintain strict 5,000-7,000 mile oil change intervals with BMW LL-01 approved oil. Allow full engine warmup before spirited driving to ensure proper crankcase ventilation operation.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Progressive loss of power and throttle response",
      "Increasingly rough idle over months of driving",
      "Cold-start misfires that diminish once warmed up",
      "Decreased fuel economy compared to when new",
      "Slight hesitation during tip-in throttle at low RPM"
    ],
    estimatedCost: { low: 500, high: 900 },
    citations: [
      {
        type: "owner_forum",
        title: "Engine Explained - S58 Engine Problems: Carbon Buildup",
        url: "https://www.engineexplained.com/bmw-s58-engine-problems-a-comprehensive-review/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Budget for walnut blasting every 40-50k miles. It's not a defect - it's inherent to direct injection. Independent BMW specialists charge $500-700 for the full service.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 65,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304", "P0305", "P0306"]
  },

  {
    id: "bmw-m4cs-brake-wear-track-2024",
    vehicleMatch: {
      years: [2024],
      make: "BMW",
      model: "M4 CS",
      engines: ["S58 3.0L Twin-Turbo I6"]
    },
    category: "brakes",
    title: "Rapid Brake Pad and Rotor Wear from Track Use",
    description: "The M4 CS uses large multi-piston calipers with performance-oriented pad compounds designed for aggressive driving and track use. Front brake pads can wear out in as few as 8,000-15,000 miles with regular track use, and rotors may need replacement every 25,000-35,000 miles. The standard iron rotors are prone to heat-related warping after sustained track sessions. Even in street-only use, the aggressive pad compound wears faster than typical luxury car brakes, with front pads lasting 20,000-30,000 miles.",
    solution: "Inspect brake pads and rotors before and after every track day. Consider upgrading to aftermarket performance pads like Pagid RSC or Hawk DTC-70 for track use, and switch to street pads for daily driving. For frequent track users, the optional carbon ceramic brake package significantly extends rotor life. Use high-temperature brake fluid (DOT 5.1 or racing fluid) and flush before every track season.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Brake pad wear indicator light activating prematurely",
      "Brake dust accumulation on wheels much heavier than expected",
      "Brake pedal pulsation or vibration indicating rotor warping",
      "Squealing or grinding noise from brakes during moderate braking",
      "Reduced brake feel or longer stopping distances after track sessions"
    ],
    estimatedCost: { low: 800, high: 3500 },
    citations: [
      {
        type: "owner_forum",
        title: "M3cutters - G80 Common Problems: Brake Wear",
        url: "https://forums.m3cutters.co.uk/threads/g80-common-problems.258526/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Keep a set of track pads and street pads. Swap to track pads before track days and back to street pads after. This extends the life of both sets significantly.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "Budget $2,000-$3,500 per year for brakes if you track the M4 CS regularly. Front pads and rotors alone can cost $1,500+ at a dealer. Independent shops are 30-40% less.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 90,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // ═══════════════════════════════════════════════════════════════
  // BMW XM (2023-2024) - S68 Twin-Turbo V8 Hybrid
  // ═══════════════════════════════════════════════════════════════

  {
    id: "bmw-xm-integrated-brake-system-recall-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "BMW",
      model: "XM",
      engines: ["S68 4.4L Twin-Turbo V8 Hybrid"]
    },
    category: "brakes",
    title: "Integrated Brake System (IBS) Malfunction - NHTSA Recall",
    description: "BMW issued multiple recalls (24V-104 and 24V-739) for the XM's Integrated Brake System (IBS), which can malfunction and result in loss of power brake assist, failure of the ABS system, and failure of Dynamic Stability Control (DSC). The IBS module may not function according to specifications, significantly increasing stopping distances and crash risk. BMW's initial fix in February 2024 was found to be insufficient, with the problem persisting in some vehicles, prompting an expanded recall in late 2024.",
    solution: "Contact your BMW dealer immediately to verify if your XM is affected by recalls 24V-104 and 24V-739. The dealer will inspect and, if necessary, replace the Integrated Brake System module and update the IBS software. Do not delay this recall service as brake system failure can be life-threatening. Both recalls are performed free of charge.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Brake warning lamp illuminating on instrument cluster",
      "ABS warning light activating",
      "DSC/Stability Control warning message",
      "Brake pedal feeling harder to press than normal (loss of power assist)",
      "Longer than normal stopping distances",
      "Vehicle stability warning during cornering"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "NHTSA Recall 24V-104: Integrated Braking System",
        url: "https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V104-5527.pdf"
      },
      {
        type: "recall",
        title: "NHTSA Recall 24V-739: Integrated Brake Module Expanded",
        url: "https://static.nhtsa.gov/odi/rcl/2024/RCMN-24V739-9206.pdf"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "This is a critical safety recall affecting braking ability. Do NOT delay scheduling the recall service. Check your VIN at nhtsa.gov/recalls to verify if your specific vehicle is affected.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "If you experience any brake warning lights or reduced braking performance, do not drive the vehicle. Have it towed to the nearest BMW dealer for immediate inspection.",
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
    id: "bmw-xm-s68-oil-consumption-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "BMW",
      model: "XM",
      engines: ["S68 4.4L Twin-Turbo V8 Hybrid"]
    },
    category: "engine",
    title: "S68 V8 Excessive Oil Consumption",
    description: "The S68 twin-turbo V8 engine in the XM has been reported by owners to consume oil at a higher rate than expected for a modern engine. Some owners need to add oil between the 10,000-mile service intervals, particularly during spirited driving or sustained highway cruising. The hot-V turbocharger layout places the turbos between the cylinder banks in an extremely hot environment, and the high-performance turbo seals can allow small amounts of oil past them. The S68's large 8.5-quart oil capacity can mask the consumption initially.",
    solution: "Monitor oil level using the iDrive oil level check before every drive until consumption rate is established. Top off with BMW-approved 0W-20 oil as needed. If consumption exceeds 1 quart per 1,500 miles, have the dealer perform an oil consumption test to document the issue. BMW may replace turbocharger seals or valve stem seals under warranty if consumption is deemed excessive.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Oil level dropping between service intervals",
      "Low oil level warning on iDrive display",
      "Blue-tinted exhaust smoke on cold start or hard acceleration",
      "Oil consumption exceeding 1 quart per 2,000 miles",
      "Oil residue around turbocharger outlets"
    ],
    estimatedCost: { low: 50, high: 3000 },
    citations: [
      {
        type: "owner_forum",
        title: "BimmerBoom - BMW S68 Engine Common Problems and Maintenance",
        url: "https://bimmerboom.com/bmw-s68-engine-common-problems-and-maintenance-tips/"
      },
      {
        type: "owner_forum",
        title: "MyEngineSpecs - BMW S68 Engine Problems and Implications",
        url: "https://myenginespecs.com/bmw/bmw-s68-engine-problems-issues-and-implications/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Keep a quart of BMW 0W-20 TwinPower Turbo oil in the cargo area. Check the oil level via iDrive before every drive for the first few months to establish your engine's consumption pattern.",
        upvotes: 0
      },
      {
        type: "warning",
        content: "Do NOT rely on BMW's 10,000-mile oil change interval. The S68 benefits from 5,000-7,000 mile changes, especially given its twin-turbo hot-V layout that puts extreme thermal stress on the oil.",
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
    id: "bmw-xm-hybrid-drivetrain-hesitation-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "BMW",
      model: "XM",
      engines: ["S68 4.4L Twin-Turbo V8 Hybrid"]
    },
    category: "drivetrain",
    title: "Hybrid Drivetrain Hesitation and Power Delivery Lag",
    description: "The XM's complex hybrid powertrain, combining the S68 V8 with an electric motor integrated into the ZF 8-speed automatic transmission, exhibits hesitation and inconsistent power delivery, particularly during initial acceleration from a stop. The transition from electric-only to combined V8+electric power can feel jerky and uncoordinated, with an unwanted delay before the V8 engages. The creep function from a standstill is very slow, and the electric motor's power delivery can feel jumpy when the V8 steps in. BMW has released software updates to improve the calibration.",
    solution: "Visit the dealer for the latest transmission and hybrid system software calibration updates. Select Sport or Sport Plus mode for more consistent power delivery. The latest software revisions significantly improve the electric-to-V8 handoff smoothness. If hesitation persists after updates, the dealer can reset the transmission adaptation values to relearn driving patterns.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Hesitation or delay when accelerating from a stop",
      "Jerky transition between electric and V8 power",
      "Inconsistent creep speed in traffic",
      "Abrupt power surge when V8 engine engages",
      "Lurching sensation during low-speed parking maneuvers"
    ],
    estimatedCost: { low: 0, high: 300 },
    citations: [
      {
        type: "owner_forum",
        title: "Bimmerpost G07 - XM Ownership Review: Drivetrain",
        url: "https://g07.bimmerpost.com/forums/showthread.php?t=2031241"
      },
      {
        type: "review",
        title: "Machines With Souls - The BMW XM is a Problem",
        url: "https://machineswithsouls.com/bmw-xm-first-drive/"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Make sure you're running the latest transmission software. BMW's first few calibration releases for the XM hybrid system were rough - later updates significantly improve the power handoff.",
        upvotes: 0
      },
      {
        type: "tip",
        content: "In urban driving, use Electric mode to avoid the V8/electric handoff entirely. Switch to Sport+ for highway merging where you want full combined power.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 190,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  {
    id: "bmw-xm-airbag-passenger-knee-recall-2023",
    vehicleMatch: {
      years: [2023],
      make: "BMW",
      model: "XM",
      engines: ["S68 4.4L Twin-Turbo V8 Hybrid"]
    },
    category: "safety",
    title: "Front Passenger Knee Airbag Non-Deployment - NHTSA Recall",
    description: "BMW recalled certain 2023 XM vehicles because the front passenger knee airbag may not deploy as intended during a crash. The airbag module mounting or wiring may prevent proper deployment, leaving the front passenger's knees unprotected in a frontal collision. This recall affects a specific production run of 2023 XM vehicles.",
    solution: "Check your VIN at nhtsa.gov/recalls or bmwusa.com/safety-and-emission-recalls.html to determine if your vehicle is affected. If affected, contact your BMW dealer to schedule the free recall repair, which involves inspection and potential replacement of the knee airbag module and associated wiring.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "No visible symptoms - airbag fault may not trigger a warning light",
      "Airbag warning light on dashboard (in some cases)",
      "Recall notification letter from BMW"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      {
        type: "recall",
        title: "NHTSA - 2023 BMW XM Airbag Recall",
        url: "https://www.nhtsa.gov/vehicle/2023/BMW/XM"
      },
      {
        type: "recall",
        title: "Cars.com - 2023 BMW XM Recalls",
        url: "https://www.cars.com/research/bmw-xm-2023/recalls/"
      }
    ],
    communityRecommendations: [
      {
        type: "warning",
        content: "Check your VIN at nhtsa.gov immediately. Airbag recalls are critical safety items - the airbag may appear normal but could fail to deploy in a crash.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 110,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  {
    id: "bmw-xm-suspension-ride-quality-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "BMW",
      model: "XM",
      engines: ["S68 4.4L Twin-Turbo V8 Hybrid"]
    },
    category: "suspension",
    title: "Harsh Ride Quality and Suspension Stiffness",
    description: "Multiple owners and reviewers report that the XM's M-tuned steel spring suspension is excessively stiff for a luxury SUV, delivering a harsh ride quality on anything other than perfectly smooth pavement. At nearly 6,100 lbs, the XM requires very firm springs to control body roll and maintain composure, but this results in a busy, twitchy ride that transmits road imperfections into the cabin. The trade-off between handling the XM's extreme weight and providing luxury-grade comfort has drawn widespread criticism, with the ride being notably worse at city speeds compared to highway cruising.",
    solution: "Check tire pressures regularly - overinflated tires significantly worsen the harsh ride. Some owners report improved comfort by switching to a tire with a taller sidewall profile (if available for the XM's wheel size). Use Comfort mode for daily driving. Unfortunately, no aftermarket spring or damper solution currently exists to significantly improve the ride without compromising the handling needed for the XM's weight.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Excessive road noise and vibration transmitted into cabin",
      "Harsh impact over bumps, potholes, and expansion joints",
      "Busy, unsettled feeling at city speeds (under 40 mph)",
      "Rear passengers reporting uncomfortable ride",
      "Vehicle twitching or fidgeting over uneven pavement"
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      {
        type: "review",
        title: "Machines With Souls - The BMW XM is a Problem: Ride Quality",
        url: "https://machineswithsouls.com/bmw-xm-first-drive/"
      },
      {
        type: "review",
        title: "Automotive Addicts - 2023 BMW XM Review: Suspension",
        url: "https://www.automotiveaddicts.com/82837/2023-bmw-xm-review-test-drive"
      }
    ],
    communityRecommendations: [
      {
        type: "tip",
        content: "Run tire pressures at the lower end of BMW's recommended range (not the maximum). The 21-inch or 22-inch wheels with low-profile tires are already harsh - don't make it worse with overinflation.",
        upvotes: 0
      }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  }
];

// ─── Check for duplicates ─────────────────────────────────────────
let duplicates = 0;
for (const issue of newIssues) {
  if (existingIds.has(issue.id)) {
    console.log(`WARNING: Duplicate ID found: ${issue.id} - skipping`);
    duplicates++;
  }
}

// ─── Add only non-duplicate issues ────────────────────────────────
const issuesToAdd = newIssues.filter(i => !existingIds.has(i.id));
issuesData.issues.push(...issuesToAdd);

console.log(`\nAdded ${issuesToAdd.length} new issues (${duplicates} duplicates skipped)`);
console.log(`Total issues now: ${issuesData.issues.length}`);

// ─── Write updated known-issues.json ──────────────────────────────
fs.writeFileSync(issuesPath, JSON.stringify(issuesData, null, 2) + '\n');
console.log('Written known-issues.json');

// ═══════════════════════════════════════════════════════════════════
// YMMT Updates
// ═══════════════════════════════════════════════════════════════════

// Helper: ensure a model exists in a year with given trims, sorted alphabetically
function ensureModel(year, make, model, trims) {
  if (!ymmtData[year]) ymmtData[year] = {};
  if (!ymmtData[year][make]) ymmtData[year][make] = {};
  if (!ymmtData[year][make][model]) {
    ymmtData[year][make][model] = trims;
  } else {
    // Merge trims
    const existing = new Set(ymmtData[year][make][model]);
    for (const t of trims) existing.add(t);
    ymmtData[year][make][model] = [...existing].sort();
  }
}

// BMW M240i - already in 2 Series as trims for 2017-2023
// But we need to ensure it's listed as its OWN model for the known-issues to match
// Actually, looking at the data, M240i IS already a trim in "2 Series"
// The issues use model: "M240i" so we need a separate YMMT entry
// F22: 2017-2021 (M240i, M240i xDrive)
// G42: 2022-2024 (M240i xDrive)
for (let y = 2017; y <= 2021; y++) {
  ensureModel(String(y), 'BMW', 'M240i', ['M240i', 'M240i xDrive']);
}
for (let y = 2022; y <= 2024; y++) {
  ensureModel(String(y), 'BMW', 'M240i', ['M240i xDrive']);
}

// BMW iX3 - 2022-2024 (limited US market)
for (let y = 2022; y <= 2024; y++) {
  ensureModel(String(y), 'BMW', 'iX3', ['eDrive50']);
}

// BMW M340i - already in 3 Series as a trim for 2020-2023
// Add as its own model for issue matching
// G20: 2020-2024
for (let y = 2020; y <= 2024; y++) {
  ensureModel(String(y), 'BMW', 'M340i', ['M340i', 'M340i xDrive']);
}

// BMW M3 CS - 2024 only
ensureModel('2024', 'BMW', 'M3 CS', ['Base']);

// BMW M4 CS - 2024 only
ensureModel('2024', 'BMW', 'M4 CS', ['Base']);

// BMW XM - 2023-2024
ensureModel('2023', 'BMW', 'XM', ['XM', 'XM Label Red']);
ensureModel('2024', 'BMW', 'XM', ['XM', 'XM Label Red']);

// ─── Sort BMW models alphabetically within each year ──────────────
for (const year of Object.keys(ymmtData)) {
  if (ymmtData[year]['BMW']) {
    const bmw = ymmtData[year]['BMW'];
    const sortedKeys = Object.keys(bmw).sort();
    const sorted = {};
    for (const k of sortedKeys) {
      sorted[k] = bmw[k];
    }
    ymmtData[year]['BMW'] = sorted;
  }
}

// ─── Write updated ymmt.json ──────────────────────────────────────
fs.writeFileSync(ymmtPath, JSON.stringify(ymmtData, null, 2) + '\n');
console.log('Written ymmt.json');

// ─── Verify YMMT additions ───────────────────────────────────────
console.log('\nYMMT verification:');
for (const year of ['2017', '2020', '2022', '2023', '2024']) {
  const bmw = ymmtData[year]['BMW'];
  const models = Object.keys(bmw).sort();
  console.log(`  ${year}: ${models.join(', ')}`);
}

console.log('\nDone!');
