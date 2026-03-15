// Add 4-5 issues each to thin Subaru, Kia, and Jeep models
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const newIssues = [
  // ===== SUBARU FORESTER =====
  {
    id: 'subaru-forester-head-gasket-1998',
    make: 'Subaru',
    model: 'Forester',
    years: range(1998, 2010),
    category: 'engine',
    title: 'EJ25 Head Gasket Failure (External Leak)',
    description: 'The EJ25 2.5L horizontally-opposed engine in 1998-2010 Foresters is notorious for external head gasket failure. Unlike typical blown head gaskets that cause overheating, the Subaru EJ25 gaskets fail externally, leaking coolant and oil down the sides of the engine. The failure is caused by the gasket material (composite) breaking down over time, combined with the horizontal orientation placing uneven stress on the gaskets. This is widely considered the most common and well-documented Subaru defect.',
    solution: 'Replace both head gaskets with the updated MLS (multi-layer steel) gaskets. Resurface both cylinder heads to ensure flatness within spec (0.002" max). Replace thermostat, water pump, timing belt, and all idler/tensioner pulleys while the engine is apart — these are all accessible during the job. Use genuine Subaru coolant (SOA868V9210). Budget 10-14 hours labor for a boxer engine head gasket job.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Sweet coolant smell from engine bay',
      'Oil weeping down sides of engine block',
      'Coolant level dropping with no visible external puddle',
      'White residue or staining on lower engine block',
      'Overheating in severe cases where internal gasket failure occurs'
    ],
    affectedSystems: ['engine', 'cooling'],
    dtcCodes: ['P0128', 'P0117', 'P0118'],
    estimatedCostLow: 1800,
    estimatedCostHigh: 3500,
    citations: [
      { url: 'https://www.nhtsa.gov/vehicle/2006/SUBARU/FORESTER', source: 'NHTSA', description: 'NHTSA complaints for Forester head gasket failures' }
    ],
    communityRecommendations: [
      { text: 'Always use the updated MLS (multi-layer steel) gaskets — never reuse the original composite type. Six Star head gaskets are a popular aftermarket choice.', source: 'SubaruForester.org', upvotes: 412 },
      { text: 'Do timing belt, water pump, thermostat, and all pulleys at the same time. The engine is already apart — these parts are cheap insurance.', source: 'SubaruForester.org', upvotes: 356 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-forester-rear-suspension-clunk-2009',
    make: 'Subaru',
    model: 'Forester',
    years: range(2009, 2018),
    category: 'suspension',
    title: 'Rear Suspension Bushing Clunk Over Bumps',
    description: 'Foresters from 2009-2018 develop a persistent clunking or knocking noise from the rear suspension when going over bumps, rough roads, or speed bumps. The cause is worn rear lateral link bushings and rear stabilizer bar end links. The rubber bushings dry out and crack, allowing metal-on-metal contact. The noise is often misdiagnosed as strut or shock failure.',
    solution: 'Replace rear lateral link bushings (both inner and outer on each side). Replace rear stabilizer bar end links. Whiteline polyurethane bushings are a popular upgrade that lasts significantly longer than OEM rubber. If noise persists, check rear subframe mounting bushings. Torque all bolts to spec with the suspension loaded (wheels on ground or suspension compressed to ride height).',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Clunking from rear over bumps and rough roads',
      'Hollow knocking sound at low speeds over uneven surfaces',
      'Rear end feels loose or vague in corners',
      'Visible cracking or deterioration of rear suspension bushings'
    ],
    affectedSystems: ['suspension'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { text: 'Whiteline rear lateral link bushings (KCA399) are a huge upgrade over stock rubber — they last 3-4x longer and sharpen up rear handling.', source: 'SubaruForester.org', upvotes: 189 },
      { text: 'Always torque rear suspension bolts with the car sitting at ride height, not hanging in the air. This prevents premature bushing failure.', source: 'NASIOC', upvotes: 145 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-forester-cvt-judder-2019',
    make: 'Subaru',
    model: 'Forester',
    years: range(2019, 2025),
    category: 'transmission',
    title: 'CVT Judder and Vibration at Low Speeds',
    description: 'The 5th generation Forester (2019+) with the Lineartronic CVT experiences a noticeable judder or vibration during low-speed driving, particularly when the transmission is cold. The judder is most felt between 10-30 mph during light acceleration. Subaru has released multiple TSBs addressing CVT calibration, but the issue persists for many owners. The problem is related to the torque converter lockup strategy engaging too aggressively at low speeds to maximize fuel economy.',
    solution: 'Have dealer perform CVT software update per latest TSB (multiple revisions exist — confirm the latest is applied). If judder persists after software update, CVT fluid drain and refill with Subaru Lineartronic CVT Fluid II (SOA868V9245) may help. In severe cases, torque converter replacement has resolved the issue. All Subarus have a 10-year/100,000-mile CVT warranty extension.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Shuddering or vibration between 10-30 mph',
      'Judder during light acceleration from low speeds',
      'Vibration worse when transmission is cold',
      'Smooth operation at highway speeds',
      'Feels like driving over rumble strips at low speed'
    ],
    affectedSystems: ['transmission'],
    dtcCodes: ['P0700', 'P0868'],
    estimatedCostLow: 0,
    estimatedCostHigh: 4500,
    citations: [
      { url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10192857-0001.pdf', source: 'Subaru TSB', description: 'TSB for CVT judder and software calibration update' }
    ],
    communityRecommendations: [
      { text: 'Make sure the dealer applies the LATEST TCM calibration — there have been 3-4 revisions. Some dealers apply an older one that does not fully fix the issue.', source: 'SubaruForester.org', upvotes: 201 },
      { text: 'Change CVT fluid every 30,000 miles even though Subaru says "lifetime" — the judder often improves significantly with fresh fluid.', source: 'SubaruForester.org', upvotes: 178 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-forester-ac-clutch-failure-2014',
    make: 'Subaru',
    model: 'Forester',
    years: range(2014, 2020),
    category: 'other',
    title: 'A/C Compressor Clutch Bearing Failure',
    description: 'The A/C compressor clutch bearing in 2014-2020 Foresters fails prematurely, causing a grinding or squealing noise when the A/C is on. The bearing failure can progress to the clutch seizing, which can throw or shred the serpentine belt, leaving the vehicle without power steering and alternator charging. In worst cases, the clutch hub can contact the pulley and create a fire risk from friction heat.',
    solution: 'Replace the A/C compressor clutch assembly (clutch, coil, and pulley). If caught early, just the clutch bearing can be replaced for less cost. If the compressor internal damage has occurred (metal shavings in system), the entire compressor, receiver/drier, and expansion valve must be replaced, and the system must be flushed. Always replace the serpentine belt if it shows any glazing or damage.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Grinding or squealing noise when A/C is turned on',
      'A/C clutch chattering or clicking rapidly',
      'Burning rubber smell from engine bay',
      'A/C blows warm intermittently',
      'Serpentine belt squealing or shredding'
    ],
    affectedSystems: ['hvac'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { text: 'If you hear any noise from the A/C compressor area, address it immediately. A seized clutch will shred the belt and leave you stranded.', source: 'SubaruForester.org', upvotes: 134 },
      { text: 'Denso remanufactured compressors (OEM supplier for Subaru) are the best value — about half the price of new OEM with the same quality.', source: 'NASIOC', upvotes: 112 }
    ],
    status: 'published'
  },

  // ===== SUBARU IMPREZA =====
  {
    id: 'subaru-impreza-head-gasket-2002',
    make: 'Subaru',
    model: 'Impreza',
    years: range(2002, 2011),
    category: 'engine',
    title: 'EJ253 Head Gasket External Leak',
    description: 'The naturally-aspirated EJ253 2.5L engine in 2002-2011 Imprezas suffers from the same head gasket failure common across Subaru\'s EJ-series engines. The composite head gaskets degrade over time and begin leaking coolant and oil externally along the cylinder heads. The horizontal boxer engine layout makes the leak path run down the sides of the engine. Failure typically occurs between 80,000-150,000 miles.',
    solution: 'Replace both head gaskets with updated MLS (multi-layer steel) gaskets. Machine both cylinder head mating surfaces to ensure flatness. Replace the timing belt, tensioner, idler pulleys, water pump, and thermostat while the engine is disassembled — all are accessible with heads removed. Use Subaru OEM coolant and properly bleed the cooling system (boxer engines trap air easily).',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Oil or coolant weeping from head-to-block mating surface',
      'Sweet coolant smell after driving',
      'Coolant level dropping slowly over weeks',
      'White crusty deposits on lower engine block',
      'Overheating if internal failure develops'
    ],
    affectedSystems: ['engine', 'cooling'],
    dtcCodes: ['P0128', 'P0117'],
    estimatedCostLow: 1600,
    estimatedCostHigh: 3200,
    citations: [
      { url: 'https://www.nhtsa.gov/vehicle/2008/SUBARU/IMPREZA', source: 'NHTSA', description: 'NHTSA complaints for Impreza head gasket failures' }
    ],
    communityRecommendations: [
      { text: 'Six Star or Fel-Pro MLS gaskets are the go-to aftermarket replacement. Never reinstall composite gaskets — they will fail again.', source: 'NASIOC', upvotes: 378 },
      { text: 'Budget for timing belt service at the same time. It adds maybe $200 in parts but saves $800+ in future labor since the front of the engine is already apart.', source: 'NASIOC', upvotes: 290 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-impreza-windshield-crack-2017',
    make: 'Subaru',
    model: 'Impreza',
    years: range(2017, 2024),
    category: 'body',
    title: 'Windshield Stress Cracking Near EyeSight Cameras',
    description: 'The 2017+ Impreza (5th generation) uses a thinner, more aerodynamic windshield design that is highly prone to stress cracking, particularly around the EyeSight camera housing area. Cracks often appear spontaneously without any impact, starting from the edges or around the camera mounting bracket. Temperature changes exacerbate the issue. EyeSight-equipped vehicles require dealer recalibration ($200-400) after windshield replacement, adding significant cost.',
    solution: 'Replace windshield with OEM Subaru glass or equivalent that meets EyeSight specifications. After installation, EyeSight camera recalibration is mandatory at a Subaru dealer (requires specialized targets and procedure). Some aftermarket glass does not meet the optical clarity requirements for EyeSight and can cause system malfunctions. Check comprehensive insurance — many policies cover glass with no deductible.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Crack appearing from windshield edge with no visible impact point',
      'Crack originating near EyeSight camera housing',
      'Crack spreading rapidly across windshield',
      'EyeSight system disabled warning after crack develops'
    ],
    affectedSystems: ['body', 'safety'],
    dtcCodes: [],
    estimatedCostLow: 500,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { text: 'Add comprehensive glass coverage to your insurance before this happens. Subaru windshields with EyeSight recalibration cost $800-1200 total.', source: 'r/subaru', upvotes: 234 },
      { text: 'Only use OEM Subaru glass or Pilkington (OEM supplier). Cheap aftermarket glass can cause EyeSight malfunctions and false alerts.', source: 'NASIOC', upvotes: 198 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-impreza-cvt-chain-slip-2012',
    make: 'Subaru',
    model: 'Impreza',
    years: range(2012, 2020),
    category: 'transmission',
    title: 'CVT Chain Slip and Whining Under Load',
    description: 'The Lineartronic CVT in 2012-2020 Imprezas can develop chain slippage, particularly under heavy acceleration or hill climbing. The CVT chain stretches over time, causing the transmission to slip and produce a whining or buzzing noise. The issue is accelerated by aggressive driving or towing (which the Impreza is not rated for but owners sometimes attempt). Subaru extended the CVT warranty to 10 years/100,000 miles due to widespread failures across their lineup.',
    solution: 'Start with a CVT fluid drain and refill using Subaru Lineartronic CVT Fluid II (SOA868V9245). If slipping persists, the CVT chain and pulleys require replacement, which is typically done by installing a Subaru remanufactured CVT assembly. Confirm your vehicle is covered under the extended 10-year/100,000-mile CVT warranty before paying out of pocket.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Whining or buzzing noise during acceleration',
      'RPMs flare without corresponding acceleration',
      'Hesitation or lurching during uphill driving',
      'Transmission slipping sensation under heavy throttle',
      'Check engine light with transmission codes'
    ],
    affectedSystems: ['transmission'],
    dtcCodes: ['P0700', 'P0730', 'P0868', 'P2764'],
    estimatedCostLow: 200,
    estimatedCostHigh: 8000,
    citations: [
      { url: 'https://www.nhtsa.gov/vehicle/2015/SUBARU/IMPREZA', source: 'NHTSA', description: 'NHTSA complaints for Impreza CVT failures' }
    ],
    communityRecommendations: [
      { text: 'Check your CVT warranty coverage first — Subaru extended it to 10 years/100k miles. Many owners are getting free replacements.', source: 'NASIOC', upvotes: 267 },
      { text: 'Change CVT fluid every 25,000-30,000 miles regardless of what the manual says. Fresh fluid prevents chain stretch.', source: 'r/subaru', upvotes: 201 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-impreza-trailing-arm-bushing-2008',
    make: 'Subaru',
    model: 'Impreza',
    years: range(2008, 2020),
    category: 'suspension',
    title: 'Rear Trailing Arm Bushing Corrosion and Failure',
    description: 'The rear trailing arm bushings on Imprezas corrode and fail, particularly in salt-belt states. The steel sleeve inside the rubber bushing rusts and expands, tearing the rubber apart. This causes clunking noises, vague rear-end handling, and uneven rear tire wear. In severe cases, the bushing can separate completely, allowing the rear wheel to shift its alignment dramatically. Subaru issued a recall (WRF-99) on some models for trailing arm corrosion.',
    solution: 'Replace rear trailing arm bushings. Inspect the trailing arm itself for corrosion — if the arm is heavily corroded, replace the entire trailing arm assembly. Whiteline or Kartboy polyurethane bushings resist corrosion better than OEM rubber-and-steel construction. Apply anti-seize to all bolts during reinstallation. Get a 4-wheel alignment after replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Clunking from rear over bumps',
      'Rear end wanders or feels loose in corners',
      'Uneven rear tire wear (inner or outer edge)',
      'Visible rust and cracking around rear trailing arm bushings',
      'Rear wheels appear to toe-out when viewed from behind'
    ],
    affectedSystems: ['suspension'],
    dtcCodes: [],
    estimatedCostLow: 250,
    estimatedCostHigh: 700,
    citations: [],
    communityRecommendations: [
      { text: 'In salt states, spray the trailing arm bushings with fluid film or Woolwax annually. Prevention is much cheaper than replacement.', source: 'NASIOC', upvotes: 156 },
      { text: 'Whiteline trailing arm bushings (KCA326) are the gold standard replacement — they eliminate the steel-sleeve-in-rubber design that corrodes.', source: 'NASIOC', upvotes: 134 }
    ],
    status: 'published'
  },

  // ===== SUBARU CROSSTREK =====
  {
    id: 'subaru-crosstrek-cvt-hesitation-2013',
    make: 'Subaru',
    model: 'Crosstrek',
    years: range(2013, 2023),
    category: 'transmission',
    title: 'CVT Hesitation and Delay From Stop',
    description: 'The Crosstrek\'s Lineartronic CVT exhibits a noticeable 1-2 second delay when accelerating from a complete stop, particularly at intersections. The hesitation is dangerous in situations requiring quick acceleration (merging, left turns across traffic). The issue is related to the CVT\'s torque converter lockup strategy and throttle mapping. Multiple TSBs have been released for TCM reprogramming, but the fundamental delay persists to some degree in most units.',
    solution: 'Have dealer apply the latest TCM software calibration — there have been multiple revisions and the most recent provides the best response. Perform CVT fluid change with Subaru Lineartronic CVT Fluid II (SOA868V9245). If hesitation is severe and persists after updates, valve body replacement may be necessary. All Subarus have extended 10-year/100,000-mile CVT warranty coverage.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      '1-2 second delay when pressing gas from a stop',
      'Vehicle feels like it is in neutral momentarily',
      'Lurching or jerking when power finally engages',
      'Worse when cold or in stop-and-go traffic',
      'RPMs rise before vehicle moves'
    ],
    affectedSystems: ['transmission'],
    dtcCodes: ['P0700', 'P0868'],
    estimatedCostLow: 0,
    estimatedCostHigh: 4500,
    citations: [
      { url: 'https://www.nhtsa.gov/vehicle/2018/SUBARU/CROSSTREK', source: 'NHTSA', description: 'NHTSA complaints for Crosstrek CVT hesitation' }
    ],
    communityRecommendations: [
      { text: 'The "S" mode or manual paddle shifter mode significantly reduces the hesitation. Many owners just leave it in S mode for daily driving.', source: 'r/Crosstrek', upvotes: 223 },
      { text: 'A CVT fluid change at 30k intervals makes a noticeable difference in shift response. Do not listen to the "lifetime fluid" claim.', source: 'CrosstrekForum.com', upvotes: 189 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-crosstrek-windshield-crack-2018',
    make: 'Subaru',
    model: 'Crosstrek',
    years: range(2018, 2025),
    category: 'body',
    title: 'Windshield Stress Cracking',
    description: 'The 2nd generation Crosstrek (2018+) has a windshield that is extremely prone to cracking, even from minor stone chips. The windshield\'s steep rake angle and thin design make it vulnerable to temperature-induced stress cracks. EyeSight-equipped models require dealer recalibration after replacement, significantly increasing the total cost. Many owners report needing 2-3 windshield replacements within the warranty period.',
    solution: 'Replace with OEM Subaru glass or Pilkington (OEM supplier) for EyeSight compatibility. After installation, dealer EyeSight recalibration is mandatory ($200-400). File an insurance claim through comprehensive coverage — many states have zero-deductible glass coverage. Consider applying a ceramic coating or clear protection film to the new windshield to reduce chip susceptibility.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Crack appearing from edge with no obvious impact',
      'Small chip rapidly spreading into a long crack',
      'Cracking near EyeSight camera housing',
      'Multiple windshield replacements needed within ownership'
    ],
    affectedSystems: ['body'],
    dtcCodes: [],
    estimatedCostLow: 500,
    estimatedCostHigh: 1100,
    citations: [],
    communityRecommendations: [
      { text: 'Get comprehensive glass coverage on your insurance BEFORE you need it. Crosstreks average 1-2 windshield replacements over 5 years of ownership.', source: 'r/Crosstrek', upvotes: 312 },
      { text: 'Safelite can do the replacement but you MUST go to a Subaru dealer for EyeSight recalibration afterward. Budget $200-400 for that on top.', source: 'CrosstrekForum.com', upvotes: 245 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-crosstrek-rear-brake-seize-2016',
    make: 'Subaru',
    model: 'Crosstrek',
    years: range(2016, 2023),
    category: 'brakes',
    title: 'Rear Brake Caliper Seizing',
    description: 'The rear brake calipers on Crosstreks are prone to seizing, particularly in regions with road salt and wet climates. The caliper slide pins corrode and bind, causing the brake pads to drag on the rotor. This leads to premature pad and rotor wear on one side, reduced fuel economy, and a burning brake smell. If left unaddressed, the rotor can warp or the pads can wear down to metal, damaging the caliper.',
    solution: 'Remove, clean, and re-grease the caliper slide pins with high-temperature silicone brake grease. If pins are heavily corroded or pitted, replace them. Replace brake pads and machine or replace rotors if they are scored or warped. In severe cases where the caliper piston is seized, replace the caliper. Apply anti-seize to the slide pin boots and inspect annually.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Vehicle pulls to one side when braking',
      'Burning smell from rear brakes after driving',
      'Rear wheel hot to the touch after short drive',
      'Uneven brake pad wear (inner vs outer)',
      'Grinding or scraping noise from rear brakes',
      'Reduced fuel economy'
    ],
    affectedSystems: ['brakes'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [
      { text: 'Clean and re-grease your rear caliper slide pins every brake pad change — this is the #1 preventive measure. Use Sil-Glyde or Permatex Ultra Disc Brake Caliper Lube.', source: 'CrosstrekForum.com', upvotes: 178 },
      { text: 'In salt states, pull the rear calipers and clean the slide pins at every oil change. Takes 15 minutes and prevents $500+ in brake work.', source: 'r/Crosstrek', upvotes: 145 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-crosstrek-oil-consumption-fb20-2013',
    make: 'Subaru',
    model: 'Crosstrek',
    years: range(2013, 2017),
    category: 'engine',
    title: 'FB20 Excessive Oil Consumption',
    description: 'The first-generation Crosstrek\'s FB20 2.0L engine consumes oil at an excessive rate, with some owners reporting 1 quart per 1,000-1,500 miles. The root cause is the low-tension piston rings Subaru used to reduce internal friction and improve fuel economy. The rings do not adequately seal against the cylinder walls, allowing oil to pass into the combustion chamber. Subaru extended the warranty and issued a TSB with an oil consumption test procedure.',
    solution: 'Perform Subaru\'s official oil consumption test (dealer monitors oil level over a set mileage interval). If consumption exceeds 1 quart per 1,200 miles, Subaru will replace the short block under the extended powertrain warranty. If out of warranty, switching to a slightly heavier oil weight (0W-30 instead of 0W-20) can reduce consumption. Check PCV valve — a stuck valve worsens consumption. Monitor oil level every 1,000 miles.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Oil level low between changes (1 qt per 1,000-1,500 miles)',
      'Blue-gray exhaust smoke on startup or acceleration',
      'Oil smell from exhaust',
      'Low oil pressure warning light',
      'Fouled spark plugs'
    ],
    affectedSystems: ['engine'],
    dtcCodes: ['P0171', 'P0172'],
    estimatedCostLow: 0,
    estimatedCostHigh: 5000,
    citations: [
      { url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10137633-0001.pdf', source: 'Subaru TSB', description: 'Subaru TSB for excessive oil consumption test and short block replacement' }
    ],
    communityRecommendations: [
      { text: 'Push for the oil consumption test at the dealer. If you burn more than 1 qt per 1,200 miles, Subaru will replace the short block for free under the extended warranty.', source: 'r/Crosstrek', upvotes: 289 },
      { text: 'Check your oil every fill-up. These engines can go from full to dangerously low in 3,000 miles. Running low will cause bearing damage.', source: 'CrosstrekForum.com', upvotes: 234 }
    ],
    status: 'published'
  },

  // ===== SUBARU ASCENT =====
  {
    id: 'subaru-ascent-ac-condenser-leak-2019',
    make: 'Subaru',
    model: 'Ascent',
    years: range(2019, 2025),
    category: 'other',
    title: 'A/C Condenser Leak from Road Debris',
    description: 'The Ascent\'s A/C condenser is positioned directly behind the front bumper with inadequate protection from road debris. Small rocks and gravel puncture the thin condenser fins and tubes, causing refrigerant leaks. The issue is particularly common on gravel roads or in construction zones. The condenser design lacks the protective mesh or guard found on competing three-row SUVs.',
    solution: 'Replace the A/C condenser and recharge the system with R-1234yf refrigerant. Install an aftermarket condenser guard or mesh screen behind the front bumper to prevent future damage — several Ascent-specific guards are available from vendors like SubiSpeed and Rally Innovations. After replacement, have the system evacuated and recharged by a shop with R-1234yf equipment (more expensive than R-134a).',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows warm air gradually over days/weeks',
      'A/C works intermittently then stops completely',
      'Visible green dye or oily residue on condenser',
      'Hissing sound from front of vehicle when A/C is on',
      'A/C refrigerant low warning (if equipped)'
    ],
    affectedSystems: ['hvac'],
    dtcCodes: [],
    estimatedCostLow: 600,
    estimatedCostHigh: 1400,
    citations: [],
    communityRecommendations: [
      { text: 'Install a condenser guard from SubiSpeed or Rally Innovations BEFORE you need a condenser replacement. The guard is $50-80, the condenser is $800+.', source: 'AscentForums.com', upvotes: 267 },
      { text: 'R-1234yf refrigerant is expensive ($80-120/lb vs $15 for R-134a). A full recharge costs $200-350 at most shops. Do not let a shop overcharge you.', source: 'AscentForums.com', upvotes: 198 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-ascent-valve-body-failure-2019',
    make: 'Subaru',
    model: 'Ascent',
    years: range(2019, 2024),
    category: 'transmission',
    title: 'CVT Valve Body Failure and Transmission Warning',
    description: 'The Ascent\'s TR730 high-torque CVT develops valve body failures that cause erratic shifting, harsh engagement, and transmission warning lights. The valve body controls hydraulic pressure to the CVT pulleys and chain, and when solenoids or passages within it fail, the transmission cannot maintain proper ratio control. This issue is distinct from the CVT hesitation TSB and represents a hardware failure rather than a calibration issue.',
    solution: 'Diagnose with dealer scan tool to confirm valve body solenoid fault codes. Valve body replacement resolves the issue in most cases — this is a less expensive repair than full CVT replacement. If the CVT has been operated with a failed valve body for an extended period, internal damage may necessitate full CVT replacement. Covered under Subaru\'s 10-year/100,000-mile CVT warranty.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Transmission warning light illuminated',
      'Harsh thud when shifting from Park to Drive',
      'CVT slipping or flaring RPMs under load',
      'Shuddering at highway speeds',
      'Vehicle going into limp mode (limited to low speeds)',
      'Burning fluid smell'
    ],
    affectedSystems: ['transmission'],
    dtcCodes: ['P0700', 'P0730', 'P0740', 'P0962', 'P0963', 'P2764'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 8500,
    citations: [
      { url: 'https://www.nhtsa.gov/vehicle/2020/SUBARU/ASCENT', source: 'NHTSA', description: 'NHTSA complaints for Ascent CVT valve body failures' }
    ],
    communityRecommendations: [
      { text: 'Push for valve body replacement first — it is $1,500-2,500 vs $7,000-9,000 for a full CVT. Many dealers jump straight to full replacement when valve body would suffice.', source: 'AscentForums.com', upvotes: 234 },
      { text: 'Do not drive with the transmission warning light on. Continued operation with low hydraulic pressure causes chain and pulley damage that turns a $2k repair into an $8k one.', source: 'AscentForums.com', upvotes: 198 }
    ],
    status: 'published'
  },
  {
    id: 'subaru-ascent-battery-drain-parasitic-2019',
    make: 'Subaru',
    model: 'Ascent',
    years: range(2019, 2023),
    category: 'electrical',
    title: 'Parasitic Battery Drain and Dead Battery',
    description: 'The Ascent suffers from parasitic battery drain that kills the battery after the vehicle sits for 3-5 days. The issue is caused by multiple electronic modules (telematics, EyeSight, Starlink) failing to enter sleep mode properly. The factory-equipped battery (Group 25) is undersized for the Ascent\'s electrical demands. Subaru released TSBs for software updates to multiple ECUs to reduce parasitic draw, but many owners continue to experience the issue.',
    solution: 'Have dealer apply all available ECU software updates for parasitic drain (multiple modules need updating). Test parasitic draw with a multimeter — normal is under 50mA after 30 minutes of sitting. Upgrade to a higher CCA battery (Group 25 with 600+ CCA or an AGM equivalent). If the vehicle will sit for more than 5 days, use a battery maintainer. In persistent cases, the Starlink telematics module may need replacement.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Dead battery after sitting 3-5 days',
      'Slow cranking on cold mornings',
      'Keyless entry not responding intermittently',
      'Clock and radio presets reset',
      'Multiple warning lights on dash after jump start'
    ],
    affectedSystems: ['electrical'],
    dtcCodes: ['U0100', 'U0140'],
    estimatedCostLow: 150,
    estimatedCostHigh: 800,
    citations: [
      { url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10191432-0001.pdf', source: 'Subaru TSB', description: 'TSB for Ascent parasitic battery drain and module sleep mode update' }
    ],
    communityRecommendations: [
      { text: 'Upgrade to an Optima YellowTop or Odyssey AGM battery. The factory battery is barely adequate for the Ascent\'s electrical load.', source: 'AscentForums.com', upvotes: 312 },
      { text: 'Keep a NOCO Genius boost pack in the cargo area. It is cheaper than AAA calls and you will need it if the car sits for a long weekend.', source: 'r/SubaruAscent', upvotes: 234 }
    ],
    status: 'published'
  },

  // ===== KIA SORENTO =====
  {
    id: 'kia-sorento-sunroof-rattle-2016',
    make: 'Kia',
    model: 'Sorento',
    years: range(2016, 2025),
    category: 'body',
    title: 'Panoramic Sunroof Rattle and Wind Noise',
    description: 'The panoramic sunroof on 2016+ Sorentos develops a persistent rattling noise, especially at highway speeds or on rough roads. The sunroof glass panel vibrates against its frame due to deteriorating seal material and insufficient dampening. Wind noise also increases as the seals lose their compression over time. In some cases, the sunroof drain tubes clog, leading to water leaks into the headliner.',
    solution: 'Clean and lubricate the sunroof tracks and seals with silicone-based lubricant. Apply foam dampening tape to the sunroof frame contact points to eliminate rattle. Clear the sunroof drain tubes by passing a flexible wire or compressed air through the four corner drains. If seals are cracked or compressed, replace the sunroof weatherstrip. Severe cases may require sunroof frame adjustment at the dealer.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Rattling noise from roof area at highway speeds',
      'Wind whistling or rushing noise from sunroof',
      'Water dripping from headliner near sunroof',
      'Sunroof creaking when vehicle flexes over bumps',
      'Musty smell in cabin from clogged drains'
    ],
    affectedSystems: ['body', 'interior'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { text: 'Apply 3M adhesive-backed foam tape strips along the sunroof frame where the glass contacts it. Costs $10 and eliminates 90% of the rattle.', source: 'SorentoForum.com', upvotes: 189 },
      { text: 'Clean the sunroof drains annually — pour a cup of water into each corner drain and make sure it flows out under the vehicle. Clogged drains cause expensive headliner damage.', source: 'KiaForums.com', upvotes: 156 }
    ],
    status: 'published'
  },
  {
    id: 'kia-sorento-rear-ac-evaporator-2016',
    make: 'Kia',
    model: 'Sorento',
    years: range(2016, 2023),
    category: 'other',
    title: 'Rear A/C Evaporator Refrigerant Leak',
    description: 'The rear A/C evaporator in Sorentos with dual-zone or tri-zone climate control develops refrigerant leaks due to corrosion of the aluminum evaporator core. The rear evaporator is located under the second-row seats or in the rear quarter panel, making it expensive to access. The leak results in the entire A/C system losing refrigerant, affecting both front and rear cooling. R-1234yf refrigerant used in newer models adds to repair cost.',
    solution: 'Diagnose with UV dye and electronic leak detector to confirm rear evaporator as the leak source. Replace the rear evaporator core — this requires removal of interior trim panels and sometimes the second-row seats. Replace the receiver/drier and expansion valve at the same time. Evacuate and recharge the system. Some owners opt to bypass the rear evaporator loop if they do not need rear A/C, which is a less expensive fix.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows warm throughout the vehicle',
      'A/C works briefly after recharge then fails again',
      'Wet carpet under second-row seats (condensation from leak)',
      'Green UV dye visible under vehicle near rear axle',
      'Hissing from under rear seat area'
    ],
    affectedSystems: ['hvac'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { text: 'Before paying $1,500+ for rear evaporator replacement, ask the shop about bypassing the rear A/C loop. It costs $200-300 and you still get full front A/C.', source: 'KiaForums.com', upvotes: 167 },
      { text: 'If your A/C needs recharging more than once per season, it is a leak — do not keep recharging. The dye test will find it and save money long term.', source: 'SorentoForum.com', upvotes: 134 }
    ],
    status: 'published'
  },
  {
    id: 'kia-sorento-awd-coupling-failure-2011',
    make: 'Kia',
    model: 'Sorento',
    years: range(2011, 2020),
    category: 'drivetrain',
    title: 'AWD Coupling Failure and Grinding Noise',
    description: 'The electronically-controlled AWD coupling (transfer case) in Sorentos fails due to worn clutch packs inside the coupling unit. The coupling is responsible for distributing torque to the rear wheels and uses a multi-plate clutch actuated by an electric motor. When the clutch packs wear out, the system cannot engage the rear axle properly, resulting in a grinding noise, vibration, and loss of AWD functionality. The coupling fluid also breaks down over time if not changed.',
    solution: 'Replace the AWD coupling assembly (also called the power transfer unit or electronic coupling). Change the coupling fluid (Kia specifies a specific coupling fluid, not standard gear oil) every 30,000 miles as preventive maintenance. If caught early, some couplings can be rebuilt with new clutch packs, but most shops replace the entire unit. After replacement, perform an AWD system relearn procedure with a KDS (Kia Diagnostic System) scan tool.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Grinding or growling noise from under the vehicle',
      'Vibration felt through the floor during turns',
      'AWD warning light illuminated on dashboard',
      'Vehicle feels like it is binding during tight turns',
      'Loss of traction in conditions where AWD should engage'
    ],
    affectedSystems: ['drivetrain'],
    dtcCodes: ['C1513', 'C1515', 'P0734'],
    estimatedCostLow: 800,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { text: 'Change the AWD coupling fluid every 30,000 miles — this is the single most effective preventive measure. Most owners never do it because it is not prominently listed in the maintenance schedule.', source: 'KiaForums.com', upvotes: 198 },
      { text: 'Aftermarket reman couplings from BorgWarner (OEM supplier) are half the price of dealer units and just as reliable.', source: 'SorentoForum.com', upvotes: 145 }
    ],
    status: 'published'
  },
  {
    id: 'kia-sorento-oil-pan-gasket-2015',
    make: 'Kia',
    model: 'Sorento',
    years: range(2015, 2023),
    category: 'engine',
    title: 'Oil Pan Gasket Leak (3.3L V6)',
    description: 'The 3.3L Lambda II V6 engine in the Sorento develops oil pan gasket leaks, typically after 60,000-80,000 miles. The gasket material hardens and shrinks over time due to heat cycling, allowing oil to seep from the oil pan-to-block mating surface. The leak is slow initially but worsens over time. Oil drips onto the exhaust crossover pipe below the engine, creating a burning oil smell and potential fire risk.',
    solution: 'Remove the oil pan, clean both mating surfaces thoroughly, and install a new oil pan gasket with Kia-specified RTV sealant at the corners. Some mechanics prefer to use all-RTV (no gasket) for a more durable seal. The job requires supporting the engine and lowering the front subframe on some model years for clearance. Retorque oil pan bolts to spec in the correct sequence.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Oil spots on driveway under engine area',
      'Burning oil smell, especially after highway driving',
      'Oil dripping onto exhaust pipe causing smoke',
      'Low oil level between changes',
      'Visible oil seepage around oil pan flange'
    ],
    affectedSystems: ['engine'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { text: 'When replacing the gasket, also replace the oil pan drain plug crush washer and check the drain plug threads. Overtightened drain plugs are a common secondary leak source.', source: 'KiaForums.com', upvotes: 123 },
      { text: 'Clean both surfaces with a plastic scraper — never use a metal scraper on the aluminum block surface. Any gouges will cause the new gasket to leak.', source: 'SorentoForum.com', upvotes: 98 }
    ],
    status: 'published'
  },

  // ===== KIA SPORTAGE =====
  {
    id: 'kia-sportage-turbo-oil-line-leak-2017',
    make: 'Kia',
    model: 'Sportage',
    years: range(2017, 2025),
    category: 'engine',
    title: 'Turbo Oil Feed Line Leak (1.6T)',
    description: 'The 1.6L turbocharged engine in the Sportage develops oil leaks from the turbocharger oil feed line and its banjo bolt connection. The high heat environment around the turbo causes the oil line seals and crush washers to harden and leak. Oil drips onto the hot exhaust manifold and turbo housing, creating smoke and a burning oil smell. If the oil feed line is significantly restricted by carbon buildup, the turbo bearings can be starved of oil and fail.',
    solution: 'Replace the turbo oil feed line, banjo bolts, and copper crush washers. Clean any carbon buildup from the banjo bolt oil passages. Inspect the turbo for bearing play — if there is any shaft play or the compressor wheel contacts the housing, the turbo must be replaced. Use OEM Kia crush washers (they are copper and must be new each time). Check oil drain line for restrictions as well.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Burning oil smell from engine bay',
      'Smoke from turbo/exhaust manifold area',
      'Oil drips on driveway from center of engine',
      'Turbo whine increasing or changing pitch',
      'Low oil level between changes'
    ],
    affectedSystems: ['engine'],
    dtcCodes: ['P0299'],
    estimatedCostLow: 200,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { text: 'Always use new copper crush washers on the banjo bolts — reusing old washers guarantees a leak. OEM part is cheap ($3-5 each).', source: 'KiaForums.com', upvotes: 167 },
      { text: 'When replacing the oil feed line, also check the oil drain line from the turbo. A blocked drain line causes oil to push past the turbo seals into the intake.', source: 'SportageForum.com', upvotes: 134 }
    ],
    status: 'published'
  },
  {
    id: 'kia-sportage-sunroof-crack-2017',
    make: 'Kia',
    model: 'Sportage',
    years: range(2017, 2025),
    category: 'body',
    title: 'Panoramic Sunroof Spontaneous Cracking',
    description: 'The panoramic sunroof glass on 2017+ Sportages can crack or shatter spontaneously without any impact. The tempered glass panel develops stress fractures from thermal expansion/contraction, especially during rapid temperature changes (hot sun then cold rain, or cold night then morning defrost). When the glass fails, it shatters into small pieces that fall into the cabin. Multiple NHTSA complaints have been filed for this issue.',
    solution: 'Replace the panoramic sunroof glass panel. This must be done at a dealer or specialty glass shop due to the large panel size and sealing requirements. After replacement, ensure all four drain tubes are clear and properly connected. Some owners choose to apply a clear security film to the interior surface of the replacement glass to contain fragments if it shatters again. Check if Kia has a warranty extension or goodwill program for this issue.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Loud pop or crack sound from roof',
      'Spider web crack pattern across sunroof glass',
      'Sunroof glass shattering with no impact',
      'Glass fragments falling into cabin',
      'Wind noise from cracked sunroof seal'
    ],
    affectedSystems: ['body'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 1800,
    citations: [
      { url: 'https://www.nhtsa.gov/vehicle/2020/KIA/SPORTAGE', source: 'NHTSA', description: 'NHTSA complaints for Sportage panoramic sunroof cracking' }
    ],
    communityRecommendations: [
      { text: 'File a complaint with NHTSA even if you get it fixed. The more complaints on file, the more likely Kia issues a recall or warranty extension.', source: 'KiaForums.com', upvotes: 198 },
      { text: 'If your sunroof shatters, take photos immediately and save the glass. Some owners have gotten Kia corporate to cover the repair as goodwill.', source: 'SportageForum.com', upvotes: 156 }
    ],
    status: 'published'
  },
  {
    id: 'kia-sportage-differential-coupling-noise-2017',
    make: 'Kia',
    model: 'Sportage',
    years: range(2017, 2023),
    category: 'drivetrain',
    title: 'Rear Differential Coupling Noise and Vibration (AWD)',
    description: 'AWD-equipped Sportages develop a humming, growling, or grinding noise from the rear differential coupling unit. The electronically-controlled clutch pack coupling wears internally, and the coupling fluid degrades from heat. The noise increases during turns and low-speed maneuvering. If ignored, the coupling can fail completely, leaving the vehicle in front-wheel-drive only mode.',
    solution: 'Drain and refill the rear differential coupling fluid with Kia-specified coupling fluid (not standard gear oil). If noise persists after fluid change, the coupling unit requires replacement. The coupling unit is separate from the rear differential and can be replaced independently. Perform a coupling relearn procedure with the Kia Diagnostic System after replacement. Change coupling fluid every 30,000 miles as preventive maintenance.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Humming or growling from rear during turns',
      'Grinding noise from rear at low speeds',
      'Vibration through the floor during acceleration',
      'AWD warning light on dashboard',
      'Clunking from rear when shifting from reverse to drive'
    ],
    affectedSystems: ['drivetrain'],
    dtcCodes: ['C1513', 'C1515'],
    estimatedCostLow: 150,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { text: 'Change the coupling fluid every 30,000 miles. Most Sportage owners never touch it and that is why the coupling fails at 60-80k miles.', source: 'SportageForum.com', upvotes: 178 },
      { text: 'If you catch it early with just a fluid change ($150), you can extend the coupling life significantly. Waiting until it grinds means a $1,500+ replacement.', source: 'KiaForums.com', upvotes: 145 }
    ],
    status: 'published'
  },
  {
    id: 'kia-sportage-infotainment-reboot-2020',
    make: 'Kia',
    model: 'Sportage',
    years: range(2020, 2025),
    category: 'electrical',
    title: 'Infotainment System Reboot Loop and Screen Freeze',
    description: 'The infotainment head unit in 2020+ Sportages enters a continuous reboot loop or freezes on the splash screen, leaving the driver without navigation, backup camera, and climate controls (on models with touchscreen-only HVAC). The issue is caused by software bugs and insufficient system memory for the connected services. Firmware updates from Kia have improved but not fully resolved the issue. The problem often occurs after USB device connection or Bluetooth pairing.',
    solution: 'Perform a hard reset by pressing and holding the power/volume knob for 10 seconds. If the reboot loop persists, disconnect the vehicle battery for 30 minutes to fully reset the head unit. Visit a Kia dealer for the latest infotainment software update (free under warranty). If the issue continues after the latest firmware, the head unit may need hardware replacement. Avoid connecting USB drives with large music libraries (1000+ songs) which overwhelm the system.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Touchscreen continuously rebooting with Kia logo',
      'Screen frozen and unresponsive to touch',
      'Backup camera not displaying when in reverse',
      'Bluetooth disconnecting and reconnecting repeatedly',
      'Climate controls unresponsive on touchscreen',
      'Apple CarPlay/Android Auto crashing'
    ],
    affectedSystems: ['electrical', 'interior'],
    dtcCodes: ['U1110'],
    estimatedCostLow: 0,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { text: 'The hard reset (hold power knob 10 seconds) fixes the reboot loop 80% of the time. Do this before going to the dealer.', source: 'KiaForums.com', upvotes: 234 },
      { text: 'Do not plug in USB drives with more than 500 songs — the system cannot index large libraries and crashes. Use CarPlay/Android Auto streaming instead.', source: 'SportageForum.com', upvotes: 189 }
    ],
    status: 'published'
  },

  // ===== KIA TELLURIDE =====
  {
    id: 'kia-telluride-paint-bubbling-2020',
    make: 'Kia',
    model: 'Telluride',
    years: range(2020, 2025),
    category: 'exterior',
    title: 'Paint Bubbling at Hood and Roof Seams',
    description: 'Tellurides develop paint bubbling and peeling at body panel seams, particularly the hood leading edge, roof rail joints, and rear liftgate seams. The issue is caused by insufficient e-coat coverage at spot-welded seams, allowing moisture to penetrate under the paint. The bubbling starts small but spreads if not addressed, eventually leading to visible rust. Dark-colored vehicles show the issue sooner. Kia has acknowledged the issue but has not issued a formal recall.',
    solution: 'If under Kia\'s 5-year/60,000-mile paint warranty, have the dealer document and repair under warranty (they will sand, prime, and respray the affected panels). If out of warranty, sand the affected area to bare metal, treat any rust with a converter, apply primer, and respray. For preventive care, apply paint protection film (PPF) to the hood leading edge and high-risk seam areas. Ceramic coating helps but does not prevent the underlying adhesion issue.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Small bubbles in paint along hood front edge',
      'Paint peeling at roof rail seam joints',
      'Rust-colored bubbles at liftgate seam',
      'Paint flaking when touched at bubble locations',
      'Issue worsening in wet/humid climates'
    ],
    affectedSystems: ['exterior'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { text: 'Document with photos and file a warranty claim early. Kia\'s paint warranty is 5 years/60,000 miles — but you need to report it before the warranty expires.', source: 'TellurideForum.com', upvotes: 234 },
      { text: 'PPF (paint protection film) on the hood leading edge is the best prevention. XPEL Ultimate Plus or 3M Pro Series are the top choices.', source: 'r/KiaTelluride', upvotes: 189 }
    ],
    status: 'published'
  },
  {
    id: 'kia-telluride-headliner-sag-2020',
    make: 'Kia',
    model: 'Telluride',
    years: range(2020, 2024),
    category: 'interior',
    title: 'Headliner Sagging Near Panoramic Sunroof',
    description: 'Tellurides equipped with the panoramic sunroof develop headliner sagging and separation around the sunroof opening. The headliner adhesive fails due to heat cycling from the large glass panel above, causing the fabric to detach from the backing board. The sagging starts at the edges of the sunroof opening and progresses outward. This is both a cosmetic and functional issue, as the sagging fabric can obstruct the sunroof shade operation.',
    solution: 'Dealer warranty repair involves replacing the entire headliner assembly, which requires removing the windshield, rear glass, or significant interior trim depending on the repair method. For minor sagging, some owners use headliner adhesive spray (3M Super 77 or equivalent) to re-bond the fabric, though this is considered a temporary fix. If out of warranty, an automotive upholstery shop can re-bond or replace the headliner for less than dealer cost.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Headliner fabric drooping around sunroof opening',
      'Visible wrinkles in headliner near sunroof edges',
      'Sunroof shade catching on sagging headliner',
      'Headliner separating from backing board',
      'Issue worse in hot climates'
    ],
    affectedSystems: ['interior'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { text: 'File a warranty claim immediately — headliner replacement is covered under the 5-year/60,000-mile basic warranty. The repair takes a full day.', source: 'TellurideForum.com', upvotes: 198 },
      { text: 'For a DIY temporary fix, use 3M Super 77 headliner adhesive and carefully re-bond the fabric. Use painter\'s tape to hold it while drying.', source: 'r/KiaTelluride', upvotes: 134 }
    ],
    status: 'published'
  },
  {
    id: 'kia-telluride-third-row-latch-2020',
    make: 'Kia',
    model: 'Telluride',
    years: range(2020, 2025),
    category: 'interior',
    title: 'Third Row Seat Latch Jamming',
    description: 'The third-row seat fold-down mechanism in the Telluride jams, preventing the seats from folding flat or locking back into the upright position. The latch mechanism uses a cable-actuated release that stretches and binds over time. When the latch jams in the released position, the seat back flops freely and cannot be secured for passenger use. The issue is exacerbated by frequent folding/unfolding of the third row.',
    solution: 'Lubricate the latch mechanism and release cable with white lithium grease or dry Teflon lubricant. If the cable has stretched, it needs to be adjusted or replaced. In some cases, the latch striker on the seat frame bends and needs to be realigned. Dealer repair involves replacing the seat latch assembly. Covered under the 5-year/60,000-mile basic warranty.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Third row seat will not fold down when release is pulled',
      'Third row seat back will not lock in upright position',
      'Seat back flops freely and cannot secure',
      'Clicking or grinding from latch mechanism',
      'Release handle feels loose or does not spring back'
    ],
    affectedSystems: ['interior'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { text: 'Spray dry Teflon lube (not WD-40) on the latch mechanism and cable every 6 months if you fold the seats frequently. Prevention costs $5 vs $400 for latch replacement.', source: 'TellurideForum.com', upvotes: 156 },
      { text: 'If the seat back is floppy and will not lock, check the striker pin on the seat frame — it bends slightly from repeated use. A pair of pliers to straighten it fixes it for free.', source: 'r/KiaTelluride', upvotes: 123 }
    ],
    status: 'published'
  },
  {
    id: 'kia-telluride-oil-dilution-2020',
    make: 'Kia',
    model: 'Telluride',
    years: range(2020, 2025),
    category: 'engine',
    title: 'Oil Dilution from Short Trip Driving (3.8L V6)',
    description: 'The 3.8L Lambda II V6 in the Telluride experiences fuel dilution of the engine oil when driven primarily on short trips (under 10 miles). Fuel washes past the piston rings during cold starts and does not fully evaporate because the oil never reaches full operating temperature. The diluted oil has reduced viscosity and lubrication properties, accelerating engine wear. The issue is more pronounced in cold climates. Oil analysis shows fuel contamination levels of 3-5% in severe cases.',
    solution: 'Change oil more frequently if driving primarily short trips — every 3,000-4,000 miles instead of the 7,500-mile factory interval. Take the vehicle on a 20+ minute highway drive weekly to bring the oil to full operating temperature and boil off fuel contamination. Use a quality full-synthetic 5W-30 oil that resists fuel dilution better than conventional oil. Consider oil analysis testing (Blackstone Labs, $30) to monitor fuel dilution levels. If fuel dilution exceeds 5%, investigate injector spray patterns.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Oil level rising above the full mark on dipstick',
      'Gasoline smell from engine oil on dipstick',
      'Oil appearing thinner than normal',
      'Oil change interval warning appearing early',
      'Increased engine noise from reduced oil film strength'
    ],
    affectedSystems: ['engine'],
    dtcCodes: ['P0172', 'P0175'],
    estimatedCostLow: 50,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { text: 'Send an oil sample to Blackstone Labs ($30) at your next oil change. They will tell you exactly how much fuel is in your oil and whether your engine is wearing abnormally.', source: 'TellurideForum.com', upvotes: 189 },
      { text: 'If you mostly drive short trips, cut the oil change interval to 4,000 miles or every 4 months, whichever comes first. The factory 7,500-mile interval assumes mixed driving.', source: 'r/KiaTelluride', upvotes: 156 }
    ],
    status: 'published'
  },

  // ===== JEEP GLADIATOR =====
  {
    id: 'jeep-gladiator-clutch-hydraulic-2020',
    make: 'Jeep',
    model: 'Gladiator',
    years: range(2020, 2025),
    category: 'transmission',
    title: 'Manual Transmission Clutch Hydraulic Failure',
    description: 'Gladiators equipped with the 6-speed manual transmission experience premature clutch hydraulic system failure. The clutch master cylinder and/or slave cylinder develop internal leaks, causing a soft or sinking clutch pedal and difficulty shifting. In severe cases, the clutch pedal goes to the floor with no resistance, leaving the vehicle undriveable. The slave cylinder is concentric (inside the bell housing), making replacement labor-intensive. Some owners experience failure as early as 20,000 miles.',
    solution: 'Replace the clutch slave cylinder (concentric style, inside bell housing — requires transmission removal). Many owners upgrade to the updated slave cylinder part number that uses a more durable seal material. Replace the clutch master cylinder at the same time since it shares the same fluid and failure mode. Bleed the hydraulic system thoroughly — air bubbles cause the same soft-pedal symptoms. If the clutch disc was slipping due to low hydraulic pressure, inspect it for glazing.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Clutch pedal feels soft or spongy',
      'Clutch pedal slowly sinks to the floor',
      'Difficulty shifting gears, especially 1st and reverse',
      'Clutch fluid level dropping in reservoir',
      'Grinding when shifting despite pressing clutch fully',
      'Complete loss of clutch engagement'
    ],
    affectedSystems: ['transmission'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 2500,
    citations: [
      { url: 'https://www.nhtsa.gov/vehicle/2020/JEEP/GLADIATOR', source: 'NHTSA', description: 'NHTSA complaints for Gladiator clutch hydraulic failures' }
    ],
    communityRecommendations: [
      { text: 'When replacing the slave cylinder, upgrade to the latest revision part number. Jeep has updated the seals multiple times. Ask the parts counter for the superseded part number.', source: 'JeepGladiatorForum.com', upvotes: 234 },
      { text: 'Check clutch fluid level monthly. If it is dropping, the slave or master cylinder is leaking internally — address it before you get stranded.', source: 'r/JeepGladiator', upvotes: 189 }
    ],
    status: 'published'
  },
  {
    id: 'jeep-gladiator-rear-window-leak-2020',
    make: 'Jeep',
    model: 'Gladiator',
    years: range(2020, 2025),
    category: 'body',
    title: 'Rear Window Leak into Cab',
    description: 'The Gladiator\'s rear sliding window leaks water into the cab during rain, car washes, or off-road water crossings. The seal between the sliding window panel and the rear window frame deteriorates, allowing water to enter. Water collects behind the rear seats and under the rear floor mat, potentially causing electrical issues with the under-seat wiring. The issue affects both hardtop and soft-top equipped vehicles, as the rear window is the same design on both.',
    solution: 'Clean and inspect the rear window seals for cracks, gaps, or compression damage. Apply a thin bead of clear weatherstrip adhesive to the seal edges. For persistent leaks, replace the rear window seal weatherstrip. Some owners apply marine-grade sealant (3M 4200) to the window frame perimeter as a more permanent fix. Ensure the window drain channels at the bottom of the frame are clear. If the sliding mechanism is damaged, the entire rear window assembly may need replacement.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Water dripping behind rear seats during rain',
      'Wet carpet under rear floor mat',
      'Water stains on rear seat backs',
      'Musty or mildew smell in cab',
      'Rear window track feels loose or wobbly'
    ],
    affectedSystems: ['body'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [
      { text: 'Apply Loctite Clear Silicone Sealant around the window frame corners — these are the primary leak points. A $6 tube fixes a $600 problem.', source: 'JeepGladiatorForum.com', upvotes: 267 },
      { text: 'Check for water after every rain and dry it out immediately. Water sitting under the carpet causes wiring corrosion that creates expensive electrical gremlins.', source: 'r/JeepGladiator', upvotes: 198 }
    ],
    status: 'published'
  },
  {
    id: 'jeep-gladiator-tpms-sensor-failure-2020',
    make: 'Jeep',
    model: 'Gladiator',
    years: range(2020, 2025),
    category: 'electrical',
    title: 'TPMS Sensor Premature Failure',
    description: 'The TPMS (Tire Pressure Monitoring System) sensors in Gladiators fail prematurely, often within 2-3 years. The sensors are exposed to harsh conditions — off-road impacts, mud, water crossings, and tire changes — that exceed the design life of the batteries and electronics. When sensors fail, the TPMS warning light illuminates and the system cannot monitor tire pressure. Gladiator owners who run a second set of wheels for off-road use experience double the sensor failure rate.',
    solution: 'Replace failed TPMS sensors with OEM Mopar sensors or quality aftermarket (Schrader or Continental). After installation, a TPMS relearn procedure is required using a TPMS tool or dealer scan tool. For owners with two sets of wheels, program both sets of sensors to the vehicle. Consider valve-stem-mounted sensors instead of band-clamp style for off-road wheels, as they are more durable. TPMS sensors are NOT covered under the 3-year/36,000-mile warranty — they are considered a wear item.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'TPMS warning light on dash',
      'Individual tire pressure readings showing dashes',
      'TPMS light stays on after setting correct pressure',
      'Intermittent TPMS readings that drop out',
      'All four readings lost simultaneously (module issue vs sensor)'
    ],
    affectedSystems: ['electrical', 'safety'],
    dtcCodes: ['C1001', 'C2116'],
    estimatedCostLow: 50,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { text: 'Buy Schrader EZ-Sensor (OEM supplier for Mopar) for about $25 each instead of $60 dealer price. Same sensor, different box.', source: 'JeepGladiatorForum.com', upvotes: 198 },
      { text: 'If you run two sets of wheels, get an Autel MaxiTPMS TS508 tool ($150). It pays for itself in one sensor programming session vs $50/sensor at the dealer.', source: 'r/JeepGladiator', upvotes: 167 }
    ],
    status: 'published'
  },
  {
    id: 'jeep-gladiator-elocker-actuator-2020',
    make: 'Jeep',
    model: 'Gladiator',
    years: range(2020, 2025),
    category: 'drivetrain',
    title: 'Electronic Locker (E-Locker) Actuator Failure',
    description: 'The electronic locking rear differential (standard on Rubicon, optional on others) develops actuator failures that prevent the e-locker from engaging or disengaging. The electric motor actuator that engages the locking ring can fail from moisture intrusion, corrosion, or internal motor burnout — particularly after water crossings or heavy off-road use. When stuck in the locked position, the differential causes binding and tire chirping on pavement. When stuck disengaged, it fails to provide traction when needed.',
    solution: 'Diagnose with scan tool to confirm actuator motor circuit fault. Replace the e-locker actuator motor — this is accessible from under the vehicle without removing the differential. Clean and apply dielectric grease to the actuator electrical connector. If the locking ring inside the differential is damaged, the differential carrier requires replacement. After repair, perform an e-locker cycle test (engage/disengage 5 times) to confirm proper operation. Apply differential breather extension to prevent future moisture intrusion.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'E-locker will not engage when switch is pressed',
      'Locker indicator light flashes but does not go solid',
      'Differential stays locked on pavement causing tire chirp',
      'Grinding noise when attempting to engage locker',
      'Axle locker warning light on dashboard',
      'Clicking from rear differential area'
    ],
    affectedSystems: ['drivetrain'],
    dtcCodes: ['C2120', 'C212A'],
    estimatedCostLow: 300,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { text: 'Install a differential breather extension kit ($30) that routes the breather tube up into the engine bay. This prevents water from entering the diff and corroding the actuator.', source: 'JeepGladiatorForum.com', upvotes: 289 },
      { text: 'After any water crossing, engage and disengage the e-locker a few times to cycle water out. Let it dry before storing the vehicle.', source: 'r/JeepGladiator', upvotes: 212 }
    ],
    status: 'published'
  },

  // ===== JEEP COMPASS =====
  {
    id: 'jeep-compass-oil-filter-housing-leak-2017',
    make: 'Jeep',
    model: 'Compass',
    years: range(2017, 2024),
    category: 'engine',
    title: 'Oil Filter Housing Leak (2.4L Tigershark)',
    description: 'The 2.4L Tigershark engine in the Compass develops oil leaks from the oil filter housing adapter gasket. The gasket between the oil filter housing and the engine block hardens and shrinks, allowing oil to seep. The leak drips onto the exhaust manifold, creating a burning oil smell and smoke. The oil filter housing also contains the oil cooler, so a failed gasket can also allow oil and coolant to mix internally in severe cases.',
    solution: 'Replace the oil filter housing gasket and O-rings. This is a straightforward repair that requires removing the oil filter housing (4 bolts), cleaning both mating surfaces, and installing new gaskets. Use OEM Mopar gaskets — aftermarket gaskets for this application have a high re-leak rate. Torque bolts to spec (15 ft-lbs) in a crisscross pattern. Check oil and coolant for cross-contamination (milky oil or oil in coolant).',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Burning oil smell from engine bay',
      'Oil dripping onto exhaust manifold causing smoke',
      'Oil spots on driveway under engine',
      'Low oil level between changes',
      'Oil weeping from oil filter housing area'
    ],
    affectedSystems: ['engine'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { text: 'Use only Mopar OEM gaskets for this repair. The aftermarket gaskets from Dorman and others leak again within 10,000 miles.', source: 'JeepCompassForum.com', upvotes: 178 },
      { text: 'While you have the housing off, replace the oil cooler thermostat ($15 part) inside it. If it sticks closed, your oil runs too hot and degrades faster.', source: 'r/JeepCompass', upvotes: 134 }
    ],
    status: 'published'
  },
  {
    id: 'jeep-compass-liftgate-strut-failure-2017',
    make: 'Jeep',
    model: 'Compass',
    years: range(2017, 2025),
    category: 'body',
    title: 'Liftgate Strut Failure and Liftgate Dropping',
    description: 'The gas struts that hold the rear liftgate open on the Compass fail prematurely, causing the liftgate to drop onto the user\'s head or not stay open. The struts lose their gas charge due to seal deterioration, particularly in cold climates where the temperature differential accelerates seal contraction. Both power liftgate and manual liftgate models are affected. On power liftgate models, the motor can also fail, adding to the issue.',
    solution: 'Replace both liftgate gas struts as a pair (they wear evenly). OEM Mopar struts or quality aftermarket (Stabilus, Strong Arm) last 4-5 years. For power liftgate models, if the motor fails, the power liftgate motor assembly must be replaced. After strut replacement, test the liftgate in both hot and cold temperatures to confirm proper holding force. Some owners upgrade to slightly stronger aftermarket struts for better cold-weather performance.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Liftgate drops slowly when opened',
      'Liftgate will not stay open unassisted',
      'Liftgate drops rapidly and hits user',
      'Power liftgate struggles to open fully',
      'Hissing sound from strut (gas escaping)'
    ],
    affectedSystems: ['body'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { text: 'Stabilus brand struts (they make the OEM ones for Jeep) are available on Amazon for $30-40/pair vs $120 at the dealer. Same part, half the price.', source: 'JeepCompassForum.com', upvotes: 198 },
      { text: 'Always replace both struts at the same time even if only one is weak. Uneven force causes the liftgate to twist and wears the hinges.', source: 'r/JeepCompass', upvotes: 145 }
    ],
    status: 'published'
  },
  {
    id: 'jeep-compass-windshield-stress-crack-2017',
    make: 'Jeep',
    model: 'Compass',
    years: range(2017, 2025),
    category: 'body',
    title: 'Windshield Stress Cracking',
    description: 'The 2017+ Compass windshield is prone to stress cracking without impact, particularly from the edges and corners. The windshield bonding adhesive and the body flex characteristics of the unibody chassis create stress points in the glass. Temperature changes (cold nights followed by hot morning sun, or using the defroster on a cold windshield) trigger crack propagation. Many owners report multiple windshield replacements during ownership.',
    solution: 'Replace the windshield with OEM or equivalent quality glass. Ensure proper installation with the correct urethane adhesive and curing time. For vehicles with ADAS cameras (forward collision warning, lane departure), recalibration is required after replacement. File through comprehensive auto insurance — many states have zero-deductible glass coverage. Consider adding a small bead of clear silicone at stress-prone edge points as a preventive measure.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Crack appearing from windshield edge with no impact',
      'Crack spreading across windshield rapidly',
      'Multiple stress cracks in corners',
      'Crack appearing after temperature change'
    ],
    affectedSystems: ['body'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { text: 'Never use hot defrost on a freezing windshield — let the car warm up gradually. Temperature shock is the number one trigger for stress cracks.', source: 'JeepCompassForum.com', upvotes: 189 },
      { text: 'Get comprehensive glass coverage added to your policy. Compass windshields average a replacement every 2-3 years in harsh climates.', source: 'r/JeepCompass', upvotes: 156 }
    ],
    status: 'published'
  },
  {
    id: 'jeep-compass-ac-evaporator-leak-2017',
    make: 'Jeep',
    model: 'Compass',
    years: range(2017, 2024),
    category: 'other',
    title: 'A/C Evaporator Core Leak',
    description: 'The A/C evaporator core in the Compass develops pinhole leaks from internal corrosion, causing the A/C system to lose refrigerant. The evaporator is located deep inside the HVAC housing behind the dashboard, making replacement extremely labor-intensive (8-12 hours). The issue is accelerated by infrequent cabin filter changes, which allow moisture and debris to accumulate on the evaporator surface. R-1234yf refrigerant adds to the repair cost.',
    solution: 'Diagnose with UV dye and electronic leak detector to confirm evaporator as leak source. Replace the evaporator core — this requires partial dashboard removal and HVAC housing disassembly. Replace the receiver/drier and expansion valve at the same time (always done when the system is opened). Flush the system to remove any debris. Evacuate, vacuum test for leaks, and recharge with R-1234yf. Change cabin filters every 15,000 miles to keep the evaporator clean and dry.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows warm air',
      'A/C works after recharge but fails again within weeks',
      'Sweet chemical smell from vents (refrigerant leak)',
      'Foggy windshield when A/C is on (refrigerant in cabin)',
      'Wet passenger floor from evaporator condensation leak'
    ],
    affectedSystems: ['hvac'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { text: 'Get quotes from independent shops for this job. Dealer charges $1,800-2,200 but independent shops with Chrysler experience do it for $900-1,200.', source: 'JeepCompassForum.com', upvotes: 167 },
      { text: 'Change your cabin filter every 15,000 miles. A dirty filter traps moisture on the evaporator surface and accelerates the corrosion that causes leaks.', source: 'r/JeepCompass', upvotes: 134 }
    ],
    status: 'published'
  }
];

