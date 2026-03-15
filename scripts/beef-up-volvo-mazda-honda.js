/**
 * Beef up Volvo, Mazda, and Honda models with additional known issues.
 * Skips issues that already exist (by checking titles).
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const newIssues = [
  // ─── Volvo XC60 (needs 4 more, has 4) ───
  // Already has: PCV Oil Trap failure, Oil Consumption, Trans Shudder, Air Suspension
  // Requested PCV already exists → skip. Add: timing belt tensioner, infotainment reboot, A/C compressor, plus one more
  {
    id: 'volvo-xc60-timing-belt-tensioner-2010',
    make: 'Volvo', model: 'XC60',
    years: [2010,2011,2012,2013,2014],
    category: 'engine',
    title: 'Timing Belt Tensioner Failure (3.2L I6)',
    description: 'The 3.2L B6324S inline-six used in 2010-2014 XC60 models is an interference engine with a timing belt. The hydraulic tensioner and idler pulleys can fail, causing the belt to slip or break, resulting in catastrophic valve-to-piston contact. Failure typically occurs between 80,000-120,000 miles if the belt service interval is missed.',
    solution: 'Replace timing belt, tensioner, idler pulleys, and water pump as a kit every 80,000-100,000 miles or 10 years. Use OEM or high-quality aftermarket kits (ContiTech, Gates). Budget 6-8 hours of labor due to tight engine bay.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Engine misfires at startup', 'Timing belt squealing or chirping', 'Rattling noise from front of engine', 'Engine fails to start (if belt breaks)', 'Check engine light'],
    affectedSystems: ['Timing belt', 'Timing belt tensioner', 'Idler pulleys', 'Water pump'],
    dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 800,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-xc60-infotainment-reboot-2018',
    make: 'Volvo', model: 'XC60',
    years: [2018,2019,2020,2021,2022,2023,2024,2025],
    category: 'electrical',
    title: 'Sensus/Google Infotainment System Random Reboots and Black Screen',
    description: 'The second-generation XC60 (SPA platform) suffers from intermittent infotainment system reboots, black screen events, and frozen displays. The Sensus system (2018-2021) and Google-based system (2022+) both exhibit this behavior, often triggered by software bugs, corrupted map data, or failing APIX module. Loss of the center screen disables climate controls, navigation, and camera systems.',
    solution: 'First try a system reset by holding the home button for 15+ seconds. Check for pending OTA or dealer software updates. If reboots persist, the APIX module or center display unit may need replacement under warranty or Volvo extended coverage. Some owners report improvement after deleting and re-downloading navigation maps.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Center screen goes black while driving', 'Infotainment reboots repeatedly', 'Backup camera unavailable', 'Climate controls unresponsive', 'Apple CarPlay/Android Auto disconnects'],
    affectedSystems: ['Infotainment display', 'APIX module', 'Center display unit', 'Climate control interface'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 1800,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-xc60-ac-compressor-clutch-2010',
    make: 'Volvo', model: 'XC60',
    years: [2010,2011,2012,2013,2014,2015,2016,2017],
    category: 'cooling',
    title: 'A/C Compressor Clutch and Bearing Failure',
    description: 'First-generation XC60 models experience premature A/C compressor clutch failure, often accompanied by a worn clutch bearing that produces a grinding or squealing noise when the A/C is engaged. The clutch may slip intermittently before failing completely, resulting in warm air from the vents. In some cases the compressor internal seals also fail, contaminating the system with metal debris.',
    solution: 'Replace the A/C compressor assembly (clutch-only replacement is possible but not recommended on high-mileage units). Flush the A/C system if metal debris is present, and replace the receiver/drier and expansion valve. Evacuate and recharge with R-134a refrigerant to proper specification.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Grinding or squealing noise when A/C engaged', 'A/C blows warm intermittently', 'A/C clutch clicks on and off rapidly', 'Burning smell from engine bay', 'Complete loss of cold air'],
    affectedSystems: ['A/C compressor', 'Compressor clutch', 'Clutch bearing', 'A/C system'],
    dtcCodes: [],
    estimatedCostLow: 600,
    estimatedCostHigh: 1400,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-xc60-rear-diff-bushing-2010',
    make: 'Volvo', model: 'XC60',
    years: [2010,2011,2012,2013,2014,2015,2016,2017],
    category: 'drivetrain',
    title: 'Rear Differential Mounting Bushing Wear (AWD)',
    description: 'AWD-equipped first-generation XC60 models develop worn rear differential mounting bushings, causing a clunking or thumping noise during acceleration, deceleration, or gear changes. The rubber bushings deteriorate over time, allowing the differential to move excessively. This is especially noticeable in cold weather and can be mistaken for transmission or driveshaft issues.',
    solution: 'Replace the rear differential mounting bushings. OEM bushings are fluid-filled and will eventually fail again; many owners upgrade to polyurethane or solid bushings for longer life at the cost of slightly increased NVH. The rear subframe must be partially lowered for access, requiring 2-3 hours of labor.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Clunk on acceleration from stop', 'Thump during gear changes', 'Vibration at highway speeds', 'Noise worse in cold weather', 'Clunk when shifting to reverse'],
    affectedSystems: ['Rear differential', 'Differential mounting bushings', 'Rear subframe'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Volvo S60 (needs 4 more, has 4) ───
  // Already has: REM water damage, PCV Oil Trap, 8-speed delayed engagement, T6 supercharger belt
  // Requested PCV already exists → skip. Add: ETM failure, rear shock tower corrosion, thermostat housing leak, plus one more
  {
    id: 'volvo-s60-etm-failure-2001',
    make: 'Volvo', model: 'S60',
    years: [2001,2002,2003,2004],
    category: 'engine',
    title: 'Electronic Throttle Module (ETM) Failure',
    description: 'The 2001-2004 S60 (and other P2 platform Volvos) is notorious for ETM failure due to a design flaw in the throttle body electronics. The module develops internal solder joint cracks and corroded contacts, causing the car to enter limp mode, stall at idle, or refuse to accelerate. Volvo issued an extended warranty covering ETMs up to 10 years/200,000 miles, but many are now beyond that coverage.',
    solution: 'Replace the ETM unit. Genuine Volvo replacement units have an updated design. Aftermarket options from Bosch are also available. Some specialists offer ETM rebuild services. Always reset the throttle adaptation values after replacement using a Volvo-compatible scanner (VIDA/DiCE).',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Check engine light with reduced engine power message', 'Car enters limp mode (limited to ~30 mph)', 'Stalling at idle or low speed', 'Rough or surging idle', 'Throttle unresponsive or delayed'],
    affectedSystems: ['Electronic throttle module', 'Throttle body', 'Engine control module'],
    dtcCodes: ['P0121', 'P0122', 'P0123', 'P1618'],
    estimatedCostLow: 300,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-s60-rear-shock-tower-corrosion-2001',
    make: 'Volvo', model: 'S60',
    years: [2001,2002,2003,2004,2005,2006,2007,2008,2009],
    category: 'body',
    title: 'Rear Shock Tower and Trunk Floor Corrosion',
    description: 'First-generation S60 models are prone to severe rust in the rear shock tower mounting points and trunk floor, particularly in salt-belt regions. Water intrusion through deteriorated trunk seals and blocked drain holes accelerates the corrosion. In advanced cases, the shock tower can punch through the floor, compromising structural integrity and making the car unsafe.',
    solution: 'Inspect rear shock towers annually, especially in northern climates. Early-stage corrosion can be treated with rust converter and undercoating. Moderate damage requires cutting out affected metal and welding in repair panels. Severely compromised shock towers may be uneconomical to repair. Keep trunk drain holes clear and replace deteriorated weather seals proactively.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Visible rust in trunk floor or wheel wells', 'Clunking from rear suspension', 'Wet trunk or spare tire well', 'Rear shock mount feels loose', 'Failed state safety inspection'],
    affectedSystems: ['Rear shock towers', 'Trunk floor', 'Rear suspension mounts', 'Body structure'],
    dtcCodes: [],
    estimatedCostLow: 500,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-s60-thermostat-housing-leak-2001',
    make: 'Volvo', model: 'S60',
    years: [2001,2002,2003,2004,2005,2006,2007,2008,2009],
    category: 'cooling',
    title: 'Thermostat Housing Coolant Leak (Turbo 5-Cylinder)',
    description: 'The plastic thermostat housing on P2-platform S60 turbo models (T5 and 2.4T) is prone to cracking and leaking coolant, especially as the housing ages and becomes brittle from heat cycling. The leak typically starts as a slow seep around the housing gasket or where the housing meets the cylinder head, and can progress to a significant coolant loss if not addressed.',
    solution: 'Replace the thermostat housing with an updated design. Many owners opt for an aluminum aftermarket housing (e.g., from do88 or Genuine Volvo updated part) to prevent recurrence. Replace the thermostat, gasket, and coolant hose O-rings at the same time. Refill with Volvo-spec coolant and bleed the system thoroughly.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Coolant smell from engine bay', 'Low coolant warning light', 'Visible coolant drip on front of engine', 'Slow coolant level drop', 'Overheating in severe cases'],
    affectedSystems: ['Thermostat housing', 'Thermostat', 'Cooling system', 'Coolant hoses'],
    dtcCodes: ['P0128'],
    estimatedCostLow: 200,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-s60-upper-engine-mount-2001',
    make: 'Volvo', model: 'S60',
    years: [2001,2002,2003,2004,2005,2006,2007,2008,2009],
    category: 'engine',
    title: 'Upper Engine Mount (Torque Rod) Failure',
    description: 'The upper engine torque mount on P2-platform S60 models is a common wear item that fails between 60,000-100,000 miles. The hydraulic-filled mount splits and leaks fluid, causing excessive engine movement during acceleration and deceleration. This leads to harsh shifting feel, drivetrain vibrations, and clunking noises that can be mistaken for transmission problems.',
    solution: 'Replace the upper engine torque mount. OEM Volvo or high-quality aftermarket mounts (Lemforder, Hutchinson) are recommended. The job requires removing the engine cover and cross-brace for access. Takes about 1-2 hours. Many owners replace the lower engine mount and transmission mount at the same time for a complete refresh.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Clunk when shifting from park to drive/reverse', 'Excessive engine rocking on acceleration', 'Vibration at idle felt through steering wheel', 'Harsh or jerky gear changes', 'Visible fluid leak from top of engine mount'],
    affectedSystems: ['Upper engine mount', 'Torque rod', 'Engine mounting system'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Volvo V70 (needs 5 more, has 3) ───
  // Already has: ETM failure, PCV breather box, AWD angle gear seal
  // Requested ETM, PCV, angle gear already exist → skip. Add: transmission solenoid, dashboard pixel, rear air spring, plus 2 more
  {
    id: 'volvo-v70-trans-solenoid-1998',
    make: 'Volvo', model: 'V70',
    years: [1998,1999,2000,2001,2002,2003,2004,2005,2006,2007],
    category: 'transmission',
    title: 'AW55-50/AW55-51 Automatic Transmission Solenoid Failure',
    description: 'The Aisin-Warner AW55-50 and AW55-51 automatic transmissions used in V70 models are known for solenoid failures, particularly the SL1 and SL2 linear solenoids that control shift pressure. Failed solenoids cause harsh or delayed shifts, transmission slipping, and limp mode engagement. The solenoids deteriorate due to ATF contamination and heat, especially when fluid changes are neglected.',
    solution: 'Replace the failed solenoid(s) and perform a complete transmission fluid and filter change. A full solenoid kit is recommended since multiple solenoids often fail in sequence. The valve body must be removed for access. Use genuine Aisin solenoids and Volvo-spec ATF. Reset transmission adaptations with VIDA/DiCE after repair.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Harsh or delayed 2-3 upshift', 'Transmission slipping under load', 'Limp mode (stuck in 3rd gear)', 'Check engine light with transmission codes', 'Flashing arrow on instrument cluster'],
    affectedSystems: ['Transmission solenoids', 'Valve body', 'Automatic transmission', 'TCM'],
    dtcCodes: ['P0750', 'P0755', 'P0760', 'P2707'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-v70-dashboard-pixel-1998',
    make: 'Volvo', model: 'V70',
    years: [1998,1999,2000,2001,2002,2003,2004,2005,2006,2007],
    category: 'electrical',
    title: 'Dashboard Instrument Cluster (DIM) Pixel Failure',
    description: 'The Driver Information Module (DIM) on P2-platform V70 models suffers from progressive LCD pixel failure, making odometer, trip computer, and gear indicator readings partially or completely unreadable. The issue is caused by deteriorating ribbon cable connections between the LCD and the circuit board due to heat cycling. This is primarily a cosmetic/usability issue but can affect resale value and state inspections.',
    solution: 'The instrument cluster can be sent to a specialist for ribbon cable resoldering or LCD replacement for $150-$300. DIY repair kits with new ribbon cables are available for $20-$50 for those comfortable with delicate soldering. Full used cluster replacement is another option but requires mileage correction by a dealer. Volvo does not offer an official repair program.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Missing or faded pixels on instrument cluster display', 'Odometer reading partially invisible', 'Gear indicator hard to read', 'Trip computer display blank or garbled', 'Progressively worsening over time'],
    affectedSystems: ['Instrument cluster', 'DIM (Driver Information Module)', 'LCD display'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-v70-rear-air-spring-1998',
    make: 'Volvo', model: 'V70',
    years: [1998,1999,2000,2001,2002,2003,2004,2005,2006,2007],
    category: 'suspension',
    title: 'Rear Self-Leveling Air Spring Failure (NIVOMAT/Four-C)',
    description: 'V70 models equipped with self-leveling rear suspension use either Nivomat self-pumping struts or electronically controlled Four-C air springs. Both systems are prone to failure with age, causing the rear of the car to sag, especially when loaded. Nivomat units lose their internal nitrogen charge and hydraulic fluid, while Four-C air springs develop leaks in the rubber bladders.',
    solution: 'For Nivomat-equipped cars, replace with new Nivomat units ($200-$400 each) or convert to standard struts and springs ($400-$600 for the conversion kit). For Four-C systems, replace the leaking air spring(s) and check the compressor. Many owners convert to conventional coil spring suspension to eliminate the complexity and future maintenance costs.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Rear of vehicle sags when parked overnight', 'Rear end drops when loaded with cargo', 'Bouncy or wallowing ride quality', 'Suspension compressor running constantly (Four-C)', 'Uneven ride height side to side'],
    affectedSystems: ['Rear air springs', 'Nivomat struts', 'Self-leveling suspension', 'Air compressor'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-v70-heater-core-leak-1998',
    make: 'Volvo', model: 'V70',
    years: [1998,1999,2000,2001,2002,2003,2004,2005,2006,2007],
    category: 'cooling',
    title: 'Heater Core Leak and Coolant Smell in Cabin',
    description: 'The heater core on P2-platform V70 models can develop pinhole leaks due to internal corrosion, especially when coolant maintenance is neglected. Symptoms include a sweet coolant smell inside the cabin, foggy windshield, and wet passenger footwell carpet. The heater core is buried deep behind the dashboard, making it one of the most labor-intensive repairs on this platform.',
    solution: 'Replace the heater core, which requires partial or complete dashboard removal (8-12 hours of labor). Flush the cooling system thoroughly and refill with fresh Volvo-spec coolant. Check and replace heater hoses and the heater control valve at the same time. To prevent recurrence, maintain coolant with proper mix ratio and change it every 5 years.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Sweet coolant smell from vents', 'Foggy windshield that does not clear', 'Wet or damp passenger footwell carpet', 'Slow coolant level drop with no external leak', 'Windows fog up quickly in cold weather'],
    affectedSystems: ['Heater core', 'HVAC system', 'Cooling system', 'Dashboard assembly'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 1800,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-v70-tailgate-wiring-2001',
    make: 'Volvo', model: 'V70',
    years: [2001,2002,2003,2004,2005,2006,2007],
    category: 'electrical',
    title: 'Tailgate Wiring Harness Chafe and Breakage',
    description: 'The wiring harness that passes through the tailgate hinge area on V70 wagons is prone to chafing and breaking due to repeated opening and closing. As the protective loom wears through, individual wires fatigue and snap, causing intermittent or permanent failure of tail lights, license plate lights, rear wiper, rear defroster, and the rear washer. This is a safety concern as it can disable brake lights.',
    solution: 'Inspect the wiring harness in the tailgate hinge area for damaged insulation and broken wires. Repair individual broken wires with solder and heat-shrink tubing, or replace the entire tailgate harness section. Reposition the loom to reduce future chafing and secure it with additional protective conduit. Check all tailgate electrical functions after repair.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Rear lights intermittently not working', 'Rear wiper stops working', 'Rear defroster inoperative', 'License plate light out', 'Multiple tailgate electrical failures'],
    affectedSystems: ['Tailgate wiring harness', 'Rear lighting', 'Rear wiper motor', 'Rear defroster'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Volvo 850 (needs 4 more, has 4) ───
  // Already has: PCV/flame trap, AW50-42 trans shudder, distributor cap, heater core
  // Requested flame trap, trans solenoid (have shudder), heater core already exist → skip
  // Add: front strut mount bearing, plus 3 new ones
  {
    id: 'volvo-850-front-strut-mount-1993',
    make: 'Volvo', model: '850',
    years: [1993,1994,1995,1996,1997],
    category: 'suspension',
    title: 'Front Strut Mount Bearing Failure and Clunking',
    description: 'The front strut mount bearings on the Volvo 850 wear out prematurely, causing a clunking or popping noise when turning the steering wheel, especially at low speeds during parking maneuvers. The rubber isolator portion of the mount also deteriorates, allowing metal-to-metal contact and increased road noise. Worn mounts also affect front-end alignment and tire wear.',
    solution: 'Replace both front strut mounts and bearings as a pair. Use OEM Volvo or quality aftermarket mounts (Sachs, Lemforder). It is recommended to replace the struts at the same time if they have more than 80,000 miles, as the spring must be compressed for mount replacement. Get a front-end alignment after the repair.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Clunking or popping noise when turning at low speed', 'Creaking over bumps', 'Loose or vague steering feel', 'Uneven front tire wear', 'Vibration through steering wheel at highway speed'],
    affectedSystems: ['Front strut mounts', 'Strut mount bearings', 'Front suspension', 'Steering system'],
    dtcCodes: [],
    estimatedCostLow: 250,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-850-fuel-pressure-regulator-1993',
    make: 'Volvo', model: '850',
    years: [1993,1994,1995,1996,1997],
    category: 'fuel',
    title: 'Fuel Pressure Regulator Diaphragm Leak',
    description: 'The fuel pressure regulator (FPR) on the 850 is mounted on the fuel rail and uses a rubber diaphragm to regulate fuel pressure. The diaphragm deteriorates with age and heat exposure, allowing raw fuel to leak into the vacuum line connected to the intake manifold. This causes rich running, hard starting (especially hot), poor fuel economy, and a strong fuel smell. It can also foul spark plugs.',
    solution: 'Replace the fuel pressure regulator. Check the vacuum line for fuel contamination and replace if saturated. Inspect and replace fouled spark plugs. The FPR is inexpensive ($30-$60) and accessible on top of the fuel rail, making this a straightforward DIY repair. Clear any stored fault codes after replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Strong fuel smell from engine bay', 'Hard hot starting', 'Rich running and black exhaust smoke', 'Poor fuel economy', 'Fouled spark plugs'],
    affectedSystems: ['Fuel pressure regulator', 'Fuel rail', 'Vacuum system', 'Spark plugs'],
    dtcCodes: ['P0172', 'P0175'],
    estimatedCostLow: 100,
    estimatedCostHigh: 300,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-850-speedometer-failure-1993',
    make: 'Volvo', model: '850',
    years: [1993,1994,1995,1996,1997],
    category: 'electrical',
    title: 'Speedometer and Odometer Intermittent Failure',
    description: 'The instrument cluster on the Volvo 850 is prone to intermittent speedometer and odometer failure caused by deteriorating solder joints on the circuit board, particularly on the vehicle speed signal circuit. The speedometer may bounce, read incorrectly, or drop to zero while driving. Since the ECU uses vehicle speed data for shift points and idle control, this can also cause rough shifting and erratic idle.',
    solution: 'Remove the instrument cluster and resolder the cold solder joints on the back of the circuit board, paying attention to the speed sensor signal pins. This is a common DIY fix. Alternatively, send the cluster to a specialist for professional resoldering ($100-$200). If the cluster is beyond repair, source a used unit and have the odometer mileage corrected by a dealer.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Speedometer drops to zero intermittently', 'Speedometer needle bounces', 'Odometer stops counting', 'Cruise control will not engage', 'Transmission shifts erratically'],
    affectedSystems: ['Instrument cluster', 'Speedometer', 'Odometer', 'Vehicle speed signal'],
    dtcCodes: ['P0500'],
    estimatedCostLow: 50,
    estimatedCostHigh: 300,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'volvo-850-power-window-regulator-1993',
    make: 'Volvo', model: '850',
    years: [1993,1994,1995,1996,1997],
    category: 'electrical',
    title: 'Power Window Regulator Cable Breakage',
    description: 'The cable-driven power window regulators on the Volvo 850 are known to fail when the steel cable frays or snaps, causing the window to drop into the door or become stuck partway. The driver window is most commonly affected due to higher usage. The plastic guide rollers also wear out, putting additional stress on the cable. This issue typically occurs after 100,000+ miles.',
    solution: 'Replace the window regulator assembly (cable and motor are typically sold as a unit). Aftermarket regulators are available for $40-$80 and are generally reliable. Remove the door panel, disconnect the window from the old regulator, install the new unit, and test operation before reassembling. Lubricate the window tracks with silicone spray during reassembly.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Window drops into door suddenly', 'Window moves slowly or unevenly', 'Grinding noise from door when operating window', 'Window stuck partway open or closed', 'Motor runs but window does not move'],
    affectedSystems: ['Power window regulator', 'Window cable', 'Window motor', 'Guide rollers'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 350,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Mazda CX-9 (needs 4 more, has 4) ───
  // Already has: Timing chain stretch 3.7L, turbo coolant line, transfer case leak, power liftgate
  // Requested timing chain (have 3.7 but user asked 2.5T), transfer case, liftgate already exist
  // Add: timing chain 2.5T, A/C evaporator, plus 2 more
  {
    id: 'mazda-cx9-timing-chain-stretch-2016',
    make: 'Mazda', model: 'CX-9',
    years: [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
    category: 'engine',
    title: 'Timing Chain Stretch and Rattle (2.5L Turbo SkyActiv)',
    description: 'The second-generation CX-9 with the 2.5L turbocharged SkyActiv-G engine can develop timing chain stretch, producing a rattle or whine at startup that may persist for several seconds. Unlike the first-gen 3.7L V6 issue, the 2.5T chain stretch is typically less severe but still requires attention. The issue is linked to extended oil change intervals and use of non-synthetic oil allowing chain guide and tensioner wear.',
    solution: 'Use full synthetic 0W-20 oil and change at 5,000-mile intervals (not the 7,500-10,000 Mazda suggests for normal driving). If chain rattle is present, the timing chain, tensioner, and guides should be replaced. Mazda has issued TSBs for software updates to address cold-start rattle in some model years. Inspect during valve cover gasket or cam seal service.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Rattle or whine at cold startup lasting 2-10 seconds', 'Check engine light', 'Reduced engine performance', 'Rough idle after cold start', 'Metallic ticking noise from engine'],
    affectedSystems: ['Timing chain', 'Chain tensioner', 'Chain guides', 'Variable valve timing'],
    dtcCodes: ['P0016', 'P0017', 'P0014'],
    estimatedCostLow: 800,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-cx9-ac-evaporator-leak-2007',
    make: 'Mazda', model: 'CX-9',
    years: [2007,2008,2009,2010,2011,2012,2013,2014,2015],
    category: 'cooling',
    title: 'A/C Evaporator Core Leak and Refrigerant Loss',
    description: 'First-generation CX-9 models are prone to A/C evaporator core leaks, causing gradual refrigerant loss and reduced cooling performance. The evaporator develops pinhole leaks from internal corrosion, often accelerated by moisture and debris in the system. Symptoms worsen in hot weather and the system may need annual recharges before the leak source is identified, as evaporator leaks are difficult to detect without UV dye.',
    solution: 'Replace the A/C evaporator core, which requires dashboard removal (8-12 hours labor). Have the system evacuated, replace the receiver/drier and expansion valve, and recharge with R-134a. Add UV dye during recharge to make future leaks easier to detect. This is expensive due to labor, but recharging annually is not a long-term solution as moisture entering the system causes further damage.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['A/C gradually loses cooling over weeks/months', 'A/C only cold after recharge for a few months', 'Musty smell from vents', 'Water dripping on passenger footwell', 'A/C compressor short-cycling'],
    affectedSystems: ['A/C evaporator core', 'A/C system', 'Receiver/drier', 'HVAC housing'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 1800,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-cx9-water-pump-leak-2007',
    make: 'Mazda', model: 'CX-9',
    years: [2007,2008,2009,2010,2011,2012,2013,2014,2015],
    category: 'cooling',
    title: 'Water Pump and Coolant Crossover Pipe Leak (3.7L V6)',
    description: 'The Ford-derived 3.7L Cyclone V6 in first-gen CX-9 models has a water pump mounted in the engine V that is driven by the timing chain. The pump seal and the coolant crossover pipe gaskets are common failure points, causing coolant to leak internally or externally. Because the pump is chain-driven and located behind the timing cover, replacement is extremely labor-intensive.',
    solution: 'Replace the water pump, timing chain, tensioners, and guides as a complete job since they share access. Budget for 10-15 hours of labor. Replace the coolant crossover pipe gaskets at the same time. Use OEM or high-quality parts — this is not a job you want to repeat. Some shops quote $2,000-$3,500 depending on the region.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Coolant leak from front/center of engine', 'Overheating at idle or in traffic', 'Low coolant warning', 'Sweet coolant smell', 'White residue around timing cover area'],
    affectedSystems: ['Water pump', 'Coolant crossover pipe', 'Timing cover', 'Cooling system'],
    dtcCodes: ['P0128'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 3500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-cx9-rear-diff-coupling-2007',
    make: 'Mazda', model: 'CX-9',
    years: [2007,2008,2009,2010,2011,2012,2013,2014,2015],
    category: 'drivetrain',
    title: 'Rear Differential Coupling Failure (AWD)',
    description: 'AWD CX-9 models use an electronically controlled rear differential coupling to distribute torque. The coupling can overheat and fail during aggressive driving or towing, and the internal clutch pack wears over time. A failing coupling may cause AWD warning lights, vibrations during turns, and eventual loss of rear-wheel drive engagement. Neglected fluid changes accelerate wear.',
    solution: 'Change the rear differential coupling fluid every 30,000 miles with Mazda-specified fluid. If the coupling is worn or damaged, replace the unit ($800-$1,500 for the part). Ensure the front-to-rear tire circumference is matched (within 2/32" tread depth difference) to prevent premature coupling wear. Reset the coupling adaptation with a Mazda scan tool after service.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['AWD warning light on dashboard', 'Vibration or binding in tight turns', 'Grinding noise from rear', 'Loss of traction in rear wheels', 'Burning smell from rear differential area'],
    affectedSystems: ['Rear differential coupling', 'AWD system', 'Transfer case', 'Rear differential'],
    dtcCodes: ['P1889', 'C1288'],
    estimatedCostLow: 200,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Mazda Mazda6 (needs 4 more, has 4) ───
  // Already has: subframe rust, VVT actuator, clutch judder, rear brake caliper
  // Requested rust, clutch, VVT, alternator — rust/clutch/VVT exist. Add: alternator + 3 new
  {
    id: 'mazda-mazda6-alternator-failure-2003',
    make: 'Mazda', model: 'Mazda6',
    years: [2003,2004,2005,2006,2007,2008],
    category: 'electrical',
    title: 'Alternator Premature Failure and Charging System Issues',
    description: 'First-generation Mazda6 models (especially with the 2.3L and 3.0L engines) experience premature alternator failure, often between 60,000-100,000 miles. The internal voltage regulator and rectifier diodes fail, causing undercharging or overcharging. Symptoms include dimming lights, battery warning light, and eventually a dead battery. The 3.0L V6 alternator is particularly prone due to its location near exhaust heat.',
    solution: 'Replace the alternator with a new or quality remanufactured unit. Avoid cheap rebuilds as they tend to fail again quickly. Test the battery and replace if it has been deeply discharged. Inspect the serpentine belt and tensioner during the service. For 3.0L models, consider adding a heat shield if the replacement unit does not include one.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Battery warning light on dashboard', 'Dimming headlights at idle', 'Electrical accessories cutting out', 'Battery keeps dying', 'Whining noise from alternator area'],
    affectedSystems: ['Alternator', 'Charging system', 'Battery', 'Voltage regulator'],
    dtcCodes: ['P0620', 'P0621'],
    estimatedCostLow: 300,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mazda6-rear-trailing-arm-bushing-2003',
    make: 'Mazda', model: 'Mazda6',
    years: [2003,2004,2005,2006,2007,2008],
    category: 'suspension',
    title: 'Rear Trailing Arm Bushing Deterioration',
    description: 'The rear trailing arm bushings on first-generation Mazda6 models deteriorate and crack with age, causing a noticeable clunking sound from the rear over bumps and during braking. The degraded bushings allow excessive rear axle movement, leading to vague handling, rear tire inner-edge wear, and a wandering feel at highway speeds. This issue accelerates in climates with road salt and temperature extremes.',
    solution: 'Replace the rear trailing arm bushings. Press out the old bushings and install new OEM or polyurethane replacements. Some owners replace the entire trailing arm assembly if the bushing press is not available. A rear alignment is required after bushing replacement. Budget 2-3 hours of labor per side.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Clunking from rear over bumps', 'Rear-end feels loose or wandering', 'Inner-edge rear tire wear', 'Thumping during hard braking', 'Unstable feeling in highway curves'],
    affectedSystems: ['Rear trailing arm bushings', 'Rear suspension', 'Rear axle alignment'],
    dtcCodes: [],
    estimatedCostLow: 250,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mazda6-egr-valve-carbon-2014',
    make: 'Mazda', model: 'Mazda6',
    years: [2014,2015,2016,2017,2018,2019,2020,2021],
    category: 'engine',
    title: 'EGR Valve Carbon Buildup and Coolant Leak (SkyActiv 2.5L)',
    description: 'The SkyActiv 2.5L engine in third-generation Mazda6 models uses a cooled EGR system that is prone to carbon buildup and coolant leaks. The EGR valve and cooler accumulate carbon deposits over time, restricting flow and causing rough idle and reduced performance. Additionally, the EGR cooler gaskets can leak coolant into the intake or externally, creating a potential overheating risk.',
    solution: 'Remove and clean the EGR valve and passages with carburetor cleaner and a wire brush. Replace the EGR cooler gaskets. If the EGR valve is stuck or damaged, replace it. Mazda issued TSB 01-018/17 for EGR-related issues. Use top-tier fuel and consider an occasional Italian tune-up (sustained highway driving) to help reduce carbon buildup.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Rough idle', 'Check engine light', 'Coolant smell from engine bay', 'Reduced power and hesitation', 'Slow coolant level drop'],
    affectedSystems: ['EGR valve', 'EGR cooler', 'Intake manifold', 'Cooling system'],
    dtcCodes: ['P0401', 'P0402', 'P0128'],
    estimatedCostLow: 200,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mazda6-control-arm-ball-joint-2009',
    make: 'Mazda', model: 'Mazda6',
    years: [2009,2010,2011,2012,2013],
    category: 'suspension',
    title: 'Front Lower Control Arm Ball Joint Premature Wear',
    description: 'Second-generation Mazda6 models are known for premature front lower control arm ball joint wear, sometimes as early as 40,000-60,000 miles. The ball joint boots crack and allow grease to escape and moisture to enter, accelerating wear. A failed ball joint is a serious safety concern as it can cause loss of steering control. Mazda issued a recall (NHTSA 14V-373) for some 2009-2010 models.',
    solution: 'Replace the front lower control arms (the ball joints are not separately serviceable). Use OEM or quality aftermarket arms (Mevotech, Moog). Replace both sides even if only one is worn, as the other is likely not far behind. Perform a front-end alignment after replacement. Check if your VIN is covered under the recall for free repair.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Clunking or popping noise over bumps', 'Steering wheel vibration', 'Vehicle pulls to one side', 'Uneven front tire wear', 'Loose or wandering steering feel'],
    affectedSystems: ['Front lower control arms', 'Ball joints', 'Front suspension', 'Steering system'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Mazda Mazda3 (needs 4 more, has 5) ───
  // Already has: clutch judder, carbon buildup, dashboard melting, rear brake caliper, infotainment freeze
  // Requested clutch, dashboard rattles, rear brake already exist. Add: windshield stress crack + 3 new
  {
    id: 'mazda-mazda3-windshield-stress-crack-2019',
    make: 'Mazda', model: 'Mazda3',
    years: [2019,2020,2021,2022,2023,2024,2025],
    category: 'body',
    title: 'Windshield Spontaneous Stress Cracking',
    description: 'Fourth-generation Mazda3 (BP) owners report an unusually high rate of windshield stress cracks that appear without any visible impact point. The cracking typically originates from the edges of the windshield, often near the A-pillar or bottom edge, and spreads across the glass. The issue may be related to the windshield\'s steep rake angle, body flex, or manufacturing tolerances in the glass bonding process.',
    solution: 'Replace the windshield. File an insurance claim as stress cracks are typically covered under comprehensive coverage. Some owners have successfully had Mazda cover the replacement under goodwill warranty, especially if the crack appears with no impact point on a low-mileage vehicle. Use OEM glass to ensure proper fit with the rain sensor, HUD (if equipped), and ADAS camera calibration.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Crack appears on windshield with no impact point', 'Crack starts from edge of windshield', 'Crack appears after temperature change', 'Progressive crack growth over days', 'Multiple windshield replacements needed'],
    affectedSystems: ['Windshield', 'Windshield bonding', 'ADAS camera calibration'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mazda3-purge-valve-2014',
    make: 'Mazda', model: 'Mazda3',
    years: [2014,2015,2016,2017,2018],
    category: 'fuel',
    title: 'EVAP Purge Valve Failure and Fuel Odor',
    description: 'Third-generation Mazda3 models with the SkyActiv 2.0L and 2.5L engines experience premature EVAP canister purge valve failure. The valve can stick open, flooding the engine with fuel vapors and causing rough idle, stalling, and a strong fuel smell. Conversely, a stuck-closed valve prevents the EVAP system from purging, triggering check engine lights for evaporative system leak codes.',
    solution: 'Replace the EVAP canister purge valve (Mazda part PE01-18-741). The valve is located on top of the engine near the intake manifold and takes about 30 minutes to replace. Clear the check engine codes after replacement. If the car has been running with a stuck-open valve, check the charcoal canister for fuel saturation and replace if needed.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Check engine light with EVAP codes', 'Strong fuel odor', 'Rough idle especially when cold', 'Hesitation on acceleration', 'Difficulty filling the fuel tank (pump nozzle clicks off)'],
    affectedSystems: ['EVAP purge valve', 'Charcoal canister', 'EVAP system', 'Fuel system'],
    dtcCodes: ['P0441', 'P0446', 'P0451', 'P0455'],
    estimatedCostLow: 80,
    estimatedCostHigh: 250,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mazda3-rear-shock-mount-2004',
    make: 'Mazda', model: 'Mazda3',
    years: [2004,2005,2006,2007,2008,2009],
    category: 'suspension',
    title: 'Rear Shock Absorber Upper Mount Failure',
    description: 'First-generation Mazda3 models develop worn rear shock absorber upper mounts, producing a hollow knocking sound from the rear over bumps and rough roads. The rubber bushing in the upper mount compresses and deteriorates, and the mount bearing can seize. This causes the rear of the car to feel unsettled and bouncy, particularly noticeable on highway expansion joints and rough pavement.',
    solution: 'Replace the rear shock absorbers and upper mounts as a set. OEM or quality aftermarket shocks (KYB Excel-G, Monroe) with new mounts are recommended. The rear shocks are straightforward to replace with basic tools — no spring compressor needed as the springs are separate from the struts on this model. Budget about 1-2 hours for both sides.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Knocking or clunking from rear over bumps', 'Bouncy ride quality', 'Rear end feels unsettled', 'Noise worse in cold weather', 'Visible shock fluid leak'],
    affectedSystems: ['Rear shock absorbers', 'Rear shock upper mounts', 'Rear suspension'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mazda3-torsion-beam-bushing-2014',
    make: 'Mazda', model: 'Mazda3',
    years: [2014,2015,2016,2017,2018],
    category: 'suspension',
    title: 'Rear Torsion Beam Bushing Deterioration',
    description: 'Third-generation Mazda3 models with the torsion beam rear suspension develop worn rear axle bushings that cause a vague, wandering rear end and clunking over bumps. The rubber bushings deteriorate from road salt, UV exposure, and age, allowing excess play in the rear axle. This affects handling precision and rear tire alignment, leading to inner-edge tire wear.',
    solution: 'Replace the rear torsion beam bushings. The bushings must be pressed out and new ones pressed in, requiring a hydraulic press. Some owners replace the entire torsion beam assembly with a used unit if the bushings are severely deteriorated. Perform a rear alignment after bushing replacement. Polyurethane bushing upgrades are available for improved longevity.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Clunking from rear over bumps', 'Rear-end wandering feel at highway speed', 'Inner-edge rear tire wear', 'Loose feeling in rear end during lane changes', 'Popping noise when backing up and turning'],
    affectedSystems: ['Rear torsion beam', 'Rear axle bushings', 'Rear suspension', 'Rear alignment'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Mazda MX-5 Miata (needs 4 more, has 5) ───
  // Already has: CPS failure NB, rear main seal, soft top delamination, short nose crank NA, diff whine ND
  // All 4 requested already exist! Add 4 completely new ones
  {
    id: 'mazda-mx5-miata-nb-coolant-overflow-1999',
    make: 'Mazda', model: 'MX-5 Miata',
    years: [1999,2000,2001,2002,2003,2004,2005],
    category: 'cooling',
    title: 'Radiator Coolant Overflow and Cracked Upper Tank (NB)',
    description: 'NB Miata radiators are prone to failure at the plastic upper tank where it crimps onto the aluminum core. The plastic becomes brittle with age and heat cycling, developing hairline cracks that leak coolant under pressure. This can lead to sudden coolant loss and overheating, especially in spirited driving or hot weather. The OEM radiator typically fails between 80,000-120,000 miles.',
    solution: 'Replace the radiator with a full-aluminum aftermarket unit (Koyo, Mishimoto, CSF) for permanent reliability improvement, or use an OEM-style replacement. Replace the radiator cap and inspect all hoses. A thermostat replacement is recommended at the same time. Budget 1-2 hours for the swap. An aluminum radiator costs $150-$250 and eliminates the plastic tank failure point.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Coolant drip from front of radiator', 'Coolant overflow tank level dropping', 'Overheating in traffic or spirited driving', 'White residue on radiator top tank', 'Sweet coolant smell after driving'],
    affectedSystems: ['Radiator', 'Cooling system', 'Radiator cap', 'Coolant overflow'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mx5-miata-nc-power-steering-2006',
    make: 'Mazda', model: 'MX-5 Miata',
    years: [2006,2007,2008,2009,2010,2011,2012,2013,2014,2015],
    category: 'steering',
    title: 'Electric Power Steering (EPS) Failure and Warning Light (NC)',
    description: 'The NC Miata uses an electric power steering system that can fail due to a faulty steering angle sensor, EPS control module, or motor. When the system fails, the EPS warning light illuminates and power assist is lost, making the steering very heavy at low speeds. While the car remains drivable (it is manual rack-and-pinion underneath), parking and tight maneuvers become difficult.',
    solution: 'Diagnose with a Mazda scan tool to identify the specific failed component (sensor, module, or motor). The steering angle sensor is the most common failure and can be recalibrated or replaced relatively affordably. If the EPS motor or control module has failed, replacement costs are higher. Some owners have had success with used EPS units from junkyards ($200-$400).',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['EPS warning light on dashboard', 'Sudden loss of power steering assist', 'Heavy steering at low speed', 'Intermittent power steering assist', 'Steering assist returns after restart'],
    affectedSystems: ['Electric power steering motor', 'EPS control module', 'Steering angle sensor', 'Steering column'],
    dtcCodes: ['C1515', 'C1516', 'C1530'],
    estimatedCostLow: 200,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mx5-miata-nd-infotainment-2016',
    make: 'Mazda', model: 'MX-5 Miata',
    years: [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
    category: 'electrical',
    title: 'Mazda Connect Infotainment USB and Bluetooth Connectivity Issues (ND)',
    description: 'The ND Miata\'s Mazda Connect infotainment system is plagued by USB connectivity drops, Bluetooth pairing failures, and occasional system freezes. USB-connected phones may disconnect repeatedly, and Bluetooth audio can cut out or develop significant delay. The 7-inch screen can freeze requiring a system reset. Mazda has issued multiple software updates but the issues persist for many owners across model years.',
    solution: 'Update the Mazda Connect firmware to the latest version (available for free download from Mazda\'s website). Try different USB cables (use short, high-quality cables). Delete and re-pair Bluetooth devices. For persistent freezes, perform a master reset by pressing and holding the NAV, MUTE, and BACK buttons simultaneously. Some owners report improvement after replacing the USB hub module.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['USB phone connection drops repeatedly', 'Bluetooth audio cuts out', 'Infotainment screen freezes', 'CarPlay/Android Auto disconnects', 'System slow to boot on startup'],
    affectedSystems: ['Mazda Connect infotainment', 'USB hub', 'Bluetooth module', 'CMU (connectivity master unit)'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'mazda-mx5-miata-na-timing-belt-water-pump-1990',
    make: 'Mazda', model: 'MX-5 Miata',
    years: [1990,1991,1992,1993,1994,1995,1996,1997],
    category: 'engine',
    title: 'Timing Belt and Water Pump Failure (NA 1.6L/1.8L)',
    description: 'Both the 1.6L B6 and 1.8L BP engines in the NA Miata are interference engines that require timing belt replacement every 60,000 miles. A broken timing belt causes pistons to strike valves, resulting in bent valves and potentially damaged pistons — often totaling the engine. The water pump, driven by the timing belt, frequently leaks around the same interval and should be replaced proactively.',
    solution: 'Replace the timing belt, water pump, front crank seal, cam seals, tensioner spring, and idler pulley as a complete kit every 60,000 miles. Quality kits from Gates or Continental are available for $80-$150. This is a popular DIY job (4-6 hours) with excellent online guides. Do not skip or delay this service — engine replacement after belt failure costs $1,500-$3,000.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['High mileage since last belt change', 'Squealing from timing belt area', 'Coolant leak from water pump weep hole', 'Visible cracking on timing belt (if inspected)', 'Engine suddenly dies and will not restart (if belt breaks)'],
    affectedSystems: ['Timing belt', 'Water pump', 'Cam seals', 'Crankshaft seal', 'Tensioner'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },

  // ─── Honda Prelude (needs 5 more, has 3) ───
  // Already has: ATTS failure, VTEC solenoid oil leak, auto trans failure
  // Requested ATTS and VTEC exist → skip. Add: rear main seal, ignition switch, A/C compressor + 2 more
  {
    id: 'honda-prelude-rear-main-seal-1997',
    make: 'Honda', model: 'Prelude',
    years: [1997,1998,1999,2000,2001],
    category: 'engine',
    title: 'Rear Main Seal Oil Leak (H22/H23)',
    description: 'The H22A and H23A engines in 5th-generation Preludes are known to develop rear main seal leaks, causing oil to drip from the bell housing area between the engine and transmission. The leak worsens over time and can contaminate the clutch disc on manual transmission cars, causing clutch slippage. Oil can also drip onto the exhaust, creating a burning oil smell and potential fire hazard.',
    solution: 'Replace the rear main seal. This requires removing the transmission (and clutch assembly on manuals) to access the seal. If the clutch is contaminated with oil, replace the clutch disc, pressure plate, and throw-out bearing at the same time to avoid doing the job twice. Use a genuine Honda seal for best results. Budget 5-8 hours of labor.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Oil drip from bell housing area', 'Oil on clutch housing', 'Burning oil smell from under car', 'Clutch slipping (manual trans)', 'Oil spots on driveway at rear of engine'],
    affectedSystems: ['Rear main seal', 'Crankshaft seal', 'Clutch assembly', 'Bell housing'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'honda-prelude-ignition-switch-1997',
    make: 'Honda', model: 'Prelude',
    years: [1997,1998,1999,2000,2001],
    category: 'electrical',
    title: 'Ignition Switch Electrical Failure',
    description: 'The 5th-generation Prelude shares the same faulty ignition switch design that affected many late-1990s Hondas. The electrical portion of the ignition switch (separate from the lock cylinder) develops melted or burned contacts due to high current draw, causing intermittent starting failures, engine stalling, and loss of electrical accessories. Honda issued a recall for some models, but many Preludes were not covered.',
    solution: 'Replace the electrical portion of the ignition switch (Honda part 35130-S84-A01 or equivalent). The lock cylinder does not need to be replaced. The switch is located on the steering column behind the lower dashboard panel and takes about 1 hour to replace. Check NHTSA recall 03V-474 for your VIN. This is a critical safety repair as a failed switch can cause the engine to stall while driving.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Car intermittently fails to start', 'Engine stalls while driving', 'Dashboard lights flicker or go dark', 'Electrical accessories cut out randomly', 'Key turns but nothing happens'],
    affectedSystems: ['Ignition switch', 'Electrical system', 'Steering column', 'Starting system'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 250,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'honda-prelude-ac-compressor-clutch-1997',
    make: 'Honda', model: 'Prelude',
    years: [1997,1998,1999,2000,2001],
    category: 'cooling',
    title: 'A/C Compressor Clutch and Relay Failure',
    description: 'The A/C compressor clutch on 5th-generation Preludes is prone to failure, often due to the clutch relay overheating and failing, or the clutch coil itself burning out. When the relay fails intermittently, the A/C may work sometimes but not others. A seized compressor can also snap the serpentine belt, disabling the alternator and power steering simultaneously.',
    solution: 'Start by replacing the A/C relay (inexpensive and easy to test). If the relay is good, test the compressor clutch coil resistance (should be 3-5 ohms). Replace the clutch assembly or full compressor as needed. If the compressor has seized, replace the serpentine belt and inspect the tensioner. Evacuate and recharge the system with R-134a after compressor replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['A/C blows warm intermittently', 'Clicking noise when A/C engages', 'A/C works sometimes but not others', 'Squealing belt (if compressor seized)', 'All accessories lost (if belt breaks)'],
    affectedSystems: ['A/C compressor', 'Compressor clutch', 'A/C relay', 'Serpentine belt'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'honda-prelude-distributor-failure-1992',
    make: 'Honda', model: 'Prelude',
    years: [1992,1993,1994,1995,1996],
    category: 'engine',
    title: 'Distributor Internal Coil and Igniter Failure (4th Gen)',
    description: 'Fourth-generation Preludes (BA8/BB1/BB4) use an internal-coil distributor that combines the ignition coil, igniter module, and pickup coils in one unit. These components fail with age and heat, causing misfires, no-start conditions, or intermittent stalling. The distributor cap and rotor are also enclosed, making inspection less obvious. Failure typically occurs after 150,000+ miles but can happen earlier.',
    solution: 'Replace the complete distributor assembly. OEM Honda units are expensive ($400+), but quality aftermarket distributors are available for $100-$200. When replacing, also install a new cap, rotor, spark plugs, and spark plug wires for a complete ignition refresh. Set the ignition timing to specification (15-18 degrees BTDC depending on model) after installation.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Engine misfires or runs rough', 'No-start condition (cranks but won\'t fire)', 'Engine stalls when hot and restarts when cooled', 'Check engine light for misfire codes', 'Backfiring through intake'],
    affectedSystems: ['Distributor', 'Ignition coil', 'Igniter module', 'Ignition system'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
    estimatedCostLow: 150,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  },
  {
    id: 'honda-prelude-power-steering-rack-leak-1992',
    make: 'Honda', model: 'Prelude',
    years: [1992,1993,1994,1995,1996,1997,1998,1999,2000,2001],
    category: 'steering',
    title: 'Power Steering Rack Seal Leak and Whine',
    description: 'Preludes across both 4th and 5th generations develop power steering rack seal leaks, causing fluid to drip from the rack boots and a whining noise from the power steering pump due to low fluid. The rack end seals deteriorate with age, and continued driving with low fluid damages the pump. The Prelude\'s 4-wheel steering system (4WS models) adds complexity with additional seals that can leak.',
    solution: 'Replace or rebuild the power steering rack. Rebuilt racks are available for $200-$400. Flush the power steering system completely and refill with Honda-spec PS fluid (do not use generic ATF). Replace the rack boots and tie rod ends during the service. For 4WS models, inspect the rear steering rack seals as well. A front-end alignment is required after rack replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Power steering fluid dripping from rack boots', 'Whining noise from PS pump', 'Heavy steering at low speed', 'Power steering fluid level drops', 'Fluid spray on undercarriage near rack'],
    affectedSystems: ['Power steering rack', 'Rack seals', 'Power steering pump', 'PS fluid system'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 900,
    citations: [],
    communityRecommendations: [],
    status: 'published'
  }
];

async function main() {
  console.log(`Preparing to insert ${newIssues.length} new issues...`);

  // Check for existing IDs to avoid duplicates
  const existingIds = await prisma.knownIssue.findMany({
    where: { id: { in: newIssues.map(i => i.id) } },
    select: { id: true }
  });
  const existingIdSet = new Set(existingIds.map(e => e.id));

  const toInsert = newIssues.filter(i => {
    if (existingIdSet.has(i.id)) {
      console.log(`  SKIP (already exists): ${i.id}`);
      return false;
    }
    return true;
  });

  console.log(`\nInserting ${toInsert.length} new issues (${existingIdSet.size} skipped)...\n`);

  let created = 0;
  for (const issue of toInsert) {
    try {
      await prisma.knownIssue.create({ data: issue });
      console.log(`  OK: ${issue.make} ${issue.model} — ${issue.title}`);
      created++;
    } catch (err) {
      console.error(`  FAIL: ${issue.id} — ${err.message}`);
    }
  }

  console.log(`\nDone. Created ${created} issues.`);

  // Print final counts
  const counts = await prisma.knownIssue.groupBy({
    by: ['make', 'model'],
    _count: true,
    where: {
      make: { in: ['Volvo', 'Mazda', 'Honda'] },
      model: { in: ['XC60', 'S60', 'V70', '850', 'CX-9', 'Mazda6', 'Mazda3', 'MX-5 Miata', 'Prelude'] }
    }
  });
  console.log('\nFinal issue counts:');
  counts.forEach(c => console.log(`  ${c.make} ${c.model}: ${c._count}`));

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
