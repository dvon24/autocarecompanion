/**
 * Add 2 issues each to thin Hyundai (10), Audi (8), and Kia (7) models
 * Total: 50 new issues
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function yrs(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const issues = [
  // ===== HYUNDAI (10 models x 2) =====

  // Scoupe (1991-1995)
  {
    id: 'hyundai-scoupe-alternator-failure-1991',
    make: 'Hyundai', model: 'Scoupe', years: yrs(1991, 1995),
    category: 'electrical',
    title: 'Alternator Premature Failure and Charging Issues',
    description: 'The Scoupe alternator is prone to early failure, often between 50,000-70,000 miles. Voltage regulator internal to the alternator overheats, leading to undercharging or complete failure. Common in hot climates.',
    solution: 'Replace alternator with upgraded aftermarket unit. Check battery condition and all ground connections. Inspect wiring harness for heat damage near exhaust manifold.',
    severity: 'medium',
    symptoms: ['Dimming headlights', 'Battery warning light', 'Slow cranking', 'Electrical accessories cutting out'],
    affectedSystems: ['Charging system', 'Electrical system'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 450
  },
  {
    id: 'hyundai-scoupe-rear-strut-mount-1991',
    make: 'Hyundai', model: 'Scoupe', years: yrs(1991, 1995),
    category: 'suspension',
    title: 'Rear Strut Mount Bearing Collapse',
    description: 'Rear strut mount bearings deteriorate and collapse, causing clunking noises over bumps and uneven rear tire wear. The rubber isolator portion of the mount cracks and separates.',
    solution: 'Replace rear strut mounts with new bearings and isolators. Inspect struts for leaking while mounts are removed. Perform rear alignment after replacement.',
    severity: 'medium',
    symptoms: ['Clunking from rear over bumps', 'Uneven rear tire wear', 'Poor rear handling', 'Knocking noise on turns'],
    affectedSystems: ['Rear suspension', 'Strut mounts'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 400
  },

  // Tiburon (2003-2008)
  {
    id: 'hyundai-tiburon-clutch-slave-2003',
    make: 'Hyundai', model: 'Tiburon', years: yrs(2003, 2008),
    category: 'transmission',
    title: 'Clutch Slave Cylinder Internal Leak',
    description: 'The internal hydraulic clutch slave cylinder (concentric design mounted inside the bell housing) develops leaks, causing soft or spongy clutch pedal and difficulty shifting. Requires transmission removal for replacement.',
    solution: 'Replace concentric slave cylinder. Since transmission must be removed, replace clutch disc, pressure plate, and throwout bearing at the same time. Flush clutch hydraulic system with fresh DOT 4 fluid.',
    severity: 'high',
    symptoms: ['Spongy clutch pedal', 'Difficulty shifting into gear', 'Clutch fluid loss', 'Grinding when shifting'],
    affectedSystems: ['Clutch hydraulics', 'Manual transmission'],
    dtcCodes: [],
    estimatedCostLow: 800, estimatedCostHigh: 1500
  },
  {
    id: 'hyundai-tiburon-rear-caliper-seize-2003',
    make: 'Hyundai', model: 'Tiburon', years: yrs(2003, 2008),
    category: 'brakes',
    title: 'Rear Brake Caliper Seizure',
    description: 'Rear brake caliper slide pins corrode and seize, especially in salt-belt states. Causes uneven pad wear, brake drag, and reduced fuel economy. The integrated parking brake mechanism compounds the issue.',
    solution: 'Remove calipers, clean and re-grease slide pins with high-temp silicone brake grease. Replace pins and boots if corroded. In severe cases, replace caliper. Adjust parking brake cable tension.',
    severity: 'medium',
    symptoms: ['Uneven rear brake pad wear', 'Brake drag', 'Hot rear wheel after driving', 'Reduced fuel economy', 'Burning smell from rear brakes'],
    affectedSystems: ['Rear brakes', 'Parking brake'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 400
  },

  // Veracruz (2007-2012)
  {
    id: 'hyundai-veracruz-alternator-decoupler-2007',
    make: 'Hyundai', model: 'Veracruz', years: yrs(2007, 2012),
    category: 'electrical',
    title: 'Alternator Decoupler Pulley Failure',
    description: 'The alternator overrunning decoupler pulley fails, causing serpentine belt chirp, premature belt wear, and alternator bearing noise. The one-way clutch inside the pulley seizes or freewheel mechanism breaks.',
    solution: 'Replace alternator decoupler pulley (requires special removal tool). Inspect and replace serpentine belt. Check belt tensioner for proper operation.',
    severity: 'medium',
    symptoms: ['Chirping noise from engine', 'Serpentine belt squeal at startup', 'Premature belt wear', 'Rattling from alternator area'],
    affectedSystems: ['Alternator', 'Accessory drive belt'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 400
  },
  {
    id: 'hyundai-veracruz-transfer-case-leak-2007',
    make: 'Hyundai', model: 'Veracruz', years: yrs(2007, 2012),
    category: 'drivetrain',
    title: 'Transfer Case Output Shaft Seal Leak',
    description: 'AWD models develop a leak from the transfer case output shaft seal. Fluid loss can damage the transfer case clutch pack if not addressed. Most common after 80,000 miles.',
    solution: 'Replace transfer case output shaft seal. Drain and refill transfer case with correct Hyundai-spec fluid. Inspect clutch pack for damage if fluid was low.',
    severity: 'medium',
    symptoms: ['Fluid drip under center of vehicle', 'Transfer case whining noise', 'AWD engagement hesitation', 'Fluid spots on driveway'],
    affectedSystems: ['Transfer case', 'AWD system'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 500
  },

  // Entourage (2007-2009)
  {
    id: 'hyundai-entourage-power-door-motor-2007',
    make: 'Hyundai', model: 'Entourage', years: yrs(2007, 2009),
    category: 'electrical',
    title: 'Power Sliding Door Motor and Cable Failure',
    description: 'Power sliding door motor burns out or the cable frays and jams, causing the door to stop mid-travel, open/close erratically, or refuse to latch. Common on both driver and passenger sides.',
    solution: 'Replace power sliding door motor assembly and cable. Lubricate door track and rollers. Check door latch striker alignment. Reset door module by disconnecting battery for 10 minutes.',
    severity: 'medium',
    symptoms: ['Sliding door stops mid-travel', 'Grinding noise from door', 'Door will not latch', 'Power door warning chime', 'Door opens but won\'t close'],
    affectedSystems: ['Power sliding door', 'Door module'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 800
  },
  {
    id: 'hyundai-entourage-crankshaft-sensor-2007',
    make: 'Hyundai', model: 'Entourage', years: yrs(2007, 2009),
    category: 'engine',
    title: 'Crankshaft Position Sensor Failure Causing Stalling',
    description: 'The 3.8L V6 crankshaft position sensor fails intermittently, causing random stalling, no-start conditions, and rough running. Heat soak worsens the problem — engine stalls after reaching operating temperature then restarts after cooling.',
    solution: 'Replace crankshaft position sensor. Use OEM or quality aftermarket sensor. Check wiring connector for corrosion or loose pins. Clear stored DTCs after replacement.',
    severity: 'high',
    symptoms: ['Random stalling while driving', 'No-start when hot', 'Engine restarts after cooling down', 'Check engine light', 'Rough idle'],
    affectedSystems: ['Engine management', 'Ignition system'],
    dtcCodes: ['P0335', 'P0336'],
    estimatedCostLow: 100, estimatedCostHigh: 250
  },

  // XG350 (2002-2005)
  {
    id: 'hyundai-xg350-intake-manifold-gasket-2002',
    make: 'Hyundai', model: 'XG350', years: yrs(2002, 2005),
    category: 'engine',
    title: 'Intake Manifold Gasket Leak',
    description: 'The 3.5L V6 intake manifold gaskets deteriorate causing vacuum leaks, rough idle, and lean running conditions. Upper plenum gasket is most common failure point. Can trigger multiple misfire codes.',
    solution: 'Replace upper and lower intake manifold gaskets. Clean manifold mating surfaces. Inspect PCV system and vacuum hoses while manifold is removed. Use OEM gaskets for best seal.',
    severity: 'medium',
    symptoms: ['Rough idle', 'Lean misfire', 'Hissing noise from engine', 'Check engine light', 'Poor acceleration'],
    affectedSystems: ['Intake manifold', 'Engine management'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 250, estimatedCostHigh: 500
  },
  {
    id: 'hyundai-xg350-window-regulator-2002',
    make: 'Hyundai', model: 'XG350', years: yrs(2002, 2005),
    category: 'electrical',
    title: 'Power Window Regulator Cable Snap',
    description: 'Power window regulators use a cable-driven design that is prone to cable breakage, causing the window to drop into the door or jam in a partially open position. Front windows fail most frequently.',
    solution: 'Replace window regulator assembly (motor and regulator sold as unit). Lubricate window channel guides with silicone spray. Check door wiring harness for chafing.',
    severity: 'low',
    symptoms: ['Window drops into door', 'Window moves slowly', 'Clicking sound from door', 'Window stuck open or closed'],
    affectedSystems: ['Power windows', 'Door electrical'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 350
  },

  // Excel (1990-1994)
  {
    id: 'hyundai-excel-cv-joint-boot-1990',
    make: 'Hyundai', model: 'Excel', years: yrs(1990, 1994),
    category: 'drivetrain',
    title: 'CV Joint Boot Splitting and Axle Failure',
    description: 'CV joint boots crack and split prematurely, often before 50,000 miles. Grease loss leads to rapid CV joint wear and clicking/popping on turns. Both inner and outer joints are affected.',
    solution: 'If caught early, replace boot and repack joint with fresh CV grease. If clicking is present, replace entire CV axle assembly (remanufactured units are cost-effective). Replace both sides together.',
    severity: 'medium',
    symptoms: ['Clicking on turns', 'Grease splatter on inner fender', 'Vibration during acceleration', 'Torn rubber boot visible'],
    affectedSystems: ['CV axles', 'Front drivetrain'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 350
  },
  {
    id: 'hyundai-excel-carburetor-issues-1990',
    make: 'Hyundai', model: 'Excel', years: yrs(1990, 1994),
    category: 'fuel',
    title: 'Carburetor Idle and Cold Start Problems (Pre-1992)',
    description: 'Early carbureted Excel models suffer from idle instability and poor cold start performance. The automatic choke mechanism sticks, and idle speed control deteriorates. Fuel-injected 1992+ models are less affected but can develop injector clogging.',
    solution: 'For carbureted models: clean and rebuild carburetor, replace choke pull-off diaphragm, adjust idle mixture and speed. For fuel-injected: clean injectors, replace idle air control valve if hunting idle persists.',
    severity: 'medium',
    symptoms: ['Stalling at idle', 'Hard cold starts', 'Surging idle', 'Poor fuel economy', 'Rough running when cold'],
    affectedSystems: ['Fuel delivery', 'Idle control'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 300
  },

  // Genesis sedan (2009-2016)
  {
    id: 'hyundai-genesis-steering-column-noise-2009',
    make: 'Hyundai', model: 'Genesis', years: yrs(2009, 2016),
    category: 'steering',
    title: 'Intermediate Steering Shaft Clunk',
    description: 'The intermediate steering shaft universal joint develops excessive play, creating a clunking or popping sensation felt through the steering wheel when turning at low speeds, particularly when cold. TSB 16-SA-003 addresses this.',
    solution: 'Replace intermediate steering shaft assembly. Some dealers apply grease as a temporary fix, but full shaft replacement is the permanent solution. Ensure steering column covers are reinstalled properly.',
    severity: 'low',
    symptoms: ['Clunk when turning steering wheel', 'Popping noise at low speed turns', 'Loose steering feel', 'Noise worse when cold'],
    affectedSystems: ['Steering column', 'Intermediate shaft'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 450
  },
  {
    id: 'hyundai-genesis-rear-diff-bushing-2009',
    make: 'Hyundai', model: 'Genesis', years: yrs(2009, 2016),
    category: 'drivetrain',
    title: 'Rear Differential Mount Bushing Deterioration',
    description: 'Rear differential mount bushings wear out, causing a pronounced thud when shifting from park to drive/reverse and a clunking sound during deceleration. More noticeable on 5.0L V8 models due to higher torque.',
    solution: 'Replace rear differential mount bushings. Polyurethane aftermarket bushings last longer but transmit more NVH. Inspect differential fluid level and condition while servicing.',
    severity: 'medium',
    symptoms: ['Thud shifting into gear', 'Clunk during deceleration', 'Vibration at highway speeds', 'Rear-end noise over bumps'],
    affectedSystems: ['Rear differential', 'Differential mounts'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 500
  },

  // Azera (2006-2017)
  {
    id: 'hyundai-azera-strut-bearing-2006',
    make: 'Hyundai', model: 'Azera', years: yrs(2006, 2017),
    category: 'suspension',
    title: 'Front Strut Bearing Plate Wear and Creaking',
    description: 'Front strut mount bearing plates wear out, causing a creaking or groaning noise when turning the steering wheel, especially at low speeds or when stationary. Common after 60,000 miles.',
    solution: 'Replace front strut mount bearing assemblies. Replace struts at the same time if over 80,000 miles. Perform front-end alignment after work is complete.',
    severity: 'low',
    symptoms: ['Creaking noise when turning', 'Groaning from front end', 'Steering wheel vibration', 'Noise at low speed maneuvers'],
    affectedSystems: ['Front suspension', 'Strut mounts'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 500
  },
  {
    id: 'hyundai-azera-starter-motor-2006',
    make: 'Hyundai', model: 'Azera', years: yrs(2006, 2017),
    category: 'electrical',
    title: 'Starter Motor Intermittent No-Crank',
    description: 'Starter motor solenoid contacts wear causing intermittent no-crank conditions. The engine may click once but not turn over, then start normally on a subsequent attempt. More common in hot weather.',
    solution: 'Replace starter motor assembly. Inspect and clean battery cable terminals and engine ground strap. Check for proper voltage at starter solenoid terminal during crank attempt to confirm diagnosis.',
    severity: 'medium',
    symptoms: ['Single click no crank', 'Intermittent no-start', 'Starts on second or third try', 'Worse in hot weather'],
    affectedSystems: ['Starting system', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 500
  },

  // Equus (2011-2016)
  {
    id: 'hyundai-equus-air-spring-leak-2011',
    make: 'Hyundai', model: 'Equus', years: yrs(2011, 2016),
    category: 'suspension',
    title: 'Rear Air Spring Bladder Deterioration',
    description: 'The rear air suspension springs develop cracks in the rubber bladder, causing slow air leaks. The vehicle sags overnight or after sitting for several hours. Compressor runs excessively to compensate, leading to compressor burnout.',
    solution: 'Replace rear air springs (both sides recommended). Inspect air lines and fittings for leaks using soapy water. If compressor is noisy or slow, replace it as well. Continental and Arnott offer quality replacements.',
    severity: 'high',
    symptoms: ['Rear sag after sitting overnight', 'Compressor runs constantly', 'Suspension warning light', 'Uneven ride height', 'Harsh rear ride'],
    affectedSystems: ['Air suspension', 'Ride height control'],
    dtcCodes: [],
    estimatedCostLow: 600, estimatedCostHigh: 1200
  },
  {
    id: 'hyundai-equus-electronic-parking-brake-2011',
    make: 'Hyundai', model: 'Equus', years: yrs(2011, 2016),
    category: 'brakes',
    title: 'Electronic Parking Brake Actuator Malfunction',
    description: 'The electronic parking brake actuator motor fails, preventing the parking brake from engaging or releasing. The EPB warning light illuminates and the system may default to engaged, preventing the vehicle from moving.',
    solution: 'Replace the electronic parking brake actuator motor on the affected caliper. Requires initialization/calibration via scan tool after replacement. Check wiring harness to actuator for corrosion at connector.',
    severity: 'high',
    symptoms: ['Parking brake warning light', 'Parking brake won\'t release', 'EPB won\'t engage', 'Vehicle won\'t move after parking'],
    affectedSystems: ['Electronic parking brake', 'Rear brakes'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 800
  },

  // Venue (2020-2025)
  {
    id: 'hyundai-venue-cvt-shudder-2020',
    make: 'Hyundai', model: 'Venue', years: yrs(2020, 2025),
    category: 'transmission',
    title: 'IVT (CVT) Shudder and Hesitation Under Load',
    description: 'The Smartstream IVT (Intelligent Variable Transmission) exhibits shudder and hesitation during light acceleration and low-speed driving. The transmission hunts between ratios and may produce a juddering sensation, particularly noticeable on inclines.',
    solution: 'Perform IVT fluid drain and refill with Hyundai SP-CVT1 fluid. Software update (TSB) may be available to improve shift mapping. In persistent cases, valve body replacement may be necessary.',
    severity: 'medium',
    symptoms: ['Shudder during light acceleration', 'Hesitation from stop', 'Juddering on hills', 'RPM hunting', 'Delayed engagement'],
    affectedSystems: ['IVT transmission', 'Transmission control module'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 600
  },
  {
    id: 'hyundai-venue-rear-camera-fog-2020',
    make: 'Hyundai', model: 'Venue', years: yrs(2020, 2025),
    category: 'electrical',
    title: 'Rear Backup Camera Fogging and Image Distortion',
    description: 'The rear backup camera lens accumulates moisture internally, causing foggy or distorted images. The camera housing seal fails, allowing condensation to form on the lens. Occurs more frequently in humid climates.',
    solution: 'Replace rear backup camera assembly. Ensure new camera mounting gasket is properly seated. Apply dielectric grease to connector. Some owners add additional sealant around the housing edge as preventive measure.',
    severity: 'low',
    symptoms: ['Blurry backup camera image', 'Foggy camera lens', 'Intermittent camera blackout', 'Distorted reverse image'],
    affectedSystems: ['Backup camera', 'Safety systems'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 350
  },

  // ===== AUDI (8 models x 2) =====

  // A5 Sportback (2018-2025)
  {
    id: 'audi-a5-sportback-water-pump-2018',
    make: 'Audi', model: 'A5 Sportback', years: yrs(2018, 2025),
    category: 'cooling',
    title: 'Electric Water Pump Failure (2.0T)',
    description: 'The auxiliary electric water pump for the turbo cooling circuit fails, causing potential turbo overheating after engine shutdown. The pump impeller seizes or the electronic controller faults.',
    solution: 'Replace auxiliary electric water pump. Located on the lower passenger side of the engine. Clear fault codes and verify proper operation with VCDS or scan tool. Check coolant level after replacement.',
    severity: 'medium',
    symptoms: ['Coolant warning light', 'Turbo-related fault codes', 'Overheating after spirited driving', 'Whining noise from engine bay after shutdown'],
    affectedSystems: ['Turbo cooling circuit', 'Auxiliary water pump'],
    dtcCodes: ['P26B2'],
    estimatedCostLow: 300, estimatedCostHigh: 600
  },
  {
    id: 'audi-a5-sportback-rear-hatch-strut-2018',
    make: 'Audi', model: 'A5 Sportback', years: yrs(2018, 2025),
    category: 'body',
    title: 'Rear Hatch Lift Support Gas Strut Weakness',
    description: 'The Sportback rear hatch gas struts lose pressure prematurely, causing the hatch to not stay open or fall closed. Both struts typically fail within a similar timeframe. Worse in cold weather.',
    solution: 'Replace both rear hatch gas struts as a pair. Use OEM or Stabilus-branded struts. No coding required — simple clip-on replacement. Takes 15 minutes.',
    severity: 'low',
    symptoms: ['Hatch won\'t stay open', 'Hatch slowly closes on its own', 'Worse in cold weather', 'Need to prop hatch open manually'],
    affectedSystems: ['Rear hatch', 'Gas struts'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 200
  },

  // Q8 e-tron (2023-2025)
  {
    id: 'audi-q8-etron-12v-battery-drain-2023',
    make: 'Audi', model: 'Q8 e-tron', years: yrs(2023, 2025),
    category: 'electrical',
    title: '12V Auxiliary Battery Excessive Drain',
    description: 'The 12V auxiliary battery drains if the vehicle sits for more than a few days. Multiple electronic modules fail to enter proper sleep mode, causing parasitic drain exceeding 50mA. Software-related in most cases.',
    solution: 'Update vehicle software to latest version via dealer. If drain persists, have dealer perform parasitic draw test to identify module staying awake. 12V battery replacement with AGM type may be needed if battery was deeply discharged.',
    severity: 'medium',
    symptoms: ['Dead battery after sitting 3-5 days', 'Vehicle won\'t unlock with key fob', 'Infotainment slow to boot', 'Multiple warning messages on startup'],
    affectedSystems: ['12V electrical system', 'Body control modules'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 400
  },
  {
    id: 'audi-q8-etron-charge-port-lid-2023',
    make: 'Audi', model: 'Q8 e-tron', years: yrs(2023, 2025),
    category: 'electrical',
    title: 'Charge Port Door Actuator Failure',
    description: 'The motorized charge port door fails to open or close, preventing charging or leaving the port exposed to weather. The actuator motor or the release mechanism binds. Can be manually overridden in emergency.',
    solution: 'Replace charge port door actuator assembly. Check for debris or ice in the mechanism. Software update may improve actuator control logic. Manual release is accessible from inside the cargo area.',
    severity: 'medium',
    symptoms: ['Charge port won\'t open', 'Charge port stuck open', 'Clicking noise at charge port', 'Unable to plug in charger'],
    affectedSystems: ['Charge port', 'Charging system'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500
  },

  // 100 (1990-1994)
  {
    id: 'audi-100-power-steering-rack-leak-1990',
    make: 'Audi', model: '100', years: yrs(1990, 1994),
    category: 'steering',
    title: 'Power Steering Rack Seal Leak',
    description: 'The hydraulic power steering rack develops leaks from the input shaft seal and inner tie rod boots. Pentosin hydraulic fluid weeps and eventually pours from the rack, causing heavy steering and low fluid warnings.',
    solution: 'Replace or rebuild power steering rack. Use Pentosin CHF 11S fluid only — conventional ATF will destroy seals. Flush entire system when replacing rack. Check pump for whining which indicates damage from running low.',
    severity: 'high',
    symptoms: ['Power steering fluid leak', 'Heavy steering at low speed', 'Whining power steering pump', 'Fluid on garage floor', 'Steering assist intermittent'],
    affectedSystems: ['Power steering rack', 'Hydraulic system'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 1200
  },
  {
    id: 'audi-100-vacuum-hose-rot-1990',
    make: 'Audi', model: '100', years: yrs(1990, 1994),
    category: 'engine',
    title: 'Vacuum Hose Deterioration Causing Multiple Issues',
    description: 'Vacuum hoses throughout the engine bay become brittle, crack, and leak with age. Causes rough idle, failed emissions, inoperative climate control flaps, and cruise control failure. The Audi 100 uses vacuum for numerous subsystems.',
    solution: 'Replace all vacuum hoses with silicone or OEM-quality rubber hose. Create a vacuum line diagram before removing old lines. Test each vacuum-operated system after replacement. Inspect check valves and vacuum reservoir.',
    severity: 'medium',
    symptoms: ['Rough idle', 'Climate control stuck on defrost', 'Cruise control inoperative', 'Lean fault codes', 'Hissing noise from engine bay'],
    affectedSystems: ['Vacuum system', 'Engine management', 'HVAC', 'Cruise control'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 200
  },

  // 90 (1990-1995)
  {
    id: 'audi-90-window-regulator-clip-1990',
    make: 'Audi', model: '90', years: yrs(1990, 1995),
    category: 'body',
    title: 'Window Regulator Clip and Cable Failure',
    description: 'The plastic clips that attach the window glass to the regulator break, causing the window to drop into the door. The cable-driven regulator mechanism also frays over time. Very common failure on all four doors.',
    solution: 'Replace window regulator assembly. Aftermarket regulators with metal clips are more durable than OEM plastic clips. Lubricate window channels with silicone spray during installation.',
    severity: 'low',
    symptoms: ['Window drops into door', 'Window tilts at angle', 'Grinding noise operating window', 'Window moves very slowly'],
    affectedSystems: ['Power windows', 'Window regulators'],
    dtcCodes: [],
    estimatedCostLow: 120, estimatedCostHigh: 300
  },
  {
    id: 'audi-90-hydraulic-lifter-tick-1990',
    make: 'Audi', model: '90', years: yrs(1990, 1995),
    category: 'engine',
    title: 'Hydraulic Valve Lifter Tick on Cold Start',
    description: 'The 2.8L V6 hydraulic valve lifters (hydraulic lash adjusters) bleed down overnight, causing a ticking noise on cold start that lasts 30 seconds to several minutes. Worsens with age and infrequent oil changes.',
    solution: 'Try switching to high-quality full synthetic 5W-40 oil with fresh filter. If tick persists beyond 30 seconds, replace hydraulic lifters. Using VW 502.00 spec oil is recommended. Short oil change intervals (5,000 miles) help prevent recurrence.',
    severity: 'low',
    symptoms: ['Ticking noise on cold start', 'Noise from valve cover area', 'Tick fades after warming up', 'Worse after sitting overnight'],
    affectedSystems: ['Valvetrain', 'Hydraulic lifters'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 600
  },

  // A4 allroad (2013-2025)
  {
    id: 'audi-a4-allroad-air-spring-rear-2013',
    make: 'Audi', model: 'A4 allroad', years: yrs(2013, 2025),
    category: 'suspension',
    title: 'Rear Air Spring Leak on Adaptive Suspension',
    description: 'A4 allroad models equipped with adaptive air suspension develop rear air spring leaks. The rubber bellows cracks at the fold points, causing the rear to sag. The compressor overworks and may fail as a secondary consequence.',
    solution: 'Replace leaking rear air spring(s). Inspect air lines and valve block for leaks. If compressor is noisy, replace it. Arnott and Continental are quality aftermarket options. VCDS can be used to test components.',
    severity: 'high',
    symptoms: ['Rear end sagging', 'Suspension warning light', 'Compressor running frequently', 'Uneven ride height', 'Harsher ride quality'],
    affectedSystems: ['Rear air suspension', 'Air compressor'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 1100
  },
  {
    id: 'audi-a4-allroad-oil-consumption-2013',
    make: 'Audi', model: 'A4 allroad', years: yrs(2013, 2019),
    category: 'engine',
    title: 'Excessive Oil Consumption on 2.0T (EA888 Gen 3)',
    description: 'The 2.0T EA888 engine in 2013-2019 models consumes excessive oil, sometimes 1 quart per 1,000 miles. Caused by piston ring design that allows oil past the rings. Audi extended warranty coverage for some model years.',
    solution: 'Perform Audi oil consumption test (track usage over 2,000 miles). If consuming >1qt/2,000mi, piston ring replacement under extended warranty (if eligible). Updated piston ring design resolves the issue. Check PCV valve as well.',
    severity: 'high',
    symptoms: ['Low oil warning between changes', 'Need to add oil frequently', 'Blue smoke on startup', 'Fouled spark plugs', 'Oil smell from exhaust'],
    affectedSystems: ['Piston rings', 'PCV system'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 3000
  },

  // Q5 Sportback (2021-2025)
  {
    id: 'audi-q5-sportback-sunroof-rattle-2021',
    make: 'Audi', model: 'Q5 Sportback', years: yrs(2021, 2025),
    category: 'body',
    title: 'Panoramic Sunroof Wind Noise and Rattle',
    description: 'The panoramic sunroof develops rattling noises at highway speeds and wind noise around the leading edge seal. The sunroof glass deflector can also come loose or break. More noticeable in cold weather when seals contract.',
    solution: 'Clean and lubricate sunroof rails and seals with Krytox or silicone grease. Adjust sunroof alignment via dealer. Replace wind deflector if cracked. In some cases, the sunroof cassette requires re-indexing via scan tool.',
    severity: 'low',
    symptoms: ['Rattling at highway speed', 'Wind noise from sunroof area', 'Creaking over bumps', 'Water drip at headliner edge'],
    affectedSystems: ['Panoramic sunroof', 'Sunroof seals'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 400
  },
  {
    id: 'audi-q5-sportback-rear-brake-squeal-2021',
    make: 'Audi', model: 'Q5 Sportback', years: yrs(2021, 2025),
    category: 'brakes',
    title: 'Rear Brake Squeal at Low Speed',
    description: 'Persistent rear brake squeal during light braking and low-speed stops. The OEM brake pad compound and rotor finish create harmonic vibration. Not a safety concern but an annoyance. TSB available for updated pad compound.',
    solution: 'Replace rear brake pads with updated compound (check TSB for latest part number). Apply brake pad shims and Permatex Disc Brake Quiet on pad backing plates. Resurface or replace rotors if grooved.',
    severity: 'low',
    symptoms: ['Squealing when braking lightly', 'Noise at low speed stops', 'Noise goes away with hard braking', 'Noise worse in morning or damp weather'],
    affectedSystems: ['Rear brakes', 'Brake pads'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 350
  },

  // A4 Avant (2009-2025)
  {
    id: 'audi-a4-avant-tailgate-wiring-2009',
    make: 'Audi', model: 'A4 Avant', years: yrs(2009, 2025),
    category: 'electrical',
    title: 'Tailgate Wiring Harness Breakage',
    description: 'The wiring harness that passes through the tailgate rubber boot breaks from repeated opening and closing. Causes rear wiper, license plate lights, rear washer, and tailgate lock to fail intermittently or completely.',
    solution: 'Open the rubber boot and inspect wires for breaks. Solder and heat-shrink broken wires. If multiple wires are damaged, replace the entire tailgate harness section. Use flexible silicone wire for repairs. Add extra service loop for strain relief.',
    severity: 'medium',
    symptoms: ['Rear wiper stops working', 'License plate light out', 'Rear washer inoperative', 'Tailgate won\'t lock/unlock', 'Intermittent rear electrical faults'],
    affectedSystems: ['Tailgate wiring', 'Rear electrical'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 400
  },
  {
    id: 'audi-a4-avant-rear-shock-mount-2009',
    make: 'Audi', model: 'A4 Avant', years: yrs(2009, 2025),
    category: 'suspension',
    title: 'Rear Upper Shock Mount Bushing Wear',
    description: 'Rear upper shock mount bushings wear out, causing a knocking noise from the rear when going over bumps. The Avant\'s heavier rear end accelerates bushing wear compared to the sedan. Common after 60,000 miles.',
    solution: 'Replace rear upper shock mount bushings. Consider replacing rear shocks at the same time if over 80,000 miles. Bilstein B4 or Sachs OE replacements are recommended. Realign rear suspension after service.',
    severity: 'medium',
    symptoms: ['Knocking from rear over bumps', 'Rear-end looseness', 'Uneven rear tire wear', 'Popping noise from trunk area'],
    affectedSystems: ['Rear suspension', 'Shock mounts'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500
  },

  // A6 allroad (2020-2025)
  {
    id: 'audi-a6-allroad-adaptive-damper-2020',
    make: 'Audi', model: 'A6 allroad', years: yrs(2020, 2025),
    category: 'suspension',
    title: 'Adaptive Air Suspension Damper Fault',
    description: 'The electronically controlled adaptive dampers develop internal valve faults, causing one corner to ride differently than the others. The suspension warning light illuminates and the system may default to a fixed firm setting.',
    solution: 'Diagnose with VCDS/ODIS to identify which damper is faulting. Replace the affected adaptive damper. Perform suspension basic setting/calibration via diagnostic tool after replacement. Bilstein offers OE-equivalent replacements.',
    severity: 'high',
    symptoms: ['Suspension warning light', 'One corner feels different', 'Harsh default ride mode', 'Clunking from affected corner', 'Body lean on turns'],
    affectedSystems: ['Adaptive suspension', 'Electronic dampers'],
    dtcCodes: [],
    estimatedCostLow: 600, estimatedCostHigh: 1400
  },
  {
    id: 'audi-a6-allroad-mild-hybrid-battery-2020',
    make: 'Audi', model: 'A6 allroad', years: yrs(2020, 2025),
    category: 'electrical',
    title: '48V Mild Hybrid System Battery Degradation',
    description: 'The 48V lithium-ion battery for the mild hybrid (MHEV) system loses capacity, causing start-stop to stop functioning, reduced regenerative braking, and occasional fault messages. Battery is located under the luggage compartment floor.',
    solution: 'Replace 48V lithium-ion battery. Requires coding/registration with dealer scan tool (ODIS). Battery must be matched to VIN. Do not attempt to replace with incompatible battery. Check 48V wiring for corrosion.',
    severity: 'medium',
    symptoms: ['Start-stop no longer functions', 'MHEV fault message', 'Reduced coasting/sailing capability', 'Electrical system warning', 'Rougher engine restarts'],
    affectedSystems: ['48V mild hybrid system', 'Start-stop system'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 900
  },

  // ===== KIA (7 models x 2) =====

  // K900 (2015-2020)
  {
    id: 'kia-k900-drl-led-module-2015',
    make: 'Kia', model: 'K900', years: yrs(2015, 2020),
    category: 'electrical',
    title: 'LED Daytime Running Light Module Burnout',
    description: 'Individual LED elements in the DRL strip fail, creating a partially lit or flickering appearance. The LED modules are integrated into the headlight assembly, making individual LED repair impractical.',
    solution: 'Replace headlight assembly containing the failed LED DRL module. Aftermarket LED driver boards are available for 2015-2018 models as a repair alternative. Check for water intrusion in headlight housing which accelerates failure.',
    severity: 'low',
    symptoms: ['Partial DRL illumination', 'Flickering DRL strip', 'DRL warning on dashboard', 'One side dimmer than other'],
    affectedSystems: ['Daytime running lights', 'Headlight assembly'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 800
  },
  {
    id: 'kia-k900-transmission-harsh-shift-2015',
    make: 'Kia', model: 'K900', years: yrs(2015, 2020),
    category: 'transmission',
    title: 'Harsh 2-3 Upshift Under Light Throttle',
    description: 'The 8-speed automatic transmission produces a noticeably harsh 2-3 upshift during gentle acceleration. The torque converter lockup strategy and shift calibration contribute to the harsh engagement. TSB available for transmission software reflash.',
    solution: 'Have dealer perform transmission control module software update (TSB). Drain and refill transmission with Kia SP-IV RR ATF. If harshness persists after reflash, valve body replacement may be necessary.',
    severity: 'medium',
    symptoms: ['Hard shift between 2nd and 3rd gear', 'Jerk during light acceleration', 'Transmission clunk at low speed', 'Shift harshness worse when cold'],
    affectedSystems: ['8-speed automatic', 'Transmission control module'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 500
  },

  // Sephia (1994-2001)
  {
    id: 'kia-sephia-head-gasket-1994',
    make: 'Kia', model: 'Sephia', years: yrs(1994, 2001),
    category: 'engine',
    title: 'Head Gasket Failure and Coolant Mixing',
    description: 'The 1.6L and 1.8L engines are prone to head gasket failure, allowing coolant to mix with engine oil or leak externally. Often caused by overheating events. The cast iron block and aluminum head have different thermal expansion rates.',
    solution: 'Replace head gasket. Have head checked for warpage and resurfaced if necessary. Replace head bolts (torque-to-yield, not reusable). Flush cooling system and engine oil. Inspect timing belt while head is off.',
    severity: 'high',
    symptoms: ['Milky oil on dipstick', 'White smoke from exhaust', 'Coolant loss with no visible leak', 'Overheating', 'Bubbles in coolant overflow'],
    affectedSystems: ['Engine', 'Cooling system'],
    dtcCodes: [],
    estimatedCostLow: 600, estimatedCostHigh: 1200
  },
  {
    id: 'kia-sephia-rear-wheel-bearing-1994',
    make: 'Kia', model: 'Sephia', years: yrs(1994, 2001),
    category: 'suspension',
    title: 'Rear Wheel Bearing Noise and Failure',
    description: 'Rear wheel bearings wear prematurely, producing a humming or growling noise that increases with vehicle speed. The bearing is pressed into the rear knuckle, making replacement labor-intensive. Common after 60,000 miles.',
    solution: 'Replace rear wheel bearing (requires press). Replace both sides if mileage is similar. Check rear hub for scoring. Inspect rear brakes while hub is apart. New bearing should be pressed using proper tools — improper installation causes premature re-failure.',
    severity: 'medium',
    symptoms: ['Humming noise from rear', 'Noise increases with speed', 'Noise changes with steering input', 'Rear wheel play when jacked up'],
    affectedSystems: ['Rear wheel bearings', 'Rear hub assembly'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 400
  },

  // Sedona (2002-2014)
  {
    id: 'kia-sedona-alternator-overheating-2002',
    make: 'Kia', model: 'Sedona', years: yrs(2002, 2014),
    category: 'electrical',
    title: 'Alternator Overheating and Premature Failure',
    description: 'The alternator is positioned in a heat trap near the exhaust manifold, causing premature failure. The voltage regulator overheats, leading to undercharging or overcharging. Multiple alternator replacements within 100,000 miles are common.',
    solution: 'Replace alternator with high-quality aftermarket unit (Denso or Bosch). Add heat shielding between exhaust manifold and alternator if clearance allows. Check all battery cable connections and ground straps.',
    severity: 'medium',
    symptoms: ['Battery warning light', 'Dimming lights at idle', 'Dead battery', 'Burning smell from engine bay', 'Electrical accessories flickering'],
    affectedSystems: ['Charging system', 'Alternator'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 500
  },
  {
    id: 'kia-sedona-sliding-door-latch-2002',
    make: 'Kia', model: 'Sedona', years: yrs(2002, 2014),
    category: 'body',
    title: 'Sliding Door Latch and Roller Mechanism Failure',
    description: 'Sliding door upper and center rollers wear out, causing the door to bind, squeak, and become difficult to open or close. The latch mechanism also fails, preventing the door from fully closing or opening. Common on both manual and power door versions.',
    solution: 'Replace worn rollers (upper, center, and lower). Lubricate track with white lithium grease. Replace latch assembly if door won\'t fully engage. Adjust striker plate for proper door alignment. Power door cable may need replacement if frayed.',
    severity: 'medium',
    symptoms: ['Door hard to slide open', 'Squeaking noise when opening', 'Door doesn\'t fully close', 'Door bounces back when closing', 'Power door stops mid-travel'],
    affectedSystems: ['Sliding door mechanism', 'Door latch'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 450
  },

  // Borrego (2009-2010)
  {
    id: 'kia-borrego-transfer-case-noise-2009',
    make: 'Kia', model: 'Borrego', years: yrs(2009, 2010),
    category: 'drivetrain',
    title: 'Transfer Case Chain Stretch and Noise',
    description: 'The BorgWarner transfer case chain stretches over time, causing a whining or rattling noise during acceleration. In severe cases, the chain can skip, causing a sudden jolt. The transfer case fluid breaks down faster than expected.',
    solution: 'Drain and refill transfer case fluid with Kia-specified fluid every 30,000 miles as preventive maintenance. If chain noise is present, rebuild or replace transfer case. Aftermarket chain kits are available.',
    severity: 'high',
    symptoms: ['Whining noise in 4WD', 'Rattling during acceleration', 'Jolt or jerk in drivetrain', 'Vibration at highway speed in 4WD'],
    affectedSystems: ['Transfer case', '4WD system'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 1500
  },
  {
    id: 'kia-borrego-power-steering-cooler-2009',
    make: 'Kia', model: 'Borrego', years: yrs(2009, 2010),
    category: 'steering',
    title: 'Power Steering Cooler Line Leak',
    description: 'The power steering fluid cooler lines develop leaks at the crimped fittings, causing fluid loss and heavy steering. The cooler is mounted in front of the AC condenser and is exposed to road debris damage.',
    solution: 'Replace power steering cooler and lines. Flush system with fresh power steering fluid. Inspect steering rack seals for damage from running low on fluid. Top off and bleed system by turning wheel lock to lock with engine running.',
    severity: 'medium',
    symptoms: ['Power steering fluid leak', 'Heavy steering', 'Groaning noise when turning', 'Low fluid level in reservoir', 'Fluid spray on undercarriage'],
    affectedSystems: ['Power steering', 'Steering cooler'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 450
  },

  // Spectra (2000-2009)
  {
    id: 'kia-spectra-ignition-coil-2000',
    make: 'Kia', model: 'Spectra', years: yrs(2000, 2009),
    category: 'engine',
    title: 'Ignition Coil Pack Failure Causing Misfire',
    description: 'Ignition coil packs (coil-on-plug design on later models, distributor coil on earlier) fail causing engine misfires, rough running, and poor fuel economy. Heat cycling weakens the coil insulation leading to internal shorts.',
    solution: 'Replace failed ignition coil(s). Replace spark plugs at the same time. For 2004+ models, consider replacing all four coil-on-plug units as they tend to fail in sequence. Use NGK or Denso quality replacements.',
    severity: 'medium',
    symptoms: ['Engine misfire', 'Rough idle', 'Check engine light flashing', 'Loss of power', 'Poor fuel economy'],
    affectedSystems: ['Ignition system', 'Engine management'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
    estimatedCostLow: 80, estimatedCostHigh: 300
  },
  {
    id: 'kia-spectra-engine-mount-2000',
    make: 'Kia', model: 'Spectra', years: yrs(2000, 2009),
    category: 'engine',
    title: 'Front Engine Mount Hydraulic Failure',
    description: 'The hydraulic-filled front engine mount ruptures, leaking fluid and allowing excessive engine movement. Causes vibration at idle, clunking when shifting between drive and reverse, and increased NVH.',
    solution: 'Replace front engine mount. Inspect transmission mount and rear torque strut mount at the same time — they often wear together. Use OEM or quality aftermarket hydraulic mount (not solid rubber). Support engine with jack during replacement.',
    severity: 'medium',
    symptoms: ['Excessive vibration at idle', 'Clunk shifting into gear', 'Engine rocks visibly', 'Vibration felt through steering wheel', 'Thud during acceleration'],
    affectedSystems: ['Engine mounts', 'Drivetrain'],
    dtcCodes: [],
    estimatedCostLow: 120, estimatedCostHigh: 300
  },

  // Amanti (2004-2009)
  {
    id: 'kia-amanti-timing-belt-tensioner-2004',
    make: 'Kia', model: 'Amanti', years: yrs(2004, 2009),
    category: 'engine',
    title: 'Timing Belt Tensioner Bearing Failure',
    description: 'The hydraulic timing belt tensioner and idler pulley bearings fail, causing timing belt noise and potential catastrophic engine damage if the belt jumps or breaks. The 3.5L and 3.8L V6 are interference engines.',
    solution: 'Replace timing belt, tensioner, idler pulleys, and water pump as a complete kit every 60,000 miles. Do not skip the water pump — it is driven by the timing belt and is accessible during this service. Use Gates or Continental kits.',
    severity: 'high',
    symptoms: ['Squealing from timing cover area', 'Rhythmic ticking noise', 'Engine runs rough if belt has jumped', 'High-pitched whine at idle'],
    affectedSystems: ['Timing belt system', 'Valvetrain'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 800
  },
  {
    id: 'kia-amanti-ac-compressor-clutch-2004',
    make: 'Kia', model: 'Amanti', years: yrs(2004, 2009),
    category: 'other',
    title: 'A/C Compressor Clutch and Coil Failure',
    description: 'The A/C compressor clutch coil burns out or the clutch plate air gap increases beyond specification, preventing the compressor from engaging. Results in no cold air from the A/C system. Common in hot climates.',
    solution: 'Replace A/C compressor clutch assembly (clutch plate, coil, and pulley can be replaced without removing compressor). If compressor has internal debris, replace entire compressor, receiver/drier, and flush system. Evacuate and recharge with R-134a.',
    severity: 'medium',
    symptoms: ['A/C blows warm air', 'Clicking from compressor area', 'A/C works intermittently', 'Compressor clutch not engaging'],
    affectedSystems: ['A/C compressor', 'Climate control'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 700
  },

  // Cadenza (2014-2020)
  {
    id: 'kia-cadenza-dcm-surge-2014',
    make: 'Kia', model: 'Cadenza', years: yrs(2014, 2020),
    category: 'transmission',
    title: 'Harsh Downshift and Surge at Low Speed',
    description: 'The 6-speed automatic transmission (early models) or 8-speed (2017+) exhibits harsh downshifts when decelerating to a stop and occasional surging during parking lot maneuvers. The transmission control module shift calibration is the primary cause.',
    solution: 'Have dealer reflash transmission control module with latest software calibration. Perform transmission fluid exchange with Kia-approved SP-IV RR fluid. If surging persists, torque converter replacement may be needed on pre-2017 models.',
    severity: 'medium',
    symptoms: ['Harsh downshift when stopping', 'Surge at low speed', 'Jerky parking lot driving', 'Transmission clunk going over bumps in gear'],
    affectedSystems: ['Automatic transmission', 'Transmission control module'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 600
  },
  {
    id: 'kia-cadenza-panoroof-creak-2014',
    make: 'Kia', model: 'Cadenza', years: yrs(2014, 2020),
    category: 'body',
    title: 'Panoramic Sunroof Creak and Water Leak',
    description: 'The panoramic sunroof develops creaking noises from the glass panel shifting in its frame, and the drain tubes clog causing water to leak into the headliner. The front drain tubes are most prone to clogging with debris.',
    solution: 'Clean sunroof drain tubes by blowing compressed air through them from the roof opening. Lubricate sunroof seals and rails with Krytox or silicone grease. If headliner is water-stained, dry thoroughly to prevent mold. Check for drain tube kinks.',
    severity: 'medium',
    symptoms: ['Creaking noise from roof', 'Water dripping from headliner', 'Musty smell in cabin', 'Water in footwell after rain', 'Stained headliner near sunroof'],
    affectedSystems: ['Panoramic sunroof', 'Sunroof drains'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 400
  }
];

async function main() {
  console.log(`Creating ${issues.length} new issues...`);
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

      await prisma.knownIssue.create({
        data: {
          id: issue.id,
          make: issue.make,
          model: issue.model,
          years: issue.years,
          category: issue.category,
          title: issue.title,
          description: issue.description,
          solution: issue.solution,
          severity: issue.severity,
          confidence: 'medium',
          symptoms: issue.symptoms,
          affectedSystems: issue.affectedSystems,
          dtcCodes: issue.dtcCodes,
          estimatedCostLow: issue.estimatedCostLow,
          estimatedCostHigh: issue.estimatedCostHigh,
          citations: [],
          communityRecommendations: [],
          status: 'published'
        }
      });
      console.log(`  OK: ${issue.id}`);
      created++;
    } catch (err) {
      console.error(`  FAIL: ${issue.id} — ${err.message}`);
    }
  }

  // Verify counts
  console.log(`\nDone: ${created} created, ${skipped} skipped\n`);

  const models = [
    { make: 'Hyundai', models: ['Scoupe','Tiburon','Veracruz','Entourage','XG350','Excel','Genesis','Azera','Equus','Venue'] },
    { make: 'Audi', models: ['A5 Sportback','Q8 e-tron','100','90','A4 allroad','Q5 Sportback','A4 Avant','A6 allroad'] },
    { make: 'Kia', models: ['K900','Sephia','Sedona','Borrego','Spectra','Amanti','Cadenza'] }
  ];

  console.log('=== VERIFICATION ===');
  for (const { make, models: modelList } of models) {
    for (const model of modelList) {
      const count = await prisma.knownIssue.countDocuments
        ? await prisma.knownIssue.count({ where: { make, model } })
        : await prisma.knownIssue.count({ where: { make, model } });
      const status = count === 5 ? 'OK' : `MISMATCH (${count})`;
      console.log(`  ${make} ${model}: ${count} issues — ${status}`);
    }
  }

  const total = await prisma.knownIssue.count();
  console.log(`\nTotal issues in DB: ${total}`);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
