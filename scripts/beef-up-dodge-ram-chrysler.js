/**
 * Beef up thin Dodge, RAM, and Chrysler vehicle articles.
 * Models: Dodge Dart, Dakota, Grand Caravan, RAM 2500, RAM 3500,
 *         Chrysler Pacifica, 200, PT Cruiser
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
  // DODGE DART (2013-2016) — currently 4 issues
  // ============================================
  {
    id: 'dodge-dart-tcm-failure-2013',
    make: 'Dodge',
    model: 'Dart',
    years: yearRange(2013, 2016),
    category: 'transmission',
    title: 'Transmission Control Module (TCM) Failure on 2.4L Automatic',
    description: 'The 2.4L Dart paired with the Aisin 6-speed automatic experiences TCM failures that cause erratic shifting, failure to shift, and limp mode. The TCM mounted on the transmission is exposed to heat and vibration, leading to internal circuit board failures. Unlike the DDCT issues on 1.4T models, this affects the conventional automatic transmission.',
    solution: 'Replace the TCM (Mopar 68164473AH or equivalent). The replacement TCM must be programmed with the VIN and transmission adaptation data at the dealer using wiTECH. Aftermarket remanufactured TCMs are available but must still be dealer-programmed. Cost is $600-$1,200 installed.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Transmission stuck in limp mode (2nd gear only)',
      'Erratic or harsh shifting',
      'Check engine light with transmission codes',
      'Transmission fails to shift into higher gears',
      'Delayed engagement when shifting from Park'
    ],
    affectedSystems: ['Transmission', 'Electrical'],
    dtcCodes: ['P0700', 'P0868', 'P0871', 'U0101'],
    estimatedCostLow: 600,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'If buying a remanufactured TCM online, confirm it includes the correct software version for your model year. The dealer must still program it with wiTECH regardless.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Do not ignore early symptoms like occasional harsh shifts — TCM failure progresses and can leave you stranded in limp mode.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-dart-idle-stall-2013',
    make: 'Dodge',
    model: 'Dart',
    years: yearRange(2013, 2016),
    category: 'engine',
    title: 'Engine Stalling at Idle (Software and Throttle Body Related)',
    description: 'Darts across all engine options experience random stalling at idle, particularly when coming to a stop or sitting at traffic lights. The issue stems from a combination of electronic throttle body carbon buildup and PCM software calibration problems. The 2.0L and 2.4L engines are most commonly affected. Several TSBs have been issued addressing idle quality.',
    solution: 'Start with a throttle body cleaning using CRC throttle body cleaner — remove the intake hose and clean the butterfly valve and bore. Then visit a dealer for the latest PCM flash update (TSB 18-034-14 REV.B or newer). If stalling persists after both steps, replace the electronic throttle body assembly (Mopar 04891585AC for 2.4L). Perform idle relearn after any throttle body service.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Engine stalls when coming to a stop',
      'Rough or fluctuating idle RPM',
      'Engine dies at traffic lights or in drive-through',
      'Momentary loss of power steering when engine stalls',
      'Check engine light may or may not illuminate'
    ],
    affectedSystems: ['Engine', 'Fuel System'],
    dtcCodes: ['P0507', 'P2110', 'P2112'],
    estimatedCostLow: 50,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Clean the throttle body every 30,000 miles as preventive maintenance. Carbon buildup is the primary cause and cleaning is a 15-minute job with basic tools.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'After cleaning or replacing the throttle body: turn key to ON (do not start) for 30 seconds, then start and let idle undisturbed for 5 minutes to complete idle relearn.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-dart-rear-suspension-clunk-2013',
    make: 'Dodge',
    model: 'Dart',
    years: yearRange(2013, 2016),
    category: 'suspension',
    title: 'Rear Suspension Clunking Over Bumps',
    description: 'A persistent clunking or knocking noise from the rear suspension over bumps, speed bumps, and rough roads. The primary cause is worn rear stabilizer bar end links and bushings, though rear shock absorber mounts can also contribute. The noise is most noticeable at low speeds over uneven surfaces and can be misdiagnosed as a strut or spring issue.',
    solution: 'Replace the rear stabilizer bar end links (Mopar 68247497AA, sold in pairs). Inspect and replace worn rear sway bar bushings if cracked or deteriorated. If clunking persists, replace rear shock absorbers and upper shock mounts. Total repair typically runs $200-$500 for end links and bushings, $400-$800 if shocks are also needed.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Clunking or knocking noise from rear over bumps',
      'Rattling sound over speed bumps at low speed',
      'Noise worsens over time',
      'Rear end feels loose or wallowy over rough roads',
      'Noise most noticeable with passengers in rear seat'
    ],
    affectedSystems: ['Suspension'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Grab the rear sway bar end links by hand and try to move them — any play or clicking means they need replacement. This is a quick visual/tactile check you can do yourself.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Moog K750617 aftermarket end links are a popular upgrade over OEM — slightly more durable and half the price of Mopar parts.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-dart-ac-compressor-2013',
    make: 'Dodge',
    model: 'Dart',
    years: yearRange(2013, 2016),
    category: 'cooling',
    title: 'A/C Compressor Premature Failure',
    description: 'The A/C compressor in the Dart fails prematurely, often between 60,000-90,000 miles. Symptoms start with intermittent cooling that progressively worsens until the A/C blows warm air entirely. The compressor clutch may make a grinding or squealing noise before complete failure. Internal compressor debris can contaminate the entire A/C system, requiring additional component replacement.',
    solution: 'Replace the A/C compressor assembly (Denso or equivalent). When replacing, also flush the condenser and evaporator lines to remove metal debris from the failed compressor. Replace the receiver/drier and expansion valve as standard practice. Evacuate and recharge with the correct amount of R-134a refrigerant. A complete A/C system repair runs $800-$1,500.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows warm air intermittently then permanently',
      'Grinding or squealing noise from compressor area',
      'A/C clutch not engaging',
      'Refrigerant leak at compressor seal',
      'Burning smell from engine bay when compressor seizes'
    ],
    affectedSystems: ['HVAC', 'A/C System'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'If the compressor has seized or made grinding noises, you MUST flush the entire system and replace the drier — metal debris will destroy a new compressor within weeks if not removed.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'UAC CO 29136C is a well-reviewed aftermarket compressor for the Dart. Always replace the compressor with a new unit, not remanufactured, for A/C reliability.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // DODGE DAKOTA (1997-2011) — currently 4 issues
  // ============================================
  {
    id: 'dodge-dakota-overdrive-solenoid-1997',
    make: 'Dodge',
    model: 'Dakota',
    years: yearRange(1997, 2011),
    category: 'transmission',
    title: 'Transmission Overdrive Solenoid Failure (42RE/45RFE)',
    description: 'The 42RE (4-speed) and 45RFE/545RFE (5-speed) automatic transmissions in the Dakota suffer from overdrive solenoid failures. The overdrive solenoid sticks or fails electrically, preventing the transmission from engaging overdrive or causing it to drop out of overdrive unexpectedly. This increases highway fuel consumption and engine RPM. The issue is exacerbated by old, contaminated transmission fluid.',
    solution: 'Replace the overdrive solenoid and governor pressure solenoid as a pair — they are accessed by dropping the transmission pan and valve body. Use Mopar ATF+4 (68218058AC) exclusively. For the 42RE, the solenoid pack is inexpensive ($40-$80) but labor is 2-3 hours. For the 45RFE/545RFE, replace the entire solenoid block assembly. Regular fluid changes every 30,000 miles help prevent recurrence.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Transmission will not shift into overdrive',
      'Overdrive drops out at highway speeds',
      'Higher than normal RPM at highway cruising speed',
      'Check engine light with overdrive codes',
      'Increased fuel consumption on highway'
    ],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0700', 'P0888', 'P1765', 'P0750'],
    estimatedCostLow: 200,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Always replace the governor pressure solenoid and sensor at the same time as the overdrive solenoid — they fail around the same mileage and the pan is already off.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Use ONLY Mopar ATF+4 in these transmissions. Generic Dex/Merc fluid causes shift quality issues and accelerates solenoid wear.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-dakota-rear-window-defroster-2000',
    make: 'Dodge',
    model: 'Dakota',
    years: yearRange(2000, 2011),
    category: 'electrical',
    title: 'Rear Window Defroster Element Grid Cracking and Failure',
    description: 'The rear window defroster grid lines crack and break, leaving sections of the window uncleared. The adhesive-bonded heating elements separate from the glass due to thermal cycling and UV degradation. On crew cab models, the flex in the rear window area accelerates the grid line failures. Some owners report the defroster working on only half the window or in random stripes.',
    solution: 'For minor grid line breaks, use a rear defroster repair kit (Permatex 09117 or Loctite 21351) to bridge small gaps in the conductive grid. Clean the area with alcohol, apply the conductive paint following the grid line, and allow 24 hours to cure. For extensive damage across multiple grid lines, the rear window must be replaced ($300-$600 for the glass plus $150-$250 labor). Aftermarket glass is available at lower cost than OEM.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Rear defroster clears only portions of the window',
      'Visible breaks in the defroster grid lines',
      'Defroster light comes on but window does not clear',
      'Foggy or icy stripes across rear window in winter',
      'Defroster stops working entirely'
    ],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 15,
    estimatedCostHigh: 850,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Permatex 09117 rear defroster repair kit works well for 1-3 broken grid lines. Use a magnifying glass to find the exact break point and test with a voltmeter to confirm the repair.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Never scrape ice off the inside of the rear window or use a razor blade near the grid lines — this is the most common cause of grid line damage.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-dakota-intake-gasket-1997',
    make: 'Dodge',
    model: 'Dakota',
    years: yearRange(1997, 2004),
    category: 'engine',
    title: 'Intake Manifold Gasket Leak (3.9L V6 and 4.7L V8)',
    description: 'The intake manifold gaskets on the 3.9L Magnum V6 and 4.7L PowerTech V8 engines deteriorate and leak coolant and/or allow vacuum leaks. On the 3.9L, the plenum gasket (upper intake) is notorious for leaking coolant into the engine oil, causing milky oil and potential engine damage. The 4.7L suffers from lower intake gasket failures that cause rough idle and lean codes. Both issues worsen with age and heat cycling.',
    solution: 'For the 3.9L, replace the plenum gasket with an updated design gasket (Hughes Engines offers an improved version). The repair requires removing the upper intake manifold, cleaning both surfaces thoroughly, and using the correct torque sequence. For the 4.7L, replace the lower intake manifold gaskets — this is a more involved job requiring removal of the fuel rail and injectors. Budget $300-$800 for parts and labor.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Milky or chocolate-colored oil on dipstick (3.9L)',
      'Coolant loss with no visible external leak',
      'Rough idle and lean condition codes (4.7L)',
      'Engine overheating from coolant loss',
      'Sweet smell of coolant from engine bay'
    ],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 300,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'If you find milky oil on the 3.9L, stop driving immediately — coolant in the oil will destroy rod and main bearings quickly. Change the oil immediately after the gasket repair and again at 500 miles.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Hughes Engines makes an improved 3.9L plenum gasket that addresses the OEM design flaw. Use it instead of the stock replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-dakota-transfer-case-leak-2000',
    make: 'Dodge',
    model: 'Dakota',
    years: yearRange(2000, 2011),
    category: 'drivetrain',
    title: 'Transfer Case Output Seal Leak (NP231/NP242)',
    description: 'The NP231 and NP242 transfer cases in 4WD Dakotas develop leaks at the rear output shaft seal and front output shaft seal. The seals dry out and crack from heat exposure and age, allowing ATF to leak onto the exhaust crossover pipe, creating a burning fluid smell. Low fluid levels from undetected leaks can cause transfer case chain wear and eventual failure.',
    solution: 'Replace the leaking output shaft seal(s). The rear output seal can often be done in-vehicle by removing the rear driveshaft and prying out the old seal. The front output seal requires more disassembly. Use genuine Mopar seals or National Oil Seals equivalents. Refill the transfer case with Mopar ATF+4. Check fluid level every oil change to catch leaks early. Seal replacement runs $150-$400.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Fluid dripping from center of vehicle under transfer case',
      'Burning fluid smell from under the vehicle',
      'Low transfer case fluid level',
      'Grinding noise when engaging 4WD',
      'Transfer case whine or rumble at highway speeds'
    ],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check your transfer case fluid level at every oil change. These seals often weep slowly for months before becoming a noticeable leak, and low fluid kills the chain and sprockets.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'When replacing the rear output seal, inspect the output shaft surface for grooves. If grooved, install a Speedi-Sleeve repair sleeve before the new seal to prevent immediate re-leaking.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // DODGE GRAND CARAVAN (2001-2020) — currently 5 issues
  // ============================================
  {
    id: 'dodge-grand-caravan-trans-cooler-leak-2008',
    make: 'Dodge',
    model: 'Grand Caravan',
    years: yearRange(2008, 2020),
    category: 'transmission',
    title: 'Transmission Cooler Line Leak at Radiator Connection',
    description: 'The transmission cooler lines that connect to the integral transmission cooler in the radiator develop leaks at the quick-connect fittings and at the rubber-to-metal transition points. The factory quick-connect fittings become brittle and crack, and the rubber hose sections deteriorate from heat exposure. Slow ATF loss goes unnoticed until the transmission begins slipping or overheating. This is a leading cause of 62TE transmission failures in the Grand Caravan.',
    solution: 'Replace the transmission cooler lines with updated Mopar lines or aftermarket direct-fit replacements. Dorman 624-408 and 624-409 are popular aftermarket options. Some owners upgrade to braided stainless steel lines for durability. After replacing the lines, flush and refill the transmission with Mopar ATF+4 and check for proper flow through the cooler. Budget $150-$400 for parts and labor.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Red/brown fluid puddle under the front of the vehicle',
      'Transmission slipping due to low fluid',
      'Burning smell from transmission overheating',
      'Visible fluid weeping at cooler line connections',
      'Transmission temperature warning on dash'
    ],
    affectedSystems: ['Transmission', 'Cooling'],
    dtcCodes: ['P0700', 'P0218'],
    estimatedCostLow: 150,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Check your trans cooler lines at every oil change — a slow leak that goes unnoticed is the #1 preventable cause of 62TE transmission failure on these vans.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Dorman 624-408 (upper) and 624-409 (lower) are direct-fit replacements. Some owners upgrade to braided stainless lines from mishimoto.com for long-term durability.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-grand-caravan-oil-sludge-2011',
    make: 'Dodge',
    model: 'Grand Caravan',
    years: yearRange(2011, 2020),
    category: 'engine',
    title: 'Engine Oil Sludge Buildup (3.6L Pentastar V6)',
    description: 'The 3.6L Pentastar V6 in later Grand Caravans develops oil sludge and varnish buildup, particularly when oil changes are not performed at 5,000-mile intervals or when conventional oil is used. Sludge clogs the oil passages feeding the variable valve timing (VVT) system, causing camshaft actuator codes and rough running. The Pentastar is sensitive to oil quality and change intervals due to its VVT system and tight oil passages.',
    solution: 'Switch to full synthetic 5W-20 oil (Pennzoil Platinum or Mobil 1 recommended) and change every 5,000 miles. For existing sludge, perform two consecutive oil changes at 1,000-mile intervals using a quality synthetic to flush deposits. In severe cases, an engine flush product like Liqui Moly Pro-Line Engine Flush can help, but use with caution on high-mileage engines. Replace VVT solenoids if cam actuator codes persist after oil change.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Check engine light with VVT solenoid or cam actuator codes',
      'Engine ticking or tapping noise on cold start',
      'Rough idle that smooths out once warmed up',
      'Reduced fuel economy',
      'Dark sludgy deposits visible on oil cap or dipstick'
    ],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0014', 'P0024', 'P0016', 'P0300'],
    estimatedCostLow: 50,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'The 3.6L Pentastar requires full synthetic oil and strict 5,000-mile change intervals. Conventional oil and extended intervals are the primary cause of sludge in these engines.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'If buying a used Grand Caravan with a 3.6L, pull the oil filler cap and look inside with a flashlight. Thick brown or black varnish on the valve cover interior indicates poor maintenance and likely sludge throughout the engine.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-grand-caravan-ps-pump-2008',
    make: 'Dodge',
    model: 'Grand Caravan',
    years: yearRange(2008, 2020),
    category: 'steering',
    title: 'Power Steering Pump Whine and Failure',
    description: 'The power steering pump develops a whining or groaning noise that worsens when turning the steering wheel, particularly at low speeds and when the fluid is cold. The pump internals wear, causing cavitation and fluid aeration. In advanced stages, the pump leaks fluid from the shaft seal and eventually fails completely, resulting in very heavy steering. The power steering reservoir cap can also fail to vent properly, contributing to pump stress.',
    solution: 'Flush the power steering system and refill with Mopar power steering fluid (MS-5931 spec). If the pump is whining, it is already worn internally and should be replaced (Mopar 68059524AD or equivalent remanufactured unit). Replace the reservoir cap as a standard practice during any PS service. A power steering pump replacement runs $250-$500 installed.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Whining noise when turning the steering wheel',
      'Groaning at full lock turns (parking lot maneuvers)',
      'Power steering fluid leak at pump shaft',
      'Steering becomes heavy or unassisted',
      'Fluid foamy or aerated when checking reservoir'
    ],
    affectedSystems: ['Steering', 'Power Steering'],
    dtcCodes: [],
    estimatedCostLow: 250,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Replace the reservoir cap any time you service the power steering system. A bad cap causes the fluid to aerate, which destroys the pump. Mopar 68059524AD cap is cheap insurance.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Never hold the steering wheel at full lock for more than a few seconds — the relief valve stress accelerates pump wear significantly on these vans.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'dodge-grand-caravan-engine-mount-2008',
    make: 'Dodge',
    model: 'Grand Caravan',
    years: yearRange(2008, 2020),
    category: 'engine',
    title: 'Engine and Transmission Mount Deterioration',
    description: 'The hydraulic-filled engine and transmission mounts deteriorate and collapse, causing excessive vibration felt throughout the vehicle, clunking when shifting from Park to Drive or Reverse, and a noticeable engine rocking sensation during acceleration and deceleration. The front (passenger side) engine mount fails most frequently, followed by the transmission mount. Failed mounts allow excessive engine movement that can damage CV axles and exhaust components.',
    solution: 'Replace all worn engine and transmission mounts as a set for best results. The front engine mount (Mopar 68252522AA) is the most critical. Inspect the mounts by having someone shift from Drive to Reverse while you watch the engine — movement greater than 1 inch indicates a failed mount. OEM mounts last longer than most aftermarket options. Budget $400-$900 for a complete mount set replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Excessive vibration at idle felt in steering wheel and seats',
      'Thunk or clunk when shifting from Park to Drive or Reverse',
      'Engine visibly rocks during acceleration/deceleration',
      'Vibration that worsens with A/C compressor engaged',
      'Exhaust rattle from changed engine position'
    ],
    affectedSystems: ['Engine', 'Drivetrain'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 900,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'When replacing mounts, do all of them at once. A new mount next to a collapsed mount takes all the stress and fails prematurely. OEM Mopar mounts outlast most aftermarket options.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'You can check mounts yourself: open the hood, have someone apply the brake and shift from D to R repeatedly while you watch the engine. More than 1 inch of movement means the mount is shot.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // RAM 2500 (2010-2025) — currently 4 issues
  // ============================================
  {
    id: 'ram-2500-exhaust-manifold-crack-2010',
    make: 'RAM',
    model: '2500',
    years: yearRange(2010, 2025),
    category: 'exhaust',
    title: 'Exhaust Manifold Cracking (6.7L Cummins)',
    description: 'The cast iron exhaust manifold on the 6.7L Cummins turbo diesel cracks due to thermal cycling stress, particularly near the center cylinders (#3 and #4). Cracks allow exhaust gases to escape, creating a ticking noise on cold start that diminishes as the manifold expands when warm. Exhaust leaks can also send soot into the engine bay and affect turbocharger performance by reducing exhaust backpressure to the turbine.',
    solution: 'Replace the cracked exhaust manifold. OEM replacement (Mopar 68408593AA) or aftermarket upgraded manifolds from BD Diesel or Industrial Injection are available. Aftermarket options are typically thicker castings less prone to re-cracking. Always replace the exhaust manifold gaskets and inspect/replace any stretched or corroded manifold studs. Budget $600-$1,500 for parts and labor.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Ticking or tapping noise on cold start that fades when warm',
      'Exhaust soot or staining on engine bay components',
      'Slight exhaust smell in engine compartment',
      'Reduced turbo boost in severe cases',
      'Visible crack on manifold surface upon inspection'
    ],
    affectedSystems: ['Exhaust', 'Engine'],
    dtcCodes: [],
    estimatedCostLow: 600,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'BD Diesel and Industrial Injection make thicker aftermarket manifolds that resist cracking better than OEM. Worth the upgrade if the factory manifold has already cracked once.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Always inspect manifold studs during replacement — corroded or stretched studs will snap during removal. Have an extractor set and replacement studs on hand before starting the job.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'ram-2500-dash-screen-delamination-2019',
    make: 'RAM',
    model: '2500',
    years: yearRange(2019, 2025),
    category: 'interior',
    title: 'Uconnect Dashboard Touchscreen Delamination',
    description: 'The 8.4-inch and 12-inch Uconnect touchscreens in 4th and 5th gen RAM 2500s develop delamination between the LCD panel and the outer touch-sensitive glass layer. This creates bubble-like distortions, rainbow discoloration, and reduced touch responsiveness. The delamination is caused by heat exposure and UV radiation through the windshield, and is accelerated in hot climates. The issue affects both the standard 8.4-inch and the larger 12-inch screens.',
    solution: 'The only permanent fix is replacing the Uconnect head unit screen assembly. Dealer replacement is $800-$2,000 depending on screen size. Aftermarket replacement screens are available for less ($400-$800). Some owners have successfully used windshield-mounted sun shades and UV-reflective screen protectors to slow delamination on new screens. FCA issued TSB 08-120-19 addressing this issue.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Bubble or blister appearance on the touchscreen surface',
      'Rainbow discoloration on screen edges or corners',
      'Touch inputs not registering in delaminated areas',
      'Screen appears cloudy or hazy in direct sunlight',
      'Distorted display visible from certain angles'
    ],
    affectedSystems: ['Interior', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Install a matte anti-glare screen protector from day one — it reduces UV exposure and heat absorption that causes delamination. SPIGEN and ArmorSuit make Uconnect-specific protectors.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'A windshield sunshade when parked goes a long way to preventing delamination. The screen sits in direct sun through the windshield and the heat is cumulative over time.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'ram-2500-rear-axle-ujoint-2010',
    make: 'RAM',
    model: '2500',
    years: yearRange(2010, 2025),
    category: 'drivetrain',
    title: 'Rear Axle U-Joint Premature Failure',
    description: 'The rear driveshaft U-joints in the RAM 2500 fail prematurely, particularly on trucks used for towing. The factory U-joints are undersized for sustained heavy load use, and the grease fittings (where present) are often overlooked during maintenance. Symptoms start with a clicking or clunking sound during acceleration and deceleration, progressing to vibration at highway speed. Complete U-joint failure can cause the driveshaft to drop, which is a serious safety hazard.',
    solution: 'Replace the U-joints with heavy-duty aftermarket units rated for towing. Spicer Life Series 5-1350X or 5-760X are popular upgrades. Replace both driveshaft U-joints at the same time. Grease the new U-joints immediately after installation and at every oil change interval thereafter. If the driveshaft yoke ears are worn, the driveshaft must be replaced. Budget $200-$600 for parts and labor.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Clunking noise during acceleration and deceleration',
      'Vibration at highway speeds (55-70 mph)',
      'Clicking sound when shifting from Drive to Reverse',
      'Visible rust or play in U-joint when inspected',
      'Driveshaft vibration felt through floor of truck'
    ],
    affectedSystems: ['Drivetrain', 'Driveshaft'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Spicer Life Series U-joints (5-1350X or 5-760X) are the go-to upgrade for towing. They are stronger than OEM and have greaseable fittings. Grease at every oil change.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Do not ignore U-joint clunking — a failed U-joint can cause the driveshaft to drop at highway speed, which can vault the truck or damage the road. This is a safety-critical repair.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'ram-2500-transfer-case-leak-2010',
    make: 'RAM',
    model: '2500',
    years: yearRange(2010, 2025),
    category: 'drivetrain',
    title: 'Transfer Case Fluid Leak (BW4470/BW4494)',
    description: 'The BorgWarner BW4470 (part-time 4WD) and BW4494 (full-time 4WD) transfer cases develop fluid leaks at the front and rear output shaft seals and at the case halves. The leaks are often slow and go unnoticed until the fluid level drops enough to cause whine, grinding, or failure to engage 4WD. Trucks used for towing are more susceptible due to higher operating temperatures.',
    solution: 'Replace the leaking output shaft seal(s). If the leak is at the case half, reseal with Mopar RTV sealant during reassembly. Refill with the correct fluid: Mopar 05166184AA (BW4470) or equivalent ATF+4 (BW4494). Check fluid level at every oil change, especially on trucks used for towing. Seal replacement runs $200-$500 depending on which seal.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Fluid dripping from the center of the truck',
      'Whining or grinding noise when 4WD is engaged',
      'Difficulty engaging or disengaging 4WD',
      'Burning fluid smell from underneath the truck',
      'Low fluid level on transfer case dipstick or fill plug'
    ],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Add a magnetic drain plug when servicing the transfer case — it catches metal shavings before they circulate and cause wear. Check fluid level at every oil change.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If your truck tows regularly, change the transfer case fluid every 30,000 miles instead of the factory 60,000-mile interval. Heat from towing breaks down the fluid much faster.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // RAM 3500 (2010-2025) — currently 4 issues
  // ============================================
  {
    id: 'ram-3500-exhaust-manifold-stud-2010',
    make: 'RAM',
    model: '3500',
    years: yearRange(2010, 2025),
    category: 'exhaust',
    title: 'Exhaust Manifold Stud Failure (6.7L Cummins)',
    description: 'The exhaust manifold mounting studs on the 6.7L Cummins break due to repeated thermal expansion and contraction cycles. Broken studs allow the manifold to separate from the cylinder head, creating exhaust leaks that produce a ticking noise and reduce turbo efficiency. The center studs (#3 and #4 cylinders) fail most frequently. Attempting to remove broken studs often requires extracting them from the cylinder head, adding complexity to the repair.',
    solution: 'Remove broken studs using a left-hand drill bit and easy-out extractor set. If the stud breaks flush or below the head surface, a professional machine shop extraction may be needed. Replace all studs with upgraded ARP 247-4206 stud kit, which is stronger than OEM. Always replace the exhaust manifold gaskets during this repair. Budget $400-$1,200 depending on how many studs are broken and whether machine shop extraction is needed.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Ticking or hissing noise from the exhaust manifold area',
      'Exhaust leak noise that changes with engine RPM',
      'Soot or carbon deposits around manifold-to-head joint',
      'Noise louder on cold start and fades slightly when warm',
      'Slight power loss from exhaust leak affecting turbo'
    ],
    affectedSystems: ['Exhaust', 'Engine'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'ARP 247-4206 exhaust manifold stud kit is the definitive upgrade. Stronger than OEM and far less likely to break again. Worth the investment on any Cummins.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Soak broken studs with PB Blaster for 24+ hours before attempting extraction. Rushing the extraction is how studs break off flush with the head, turning a $400 job into a $1,200 machine shop visit.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'ram-3500-grid-heater-relay-2010',
    make: 'RAM',
    model: '3500',
    years: yearRange(2010, 2025),
    category: 'electrical',
    title: 'Grid Heater Relay Failure (6.7L Cummins)',
    description: 'The intake grid heater relay fails, preventing the grid heater from warming intake air during cold starts. The grid heater draws significant current (up to 200 amps), and the relay contacts eventually burn and weld or fail open. Without the grid heater, cold-start performance degrades significantly in temperatures below 40°F — longer cranking, white smoke, rough idle, and potential no-start conditions in extreme cold.',
    solution: 'Replace the grid heater relay (Mopar 56055666AB or equivalent). The relay is located on the intake manifold or firewall area and is a straightforward replacement. Some owners upgrade to a heavy-duty aftermarket relay rated for higher amperage to extend lifespan. Also inspect the grid heater element itself for damage or corrosion while the relay is being replaced. Budget $80-$250 for parts and labor.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Hard starting or extended cranking in cold weather',
      'White smoke on cold start',
      'Grid heater warning light not illuminating',
      'Rough idle for several minutes after cold start',
      'Check engine light with grid heater circuit codes'
    ],
    affectedSystems: ['Electrical', 'Engine'],
    dtcCodes: ['P0540', 'P0542', 'P0543'],
    estimatedCostLow: 80,
    estimatedCostHigh: 250,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'The grid heater relay is cheap and easy to replace yourself. Keep a spare in the glovebox if you live in a cold climate — a $30 relay can save you from a no-start situation in winter.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'When replacing the relay, inspect the connector terminals for heat damage or corrosion. Burned terminals will kill a new relay quickly — replace the pigtail connector if damaged.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'ram-3500-front-hub-bearing-2010',
    make: 'RAM',
    model: '3500',
    years: yearRange(2010, 2025),
    category: 'suspension',
    title: 'Front Hub Bearing Failure Under Heavy Load',
    description: 'The front hub bearings (wheel bearing assemblies) in the RAM 3500 fail prematurely, particularly on trucks that carry heavy loads in the bed or tow heavy trailers. The factory hub bearings are adequate for unloaded driving but wear rapidly under sustained heavy GVWR/GCWR conditions. 4x4 models are more affected due to the additional stress of the front axle components. Bearing failure typically occurs between 60,000-100,000 miles on heavy-use trucks.',
    solution: 'Replace the front hub bearing assembly (Timken HA590576 or Moog 515162 are highly rated). The hub bearing is a bolt-on unit on these trucks — 4 bolts from the back of the steering knuckle. Replace both sides if one has failed, as the other is likely not far behind. Use ABS-compatible hub assemblies. Budget $300-$700 per side for parts and labor.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Humming or droning noise that changes with vehicle speed',
      'Noise increases when turning in one direction',
      'ABS or traction control warning light',
      'Play or looseness felt in the front wheel',
      'Vibration in steering wheel at highway speeds'
    ],
    affectedSystems: ['Suspension', 'Brakes'],
    dtcCodes: ['C0050', 'C0051'],
    estimatedCostLow: 300,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Timken HA590576 and Moog 515162 are the top choices for replacement. Avoid cheap imported hub bearings — they often fail within 20,000 miles on a 3500 that tows.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'When one front hub bearing goes, replace both sides. If one failed at 80,000 miles, the other is likely at 85% wear and will fail within 10,000-15,000 miles.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'ram-3500-fifth-wheel-wiring-2013',
    make: 'RAM',
    model: '3500',
    years: yearRange(2013, 2025),
    category: 'electrical',
    title: '5th Wheel / Gooseneck Prep Wiring Corrosion',
    description: 'The factory 5th wheel and gooseneck towing prep wiring harness corrodes at the in-bed connector junction, particularly where it connects to the 7-pin and 4-pin trailer connectors under the bed. Water intrusion from rain, truck washes, and bed spray deteriorates the connector terminals and causes intermittent trailer light failures, brake controller communication issues, and auxiliary camera dropouts. The issue is worse on trucks used in snow belt regions due to road salt exposure.',
    solution: 'Inspect the under-bed wiring junction and connector terminals. Clean corroded terminals with electrical contact cleaner and a wire brush. Apply dielectric grease (Permatex 22058) to all connector terminals to prevent future corrosion. For severely corroded connections, splice in new Weatherpack or Deutsch sealed connectors. Seal the connector junction box with RTV silicone to prevent water intrusion. Budget $50-$300 depending on severity.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Intermittent trailer running lights',
      'Trailer brake controller shows no connection',
      'Backup camera for trailer intermittently drops out',
      'Trailer turn signals work only sometimes',
      'Corrosion visible on in-bed towing connector'
    ],
    affectedSystems: ['Electrical', 'Towing'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 300,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Apply dielectric grease to all trailer connector terminals during your annual towing prep. Two minutes of prevention saves hours of roadside troubleshooting with a loaded trailer.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Seal the in-bed connector junction box with Permatex Ultra Grey RTV. The factory seal degrades and lets water pool around the connections, especially after truck bed washes.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHRYSLER PACIFICA (2017-2025) — currently 5 issues
  // ============================================
  {
    id: 'chrysler-pacifica-harsh-shift-2017',
    make: 'Chrysler',
    model: 'Pacifica',
    years: yearRange(2017, 2025),
    category: 'transmission',
    title: 'Transmission Harsh 3-4 Shift and Shudder (9-Speed)',
    description: 'The ZF 9HP 9-speed automatic transmission in the Pacifica exhibits harsh or jerky 3-4 shifts, shuddering during light throttle acceleration at 25-40 mph, and occasional hesitation when downshifting. The 9-speed has had multiple software calibration updates since launch, and the adaptive learning can become confused by varied driving patterns. Cold weather worsens the harsh shifting. The issue persists across multiple model years despite ongoing TSBs.',
    solution: 'Visit a dealer for the latest transmission control module (TCM) software update — Stellantis has released numerous calibration updates (most recent as of 2025 is TSB 21-013-24 or newer). After the update, the transmission needs a re-adaptation period of 500-1,000 miles of mixed driving. If harsh shifting persists, a transmission fluid drain and refill with Mopar ZF 9-speed fluid may help. In severe cases, valve body replacement resolves persistent harsh shifts ($1,000-$2,000).',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Harsh or jerky 3-4 upshift',
      'Shudder during light acceleration at 25-40 mph',
      'Hesitation or hunting between gears on hills',
      'Transmission feels rough when cold',
      'Occasional delayed downshift when passing'
    ],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0700', 'P0730', 'P0733', 'P0734'],
    estimatedCostLow: 0,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'After a TCM software update, drive normally for at least 500 miles before judging if the shift quality improved. The 9-speed needs time to re-learn your driving patterns.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Check pacificaforums.com for the latest TSB numbers before your dealer visit. Some dealers are not proactive about applying the newest calibration unless you specifically request it.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-pacifica-power-liftgate-2017',
    make: 'Chrysler',
    model: 'Pacifica',
    years: yearRange(2017, 2025),
    category: 'electrical',
    title: 'Power Liftgate Malfunction and Failure to Open/Close',
    description: 'The power liftgate struts, latch assembly, and control module fail, causing the liftgate to not open or close fully, reverse direction mid-travel, or stop responding to button presses entirely. The hydraulic struts lose pressure and cannot hold the liftgate open, letting it fall. The latch assembly sensor can also malfunction, causing the system to think the liftgate is not fully latched and triggering warning chimes. Minivan owners with frequent cargo access are most affected.',
    solution: 'Start by checking the liftgate latch striker alignment — misalignment causes latch sensor errors. Replace the power liftgate struts if the gate will not stay open or opens slowly (Mopar 68385386AA or Stabilus equivalents, $50-$100 each). If the liftgate motor or control module has failed, the entire power liftgate motor assembly needs replacement ($300-$700). Reset the liftgate control module by disconnecting the battery for 10 minutes.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Liftgate does not open or close with button press',
      'Liftgate reverses direction mid-travel',
      'Liftgate will not stay open — falls slowly or quickly',
      'Warning chime indicating liftgate not latched',
      'Liftgate opens only partway then stops'
    ],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Before replacing expensive parts, disconnect the battery for 10 minutes to reset the liftgate module. This resolves about 30% of liftgate malfunctions caused by sensor glitches.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If the liftgate just will not stay open, the gas struts are the issue. Stabilus makes OEM-quality replacements at half the Mopar price. Replace both at once.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-pacifica-ac-compressor-2017',
    make: 'Chrysler',
    model: 'Pacifica',
    years: yearRange(2017, 2025),
    category: 'cooling',
    title: 'A/C Compressor Failure and Rear A/C Performance Loss',
    description: 'The A/C compressor fails prematurely, often between 60,000-100,000 miles, leaving the entire cabin without cooling. Additionally, the rear A/C system (standard on most trims) can lose effectiveness even when the compressor is functional due to a clogged rear A/C expansion valve or low refrigerant charge. Given the Pacifica is a family minivan, A/C failure creates a significant usability issue, especially in summer with children.',
    solution: 'For compressor failure, replace the A/C compressor, receiver/drier, and expansion valve as a system. Flush the condenser to remove debris from the failed compressor. For rear A/C only issues, check the rear expansion valve (often clogged) and ensure the system is fully charged with the correct amount of R-1234yf refrigerant. A full compressor replacement runs $1,000-$1,800.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows warm air from all vents',
      'Rear A/C colder or warmer than front (inconsistent)',
      'A/C compressor clutch not engaging',
      'Grinding or rattling noise from compressor area',
      'A/C works intermittently then fails completely'
    ],
    affectedSystems: ['HVAC', 'A/C System'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 1800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'The Pacifica uses R-1234yf refrigerant, which is expensive ($50-$80/lb). DIY recharging is not recommended — take it to a shop with proper R-1234yf recovery equipment.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If only the rear A/C is underperforming, check the rear expansion valve first before condemning the compressor. It is a common and cheaper fix.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-pacifica-tpms-sensor-2017',
    make: 'Chrysler',
    model: 'Pacifica',
    years: yearRange(2017, 2025),
    category: 'electrical',
    title: 'TPMS Sensor Battery Failure and False Warnings',
    description: 'The tire pressure monitoring system (TPMS) sensors experience premature battery failure, causing persistent TPMS warning lights and inaccurate pressure readings. The factory TPMS sensors use lithium batteries with a typical lifespan of 5-7 years, but many Pacifica owners report failures as early as 3-4 years. When one sensor battery dies, the system displays a general TPMS warning, and the driver cannot determine which tire actually needs attention without a TPMS scan tool.',
    solution: 'Replace the failed TPMS sensor(s). TPMS sensors cannot be battery-replaced — the entire sensor unit must be swapped. OEM sensors (Mopar 68399563AA) cost $40-$60 each and must be programmed to the vehicle using a TPMS relearn tool or dealer scan tool. Aftermarket programmable sensors from Autel or ATEQ are available for less ($20-$35 each). Replace all four sensors simultaneously if the vehicle is 5+ years old to avoid return visits.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'TPMS warning light stays on despite correct tire pressures',
      'Dash shows dashes instead of pressure readings for one or more tires',
      'Intermittent TPMS warning that comes and goes',
      'TPMS light comes on in cold weather and stays on',
      'All tire pressures show as 0 psi on the display'
    ],
    affectedSystems: ['Electrical', 'Safety'],
    dtcCodes: [],
    estimatedCostLow: 80,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'When one TPMS sensor dies, the others are not far behind if they are original. Replace all four at once during your next tire purchase or rotation to save on labor.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Autel MX-Sensor programmable sensors work great and are much cheaper than OEM. Any tire shop with a TPMS tool can program them in minutes.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHRYSLER 200 (2011-2017) — currently 4 issues
  // ============================================
  {
    id: 'chrysler-200-oil-filter-housing-leak-2015',
    make: 'Chrysler',
    model: '200',
    years: yearRange(2015, 2017),
    category: 'engine',
    title: 'Oil Filter Housing / Cooler Leak (2.4L Tigershark)',
    description: 'The oil filter housing and integrated oil cooler on the 2.4L Tigershark engine develops leaks from the housing gasket and the oil cooler O-rings. Oil seeps from the housing located on the front of the engine block, dripping onto the exhaust and creating a burning oil smell. The leak worsens over time and can cause significant oil loss between changes. This issue is shared across many FCA vehicles using the 2.4L Tigershark engine.',
    solution: 'Replace the oil filter housing gasket and oil cooler O-rings (Mopar 68105583AF gasket kit). The repair requires removing the oil filter housing, cleaning the mating surfaces, and installing the new gaskets with proper torque. Some mechanics recommend replacing the entire housing assembly if the gasket surface is warped. Budget $250-$500 for parts and labor.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Oil dripping on exhaust causing burning smell',
      'Oil spots under the vehicle near the front of the engine',
      'Low oil level between changes',
      'Visible oil seepage around oil filter housing',
      'Smoke from engine bay at idle from oil on exhaust'
    ],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: [],
    estimatedCostLow: 250,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'This is the same 2.4L Tigershark oil filter housing leak found on Jeep Cherokee, Dodge Dart, and RAM ProMaster City. Mopar 68105583AF gasket kit is the fix for all of them.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Do not ignore a burning oil smell from this engine — oil dripping on the exhaust manifold is a fire risk. Check your oil level weekly if you notice the smell.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-200-throttle-stall-2011',
    make: 'Chrysler',
    model: '200',
    years: yearRange(2011, 2017),
    category: 'engine',
    title: 'Engine Stalling at Idle (Electronic Throttle Body)',
    description: 'The Chrysler 200 experiences intermittent engine stalling at idle, particularly when decelerating to a stop or sitting at traffic lights. The electronic throttle body accumulates carbon buildup that restricts airflow at idle, and the throttle position sensor can drift out of calibration. The 2.4L 4-cylinder is most commonly affected but the 3.6L V6 is also susceptible. The stall often occurs without a check engine light, making diagnosis frustrating.',
    solution: 'Clean the electronic throttle body with CRC throttle body cleaner — remove the air intake hose and spray the butterfly valve and bore while a helper opens the throttle plate. After cleaning, perform an idle relearn: key on (engine off) for 30 seconds, then start and let idle for 5 minutes without touching the gas pedal. If stalling persists, have the dealer reflash the PCM with the latest calibration and inspect the throttle body for TPS sensor failure. Replacement throttle body costs $200-$400.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Engine stalls when coming to a stop',
      'RPM drops very low then engine dies',
      'Rough or surging idle',
      'Stalling without a check engine light',
      'Engine restarts immediately after stalling'
    ],
    affectedSystems: ['Engine', 'Fuel System'],
    dtcCodes: ['P0507', 'P2110', 'P2112', 'P2135'],
    estimatedCostLow: 30,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Throttle body cleaning is a 15-minute job that solves 80% of idle stalling on these engines. Do it every 30,000 miles as preventive maintenance.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'The idle relearn procedure after cleaning is critical: key on (do not start) for 30 seconds, start and idle for 5 minutes, then drive normally. The computer needs to re-adapt to the cleaned throttle body.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-200-ac-evaporator-2011',
    make: 'Chrysler',
    model: '200',
    years: yearRange(2011, 2017),
    category: 'cooling',
    title: 'A/C Evaporator Core Leak',
    description: 'The A/C evaporator core develops pinhole leaks from corrosion, causing a gradual loss of refrigerant and diminished cooling performance. The evaporator is located inside the HVAC housing behind the dashboard, making it a labor-intensive repair. Moisture and debris accumulation on the evaporator surface accelerate corrosion. The refrigerant leak rate is often slow enough that the A/C loses effectiveness over weeks to months rather than failing suddenly.',
    solution: 'Replace the A/C evaporator core. This is a major repair requiring partial dashboard removal to access the HVAC housing. The evaporator, expansion valve, and receiver/drier should all be replaced together. The system must then be evacuated and recharged with R-134a refrigerant (2011-2014) or R-1234yf (2015-2017). Budget $800-$1,500 for the complete repair due to labor intensity.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C gradually loses cooling effectiveness over weeks',
      'Musty or sweet smell from dashboard vents',
      'A/C cycles on and off frequently',
      'Wet carpet on passenger side from condensate overflow',
      'Need to recharge A/C more than once per year'
    ],
    affectedSystems: ['HVAC', 'A/C System'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'If your A/C needs recharging more than once per season, the evaporator is almost certainly leaking. A UV dye test can confirm — but the evaporator is the most common A/C leak point on these cars.', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'This is an expensive repair due to labor, not parts. Get quotes from 2-3 shops — labor rates for dashboard-out evaporator replacement vary widely.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-200-ps-rack-leak-2015',
    make: 'Chrysler',
    model: '200',
    years: yearRange(2015, 2017),
    category: 'steering',
    title: 'Power Steering Rack Seal Leak (2nd Generation)',
    description: 'The power steering rack and pinion assembly on the 2nd generation Chrysler 200 (2015-2017) develops fluid leaks from the rack seals, particularly the inner tie rod seals. The leak is often hidden by the steering rack boots, so fluid loss goes unnoticed until the power steering pump begins whining from low fluid or steering effort increases. The 200 uses a hydraulic power steering system (not electric) which relies on adequate fluid levels.',
    solution: 'Inspect the steering rack boots by squeezing them — if they are full of fluid, the inner seals have failed. A steering rack seal kit is available but rack seal replacement is labor-intensive and often unsuccessful long-term. Most mechanics recommend replacing the entire steering rack assembly (remanufactured units from Cardone or Maval, $300-$500 for the rack). Budget $600-$1,200 for a complete rack replacement installed.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Power steering fluid loss with no visible external leak',
      'Power steering pump whining from low fluid',
      'Steering feels heavier than normal',
      'Fluid visible inside steering rack boots',
      'Drips from steering rack area when boots tear open'
    ],
    affectedSystems: ['Steering'],
    dtcCodes: [],
    estimatedCostLow: 600,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check the steering rack boots at every oil change by squeezing them. A fluid-filled boot means the inner seal is leaking and the rack needs attention before you lose power assist.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'A remanufactured rack from Cardone or Maval is the best value — new OEM racks are overpriced and rebuilt units come with a warranty. Avoid no-name imported racks.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHRYSLER PT CRUISER (2001-2010) — currently 4 issues
  // ============================================
  {
    id: 'chrysler-pt-cruiser-oil-sludge-2001',
    make: 'Chrysler',
    model: 'PT Cruiser',
    years: yearRange(2001, 2010),
    category: 'engine',
    title: 'Engine Oil Sludge Buildup (2.4L Non-Turbo)',
    description: 'The 2.4L DOHC non-turbo engine in the PT Cruiser is highly susceptible to oil sludge formation, particularly when oil changes are delayed beyond 3,000-5,000 miles or conventional oil is used. The engine design with its small oil passages and relatively high operating temperature creates ideal conditions for sludge. Sludge clogs oil passages, starving the valvetrain and camshaft bearings of lubrication, leading to ticking noises and eventual engine damage.',
    solution: 'Switch to full synthetic 5W-30 oil and change every 5,000 miles maximum. For engines with existing sludge, perform 3 consecutive oil changes at 1,000-mile intervals using synthetic oil to flush deposits. In severe cases where the engine is ticking, a manual cleaning may be needed — remove the valve cover and manually clean sludge from the cam journals and oil passages. If cam bearings are damaged from oil starvation, engine replacement may be needed ($2,000-$4,000).',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Engine ticking or tapping noise, especially on cold start',
      'Oil pressure warning light flickering at idle',
      'Dark, thick sludge visible on oil filler cap or dipstick',
      'Excessive oil consumption between changes',
      'Check engine light with cam timing or oil pressure codes'
    ],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0300', 'P0016', 'P0521'],
    estimatedCostLow: 50,
    estimatedCostHigh: 4000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'The PT Cruiser 2.4L REQUIRES synthetic oil and 5,000-mile or shorter change intervals. Extended oil changes with conventional oil are the #1 killer of these engines.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If buying a used PT Cruiser, pull the oil filler cap and inspect for sludge before purchasing. Black gunk on the cap or visible on the valve cover interior is a walk-away condition.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-pt-cruiser-timing-belt-tensioner-2001',
    make: 'Chrysler',
    model: 'PT Cruiser',
    years: yearRange(2001, 2010),
    category: 'engine',
    title: 'Timing Belt Tensioner and Water Pump Failure',
    description: 'The timing belt tensioner pulley bearing fails, allowing the timing belt to slip or skip teeth, which can cause valve-to-piston contact and catastrophic engine damage on this interference engine. The tensioner bearing wears and develops play, creating a chirping or squealing noise from the front of the engine. The water pump, driven by the timing belt, also commonly fails at similar mileage with coolant leaking from the weep hole.',
    solution: 'Replace the timing belt, tensioner, idler pulleys, and water pump as a complete kit at every 100,000 miles. Gates TCKWP295A or Continental TB295LK1 kits include all necessary components. This is the critical maintenance item on PT Cruiser ownership — skipping or delaying this service risks destroying the engine. Budget $400-$800 for the complete timing belt service.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Chirping or squealing noise from front of engine',
      'Coolant leak from water pump weep hole',
      'Engine misfires or runs rough (belt has skipped teeth)',
      'Overheating from water pump failure',
      'Engine will not start (timing belt broken)'
    ],
    affectedSystems: ['Engine'],
    dtcCodes: ['P0016', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
    estimatedCostLow: 400,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'This is an INTERFERENCE engine — a broken timing belt will destroy the engine. Do not delay the 100,000-mile timing belt service, and if you have no service records on a used PT Cruiser, replace it immediately.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Always replace the water pump, tensioner, and all idler pulleys with the timing belt. The labor is in accessing the belt — the parts are cheap. Gates TCKWP295A kit has everything.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-pt-cruiser-ac-condenser-2001',
    make: 'Chrysler',
    model: 'PT Cruiser',
    years: yearRange(2001, 2010),
    category: 'cooling',
    title: 'A/C Condenser Leak from Road Debris Impact',
    description: 'The A/C condenser in the PT Cruiser is positioned close to the front of the vehicle with minimal protection from the grille, making it vulnerable to road debris impact damage. Small rocks and pebbles puncture the thin aluminum condenser tubes, causing refrigerant leaks. The condenser is also prone to corrosion, particularly in areas with road salt use. The result is a gradual or sudden loss of A/C cooling.',
    solution: 'Replace the A/C condenser. The condenser is accessible from the front of the vehicle after removing the front bumper cover and grille. Replace the receiver/drier at the same time (standard practice) and install a new expansion valve if the system has been open to atmosphere for an extended period. Evacuate and recharge with the correct amount of R-134a. Budget $400-$700 for parts and labor. Consider installing a small mesh screen behind the grille to protect the new condenser.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'A/C gradually stops cooling',
      'Hissing sound from front of vehicle (active refrigerant leak)',
      'Oily residue on condenser surface near impact points',
      'Need to recharge A/C annually',
      'Visible bent or punctured fins on the condenser'
    ],
    affectedSystems: ['HVAC', 'A/C System'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Install a stainless steel mesh screen behind the grille to protect the new condenser from road debris. A $10 mesh screen saves a $500 condenser replacement.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Spectra Premium 7-3080 is a well-reviewed aftermarket condenser for the PT Cruiser. Always replace the receiver/drier with the condenser.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chrysler-pt-cruiser-egr-valve-2001',
    make: 'Chrysler',
    model: 'PT Cruiser',
    years: yearRange(2001, 2010),
    category: 'engine',
    title: 'EGR Valve Failure and Carbon Buildup',
    description: 'The EGR (Exhaust Gas Recirculation) valve on the 2.4L engine clogs with carbon deposits and sticks open or closed. When stuck open, it causes rough idle, stalling, and hesitation. When stuck closed, it increases NOx emissions and may trigger a check engine light. The EGR passages in the intake manifold also clog with carbon, reducing effectiveness even with a functioning valve. The turbo model is especially prone due to higher exhaust temperatures.',
    solution: 'Remove the EGR valve and clean it with carburetor cleaner and a wire brush. Clean the EGR passages in the intake manifold with a long bristle brush. If the valve diaphragm is torn or the pintle is worn, replace the EGR valve (Standard Motor Products EGV880 or equivalent). Also clean the EGR tube connecting the exhaust manifold to the valve. Budget $150-$400 for cleaning and/or replacement.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Rough idle or stalling at idle',
      'Check engine light with EGR flow codes',
      'Hesitation during acceleration',
      'Failed emissions test for high NOx',
      'Engine surging or hunting at idle'
    ],
    affectedSystems: ['Engine', 'Emissions'],
    dtcCodes: ['P0401', 'P0403', 'P0404', 'P0405'],
    estimatedCostLow: 150,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Cleaning the EGR valve and passages often resolves the issue without replacement. Soak the valve in carburetor cleaner overnight for best results. Clean every 50,000 miles as maintenance.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'When cleaning the EGR, also clean the EGR tube between the exhaust manifold and the valve. This tube carbon-packs and restricts flow even with a clean valve.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  }
];

async function main() {
  console.log(`Inserting ${issues.length} new Dodge/RAM/Chrysler known issues...`);
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
    { make: 'Dodge', model: 'Dart' },
    { make: 'Dodge', model: 'Dakota' },
    { make: 'Dodge', model: 'Grand Caravan' },
    { make: 'RAM', model: '2500' },
    { make: 'RAM', model: '3500' },
    { make: 'Chrysler', model: 'Pacifica' },
    { make: 'Chrysler', model: '200' },
    { make: 'Chrysler', model: 'PT Cruiser' }
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
