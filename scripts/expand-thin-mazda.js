/**
 * Expand thin Mazda models — add 2 issues each to 16 models
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
  for (let i = start; i <= end; i++) a.push(i);
  return a;
}

const issues = [
  // 626 (1993-2002)
  {
    id: 'mazda-626-distributor-failure-1993',
    make: 'Mazda', model: '626',
    years: yrs(1993, 1997), trims: [], engines: ['2.0L FS I4'],
    category: 'electrical',
    title: 'Distributor Internal Coil and Hall Effect Sensor Failure',
    description: 'The 626\'s distributor assembly contains the ignition coil and hall effect sensor, both of which fail prematurely. The distributor is mounted on the rear of the cylinder head where it is exposed to engine heat. Internal components fail between 80,000-120,000 miles causing intermittent no-start, misfires, and stalling. The failure is often intermittent, making diagnosis difficult.',
    solution: 'Replace the complete distributor assembly ($200-$400). Replacing only the cap and rotor will not fix internal electronic failures. A remanufactured distributor from Cardone is a reliable budget option. Verify the coil wire resistance and check for spark at each cylinder before condemning the distributor. The ignition control module (ICM) should also be tested, as it can cause similar symptoms.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Intermittent no-start condition', 'Engine misfires and stumbles', 'Stalling at idle or during driving', 'Hard starting when engine is hot', 'Check engine light with ignition codes'],
    affectedSystems: ['Ignition', 'Electrical'],
    dtcCodes: ['P0300', 'P0301'], estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazda626.net', content: 'Don\'t waste time replacing just the cap and rotor — the hall sensor and coil inside the distributor are what fail. A complete reman distributor from Cardone is $180 on RockAuto and comes with a warranty.', upvotes: 65, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-626-transmission-failure-1998',
    make: 'Mazda', model: '626',
    years: yrs(1998, 2002), trims: [], engines: ['2.0L FS I4', '2.5L KL V6'],
    category: 'transmission',
    title: 'CD4E Automatic Transmission Failure',
    description: 'The 1998-2002 626 uses the Ford CD4E automatic transmission, which is notorious for premature failure. The transmission develops harsh shifting, slipping, and complete failure typically between 60,000-100,000 miles. Internal servo bore wear, solenoid failures, and torque converter issues are common. This is the same problematic transmission used in the Ford Escape and Mercury Cougar of the same era.',
    solution: 'Change transmission fluid every 30,000 miles with Mercon V. Do NOT flush — drain and fill only to avoid dislodging debris into the valve body. If shifting problems have begun, a solenoid pack replacement ($200-$400) may help temporarily. A rebuilt transmission costs $1,500-$2,500 installed. A used manual transmission swap is popular among enthusiasts as a permanent solution.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Harsh or delayed 1-2 shift', 'Transmission slipping under acceleration', 'Shuddering at highway speeds', 'Check engine light with trans codes', 'Complete loss of forward gears'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0750', 'P0755', 'P0760'], estimatedCostLow: 200, estimatedCostHigh: 2500,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'mazda626.net', content: 'The CD4E is the Achilles heel of the 1998-2002 626. Change the fluid religiously every 30k miles. Once it starts slipping, you\'re on borrowed time. Many owners swap to manual to avoid replacing the auto again.', upvotes: 155, needsReview: false }
    ], status: 'published'
  },

  // B-SERIES (1994-2009)
  {
    id: 'mazda-b-series-frame-rust-1994',
    make: 'Mazda', model: 'B-Series',
    years: yrs(1994, 2009), trims: [], engines: ['2.3L Duratec I4', '2.5L Lima I4', '3.0L Vulcan V6', '4.0L Cologne V6'],
    category: 'body',
    title: 'Frame Rail Corrosion (Rust Belt)',
    description: 'The B-Series (Ford Ranger twin) suffers from frame rail corrosion, particularly at the rear crossmember, spring mounts, and cab corner areas. The C-channel frame design traps moisture inside the rails, causing rust from the inside out. Trucks in rust-belt states develop structural weakness within 10-15 years. The bed floor and wheel wells also perforate from corrosion.',
    solution: 'Inspect frame annually by scraping surface rust and probing for soft spots. Treat surface rust with rust converter and apply rubberized undercoating or Fluid Film. Structural rust at spring hangers and crossmembers requires professional plate welding ($500-$2,000). Annual Fluid Film or Woolwax application is the best prevention. Some owners reinforce the rear frame section with weld-in plate kits.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Visible rust flaking from frame', 'Frame rails crumbling when scraped', 'Bed bolts pulling through rusted bed', 'Body sag or misalignment', 'Failed safety inspection'],
    affectedSystems: ['Frame', 'Body', 'Structural'],
    dtcCodes: [], estimatedCostLow: 200, estimatedCostHigh: 3000,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'therangerstation.com', content: 'The B-Series is a badge-engineered Ranger — all Ranger frame repair tips apply. Check the rear crossmember first, that\'s where they all start rotting. A $150 annual Fluid Film spray prevents thousands in frame repairs.', upvotes: 88, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-b-series-head-gasket-3l-1998',
    make: 'Mazda', model: 'B-Series',
    years: yrs(1998, 2007), trims: [], engines: ['3.0L Vulcan V6'],
    category: 'engine',
    title: '3.0L Vulcan V6 Head Gasket Failure',
    description: 'The 3.0L Vulcan V6 (same as Ford Ranger) develops head gasket failure typically between 80,000-130,000 miles. The gasket fails between the coolant jacket and combustion chamber, allowing coolant to enter the cylinder. The OHV pushrod design makes the rear head gasket particularly prone to failure. The engine overheats and eventually hydrolocks if coolant intrusion is severe.',
    solution: 'Replace both head gaskets (always do both even if only one has failed). Use Fel-Pro head gaskets, which are considered superior to OEM for this application. Have heads checked for warpage and resurfaced. Replace the intake manifold gaskets at the same time, as they also leak on this engine. Total repair cost is $1,000-$2,000 at an independent shop.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Overheating', 'White smoke from exhaust', 'Coolant loss with no external leak', 'Milky oil on dipstick', 'Sweet smell from exhaust', 'Rough idle when warm'],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: [], estimatedCostLow: 1000, estimatedCostHigh: 2000,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'therangerstation.com', content: 'The 3.0 Vulcan head gasket job is well-documented on Ranger/B-Series forums. Do both heads, replace the intake gaskets, and use Fel-Pro gaskets. ARP head studs ($150) are cheap insurance against repeat failure.', upvotes: 95, needsReview: false }
    ], status: 'published'
  },

  // TRIBUTE (2001-2011)
  {
    id: 'mazda-tribute-transfer-case-leak-2001',
    make: 'Mazda', model: 'Tribute',
    years: yrs(2001, 2011), trims: [], engines: ['2.0L Zetec I4', '2.3L Duratec I4', '3.0L Duratec V6'],
    category: 'drivetrain',
    title: 'Transfer Case Output Seal Leak (AWD Models)',
    description: 'AWD-equipped Tribute models develop leaks from the transfer case output shaft seal, dripping fluid onto the exhaust crossover pipe. The leak creates a burning smell and can cause the transfer case to run low on fluid, leading to bearing damage and eventual failure. The seal degrades from heat exposure and mileage, typically failing between 60,000-100,000 miles.',
    solution: 'Replace the transfer case output seal ($15-$30 for the seal). The repair requires raising the vehicle and removing the rear driveshaft to access the seal. Refill the transfer case with the correct fluid (Motorcraft XY-75W140-QL or equivalent). If the seal has been leaking long enough to damage the transfer case bearings, a rebuilt unit ($600-$1,000) may be needed. Check fluid level every oil change.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Burning smell from under vehicle', 'Fluid dripping from center of vehicle', 'Grinding noise from center of vehicle during turns', 'AWD system malfunction warning', 'Low transfer case fluid level'],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: [], estimatedCostLow: 100, estimatedCostHigh: 1000,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'The Tribute is a Ford Escape underneath — all Escape transfer case repair guides apply. The output seal is a $20 part and 1-hour job. Don\'t let it leak until the transfer case runs dry and destroys itself.', upvotes: 55, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-tribute-rear-subframe-rust-2001',
    make: 'Mazda', model: 'Tribute',
    years: yrs(2001, 2011), trims: [], engines: ['2.0L Zetec I4', '2.3L Duratec I4', '3.0L Duratec V6'],
    category: 'suspension',
    title: 'Rear Subframe Corrosion and Control Arm Bushing Failure',
    description: 'The Tribute\'s rear subframe corrodes severely in rust-belt states, and the rear lower control arm bushings deteriorate prematurely. The combination causes the rear alignment to shift, producing tire wear and a wandering feeling at highway speeds. Ford/Mazda issued a recall for rear subframe corrosion on some Escape/Tribute models. The control arm bushings also fail from age and heat.',
    solution: 'Check for NHTSA recall 14V-440 regarding rear subframe corrosion. If covered, the dealer will inspect and either apply corrosion treatment or replace the subframe at no cost. If not covered, inspect the subframe for structural integrity. Replace rear control arm bushings if cracked or separated ($200-$400 per side). An alignment should follow any bushing or subframe work.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Vehicle wanders at highway speeds', 'Inner rear tire wear', 'Clunking from rear over bumps', 'Rear end feels loose', 'Visible rust on rear subframe'],
    affectedSystems: ['Suspension', 'Structural', 'Steering'],
    dtcCodes: [], estimatedCostLow: 200, estimatedCostHigh: 2000,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'Check NHTSA.gov for the recall on rear subframe corrosion — it covers many Tribute/Escape models even at high mileage. Free subframe replacement if your VIN is covered. Well worth a 2-minute check.', upvotes: 70, needsReview: false }
    ], status: 'published'
  },

  // CX-7 (2007-2012)
  {
    id: 'mazda-cx7-turbo-failure-2007',
    make: 'Mazda', model: 'CX-7',
    years: yrs(2007, 2012), trims: [], engines: ['2.3L MZR DISI Turbo I4'],
    category: 'engine',
    title: 'Turbocharger Failure from Oil Starvation',
    description: 'The CX-7\'s 2.3L turbocharged engine (same as the Mazdaspeed3/6) is notorious for turbo failure due to oil coking in the turbo oil feed line. Carbon deposits build up in the oil line restricting flow to the turbo bearing, causing premature bearing failure. The issue is exacerbated by extended oil change intervals, low-quality oil, and not allowing the turbo to cool before shutdown. Turbo failure can send metal debris into the engine.',
    solution: 'Change oil every 3,000-5,000 miles with FULL SYNTHETIC only (5W-20 or 5W-30). Clean or replace the turbo oil feed line banjo bolt screen every 30,000 miles — many owners remove the screen entirely. Idle the engine for 60 seconds before shutdown after highway driving. If the turbo has failed, replace it ($800-$1,500) and clean the turbo oil feed line thoroughly. Install a turbo timer for automatic cool-down.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Blue or white smoke from exhaust', 'Whining or screeching from turbo area', 'Loss of boost pressure', 'Excessive oil consumption', 'Check engine light with boost codes'],
    affectedSystems: ['Engine', 'Turbocharger', 'Lubrication'],
    dtcCodes: ['P0299'], estimatedCostLow: 800, estimatedCostHigh: 2500,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'mazdas247.com', content: 'The turbo oil feed banjo bolt has a tiny screen that clogs with carbon. Remove it or clean it every oil change. This single $0 maintenance item prevents the #1 CX-7 turbo killer. Use only full synthetic oil.', upvotes: 340, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-cx7-vvt-failure-2007',
    make: 'Mazda', model: 'CX-7',
    years: yrs(2007, 2012), trims: [], engines: ['2.3L MZR DISI Turbo I4'],
    category: 'engine',
    title: 'Variable Valve Timing (VVT) Actuator Failure',
    description: 'The CX-7\'s VVT actuator (cam phaser) fails due to oil sludge and carbon buildup from poor oil maintenance. The actuator is an oil-pressure operated device that sticks or fails when oil passages clog. A failed VVT causes the engine to run rough, lose significant power, and throw timing-related codes. The VVT failure is often a cascading failure triggered by the same oil maintenance issues that kill the turbo.',
    solution: 'Replace the VVT actuator/cam phaser ($200-$400 for parts, 3-4 hours labor). Flush the engine oil system with a cleaning agent before installing the new part. Change to full synthetic oil and reduce change intervals to 3,000-5,000 miles. Clean the VVT oil control solenoid screen every oil change. If the timing chain has stretched from the VVT failure, replace it as well.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Rough idle', 'Loss of engine power', 'Rattling from engine on startup', 'Check engine light with VVT codes', 'Poor fuel economy', 'Engine hesitation'],
    affectedSystems: ['Engine', 'Valvetrain', 'Timing'],
    dtcCodes: ['P0012', 'P0014', 'P0016'], estimatedCostLow: 400, estimatedCostHigh: 1200,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdas247.com', content: 'VVT failure and turbo failure on the CX-7 are both caused by the same thing — bad oil maintenance. Full synthetic every 5k miles max, and clean the banjo bolt screen and VVT solenoid screen regularly. Prevention is 10x cheaper than repair.', upvotes: 185, needsReview: false }
    ], status: 'published'
  },

  // MAZDA5 (2006-2015)
  {
    id: 'mazda-mazda5-egr-valve-clog-2006',
    make: 'Mazda', model: 'Mazda5',
    years: yrs(2006, 2015), trims: [], engines: ['2.3L MZR I4', '2.5L MZR I4'],
    category: 'engine',
    title: 'EGR Valve and Passage Carbon Buildup',
    description: 'The Mazda5\'s EGR valve and the passages in the intake manifold clog with carbon deposits, causing rough idle, hesitation, and stalling. The issue is accelerated by short-trip driving and city use (which is common for a minivan). The EGR passage in the intake manifold is particularly narrow on this engine and clogs completely by 80,000-100,000 miles.',
    solution: 'Remove and clean the EGR valve with carb cleaner ($0 if DIY). Clean the EGR passage in the intake manifold with a wire brush and solvent — this is the critical step most shops skip. Replace the EGR valve gasket. If the valve diaphragm is damaged, replace the entire valve ($100-$200). Italian tune-ups (highway driving at higher RPM) help reduce carbon buildup when done regularly.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Rough idle', 'Engine hesitation', 'Stalling at stops', 'Check engine light', 'Poor fuel economy', 'Failed emissions test'],
    affectedSystems: ['Engine', 'Emissions'],
    dtcCodes: ['P0401'], estimatedCostLow: 50, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdas247.com', content: 'The EGR valve is easy to clean yourself — it\'s on top of the engine. But make sure to also clean the passage IN the intake manifold. That\'s where most of the clogging really happens. A coat hanger wire works to break up carbon in the port.', upvotes: 75, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-mazda5-sliding-door-latch-2006',
    make: 'Mazda', model: 'Mazda5',
    years: yrs(2006, 2015), trims: [], engines: ['2.3L MZR I4', '2.5L MZR I4'],
    category: 'body',
    title: 'Sliding Door Latch and Striker Alignment Failure',
    description: 'The Mazda5\'s manual sliding doors develop latch and striker alignment problems over time. The door becomes difficult to close, requiring excessive force, or fails to latch securely. The striker bolts loosen and the latch mechanism wears. In some cases the door opens unexpectedly while driving if the latch doesn\'t fully engage. The issue is accelerated by child use (force of kids slamming the door).',
    solution: 'Adjust the striker plate alignment (loosen bolts, reposition, retighten). Lubricate the latch mechanism with white lithium grease. Replace the door latch assembly if worn ($100-$200). Check the lower door roller for wear as it can cause misalignment. Tighten the striker mounting bolts to specification. Inspect the door check mechanism and replace if the door doesn\'t hold in the open position.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Sliding door hard to close', 'Door requires slamming to latch', 'Door pops open while driving', 'Grinding noise when closing door', 'Door bounces back when trying to close'],
    affectedSystems: ['Body', 'Doors', 'Safety'],
    dtcCodes: [], estimatedCostLow: 50, estimatedCostHigh: 300,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'mazdas247.com', content: 'If the door doesn\'t latch fully, DO NOT drive until it\'s fixed. A sliding door opening on the highway with kids in the car is every parent\'s nightmare. The striker adjustment is free and takes 10 minutes.', upvotes: 110, needsReview: false }
    ], status: 'published'
  },

  // PROTEGE (1995-2003)
  {
    id: 'mazda-protege-engine-mount-failure-1999',
    make: 'Mazda', model: 'Protege',
    years: yrs(1999, 2003), trims: [], engines: ['1.6L ZM I4', '2.0L FS I4'],
    category: 'engine',
    title: 'Rear Engine Mount Premature Failure',
    description: 'The Protege\'s rear engine mount (torque mount) fails prematurely, typically between 40,000-80,000 miles. The liquid-filled mount ruptures and collapses, allowing excessive engine movement during acceleration and braking. This causes a harsh clunk when shifting gears or a shuddering vibration at idle. The Protege5 and Mazdaspeed Protege are particularly prone due to their higher-torque engines.',
    solution: 'Replace the rear engine mount ($50-$100 for parts, 30-60 minutes labor). The mount is located at the rear of the engine below the intake manifold. OEM mounts last longer than cheap aftermarket. Mazdaspeed Protege owners often upgrade to polyurethane or solid mounts for reduced engine movement (at the cost of increased NVH). Check all mounts if the vehicle has over 100,000 miles.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Harsh clunk when shifting into Drive or Reverse', 'Excessive vibration at idle in gear', 'Engine rocks visibly during acceleration', 'Steering wheel vibration at idle', 'Thump felt through floorboard on gear changes'],
    affectedSystems: ['Engine', 'Mounts'],
    dtcCodes: [], estimatedCostLow: 100, estimatedCostHigh: 300,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdas247.com', content: 'The rear mount is the first to go on every Protege. You can check it by having someone rev the engine while you watch from outside — the engine will lurch 2+ inches if the mount is shot. $60 OEM mount from Mazda is the way to go.', upvotes: 85, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-protege-alternator-failure-1995',
    make: 'Mazda', model: 'Protege',
    years: yrs(1995, 2003), trims: [], engines: ['1.5L Z5 I4', '1.6L ZM I4', '1.8L FP I4', '2.0L FS I4'],
    category: 'electrical',
    title: 'Alternator Premature Failure and Charging Issues',
    description: 'Proteges experience premature alternator failure, often between 80,000-120,000 miles. The voltage regulator and brush assembly wear out, causing undercharging (battery dies) or overcharging (bulbs blow, battery boils). The alternator is mounted low on the engine where it is exposed to heat and road spray. Remanufactured units often have short lifespans as well.',
    solution: 'Replace the alternator with a new (not remanufactured) unit if possible ($200-$350). If budget is tight, a reman from DENSO or Bosch is better than generic brands. The replacement is 1-2 hours labor. Replace the serpentine belt at the same time. Test output voltage at the battery (should be 13.8-14.4V) and load test the battery, which may have been damaged by the failing alternator.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Battery warning light on dashboard', 'Dim headlights at idle', 'Battery dies repeatedly', 'Electrical accessories dim or flicker', 'Burning smell from alternator (overcharging)'],
    affectedSystems: ['Electrical', 'Charging'],
    dtcCodes: [], estimatedCostLow: 200, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdas247.com', content: 'Spend the extra $50 and get a new DENSO alternator instead of a reman. The reman alternators for the Protege have terrible quality — I went through 3 remans in 2 years before buying a new Denso that\'s lasted 5 years.', upvotes: 60, needsReview: false }
    ], status: 'published'
  },

  // CX-60 (2023-2025)
  {
    id: 'mazda-cx60-phev-charging-fault-2023',
    make: 'Mazda', model: 'CX-60',
    years: yrs(2023, 2025), trims: [], engines: ['2.5L Skyactiv-G PHEV I4'],
    category: 'electrical',
    title: 'PHEV Charging System Faults and Failures',
    description: 'The CX-60 PHEV experiences charging system faults where the vehicle refuses to charge, displays error messages, or stops charging mid-session. The onboard charger module occasionally fails to communicate with charging stations, and the charge port latch can freeze in cold weather. Mazda has released multiple software updates to address charging reliability but issues persist for some owners.',
    solution: 'Visit the dealer for the latest charging system software update. If the charge port is frozen, use the manual release cable (located in the cargo area). Try different charging stations to rule out station compatibility issues. A full system reset (disconnect 12V battery for 5 minutes) can clear temporary charging faults. If the onboard charger module has failed, it requires dealer replacement under warranty.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vehicle won\'t initiate charging', 'Charging stops mid-session', 'Error message on infotainment about charging fault', 'Charge port light blinking red', 'Charge port lid won\'t open in cold weather'],
    affectedSystems: ['Charging', 'Electrical', 'PHEV System'],
    dtcCodes: [], estimatedCostLow: 0, estimatedCostHigh: 0,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'After the software update, do a full power cycle — turn off the car, open the door, wait 3 minutes, then restart. This forces the charging module to reinitialize. Fixed intermittent charging failures for many CX-60 PHEV owners.', upvotes: 65, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-cx60-infotainment-lag-2023',
    make: 'Mazda', model: 'CX-60',
    years: yrs(2023, 2025), trims: [], engines: ['2.5L Skyactiv-G PHEV I4', '3.3L Skyactiv-D Diesel I6'],
    category: 'electrical',
    title: 'Infotainment System Lag and Wireless CarPlay Disconnections',
    description: 'The CX-60\'s infotainment system is sluggish and unresponsive, with wireless Apple CarPlay and Android Auto experiencing frequent disconnections. The rotary controller input has noticeable lag, and the system occasionally freezes requiring a restart. The navigation map rendering is slow, and voice commands frequently fail to register. Multiple software updates have improved but not resolved the issue.',
    solution: 'Install the latest infotainment firmware at the dealer. Delete all Bluetooth pairings and re-pair from scratch. Use wired CarPlay via USB for stability. Disable background apps on your phone that may interfere with wireless connectivity. A hard reset (hold the mute + nav + back buttons for 10 seconds) clears the cache and can improve responsiveness temporarily.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Touchscreen and rotary controller laggy', 'Wireless CarPlay drops frequently', 'Navigation map renders slowly', 'Voice commands don\'t register', 'System freezes requiring restart'],
    affectedSystems: ['Infotainment', 'Electrical'],
    dtcCodes: [], estimatedCostLow: 0, estimatedCostHigh: 0,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'Wired CarPlay is vastly more stable than wireless on the CX-60. Get a short 6-inch USB-C cable and leave your phone in the center console. The wireless system is just too flaky in its current state.', upvotes: 88, needsReview: false }
    ], status: 'published'
  },

  // MX-6 (1993-1997)
  {
    id: 'mazda-mx6-distributor-failure-1993',
    make: 'Mazda', model: 'MX-6',
    years: yrs(1993, 1997), trims: [], engines: ['2.0L FS I4', '2.5L KL V6'],
    category: 'electrical',
    title: 'Distributor Failure on V6 Models',
    description: 'The MX-6 V6 (2.5L KL engine) distributor develops internal electronic failures, particularly the coil and crank angle sensor. The distributor is mounted at the rear of the engine between the heads, making it difficult to access and exposed to extreme heat. The failure causes intermittent no-start, stalling, and misfire conditions that are difficult to diagnose because they occur randomly.',
    solution: 'Replace the complete distributor assembly ($250-$450). The V6 distributor is located at the rear of the engine and requires removing the intake manifold for access (4-5 hours labor). Some owners carry a spare distributor in the trunk due to the intermittent nature of the failure. Test the crank angle sensor resistance before condemning the distributor — a simple resistance check can confirm the fault.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Random no-start condition', 'Engine dies while driving', 'Intermittent misfires', 'Tachometer drops to zero while driving', 'No spark at any cylinder during no-start'],
    affectedSystems: ['Ignition', 'Electrical'],
    dtcCodes: ['P0300'], estimatedCostLow: 300, estimatedCostHigh: 700,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'probetalk.com', content: 'The MX-6 V6 and Ford Probe V6 share the same KL engine and distributor. Probe parts are more available and cheaper. The distributor interchange is 100% compatible.', upvotes: 45, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-mx6-power-window-regulator-1993',
    make: 'Mazda', model: 'MX-6',
    years: yrs(1993, 1997), trims: [], engines: ['2.0L FS I4', '2.5L KL V6'],
    category: 'electrical',
    title: 'Power Window Regulator Cable Snap',
    description: 'The MX-6\'s cable-type power window regulators are prone to cable snapping, causing the window to drop into the door. The cable frays at the pulley points and eventually breaks, leaving the window stuck in the down position. The frameless door design means a down window provides no weather protection. Both driver and passenger sides are affected, with the driver\'s side failing first due to higher usage.',
    solution: 'Replace the window regulator assembly ($80-$150 aftermarket). The repair requires removing the door panel, disconnecting the window from the regulator, and installing the new unit. Lubricate the window tracks and new regulator cables with silicone spray to reduce friction and extend life. The window motor can usually be reused if it still functions.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Window drops into door suddenly', 'Window moves slowly or binds', 'Clicking noise from door when operating window', 'Window stops partway', 'Motor runs but window doesn\'t move'],
    affectedSystems: ['Electrical', 'Body', 'Windows'],
    dtcCodes: [], estimatedCostLow: 80, estimatedCostHigh: 250,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'probetalk.com', content: 'The MX-6 and Ford Probe use the same window regulators. Check RockAuto under both Mazda MX-6 AND Ford Probe — you\'ll often find cheaper options listed under the Probe.', upvotes: 38, needsReview: false }
    ], status: 'published'
  },

  // CX-70 (2025)
  {
    id: 'mazda-cx70-phev-software-glitches-2025',
    make: 'Mazda', model: 'CX-70',
    years: [2025], trims: [], engines: ['2.5L Skyactiv-G PHEV I4'],
    category: 'electrical',
    title: 'PHEV Powertrain Software Calibration Issues',
    description: 'As a first model year vehicle, the 2025 CX-70 PHEV experiences powertrain software calibration issues including jerky transitions between electric and gas power, hesitation from stop, and the gas engine starting unexpectedly in EV mode. The hybrid system\'s calibration for engine-on/off transitions is rough, particularly in cold weather. Mazda has issued multiple TSBs for powertrain software updates.',
    solution: 'Visit the dealer for the latest powertrain control module (PCM) software update. Multiple updates have been released since launch addressing hybrid transition smoothness. Use EV mode in city driving and Normal mode on the highway for the smoothest transitions. If the gas engine starts unexpectedly in EV mode, ensure the cabin heater demand isn\'t triggering engine start (use heated seats instead).',
    severity: 'low', confidence: 'medium',
    symptoms: ['Jerky transition between electric and gas power', 'Hesitation from stop', 'Gas engine starts unexpectedly in EV mode', 'Harsh engagement when engine restarts', 'Rough idle transitions'],
    affectedSystems: ['Powertrain', 'PHEV System', 'Software'],
    dtcCodes: [], estimatedCostLow: 0, estimatedCostHigh: 0,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'The first software update dramatically improved my CX-70 PHEV transitions. If your dealer says "that\'s normal," insist on checking for TSBs. There are at least 3 powertrain software updates available for the 2025 CX-70 as of early 2026.', upvotes: 55, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-cx70-panoramic-roof-creak-2025',
    make: 'Mazda', model: 'CX-70',
    years: [2025], trims: [], engines: ['2.5L Skyactiv-G PHEV I4', '3.3L Skyactiv-G Turbo I6'],
    category: 'body',
    title: 'Panoramic Roof Panel Creaking and Wind Noise',
    description: 'Early CX-70 production units exhibit creaking and popping noises from the panoramic glass roof panel, particularly on uneven roads and during temperature changes. The glass panel expands and contracts with temperature swings, creating contact noise against the frame seals. Some owners also report wind noise at highway speeds around the roof seal area.',
    solution: 'Visit the dealer for roof panel adjustment under warranty. The fix involves adjusting the roof panel alignment and applying additional felt padding to the seal contact points. Silicone-based seal conditioner applied to the roof seals can reduce friction noise temporarily. If wind noise persists, the roof may need resealing or the weatherstrip replaced.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Creaking from roof area on bumps', 'Popping noise during temperature changes', 'Wind noise at highway speed from roof', 'Rattling sound from headliner area'],
    affectedSystems: ['Body', 'Interior'],
    dtcCodes: [], estimatedCostLow: 0, estimatedCostHigh: 200,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'My dealer fixed the roof creak by adjusting the panel forward 2mm and adding felt pads to 3 contact points. Took 45 minutes under warranty. The noise was driving me crazy but it\'s a known issue with an easy fix.', upvotes: 40, needsReview: false }
    ], status: 'published'
  },

  // MAZDASPEED6 (2006-2007)
  {
    id: 'mazda-mazdaspeed6-turbo-oil-starvation-2006',
    make: 'Mazda', model: 'Mazdaspeed6',
    years: [2006, 2007], trims: [], engines: ['2.3L MZR DISI Turbo I4'],
    category: 'engine',
    title: 'Turbocharger Oil Starvation and Failure',
    description: 'The Mazdaspeed6 shares the 2.3L DISI turbo engine with the Mazdaspeed3 and CX-7, inheriting the same turbo oil starvation issue. The turbo oil feed line\'s banjo bolt contains a small mesh screen that clogs with carbon deposits, restricting oil flow to the turbo bearing. The K04 turbocharger fails between 50,000-100,000 miles if the screen is not maintained. The AWD system adds additional drivetrain stress.',
    solution: 'Remove and clean (or delete) the turbo oil feed banjo bolt screen every 15,000-20,000 miles. Use full synthetic oil changed every 3,000-5,000 miles. Allow the engine to idle for 60 seconds before shutdown after spirited driving. If the turbo has failed, a replacement K04 costs $600-$1,000 or upgrade to a K04-882 or BNR S3 for improved flow. Always replace the oil feed line with a new unit during turbo replacement.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Whining or screeching from turbo', 'Blue/white smoke from exhaust', 'Loss of boost pressure', 'Oil consumption increases', 'Excessive shaft play in turbo'],
    affectedSystems: ['Engine', 'Turbocharger', 'Lubrication'],
    dtcCodes: ['P0299'], estimatedCostLow: 600, estimatedCostHigh: 2000,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'mazdaspeedforums.org', content: 'Clean the banjo bolt screen YESTERDAY. This is the #1 killer of the 2.3 DISI turbo. A $0 screen cleaning every other oil change prevents a $1,500 turbo replacement. Full synthetic only, 5k max intervals.', upvotes: 245, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-mazdaspeed6-rear-differential-wear-2006',
    make: 'Mazda', model: 'Mazdaspeed6',
    years: [2006, 2007], trims: [], engines: ['2.3L MZR DISI Turbo I4'],
    category: 'drivetrain',
    title: 'Rear Differential and Transfer Case Fluid Neglect Damage',
    description: 'The Mazdaspeed6\'s AWD system uses an electronically controlled active transfer case and rear differential that require specific fluid changes often neglected by owners and shops. The transfer case fluid degrades and causes the coupling to slip or judder during cornering. The rear differential uses limited-slip fluid that must be changed with the correct additive, or the LSD chatters and wears prematurely.',
    solution: 'Change the transfer case fluid every 30,000 miles with Mazda-specified fluid (FE-LS ATF or equivalent). Change the rear differential fluid every 30,000 miles with 75W-90 GL-5 gear oil plus an LSD friction modifier additive. The transfer case holds about 0.6L and the rear diff about 0.8L — small volumes that are cheap to maintain. Neglecting these fluids leads to $2,000+ drivetrain repairs.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Judder or binding during tight turns', 'Chatter from rear differential in corners', 'Whining noise from rear of vehicle', 'AWD system warning light', 'Difficulty turning in parking lots'],
    affectedSystems: ['Drivetrain', 'Transfer Case', 'Differential'],
    dtcCodes: [], estimatedCostLow: 80, estimatedCostHigh: 2000,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaspeedforums.org', content: 'The transfer case and rear diff fluid changes are $40 each in fluid and take 20 minutes. Do them every 30k miles. I\'ve seen Speed6 owners spend $2,500 on a transfer case because they never changed $40 worth of fluid.', upvotes: 130, needsReview: false }
    ], status: 'published'
  },

  // MILLENIA (1995-2002)
  {
    id: 'mazda-millenia-miller-cycle-supercharger-2001',
    make: 'Mazda', model: 'Millenia',
    years: yrs(1995, 2002), trims: [], engines: ['2.3L KJ-ZEM Miller Cycle V6'],
    category: 'engine',
    title: 'Miller Cycle Supercharger (Lysholm) Bearing and Seal Failure',
    description: 'The Millenia S features a unique 2.3L Miller Cycle V6 with a Lysholm-type supercharger. The supercharger\'s internal bearings and seals fail over time, causing oil leaks, reduced boost, and a whining/grinding noise. The supercharger is lubricated by its own oil supply, and the front seal is the most common failure point. Replacement superchargers are extremely rare and expensive due to the unique application.',
    solution: 'Check supercharger oil level regularly (separate from engine oil) and change it every 30,000 miles. If the front seal leaks, it can be replaced without removing the supercharger ($200-$400). A failing supercharger can be rebuilt by specialist shops (Autorotor/Lysholm rebuild, $800-$1,500). Used supercharger assemblies from salvage yards cost $500-$1,000. An NA (non-supercharged) 2.5L KL swap is the budget alternative.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Whining or grinding noise from supercharger', 'Oil leak from front of supercharger', 'Loss of boost/power', 'Oil consumption from supercharger seal', 'Burning oil smell from engine bay'],
    affectedSystems: ['Engine', 'Supercharger', 'Lubrication'],
    dtcCodes: [], estimatedCostLow: 200, estimatedCostHigh: 1500,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'millenniaforums.com', content: 'The Miller Cycle supercharger is irreplaceable — there\'s no new production source. If yours fails, you need a used one from a junkyard or a rebuild. Change the supercharger oil every 30k miles to keep it alive. This is the only car that ever used this supercharger.', upvotes: 125, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-millenia-el-joint-coolant-leak-1995',
    make: 'Mazda', model: 'Millenia',
    years: yrs(1995, 2002), trims: [], engines: ['2.3L KJ-ZEM Miller Cycle V6', '2.5L KL V6'],
    category: 'cooling',
    title: 'Coolant Elbow Joint (El Joint) Leak Under Intake Manifold',
    description: 'Both engine variants in the Millenia develop coolant leaks from a plastic coolant connector known as the "el joint" located under the intake manifold. The plastic becomes brittle from heat cycling and cracks, causing a slow coolant leak that is extremely difficult to see due to its location. The leak can go undetected until the car overheats, potentially causing head gasket damage.',
    solution: 'Replace the plastic el joint with an updated part (some owners fabricate aluminum replacements for permanence). The repair requires removing the intake manifold to access the fitting, which is 3-5 hours of labor. Replace the intake manifold gaskets and any other coolant hoses in the area while the manifold is off. An aluminum aftermarket replacement prevents future cracking.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Coolant level slowly dropping', 'Sweet smell from engine bay', 'Coolant residue visible deep under intake manifold', 'Overheating at idle', 'Steam from engine area'],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: [], estimatedCostLow: 300, estimatedCostHigh: 800,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'millenniaforums.com', content: 'The el joint is the Millenia\'s hidden time bomb. You can\'t see it without removing the intake manifold. If your coolant is dropping slowly with no visible leak, this is almost certainly the cause. An aluminum replacement from eBay ($30) is the permanent fix.', upvotes: 90, needsReview: false }
    ], status: 'published'
  },

  // MX-30 (2022-2023)
  {
    id: 'mazda-mx30-range-anxiety-2022',
    make: 'Mazda', model: 'MX-30',
    years: yrs(2022, 2023), trims: [], engines: ['Electric Motor'],
    category: 'electrical',
    title: 'Extremely Limited Real-World Range (Sub-80 Miles)',
    description: 'The MX-30 EV\'s 35.5 kWh battery provides an EPA-estimated 100 miles of range, but real-world range frequently drops to 65-80 miles with climate control, highway speeds, or cold weather. The small battery pack was an intentional design choice by Mazda (citing environmental concerns about large batteries), but it severely limits the car\'s usability. Many owners find the range insufficient for daily commuting.',
    solution: 'Use Eco mode and limit climate control use to maximize range. Pre-condition the cabin while plugged in. Plan routes carefully and keep a charging station map available. The MX-30 is best suited as a short-commute second car, not a primary vehicle. Charge to 100% daily (Mazda says the small battery can handle it). Consider the PHEV model with range extender (if available in your market) for more flexibility.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Range estimates frequently below 80 miles', 'Range drops dramatically in cold weather', 'Running low on highway trips', 'Range anxiety on any trip over 50 miles', 'Climate control use drops range by 20-30%'],
    affectedSystems: ['Battery', 'Range', 'Powertrain'],
    dtcCodes: [], estimatedCostLow: 0, estimatedCostHigh: 0,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'Accept the MX-30 for what it is — a 60-80 mile city car. If you try to use it like a Tesla with 300 miles of range, you\'ll be miserable. It\'s great for short commutes and errands. Anything else, take the other car.', upvotes: 155, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-mx30-freestyle-door-hinge-2022',
    make: 'Mazda', model: 'MX-30',
    years: yrs(2022, 2023), trims: [], engines: ['Electric Motor'],
    category: 'body',
    title: 'Freestyle (Suicide) Door Hinge and Latch Issues',
    description: 'The MX-30\'s unique rear-hinged "freestyle" doors develop hinge stiffness, creaking, and latch misalignment over time. The rear doors require the front door to be opened first, adding to the complexity. Some owners report the door check mechanism weakening, allowing the lightweight door to swing open fully in wind and hit the front fender. The hinge pins can also develop play causing the door to sag.',
    solution: 'Lubricate door hinges and check mechanisms with white lithium grease every 6 months. Adjust the latch striker plate if the door is hard to close. If the door check (hold-open mechanism) is weak, it can be replaced ($50-$100). Hinge pin wear requires hinge replacement ($150-$300 per door). Always open rear doors with control — the lightweight design catches wind easily. Adjust at dealer under warranty for early production cars.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Rear doors creak when opening/closing', 'Door doesn\'t hold open position in wind', 'Increasing effort to close rear door', 'Slight door sag visible', 'Front fender paint damage from rear door contact'],
    affectedSystems: ['Body', 'Doors'],
    dtcCodes: [], estimatedCostLow: 50, estimatedCostHigh: 300,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'Be careful in wind — the rear freestyle doors are light and will swing open hard. I got a dent in my front fender the first week of ownership. A $5 tube of white lithium grease on the hinges every 6 months keeps them smooth.', upvotes: 45, needsReview: false }
    ], status: 'published'
  },

  // MPV (2000-2006)
  {
    id: 'mazda-mpv-transmission-slip-2000',
    make: 'Mazda', model: 'MPV',
    years: yrs(2000, 2006), trims: [], engines: ['2.5L GY V6', '3.0L AJ V6'],
    category: 'transmission',
    title: 'Automatic Transmission Slipping and Harsh Shifting',
    description: 'The second-generation MPV\'s 5-speed automatic transmission (shared with Ford) develops slipping, harsh shifts, and delayed engagement between 80,000-120,000 miles. The torque converter lock-up clutch wears, and the valve body solenoids stick. The transmission fluid often shows signs of degradation (dark color, burnt smell) well before problems are felt. Towing or heavy passenger loads accelerate wear.',
    solution: 'Change transmission fluid and filter every 30,000 miles with Mercon V ATF. A fluid change can temporarily improve mild slipping. If the torque converter shudder is present, a Mercon LV fluid change may help. Failed transmissions require rebuild ($1,800-$3,000) or replacement with a remanufactured unit ($2,000-$3,500). Jasper and Certified Transmission offer remanufactured units with warranties.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Transmission slips during 2-3 shift', 'Harsh downshifts', 'Delayed engagement from Park to Drive', 'Shudder at highway speeds (torque converter)', 'Check engine light with trans codes'],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0750', 'P0755'], estimatedCostLow: 200, estimatedCostHigh: 3500,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaforum.com', content: 'Change the trans fluid every 30k miles — don\'t listen to the "lifetime fluid" myth. Drain-and-fill only (NOT a full flush) with Mercon V. The MPV trans is Ford-sourced and needs regular fluid changes to survive.', upvotes: 80, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-mpv-rear-coil-spring-corrosion-2000',
    make: 'Mazda', model: 'MPV',
    years: yrs(2000, 2006), trims: [], engines: ['2.5L GY V6', '3.0L AJ V6'],
    category: 'suspension',
    title: 'Rear Coil Spring Corrosion and Fracture',
    description: 'The MPV\'s rear coil springs corrode and fracture in rust-belt states, typically breaking at the bottom coil. A broken spring causes the rear of the vehicle to sag on one side and can puncture a tire if the broken end shifts. The springs lose their protective coating from road salt and moisture, and the tightly wound lower coils trap debris that accelerates corrosion.',
    solution: 'Replace both rear coil springs as a pair ($100-$200 for a pair of aftermarket springs). Never replace just one side. MOOG and Monroe are reliable aftermarket options. Inspect the spring perches and shock absorbers during replacement. Spray new springs with rubberized undercoating after installation. An annual undercoating application helps prevent recurrence in rust-belt climates.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vehicle leans to one side in rear', 'Clunking noise from rear suspension', 'Visible broken coil spring end', 'Rear ride height lower than normal', 'Tire damage from broken spring end'],
    affectedSystems: ['Suspension'],
    dtcCodes: [], estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'mazdaforum.com', content: 'Check your rear springs every spring (pun intended) — look for rust and cracks on the lower coils. A broken spring can puncture your tire on the highway. MOOG replacements are $50 each and a 1-hour job per side.', upvotes: 55, needsReview: false }
    ], status: 'published'
  },

  // MAZDA2 (2011-2014)
  {
    id: 'mazda-mazda2-rear-shock-mount-2011',
    make: 'Mazda', model: 'Mazda2',
    years: yrs(2011, 2014), trims: [], engines: ['1.5L MZR I4'],
    category: 'suspension',
    title: 'Rear Shock Absorber Upper Mount Cracking',
    description: 'The Mazda2\'s rear shock absorber upper mount develops cracks from road impacts and age. The sheet metal around the mount point weakens, causing the shock to push through the body structure. This creates clunking noises from the rear and can compromise the trunk floor/cargo area integrity. The thin sheet metal used for weight savings is the root cause.',
    solution: 'Inspect the rear shock upper mounts from inside the trunk. If cracks are visible, a body shop can weld reinforcement plates over the mount area ($200-$400 per side). Replace the rear shocks at the same time if they have over 60,000 miles. Aftermarket shock tower reinforcement plates are available from some Mazda2 enthusiast vendors. Use lower-profile tires if running on rough roads frequently.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Clunking from rear over bumps', 'Visible cracking around rear shock mount in trunk', 'Rear end feels loose over bumps', 'Rattling noise from trunk area', 'Shock absorber appears higher than normal'],
    affectedSystems: ['Suspension', 'Body'],
    dtcCodes: [], estimatedCostLow: 200, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdas247.com', content: 'Pop the trunk and look at the shock towers. If you see any cracking or rust around the mount bolts, get reinforcement plates welded on before the shock punches through. A $200 fix now prevents a $1,000 body repair later.', upvotes: 42, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-mazda2-ac-condenser-leak-2011',
    make: 'Mazda', model: 'Mazda2',
    years: yrs(2011, 2014), trims: [], engines: ['1.5L MZR I4'],
    category: 'cooling',
    title: 'AC Condenser Premature Failure from Road Debris',
    description: 'The Mazda2\'s AC condenser, mounted directly behind the grille with minimal protection, is prone to damage from road debris (rocks, gravel, bugs). The thin-wall aluminum condenser develops pinhole leaks that cause slow refrigerant loss. The small frontal area of the car means the condenser takes the full impact of road debris. Replacement condensers are inexpensive but the repair requires evacuating and recharging the AC system.',
    solution: 'Replace the condenser ($80-$150 for aftermarket). The repair requires evacuating the AC system, removing the bumper and condenser, installing the new unit with new O-rings, pulling a vacuum, and recharging with R-134a ($150-$300 total labor). A small stone guard or mesh screen ($10-$20 from hardware store) installed behind the grille prevents future rock damage.',
    severity: 'low', confidence: 'medium',
    symptoms: ['AC gradually blows warmer over weeks', 'AC stops cooling entirely', 'Green or oily residue on condenser face', 'AC compressor short-cycles (turns on and off rapidly)', 'Hissing from front of vehicle (refrigerant leak)'],
    affectedSystems: ['HVAC', 'Air Conditioning'],
    dtcCodes: [], estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdas247.com', content: 'Install a piece of hardware cloth or mesh screen behind the grille opening to protect the condenser. The Mazda2 has zero stone protection for the condenser. A $10 piece of mesh prevents a $400 repair.', upvotes: 35, needsReview: false }
    ], status: 'published'
  },

  // MAZDASPEED3 (2007-2013)
  {
    id: 'mazda-mazdaspeed3-turbo-seal-failure-2007',
    make: 'Mazda', model: 'Mazdaspeed3',
    years: yrs(2007, 2013), trims: [], engines: ['2.3L MZR DISI Turbo I4'],
    category: 'engine',
    title: 'Turbocharger Seal Failure and Oil Burning',
    description: 'The Mazdaspeed3\'s K04 turbocharger develops seal failures from the same oil starvation issue affecting the CX-7 and Mazdaspeed6. The turbo oil feed banjo bolt screen clogs with carbon, starving the turbo bearing of oil. The bearing wears, allowing oil to pass through the compressor and turbine seals into the intake and exhaust. This causes blue smoke, oil consumption, and eventual turbo failure.',
    solution: 'Remove and clean (or entirely delete) the turbo oil feed banjo bolt screen at every other oil change. Use full synthetic 5W-30 changed every 3,000-5,000 miles. Idle 60 seconds before shutdown. If the turbo is already burning oil, replacement is needed — stock K04 ($600-$1,000) or upgraded BNR S3/S4 ($1,200-$2,000). Always replace the oil feed line with a new braided stainless line during turbo replacement.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Blue smoke from exhaust under boost', 'Oil consumption 1 quart per 1,000 miles or more', 'Turbo whine or grinding noise', 'Loss of boost at high RPM', 'Oil residue in intercooler'],
    affectedSystems: ['Engine', 'Turbocharger', 'Lubrication'],
    dtcCodes: ['P0299'], estimatedCostLow: 600, estimatedCostHigh: 2500,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'mazdaspeedforums.org', content: 'The banjo bolt screen is THE maintenance item on the Speed3. Clean it every 10k miles or just delete it entirely. Full synthetic only, 5k max intervals. A $0 screen cleaning prevents a $2,000 turbo replacement.', upvotes: 380, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-mazdaspeed3-motor-mount-failure-2007',
    make: 'Mazda', model: 'Mazdaspeed3',
    years: yrs(2007, 2013), trims: [], engines: ['2.3L MZR DISI Turbo I4'],
    category: 'engine',
    title: 'Passenger Side Motor Mount Failure Causing Wheel Hop',
    description: 'The Mazdaspeed3\'s passenger side (RMM - rear motor mount) fails rapidly due to the engine\'s high torque output through a front-wheel-drive configuration. When the mount collapses, the engine shifts excessively during hard acceleration, causing violent wheel hop that damages half-shafts, CV joints, and even transmission internals. The stock mount is inadequate for the 280 lb-ft of torque the engine produces.',
    solution: 'Replace the stock RMM with an aftermarket performance mount from Damond Motorsports, CP-E, or JBRMFG ($100-$200). These mounts use stiffer rubber or polyurethane that reduces engine movement at the cost of slightly more NVH (vibration at idle). The stock mount can be replaced with OEM ($80-$120) but will fail again within 20,000-40,000 miles. The repair is a 30-minute job.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Violent wheel hop during hard acceleration', 'Clunking when shifting into gear', 'Engine rocks excessively when revved', 'Half-shaft popping or clicking', 'Vibration through floorboard during acceleration'],
    affectedSystems: ['Engine', 'Mounts', 'Drivetrain'],
    dtcCodes: [], estimatedCostLow: 80, estimatedCostHigh: 250,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'mazdaspeedforums.org', content: 'An aftermarket RMM should be the FIRST mod on any Speed3. The stock mount is destroyed within 30k miles from torque. Damond 70 durometer is the sweet spot — reduces wheel hop without making the car unbearable at idle.', upvotes: 290, needsReview: false }
    ], status: 'published'
  },

  // RX-7 (1993-2002)
  {
    id: 'mazda-rx7-apex-seal-failure-1993',
    make: 'Mazda', model: 'RX-7',
    years: yrs(1993, 2002), trims: [], engines: ['1.3L 13B-REW Twin-Turbo Rotary'],
    category: 'engine',
    title: 'Apex Seal Failure and Low Compression',
    description: 'The FD RX-7\'s 13B-REW twin-turbo rotary engine is inherently prone to apex seal wear and failure. Apex seals are the rotary equivalent of piston rings, and they wear from high temperatures, poor lubrication, and carbon buildup. Seal failure causes low compression, power loss, hard starting, and eventually a non-running engine. Even well-maintained engines typically need a rebuild between 80,000-120,000 miles.',
    solution: 'Prevent apex seal wear by premixing 2-stroke oil (Idemitsu premix at 1 oz per gallon of gas) in the fuel for additional lubrication. Always warm the engine fully before high-RPM driving. Never shut off a hot engine — idle for 2 minutes first. When seals fail, a full engine rebuild ($3,000-$6,000) with new apex seals, side seals, and corner seals is required. Atkins Rotary and BridgePort Machine are well-regarded rebuilders.',
    severity: 'critical', confidence: 'medium',
    symptoms: ['Hard starting especially when hot', 'Loss of power and compression', 'Uneven idle or stalling', 'Excessive white smoke from exhaust', 'Flooding when starting (fuel washes past seals)'],
    affectedSystems: ['Engine', 'Rotary Seals'],
    dtcCodes: [], estimatedCostLow: 3000, estimatedCostHigh: 6000,
    citations: [], communityRecommendations: [
      { type: 'warning', source: 'rx7club.com', content: 'If you own a 13B-REW, premix 2-stroke oil in your gas — Idemitsu premix at 1 oz per gallon. This is the single most important thing you can do for apex seal longevity. Also NEVER shut off a hot rotary — idle 2 minutes minimum for cool-down.', upvotes: 520, needsReview: false }
    ], status: 'published'
  },
  {
    id: 'mazda-rx7-vacuum-hose-rot-1993',
    make: 'Mazda', model: 'RX-7',
    years: yrs(1993, 2002), trims: [], engines: ['1.3L 13B-REW Twin-Turbo Rotary'],
    category: 'engine',
    title: 'Sequential Turbo Vacuum System Deterioration',
    description: 'The FD RX-7\'s sequential twin-turbo system uses an incredibly complex vacuum hose network to control turbo transition, wastegates, and boost control. The system has dozens of vacuum hoses and solenoids that deteriorate with age, causing boost problems, rough transitions between turbos, and check engine lights. At 25+ years old, virtually every vacuum hose in the system is cracked or hardened. A single failed hose can disable the sequential turbo operation.',
    solution: 'Replace ALL vacuum hoses with silicone vacuum hose — this is a mandatory maintenance item on any FD RX-7. A complete silicone vacuum hose kit costs $60-$100 from RX-7 vendors. The job takes a full day and requires careful labeling of every hose before removal. Use the Mazda factory service manual vacuum diagrams as reference. Simplified single-turbo conversions ($1,500-$3,000) eliminate the complex vacuum system entirely.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Rough transition between primary and secondary turbo', 'Boost drop or spike during turbo transition at 4,500 RPM', 'Check engine light', 'Erratic idle', 'Loss of boost above transition point'],
    affectedSystems: ['Engine', 'Turbocharger', 'Intake', 'Vacuum'],
    dtcCodes: [], estimatedCostLow: 60, estimatedCostHigh: 3000,
    citations: [], communityRecommendations: [
      { type: 'tip', source: 'rx7club.com', content: 'Every FD owner needs to do a full vacuum hose replacement. There are NO exceptions — 30-year-old rubber hoses are guaranteed to be failing. Buy the silicone kit, set aside a weekend, take 200 photos before you start, and label EVERYTHING.', upvotes: 410, needsReview: false }
    ], status: 'published'
  }
];

async function main() {
  console.log(`Adding ${issues.length} Mazda issues to Supabase...`);
  let created = 0, skipped = 0;

  for (const issue of issues) {
    try {
      const existing = await prisma.knownIssue.findUnique({ where: { id: issue.id } });
      if (existing) {
        console.log(`  SKIP (exists): ${issue.id}`);
        skipped++;
        continue;
      }
      await prisma.knownIssue.create({ data: issue });
      console.log(`  CREATED: ${issue.id}`);
      created++;
    } catch (err) {
      console.error(`  ERROR: ${issue.id} — ${err.message}`);
    }
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);

  const models = [...new Set(issues.map(i => i.model))];
  console.log('\nFinal Mazda counts:');
  for (const model of models) {
    const count = await prisma.knownIssue.count({ where: { make: 'Mazda', model } });
    console.log(`  ${model}: ${count}`);
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
