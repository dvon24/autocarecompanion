#!/usr/bin/env node
/**
 * Add Lincoln known issues — Ford luxury division.
 *
 * Uses the audit-before-publish gate (insertPendingIssue) — every entry
 * lands as status='pending_review' until verified via WebSearch and
 * flipped by publish-verified-issues.js.
 *
 * Source bias: well-documented platform-shared issues (e.g. 3.5L EcoBoost
 * timing chain ~ Ford F-150, Aviator water-pump-in-V ~ Explorer ST,
 * Navigator 5.4L 3V spark plug breakage ~ F-150 / Expedition). NHTSA
 * recall numbers verified post-insert.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const ISSUES = [
  // === Navigator ===
  {
    id: 'lincoln-navigator-5.4l-3v-spark-plug-breakage',
    make: 'Lincoln',
    model: 'Navigator',
    years: range(2005, 2008),
    trims: ['Base', 'Ultimate', 'L', 'L Ultimate'],
    engines: ['5.4L 3V Triton V8'],
    category: 'engine',
    title: 'Navigator 5.4L 3V Triton Spark Plug Breakage on Removal',
    description: 'The 5.4L 3-valve Triton V8 in 2005-2008 Navigator (and shared F-150/Expedition) uses a two-piece spark plug (Motorcraft SP-515/SP-546) that frequently snaps off in the cylinder head during removal. The lower portion stays welded into the head by carbon, leaving the upper electrode in the socket. Common at 60,000-100,000 miles when the first plug change is attempted.',
    solution: 'Soak each plug 24 hours in penetrating oil (PB Blaster, Seafoam Deep Creep) and remove only when engine is warm. Use the Lisle 65600 / OTC 6918 broken-plug extraction kit if breakage occurs (~$80). Replace with the redesigned one-piece Motorcraft SP-546 / NGK plugs. Ford settled a class-action covering reasonable extraction costs at dealer.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['snapped spark plug during service', 'misfire after attempted plug change', 'rough idle'],
    affectedSystems: ['ignition', 'cylinder head'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1500,
    typicalMileageLow: 60000,
    typicalMileageHigh: 120000,
  },
  {
    id: 'lincoln-navigator-3.5l-ecoboost-timing-chain',
    make: 'Lincoln',
    model: 'Navigator',
    years: range(2015, 2019),
    trims: ['Select', 'Reserve', 'L Select', 'L Reserve', 'Black Label', 'Standard'],
    engines: ['3.5L EcoBoost Twin-Turbo V6'],
    category: 'engine',
    title: 'Navigator 3.5L EcoBoost Timing Chain Stretch',
    description: 'The 3.5L EcoBoost twin-turbo V6 in 2015+ Navigator (and shared F-150, Expedition, Edge ST) suffers timing chain stretch typically between 80,000-150,000 miles. Symptoms include a rattling noise on cold start, particularly on the passenger-side bank, plus P0016/P0017/P0018/P0019 correlation codes. Causes include extended oil change intervals, low-quality oil, and turbocharger-related oil shear.',
    solution: 'Full timing chain kit replacement (primary chain, both secondary chains, tensioners, guides, sprockets, water pump) — typically $2,500-$4,500 at dealer, $1,800-$3,000 at independent. Stick to 5,000-7,500 mile oil intervals with Motorcraft full-synthetic 5W-30. Catastrophic chain failure means head rebuild ($6,000+).',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'misfire', 'check engine light', 'rough running', 'reduced power'],
    affectedSystems: ['timing chain', 'valvetrain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019', 'P0300'],
    estimatedCostLow: 1800,
    estimatedCostHigh: 6000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'lincoln-navigator-air-suspension-failure',
    make: 'Lincoln',
    model: 'Navigator',
    years: range(2003, 2017),
    trims: ['Base', 'Ultimate', 'L', 'L Ultimate', 'Select', 'Reserve'],
    engines: ['all'],
    category: 'suspension',
    title: 'Navigator Rear Air Suspension Bag/Compressor Failure',
    description: '2003-2017 Navigators with the optional/standard rear air suspension (and the 2003+ Expedition with the same system) develop air-bag leaks at the bag-to-piston seal as the bag rubber ages and cracks. Symptoms: rear of vehicle sagging overnight, compressor running constantly, error message "Check Air Suspension." Eventually the compressor burns out from constant duty.',
    solution: 'Replace air bags as a pair (Arnott or Strutmasters aftermarket ~$400-$700 per side; OEM Motorcraft ~$800-$1,200 per side installed). Replace the dryer with the compressor or it will quickly fail again. Some owners convert to coil springs (Strutmasters kit ~$700) — eliminates the leveling feature but is permanent.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['rear sag', 'air suspension warning', 'compressor running constantly', 'uneven ride height'],
    affectedSystems: ['suspension', 'air compressor'],
    dtcCodes: ['C1727', 'C1731', 'C1965'],
    estimatedCostLow: 700,
    estimatedCostHigh: 2400,
    typicalMileageLow: 70000,
    typicalMileageHigh: 150000,
  },

  // === MKZ ===
  {
    id: 'lincoln-mkz-3.5l-water-pump-internal-leak',
    make: 'Lincoln',
    model: 'MKZ',
    years: range(2007, 2012),
    trims: ['Base', 'AWD'],
    engines: ['3.5L Duratec V6'],
    category: 'cooling',
    title: 'MKZ 3.5L Duratec V6 Internal Water Pump Leak',
    description: 'The 3.5L Duratec V6 in 2007-2012 MKZ (and shared Edge, Taurus, Flex, Explorer) uses a water pump driven internally by the timing chain. When the pump shaft seal fails, coolant leaks into the oil pan rather than externally — owners often see no leak before catastrophic oil contamination. Symptoms: milky oil, white smoke, mysterious coolant loss, eventual bearing failure.',
    solution: 'Internal water pump replacement is a labor-intensive job (timing cover off) — $1,500-$2,500 at independent, $2,500-$3,500 at dealer. Check the coolant level monthly; check the oil for milky discoloration at every change. Some owners replace proactively at 100,000 miles to avoid engine damage.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['milky oil', 'white smoke', 'mysterious coolant loss', 'low coolant warning'],
    affectedSystems: ['cooling system', 'lubrication'],
    dtcCodes: ['P0217', 'P1285'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 4500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'lincoln-mkz-hybrid-electric-power-steering',
    make: 'Lincoln',
    model: 'MKZ',
    years: range(2011, 2016),
    trims: ['Hybrid', 'Premiere', 'Select', 'Reserve'],
    engines: ['2.5L Atkinson Hybrid'],
    category: 'steering',
    title: 'MKZ EPS Loss of Assist (NHTSA Recall 18V-153)',
    description: 'Ford issued NHTSA recall 18V-153 for 2011-2016 Fusion/MKZ to address loss of electric power steering assist. The torque sensor inside the steering column can detach from its mount, causing sudden loss of power assist while driving. Affected vehicles received either a software update or steering column replacement.',
    solution: 'Check VIN against the NHTSA recall lookup (recall 18V-153 — Lincoln owners may see it as Lincoln 18S05). The remedy is dealer software update; if not effective, a complete steering column gear assembly was replaced free under recall.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['power steering warning', 'sudden heavy steering', 'EPAS fault message'],
    affectedSystems: ['electric power steering'],
    dtcCodes: ['C2007', 'U0131'],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },

  // === MKX / Nautilus ===
  {
    id: 'lincoln-mkx-3.7l-water-pump-internal',
    make: 'Lincoln',
    model: 'MKX',
    years: range(2011, 2018),
    trims: ['Base', 'AWD', 'Premiere', 'Select', 'Reserve', 'Black Label'],
    engines: ['3.7L Duratec V6'],
    category: 'cooling',
    title: 'MKX 3.7L Duratec Internal Water Pump Failure',
    description: 'The 3.7L Duratec V6 in 2011-2018 MKX uses the same internal (timing-chain-driven) water pump design as the 3.5L Duratec. When the seal fails, coolant flows directly into the oil sump. Symptoms identical to the 3.5L pattern: milky oil, low coolant with no external leak, eventual bearing damage.',
    solution: 'Same job as the 3.5L — internal water pump replacement requires removal of the front timing cover. $1,500-$2,500 at independent. Replace timing chain set proactively at the same time if mileage > 100,000 — saves a second labor charge later.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['milky oil', 'mysterious coolant loss', 'engine noise', 'low coolant warning'],
    affectedSystems: ['cooling system', 'lubrication'],
    dtcCodes: ['P0217', 'P1285'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 4000,
    typicalMileageLow: 90000,
    typicalMileageHigh: 160000,
  },

  // === Aviator ===
  {
    id: 'lincoln-aviator-2020-multiple-recalls',
    make: 'Lincoln',
    model: 'Aviator',
    years: range(2020, 2021),
    trims: ['Standard', 'Reserve', 'Black Label', 'Grand Touring', 'Black Label Grand Touring'],
    engines: ['3.0L EcoBoost V6', '3.0L Plug-in Hybrid'],
    category: 'safety',
    title: 'Aviator Early-Build Recalls — Welds, Seat Backs, Drive Shaft',
    description: '2020 Aviator launches were affected by several recalls: NHTSA 20V-303 (driveshaft can detach due to weld defect, ~21,000 vehicles), and a separate set of stop-sale actions in 2019-2020 for second-row seat-back recliner welds, brake hose pinch, and battery fasteners. Many owners experienced multiple dealer visits in the first year of ownership.',
    solution: 'Check VIN against the NHTSA recalls lookup — multiple campaigns may apply. All remedies are free under recall. If you own a 2020 Aviator and have not had any recall service, request a full recall history printout from the dealer.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['driveline vibration', 'driveshaft separation', 'recall notice in mail'],
    affectedSystems: ['driveline', 'seats', 'brakes', 'battery mounting'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },
  {
    id: 'lincoln-aviator-rear-air-suspension',
    make: 'Lincoln',
    model: 'Aviator',
    years: range(2020, 2024),
    trims: ['Reserve', 'Black Label', 'Grand Touring', 'Black Label Grand Touring'],
    engines: ['3.0L EcoBoost V6', '3.0L Plug-in Hybrid'],
    category: 'suspension',
    title: 'Aviator Air Glide Suspension — Compressor and Bag Failures',
    description: '2020+ Aviator with the optional Air Glide suspension shares its compressor and air spring design with the related Ford Explorer ST/Platinum. Owners report compressor noise becoming progressively louder by 40,000-80,000 miles, then bag leaks (rear first), then compressor burnout. Warning message: "Service Air Suspension."',
    solution: 'Diagnose with FORScan to confirm air bag vs. compressor failure. OEM bags $700-$1,100 per corner installed. Compressor (Wabco/Continental unit) ~$600-$900 installed. Replace compressor dryer at the same time as a bag (~$80) — extends compressor life.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['rear sag overnight', 'compressor runs constantly', 'service air suspension message', 'uneven ride height'],
    affectedSystems: ['suspension', 'air compressor'],
    dtcCodes: ['C1965', 'C1727'],
    estimatedCostLow: 700,
    estimatedCostHigh: 2500,
    typicalMileageLow: 40000,
    typicalMileageHigh: 100000,
  },

  // === Continental ===
  {
    id: 'lincoln-continental-suicide-doors-recall',
    make: 'Lincoln',
    model: 'Continental',
    years: range(2019, 2020),
    trims: ['Black Label', '80th Anniversary'],
    engines: ['all'],
    category: 'safety',
    title: 'Continental Coach Door (Rear Suicide Door) Latch Recall (NHTSA 20V-630)',
    description: 'NHTSA recall 20V-630 covers ~525 of the limited-build 2019-2020 Lincoln Continental Coach Door (rear-hinged) Editions. The rear door latch can be assembled incorrectly such that the door can open while the vehicle is in motion. Lincoln replaces the rear door latches.',
    solution: 'Check VIN at NHTSA recalls lookup. Affected vehicles get latch replacement free. Until repaired, do not transport rear-seat passengers in this vehicle. Limited run (about 80 cars per year) — very small affected population but very serious failure mode if not addressed.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['rear door opens unexpectedly', 'latch warning message'],
    affectedSystems: ['door latch'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },

  // === Town Car ===
  {
    id: 'lincoln-town-car-air-suspension-failure',
    make: 'Lincoln',
    model: 'Town Car',
    years: range(2003, 2011),
    trims: ['Executive', 'Signature', 'Cartier', 'Designer', 'Signature L', 'Signature Limited'],
    engines: ['4.6L 2V Modular V8'],
    category: 'suspension',
    title: 'Town Car Rear Air Suspension Bag/Compressor Failure',
    description: 'Final-gen Town Car (2003-2011 Panther platform) used a rear-only air suspension that develops bag leaks and compressor burnout very similar to the Navigator/Crown Vic Police Interceptor system. Cars sag dramatically overnight; compressor cycles continually trying to refill.',
    solution: 'Replace bags as a pair ($300-$600 aftermarket installed). Compressor + dryer kit ~$200-$400 installed. Many owners convert to coil springs with a Strutmasters-style kit (~$300-$500) — loses self-leveling but no further maintenance. Limo owners need to keep air for headroom adjustment.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['rear sag', 'compressor runs continuously', 'air suspension warning', 'rear bottoms out on bumps'],
    affectedSystems: ['suspension', 'air compressor'],
    dtcCodes: ['C1727', 'C1965'],
    estimatedCostLow: 300,
    estimatedCostHigh: 1200,
    typicalMileageLow: 80000,
    typicalMileageHigh: 200000,
  },
  {
    id: 'lincoln-town-car-blend-door-actuator',
    make: 'Lincoln',
    model: 'Town Car',
    years: range(2003, 2011),
    trims: ['Executive', 'Signature', 'Cartier', 'Designer', 'Signature L'],
    engines: ['all'],
    category: 'hvac',
    title: 'Town Car HVAC Blend Door Actuator Clicking / No-Heat',
    description: 'Town Car (and shared Crown Vic / Grand Marquis) HVAC blend door actuators fail commonly, presenting as a persistent rapid clicking from behind the dash followed by no temperature control — usually stuck blowing cold on the driver side or hot on the passenger side. Plastic gear teeth strip; replacement is the only fix.',
    solution: 'Replacement blend door actuator ($30-$80 part) — labor varies wildly by which actuator. Driver side: 30 min. Passenger side: 1-2 hours. Floor/defrost actuator (deepest): 3-5 hours. Aftermarket Dorman actuators have mixed reviews — Motorcraft OEM lasts longer.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['rapid clicking behind dash', 'no temperature control', 'one side cold one side hot', 'stuck mode'],
    affectedSystems: ['HVAC'],
    dtcCodes: ['B1342', 'B2477'],
    estimatedCostLow: 80,
    estimatedCostHigh: 500,
    typicalMileageLow: 60000,
    typicalMileageHigh: 200000,
  },

  // === LS ===
  {
    id: 'lincoln-ls-coolant-cross-leak-aj-v8',
    make: 'Lincoln',
    model: 'LS',
    years: range(2000, 2006),
    trims: ['LS8', 'V8', 'Sport', 'Ultimate'],
    engines: ['3.9L AJ V8'],
    category: 'cooling',
    title: 'Lincoln LS 3.9L V8 Coolant Crossover Manifold Leak',
    description: 'The 3.9L AJ V8 (Jaguar-derived) in 2000-2006 Lincoln LS suffers coolant crossover-tube failure where the plastic manifold connects the heads at the rear of the engine. Leaks present as coolant dripping at the back of the engine, smell of coolant after shutdown, eventually overheating. Often co-fails with the plastic thermostat housing and degas bottle.',
    solution: 'Coolant crossover tube replacement (Motorcraft updated metal-flange part) — $300-$600 at independent. Recommend simultaneous replacement of thermostat housing, all plastic coolant fittings, and the degas bottle while the upper intake is off. Use Motorcraft Premium Gold (Zerex G-05) coolant only — Dex-Cool is incompatible.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['coolant smell after shutdown', 'rear engine drip', 'coolant loss', 'overheating'],
    affectedSystems: ['cooling system'],
    dtcCodes: ['P0128', 'P1285'],
    estimatedCostLow: 300,
    estimatedCostHigh: 900,
    typicalMileageLow: 60000,
    typicalMileageHigh: 150000,
  },
];

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Add Lincoln Issues to pending_review`);
  console.log(`  Drafts: ${ISSUES.length}`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  let added = 0, dup = 0, errors = 0;
  for (const draft of ISSUES) {
    try {
      if (await issueExists(pool, draft.id)) {
        console.log(`  ~ ${draft.id} — already exists, skipping`);
        dup++;
        continue;
      }
      await insertPendingIssue(pool, draft);
      console.log(`  ✓ ${draft.id} → pending_review`);
      added++;
    } catch (err) {
      console.error(`  ✗ ${draft.id} — ${err.message}`);
      errors++;
    }
  }

  console.log(`\nAdded: ${added}, Duplicates: ${dup}, Errors: ${errors}`);
  console.log(`\nNext: node scripts/list-pending-issues.js --make Lincoln`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
