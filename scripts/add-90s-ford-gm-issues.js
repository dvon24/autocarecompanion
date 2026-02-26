const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const existingIds = new Set(data.issues.map(function(i) { return i.id; }));

const newIssues = [
  // ============ FORD ============
  // Taurus
  {
    id: 'ford-taurus-transmission-failure-1996',
    make: 'Ford', model: 'Taurus',
    title: 'AX4S/AX4N Automatic Transmission Failure',
    description: 'The AX4S and later AX4N automatic transmissions used in the Taurus are prone to premature failure due to torque converter clutch issues, valve body wear, and overheating. Common in high-mileage vehicles and those used for frequent stop-and-go driving.',
    category: 'transmission', severity: 'high',
    years: { start: 1996, end: 2007 },
    estimatedCost: { min: 2000, max: 4500 },
    symptoms: ['Harsh or delayed shifting', 'Slipping between gears', 'Transmission warning light', 'Shuddering during acceleration'],
    commonFixes: ['Transmission rebuild ($2000-$3500)', 'Transmission replacement ($3000-$4500)', 'Valve body replacement ($800-$1500)'],
    dtcCodes: ['P0700', 'P0741', 'P0742', 'P0751']
  },
  {
    id: 'ford-taurus-vulcan-head-gasket-1996',
    make: 'Ford', model: 'Taurus',
    title: '3.0L Vulcan V6 Head Gasket Failure',
    description: 'The 3.0L Vulcan V6 engine is susceptible to head gasket failure, often presenting as coolant mixing with oil or external coolant leaks. The composite head gaskets deteriorate over time, especially with overheating events.',
    category: 'engine', severity: 'high',
    years: { start: 1996, end: 2007 },
    estimatedCost: { min: 1200, max: 2500 },
    symptoms: ['Coolant loss without visible leak', 'White exhaust smoke', 'Overheating', 'Milky oil on dipstick'],
    commonFixes: ['Head gasket replacement ($1200-$2500)', 'Engine replacement if warped heads ($3000-$5000)'],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'ford-taurus-cam-phaser-duratec-2008',
    make: 'Ford', model: 'Taurus',
    title: '3.5L Duratec Cam Phaser Rattle',
    description: 'The 3.5L Duratec V6 in later model Taurus vehicles develops cam phaser rattle on cold starts due to worn variable valve timing actuators and depleted oil control valve seals.',
    category: 'engine', severity: 'moderate',
    years: { start: 2008, end: 2019 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['Rattling noise on cold start', 'Check engine light', 'Rough idle when cold'],
    commonFixes: ['Cam phaser replacement ($1500-$2500)', 'VVT solenoid replacement ($200-$400)'],
    dtcCodes: ['P0011', 'P0012', 'P0014', 'P0021', 'P0022']
  },

  // Crown Victoria
  {
    id: 'ford-crown-victoria-intake-manifold-crack-2001',
    make: 'Ford', model: 'Crown Victoria',
    title: '4.6L Intake Manifold Cracking and Coolant Leak',
    description: 'The plastic intake manifold on the 4.6L V8 is prone to cracking near the thermostat housing crossover, causing coolant to leak externally or internally into the engine oil. This was subject to a class action settlement.',
    category: 'engine', severity: 'high',
    years: { start: 1996, end: 2001 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: ['Coolant loss', 'Overheating', 'Coolant smell', 'Visible crack near thermostat housing'],
    commonFixes: ['Replacement intake manifold - updated design ($500-$900)', 'Dorman aftermarket manifold ($400-$700)'],
    dtcCodes: ['P0128']
  },
  {
    id: 'ford-crown-victoria-spark-plug-breakage-2004',
    make: 'Ford', model: 'Crown Victoria',
    title: '4.6L 2-Valve Spark Plug Ejection/Breakage',
    description: 'The 4.6L 2-valve engine uses spark plugs that thread into aluminum heads with only a few threads of engagement. The plugs can eject from the head under load, stripping the threads. Later models (2004+) use a 2-piece plug design that can break during removal.',
    category: 'engine', severity: 'moderate',
    years: { start: 1992, end: 2011 },
    estimatedCost: { min: 300, max: 1500 },
    symptoms: ['Loud popping sound', 'Misfire', 'Loss of power', 'Spark plug shoots out of engine'],
    commonFixes: ['Helicoil thread repair ($300-$800 per cylinder)', 'Careful plug removal with penetrating oil', 'Lisle broken plug extractor tool ($150-$500)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308']
  },

  // Escort
  {
    id: 'ford-escort-head-gasket-failure-1997',
    make: 'Ford', model: 'Escort',
    title: '2.0L SPI Head Gasket Failure',
    description: 'The 2.0L Split Port Induction engine is prone to head gasket failure, often caused by overheating from a failed cooling fan or thermostat. The composite gasket deteriorates and allows coolant into cylinders.',
    category: 'engine', severity: 'high',
    years: { start: 1997, end: 2003 },
    estimatedCost: { min: 800, max: 1800 },
    symptoms: ['White exhaust smoke', 'Overheating', 'Coolant loss', 'Rough idle'],
    commonFixes: ['Head gasket replacement ($800-$1500)', 'Head resurfacing if warped ($200-$400 additional)'],
    dtcCodes: ['P0171', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0128']
  },
  {
    id: 'ford-escort-auto-trans-failure-1991',
    make: 'Ford', model: 'Escort',
    title: 'CD4E Automatic Transmission Failure',
    description: 'The CD4E automatic transmission used in the Escort is known for premature failure, particularly the forward clutch piston and servo bore wear. Symptoms progressively worsen over time.',
    category: 'transmission', severity: 'high',
    years: { start: 1991, end: 2003 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['Slipping in drive', 'Delayed engagement', 'Harsh shifts', 'No reverse'],
    commonFixes: ['Transmission rebuild ($1500-$2500)', 'Transmission replacement ($2000-$3000)'],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },

  // F-250 (old body)
  {
    id: 'ford-f250-73l-injector-1994',
    make: 'Ford', model: 'F-250',
    title: '7.3L IDI/Powerstroke Injector Failure',
    description: 'The 7.3L diesel engines (IDI pre-1994, Powerstroke 1994+) experience injector failure causing rough running, hard starts, and excessive smoke. The IDI injectors are simpler mechanical units; Powerstroke uses HEUI hydraulic electronic injectors.',
    category: 'engine', severity: 'moderate',
    years: { start: 1990, end: 1998 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: ['Hard starting', 'Black or white smoke', 'Rough idle', 'Knocking noise', 'Loss of power'],
    commonFixes: ['Injector replacement ($800-$2000 for set)', 'Injector o-ring replacement ($200-$500)'],
    dtcCodes: ['P0201', 'P0202', 'P0203', 'P0204', 'P0205', 'P0206', 'P0207', 'P0208']
  },
  {
    id: 'ford-f250-diesel-glow-plug-1990',
    make: 'Ford', model: 'F-250',
    title: '7.3L Diesel Glow Plug and Relay Failure',
    description: 'Glow plug failure is common on 7.3L diesel engines, causing hard cold starts. The glow plug relay (solenoid) also fails, preventing power from reaching functional glow plugs. Broken glow plug tips can also fall into the cylinder.',
    category: 'engine', severity: 'moderate',
    years: { start: 1990, end: 1998 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: ['Hard starting in cold weather', 'Extended cranking', 'Wait-to-start light stays on', 'White smoke on cold start'],
    commonFixes: ['Glow plug replacement ($200-$500 for set of 8)', 'Glow plug relay replacement ($50-$150)', 'Glow plug control module ($100-$250)'],
    dtcCodes: []
  },

  // F-350
  {
    id: 'ford-f350-73l-turbo-pedestal-leak-1994',
    make: 'Ford', model: 'F-350',
    title: '7.3L Powerstroke Turbo Pedestal O-Ring Leak',
    description: 'The turbo pedestal gasket and o-rings on the 7.3L Powerstroke are a common failure point, causing oil and exhaust leaks. The exhaust back-pressure valve (EBPV) in the pedestal can also stick or fail.',
    category: 'engine', severity: 'moderate',
    years: { start: 1994, end: 1998 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: ['Oil leak near turbo', 'Exhaust smell in cabin', 'Boost loss', 'Whistling sound'],
    commonFixes: ['Turbo pedestal o-ring kit ($50-$100 parts, $200-$500 labor)', 'EBPV delete kit ($100-$200)'],
    dtcCodes: ['P0234', 'P0299']
  },

  // Windstar
  {
    id: 'ford-windstar-rear-axle-break-1999',
    make: 'Ford', model: 'Windstar',
    title: 'Rear Axle Breakage (Safety Recall)',
    description: 'The Windstar rear axle is prone to stress fracture and complete breakage at the spring perch, causing the wheel to tuck under the vehicle. This was subject to NHTSA recall 10V-040. Rust and corrosion in northern climates accelerates the failure.',
    category: 'suspension', severity: 'critical',
    years: { start: 1998, end: 2003 },
    estimatedCost: { min: 800, max: 2000 },
    symptoms: ['Clunking from rear', 'Rear end sway', 'Visible rust/cracking on rear axle', 'Uneven tire wear'],
    commonFixes: ['Rear axle replacement ($800-$1500)', 'Axle reinforcement bracket ($200-$400)'],
    dtcCodes: []
  },
  {
    id: 'ford-windstar-head-gasket-38l-1999',
    make: 'Ford', model: 'Windstar',
    title: '3.8L V6 Head Gasket Failure',
    description: 'The 3.8L Essex V6 in the Windstar is notorious for head gasket failure, often caused by the aluminum heads warping from overheating. The composite head gaskets deteriorate and allow coolant into combustion chambers.',
    category: 'engine', severity: 'high',
    years: { start: 1999, end: 2003 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['White exhaust smoke', 'Coolant loss', 'Overheating', 'Milky oil'],
    commonFixes: ['Head gasket replacement with head resurfacing ($1500-$3000)', 'Updated MLS head gaskets ($200 parts)'],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },

  // Freestar
  {
    id: 'ford-freestar-torque-converter-shudder-2004',
    make: 'Ford', model: 'Freestar',
    title: 'Torque Converter Shudder and Transmission Failure',
    description: 'The Freestar inherited many of the Windstar transmission problems. The torque converter develops shudder during light acceleration, and the transmission can fail completely with forward clutch pack burn-up.',
    category: 'transmission', severity: 'high',
    years: { start: 2004, end: 2007 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: ['Shuddering at 40-60 mph', 'Harsh shifts', 'Slipping', 'Transmission warning light'],
    commonFixes: ['Torque converter replacement ($800-$1500)', 'Transmission rebuild ($2000-$3500)'],
    dtcCodes: ['P0700', 'P0740', 'P0741', 'P0742']
  },

  // Explorer Sport Trac
  {
    id: 'ford-explorer-sport-trac-timing-chain-2002',
    make: 'Ford', model: 'Explorer Sport Trac',
    title: '4.0L SOHC Timing Chain Guide Failure',
    description: 'The 4.0L SOHC V6 uses plastic timing chain guides and tensioners that fail, causing the chain to skip or break. This is the same engine and issue as the Explorer. The cassette-style chain system requires significant labor to replace.',
    category: 'engine', severity: 'high',
    years: { start: 2001, end: 2010 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['Rattling on startup', 'Check engine light', 'Rough idle', 'Loss of power', 'Engine stall'],
    commonFixes: ['Complete timing chain, guide, and tensioner replacement ($1500-$3000)'],
    dtcCodes: ['P0011', 'P0012', 'P0016', 'P0300']
  },

  // Excursion
  {
    id: 'ford-excursion-60l-head-bolt-2003',
    make: 'Ford', model: 'Excursion',
    title: '6.0L Powerstroke Head Bolt Failure and Head Gasket Blowout',
    description: 'The 6.0L Powerstroke diesel (2003-2005 Excursion) is notorious for TTY head bolt stretching under boost pressure, causing head gasket failure. This is the same engine used in Super Duty trucks and is one of the most problematic diesel engines Ford produced.',
    category: 'engine', severity: 'critical',
    years: { start: 2003, end: 2005 },
    estimatedCost: { min: 3000, max: 8000 },
    symptoms: ['White smoke from exhaust', 'Coolant loss', 'Overheating', 'Degas bottle overflow', 'Rough running'],
    commonFixes: ['ARP head stud upgrade and head gasket replacement ($3000-$6000)', 'EGR cooler replacement (often done simultaneously $800-$1500)', 'Oil cooler replacement ($600-$1200)'],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'ford-excursion-60l-oil-cooler-2003',
    make: 'Ford', model: 'Excursion',
    title: '6.0L Powerstroke Oil Cooler Clogging',
    description: 'The oil cooler on the 6.0L Powerstroke clogs with debris from deteriorating coolant, reducing cooling capacity and causing elevated oil and coolant temperatures. This leads to cascading failures including EGR cooler rupture and head gasket failure.',
    category: 'cooling', severity: 'high',
    years: { start: 2003, end: 2005 },
    estimatedCost: { min: 800, max: 2000 },
    symptoms: ['High engine oil temperature', 'Coolant temperature fluctuation', 'EGR cooler failure', 'Poor heater output'],
    commonFixes: ['Oil cooler replacement ($800-$1500)', 'Bulletproof Diesel oil cooler upgrade ($1000-$2000)'],
    dtcCodes: ['P0217']
  },

  // Contour
  {
    id: 'ford-contour-transmission-failure-1995',
    make: 'Ford', model: 'Contour',
    title: 'CD4E Automatic Transmission Failure',
    description: 'The CD4E automatic transmission used in the Contour is one of the most failure-prone transmissions Ford has produced. The forward clutch pack, servo bore, and torque converter clutch are common failure points.',
    category: 'transmission', severity: 'high',
    years: { start: 1995, end: 2000 },
    estimatedCost: { min: 1500, max: 3000 },
    symptoms: ['Delayed engagement', 'Slipping in gear', 'Harsh 1-2 shift', 'No reverse'],
    commonFixes: ['Transmission rebuild ($1500-$2500)', 'Transmission replacement ($2000-$3000)'],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },

  // Probe
  {
    id: 'ford-probe-distributor-failure-1993',
    make: 'Ford', model: 'Probe',
    title: 'Distributor Failure (Mazda FS/KL Engine)',
    description: 'The Probe uses Mazda-derived engines with distributors that fail due to internal coil and sensor degradation. The 2.0L FS-DE and 2.5L KL-DE distributors develop intermittent spark loss and hard starting.',
    category: 'engine', severity: 'moderate',
    years: { start: 1993, end: 1997 },
    estimatedCost: { min: 250, max: 600 },
    symptoms: ['No start condition', 'Intermittent stalling', 'Misfire', 'Hard starting when hot'],
    commonFixes: ['Distributor replacement ($250-$500)', 'Ignition coil replacement ($100-$200)'],
    dtcCodes: ['P0340', 'P0300']
  },

  // Thunderbird
  {
    id: 'ford-thunderbird-supercharger-failure-1989',
    make: 'Ford', model: 'Thunderbird',
    title: 'Super Coupe Supercharger and Intercooler Failure',
    description: 'The 3.8L V6 Super Coupe uses an Eaton M90 supercharger that develops boost leaks, bearing noise, and coupler failure over time. The intercooler system can also develop leaks, reducing boost efficiency.',
    category: 'engine', severity: 'moderate',
    years: { start: 1990, end: 1995 },
    estimatedCost: { min: 500, max: 2500 },
    symptoms: ['Whining or grinding from supercharger', 'Loss of boost', 'Reduced power', 'Boost gauge reads low'],
    commonFixes: ['Supercharger rebuild ($500-$1200)', 'Supercharger replacement ($1000-$2500)', 'Coupler replacement ($50-$150)'],
    dtcCodes: ['P0299']
  },
  {
    id: 'ford-thunderbird-head-gasket-38l-1994',
    make: 'Ford', model: 'Thunderbird',
    title: '3.8L V6 Head Gasket Failure',
    description: 'The naturally aspirated 3.8L Essex V6 Thunderbird shares the same head gasket vulnerability as the Windstar and Mustang. The composite gaskets fail between coolant passages and cylinders.',
    category: 'engine', severity: 'high',
    years: { start: 1994, end: 1997 },
    estimatedCost: { min: 1200, max: 2500 },
    symptoms: ['White exhaust smoke', 'Coolant loss', 'Overheating', 'Rough idle'],
    commonFixes: ['Head gasket replacement ($1200-$2500)', 'Updated MLS gaskets recommended'],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },

  // ============ CHEVROLET ============
  // C/K 1500
  {
    id: 'chevrolet-ck-1500-spider-injector-1996',
    make: 'Chevrolet', model: 'C/K 1500',
    title: '5.7L Vortec Spider Injector Assembly Failure (CPI)',
    description: 'The 5.7L Vortec V8 (1996-1999) uses a Central Port Injection (CPI) spider assembly with poppet nozzles that clog and leak fuel. The plastic fuel lines become brittle and crack, causing hard starts, rough idle, and fuel odor.',
    category: 'fuel', severity: 'high',
    years: { start: 1996, end: 1998 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: ['Hard starting', 'Rough idle', 'Fuel smell under hood', 'Poor fuel economy', 'Stalling'],
    commonFixes: ['Spider injector assembly replacement with updated MPFI design ($400-$800)', 'Fuel pressure regulator replacement ($100-$250)'],
    dtcCodes: ['P0171', 'P0174', 'P0300']
  },
  {
    id: 'chevrolet-ck-1500-fuel-pump-failure-1990',
    make: 'Chevrolet', model: 'C/K 1500',
    title: 'In-Tank Fuel Pump Failure',
    description: 'The in-tank electric fuel pump fails frequently on C/K trucks, especially in hot weather. Low fuel levels accelerate pump failure as the fuel cools and lubricates the pump. The pump module sender unit also fails, causing inaccurate fuel gauge readings.',
    category: 'fuel', severity: 'moderate',
    years: { start: 1990, end: 1998 },
    estimatedCost: { min: 400, max: 900 },
    symptoms: ['Engine stalling', 'Hard starting', 'Loss of power at highway speeds', 'Whining from fuel tank', 'Inaccurate fuel gauge'],
    commonFixes: ['Fuel pump module replacement ($400-$700)', 'Fuel pump relay replacement ($20-$50)'],
    dtcCodes: ['P0230', 'P0231']
  },
  {
    id: 'chevrolet-ck-1500-4l60e-trans-1993',
    make: 'Chevrolet', model: 'C/K 1500',
    title: '4L60E Automatic Transmission Failure',
    description: 'The 4L60E transmission is known for 3-4 clutch pack burnup, sun shell failure, and worn input drum. These trucks were often used for towing which accelerated wear. The transmission develops slipping in 3rd and 4th gears.',
    category: 'transmission', severity: 'high',
    years: { start: 1993, end: 1998 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: ['Slipping in 3rd or 4th gear', 'Harsh 1-2 shift', 'No 3rd or 4th gear', 'Burnt fluid smell'],
    commonFixes: ['Transmission rebuild with upgraded 3-4 clutch pack ($1500-$2500)', 'Transmission replacement ($2500-$3500)'],
    dtcCodes: ['P0700', 'P0741', 'P0742', 'P0751']
  },

  // C/K 2500
  {
    id: 'chevrolet-ck-2500-65l-diesel-injection-pump-1992',
    make: 'Chevrolet', model: 'C/K 2500',
    title: '6.5L Diesel Injection Pump (PMD/FSD) Failure',
    description: 'The 6.5L diesel uses a Stanadyne DB2 injection pump with a Pump Mounted Driver (PMD/FSD) electronic module that overheats and fails, causing stalling and no-start conditions. This is the most common failure on 6.5L diesel trucks.',
    category: 'engine', severity: 'high',
    years: { start: 1994, end: 2000 },
    estimatedCost: { min: 300, max: 2500 },
    symptoms: ['Stalling while driving', 'No start when hot', 'Hard starting', 'Loss of power'],
    commonFixes: ['PMD/FSD relocation kit with heat sink ($200-$400)', 'Injection pump rebuild ($1500-$2500)', 'PMD replacement ($150-$300)'],
    dtcCodes: []
  },
  {
    id: 'chevrolet-ck-2500-fuel-pump-1990',
    make: 'Chevrolet', model: 'C/K 2500',
    title: 'In-Tank Fuel Pump Failure',
    description: 'Same fuel pump failure issue as the C/K 1500. The dual-tank equipped models have an additional failure point with the tank selector valve which can cause fuel starvation.',
    category: 'fuel', severity: 'moderate',
    years: { start: 1990, end: 2000 },
    estimatedCost: { min: 400, max: 900 },
    symptoms: ['Engine stalling', 'Hard starting', 'Loss of power', 'Fuel gauge inaccuracy'],
    commonFixes: ['Fuel pump replacement ($400-$700)', 'Tank selector valve replacement ($100-$200)'],
    dtcCodes: ['P0230', 'P0231']
  },

  // S-10
  {
    id: 'chevrolet-s10-43l-intake-gasket-1996',
    make: 'Chevrolet', model: 'S-10',
    title: '4.3L V6 Intake Manifold Gasket Leak',
    description: 'The 4.3L Vortec V6 develops intake manifold gasket leaks that allow coolant to leak externally or mix with engine oil. The plastic gaskets deteriorate from heat cycling. This is a very common problem on all GM 4.3L V6 trucks.',
    category: 'engine', severity: 'moderate',
    years: { start: 1996, end: 2004 },
    estimatedCost: { min: 400, max: 900 },
    symptoms: ['Coolant leak at intake', 'Low coolant level', 'Overheating', 'White residue at gasket', 'Rough idle'],
    commonFixes: ['Intake manifold gasket replacement ($400-$800)', 'Use Fel-Pro upgraded gasket set'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'chevrolet-s10-lower-ball-joint-1994',
    make: 'Chevrolet', model: 'S-10',
    title: 'Lower Ball Joint Failure',
    description: 'The lower ball joints on S-10 trucks wear prematurely, especially on 4WD models. Excessive play develops which can lead to sudden separation and loss of steering control. Subject to multiple NHTSA investigations.',
    category: 'suspension', severity: 'critical',
    years: { start: 1994, end: 2004 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: ['Clunking over bumps', 'Steering wheel vibration', 'Uneven tire wear', 'Loose feeling in steering'],
    commonFixes: ['Lower ball joint replacement ($200-$400 per side)', 'Control arm replacement ($300-$600 per side)'],
    dtcCodes: []
  },

  // Blazer S-10
  {
    id: 'chevrolet-blazer-s10-43l-intake-gasket-1996',
    make: 'Chevrolet', model: 'Blazer S-10',
    title: '4.3L V6 Intake Manifold Gasket Leak',
    description: 'Same as the S-10 truck - the 4.3L Vortec V6 develops intake manifold gasket leaks. The Blazer version is identical mechanically.',
    category: 'engine', severity: 'moderate',
    years: { start: 1996, end: 2005 },
    estimatedCost: { min: 400, max: 900 },
    symptoms: ['Coolant leak at intake', 'Low coolant', 'Overheating', 'Rough idle'],
    commonFixes: ['Intake manifold gasket replacement ($400-$800)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'chevrolet-blazer-s10-4wd-actuator-1998',
    make: 'Chevrolet', model: 'Blazer S-10',
    title: '4WD Thermal Actuator and Encoder Motor Failure',
    description: 'The front axle thermal actuator (push-button 4WD models) and transfer case encoder motor fail, preventing engagement or disengagement of 4WD. The thermal actuator uses coolant heating to engage, which is slow and unreliable.',
    category: 'drivetrain', severity: 'moderate',
    years: { start: 1998, end: 2005 },
    estimatedCost: { min: 200, max: 700 },
    symptoms: ['4WD not engaging', '4WD not disengaging', 'Service 4WD light', 'Grinding noise when engaging'],
    commonFixes: ['Thermal actuator replacement with cable-actuated upgrade ($200-$400)', 'Encoder motor replacement ($200-$500)', 'Transfer case shift motor ($150-$300)'],
    dtcCodes: []
  },

  // Cavalier
  {
    id: 'chevrolet-cavalier-head-gasket-22l-1995',
    make: 'Chevrolet', model: 'Cavalier',
    title: '2.2L/2.4L Head Gasket Failure',
    description: 'Both the 2.2L OHV and 2.4L Twin Cam engines in the Cavalier are prone to head gasket failure. The 2.4L is particularly susceptible due to the aluminum head and iron block thermal expansion differences.',
    category: 'engine', severity: 'high',
    years: { start: 1995, end: 2005 },
    estimatedCost: { min: 800, max: 1800 },
    symptoms: ['White exhaust smoke', 'Overheating', 'Coolant loss', 'Oil contamination'],
    commonFixes: ['Head gasket replacement ($800-$1500)', 'Head bolt upgrade to ARP studs ($100-$200 additional)'],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'chevrolet-cavalier-coolant-leak-2002',
    make: 'Chevrolet', model: 'Cavalier',
    title: '2.2L Ecotec Coolant Leak and Thermostat Housing Crack',
    description: 'The 2.2L Ecotec engine develops coolant leaks from the plastic thermostat housing, water outlet, and coolant elbows. These plastic components crack from heat cycling.',
    category: 'cooling', severity: 'moderate',
    years: { start: 2002, end: 2005 },
    estimatedCost: { min: 150, max: 500 },
    symptoms: ['Coolant leak', 'Low coolant warning', 'Overheating', 'Sweet smell from engine bay'],
    commonFixes: ['Thermostat housing replacement ($150-$300)', 'Coolant elbow replacement with aluminum upgrade ($50-$150)'],
    dtcCodes: ['P0128']
  },

  // Lumina
  {
    id: 'chevrolet-lumina-31l-intake-gasket-1995',
    make: 'Chevrolet', model: 'Lumina',
    title: '3.1L/3.4L V6 Intake Manifold Gasket Leak (Dex-Cool)',
    description: 'The 3.1L and 3.4L pushrod V6 engines in the Lumina develop intake manifold gasket leaks, often attributed to Dex-Cool coolant reacting with the composite gaskets. Coolant leaks externally and can also enter the crankcase.',
    category: 'engine', severity: 'high',
    years: { start: 1995, end: 2001 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: ['Coolant loss', 'Oil milkshake under oil cap', 'Overheating', 'Sweet coolant smell', 'Low coolant light'],
    commonFixes: ['Intake manifold gasket replacement ($500-$1000)', 'Switch to conventional green coolant', 'Use Fel-Pro upgraded gaskets'],
    dtcCodes: ['P0171', 'P0174']
  },

  // Monte Carlo
  {
    id: 'chevrolet-monte-carlo-38l-intake-gasket-2000',
    make: 'Chevrolet', model: 'Monte Carlo',
    title: '3.8L V6 Intake Manifold Gasket and Coolant Elbow Leak',
    description: 'The 3.8L Series II V6 develops intake manifold gasket leaks and the plastic coolant elbow on the front of the engine cracks. The supercharged SS models also have supercharger snout wear causing boost leaks.',
    category: 'engine', severity: 'moderate',
    years: { start: 2000, end: 2007 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: ['Coolant leak', 'Low coolant', 'Overheating', 'Rough idle'],
    commonFixes: ['Intake gasket replacement ($400-$800)', 'Coolant elbow replacement with aluminum upgrade ($50-$150)', 'Supercharger snout rebuild kit ($200-$400)'],
    dtcCodes: ['P0171', 'P0174']
  },

  // TrailBlazer
  {
    id: 'chevrolet-trailblazer-fan-clutch-2002',
    make: 'Chevrolet', model: 'TrailBlazer',
    title: 'Electric Fan Clutch Failure',
    description: 'The TrailBlazer uses an electronically controlled viscous fan clutch that fails, causing overheating in traffic or when towing. A failed fan clutch can also cause excessive fan engagement, creating a loud roaring noise and reduced fuel economy.',
    category: 'cooling', severity: 'moderate',
    years: { start: 2002, end: 2009 },
    estimatedCost: { min: 300, max: 700 },
    symptoms: ['Overheating in traffic', 'Loud fan roar', 'A/C not cooling well', 'Poor fuel economy'],
    commonFixes: ['Fan clutch replacement ($300-$600)', 'Fan clutch relay replacement ($30-$80)'],
    dtcCodes: []
  },
  {
    id: 'chevrolet-trailblazer-42l-coolant-leak-2003',
    make: 'Chevrolet', model: 'TrailBlazer',
    title: '4.2L I6 Coolant Leak from Throttle Body and Water Pump',
    description: 'The 4.2L Atlas I6 develops coolant leaks from the throttle body heater port, water pump weep hole, and thermostat housing. These are progressive leaks that worsen over time.',
    category: 'cooling', severity: 'moderate',
    years: { start: 2002, end: 2009 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: ['Coolant leak', 'Sweet smell', 'Low coolant light', 'Overheating'],
    commonFixes: ['Water pump replacement ($200-$500)', 'Thermostat housing replacement ($150-$300)', 'Throttle body coolant port repair ($100-$200)'],
    dtcCodes: ['P0128']
  },

  // Venture
  {
    id: 'chevrolet-venture-34l-intake-gasket-1997',
    make: 'Chevrolet', model: 'Venture',
    title: '3.4L V6 Intake Manifold Gasket Leak',
    description: 'Same Dex-Cool intake gasket issue as other GM 3.4L vehicles. The gaskets deteriorate from coolant exposure and heat, causing external and internal leaks. This can lead to catastrophic engine damage if coolant enters the oil system.',
    category: 'engine', severity: 'high',
    years: { start: 1997, end: 2005 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: ['Coolant loss', 'Oil contamination', 'Overheating', 'Sweet coolant smell'],
    commonFixes: ['Intake manifold gasket replacement ($500-$1000)', 'Use updated Fel-Pro gaskets and switch coolant'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'chevrolet-venture-power-sliding-door-2000',
    make: 'Chevrolet', model: 'Venture',
    title: 'Power Sliding Door Motor and Cable Failure',
    description: 'The power sliding door system fails due to worn cables, motor burnout, and latch mechanism jamming. The door can become stuck partially open or refuse to open/close on the power setting.',
    category: 'body', severity: 'moderate',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: ['Door not opening or closing', 'Grinding noise from door', 'Door stuck partially open', 'Door reverses direction'],
    commonFixes: ['Door motor and cable assembly ($300-$600)', 'Latch mechanism replacement ($150-$300)'],
    dtcCodes: []
  },

  // Astro
  {
    id: 'chevrolet-astro-43l-intake-gasket-1996',
    make: 'Chevrolet', model: 'Astro',
    title: '4.3L V6 Intake Manifold Gasket Leak',
    description: 'Same intake gasket issue as all GM 4.3L vehicles. The composite gaskets fail, allowing coolant leaks. The Astro version is particularly problematic due to the engine positioned under the dash, making repairs more labor-intensive.',
    category: 'engine', severity: 'moderate',
    years: { start: 1996, end: 2005 },
    estimatedCost: { min: 500, max: 1100 },
    symptoms: ['Coolant loss', 'Overheating', 'Rough idle', 'Sweet coolant smell'],
    commonFixes: ['Intake manifold gasket replacement ($500-$1000, higher labor due to engine position)'],
    dtcCodes: ['P0171', 'P0174']
  },

  // Spark (modern)
  {
    id: 'chevrolet-spark-cvt-issues-2016',
    make: 'Chevrolet', model: 'Spark',
    title: 'CVT Transmission Shudder and Hesitation',
    description: 'The CVT automatic transmission in the Spark develops shudder during acceleration and hesitation from stops. The continuously variable transmission can also develop belt slippage at higher mileage.',
    category: 'transmission', severity: 'moderate',
    years: { start: 2016, end: 2022 },
    estimatedCost: { min: 1000, max: 3500 },
    symptoms: ['Shuddering during acceleration', 'Hesitation from stops', 'Whining noise', 'Loss of power'],
    commonFixes: ['CVT fluid change ($150-$300)', 'CVT replacement ($2500-$3500)'],
    dtcCodes: ['P0700', 'P0730', 'P0868']
  },

  // Bolt EV
  {
    id: 'chevrolet-bolt-ev-battery-recall-2017',
    make: 'Chevrolet', model: 'Bolt EV',
    title: 'High-Voltage Battery Fire Risk (Recall)',
    description: 'The Bolt EV was subject to a massive recall covering all model years (2017-2022) due to risk of battery fire from manufacturing defects in LG Chem battery cells. Defective anodes could cause thermal runaway. GM replaced all battery modules under recall.',
    category: 'electrical', severity: 'critical',
    years: { start: 2017, end: 2022 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: ['Battery fire', 'Smoke from undercarriage', 'Reduced range notification', 'Battery warning messages'],
    commonFixes: ['Battery module replacement under recall (no cost)', 'Software update to limit charge to 90% (interim fix)'],
    dtcCodes: []
  },

  // ============ GMC ============
  // C/K 1500
  {
    id: 'gmc-ck-1500-spider-injector-1996',
    make: 'GMC', model: 'C/K 1500',
    title: '5.7L Vortec Spider Injector Assembly Failure',
    description: 'Same CPI spider injector issue as Chevrolet C/K. The 5.7L Vortec V8 spider assembly poppet nozzles clog and fuel lines crack.',
    category: 'fuel', severity: 'high',
    years: { start: 1996, end: 1998 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: ['Hard starting', 'Rough idle', 'Fuel smell', 'Poor fuel economy'],
    commonFixes: ['Spider injector assembly replacement with MPFI upgrade ($400-$800)'],
    dtcCodes: ['P0171', 'P0174', 'P0300']
  },
  {
    id: 'gmc-ck-1500-4l60e-trans-1993',
    make: 'GMC', model: 'C/K 1500',
    title: '4L60E Automatic Transmission Failure',
    description: 'Same 4L60E transmission issues as Chevrolet C/K. Sun shell failure, 3-4 clutch pack burnup, and worn input drum.',
    category: 'transmission', severity: 'high',
    years: { start: 1993, end: 1998 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: ['Slipping in 3rd or 4th gear', 'Harsh shifts', 'No 3rd gear', 'Burnt fluid'],
    commonFixes: ['Transmission rebuild ($1500-$2500)', 'Transmission replacement ($2500-$3500)'],
    dtcCodes: ['P0700', 'P0741', 'P0742', 'P0751']
  },

  // C/K 2500
  {
    id: 'gmc-ck-2500-65l-diesel-pmd-1994',
    make: 'GMC', model: 'C/K 2500',
    title: '6.5L Diesel PMD/FSD Module Failure',
    description: 'Same 6.5L diesel injection pump PMD failure as Chevrolet C/K 2500. The Pump Mounted Driver overheats and causes stalling.',
    category: 'engine', severity: 'high',
    years: { start: 1994, end: 2000 },
    estimatedCost: { min: 300, max: 2500 },
    symptoms: ['Stalling while driving', 'No start when hot', 'Hard starting'],
    commonFixes: ['PMD relocation kit ($200-$400)', 'Injection pump rebuild ($1500-$2500)'],
    dtcCodes: []
  },

  // Jimmy
  {
    id: 'gmc-jimmy-43l-intake-gasket-1996',
    make: 'GMC', model: 'Jimmy',
    title: '4.3L V6 Intake Manifold Gasket Leak',
    description: 'Same intake gasket issue as S-10 Blazer. The 4.3L Vortec V6 composite intake gaskets fail from heat and Dex-Cool exposure.',
    category: 'engine', severity: 'moderate',
    years: { start: 1996, end: 2001 },
    estimatedCost: { min: 400, max: 900 },
    symptoms: ['Coolant leak', 'Low coolant', 'Overheating', 'Rough idle'],
    commonFixes: ['Intake manifold gasket replacement ($400-$800)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'gmc-jimmy-ball-joint-failure-1995',
    make: 'GMC', model: 'Jimmy',
    title: 'Lower Ball Joint Failure',
    description: 'Same ball joint issue as S-10/Blazer. Lower ball joints wear prematurely, especially on 4WD models, and can separate.',
    category: 'suspension', severity: 'critical',
    years: { start: 1995, end: 2001 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: ['Clunking over bumps', 'Loose steering', 'Uneven tire wear'],
    commonFixes: ['Lower ball joint replacement ($200-$400 per side)'],
    dtcCodes: []
  },

  // Sonoma
  {
    id: 'gmc-sonoma-43l-intake-gasket-1996',
    make: 'GMC', model: 'Sonoma',
    title: '4.3L V6 Intake Manifold Gasket Leak',
    description: 'Same intake gasket issue as the S-10 platform. The 4.3L Vortec V6 intake gaskets fail from heat cycling.',
    category: 'engine', severity: 'moderate',
    years: { start: 1996, end: 2004 },
    estimatedCost: { min: 400, max: 900 },
    symptoms: ['Coolant leak', 'Low coolant', 'Overheating'],
    commonFixes: ['Intake manifold gasket replacement ($400-$800)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'gmc-sonoma-fuel-pump-1991',
    make: 'GMC', model: 'Sonoma',
    title: 'In-Tank Fuel Pump Failure',
    description: 'Same fuel pump failure issues as the S-10. The in-tank pump fails from heat and debris.',
    category: 'fuel', severity: 'moderate',
    years: { start: 1991, end: 2004 },
    estimatedCost: { min: 400, max: 800 },
    symptoms: ['Stalling', 'Hard starting', 'Loss of power at speed'],
    commonFixes: ['Fuel pump module replacement ($400-$700)'],
    dtcCodes: ['P0230', 'P0231']
  },

  // Suburban (old)
  {
    id: 'gmc-suburban-57l-intake-gasket-1996',
    make: 'GMC', model: 'Suburban',
    title: '5.7L Vortec Intake Manifold Gasket and CPI Issues',
    description: 'The GMC Suburban shares the same 5.7L Vortec intake gasket and spider injector issues as the C/K 1500. The larger vehicle runs hotter, which can accelerate gasket degradation.',
    category: 'engine', severity: 'moderate',
    years: { start: 1996, end: 1999 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: ['Coolant leak', 'Rough idle', 'Hard starting', 'Fuel smell'],
    commonFixes: ['Intake gasket replacement ($400-$800)', 'Spider injector upgrade ($400-$800)'],
    dtcCodes: ['P0171', 'P0174', 'P0300']
  },

  // Safari
  {
    id: 'gmc-safari-43l-intake-gasket-1996',
    make: 'GMC', model: 'Safari',
    title: '4.3L V6 Intake Manifold Gasket Leak',
    description: 'Same intake gasket issue as the Astro van. The under-dash engine location makes this a more labor-intensive repair.',
    category: 'engine', severity: 'moderate',
    years: { start: 1996, end: 2005 },
    estimatedCost: { min: 500, max: 1100 },
    symptoms: ['Coolant leak', 'Overheating', 'Rough idle'],
    commonFixes: ['Intake manifold gasket replacement ($500-$1000)'],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'gmc-safari-fuel-pump-1990',
    make: 'GMC', model: 'Safari',
    title: 'In-Tank Fuel Pump Failure',
    description: 'Common fuel pump failure. The Safari twin-tank models have additional complexity with the tank switching system.',
    category: 'fuel', severity: 'moderate',
    years: { start: 1990, end: 2005 },
    estimatedCost: { min: 400, max: 800 },
    symptoms: ['Stalling', 'Hard starting', 'Loss of power'],
    commonFixes: ['Fuel pump module replacement ($400-$700)'],
    dtcCodes: ['P0230', 'P0231']
  }
];

// Add issues, checking for duplicates
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

console.log('Ford/GM 90s Issues Results:');
console.log('  Added: ' + added + ' issues');
console.log('  Total issues now: ' + data.issues.length);

// Breakdown by make
var makeCount = {};
newIssues.forEach(function(i) {
  if (makeCount[i.make] === undefined) makeCount[i.make] = 0;
  if (existingIds.has(i.id)) makeCount[i.make]++;
});
// Actually count what was really added
var added2 = {};
newIssues.forEach(function(i) {
  if (added2[i.make] === undefined) added2[i.make] = 0;
  added2[i.make]++;
});
console.log('\nBreakdown:');
Object.keys(added2).sort().forEach(function(make) {
  console.log('  ' + make + ': ' + added2[make] + ' issues');
});
