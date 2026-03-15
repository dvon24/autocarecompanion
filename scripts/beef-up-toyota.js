/**
 * Beef up thin Toyota vehicle articles to 7-8 issues each.
 * Models: Corolla Cross, Sequoia, Sienna, Prius, Land Cruiser, Avalon
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function yearRange(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const issues = [
  // ============================================
  // TOYOTA COROLLA CROSS (2022-2025) — currently 3 issues
  // ============================================
  {
    id: 'toyota-corolla-cross-cvt-shudder-2022',
    make: 'Toyota',
    model: 'Corolla Cross',
    years: yearRange(2022, 2025),
    category: 'transmission',
    title: 'CVT Shudder and Hesitation at Low Speeds',
    description: 'The Corolla Cross equipped with the CVT (Direct Shift CVT) experiences a noticeable shudder or vibration during low-speed acceleration, particularly between 15-30 mph. The shudder feels similar to driving over rumble strips and is most pronounced during light throttle application. The issue is related to the CVT belt slipping on the pulleys during the transition from the mechanical first gear to the CVT range. Cold weather and stop-and-go driving conditions make the shudder more noticeable.',
    solution: 'Visit a Toyota dealer for a CVT transmission software update (TSB) that adjusts shift points and clutch engagement pressure to reduce shudder. If the software update does not resolve the issue, the CVT fluid should be drained and refilled with Toyota Genuine CVT Fluid FE ($150-$250). In persistent cases, the torque converter or CVT assembly may need replacement under warranty ($2,000-$4,500 if out of warranty). Document the shudder with video for the dealer visit.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Vibration or shudder during light acceleration at 15-30 mph',
      'Hesitation when accelerating from a stop',
      'Jerky or rough shifting sensation at low speeds',
      'Shudder worsens in cold weather',
      'Slight delay in power delivery from standstill'
    ],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0741', 'P2757'],
    estimatedCostLow: 0,
    estimatedCostHigh: 4500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Record a video of the shudder with your phone mounted on the dashboard before your dealer visit. Toyota dealers sometimes dismiss the complaint without documentation.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'A CVT fluid change with genuine Toyota CVT Fluid FE at 30,000 miles can help prevent or reduce shudder. Do not use aftermarket CVT fluid.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-corolla-cross-infotainment-lag-2022',
    make: 'Toyota',
    model: 'Corolla Cross',
    years: yearRange(2022, 2025),
    category: 'electrical',
    title: 'Infotainment System Lag, Freezing, and Bluetooth Dropouts',
    description: 'The Toyota Audio Multimedia system in the Corolla Cross suffers from sluggish response times, screen freezes, and Bluetooth connectivity issues. The touchscreen may take several seconds to respond to inputs, the system may freeze entirely requiring a reboot, and Bluetooth audio connections frequently drop or fail to auto-connect. Wireless Apple CarPlay and Android Auto connections are particularly unstable, with frequent disconnections mid-drive. The system can also be slow to boot up after starting the vehicle, leaving the driver without navigation or backup camera for 30-60 seconds.',
    solution: 'Check for over-the-air (OTA) software updates via the Toyota app or visit a dealer for a multimedia system software update — Toyota has released several updates addressing responsiveness and Bluetooth stability. Perform a factory reset of the infotainment system (Settings > General > Reset) to clear corrupted cache. Delete all paired Bluetooth devices and re-pair them. For wireless CarPlay/Android Auto issues, switch to a wired USB connection which is more stable. If the system remains unresponsive after updates, the head unit may need replacement ($800-$1,500).',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Touchscreen slow to respond to inputs',
      'System freezes and requires vehicle restart to recover',
      'Bluetooth audio drops out or fails to connect',
      'Wireless CarPlay/Android Auto disconnects frequently',
      'Backup camera delayed when shifting to reverse',
      'System takes 30+ seconds to boot after starting vehicle'
    ],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: ['U0155'],
    estimatedCostLow: 0,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Use a wired USB connection instead of wireless CarPlay/Android Auto. The wired connection is far more stable and also charges your phone. Wireless connections on this head unit are unreliable.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-corolla-cross-wind-noise-door-seals-2022',
    make: 'Toyota',
    model: 'Corolla Cross',
    years: yearRange(2022, 2025),
    category: 'body',
    title: 'Excessive Wind Noise from Door Seals at Highway Speeds',
    description: 'Corolla Cross owners report excessive wind noise at highway speeds (60+ mph), particularly from the front door and A-pillar areas. The door weatherstripping does not seal tightly enough against the door frame, allowing air to whistle through gaps. The noise is most noticeable on the driver side and worsens with crosswinds. Some owners also report wind noise from the side mirrors. The issue is attributed to thin door seal profiles and minor door alignment variations from the factory.',
    solution: 'Have the dealer inspect door alignment and adjust the door striker to improve seal compression — this is often covered under warranty. If the weatherstripping is not sealing properly, replacement door seals are available ($50-$150 per door). Many owners have successfully reduced wind noise by adding aftermarket D-shaped rubber weatherstrip tape ($15-$30) to the door frame as supplemental sealing. For mirror noise, aftermarket mirror wind deflectors ($20-$40) can help redirect airflow.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Whistling or rushing wind noise at highway speeds',
      'Noise primarily from driver side door area',
      'Wind noise worsens with crosswinds',
      'Audible air leak around A-pillar',
      'Interior noise level noticeably higher than expected'
    ],
    affectedSystems: ['Body', 'Interior'],
    dtcCodes: [],
    estimatedCostLow: 15,
    estimatedCostHigh: 300,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Add a D-shaped adhesive weatherstrip around the door opening perimeter as a secondary seal. It costs $15-$20 from Amazon and dramatically reduces wind noise. Many Corolla Cross owners report this as the best cheap fix.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-corolla-cross-ac-compressor-cycling-2022',
    make: 'Toyota',
    model: 'Corolla Cross',
    years: yearRange(2022, 2025),
    category: 'cooling',
    title: 'A/C Compressor Excessive Cycling and Inconsistent Cooling',
    description: 'The air conditioning system in some Corolla Cross vehicles exhibits rapid compressor cycling — the compressor engages and disengages every few seconds rather than running continuously. This causes inconsistent cabin cooling with warm air blowing intermittently, particularly in hot weather when the A/C is needed most. The issue can be caused by low refrigerant charge from a slow leak, a faulty A/C pressure sensor, or the compressor clutch relay. In hybrid models, the electric A/C compressor may also have inverter-related cycling issues.',
    solution: 'Have the A/C system pressure checked at a dealer or qualified shop. If the refrigerant charge is low, locate and repair the leak before recharging (common leak points: condenser, evaporator core seals, service port O-rings). Replace the A/C pressure switch if it is sending erratic readings ($50-$150). If the compressor clutch relay is sticking, replace it ($20-$40). A full A/C system recharge with leak dye costs $150-$300. If the compressor itself has failed, replacement runs $800-$1,400 with labor.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows cold then warm in a repeating cycle',
      'Compressor clicking on and off every few seconds',
      'Inconsistent cabin cooling in hot weather',
      'A/C takes a long time to cool the cabin',
      'Dashboard A/C light flickering'
    ],
    affectedSystems: ['HVAC', 'Cooling'],
    dtcCodes: ['B1479', 'P0533'],
    estimatedCostLow: 50,
    estimatedCostHigh: 1400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Before spending money on diagnostics, check the cabin air filter. A clogged cabin filter restricts airflow across the evaporator, which can cause icing and compressor cycling. Replace it if it has not been changed in 15,000+ miles.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-corolla-cross-rear-usb-failure-2022',
    make: 'Toyota',
    model: 'Corolla Cross',
    years: yearRange(2022, 2025),
    category: 'electrical',
    title: 'Rear Seat USB Charging Ports Not Functioning',
    description: 'The rear seat USB charging ports in the Corolla Cross stop providing power or intermittently cut out, leaving passengers unable to charge devices. The USB-A and USB-C ports on the rear of the center console may show no power output or very low charging speeds. The issue is caused by a faulty USB power module, loose wiring connections at the port assembly, or a blown fuse in the USB charging circuit. Some owners report the ports worked initially but failed within the first year of ownership.',
    solution: 'Check fuse #27 (15A) in the cabin fuse box — this controls the rear USB power circuit. If the fuse is blown, replace it and test. If it blows again, there is a short in the wiring that needs diagnosis. If the fuse is intact, the USB port module itself has likely failed and needs replacement ($100-$250 for parts, $50-$100 labor). This repair is covered under the 3-year/36,000-mile basic warranty. Clean the USB port contacts with compressed air before assuming failure — lint and debris can block the connection.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Rear USB ports not charging any devices',
      'Intermittent charging that cuts in and out',
      'Very slow charging speeds from rear ports',
      'Front USB ports work but rear ports do not',
      'No power indicator light on rear USB ports'
    ],
    affectedSystems: ['Electrical'],
    dtcCodes: [],
    estimatedCostLow: 5,
    estimatedCostHigh: 350,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check the cabin fuse box first — fuse #27 controls the rear USB circuit. A 15A fuse costs $1 and takes 30 seconds to replace. This is the most common fix.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // TOYOTA SEQUOIA (2001-2025) — currently 4 issues
  // ============================================
  {
    id: 'toyota-sequoia-air-injection-pump-2001',
    make: 'Toyota',
    model: 'Sequoia',
    years: yearRange(2001, 2007),
    category: 'engine',
    title: 'Secondary Air Injection Pump Failure (4.7L V8)',
    description: 'The secondary air injection (AI) pump on 2001-2007 Sequoia models with the 2UZ-FE 4.7L V8 is a widespread failure. The electric pump forces fresh air into the exhaust manifolds during cold start to reduce emissions. The pump motor burns out, the air switching valve (ASV) sticks from corrosion, and the check valves in the exhaust manifolds seize. This triggers the check engine light and will cause an emissions test failure. The system is complex and expensive to repair, with multiple failure points.',
    solution: 'Diagnosis requires checking the AI pump motor, the ASV valve, and both exhaust manifold check valves. Common repair approach: replace the AI pump ($300-$500), clean or replace the ASV ($200-$400), and replace the check valves ($100-$200 each). Total repair at a dealer can run $1,500-$2,500. Many owners in non-emissions states remove the system entirely and clear codes with a tune ($300-$500). In emissions states, the full repair is required to pass inspection.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Check engine light with secondary air injection codes',
      'Loud whirring noise from AI pump on cold start',
      'AI pump not running during cold start (no noise)',
      'Failed emissions inspection',
      'Multiple air injection system fault codes stored'
    ],
    affectedSystems: ['Engine', 'Emissions'],
    dtcCodes: ['P2440', 'P2441', 'P2442', 'P2443', 'P0418'],
    estimatedCostLow: 300,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'If you live in a non-emissions state, an AI pump delete with an ECU tune is the most cost-effective solution. The system only runs for 30-60 seconds on cold start and has zero effect on performance or fuel economy.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Do not ignore this repair hoping it will go away. Failed check valves can allow exhaust gases to backflow into the AI pump, destroying it. Fix the check valves first to protect the pump.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sequoia-exhaust-manifold-crack-2001',
    make: 'Toyota',
    model: 'Sequoia',
    years: yearRange(2001, 2007),
    category: 'exhaust',
    title: 'Exhaust Manifold Cracking (4.7L 2UZ-FE V8)',
    description: 'The cast iron exhaust manifolds on the 2001-2007 Sequoia 4.7L V8 develop cracks from repeated thermal cycling. The cracks typically appear at the flange where the manifold bolts to the cylinder head or between the runner tubes. A cracked manifold causes an audible exhaust leak (ticking noise on cold start that fades as the manifold expands when hot), a faint exhaust smell near the engine bay, and can eventually trigger a check engine light for catalyst efficiency if exhaust gases bypass the catalytic converter.',
    solution: 'Replace the cracked exhaust manifold ($300-$600 per side for parts). Both sides should be inspected as cracking often affects both manifolds. The exhaust manifold studs frequently break during removal due to corrosion — budget for stud extraction or replacement ($100-$200 extra). Total repair with gaskets and hardware runs $800-$1,500 per side at a shop. Aftermarket stainless steel headers ($400-$800 per side) are a popular upgrade that resists cracking. Always replace the manifold gaskets during the repair.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Ticking or tapping noise from engine on cold start',
      'Exhaust noise that fades as engine warms up',
      'Exhaust smell near engine bay or cabin',
      'Check engine light for catalyst efficiency',
      'Visible cracks on exhaust manifold surface',
      'Soot stains around manifold flange area'
    ],
    affectedSystems: ['Exhaust', 'Engine'],
    dtcCodes: ['P0420', 'P0430'],
    estimatedCostLow: 800,
    estimatedCostHigh: 3000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Soak the exhaust manifold studs with penetrating oil (PB Blaster) for several days before attempting removal. Broken studs are extremely common on these engines and add significant cost to the repair.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sequoia-frame-rust-2001',
    make: 'Toyota',
    model: 'Sequoia',
    years: yearRange(2001, 2007),
    category: 'body',
    title: 'Frame Rust and Corrosion (Salt Belt Vehicles)',
    description: 'First-generation Sequoia models (2001-2007) are susceptible to severe frame rust, particularly in northern states where road salt is used. The frame crossmembers, rear spring hangers, and body mount areas are the most vulnerable. In severe cases, the frame can rust through to the point of structural failure, making the vehicle unsafe. Toyota did not apply adequate rust protection to these frames from the factory. Unlike the Tacoma and Tundra, the Sequoia was not included in Toyota frame replacement programs.',
    solution: 'Have the frame inspected annually by a qualified shop, particularly the rear crossmembers and spring perch areas. If rust is surface-level, wire brush and apply a rust converter (POR-15 or Eastwood Rust Encapsulator) followed by rubberized undercoating ($200-$500 DIY, $500-$1,000 professional). If structural rust-through is present, the frame may need professional welding repair ($1,500-$4,000) or reinforcement plates. In severe cases, the vehicle may need to be retired if frame integrity is compromised. Annual fluid film or Krown rustproofing ($100-$200/year) is the best prevention.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Visible rust flaking from frame rails',
      'Holes or perforations in frame crossmembers',
      'Body mount bushings sitting in rusted-out frame pockets',
      'Clunking noises from loose body mounts',
      'Failed state safety inspection for frame condition',
      'Rust debris falling from undercarriage'
    ],
    affectedSystems: ['Frame', 'Body', 'Structural'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 4000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'If you are buying a used first-gen Sequoia from a salt state, get a frame inspection BEFORE purchase. Frame rust can make the vehicle worthless and unsafe. This is non-negotiable.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Annual Fluid Film or Krown rustproofing treatment ($100-$150/year) is the single best investment for a first-gen Sequoia in the rust belt. Apply every fall before winter.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sequoia-rear-hatch-strut-2001',
    make: 'Toyota',
    model: 'Sequoia',
    years: yearRange(2001, 2022),
    category: 'body',
    title: 'Rear Liftgate Strut Failure (Hatch Won\'t Stay Open)',
    description: 'The gas-charged struts that hold the rear liftgate open on the Sequoia lose pressure over time, causing the heavy rear hatch to fall on its own. This is a safety concern as the liftgate is large and heavy enough to injure someone if it drops unexpectedly. The struts typically begin to weaken after 5-7 years and fail completely within 8-10 years. Cold weather accelerates the failure as gas pressure drops with temperature. Both first-generation (2001-2007) and second-generation (2008-2022) models are affected.',
    solution: 'Replace both rear liftgate struts at the same time — they are sold in pairs for $30-$80. Installation takes 10-15 minutes with no tools required on most models (the struts pop on and off ball studs). OEM Toyota struts are available for $40-$60 each, and aftermarket options from Stabilus, StrongArm, or Sachs run $15-$30 each. Always replace both struts even if only one has failed — if one is weak, the other is close behind. This is one of the easiest DIY repairs on the Sequoia.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Rear liftgate will not stay open on its own',
      'Liftgate slowly drops when released',
      'Liftgate falls quickly when opened — safety hazard',
      'Need to prop liftgate open with a stick or arm',
      'Liftgate harder to lift than when new'
    ],
    affectedSystems: ['Body'],
    dtcCodes: [],
    estimatedCostLow: 30,
    estimatedCostHigh: 120,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'This is a 10-minute DIY repair. The struts pop off the ball studs with a flat-head screwdriver. Buy a pair from Amazon for $30-$50 and replace them yourself. No tools or jack needed.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sequoia-iforce-max-cooling-2023',
    make: 'Toyota',
    model: 'Sequoia',
    years: yearRange(2023, 2025),
    category: 'cooling',
    title: 'i-FORCE MAX Hybrid Cooling System Issues',
    description: 'The 2023+ Sequoia with the i-FORCE MAX twin-turbo V6 hybrid powertrain has experienced cooling system issues related to the added complexity of cooling both the twin-turbo engine and hybrid battery system. Owners report coolant loss with no visible external leak (internal leak at turbo coolant lines), electric cooling fan running continuously at high speed even in mild weather, and occasional overheating warnings during towing. The hybrid battery cooling circuit is separate from the engine cooling circuit and has its own failure modes.',
    solution: 'For coolant loss: have the dealer pressure test both the engine and turbo cooling circuits. Common leak points are the turbo coolant feed/return lines and the intercooler. For continuous fan operation: the hybrid battery cooling fans have an independent control module — check for DTCs related to battery temperature management. For towing overheating: ensure the transmission cooler and auxiliary cooler (if equipped with tow package) are functioning. Toyota has issued TSBs addressing cooling system software calibration. Verify all cooling system software is at the latest version.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Coolant level dropping with no visible leak',
      'Cooling fans running at high speed constantly',
      'Overheating warning while towing',
      'Sweet coolant smell from engine bay',
      'Hybrid system reduced power warning',
      'Engine temperature gauge reading higher than normal'
    ],
    affectedSystems: ['Cooling', 'Hybrid System', 'Engine'],
    dtcCodes: ['P0116', 'P0118', 'P26B4'],
    estimatedCostLow: 100,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Check coolant level weekly during the first year of ownership. The twin-turbo system has many more coolant connections than a naturally aspirated engine. Catching a small leak early prevents overheating damage.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // TOYOTA SIENNA (2004-2025) — currently 5 issues
  // ============================================
  {
    id: 'toyota-sienna-sliding-door-cable-2004',
    make: 'Toyota',
    model: 'Sienna',
    years: yearRange(2004, 2020),
    category: 'electrical',
    title: 'Power Sliding Door Cable and Motor Failure',
    description: 'The power sliding doors on the 2004-2020 Sienna are a chronic failure point. The steel cables that operate the door mechanism fray and break, the door motor burns out, and the roller assemblies seize. When the cable breaks, the door may become stuck partially open or closed, or the door may open/close erratically. The center cable is the most common failure point. Repeated use in cold weather, door obstruction events (hitting the safety reverse), and age all contribute to cable and motor wear. This is one of the most commonly reported Sienna issues across all model years.',
    solution: 'Replace the failed sliding door cable assembly ($150-$300 for parts). If the motor has also failed, a complete door motor and cable assembly runs $400-$700. Labor is 2-4 hours ($300-$600). The door can be operated manually by disabling the power function until repaired (switch on the door jamb or dashboard). Lubricate the door tracks and roller assemblies annually with white lithium grease to extend cable life. Both sides should be inspected when one fails, as they wear at similar rates.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Sliding door opens or closes very slowly',
      'Door stops midway and reverses direction',
      'Grinding or clicking noise when door operates',
      'Door stuck partially open or closed',
      'Power sliding door warning light on dashboard',
      'Door works manually but not with power button'
    ],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: ['B2289', 'B2290'],
    estimatedCostLow: 300,
    estimatedCostHigh: 1300,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Lubricate the door tracks and cable channels with white lithium grease every 6 months. This is the single best preventive measure for power sliding door longevity. Takes 10 minutes per side.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If a door is stuck, flip the manual/power switch on the door jamb to MANUAL mode. You can operate the door by hand until the repair is completed.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sienna-dashboard-crack-2004',
    make: 'Toyota',
    model: 'Sienna',
    years: yearRange(2004, 2010),
    category: 'interior',
    title: 'Dashboard Cracking and Warping',
    description: 'The dashboard on 2004-2010 Sienna models develops cracks, splits, and warping from sun exposure and heat cycling. The dashboard surface material degrades and develops deep cracks, particularly on the top surface above the instrument cluster and on the passenger side. The cracking is not just cosmetic — it creates a sticky, rough surface and releases small particles. This was a widespread issue that affected many Toyota and Lexus models from this era and was linked to the dashboard material formulation used during this period.',
    solution: 'Toyota extended warranty coverage for dashboard replacement on some model years due to the widespread nature of this defect — contact your dealer to check VIN eligibility. If covered, dashboard replacement is performed at no cost. If not covered, a new dashboard from Toyota costs $1,500-$2,500 installed. More affordable options include a dashboard cover mat ($50-$100) from DashMat or Coverlay to hide the cracks and prevent further deterioration. Some owners have had dashboards professionally re-skinned for $500-$1,000.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Visible cracks on dashboard surface',
      'Dashboard surface feels sticky or tacky',
      'Warping or bubbling of dashboard material',
      'Glare from cracked/shiny dashboard surface',
      'Small particles or flakes falling from dashboard'
    ],
    affectedSystems: ['Interior'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check if your VIN is eligible for Toyota extended warranty dashboard replacement. Toyota covered this repair on many affected vehicles even outside the normal warranty period.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'A Coverlay dashboard cover ($150-$250) is the best value fix. It covers the cracks with a molded ABS plastic overlay that looks nearly factory. Much cheaper than dashboard replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sienna-power-steering-rack-leak-2004',
    make: 'Toyota',
    model: 'Sienna',
    years: yearRange(2004, 2020),
    category: 'steering',
    title: 'Power Steering Rack Seal Leak',
    description: 'The hydraulic power steering rack on 2004-2020 Sienna models (non-hybrid, pre-2021) develops internal seal leaks that allow power steering fluid to weep from the rack boots or the input shaft seal. The leak starts slowly but progressively worsens, leading to low fluid level, groaning pump noise, and eventually heavy steering effort. The leak is typically visible as fluid dripping from the rubber boots at either end of the steering rack or from the area where the steering column connects to the rack.',
    solution: 'A leaking steering rack should be replaced or rebuilt. A remanufactured steering rack runs $250-$500 for parts, with labor at $400-$800 (3-5 hours including alignment). A new OEM rack is $600-$1,200. As a temporary measure, topping off the power steering fluid and adding a stop-leak additive (Lucas Power Steering Stop Leak, $10) can slow a minor leak for several months. A four-wheel alignment ($100-$150) is required after rack replacement. The 2021+ Sienna uses electric power steering and does not have this issue.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Power steering fluid puddle under vehicle',
      'Groaning or whining noise when turning the wheel',
      'Steering feels heavy or stiff, especially at low speed',
      'Power steering fluid level drops frequently',
      'Wet or oily steering rack boots'
    ],
    affectedSystems: ['Steering'],
    dtcCodes: [],
    estimatedCostLow: 250,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check power steering fluid level monthly if you notice any steering noise. Running the pump dry even briefly will damage it, turning a $500 rack repair into a $1,500 rack and pump repair.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sienna-oil-consumption-2007',
    make: 'Toyota',
    model: 'Sienna',
    years: yearRange(2007, 2020),
    category: 'engine',
    title: 'Excessive Oil Consumption (2GR-FE 3.5L V6)',
    description: 'The 2GR-FE 3.5L V6 engine used in 2007-2020 Sienna models can develop excessive oil consumption, burning a quart or more of oil between 5,000-mile oil changes. The issue is caused by piston ring wear and carbon buildup that prevents the rings from properly sealing against the cylinder walls. The problem is more common in vehicles that had extended oil change intervals early in life. Some owners report using a quart every 1,000-2,000 miles in severe cases.',
    solution: 'Monitor oil level every 1,000 miles and top off as needed with 0W-20 synthetic oil. Toyota considers up to 1 quart per 1,200 miles "normal" oil consumption, but many owners find this excessive. For mild cases, switching to a high-mileage synthetic oil (Valvoline MaxLife, Castrol High Mileage) with seal conditioners can help. For severe cases (1 qt per 1,000 miles or less), an engine top-end overhaul with new piston rings costs $2,000-$3,500. An Italian tune-up (sustained high-RPM driving) can temporarily reduce consumption by burning off carbon deposits on the rings.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Oil level low between oil changes',
      'Need to add oil every 1,000-2,000 miles',
      'Blue smoke from exhaust on startup',
      'Oil smell from exhaust',
      'Fouled spark plugs from oil burning'
    ],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0171', 'P0174'],
    estimatedCostLow: 0,
    estimatedCostHigh: 3500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Keep a quart of 0W-20 in the van at all times and check the dipstick at every fuel fill-up. Catching low oil early prevents engine damage. The 2GR-FE is otherwise an extremely reliable engine.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-sienna-hybrid-battery-degradation-2021',
    make: 'Toyota',
    model: 'Sienna',
    years: yearRange(2021, 2025),
    category: 'electrical',
    title: 'Hybrid Battery Performance Degradation Signs',
    description: 'The 2021+ Sienna is hybrid-only with a 1.9 kWh nickel-metal hydride battery pack. Some early adopters are reporting signs of hybrid battery performance degradation including reduced electric-only driving range, the gasoline engine running more frequently than expected, decreased overall fuel economy compared to when the vehicle was new, and the battery charge gauge not reaching full charge. While Toyota hybrid batteries are generally very reliable, the Sienna hybrid system works the battery harder than the Prius due to the heavier vehicle weight and more frequent engine-off coasting demands.',
    solution: 'Have the dealer run a hybrid battery health check — Toyota Techstream can read individual cell voltages and overall battery capacity. If one or more cells are weak, individual cell replacement ($1,500-$3,000) is possible at specialty hybrid shops rather than replacing the entire pack ($4,000-$7,000 at dealer). The hybrid battery is covered under Toyota 10-year/150,000-mile hybrid component warranty. Keep the battery cooling fan intake (under the rear seat) clean and unobstructed — poor airflow is the leading cause of premature hybrid battery degradation.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Fuel economy decreasing over time',
      'Gas engine running more often than when new',
      'Battery charge gauge not reaching full bars',
      'Reduced electric-only driving capability',
      'Hybrid system warning light',
      'Fan running loudly under rear seat'
    ],
    affectedSystems: ['Hybrid System', 'Electrical', 'Battery'],
    dtcCodes: ['P0A80', 'P3000'],
    estimatedCostLow: 0,
    estimatedCostHigh: 7000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Vacuum under the rear seat every 6 months to keep the hybrid battery cooling fan intake clear. Pet hair and debris clog the intake and cause the battery to overheat, which is the #1 cause of premature battery failure.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // TOYOTA PRIUS (2004-2025) — currently 5 issues
  // ============================================
  {
    id: 'toyota-prius-catalytic-converter-theft-2004',
    make: 'Toyota',
    model: 'Prius',
    years: yearRange(2004, 2025),
    category: 'exhaust',
    title: 'Catalytic Converter Theft Vulnerability',
    description: 'The Toyota Prius is the single most targeted vehicle for catalytic converter theft in the United States. The Prius catalytic converter contains higher concentrations of precious metals (palladium, rhodium, platinum) than most vehicles because the hybrid system results in a cleaner-running engine that preserves the catalyst metals. The converter is also easily accessible under the vehicle and can be cut out with a battery-powered reciprocating saw in under 60 seconds. Thieves sell stolen converters for $100-$300 to recyclers who extract metals worth $500+. Gen 2 (2004-2009) and Gen 3 (2010-2015) Prius are the most targeted.',
    solution: 'Install a catalytic converter anti-theft shield or cage ($150-$400 installed). Popular options include CatClamp, MillerCAT, and CatShield. These devices make the converter much harder and more time-consuming to steal. Park in well-lit areas and garages when possible. Engrave your VIN on the converter ($30-$50 at a muffler shop) to aid in recovery. Some owners install motion-activated alarms or cameras. If your converter is stolen, replacement costs $1,500-$3,000 for an OEM converter, or $500-$1,000 for an aftermarket CARB-compliant unit (required in California).',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Extremely loud exhaust noise when starting the vehicle',
      'Vehicle sounds like a race car or has no muffler',
      'Check engine light for catalyst efficiency codes',
      'Visible saw cuts on exhaust pipe under vehicle',
      'Reduced engine performance and rough running'
    ],
    affectedSystems: ['Exhaust', 'Emissions'],
    dtcCodes: ['P0420', 'P0421'],
    estimatedCostLow: 150,
    estimatedCostHigh: 3000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Install a CatShield or MillerCAT guard immediately. It costs $200-$400 and takes 30-60 minutes to install. This is non-optional for Prius owners — catalytic converter theft is a matter of when, not if.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Check if your insurance covers catalytic converter theft under comprehensive coverage. Many policies cover it with just the deductible. File a police report immediately if stolen.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-prius-head-gasket-failure-2004',
    make: 'Toyota',
    model: 'Prius',
    years: yearRange(2004, 2015),
    category: 'engine',
    title: 'Head Gasket Failure and Coolant Consumption (1NZ-FXE)',
    description: 'The 1.5L 1NZ-FXE (Gen 2) and 1.8L 2ZR-FXE (Gen 3) engines in the Prius can develop head gasket failures that allow coolant to leak internally into the combustion chambers. The failure is often slow and insidious — coolant level drops gradually with no visible external leak. The coolant burns off in the exhaust, sometimes producing white smoke or a sweet smell. If undetected, the coolant loss can lead to overheating and catastrophic engine damage. The 1NZ-FXE in Gen 2 models (2004-2009) is more prone to this issue.',
    solution: 'If coolant is disappearing with no external leak, have a combustion gas leak test performed ($50-$100) — this test detects combustion gases in the coolant, confirming a head gasket breach. Head gasket replacement costs $1,500-$2,500 on the Prius due to the need to remove the intake manifold and hybrid components for access. If caught early before overheating, the engine block and head are usually salvageable. If the engine has overheated, the head may be warped, requiring machining ($200-$400 additional) or engine replacement ($3,000-$5,000).',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Coolant level dropping with no visible leak',
      'White smoke from exhaust, especially on startup',
      'Sweet coolant smell from exhaust',
      'Overheating or temperature gauge fluctuations',
      'Bubbles in coolant overflow tank',
      'Milky residue on oil filler cap'
    ],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: ['P0115', 'P0128', 'P0171'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 5000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Check coolant level monthly. The Prius head gasket can leak internally without any visible external signs. By the time you see white smoke, the gasket has been leaking for a while.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-prius-egr-cooler-clog-2010',
    make: 'Toyota',
    model: 'Prius',
    years: yearRange(2010, 2020),
    category: 'engine',
    title: 'EGR Cooler and Valve Clogging with Carbon Deposits',
    description: 'The Exhaust Gas Recirculation (EGR) system on Gen 3 and Gen 4 Prius models develops heavy carbon buildup that restricts the EGR cooler and causes the EGR valve to stick. The Prius engine runs in an extended Atkinson cycle and frequently operates at low temperatures due to the hybrid system shutting off the engine, which promotes carbon accumulation. The clogged EGR reduces engine efficiency, causes rough idle, misfires, and can trigger multiple DTCs. Short trips and city driving exacerbate the problem.',
    solution: 'Remove and clean the EGR cooler and valve — this requires removing the intake manifold for access ($400-$800 in labor). The EGR cooler can be soaked in carbon cleaner and flushed. Replace the EGR valve if cleaning does not restore full function ($150-$300 for parts). Some shops use walnut blasting to clean the intake ports at the same time ($200-$400). To prevent recurrence, take the Prius on highway drives periodically (30+ minutes at highway speed) to raise engine temperature and burn off carbon deposits.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Rough or unstable idle',
      'Engine misfires at low speed',
      'Check engine light with EGR-related codes',
      'Reduced fuel economy',
      'Engine hesitation during acceleration',
      'Black soot in exhaust'
    ],
    affectedSystems: ['Engine', 'Emissions'],
    dtcCodes: ['P0401', 'P0402', 'P0403', 'P0404'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Take your Prius on a 30-minute highway drive at least once a week. Sustained high-RPM operation burns off carbon deposits in the EGR system. City-only driving is the worst thing for this engine.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-prius-12v-battery-drain-2004',
    make: 'Toyota',
    model: 'Prius',
    years: yearRange(2004, 2025),
    category: 'electrical',
    title: '12V Auxiliary Battery Drain and Failure',
    description: 'The 12V auxiliary battery in the Prius is critical for powering the vehicle computer systems that must boot up before the hybrid system can start. Unlike conventional cars where a weak battery can still crank the engine, a dead 12V battery in the Prius means the vehicle will not start at all — no dashboard lights, no READY mode, nothing. The small 12V battery (typically a Group S46B24R) drains faster than in conventional vehicles because it powers always-on systems like the smart key receiver, security system, and clock. The battery typically lasts only 3-5 years, shorter than in conventional vehicles.',
    solution: 'Replace the 12V auxiliary battery every 4-5 years as preventive maintenance. The battery is located in the right rear of the cargo area (not under the hood). OEM Toyota replacement costs $200-$300 installed at the dealer. Aftermarket AGM batteries (Optima Yellow Top, Odyssey) run $150-$250 and can be installed DIY in 15 minutes. If the battery dies, a jump start to the 12V terminal under the hood (or in the fuse box on Gen 4) will get the car started. Consider a battery tender/maintainer if the car sits for more than a week at a time.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Vehicle will not enter READY mode',
      'No dashboard lights or display when pressing start button',
      'Smart key system not detecting key fob',
      'Clock resetting or losing time',
      'Intermittent electrical glitches before total failure',
      'Vehicle will not start after sitting for several days'
    ],
    affectedSystems: ['Electrical', 'Battery'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 300,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Mark your calendar to replace the 12V battery every 4 years proactively. A dead 12V battery at the worst possible time is the most common Prius "breakdown" and it is 100% preventable. The battery is in the rear cargo area, not under the hood.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If your Prius sits for more than a week, connect a battery tender to the 12V battery. A CTEK or Battery Tender Junior ($30-$50) will keep it charged and extend battery life significantly.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-prius-inverter-coolant-pump-2004',
    make: 'Toyota',
    model: 'Prius',
    years: yearRange(2004, 2015),
    category: 'cooling',
    title: 'Inverter Coolant Pump Failure',
    description: 'The Prius has a separate cooling circuit for the hybrid inverter and power electronics, driven by a small electric coolant pump. This pump fails due to motor burnout or impeller wear, causing the inverter to overheat. When the inverter overheats, the hybrid system enters a reduced power mode or shuts down entirely, displaying warning lights and potentially stranding the driver. The inverter cooling system is independent of the engine cooling system and uses its own coolant reservoir (the pink reservoir on Gen 2 models). Many owners are unaware this separate cooling circuit exists and never service it.',
    solution: 'Replace the inverter coolant pump ($100-$250 for parts, $200-$400 labor). Flush and refill the inverter cooling circuit with Toyota Super Long Life Coolant during the repair. The inverter coolant should be flushed every 100,000 miles as preventive maintenance — most owners and even some shops are unaware of this separate cooling circuit. After pump replacement, bleed the inverter cooling system carefully as air pockets will cause the inverter to overheat. Check the inverter coolant level at every oil change — it is the smaller reservoir, separate from the engine coolant.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Hybrid system warning lights on dashboard',
      'Vehicle entering reduced power or "turtle" mode',
      'Red triangle warning light',
      'Inverter overheating warning',
      'Loss of electric assist and poor acceleration',
      'Vehicle will not enter READY mode'
    ],
    affectedSystems: ['Cooling', 'Hybrid System', 'Electrical'],
    dtcCodes: ['P0A93', 'P3125', 'P0A78'],
    estimatedCostLow: 200,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'The Prius has TWO separate cooling systems — one for the engine and one for the inverter. Most owners only know about the engine coolant. Check both reservoirs and flush the inverter coolant every 100,000 miles.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // TOYOTA LAND CRUISER (1998-2025) — currently 5 issues
  // ============================================
  {
    id: 'toyota-land-cruiser-air-injection-failure-1998',
    make: 'Toyota',
    model: 'Land Cruiser',
    years: yearRange(1998, 2007),
    category: 'engine',
    title: 'Secondary Air Injection System Failure (100-Series, 4.7L V8)',
    description: 'The secondary air injection (AI) system on the 100-series Land Cruiser (1998-2007) with the 2UZ-FE 4.7L V8 is a notorious failure point, identical to the issue on the Sequoia and Tundra of the same era. The electric AI pump, air switching valves (ASV), and exhaust manifold check valves all fail. The aluminum check valves in the exhaust manifolds corrode and seize, the ASV sticks from carbon buildup, and the pump motor eventually burns out. This system is responsible for the most common check engine light on 100-series Land Cruisers.',
    solution: 'The complete repair involves replacing the AI pump ($300-$500), both ASV valves ($200-$400 each), and both exhaust manifold check valves ($100-$200 each). Total dealer cost: $1,500-$3,000. Many Land Cruiser owners in non-emissions states delete the entire AI system and install an ECU tune to suppress the codes ($300-$500 for the tune). In emissions states, the full repair is required. A common partial fix is to replace just the check valves and ASV, leaving the pump in place — the pump usually fails last.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Check engine light with air injection codes',
      'Loud whirring from AI pump on cold start',
      'AI pump not running on cold start (silence where there should be noise)',
      'Multiple emissions-related fault codes',
      'Failed emissions inspection'
    ],
    affectedSystems: ['Engine', 'Emissions'],
    dtcCodes: ['P2440', 'P2441', 'P2442', 'P2443', 'P0418'],
    estimatedCostLow: 300,
    estimatedCostHigh: 3000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Join IH8MUD.com — the definitive Land Cruiser forum. The AI system delete with ECU tune is thoroughly documented there with step-by-step instructions and recommended tuners.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-land-cruiser-ahc-suspension-leak-1998',
    make: 'Toyota',
    model: 'Land Cruiser',
    years: yearRange(1998, 2021),
    category: 'suspension',
    title: 'AHC Hydraulic Suspension Leak and Failure',
    description: 'Land Cruisers equipped with the Active Height Control (AHC) hydraulic suspension system experience hydraulic fluid leaks from the shock absorber seals, hydraulic lines, and the AHC pump assembly. When the system leaks, the vehicle sags on the affected corner or the entire vehicle sits lower than normal. The AHC pump runs continuously trying to compensate for the leak, eventually overheating and failing. AHC repairs are extremely expensive at the dealer, and the system adds significant complexity compared to conventional suspension. The 100-series (1998-2007) and 200-series (2008-2021) are both affected.',
    solution: 'For minor leaks: replace the leaking AHC shock absorber or hydraulic line ($500-$1,200 per corner for parts). The AHC pump assembly replacement costs $1,500-$3,000 at the dealer. Total AHC system overhaul can exceed $5,000-$8,000. Many Land Cruiser owners convert to conventional coil spring suspension (AHC delete), which costs $1,500-$3,000 for quality shocks and springs (Old Man Emu, Icon, Ironman) and eliminates the AHC complexity permanently. The AHC delete requires an AHC bypass module ($100-$200) to suppress dashboard warnings.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Vehicle sagging on one corner or one side',
      'Suspension height warning light on dashboard',
      'Hydraulic pump running continuously (audible whirring)',
      'Oily residue on AHC shock absorbers',
      'Vehicle sitting lower than normal overall',
      'Ride quality deterioration and bouncing'
    ],
    affectedSystems: ['Suspension', 'Hydraulic'],
    dtcCodes: ['C1714', 'C1715', 'C1718'],
    estimatedCostLow: 500,
    estimatedCostHigh: 8000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'If you are buying a used Land Cruiser with AHC, budget $2,000-$5,000 for eventual AHC repairs or conversion to conventional suspension. AHC failure is a when, not if, question on high-mileage trucks.', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Old Man Emu (OME) heavy-duty suspension kit is the gold standard AHC replacement. Converts to reliable conventional coil springs and shocks with a mild 2-inch lift. Eliminates all AHC headaches.', partBrand: 'Old Man Emu', partName: 'Heavy Duty Suspension Kit', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-land-cruiser-dashboard-crack-1998',
    make: 'Toyota',
    model: 'Land Cruiser',
    years: yearRange(1998, 2007),
    category: 'interior',
    title: 'Dashboard Cracking (100-Series)',
    description: 'The dashboard on 100-series Land Cruisers (1998-2007) develops extensive cracks from UV exposure and heat cycling, similar to the issue affecting other Toyota/Lexus models from this era. The top surface of the dashboard cracks and becomes sticky, particularly in hot climates. The cracking is widespread enough that finding a 100-series with an uncracked original dashboard is rare. The same issue affects the Lexus LX470, which shares the same dashboard. Toyota did not extend warranty coverage for Land Cruiser dashboards as they did for some other affected models.',
    solution: 'Dashboard replacement with a new OEM unit costs $2,000-$4,000 installed and is rarely worth the expense on these vehicles. The most popular solution is a Coverlay molded dashboard cover ($200-$350), which is a rigid ABS plastic overlay that covers the cracks and looks nearly factory. DashMat fabric covers ($50-$100) are a budget option. Some owners have had dashboards professionally recovered in leather or vinyl ($500-$1,500) at upholstery shops. Use a windshield sunshade when parked to slow further deterioration.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Deep cracks on dashboard top surface',
      'Dashboard material sticky or tacky to touch',
      'Cracking spreading from center to edges over time',
      'Dashboard surface rough and deteriorating',
      'Glare from cracked reflective dashboard surface'
    ],
    affectedSystems: ['Interior'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 4000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Coverlay dash cover is the best value solution. It is a rigid molded piece that fits over your cracked dashboard and looks factory. Costs $250-$350 and installs in an hour. Every 100-series owner should have one.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-land-cruiser-timing-belt-tensioner-1998',
    make: 'Toyota',
    model: 'Land Cruiser',
    years: yearRange(1998, 2007),
    category: 'engine',
    title: 'Timing Belt Tensioner and Water Pump Failure (2UZ-FE)',
    description: 'The 2UZ-FE 4.7L V8 uses a timing belt that must be replaced at 90,000-mile intervals. The hydraulic timing belt tensioner and idler pulleys are critical failure points — if the tensioner fails, the timing belt can slip or break, potentially causing valve-to-piston contact on this interference engine. The water pump is driven by the timing belt and commonly leaks at the same mileage interval. Since the labor to access the timing belt is 6-8 hours, all components (belt, tensioner, idler pulleys, water pump) should be replaced together as a comprehensive timing belt service.',
    solution: 'Perform a comprehensive timing belt service every 90,000 miles, replacing the timing belt, hydraulic tensioner, both idler pulleys, and water pump together. A complete timing belt kit with water pump costs $250-$500 for parts. Labor is 6-8 hours ($600-$1,200) due to the tight engine bay and need to remove accessories for access. Use OEM Toyota or Aisin (OEM supplier) components only — aftermarket timing belts and tensioners have higher failure rates on this engine. Always replace the thermostat and coolant while the system is apart. Total cost: $1,000-$1,800 at an independent shop, $1,500-$2,500 at the dealer.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Squealing or chirping noise from timing belt area',
      'Coolant leak from water pump weep hole',
      'Engine approaching or past 90,000 miles without timing belt service',
      'Timing belt showing cracks or wear on inspection',
      'Rough idle or engine timing issues'
    ],
    affectedSystems: ['Engine', 'Timing', 'Cooling'],
    dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 1000,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Do NOT skip or delay the 90,000-mile timing belt service. The 2UZ-FE is an interference engine — if the belt breaks, valves hit pistons and you are looking at a $5,000-$8,000 engine rebuild. This is the single most important maintenance item on the 100-series.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Always replace the water pump with the timing belt. The pump costs $60-$100 extra and the labor is already done. A water pump failure between timing belt services means paying for the full labor again.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-land-cruiser-center-diff-lock-1998',
    make: 'Toyota',
    model: 'Land Cruiser',
    years: yearRange(1998, 2021),
    category: 'drivetrain',
    title: 'Center Differential Lock Actuator Failure',
    description: 'The center differential lock on the Land Cruiser uses an electric vacuum actuator to engage and disengage the locking mechanism. The actuator motor fails, the vacuum lines crack and leak, or the shift fork inside the transfer case wears, preventing the center diff lock from engaging or disengaging properly. A stuck center diff lock can leave the vehicle in permanently locked mode (causing binding and tire wear on pavement) or unable to lock (reducing off-road capability). The dashboard indicator light may flash or show incorrect lock status.',
    solution: 'Diagnose by checking the vacuum lines to the actuator for cracks and leaks (replace cracked lines with silicone vacuum hose, $10-$20). If vacuum is reaching the actuator but the diff does not lock, the actuator motor has failed ($200-$500 for parts, $300-$500 labor). In some cases, the transfer case shift fork is worn and requires transfer case disassembly ($800-$1,500 labor). Test the center diff lock regularly (monthly) to keep the mechanism exercised — Land Cruisers that never use the diff lock are more prone to actuator seizure.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Center diff lock will not engage when button is pressed',
      'Center diff lock indicator light flashing or not illuminating',
      'Diff lock engaged but will not disengage',
      'Clicking noise from transfer case area when pressing lock button',
      'Binding or hopping sensation in turns (stuck in locked mode)',
      'Reduced off-road traction (unable to lock)'
    ],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: ['C1436', 'C1438'],
    estimatedCostLow: 50,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Exercise the center diff lock monthly — engage it on dirt or gravel at low speed, drive 50 feet, then disengage. Actuators that sit unused for years are far more likely to seize. Use it or lose it.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // TOYOTA AVALON (1995-2022) — currently 5 issues
  // ============================================
  {
    id: 'toyota-avalon-transmission-shudder-2005',
    make: 'Toyota',
    model: 'Avalon',
    years: yearRange(2005, 2012),
    category: 'transmission',
    title: 'Transmission Shudder and Torque Converter Vibration',
    description: 'The 2005-2012 Avalon with the U660E 6-speed automatic transmission develops a shudder or vibration during light acceleration, particularly in the 30-50 mph range at low engine RPMs. The shudder feels like driving over a textured road surface and is caused by the torque converter lockup clutch slipping. The issue is more pronounced when the transmission is warm and during gentle throttle application. Some owners describe it as a "rumble strip" feeling. The transmission fluid condition significantly affects the severity of the shudder.',
    solution: 'Start with a transmission fluid drain and refill using Toyota WS (World Standard) ATF only — do not use aftermarket ATF. A fluid change resolves or significantly improves the shudder in many cases ($150-$300). If the shudder persists after a fluid change, the torque converter may need replacement ($800-$1,500 for parts, $500-$1,000 labor). In severe cases, the entire transmission may need rebuild or replacement ($3,000-$5,000). Change transmission fluid every 30,000-40,000 miles to prevent the shudder from developing.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Vibration or shudder during light acceleration at 30-50 mph',
      'Rumble strip sensation during gentle driving',
      'Shudder disappears under heavy throttle',
      'Shudder more noticeable when transmission is warm',
      'Vibration felt through floorboard and seat'
    ],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0741', 'P2757', 'P2758'],
    estimatedCostLow: 150,
    estimatedCostHigh: 5000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'A simple drain and refill with Toyota WS ATF fixes the shudder in about 60% of cases. Do 2-3 drain-and-refill cycles (drive 500 miles between each) to exchange most of the fluid. Much cheaper than a torque converter replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-avalon-dashboard-melting-2005',
    make: 'Toyota',
    model: 'Avalon',
    years: yearRange(2005, 2012),
    category: 'interior',
    title: 'Dashboard Melting and Sticky Surface',
    description: 'The dashboard on 2005-2012 Avalon models develops a sticky, melting surface that is caused by degradation of the dashboard material under UV exposure and heat. The top surface becomes tacky and shiny, eventually cracking and deteriorating. The stickiness attracts dust and makes the dashboard look perpetually dirty. In severe cases, the dashboard surface begins to bubble and peel. This issue affected many Toyota and Lexus models from this era and was the subject of a class-action settlement. The Avalon and Camry were among the most affected models.',
    solution: 'Check eligibility for the Toyota dashboard replacement program — Toyota extended coverage for dashboard replacement on certain model years due to a class-action settlement. If eligible, the dashboard is replaced at no cost. If not covered, a new OEM dashboard costs $1,500-$2,500 installed. More practical alternatives include a Coverlay molded dashboard cover ($150-$300) or DashMat fabric cover ($50-$100). Some owners clean the sticky surface with isopropyl alcohol and apply a matte vinyl wrap ($100-$200 DIY) for a clean appearance.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Dashboard surface sticky and tacky to touch',
      'Shiny or glossy dashboard that was originally matte',
      'Dashboard cracking and peeling',
      'Dust adhering permanently to dashboard surface',
      'Dashboard bubbling or blistering',
      'Reflective glare from deteriorated dashboard'
    ],
    affectedSystems: ['Interior'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check if your VIN qualifies for the Toyota class-action dashboard replacement. Even if you bought the car used, you may be eligible for a free replacement. Contact your local Toyota dealer with your VIN.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-avalon-water-pump-leak-2005',
    make: 'Toyota',
    model: 'Avalon',
    years: yearRange(2005, 2018),
    category: 'cooling',
    title: 'Water Pump Leak (2GR-FE/2GR-FKS 3.5L V6)',
    description: 'The water pump on the 2GR-FE and 2GR-FKS 3.5L V6 engines used in the Avalon develops leaks from the pump seal (weep hole) or gasket. The leak starts as a small seep visible as a trail of dried coolant below the water pump and progressively worsens. If ignored, the pump bearing can also fail, causing a squealing noise and potentially the impeller to separate from the shaft, resulting in complete loss of coolant circulation and engine overheating. The water pump is located on the front of the engine and driven by the serpentine belt.',
    solution: 'Replace the water pump and gasket ($100-$200 for parts). Labor is 2-3 hours ($200-$400) as the serpentine belt, tensioner, and some accessories need to be removed for access. Total cost: $300-$700 at an independent shop, $500-$1,000 at the dealer. Replace the thermostat ($20-$40) at the same time since it is accessible during the repair. Flush and refill the cooling system with Toyota Super Long Life Coolant. Use OEM Toyota or Aisin water pumps — aftermarket pumps from unknown brands have high failure rates on these engines.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Coolant dripping from front of engine',
      'Dried coolant residue trail below water pump',
      'Squealing noise from water pump area',
      'Coolant level dropping slowly',
      'Sweet coolant smell from engine bay',
      'Engine temperature gauge reading higher than normal'
    ],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: ['P0117', 'P0118'],
    estimatedCostLow: 300,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Use only OEM Toyota or Aisin water pumps. The 2GR-FE water pump sees a lot of thermal stress and cheap aftermarket pumps frequently fail within a year. The OEM pump lasts 100,000+ miles.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-avalon-strut-mount-bearing-noise-2005',
    make: 'Toyota',
    model: 'Avalon',
    years: yearRange(2005, 2022),
    category: 'suspension',
    title: 'Front Strut Mount Bearing Noise and Clunking',
    description: 'The front strut mount bearings on the Avalon wear out and develop a popping, creaking, or clunking noise when turning the steering wheel, particularly at low speeds and when turning while stationary (like parking maneuvers). The bearing allows the strut to rotate as the wheels turn — when it wears, metal-on-metal contact creates the noise. The noise is most noticeable in cold weather and first thing in the morning. The issue affects all generations of the Avalon but is most common after 60,000-80,000 miles.',
    solution: 'Replace the front strut mounts and bearings ($80-$150 per side for parts). The strut must be removed and disassembled using a spring compressor to access the mount bearing — this is a job for a shop unless you have spring compressor experience ($300-$500 labor for both sides). Most shops recommend replacing the struts at the same time if they have over 80,000 miles, since the labor overlaps. A complete strut assembly with pre-assembled mount and spring ($200-$350 per side) eliminates the need for a spring compressor and simplifies the repair. A wheel alignment ($100-$150) is required after strut work.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Popping or clunking noise when turning steering wheel',
      'Creaking sound during slow-speed turns',
      'Noise from front of vehicle when parking',
      'Steering feels rough or catches during turns',
      'Noise worse in cold weather or first drive of the day'
    ],
    affectedSystems: ['Suspension', 'Steering'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Buy complete strut assemblies (Monroe Quick-Strut or KYB Strut-Plus) with the mount, bearing, and spring pre-assembled. They bolt right in without a spring compressor and cost only slightly more than mount-only replacement. Much safer for DIY.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'toyota-avalon-power-steering-rack-leak-2005',
    make: 'Toyota',
    model: 'Avalon',
    years: yearRange(2005, 2018),
    category: 'steering',
    title: 'Power Steering Rack Seal Leak',
    description: 'The hydraulic power steering rack on 2005-2018 Avalon models (pre-2019, which switched to electric power steering) develops internal seal leaks. Fluid weeps from the input shaft seal or the rack boots, causing a gradual loss of power steering fluid. As the fluid drops, the power steering pump whines and groans, and steering effort increases. In severe cases, the rack leaks enough fluid to drip on the garage floor and the steering can become dangerously heavy at low speeds. The issue typically develops after 80,000-120,000 miles.',
    solution: 'Replace the power steering rack with a remanufactured unit ($250-$500 for parts). Labor is 3-5 hours ($400-$800) including a required four-wheel alignment after installation. A new OEM rack costs $600-$1,200. As a temporary measure, power steering stop-leak additive (Lucas Stop Leak, $10-$15) can slow a minor leak. Top off the reservoir with Toyota-specified ATF/power steering fluid and monitor the level weekly. The 2019+ Avalon uses electric power steering and is not affected by this issue.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Power steering fluid on garage floor',
      'Whining or groaning noise when turning',
      'Steering effort increases, especially at low speed',
      'Power steering fluid level dropping',
      'Wet or oily steering rack boots',
      'Fluid spray on undercarriage near steering rack'
    ],
    affectedSystems: ['Steering'],
    dtcCodes: [],
    estimatedCostLow: 250,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Never let the power steering fluid run dry. A pump running without fluid will destroy itself within minutes, turning a $500 rack repair into a $1,500 rack and pump repair. Check the fluid monthly.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  }
];

async function main() {
  console.log(`Inserting ${issues.length} new Toyota known issues...`);
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
      console.log(`  CREATED: ${issue.id}`);
      created++;
    } catch (err) {
      console.error(`  ERROR on ${issue.id}:`, err.message);
    }
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total attempted: ${issues.length}`);

  // Print summary per vehicle
  const vehicles = [
    { make: 'Toyota', model: 'Corolla Cross' },
    { make: 'Toyota', model: 'Sequoia' },
    { make: 'Toyota', model: 'Sienna' },
    { make: 'Toyota', model: 'Prius' },
    { make: 'Toyota', model: 'Land Cruiser' },
    { make: 'Toyota', model: 'Avalon' }
  ];

  console.log('\nIssue counts per vehicle:');
  for (const v of vehicles) {
    const count = await prisma.knownIssue.count({
      where: { make: v.make, model: v.model, status: 'published' }
    });
    console.log(`  ${v.make} ${v.model}: ${count} issues`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
