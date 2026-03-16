/**
 * Fix-up script: Add remaining issues for 10 models that still need 1-2 more to reach 5
 * Dodge Nitro (4→5), Shadow (3→5), Caliber (4→5), Viper (4→5)
 * GMC Sonoma (4→5)
 * Chrysler Aspen (4→5), Fifth Avenue (3→5), LeBaron (3→5), Concorde (4→5), Cirrus (4→5)
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function yrs(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const fixes = [
  // Dodge Nitro needs 1 more (has 4)
  {
    id: 'dodge-nitro-thermostat-housing-2007',
    make: 'Dodge', model: 'Nitro', years: yrs(2007, 2011),
    category: 'cooling',
    title: 'Thermostat Housing Leak and Overheating',
    description: 'The plastic thermostat housing cracks and leaks coolant, especially on the 3.7L V6. The housing is made of nylon composite that becomes brittle with heat exposure over time.',
    solution: 'Replace thermostat housing with updated design. Replace the thermostat and O-ring at the same time. Some owners upgrade to an aftermarket aluminum housing to prevent recurrence.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Coolant leak at front of engine', 'Overheating', 'Low coolant warning', 'Visible crack in housing'],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: ['P0128'],
    estimatedCostLow: 100, estimatedCostHigh: 300,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Shadow needs 2 more (has 3)
  {
    id: 'dodge-shadow-cv-joint-1990',
    make: 'Dodge', model: 'Shadow', years: yrs(1990, 1994),
    category: 'drivetrain',
    title: 'CV Axle Boot Tear and Joint Failure',
    description: 'The CV axle boots split from age and heat exposure, allowing grease to escape and contaminants to enter the joint. Once the boot fails, the CV joint wears rapidly and develops a clicking noise on turns.',
    solution: 'Replace the complete CV axle assembly (more cost-effective than just the boot). Aftermarket reman axles from Cardone or TRQ are affordable. Both inner and outer joints should be inspected.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Clicking noise on turns', 'Grease splatter on inner fender', 'Vibration during acceleration', 'Torn rubber boot visible'],
    affectedSystems: ['Drivetrain', 'Axle'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 300,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'dodge-shadow-cooling-fan-relay-1990',
    make: 'Dodge', model: 'Shadow', years: yrs(1990, 1994),
    category: 'cooling',
    title: 'Radiator Cooling Fan Relay Failure',
    description: 'The cooling fan relay fails, preventing the electric radiator fan from running. This causes overheating in traffic and at idle. The relay is mounted on the fender well and is exposed to engine heat and moisture.',
    solution: 'Replace the cooling fan relay. Test the fan motor directly with 12V to confirm the motor itself is still functional. Also check the coolant temperature sensor that triggers the relay.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Overheating at idle', 'Fan does not run in traffic', 'Temperature gauge climbs at red lights', 'A/C blows warm at idle'],
    affectedSystems: ['Cooling', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 30, estimatedCostHigh: 150,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Caliber needs 1 more (has 4)
  {
    id: 'dodge-caliber-rear-brake-seize-2007',
    make: 'Dodge', model: 'Caliber', years: yrs(2007, 2012),
    category: 'brakes',
    title: 'Rear Brake Caliper Seizure and Premature Pad Wear',
    description: 'Rear brake calipers seize due to corroded slide pins, causing uneven pad wear and pulling during braking. The integrated parking brake mechanism in the rear calipers is especially prone to sticking.',
    solution: 'Rebuild or replace rear brake calipers. Clean and lubricate caliper slide pins with silicone brake grease. Replace pads and rotors if unevenly worn. Exercise the parking brake regularly to prevent the mechanism from seizing.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vehicle pulls to one side when braking', 'Uneven rear pad wear', 'Burning smell from rear brakes', 'Parking brake will not hold or release'],
    affectedSystems: ['Brakes'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Dodge Viper needs 1 more (has 4)
  {
    id: 'dodge-viper-coolant-crossover-2008',
    make: 'Dodge', model: 'Viper', years: yrs(2008, 2017),
    category: 'cooling',
    title: 'Coolant Crossover Tube O-Ring Leak (Gen IV/V)',
    description: 'The aluminum coolant crossover tube at the front of the V10 engine develops O-ring leaks where it connects to the water pump and cylinder heads. The O-rings harden from heat cycling and allow coolant to weep.',
    solution: 'Replace the crossover tube O-rings with Viton high-temperature O-rings. The crossover tube must be removed for access. Inspect the tube itself for pitting or corrosion and replace if damaged.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Coolant weeping from front of engine', 'Low coolant level', 'Sweet smell from engine bay', 'Small coolant puddle after driving'],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 500,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // GMC Sonoma needs 1 more (has 4)
  {
    id: 'gmc-sonoma-door-handle-break-1994',
    make: 'GMC', model: 'Sonoma', years: yrs(1994, 2004),
    category: 'body',
    title: 'Exterior Door Handle Breakage',
    description: 'The plastic exterior door handles break at the pivot point, making it impossible to open the door from outside. The brittle plastic cracks in cold weather and from normal UV degradation over time.',
    solution: 'Replace exterior door handle (Dorman 77072 driver, 77073 passenger). The replacement is straightforward with removal of the inner door panel. Consider replacing both sides preventively as they fail at similar rates.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Door handle feels loose', 'Handle snaps off', 'Cannot open door from outside', 'Handle moves but door will not open'],
    affectedSystems: ['Body', 'Exterior'],
    dtcCodes: [],
    estimatedCostLow: 30, estimatedCostHigh: 150,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Aspen needs 1 more (has 4)
  {
    id: 'chrysler-aspen-control-arm-bushing-2007',
    make: 'Chrysler', model: 'Aspen', years: yrs(2007, 2009),
    category: 'suspension',
    title: 'Front Lower Control Arm Bushing Failure',
    description: 'The front lower control arm bushings wear out prematurely, causing clunking over bumps and imprecise steering. The Aspen shares its platform with the Dodge Durango and has the same front suspension weakness.',
    solution: 'Replace lower control arms with new bushings (complete arm replacement is easier than pressing new bushings). Moog RK620900 is a quality replacement. Alignment required after replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Clunking over bumps', 'Steering wander', 'Uneven front tire wear', 'Vibration at highway speed'],
    affectedSystems: ['Suspension', 'Steering'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Fifth Avenue needs 2 more (has 3)
  {
    id: 'chrysler-fifth-avenue-ac-compressor-1990',
    make: 'Chrysler', model: 'Fifth Avenue', years: yrs(1990, 1993),
    category: 'cooling',
    title: 'A/C Compressor Clutch and Refrigerant Leak',
    description: 'The A/C compressor clutch wears out and the system develops refrigerant leaks at aging O-rings and hose connections. Many Fifth Avenues still have R-12 systems that require conversion to R-134a for continued use.',
    solution: 'Replace A/C compressor clutch or full compressor. Convert R-12 system to R-134a with conversion kit (includes adapter fittings, R-134a compatible oil, and new receiver drier). Replace all O-rings during conversion.',
    severity: 'low', confidence: 'medium',
    symptoms: ['A/C blows warm', 'Clutch will not engage', 'Grinding from compressor', 'Refrigerant leak at fittings'],
    affectedSystems: ['HVAC', 'A/C'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 700,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-fifth-avenue-ball-joint-wear-1990',
    make: 'Chrysler', model: 'Fifth Avenue', years: yrs(1990, 1993),
    category: 'suspension',
    title: 'Front Ball Joint and Tie Rod End Wear',
    description: 'The front suspension ball joints and tie rod ends wear out from age, causing loose steering and clunking over bumps. The body-on-frame design with a heavy front end accelerates these wear items.',
    solution: 'Replace upper and lower ball joints and outer tie rod ends. Moog problem-solver parts are recommended for longer life. A front end alignment is required after any steering or suspension component replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Loose steering feel', 'Clunking over bumps', 'Uneven tire wear', 'Steering wheel off-center'],
    affectedSystems: ['Suspension', 'Steering'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler LeBaron needs 2 more (has 3)
  {
    id: 'chrysler-lebaron-power-window-motor-1990',
    make: 'Chrysler', model: 'LeBaron', years: yrs(1990, 1995),
    category: 'electrical',
    title: 'Power Window Motor Failure',
    description: 'Power window motors fail from worn brushes and aged wiring. The driver side window sees the most use and fails first. Corroded connectors in the door jamb harness can also cause intermittent window operation.',
    solution: 'Replace window motor. Check the wiring harness in the door jamb for broken wires where it flexes. Clean or replace corroded connectors. The master window switch should also be tested as a potential cause.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Window will not operate', 'Slow window movement', 'Intermittent window function', 'Motor clicks but window does not move'],
    affectedSystems: ['Electrical', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 250,
    citations: [], communityRecommendations: [], status: 'published'
  },
  {
    id: 'chrysler-lebaron-fuel-injector-leak-1990',
    make: 'Chrysler', model: 'LeBaron', years: yrs(1990, 1995),
    category: 'fuel',
    title: 'Fuel Injector Clogging and Leaking',
    description: 'Fuel injectors develop clogs and O-ring leaks from age and fuel deposit buildup. Clogged injectors cause misfires and poor fuel economy. Leaking injector O-rings create a fire hazard from fuel dripping onto the hot engine.',
    solution: 'Clean or replace fuel injectors. Professional ultrasonic cleaning restores most clogged injectors. Replace all injector O-rings with Viton (fuel-resistant) O-rings. Use fuel injector cleaner additive periodically as preventive maintenance.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Rough idle', 'Misfires', 'Fuel smell from engine bay', 'Poor fuel economy'],
    affectedSystems: ['Fuel', 'Engine'],
    dtcCodes: ['P0201', 'P0202', 'P0203', 'P0204'],
    estimatedCostLow: 100, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Concorde needs 1 more (has 4)
  {
    id: 'chrysler-concorde-ps-hose-leak-1993',
    make: 'Chrysler', model: 'Concorde', years: yrs(1993, 2004),
    category: 'steering',
    title: 'Power Steering Hose and Rack Leak',
    description: 'The power steering high-pressure hose develops leaks at the crimped fittings, and the rack and pinion can leak from worn seals. Low fluid from leaks causes pump whine and eventual pump failure.',
    solution: 'Replace the leaking high-pressure hose and inspect the rack and pinion for seal leaks. If the rack is leaking, replacement is more cost-effective than rebuilding. Use ATF+4 as the power steering fluid (Chrysler spec).',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Power steering fluid on ground', 'Whining when turning', 'Heavy steering effort', 'Low fluid in reservoir'],
    affectedSystems: ['Steering'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 600,
    citations: [], communityRecommendations: [], status: 'published'
  },

  // Chrysler Cirrus needs 1 more (has 4)
  {
    id: 'chrysler-cirrus-engine-mount-wear-1995',
    make: 'Chrysler', model: 'Cirrus', years: yrs(1995, 2000),
    category: 'engine',
    title: 'Engine and Transmission Mount Deterioration',
    description: 'Engine mounts and the front (dogbone) mount break down, causing excessive engine movement and vibration. The transverse engine layout puts heavy stress on the mounts during acceleration and braking.',
    solution: 'Replace all three engine/transmission mounts as a set. The upper (torque strut/dogbone) mount typically fails first. Aftermarket mounts from Anchor or DEA are affordable alternatives to OE.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Vibration at idle', 'Clunk shifting into gear', 'Engine rocks on acceleration', 'Vibration felt through steering wheel'],
    affectedSystems: ['Engine', 'Drivetrain'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: [], communityRecommendations: [], status: 'published'
  },
];

async function main() {
  console.log(`Creating ${fixes.length} fix-up issues...`);
  let created = 0;
  let skipped = 0;

  for (const issue of fixes) {
    try {
      const existing = await prisma.knownIssue.findUnique({ where: { id: issue.id } });
      if (existing) {
        console.log(`  SKIP (exists): ${issue.id}`);
        skipped++;
        continue;
      }
      await prisma.knownIssue.create({ data: issue });
      console.log(`  OK: ${issue.id}`);
      created++;
    } catch (err) {
      console.error(`  FAIL: ${issue.id} - ${err.message}`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);

  // Verify all 37 models
  console.log('\nFinal verification (all 37 models):');
  const allTargets = [
    { make: 'Dodge', models: ['Neon','Nitro','Stealth','Stratus','Avenger','Ram 1500','Ram 2500','Shadow','Ram Van','Caliber','Hornet','Viper','Intrepid','Ram 3500','Spirit'] },
    { make: 'GMC', models: ['Sonoma','C/K 1500','C/K 3500','Hummer EV SUV','Envoy','Savana','Jimmy','Suburban','Safari','C/K 2500','Canyon'] },
    { make: 'Chrysler', models: ['Aspen','Prowler','Fifth Avenue','LeBaron','Crossfire','Voyager','Concorde','New Yorker','LHS','300M','Cirrus'] },
  ];
  let allGood = true;
  for (const g of allTargets) {
    for (const m of g.models) {
      const count = await prisma.knownIssue.count({ where: { make: g.make, model: m } });
      const status = count === 5 ? 'OK' : 'MISMATCH';
      if (status !== 'OK') allGood = false;
      console.log(`  ${g.make} ${m}: ${count} [${status}]`);
    }
  }
  console.log(allGood ? '\nAll 37 models at 5 issues!' : '\nSome models still need attention.');

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