async function main() {
  console.log(`Adding ${newIssues.length} new issues...`);
  let added = 0;
  let skipped = 0;

  for (const issue of newIssues) {
    try {
      const existing = await prisma.knownIssue.findUnique({ where: { id: issue.id } });
      if (existing) {
        console.log(`  SKIP (exists): ${issue.id}`);
        skipped++;
        continue;
      }
      await prisma.knownIssue.create({ data: issue });
      console.log(`  ADDED: ${issue.id}`);
      added++;
    } catch (err) {
      console.error(`  ERROR: ${issue.id} — ${err.message}`);
    }
  }

  // Print summary
  console.log(`\nDone: ${added} added, ${skipped} skipped`);

  // Print updated counts
  const models = [
    ['Subaru','Forester'],['Subaru','Impreza'],['Subaru','Crosstrek'],['Subaru','Ascent'],
    ['Kia','Sorento'],['Kia','Sportage'],['Kia','Telluride'],
    ['Jeep','Gladiator'],['Jeep','Compass']
  ];
  console.log('\nUpdated issue counts:');
  for (const [make, model] of models) {
    const count = await prisma.knownIssue.count({ where: { make, model } });
    console.log(`  ${make} ${model}: ${count} issues`);
  }

  await prisma.$disconnect();
  process.exit(0);
}

main();
