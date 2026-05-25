const fs = require('fs');
const path = require('path');
const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ISSUES_PATH = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

// Toyota Solara (1999-2008), Echo (2000-2005), Prius V (2012-2017), Prius C (2012-2019)

const ymmtEntries = [
  {
    make: 'Toyota', model: 'Solara',
    years: [1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008],
    trims: ['SE', 'SLE', 'SE Sport', 'SE V6', 'SLE V6']
  },
  {
    make: 'Toyota', model: 'Echo',
    years: [2000, 2001, 2002, 2003, 2004, 2005],
    trims: ['Base', '2-Door', '4-Door']
  },
  {
    make: 'Toyota', model: 'Prius V',
    years: [2012, 2013, 2014, 2015, 2016, 2017],
    trims: ['Two', 'Three', 'Four', 'Five']
  },
  {
    make: 'Toyota', model: 'Prius C',
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
    trims: ['One', 'Two', 'Three', 'Four']
  },
];

const newIssues = [
  // ===== TOYOTA SOLARA =====
  {
    id: 'toyota-solara-convertible-top-2004',
    vehicleMatch: {
      years: [2004, 2005, 2006, 2007, 2008],
      make: 'Toyota',
      model: 'Solara'
    },
    category: 'body',
    title: 'Convertible Top Hydraulic Pump and Cylinder Failure',
    description: 'The 2004-2008 Solara convertible uses a hydraulic system to raise and lower the soft top. The hydraulic pump motor, lines, and cylinders develop leaks and failures, leaving the top stuck in the open or closed position. The hydraulic fluid leaks from aging O-rings in the cylinders and at line connections in the trunk area. The pump motor can also burn out from running against a stuck cylinder. A failed convertible top that is stuck open leaves the vehicle unusable in rain.',
    solution: 'Replace leaking hydraulic cylinders and O-rings. The hydraulic pump assembly is mounted in the trunk and can be replaced independently. Use genuine Toyota hydraulic fluid (not generic ATF) to prevent seal damage. For stuck tops, check the hydraulic fluid level first — a simple top-off may restore function temporarily. The hydraulic lines should be flushed and the reservoir filter cleaned during any repair.',
    symptoms: [
      'Convertible top operates slowly or stops mid-cycle',
      'Hydraulic fluid puddle in trunk area',
      'Top motor running but top not moving',
      'Top stuck in partially open position',
      'Whining noise from trunk area when operating top'
    ],
    severity: 'medium',
    confidence: 0.82,
    estimatedCost: { low: 300, high: 2000 },
    communityRecommendations: [
      { type: 'tip', content: 'Check the hydraulic fluid reservoir in the trunk annually — low fluid is the #1 cause of top motor burnout and can be prevented with a $30 top-off', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Use only Toyota-specified hydraulic fluid — generic ATF attacks the rubber seals and causes more leaks', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not force a stuck convertible top manually — this will damage the hydraulic cylinders and folding mechanism, turning a $500 repair into a $3,000 one', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'solaraclub.com', description: 'Solara convertible top hydraulic system repair guide' },
      { source: 'toyotanation.com', description: 'Solara convertible top stuck open/closed' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 130,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'toyota-solara-dashboard-cracking-1999',
    vehicleMatch: {
      years: [1999, 2000, 2001, 2002, 2003],
      make: 'Toyota',
      model: 'Solara'
    },
    category: 'interior',
    title: 'Dashboard Cracking and Melting in Hot Climates',
    description: 'The first-generation Solara (1999-2003) dashboard is prone to cracking and developing a sticky, melting surface in hot climates. The dashboard material degrades from UV exposure and heat cycling, producing deep cracks across the surface and a tacky residue. This is a known issue across many 1999-2003 Toyota/Lexus models. Toyota issued an enhanced warranty for some Camry models with the same dashboard but the Solara was not officially included in most extensions.',
    solution: 'Dashboard replacement is the only permanent fix ($800-1,500 installed). Aftermarket dash covers from DashMat or Coverlay provide a cosmetic fix for $50-150. Coverlay dash cover kits are molded specifically for the Solara dashboard shape and adhesive-mount over the damaged dash. Keeping a windshield sunshade in place when parked dramatically slows progression.',
    symptoms: [
      'Cracks appearing across dashboard surface',
      'Dashboard surface becoming sticky or tacky',
      'Dashboard material flaking or peeling',
      'Glare from cracked dashboard reflecting in windshield',
      'Strong chemical smell from dashboard in hot weather'
    ],
    severity: 'low',
    confidence: 0.85,
    estimatedCost: { low: 50, high: 1500 },
    communityRecommendations: [
      { type: 'part', content: 'Coverlay 11-708-DBL Solara dash cover — molded to exact dashboard shape, adhesive install over cracked dash', partBrand: 'Coverlay', partName: 'Dashboard Cover', partNumber: '11-708-DBL', affiliateUrl: 'https://www.amazon.com/s?k=Coverlay+Toyota+Solara+dashboard+cover&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Use a windshield sunshade religiously when parked — UV damage is the primary cause of dashboard degradation', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Apply 303 Aerospace Protectant to the dashboard monthly — it provides UV protection and can slow further cracking', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'toyotanation.com', description: 'Solara dashboard cracking class discussion' },
      { source: 'NHTSA complaints', description: 'Toyota Solara interior complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 200,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'toyota-solara-oil-consumption-2002',
    vehicleMatch: {
      years: [2002, 2003, 2004, 2005, 2006, 2007, 2008],
      make: 'Toyota',
      model: 'Solara',
      engines: ['2.4L 2AZ-FE I4']
    },
    category: 'engine',
    title: '2.4L 2AZ-FE Excessive Oil Consumption',
    description: 'The 2.4L 2AZ-FE engine used in the Solara (shared with Camry and RAV4) has a well-documented excessive oil consumption issue. The piston rings do not maintain adequate tension against the cylinder walls, allowing oil to pass into the combustion chambers. Consumption of 1 quart per 1,000-1,500 miles is common. Toyota issued a Limited Service Campaign (LSC ZE7) for some Camry models but Solara coverage has been inconsistent. Running low on oil causes catalytic converter damage and potential engine seizure.',
    solution: 'Toyota\'s authorized repair involves replacing the pistons and piston rings with an updated design (Toyota kit 04211-28813). This requires engine disassembly. For vehicles out of warranty, some owners use high-viscosity oil (5W-30 instead of 5W-20) to reduce consumption. Monitor oil level every 500 miles and top off as needed. If consumption exceeds 1 qt/1,000 miles, the piston ring replacement is recommended.',
    symptoms: [
      'Oil level drops 1+ quart between oil changes',
      'Blue or gray exhaust smoke under acceleration',
      'Check engine light for catalytic converter efficiency (P0420)',
      'Engine ticking or knocking from low oil',
      'Fouled spark plugs at shorter intervals than normal'
    ],
    severity: 'high',
    confidence: 0.90,
    estimatedCost: { low: 200, high: 3500 },
    communityRecommendations: [
      { type: 'tip', content: 'Check oil level every gas fill-up — the 2AZ-FE can burn a quart in 1,000 miles and running low destroys the catalytic converter and engine bearings', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Ask your Toyota dealer about LSC ZE7 coverage — even if your VIN wasn\'t initially included, some dealers will goodwill the piston ring repair', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do NOT ignore the oil consumption — running the 2AZ-FE even 1 quart low accelerates bearing wear and can lead to rod knock', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'Toyota LSC ZE7', description: '2AZ-FE excessive oil consumption limited service campaign' },
      { source: 'toyotanation.com', description: 'Solara 2.4L oil consumption reports' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 280,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0420', 'P0300']
  },

  // ===== TOYOTA ECHO =====
  {
    id: 'toyota-echo-clutch-hydraulic-2000',
    vehicleMatch: {
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      make: 'Toyota',
      model: 'Echo'
    },
    category: 'transmission',
    title: 'Clutch Master and Slave Cylinder Failure (Manual Transmission)',
    description: 'The Toyota Echo with the 5-speed manual transmission experiences frequent clutch hydraulic system failures. The clutch master cylinder and slave cylinder develop internal leaks, causing the clutch pedal to feel spongy and eventually fall to the floor. The slave cylinder is mounted inside the transmission bell housing (concentric design), requiring transmission removal for replacement. This makes a $30 part into a $500+ repair.',
    solution: 'Replace both the clutch master cylinder and slave cylinder together — they typically fail in quick succession. Since the slave cylinder requires transmission removal, replace the clutch disc and pressure plate at the same time (even if they have life remaining) to avoid paying for transmission removal again. Use a Toyota OEM slave cylinder as aftermarket units have a high failure rate.',
    symptoms: [
      'Clutch pedal slowly sinks to the floor',
      'Clutch pedal feels spongy or soft',
      'Difficulty shifting into gear',
      'Clutch fluid reservoir low',
      'Clutch pedal does not return after pressing'
    ],
    severity: 'medium',
    confidence: 0.83,
    estimatedCost: { low: 500, high: 1200 },
    communityRecommendations: [
      { type: 'tip', content: 'Replace clutch disc, pressure plate, throw-out bearing, and slave cylinder ALL at once — the transmission has to come out anyway and the labor overlap saves $400+', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Use Toyota OEM slave cylinder only — aftermarket concentric slave cylinders for the Echo have a very high failure rate within 2 years', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Check clutch fluid level monthly — catching a slow master cylinder leak early prevents being stranded with no clutch', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'toyotanation.com', description: 'Echo clutch slave cylinder replacement discussion' },
      { source: 'echoownersclub.com', description: 'Manual transmission clutch hydraulic failures' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 110,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'toyota-echo-oil-leak-valve-cover-2000',
    vehicleMatch: {
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      make: 'Toyota',
      model: 'Echo',
      engines: ['1.5L 1NZ-FE I4']
    },
    category: 'engine',
    title: '1.5L 1NZ-FE Valve Cover Gasket and Oil Filler Cap Leak',
    description: 'The 1.5L 1NZ-FE engine in the Echo develops oil leaks at the valve cover gasket and the oil filler cap seal. The rubber valve cover gasket hardens with age and heat cycling, allowing oil to seep down the side of the engine onto the exhaust manifold, producing a burning oil smell. The spark plug tube seals (integral to the valve cover gasket) also leak, allowing oil to pool around the spark plugs and cause misfires. The oil filler cap O-ring also dries out and leaks.',
    solution: 'Replace the valve cover gasket with a Toyota OEM gasket kit that includes spark plug tube seals. Clean all oil residue from the exhaust manifold after replacing. Replace the oil filler cap O-ring (or the entire cap for $10). Apply a thin bead of RTV sealant only at the cam cap corners where the valve cover gasket doesn\'t seal perfectly.',
    symptoms: [
      'Burning oil smell from engine bay',
      'Oil dripping down side of engine',
      'Oil pooling around spark plugs (misfires)',
      'Visible oil around valve cover edges',
      'Check engine light with misfire codes'
    ],
    severity: 'low',
    confidence: 0.85,
    estimatedCost: { low: 50, high: 250 },
    communityRecommendations: [
      { type: 'part', content: 'Toyota 11213-21011 valve cover gasket set — includes spark plug tube seals, OEM quality', partBrand: 'Toyota OEM', partName: 'Valve Cover Gasket Set (1NZ-FE)', partNumber: '11213-21011', affiliateUrl: 'https://www.amazon.com/s?k=Toyota+Echo+1NZ-FE+valve+cover+gasket&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'This is a 30-minute DIY job — just 4 bolts hold the valve cover on. Apply a tiny bead of RTV at the two front cam cap corners for a perfect seal.', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Don\'t ignore oil pooling around spark plugs — oil-soaked ignition coils fail prematurely and cost $60+ each', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'toyotanation.com', description: 'Echo valve cover gasket leak fix' },
      { source: 'echoownersclub.com', description: '1NZ-FE oil leak diagnosis' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 140,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0301', 'P0302', 'P0303', 'P0304']
  },
  {
    id: 'toyota-echo-rear-wheel-bearing-2000',
    vehicleMatch: {
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      make: 'Toyota',
      model: 'Echo'
    },
    category: 'suspension',
    title: 'Rear Wheel Bearing Premature Failure',
    description: 'The Echo uses pressed-in rear wheel bearings that fail prematurely, often as early as 60,000-80,000 miles. The bearings are sealed units that cannot be re-greased and are susceptible to water intrusion. A failed rear wheel bearing produces a humming or droning noise that increases with vehicle speed and changes pitch slightly when swerving. If ignored, the bearing can seize and damage the hub assembly.',
    solution: 'Replace the failed rear wheel bearing. The bearings are pressed into the hub assembly and require a hydraulic press for removal and installation. Replace both sides if one has failed — the other typically follows within 10,000-20,000 miles. Some owners replace the entire hub/knuckle assembly from a junkyard as it can be faster and cheaper than pressing bearings.',
    symptoms: [
      'Humming or droning noise from rear that increases with speed',
      'Noise changes pitch when swerving left or right',
      'Rear wheel has play when grabbed at 12 and 6 o\'clock',
      'ABS light illuminated (bearing sensor damaged)',
      'Grinding noise from rear wheel area'
    ],
    severity: 'medium',
    confidence: 0.82,
    estimatedCost: { low: 200, high: 500 },
    communityRecommendations: [
      { type: 'part', content: 'Koyo 6003 2RS rear wheel bearing — OEM supplier for Toyota, superior quality to generic bearings', partBrand: 'Koyo', partName: 'Rear Wheel Bearing', partNumber: '6003-2RS', affiliateUrl: 'https://www.amazon.com/s?k=Koyo+Toyota+Echo+rear+wheel+bearing&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Replace both rear bearings at the same time — when one fails at 70,000 miles, the other is typically close behind', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not drive on a bad wheel bearing — a seized bearing can lock the rear wheel at speed, causing loss of vehicle control', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'toyotanation.com', description: 'Echo rear wheel bearing replacement guide' },
      { source: 'echoownersclub.com', description: 'Rear bearing humming noise diagnosis' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 120,
    reviewedOn: '2026-03-13',
    dtcCodes: ['C0210']
  },

  // ===== TOYOTA PRIUS V =====
  {
    id: 'toyota-prius-v-egr-cooler-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017],
      make: 'Toyota',
      model: 'Prius V',
      engines: ['1.8L 2ZR-FXE I4']
    },
    category: 'engine',
    title: 'EGR Cooler Condensation and Engine Intake Carbon Buildup',
    description: 'The Prius V uses an EGR (Exhaust Gas Recirculation) cooler that produces condensation during short trips and cold weather driving. This condensation mixes with exhaust gases to form carbon deposits in the intake manifold and on the intake valves. Over time, the carbon buildup restricts airflow, causing rough idle and reduced fuel economy. The EGR valve itself can also become stuck from carbon accumulation. This is more prevalent in cold climate Prius V models driven primarily for short trips.',
    solution: 'Clean the EGR valve and intake manifold ports using a carbon solvent (CRC GDI IVD Intake Valve & Turbo Cleaner). For severe buildup, the intake manifold must be removed for manual cleaning. Replace the EGR valve if it\'s stuck open or closed. Extended highway driving periodically helps burn off light deposits. Some owners install a catch can on the EGR line to trap condensation.',
    symptoms: [
      'Rough idle especially in cold weather',
      'Check engine light with EGR-related codes',
      'Reduced fuel economy (3-5 MPG drop)',
      'Hesitation during acceleration',
      'Engine stalling at idle'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 150, high: 600 },
    communityRecommendations: [
      { type: 'part', content: 'CRC GDI IVD Intake Valve & Turbo Cleaner 11101 — effective at dissolving carbon deposits in EGR and intake system', partBrand: 'CRC', partName: 'GDI IVD Intake Valve Cleaner', partNumber: '11101', affiliateUrl: 'https://www.amazon.com/s?k=CRC+GDI+IVD+intake+valve+cleaner+11101&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Take the Prius V on a 20+ minute highway drive weekly to bring the engine to full operating temperature — this helps burn off EGR condensation and deposits', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Clean the EGR valve every 60,000 miles as preventive maintenance — a $150 cleaning prevents a $600 intake manifold removal job later', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'priuschat.com', description: 'Prius V EGR carbon buildup prevention' },
      { source: 'toyotanation.com', description: 'Prius V rough idle EGR diagnosis' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 115,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0401', 'P0403', 'P0404']
  },
  {
    id: 'toyota-prius-v-water-pump-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017],
      make: 'Toyota',
      model: 'Prius V'
    },
    category: 'engine',
    title: 'Electric Water Pump Failure and Engine Overheating',
    description: 'The Prius V uses an electric water pump (like all Gen 3 Prius-based vehicles) rather than a belt-driven mechanical pump. The electric pump motor can fail without warning, causing rapid engine overheating. Unlike a belt-driven pump where you\'d hear squealing before failure, the electric pump simply stops. The vehicle may overheat within minutes in traffic. Toyota issued a recall for some Prius models but Prius V coverage varies by production date.',
    solution: 'Replace the electric water pump assembly (Toyota 161A0-29015). The pump is located on the lower-left side of the engine and is accessible without major disassembly. Replace the thermostat and flush the cooling system during the repair. Some owners carry a spare pump as a precaution since failure is sudden and strands the vehicle.',
    symptoms: [
      'Engine temperature climbing rapidly with no warning',
      'Red engine temperature warning light',
      'No coolant circulation (heater blows cold with engine hot)',
      'Steam from under hood',
      'Engine entering limp mode and shutting down'
    ],
    severity: 'high',
    confidence: 0.83,
    estimatedCost: { low: 250, high: 800 },
    communityRecommendations: [
      { type: 'part', content: 'Toyota 161A0-29015 electric water pump — OEM replacement, use genuine Toyota for reliability', partBrand: 'Toyota OEM', partName: 'Electric Water Pump', partNumber: '161A0-29015', affiliateUrl: 'https://www.amazon.com/s?k=Toyota+Prius+V+electric+water+pump&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'If the temperature gauge starts climbing suddenly, pull over IMMEDIATELY and shut off the engine — the Prius V overheats extremely fast without the water pump', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not continue driving with an overheating Prius V even for a few minutes — the aluminum engine warps heads rapidly and can require a full engine replacement', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'priuschat.com', description: 'Prius V electric water pump failure reports' },
      { source: 'NHTSA complaints', description: 'Toyota Prius V engine cooling complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 130,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P26A8', 'P0117']
  },
  {
    id: 'toyota-prius-v-cargo-area-leak-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015],
      make: 'Toyota',
      model: 'Prius V'
    },
    category: 'body',
    title: 'Rear Liftgate Seal Water Leak into Cargo Area',
    description: 'The Prius V wagon body style suffers from water leaks around the rear liftgate seal, particularly at the upper corners where the seal meets the roof. Water enters the cargo area during rain and car washes, pooling under the cargo floor mat and in the spare tire well. The leak can damage the 12V auxiliary battery (located under the cargo floor) and corrode wiring connections. The root cause is an inadequate liftgate weatherstrip that doesn\'t compress evenly at the corners.',
    solution: 'Replace the rear liftgate weatherstrip with an updated Toyota part (75551-47020). Ensure the liftgate hinges are properly adjusted so the gate closes with even pressure across the seal. Apply a thin bead of 3M Super Weatherstrip Adhesive at the upper corners where the old seal was leaking. Dry out the spare tire well and check the 12V battery for corrosion.',
    symptoms: [
      'Water in cargo area after rain or car wash',
      'Musty or mildew smell from rear of vehicle',
      'Standing water in spare tire well',
      'Corroded 12V battery terminals',
      'Damp carpet under rear cargo floor mat'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 50, high: 300 },
    communityRecommendations: [
      { type: 'part', content: 'Toyota 75551-47020 rear liftgate weatherstrip — updated design with better corner compression', partBrand: 'Toyota OEM', partName: 'Rear Liftgate Weatherstrip', partNumber: '75551-47020', affiliateUrl: 'https://www.amazon.com/s?k=Toyota+Prius+V+liftgate+weatherstrip&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Check the spare tire well for standing water after heavy rain — even a small leak can cause 12V battery corrosion and electrical issues', upvotes: 0, needsReview: false },
      { type: 'tip', content: '3M Super Weatherstrip Adhesive (08008) applied to the liftgate seal upper corners is a $10 fix that stops the leak for most owners', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'priuschat.com', description: 'Prius V cargo area water leak diagnosis and fix' },
      { source: 'toyotanation.com', description: 'Prius V liftgate seal leak' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 100,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },

  // ===== TOYOTA PRIUS C =====
  {
    id: 'toyota-prius-c-water-pump-inverter-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      make: 'Toyota',
      model: 'Prius C'
    },
    category: 'electrical',
    title: 'Inverter Coolant Pump Failure and Hybrid System Overheat',
    description: 'The Prius C has a separate cooling circuit for the power electronics (inverter/converter). The electric pump that circulates coolant through this circuit can fail, causing the inverter to overheat. When the inverter overheats, the hybrid system enters a protective shutdown mode, displaying "Hybrid System Malfunction" and severely limiting power output. The pump failure is often caused by coolant contamination or bearing wear.',
    solution: 'Replace the inverter coolant pump (Toyota G9040-52010). Flush the inverter cooling circuit with distilled water then refill with Toyota Super Long Life Coolant (SLLC). Check the inverter coolant reservoir for contamination — brown or rusty fluid indicates the pump has been shedding bearing material. The pump is accessible from the engine bay and is a 1-hour repair.',
    symptoms: [
      'Hybrid System Malfunction warning message',
      'Triangle warning indicator (master caution) illuminated',
      'Reduced power output / vehicle feels sluggish',
      'No EV-only mode available',
      'Inverter cooling fan running at high speed constantly'
    ],
    severity: 'high',
    confidence: 0.82,
    estimatedCost: { low: 200, high: 600 },
    communityRecommendations: [
      { type: 'part', content: 'Toyota G9040-52010 inverter coolant pump — OEM replacement, the aftermarket alternatives have poor longevity', partBrand: 'Toyota OEM', partName: 'Inverter Coolant Pump', partNumber: 'G9040-52010', affiliateUrl: 'https://www.amazon.com/s?k=Toyota+Prius+C+inverter+coolant+pump&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Change the inverter coolant every 100,000 miles with Toyota SLLC — most owners forget this separate cooling circuit exists', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not ignore the Hybrid System Malfunction warning — continued driving with an overheated inverter can destroy the power electronics ($3,000+ replacement)', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'priuschat.com', description: 'Prius C inverter pump failure diagnosis' },
      { source: 'toyotanation.com', description: 'Prius C hybrid system malfunction causes' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 105,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0A93', 'P0A78']
  },
  {
    id: 'toyota-prius-c-ac-compressor-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      make: 'Toyota',
      model: 'Prius C'
    },
    category: 'hvac',
    title: 'Electric A/C Compressor Failure',
    description: 'The Prius C uses an electric scroll-type A/C compressor (not belt-driven) that can fail from internal bearing wear or inverter board failure. The electric compressor contains its own inverter board that is susceptible to moisture intrusion and solder joint cracking from vibration. When the compressor fails, the A/C blows warm air. The electric compressor uses a special PAG oil with insulating properties — using the wrong oil during service causes premature inverter board failure.',
    solution: 'Replace the electric A/C compressor assembly (includes internal inverter board). Use ONLY Toyota-specified ND-11 PAG oil — standard PAG oil lacks the electrical insulating properties required for electric compressors and will cause arcing on the inverter board. Evacuate and recharge the system with R-134a after replacement. Check for moisture in the system using a vacuum test — hold 500 microns for 30 minutes minimum.',
    symptoms: [
      'A/C blows warm air',
      'A/C compressor not engaging (no click or hum)',
      'Intermittent A/C — works sometimes, not others',
      'A/C compressor making grinding or whining noise',
      'Reduced A/C performance in hot weather'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 600, high: 1800 },
    communityRecommendations: [
      { type: 'tip', content: 'ONLY use ND-11 PAG oil in the Prius C electric compressor — regular PAG 46 oil will destroy the internal inverter board within months', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Run the A/C for at least 10 minutes weekly even in winter — this lubricates the compressor seals and prevents moisture buildup that kills the inverter board', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Never add stop-leak or refrigerant with sealer to a Prius C — the sealant clogs the electric compressor scroll mechanism and destroys it', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'priuschat.com', description: 'Prius C electric A/C compressor replacement guide' },
      { source: 'toyotanation.com', description: 'Prius C A/C not working diagnosis' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 90,
    reviewedOn: '2026-03-13',
    dtcCodes: ['B1479', 'P0533']
  },
  {
    id: 'toyota-prius-c-cvt-judder-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      make: 'Toyota',
      model: 'Prius C'
    },
    category: 'transmission',
    title: 'Hybrid Transaxle Bearing Noise and Judder',
    description: 'The Prius C uses a compact hybrid transaxle (P510) that develops bearing noise and a judder/vibration during the transition between electric and gasoline power. The MG1 (motor-generator) bearings can develop wear, producing a whining noise that increases with vehicle speed. The transaxle fluid (Toyota WS ATF) breaks down faster than recommended service intervals suggest, especially in hot climates and stop-and-go city driving that the Prius C excels in. Low or degraded transaxle fluid accelerates bearing wear.',
    solution: 'Change the transaxle fluid every 60,000 miles with Toyota WS ATF (not generic CVT fluid). If bearing noise is already present, the transaxle may need to be rebuilt or replaced — bearing replacement alone requires transaxle disassembly. A fluid change at the first sign of noise can sometimes arrest the progression. The 12V battery should also be tested, as a weak 12V battery causes control system glitches that mimic transaxle judder.',
    symptoms: [
      'Whining noise from transaxle that increases with speed',
      'Judder or vibration during engine start-stop transitions',
      'Harsh engagement when accelerating from a stop',
      'Vibration felt through the floor at 20-40 mph',
      'Transaxle fluid dark or has metallic particles'
    ],
    severity: 'medium',
    confidence: 0.78,
    estimatedCost: { low: 100, high: 3500 },
    communityRecommendations: [
      { type: 'part', content: 'Toyota WS ATF (00289-ATFWS) — ONLY use genuine Toyota WS fluid in the Prius C transaxle, not generic CVT fluid', partBrand: 'Toyota OEM', partName: 'WS Automatic Transmission Fluid', partNumber: '00289-ATFWS', affiliateUrl: 'https://www.amazon.com/s?k=Toyota+WS+ATF+transmission+fluid&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Change transaxle fluid every 60,000 miles — Toyota says "lifetime fill" but the compact P510 transaxle runs hotter than the standard Prius unit', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Test the 12V battery first if experiencing judder — a weak 12V causes hybrid system control issues that feel like transaxle problems', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'priuschat.com', description: 'Prius C transaxle noise and fluid change intervals' },
      { source: 'toyotanation.com', description: 'Prius C shudder during power transitions' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 85,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0AA6']
  },
];

// Execute
const ymmt = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf-8'));
for (const entry of ymmtEntries) {
  for (const year of entry.years) {
    const y = String(year);
    if (!ymmt[y]) ymmt[y] = {};
    if (!ymmt[y][entry.make]) ymmt[y][entry.make] = {};
    ymmt[y][entry.make][entry.model] = entry.trims;
  }
}
fs.writeFileSync(YMMT_PATH, JSON.stringify(ymmt, null, 2));
console.log('YMMT: Added Toyota Solara, Echo, Prius V, Prius C');

const data = JSON.parse(fs.readFileSync(ISSUES_PATH, 'utf-8'));
data.issues.push(...newIssues);
fs.writeFileSync(ISSUES_PATH, JSON.stringify(data, null, 2));
console.log('Issues: Added', newIssues.length, 'issues. Total:', data.issues.length);
