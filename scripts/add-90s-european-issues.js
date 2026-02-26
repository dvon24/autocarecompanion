const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const existingIds = new Set(data.issues.map(function(i) { return i.id; }));

const newIssues = [
  // ============ AUDI ============
  {
    id: 'audi-90-cooling-system-failure-1990',
    make: 'Audi', model: '90',
    title: 'Cooling System Component Failure',
    description: 'The Audi 90 2.8L V6 develops cooling system failures including water pump leaks, thermostat housing cracks, and auxiliary coolant pump failure. These failures can lead to overheating and head gasket damage.',
    category: 'cooling', severity: 'moderate',
    years: { start: 1990, end: 1995 },
    estimatedCost: { min: 300, max: 1000 },
    symptoms: ['Overheating', 'Coolant leak', 'Temperature gauge fluctuation', 'Low coolant warning'],
    commonFixes: ['Water pump replacement ($300-$600)', 'Thermostat housing replacement ($200-$400)', 'Auxiliary pump replacement ($150-$300)'],
    dtcCodes: ['P0128']
  },
  {
    id: 'audi-100-hydraulic-system-leak-1990',
    make: 'Audi', model: '100',
    title: 'Hydraulic Assist System Leak (Pentosin)',
    description: 'The Audi 100 uses a complex mineral oil hydraulic system (Pentosin) that powers steering, brakes, and self-leveling suspension. Hoses, pump seals, and rack seals develop leaks, causing loss of power assist to steering and brakes simultaneously.',
    category: 'steering', severity: 'high',
    years: { start: 1990, end: 1994 },
    estimatedCost: { min: 500, max: 2000 },
    symptoms: ['Heavy steering', 'Brake pedal hard', 'Hydraulic fluid under car', 'Suspension sag', 'Pump whining noise'],
    commonFixes: ['Hydraulic pump rebuild ($500-$1000)', 'Rack seal replacement ($600-$1200)', 'Pressure hose replacement ($200-$500)'],
    dtcCodes: []
  },
  {
    id: 'audi-cabriolet-top-hydraulic-failure-1994',
    make: 'Audi', model: 'Cabriolet',
    title: 'Convertible Top Hydraulic System Failure',
    description: 'The power convertible top uses a hydraulic system with pump, cylinders, and hoses that develop leaks with age. The top can become stuck in the up or down position when the system loses fluid or the pump fails.',
    category: 'body', severity: 'moderate',
    years: { start: 1994, end: 1998 },
    estimatedCost: { min: 500, max: 2500 },
    symptoms: ['Top not operating', 'Slow top movement', 'Hydraulic fluid leak', 'Top stuck partially open'],
    commonFixes: ['Hydraulic pump rebuild ($500-$1200)', 'Hydraulic cylinder replacement ($300-$800)', 'Complete system overhaul ($1500-$2500)'],
    dtcCodes: []
  },
  {
    id: 'audi-s4-b5-turbo-failure-2000',
    make: 'Audi', model: 'S4',
    title: 'B5 2.7T Turbocharger Failure',
    description: 'The B5 S4 2.7L twin-turbo V6 is notorious for turbo failure due to oil starvation from coked oil feed lines. Both KO3 turbos can fail, with the rear turbo being particularly difficult to access for replacement.',
    category: 'engine', severity: 'high',
    years: { start: 2000, end: 2002 },
    estimatedCost: { min: 2000, max: 5000 },
    symptoms: ['Blue/white smoke', 'Loss of boost', 'Whining from turbo', 'Oil consumption increase', 'Check engine light'],
    commonFixes: ['Turbo replacement pair ($2000-$4000)', 'Oil line replacement ($200-$400)', 'Upgrade to K04 turbos ($3000-$5000)'],
    dtcCodes: ['P0234', 'P0299']
  },
  {
    id: 'audi-s4-b6-timing-chain-2004',
    make: 'Audi', model: 'S4',
    title: 'B6/B7 4.2L V8 Timing Chain Tensioner Failure',
    description: 'The 4.2L V8 in the B6 and B7 S4 has timing chain guides and tensioners at the back of the engine (against the firewall) that wear prematurely. Replacement requires engine removal, making this one of the most expensive common repairs.',
    category: 'engine', severity: 'critical',
    years: { start: 2004, end: 2008 },
    estimatedCost: { min: 4000, max: 8000 },
    symptoms: ['Rattling on cold start', 'Check engine light', 'Timing codes', 'Engine stall', 'Rough running'],
    commonFixes: ['Timing chain, guide, and tensioner replacement - requires engine pull ($4000-$8000)', 'Complete engine replacement ($5000-$10000)'],
    dtcCodes: ['P0011', 'P0012', 'P0016', 'P0017', 'P0300']
  },
  {
    id: 'audi-s6-transmission-valve-body-2002',
    make: 'Audi', model: 'S6',
    title: 'ZF 5HP24 Tiptronic Transmission Valve Body Failure',
    description: 'The ZF 5HP24 Tiptronic automatic transmission develops valve body issues causing harsh shifts, delayed engagement, and eventually limp mode. The electronic solenoids and valve body bore wear are the primary failure modes.',
    category: 'transmission', severity: 'high',
    years: { start: 2002, end: 2004 },
    estimatedCost: { min: 1500, max: 4000 },
    symptoms: ['Harsh shifts', 'Delayed engagement', 'Transmission limp mode', 'Gear hunting on hills'],
    commonFixes: ['Valve body rebuild ($1500-$2500)', 'Transmission rebuild ($3000-$4000)', 'Solenoid replacement ($500-$1000)'],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },
  {
    id: 'audi-rs-q8-air-suspension-2020',
    make: 'Audi', model: 'RS Q8',
    title: 'Adaptive Air Suspension Compressor Failure',
    description: 'The adaptive air suspension system compressor can fail prematurely, especially in hot climates or with frequent off-road/sport mode use. The air springs can also develop leaks at the crimped connections.',
    category: 'suspension', severity: 'moderate',
    years: { start: 2020, end: 2026 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: ['Vehicle sitting low', 'Suspension warning light', 'Compressor running constantly', 'Uneven ride height'],
    commonFixes: ['Air suspension compressor replacement ($1500-$2500)', 'Air spring replacement ($800-$1500 per corner)'],
    dtcCodes: []
  },
  {
    id: 'audi-rs5-carbon-buildup-2018',
    make: 'Audi', model: 'RS5',
    title: 'Direct Injection Carbon Buildup on Intake Valves',
    description: 'The 2.9L twin-turbo V6 uses direct injection exclusively, which means no fuel washes over the intake valves to clean them. Carbon deposits accumulate on intake valves, reducing airflow and causing misfires and rough running.',
    category: 'engine', severity: 'moderate',
    years: { start: 2018, end: 2026 },
    estimatedCost: { min: 600, max: 1500 },
    symptoms: ['Rough idle', 'Reduced power', 'Misfires', 'Hesitation on acceleration'],
    commonFixes: ['Walnut blasting of intake valves ($600-$1200)', 'Chemical intake cleaning ($200-$400)'],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0301', 'P0302', 'P0303']
  },
  {
    id: 'audi-rs7-turbo-wastegate-2014',
    make: 'Audi', model: 'RS7',
    title: 'Turbo Wastegate Rattle and Carbon Buildup',
    description: 'The 4.0L twin-turbo V8 develops wastegate rattle at idle due to wear in the wastegate actuator mechanism. Combined with carbon buildup from direct injection, this can cause performance degradation.',
    category: 'engine', severity: 'moderate',
    years: { start: 2014, end: 2026 },
    estimatedCost: { min: 800, max: 3000 },
    symptoms: ['Rattling at idle', 'Wastegate flutter sound', 'Reduced boost', 'Check engine light'],
    commonFixes: ['Wastegate actuator replacement ($800-$1500)', 'Turbo replacement ($2000-$3000 per side)', 'Walnut blast for carbon ($600-$1200)'],
    dtcCodes: ['P0234', 'P0299', 'P2263']
  },
  {
    id: 'audi-a4-avant-cvt-multitronic-2002',
    make: 'Audi', model: 'A4 Avant',
    title: 'Multitronic CVT Transmission Failure',
    description: 'The Multitronic CVT used in front-wheel drive A4 Avants is prone to premature failure of the chain, pulleys, and control unit. This transmission has a poor reliability record and is expensive to repair.',
    category: 'transmission', severity: 'high',
    years: { start: 2002, end: 2008 },
    estimatedCost: { min: 3000, max: 6000 },
    symptoms: ['Shuddering', 'Loss of drive', 'Jerking during acceleration', 'Transmission warning light'],
    commonFixes: ['CVT rebuild ($3000-$5000)', 'CVT replacement ($4000-$6000)', 'Control unit replacement ($1000-$2000)'],
    dtcCodes: ['P0700', 'P0730']
  },

  // ============ BMW ============
  {
    id: 'bmw-z3-rear-subframe-crack-1996',
    make: 'BMW', model: 'Z3',
    title: 'Rear Subframe Mounting Point Cracking',
    description: 'The Z3 rear subframe mounting points in the unibody develop cracks from road stress and cornering loads. The M versions are particularly susceptible due to higher power output. This is a structural safety concern.',
    category: 'body', severity: 'critical',
    years: { start: 1996, end: 2002 },
    estimatedCost: { min: 1500, max: 4000 },
    symptoms: ['Clunking from rear', 'Handling changes', 'Visible cracks at subframe mounts', 'Rear end alignment issues'],
    commonFixes: ['Subframe reinforcement plates ($1500-$2500)', 'Full subframe repair with welding ($2000-$4000)'],
    dtcCodes: []
  },
  {
    id: 'bmw-z3-vanos-seals-1999',
    make: 'BMW', model: 'Z3',
    title: 'VANOS Seal Failure (M52/M54/S52)',
    description: 'The VANOS variable valve timing system develops oil seal failures causing rattling on cold starts, rough idle, and reduced power. The M52 and M54 engines are most commonly affected. The S52 in the M Roadster/Coupe also suffers this issue.',
    category: 'engine', severity: 'moderate',
    years: { start: 1999, end: 2002 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Rattle on cold start', 'Rough idle', 'Loss of low-end torque', 'Check engine light', 'Hesitation on acceleration'],
    commonFixes: ['VANOS seal replacement ($300-$600)', 'Complete VANOS rebuild ($500-$800)'],
    dtcCodes: ['P0011', 'P0012', 'P0014', 'P0015']
  },
  {
    id: 'bmw-8-series-nikasil-bore-1991',
    make: 'BMW', model: '8 Series',
    title: 'V12 Nikasil Cylinder Bore Wear (M70/M73)',
    description: 'The M70 and M73 V12 engines use Nikasil cylinder bore coating that is damaged by high-sulfur fuel, causing bore scoring and compression loss. This results in rough running, excessive oil consumption, and eventual engine failure.',
    category: 'engine', severity: 'critical',
    years: { start: 1991, end: 1997 },
    estimatedCost: { min: 5000, max: 15000 },
    symptoms: ['Rough idle', 'Misfires', 'Oil consumption', 'Hard starting', 'Reduced power', 'Failed emissions'],
    commonFixes: ['Engine rebuild with Alusil sleeves ($8000-$15000)', 'Replacement engine ($5000-$10000)', 'Bore re-coating ($6000-$12000)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308', 'P0309', 'P0310', 'P0311', 'P0312']
  },
  {
    id: 'bmw-i5-software-updates-2025',
    make: 'BMW', model: 'i5',
    title: 'iDrive 9 Software Updates and Calibration Issues',
    description: 'The i5 launched with iDrive 9 infotainment that requires multiple OTA software updates to address navigation bugs, charging optimization, and regenerative braking calibration.',
    category: 'electrical', severity: 'low',
    years: { start: 2025, end: 2026 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: ['Infotainment freezing', 'Navigation errors', 'Charging not optimizing', 'Regen braking inconsistency'],
    commonFixes: ['OTA software update (free)', 'Dealer software reflash if OTA fails (covered under warranty)'],
    dtcCodes: []
  },
  {
    id: 'bmw-i7-autonomous-system-updates-2025',
    make: 'BMW', model: 'i7',
    title: 'Level 2+ Driving Assist System Calibration',
    description: 'The Highway Assistant and parking assist systems require calibration updates and sensor recalibration after software updates. Some owners report false collision warnings and lane departure alerts.',
    category: 'electrical', severity: 'low',
    years: { start: 2025, end: 2026 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: ['False collision warnings', 'Lane departure false alarms', 'Parking assist errors', 'Highway assist disengaging'],
    commonFixes: ['Software update (covered under warranty)', 'Camera and sensor recalibration ($200-$400 if out of warranty)'],
    dtcCodes: []
  },

  // ============ VOLKSWAGEN ============
  {
    id: 'volkswagen-new-beetle-coil-pack-failure-1998',
    make: 'Volkswagen', model: 'New Beetle',
    title: 'Ignition Coil Pack Failure (1.8T/2.0)',
    description: 'The individual ignition coil packs on the 1.8T and 2.0L engines fail frequently, causing misfires. This is one of the most common VW repairs of the era. Coils typically fail one at a time.',
    category: 'engine', severity: 'moderate',
    years: { start: 1998, end: 2011 },
    estimatedCost: { min: 100, max: 400 },
    symptoms: ['Flashing check engine light', 'Misfire under load', 'Rough idle', 'Loss of power'],
    commonFixes: ['Ignition coil replacement ($25-$50 per coil)', 'Replace all 4 coils preventively ($100-$200)', 'Spark plug replacement ($50-$100)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0351', 'P0352', 'P0353', 'P0354']
  },
  {
    id: 'volkswagen-new-beetle-window-regulator-2000',
    make: 'Volkswagen', model: 'New Beetle',
    title: 'Power Window Regulator Cable Failure',
    description: 'The cable-driven window regulators in the New Beetle break frequently, causing the window to drop into the door or become stuck. The cable frays and eventually snaps.',
    category: 'body', severity: 'low',
    years: { start: 1998, end: 2011 },
    estimatedCost: { min: 150, max: 400 },
    symptoms: ['Window drops into door', 'Window stuck', 'Grinding noise from door', 'Slow window operation'],
    commonFixes: ['Window regulator replacement ($150-$300)', 'Window motor replacement ($100-$200)'],
    dtcCodes: []
  },
  {
    id: 'volkswagen-new-beetle-timing-chain-25l-2005',
    make: 'Volkswagen', model: 'New Beetle',
    title: '2.5L I5 Timing Chain Tensioner Failure',
    description: 'The 2.5L inline-5 engine uses a timing chain with a tensioner that fails, causing chain slack and potential valve timing issues. The chain can skip teeth on the sprockets.',
    category: 'engine', severity: 'high',
    years: { start: 2005, end: 2011 },
    estimatedCost: { min: 800, max: 1800 },
    symptoms: ['Rattling on startup', 'Check engine light', 'Rough running', 'Timing-related codes'],
    commonFixes: ['Timing chain and tensioner replacement ($800-$1500)', 'Updated tensioner design ($50-$100 part)'],
    dtcCodes: ['P0011', 'P0016', 'P0300']
  },
  {
    id: 'volkswagen-corrado-vr6-chain-tensioner-1992',
    make: 'Volkswagen', model: 'Corrado',
    title: 'VR6 Timing Chain Tensioner Failure',
    description: 'The 2.8L VR6 uses a timing chain with a hydraulic tensioner that loses pressure over time. This allows the chain to develop slack, causing rattling and eventually chain skip which can bend valves.',
    category: 'engine', severity: 'high',
    years: { start: 1992, end: 1995 },
    estimatedCost: { min: 600, max: 1500 },
    symptoms: ['Chain rattle on startup', 'Rough idle', 'Check engine light', 'Loss of power'],
    commonFixes: ['Timing chain tensioner and guide replacement ($600-$1200)', 'Complete timing chain kit ($800-$1500)'],
    dtcCodes: ['P0011', 'P0016', 'P0300']
  },
  {
    id: 'volkswagen-corrado-g60-supercharger-1990',
    make: 'Volkswagen', model: 'Corrado',
    title: 'G60 Supercharger Failure',
    description: 'The G-Lader scroll-type supercharger on the G60 model is prone to internal seal failure, apex strip wear, and bearing failure. Rebuilding requires specialized knowledge and the units are becoming scarce.',
    category: 'engine', severity: 'high',
    years: { start: 1990, end: 1992 },
    estimatedCost: { min: 1000, max: 3000 },
    symptoms: ['Loss of boost', 'Whining or grinding noise', 'Oil leaking from supercharger', 'Reduced power', 'Smoke from supercharger'],
    commonFixes: ['G-Lader rebuild ($1000-$2000)', 'G-Lader replacement ($1500-$3000)', 'Turbo conversion ($2000-$4000)'],
    dtcCodes: ['P0299']
  },
  {
    id: 'volkswagen-cabrio-top-mechanism-1995',
    make: 'Volkswagen', model: 'Cabrio',
    title: 'Convertible Top Mechanism and Weatherstrip Failure',
    description: 'The manual/power convertible top mechanism wears out, and the weatherstripping deteriorates, causing water leaks into the cabin. The top cable can snap, and the latches wear out.',
    category: 'body', severity: 'moderate',
    years: { start: 1995, end: 2002 },
    estimatedCost: { min: 200, max: 1500 },
    symptoms: ['Water leaks in cabin', 'Top not latching', 'Difficult to operate', 'Wind noise at speed'],
    commonFixes: ['Weatherstrip replacement ($200-$500)', 'Top cable replacement ($200-$400)', 'Complete top replacement ($800-$1500)'],
    dtcCodes: []
  },
  {
    id: 'volkswagen-cabrio-coil-pack-failure-1999',
    make: 'Volkswagen', model: 'Cabrio',
    title: '2.0L Ignition Coil Pack Failure',
    description: 'The 2.0L ABA/AEG engine uses ignition coils that fail prematurely, causing misfires. Same issue as other VW 2.0L vehicles of the era.',
    category: 'engine', severity: 'moderate',
    years: { start: 1999, end: 2002 },
    estimatedCost: { min: 100, max: 300 },
    symptoms: ['Misfire', 'Rough idle', 'Flashing check engine light', 'Loss of power'],
    commonFixes: ['Ignition coil replacement ($25-$50 per coil)', 'Spark plug replacement ($50-$100)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304']
  },
  {
    id: 'volkswagen-eurovan-auto-trans-failure-1993',
    make: 'Volkswagen', model: 'Eurovan',
    title: 'Automatic Transmission Failure',
    description: 'The automatic transmission in the Eurovan is one of its weakest points. The 4-speed auto develops torque converter failure, valve body issues, and clutch pack burnout. Replacement transmissions are expensive and hard to find.',
    category: 'transmission', severity: 'high',
    years: { start: 1993, end: 2003 },
    estimatedCost: { min: 2500, max: 5000 },
    symptoms: ['Slipping gears', 'Harsh shifts', 'No forward or reverse', 'Transmission warning light'],
    commonFixes: ['Transmission rebuild ($2500-$4000)', 'Transmission replacement ($3500-$5000)'],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },
  {
    id: 'volkswagen-eurovan-cooling-system-1997',
    make: 'Volkswagen', model: 'Eurovan',
    title: 'VR6 Cooling System Failure',
    description: 'The VR6-equipped Eurovan runs hot due to the engine compartment packaging. Water pump, thermostat, and radiator failures are common. Overheating can lead to head gasket damage.',
    category: 'cooling', severity: 'high',
    years: { start: 1997, end: 2003 },
    estimatedCost: { min: 400, max: 1500 },
    symptoms: ['Overheating', 'Coolant loss', 'Temperature gauge high', 'Steam from engine compartment'],
    commonFixes: ['Water pump replacement ($400-$800)', 'Radiator replacement ($500-$1000)', 'Thermostat replacement ($150-$300)'],
    dtcCodes: ['P0128', 'P0217']
  },
  {
    id: 'volkswagen-fox-fuel-injection-1990',
    make: 'Volkswagen', model: 'Fox',
    title: 'CIS Fuel Injection System Issues',
    description: 'The Fox uses the mechanical CIS (Continuous Injection System) fuel injection which develops issues with the fuel distributor, warm-up regulator, and cold start valve. Finding replacement parts is increasingly difficult.',
    category: 'fuel', severity: 'moderate',
    years: { start: 1990, end: 1993 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: ['Hard starting when cold', 'Rough idle', 'Poor fuel economy', 'Stalling', 'Rich or lean running'],
    commonFixes: ['Fuel distributor rebuild ($300-$600)', 'Warm-up regulator replacement ($150-$300)', 'CIS overhaul ($500-$800)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'volkswagen-phaeton-air-suspension-failure-2004',
    make: 'Volkswagen', model: 'Phaeton',
    title: 'Air Suspension System Failure',
    description: 'The Phaeton shares its platform with the Bentley Continental GT and uses a complex air suspension system. Air springs leak, the compressor fails, and the control module can malfunction. Repair costs are very high.',
    category: 'suspension', severity: 'high',
    years: { start: 2004, end: 2006 },
    estimatedCost: { min: 1500, max: 5000 },
    symptoms: ['Vehicle sitting low', 'Suspension warning light', 'Compressor running constantly', 'Ride quality degradation'],
    commonFixes: ['Air spring replacement ($800-$1500 per corner)', 'Compressor replacement ($1000-$2000)', 'Control module replacement ($500-$1000)'],
    dtcCodes: []
  },
  {
    id: 'volkswagen-arteon-infotainment-2019',
    make: 'Volkswagen', model: 'Arteon',
    title: 'Infotainment System Lag and Connectivity Issues',
    description: 'The MIB3 infotainment system in the Arteon experiences lag, freezing, and wireless connectivity dropouts. Apple CarPlay and Android Auto connections can be unreliable.',
    category: 'electrical', severity: 'low',
    years: { start: 2019, end: 2023 },
    estimatedCost: { min: 0, max: 200 },
    symptoms: ['Touchscreen lag', 'System freezing', 'CarPlay/Android Auto disconnecting', 'Backup camera delay'],
    commonFixes: ['Software update (free under warranty)', 'Infotainment module reset', 'MIB3 unit replacement ($500-$1500 if out of warranty)'],
    dtcCodes: []
  },
  {
    id: 'volkswagen-id-buzz-software-updates-2025',
    make: 'Volkswagen', model: 'ID. Buzz',
    title: 'OTA Software Updates Required for EV Systems',
    description: 'As a new EV platform, the ID. Buzz requires frequent software updates to optimize charging speed, battery management, and infotainment features. Early adopters report slower-than-expected charging curves.',
    category: 'electrical', severity: 'low',
    years: { start: 2025, end: 2026 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: ['Slower charging than expected', 'Infotainment glitches', 'Range estimation inaccuracy'],
    commonFixes: ['OTA software update (free)', 'Dealer software update (covered under warranty)'],
    dtcCodes: []
  },

  // ============ VOLVO ============
  {
    id: 'volvo-240-fuel-injection-1990',
    make: 'Volvo', model: '240',
    title: 'LH-Jetronic Fuel Injection and Idle Issues',
    description: 'The Bosch LH-Jetronic fuel injection system develops idle problems from worn air mass meter, idle air control valve failure, and vacuum leaks. The flame trap (PCV system) clogs, causing oil leaks and rough running.',
    category: 'engine', severity: 'moderate',
    years: { start: 1990, end: 1993 },
    estimatedCost: { min: 100, max: 600 },
    symptoms: ['Rough idle', 'Stalling', 'High idle', 'Oil leaks', 'Failed emissions'],
    commonFixes: ['Flame trap/PCV replacement ($30-$80)', 'Idle air control valve ($100-$200)', 'Air mass meter cleaning or replacement ($150-$400)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'volvo-740-overdrive-solenoid-1990',
    make: 'Volvo', model: '740',
    title: 'Automatic Transmission Overdrive Solenoid Failure',
    description: 'The AW70/71 automatic transmission overdrive solenoid fails, causing loss of overdrive (4th gear). The transmission also develops governor issues causing erratic shifting.',
    category: 'transmission', severity: 'moderate',
    years: { start: 1990, end: 1992 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: ['No overdrive', 'Harsh shifting', 'Transmission not upshifting', 'Flashing OD light'],
    commonFixes: ['Overdrive solenoid replacement ($200-$400)', 'Governor rebuild ($300-$600)', 'Transmission fluid and filter service ($100-$200)'],
    dtcCodes: ['P0700']
  },
  {
    id: 'volvo-940-auto-trans-overdrive-1991',
    make: 'Volvo', model: '940',
    title: 'AW30-43 Transmission Overdrive and Shift Issues',
    description: 'The AW30-43 automatic transmission develops overdrive lockout, harsh shifts, and eventually complete failure. The solenoid and valve body are common failure points.',
    category: 'transmission', severity: 'moderate',
    years: { start: 1991, end: 1998 },
    estimatedCost: { min: 300, max: 1500 },
    symptoms: ['No overdrive', 'Harsh 2-3 shift', 'Delayed engagement', 'Transmission slip'],
    commonFixes: ['Overdrive solenoid replacement ($200-$400)', 'Valve body rebuild ($500-$1000)', 'Transmission rebuild ($1200-$1500)'],
    dtcCodes: ['P0700', 'P0741']
  },
  {
    id: 'volvo-940-flame-trap-pcv-1991',
    make: 'Volvo', model: '940',
    title: 'PCV System Flame Trap Clogging',
    description: 'The PCV flame trap (crankcase ventilation system) clogs with oil sludge, pressurizing the crankcase and causing oil leaks from every gasket and seal. This is the number one maintenance item on all redblock Volvos.',
    category: 'engine', severity: 'moderate',
    years: { start: 1991, end: 1998 },
    estimatedCost: { min: 30, max: 150 },
    symptoms: ['Oil leaks from multiple locations', 'Blue smoke', 'Rough idle', 'Oil consumption'],
    commonFixes: ['Flame trap replacement ($30-$80)', 'Complete PCV hose kit ($50-$150)', 'Rear main seal replacement if leaked ($300-$600)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'volvo-960-coolant-leak-1992',
    make: 'Volvo', model: '960',
    title: 'Whiteblock Engine Coolant Leak and Thermostat Housing',
    description: 'The 960 inline-6 (B6304) develops coolant leaks from the plastic thermostat housing, heater core pipe o-rings, and water pump. The coolant expansion tank also cracks from UV and heat exposure.',
    category: 'cooling', severity: 'moderate',
    years: { start: 1992, end: 1997 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: ['Coolant loss', 'Overheating', 'Sweet coolant smell', 'Visible leak under car'],
    commonFixes: ['Thermostat housing replacement ($150-$300)', 'Expansion tank replacement ($80-$150)', 'Water pump replacement ($300-$600)'],
    dtcCodes: ['P0128']
  },
  {
    id: 'volvo-850-pcv-flame-trap-1993',
    make: 'Volvo', model: '850',
    title: 'PCV System and Oil Trap Clogging',
    description: 'The whiteblock 5-cylinder engine PCV system oil trap clogs, causing crankcase pressure buildup, oil leaks from cam seals and other gaskets, and excessive oil consumption. Must be serviced regularly.',
    category: 'engine', severity: 'moderate',
    years: { start: 1993, end: 1997 },
    estimatedCost: { min: 50, max: 300 },
    symptoms: ['Oil leaks', 'Blue exhaust smoke', 'Rough idle', 'Oil consumption', 'Whistling noise from PCV'],
    commonFixes: ['PCV oil trap replacement ($50-$150)', 'Cam seal replacement ($200-$400)', 'Complete PCV system overhaul ($150-$300)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'volvo-850-distributor-failure-1993',
    make: 'Volvo', model: '850',
    title: 'Distributor Cap and Rotor Failure',
    description: 'The distributor cap and rotor on the 850 5-cylinder develop carbon tracking and contact wear, causing misfires and hard starting. The distributor seal also leaks oil into the cap.',
    category: 'engine', severity: 'moderate',
    years: { start: 1993, end: 1997 },
    estimatedCost: { min: 50, max: 200 },
    symptoms: ['Misfire', 'Hard starting in damp weather', 'Rough idle', 'Loss of power'],
    commonFixes: ['Distributor cap and rotor replacement ($50-$100)', 'Distributor seal replacement ($30-$80)'],
    dtcCodes: ['P0300', 'P0340']
  },
  {
    id: 'volvo-s70-etm-failure-1998',
    make: 'Volvo', model: 'S70',
    title: 'Electronic Throttle Module (ETM) Failure',
    description: 'The S70 ETM (drive-by-wire throttle body) develops internal contact wear causing intermittent stalling, reduced power mode, and check engine light. This was subject to a Volvo extended warranty and is one of the most common P2 platform failures.',
    category: 'engine', severity: 'high',
    years: { start: 1999, end: 2000 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Reduced power mode', 'Stalling', 'Check engine light', 'Rough idle', 'Throttle not responding'],
    commonFixes: ['ETM replacement ($300-$600)', 'ETM cleaning and contact repair ($100-$200)', 'Updated ETM with revised contacts ($400-$800)'],
    dtcCodes: ['P0120', 'P0121', 'P2135']
  },
  {
    id: 'volvo-v70-etm-failure-1999',
    make: 'Volvo', model: 'V70',
    title: 'Electronic Throttle Module (ETM) Failure',
    description: 'Same ETM failure as S70/S60/S80 of the era. The drive-by-wire throttle body contacts wear internally. Early P2 V70s (1999-2002) are most affected.',
    category: 'engine', severity: 'high',
    years: { start: 1999, end: 2002 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Reduced power mode', 'Stalling', 'Check engine light', 'Intermittent throttle response'],
    commonFixes: ['ETM replacement ($300-$600)', 'Updated ETM with revised contacts ($400-$800)'],
    dtcCodes: ['P0120', 'P0121', 'P2135']
  },
  {
    id: 'volvo-v70-pcv-breather-box-2001',
    make: 'Volvo', model: 'V70',
    title: 'PCV Breather Box and Oil Trap Failure',
    description: 'The P2 V70 whiteblock 5-cylinder PCV breather box and oil trap clog, causing oil leaks, turbo seal failure, and excessive oil consumption. The turbo models (T5) are especially affected as boost pressure exacerbates crankcase pressure issues.',
    category: 'engine', severity: 'moderate',
    years: { start: 2001, end: 2007 },
    estimatedCost: { min: 100, max: 400 },
    symptoms: ['Oil leaks from cam seals', 'Blue exhaust smoke', 'Oil on turbo inlet pipe', 'Turbo oil leak'],
    commonFixes: ['PCV breather box replacement ($100-$200)', 'Complete PCV system kit ($150-$350)', 'Cam seal replacement ($200-$400)'],
    dtcCodes: ['P0171', 'P0174', 'P052E']
  },
  {
    id: 'volvo-c70-etm-failure-1999',
    make: 'Volvo', model: 'C70',
    title: 'Electronic Throttle Module (ETM) Failure',
    description: 'Same ETM failure as other P2 platform Volvos. The early C70 (1998-2005, first gen) is most susceptible.',
    category: 'engine', severity: 'high',
    years: { start: 1999, end: 2005 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Reduced power mode', 'Stalling', 'Check engine light'],
    commonFixes: ['ETM replacement ($300-$600)', 'Updated ETM ($400-$800)'],
    dtcCodes: ['P0120', 'P0121', 'P2135']
  },
  {
    id: 'volvo-c70-convertible-top-mechanism-2006',
    make: 'Volvo', model: 'C70',
    title: 'Retractable Hardtop Mechanism Failure',
    description: 'The second-gen C70 (2006-2013) retractable hardtop mechanism is complex with multiple hydraulic cylinders, latches, and sensors. Failures in any component can prevent top operation.',
    category: 'body', severity: 'moderate',
    years: { start: 2006, end: 2013 },
    estimatedCost: { min: 500, max: 3000 },
    symptoms: ['Top not opening/closing', 'Error message on dash', 'Top stuck partway', 'Hydraulic fluid leak'],
    commonFixes: ['Hydraulic cylinder replacement ($500-$1200)', 'Latch mechanism replacement ($300-$800)', 'Complete hydraulic system overhaul ($1500-$3000)'],
    dtcCodes: []
  },
  {
    id: 'volvo-v40-etm-failure-2000',
    make: 'Volvo', model: 'V40',
    title: 'Electronic Throttle Module (ETM) Failure',
    description: 'The S40/V40 first generation (2000-2004) uses the same problematic ETM as other Volvos of the era. Internal contact wear causes throttle position sensor errors and reduced power mode.',
    category: 'engine', severity: 'high',
    years: { start: 2000, end: 2004 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Reduced power mode', 'Check engine light', 'Stalling', 'Rough idle'],
    commonFixes: ['ETM replacement ($300-$600)', 'Updated ETM ($400-$800)'],
    dtcCodes: ['P0120', 'P0121', 'P2135']
  },
  {
    id: 'volvo-v50-timing-belt-2005',
    make: 'Volvo', model: 'V50',
    title: 'Timing Belt and Water Pump Service',
    description: 'The V50 5-cylinder engines use a timing belt that requires replacement at 105,000 miles. If the belt breaks, the interference engine will suffer bent valves. The water pump should be replaced at the same time.',
    category: 'engine', severity: 'high',
    years: { start: 2005, end: 2011 },
    estimatedCost: { min: 800, max: 1500 },
    symptoms: ['No symptoms until failure (belt snap)', 'Water pump leak', 'Squealing from belt area', 'Belt showing cracks'],
    commonFixes: ['Timing belt and water pump kit replacement ($800-$1500)', 'Belt tensioner and idler pulleys ($200-$400 additional)'],
    dtcCodes: []
  },

  // ============ CADILLAC ============
  {
    id: 'cadillac-fleetwood-lt1-optispark-1994',
    make: 'Cadillac', model: 'Fleetwood',
    title: 'LT1 5.7L Optispark Distributor Failure (1994-1996)',
    description: 'The 1994-1996 Fleetwood uses the LT1 V8 with the Optispark distributor mounted at the front of the engine behind the water pump. Water intrusion and internal component failure cause no-start conditions and misfires.',
    category: 'engine', severity: 'high',
    years: { start: 1994, end: 1996 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: ['No start', 'Rough idle', 'Misfire', 'Stalling in rain', 'Hard starting'],
    commonFixes: ['Optispark replacement ($400-$800)', 'Water pump vent tube installation to prevent water intrusion ($50-$100)', 'MSD replacement distributor ($600-$1000)'],
    dtcCodes: ['P0300', 'P0340']
  },
  {
    id: 'cadillac-fleetwood-cooling-system-1993',
    make: 'Cadillac', model: 'Fleetwood',
    title: 'Cooling System and Heater Core Failure',
    description: 'The Fleetwood (both 5.7L TBI and LT1 versions) develops cooling system issues including water pump failure, heater core leaks, and radiator degradation. The heater core replacement requires extensive dash removal.',
    category: 'cooling', severity: 'moderate',
    years: { start: 1990, end: 1996 },
    estimatedCost: { min: 300, max: 1500 },
    symptoms: ['Coolant leak', 'Overheating', 'Foggy windshield from heater core', 'Sweet coolant smell in cabin'],
    commonFixes: ['Water pump replacement ($200-$500)', 'Heater core replacement ($600-$1200)', 'Radiator replacement ($300-$600)'],
    dtcCodes: ['P0128']
  },
  {
    id: 'cadillac-allante-northstar-head-gasket-1993',
    make: 'Cadillac', model: 'Allante',
    title: '4.6L Northstar V8 Head Gasket Failure (1993)',
    description: 'The 1993 Allante was one of the first vehicles to receive the Northstar V8. Early Northstars are notorious for head bolt thread pull-out from the aluminum block, causing head gasket failure. The fix requires Timesert or similar thread repair.',
    category: 'engine', severity: 'critical',
    years: { start: 1993, end: 1993 },
    estimatedCost: { min: 3000, max: 6000 },
    symptoms: ['Coolant loss', 'Overheating', 'White exhaust smoke', 'Oily coolant'],
    commonFixes: ['Head gasket replacement with Timesert head bolt repair ($3000-$5000)', 'Engine replacement ($4000-$6000)'],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'cadillac-catera-timing-belt-1997',
    make: 'Cadillac', model: 'Catera',
    title: '3.0L V6 Timing Belt Failure',
    description: 'The Opel-derived 3.0L V6 (L81) in the Catera uses a timing belt that requires replacement at 60,000-mile intervals. If the belt breaks, the interference engine suffers catastrophic valve damage. The belt is also prone to premature failure.',
    category: 'engine', severity: 'critical',
    years: { start: 1997, end: 2001 },
    estimatedCost: { min: 800, max: 2000 },
    symptoms: ['No symptoms until failure', 'Belt noise', 'Engine suddenly dies while driving (belt snap)'],
    commonFixes: ['Timing belt, tensioner, and idler replacement ($800-$1500)', 'Water pump replacement at same time ($200-$400 additional)'],
    dtcCodes: []
  },
  {
    id: 'cadillac-catera-coolant-leak-1997',
    make: 'Cadillac', model: 'Catera',
    title: '3.0L V6 Coolant Leak and Overheating',
    description: 'The Catera 3.0L V6 develops multiple coolant leaks from the water pump, thermostat housing, and hose connections. Overheating from these leaks can warp cylinder heads.',
    category: 'cooling', severity: 'high',
    years: { start: 1997, end: 2001 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: ['Coolant leak', 'Overheating', 'Low coolant warning', 'Steam from engine bay'],
    commonFixes: ['Water pump replacement ($400-$800)', 'Thermostat housing replacement ($200-$400)', 'Complete cooling system overhaul ($800-$1200)'],
    dtcCodes: ['P0128', 'P0217']
  },

  // ============ MINI ============
  {
    id: 'mini-coupe-timing-chain-2012',
    make: 'MINI', model: 'Coupe',
    title: 'N14/N18 Timing Chain Tensioner Failure',
    description: 'Same timing chain issue as the Cooper S. The N14 and N18 turbo engines develop timing chain stretch and tensioner failure.',
    category: 'engine', severity: 'high',
    years: { start: 2012, end: 2015 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['Chain rattle on startup', 'Check engine light', 'Rough running', 'Loss of power'],
    commonFixes: ['Timing chain and tensioner replacement ($1500-$2500)'],
    dtcCodes: ['P0011', 'P0012', 'P0016']
  },
  {
    id: 'mini-paceman-awd-coupling-2013',
    make: 'MINI', model: 'Paceman',
    title: 'ALL4 AWD Coupling Wear and Timing Chain',
    description: 'The Paceman ALL4 models share the same Haldex-based AWD coupling as the Countryman. The coupling wears and the timing chain tensioner fails - same issues as other N14/N18 MINI models.',
    category: 'drivetrain', severity: 'moderate',
    years: { start: 2013, end: 2016 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: ['AWD engagement noise', 'Vibration under acceleration', 'Check engine light', 'Chain rattle'],
    commonFixes: ['Haldex coupling service ($300-$500)', 'Timing chain and tensioner replacement ($1500-$2500)'],
    dtcCodes: ['P0011', 'P0016']
  },
  {
    id: 'mini-roadster-timing-chain-2012',
    make: 'MINI', model: 'Roadster',
    title: 'N18 Timing Chain and Turbo Oil Line Leak',
    description: 'Same N18 engine issues as other turbo MINIs. The timing chain stretches and the turbo oil return line leaks.',
    category: 'engine', severity: 'high',
    years: { start: 2012, end: 2015 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['Chain rattle', 'Oil leak near turbo', 'Check engine light', 'Reduced power'],
    commonFixes: ['Timing chain replacement ($1500-$2500)', 'Turbo oil line replacement ($200-$400)'],
    dtcCodes: ['P0011', 'P0016']
  }
];

// Add issues checking for duplicates
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

console.log('European + Extra 90s Issues Results:');
console.log('  Added: ' + added + ' issues');
console.log('  Total issues now: ' + data.issues.length);

var added2 = {};
newIssues.forEach(function(i) {
  if (added2[i.make] === undefined) added2[i.make] = 0;
  added2[i.make]++;
});
console.log('\nBreakdown:');
Object.keys(added2).sort().forEach(function(make) {
  console.log('  ' + make + ': ' + added2[make] + ' issues');
});
