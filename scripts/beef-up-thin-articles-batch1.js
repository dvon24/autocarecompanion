/**
 * Beef up thin vehicle articles (3 issues each) to 7-8 issues each.
 * Batch 1: Subaru WRX STI, GMC Sierra 3500HD, Kia K5, MINI GP
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
  // SUBARU WRX STI (2004-2021, EJ257)
  // ============================================
  {
    id: 'subaru-wrx-sti-oil-starvation-2004',
    make: 'Subaru',
    model: 'WRX STI',
    years: yearRange(2004, 2021),
    category: 'Engine',
    title: 'Oil Starvation During Hard Cornering (EJ257 Boxer Engine)',
    description: 'The EJ257 boxer engine uses a shallow oil pan design that is prone to oil starvation during sustained high-G cornering, particularly on track days or aggressive canyon driving. The flat-four layout means oil sloshes away from the pickup tube during lateral loading, starving rod and main bearings of lubrication. This is a leading cause of spun rod bearings and catastrophic engine failure on STIs used for motorsport or spirited driving.',
    solution: 'Install an aftermarket baffled oil pan or oil pan baffle kit ($200-$400) from vendors like Killer B Motorsport or Crawford Performance. An air-oil separator (AOS) also helps by returning oil vapor to the sump. For dedicated track cars, a dry sump conversion ($2,000-$3,500) eliminates the issue entirely. Always run a quality 5W-30 or 5W-40 oil and check level before every track session.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Low oil pressure warning light during hard cornering',
      'Rod knock or bearing noise after track sessions',
      'Metal flakes in oil filter at oil change',
      'Sudden loss of oil pressure under lateral G-forces',
      'Engine failure after sustained aggressive driving'
    ],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0520', 'P0521', 'P0524'],
    estimatedCostLow: 200,
    estimatedCostHigh: 3500,
    citations: [],
    communityRecommendations: [
      { type: 'part', content: 'Killer B Motorsport baffled oil pan is the gold standard fix. Bolt-on replacement that keeps oil around the pickup during cornering.', partBrand: 'Killer B Motorsport', partName: 'Baffled Oil Pan', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'If you track your STI on the stock oil pan, you WILL eventually spin a bearing. This is not an if, it is a when. Budget for the baffle before your first track day.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'subaru-wrx-sti-avcs-solenoid-2004',
    make: 'Subaru',
    model: 'WRX STI',
    years: yearRange(2004, 2021),
    category: 'Engine',
    title: 'AVCS Solenoid Failure (Variable Valve Timing)',
    description: 'The Active Valve Control System (AVCS) solenoids on the EJ257 engine are prone to failure from oil contamination and carbon buildup. When they stick or fail, the ECU cannot properly adjust camshaft timing, causing rough idle, hesitation, and reduced power. The solenoids are oil-controlled and degrade faster with extended oil change intervals or contaminated oil.',
    solution: 'Replace the failed AVCS solenoid(s) — there are two on the EJ257, one per bank ($80-$150 each for parts). Clean the oil passages feeding the solenoids during replacement. Use OEM Subaru solenoids for reliability. Prevent future failures by using quality synthetic oil and changing every 3,000-4,000 miles under hard driving conditions. Some owners clean solenoids with brake cleaner as a temporary fix.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Check engine light with AVCS-related codes',
      'Rough or hunting idle',
      'Hesitation on acceleration',
      'Reduced power in mid-range RPMs',
      'Occasional stalling at idle'
    ],
    affectedSystems: ['Engine', 'Variable Valve Timing'],
    dtcCodes: ['P0011', 'P0021', 'P0010', 'P0020'],
    estimatedCostLow: 150,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Clean your AVCS solenoids every 30,000 miles as preventive maintenance. Remove them, spray with brake cleaner, and reinstall. Takes 20 minutes per side.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Short oil change intervals (3,000-4,000 miles) with quality synthetic oil are the best prevention. The EJ257 is hard on oil and dirty oil kills AVCS solenoids.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'subaru-wrx-sti-boost-leak-wastegate-2004',
    make: 'Subaru',
    model: 'WRX STI',
    years: yearRange(2004, 2021),
    category: 'Turbo/Supercharger',
    title: 'Turbo Boost Leak and Wastegate Rattle',
    description: 'The VF-series turbochargers on the STI develop boost leaks at intercooler couplers and charge pipe connections, causing inconsistent boost and reduced power. The internal wastegate actuator also develops a characteristic rattle at idle due to worn pivot pins and flapper valve play. While the rattle is mostly cosmetic, boost leaks cause significant power loss and can trigger overboost or underboost codes.',
    solution: 'For boost leaks: inspect all intercooler couplers, charge pipes, and clamps. Replace cracked silicone couplers ($50-$150 for a set) and upgrade to T-bolt clamps. Perform a boost leak test with a pressure tester ($30-$50 DIY tool). For wastegate rattle: replace the wastegate actuator ($200-$400) or upgrade to an aftermarket external wastegate setup ($400-$800). Some owners simply live with the rattle if boost holds steady.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Inconsistent or low boost pressure',
      'Hissing sound under boost from engine bay',
      'Metallic rattle at idle from turbo area',
      'Loss of power under full throttle',
      'Check engine light for boost-related codes',
      'Turbo spooling but not making full boost'
    ],
    affectedSystems: ['Turbo/Supercharger', 'Intake'],
    dtcCodes: ['P0234', 'P0299', 'P0244'],
    estimatedCostLow: 50,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Build a DIY boost leak tester from PVC fittings and a tire valve stem for $30. Test at 20 PSI — you will hear every leak. Most STIs have at least one.', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Upgrade all intercooler couplers to silicone with T-bolt clamps. GrimmSpeed and Perrin make quality kits that eliminate the weak factory spring clamps.', partBrand: 'GrimmSpeed', partName: 'Intercooler Coupler Kit', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'subaru-wrx-sti-rear-diff-whine-2004',
    make: 'Subaru',
    model: 'WRX STI',
    years: yearRange(2004, 2021),
    category: 'Drivetrain',
    title: 'Rear Differential Whine and Wear',
    description: 'The STI rear differential (R180 in earlier models, R190 in later) develops a whining noise under load, particularly during deceleration and at highway speeds. Hard launches, aggressive driving, and track use accelerate ring and pinion gear wear. The limited-slip differential clutch packs also wear out, reducing rear-end grip and causing the diff to chatter in tight turns.',
    solution: 'Change rear differential fluid every 15,000-20,000 miles with 75W-90 GL-5 gear oil (Motul Gear 300 is a popular choice). For worn LSD clutch packs, a rebuild kit runs $300-$500 plus labor. If the ring and pinion are worn, a complete differential rebuild costs $1,200-$2,500. Upgraded aftermarket differentials from Cusco or Kaaz ($1,500-$3,000) are popular for track-focused STIs.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Whining or humming noise from rear at highway speeds',
      'Noise that changes pitch with speed',
      'Chattering or clunking in tight low-speed turns',
      'Reduced rear traction during spirited driving',
      'Metallic particles in differential fluid'
    ],
    affectedSystems: ['Drivetrain', 'Differential'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 3000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Frequent diff fluid changes are cheap insurance. Every 15,000 miles for street, every 5 track days for track use. Use Motul Gear 300 75W-90 — the STI community swears by it.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Do NOT ignore rear diff whine. Continued driving on worn gears leads to sudden failure, which can lock the rear wheels at speed. Extremely dangerous.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'subaru-wrx-sti-brake-fade-2004',
    make: 'Subaru',
    model: 'WRX STI',
    years: yearRange(2004, 2021),
    category: 'Brakes',
    title: 'Brake Fade with Repeated Hard Stops (Brembo Calipers)',
    description: 'Despite the STI coming equipped with Brembo 4-piston front calipers, the factory brake pads and rotors fade significantly during track use or repeated hard stops from highway speeds. The OEM pads are street-compound and overheat quickly, causing a spongy pedal, longer stopping distances, and glazed rotors. Brake fluid also boils from heat soak, compounding the fade issue.',
    solution: 'Upgrade to track-capable brake pads such as Hawk DTC-60 (track) or DTC-30 (street/track) for $150-$250. Flush brake fluid with DOT 4 racing fluid (Motul RBF 600 or ATE Typ 200) every 12 months or before track events ($50-$80). Install stainless steel brake lines ($100-$150) for a firmer pedal. For heavy track use, upgrade rotors to DBA or StopTech two-piece units ($400-$800 per axle).',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Spongy or soft brake pedal after repeated hard stops',
      'Significantly longer stopping distances when brakes are hot',
      'Burning smell from brakes after spirited driving',
      'Brake pedal going to the floor when hot',
      'Glazed or blue-tinted brake rotors',
      'Vibration or judder when braking from high speed'
    ],
    affectedSystems: ['Brakes'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { type: 'part', content: 'Motul RBF 600 brake fluid is mandatory for any track STI. Boiling point of 594F vs 446F for stock DOT 3. Flush before every track weekend.', partBrand: 'Motul', partName: 'RBF 600 Racing Brake Fluid', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Cool-down laps are critical. Never park immediately after hard braking — drive gently for 2-3 laps to prevent rotor warping and fluid boil. Also never use the parking brake while rotors are hot.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // GMC SIERRA 3500HD (2015-2024, Duramax)
  // ============================================
  {
    id: 'gmc-sierra-3500hd-exhaust-manifold-crack-2015',
    make: 'GMC',
    model: 'Sierra 3500HD',
    years: yearRange(2015, 2024),
    category: 'Exhaust',
    title: 'Exhaust Manifold Cracking and Warping (Duramax L5P/LML)',
    description: 'The cast iron exhaust manifolds on the Duramax diesel engine are prone to cracking and warping due to extreme exhaust gas temperatures and thermal cycling. Cracks typically develop at the manifold-to-head mounting points, causing exhaust leaks that produce a ticking noise on cold starts. The up-pipe connections also warp, allowing soot to blow onto engine components. This issue affects both the LML (2015-2016) and L5P (2017-2024) engines.',
    solution: 'Replace the cracked exhaust manifold with OEM or upgraded aftermarket units ($400-$800 per side for parts). PPE and Pacific Performance Engineering make reinforced stainless steel manifolds ($600-$1,200) that resist cracking. New exhaust manifold bolts and gaskets are essential during replacement — always use OEM bolts as they are designed for the thermal expansion. Labor runs 4-8 hours ($600-$1,200) depending on which side. Inspect up-pipes for warping at the same time.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Ticking or tapping noise on cold start that fades as engine warms',
      'Exhaust smell in cab especially at idle',
      'Soot buildup on engine components near manifold',
      'Visible cracks in exhaust manifold on inspection',
      'Slightly reduced fuel efficiency',
      'Exhaust leak sound under load'
    ],
    affectedSystems: ['Exhaust', 'Engine'],
    dtcCodes: ['P0546', 'P2463'],
    estimatedCostLow: 800,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Let the truck idle for 30-60 seconds before driving in cold weather. Rapid thermal shock from cold-starting and immediately driving under load accelerates manifold cracking.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Do not ignore exhaust manifold leaks — they can damage the turbo housing and warp the cylinder head over time. Fix it before it becomes a $5,000+ problem.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'gmc-sierra-3500hd-steering-box-leak-2015',
    make: 'GMC',
    model: 'Sierra 3500HD',
    years: yearRange(2015, 2024),
    category: 'Steering',
    title: 'Steering Gear Box Leak and Excessive Play',
    description: 'The recirculating ball steering gear box on the Sierra 3500HD develops fluid leaks at the input shaft seal and sector shaft seal, leading to power steering fluid loss and increased steering play. The heavy-duty application and large tires accelerate wear on the steering box internals. Owners report the steering develops excessive play (1-2 inches at the wheel) and a wandering feeling on the highway, especially when towing.',
    solution: 'For minor leaks, replace the seals ($50-$100 parts, $300-$500 labor) as a temporary fix. For excessive play, the steering gear box needs replacement with a remanufactured or new unit ($400-$900 for the box). A Borgeson steering box upgrade ($500-$700) is a popular heavy-duty replacement that provides tighter steering and better durability. Always replace the Pitman arm and check tie rod ends during the job. A full front-end alignment is required afterward.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Power steering fluid leaking from steering gear box area',
      'Excessive steering wheel play (more than 1 inch)',
      'Wandering on highway requiring constant correction',
      'Groaning or whining from steering when turning',
      'Low power steering fluid warnings',
      'Loose or vague steering feel especially when towing'
    ],
    affectedSystems: ['Steering', 'Suspension'],
    dtcCodes: ['C0545'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'part', content: 'The Borgeson heavy-duty steering box is the go-to upgrade for 3500HD owners. It is a direct bolt-in replacement with tighter tolerances and better seals than the factory unit.', partBrand: 'Borgeson', partName: 'Heavy Duty Steering Box', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Check power steering fluid monthly. Catching a leak early prevents air from entering the system, which causes pump damage and much more expensive repairs.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'gmc-sierra-3500hd-leaf-spring-breakage-2015',
    make: 'GMC',
    model: 'Sierra 3500HD',
    years: yearRange(2015, 2024),
    category: 'Suspension',
    title: 'Rear Leaf Spring Breakage Under Heavy Loads',
    description: 'The rear leaf spring packs on the Sierra 3500HD are prone to breaking or cracking under sustained heavy loads, particularly when used for frequent towing, hauling, or with fifth-wheel hitches. The main leaf or secondary leaves fracture at the spring eye or center bolt area. Broken springs cause the truck to sag on one side, produce clunking noises over bumps, and can damage brake lines or fuel lines if a broken leaf shifts.',
    solution: 'Replace the broken leaf spring pack — OEM replacement packs run $300-$600 per side plus 2-4 hours labor. For trucks that regularly tow or haul near capacity, upgrade to heavy-duty aftermarket leaf springs from Deaver or National Spring ($500-$900 per side) or add supplemental air bags ($200-$500) to reduce spring stress. Torque the U-bolts to spec and inspect spring bushings during replacement. Consider adding a helper spring or overload spring for frequent heavy towing.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Truck sagging on one side when loaded',
      'Clunking or banging noise from rear over bumps',
      'Visible crack or break in leaf spring',
      'Rear axle shifted to one side',
      'Uneven tire wear on rear axle',
      'Poor ride quality and excessive bouncing when empty'
    ],
    affectedSystems: ['Suspension', 'Frame'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'A broken leaf spring can shift and sever brake lines or puncture fuel lines. If you hear a loud clunk from the rear and the truck sags, stop and inspect immediately.', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Firestone Ride-Rite air bags are an affordable helper that takes stress off the leaf springs when loaded. They install inside the existing coils and adjust with a simple air valve.', partBrand: 'Firestone', partName: 'Ride-Rite Air Spring Kit', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'gmc-sierra-3500hd-injector-failure-2015',
    make: 'GMC',
    model: 'Sierra 3500HD',
    years: yearRange(2015, 2024),
    category: 'Fuel System',
    title: 'Diesel Injector Failure Causing White Smoke and Rough Running',
    description: 'The Bosch piezoelectric fuel injectors on the Duramax L5P and LML engines can fail due to contaminated fuel, high-mileage wear, or internal electrical faults. A failed injector causes white smoke on startup, rough idle, misfires on the affected cylinder, and fuel dilution of the engine oil. The high fuel rail pressures (up to 36,000 PSI on the L5P) stress the injectors over time. Contaminated fuel from bulk diesel stations accelerates injector wear.',
    solution: 'Diagnose the failed injector with a relative compression test and injector balance rate scan using a Tech 2 or equivalent scan tool. Replace the failed injector(s) — OEM Bosch injectors are $300-$500 each, and labor is 2-4 hours per injector ($300-$600). Always replace the injector hold-down clamp and fuel return line seals. If one injector fails at high mileage, consider replacing all 8 as the others are likely near end of life. Use a quality fuel additive like Stanadyne or Hot Shot Secret to protect remaining injectors.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'White or gray smoke on cold start',
      'Rough idle or misfire on one or more cylinders',
      'Fuel smell in engine oil (fuel dilution)',
      'Check engine light with injector circuit codes',
      'Reduced power and poor fuel economy',
      'Hard starting in cold weather'
    ],
    affectedSystems: ['Fuel System', 'Engine'],
    dtcCodes: ['P0201', 'P0202', 'P0203', 'P0204', 'P0205', 'P0206', 'P0207', 'P0208', 'P0263', 'P0266'],
    estimatedCostLow: 600,
    estimatedCostHigh: 5000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Always run a fuel additive in every tank of diesel. Stanadyne Performance Formula or Hot Shot Secret Diesel Extreme protect injectors from contaminated fuel and add lubricity.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'If your oil level is rising and smells like diesel, you have a leaking injector dumping fuel into the crankcase. Do not drive — fuel-diluted oil provides almost no lubrication and will destroy bearings.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'gmc-sierra-3500hd-cluster-display-failure-2015',
    make: 'GMC',
    model: 'Sierra 3500HD',
    years: yearRange(2015, 2020),
    category: 'Electrical',
    title: 'Dashboard Instrument Cluster Pixel and Display Failure',
    description: 'The instrument cluster in 2015-2020 Sierra 3500HD trucks suffers from LCD pixel failure, causing portions of the Driver Information Center (DIC) display to become unreadable. Individual pixels or entire segments go blank, making it impossible to read trip computer data, gear indicator, or warning messages. The issue is caused by solder joint failure on the cluster circuit board from thermal cycling and vibration. The speedometer and tachometer gauges may also develop stepper motor failures, causing inaccurate or stuck readings.',
    solution: 'The cluster can be sent to a repair service specializing in GM instrument clusters ($150-$300) for re-soldering and stepper motor replacement — this fixes 90% of cases. A new OEM cluster from the dealer costs $500-$1,000 and requires VIN programming. Aftermarket rebuilt clusters are available for $200-$400. Some owners have successfully repaired the solder joints themselves with a soldering iron, but this requires electronics experience. The cluster must be programmed to the truck VIN after replacement.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Missing pixels or blank segments on dashboard display',
      'DIC screen partially or fully blank',
      'Gear indicator not showing current gear',
      'Speedometer or tachometer reading incorrectly',
      'Gauges sticking or not returning to zero when off',
      'Intermittent display flickering'
    ],
    affectedSystems: ['Electrical', 'Instrument Cluster'],
    dtcCodes: ['U0155', 'U0164'],
    estimatedCostLow: 150,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Before buying a new cluster, try a cluster repair service. Companies like Dr. Speedometer and Tanin Auto Electronix repair these for $150-$250 with a lifetime warranty. Much cheaper than dealer replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // KIA K5 (2021-2025)
  // ============================================
  {
    id: 'kia-k5-theta-ii-knock-sensor-2021',
    make: 'Kia',
    model: 'K5',
    years: yearRange(2021, 2025),
    category: 'Engine',
    title: 'Theta II Engine Knock Sensor Issues and Knock-Related Concerns',
    description: 'The 2.5L Theta II engine in certain K5 models has experienced knock sensor faults and engine knock concerns. The knock sensor may trigger false positives or fail to detect actual detonation, causing the ECU to either retard timing unnecessarily (reducing power) or fail to protect against harmful knock. Kia issued a software update to improve knock detection logic, but some owners report persistent issues after the update.',
    solution: 'Visit a Kia dealer for the latest ECU software update (TSB SA508) that improves knock detection calibration — this is typically performed at no cost. If the knock sensor itself has failed, replacement costs $200-$400 including labor. Use only 87+ octane fuel as specified. If actual engine knock is present (metallic pinging under load), have the engine inspected immediately as the Theta II engine family has a known history of connecting rod bearing issues in earlier applications. Kia has extended warranty coverage on some Theta II engines.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Check engine light with knock sensor codes',
      'Reduced engine power or sluggish acceleration',
      'Audible pinging or knocking under load',
      'Poor fuel economy from excessive timing retard',
      'Engine hesitation during acceleration'
    ],
    affectedSystems: ['Engine', 'Engine Management'],
    dtcCodes: ['P0325', 'P0326', 'P0327', 'P0328'],
    estimatedCostLow: 0,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check if your VIN is covered under the Kia engine warranty extension. Many Theta II engines have extended coverage to 150,000 miles for knock-related failures.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Request the latest ECU calibration update at every service visit. Kia has released multiple updates to improve knock detection and engine protection logic.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'kia-k5-panoramic-sunroof-rattle-2021',
    make: 'Kia',
    model: 'K5',
    years: yearRange(2021, 2025),
    category: 'Body/Interior',
    title: 'Panoramic Sunroof Rattle and Water Leak',
    description: 'K5 models equipped with the panoramic sunroof experience rattling noises from the sunroof area at highway speeds and over rough roads. The sunroof glass and frame develop play over time, creating an annoying rattling or buzzing sound. Some owners also report water leaks at the front corners of the sunroof, with water dripping onto the headliner or A-pillar trim. Clogged sunroof drain tubes exacerbate the leak issue.',
    solution: 'For rattling: the dealer can apply felt tape or foam padding to the sunroof frame contact points under warranty (TSB available). Adjusting the sunroof glass alignment can also eliminate rattles. For water leaks: clean the sunroof drain tubes by carefully feeding a flexible wire or compressed air through each corner drain. The tubes run down the A-pillars and C-pillars to exit near the wheel wells. If the headliner is water-stained, it may need replacement ($500-$1,000). Apply sunroof sealant to the front weatherstrip if dealer adjustment does not stop the leak.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Rattling or buzzing noise from roof area at speed',
      'Water dripping from headliner near sunroof edges',
      'Water stains on A-pillar or headliner fabric',
      'Wind noise increase over time',
      'Musty smell from wet headliner'
    ],
    affectedSystems: ['Body', 'Interior'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Clean sunroof drains every spring. Pour a small amount of water around the sunroof seal and watch for it to exit under the car near the front and rear wheel wells. If it does not drain, the tubes are clogged.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'kia-k5-adas-calibration-fault-2021',
    make: 'Kia',
    model: 'K5',
    years: yearRange(2021, 2025),
    category: 'Electrical',
    title: 'ADAS Sensor Calibration Faults (Lane Keep, Forward Collision)',
    description: 'The Advanced Driver Assistance Systems on the K5 — including Lane Keep Assist, Forward Collision Avoidance, and Blind Spot Monitoring — intermittently throw calibration faults and disable themselves. The forward-facing camera behind the windshield and radar sensor in the front bumper are sensitive to windshield contamination, extreme temperatures, and minor front-end impacts. After a windshield replacement, the ADAS sensors require recalibration that many glass shops skip or perform incorrectly.',
    solution: 'For intermittent faults in normal conditions: clean the windshield interior and exterior thoroughly around the camera area. Ensure the camera lens cover behind the rearview mirror is clean and unobstructed. A dealer scan and ADAS recalibration costs $200-$500. After windshield replacement, ALWAYS have the ADAS camera recalibrated at a Kia dealer — this requires specialized targets and equipment. If faults persist, the camera module or radar sensor may need replacement ($500-$1,500).',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Lane Keep Assist warning light and system disabled',
      'Forward Collision warning malfunction message',
      'Blind Spot Monitor not functioning',
      'Multiple ADAS warning lights on dashboard',
      'Systems disabling in rain, fog, or extreme cold',
      'Phantom braking from Forward Collision system'
    ],
    affectedSystems: ['ADAS', 'Electrical', 'Safety Systems'],
    dtcCodes: ['C1611', 'C1559', 'C1564', 'U3000'],
    estimatedCostLow: 0,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'If you get your windshield replaced, INSIST on ADAS recalibration. The camera must be recalibrated to the new windshield or your safety systems will not function correctly. Budget $300-$500 for this.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'kia-k5-trunk-latch-sticking-2021',
    make: 'Kia',
    model: 'K5',
    years: yearRange(2021, 2025),
    category: 'Body/Interior',
    title: 'Rear Trunk Latch Sticking and Failure to Open',
    description: 'The electric trunk latch mechanism on the K5 is prone to sticking or failing to release, leaving the trunk locked. The issue is more common in cold weather when moisture gets into the latch mechanism and freezes. The trunk release button on the key fob, interior button, and exterior trunk handle may all fail to open the trunk when the latch is stuck. Some owners report the latch actuator motor failing entirely, requiring manual release from inside the trunk via the emergency release handle.',
    solution: 'Lubricate the trunk latch mechanism with white lithium grease or silicone spray every 6 months to prevent sticking ($5-$10). If the latch actuator motor has failed, replace the entire trunk latch assembly ($100-$200 for parts, $100-$200 labor). In an emergency, access the trunk from the rear seat pass-through or use the emergency release handle inside the trunk. The dealer can reprogram the trunk open/close module if the issue is software-related. Apply dielectric grease to the latch electrical connector to prevent corrosion.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Trunk will not open from key fob button',
      'Interior trunk release button unresponsive',
      'Trunk latch clicks but does not release',
      'Trunk opens intermittently or requires multiple presses',
      'Trunk stuck closed in cold weather'
    ],
    affectedSystems: ['Body', 'Electrical'],
    dtcCodes: ['B1352'],
    estimatedCostLow: 10,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Spray the trunk latch with silicone lubricant before winter. This prevents moisture from freezing the mechanism shut in cold weather. Takes 30 seconds and saves a lot of frustration.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'kia-k5-infotainment-blackout-2021',
    make: 'Kia',
    model: 'K5',
    years: yearRange(2021, 2025),
    category: 'Electrical',
    title: 'Infotainment Screen Blackout and Random Reboots',
    description: 'The K5 infotainment system — both the 8-inch and 10.25-inch displays — experiences random screen blackouts, freezes, and spontaneous reboots. The screen may go completely black while driving, losing access to navigation, backup camera, and climate controls. Some owners report the system rebooting in a loop. The issue is typically software-related but can also be caused by a failing display head unit. Android Auto and Apple CarPlay connections can trigger or worsen the problem.',
    solution: 'First try a system reset by holding the power/volume knob for 10+ seconds. Visit a Kia dealer for the latest infotainment software update — Kia has released multiple updates addressing stability issues (check for updates via the Kia Connect app or USB update). If the software update does not resolve the issue, the head unit may need replacement under warranty ($800-$2,000 if out of warranty). Disconnect the phone and disable wireless CarPlay/Android Auto to test if the issue is phone-related. A factory reset of the infotainment (Settings > General > Reset) can also help.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Infotainment screen goes completely black while driving',
      'System freezes and becomes unresponsive to touch',
      'Screen reboots with Kia logo repeatedly',
      'Backup camera unavailable when in reverse',
      'Bluetooth audio cutting out',
      'Climate controls unresponsive on touchscreen-only models'
    ],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: ['U1110', 'B1609'],
    estimatedCostLow: 0,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Before going to the dealer, try a USB software update. Download the latest navigation/infotainment update from the Kia owners portal, put it on a USB drive, and install it. Many blackout issues are fixed by the latest software.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If the screen goes black, hold the power knob for 10 seconds to force a reboot. This is faster than disconnecting the battery and usually restores the system immediately.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // MINI GP (2013-2023, GP2/GP3 editions)
  // ============================================
  {
    id: 'mini-gp-clutch-master-cylinder-2013',
    make: 'MINI',
    model: 'GP',
    years: yearRange(2013, 2015),
    category: 'Drivetrain',
    title: 'Clutch Master Cylinder Failure (GP2 Manual Transmission)',
    description: 'The GP2 (2013-2015) uses a manual transmission with a hydraulic clutch system that suffers from premature clutch master cylinder failure. The master cylinder internal seals degrade, causing the clutch pedal to slowly sink to the floor or feel spongy. In some cases, the clutch will not fully disengage, making shifting difficult or impossible. The aggressive driving typical of GP owners accelerates wear on the clutch hydraulic system.',
    solution: 'Replace the clutch master cylinder ($150-$300 for parts) and bleed the clutch hydraulic system with fresh DOT 4 brake fluid. The slave cylinder should be inspected and replaced at the same time if leaking ($200-$400). Total repair with both cylinders and labor runs $500-$1,000. Use OEM or FTE brand replacement parts — cheap aftermarket cylinders fail quickly. Flush the clutch fluid every 2 years as moisture contamination accelerates seal degradation.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Clutch pedal slowly sinks to the floor',
      'Spongy or soft clutch pedal feel',
      'Difficulty shifting gears especially into first or reverse',
      'Clutch does not fully disengage when pedal is pressed',
      'Grinding noise when shifting',
      'Clutch fluid level dropping in reservoir'
    ],
    affectedSystems: ['Drivetrain', 'Clutch'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Flush clutch fluid every 2 years with fresh DOT 4. The GP2 clutch hydraulics share fluid with the brake system — old moisture-laden fluid destroys the seals from the inside.', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Use FTE or OEM clutch master cylinder. FTE is the original equipment manufacturer for MINI clutch hydraulics. Avoid cheap eBay replacements that fail within a year.', partBrand: 'FTE', partName: 'Clutch Master Cylinder', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'mini-gp-vanos-solenoid-2013',
    make: 'MINI',
    model: 'GP',
    years: yearRange(2013, 2023),
    category: 'Engine',
    title: 'VANOS Solenoid Issues (N18/B48 Engines)',
    description: 'The VANOS (variable valve timing) solenoids on both the N18 engine (GP2, 2013-2015) and B48 engine (GP3, 2020-2023) are susceptible to failure from oil contamination and varnish buildup. When the solenoids stick or fail, the ECU cannot properly control cam timing, resulting in rough idle, poor throttle response, and reduced performance. The high-output tuning of the GP engines makes them less tolerant of degraded VANOS performance compared to standard MINI models.',
    solution: 'Replace the VANOS solenoid(s) — typically two on these engines ($80-$150 each). Clean the VANOS oil filter screens during replacement. Use OEM or quality aftermarket solenoids (Pierburg is the OEM supplier). Prevent issues with frequent oil changes every 5,000 miles using BMW LL-01 approved 5W-30 synthetic oil. Some owners clean solenoids ultrasonically as a temporary measure, but replacement is the reliable fix.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Check engine light with VANOS codes',
      'Rough or unstable idle',
      'Loss of low-end torque',
      'Hesitation on throttle tip-in',
      'Rattling noise from engine on cold start',
      'Reduced fuel economy'
    ],
    affectedSystems: ['Engine', 'Variable Valve Timing'],
    dtcCodes: ['P0010', 'P0011', 'P0012', 'P0014', 'P0015'],
    estimatedCostLow: 200,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Change oil every 5,000 miles, NOT the BMW-recommended 15,000. The GP engines run hot and hard — extended oil change intervals are the number one cause of VANOS solenoid failure.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'mini-gp-timing-chain-stretch-2013',
    make: 'MINI',
    model: 'GP',
    years: yearRange(2013, 2023),
    category: 'Engine',
    title: 'Timing Chain Stretch and Rattle (N18/B48 Engines)',
    description: 'The timing chain on the N18 (GP2) and B48 (GP3) engines stretches over time, causing a characteristic rattle on cold start and eventually triggering timing-related fault codes. The N18 engine is more prone to this issue than the B48. The chain tensioner cannot compensate for excessive chain stretch, leading to retarded cam timing, rough running, and in severe cases, the chain can jump teeth causing valve-to-piston contact. The high-RPM nature of GP driving accelerates chain wear.',
    solution: 'Replace the timing chain, tensioner, and guides as a preventive measure at 60,000-80,000 miles on the N18, or when rattling first appears. The B48 is more durable but should still be inspected at 80,000+ miles. Parts cost $300-$600 for a complete kit; labor is 6-10 hours ($900-$1,500) as the job requires removing the front of the engine. Use OEM timing components only — aftermarket chains stretch faster. Always replace the chain guide rails and tensioner at the same time.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Rattling or clattering noise from engine on cold start',
      'Rattle that disappears after engine warms up',
      'Check engine light with cam timing codes',
      'Rough idle',
      'Reduced engine power',
      'Engine will not start (if chain has jumped)'
    ],
    affectedSystems: ['Engine', 'Timing'],
    dtcCodes: ['P0016', 'P0017', 'P0011', 'P0014'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 3000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Cold start rattle is the canary in the coal mine. Once you hear it, you have a limited window to replace the chain before it jumps and bends valves. Do not delay this repair.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If buying a used GP2 with the N18 engine, ask for timing chain replacement records. If no documentation exists, budget $2,000 for preventive replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'mini-gp-cracked-exhaust-manifold-2013',
    make: 'MINI',
    model: 'GP',
    years: yearRange(2013, 2023),
    category: 'Exhaust',
    title: 'Cracked Exhaust Manifold (Turbo Models)',
    description: 'The cast iron exhaust manifold (integrated with the turbo housing on the N18/B48) is prone to cracking from thermal stress. The GP engines produce higher exhaust gas temperatures than standard MINI models due to their aggressive tuning. Cracks develop at the cylinder-to-manifold flanges, causing exhaust leaks, a ticking noise, and potential turbo bearing damage from escaping exhaust gases. Track use and hard driving significantly accelerate cracking.',
    solution: 'Replace the cracked exhaust manifold. On the N18 (GP2), the manifold is integrated with the turbo housing, making replacement expensive ($800-$1,500 for parts plus 4-6 hours labor). The B48 (GP3) has a separate manifold ($500-$900 plus labor). Aftermarket stainless steel manifolds from brands like Supersprint ($1,000-$2,000) resist cracking better than factory cast iron. Always replace the manifold gaskets and exhaust studs during the repair. Inspect the turbo oil feed and return lines while the manifold is off.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Ticking or tapping noise from engine bay on cold start',
      'Exhaust smell in cabin',
      'Reduced turbo boost or spool',
      'Check engine light with exhaust or catalyst codes',
      'Visible soot around exhaust manifold flanges',
      'Higher than normal exhaust gas temperatures'
    ],
    affectedSystems: ['Exhaust', 'Turbo/Supercharger'],
    dtcCodes: ['P0420', 'P0430', 'P2096'],
    estimatedCostLow: 800,
    estimatedCostHigh: 3000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Let the engine idle for 30-60 seconds after hard driving before shutting off. This allows the turbo and manifold to cool gradually, reducing thermal shock cracking.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'mini-gp-water-pump-failure-2013',
    make: 'MINI',
    model: 'GP',
    years: yearRange(2013, 2023),
    category: 'Cooling',
    title: 'Electric Water Pump Failure',
    description: 'The electric water pump on the N18 and B48 engines is a known failure point across the BMW/MINI platform. The pump motor or impeller fails, causing loss of coolant circulation and rapid overheating. Unlike mechanical water pumps that give gradual warning signs, the electric pump can fail suddenly with no prior symptoms. The GP engines run hotter than standard MINI models, putting additional stress on the pump. Failure typically occurs between 50,000-100,000 miles.',
    solution: 'Replace the electric water pump and thermostat together ($300-$600 for parts, $200-$400 labor). The thermostat is also electronically controlled and commonly fails alongside the pump. Use OEM or Pierburg (OEM supplier) replacement parts. Flush the cooling system with fresh BMW coolant during the repair. As preventive maintenance, replace the water pump at 80,000 miles even if it is still working — the cost of a planned replacement is far less than an engine overheated by a failed pump. Always carry coolant and monitor the temperature gauge closely on older GP models.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Engine temperature rising rapidly to red zone',
      'Coolant temperature warning on dashboard',
      'No heat from heater (coolant not circulating)',
      'Coolant boiling over',
      'Electric pump not audible when ignition is on (normally faint hum)',
      'Steam from engine bay'
    ],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: ['P2181', 'P0599', 'P26B4'],
    estimatedCostLow: 500,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'If the temperature gauge climbs past the middle mark, STOP DRIVING IMMEDIATELY. The electric water pump gives zero warning before complete failure. Overheating for even 2 minutes can warp the cylinder head.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Replace the water pump and thermostat together at 80,000 miles as preventive maintenance. The parts are $400-$500 and the labor overlaps. Cheap insurance against a catastrophic overheat.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  }
];

async function main() {
  console.log(`Inserting ${issues.length} new known issues...`);
  let created = 0;
  let skipped = 0;

  for (const issue of issues) {
    try {
      // Check if issue already exists
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
    { make: 'Subaru', model: 'WRX STI' },
    { make: 'GMC', model: 'Sierra 3500HD' },
    { make: 'Kia', model: 'K5' },
    { make: 'MINI', model: 'GP' }
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
