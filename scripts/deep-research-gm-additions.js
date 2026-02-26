/**
 * deep-research-gm-additions.js
 *
 * Adds well-documented, web-research-verified issues for undercovered GM models
 * (Chevrolet, GMC, Cadillac). Uses new schema format with years.start/end and
 * estimatedCost.min/max.
 *
 * Run: node scripts/deep-research-gm-additions.js
 */

const fs = require('fs');
const path = require('path');

const KNOWN_ISSUES_PATH = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

const newIssues = [
  // ============================================================
  // CHEVROLET
  // ============================================================

  // --- C/K 1500: Oil Pressure Sensor Failure ---
  {
    id: 'chevrolet-ck-1500-oil-pressure-sensor-1988',
    make: 'Chevrolet',
    model: 'C/K 1500',
    title: 'Oil Pressure Sensor/Sending Unit Failure',
    description: 'The oil pressure sender on C/K 1500 trucks (especially 5.0L and 5.7L V8s) fails frequently, showing false low-pressure or erratic readings. The sensor can also leak oil through its electrical connector. Aftermarket replacement sensors often have shorter lifespans (60-90k miles). The issue is worse on high-mileage trucks where heat cycling degrades the sensor diaphragm.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 1988, end: 1998 },
    estimatedCost: { min: 30, max: 200 },
    symptoms: [
      'Oil pressure gauge reading zero or erratic at idle',
      'Low oil pressure warning light flickering',
      'Oil leaking from sensor connector',
      'Gauge bouncing at different RPMs',
      'No unusual engine noise despite zero reading'
    ],
    commonFixes: [
      'Oil pressure sending unit replacement ($30-$80 DIY, $100-$200 shop)',
      'Use AC Delco OEM sensor for longer life',
      'Verify actual oil pressure with mechanical gauge before replacing sensor'
    ],
    dtcCodes: []
  },

  // --- C/K 1500: Speedometer Cable/Gear Failure ---
  {
    id: 'chevrolet-ck-1500-speedometer-gear-1988',
    make: 'Chevrolet',
    model: 'C/K 1500',
    title: 'Speedometer Cable and Drive Gear Failure',
    description: 'The speedometer on 1988-1995 C/K trucks uses a mechanical cable and nylon drive gear that wears out. The nylon gear teeth round off or the retaining clip falls off, causing the gear to freewheel. Later models (1992+) with electronic speedometers suffer from Vehicle Speed Sensor (VSS) and DRAC module failures causing intermittent or dead speedometer readings.',
    category: 'electrical',
    severity: 'moderate',
    years: { start: 1988, end: 1995 },
    estimatedCost: { min: 20, max: 300 },
    symptoms: [
      'Speedometer not working or reading intermittently',
      'Speedometer works when dashboard is struck',
      'Odometer stops counting miles',
      'Transmission may not shift properly (linked to VSS)',
      'Cruise control inoperative'
    ],
    commonFixes: [
      'Speedometer cable replacement ($20-$60)',
      'Nylon drive gear replacement ($10-$30)',
      'Vehicle Speed Sensor (VSS) replacement ($40-$100)',
      'DRAC module replacement for electronic speedometer models ($100-$200)'
    ],
    dtcCodes: [
      'P0500'
    ]
  },

  // --- C/K 2500: Transfer Case Chain Stretch ---
  {
    id: 'chevrolet-ck-2500-transfer-case-chain-1996',
    make: 'Chevrolet',
    model: 'C/K 2500',
    title: 'NP241/NP246 Transfer Case Chain Stretch',
    description: 'The NP241 and NP246 transfer cases used in 4WD C/K 2500 trucks develop chain stretch over time, typically after 160,000-200,000 miles. The stretched chain causes popping noises under load, delayed 4WD engagement, and eventual 4WD failure. The NP246 Auto-Trac version is more problematic due to its encoder motor and clutch pack design.',
    category: 'drivetrain',
    severity: 'moderate',
    years: { start: 1996, end: 2000 },
    estimatedCost: { min: 400, max: 1500 },
    symptoms: [
      'Loud popping noise in 4WD under load',
      'Grinding or clicking sound from transfer case',
      'Delayed engagement when shifting into 4WD',
      'Service 4WD light illuminated',
      'Clunking when accelerating from stop in 4WD'
    ],
    commonFixes: [
      'Transfer case chain replacement ($400-$800 with rebuild kit)',
      'Complete transfer case rebuild ($800-$1500)',
      'NP246 to NP241 swap for improved reliability ($600-$1200)'
    ],
    dtcCodes: []
  },

  // --- C/K 2500: Brake Line Rust-Through ---
  {
    id: 'chevrolet-ck-2500-brake-line-rust-1999',
    make: 'Chevrolet',
    model: 'C/K 2500',
    title: 'Brake Line Corrosion and Rust-Through',
    description: 'Brake lines on C/K 2500 trucks (and all GMT800 full-size GM trucks from 1999-2003) corrode and rust through, particularly in northern states where road salt is used. NHTSA investigated approximately 6 million vehicles but GM did not issue a recall, calling it a maintenance issue. Brake lines run along the frame rail and corrode under securing clips where moisture is trapped.',
    category: 'brakes',
    severity: 'high',
    years: { start: 1999, end: 2003 },
    estimatedCost: { min: 400, max: 1500 },
    symptoms: [
      'Soft or spongy brake pedal',
      'Brake fluid leaking under vehicle',
      'Low brake fluid warning light',
      'Visible rust and flaking on brake lines',
      'Brake pedal goes to floor'
    ],
    commonFixes: [
      'Complete brake line replacement with stainless steel lines ($400-$1000)',
      'Individual line repair/replacement ($150-$400 per line)',
      'Annual undercarriage wash in salt-belt states to prevent corrosion'
    ],
    dtcCodes: []
  },

  // --- S-10: Fuel Pump Failure ---
  {
    id: 'chevrolet-s10-fuel-pump-failure-1994',
    make: 'Chevrolet',
    model: 'S-10',
    title: 'In-Tank Fuel Pump Failure',
    description: 'The 1994-2004 S-10 in-tank fuel pump is prone to premature failure. Running the tank below 1/4 accelerates pump death because fuel cools and lubricates the pump. The integrated fuel level sender also fails, causing erratic gauge readings. Hot restart problems are a classic early warning sign as heat exacerbates pump weakness.',
    category: 'fuel',
    severity: 'high',
    years: { start: 1994, end: 2004 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: [
      'Engine cranks but will not start',
      'Engine sputtering or surging at highway speeds',
      'Loss of power under load or climbing hills',
      'Difficulty restarting when engine is hot',
      'Erratic fuel gauge readings',
      'Whining noise from rear of vehicle'
    ],
    commonFixes: [
      'Fuel pump module replacement ($300-$600)',
      'Fuel filter replacement every 30k miles to reduce pump strain ($30-$60)',
      'Keep fuel tank above 1/4 full to prolong pump life'
    ],
    dtcCodes: [
      'P0230',
      'P0231',
      'P0171'
    ]
  },

  // --- Blazer S-10: Dashboard Cracking ---
  {
    id: 'chevrolet-blazer-s10-dashboard-cracking-1998',
    make: 'Chevrolet',
    model: 'Blazer S-10',
    title: 'Dashboard Cracking and Warping',
    description: 'The 1998-2004 S-10 Blazer (and related S-10, GMC Jimmy, GMC Sonoma) dashboards crack severely from UV exposure and heat cycling. The instrument panel trim pad warps, splits, and crumbles. This is a known manufacturing defect in the dashboard material used across the entire S-10 platform during these years.',
    category: 'interior',
    severity: 'low',
    years: { start: 1998, end: 2004 },
    estimatedCost: { min: 50, max: 500 },
    symptoms: [
      'Large cracks appearing on dashboard surface',
      'Dashboard warping near windshield defroster vents',
      'Pieces of dashboard material crumbling or flaking',
      'Dashboard becoming sticky in hot weather',
      'Windshield glare from warped dashboard surface'
    ],
    commonFixes: [
      'Molded dash cover/overlay ($50-$150)',
      'Complete dashboard pad replacement ($200-$500)',
      'Dashboard repair kit with filler and texture paint ($30-$80)'
    ],
    dtcCodes: []
  },

  // --- Cavalier: Ignition Switch Failure ---
  {
    id: 'chevrolet-cavalier-ignition-switch-1995',
    make: 'Chevrolet',
    model: 'Cavalier',
    title: 'Ignition Switch Contact Failure',
    description: 'Cavalier ignition switches develop worn contacts causing engine stalling while driving and intermittent no-start conditions. The ignition key can become difficult to turn, and the switch may lose spring tension allowing the key to move out of the RUN position from vibration. GM acknowledged this issue with service bulletins. A related but separate defect was carried into the Cobalt that succeeded the Cavalier.',
    category: 'electrical',
    severity: 'high',
    years: { start: 1995, end: 2005 },
    estimatedCost: { min: 150, max: 500 },
    symptoms: [
      'Engine stalls while driving without warning',
      'Key difficult to turn in ignition',
      'Intermittent no-start condition',
      'Electrical accessories cut out momentarily',
      'Security light illuminated after stall'
    ],
    commonFixes: [
      'Ignition lock cylinder replacement ($150-$350)',
      'Ignition switch electrical portion replacement ($100-$250)',
      'Key tumbler rekey if key is worn ($80-$150)'
    ],
    dtcCodes: []
  },

  // --- Lumina: Power Window Motor Failure ---
  {
    id: 'chevrolet-lumina-power-window-motor-1995',
    make: 'Chevrolet',
    model: 'Lumina',
    title: 'Power Window Motor and Switch Failure',
    description: 'Lumina power window motors burn out prematurely and the driver-side master switch fails from repeated use. The wire harness from the door to the body fatigues from door opening/closing, breaking the neutral wire and killing power to the window. Both driver and passenger windows are affected.',
    category: 'electrical',
    severity: 'low',
    years: { start: 1995, end: 2001 },
    estimatedCost: { min: 150, max: 500 },
    symptoms: [
      'Window moves slowly or not at all',
      'Window works intermittently',
      'Clicking sound from door when pressing window switch',
      'Window drops into door panel',
      'Other windows stop working from driver switch'
    ],
    commonFixes: [
      'Power window motor replacement ($150-$350)',
      'Window regulator replacement ($200-$400)',
      'Master window switch replacement ($50-$150)',
      'Door-to-body wire harness repair ($100-$200)'
    ],
    dtcCodes: []
  },

  // --- Lumina: 4T60E Transmission Failure ---
  {
    id: 'chevrolet-lumina-4t60e-transmission-1995',
    make: 'Chevrolet',
    model: 'Lumina',
    title: '4T60E Automatic Transmission Failure',
    description: 'The 4T60E transmission in the Lumina develops shifting problems, particularly the second clutch reaction plates that were improperly stamped in some production runs. The transmission can lose 1st or 4th gear, develop harsh shifts, or strip planetary gears causing complete loss of drive. GM issued a campaign for certain 1995 models with defective clutch plates.',
    category: 'transmission',
    severity: 'high',
    years: { start: 1995, end: 2001 },
    estimatedCost: { min: 1200, max: 3000 },
    symptoms: [
      'Slipping or delayed shifts',
      'Loss of 1st or 4th gear',
      'Harsh or banging shifts',
      'Transmission wont engage any gear',
      'Popping noise at startup with delayed engagement'
    ],
    commonFixes: [
      'Transmission rebuild ($1200-$2500)',
      'Transmission replacement ($2000-$3000)',
      'Solenoid pack replacement for intermittent shifting ($300-$600)'
    ],
    dtcCodes: [
      'P0700',
      'P0741',
      'P0742',
      'P0751'
    ]
  },

  // --- Monte Carlo: Power Window Regulator ---
  {
    id: 'chevrolet-monte-carlo-window-regulator-2000',
    make: 'Chevrolet',
    model: 'Monte Carlo',
    title: 'Power Window Regulator Cable Failure',
    description: 'The cable-style window regulators in 2000-2007 Monte Carlos fail when the cable stretches, frays, or binds on the reel. The window can drop into the door or become stuck partway. Both front windows are commonly affected. Replacement regulators with added cable guides are an improvement over the original design.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2000, end: 2007 },
    estimatedCost: { min: 150, max: 500 },
    symptoms: [
      'Window drops into door panel suddenly',
      'Window moves unevenly or at an angle',
      'Grinding or popping noise when operating window',
      'Window stuck in down position',
      'Motor runs but window does not move'
    ],
    commonFixes: [
      'Window regulator replacement ($150-$350)',
      'Window regulator and motor assembly ($250-$500)',
      'Upgraded regulator with reinforced cable guides ($200-$400)'
    ],
    dtcCodes: []
  },

  // --- Monte Carlo: 3800 Supercharger Coupler Wear (SS) ---
  {
    id: 'chevrolet-monte-carlo-supercharger-coupler-2000',
    make: 'Chevrolet',
    model: 'Monte Carlo',
    title: '3.8L Supercharger Snout Coupler Wear (SS Models)',
    description: 'The Monte Carlo SS uses the 3800 Series II Supercharged (L67) engine. The plastic coupler connecting the supercharger snout to the rotor assembly wears out, creating a loud rattling noise at idle that sounds like a broken component. Despite the alarming noise, this is a minor maintenance item unique to the supercharged models. The supercharger oil also needs periodic replacement.',
    category: 'engine',
    severity: 'low',
    years: { start: 2000, end: 2007 },
    estimatedCost: { min: 30, max: 250 },
    symptoms: [
      'Rattling or rock-crusher noise from supercharger at idle',
      'Noise disappears under boost/acceleration',
      'Reduced supercharger whine indicating worn coupler',
      'Slight boost loss in advanced cases'
    ],
    commonFixes: [
      'Supercharger snout coupler replacement ($30 part, 1 hour DIY)',
      'Supercharger oil change ($10-$20 DIY)',
      'Full supercharger rebuild kit with coupler, bearings, oil ($150-$250)'
    ],
    dtcCodes: []
  },

  // --- Impala: Passlock Security System ---
  {
    id: 'chevrolet-impala-passlock-security-2000',
    make: 'Chevrolet',
    model: 'Impala',
    title: 'Passlock Security System No-Start Condition',
    description: 'The Passlock anti-theft system causes intermittent no-start conditions where the security light flashes and the fuel pump is disabled. The ignition lock cylinder contains a Hall-effect sensor that reads a resistance value; when contacts wear or corrode, the BCM detects a mismatch and locks out fuel delivery. The problem typically worsens progressively from occasional to daily. 225+ complaints were filed for the 2002 model year alone.',
    category: 'electrical',
    severity: 'high',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 150, max: 600 },
    symptoms: [
      'Security/theft light flashing on dashboard',
      'Engine cranks but will not start',
      'No-start condition occurs more frequently over time',
      'Car starts after waiting 10+ minutes',
      'SECURITY telltale illuminated'
    ],
    commonFixes: [
      'Ignition lock cylinder replacement ($150-$350)',
      '10-minute relearn procedure (3 cycles, temporary fix)',
      'Passlock sensor bypass module installation ($50-$150)',
      'BCM reprogram at dealer ($100-$200)'
    ],
    dtcCodes: [
      'B2960',
      'P1626',
      'P1631'
    ]
  },

  // --- Impala: 4T65E Transmission Failure ---
  {
    id: 'chevrolet-impala-4t65e-transmission-2006',
    make: 'Chevrolet',
    model: 'Impala',
    title: '4T65E Automatic Transmission Failure',
    description: 'The 4T65E transmission in 2006-2013 Impalas develops slipping, shuddering, and premature failure. The torque converter clutch wears rapidly, and the 258mm torque converter is prone to warped TCC apply pistons. The problem is especially severe in SS models with the 5.3L LS4 V8, as the transmission was designed for V6 power. Many transmissions fail before 100,000 miles.',
    category: 'transmission',
    severity: 'high',
    years: { start: 2006, end: 2013 },
    estimatedCost: { min: 1500, max: 4000 },
    symptoms: [
      'Transmission slipping during acceleration',
      'Shuddering at highway speeds (TCC failure)',
      'Harsh or delayed 1-2 shift (slip-bang)',
      'Complete loss of movement after driving',
      'Transmission works briefly after engine restart'
    ],
    commonFixes: [
      'Transmission rebuild ($1500-$3000)',
      'Torque converter replacement ($800-$1500)',
      'Pressure control solenoid replacement ($300-$700)',
      'Transmission cooler addition for towing/heavy use ($200-$400)'
    ],
    dtcCodes: [
      'P0700',
      'P0741',
      'P0742',
      'P1811'
    ]
  },

  // --- Malibu: Electric Power Steering Motor Failure ---
  {
    id: 'chevrolet-malibu-eps-motor-failure-2008',
    make: 'Chevrolet',
    model: 'Malibu',
    title: 'Electric Power Steering (EPS) Assist Motor Failure',
    description: 'The 2008-2012 Malibu electric power steering system can suddenly lose assist, reverting to heavy manual steering. The EPS motor, controller, or steering column torque sensor fails. GM issued a special coverage program (10 years/150,000 miles) for this issue. When EPS fails, a warning message and chime sound, and the steering becomes very heavy at low speeds.',
    category: 'suspension',
    severity: 'high',
    years: { start: 2008, end: 2012 },
    estimatedCost: { min: 800, max: 1600 },
    symptoms: [
      'Power Steering warning message on DIC',
      'Steering suddenly becomes very heavy',
      'Service ESC warning light',
      'Steering assist intermittent, especially in cold weather',
      'Steering wheel difficult to turn at parking speeds'
    ],
    commonFixes: [
      'EPS assist motor and angle sensor replacement ($800-$1600)',
      'Steering column torque sensor replacement ($400-$800)',
      'Check for GM Special Coverage warranty extension (expired 2022)'
    ],
    dtcCodes: [
      'C0545',
      'C0710',
      'U0073'
    ]
  },

  // --- Malibu: Ecotec 2.4L Timing Chain ---
  {
    id: 'chevrolet-malibu-ecotec-timing-chain-2008',
    make: 'Chevrolet',
    model: 'Malibu',
    title: 'Ecotec 2.4L Timing Chain and Guide Failure',
    description: 'The GM Ecotec 2.4L direct-injection engine suffers from timing chain stretch and plastic guide breakage. GM received a bad batch of chains that were not properly hardened. The plastic guides break causing the chain to sag, and since this is an interference engine, failure can destroy the engine. The 2.4L also burns oil excessively due to improperly hardened piston rings (2010-2013), leading to low oil which accelerates timing chain wear.',
    category: 'engine',
    severity: 'high',
    years: { start: 2008, end: 2013 },
    estimatedCost: { min: 1000, max: 3000 },
    symptoms: [
      'Rattling or pinging noise on cold start',
      'Check engine light with P0016 or P0017 codes',
      'Rough idle and loss of power',
      'Engine misfires',
      'Excessive oil consumption (related issue)',
      'Poor fuel economy'
    ],
    commonFixes: [
      'Complete timing chain kit replacement (chain, guides, tensioners, sprockets) ($1000-$2500)',
      'Engine replacement if catastrophic failure occurs ($3000+)',
      'Use shorter oil change intervals (5000 miles max) to minimize chain wear'
    ],
    dtcCodes: [
      'P0016',
      'P0017',
      'P0300',
      'P0011',
      'P0014'
    ]
  },

  // --- Cruze: Coolant Leak Water Outlet ---
  {
    id: 'chevrolet-cruze-water-outlet-leak-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    title: '1.4T Coolant Leak at Water Outlet and Thermostat Housing',
    description: 'The 2011-2016 Cruze 1.4L turbo engine has chronic coolant leaks from the water outlet housing and thermostat housing. These plastic components crack from heat cycling. The turbo coolant feed and return lines also develop leaks at the crimped rubber-to-metal connections. Some owners report replacing the water outlet multiple times.',
    category: 'cooling',
    severity: 'moderate',
    years: { start: 2011, end: 2016 },
    estimatedCost: { min: 150, max: 600 },
    symptoms: [
      'Coolant puddle under vehicle',
      'Low coolant warning light',
      'Overheating in traffic',
      'Sweet coolant smell from engine bay',
      'Visible coolant residue on water outlet or thermostat housing'
    ],
    commonFixes: [
      'Water outlet housing replacement ($150-$350)',
      'Thermostat housing replacement ($150-$350)',
      'Turbo coolant line replacement ($200-$400, may require turbo removal)',
      'Use updated metal thermostat housing if available'
    ],
    dtcCodes: [
      'P0128',
      'P0599'
    ]
  },

  // --- Cruze: Turbo Oil Feed Line Leak ---
  {
    id: 'chevrolet-cruze-turbo-oil-feed-leak-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    title: '1.4T Turbo Oil Feed Line Leak',
    description: 'The turbo oil feed line on 2011-2016 Cruze 1.4T engines develops leaks, dripping oil down the front of the engine. The banjo bolt seals and line connections deteriorate from heat cycling. Early 2011-2012 models are particularly affected. Many mechanics recommend replacing the oil feed line, return line, and oil cooler seals together since they share similar failure patterns.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 2011, end: 2016 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: [
      'Oil dripping down front of engine',
      'Burning oil smell from engine bay',
      'Low oil level between changes',
      'Oil residue visible around turbo area',
      'Smoke from engine compartment when hot'
    ],
    commonFixes: [
      'Turbo oil feed line replacement ($200-$400)',
      'Oil cooler and seal replacement ($200-$500)',
      'Replace oil feed and return lines together ($300-$600)',
      'Check and replace turbo oil drain line gasket'
    ],
    dtcCodes: []
  },

  // --- Traverse: 3.6L Timing Chain ---
  {
    id: 'chevrolet-traverse-36l-timing-chain-2009',
    make: 'Chevrolet',
    model: 'Traverse',
    title: '3.6L V6 Timing Chain Stretch and Failure',
    description: 'The 3.6L LLT V6 in the Traverse develops timing chain stretch, causing a cold-start rattle, rough idle, and engine codes. About 75% of affected vehicles throw P0016 as the first indicator. The root cause is poor chain metallurgy combined with GM\'s overly long oil change intervals and undersized timing chain spray lubrication ports on 2010 and earlier engines. Repair costs are high due to the complexity of replacing chains on a transverse-mounted V6.',
    category: 'engine',
    severity: 'high',
    years: { start: 2009, end: 2017 },
    estimatedCost: { min: 2500, max: 4000 },
    symptoms: [
      'Rattling noise on cold start',
      'Check engine light with P0016 or P0017',
      'Rough idle with RPM fluctuation',
      'Loss of power and poor acceleration',
      'Reduced fuel economy'
    ],
    commonFixes: [
      'Complete timing chain kit replacement (all 3 chains, guides, tensioners, sprockets) ($2500-$4000)',
      'Use 5000-mile oil change intervals with full synthetic',
      'Replace timing chain solenoids and actuators during repair'
    ],
    dtcCodes: [
      'P0016',
      'P0017',
      'P0018',
      'P0019',
      'P0008',
      'P0009'
    ]
  },

  // --- Traverse: AC Compressor Failure ---
  {
    id: 'chevrolet-traverse-ac-compressor-2009',
    make: 'Chevrolet',
    model: 'Traverse',
    title: 'AC Compressor Premature Failure',
    description: 'The Traverse has one of the highest rates of AC compressor failure among midsize SUVs. Compressors seize or lose capacity often before 70,000 miles. When the compressor fails, it can send metal debris through the entire AC system, requiring replacement of the condenser, expansion valve, and system flush. Some owners report repeat failures within 8 months of repair.',
    category: 'other',
    severity: 'moderate',
    years: { start: 2009, end: 2017 },
    estimatedCost: { min: 800, max: 2000 },
    symptoms: [
      'AC blows warm air',
      'Clicking or grinding noise from compressor',
      'AC works intermittently',
      'Compressor clutch not engaging',
      'Burning smell from AC system'
    ],
    commonFixes: [
      'AC compressor replacement ($800-$1200)',
      'Full AC system replacement if debris contamination ($1500-$2000)',
      'AC condenser and expansion valve replacement with compressor',
      'System flush to remove metal debris before new compressor install'
    ],
    dtcCodes: []
  },

  // --- TrailBlazer: Window Regulator Failure ---
  {
    id: 'chevrolet-trailblazer-window-regulator-2002',
    make: 'Chevrolet',
    model: 'TrailBlazer',
    title: 'Power Window Regulator Failure',
    description: 'The cable-style window regulators in 2002-2009 TrailBlazers fail frequently. The plastic guide portion breaks, cables fray and wrap around the motor pulley, or the motor gears strip. Windows move slowly, make grinding/clicking noises, or become stuck. The front windows are most commonly affected. Lack of lubrication and debris in window tracks accelerate wear.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2002, end: 2009 },
    estimatedCost: { min: 150, max: 500 },
    symptoms: [
      'Window moves slowly or unevenly',
      'Grinding or clicking noise when operating window',
      'Window stuck in up or down position',
      'Window drops into door suddenly',
      'Motor runs but window does not move'
    ],
    commonFixes: [
      'Window regulator replacement ($150-$350)',
      'Window motor and regulator assembly ($250-$500)',
      'Lubricate window tracks and channels with silicone spray as preventive maintenance'
    ],
    dtcCodes: []
  },

  // --- Blazer (new): 9-Speed Transmission Shudder ---
  {
    id: 'chevrolet-blazer-9speed-shudder-2019',
    make: 'Chevrolet',
    model: 'Blazer',
    title: '9-Speed Automatic Transmission Shudder',
    description: 'The 2019+ Blazer with the 9-speed automatic transmission (9T50/9T65) develops a shudder during acceleration from a stop, particularly between 1st and 2nd gear. GM bulletin PIP5608J addresses TCC shudder/surge issues. The root cause involves excess lubrication on internal parts contaminating the transmission fluid. Some owners require torque converter or full transmission replacement.',
    category: 'transmission',
    severity: 'moderate',
    years: { start: 2019, end: 2024 },
    estimatedCost: { min: 200, max: 4000 },
    symptoms: [
      'Shuddering during acceleration from stop',
      'Hesitation or jerking between 1st and 2nd gear',
      'Vibration at low speeds (20-40 MPH)',
      'Rough or delayed shifting',
      'Bucking sensation during light acceleration'
    ],
    commonFixes: [
      'Transmission fluid flush with updated fluid ($200-$400)',
      'Torque converter replacement ($1500-$2500)',
      'Transmission replacement under warranty ($3000-$4000)',
      'TCM software update at dealer'
    ],
    dtcCodes: [
      'P0700',
      'P0751',
      'P0756'
    ]
  },

  // --- Blazer (new): Infotainment Lag ---
  {
    id: 'chevrolet-blazer-infotainment-lag-2019',
    make: 'Chevrolet',
    model: 'Blazer',
    title: 'Infotainment System Freezing and Lag',
    description: 'The 2019+ Blazer infotainment system (Chevrolet Infotainment 3) suffers from screen lockups, lag, and unresponsive touch input. The screen can freeze on the backup camera view or refuse button and touch input. GM bulletin PIT5790A acknowledges the issue but initially had no fix available. Bluetooth and Apple CarPlay disconnections are also common. Some owners have had the radio module replaced.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2019, end: 2022 },
    estimatedCost: { min: 0, max: 1000 },
    symptoms: [
      'Touchscreen unresponsive or lagging',
      'Screen freezes on backup camera or other display',
      'Bluetooth audio disconnects randomly',
      'Apple CarPlay/Android Auto connectivity issues',
      'Volume and audio controls unresponsive'
    ],
    commonFixes: [
      'Software/firmware update at dealer (often free)',
      'Radio module (screen) replacement ($500-$1000)',
      'Hard reset: hold power button for 10+ seconds',
      'Disconnect battery for 30 minutes to reset system'
    ],
    dtcCodes: []
  },

  // --- Trax: Turbo Wastegate Failure ---
  {
    id: 'chevrolet-trax-turbo-wastegate-2014',
    make: 'Chevrolet',
    model: 'Trax',
    title: '1.4L Turbo Wastegate Actuator Failure',
    description: 'The 1.4L turbocharged engine in the Trax (shared with Cruze, Sonic, and Buick Encore) develops wastegate actuator failures. The wastegate seal degrades, allowing exhaust gases to bypass the turbine wheel and reduce boost. The wastegate actuator arm design has a known mechanical weakness. GM TechLink bulletin noted many returned turbochargers had no fault and emphasized proper diagnosis before replacement.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 2014, end: 2020 },
    estimatedCost: { min: 400, max: 1500 },
    symptoms: [
      'Check engine light with P0299 (underboost)',
      'Reduced power and sluggish acceleration',
      'Clanking or rattling noise near turbo',
      'Loss of turbo boost at higher RPMs',
      'Turbo whistle changes tone or disappears'
    ],
    commonFixes: [
      'Wastegate actuator replacement ($400-$800)',
      'Turbocharger assembly replacement ($800-$1500)',
      'Wastegate solenoid valve replacement ($100-$250)',
      'Check wastegate actuator clip and arm before replacing entire turbo'
    ],
    dtcCodes: [
      'P0299',
      'P0234'
    ]
  },

  // --- Astro: Rear Differential Noise ---
  {
    id: 'chevrolet-astro-rear-differential-noise-1995',
    make: 'Chevrolet',
    model: 'Astro',
    title: 'Rear Differential Bearing Wear and Whine',
    description: 'The Astro van rear differential develops a whining, humming, or howling noise from worn pinion and carrier bearings. The 7.625-inch ring gear differential in these vans sees heavy loading from the rear-heavy weight distribution. AWD models have additional drivetrain noise sources. Noise typically increases with speed and may change tone under load vs. coast.',
    category: 'drivetrain',
    severity: 'moderate',
    years: { start: 1995, end: 2005 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: [
      'Whining noise from rear that increases with speed',
      'Humming or howling at highway speeds',
      'Noise changes when accelerating vs coasting',
      'Clunking noise on deceleration',
      'Vibration at specific speeds'
    ],
    commonFixes: [
      'Pinion bearing replacement ($400-$800)',
      'Ring and pinion gear set with bearing replacement ($600-$1200)',
      'Differential fluid change with limited-slip additive ($50-$100)',
      'Check and adjust backlash if noise is minor'
    ],
    dtcCodes: []
  },

  // ============================================================
  // GMC
  // ============================================================

  // --- GMC C/K 1500: Oil Pressure Sender ---
  {
    id: 'gmc-ck-1500-oil-pressure-sender-1988',
    make: 'GMC',
    model: 'C/K 1500',
    title: 'Oil Pressure Sending Unit Failure',
    description: 'Same oil pressure sensor issue as Chevrolet C/K 1500. The sending unit fails, giving false zero or erratic oil pressure readings. Oil can leak through the electrical connector. Aftermarket sensors have shorter service life. Always verify actual oil pressure with a mechanical gauge before condemning the engine.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 1988, end: 1998 },
    estimatedCost: { min: 30, max: 200 },
    symptoms: [
      'Oil pressure gauge reading zero at idle',
      'Oil pressure warning light flickering',
      'Oil leak from sensor area',
      'Erratic oil pressure readings'
    ],
    commonFixes: [
      'Oil pressure sending unit replacement ($30-$80 DIY, $100-$200 shop)',
      'Use AC Delco OEM sender for best lifespan',
      'Verify with mechanical gauge before replacing'
    ],
    dtcCodes: []
  },

  // --- GMC C/K 2500: Brake Line Rust ---
  {
    id: 'gmc-ck-2500-brake-line-rust-1999',
    make: 'GMC',
    model: 'C/K 2500',
    title: 'Brake Line Corrosion and Rust-Through',
    description: 'Same brake line corrosion issue as Chevrolet C/K 2500 and all GMT800 trucks. Steel brake lines corrode under securing clips on the frame rail, especially in salt-belt states. NHTSA investigated 6 million GMT800 trucks but no recall was issued. The lines can burst without warning, causing complete brake failure.',
    category: 'brakes',
    severity: 'high',
    years: { start: 1999, end: 2003 },
    estimatedCost: { min: 400, max: 1500 },
    symptoms: [
      'Soft or spongy brake pedal',
      'Brake fluid pooling under vehicle',
      'Low brake fluid warning',
      'Visible rust and flaking on brake lines',
      'Sudden loss of brake pressure'
    ],
    commonFixes: [
      'Complete brake line replacement with stainless steel lines ($400-$1000)',
      'Individual line repair/replacement ($150-$400 per line)',
      'Annual undercarriage wash to prevent corrosion'
    ],
    dtcCodes: []
  },

  // --- GMC Suburban: Rear AC Evaporator Leak ---
  {
    id: 'gmc-suburban-rear-ac-evaporator-1995',
    make: 'GMC',
    model: 'Suburban',
    title: 'Rear AC Evaporator Core and Line Leaks',
    description: 'The GMC Suburban (and Chevrolet Suburban/Tahoe/Yukon) with rear AC systems develop leaks in the rear evaporator core and the aluminum rear AC lines that run along the passenger-side frame rail. The lines corrode under the securing straps from road salt and moisture. The rear drain tube also clogs, causing musty odors inside the cabin. Repair is costly because the rear AC system is difficult to access.',
    category: 'other',
    severity: 'moderate',
    years: { start: 1995, end: 2006 },
    estimatedCost: { min: 600, max: 2000 },
    symptoms: [
      'Rear AC blows warm air',
      'Musty or mildew smell from rear vents',
      'Refrigerant loss requiring frequent recharges',
      'Water leaking inside cargo area',
      'Visible corrosion on rear AC lines along frame rail'
    ],
    commonFixes: [
      'Rear AC evaporator core replacement ($600-$1200)',
      'Rear AC line replacement ($300-$800)',
      'Rear AC drain tube cleaning ($50-$100)',
      'Apply corrosion protection to rear AC lines as preventive measure'
    ],
    dtcCodes: []
  },

  // --- GMC Terrain: Ecotec 2.4L Timing Chain ---
  {
    id: 'gmc-terrain-ecotec-timing-chain-2010',
    make: 'GMC',
    model: 'Terrain',
    title: 'Ecotec 2.4L Timing Chain and Tensioner Failure',
    description: 'The GM Ecotec 2.4L in the 2010-2014 Terrain has the same timing chain stretch and tensioner failure as the Equinox and Malibu. GM Special Coverage Adjustment SCA 12313C covers some vehicles. The 2010-2011 models are worst affected. Improperly hardened piston rings on 2010-2013 models cause excessive oil burning, which leads to low oil and accelerated timing chain wear. 2015+ models received revised internal components.',
    category: 'engine',
    severity: 'high',
    years: { start: 2010, end: 2014 },
    estimatedCost: { min: 1000, max: 3000 },
    symptoms: [
      'Rattling noise on cold start',
      'Check engine light with P0016 or P0017',
      'Rough idle and misfires',
      'Excessive oil consumption (1 qt per 1000 miles)',
      'Loss of power and poor acceleration',
      'Engine stalling'
    ],
    commonFixes: [
      'Complete timing chain kit replacement ($1000-$2500)',
      'Check for GM Special Coverage Adjustment SCA 12313C',
      'Engine replacement if catastrophic failure ($3000+)',
      'Use 5000-mile or shorter oil change intervals'
    ],
    dtcCodes: [
      'P0016',
      'P0017',
      'P0011',
      'P0014',
      'P0300'
    ]
  },

  // --- GMC Sierra 3500HD: DEF System Issues ---
  {
    id: 'gmc-sierra-3500hd-def-system-2011',
    make: 'GMC',
    model: 'Sierra 3500HD',
    title: 'Diesel Exhaust Fluid (DEF) System Failures',
    description: 'The Duramax diesel Sierra 3500HD (2011+) equipped with the DEF/SCR emission system develops failures in the DEF tank heater, DEF quality sensor, and associated wiring. Wires to the DEF tank short out, and because they share a harness with the transmission, this can trigger both DEF and transmission warnings simultaneously. Cold weather operation exacerbates DEF system problems as the fluid crystallizes.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 2011, end: 2020 },
    estimatedCost: { min: 300, max: 2000 },
    symptoms: [
      'DEF warning message on dash',
      'Reduced engine power / limp mode',
      'Check engine light with SCR-related codes',
      'Service Exhaust Fluid System message',
      'Transmission warning alongside DEF warning (shared wiring)',
      'DEF system not heating in cold weather'
    ],
    commonFixes: [
      'DEF tank heater replacement ($300-$800)',
      'DEF quality sensor replacement ($200-$500)',
      'Wiring harness repair/upgrade to DEF tank ($300-$600)',
      'DEF injector replacement ($400-$1000)',
      'NOx sensor replacement ($300-$600)'
    ],
    dtcCodes: [
      'P20EE',
      'P2BAD',
      'P21DD',
      'P249E'
    ]
  },

  // --- GMC Sierra 3500HD: Allison Transmission Issues ---
  {
    id: 'gmc-sierra-3500hd-allison-trans-2008',
    make: 'GMC',
    model: 'Sierra 3500HD',
    title: 'Allison 1000 Transmission Control Module and Sensor Failures',
    description: 'The Allison 1000 transmission paired with the Duramax diesel in 2008-2015 Sierra 3500HD trucks has a high failure rate for the Transmission Control Module (TCM). A class action suit was filed covering these years. Additional issues include input/output speed sensor failures causing no-forward/reverse conditions, and certain 2012 trucks built with incorrect thrust bearings.',
    category: 'transmission',
    severity: 'high',
    years: { start: 2008, end: 2019 },
    estimatedCost: { min: 500, max: 3500 },
    symptoms: [
      'Intermittent no forward or reverse movement',
      'Flashing PRNDL display',
      'Range Shift Inhibited message',
      'Harsh or delayed shifts',
      'Transmission noise or whine',
      'Check engine light with transmission codes'
    ],
    commonFixes: [
      'Transmission Control Module (TCM) replacement ($500-$1200)',
      'Input/output speed sensor replacement ($200-$500)',
      'Thrust bearing replacement on affected 2012 models ($800-$2000)',
      'TCM software reflash at dealer ($100-$300)'
    ],
    dtcCodes: [
      'P0700',
      'P0717',
      'P0722',
      'P0747',
      'U0101'
    ]
  },

  // --- GMC Yukon XL: AFM Lifter Tick ---
  {
    id: 'gmc-yukon-xl-afm-lifter-tick-2007',
    make: 'GMC',
    model: 'Yukon XL',
    title: 'Active Fuel Management (AFM) Lifter Failure and Tick',
    description: 'The Yukon XL with the 5.3L or 6.2L V8 and Active Fuel Management (AFM/DOD) system develops hydraulic valve lifter failures. The AFM lifters, which collapse to deactivate cylinders for fuel economy, fail and cause persistent ticking noise, misfires, and potential camshaft damage. The problem is most common on 2007-2019 models. GM service bulletin recommends replacing all 8 AFM lifters if ticking persists after oil change.',
    category: 'engine',
    severity: 'high',
    years: { start: 2007, end: 2019 },
    estimatedCost: { min: 1500, max: 4500 },
    symptoms: [
      'Ticking noise on cold start lasting 2 seconds to 10 minutes',
      'Persistent engine tick at idle',
      'Misfires on AFM-deactivated cylinders',
      'Rough idle when AFM engages',
      'Check engine light with misfire codes',
      'Reduced fuel economy'
    ],
    commonFixes: [
      'All 8 AFM lifter replacement ($1500-$3000)',
      'AFM delete kit with non-AFM camshaft ($2000-$4500)',
      'AFM/DOD disable device to prevent cylinder deactivation ($300-$500)',
      'Use correct oil viscosity (0W-20 or 5W-30 per year) and change every 5000 miles'
    ],
    dtcCodes: [
      'P0300',
      'P0301',
      'P0306',
      'P0308'
    ]
  },

  // --- GMC Yukon XL: AC Compressor Failure ---
  {
    id: 'gmc-yukon-xl-ac-compressor-2007',
    make: 'GMC',
    model: 'Yukon XL',
    title: 'AC Compressor and Rear AC System Failure',
    description: 'The Yukon XL (like all GMT900 full-size GM SUVs) has a high rate of AC compressor failure, often before 80,000 miles. When the compressor seizes, metal debris contaminates the entire system. The dual-zone system with separate rear AC is complex and expensive to repair. Rear AC lines and evaporator are prone to the same corrosion issues as the Suburban.',
    category: 'other',
    severity: 'moderate',
    years: { start: 2007, end: 2019 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: [
      'Front or rear AC blows warm air',
      'Grinding or squealing from compressor',
      'AC cycles on and off rapidly',
      'Refrigerant loss requiring frequent recharges',
      'Compressor clutch not engaging'
    ],
    commonFixes: [
      'AC compressor replacement with system flush ($800-$1500)',
      'Full system repair if contamination (compressor, condenser, expansion valve, flush) ($1500-$2500)',
      'Rear AC evaporator and line replacement ($600-$1200)',
      'AC condenser replacement ($400-$800)'
    ],
    dtcCodes: []
  },

  // ============================================================
  // CADILLAC
  // ============================================================

  // --- Cadillac CT4: Infotainment Lag ---
  {
    id: 'cadillac-ct4-infotainment-lag-2020',
    make: 'Cadillac',
    model: 'CT4',
    title: 'Infotainment System Lag and Screen Freezing',
    description: 'The 2020-2022 CT4 infotainment system (Cadillac User Experience) suffers from slow response times, screen freezing, and significant glitches. The touchscreen can become unresponsive, the radio may produce no sound, and the turn signal audio indicator can fail. Cadillac has released software updates to address some issues, but problems persist for some owners.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2020, end: 2022 },
    estimatedCost: { min: 0, max: 800 },
    symptoms: [
      'Touchscreen slow to respond or frozen',
      'No sound from radio or speakers',
      'Turn signal click sound not working',
      'Screen goes black on startup',
      'Bluetooth connectivity drops repeatedly'
    ],
    commonFixes: [
      'Software/firmware update at dealer (often covered under warranty)',
      'Infotainment module replacement ($400-$800)',
      'Hard reset: hold power and forward seek buttons simultaneously',
      'Battery disconnect for 30 minutes to reset electronics'
    ],
    dtcCodes: []
  },

  // --- Cadillac CT5: 2.0T Oil Consumption ---
  {
    id: 'cadillac-ct5-20t-oil-consumption-2020',
    make: 'Cadillac',
    model: 'CT5',
    title: '2.0T LSY Engine Timing Cover Oil Leak',
    description: 'The 2.0T turbocharged four-cylinder (LSY) in the CT5 can develop oil leaks from the timing cover gasket. The gasket develops cracks after heat cycling, causing oil to seep from the front of the engine. In some cases, this leads to noticeable oil consumption between changes. GM revised the 2.0T engine (LSY) for 2020+ which reduced but did not eliminate the issue. Using incorrect oil viscosity can worsen the problem.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 2020, end: 2024 },
    estimatedCost: { min: 500, max: 1500 },
    symptoms: [
      'Oil level dropping between changes',
      'Oil seepage visible at front of engine',
      'Burning oil smell after driving',
      'Low oil level warning light',
      'Oil spots on garage floor under front of vehicle'
    ],
    commonFixes: [
      'Timing cover gasket replacement ($500-$1200)',
      'Use only 0W-20 dexos1 specification oil',
      'Monitor oil level monthly and top off as needed',
      'Inspect for warranty coverage if under 5yr/60k miles'
    ],
    dtcCodes: []
  },

  // --- Cadillac XT4: 2.0T Timing Chain Tensioner ---
  {
    id: 'cadillac-xt4-20t-timing-chain-2019',
    make: 'Cadillac',
    model: 'XT4',
    title: '2.0T Engine Timing Chain Tensioner Issues',
    description: 'The 2.0T turbocharged engine (LSY) in the XT4 can develop timing chain rattle and tensioner wear, particularly on early production 2019-2021 models. The timing chain tensioner loses hydraulic pressure on cold starts, causing a brief rattle that may worsen over time. While less severe than the Ecotec 2.4L timing chain issues, neglecting this early warning can lead to expensive repairs.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 2019, end: 2022 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: [
      'Brief chain rattle on cold start',
      'Rattle noise lasting longer as issue progresses',
      'Check engine light with timing-related codes',
      'Rough idle on cold start',
      'Reduced power if timing jumps'
    ],
    commonFixes: [
      'Timing chain tensioner replacement ($800-$1500)',
      'Complete timing chain kit replacement ($1500-$2500)',
      'Use full synthetic 0W-20 and change every 5000 miles',
      'Do not ignore cold-start rattle; diagnose early'
    ],
    dtcCodes: [
      'P0016',
      'P0017'
    ]
  },

  // --- Cadillac XT4: Infotainment Issues ---
  {
    id: 'cadillac-xt4-infotainment-issues-2019',
    make: 'Cadillac',
    model: 'XT4',
    title: 'Infotainment System Freezing and Audio Dropouts',
    description: 'The XT4 infotainment system (CUE) experiences screen freezing, intermittent audio muting, and climate control display glitches. The sound can go completely mute at random times, even affecting OnStar calls. The climate control display occasionally shows "Climate Off" incorrectly after startup. Cadillac released a fix in July 2021 for black screen/freezing issues.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2019, end: 2023 },
    estimatedCost: { min: 0, max: 800 },
    symptoms: [
      'Audio suddenly goes mute during driving',
      'Touchscreen freezes or goes black',
      'Climate control display shows "Climate Off" erroneously',
      'Vehicle status page freezes when pressed',
      'OnStar audio not working during active call'
    ],
    commonFixes: [
      'Software update at dealer per Cadillac service bulletin (often free)',
      'Infotainment module replacement if update does not resolve ($400-$800)',
      'Hard system reset via hold power button 10 seconds',
      'Check for latest firmware version at dealer visit'
    ],
    dtcCodes: []
  },

  // --- Cadillac XT5: 9-Speed Transmission Shudder ---
  {
    id: 'cadillac-xt5-9speed-shudder-2017',
    make: 'Cadillac',
    model: 'XT5',
    title: '9-Speed Automatic Transmission Shudder',
    description: 'The XT5 with the 9-speed automatic transmission develops a shudder during low-speed acceleration and gear hunting at highway speeds. GM launched a pilot program in 2020 for 2020-2021 models to address 9-speed defects. Transmission lockouts where the transmission will not shift at highway speeds are also reported. A June 2024 service update addresses clutch piston retaining ring issues on 2024 models.',
    category: 'transmission',
    severity: 'moderate',
    years: { start: 2017, end: 2024 },
    estimatedCost: { min: 200, max: 4000 },
    symptoms: [
      'Shuddering at low speeds (5-15 MPH)',
      'Transmission lockout at highway speeds (40+ MPH)',
      'Jerking or banging into gear from 1st to 2nd',
      'Erratic shifting and gear hunting',
      'Loss of power during acceleration'
    ],
    commonFixes: [
      'Transmission fluid flush with updated fluid per TSB ($200-$400)',
      'Torque converter replacement ($1500-$2500)',
      'TCM software update at dealer',
      'Clutch piston housing replacement on affected 2024 models ($1500-$3000)',
      'Full transmission replacement under warranty ($3000-$4000)'
    ],
    dtcCodes: [
      'P0700',
      'P0711',
      'P0751'
    ]
  },

  // --- Cadillac XT6: 9-Speed Transmission Issues ---
  {
    id: 'cadillac-xt6-9speed-transmission-2020',
    make: 'Cadillac',
    model: 'XT6',
    title: '9-Speed Automatic Transmission Shudder and Hesitation',
    description: 'The XT6 shares the same 9-speed automatic transmission issues as the XT5. Shuddering occurs especially when climbing hills before downshift, and low-speed hesitation is common. The torque converter clutch engagement causes shuddering when the transmission fluid degrades. GM issued a June 2024 service update for defective clutch piston retaining rings on some 2024 units. Transmission flush with Mobil 1 fluid has resolved the issue for some owners.',
    category: 'transmission',
    severity: 'moderate',
    years: { start: 2020, end: 2024 },
    estimatedCost: { min: 200, max: 4000 },
    symptoms: [
      'Shuddering on hills and during low-speed acceleration',
      'Transmission hesitation from stop',
      'Rough gear changes at low speeds',
      'Gear shifter malfunction warnings',
      'Shaking and vibration at 20-30 MPH'
    ],
    commonFixes: [
      'Transmission fluid flush with Mobil 1 synthetic ATF ($200-$400)',
      'TCM software recalibration at dealer',
      'Torque converter replacement ($1500-$2500)',
      'Clutch piston housing replacement if retaining ring out of spec ($1500-$3000)'
    ],
    dtcCodes: [
      'P0700',
      'P0711'
    ]
  },

  // --- Cadillac XTS: CUE Touchscreen Delamination ---
  {
    id: 'cadillac-xts-cue-screen-delamination-2013',
    make: 'Cadillac',
    model: 'XTS',
    title: 'CUE Infotainment Touchscreen Delamination',
    description: 'The Cadillac User Experience (CUE) infotainment touchscreen in the XTS develops delamination, bubbling, cracking, and becomes unresponsive. The screen uses a gel-based bonding layer that dries out and hardens over time, causing the touchscreen layers to separate. A class action lawsuit was filed in 2019 covering 2013-2017 models. GM issued four TSBs (PIC6055 series) but no recall or warranty extension. The failure rate is reported as nearly 100% on affected models.',
    category: 'electrical',
    severity: 'moderate',
    years: { start: 2013, end: 2019 },
    estimatedCost: { min: 300, max: 1600 },
    symptoms: [
      'Screen appears to have bubbles or delamination',
      'Touchscreen unresponsive or registers incorrect touches',
      'Screen develops cracks without impact',
      'Display has cloudy or hazy areas',
      'Climate and audio controls inaccessible via screen'
    ],
    commonFixes: [
      'Aftermarket gel-free CUE screen replacement ($300-$600)',
      'Dealer CUE screen replacement ($1200-$1600)',
      'Third-party screen repair/refurbishment ($200-$400)',
      'Screen overlay/protector after replacement to prevent recurrence'
    ],
    dtcCodes: []
  },

  // --- Cadillac DTS: Northstar Head Bolt Pull ---
  {
    id: 'cadillac-dts-northstar-head-bolt-pull-2000',
    make: 'Cadillac',
    model: 'DTS',
    title: 'Northstar 4.6L Head Bolt Thread Pull/Head Gasket Failure',
    description: 'The Northstar 4.6L V8 in the DTS (and predecessor DeVille) has a well-documented design flaw where the aluminum block head bolt threads strip out, causing head gasket failure. The head gasket itself does not fail; instead the head bolts lose clamping force as the threads pull from the soft aluminum block. The problem is most severe on 1996-2003 engines. GM improved the bolt design in 2000 (longer bolts) and again in 2004 (coarser thread pitch). The Time-Sert thread repair is the accepted permanent fix.',
    category: 'engine',
    severity: 'high',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 2000, max: 4500 },
    symptoms: [
      'Unexplained coolant loss',
      'Overheating with no visible external leak',
      'White exhaust smoke (coolant burning)',
      'Oil contamination with coolant (milky residue)',
      'Exhaust gases in coolant reservoir (bubbling)'
    ],
    commonFixes: [
      'Time-Sert or Bigsert thread repair with new head gaskets ($2000-$3500)',
      'Northstar Performance stud kit installation ($2500-$4000)',
      'Engine replacement with updated block ($3000-$4500)',
      'Many shops refuse this repair; find a Northstar specialist'
    ],
    dtcCodes: [
      'P0300',
      'P0128',
      'P0117'
    ]
  },

  // --- Cadillac DeVille: Northstar Oil Leak ---
  {
    id: 'cadillac-deville-northstar-oil-leak-1996',
    make: 'Cadillac',
    model: 'DeVille',
    title: 'Northstar 4.6L Engine Oil Leak (Rear Main Seal and Crankcase)',
    description: 'All Northstar 4.6L engines eventually develop oil leaks from multiple locations: rear main seal, lower crankcase gasket, valve cover gaskets, oil pan gasket, and oil pressure sender. The rear main seal is the most expensive to address as it requires engine removal or separation from the transaxle. The oil leaks have been a known issue since 1998 across all Northstar-equipped models.',
    category: 'engine',
    severity: 'moderate',
    years: { start: 1996, end: 2005 },
    estimatedCost: { min: 200, max: 2000 },
    symptoms: [
      'Oil dripping under vehicle',
      'Oil consumption between changes',
      'Burning oil smell from engine bay',
      'Oil visible on lower engine surfaces',
      'Oil on garage floor near rear of engine'
    ],
    commonFixes: [
      'Oil pressure sender replacement (simplest, cheapest, $50-$150)',
      'Valve cover gasket replacement ($200-$500)',
      'Lower crankcase seal replacement ($400-$800)',
      'Rear main seal replacement (requires engine removal, $600-$2000)',
      'Comprehensive reseal of all Northstar gaskets and seals ($1500-$2000)'
    ],
    dtcCodes: []
  },

  // --- Cadillac Seville: Northstar Head Gasket ---
  {
    id: 'cadillac-seville-northstar-head-gasket-1996',
    make: 'Cadillac',
    model: 'Seville',
    title: 'Northstar 4.6L Head Gasket Failure (Head Bolt Thread Pull)',
    description: 'The Seville STS/SLS with the Northstar 4.6L V8 has the worst head gasket failure rate among all Northstar vehicles. The 1996-1999 model years have the highest failure rate due to changes in the aluminum alloy formula and casting method. The head bolts pull out of the aluminum block, releasing head gasket clamping force. Repair costs are extremely high, and many shops refuse the work. The Time-Sert or Bigsert thread repair is the accepted permanent solution.',
    category: 'engine',
    severity: 'high',
    years: { start: 1996, end: 2003 },
    estimatedCost: { min: 2400, max: 4500 },
    symptoms: [
      'Unexplained coolant loss without visible external leak',
      'Engine overheating, especially in traffic',
      'White sweet-smelling exhaust smoke',
      'Milky residue under oil cap',
      'Coolant reservoir bubbling from exhaust gas intrusion',
      'Poor heater output'
    ],
    commonFixes: [
      'Time-Sert or Bigsert head bolt thread repair ($2400-$4000)',
      'Northstar Performance stud kit ($2500-$4500)',
      'Engine replacement with 2004+ block (improved bolt design)',
      'Find a Northstar specialist; many general shops refuse this repair'
    ],
    dtcCodes: [
      'P0300',
      'P0128',
      'P0117',
      'P0118'
    ]
  },

  // --- Cadillac Eldorado: Northstar Head Gasket/Overheating ---
  {
    id: 'cadillac-eldorado-northstar-head-gasket-1996',
    make: 'Cadillac',
    model: 'Eldorado',
    title: 'Northstar 4.6L Head Gasket Failure and Overheating',
    description: 'The Eldorado Northstar 4.6L V8 suffers from the same head bolt thread pull/head gasket failure as other Northstar vehicles. The problem is particularly common on 1996-2002 models. Symptoms can be subtle; unlike typical head gasket failures, the Northstar may not show obvious white smoke or external coolant leaks initially. Unexplained coolant loss and gradual overheating are the first signs. All Northstar engines prior to 2004 are susceptible.',
    category: 'engine',
    severity: 'high',
    years: { start: 1996, end: 2002 },
    estimatedCost: { min: 2400, max: 4500 },
    symptoms: [
      'Gradual coolant loss with no visible leak',
      'Overheating that progresses over weeks or months',
      'Subtle white exhaust in cold weather (hard to distinguish)',
      'Coolant reservoir level dropping without external leak',
      'Engine running hotter than normal',
      'Heater blowing cool air intermittently'
    ],
    commonFixes: [
      'Time-Sert or Bigsert head bolt thread repair ($2400-$4000)',
      'Head gasket sealant as temporary measure (not permanent)',
      'Engine replacement with 2004+ revised block',
      'Seek Northstar specialist; repair is labor-intensive'
    ],
    dtcCodes: [
      'P0300',
      'P0128',
      'P0117'
    ]
  }
];


