/**
 * Add 2 issues each to 37 thin Dodge/GMC/Chrysler models (3→5 issues each)
 * Total: 74 new issues
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function yrs(start, end) {
  const a = [];
  for (let y = start; y <= end; y++) a.push(y);
  return a;
}

const issues = [
  // ============================================================
  // DODGE (15 models × 2 = 30 issues)
  // ============================================================

  // Dodge Neon (1995-2005)
  {
    id: 'dodge-neon-head-gasket-1995',
    make: 'Dodge', model: 'Neon', years: yrs(1995, 2005),
    category: 'engine',
    title: 'Head Gasket Failure and Coolant Loss',
    description: 'The 2.0L engines are prone to head gasket failure, causing external coolant leaks, white exhaust smoke, and eventual overheating. The SOHC engines are more commonly affected than the DOHC variant.',
    solution: 'Replace head gasket with multi-layer steel (MLS) upgrade gasket. Have cylinder head checked for warpage and resurfaced if necessary. Replace head bolts (torque-to-yield design, not reusable).',
    severity: 'high', confidence: 'medium',
    symptoms: ['White smoke from exhaust', 'Coolant loss with no visible leak', 'Overheating', 'Milky oil on dipstick'],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: ['P0128', 'P0117'],
    estimatedCostLow: 800, estimatedCostHigh: 1500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-neon-rear-suspension-clunk-1995',
    make: 'Dodge', model: 'Neon', years: yrs(1995, 2005),
    category: 'suspension',
    title: 'Rear Suspension Clunking Over Bumps',
    description: 'Rear trailing arm bushings deteriorate and cause loud clunking noises over bumps. The OE rubber bushings crack and separate, allowing excessive movement in the rear suspension.',
    solution: 'Replace rear trailing arm bushings. Polyurethane aftermarket bushings (Energy Suspension 5.7102) last significantly longer than OE rubber. Alignment required after replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Clunking from rear over bumps', 'Rear end feels loose', 'Uneven rear tire wear', 'Wandering at highway speeds'],
    affectedSystems: ['Suspension', 'Rear Axle'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Nitro (2007-2011)
  {
    id: 'dodge-nitro-window-regulator-2007',
    make: 'Dodge', model: 'Nitro', years: yrs(2007, 2011),
    category: 'electrical',
    title: 'Power Window Regulator Failure',
    description: 'Front power window regulators fail frequently, causing the window to drop into the door or stop working entirely. The plastic guide clips break, and the cable can fray or snap.',
    solution: 'Replace window regulator assembly (Dorman 741-550 front left, 741-551 front right). Complete assembly replacement is recommended over attempting to repair individual clips.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Window drops into door', 'Grinding noise when operating window', 'Window moves slowly or unevenly', 'Window won\'t stay up'],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 350,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-nitro-ball-joint-2007',
    make: 'Dodge', model: 'Nitro', years: yrs(2007, 2011),
    category: 'suspension',
    title: 'Lower Ball Joint Premature Wear',
    description: 'Lower ball joints wear out prematurely, often before 60,000 miles. Worn ball joints cause clunking over bumps and can affect steering precision. Shares platform with Jeep Liberty which has the same known issue.',
    solution: 'Replace lower ball joints (Moog K80767). Press-in style requires a ball joint press tool. Alignment required after replacement. Inspect upper ball joints at the same time.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Clunking noise over bumps', 'Steering wheel shimmy', 'Uneven tire wear', 'Play felt when rocking front wheel'],
    affectedSystems: ['Suspension', 'Steering'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Stealth (1991-1996)
  {
    id: 'dodge-stealth-ecu-capacitor-1991',
    make: 'Dodge', model: 'Stealth', years: yrs(1991, 1996),
    category: 'electrical',
    title: 'ECU Capacitor Failure Causing No-Start',
    description: 'Electrolytic capacitors inside the ECU leak and fail with age, causing intermittent no-start, rough idle, and random stalling. This is a known aging issue on all Mitsubishi 3000GT/Stealth ECUs.',
    solution: 'Remove ECU and re-cap all electrolytic capacitors with modern equivalents. Multiple specialist services offer ECU recap for $100-150. Alternatively, replace the entire ECU (used units have the same problem unless already recapped).',
    severity: 'high', confidence: 'medium',
    symptoms: ['Intermittent no-start', 'Random stalling', 'Erratic idle', 'Check engine light flickers'],
    affectedSystems: ['Electrical', 'Engine Management'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-stealth-transfer-case-1991',
    make: 'Dodge', model: 'Stealth', years: yrs(1991, 1996),
    category: 'drivetrain',
    title: 'AWD Transfer Case Viscous Coupling Failure (RT/TT)',
    description: 'The viscous coupling in the AWD transfer case degrades over time, causing the AWD system to bind on dry pavement or lose rear-wheel drive altogether. Fluid breaks down and the coupling either locks up or slips.',
    solution: 'Replace viscous coupling unit in the transfer case. OE replacement is expensive and rare; rebuilt units from specialists like RRE or Kozmic Motorsports are the best option. Transfer case fluid should be changed every 30,000 miles to extend coupling life.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Binding sensation in tight turns', 'Vibration at low speed turns on dry pavement', 'Loss of rear-wheel traction', 'Clunking from center of vehicle'],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: [],
    estimatedCostLow: 600, estimatedCostHigh: 1800,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Stratus (1995-2006)
  {
    id: 'dodge-stratus-oil-sludge-2001',
    make: 'Dodge', model: 'Stratus', years: yrs(2001, 2006),
    category: 'engine',
    title: '2.7L V6 Oil Sludge Buildup and Engine Failure',
    description: 'The 2.7L V6 is notorious for oil sludge buildup that clogs oil passages, starves the engine of lubrication, and leads to catastrophic engine failure. Short oil change intervals are critical with this engine.',
    solution: 'Use synthetic oil and change every 3,000-4,000 miles maximum. For sludged engines, an engine flush may help if caught early. Severely sludged engines require replacement. The 2.4L I4 does not have this issue.',
    severity: 'critical', confidence: 'medium',
    symptoms: ['Oil pressure warning light', 'Ticking or knocking from engine', 'Oil consumption', 'Engine overheating'],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0520', 'P0524'],
    estimatedCostLow: 200, estimatedCostHigh: 4000,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-stratus-blend-door-2001',
    make: 'Dodge', model: 'Stratus', years: yrs(2001, 2006),
    category: 'interior',
    title: 'HVAC Blend Door Actuator Failure',
    description: 'The blend door actuator fails, causing the climate control to blow only hot or only cold air regardless of temperature setting. A clicking noise from behind the dash is the telltale sign of a failing actuator.',
    solution: 'Replace blend door actuator (Dorman 604-007). Located behind the center of the dash, requires partial dash disassembly. Some owners access it through the glove box opening for easier replacement.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Clicking behind dashboard', 'Heat stuck on or off', 'Temperature doesn\'t change with dial', 'One side blows different temperature'],
    affectedSystems: ['HVAC', 'Interior'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 350,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Avenger (2008-2014)
  {
    id: 'dodge-avenger-alternator-2008',
    make: 'Dodge', model: 'Avenger', years: yrs(2008, 2014),
    category: 'electrical',
    title: 'Premature Alternator Failure',
    description: 'Alternators fail prematurely, often around 60,000-80,000 miles. The 2.4L models are especially prone. Symptoms progress from dim lights to battery drain to complete electrical failure.',
    solution: 'Replace alternator. OE Denso or quality remanufactured unit recommended. Check serpentine belt and tensioner at the same time as a worn belt accelerates alternator bearing wear.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Dim headlights', 'Battery warning light', 'Electrical accessories cutting out', 'Vehicle dies while driving'],
    affectedSystems: ['Electrical', 'Charging'],
    dtcCodes: ['P0620', 'P0621'],
    estimatedCostLow: 300, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-avenger-suspension-noise-2008',
    make: 'Dodge', model: 'Avenger', years: yrs(2008, 2014),
    category: 'suspension',
    title: 'Front Strut Mount and Sway Bar Link Noise',
    description: 'Front strut mounts and sway bar end links wear out causing clunking and rattling over bumps. The strut mount bearings can also cause a creaking noise when turning the steering wheel at low speed.',
    solution: 'Replace front strut mounts (Monroe 904969) and sway bar end links (Moog K750612). Both are common wear items that often need replacement together around 60,000-80,000 miles.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Clunking over bumps', 'Creaking when turning steering wheel', 'Rattling from front end', 'Loose feeling in steering'],
    affectedSystems: ['Suspension', 'Steering'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Ram 1500 (1994-2008)
  {
    id: 'dodge-ram-1500-dashboard-crack-1994',
    make: 'Dodge', model: 'Ram 1500', years: yrs(2002, 2008),
    category: 'interior',
    title: 'Dashboard Cracking from Sun Exposure',
    description: 'The dashboard material cracks extensively from UV exposure and heat cycling, especially in southern climates. Cracks typically start near the defroster vents and spread across the entire dash surface.',
    solution: 'Replace dashboard pad or install a dash cover (DashMat or Coverlay). Full dash pad replacement requires airbag removal and is labor-intensive. Coverlay dash cover (18-207) is a popular bolt-on solution.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Visible cracks on dashboard', 'Cracking near defroster vents', 'Dashboard material flaking', 'Rattling from cracked sections'],
    affectedSystems: ['Interior', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-ram-1500-exhaust-manifold-bolt-1994',
    make: 'Dodge', model: 'Ram 1500', years: yrs(1994, 2008),
    category: 'exhaust',
    title: 'Exhaust Manifold Bolt Breakage (V8 Engines)',
    description: 'Exhaust manifold bolts break due to heat cycling, causing exhaust leaks with a ticking sound on cold start that diminishes as the engine warms up. The 5.7L Hemi and 5.9L Magnum are both affected.',
    solution: 'Extract broken bolts and replace with new grade 8 bolts. If bolt breaks flush, requires drilling and easy-out extraction. Some owners upgrade to stainless steel studs with locking nuts to prevent recurrence.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Ticking noise on cold start', 'Exhaust smell in cabin', 'Ticking diminishes when warm', 'Failed emissions inspection'],
    affectedSystems: ['Exhaust', 'Engine'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Ram 2500 (1994-2008)
  {
    id: 'dodge-ram-2500-steering-shimmy-1994',
    make: 'Dodge', model: 'Ram 2500', years: yrs(1994, 2002),
    category: 'steering',
    title: '"Death Wobble" Front End Shimmy',
    description: 'Violent front end oscillation triggered by hitting a bump at highway speed, commonly called "death wobble." Caused by worn track bar bushing, ball joints, or steering stabilizer working in combination with the solid front axle.',
    solution: 'Replace track bar and track bar bushing first (most common cause). Inspect and replace ball joints, tie rod ends, and steering stabilizer as needed. Many owners add a dual steering stabilizer kit for additional dampening.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Violent steering wheel shaking', 'Front end oscillation at highway speed', 'Triggered by hitting bumps', 'Must slow down to stop shaking'],
    affectedSystems: ['Steering', 'Suspension'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 1200,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-ram-2500-fuel-lift-pump-1998',
    make: 'Dodge', model: 'Ram 2500', years: yrs(1998, 2008),
    category: 'fuel',
    title: 'Cummins Diesel Lift Pump Failure',
    description: 'The factory mechanical lift pump (1998.5-2002) or electric lift pump (2003+) fails, causing the VP44 or CP3 injection pump to run dry and suffer premature wear. The injection pump costs far more than preventive lift pump maintenance.',
    solution: 'Install an aftermarket electric lift pump (FASS Titanium or AirDog) that provides consistent fuel pressure and better filtration. For VP44-equipped trucks (1998.5-2002), this is especially critical as VP44 replacement costs $1,500+.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Hard starting', 'Loss of power under load', 'Engine surging', 'Stalling at idle'],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0216', 'P1688'],
    estimatedCostLow: 400, estimatedCostHigh: 900,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Shadow (1990-1994)
  {
    id: 'dodge-shadow-auto-trans-failure-1990',
    make: 'Dodge', model: 'Shadow', years: yrs(1990, 1994),
    category: 'transmission',
    title: 'A413/A670 Automatic Transmission Failure',
    description: 'The 3-speed automatic transmissions (A413 with 2.2L, A670 with 2.5L) suffer from premature torque converter lockup clutch failure and solenoid pack issues. Harsh shifts and slipping are common after 80,000 miles.',
    solution: 'Rebuild or replace transmission. The A413/A670 are relatively simple and inexpensive to rebuild. Ensure torque converter is replaced or rebuilt during the service. Consider adding an auxiliary transmission cooler.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Harsh or delayed shifts', 'Transmission slipping', 'Shudder during torque converter lockup', 'Transmission overheating'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: [],
    estimatedCostLow: 800, estimatedCostHigh: 1800,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-shadow-head-gasket-1990',
    make: 'Dodge', model: 'Shadow', years: yrs(1990, 1994),
    category: 'engine',
    title: '2.2L/2.5L Head Gasket Failure',
    description: 'The K-series 2.2L and 2.5L engines develop head gasket leaks, especially if the engine has overheated. Coolant can leak externally at the rear of the head or internally causing white exhaust smoke.',
    solution: 'Replace head gasket with updated multi-layer steel (MLS) gasket. Have the cylinder head surfaced and checked for cracks. Replace the thermostat and inspect cooling system hoses while the engine is apart.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Coolant loss', 'White exhaust smoke', 'Overheating', 'Oil contamination'],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 1200,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Ram Van (1994-2003)
  {
    id: 'dodge-ram-van-plenum-gasket-1994',
    make: 'Dodge', model: 'Ram Van', years: yrs(1994, 2003),
    category: 'engine',
    title: 'Plenum Gasket Failure (5.2L/5.9L V8)',
    description: 'The intake manifold plenum gasket deteriorates and allows oil from the crankcase ventilation system to be sucked into the intake, causing oil consumption, rough idle, and lean conditions. Well-known Magnum V8 issue.',
    solution: 'Replace plenum gasket with Hughes Engines plenum gasket repair kit, which includes a phenolic spacer plate that eliminates the problem permanently. The OE gasket design will fail again if used.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Oil consumption increase', 'Rough idle', 'Black smoke from exhaust', 'Lean misfire codes'],
    affectedSystems: ['Engine', 'Intake'],
    dtcCodes: ['P0171', 'P0174'],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-ram-van-rear-ac-leak-1994',
    make: 'Dodge', model: 'Ram Van', years: yrs(1994, 2003),
    category: 'cooling',
    title: 'Rear A/C Line Corrosion and Refrigerant Leak',
    description: 'The rear A/C refrigerant lines running underneath the vehicle corrode and develop leaks, especially in rust-belt states. The lines are exposed to road salt and debris with minimal protection.',
    solution: 'Replace corroded A/C lines. Aftermarket replacement lines are available. Some owners fabricate custom stainless steel lines for permanent repair. Recharge system with R-134a after repair.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Rear A/C blows warm', 'Front A/C still works', 'Visible corrosion on underside lines', 'Oily residue on A/C fittings'],
    affectedSystems: ['HVAC', 'A/C'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Caliber (2007-2012)
  {
    id: 'dodge-caliber-cvt-failure-2007',
    make: 'Dodge', model: 'Caliber', years: yrs(2007, 2012),
    category: 'transmission',
    title: 'CVT Transmission Failure and Overheating',
    description: 'The Jatco CVT (JF011E) used in automatic Calibers is prone to overheating and premature failure. The CVT fluid degrades quickly, and the transmission can fail as early as 60,000 miles if fluid changes are neglected.',
    solution: 'Change CVT fluid every 30,000 miles using only Mopar CVTF+4 fluid. If transmission is slipping, rebuild or replace with remanufactured unit. Adding an external transmission cooler helps prevent heat-related failure.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Transmission shuddering', 'Delayed acceleration response', 'Overheating warning', 'Whining noise from transmission'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0868', 'P2706'],
    estimatedCostLow: 200, estimatedCostHigh: 3500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-caliber-tipm-2007',
    make: 'Dodge', model: 'Caliber', years: yrs(2007, 2012),
    category: 'electrical',
    title: 'TIPM (Totally Integrated Power Module) Failure',
    description: 'The TIPM acts as the central fuse box and relay center, and internal relay failures cause various random electrical issues including fuel pump relay sticking on (draining tank), horn honking randomly, or wipers activating on their own.',
    solution: 'Replace TIPM unit or have a specialty shop repair the failed internal relays. Aftermarket bypass kits are available for the fuel pump relay specifically. New OE TIPM units are expensive ($800-1200).',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Fuel pump runs continuously with key off', 'Horn honks randomly', 'Wipers activate on their own', 'No-start condition'],
    affectedSystems: ['Electrical', 'Body Control'],
    dtcCodes: ['U0140', 'U0141'],
    estimatedCostLow: 200, estimatedCostHigh: 1200,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Hornet (2023-2025)
  {
    id: 'dodge-hornet-infotainment-freeze-2023',
    make: 'Dodge', model: 'Hornet', years: yrs(2023, 2025),
    category: 'electrical',
    title: 'Uconnect 5 Infotainment Screen Freezing and Rebooting',
    description: 'The 10.25-inch Uconnect 5 infotainment system freezes, goes black, or reboots randomly while driving. Affects navigation, backup camera, and climate controls that are integrated into the touchscreen.',
    solution: 'Perform a hard reset by holding the power/volume knob for 10+ seconds. Ensure the system is updated to the latest Uconnect software via USB. Dealer can reflash the head unit if persistent. Some units require hardware replacement under warranty.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Touchscreen goes black', 'System reboots while driving', 'Backup camera unavailable', 'Climate controls unresponsive'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: ['U0184'],
    estimatedCostLow: 0, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-hornet-transmission-hesitation-2023',
    make: 'Dodge', model: 'Hornet', years: yrs(2023, 2025),
    category: 'transmission',
    title: 'DCT Transmission Hesitation from Stop',
    description: 'The 6-speed dual-clutch automatic transmission (shared with Alfa Romeo Tonale) exhibits hesitation and jerky behavior when accelerating from a stop. The clutch engagement logic is overly cautious at low speeds.',
    solution: 'Ensure transmission software is updated to latest calibration at dealer. The TCM (Transmission Control Module) recalibration improves low-speed behavior. Avoid riding the brake during takeoff as it confuses the DCT logic.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Hesitation from stop', 'Jerky low-speed driving', 'Delayed throttle response', 'Lurching in parking lots'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0730'],
    estimatedCostLow: 0, estimatedCostHigh: 300,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Viper (1992-2017)
  {
    id: 'dodge-viper-clutch-slave-1992',
    make: 'Dodge', model: 'Viper', years: yrs(1992, 2002),
    category: 'drivetrain',
    title: 'Hydraulic Clutch Slave Cylinder Failure (Gen I/II)',
    description: 'The internal hydraulic clutch slave cylinder, mounted inside the bellhousing, fails and leaks fluid. Replacement requires transmission removal. The OE design is prone to seal degradation from heat exposure.',
    solution: 'Replace slave cylinder and clutch master cylinder together. Many owners upgrade to the Tick Performance or RSS clutch hydraulic system during clutch replacement to avoid repeat failures.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Clutch pedal goes to floor', 'Difficulty shifting gears', 'Clutch fluid loss', 'Clutch won\'t disengage'],
    affectedSystems: ['Drivetrain', 'Clutch'],
    dtcCodes: [],
    estimatedCostLow: 600, estimatedCostHigh: 1500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-viper-oil-consumption-2003',
    make: 'Dodge', model: 'Viper', years: yrs(2003, 2017),
    category: 'engine',
    title: '8.3L/8.4L V10 Excessive Oil Consumption',
    description: 'The V10 engine can consume 1-2 quarts of oil every 1,000 miles, especially during spirited driving. Oil can accumulate in the catalytic converters and cause them to overheat. Check oil level frequently.',
    solution: 'Monitor oil level at every fuel stop. Use recommended 0W-40 synthetic oil. If consumption exceeds 2 quarts per 1,000 miles, PCV valve replacement and valve stem seal inspection may be needed.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Oil consumption between changes', 'Blue smoke on hard acceleration', 'Low oil level warning', 'Oil smell from exhaust'],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 2000,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Intrepid (1993-2004)
  {
    id: 'dodge-intrepid-oil-sludge-1998',
    make: 'Dodge', model: 'Intrepid', years: yrs(1998, 2004),
    category: 'engine',
    title: '2.7L V6 Oil Sludge and Engine Seizure',
    description: 'The 2.7L DOHC V6 is infamous for developing severe oil sludge that clogs oil passages and destroys the engine. The narrow oil passages and inadequate crankcase ventilation make this engine extremely sludge-prone with conventional oil.',
    solution: 'Switch to full synthetic oil and change every 3,000 miles. If sludge is present, try a series of short-interval oil changes with engine flush additive. Severely sludged engines cannot be saved and require replacement.',
    severity: 'critical', confidence: 'medium',
    symptoms: ['Oil pressure light', 'Engine knocking', 'Oil consumption', 'Sludge visible on oil cap'],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0520', 'P0524'],
    estimatedCostLow: 100, estimatedCostHigh: 4000,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-intrepid-transmission-solenoid-1993',
    make: 'Dodge', model: 'Intrepid', years: yrs(1993, 2004),
    category: 'transmission',
    title: '42LE Transmission Solenoid Pack Failure',
    description: 'The 42LE (A606) automatic transmission solenoid pack develops electrical failures causing harsh shifts, stuck in gear, or limp mode (locked in 2nd gear). The solenoid pack is an all-in-one unit that must be replaced as an assembly.',
    solution: 'Replace the solenoid pack assembly and transmission filter. Flush the transmission fluid. Updated solenoid packs from Mopar address the earlier design weaknesses.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Harsh shifting', 'Stuck in 2nd gear (limp mode)', 'Delayed engagement', 'Check engine light with trans codes'],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0700', 'P0750', 'P0755'],
    estimatedCostLow: 250, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Ram 3500 (1994-2008)
  {
    id: 'dodge-ram-3500-steering-gear-box-1994',
    make: 'Dodge', model: 'Ram 3500', years: yrs(1994, 2008),
    category: 'steering',
    title: 'Steering Gear Box Leak and Play',
    description: 'The power steering gear box develops internal seal leaks and excessive play. The heavy front end weight and solid axle design accelerate wear. Leaking fluid leads to low power steering assist and potential pump damage.',
    solution: 'Replace or rebuild the steering gear box. RedHead Steering Gears offers upgraded units with better seals and tighter tolerances. Always replace the Pitman arm at the same time and check all steering linkage.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Power steering fluid leak', 'Excessive steering play', 'Wandering on highway', 'Groaning noise when turning'],
    affectedSystems: ['Steering', 'Suspension'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 1200,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-ram-3500-front-axle-u-joint-1994',
    make: 'Dodge', model: 'Ram 3500', years: yrs(1994, 2008),
    category: 'drivetrain',
    title: 'Front Axle U-Joint Failure (4WD)',
    description: 'The front axle shaft u-joints wear out under heavy-duty use and 4WD engagement. The Dana 60 front axle u-joints are subjected to severe angles and loads, especially with aftermarket lifts or heavy front-end accessories.',
    solution: 'Replace u-joints with Spicer Life Series (SPL55-4X) for maximum durability. Greaseable u-joints should be greased every 5,000 miles. Inspect axle seals and replace if leaking during u-joint service.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Clicking in 4WD turns', 'Vibration in front driveshaft', 'Grinding noise from front axle', 'Popping when engaging 4WD'],
    affectedSystems: ['Drivetrain', 'Front Axle'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Spirit (1990-1995)
  {
    id: 'dodge-spirit-transmission-mount-1990',
    make: 'Dodge', model: 'Spirit', years: yrs(1990, 1995),
    category: 'drivetrain',
    title: 'Motor Mount and Transmission Mount Failure',
    description: 'Engine and transmission mounts deteriorate rapidly, causing excessive drivetrain movement, vibration at idle, and a clunk when shifting from Park to Drive. The front motor mount (dog bone) is usually the first to fail.',
    solution: 'Replace all motor mounts and the transmission mount as a set. Aftermarket mounts from Anchor or DEA are affordable. Check inner CV boots while accessing the lower mount as they are often torn.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vibration at idle', 'Clunk shifting into Drive', 'Engine rocks excessively', 'Vibration during acceleration'],
    affectedSystems: ['Drivetrain', 'Engine'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-spirit-coolant-leak-1990',
    make: 'Dodge', model: 'Spirit', years: yrs(1990, 1995),
    category: 'cooling',
    title: 'Heater Core and Coolant Hose Leaks',
    description: 'The heater core and rubber coolant hoses deteriorate, causing coolant leaks into the passenger footwell (heater core) or externally (hoses). The heater core replacement requires significant dash disassembly.',
    solution: 'Replace heater core (Spectra 94523) and all coolant hoses as preventive maintenance. Flush the cooling system and use proper Mopar-compatible antifreeze. For heater core access, the dash must be partially removed.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Sweet smell inside cabin', 'Wet passenger floor carpet', 'Foggy windshield', 'Coolant level drops'],
    affectedSystems: ['Cooling', 'HVAC'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // ============================================================
  // GMC (11 models × 2 = 22 issues)
  // ============================================================

  // GMC Sonoma (1991-2004)
  {
    id: 'gmc-sonoma-fuel-pump-1991',
    make: 'GMC', model: 'Sonoma', years: yrs(1996, 2004),
    category: 'fuel',
    title: 'In-Tank Fuel Pump Failure',
    description: 'The in-tank electric fuel pump fails prematurely, especially in vehicles frequently driven on low fuel. The pump relies on being submerged in fuel for cooling, and running low accelerates pump motor wear.',
    solution: 'Replace fuel pump module assembly (Delphi FG0068). Drop the fuel tank for access. Replace the fuel filter (located on the frame rail) at the same time. Keep fuel level above 1/4 tank to extend pump life.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Engine sputters at highway speed', 'Hard starting', 'Whining noise from fuel tank', 'Engine stalls under load'],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0230', 'P0231'],
    estimatedCostLow: 300, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-sonoma-lower-intake-gasket-1996',
    make: 'GMC', model: 'Sonoma', years: yrs(1996, 2004),
    category: 'engine',
    title: 'Lower Intake Manifold Gasket Leak (4.3L V6)',
    description: 'The 4.3L Vortec V6 lower intake manifold gaskets leak coolant externally or internally into the engine oil. The OE plastic/rubber composite gaskets deteriorate from heat cycling and Dex-Cool coolant exposure.',
    solution: 'Replace lower intake manifold gaskets with updated Fel-Pro MS 98014 T gasket set. Clean all mating surfaces thoroughly. Many owners switch from Dex-Cool to universal green coolant during this repair.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Coolant leak at rear of engine', 'Coolant mixing with oil', 'Overheating', 'Low coolant level'],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: ['P0128'],
    estimatedCostLow: 400, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC C/K 1500 (1990-1998)
  {
    id: 'gmc-ck-1500-tbi-fuel-spider-1996',
    make: 'GMC', model: 'C/K 1500', years: yrs(1996, 1998),
    category: 'fuel',
    title: 'Vortec Fuel Injection Spider Assembly Leak',
    description: 'The central port fuel injection (CPFI) "spider" assembly in the 5.0L and 5.7L Vortec engines develops fuel leaks at the poppet nozzle connections. Fuel leaks into the intake manifold, causing rich running and potential fire risk.',
    solution: 'Replace the entire spider assembly with the updated multi-port fuel injection (MPFI) conversion kit from ACDelco (217-3029). The MPFI design eliminates the poppet nozzles and is a permanent fix.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Strong fuel smell', 'Hard starting when hot', 'Rich running condition', 'Fuel puddling in intake manifold'],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0172', 'P0175'],
    estimatedCostLow: 300, estimatedCostHigh: 700,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-ck-1500-brake-line-corrosion-1990',
    make: 'GMC', model: 'C/K 1500', years: yrs(1990, 1998),
    category: 'brakes',
    title: 'Steel Brake Line Corrosion and Failure',
    description: 'Factory steel brake lines corrode from road salt exposure, especially along the frame rails where debris traps moisture. Corroded lines can burst under braking pressure, causing sudden loss of braking on one or both circuits.',
    solution: 'Replace all corroded brake lines. Pre-bent stainless steel or nickel-copper (Cunifer) replacement lines are strongly recommended over standard steel. Bleed entire brake system after line replacement.',
    severity: 'critical', confidence: 'medium',
    symptoms: ['Spongy brake pedal', 'Brake fluid leak on ground', 'Brake warning light', 'Visible rust flaking on brake lines'],
    affectedSystems: ['Brakes', 'Safety'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC C/K 3500 (1990-1998)
  {
    id: 'gmc-ck-3500-rear-axle-seal-1990',
    make: 'GMC', model: 'C/K 3500', years: yrs(1990, 1998),
    category: 'drivetrain',
    title: 'Rear Axle Seal Leak (Full-Floating Axle)',
    description: 'The full-floating rear axle hub seals leak gear oil onto the brake shoes, contaminating them and reducing braking effectiveness. The inner axle seals also leak, allowing oil to reach the brake assemblies.',
    solution: 'Replace axle hub seals and inner axle seals. If brake shoes are oil-contaminated they must be replaced as well. Inspect axle bearings during seal service and repack or replace as needed.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Oil on rear brake drums or wheels', 'Reduced rear braking', 'Oil smell from rear wheels', 'Low rear differential fluid level'],
    affectedSystems: ['Drivetrain', 'Brakes'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-ck-3500-oil-pressure-sender-1990',
    make: 'GMC', model: 'C/K 3500', years: yrs(1990, 1998),
    category: 'engine',
    title: 'Oil Pressure Sender Unit Failure and Leak',
    description: 'The oil pressure sending unit leaks oil from its electrical connection or body, and can give false low oil pressure readings on the gauge. Located behind the distributor on small-block engines, it is exposed to heat.',
    solution: 'Replace oil pressure sending unit (ACDelco D1818A). Use thread sealant on the new unit. Verify oil pressure with a mechanical gauge after replacement to confirm actual oil pressure is within spec.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Oil pressure gauge reads erratically', 'Oil leak from back of engine', 'Low oil pressure warning', 'Oil pressure gauge pegged high or low'],
    affectedSystems: ['Engine', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 30, estimatedCostHigh: 150,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Hummer EV SUV (2024-2025)
  {
    id: 'gmc-hummer-ev-suv-software-glitch-2024',
    make: 'GMC', model: 'Hummer EV SUV', years: yrs(2024, 2025),
    category: 'electrical',
    title: 'Infotainment and Driver Display Software Crashes',
    description: 'The large infotainment screen and digital instrument cluster experience software crashes, black screens, and delayed boot-up. Affects access to vehicle settings, charging information, and ADAS features that depend on the display.',
    solution: 'Perform a system reset by holding both steering wheel buttons for 10 seconds. Ensure Ultifi software is updated to latest version at dealer. Persistent issues may require infotainment module replacement under warranty.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Black screen on startup', 'Infotainment reboots while driving', 'Delayed display boot-up', 'ADAS settings inaccessible'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: ['U0184'],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-hummer-ev-suv-charge-port-2024',
    make: 'GMC', model: 'Hummer EV SUV', years: yrs(2024, 2025),
    category: 'electrical',
    title: 'DC Fast Charging Session Interruption',
    description: 'DC fast charging sessions terminate prematurely or fail to initiate at certain charger networks. Communication errors between the vehicle and charger can prevent charging above 80% or cause sessions to stop repeatedly.',
    solution: 'Ensure vehicle software is updated. Try different CCS charger brands if one consistently fails. Precondition the battery before DC fast charging by using the "Target Charger" feature in navigation. Dealer can update the charge port module firmware.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Charging session stops unexpectedly', 'Unable to initiate DC fast charge', 'Charging speed drops to zero', 'Error message on charger screen'],
    affectedSystems: ['Electrical', 'Charging'],
    dtcCodes: ['P0AA6'],
    estimatedCostLow: 0, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Envoy (2002-2009)
  {
    id: 'gmc-envoy-fan-clutch-2002',
    make: 'GMC', model: 'Envoy', years: yrs(2002, 2009),
    category: 'cooling',
    title: 'Electric Cooling Fan Clutch Failure',
    description: 'The electronically controlled fan clutch fails, causing overheating in traffic or at low speeds. The Envoy uses a clutch-type fan rather than electric fans, and the electronic control module in the clutch is the weak point.',
    solution: 'Replace fan clutch assembly (Hayden 3262). Some owners upgrade to a dual electric fan conversion for more reliable cooling. Ensure coolant system is flushed and thermostat is functioning properly.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Overheating in traffic', 'Temperature gauge climbs at idle', 'Fan runs at full speed constantly', 'A/C performance poor at idle'],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: ['P0480', 'P0495'],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-envoy-instrument-cluster-2002',
    make: 'GMC', model: 'Envoy', years: yrs(2002, 2009),
    category: 'electrical',
    title: 'Instrument Cluster Gauge Failure',
    description: 'Instrument cluster stepper motors fail, causing gauges (speedometer, tachometer, fuel, temperature) to read incorrectly or stick. This is a common GM issue with the X27.168 stepper motors used in this generation of clusters.',
    solution: 'Replace stepper motors in the instrument cluster. DIY kits with replacement X27.168 or X25.168 stepper motors and soldering tools are available for $20-30. Alternatively, send cluster to a rebuild service.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Speedometer reads wrong', 'Gauges stick or bounce', 'Fuel gauge inaccurate', 'All gauges fail simultaneously'],
    affectedSystems: ['Electrical', 'Instrument Cluster'],
    dtcCodes: [],
    estimatedCostLow: 20, estimatedCostHigh: 250,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Savana (1996-2025)
  {
    id: 'gmc-savana-ignition-switch-1996',
    make: 'GMC', model: 'Savana', years: yrs(1996, 2014),
    category: 'electrical',
    title: 'Ignition Switch Electrical Failure',
    description: 'The ignition switch (electrical portion, not the lock cylinder) develops worn contacts, causing intermittent no-start, stalling while driving, or loss of electrical accessories. A well-known issue shared with the Chevy Express.',
    solution: 'Replace the ignition switch assembly (ACDelco D1432D). The switch is located on the steering column behind the dash. This is the electrical switch, not the key cylinder. Relatively straightforward replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Intermittent no-start', 'Stalls while driving', 'Accessories cut out randomly', 'Dashboard lights flicker'],
    affectedSystems: ['Electrical', 'Engine'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 250,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-savana-door-hinge-1996',
    make: 'GMC', model: 'Savana', years: yrs(1996, 2025),
    category: 'body',
    title: 'Rear Cargo Door and Side Door Hinge Wear',
    description: 'The rear cargo doors and sliding side door hinges wear out from the weight of the doors and constant commercial use. Doors sag, become difficult to close, and the weatherstripping no longer seals properly.',
    solution: 'Replace door hinge pins and bushings, or complete hinge assemblies if worn beyond bushing repair. Adjust door striker plates after hinge repair. Lubricate all hinge pivot points with white lithium grease every 6 months.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Doors hard to close', 'Wind noise from door seals', 'Doors sag visibly', 'Water leaks around doors'],
    affectedSystems: ['Body', 'Exterior'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Jimmy (1992-2001)
  {
    id: 'gmc-jimmy-fuel-pressure-regulator-1996',
    make: 'GMC', model: 'Jimmy', years: yrs(1996, 2001),
    category: 'fuel',
    title: 'Fuel Pressure Regulator Diaphragm Leak',
    description: 'The fuel pressure regulator diaphragm ruptures, allowing raw fuel to be drawn into the intake manifold through the vacuum line. Causes rich running, hard hot starts, and fuel smell. Can flood the engine with fuel.',
    solution: 'Replace fuel pressure regulator (ACDelco 217-3071). Check the vacuum line to the regulator - if fuel is present in the line, the diaphragm has failed. Clear fuel from the vacuum line before installing new regulator.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Hard starting when hot', 'Strong fuel smell', 'Black smoke from exhaust', 'Fuel in vacuum line to regulator'],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0172', 'P0175'],
    estimatedCostLow: 80, estimatedCostHigh: 250,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-jimmy-transfer-case-encoder-1998',
    make: 'GMC', model: 'Jimmy', years: yrs(1998, 2001),
    category: 'drivetrain',
    title: 'Transfer Case Encoder Motor Failure (AutoTrac)',
    description: 'The NP136 AutoTrac transfer case encoder motor fails, preventing the system from engaging 4WD or switching between 2WD and 4WD modes. The "Service 4WD" message illuminates on the dash.',
    solution: 'Replace the encoder motor (Dorman 600-102) mounted on the transfer case. Drain and refill the transfer case with Auto-Trak II fluid during the repair. Clear DTCs after replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Service 4WD light', 'Cannot engage 4WD', 'Grinding from transfer case', '4WD indicator light flashing'],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: ['C0327', 'C0387'],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Suburban (1992-1999)
  {
    id: 'gmc-suburban-fuel-pump-1996',
    make: 'GMC', model: 'Suburban', years: yrs(1996, 1999),
    category: 'fuel',
    title: 'Fuel Pump Failure in Large Tank',
    description: 'The in-tank fuel pump works harder due to the Suburban\'s large fuel tank (42 gallons) and fails prematurely. The pump draws more current to push fuel the longer distance to the engine, leading to burnout.',
    solution: 'Replace fuel pump module assembly (Delphi FG0100). The large tank makes this job more involved - support the tank properly during removal. Replace the fuel filter (frame-mounted) at the same time.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Loss of power at highway speed', 'Extended cranking to start', 'Engine cuts out under acceleration', 'Whining from rear of vehicle'],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0230', 'P0231'],
    estimatedCostLow: 350, estimatedCostHigh: 700,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-suburban-rear-hvac-1992',
    make: 'GMC', model: 'Suburban', years: yrs(1992, 1999),
    category: 'interior',
    title: 'Rear HVAC Blower Motor and Heater Core Failure',
    description: 'The rear heating and A/C system suffers from blower motor failure and rear heater core leaks. The rear heater core is located under the rear cargo area and is susceptible to coolant corrosion.',
    solution: 'Replace rear blower motor (VDO PM3542) and/or rear heater core. The rear heater core requires removal of rear cargo panels for access. Flush the cooling system and use proper coolant mix to prevent future corrosion.',
    severity: 'low', confidence: 'medium',
    symptoms: ['No heat or A/C in rear', 'Coolant smell in cargo area', 'Wet carpet in rear', 'Rear blower motor doesn\'t work'],
    affectedSystems: ['HVAC', 'Interior'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Safari (1990-2005)
  {
    id: 'gmc-safari-intake-gasket-1996',
    make: 'GMC', model: 'Safari', years: yrs(1996, 2005),
    category: 'engine',
    title: '4.3L Vortec Intake Manifold Gasket Leak',
    description: 'The 4.3L Vortec V6 lower intake manifold gaskets fail, leaking coolant externally or into the engine oil. The composite gaskets degrade from Dex-Cool coolant exposure and heat cycling, a widespread GM Vortec issue.',
    solution: 'Replace lower intake manifold gaskets with updated Fel-Pro MS 98014 T set. Clean all sealing surfaces thoroughly. Many owners switch to universal green antifreeze during this repair.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Coolant leak at back of engine', 'Milky oil', 'Overheating', 'Low coolant with no visible external leak'],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: ['P0128', 'P0117'],
    estimatedCostLow: 400, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-safari-rear-door-latch-1990',
    make: 'GMC', model: 'Safari', years: yrs(1990, 2005),
    category: 'body',
    title: 'Rear Dutch Door Latch and Hinge Failure',
    description: 'The rear Dutch-style doors (upper glass/lower panel) develop broken latches and worn hinges. The upper glass latch can fail to secure, creating a safety hazard, and the lower door hinges wear causing the door to sag.',
    solution: 'Replace door latch mechanisms and hinge pins/bushings. The upper glass latch is a safety concern and should be repaired immediately. Lubricate all latch mechanisms and hinges regularly with white lithium grease.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Rear door won\'t latch closed', 'Door sags when opened', 'Rattling from rear doors', 'Upper glass pops open while driving'],
    affectedSystems: ['Body', 'Safety'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 350,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC C/K 2500 (1990-1998)
  {
    id: 'gmc-ck-2500-pitman-arm-1990',
    make: 'GMC', model: 'C/K 2500', years: yrs(1990, 1998),
    category: 'steering',
    title: 'Pitman Arm and Idler Arm Wear',
    description: 'The Pitman arm and idler arm ball joints wear out, causing excessive play in the steering and a wandering feel on the highway. The heavy front end of the 2500 accelerates wear on these components.',
    solution: 'Replace the idler arm (Moog K6187T) and Pitman arm together for even steering geometry. A front-end alignment is required after replacement. Inspect tie rod ends and center link at the same time.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Steering wander on highway', 'Loose steering feel', 'Uneven tire wear', 'Play in steering wheel'],
    affectedSystems: ['Steering', 'Suspension'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-ck-2500-abs-sensor-1995',
    make: 'GMC', model: 'C/K 2500', years: yrs(1995, 1998),
    category: 'brakes',
    title: 'ABS Speed Sensor and RWAL Module Failure',
    description: 'The rear-wheel anti-lock brake (RWAL) system speed sensor in the rear differential fails or the RWAL module malfunctions. The ABS warning light illuminates and the system defaults to standard braking without anti-lock.',
    solution: 'Replace the rear differential-mounted speed sensor (ACDelco 19236364). If the RWAL module itself has failed, aftermarket replacements are available. Some owners disconnect the RWAL system entirely if the module is too expensive.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['ABS warning light on', 'Rear wheels lock during hard braking', 'ABS activates at low speed', 'Speedometer fluctuates'],
    affectedSystems: ['Brakes', 'Safety'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Canyon (2004-2025)
  {
    id: 'gmc-canyon-cylinder-deactivation-2015',
    make: 'GMC', model: 'Canyon', years: yrs(2015, 2025),
    category: 'engine',
    title: 'Active Fuel Management (AFM) Lifter Failure (V6)',
    description: 'The 3.6L V6 with Active Fuel Management experiences lifter failure where the AFM lifters collapse, causing misfires and a ticking noise. The collapsing lifter can damage the camshaft lobe if not addressed.',
    solution: 'Replace failed lifters and inspect camshaft for damage. AFM delete kits are available that disable cylinder deactivation and replace all AFM lifters with standard lifters. Requires ECM tune to disable AFM.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Ticking or tapping from engine', 'Misfire on specific cylinders', 'Check engine light', 'Rough idle'],
    affectedSystems: ['Engine', 'Valvetrain'],
    dtcCodes: ['P0300', 'P0301', 'P0304'],
    estimatedCostLow: 800, estimatedCostHigh: 2500,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'gmc-canyon-transmission-shudder-2015',
    make: 'GMC', model: 'Canyon', years: yrs(2015, 2022),
    category: 'transmission',
    title: '8-Speed Automatic Torque Converter Shudder',
    description: 'The 8L45 8-speed automatic transmission develops a shudder during light throttle at 40-60 mph caused by torque converter clutch slip. The transmission fluid breaks down and loses its friction-modifying properties.',
    solution: 'Flush transmission fluid and replace with updated Mobil 1 Synthetic LV ATF HP fluid. GM released a TSB (18-NA-355) for this issue. Severe cases may require torque converter replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Shudder at 40-60 mph', 'Vibration during light acceleration', 'Feels like driving over rumble strips', 'Shudder goes away with more throttle'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0741'],
    estimatedCostLow: 200, estimatedCostHigh: 1500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // ============================================================
  // CHRYSLER (11 models × 2 = 22 issues)
  // ============================================================

  // Chrysler Aspen (2007-2009)
  {
    id: 'chrysler-aspen-hemi-exhaust-tick-2007',
    make: 'Chrysler', model: 'Aspen', years: yrs(2007, 2009),
    category: 'exhaust',
    title: '5.7L Hemi Exhaust Manifold Bolt Breakage',
    description: 'Exhaust manifold bolts break from thermal cycling, causing an exhaust leak that sounds like a ticking noise on cold start. The passenger side is most commonly affected. Ticking diminishes as the manifold expands when warm.',
    solution: 'Extract broken bolts and replace. If bolts break flush, drilling and easy-out extraction is required. Upgrade to stainless steel studs with copper locking nuts. Replace exhaust manifold gaskets during repair.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Ticking on cold start', 'Exhaust smell', 'Tick goes away when warm', 'Visible soot near exhaust manifold'],
    affectedSystems: ['Exhaust', 'Engine'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 700,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-aspen-tipm-2007',
    make: 'Chrysler', model: 'Aspen', years: yrs(2007, 2009),
    category: 'electrical',
    title: 'TIPM (Totally Integrated Power Module) Relay Failure',
    description: 'The TIPM contains internal relays that fail, causing the fuel pump to run continuously (even with key off), the horn to sound randomly, or the vehicle to not start. The fuel pump relay sticking on can drain the gas tank overnight.',
    solution: 'Replace TIPM or have a specialty shop rebuild the failed internal relays. A fuel pump relay bypass kit provides an interim fix for the most dangerous symptom (fuel pump running continuously). New OE TIPM is expensive.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Fuel pump runs with key off', 'Horn sounds randomly', 'Intermittent no-start', 'Power windows operate on their own'],
    affectedSystems: ['Electrical', 'Body Control'],
    dtcCodes: ['U0140'],
    estimatedCostLow: 200, estimatedCostHigh: 1200,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Prowler (1997-2002)
  {
    id: 'chrysler-prowler-transmission-adapt-1999',
    make: 'Chrysler', model: 'Prowler', years: yrs(1999, 2002),
    category: 'transmission',
    title: 'AutoStick Transmission Harsh Shifting',
    description: 'The 4-speed automatic with AutoStick develops harsh and erratic shifts. The transmission adaptive learning software can become confused, and solenoid pack issues cause delayed or harsh gear changes.',
    solution: 'Reset transmission adaptive learning by disconnecting battery for 30 minutes. If shifts remain harsh, replace the solenoid pack and flush transmission fluid. Use only ATF+4 fluid (Mopar spec).',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Harsh shifts', 'Delayed gear engagement', 'Erratic shift points', 'Transmission slams into gear'],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0700', 'P0750'],
    estimatedCostLow: 100, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-prowler-cooling-overheat-1997',
    make: 'Chrysler', model: 'Prowler', years: yrs(1997, 2002),
    category: 'cooling',
    title: 'Overheating in Traffic Due to Limited Airflow',
    description: 'The Prowler\'s custom hot rod styling restricts airflow to the radiator, causing overheating in slow traffic or hot weather. The front-mounted radiator receives limited air through the narrow grille opening and the cooling fans may not provide adequate flow.',
    solution: 'Upgrade electric cooling fans to higher-CFM units. Ensure radiator is clean and not blocked by debris. Some owners add additional auxiliary fans or upgrade to an aluminum radiator for improved cooling capacity.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Temperature gauge rises in traffic', 'Overheating in hot weather', 'A/C performance drops at idle', 'Coolant boilover'],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: ['P0217'],
    estimatedCostLow: 200, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Fifth Avenue (1990-1993)
  {
    id: 'chrysler-fifth-avenue-lean-burn-1990',
    make: 'Chrysler', model: 'Fifth Avenue', years: yrs(1990, 1993),
    category: 'fuel',
    title: 'Throttle Body Injection (TBI) Idle Problems',
    description: 'The single-point throttle body injection system develops idle quality issues from carbon buildup on the throttle blade and idle air control passages. The throttle position sensor also drifts out of calibration with age.',
    solution: 'Clean throttle body and idle air control (IAC) passages with throttle body cleaner. Replace the TPS if voltage is out of spec (0.5V closed, 4.5V wide open). Replace IAC motor if idle remains unstable after cleaning.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Erratic idle', 'Stalling at stops', 'Idle surging', 'Poor throttle response'],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0505'],
    estimatedCostLow: 30, estimatedCostHigh: 200,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-fifth-avenue-power-seat-1990',
    make: 'Chrysler', model: 'Fifth Avenue', years: yrs(1990, 1993),
    category: 'interior',
    title: 'Power Seat Motor and Track Failure',
    description: 'The power front seat adjusters fail due to worn motor gears and corroded seat track mechanisms. The seat may stop moving in one or more directions, or the motor runs but the seat doesn\'t move due to stripped plastic gears.',
    solution: 'Repair or replace power seat motor and gear assembly. Replacement plastic gears are available aftermarket. Clean and lubricate seat tracks with white lithium grease. Check wiring connectors under seat for corrosion.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Seat won\'t adjust', 'Motor runs but seat doesn\'t move', 'Grinding noise from seat', 'Seat stuck in one position'],
    affectedSystems: ['Interior', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 300,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler LeBaron (1990-1995)
  {
    id: 'chrysler-lebaron-convertible-top-1990',
    make: 'Chrysler', model: 'LeBaron', years: yrs(1990, 1995),
    category: 'body',
    title: 'Convertible Top Hydraulic System Failure',
    description: 'The power convertible top hydraulic system leaks fluid and the hydraulic cylinders lose their seal, preventing the top from operating. The hydraulic pump motor can also burn out from running against stuck cylinders.',
    solution: 'Replace leaking hydraulic cylinders and refill system with Dexron III ATF (used as hydraulic fluid). If the pump motor has burned out, replace pump assembly. Inspect hydraulic lines for cracking.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Convertible top won\'t open or close', 'Slow top operation', 'Hydraulic fluid leak', 'Pump motor runs but top doesn\'t move'],
    affectedSystems: ['Body', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-lebaron-head-gasket-1990',
    make: 'Chrysler', model: 'LeBaron', years: yrs(1990, 1995),
    category: 'engine',
    title: '2.5L/3.0L Head Gasket and Overheating Issues',
    description: 'Both the 2.5L Turbo I4 and 3.0L Mitsubishi V6 suffer from head gasket failures, often triggered by the cooling system not being maintained. The 2.5L turbo is especially prone when running high boost.',
    solution: 'Replace head gasket and have head(s) checked for warpage and resurfaced. Replace thermostat and flush cooling system. On turbo models, ensure the turbo oil return line is clear as blocked returns cause overheating.',
    severity: 'high', confidence: 'medium',
    symptoms: ['White exhaust smoke', 'Coolant loss', 'Overheating', 'Oil contamination with coolant'],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: [],
    estimatedCostLow: 600, estimatedCostHigh: 1500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Crossfire (2004-2008)
  {
    id: 'chrysler-crossfire-rear-spring-2004',
    make: 'Chrysler', model: 'Crossfire', years: yrs(2004, 2008),
    category: 'suspension',
    title: 'Rear Coil Spring Breakage',
    description: 'Rear coil springs crack and break, especially in cold climates and on rough roads. The broken spring end can puncture a tire or damage the wheel well. The Crossfire uses Mercedes SLK components that are susceptible to corrosion.',
    solution: 'Replace both rear coil springs as a pair (even if only one has broken). Aftermarket springs from Eibach or Vogtland are available. Inspect for corrosion on remaining springs during routine maintenance.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Clunking from rear', 'Rear of car sits lower on one side', 'Scraping noise over bumps', 'Visible broken spring coil'],
    affectedSystems: ['Suspension', 'Safety'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 700,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-crossfire-sam-module-2004',
    make: 'Chrysler', model: 'Crossfire', years: yrs(2004, 2008),
    category: 'electrical',
    title: 'SAM (Signal Acquisition Module) Water Intrusion',
    description: 'The SAM module (Mercedes-sourced body control module) located in the trunk area suffers from water intrusion causing corrosion of circuits. This triggers random electrical faults including lighting, power window, and central locking failures.',
    solution: 'Remove SAM module, clean circuit board of corrosion, and reseal the module housing. Identify and seal the water intrusion point (often the trunk gasket or rear window seal). Severe corrosion requires SAM replacement and coding.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Random electrical faults', 'Lights malfunction', 'Central locking fails', 'Multiple warning lights on dash'],
    affectedSystems: ['Electrical', 'Body Control'],
    dtcCodes: ['U0155', 'U0164'],
    estimatedCostLow: 100, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Voyager (2020-2024)
  {
    id: 'chrysler-voyager-sliding-door-2020',
    make: 'Chrysler', model: 'Voyager', years: yrs(2020, 2024),
    category: 'electrical',
    title: 'Power Sliding Door Malfunction',
    description: 'The power sliding doors fail to open, close, or reverse direction unexpectedly mid-travel. The door latch sensor, track motor, and wiring harness in the door jamb are common failure points on the budget-oriented Voyager.',
    solution: 'Diagnose the specific failure point: latch mechanism (Dorman 940-100), track motor, or wiring. The flex wire harness in the door jamb breaks from constant flexing. Reset by disconnecting battery for 5 minutes and recalibrating door.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Sliding door won\'t open electrically', 'Door reverses mid-close', 'Door ajar warning when closed', 'Clicking sound from door motor'],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: ['B1A48', 'B1A49'],
    estimatedCostLow: 150, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-voyager-transmission-shudder-2020',
    make: 'Chrysler', model: 'Voyager', years: yrs(2020, 2024),
    category: 'transmission',
    title: '9-Speed Automatic Harsh Shifting and Hesitation',
    description: 'The ZF 9HP 9-speed automatic transmission exhibits harsh shifts, hesitation on downshifts, and occasionally gets confused about which gear to select, especially during light throttle driving.',
    solution: 'Ensure transmission software is updated to the latest calibration (multiple TSBs issued). Perform a transmission adaptive learning reset at the dealer. If persistent, a TCM replacement may be needed under powertrain warranty.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Harsh 1-2 shift', 'Hesitation on acceleration', 'Hunting between gears', 'Jerky low-speed driving'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0730', 'P0700'],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Concorde (1993-2004)
  {
    id: 'chrysler-concorde-oil-sludge-1998',
    make: 'Chrysler', model: 'Concorde', years: yrs(1998, 2004),
    category: 'engine',
    title: '2.7L V6 Oil Sludge and Engine Failure',
    description: 'The 2.7L DOHC V6 is extremely prone to oil sludge formation that clogs internal passages and destroys the engine. This engine requires strict oil change intervals with synthetic oil to survive beyond 100,000 miles.',
    solution: 'Use full synthetic oil exclusively and change every 3,000-4,000 miles. If sludge is detected, perform multiple short-interval oil changes with engine flush. The 3.5L V6 does not have this problem and is far more reliable.',
    severity: 'critical', confidence: 'medium',
    symptoms: ['Oil pressure warning', 'Engine knocking', 'Sludge on oil cap/dipstick', 'Oil consumption'],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0520', 'P0524'],
    estimatedCostLow: 100, estimatedCostHigh: 4000,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-concorde-transmission-solenoid-1998',
    make: 'Chrysler', model: 'Concorde', years: yrs(1998, 2004),
    category: 'transmission',
    title: '42LE Transmission Solenoid Pack and Shift Quality',
    description: 'The 42LE automatic transmission solenoid pack fails, causing harsh shifts, limp mode (stuck in 2nd gear), and delayed engagement. The solenoid pack is a single assembly that must be replaced as a unit.',
    solution: 'Replace solenoid pack assembly and transmission filter. Use only ATF+4 fluid. The updated Mopar solenoid pack addresses earlier design issues. Clear adaptive learning after solenoid replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Stuck in 2nd gear', 'Harsh shifts', 'Delayed Park to Drive engagement', 'Transmission codes'],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0700', 'P0750', 'P0760'],
    estimatedCostLow: 250, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler New Yorker (1990-1996)
  {
    id: 'chrysler-new-yorker-electronic-suspension-1994',
    make: 'Chrysler', model: 'New Yorker', years: yrs(1994, 1996),
    category: 'suspension',
    title: 'Electronic Air Suspension Compressor Failure',
    description: 'The rear electronic air suspension compressor fails, causing the rear of the vehicle to sag. The air springs can also develop leaks where the rubber meets the upper mount. Replacement compressors are expensive and hard to find.',
    solution: 'Replace the air suspension compressor or convert to conventional coil springs using a conversion kit (Arnott C-2227). The coil spring conversion eliminates the maintenance-prone air system entirely and is the most popular long-term fix.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Rear of car sags', 'Compressor runs constantly', 'Rough rear ride', 'Warning light on dash'],
    affectedSystems: ['Suspension', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-new-yorker-power-window-1990',
    make: 'Chrysler', model: 'New Yorker', years: yrs(1990, 1996),
    category: 'electrical',
    title: 'Power Window Motor and Regulator Failure',
    description: 'Power window motors and regulators fail frequently, especially on the driver\'s side which sees the most use. The motor gears strip and the regulator cables can fray, leaving the window stuck down or inoperable.',
    solution: 'Replace window motor and regulator as a complete assembly. Driver\'s side typically fails first. Check the master window switch on the driver\'s door as switch failures can mimic motor problems.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Window won\'t go up or down', 'Slow window operation', 'Grinding noise from door', 'Window drops into door'],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 350,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler LHS (1994-2001)
  {
    id: 'chrysler-lhs-transmission-41te-1994',
    make: 'Chrysler', model: 'LHS', years: yrs(1994, 2001),
    category: 'transmission',
    title: '41TE/42LE Transmission Solenoid and Shift Issues',
    description: 'The automatic transmission develops solenoid pack failures and valve body wear causing harsh shifts, delayed engagement, and limp mode. The transmission control module can also develop cold solder joints causing intermittent issues.',
    solution: 'Replace solenoid pack and filter. Inspect the valve body for wear. If the TCM is suspected, check connections and re-solder cold joints if possible. Use only Mopar ATF+4 fluid.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Harsh 1-2 shift', 'Limp mode (2nd gear only)', 'Delayed engagement from Park', 'Check engine light'],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0700', 'P0750'],
    estimatedCostLow: 250, estimatedCostHigh: 700,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-lhs-intake-manifold-plenum-1999',
    make: 'Chrysler', model: 'LHS', years: yrs(1999, 2001),
    category: 'engine',
    title: '3.5L V6 Intake Manifold Runner Control Failure',
    description: 'The 3.5L V6 intake manifold runner control (IMRC) valve actuator fails, causing a loss of low-end torque and a check engine light. The IMRC system varies intake runner length for optimal power across the RPM range.',
    solution: 'Replace the intake manifold runner control actuator. Some aftermarket solutions include deleting the system and pinning the runners in the open position, though this reduces low-end torque slightly.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Check engine light', 'Reduced low-end power', 'Slight decrease in fuel economy', 'Rattling from intake area'],
    affectedSystems: ['Engine', 'Intake'],
    dtcCodes: ['P1004', 'P2004'],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler 300M (1999-2004)
  {
    id: 'chrysler-300m-oil-sludge-1999',
    make: 'Chrysler', model: '300M', years: yrs(1999, 2004),
    category: 'engine',
    title: '3.5L V6 Oil Consumption and Sludge',
    description: 'The 3.5L V6 develops oil consumption issues and can build up sludge if oil changes are neglected. While not as severe as the 2.7L, the 3.5L still requires consistent oil changes to prevent sludge-related damage to the timing chain and guides.',
    solution: 'Use full synthetic oil and change every 5,000 miles. If oil consumption exceeds 1 quart per 1,000 miles, PCV valve replacement and valve stem seal inspection is recommended. Regular oil analysis can detect early sludge formation.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Oil consumption between changes', 'Slight ticking from engine', 'Oil discolors quickly', 'Sludge on oil fill cap'],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-300m-power-steering-1999',
    make: 'Chrysler', model: '300M', years: yrs(1999, 2004),
    category: 'steering',
    title: 'Power Steering Pump Whine and Leak',
    description: 'The power steering pump develops a whining noise and leaks fluid from the shaft seal or reservoir. The whine is most noticeable at low speed turns and on cold mornings. Low fluid from leaks accelerates pump wear.',
    solution: 'Replace power steering pump and flush the system with fresh ATF+4 (Chrysler uses ATF as power steering fluid). Check all hoses and the rack and pinion for leaks. Use only Mopar-approved fluid.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Whining during turns', 'Power steering fluid leak', 'Harder steering on cold mornings', 'Fluid on driveway under front of car'],
    affectedSystems: ['Steering'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Cirrus (1995-2000)
  {
    id: 'chrysler-cirrus-head-gasket-1995',
    make: 'Chrysler', model: 'Cirrus', years: yrs(1995, 2000),
    category: 'engine',
    title: '2.5L V6 Head Gasket Failure',
    description: 'The Mitsubishi-sourced 2.5L V6 develops head gasket failures that cause coolant to leak externally or mix with engine oil. Overheating from a low coolant condition accelerates the gasket failure.',
    solution: 'Replace head gaskets (both banks on V6). Have both cylinder heads surfaced and checked for cracks. The 2.4L I4 is generally more reliable for this issue. Replace the thermostat and flush cooling system.',
    severity: 'high', confidence: 'medium',
    symptoms: ['White exhaust smoke', 'Coolant and oil mixing', 'Overheating', 'Coolant loss with no visible leak'],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: ['P0128'],
    estimatedCostLow: 800, estimatedCostHigh: 1800,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-cirrus-transmission-failure-1995',
    make: 'Chrysler', model: 'Cirrus', years: yrs(1995, 2000),
    category: 'transmission',
    title: '41TE Automatic Transmission Solenoid Failure',
    description: 'The 41TE (A604) automatic transmission is prone to solenoid pack failure causing erratic shifting, limp mode, and harsh engagement. The 41TE was one of the first fully electronic automatic transmissions and reliability suffered.',
    solution: 'Replace solenoid pack assembly and fluid filter. Use only ATF+4 fluid. The updated solenoid pack from Mopar addresses the original design weaknesses. A full transmission rebuild may be needed if internal damage has occurred.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Harsh shifting', 'Stuck in 2nd gear (limp mode)', 'Delayed engagement', 'Slipping between gears'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0700', 'P0750', 'P0755'],
    estimatedCostLow: 250, estimatedCostHigh: 2000,
    citations: [], communityRecommendations: [], status: 'published'
  },
];

async function main() {
  console.log(`Creating ${issues.length} issues...`);
  let created = 0;
  let skipped = 0;

  for (const issue of issues) {
    try {
      const existing = await prisma.knownIssue.findUnique({ where: { id: issue.id } });
      if (existing) {
        console.log(`  SKIP (exists): ${issue.id}`);
        skipped++;
        continue;
      }
      await prisma.knownIssue.create({ data: issue });
      console.log(`  OK: ${issue.id}`);
      created++;
    } catch (err) {
      console.error(`  FAIL: ${issue.id} - ${err.message}`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);

  // Verify final counts
  console.log('\nFinal counts:');
  const targets = [
    { make: 'Dodge', models: ['Neon','Nitro','Stealth','Stratus','Avenger','Ram 1500','Ram 2500','Shadow','Ram Van','Caliber','Hornet','Viper','Intrepid','Ram 3500','Spirit'] },
    { make: 'GMC', models: ['Sonoma','C/K 1500','C/K 3500','Hummer EV SUV','Envoy','Savana','Jimmy','Suburban','Safari','C/K 2500','Canyon'] },
    { make: 'Chrysler', models: ['Aspen','Prowler','Fifth Avenue','LeBaron','Crossfire','Voyager','Concorde','New Yorker','LHS','300M','Cirrus'] },
  ];
  for (const g of targets) {
    for (const m of g.models) {
      const count = await prisma.knownIssue.count({ where: { make: g.make, model: m } });
      const status = count === 5 ? 'OK' : 'MISMATCH';
      console.log(`  ${g.make} ${m}: ${count} [${status}]`);
    }
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
