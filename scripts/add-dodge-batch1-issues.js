const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const newIssues = [
  // ===== DODGE CHALLENGER - ADDITIONAL ISSUES =====
  {
    id: "dodge-challenger-eps-rack-2015",
    vehicleMatch: {
      years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      make: "Dodge",
      model: "Challenger"
    },
    category: "steering",
    title: "Electronic Power Steering (EPS) Rack Failure",
    description: "The EPS rack assembly can fail suddenly, causing complete loss of steering assist while driving. Circuit board contamination in the EPS module causes short circuit. Corrosion in rack assembly compounds the issue. Recalls S19 (NHTSA 16V-167) and VB8 (NHTSA 19V-812) cover some vehicles.",
    solution: "Replace EPS rack assembly. Check VIN at safercar.gov for recall eligibility - recalls S19 (NHTSA 16V-167) and VB8 (NHTSA 19V-812) provide free repair for affected vehicles. Post-replacement steering angle sensor recalibration required.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Power Steering Assist Off warning message",
      "Sudden loss of steering assist while driving",
      "Heavy steering requiring significant effort",
      "C2217-00 code (EPS Module Internal failure)",
      "Intermittent power steering loss"
    ],
    affectedSystems: ["Steering", "Electrical"],
    estimatedCost: { low: 1200, high: 2800 },
    citations: [
      { type: "recall", title: "NHTSA Recall 16V-167 / Chrysler Recall S19" },
      { type: "recall", title: "NHTSA Recall 19V-812 / Chrysler Recall VB8" }
    ],
    humanApproved: false,
    reportCount: 280,
    status: "published",
    lastReportedByOwners: "2025-09-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Check VIN at safercar.gov for recalls S19 (NHTSA 16V-167) and VB8 (NHTSA 19V-812) - free EPS rack replacement for affected vehicles", source: "challengertalk.com", upvotes: 72, needsReview: false },
      { type: "tip", content: "Steering angle sensor recalibration required after replacement - must be done with dealer diagnostic tool", source: "lxforums.com", upvotes: 45, needsReview: false },
      { type: "warning", content: "This is a safety-critical issue - if you experience intermittent loss of power steering, do not delay repair. Same issue affects Charger and 300", source: "challengertalk.com", upvotes: 58, needsReview: false }
    ]
  },
  {
    id: "dodge-challenger-exhaust-manifold-bolts-2008",
    vehicleMatch: {
      years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      make: "Dodge",
      model: "Challenger",
      engines: ["5.7L HEMI V8", "6.1L SRT8 V8", "6.4L HEMI V8"]
    },
    category: "engine",
    title: "HEMI Exhaust Manifold Bolt Failure",
    description: "Exhaust manifold bolts break due to thermal cycling causing the bolts to become brittle and snap, especially on the passenger side. Dissimilar metals (iron manifold, aluminum head) accelerate the process. Creates a ticking noise at cold startup. Common across all HEMI-powered LX/LC platform vehicles.",
    solution: "Extract broken bolts using ProMAXX drill template tool kit (PMXA200PROP). Replace with Mopar double-ended studs (6509863AA/6510141AA) and Grade 8 nuts instead of bolts. Apply anti-seize on new hardware. Felpro gasket set MS96692 for 2008-2014.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Ticking or exhaust leak noise at cold startup",
      "Noise partially diminishes as engine warms",
      "Visible exhaust soot around manifold flanges",
      "Failed emissions inspection",
      "Exhaust smell in engine bay"
    ],
    affectedSystems: ["Exhaust", "Engine"],
    estimatedCost: { low: 400, high: 1500 },
    citations: [
      { type: "forum", title: "challengertalk.com - Broken Exhaust Manifold Bolt" },
      { type: "forum", title: "lxforums.com - HEMI Manifold Tick" }
    ],
    humanApproved: false,
    reportCount: 320,
    status: "published",
    lastReportedByOwners: "2025-10-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Mopar double-ended studs 6509863AA/6510141AA with Grade 8 nuts are far more durable than OEM bolts 06507746AA. ProMAXX PMXA200PROP drill template for safe extraction", source: "challengertalk.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "Dorman stainless steel bolt set 03309HP is an aftermarket alternative. Felpro MS96692 gasket set for 2008-2014. Always use new gaskets", source: "lxforums.com", upvotes: 42, needsReview: false },
      { type: "warning", content: "Always apply anti-seize compound on new hardware to prevent future seizure from thermal cycling", source: "challengertalk.com", upvotes: 48, needsReview: false }
    ]
  },
  {
    id: "dodge-challenger-oil-filter-housing-2011",
    vehicleMatch: {
      years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      make: "Dodge",
      model: "Challenger",
      engines: ["3.6L Pentastar V6"]
    },
    category: "engine",
    title: "Pentastar 3.6L Oil Filter Housing Leak",
    description: "The plastic oil filter housing warps and cracks from heat cycling, causing oil leaks from front of engine near oil filter. In severe cases coolant and oil can mix. Common across all Pentastar 3.6L vehicles (Challenger, Charger, 300, Jeep, Ram).",
    solution: "Replace with Dorman aluminum aftermarket housing (926-959 with oil cooler, 2011-2023) for a permanent fix vs the OEM plastic housing that will crack again. Dorman 926-876 is the earlier version without cooler.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Oil leaking from front of engine near oil filter",
      "Coolant leak from housing area",
      "Low oil warnings",
      "Oil and coolant mixing in severe cases",
      "Burning oil smell"
    ],
    affectedSystems: ["Engine", "Lubrication"],
    estimatedCost: { low: 400, high: 900 },
    citations: [
      { type: "forum", title: "challengertalk.com - Oil Filter Housing Leak" },
      { type: "article", title: "OnAllCylinders - Dorman Pentastar Fix" }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    lastReportedByOwners: "2025-11-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Dorman 926-959 (aluminum housing with oil cooler) is the permanent fix for 2011-2023 Pentastar 3.6L. Dorman 926-876 is the version without cooler", source: "challengertalk.com", upvotes: 68, needsReview: false },
      { type: "warning", content: "Do NOT replace with another OEM plastic housing - it will crack again. Dorman aluminum upgrade eliminates the problem permanently", source: "lxforums.com", upvotes: 72, needsReview: false },
      { type: "tip", content: "Same issue affects all Pentastar 3.6L vehicles: Charger, 300, Grand Cherokee, Wrangler, Ram 1500", source: "allpar.com", upvotes: 45, needsReview: false }
    ]
  },
  {
    id: "dodge-challenger-zf8-trans-2015",
    vehicleMatch: {
      years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      make: "Dodge",
      model: "Challenger"
    },
    category: "transmission",
    title: "ZF 8-Speed Transmission Harsh Shifting and Valve Body Failure",
    description: "The ZF 8HP45/8HP70 8-speed automatic suffers from harsh downshifts (especially 2nd to 1st), rough upshifts with RPM spikes, and clunking when cold. Ferrous or aluminum debris in 3-4 shift pressure valves is the primary failure point. Valve body is the most common component needing replacement.",
    solution: "Ensure TCM updated to latest software. Change fluid every 50,000 miles despite 'sealed for life' claim using Mopar 8&9 speed ATF (68218925AA) or ZF Lifeguard 8. Valve body replacement for persistent harsh shifting. Perform QuickLearn procedure after any transmission work.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Harsh downshift from 2nd to 1st with jerking",
      "Rough upshift from 2nd to 3rd with RPM spike",
      "Clunk when shifting, especially when cold",
      "Delayed shifts",
      "Transmission hesitation"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 800, high: 2500 },
    citations: [
      { type: "forum", title: "challengertalk.com - ZF 8-Speed Issues" },
      { type: "forum", title: "chargerforums.com - 8-Speed Transmission Update" }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    lastReportedByOwners: "2025-08-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Mopar 8&9 speed ATF (68218925AA) or ZF Lifeguard 8 - change every 50,000 miles despite 'sealed for life' claim. 8 liters for service", source: "challengertalk.com", upvotes: 62, needsReview: false },
      { type: "tip", content: "Get latest TCM software update from dealer first - many shifting complaints resolved by calibration update alone", source: "chargerforums.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "QuickLearn procedure must be performed after any transmission work or fluid change for adaptive shift to recalibrate", source: "lxforums.com", upvotes: 48, needsReview: false }
    ]
  },

  // ===== DODGE CHARGER - ADDITIONAL ISSUES =====
  {
    id: "dodge-charger-42rle-trans-2006",
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010],
      make: "Dodge",
      model: "Charger",
      engines: ["2.7L V6", "3.5L V6"]
    },
    category: "transmission",
    title: "42RLE 4-Speed Transmission Solenoid and Connector Failure",
    description: "The 42RLE 4-speed automatic in V6 Chargers suffers from solenoid failures and corrosion in the 10-pin solenoid harness connector. Causes slipping, harsh shifts, limp mode, and P0750/P0755/P0760/P0765 codes. Cup plug for park pawl anchor shaft can fail (recall).",
    solution: "Install new design 42RLE 10-pin connector (dealer wiring repair). Replace solenoid pack. Verify park pawl recall completed. Use ONLY Mopar ATF+4 (68218058AC).",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Slipping gears",
      "Harsh shifts",
      "Transmission stuck in limp mode",
      "P0750/P0755/P0760/P0765 codes",
      "Speed limited to 40 mph in limp mode"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 300, high: 3500 },
    citations: [
      { type: "forum", title: "chargerforums.com - 42RLE Protection" },
      { type: "forum", title: "chargerforumz.com - Transmission Won't Upshift" }
    ],
    humanApproved: false,
    reportCount: 220,
    status: "published",
    lastReportedByOwners: "2024-06-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "The 10-pin solenoid harness connector corrodes from moisture - updated design connector from dealer fixes most electrical shift issues", source: "chargerforums.com", upvotes: 48, needsReview: false },
      { type: "warning", content: "Use ONLY Mopar ATF+4 (68218058AC) - the 42RLE is extremely sensitive to fluid type. Never use generic ATF", source: "lxforums.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "Check park pawl recall status - cup plug can fail causing vehicle to roll. Verify recall completion at safercar.gov", source: "allpar.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "dodge-charger-nag1-trans-2006",
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011],
      make: "Dodge",
      model: "Charger",
      engines: ["5.7L HEMI V8", "6.1L SRT8 V8"]
    },
    category: "transmission",
    title: "W5A580 (NAG1) 5-Speed Transmission Water Contamination",
    description: "The Mercedes-derived W5A580/NAG1 5-speed automatic in V8 Chargers suffers from water intrusion past the transmission oil fill tube/dipstick seal. Water contamination causes TCC to stick/slip, erratic shifting, and eventual internal damage. Gearshift cable recall issued for 20,100 vehicles.",
    solution: "Replace dipstick seal to prevent water intrusion. Flush transmission fluid with NAG1-approved fluid (Shell M-1375.4 specification - NOT Mopar ATF+4 which is incompatible with NAG1). Replace valve body if internal damage present.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Shudder during light acceleration in 3rd-5th gear",
      "Torque converter clutch sticking or slipping",
      "Erratic upshifts and downshifts",
      "Gearshift cable disengagement",
      "Milky/foamy transmission fluid"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 500, high: 4000 },
    citations: [
      { type: "forum", title: "chargerforums.com - W5A580 Transmission Protection" },
      { type: "article", title: "transmissionrepaircostguide.com - Charger Transmissions" }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    lastReportedByOwners: "2024-04-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Mopar ATF+4 is NOT compatible with the NAG1/W5A580 transmission. Must use Shell M-1375.4 specification fluid only", source: "chargerforums.com", upvotes: 72, needsReview: false },
      { type: "tip", content: "Replace dipstick seal preventatively to stop water intrusion. Check fluid for milky appearance at every service", source: "lxforums.com", upvotes: 48, needsReview: false },
      { type: "tip", content: "Check gearshift cable recall status - 20,100 vehicles affected with cable that can disengage", source: "allpar.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "dodge-charger-front-suspension-2006",
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
      make: "Dodge",
      model: "Charger"
    },
    category: "suspension",
    title: "Front Suspension Premature Wear (LX/LD Platform)",
    description: "All Charger generations suffer from rapid front suspension wear including tension struts (radius arms), tie rods, lower control arm bushings, and sway bar end links. Bushings typically worn by 45,000-60,000 miles. Endemic LX/LD platform problem shared with Challenger and 300.",
    solution: "Replace tension struts (driver 5180607AB, passenger 5180606AB), lower control arm bushings (Moog K200200 at shock, K200199 at frame for RWD), tie rod ends, and sway bar end links as a complete set. Alignment required after repair.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Clunking or thumping from front end over bumps",
      "Loose or wandering steering",
      "Uneven tire wear",
      "Front end feels unstable over bumps",
      "Sway bar clunking in turns"
    ],
    affectedSystems: ["Suspension", "Steering"],
    estimatedCost: { low: 600, high: 1800 },
    citations: [
      { type: "forum", title: "chargerforums.com - Front Suspension Rebuild" },
      { type: "forum", title: "lxforums.com - LX Platform Suspension" }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    lastReportedByOwners: "2025-11-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Moog lower control arm bushings K200200 (at shock) and K200199 (at frame, RWD) are preferred over OEM for longevity. OEM tension struts: driver 5180607AB, passenger 5180606AB", source: "chargerforums.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "Replace ALL front bushings at once rather than chasing individual components - saves repeat labor and alignment costs", source: "lxforums.com", upvotes: 62, needsReview: false },
      { type: "tip", content: "Inspect rear suspension cradle bushings simultaneously - they wear at the same rate on this platform", source: "chargerforums.com", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "dodge-charger-daytona-ev-software-2024",
    vehicleMatch: {
      years: [2024, 2025],
      make: "Dodge",
      model: "Charger",
      engines: ["BEV Electric", "Hurricane I6 Turbo"],
      trims: ["Daytona"]
    },
    category: "electrical",
    title: "2024+ Charger Daytona EV/SIXPACK Software and Bricking Issues",
    description: "The all-new 2024+ Charger Daytona platform experiences complete vehicle shutdown ('bricking') with all warning lights illuminating, charging port failures, passive entry malfunctions, 12V battery drain preventing power-on, and UConnect errors. First-generation software issues on an immature EV/PHEV platform.",
    solution: "Contact dealer for software updates. 12V battery replacement if drained. Charging port replacement under warranty. OTA updates forthcoming. All repairs should be covered under warranty for new vehicles.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Complete vehicle shutdown with all warning lights on",
      "Charging port failures",
      "Passive entry malfunctions",
      "12V battery drain preventing power-on",
      "UConnect infotainment errors and freezing"
    ],
    affectedSystems: ["Electrical", "Software", "Charging"],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      { type: "forum", title: "daytonaowners.com - Vehicle Problems Thread" },
      { type: "article", title: "MoparInsiders - Bricking Issue Report" }
    ],
    humanApproved: false,
    reportCount: 80,
    status: "published",
    lastReportedByOwners: "2025-12-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "All issues should be covered under warranty - contact dealer for latest software updates. OTA updates are being pushed regularly to address known issues", source: "daytonaowners.com", upvotes: 35, needsReview: false },
      { type: "tip", content: "If vehicle won't power on, the 12V battery may have drained - this is separate from the main EV battery. Jump start or replace 12V battery", source: "daytonaowners.com", upvotes: 28, needsReview: false }
    ]
  },

  // ===== DODGE DURANGO - ADDITIONAL ISSUES =====
  {
    id: "dodge-durango-plenum-gasket-1998",
    vehicleMatch: {
      years: [1998, 1999, 2000, 2001, 2002, 2003],
      make: "Dodge",
      model: "Durango",
      engines: ["5.2L V8", "5.9L V8"]
    },
    category: "engine",
    title: "Plenum Gasket Failure (5.2L/5.9L Magnum V8)",
    description: "The plenum gasket between the intake manifold and engine block fails, allowing engine oil to be sucked into combustion chambers. Causes excessive oil consumption, pinging, and visible oily sheen inside intake manifold through throttle body. Common on all 5.2L and 5.9L Magnum V8 engines.",
    solution: "Replace plenum gasket using Felpro intake manifold gasket set: MS92844 (5.2L) or MS92845 (5.9L). Hughes Engines plenum plate fix eliminates the design flaw entirely. Some owners install aftermarket M1 intake manifold which eliminates the plenum gasket.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Engine pinging",
      "Excessive oil consumption",
      "Oily sheen visible inside intake through throttle body",
      "Rough idle",
      "Loss of power"
    ],
    affectedSystems: ["Engine", "Intake"],
    estimatedCost: { low: 300, high: 800 },
    citations: [
      { type: "forum", title: "dodgedurango.net - Plenum Gasket Repair" },
      { type: "forum", title: "dakota-durango.com - Plenum Gasket Replacement" }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    lastReportedByOwners: "2023-08-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Felpro intake manifold gasket set MS92844 (5.2L) or MS92845 (5.9L). Hughes Engines plenum plate fix permanently eliminates the design flaw", source: "dodgedurango.net", upvotes: 55, needsReview: false },
      { type: "tip", content: "Check for oily residue inside the throttle body - if present, the plenum gasket has failed and oil is being consumed", source: "dakota-durango.com", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "dodge-durango-ball-joint-1998",
    vehicleMatch: {
      years: [1998, 1999, 2000, 2001, 2002, 2003],
      make: "Dodge",
      model: "Durango"
    },
    category: "suspension",
    title: "Ball Joint Failure - Safety Recall",
    description: "Upper and lower ball joints wear prematurely, causing clunking, loose steering, and in worst cases wheel separation. NHTSA recall issued for 2001-2003 models. Same components used in 1998-2000 models which share the design. Failures reported as early as 49,000 miles.",
    solution: "Replace upper and lower ball joints on both sides. Use Moog quality aftermarket parts: upper K7460, lower K7467. Inspect at every oil change. Check NHTSA recall status for 2001-2003 models.",
    severity: "critical",
    confidence: "high",
    symptoms: [
      "Clunking from front end",
      "Loose or wandering steering",
      "Uneven tire wear",
      "Wheel wobble",
      "In worst case: wheel separation"
    ],
    affectedSystems: ["Suspension", "Safety"],
    estimatedCost: { low: 300, high: 800 },
    citations: [
      { type: "recall", title: "NHTSA Recall - 2001-2003 Durango Ball Joints" },
      { type: "forum", title: "dodgedurango.net - Ball Joint Failure" }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    lastReportedByOwners: "2023-05-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "This is a safety-critical issue - wheel separation can occur. Check NHTSA recall status for 2001-2003 models. Inspect ball joints at every oil change", source: "dodgedurango.net", upvotes: 65, needsReview: false },
      { type: "tip", content: "Moog upper ball joint K7460 and lower K7467 - replace both sides together. Moog Problem Solver parts preferred over OEM for longevity", source: "dakota-durango.com", upvotes: 52, needsReview: false }
    ]
  },
  {
    id: "dodge-durango-transfer-case-leak-1998",
    vehicleMatch: {
      years: [1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
      make: "Dodge",
      model: "Durango",
      trims: ["4WD", "AWD"]
    },
    category: "drivetrain",
    title: "Transfer Case Seal Leaks (NV242/NV244/NV247)",
    description: "Input and output shaft seals on NV242, NV244, and NV247 transfer cases fail from heat cycling and age. Causes fluid leaks, grinding or whining noise during 4WD engagement, and 4WD indicator light issues.",
    solution: "Replace input/output shaft seals. Change transfer case fluid with Mopar ATF+4 every 30,000 miles. Inspect weep hole at every oil change for early detection.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Fluid leak from transfer case weep hole",
      "Grinding or whining noise during 4WD engagement",
      "4WD indicator light issues",
      "Difficulty engaging or disengaging 4WD"
    ],
    affectedSystems: ["Drivetrain", "Transfer Case"],
    estimatedCost: { low: 200, high: 600 },
    citations: [
      { type: "forum", title: "dodgetalk.com - Transfer Case Thread" },
      { type: "forum", title: "dodgedurango.net - Transfer Case Leaks" }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    lastReportedByOwners: "2024-03-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Change transfer case fluid with Mopar ATF+4 every 30,000 miles. Inspect weep hole at every oil change for early leak detection", source: "dodgetalk.com", upvotes: 42, needsReview: false },
      { type: "tip", content: "NV242/NV244/NV247 seals are relatively inexpensive - address leaks early before low fluid causes internal damage", source: "dodgedurango.net", upvotes: 35, needsReview: false }
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
console.log('\nAdded ' + addedCount + ' Dodge batch 1 issues (Challenger + Charger + Durango)');
console.log('Total issues in database: ' + data.issues.length);
