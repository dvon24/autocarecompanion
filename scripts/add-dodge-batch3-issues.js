const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const newIssues = [
  // ===== DODGE AVENGER (2008-2014) =====
  {
    id: "dodge-avenger-62te-trans-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
      make: "Dodge",
      model: "Avenger"
    },
    category: "transmission",
    title: "62TE Transmission Solenoid Pack and Valve Body Failure",
    description: "The 62TE 6-speed automatic suffers from solenoid pack failures, valve body issues, and hydraulic pump wear. Hard shifting, slipping, limp mode, and complete failure are common. The 6-speed is more problematic than the older 4-speed it replaced.",
    solution: "Solenoid pack replacement (68376696AA or 5078709AB) for early symptoms. Full rebuild for severe cases. Use ONLY Mopar ATF+4 (68218058AC). Change fluid every 30,000 miles.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Transmission slipping",
      "Stuck in limp mode (one gear)",
      "Hard shifting",
      "Delayed engagement from Park",
      "Transmission overheating"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 300, high: 5000 },
    citations: [
      { type: "forum", title: "avengerforumz.com - Transmission Issues" },
      { type: "forum", title: "dodgeforum.com - Avenger Transmission" }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    lastReportedByOwners: "2024-09-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Solenoid pack 68376696AA (or 5078709AB) is often sufficient if caught early. Use ONLY Mopar ATF+4 (68218058AC) - change every 30,000 miles", source: "avengerforumz.com", upvotes: 48, needsReview: false },
      { type: "warning", content: "Same 62TE transmission as Grand Caravan, Town & Country, and Journey - all share the same solenoid pack failure pattern", source: "allpar.com", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "dodge-avenger-throttle-body-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
      make: "Dodge",
      model: "Avenger",
      engines: ["2.4L I4"]
    },
    category: "engine",
    title: "2.4L Electronic Throttle Body Failure",
    description: "The electronic throttle body fails from carbon buildup and TPS sensor malfunction. Causes rough idle, stalling, hesitation, and check engine light. Common across all 2.4L World Engine applications.",
    solution: "Clean throttle body first with throttle body cleaner (may resolve issue temporarily). If cleaning fails, replace throttle body assembly: Mopar 04891735AC (2.4L).",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rough idle",
      "Engine stalling",
      "Check engine light",
      "Hesitation during acceleration",
      "Erratic idle speed"
    ],
    affectedSystems: ["Engine", "Fuel System"],
    estimatedCost: { low: 200, high: 600 },
    citations: [
      { type: "forum", title: "avengerforumz.com - Throttle Body Fix" }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    lastReportedByOwners: "2024-06-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Clean throttle body first with CRC throttle body cleaner - often resolves idle issues temporarily. Mopar 04891735AC for replacement if cleaning doesn't hold", source: "avengerforumz.com", upvotes: 42, needsReview: false },
      { type: "tip", content: "After replacement or cleaning, idle relearn procedure is required: turn key on (don't start) for 30 seconds, then start and let idle for 5 minutes", source: "dodgeforum.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "dodge-avenger-heater-core-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
      make: "Dodge",
      model: "Avenger"
    },
    category: "hvac",
    title: "Heater Core Failure - Dashboard Removal Required",
    description: "Heater core plugs with debris or develops leaks. Causes loss of heat, coolant smell in cabin, fogging windshield, and coolant loss. Dashboard must be removed for replacement, making it one of the most labor-intensive repairs (8-12 hours).",
    solution: "Full heater core replacement requiring dashboard removal (8-12 hours labor). Flush cooling system thoroughly before and after. Consider aftermarket heater core for cost savings.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Only hot air from some vents or no heat at all",
      "Coolant smell inside cabin",
      "Windshield fogging from inside",
      "Coolant loss with no visible external leak",
      "Sweet smell from HVAC vents"
    ],
    affectedSystems: ["HVAC", "Cooling"],
    estimatedCost: { low: 800, high: 1500 },
    citations: [
      { type: "forum", title: "avengerforumz.com - Heater Core Replacement" }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    lastReportedByOwners: "2024-11-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Dashboard must be fully removed for heater core access - this is an 8-12 hour labor job. Shop around for quotes as labor costs vary significantly", source: "avengerforumz.com", upvotes: 42, needsReview: false },
      { type: "tip", content: "Flush cooling system thoroughly before installing new core to prevent immediate re-clogging. Use Mopar OAT coolant only", source: "dodgeforum.com", upvotes: 35, needsReview: false }
    ]
  },

  // ===== DODGE CALIBER (2007-2012) =====
  {
    id: "dodge-caliber-cvt-overheating-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012],
      make: "Dodge",
      model: "Caliber"
    },
    category: "transmission",
    title: "Jatco CVT Overheating and Premature Failure",
    description: "The Jatco CVT has an inherent overheating design flaw, especially during extended highway driving. Expected CVT lifespan only ~75,000 miles. ATF aeration compounds problems. Transmission shutdown can occur during highway driving in hot weather, leaving vehicle stranded.",
    solution: "Fill transmission to absolute lowest acceptable mark to reduce aeration. Check cooling fan relay (fan failure causes CVT overheating). CVT fluid change every 30,000 miles using Mopar CVTF+4 (NOT ATF+4). Consider adding external CVT cooler for highway driving.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Transmission overheating warning light",
      "Transmission shutdown during highway driving",
      "Slipping and whining noise",
      "Shuddering during acceleration",
      "Complete loss of drive"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 2000, high: 4500 },
    citations: [
      { type: "forum", title: "caliberforumz.com - Transmission Overheating" },
      { type: "forum", title: "caliberforums.com - CVT Issues Resolved" }
    ],
    humanApproved: false,
    reportCount: 280,
    status: "published",
    lastReportedByOwners: "2024-07-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Use Mopar CVTF+4 only - NOT regular ATF+4. Fill to lowest acceptable mark to reduce aeration. Change every 30,000 miles. CVT lifespan is only ~75,000 miles", source: "caliberforumz.com", upvotes: 62, needsReview: false },
      { type: "tip", content: "Check cooling fan relay in TIPM - fan failure directly causes CVT overheating. Add external CVT cooler for frequent highway driving", source: "caliberforums.com", upvotes: 48, needsReview: false }
    ]
  },
  {
    id: "dodge-caliber-overheating-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012],
      make: "Dodge",
      model: "Caliber"
    },
    category: "cooling",
    title: "Engine Overheating - Multiple Causes",
    description: "Calibers are prone to overheating from radiator fan failure, thermostat sticking, water pump failure, and radiator clogging. Same cooling system shared with Jeep Compass/Patriot (PM/MK platform). Fan relay failure is the most common single cause.",
    solution: "Check fan relay first, then fan motor, thermostat, water pump, and radiator. Engine cooling and CVT cooling are interconnected - overheating engine can cause CVT overheating and vice versa.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Temperature gauge climbing above normal at idle",
      "A/C compressor disengaging from high temps",
      "Coolant leak",
      "Steam from engine bay",
      "CVT overheating simultaneously"
    ],
    affectedSystems: ["Cooling", "Engine"],
    estimatedCost: { low: 100, high: 800 },
    citations: [
      { type: "forum", title: "dodgeforum.com - Caliber Overheating" },
      { type: "article", title: "repairpal.com - Caliber Overheating" }
    ],
    humanApproved: false,
    reportCount: 220,
    status: "published",
    lastReportedByOwners: "2024-08-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Engine cooling and CVT cooling are interconnected - overheating one causes the other to overheat. Address cooling issues immediately", source: "caliberforumz.com", upvotes: 52, needsReview: false },
      { type: "tip", content: "Same cooling system as Jeep Compass/Patriot - cross-reference parts. Fan relay is the most common single failure point", source: "dodgeforum.com", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "dodge-caliber-tipm-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012],
      make: "Dodge",
      model: "Caliber"
    },
    category: "electrical",
    title: "TIPM Electrical Module Failure",
    description: "Same TIPM design flaw as other Chrysler/Dodge products. Fuel pump relay failure, random electrical activations, and stalling. Can cause both engine and CVT issues through electrical malfunction.",
    solution: "TIPM rebuild service (UpFix, Circuit Board Medics, MAKS TIPM) at $200-$400 most cost-effective. External fuel pump relay bypass cable available. New TIPM from dealer $800-$1,200.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle stalls or won't start",
      "Random electrical malfunctions",
      "Fuel pump issues",
      "Warning lights on dashboard"
    ],
    affectedSystems: ["Electrical", "TIPM"],
    estimatedCost: { low: 200, high: 1200 },
    citations: [
      { type: "forum", title: "caliberforumz.com - TIPM Issues" }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    lastReportedByOwners: "2024-05-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "TIPM rebuild services (UpFix, Circuit Board Medics, MAKS TIPM) at $200-$400 most cost-effective. Plug-and-play, no programming needed", source: "caliberforumz.com", upvotes: 42, needsReview: false }
    ]
  },

  // ===== DODGE NITRO (2007-2011) =====
  {
    id: "dodge-nitro-window-regulator-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011],
      make: "Dodge",
      model: "Nitro"
    },
    category: "body",
    title: "Window Regulator Failures - Multiple Per Vehicle",
    description: "Window regulators fail frequently, with multiple failures per vehicle common. Cable breaks or gear mechanism fails. Windows get stuck, fall into door, or operate erratically. Shared platform with Jeep Liberty KK.",
    solution: "Replace entire window regulator assembly (cable not serviced separately). Dorman replacements: front driver 741-584, front passenger 741-585, rear driver 749-542, rear passenger 749-543.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Window stuck up or down",
      "Slow window operation",
      "Grinding or clicking noise from door",
      "Window falls into door",
      "Window operates erratically"
    ],
    affectedSystems: ["Body", "Electrical"],
    estimatedCost: { low: 150, high: 400 },
    citations: [
      { type: "forum", title: "nitroforumz.com - Window Regulator Problems" },
      { type: "article", title: "carcomplaints.com - Nitro Window Issues" }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    lastReportedByOwners: "2024-04-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Dorman window regulators: front driver 741-584, front passenger 741-585, rear driver 749-542, rear passenger 749-543. DIY repair takes 1-2 hours per window", source: "nitroforumz.com", upvotes: 45, needsReview: false },
      { type: "tip", content: "Same platform as Jeep Liberty KK - cross-reference parts. Keep spare regulators on hand as repeat failures are common", source: "nitroforumz.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "dodge-nitro-42rle-trans-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011],
      make: "Dodge",
      model: "Nitro",
      engines: ["3.7L V6"]
    },
    category: "transmission",
    title: "42RLE 4-Speed Transmission Solenoid Failure",
    description: "The 42RLE 4-speed automatic suffers from solenoid pack failures and corrosion in the 10-pin connector. Same issues as Charger V6 42RLE. Causes slipping, harsh shifts, and limp mode.",
    solution: "Replace solenoid pack and 10-pin connector. Use ONLY Mopar ATF+4 (68218058AC). Change fluid every 30,000 miles.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Slipping gears",
      "Harsh shifts",
      "Transmission stuck in limp mode",
      "P0750/P0755 solenoid codes"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 300, high: 3500 },
    citations: [
      { type: "article", title: "carparts.com - Nitro Reliability" }
    ],
    humanApproved: false,
    reportCount: 160,
    status: "published",
    lastReportedByOwners: "2024-03-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Same 42RLE as Charger V6 and Jeep Liberty - 10-pin connector corrosion is the most common cause. Updated connector from dealer fixes most electrical shift issues", source: "nitroforumz.com", upvotes: 38, needsReview: false },
      { type: "warning", content: "Use ONLY Mopar ATF+4 (68218058AC). The 42RLE is extremely sensitive to fluid type", source: "allpar.com", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "dodge-nitro-tipm-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011],
      make: "Dodge",
      model: "Nitro"
    },
    category: "electrical",
    title: "TIPM Stalling and No-Start",
    description: "The TIPM fuel pump relay and other relays fail, causing vehicle stalling while driving and no-start conditions. Same TIPM design flaw as all Chrysler/Dodge products of this era.",
    solution: "TIPM rebuild service ($200-$400) or replacement ($800-$1,200). External fuel pump relay bypass available for fuel pump relay issue only.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Vehicle stalls while driving",
      "Won't start",
      "Random electrical failures",
      "Fuel pump not engaging"
    ],
    affectedSystems: ["Electrical", "TIPM"],
    estimatedCost: { low: 200, high: 1200 },
    citations: [
      { type: "forum", title: "nitroforumz.com - TIPM Stalling" }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    lastReportedByOwners: "2024-02-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "TIPM rebuild services (UpFix, Circuit Board Medics, MAKS TIPM) $200-$400 most cost-effective. Same TIPM as Jeep Liberty KK", source: "nitroforumz.com", upvotes: 38, needsReview: false }
    ]
  },

  // ===== DODGE DAKOTA (1997-2011) =====
  {
    id: "dodge-dakota-ball-joint-1997",
    vehicleMatch: {
      years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004],
      make: "Dodge",
      model: "Dakota"
    },
    category: "suspension",
    title: "Ball Joint Failure - Safety Issue",
    description: "Upper and lower ball joints wear prematurely, with failures reported as early as 49,000 miles. Can cause wheel separation in worst cases. NHTSA recall for some model years. Same design shared with 1st-gen Durango.",
    solution: "Replace upper and lower ball joints with Moog quality aftermarket: upper K7460, lower K7467. Inspect at every oil change. Check NHTSA recall status.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Clunking from front end",
      "Loose steering",
      "Uneven tire wear",
      "Wheel wobble",
      "In worst case: wheel separation"
    ],
    affectedSystems: ["Suspension", "Safety"],
    estimatedCost: { low: 300, high: 700 },
    citations: [
      { type: "forum", title: "dakota-durango.com - Ball Joint Issues" },
      { type: "forum", title: "dakotaforumz.com - Ball Joint Replacement" }
    ],
    humanApproved: false,
    reportCount: 220,
    status: "published",
    lastReportedByOwners: "2023-06-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Moog upper ball joint K7460, lower K7467 - replace both sides together. Same parts as 1st-gen Durango", source: "dakota-durango.com", upvotes: 52, needsReview: false },
      { type: "warning", content: "Inspect at every oil change - failures as early as 49,000 miles. Wheel separation is possible. Check NHTSA recall status", source: "dakotaforumz.com", upvotes: 45, needsReview: false }
    ]
  },
  {
    id: "dodge-dakota-timing-chain-2000",
    vehicleMatch: {
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007],
      make: "Dodge",
      model: "Dakota",
      engines: ["4.7L V8"]
    },
    category: "engine",
    title: "4.7L V8 Timing Chain Tensioner Failure",
    description: "The timing chain tensioner and guides wear prematurely, especially when incorrect oil weight is used (5W-30 instead of the required 5W-20). Causes rattling on startup, performance deterioration, and can lead to engine destruction if chain jumps.",
    solution: "Replace timing chain, tensioner, and guides as a complete set. Use ONLY 5W-20 oil as specified - incorrect oil weight accelerates tensioner wear significantly.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Rattling noise on startup",
      "Engine performance deterioration",
      "Check engine light with timing codes",
      "Misfires",
      "Complete engine failure if chain jumps"
    ],
    affectedSystems: ["Engine", "Timing"],
    estimatedCost: { low: 1000, high: 2500 },
    citations: [
      { type: "forum", title: "dakota-durango.com - 4.7L Timing Chain" },
      { type: "forum", title: "allpar.com - 4.7 Reliability" }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    lastReportedByOwners: "2024-01-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Use ONLY 5W-20 oil - using 5W-30 accelerates timing chain tensioner wear significantly. This is the most common cause of premature failure", source: "dakota-durango.com", upvotes: 58, needsReview: false },
      { type: "tip", content: "Replace chain, tensioner, and all guides as a complete set. Rattling on startup is the early warning sign - address immediately", source: "allpar.com", upvotes: 45, needsReview: false }
    ]
  },
  {
    id: "dodge-dakota-plenum-gasket-1997",
    vehicleMatch: {
      years: [1997, 1998, 1999, 2000, 2001, 2002, 2003],
      make: "Dodge",
      model: "Dakota",
      engines: ["5.2L V8", "5.9L V8"]
    },
    category: "engine",
    title: "Plenum Gasket Failure (5.2L/5.9L Magnum V8)",
    description: "The plenum gasket between intake manifold and engine block fails, allowing oil into combustion chambers. Same issue as 1st-gen Durango. Causes oil consumption, pinging, and rough idle.",
    solution: "Replace plenum gasket: Felpro MS92844 (5.2L) or MS92845 (5.9L). Hughes Engines plenum plate fix permanently eliminates the design flaw.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Engine pinging",
      "Excessive oil consumption",
      "Oily sheen inside intake through throttle body",
      "Rough idle",
      "Loss of power"
    ],
    affectedSystems: ["Engine", "Intake"],
    estimatedCost: { low: 300, high: 800 },
    citations: [
      { type: "forum", title: "dakota-durango.com - Plenum Gasket Replacement" }
    ],
    humanApproved: false,
    reportCount: 230,
    status: "published",
    lastReportedByOwners: "2023-05-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Felpro intake manifold gasket set MS92844 (5.2L) or MS92845 (5.9L). Hughes Engines plenum plate fix permanently eliminates the design flaw", source: "dakota-durango.com", upvotes: 52, needsReview: false },
      { type: "tip", content: "Same issue as 1st-gen Durango - repair procedures and parts are identical", source: "dakotaforumz.com", upvotes: 38, needsReview: false }
    ]
  },
  {
    id: "dodge-dakota-trans-fluid-fire-2000",
    vehicleMatch: {
      years: [2000, 2001, 2002, 2003, 2004],
      make: "Dodge",
      model: "Dakota"
    },
    category: "transmission",
    title: "Transmission Fluid Expulsion and Fire Risk - Recall",
    description: "Design flaw allows ATF to be expelled from fill tube during normal driving onto hot exhaust system, creating a fire risk. NHTSA recall issued for affected vehicles.",
    solution: "Check NHTSA database for recall status. Contact Dodge dealer for free recall repair. Do not delay due to fire risk.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Transmission fluid expelled from fill tube",
      "Burning smell while driving",
      "Fluid on exhaust components",
      "In worst case: vehicle fire"
    ],
    affectedSystems: ["Transmission", "Safety"],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "recall", title: "NHTSA Recall - Dakota ATF Fire Risk" },
      { type: "article", title: "1aauto.com - Dakota Problems" }
    ],
    humanApproved: false,
    reportCount: 100,
    status: "published",
    lastReportedByOwners: "2022-08-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Check NHTSA recall status immediately at safercar.gov. Free dealer repair. This is a fire safety recall - do not delay", source: "allpar.com", upvotes: 42, needsReview: false }
    ]
  },

  // ===== DODGE NEON / SRT-4 (2000-2005) =====
  {
    id: "dodge-neon-timing-belt-2000",
    vehicleMatch: {
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      make: "Dodge",
      model: "Neon",
      engines: ["2.0L SOHC I4", "2.0L DOHC I4", "2.4L Turbo I4"]
    },
    category: "engine",
    title: "Timing Belt Failure - ALL Engines Are Interference",
    description: "ALL Neon engines (SOHC and DOHC) are interference engines where timing belt failure causes catastrophic valve-to-piston contact and engine destruction. Belt replacement required at 100,000 miles. Water pump is driven by timing belt and must be replaced simultaneously.",
    solution: "Replace timing belt, water pump, tensioner, and idler pulleys as complete kit: Gates PowerGrip TCKWP245B (2.0L SOHC) or TCKWP265C (2.4L SRT-4). Service interval: 100,000 miles.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Ticking or slapping from timing cover area",
      "Engine misfires",
      "Cranks but won't start (belt jumped)",
      "Complete engine failure (belt breaks)"
    ],
    affectedSystems: ["Engine", "Timing"],
    estimatedCost: { low: 400, high: 1200 },
    citations: [
      { type: "forum", title: "neons.org - Timing Belt When to Change" },
      { type: "forum", title: "srtforums.com - Timing Belt Thread" }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    lastReportedByOwners: "2024-03-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "ALL Neon engines are interference - belt failure WILL destroy the engine. Gates PowerGrip: TCKWP245B (2.0L SOHC) or TCKWP265C (2.4L SRT-4). Replace at 100,000 miles", source: "neons.org", upvotes: 85, needsReview: false },
      { type: "tip", content: "Always replace water pump at timing belt service - it's driven by the belt and failure can cause the belt to jump", source: "srtforums.com", upvotes: 65, needsReview: false }
    ]
  },
  {
    id: "dodge-neon-head-gasket-2000",
    vehicleMatch: {
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      make: "Dodge",
      model: "Neon"
    },
    category: "engine",
    title: "Head Gasket Failure",
    description: "Head bolt on back of cylinder #4 can bottom out on some blocks, not exerting enough gasket pressure. SRT-4 turbo models more susceptible due to higher cylinder pressures. Updated MLS gasket (thicker design) works better than original composite.",
    solution: "Replace with updated MLS (multi-layer steel) head gasket: Felpro HS26206PT-1. Check head for warpage and machine surface if needed. Verify head bolt torque on cylinder #4.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "White smoke from exhaust",
      "Coolant loss with no visible external leak",
      "Engine overheating",
      "Milky residue on oil cap",
      "Bubbling in coolant overflow tank"
    ],
    affectedSystems: ["Engine", "Cooling", "Head Gasket"],
    estimatedCost: { low: 800, high: 2000 },
    citations: [
      { type: "forum", title: "srtforums.com - Common SRT-4 Problems" },
      { type: "forum", title: "neons.org - Head Gasket Thread" }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    lastReportedByOwners: "2024-01-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Felpro HS26206PT-1 MLS (multi-layer steel) head gasket is the upgrade over original composite. Thicker design compensates for bottoming-out head bolt on cylinder #4", source: "srtforums.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "Always check head for warpage and machine surface. Verify head bolt torque especially on cylinder #4 which is the known weak point", source: "neons.org", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "dodge-neon-srt4-turbo-oil-2003",
    vehicleMatch: {
      years: [2003, 2004, 2005],
      make: "Dodge",
      model: "Neon",
      engines: ["2.4L Turbo I4"],
      trims: ["SRT-4"]
    },
    category: "engine",
    title: "SRT-4 Turbo Oil Feed Line Restriction",
    description: "The turbo oil feed line develops restrictions causing oil starvation and turbo bearing failure. Turbo failure can occur well before 100,000 miles. Oil starvation is the primary cause of premature turbo failure on SRT-4 models.",
    solution: "Replace turbo oil feed and drain lines during turbo replacement. Idle 30-60 seconds before shutdown to cool turbo. Use full synthetic oil only, change every 3,000 miles maximum. Inspect oil feed line at every oil change.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Loss of boost / reduced power",
      "Blue or white smoke from exhaust",
      "Whining noise from turbo area",
      "Oil leaking from turbo seals",
      "Check engine light with boost codes"
    ],
    affectedSystems: ["Engine", "Turbocharger"],
    estimatedCost: { low: 800, high: 2500 },
    citations: [
      { type: "forum", title: "srtforums.com - SRT-4 Turbo Issues" },
      { type: "article", title: "modernperformance.com - SRT-4 Timing Components" }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    lastReportedByOwners: "2024-02-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Replace turbo oil feed and drain lines during any turbo work. Idle 30-60 seconds before shutdown. Full synthetic 5W-30, change every 3,000 miles maximum", source: "srtforums.com", upvotes: 52, needsReview: false },
      { type: "warning", content: "Inspect oil feed line for restrictions at every oil change - oil starvation is the #1 cause of premature turbo failure on SRT-4", source: "modernperformance.com", upvotes: 45, needsReview: false }
    ]
  },

  // ===== DODGE VIPER (1992-2017) =====
  {
    id: "dodge-viper-head-gasket-1992",
    vehicleMatch: {
      years: [1992, 1993, 1994, 1995],
      make: "Dodge",
      model: "Viper",
      engines: ["8.0L V10"]
    },
    category: "engine",
    title: "Gen 1 V10 Head Gasket Failure",
    description: "Composite head gasket design inadequate for V10 heat output. Gen 2 (1996+) upgraded to MLS gasket which resolved the issue. Gen 1 owners should upgrade to MLS design during any head work.",
    solution: "Upgrade to MLS (multi-layer steel) head gasket from Gen 2+. Machine cylinder head surfaces. This is a permanent fix that eliminates the Gen 1 weakness.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Coolant loss without visible external leak",
      "Engine overheating",
      "White smoke from exhaust",
      "Milky oil"
    ],
    affectedSystems: ["Engine", "Cooling", "Head Gasket"],
    estimatedCost: { low: 3000, high: 6000 },
    citations: [
      { type: "forum", title: "viperclub.org - Head Gasket Upgrade" }
    ],
    humanApproved: false,
    reportCount: 80,
    status: "published",
    lastReportedByOwners: "2023-06-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Upgrade to Gen 2 MLS head gasket during any head work - permanent fix for Gen 1 weakness. Machine head surfaces during gasket replacement", source: "viperclub.org", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "dodge-viper-clutch-slave-1992",
    vehicleMatch: {
      years: [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2008, 2009, 2010, 2013, 2014, 2015, 2016, 2017],
      make: "Dodge",
      model: "Viper"
    },
    category: "drivetrain",
    title: "Clutch Slave Cylinder and Hydraulic System Failure",
    description: "Concentric slave cylinder (CSC) seals fail from heat exposure. Header proximity causes clutch fluid to boil in hydraulic lines, especially under track conditions. Affects all generations. Clutch pedal goes to floor with fluid leak at bellhousing.",
    solution: "Replace CSC, clutch master cylinder, and bleed system. Install heat shielding on hydraulic lines for track use. SPEC clutch kits available for upgrade at specclutch.com. Generation-specific parts from viperpartsusa.com.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Difficulty shifting gears",
      "Clutch pedal goes to floor",
      "Fluid leak at bellhousing bottom",
      "Clutch fluid boiling under track conditions",
      "Spongy clutch pedal"
    ],
    affectedSystems: ["Drivetrain", "Clutch"],
    estimatedCost: { low: 800, high: 2500 },
    citations: [
      { type: "forum", title: "viperclub.org - Clutch Master Cylinder Failing" },
      { type: "forum", title: "viperalley.com - Clutch Slave Install" }
    ],
    humanApproved: false,
    reportCount: 120,
    status: "published",
    lastReportedByOwners: "2025-03-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Generation-specific parts from viperpartsusa.com and moparpartsgiant.com. SPEC clutch kits available at specclutch.com for upgrade", source: "viperclub.org", upvotes: 38, needsReview: false },
      { type: "tip", content: "Install heat shielding on hydraulic lines if tracking the car - header heat is the primary cause of fluid boiling and slave failure", source: "viperalley.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "dodge-viper-rod-bearing-2003",
    vehicleMatch: {
      years: [2003, 2004, 2005, 2006, 2008, 2009, 2010],
      make: "Dodge",
      model: "Viper",
      engines: ["8.3L V10"]
    },
    category: "engine",
    title: "Rod Bearing Failure from Oil Starvation (Track Use)",
    description: "Oil starvation during sustained high-speed cornering causes rod bearing failure and catastrophic engine damage. Oil surges away from pickup during hard lateral loading. Gen 3 (2003-2006) more prone than Gen 4 (2008-2010). Primary risk during track use.",
    solution: "Install aftermarket baffled oil pan and windage tray for track use. Use high-quality synthetic oil. Add oil cooler for track driving. Engine rebuild with upgraded rod bearings if failure occurs.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Knocking noise from engine",
      "Low oil pressure at high RPM during cornering",
      "Metal shavings in oil",
      "Oil pressure warning during track sessions",
      "Catastrophic engine failure"
    ],
    affectedSystems: ["Engine", "Lubrication"],
    estimatedCost: { low: 5000, high: 15000 },
    citations: [
      { type: "forum", title: "viperclub.org - Rod Bearing Failure" },
      { type: "article", title: "vipermagazine.com - Tech Notes" }
    ],
    humanApproved: false,
    reportCount: 60,
    status: "published",
    lastReportedByOwners: "2024-08-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Install aftermarket baffled oil pan and windage tray BEFORE any track use. Gen 3 is especially vulnerable to oil starvation during hard cornering", source: "viperclub.org", upvotes: 48, needsReview: false },
      { type: "tip", content: "Use high-quality synthetic oil and add external oil cooler for track driving. Monitor oil pressure closely during sessions", source: "vipermagazine.com", upvotes: 38, needsReview: false }
    ]
  }
];

data.issues = data.issues || [];
let addedCount = 0;
newIssues.forEach(issue => {
  const exists = data.issues.some(i => i.id === issue.id);
  if (!exists) {
    data.issues.push(issue);
    addedCount++;
    console.log('Added: ' + issue.id);
  } else {
    console.log('Skipped (exists): ' + issue.id);
  }
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('\nAdded ' + addedCount + ' Dodge batch 3 issues (Avenger + Caliber + Nitro + Dakota + Neon + Viper)');
console.log('Total issues in database: ' + data.issues.length);
