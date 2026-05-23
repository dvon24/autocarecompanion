#!/usr/bin/env node
/**
 * Add Dacia known issues via audit-before-publish gate.
 * Dacia uses Renault-Nissan engines/platforms — many issues mirror Renault.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'dacia-sandero-duster-k9k-injectors',
    make: 'Dacia', model: 'Sandero', years: range(2008, 2020),
    trims: ['Access', 'Ambiance', 'Laureate', 'Stepway'],
    engines: ['1.5 dCi (K9K Bosch CP1)'],
    category: 'engine',
    title: 'Sandero / Duster 1.5 dCi K9K Bosch CP1 Injector Failure',
    description: 'The K9K 1.5 dCi diesel — used across Dacia Sandero, Duster, Logan, plus Renault Clio/Captur/Kadjar, Nissan Note/Juke — suffers Bosch CP1 high-pressure pump and injector failure typically at 100,000-180,000 km. Worst case: pump self-destructs and sends metal particles through the entire fuel system, requiring full rail+pump+injector replacement (€2,500-€4,000).',
    solution: 'Back-leak test at 80,000 km as a precaution. Single-injector replacement €250-€500. If pump has failed catastrophically, full system flush + replacement is the only safe option. Use only diesel from major-brand stations and add a fuel-system cleaner per service.',
    severity: 'critical', confidence: 'high',
    symptoms: ['rough start', 'misfire', 'limp mode', 'fuel smell', 'no start'],
    affectedSystems: ['injectors', 'HP pump', 'fuel system'],
    dtcCodes: ['P0201', 'P0202', 'P0203', 'P0204', 'P0087', 'P0088'],
    estimatedCostLow: 250, estimatedCostHigh: 4000,
    typicalMileageLow: 100000, typicalMileageHigh: 180000,
  },
  {
    id: 'dacia-duster-1.6-sce-h4m-chain',
    make: 'Dacia', model: 'Duster', years: range(2017, 2023),
    trims: ['Access', 'Essential', 'Comfort', 'Prestige'],
    engines: ['1.6 SCe (H4M)'],
    category: 'engine',
    title: 'Duster 1.6 SCe H4M Timing Chain Stretch',
    description: 'The Renault-Nissan H4M 1.6 SCe in Duster Mk2 (and Renault Kadjar/Captur, Nissan Qashqai/Juke) develops timing chain stretch typically at 80,000-140,000 km. Cold-start rattle, P0016/P0017 codes, eventual chain skip risk. Same engine family as Nissan HR16DE — same issue across all applications.',
    solution: 'Full chain kit (chain, guides, tensioner) €700-€1,200. Use Renault-spec RN0700 5W-30 oil at 15,000 km max — longer intervals significantly accelerate chain wear. Replace at first persistent rattle.',
    severity: 'high', confidence: 'medium',
    symptoms: ['cold start rattle', 'check engine light', 'misfire'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0016', 'P0017', 'P0008', 'P0009'],
    estimatedCostLow: 700, estimatedCostHigh: 1500,
    typicalMileageLow: 80000, typicalMileageHigh: 140000,
  },
  {
    id: 'dacia-1.0-tce-h4d-oil-consumption',
    make: 'Dacia', model: 'Sandero', years: range(2019, 2024),
    trims: ['Essential', 'Comfort', 'Expression', 'Stepway'],
    engines: ['1.0 TCe (H4D)'],
    category: 'engine',
    title: 'Dacia 1.0 TCe H4D 3-Cylinder Turbo Oil Consumption',
    description: 'The H4D 1.0 TCe 3-cylinder turbo (Sandero, Logan, Duster, Jogger; shared with Renault Clio/Captur, Nissan Micra) is known for oil consumption — typically 0.5-1.0L per 5,000-10,000 km, sometimes higher. Renault has issued multiple TSBs around piston ring designs and PCV updates. Check oil between services.',
    solution: 'Monitor oil monthly. If consumption exceeds 1L/3,000km, request Renault TSB inspection — some markets have offered partial-funded piston/ring replacement. Use Renault RN17 0W-20 oil at the strict 10,000 km interval, not extended.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['oil consumption', 'oil warning between services', 'blue smoke startup'],
    affectedSystems: ['piston rings', 'PCV'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 2500,
    typicalMileageLow: 40000, typicalMileageHigh: 150000,
  },
  {
    id: 'dacia-duster-mk1-rear-suspension',
    make: 'Dacia', model: 'Duster', years: range(2010, 2017),
    trims: ['Access', 'Ambiance', 'Laureate'],
    engines: ['all'],
    category: 'suspension',
    title: 'Duster Mk1 Rear Anti-Roll Bar Drop Link / Bush Wear',
    description: 'The 1st-gen Duster (2010-2017) suffers premature wear of rear anti-roll bar drop links and bushes — common at 60,000-100,000 km. Symptoms: clunking from rear over bumps, light "knocking" sound at low speed, MOT advisory or fail. Often misdiagnosed as shock absorber wear.',
    solution: 'Drop links + bushes both sides €40-€90 in parts, 1-2 hours labor (€80-€160). Use pattern parts — OEM offers no real durability advantage here. Aligned tracking after replacement recommended but not strictly needed.',
    severity: 'medium', confidence: 'high',
    symptoms: ['clunking over bumps', 'knocking rear', 'MOT advisory'],
    affectedSystems: ['rear suspension', 'anti-roll bar'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 250,
    typicalMileageLow: 60000, typicalMileageHigh: 100000,
  },
  {
    id: 'dacia-spring-12v-drain',
    make: 'Dacia', model: 'Spring', years: range(2021, 2025),
    trims: ['Essential', 'Expression', 'Extreme'],
    engines: ['Electric'],
    category: 'electrical',
    title: 'Spring EV 12V Auxiliary Battery Drain',
    description: 'The Dacia Spring EV (built in China by Renault-Dongfeng JV) has reported 12V auxiliary battery drain issues during long parking, similar to other CMP-platform EVs. Multiple software updates issued. The Spring uses a small AGM 12V — replacement is straightforward but coding may be needed.',
    solution: 'Update vehicle software at dealer (some markets covered by free recall). Use 12V maintainer for parked stretches over 1 week. AGM replacement €100-€180 + €30-€60 coding if needed.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['will not wake', 'dead 12V', 'will not charge'],
    affectedSystems: ['12V battery', 'BCM'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 250,
    typicalMileageLow: 0, typicalMileageHigh: 50000,
  },
  {
    id: 'dacia-logan-sandero-clutch-wear',
    make: 'Dacia', model: 'Sandero', years: range(2008, 2018),
    trims: ['Access', 'Ambiance', 'Laureate'],
    engines: ['1.2 16V', '1.4 8V', '1.5 dCi'],
    category: 'transmission',
    title: 'Sandero / Logan Manual Clutch Premature Wear',
    description: 'Manual clutches on Sandero Mk1/Mk2 and Logan Mk1/Mk2 wear faster than typical — many owners report needing replacement at 80,000-120,000 km, particularly in stop-start urban driving. The clutch friction material and pressure plate spec is on the budget side.',
    solution: 'Replacement clutch kit (cover, plate, release bearing) €350-€650 incl. labor. Consider uprated kits (Sachs SACHS Performance) if you do hilly or stop-start commuting — +€80-€150 in parts.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['clutch slip', 'high biting point', 'judder'],
    affectedSystems: ['clutch'],
    dtcCodes: [],
    estimatedCostLow: 350, estimatedCostHigh: 700,
    typicalMileageLow: 80000, typicalMileageHigh: 120000,
  },
  {
    id: 'dacia-duster-1.5-blue-dci-adblue',
    make: 'Dacia', model: 'Duster', years: range(2018, 2024),
    trims: ['Essential', 'Comfort', 'Prestige', 'Extreme'],
    engines: ['1.5 Blue dCi'],
    category: 'emissions',
    title: 'Duster 1.5 Blue dCi AdBlue / SCR System Faults',
    description: 'The 1.5 Blue dCi (post-2018 Euro 6d) in Duster, Sandero, Logan uses an SCR/AdBlue system that has been the subject of multiple TSBs across Renault-Nissan-Dacia. Common faults: AdBlue heater failure (cold-weather), NOx sensor failure, AdBlue injector clogging, eventually limp mode and 1,000-mile countdown warning.',
    solution: 'NOx sensor replacement €300-€500. AdBlue heater + injector module €350-€700. AdBlue tank replacement €600-€1,200. Always top up AdBlue at every service to avoid crystallization. Some markets covered by Renault extended warranty — check records.',
    severity: 'high', confidence: 'medium',
    symptoms: ['AdBlue warning', 'limp mode', '1000 mile countdown', 'EML'],
    affectedSystems: ['SCR', 'AdBlue', 'NOx sensor'],
    dtcCodes: ['P204F', 'P207F', 'P20EE', 'P229F'],
    estimatedCostLow: 300, estimatedCostHigh: 1500,
    typicalMileageLow: 40000, typicalMileageHigh: 120000,
  },
  {
    id: 'dacia-duster-4x4-transfer-case',
    make: 'Dacia', model: 'Duster', years: range(2010, 2020),
    trims: ['Laureate', 'Prestige', '4x4'],
    engines: ['1.5 dCi', '1.6 SCe'],
    category: 'drivetrain',
    title: 'Duster 4x4 Transfer Case / Coupling Wear (Lock Mode)',
    description: 'Duster 4x4 uses a Nissan-derived transfer case with electromagnetic coupling for AWD engagement. The coupling wears with off-road use or persistent towing duty — symptoms include AWD warning light, rear drive intermittent in "Lock" mode, and grinding from underneath during slow-speed maneuvering.',
    solution: 'Coupling oil change every 30,000 km (often overlooked — not in main service schedule). Coupling refresh service €150-€280 at independent. Replacement coupling €500-€900 if worn. Check whether prior owners did the oil service.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['AWD warning', 'rear drive intermittent', 'grinding'],
    affectedSystems: ['transfer case', 'AWD coupling'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 900,
    typicalMileageLow: 60000, typicalMileageHigh: 150000,
  },
  {
    id: 'dacia-sandero-mk2-power-steering-noise',
    make: 'Dacia', model: 'Sandero', years: range(2012, 2020),
    trims: ['Access', 'Ambiance', 'Laureate', 'Stepway'],
    engines: ['all'],
    category: 'steering',
    title: 'Sandero Mk2 Electric Power Steering Noise / Whine',
    description: 'The 2nd-gen Sandero (and Logan Mk2) EPS column motor develops a whining or grinding noise during low-speed parking maneuvers, typically at 80,000+ km. Steering function remains, but noise is irritating and can be a precursor to motor failure. Pattern is common across Renault-Dacia EPS columns of this era.',
    solution: 'Inspect first — sometimes loose mount bolts cause the noise (cheap fix). If motor wear confirmed, refurbished EPS column €250-€450; new €500-€900. Catch it before motor seizes (sudden assistance loss).',
    severity: 'medium', confidence: 'medium',
    symptoms: ['steering whine', 'grinding at parking speeds', 'EPS warning'],
    affectedSystems: ['EPS'],
    dtcCodes: ['C0545', 'U0131'],
    estimatedCostLow: 250, estimatedCostHigh: 900,
    typicalMileageLow: 80000, typicalMileageHigh: 150000,
  },
  {
    id: 'dacia-logan-electrical-bcm',
    make: 'Dacia', model: 'Logan', years: range(2004, 2012),
    trims: ['Access', 'Ambiance', 'Laureate'],
    engines: ['all'],
    category: 'electrical',
    title: 'Logan Mk1 Body Control / Central Locking Electrical Faults',
    description: 'The 1st-gen Logan (2004-2012) is known for assorted minor electrical faults — central-locking intermittent, dashboard warning lights randomly illuminating, instrument-cluster bulbs failing. Root cause is often the BCM (UCH/UCM in Renault parlance) or its connectors. Reflective of the cost-down build spec.',
    solution: 'Check connectors first (clean, dielectric grease). UCH replacement €200-€400 if confirmed faulty. Many owners live with intermittent issues since the car still drives — costly to chase if non-safety-critical.',
    severity: 'low', confidence: 'medium',
    symptoms: ['intermittent central locking', 'random warning lights', 'cluster bulbs out'],
    affectedSystems: ['BCM', 'central locking'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 500,
    typicalMileageLow: 60000, typicalMileageHigh: 200000,
  },
];

async function main() {
  console.log(`\n  Dacia — inserting ${ISSUES.length} drafts as pending_review\n`);
  let added = 0, dup = 0, errors = 0;
  for (const draft of ISSUES) {
    try {
      if (await issueExists(pool, draft.id)) { console.log(`  ~ ${draft.id} — exists`); dup++; continue; }
      await insertPendingIssue(pool, draft);
      console.log(`  ✓ ${draft.id}`); added++;
    } catch (err) { console.error(`  ✗ ${draft.id} — ${err.message}`); errors++; }
  }
  console.log(`\nAdded: ${added}, Duplicates: ${dup}, Errors: ${errors}`);
  await pool.end();
}
main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
