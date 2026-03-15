/**
 * Beef up popular Chevrolet models with additional known issues.
 * Models: Malibu, Impala, Traverse, Cruze, Silverado 2500HD, Suburban, Bolt EV
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
  // CHEVROLET MALIBU (2004-2024) — currently 4 issues → 8+
  // ============================================
  {
    id: 'chevrolet-malibu-power-steering-motor-2013',
    make: 'Chevrolet',
    model: 'Malibu',
    years: yearRange(2013, 2024),
    category: 'steering',
    title: 'Electric Power Steering Motor Failure',
    description: 'The 2013+ Malibu uses an electric power steering (EPS) system with a column-mounted motor that is prone to failure. The motor develops internal faults causing intermittent or complete loss of power steering assist, making the car extremely difficult to steer at low speeds. GM issued TSB 18-NA-205 and NHTSA investigated numerous complaints. The steering column module and torque sensor can also fail, triggering a "Service Power Steering" message on the DIC.',
    solution: 'Have the EPS motor and torque sensor diagnosed with a scan tool — the module stores specific fault codes. Replacement of the EPS motor assembly costs $400-$800 for parts and $200-$400 for labor. In some cases, a software recalibration of the EPS module resolves intermittent faults. Check for applicable GM TSBs, as some vehicles may qualify for extended warranty coverage. Never ignore a power steering warning — sudden loss of assist at highway speed is a safety hazard.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      '"Service Power Steering" message on DIC',
      'Steering suddenly becomes very heavy',
      'Intermittent loss and return of power assist',
      'Steering wheel jerks or pulls to one side',
      'Warning light clears after restart but returns'
    ],
    affectedSystems: ['Steering', 'Electrical'],
    dtcCodes: ['C0545', 'C0710', 'U0073'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Do not ignore "Service Power Steering" warnings. Loss of power assist while turning at highway speed is extremely dangerous. Get it diagnosed immediately.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-malibu-6t40-shudder-2013',
    make: 'Chevrolet',
    model: 'Malibu',
    years: yearRange(2013, 2016),
    category: 'transmission',
    title: '6T40 Transmission Shudder and Harsh Shifts',
    description: 'The 2013-2016 Malibu with the 2.5L Ecotec engine uses the GM 6T40 6-speed automatic transmission that develops a pronounced shudder during light acceleration in the 25-45 mph range. The torque converter clutch wears prematurely, causing slippage and vibration that feels like driving on rumble strips. Harsh 1-2 and 2-3 shifts are also common. The 6T40 is sensitive to fluid condition and the issue worsens rapidly if the fluid is not changed on schedule.',
    solution: 'Perform a full transmission fluid exchange with ACDelco DEXRON VI ATF — a drain-and-fill three times (drive 500 miles between each) is most effective. If fluid change alone does not resolve the shudder, the torque converter needs replacement ($800-$1,500 including labor). GM released TCM software updates that modify shift points to reduce harsh shifting — ask the dealer for the latest calibration. Avoid aggressive driving until the issue is resolved, as continued torque converter slippage generates damaging heat.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Shudder or vibration at 25-45 mph under light throttle',
      'Harsh 1-2 and 2-3 upshifts',
      'Transmission hesitation or delayed engagement',
      'Rumble strip sensation during gentle acceleration',
      'Shudder disappears under hard acceleration'
    ],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0741', 'P0751', 'P0756'],
    estimatedCostLow: 150,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Change the 6T40 fluid every 30,000 miles — GM lifetime fill claim is nonsense. A $150 fluid change prevents a $2,000 torque converter replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-malibu-oil-consumption-ecotec-2013',
    make: 'Chevrolet',
    model: 'Malibu',
    years: yearRange(2013, 2020),
    category: 'engine',
    title: 'Excessive Oil Consumption (2.5L Ecotec LCV/LKW)',
    description: 'The 2.5L Ecotec 4-cylinder engine in the 2013-2020 Malibu consumes oil at a rate well beyond what GM considers normal, with some owners reporting 1 quart every 1,500-2,000 miles. The piston rings do not properly seat against the cylinder walls, allowing oil to pass into the combustion chamber. The issue is exacerbated by the use of 0W-20 oil specified by GM. There is no visible external leak — the oil is burned internally and exits through the exhaust.',
    solution: 'Monitor oil level at every fuel stop and top off as needed with 0W-20 or 5W-30 synthetic oil. GM considers up to 1 quart per 2,000 miles "acceptable," but an oil consumption test at the dealer can document excessive use for warranty claims. For out-of-warranty vehicles, switching to a slightly heavier 5W-30 oil can reduce consumption. Severe cases require piston ring replacement ($2,000-$3,500). An Italian tune-up (sustained highway driving at higher RPM) can temporarily help by burning carbon off the rings.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Oil level low between oil changes',
      'Need to add 1+ quart every 2,000 miles',
      'No visible oil leaks under vehicle',
      'Blue-grey smoke from exhaust on hard acceleration',
      'Oil smell from exhaust'
    ],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P0171', 'P0300', 'P0301'],
    estimatedCostLow: 0,
    estimatedCostHigh: 3500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Keep a quart of oil in the trunk and check the dipstick weekly. Running a quart low can damage the engine. Document your oil consumption with receipts for a potential warranty claim.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-malibu-trunk-latch-failure-2008',
    make: 'Chevrolet',
    model: 'Malibu',
    years: yearRange(2008, 2024),
    category: 'body',
    title: 'Trunk Latch and Release Failure',
    description: 'The trunk latch mechanism on the Malibu fails due to a worn release cable, broken latch spring, or faulty trunk release actuator motor. Owners report the trunk will not open via the key fob, interior button, or the trunk release button on the lid. In some cases, the trunk will not latch closed and pops open while driving. Water intrusion into the latch mechanism accelerates corrosion and failure, especially in northern salt-belt states.',
    solution: 'Replace the trunk latch assembly ($50-$150 for the part) and inspect the release cable for fraying or binding. Labor is typically 1-2 hours ($100-$200). If the trunk will not open at all, access the latch through the rear seat pass-through (fold down the center armrest) and manually release it. Lubricate the latch mechanism with white lithium grease after replacement to prevent future corrosion. Check the trunk seal for damage that may be allowing water into the latch area.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Trunk will not open from key fob or button',
      'Trunk pops open unexpectedly while driving',
      'Trunk release button clicks but trunk does not open',
      'Have to slam trunk multiple times to latch',
      'Grinding noise from trunk latch area'
    ],
    affectedSystems: ['Body', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 350,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'If the trunk will not open at all, fold down the rear center armrest and reach through the pass-through opening to manually pull the emergency release cable inside the trunk.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-malibu-ac-compressor-clutch-2008',
    make: 'Chevrolet',
    model: 'Malibu',
    years: yearRange(2008, 2020),
    category: 'cooling',
    title: 'A/C Compressor Clutch Failure',
    description: 'The A/C compressor clutch on the Malibu fails due to a burned-out clutch coil, worn clutch plate, or bearing failure in the compressor pulley. When the clutch fails, the A/C blows warm air because the compressor cannot engage. A squealing or grinding noise from the serpentine belt area is common before total failure. The compressor clutch can also seize, which will shred the serpentine belt and cause a loss of all belt-driven accessories (alternator, power steering, water pump).',
    solution: 'On some models, the A/C clutch assembly can be replaced independently ($100-$200 for parts, $200-$400 labor) without replacing the entire compressor. If the compressor itself has failed internally (metallic debris in the system), the entire compressor must be replaced along with the receiver/drier, expansion valve, and a system flush ($800-$1,500 total). Always evacuate and recharge the system with the correct amount of R-134a refrigerant after any compressor work.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows warm air',
      'Squealing or grinding noise from engine belt area',
      'A/C cycles on and off rapidly',
      'Burning smell from engine bay when A/C is on',
      'Serpentine belt shredding or falling off'
    ],
    affectedSystems: ['HVAC', 'Engine'],
    dtcCodes: ['B0408', 'P0533'],
    estimatedCostLow: 200,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'If you hear grinding from the compressor, turn off the A/C immediately. A seized compressor will destroy the serpentine belt, leaving you without alternator, power steering, and water pump.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHEVROLET IMPALA (1994-2020) — currently 4 issues → 8+
  // ============================================
  {
    id: 'chevrolet-impala-4t65e-failure-2000',
    make: 'Chevrolet',
    model: 'Impala',
    years: yearRange(2000, 2013),
    category: 'transmission',
    title: '4T65-E Transmission Failure and Hard Shifts',
    description: 'The 4T65-E automatic transmission used in the 2000-2013 Impala is one of the most failure-prone GM transmissions. Common failures include the 1-2 accumulator piston cracking (causing harsh 1-2 shift), pressure control solenoid failure (erratic shifts and slipping), and the forward clutch hub cracking (complete loss of forward gears). The 3.8L supercharged models are especially hard on the 4T65-E due to higher torque output. Many 4T65-E transmissions fail between 80,000-120,000 miles.',
    solution: 'For early-stage issues (harsh shifts, slipping), a fluid change with ACDelco DEXRON VI and a pressure control solenoid replacement ($200-$400) may resolve the problem. Once the transmission is slipping badly or has lost a gear, a rebuild ($2,000-$3,000) or remanufactured transmission ($2,500-$3,500 installed) is required. When rebuilding, upgrade the 1-2 accumulator piston to the updated design and install a TransGo shift kit ($50) for improved durability. Change fluid every 30,000 miles to maximize the life of this transmission.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Harsh or banging 1-2 shift',
      'Transmission slipping under acceleration',
      'Loss of 3rd or 4th gear',
      'Delayed engagement when shifting to Drive',
      'Check engine light with transmission codes',
      'Burnt fluid smell from dipstick'
    ],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0741', 'P0742', 'P1811', 'P0751'],
    estimatedCostLow: 200,
    estimatedCostHigh: 3500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Change the 4T65-E fluid every 30,000 miles with DEXRON VI — not "lifetime fill." GM stopped calling it lifetime fill because these transmissions were failing in droves. A $150 fluid change is cheap insurance against a $3,000 rebuild.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-impala-intake-manifold-gasket-2000',
    make: 'Chevrolet',
    model: 'Impala',
    years: yearRange(2000, 2005),
    category: 'engine',
    title: 'Intake Manifold Gasket Leak (3.4L/3.8L V6)',
    description: 'The 3.4L and 3.8L V6 engines in 2000-2005 Impalas use Dex-Cool compatible intake manifold gaskets that deteriorate over time, causing coolant to leak externally or internally into the oil. External leaks appear as dried orange coolant trails on the engine block. Internal leaks contaminate the engine oil with coolant, turning it into a milky sludge that can destroy the engine bearings. This was one of the most widespread GM engine problems of the era and led to multiple class-action lawsuits.',
    solution: 'Replace both intake manifold gaskets with the updated Fel-Pro design (not the original GM plastic gaskets). Parts cost $30-$80 for a quality gasket set. Labor is 4-6 hours ($400-$700) due to the need to remove the upper and lower intake manifolds, fuel rail, and wiring. If coolant has mixed with oil (milky dipstick), perform multiple oil changes in rapid succession to flush the contamination. Check the oil frequently after repair to ensure no internal damage occurred.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Orange/pink coolant leaking on engine block',
      'Milky or chocolate-milk colored oil on dipstick',
      'Coolant level dropping with no visible external leak',
      'White smoke from exhaust',
      'Overheating at idle',
      'Sweet coolant smell from engine bay'
    ],
    affectedSystems: ['Engine', 'Cooling'],
    dtcCodes: ['P0171', 'P0174', 'P0128'],
    estimatedCostLow: 300,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'If your oil looks milky or foamy on the dipstick, STOP DRIVING immediately. Coolant-contaminated oil will destroy the engine bearings within a few hundred miles. Tow the car to a shop.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Use Fel-Pro updated intake manifold gaskets — NOT the original GM plastic design. The Fel-Pro gaskets use a metal carrier with improved sealing material that does not deteriorate with Dex-Cool coolant.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-impala-ignition-switch-recall-2003',
    make: 'Chevrolet',
    model: 'Impala',
    years: yearRange(2003, 2006),
    category: 'electrical',
    title: 'Ignition Switch Failure and Recall (NHTSA 14V-394)',
    description: 'The 2003-2006 Impala was included in the massive GM ignition switch recall affecting millions of vehicles. The ignition switch has a weak detent spring that allows the key to slip from the "Run" position to the "Accessory" or "Off" position while driving. When this happens, the engine shuts off, the power steering and brake boost are lost, and the airbags are disabled — all without warning. The issue is exacerbated by heavy key chains that add weight and leverage on the ignition cylinder. This defect was linked to numerous fatalities.',
    solution: 'Check the NHTSA recall database (NHTSA.gov) with your VIN — this is recall 14V-394 and the repair is FREE at any GM dealer regardless of mileage or ownership history. The dealer replaces the ignition switch assembly with an updated design that has a stronger detent spring. Until the recall is completed, remove all extra keys and accessories from your key chain — use only the vehicle key with nothing else attached. NEVER ignore this recall; it is a critical safety issue.',
    severity: 'critical',
    confidence: 'high',
    symptoms: [
      'Engine shuts off unexpectedly while driving',
      'Key turns to accessory position on its own',
      'Airbag warning light illuminated',
      'Power steering lost suddenly',
      'Dashboard goes dark momentarily while driving',
      'Stalling when hitting bumps or turning'
    ],
    affectedSystems: ['Electrical', 'Safety', 'Ignition'],
    dtcCodes: ['B0100', 'U1000', 'B1000'],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'This recall is FREE at any GM dealer forever — there is no time or mileage limit. Check NHTSA.gov with your VIN immediately. This defect has caused fatalities. Do not drive the car with extra weight on the key chain.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-impala-window-regulator-2006',
    make: 'Chevrolet',
    model: 'Impala',
    years: yearRange(2006, 2020),
    category: 'electrical',
    title: 'Power Window Regulator and Motor Failure',
    description: 'The power window regulators in the 2006-2020 Impala fail frequently, causing windows to fall into the door, move slowly, or stop working entirely. The cable-style regulator uses thin steel cables that fray and break, or the motor gears strip. The driver window is the most commonly affected due to highest usage. In cold weather, ice can bind the window in the channel and burn out the motor when the switch is pressed. Some owners report windows falling into the door with a loud clunk.',
    solution: 'Replace the window regulator assembly ($60-$150 for parts) — always replace the regulator and motor as a unit since the motor is often damaged by a failed regulator. Labor is 1-2 hours per window ($100-$250). The door panel must be removed for access. Buy a quality aftermarket regulator (Dorman is widely available) or OEM ACDelco. In cold weather, never force a frozen window — use the defroster to warm the door seal before attempting to operate the window.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Window falls into the door suddenly',
      'Window moves slowly or stops partway',
      'Grinding or clicking noise when operating window',
      'Window switch clicks but window does not move',
      'Window operates intermittently'
    ],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Replace the regulator and motor as a complete assembly. The motor is often damaged by a failed regulator, and replacing just the regulator with a worn motor means you will be doing the job again soon.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-impala-intermediate-shaft-clunk-2006',
    make: 'Chevrolet',
    model: 'Impala',
    years: yearRange(2006, 2020),
    category: 'steering',
    title: 'Steering Intermediate Shaft Clunk',
    description: 'The intermediate steering shaft on the 2006-2020 Impala develops a clunk or pop felt through the steering wheel when turning, especially at low speeds and when going over bumps. The intermediate shaft connects the steering column to the steering gear and uses a slip joint that loses its lubrication over time, causing a binding and releasing action that creates the clunk. The noise is most noticeable when turning while going over speed bumps or entering driveways. GM issued TSB 08-02-32-007 for this issue.',
    solution: 'The intermediate shaft can be temporarily improved by injecting lithium grease into the slip joint through a small hole drilled in the shaft boot. The permanent fix is replacement of the intermediate steering shaft with the updated GM design ($150-$300 for parts, $100-$200 labor). The updated shaft has improved lubrication retention. Some owners apply grease every 6-12 months as a cheaper maintenance approach rather than full replacement.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Clunk or pop felt in steering wheel when turning',
      'Noise when turning over bumps or uneven surfaces',
      'Steering feels notchy or catches during turns',
      'Clunk most noticeable at low speeds',
      'Pop when going from left to right turn'
    ],
    affectedSystems: ['Steering'],
    dtcCodes: [],
    estimatedCostLow: 30,
    estimatedCostHigh: 500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Before paying for a new intermediate shaft, try injecting white lithium grease into the slip joint. Pull back the rubber boot, inject grease, and work the shaft back and forth. This fixes the clunk for 6-12 months and costs $5.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHEVROLET TRAVERSE (2009-2025) — currently 3 issues → 8
  // ============================================
  {
    id: 'chevrolet-traverse-timing-chain-stretch-2009',
    make: 'Chevrolet',
    model: 'Traverse',
    years: yearRange(2009, 2017),
    category: 'engine',
    title: 'Timing Chain Stretch and Failure (3.6L V6 LLT/LFX)',
    description: 'The 3.6L V6 (LLT and LFX variants) in the first-generation Traverse is notorious for premature timing chain stretch. The engine uses three timing chains — one primary and two secondary chains driving the variable valve timing actuators. The chains stretch beyond the tensioner capacity, causing the engine timing to slip. Symptoms progress from a rattle on cold start to a check engine light with camshaft correlation codes. If ignored, the stretched chains can skip teeth, causing catastrophic engine damage. The issue typically manifests between 80,000-120,000 miles.',
    solution: 'Replace all three timing chains, tensioners, guides, and VVT actuator solenoids. This is a major repair requiring 10-15 hours of labor because the engine must be partially removed or the front cover fully disassembled. Parts cost $300-$600 for a complete timing kit; labor runs $1,200-$2,500. Total cost: $1,500-$3,500. GM extended warranty coverage to 10 years/120,000 miles on some model years (Special Coverage 14311). Always replace all three chains together — replacing just one is false economy as the others will fail soon after.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Rattling or clattering noise on cold start',
      'Check engine light with camshaft position codes',
      'Rough idle that improves as engine warms up',
      'Reduced engine power',
      'Engine misfires',
      'Metallic rattling from front of engine'
    ],
    affectedSystems: ['Engine', 'Timing'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 3500,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Do not ignore a cold-start rattle on the 3.6L V6. Stretched timing chains will eventually skip teeth and destroy the engine. The repair costs $2,000-$3,000 but an engine replacement costs $5,000-$8,000.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Check if your Traverse qualifies for GM Special Coverage 14311 — extended timing chain warranty to 10 years/120,000 miles on certain VINs. Call your dealer with your VIN to check.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-traverse-9speed-shudder-2018',
    make: 'Chevrolet',
    model: 'Traverse',
    years: yearRange(2018, 2025),
    category: 'transmission',
    title: '9-Speed Automatic Transmission Shudder (9T65)',
    description: 'The second-generation Traverse (2018+) uses the GM 9T65 9-speed automatic transmission that suffers from a shudder during light acceleration in the 25-50 mph range. The torque converter clutch chatters during lockup, producing a vibration that feels like driving on a rumble strip. The 9-speed also exhibits harsh downshifts, hunting between gears on hills, and delayed engagement from Park. GM has released multiple TCM software updates to address the shifting behavior, but the underlying torque converter weakness remains.',
    solution: 'Start with a dealer visit for the latest TCM software calibration — GM has released numerous updates that improve 9-speed behavior. A full transmission fluid exchange with Mobil 1 LV ATF HP (DEXRON HP specification) can significantly reduce or eliminate the shudder. If both steps fail, the torque converter needs replacement ($1,500-$2,500 including labor). Some owners have had success with a complete transmission replacement under warranty. Change the 9T65 fluid every 45,000 miles as preventive maintenance.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Shudder or vibration at 25-50 mph under light throttle',
      'Harsh downshifts when coasting',
      'Transmission hunting between gears on hills',
      'Delayed engagement from Park to Drive',
      'Hesitation on acceleration from low speeds'
    ],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0741', 'P0717', 'P0796'],
    estimatedCostLow: 150,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Ask the dealer for the LATEST TCM recalibration. GM has released many revisions and each one improves shift quality. If they say the software is up to date, ask for the specific version number and compare with GM forums.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-traverse-ac-evaporator-leak-2009',
    make: 'Chevrolet',
    model: 'Traverse',
    years: yearRange(2009, 2017),
    category: 'cooling',
    title: 'A/C Evaporator Core Leak',
    description: 'The first-generation Traverse (2009-2017) develops A/C evaporator leaks that cause loss of refrigerant and warm air from the vents. The evaporator core, located inside the dashboard HVAC housing, corrodes internally due to moisture and acid buildup from the refrigerant-oil mixture. The leak is slow enough that the A/C may work fine early in summer but gradually loses cooling as refrigerant escapes over weeks. The evaporator is extremely labor-intensive to access, making this one of the most expensive A/C repairs.',
    solution: 'The evaporator core must be replaced, which requires removing the entire dashboard assembly to access the HVAC housing — 8-12 hours of labor ($800-$1,500). The evaporator core itself costs $100-$300. Also replace the expansion valve and receiver/drier while the system is apart ($50-$100 additional). Total repair: $1,200-$2,500. As a temporary fix, a refrigerant recharge with UV dye ($100-$200) will restore cooling for weeks to months, but the leak will return. Always check for evaporator leaks before spending money on other A/C diagnostics.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'A/C blows warm air gradually over weeks',
      'A/C works after recharge but fails again',
      'Musty smell from vents (moisture from leak)',
      'Water dripping inside passenger footwell',
      'A/C low pressure reading with no visible leak'
    ],
    affectedSystems: ['HVAC', 'Cooling'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 2500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Before paying for a full evaporator replacement, get a UV dye injection and A/C recharge. If the system holds for the whole summer, you can recharge annually for $100-$150 — much cheaper than a $2,000 evaporator repair on an older vehicle.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-traverse-liftgate-strut-failure-2009',
    make: 'Chevrolet',
    model: 'Traverse',
    years: yearRange(2009, 2025),
    category: 'body',
    title: 'Power Liftgate Strut Failure',
    description: 'The Traverse power liftgate struts lose gas pressure over time, causing the liftgate to drop slowly when opened or slam shut unexpectedly. On models with power liftgate, the electric motor can also fail, leaving the liftgate inoperative via the button. The struts typically fail between 5-8 years, with cold weather accelerating the failure as the gas charge loses pressure faster at low temperatures. A dropping liftgate is a safety concern, especially when loading cargo or with children nearby.',
    solution: 'Replace both liftgate struts as a pair ($50-$120 for a pair of gas struts). This is a simple DIY repair — the struts have ball-socket ends that pop off with a small pry tool (15-minute job). For power liftgate models, if the electric motor has failed, the motor assembly costs $200-$500 and requires 1-2 hours of labor to replace. StrongArm and Sachs/Stabilus are quality aftermarket strut brands. Always replace both struts at the same time — they wear at the same rate.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Liftgate drops slowly when opened',
      'Liftgate slams shut unexpectedly',
      'Have to hold liftgate up manually',
      'Power liftgate button does not work',
      'Liftgate opens only partway in cold weather'
    ],
    affectedSystems: ['Body', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 600,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Liftgate gas struts are a 15-minute DIY job. Buy a pair for $50-$80 on Amazon, pop off the old ones with a flathead screwdriver, and snap the new ones on. No tools needed beyond a pry tool.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-traverse-oil-consumption-3-6l-2009',
    make: 'Chevrolet',
    model: 'Traverse',
    years: yearRange(2009, 2023),
    category: 'engine',
    title: 'Engine Oil Consumption (3.6L V6)',
    description: 'The 3.6L V6 in the Traverse consumes oil at a rate that many owners find unacceptable, particularly on 2009-2017 models with the LLT and LFX engine variants. Owners report consuming 1 quart every 2,000-3,000 miles. The oil consumption is related to piston ring design and the PCV system routing oil vapor back into the intake. The issue is not accompanied by visible external leaks. GM has acknowledged elevated oil consumption on the 3.6L but considers up to 1 quart per 2,000 miles within their acceptable range.',
    solution: 'Check oil level at every fuel stop and top off as needed. Use the GM-specified dexos1 Gen 3 approved 5W-30 synthetic oil. An oil consumption test at the dealer involves measuring consumption over a set mileage interval — if it exceeds GM limits, warranty coverage may apply. For out-of-warranty vehicles, using a slightly heavier 5W-40 European-spec oil can reduce burn-off. Severe cases may require piston ring replacement ($2,500-$4,000) or valve stem seal replacement ($1,000-$2,000).',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Oil level drops 1 quart every 2,000-3,000 miles',
      'Low oil pressure warning light',
      'No visible oil leaks',
      'Slight blue smoke on hard acceleration',
      'Fouled spark plugs from oil contamination'
    ],
    affectedSystems: ['Engine', 'Lubrication'],
    dtcCodes: ['P06DE', 'P0521'],
    estimatedCostLow: 0,
    estimatedCostHigh: 4000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'The 3.6L V6 low oil pressure warning must be taken seriously — the oil pressure sensor is real, not a false alarm. Stop driving immediately if the warning appears. Continuing to drive with low oil pressure will destroy the engine bearings.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHEVROLET CRUZE (2011-2019) — currently 3 issues → 8
  // ============================================
  {
    id: 'chevrolet-cruze-turbo-oil-feed-line-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    years: yearRange(2011, 2016),
    category: 'engine',
    title: 'Turbo Oil Feed Line Leak (1.4T LUJ/LUV)',
    description: 'The turbocharger oil feed line on the first-generation Cruze 1.4T develops leaks at the banjo fitting connections to the turbo and the engine block. The line uses crush washers that degrade over time, and the line itself can crack due to heat cycling. Oil drips onto the exhaust manifold, creating a burning oil smell and visible smoke from the engine bay. If the oil feed is severely restricted by a damaged line, the turbocharger bearings will be starved of oil and fail catastrophically within a few thousand miles.',
    solution: 'Replace the turbo oil feed line and both banjo bolt crush washers ($30-$80 for parts). The repair takes 1-2 hours ($100-$250 labor) and requires removal of the engine cover and heat shields for access. Inspect the turbocharger for shaft play while the line is disconnected — excessive play indicates bearing damage from oil starvation. Use a new OEM-style braided line rather than reusing the original rigid line. After the repair, run the engine and check for leaks before reinstalling heat shields.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Burning oil smell from engine bay',
      'Smoke visible from under hood',
      'Oil dripping on exhaust manifold',
      'Oil spots under vehicle near front',
      'Turbo whine or bearing noise developing'
    ],
    affectedSystems: ['Engine', 'Turbocharger'],
    dtcCodes: ['P0299', 'P0234'],
    estimatedCostLow: 50,
    estimatedCostHigh: 400,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'A leaking turbo oil feed line is not just a mess — it can starve the turbo bearings and destroy a $1,200 turbocharger. Fix the $50 oil line before it becomes a $1,200 turbo replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-cruze-pcv-valve-cover-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    years: yearRange(2011, 2016),
    category: 'engine',
    title: 'PCV Valve Cover Failure and Oil Leak (1.4T)',
    description: 'The 1.4T engine in the first-generation Cruze has the PCV system integrated into the valve cover assembly. The PCV diaphragm ruptures, the check valve fails, or the valve cover gasket deteriorates, causing oil leaks, vacuum leaks, rough idle, and check engine lights. The failed PCV system creates excess crankcase pressure that pushes oil past seals and into the intake manifold. This is the same fundamental design flaw as the Equinox and Malibu 1.5T PCV system. GM released an updated valve cover with improved PCV components.',
    solution: 'Replace the entire valve cover assembly, which includes the integrated PCV system ($80-$200 for parts). Labor is 1-2 hours ($100-$250). Use the updated GM valve cover design (GM part 55573746 or later revision) with the improved PCV diaphragm. After replacement, check the intake manifold and intercooler for oil contamination — clean any oil found. Also replace the valve cover gasket even if using the same cover, as the gasket is a common secondary leak source.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Rough idle, especially when cold',
      'Check engine light with lean or misfire codes',
      'Oil leaking from valve cover area',
      'Whistling or hissing noise from engine (vacuum leak)',
      'Oil in intake manifold or intercooler piping',
      'Excessive oil consumption'
    ],
    affectedSystems: ['Engine', 'Emissions'],
    dtcCodes: ['P0171', 'P0106', 'P0300', 'P1101'],
    estimatedCostLow: 100,
    estimatedCostHigh: 450,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'When replacing the valve cover, also check the intake manifold runner and the turbo inlet pipe for oil contamination. A blown PCV diaphragm pushes oil into the entire intake system.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-cruze-coolant-water-outlet-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    years: yearRange(2011, 2016),
    category: 'cooling',
    title: 'Coolant Leak from Water Outlet / Thermostat Housing',
    description: 'The plastic water outlet (thermostat housing) on the 1.4T Cruze cracks and leaks coolant. The housing is made of plastic that becomes brittle from heat cycling and cracks at the mounting flange or the hose connection points. Coolant leaks externally onto the engine and can drip onto the serpentine belt, causing squealing and belt degradation. The leak is often slow initially but can progress to a significant coolant loss that leads to overheating. This is one of the most common failure points on the first-gen Cruze 1.4T engine.',
    solution: 'Replace the water outlet housing with the updated GM design ($30-$80 for parts). Some owners opt for an aftermarket aluminum water outlet ($60-$120) that eliminates the plastic cracking issue permanently. Labor is 1-2 hours ($100-$200). Replace the thermostat at the same time since it is integrated into or accessible through the housing ($15-$30). Top off coolant with Dex-Cool and bleed the cooling system thoroughly — the Cruze is prone to air pockets after cooling system work.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Coolant dripping from passenger side of engine',
      'Low coolant warning on DIC',
      'Sweet coolant smell from engine bay',
      'Serpentine belt squealing (coolant on belt)',
      'Engine temperature rising above normal',
      'Visible crack in plastic water outlet'
    ],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: ['P0128', 'P0597'],
    estimatedCostLow: 50,
    estimatedCostHigh: 350,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Upgrade to a billet aluminum water outlet housing — aftermarket options from Dorman or PRM cost $60-$100 and will never crack like the factory plastic piece. Best $60 you can spend on a Cruze 1.4T.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-cruze-6t40-shudder-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    years: yearRange(2011, 2015),
    category: 'transmission',
    title: '6T40 Transmission Shudder (Gen 1)',
    description: 'The first-generation Cruze with the 6T40 automatic transmission develops a shudder during torque converter lockup in the 25-45 mph range. The torque converter clutch friction material wears and generates debris that contaminates the fluid, worsening the shudder over time in a vicious cycle. The shudder feels like driving over a textured road surface and is most noticeable during gentle acceleration. The 6T40 in the Cruze sees more stress than in larger vehicles because the 1.4T engine produces torque at low RPM, keeping the converter locked more often.',
    solution: 'Perform a complete transmission fluid exchange (not just a drain and fill) using ACDelco DEXRON VI ATF. Three drain-and-fill cycles with 500 miles of driving between each gives the best results. If the shudder persists after fresh fluid, the torque converter needs replacement ($800-$1,500 including labor). A TCM software update at the dealer can modify lockup behavior to reduce shudder. Change the 6T40 fluid every 30,000 miles to prevent the issue from developing.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Vibration or shudder at 25-45 mph',
      'Shudder under light throttle application',
      'Rumble strip feeling during gentle acceleration',
      'Shudder disappears under heavy throttle',
      'Harsh or rough shifts between gears'
    ],
    affectedSystems: ['Transmission', 'Drivetrain'],
    dtcCodes: ['P0741', 'P0742'],
    estimatedCostLow: 150,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Do three drain-and-fill cycles 500 miles apart for the best results. A single drain only replaces about 40% of the fluid — three cycles gets you to 85%+ fresh fluid.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-cruze-intake-manifold-runner-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    years: yearRange(2011, 2016),
    category: 'engine',
    title: 'Intake Manifold Runner Control Failure (1.4T)',
    description: 'The intake manifold on the 1.4T Cruze has variable-length intake runners controlled by an internal flap actuator. The actuator motor fails or the runner flaps stick due to carbon buildup and oil contamination (especially when the PCV valve cover has also failed). When the runners stick open or closed, the engine loses low-end torque, idles rough, and throws a check engine light. The plastic runner flap pivots can also break, sending debris into the intake port and potentially the cylinder.',
    solution: 'Clean the intake manifold runner flaps with throttle body cleaner and check the actuator motor for proper operation ($100-$200 for cleaning). If the actuator motor has failed, replacement costs $80-$200 for the part and 1-2 hours of labor. If the runner flaps are broken or cracked, the entire intake manifold assembly must be replaced ($200-$400 for parts, $200-$400 labor). Address any PCV valve cover failures first, as oil contamination from a failed PCV system accelerates carbon buildup on the runner flaps.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Check engine light with intake manifold codes',
      'Loss of low-end torque and sluggish acceleration',
      'Rough idle',
      'Engine hesitation during acceleration',
      'Rattling noise from intake manifold area'
    ],
    affectedSystems: ['Engine', 'Intake'],
    dtcCodes: ['P2070', 'P2071', 'P0106'],
    estimatedCostLow: 100,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Fix the PCV valve cover first before addressing intake manifold runner issues. Oil from a blown PCV diaphragm coats the runner flaps and causes them to stick. Fixing the intake without fixing the PCV means the problem will return.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHEVROLET SILVERADO 2500HD (1999-2025) — currently 3 issues → 8
  // ============================================
  {
    id: 'chevrolet-silverado-2500hd-cp4-fuel-pump-2011',
    make: 'Chevrolet',
    model: 'Silverado 2500HD',
    years: yearRange(2011, 2016),
    category: 'fuel',
    title: 'CP4 High-Pressure Fuel Pump Failure (LML/LGH Duramax)',
    description: 'The 2011-2016 Duramax 6.6L diesel uses a Bosch CP4.2 high-pressure fuel injection pump that is prone to catastrophic self-destruction. The CP4 has tight internal tolerances and is not designed for the lower lubricity of American diesel fuel (compared to European diesel). When the pump fails, it sends metallic debris through the entire high-pressure fuel system, contaminating the fuel rails, injectors, and fuel lines. A single CP4 failure typically destroys $8,000-$12,000 worth of fuel system components.',
    solution: 'Preventive: Install a CP4 disaster prevention kit ($300-$500) that adds a fuel filter and catch can between the CP4 pump and the fuel rail to trap debris before it reaches the injectors. For a failed CP4, the entire high-pressure fuel system must be replaced or flushed: CP4 pump, all 8 injectors, both fuel rails, high-pressure lines, and the fuel tank must be cleaned. Total cost: $8,000-$12,000 at a diesel shop. The most reliable upgrade is replacing the CP4 with a CP3 conversion kit ($2,500-$3,500 installed), which uses the more robust pump from the 2001-2010 Duramax.',
    severity: 'critical',
    confidence: 'high',
    symptoms: [
      'Engine cranks but will not start',
      'Metallic debris in fuel filter',
      'Loss of power followed by stalling',
      'Hard starting that progressively worsens',
      'Check engine light with fuel pressure codes',
      'Metal shavings in fuel system'
    ],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0087', 'P0088', 'P0093', 'P228D'],
    estimatedCostLow: 300,
    estimatedCostHigh: 12000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Install a CP4 disaster prevention kit BEFORE the pump fails. A $400 prevention kit saves you from a $10,000 fuel system replacement. This is the single most important modification for any 2011-2016 Duramax.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Add a fuel lubricity additive (Hot Shot Diesel Extreme or Stanadyne) at every fill-up. American diesel fuel has lower lubricity than European diesel, which the CP4 was designed for. Additives help protect the pump.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-silverado-2500hd-injector-harness-chafe-2001',
    make: 'Chevrolet',
    model: 'Silverado 2500HD',
    years: yearRange(2001, 2016),
    category: 'electrical',
    title: 'Injector Wiring Harness Chafing (Duramax)',
    description: 'The fuel injector wiring harness on the Duramax diesel routes across the top of the engine under the valve covers. The harness rubs against the valve cover and rocker arms, causing the insulation to wear through and the wires to short or open. When an injector wire is damaged, the affected cylinder misfires, the engine runs rough, and white smoke pours from the exhaust. The chafing is accelerated by engine vibration and can affect multiple cylinders over time. GM released updated harness routing clips but the fundamental design has the harness in a high-wear location.',
    solution: 'Remove the valve covers and inspect the injector harness for chafing (requires 2-3 hours labor). Damaged sections can be repaired with heat-shrink tubing and solder ($100-$300 for repair). If the harness is severely damaged in multiple places, a complete replacement harness costs $200-$500 and takes 3-5 hours to install. Add additional harness routing clips and protective loom to prevent recurrence. Some diesel specialists reroute the harness outside the valve cover (external harness conversion) to eliminate the chafing issue permanently.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Engine misfires on one or more cylinders',
      'White smoke from exhaust',
      'Rough idle that develops gradually',
      'Check engine light with injector circuit codes',
      'Engine runs on fewer than 8 cylinders',
      'Intermittent misfires that come and go'
    ],
    affectedSystems: ['Electrical', 'Fuel', 'Engine'],
    dtcCodes: ['P0201', 'P0202', 'P0203', 'P0204', 'P0205', 'P0206', 'P0207', 'P0208'],
    estimatedCostLow: 100,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Inspect the injector harness whenever you have the valve covers off for any reason. Adding protective loom and rerouting clips takes 30 minutes and prevents a $500 harness replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-silverado-2500hd-transfer-case-encoder-1999',
    make: 'Chevrolet',
    model: 'Silverado 2500HD',
    years: yearRange(1999, 2025),
    category: 'drivetrain',
    title: 'Transfer Case Encoder Motor Failure',
    description: 'The transfer case encoder motor on the Silverado 2500HD (NP246/NP261/NP263 transfer cases) fails, preventing the vehicle from shifting between 2WD, 4WD High, and 4WD Low. The encoder motor is mounted on the outside of the transfer case and uses an electric motor with a position sensor to actuate the shift fork. Moisture ingress, corrosion, and worn motor brushes cause intermittent or complete failure. The "Service 4WD" message appears on the DIC, and the transfer case may get stuck in one mode. Failure is more common in salt-belt states.',
    solution: 'Replace the transfer case encoder motor ($100-$250 for parts, $100-$200 labor). The motor is externally mounted on the transfer case and accessible from underneath the vehicle. Also inspect and replace the transfer case wiring connector if corroded — moisture wicking up the connector wires is a common cause of encoder motor failure. After replacement, use a scan tool to relearn the encoder motor position. Apply dielectric grease to the electrical connector to prevent future moisture ingress.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      '"Service 4WD" message on dashboard',
      'Transfer case will not shift out of 2WD',
      'Transfer case stuck in 4WD',
      'Grinding noise when attempting to shift transfer case',
      '4WD indicator light flashing',
      'Clunking when shifting between 2WD and 4WD'
    ],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: ['C0327', 'C0387', 'C0569'],
    estimatedCostLow: 100,
    estimatedCostHigh: 450,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Apply dielectric grease to the encoder motor connector when you install the new one. Moisture wicking up the harness connector is the #1 cause of premature encoder motor failure.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-silverado-2500hd-exhaust-manifold-bolts-1999',
    make: 'Chevrolet',
    model: 'Silverado 2500HD',
    years: yearRange(1999, 2025),
    category: 'exhaust',
    title: 'Exhaust Manifold Bolt Failure',
    description: 'The exhaust manifold bolts on both the gas V8 (5.3L, 6.0L, 6.6L) and Duramax diesel engines in the Silverado 2500HD are notorious for breaking due to thermal cycling. The bolts snap flush with the cylinder head, causing an exhaust leak that produces a ticking or tapping noise on cold start that quiets as the manifold expands and seals when warm. Broken bolts can also cause exhaust fumes to enter the cabin through the HVAC fresh air intake. The passenger side manifold on V8 gas engines is the most commonly affected.',
    solution: 'Broken bolts must be drilled out and the holes retapped or repaired with thread inserts (HeliCoil or Time-Sert). This is a skilled repair — the bolt remnants are hardened steel embedded in an aluminum or cast iron head. Cost varies widely: $300-$800 if all bolts can be drilled out successfully, $1,000-$2,000 if a head needs to be removed for access to a deeply broken bolt. Use the updated GM exhaust manifold bolt kit which uses higher-grade bolts and locking flanges. Apply anti-seize compound to all new bolts.',
    severity: 'medium',
    confidence: 'high',
    symptoms: [
      'Ticking or tapping noise on cold start that fades when warm',
      'Exhaust smell in cabin at idle or low speed',
      'Visible soot staining around exhaust manifold',
      'Exhaust leak sound from engine bay',
      'Failed emissions inspection for exhaust leak'
    ],
    affectedSystems: ['Exhaust', 'Engine'],
    dtcCodes: ['P0430', 'P0420'],
    estimatedCostLow: 300,
    estimatedCostHigh: 2000,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Do not ignore exhaust manifold bolt failure — exhaust fumes entering the cabin through the HVAC system contain carbon monoxide. This is a health and safety issue, not just a noise annoyance.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-silverado-2500hd-steering-stabilizer-2001',
    make: 'Chevrolet',
    model: 'Silverado 2500HD',
    years: yearRange(2001, 2025),
    category: 'steering',
    title: 'Steering Stabilizer Failure and Death Wobble',
    description: 'The front steering stabilizer (steering damper) on the Silverado 2500HD wears out, contributing to a front-end shimmy or "death wobble" at highway speeds after hitting a bump. The steering stabilizer is a shock absorber that dampens oscillation in the front suspension — when it fails, worn ball joints, tie rod ends, or wheel bearings can trigger an uncontrollable front-end shimmy. Lifted trucks with larger tires are especially susceptible because the added unsprung weight amplifies the oscillation.',
    solution: 'Replace the steering stabilizer as a first step ($40-$100 for parts, $50-$100 labor). However, the stabilizer often masks worn front-end components — inspect all ball joints, tie rod ends, wheel bearings, and track bar bushings. Replace any worn components found. A comprehensive front-end alignment ($100-$150) should follow any steering component replacement. For lifted trucks, an upgraded dual steering stabilizer kit ($150-$300) provides better oscillation damping. Proper tire balance is critical — even slight imbalance can trigger the wobble.',
    severity: 'high',
    confidence: 'medium',
    symptoms: [
      'Violent steering wheel oscillation after hitting a bump',
      'Front-end shimmy at highway speeds',
      'Steering wheel vibration at 55-70 mph',
      'Loose or wandering steering feel',
      'Wobble that requires slowing down significantly to stop'
    ],
    affectedSystems: ['Steering', 'Suspension'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 1500,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'Death wobble is dangerous — do not just replace the stabilizer and assume the problem is fixed. The stabilizer masks worn components. Have EVERY front-end component inspected: ball joints, tie rods, wheel bearings, track bar.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHEVROLET SUBURBAN (1992-2025) — currently 4 issues → 8+
  // ============================================
  {
    id: 'chevrolet-suburban-afm-dfm-lifter-failure-2007',
    make: 'Chevrolet',
    model: 'Suburban',
    years: yearRange(2007, 2025),
    category: 'engine',
    title: 'AFM/DFM Lifter Failure (5.3L/6.2L V8)',
    description: 'The Active Fuel Management (AFM) and Dynamic Fuel Management (DFM) systems on the 5.3L and 6.2L V8 engines deactivate cylinders to save fuel by collapsing hydraulic valve lifters. These lifters have a complex locking pin mechanism that fails, causing the lifter to collapse and the affected cylinder to misfire. A collapsed lifter can also damage the camshaft lobe it rides on, turning a $300 lifter into a $3,000 camshaft and lifter replacement. The issue affects 2007+ Suburbans and is one of the most complained-about GM V8 problems. GM switched from 4-cylinder AFM to 17-pattern DFM in 2019, but lifter failures continue.',
    solution: 'Replace the failed lifter(s) and inspect the camshaft for damage. A single-side lifter replacement (one bank of 8 lifters) costs $1,500-$2,500 including labor. If the camshaft is damaged, add $500-$1,000 for a new cam and installation. Many owners opt to replace all 16 lifters and delete the AFM/DFM system with an AFM delete kit ($200-$400) and a custom tune that disables cylinder deactivation. This eliminates the root cause but requires a tuner ($400-$600). GM range device ($300) is a plug-in alternative that keeps all cylinders active without a tune.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'Engine misfire on one or more cylinders',
      'Ticking or tapping noise from engine',
      'Check engine light with misfire codes',
      'Rough idle',
      'Reduced engine power',
      'P0300 random misfire or specific cylinder misfire code'
    ],
    affectedSystems: ['Engine', 'Valvetrain'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 4000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Install an AFM/DFM delete kit and tune when replacing lifters. Without the delete, new AFM lifters will fail again — it is a matter of when, not if. The delete costs $600-$1,000 extra but eliminates the root cause permanently.', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'A Range Technology AFM/DFM disabler ($300) plugs into the OBD port and keeps all 8 cylinders active. It is reversible and does not require a tune. Good preventive measure before lifters fail.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-suburban-dashboard-cracking-2007',
    make: 'Chevrolet',
    model: 'Suburban',
    years: yearRange(2007, 2014),
    category: 'interior',
    title: 'Dashboard Cracking',
    description: 'The dashboard on 2007-2014 Suburbans develops extensive cracking across the top surface due to UV exposure and heat cycling. The dashboard material shrinks and hardens over time, causing deep fissures that spread across the full width of the dash. The cracking is worst in southern and southwest states with intense sun exposure, but affects vehicles nationwide. GM was the subject of multiple class-action lawsuits over this defect across the GMT900 platform (Tahoe, Suburban, Silverado, Yukon). The cracked dashboard is a cosmetic and resale value issue.',
    solution: 'GM settled a class-action lawsuit and offered reimbursement for dashboard replacements on some model years — check if your VIN qualifies by contacting GM customer service. A new OEM dashboard costs $1,500-$3,000 installed. More practical solutions include a Coverlay molded dashboard cover ($200-$350) that fits over the cracked dash and looks nearly factory, or a DashMat fabric cover ($50-$100). Some owners have the dashboard professionally recovered at an upholstery shop ($500-$1,200). Always use a windshield sunshade when parked to slow further deterioration.',
    severity: 'low',
    confidence: 'high',
    symptoms: [
      'Deep cracks spreading across dashboard surface',
      'Dashboard material hard and brittle',
      'Cracking progressing from center outward',
      'Pieces of dashboard material breaking off',
      'Reflective glare from cracked surface'
    ],
    affectedSystems: ['Interior'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 3000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Check if your VIN qualifies for the GM class-action dashboard settlement. Even years after the settlement, GM has honored some claims. Contact GM customer care at 1-800-222-1020 with your VIN.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-suburban-rear-ac-line-corrosion-2007',
    make: 'Chevrolet',
    model: 'Suburban',
    years: yearRange(2007, 2020),
    category: 'cooling',
    title: 'Rear A/C Line Corrosion and Leak',
    description: 'The Suburban has a rear A/C system with refrigerant lines that run the full length of the vehicle underneath, exposed to road salt, debris, and moisture. These aluminum and steel lines corrode through, especially at the connections and where the lines are clamped to the frame. When a line corrodes through, the entire A/C system loses its refrigerant charge and both front and rear A/C stop working. The rear lines are particularly vulnerable because they are in the splash zone behind the rear wheels. This is a widespread issue in northern salt-belt states.',
    solution: 'Replace the corroded rear A/C lines ($200-$600 for parts). Labor is 2-4 hours ($200-$500) as the lines must be routed under the vehicle. The entire A/C system must be evacuated before repair and recharged afterward ($100-$200 for evacuation and recharge). Also replace the receiver/drier ($30-$60) whenever the system has been open to the atmosphere. Some shops fabricate replacement lines from copper tubing and compression fittings, which resists corrosion better than the OEM steel lines. Apply undercoating or wax coating to new lines to prevent future corrosion.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Front and rear A/C both stop cooling',
      'A/C works after recharge but fails again quickly',
      'Visible corrosion or green residue on A/C lines under vehicle',
      'Oily refrigerant stain on A/C line connections',
      'Hissing sound from under vehicle when A/C is on'
    ],
    affectedSystems: ['HVAC', 'Cooling'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 1200,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'After replacing the rear A/C lines, spray them with rubberized undercoating or Fluid Film to protect against future corrosion. The OEM lines corrode because they have no corrosion protection from the factory.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-suburban-transfer-case-fluid-leak-2000',
    make: 'Chevrolet',
    model: 'Suburban',
    years: yearRange(2000, 2025),
    category: 'drivetrain',
    title: 'Transfer Case Fluid Leak',
    description: 'The transfer case on the 4WD Suburban develops fluid leaks from the front and rear output shaft seals, the input shaft seal, or the case halves where the case splits. The NP246 (half-ton) and NP261/NP263 (heavy-duty) transfer cases all share this tendency. Low transfer case fluid causes the internal clutch pack to overheat and burn, leading to expensive internal damage. The rear output seal is the most common leak source, and the leak often drips onto the exhaust, creating a burning fluid smell. Many owners do not realize the transfer case has its own fluid that needs periodic changing.',
    solution: 'Replace the leaking seal(s) — the rear output shaft seal is $10-$20 for the part and 1-2 hours of labor ($100-$250). The front output seal is similar but harder to access. If the case halves are leaking, resealing requires splitting the case ($400-$800 labor). Check the transfer case fluid level every oil change and change the fluid every 50,000 miles with the GM-specified Auto-Trak II (NP246) or DEXRON VI (NP261/NP263). Low fluid is a transfer case killer — check before it is too late.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Fluid dripping from transfer case area',
      'Burning fluid smell from under vehicle',
      'Grinding or whining noise from transfer case',
      'Difficulty shifting between 2WD and 4WD',
      'Transfer case overheating',
      'Fluid stain on driveway near center of vehicle'
    ],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 1000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Add transfer case fluid level checks to your oil change routine. The transfer case has its own fluid that most owners never think about. Low fluid destroys the internal clutch pack — a $50 seal replacement becomes a $2,000 transfer case rebuild.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-suburban-steering-column-lock-2015',
    make: 'Chevrolet',
    model: 'Suburban',
    years: yearRange(2015, 2025),
    category: 'steering',
    title: 'Steering Column Lock and Click Noise',
    description: 'The 2015+ Suburban uses an electronic steering column lock that can malfunction, causing a clicking noise from the steering column, failure to recognize the key fob, or preventing the vehicle from starting. The electronic lock module replaces the traditional key-cylinder lock and communicates with the body control module (BCM) to verify the key fob is present before allowing the engine to start. When the lock module fails, it may click repeatedly without unlocking, or it may not engage at all, leaving the steering unlocked even when the vehicle is off.',
    solution: 'The steering column lock actuator module needs replacement ($150-$400 for parts, $200-$400 labor). The module is located inside the steering column and requires partial disassembly to access. A scan tool is needed to program the new module to the BCM after installation. In some cases, a BCM software update at the dealer resolves the clicking without hardware replacement. If the vehicle will not start due to a failed lock module, a tow to the dealer is required — there is no manual override.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Rapid clicking noise from steering column',
      'Vehicle will not start — "Steering Column Lock" message',
      'Key fob not detected despite fresh battery',
      'Steering wheel does not lock when vehicle is off',
      'Intermittent no-start condition',
      'Multiple clicks before engine starts'
    ],
    affectedSystems: ['Steering', 'Electrical', 'Security'],
    dtcCodes: ['B1325', 'B2958', 'U0140'],
    estimatedCostLow: 150,
    estimatedCostHigh: 800,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'If the steering column is clicking but the vehicle still starts, get it diagnosed soon — the module is degrading and will eventually fail completely, leaving you stranded. This is not a noise you can ignore.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },

  // ============================================
  // CHEVROLET BOLT EV (2017-2023) — currently 3 issues → 8
  // ============================================
  {
    id: 'chevrolet-bolt-ev-battery-fire-recall-2017',
    make: 'Chevrolet',
    model: 'Bolt EV',
    years: yearRange(2017, 2022),
    category: 'electrical',
    title: 'High-Voltage Battery Fire Risk Recall (NHTSA 21V-560)',
    description: 'All 2017-2022 Bolt EV and 2022 Bolt EUV vehicles were subject to a massive recall for battery fire risk. LG Energy Solution manufactured battery cells with two simultaneous defects — a torn anode tab and a folded separator — that could cause an internal short circuit and thermal runaway (fire) during charging, particularly when the battery was charged to 100%. Multiple Bolt EVs caught fire while parked and charging, leading GM to halt sales and production temporarily. GM ultimately replaced every battery module in every affected vehicle at no cost.',
    solution: 'Check your VIN at my.chevrolet.com/recalls or NHTSA.gov. All affected Bolts receive a FREE complete battery module replacement with updated LG cells that do not have the manufacturing defects. The replacement also includes updated battery management software and an extended 8-year/100,000-mile warranty on the new battery. If you have not had the recall completed, schedule it immediately at any Chevrolet dealer. Until the recall is completed, GM advises: do not charge above 90%, do not deplete below 70 miles of range, do not charge indoors overnight, and park outside away from structures.',
    severity: 'critical',
    confidence: 'high',
    symptoms: [
      'Recall notification from GM or NHTSA',
      'Battery warning messages on dashboard',
      'Charging stopped or limited by vehicle software',
      'Vehicle limits charging to 90% automatically',
      'Burning smell or smoke from under vehicle (EMERGENCY: call 911)'
    ],
    affectedSystems: ['Battery', 'Electrical', 'Safety'],
    dtcCodes: ['P0A80', 'P1E00', 'P1FFF'],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    citations: [],
    communityRecommendations: [
      { type: 'warning', content: 'This recall is FREE and includes a brand-new battery pack with an extended warranty. There is NO reason not to complete it. Schedule it at your dealer immediately — battery fires can occur while parked and charging.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-bolt-ev-battery-degradation-2017',
    make: 'Chevrolet',
    model: 'Bolt EV',
    years: yearRange(2017, 2023),
    category: 'electrical',
    title: 'Battery Capacity Degradation Over Time',
    description: 'The Bolt EV 60/65 kWh battery pack experiences capacity degradation over time, reducing the vehicle range from the original EPA rating. Early 2017-2018 models with the original LG battery showed faster degradation, losing 10-15% capacity in the first 50,000 miles. Vehicles that received the recall battery replacement generally show slower degradation rates. Factors that accelerate degradation include frequent DC fast charging, regularly charging to 100%, leaving the battery at full charge for extended periods, and exposure to extreme heat. The battery management system (BMS) also recalibrates periodically, which can cause sudden apparent range drops.',
    solution: 'Use the Hilltop Reserve or Target Charge Level feature to limit charging to 80-90% for daily driving — this significantly reduces degradation. Avoid DC fast charging for daily use; save it for road trips. The Bolt EV battery has an 8-year/100,000-mile warranty covering degradation below 60% of original capacity. Vehicles that received the recall battery get a new warranty starting from the replacement date. Monitor battery capacity using the Energy screen or a Torque Pro app with an OBD-II adapter to track state of health over time.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Reduced range compared to when vehicle was new',
      'Full charge shows fewer estimated miles',
      'Range drops significantly in cold weather',
      'Battery percentage drops faster than expected',
      'GOM (Guess-O-Meter) range estimate increasingly inaccurate'
    ],
    affectedSystems: ['Battery', 'Electrical'],
    dtcCodes: ['P1E00', 'P0A80'],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Set your daily charge limit to 80% and only charge to 100% before long trips. Lithium-ion batteries degrade faster when kept at high state of charge. This single habit extends battery life significantly.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-bolt-ev-infotainment-ghosting-2017',
    make: 'Chevrolet',
    model: 'Bolt EV',
    years: yearRange(2017, 2023),
    category: 'electrical',
    title: 'Infotainment Screen Ghosting and Flickering',
    description: 'The 10.2-inch infotainment touchscreen in the Bolt EV develops ghost touch inputs, screen flickering, unresponsive areas, and random screen blackouts. The screen registers phantom touches that change radio stations, adjust climate controls, or activate features without driver input. The issue is caused by a failing digitizer layer in the touchscreen or a loose ribbon cable connection behind the display. Hot weather and direct sunlight on the screen exacerbate the ghosting behavior. The issue affects both the original infotainment system and the updated system in 2020+ models.',
    solution: 'Perform a system reset by holding the Home and Fast Forward buttons simultaneously for 10 seconds. If ghosting persists, the display panel needs replacement ($500-$1,000 for parts, $200-$400 labor). A loose ribbon cable behind the display can sometimes be reseated without replacing the entire screen — ask the technician to check this first ($100-$200 diagnostic). Some owners have resolved minor ghosting by installing a tempered glass screen protector, which insulates the digitizer from temperature-induced phantom touches.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'Screen registers touches that did not happen',
      'Radio station changes by itself',
      'Climate controls adjust without input',
      'Screen flickers or goes black intermittently',
      'Touchscreen unresponsive in certain areas',
      'Ghost touches worse in hot weather or direct sun'
    ],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: ['U0155', 'U0151'],
    estimatedCostLow: 0,
    estimatedCostHigh: 1400,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Try a system reset first: hold Home + Fast Forward for 10 seconds. This clears corrupted software that can cause phantom inputs. If the issue is hardware (digitizer failure), the screen needs replacement.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-bolt-ev-dcfc-speed-reduction-2017',
    make: 'Chevrolet',
    model: 'Bolt EV',
    years: yearRange(2017, 2023),
    category: 'electrical',
    title: 'DC Fast Charging Speed Reduction After Battery Recall',
    description: 'After the battery recall replacement, many Bolt EV owners report significantly reduced DC fast charging (DCFC) speeds. Where the pre-recall Bolt could sustain 50+ kW at a CCS fast charger, post-recall vehicles often cap at 30-40 kW. GM updated the battery management software to be more conservative with thermal management, limiting charging power to protect the new battery from the conditions that caused the original fire risk. The reduced charging speed adds 15-30 minutes to fast charging sessions on road trips. Cold weather further reduces charging speeds.',
    solution: 'There is currently no fix — the reduced charging speed is an intentional software limitation by GM to protect the replacement battery. Precondition the battery before arriving at a fast charger by setting navigation to a DC fast charge station (the Bolt will warm the battery en route, improving charging speed by 10-20%). Avoid fast charging when the battery is below 20% or above 80% for best charging rates. Some aftermarket tools can monitor BMS temperature limits, but modifying the charging software voids the battery warranty.',
    severity: 'low',
    confidence: 'medium',
    symptoms: [
      'DC fast charging peaks at 30-40 kW instead of 50+ kW',
      'Charging sessions take significantly longer than before recall',
      'Charging speed drops rapidly above 50% SOC',
      'Charging extremely slow in cold weather',
      'Battery temperature limiting message during fast charge'
    ],
    affectedSystems: ['Battery', 'Charging'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Set a DC fast charge station as your navigation destination 30+ minutes before arrival. The Bolt will precondition (warm) the battery, which significantly improves charging speed compared to arriving with a cold battery.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  },
  {
    id: 'chevrolet-bolt-ev-front-motor-bearing-2017',
    make: 'Chevrolet',
    model: 'Bolt EV',
    years: yearRange(2017, 2023),
    category: 'drivetrain',
    title: 'Front Drive Motor Bearing Noise',
    description: 'The front electric drive motor in the Bolt EV develops a whining, humming, or grinding noise from the motor bearings as mileage increases. The single-speed reduction gear unit contains bearings that wear over time, particularly in vehicles driven frequently at highway speeds where the motor spins at high RPM. The noise is speed-dependent (gets louder with speed) and is most noticeable with the radio off and windows up. The Bolt is otherwise a quiet vehicle, making the bearing noise particularly noticeable. Some owners describe it as a "gear whine" that develops after 50,000-80,000 miles.',
    solution: 'The drive unit bearings are not serviceable individually — the entire drive unit assembly must be replaced or rebuilt. A new drive unit from GM costs $3,000-$5,000 plus $500-$1,000 labor. Some EV specialty shops can rebuild the drive unit with new bearings for $1,500-$2,500. The Bolt EV powertrain warranty covers the drive unit for 8 years/100,000 miles — have the noise documented at a dealer while under warranty. Changing the drive unit fluid (Dexron HP) at 75,000-mile intervals may help prevent premature bearing wear.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: [
      'Whining noise that increases with vehicle speed',
      'Humming or buzzing from front of vehicle',
      'Grinding noise at highway speeds',
      'Noise louder during acceleration than coasting',
      'Vibration felt through floorboard at speed'
    ],
    affectedSystems: ['Drivetrain', 'Electric Motor'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 5000,
    citations: [],
    communityRecommendations: [
      { type: 'tip', content: 'Document the bearing noise at a dealer visit BEFORE your 8-year/100,000-mile powertrain warranty expires. Even if they say it is "normal," having it on record establishes a warranty claim if it worsens after expiration.', upvotes: 0, needsReview: true }
    ],
    status: 'published'
  }
];

async function main() {
  console.log(`Inserting ${issues.length} new Chevrolet known issues...`);
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
    { make: 'Chevrolet', model: 'Malibu' },
    { make: 'Chevrolet', model: 'Impala' },
    { make: 'Chevrolet', model: 'Traverse' },
    { make: 'Chevrolet', model: 'Cruze' },
    { make: 'Chevrolet', model: 'Silverado 2500HD' },
    { make: 'Chevrolet', model: 'Suburban' },
    { make: 'Chevrolet', model: 'Bolt EV' }
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
