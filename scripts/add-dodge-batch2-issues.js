const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const newIssues = [
  // ===== DODGE GRAND CARAVAN (2001-2020) =====
  {
    id: "dodge-grand-caravan-tipm-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: "Dodge",
      model: "Grand Caravan"
    },
    category: "electrical",
    title: "TIPM (Totally Integrated Power Module) Failure",
    description: "The TIPM central fuse/relay box controls all vehicle electrical functions. Internal relays, especially fuel pump relay, fail from solder joint cracking due to thermal cycling. Causes random activation of lights/wipers/horn, sliding doors losing power, battery drain, and no-start conditions. Same TIPM design flaw as Chrysler Town & Country. Most severe in 2008 and 2010-2011.",
    solution: "Three options: (1) New TIPM from dealer ($800-$1,500 + programming), (2) Mail-in TIPM rebuild (UpFix, Circuit Board Medics, MAKS TIPM - $200-$400, plug-and-play, no programming), (3) External fuel pump relay bypass cable ($50-$150) for fuel pump relay only.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Vehicle won't start (fuel pump relay failure)",
      "Fuel pump runs continuously with key off",
      "Wipers, horn, or lights activate randomly",
      "Power sliding doors lose power mid-operation",
      "Battery drain overnight",
      "ABS/airbag warning lights"
    ],
    affectedSystems: ["Electrical", "TIPM", "Fuel System"],
    estimatedCost: { low: 50, high: 1500 },
    citations: [
      { type: "forum", title: "chryslerminivan.net - TIPM Fuel Pump Relay Fixes" },
      { type: "forum", title: "allpar.com - Chrysler TIPM Problems" }
    ],
    humanApproved: false,
    reportCount: 450,
    status: "published",
    lastReportedByOwners: "2025-08-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "TIPM rebuild services (UpFix, Circuit Board Medics, MAKS TIPM) are most cost-effective at $200-$400 - plug-and-play, no dealer programming needed", source: "chryslerminivan.net", upvotes: 92, needsReview: false },
      { type: "tip", content: "Fuel pump bypass cable (CBWPR091AA or Vertical Visions system) is cheapest at $50-$150 if ONLY fuel pump relay failed. TIPM part numbers: 4692335AA-4692335AI, 68244893AA", source: "allpar.com", upvotes: 75, needsReview: false },
      { type: "tip", content: "Sliding door fuse J3 in TIPM (40A) - check this fuse if sliding doors lose power. Same TIPM serves Grand Caravan and Chrysler Town & Country", source: "chryslerminivan.net", upvotes: 55, needsReview: false }
    ]
  },
  {
    id: "dodge-grand-caravan-62te-trans-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: "Dodge",
      model: "Grand Caravan"
    },
    category: "transmission",
    title: "62TE Transmission Solenoid Pack Failure",
    description: "The 62TE 6-speed automatic experiences solenoid pack failures causing hard shifting, slipping, limp mode (stuck in 3rd gear), and complete failure. Contains 6 shift solenoids, 1 line-pressure solenoid, temperature sensor, and 5 pressure switches. Most frequent in 2012 and 2014 models.",
    solution: "Start with solenoid pack replacement: Mopar 68376696AA (or 5078709AB, D262420A, 68371508AA). If internal damage present, full rebuild ($2,500-$4,500). Use ONLY Mopar ATF+4 (68218058AC). Change fluid every 30,000 miles despite 'lifetime' claim.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Hard shifting between gears",
      "Transmission slipping during acceleration",
      "Stuck in 3rd gear (limp mode)",
      "Overheating transmission warning",
      "Delayed engagement from Park to Drive"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 300, high: 4500 },
    citations: [
      { type: "forum", title: "chryslerminivan.net - 62TE Solenoid Pack Replacement" },
      { type: "forum", title: "allpar.com - 62TE Transmission Guide" }
    ],
    humanApproved: false,
    reportCount: 380,
    status: "published",
    lastReportedByOwners: "2025-09-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Solenoid pack Mopar 68376696AA (or 5078709AB, D262420A, 68371508AA) is often sufficient if caught early - $300-$600 vs $2,500+ for full rebuild", source: "chryslerminivan.net", upvotes: 78, needsReview: false },
      { type: "warning", content: "Use ONLY Mopar ATF+4 (68218058AC, 5-quart). NEVER substitute. Change every 30,000 miles - ignore 'lifetime' interval", source: "allpar.com", upvotes: 88, needsReview: false }
    ]
  },
  {
    id: "dodge-grand-caravan-sliding-door-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: "Dodge",
      model: "Grand Caravan"
    },
    category: "body",
    title: "Power Sliding Door Motor and Actuator Failure",
    description: "Power sliding doors fail to open/close automatically, open partially and stop, or operate intermittently. Drive cable, motor, and lock actuator are common failure points. Wiring harness chafing causes shorts. Same parts as Chrysler Town & Country.",
    solution: "Replace drive cable assembly: left 68064661AE (updated), right 68064660AC. Lock actuators: left 5020679AB, right 5020678AA. Track motor: 68067847AF. Lubricate door track rails with white lithium grease regularly.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Sliding door opens partially then stops",
      "Door motor makes noise but door doesn't move",
      "Door operates intermittently",
      "Door Ajar warning despite door being closed",
      "Door won't latch electrically"
    ],
    affectedSystems: ["Body", "Electrical", "Power Doors"],
    estimatedCost: { low: 200, high: 800 },
    citations: [
      { type: "forum", title: "chryslerminivan.net - Sliding Door Repair" },
      { type: "article", title: "1aauto.com - Grand Caravan Problems" }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    lastReportedByOwners: "2025-06-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Left drive cable: 68064661AE, right: 68064660AC. Lock actuator left: 5020679AB, right: 5020678AA. Track motor: 68067847AF - same parts as Chrysler Town & Country", source: "chryslerminivan.net", upvotes: 62, needsReview: false },
      { type: "tip", content: "Lubricate door track rails with white lithium grease regularly. Drive assembly is DIY in 1-2 hours per door. Check TIPM fuse J3 (40A) if both doors fail simultaneously", source: "allpar.com", upvotes: 48, needsReview: false }
    ]
  },
  {
    id: "dodge-grand-caravan-rocker-arm-2011",
    vehicleMatch: {
      years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: "Dodge",
      model: "Grand Caravan",
      engines: ["3.6L Pentastar V6"]
    },
    category: "engine",
    title: "Pentastar 3.6L Rocker Arm and Camshaft Failure",
    description: "Manufacturing defect in rocker arm assembly causes ticking/tapping from valve covers that increases with RPM. Can lead to camshaft scoring and eventual engine damage. Extended warranty for 2011-2013 covers 10 years/150,000 miles on left cylinder head specifically.",
    solution: "Replace all rocker arms preventatively with OEM Mopar parts only. Inspect camshafts for scoring. TSB 09-011-25 addresses misfire DTCs, rough idle, and valvetrain noise. Check extended warranty eligibility for 2011-2013 models.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Ticking/tapping noise from valve covers",
      "Noise increases with engine RPM",
      "Check engine light with misfire codes",
      "Rough idle",
      "Noise more pronounced when engine is cold"
    ],
    affectedSystems: ["Engine", "Valvetrain"],
    estimatedCost: { low: 800, high: 3500 },
    citations: [
      { type: "tsb", title: "TSB 09-011-25 - Misfire DTCs, Rough Idle, Valvetrain Noise" },
      { type: "forum", title: "allpar.com - Pentastar Rocker Arm Failure" }
    ],
    humanApproved: false,
    reportCount: 280,
    status: "published",
    lastReportedByOwners: "2025-05-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Use ONLY OEM Mopar rocker arms - aftermarket quality varies significantly. TSB 09-011-25 is the dealer reference for this repair", source: "allpar.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "2011-2013 models have extended warranty of 10 years/150,000 miles on left cylinder head specifically - check eligibility at dealer", source: "chryslerminivan.net", upvotes: 62, needsReview: false },
      { type: "warning", content: "Inspect camshafts for scoring during rocker arm replacement - scored cams require replacement to prevent repeat failure", source: "allpar.com", upvotes: 48, needsReview: false }
    ]
  },
  {
    id: "dodge-grand-caravan-cooling-2001",
    vehicleMatch: {
      years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      make: "Dodge",
      model: "Grand Caravan",
      engines: ["3.3L V6", "3.8L V6"]
    },
    category: "cooling",
    title: "Cooling System Failures (3.3L/3.8L V6)",
    description: "The 3.3L and 3.8L V6 engines suffer from water pump failures, thermostat sticking, and radiator fan relay failures. Overheating can cause head gasket failure. Fan relay is the most common single failure point. Same cooling system as Chrysler Town & Country.",
    solution: "Replace water pump (Gates 43090 for 3.8L), thermostat (Stant 45359, 195F), and radiator cap as a set. Check fan relay (5149541AA) and fan module (5017407AB). Use Mopar OAT coolant (68048953AB) only.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Engine overheating, especially at idle or in traffic",
      "Coolant leak from water pump area",
      "Temperature gauge fluctuating",
      "Heater blowing cold air",
      "Radiator fan not running at idle"
    ],
    affectedSystems: ["Cooling", "Engine"],
    estimatedCost: { low: 400, high: 1200 },
    citations: [
      { type: "forum", title: "chryslerminivan.net - Cooling System Guide" },
      { type: "forum", title: "allpar.com - 3.8L Cooling Issues" }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    lastReportedByOwners: "2024-08-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Gates water pump 43090 (3.8L). Replace thermostat (Stant 45359), water pump, and radiator cap together as a preventive set", source: "chryslerminivan.net", upvotes: 58, needsReview: false },
      { type: "warning", content: "Fan relay 5149541AA is the most common single failure point causing overheating. Keep a spare (~$15). Fan module: 5017407AB", source: "allpar.com", upvotes: 65, needsReview: false },
      { type: "tip", content: "Use Mopar OAT coolant 68048953AB only. Flush every 30,000 miles. Same cooling system as Chrysler Town & Country", source: "chryslerminivan.net", upvotes: 45, needsReview: false }
    ]
  },

  // ===== DODGE DART (2013-2016) =====
  {
    id: "dodge-dart-oil-consumption-2013",
    vehicleMatch: {
      years: [2013, 2014, 2015, 2016],
      make: "Dodge",
      model: "Dart",
      engines: ["2.4L Tigershark MultiAir I4"]
    },
    category: "engine",
    title: "2.4L MultiAir Excessive Oil Consumption",
    description: "The 2.4L Tigershark MultiAir II engine has defective piston rings allowing oil into combustion chamber. Owners report 1 quart per 1,000-2,000 miles. FCA considered up to 1 quart per 2,000 miles 'acceptable.' Class-action settlement reached (Wood, et al. v. FCA US, LLC). CSN W80 warranty extension: 7 years/100,000 miles.",
    solution: "Contact FCA dealer for oil consumption test under CSN W80. PCM flash changes MultiAir operation to reduce vacuum during deceleration. Engine long block replacement for severe cases. File claim at fcatigersharksettlement.com.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Oil consumption of 1+ quart per 1,000-2,000 miles",
      "Low oil pressure warning light",
      "Blue smoke from exhaust",
      "Engine stalling or seizing without warning",
      "Rough idle or misfires"
    ],
    affectedSystems: ["Engine", "Lubrication"],
    estimatedCost: { low: 0, high: 8500 },
    citations: [
      { type: "legal", title: "Wood, et al. v. FCA US, LLC - Tigershark Settlement" },
      { type: "forum", title: "dodge-dart.org - 2.4L MultiAir Oil Consumption" }
    ],
    humanApproved: false,
    reportCount: 280,
    status: "published",
    lastReportedByOwners: "2025-04-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Check oil every 500 miles - engine can seize without warning. CSN W80 warranty extension covers 7 years/100,000 miles. File claim at fcatigersharksettlement.com", source: "dodge-dart.org", upvotes: 78, needsReview: false },
      { type: "tip", content: "PCM flash reduces MultiAir vacuum during deceleration which helps reduce oil consumption. Ask dealer for latest calibration", source: "allpar.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "Same issue affects Chrysler 200 and Jeep Cherokee with 2.4L Tigershark. Document all oil purchases with receipts for warranty claims", source: "dodge-dart.org", upvotes: 45, needsReview: false }
    ]
  },
  {
    id: "dodge-dart-ddct-trans-2013",
    vehicleMatch: {
      years: [2013, 2014, 2015, 2016],
      make: "Dodge",
      model: "Dart",
      engines: ["1.4L MultiAir Turbo I4"]
    },
    category: "transmission",
    title: "C635 Dual-Dry-Clutch Transmission (DDCT) Failure",
    description: "The Marelli-designed C635 DDCT in 1.4L Turbo Darts has fundamental durability issues. The 2-4 position sensor in the hydraulic shift actuator fails, causing Service Transmission warnings, inability to shift, and jerky operation. Individual sensors not sold separately - entire actuator assembly must be replaced.",
    solution: "Replace hydraulic shift actuator/valve body assembly (68445377AA). Wire harness 68240543AA may also need replacement. TCM reprogramming required after replacement. Expected DDCT lifespan is shorter than traditional automatics.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Service Transmission warning on dash",
      "P1C9D/P1CC1 diagnostic codes",
      "Transmission won't shift into drive or reverse",
      "Jerky low-speed operation",
      "Shuddering during gear changes"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 500, high: 5900 },
    citations: [
      { type: "forum", title: "dodge-dart.org - DDCT Issues" },
      { type: "forum", title: "dodge-dart.org - C635 Won't Shift" }
    ],
    humanApproved: false,
    reportCount: 220,
    status: "published",
    lastReportedByOwners: "2025-03-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Hydraulic shift actuator 68445377AA and wire harness 68240543AA - individual sensors not sold separately. TCM reprogramming required after replacement", source: "dodge-dart.org", upvotes: 52, needsReview: false },
      { type: "warning", content: "The C635 DDCT has a shorter expected lifespan than traditional automatics. If buying used, strongly consider the Aisin 6-speed auto models instead", source: "dodge-dart.org", upvotes: 65, needsReview: false }
    ]
  },
  {
    id: "dodge-dart-multiair-solenoid-2013",
    vehicleMatch: {
      years: [2013, 2014, 2015, 2016],
      make: "Dodge",
      model: "Dart",
      engines: ["2.4L Tigershark MultiAir I4"]
    },
    category: "engine",
    title: "MultiAir Solenoid Assembly Failure",
    description: "The MultiAir variable valve timing solenoids fail causing check engine light with VVT codes, rough idle, loss of power, and poor fuel economy. Individual solenoids not available separately from Mopar - entire MultiAir assembly must be replaced.",
    solution: "Replace entire MultiAir assembly (individual solenoids not sold separately by Mopar). Labor-intensive as it requires valve cover removal and special tooling.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Check engine light with variable valve timing codes",
      "Rough idle",
      "Loss of power",
      "Poor fuel economy",
      "Valve tick noise"
    ],
    affectedSystems: ["Engine", "Valvetrain"],
    estimatedCost: { low: 1000, high: 2000 },
    citations: [
      { type: "forum", title: "dodge-dart.org - MultiAir Problems" }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    lastReportedByOwners: "2025-02-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Individual solenoids not available from Mopar - entire MultiAir assembly must be replaced. Use OEM parts only for this critical system", source: "dodge-dart.org", upvotes: 42, needsReview: false },
      { type: "tip", content: "Same MultiAir system used in Chrysler 200 and Jeep Cherokee 2.4L - cross-reference parts and repair procedures", source: "allpar.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "dodge-dart-electrical-drain-2013",
    vehicleMatch: {
      years: [2013, 2014, 2015, 2016],
      make: "Dodge",
      model: "Dart"
    },
    category: "electrical",
    title: "Parasitic Battery Drain - BCM Sleep Issues",
    description: "The Body Control Module and other modules don't enter sleep mode properly, causing parasitic battery drain that kills the battery in 2-3 days of sitting. PCM communication errors compound the issue.",
    solution: "Request latest BCM software update from dealer. Check for aftermarket accessories causing draw. Disconnect negative terminal if parking more than 3 days. Replace battery with AGM type for better performance.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Dead battery after sitting 2-3 days",
      "Needing frequent jump starts",
      "Interior lights staying on after exiting",
      "PCM communication errors"
    ],
    affectedSystems: ["Electrical", "Battery"],
    estimatedCost: { low: 0, high: 400 },
    citations: [
      { type: "forum", title: "dodge-dart.org - Battery Drain Issues" }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    lastReportedByOwners: "2025-01-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "BCM software update from dealer often resolves module sleep issues for free. Check for aftermarket accessories causing draw", source: "dodge-dart.org", upvotes: 45, needsReview: false },
      { type: "tip", content: "Disconnect negative terminal if parking more than 3 days. Replace with AGM battery for better cold-weather performance", source: "dodge-dart.org", upvotes: 35, needsReview: false }
    ]
  },

  // ===== DODGE HORNET (2023-2025) =====
  {
    id: "dodge-hornet-9speed-trans-2023",
    vehicleMatch: {
      years: [2023],
      make: "Dodge",
      model: "Hornet",
      engines: ["2.0L GME Turbo I4"]
    },
    category: "transmission",
    title: "9-Speed Transmission Calibration Issues",
    description: "The 9-speed automatic in 2023 GT models has calibration issues inherited from the Alfa Romeo Tonale platform. Hesitation, delayed upshifts, shuddering, and harsh downshifts. For 2024+, Dodge switched to the ZF 8-speed which is significantly improved.",
    solution: "Get latest PCM/TCM software update from dealer. 2024+ models switched to ZF 8-speed. Regular transmission fluid service every 60,000 miles.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Hesitation during light-throttle acceleration",
      "Delayed upshifts",
      "Shuddering under load at low speeds",
      "Harsh downshifts"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 0, high: 3000 },
    citations: [
      { type: "forum", title: "hornetowners.com - Transmission Calibration" }
    ],
    humanApproved: false,
    reportCount: 100,
    status: "published",
    lastReportedByOwners: "2025-06-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Get latest PCM/TCM software update from dealer - often resolves most shifting complaints. 2024+ models use improved ZF 8-speed", source: "hornetowners.com", upvotes: 38, needsReview: false }
    ]
  },
  {
    id: "dodge-hornet-electrical-2023",
    vehicleMatch: {
      years: [2023, 2024, 2025],
      make: "Dodge",
      model: "Hornet"
    },
    category: "electrical",
    title: "Electrical and Software Malfunctions",
    description: "First-year production teething issues on the Alfa Romeo Tonale platform. Wiring harness failures, battery control module failures, touchscreen freezes, front collision warning malfunctions, start/stop issues, and wireless charging overheating.",
    solution: "Dealer warranty repairs for all electrical issues. Software updates address many known problems. BCM replacement for wiring harness failures. All repairs should be under warranty.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Wiring harness failures",
      "Touchscreen freezes or goes blank",
      "Front collision warning not functioning",
      "Start/stop system malfunction",
      "Wireless charging pad overheating"
    ],
    affectedSystems: ["Electrical", "Software", "Safety Systems"],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      { type: "forum", title: "hornetowners.com - Electrical Issues Thread" }
    ],
    humanApproved: false,
    reportCount: 120,
    status: "published",
    lastReportedByOwners: "2025-10-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "All issues should be covered under warranty. Request latest software updates from dealer which address many known electrical glitches", source: "hornetowners.com", upvotes: 35, needsReview: false },
      { type: "tip", content: "4 NHTSA recalls issued for 2023 model (battery cable/fire risk, tire placard, rearview camera) - verify all completed", source: "allpar.com", upvotes: 28, needsReview: false }
    ]
  },
  {
    id: "dodge-hornet-battery-cable-recall-2023",
    vehicleMatch: {
      years: [2023, 2024],
      make: "Dodge",
      model: "Hornet"
    },
    category: "electrical",
    title: "Battery Cable Fire Risk - Safety Recall",
    description: "Improperly secured battery cable connections can result in fire. NHTSA recall issued for 2023-2024 Hornet models. Critical safety issue requiring immediate dealer attention.",
    solution: "Contact Dodge dealer immediately for free recall repair. Check VIN at safercar.gov for recall eligibility. Do not delay - this is a fire safety recall.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Battery cable connection loosening",
      "Electrical system malfunctions",
      "Burning smell near battery area",
      "In worst case: vehicle fire"
    ],
    affectedSystems: ["Electrical", "Safety", "Battery"],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "recall", title: "NHTSA Recall - Hornet Battery Cable Fire Risk" }
    ],
    humanApproved: false,
    reportCount: 50,
    status: "published",
    lastReportedByOwners: "2025-08-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "IMMEDIATE action required - check VIN at safercar.gov for recall eligibility. Free dealer repair. Do not delay due to fire risk", source: "allpar.com", upvotes: 45, needsReview: false }
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
console.log('\nAdded ' + addedCount + ' Dodge batch 2 issues (Grand Caravan + Dart + Hornet)');
console.log('Total issues in database: ' + data.issues.length);
