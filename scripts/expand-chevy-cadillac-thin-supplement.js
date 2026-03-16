/**
 * Supplement: add 1-2 more issues to Cadillac models that are still under 5
 * Lyriq(4), Catera(3), XT6(4), ATS(4), XT5(4), CT6(4), SRX(4)
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function yrs(s, e) {
  const a = [];
  for (let y = s; y <= e; y++) a.push(y);
  return a;
}

const extras = [
  // Lyriq needs 1 more
  {
    id: 'cadillac-lyriq-range-estimation-2023',
    make: 'Cadillac', model: 'Lyriq', years: yrs(2023, 2025),
    category: 'electrical', severity: 'low',
    title: 'Inaccurate Range Estimation in Cold Weather',
    description: 'The Lyriq range estimator significantly overestimates available range in cold weather, leading to range anxiety and potential strandings. The algorithm does not adequately account for cabin heating load, battery thermal management, and reduced battery chemistry efficiency in temperatures below 40F.',
    solution: 'GM has released OTA updates improving cold-weather range estimation accuracy. Pre-condition the battery while plugged in before departing in cold weather. Plan routes with 30% additional buffer in winter. Use the heated seats and steering wheel instead of cabin heat to maximize range.',
    symptoms: ['Range drops faster than predicted', 'Displayed range much higher than actual', 'Significant range loss in cold weather', 'Range estimate fluctuates widely'],
    affectedSystems: ['Battery management', 'Range estimation'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0
  },
  // Catera needs 2 more
  {
    id: 'cadillac-catera-window-regulator-1997',
    make: 'Cadillac', model: 'Catera', years: yrs(1997, 2001),
    category: 'electrical', severity: 'low',
    title: 'Power Window Regulator Cable Failure',
    description: 'The cable-driven power window regulators fail frequently, with the cable snapping or the motor burning out. The window drops into the door and cannot be raised. The Opel-sourced regulators are not as durable as other GM window systems and replacement parts can be difficult to source.',
    solution: 'Replace the window regulator assembly. Aftermarket units are available but verify fitment as the Catera uses Opel-specific parts. Lubricate the window channels with dry silicone spray during installation. Have spare door panel clips on hand as they break during removal.',
    symptoms: ['Window drops into door', 'Motor runs but window does not move', 'Grinding noise when operating window', 'Window moves slowly'],
    affectedSystems: ['Power windows'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 350
  },
  {
    id: 'cadillac-catera-transmission-slip-1997',
    make: 'Cadillac', model: 'Catera', years: yrs(1997, 2001),
    category: 'transmission', severity: 'medium',
    title: '4L30-E Automatic Transmission Harsh Shifts and Slipping',
    description: 'The GM 4L30-E automatic transmission develops harsh 1-2 and 2-3 shifts, slipping, and delayed engagement. The valve body wears internally and the torque converter clutch material contaminates the fluid. Neglected fluid changes accelerate the problems significantly.',
    solution: 'Service the transmission with a fluid and filter change first. If shifting does not improve, a valve body rebuild or replacement is needed. In severe cases, a transmission rebuild or replacement is the only option. Use Dexron III fluid as specified. Regular 30,000-mile fluid changes prevent most issues.',
    symptoms: ['Harsh shifting', 'Transmission slipping', 'Delayed engagement from Park', 'Flare on 2-3 shift', 'Check engine light'],
    affectedSystems: ['4L30-E automatic transmission'],
    dtcCodes: ['P0700', 'P0753'],
    estimatedCostLow: 200, estimatedCostHigh: 3000
  },
  // XT6 needs 1 more
  {
    id: 'cadillac-xt6-ptu-leak-2020',
    make: 'Cadillac', model: 'XT6', years: yrs(2020, 2025),
    category: 'drivetrain', severity: 'medium',
    title: 'AWD Power Transfer Unit Fluid Leak',
    description: 'The Power Transfer Unit (PTU) on AWD-equipped XT6 models develops seal leaks that allow fluid to seep out. Low PTU fluid causes the internal gears and bearings to wear prematurely, eventually producing a whining noise. The PTU is not included in routine maintenance schedules, so leaks often go unnoticed.',
    solution: 'Inspect the PTU seals and replace if leaking. Top off with the GM-specified PTU fluid. If the PTU is already noisy from running low on fluid, replacement is required as the unit is not rebuildable. Add PTU fluid level check to your routine maintenance schedule every 15,000 miles.',
    symptoms: ['Fluid leak near front of transmission', 'Whining noise from front drivetrain', 'AWD malfunction warning', 'Oil spots on driveway'],
    affectedSystems: ['Power transfer unit', 'AWD system'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 2000
  },
  // ATS needs 1 more
  {
    id: 'cadillac-ats-sunroof-drain-2013',
    make: 'Cadillac', model: 'ATS', years: yrs(2013, 2019),
    category: 'body', severity: 'low',
    title: 'Sunroof Drain Tube Clogging Causing Water Leaks',
    description: 'The sunroof drain tubes clog with debris, causing water to overflow into the headliner and A-pillar area during rain. The water can damage electronics, the headliner fabric, and cause musty odors from trapped moisture. The drain tubes are narrow and easily blocked by leaves and pollen.',
    solution: 'Clear the sunroof drain tubes using compressed air or a flexible wire. The tubes exit near the front fenders and rear quarter panels. Clean the sunroof trough of debris. Some owners install small mesh screens over the drain openings to prevent future clogging. Check drains seasonally.',
    symptoms: ['Water dripping from headliner', 'Wet carpet in footwell', 'Water stains on A-pillar', 'Musty smell in cabin', 'Water pooling in sunroof track'],
    affectedSystems: ['Sunroof drainage'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 200
  },
  // XT5 needs 1 more
  {
    id: 'cadillac-xt5-brake-vibration-2017',
    make: 'Cadillac', model: 'XT5', years: yrs(2017, 2025),
    category: 'brakes', severity: 'low',
    title: 'Front Brake Rotor Warping and Pedal Pulsation',
    description: 'The front brake rotors warp prematurely, causing steering wheel vibration and brake pedal pulsation during moderate to hard braking. The issue is attributed to the heavy vehicle weight combined with rotors that are borderline in thickness for the application. Aggressive braking or mountain driving accelerates warping.',
    solution: 'Replace the front brake rotors with quality aftermarket rotors that meet or exceed OEM thickness. Bed in the new rotors and pads properly with a series of moderate stops. Avoid hard braking followed by holding the brake (which creates hot spots). Upgrading to slotted rotors can help manage heat better.',
    symptoms: ['Steering wheel vibration when braking', 'Brake pedal pulsation', 'Vibration worse at highway speed braking', 'Uneven pad wear'],
    affectedSystems: ['Front brakes'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500
  },
  // CT6 needs 1 more
  {
    id: 'cadillac-ct6-headlight-condensation-2016',
    make: 'Cadillac', model: 'CT6', years: yrs(2016, 2020),
    category: 'exterior', severity: 'low',
    title: 'LED Headlight Housing Internal Condensation',
    description: 'The LED headlight assemblies develop internal condensation, creating a foggy appearance that reduces light output and looks unsightly on a luxury vehicle. The condensation is caused by failed seals or inadequate ventilation in the headlight housing. The issue is cosmetic at first but can damage LED drivers over time.',
    solution: 'Have the dealer inspect the headlight housing seals. If under warranty, the headlight assembly should be replaced. Aftermarket sealant repair is possible by removing the housing, drying it thoroughly, and resealing with silicone. Ensure the headlight breather vent is clear and functioning.',
    symptoms: ['Fog inside headlight lens', 'Reduced headlight brightness', 'Water droplets visible inside housing', 'Condensation worse after rain or car wash'],
    affectedSystems: ['Headlights'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 1500
  },
  // SRX needs 1 more
  {
    id: 'cadillac-srx-strut-mount-2010',
    make: 'Cadillac', model: 'SRX', years: yrs(2010, 2016),
    category: 'suspension', severity: 'medium',
    title: 'Front Strut Mount Bearing Failure and Clunking',
    description: 'The front strut mount bearings wear out prematurely, producing a clunking noise over bumps and a grinding sensation when turning the steering wheel. The rubber isolator portion also cracks, allowing increased noise and vibration into the cabin. The heavy vehicle weight accelerates bearing wear.',
    solution: 'Replace both front strut mounts and bearings. This is typically done during strut replacement. Use OEM-quality mounts with metal bearing races rather than all-rubber designs. A wheel alignment is required after strut mount replacement. Replace struts at the same time if they have over 60,000 miles.',
    symptoms: ['Clunk over bumps from front end', 'Grinding when turning steering wheel', 'Steering does not return to center', 'Increased road noise'],
    affectedSystems: ['Front suspension', 'Strut mounts'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 600
  }
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const issue of extras) {
    try {
      const existing = await prisma.knownIssue.findUnique({ where: { id: issue.id } });
      if (existing) {
        console.log(`  SKIP (exists): ${issue.id}`);
        skipped++;
        continue;
      }

      await prisma.knownIssue.create({
        data: {
          id: issue.id,
          make: issue.make,
          model: issue.model,
          years: issue.years,
          trims: [],
          engines: [],
          category: issue.category,
          title: issue.title,
          description: issue.description,
          solution: issue.solution,
          severity: issue.severity,
          confidence: 'medium',
          symptoms: issue.symptoms,
          affectedSystems: issue.affectedSystems,
          dtcCodes: issue.dtcCodes,
          estimatedCostLow: issue.estimatedCostLow,
          estimatedCostHigh: issue.estimatedCostHigh,
          citations: [],
          communityRecommendations: [],
          status: 'published'
        }
      });
      console.log(`  OK: ${issue.id}`);
      created++;
    } catch (err) {
      console.error(`  ERROR: ${issue.id} — ${err.message}`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);

  // Verify all models at 5+
  const models = [
    ['Cadillac', 'Lyriq'], ['Cadillac', 'Catera'], ['Cadillac', 'XT6'],
    ['Cadillac', 'ATS'], ['Cadillac', 'XT5'], ['Cadillac', 'CT6'], ['Cadillac', 'SRX']
  ];
  for (const [make, model] of models) {
    const c = await prisma.knownIssue.count({ where: { make, model } });
    console.log(`${make} ${model}: ${c}`);
  }

  const total = await prisma.knownIssue.count();
  console.log(`\nTotal DB issues: ${total}`);

  await prisma.$disconnect();
  pool.end();
}

main().catch(console.error);
