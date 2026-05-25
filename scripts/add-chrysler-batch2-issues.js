const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const newIssues = [
  // ===== CHRYSLER 200 (2011-2017) =====
  {
    id: "chrysler-200-9speed-trans-2015",
    vehicleMatch: {
      years: [2015, 2016, 2017],
      make: "Chrysler",
      model: "200",
      engines: ["2.4L Tigershark I4", "3.6L Pentastar V6"]
    },
    category: "transmission",
    title: "ZF 9-Speed Transmission Shifting Problems",
    description: "The ZF 9HP48 9-speed automatic transmission suffers from harsh shifting, delayed engagement, lurching forward, and unexpectedly shifting into neutral while driving. A terminal crimping issue in sensor cluster harness assemblies caused wiring defects. 2015 models are worst; 2016+ have improvements after FCA built transmissions in Kokomo, Indiana. Recall S55 (NHTSA 16V529000) issued.",
    solution: "Contact dealer for Recall S55 (NHTSA 16V529000) - provides free PCM/TCM reprogramming and transaxle range sensor wire harness replacement if needed. If ordering 2015 replacement transmission, the system automatically provides improved 2016 unit. Regular transmission fluid services every 60,000 miles.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Hard shifts between 2nd and 3rd gear",
      "Transmission unexpectedly shifts into neutral",
      "Lurching forward after downshift",
      "Delayed engagement when shifting from Park",
      "Service Transmission warning light"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 0, high: 6000 },
    citations: [
      { type: "recall", title: "NHTSA Recall 16V529000 / Chrysler Recall S55" },
      { type: "forum", title: "200forums.com - 9-Speed Issues" }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    lastReportedByOwners: "2025-04-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Avoid 2015 model year entirely if possible - 2016-2017 have significant improvements after FCA took over transmission manufacturing in Kokomo, IN", source: "200forums.com", upvotes: 75, needsReview: false },
      { type: "tip", content: "Recall S55 (NHTSA 16V529000) provides free PCM/TCM reprogramming and harness replacement - check status at safercar.gov", source: "allpar.com", upvotes: 60, needsReview: false },
      { type: "tip", content: "Regular transmission fluid services every 60,000 miles help significantly with shifting quality", source: "200forums.com", upvotes: 42, needsReview: false }
    ]
  },
  {
    id: "chrysler-200-oil-consumption-2015",
    vehicleMatch: {
      years: [2015, 2016, 2017],
      make: "Chrysler",
      model: "200",
      engines: ["2.4L Tigershark I4"]
    },
    category: "engine",
    title: "2.4L Tigershark Excessive Oil Consumption",
    description: "The 2.4L Tigershark MultiAir II engine has defective piston rings that allow oil into the combustion chamber. Owners report consuming 1 quart of oil every 500-1,000 miles. Engine can seize without warning if oil drops too low. Class-action settlement (Wood, et al. v. FCA US, LLC) reached. FCA extended powertrain warranty to 7 years/100,000 miles under CSN W80.",
    solution: "Contact FCA dealer for oil consumption test under CSN W80 warranty extension. If test fails, engine long block replacement under extended warranty (7 years/100,000 miles). PCM/TCM reprogramming may reduce consumption in some cases. File claim at fcatigersharksettlement.com if eligible. Use full synthetic 0W-20 oil.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Oil consumption of 1+ quart per 1,000 miles",
      "Low oil pressure warning light",
      "Blue smoke from exhaust",
      "Engine stalling or seizing without warning",
      "Rough idle or misfires"
    ],
    affectedSystems: ["Engine", "Lubrication"],
    estimatedCost: { low: 0, high: 8500 },
    citations: [
      { type: "legal", title: "Wood, et al. v. FCA US, LLC - Tigershark Settlement" },
      { type: "forum", title: "200forums.com - Oil Consumption Thread" }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    lastReportedByOwners: "2025-06-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Check oil every 500 miles - do NOT rely on dashboard warning. Engine can seize without warning if oil drops too low", source: "200forums.com", upvotes: 90, needsReview: false },
      { type: "tip", content: "CSN W80 warranty extension covers 7 years/100,000 miles. File claim at fcatigersharksettlement.com. Document all oil purchases with receipts", source: "allpar.com", upvotes: 75, needsReview: false },
      { type: "tip", content: "Use only full synthetic 0W-20 oil. PCM/TCM reprogramming at dealer may reduce consumption in some cases", source: "200forums.com", upvotes: 45, needsReview: false }
    ]
  },
  {
    id: "chrysler-200-62te-trans-2011",
    vehicleMatch: {
      years: [2011, 2012, 2013, 2014],
      make: "Chrysler",
      model: "200",
      engines: ["2.4L I4", "3.6L Pentastar V6"]
    },
    category: "transmission",
    title: "62TE 6-Speed Transmission Failure (Gen 1)",
    description: "The first-generation Chrysler 200 (rebadged Sebring) uses the 62TE 6-speed automatic which suffers from solenoid pack failures, valve body issues, and worn sealing rings. Hard shifting, slipping, and complete failure are common, often before 100,000 miles.",
    solution: "Solenoid pack replacement (68376696AA) for early symptoms. Full transmission rebuild or replacement for severe cases. Use ONLY Mopar ATF+4 fluid (68218058AC). Change fluid every 30,000 miles.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Hard shifting or jerking between gears",
      "Transmission slipping under load",
      "Delayed engagement from Park",
      "Stuck in 3rd gear (limp mode)",
      "Transmission overheating"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 300, high: 4500 },
    citations: [
      { type: "forum", title: "200forums.com - 62TE Transmission Problems" },
      { type: "forum", title: "allpar.com - 62TE Guide" }
    ],
    humanApproved: false,
    reportCount: 280,
    status: "published",
    lastReportedByOwners: "2025-03-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Solenoid pack 68376696AA is often sufficient if caught early - $300-$600 vs $2,500+ for full rebuild", source: "200forums.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "Use ONLY Mopar ATF+4 (68218058AC) - substitutes cause premature failure. Change every 30,000 miles, never follow 'lifetime' interval", source: "allpar.com", upvotes: 72, needsReview: false }
    ]
  },
  {
    id: "chrysler-200-electrical-drain-2015",
    vehicleMatch: {
      years: [2015, 2016, 2017],
      make: "Chrysler",
      model: "200"
    },
    category: "electrical",
    title: "Parasitic Battery Drain - Modules Not Sleeping",
    description: "The second-generation 200 suffers from parasitic battery drain caused by modules not going to sleep properly. The Body Control Module and UConnect system are common culprits. Battery can die in 2-3 days of sitting.",
    solution: "Request latest BCM software update from dealer. Check for aftermarket accessories causing draw. Disconnect negative battery terminal if parking for more than 3 days. Replace battery with AGM type for better cold-weather performance.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Dead battery after sitting 2-3 days",
      "Needing jump starts frequently",
      "Interior lights staying on after exiting",
      "Door lock/unlock cycling on its own"
    ],
    affectedSystems: ["Electrical", "Battery"],
    estimatedCost: { low: 0, high: 400 },
    citations: [
      { type: "forum", title: "200forums.com - Battery Drain Fix" }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    lastReportedByOwners: "2025-01-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Ask dealer for latest BCM software update - often resolves the module sleep issue for free", source: "200forums.com", upvotes: 48, needsReview: false },
      { type: "tip", content: "Disconnect negative battery terminal if parking for more than 3 days to prevent drain", source: "200forums.com", upvotes: 35, needsReview: false }
    ]
  },

  // ===== CHRYSLER PT CRUISER (2001-2010) =====
  {
    id: "chrysler-pt-cruiser-timing-belt-2001",
    vehicleMatch: {
      years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      make: "Chrysler",
      model: "PT Cruiser",
      engines: ["2.4L DOHC I4", "2.4L Turbo I4"]
    },
    category: "engine",
    title: "Timing Belt Failure - Critical on Turbo Models",
    description: "The 2.4L DOHC engine requires timing belt replacement at 60,000-90,000 mile intervals. The non-turbo version is non-interference (belt failure won't destroy engine), but the turbo GT version IS an interference engine where timing belt failure causes catastrophic valve-to-piston contact and engine destruction. Water pump is driven by timing belt and must be replaced simultaneously. Job rates 8/10 difficulty due to extremely tight engine bay.",
    solution: "Replace timing belt, water pump, tensioner, and idler pulleys as a complete kit. Gates PowerGrip Timing Belt Kit with water pump TCKWP265C (2003-2009) or TCKWP265B (2001-2002). Mopar water pump 4694307AB. Labor is 6-8 hours due to tight engine bay. NEVER skip on turbo models.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Ticking or slapping noise from timing cover area",
      "Engine misfires or runs rough",
      "Complete loss of power (belt failure)",
      "Engine cranks but won't start (belt jumped)"
    ],
    affectedSystems: ["Engine", "Timing"],
    estimatedCost: { low: 800, high: 1500 },
    citations: [
      { type: "forum", title: "allpar.com - Turbo PT Cruiser Timing Belt" },
      { type: "forum", title: "ptcruiserclub.com - Timing Belt Guide" }
    ],
    humanApproved: false,
    reportCount: 320,
    status: "published",
    lastReportedByOwners: "2024-11-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "NEVER skip timing belt replacement on turbo models - engine WILL be destroyed. Non-turbo is non-interference but turbo IS interference", source: "allpar.com", upvotes: 95, needsReview: false },
      { type: "tip", content: "Gates PowerGrip Timing Belt Kit with water pump: TCKWP265C (2003-2009) or TCKWP265B (2001-2002) - always replace water pump at timing belt service", source: "ptcruiserclub.com", upvotes: 72, needsReview: false },
      { type: "tip", content: "Use Gates kit over cheap aftermarket - Mopar water pump 4694307AB is the OEM alternative. Budget for this when purchasing a used PT Cruiser", source: "allpar.com", upvotes: 55, needsReview: false }
    ]
  },
  {
    id: "chrysler-pt-cruiser-head-gasket-2001",
    vehicleMatch: {
      years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      make: "Chrysler",
      model: "PT Cruiser",
      engines: ["2.4L DOHC I4", "2.4L Turbo I4"]
    },
    category: "engine",
    title: "Head Gasket Failure (Especially Turbo Models)",
    description: "Head gasket failure is common, especially on turbo models. The aluminum cylinder head is susceptible to pitting from acidic coolant which compromises the gasket seal. Turbo models experience higher cylinder pressures that accelerate failure. Overheating from cooling system issues frequently triggers head gasket failure.",
    solution: "Replace head gasket with Fel-Pro MLS gasket. HS 9946 PT for 2001, HS26206PT-1 for 2002-2009, or individual gasket 26206PT for 2002-2010. Machine cylinder head surface if pitting present. Replace thermostat and flush cooling system. Check head for warpage before reinstalling.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "White smoke from exhaust (coolant entering combustion)",
      "Coolant loss with no visible external leak",
      "Engine overheating",
      "Milky residue on oil cap (coolant in oil)",
      "Bubbling in coolant overflow tank"
    ],
    affectedSystems: ["Engine", "Cooling", "Head Gasket"],
    estimatedCost: { low: 1200, high: 2500 },
    citations: [
      { type: "forum", title: "allpar.com - PT Cruiser Head Gasket" },
      { type: "forum", title: "ptcruiserclub.com - Head Gasket Thread" }
    ],
    humanApproved: false,
    reportCount: 260,
    status: "published",
    lastReportedByOwners: "2024-08-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Fel-Pro head gasket set: HS 9946 PT (2001), HS26206PT-1 (2002-2009), individual 26206PT (2002-2010) - always use Fel-Pro MLS gasket", source: "ptcruiserclub.com", upvotes: 58, needsReview: false },
      { type: "tip", content: "Flush coolant every 30,000 miles to prevent aluminum corrosion. Use OAT coolant only - never Dex-Cool or universal green", source: "allpar.com", upvotes: 50, needsReview: false },
      { type: "warning", content: "Always have cylinder head checked for flatness and resurfaced during repair. Always replace thermostat during head gasket job", source: "ptcruiserclub.com", upvotes: 45, needsReview: false }
    ]
  },
  {
    id: "chrysler-pt-cruiser-overheating-2001",
    vehicleMatch: {
      years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      make: "Chrysler",
      model: "PT Cruiser"
    },
    category: "cooling",
    title: "Chronic Overheating - Multiple Causes",
    description: "PT Cruisers are extremely prone to overheating from multiple causes: radiator fan relay failure, fan motor failure, thermostat sticking closed, radiator clogging, and water pump failure. The high-speed fan relay is the most frequent single failure point. Overheating leads to head gasket failure. This is one of the most universally reported problems across all model years.",
    solution: "Diagnose root cause systematically: check fan relay (5149541AA) first, then fan motor, thermostat (Stant 45359), water pump, and radiator. Replace radiator cap (frequently causes overpressure issues). Cooling fan module 5017407AB for complete fan assembly replacement.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Temperature gauge climbing above normal, especially at idle",
      "A/C compressor disengaging (safety cutoff from high temps)",
      "Radiator fan not running with engine hot",
      "Steam or coolant smell from engine bay",
      "Check engine light with coolant temp codes"
    ],
    affectedSystems: ["Cooling", "Engine"],
    estimatedCost: { low: 100, high: 800 },
    citations: [
      { type: "forum", title: "allpar.com - PT Cruiser Overheating" },
      { type: "forum", title: "ptcruiserclub.com - Cooling System Guide" }
    ],
    humanApproved: false,
    reportCount: 380,
    status: "published",
    lastReportedByOwners: "2024-09-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Carry a spare fan relay (5149541AA, ~$15) - it's the most common single failure point that prevents catastrophic overheating", source: "ptcruiserclub.com", upvotes: 78, needsReview: false },
      { type: "tip", content: "Replace thermostat (Stant 45359) every 60,000 miles preventatively. Cooling fan module: 5017407AB for complete assembly", source: "allpar.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "Never use 'universal' coolant - use Mopar OAT only. Monitor temperature gauge constantly, especially in summer traffic", source: "ptcruiserclub.com", upvotes: 62, needsReview: false }
    ]
  },
  {
    id: "chrysler-pt-cruiser-turbo-failure-2003",
    vehicleMatch: {
      years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      make: "Chrysler",
      model: "PT Cruiser",
      engines: ["2.4L Turbo I4"],
      trims: ["GT", "Turbo"]
    },
    category: "engine",
    title: "Turbocharger Failure (GT/Turbo Models)",
    description: "The turbocharger on GT and turbo models fails from oil starvation, wastegate actuator failure, and bearing wear. Failures reported as early as 60,000-78,000 miles. Turbo failure is often followed by head gasket failure within months due to changes in combustion pressure dynamics.",
    solution: "Replace turbocharger assembly (Mopar 4884183AD) and turbo oil feed line (4891252AA). Must address root cause: oil feed line restriction, wastegate failure. Replace oil feed and drain lines during turbo replacement. Use only full synthetic oil and change every 3,000 miles. Idle 30-60 seconds before shutdown to cool turbo.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Loss of boost / reduced power",
      "Blue or white smoke from exhaust under acceleration",
      "Whining or grinding noise from turbo area",
      "Check engine light with boost pressure codes",
      "Oil leaking from turbo seals"
    ],
    affectedSystems: ["Engine", "Turbocharger"],
    estimatedCost: { low: 1500, high: 3500 },
    citations: [
      { type: "forum", title: "allpar.com - PT Cruiser Turbo Failure" },
      { type: "forum", title: "ptcruiserclub.com - Turbo Rebuild Thread" }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    lastReportedByOwners: "2024-07-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Mopar turbocharger assembly 4884183AD with turbo oil feed line 4891252AA - always replace oil feed and drain lines with turbo", source: "ptcruiserclub.com", upvotes: 48, needsReview: false },
      { type: "tip", content: "Let turbo cool down by idling 30-60 seconds before shutdown. Use only full synthetic 5W-30 oil, change every 3,000 miles maximum", source: "allpar.com", upvotes: 55, needsReview: false },
      { type: "warning", content: "Check turbo oil feed line for restrictions during every oil change - oil starvation is the #1 cause of premature turbo failure", source: "ptcruiserclub.com", upvotes: 42, needsReview: false }
    ]
  },

  // ===== CHRYSLER SEBRING - NEW ISSUES =====
  {
    id: "chrysler-sebring-timing-chain-water-pump-2001",
    vehicleMatch: {
      years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      make: "Chrysler",
      model: "Sebring",
      engines: ["2.7L V6"]
    },
    category: "engine",
    title: "2.7L V6 Timing Chain Stretch and Internal Water Pump Seizure",
    description: "The 2.7L V6 uses a timing chain that stretches prematurely due to oil sludge buildup restricting lubrication. The chain-driven internal water pump can seize and cause the timing chain to jump, destroying the engine. Water pump, timing chain, guides, and tensioner are all internal components requiring extensive disassembly to access. 7-8 hours labor.",
    solution: "Replace timing chain kit (Mopar 68036787AA, updated design), water pump (Mopar 4892425AA - MUST use Mopar updated design, NOT aftermarket), all guides, tensioner, and seals as a complete job. Preventive maintenance at 100,000 miles. Always replace water pump with timing chain.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Rattling noise from engine on startup",
      "Check engine light with timing codes",
      "Engine performance deterioration",
      "Engine misfires",
      "Complete engine failure if chain jumps"
    ],
    affectedSystems: ["Engine", "Timing Chain", "Water Pump"],
    estimatedCost: { low: 1200, high: 2500 },
    citations: [
      { type: "forum", title: "allpar.com - 2.7L Timing Chain Guide" },
      { type: "forum", title: "sebringclub.net - Water Pump Replacement" },
      { type: "forum", title: "dodgeintrepid.net - 2.7L Timing Service" }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    lastReportedByOwners: "2024-06-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Mopar updated water pump 4892425AA is the ONLY acceptable replacement - aftermarket pumps are NOT the updated design and will fail prematurely", source: "allpar.com", upvotes: 80, needsReview: false },
      { type: "tip", content: "Mopar timing chain kit 68036787AA (or 68036788AA) - this is preventive maintenance at 100,000 miles. Always replace water pump simultaneously", source: "sebringclub.net", upvotes: 62, needsReview: false },
      { type: "tip", content: "2004+ models have improved water pump design but still require diligent maintenance. Older 4892225AA chain design is inferior to updated kit", source: "dodgeintrepid.net", upvotes: 45, needsReview: false }
    ]
  },
  {
    id: "chrysler-sebring-alternator-voltage-2001",
    vehicleMatch: {
      years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      make: "Chrysler",
      model: "Sebring"
    },
    category: "electrical",
    title: "Alternator and PCM-Integrated Voltage Regulator Failure",
    description: "The Sebring's voltage regulator is integrated into the PCM (Powertrain Control Module), not the alternator. This unusual design means a voltage regulator failure requires PCM diagnosis/replacement rather than simple alternator work. Alternators also fail prematurely around 70,000 miles. Ground corrosion and battery terminal strip issues compound the problem.",
    solution: "Test alternator output and PCM voltage regulator function separately. Replace alternator (Remy Remanufactured 12423 for 2.7L) if output is low. If alternator tests good, PCM voltage regulator circuit has failed. Clean all battery terminals and ground connections, especially under PCM. External voltage regulator conversion available for chronic cases.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Battery warning light on dashboard",
      "Dead battery despite recent replacement",
      "Headlights dimming or flickering",
      "Dashboard electrical glitches",
      "Vehicle stalling due to low voltage"
    ],
    affectedSystems: ["Electrical", "Charging System"],
    estimatedCost: { low: 200, high: 1000 },
    citations: [
      { type: "forum", title: "allpar.com - Sebring Alternator Issues" },
      { type: "forum", title: "sebringclub.net - Voltage Regulator Thread" },
      { type: "forum", title: "chryslerforum.com - PCM Voltage Regulation" }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    lastReportedByOwners: "2024-05-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Test PCM voltage regulation BEFORE replacing alternator - the Sebring's voltage regulator is in the PCM, not the alternator", source: "allpar.com", upvotes: 58, needsReview: false },
      { type: "tip", content: "Remy Remanufactured alternator 12423 (2.7L). Clean all battery terminals and ground connections first, especially under PCM", source: "sebringclub.net", upvotes: 42, needsReview: false },
      { type: "tip", content: "External voltage regulator conversion available for chronic cases - check positive battery terminal on fuse box for stripping", source: "chryslerforum.com", upvotes: 35, needsReview: false }
    ]
  },

  // ===== CHRYSLER CROSSFIRE (2004-2008) =====
  {
    id: "chrysler-crossfire-egr-cat-2004",
    vehicleMatch: {
      years: [2004, 2005, 2006, 2007, 2008],
      make: "Chrysler",
      model: "Crossfire",
      engines: ["3.2L V6", "3.2L Supercharged V6"]
    },
    category: "emissions",
    title: "EGR Solenoid and Catalytic Converter Failure",
    description: "The Crossfire (built on Mercedes SLK R170 platform, sharing 80% of components) commonly experiences EGR solenoid failures and premature catalytic converter failure. The EGR solenoid is the most common cause of check engine lights. Catalytic converter rattles and fails, especially noticeable when accelerating from cold.",
    solution: "Replace EGR valve (Mercedes part A6121400060, fits Crossfire directly). Replace catalytic converter if rattling. Many Mercedes SLK R170 parts are direct replacements at lower cost. Use Mercedes dealer or independent Mercedes shop for best results.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Check engine light (EGR codes)",
      "Rattling noise from underneath when accelerating from cold",
      "Failed emissions inspection",
      "Rough idle",
      "Reduced fuel economy"
    ],
    affectedSystems: ["Emissions", "Exhaust"],
    estimatedCost: { low: 200, high: 2000 },
    citations: [
      { type: "forum", title: "crossfireforum.org - EGR and Cat Issues" },
      { type: "forum", title: "benzworld.org - SLK/Crossfire Parts" }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    lastReportedByOwners: "2024-04-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "EGR valve Mercedes part A6121400060 fits Crossfire directly - cross-reference Mercedes SLK320 R170 parts for cheaper replacements throughout", source: "crossfireforum.org", upvotes: 45, needsReview: false },
      { type: "tip", content: "The engine bay is virtually identical to SLK320 - use Mercedes dealer or independent Mercedes shop for best results and parts availability", source: "benzworld.org", upvotes: 38, needsReview: false }
    ]
  },
  {
    id: "chrysler-crossfire-ignition-switch-2004",
    vehicleMatch: {
      years: [2004, 2005, 2006, 2007, 2008],
      make: "Chrysler",
      model: "Crossfire"
    },
    category: "electrical",
    title: "Ignition Switch Failure - Key Sticking",
    description: "The ignition switch (Mercedes-sourced) commonly fails, causing the key to stick and not turn. Prevents starting the vehicle. The switch mechanism wears internally. Higher failure rate than equivalent Mercedes models.",
    solution: "Replace ignition switch assembly (Mercedes A2025450104). Use Mercedes OEM part for best quality. Graphite powder (not WD-40) can serve as temporary lubrication. Keep steering wheel centered when turning key to reduce stress on lock mechanism.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Key won't turn in ignition",
      "Key gets stuck and can't be removed",
      "Intermittent starting issues",
      "Steering lock won't release"
    ],
    affectedSystems: ["Electrical", "Ignition"],
    estimatedCost: { low: 300, high: 800 },
    citations: [
      { type: "forum", title: "crossfireforum.org - Ignition Switch Fix" },
      { type: "forum", title: "benzworld.org - Mercedes Ignition Issues" }
    ],
    humanApproved: false,
    reportCount: 130,
    status: "published",
    lastReportedByOwners: "2024-03-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Mercedes ignition switch A2025450104 - use Mercedes OEM part for best quality. Independent Mercedes shop preferred for replacement", source: "crossfireforum.org", upvotes: 35, needsReview: false },
      { type: "tip", content: "Use graphite powder (NEVER WD-40) for temporary lubrication. Keep steering wheel centered when turning key to reduce stress on lock", source: "benzworld.org", upvotes: 28, needsReview: false }
    ]
  },
  {
    id: "chrysler-crossfire-ac-interior-2004",
    vehicleMatch: {
      years: [2004, 2005, 2006, 2007, 2008],
      make: "Chrysler",
      model: "Crossfire"
    },
    category: "hvac",
    title: "A/C Compressor Failure and Interior Deterioration",
    description: "A/C compressor failure is a known weak point. Interiors prone to rattles, worn trim, and failing seat motors. Headlights collect condensation inside the lens. Brake discs and pads wear quickly. These are known aging issues common to the Mercedes R170 platform.",
    solution: "Replace A/C compressor. Source interior trim clips and parts from Mercedes SLK R170 donor vehicles. Headlight lenses can be resealed. Junkyard Mercedes SLK R170s are excellent parts sources since wheelbase and track width are identical to SLK320.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "A/C blowing warm air",
      "Clicking or noise from A/C compressor",
      "Interior rattles and trim pieces loosening",
      "Power seat stops adjusting",
      "Headlight fogging/condensation"
    ],
    affectedSystems: ["HVAC", "Interior", "Electrical"],
    estimatedCost: { low: 500, high: 1500 },
    citations: [
      { type: "forum", title: "crossfireforum.org - A/C and Interior Issues" },
      { type: "forum", title: "slkworld.com - R170 Common Issues" }
    ],
    humanApproved: false,
    reportCount: 120,
    status: "published",
    lastReportedByOwners: "2024-06-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Junkyard Mercedes SLK R170s are excellent parts sources - wheelbase and track are identical to SLK320. Cross-reference R170 parts for everything", source: "crossfireforum.org", upvotes: 40, needsReview: false },
      { type: "tip", content: "ABS sensor failures are also common - keep a spare on hand. Interior parts and exterior trim interchange directly with SLK", source: "slkworld.com", upvotes: 30, needsReview: false }
    ]
  },

  // ===== CHRYSLER ASPEN (2007-2009) =====
  {
    id: "chrysler-aspen-rear-diff-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009],
      make: "Chrysler",
      model: "Aspen"
    },
    category: "drivetrain",
    title: "Rear Differential Pinion Nut Loosening - Safety Recall",
    description: "The rear axle pinion nut can loosen due to undersized pinion spline that allows relative motion between the nut and companion flange. If the nut loosens, the rear axle can lock up without warning, causing loss of vehicle control. Official recall issued for pinion nut retainer installation.",
    solution: "Contact Chrysler dealer immediately for recall completion - free installation of pinion nut retainer. Have differential fluid checked and changed. Inspect pinion seal for leaks. TSB 18-006-10 REV. B addresses driveline clunking.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Humming noise from rear differential",
      "Clunking sound when accelerating or decelerating",
      "Vibration at highway speeds",
      "In worst case, sudden rear axle lockup"
    ],
    affectedSystems: ["Drivetrain", "Rear Axle", "Safety"],
    estimatedCost: { low: 0, high: 1200 },
    citations: [
      { type: "recall", title: "NHTSA Recall - Aspen Rear Differential" },
      { type: "tsb", title: "TSB 18-006-10 REV. B - Driveline Clunking" }
    ],
    humanApproved: false,
    reportCount: 100,
    status: "published",
    lastReportedByOwners: "2023-09-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "warning", content: "Get recall completed IMMEDIATELY - rear axle lockup is a serious safety issue. Free pinion nut retainer installation at Chrysler dealer", source: "chryslerforum.com", upvotes: 55, needsReview: false },
      { type: "tip", content: "Have differential fluid changed every 30,000 miles. Check pinion seal for leaks at every oil change. TSB 18-006-10 REV. B for driveline clunking", source: "allpar.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "chrysler-aspen-hemi-tick-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009],
      make: "Chrysler",
      model: "Aspen",
      engines: ["5.7L HEMI V8"]
    },
    category: "engine",
    title: "5.7L HEMI MDS Lifter Tick and Camshaft Failure",
    description: "Same HEMI 5.7L lifter/camshaft failure issue affecting all MDS-equipped engines. The MDS lifters have undersized needle bearings that fail from oil starvation at idle, causing catastrophic camshaft wear. Persistent ticking that worsens over time indicates lifter failure in progress.",
    solution: "Replace all lifters, camshaft, and rocker arms. Consider Hellcat non-MDS lifter upgrade (8784AD) for MDS delete. Use Melling high-volume oil pump M10452HV (2009+). Maintain strict 3,000-5,000 mile oil change intervals with synthetic oil.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Persistent ticking noise at idle",
      "Ticking worsens over time",
      "Check engine light with misfire codes",
      "Metal shavings in oil"
    ],
    affectedSystems: ["Engine", "Valvetrain"],
    estimatedCost: { low: 2000, high: 6000 },
    citations: [
      { type: "forum", title: "chryslerforum.com - HEMI Lifter Failure" },
      { type: "forum", title: "allpar.com - MDS Lifter Issues" }
    ],
    humanApproved: false,
    reportCount: 100,
    status: "published",
    lastReportedByOwners: "2024-02-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Hellcat non-MDS lifters (8784AD) for MDS delete - prevents oil starvation that causes lifter failure. Melling high-volume oil pump M10452HV for 2009+", source: "chryslerforum.com", upvotes: 45, needsReview: false },
      { type: "warning", content: "Use synthetic oil with strict 3,000-5,000 mile change intervals. Listen for ticking at every startup - early detection prevents catastrophic camshaft damage", source: "allpar.com", upvotes: 52, needsReview: false }
    ]
  },
  {
    id: "chrysler-aspen-tipm-2007",
    vehicleMatch: {
      years: [2007, 2008, 2009],
      make: "Chrysler",
      model: "Aspen"
    },
    category: "electrical",
    title: "TIPM Electrical Module Failure",
    description: "The Aspen shares the TIPM electrical module design with other Chrysler products. Fuel pump relay failure, random electrical activation, and battery drain are common. Same fundamental TIPM design flaw as Town & Country and 300.",
    solution: "TIPM rebuild service (UpFix, Circuit Board Medics, MAKS TIPM) at $200-$400 is most cost-effective. New TIPM from dealer $800-$1,500 + programming. External fuel pump bypass cable available for fuel pump relay only.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Vehicle won't start",
      "Fuel pump runs continuously with key off",
      "Random electrical malfunctions",
      "Battery drain overnight"
    ],
    affectedSystems: ["Electrical", "TIPM"],
    estimatedCost: { low: 200, high: 1500 },
    citations: [
      { type: "forum", title: "chryslerforum.com - Aspen TIPM Issues" },
      { type: "forum", title: "allpar.com - TIPM Problems" }
    ],
    humanApproved: false,
    reportCount: 80,
    status: "published",
    lastReportedByOwners: "2023-11-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "TIPM rebuild services (UpFix, Circuit Board Medics, MAKS TIPM) at $200-$400 are most cost-effective - plug-and-play, no dealer programming needed", source: "chryslerforum.com", upvotes: 38, needsReview: false },
      { type: "tip", content: "Fuel pump bypass cable available for emergency use if only fuel pump relay has failed", source: "allpar.com", upvotes: 28, needsReview: false }
    ]
  },

  // ===== CHRYSLER VOYAGER (2020-2024) =====
  {
    id: "chrysler-voyager-9speed-trans-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "Chrysler",
      model: "Voyager",
      engines: ["3.6L Pentastar V6"]
    },
    category: "transmission",
    title: "948TE 9-Speed Transmission Calibration Issues",
    description: "The 948TE 9-speed automatic paired with the 3.6L Pentastar V6 has well-documented calibration issues. Hesitation during light-throttle acceleration, delayed 2nd-to-3rd upshifts, and shuddering under load. For 2023+, Chrysler introduced revised valve body and updated shift logic with fewer complaints.",
    solution: "Get latest PCM/TCM software update from dealer (often resolves 80%+ of shifting complaints). For 2020-2022, updated 2023 valve body can be installed. Regular transmission fluid service every 60,000 miles.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Hesitation during light-throttle acceleration",
      "Delayed 2nd-to-3rd gear upshift",
      "Shuddering under load at low speeds",
      "Harsh downshifts",
      "Occasional clunk when shifting from Park"
    ],
    affectedSystems: ["Transmission"],
    estimatedCost: { low: 0, high: 3000 },
    citations: [
      { type: "forum", title: "chryslerminivan.net - Voyager Transmission" },
      { type: "forum", title: "allpar.com - 948TE 9-Speed Issues" }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    lastReportedByOwners: "2025-08-10",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Get latest PCM/TCM software update first - often resolves 80%+ of shifting complaints for free. 2023+ models have significantly improved valve body", source: "chryslerminivan.net", upvotes: 48, needsReview: false },
      { type: "tip", content: "Change transmission fluid every 60,000 miles despite 'lifetime' claim - helps significantly with shifting quality", source: "allpar.com", upvotes: 35, needsReview: false }
    ]
  },
  {
    id: "chrysler-voyager-rear-hvac-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "Chrysler",
      model: "Voyager"
    },
    category: "hvac",
    title: "Rear HVAC Blower Motor Resistor Failure",
    description: "The rear HVAC blower motor resistor fails, causing the rear fan to work only on highest speed setting or not at all. Particularly problematic in a minivan where rear passengers rely on rear climate control.",
    solution: "Replace rear blower motor resistor (Mopar 68233575AA). Accessible from behind rear interior trim. Easy DIY repair in 30-60 minutes. Check for debris blocking rear air intake before replacing resistor.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Rear fan works only on highest speed",
      "Rear fan stops working entirely",
      "Burning smell from rear HVAC vent area"
    ],
    affectedSystems: ["HVAC"],
    estimatedCost: { low: 50, high: 200 },
    citations: [
      { type: "forum", title: "chryslerminivan.net - Rear HVAC Fix" }
    ],
    humanApproved: false,
    reportCount: 80,
    status: "published",
    lastReportedByOwners: "2025-05-15",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Mopar rear blower motor resistor 68233575AA - easy DIY repair in 30-60 minutes. Check for debris blocking rear air intake first", source: "chryslerminivan.net", upvotes: 32, needsReview: false }
    ]
  },
  {
    id: "chrysler-voyager-uconnect-screen-2020",
    vehicleMatch: {
      years: [2020, 2021, 2022, 2023, 2024],
      make: "Chrysler",
      model: "Voyager"
    },
    category: "electrical",
    title: "UConnect 4 Touchscreen Delamination",
    description: "The UConnect 4 7-inch infotainment touchscreen suffers from capacitive layer delamination, especially near the bottom third. Screen becomes unresponsive in affected areas, requiring physical replacement. Same unit used in the Pacifica. Hardware defect with no software fix available.",
    solution: "Screen replacement at dealer. No software fix available as this is a hardware defect. Check if still under warranty before paying. Some owners use screen protectors to slow the delamination process.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Touchscreen unresponsive in certain areas",
      "Visible discoloration or separation of screen layers",
      "Ghost touches or phantom inputs",
      "Screen requires harder presses to register"
    ],
    affectedSystems: ["Infotainment", "Electrical"],
    estimatedCost: { low: 500, high: 1200 },
    citations: [
      { type: "forum", title: "chryslerminivan.net - UConnect Screen Issues" },
      { type: "forum", title: "pacificaforums.com - Screen Delamination" }
    ],
    humanApproved: false,
    reportCount: 100,
    status: "published",
    lastReportedByOwners: "2025-07-20",
    reviewedOn: "2026-02-22",
    communityRecommendations: [
      { type: "tip", content: "Check if still under warranty before paying out of pocket - this is a known hardware defect. Screen protectors can slow the delamination process", source: "chryslerminivan.net", upvotes: 38, needsReview: false },
      { type: "tip", content: "Avoid pressing screen extremely hard - it accelerates delamination. Same issue affects Pacifica, so fixes apply to both", source: "pacificaforums.com", upvotes: 25, needsReview: false }
    ]
  }
];

// Add to database
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
console.log('\nAdded ' + addedCount + ' Chrysler batch 2 issues (200 + PT Cruiser + Sebring + Crossfire + Aspen + Voyager)');
console.log('Total issues in database: ' + data.issues.length);
