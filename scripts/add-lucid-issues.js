#!/usr/bin/env node
/**
 * Add Lucid known issues via audit-before-publish gate.
 * Lucid Air (2021+) and Gravity (2024+) — small lineup, premium price,
 * mostly NHTSA-recall-documented issues + early-production quality.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'lucid-air-hv-harness-recall',
    make: 'Lucid', model: 'Air', years: range(2022, 2022),
    trims: ['Dream Edition', 'Grand Touring'],
    engines: ['Dual Motor'],
    category: 'safety',
    title: 'Lucid Air High-Voltage Coolant Heater Harness Recall (22V-746)',
    description: 'NHTSA recall 22V-746 covered Lucid Air vehicles for a high-voltage coolant heater wiring harness that could disconnect, causing loss of cabin heat and HV battery preconditioning, and in some cases triggering a no-drive condition. Affected ~1,117 early Dream Edition and Grand Touring units.',
    solution: 'Free recall remedy at Lucid service center — harness inspection + secure reattachment. Confirm VIN against 22V-746. If you experience sudden loss of cabin heat, do not delay scheduling service.',
    severity: 'high', confidence: 'high',
    symptoms: ['no heat', 'no drive', 'HV battery cold', 'preconditioning fails'],
    affectedSystems: ['HV coolant heater', 'wiring harness'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 40000,
  },
  {
    id: 'lucid-air-infotainment-freezes',
    make: 'Lucid', model: 'Air', years: range(2021, 2024),
    trims: ['Pure', 'Touring', 'Grand Touring', 'Grand Touring Performance', 'Dream Edition'],
    engines: ['all'],
    category: 'electrical',
    title: 'Air Infotainment / Center Display Freezes (Early Production)',
    description: 'Early-production (2021-2023) Lucid Air infotainment system reports frequent freezing, slow boot times, glitches with CarPlay (since added via update), and unresponsive Pilot Panel (smaller lower screen used as touch HVAC + camera control). Multiple OTA updates have improved but pattern persists in some VINs.',
    solution: 'Hard reset: hold both scroll wheels on steering wheel until reboot. Stay current on OTA updates. Severe cases require service center compute-stack replacement under warranty.',
    severity: 'medium', confidence: 'high',
    symptoms: ['screen freeze', 'slow boot', 'Pilot Panel unresponsive', 'CarPlay drops'],
    affectedSystems: ['infotainment', 'Pilot Panel', 'compute platform'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 60000,
  },
  {
    id: 'lucid-air-12v-drain',
    make: 'Lucid', model: 'Air', years: range(2021, 2024),
    trims: ['Pure', 'Touring', 'Grand Touring', 'Dream Edition'],
    engines: ['all'],
    category: 'electrical',
    title: 'Air 12V Auxiliary Battery Drain (Sentry-Like Modes Enabled)',
    description: 'Lucid Air drains the 12V auxiliary battery during long parking, especially when Surveillance Mode or remote-access features are active. Pattern consistent with other premium EVs. Software updates have reduced parasitic draw but the issue persists for some owners.',
    solution: 'Disable Surveillance Mode for parking stretches over 1 week. Update to latest software. Use a 12V battery maintainer if storing more than 2 weeks. AGM 12V replacement under warranty for documented failures; out-of-warranty ~$300-$500 at Lucid service center.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['will not wake', 'dead 12V', 'Surveillance Mode fault'],
    affectedSystems: ['12V battery', 'BCM'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'lucid-air-paint-quality-early-production',
    make: 'Lucid', model: 'Air', years: range(2021, 2023),
    trims: ['Dream Edition', 'Grand Touring', 'Touring'],
    engines: ['all'],
    category: 'body',
    title: 'Air Paint Quality / Orange-Peel + Inclusions (Early Production)',
    description: 'Early Lucid Air (2021-2022, particularly Dream Edition cars built at the Casa Grande, AZ AMP-1 ramp) reports paint orange-peel, dust inclusions, and color match issues across panels. Manufacturing quality improved across 2023; severe cases were repainted under warranty.',
    solution: 'Document with photos at delivery and during the first 90 days of ownership. Lucid customer service has approved goodwill repaints for documented quality issues. PPF on at-risk areas can prevent further damage but won\'t fix existing flaws.',
    severity: 'low', confidence: 'medium',
    symptoms: ['orange peel paint', 'paint inclusions', 'color mismatch', 'fish-eye'],
    affectedSystems: ['paint', 'body'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 5000,
    typicalMileageLow: 0, typicalMileageHigh: 30000,
  },
  {
    id: 'lucid-air-heat-pump-fault',
    make: 'Lucid', model: 'Air', years: range(2022, 2024),
    trims: ['Pure', 'Touring', 'Grand Touring', 'Grand Touring Performance'],
    engines: ['all'],
    category: 'hvac',
    title: 'Air Heat Pump Fault Codes (Cold Weather)',
    description: 'Lucid Air heat pump-based HVAC system reports cold-weather faults in some 2022-2024 vehicles — symptoms include reduced or no cabin heat in temperatures below freezing, longer charge-port preconditioning, and reduced overall range in cold. Software updates have improved cold-weather behavior but hardware-level faults occur in some units.',
    solution: 'Update to latest software. Pre-condition cabin and battery via app before driving in cold. Hardware faults (refrigerant leak, compressor failure) covered under bumper-to-bumper warranty — schedule Lucid service inspection.',
    severity: 'medium', confidence: 'low',
    symptoms: ['no heat', 'reduced heat', 'longer preconditioning', 'cold-weather range loss'],
    affectedSystems: ['heat pump', 'HVAC', 'thermal management'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 50000,
  },
  {
    id: 'lucid-air-rear-motor-mount',
    make: 'Lucid', model: 'Air', years: range(2021, 2023),
    trims: ['Dream Edition', 'Grand Touring', 'Grand Touring Performance'],
    engines: ['Dual Motor'],
    category: 'drivetrain',
    title: 'Air Rear Drive Unit Mount / Bushing Wear (Early Production)',
    description: 'Some early Lucid Air owners report a clunk or thud from the rear of the vehicle during acceleration off-throttle and engagement of regen braking. Often traced to rear drive unit mount or subframe bushing tolerance issues. Lucid has issued service bulletins addressing several variants of the symptom.',
    solution: 'Document the clunk with phone audio and schedule a Lucid service appointment — repairs covered under powertrain warranty (8 yr / 100,000 mi). Out-of-warranty mount/bushing replacement likely $400-$900.',
    severity: 'low', confidence: 'medium',
    symptoms: ['rear clunk on off-throttle', 'regen engagement thud', 'driveline clunk'],
    affectedSystems: ['drive unit mount', 'subframe', 'bushings'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 900,
    typicalMileageLow: 5000, typicalMileageHigh: 60000,
  },
  {
    id: 'lucid-air-panoramic-roof',
    make: 'Lucid', model: 'Air', years: range(2021, 2024),
    trims: ['Dream Edition', 'Grand Touring', 'Touring', 'Pure'],
    engines: ['all'],
    category: 'body',
    title: 'Air Panoramic Glass Roof Wind Noise / Seal Issues',
    description: 'Lucid Air owners report wind noise and occasional water ingress at the panoramic glass roof seal — pattern in early production but present across years. The single-piece glass roof creates a tight tolerance challenge that some VINs ship outside of spec.',
    solution: 'Schedule Lucid service to inspect/adjust seal — adjustment or seal replacement covered under warranty. Severe water ingress (interior wetness) is a higher priority and may need full re-seal ($300-$600 out-of-warranty).',
    severity: 'low', confidence: 'low',
    symptoms: ['wind noise from roof', 'water ingress', 'roof seal failure'],
    affectedSystems: ['panoramic roof', 'seals'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 600,
    typicalMileageLow: 5000, typicalMileageHigh: 80000,
  },
  {
    id: 'lucid-air-charging-led-indicator',
    make: 'Lucid', model: 'Air', years: range(2021, 2024),
    trims: ['all'],
    engines: ['all'],
    category: 'electrical',
    title: 'Air Charge Port LED Indicator Faults',
    description: 'Lucid Air charge-port LED ring (which displays charging state via color) can fail to display correctly — sometimes showing wrong color, flickering, or going dark while still actively charging. Cosmetic-only in most cases (charging still works), but confusing for owners trying to verify session state.',
    solution: 'Soft fix: power-cycle the charging session (unplug + replug). Hardware fix: charge port assembly module replacement under warranty. Out-of-warranty estimate $250-$500.',
    severity: 'low', confidence: 'medium',
    symptoms: ['wrong charge LED color', 'flickering LED', 'no charge indicator'],
    affectedSystems: ['charge port', 'LED indicator'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
];

async function main() {
  console.log(`\n  Lucid — inserting ${ISSUES.length} drafts as pending_review\n`);
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
