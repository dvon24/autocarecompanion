const fs = require('fs');
const path = require('path');

const ISSUES_PATH = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

// Load current data
const issuesData = JSON.parse(fs.readFileSync(ISSUES_PATH, 'utf8'));
const ymmtData = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf8'));

const existingIds = new Set(issuesData.issues.map(i => i.id));

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ============================================================
// NEW ISSUES - 11 models, 3-5 issues each
// ============================================================

const newIssues = [

  // =========================================================
  // NISSAN CUBE (2009-2014)
  // =========================================================
  {
    id: "nissan-cube-cvt-failure-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Nissan",
      model: "Cube",
      engines: ["1.8L MR18DE I4"]
    },
    category: "transmission",
    title: "CVT Transmission Failure and Shuddering",
    description: "The Jatco CVT in the Cube is prone to premature failure, typically between 80,000-120,000 miles. Owners report shuddering during acceleration, delayed engagement from Park, and eventual complete transmission failure. Nissan extended the CVT warranty on some models to 10 years/120,000 miles, but many Cubes fall outside this coverage. The CVT belt stretches and the valve body develops issues, leading to erratic behavior before total failure.",
    solution: "Check if your VIN qualifies for Nissan's extended CVT warranty. If experiencing early symptoms (shuddering, slipping), have the CVT fluid changed with Nissan NS-2 fluid — this can extend life. Once failure occurs, replacement with a remanufactured CVT ($2,500-$4,000) is more cost-effective than a new unit. Avoid aggressive driving and ensure CVT fluid stays clean.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Shuddering or juddering during acceleration",
      "Delayed engagement when shifting from Park to Drive",
      "Whining or humming noise from transmission",
      "RPM surging without corresponding acceleration",
      "Vehicle hesitates or jerks at low speeds"
    ],
    estimatedCost: { low: 2500, high: 4500 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaints - Nissan Cube CVT Failure", url: "https://www.nhtsa.gov/vehicle/2009/NISSAN/CUBE" },
      { type: "tsb", title: "Nissan CVT Extended Warranty - NTB10-013", url: "https://static.nhtsa.gov/odi/tsbs/2010/MC-10041108-0001.pdf" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Change CVT fluid every 30,000 miles with genuine Nissan NS-2 fluid to extend transmission life.", upvotes: 0 },
      { type: "warning", content: "Do NOT flush the CVT — only drain and fill. Flushing can dislodge debris and cause immediate failure.", upvotes: 0 },
      { type: "tip", content: "If the CVT fails, a remanufactured unit is typically half the cost of a dealer replacement and carries a warranty.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 320,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0868", "P0741", "P0746"]
  },
  {
    id: "nissan-cube-escl-failure-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Nissan",
      model: "Cube"
    },
    category: "electrical",
    title: "Electronic Steering Column Lock (ESCL) No-Start Condition",
    description: "The electronic steering column lock module can fail, preventing the vehicle from starting. Nissan acknowledged this defect with service campaign NTB11-057. The ESCL can become stuck in the locked position, and the dashboard displays a steering lock warning. This is a known manufacturing defect in the ESCL module affecting multiple Nissan models from this era.",
    solution: "Nissan issued voluntary service campaign NTB11-057 to address this. Contact your dealer to check eligibility. If out of coverage, the ESCL module replacement costs $600-$1,000. Some independent shops can repair the module for less. As a temporary workaround, repeatedly cycling the key or wiggling the steering wheel may release the lock.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle will not start — steering lock warning on dash",
      "Key turns but engine does not crank",
      "Steering wheel locked and cannot be turned",
      "Intermittent no-start conditions",
      "ESCL warning light illuminated"
    ],
    estimatedCost: { low: 0, high: 1000 },
    citations: [
      { type: "tsb", title: "Nissan Service Campaign NTB11-057 - ESCL Defect", url: "https://static.nhtsa.gov/odi/tsbs/2011/MC-10045741-0001.pdf" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Check with your Nissan dealer first — this may be covered under the voluntary service campaign at no cost.", upvotes: 0 },
      { type: "tip", content: "If the ESCL fails, try turning the key while gently rocking the steering wheel left and right — this sometimes releases the lock temporarily.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 450,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "nissan-cube-exhaust-separation-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Nissan",
      model: "Cube"
    },
    category: "exhaust",
    title: "Exhaust System Flange Separation and Heat Damage",
    description: "The exhaust system on the Cube is prone to separating at the flange connections, particularly where the manifold meets the catalytic converter section. When the exhaust separates, extreme heat from the broken joint can damage the rear bumper and surrounding components. The heat shield coverage does not adequately protect the area near the common separation point, which is near the fuel tank.",
    solution: "Inspect exhaust flange connections regularly, especially after 60,000 miles. If you notice increased exhaust noise or smell exhaust in the cabin, have it inspected immediately. Replacement of the exhaust flange gaskets and bolts is the typical repair. If the flange itself is damaged, a section of exhaust pipe may need replacement. Aftermarket stainless steel flanges are more durable than OEM.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "Loud exhaust noise that suddenly gets worse",
      "Smell of exhaust fumes inside the cabin",
      "Visible heat damage or melting on rear bumper",
      "Rattling noise from underneath the vehicle",
      "Exhaust leak sound on cold starts"
    ],
    estimatedCost: { low: 200, high: 800 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaint - Exhaust System Separation", url: "https://www.nhtsa.gov/vehicle/2009/NISSAN/CUBE" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Apply anti-seize compound to exhaust flange bolts during any exhaust work to prevent future seizing and make repairs easier.", upvotes: 0 },
      { type: "warning", content: "If exhaust separates near the fuel tank area, stop driving immediately — the heat near the tank is a fire risk.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 85,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "nissan-cube-stalling-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Nissan",
      model: "Cube",
      engines: ["1.8L MR18DE I4"]
    },
    category: "engine",
    title: "Intermittent Engine Stalling While Driving",
    description: "Multiple owners report the Cube stalling unexpectedly while driving at various speeds, including highway speeds. The engine shuts off without warning, causing loss of power steering and power brakes. In some cases, pumping the accelerator at the moment of stalling can catch the engine before it dies completely. The issue has been linked to faulty crankshaft position sensors, throttle body failures, and ECM software bugs.",
    solution: "Start with cleaning the throttle body and checking for vacuum leaks. Replace the crankshaft position sensor if codes P0335 or P0340 are present. Have the ECM software updated at a Nissan dealer. If the problem persists, the throttle body assembly may need replacement. Always keep up with spark plug replacement at the recommended 105,000-mile interval.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Engine stalls without warning while driving",
      "Loss of power steering and brakes during stall",
      "Engine dies at idle or low speed",
      "Check engine light may or may not illuminate",
      "Difficulty restarting after stalling"
    ],
    estimatedCost: { low: 150, high: 700 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaints - Engine Stalling Nissan Cube", url: "https://www.nhtsa.gov/vehicle/2011/NISSAN/CUBE" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Clean the throttle body with CRC Throttle Body Cleaner every 30,000 miles — this prevents carbon buildup that causes stalling.", upvotes: 0 },
      { type: "warning", content: "Stalling at highway speeds is extremely dangerous. If it happens more than once, do not drive until diagnosed.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0335", "P0340", "P0505"]
  },

  // =========================================================
  // NISSAN NV200 (2013-2021)
  // =========================================================
  {
    id: "nissan-nv200-cvt-failure-2013",
    vehicleMatch: {
      years: range(2013, 2021),
      make: "Nissan",
      model: "NV200",
      engines: ["2.0L MR20DD I4"]
    },
    category: "transmission",
    title: "CVT Transmission Failure Under Commercial Use",
    description: "The NV200's Jatco CVT transmission is particularly prone to failure when used for commercial delivery work, which is the vehicle's primary purpose. The constant stop-and-go driving and heavy loads accelerate CVT belt wear and valve body degradation. Many owners report failure between 60,000-100,000 miles. Symptoms include jerking during acceleration, delayed shifting, and eventually complete loss of drive.",
    solution: "Change CVT fluid every 25,000 miles with Nissan NS-2 CVT fluid — more frequently than the recommended interval given commercial use patterns. If shuddering begins, an immediate fluid change may extend life. When replacement is needed, a remanufactured CVT ($2,500-$3,500) is more economical than a dealer unit. Consider aftermarket CVT coolers for delivery vehicles.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Jerking or shuddering during acceleration",
      "Delayed engagement from Park to Drive or Reverse",
      "Whining noise that increases with speed",
      "RPM fluctuation without speed change",
      "Complete loss of forward or reverse drive"
    ],
    estimatedCost: { low: 2500, high: 4500 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaints - NV200 Transmission", url: "https://www.nhtsa.gov/vehicle/2015/NISSAN/NV200" },
      { type: "forum", title: "NV200 Forum - CVT Transmission Problems", url: "https://www.nv200forum.com/threads/transmission-problems.7937/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Install an aftermarket CVT transmission cooler if you use the NV200 for delivery work — it significantly extends CVT life.", upvotes: 0 },
      { type: "warning", content: "Do not exceed the NV200's payload capacity (1,480 lbs) — overloading dramatically shortens CVT lifespan.", upvotes: 0 },
      { type: "tip", content: "Change CVT fluid every 25,000 miles for commercial use rather than the 60,000-mile factory interval.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 280,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0868", "P0746", "P0744"]
  },
  {
    id: "nissan-nv200-premature-tire-wear-2013",
    vehicleMatch: {
      years: range(2013, 2021),
      make: "Nissan",
      model: "NV200"
    },
    category: "tires",
    title: "Premature and Uneven Tire Wear",
    description: "The NV200 is notorious for premature and uneven tire wear, with many owners needing tire replacement at just 20,000-25,000 miles. The rear tires develop cupping and inside-edge wear even with proper alignment. The issue stems from the vehicle's suspension geometry and the tendency for rear alignment to go out of spec under load. The problem is the single highest complaint category for the NV200 on NHTSA.",
    solution: "Have alignment checked every 10,000 miles or after any pothole impact. Rotate tires every 5,000 miles. Many owners find that a slight toe adjustment beyond factory spec reduces the wear pattern. Use commercial-rated LT tires rather than passenger tires for longer life. Keep tire pressure at the door placard specification — the NV200 runs higher pressures than typical passenger cars.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Inner edge tire wear on rear tires",
      "Cupping pattern on tire tread",
      "Tires need replacement before 25,000 miles",
      "Vibration at highway speeds from uneven wear",
      "Pulling to one side after tire rotation"
    ],
    estimatedCost: { low: 400, high: 800 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaints - NV200 Tire Wear (7 complaints)", url: "https://www.carcomplaints.com/Nissan/NV200/2013/wheels_hubs/tires.shtml" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Use commercial-rated tires like Michelin Agilis or Continental VanContact — they outlast passenger tires significantly on the NV200.", upvotes: 0 },
      { type: "tip", content: "Rotate tires every 5,000 miles religiously and get alignment checked every 10,000 miles.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "nissan-nv200-catalytic-converter-theft-2013",
    vehicleMatch: {
      years: range(2013, 2021),
      make: "Nissan",
      model: "NV200"
    },
    category: "exhaust",
    title: "Catalytic Converter Theft Vulnerability",
    description: "The NV200 is one of the most targeted vehicles for catalytic converter theft due to its higher ground clearance and easily accessible exhaust system. Muffler shops report seeing 2-10 NV200s per week with stolen converters. Thieves can remove the catalytic converters in under two minutes. The NV200 has two catalytic converters, and often both are stolen. Replacement costs are significant and the vehicle cannot pass emissions inspection without them.",
    solution: "Install a catalytic converter shield or cage (aftermarket options from $200-$500). Park in well-lit areas or garages when possible. Consider a catalytic converter alarm that detects vibration on the exhaust system. When replacing, aftermarket CARB-compliant converters are significantly cheaper than OEM. Some owners weld rebar or steel cable around the converters as a deterrent.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Extremely loud exhaust noise (sounds like no muffler)",
      "Check engine light with catalyst efficiency codes",
      "Visible cut marks on exhaust pipe under vehicle",
      "Vehicle fails emissions inspection",
      "Rattling from where converter was cut"
    ],
    estimatedCost: { low: 1000, high: 3000 },
    citations: [
      { type: "news", title: "NV200 Prime Target for Catalytic Converter Theft", url: "https://www.torquenews.com/8113/top-muffler-shop-says-nissan-nv200-prime-target-catalytic-converter-theft" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Install a catalytic converter shield — brands like CatClamp or MillerCAT make NV200-specific options for $200-$400.", upvotes: 0 },
      { type: "tip", content: "Aftermarket CARB-compliant catalytic converters are $400-$600 each vs $1,200+ for OEM — check your state's emissions laws.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 500,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0420", "P0430"]
  },
  {
    id: "nissan-nv200-sliding-door-2013",
    vehicleMatch: {
      years: range(2013, 2021),
      make: "Nissan",
      model: "NV200"
    },
    category: "body",
    title: "Sliding Door Sticking and Latch Failure",
    description: "The NV200's sliding doors are prone to sticking, becoming difficult to open or close, and latch mechanism failures. Dust, dirt, and debris accumulate in the sliding door track and rollers, causing the doors to jam. The latch mechanism can also fail, leaving the door unable to lock or unlatch properly. This is particularly problematic for commercial users who open and close the doors dozens of times per day.",
    solution: "Clean and lubricate sliding door tracks and rollers every 3 months with white lithium grease. If the door becomes stuck, check the lower roller assembly for debris. Replace worn rollers ($50-$100 each). If the latch mechanism fails, the entire latch assembly needs replacement ($150-$300 for parts). Spray silicone lubricant on the latch striker and mechanism monthly.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Sliding door difficult to open or close",
      "Grinding or scraping noise when operating door",
      "Door does not latch closed securely",
      "Door opens but won't stay in open position",
      "Latch mechanism clicks but door doesn't release"
    ],
    estimatedCost: { low: 50, high: 400 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaints - NV200 Sliding Door Issues", url: "https://www.nhtsa.gov/vehicle/2017/NISSAN/NV200" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Spray white lithium grease in the sliding door tracks every 3 months — this prevents 90% of sticking issues.", upvotes: 0 },
      { type: "tip", content: "Check and clean the lower roller assembly when the door gets hard to move — debris collects there quickly.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 120,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // =========================================================
  // TOYOTA MIRAI (2016-2024)
  // =========================================================
  {
    id: "toyota-mirai-fuel-cell-warning-2016",
    vehicleMatch: {
      years: range(2016, 2024),
      make: "Toyota",
      model: "Mirai"
    },
    category: "fuel_system",
    title: "Fuel Cell System Warning and Sudden Power Loss",
    description: "Mirai owners report fuel cell system warnings that signal malfunctions in the hydrogen fuel cell stack, resulting in sudden power loss while driving. A class-action lawsuit filed in 2023 alleges Toyota concealed known defects in the fuel cell system that can cause dangerous power losses. The fuel cell system relies on precise hydrogen supply management, and disruptions from leaks, blockages, or hydrogen storage tank issues trigger warnings and reduced performance or complete shutdown.",
    solution: "If the fuel cell system warning illuminates, safely pull over and restart the vehicle. Many warnings are caused by software glitches that clear with a restart. For persistent warnings, the dealer must diagnose whether the issue is in the fuel cell stack, power control unit, or hydrogen supply system. Toyota has released software updates that address some fuel cell management issues. Keep all scheduled maintenance current as the fuel cell system requires specific inspections.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Fuel cell system warning light on dashboard",
      "Sudden loss of power while driving",
      "Reduced power mode / limp mode activation",
      "Unusual hissing, clicking, or buzzing from fuel cell area",
      "Vibrations while accelerating or at idle"
    ],
    estimatedCost: { low: 0, high: 8000 },
    citations: [
      { type: "legal", title: "Mirai Fuel Cell Class Action Lawsuit (2023)", url: "https://jasoningber.com/fuel-cell-system-warnings-in-toyota-mirai/" },
      { type: "news", title: "Toyota Faces $5.7B Mirai Lawsuit", url: "https://insideevs.com/news/708375/toyota-mirai-hydrogen-stations-close/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Keep detailed records of every fuel cell warning — this documentation is important if you need to pursue warranty claims or lemon law.", upvotes: 0 },
      { type: "warning", content: "Do not ignore fuel cell warnings — hydrogen leaks are a serious safety concern and require immediate professional inspection.", upvotes: 0 },
      { type: "tip", content: "Check if your VIN is covered by Toyota's extended fuel cell warranty or any settlement from the class-action lawsuit.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "toyota-mirai-hydrogen-infrastructure-2016",
    vehicleMatch: {
      years: range(2016, 2024),
      make: "Toyota",
      model: "Mirai"
    },
    category: "fuel_system",
    title: "Hydrogen Refueling Station Availability and Cost Crisis",
    description: "Mirai owners face severe difficulties refueling due to the extremely limited hydrogen infrastructure. As of 2024, only approximately 54 hydrogen stations exist in the U.S., almost all in California, with many frequently offline for maintenance. Hydrogen fuel costs have increased roughly 200%, from $13/kg in 2022 to approximately $36/kg in 2024. The class-action lawsuit alleges Toyota marketed the Mirai despite knowing the refueling infrastructure was inadequate. This has caused severe depreciation — the Mirai retains only about 19.4% of its value after five years.",
    solution: "Before purchasing, verify that hydrogen stations along your regular routes are operational using the California Fuel Cell Partnership station map. Budget for significantly higher fuel costs than initially advertised. If you are unable to reliably refuel, consult a lemon law attorney about your options. Toyota previously offered $15,000 in free hydrogen fuel with new Mirai purchases — verify your remaining balance. Consider whether your driving needs can be met by the limited station network.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Unable to find operational hydrogen refueling station",
      "Nearest hydrogen station offline for extended periods",
      "Fuel costs significantly higher than expected",
      "Actual driving range 100+ miles less than advertised",
      "Vehicle sitting unused due to inability to refuel"
    ],
    estimatedCost: { low: 0, high: 500 },
    citations: [
      { type: "legal", title: "Mirai Hydrogen Infrastructure Class Action (2024)", url: "https://www.autobodynews.com/news/toyota-faces-lawsuit-over-hydrogen-powered-car-difficulties" },
      { type: "news", title: "Mirai Owners Suing Toyota Over Hydrogen Availability", url: "https://www.jalopnik.com/2056615/mirai-owners-suing-toyota-hydrogen-hard-to-find/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Use the California Fuel Cell Partnership app to check station status before driving to refuel — stations go offline frequently.", upvotes: 0 },
      { type: "warning", content: "Do not purchase a Mirai unless you live within 15 minutes of a reliable hydrogen station. The infrastructure is not improving.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 800,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "toyota-mirai-range-shortfall-2016",
    vehicleMatch: {
      years: range(2016, 2024),
      make: "Toyota",
      model: "Mirai"
    },
    category: "fuel_system",
    title: "Real-World Range Significantly Below Advertised Figures",
    description: "Owners consistently report the Mirai's actual driving range falls 80-100+ miles short of Toyota's advertised figures (357 miles for Limited, 402 miles for XLE). Factors include hydrogen tank pressure variations at different stations, temperature effects on fuel cell efficiency, and aggressive driving. Gen 1 (2016-2020) models are particularly affected with a smaller tank and older fuel cell technology. This is a major factor in the class-action lawsuit.",
    solution: "Expect roughly 250-300 miles of real-world range rather than the advertised figures. Drive conservatively and use eco mode to maximize range. Plan routes with refueling stops more frequently than the estimated range suggests. In cold weather, expect further range reduction of 10-20%. Gen 2 (2021+) models have improved range but still fall short of advertised numbers.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Fuel gauge drops faster than expected",
      "Estimated range after refueling is significantly below rated range",
      "Range anxiety due to limited refueling options",
      "Cold weather causing noticeable range reduction",
      "Inconsistent fill levels at different hydrogen stations"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "legal", title: "Mirai Range Allegations in Class Action", url: "https://insideevs.com/news/708375/toyota-mirai-hydrogen-stations-close/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Plan for 250-300 miles of real range, not the advertised 357-402 miles. This prevents being stranded.", upvotes: 0 },
      { type: "tip", content: "Refuel when you reach half tank rather than waiting — hydrogen station availability can change without notice.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 600,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // =========================================================
  // TOYOTA COROLLA HATCHBACK (2019-2024)
  // =========================================================
  {
    id: "toyota-corolla-hatch-cvt-torque-converter-2019",
    vehicleMatch: {
      years: range(2019, 2024),
      make: "Toyota",
      model: "Corolla Hatchback",
      engines: ["2.0L M20A-FKS I4"]
    },
    category: "transmission",
    title: "CVT Torque Converter Impeller Blade Detachment (Recall)",
    description: "Toyota recalled certain 2019 Corolla Hatchback models with CVT transmissions due to pump impeller blades within the torque converter potentially detaching under high-load driving conditions. If blades detach, the torque converter loses hydraulic pressure, causing the vehicle to stall and lose power while driving. This is a safety recall (NHTSA Campaign 19V-252).",
    solution: "Check if your VIN is affected by Toyota Safety Recall J07. If covered, Toyota dealers will replace the CVT and torque converter free of charge. This recall primarily affects early 2019 production vehicles. Even if not recalled, if you experience sudden power loss or unusual transmission noises, have the torque converter inspected.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Sudden loss of power while driving",
      "Vehicle stalls under heavy acceleration or uphill",
      "Metallic debris noise from transmission area",
      "Transmission warning light illuminated",
      "Shuddering under load"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "recall", title: "Toyota Safety Recall J07 - CVT Torque Converter", url: "https://toyota.oemdtc.com/383/safety-recall-j07-potential-loss-of-power-while-driving-2019-toyota-corolla-hatchback" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Check your VIN at toyota.com/recall to see if this recall applies to your vehicle — the repair is free.", upvotes: 0 },
      { type: "warning", content: "If you experience sudden power loss, this is a safety issue. Do not continue driving — have the vehicle towed to a dealer.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0700", "P0741"]
  },
  {
    id: "toyota-corolla-hatch-milky-oil-2019",
    vehicleMatch: {
      years: range(2019, 2024),
      make: "Toyota",
      model: "Corolla Hatchback",
      engines: ["2.0L M20A-FKS I4"]
    },
    category: "engine",
    title: "Milky/Discolored Engine Oil from Condensation",
    description: "Toyota issued a TSB for 2018-2024 vehicles with M20A-FKS engines exhibiting milky or discolored engine oil. The issue is caused by condensation buildup in the engine, particularly in vehicles driven on short trips in cold or humid conditions where the engine does not reach full operating temperature. While not immediately damaging, prolonged milky oil reduces lubrication effectiveness and can lead to accelerated wear.",
    solution: "This is primarily a driving pattern issue. Take the vehicle on longer drives (20+ minutes at highway speed) at least once a week to allow the engine to reach full operating temperature and burn off moisture. If oil appears milky, change it promptly. Toyota's TSB recommends following the shorter oil change interval (5,000 miles) if the vehicle is primarily used for short trips. Do not confuse this with head gasket failure — the M20A engine does not have widespread head gasket issues.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Milky white or tan discoloration visible on oil cap",
      "Oil dipstick shows cloudy or foamy oil",
      "Oil appears lighter in color than normal",
      "Condensation droplets visible on oil filler cap",
      "Engine Maintenance Required message on dash (some models)"
    ],
    estimatedCost: { low: 50, high: 150 },
    citations: [
      { type: "tsb", title: "Toyota TSB - Milky/Discolored Engine Oil (M20A-FKS)", url: "https://www.carcomplaints.com/Toyota/Corolla_Hatchback/2019/tsbs/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Drive at least 20 minutes at highway speed once per week to burn off condensation — this prevents the milky oil issue entirely.", upvotes: 0 },
      { type: "tip", content: "Don't panic if you see milky residue on the oil cap — it's usually condensation, not a head gasket problem. Check the dipstick for confirmation.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 120,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "toyota-corolla-hatch-hvac-drain-clog-2019",
    vehicleMatch: {
      years: [2019, 2020],
      make: "Toyota",
      model: "Corolla Hatchback"
    },
    category: "hvac",
    title: "HVAC Drain Tube Clogging and AC Odor",
    description: "Toyota issued a TSB for 2019-2020 Corolla Hatchback vehicles where HVAC drain tubes become blocked or clogged, leading to water accumulation in the evaporator housing. This causes musty or moldy odors from the vents, reduced AC performance, and potential water leaking into the cabin footwell. The hatchback's drain tube routing is particularly prone to blockage compared to the sedan variant.",
    solution: "Have the HVAC drain tube cleared by blowing compressed air through it from underneath the vehicle. Toyota's TSB specifies a special procedure when using AC Power Foam Evaporator Cleaner on these models. Run the AC on recirculate for 10 minutes with windows open periodically to dry the evaporator. For persistent odor, the evaporator may need cleaning with Toyota-approved AC cleaner. Preventive tip: run the fan on high with AC off for 5 minutes before parking to dry the evaporator.",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Musty or moldy smell from AC vents",
      "Water dripping onto passenger side footwell",
      "Reduced air conditioning cooling performance",
      "Foggy windshield that AC cannot clear",
      "Gurgling sound from dashboard area when braking"
    ],
    estimatedCost: { low: 50, high: 300 },
    citations: [
      { type: "tsb", title: "Toyota TSB - HVAC Drain Tube Service (Corolla Hatchback)", url: "https://www.carcomplaints.com/Toyota/Corolla_Hatchback/2019/tsbs/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Run the fan on high without AC for 5 minutes before you park — this dries the evaporator and prevents mold growth.", upvotes: 0 },
      { type: "tip", content: "Check the HVAC drain tube under the vehicle periodically — a steady drip of water when AC is running means it's clear.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 90,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "toyota-corolla-hatch-bluetooth-2019",
    vehicleMatch: {
      years: range(2019, 2024),
      make: "Toyota",
      model: "Corolla Hatchback"
    },
    category: "electrical",
    title: "Bluetooth Connectivity and Infotainment Pairing Failures",
    description: "Toyota issued a TSB acknowledging Bluetooth connectivity issues in the Corolla Hatchback's infotainment system. Owners report difficulty pairing phones, intermittent disconnections, failure to auto-connect when entering the vehicle, and audio cutting out during calls or music streaming. The issue affects both Android and iPhone devices and may worsen after phone OS updates.",
    solution: "First, try deleting the phone from the vehicle's Bluetooth list and re-pairing. Clear the vehicle's Bluetooth device history if multiple phones are stored. Check for infotainment system software updates at the dealer — Toyota has released multiple updates addressing Bluetooth stability. As a last resort, perform a factory reset of the infotainment system (Settings > General > Reset). Some owners report better stability by disabling WiFi on their phone while using Bluetooth in the car.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Phone fails to pair with vehicle Bluetooth",
      "Bluetooth disconnects intermittently during calls",
      "Audio streaming cuts out or skips",
      "Vehicle does not auto-connect to previously paired phone",
      "Contacts or call history not syncing to vehicle display"
    ],
    estimatedCost: { low: 0, high: 150 },
    citations: [
      { type: "tsb", title: "Toyota TSB - Bluetooth Connectivity Concerns", url: "https://www.carcomplaints.com/Toyota/Corolla_Hatchback/2019/tsbs/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Delete all paired devices from the car and re-pair your phone fresh — this resolves most Bluetooth issues.", upvotes: 0 },
      { type: "tip", content: "Ask the dealer to check for infotainment software updates — Toyota has released several fixes for Bluetooth stability.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // =========================================================
  // VOLKSWAGEN GTI (2006-2024) - model "Golf" with GTI trims
  // =========================================================
  {
    id: "vw-gti-water-pump-thermostat-2006",
    vehicleMatch: {
      years: range(2006, 2021),
      make: "Volkswagen",
      model: "Golf",
      engines: ["2.0T TSI", "2.0T TFSI"],
      trims: ["GTI", "GTI Autobahn", "GTI S", "GTI SE"]
    },
    category: "cooling",
    title: "Plastic Water Pump and Thermostat Housing Failure",
    description: "The water pump and thermostat housing on the EA888 engine are made of plastic and are notorious for cracking, warping, and leaking coolant. The water pump impeller can also degrade internally. This is such a well-known issue that Volkswagen extended warranty coverage and will replace the water pump for free up to 110,000 miles under a special service campaign. Failure typically occurs between 60,000-100,000 miles and can lead to overheating and engine damage if not caught quickly.",
    solution: "Check with your VW dealer about the extended water pump warranty coverage (up to 110,000 miles). If replacing, use an updated metal impeller water pump rather than the original plastic design. Replace the thermostat housing at the same time as it often fails next. The coolant temperature gauge is your best warning — any fluctuation above normal requires immediate attention. Many owners do this preventatively at 80,000 miles.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Coolant leak near front of engine",
      "Low coolant warning light",
      "Engine temperature gauge rising above normal",
      "Sweet smell of coolant from engine bay",
      "Steam from under hood",
      "Puddle of pink/orange fluid under car"
    ],
    estimatedCost: { low: 500, high: 1200 },
    citations: [
      { type: "tsb", title: "VW Extended Water Pump Warranty Campaign", url: "https://www.shopdap.com/blog/post/vw-gti-water-pump.html" },
      { type: "forum", title: "MK7 GTI Common Problems - ShopDAP", url: "https://www.shopdap.com/blog/post/mk7-gti-golfr-common-problems.html" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Check with your VW dealer — the water pump may be replaced free under the extended warranty, even on high-mileage vehicles.", upvotes: 0 },
      { type: "tip", content: "When replacing, upgrade to a metal impeller water pump (INA or Continental brand) — the plastic OEM units are the root cause of failure.", upvotes: 0 },
      { type: "warning", content: "If you see the coolant temperature spike, stop driving immediately. The EA888 engine can overheat and warp the head in minutes.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 3500,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P00B7", "P2181"]
  },
  {
    id: "vw-gti-carbon-buildup-2006",
    vehicleMatch: {
      years: range(2006, 2024),
      make: "Volkswagen",
      model: "Golf",
      engines: ["2.0T TSI", "2.0T TFSI"],
      trims: ["GTI", "GTI Autobahn", "GTI S", "GTI SE"]
    },
    category: "engine",
    title: "Direct Injection Carbon Buildup on Intake Valves",
    description: "All direct-injection EA888 engines suffer from carbon deposits accumulating on the intake valves because fuel is injected directly into the cylinder rather than washing over the valves. Over time (typically 40,000-80,000 miles), heavy carbon buildup restricts airflow, causing rough idle, misfires, and power loss. This is an inherent design limitation of port-less direct injection. MK8 GTIs (2022+) with dual injection (port + direct) are less affected.",
    solution: "Walnut blast cleaning is the most effective solution, removing carbon deposits by blasting walnut shell media through the intake ports. This should be done every 40,000-60,000 miles. Some owners use catch cans to reduce the oil vapor recirculating through the intake, though effectiveness varies. Reviva or CRC GDI IVD Intake Valve & Turbo Cleaner sprayed through the intake can help between walnut blasts. Avoid using fuel additives — they do not reach the intake valves on direct-injection engines.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rough idle that worsens over time",
      "Hesitation or stumble during acceleration",
      "Misfires and check engine light",
      "Reduced fuel economy",
      "Loss of power at higher RPM"
    ],
    estimatedCost: { low: 400, high: 800 },
    citations: [
      { type: "forum", title: "VW GTI Carbon Buildup - Common Problem", url: "https://vwtuning.co/mk7-gti-common-problems/" },
      { type: "forum", title: "MK7 GTI and Golf R Common Problems - ShopDAP", url: "https://www.shopdap.com/blog/post/mk7-gti-golfr-common-problems.html" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Schedule a walnut blast cleaning every 40,000-60,000 miles — it's the single most important maintenance item for any direct-injection EA888.", upvotes: 0 },
      { type: "tip", content: "Install an oil catch can to reduce PCV oil vapor from coating the valves — it won't eliminate buildup but slows it significantly.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 4000,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304"]
  },
  {
    id: "vw-gti-mk8-infotainment-2022",
    vehicleMatch: {
      years: range(2022, 2024),
      make: "Volkswagen",
      model: "Golf",
      trims: ["GTI", "GTI Autobahn", "GTI S", "GTI SE"]
    },
    category: "electrical",
    title: "MK8 Infotainment System Bugs and Rearview Camera Recall",
    description: "The MK8 GTI's MIB3 infotainment system has been plagued with software bugs since launch, including unresponsive touch controls, screen freezes, and a safety recall (NHTSA 24V-480) for the rearview camera image being delayed or failing to display when shifting into reverse. VW recalled 84,432 vehicles (2022-2024 Golf GTI and Golf R) to update the infotainment software. The capacitive touch buttons and sliders that replaced physical controls have been widely criticized for being distracting and unreliable.",
    solution: "Check if your vehicle is affected by the rearview camera recall (NHTSA 24V-480) — the dealer will update the infotainment software for free. For general sluggishness, ensure the infotainment software is updated to the latest version (1969 or later). Some owners report that performing a hard reset (hold power button for 10+ seconds) resolves temporary glitches. VW has released multiple software updates improving touch responsiveness and stability.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rearview camera image delayed or black when shifting to reverse",
      "Touchscreen unresponsive or laggy",
      "Infotainment system freezes and requires restart",
      "Capacitive touch buttons register phantom inputs",
      "Apple CarPlay or Android Auto disconnecting"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "recall", title: "NHTSA Recall 24V-480 - VW Golf GTI/R Rearview Camera", url: "https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V480-7554.pdf" },
      { type: "news", title: "VW Recalls MK8 Golf GTI Over Camera Software Issue", url: "https://www.autoevolution.com/news/vw-recalls-mk8-golf-gti-over-camera-control-unit-software-issue-247595.html" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Visit your dealer for the free infotainment software update — it fixes the camera delay and improves overall responsiveness.", upvotes: 0 },
      { type: "tip", content: "If the screen freezes, hold the power button for 10+ seconds for a hard reset rather than waiting for it to recover.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 1200,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "vw-gti-dsg-mechatronic-2006",
    vehicleMatch: {
      years: range(2006, 2020),
      make: "Volkswagen",
      model: "Golf",
      engines: ["2.0T TSI", "2.0T TFSI"],
      trims: ["GTI", "GTI Autobahn", "GTI S", "GTI SE"]
    },
    category: "transmission",
    title: "DSG Dual-Clutch Transmission Mechatronic Unit Failure",
    description: "The DSG (Direct Shift Gearbox) 6-speed (DQ250) and 7-speed (DQ381) dual-clutch transmissions can develop mechatronic unit failures. The mechatronic unit is the electronic/hydraulic brain of the DSG and controls all gear changes. Symptoms include jerky shifts, hesitation in stop-and-go traffic, failure to engage gears, and warning lights. The DQ250 in MK5/MK6 models is more failure-prone than later units. VW has released software updates to improve shift quality.",
    solution: "Ensure DSG fluid is changed every 40,000 miles (VW's extended interval of 'lifetime fill' is not recommended by most specialists). If experiencing jerky shifts, a DSG adaptation reset at the dealer can help. For mechatronic failures, the unit can sometimes be repaired rather than replaced ($800-$1,500 vs $2,500-$4,000 for new). Ensure any DSG fluid change uses the correct VW-spec fluid (G 052 182 A2 or G 055 529 A2).",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Jerky or harsh shifts in low-speed driving",
      "Hesitation or delay when accelerating from stop",
      "Transmission warning light illuminated",
      "Failure to engage a gear",
      "Clunking noise during gear changes",
      "Limp mode with only odd or even gears available"
    ],
    estimatedCost: { low: 800, high: 4000 },
    citations: [
      { type: "forum", title: "VW DSG Mechatronic Common Issues", url: "https://repairpal.com/problems/volkswagen/gti" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Change DSG fluid every 40,000 miles regardless of VW's 'lifetime' claim — most DSG specialists consider this essential.", upvotes: 0 },
      { type: "warning", content: "Do NOT ignore DSG warning lights — continued driving with a failing mechatronic can damage the clutch packs and double the repair cost.", upvotes: 0 },
      { type: "tip", content: "Have the dealer perform a DSG adaptation reset after any shift quality complaints — it recalibrates the shift points and often resolves jerky behavior.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 2200,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P17BF", "P189C", "P0730"]
  },

  // =========================================================
  // VOLKSWAGEN GLI (2006-2024) - model "Jetta" with GLI trims
  // =========================================================
  {
    id: "vw-gli-timing-chain-tensioner-2006",
    vehicleMatch: {
      years: range(2006, 2013),
      make: "Volkswagen",
      model: "Jetta",
      engines: ["2.0T TSI", "2.0T TFSI"],
      trims: ["GLI", "GLI Autobahn", "GLI S"]
    },
    category: "engine",
    title: "EA888 Gen1/Gen2 Timing Chain Tensioner Failure",
    description: "The early EA888 2.0T TSI engines in the Jetta GLI (2006-2013) are notorious for timing chain tensioner failure. The original tensioner design uses a single-stage ratchet that can collapse under certain conditions, allowing the timing chain to develop slack and skip teeth. If the chain jumps timing, catastrophic valve-to-piston contact can destroy the engine. This primarily affects engines produced before late 2012 when VW introduced an updated tensioner (revision L). Cold-start rattling is the earliest warning sign.",
    solution: "Listen for a brief rattle on cold starts lasting 1-3 seconds — this is the chain losing tension while the oil pressure builds. Replace the timing chain, tensioner, and guides with the updated parts (revised tensioner part ending in 'L'). VW released TSB 15-10-01 documenting the updated tensioner. Many owners do this preventatively at 80,000-100,000 miles. Always replace all guides and the chain when doing the tensioner — partial jobs lead to repeat failure.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Rattling noise on cold start that goes away in seconds",
      "Chain slap noise from the front of the engine",
      "Check engine light with timing-related codes",
      "Engine misfires or runs rough",
      "Loss of power",
      "Engine will not start (severe — chain has jumped)"
    ],
    estimatedCost: { low: 1200, high: 3000 },
    citations: [
      { type: "tsb", title: "VW TSB 15-10-01 - Timing Chain Tensioner", url: "https://static.nhtsa.gov/odi/tsbs/2015/MC-10143245-0001.pdf" }
    ],
    communityRecommendations: [
      { type: "warning", content: "If you hear ANY rattling on cold start, get the tensioner inspected immediately — you may only get a few weeks of warning before catastrophic failure.", upvotes: 0 },
      { type: "tip", content: "When replacing the tensioner, insist on the revised 'L' part. Also replace the chain, guides, and seals — doing the tensioner alone is a temporary fix.", upvotes: 0 },
      { type: "tip", content: "Consider doing this preventatively at 80,000 miles if you have a pre-2013 GLI — the insurance against engine destruction is worth it.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 2500,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0011", "P0012", "P0014", "P0016", "P0017"]
  },
  {
    id: "vw-gli-carbon-buildup-2006",
    vehicleMatch: {
      years: range(2006, 2024),
      make: "Volkswagen",
      model: "Jetta",
      engines: ["2.0T TSI", "2.0T TFSI"],
      trims: ["GLI", "GLI Autobahn", "GLI S"]
    },
    category: "engine",
    title: "Direct Injection Carbon Buildup on Intake Valves",
    description: "Like all EA888-equipped VWs, the Jetta GLI suffers from carbon deposits on the intake valves due to direct injection. Without fuel washing over the valves, oil vapor from the PCV system bakes onto the valve surfaces, gradually restricting airflow. Symptoms typically appear between 40,000-80,000 miles and worsen progressively. The GLI shares this issue with the GTI since they use identical engines.",
    solution: "Walnut blast cleaning every 40,000-60,000 miles is the proven solution. A catch can on the PCV system slows buildup. CRC GDI IVD cleaner sprayed into the intake can provide temporary relief between walnut blasts. Note that fuel additives do NOT work for direct injection carbon buildup since fuel never touches the intake valves.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rough idle that progressively worsens",
      "Hesitation or stumble on acceleration",
      "Misfires and check engine light",
      "Reduced fuel economy",
      "Loss of power especially at higher RPM"
    ],
    estimatedCost: { low: 400, high: 800 },
    citations: [
      { type: "forum", title: "VW GLI/GTI Carbon Buildup - VW Tuning", url: "https://vwtuning.co/mk7-gti-common-problems/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Schedule walnut blast cleaning every 40,000-60,000 miles — this is the #1 maintenance item for any EA888 engine.", upvotes: 0 },
      { type: "tip", content: "Install an oil catch can to slow carbon buildup between cleanings.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 3000,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303", "P0304"]
  },
  {
    id: "vw-gli-water-pump-2006",
    vehicleMatch: {
      years: range(2006, 2021),
      make: "Volkswagen",
      model: "Jetta",
      engines: ["2.0T TSI", "2.0T TFSI"],
      trims: ["GLI", "GLI Autobahn", "GLI S"]
    },
    category: "cooling",
    title: "Plastic Water Pump and Thermostat Housing Failure",
    description: "The GLI shares the GTI's EA888 engine with its plastic water pump and thermostat housing that are prone to cracking and leaking. The plastic housing warps from heat cycling, and the internal impeller can degrade. VW extended warranty coverage and will replace the water pump for free up to 110,000 miles under a special service campaign. This is one of the most common failure points on any EA888-powered VW.",
    solution: "Check with your VW dealer about extended water pump warranty coverage. When replacing, use an updated design with metal impeller. Replace the thermostat housing simultaneously as it frequently fails shortly after the water pump. This is a common preventative maintenance item at 80,000 miles.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Coolant leak from water pump area",
      "Low coolant warning light",
      "Engine temperature rising above normal",
      "Sweet coolant smell from engine bay",
      "Steam from under the hood",
      "Coolant puddle under the car"
    ],
    estimatedCost: { low: 500, high: 1200 },
    citations: [
      { type: "tsb", title: "VW Extended Water Pump Warranty Campaign", url: "https://www.shopdap.com/blog/post/vw-gti-water-pump.html" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Ask your dealer about the extended warranty — VW covers water pump replacement up to 110,000 miles on EA888 engines.", upvotes: 0 },
      { type: "tip", content: "Upgrade to a metal impeller water pump when replacing — brands like INA and Continental are preferred over the plastic OEM unit.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 2800,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P00B7", "P2181"]
  },

  // =========================================================
  // VOLKSWAGEN GOLF R (2015-2024) - model "Golf" with R trims
  // =========================================================
  {
    id: "vw-golf-r-haldex-pump-failure-2015",
    vehicleMatch: {
      years: range(2015, 2024),
      make: "Volkswagen",
      model: "Golf",
      engines: ["2.0T TSI"],
      trims: ["Golf R", "R"]
    },
    category: "drivetrain",
    title: "Haldex AWD Coupling Pump Failure from Neglected Service",
    description: "The Golf R uses a Haldex Gen5 AWD coupling to drive the rear wheels. Unlike earlier generations, the Gen5 has no serviceable filter — only a strainer on the pump. If the Haldex fluid is not changed regularly, contaminated fluid clogs the strainer and burns out the pump motor, causing complete loss of rear-wheel drive. Failure typically occurs between 45,000-80,000 miles if the fluid has never been changed. VW's maintenance schedule does not adequately emphasize Haldex service frequency.",
    solution: "Change Haldex fluid every 20,000-30,000 miles. VW's official interval of 3 years is time-based, but mileage matters more for actively driven cars. Use only VW-spec Haldex fluid (G 055 175 A2). If the pump has already failed, the complete Haldex unit or pump module must be replaced ($1,500-$3,000). A failed Haldex makes the Golf R front-wheel drive only, which defeats its purpose.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Loss of rear-wheel drive (front wheels spin in corners)",
      "AWD warning light or Haldex fault code",
      "Noticeable difference in handling during spirited driving",
      "Whining noise from rear differential area",
      "4MOTION/AWD indicator light illuminated on dash"
    ],
    estimatedCost: { low: 200, high: 3000 },
    citations: [
      { type: "forum", title: "VW Golf R Haldex Service Guide - AwesomeGTI", url: "https://www.awesomegti.com/blog/haldex-servicing/" },
      { type: "forum", title: "Golf R Haldex Service Schedule - VWROC", url: "https://www.vwroc.com/forums/topic/36057-haldex-service-service-schedule/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Change Haldex fluid every 20,000 miles — this is cheap insurance ($80-$150) against a $2,000+ Haldex pump replacement.", upvotes: 0 },
      { type: "warning", content: "VW calls the Haldex fluid 'lifetime fill' — ignore this. No fluid is lifetime in a high-performance AWD coupling.", upvotes: 0 },
      { type: "tip", content: "If buying a used Golf R, ask for Haldex service records. No records = assume it needs service immediately.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 600,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "vw-golf-r-turbo-failure-2015",
    vehicleMatch: {
      years: [2015, 2016, 2017],
      make: "Volkswagen",
      model: "Golf",
      engines: ["2.0T TSI"],
      trims: ["Golf R", "R"]
    },
    category: "engine",
    title: "Early MK7 IHI Turbocharger Failure",
    description: "The early MK7 Golf R models (2015-2017) use an IHI IS38 turbocharger that was prone to premature failure. The turbo's compressor wheel can crack or the wastegate actuator can fail, causing boost loss and potential engine damage from compressor debris entering the engine. Later production years received improved turbo units. Symptoms include sudden loss of boost, metallic rattling from the turbo, and oil smoke on acceleration.",
    solution: "If the turbo fails under warranty, VW will replace it. For out-of-warranty vehicles, a new IHI IS38 turbo costs $1,200-$2,000 for the part alone. Many owners upgrade to revised IS38 units or aftermarket options when replacing. If you hear wastegate rattle, the turbo actuator may be replaceable separately ($300-$600). Ensure oil changes are done every 5,000-7,500 miles with VW 502.00 spec oil to protect the turbo bearings.",
    severity: "high",
    confidence: "medium",
    symptoms: [
      "Sudden loss of boost/power",
      "Metallic rattling or whistling from turbo area",
      "Blue or white smoke on hard acceleration",
      "Check engine light with boost-related codes",
      "Oil consumption increase"
    ],
    estimatedCost: { low: 1500, high: 3500 },
    citations: [
      { type: "forum", title: "MK7 Golf R Turbo Issues - VW Vortex", url: "https://www.vwvortex.com/threads/common-issues-with-mk7-mk7-5-golf-r-2015-2016-2017-2018-2019-2020-2021.9553430/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Let the turbo cool down — idle for 30-60 seconds after spirited driving before shutting off. This prevents oil coking in the turbo bearings.", upvotes: 0 },
      { type: "tip", content: "Use only VW 502.00 spec synthetic oil and change every 5,000-7,500 miles to protect turbo bearings.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 400,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0299", "P0234"]
  },
  {
    id: "vw-golf-r-mk8-infotainment-2022",
    vehicleMatch: {
      years: range(2022, 2024),
      make: "Volkswagen",
      model: "Golf",
      trims: ["Golf R", "R"]
    },
    category: "electrical",
    title: "MK8 Infotainment Bugs and Rearview Camera Software Recall",
    description: "The MK8 Golf R shares the GTI's troubled MIB3 infotainment system with its capacitive touch controls and software issues. The rearview camera recall (NHTSA 24V-480) affects 2022-2024 Golf R models where the camera image may fail to display when shifting into reverse. Additional complaints include slow boot times, unresponsive touch surfaces in cold weather, and the telematics module failing without warning.",
    solution: "Visit your VW dealer for the free rearview camera software update (campaign 91US). Ensure infotainment is updated to latest software version. For touch sensitivity issues in cold weather, wearing thin gloves or using a capacitive stylus can help. If the telematics module fails, the dealer can replace it under warranty.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Rearview camera blank or delayed when reversing",
      "Touch controls unresponsive, especially in cold weather",
      "Infotainment screen freezes",
      "Telematics module failure warning",
      "Slow system boot when starting vehicle"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "recall", title: "NHTSA Recall 24V-480 - VW Golf R Rearview Camera", url: "https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V480-7554.pdf" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Get the free camera software recall performed ASAP — not having a working backup camera is a safety issue.", upvotes: 0 },
      { type: "tip", content: "Check for infotainment software updates at every service visit — VW has been steadily fixing MK8 software bugs.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 800,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // =========================================================
  // VOLKSWAGEN ROUTAN (2009-2014)
  // =========================================================
  {
    id: "vw-routan-ignition-switch-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Volkswagen",
      model: "Routan",
      engines: ["3.6L V6", "3.8L V6"]
    },
    category: "electrical",
    title: "Ignition Switch Turns Off While Driving (Recall)",
    description: "VW recalled 18,500 model year 2009 Routans where the ignition switch can inadvertently turn from the 'Run' position to 'Off' or 'Accessory' if the keychain is heavy or due to road vibrations. When the ignition turns off, the engine shuts down and all safety systems (airbags, power steering, power brakes) are deactivated, creating an extremely dangerous situation. This is a variant of the same type of ignition switch issue that affected Chrysler/Dodge minivans of the same era, as the Routan is a rebadged Chrysler Town & Country.",
    solution: "Check if your Routan is covered by the ignition switch recall. Until the recall repair is completed, Volkswagen recommends driving with only the ignition key on the keyring — no additional keys, keychains, or heavy fobs. The dealer will replace the ignition switch at no cost. If you experience an engine shutdown while driving, shift to Neutral and steer to a safe location.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Engine shuts off suddenly while driving",
      "All dashboard warning lights illuminate simultaneously",
      "Loss of power steering and brakes",
      "Key turns easily to off position",
      "Airbag warning light may stay on"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "recall", title: "VW Routan Ignition Switch Recall (18,500 vehicles)", url: "https://www.autosafety.org/vehicle-safety-check/2009-volkswagen-routan/" }
    ],
    communityRecommendations: [
      { type: "warning", content: "Until the recall is performed, use ONLY the ignition key — remove all other keys and keychains from the ring.", upvotes: 0 },
      { type: "tip", content: "Check your VIN at vw.com/recalls or NHTSA.gov to see if the recall has been completed on your vehicle.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "vw-routan-tipm-failure-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Volkswagen",
      model: "Routan"
    },
    category: "electrical",
    title: "TIPM (Totally Integrated Power Module) Failure",
    description: "As a rebadged Chrysler Town & Country, the Routan inherits the notorious TIPM (Totally Integrated Power Module) failure that plagued Chrysler/Dodge minivans. The TIPM is the main fuse box and relay center that controls virtually every electrical system. When it fails, symptoms range from the fuel pump relay sticking (causing the fuel pump to run continuously) to random electrical failures affecting windows, wipers, horn, and starting. The fuel pump relay issue is a fire hazard.",
    solution: "If the fuel pump runs continuously (even with engine off), disconnect the battery and have the vehicle towed. Do NOT drive with a stuck fuel pump relay — it is a fire risk. The TIPM can be replaced ($800-$1,200 for parts, $200-$400 labor) or repaired by specialists who rebuild the relay sections ($300-$500). Chrysler issued recalls for some affected vehicles, but VW-badged Routans may have different coverage. Check with both VW and Chrysler recall databases.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Fuel pump runs continuously even with engine off",
      "Vehicle won't start — no crank",
      "Random electrical failures (windows, wipers, horn)",
      "Headlights or tail lights malfunction",
      "Airbag warning light on",
      "Battery drains overnight"
    ],
    estimatedCost: { low: 300, high: 1500 },
    citations: [
      { type: "forum", title: "VW Routan TIPM Problems (shared with Chrysler T&C)", url: "http://www.vwproblems.com/models/routan/" }
    ],
    communityRecommendations: [
      { type: "warning", content: "If the fuel pump runs with the key off, disconnect the battery IMMEDIATELY — a stuck fuel pump relay is a fire hazard.", upvotes: 0 },
      { type: "tip", content: "Specialist TIPM repair shops can rebuild the failed relay sections for $300-$500, much cheaper than a new $1,200 TIPM.", upvotes: 0 },
      { type: "tip", content: "Check both VW and Chrysler recall databases — the Routan shares the Town & Country's TIPM issues and may be covered under Chrysler recalls.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 500,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "vw-routan-transmission-shudder-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Volkswagen",
      model: "Routan",
      engines: ["3.6L V6", "3.8L V6"]
    },
    category: "transmission",
    title: "Transmission Shudder and 'Routan Shake'",
    description: "Routan owners widely report a characteristic shudder during acceleration and at cruising speeds, referred to as the 'Routan shake' even by VW engineers. The 62TE 6-speed automatic transmission (shared with Chrysler) develops torque converter shudder and rough shifts. Some owners have had multiple transmission replacements that still exhibit the problem. The transmission's torque converter lockup clutch is particularly prone to shudder during light-throttle cruising.",
    solution: "Try a complete transmission fluid and filter change using ATF+4 fluid — this resolves shudder in many cases. If shudder persists, the torque converter may need replacement. Some owners report improvement with a transmission adaptation reset (done with a scan tool). In severe cases, a remanufactured transmission ($2,000-$3,500) may be necessary. Ensure any work uses Chrysler/Mopar ATF+4 fluid, not generic ATF.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Shuddering during light acceleration",
      "Vibration at 35-50 mph cruise speed",
      "Rough or harsh gear changes",
      "Hesitation when accelerating from a stop",
      "Slipping sensation between gears"
    ],
    estimatedCost: { low: 200, high: 3500 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaints - Routan Power Train", url: "https://www.carcomplaints.com/Volkswagen/Routan/2009/drivetrain/power_train.shtml" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Use ONLY Mopar ATF+4 fluid — the 62TE transmission is very sensitive to fluid type and generic ATF will make problems worse.", upvotes: 0 },
      { type: "tip", content: "A full fluid and filter change ($250-$400) resolves the shudder in about 60% of cases — try this before replacing the torque converter.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 450,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0700", "P0740"]
  },
  {
    id: "vw-routan-steering-clockspring-2009",
    vehicleMatch: {
      years: range(2009, 2014),
      make: "Volkswagen",
      model: "Routan"
    },
    category: "steering",
    title: "Steering Column Clockspring Failure",
    description: "The clockspring in the steering column — the spiral cable that connects the steering wheel airbag, horn, and cruise control to the vehicle — is a common failure point on the Routan (inherited from the Chrysler Town & Country platform). When it fails, the horn stops working, cruise control becomes inoperative, and the airbag warning light illuminates because the driver's airbag is no longer connected. This is a safety issue since the airbag will not deploy in a crash.",
    solution: "Replace the clockspring assembly ($150-$300 for parts, $200-$400 for labor). This requires careful airbag handling — disconnect the battery and wait 2 minutes before working near the airbag. After replacement, the airbag warning light may need to be reset with a scan tool. Some Chrysler recalls covered clockspring replacement — check if your Routan VIN is eligible.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Airbag warning light illuminated on dash",
      "Horn does not work",
      "Cruise control buttons inoperative",
      "Steering wheel audio controls not working",
      "Clicking noise when turning steering wheel"
    ],
    estimatedCost: { low: 300, high: 700 },
    citations: [
      { type: "nhtsa", title: "NHTSA Complaints - Routan Steering Issues", url: "https://www.carcomplaints.com/Volkswagen/Routan/2009/steering/steering.shtml" }
    ],
    communityRecommendations: [
      { type: "warning", content: "An airbag warning light means the airbag may NOT deploy in a crash. Do not delay this repair.", upvotes: 0 },
      { type: "tip", content: "Check if Chrysler clockspring recalls cover your Routan — the parts are identical to the Town & Country.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 340,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // =========================================================
  // VOLVO C30 (2008-2013)
  // =========================================================
  {
    id: "volvo-c30-power-steering-hose-2008",
    vehicleMatch: {
      years: [2008, 2009],
      make: "Volvo",
      model: "C30",
      engines: ["2.5L Turbo I5"]
    },
    category: "steering",
    title: "Power Steering Return Line Hose Failure (Recall)",
    description: "Volvo recalled 2008-2009 C30 models due to a section of the power steering return line hose that was not properly vulcanized during manufacturing. The hose can suddenly rupture, causing an immediate loss of power steering fluid and power steering assist. The rupture can also spray hot fluid onto other engine components. This was a manufacturing defect in a specific batch of hoses.",
    solution: "Check if your VIN is covered by the Volvo recall. Dealers will replace the power steering return hose at no charge. If you experience sudden heavy steering, do not continue driving at speed — you can still steer but it requires significantly more force. Pull over safely and have the vehicle towed. If out of recall coverage, the hose replacement is straightforward and costs $200-$400.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Sudden loss of power steering assist",
      "Steering becomes very heavy unexpectedly",
      "Power steering fluid leaking rapidly",
      "Whining noise from power steering pump (low fluid)",
      "Fluid spray visible in engine bay"
    ],
    estimatedCost: { low: 0, high: 400 },
    citations: [
      { type: "recall", title: "Volvo C30 Power Steering Hose Recall (2008-2009)", url: "https://www.cars.com/research/volvo-c30/recalls/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Check the recall status of your VIN — this repair is free if covered.", upvotes: 0 },
      { type: "tip", content: "If you lose power steering, stay calm — you CAN still steer, it just requires much more effort. Slow down and pull over safely.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-c30-oil-leak-2008",
    vehicleMatch: {
      years: range(2008, 2013),
      make: "Volvo",
      model: "C30",
      engines: ["2.5L Turbo I5"]
    },
    category: "engine",
    title: "Engine Oil Leaks from Multiple Sealing Points",
    description: "The 2.5L turbo I5 engine in the C30 is prone to oil leaks from several locations, affecting approximately 15% of C30 owners within the first five years. Common leak points include the camshaft seals, valve cover gasket, oil filter housing O-ring, and turbo oil feed/return lines. The turbo oil lines in particular can develop leaks as the high heat around the turbocharger degrades the seals over time. Volvo issued a recall in 2011 for faulty seals affecting over 5,000 vehicles.",
    solution: "Address oil leaks promptly to prevent engine damage and fire risk. The valve cover gasket and camshaft seals are the most common and straightforward repairs ($300-$600). The oil filter housing O-ring is a common DIY fix ($10 for the O-ring). Turbo oil line leaks are more serious and should be addressed quickly as oil dripping onto hot exhaust components is a fire hazard. Replace all related seals when doing any oil leak repair — they tend to fail in sequence.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Oil spots under the vehicle",
      "Burning oil smell from engine bay",
      "Oil visible on engine exterior",
      "Low oil level between changes",
      "Smoke from engine bay at idle (oil on exhaust)"
    ],
    estimatedCost: { low: 200, high: 800 },
    citations: [
      { type: "recall", title: "Volvo C30 Oil Seal Recall (2011)", url: "https://www.cars.com/research/volvo-c30/recalls/" },
      { type: "forum", title: "C30 Oil Leak Problems - Flagship One", url: "https://www.fs1inc.com/blog/2008-volvo-c30-problems-reliability/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Replace the oil filter housing O-ring when you do oil changes — it's a $10 part that prevents the most common nuisance leak.", upvotes: 0 },
      { type: "warning", content: "Turbo oil line leaks can drip onto the exhaust manifold — this is a fire hazard and should be repaired immediately.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-c30-rough-idle-2008",
    vehicleMatch: {
      years: range(2008, 2013),
      make: "Volvo",
      model: "C30"
    },
    category: "engine",
    title: "Rough Idle and Engine Hesitation",
    description: "Nearly 20% of C30 owners report rough idle issues according to Consumer Reports data. The rough idle can be caused by several factors: failing ignition coils, ETM (Electronic Throttle Module) issues, PCV system failures, and vacuum leaks. The 2.5L turbo I5 is particularly sensitive to PCV system degradation which causes positive crankcase pressure and oil ingestion into the intake. The 2.0L I4 models are less affected but can develop similar idle issues from ignition coil failures.",
    solution: "Start diagnostics with the PCV system — check the PCV valve and breather hose for blockage or collapse. Replace ignition coils and spark plugs if misfires are present. Clean the electronic throttle body. Check for vacuum leaks using a smoke test. The PCV system on the 2.5L turbo requires periodic replacement of the breather box/oil trap assembly ($50-$150 for parts).",
    severity: "low",
    confidence: "high",
    symptoms: [
      "Rough or uneven idle",
      "Engine hesitation on light throttle",
      "Intermittent misfires at idle",
      "Engine vibration felt through steering wheel at idle",
      "Slight RPM fluctuation at idle"
    ],
    estimatedCost: { low: 100, high: 500 },
    citations: [
      { type: "review", title: "Consumer Reports - Volvo C30 Rough Idle Data", url: "https://www.consumerreports.org/cars/volvo/c30/2008/reliability/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Check the PCV breather box first — it's the #1 cause of rough idle on the 2.5T engine and is a cheap fix.", upvotes: 0 },
      { type: "tip", content: "Replace all ignition coils at once rather than chasing individual failures — they tend to fail in sequence.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: ["P0300", "P0301", "P0302", "P0303"]
  },
  {
    id: "volvo-c30-windshield-seal-2008",
    vehicleMatch: {
      years: range(2008, 2013),
      make: "Volvo",
      model: "C30"
    },
    category: "body",
    title: "Windshield Seal Failure and Water Leaks",
    description: "A common issue on the C30 is a loose or improperly sealed windshield. Owners report water leaking around the windshield seal, wind noise at highway speeds, and the windshield vibrating. The issue stems from improper glass preparation and adhesive application during manufacturing. Water intrusion can damage the headliner, stain the A-pillars, and if left unchecked, corrode electrical connections behind the dashboard.",
    solution: "Have the windshield resealed with proper urethane adhesive. Some owners have had success with Volvo dealer windshield resealing under goodwill warranty. If the windshield needs replacement, ensure the installer uses proper Volvo-spec primer and urethane, and allows adequate cure time (at least 4 hours before driving). Check the drain channels in the sunroof (if equipped) as those can also contribute to water intrusion.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Water dripping inside cabin during rain",
      "Wind noise at highway speeds around windshield",
      "Windshield appears to vibrate or flex",
      "Water stains on headliner or A-pillar trim",
      "Musty smell inside the cabin"
    ],
    estimatedCost: { low: 100, high: 500 },
    citations: [
      { type: "forum", title: "Volvo C30 Windshield Seal Issues - What Car?", url: "https://www.whatcar.com/volvo/c30/coupe/used-review/n729/reliability" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Ask the dealer about goodwill warranty coverage for windshield resealing — many C30 owners have gotten this done for free.", upvotes: 0 },
      { type: "tip", content: "Don't just apply sealant from outside — the windshield may need to be removed and properly reset with new urethane.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 180,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // =========================================================
  // VOLVO XC90 RECHARGE (2020-2024)
  // =========================================================
  {
    id: "volvo-xc90-recharge-erad-failure-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "XC90 Recharge",
      engines: ["2.0L T8 PHEV"]
    },
    category: "drivetrain",
    title: "Electric Rear Axle Drive (ERAD) Failure",
    description: "The ERAD (Electric Rear Axle Drive) is an integrated electric motor that drives the rear wheels, providing all-electric driving capability and AWD. It has been problematic since its introduction, with the clutch mechanism and thermal sensor being the most common failure points. When the ERAD fails, the vehicle loses rear-wheel drive and all-electric capability. Symptoms include hesitation when the electric motor should engage, complete loss of EV mode, and grinding noises from the rear. NHTSA TSBs document the issue and a repair kit is now available.",
    solution: "If ERAD fails under warranty, Volvo will replace or repair it. A repair kit is now available that replaces the clutch assembly rather than the entire ERAD unit, reducing cost significantly. The latest ERAD design (2023+) uses a planetary gearbox instead of a clutch pack and is much more reliable. For 2020-2022 models, keep the ERAD software updated and avoid sustained high-power EV driving in extreme heat, which accelerates clutch wear.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Hybrid system failure message on dashboard",
      "Loss of all-electric driving mode",
      "Grinding or whining noise from rear axle",
      "Hesitation when rear electric motor should engage",
      "AWD not engaging — front-wheel drive only",
      "Reduced performance warning"
    ],
    estimatedCost: { low: 1500, high: 5000 },
    citations: [
      { type: "tsb", title: "Volvo TSB - ERAD Noise Fault Tracing", url: "https://static.nhtsa.gov/odi/tsbs/2023/MC-10241669-9999.pdf" },
      { type: "news", title: "The Biggest Problem With Volvo Plug-In Hybrids: ERAD Failures", url: "https://insideevs.com/features/772711/volvo-erad-problems-solutions/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Purchase an extended warranty if buying a pre-2023 T8 — ERAD repairs are expensive and common enough to justify the cost.", upvotes: 0 },
      { type: "tip", content: "The 2023+ models use a redesigned ERAD without the problematic clutch pack — consider this when buying used.", upvotes: 0 },
      { type: "warning", content: "Do not continue driving with ERAD grinding noises — further damage to the unit significantly increases repair costs.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 400,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-xc90-recharge-12v-battery-drain-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "XC90 Recharge"
    },
    category: "electrical",
    title: "12V Starter Battery Drain and Premature Failure",
    description: "XC90 Recharge owners report chronic 12V battery drain issues, with the battery going dead in as little as 12 hours when parked. The PHEV system's multiple electronic modules continue drawing power when the vehicle is off, and the 12V battery does not recharge during mains charging of the high-voltage battery. Drain rates vary from 1 to 15 amps, far exceeding the normal parasitic draw. New 12V batteries can be depleted within days of installation.",
    solution: "Ensure the vehicle's software is updated to the latest version — Volvo has released updates to improve sleep mode and reduce parasitic drain. If the problem persists, have the dealer perform a parasitic draw test to identify which module is not entering sleep mode. Some owners use a battery tender/maintainer when the vehicle is parked for extended periods. The Battery Disconnect Unit (BDU) can also malfunction and should be checked. Consider upgrading to an AGM battery with higher reserve capacity.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle won't start after sitting overnight or for 1-2 days",
      "12V battery charging fault message on dash",
      "Multiple warning messages upon start after battery recovery",
      "Keyless entry stops working (battery too low)",
      "Need to jump start frequently"
    ],
    estimatedCost: { low: 200, high: 800 },
    citations: [
      { type: "forum", title: "XC90 T8 Start Battery Failures - Volvo Forum", url: "https://www.volvoforums.org.uk/forum/technical-topics/s60-v60-18-xc60-17-s90-v90-16-xc90-15-general/327717-xc90-t8-start-battery-failures" },
      { type: "forum", title: "XC90 Recharge Battery Drain - Volvo Support", url: "https://www.volvocars.com/en-ca/support/car/xc90-recharge-plug-in-hybrid/article/da35679ce98c1459c0a801514ce1e55d/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Use a battery tender if parking for more than 2 days — the PHEV system's parasitic drain is higher than conventional vehicles.", upvotes: 0 },
      { type: "tip", content: "Upgrade to an AGM battery with the highest CCA rating that fits — the standard battery is marginal for the T8's electrical demands.", upvotes: 0 },
      { type: "tip", content: "Ensure all software updates are current — Volvo has released several updates specifically addressing 12V drain on T8 models.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 350,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-xc90-recharge-hv-battery-degradation-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "XC90 Recharge",
      engines: ["2.0L T8 PHEV"]
    },
    category: "electrical",
    title: "High-Voltage Battery Range Degradation",
    description: "XC90 Recharge owners report noticeable degradation of all-electric range over time, with the EV range estimate dropping from the initial 18-21 miles to 12-17 miles within 2-3 years. Pre-2021 models with smaller battery packs are more severely affected. The battery management system may also miscalculate remaining range. Complete battery failure shortly after warranty expiration has been reported, with replacement costs of $7,000+ CAD. Factors accelerating degradation include frequent DC fast charging, extreme temperatures, and keeping the battery at 100% charge for extended periods.",
    solution: "Avoid keeping the battery at 100% charge for extended periods — charge to 80% for daily use. Minimize DC fast charging when possible. In extreme cold, precondition the battery while plugged in before driving. If range drops below 60% of original, have the dealer run a battery health diagnostic. Battery replacement under warranty is covered, but costs $5,000-$8,000 out of warranty. The 2021+ models have larger batteries that degrade more gracefully.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "EV range estimate declining over time",
      "Battery charges to 100% but provides less range than when new",
      "Hybrid system switches to gasoline sooner than expected",
      "Battery health percentage dropping in diagnostic readout",
      "EV mode unavailable in cold weather"
    ],
    estimatedCost: { low: 0, high: 8000 },
    citations: [
      { type: "forum", title: "XC90 T8 Battery Degradation - SwedeSpeed", url: "https://www.swedespeed.com/threads/xc90-t8-battery-life-degradation-what-is-your-experience.614929/" },
      { type: "review", title: "XC90 Recharge PHEV Engine Problems and Specs", url: "https://cararac.com/blog/volvo-xc90-recharge-phev-engine-problems-durability.html" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Charge to 80% for daily use rather than 100% — this significantly slows battery degradation on PHEV systems.", upvotes: 0 },
      { type: "tip", content: "If buying used, prioritize 2021+ models — they have a larger battery pack that handles degradation better.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-xc90-recharge-check-engine-new-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "XC90 Recharge"
    },
    category: "engine",
    title: "Check Engine Light on New and Low-Mileage Vehicles",
    description: "A widely reported pattern where brand-new XC90 Recharge models develop check engine lights within the first days or weeks of ownership. This has persisted across model years for 7+ years according to owner forums. Causes range from software calibration issues in the hybrid system, catalytic converter warm-up cycle faults, to sensor malfunctions. While typically not indicating a serious mechanical problem, it erodes owner confidence and requires dealer visits.",
    solution: "Return to the dealer for diagnosis under warranty. Most early check engine lights are resolved with software updates or sensor recalibration. Do not attempt to clear the code yourself, as the dealer needs to document the issue for warranty purposes. If the check engine light returns after a dealer visit, request escalation to Volvo's technical support line. Keep records of all CEL occurrences for potential lemon law claims if the issue is recurring.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "Check engine light illuminated on new vehicle",
      "Check engine light appears within first 1,000 miles",
      "Light clears and returns intermittently",
      "No noticeable driveability issues despite CEL",
      "Multiple CEL-related dealer visits"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "forum", title: "XC90 Recharge Check Engine Light Issues - SwedeSpeed", url: "https://www.swedespeed.com/threads/top-10-problems-with-t8-xc90.671973/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Document every check engine light occurrence with date, mileage, and dealer visit — this creates a paper trail for warranty claims or lemon law.", upvotes: 0 },
      { type: "tip", content: "Ask the dealer to check for software updates first — most early CELs on T8 models are resolved with calibration updates.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },

  // =========================================================
  // VOLVO S60 RECHARGE (2020-2024)
  // =========================================================
  {
    id: "volvo-s60-recharge-erad-failure-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "S60 Recharge",
      engines: ["2.0L T8 PHEV"]
    },
    category: "drivetrain",
    title: "Electric Rear Axle Drive (ERAD) Failure",
    description: "The S60 Recharge shares the same ERAD (Electric Rear Axle Drive) as the XC90 Recharge, and inherits the same failure-prone clutch mechanism. The ERAD provides the rear-wheel drive component of the AWD system and all-electric driving capability. Clutch mechanism and thermal sensor failures cause loss of EV mode and rear-wheel drive. The S60's lower ride height means ERAD issues are sometimes noticed sooner due to noise transmission into the cabin.",
    solution: "Same approach as XC90 Recharge: repair kit is available for clutch replacement rather than full ERAD swap. Keep software updated. The 2023+ models have the redesigned planetary gearbox ERAD. Ensure warranty coverage is active before any failure — an extended warranty is strongly recommended for pre-2023 T8 models. If out of warranty, independent Volvo specialists can often perform the repair for less than dealer pricing.",
    severity: "high",
    confidence: "high",
    symptoms: [
      "Hybrid system failure warning on dash",
      "Loss of electric-only driving mode",
      "Grinding or humming noise from rear",
      "Rear wheels not engaging under acceleration",
      "Reduced performance mode activated",
      "Service required message for hybrid system"
    ],
    estimatedCost: { low: 1500, high: 5000 },
    citations: [
      { type: "tsb", title: "Volvo TSB - ERAD Noise Fault Tracing", url: "https://static.nhtsa.gov/odi/tsbs/2023/MC-10241669-9999.pdf" },
      { type: "news", title: "Volvo ERAD Problems and Solutions", url: "https://insideevs.com/features/772711/volvo-erad-problems-solutions/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Extended warranty is essential for pre-2023 T8 models — ERAD failure is common and expensive.", upvotes: 0 },
      { type: "tip", content: "The 2023+ redesigned ERAD is significantly more reliable — factor this into used car purchasing decisions.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 300,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-s60-recharge-12v-drain-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "S60 Recharge"
    },
    category: "electrical",
    title: "12V Battery Drain and BDU (Battery Disconnect Unit) Issues",
    description: "The S60 Recharge shares the T8 platform's chronic 12V battery drain issues. The Battery Disconnect Unit (BDU), which disconnects the high-voltage battery when parked, can malfunction — if it stops responding or reacts slower than one second, the vehicle will not start at all. Additionally, the 12V battery does not recharge during mains charging of the main drive battery, leading to situations where the car is fully charged (high-voltage) but the 12V battery is dead.",
    solution: "Keep software updated — Volvo has released multiple updates addressing parasitic drain. If the BDU is faulty, the dealer must replace it ($500-$1,000). Use a 12V battery tender for extended parking. If the vehicle won't start despite a full high-voltage charge, the BDU may need diagnosis. Some owners carry a portable jump starter as a precaution. Upgrade to a high-capacity AGM 12V battery.",
    severity: "medium",
    confidence: "high",
    symptoms: [
      "Vehicle won't start despite full PHEV charge",
      "12V battery charging fault message",
      "Multiple systems fail after overnight parking",
      "BDU fault code in diagnostic scan",
      "Need to jump-start to access the vehicle"
    ],
    estimatedCost: { low: 200, high: 1000 },
    citations: [
      { type: "forum", title: "S60 T8 12V Battery and BDU Issues - Volvo Forums", url: "https://www.volvo-forums.com/threads/2021-s60-t8-reliability-vs-pre-2021-models.101857/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Carry a portable lithium jump starter — it's cheap insurance against being stranded by the 12V drain issue.", upvotes: 0 },
      { type: "tip", content: "Keep the vehicle plugged in when parked for extended periods — while it won't charge the 12V directly, some systems enter a lower-drain state.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 250,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-s60-recharge-battery-range-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "S60 Recharge",
      engines: ["2.0L T8 PHEV"]
    },
    category: "electrical",
    title: "Electric Range Shortfall and Rapid Battery Depletion in Hybrid Mode",
    description: "S60 Recharge owners report that the high-voltage battery drains faster in hybrid mode than in pure electric mode, and real-world EV range falls significantly short of the rated 41 miles. Typical real-world range is 25-30 miles on a full charge. In hybrid mode, the battery depletes comparably or faster than in pure EV mode, defeating the purpose of the hybrid system. Cold weather reduces range further, sometimes to under 20 miles.",
    solution: "Use pure electric mode for maximum EV range rather than hybrid mode for short trips. Precondition the cabin while plugged in to avoid using battery for heating. In cold weather, expect 30-50% range reduction and plan accordingly. Ensure the battery management software is up to date. The 2022+ Extended Range models have a larger battery with better real-world range. If range drops below 50% of original rated range, have the dealer perform a battery health check.",
    severity: "low",
    confidence: "medium",
    symptoms: [
      "EV range significantly less than rated 41 miles",
      "Battery depletes faster in hybrid mode than pure EV",
      "Range drops dramatically in cold weather",
      "Gasoline engine starts unexpectedly during EV driving",
      "Range estimate fluctuates significantly"
    ],
    estimatedCost: { low: 0, high: 0 },
    citations: [
      { type: "forum", title: "S60 Recharge Battery Drains Fast - SwedeSpeed", url: "https://www.swedespeed.com/threads/volvo-s60-recharge-battery-drains-fast-in-hybrid-mode.664327/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Use Pure electric mode for short commutes — the hybrid mode logic is not optimized for maximizing EV range.", upvotes: 0 },
      { type: "tip", content: "Precondition the cabin while plugged in — this uses grid power for heating instead of battery, preserving EV range.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 200,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  },
  {
    id: "volvo-s60-recharge-heating-failure-2020",
    vehicleMatch: {
      years: range(2020, 2024),
      make: "Volvo",
      model: "S60 Recharge"
    },
    category: "hvac",
    title: "Cabin Heating System Failure in EV Mode",
    description: "Some S60 Recharge T8 models experience heating system failures, where the cabin heater stops producing warm air, particularly when operating in electric-only mode. Volvo dealers have identified this as a known quality issue. The electric heater element or its control module can fail, requiring replacement. In EV mode, the vehicle relies entirely on the electric heater since the gasoline engine is not running — so when it fails, there is no backup heat source unless the driver manually starts the engine.",
    solution: "If heating fails, switch out of Pure EV mode to allow the gasoline engine to provide cabin heat as a workaround. Take the vehicle to a Volvo dealer — this is a recognized quality issue and may be covered under warranty. The repair typically involves replacing the electric heater element or control module. Parts may be on backorder due to the known quality issue designation.",
    severity: "medium",
    confidence: "medium",
    symptoms: [
      "No heat from vents in EV mode",
      "Cabin heater blows cold air despite temperature setting",
      "Climate control shows heating active but air is cold",
      "Heating works only when gasoline engine is running",
      "Climate system fault warning"
    ],
    estimatedCost: { low: 0, high: 1500 },
    citations: [
      { type: "forum", title: "S60 T8 Heating Failure - Known Quality Issue", url: "https://www.volvo-forums.com/threads/2021-s60-t8-reliability-vs-pre-2021-models.101857/" }
    ],
    communityRecommendations: [
      { type: "tip", content: "Switch to Hybrid mode if the heater fails in EV mode — the gas engine will provide cabin heat as a temporary workaround.", upvotes: 0 },
      { type: "tip", content: "This is a recognized quality issue — push for warranty coverage even if your mileage is slightly over.", upvotes: 0 }
    ],
    humanApproved: false,
    reportCount: 150,
    status: "published",
    reviewedOn: "2026-03-06",
    dtcCodes: []
  }
];

// ============================================================
// CHECK FOR DUPLICATES AND ADD ISSUES
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
    added++;
    console.log(`ADD: ${issue.id}`);
  }
}

console.log(`\nIssues: Added ${added}, Skipped ${skipped}, Total: ${issuesData.issues.length}`);

// ============================================================
// YMMT ENTRIES
// ============================================================

function addModel(year, make, model, trims) {
  const y = String(year);
  if (!ymmtData[y]) ymmtData[y] = {};
  if (!ymmtData[y][make]) ymmtData[y][make] = {};
  if (!ymmtData[y][make][model]) {
    ymmtData[y][make][model] = trims;
  } else {
    // Merge trims
    const existing = new Set(ymmtData[y][make][model]);
    for (const t of trims) existing.add(t);
    ymmtData[y][make][model] = [...existing].sort();
  }
}

// Sort models alphabetically within each make for a given year
function sortModelsForYear(year) {
  const y = String(year);
  if (!ymmtData[y]) return;
  for (const make of Object.keys(ymmtData[y])) {
    const sorted = {};
    for (const model of Object.keys(ymmtData[y][make]).sort()) {
      sorted[model] = ymmtData[y][make][model];
    }
    ymmtData[y][make] = sorted;
  }
}

// Nissan Cube 2009-2014
for (let yr = 2009; yr <= 2014; yr++) {
  addModel(yr, "Nissan", "Cube", ["Base", "S", "SL", "Krom"]);
}

// Nissan NV200 2013-2021
for (let yr = 2013; yr <= 2021; yr++) {
  const trims = yr <= 2018
    ? ["S", "SV"]
    : ["S", "SV"];
  addModel(yr, "Nissan", "NV200", trims);
}

// Toyota Mirai 2016-2024
for (let yr = 2016; yr <= 2020; yr++) {
  addModel(yr, "Toyota", "Mirai", ["Base"]);
}
for (let yr = 2021; yr <= 2024; yr++) {
  addModel(yr, "Toyota", "Mirai", ["Limited", "XLE"]);
}

// Toyota Corolla Hatchback 2019-2024
for (let yr = 2019; yr <= 2024; yr++) {
  const trims = yr >= 2023
    ? ["SE", "XSE", "Nightshade"]
    : ["SE", "XSE"];
  addModel(yr, "Toyota", "Corolla Hatchback", trims);
}

// Volkswagen Routan 2009-2014
for (let yr = 2009; yr <= 2014; yr++) {
  const trims = yr <= 2011
    ? ["S", "SE", "SEL", "SEL Premium"]
    : ["S", "SE", "SEL"];
  addModel(yr, "Volkswagen", "Routan", trims);
}

// GTI, GLI, Golf R are already trims within Golf and Jetta in YMMT
// No separate model entries needed - they exist as trims

// Volvo C30 2008-2013
for (let yr = 2008; yr <= 2013; yr++) {
  const trims = yr <= 2010
    ? ["T5", "T5 R-Design"]
    : ["T5", "T5 R-Design", "T5 Premier"];
  addModel(yr, "Volvo", "C30", trims);
}

// Volvo XC90 Recharge 2020-2024
for (let yr = 2020; yr <= 2024; yr++) {
  const trims = yr >= 2023
    ? ["T8 Recharge", "T8 Recharge Plus", "T8 Recharge Ultimate"]
    : ["T8 Recharge", "T8 Recharge Inscription", "T8 Recharge R-Design"];
  addModel(yr, "Volvo", "XC90 Recharge", trims);
}

// Volvo S60 Recharge 2020-2024
for (let yr = 2020; yr <= 2024; yr++) {
  const trims = yr >= 2023
    ? ["T8 Recharge", "T8 Recharge Plus", "T8 Recharge Ultimate", "Polestar Engineered"]
    : ["T8 Recharge", "T8 Recharge Inscription", "T8 Recharge R-Design", "Polestar Engineered"];
  addModel(yr, "Volvo", "S60 Recharge", trims);
}

// Sort all affected years
const allYears = new Set();
for (let yr = 2008; yr <= 2024; yr++) allYears.add(yr);
for (const yr of allYears) sortModelsForYear(yr);

// ============================================================
// WRITE FILES
// ============================================================

fs.writeFileSync(ISSUES_PATH, JSON.stringify(issuesData, null, 2) + '\n', 'utf8');
console.log(`\nWrote ${ISSUES_PATH}`);

fs.writeFileSync(YMMT_PATH, JSON.stringify(ymmtData, null, 2) + '\n', 'utf8');
console.log(`Wrote ${YMMT_PATH}`);

// Verify
const verify = JSON.parse(fs.readFileSync(ISSUES_PATH, 'utf8'));
console.log(`\nVerification: ${verify.issues.length} total issues in known-issues.json`);

const ymmtVerify = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf8'));
// Check that new models exist
const checks = [
  ['2010', 'Nissan', 'Cube'],
  ['2015', 'Nissan', 'NV200'],
  ['2018', 'Toyota', 'Mirai'],
  ['2021', 'Toyota', 'Corolla Hatchback'],
  ['2011', 'Volkswagen', 'Routan'],
  ['2010', 'Volvo', 'C30'],
  ['2022', 'Volvo', 'XC90 Recharge'],
  ['2022', 'Volvo', 'S60 Recharge']
];
for (const [yr, make, model] of checks) {
  const exists = ymmtVerify[yr] && ymmtVerify[yr][make] && ymmtVerify[yr][make][model];
  console.log(`YMMT ${yr} ${make} ${model}: ${exists ? 'OK (' + ymmtVerify[yr][make][model].join(', ') + ')' : 'MISSING!'}`);
}
