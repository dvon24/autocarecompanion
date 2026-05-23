#!/usr/bin/env node
/**
 * Add Rivian known issues via audit-before-publish gate.
 * Rivian is recent enough (2021+) that NHTSA recall history is the
 * cleanest data source — plus established forum corpus (RivianForums,
 * Reddit r/Rivian).
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'rivian-r1t-r1s-front-drive-unit-failure',
    make: 'Rivian', model: 'R1T', years: range(2022, 2024),
    trims: ['Adventure', 'Adventure Max', 'Launch Edition', 'Quad-Motor'],
    engines: ['Quad-Motor'],
    category: 'drivetrain',
    title: 'R1T / R1S Quad-Motor Front Drive Unit Failures',
    description: 'Early-production Quad-Motor R1T and R1S (2022-2023) have documented front drive unit failures — typically presenting as a grinding/whining noise, vehicle warnings about drive system, or sudden loss of front-axle drive. Rivian has replaced many under warranty; reports cluster around 20,000-40,000 miles. Quad-Motor architecture (separate motors per wheel) means a single DU failure leaves three working motors but with warning lights.',
    solution: 'Rivian warranty replacement is the standard fix (8 yr / 175,000 mi powertrain). Document any noise or warning promptly. Out-of-warranty drive unit replacement is dealer-only and likely $4,000-$8,000 per unit.',
    severity: 'high', confidence: 'medium',
    symptoms: ['grinding noise', 'drive system warning', 'loss of front drive', 'whining'],
    affectedSystems: ['drive unit', 'front motors'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 8000,
    typicalMileageLow: 20000, typicalMileageHigh: 80000,
  },
  {
    id: 'rivian-r1t-frunk-finger-pinch-recall',
    make: 'Rivian', model: 'R1T', years: range(2021, 2022),
    trims: ['Launch Edition', 'Adventure', 'Explore'],
    engines: ['Quad-Motor', 'Dual-Motor'],
    category: 'safety',
    title: 'R1T Frunk Auto-Close Finger Pinch Recall (22V-176)',
    description: 'Rivian recalled approximately 502 early R1T vehicles in 2022 (NHTSA recall 22V-176) for a frunk (front trunk) auto-close issue — the powered frunk could close on fingers without obstacle detection working correctly. Software remedy. Limited to early-build VINs.',
    solution: 'Software update via OTA was the remedy. Confirm VIN against recall 22V-176. If not applied, schedule Rivian service center visit (free).',
    severity: 'high', confidence: 'high',
    symptoms: ['frunk closes on fingers', 'obstacle detection fails'],
    affectedSystems: ['frunk', 'auto-close'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 50000,
  },
  {
    id: 'rivian-r1t-r1s-seatbelt-anchor-recall',
    make: 'Rivian', model: 'R1T', years: range(2022, 2022),
    trims: ['Adventure', 'Explore', 'Launch Edition'],
    engines: ['Quad-Motor', 'Dual-Motor'],
    category: 'safety',
    title: 'R1T / R1S Front Seatbelt Anchor Recall (22V-738)',
    description: 'NHTSA recall 22V-738 covered approximately 13,000 R1T and R1S vehicles for a front seatbelt anchor that may not be properly fastened to the seat structure — could detach in a crash. Tesla-style assembly issue. Recall remedy is inspection + replacement as needed.',
    solution: 'Free recall remedy at Rivian service center (or mobile service). Check VIN against 22V-738. Inspect-and-replace process takes ~1 hour.',
    severity: 'critical', confidence: 'high',
    symptoms: ['loose seatbelt anchor', 'safety recall'],
    affectedSystems: ['seatbelt'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 50000,
  },
  {
    id: 'rivian-r1t-r1s-12v-drain',
    make: 'Rivian', model: 'R1T', years: range(2022, 2024),
    trims: ['Adventure', 'Adventure Max', 'Quad-Motor', 'Dual-Motor Standard'],
    engines: ['Quad-Motor', 'Dual-Motor'],
    category: 'electrical',
    title: 'R1T / R1S 12V Auxiliary Battery Drain (Gear Guard, Cellular Modem)',
    description: 'R1T and R1S report 12V drain after long parking — particularly with Gear Guard (cabin/exterior camera surveillance) enabled, which keeps cellular modem and cameras active. Owners report dead 12V in 7-14 days without Gear Guard, faster with it. Multiple OTA updates have improved parasitic draw but not eliminated.',
    solution: 'Update to latest software. Disable Gear Guard for long parking. Use a 12V battery maintainer for storage stretches over 2 weeks. AGM 12V replacement under warranty for early failures; out-of-warranty ~$250-$400.',
    severity: 'medium', confidence: 'high',
    symptoms: ['dead 12V', 'will not wake', 'Gear Guard fault'],
    affectedSystems: ['12V battery', 'Gear Guard', 'cellular modem'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 400,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'rivian-charge-port-motor-failure',
    make: 'Rivian', model: 'R1T', years: range(2022, 2024),
    trims: ['Adventure', 'Adventure Max', 'Quad-Motor', 'Dual-Motor Standard'],
    engines: ['all'],
    category: 'electrical',
    title: 'R1T / R1S Charge Port Motor / Door Failure',
    description: 'Multiple owner reports of the charge port door motor failing — door refuses to open via app/touchscreen/button, sometimes stuck open after charge session. Cold weather amplifies failure rate. Rivian replaces under warranty; some early VINs received recall for related door-latch behavior.',
    solution: 'Service center charge port assembly replacement under warranty. Out-of-warranty $400-$700. Owners can sometimes manually push the door (gently) to free a stuck door — emergency release procedure in owner\'s manual.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['charge port wont open', 'charge port stuck', 'door motor fail'],
    affectedSystems: ['charge port', 'door motor'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 700,
    typicalMileageLow: 5000, typicalMileageHigh: 60000,
  },
  {
    id: 'rivian-r1t-r1s-infotainment-freezes',
    make: 'Rivian', model: 'R1T', years: range(2022, 2024),
    trims: ['Adventure', 'Adventure Max', 'Launch Edition'],
    engines: ['all'],
    category: 'electrical',
    title: 'R1T / R1S Infotainment Freezes + Black-Screen Reboots',
    description: 'R1T and R1S center display and driver display can freeze, reboot mid-drive, or go black entirely — particularly during cellular handoffs (entering/leaving tunnel), after wake from sleep, or during OTA installation. Loss of driver display means losing speed/range readout in motion (workaround: use HUD if equipped or phone). Multiple OTA releases have improved but not eliminated.',
    solution: 'Hard reset: hold both scroll wheels on steering wheel 10+ seconds. Severe cases require service center module replacement. Stay on latest software (OTA). Some owners disable Gear Guard to reduce modem-related reboots.',
    severity: 'medium', confidence: 'high',
    symptoms: ['screen freeze', 'screen reboot', 'black screen', 'no speedometer'],
    affectedSystems: ['infotainment', 'driver display', 'compute platform'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 100000,
  },
  {
    id: 'rivian-r1t-control-arm-corrosion',
    make: 'Rivian', model: 'R1T', years: range(2022, 2023),
    trims: ['Adventure', 'Launch Edition'],
    engines: ['Quad-Motor', 'Dual-Motor'],
    category: 'suspension',
    title: 'Early R1T Upper Control Arm Corrosion (Salt-Belt)',
    description: 'Early R1T owners in salt-belt regions (US Northeast/Midwest, Canada) report surprising rapid surface corrosion on the upper control arms — bare metal exposed at welds, bushings showing rust through finish. Rivian made running production changes around mid-2023. Affected cars eligible for inspection.',
    solution: 'Schedule Rivian service inspection — many cars have been replaced under warranty for early-onset corrosion. Annual underbody wash strongly recommended. Aftermarket undercoating shops can treat at owner expense ($400-$800).',
    severity: 'medium', confidence: 'medium',
    symptoms: ['visible rust on control arms', 'corrosion at welds'],
    affectedSystems: ['suspension', 'control arms'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 1500,
    typicalMileageLow: 5000, typicalMileageHigh: 50000,
  },
  {
    id: 'rivian-r1s-third-row-creaks',
    make: 'Rivian', model: 'R1S', years: range(2022, 2024),
    trims: ['Adventure', 'Adventure Max', 'Launch Edition'],
    engines: ['Quad-Motor', 'Dual-Motor'],
    category: 'interior',
    title: 'R1S Third-Row Creaks / Folding Mechanism Issues',
    description: 'R1S third-row seats commonly creak and squeak over bumps, with some owners reporting the powered folding mechanism getting stuck mid-deploy. Plastic-on-plastic and metal-on-plastic contact points are usually the source. Rivian has applied service bulletins addressing common creak points.',
    solution: 'Service center can apply TSB-recommended bushings/dampers — typically covered under warranty. Out-of-warranty repairs $150-$400. Some owners DIY with felt/foam tape at known contact points.',
    severity: 'low', confidence: 'medium',
    symptoms: ['third row creaks', 'fold stuck', 'squeaks over bumps'],
    affectedSystems: ['third row seats', 'interior'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 400,
    typicalMileageLow: 5000, typicalMileageHigh: 80000,
  },
  {
    id: 'rivian-r1t-r1s-brake-light-recall',
    make: 'Rivian', model: 'R1T', years: range(2022, 2023),
    trims: ['Adventure', 'Adventure Max', 'Launch Edition'],
    engines: ['Quad-Motor', 'Dual-Motor'],
    category: 'safety',
    title: 'R1T / R1S Brake Lights Stay On in "Bench Mode" (Recall 23V-159)',
    description: 'NHTSA recall 23V-159 covered ~12,700 R1T and R1S vehicles for a software issue where the brake lights could stay illuminated when the vehicle is in "Conserve" mode or after exiting "Wade" mode. Misleading to following drivers and arguably a violation of FMVSS 108. Software fix via OTA.',
    solution: 'OTA update applies the fix automatically. Confirm via VIN against 23V-159. If older software, schedule connection to Wi-Fi at home for OTA download.',
    severity: 'medium', confidence: 'high',
    symptoms: ['brake lights stuck on', 'misleading brake light'],
    affectedSystems: ['brake lights', 'software'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 50000,
  },
];

async function main() {
  console.log(`\n  Rivian — inserting ${ISSUES.length} drafts as pending_review\n`);
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
