#!/usr/bin/env node
/**
 * Add Tesla known issues via audit-before-publish gate.
 * Tesla is documentation-rich — TSLA files NHTSA recalls like everyone
 * else, plus there's a huge enthusiast forum corpus (TMC, Reddit, etc.).
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'tesla-model-s-x-mcu1-emmc-failure',
    make: 'Tesla', model: 'Model S', years: range(2012, 2018),
    trims: ['60', '70', '75', '85', 'P85', 'P85D', '90D', 'P90D', '100D', 'P100D'],
    engines: ['Dual Motor', 'Single Motor'],
    category: 'electrical',
    title: 'Model S / X MCU1 eMMC Flash Memory Failure',
    description: 'The MCU1 (Tegra 3-based infotainment) used in 2012-2018 Model S and 2015-2018 Model X has a chronic eMMC flash memory wear-out issue — the 8GB eMMC accumulates write cycles from system logging until it fails, taking the entire infotainment + climate + Autopilot configuration offline. NHTSA investigation NHTSA PE21-005 led to a 2021 recall (21V-022) covering 134,951 vehicles. Tesla\'s remedy is MCU2 retrofit OR eMMC replacement.',
    solution: 'Tesla covered the fix under the 21V-022 recall — confirm via VIN at Tesla recall lookup. Out-of-recall: 3rd-party eMMC replacement (Gruber Motor, etc.) ~$400-$700; MCU2 retrofit from Tesla ~$2,000-$2,500 incl. labor.',
    severity: 'high', confidence: 'high',
    symptoms: ['blank screen', 'no infotainment', 'no climate control', 'autopilot unavailable', 'losing settings'],
    affectedSystems: ['MCU', 'infotainment', 'climate', 'autopilot'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 2500,
    typicalMileageLow: 30000, typicalMileageHigh: 200000,
  },
  {
    id: 'tesla-model-s-x-drive-unit-milling',
    make: 'Tesla', model: 'Model S', years: range(2012, 2020),
    trims: ['60', '85', 'P85', 'P85D', '90D', 'P90D'],
    engines: ['Single Motor', 'Dual Motor'],
    category: 'drivetrain',
    title: 'Model S / X Drive Unit "Milling" Noise / Failure',
    description: 'Early Model S (and X) drive units develop a "milling" noise — a metallic whine that gradually grows louder, ultimately requiring drive-unit replacement. Tesla has replaced many DUs under warranty (often multiple times per car). Issue stems from gear-mesh quality and bearing tolerances; quieter post-2014 but still present. Front DU on dual-motor cars typically the first to fail.',
    solution: 'Tesla warranty replacement is the standard fix when covered (8 yr / unlimited miles on drive unit historically). Out-of-warranty refurb DU from Tesla $2,500-$4,500; new $4,500-$6,500 incl. install. Have a Tesla service center document any whine while still under drivetrain warranty.',
    severity: 'high', confidence: 'high',
    symptoms: ['whining noise', 'milling sound', 'humming', 'progressive louder over speed'],
    affectedSystems: ['drive unit', 'front motor'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 6500,
    typicalMileageLow: 30000, typicalMileageHigh: 150000,
  },
  {
    id: 'tesla-model-s-x-air-suspension-droop',
    make: 'Tesla', model: 'Model S', years: range(2012, 2020),
    trims: ['85', 'P85', 'P85D', '90D', 'P90D', '100D', 'P100D'],
    engines: ['all'],
    category: 'suspension',
    title: 'Model S / X Air Suspension Leveling / Nose-Droop',
    description: 'Model S and X with air suspension develop leveling-pump and air-strut failures — typically presenting as a nose-droop overnight (car settles unevenly) or "Air Suspension Needs Service" warning. Pump diaphragm wear is the most common single cause; corner air struts also leak. Common at 80,000-160,000 km.',
    solution: 'Air pump replacement (refurbished) $300-$600 part + $200-$400 install. Single air strut $400-$800 part + install. Many owners switch to 3rd-party Arnott replacements. Severe cases need full system overhaul ($2,000-$4,000).',
    severity: 'medium', confidence: 'high',
    symptoms: ['nose droop', 'air suspension warning', 'uneven ride height', 'car settling overnight'],
    affectedSystems: ['air suspension', 'leveling pump'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 4000,
    typicalMileageLow: 80000, typicalMileageHigh: 200000,
  },
  {
    id: 'tesla-model-x-falcon-wing-door',
    make: 'Tesla', model: 'Model X', years: range(2015, 2024),
    trims: ['60D', '75D', '90D', 'P90D', '100D', 'P100D', 'Long Range', 'Performance', 'Plaid'],
    engines: ['Dual Motor', 'Tri-Motor'],
    category: 'body',
    title: 'Model X Falcon-Wing Door Faults',
    description: 'The signature Falcon-Wing rear doors on Model X are notoriously trouble-prone — symptoms include doors refusing to open, opening too slowly, getting stuck mid-cycle, mis-detecting obstacles, hitting low ceilings, and squeaking. Tesla revised door hardware multiple times (Gen 1 → Gen 2 → Gen 3 latch mechanism). Issue persists across years but Gen 3 (post-2019) is noticeably more reliable.',
    solution: 'Tesla service centers can recalibrate doors free if symptoms present; out-of-warranty hardware replacement can be $1,500-$3,000 per door. Latch assembly $400-$800 part; replacement procedure is involved. Sometimes "manual close" mode is a temporary workaround.',
    severity: 'medium', confidence: 'high',
    symptoms: ['door wont open', 'door stuck', 'door hits ceiling', 'squeak', 'slow door'],
    affectedSystems: ['falcon-wing door', 'door latch', 'door motor'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 3000,
    typicalMileageLow: 20000, typicalMileageHigh: 150000,
  },
  {
    id: 'tesla-model-3-y-12v-drain',
    make: 'Tesla', model: 'Model 3', years: range(2017, 2024),
    trims: ['Standard Range', 'Standard Range Plus', 'Long Range', 'Long Range AWD', 'Performance', 'RWD'],
    engines: ['Single Motor', 'Dual Motor'],
    category: 'electrical',
    title: 'Model 3 / Y 12V Auxiliary Battery Premature Failure',
    description: 'Pre-Highland Model 3 and pre-Juniper Model Y used a small lead-acid AGM 12V auxiliary battery that often fails in 12-24 months — well below typical 12V lifespan. Tesla switched to a lithium-ion 12V starting 2021-2022 (varies by build date) which lasts much longer but can also fail with "Power Off" warnings or refusing to wake. Symptoms: "12V Battery Needs Service" alert, car refusing to wake from sleep, sentry mode glitches.',
    solution: 'Lead-acid 12V replacement $150-$250 part + $100-$200 service-center install. Lithium 12V $200-$300 part. DIY is feasible but disabling HV system safely is critical. Many 2018-2020 Model 3 owners report needing 2-3 replacements before lithium retrofit.',
    severity: 'medium', confidence: 'high',
    symptoms: ['12V needs service alert', 'will not wake', 'sentry mode failed', 'power off warning'],
    affectedSystems: ['12V battery'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 500,
    typicalMileageLow: 10000, typicalMileageHigh: 80000,
  },
  {
    id: 'tesla-model-3-y-phantom-braking',
    make: 'Tesla', model: 'Model 3', years: range(2019, 2024),
    trims: ['Long Range', 'Long Range AWD', 'Performance', 'RWD'],
    engines: ['all'],
    category: 'safety',
    title: 'Model 3 / Y Phantom Braking on Autopilot',
    description: 'Model 3 and Y on Autopilot or TACC report unexpected hard braking events — "phantom braking" — most often at highway speed in response to non-existent obstacles, shadows, overpasses, or oncoming traffic in opposite lanes. NHTSA investigation PE22-002 opened in 2022 covering 416,000 vehicles after 354 complaints, including some rear-end collisions. Tesla\'s shift from radar to "Tesla Vision" (vision-only) intensified reports.',
    solution: 'Update to latest firmware (FSD beta or production); some specific software versions are notably worse. Configure following distance to max (7). Disable Autopilot on roads where phantom braking is frequent. NHTSA investigation remains active — Tesla has not issued a formal recall as of writing.',
    severity: 'high', confidence: 'high',
    symptoms: ['sudden braking', 'autopilot brake event', 'TACC slowdown', 'rear-end risk'],
    affectedSystems: ['Autopilot', 'TACC', 'Tesla Vision'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 200000,
  },
  {
    id: 'tesla-cybertruck-accelerator-pedal-recall',
    make: 'Tesla', model: 'Cybertruck', years: range(2024, 2024),
    trims: ['AWD', 'Cyberbeast', 'Foundation Series'],
    engines: ['Dual Motor', 'Tri-Motor'],
    category: 'safety',
    title: 'Cybertruck Accelerator Pedal Pad Detachment (April 2024 Recall)',
    description: 'Tesla recalled all 3,878 Cybertrucks delivered as of April 2024 (recall 24V-302) for accelerator-pedal pad detachment risk — an unapproved soap during assembly weakened the adhesive holding the pad cap. The pad cap could slip and lodge in the interior trim, holding the accelerator open. No injuries reported but the failure mode is serious enough to warrant the recall.',
    solution: 'Recall remedy: Tesla service center replaces accelerator pedal — free. All affected VINs covered. Verify your VIN status via NHTSA recall lookup (24V-302). Owners noticed loose pedal pads via simple feel test.',
    severity: 'critical', confidence: 'high',
    symptoms: ['loose pedal pad', 'stuck accelerator', 'unintended acceleration risk'],
    affectedSystems: ['accelerator pedal'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 50000,
  },
  {
    id: 'tesla-model-y-seatbelt-anchor-recall',
    make: 'Tesla', model: 'Model Y', years: range(2020, 2024),
    trims: ['Long Range', 'Long Range AWD', 'Performance', 'RWD'],
    engines: ['Single Motor', 'Dual Motor'],
    category: 'safety',
    title: 'Model Y Front Seatbelt Anchor Recall (2022)',
    description: 'NHTSA recall 22V-242 covered approximately 50,000 Model Y vehicles for improperly secured front-row seat belt anchors that could detach in a crash. The bolts may not have been torqued during assembly. Tesla recalled to inspect torque and replace as needed. Critical safety item — verify recall completion at any Tesla service center.',
    solution: 'Free recall remedy at any Tesla service center — typically 15-30 min inspection + torque. Check VIN against recall 22V-242. Some owners self-checked using an inch-pound torque wrench; manual specifies the value.',
    severity: 'critical', confidence: 'high',
    symptoms: ['loose seatbelt anchor', 'safety recall'],
    affectedSystems: ['seatbelt'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 100000,
  },
  {
    id: 'tesla-model-3-y-paint-chipping',
    make: 'Tesla', model: 'Model 3', years: range(2017, 2024),
    trims: ['Standard Range Plus', 'Long Range', 'Performance', 'RWD'],
    engines: ['all'],
    category: 'body',
    title: 'Model 3 / Y Paint Thickness + Chipping',
    description: 'Tesla paint is notoriously thinner than industry standard — typically 100-120 microns vs 150-180 for German/Japanese makes. Rocker panels, rear quarter panels, and front bumper edges chip easily from road debris. White paints particularly prone to surface marring. Multiple paint-quality NHTSA complaints (no recall) and class-action discussions.',
    solution: 'PPF (paint protection film) on high-impact areas is the durable fix — $500-$2,500 depending on coverage. Touch-up paint from Tesla or 3rd-party color-matched. Severe issues may warrant repaint of panels ($600-$1,500 per panel at independent body shop).',
    severity: 'low', confidence: 'high',
    symptoms: ['paint chip', 'rocker chip', 'rear quarter chip', 'thin paint'],
    affectedSystems: ['paint', 'body'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 3000,
    typicalMileageLow: 0, typicalMileageHigh: 100000,
  },
  {
    id: 'tesla-model-3-heat-pump-valve',
    make: 'Tesla', model: 'Model 3', years: range(2021, 2024),
    trims: ['Long Range', 'Long Range AWD', 'Performance'],
    engines: ['all'],
    category: 'hvac',
    title: 'Model 3 / Y Heat Pump Octovalve / "Superbottle" Failures',
    description: '2021+ Model 3 and Y use a heat-pump-based HVAC system with a complex "octovalve" coolant manifold. In cold weather (below freezing), the octovalve can stick, causing no cabin heat AND/OR HV battery preconditioning failure. NHTSA recall 22V-040 covered some 2021-2022 cars for related software issue.',
    solution: 'Software update via OTA was the first remedy (recall 22V-040). Hardware-level octovalve failure requires service-center replacement ($600-$1,200 if out of warranty). Check whether recall has been applied via VIN lookup.',
    severity: 'high', confidence: 'high',
    symptoms: ['no heat', 'no defrost', 'preconditioning fails', 'HV battery cold'],
    affectedSystems: ['heat pump', 'octovalve', 'thermal management'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 1500,
    typicalMileageLow: 0, typicalMileageHigh: 100000,
  },
  {
    id: 'tesla-model-y-rear-glass-shattering',
    make: 'Tesla', model: 'Model Y', years: range(2020, 2022),
    trims: ['Long Range', 'Performance'],
    engines: ['Dual Motor'],
    category: 'body',
    title: 'Early Model Y Rear Glass Cracking / Shattering',
    description: 'Early-production (2020-2021) Model Y reports of the panoramic rear glass cracking, sometimes spontaneously, sometimes from minor flex. Owners reported cracks appearing during cold-weather closing of the trunk. Tesla covered most under warranty but did not recall. Issue largely resolved in later builds.',
    solution: 'Tesla goodwill or warranty replacement (~$700-$1,200) — file a service request promptly. Out-of-warranty rear glass replacement $800-$1,400 + install ($300-$500). 3rd-party glass shops may quote less than Tesla service center.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['cracked rear glass', 'shattered roof glass', 'spontaneous crack'],
    affectedSystems: ['rear glass', 'panoramic roof'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 1900,
    typicalMileageLow: 0, typicalMileageHigh: 50000,
  },
  {
    id: 'tesla-model-s-yoke-return-spring',
    make: 'Tesla', model: 'Model S', years: range(2021, 2024),
    trims: ['Long Range', 'Plaid'],
    engines: ['Dual Motor', 'Tri-Motor'],
    category: 'steering',
    title: 'Model S/X Refresh Yoke Steering Return Spring Failure',
    description: 'The 2021+ refresh Model S and X yoke steering wheel has a return spring that can fail, causing the steering wheel to feel notchy or off-center when returning to center after a turn. Some owners report a clicking sound. Round-wheel retrofit became a $700 option around 2022-2023 — many owners chose to switch.',
    solution: 'Tesla service can replace yoke under warranty ($0). Out-of-warranty yoke replacement ~$1,000-$1,500. Round-wheel retrofit is the popular fix at $700 + install. Round wheel option made standard from 2024.',
    severity: 'low', confidence: 'medium',
    symptoms: ['notchy steering return', 'clicking from steering', 'off-center wheel'],
    affectedSystems: ['steering wheel', 'yoke'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 1500,
    typicalMileageLow: 10000, typicalMileageHigh: 60000,
  },
];

async function main() {
  console.log(`\n  Tesla — inserting ${ISSUES.length} drafts as pending_review\n`);
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