function main() {
  console.log('=== Deep Research GM Additions Script ===\n');

  // Read existing data
  const raw = fs.readFileSync(KNOWN_ISSUES_PATH, 'utf8');
  const data = JSON.parse(raw);

  // Build set of existing IDs for duplicate check
  const existingIds = new Set(data.issues.map(i => i.id));

  // Also build set of (make, model, title-substring) for fuzzy duplicate detection
  const existingFingerprints = new Set();
  data.issues.forEach(i => {
    const make = i.make || (i.vehicleMatch && i.vehicleMatch.make) || '';
    const model = i.model || (i.vehicleMatch && i.vehicleMatch.model) || '';
    const title = (i.title || '').toLowerCase();
    existingFingerprints.add(`${make}|${model}|${title}`);
  });

  let added = 0;
  let skipped = 0;
  const addedList = [];
  const skippedList = [];

  for (const issue of newIssues) {
    // Check exact ID duplicate
    if (existingIds.has(issue.id)) {
      skipped++;
      skippedList.push(`  [SKIP] ${issue.id} (exact ID match)`);
      continue;
    }

    // Check fuzzy duplicate by make+model+similar title
    const fingerprint = `${issue.make}|${issue.model}|${issue.title.toLowerCase()}`;
    let isDuplicate = false;
    for (const existing of existingFingerprints) {
      const [eMake, eModel, eTitle] = existing.split('|');
      if (eMake === issue.make && eModel === issue.model) {
        // Check if titles are very similar (one contains the other)
        const issueTitle = issue.title.toLowerCase();
        if (eTitle.includes(issueTitle) || issueTitle.includes(eTitle)) {
          isDuplicate = true;
          skipped++;
          skippedList.push(`  [SKIP] ${issue.id} (similar title exists: "${eTitle}")`);
          break;
        }
      }
    }

    if (!isDuplicate) {
      data.issues.push(issue);
      existingIds.add(issue.id);
      existingFingerprints.add(fingerprint);
      added++;
      addedList.push(`  [ADD]  ${issue.make} ${issue.model}: ${issue.title}`);
    }
  }

  // Write updated data
  fs.writeFileSync(KNOWN_ISSUES_PATH, JSON.stringify(data, null, 2), 'utf8');

  // Print summary
  console.log(`Processed ${newIssues.length} issues:\n`);
  console.log(`ADDED (${added}):`);
  addedList.forEach(l => console.log(l));

  if (skippedList.length > 0) {
    console.log(`\nSKIPPED (${skipped}):`);
    skippedList.forEach(l => console.log(l));
  }

  // Count by make
  const byChevy = newIssues.filter(i => i.make === 'Chevrolet' && addedList.some(a => a.includes(i.title)));
  const byGMC = newIssues.filter(i => i.make === 'GMC' && addedList.some(a => a.includes(i.title)));
  const byCadillac = newIssues.filter(i => i.make === 'Cadillac' && addedList.some(a => a.includes(i.title)));

  console.log('\n--- Summary by Make ---');
  console.log(`Chevrolet: ${byChevy.length} issues added`);
  console.log(`GMC:       ${byGMC.length} issues added`);
  console.log(`Cadillac:  ${byCadillac.length} issues added`);
  console.log(`\nTotal issues in database: ${data.issues.length}`);
  console.log('\nDone!');
}

main();
