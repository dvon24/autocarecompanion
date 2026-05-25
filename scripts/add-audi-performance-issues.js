const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const newIssues = [
  // ========================================================
  // AUDI S3 (2015-2024) - 2.0T EA888 Gen 3
  // ========================================================
  {
    id: "audi-s3-water-pump-thermostat-2015",
    make: "Audi",
    model: "A3",
    years: { start: 2015, end: 2024 },
    title: "Water Pump and Thermostat Housing Failure (EA888 Gen 3)",
    severity: "high",
    description: "The Audi S3 (2015-2024) with the EA888 Gen 3 2.0T engine suffers from chronic water pump and thermostat housing failures. The integrated water pump/thermostat assembly uses a plastic housing that cracks or warps from heat cycling, causing coolant leaks. The internal seal between the water pump and thermostat housing degrades, allowing coolant to leak externally or internally into the vacuum system. VW/Audi settled a class action lawsuit and extended the water pump warranty to 8 years/80,000 miles for 2014-2021 models. Failures typically occur between 40,000-80,000 miles. Audizine and BobIsTheOilGuy forums report this as the single most common EA888 Gen 3 failure. Dealer repair costs approach $2,000 due to 3.5 hours of labor.",
    symptoms: [
      "Coolant leak under engine (pink/green puddle)",
      "Low coolant warning light on dashboard",
      "Temperature gauge rising above normal",
      "Sweet smell from engine bay (burning coolant)",
      "Steam from under hood",
      "Coolant reservoir level dropping repeatedly",
      "Overheating in stop-and-go traffic"
    ],
    solution: "Replace the integrated water pump and thermostat housing assembly ($800-$1,500 at dealer, $400-$700 DIY). CHECK WARRANTY FIRST: VW/Audi extended warranty to 8 years/80,000 miles for 2014-2021 models under class action settlement. File a claim at VWWaterPumpSettlement.com for reimbursement of prior repairs. Use OEM or quality replacement (Rein, Hepu) with metal impeller—avoid cheap plastic impeller replacements. Replace the union/connector pipe O-rings at the same time. Flush cooling system and refill with Audi G13 coolant ONLY. PREVENTION: Inspect coolant level monthly. Watch for any pink/green staining around thermostat housing area.",
    estimatedCost: { low: 400, high: 1500 },
    recallInfo: "Class action settlement extends water pump warranty to 8 years/80,000 miles for 2014-2021 models. VW/Audi will reimburse prior repairs.",
    communityRecommendations: [
      {
        type: "part",
        content: "OEM water pump/thermostat housing assembly 06L121111P (latest revision) is the recommended replacement. Hepu P672 is a quality aftermarket alternative with metal impeller.",
        partBrand: "Genuine VW/Audi",
        partName: "Water Pump/Thermostat Housing Assembly",
        partNumber: "06L121111P",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Check if your vehicle qualifies for the class action water pump warranty extension (8 years/80k miles) before paying out of pocket. Applies to 2014-2021 EA888 Gen 3 models.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Do NOT ignore coolant warning lights—the integrated design means a leak can rapidly escalate to overheating and head gasket damage. Pull over immediately if temperature gauge rises.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0128", "P0599"],
    trims: ["S3"]
  },
  {
    id: "audi-s3-turbo-wastegate-rattle-2015",
    make: "Audi",
    model: "A3",
    years: { start: 2015, end: 2020 },
    title: "IS20 Turbocharger Wastegate Rattle and Actuator Failure",
    severity: "medium",
    description: "The Audi S3 (2015-2020) uses the IHI IS20 turbocharger which develops a wastegate rattle due to wear in the wastegate arm pivot hole. The hole where the actuator arm peg fits wears open over time, allowing the wastegate flapper to vibrate loosely when not under boost. This creates a metallic rattling or buzzing noise, typically around 2,000-3,000 RPM under light throttle. In more severe cases, the electronic wastegate actuator itself fails, preventing proper boost regulation. Unlike earlier turbo designs, the IS20's wastegate actuator is integrated and cannot be serviced independently—requiring complete turbo replacement ($2,500-$4,000). Audi issued TSB 2027585/3 for a metal clip (06J145220A) to address early-stage rattle under warranty. PistonHeads and Audizine forums report this issue affecting approximately 20-30% of early 8V S3 models.",
    symptoms: [
      "Metallic rattling or buzzing noise at 2,000-3,000 RPM",
      "Rattle most noticeable under light throttle or coasting",
      "Rattle disappears under heavy boost (wastegate closed)",
      "Check engine light with P0299 (underboost) code",
      "Loss of power or boost (severe actuator failure)",
      "Turbo spool sounds abnormal or delayed"
    ],
    solution: "EARLY STAGE (rattle only, no power loss): Audi TSB 2027585/3 prescribes installation of a metal retaining clip (part 06J145220A) to tighten wastegate arm play ($200-$400 if under warranty, $500-$800 out of pocket). UPGRADED DIVERTER VALVE: Replace with revision 'D' diverter valve to improve boost control. SEVERE (actuator failure or power loss): Replace complete IS20 turbocharger ($2,500-$4,000 installed). The IS20 actuator is integrated and not serviceable separately. Upgraded IS38 turbo swap ($3,500-$5,000) from Golf R is a popular option if replacing turbo anyway. PREVENTION: Avoid short trips that don't fully heat the turbo. Change oil every 5,000 miles with high-quality synthetic.",
    estimatedCost: { low: 200, high: 4000 },
    recallInfo: "No recall. TSB 2027585/3 addresses wastegate rattle with clip installation.",
    communityRecommendations: [
      {
        type: "part",
        content: "Wastegate retaining clip 06J145220A per Audi TSB 2027585/3. Inexpensive fix for early-stage rattle. Ask dealer to check TSB coverage.",
        partBrand: "Genuine VW/Audi",
        partName: "Wastegate Retaining Clip",
        partNumber: "06J145220A",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "IHI IS38 turbocharger upgrade (from Golf R) is a popular swap for S3 owners with IS20 failures. Provides ~350 HP with supporting tune. Bolt-on fitment with ECU tune.",
        partBrand: "IHI",
        partName: "IS38 Turbocharger (Golf R)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If rattle is ONLY at light throttle and disappears under boost, it's likely the wastegate arm wear—not a turbo bearing failure. The clip fix is effective for this.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0299", "P0234"],
    trims: ["S3"]
  },
  {
    id: "audi-s3-dsg-mechatronic-2015",
    make: "Audi",
    model: "A3",
    years: { start: 2015, end: 2024 },
    title: "DQ381 S-Tronic Mechatronic Unit Failure",
    severity: "high",
    description: "The Audi S3 (2015-2024) with the 7-speed DQ381 S-Tronic dual-clutch transmission experiences mechatronic unit failures that cause harsh shifting, limp mode, and complete loss of drive. The mechatronic unit (the transmission's electronic brain) contains clutch position sensors, solenoids, and the transmission control unit (TCU). The clutch position sensors (P1735/P1736 faults) are the most common failure point, preventing accurate detection of clutch engagement. Failures typically manifest as loss of odd or even gears, forcing the transmission into safe mode with restricted RPM and gear availability. The DQ381 inherited many weak points from earlier DSG designs. Eco-Torque and Audizine forums report growing numbers of DQ381 mechatronic failures, particularly on S3 models subjected to spirited driving. A new mechatronic unit costs $1,800-$3,000 plus coding and installation. Clutch pack failures add $2,000-$4,000.",
    symptoms: [
      "Harsh or jerky shifting, especially when warm",
      "Transmission limp mode with restricted gears",
      "PRNDS flashing on instrument cluster",
      "Gearbox warning light on dashboard",
      "No drive engagement or delayed D/R selection",
      "Loss of odd gears (1st, 3rd, 5th) or even gears (2nd, 4th, 6th)",
      "Complete loss of drive (no movement)"
    ],
    solution: "EARLY SYMPTOMS (jerky shifts): DSG fluid and filter service ($500-$700) plus dealer software update. This may resolve early-stage issues. MECHATRONIC FAILURE: Replace mechatronic unit ($2,000-$4,000 installed) plus TCU coding. Remanufactured units available for $1,500-$2,500. CLUTCH PACK FAILURE: Replace dual clutch pack ($3,000-$5,000). PREVENTION: Service DSG fluid every 40,000 miles—ignore Audi's 'lifetime fill' claim. Use ONLY OEM Audi DSG fluid (G 052 182 A2) or approved Pentosin FFL-2. Avoid aggressive launches and excessive clutch slip in traffic.",
    estimatedCost: { low: 500, high: 5000 },
    recallInfo: "No recall. Audi issued software updates to improve shift quality on early DQ381 units.",
    communityRecommendations: [
      {
        type: "part",
        content: "Use only OEM VW/Audi DSG fluid G 052 182 A2 or approved Pentosin FFL-2 for S-Tronic service. Non-approved fluids cause clutch shudder and accelerated mechatronic wear.",
        partBrand: "Pentosin",
        partName: "FFL-2 DSG Transmission Fluid",
        partNumber: "G052182A2",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "DSG fluid and filter change every 40,000 miles is critical. Audizine consensus: regular service dramatically extends mechatronic and clutch life. Ignore Audi's 'lifetime fill' marketing.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If PRNDS starts flashing or you lose odd/even gears, DO NOT continue driving aggressively. Limp home gently and get the mechatronic unit scanned immediately to prevent clutch pack damage.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "transmission",
    dtcCodes: ["P1735", "P1736", "P0730", "P0741", "P0657"],
    trims: ["S3"]
  },
  {
    id: "audi-s3-carbon-buildup-2015",
    make: "Audi",
    model: "A3",
    years: { start: 2015, end: 2019 },
    title: "Carbon Buildup on Intake Valves (Pre-Dual Injection EA888 Gen 3)",
    severity: "medium",
    description: "The Audi S3 (2015-2019) with the EA888 Gen 3 2.0T engine (before the Gen 3B dual-injection update) suffers from carbon buildup on intake valves, a hallmark issue of direct-injection engines. Without port injection to wash the valves, PCV oil vapors bake onto intake valve surfaces over 40,000-80,000 miles, restricting airflow and causing misfires, rough idle, and power loss. The S3's higher boost pressures increase crankcase vapors compared to the base A3, accelerating carbon accumulation. The 2020+ S3 received the EA888 Gen 3B with dual injection (port + direct), which largely eliminates this issue. Walnut blasting every 40,000-60,000 miles is recommended preventive maintenance. TorqueCars and Audizine report this as a common service item on pre-2020 EA888 Gen 3 vehicles.",
    symptoms: [
      "Rough or unstable idle",
      "Cold start misfires (cylinder-specific)",
      "Hesitation during acceleration",
      "Noticeable power loss at higher RPM",
      "Poor fuel economy",
      "Check engine light with misfire codes (P0300-P0304)"
    ],
    solution: "WALNUT BLASTING: Remove intake manifold and blast intake valve ports with crushed walnut shells ($500-$1,000). Repeat every 40,000-60,000 miles. CATCH CAN: Install an oil catch can ($200-$400) to capture PCV vapors before they reach intake valves—significantly slows carbon buildup. OIL CHANGES: Use high-quality synthetic oil and change every 5,000 miles. DRIVING HABITS: Regular spirited driving helps burn off some deposits. NOTE: 2020+ S3 models with EA888 Gen 3B dual injection are largely immune to this issue.",
    estimatedCost: { low: 500, high: 1000 },
    recallInfo: "No recall. Inherent to all direct-injection engines without port injection.",
    communityRecommendations: [
      {
        type: "part",
        content: "034 Motorsport Catch Can Kit for MQB platform. Captures PCV oil vapors before they reach intake valves. Well-documented effectiveness on Audizine.",
        partBrand: "034 Motorsport",
        partName: "Catch Can Kit (MQB Platform)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Schedule walnut blasting at 50,000 miles as preventive maintenance, before symptoms appear. DIY with a media blaster and walnut shells costs under $100 in materials but takes 6-8 hours.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If buying a used S3, check if it's a 2020+ model with dual injection (Gen 3B). These models largely eliminate carbon buildup issues.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304"],
    trims: ["S3"]
  },

  // ========================================================
  // AUDI S5 (2008-2024) - 3.0T Supercharged / 2.9T Twin-Turbo
  // ========================================================
  {
    id: "audi-s5-crankshaft-pulley-2010",
    make: "Audi",
    model: "S5",
    years: { start: 2010, end: 2017 },
    title: "Crankshaft Pulley (Harmonic Balancer) Failure (3.0T)",
    severity: "high",
    description: "The Audi S5 (2010-2017) with the 3.0T supercharged V6 is prone to crankshaft pulley (harmonic balancer) failure. The rubber damper between the inner and outer sections of the pulley delaminates and separates, causing dangerous pulley wobble. When the pulley fails, the serpentine belt shreds, disabling the supercharger (complete loss of boost), power steering, alternator, and A/C compressor. At highway speed, this means sudden loss of power steering and supercharger boost—a safety hazard. Audi revised the part from revision E to F, acknowledging the design flaw. Audizine and A5OC forums document numerous failures between 60,000-100,000 miles. Early models (2010-2013) are most affected. If the separated pulley damages the crankshaft timing, repair costs can exceed $5,000.",
    symptoms: [
      "Visible pulley wobble when engine is running",
      "Serpentine belt shredding or squealing",
      "Sudden loss of supercharger boost (car feels like a V6)",
      "Power steering failure (heavy steering)",
      "Battery light illuminated (alternator not charging)",
      "A/C stops working",
      "Unusual vibration from front of engine",
      "Drivetrain vibration that feels like transmission issue"
    ],
    solution: "Replace crankshaft pulley/harmonic balancer with LATEST REVISION (revision F or later) part ($300-$600 for part, $800-$1,700 with labor). This is NOT a DIY-friendly repair—requires specialized holding tools and precise torque. If belts are damaged, replace serpentine belt and tensioner ($200-$400 additional). INSPECT: Check for collateral damage to supercharger snout, idler pulleys, and timing. If timing was affected, expect $3,000-$5,000 additional repair. PREVENTIVE: Inspect pulley for wobble at every oil change. Consider preemptive replacement at 80,000 miles on 2010-2013 models.",
    estimatedCost: { low: 800, high: 5000 },
    recallInfo: "No recall. Audi silently revised the part (revision E to F). Check your part revision—early revisions are more failure-prone.",
    communityRecommendations: [
      {
        type: "part",
        content: "OEM crankshaft pulley latest revision 06E105251F (revision F). Ensure you get the LATEST revision—earlier revisions A-E have higher failure rates. All 3.0T motors (S4, S5, Q5, SQ5, A6, A7) use the same part.",
        partBrand: "Genuine VW/Audi",
        partName: "Crankshaft Pulley / Harmonic Balancer (Rev F)",
        partNumber: "06E105251F",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If you notice the serpentine belt suddenly shredding or hear unusual vibration from the engine, STOP DRIVING immediately. Continued operation with a failed pulley can damage the crankshaft and supercharger.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "A simple visual check at each oil change can catch this before catastrophic failure. Look for any visible gap or wobble between the inner hub and outer ring of the crank pulley while the engine is running.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: [],
    trims: ["Premium Plus", "Prestige"]
  },
  {
    id: "audi-s5-pcv-valve-failure-2010",
    make: "Audi",
    model: "S5",
    years: { start: 2010, end: 2017 },
    title: "PCV Valve (Crankcase Vent Valve) Failure (3.0T)",
    severity: "medium",
    description: "The Audi S5 (2010-2017) with the 3.0T supercharged V6 has a chronic PCV valve (also called air-oil separator or crankcase vent valve) failure. The PCV valve diaphragm degrades over time, causing oil leaks, check engine lights, rough idle, and a loud squealing/whistling noise from the engine. The 3.0T PCV is located at the rear of the engine near the firewall, making it moderately difficult to access. Many B8/B8.5 S5 owners replace the PCV valve and water pump simultaneously to save on future labor costs, since both are common failure items. Audizine, ShopDAP, and Motor Werke report PCV failure as a near-certainty before 100,000 miles. The repair is moderate in cost but ignoring it leads to vacuum leaks and accelerated oil consumption.",
    symptoms: [
      "Loud squealing or whistling noise from engine bay",
      "Oil leaks around valve covers or PCV housing",
      "Check engine light with lean mixture codes (P0171, P0174)",
      "Rough or unstable idle",
      "Excessive oil consumption (more than 1 qt per 3,000 miles)",
      "Oil residue around PCV valve area",
      "Vacuum leak symptoms (surging idle, poor throttle response)"
    ],
    solution: "Replace PCV valve/crankcase vent valve ($200-$500 for part, $600-$1,200 with labor). The PCV is located at the rear of the 3.0T engine near the firewall—labor is 2-4 hours depending on shop access method. RECOMMENDED: Replace water pump and thermostat at the same time (both require partial engine disassembly to access). Use OEM or Dorman replacement. PREVENTION: Change oil every 5,000 miles with high-quality synthetic. Avoid extended oil change intervals which accelerate PCV diaphragm degradation.",
    estimatedCost: { low: 600, high: 1200 },
    recallInfo: "No recall. PCV valve is a maintenance item on all VAG engines.",
    communityRecommendations: [
      {
        type: "part",
        content: "OEM PCV valve 06E103547E for B8/B8.5 3.0T. Dorman 911-348 is a quality aftermarket alternative. Avoid cheap eBay replacements.",
        partBrand: "Genuine VW/Audi",
        partName: "PCV Valve / Crankcase Vent Valve",
        partNumber: "06E103547E",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If you're replacing the PCV, also replace the water pump and thermostat at the same time. Both are known failure items on the 3.0T and share labor overlap—saves $500+ in future labor costs.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "A failed PCV valve creates a vacuum leak that causes lean running conditions. Prolonged driving with a failed PCV can damage catalytic converters and increase oil consumption.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0171", "P0174", "P2187", "P2189"],
    trims: ["Premium Plus", "Prestige"]
  },
  {
    id: "audi-s5-b9-water-pump-2018",
    make: "Audi",
    model: "S5",
    years: { start: 2018, end: 2024 },
    title: "EA839 Water Pump Internal Leak and Vacuum System Contamination (2.9T)",
    severity: "high",
    description: "The B9/B9.5 Audi S5 (2018-2024) with the EA839 2.9T twin-turbo V6 suffers from a particularly insidious water pump failure. Unlike typical water pumps that leak externally, the EA839 water pump leaks INTERNALLY. The pump uses vacuum to operate a slide valve controlling impeller actuation. When the internal seals fail, coolant is drawn into the vacuum system and migrates into other components where coolant should never be present—including the brake booster, turbo wastegate actuators, and other vacuum-operated systems. This makes the failure especially dangerous as it can affect braking and boost control simultaneously. New German Performance and AudiWorld forums describe this as a 'when, not if' failure on EA839 engines. Failures typically occur between 40,000-70,000 miles.",
    symptoms: [
      "Coolant level dropping with no visible external leak",
      "Sweet coolant smell but no puddle under car",
      "Brake pedal feels soft or spongy (coolant in brake booster)",
      "Turbo boost irregularities (coolant in wastegate actuator vacuum lines)",
      "Check engine light with coolant temperature or boost codes",
      "White residue in vacuum lines when inspected",
      "Engine overheating warning"
    ],
    solution: "Replace water pump assembly with UPDATED revision ($1,200-$2,500 installed). The EA839 water pump replacement requires significant disassembly—5-8 hours of labor. CRITICAL: Inspect ALL vacuum lines, brake booster, and wastegate actuators for coolant contamination. If coolant entered the brake booster, replace it immediately ($800-$1,500)—this is a SAFETY issue. Flush the vacuum system thoroughly. Use OEM replacement pump with updated seals. PREVENTION: Monitor coolant level monthly. If coolant drops with no visible leak, suspect internal water pump failure immediately.",
    estimatedCost: { low: 1200, high: 3500 },
    recallInfo: "No recall. Audi has released updated water pump revisions with improved internal seals.",
    communityRecommendations: [
      {
        type: "part",
        content: "OEM EA839 water pump with updated internal seals. Check for latest revision number from your Audi parts counter. Earlier revisions are more failure-prone.",
        partBrand: "Genuine VW/Audi",
        partName: "EA839 Water Pump Assembly (Updated)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "This is NOT a typical water pump leak. Coolant enters the vacuum system and can contaminate your brake booster. If you notice a soft brake pedal AND dropping coolant, get this inspected IMMEDIATELY—it is a safety issue.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "When replacing the water pump, have the shop inspect all vacuum lines for white coolant residue. Any contaminated lines or actuators must be replaced or flushed.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0128", "P0117", "P0118", "P0299"],
    trims: ["Premium Plus", "Prestige"]
  },

  // ========================================================
  // AUDI S7 (2012-2024) - 4.0T Twin-Turbo / 2.9T
  // ========================================================
  {
    id: "audi-s7-turbo-oil-strainer-2012",
    make: "Audi",
    model: "A7",
    years: { start: 2012, end: 2017 },
    title: "Turbocharger Oil Strainer Blockage Causing Engine Stall (4.0T NHTSA Recall)",
    severity: "high",
    description: "The Audi S7 (2012-2017) with the 4.0T twin-turbo V8 has a critical design flaw in the turbocharger oil supply system. A poorly designed oil strainer (screen) collects oil sludge and carbon deposits, blocking oil flow to the turbocharger bearings. Oil-starved turbo bearings fail, causing the turbine wheel to contact the housing or the turbo shaft to break. This leads to sudden engine stall while driving—including on highways—with the engine unable to restart. NHTSA received 58 complaints and opened an investigation. Audi received 1,889 warranty claims and 47 field reports. NHTSA Recall 22V178 covers 2013-2017 S6, S7, RS7, A8, and S8 models. Audi extended the turbocharger warranty to 10 years/120,000 miles and will replace the oil strainer with a larger-mesh version. Vehicles built after March 30, 2017 already have the updated screen.",
    symptoms: [
      "Engine stall while driving (cannot restart)",
      "Unusual whining or grinding noise from turbochargers",
      "Reduced engine power or acceleration",
      "Check engine light with turbo underboost codes",
      "Oil smoke from exhaust (turbo seal failure)",
      "Engine difficult to start after sitting",
      "Loss of power at highway speeds (dangerous)"
    ],
    solution: "RECALL REPAIR (FREE): Contact Audi dealer for NHTSA Recall 22V178 (Audi recall 21H7). The dealer will replace the turbocharger oil strainer with an updated version that has larger mesh perforations to prevent clogging. WARRANTY EXTENSION: Audi extended the turbocharger warranty to 10 years/120,000 miles. If turbo damage already occurred, replacement may be covered. If TURBO DAMAGED: Replace turbocharger(s) ($4,000-$8,000 per turbo, $8,000-$16,000 for pair). PREVENTION: Use high-quality synthetic oil (Castrol Edge 5W-40 or equivalent) and change every 5,000 miles—never exceed 7,500. Avoid extended idling which accelerates carbon buildup in oil passages.",
    estimatedCost: { low: 0, high: 16000 },
    recallInfo: "NHTSA Recall 22V178 (Audi 21H7). Turbocharger warranty extended to 10 years/120,000 miles. Free oil strainer replacement at any Audi dealer.",
    communityRecommendations: [
      {
        type: "tip",
        content: "Check your VIN at NHTSA.gov/recalls or Audi's recall lookup to verify coverage. Even if you purchased used, the recall repair is FREE at any Audi dealer.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "This is a SAFETY recall. The engine can stall at highway speeds with no restart. Do not delay the recall repair. If your S7 stalls while driving, shift to neutral, activate hazard lights, and coast to safety.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Short oil change intervals (5,000 miles) with premium synthetic oil significantly reduce carbon/sludge formation that clogs the oil strainer. Never use conventional oil in the 4.0T.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0299", "P0234", "P006A", "P006B"],
    trims: ["S7", "Competition"]
  },
  {
    id: "audi-s7-carbon-buildup-4.0t-2012",
    make: "Audi",
    model: "A7",
    years: { start: 2012, end: 2018 },
    title: "Carbon Buildup on Intake Valves (4.0T Twin-Turbo V8)",
    severity: "medium",
    description: "The Audi S7 (2012-2018) with the 4.0T twin-turbo V8 develops carbon buildup on intake valves due to direct fuel injection. With 8 cylinders and twin turbochargers generating high crankcase pressure, carbon accumulation is more aggressive than on smaller engines. The hot-vee design (turbochargers mounted between the cylinder banks) also contributes to higher under-hood temperatures that bake deposits faster. Symptoms appear between 40,000-80,000 miles and include rough idle, misfires, and reduced power. Walnut blasting on a V8 is more expensive than on 4-cylinder engines due to double the cylinders and the complexity of the hot-vee layout. Audizine and AudiWorld forums recommend cleaning every 40,000-60,000 miles as preventive maintenance. Neglecting carbon cleaning can lead to valve damage and $6,000+ engine repairs.",
    symptoms: [
      "Rough or unstable idle, especially when cold",
      "Misfires on one or more cylinders",
      "Hesitation during acceleration",
      "Reduced power output at higher RPM",
      "Poor fuel economy (below 15 MPG city)",
      "Check engine light with misfire codes",
      "Engine stumbling under partial throttle"
    ],
    solution: "WALNUT BLASTING: Remove intake manifolds and blast all 8 intake ports with walnut shells ($1,000-$2,000 for V8). The hot-vee design makes this more labor-intensive than typical V8 engines—expect 6-10 hours of labor. Repeat every 40,000-60,000 miles. CATCH CAN: Install dual oil catch cans ($400-$800) to capture PCV vapors from both banks. OIL CHANGES: Use premium 5W-40 synthetic and change every 5,000 miles. DRIVING HABITS: Regular highway driving at higher RPM helps slow carbon accumulation.",
    estimatedCost: { low: 1000, high: 2000 },
    recallInfo: "No recall. Inherent to all direct-injection engines.",
    communityRecommendations: [
      {
        type: "tip",
        content: "The 4.0T hot-vee design makes walnut blasting more complex than typical V8s. Find a shop experienced with Audi 4.0T engines specifically—not all European specialists have done this engine.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "Dual catch can setup required for the 4.0T—one for each bank. 034 Motorsport and JHM offer complete kits designed for the C7 S6/S7 platform.",
        partBrand: "034 Motorsport",
        partName: "Dual Catch Can Kit (4.0T)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Do not attempt chemical de-carbon solutions on the 4.0T—the hot-vee turbo layout means chemicals can contaminate turbocharger bearings. Walnut blasting is the only safe method.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304", "P0305", "P0306", "P0307", "P0308"],
    trims: ["S7", "Competition"]
  },
  {
    id: "audi-s7-oil-consumption-4.0t-2012",
    make: "Audi",
    model: "A7",
    years: { start: 2012, end: 2018 },
    title: "Excessive Oil Consumption (4.0T V8 Piston Ring Issue)",
    severity: "medium",
    description: "The Audi S7 (2012-2018) with the 4.0T twin-turbo V8 can exhibit excessive oil consumption, sometimes exceeding 1 quart per 1,000 miles. Audi's own Technical Service Bulletins acknowledge 'engine oil consumption too high' on the 4.0T TFSI and introduced updated piston rings for later production. Early models (2012-2015) are most commonly affected. The root cause is insufficient piston ring tension that allows oil to pass into the combustion chamber and burn. High boost pressure from twin turbochargers exacerbates the issue. Audi considers up to 1 quart per 2,000 miles 'within specification,' but many owners report consumption well beyond that threshold. If oil consumption exceeds Audi's spec, a dealer oil consumption test may qualify the vehicle for warranty piston ring replacement ($3,000-$6,000). BobIsTheOilGuy and AudiWorld forums document this extensively.",
    symptoms: [
      "Oil level drops significantly between oil changes",
      "Need to add 1+ quart every 1,000-2,000 miles",
      "Blue-white smoke from exhaust on startup or acceleration",
      "Oil consumption warning on dashboard",
      "Fouled spark plugs (oil-coated)",
      "Catalytic converter damage from oil contamination (long-term)"
    ],
    solution: "MILD (within Audi's spec of 1 qt/2,000 mi): Monitor oil level between changes, carry extra oil. Use heavier-weight oil if out of warranty (5W-40 rather than 0W-40). SEVERE (exceeds Audi's spec): Request Audi oil consumption test at dealer. If it fails, Audi TSB directs piston ring replacement ($3,000-$6,000 under warranty, $5,000-$8,000 out of pocket). The repair requires engine removal for the 4.0T. PREVENTION: Change oil every 5,000 miles with high-quality 5W-40 synthetic. Check oil level WEEKLY. Never let oil drop below minimum mark on dipstick—turbocharger bearings are extremely sensitive to low oil.",
    estimatedCost: { low: 0, high: 8000 },
    recallInfo: "No recall. Audi issued TSB for oil consumption testing and piston ring replacement on affected vehicles.",
    communityRecommendations: [
      {
        type: "tip",
        content: "Request an official Audi oil consumption test before your warranty expires. The dealer will top off oil, seal the cap, and have you return in 1,000 miles to measure consumption. If it exceeds spec, piston ring replacement is covered.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "The 4.0T's twin turbochargers are extremely sensitive to low oil. Running low on oil, even briefly, can damage turbo bearings and lead to the oil strainer recall issue. Check oil level WEEKLY.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Keep a quart of Castrol Edge 5W-40 in the trunk at all times. The 4.0T oil capacity is approximately 8.5 quarts and consumption can spike during spirited driving or track use.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: [],
    trims: ["S7", "Competition"]
  },
  {
    id: "audi-s7-motor-mount-failure-2012",
    make: "Audi",
    model: "A7",
    years: { start: 2012, end: 2018 },
    title: "Premature Motor Mount Failure (4.0T V8)",
    severity: "medium",
    description: "The Audi S7 (2012-2018) with the heavy 4.0T twin-turbo V8 experiences premature motor mount failure. The hydraulic-filled engine mounts deteriorate and collapse, causing excessive engine movement, vibration, and clunking during acceleration and braking. The 4.0T's high torque output (406+ lb-ft) and the weight of the twin-turbo V8 stress the mounts beyond their design life. Failures commonly occur between 50,000-80,000 miles. Collapsed mounts allow the engine to shift excessively, which can stress exhaust connections, CV axles, and transmission mounts. RS246 and Audizine forums report motor mounts as one of the earlier-failing components on the C7 S6/S7/RS7 platform.",
    symptoms: [
      "Noticeable clunk or thud when accelerating from stop",
      "Excessive engine movement visible under hood",
      "Vibration transmitted to cabin at idle",
      "Clunking during hard braking (engine rocks forward)",
      "Exhaust rattle from stressed connections",
      "Transmission shifts feel harsher (engine movement affects alignment)"
    ],
    solution: "Replace both engine mounts as a pair ($800-$1,500 for both, $1,500-$2,500 with labor). Always replace BOTH mounts simultaneously—if one has failed, the other is close behind. Use OEM Audi mounts for proper damping characteristics. Aftermarket solid mounts increase NVH (noise/vibration) significantly. INSPECT: Check transmission mount at the same time—it often wears concurrently. Replace transmission mount if showing signs of deterioration ($400-$800 additional).",
    estimatedCost: { low: 1500, high: 2500 },
    recallInfo: "No recall. Motor mounts are considered wear items.",
    communityRecommendations: [
      {
        type: "part",
        content: "OEM Audi hydraulic engine mounts are the recommended replacement. RS246 forum consensus: aftermarket solid polyurethane mounts are too harsh for daily driving in the S7.",
        partBrand: "Genuine VW/Audi",
        partName: "Engine Mount Set (4.0T)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "A simple test: have someone rev the engine in drive with the brake held while you watch under the hood. Excessive engine rocking (more than 1 inch) indicates worn mounts.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: [],
    trims: ["S7", "Competition"]
  },

  // ========================================================
  // AUDI S8 (2013-2024) - 4.0T Twin-Turbo
  // ========================================================
  {
    id: "audi-s8-turbo-oil-strainer-2013",
    make: "Audi",
    model: "A8",
    years: { start: 2013, end: 2017 },
    title: "Turbocharger Oil Strainer Blockage and Engine Stall (4.0T NHTSA Recall)",
    severity: "high",
    description: "The Audi S8 (2013-2017) with the 4.0T twin-turbo V8 shares the same critical turbocharger oil strainer design flaw as the S6, S7, and RS7. The oil strainer in the turbo oil supply line accumulates carbon and sludge deposits, choking oil flow to turbocharger bearings. Bearing failure causes the turbo shaft to break or turbine wheel to contact the housing, resulting in sudden engine stall with no restart capability. NHTSA documented 58 complaints across all 4.0T models and issued Recall 22V178. The S8's higher power output (520-605 HP) generates more heat and oil stress than the S6/S7, potentially accelerating strainer clogging. Audi extended turbocharger warranty to 10 years/120,000 miles. Consumer Reports and Autoblog covered this recall extensively. Vehicles built after March 30, 2017 have the updated strainer.",
    symptoms: [
      "Engine stall at any speed, including highway (SAFETY CRITICAL)",
      "Engine will not restart after stalling",
      "Unusual turbocharger whine or grinding noise",
      "Sudden loss of power during acceleration",
      "Check engine light with turbo-related codes",
      "Oil smoke from exhaust (turbo seal failure)",
      "Difficult starting after vehicle sits overnight"
    ],
    solution: "RECALL REPAIR (FREE): Contact Audi dealer immediately for NHTSA Recall 22V178 (Audi recall 21H7). Dealer replaces oil strainer with updated larger-mesh version. WARRANTY EXTENSION: Turbocharger warranty extended to 10 years/120,000 miles. If turbo already damaged, contact Audi for warranty claim. TURBO REPLACEMENT: If turbocharger(s) damaged beyond recall coverage, expect $5,000-$10,000 per turbo ($10,000-$20,000 for pair on S8). PREVENTION: Premium 5W-40 synthetic oil changed every 5,000 miles. Never exceed 7,500-mile oil change intervals on the 4.0T.",
    estimatedCost: { low: 0, high: 20000 },
    recallInfo: "NHTSA Recall 22V178 (Audi 21H7). Free oil strainer replacement. Turbocharger warranty extended to 10 years/120,000 miles.",
    communityRecommendations: [
      {
        type: "tip",
        content: "Check recall status immediately at NHTSA.gov/recalls. This is a SAFETY recall—the engine can stall at highway speed. The repair is free regardless of mileage or ownership status.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If you experience sudden power loss or the engine stalls while driving, shift to neutral, turn on hazards, and coast to a safe location. Do NOT attempt to restart repeatedly—this can cause additional turbo damage.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Even after the recall repair, maintain strict 5,000-mile oil change intervals with premium synthetic. The 4.0T's hot-vee design runs very hot and breaks down oil faster than typical engines.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0299", "P0234", "P006A", "P006B"],
    trims: ["S8"]
  },
  {
    id: "audi-s8-air-suspension-failure-2013",
    make: "Audi",
    model: "A8",
    years: { start: 2013, end: 2022 },
    title: "Air Suspension Strut Leak and Compressor Failure",
    severity: "high",
    description: "The Audi S8 (2013-2022) uses an adaptive air suspension system with electronically controlled air struts that are prone to failure. The air springs (bellows) develop leaks from rubber deterioration, UV exposure, and road debris damage. A leaking air spring causes the affected corner of the vehicle to sag while parked, and the air compressor works overtime to compensate. This overworks the compressor, causing premature compressor failure ($2,000-$2,100 to replace). Individual air struts cost $4,300-$4,600 each to replace at a dealer. The S8's heavier curb weight (4,800+ lbs) and sport-tuned suspension put more stress on air components than the standard A8. StrutMasters and RepairPal document air suspension as one of the most expensive recurring repairs on the D4/D5 S8 platform. Complete suspension rebuild (4 struts + compressor) can exceed $20,000 at dealer pricing.",
    symptoms: [
      "One corner of vehicle sags after sitting overnight",
      "Vehicle sits noticeably lower on one side",
      "Air compressor running constantly (audible buzzing/humming)",
      "Hissing noise from wheel well area (air leak)",
      "Suspension fault warning on dashboard",
      "Ride quality becomes harsh or bouncy",
      "Vehicle takes long time to reach ride height after starting"
    ],
    solution: "SINGLE STRUT LEAK: Replace air strut ($4,300-$4,600 per strut at dealer, $1,500-$2,500 with aftermarket Arnott or Continental strut). COMPRESSOR FAILURE: Replace air compressor ($2,000-$2,100 at dealer, $800-$1,200 aftermarket). COST SAVING: Aftermarket air struts from Arnott, Continental (OEM supplier), or Suncore offer 40-60% savings over dealer pricing. ULTIMATE SAVINGS: StrutMasters conversion kit replaces air struts with passive coilovers ($1,500-$2,500 for complete kit) but eliminates adaptive height adjustment. PREVENTION: Park in garage to reduce UV damage to rubber bellows. Regularly wash wheel well area to remove road salt and debris.",
    estimatedCost: { low: 1500, high: 20000 },
    recallInfo: "No recall. Air suspension components are wear items.",
    communityRecommendations: [
      {
        type: "part",
        content: "Arnott remanufactured air struts offer significant savings over OEM ($1,200-$1,800 each vs $4,300+ dealer). Arnott provides a lifetime warranty on their remanufactured struts.",
        partBrand: "Arnott",
        partName: "Remanufactured Air Strut (A8/S8 D4)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If one strut is leaking, the others are likely close behind. Budget for replacing all four struts within the next 12-24 months. Replacing in pairs (front or rear) is the minimum recommended approach.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "A leaking air strut will quickly kill your compressor as it runs continuously trying to maintain ride height. Address leaks promptly—a $1,500 strut replacement now prevents a $2,000 compressor failure later.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "suspension",
    dtcCodes: ["C1132", "C1133"],
    trims: ["S8"]
  },
  {
    id: "audi-s8-oil-consumption-2013",
    make: "Audi",
    model: "A8",
    years: { start: 2013, end: 2018 },
    title: "Excessive Oil Consumption and Piston Ring TSB (4.0T V8)",
    severity: "medium",
    description: "The Audi S8 (2013-2018) with the 4.0T twin-turbo V8 (same engine as S6/S7/RS7) exhibits excessive oil consumption that Audi has acknowledged via Technical Service Bulletins. The issue stems from insufficient piston ring tension allowing oil to enter the combustion chamber. The S8's higher power output (520-605 HP depending on variant) and higher cylinder pressures from twin turbocharging exacerbate the issue compared to lower-output applications of the same engine. Audi considers up to 1 quart per 2,000 miles 'within specification,' but many owners consume oil at a much higher rate. Audi's TSB specifies an oil consumption test procedure and authorizes piston ring replacement for vehicles that fail. BobIsTheOilGuy and Euro Premium Parts report this as a recurring topic in S8 ownership circles.",
    symptoms: [
      "Oil level drops significantly between changes",
      "Adding 1+ quart every 1,000-2,000 miles",
      "Blue-white exhaust smoke on cold start or hard acceleration",
      "Oil consumption warning on instrument cluster",
      "Fouled spark plugs (oil deposits)",
      "Low oil pressure warning (if severely depleted)"
    ],
    solution: "WITHIN WARRANTY: Request formal Audi oil consumption test at dealer. Dealer tops off oil, seals fill cap, and measures consumption over 1,000 miles. If consumption exceeds Audi's spec, piston ring replacement is authorized under TSB ($4,000-$8,000 covered by warranty). OUT OF WARRANTY: Piston ring replacement requires engine removal on the 4.0T—expect $6,000-$10,000 out of pocket. MANAGEMENT (if not replacing rings): Use 5W-40 synthetic oil (not 0W-40), change every 5,000 miles, and check oil level WEEKLY. Carry extra oil in trunk. CRITICAL: Never let oil run low—4.0T turbo bearings and the oil strainer issue make low oil levels extremely dangerous.",
    estimatedCost: { low: 0, high: 10000 },
    recallInfo: "No recall. Audi TSB authorizes piston ring replacement on vehicles failing oil consumption test.",
    communityRecommendations: [
      {
        type: "tip",
        content: "Request the oil consumption test BEFORE your warranty expires. It's free and documents the issue. If you're within 1 year of warranty expiration, do this immediately.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If buying a used S8, ask for oil change records and look for short intervals. Frequent oil additions between changes are a red flag for the piston ring issue.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Running the 4.0T low on oil can trigger the turbo oil strainer blockage issue (Recall 22V178). The two issues compound each other. Check oil level every week.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: [],
    trims: ["S8"]
  },
  {
    id: "audi-s8-coolant-thermostat-leak-2013",
    make: "Audi",
    model: "A8",
    years: { start: 2013, end: 2018 },
    title: "Coolant Leak from Thermostat Housing and Water Pump Area (4.0T)",
    severity: "medium",
    description: "The Audi S8 (2013-2018) with the 4.0T V8 develops coolant leaks from the thermostat housing cover, O-ring seals between the thermostat and water pump, and the plastic coolant distribution pipes. The plastic thermostat housing can develop hairline cracks from repeated thermal cycling, and the O-ring seals harden and fail over time. AudiWorld and Audizine forums report coolant leaks as a common issue between 50,000-90,000 miles. The 4.0T cooling system is under significant thermal stress due to the hot-vee turbo configuration (turbos between cylinder banks). Access is very difficult—the water pump requires removing the oil cooler and main alternator drive assembly. Improper repair is common, as the O-ring groove on the engine block must be meticulously cleaned of calcified mineral scale to reseal properly.",
    symptoms: [
      "Coolant puddle under engine (pink/green fluid)",
      "Sweet coolant smell from engine bay",
      "Low coolant warning on dashboard",
      "Temperature gauge reading higher than normal",
      "Visible coolant residue around thermostat housing",
      "Steam from engine bay area"
    ],
    solution: "Replace thermostat housing cover, thermostat, O-rings, and water pump seals ($1,200-$2,500 installed). CRITICAL INSTALLATION DETAILS: Clean the O-ring sealing groove on engine block to remove all mineral scale buildup—this step is often overlooked and causes repeat leaks. Do NOT use RTV sealant with fiber gaskets—it causes leaks. Ensure thermostat is installed in correct orientation (backward installation causes uneven pressure on housing). RECOMMENDED: Replace water pump gaskets at the same time since access requires disassembly of oil cooler and alternator drive.",
    estimatedCost: { low: 1200, high: 2500 },
    recallInfo: "No recall. Coolant system maintenance on the 4.0T is a known high-labor repair.",
    communityRecommendations: [
      {
        type: "tip",
        content: "When repairing the thermostat housing leak, have the shop also replace water pump gaskets and the union O-ring. The labor overlap is significant and prevents a second teardown later.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Do NOT use RTV gasket sealer with fiber gaskets on the 4.0T cooling system. This is a common mechanic mistake that causes repeat coolant leaks at multiple locations.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Find a shop experienced specifically with the 4.0T engine. The water pump access requires removing the oil cooler and alternator drive assembly—not all Euro shops have done this procedure.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0128", "P0117"],
    trims: ["S8"]
  },

  // ========================================================
  // AUDI TTS (2009-2024) - 2.0T EA888
  // ========================================================
  {
    id: "audi-tts-cam-follower-hpfp-2009",
    make: "Audi",
    model: "TT",
    years: { start: 2009, end: 2015 },
    title: "HPFP Cam Follower Wear and High-Pressure Fuel Pump Failure (Mk2)",
    severity: "high",
    description: "The Audi TTS Mk2 (2009-2015) with the EA888 2.0 TFSI uses a high-pressure fuel pump (HPFP) driven directly by a dedicated lobe on the intake camshaft, with a cam follower (tappet) as the intermediary. The cam follower wears through its hardened surface over 30,000-50,000 miles, eventually allowing metal-to-metal contact between the HPFP and camshaft lobe. Once the camshaft lobe is worn, no amount of new cam followers will fix the issue—only a new camshaft ($2,000-$4,000) will restore fuel pump operation. If caught early, the cam follower is a $30 part that takes 30-60 minutes to replace. TTForum.co.uk and Audizine document this as a critical inspection item for all FSI/TFSI engines. The TTS's higher boost pressure increases fuel pump cycling, accelerating follower wear. This issue was largely resolved in Gen 3 EA888 engines (2015+) with a roller follower design.",
    symptoms: [
      "Engine stumbling or surging under load",
      "Loss of power during hard acceleration",
      "Check engine light with fuel pressure codes (P2294, P0087)",
      "Long cranking on startup",
      "Engine stalling at idle",
      "Ticking noise from fuel pump area (top of engine)"
    ],
    solution: "INSPECTION (every 20,000 miles): Remove HPFP (3 bolts) and inspect cam follower surface. If the hardened coating is wearing through (visible copper/brass color), replace follower immediately ($30-$50 part, 30-60 minutes labor). CRITICAL: Ensure cam lobe is at LOW point before reinstalling—if at peak, you'll compress the spring and can break the mounting bolts. If CAMSHAFT WORN (deep groove in lobe): Replace camshaft ($2,000-$4,000). If FUEL PUMP FAILED: Replace HPFP ($400-$800). PREVENTION: Inspect cam follower every 20,000 miles as routine maintenance. Add to every oil change checklist. Consider IE (Integrated Engineering) upgraded HPFP with roller follower to eliminate wear entirely.",
    estimatedCost: { low: 30, high: 4000 },
    recallInfo: "No recall. Cam follower inspection is recommended preventive maintenance every 20,000 miles.",
    communityRecommendations: [
      {
        type: "part",
        content: "INA cam follower 06D109309C is the OEM replacement (~$30). Replace every 20,000-30,000 miles as insurance. The cost of a follower vs a camshaft ($3,000+) makes regular replacement a no-brainer.",
        partBrand: "INA",
        partName: "HPFP Cam Follower",
        partNumber: "06D109309C",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "Integrated Engineering (IE) upgraded HPFP kit with roller follower design eliminates cam lobe wear entirely. Recommended for TTS owners who want to solve this permanently.",
        partBrand: "Integrated Engineering",
        partName: "High Pressure Fuel Pump Upgrade Kit",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "There are NO warning signs of minor cam follower wear other than removing and inspecting it visually. By the time you have symptoms (misfires, power loss), the camshaft may already be damaged. INSPECT REGULARLY.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P2294", "P0087", "P0088"],
    trims: ["TTS"]
  },
  {
    id: "audi-tts-timing-chain-tensioner-2009",
    make: "Audi",
    model: "TT",
    years: { start: 2009, end: 2015 },
    title: "Timing Chain Tensioner Failure (EA888 Gen 1/2 - Mk2 TTS)",
    severity: "high",
    description: "The Audi TTS Mk2 (2009-2015) with early EA888 engines (Gen 1 and Gen 2) suffers from timing chain tensioner failure, the same critical issue affecting A3, A4, and A5 models with this engine. The tensioner's ratchet mechanism wears, allowing the piston to retract when the engine is off. On restart, the slack chain can jump teeth on the camshaft sprockets, causing valve-to-piston contact and catastrophic engine destruction. The signature warning sign is a brief rattle (0.5-1 second) on cold or semi-warm startup as the tensioner takes up chain slack. The TTS's higher output tune puts more stress on the timing chain system, potentially accelerating wear. TTForum.co.uk documents numerous cases of complete engine destruction from ignored timing chain rattle. Early models (2009-2012) with the earlier tensioner revision are most at risk.",
    symptoms: [
      "Brief rattle on cold startup lasting 0.5-1 second",
      "Metallic rattling or clattering from front of engine",
      "Rattling that disappears once engine warms up",
      "Check engine light with timing correlation codes (P0016, P0017)",
      "Engine won't start (chain has jumped teeth)",
      "Catastrophic engine noise (bent valves—chain broke)"
    ],
    solution: "PREVENTIVE REPLACEMENT: Replace timing chain, tensioner, guides, and sprockets at 80,000-100,000 miles BEFORE symptoms appear ($2,000-$4,000). This is the MOST important preventive maintenance on the Mk2 TTS. IF RATTLING: Do NOT delay—the chain can jump at any startup. Schedule repair immediately. Use ONLY the latest OEM revised tensioner (06K109467K). IF CHAIN JUMPED: Engine likely destroyed—compression test all cylinders. Rebuild ($5,000-$8,000) or replacement engine ($6,000-$12,000). PREVENTION: Change oil every 5,000 miles with high-quality synthetic. Low oil level accelerates tensioner wear.",
    estimatedCost: { low: 2000, high: 12000 },
    recallInfo: "No official recall. Class action settlement covered some early EA888 models. Check with Audi dealer for eligibility.",
    communityRecommendations: [
      {
        type: "part",
        content: "Use ONLY the latest OEM revised tensioner 06K109467K. Earlier revisions (A through J) have higher failure rates. Aftermarket tensioners are NOT recommended for this critical component.",
        partBrand: "Genuine VW/Audi",
        partName: "Timing Chain Tensioner (Latest Revision K)",
        partNumber: "06K109467K",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If you hear ANY rattling on cold startup—even for half a second—this is the timing chain tensioner losing tension. The chain WILL jump eventually. This is not a 'let me wait and see' issue.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "If buying a used Mk2 TTS, ask if the timing chain tensioner has been replaced with the latest revision. If unknown, budget $2,000-$4,000 for immediate replacement as insurance.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0016", "P0017", "P0008", "P0009"],
    trims: ["TTS"]
  },
  {
    id: "audi-tts-carbon-buildup-2009",
    make: "Audi",
    model: "TT",
    years: { start: 2009, end: 2019 },
    title: "Carbon Buildup on Intake Valves (2.0 TFSI Direct Injection)",
    severity: "medium",
    description: "The Audi TTS (2009-2019) with the 2.0 TFSI engine experiences carbon buildup on intake valves due to direct fuel injection. Without fuel washing over the intake valves, PCV oil vapors bake into hard carbon deposits over time. The TTS's higher boost and higher engine temperatures compared to the base TT accelerate carbon accumulation. Symptoms typically appear between 40,000-70,000 miles and include rough idle, misfires, and power loss. TTForum.co.uk recommends walnut blasting every 30,000-50,000 miles as preventive maintenance. The 2020+ TTS with the EA888 Gen 3B received dual injection (port + direct), which significantly reduces this issue. One TTForum DIY documented a walnut blast at 114,000 miles with good results.",
    symptoms: [
      "Rough or unstable idle",
      "Cold start misfires",
      "Hesitation during acceleration",
      "Power loss at higher RPM",
      "Poor fuel economy",
      "Check engine light with misfire codes",
      "Soot on tailpipe tips"
    ],
    solution: "WALNUT BLASTING: Remove intake manifold and blast intake valves with crushed walnut shells ($300-$800). Repeat every 30,000-50,000 miles. IMPORTANT: Perform a leak-down test FIRST—if air leaks past intake valve, carbon and walnut debris can enter the combustion chamber and cause additional damage. CATCH CAN: Install oil catch can ($200-$400) to reduce PCV vapors reaching intake. OIL: Use high-quality synthetic and change every 5,000 miles. DRIVING: Regular spirited driving (Italian tuneup) helps slow buildup. NOTE: 2020+ TTS models with dual injection are much less affected.",
    estimatedCost: { low: 300, high: 800 },
    recallInfo: "No recall. Inherent to all direct-injection engines.",
    communityRecommendations: [
      {
        type: "tip",
        content: "TTForum members report walnut blasting costs $300-$600 at independent shops. DIY is feasible with a media blaster and takes 6-8 hours. Always do a leak-down test first.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "part",
        content: "034 Motorsport Catch Can Kit for MQB (Mk3 TTS) or 8J platform (Mk2 TTS). Significantly reduces carbon buildup rate between walnut blast services.",
        partBrand: "034 Motorsport",
        partName: "Catch Can Kit",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Even if your TTS runs fine, preventive walnut blasting at 50,000 miles is cheap insurance. The cost is $300-$600 vs potential valve damage from severe buildup.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304"],
    trims: ["TTS"]
  },
  {
    id: "audi-tts-water-pump-2009",
    make: "Audi",
    model: "TT",
    years: { start: 2009, end: 2024 },
    title: "Water Pump and Thermostat Housing Failure (2.0 TFSI)",
    severity: "medium",
    description: "The Audi TTS across Mk2 (2009-2015) and Mk3 (2016-2024) generations suffers from water pump and thermostat housing failures. The plastic impeller water pump has a notorious lifespan of approximately 60,000 miles. On Mk2 models, the timing belt-driven water pump should be replaced during timing belt service. On Mk3 models with the EA888 Gen 3, the integrated water pump/thermostat housing uses plastic construction that cracks and leaks coolant. The Mk3 is additionally covered by the VW/Audi water pump class action settlement (8 years/80,000 miles warranty extension for 2014-2021 models). TTForum.co.uk reports the water pump as one of the most common TTS failures, with many owners replacing preemptively at 60,000 miles. Ignoring the leak leads to overheating, warped heads, and blown head gaskets.",
    symptoms: [
      "Coolant leak under front of car (pink/green puddle)",
      "Sweet coolant smell under hood",
      "Overheating in stop-and-go traffic",
      "Temperature gauge rising above normal range",
      "Coolant warning light on dashboard",
      "Hissing or gurgling from engine bay",
      "Steam from engine compartment (severe case)"
    ],
    solution: "REPLACE water pump AND thermostat together ($600-$1,500). Mk2 TTS: Replace during timing belt service (80k-100k miles) to save labor—both are accessed together. Mk3 TTS (EA888 Gen 3): Check VW class action warranty extension first (8 years/80k miles for 2014-2021 models). Use OEM or high-quality parts (Hepu P672, Rein)—cheap pumps fail within 20,000 miles. Flush entire cooling system and refill with Audi G12++ or G13 coolant ONLY. USP Motorsports metal impeller kit is recommended for Mk3 TTS to prevent plastic impeller cracking. PREVENTION: Preemptive replacement at 60,000 miles before failure.",
    estimatedCost: { low: 600, high: 1500 },
    recallInfo: "No recall. VW/Audi class action extends water pump warranty to 8 years/80,000 miles for 2014-2021 models.",
    communityRecommendations: [
      {
        type: "part",
        content: "USP Motorsports metal impeller kit for Gen 3 EA888 prevents the plastic impeller cracking that causes Mk3 TTS failures. Highly recommended upgrade on TTForum.",
        partBrand: "USP Motorsports",
        partName: "Metal Impeller Kit",
        partNumber: "06L121111H-KT1",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Mk2 TTS owners: Replace water pump during timing belt service at 80k-100k miles. The components are accessed together—doing them separately doubles the labor cost.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Avoid Graf water pumps—TTForum and Audizine report frequent leaking from installation. Stick with OEM, Hepu, or USP metal impeller.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0128", "P0599"],
    trims: ["TTS"]
  },

  // ========================================================
  // AUDI R8 (2008-2024) - 4.2 V8 and 5.2 V10
  // ========================================================
  {
    id: "audi-r8-magnetic-ride-leak-2008",
    make: "Audi",
    model: "R8",
    years: { start: 2008, end: 2015 },
    title: "Magnetic Ride Suspension Damper Leak and Premature Failure",
    severity: "high",
    description: "The Audi R8 (2008-2015, Gen 1) equipped with the optional Magnetic Ride suspension experiences premature damper leaks and failures. The magnetic ride dampers use magnetorheological fluid (containing metallic particles) that is inherently abrasive to the damper's internal seals. Over time, the metallic particles wear through seals, causing fluid leaks and loss of damping control. Some owners report failures as early as 20,000 miles. Replacement OEM magnetic ride shocks cost approximately $1,800 each, with dealer quotes of $5,100-$8,000+ for a full set. R8Talk.com forums document this as one of the most expensive recurring maintenance items on the Gen 1 R8. Many owners convert to passive suspension (R8 Plus shocks or aftermarket coilovers) rather than replacing magnetic ride dampers repeatedly.",
    symptoms: [
      "Visible oil leak from shock absorber body",
      "Harsh or bouncy ride quality",
      "Clunking sounds from suspension",
      "Magnetic ride fault warning on dashboard",
      "Vehicle handles unpredictably over bumps",
      "One corner feels softer or harder than others",
      "Suspension feels undamped (excessive body roll)"
    ],
    solution: "OEM REPLACEMENT: Replace leaking magnetic ride shocks ($1,800 each, $5,100-$8,000+ for full set installed). OEM replacements use the same technology and will eventually fail again. REFURBISHED OPTION: Refurbished magnetic ride dampers from specialty rebuilders (approximately $1,000-$1,400 each). PASSIVE CONVERSION: Convert to R8 Plus passive shocks ($3,000-$4,000 for set—less than 2 OEM magnetic ride shocks) or aftermarket coilovers ($2,500-$5,000 for quality kit like KW, JRZ, or Ohlins). Passive conversion eliminates the failure mode permanently but removes adaptive ride control. PREVENTION: Limited—magnetic fluid degradation is inherent to the technology. Budget for replacement every 30,000-50,000 miles if keeping magnetic ride.",
    estimatedCost: { low: 2500, high: 8000 },
    recallInfo: "No recall. Magnetic ride dampers are wear items with limited lifespan.",
    communityRecommendations: [
      {
        type: "part",
        content: "KW V3 or JRZ RS Pro coilover kits are popular R8Talk.com-recommended alternatives to OEM magnetic ride. Eliminates the recurring failure and provides superior track performance.",
        partBrand: "KW Suspension",
        partName: "V3 Coilover Kit (R8 Gen 1)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "R8 Plus passive shocks are a direct bolt-in replacement that costs less than two OEM magnetic ride shocks. Many R8 owners prefer this conversion for daily driving reliability.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If you see oil weeping from a magnetic ride shock, replace it promptly. A failed damper causes uncontrolled wheel movement that affects handling safety, especially in a mid-engine supercar.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "suspension",
    dtcCodes: [],
    trims: ["4.2", "5.2"]
  },
  {
    id: "audi-r8-carbon-buildup-2008",
    make: "Audi",
    model: "R8",
    years: { start: 2008, end: 2015 },
    title: "Carbon Buildup on Intake Valves (4.2 V8 FSI and 5.2 V10 FSI)",
    severity: "medium",
    description: "The Audi R8 Gen 1 (2008-2015) with both the 4.2L V8 FSI and 5.2L V10 FSI engines develops carbon buildup on intake valves due to direct fuel injection. While the R8's higher RPM driving patterns help slow carbon accumulation compared to commuter cars, deposits still build over 60,000-100,000 miles. The V10 has 10 cylinders' worth of intake valves to clean, making walnut blasting significantly more expensive ($1,500+) than typical 4-cylinder applications. R8Talk.com forums report relatively few check engine lights directly attributable to carbon buildup, suggesting the R8's high-RPM nature partially self-cleans. However, power loss and rough idle can still occur. Carbon cleaning is recommended as preventive maintenance to maintain the engine's full performance potential.",
    symptoms: [
      "Subtle power loss at high RPM",
      "Rough idle when engine is cold",
      "Occasional misfires during cold start",
      "Slightly reduced throttle response",
      "Poor fuel economy (below expectations for engine size)",
      "Hesitation during aggressive acceleration"
    ],
    solution: "WALNUT BLASTING: Remove intake manifolds and blast all intake ports with walnut shells. V8 (4.2L): $800-$1,200. V10 (5.2L): $1,200-$2,000 due to 10 cylinders. Perform a leak-down test BEFORE walnut blasting to ensure intake valves seat properly. Repeat every 50,000-70,000 miles. CHEMICAL CLEANING: Less effective than walnut blasting but some owners use intake valve cleaners (BG Products, CRC) as interim maintenance. DRIVING HABITS: Regular high-RPM driving (the R8's natural habitat) helps slow carbon accumulation. PREVENTION: Use quality fuel (91+ octane) and change oil every 5,000 miles.",
    estimatedCost: { low: 800, high: 2000 },
    recallInfo: "No recall. Inherent to all direct-injection engines.",
    communityRecommendations: [
      {
        type: "tip",
        content: "R8Talk.com consensus: the R8's naturally high-RPM driving style significantly slows carbon buildup compared to commuter cars. If you drive spiritedly, you may go 70,000+ miles before needing cleaning.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "V10 walnut blasting is a big job—find a shop experienced with the R8 specifically. The mid-engine layout and 10-cylinder configuration make this more complex than typical Audi walnut blasting.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "Always perform a leak-down test before walnut blasting. If an intake valve is not seating properly, walnut shell debris can enter the combustion chamber.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304"],
    trims: ["4.2", "5.2"]
  },
  {
    id: "audi-r8-clutch-wear-2008",
    make: "Audi",
    model: "R8",
    years: { start: 2008, end: 2015 },
    title: "R-Tronic Clutch Premature Wear and Expensive Replacement",
    severity: "high",
    description: "The Audi R8 Gen 1 (2008-2015) equipped with the R-Tronic automated manual transmission experiences premature clutch wear due to the transmission's automated clutch engagement. The R-Tronic works by slowly slipping the clutch with each application of throttle to achieve smooth engagement, which wears the clutch faster than a manual transmission with a skilled driver. Clutch life varies dramatically by driving style: aggressive or track-focused drivers may need replacement before 10,000 miles, while conservative drivers may reach 40,000-60,000 miles. Clutch replacement on the R8 is extremely expensive ($5,500-$9,000) due to the mid-engine layout requiring significant disassembly. RepairPal estimates $8,042-$9,041 for the repair. R8Talk.com forums have extensive discussion about clutch lifespan monitoring via the car's onboard diagnostics (new clutch reads 8000, end of life reads 3000 on the clutch wear gauge).",
    symptoms: [
      "Clutch slip during hard acceleration (RPM rises without matching speed)",
      "Shuddering during low-speed engagement",
      "Difficulty engaging reverse on inclines",
      "R-Tronic shifts become jerky or delayed",
      "Burning smell during stop-and-go traffic",
      "Clutch wear indicator approaching 3000 on OBD scan",
      "Vehicle hesitates from standstill"
    ],
    solution: "CLUTCH REPLACEMENT: Replace clutch disc, pressure plate, throwout bearing, and resurface/replace flywheel ($5,500-$9,000 at dealer, $4,000-$6,000 at independent specialist). The mid-engine layout requires dropping the transmission—8-12 hours of labor. DRIVING TECHNIQUE: Minimize R-Tronic slip by avoiding creeping in traffic (use brake hold instead). Use manual mode in stop-and-go traffic. Avoid reverse on steep inclines. For TRACK USE: Budget for clutch replacement every 10,000-20,000 miles—R-Tronic track driving is hard on clutches. ALTERNATIVE: S-Tronic (Gen 2 R8) wet dual-clutch is significantly more durable for daily driving.",
    estimatedCost: { low: 4000, high: 9000 },
    recallInfo: "No recall. Clutch is a wear item, and R-Tronic automated engagement accelerates wear.",
    communityRecommendations: [
      {
        type: "tip",
        content: "Monitor clutch wear via VCDS/OBD scan. New clutch reads ~8000, end of life is ~3000. Check every oil change to track wear rate and plan replacement proactively.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "In stop-and-go traffic, hold the brake firmly rather than creeping with throttle. The R-Tronic slips the clutch to creep, dramatically accelerating wear. Use Sport mode for crisper (less slip) engagement.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "R-Tronic R8s used primarily on track can consume a clutch in under 10,000 miles. Budget accordingly. The manual transmission R8 is significantly cheaper to maintain for track use.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "transmission",
    dtcCodes: [],
    trims: ["4.2", "5.2"]
  },
  {
    id: "audi-r8-ac-compressor-v8-2008",
    make: "Audi",
    model: "R8",
    years: { start: 2008, end: 2012 },
    title: "A/C Compressor Failure Requiring Engine-Out Repair (4.2 V8)",
    severity: "high",
    description: "The Audi R8 V8 (2008-2012) has a critical A/C compressor placement issue—the compressor is located in a position that requires the engine to be removed for replacement. This mid-engine layout design decision means a relatively common A/C compressor failure becomes an extraordinarily expensive repair. R8Talk.com forums report A/C compressor failures occurring relatively early in the vehicle's life, sometimes before 50,000 miles. The compressor failure itself is a standard automotive issue, but the $5,000-$8,000 repair cost (driven almost entirely by labor for engine removal and reinstallation) makes it one of the most disproportionately expensive repairs on any sports car. The V10 model has slightly better compressor access. Some R8 owners choose to simply live without A/C rather than pay for the repair.",
    symptoms: [
      "A/C blows warm air only",
      "A/C clutch clicking but not engaging",
      "Unusual grinding or squealing from engine bay when A/C is on",
      "A/C works intermittently",
      "Refrigerant leak (oily residue around compressor)",
      "A/C system low pressure warning"
    ],
    solution: "A/C COMPRESSOR REPLACEMENT: Requires ENGINE REMOVAL on the V8 model. Total repair cost $5,000-$8,000 ($1,000-$1,500 for parts, $4,000-$6,500 for labor). When the engine is out, strongly recommended to also address: motor mounts, clutch inspection, and any other components that benefit from engine-out access. ALTERNATIVE: Some specialty R8 shops have developed methods to access the compressor with partial disassembly (removing subframe) rather than full engine removal, potentially reducing labor to $3,000-$4,000. PREVENTION: Run the A/C regularly (even in winter for 5-10 minutes monthly) to keep compressor seals lubricated.",
    estimatedCost: { low: 3000, high: 8000 },
    recallInfo: "No recall. Design limitation of mid-engine V8 layout.",
    communityRecommendations: [
      {
        type: "tip",
        content: "If you need A/C compressor replacement, bundle it with any other engine-area repairs (motor mounts, clutch inspection, timing chain service). You're paying for engine removal regardless—maximize the value.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Ask specialty R8 shops about subframe-drop methods that avoid full engine removal. Some experienced shops can access the compressor this way, saving $2,000-$3,000 in labor.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If your A/C starts making grinding noises, get it diagnosed quickly. A seized compressor can break the serpentine belt and damage other accessories, compounding an already expensive repair.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "electrical",
    dtcCodes: [],
    trims: ["4.2"]
  },
  {
    id: "audi-r8-v8-engine-bearing-2008",
    make: "Audi",
    model: "R8",
    years: { start: 2008, end: 2015 },
    title: "Rod Bearing Wear and Engine Failure Risk (4.2 V8 FSI)",
    severity: "high",
    description: "The Audi R8 V8 (2008-2015) with the 4.2L FSI V8 has reported cases of connecting rod bearing failure, leading to catastrophic engine destruction. The high-revving V8 (redline at 8,250 RPM) puts significant stress on rod bearings, particularly on vehicles driven hard on track or with extended high-RPM use. The 4.2L FSI uses cracked connecting rods made of 36MnVS4 steel with tight tolerances, making the engine sensitive to oil quality and bearing wear. Rod knock (a distinctive deep knocking sound that increases with RPM) is the primary warning sign. If caught early, rod bearing replacement costs $2,000-$5,000. If the bearing fails catastrophically, connecting rod can punch through the engine block, requiring a complete engine replacement ($13,000+ for exchange engine from Audi, $8,000-$15,000 from rebuilders). R8Talk.com and AMTuned document engine rebuild programs specifically for this issue.",
    symptoms: [
      "Deep knocking or tapping noise from engine that increases with RPM",
      "Knocking noise worse when engine is warm",
      "Metal shavings or debris in oil (visible on oil filter cut-open)",
      "Low oil pressure warning light",
      "Check engine light with misfire codes",
      "Sudden catastrophic engine noise (rod failure)"
    ],
    solution: "EARLY DETECTION (knocking noise only): Rod bearing replacement ($2,000-$5,000). Must be caught EARLY before bearing material migrates through oil system. Cut open every oil filter at oil change to inspect for metallic debris. CATASTROPHIC FAILURE: Engine replacement ($13,000+ Audi exchange, $8,000-$15,000 rebuilt from AMTuned or specialist rebuilder). ARP 2000 reinforced connecting rod bolts are available as a preventive upgrade during any engine-out service. PREVENTION: Use ONLY premium 5W-40 synthetic oil. Change oil every 5,000 miles maximum. NEVER exceed oil change intervals—the high-revving V8 is extremely sensitive to oil condition. For track use, change oil after every 2-3 track days.",
    estimatedCost: { low: 2000, high: 15000 },
    recallInfo: "No recall. Rod bearing wear is related to driving conditions and maintenance.",
    communityRecommendations: [
      {
        type: "part",
        content: "ARP 2000 reinforced connecting rod bolt kit for the Audi R8 4.2 V8 FSI provides stronger fastening than OEM. Recommended during any engine rebuild or bearing replacement.",
        partBrand: "ARP",
        partName: "2000 Series Connecting Rod Bolt Kit (R8 4.2 V8 FSI)",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "tip",
        content: "Cut open your oil filter at every oil change. Metal particles in the filter paper are the earliest warning of bearing wear—before any audible symptoms. Cheap insurance for a $13,000 engine.",
        upvotes: 0,
        needsReview: false
      },
      {
        type: "warning",
        content: "If you hear deep knocking from the engine, DO NOT drive the car. Tow it to a specialist. Continued driving with a failing rod bearing will result in catastrophic engine destruction within miles.",
        upvotes: 0,
        needsReview: false
      }
    ],
    category: "engine",
    dtcCodes: [],
    trims: ["4.2"]
  }
];

// Add all new issues
let addedCount = 0;
for (const issue of newIssues) {
  const exists = data.issues.some(i => i.id === issue.id);
  if (exists) {
    console.log(`SKIPPED (already exists): ${issue.id}`);
  } else {
    data.issues.push(issue);
    addedCount++;
    console.log(`ADDED: ${issue.id}`);
  }
}

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log(`\nDone. Added ${addedCount} new issues. Total issues: ${data.issues.length}`);
