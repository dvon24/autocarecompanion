const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
const existingIds = new Set(data.issues.map(function(i) { return i.id; }));

const newIssues = [
  // ===== VOLKSWAGEN =====

  // VW Passat - 1.8T sludge issue (1998-2005)
  {
    id: 'vw-passat-18t-oil-sludge-1998',
    make: 'Volkswagen', model: 'Passat',
    title: '1.8T Engine Oil Sludge Formation',
    description: 'The 1.8T turbocharged engine in the B5/B5.5 Passat is notorious for oil sludge buildup that can block oil passages and starve the turbo and camshaft bearings. Extended oil change intervals and the small oil capacity of the 1.8T contribute to this issue. Can lead to catastrophic engine failure if not addressed.',
    category: 'engine', severity: 'critical',
    years: { start: 1998, end: 2005 },
    estimatedCost: { min: 500, max: 4000 },
    symptoms: ['Oil pressure warning light', 'Turbo whine or failure', 'Ticking noise from top end', 'Oil light flickering at idle', 'Dark thick residue on oil cap'],
    commonFixes: ['Engine flush treatment ($100-$300)', 'Oil pickup tube cleaning ($500-$1000)', 'Short oil change intervals (5000 miles max)', 'Engine replacement if severely damaged ($3000-$4000)'],
    dtcCodes: ['P0016', 'P0011', 'P0021']
  },
  {
    id: 'vw-passat-timing-belt-failure-1998',
    make: 'Volkswagen', model: 'Passat',
    title: 'Timing Belt and Water Pump Failure',
    description: 'The B5/B5.5 Passat with the 1.8T and 2.8L V6 requires timing belt replacement at strict intervals. The water pump is driven by the timing belt and can seize, causing the belt to skip or snap. This is an interference engine, so belt failure causes catastrophic valve damage.',
    category: 'engine', severity: 'critical',
    years: { start: 1998, end: 2005 },
    estimatedCost: { min: 800, max: 4500 },
    symptoms: ['Coolant leak from water pump', 'Belt cracking or fraying', 'Engine misfire after timing skip', 'Rattling on cold start'],
    commonFixes: ['Timing belt and water pump kit ($800-$1200 including labor)', 'Tensioner and roller replacement (included in kit)', 'Engine rebuild if belt snapped ($3000-$4500)'],
    dtcCodes: ['P0016', 'P0341', 'P0300']
  },

  // VW Tiguan - water pump issues
  {
    id: 'vw-tiguan-water-pump-leak-2009',
    make: 'Volkswagen', model: 'Tiguan',
    title: 'Water Pump and Thermostat Housing Leak',
    description: 'The first-gen Tiguan with the 2.0T TSI engine develops coolant leaks from the water pump and thermostat housing assembly. The plastic thermostat housing is prone to cracking, and the water pump impeller can degrade over time.',
    category: 'cooling', severity: 'moderate',
    years: { start: 2009, end: 2017 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: ['Coolant loss without visible external leak', 'Overheating warning', 'Sweet smell from engine bay', 'Coolant puddle under car'],
    commonFixes: ['Water pump replacement ($400-$800)', 'Thermostat housing replacement ($300-$600)', 'Coolant system pressure test and repair'],
    dtcCodes: ['P0128', 'P00B7']
  },
  {
    id: 'vw-tiguan-timing-chain-tensioner-2009',
    make: 'Volkswagen', model: 'Tiguan',
    title: '2.0T TSI Timing Chain Tensioner Failure',
    description: 'Early 2.0T TSI engines in the Tiguan have a known timing chain tensioner issue. The original tensioner design can lose tension, especially after the engine sits overnight, causing chain rattle on startup and potential chain skip.',
    category: 'engine', severity: 'high',
    years: { start: 2009, end: 2013 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['Rattling noise on cold start', 'Check engine light', 'Rough running after cold start', 'Timing chain noise that fades after warmup'],
    commonFixes: ['Updated timing chain tensioner ($1500-$2500 with labor)', 'Full timing chain kit replacement ($2000-$3000)', 'Updated VW revision tensioner part'],
    dtcCodes: ['P0016', 'P0017', 'P0341', 'P0300']
  },

  // VW Golf additions
  {
    id: 'vw-golf-mk4-window-regulator-1999',
    make: 'Volkswagen', model: 'Golf',
    title: 'MK4 Power Window Regulator Failure',
    description: 'The MK4 Golf and GTI are notorious for power window regulator failures. The plastic clips that hold the window to the regulator cable break, causing the window to drop into the door or become stuck.',
    category: 'electrical', severity: 'low',
    years: { start: 1999, end: 2006 },
    estimatedCost: { min: 100, max: 400 },
    symptoms: ['Window drops into door', 'Window tilts at angle', 'Grinding noise when operating window', 'Window moves slowly or stops mid-travel'],
    commonFixes: ['Window regulator replacement ($100-$250 parts)', 'Regulator clip repair kit ($20-$50)', 'Full regulator and motor assembly ($200-$400)'],
    dtcCodes: []
  },
  {
    id: 'vw-golf-mk7-water-pump-2015',
    make: 'Volkswagen', model: 'Golf',
    title: 'MK7 2.0T Water Pump Failure',
    description: 'The MK7 Golf GTI/R with the EA888 Gen 3 engine has issues with premature water pump failure. The electric water pump can fail internally, causing overheating. VW extended warranty coverage on some VINs.',
    category: 'cooling', severity: 'moderate',
    years: { start: 2015, end: 2021 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: ['Coolant temperature warning', 'Overheating', 'Coolant loss', 'Water pump warning message'],
    commonFixes: ['Electric water pump replacement ($500-$900)', 'Thermostat replacement if also failed ($200-$400)', 'Check for VW extended warranty coverage'],
    dtcCodes: ['P26B2', 'P00B7', 'P0128']
  },

  // VW Jetta additions
  {
    id: 'vw-jetta-25-intake-manifold-2005',
    make: 'Volkswagen', model: 'Jetta',
    title: '2.5L 5-Cylinder Intake Manifold Runner Failure',
    description: 'The 2.5L inline-5 engine in the MK5 Jetta develops intake manifold runner flap failures. The plastic flaps inside the manifold crack or stick, causing rough idle, power loss, and check engine lights.',
    category: 'engine', severity: 'moderate',
    years: { start: 2005, end: 2014 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Rough idle', 'Loss of power', 'Check engine light', 'Rattling from intake area', 'Poor fuel economy'],
    commonFixes: ['Intake manifold replacement ($300-$600)', 'Runner flap delete/repair ($150-$300)', 'Updated manifold design from VW'],
    dtcCodes: ['P2015', 'P2004', 'P2006']
  },

  // VW Corrado additions
  {
    id: 'vw-corrado-g60-supercharger-1990',
    make: 'Volkswagen', model: 'Corrado',
    title: 'G60 Supercharger Scroll Housing Wear',
    description: 'The G-Lader scroll-type supercharger in the Corrado G60 is known for internal apex strip wear. The supercharger requires rebuilding at regular intervals (60,000-80,000 miles). Wear causes loss of boost and decreased performance.',
    category: 'engine', severity: 'high',
    years: { start: 1990, end: 1992 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: ['Loss of boost pressure', 'Supercharger whine increasing', 'Power loss', 'Oily residue in intake tract', 'Boost gauge showing low readings'],
    commonFixes: ['G-Lader rebuild with new apex strips ($800-$1500)', 'Upgraded apex strip material (Teflon-based)', 'Supercharger replacement ($1500-$2500)'],
    dtcCodes: []
  },

  // VW Cabrio additions
  {
    id: 'vw-cabrio-convertible-top-leak-1995',
    make: 'Volkswagen', model: 'Cabrio',
    title: 'Convertible Top Seal Leaks and Drain Clogs',
    description: 'The VW Cabrio/Cabriolet convertible top develops leaks at the seal edges and header rail. The drain channels in the convertible top frame clog with debris, causing water to pool and leak into the cabin, damaging carpets and electronics.',
    category: 'body', severity: 'moderate',
    years: { start: 1995, end: 2002 },
    estimatedCost: { min: 100, max: 1500 },
    symptoms: ['Water inside cabin after rain', 'Musty smell from carpet', 'Wet trunk', 'Electrical issues from water intrusion'],
    commonFixes: ['Clean drain channels ($50-$100)', 'Replace convertible top seals ($200-$500)', 'Full convertible top replacement ($1000-$1500)'],
    dtcCodes: []
  },

  // VW Eurovan additions
  {
    id: 'vw-eurovan-transmission-failure-1993',
    make: 'Volkswagen', model: 'Eurovan',
    title: 'Automatic Transmission Premature Failure',
    description: 'The Eurovan automatic transmission (both the 4-speed and later 5-speed) is known for premature failure, especially in vehicles used for towing or heavily loaded camping conversions. Torque converter issues and internal wear are common.',
    category: 'transmission', severity: 'high',
    years: { start: 1993, end: 2003 },
    estimatedCost: { min: 2500, max: 5000 },
    symptoms: ['Slipping between gears', 'Harsh shifts', 'Transmission warning light', 'Delayed engagement', 'Burning smell'],
    commonFixes: ['Transmission rebuild ($2500-$4000)', 'Transmission replacement ($3500-$5000)', 'Regular fluid changes every 30K miles', 'External transmission cooler addition'],
    dtcCodes: ['P0700', 'P0730', 'P0715']
  },

  // VW Fox addition
  {
    id: 'vw-fox-ignition-coil-failure-1987',
    make: 'Volkswagen', model: 'Fox',
    title: 'Ignition System and Distributor Failure',
    description: 'The VW Fox with the 1.8L 4-cylinder develops ignition system issues including distributor cap cracking, rotor failure, and ignition coil breakdown. These cause intermittent no-start conditions and misfires, especially in wet weather.',
    category: 'electrical', severity: 'moderate',
    years: { start: 1990, end: 1993 },
    estimatedCost: { min: 50, max: 300 },
    symptoms: ['Hard starting in wet weather', 'Intermittent misfire', 'No-start condition', 'Rough idle', 'Stalling'],
    commonFixes: ['Distributor cap and rotor replacement ($30-$60)', 'Ignition coil replacement ($50-$100)', 'Spark plug wire set ($40-$80)', 'Complete ignition tune-up ($150-$300)'],
    dtcCodes: []
  },

  // VW Arteon addition
  {
    id: 'vw-arteon-infotainment-glitches-2019',
    make: 'Volkswagen', model: 'Arteon',
    title: 'MIB3 Infotainment System Glitches and Freezing',
    description: 'The Arteon MIB3 infotainment system experiences frequent software glitches, touchscreen freezing, and connectivity issues with wireless Apple CarPlay and Android Auto. System occasionally requires hard reset.',
    category: 'electrical', severity: 'low',
    years: { start: 2019, end: 2024 },
    estimatedCost: { min: 0, max: 200 },
    symptoms: ['Touchscreen freezing', 'Bluetooth disconnections', 'CarPlay/Android Auto dropping', 'Backup camera black screen', 'Navigation lag'],
    commonFixes: ['Software update at dealer (free under warranty)', 'Hard reset procedure', 'Infotainment module replacement ($500-$1500 if out of warranty)'],
    dtcCodes: []
  },

  // VW Phaeton addition
  {
    id: 'vw-phaeton-air-suspension-failure-2004',
    make: 'Volkswagen', model: 'Phaeton',
    title: 'Air Suspension Compressor and Strut Failure',
    description: 'The Phaeton air suspension system is shared with the Bentley Continental and develops compressor failures and air strut leaks. Replacement parts are expensive, and the system is complex with multiple sensors and control modules.',
    category: 'suspension', severity: 'high',
    years: { start: 2004, end: 2006 },
    estimatedCost: { min: 800, max: 4000 },
    symptoms: ['Vehicle sagging on one corner', 'Air suspension warning light', 'Compressor running constantly', 'Harsh ride quality', 'Vehicle sitting low after sitting overnight'],
    commonFixes: ['Air strut replacement ($800-$1500 per corner)', 'Compressor replacement ($500-$1000)', 'Air line repair ($100-$300)', 'Conversion to coil springs ($1500-$2500)'],
    dtcCodes: []
  },

  // ===== VOLVO =====

  // Volvo 850 additions
  {
    id: 'volvo-850-transmission-shudder-1993',
    make: 'Volvo', model: '850',
    title: 'AW50-42 Automatic Transmission Shudder',
    description: 'The Volvo 850 automatic transmission (Aisin-Warner AW50-42) develops torque converter shudder during light acceleration and lockup. The valve body solenoids wear and the torque converter clutch material degrades, causing vibration.',
    category: 'transmission', severity: 'moderate',
    years: { start: 1993, end: 1997 },
    estimatedCost: { min: 500, max: 3000 },
    symptoms: ['Shudder during light acceleration', 'Vibration at highway speeds', 'Harsh 3-4 shift', 'Transmission slipping', 'Delayed engagement'],
    commonFixes: ['Transmission fluid and filter change ($150-$300)', 'Valve body rebuild ($500-$1000)', 'Torque converter replacement ($1000-$2000)', 'Transmission rebuild ($2000-$3000)'],
    dtcCodes: ['P0700', 'P0740', 'P0741']
  },
  {
    id: 'volvo-850-heater-core-leak-1993',
    make: 'Volvo', model: '850',
    title: 'Heater Core Leak Behind Dashboard',
    description: 'The Volvo 850 heater core is prone to developing leaks, which requires extensive dashboard disassembly to access. Coolant leaks onto the passenger floor and can damage the carpet and electronics underneath.',
    category: 'cooling', severity: 'moderate',
    years: { start: 1993, end: 1997 },
    estimatedCost: { min: 800, max: 1500 },
    symptoms: ['Sweet coolant smell inside cabin', 'Foggy windshield', 'Wet passenger footwell', 'Coolant level dropping', 'Poor heater performance'],
    commonFixes: ['Heater core replacement ($800-$1500 with labor)', 'Dashboard removal required for access', 'Coolant system flush after replacement'],
    dtcCodes: []
  },

  // Volvo V70 additions
  {
    id: 'volvo-v70-angle-gear-failure-2001',
    make: 'Volvo', model: 'V70',
    title: 'AWD Angle Gear Seal Leak and Failure',
    description: 'The Volvo V70 AWD system uses an angle gear (transfer case) that develops seal leaks. If the seal fails and fluid leaks out completely, the angle gear will overheat and seize, potentially damaging the transmission as well.',
    category: 'drivetrain', severity: 'high',
    years: { start: 2001, end: 2007 },
    estimatedCost: { min: 500, max: 2500 },
    symptoms: ['Oil leak under center of vehicle', 'Whining noise from center of car', 'AWD malfunction warning', 'Grinding noise during turns'],
    commonFixes: ['Angle gear seal replacement ($500-$800)', 'Angle gear replacement ($1500-$2500)', 'Regular angle gear fluid checks', 'Upgraded seal available from aftermarket'],
    dtcCodes: []
  },
  {
    id: 'volvo-v70-etm-failure-1999',
    make: 'Volvo', model: 'V70',
    title: 'Electronic Throttle Module (ETM) Failure',
    description: 'The P2 Volvo V70 (1999-2007) with the 5-cylinder turbocharged engine has a known electronic throttle module failure. The ETM develops internal wear causing erratic idle, stalling, and reduced power mode. Volvo extended warranty coverage on some model years.',
    category: 'engine', severity: 'high',
    years: { start: 1999, end: 2002 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: ['Check engine light', 'Erratic idle', 'Stalling at stops', 'Reduced power mode', 'Throttle response delay'],
    commonFixes: ['ETM replacement ($200-$400)', 'ETM cleaning and rebuild ($100-$200)', 'Check for Volvo extended warranty', 'Updated ETM design available'],
    dtcCodes: ['P1171', 'P0638', 'P0120']
  },

  // Volvo S70 additions
  {
    id: 'volvo-s70-transmission-failure-1998',
    make: 'Volvo', model: 'S70',
    title: 'AW50-42 Automatic Transmission Failure',
    description: 'Like the 850, the S70 shares the Aisin-Warner AW50-42 automatic transmission that develops internal failures. The valve body, solenoids, and torque converter are common failure points, especially in turbocharged models.',
    category: 'transmission', severity: 'high',
    years: { start: 1998, end: 2000 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: ['Harsh shifting', 'Transmission slipping', 'Delayed engagement from park', 'Check engine light with transmission codes', 'Shudder on acceleration'],
    commonFixes: ['Transmission fluid and filter change ($150-$300)', 'Valve body replacement ($800-$1500)', 'Transmission rebuild ($2500-$3500)', 'Solenoid pack replacement ($400-$800)'],
    dtcCodes: ['P0700', 'P0740', 'P0750', 'P0755']
  },
  {
    id: 'volvo-s70-pcv-system-failure-1998',
    make: 'Volvo', model: 'S70',
    title: 'PCV System Clogging and Oil Leaks',
    description: 'The Volvo S70 turbo and non-turbo 5-cylinder engines develop PCV (Positive Crankcase Ventilation) system blockage. The breather box/flame trap clogs, causing excessive crankcase pressure that pushes oil past gaskets and seals.',
    category: 'engine', severity: 'moderate',
    years: { start: 1998, end: 2000 },
    estimatedCost: { min: 100, max: 500 },
    symptoms: ['Oil leaks from valve cover', 'Oil consumption increase', 'Oil residue around turbo', 'Whistling noise from engine', 'Rough idle'],
    commonFixes: ['PCV breather box replacement ($50-$100 parts)', 'PCV system cleaning ($100-$200)', 'Valve cover gasket replacement ($200-$400)', 'Full PCV system overhaul ($300-$500)'],
    dtcCodes: ['P0171', 'P0505']
  },

  // Volvo 960 additions
  {
    id: 'volvo-960-transmission-limp-mode-1992',
    make: 'Volvo', model: '960',
    title: 'ZF 4HP22 Automatic Transmission Limp Mode',
    description: 'The Volvo 960 with the ZF 4HP22 automatic transmission develops electronic control issues that trigger limp mode (stuck in 3rd gear). The transmission control module connections corrode and internal solenoids wear.',
    category: 'transmission', severity: 'moderate',
    years: { start: 1992, end: 1997 },
    estimatedCost: { min: 200, max: 2500 },
    symptoms: ['Stuck in 3rd gear (limp mode)', 'Harsh 1-2 shift', 'No overdrive', 'Transmission warning light', 'Cold shift issues'],
    commonFixes: ['Transmission connector cleaning and repair ($100-$200)', 'Solenoid replacement ($300-$600)', 'Transmission fluid and filter change ($150-$300)', 'Transmission rebuild ($2000-$2500)'],
    dtcCodes: ['P0700', 'P0745']
  },

  // Volvo S60 additions
  {
    id: 'volvo-s60-rem-corrosion-2001',
    make: 'Volvo', model: 'S60',
    title: 'Rear Electronic Module (REM) Water Damage',
    description: 'The Volvo S60 P2 platform has the Rear Electronic Module (REM) located in the trunk area where it is susceptible to water intrusion from trunk seal leaks or condensation. Water damage causes intermittent electrical failures in rear lighting, fuel pump, and other circuits.',
    category: 'electrical', severity: 'moderate',
    years: { start: 2001, end: 2009 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: ['Intermittent rear light failures', 'Fuel pump relay issues', 'Trunk light not working', 'Random electrical faults', 'BCM error codes'],
    commonFixes: ['REM relocation or waterproofing ($100-$200)', 'REM replacement ($300-$600)', 'Trunk seal replacement ($100-$200)', 'REM circuit board repair ($200-$400)'],
    dtcCodes: []
  },

  // Volvo XC60 additions
  {
    id: 'volvo-xc60-oil-trap-failure-2010',
    make: 'Volvo', model: 'XC60',
    title: 'PCV Oil Trap/Separator Failure',
    description: 'The Volvo XC60 with the 3.0L and 3.2L inline-6 engines develops oil trap (PCV separator) failures. The oil trap membrane degrades, causing excessive oil consumption, rough idle, and oil leaks from pressurized seals.',
    category: 'engine', severity: 'moderate',
    years: { start: 2010, end: 2015 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: ['Increased oil consumption', 'Rough idle', 'Check engine light', 'Oil leaks from seals', 'Whistling from engine area'],
    commonFixes: ['Oil trap/PCV separator replacement ($200-$400)', 'Valve cover gasket replacement ($200-$400)', 'Full PCV system service ($400-$600)'],
    dtcCodes: ['P0171', 'P0174', 'P0505']
  },

  // Volvo 240 additions
  {
    id: 'volvo-240-overdrive-relay-failure-1990',
    make: 'Volvo', model: '240',
    title: 'M46 Overdrive Relay and Solenoid Failure',
    description: 'The Volvo 240 with the M46 manual transmission and overdrive unit develops relay and solenoid failures. The overdrive unit stops engaging, leaving the car without its highway cruising gear.',
    category: 'transmission', severity: 'low',
    years: { start: 1990, end: 1993 },
    estimatedCost: { min: 50, max: 500 },
    symptoms: ['Overdrive not engaging', 'Overdrive light not illuminating', 'Intermittent overdrive operation', 'Higher RPMs at highway speed'],
    commonFixes: ['Overdrive relay replacement ($20-$50)', 'Overdrive solenoid replacement ($50-$150)', 'Overdrive unit rebuild ($300-$500)', 'Wiring repair to overdrive switch ($50-$100)'],
    dtcCodes: []
  },

  // Volvo 740 addition
  {
    id: 'volvo-740-fuel-injection-relay-1990',
    make: 'Volvo', model: '740',
    title: 'Fuel Injection Relay (White Relay) Failure',
    description: 'The Volvo 740 fuel injection relay (commonly called the white relay) is a known failure point. When it fails, the engine cranks but will not start because the fuel pump and fuel injectors lose power.',
    category: 'fuel', severity: 'moderate',
    years: { start: 1990, end: 1992 },
    estimatedCost: { min: 30, max: 150 },
    symptoms: ['Engine cranks but does not start', 'Intermittent no-start condition', 'Engine stalls while driving', 'Fuel pump not priming'],
    commonFixes: ['Fuel injection relay replacement ($30-$60)', 'Relay socket cleaning ($20-$50)', 'Carry a spare relay ($30)'],
    dtcCodes: []
  },

  // Volvo 940 addition
  {
    id: 'volvo-940-heater-fan-resistor-1991',
    make: 'Volvo', model: '940',
    title: 'Heater Blower Fan Resistor Pack Failure',
    description: 'The Volvo 940 blower motor resistor pack fails, causing the heater fan to only work on the highest speed setting. The resistor pack overheats and the solder connections crack.',
    category: 'electrical', severity: 'low',
    years: { start: 1991, end: 1998 },
    estimatedCost: { min: 40, max: 200 },
    symptoms: ['Blower only works on high speed', 'No blower on low speeds', 'Burning smell from dashboard vents', 'Intermittent fan operation'],
    commonFixes: ['Blower resistor pack replacement ($40-$80)', 'Blower motor replacement if also failed ($100-$200)', 'Connector repair if melted ($30-$60)'],
    dtcCodes: []
  },

  // Volvo V40 addition
  {
    id: 'volvo-v40-timing-belt-2000',
    make: 'Volvo', model: 'V40',
    title: 'Timing Belt Failure Risk',
    description: 'The Volvo V40 with the 1.9T engine (shared with Mitsubishi) is an interference engine requiring strict timing belt maintenance. Belt failure causes catastrophic valve and piston damage. The belt and tensioner must be replaced together.',
    category: 'engine', severity: 'critical',
    years: { start: 2000, end: 2004 },
    estimatedCost: { min: 400, max: 3000 },
    symptoms: ['Belt squealing', 'Timing cover oil leak', 'Rough running', 'Engine will not start if belt has snapped'],
    commonFixes: ['Timing belt and tensioner replacement ($400-$700)', 'Water pump replacement at same time ($100-$200 additional)', 'Engine rebuild if belt has failed ($2000-$3000)'],
    dtcCodes: ['P0016', 'P0340']
  },

  // Volvo V50 addition
  {
    id: 'volvo-v50-fuel-pump-module-2005',
    make: 'Volvo', model: 'V50',
    title: 'In-Tank Fuel Pump Module Failure',
    description: 'The Volvo V50 fuel pump module located inside the fuel tank can fail, causing starting issues and stalling. The fuel level sender can also fail separately, causing inaccurate fuel gauge readings.',
    category: 'fuel', severity: 'moderate',
    years: { start: 2005, end: 2011 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Long cranking before start', 'Stalling at low fuel levels', 'Inaccurate fuel gauge', 'Loss of power under load', 'Whining from fuel tank area'],
    commonFixes: ['Fuel pump module replacement ($300-$600)', 'Fuel level sender replacement ($150-$300)', 'Fuel filter replacement ($50-$100)'],
    dtcCodes: ['P0230', 'P0460', 'P0463']
  },

  // ===== BMW =====

  // BMW Z3 additions
  {
    id: 'bmw-z3-cooling-system-failure-1996',
    make: 'BMW', model: 'Z3',
    title: 'Cooling System Component Failures',
    description: 'The BMW Z3 shares the E36/E46 cooling system which is notorious for plastic component failures. The expansion tank, water pump impeller, thermostat housing, and radiator end tanks are all plastic and become brittle with age and heat cycling.',
    category: 'cooling', severity: 'high',
    years: { start: 1996, end: 2002 },
    estimatedCost: { min: 300, max: 1500 },
    symptoms: ['Coolant loss', 'Overheating', 'Cracked expansion tank', 'Coolant leak from front of engine', 'Temperature gauge fluctuation'],
    commonFixes: ['Complete cooling system overhaul ($800-$1500)', 'Expansion tank replacement ($100-$200)', 'Water pump with metal impeller ($200-$400)', 'Thermostat and housing replacement ($100-$250)'],
    dtcCodes: ['P0128', 'P0217']
  },
  {
    id: 'bmw-z3-rear-subframe-cracking-1996',
    make: 'BMW', model: 'Z3',
    title: 'Rear Subframe Mounting Point Cracks',
    description: 'The BMW Z3 with the M52/M54 6-cylinder engines can develop cracks at the rear subframe mounting points in the trunk floor. The torque from the engine combined with road stress causes the sheet metal to crack around the subframe bolts.',
    category: 'body', severity: 'high',
    years: { start: 1996, end: 2002 },
    estimatedCost: { min: 1000, max: 3000 },
    symptoms: ['Clunking from rear over bumps', 'Rear end feeling loose', 'Visible cracks in trunk floor', 'Uneven tire wear rear'],
    commonFixes: ['Subframe reinforcement plates ($200-$400 parts)', 'Professional welding and reinforcement ($1000-$2000)', 'Subframe removal and floor repair ($2000-$3000)'],
    dtcCodes: []
  },

  // BMW i5 addition
  {
    id: 'bmw-i5-software-glitches-2024',
    make: 'BMW', model: 'i5',
    title: 'iDrive 8.5 Software Bugs and EV System Errors',
    description: 'The BMW i5 has experienced various software-related issues with the iDrive 8.5 system and EV powertrain management. Issues include phantom error messages, inconsistent range estimates, charging session failures, and infotainment system freezes.',
    category: 'electrical', severity: 'low',
    years: { start: 2024, end: 2026 },
    estimatedCost: { min: 0, max: 200 },
    symptoms: ['Phantom drivetrain error messages', 'Inconsistent range estimates', 'DC fast charging session failures', 'iDrive screen freezing', 'Climate control resets'],
    commonFixes: ['Software update at dealer (free under warranty)', 'iDrive system reset', 'Battery management software recalibration'],
    dtcCodes: []
  },

  // BMW i7 addition
  {
    id: 'bmw-i7-air-suspension-calibration-2023',
    make: 'BMW', model: 'i7',
    title: 'Air Suspension Calibration and Sensor Issues',
    description: 'The BMW i7 air suspension system can develop calibration errors and ride height sensor issues. The heavy battery pack combined with the adaptive air suspension creates complex load management that occasionally faults.',
    category: 'suspension', severity: 'moderate',
    years: { start: 2023, end: 2026 },
    estimatedCost: { min: 0, max: 2000 },
    symptoms: ['Uneven ride height', 'Suspension warning messages', 'Harsh ride on one corner', 'Vehicle sitting low after parking overnight'],
    commonFixes: ['Suspension system recalibration at dealer (warranty)', 'Ride height sensor replacement ($200-$500)', 'Air spring replacement ($500-$1500 per corner)'],
    dtcCodes: []
  },

  // ===== AUDI =====

  // Audi S4 additions
  {
    id: 'audi-s4-b5-timing-chain-2000',
    make: 'Audi', model: 'S4',
    title: 'B5 S4 2.7T Timing Chain Guide Failure',
    description: 'The B5 Audi S4 with the 2.7T twin-turbo V6 has timing chain guides that deteriorate, causing chain rattle and eventual timing chain skip. The engine must be removed from the car to replace the chains and guides, making this a very expensive repair.',
    category: 'engine', severity: 'critical',
    years: { start: 2000, end: 2002 },
    estimatedCost: { min: 3000, max: 6000 },
    symptoms: ['Timing chain rattle on cold start', 'Rattle that fades after warmup', 'Check engine light', 'Rough running', 'Metal debris in oil'],
    commonFixes: ['Full timing chain and guide replacement ($3000-$5000)', 'Engine removal required for rear chain access', 'Updated chain guide material available', 'Often done with turbo rebuild ($5000-$6000 total)'],
    dtcCodes: ['P0016', 'P0017', 'P0300']
  },

  // Audi S6 addition
  {
    id: 'audi-s6-c7-carbon-buildup-2013',
    make: 'Audi', model: 'S6',
    title: '4.0T Carbon Buildup on Intake Valves',
    description: 'The Audi S6 C7 with the 4.0T twin-turbo V8 (direct injection) develops carbon buildup on the intake valves since fuel does not wash over them. This reduces airflow and causes misfires, rough idle, and power loss over time.',
    category: 'engine', severity: 'moderate',
    years: { start: 2013, end: 2018 },
    estimatedCost: { min: 600, max: 1200 },
    symptoms: ['Rough idle', 'Misfires at idle', 'Power loss', 'Poor fuel economy', 'Hesitation on acceleration'],
    commonFixes: ['Walnut shell blasting of intake valves ($600-$1000)', 'Chemical cleaning treatment ($200-$400)', 'Catch can installation to reduce buildup ($200-$400)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304']
  },

  // Audi RS5 addition
  {
    id: 'audi-rs5-b8-carbon-buildup-2013',
    make: 'Audi', model: 'RS5',
    title: '4.2L V8 Carbon Buildup and High-Rev Issues',
    description: 'The Audi RS5 B8 with the naturally aspirated 4.2L V8 develops significant carbon buildup on the intake valves due to direct injection. The high-revving nature of this engine makes carbon buildup particularly impactful on performance.',
    category: 'engine', severity: 'moderate',
    years: { start: 2013, end: 2015 },
    estimatedCost: { min: 800, max: 1500 },
    symptoms: ['Power loss from original spec', 'Rough idle', 'Misfires', 'Hesitation at lower RPMs', 'Reduced throttle response'],
    commonFixes: ['Walnut shell blasting ($800-$1200)', 'Intake manifold removal and manual cleaning ($600-$1000)', 'Oil catch can installation ($200-$400)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308']
  },

  // Audi 90 addition
  {
    id: 'audi-90-hydraulic-lifter-noise-1990',
    make: 'Audi', model: '90',
    title: 'Hydraulic Valve Lifter Noise',
    description: 'The Audi 90 with the 2.3L and 2.8L engines develops noisy hydraulic valve lifters, especially on cold starts. The lifters bleed down overnight and tick until oil pressure builds up. Worn lifters may tick continuously.',
    category: 'engine', severity: 'low',
    years: { start: 1990, end: 1995 },
    estimatedCost: { min: 100, max: 800 },
    symptoms: ['Ticking noise on cold start', 'Ticking that fades after warmup', 'Persistent ticking if lifters are worn', 'Slightly rough idle'],
    commonFixes: ['Use correct weight synthetic oil', 'Hydraulic lifter replacement ($400-$800)', 'Engine flush to clear oil passages ($100-$200)'],
    dtcCodes: []
  },

  // Audi 100 addition
  {
    id: 'audi-100-auto-transmission-issues-1990',
    make: 'Audi', model: '100',
    title: 'Automatic Transmission Harsh Shifting',
    description: 'The Audi 100/200 automatic transmission develops harsh shifting patterns and delayed engagement. The multi-plate clutches and valve body solenoids wear, particularly in higher-mileage examples.',
    category: 'transmission', severity: 'moderate',
    years: { start: 1990, end: 1994 },
    estimatedCost: { min: 300, max: 2500 },
    symptoms: ['Harsh 2-3 upshift', 'Delayed engagement from park', 'Slipping under hard acceleration', 'Transmission fluid discoloration'],
    commonFixes: ['Transmission fluid and filter change ($200-$400)', 'Valve body rebuild ($500-$1000)', 'Transmission rebuild ($2000-$2500)'],
    dtcCodes: ['P0700', 'P0730']
  },

  // Audi Cabriolet addition
  {
    id: 'audi-cabriolet-top-hydraulic-failure-1994',
    make: 'Audi', model: 'Cabriolet',
    title: 'Convertible Top Hydraulic System Failure',
    description: 'The Audi Cabriolet hydraulic convertible top system develops leaks in the hydraulic cylinders, lines, and pump. The system uses a complex hydraulic mechanism that is expensive to repair when it fails.',
    category: 'body', severity: 'moderate',
    years: { start: 1994, end: 1998 },
    estimatedCost: { min: 500, max: 2000 },
    symptoms: ['Convertible top moves slowly', 'Top stops mid-cycle', 'Hydraulic fluid leak', 'Top will not latch properly', 'Motor running but top not moving'],
    commonFixes: ['Hydraulic fluid top-off and bleed ($100-$200)', 'Hydraulic cylinder rebuild ($500-$800)', 'Hydraulic pump replacement ($500-$1000)', 'Hydraulic line replacement ($200-$400)'],
    dtcCodes: []
  },

  // Audi RS Q8 addition
  {
    id: 'audi-rsq8-air-suspension-leak-2020',
    make: 'Audi', model: 'RS Q8',
    title: 'Adaptive Air Suspension Air Spring Leaks',
    description: 'The RS Q8 adaptive air suspension system can develop slow air leaks in the air springs, causing the vehicle to sag overnight. The heavy vehicle weight and sport-tuned suspension put additional stress on the air spring components.',
    category: 'suspension', severity: 'moderate',
    years: { start: 2020, end: 2026 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: ['Vehicle sagging on one corner overnight', 'Suspension warning light', 'Compressor running frequently', 'Uneven ride height'],
    commonFixes: ['Air spring replacement ($800-$1500 per corner)', 'Air line connection repair ($100-$300)', 'Compressor replacement if overworked ($500-$1000)'],
    dtcCodes: []
  },

  // Audi RS4 addition
  {
    id: 'audi-rs4-b7-carbon-buildup-2007',
    make: 'Audi', model: 'RS4',
    title: '4.2L V8 Carbon Buildup on Intake Valves',
    description: 'The B7 Audi RS4 with the high-revving 4.2L FSI V8 develops significant carbon deposits on the intake valves due to direct fuel injection. This high-performance engine is particularly affected because of its FSI system design.',
    category: 'engine', severity: 'moderate',
    years: { start: 2007, end: 2008 },
    estimatedCost: { min: 800, max: 1500 },
    symptoms: ['Power loss', 'Rough idle', 'Misfires especially at idle', 'Hesitation at low RPMs', 'Decreased throttle response'],
    commonFixes: ['Walnut shell blasting ($800-$1200)', 'Manual carbon cleaning ($600-$1000)', 'Oil catch can installation ($200-$400)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308']
  },

  // ===== MINI =====

  // MINI Countryman addition
  {
    id: 'mini-countryman-water-pump-leak-2011',
    make: 'MINI', model: 'Countryman',
    title: 'Electric Water Pump and Thermostat Failure',
    description: 'The MINI Countryman with the N18 turbocharged engine develops electric water pump failures. The pump can fail internally without warning, leading to rapid overheating. The thermostat housing is also plastic and prone to cracking.',
    category: 'cooling', severity: 'high',
    years: { start: 2011, end: 2016 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: ['Overheating warning', 'Coolant loss', 'No heat from heater', 'Temperature gauge spiking', 'Coolant warning message'],
    commonFixes: ['Electric water pump replacement ($400-$700)', 'Thermostat housing replacement ($200-$400)', 'Coolant system bleed and flush ($100-$200)'],
    dtcCodes: ['P26B2', 'P0128', 'P00B7']
  },

  // MINI Clubman addition
  {
    id: 'mini-clubman-clutch-failure-2008',
    make: 'MINI', model: 'Clubman',
    title: 'Premature Clutch and Dual-Mass Flywheel Failure',
    description: 'The MINI Clubman with the manual transmission develops premature clutch wear and dual-mass flywheel failure, especially in turbocharged models. The compact clutch design and high torque output contribute to early wear.',
    category: 'transmission', severity: 'moderate',
    years: { start: 2008, end: 2014 },
    estimatedCost: { min: 1200, max: 2500 },
    symptoms: ['Clutch slipping under load', 'Chattering on engagement', 'Rattling at idle in neutral', 'Difficulty shifting', 'Burning clutch smell'],
    commonFixes: ['Clutch kit replacement ($800-$1500)', 'Dual-mass flywheel replacement ($400-$800)', 'Complete clutch and flywheel package ($1200-$2500)'],
    dtcCodes: []
  },

  // MINI Convertible addition
  {
    id: 'mini-convertible-top-drain-clog-2005',
    make: 'MINI', model: 'Convertible',
    title: 'Convertible Top Drain Blockage and Water Leaks',
    description: 'The MINI Convertible top drainage system clogs with debris, causing water to back up and leak into the cabin. Water intrusion can damage electronics in the footwell and cause musty odors.',
    category: 'body', severity: 'moderate',
    years: { start: 2005, end: 2015 },
    estimatedCost: { min: 50, max: 500 },
    symptoms: ['Wet carpet in footwells', 'Musty smell', 'Water dripping from headliner', 'Electrical issues from water damage'],
    commonFixes: ['Drain tube clearing ($50-$100)', 'Top seal replacement ($200-$400)', 'Drain tube rerouting ($100-$200)'],
    dtcCodes: []
  }
];

let added = 0;
newIssues.forEach(function(issue) {
  if (existingIds.has(issue.id)) {
    console.log('  SKIP (duplicate): ' + issue.id);
    return;
  }
  data.issues.push(issue);
  existingIds.add(issue.id);
  added++;
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('European Deep Research Additions:');
console.log('  Added: ' + added + ' issues');
console.log('  Total issues now: ' + data.issues.length);
console.log('  Makes covered: Volkswagen, Volvo, BMW, Audi, MINI');
